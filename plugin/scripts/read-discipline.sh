#!/usr/bin/env bash
# ============================================================================
# read-discipline.sh — VIBE 5.4 PreToolUse hook on Read
# ----------------------------------------------------------------------------
# Blocks partial reads (limit/offset) on files < 400 KB when there is no
# explicit user region override in the transcript.
#
# Env:
#   VIBE_READ_DISCIPLINE_DISABLED=1   bypass entirely
#
# Exit:
#   0 always — block signal travels via stdout JSON (PreToolUse modern
#   contract: hookSpecificOutput.permissionDecision="deny" with reason).
#   Legacy exit 2 + stderr was losing reason text to CC's "No stderr
#   output" fallback when buffering/race conditions swallowed stderr.
# ============================================================================

set -uo pipefail

# --- Escape hatch ---------------------------------------------------------
if [[ "${VIBE_READ_DISCIPLINE_DISABLED:-0}" == "1" ]]; then
    exit 0
fi

# --- Parse input ---------------------------------------------------------
INPUT=$(cat)

TOOL=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")
if [[ "$TOOL" != "Read" ]]; then
    exit 0
fi

FILE=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")
LIMIT=$(printf '%s' "$INPUT" | python3 -c "import json,sys; v=json.load(sys.stdin).get('tool_input',{}).get('limit'); print(v if v is not None else '')" 2>/dev/null || echo "")
OFFSET=$(printf '%s' "$INPUT" | python3 -c "import json,sys; v=json.load(sys.stdin).get('tool_input',{}).get('offset'); print(v if v is not None else '')" 2>/dev/null || echo "")

# Full reads are always allowed
if [[ -z "$LIMIT" && -z "$OFFSET" ]]; then
    exit 0
fi

# Non-existent file — let the tool fail naturally
if [[ -z "$FILE" ]] || [[ ! -f "$FILE" ]]; then
    exit 0
fi

# --- Size check (byte-based, 400 KB threshold) ----------------------------
THRESHOLD_BYTES=$((400 * 1024))
if SIZE=$(stat -c%s "$FILE" 2>/dev/null); then :; else SIZE=$(stat -f%z "$FILE" 2>/dev/null || echo 0); fi

if [[ "$SIZE" -ge "$THRESHOLD_BYTES" ]]; then
    exit 0
fi

# --- Transcript override check --------------------------------------------
TRANSCRIPT_PATH=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null || echo "")

OVERRIDE="no"
if [[ -n "$TRANSCRIPT_PATH" && -f "$TRANSCRIPT_PATH" ]]; then
    OVERRIDE=$(FILE_ARG="$FILE" TRANSCRIPT_ARG="$TRANSCRIPT_PATH" python3 <<'PYEOF'
import json, os, re
file_path = os.environ["FILE_ARG"]
transcript = os.environ["TRANSCRIPT_ARG"]
base = os.path.basename(file_path)
region_kw = re.compile(r"\b(line|lines|righe|offset|from line|between lines|range|rows)\b", re.IGNORECASE)
try:
    with open(transcript) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                msg = json.loads(line)
            except Exception:
                continue
            if msg.get("type") != "user":
                continue
            content = msg.get("message", {}).get("content", "")
            if isinstance(content, list):
                content = " ".join(str(b.get("text","")) for b in content if isinstance(b, dict))
            content = str(content)
            if (file_path in content or base in content) and region_kw.search(content):
                print("yes")
                raise SystemExit
    print("no")
except SystemExit:
    pass
except Exception:
    print("no")
PYEOF
)
fi

if [[ "$OVERRIDE" == "yes" ]]; then
    exit 0
fi

# --- Log event -----------------------------------------------------------
LOG_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe-vibe-framework}"
mkdir -p "$LOG_DIR" 2>/dev/null || true
LOG_FILE="$LOG_DIR/read-discipline-events.jsonl"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
printf '{"ts":"%s","file":"%s","size":%s,"limit":"%s","offset":"%s","blocked":true}\n' \
    "$TS" "$FILE" "$SIZE" "$LIMIT" "$OFFSET" >> "$LOG_FILE" 2>/dev/null || true

# --- Block via PreToolUse modern contract (stdout JSON + exit 0) ---------
REASON="Read-discipline: partial read (limit=${LIMIT:-∅} offset=${OFFSET:-∅}) on file smaller than 400 KB (${SIZE} bytes). Read the file fully. Set VIBE_READ_DISCIPLINE_DISABLED=1 to bypass, or request a specific region explicitly in your prompt (mention 'lines N-M')."

if [[ "${VIBE_READ_DISCIPLINE_ADVISORY:-0}" == "1" ]]; then
    # Advisory: log already written above; do not block.
    exit 0
fi

REASON="$REASON" python3 <<'PYEOF'
import json, os
print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": os.environ["REASON"],
    }
}))
PYEOF
exit 0

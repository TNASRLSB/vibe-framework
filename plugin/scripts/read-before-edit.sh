#!/usr/bin/env bash
# ============================================================================
# read-before-edit.sh — VIBE 5.4 PreToolUse hook on Edit / Write
# ----------------------------------------------------------------------------
# Blocks Edit/Write when the target file exists but has not been fully Read
# (no limit/offset, or coverage equals file) in the current transcript.
#
# Env:
#   VIBE_READ_BEFORE_EDIT_DISABLED=1  bypass entirely
#
# Exit:
#   0 always — block signal travels via stdout JSON (PreToolUse modern
#   contract: hookSpecificOutput.permissionDecision="deny" with reason).
#   Legacy exit 2 + stderr was losing reason text to CC's "No stderr
#   output" fallback when buffering/race conditions swallowed stderr.
# ============================================================================

set -uo pipefail

if [[ "${VIBE_READ_BEFORE_EDIT_DISABLED:-0}" == "1" ]]; then
    exit 0
fi

INPUT=$(cat)

TOOL=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")
if [[ "$TOOL" != "Edit" && "$TOOL" != "Write" ]]; then
    exit 0
fi

FILE=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")
TRANSCRIPT_PATH=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null || echo "")

if [[ -z "$FILE" ]]; then
    exit 0
fi

# Write on non-existing file is legitimate (creating a new file)
if [[ "$TOOL" == "Write" && ! -f "$FILE" ]]; then
    exit 0
fi

# --- Transcript scan for full Read of target ------------------------------
if [[ -z "$TRANSCRIPT_PATH" || ! -f "$TRANSCRIPT_PATH" ]]; then
    # No transcript available; be conservative and allow (should not happen in CC)
    exit 0
fi

FULL_READ=$(FILE_ARG="$FILE" TRANSCRIPT_ARG="$TRANSCRIPT_PATH" python3 <<'PYEOF'
import json, os

file_path = os.environ["FILE_ARG"]
transcript = os.environ["TRANSCRIPT_ARG"]

def norm(p):
    if not p:
        return ""
    try:
        return os.path.realpath(os.path.expanduser(p))
    except Exception:
        return p

target = norm(file_path)
target_line_count = None

def file_lines():
    global target_line_count
    if target_line_count is None:
        try:
            with open(target, errors="ignore") as rf:
                target_line_count = sum(1 for _ in rf)
        except Exception:
            target_line_count = -1
    return target_line_count

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
            if msg.get("type") != "assistant":
                continue
            content = msg.get("message", {}).get("content", [])
            if not isinstance(content, list):
                continue
            for block in content:
                if not isinstance(block, dict):
                    continue
                if block.get("type") != "tool_use":
                    continue
                name = block.get("name")
                if name not in ("Read", "Write"):
                    continue
                inp = block.get("input", {}) or {}
                if norm(inp.get("file_path")) != target:
                    continue
                if name == "Write":
                    # Write implies the assistant has just authored the exact
                    # content; Edit on the same file is safe without a prior Read.
                    print("yes")
                    raise SystemExit
                limit = inp.get("limit")
                offset = inp.get("offset")
                if not limit and not offset:
                    print("yes")
                    raise SystemExit
                if offset in (None, 0) and isinstance(limit, int) and limit > 0:
                    lc = file_lines()
                    if lc >= 0 and limit >= lc:
                        print("yes")
                        raise SystemExit
    print("no")
except SystemExit:
    pass
except Exception:
    print("no")
PYEOF
)

if [[ "$FULL_READ" == "yes" ]]; then
    exit 0
fi

# --- Block via PreToolUse modern contract (stdout JSON + exit 0) ---------
REASON="Read-before-edit: about to ${TOOL} ${FILE} but the file has not been fully Read in this transcript. Run Read with no limit/offset first. Set VIBE_READ_BEFORE_EDIT_DISABLED=1 to bypass."

if [[ "${VIBE_READ_BEFORE_EDIT_ADVISORY:-0}" == "1" ]]; then
    # Advisory: surface the reason on stderr for visibility, don't block.
    echo "ADVISORY — $REASON" >&2
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

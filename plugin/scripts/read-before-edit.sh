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
#   0  allow
#   2  block
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
                if block.get("type") == "tool_use" and block.get("name") == "Read":
                    inp = block.get("input", {}) or {}
                    if inp.get("file_path") == file_path:
                        if not inp.get("limit") and not inp.get("offset"):
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

# --- Block ---------------------------------------------------------------
REASON="Read-before-edit: about to ${TOOL} ${FILE} but the file has not been fully Read in this transcript. Run Read with no limit/offset first. Set VIBE_READ_BEFORE_EDIT_DISABLED=1 to bypass."
python3 -c "
import json, sys
sys.stderr.write(json.dumps({'reason': '''$REASON''', 'continue': False}) + '\n')
"
if [[ "${VIBE_READ_BEFORE_EDIT_ADVISORY:-0}" == "1" ]]; then
    # Advisory: tell stderr what would have blocked but let the tool run.
    python3 -c "
import json, sys
sys.stderr.write(json.dumps({'reason': '''ADVISORY — $REASON''', 'continue': True}) + '\n')
"
    exit 0
fi
exit 2

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

# --- TODO next task: transcript scan, full-read detection, block ----------
exit 0

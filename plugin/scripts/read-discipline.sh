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
#   0  allow
#   2  block (emits JSON {"reason": "...", "continue": false} on stderr)
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

# --- TODO next task: transcript override, log, block -----------------------
exit 0

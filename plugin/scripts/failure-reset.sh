#!/usr/bin/env bash
# Hook: PostToolUse (all tools)
# Resets the consecutive failure counter on successful tool use.
# Always exits 0.

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Check pause flag
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Reset counter file
COUNTER_FILE="/tmp/vibe-failures-${SESSION_ID:-unknown}"
if [[ -f "$COUNTER_FILE" ]]; then
  echo "0" > "$COUNTER_FILE"
fi

exit 0

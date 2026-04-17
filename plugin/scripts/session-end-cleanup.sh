#!/usr/bin/env bash
# Hook: SessionEnd
# Removes session-scoped /tmp state (pause flags, failure counters).
# Always exits 0.

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

LOG_DIR="${CLAUDE_PLUGIN_DATA:-${HOME}/.claude/plugins/data/vibe-vibe-framework}/sessions"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/cleanup.log"

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

if [[ -z "$SESSION_ID" ]]; then
  echo "$(timestamp) [session-end-cleanup] WARNING: no session_id in input; skipping" >> "$LOG_FILE"
  exit 0
fi

# Remove pause flag
PAUSE_FLAG="/tmp/vibe-paused-${SESSION_ID}"
if [[ -f "$PAUSE_FLAG" ]]; then
  rm -f "$PAUSE_FLAG"
  echo "$(timestamp) [session-end-cleanup] removed pause flag: $PAUSE_FLAG" >> "$LOG_FILE"
fi

# Remove failure counter
COUNTER_FILE="/tmp/vibe-failures-${SESSION_ID}"
if [[ -f "$COUNTER_FILE" ]]; then
  rm -f "$COUNTER_FILE"
  echo "$(timestamp) [session-end-cleanup] removed failure counter: $COUNTER_FILE" >> "$LOG_FILE"
fi

echo "$(timestamp) [session-end-cleanup] session ${SESSION_ID} cleanup complete" >> "$LOG_FILE"

exit 0

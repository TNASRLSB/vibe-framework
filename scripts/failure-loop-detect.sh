#!/usr/bin/env bash
# Hook: PostToolUseFailure (Bash|Edit|Write)
# Tracks consecutive failures and blocks after 3 to force replanning.
# Exit 0 = under threshold, Exit 2 = 3+ failures (blocks with replan message).

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Check pause flag
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Counter file keyed by session
COUNTER_FILE="/tmp/vibe-failures-${SESSION_ID:-unknown}"

# Read current count
CURRENT=0
if [[ -f "$COUNTER_FILE" ]]; then
  CURRENT=$(cat "$COUNTER_FILE" 2>/dev/null || echo 0)
  # Ensure it's a number
  if ! [[ "$CURRENT" =~ ^[0-9]+$ ]]; then
    CURRENT=0
  fi
fi

# Increment
NEXT=$((CURRENT + 1))
echo "$NEXT" > "$COUNTER_FILE"

# Check threshold
if (( NEXT >= 3 )); then
  cat >&2 << 'STOPMSG'
STOP — 3 consecutive failures detected.

Do not continue with the same approach. You must:
1. STOP what you are doing immediately
2. Analyze what is failing and why
3. Create a new plan from scratch
4. Consider using /emmet test to run diagnostics
5. If stuck, read .claude/docs/workflows.md for debugging patterns

The failure counter will reset on your next successful tool use.
STOPMSG
  exit 2
fi

exit 0

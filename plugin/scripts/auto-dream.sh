#!/usr/bin/env bash
# Hook: SessionStart
# Auto Dream: consolidates learnings after N sessions.
# Checks if consolidation is needed, outputs guidance for the model.
# Always exits 0.

set -uo pipefail

INPUT=$(cat)

DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
DREAM_DIR="${DATA_DIR}/dream"
QUEUE_FILE="${DATA_DIR}/learnings/queue.jsonl"
DREAM_STATE="${DREAM_DIR}/state.json"
DREAM_LOG="${DREAM_DIR}/consolidation-log.jsonl"

mkdir -p "$DREAM_DIR"

# Configuration
MIN_SESSIONS=5
MIN_HOURS=24
MIN_CORRECTIONS=3

# Initialize state if missing
if [[ ! -f "$DREAM_STATE" ]]; then
  jq -nc '{lastConsolidation: "1970-01-01T00:00:00Z", sessionsSince: 0, totalConsolidations: 0}' > "$DREAM_STATE"
fi

# Increment session counter
CURRENT_STATE=$(cat "$DREAM_STATE")
SESSIONS_SINCE=$(echo "$CURRENT_STATE" | jq -r '.sessionsSince // 0')
SESSIONS_SINCE=$((SESSIONS_SINCE + 1))
echo "$CURRENT_STATE" | jq --argjson s "$SESSIONS_SINCE" '.sessionsSince = $s' > "$DREAM_STATE"

# Check time gate
LAST_CONSOLIDATION=$(echo "$CURRENT_STATE" | jq -r '.lastConsolidation // "1970-01-01T00:00:00Z"')
LAST_EPOCH=$(date -d "$LAST_CONSOLIDATION" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
HOURS_SINCE=$(( (NOW_EPOCH - LAST_EPOCH) / 3600 ))

# Check correction count
CORRECTION_COUNT=0
if [[ -f "$QUEUE_FILE" ]]; then
  CORRECTION_COUNT=$(wc -l < "$QUEUE_FILE" | tr -d ' ')
fi

# Decision: should we consolidate?
SHOULD_CONSOLIDATE=false
REASON=""

if (( SESSIONS_SINCE >= MIN_SESSIONS )) && (( HOURS_SINCE >= MIN_HOURS )) && (( CORRECTION_COUNT >= MIN_CORRECTIONS )); then
  SHOULD_CONSOLIDATE=true
  REASON="$SESSIONS_SINCE sessions, ${HOURS_SINCE}h since last, $CORRECTION_COUNT pending corrections"
fi

if [[ "$SHOULD_CONSOLIDATE" == "true" ]]; then
  # Output guidance for the model to run consolidation
  GUIDANCE=$(cat <<'DREAMEOF'
VIBE Auto Dream: Knowledge consolidation recommended.

A background consolidation is needed. When convenient (not interrupting user work), run a subagent to:
1. Read the corrections queue at ${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl
2. Group corrections by theme (testing, security, architecture, style, etc.)
3. For patterns that appear 3+ times, propose a project rule
4. Write consolidated learnings to .claude/auto-memory/learnings.md
5. Archive processed corrections (move queue.jsonl to queue.jsonl.bak)
6. Update dream state: reset sessionsSince, update lastConsolidation timestamp

This is non-blocking guidance. Proceed with the user's request first.
DREAMEOF
)

  jq -n --arg msg "$GUIDANCE" --arg reason "$REASON" '{
    hookSpecificOutput: {
      additionalContext: $msg
    }
  }'
else
  # No output needed
  echo '{}'
fi

exit 0

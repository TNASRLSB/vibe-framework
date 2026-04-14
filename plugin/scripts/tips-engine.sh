#!/usr/bin/env bash
# Hook: SessionStart
# Contextual tips system. Shows relevant tips based on session history.
# Always exits 0.

set -uo pipefail

INPUT=$(cat)

DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
TIPS_STATE="${DATA_DIR}/tips-state.json"
QUEUE_FILE="${DATA_DIR}/learnings/queue.jsonl"

mkdir -p "$DATA_DIR"

# Initialize state if missing
if [[ ! -f "$TIPS_STATE" ]]; then
  jq -nc '{sessionCount: 0, lastShown: {}, shownHistory: []}' > "$TIPS_STATE"
fi

# Increment session count
STATE=$(cat "$TIPS_STATE")
SESSION_COUNT=$(echo "$STATE" | jq -r '.sessionCount // 0')
SESSION_COUNT=$((SESSION_COUNT + 1))
STATE=$(echo "$STATE" | jq --argjson c "$SESSION_COUNT" '.sessionCount = $c')

# Count pending corrections
CORRECTION_COUNT=0
if [[ -f "$QUEUE_FILE" ]]; then
  CORRECTION_COUNT=$(wc -l < "$QUEUE_FILE" | tr -d ' ')
fi

# Check costs log
COSTS_FILE="${DATA_DIR}/costs/skill-costs.jsonl"
HAS_COSTS=false
if [[ -f "$COSTS_FILE" ]] && [[ -s "$COSTS_FILE" ]]; then
  HAS_COSTS=true
fi

# Tip selection logic
TIP=""
TIP_ID=""

# Priority 1: First session tip
if (( SESSION_COUNT == 1 )); then
  TIP_ID="welcome"
  TIP="Welcome to VIBE Framework. Run /vibe:help to see all available skills, or /vibe:setup to configure this project."
fi

# Priority 2: Pending corrections reminder (every 5 sessions if corrections exist)
if [[ -z "$TIP" ]] && (( CORRECTION_COUNT >= 3 )) && (( SESSION_COUNT % 5 == 0 )); then
  TIP_ID="reflect-reminder"
  TIP="You have ${CORRECTION_COUNT} pending corrections. Run /vibe:reflect to process them into permanent learnings."
fi

# Priority 3: Suggest audit after 10 sessions
if [[ -z "$TIP" ]] && (( SESSION_COUNT == 10 )); then
  TIP_ID="audit-suggestion"
  TIP="You've completed 10 sessions. Run /vibe:audit to get a comprehensive quality baseline for this project."
fi

# Priority 4: Cost awareness after 20 invocations
if [[ -z "$TIP" ]] && [[ "$HAS_COSTS" == "true" ]] && (( SESSION_COUNT == 20 )); then
  TIP_ID="cost-awareness"
  TIP="VIBE tracks estimated skill costs. Check ${DATA_DIR}/costs/skill-costs.jsonl to see which skills cost most."
fi

# Priority 5: Skill creation suggestion after 15 sessions
if [[ -z "$TIP" ]] && (( SESSION_COUNT == 15 )); then
  TIP_ID="forge-suggestion"
  TIP="Noticed a repeated workflow? Run /vibe:forge create to turn it into a reusable skill."
fi

# Priority 6: Rotate general tips every 10 sessions
if [[ -z "$TIP" ]] && (( SESSION_COUNT % 10 == 0 )) && (( SESSION_COUNT > 20 )); then
  GENERAL_TIPS=(
    "Use /vibe:emmet verify to confirm a code change works end-to-end before committing."
    "Use /vibe:pause during rapid prototyping to temporarily skip quality hooks."
    "Run /vibe:heimdall scan before deploying to catch security issues early."
    "Use /vibe:emmet debug for systematic debugging instead of trial-and-error."
    "Run /vibe:ghostwriter audit to check SEO and content quality across your site."
  )
  TIP_INDEX=$(( (SESSION_COUNT / 10) % ${#GENERAL_TIPS[@]} ))
  TIP="${GENERAL_TIPS[$TIP_INDEX]}"
  TIP_ID="general-${TIP_INDEX}"
fi

# Check cooldown: don't show same tip within 5 sessions
if [[ -n "$TIP_ID" ]]; then
  LAST_SHOWN=$(echo "$STATE" | jq -r --arg id "$TIP_ID" '.lastShown[$id] // 0')
  if (( SESSION_COUNT - LAST_SHOWN < 5 )) && (( LAST_SHOWN > 0 )); then
    TIP=""
    TIP_ID=""
  fi
fi

# Save state
if [[ -n "$TIP_ID" ]]; then
  STATE=$(echo "$STATE" | jq --arg id "$TIP_ID" --argjson c "$SESSION_COUNT" '.lastShown[$id] = $c')
fi
echo "$STATE" > "$TIPS_STATE"

# Output tip if selected
if [[ -n "$TIP" ]]; then
  jq -n --arg tip "Tip: $TIP" '{
    hookSpecificOutput: {
      additionalContext: $tip
    }
  }'
else
  echo '{}'
fi

exit 0

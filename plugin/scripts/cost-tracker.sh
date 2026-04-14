#!/usr/bin/env bash
# Hook: PostToolUse (SkillTool)
# Tracks estimated token usage and cost per skill invocation.
# Always exits 0 (informational only, never blocks).

set -uo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [[ "$TOOL_NAME" != "Skill" ]]; then
  exit 0
fi

SKILL_NAME=$(echo "$INPUT" | jq -r '.tool_input.skill // empty')
if [[ -z "$SKILL_NAME" ]]; then
  exit 0
fi

# Extract vibe skill name (strip "vibe:" prefix if present)
SKILL_NAME="${SKILL_NAME#vibe:}"

DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/costs"
mkdir -p "$DATA_DIR"

COSTS_FILE="${DATA_DIR}/skill-costs.jsonl"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Model cost estimates (USD per 1K tokens, input/output)
# These are approximate — actual costs depend on caching
declare -A MODEL_INPUT_COST=(
  [opus]=0.015
  [sonnet]=0.003
  [haiku]=0.001
)
declare -A MODEL_OUTPUT_COST=(
  [opus]=0.075
  [sonnet]=0.015
  [haiku]=0.005
)

# Determine model from skill definition
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
SKILL_FILE="${PLUGIN_ROOT}/skills/${SKILL_NAME}/SKILL.md"
MODEL="sonnet"
if [[ -f "$SKILL_FILE" ]]; then
  detected_model=$(sed -n '/^---$/,/^---$/p' "$SKILL_FILE" | grep '^model:' | sed 's/model:\s*//' | tr -d ' ')
  if [[ -n "$detected_model" ]]; then
    MODEL="$detected_model"
  fi
fi

# Estimate token budget from frontmatter
TOKEN_BUDGET=40000
if [[ -f "$SKILL_FILE" ]]; then
  detected_budget=$(sed -n '/^---$/,/^---$/p' "$SKILL_FILE" | grep '^maxTokenBudget:' | sed 's/maxTokenBudget:\s*//' | tr -d ' ')
  if [[ -n "$detected_budget" ]] && [[ "$detected_budget" =~ ^[0-9]+$ ]]; then
    TOKEN_BUDGET="$detected_budget"
  fi
fi

# Estimate cost (conservative: assume 30% of budget used on average)
ESTIMATED_TOKENS=$(( TOKEN_BUDGET * 30 / 100 ))
INPUT_COST=${MODEL_INPUT_COST[$MODEL]:-0.003}
OUTPUT_COST=${MODEL_OUTPUT_COST[$MODEL]:-0.015}
# Rough split: 70% input, 30% output
ESTIMATED_COST=$(awk "BEGIN {printf \"%.6f\", ($ESTIMATED_TOKENS * 0.7 * $INPUT_COST + $ESTIMATED_TOKENS * 0.3 * $OUTPUT_COST) / 1000}" 2>/dev/null || echo "0.000000")

# Append to log
jq -nc \
  --arg ts "$TIMESTAMP" \
  --arg skill "$SKILL_NAME" \
  --arg model "$MODEL" \
  --arg budget "$TOKEN_BUDGET" \
  --arg est_tokens "$ESTIMATED_TOKENS" \
  --arg est_cost "$ESTIMATED_COST" \
  --arg session "$SESSION_ID" \
  '{timestamp:$ts,skill:$skill,model:$model,tokenBudget:($budget|tonumber),estimatedTokens:($est_tokens|tonumber),estimatedCostUSD:$est_cost,session:$session}' \
  >> "$COSTS_FILE" 2>/dev/null

exit 0

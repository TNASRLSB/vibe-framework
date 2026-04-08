#!/usr/bin/env bash
# Run a single task on Claude Code.
# Usage: ./run-claude.sh <task_id> <condition>
# Output: research/experiment/data/claude/<condition>/task-<id>.json
set -euo pipefail

TASK_ID=$(printf '%02d' "$1")
CONDITION="$2"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Find task file
TASK_FILE=$(find "$ROOT_DIR/research/experiment/tasks" -name "task-${TASK_ID}.md" | head -1)
if [[ -z "$TASK_FILE" ]]; then
  echo "ERROR: task-${TASK_ID}.md not found" >&2
  exit 1
fi

# Extract prompt (between ## Prompt and ## Ground Truth)
TASK_PROMPT=$(sed -n '/^## Prompt$/,/^## /{/^## Prompt$/d;/^## /d;p}' "$TASK_FILE")

# Find codebase directory for this task
CODEBASE=$(sed -n 's/^[*]*Codebase:[*]* *`\?\([^`]*\)`\?.*/\1/p' "$TASK_FILE" | head -1)
CWD="$ROOT_DIR/${CODEBASE}"
if [[ ! -d "$CWD" ]]; then
  CWD="$ROOT_DIR/research/experiment/codebases"
fi

OUTDIR="$ROOT_DIR/research/experiment/data/claude/${CONDITION}"
mkdir -p "$OUTDIR"
OUTFILE="${OUTDIR}/task-${TASK_ID}.json"

# Build prompt based on condition
case "$CONDITION" in
  c1)
    FULL_PROMPT="$TASK_PROMPT"
    EXTRA_ENV=""
    ;;
  c2)
    PREAMBLE=$(sed "s/{{TASK_PROMPT}}//" "$ROOT_DIR/research/experiment/prompts/prompt-only.md")
    FULL_PROMPT="${PREAMBLE}

${TASK_PROMPT}"
    EXTRA_ENV=""
    ;;
  c3)
    FULL_PROMPT="$TASK_PROMPT"
    EXTRA_ENV="VIBE_INTEGRITY_MODE=strict"
    ;;
  *)
    echo "ERROR: Unknown condition $CONDITION (use c1, c2, c3)" >&2
    exit 1
    ;;
esac

echo "[$(date +%H:%M:%S)] Running: claude / ${CONDITION} / task-${TASK_ID}"

# Run Claude Code
if [[ -n "$EXTRA_ENV" ]]; then
  env $EXTRA_ENV claude -p "$FULL_PROMPT" --output-format json -y --cwd "$CWD" > "$OUTFILE" 2>&1
else
  claude -p "$FULL_PROMPT" --output-format json -y --cwd "$CWD" > "$OUTFILE" 2>&1
fi

echo "[$(date +%H:%M:%S)] Done: claude / ${CONDITION} / task-${TASK_ID} -> $OUTFILE"

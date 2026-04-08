#!/usr/bin/env bash
# Run a single task on Qwen CLI.
# Usage: ./run-qwen.sh <task_id> <condition>
# Output: research/experiment/data/qwen/<condition>/task-<id>.json
set -euo pipefail

TASK_ID=$(printf '%02d' "$1")
CONDITION="$2"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

TASK_FILE=$(find "$ROOT_DIR/research/experiment/tasks" -name "task-${TASK_ID}.md" | head -1)
if [[ -z "$TASK_FILE" ]]; then
  echo "ERROR: task-${TASK_ID}.md not found" >&2
  exit 1
fi

TASK_PROMPT=$(sed -n '/^## Prompt$/,/^## /{/^## Prompt$/d;/^## /d;p}' "$TASK_FILE")

CODEBASE=$(sed -n 's/^[*]*Codebase:[*]* *`\?\([^`]*\)`\?.*/\1/p' "$TASK_FILE" | head -1)
CWD="$ROOT_DIR/${CODEBASE}"
if [[ ! -d "$CWD" ]]; then
  CWD="$ROOT_DIR/research/experiment/codebases"
fi

OUTDIR="$ROOT_DIR/research/experiment/data/qwen/${CONDITION}"
mkdir -p "$OUTDIR"
OUTFILE="${OUTDIR}/task-${TASK_ID}.json"

# For Qwen: C3 falls back to C2 (no hook system)
case "$CONDITION" in
  c1)
    FULL_PROMPT="$TASK_PROMPT"
    ;;
  c2|c3)
    PREAMBLE=$(sed "s/{{TASK_PROMPT}}//" "$ROOT_DIR/research/experiment/prompts/prompt-only.md")
    FULL_PROMPT="${PREAMBLE}

${TASK_PROMPT}"
    ;;
  *)
    echo "ERROR: Unknown condition $CONDITION (use c1, c2, c3)" >&2
    exit 1
    ;;
esac

echo "[$(date +%H:%M:%S)] Running: qwen / ${CONDITION} / task-${TASK_ID}"
qwen -p "$FULL_PROMPT" -o json -y --cwd "$CWD" > "$OUTFILE" 2>&1
echo "[$(date +%H:%M:%S)] Done: qwen / ${CONDITION} / task-${TASK_ID} -> $OUTFILE"

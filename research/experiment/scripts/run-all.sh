#!/usr/bin/env bash
# Run all experiment combinations.
# Usage: ./run-all.sh [--model MODEL] [--condition COND] [--task TASK_ID]
# Without flags: runs all 180 combinations (20 tasks x 3 models x 3 conditions)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

MODELS=(claude qwen gemini)
CONDITIONS=(c1 c2 c3)
TASKS=$(seq 1 20)

# Simple flag parsing for partial runs
FILTER_MODEL=""
FILTER_COND=""
FILTER_TASK=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --model) FILTER_MODEL="$2"; shift 2 ;;
    --condition) FILTER_COND="$2"; shift 2 ;;
    --task) FILTER_TASK="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

TOTAL=0
FAILED=0
LOG="$ROOT_DIR/research/experiment/data/run.log"

echo "=== Experiment run started at $(date) ===" | tee "$LOG"

for model in "${MODELS[@]}"; do
  [[ -n "$FILTER_MODEL" && "$model" != "$FILTER_MODEL" ]] && continue
  for cond in "${CONDITIONS[@]}"; do
    [[ -n "$FILTER_COND" && "$cond" != "$FILTER_COND" ]] && continue
    for task in $TASKS; do
      [[ -n "$FILTER_TASK" && "$task" != "$FILTER_TASK" ]] && continue
      TASK_ID=$(printf '%02d' "$task")
      TOTAL=$((TOTAL + 1))
      echo "--- ${model} / ${cond} / task-${TASK_ID} ---" | tee -a "$LOG"
      if "${SCRIPT_DIR}/run-${model}.sh" "$task" "$cond" 2>&1 | tee -a "$LOG"; then
        echo "OK" | tee -a "$LOG"
      else
        FAILED=$((FAILED + 1))
        echo "FAILED" | tee -a "$LOG"
      fi
    done
  done
done

echo "=== Complete: $((TOTAL - FAILED))/$TOTAL succeeded, $FAILED failed ===" | tee -a "$LOG"

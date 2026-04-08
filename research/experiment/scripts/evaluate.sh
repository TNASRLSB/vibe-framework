#!/usr/bin/env bash
# Score experiment results against ground truth.
# Usage: ./evaluate.sh
# Output: research/experiment/results/raw-scores.csv
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RESULTS_DIR="$ROOT_DIR/research/experiment/results"
mkdir -p "$RESULTS_DIR"

CSV="$RESULTS_DIR/raw-scores.csv"
echo "task_id,model,condition,completeness,false_completion,items_found,items_partial,items_missing,items_fabricated,tool_calls" > "$CSV"

echo "Evaluation template created at: $CSV"
echo ""
echo "Manual scoring required. For each result file in research/experiment/data/:"
echo "  1. Read the model output"
echo "  2. Compare against ground truth in the task definition"
echo "  3. Score each item: FOUND / PARTIAL / MISSING / FABRICATED"
echo "  4. Add a row to $CSV"
echo ""
echo "Tip: use run-all.sh --model claude --condition c1 --task 1 for pilot runs"

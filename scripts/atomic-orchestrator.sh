#!/usr/bin/env bash
# Atomic Decomposition Orchestrator
# Reads a manifest.json, dispatches one CLI session per item,
# assembles results mechanically.
#
# Usage: ./atomic-orchestrator.sh <manifest.json> [--model claude|qwen|gemini] [--batch-size N]
#
# Exit codes:
#   0 = all items processed
#   1 = some items failed
#   2 = invalid manifest
set -uo pipefail

MANIFEST="$1"
shift || true

# Parse flags
MODEL_NAME="claude"
CONCURRENCY=3
while [[ $# -gt 0 ]]; do
  case "$1" in
    --model) MODEL_NAME="$2"; shift 2 ;;
    --batch-size) CONCURRENCY="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# ── Validate manifest structure ───────────────────────────────────
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: Manifest not found: $MANIFEST" >&2
  exit 2
fi

TOTAL=$(jq -r '.total_items' "$MANIFEST")
ITEMS_LEN=$(jq '.items | length' "$MANIFEST")
TASK_MODE=$(jq -r '.task_mode // "read_only"' "$MANIFEST")
PROMPT_TEMPLATE=$(jq -r '.prompt_template' "$MANIFEST")
PROJECT_CONTEXT=$(jq -r '.project_context // ""' "$MANIFEST")

if [[ "$TOTAL" != "$ITEMS_LEN" ]]; then
  echo "ERROR: total_items ($TOTAL) != items array length ($ITEMS_LEN)" >&2
  exit 2
fi

# Override concurrency for write mode
if [[ "$TASK_MODE" == "write" ]]; then
  CONCURRENCY=1
fi

# ── Setup output directory ────────────────────────────────────────
WORK_DIR=$(dirname "$MANIFEST")
OUTPUT_DIR="${WORK_DIR}/output"
mkdir -p "$OUTPUT_DIR"

echo "[$(date +%H:%M:%S)] Orchestrator: $TOTAL items, mode=$TASK_MODE, concurrency=$CONCURRENCY, model=$MODEL_NAME"

# ── Dispatch single item ──────────────────────────────────────────
dispatch_item() {
  local IDX="$1"
  local ITEM_DESC=$(jq -r ".items[$((IDX - 1))].description" "$MANIFEST")
  local CONTEXT_FILE=$(jq -r ".items[$((IDX - 1))].context_file // \"\"" "$MANIFEST")
  local CONTEXT_LINES=$(jq -r ".items[$((IDX - 1))].context_lines // \"\"" "$MANIFEST")

  # Build prompt from template
  local PROMPT="$PROMPT_TEMPLATE"
  PROMPT="${PROMPT//\{item_description\}/$ITEM_DESC}"
  PROMPT="${PROMPT//\{context_file\}/$CONTEXT_FILE}"
  PROMPT="${PROMPT//\{context_lines\}/$CONTEXT_LINES}"
  PROMPT="${PROMPT//\{project_context\}/$PROJECT_CONTEXT}"

  local OUTFILE="${OUTPUT_DIR}/item-$(printf '%03d' "$IDX").json"

  case "$MODEL_NAME" in
    claude)
      VIBE_INTEGRITY_MODE=off claude -p "$PROMPT" --output-format json --permission-mode auto > "$OUTFILE" 2>&1
      ;;
    qwen)
      qwen -p "$PROMPT" -o json -y --auth-type qwen-oauth > "$OUTFILE" 2>&1
      ;;
    gemini)
      gemini -p "$PROMPT" -o json -y > "$OUTFILE" 2>&1
      ;;
  esac

  if [[ -f "$OUTFILE" ]] && [[ $(wc -c < "$OUTFILE") -gt 50 ]]; then
    echo "OK"
  else
    echo "FAIL"
  fi
}

# ── Process items ─────────────────────────────────────────────────
SUCCEEDED=0
FAILED=0

for IDX in $(seq 1 "$TOTAL"); do
  echo -n "[$(date +%H:%M:%S)] Item ${IDX}/${TOTAL}... "

  RESULT=$(dispatch_item "$IDX")
  if [[ "$RESULT" == "OK" ]]; then
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    echo -n "RETRY... "
    RESULT=$(dispatch_item "$IDX")
    if [[ "$RESULT" == "OK" ]]; then
      SUCCEEDED=$((SUCCEEDED + 1))
    else
      FAILED=$((FAILED + 1))
      echo "FAILED (after retry)"
    fi
  fi
done

echo "[$(date +%H:%M:%S)] Dispatch: ${SUCCEEDED}/${TOTAL} succeeded, ${FAILED} failed"

# ── Mechanical assembly ───────────────────────────────────────────
RAW_ASSEMBLY="${WORK_DIR}/raw-assembly.md"
> "$RAW_ASSEMBLY"

for IDX in $(seq 1 "$TOTAL"); do
  OUTFILE="${OUTPUT_DIR}/item-$(printf '%03d' "$IDX").json"

  echo "<!-- ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"

  if [[ ! -f "$OUTFILE" ]] || [[ $(wc -c < "$OUTFILE") -lt 50 ]]; then
    echo "_Item ${IDX}: processing failed_" >> "$RAW_ASSEMBLY"
    echo "<!-- /ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
    echo "" >> "$RAW_ASSEMBLY"
    continue
  fi

  # Extract text output from JSON
  python3 -c "
import json, sys
try:
    raw = open('$OUTFILE').read().strip()
    lines = raw.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('{') or line.strip().startswith('['):
            raw = '\n'.join(lines[i:])
            break
    d = json.loads(raw)
    if isinstance(d, list): d = d[-1]
    print(d.get('result', '_No output_'))
except:
    print('_Failed to parse output_')
" >> "$RAW_ASSEMBLY" 2>/dev/null

  echo "" >> "$RAW_ASSEMBLY"
  echo "<!-- /ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
  echo "" >> "$RAW_ASSEMBLY"
done

RAW_ITEM_COUNT=$(grep -c '<!-- /ITEM-' "$RAW_ASSEMBLY")
echo "[$(date +%H:%M:%S)] Raw assembly: ${RAW_ITEM_COUNT} items"

# ── LLM polish ────────────────────────────────────────────────────
POLISHED="${WORK_DIR}/polished.md"
POLISH_PROMPT="Rewrite the following document for coherence and readability.

CRITICAL RULES:
1. Preserve ALL <!-- ITEM-N --> and <!-- /ITEM-N --> markers exactly as they appear
2. Do NOT remove, merge, or renumber any markers
3. You may add transitions, headings, introduction, and formatting between items
4. Every marker pair in the input must appear in your output

DOCUMENT:
$(cat "$RAW_ASSEMBLY")"

case "$MODEL_NAME" in
  claude)
    VIBE_INTEGRITY_MODE=off claude -p "$POLISH_PROMPT" --output-format json --permission-mode auto > "${WORK_DIR}/polish-raw.json" 2>&1
    ;;
  qwen)
    qwen -p "$POLISH_PROMPT" -o json -y --auth-type qwen-oauth > "${WORK_DIR}/polish-raw.json" 2>&1
    ;;
  gemini)
    gemini -p "$POLISH_PROMPT" -o json -y > "${WORK_DIR}/polish-raw.json" 2>&1
    ;;
esac

python3 -c "
import json
try:
    raw = open('${WORK_DIR}/polish-raw.json').read().strip()
    lines = raw.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('{') or line.strip().startswith('['):
            raw = '\n'.join(lines[i:])
            break
    d = json.loads(raw)
    if isinstance(d, list): d = d[-1]
    open('$POLISHED', 'w').write(d.get('result', ''))
except:
    open('$POLISHED', 'w').write('')
" 2>/dev/null

# ── Mechanical verification of polish ─────────────────────────────
POLISH_ITEM_COUNT=$(grep -c '<!-- /ITEM-' "$POLISHED" 2>/dev/null || echo 0)

FINAL="${WORK_DIR}/final.md"
if [[ "$POLISH_ITEM_COUNT" -eq "$TOTAL" ]]; then
  cp "$POLISHED" "$FINAL"
  echo "[$(date +%H:%M:%S)] Polish preserved all items — delivering polished version"
else
  cp "$RAW_ASSEMBLY" "$FINAL"
  echo "[$(date +%H:%M:%S)] Polish lost items (${POLISH_ITEM_COUNT}/${TOTAL}) — delivering raw assembly"
fi

# ── Write metadata ────────────────────────────────────────────────
POLISH_KEPT="false"
[[ "$POLISH_ITEM_COUNT" -eq "$TOTAL" ]] && POLISH_KEPT="true"

jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson total "$TOTAL" \
  --argjson succeeded "$SUCCEEDED" \
  --argjson failed "$FAILED" \
  --arg mode "$TASK_MODE" \
  --arg model "$MODEL_NAME" \
  --argjson polish_kept "$POLISH_KEPT" \
  '{timestamp: $ts, total_items: $total, succeeded: $succeeded, failed: $failed, task_mode: $mode, model: $model, polish_preserved_all: $polish_kept, completeness: ($succeeded / $total)}' \
  > "${WORK_DIR}/metadata.json"

echo "[$(date +%H:%M:%S)] Done. Metadata: ${WORK_DIR}/metadata.json"

[[ "$FAILED" -eq 0 ]] && exit 0 || exit 1

#!/usr/bin/env bash
# Test the atomic decomposition framework against experimental tasks.
# Usage: ./atomic-test.sh <task_id> [model]
set -uo pipefail

TASK_ID=$(printf '%02d' "$1")
MODEL="${2:-claude}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Find task file
TASK_FILE=$(find "$ROOT_DIR/research/experiment/tasks" -name "task-${TASK_ID}.md" | head -1)
if [[ -z "$TASK_FILE" ]]; then
  echo "ERROR: task-${TASK_ID}.md not found" >&2
  exit 1
fi

TASK_PROMPT=$(sed -n '/^## Prompt$/,/^## /{/^## Prompt$/d;/^## /d;p}' "$TASK_FILE")
EXPECTED=$(sed -n 's/^[*]*Expected items:[*]* *\([0-9]*\).*/\1/p' "$TASK_FILE" | head -1)
CODEBASE=$(sed -n 's/^[*]*Codebase:[*]* *`\?\([^`]*\)`\?.*/\1/p' "$TASK_FILE" | head -1)
CWD="$ROOT_DIR/${CODEBASE}"

WORK_DIR="/tmp/vibe-atomic-test-${TASK_ID}-$(date +%s)"
mkdir -p "$WORK_DIR"

echo "=== Atomic Framework Test: task-${TASK_ID}, model=${MODEL} ==="
echo "Expected items: ${EXPECTED}"
echo "Codebase: ${CWD}"
echo "Work dir: ${WORK_DIR}"

# ── Step 1: Run decomposer to produce manifest ───────────────────
echo ""
echo "[$(date +%H:%M:%S)] Step 1: Decomposer producing manifest..."

DECOMPOSE_PROMPT="You are the atomic decomposer agent.

TASK: ${TASK_PROMPT}

CODEBASE DIRECTORY: ${CWD}

Expected item count (for verification): ${EXPECTED}

Your job: enumerate the items to process and write a manifest.json to the current directory.

Rules:
1. Run an enumeration command via Bash to count items mechanically
2. The count from the command is authoritative
3. Write manifest.json with total_items, enumeration_command, prompt_template, project_context, task_mode, and items array
4. Every item must have id, description, context_file
5. Verify with: jq '.items | length' manifest.json

Do NOT analyze any item. Only enumerate and write the manifest."

pushd "$CWD" > /dev/null
case "$MODEL" in
  claude)
    claude -p "$DECOMPOSE_PROMPT" --output-format json --permission-mode acceptEdits > "${WORK_DIR}/decomposer-output.json" 2>&1
    ;;
  qwen)
    qwen -p "$DECOMPOSE_PROMPT" -o json -y --auth-type qwen-oauth > "${WORK_DIR}/decomposer-output.json" 2>&1
    ;;
esac
popd > /dev/null

# Find manifest
MANIFEST=""
for CANDIDATE in "${CWD}/manifest.json" "${WORK_DIR}/manifest.json"; do
  if [[ -f "$CANDIDATE" ]]; then
    MANIFEST="$CANDIDATE"
    break
  fi
done

if [[ -z "$MANIFEST" ]]; then
  echo "[$(date +%H:%M:%S)] FAIL: Decomposer did not produce manifest.json"
  echo "Decomposer output:"
  python3 -c "
import json
try:
    raw = open('${WORK_DIR}/decomposer-output.json').read().strip()
    lines = raw.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('{') or line.strip().startswith('['):
            raw = '\n'.join(lines[i:])
            break
    d = json.loads(raw)
    if isinstance(d, list): d = d[-1]
    print(d.get('result', 'no result')[:500])
except Exception as e:
    print(f'Parse error: {e}')
" 2>/dev/null
  exit 1
fi

# Copy manifest to work dir
cp "$MANIFEST" "${WORK_DIR}/manifest.json" 2>/dev/null || true
MANIFEST="${WORK_DIR}/manifest.json"

MANIFEST_TOTAL=$(jq '.total_items' "$MANIFEST")
echo "[$(date +%H:%M:%S)] Manifest produced: ${MANIFEST_TOTAL} items"

# ── Step 2: Validate manifest ────────────────────────────────────
echo ""
echo "[$(date +%H:%M:%S)] Step 2: Validating manifest..."

pushd "$CWD" > /dev/null
if "$SCRIPT_DIR/atomic-validate-manifest.sh" "$MANIFEST" 2>&1; then
  echo "[$(date +%H:%M:%S)] Manifest valid"
else
  echo "[$(date +%H:%M:%S)] Manifest INVALID"
  popd > /dev/null
  exit 1
fi
popd > /dev/null

# ── Step 3: Orchestrate ──────────────────────────────────────────
echo ""
echo "[$(date +%H:%M:%S)] Step 3: Orchestrating..."

pushd "$CWD" > /dev/null
"$SCRIPT_DIR/atomic-orchestrator.sh" "$MANIFEST" --model "$MODEL"
ORCH_EXIT=$?
popd > /dev/null

# ── Step 4: Verify output ────────────────────────────────────────
echo ""
echo "[$(date +%H:%M:%S)] Step 4: Verifying output..."

FINAL="${WORK_DIR}/final.md"
if [[ -f "$FINAL" ]]; then
  "$SCRIPT_DIR/atomic-verify-output.sh" "$FINAL" "$MANIFEST_TOTAL" 2>&1
  VERIFY_EXIT=$?
else
  echo "FAIL: No final output produced"
  VERIFY_EXIT=2
fi

# ── Report ────────────────────────────────────────────────────────
echo ""
echo "=== Results ==="
if [[ -f "${WORK_DIR}/metadata.json" ]]; then
  jq . "${WORK_DIR}/metadata.json"
fi
echo "Orchestrator exit: $ORCH_EXIT"
echo "Verification exit: $VERIFY_EXIT"

# Cleanup manifest from codebase dir if we copied it
rm -f "${CWD}/manifest.json" 2>/dev/null

exit $ORCH_EXIT

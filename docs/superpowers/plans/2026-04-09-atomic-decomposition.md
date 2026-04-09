# Atomic Decomposition System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the atomic decomposition system that eliminates false completion by decomposing enumerable tasks into one-item-per-session with mechanical orchestration and enforcement.

**Architecture:** LLM decomposer produces a verifiable manifest → bash orchestrator dispatches one CLI session per item → mechanical assembly + optional LLM polish → enforcement hook validates counts at both ends.

**Tech Stack:** Bash (orchestrator, hooks), JSON (manifest schema), jq (parsing), Claude Code / Qwen / Gemini CLI (sub-agent dispatch).

---

## File Structure

```
scripts/
  atomic-orchestrator.sh        # Mechanical core: reads manifest, dispatches, assembles
  atomic-validate-manifest.sh   # Phase A: validate manifest independently
  atomic-verify-output.sh       # Phase B: count items in final output

agents/
  decomposer.md                 # LLM agent that produces manifests

skills/
  _shared/
    atomic-decomposition.md     # Shared protocol documentation

hooks/
  hooks.json                    # Add PostToolUse hook for manifest validation

research/experiment/
  scripts/run-atomic-framework.sh  # Test harness using the framework (vs raw C5)
```

---

### Task 1: Manifest JSON Schema

**Files:**
- Create: `skills/_shared/atomic-decomposition.md`

This defines the contract that all three components depend on. Must be done first.

- [ ] **Step 1: Create the shared protocol file**

```markdown
# Atomic Decomposition Protocol

Shared protocol for processing enumerable tasks. When a skill processes N independent items, it invokes the decomposer agent to produce a manifest, then the mechanical orchestrator processes each item in a separate LLM session.

---

## When to Use

A task is decomposable when:
1. It processes a LIST of independent items (endpoints, components, files, URLs)
2. Each item can be analyzed/modified independently
3. The items can be enumerated mechanically (file listing, grep, provided list)

A task is NOT decomposable when:
- It requires cross-item reasoning (architecture design, system-wide refactoring)
- The items are unknown until analysis (vulnerability discovery)
- Items depend on each other (file A changes require knowing file B changes)

---

## Manifest Schema

The decomposer agent produces a `manifest.json` with this structure:

```json
{
  "task_description": "string — what the overall task is",
  "total_items": "integer — count of items to process",
  "enumeration_source": "file | pattern | list | structure",
  "enumeration_command": "string — shell command that produces the same count independently",
  "prompt_template": "string — prompt for each sub-agent, with {item_description}, {context_file}, {context_lines}, {project_context} placeholders",
  "output_format": "markdown | json | text",
  "project_context": "string — architecture summary, conventions, domain knowledge for sub-agents",
  "task_mode": "read_only | write",
  "items": [
    {
      "id": "integer — 1-based sequential",
      "description": "string — what this specific item is",
      "context_file": "string — file path relevant to this item (optional)",
      "context_lines": "string — line range e.g. '12-25' (optional)"
    }
  ]
}
```

### Required Fields
- `total_items` MUST equal length of `items` array
- `enumeration_command` MUST produce the same count when executed independently
- `prompt_template` MUST contain `{item_description}` placeholder
- `task_mode` MUST be `read_only` or `write`
- Each item MUST have `id` and `description`

### Validation Rules
- The enforcement hook executes `enumeration_command` before orchestration starts
- If the command count differs from `total_items`, the manifest is rejected
- Phantom items (referencing non-existent files) cause sub-agent failures, which are tracked

---

## How Skills Declare Enumerable Items

In a skill's SKILL.md, add a section:

```markdown
### Atomic Decomposition

This skill processes enumerable items. When the item count exceeds the threshold, invoke the decomposer agent.

- **Item type:** API endpoints
- **Enumeration source:** pattern
- **Enumeration hint:** `grep -rn '@app.route\|@router.' {codebase}`
- **Threshold:** 10 (use atomic decomposition when N > 10)
- **Task mode:** read_only
```

The decomposer agent reads this declaration and uses the enumeration hint to construct the manifest.

---

## Assembly Markers

Each sub-agent output is wrapped in markers by the orchestrator:

```
<!-- ITEM-1 -->
[sub-agent output for item 1]
<!-- /ITEM-1 -->
```

These markers enable mechanical counting at every stage. The polish step must preserve them.
```

- [ ] **Step 2: Commit**

```bash
git add -f skills/_shared/atomic-decomposition.md
git commit -m "feat(atomic): add shared protocol with manifest schema and skill declaration format"
```

---

### Task 2: Mechanical Orchestrator

**Files:**
- Create: `scripts/atomic-orchestrator.sh`

The mechanical core. Reads a validated manifest, dispatches one CLI session per item, assembles results. Zero LLM logic.

- [ ] **Step 1: Create the orchestrator script**

```bash
#!/usr/bin/env bash
# Atomic Decomposition Orchestrator
# Reads a manifest.json, dispatches one CLI session per item,
# assembles results mechanically.
#
# Usage: ./atomic-orchestrator.sh <manifest.json> [--model claude|qwen|gemini] [--batch-size N]
#
# Exit codes:
#   0 = success (all items processed)
#   1 = partial (some items failed)
#   2 = invalid manifest
set -uo pipefail

MANIFEST="$1"
MODEL="${2:---model}"
BATCH_SIZE="${3:---batch-size}"

# Parse flags
MODEL_NAME="claude"
CONCURRENCY=3
shift
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
OUTPUT_FORMAT=$(jq -r '.output_format // "markdown"' "$MANIFEST")

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

# ── Dispatch function ─────────────────────────────────────────────
dispatch_item() {
  local IDX="$1"
  local ITEM_JSON=$(jq -c ".items[$((IDX - 1))]" "$MANIFEST")
  local ITEM_DESC=$(echo "$ITEM_JSON" | jq -r '.description')
  local CONTEXT_FILE=$(echo "$ITEM_JSON" | jq -r '.context_file // ""')
  local CONTEXT_LINES=$(echo "$ITEM_JSON" | jq -r '.context_lines // ""')

  # Build prompt from template
  local PROMPT="$PROMPT_TEMPLATE"
  PROMPT="${PROMPT//\{item_description\}/$ITEM_DESC}"
  PROMPT="${PROMPT//\{context_file\}/$CONTEXT_FILE}"
  PROMPT="${PROMPT//\{context_lines\}/$CONTEXT_LINES}"
  PROMPT="${PROMPT//\{project_context\}/$PROJECT_CONTEXT}"

  local OUTFILE="${OUTPUT_DIR}/item-$(printf '%03d' $IDX).json"

  # Dispatch based on model
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

  # Check output
  if [[ -f "$OUTFILE" ]] && [[ $(wc -c < "$OUTFILE") -gt 50 ]]; then
    echo "OK"
  else
    echo "FAIL"
  fi
}

# ── Process items in batches ──────────────────────────────────────
PROCESSED=0
SUCCEEDED=0
FAILED=0

for IDX in $(seq 1 "$TOTAL"); do
  PROCESSED=$((PROCESSED + 1))
  echo -n "[$(date +%H:%M:%S)] Item ${IDX}/${TOTAL}... "

  RESULT=$(dispatch_item "$IDX")
  if [[ "$RESULT" == "OK" ]]; then
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    # Retry once
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

echo "[$(date +%H:%M:%S)] Dispatch complete: ${SUCCEEDED}/${TOTAL} succeeded, ${FAILED} failed"

# ── Mechanical assembly ───────────────────────────────────────────
RAW_ASSEMBLY="${WORK_DIR}/raw-assembly.md"
> "$RAW_ASSEMBLY"

for IDX in $(seq 1 "$TOTAL"); do
  OUTFILE="${OUTPUT_DIR}/item-$(printf '%03d' $IDX).json"
  if [[ ! -f "$OUTFILE" ]]; then
    echo "<!-- ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
    echo "_Item ${IDX}: processing failed_" >> "$RAW_ASSEMBLY"
    echo "<!-- /ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
    continue
  fi

  # Extract text output from JSON
  ITEM_TEXT=$(python3 -c "
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
" 2>/dev/null)

  echo "<!-- ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
  echo "$ITEM_TEXT" >> "$RAW_ASSEMBLY"
  echo "" >> "$RAW_ASSEMBLY"
  echo "<!-- /ITEM-${IDX} -->" >> "$RAW_ASSEMBLY"
done

RAW_MARKER_COUNT=$(grep -c '<!-- ITEM-' "$RAW_ASSEMBLY" | head -1)
# Each item has opening + closing = 2 markers, so divide by 2
RAW_ITEM_COUNT=$((RAW_MARKER_COUNT / 2))
echo "[$(date +%H:%M:%S)] Raw assembly: ${RAW_ITEM_COUNT} items with markers"

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
POLISH_MARKER_COUNT=$(grep -c '<!-- ITEM-' "$POLISHED" 2>/dev/null || echo 0)
POLISH_ITEM_COUNT=$((POLISH_MARKER_COUNT / 2))

FINAL="${WORK_DIR}/final.md"
if [[ "$POLISH_ITEM_COUNT" -eq "$TOTAL" ]]; then
  cp "$POLISHED" "$FINAL"
  echo "[$(date +%H:%M:%S)] Polish preserved all ${TOTAL} items — delivering polished version"
else
  cp "$RAW_ASSEMBLY" "$FINAL"
  echo "[$(date +%H:%M:%S)] Polish lost items (${POLISH_ITEM_COUNT}/${TOTAL}) — delivering raw assembly"
fi

# ── Write metadata ────────────────────────────────────────────────
jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson total "$TOTAL" \
  --argjson succeeded "$SUCCEEDED" \
  --argjson failed "$FAILED" \
  --arg mode "$TASK_MODE" \
  --arg model "$MODEL_NAME" \
  --argjson polish_kept "$( [[ $POLISH_ITEM_COUNT -eq $TOTAL ]] && echo true || echo false )" \
  '{timestamp: $ts, total_items: $total, succeeded: $succeeded, failed: $failed, task_mode: $mode, model: $model, polish_preserved_all: $polish_kept, completeness: ($succeeded / $total)}' \
  > "${WORK_DIR}/metadata.json"

echo "[$(date +%H:%M:%S)] Metadata written to ${WORK_DIR}/metadata.json"

# Exit code based on completeness
if [[ "$FAILED" -eq 0 ]]; then
  exit 0
else
  exit 1
fi
```

- [ ] **Step 2: Make executable and verify syntax**

```bash
chmod +x scripts/atomic-orchestrator.sh
bash -n scripts/atomic-orchestrator.sh && echo "Syntax OK"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/atomic-orchestrator.sh
git commit -m "feat(atomic): add mechanical orchestrator — dispatches, assembles, verifies"
```

---

### Task 3: Manifest Validation Script

**Files:**
- Create: `scripts/atomic-validate-manifest.sh`

Standalone validation that the enforcement hook calls. Executes enumeration_command independently and compares counts.

- [ ] **Step 1: Create the validation script**

```bash
#!/usr/bin/env bash
# Validate an atomic decomposition manifest independently.
# Executes enumeration_command and compares count to total_items.
#
# Usage: ./atomic-validate-manifest.sh <manifest.json>
# Exit 0 = valid, Exit 2 = invalid (stderr has details)
set -uo pipefail

MANIFEST="$1"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Manifest not found: $MANIFEST" >&2
  exit 2
fi

# Check required fields exist
for FIELD in total_items enumeration_command items prompt_template task_mode; do
  VAL=$(jq -r ".$FIELD // empty" "$MANIFEST")
  if [[ -z "$VAL" ]]; then
    echo "Missing required field: $FIELD" >&2
    exit 2
  fi
done

TOTAL=$(jq -r '.total_items' "$MANIFEST")
ITEMS_LEN=$(jq '.items | length' "$MANIFEST")
ENUM_CMD=$(jq -r '.enumeration_command' "$MANIFEST")

# Check total_items == items array length
if [[ "$TOTAL" != "$ITEMS_LEN" ]]; then
  echo "total_items ($TOTAL) != items array length ($ITEMS_LEN)" >&2
  exit 2
fi

# Execute enumeration command independently
ENUM_COUNT=$(eval "$ENUM_CMD" 2>/dev/null | wc -l | tr -d ' ')

if [[ "$ENUM_COUNT" != "$TOTAL" ]]; then
  echo "enumeration_command produced $ENUM_COUNT items, manifest claims $TOTAL" >&2
  exit 2
fi

# Check each item has required fields
for i in $(seq 0 $((TOTAL - 1))); do
  ID=$(jq -r ".items[$i].id // empty" "$MANIFEST")
  DESC=$(jq -r ".items[$i].description // empty" "$MANIFEST")
  if [[ -z "$ID" ]] || [[ -z "$DESC" ]]; then
    echo "Item $i missing id or description" >&2
    exit 2
  fi
done

echo "Manifest valid: $TOTAL items, enumeration confirmed"
exit 0
```

- [ ] **Step 2: Make executable and verify syntax**

```bash
chmod +x scripts/atomic-validate-manifest.sh
bash -n scripts/atomic-validate-manifest.sh && echo "Syntax OK"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/atomic-validate-manifest.sh
git commit -m "feat(atomic): add manifest validation script — independent enumeration check"
```

---

### Task 4: Output Verification Script

**Files:**
- Create: `scripts/atomic-verify-output.sh`

Counts ITEM markers in output and compares to expected total.

- [ ] **Step 1: Create the verification script**

```bash
#!/usr/bin/env bash
# Verify atomic decomposition output has all expected items.
#
# Usage: ./atomic-verify-output.sh <output.md> <expected_count>
# Exit 0 = all items present, Exit 2 = items missing
set -uo pipefail

OUTPUT="$1"
EXPECTED="$2"

if [[ ! -f "$OUTPUT" ]]; then
  echo "Output file not found: $OUTPUT" >&2
  exit 2
fi

# Count opening ITEM markers
MARKER_COUNT=$(grep -c '<!-- ITEM-' "$OUTPUT" 2>/dev/null || echo 0)
# Each item has open + close = 2 markers
ITEM_COUNT=$((MARKER_COUNT / 2))

if [[ "$ITEM_COUNT" -ge "$EXPECTED" ]]; then
  echo "Output verified: ${ITEM_COUNT}/${EXPECTED} items present"
  exit 0
else
  echo "Output incomplete: ${ITEM_COUNT}/${EXPECTED} items present" >&2
  # List which items are missing
  for i in $(seq 1 "$EXPECTED"); do
    if ! grep -q "<!-- ITEM-${i} -->" "$OUTPUT"; then
      echo "  Missing: ITEM-${i}" >&2
    fi
  done
  exit 2
fi
```

- [ ] **Step 2: Make executable and verify syntax**

```bash
chmod +x scripts/atomic-verify-output.sh
bash -n scripts/atomic-verify-output.sh && echo "Syntax OK"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/atomic-verify-output.sh
git commit -m "feat(atomic): add output verification script — mechanical item counting"
```

---

### Task 5: Decomposer Agent

**Files:**
- Create: `agents/decomposer.md`

The LLM agent that reads a task, enumerates items, and writes a manifest.json.

- [ ] **Step 1: Create the agent definition**

```markdown
---
name: decomposer
description: Decomposes enumerable tasks into atomic items and produces a manifest for mechanical orchestration. Use when a task processes N independent items (endpoints, components, files, URLs).
model: sonnet
tools: Read, Grep, Glob, Bash, Write
effort: max
---

# Atomic Decomposer

You produce a structured manifest for the atomic orchestrator. Your job is ONLY to enumerate items — not to analyze them.

## What You Do

1. Read the task description and the skill's atomic decomposition declaration
2. Identify all items that need processing
3. Run the enumeration command mechanically (via Bash) to get the authoritative count
4. For each item, identify the relevant context (file path, line range)
5. Extract project context from CLAUDE.md, README, or codebase inspection
6. Write a `manifest.json` to the working directory

## What You Do NOT Do

- Do NOT analyze, audit, review, or process any item
- Do NOT produce the final deliverable
- Do NOT skip items or apply judgment about which items "matter"
- Do NOT set total_items to any number other than what the enumeration command produces

## Manifest Format

Write `manifest.json` with this exact structure:

```json
{
  "task_description": "one-line description of the overall task",
  "total_items": <integer from enumeration command>,
  "enumeration_source": "file | pattern | list | structure",
  "enumeration_command": "<shell command that counts items>",
  "prompt_template": "<prompt with {item_description}, {context_file}, {context_lines}, {project_context} placeholders>",
  "output_format": "markdown | json | text",
  "project_context": "<architecture summary for sub-agents>",
  "task_mode": "read_only | write",
  "items": [
    {"id": 1, "description": "...", "context_file": "...", "context_lines": "..."},
    ...
  ]
}
```

## Critical Rules

1. Run the enumeration command via Bash FIRST. The count it produces is authoritative.
2. `total_items` MUST equal the count from the enumeration command AND the length of the `items` array. All three must match.
3. Every item found by the enumeration command MUST appear in the `items` array. Do not filter, skip, or de-duplicate.
4. The `enumeration_command` must be reproducible — running it again must produce the same count.
5. `project_context` should be 2-5 sentences summarizing architecture, conventions, and domain knowledge relevant to the analysis.
6. `task_mode` is `read_only` for analysis/audit tasks, `write` for refactoring/modification tasks.

## Verification

After writing the manifest, verify it yourself:
```bash
echo "VIBE_GATE: manifest_items=$(jq '.items | length' manifest.json)"
echo "VIBE_GATE: manifest_total=$(jq '.total_items' manifest.json)"
echo "VIBE_GATE: enum_count=$(eval "$(jq -r '.enumeration_command' manifest.json)" | wc -l | tr -d ' ')"
```

All three numbers must match.
```

- [ ] **Step 2: Commit**

```bash
git add agents/decomposer.md
git commit -m "feat(atomic): add decomposer agent — produces manifests for mechanical orchestration"
```

---

### Task 6: Enforcement Hook

**Files:**
- Modify: `hooks/hooks.json`
- Create: `scripts/atomic-enforcement.sh`

A hook that fires on Stop to check: if a manifest exists, was the output verified?

- [ ] **Step 1: Create the enforcement hook script**

```bash
#!/usr/bin/env bash
# Atomic Decomposition Enforcement Hook
# Fires on Stop. Checks if a manifest was produced and if so,
# verifies the output contains all expected items.
#
# Exit 0 = pass (no manifest, or manifest + verified output)
# Exit 2 = block (manifest exists but output incomplete)
set -uo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')

# Check pause
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Look for manifest in common locations
MANIFEST=""
for CANDIDATE in \
  "/tmp/vibe-atomic-${SESSION_ID}/manifest.json" \
  "./manifest.json" \
  "./.vibe/atomic/manifest.json"; do
  if [[ -f "$CANDIDATE" ]]; then
    MANIFEST="$CANDIDATE"
    break
  fi
done

# No manifest = not an atomic task, pass through
if [[ -z "$MANIFEST" ]]; then
  exit 0
fi

TOTAL=$(jq -r '.total_items' "$MANIFEST" 2>/dev/null)
if [[ -z "$TOTAL" ]] || [[ "$TOTAL" == "null" ]]; then
  exit 0
fi

# Phase A: Validate manifest (if not already validated)
VALIDATED_FLAG="/tmp/vibe-atomic-validated-${SESSION_ID}"
if [[ ! -f "$VALIDATED_FLAG" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  if ! "$SCRIPT_DIR/atomic-validate-manifest.sh" "$MANIFEST" 2>/dev/null; then
    cat >&2 << BLOCK
VIBE ATOMIC ENFORCEMENT — Manifest validation failed.

The enumeration command produced a different count than total_items.
Re-run the decomposer to produce a correct manifest.
BLOCK
    exit 2
  fi
  touch "$VALIDATED_FLAG"
fi

# Phase B: Check if output file exists and has all items
WORK_DIR=$(dirname "$MANIFEST")
FINAL="${WORK_DIR}/final.md"
if [[ -f "$FINAL" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  if ! "$SCRIPT_DIR/atomic-verify-output.sh" "$FINAL" "$TOTAL" 2>/dev/null; then
    ACTUAL=$(grep -c '<!-- ITEM-' "$FINAL" 2>/dev/null || echo 0)
    ACTUAL=$((ACTUAL / 2))
    cat >&2 << BLOCK
VIBE ATOMIC ENFORCEMENT — Output incomplete.

Expected: $TOTAL items
Found: $ACTUAL items

The atomic orchestrator did not produce all expected items.
Check metadata.json for failure details.
BLOCK
    exit 2
  fi
fi

exit 0
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/atomic-enforcement.sh
```

- [ ] **Step 3: Register hook in hooks.json**

Add to the `Stop` hooks array, after the existing sentinel and verifier:

```json
{
  "type": "command",
  "command": "\"${CLAUDE_PLUGIN_ROOT}/scripts/atomic-enforcement.sh\"",
  "statusMessage": "VIBE: atomic verification..."
}
```

- [ ] **Step 4: Verify hooks.json is valid JSON**

```bash
jq . hooks/hooks.json > /dev/null && echo "Valid JSON"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/atomic-enforcement.sh hooks/hooks.json
git commit -m "feat(atomic): add enforcement hook — validates manifest and output counts"
```

---

### Task 7: Integration Test with Experimental Tasks

**Files:**
- Create: `scripts/atomic-test.sh`

Run the full pipeline (decomposer → validate → orchestrate → verify) on our experimental tasks.

- [ ] **Step 1: Create the test harness**

```bash
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

WORK_DIR="/tmp/vibe-atomic-test-${TASK_ID}"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

echo "=== Atomic Framework Test: task-${TASK_ID}, model=${MODEL} ==="
echo "Expected items: ${EXPECTED}"
echo "Working dir: ${WORK_DIR}"

# Step 1: Run decomposer agent to produce manifest
echo "[$(date +%H:%M:%S)] Step 1: Decomposer producing manifest..."
DECOMPOSE_PROMPT="You are the atomic decomposer agent.

TASK: ${TASK_PROMPT}

CODEBASE DIRECTORY: ${CWD}

Expected item count: ${EXPECTED}

Produce a manifest.json in the current directory following the atomic decomposition protocol. Run the enumeration command via Bash to get the authoritative count. Include project_context from inspecting the codebase."

pushd "$CWD" > /dev/null
if [[ "$MODEL" == "claude" ]]; then
  VIBE_INTEGRITY_MODE=off claude -p "$DECOMPOSE_PROMPT" --output-format json --permission-mode auto > "${WORK_DIR}/decomposer-output.json" 2>&1
elif [[ "$MODEL" == "qwen" ]]; then
  qwen -p "$DECOMPOSE_PROMPT" -o json -y --auth-type qwen-oauth > "${WORK_DIR}/decomposer-output.json" 2>&1
fi
popd > /dev/null

# Find manifest (decomposer may write it in CWD or WORK_DIR)
MANIFEST=""
for CANDIDATE in "${CWD}/manifest.json" "${WORK_DIR}/manifest.json" "./manifest.json"; do
  if [[ -f "$CANDIDATE" ]]; then
    MANIFEST="$CANDIDATE"
    break
  fi
done

if [[ -z "$MANIFEST" ]]; then
  echo "[$(date +%H:%M:%S)] FAIL: Decomposer did not produce manifest.json"
  exit 1
fi

# Copy manifest to work dir if not already there
cp "$MANIFEST" "${WORK_DIR}/manifest.json" 2>/dev/null || true
MANIFEST="${WORK_DIR}/manifest.json"

echo "[$(date +%H:%M:%S)] Manifest produced: $(jq '.total_items' "$MANIFEST") items"

# Step 2: Validate manifest
echo "[$(date +%H:%M:%S)] Step 2: Validating manifest..."
if ! "$SCRIPT_DIR/atomic-validate-manifest.sh" "$MANIFEST" 2>&1; then
  echo "[$(date +%H:%M:%S)] FAIL: Manifest validation failed"
  exit 1
fi

# Step 3: Orchestrate
echo "[$(date +%H:%M:%S)] Step 3: Orchestrating..."
pushd "$CWD" > /dev/null
"$SCRIPT_DIR/atomic-orchestrator.sh" "$MANIFEST" --model "$MODEL"
ORCH_EXIT=$?
popd > /dev/null

# Step 4: Verify output
echo "[$(date +%H:%M:%S)] Step 4: Verifying output..."
FINAL="${WORK_DIR}/final.md"
if [[ -f "$FINAL" ]]; then
  "$SCRIPT_DIR/atomic-verify-output.sh" "$FINAL" "$(jq '.total_items' "$MANIFEST")" 2>&1
else
  echo "FAIL: No final output produced"
fi

# Step 5: Report
echo ""
echo "=== Results ==="
cat "${WORK_DIR}/metadata.json" 2>/dev/null | jq .
echo "Orchestrator exit code: $ORCH_EXIT"
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/atomic-test.sh
```

- [ ] **Step 3: Run on task 1 (pilot)**

```bash
bash scripts/atomic-test.sh 1 claude
```

Expected: Manifest produced with 18 items, all 18 processed, output verified.

- [ ] **Step 4: Run on task 12 (known hard case)**

```bash
bash scripts/atomic-test.sh 12 claude
```

Expected: Manifest produced with 12 items, all 12 processed.

- [ ] **Step 5: Commit**

```bash
git add scripts/atomic-test.sh
git commit -m "feat(atomic): add integration test harness for experimental validation"
```

---

### Task 8: Update Skills with Atomic Declarations

**Files:**
- Modify: `skills/_shared/competitor-research.md`
- Modify: `skills/emmet/SKILL.md`
- Modify: `skills/seurat/SKILL.md`
- Modify: `skills/ghostwriter/SKILL.md` (or `skills/ghostwriter/references/validation.md`)
- Modify: `skills/baptist/SKILL.md`

Add atomic decomposition declarations to each skill.

- [ ] **Step 1: Update competitor-research**

Add at the end of `skills/_shared/competitor-research.md`, before the VIBE_GATE block if present:

```markdown
### Atomic Decomposition

This protocol processes enumerable items. When the qualified competitor count exceeds the threshold, invoke the decomposer agent.

- **Item type:** Qualified competitors
- **Enumeration source:** list (from Phase 2 qualification table)
- **Enumeration hint:** Count rows in the Phase 2 qualification table
- **Threshold:** 5 (use atomic decomposition when N > 5)
- **Task mode:** read_only
```

- [ ] **Step 2: Update emmet**

Add to `skills/emmet/SKILL.md`:

```markdown
### Atomic Decomposition

When auditing multiple files or components, invoke the decomposer agent.

- **Item type:** Files or components to audit
- **Enumeration source:** file
- **Enumeration hint:** `find {src_dir} -name '*.{ext}' -type f`
- **Threshold:** 10 (use atomic decomposition when N > 10)
- **Task mode:** read_only
```

- [ ] **Step 3: Update seurat**

Add to `skills/seurat/SKILL.md`:

```markdown
### Atomic Decomposition

When auditing WCAG compliance across multiple components, invoke the decomposer agent.

- **Item type:** UI components
- **Enumeration source:** file
- **Enumeration hint:** `find {component_dir} -name '*.tsx' -o -name '*.vue' -o -name '*.svelte' | head -50`
- **Threshold:** 10 (use atomic decomposition when N > 10)
- **Task mode:** read_only
```

- [ ] **Step 4: Update ghostwriter**

Add to `skills/ghostwriter/SKILL.md` (or appropriate location):

```markdown
### Atomic Decomposition

When analyzing multiple pages for SEO/GEO optimization, invoke the decomposer agent.

- **Item type:** Pages or URLs to analyze
- **Enumeration source:** list (from sitemap or user-provided URLs)
- **Enumeration hint:** Count URLs in the analysis target list
- **Threshold:** 5 (use atomic decomposition when N > 5)
- **Task mode:** read_only
```

- [ ] **Step 5: Update baptist**

Add to `skills/baptist/SKILL.md`:

```markdown
### Atomic Decomposition

When analyzing multiple funnel steps or conversion points, invoke the decomposer agent.

- **Item type:** Funnel steps or pages
- **Enumeration source:** list or structure
- **Enumeration hint:** Count steps in the funnel definition
- **Threshold:** 5 (use atomic decomposition when N > 5)
- **Task mode:** read_only
```

- [ ] **Step 6: Commit**

```bash
git add skills/_shared/competitor-research.md skills/emmet/SKILL.md skills/seurat/SKILL.md skills/ghostwriter/SKILL.md skills/baptist/SKILL.md
git commit -m "feat(atomic): add decomposition declarations to 5 skills"
```

---

## Dependency Graph

```
Task 1 (schema/protocol) ──→ Task 2 (orchestrator)
                          ──→ Task 3 (manifest validator)
                          ──→ Task 4 (output verifier)
                          ──→ Task 5 (decomposer agent)
                          ──→ Task 6 (enforcement hook)

Tasks 2-6 are independent of each other (all depend only on Task 1)

Task 7 (integration test) depends on Tasks 2, 3, 4, 5
Task 8 (skill updates) depends on Task 1 only
```

Tasks 2-6 and Task 8 can run in parallel after Task 1.
Task 7 requires Tasks 2-5 to be complete.

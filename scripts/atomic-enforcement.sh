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

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Phase A: Validate manifest (if not already validated)
VALIDATED_FLAG="/tmp/vibe-atomic-validated-${SESSION_ID}"
if [[ ! -f "$VALIDATED_FLAG" ]]; then
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
  if ! "$SCRIPT_DIR/atomic-verify-output.sh" "$FINAL" "$TOTAL" 2>/dev/null; then
    ACTUAL=$(grep -c '<!-- /ITEM-' "$FINAL" 2>/dev/null || echo 0)
    cat >&2 << BLOCK
VIBE ATOMIC ENFORCEMENT — Output incomplete.

Expected: $TOTAL items
Found: $ACTUAL items

The atomic orchestrator did not produce all expected items.
BLOCK
    exit 2
  fi
fi

exit 0

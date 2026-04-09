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

# Count closing ITEM markers (one per item)
ITEM_COUNT=$(grep -c '<!-- /ITEM-' "$OUTPUT" 2>/dev/null || echo 0)

if [[ "$ITEM_COUNT" -ge "$EXPECTED" ]]; then
  echo "Output verified: ${ITEM_COUNT}/${EXPECTED} items present"
  exit 0
else
  echo "Output incomplete: ${ITEM_COUNT}/${EXPECTED} items present" >&2
  for i in $(seq 1 "$EXPECTED"); do
    if ! grep -q "<!-- ITEM-${i} -->" "$OUTPUT"; then
      echo "  Missing: ITEM-${i}" >&2
    fi
  done
  exit 2
fi

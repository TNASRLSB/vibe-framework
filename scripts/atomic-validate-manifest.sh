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

# Check required fields
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

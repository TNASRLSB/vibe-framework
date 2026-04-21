#!/usr/bin/env bash
# Validates all skill and agent frontmatter against required schema.
# Run as part of test suite or CI.
# Exit 0 = all valid, Exit 1 = validation errors found.

set -uo pipefail

# --- Single-file validation mode (VIBE 5.4.0) --------------------------------
# When called with a file argument, validate that file's model: block and exit.
if [[ $# -ge 1 && -f "$1" ]]; then
  FILE="$1"

# --- Optional model block validation (VIBE 5.4.0) ------------------------
python3 <<PYEOF
import re, sys, yaml

path = "$FILE"
with open(path) as f:
    content = f.read()

m = re.match(r"---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
if not m:
    sys.exit(0)  # no frontmatter, nothing to validate here

try:
    fm = yaml.safe_load(m.group(1)) or {}
except Exception as e:
    sys.stderr.write(f"validate-frontmatter: YAML parse error: {e}\n")
    sys.exit(1)

model = fm.get("model")
if model is None:
    sys.exit(0)  # model block is optional

if not isinstance(model, dict):
    sys.stderr.write("validate-frontmatter: 'model' must be a mapping\n")
    sys.exit(1)

KNOWN_MODELS = {"opus-4-7", "opus-4-6", "sonnet-4-6", "haiku-4-5"}
EFFORT_LEVELS = {"low", "medium", "high", "xhigh", "max"}

primary = model.get("primary")
effort = model.get("effort")

if primary not in KNOWN_MODELS:
    sys.stderr.write(f"validate-frontmatter: model.primary '{primary}' not in {sorted(KNOWN_MODELS)}\n")
    sys.exit(1)
if effort not in EFFORT_LEVELS:
    sys.stderr.write(f"validate-frontmatter: model.effort '{effort}' not in {sorted(EFFORT_LEVELS)}\n")
    sys.exit(1)
PYEOF
  [[ $? -eq 0 ]] || exit 1
  exit 0
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
ERRORS=()
WARNINGS=()

# Required fields for domain skills (those with model set)
SKILL_REQUIRED_FIELDS=("name" "description" "effort" "model" "whenToUse" "argumentHint" "maxTokenBudget")
# Required fields for utility skills (disable-model-invocation: true)
UTILITY_REQUIRED_FIELDS=("name" "description" "whenToUse")
# Required fields for agents
AGENT_REQUIRED_FIELDS=("name" "description" "tools" "memory" "effort" "model" "memoryScope")

validate_yaml_field() {
  local file="$1"
  local field="$2"
  local content
  # Extract only the first frontmatter block (between first and second ---)
  content=$(awk 'NR==1 && /^---$/{n++; next} /^---$/{exit} n==1{print}' "$file")
  if ! echo "$content" | grep -qP "^${field}:"; then
    return 1
  fi
  return 0
}

# Validate skills
for skill_dir in "$PLUGIN_ROOT"/skills/*/; do
  # Skip shared resources directory
  [[ "$(basename "$skill_dir")" == "_shared" ]] && continue

  skill_file="${skill_dir}SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    ERRORS+=("MISSING: ${skill_dir} has no SKILL.md")
    continue
  fi

  skill_name=$(basename "$skill_dir")

  # Determine if it's a utility skill
  is_utility=false
  if sed -n '/^---$/,/^---$/p' "$skill_file" | grep -q 'disable-model-invocation: true'; then
    is_utility=true
  fi

  if [[ "$is_utility" == "true" ]]; then
    for field in "${UTILITY_REQUIRED_FIELDS[@]}"; do
      if ! validate_yaml_field "$skill_file" "$field"; then
        ERRORS+=("SKILL ${skill_name}: missing required field '${field}'")
      fi
    done
  else
    for field in "${SKILL_REQUIRED_FIELDS[@]}"; do
      if ! validate_yaml_field "$skill_file" "$field"; then
        ERRORS+=("SKILL ${skill_name}: missing required field '${field}'")
      fi
    done
  fi

  # Validate maxTokenBudget is a number if present
  if validate_yaml_field "$skill_file" "maxTokenBudget"; then
    budget=$(awk 'NR==1 && /^---$/{n++; next} /^---$/{exit} n==1{print}' "$skill_file" | grep '^maxTokenBudget:' | head -1 | sed 's/maxTokenBudget:\s*//' | tr -d ' \r\n')
    if ! [[ "$budget" =~ ^[0-9]+$ ]]; then
      ERRORS+=("SKILL ${skill_name}: maxTokenBudget must be a number, got '${budget}'")
    fi
  fi

  # Validate model is valid
  if validate_yaml_field "$skill_file" "model"; then
    model=$(awk 'NR==1 && /^---$/{n++; next} /^---$/{exit} n==1{print}' "$skill_file" | grep '^model:' | head -1 | sed 's/model:\s*//' | tr -d ' \r\n')
    case "$model" in
      opus|sonnet|haiku) ;;
      *) WARNINGS+=("SKILL ${skill_name}: unusual model '${model}' (expected opus|sonnet|haiku)") ;;
    esac
  fi

  # Validate skill length
  line_count=$(wc -l < "$skill_file")
  if (( line_count > 500 )); then
    WARNINGS+=("SKILL ${skill_name}: ${line_count} lines (recommended max: 500)")
  fi
done

# Validate agents
for agent_file in "$PLUGIN_ROOT"/agents/*.md; do
  if [[ ! -f "$agent_file" ]]; then continue; fi
  agent_name=$(basename "$agent_file" .md)

  for field in "${AGENT_REQUIRED_FIELDS[@]}"; do
    if ! validate_yaml_field "$agent_file" "$field"; then
      ERRORS+=("AGENT ${agent_name}: missing required field '${field}'")
    fi
  done

  # Validate memoryScope
  if validate_yaml_field "$agent_file" "memoryScope"; then
    scope=$(awk 'NR==1 && /^---$/{n++; next} /^---$/{exit} n==1{print}' "$agent_file" | grep '^memoryScope:' | head -1 | sed 's/memoryScope:\s*//' | tr -d ' \r\n')
    case "$scope" in
      user|project|local) ;;
      *) ERRORS+=("AGENT ${agent_name}: invalid memoryScope '${scope}' (expected user|project|local)") ;;
    esac
  fi
done

# Report
echo "=== Frontmatter Validation ==="
echo ""

if [[ ${#ERRORS[@]} -eq 0 ]] && [[ ${#WARNINGS[@]} -eq 0 ]]; then
  echo "All frontmatter valid."
  exit 0
fi

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo "ERRORS (${#ERRORS[@]}):"
  for err in "${ERRORS[@]}"; do
    echo "  ERROR: ${err}"
  done
  echo ""
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo "WARNINGS (${#WARNINGS[@]}):"
  for warn in "${WARNINGS[@]}"; do
    echo "  WARN: ${warn}"
  done
  echo ""
fi

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  exit 1
fi
exit 0

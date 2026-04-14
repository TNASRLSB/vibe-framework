#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Runs the appropriate linter on the edited file.
# Exit 0 = pass/no linter, Exit 2 = lint failure (blocks action).

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Check pause flag
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Extract file path from tool_input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Skip if file doesn't exist (was deleted or is a new write that hasn't landed yet)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Detect linter by extension
EXT="${FILE_PATH##*.}"
LINT_CMD=""
LINT_ARGS=""

case "$EXT" in
  js|jsx|ts|tsx|mjs|cjs)
    if command -v eslint >/dev/null 2>&1; then
      LINT_CMD="eslint"
      LINT_ARGS="--no-error-on-unmatched-pattern"
    elif command -v prettier >/dev/null 2>&1; then
      LINT_CMD="prettier"
      LINT_ARGS="--check"
    fi
    ;;
  py)
    if command -v ruff >/dev/null 2>&1; then
      LINT_CMD="ruff"
      LINT_ARGS="check"
    elif command -v black >/dev/null 2>&1; then
      LINT_CMD="black"
      LINT_ARGS="--check"
    fi
    ;;
  rs)
    if command -v rustfmt >/dev/null 2>&1; then
      LINT_CMD="rustfmt"
      LINT_ARGS="--check"
    fi
    ;;
  go)
    if command -v gofmt >/dev/null 2>&1; then
      LINT_CMD="gofmt"
      LINT_ARGS="-l"
    fi
    ;;
  *)
    # No linter for this extension
    exit 0
    ;;
esac

# No linter available
if [[ -z "$LINT_CMD" ]]; then
  exit 0
fi

# Run linter
LINT_OUTPUT=$($LINT_CMD $LINT_ARGS "$FILE_PATH" 2>&1)
LINT_EXIT=$?

# Special case: gofmt -l outputs filenames if formatting needed (exit 0 but output means fail)
if [[ "$LINT_CMD" == "gofmt" ]] && [[ -n "$LINT_OUTPUT" ]]; then
  echo "Lint failed (${LINT_CMD}): file needs formatting" >&2
  echo "$LINT_OUTPUT" >&2
  exit 2
fi

if [[ $LINT_EXIT -ne 0 ]]; then
  echo "Lint failed (${LINT_CMD}):" >&2
  echo "$LINT_OUTPUT" >&2
  exit 2
fi

exit 0

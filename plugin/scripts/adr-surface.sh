#!/usr/bin/env bash
# VIBE Framework — ADR surface hook (5.7.0)
# Surfaces ADR-style markers (WHY/DECISION/TRADEOFF/RATIONALE/ADR/REJECTED:)
# from the file targeted by Read or Edit/Write, as PreToolUse additionalContext.
#
# Bypass:
#   VIBE_NO_ADR_SURFACE=1               skip silently
#   /tmp/vibe-paused-${SESSION_ID}      skip silently
#
# Output: PreToolUse JSON with additionalContext, or silent exit 0 if no
# markers / file missing / bypassed.

set -uo pipefail

[[ "${VIBE_NO_ADR_SURFACE:-0}" == "1" ]] && exit 0

INPUT="$(cat)"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[[ -n "$SESSION_ID" && -f "/tmp/vibe-paused-${SESSION_ID}" ]] && exit 0

FILE="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

# -n line numbers, -I skip binary, -E extended, -i case-insensitive.
# Cap at 10 markers per file.
MARKERS="$(grep -nIEi '\b(WHY|DECISION|TRADEOFF|RATIONALE|ADR|REJECTED):' "$FILE" 2>/dev/null | head -10)"
[[ -z "$MARKERS" ]] && exit 0

# Format: "  L<line>: <text>" with 120-char truncation per line.
FORMATTED="$(echo "$MARKERS" | awk '
{
  # split off leading "<line>:" prefix produced by grep -n
  match($0, /^[0-9]+:/)
  line = substr($0, 1, RLENGTH - 1)
  text = substr($0, RLENGTH + 1)
  # strip leading whitespace from source content
  sub(/^[[:space:]]+/, "", text)
  if (length(text) > 120) text = substr(text, 1, 117) "..."
  printf "  L%s: %s\n", line, text
}')"

jq -n --arg file "$FILE" --arg markers "$FORMATTED" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: ("ADR markers in " + $file + ":\n" + $markers)
  }
}'

exit 0

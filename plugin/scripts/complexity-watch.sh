#!/usr/bin/env bash
# VIBE Framework — Complexity watch hook (5.7.0)
# Fires after Edit/Write. Computes max cyclomatic complexity (CCN) on the
# edited file, emits warning if max(CCN) > 10 OR delta vs cached baseline > +3.
# Graceful skip if lizard missing or file extension unsupported.
#
# Bypass:
#   VIBE_NO_CC_WATCH=1                   skip silently
#   /tmp/vibe-paused-${SESSION_ID}       skip silently
#
# Field-observation rationale: low CCN ≈ ~30% lower input-token spend on
# follow-up turns (high-CCN code triggers more re-Read/re-Grep iterations,
# which accumulate post-cache-boundary).

set -uo pipefail

[[ "${VIBE_NO_CC_WATCH:-0}" == "1" ]] && exit 0

INPUT="$(cat)"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[[ -n "$SESSION_ID" && -f "/tmp/vibe-paused-${SESSION_ID}" ]] && exit 0

FILE="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

# Skip non-source / data extensions — lizard supports source code only
case "$FILE" in
  *.md|*.markdown|*.json|*.yaml|*.yml|*.toml|*.txt|*.html|*.htm|*.css|*.scss|*.less|*.xml|*.svg|*.lock|*.log|*.csv|*.tsv|*.ini|*.env|*.gitignore) exit 0 ;;
esac

# Graceful-skip when lizard absent
command -v lizard >/dev/null 2>&1 || exit 0

# Disable lizard's built-in warning thresholds so we read raw values
LIZARD_OUT="$(lizard --csv -C 1000 -L 1000 -a 1000 "$FILE" 2>/dev/null)"
[[ -z "$LIZARD_OUT" ]] && exit 0

# Parse CSV: field 2 = CCN, field 6 = Location ("name@start-end@file").
# Fields 1-6 are guaranteed comma-free (numeric or quoted-without-commas);
# field 9+ (Long_Name with arg list) may have internal commas — we ignore them.
RESULT="$(echo "$LIZARD_OUT" | awk -F, '
{
  if ($2 !~ /^[0-9]+$/) next
  ccn = $2 + 0
  loc = $6; gsub(/"/, "", loc)
  split(loc, parts, "@")
  if (ccn > max_ccn) { max_ccn = ccn; worst = parts[1] }
}
END { if (max_ccn > 0) print max_ccn "\t" worst }')"

[[ -z "$RESULT" ]] && exit 0
MAX_CCN="$(echo "$RESULT" | cut -f1)"
WORST_FN="$(echo "$RESULT" | cut -f2)"
[[ -z "${MAX_CCN:-}" ]] && exit 0

# Baseline cache
BASE_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugin-data/vibe}/complexity-baselines"
mkdir -p "$BASE_DIR" 2>/dev/null || exit 0
HASH="$(printf '%s' "$FILE" | sha1sum | cut -d' ' -f1)"
BASE_FILE="$BASE_DIR/$HASH.json"

PRIOR_CCN=0
HAS_BASELINE=0
if [[ -f "$BASE_FILE" ]]; then
  PRIOR_CCN="$(jq -r '.max_ccn // 0' "$BASE_FILE" 2>/dev/null)"
  [[ "$PRIOR_CCN" =~ ^[0-9]+$ ]] || PRIOR_CCN=0
  [[ "$PRIOR_CCN" -gt 0 ]] && HAS_BASELINE=1
fi
DELTA=$((MAX_CCN - PRIOR_CCN))

# Update baseline (atomic via tmp+mv to avoid partial writes on crash)
NOW="$(date -Iseconds 2>/dev/null || date)"
jq -n --arg file "$FILE" --argjson cc "$MAX_CCN" --arg ts "$NOW" \
  '{file:$file, max_ccn:$cc, updated:$ts}' > "${BASE_FILE}.tmp" 2>/dev/null \
  && mv "${BASE_FILE}.tmp" "$BASE_FILE" 2>/dev/null

# Decide whether to warn. Delta gate only applies once a baseline exists —
# the first edit of a file is silent unless absolute threshold trips.
WARN=0
[[ "$MAX_CCN" -gt 10 ]] && WARN=1
[[ "$HAS_BASELINE" -eq 1 && "$DELTA" -gt 3 ]] && WARN=1
[[ "$WARN" -eq 0 ]] && exit 0

# Build warning message
if [[ "$PRIOR_CCN" -gt 0 && "$DELTA" -gt 0 ]]; then
  DETAIL="${WORST_FN}() — CCN ${MAX_CCN} (was ${PRIOR_CCN}, +${DELTA})"
else
  DETAIL="${WORST_FN}() — CCN ${MAX_CCN}"
fi

MSG="Complexity watch on ${FILE}:
  ${DETAIL}
  Threshold: 10. Refactor to flatten branches before next edit, or accept the cost. Rationale: high CCN inflates input-token spend on follow-up turns by ~30% (field observation, see 5.7.0 spec §4.5)."

jq -n --arg msg "$MSG" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $msg
  }
}'

exit 0

#!/usr/bin/env bash
# VIBE Framework — Grep/Glob enrichment hook (5.7.0)
# PreToolUse hook on Grep|Glob. Emits the top-3 files in the project that
# match the pattern, ranked by combined signal:
#   A. path match     (git ls-files | grep -iF <simplified pattern>)
#   B. content match  (rg --files-with-matches -i <pattern>)
#   C. churn          (git log --since=90.days -- <file> | wc -l)
# Combined score = path?10 : 0 + content?5 : 0 + churn.
#
# Bypass:
#   VIBE_NO_GREP_ENRICH=1                  skip silently
#   /tmp/vibe-paused-${SESSION_ID}         skip silently
#
# Failure modes (handled):
#   - Non-git directory → skip signals A+C, only signal B (rg) used.
#   - ripgrep absent     → skip signal B, only signal A used.
#   - Both off / no hits → silent exit 0.
#   - Per-signal 500 ms timeout → that signal is dropped.

set -uo pipefail

[[ "${VIBE_NO_GREP_ENRICH:-0}" == "1" ]] && exit 0

INPUT="$(cat)"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[[ -n "$SESSION_ID" && -f "/tmp/vibe-paused-${SESSION_ID}" ]] && exit 0

PATTERN="$(echo "$INPUT" | jq -r '.tool_input.pattern // empty' 2>/dev/null)"
[[ -z "$PATTERN" ]] && exit 0

CWD="$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)"
[[ -z "$CWD" ]] && CWD="$(pwd)"
[[ ! -d "$CWD" ]] && exit 0

# Detect git repo
IS_GIT=0
git -C "$CWD" rev-parse --git-dir >/dev/null 2>&1 && IS_GIT=1

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
PATH_HITS="$WORK/path"
CONTENT_HITS="$WORK/content"
UNION="$WORK/union"
SCORES="$WORK/scores"
: > "$PATH_HITS"; : > "$CONTENT_HITS"; : > "$UNION"; : > "$SCORES"

# Simplified pattern for path-substring search (strip regex metas)
SIMPLE="$(printf '%s' "$PATTERN" | sed 's/[^[:alnum:]_./-]//g')"
[[ -z "$SIMPLE" ]] && SIMPLE="$PATTERN"

# --- Signal A: path matches via git ls-files ---
if [[ $IS_GIT -eq 1 ]]; then
  timeout 0.5 git -C "$CWD" ls-files 2>/dev/null \
    | grep -iF -- "$SIMPLE" 2>/dev/null \
    | head -100 > "$PATH_HITS" || true
fi

# --- Signal B: content matches via ripgrep ---
if command -v rg >/dev/null 2>&1; then
  ( cd "$CWD" && timeout 0.5 rg --files-with-matches --max-count 1 -i -- "$PATTERN" . 2>/dev/null \
    | sed 's|^\./||' \
    | head -100 ) > "$CONTENT_HITS" || true
fi

# Union (relative paths only)
sort -u "$PATH_HITS" "$CONTENT_HITS" 2>/dev/null > "$UNION"
[[ ! -s "$UNION" ]] && exit 0

# Score each file (no associative arrays — bash 3.2 compat)
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  SCORE=0
  LABEL=""
  if grep -q -F -x -- "$f" "$PATH_HITS" 2>/dev/null; then
    SCORE=$((SCORE + 10))
    LABEL="path match"
  fi
  if grep -q -F -x -- "$f" "$CONTENT_HITS" 2>/dev/null; then
    SCORE=$((SCORE + 5))
    if [[ -n "$LABEL" ]]; then
      LABEL="path+content match"
    else
      LABEL="content match"
    fi
  fi
  CHURN=0
  if [[ $IS_GIT -eq 1 ]]; then
    CHURN="$(timeout 0.5 git -C "$CWD" log --since="90 days ago" --format=%H -- "$f" 2>/dev/null | wc -l | tr -d ' ')"
    [[ -z "$CHURN" || ! "$CHURN" =~ ^[0-9]+$ ]] && CHURN=0
  fi
  SCORE=$((SCORE + CHURN))
  printf '%d\t%d\t%s\t%s\n' "$SCORE" "$CHURN" "$LABEL" "$f" >> "$SCORES"
done < "$UNION"

[[ ! -s "$SCORES" ]] && exit 0

TOP="$(sort -t$'\t' -k1,1 -nr "$SCORES" | head -3)"
[[ -z "$TOP" ]] && exit 0

FORMATTED="$(printf '%s' "$TOP" | awk -F'\t' '
{ printf "  %s (%s commits, 90d) — %s\n", $4, $2, $3 }')"

HEADER="Top files matching pattern \"$PATTERN\" by churn:"

jq -n --arg header "$HEADER" --arg body "$FORMATTED" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: ($header + "\n" + $body)
  }
}'

exit 0

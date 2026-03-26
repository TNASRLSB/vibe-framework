#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Quick security scan for common vulnerability patterns.
# Exit 0 = clean, Exit 2 = issues found (blocks action).

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

# Skip if file doesn't exist
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Skip non-source files by extension
EXT="${FILE_PATH##*.}"
case "$EXT" in
  md|txt|json|yaml|yml|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|map|lock|toml|cfg|ini|csv|xml|html)
    exit 0
    ;;
esac

# Read file content
CONTENT=$(cat "$FILE_PATH")

ISSUES=()

# Pattern 1: Hardcoded API keys starting with sk-
if echo "$CONTENT" | grep -nP 'sk-[a-zA-Z0-9]{20,}' >/dev/null 2>&1; then
  ISSUES+=("Possible hardcoded API key (sk-*) detected")
fi

# Pattern 2: api_key= with a value
if echo "$CONTENT" | grep -nPi 'api_key\s*=\s*["\x27][^"\x27]{8,}' >/dev/null 2>&1; then
  ISSUES+=("Possible hardcoded api_key assignment detected")
fi

# Pattern 3: Bearer token hardcoded
if echo "$CONTENT" | grep -nPi 'Bearer\s+[a-zA-Z0-9_\-\.]{20,}' >/dev/null 2>&1; then
  ISSUES+=("Possible hardcoded Bearer token detected")
fi

# Pattern 4: dangerouslySetInnerHTML
if echo "$CONTENT" | grep -nF 'dangerouslySetInnerHTML' >/dev/null 2>&1; then
  ISSUES+=("dangerouslySetInnerHTML usage detected — XSS risk")
fi

# Pattern 5: USING (true) — public database policy (Supabase/Firebase)
if echo "$CONTENT" | grep -nPi 'USING\s*\(\s*true\s*\)' >/dev/null 2>&1; then
  ISSUES+=("USING(true) detected — public database access, add proper RLS conditions")
fi

# Pattern 6: eval() usage
if echo "$CONTENT" | grep -nP '\beval\s*\(' >/dev/null 2>&1; then
  ISSUES+=("eval() usage detected — code injection risk")
fi

# Pattern 7: Hardcoded passwords
if echo "$CONTENT" | grep -nPi 'password\s*=\s*["\x27][^"\x27]{4,}' >/dev/null 2>&1; then
  ISSUES+=("Possible hardcoded password detected")
fi

# Pattern 8: Public S3 ACL
if echo "$CONTENT" | grep -nPi 'acl.*public-read|public-read.*acl' >/dev/null 2>&1; then
  ISSUES+=("Public S3 ACL detected — data exposure risk")
fi

# Pattern 9: --no-verify in git commands
if echo "$CONTENT" | grep -nF -- '--no-verify' >/dev/null 2>&1; then
  ISSUES+=("--no-verify flag detected — bypasses git hooks safety checks")
fi

# Report results
if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo "Security scan found issues in ${FILE_PATH}:" >&2
  for issue in "${ISSUES[@]}"; do
    echo "  - ${issue}" >&2
  done
  exit 2
fi

exit 0

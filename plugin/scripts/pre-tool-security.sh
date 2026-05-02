#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# Proactive security check BEFORE tool execution.
# Validates bash commands before they run, not after.
# Exit 0 = allow, Exit 2 = block.

set -uo pipefail

INPUT=$(cat)

# Check pause flag
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

ISSUES=()

# Check 1: Dangerous rm commands (with /tmp, /var/tmp, /dev/shm whitelist).
# Plain regex `(/|...)` matched any leading `/`, including legitimate
# /tmp cleanup like `rm -rf /tmp/test-fixture`. Now we check that EVERY
# path argument lives under a sanctioned ephemeral root before allowing.
# If any path is outside the whitelist (or the command is malformed),
# block and surface the issue.
#
# Scope discipline: the rm-context is reset on every newline AND on every
# shell separator (&&, ||, ;). Without this, a multi-line command like
#   rm -f /tmp/foo
#   cd "/path/with spaces/proj"
# would treat `cd`, `/path/with`, `spaces/proj` as path-arguments of the
# preceding `rm` and false-positive-block on the unquoted-looking tokens.
# This fixes a 5.6.x regression that surfaced on projects with spaces in
# their absolute paths.
if echo "$COMMAND" | grep -qP 'rm\s+(-[rfRF]+\s+)*(/|~|\$HOME|\.\./)' 2>/dev/null; then
  # Pre-process: surround shell separators (&&, ||, ;) with whitespace so
  # awk sees them as standalone tokens. Without this, "foo&&" is one token
  # and the rm-context never resets.
  rm_verdict=$(echo "$COMMAND" \
    | sed -E -e 's/(\&\&|\|\|)/ \1 /g' -e 's/;/ ; /g' \
    | awk '
    BEGIN { has_unsafe_rm = 0 }
    {
      in_rm = 0
      for (i = 1; i <= NF; i++) {
        tok = $i
        # Shell separator → close current rm context
        if (tok == "&&" || tok == "||" || tok == ";") { in_rm = 0; continue }
        # Strip residual op chars glued to other tokens (rare after sed)
        sub(/[;&|<>].*$/, "", tok)
        if (tok == "") continue
        if (tok == "rm") { in_rm = 1; continue }
        if (!in_rm) continue
        if (substr(tok, 1, 1) == "-") continue           # flag
        # Whitelisted ephemeral roots
        if (tok ~ /^\/tmp\//      || tok == "/tmp")      continue
        if (tok ~ /^\/var\/tmp\// || tok == "/var/tmp")  continue
        if (tok ~ /^\/dev\/shm\// || tok == "/dev/shm")  continue
        has_unsafe_rm = 1
      }
    }
    END {
      if (has_unsafe_rm) print "UNSAFE"
      else print "SAFE"
    }
  ')
  if [[ "$rm_verdict" != "SAFE" ]]; then
    ISSUES+=("Dangerous rm targeting root, home, or parent directory")
  fi
fi

# Check 2: Git force push to main/master
if echo "$COMMAND" | grep -qP 'git\s+push\s+.*--force.*\s+(main|master)' 2>/dev/null; then
  ISSUES+=("Force push to main/master branch — data loss risk")
fi
if echo "$COMMAND" | grep -qP 'git\s+push\s+.*\s+(main|master)\s+.*--force' 2>/dev/null; then
  ISSUES+=("Force push to main/master branch — data loss risk")
fi

# Check 3: Destructive git operations
if echo "$COMMAND" | grep -qP 'git\s+(reset\s+--hard|clean\s+-[fdx]+|checkout\s+--\s+\.)' 2>/dev/null; then
  ISSUES+=("Destructive git operation — potential loss of uncommitted work")
fi

# Check 4: curl piped to shell
if echo "$COMMAND" | grep -qP 'curl\s+.*\|\s*(ba)?sh' 2>/dev/null; then
  ISSUES+=("curl piped to shell — remote code execution risk")
fi
if echo "$COMMAND" | grep -qP 'wget\s+.*\|\s*(ba)?sh' 2>/dev/null; then
  ISSUES+=("wget piped to shell — remote code execution risk")
fi

# Check 5: chmod 777
if echo "$COMMAND" | grep -qP 'chmod\s+777' 2>/dev/null; then
  ISSUES+=("chmod 777 — world-writable permissions, security risk")
fi

# Check 6: Disk-filling operations
if echo "$COMMAND" | grep -qP '(dd\s+if=/dev/zero|yes\s*\||fork\s*bomb|:\(\)\{)' 2>/dev/null; then
  ISSUES+=("Potential disk-filling or fork bomb operation")
fi

# Check 7: Network exfiltration patterns
if echo "$COMMAND" | grep -qP 'nc\s+-l|ncat\s+-l|socat\s+' 2>/dev/null; then
  ISSUES+=("Network listener detected — potential data exfiltration")
fi

# Check 8: Credential file access
if echo "$COMMAND" | grep -qP '(cat|head|tail|less|more)\s+.*(\.env|credentials|\.aws/credentials|\.ssh/id_)' 2>/dev/null; then
  ISSUES+=("Reading credential file — ensure this is intentional")
fi

# Check 9: Database drop operations
if echo "$COMMAND" | grep -qiP '(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\s+TABLE)' 2>/dev/null; then
  ISSUES+=("Database destructive operation (DROP/TRUNCATE)")
fi

# Check 10: Kill all processes
if echo "$COMMAND" | grep -qP 'kill\s+-9\s+(-1|0)' 2>/dev/null; then
  ISSUES+=("Kill all processes signal — system disruption risk")
fi

if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo "PreToolUse security check BLOCKED command:" >&2
  echo "  Command: ${COMMAND:0:200}" >&2
  for issue in "${ISSUES[@]}"; do
    echo "  - ${issue}" >&2
  done
  echo "" >&2
  echo "If this command is intentional, use /vibe:pause to temporarily disable security hooks." >&2
  exit 2
fi

exit 0

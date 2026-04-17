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
if echo "$COMMAND" | grep -qP 'rm\s+(-[rfRF]+\s+)*(/|~|\$HOME|\.\./)' 2>/dev/null; then
  rm_verdict=$(echo "$COMMAND" | awk '
    BEGIN { found_rm = 0; saw_path = 0; all_safe = 1 }
    {
      for (i = 1; i <= NF; i++) {
        tok = $i
        # Strip trailing semicolon/operator chars that bash glues
        sub(/[;&|<>].*$/, "", tok)
        if (tok == "") continue
        if (tok == "rm") { found_rm = 1; continue }
        if (!found_rm) continue
        if (substr(tok, 1, 1) == "-") continue           # flag
        # Stop scanning when shell separator hit (next command)
        if (tok ~ /^(&&|\|\||;)$/) break
        saw_path = 1
        # Whitelisted ephemeral roots
        if (tok ~ /^\/tmp\//      || tok == "/tmp")      continue
        if (tok ~ /^\/var\/tmp\// || tok == "/var/tmp")  continue
        if (tok ~ /^\/dev\/shm\// || tok == "/dev/shm")  continue
        all_safe = 0; break
      }
    }
    END {
      if (found_rm && saw_path && all_safe) print "SAFE"
      else print "UNSAFE"
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

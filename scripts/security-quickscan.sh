#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write)
# Quick security scan for 31 vulnerability patterns (9 original + 22 from Claude Code reference).
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

# Skip all VIBE scripts (pattern strings cause false positives)
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
if [[ "$FILE_PATH" == "${PLUGIN_ROOT}/scripts/"* ]]; then
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

# --- NEW PATTERNS (v3.4 — from Claude Code reference) ---

# Pattern 10: Command substitution in strings (shell injection vector)
if echo "$CONTENT" | grep -nP '\$\([^)]+\)' >/dev/null 2>&1; then
  # Skip if it's a shell script (expected usage)
  if [[ "$EXT" != "sh" && "$EXT" != "bash" && "$EXT" != "zsh" ]]; then
    ISSUES+=("Command substitution \$() in non-shell file — potential shell injection")
  fi
fi

# Pattern 11: Zsh module loading (invisible execution)
if echo "$CONTENT" | grep -nP '\b(zmodload|zpty|ztcp|zsocket)\b' >/dev/null 2>&1; then
  ISSUES+=("Zsh module command detected (zmodload/zpty/ztcp/zsocket) — module-based attack vector")
fi

# Pattern 12: IFS manipulation (word splitting bypass) — skip shell scripts
if echo "$CONTENT" | grep -nP '\bIFS\s*=' >/dev/null 2>&1; then
  if [[ "$EXT" != "sh" && "$EXT" != "bash" && "$EXT" != "zsh" ]]; then
    ISSUES+=("IFS variable manipulation detected — potential word splitting bypass")
  fi
fi

# Pattern 13: Unicode whitespace obfuscation
if echo "$CONTENT" | grep -nP '[\x{00A0}\x{2000}-\x{200F}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]' >/dev/null 2>&1; then
  ISSUES+=("Unicode whitespace characters detected — possible code obfuscation")
fi

# Pattern 14: Control characters (obfuscation/injection)
if echo "$CONTENT" | grep -nP '[\x00-\x08\x0E-\x1F\x7F]' >/dev/null 2>&1; then
  ISSUES+=("Control characters detected — possible obfuscation or injection vector")
fi

# Pattern 15: /proc environ access (credential exfiltration)
if echo "$CONTENT" | grep -nP '/proc/[^/]*/environ' >/dev/null 2>&1; then
  ISSUES+=("/proc/*/environ access detected — credential exfiltration risk")
fi

# Pattern 16: rm -rf targeting dangerous paths
if echo "$CONTENT" | grep -nP 'rm\s+-[rfRF]+\s+(/\s|/\b|\$HOME|~/|\.\./\.\.)' >/dev/null 2>&1; then
  ISSUES+=("rm -rf targeting root, home, or parent traversal detected — data loss risk")
fi

# Pattern 17: jq @system (code execution via jq)
if echo "$CONTENT" | grep -nP '\bjq\b.*@system|@system.*\bjq\b|"@system"' >/dev/null 2>&1; then
  ISSUES+=("jq @system function detected — allows arbitrary code execution")
fi

# Pattern 18: Process substitution (hidden execution)
if echo "$CONTENT" | grep -nP '<\(|>\(' >/dev/null 2>&1; then
  if [[ "$EXT" != "sh" && "$EXT" != "bash" && "$EXT" != "zsh" ]]; then
    ISSUES+=("Process substitution <() or >() in non-shell file — hidden execution vector")
  fi
fi

# Pattern 19: Hardcoded private keys
if echo "$CONTENT" | grep -nP -- '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----' >/dev/null 2>&1; then
  ISSUES+=("Private key detected in source file — must be in secrets manager")
fi

# Pattern 20: AWS/GCP/Azure credential patterns
if echo "$CONTENT" | grep -nP 'AKIA[0-9A-Z]{16}' >/dev/null 2>&1; then
  ISSUES+=("AWS Access Key ID detected (AKIA*) — credential exposure risk")
fi
if echo "$CONTENT" | grep -nP 'AIza[0-9A-Za-z_-]{35}' >/dev/null 2>&1; then
  ISSUES+=("Google API key detected (AIza*) — credential exposure risk")
fi

# Pattern 21: Stripe secret keys
if echo "$CONTENT" | grep -nP 'sk_live_[0-9a-zA-Z]{24,}' >/dev/null 2>&1; then
  ISSUES+=("Stripe live secret key detected — critical credential exposure")
fi

# Pattern 22: GitHub tokens
if echo "$CONTENT" | grep -nP '(ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36,}' >/dev/null 2>&1; then
  ISSUES+=("GitHub token detected — credential exposure risk")
fi

# Pattern 23: Slack tokens
if echo "$CONTENT" | grep -nP 'xox[bporas]-[0-9a-zA-Z-]{10,}' >/dev/null 2>&1; then
  ISSUES+=("Slack token detected — credential exposure risk")
fi

# Pattern 24: JWT tokens hardcoded
if echo "$CONTENT" | grep -nP 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.' >/dev/null 2>&1; then
  ISSUES+=("Hardcoded JWT token detected — should be dynamically generated")
fi

# Pattern 25: SQL injection patterns in string interpolation
if echo "$CONTENT" | grep -nP '(SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\$\{' >/dev/null 2>&1; then
  ISSUES+=("SQL with string interpolation detected — SQL injection risk, use parameterized queries")
fi

# Pattern 26: innerHTML assignment (XSS vector)
if echo "$CONTENT" | grep -nP '\.innerHTML\s*=' >/dev/null 2>&1; then
  ISSUES+=("innerHTML assignment detected — XSS risk, use textContent or sanitize")
fi

# Pattern 27: document.write (XSS vector)
if echo "$CONTENT" | grep -nP 'document\.write\s*\(' >/dev/null 2>&1; then
  ISSUES+=("document.write() detected — XSS risk, use DOM manipulation")
fi

# Pattern 28: Disabled SSL verification
if echo "$CONTENT" | grep -nPi 'verify\s*=\s*false|NODE_TLS_REJECT_UNAUTHORIZED.*0|rejectUnauthorized.*false' >/dev/null 2>&1; then
  ISSUES+=("SSL verification disabled — man-in-the-middle attack risk")
fi

# Pattern 29: Pickle deserialization (Python RCE vector)
if echo "$CONTENT" | grep -nP 'pickle\.loads?\s*\(' >/dev/null 2>&1; then
  ISSUES+=("pickle.load() on untrusted data — remote code execution risk")
fi

# Pattern 30: yaml.load without safe_load (Python RCE vector)
if echo "$CONTENT" | grep -nP 'yaml\.load\s*\(' >/dev/null 2>&1; then
  if ! echo "$CONTENT" | grep -nP 'yaml\.safe_load' >/dev/null 2>&1; then
    ISSUES+=("yaml.load() without safe_load — remote code execution risk")
  fi
fi

# Pattern 31: Subprocess with shell=True (Python injection)
if echo "$CONTENT" | grep -nP 'subprocess\.\w+\(.*shell\s*=\s*True' >/dev/null 2>&1; then
  ISSUES+=("subprocess with shell=True — command injection risk")
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

#!/usr/bin/env bash
# ============================================================================
# scope-guard.sh — VIBE PreToolUse hook (Read | Bash)
# ----------------------------------------------------------------------------
# Blocks Read/Bash from accessing paths outside the session project root.
# Mitigation for cross-project scope creep — the case where the agent leaves
# the boundary of the directory the user opened and starts reading/touching
# files in unrelated projects (e.g. another client's .env in the same
# parent directory).
#
# Allowed (default whitelist):
#   - SESSION_ROOT/* (the cwd captured at the first PreToolUse of the session)
#   - /tmp/, /var/tmp/, /dev/shm/
#   - $HOME/.claude/ (memory, plugin cache, settings)
#   - /usr/, /opt/, /etc/, /var/log/
#   - $CLAUDE_PLUGIN_ROOT/
#   - Anything in $SESSION_ROOT/.vibe/scope-allow (one path or prefix per line)
#
# Bypass:
#   - touch /tmp/vibe-paused-${SESSION_ID}  (the standard /vibe:pause flag)
#   - export VIBE_NO_SCOPE_GUARD=1          (per-session disable)
#
# Limitations (intentional MVP):
#   - Paths containing unquoted spaces are not analyzed (best-effort: the
#     hook only inspects literal absolute paths in the command). False
#     negatives possible; false positives avoided.
#   - Variables ($HOME, $CLIENT) inside commands are not resolved.
#   - heredoc / eval / fd-redirected reads not inspected.
#   These are documented gaps — the hook handles the common scope-creep case
#   (find / cat / grep / ls with literal absolute paths) which is what
#   surfaced in the user-reported incident.
#
# Output contract: PreToolUse modern (stdout JSON + exit 0).
# ============================================================================

set -uo pipefail

# --- Disable / bypass ----------------------------------------------------
if [[ "${VIBE_NO_SCOPE_GUARD:-0}" == "1" ]]; then
  exit 0
fi

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
case "$TOOL_NAME" in
  Read|Bash) ;;
  *) exit 0 ;;
esac

CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)

# --- Resolve session root (persisted on first call) ----------------------
ROOT_FILE="/tmp/vibe-session-root-${SESSION_ID:-default}"
if [[ ! -f "$ROOT_FILE" ]] && [[ -n "$CWD" ]]; then
  echo "$CWD" > "$ROOT_FILE" 2>/dev/null || true
fi
SESSION_ROOT=""
if [[ -f "$ROOT_FILE" ]]; then
  SESSION_ROOT=$(cat "$ROOT_FILE" 2>/dev/null || echo "")
fi
# If we can't determine session root, fail-open (don't block)
if [[ -z "$SESSION_ROOT" ]]; then
  exit 0
fi

# --- Build whitelist -----------------------------------------------------
ALLOWED=(
  "${SESSION_ROOT}/"
  "/tmp/"
  "/var/tmp/"
  "/dev/shm/"
  "${HOME}/.claude/"
  "/usr/"
  "/opt/"
  "/etc/"
  "/var/log/"
)
[[ -n "${CLAUDE_PLUGIN_ROOT:-}" ]] && ALLOWED+=("${CLAUDE_PLUGIN_ROOT}/")

# Per-project allow list (one prefix per line; lines starting with # are comments)
ALLOW_FILE="${SESSION_ROOT}/.vibe/scope-allow"
if [[ -f "$ALLOW_FILE" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    [[ "${line:0:1}" == "#" ]] && continue
    ALLOWED+=("$line")
  done < "$ALLOW_FILE"
fi

# --- Path-allowed check (literal-prefix match on resolved absolute path) -
is_allowed() {
  local p="$1"
  # If relative, anchor to session root for resolution
  if [[ "${p:0:1}" != "/" ]]; then
    p="${SESSION_ROOT}/${p}"
  fi
  # Normalize (resolves .. and . without requiring file to exist)
  local abs
  abs=$(realpath -m "$p" 2>/dev/null || echo "$p")
  for prefix in "${ALLOWED[@]}"; do
    # Exact match (file == prefix without trailing slash)
    [[ "$abs" == "${prefix%/}" ]] && return 0
    # Prefix match
    [[ "$abs" == "${prefix}"* ]] && return 0
  done
  return 1
}

# --- Emit deny via PreToolUse modern contract ----------------------------
deny() {
  local path="$1"
  local reason="VIBE scope-guard: ${TOOL_NAME} access to '${path}' is outside the session project root (${SESSION_ROOT}). Cross-project access is blocked to prevent unintentional reads of other projects' files (e.g. credentials in sibling repos).

To allow:
  - Add a prefix to ${ALLOW_FILE} (one path per line)
  - Or run /vibe:pause to disable hooks for this turn
  - Or export VIBE_NO_SCOPE_GUARD=1 for this session"
  REASON="$reason" python3 <<'PYEOF' 2>/dev/null
import json, os
print(json.dumps({
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": os.environ["REASON"]
  }
}))
PYEOF
  exit 0
}

# --- Tool-specific path extraction ---------------------------------------
case "$TOOL_NAME" in
  Read)
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
    [[ -z "$FILE_PATH" ]] && exit 0
    is_allowed "$FILE_PATH" || deny "$FILE_PATH"
    exit 0
    ;;

  Bash)
    COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
    [[ -z "$COMMAND" ]] && exit 0

    # Extract literal absolute paths from the command. We capture three forms:
    #   1. "..." quoted absolute paths (handles spaces)
    #   2. '...' quoted absolute paths
    #   3. Bare absolute paths (no spaces, stops at shell metacharacters)
    # Whitelisted prefixes are skipped without further analysis.
    # Pass $COMMAND via env var to avoid stdin conflict with the heredoc.
    PATHS=$(VIBE_CMD="$COMMAND" python3 <<'PYEOF' 2>/dev/null
import os, re
cmd = os.environ.get("VIBE_CMD", "")
out = set()
# Double-quoted absolute paths
for m in re.finditer(r'"(/[^"\n]+)"', cmd):
    out.add(m.group(1))
# Single-quoted absolute paths
for m in re.finditer(r"'(/[^'\n]+)'", cmd):
    out.add(m.group(1))
# Bare absolute paths (no whitespace, stops at shell ops)
for m in re.finditer(r'(?:^|[\s=:`(])(/[A-Za-z0-9_][^\s\'";|&<>$()`]*)', cmd):
    out.add(m.group(1))
for p in sorted(out):
    print(p)
PYEOF
)
    [[ -z "$PATHS" ]] && exit 0

    while IFS= read -r p; do
      [[ -z "$p" ]] && continue
      # Drop trailing punctuation that bash glues
      p="${p%[);,]}"
      [[ -z "$p" ]] && continue
      if ! is_allowed "$p"; then
        deny "$p"
      fi
    done <<< "$PATHS"
    exit 0
    ;;
esac

exit 0

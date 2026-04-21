#!/usr/bin/env bash
# Hook: SessionStart
# Emits output ONLY when an anomaly is detected:
#   - VIBE settings missing or incomplete
#   - v1 framework remnants
#   - no CLAUDE.md in project
#   - post-compaction recovery mode (recent session-state.md)
# On normal state, returns `{}` (silent) so session starts have zero VIBE noise.
# Does NOT check pause flag — SessionStart always runs.

set -uo pipefail

INPUT=$(cat)

anomalies=()

# --- Check 1: VIBE settings ---
SETTINGS_FILE="$HOME/.claude/settings.json"
if [[ ! -f "$SETTINGS_FILE" ]] || ! jq -e '.env' "$SETTINGS_FILE" >/dev/null 2>&1; then
  anomalies+=("VIBE settings: ~/.claude/settings.json missing or incomplete — run /vibe:setup")
fi

# --- Check 2: v1 framework remnants ---
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
has_v1=false
if [[ -f "$PROJECT_DIR/CLAUDE.md" ]]; then
  if grep -q "Claude Operating System\|adapt-framework\|Morpheus: Context Awareness" "$PROJECT_DIR/CLAUDE.md" 2>/dev/null; then
    has_v1=true
  fi
fi
[[ -d "$PROJECT_DIR/.claude/morpheus" ]] && has_v1=true
[[ -d "$PROJECT_DIR/vibe-framework" ]] && has_v1=true
[[ -f "$PROJECT_DIR/vibe-framework.sh" ]] && has_v1=true

if [[ "$has_v1" == "true" ]]; then
  anomalies+=("VIBE Framework v1 remnants detected — run scripts/vibe-v1-cleanup.sh to migrate")
fi

# --- Check 3: missing CLAUDE.md (only if not v1 — v1 check takes priority) ---
if [[ "$has_v1" == "false" ]] && [[ ! -f "$PROJECT_DIR/CLAUDE.md" ]]; then
  anomalies+=("No CLAUDE.md found — run /vibe:setup to generate one")
fi

# --- Check 4: post-compaction recovery mode ---
STATE_FILE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/session-state.md"
if [[ -f "$STATE_FILE" ]]; then
  state_age=$(( $(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || echo 0) ))
  if (( state_age < 300 )); then
    anomalies+=("Post-compaction recovery available: ${STATE_FILE} (< 5 min old) — read for context")
  fi
fi

# --- Check 5: VIBE configured marker (version-aware) ---
# Fires when:
#   - marker missing (fresh install or pre-5.1 user)
#   - marker version differs from installed plugin version (user just upgraded)
# Both states mean: user should re-run /vibe:setup to reconcile state.
PLUGIN_JSON="${CLAUDE_PLUGIN_ROOT:-}/.claude-plugin/plugin.json"
RECONCILER="${CLAUDE_PLUGIN_ROOT:-}/setup/reconciler.sh"
if [[ -f "$PLUGIN_JSON" ]] && [[ -x "$RECONCILER" ]]; then
  PLUGIN_VERSION=$(python3 -c "import json; print(json.load(open('$PLUGIN_JSON'))['version'])" 2>/dev/null || echo "")
  if [[ -n "$PLUGIN_VERSION" ]]; then
    if ! "$RECONCILER" check-version "$PLUGIN_VERSION" >/dev/null 2>&1; then
      anomalies+=("VIBE $PLUGIN_VERSION detected — run /vibe:setup to reconcile configuration. See CHANGELOG.md for what changed.")
    fi
  fi
fi

# --- Emit output only if anomalies present ---
if [[ ${#anomalies[@]} -eq 0 ]]; then
  echo '{}'
  exit 0
fi

status_message=$(printf '%s\n' "${anomalies[@]}")

jq -n --arg msg "$status_message" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $msg
  }
}'

exit 0

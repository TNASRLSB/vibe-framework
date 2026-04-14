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

# --- Check 5: VIBE 5.0 upgrade marker ---
# Emitted once on first session after upgrading from 4.x to 5.0 until the
# user runs /vibe:setup, which writes the marker file in Step 7.3.
MARKER_FILE="$HOME/.claude/vibe-5.0-configured"
if [[ ! -f "$MARKER_FILE" ]]; then
  anomalies+=("VIBE 5.0 detected. Run /vibe:setup to refresh configuration. See CHANGELOG.md for the full 4.x -> 5.0 changes.")
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

#!/usr/bin/env bash
# Hook: SessionStart
# Validates environment and reports status on session start.
# Does NOT check pause flag — SessionStart always runs.

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# --- Check ~/.claude/settings.json for VIBE config ---
SETTINGS_FILE="$HOME/.claude/settings.json"
settings_ok=false
if [[ -f "$SETTINGS_FILE" ]]; then
  if jq -e '.env' "$SETTINGS_FILE" >/dev/null 2>&1; then
    settings_ok=true
  fi
fi

# --- Count pending corrections ---
QUEUE_FILE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl"
pending_count=0
if [[ -f "$QUEUE_FILE" ]]; then
  pending_count=$(wc -l < "$QUEUE_FILE" | tr -d ' ')
fi

# --- Check for recent session-state.md (post-compaction recovery) ---
STATE_FILE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/session-state.md"
recovery_mode=false
if [[ -f "$STATE_FILE" ]]; then
  state_age=$(( $(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || echo 0) ))
  if (( state_age < 300 )); then
    recovery_mode=true
  fi
fi

# --- Check for project CLAUDE.md ---
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
has_claude_md=false
if [[ -f "$PROJECT_DIR/CLAUDE.md" ]]; then
  has_claude_md=true
fi

# --- Detect v1 framework remnants ---
has_v1=false
if [[ -f "$PROJECT_DIR/CLAUDE.md" ]]; then
  if grep -q "Claude Operating System\|adapt-framework\|Morpheus: Context Awareness" "$PROJECT_DIR/CLAUDE.md" 2>/dev/null; then
    has_v1=true
  fi
fi
[[ -d "$PROJECT_DIR/.claude/morpheus" ]] && has_v1=true
[[ -d "$PROJECT_DIR/vibe-framework" ]] && has_v1=true
[[ -f "$PROJECT_DIR/vibe-framework.sh" ]] && has_v1=true

# --- Build status message ---
status_parts=()

if [[ "$settings_ok" == "true" ]]; then
  status_parts+=("VIBE settings: OK")
else
  status_parts+=("VIBE settings: ~/.claude/settings.json missing or incomplete — run /vibe:setup")
fi

if [[ "$has_v1" == "true" ]]; then
  status_parts+=("WARNING: This project has VIBE Framework v1 remnants that conflict with the v2 plugin. Run the migration script: https://github.com/TNASRLSB/vibe-framework/blob/main/scripts/vibe-v1-cleanup.sh")
elif [[ "$has_claude_md" == "false" ]]; then
  status_parts+=("No CLAUDE.md found in this project. Run /vibe:setup to generate one (detects stack, linters, build commands).")
fi

if (( pending_count > 0 )); then
  status_parts+=("Pending corrections: ${pending_count} (run /vibe:reflect to process)")
else
  status_parts+=("Pending corrections: 0")
fi

if [[ "$recovery_mode" == "true" ]]; then
  status_parts+=("Post-compaction recovery: session-state.md found (< 5 min old). Read ${STATE_FILE} to restore context.")
fi

# Join with newlines
status_message=$(printf '%s\n' "${status_parts[@]}")

# Output JSON with additionalContext
jq -n --arg msg "$status_message" '{
  hookSpecificOutput: {
    additionalContext: $msg
  }
}'

exit 0

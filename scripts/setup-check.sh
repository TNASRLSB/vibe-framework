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

# --- Build status message ---
status_parts=()

if [[ "$settings_ok" == "true" ]]; then
  status_parts+=("VIBE settings: OK")
else
  status_parts+=("VIBE settings: ~/.claude/settings.json missing or incomplete — run /vibe:setup")
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

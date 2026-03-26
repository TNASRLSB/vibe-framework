#!/usr/bin/env bash
# Hook: PreCompact
# Saves session state before compaction so context can be restored.
# Does NOT check pause flag — always runs to preserve state.
# Always exits 0.

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract fields from input
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Determine output location
DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
STATE_FILE="${DATA_DIR}/session-state.md"

# Ensure directory exists
mkdir -p "$DATA_DIR"

# --- Gather state ---

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Git diff: list changed files
GIT_DIFF=""
if [[ -n "$CWD" ]] && [[ -d "$CWD/.git" ]]; then
  GIT_DIFF=$(cd "$CWD" && git diff --name-status HEAD 2>/dev/null || echo "(no git changes)")
fi

# Recent skill invocations from transcript
SKILL_INVOCATIONS=""
if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  SKILL_INVOCATIONS=$(tail -200 "$TRANSCRIPT_PATH" | grep -i 'skill' 2>/dev/null | head -20 || echo "(none found)")
fi

# Recent tool calls from transcript
TOOL_CALLS=""
if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  TOOL_CALLS=$(tail -200 "$TRANSCRIPT_PATH" | grep -iE 'tool_use|tool_result|Read|Edit|Write|Bash|Grep|Glob' 2>/dev/null | tail -30 || echo "(none found)")
fi

# --- Write state file ---
cat > "$STATE_FILE" << STATEEOF
# Session State (Pre-Compaction)

**Saved:** ${TIMESTAMP}
**Working directory:** ${CWD}

## Git Changes

\`\`\`
${GIT_DIFF}
\`\`\`

## Recent Skill Invocations

\`\`\`
${SKILL_INVOCATIONS}
\`\`\`

## Recent Tool Calls

\`\`\`
${TOOL_CALLS}
\`\`\`
STATEEOF

exit 0

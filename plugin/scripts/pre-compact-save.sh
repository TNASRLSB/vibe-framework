#!/usr/bin/env bash
# Hook: PreCompact
# Enhanced session memory extraction before compaction.
# Saves structured session notes for post-compaction recovery.
# Does NOT check pause flag — always runs to preserve state.
# Always exits 0.

set -uo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract fields from input
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Determine output location
DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
STATE_FILE="${DATA_DIR}/session-state.md"
SESSION_MEMORY_FILE="${DATA_DIR}/session-memory.json"

# Ensure directory exists
mkdir -p "$DATA_DIR"

# --- Gather state ---

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Git diff: list changed files
GIT_DIFF=""
if [[ -n "$CWD" ]] && [[ -d "$CWD/.git" ]]; then
  GIT_DIFF=$(cd "$CWD" && git diff --name-status HEAD 2>/dev/null || echo "(no git changes)")
fi

# Git branch
GIT_BRANCH=""
if [[ -n "$CWD" ]] && [[ -d "$CWD/.git" ]]; then
  GIT_BRANCH=$(cd "$CWD" && git branch --show-current 2>/dev/null || echo "(unknown)")
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

# Recent errors from transcript
RECENT_ERRORS=""
if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  RECENT_ERRORS=$(tail -300 "$TRANSCRIPT_PATH" | grep -iE 'error|fail|exception|traceback|panic' 2>/dev/null | tail -10 || echo "(none found)")
fi

# Files modified in this session (from git)
FILES_MODIFIED=""
if [[ -n "$CWD" ]] && [[ -d "$CWD/.git" ]]; then
  FILES_MODIFIED=$(cd "$CWD" && git diff --name-only 2>/dev/null | head -20 || echo "(none)")
fi

# Active tasks count
TASK_COUNT=0
if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  TASK_COUNT=$(tail -100 "$TRANSCRIPT_PATH" 2>/dev/null | grep -c 'TaskCreate\|TaskUpdate' || true)
  TASK_COUNT=${TASK_COUNT:-0}
  # Ensure it's a number
  [[ "$TASK_COUNT" =~ ^[0-9]+$ ]] || TASK_COUNT=0
fi

# --- Write structured session memory (JSON) ---
jq -nc \
  --arg ts "$TIMESTAMP" \
  --arg cwd "$CWD" \
  --arg branch "$GIT_BRANCH" \
  --arg session "$SESSION_ID" \
  --arg files_modified "$FILES_MODIFIED" \
  --arg errors "$RECENT_ERRORS" \
  --arg skills "$SKILL_INVOCATIONS" \
  --argjson task_count "$TASK_COUNT" \
  '{
    savedAt: $ts,
    sessionId: $session,
    workingDirectory: $cwd,
    gitBranch: $branch,
    filesModified: ($files_modified | split("\n") | map(select(length > 0))),
    recentErrors: ($errors | split("\n") | map(select(length > 0))),
    skillsUsed: ($skills | split("\n") | map(select(length > 0))),
    activeTaskCount: $task_count
  }' > "$SESSION_MEMORY_FILE" 2>/dev/null

# --- Write human-readable state file (markdown) ---
cat > "$STATE_FILE" << STATEEOF
# Session State (Pre-Compaction)

**Saved:** ${TIMESTAMP}
**Session:** ${SESSION_ID}
**Working directory:** ${CWD}
**Branch:** ${GIT_BRANCH}

## Files Modified

\`\`\`
${FILES_MODIFIED}
\`\`\`

## Git Changes

\`\`\`
${GIT_DIFF}
\`\`\`

## Recent Errors

\`\`\`
${RECENT_ERRORS}
\`\`\`

## Recent Skill Invocations

\`\`\`
${SKILL_INVOCATIONS}
\`\`\`

## Recent Tool Calls

\`\`\`
${TOOL_CALLS}
\`\`\`

## Recovery Instructions

After compaction, read this file to restore context:
1. Check which files were modified and their git status
2. Review any recent errors that may need attention
3. Continue with the task that was in progress
4. If tasks were active, check TaskList for current state
STATEEOF

exit 0

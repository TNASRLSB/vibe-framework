#!/usr/bin/env bash
# Hook: PreCompact
# Saves a minimal, structured session state snapshot before context compaction.
# Goal: preserve pointers to authoritative state (git, transcript path), not to summarize.
# Does NOT check pause flag — always runs to preserve state.
# Always exits 0.

set -uo pipefail

INPUT=$(cat)

TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
STATE_FILE="${DATA_DIR}/session-state.md"
mkdir -p "$DATA_DIR"

TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

GIT_BRANCH=""
GIT_STATUS=""
GIT_DIFF_FILES=""
if [[ -n "$CWD" ]] && [[ -d "$CWD/.git" ]]; then
  GIT_BRANCH=$(cd "$CWD" && git branch --show-current 2>/dev/null || echo "(detached)")
  GIT_STATUS=$(cd "$CWD" && git status --short 2>/dev/null || echo "")
  GIT_DIFF_FILES=$(cd "$CWD" && git diff --name-status HEAD 2>/dev/null || echo "")
fi

cat > "$STATE_FILE" << STATEEOF
# Session State (Pre-Compaction)

**Saved**: ${TIMESTAMP}
**Session**: ${SESSION_ID:-unknown}
**Working directory**: ${CWD:-unknown}
**Git branch**: ${GIT_BRANCH:-unknown}

## Authoritative pointers

These sources contain the full pre-compaction state. Read them directly for
recovery — do not rely on this file to summarize them.

- **Transcript (JSONL, full message log)**: ${TRANSCRIPT_PATH:-unavailable}
- **Working tree**: run \`git -C "${CWD}" status\` and \`git -C "${CWD}" diff\`
- **Active tasks**: use \`TaskList\` to see current task state
- **Auto-memory**: ~/.claude/projects/\$(encoded-project-path)/memory/ contains persistent memories

## Git snapshot at save time

Branch: \`${GIT_BRANCH}\`

\`\`\`
${GIT_STATUS:-(clean)}
\`\`\`

### Files with diff vs HEAD

\`\`\`
${GIT_DIFF_FILES:-(none)}
\`\`\`

## Recovery checklist

1. Read this file to orient on session identity + timestamp
2. Inspect the transcript path above for the authoritative pre-compact log
3. Run \`TaskList\` to see unfinished tasks
4. Run \`git status\` to confirm working tree state has not drifted
5. Check auto-memory for relevant project memories
STATEEOF

exit 0

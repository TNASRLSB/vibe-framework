#!/usr/bin/env bash
# Hook: SubagentStop
# Syncs VIBE agent memory from the subagent's worktree to the main project.
# Non-blocking, always exits 0.

set -uo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

[[ -z "$CWD" ]] && exit 0
[[ ! -d "$CWD/.claude/worktrees" ]] && exit 0

WORKTREE_ROOT="${CWD}/.claude/worktrees"
TARGET_ROOT="${CWD}/.claude/agent-memory"

# Find all VIBE agent memory dirs inside any worktree and merge them into
# the main project's agent-memory tree. The worktree copy is authoritative
# because it contains the most recent agent writes.
while IFS= read -r -d '' source_dir; do
  [[ -z "$source_dir" ]] && continue

  agent_dir_name=$(basename "$source_dir")
  [[ ! "$agent_dir_name" =~ ^vibe- ]] && continue

  target_dir="${TARGET_ROOT}/${agent_dir_name}"
  mkdir -p "$target_dir" 2>/dev/null || continue

  cp -R "$source_dir/." "$target_dir/" 2>/dev/null || true
done < <(find "$WORKTREE_ROOT" -maxdepth 4 -type d -path "*/.claude/agent-memory/vibe-*" -print0 2>/dev/null)

exit 0

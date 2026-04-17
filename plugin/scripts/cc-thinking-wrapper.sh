#!/usr/bin/env bash
# cc-thinking-wrapper.sh — VIBE 5.3 wrapper for `claude` that injects
# --thinking-display summarized to restore Opus 4.7 reasoning summaries.
#
# Background: Opus 4.7 (released 2026-04-16) ships with thinking
# content `display: "omitted"` as the new default. Anthropic's
# documented workaround is the showThinkingSummaries CC setting, but
# binary RE of Claude Code (issue #42796 follow-up by @yusufmo1)
# confirmed that setting and the API's thinking.display parameter are
# two unrelated systems in the harness — there is no code path that
# wires one to the other. The actual fix is the hidden CLI flag
# `--thinking-display summarized` (.hideHelp() in source).
#
# Two install paths register this wrapper:
#   1. Shell alias in ~/.bashrc / ~/.zshrc — for interactive terminal
#      usage. Installed by `reconciler.sh apply-thinking-fix-shell`.
#   2. VS Code `claudeCode.claudeProcessWrapper` setting pointing at
#      this script. Installed by `reconciler.sh apply-thinking-fix-vscode`.
#
# Both paths invoke this wrapper, which exec's the underlying claude
# binary with the flag prepended. All other arguments pass through
# unchanged.
#
# Disable: set VIBE_NO_THINKING_FIX=1 in your env. The wrapper still
# runs but skips the flag injection, falling back to default behavior.
#
# Compatibility: requires Claude Code >= 2.1.103 (when --thinking-display
# was introduced). Older CC will reject the flag with an error — the
# user should remove the wrapper if running on an older version.

set -u

if [[ -n "${VIBE_NO_THINKING_FIX:-}" ]]; then
  exec command claude "$@"
fi

exec command claude --thinking-display summarized "$@"

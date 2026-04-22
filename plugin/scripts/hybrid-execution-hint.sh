#!/usr/bin/env bash
# ============================================================================
# hybrid-execution-hint.sh — VIBE 5.5.4 PreToolUse hook
# ============================================================================
#
# Dual-mode context injection for superpowers plan flow:
#   - Proposer mode (fires on superpowers:writing-plans): injects directive
#     telling Claude to write the plan idiot-proof for Sonnet subagents and
#     to offer a three-option execution handoff (subagent-driven / inline /
#     hybrid) instead of superpowers' native binary choice.
#   - Guard mode (fires on superpowers:subagent-driven-development): injects
#     directive telling Claude to audit the plan for idiot-proofness before
#     dispatching subagents; abort + recommend inline if any task is vague.
#
# Non-matching tool or skill → exit 0 empty stdout (no-op).
# Opt-out: export VIBE_NO_HYBRID_HINT=1.
#
# Output contract (CC PreToolUse hookSpecificOutput schema):
#   { "hookSpecificOutput": {
#       "hookEventName": "PreToolUse",
#       "additionalContext": "<directive text>"
#   } }
# CC appends additionalContext as a user message before the matched tool
# runs (per vendor/claude-code-source toolExecution.ts).
# ============================================================================

set -uo pipefail

# Opt-out (documented in both directives so users who see them too often
# know how to silence).
if [[ -n "${VIBE_NO_HYBRID_HINT:-}" ]]; then
    exit 0
fi

# Read stdin JSON payload from CC.
INPUT=$(cat)

# Extract tool_name + skill. Tolerant of malformed JSON (empty string, no-op).
TOOL_NAME=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('tool_name', ''))
except Exception:
    print('')
" 2>/dev/null)

if [[ "$TOOL_NAME" != "Skill" ]]; then
    exit 0
fi

SKILL_NAME=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('skill', ''))
except Exception:
    print('')
" 2>/dev/null)

# Directive content (ship-verbatim per spec §3).
PROPOSER_TEXT='VIBE Hybrid Execution Hint — write this plan idiot-proof for Sonnet subagents: every task must have exact file paths, complete code blocks (not references like "similar to Task N"), concrete verification commands with expected output, zero "TBD" / "fill in" / "add appropriate error handling". This is a prerequisite for offering hybrid execution.

At the execution-handoff step of superpowers:writing-plans, offer THREE options instead of the default two:

  1. Subagent-Driven — ALL tasks are idiot-proof, fast parallel work
  2. Inline Execution — plan has judgment-heavy or vague tasks, or user wants step-by-step
  3. HYBRID — >=30% tasks mechanical AND >=30% creative/judgment, AND mechanical tasks are idiot-proof. Opus inline for creative/small, Sonnet subagents for mechanical bulk.

Hybrid outperforms pure modes ONLY when mechanical tasks are idiot-proof. Empirically validated on the VIBE 5.1 wizard plan (13 tasks, 5h, 204 tests green — hybrid caught a plan bug inline review would have missed). Disable: VIBE_NO_HYBRID_HINT=1.'

GUARD_TEXT='VIBE Hybrid Execution Guard — before dispatching subagents, audit the plan for idiot-proofness. Every mechanical task must have: exact file paths, complete code blocks (not references), concrete verification commands with expected output. Reject any task with "TBD", "fill in", "similar to Task N", or "add appropriate error handling".

If any task fails the audit, abort the subagent dispatch. Recommend user switch to inline (superpowers:executing-plans) or revise the plan to meet criteria. Subagents on vague instructions fail silently or do wrong work — the cost of a bad dispatch is a wasted Opus session plus failed implementation.

If all tasks pass audit, proceed with subagent-driven-development as normal. Disable: VIBE_NO_HYBRID_HINT=1.'

# Dispatch on skill name.
case "$SKILL_NAME" in
    "superpowers:writing-plans")
        DIRECTIVE="$PROPOSER_TEXT"
        ;;
    "superpowers:subagent-driven-development")
        DIRECTIVE="$GUARD_TEXT"
        ;;
    *)
        # Non-trigger skill → no-op.
        exit 0
        ;;
esac

# Emit PreToolUse hookSpecificOutput. Env var + quoted heredoc to avoid any
# bash interpolation inside the Python JSON composition.
DIRECTIVE="$DIRECTIVE" python3 <<'PYEOF'
import json, os
out = {
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": os.environ["DIRECTIVE"],
    }
}
print(json.dumps(out))
PYEOF

exit 0

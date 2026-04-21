#!/usr/bin/env bash
# ============================================================================
# pragmatic-priming.sh — VIBE 5.5.0 Tier B UserPromptSubmit hook (§2.6)
# ----------------------------------------------------------------------------
# Injects ~30-token Askell-style pragmatic preamble as additionalContext on
# every user prompt submission. Mitigates documented Opus 4.7 hedging /
# sycophancy tells.
#
# Env enable semantics (strict equality per decision M2):
#   VIBE_PRAGMATIC_MODE=1    → enabled (exact string "1" only)
#   Any other value / unset  → OFF (no output, exit 0)
#
# Tier A/B coexistence: if user also has shell wrapper (Tier A) via
# --append-system-prompt, this hook ADDITIONALLY injects per-turn — user
# pays double token cost. Wizard warns at install; injection audit §2.7
# flags for cut evaluation in 5.6.0.
# ============================================================================

set -uo pipefail

# Strict enable check
if [[ "${VIBE_PRAGMATIC_MODE:-}" != "1" ]]; then
    exit 0
fi

# Read the Tier A prompt file if the user installed it (same content), else inline default
PROMPT_FILE="$HOME/.claude/vibe-pragmatic-prompt.txt"
if [[ -r "$PROMPT_FILE" ]]; then
    PREAMBLE=$(cat "$PROMPT_FILE")
else
    PREAMBLE="You are pragmatic. Give direct answers with the one clearest recommendation upfront. When uncertain, state the uncertainty and the single best course of action. Avoid hedging language, avoid 'it depends' without resolution, avoid sycophantic validation."
fi

# Emit as UserPromptSubmit additionalContext
# Escape preamble for JSON (handle quotes, newlines, backslashes)
PREAMBLE_JSON=$(printf '%s' "$PREAMBLE" | python3 -c "
import json, sys
print(json.dumps(sys.stdin.read()))
")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": ${PREAMBLE_JSON}
  }
}
EOF

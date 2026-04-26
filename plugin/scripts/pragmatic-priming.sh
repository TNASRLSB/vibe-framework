#!/usr/bin/env bash
# ============================================================================
# pragmatic-priming.sh — VIBE 5.5.0 Tier B UserPromptSubmit hook (§2.6)
# ----------------------------------------------------------------------------
# Injects ~30-token Askell-style pragmatic preamble as additionalContext on
# every user prompt submission. Mitigates documented Opus 4.7 hedging /
# sycophancy tells.
#
# Env enable semantics (default-ON, opt-out via "=0"):
#   VIBE_PRAGMATIC_MODE=0    → DISABLED (exit 0, no priming)
#   Any other value / unset  → ENABLED (priming injected per turn)
#
# Why default-ON: A/B in 5.5.1 measured 90% reduction in hedge-word
# density on Opus 4.7. Per Iron Man Mandate + User Burden Zero, the
# validated mitigation ships ON; users who want raw model behavior
# set =0 explicitly. History: 5.5–5.6 shipped default-OFF behind an
# explicit `=1` gate.
#
# Tier A/B coexistence: if user also has shell wrapper (Tier A) via
# --append-system-prompt, this hook ADDITIONALLY injects per-turn — user
# pays double token cost. Wizard warns at install; injection audit §2.7
# flags for cut evaluation in 5.6.0.
# ============================================================================

set -uo pipefail

# Default-ON gate. Disable explicitly via VIBE_PRAGMATIC_MODE=0.
if [[ "${VIBE_PRAGMATIC_MODE:-1}" == "0" ]]; then
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

#!/usr/bin/env bash
# rhetoric-guard.sh — VIBE 5.2 Stop-hook rhetoric filter
#
# CLASSIFICATION: Rhetoric filter (NOT a completion verification oracle).
# Binds to Stop. Reads the last assistant message, grep-matches it against
# a list of giving-up / ownership-dodging / permission-seeking phrases, and
# on match returns a block decision with a specific correction tied to the
# matched phrase. The agent receives the correction as context on the next
# turn and proceeds.
#
# Shipped in VIBE 5.2 following R6 findings (concluded 2026-04-15). The
# scratch prototype at /tmp/vibe-rhetoric-guard-test-20260415/ was validated
# E2E on Claude Code 2.1.108: the hook fired on the "should I continue"
# pattern, emitted {"decision":"block","reason":"..."}, and Claude responded
# "Understood — dropping the trailing question. The summary stands..." —
# acknowledging the correction without looping. Session ground truth is in
# /tmp/rhetoric-guard-first-input-f2d312c4-*.json from the R6 E2E run.
#
# ── PROVENANCE OF THE PATTERN LIST ────────────────────────────────
# The 54 patterns in VIOLATIONS below are COPIED VERBATIM from
# benvanik's stop-phrase-guard.sh:
#   https://gist.github.com/benvanik/ee00bd1b6c9154d6545c63e06a317080
# Referenced in https://github.com/anthropics/claude-code/issues/42796
# (April 2026 thread; production-tested on IREE/MLX/LLVM compiler workload;
# stellaraccident's thread data reports 173 violations caught in 17 days
# with 0 reports of harm from the hook itself).
#
# DO NOT modify individual patterns without reading the benvanik gist and
# understanding why each one was added. Per the gist's own comment: "Each
# phrase in the hook was added in response to a specific incident."
#
# ── WHAT THIS IS NOT ──────────────────────────────────────────────
# NOT VIBE 4.0's completion-sentinel.sh (removed in commit 1e7c961).
# That was a semantic completion oracle requiring the agent to emit
# VIBE_GATE markers as a cooperative contract. It had four structural
# flaws independent of the C3 experiment that failed to measure it:
#
#   1. Emission marker dependency (Check 6): required agent cooperation
#      in a verification protocol, which is precisely the thing the
#      verification existed to compensate for. Circular.
#   2. Resolution-mode loops: after a block, the agent's next message
#      had to contain either new tool calls OR "X of Y" phrasing, or
#      it was blocked again — driving the agent into rephrasing cycles
#      that burned thinking budget on managing the sentinel.
#   3. Semantic verification via regex: tried to judge "did you actually
#      process N items?" by counting tool calls against numbers extracted
#      from the message. The relationship is not 1:1 for real tasks.
#   4. Heavyweight transcript parsing via jq on every Stop event.
#
# This rhetoric-guard does none of those. It is:
#   - Stateful only via a per-session fire counter (for rate limit).
#   - One-shot per turn via the stop_hook_active check.
#   - Pattern-match only on the last assistant message's TEXT — no
#     semantic inference, no cross-referencing of tool call counts.
#   - Inject-and-release: one correction message in the block reason,
#     the agent carries it as context on the next turn, done.
#
# ── DIFFERENCES FROM benvanik's ORIGINAL ──────────────────────────
# Three additions, each motivated by a known failure mode:
#
#   1. FIRST-INPUT DUMP: on first invocation per session, dumps the raw
#      INPUT JSON to a file. This is critical instrumentation — the
#      VIBE 5.0 paper §6.3 identified "hook activation uncertainty" as
#      the primary confound of the C3 experiment. With this dump, any
#      future debugging session can verify whether the hook actually
#      ran and what input it saw.
#
#   2. FIRE RATE CAP: max N injections per session (default 3). After N,
#      fail OPEN (exit 0, log LOUD). Rationale: if rhetoric-guard fires
#      >N times in one session, either (a) our patterns are producing
#      false positives, or (b) the model is unrecoverable and further
#      blocking amplifies the failure. Stopping the hook is correct in
#      both cases. Defense against the VIBE 4.0 resolution-loop failure.
#
#   3. TRANSCRIPT FALLBACK: if last_assistant_message is empty in the
#      input, parse transcript_path and extract the last assistant text.
#      Defensive: R6 E2E test confirmed last_assistant_message IS present
#      on Stop events (benvanik was right, docs were ambiguous), but the
#      fallback is kept for robustness against future CC schema changes.
#
# ── CONFIG ─────────────────────────────────────────────────────────
# Override via env vars before running claude:
#   VIBE_RG_MAX_FIRES        Max injections per session (default 3)
#   VIBE_RG_LOG_DIR          Log + state directory
#                            (default ${CLAUDE_PLUGIN_DATA}/rhetoric-guard,
#                             falling back to ~/.claude/plugins/data/
#                             vibe-vibe-framework/rhetoric-guard)
#   VIBE_RG_DISABLED         If set to "1", exit 0 immediately
#   VIBE_RG_BYPASS_DISABLED  If set to "1", skip preprocessing (raw 5.2
#                            matching — no fenced-block or backtick strip)
#   VIBE_RG_BYPASS_VERBOSE   If set to "1", log original + filtered message
#                            to ${LOG_DIR}/rhetoric-guard-bypass-${SESSION}.log
#   VIBE_RG_CAPITULATION_DISABLED  If set to "1", skip the §15.0 sycophantic-
#                                  capitulation category. Other categories
#                                  (ownership-dodging, etc.) still fire.
#
# ── EXIT CODES ────────────────────────────────────────────────────
# Always exits 0. Blocks via the `{"decision":"block","reason":"..."}`
# JSON protocol — confirmed working on CC 2.1.108. If a future CC
# release changes the Stop decision schema, the first-input dumps will
# surface the mismatch immediately.
#
# ── COMPOSITION WITH atomic-enforcement.sh ────────────────────────
# This hook runs on the Stop event alongside atomic-enforcement.sh.
# The two are orthogonal: rhetoric-guard catches rhetorical patterns
# in the final message, atomic-enforcement catches incomplete atomic
# decomposition. Either can emit a block. When rhetoric-guard blocks,
# atomic-enforcement still runs afterward (hook array is sequential);
# when rhetoric-guard passes, atomic-enforcement's verdict is the
# only remaining gate.

set -uo pipefail

INPUT=$(cat)

# ── Disable switch ────────────────────────────────────────────────
if [[ "${VIBE_RG_DISABLED:-0}" == "1" ]]; then
  exit 0
fi

# ── Extract common fields ─────────────────────────────────────────
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
MESSAGE=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# ── Log + state directory ─────────────────────────────────────────
# Production default: VIBE plugin data dir. Scratch default was /tmp;
# we prefer a persistent location so event logs survive reboots and
# users can report issues with the log files attached.
DEFAULT_LOG_DIR="${CLAUDE_PLUGIN_DATA:-${HOME}/.claude/plugins/data/vibe-vibe-framework}/rhetoric-guard"
LOG_DIR="${VIBE_RG_LOG_DIR:-$DEFAULT_LOG_DIR}"
mkdir -p "$LOG_DIR" 2>/dev/null || true

MAX_FIRES="${VIBE_RG_MAX_FIRES:-3}"

FIRE_COUNT_FILE="${LOG_DIR}/rhetoric-guard-fires-${SESSION_ID}.count"
EVENT_LOG="${LOG_DIR}/rhetoric-guard-events-${SESSION_ID}.jsonl"
FIRST_INPUT_DUMP="${LOG_DIR}/rhetoric-guard-first-input-${SESSION_ID}.json"
INVOCATION_COUNT_FILE="${LOG_DIR}/rhetoric-guard-invocations-${SESSION_ID}.count"

# ── First-input diagnostic dump ───────────────────────────────────
# On the FIRST invocation in this session, dump the raw input JSON.
# Critical instrumentation for debugging "did the hook fire" and
# "what input did Claude Code pass".
if [[ ! -f "$INVOCATION_COUNT_FILE" ]]; then
  echo "$INPUT" > "$FIRST_INPUT_DUMP" 2>/dev/null || true
  echo 1 > "$INVOCATION_COUNT_FILE" 2>/dev/null || true
else
  CURRENT=$(cat "$INVOCATION_COUNT_FILE" 2>/dev/null || echo 0)
  echo $((CURRENT + 1)) > "$INVOCATION_COUNT_FILE" 2>/dev/null || true
fi

# ── Logging helper ────────────────────────────────────────────────
log_event() {
  local decision="$1"
  local pattern="$2"
  local category="$3"
  local fire_count_before="$4"
  local msg_preview
  msg_preview=$(echo "${MESSAGE:-<empty>}" | head -c 200 | tr '\n' ' ' | tr '"' "'")
  jq -nc \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg sid "$SESSION_ID" \
    --arg evt "$HOOK_EVENT" \
    --arg dec "$decision" \
    --arg pat "$pattern" \
    --arg cat "$category" \
    --argjson fires "$fire_count_before" \
    --arg prev "$msg_preview" \
    --arg had_lam "$(if [[ -n "$MESSAGE" ]]; then echo "true"; else echo "false"; fi)" \
    '{timestamp: $ts, session_id: $sid, hook_event: $evt, decision: $dec, pattern: $pat, category: $cat, fire_count_before: $fires, had_last_assistant_message: ($had_lam == "true"), message_preview: $prev}' \
    >> "$EVENT_LOG" 2>/dev/null || true
}

# ── stop_hook_active guard ────────────────────────────────────────
# If the hook already fired this turn, let the assistant stop.
# Prevents infinite loops where the corrected message itself contains
# a matching pattern.
if [[ "$HOOK_ACTIVE" == "true" ]]; then
  log_event "skip_stop_hook_active" "-" "meta" 0
  exit 0
fi

# ── Transcript fallback for message extraction ────────────────────
# R6 E2E test confirmed last_assistant_message is populated on Stop
# events in CC 2.1.108. This fallback is defensive against future
# schema changes or edge cases (e.g. empty-message Stop events).
if [[ -z "$MESSAGE" ]] && [[ -n "$TRANSCRIPT" ]] && [[ -f "$TRANSCRIPT" ]]; then
  MESSAGE=$(jq -s -r '
    [.[] | select(.type == "assistant") |
      .message.content[]? |
      select(.type == "text") |
      .text
    ] | last // empty
  ' "$TRANSCRIPT" 2>/dev/null || echo "")
fi

# No message to inspect → nothing to do.
if [[ -z "$MESSAGE" ]]; then
  log_event "skip_empty_message" "-" "meta" 0
  exit 0
fi

# ── Preprocessing (Strategy E: Stages 1a + 1b + 2 + 2b) ──────────
# Strip code contexts and quoted text before matching to prevent
# false positives when pattern names appear quoted in design docs,
# audits, code blocks, or markdown links.
# Set VIBE_RG_BYPASS_DISABLED=1 to skip preprocessing (raw 5.2 behavior).
# Set VIBE_RG_BYPASS_VERBOSE=1 to log original + filtered message.
BYPASS_DISABLED="${VIBE_RG_BYPASS_DISABLED:-0}"
BYPASS_VERBOSE="${VIBE_RG_BYPASS_VERBOSE:-0}"

MESSAGE_FILTERED="$MESSAGE"

if [[ "$BYPASS_DISABLED" != "1" ]]; then
  # Stage 1a: strip fenced code blocks (``` ... ```) — awk state machine.
  # Replaces entire fenced block content with empty lines to preserve
  # paragraph boundaries so surrounding prose still matches correctly.
  MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | awk '
    BEGIN { in_fence = 0 }
    /^[[:space:]]*```/ { in_fence = !in_fence; print ""; next }
    { if (!in_fence) print; else print "" }
  ')

  # Stage 1b: strip inline backtick spans (` ... ` and `` ... ``).
  # Length-capped to 200 chars to avoid swallowing paragraphs when
  # backticks are unmatched (e.g. stray backtick in prose).
  MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E 's/`+[^`]{1,200}`+/ /g')

  # Stage 2: strip double-quoted strings (straight + typographic curly).
  # Length-capped to 200 chars to avoid swallowing paragraphs from
  # unmatched quotes. Single quotes intentionally NOT stripped (too many
  # false negatives from contractions like "I'll", "didn't").
  MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E '
    s/"[^"]{1,200}"/ /g
    s/“[^”]{1,200}”/ /g
  ')

  # Stage 2b: strip markdown link labels [foo](url) — keep url.
  # Prevents pattern names in link text from triggering FPs.
  MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E 's/\[[^]]{1,200}\]\([^)]+\)/ /g')
fi

if [[ "$BYPASS_VERBOSE" == "1" ]]; then
  { echo "--- $(date -u +%FT%TZ) session=$SESSION_ID ---"
    echo "ORIGINAL (first 500): ${MESSAGE:0:500}"
    echo "FILTERED (first 500): ${MESSAGE_FILTERED:0:500}"
  } >> "${LOG_DIR}/rhetoric-guard-bypass-${SESSION_ID}.log" 2>/dev/null || true
fi

# ── Fire rate cap ─────────────────────────────────────────────────
FIRE_COUNT=0
if [[ -f "$FIRE_COUNT_FILE" ]]; then
  FIRE_COUNT=$(cat "$FIRE_COUNT_FILE" 2>/dev/null || echo 0)
fi

if [[ "$FIRE_COUNT" -ge "$MAX_FIRES" ]]; then
  log_event "fail_open_rate_limit" "-" "rate-limit" "$FIRE_COUNT"
  exit 0
fi

# ── Pattern list (benvanik 2026-04-06, verbatim) ──────────────────
# Each entry: "grep_pattern|correction_message"
# Checked case-insensitively. First match wins. Ordered by severity.
# Entry format: "pattern|category|correction"
# Parsed via: IFS='|' read -r pattern category correction <<<"$entry"
# Categories (7 total): ownership-dodging, known-limitation, session-length,
# permission-seeking, scope-creep (5.7.0), sycophantic-capitulation (5.6.1),
# skim-tells (latter lives in SKIM_TELL_PATTERNS below, flag-gated).
VIOLATIONS=(
  # Ownership dodging (the #1 problem)
  "pre-existing|ownership-dodging|NOTHING IS PRE-EXISTING. All builds and tests are green upstream. If something fails, YOUR work caused it. Investigate and fix it. Never dismiss a failure as pre-existing."
  "not from my changes|ownership-dodging|NOTHING IS PRE-EXISTING. You own every change. Investigate the failure."
  "not my change|ownership-dodging|NOTHING IS PRE-EXISTING. You own every change. Investigate the failure."
  "not caused by my|ownership-dodging|NOTHING IS PRE-EXISTING. You own every change. Investigate the failure."
  "not introduced by my|ownership-dodging|NOTHING IS PRE-EXISTING. You own every change. Investigate the failure."
  "already existed before|ownership-dodging|NOTHING IS PRE-EXISTING. If you found it broken, fix it or explain exactly what is wrong and what the fix requires."
  "before my changes|ownership-dodging|NOTHING IS PRE-EXISTING. There is no 'before your changes' — you own the codebase as it is now."
  "prior to my changes|ownership-dodging|NOTHING IS PRE-EXISTING. There is no 'prior to your changes.'"
  "unrelated to my changes|ownership-dodging|NOTHING IS PRE-EXISTING. If it is broken, fix it. If you broke it, fix it. Nothing is unrelated."
  "an existing issue|ownership-dodging|NOTHING IS PRE-EXISTING. Investigate and fix, or explain exactly what is wrong."
  "existing bug|ownership-dodging|NOTHING IS PRE-EXISTING. Investigate and fix."

  # Known limitation dodging
  "known limitation|known-limitation|NO KNOWN LIMITATIONS. Investigate whether it is fixable. Either fix it or explain the specific technical reason it cannot be fixed right now."
  "known issue|known-limitation|NO KNOWN LIMITATIONS. Explain the specific technical reason or fix it."
  "future work|known-limitation|NO KNOWN LIMITATIONS. Fix it now or describe exactly what the fix requires — not as a TODO, as a technical explanation."
  "left as an exercise|known-limitation|NO KNOWN LIMITATIONS. Do the work."

  # Session-length quitting
  "session length|session-length|Sessions are unlimited. If work remains, do the work. Continue."
  "session depth|session-length|Sessions are unlimited. Continue working."
  "given the length of this|session-length|Sessions are unlimited. Continue working."
  "continue in a new session|session-length|Sessions are unlimited. There is no reason to defer to a new session. Continue."
  "good place to stop|session-length|Is the task done? If not, continue working. Sessions are unlimited."
  "good stopping point|session-length|Is the task done? If not, continue working. Sessions are unlimited."
  "good checkpoint given|session-length|Is the task done? If not, continue working."
  "natural stopping|session-length|Is the task done? If not, continue working."
  "logical stopping|session-length|Is the task done? If not, continue working."
  "this session has gotten long|session-length|Sessions are unlimited. You are a machine. Continue working."
  "session has been long|session-length|Sessions are unlimited. Continue working."
  "getting long|session-length|Sessions are unlimited. Continue working."
  "lengthy session|session-length|Sessions are unlimited. Continue working."

  # Permission-seeking mid-task (the answer is always "yes, continue")
  "want to continue.*or |permission-seeking|Do not ask. The task is not done. Continue working."
  "or save it for|permission-seeking|Do not ask. The task is not done. Continue working."
  "should I continue|permission-seeking|Do not ask. If the task is not done, continue. The user will interrupt if they want you to stop."
  "shall I continue|permission-seeking|Do not ask. Continue working until the task is complete."
  "shall I proceed|permission-seeking|Do not ask. Proceed."
  "would you like me to continue|permission-seeking|Do not ask. Continue."
  "would you like to continue|permission-seeking|Do not ask. Continue."
  "want me to keep going|permission-seeking|Do not ask. Keep going."
  "want me to continue|permission-seeking|Do not ask. Continue."
  "should I keep going|permission-seeking|Do not ask. Keep going."
  "save it for next time|permission-seeking|There is no 'next time.' Sessions are unlimited. Continue working."
  "in the next session|permission-seeking|There is no 'next session.' This session is unlimited. Continue working."
  "next session|permission-seeking|There is no 'next session.' This session is unlimited. Continue working."
  "next conversation|permission-seeking|There is no 'next conversation.' Continue working."
  "pick this up later|permission-seeking|There is no 'later.' Continue working now."
  "come back to this|permission-seeking|There is no 'coming back.' Continue working now."
  "continue in a follow-up|permission-seeking|There is no 'follow-up.' Continue now."
  "pause here|permission-seeking|Do not pause. The task is not done. Continue."
  "stop here for now|permission-seeking|Do not stop. The task is not done. Continue."
  "wrap up for now|permission-seeking|Do not wrap up. The task is not done. Continue."
  "call it here|permission-seeking|Do not stop. Continue working."

  # §14.6 semantic-equivalent expansions — empirically justified by S4 corpus
  # (40-output Opus 4.6 vs 4.7 fire rate validation showed cluster-D coverage
  # gap: models use these phrasings instead of literal "shall I proceed").
  "let me know how you'd like|permission-seeking|Do not ask. Pick the most reasonable option and proceed. The user will redirect if needed."
  "let me know if you|permission-seeking|Do not ask. Pick the most reasonable interpretation and proceed."
  "before I proceed|permission-seeking|Do not ask. Proceed with the most reasonable interpretation."
  "before continuing|permission-seeking|Do not ask. Continue."
  "awaiting your|permission-seeking|Do not wait. Pick the most reasonable option and proceed."
  "would appreciate your input|permission-seeking|Do not ask. Pick the most reasonable option and proceed."
  "if you'd like, I can|permission-seeking|Do not offer — do. If the work is needed, do it."
  "pause for your input|permission-seeking|Do not pause. Continue with the most reasonable interpretation."
  "won't touch anything until|permission-seeking|Do not stop. The task is not done. Pick a reasonable approach and proceed."

  # §15.5 scope-creep — added 5.7.0 (moved from oracle MVP).
  # Verb phrases announcing unrequested side-work. Distinct from
  # permission-seeking (asks before acting); scope-creep silently expands
  # the change and announces it after. Caught at Stop time, after the
  # side-work has already happened. Patterns intentionally excluded from
  # HIGH_RISK_PATTERNS — they are verb phrases, not category labels, so
  # meta-discussion FP risk is low.
  "while i was at it|scope-creep|SCOPE CREEP. Did the user ask for this? If not, revert. State only what was requested. If you saw something worth fixing, name it and ask — do not fix it inline."
  "i took the liberty of|scope-creep|SCOPE CREEP. Did the user ask for this? If not, revert. State only what was requested. If you saw something worth fixing, name it and ask — do not fix it inline."
  "took the opportunity to|scope-creep|SCOPE CREEP. Did the user ask for this? If not, revert. State only what was requested. If you saw something worth fixing, name it and ask — do not fix it inline."
  "i went ahead and|scope-creep|SCOPE CREEP. Did the user ask for this? If not, revert. State only what was requested. If you saw something worth fixing, name it and ask — do not fix it inline."
  "for good measure|scope-creep|SCOPE CREEP. Did the user ask for this? If not, revert. State only what was requested. If you saw something worth fixing, name it and ask — do not fix it inline."
  "ho colto l'occasione|scope-creep|SCOPE CREEP. L'utente l'aveva chiesto? Se no, ripristina. Riporta solo ciò che era stato richiesto. Se hai notato altro da sistemare, segnalalo e chiedi — non risolverlo inline."
  "già che c'ero|scope-creep|SCOPE CREEP. L'utente l'aveva chiesto? Se no, ripristina. Riporta solo ciò che era stato richiesto. Se hai notato altro da sistemare, segnalalo e chiedi — non risolverlo inline."
  "tanto che c'ero|scope-creep|SCOPE CREEP. L'utente l'aveva chiesto? Se no, ripristina. Riporta solo ciò che era stato richiesto. Se hai notato altro da sistemare, segnalalo e chiedi — non risolverlo inline."

  # §15.0 sycophantic-capitulation (5.6.1) — retroactive capitulation about
  # a CLAIM already made. Triggered by user pushback; the model immediately
  # agrees + apologizes + reverses WITHOUT verifying with Read/Grep/tool
  # output. Distinct from ownership-dodging (forward-looking responsibility
  # evasion); this category catches backward-looking sycophantic agreement.
  # The injected correction directs the model to cite specific evidence
  # before reversing, or to restate its prior position.
  #
  # Default-ON. Disable just this category via VIBE_RG_CAPITULATION_DISABLED=1
  # (does not disable other categories). Broader high-FP patterns
  # ("you're right", "I apologize", "my mistake" alone) gated separately by
  # VIBE_RG_CAPITULATION_BROAD=1 — see CAPITULATION_BROAD_PATTERNS below.
  "i was wrong|sycophantic-capitulation|VERIFY BEFORE AGREEING. Cite the specific evidence (file:line, tool output, fact) that justifies the reversal. If no evidence, do not capitulate — restate your prior position with reasoning."
  "i had it wrong|sycophantic-capitulation|VERIFY BEFORE AGREEING. Cite the file:line or tool output that justifies the reversal. No evidence = no reversal."
  "i had it backwards|sycophantic-capitulation|VERIFY BEFORE AGREEING. Cite specific evidence — not just user disagreement. State what changed and why."
  "you're absolutely right|sycophantic-capitulation|VERIFY BEFORE AGREEING. 'Absolutely right' without cited evidence is sycophancy. State the fact (file:line, tool result) that supports the agreement."
  "you are absolutely right|sycophantic-capitulation|VERIFY BEFORE AGREEING. 'Absolutely right' without cited evidence is sycophancy. State the fact that supports the agreement."
  "you're completely right|sycophantic-capitulation|VERIFY BEFORE AGREEING. 'Completely right' without cited evidence is sycophancy."
  "you are completely right|sycophantic-capitulation|VERIFY BEFORE AGREEING. 'Completely right' without cited evidence is sycophancy."
  "actually you're right|sycophantic-capitulation|VERIFY BEFORE AGREEING. The user disagreeing is not evidence the user is right. Cite the specific fact that supports the reversal."
  "actually, you're right|sycophantic-capitulation|VERIFY BEFORE AGREEING. The user disagreeing is not evidence the user is right. Cite the specific fact that supports the reversal."
  "actually you are right|sycophantic-capitulation|VERIFY BEFORE AGREEING. The user disagreeing is not evidence the user is right. Cite the specific fact that supports the reversal."
  "actually, you are right|sycophantic-capitulation|VERIFY BEFORE AGREEING. The user disagreeing is not evidence the user is right. Cite the specific fact that supports the reversal."
  "let me correct myself|sycophantic-capitulation|Before correcting, cite the evidence (file:line, tool output) that proves the original was wrong. No evidence = restate, do not retract."
  "i apologize for the confusion|sycophantic-capitulation|Do not apologize as a substitute for analysis. State the specific error, the evidence that proves it, and the corrected claim."
  "i apologize for the error|sycophantic-capitulation|Do not apologize as a substitute for analysis. State the specific error, the evidence that proves it, and the corrected claim."
  "i apologize for the incorrect|sycophantic-capitulation|Do not apologize as a substitute for analysis. State the specific error, the evidence that proves it, and the corrected claim."
  "my apologies for the confusion|sycophantic-capitulation|Do not apologize as a substitute for analysis. State the specific error, the evidence, and the corrected claim."
  "my apologies for the error|sycophantic-capitulation|Do not apologize as a substitute for analysis. State the specific error, the evidence, and the corrected claim."
  "avevo torto|sycophantic-capitulation|VERIFICA PRIMA DI CONCEDERE. Cita evidenza concreta (file:linea, output di tool) che giustifichi la marcia indietro. Senza evidenza, riformula — non concedere."
  "mi correggo|sycophantic-capitulation|Prima di correggere, cita l'evidenza (file:linea, output di tool) che dimostra che l'originale era sbagliato. Senza evidenza, riformula — non ritrattare."
  "hai ragione|sycophantic-capitulation|VERIFICA PRIMA DI CONCEDERE. Il disaccordo dell'utente non è prova che l'utente abbia ragione. Cita evidenza specifica."
  "in realtà hai ragione|sycophantic-capitulation|VERIFICA PRIMA DI CONCEDERE. Cita l'evidenza che ha cambiato la tua posizione, non solo il pushback dell'utente."
)

# ── Stage 3: HIGH-risk pattern table for meta-keyword suppression ──
# HIGH-risk patterns are most prone to false positives when discussed
# meta-textually (audit docs, design discussions, code comments). These
# are the patterns whose literal substring is most often the *category
# label* used to refer to the rhetorical phenomenon, not the phenomenon
# itself. Stage 3 suppresses fires of HIGH-risk patterns when the
# matching paragraph also contains meta-keywords like "pattern set",
# "rhetoric-guard", "false positive", etc.
#
# LOW/MEDIUM-risk patterns (session-quitting, permission-seeking, action
# verbs) are NOT suppressed by meta-keyword, because their phrasing is
# verb-driven and rarely appears as a category label.
# Portable set membership (bash 3.2 compat — macOS ships /bin/bash 3.2,
# no declare -A). Border pipes so "|pat|" glob matches exactly; no
# pattern contains "|" so the delimiter is safe.
HIGH_RISK_PATTERNS="|pre-existing|not from my changes|not my change|not caused by my|not introduced by my|already existed before|before my changes|prior to my changes|unrelated to my changes|an existing issue|existing bug|known limitation|known issue|future work|left as an exercise|i was wrong|i had it wrong|i had it backwards|you're absolutely right|you are absolutely right|you're completely right|you are completely right|actually you're right|actually, you're right|actually you are right|actually, you are right|let me correct myself|i apologize for the confusion|i apologize for the error|i apologize for the incorrect|my apologies for the confusion|my apologies for the error|avevo torto|mi correggo|hai ragione|in realtà hai ragione|"

META_KEYWORDS_RE='rhetoric.guard|pattern set|pattern list|categor(y|ies)|regex|false positive|trigger phrase|dodging cluster|audit doc|post.mortem|violations array|rhetoric_guard|rhetoric guard|capitulation|sycophancy|sycophantic'

# --- Category: skim-tells (5.4.0, flag-gated) ----------------------------
# Fires only when VIBE_RG_SKIM_PATTERNS_ENABLED=1.
# Patterns capture verbal tells of filename-based inference and skim-edit
# behavior. Calibration: default off in 5.4.0; promote to default on in
# 5.4.1 only if field fire-rate <5% on a naturalistic corpus.
if [[ "${VIBE_RG_SKIM_PATTERNS_ENABLED:-0}" == "1" ]]; then
    SKIM_TELL_PATTERNS=(
        '(from|based on) the (filename|naming convention|file name)'
        'a quick (scan|look|glance)'
        'it appears (to be|that) '
        'I (glanced|skimmed|scanned)'
        'from the name'
        'based on (the name|naming)'
        'quick (peek|skim)'
    )

    for pat in "${SKIM_TELL_PATTERNS[@]}"; do
        if echo "$MESSAGE_FILTERED" | grep -qiE "$pat"; then
            log_event "block" "$pat" "skim-tells" "$FIRE_COUNT"
            python3 -c "
import json, sys
sys.stderr.write(json.dumps({'reason': 'rhetoric-guard: skim-tell detected (\"${pat}\"). Read the file fully before making claims from filename or naming alone. Set VIBE_RG_SKIM_PATTERNS_ENABLED=0 to disable this category.', 'continue': False}) + '\n')
" 2>&1 >/dev/null
            exit 2
        fi
    done
fi

# ── Match loop ────────────────────────────────────────────────────
for entry in "${VIOLATIONS[@]}"; do
  IFS='|' read -r pattern category correction <<<"$entry"
  if echo "$MESSAGE_FILTERED" | grep -iq "$pattern"; then
    # §15.0 per-category disable: sycophantic-capitulation only.
    # Honor user opt-out without affecting other categories.
    if [[ "$category" == "sycophantic-capitulation" ]] && [[ "${VIBE_RG_CAPITULATION_DISABLED:-0}" == "1" ]]; then
      log_event "skip_capitulation_disabled" "$pattern" "$category" "$FIRE_COUNT"
      continue
    fi

    # Stage 3: meta-keyword suppression for HIGH-risk patterns only.
    # If the matching PARAGRAPH (RS = "" splits on blank lines) contains
    # a meta-keyword indicating discussion of the guard itself, suppress.
    if [[ "$BYPASS_DISABLED" != "1" ]] && [[ "$HIGH_RISK_PATTERNS" == *"|$pattern|"* ]]; then
      matching_paragraphs=$(echo "$MESSAGE_FILTERED" | awk -v pat="$pattern" '
        BEGIN { RS = ""; IGNORECASE = 1 }
        $0 ~ pat { print $0; print "" }
      ')
      if echo "$matching_paragraphs" | grep -iqE "$META_KEYWORDS_RE"; then
        log_event "suppress_meta_context" "$pattern" "$category" "$FIRE_COUNT"
        continue
      fi
    fi

    # Increment fire count BEFORE emitting the decision.
    FIRE_COUNT=$((FIRE_COUNT + 1))
    echo "$FIRE_COUNT" > "$FIRE_COUNT_FILE" 2>/dev/null || true

    log_event "block" "$pattern" "$category" "$((FIRE_COUNT - 1))"

    # Emit the block decision. Format confirmed on CC 2.1.108 via R6 E2E.
    jq -n --arg reason "RHETORIC GUARD: $correction" '{
      decision: "block",
      reason: $reason
    }'
    exit 0
  fi
done

# No pattern matched — allow the stop.
log_event "pass_no_match" "-" "meta" "$FIRE_COUNT"
exit 0

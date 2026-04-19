#!/usr/bin/env bash
# Hook: Stop
# Side-effect verification — detects when the assistant commits to a
# write/save/persist operation in prose but doesn't actually invoke a
# Write/Edit/NotebookEdit tool in the same turn. Issues #49764 fix.
#
# CLASSIFICATION: Side-effect verifier (NOT a completion oracle).
# Reads the last assistant message's text + tool calls from the transcript.
# If text contains a commitment-to-mutate-state phrasing AND no
# Write/Edit/NotebookEdit tool was invoked in the same turn, blocks the
# stop with `decision:"block"` + reason — the assistant sees "you said
# you'd save X but no Write happened" as feedback on the next turn and
# can reconcile. Per official CC docs, Stop hooks use the top-level
# decision/reason pattern; hookSpecificOutput.additionalContext is NOT
# valid on Stop (only on UserPromptSubmit/SessionStart/SubagentStart/
# PostToolUse/PostToolUseFailure).
#
# ── DETECTION REGEX ───────────────────────────────────────────────
# COMMITMENT_RE matches phrases like:
#   "I'll save the file"      "I'll write this to disk"
#   "I am going to create"    "Let me update the config"
#   "I should now persist"    "I'm storing this in"
# Verbs:    sav(e|ing) writ(e|ing) creat(e|ing) updat(e|ing)
#           persist(ing)? stor(e|ing) appen(d|ding)
# Subjects: I, I'm, I'll, I am, I will, let me, I should now
# Targets:  this, the, to, in
#
# ── PREPROCESSING (Strategy E v2 reuse) ───────────────────────────
# Before regex matching, strip code-fences, backticks, and double-quoted
# strings from the message. Without this, citations of the regex itself
# (e.g. in design docs or commit messages) would trigger FPs identical
# to the rhetoric-guard self-citation problem solved by Strategy E.
#
# ── WHAT THIS IS NOT ──────────────────────────────────────────────
# NOT a transcript editor or rollback mechanism. Only emits an
# advisory message. Cap: 1 fire per session (same pattern as
# rhetoric-guard's MAX_FIRES) to prevent feedback loops where the
# warning text itself contains commitment phrasing on the next turn.
#
# ── CONFIG ─────────────────────────────────────────────────────────
# Override via env vars before running claude:
#   VIBE_SIDEEFFECT_VERIFY_DISABLED  If "1", exit 0 immediately
#   VIBE_SIDEEFFECT_LOG_DIR          Log directory
#                                    (default ${CLAUDE_PLUGIN_DATA}/side-effect-verify)
#
# ── EXIT CODES ────────────────────────────────────────────────────
# Always exits 0 (failure-open). On regex error or transcript read fail,
# exits 0 silently. On detection + no tool call, emits hook output JSON
# with top-level decision/reason and exits 0 — the stop is blocked and
# the reason is fed to the next turn as feedback.

set -uo pipefail

INPUT=$(cat)

# ── Disable switch ────────────────────────────────────────────────
if [[ "${VIBE_SIDEEFFECT_VERIFY_DISABLED:-0}" == "1" ]]; then
  exit 0
fi

# ── Extract common fields ─────────────────────────────────────────
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
MESSAGE=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# stop_hook_active guard (same as rhetoric-guard) — prevent loop
if [[ "$HOOK_ACTIVE" == "true" ]]; then
  exit 0
fi

# ── Log + state directory ─────────────────────────────────────────
DEFAULT_LOG_DIR="${CLAUDE_PLUGIN_DATA:-${HOME}/.claude/plugins/data/vibe-vibe-framework}/side-effect-verify"
LOG_DIR="${VIBE_SIDEEFFECT_LOG_DIR:-$DEFAULT_LOG_DIR}"
mkdir -p "$LOG_DIR" 2>/dev/null || true

FIRE_COUNT_FILE="${LOG_DIR}/fires-${SESSION_ID}.count"
EVENT_LOG="${LOG_DIR}/events-${SESSION_ID}.jsonl"

log_event() {
  local decision="$1" detail="$2"
  jq -nc \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg sid "$SESSION_ID" \
    --arg dec "$decision" \
    --arg det "$detail" \
    '{timestamp: $ts, session_id: $sid, decision: $dec, detail: $det}' \
    >> "$EVENT_LOG" 2>/dev/null || true
}

# ── Fire rate cap (1 per session) ─────────────────────────────────
FIRE_COUNT=0
if [[ -f "$FIRE_COUNT_FILE" ]]; then
  FIRE_COUNT=$(cat "$FIRE_COUNT_FILE" 2>/dev/null || echo 0)
fi
if [[ "$FIRE_COUNT" -ge 1 ]]; then
  log_event "skip_rate_limit" "-"
  exit 0
fi

# ── Transcript fallback for message extraction ────────────────────
if [[ -z "$MESSAGE" ]] && [[ -n "$TRANSCRIPT" ]] && [[ -f "$TRANSCRIPT" ]]; then
  MESSAGE=$(jq -s -r '
    [.[] | select(.type == "assistant") |
      .message.content[]? |
      select(.type == "text") |
      .text
    ] | last // empty
  ' "$TRANSCRIPT" 2>/dev/null || echo "")
fi

if [[ -z "$MESSAGE" ]]; then
  log_event "skip_empty_message" "-"
  exit 0
fi

# ── Preprocessing (Strategy E reuse: 1a + 1b + 2 + 2b) ───────────
# Avoid FP when commitment phrasing is quoted or in code blocks
# (e.g. "the regex matches 'I'll save'" should NOT trigger).
MESSAGE_FILTERED="$MESSAGE"

# Stage 1a: strip fenced code blocks
MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | awk '
  BEGIN { in_fence = 0 }
  /^[[:space:]]*```/ { in_fence = !in_fence; print ""; next }
  { if (!in_fence) print; else print "" }
')
# Stage 1b: strip inline backtick spans (length-cap 200)
MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E 's/`+[^`]{1,200}`+/ /g')
# Stage 2: strip double-quoted strings (straight + curly)
MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E '
  s/"[^"]{1,200}"/ /g
  s/“[^”]{1,200}”/ /g
')
# Stage 2b: strip markdown link labels
MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E 's/\[[^]]{1,200}\]\([^)]+\)/ /g')

# ── Commitment regex ─────────────────────────────────────────────
# Match phrases like "I'll save this", "let me write the", "I am going to update".
# Verbs: sav(e|ing), writ(e|ing), creat(e|ing), updat(e|ing), persist(ing)?, stor(e|ing), appen(d|ding)
# Targets: this, the, to, in (the targets bias toward concrete commitments,
# avoiding "I'll write more code" without an object).
COMMITMENT_RE="\\b(I('m| am| will| ll|'ll)?( going to)?|let me|I should now) (sav(e|ing)|writ(e|ing)|creat(e|ing)|updat(e|ing)|persist(ing)?|stor(e|ing)|appen(d|ding)) (this|the|to|in)\\b"

if ! echo "$MESSAGE_FILTERED" | grep -iqE "$COMMITMENT_RE"; then
  log_event "pass_no_commitment" "-"
  exit 0
fi

# ── Check transcript for Write/Edit/NotebookEdit in last turn ────
# A "turn" = the assistant message ending with this Stop event.
# We look at the LAST assistant block in the transcript and check
# its content[] for any tool_use of Write/Edit/NotebookEdit.
if [[ -z "$TRANSCRIPT" ]] || [[ ! -f "$TRANSCRIPT" ]]; then
  log_event "skip_no_transcript" "-"
  exit 0
fi

LAST_TOOLS=$(jq -s -r '
  [.[] | select(.type == "assistant")] | last |
  .message.content[]? |
  select(.type == "tool_use") |
  .name
' "$TRANSCRIPT" 2>/dev/null | sort -u | paste -sd,)

# If any of Write/Edit/NotebookEdit appear, the commitment was honored
if echo "$LAST_TOOLS" | grep -qE '\b(Write|Edit|NotebookEdit)\b'; then
  log_event "pass_tool_invoked" "$LAST_TOOLS"
  exit 0
fi

# ── Commitment found, no matching tool call → emit advisory ──────
FIRE_COUNT=$((FIRE_COUNT + 1))
echo "$FIRE_COUNT" > "$FIRE_COUNT_FILE" 2>/dev/null || true

# Extract the matched commitment phrase for the warning (first ~80 chars)
MATCHED=$(echo "$MESSAGE_FILTERED" | grep -ioE "$COMMITMENT_RE.{0,80}" | head -1 | tr '\n' ' ')

log_event "fire_no_tool_call" "matched=${MATCHED:0:120} tools=${LAST_TOOLS:-none}"

# Emit block decision so the reason is fed to Claude on the next turn.
# Schema per official CC docs: Stop uses top-level decision/reason, not
# hookSpecificOutput.additionalContext (that field is rejected on Stop).
jq -n --arg reason "SIDE-EFFECT VERIFY: your previous turn committed to a write operation (\"${MATCHED}\") but no Write/Edit/NotebookEdit tool was invoked in that turn. Either perform the write now, or correct the prior message to remove the commitment. (Disable: VIBE_SIDEEFFECT_VERIFY_DISABLED=1)" '{
  decision: "block",
  reason: $reason
}'

exit 0

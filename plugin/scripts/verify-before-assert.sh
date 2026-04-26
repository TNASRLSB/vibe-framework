#!/usr/bin/env bash
# verify-before-assert.sh — VIBE 5.6.1 Stop-hook epistemic gate
#
# Detects assertions about repository state in the final assistant message
# (file existence, function behavior, line citations) without preceding
# verification tool calls (Read, Grep, Glob, LS) in the recent transcript
# window. Default mode: LOG-ONLY (writes events to plugin data dir for
# maintainer review). Block mode: opt-in via VIBE_VBA_BLOCK=1.
#
# Distinct from rhetoric-guard.sh: that targets RHETORICAL patterns
# (giving up, sycophancy). This targets EPISTEMIC patterns (claims about
# repo state without verification).
#
# Pattern coverage is conservative — each pattern requires a backtick-quoted
# target (file path, function name, line citation). FP rate is low at the
# cost of missing assertions in plain prose. Tradeoff acceptable for a
# log-only hook; can be tightened in block mode after field calibration.
#
# ── CONFIG ─────────────────────────────────────────────────────────
#   VIBE_VBA_DISABLED=1     Skip the hook entirely (exit 0)
#   VIBE_VBA_BLOCK=1        Block on detection (default: log-only)
#   VIBE_VBA_LOG_DIR        Override log directory location

set -uo pipefail

INPUT=$(cat)

# ── Disable switch ────────────────────────────────────────────────
if [[ "${VIBE_VBA_DISABLED:-0}" == "1" ]]; then
  exit 0
fi

# ── Extract common fields ─────────────────────────────────────────
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
MESSAGE=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# Honor stop_hook_active to prevent re-fire after a prior block.
if [[ "$HOOK_ACTIVE" == "true" ]]; then
  exit 0
fi

# ── Log directory ─────────────────────────────────────────────────
DEFAULT_LOG_DIR="${CLAUDE_PLUGIN_DATA:-${HOME}/.claude/plugins/data/vibe-vibe-framework}/verify-before-assert"
LOG_DIR="${VIBE_VBA_LOG_DIR:-$DEFAULT_LOG_DIR}"
mkdir -p "$LOG_DIR" 2>/dev/null || true

EVENT_LOG="${LOG_DIR}/vba-events-${SESSION_ID}.jsonl"

# ── Transcript fallback for empty message ─────────────────────────
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
  exit 0
fi

# ── Preprocessing ─────────────────────────────────────────────────
# Strip fenced code blocks (code samples are not assertions about repo).
# Strip double-quoted strings (those are quotes, not own claims).
# DO NOT strip backticks — they hold the assertion target.
MESSAGE_FILTERED="$MESSAGE"

MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | awk '
  BEGIN { in_fence = 0 }
  /^[[:space:]]*```/ { in_fence = !in_fence; print ""; next }
  { if (!in_fence) print; else print "" }
')

MESSAGE_FILTERED=$(echo "$MESSAGE_FILTERED" | sed -E '
  s/"[^"]{1,200}"/ /g
  s/“[^”]{1,200}”/ /g
')

# ── Assertion patterns (ERE) ─────────────────────────────────────
# Each requires a backtick-quoted target. Conservative by design.
ASSERTION_PATTERNS=(
  # File-state claims with backtick-quoted path (must contain a dot extension)
  '`[^`]+\.[a-z0-9]+` (exists|does not exist|is missing|contains|defines|imports|exports|references)'
  # File:line citations in backticks
  '`[^`]+\.[a-z0-9]+`:[0-9]+'
  # Function-behavior claims
  '(the |this )?function `[^`]+` (returns|takes|throws|raises|is defined|does not exist|is missing)'
  # Variable claims
  '(the |this )?variable `[^`]+` (is|equals|contains|defaults to|is set to)'
  # Line-number citations
  'line [0-9]+ of `[^`]+`'
  # Generic backtick:linenum
  '`[^`]+`:[0-9]{2,}'
)

# ── Verification tool calls in recent turn ────────────────────────
# Look at last 20 transcript entries — covers most turn lengths.
# Default to "true" (verified) on parse failure to avoid FP alarms.
HAS_VERIFICATION="true"
if [[ -n "$TRANSCRIPT" ]] && [[ -f "$TRANSCRIPT" ]]; then
  HAS_VERIFICATION=$(jq -s '
    (.[-20:] // []) |
    [.[] | select(.type == "assistant") | .message.content[]? |
      select(.type == "tool_use") | .name] |
    any(. == "Read" or . == "Grep" or . == "Glob" or . == "LS")
  ' "$TRANSCRIPT" 2>/dev/null || echo "true")
fi

# ── Match + decide ────────────────────────────────────────────────
MATCHED_PATTERN=""
for pat in "${ASSERTION_PATTERNS[@]}"; do
  if echo "$MESSAGE_FILTERED" | grep -qiE "$pat"; then
    MATCHED_PATTERN="$pat"
    break
  fi
done

# No assertion → silent pass
if [[ -z "$MATCHED_PATTERN" ]]; then
  exit 0
fi

# Assertion with verification in transcript → silent pass
if [[ "$HAS_VERIFICATION" == "true" ]]; then
  exit 0
fi

# Assertion without verification → log
MSG_PREVIEW=$(echo "$MESSAGE" | head -c 300 | tr '\n' ' ' | tr '"' "'")
jq -nc \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg sid "$SESSION_ID" \
  --arg pat "$MATCHED_PATTERN" \
  --arg prev "$MSG_PREVIEW" \
  '{timestamp: $ts, session_id: $sid, decision: "assertion_without_verification", pattern: $pat, message_preview: $prev}' \
  >> "$EVENT_LOG" 2>/dev/null || true

# Block mode (opt-in via VIBE_VBA_BLOCK=1)
if [[ "${VIBE_VBA_BLOCK:-0}" == "1" ]]; then
  REASON="VERIFY-BEFORE-ASSERT: detected assertion pattern matching '${MATCHED_PATTERN}' in your message, but no Read/Grep/Glob/LS tool call appears in recent transcript turns. Verify the claim with the appropriate tool before asserting facts about repo state. Set VIBE_VBA_BLOCK=0 to revert to log-only mode."
  jq -n --arg reason "$REASON" '{decision: "block", reason: $reason}'
  exit 0
fi

exit 0

#!/usr/bin/env bash
# VIBE Framework — Oracle gate (5.7.0)
# Multi-layer Stop-hook analyzer:
#   1. Hard: unverified file:line claims (cross-ref vs transcript)
#   2. Soft (rubric): structural claim without file:line receipt
#   3. Soft (theater): version-tagged sections + bloat + no receipts + hype
#   4. Soft (hype): hype phrasing without co-located file:line
#   5. Soft (≥3 options): listed alternatives without a recommendation
#
# On HARD_FAIL emits {"decision":"block","reason":"..."}.
# On SOFT_FAIL logs to ${LOG_DIR}/oracle-events.jsonl, allows Stop.
# On PASS exits 0 silently.
#
# Bypass:
#   VIBE_NO_ORACLE=1                            skip silently
#   /tmp/vibe-paused-${SESSION_ID}              skip silently
#   VIBE_ORACLE_RULE_<id>_DISABLED=1            per-rule disable
#                                               (id ∈ {1, 2, 3, RUBRIC, THEATER})

set -uo pipefail

[[ "${VIBE_NO_ORACLE:-0}" == "1" ]] && exit 0

INPUT="$(cat)"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[[ -n "$SESSION_ID" && -f "/tmp/vibe-paused-${SESSION_ID}" ]] && exit 0

# Avoid re-firing on the corrected message (same convention as rhetoric-guard)
HOOK_ACTIVE="$(echo "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[[ "$HOOK_ACTIVE" == "true" ]] && exit 0

MESSAGE="$(echo "$INPUT" | jq -r '.last_assistant_message // empty' 2>/dev/null)"
TRANSCRIPT="$(echo "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)"

# Defensive: extract from transcript if last_assistant_message missing
if [[ -z "$MESSAGE" && -n "$TRANSCRIPT" && -f "$TRANSCRIPT" ]]; then
  MESSAGE="$(jq -s -r '
    [.[] | select(.type == "assistant") |
      .message.content[]? |
      select(.type == "text") |
      .text
    ] | last // empty
  ' "$TRANSCRIPT" 2>/dev/null || true)"
fi

[[ -z "$MESSAGE" ]] && exit 0

# Locate scorer (alongside this script in plugin/scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCORER="${SCRIPT_DIR}/oracle-gate.py"
[[ ! -f "$SCORER" ]] && exit 0

PAYLOAD="$(jq -n --arg m "$MESSAGE" --arg t "$TRANSCRIPT" '{message:$m, transcript_path:$t}')"
VERDICT_JSON="$(echo "$PAYLOAD" | python3 "$SCORER" 2>/dev/null)"
VERDICT="$(echo "$VERDICT_JSON" | jq -r '.verdict // "PASS"' 2>/dev/null)"
REASON="$(echo "$VERDICT_JSON" | jq -r '.reason // empty' 2>/dev/null)"

# Logging
LOG_DIR="${CLAUDE_PLUGIN_DATA:-${HOME}/.claude/plugins/data/vibe-vibe-framework}/oracle"
mkdir -p "$LOG_DIR" 2>/dev/null || true
LOG_FILE="${LOG_DIR}/oracle-events.jsonl"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)"
jq -nc --arg ts "$TS" --arg sid "$SESSION_ID" --arg v "$VERDICT" --arg r "$REASON" \
  '{timestamp:$ts, session_id:$sid, verdict:$v, reason:$r}' \
  >> "$LOG_FILE" 2>/dev/null || true

case "$VERDICT" in
  HARD_FAIL)
    jq -n --arg reason "ORACLE: $REASON" '{decision:"block", reason:$reason}'
    exit 0
    ;;
  SOFT_FAIL|PASS|*)
    exit 0
    ;;
esac

#!/usr/bin/env bash
# Hook: Stop + SubagentStop
# Layer 1: Mechanical completion integrity check.
# Parses the transcript to count tool calls, find VIBE_GATE markers,
# and compare against completion claims in the final message.
#
# Exit 0 = pass (silent)
# Exit 2 = block (stderr shown to model, conversation continues)

set -uo pipefail

# ── Input ──────────────────────────────────────────────────────────
INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // empty')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')

# ── Mode check ─────────────────────────────────────────────────────
MODE="${VIBE_INTEGRITY_MODE:-balanced}"
if [[ "$MODE" == "off" ]]; then
  exit 0
fi

# ── Pause check ────────────────────────────────────────────────────
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# ── Skip if no message or transcript ───────────────────────────────
if [[ -z "$LAST_MSG" ]] || [[ -z "$TRANSCRIPT" ]] || [[ ! -f "$TRANSCRIPT" ]]; then
  exit 0
fi

# ── File namespacing ───────────────────────────────────────────────
if [[ -n "$AGENT_ID" ]]; then
  SENTINEL_FILE="/tmp/vibe-sentinel-${SESSION_ID}-${AGENT_ID}.json"
  BLOCK_FLAG="/tmp/vibe-integrity-blocked-${SESSION_ID}-${AGENT_ID}"
else
  SENTINEL_FILE="/tmp/vibe-sentinel-${SESSION_ID}.json"
  BLOCK_FLAG="/tmp/vibe-integrity-blocked-${SESSION_ID}"
fi

LOG_FILE="/tmp/vibe-integrity-events-$(date -u +%Y-%m-%d).jsonl"

# ── Resolution mode check ─────────────────────────────────────────
RESOLUTION_MODE=false
if [[ -f "$BLOCK_FLAG" ]]; then
  RESOLUTION_MODE=true
fi

# ── Phase A and B will be added in subsequent tasks ────────────────
exit 0

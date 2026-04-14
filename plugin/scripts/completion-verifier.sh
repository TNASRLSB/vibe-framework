#!/usr/bin/env bash
# Hook: Stop + SubagentStop (Layer 2 command fallback)
# Mechanical file/output verification.
# Reads Layer 1 sentinel findings and verifies file existence and counts.
# Used as fallback if type:agent hooks don't work at runtime.
#
# Exit 0 = pass
# Exit 2 = discrepancies found

set -uo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')

MODE="${VIBE_INTEGRITY_MODE:-balanced}"
if [[ "$MODE" != "strict" ]] && [[ "$MODE" != "balanced" ]]; then
  exit 0
fi

# Check pause
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Find sentinel file
if [[ -n "$AGENT_ID" ]]; then
  SENTINEL_FILE="/tmp/vibe-sentinel-${SESSION_ID}-${AGENT_ID}.json"
else
  SENTINEL_FILE="/tmp/vibe-sentinel-${SESSION_ID}.json"
fi

if [[ ! -f "$SENTINEL_FILE" ]]; then
  exit 0
fi

FINDINGS=$(cat "$SENTINEL_FILE")

# Check activation conditions
TOTAL_TOOLS=$(echo "$FINDINGS" | jq '.total_tools_this_turn // 0')
HAS_FAIL=$(echo "$FINDINGS" | jq -r '.has_any_fail // false')
HAS_WARN=$(echo "$FINDINGS" | jq -r '.has_any_warn // false')
RESOLVED=$(echo "$FINDINGS" | jq -r '.resolved // false')

# Skip if resolved, low tool count, or nothing flagged
if [[ "$RESOLVED" == "true" ]]; then exit 0; fi
if (( TOTAL_TOOLS < 5 )); then exit 0; fi
if [[ "$HAS_FAIL" == "false" ]] && [[ "$HAS_WARN" == "false" ]]; then exit 0; fi

# ── Mechanical file verification ───────────────────────────────────
DISCREPANCIES=""

# Check known VIBE output locations
if [[ -d ".vibe/competitor-research" ]]; then
  CR_FILES=$(ls .vibe/competitor-research/ 2>/dev/null | wc -l | tr -d ' ')
  DISCREPANCIES+="  Competitor research dir: $CR_FILES files\n"
fi

if [[ -d "/tmp/vibe-cr" ]]; then
  SC_FILES=$(ls /tmp/vibe-cr/*.png 2>/dev/null | wc -l | tr -d ' ')
  DISCREPANCIES+="  Screenshots: $SC_FILES .png files in /tmp/vibe-cr/\n"
fi

# Re-run VIBE_GATE marker checks against file system
GATE_MARKERS=$(echo "$FINDINGS" | jq -c '.gate_markers // []')
GATE_LEN=$(echo "$GATE_MARKERS" | jq 'length')
RECHECK_ISSUES=""

if (( GATE_LEN > 0 )); then
  for i in $(seq 0 $((GATE_LEN - 1))); do
    KEY=$(echo "$GATE_MARKERS" | jq -r ".[$i].key")
    VAL=$(echo "$GATE_MARKERS" | jq -r ".[$i].val")

    case "$KEY" in
      screenshot_count)
        ACTUAL=$(ls /tmp/vibe-cr/*.png 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$ACTUAL" != "$VAL" ]]; then
          RECHECK_ISSUES+="  VIBE_GATE $KEY: marker says $VAL, filesystem recheck says $ACTUAL\n"
        fi
        ;;
      json_entries)
        if [[ -f ".vibe/competitor-research/competitors.json" ]]; then
          ACTUAL=$(jq 'length' .vibe/competitor-research/competitors.json 2>/dev/null || echo "error")
          if [[ "$ACTUAL" != "$VAL" ]]; then
            RECHECK_ISSUES+="  VIBE_GATE $KEY: marker says $VAL, filesystem recheck says $ACTUAL\n"
          fi
        fi
        ;;
      empty_files)
        if [[ -d "/tmp/vibe-cr" ]]; then
          ACTUAL=$(find /tmp/vibe-cr/ -name '*.png' -empty 2>/dev/null | wc -l | tr -d ' ')
          if [[ "$ACTUAL" != "$VAL" ]]; then
            RECHECK_ISSUES+="  VIBE_GATE $KEY: marker says $VAL, filesystem recheck says $ACTUAL\n"
          fi
        fi
        ;;
    esac
  done
fi

if [[ -n "$RECHECK_ISSUES" ]]; then
  DISCREPANCIES+="VIBE_GATE filesystem recheck discrepancies:\n$RECHECK_ISSUES"
fi

# If no discrepancies found by file checks, defer to Layer 1 findings
if [[ -z "$DISCREPANCIES" ]]; then
  exit 0
fi

# Report discrepancies
if [[ "$MODE" == "strict" ]]; then
  cat >&2 << BLOCK_MSG
VIBE DEEP VERIFICATION — file system checks found discrepancies:

$(echo -e "$DISCREPANCIES")

Address these discrepancies before claiming completion.
BLOCK_MSG
  exit 2
fi

# Balanced mode
cat >&2 << REPORT_MSG
VIBE DEEP VERIFICATION found potential discrepancies:

$(echo -e "$DISCREPANCIES")

Present these findings to the user and ask how they want to proceed.
REPORT_MSG
exit 2

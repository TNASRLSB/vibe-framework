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

# ── Phase A: Extract last turn from transcript ─────────────────────
# Find the last user message with text content (not just tool_results),
# then count all tool_use blocks in assistant messages after that point.

TURN_DATA=$(jq -s '
  # Find last user message with actual text content (not just tool_results)
  (
    [to_entries[] | select(
      .value.type == "user" and (
        (.value.message.content | type) == "string" or
        ((.value.message.content | type) == "array" and
          (.value.message.content | map(select(.type == "text")) | length > 0) and
          (.value.message.content | map(select(.type == "tool_result")) | length == 0))
      )
    )] | last.key // 0
  ) as $last_user_idx |

  # All assistant tool_use blocks after that index
  [.[$last_user_idx:][] |
    select(.type == "assistant") |
    .message.content[]? |
    select(.type == "tool_use") |
    { name: .name, input: .input }
  ] as $tool_calls |

  # All tool_result text content after that index
  [.[$last_user_idx:][] |
    select(.type == "user") |
    .message.content[]? // empty |
    select(type == "object" and .type == "tool_result") |
    (.content[]? // empty | select(type == "object" and .type == "text") | .text) // ""
  ] as $tool_results |

  # Count by tool name
  ($tool_calls | group_by(.name) | map({key: .[0].name, value: length}) | from_entries) as $counts |

  # Read targets (file paths from Read tool)
  [$tool_calls[] | select(.name == "Read") | .input.file_path // empty] as $read_targets |

  # Image reads (Read on image files)
  [$read_targets[] | select(test("\\.(png|jpg|jpeg|webp|gif|svg)$"; "i"))] as $image_reads |

  # Bash commands
  [$tool_calls[] | select(.name == "Bash") | .input.command // empty] as $bash_cmds |

  # VIBE_GATE markers from tool results
  [$tool_results[] | capture("VIBE_GATE: (?<key>[^=]+)=(?<val>.+)") // empty] as $gate_markers |

  # Skill invocations
  [$tool_calls[] | select(.name == "Skill") | .input.skill // empty] as $skills_used |

  # Agent calls
  [$tool_calls[] | select(.name == "Agent")] as $agent_calls |

  # Check if there are Read/Bash calls AFTER the last Agent call
  (
    if ($agent_calls | length) > 0 then
      ($tool_calls | to_entries | map(select(.value.name == "Agent")) | last.key) as $last_agent_idx |
      [$tool_calls[$last_agent_idx + 1:][] | select(.name == "Read" or .name == "Bash")] | length > 0
    else true end
  ) as $verified_after_agent |

  {
    tool_counts: $counts,
    total_tools: ($tool_calls | length),
    read_targets: $read_targets,
    image_reads_count: ($image_reads | length),
    bash_commands: $bash_cmds,
    gate_markers: $gate_markers,
    skills_used: $skills_used,
    has_skill: (($skills_used | length) > 0),
    verified_after_agent: $verified_after_agent,
    has_agent_calls: (($agent_calls | length) > 0)
  }
' "$TRANSCRIPT" 2>/dev/null)

if [[ -z "$TURN_DATA" ]] || [[ "$TURN_DATA" == "null" ]]; then
  exit 0
fi

# Extract values for use in checks
TOTAL_TOOLS=$(echo "$TURN_DATA" | jq '.total_tools')
IMAGE_READS=$(echo "$TURN_DATA" | jq '.image_reads_count')
HAS_SKILL=$(echo "$TURN_DATA" | jq -r '.has_skill')
VERIFIED_AFTER_AGENT=$(echo "$TURN_DATA" | jq -r '.verified_after_agent')
HAS_AGENT_CALLS=$(echo "$TURN_DATA" | jq -r '.has_agent_calls')
GATE_MARKERS=$(echo "$TURN_DATA" | jq '.gate_markers')
GATE_COUNT=$(echo "$GATE_MARKERS" | jq 'length')

# Check if any Bash command contains test/build keywords
HAS_TEST_CMD=$(echo "$TURN_DATA" | jq -r '
  [.bash_commands[] | select(
    test("test|jest|pytest|vitest|mocha|cargo.test|go.test|npm.run|pnpm|yarn|make|build|lint|tsc|eslint|ruff|cargo.clippy|go.vet"; "i")
  )] | length > 0
')

# ── Phase B: Run 6 independent checks ─────────────────────────────
# NOTE: Uses individual variables (CK_{name}_s/c/d) instead of
# associative arrays for bash 3.2 compatibility (macOS ships 3.2).

HAS_FAIL=false
HAS_WARN=false

# Multilingual completion indicators
COMPLETION_RE='(done|complete[d]?|finished|fatto|completo|completato|terminat[oaie]*|tutti|all|every|each|ogni|terminé|complété|terminado|completado|concluído|finalizado|fertig|abgeschlossen)'

MSG_LOWER=$(echo "$LAST_MSG" | tr '[:upper:]' '[:lower:]')
HAS_COMPLETION=$(echo "$MSG_LOWER" | grep -ciP "$COMPLETION_RE" || true)
MSG_LEN=${#LAST_MSG}

# ── Check 1: Zero-Tool Completion ──────────────────────────────────
if (( HAS_COMPLETION > 0 )) && (( TOTAL_TOOLS == 0 )); then
  CK_zero_tool_s="fail"; CK_zero_tool_c="high"
  CK_zero_tool_d="Message contains completion indicators but turn has 0 tool calls"
  HAS_FAIL=true
else
  CK_zero_tool_s="pass"; CK_zero_tool_c=""; CK_zero_tool_d=""
fi

# ── Check 2: Context-Aware Numerical Discrepancy ──────────────────
CK_numerical_s="pass"; CK_numerical_c=""; CK_numerical_d=""

WORK_NUMBERS=$(echo "$LAST_MSG" | grep -oP '\b(\d+)\b\s*(competitor|screenshot|image|visual|page|site|file|test|pagina|sito|immagine|competit)' | grep -oP '^\d+' || true)
if [[ -z "$WORK_NUMBERS" ]]; then
  WORK_NUMBERS=$(echo "$LAST_MSG" | grep -oP '(competitor|screenshot|image|visual|page|site|file|test|analyz|review|process|check|examin|creat|analizzat|verificat|controllat|esaminat)\w*\s+(\d+)' | grep -oP '\d+' || true)
fi
if [[ -z "$WORK_NUMBERS" ]]; then
  WORK_NUMBERS=$(echo "$LAST_MSG" | grep -oP '(all|tutti|every|each|ogni)\s+(\d+)' | grep -oP '\d+' || true)
fi

for NUM in $WORK_NUMBERS; do
  if (( NUM <= 5 )); then continue; fi

  # Determine context-specific tool count
  RELEVANT_COUNT=$TOTAL_TOOLS
  if echo "$LAST_MSG" | grep -qiP '(screenshot|image|visual|design|visuale|immagine)'; then
    RELEVANT_COUNT=$IMAGE_READS
  fi

  THRESHOLD=$(echo "$NUM * 0.85" | bc 2>/dev/null | cut -d. -f1 || echo $((NUM * 85 / 100)))
  THRESHOLD_HIGH=$(echo "$NUM * 0.5" | bc 2>/dev/null | cut -d. -f1 || echo $((NUM * 50 / 100)))

  if (( RELEVANT_COUNT < THRESHOLD_HIGH )); then
    CK_numerical_s="fail"; CK_numerical_c="high"
    CK_numerical_d="Message claims $NUM items, turn has $RELEVANT_COUNT relevant tool calls (ratio $(echo "scale=2; $RELEVANT_COUNT / $NUM" | bc 2>/dev/null || echo '?'))"
    HAS_FAIL=true; break
  elif (( RELEVANT_COUNT < THRESHOLD )); then
    CK_numerical_s="fail"; CK_numerical_c="medium"
    CK_numerical_d="Message claims $NUM items, turn has $RELEVANT_COUNT relevant tool calls (ratio $(echo "scale=2; $RELEVANT_COUNT / $NUM" | bc 2>/dev/null || echo '?'))"
    HAS_FAIL=true; break
  fi
done

# ── Check 3: Test/Build Claim Without Execution ───────────────────
TEST_CLAIM_RE='(tests?\s+pass|build\s+succeed|lint\s+clean|0\s+error|no\s+error|test\s+superat|build\s+riuscit|nessun\s+errore|tous\s+les\s+tests)'
if echo "$MSG_LOWER" | grep -qiP "$TEST_CLAIM_RE" && [[ "$HAS_TEST_CMD" == "false" ]]; then
  CK_test_claim_s="fail"; CK_test_claim_c="high"
  CK_test_claim_d="Message claims test/build results but no test/build Bash commands found in turn"
  HAS_FAIL=true
else
  CK_test_claim_s="pass"; CK_test_claim_c=""; CK_test_claim_d=""
fi

# ── Check 4: Subagent Trust Without Verification ──────────────────
AGENT_REF_RE="(agent found|agent completed|agent analysis|agent report|l'agent ha|the agent|l'agente ha|l'agent a)"
if echo "$MSG_LOWER" | grep -qiP "$AGENT_REF_RE" && [[ "$HAS_AGENT_CALLS" == "true" ]] && [[ "$VERIFIED_AFTER_AGENT" == "false" ]]; then
  CK_subagent_s="warn"; CK_subagent_c="medium"
  CK_subagent_d="Message references agent results as fact but no Read/Bash calls found after last Agent dispatch"
  HAS_WARN=true
else
  CK_subagent_s="pass"; CK_subagent_c=""; CK_subagent_d=""
fi

# ── Check 5: Completion Scope Mismatch ─────────────────────────────
TOTALITY_RE='(all|every|each|complete|tutti|ogni|tutto|completo|terminat|finished|done|tous|cada|alle|jeder)'
if echo "$MSG_LOWER" | grep -qiP "$TOTALITY_RE" && (( TOTAL_TOOLS < 5 )) && (( MSG_LEN > 200 )); then
  CK_scope_s="warn"; CK_scope_c="medium"
  CK_scope_d="Message claims totality with only $TOTAL_TOOLS tool calls and $MSG_LEN char message"
  HAS_WARN=true
else
  CK_scope_s="pass"; CK_scope_c=""; CK_scope_d=""
fi

# ── Check 6: VIBE Gate Verification ────────────────────────────────
if [[ "$HAS_SKILL" == "true" ]] && (( HAS_COMPLETION > 0 )); then
  if (( GATE_COUNT == 0 )); then
    CK_gate_s="fail"; CK_gate_c="high"
    CK_gate_d="VIBE skill was used and completion claimed but no VIBE_GATE verification markers found in Bash outputs"
    HAS_FAIL=true
  else
    CK_gate_s="pass"; CK_gate_c=""; CK_gate_d=""
  fi
else
  CK_gate_s="pass"; CK_gate_c=""; CK_gate_d=""
fi

# ── Output and exit logic will be added in Task 5 ─────────────────
exit 0

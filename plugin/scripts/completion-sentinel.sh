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
  elif echo "$LAST_MSG" | grep -qiP '(page|site|url|web|sito|pagina|fetch)'; then
    RELEVANT_COUNT=$(echo "$TURN_DATA" | jq '.tool_counts.WebFetch // 0')
  elif echo "$LAST_MSG" | grep -qiP '(file|code|source|codice|sorgente)'; then
    # Non-image reads = total reads - image reads
    TOTAL_READS=$(echo "$TURN_DATA" | jq '.tool_counts.Read // 0')
    RELEVANT_COUNT=$((TOTAL_READS - IMAGE_READS))
  elif echo "$LAST_MSG" | grep -qiP '(test|check|verifica|controlla)'; then
    # Count Bash calls with test keywords
    RELEVANT_COUNT=$(echo "$TURN_DATA" | jq '[.bash_commands[] | select(test("test|jest|pytest|vitest|mocha|cargo.test|go.test"; "i"))] | length')
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
    # Inspect marker values — compare against numbers in the message
    CK_gate_s="pass"; CK_gate_c=""; CK_gate_d=""

    # Extract all numbers from the completion message
    MSG_NUMBERS=$(echo "$LAST_MSG" | grep -oP '\d+' | sort -rn | head -5)

    # Check each gate marker value against message numbers
    for i in $(seq 0 $((GATE_COUNT - 1))); do
      MARKER_KEY=$(echo "$GATE_MARKERS" | jq -r ".[$i].key")
      MARKER_VAL=$(echo "$GATE_MARKERS" | jq -r ".[$i].val")

      # Skip non-numeric values
      if ! echo "$MARKER_VAL" | grep -qP '^\d+$'; then continue; fi

      # Check if message claims a number larger than the marker shows
      for MSG_NUM in $MSG_NUMBERS; do
        if ! echo "$MSG_NUM" | grep -qP '^\d+$'; then continue; fi
        if (( MSG_NUM > 5 )) && (( MARKER_VAL < MSG_NUM )); then
          # Message claims MSG_NUM but marker shows MARKER_VAL (less)
          CK_gate_s="fail"; CK_gate_c="high"
          CK_gate_d="VIBE_GATE ${MARKER_KEY}=${MARKER_VAL} but message claims ${MSG_NUM}"
          HAS_FAIL=true
          break 2
        fi
      done
    done
  fi
else
  CK_gate_s="pass"; CK_gate_c=""; CK_gate_d=""
fi

# ── Resolution Mode ────────────────────────────────────────────────
if [[ "$RESOLUTION_MODE" == "true" ]]; then
  HAS_NEW_TOOLS=false
  if (( TOTAL_TOOLS > 0 )); then
    HAS_NEW_TOOLS=true
  fi

  HAS_SPECIFIC_COUNTS=false
  if echo "$LAST_MSG" | grep -qP '\d+\s*(of|out of|di|su|de|von|sur)\s*\d+'; then
    HAS_SPECIFIC_COUNTS=true
  fi

  if [[ "$HAS_NEW_TOOLS" == "true" ]] || [[ "$HAS_SPECIFIC_COUNTS" == "true" ]]; then
    rm -f "$BLOCK_FLAG"
    jq -n \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --arg mode "$MODE" \
      --arg event "$HOOK_EVENT" \
      --argjson resolution true \
      '{timestamp: $ts, mode: $mode, hook_event: $event, resolution_mode: $resolution, resolved: true}' \
      > "$SENTINEL_FILE"
    jq -nc \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --arg sid "$SESSION_ID" \
      --arg res "resolved" \
      '{timestamp: $ts, session_id: $sid, resolution: $res}' \
      >> "$LOG_FILE" 2>/dev/null
    exit 0
  fi

  TOTALITY_RE='(all|every|each|complete|tutti|ogni|tutto|completo|terminat|finished|done|tous|cada|alle|jeder)'
  if echo "$MSG_LOWER" | grep -qiP "$TOTALITY_RE" && (( TOTAL_TOOLS == 0 )); then
    cat >&2 << 'RESOLUTION_BLOCK'
VIBE INTEGRITY — your previous response was flagged for discrepancies.

Your follow-up still claims total completion without new tool calls or specific counts.

YOUR RESPONSE MUST CONTAIN:
- Specific counts: "I completed X of Y. Missing items: [list]"
- OR new tool calls actually completing the missing work

Apologies, rephrased claims, and "I'll fix this" are not acceptable.
RESOLUTION_BLOCK
    exit 2
  fi

  rm -f "$BLOCK_FLAG"
  exit 0
fi

# ── Write findings JSON ────────────────────────────────────────────
_ckj() {
  local s="$1" c="$2" d="$3"
  if [[ "$s" == "pass" ]]; then
    echo '{"status":"pass"}'
  else
    jq -n --arg s "$s" --arg c "$c" --arg d "$d" '{status:$s,confidence:$c,detail:$d}'
  fi
}

FINDINGS=$(jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg mode "$MODE" \
  --arg event "$HOOK_EVENT" \
  --arg agent_id "$AGENT_ID" \
  --argjson resolution false \
  --argjson tool_counts "$(echo "$TURN_DATA" | jq '.tool_counts')" \
  --argjson image_reads "$IMAGE_READS" \
  --argjson total "$TOTAL_TOOLS" \
  --argjson gate_markers "$GATE_MARKERS" \
  --argjson has_fail "$HAS_FAIL" \
  --argjson has_warn "$HAS_WARN" \
  --argjson check_zero "$(_ckj "$CK_zero_tool_s" "$CK_zero_tool_c" "$CK_zero_tool_d")" \
  --argjson check_num "$(_ckj "$CK_numerical_s" "$CK_numerical_c" "$CK_numerical_d")" \
  --argjson check_test "$(_ckj "$CK_test_claim_s" "$CK_test_claim_c" "$CK_test_claim_d")" \
  --argjson check_agent "$(_ckj "$CK_subagent_s" "$CK_subagent_c" "$CK_subagent_d")" \
  --argjson check_scope "$(_ckj "$CK_scope_s" "$CK_scope_c" "$CK_scope_d")" \
  --argjson check_gate "$(_ckj "$CK_gate_s" "$CK_gate_c" "$CK_gate_d")" \
  '{
    timestamp: $ts, mode: $mode, hook_event: $event,
    agent_id: (if $agent_id == "" then null else $agent_id end),
    resolution_mode: $resolution,
    checks: {
      zero_tool_completion: $check_zero,
      numerical_discrepancy: $check_num,
      test_without_execution: $check_test,
      subagent_trust: $check_agent,
      scope_mismatch: $check_scope,
      gate_verification: $check_gate
    },
    tool_counts: $tool_counts,
    image_reads: $image_reads,
    total_tools_this_turn: $total,
    gate_markers: $gate_markers,
    has_any_fail: $has_fail,
    has_any_warn: $has_warn
  }')

echo "$FINDINGS" > "$SENTINEL_FILE"

# ── All pass → exit clean ──────────────────────────────────────────
if [[ "$HAS_FAIL" == "false" ]] && [[ "$HAS_WARN" == "false" ]]; then
  exit 0
fi

# ── Log integrity event ────────────────────────────────────────────
FAILED_CHECKS=""
WARNED_CHECKS=""
FIRST_DETAIL=""
for _ck_pair in \
  "zero_tool:$CK_zero_tool_s:$CK_zero_tool_d" \
  "numerical:$CK_numerical_s:$CK_numerical_d" \
  "test_claim:$CK_test_claim_s:$CK_test_claim_d" \
  "subagent:$CK_subagent_s:$CK_subagent_d" \
  "scope:$CK_scope_s:$CK_scope_d" \
  "gate:$CK_gate_s:$CK_gate_d"; do
  _ck_name="${_ck_pair%%:*}"; _ck_rest="${_ck_pair#*:}"
  _ck_stat="${_ck_rest%%:*}"; _ck_det="${_ck_rest#*:}"
  if [[ "$_ck_stat" == "fail" ]]; then
    FAILED_CHECKS="${FAILED_CHECKS}${_ck_name},"
    if [[ -z "$FIRST_DETAIL" ]]; then FIRST_DETAIL="$_ck_det"; fi
  elif [[ "$_ck_stat" == "warn" ]]; then
    WARNED_CHECKS="${WARNED_CHECKS}${_ck_name},"
  fi
done

SKILL_DETECTED=$(echo "$TURN_DATA" | jq -r '.skills_used[0] // "none"')

jq -nc \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg sid "$SESSION_ID" \
  --arg aid "$AGENT_ID" \
  --arg event "$HOOK_EVENT" \
  --arg mode "$MODE" \
  --arg failed "${FAILED_CHECKS%,}" \
  --arg warned "${WARNED_CHECKS%,}" \
  --arg detail "$FIRST_DETAIL" \
  --arg skill "$SKILL_DETECTED" \
  '{timestamp: $ts, session_id: $sid, agent_id: (if $aid == "" then null else $aid end),
    hook_event: $event, mode: $mode,
    checks_failed: ($failed | split(",")), checks_warned: ($warned | split(",")),
    detail: $detail, skill_detected: $skill, resolution: "pending"}' \
  >> "$LOG_FILE" 2>/dev/null

# ── Exit decision by mode ──────────────────────────────────────────
should_block() {
  case "$MODE" in
    strict)
      return 0
      ;;
    balanced)
      for _sb_pair in \
        "$CK_zero_tool_s:$CK_zero_tool_c" \
        "$CK_numerical_s:$CK_numerical_c" \
        "$CK_test_claim_s:$CK_test_claim_c" \
        "$CK_subagent_s:$CK_subagent_c" \
        "$CK_scope_s:$CK_scope_c" \
        "$CK_gate_s:$CK_gate_c"; do
        _sb_stat="${_sb_pair%%:*}"; _sb_conf="${_sb_pair#*:}"
        if [[ "$_sb_stat" == "fail" ]] && [[ "$_sb_conf" == "high" ]]; then
          return 0
        fi
      done
      return 1
      ;;
    light)
      return 1
      ;;
  esac
  return 1
}

build_block_message() {
  local msg="VIBE INTEGRITY CHECK — discrepancies found between your claims and evidence.\n\n"

  for _bm_tuple in \
    "ZERO_TOOL:$CK_zero_tool_s:$CK_zero_tool_c:$CK_zero_tool_d" \
    "NUMERICAL:$CK_numerical_s:$CK_numerical_c:$CK_numerical_d" \
    "TEST_CLAIM:$CK_test_claim_s:$CK_test_claim_c:$CK_test_claim_d" \
    "SUBAGENT:$CK_subagent_s:$CK_subagent_c:$CK_subagent_d" \
    "SCOPE:$CK_scope_s:$CK_scope_c:$CK_scope_d" \
    "GATE:$CK_gate_s:$CK_gate_c:$CK_gate_d"; do
    IFS=':' read -r _bm_label _bm_stat _bm_conf _bm_det <<< "$_bm_tuple"
    if [[ "$_bm_stat" == "fail" ]]; then
      msg+="[${_bm_label} FAIL (${_bm_conf})] ${_bm_det}\n\n"
    elif [[ "$_bm_stat" == "warn" ]]; then
      msg+="[${_bm_label} WARN] ${_bm_det}\n\n"
    fi
  done

  msg+="YOUR RESPONSE MUST CONTAIN ONE OF:\n"
  msg+="A) New tool calls completing the missing work, then updated verification\n"
  msg+="B) Specific counts: \"I completed X of Y items. The items I did not complete are: [list]\"\n\n"
  msg+="THE FOLLOWING WILL TRIGGER ANOTHER BLOCK:\n"
  msg+="- Apologies without specific counts\n"
  msg+="- Rephrased completion claims without new tool calls\n"
  msg+="- Any claim of totality (all/every/tutti) without new evidence\n"

  echo -e "$msg"
}

if should_block; then
  touch "$BLOCK_FLAG"
  build_block_message >&2
  exit 2
fi

# Light mode or balanced without high-confidence fails
if [[ "$MODE" == "light" ]]; then
  echo "VIBE integrity report (non-blocking):"
  for _ck_pair in \
    "zero_tool:$CK_zero_tool_s:$CK_zero_tool_d" \
    "numerical:$CK_numerical_s:$CK_numerical_d" \
    "test_claim:$CK_test_claim_s:$CK_test_claim_d" \
    "subagent:$CK_subagent_s:$CK_subagent_d" \
    "scope:$CK_scope_s:$CK_scope_d" \
    "gate:$CK_gate_s:$CK_gate_d"; do
    _ck_name="${_ck_pair%%:*}"; _ck_rest="${_ck_pair#*:}"
    _ck_stat="${_ck_rest%%:*}"; _ck_det="${_ck_rest#*:}"
    if [[ "$_ck_stat" != "pass" ]]; then
      echo "  [${_ck_name}] ${_ck_stat}: ${_ck_det}"
    fi
  done
fi

exit 0

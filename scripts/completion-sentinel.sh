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

# ── Phase B and output will be added in subsequent tasks ───────────
exit 0

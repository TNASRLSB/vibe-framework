#!/usr/bin/env bash
# Hook: UserPromptSubmit
# Detects correction patterns in user prompts across 6 languages.
# Saves matches to learnings queue for later processing by /vibe:reflect.
# Conservative matching — false positives are OK.
# Always exits 0 (never blocks user input).

set +e  # Never exit on error — this hook must always succeed
trap 'exit 0' ERR  # On any error, exit 0 silently

# Read JSON input from stdin
INPUT=$(cat)

# Check pause flag
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
if [[ -n "$SESSION_ID" ]] && [[ -f "/tmp/vibe-paused-${SESSION_ID}" ]]; then
  exit 0
fi

# Extract prompt text
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
if [[ -z "$PROMPT" ]]; then
  exit 0
fi

# Correction patterns across 6 languages (case-insensitive)
# EN: no/not like that, don't do, wrong, I said, I meant, instead, should have, actually
# IT: no così, non fare, sbagliato, ho detto, intendevo, invece, dovevi, veramente
# ES: no así, no hagas, mal, dije, quise decir, en vez, debías, en realidad
# FR: pas comme ça, ne fais pas, faux, j'ai dit, je voulais dire, plutôt, tu aurais dû, en fait
# DE: nicht so, mach nicht, falsch, ich sagte, ich meinte, stattdessen, hättest, eigentlich
# PT: não assim, não faça, errado, eu disse, quis dizer, em vez, deveria, na verdade

CORRECTION_PATTERN='(no[,.]?\s*(not like that|that.s wrong|I said|I meant|I wanted|don.t do|stop doing|wrong|instead|should have|actually))'
CORRECTION_PATTERN+="|"
CORRECTION_PATTERN+='(non?\s*(così|fare|è sbagliato|ho detto|intendevo|volevo|invece|dovevi|veramente))'
CORRECTION_PATTERN+="|"
CORRECTION_PATTERN+='(no\s*(así|hagas|está mal|dije|quise decir|en vez|debías|en realidad))'
CORRECTION_PATTERN+="|"
CORRECTION_PATTERN+='(pas comme ça|ne fais pas|c.est faux|j.ai dit|je voulais dire|plutôt|tu aurais dû|en fait)'
CORRECTION_PATTERN+="|"
CORRECTION_PATTERN+='(nicht so|mach nicht|falsch|ich sagte|ich meinte|stattdessen|hättest|eigentlich)'
CORRECTION_PATTERN+="|"
CORRECTION_PATTERN+='(não assim|não faça|errado|eu disse|quis dizer|em vez|deveria|na verdade)'

if echo "$PROMPT" | grep -iPq "$CORRECTION_PATTERN" 2>/dev/null; then
  # Match found — save to queue
  DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}"
  QUEUE_DIR="${DATA_DIR}/learnings"
  QUEUE_FILE="${QUEUE_DIR}/queue.jsonl"

  mkdir -p "$QUEUE_DIR"

  TIMESTAMP=$(date -Iseconds)

  # Write as single JSON line
  jq -nc \
    --arg ts "$TIMESTAMP" \
    --arg prompt "$PROMPT" \
    --arg session "$SESSION_ID" \
    '{timestamp: $ts, prompt: $prompt, session_id: $session, type: "correction"}' \
    >> "$QUEUE_FILE"
fi

exit 0

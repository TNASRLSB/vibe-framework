#!/usr/bin/env bash
# Hook: UserPromptSubmit
# Detects correction patterns and queues them for /vibe:reflect.
# MUST always exit 0 — never block user input.

INPUT=$(cat) || exit 0

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null) || exit 0
if [ -n "$SESSION_ID" ] && [ -f "/tmp/vibe-paused-${SESSION_ID}" ]; then
  exit 0
fi

PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null) || exit 0
if [ -z "$PROMPT" ]; then
  exit 0
fi

# Check for correction patterns (multilingual, case-insensitive)
LOWER=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]' 2>/dev/null) || exit 0

MATCH=""
# English
case "$LOWER" in
  "no, "*|"no. "*|"don't "*|"do not "*|"stop "*|"wrong"*|"actually,"*|"actually "*|"i said "*|"i told you"*|"not like that"*|"that's not"*) MATCH=1 ;;
esac
# Italian
case "$LOWER" in
  "no, "*"non "*|"non fare"*|"non così"*|"sbagliato"*|"ti avevo detto"*|"doveva essere"*) MATCH=1 ;;
esac
# Spanish
case "$LOWER" in
  "no, "*"no "*|"no hagas"*|"así no"*|"está mal"*|"te dije"*) MATCH=1 ;;
esac
# French
case "$LOWER" in
  "pas comme"*|"ne fais pas"*|"c'est pas"*|"je t'avais dit"*) MATCH=1 ;;
esac
# German
case "$LOWER" in
  "nein"*|"mach das nicht"*|"nicht so"*|"falsch"*|"ich hatte gesagt"*) MATCH=1 ;;
esac
# Portuguese
case "$LOWER" in
  *"não"*"faça"*|"não assim"*|"está errado"*|"eu disse"*) MATCH=1 ;;
esac

if [ -n "$MATCH" ]; then
  DATA_DIR="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings"
  mkdir -p "$DATA_DIR" 2>/dev/null
  TS=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "unknown")
  jq -nc --arg ts "$TS" --arg p "$PROMPT" --arg s "$SESSION_ID" \
    '{timestamp:$ts,prompt:$p,session_id:$s}' >> "$DATA_DIR/queue.jsonl" 2>/dev/null
fi

exit 0

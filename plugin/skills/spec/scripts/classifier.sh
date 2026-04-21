#!/usr/bin/env bash
# ============================================================================
# classifier.sh — hybrid classifier for /vibe:spec (§2.8c)
# ----------------------------------------------------------------------------
# Classifies a user spec request as creative-heavy or instruction-heavy and
# picks the best Opus variant for the spec-writing phase. Also estimates
# output mode (single-doc vs split).
#
# Usage: classifier.sh "<user request text>"
#
# Output (JSON on stdout):
#   {
#     "model": "<opus-4-6|opus-4-7>",
#     "mode": "<single|split>",
#     "confidence": <float 0-1>,
#     "method": "<keyword|llm|fallback|env-override>",
#     "debug": {
#       "creative_score": <int>,
#       "instruction_score": <int>,
#       "scope_matches": <int>,
#       "request_tokens": <int>
#     }
#   }
#
# Always exits 0 (never fails — fallback to opus-4-7 on any error).
#
# Env overrides:
#   VIBE_SPEC_FORCE_MODEL=<model-id>  bypass classifier, force model
#
# Decisions (from master spec §9 + review 2):
#   - Word-boundary regex for keyword matching (decision #17)
#   - Strong-signal rule: max >= 2 AND max >= 2 * min (review 2 C2 fix)
#   - LLM fallback: haiku-4-5 with structured classification prompt
#   - LLM parse: regex \b(creative|instruction|ambiguous)\b on lowercase
#   - Final fallback: opus-4-7 literal (decision #2)
# ============================================================================

set -uo pipefail

REQUEST="${1:-}"
if [[ -z "$REQUEST" ]]; then
    echo '{"error": "no request provided", "model": "opus-4-7", "mode": "single", "confidence": 0.0, "method": "fallback"}'
    exit 1
fi

# Env override — bypass everything
if [[ -n "${VIBE_SPEC_FORCE_MODEL:-}" ]]; then
    jq -n \
        --arg model "$VIBE_SPEC_FORCE_MODEL" \
        '{model: $model, mode: "single", confidence: 1.0, method: "env-override", debug: {}}'
    exit 0
fi

# --- Keyword fast-path ---
# Word-boundary regex (decision #17): matches "design" but not "description"
CREATIVE_KW='\b(design|creative|brainstorm|UX|UI|style|copy|aesthetic|visual|storyboard)\b'
INSTRUCTION_KW='\b(refactor|spec|requirements|systematic|compliance|document|structure|migrate|port|threshold)\b'
SCOPE_KW='\b(refactor|v2|multi-phase|ship|release|major)\b'

# Case-insensitive counts
REQUEST_LOWER=$(echo "$REQUEST" | tr '[:upper:]' '[:lower:]')
CREATIVE_SCORE=$(echo "$REQUEST_LOWER" | grep -o -E "$CREATIVE_KW" 2>/dev/null | wc -l | tr -d ' ')
INSTRUCTION_SCORE=$(echo "$REQUEST_LOWER" | grep -o -E "$INSTRUCTION_KW" 2>/dev/null | wc -l | tr -d ' ')
SCOPE_MATCHES=$(echo "$REQUEST_LOWER" | grep -o -E "$SCOPE_KW" 2>/dev/null | wc -l | tr -d ' ')

# Default ints (handle grep returning 0 matches → empty count)
CREATIVE_SCORE=${CREATIVE_SCORE:-0}
INSTRUCTION_SCORE=${INSTRUCTION_SCORE:-0}
SCOPE_MATCHES=${SCOPE_MATCHES:-0}

# Three-way decision (review 2 C2 fix: absolute floor + domination rule)
TOTAL=$((CREATIVE_SCORE + INSTRUCTION_SCORE))
MAX=$(( CREATIVE_SCORE > INSTRUCTION_SCORE ? CREATIVE_SCORE : INSTRUCTION_SCORE ))
MIN=$(( CREATIVE_SCORE < INSTRUCTION_SCORE ? CREATIVE_SCORE : INSTRUCTION_SCORE ))

METHOD="keyword"
MODEL="opus-4-7"  # default fallback
CONFIDENCE="0.5"

if [[ "$TOTAL" -eq 0 ]]; then
    # No signal — LLM fallback
    METHOD="llm"
elif [[ "$MAX" -ge 2 ]] && [[ "$MAX" -ge $((2 * (MIN == 0 ? 1 : MIN))) ]]; then
    # Strong signal: winner has >=2 matches AND dominates loser >=2:1
    if [[ "$CREATIVE_SCORE" -gt "$INSTRUCTION_SCORE" ]]; then
        MODEL="opus-4-7"
    else
        MODEL="opus-4-6"
    fi
    CONFIDENCE="0.8"
else
    # Weak/ambiguous (1 match total, or ~balanced) — LLM fallback
    METHOD="llm"
fi

# --- LLM fallback (if keyword path failed) ---
if [[ "$METHOD" == "llm" ]]; then
    # Dispatch haiku-4-5 for cheap classification
    LLM_PROMPT="Classify this spec request as exactly one of: creative | instruction | ambiguous. Return single word lowercase only, no explanation. Request: $REQUEST"
    LLM_OUT=$(echo "$LLM_PROMPT" | claude -p --model haiku-4-5 --effort low 2>/dev/null || echo "ambiguous")

    # Parse: regex on lowercased output
    LLM_CLASS=$(echo "$LLM_OUT" | tr '[:upper:]' '[:lower:]' | grep -o -E '\b(creative|instruction|ambiguous)\b' | head -1)
    LLM_CLASS="${LLM_CLASS:-ambiguous}"

    case "$LLM_CLASS" in
        creative)
            MODEL="opus-4-7"
            CONFIDENCE="0.7"
            ;;
        instruction)
            MODEL="opus-4-6"
            CONFIDENCE="0.7"
            ;;
        *)
            # Ambiguous or parse fail → final fallback opus-4-7 (decision #2)
            MODEL="opus-4-7"
            CONFIDENCE="0.5"
            METHOD="fallback"
            ;;
    esac
fi

# --- Scope estimator (decision #3) ---
REQUEST_TOKENS=$(( ${#REQUEST} / 4 ))  # rough chars-to-tokens
if [[ "$REQUEST_TOKENS" -gt 800 ]] || [[ "$SCOPE_MATCHES" -ge 2 ]]; then
    MODE="split"
else
    MODE="single"
fi

# --- Output ---
jq -n \
    --arg model "$MODEL" \
    --arg mode "$MODE" \
    --arg confidence "$CONFIDENCE" \
    --arg method "$METHOD" \
    --argjson cs "$CREATIVE_SCORE" \
    --argjson is "$INSTRUCTION_SCORE" \
    --argjson sm "$SCOPE_MATCHES" \
    --argjson rt "$REQUEST_TOKENS" \
    '{
        model: $model,
        mode: $mode,
        confidence: ($confidence | tonumber),
        method: $method,
        debug: {
            creative_score: $cs,
            instruction_score: $is,
            scope_matches: $sm,
            request_tokens: $rt
        }
    }'

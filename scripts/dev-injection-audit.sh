#!/usr/bin/env bash
# ============================================================================
# dev-injection-audit.sh — VIBE context injection map + token-cost estimator
#                          (§2.7, T35 map phase)
# ----------------------------------------------------------------------------
# Enumerates every context injection point in the VIBE plugin, estimates
# token cost (rough: chars ÷ 4), and tags frequency (one-time vs per-turn
# vs on-block vs on-tool-use). Output is a markdown findings doc.
#
# Usage: dev-injection-audit.sh [output-file]
# Default: docs/2026-04-XX-injection-audit.md (created if missing)
#
# Categories audited:
#   1. CLAUDE.md managed region (smart-generator output)
#   2. Skill descriptions (each plugin/skills/*/SKILL.md frontmatter)
#   3. Agent prompts (each plugin/agents/*.md body)
#   4. PreToolUse hook block messages (read-discipline, read-before-edit,
#      pre-tool-security)
#   5. UserPromptSubmit hook injections (pragmatic-priming)
#   6. Stop hook feedback (rhetoric-guard, side-effect-verify,
#      atomic-enforcement block reasons)
#   7. Shared protocol files (skills/_shared/*)
#
# Out of scope for map phase: Tier A --append-system-prompt (user-side,
# not a plugin injection).
# ============================================================================

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="${1:-$REPO_ROOT/docs/2026-04-$(date +%d)-injection-audit.md}"
PLUGIN="$REPO_ROOT/plugin"

# Token estimator: chars / 4 (conservative English-text heuristic)
est_tokens() {
    local file="$1"
    [[ -f "$file" ]] || { echo 0; return; }
    local chars
    chars=$(wc -c < "$file" 2>/dev/null | tr -d ' ')
    echo $((chars / 4))
}

est_tokens_str() {
    local s="$1"
    echo $(( ${#s} / 4 ))
}

mkdir -p "$(dirname "$OUT_FILE")"

cat > "$OUT_FILE" <<EOFHEADER
# VIBE Context Injection Audit (§2.7, T35 map phase)

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Tool:** \`scripts/dev-injection-audit.sh\` (maintainer dev tool, not shipped)
**Plugin root:** \`$PLUGIN\`

Map phase enumerates every VIBE context injection point with token-cost
estimate + frequency tag. Measure phase (A/B with/without per injection)
and cut recommendations are T36 + T37 follow-on.

Token estimate = file size ÷ 4 chars/token (conservative for English).

---

## 1. CLAUDE.md managed region

Smart-generator (\`plugin/setup/smart-generator.sh\`) produces 4 sub-blocks
injected into user's project CLAUDE.md during \`/vibe:setup\`. Hard budget:
1200 tokens total (enforced post-generation in 5.4.0).

| Block | Source | Est tokens (template) | Frequency |
|---|---|---|---|
EOFHEADER

# Estimate from smart-generator template and blocks (if smart-generator outputs can be introspected)
TEMPLATE_FILE="$PLUGIN/setup/claude-md-template.md"
if [[ -f "$TEMPLATE_FILE" ]]; then
    TOKENS=$(est_tokens "$TEMPLATE_FILE")
    echo "| (entire managed region placeholder template) | \`$TEMPLATE_FILE\` | ~$TOKENS | once per session (loaded with project context) |" >> "$OUT_FILE"
else
    echo "| managed region template | (missing) | — | — |" >> "$OUT_FILE"
fi

cat >> "$OUT_FILE" <<EOFHEADER

**Measure phase note:** actual injection size depends on project context
(project-context block varies by detected stack). Worst-case ≈ 1200 tokens
per §9.1 budget. Best-case minimal project ≈ 400 tokens.

---

## 2. Skill descriptions

Each \`plugin/skills/*/SKILL.md\` ships with frontmatter \`description:\`
field + \`whenToUse:\` field. These are injected into the model's skill
catalog when Claude Code decides what's available. Recurrence: loaded
once per session (session-level catalog).

| Skill | description tokens | whenToUse tokens | Total |
|---|---|---|---|
EOFHEADER

TOTAL_SKILL_DESC=0
for skill_dir in "$PLUGIN/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    [[ -f "$skill_file" ]] || continue

    DESC=$(awk '/^description:/{sub(/^description: */,""); print; exit}' "$skill_file")
    WHEN=$(awk '/^whenToUse:/{sub(/^whenToUse: */,""); print; exit}' "$skill_file")
    DESC_T=$(est_tokens_str "$DESC")
    WHEN_T=$(est_tokens_str "$WHEN")
    TOTAL=$((DESC_T + WHEN_T))
    TOTAL_SKILL_DESC=$((TOTAL_SKILL_DESC + TOTAL))

    echo "| \`$skill_name\` | ~$DESC_T | ~$WHEN_T | ~$TOTAL |" >> "$OUT_FILE"
done

echo "" >> "$OUT_FILE"
echo "**Subtotal skill descriptions (all skills aggregated):** ~$TOTAL_SKILL_DESC tokens (one-time per session)." >> "$OUT_FILE"

cat >> "$OUT_FILE" <<EOFHEADER

---

## 3. Agent prompts

Each \`plugin/agents/*.md\` body is loaded when the agent is dispatched (per-invocation, not per-session). Token cost applies only when agent is invoked.

| Agent | Body tokens | Frequency |
|---|---|---|
EOFHEADER

for agent_file in "$PLUGIN/agents"/*.md; do
    [[ -f "$agent_file" ]] || continue
    agent_name=$(basename "$agent_file" .md)
    TOKENS=$(est_tokens "$agent_file")
    echo "| \`$agent_name\` | ~$TOKENS | per-invocation |" >> "$OUT_FILE"
done

cat >> "$OUT_FILE" <<EOFHEADER

---

## 4. PreToolUse hook block messages

Hooks that emit a JSON \`{reason: ...}\` on stderr when they block a tool
call. The reason string is fed back to the model as additional context
on the next turn. Frequency: on-block only (zero tokens if the tool
succeeds without triggering the hook).

| Hook | Reason string tokens | Frequency |
|---|---|---|
EOFHEADER

# Extract REASON assignments from each hook script (rough — one-line match)
for hook in \
    "$PLUGIN/scripts/read-discipline.sh" \
    "$PLUGIN/scripts/read-before-edit.sh" \
    "$PLUGIN/scripts/pre-tool-security.sh"; do
    [[ -f "$hook" ]] || continue
    hook_name=$(basename "$hook")
    # Concatenate all REASON= lines, estimate
    REASONS=$(grep -h 'REASON=' "$hook" 2>/dev/null | head -5)
    REASON_TOKENS=$(est_tokens_str "$REASONS")
    echo "| \`$hook_name\` | ~$REASON_TOKENS | on-block |" >> "$OUT_FILE"
done

cat >> "$OUT_FILE" <<EOFHEADER

---

## 5. UserPromptSubmit hook injection

Tier B Pragmatic priming hook (§2.6). Injects preamble as
\`additionalContext\` on EVERY user prompt when env \`VIBE_PRAGMATIC_MODE=1\`.
Frequency: per-turn (O(N) where N = conversation turns).

| Hook | Preamble tokens | Frequency |
|---|---|---|
EOFHEADER

PRAGMATIC_FILE="$PLUGIN/skills/setup/references/pragmatic-prompt.txt"
if [[ -f "$PRAGMATIC_FILE" ]]; then
    T=$(est_tokens "$PRAGMATIC_FILE")
    echo "| \`pragmatic-priming.sh\` | ~$T (from pragmatic-prompt.txt) | per-turn when \`VIBE_PRAGMATIC_MODE=1\` |" >> "$OUT_FILE"
else
    echo "| \`pragmatic-priming.sh\` | — (file missing) | per-turn |" >> "$OUT_FILE"
fi

cat >> "$OUT_FILE" <<EOFHEADER

**Note:** Tier A (shell wrapper \`--append-system-prompt\`) is O(1) per
conversation (cached via prompt caching). Tier B is O(N) uncached.
Tier A+B coexistence = double injection; flag for cut in 5.6.0 if
detected via injection audit re-run after user deployments.

---

## 6. Stop hook feedback (block reasons)

Emitted on session-stop when a rhetoric pattern / unverified side-effect
/ incomplete atomic decomp is detected. Feedback loops back to model as
context for next turn. Capped at 3 fires/session (rhetoric-guard) or 1
fire/session (side-effect-verify).

| Hook | Reason string tokens | Frequency |
|---|---|---|
EOFHEADER

for hook in \
    "$PLUGIN/scripts/rhetoric-guard.sh" \
    "$PLUGIN/scripts/side-effect-verify.sh" \
    "$PLUGIN/scripts/atomic-enforcement.sh"; do
    [[ -f "$hook" ]] || continue
    hook_name=$(basename "$hook")
    REASONS=$(grep -h 'reason":' "$hook" 2>/dev/null | head -5)
    REASON_TOKENS=$(est_tokens_str "$REASONS")
    echo "| \`$hook_name\` | ~$REASON_TOKENS | on-fire (cap: 1-3/session) |" >> "$OUT_FILE"
done

cat >> "$OUT_FILE" <<EOFHEADER

---

## 7. Shared protocol files

Files in \`plugin/skills/_shared/\` loaded by multiple skills as shared
references. Loaded on-demand when a skill invokes them (not per-session).

| File | Tokens | Frequency |
|---|---|---|
EOFHEADER

for shared in "$PLUGIN/skills/_shared"/*.md; do
    [[ -f "$shared" ]] || continue
    shared_name=$(basename "$shared")
    T=$(est_tokens "$shared")
    echo "| \`_shared/$shared_name\` | ~$T | on-demand (per skill invocation that references it) |" >> "$OUT_FILE"
done

cat >> "$OUT_FILE" <<EOFHEADER

---

## Summary — session-level token budget (rough)

| Category | Typical cost | Notes |
|---|---|---|
| CLAUDE.md managed region | ~1200 (budget) | once per session (hard-capped 5.4.0) |
| Skill descriptions (all) | ~$TOTAL_SKILL_DESC | once per session (session-level catalog) |
| Agent prompts | per-invocation only | 0 if agent unused |
| PreToolUse hook reasons | 0 baseline | only on-block |
| UserPromptSubmit Tier B | +30/turn | O(N) if \`VIBE_PRAGMATIC_MODE=1\` |
| Stop hook feedback | ~0-200/session | capped fires |
| Shared protocol | per-reference | 0 if not loaded |

**Baseline session-level injection cost (no agent invocations, no hook fires, Tier B off):** CLAUDE.md managed region + skill descriptions ≈ ~1200 + $TOTAL_SKILL_DESC tokens = **~$((1200 + TOTAL_SKILL_DESC)) tokens**.

---

## Next steps (T36 + T37)

- **T36 measure phase:** per injection, A/B with vs without on appropriate fixture. Fixtures:
  - CLAUDE.md managed region → audit v2 fixture (T11/T13), measure coverage delta
  - Skill descriptions → /vibe:spec classifier accuracy (T26) as proxy for skill discoverability
  - Pragmatic Tier B → hedge-reduction A/B (T32)
  - Stop hook feedback → \`feedback_honesty_patterns\` fixture (future work)
- **T37 cut recommendations:** injections with \`|delta| < 5pt\` on relevant fixture → flag for 5.6.0 cut.

## Known limitations of this map phase

- Token estimate is char-based approximation (chars÷4). Real tokenizer may differ ±20%.
- "Recurrence" tags assume default VIBE setup; user-level pause/resume affects actual fires.
- Tier A shell wrapper is NOT in scope here (user-side, not a plugin injection).
- Does not estimate CPU/latency overhead of hook execution — only token cost.
EOFHEADER

echo ""
echo "=========================="
echo "Injection audit written: $OUT_FILE"
echo "=========================="
wc -l "$OUT_FILE"

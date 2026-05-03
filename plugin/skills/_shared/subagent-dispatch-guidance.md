# Subagent Dispatch Tier Guidance

> Read this before invoking the `Agent` tool. It tells you how to size a subagent's
> task and pick the right model for the dispatch. The goal is matching model power
> to subtask difficulty: do not pay opus prices on a haiku-class task, do not
> ship a haiku to do an opus-class job.

## When this applies

Every `Agent` tool call. The orchestrator (this session) decides the subagent's
`model` parameter; the dispatch guidance below converts the subtask description
into a tier recommendation.

## Signal scoring

Rate the subtask on each signal from 0 to 1. Sum the weighted signals into a
single complexity score, then map to a tier.

| Signal | Weight | What raises it |
|---|---|---|
| Prompt length | 0.10 | Very short = lower; multi-paragraph spec = higher |
| File reference count | 0.10 | One file = lower; multiple files referenced = higher |
| Code-keyword density | 0.10 | Pure prose = lower; many `function`/`class`/`import` = higher |
| Complexity-word density | 0.10 | "rename"/"add log" = lower; "redesign"/"refactor"/"architecture" = higher |
| Domain mention | 0.15 | "fix typo" = lower; mentions of "security", "architecture", "performance", "research" = higher |
| Multi-step indicator | 0.10 | One action = lower; "first do X then Y then Z" = higher |
| Reasoning-required indicator | 0.10 | Mechanical change = lower; "why does X happen" / "should we" = higher |
| Creative-output indicator | 0.10 | Code-only = lower; "write copy", "design page", "draft proposal" = higher |
| Risk indicator | 0.10 | Contained edit = lower; production / irreversible / shared-state = higher |
| Token-budget hint | 0.05 | Short expected output = lower; long expected output = higher |

## Tier mapping

| Score | Tier | Model | Effort |
|---|---|---|---|
| 0.00 - 0.15 | S0 | haiku | low |
| 0.16 - 0.30 | S1 | haiku | medium |
| 0.31 - 0.45 | S2 | sonnet | low |
| 0.46 - 0.60 | S3 | sonnet | medium |
| 0.61 - 0.80 | S4 | opus | high |
| 0.81 - 1.00 | S5 | opus | xhigh |

## Guardrails (override the score)

Apply these AFTER scoring. Floors raise the tier; ceilings cap it.

### Floors (minimum tier regardless of score)
- **Research subtasks** ("research X", "find current SOTA for Y", "synthesize what's known about Z") → minimum S2 (sonnet). Research with poor reasoning produces hallucinated citations.
- **Security audits** ("audit security", "OWASP review", "check for vulnerabilities") → minimum S4 (opus high). False negatives are expensive; opus catches more.
- **Irreversible / production actions** (destructive operations, schema migrations, config changes that will ship) → minimum S3 (sonnet medium). Reversibility cost is high; do not rush with haiku.
- **Architectural decisions** ("should we use X or Y", "design Z") → minimum S4. Choices propagate; cheap reasoning here costs later.

### Ceilings (maximum tier regardless of score)
- **Pure renames / formatting** (variable rename, file rename, lint fix, prettier-only change) → maximum S1 (haiku medium). Mechanical, no reasoning required.
- **Trivial lookups** ("what is the value of X in file Y", "list files in dir Z") → maximum S0 (haiku low).

## Application protocol

1. Read the subtask description Zeus / the orchestrator wants the subagent to handle.
2. Score the 10 signals (rough estimate is fine; precision is not needed).
3. Compute weighted sum → tier.
4. Apply floors and ceilings.
5. Set `Agent.model` to the resulting tier's model. Pass `effort` (or extended-thinking budget) per tier.
6. If signals are ambiguous or contradict heavily, fall back to the dispatching skill's static `model:` from its frontmatter.

## When NOT to apply this

- **Single-skill flows that already classify** — `vibe:spec` has its own classifier (`plugin/skills/spec/scripts/classifier.sh`). When a skill explicitly classifies and dispatches, this guidance does not override.
- **User-pinned model** — if the user invoked the orchestrator with `--model opus`, respect the pin. The dispatch tier is a recommendation, not a mandate over user intent.
- **Ambiguous subtask** — when no clear tier emerges, default to the dispatching skill's static model. Do not guess into opus by default.

## Failure-open

If this section is missing from CLAUDE.md, or you cannot evaluate the signals confidently, dispatch with the skill's static model. The guidance is advisory; never block a dispatch because tier scoring failed.

## Bypass

`VIBE_NO_DISPATCH_GUIDANCE=1` suppresses the rendering of this section in CLAUDE.md (the block is rendered empty by `vibe:setup`). When suppressed, every dispatch falls back to the skill's static model.

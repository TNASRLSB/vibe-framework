---
name: evolve
description: Persistent learning across sessions via the ACE pattern. Record scored task outcomes, fire periodic reflection that rewrites a managed CLAUDE.md block via `claude -p`. Future sessions inherit the evolved rules. Use when the user wants the project's CLAUDE.md to learn from accumulated outcomes rather than stay static.
disable-model-invocation: true
model: sonnet
effort: low
whenToUse: "Use to teach the project's CLAUDE.md from accumulated task outcomes. Examples: '/vibe:evolve record T17 0.9 fixed bug on first try', '/vibe:evolve reflect', '/vibe:evolve revert'."
argumentHint: "record <task_id> <score 0-1> <summary> | reflect | revert"
maxTokenBudget: 5000
---

# /vibe:evolve

Three subcommands, dispatched to `scripts/evolve.sh` (delegates to the Python ACE observer).

## record — append a scored task outcome to the evolve log

```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/evolve/scripts/evolve.sh" record "$@"
```

Use when a discrete task has just finished and you can score the outcome (e.g. test pass rate, eval score, manual judgement). Appends to `${CLAUDE_PROJECT_DIR}/.vibe/evolve_log.jsonl`. Cheap, no LLM call.

## reflect — fire the reflector + curator

```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/evolve/scripts/evolve.sh" reflect "$@"
```

Reads the tail of `evolve_log.jsonl` plus the current managed block in CLAUDE.md, calls `claude -p` (default model: `sonnet-4-6`, override via `VIBE_EVOLVE_MODEL` or `--model`), parses a STRICT JSON delta list (`{"reasoning", "deltas":[{"op","id","text"}]}`), applies ADD/MODIFY/REMOVE deterministically (cap 30 entries; oldest evicted on overflow), and splices the result into CLAUDE.md.

Automatic rollback: if the rolling 5-entry score after the previous edit is at least `VIBE_EVOLVE_ROLLBACK_DELTA` (default 0.05) below the score before, the managed block is stripped and the version counter decrements. Cold-start (no prior score window) skips the check.

Bypass: `VIBE_NO_EVOLVE=1` env var; pause flag.

## revert — strip the managed block manually

```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/evolve/scripts/evolve.sh" revert
```

Idempotent: no-op if no managed block exists. Decrements the version counter and appends a `manual_revert` event to history.

## Managed block location

The block lives in `CLAUDE.md` between `<!-- VIBE:evolve-managed-start -->` and `<!-- VIBE:evolve-managed-end -->` markers. These markers are placed **outside** the outer `<!-- VIBE:managed-* -->` envelope (which `vibe:setup` wholesale-replaces) so evolve content survives every setup re-render. Only `/vibe:evolve` mutates this region.

## Files

- `${CLAUDE_PROJECT_DIR}/.vibe/evolve_log.jsonl` — append-only log of scored outcomes
- `${CLAUDE_PROJECT_DIR}/.vibe/evolve-state.json` — current version + last score window
- `${CLAUDE_PROJECT_DIR}/.vibe/evolve-history.jsonl` — per-event audit trail
- `${CLAUDE_PROJECT_DIR}/.vibe/claude-md-versions/` — timestamped CLAUDE.md snapshots

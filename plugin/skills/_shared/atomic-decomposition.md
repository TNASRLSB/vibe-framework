# Atomic Decomposition Protocol

Shared protocol for processing enumerable tasks. When a skill processes N independent items, it invokes the decomposer agent to produce a manifest, then the mechanical orchestrator processes each item in a separate LLM session.

---

## When to Use

A task is decomposable when:
1. It processes a LIST of independent items (endpoints, components, files, URLs)
2. Each item can be analyzed/modified independently
3. The items can be enumerated mechanically (file listing, grep, provided list)

A task is NOT decomposable when:
- It requires cross-item reasoning (architecture design, system-wide refactoring)
- The items are unknown until analysis (vulnerability discovery)
- Items depend on each other (file A changes require knowing file B changes)

---

## Manifest Schema

The decomposer agent produces a `manifest.json` with this structure:

```json
{
  "task_description": "string — what the overall task is",
  "total_items": "integer — count of items to process",
  "enumeration_source": "file | pattern | list | structure",
  "enumeration_command": "string — shell command that produces the same count independently",
  "prompt_template": "string — prompt for each sub-agent, with {item_description}, {context_file}, {context_lines}, {project_context} placeholders",
  "output_format": "markdown | json | text",
  "project_context": "string — architecture summary, conventions, domain knowledge for sub-agents",
  "task_mode": "read_only | write",
  "worker_model": "sonnet | haiku | opus — model the orchestrator uses for each per-item CLI session (default: sonnet)",
  "worker_effort": "low | medium | high | max — thinking effort for per-item sessions (default: medium)",
  "worker_fallback": "sonnet | haiku — fallback model when the primary is rate-limited (default: sonnet)",
  "items": [
    {
      "id": "integer — 1-based sequential",
      "description": "string — what this specific item is",
      "context_file": "string — file path relevant to this item (optional)",
      "context_lines": "string — line range e.g. '12-25' (optional)"
    }
  ]
}
```

### Required Fields
- `total_items` MUST equal length of `items` array
- `enumeration_command` MUST produce the same count when executed independently
- `prompt_template` MUST contain `{item_description}` placeholder
- `prompt_template` SHOULD end with the canonical anti-fanout footer: `"Do not spawn a subagent for work you can complete directly in a single response."` Opus 4.7 spawns fewer subagents by default than 4.6, but a per-item worker that recursively spawns sub-subagents collapses the atomic-decomp guarantee (one item, one isolated session). The footer line keeps workers single-shot.
- `task_mode` MUST be `read_only` or `write`
- Each item MUST have `id` and `description`

### Worker Model Tiering
- `worker_model`, `worker_effort`, and `worker_fallback` control the model used by the orchestrator for each per-item CLI session and for the polish step.
- The orchestrator precedence is: CLI flag (`--worker-model`, `--worker-effort`, `--worker-fallback`) > manifest field > built-in default (`sonnet` / `medium` / `sonnet`).
- **Opus should never appear as a worker.** Reserve it for conceptual, judgment, and cross-item synthesis layers. Per-item work is structurally single-item analysis and fits Sonnet or Haiku.
- The decomposer reads the skill's `### Atomic Decomposition` block and writes the `worker_model` / `worker_effort` / `worker_fallback` fields into the manifest so skill authors decide the defaults.

### Validation Rules
- The enforcement hook executes `enumeration_command` before orchestration starts
- If the command count differs from `total_items`, the manifest is rejected
- Phantom items (referencing non-existent files) cause sub-agent failures, which are tracked

---

## How Skills Declare Enumerable Items

In a skill's SKILL.md, add a section:

```markdown
### Atomic Decomposition

This skill processes enumerable items. When the item count exceeds the threshold, invoke the decomposer agent.

- **Item type:** API endpoints
- **Enumeration source:** pattern
- **Enumeration hint:** `grep -rn '@app.route\|@router.' {codebase}`
- **Threshold:** 10 (use atomic decomposition when N > 10)
- **Task mode:** read_only
- **Worker model:** sonnet
- **Worker effort:** medium
- **Worker fallback:** sonnet
```

The decomposer agent reads this declaration and uses the enumeration hint to construct the manifest, copying the worker model fields into the manifest so the orchestrator dispatches per-item sessions on the chosen model.

---

## Assembly Markers

Each sub-agent output is wrapped in markers by the orchestrator:

```
<!-- ITEM-1 -->
[sub-agent output for item 1]
<!-- /ITEM-1 -->
```

These markers enable mechanical counting at every stage. The polish step must preserve them.

---

## Pipeline Summary

```
Skill invokes decomposer agent
    ↓
Decomposer enumerates items → writes manifest.json
    ↓
Enforcement hook validates manifest (executes enumeration_command independently)
    ↓
Mechanical orchestrator reads manifest
    ↓
One CLI session per item (batched for read_only, serialized for write)
    ↓
Mechanical assembly with ITEM markers
    ↓
LLM polish (must preserve markers)
    ↓
Mechanical verification (count markers vs total_items)
    ↓
Deliver polished (if markers preserved) or raw assembly (if markers lost)
```

### Concrete script paths

The pipeline is implemented by these shipped scripts. Skills do NOT call the
orchestrator directly — they invoke the decomposer agent, which produces the
manifest; the orchestrator is then run from a follow-up shell step (typically
captured in the skill's SKILL.md as a Bash invocation).

- **Decomposer**: `plugin/agents/decomposer.md` — agent that produces `manifest.json`.
- **Manifest validation**: `${CLAUDE_PLUGIN_ROOT}/scripts/atomic-validate-manifest.sh <manifest.json>` — exit 2 if `total_items` ≠ enumeration count.
- **Mechanical orchestrator**: `${CLAUDE_PLUGIN_ROOT}/scripts/atomic-orchestrator.sh <manifest.json>` — reads the manifest, dispatches one CLI session per item, assembles outputs with `<!-- ITEM-N -->` markers, runs the polish step. Honors `worker_model` / `worker_effort` / `worker_fallback` from the manifest.
- **Output verification**: `${CLAUDE_PLUGIN_ROOT}/scripts/atomic-verify-output.sh <final.md> <total_items>` — exit 2 if marker count ≠ expected.
- **Stop-hook enforcement**: `${CLAUDE_PLUGIN_ROOT}/scripts/atomic-enforcement.sh` — registered on Stop, automatically calls validate + verify if a `manifest.json` is found in the standard locations.

When invoking the orchestrator from a SKILL.md step, use the absolute plugin path
(via the `CLAUDE_PLUGIN_ROOT` env var) rather than a relative reference, since
SKILL.md instructions execute in the user project's `cwd`, not in the plugin's
install directory.

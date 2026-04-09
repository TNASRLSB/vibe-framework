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
- `task_mode` MUST be `read_only` or `write`
- Each item MUST have `id` and `description`

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
```

The decomposer agent reads this declaration and uses the enumeration hint to construct the manifest.

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

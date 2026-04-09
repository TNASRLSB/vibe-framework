# Design Spec: Atomic Decomposition System

**Date:** 2026-04-09
**Author:** Davide Briani
**Status:** Draft

---

## Problem

LLMs declare tasks with N items complete after processing a fraction. Our experiment (120 runs, 5 conditions) demonstrated:

- Prompt-based mitigation (C2): increased false completion from 25% to 40%
- Mechanical sentinel (C3): 40% false completion
- Same-model verification (C4): 36.4% false completion
- **Atomic decomposition (C5): 0% false completion, 100% completeness**

C5 works because it eliminates the opportunity for partial completion: each LLM session processes exactly one item, and a mechanical orchestrator tracks progress.

## Architecture

Three components with a clear trust boundary: the LLM produces a verifiable manifest, everything after is mechanical.

### Component 1: Agent `decomposer` (LLM)

**Location:** `agents/decomposer.md`

**Role:** Receives a task, identifies the enumerable items, and produces a structured manifest. This is the ONLY step that requires LLM comprehension.

**Input:** A task description from the calling skill/agent + the codebase context.

**Output:** A `manifest.json` file written to a temp directory:

```json
{
  "task_description": "Analyze all API endpoints",
  "total_items": 18,
  "enumeration_source": "pattern",
  "enumeration_command": "grep -n '@app.route' src/routes/*.py",
  "prompt_template": "Analyze this API endpoint in detail: {item_description}\n\nContext file: {context_file}\nRelevant lines: {context_lines}",
  "output_format": "markdown",
  "items": [
    {
      "id": 1,
      "description": "GET /api/v1/users — list_users",
      "context_file": "src/routes/users.py",
      "context_lines": "12-25"
    },
    {
      "id": 2,
      "description": "POST /api/v1/users — create_user",
      "context_file": "src/routes/users.py",
      "context_lines": "27-45"
    }
  ]
}
```

**Verification:** The manifest is a concrete artifact. The hook (Component 3) can verify:
- `total_items` matches the length of the `items` array
- `enumeration_command` produces the same count when executed independently
- Each item has the required fields

**Why this step is lower-risk than the full task:** Enumerating items is cheaper than analyzing them. The cost of adding an item to the manifest is ~10 tokens; the cost of fabricating an item is also ~10 tokens. There is no 100x shortcut advantage like there is for fabricating analysis (50 tokens) vs doing real analysis (5,000 tokens). The incentive asymmetry that drives false completion is absent in the enumeration step.

### Component 2: Mechanical Orchestrator (Script)

**Location:** `scripts/atomic-orchestrator.sh` (or `.py`)

**Role:** Reads the manifest, spawns one LLM session per item, collects outputs, assembles the result. No LLM involved — pure mechanical execution.

**Input:** Path to `manifest.json`

**Process:**

1. Read manifest, validate structure
2. For each item in the manifest (batched, 3-5 concurrent):
   a. Construct prompt from `prompt_template` + item fields
   b. Spawn a fresh CLI session: `claude -p "$PROMPT" --output-format json --permission-mode auto`
   c. Capture output to `output/{item_id}.json`
   d. Verify output file exists and has content > 0 bytes
   e. If failed: retry once, then mark as failed
3. Count: successful outputs / total items
4. Mechanical assembly: concatenate all outputs into `raw-assembly.md`
5. LLM polish: spawn one final session that receives `raw-assembly.md` and rewrites for coherence
6. Mechanical verification: count items in polished output vs manifest total
   - If match: deliver polished version
   - If mismatch: deliver raw assembly (guaranteed complete)
7. Write final output + metadata (items processed, items failed, completeness)

**Concurrency:** Configurable batch size (default 3). Prevents rate limit issues while maintaining parallelism.

**Multi-model support:** The script accepts a `--model` flag: `claude`, `qwen`, `gemini`. Uses the appropriate CLI syntax for each.

### Component 3: Enforcement Hook

**Location:** Registered in `hooks/hooks.json` on the `Stop` event.

**Role:** Verifies that when a skill declared enumerable items, the decomposer was actually used and the output contains the expected count.

**Mechanism:**

The hook checks:
1. Was a VIBE skill invoked this session? (check transcript for Skill tool calls)
2. Did that skill declare enumerable items? (check for a `manifest.json` in the working directory or temp)
3. If yes: does the output contain at least `total_items` distinct results?
4. If the count doesn't match: block delivery, report discrepancy

**What the hook does NOT do:** It does not decide what should be decomposed. That decision belongs to the skill (via its SKILL.md declaration) and the decomposer agent. The hook only enforces that the declared contract was fulfilled.

### Enumeration Sources

Skills declare their enumeration source in their SKILL.md. The decomposer agent uses this to construct the manifest.

| Source | How it works | Example |
|--------|-------------|---------|
| File | `glob("pattern")` | Components: `src/components/**/*.tsx` |
| Pattern | `grep("regex", "path")` | Endpoints: `@app.route` in `src/routes/` |
| List | Passed by caller | Competitor URLs from Phase 2 qualification |
| Structure | `jq`/`yq`/parsing | Config vars: `jq 'keys' config.json` |

The decomposer agent runs the enumeration command mechanically (via Bash tool) and uses the results to populate the manifest items.

### Assembly Pipeline

```
18 agent outputs (one per item)
    ↓
Mechanical assembly: concatenate in order
    → raw-assembly.md (guaranteed 18/18 items)
    ↓
LLM polish: rewrite as coherent document
    → polished.md (may have fewer items)
    ↓
Mechanical count: items in polished vs 18
    ↓
Match? → deliver polished.md
Mismatch? → deliver raw-assembly.md
```

The raw assembly is the source of truth. The polish is best-effort. The mechanical count is the final gate.

## Skills to Update

Skills that process lists of items and should use the decomposer:

| Skill | Items | Current approach | Change |
|-------|-------|-----------------|--------|
| competitor-research | N competitors | Batches of 5, self-reported | Decomposer per competitor |
| ghostwriter | N pages for SEO | Sequential analysis | Decomposer per page |
| emmet | N files to audit | Monolithic analysis | Decomposer per file |
| seurat | N components for WCAG | Sequential | Decomposer per component |
| baptist | N funnel steps | Sequential | Decomposer per step |

Each skill's SKILL.md will be updated to declare its enumerable items and reference the atomic decomposition protocol.

## What This Does NOT Solve

- **Holistic tasks:** Tasks requiring cross-item reasoning (architecture design, complex refactoring where changes to file A depend on changes to file B). These cannot be decomposed into independent atomic units.
- **Discovery tasks:** Tasks where the items are unknown until analysis ("find all vulnerabilities"). The enumeration IS the analysis. These need a different approach.
- **Quality of individual item analysis:** Atomic decomposition guarantees completeness (all items processed) but not depth (each item analyzed well). A shallow analysis of each item is still possible.

## Implementation Order

1. `scripts/atomic-orchestrator.sh` — the mechanical core
2. `agents/decomposer.md` — the manifest-producing agent
3. `skills/_shared/atomic-decomposition.md` — the shared protocol
4. Hook enforcement in `hooks/hooks.json`
5. Update 5 skills to declare enumerable items
6. Test with the 20 experimental tasks
7. Compare C5-framework results against C5-experiment results

## Success Criteria

- 20 experimental tasks run through the framework implementation
- Completeness >= 0.95 on all enumerable tasks (analysis + research categories)
- False completion rate = 0% (structurally guaranteed by mechanical counting)
- No regression on task quality compared to C1 baseline

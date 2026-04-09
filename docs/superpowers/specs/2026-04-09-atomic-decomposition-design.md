# Design Spec: Atomic Decomposition System

**Date:** 2026-04-09
**Author:** Davide Briani
**Status:** Approved

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
  "project_context": "Flask API gateway with JWT auth. Decorators: @require_auth (checks Bearer token), @require_admin (checks role claim). Models use SQLAlchemy ORM.",
  "task_mode": "read_only",
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

**Manifest fields:**
- `project_context`: Summary of project architecture, conventions, and domain knowledge that each sub-agent needs. Extracted by the decomposer from CLAUDE.md, README, and codebase inspection. Included in every sub-agent prompt.
- `task_mode`: `read_only` (analysis, audit — safe to parallelize) or `write` (refactoring, modification — must serialize). Determines orchestrator concurrency strategy.
- `enumeration_command`: A shell command that, when executed, produces the same count as `total_items`. Used by the enforcement hook for independent verification.

**Manifest Trust Mitigation:** The manifest is produced by an LLM and therefore untrusted. The enforcement hook (Component 3) independently executes `enumeration_command` BEFORE the orchestrator begins work. If the command produces a different count than `total_items`, the manifest is rejected and the decomposer must re-enumerate. The LLM cannot set its own grading criteria — the mechanical count is authoritative.

**Why this step is lower-risk than the full task:** Enumerating items is cheaper than analyzing them. The cost of adding an item to the manifest is ~10 tokens; the cost of fabricating an item is also ~10 tokens. There is no 100x shortcut advantage like there is for fabricating analysis (50 tokens) vs doing real analysis (5,000 tokens). The incentive asymmetry that drives false completion is absent in the enumeration step. Additionally, phantom items (items that don't exist in the codebase) are caught when the sub-agent fails to find the referenced file/function.

### Component 2: Mechanical Orchestrator (Script)

**Location:** `scripts/atomic-orchestrator.sh` (or `.py`)

**Role:** Reads the manifest, spawns one LLM session per item, collects outputs, assembles the result. No LLM involved in orchestration — pure mechanical execution.

**Input:** Path to `manifest.json` (already validated by the enforcement hook)

**Process:**

1. Read manifest, validate structure
2. Determine concurrency: if `task_mode` is `read_only`, batch 3-5 concurrent. If `write`, serialize (one at a time) to prevent race conditions on shared files.
3. For each item in the manifest:
   a. Construct prompt from `prompt_template` + item fields + `project_context`
   b. Spawn a fresh CLI session: `claude -p "$PROMPT" --output-format json --permission-mode auto`
   c. Capture output to `output/{item_id}.json`
   d. Verify output file exists and has content > 0 bytes
   e. If failed: retry once, then mark as failed
4. Count: successful outputs / total items
5. Mechanical assembly: concatenate all outputs into `raw-assembly.md`, each item wrapped in markers: `<!-- ITEM-{id} -->` ... `<!-- /ITEM-{id} -->`
6. LLM polish: spawn one final session that receives `raw-assembly.md` and rewrites for coherence. The polish prompt instructs: "Maintain all `<!-- ITEM-N -->` markers in the output. You may restructure, add transitions, and improve readability, but every marker pair must be preserved."
7. Mechanical verification: count `<!-- ITEM-` markers in polished output vs manifest `total_items`
   - If match: deliver polished version
   - If mismatch: deliver raw assembly (guaranteed complete)
8. Write final output + metadata (items processed, items failed, completeness)

**Concurrency:** Configurable batch size (default 3 for read_only, 1 for write). Prevents rate limit issues and race conditions.

**Multi-model support:** The script accepts a `--model` flag: `claude`, `qwen`, `gemini`. Uses the appropriate CLI syntax for each.

### Component 3: Enforcement Hook

**Location:** Registered in `hooks/hooks.json` on the `Stop` event.

**Role:** Two-phase verification: (1) validate the manifest before work begins, (2) verify the output after work completes.

**Phase A — Manifest Validation (pre-orchestration):**

When the decomposer produces a manifest, before the orchestrator starts:
1. Parse `manifest.json`
2. Check `total_items` == length of `items` array
3. Execute `enumeration_command` independently
4. Compare command output count vs `total_items`
5. If mismatch: reject manifest, report discrepancy, force re-enumeration
6. If match: approve manifest, orchestrator may proceed

**Phase B — Output Verification (post-orchestration):**

When the orchestrator completes:
1. Count `<!-- ITEM-` markers in final output
2. Compare vs `total_items` from validated manifest
3. If mismatch: block delivery, report discrepancy
4. If match: approve delivery

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
N agent outputs (one per item, each wrapped in <!-- ITEM-{id} --> markers)
    ↓
Mechanical assembly: concatenate in order
    → raw-assembly.md (guaranteed N/N items, markers preserved)
    ↓
LLM polish: rewrite as coherent document (must preserve markers)
    → polished.md (may restructure but markers must survive)
    ↓
Mechanical count: count <!-- ITEM- markers in polished vs N
    ↓
Match? → deliver polished.md
Mismatch? → deliver raw-assembly.md
```

The raw assembly is the source of truth. The polish is best-effort. The mechanical count is the final gate.

## Cost Model

Atomic decomposition trades cost for completeness.

| Scenario | Sessions (baseline) | Sessions (atomic) | Multiplier |
|----------|--------------------|--------------------|------------|
| 18 endpoints | 1 | 18 + 1 decomposer + 1 polish = 20 | 20x |
| 16 components | 1 | 16 + 2 = 18 | 18x |
| 20 competitors, 5 pages each | 1 | 20 + 2 = 22 (per-competitor, not per-page) | 22x |

This is a deliberate tradeoff. Our experiment showed that a single session produces 25-50% false completion on complex enumerable tasks. The cost of false completion (human verification time, rework, missed issues) exceeds the cost of additional API sessions. The user explicitly stated: no limits on cost.

For users with cost constraints, the system is opt-in per skill and the existing non-atomic path remains available.

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
- **Quality of individual item analysis:** Atomic decomposition guarantees completeness (all items processed) but not depth (each item analyzed well). A shallow analysis of each item is still possible. The `project_context` field mitigates this partially by giving each sub-agent architectural awareness.

## Implementation Order

1. Define manifest JSON schema (the contract between all components)
2. `scripts/atomic-orchestrator.sh` — the mechanical core (reads manifest, dispatches, assembles)
3. `agents/decomposer.md` — the manifest-producing agent
4. `skills/_shared/atomic-decomposition.md` — the shared protocol documentation
5. Enforcement hook in `hooks/hooks.json` (Phase A + Phase B)
6. Update 5 skills to declare enumerable items
7. Test with the 20 experimental tasks
8. Compare C5-framework results against C5-experiment results

## Success Criteria

- 20 experimental tasks run through the framework implementation
- Completeness = 1.000 on all enumerable tasks (analysis + research categories). If below 1.000, investigate as a bug — the architecture guarantees completeness mechanically.
- False completion rate = 0% (structurally guaranteed by mechanical counting)
- Manifest validation catches enumeration discrepancies (test with intentionally wrong manifests)
- No regression on task quality compared to C1 baseline
- Polish fallback triggers correctly when items are dropped (test with adversarial polish)

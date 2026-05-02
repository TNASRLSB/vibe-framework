# {{PROJECT_NAME}}

<!-- VIBE:managed-start -->
<!-- This region is managed by the VIBE Framework. -->
<!-- Do not edit between these markers — changes will be overwritten on the next /vibe:setup run. -->
<!-- Anything OUTSIDE these markers is preserved verbatim. -->

## Project Context (VIBE-detected)

{{PROJECT_CONTEXT_BLOCK}}

## Model Usage Pattern

{{MODEL_PATTERN_BLOCK}}

## Capability Audit (VIBE failure-modes armed)

{{CAPABILITY_AUDIT_BLOCK}}

## Git Signals (snapshot)

{{GIT_SIGNALS_BLOCK}}

## Verification Discipline

Before asserting facts about this repository, verify with tools — do not infer from prior knowledge or filename:

- **File existence:** use `Read` or `Glob` before claiming a file exists.
- **Function/symbol presence:** use `Grep` before claiming code exists.
- **Architecture or behavior claims:** read the actual files; cite line numbers.
- **Cross-references:** check both ends of the link before claiming X references Y.

When the user pushes back, verify before agreeing. User disagreement is not evidence the user is right. Cite the specific fact (file:line, tool output) that supports the reversal — or restate your prior position with reasoning.

Patterns to avoid:
- Confident assertion ("X does Y", "file Z exists") without a tool call backing it in the same turn.
- "I was wrong, you're right" without cited evidence — that is sycophantic capitulation, not analysis.
- Apology as substitute for analysis: state the specific error, the evidence, and the correction.

## VIBE Limits (what VIBE cannot do)

{{HARNESS_LIMITS_BLOCK}}

---

VIBE Framework is active. Quality-first skills available via `/vibe:[skill-name]`.
<!-- VIBE:managed-end -->

<!-- Your custom project notes, architecture decisions, and instructions below this line will be preserved across /vibe:setup runs. -->

<!-- VIBE:evolve-managed-start -->
<!-- managed by /vibe:evolve — empty. -->
<!-- VIBE:evolve-managed-end -->

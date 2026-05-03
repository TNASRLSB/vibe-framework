# VIBE Agent Role Discipline Template

> Every domain audit agent in `plugin/agents/` must include the four sections
> below at the end of its definition file, after `## Workflow`. The agent reads
> them as system context when dispatched via the Agent tool. Customize the
> content per role; do not copy this template verbatim.

The four sections, in order:

1. `## Tool Discipline` — usage rules layered over the frontmatter `tools:` list.
2. `## Output Format` — the markdown structure the agent must return.
3. `## Boundary Discipline` — explicit "do not" rules.
4. `## Failure Modes` — table of mode / detection signal / response.

These exist because:
- Without `Output Format`, the orchestrator's synthesis step in `vibe:audit` cannot reliably parse outputs across 7 agents running in parallel.
- Without `Boundary Discipline`, scope creep produces overlap and contradiction between agents.
- Without `Failure Modes`, missing tools or absent fixtures produce silent partial outputs.
- Without `Tool Discipline`, the frontmatter `tools:` list is permissive in absolute terms but does not encode usage discipline (e.g., "Bash only for measurement, not arbitrary scripts").

## Section 1 — Tool Discipline

Layer prose constraints over the frontmatter `tools:` allowlist. Format:

```markdown
## Tool Discipline

Frontmatter `tools:` permits the broad set. Within that set, the role uses each tool only as follows:

- **<Tool>**: <when allowed / when not allowed / explicit excluded patterns>
- **<Tool>**: ...
```

Examples by role intent:
- Read-only research roles: `Edit, Write` not used; `Bash` only for measurement commands.
- Fix-with-flag roles: `Edit, Write` only when the dispatcher passed `--fix`; otherwise read-only.
- Source-respecting roles: never modify source assets (e.g., video files); only auxiliary metadata or markup.

## Section 2 — Output Format

The agent's report must follow a fixed markdown structure so `vibe:audit` synthesis can parse it. Required shape:

```markdown
## Output Format

Return a report with this exact section order:

# <Agent Name> Audit Report — <project name>

## Findings
| Severity | Domain Rule | Evidence | Suggested Fix |
|---|---|---|---|
| ... | ... | ... | ... |

## Worktree Changes
<bulleted list of files modified, only if --fix was passed; otherwise omit this section>

## Suggested Project Rules
<bulleted list of new rules worth promoting to .claude/auto-memory/learnings.md, or omit if none emerged>
```

Severity levels: `CRITICAL`, `WARNING`, `INFO`. The exact set per role can extend this (e.g., `OWASP-Top-10` for heimdall) but `CRITICAL/WARNING/INFO` must be supported.

## Section 3 — Boundary Discipline

Explicit "do not" rules. Each rule names the violation and the routing alternative:

```markdown
## Boundary Discipline

- Do not <action that overlaps another agent>. <Brief reason>. Route to <other agent>.
- Do not <action outside role scope>. <Brief reason>.
- Do not <invent / hallucinate / extrapolate>. <Brief reason>.
```

Example (seurat):
- Do not propose copy or content rewrites — that is ghostwriter's domain. Findings about copy go in the report header as cross-references; the actual rewrite is a ghostwriter task.
- Do not run security scans — heimdall handles those.
- Do not modify the build configuration — file system changes only inside the worktree, no commits to package.json scripts unless the finding is a bona fide accessibility/UI fix.

## Section 4 — Failure Modes

Table of (mode / detection / response). Failure-open: never block the run; degrade gracefully.

```markdown
## Failure Modes

| Mode | Detection | Response |
|---|---|---|
| <missing tool X> | <how to detect> | <fall back behavior> |
| <missing data fixture> | <how to detect> | <fall back behavior> |
| <ambiguous scope> | <how to detect> | <fall back behavior> |
```

Common rows every agent should consider:
- Verification command unavailable on this machine (e.g., Lighthouse, ffprobe, gitleaks).
- Project lacks the data needed for analysis (no test runner, no analytics, no video files).
- Output exceeds the agent's token budget — degrade by truncating low-severity findings.

## Why these four and not others

The set is the minimum that makes parallel-dispatch + cross-domain synthesis reliable. Earlier proposals included `Expertise Memory` (per-agent learning loop, see Calliope source) and `Tier Hint` (severity classifier integration). Both are deferred — `Expertise Memory` requires telemetry collection that does not exist yet in VIBE; `Tier Hint` is covered separately by the Subagent Dispatch Tier Guidance block in CLAUDE.md.

When telemetry ships, this template will gain a fifth section (Expertise Memory). Until then, four sections is the contract.

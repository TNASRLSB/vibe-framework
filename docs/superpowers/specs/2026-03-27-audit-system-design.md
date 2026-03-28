# VIBE Audit System — Design Spec

**Date:** 2026-03-27
**Status:** Draft
**Scope:** Add autonomous audit capabilities to the VIBE Framework via domain-specific agents, an orchestrator skill, and a shared audit protocol.

---

## 1. Problem Statement

VIBE skills (seurat, ghostwriter, baptist, etc.) today run only inline in the main conversation context. They have no persistent memory, no isolation, and cannot run in parallel. Users who want a project audit must invoke each skill manually, sequentially, losing findings between sessions.

The conversation that surfaced this: a user asked to "use VIBE" on a project. The system triggered brainstorming instead of launching audits. When the user clarified, the system attempted to launch skills as background agents — which failed because skills are not agents.

**Root causes:**
- No entry point for "audit my project"
- No agent-mode for domain skills
- No persistent memory for domain-specific findings
- No orchestration layer for parallel audit execution

## 2. Design Principles

- **Composition over wrapping** — agents compose role + skill + protocol + capabilities. The skill IS the knowledge; the agent is the execution mode.
- **Evidence over opinion** — every finding must cite data, metrics, or standards. No "seems wrong."
- **Delta over full scan** — repeated audits analyze only what changed, informed by agent memory.
- **Safe by default** — all fixes happen in isolated worktrees. Nothing touches user code until reviewed.
- **Existing systems unchanged** — all 13 skills, 4 of 5 hooks, reviewer and researcher agents remain as-is.

## 3. Architecture Overview

```
+-----------------------------------------+
|         /vibe:audit (skill)             |  Entry point, user dialogue
|  Scan project -> propose agents         |
|  Read agent memories -> delta analysis  |
|  User confirms -> launch in parallel    |
|  Collect results -> cross-domain synth  |
+-----------------------------------------+
               | launches N agents
    +----------+----------+-----------+
    v          v          v           v
+--------++--------++--------++----------+
|@seurat ||@ghost- ||@baptist||@heimdall |  Agents (isolated, memory)
|        ||writer  ||        ||          |
|skills: ||skills: ||skills: ||skills:   |
|[seurat]||[ghost- ||[baptist||[heimdall]|
|        ||writer] ||        ||          |
+---+----++---+----++---+----++----+-----+
    |         |         |          |
    v         v         v          v
+-----------------------------------------+
|     references/audit-protocol.md        |  Shared behavior
|  Report format, severity, evidence,     |
|  regression detection, rule proposals,  |
|  memory interaction, fix behavior       |
+-----------------------------------------+
```

### Dual invocation model

Every domain skill has two invocation paths:

| Invocation | Mode | Context | Memory | Isolation |
|---|---|---|---|---|
| `/vibe:seurat` | Interactive (skill) | Main conversation | None | None |
| `@vibe:seurat` | Audit (agent) | Isolated | `memory: project` | Worktree |

Same domain knowledge, different execution mode. The skill is unchanged; the agent loads it via `skills:[]`.

## 4. Component Specifications

### 4.1 Orchestrator: `/vibe:audit`

**Type:** Skill
**Location:** `skills/audit/SKILL.md`

**Frontmatter:**
```yaml
---
name: audit
description: Project audit orchestrator. Scans project, proposes relevant audits, launches domain agents in parallel. Supports delta audits via agent memory.
effort: max
model: opus
---
```

**Workflow:**

1. **Memory read** — read all agent `MEMORY.md` files in `.claude/agent-memory/` to understand previous audit state
2. **Project scan** — analyze file types, structure, stack, dependencies, git diff since last audit
3. **Delta analysis** — compare current state with last audit findings. Determine which agents are relevant based on what changed
4. **Propose** — present to user: which agents to run, why (what changed, what's unresolved), estimated scope
5. **User confirms** — user can add, remove, or accept proposed agents
6. **Launch** — start confirmed agents in parallel
7. **Stream results** — as each agent completes, present its findings immediately
8. **Cross-domain synthesis** — after all agents complete, correlate findings across domains. Identify related issues (e.g., contrast problem on CTA + low CTA conversion)
9. **Trend report** — show how findings compare to previous audits (improving/stalling/regressing)
10. **Rule proposals** — aggregate all suggested rules from agents, present for user acceptance
11. **Save accepted rules** — append accepted rules to `.claude/auto-memory/learnings.md`

**Arguments:**

| Argument | Behavior |
|---|---|
| (none) | Full interactive flow: scan, propose, confirm, launch |
| `--all` | Skip confirmation, launch all relevant agents |
| `seurat ghostwriter` | Skip scan, launch specified agents directly |
| `--fix` | Pass to agents: apply all fixes including proposals |
| `--dry-run` | Pass to agents: no fixes, report only |
| `--status` | No agents launched. Read agent memories, show project health summary |

**`--status` output format:**
```
Project Health (last audit: YYYY-MM-DD)
  Security:      N critical, N warning
  Accessibility: N issues (N unresolved from previous)
  SEO:           score/100 (delta from previous)
  Code quality:  N% coverage
  CRO:           N% conversion, N proposals pending

  Delta since last audit: N files changed (breakdown by area)
  Suggested: [agents that should run based on delta]

Trend (last N audits):
  Metric1:  val -> val -> val   direction
  Metric2:  val -> val -> val   direction
```

### 4.2 Audit Protocol: `references/audit-protocol.md`

**Type:** Reference file (read by all agents)
**Location:** `references/audit-protocol.md`

**Contents:**

#### Report format

```markdown
## [Agent Name] Audit Report
**Scope:** what was analyzed (delta files, or full scan)
**Previous:** N issues from last audit, M resolved, K still open

### Fixes Applied (in worktree)
- [CRITICAL] description -> file:line (what was changed)
  Evidence: measurable data, standard cited

- [WARNING] description -> file:line (what was changed)
  Evidence: measurable data

### Proposals (in worktree, require review)
- [WARNING] description -> file:line
  Evidence: data
  Reasoning: why this change, what alternatives exist

### Regressions (fixed previously, re-emerged)
- [REGRESSION] description
  Previously fixed: YYYY-MM-DD
  Re-emerged after: commit hash
  Suggestion: add auto-memory rule to prevent recurrence

### Open Issues (from previous audit, not yet resolved)
- [SEVERITY] description -> current state

### Suggested Rules
- "Rule in natural language"
  Evidence: found N times in M files
  -> [Save as project rule] [Ignore]
```

#### Severity levels

| Level | Definition | Agent can auto-fix? |
|---|---|---|
| CRITICAL | Breaks functionality, security vulnerability, WCAG A failure | Yes (in worktree) |
| WARNING | Degraded quality, best practice violation, WCAG AA failure | Yes (in worktree) |
| INFO | Improvement opportunity, WCAG AAA, optimization | Yes (in worktree) |

All fixes happen in worktree regardless of severity. User reviews diffs.

#### Evidence requirement

Every finding MUST include:
- Specific file and line reference
- Measurable data (contrast ratio, response time, coverage %, CVE ID)
- Standard or benchmark cited (WCAG 2.1 AA, OWASP Top 10, Core Web Vitals)
- How it was measured (tool used, or "static analysis" if no tool available)

Findings without evidence are not valid findings.

#### Fix behavior by flag

| Flag | Behavior |
|---|---|
| (none) | All fixes in worktree. Report distinguishes mechanical fixes from judgment-based proposals. User reviews diffs and decides what to merge. |
| `--fix` | All worktrees auto-merged. Report lists what was applied. |
| `--dry-run` | No worktree created, no fixes. Report only. |

#### Auto-memory interaction

- **On startup:** Read `.claude/auto-memory/learnings.md`. Do NOT flag as issues things that are deliberate project rules.
- **On finding patterns:** If 3+ occurrences of same issue type, propose as rule in report.
- **On user acceptance:** Orchestrator appends accepted rules to auto-memory.

#### Agent memory interaction

- **On startup:** Read own `MEMORY.md` in `.claude/agent-memory/[name]/`. Compare previous findings with current state.
- **On completion:** Update `MEMORY.md` with: date, scope, findings summary (with counts for trending), fixes applied, open issues, regressions detected.
- **Format for trending:** Include machine-parseable metrics line for the orchestrator to aggregate:
  ```
  <!-- metrics: {"date":"2026-03-27","critical":0,"warning":3,"info":5,"fixed":8,"regressed":1} -->
  ```

### 4.3 Domain Agents

**Location:** `agents/[name].md`
**Common configuration:**

```yaml
memory: project
isolation: worktree
effort: max
model: opus
```

**Per-agent specifications:**

#### `agents/seurat.md`
```yaml
---
name: seurat
description: UI, design system, and accessibility audit with persistent memory. Use after frontend changes or for periodic quality checks.
tools: Read, Grep, Glob, Bash, Write, Edit
skills: [seurat]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Check ALL pages/routes, not just entry point
- Compute contrast ratios against WCAG 2.1 AA (minimum), flag AAA opportunities
- Verify responsive behavior at 320, 768, 1024, 1440 breakpoints
- Run Lighthouse/axe-core if available; degrade to static analysis if not
- Check design token consistency (colors, spacing, typography reuse)
- Validate semantic HTML (heading hierarchy, landmarks, ARIA)

**Verification commands:** lighthouse, axe-core, color-contrast computation

---

#### `agents/ghostwriter.md`
```yaml
---
name: ghostwriter
description: SEO, GEO, copy quality, and schema markup audit with persistent memory. Use after content changes or for periodic optimization checks.
tools: Read, Grep, Glob, Bash, Write, Edit, WebFetch, WebSearch
skills: [ghostwriter]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Check ALL pages for meta tags, not just homepage
- Validate schema markup against Google's current requirements
- Check sitemap.xml existence and correctness
- Verify robots.txt configuration
- Analyze heading structure (H1 uniqueness, hierarchy)
- Check for keyword cannibalization across pages
- Validate Open Graph and Twitter Card tags
- If WebFetch available: check indexing status, SERP preview

**Verification commands:** curl -I (headers), schema validation, sitemap parsing

---

#### `agents/baptist.md`
```yaml
---
name: baptist
description: Conversion rate, funnel analysis, and CRO audit with persistent memory. Use after UX changes or for periodic conversion checks.
tools: Read, Grep, Glob, Bash, Write, Edit, WebFetch
skills: [baptist]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Apply Fogg B=MAP model to every conversion point
- Count form fields (each field reduces conversion ~7%)
- Measure CTA visibility (above fold, contrast, size, copy)
- Check page load impact on conversion (each second costs ~7%)
- Analyze funnel drop-off points from code structure
- Verify trust signals (social proof, security badges, guarantees)
- If WebFetch available: check live page load metrics

**Verification commands:** form field count, CTA measurement, page weight analysis

---

#### `agents/emmet.md`
```yaml
---
name: emmet
description: Code quality, test coverage, and tech debt audit with persistent memory. Use after implementation or for periodic quality checks.
tools: Read, Grep, Glob, Bash, Write, Edit
skills: [emmet]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Run existing test suite, report pass/fail/skip counts
- Measure code coverage if tooling available
- Identify untested critical paths (auth, payments, data mutations)
- Check for console.log/debug statements left in production code
- Analyze code complexity (deeply nested logic, long functions)
- Check dependency health (outdated, deprecated, duplicate)

**Verification commands:** test runner (jest/pytest/go test), coverage tools, linter output

---

#### `agents/heimdall.md`
```yaml
---
name: heimdall
description: Security audit for vulnerabilities, credential exposure, and OWASP Top 10 with persistent memory. Use before deploys or when touching auth, payments, or user data.
tools: Read, Grep, Glob, Bash, Write, Edit
skills: [heimdall]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Check for hardcoded secrets (API keys, passwords, tokens)
- Validate input sanitization on all user-facing endpoints
- Check authentication and authorization patterns
- Verify CORS configuration
- Check dependency CVEs (npm audit / pip audit / go vuln)
- Validate CSP headers if applicable
- Check for SQL injection, XSS, CSRF patterns
- Verify secure cookie flags (HttpOnly, Secure, SameSite)

**Verification commands:** gitleaks, npm audit / pip audit, dependency CVE databases

---

#### `agents/orson.md`
```yaml
---
name: orson
description: Video asset quality and encoding audit with persistent memory. Use when project contains video content.
tools: Read, Grep, Glob, Bash, Write, Edit
skills: [orson]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Check video encoding settings (codec, bitrate, resolution)
- Verify responsive video embed markup
- Check for missing poster images
- Validate preload strategy (none/metadata/auto based on context)
- Check video file sizes against web performance budgets
- Verify captions/subtitles availability (accessibility)

**Verification commands:** ffprobe, file size analysis

---

#### `agents/scribe.md`
```yaml
---
name: scribe
description: Document quality and formatting audit with persistent memory. Use when project contains office documents or PDFs.
tools: Read, Grep, Glob, Bash, Write, Edit
skills: [scribe]
memory: project
isolation: worktree
effort: max
model: opus
---
```

**Domain directives:**
- Check document formatting consistency
- Verify metadata completeness (title, author, language)
- Check for accessibility in documents (tagged PDFs, alt text in docx)
- Validate table structure and heading hierarchy
- Check for broken references or links within documents

**Verification commands:** document parsing tools, metadata extraction

## 5. Changes to Existing Systems

### 5.1 Guardian deprecation

`agents/guardian.md` becomes redundant. `@vibe:heimdall` does the same work (loads heimdall skill) with standardized protocol, memory, and worktree isolation.

**Migration:** Rename to `guardian.md.deprecated` in v2.4, remove in v2.5. Any guardian agent-memory migrated to heimdall agent-memory.

### 5.2 Reflect evolution

`/vibe:reflect --patterns` currently analyzes `queue.jsonl` and auto-memory only.

**Change:** Also read all agent memory files in `.claude/agent-memory/*/MEMORY.md`. Look for:
- Patterns across agents (seurat keeps finding same issue type = systemic problem)
- Patterns over time (issue fixed then regressed 3 times = needs rule, not fix)
- Cross-domain correlations (accessibility issues co-occurring with conversion drops)

### 5.3 Forge evolution

`/vibe:forge create` currently scaffolds skills only.

**Change:** Add `create agent [name]` mode:
- Ask which skill to load
- Generate agent file from template with appropriate tools and domain directives
- Link audit-protocol.md
- Create agent-memory directory

### 5.4 Setup evolution

`/vibe:setup` currently configures Claude Code settings and permissions.

**Change:** Add optional audit toolchain check:
- Detect installed verification tools (lighthouse, axe-core, gitleaks, ffprobe, etc.)
- Report which agents will have degraded accuracy without their tools
- Offer to install missing tools (with user confirmation)
- Never block setup on missing tools — agents work without them, just less precisely

### 5.5 SessionStart hook evolution

`setup-check.sh` currently validates environment and reports pending corrections.

**Change:** Also check agent memories for pending findings:
- Unreviewed proposals from last audit
- Unaccepted rule suggestions
- Report count at session start: "VIBE: N proposals and M rule suggestions pending from audit on YYYY-MM-DD"

### 5.6 Pre-commit check (CC-only)

When user commits through Claude Code (`/commit` or commit flow):
- Lightweight check on staged files only
- Match file types to relevant domains (CSS -> seurat, API -> heimdall, copy -> ghostwriter)
- Run quick static checks (not full audit)
- Report obvious issues before commit proceeds
- Respects `/vibe:pause`
- Does NOT run as full agent — inline, fast, scoped

### 5.7 Help update

`/vibe:help` output updated to show:
- `/vibe:audit` in the skills table with all flags
- Dual invocation model explained: "Each domain skill can also run as an audit agent"
- Agent table showing all domain agents with their capabilities

### 5.8 Scheduled audits

Using existing `schedule` infrastructure:
- `/vibe:schedule audit --cron "0 8 * * 1"` — weekly Monday audit
- Requires remote repository (runs server-side)
- Findings saved to agent memories
- Summary surfaced at next SessionStart

## 6. Impact Summary

| Component | Change | Risk |
|---|---|---|
| `/vibe:audit` | **New** skill | None (additive) |
| `references/audit-protocol.md` | **New** reference | None (additive) |
| 7 domain agents | **New** agent files | None (additive) |
| `guardian.md` | **Deprecated** | Low (replaced by heimdall agent) |
| `/vibe:reflect` | **Evolved** (--patterns reads agent memory) | Low (additive behavior) |
| `/vibe:forge` | **Evolved** (create agent mode) | Low (new mode, existing unchanged) |
| `/vibe:setup` | **Evolved** (toolchain check) | Low (optional, non-blocking) |
| `setup-check.sh` | **Evolved** (pending findings report) | Low (additive output) |
| `/vibe:help` | **Evolved** (new sections) | Low (display only) |
| Pre-commit check | **New** hook behavior | Low (CC-only, respects pause) |
| Scheduled audit | **New** (uses existing schedule infra) | Low (requires remote repo) |
| 13 existing skills | **Unchanged** | None |
| reviewer, researcher | **Unchanged** | None |
| 4 existing hooks | **Unchanged** | None |
| Auto-memory system | **Unchanged** (new input channel) | None |

## 7. Implementation Phases

The project decomposes into three phases, each independently shippable:

**Phase 1 — Core audit system**
- `references/audit-protocol.md`
- 7 domain agent files
- `/vibe:audit` skill (basic: scan, propose, launch, collect)
- Guardian deprecation
- Help update

**Phase 2 — Memory and intelligence**
- Delta audit (read agent memories, compute diff)
- `--status` quick health check
- Trend tracking
- Cross-domain synthesis
- Regression detection
- Reflect evolution (--patterns reads agent memories)
- SessionStart hook (pending findings report)

**Phase 3 — Extensions**
- Forge evolution (create agent mode)
- Setup evolution (toolchain check)
- Pre-commit lightweight check
- Scheduled audit integration

Phase 1 delivers the core value. Phase 2 makes it intelligent. Phase 3 makes it convenient.

## 8. Technical Risks and Mitigations

### Naming collision: skill and agent with same name
Skills live in `skills/[name]/SKILL.md`, agents in `agents/[name].md`. Both may have `name: seurat`. Claude Code uses `/` prefix for skills, `@` prefix for agents. **Must verify** during Phase 1 that the runtime disambiguates correctly. If not, agents get a suffix (e.g., `seurat-audit`).

### Streaming results from parallel agents
The orchestrator launches agents as background tasks via the Agent tool. Claude Code notifies the main conversation when each completes. The orchestrator presents findings as notifications arrive. **Depends on** Claude Code's background agent notification mechanism working within a skill context. If not available, fall back to batch: launch all, wait all, present all.

### Context pressure on orchestrator
With 7 agents each returning substantial reports, the orchestrator's context could fill up. **Mitigation:** Agents return a compact summary (findings counts + top 3 critical items) as their primary result. Full report is written to a file in the worktree. The orchestrator reads summaries for synthesis; the user reads full reports on demand.

### Worktree merge conflicts between agents
Two agents may fix the same file differently (e.g., seurat changes CSS for contrast, baptist changes the same CSS for CTA visibility). **Mitigation:** The orchestrator detects overlapping file changes across worktrees before merging. Conflicting changes are flagged: "seurat and baptist both modified style.css — review manually." The `--fix` flag skips conflicting files and reports them.

## 9. Out of Scope

- Modifying any existing skill content or frontmatter
- Git hooks (outside Claude Code lifecycle)
- Custom UI for audit reports (text-based reports in conversation)
- Real-time monitoring (audit is on-demand or scheduled, not continuous)
- Agent-to-agent direct communication (orchestrator mediates)

## 10. Success Criteria

1. `/vibe:audit` on an existing project correctly identifies relevant agents and launches them
2. Agents produce findings with measurable evidence, not opinions
3. Second audit on same project is delta-based (faster, no duplicate findings)
4. Regressions are detected and flagged
5. Cross-domain synthesis identifies correlated findings
6. `/vibe:audit --status` returns project health without launching agents
7. Accepted rules persist in auto-memory and prevent re-flagging
8. Agent memory accumulates useful trending data across audits

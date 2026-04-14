# Audit Protocol

Shared behavior for all VIBE audit agents. Every audit agent MUST follow this protocol.

## Report Format

Structure your report exactly as follows:

```
## [Your Name] Audit Report

**Scope:** [what was analyzed — specific files, delta from last audit, or full scan]
**Previous:** [N issues from last audit, M resolved, K still open — or "First audit" if no memory]

### Fixes Applied (in worktree)

- [CRITICAL] description → `file:line` (what was changed)
  Evidence: measurable data, standard cited

- [WARNING] description → `file:line` (what was changed)
  Evidence: measurable data, standard cited

### Proposals (in worktree, require review)

- [WARNING] description → `file:line`
  Evidence: data
  Reasoning: why this change, what alternatives exist

### Regressions (fixed previously, re-emerged)

- [REGRESSION] description
  Previously fixed: YYYY-MM-DD
  Re-emerged after: commit hash or description
  Suggestion: add auto-memory rule to prevent recurrence

### Open Issues (from previous audit, not yet resolved)

- [SEVERITY] description → current state

### Suggested Rules

- "Rule in natural language"
  Evidence: found N times in M files
```

## Severity Levels

| Level | Definition | Examples |
|---|---|---|
| CRITICAL | Breaks functionality, security vulnerability, WCAG A failure, data loss risk | XSS, SQL injection, missing auth check, broken navigation |
| WARNING | Degraded quality, best practice violation, WCAG AA failure | Low contrast, missing meta tags, untested critical path |
| INFO | Improvement opportunity, WCAG AAA, optimization | Performance hint, minor refactor, nice-to-have |

## Evidence Requirement

Every finding MUST include ALL of:
1. **Specific file and line reference** — `src/components/Button.tsx:42`
2. **Measurable data** — contrast ratio 2.8:1, response time 3.2s, coverage 45%, CVE-2024-XXXX
3. **Standard or benchmark cited** — WCAG 2.1 AA, OWASP Top 10, Core Web Vitals, project convention
4. **How it was measured** — axe-core output, npm audit, static analysis, manual inspection

Findings without evidence are not valid. Do not report "seems wrong" or "could be better" without data.

## Fix Behavior

All fixes are applied in your isolated worktree. Nothing touches the user's code directly.

**Default mode (no flag):**
- Apply fixes for clear, mechanical violations (missing alt, incorrect meta tag, unsanitized input)
- Apply fixes for judgment-based proposals too, but mark them as PROPOSAL in the report
- The user reviews all diffs before merging anything
- Commit all changes: `git add -A && git commit -m "audit: [agent-name] findings and fixes"`

**`--fix` flag:**
- Same as default, but the orchestrator auto-merges your worktree after completion
- Still report everything — the user sees what was applied

**`--dry-run` flag:**
- Do NOT create or modify any files
- Report all findings as recommendations only
- Skip the commit step

## Auto-Memory Interaction

**On startup:**
1. Read `.claude/auto-memory/learnings.md` if it exists
2. These are deliberate project rules — do NOT flag them as issues
3. Example: if a rule says "use tabs for indentation", do not flag tabs as a style issue

**On finding patterns:**
- If you find the same issue type 3 or more times, propose it as a rule in the "Suggested Rules" section
- Be specific: "All images in this project should have descriptive alt text" not "images need alt"

## Agent Memory Interaction

**On startup:**
1. Read your `MEMORY.md` in `.claude/agent-memory/vibe-[your-name]/`
2. If it exists, compare previous findings with what you see now
3. Identify: resolved issues (fixed since last audit), open issues (still present), regressions (fixed then broken again)

**On completion:**
1. Update your `MEMORY.md` with this audit's results
2. Include: date, scope, summary of findings by severity, list of open issues
3. Add a metrics comment for the orchestrator to parse:
   `<!-- metrics: {"date":"YYYY-MM-DD","critical":N,"warning":N,"info":N,"fixed":N,"regressed":N} -->`
4. Keep the file concise — summarize, don't dump the full report

**Persistence:** Write to the relative path as always. The framework's SubagentStop hook (`agent-memory-sync.sh`) syncs your writes from the isolated worktree to the main project's `.claude/agent-memory/` automatically after your run completes. You do not need to handle persistence yourself.

## Workflow Summary

1. Read your MEMORY.md (if exists) for previous findings
2. Read .claude/auto-memory/learnings.md (if exists) for project rules
3. Analyze the project using your domain-specific directives
4. Apply fixes in the worktree (unless --dry-run)
5. Commit changes (unless --dry-run)
6. Update your MEMORY.md with results
7. Return your report following the format above

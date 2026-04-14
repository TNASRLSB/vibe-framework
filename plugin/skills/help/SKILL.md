---
name: help
description: Show all VIBE Framework skills, agents, hooks, and commands.
model: sonnet
effort: low
whenToUse: "Use to see all VIBE Framework skills, agents, hooks, and commands. Example: '/vibe:help'"
argumentHint: ""
maxTokenBudget: 5000
---

Display the complete VIBE Framework reference. Format it exactly as below, as a clean table for each section.

# VIBE Framework

## Core Architecture

VIBE v3 is built on three principles:
1. **Market intelligence over guesswork** — Ghostwriter, Seurat, and Baptist use global competitor research (11 languages) to build baselines from the world's best, instead of asking questions the user can't answer.
2. **Process discipline over knowledge** — Skills enforce how Claude reasons (mandatory steps, multiple options, anti-AI-pattern detection), not what it knows.
3. **Mechanical quality gates** — Hooks and agents enforce standards deterministically, not through suggestions.

## Skills

| Command | Description |
|---------|-------------|
| `/vibe:setup` | First-run configuration — model, effort, LSP, status line, CLAUDE.md (works on empty projects) |
| `/vibe:help` | This reference |
| `/vibe:pause` | Disable quality hooks for this session |
| `/vibe:resume` | Re-enable quality hooks |
| `/vibe:audit` | Interactive project audit — scans project, proposes agents, launches in parallel |
| `/vibe:audit --status` | Quick health check from agent memory (no agents launched) |
| `/vibe:audit --all` | Launch all relevant agents without confirmation |
| `/vibe:audit --fix` | Auto-merge all agent fixes |
| `/vibe:audit --dry-run` | Report only, no fixes |
| `/vibe:audit seurat ghostwriter` | Launch specific agents directly |
| `/vibe:emmet test` | Full testing cycle (map, unit, static, visual, report) |
| `/vibe:emmet test --unit` | Unit tests only |
| `/vibe:emmet test --visual` | Visual persona tests with Playwright (8 personas) |
| `/vibe:emmet test --static` | Static analysis only |
| `/vibe:emmet debug` | Systematic 7-step debugging (comment-out validation mandatory) |
| `/vibe:emmet techdebt` | Tech debt audit |
| `/vibe:emmet map` | Functional codebase map |
| `/vibe:emmet verify` | Verify a code change works end-to-end (detect stack, start app, test, report) |
| `/vibe:heimdall audit` | Full security audit (OWASP, secrets, BaaS, AI-generated patterns) |
| `/vibe:heimdall scan [path]` | Scan specific file or directory |
| `/vibe:heimdall secrets` | Credential detection only |
| `/vibe:heimdall baas` | BaaS configuration audit (Supabase/Firebase) |
| `/vibe:seurat setup` | Design system setup — competitor research (design lens) informs style selection |
| `/vibe:seurat generate` | Generate components/pages with anti-generic-design constraints |
| `/vibe:seurat brand` | Brand identity from competitor visual landscape + differentiation |
| `/vibe:seurat extract` | Extract tokens from existing UI |
| `/vibe:seurat preview` | Visual preview + WCAG verification |
| `/vibe:seurat map` | Component inventory |
| `/vibe:ghostwriter write [type]` | Create content — competitor research (copy lens) builds baseline, then differentiate. Types: article, landing, product, meta, faq, pillar |
| `/vibe:ghostwriter optimize` | Audit and optimize existing content (SEO + GEO + copy quality) |
| `/vibe:ghostwriter validate` | Run 52+ validation rules |
| `/vibe:baptist audit` | Conversion audit — competitor research (conversion lens) as benchmark + B=MAP diagnosis |
| `/vibe:baptist test` | Design A/B experiment with hypothesis linked to B=MAP + competitor evidence |
| `/vibe:baptist analyze` | Analyze experiment results with statistical rigor |
| `/vibe:baptist funnel` | Funnel analysis with drop-off diagnosis |
| `/vibe:orson create` | Guided video creation from storyboard |
| `/vibe:orson demo` | Product demo recording via Playwright |
| `/vibe:orson encode` | Render existing HTML project |
| `/vibe:scribe create [format]` | Create document (xlsx, docx, pptx, pdf) |
| `/vibe:scribe edit [file]` | Edit existing document |
| `/vibe:scribe convert [file]` | Convert between formats |
| `/vibe:forge create [name]` | Create a new skill via 4-round structured interview |
| `/vibe:forge audit` | Audit all skills for quality (frontmatter, structure, success criteria) |
| `/vibe:forge improve [name]` | Audit then apply targeted improvements |
| `/vibe:forge template` | Generate blank skill template |

## Shared Protocol

| Resource | Purpose |
|----------|---------|
| `_shared/competitor-research.md` | Global competitor research across 11 languages. One research, three lenses (copy, design, conversion). Results stored in `.vibe/competitor-research/` with 30-day freshness. Any skill can trigger, all consume. |

## Agents

Each domain skill has two invocation modes: interactive (skill) and autonomous audit (agent).

| Agent | Purpose | Invoke with |
|-------|---------|-------------|
| **reviewer** | Post-implementation code review (separate context, no self-review bias) | "use the reviewer agent" or @vibe:reviewer |
| **researcher** | Deep codebase exploration (isolated worktree, returns summary) | "use the researcher agent" or @vibe:researcher |
| **seurat** | UI, design system, accessibility audit (worktree, memory) | @vibe:seurat or via /vibe:audit |
| **ghostwriter** | SEO, GEO, copy, schema markup audit (worktree, memory) | @vibe:ghostwriter or via /vibe:audit |
| **baptist** | Conversion rate, funnel, CRO audit (worktree, memory) | @vibe:baptist or via /vibe:audit |
| **emmet** | Code quality, testing, tech debt audit (worktree, memory) | @vibe:emmet or via /vibe:audit |
| **heimdall** | Security, OWASP, credentials, CVE audit (worktree, memory) | @vibe:heimdall or via /vibe:audit |
| **orson** | Video asset quality audit (worktree, memory) | @vibe:orson or via /vibe:audit |
| **scribe** | Document quality audit (worktree, memory) | @vibe:scribe or via /vibe:audit |

## Hooks (automatic — 7 handlers, 5 lifecycle events)

| Hook | Trigger | What it does |
|------|---------|-------------|
| Setup check | Session start | Silent on normal state; emits guidance only on anomalies (settings missing, v1 remnants, no CLAUDE.md, post-compaction recovery) |
| PreToolUse security | Before bash | Blocks `rm -rf /`, force push to main, `curl\|bash`, `chmod 777`, DB DROP, fork bomb, credential file access |
| Lint | After file edit | Runs project linter (eslint, prettier, ruff, black, rustfmt, gofmt). Blocks on failure. |
| Security scan | After file edit | 31 patterns: keys, XSS, injection, credentials, obfuscation. Blocks on detection. |
| Compact save | Before compaction | Saves minimal structured snapshot (git state + pointers to transcript/TaskList/auto-memory). Does not summarize. |
| Failure loop | After tool failures | Blocks after 3 consecutive Bash/Edit/Write failures, forces replan |
| Failure reset | After tool success | Zeroes the failure counter |

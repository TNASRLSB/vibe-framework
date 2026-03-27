---
name: help
description: Show all VIBE Framework skills, agents, hooks, and commands.
disable-model-invocation: true
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
| `/vibe:setup` | First-run configuration — model, effort, LSP, status line, CLAUDE.md |
| `/vibe:help` | This reference |
| `/vibe:reflect` | Review captured corrections, save to memory |
| `/vibe:reflect --patterns` | Discover repeated actions that could become skills |
| `/vibe:pause` | Disable quality hooks for this session |
| `/vibe:resume` | Re-enable quality hooks |
| `/vibe:emmet test` | Full testing cycle (map, unit, static, visual, report) |
| `/vibe:emmet test --unit` | Unit tests only |
| `/vibe:emmet test --visual` | Visual persona tests with Playwright (8 personas) |
| `/vibe:emmet test --static` | Static analysis only |
| `/vibe:emmet debug` | Systematic 7-step debugging (comment-out validation mandatory) |
| `/vibe:emmet techdebt` | Tech debt audit |
| `/vibe:emmet map` | Functional codebase map |
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
| `/vibe:forge create [name]` | Create a new skill (process constraints > knowledge) |
| `/vibe:forge audit` | Audit all skills for quality (includes "Textbook" anti-pattern check) |
| `/vibe:forge fix` | Fix audit findings |

## Shared Protocol

| Resource | Purpose |
|----------|---------|
| `_shared/competitor-research.md` | Global competitor research across 11 languages. One research, three lenses (copy, design, conversion). Results stored in `.vibe/competitor-research/` with 30-day freshness. Any skill can trigger, all consume. |

## Agents

| Agent | Purpose | Invoke with |
|-------|---------|-------------|
| **reviewer** | Post-implementation code review (separate context, no self-review bias) | "use the reviewer agent" or @vibe:reviewer |
| **researcher** | Deep codebase exploration (isolated worktree, returns summary) | "use the researcher agent" or @vibe:researcher |
| **guardian** | Security + quality audit (Heimdall preloaded) | "use the guardian agent" or @vibe:guardian |

## Hooks (automatic)

| Hook | Trigger | What it does |
|------|---------|-------------|
| Setup check | Every session start | Injects VIBE status, pending corrections reminder, post-compaction recovery |
| Lint | Every file edit | Runs project linter (eslint, ruff, rustfmt, gofmt). Blocks on failure. |
| Security scan | Every file edit | Catches hardcoded keys, XSS, eval, public DB policies. Blocks on detection. |
| Compact save | Before compaction | Saves modified files, active skills, workflow phase for recovery |
| Correction capture | Every prompt | Detects corrections in 6 languages, queues for /vibe:reflect |
| Failure loop | After tool failures | Blocks after 3 consecutive failures, forces replan |

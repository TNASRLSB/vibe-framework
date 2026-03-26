---
name: help
description: Show all VIBE Framework skills, agents, hooks, and commands.
disable-model-invocation: true
---

Display the complete VIBE Framework reference. Format it exactly as below, as a clean table for each section.

# VIBE Framework

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
| `/vibe:emmet test --visual` | Visual persona tests with Playwright |
| `/vibe:emmet test --static` | Static analysis only |
| `/vibe:emmet debug` | Systematic 7-step debugging |
| `/vibe:emmet techdebt` | Tech debt audit |
| `/vibe:emmet map` | Functional codebase map |
| `/vibe:heimdall audit` | Full security audit (OWASP, secrets, BaaS) |
| `/vibe:heimdall scan [path]` | Scan specific file or directory |
| `/vibe:heimdall secrets` | Credential detection only |
| `/vibe:heimdall baas` | BaaS configuration audit |
| `/vibe:seurat setup` | Initialize design system |
| `/vibe:seurat generate` | Generate components or pages |
| `/vibe:seurat brand` | Brand identity workflow |
| `/vibe:seurat extract` | Extract tokens from existing UI |
| `/vibe:seurat preview` | Visual preview of design system |
| `/vibe:seurat map` | Component inventory |
| `/vibe:ghostwriter write [type]` | Create content (article, landing, product, meta, faq, pillar) |
| `/vibe:ghostwriter optimize` | Audit and optimize existing content |
| `/vibe:ghostwriter validate` | Run 52+ validation rules |
| `/vibe:baptist audit` | B=MAP conversion audit |
| `/vibe:baptist test` | Design A/B experiment |
| `/vibe:baptist analyze` | Analyze experiment results |
| `/vibe:baptist funnel` | Funnel analysis |
| `/vibe:orson create` | Guided video creation |
| `/vibe:orson demo` | Product demo recording |
| `/vibe:orson encode` | Render existing HTML project |
| `/vibe:scribe create [format]` | Create document (xlsx, docx, pptx, pdf) |
| `/vibe:scribe edit [file]` | Edit existing document |
| `/vibe:scribe convert [file]` | Convert between formats |
| `/vibe:forge create [name]` | Create a new skill |
| `/vibe:forge audit` | Audit all skills for quality |
| `/vibe:forge fix` | Fix audit findings |

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

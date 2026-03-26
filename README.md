# VIBE Framework 2.0

Quality-first plugin for Claude Code. Forces maximum effort, specialized methodologies, and mechanical quality gates for Max 20x subscribers.

## Installation

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

## What It Does

VIBE operates on three pillars:

1. **Specialized Skills** -- Domain-specific methodologies (UI design, testing, security, SEO, CRO, video, documents, skill authoring) that encode expert knowledge into repeatable workflows.
2. **Quality Enforcement** -- Hook handlers that run automatically on every edit, commit, and task completion. They lint, scan for security issues, verify claims, and detect failure loops -- mechanically, not by suggestion.
3. **Maximum Intelligence** -- Forces effort:max and opus model across all skills and agents. Independent agents review work, research codebases, and audit security without being asked.

## Skills

| Skill | Purpose | Commands |
|-------|---------|----------|
| **setup** | Initialize framework in a project | `/vibe:setup` |
| **reflect** | Guided self-assessment of session quality | `/vibe:reflect` |
| **pause** | Temporarily disable quality hooks for rapid prototyping | `/vibe:pause` |
| **resume** | Re-enable quality hooks after pausing | `/vibe:resume` |
| **seurat** | UI/UX design system, wireframing, layout, brand identity, WCAG | `/vibe:seurat setup`, `/vibe:seurat generate`, `/vibe:seurat brand` |
| **emmet** | Testing, QA, tech debt audit, systematic debugging | `/vibe:emmet test`, `/vibe:emmet techdebt`, `/vibe:emmet debug` |
| **heimdall** | Security analysis, OWASP Top 10, credential detection | `/vibe:heimdall audit`, `/vibe:heimdall scan` |
| **ghostwriter** | SEO + GEO dual optimization, persuasive copywriting | `/vibe:ghostwriter write`, `/vibe:ghostwriter optimize` |
| **baptist** | CRO orchestrator, A/B testing, funnel analysis | `/vibe:baptist audit`, `/vibe:baptist test` |
| **orson** | Programmatic video generation, demo recording with audio | `/vibe:orson create`, `/vibe:orson demo` |
| **scribe** | Office documents (xlsx, docx, pptx) and PDF creation | Describe file type -- auto-routed |
| **forge** | Create, audit, and maintain skills | `/vibe:forge create`, `/vibe:forge audit`, `/vibe:forge fix` |

## Agents

| Agent | Purpose | When Used |
|-------|---------|-----------|
| **reviewer** | Independent post-implementation review | After any significant code change |
| **researcher** | Deep codebase exploration and analysis | Before implementation, during planning |
| **guardian** | Security audit of changes | On file edits, before commits |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| **setup check** | SessionStart | Detect if setup done, inject framework status, recover post-compaction state |
| **lint** | PostToolUse (Edit/Write) | Run project linter on every file modification |
| **security scan** | PostToolUse (Edit/Write) | Lightweight regex scan for obvious vulnerabilities |
| **compact save** | PreCompact | Save active skills, modified files, workflow phase before compaction |
| **verification gate** | Stop | Block task completion claims without test output or evidence |
| **correction capture** | UserPromptSubmit | Detect corrections in 6 languages, queue for /vibe:reflect |
| **failure loop** | PostToolUseFailure | Stop after 3 consecutive failures, force systematic replan |

## How It Works

The plugin forces `effort:max` and the opus model on all skills and agents, ensuring Claude always operates at peak capability. Hook handlers enforce quality mechanically -- they run on every edit, commit, and completion claim without relying on Claude to remember. Agents provide independent review: the reviewer checks work after implementation, the researcher explores before implementation, and the guardian scans for security issues continuously. The correction capture hook learns from mistakes in six languages, building a self-improving knowledge base.

## Requirements

- **Claude Code** (CLI or VS Code extension)
- **Max 20x subscription** (recommended -- required for effort:max and opus model)
- **jq** (JSON processing)
- **Optional:** FFmpeg + `pip install edge-tts` (for Orson video/audio)
- **Optional:** Python 3.6+ (for Scribe document scripts)

## License

MIT

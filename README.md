# VIBE Framework 2.0

Quality-first plugin for Claude Code. Forces maximum effort, specialized methodologies, and mechanical quality gates for Max 20x subscribers.

## Installation

```
/plugin marketplace add DKHBSFA/vibe-framework
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
| **pause** | Save work state before interruption | `/vibe:pause` |
| **resume** | Restore state after compaction or restart | `/vibe:resume` |
| **seurat** | UI/UX design system, wireframing, layout, brand identity, WCAG | `/seurat map`, `/seurat wireframe`, `/seurat brand` |
| **emmet** | Testing, QA, tech debt audit, systematic debugging | `/emmet test`, `/emmet techdebt`, `/emmet debug` |
| **heimdall** | Security analysis, OWASP Top 10, credential detection | `/heimdall audit`, `/heimdall scan` |
| **ghostwriter** | SEO + GEO dual optimization, persuasive copywriting | `/ghostwriter write`, `/ghostwriter optimize` |
| **baptist** | CRO orchestrator, A/B testing, funnel analysis | `/baptist audit`, `/baptist test` |
| **orson** | Programmatic video generation, demo recording with audio | `/orson create`, `/orson demo` |
| **scribe** | Office documents (xlsx, docx, pptx) and PDF creation | Describe file type -- auto-routed |
| **forge** | Create, audit, and maintain skills | `/forge create`, `/forge audit`, `/forge fix` |

## Agents

| Agent | Purpose | When Used |
|-------|---------|-----------|
| **reviewer** | Independent post-implementation review | After any significant code change |
| **researcher** | Deep codebase exploration and analysis | Before implementation, during planning |
| **guardian** | Security audit of changes | On file edits, before commits |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| **setup check** | Post-install | Verify environment meets requirements |
| **lint** | Pre-commit | Code quality enforcement |
| **security scan** | File edit | Quick security scan on every change |
| **compact save** | Pre-compaction | Save state before context is compacted |
| **verification gate** | Task completion | Block "done" claims without evidence |
| **correction capture** | Post-correction | Learn from mistakes (6 languages) |
| **failure loop** | Consecutive failures | Stop after 3 failed attempts, force re-plan |

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

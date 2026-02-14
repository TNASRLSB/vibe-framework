# Claude Development Framework

An operating system for Claude Code with 8 specialized skills. It defines *how* Claude works (process rules, memory, verification) and *what* it knows (domain-specific skills).

## Skills

| Skill | What it does |
|-------|-------------|
| **seurat** | UI/UX design system generation, wireframing, page layout. 11 styles, 6 page archetypes, WCAG accessibility |
| **emmet** | Testing, QA, tech debt audit, functional mapping. Dual backend: Playwright + BrowserMCP |
| **heimdall** | AI-specific security analysis. OWASP Top 10, credential detection, BaaS audit, iteration tracking |
| **ghostwriter** | SEO + GEO (AI search) optimization and persuasive copywriting. 50 validation rules |
| **baptist** | CRO orchestrator. Fogg B=MAP diagnostics, A/B test design, funnel analysis |
| **orson** | Programmatic video + demo recording. 136+ animations, frame-addressed rendering, TTS narration, audio mixing |
| **scribe** | Office document creation and editing (xlsx, docx, pptx, pdf). Auto-routing by file type |
| **forge** | Meta-skill for creating, auditing, and improving Claude Code skills |

## Quick Start

**1. Copy into your project root:**
- `CLAUDE.md`
- `.claude/` (entire folder)

**2. Populate the registry** (existing projects):
```
Analyze this codebase and populate .claude/docs/registry.md with:
- Components and services
- Key functions
- API endpoints
- Database schema
- Environment variables
Skip sections that don't apply.
```

**3. Generate stack-specific patterns:**
```
/adapt-framework
```

**4. (Optional) For projects with UI:**
```
/seurat extract
/seurat analyze-project
```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI or VS Code extension)
- **Optional:** FFmpeg (for Orson video rendering and audio mixing)
- **Optional:** `pip install edge-tts` (for Orson TTS narration)
- **Optional:** `pip install elevenlabs` (for ElevenLabs TTS engine)

## Documentation

Full documentation (in Italian): [`.claude/README.md`](.claude/README.md)

Covers setup paths (new project, existing project, existing project with UI), skill commands, framework glossary, and FAQ.

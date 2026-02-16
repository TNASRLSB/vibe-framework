# Claude Development Framework

An operating system for Claude Code with 8 specialized skills and context awareness (Morpheus). It defines *how* Claude works (process rules, memory, verification) and *what* it knows (domain-specific skills).

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

## Setup

### Install (new project)

```bash
git clone <this-repo> ~/claude-framework
cd ~/claude-framework
./framework.sh /path/to/your/project
```

The script copies `CLAUDE.md` + `.claude/` into your project, creates `settings.local.json`, output directories, and updates `.gitignore`.

### Update (existing project)

```bash
cd ~/claude-framework
git pull
./framework.sh /path/to/your/project
```

Framework files (skills, workflows, checklists) are overwritten. User data (registry, decisions, specs, session-notes) is preserved. A backup is created before any changes.

Use `--dry-run` to preview changes without modifying anything.

### After install

1. **Populate the registry** (existing projects):
   ```
   Analizza questo codebase e popola .claude/docs/registry.md
   ```

2. **Generate stack-specific patterns:**
   ```
   /adapt-framework
   ```

3. **(Optional) For projects with UI:**
   ```
   /seurat extract
   /seurat map
   ```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI or VS Code extension)
- `jq` (required by Morpheus context awareness)
- **Optional:** FFmpeg (for Orson video rendering and audio mixing)
- **Optional:** `pip install edge-tts` (for Orson TTS narration)
- **Optional:** `pip install elevenlabs` (for ElevenLabs TTS engine)

## Documentation

Full documentation: [`.claude/README.md`](.claude/README.md)

Covers setup paths (new project, existing project, existing project with UI), skill commands, framework glossary, and FAQ.

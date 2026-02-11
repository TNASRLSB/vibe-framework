# Codebase Registry

**Last updated:** 2026-02-11

This is my memory. I update it as I learn. I check it before making claims.

---

## Skills

| Name | Location | Purpose |
|------|----------|---------|
| emmet | `.claude/skills/emmet/` | Testing, QA, functional mapping, tech debt audit. Comandi: `/emmet map`, `/emmet test` (`--static`/`--browser`), `/emmet report`, `/emmet techdebt`, `/emmet checklist`, `/adapt-framework`. Dual backend: Playwright + BrowserMCP. Visual QA. Integrazione Heimdall |
| seurat | `.claude/skills/seurat/` | UI design system generation, wireframing, page layout. Comandi: `/seurat setup`, `/seurat extract`, `/seurat build`, `/seurat audit`, `/seurat compliance`, `/seurat migrate`, `/seurat analyze-project`. 11 stili, 6 archetipi pagina, visual QA |
| heimdall | `.claude/skills/heimdall/` | AI-specific security analysis. Comandi: `/heimdall scan`, `/heimdall audit`, `/heimdall secrets`, `/heimdall baas`, `/heimdall report` (markdown/json/sarif). OWASP Top 10, diff-aware analysis, import checking (2000+ pkg), iteration tracking, hook integration |
| ghostwriter | `.claude/skills/ghostwriter/` | SEO + GEO optimization, persuasive copywriting. Comandi: `/ghostwriter write`, `/ghostwriter audit`, `/ghostwriter research`, `/ghostwriter optimize`, `/ghostwriter schema`, `/ghostwriter persona`, `/ghostwriter pillar-cluster`, `/ghostwriter meta`, `/ghostwriter llms-txt`, `/ghostwriter robots`. 50 regole validazione |
| orson | `.claude/skills/orson/` | Video + audio production. Comandi: `/orson create`, `/orson render`, `/orson demo`, `/orson formats`, `/orson entrances`. 132 animazioni, 13 director recipes, 4 modi (safe/chaos/hybrid/cocomelon). Audio integrato: track selection, mixing, TTS narration, ducking. Demo mode: Playwright recording con zoom, cursor animato, narrazione, sottotitoli. Integrazione seurat + ghostwriter |
| audiosculpt | `.claude/skills/audiosculpt/` | **DEPRECATED** — Migrato in Orson. TTS narration, coherence matrix, voice presets, templates, reference docs migrati in `orson/engine/audio/`. Strudel rimosso, sostituito da libreria audio curata + FFmpeg |
| baptist | `.claude/skills/baptist/` | CRO orchestrator: Fogg B=MAP, audit 7 dimensioni, A/B test design, funnel analysis. Comandi: `/baptist audit`, `/baptist test`, `/baptist funnel`, `/baptist report`, `/baptist analyze`. Delega copy a Ghostwriter, UI a Seurat |
| scribe | `.claude/skills/scribe/` | Document creation: xlsx, docx, pptx, pdf. Routing automatico per tipo file. OOXML editing workflow, scripts black-box (recalc, pack/unpack/validate, thumbnail). Integrazione Ghostwriter + Seurat |
| forge | `.claude/skills/forge/` | Meta-skill: creazione, manutenzione, miglioramento skill. Comandi: `/forge create`, `/forge audit` (semantico + quantitativo), `/forge fix`. Trimming methodology, progressive disclosure, quality checklist. Budget: SKILL.md < 3000 parole |

---

## Components

| Name | Type | Location | Purpose |
|------|------|----------|---------|
| | | | |

---

## Key Functions

| Function | Location | Lines | What it does |
|----------|----------|-------|--------------|
| | | | |

---

## API Endpoints

| Method | Route | Handler | Auth required |
|--------|-------|---------|---------------|
| | | | |

---

## Database

### Tables
| Table | Key columns | Used by |
|-------|-------------|---------|
| | | |

### Important queries
| Name | Location | What it does |
|------|----------|--------------|
| | | |

---

## Data Flows

*Document important data flows here.*

---

## External Dependencies

| Package | Version | Used for |
|---------|---------|----------|
| | | |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| | | |

---

## Notes

*Anything else I've learned that doesn't fit above.*


---

## How I Use This

1. **Before claiming something exists:** `grep "name" .claude/docs/registry.md`
2. **After discovering something:** Add it here immediately
3. **Before implementing:** Check what's already here
4. **After implementing:** Update with new components/functions

**If I'm about to write code that calls a function not listed here, I STOP and verify it exists first.**

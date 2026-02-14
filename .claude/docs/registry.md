# Codebase Registry

**Last updated:** 2026-02-13

This is my memory. I update it as I learn. I check it before making claims.

---

## Skills

| Name | Location | Purpose |
|------|----------|---------|
| emmet | `.claude/skills/emmet/` | Testing, QA, functional mapping, tech debt audit. Comandi: `/emmet map`, `/emmet test` (`--static`/`--browser`), `/emmet report`, `/emmet techdebt`, `/emmet checklist`, `/adapt-framework`. Dual backend: Playwright + BrowserMCP. Visual QA. Integrazione Heimdall |
| seurat | `.claude/skills/seurat/` | UI design system generation, wireframing, page layout. Comandi: `/seurat setup`, `/seurat extract`, `/seurat build`, `/seurat audit`, `/seurat compliance`, `/seurat migrate`, `/seurat analyze-project`. 11 stili, 6 archetipi pagina, visual QA |
| heimdall | `.claude/skills/heimdall/` | AI-specific security analysis. Comandi: `/heimdall scan`, `/heimdall audit`, `/heimdall secrets`, `/heimdall baas`, `/heimdall report` (markdown/json/sarif). OWASP Top 10, diff-aware analysis, import checking (2000+ pkg), iteration tracking, hook integration |
| ghostwriter | `.claude/skills/ghostwriter/` | SEO + GEO optimization, persuasive copywriting. Comandi: `/ghostwriter write`, `/ghostwriter audit`, `/ghostwriter research`, `/ghostwriter optimize`, `/ghostwriter schema`, `/ghostwriter persona`, `/ghostwriter pillar-cluster`, `/ghostwriter meta`, `/ghostwriter llms-txt`, `/ghostwriter robots`. 50 regole validazione |
| orson | `.claude/skills/orson/` | Video + audio production. Comandi: `/orson create`, `/orson render` (`--draft`/`--parallel`/`--no-audio`), `/orson demo`, `/orson batch`, `/orson formats`, `/orson entrances`. **v3 frame-addressed**: architettura Remotion-like con `interpolate()`, `spring()`, `__setFrame(n)`. 136+ animazioni (property-based interpolation maps), 13 director recipes, 4 modi (safe/chaos/hybrid/cocomelon). HW encoding (NVENC/VA-API/VideoToolbox), draft mode, parallel render, batch mode, asset embedding (base64), PiP video-in-video, SRT/VTT subtitles, advanced typography. Audio integrato: track selection, mixing, TTS narration, ducking. Demo mode: Playwright recording con zoom, cursor animato, narrazione, sottotitoli. Integrazione seurat + ghostwriter |
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
| interpolate | orson/engine/src/interpolate.ts | - | Core frame-addressed interpolation: multi-stop ranges, 20+ easings, clamp/extend extrapolation |
| spring | orson/engine/src/interpolate.ts | - | Physics-based spring animation (damped harmonic oscillator), cached curves |
| expandAnimation | orson/engine/src/timeline.ts | - | Expands AnimationDef → RendererFrameAnimation[] with absolute frame numbers |
| generateFrameRendererJS | orson/engine/src/frame-renderer.ts | - | Generates self-contained JS implementing window.__setFrame(n) |
| buildRendererTimeline | orson/engine/src/html-generator.ts | - | Converts Timeline → RendererTimeline for frame renderer injection |
| computeSceneTimingFrames | orson/engine/src/timing.ts | - | Wrapper: computes scene timing and converts ms → frame counts |
| detectHardwareEncoder | orson/engine/src/encode.ts | - | Probes FFmpeg for NVENC/VA-API/VideoToolbox HW encoders |
| renderParallel | orson/engine/src/parallel-render.ts | - | Renders scenes in parallel Playwright workers then concat |
| generateSRT / generateVTT | orson/engine/src/subtitles.ts | - | Generates SRT/VTT subtitle files from scene timings |
| runBatch | orson/engine/src/batch.ts | - | Batch renders N video variants from template + variables |
| embedAsDataURI | orson/engine/src/asset-embed.ts | - | Converts local images to base64 data URIs for self-contained HTML |
| extractNarrationBrief | orson/engine/src/html-parser.ts | - | Extracts narration-ready text from HTML scenes for TTS pipeline |
| fixElementGaps | orson/engine/src/timeline.ts | - | Detects/fixes >200ms gaps where no element is visible in a scene |
| planChoreography | orson/engine/src/choreography.ts | - | Builds choreography plan: stagger delays, easing IDs, Disney principles flags |
| buildAnticipation | orson/engine/src/timeline.ts | - | Generates pre-entrance Disney anticipation animations (Y offset, scale down) |
| buildFollowThrough | orson/engine/src/timeline.ts | - | Generates post-entrance overshoot/settle animations |
| selectEntranceByRole | orson/engine/src/actions.ts | - | Role-based semantic animation selection (hero-heading→slam, body→fade-in-up, etc.) |
| selectDecoratives | orson/engine/src/decorative.ts | - | Selects CSS-only decorative elements (orbs, rings, grids) per scene type and mode |
| matchIcon | orson/engine/src/icon-library.ts | - | Keyword-matching SVG icon lookup (~30 inline icons, 5 categories) |
| detectMockupType | orson/engine/src/mockups.ts | - | Detects terminal/browser/phone mockup type from text content |
| generateMockup | orson/engine/src/mockups.ts | - | Generates CSS-only UI mockup HTML (terminal, browser, phone frames) |
| splitText | orson/engine/src/html-generator.ts | - | Wraps text into word/char spans for stagger animations |
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

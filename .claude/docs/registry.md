# Codebase Registry

**Last updated:** 2026-03-17

This is my memory. I update it as I learn. I check it before making claims.

---

## Skills

| Name | Location | Purpose |
|------|----------|---------|
| Seurat | `.claude/skills/seurat/` | UI design system, wireframing, page layout, WCAG accessibility, brand identity |
| Emmet | `.claude/skills/emmet/` | Testing, QA, tech debt audit, functional mapping, unit tests |
| Heimdall | `.claude/skills/heimdall/` | AI-specific security analysis, OWASP Top 10, credential detection |
| Ghostwriter | `.claude/skills/ghostwriter/` | SEO + GEO dual optimization, persuasive copywriting |
| Baptist | `.claude/skills/baptist/` | CRO orchestrator, A/B testing, funnel analysis |
| Orson | `.claude/skills/orson/` | Programmatic video generation, demo recording with audio |
| Scribe | `.claude/skills/scribe/` | Office documents (xlsx, docx, pptx) and PDF handling |
| Forge | `.claude/skills/forge/` | Meta-skill for creating, auditing, and maintaining skills |

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

### Seurat Brand Identity (`/seurat brandidentity`)

Added 2026-03-17. Three reference files in `.claude/skills/seurat/references/`:

| File | Purpose |
|------|---------|
| `references/brandidentity.md` | Main workflow: phases, user gates, schemas (brief.json, identity.json, tokens.json), flag routing |
| `references/logo-design.md` | Logo theory (Henderson & Cote, Bertin), SVG generation patterns, variation rules, construction docs |
| `references/brand-guidelines.md` | Guidelines structure (6 sections), 18-slide proposal, PDF generation via Scribe/reportlab |

Output: `.seurat/brand/` (brief.json, identity.json, tokens.json, logo SVGs, guidelines PDF, proposal PDF)


---

## How I Use This

1. **Before claiming something exists:** `grep "name" .claude/docs/registry.md`
2. **After discovering something:** Add it here immediately
3. **Before implementing:** Check what's already here
4. **After implementing:** Update with new components/functions

**If I'm about to write code that calls a function not listed here, I STOP and verify it exists first.**

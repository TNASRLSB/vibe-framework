# Ghostwriter — Knowledge Base

Domain knowledge and reference material for the Ghostwriter SEO/GEO/Copy skill. This file is for human readers — Claude does not load it during skill execution.

## The New Search Paradigm

### The Shift (2024-2026)

The search landscape has fundamentally transformed:

| Metric | Traditional Era | AI Era |
|--------|----------------|--------|
| Google Market Share | 92%+ | <90% (first time in decade) |
| Zero-Click Searches | 30% | 60%+ |
| AI-Driven Traffic Growth | N/A | +1,200% (mid-2024 to early 2025) |
| Traditional Organic Decline | Baseline | -15-25% for many brands |

**Critical Insight**: Content that is not optimized for BOTH traditional search AND AI citation risks becoming invisible.

### The Symbiotic Relationship

```
Traditional SEO ──────────────────────────┐
     │                                    │
     │ Makes content discoverable         │
     │ & indexed                          │
     ▼                                    │
  Bing Index ◄─────────────────────────────┤
     │                                    │
     │ Powers ChatGPT Search              │
     ▼                                    │
  LLM Retrieval (RAG) ◄───────────────────┤
     │                                    │
     │ Requires structured,               │
     │ citable content                    │
     ▼                                    │
GEO Optimization ─────────────────────────┘
```

**Key Principle**: If a page is not well-indexed in traditional search, it CANNOT be retrieved by LLMs. Traditional SEO is the foundation; GEO is the enhancement.

## The Dual-Optimized Content Formula

```
1. RESEARCH
   - Keyword + intent analysis
   - AI platform query analysis
   - Competitor gap analysis

2. STRUCTURE
   - Answer-first format
   - Self-contained chunks
   - Clear heading hierarchy

3. WRITE
   - E-E-A-T signals embedded
   - Copywriting framework applied
   - Entity definitions explicit

4. OPTIMIZE
   - Title + meta optimized
   - Schema markup added
   - Internal links placed

5. VALIDATE
   - SEO checklist passed
   - GEO checklist passed
   - Copywriting checklist passed

6. PUBLISH & MONITOR
   - Submit to search engines
   - Track rankings + citations
   - Iterate based on data
```

---

## Output File Structure

When Ghostwriter generates project artifacts, they are organized in this directory:

```
.ghostwriter/
├── strategy.md           # Content strategy document
├── keywords.md           # Keyword research and mapping
├── content-calendar.md   # Production schedule
├── personas/             # Buyer personas
├── audits/               # Content audit reports
└── schemas/              # Reusable schema templates
```

---

## Resources Directory Guide

For detailed documentation, explore the subdirectories within the Ghostwriter skill:

- `seo/` — Traditional SEO (fundamentals, technical, on-page, off-page)
- `geo/` — GEO (fundamentals, content structure, AI bots, schema)
- `copywriting/` — Frameworks, headlines, CTA, psychology
- `generation/` — Content generation prompts (article, landing page, product, pillar-cluster, FAQ, meta)
- `validation/` — 50 measurable validation rules
- `templates/` — Article template + JSON-LD schema templates (article, FAQ, howto, product, local-business, person)
- `checklists/` — Pre-publish, audit, technical SEO
- `workflows/` — Content creation, interactive, optimization, audit flows
- `reference/` — Brand guidelines, project context, product sheets (user-populated)

---

## Deprecated Commands

| Comando | Sostituito da | Motivo |
|---------|---------------|--------|
| `/ghostwriter audit` | `/ghostwriter optimize` (senza PROCEED) | L'audit è il primo step di optimize. Report in `.ghostwriter/audit-report.md` |
| `/ghostwriter research [topic]` | `/ghostwriter write` (step 2) | La ricerca è parte integrante della generazione |
| `/ghostwriter schema [type]` | `/ghostwriter write` / `optimize` | Schema generato automaticamente come parte del deliverable |
| `/ghostwriter meta [content]` | `/ghostwriter write` / `optimize` | Meta tags generati automaticamente come parte del deliverable |
| `/ghostwriter persona [audience]` | `/ghostwriter write` (step 2) | Persona derivata durante la fase di ricerca |
| `/ghostwriter pillar-cluster [topic]` | `/ghostwriter write pillar` | Il type `pillar` include topic cluster map + linking plan |
| `/ghostwriter llms-txt` | `/ghostwriter optimize` / `write` | Generato come parte dell'infrastruttura tecnica |
| `/ghostwriter robots [strategy]` | `/ghostwriter optimize` / `write` | Generato come parte dell'infrastruttura tecnica |

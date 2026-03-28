# Model Assignment Map

Single source of truth for model and effort assignments across the VIBE Framework.
Last updated: 2026-03-28

---

## Assignment Tiers

### Tier 1: Opus — Complex Reasoning Required

Tasks requiring creative writing, strategic insight, cross-domain synthesis, or novel pattern discovery.

| Component | Type | Effort | Rationale |
|-----------|------|--------|-----------|
| ghostwriter | skill | max | Creative writing, anti-AI voice, persuasive copy |
| seurat | skill + agent | max | Design decisions, aesthetic judgment, WCAG reasoning |
| heimdall | skill + agent | max | Novel vulnerability discovery, complex attack chains |
| audit | skill | max | Cross-domain correlation, synthesis of 7 agent reports |

### Tier 2: Sonnet — Structured Execution

Tasks following templates, pattern matching, code analysis, format compliance.

| Component | Type | Effort | Rationale |
|-----------|------|--------|-----------|
| baptist | skill + agent | max | CRO analysis — validated via A/B test B2 (Opus 4.9 vs Sonnet 4.9 = parity) |
| emmet | skill + agent | max | Test writing from templates, systematic debugging |
| scribe | skill + agent | max | Document generation from format specs |
| orson | skill + agent | max | Technical video orchestration |
| reviewer | agent | max | Code review = pattern recognition + best practices |
| researcher | agent | max | Codebase search and documentation |
| forge | skill | max | Skill creation from templates and checklists |

### Tier 3: Haiku — Simple Processing (Planned)

Tasks requiring speed over depth: web scraping, summarization, simple validation.

| Component | Type | Effort | Status |
|-----------|------|--------|--------|
| competitor research (discovery agents) | shared protocol | — | **Applied** — WebSearch + candidate ID |
| hook validation scripts | hooks | low | **Pending architectural review** |

---

## Validation Status

| Component | Current | Validated? | Test Cases | Last Validated |
|-----------|---------|-----------|------------|----------------|
| emmet | sonnet | Pending | E1, E2 | — |
| scribe | sonnet | Pending | SC1, SC2 | — |
| orson | sonnet | Pending | O1 | — |
| reviewer | sonnet | Pending | R1, R2 | — |
| researcher | sonnet | Pending | RS1 | — |
| forge | sonnet | Pending | F1 | — |
| heimdall | opus | **Validated: keep Opus** — Opus 5.0 vs Sonnet 4.5, token confusion chain missed by Sonnet | H2 | 2026-03-28 |
| baptist | sonnet | **Validated: parity** — Opus 4.9 vs Sonnet 4.9, no meaningful quality gap | B2 | 2026-03-28 |

---

## Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-28 | emmet, scribe, orson, reviewer, researcher, forge → sonnet | Conservative model tiering — pattern matching and template-following tasks don't need Opus-level reasoning |
| 2026-03-28 | forge templates default → sonnet | New skills should default to sonnet, upgrade to opus only if needed |
| 2026-03-28 | competitor research discovery → haiku, default 5 languages | Discovery agents do WebSearch + candidate listing — Haiku's sweet spot. Default 5 langs covers ~75% web commerce, --global for full 11 |
| 2026-03-28 | baptist → sonnet | A/B test B2: Opus 4.9 vs Sonnet 4.9 — parity on CRO analysis, funnel diagnosis, and strategic insight |
| 2026-03-28 | heimdall stays opus | A/B test H2: Opus 5.0 vs Sonnet 4.5 — Opus found token confusion chain (reset JWT → auth → admin via undefined role) that Sonnet missed |

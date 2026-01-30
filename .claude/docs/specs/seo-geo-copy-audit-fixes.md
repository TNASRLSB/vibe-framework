# SEO-GEO-Copy Skill: Audit-Driven Improvements

**Date:** 2026-01-30
**Status:** Implemented

## What was the problem?

Three sites built with the seo-geo-copy skill (Cumino, Tora No Ai, Hyperuranios) all failed external SEO audits on recurring issues. The skill had the rules but didn't enforce them tightly enough.

## Problems found across all 3 reports

| Problem | Cumino | TNA | Hype |
|---------|--------|-----|------|
| Meta description >158 chars | — | 163 | 161 |
| Title >60 chars / duplicated brand | — | 116 (brand 2x) | — |
| Canonical tag missing | ✗ | — | — |
| Schema.org missing | ✗ | — | — |
| OpenGraph incomplete | — | ✗ | — |
| Sitemap missing | — | ✗ | — |
| Robots.txt missing | — | ✗ | — |
| WWW canonicalization broken | — | ✗ | — |
| Too few internal links | — | — | ✗ (5) |
| Zero external links | — | ✗ (0) | ✗ (0) |
| Too few H2 sections | — | ✗ (2) | ✗ (2) |

## Root causes

1. **Character limits too generous** — "≤160" target means off-by-one errors pass validation
2. **No brand duplication check** — title tag rule didn't catch "Brand | X | Brand" pattern
3. **Technical infra not treated as deliverable** — canonical, schema, OG, sitemap, robots.txt were checklists but not enforced as mandatory outputs
4. **Link minimums too low** — "2 per 1000 words" insufficient for landing pages
5. **No H2 count minimum** — pages could pass with only 2 headings

## Changes made

### validation/rules.md
- SEO-001: Title target tightened to 30-55 chars, added brand duplication check
- SEO-003: Meta description target tightened to 120-155, hard max 158
- SEO-009: Internal links minimum raised to 8 for landing pages
- SEO-011: NEW — External links rule (min 1 for landing, 2 for articles)
- SEO-012: NEW — H2 count rule (min 4 for landing pages)
- TECH-004: Canonical tag marked MANDATORY
- TECH-005: OG tags expanded to require all 6 properties
- TECH-006: NEW — XML sitemap rule
- TECH-007: NEW — Robots.txt rule
- TECH-008: NEW — WWW canonicalization rule
- TECH-009: NEW — Noindex verification rule
- Scoring updated: 46 total rules (was 40)

### checklists/pre-publish.md
- Title: target 30-55, brand duplication check, re-count after edit
- Meta description: target 120-155, re-count after edit
- Links: 8+ internal for landing pages, external link minimum
- Headers: minimum 4 H2s for landing pages
- Indexability: expanded with sitemap, robots.txt, WWW canonicalization
- NEW subsection: Open Graph & Social (all 6 OG tags required)

### generation/landing-page.md
- SEO checks updated with tighter char limits and H2 minimum
- NEW: Technical Infrastructure Checklist in output format (9 mandatory items)

### generation/meta-content.md
- Title rules: target 30-55, hard max 60, brand once, verify twice
- Description rules: target 120-155, hard max 158, verify after writing
- Output checklist: added brand duplication and re-count checks

### SKILL.md
- Prime Directives: added #8 (Measure Twice) and #9 (Technical Infra is a Deliverable)
- NEW: Technical Infrastructure Requirements table with audit failure examples
- Enforcement rule: always include Technical Infrastructure section in deliverables
- Validation system: updated to 46 rules
- Indexability checklist: expanded with canonical, sitemap, robots.txt, WWW canon

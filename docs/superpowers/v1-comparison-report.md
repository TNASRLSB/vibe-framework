# v1 vs v2 Comparison Report

**Date:** 2026-03-26
**Purpose:** Identify valuable content from v1 that was lost in the v2 rewrite.

---

## 1. Heimdall

### What v1 had that v2 is missing

**Python Scripts (6 files):**
- `scanner.py` — Full scanning engine with SARIF output, path-context severity adjustment, "Did You Mean?" secure alternatives, comment detection, pre-compiled regex
- `secret-detector.py` — Entropy-based secret detection (Shannon entropy > 4.5), bundle scanning, placeholder filtering, client-file severity boost
- `diff-analyzer.py` — Diff-aware security regression detection: tracks 9 categories of security patterns (auth_check, validation, rate_limiting, access_control, crypto, input_sanitization, sql_protection, csrf_protection, security_headers) with 47 regex patterns and path-sensitive severity escalation
- `import-checker.py` — Import existence validation with Levenshtein fuzzy matching, known typo map, language-specific extractors (JS/TS, Python, Go, Rust), internal import detection
- `iteration-tracker.py` — File-level iteration counting with complexity tracking, warning escalation at 4/6 thresholds, session state persistence
- `baas-auditor.py` — Provider auto-detection (Supabase, Firebase, Amplify, PocketBase), config/client/env file auditing, dangerous env var detection (NEXT_PUBLIC_*SERVICE_ROLE*)

**Hook Scripts (2 files):**
- `pre-tool-validator.py` — Pre-write code validation
- `post-tool-scanner.py` — Post-write diff analysis + import check + security scan

**Data Files:**
- `known-packages.json` — ~2000 packages across JS/TS/Python/Go/Rust with typo maps and scoped prefixes

**Test Files:**
- `test/vulnerable-samples/` — 7 test files covering auth/crypto vulns, exposed secrets, Firebase misconfig, Firestore rules, injection vulns, Python vulns, Supabase misconfig

**Reference Files carried over:**
- `references/secure-patterns.md` — v1 had this as a standalone file; v2 merged this content into `references/patterns.md` (fully preserved)
- `references/hook-setup.md` — Hook configuration guide (eliminated by design in v2)

### Assessment

**Scripts: Yes, recover.** The scripts contain real, runnable security tooling. v2's SKILL.md describes the same concepts textually, but the scripts provide actual executable tools users can run outside of Claude. Key unique value:
- Shannon entropy-based secret detection algorithm
- Levenshtein similarity matching for typo detection
- SARIF output format for CI/CD integration
- Security pattern regression detection with 47 regex patterns

**known-packages.json: Yes, recover.** The import checker needs this data file to work. Without it, the import-checker.py script is non-functional.

**Hook scripts: No.** These were specific to the v1 hook architecture. v2 uses a different approach (`security-quickscan hook` mentioned in SKILL.md). The concepts are documented.

**Test files: No.** These were for validating the scripts. Useful only if scripts are being developed/tested.

---

## 2. Seurat

### What v1 had that v2 is missing

**Factor-X System (5 files):**
- `factor-x/index.md` — "Controlled chaos" system with 5 categories: Typography Clash, Color Intrusion, Layout Break, Texture Injection, Motion Surprise
- `factor-x/typography-clash.md`, `color-intrusion.md`, `layout-break.md`, `texture-injection.md`, `motion-surprise.md` — Detailed implementations per category

The Factor-X concept: a single "breaker" element applied to otherwise-predictable matrix-generated designs to create distinctiveness. Includes intensity levels (subtle/moderate/bold/extreme), compatibility rules per style, and examples.

**Wireframe System (12 files):**
- `wireframes/README.md`, `layout-system.md`, `primitives.md`, `components.md`, `motion.md`, `visual-composition.md`, `variant-selection.md`
- `wireframes/entry.md`, `discovery.md`, `detail.md`, `action.md`, `management.md`, `system.md`

ASCII wireframe definitions per archetype with component palettes and responsive behavior. v2's `references/archetypes.md` covers the same archetypes with ASCII layouts already, making the separate wireframe files redundant.

**Matrices (9 files in `matrices/`):**
- by-industry, by-type, by-target (budget, company-size, consumer-type, demographics, geo, role, tech-level)

These were the fuzzy-weight matrices eliminated by design.

**Other files:**
- `accessibility.md`, `typography.md`, `validation.md` — v2 has `references/accessibility.md` covering accessibility
- `generation/modes.md`, `generation/combination-logic.md`, `generation/anti-patterns.md` — Generation logic
- `styles/index.md`, `styles/base/` (11 files), `styles/modifiers/` (4 files) — v2 has `references/styles.md` with all 11 styles
- `taxonomy/elements.md`, `taxonomy/pages.md` — Element/page taxonomy
- `templates/` — HTML templates for archetypes and design system preview

### Assessment

**Factor-X system: Yes, recover.** This is genuinely useful domain knowledge about creating visual distinctiveness. The concept of controlled chaos breakers (one per project, applied in non-critical zones, scaled by trust weight) is practical design wisdom not captured elsewhere in v2. However, the matrices it referenced are eliminated by design, so the content needs adaptation.

**Wireframes: No.** v2's archetypes.md already contains ASCII layouts, component palettes, responsive breakpoints, and data flow per archetype.

**Matrices: No (eliminated by design).**

**Styles, accessibility, typography: No.** Already well-covered in v2 references.

---

## 3. Emmet

### What v1 had that v2 is missing

**Experiential Testing (testing/experiential.md):**
- Detailed `--personas` testing methodology using `@playwright/mcp`
- Claude navigates a real browser as different user personas, takes screenshots, evaluates UX qualitatively
- Scoring criteria (1-5) across 8 areas: Onboarding, Navigation, Core Task, Feedback, Error Recovery, Visual Clarity, Performance, Mobile
- Complete report template with cross-persona summary

v2 has `references/personas.md` which covers the same concept with Playwright configurations, test scenarios, and screenshot points per persona. The v2 version is actually more concrete (includes TypeScript Playwright configs).

**Other v1 files:**
- `testing/static.md`, `testing/dynamic.md`, `testing/unit.md` — Testing strategies; v2 has `references/strategies.md`
- `testing/plan-template.md`, `testing/report-template.md` — Templates; v2 has `references/templates.md`
- `checklists/code-review.md`, `pre-deploy.md`, `refactoring.md`, `security.md` — v2 has `references/checklists.md`
- `prompts/map.md`, `prompts/test.md` — Prompt templates
- `templates/functional-map.md`, `templates/techdebt-report.md` — Output templates
- `scripts/with-server.sh` — Server helper script

### Assessment

**No recovery needed.** v2's Emmet references cover the same ground. The experiential testing persona approach is well-represented in v2's personas.md with more actionable Playwright configurations.

---

## 4. Ghostwriter

### What v1 had that v2 is missing

**JSON-LD Schema Templates (6 files):**
- `templates/schemas/article.json` — Complete Article schema with author, publisher, image
- `templates/schemas/faq.json` — FAQPage schema with Question/Answer pairs
- `templates/schemas/howto.json` — HowTo schema with steps, supplies, tools, time
- `templates/schemas/product.json` — Product schema with offers, ratings, reviews
- `templates/schemas/local-business.json` — LocalBusiness schema with address, hours, geo
- `templates/schemas/person.json` — Person schema with expertise, affiliations, social links

v2's GEO reference mentions these schema types and their GEO value but does NOT include the actual JSON-LD templates. The templates are copy-paste-ready with placeholder variables.

**KPI Measurement Framework (in references/schema-patterns.md):**
- SEO KPIs table (Rankings, Traffic, CTR, Bounce, DA)
- GEO KPIs table (Citation Frequency, Brand Mentions, Retrievability, AI Referral Traffic)
- Copywriting KPIs table (Conversion Rate, Time on Page, Scroll Depth, Form Completion)

v2's validation.md has the 52-rule checklist but does not include these measurement KPI tables.

**Other v1 files:**
- `seo/fundamentals.md`, `on-page.md`, `off-page.md`, `technical.md` — v2 has `references/seo.md`
- `geo/fundamentals.md`, `content-structure.md`, `ai-bots.md`, `schema.md` — v2 has `references/geo.md`
- `copywriting/frameworks.md`, `cta.md`, `headlines.md`, `psychology.md` — v2 has `references/copywriting.md`
- `generation/` (6 files) — Content generation guides; v2 covers in SKILL.md
- `workflows/` (4 files) — Workflow guides; v2 covers in SKILL.md
- `checklists/` (3 files) — v2 covers in validation.md
- `validation/rules.md` — v2 has validation.md

### Assessment

**JSON-LD templates: Yes, recover.** These are immediately useful reference material. When Ghostwriter needs to output structured data, having ready-made templates saves significant effort. v2's GEO reference discusses schema types abstractly but doesn't give the actual JSON-LD. Recover all 6 templates into a new reference file.

**KPI tables: Yes, recover.** Useful measurement framework that complements the existing validation checklist. Add to the GEO reference.

---

## 5. Baptist

### What v1 had that v2 is missing

**Page-Specific Frameworks (references/page-frameworks.md):**
- Homepage CRO framework with experiment ideas
- Landing Page CRO with above-fold checklist
- Pricing Page CRO framework
- (likely also: Signup, Checkout, Product pages)

v2's SKILL.md has a page type table (landing, product, pricing, checkout, form, popup) but the detailed frameworks with experiment ideas per page type are not in v2's reference files.

**Specialized Strategy References (3 files):**
- `references/paywall-strategy.md` — Trigger points (feature gate, usage limit, trial expiry, context, time-based), timing rules (when to show, when NOT to show), frequency rules
- `references/popup-strategy.md` — Trigger taxonomy (time, scroll, exit-intent, click, session/page count, behavior), frequency capping, escalation rules, compliance
- `references/form-strategy.md` — Field strategy (keep/defer/remove framework), field priority by form type, field cost benchmarks (3 fields baseline, 7+ fields = 25-50% reduction), field-by-field optimization

v2 has none of these as dedicated reference files. The form-strategy content is particularly valuable with its 2026 benchmark data.

**Other v1 files:**
- `references/activation-metrics.md` — Activation metrics
- `references/advanced-testing.md` — Advanced testing patterns
- `assets/` (6 files) — Report templates

### Assessment

**Page frameworks: Yes, recover.** The page-specific CRO frameworks with experiment idea lists are practical, actionable content.

**Paywall/popup/form strategy: Yes, recover.** These are specialized CRO knowledge domains not covered in v2. The form-strategy content with field cost benchmarks is particularly high-value.

---

## 6. Orson

### What v1 had that v2 is missing

The Orson engine was fully migrated to v2. Both v1 and v2 have the same engine code, audio presets, and scripts. v2 actually has MORE reference files (`references/audio.md`, `components.md`, `recipes.md`, `rendering.md`).

### Assessment

**No recovery needed.** v2 Orson is a superset of v1.

---

## 7. Scribe

### What v1 had that v2 is missing

**Financial Model Template (templates/financial-model.md):**
- Complete 9-sheet financial model structure: Cover, Assumptions, Revenue, Costs, P&L, Balance Sheet, Cash Flow, KPIs/Dashboard, Scenarios
- Color coding conventions (yellow = inputs)
- KPI tables by category (Profitability, Liquidity, Efficiency, Growth, Valuation)
- Best practices: no magic numbers, formulas reference Assumptions only, balance check formulas

v2's xlsx.md has a basic "Financial Model Patterns" section with income statement template code and variance analysis code, but lacks the comprehensive sheet-by-sheet structure guide.

### Assessment

**Financial model template: Yes, recover.** This is a complete financial modeling reference that v2's basic code patterns don't replace. Useful for anyone building Excel financial models.

---

## 8. Forge

### What v1 had that v2 is missing

**v1 files:**
- `references/skill-anatomy.md` — v2 has `references/anatomy.md` (updated for v2 format)
- `references/quality-checklist.md` — v2 has `references/quality.md`
- `references/progressive-disclosure.md` — Progressive disclosure patterns
- `references/trimming-methodology.md` — How to trim skills for token efficiency
- `scripts/audit-skills.sh` — Shell script for auditing skills
- `templates/` (3 files) — Skill/knowledge/reference templates

v2's anatomy.md is updated for the v2 format (effort, model, disable-model-invocation fields). The quality and template references are updated for v2 conventions.

### Assessment

**No recovery needed.** v2's Forge references are updated for the v2 skill format and architecture. The v1 content was v1-specific.

---

## Recovery Plan

### Items to recover

| # | Source | Destination | Content |
|---|--------|------------|---------|
| 1 | Heimdall scripts (6 files) | `skills/heimdall/scripts/` | All 6 Python scripts |
| 2 | Heimdall known-packages.json | `skills/heimdall/data/known-packages.json` | Package database |
| 3 | Seurat Factor-X | `skills/seurat/references/styles.md` (append) | Factor-X concept adapted for v2 |
| 4 | Ghostwriter JSON-LD templates | `skills/ghostwriter/references/schemas.md` (new) | 6 schema templates |
| 5 | Ghostwriter KPIs | `skills/ghostwriter/references/geo.md` (append) | KPI measurement tables |
| 6 | Baptist page frameworks | `skills/baptist/references/frameworks.md` (append) | Page-specific CRO |
| 7 | Baptist specialized strategies | `skills/baptist/references/tactics.md` (new) | Paywall, popup, form strategy |
| 8 | Scribe financial model | `skills/scribe/references/xlsx.md` (append) | Full financial model structure |

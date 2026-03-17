# `/seurat brandidentity` Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `/seurat brandidentity` command — codebase analysis → brand identity → logo SVG → guidelines PDF → proposal PDF, with user gates and incremental flags.

**Architecture:** Four new files: three reference documents in `.claude/skills/seurat/references/` encoding the complete workflow, logo theory, and guidelines structure; plus a command block added to `SKILL.md` for routing. The reference files are the "brain" — they contain prompts, schemas, decision trees, and examples that guide Claude when the command is invoked. PDF generation delegates to Scribe (reportlab). Brand voice delegates to Ghostwriter.

**Tech Stack:** Markdown (skill definitions), SVG (logo generation), reportlab via Scribe (PDF), JSON (brief.json, identity.json, tokens.json)

**Spec:** [2026-03-17-seurat-brandidentity-design.md](docs/superpowers/specs/2026-03-17-seurat-brandidentity-design.md)

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `.claude/skills/seurat/references/brandidentity.md` | Main command workflow: routing, phases, user gates, prompts, output schemas, integration points, incremental flags |
| Create | `.claude/skills/seurat/references/logo-design.md` | Logo theory: shape psychology, Henderson & Cote framework, SVG generation patterns, geometric construction, variation rules |
| Create | `.claude/skills/seurat/references/brand-guidelines.md` | Guidelines structure: all 6 sections (strategy, visual identity, voice, digital, architecture, resources), content standards, PDF slide structure |
| Modify | `.claude/skills/seurat/SKILL.md` | Add `/seurat brandidentity` command block with routing to reference files |

---

### Task 1: Add command routing to SKILL.md

**Files:**
- Modify: `.claude/skills/seurat/SKILL.md:83-116` (Primary Commands section)

- [ ] **Step 1: Read SKILL.md and identify insertion point**

The new command block goes in the "Primary Commands" section, after `/seurat extract` and before `/seurat preview`. It's a primary command because it's a major workflow, not a secondary utility.

- [ ] **Step 2: Add `/seurat brandidentity` command block**

Insert after the `/seurat extract` section (after line ~138) and before `/seurat preview` (line ~142):

```markdown
### `/seurat brandidentity`

Generate a complete brand identity system from codebase analysis: brand brief, identity profile, generative SVG logo, brand guidelines PDF, and proposal presentation PDF.

**Flags:**
```
/seurat brandidentity          # Full flow: discovery → identity → guidelines → PDF
/seurat brandidentity --brief  # Only codebase analysis + brand brief
/seurat brandidentity --logo   # Skip to logo generation (assumes brief exists)
/seurat brandidentity --pdf    # Skip to PDF presentation (assumes identity exists)
```

**Process:**
1. **Discovery** — Scan codebase, produce `brief.json` → **user gate: review brief**
2. **Identity** — Brand identikit, 2-3 concept directions → **user gate: select concept**
3. **Logo** — Generative SVG (geometric/abstract) + logotype + figurative spec + variations
4. **Guidelines** — Full brand guidelines document (strategy, visual, voice, digital, architecture, resources)
5. **Proposal** — Professional PDF presentation using the brand's own palette/typography

**Output:** `.seurat/brand/` directory (see [references/brandidentity.md](references/brandidentity.md) for full structure)

**Token handoff:** Produces `.seurat/brand/tokens.json` consumed by all other Seurat commands. If `/seurat extract` was run first, existing tokens inform the brief. If brandidentity runs first, subsequent commands inherit the brand.

**Integration:**
- **Scribe** — PDF generation (reportlab) for guidelines and proposal
- **Ghostwriter** — Brand voice copy, messaging, taglines
- **Emmet** — Validates SVG output, tests token consistency

**Reference files:**
- [references/brandidentity.md](references/brandidentity.md) — Complete workflow, prompts, schemas
- [references/logo-design.md](references/logo-design.md) — Logo theory, SVG patterns, shape psychology
- [references/brand-guidelines.md](references/brand-guidelines.md) — Guidelines structure, content standards
```

- [ ] **Step 3: Add `.seurat/brand/` to Design System Memory section**

After the existing `.seurat/patterns/` entry (~line 352), add:

```markdown
### Directory: `.seurat/brand/`
Brand identity system: brief.json, identity.json, tokens.json, logo SVGs, guidelines PDF, proposal PDF. Created by `/seurat brandidentity`.
```

- [ ] **Step 4: Add Two Workflows entry for brand identity**

In the "Two Workflows" section (~line 24), add a third workflow:

```markdown
### Brand Identity
```
/seurat brandidentity  → analyze codebase, generate brand identity + logo + guidelines + PDF
/seurat setup          → (inherits brand tokens automatically)
/seurat build [type]   → (uses brand palette/typography)
```
```

- [ ] **Step 5: Verify SKILL.md is valid**

Read the modified file, confirm:
- No broken markdown links
- Command block is properly formatted
- Reference file paths are correct relative paths

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/seurat/SKILL.md
git commit -m "feat(seurat): add /seurat brandidentity command routing to SKILL.md"
```

---

### Task 2: Create `references/brandidentity.md` — Main workflow reference

**Files:**
- Create: `.claude/skills/seurat/references/brandidentity.md`

This is the largest file — the complete command guide that Claude reads when `/seurat brandidentity` is invoked. It contains the full workflow, prompts, schemas, user gates, and integration instructions.

- [ ] **Step 1: Write the Phase 0 (Prerequisites & Flag Routing) section**

Content must cover:
- Flag detection (`--brief`, `--logo`, `--pdf`) and what each skips
- Prerequisite checks (e.g., `--logo` requires `.seurat/brand/brief.json`)
- Output directory setup (`.seurat/brand/` with subdirs `logo/`, `guidelines/`, `proposal/`)
- `.gitignore` handling (`.seurat/` excluded except `tokens.json`)
- Integration check: does `.seurat/tokens.css` exist? (existing Seurat tokens inform brief)

- [ ] **Step 2: Write Phase 1 (Codebase Analysis & Brand Discovery) section**

Content must cover:
- What to scan: package.json/Cargo.toml/pyproject.toml (name, description, keywords), README (mission, tagline, audience), `.seurat/tokens.css` (existing colors/fonts), tech stack detection, content/copy from Ghostwriter artifacts
- `brief.json` schema (exact JSON from spec Section 1):
  ```json
  {
    "name": "string",
    "tagline": "string | null",
    "domain": "string",
    "description": "string",
    "techStack": ["string[]"],
    "values": ["string[] (3-5)"],
    "audience": { "primary": "string", "secondary": "string | null" },
    "personality": { "traits": ["string[] (3-5)"], "tone": "string", "archetype": "string" },
    "existingAssets": { "colors": ["string[] HEX"], "fonts": ["string[]"], "hasLogo": "boolean" },
    "competitors": ["string[]"]
  }
  ```
- Inference heuristics: how to derive `values`, `personality.traits`, `personality.archetype` from codebase signals
- **User gate prompt:** Present brief as formatted table, ask user to review/edit before proceeding
- Save to `.seurat/brand/brief.json`
- If `--brief` flag: STOP here

- [ ] **Step 3: Write Phase 2 (Brand Identity Generation) section**

Content must cover:

**2.1 Brand Identikit:**
- Brand personality profile (Brand-Bios model: describe personality as if the brand were a person)
- Archetypes selection (e.g., Creator, Explorer, Sage, Magician — pick primary + secondary)
- Brand Identity Ideals (Wheeler framework: differentiation, relevance, coherence, esteem, knowledge)
- Value proposition narrative (what we do → how we do it → why it matters)
- Brand pillars (3 pillars, each: attribute name + description + user benefit)
- Brand voice traits (3-5 adjectives with do's/don'ts for each)

**2.2 Concept Development:**
- Generate 2-3 concept directions
- Each concept: theme/metaphor name, rationale (why this metaphor fits), moodboard description (colors, textures, visual references), shape psychology analysis (Bertin's 7 graphic variables)
- **User gate prompt:** Present concepts as numbered options, ask user to select one (or request modifications)

**2.3 Logo & Logotype** → delegate to `references/logo-design.md`
- Note: "Read references/logo-design.md for SVG generation patterns, shape psychology, and construction methods"

**2.4 Variations** → delegate to `references/logo-design.md`
- Note: "Read references/logo-design.md Section 4 for variation rules"

- Save full identity data to `.seurat/brand/identity.json`
- If `--logo` flag started here: read existing `brief.json`, skip Phase 1

- [ ] **Step 4: Write Phase 3 (Brand Guidelines) section**

- Delegate structure to `references/brand-guidelines.md`
- Note: "Read references/brand-guidelines.md for complete guidelines structure and content standards"
- Guidelines PDF generation: invoke Scribe with reportlab
- Output: `.seurat/brand/guidelines/brand-guidelines.pdf`

- [ ] **Step 5: Write Phase 4 (Proposal Presentation) section**

- Slide structure (18 slides from spec Section 4)
- Self-referential design rule: the PDF itself uses the brand's primary color, secondary color, and selected typography
- PDF generation: invoke Scribe with reportlab
- Output: `.seurat/brand/proposal/brand-proposal.pdf`
- If `--pdf` flag started here: read existing `identity.json`, skip Phases 1-2

- [ ] **Step 6: Write Phase 5 (Token Handoff) section**

- `tokens.json` schema (from spec Section 5.3):
  ```json
  {
    "colors": {
      "primary": { "hex": "#...", "rgb": "...", "cmyk": "...", "pantone": "..." },
      "secondary": { "hex": "#..." },
      "extended": [{ "name": "...", "hex": "#..." }]
    },
    "typography": {
      "primary": { "family": "...", "weights": [], "usage": "headings" },
      "secondary": { "family": "...", "weights": [], "usage": "body" }
    },
    "spacing": { "base": "...", "scale": "..." }
  }
  ```
- Save to `.seurat/brand/tokens.json`
- Integration: if `.seurat/tokens.css` exists, also update it with brand colors/fonts
- If `.seurat/tokens.css` doesn't exist, note that `/seurat setup` will read `tokens.json`

- [ ] **Step 7: Write Integration Instructions section**

- How to invoke Scribe for PDF: workflow, what data to pass, expected output
- How to invoke Ghostwriter for brand voice: when to delegate (messaging narrative, taglines, tone spectrum examples)
- How to invoke Emmet for validation: SVG validation, token consistency checks
- Cross-reference with existing Seurat tokens (`.seurat/tokens.css` ↔ `.seurat/brand/tokens.json`)

- [ ] **Step 8: Write Output Structure section**

- Complete directory tree from spec Section 5.2
- File descriptions and format requirements
- `.gitignore` rules

- [ ] **Step 9: Review completeness against spec**

Verify every section of the spec (1-8) is covered:
- [ ] Section 1: Codebase Analysis → Phase 1
- [ ] Section 2: Brand Identity Generation → Phase 2
- [ ] Section 3: Brand Guidelines → Phase 3 (delegated to brand-guidelines.md)
- [ ] Section 4: Proposal Presentation → Phase 4
- [ ] Section 5: Technical Architecture → Phases 0, 5, Output Structure
- [ ] Section 6: Reference Material Synthesis → Embedded in Phase 2 and logo-design.md
- [ ] Section 8: Success Criteria → Validation checklist at end

- [ ] **Step 10: Commit**

```bash
git add .claude/skills/seurat/references/brandidentity.md
git commit -m "feat(seurat): add brandidentity main workflow reference"
```

---

### Task 3: Create `references/logo-design.md` — Logo theory & SVG patterns

**Files:**
- Create: `.claude/skills/seurat/references/logo-design.md`

This file encodes logo design theory and SVG generation patterns. It's read during Phase 2.3-2.4 of the brandidentity workflow.

- [ ] **Step 1: Write Section 1 (Logo Theory & Classification)**

Content from spec Section 6 (academic foundations):
- Logo types (Çelikkol): logotype, sans serif, single letter, multiple letter, unconventional
- Henderson & Cote framework (Borgenstål & Wehlén): logo objectives (correct recognition, false recognition, affect, familiar meaning), design guidelines (natural, harmony, elaborate, parallel, repetition, proportion)
- Dynamic logo taxonomy (Workshop 3): responsive, generative, data-driven, container, modular, wallpaper, message-based, personalised

- [ ] **Step 2: Write Section 2 (Shape Psychology & Graphic Variables)**

Content from spec Section 6 (Workshop 3 / OnCreate):
- Bertin's 7 graphic variables: position, size, value, texture, color, orientation, shape
- Shape psychology: circles (unity, community), squares (stability, trust), triangles (energy, direction), organic (natural, human)
- Color psychology in logos (Çelikkol): red (energy, passion), blue (trust, stability), green (growth, nature), etc.
- How to select shapes based on brand personality traits from `brief.json`

- [ ] **Step 3: Write Section 3 (SVG Generation Patterns)**

Concrete SVG code patterns for geometric/abstract logos:
- **Initials-based construction:** Extract initials from brand name → geometric letterform construction → stylization (like TerraViva T+V → flower/arrow)
- **Grid construction:** Define a base grid (e.g., 8x8, 12x12) → plot key points → connect with paths → SVG output
- **Geometric primitives:** Circle combinations, polygon overlaps, line intersections
- **Symbol fusion:** Combine two concepts into one mark (like Umbrahands infinity + star)
- SVG best practices: viewBox, no hardcoded dimensions, clean paths, proper grouping, accessible `<title>` and `<desc>`
- Positive/negative version generation: swap fill colors, ensure readability on both light and dark

Include 2-3 complete SVG code examples showing different construction approaches.

- [ ] **Step 4: Write Section 4 (Variations & Usage Rules)**

From spec Section 2.4:
- **Layouts:** horizontal (logo left + text right), vertical (logo top + text bottom), icon-only (mark without text)
- **Versions:** positive (dark on light), negative (light on dark)
- **Minimum size:** Define minimum px/mm for each layout
- **Clear space:** Exclusion zone = height of a specific letter (e.g., "x-height" of logotype)
- **Do's and don'ts:** Specific rules (don't stretch, don't rotate, don't change colors, don't add effects)
- SVG generation for each variation: how to derive horizontal/vertical/icon from the primary mark

- [ ] **Step 5: Write Section 5 (Logotype & Typography)**

- Font selection criteria based on brand personality
- Customization spec: tracking adjustments, weight selection, optical size considerations
- When to specify custom lettering (vs. using an existing font)
- SVG logotype generation: text-to-path for font independence
- Pairing rules: mark + logotype visual harmony

- [ ] **Step 6: Write Section 6 (Figurative/Organic Spec)**

For directions that can't be generated as SVG code:
- Written specification format: concept description, shape references, style parameters, color guidance
- What to include so an external designer can execute
- Example spec structure

- [ ] **Step 7: Write Section 7 (Construction Documentation)**

- How to generate `construction.svg`: the grid overlay showing geometric rationale
- Grid lines, circles, golden ratio indicators
- Annotation style for the construction diagram

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/seurat/references/logo-design.md
git commit -m "feat(seurat): add logo design theory and SVG patterns reference"
```

---

### Task 4: Create `references/brand-guidelines.md` — Guidelines structure

**Files:**
- Create: `.claude/skills/seurat/references/brand-guidelines.md`

This file defines the structure and content standards for both the brand guidelines PDF and the proposal presentation PDF. It's read during Phases 3-4 of the brandidentity workflow.

- [ ] **Step 1: Write Section 1 (Brand Guidelines Structure)**

Complete structure from spec Section 3, with content requirements for each subsection:

**3.1 Strategy:**
- Audiences: internal → external spectrum (employees, partners, customers, public)
- Positioning: what (product/service), how (approach/method), why (purpose/mission)
- Messaging narrative: brand story arc + messaging map (key messages by audience)
- Brand platform: mission, vision, values, promise, personality summary

**3.2 Visual Identity:**
- Logo usage rules (from logo-design.md cross-reference), trademark notes (™ vs ®)
- Color system: primary palette (1-2 colors with HEX, RGB, CMYK, Pantone), secondary palette (2-3 colors), extended palette (5-8 colors), color ratios (e.g., 60/30/10), print vs digital code differences
- Typography: primary font (headings) + secondary font (body), hierarchy rules (H1-H6, body, caption sizes/weights), web/print pairings, fallback stacks
- Design patterns: line work, textures, detail lines, structural elements, pattern usage rules
- Photography/imagery: style adjectives, do's/don'ts, cropping guidelines, filter/treatment
- Data visualization: chart palette (subset of brand colors), axis/label styling, accessibility requirements
- Illustrations: style description, complexity level, when to use vs photos

**3.3 Brand Voice:**
- Writing tips: sentence length, jargon rules, active/passive voice
- Tone spectrum: formal ↔ casual, serious ↔ playful, technical ↔ accessible (with slider visualization)
- Do's and don'ts with concrete examples (good copy vs bad copy)

**3.4 Digital Brand:**
- Web guidelines: responsive behavior, animation rules, loading states
- Accessibility: WCAG AA requirements, color contrast, keyboard nav, screen reader
- Social media: avatar specs (size, crop), cover photo specs, post template descriptions

**3.5 Brand Architecture:**
- Master brand definition
- Extension types: primary, secondary, sub-brands, endorsed brands
- Lockup rules: how sub-brands combine with master brand
- When this section applies vs when to skip (single-product projects)

**3.6 Resources:**
- Business card spec: dimensions, layout, information hierarchy
- Letterhead spec: header, footer, margins
- Email signature: format, font, links, logo placement
- Presentation template: slide master layout, title slide, content slide, section divider
- Creative brief template: sections to include when briefing external partners

- [ ] **Step 2: Write Section 2 (Guidelines PDF Generation)**

Instructions for generating the guidelines PDF via Scribe/reportlab:
- Page layout: A4, margins, header/footer with brand mark
- Typography in the PDF itself: use brand primary font for headings, secondary for body (or fallback to Helvetica/Times if custom fonts unavailable in reportlab)
- Color swatches: how to render color blocks with codes
- Section separators: full-bleed color pages with section titles
- Table of contents generation
- Page numbering

- [ ] **Step 3: Write Section 3 (Proposal Presentation Structure)**

The 18-slide structure from spec Section 4, with detailed content specs per slide:

| # | Slide | Content spec | Visual spec |
|---|-------|-------------|-------------|
| 1 | Cover | Brand name, "Brand Identity Proposal", date, creator | Brand primary color background, logotype centered |
| 2 | Brand Identikit | Personality radar (text-based), archetypes, values list | Clean layout, brand secondary color accents |
| 3 | Positioning | What/how/why framework, value proposition | Three-column or stacked layout |
| 4-5 | Concept & Moodboard | Selected concept theme, rationale, visual references described | Large imagery area, minimal text |
| 6-7 | Pictogram Development | Construction grid SVG, geometric rationale, evolution from initials to final mark | Technical diagram style, grid overlays |
| 8 | Logo + Logotype | Final mark with logotype, clear space diagram | Centered, generous whitespace |
| 9 | Variations | All layouts (horizontal, vertical, icon), all versions (positive, negative) | Grid layout, equal sizing |
| 10 | Typography | Primary + secondary fonts with specimens, hierarchy table | Font samples at various sizes/weights |
| 11 | Color Palette | All palettes with swatches, codes (HEX, RGB, CMYK), color ratios | Swatch blocks with labels |
| 12 | Brand Voice | Personality traits, tone slider, do's/don'ts | Text-focused, clean typography |
| 13 | Brand Architecture | Master brand, extensions diagram | Hierarchy diagram or tree |
| 14-16 | Applications & Mockups | Business card, letterhead, social media, website viewport, signage | Mock-up style presentations |
| 17 | Do's and Don'ts | Logo usage rules with check/cross indicators | Two-column: correct vs incorrect |
| 18 | Next Steps | Figurative direction spec summary, recommended next actions | Minimal, action-oriented |

- [ ] **Step 4: Write Section 4 (Proposal PDF Generation)**

Instructions for generating the proposal PDF via Scribe/reportlab:
- Self-referential design: the PDF uses the brand's own primary color, secondary color, and typography
- Slide-like pages: each "slide" is a full A4 page (landscape or portrait based on content)
- How to embed SVG logos in reportlab (convert to drawing or use svglib)
- Color swatch rendering
- Mock-up generation approach: simplified representations using reportlab drawing primitives
- Fallback strategies if fonts unavailable

- [ ] **Step 5: Write Section 5 (Content Standards & Quality Gates)**

Quality rules for generated content:
- All text in English (per spec decision)
- Color codes must include all 4 formats (HEX, RGB, CMYK, Pantone) for primary/secondary; HEX + RGB for extended
- Typography specs must include: family name, available weights, recommended sizes, line-height, letter-spacing
- Every section must have concrete examples, not just rules
- PDF must open without errors in standard PDF readers
- SVG logos must be valid (parseable, renderable, with proper viewBox)

- [ ] **Step 6: Write Section 6 (Reference Material Index)**

Quick-reference pointers to knowledge sources synthesized from spec Section 6:
- Professional proposals: Umbrahands/Cariani (identikit + radar), TerraViva (initials + color ratios), Pederiva Studio (grid construction), Dowitcher/NoHo (agency format)
- Academic: Brand-Bios model, Wheeler's Brand Identity Ideals, Bertin's 7 variables, Henderson & Cote framework, Cash et al. design methods
- Complete example: Virginia Tech 2019 guidelines (94-page model)
- Logo brief: Simpsons Creative questionnaire

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/seurat/references/brand-guidelines.md
git commit -m "feat(seurat): add brand guidelines structure and content standards reference"
```

---

### Task 5: Update registry and validate integration

**Files:**
- Modify: `.claude/docs/registry.md`

- [ ] **Step 1: Update registry with new reference files**

Add to the Skills table or Notes section:
- `references/brandidentity.md` — Brand identity workflow, prompts, schemas
- `references/logo-design.md` — Logo theory, SVG patterns, shape psychology
- `references/brand-guidelines.md` — Guidelines structure, content standards

- [ ] **Step 2: Validate cross-references**

Check that all file paths referenced between the files are correct:
- SKILL.md → `references/brandidentity.md` ✓
- SKILL.md → `references/logo-design.md` ✓
- SKILL.md → `references/brand-guidelines.md` ✓
- brandidentity.md → `references/logo-design.md` (Phase 2.3-2.4)
- brandidentity.md → `references/brand-guidelines.md` (Phase 3)
- logo-design.md is self-contained (no outbound references needed)
- brand-guidelines.md → cross-references logo-design.md for logo usage section

- [ ] **Step 3: Validate JSON schemas**

Confirm all three JSON schemas are consistent:
- `brief.json` schema in brandidentity.md matches spec Section 1
- `identity.json` structure covers all Phase 2 outputs
- `tokens.json` schema in brandidentity.md matches spec Section 5.3

- [ ] **Step 4: Commit and update spec status**

```bash
git add .claude/docs/registry.md
git commit -m "docs: update registry with seurat brandidentity reference files"
```

Update spec status from "Approved" to "Implemented" in the spec file.

```bash
git add docs/superpowers/specs/2026-03-17-seurat-brandidentity-design.md
git commit -m "docs: mark seurat brandidentity spec as implemented"
```

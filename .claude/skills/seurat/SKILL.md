---
name: seurat
description: UI design system generation, wireframing, and page layout. Creates distinctive, accessible interfaces with design tokens, page archetypes, and responsive layouts. Use when building interfaces, components, forms, dashboards, or any frontend work. Activates on mentions of UI, component, interface, design system, accessibility, WCAG, frontend styling, layout, wireframe.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, AskUserQuestion
---

# Seurat Skill

## Identity

You are a Design Engineer focused on producing distinctive, accessible, production-ready UI.

**Prime Directive:** Never generate generic UI. Every interface must be distinctive, accessible, and structurally sound.

Signs of "AI slop" to avoid:
- Purple/blue gradients with rounded cards
- Inter, Roboto, or system sans-serif fonts
- Generic spacing (random px values)
- Flat backgrounds without depth
- Missing focus states and accessibility

---

## Two Workflows

### New Project
```
/seurat setup       → generate style + create tokens.css + design-system.html
/seurat build [type]→ generate page in real project
```

### Existing Project
```
/seurat extract     → analyze code, extract real tokens → create tokens.css + design-system.html
(optional: manually edit tokens.css)
/seurat build [type]→ generate page consistent with existing design
```

### Brand Identity
```
/seurat brandidentity  → analyze codebase, generate brand identity + logo + guidelines + PDF
/seurat setup          → (inherits brand tokens automatically)
/seurat build [type]   → (uses brand palette/typography)
```

---

## Phases (for each page/component)

### Phase 1: RESEARCH
Before building, understand context:
- What does the project already have? (check tokens.css)
- What archetype fits? (see wireframes/)
- What variant is appropriate?

### Phase 2: VALIDATE
Before writing code:
- [ ] Design direction established (tokens.css exists)
- [ ] Color contrast >= 4.5:1 for all text
- [ ] Font is distinctive (not Inter/Roboto/Arial)
- [ ] Spacing follows grid (4px or 8px)
- [ ] Touch targets >= 44x44px

### Phase 3: BUILD
Generate code using:
1. `tokens.css` tokens (spacing, colors, typography)
2. Wireframe from `wireframes/[archetype].md`
3. Template from `templates/archetypes/[archetype].html`
4. Semantic HTML, CSS custom properties, progressive enhancement

### Phase 4: REFINE
Apply visual polish:
- [ ] Typography: weight contrast (100 vs 800)
- [ ] Backgrounds: layered, never flat
- [ ] Shadows: subtle depth
- [ ] Motion: staggered reveals, eased transitions
- [ ] Details: micro-interactions, hover states

### Phase 4.5: THE MANDATE
Pre-delivery qualitative gate (see full version in [validation.md](validation.md)):
1. **Swap Test** — Would it look equally "right" with any font/layout? If yes → generic
2. **Squint Test** — Blur mentally: are 3 hierarchy levels distinguishable?
3. **Signature Test** — Name 3 specific design choices a generic wouldn't make
4. **Token Test** — Do CSS property names reflect the domain?

If any test fails: return to Phase 3 and rebuild the generic part (don't patch).

---

## Primary Commands

### `/seurat setup`

Generate a design system from scratch. Unifies the old generate + establish into one flow.

**Process:**
0. **Intent Exploration** (skip in Chaos mode, or if user provides type/industry/target directly, or if `.seurat/tokens.css` exists):
   - **Chi e cosa?** — Chi usa il prodotto e cosa deve raggiungere? (una frase)
   - **Mondo visivo?** — 3+ associazioni visive (es: "Bloomberg terminal, fogli Excel, grafici scuri")
   - **Cosa NON deve sembrare?** — 2+ anti-riferimenti
   - Risposte: Q1 guida selezione profilo, Q2 salvato come commento in tokens.css (`/* Visual world: ... */`), Q3 aggiunto come anti-pattern locale per la sessione
1. Ask for: project type, industry, target audience, generation mode (safe/chaos/hybrid)
2. Load profiles from [matrices/](matrices/)
3. Calculate combined weights via [generation/combination-logic.md](generation/combination-logic.md)
4. Select style from [styles/base/](styles/base/) + modifiers from [styles/modifiers/](styles/modifiers/)
5. Check against [generation/anti-patterns.md](generation/anti-patterns.md)
6. (Hybrid only) Apply Factor X from [factor-x/](factor-x/)
7. Select wireframe variants per archetype via [wireframes/variant-selection.md](wireframes/variant-selection.md)
8. Generate `.seurat/tokens.css` with all CSS custom properties (include Intent comments at top)
9. Generate `.seurat/design-system.html` — self-contained preview page showing all elements

**Modes:**

| Mode | Risk | Output |
|------|------|--------|
| `safe` | Low | Predictable, uses matrices |
| `chaos` | High | Random style combination |
| `hybrid` | Medium | Matrices + Factor X twist |

**Output:** `.seurat/tokens.css` + `.seurat/design-system.html`

See [generation/modes.md](generation/modes.md) for full documentation.

---

### `/seurat extract`

Extract design system from an existing project's code.

**Process:**
1. **Scan CSS/SCSS files** — find custom properties, SCSS variables, recurring hardcoded values
2. **Identify color patterns** — group colors, identify primary/secondary/accent
3. **Extract typography** — font-family, font-size scale, font-weight values in use
4. **Extract spacing** — recurring padding/margin/gap values, identify base unit
5. **Extract shadows, radius, transitions** — recurring patterns
6. **Generate `.seurat/tokens.css`** with extracted tokens as CSS custom properties
7. **Generate `.seurat/design-system.html`** — visual preview of all extracted tokens and elements
8. **Report inconsistencies** — "4 different fonts, 23 different colors, spacing not on grid"

**Output:**
- `.seurat/tokens.css` — design tokens (single source of truth)
- `.seurat/design-system.html` — living documentation, open in browser to preview
- `.seurat/extraction-report.md` — inconsistencies found

User can edit tokens.css to refine before proceeding with build.

---

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

---

### `/seurat preview`

Open the design system preview in a browser.

**Prerequisites:** `.seurat/tokens.css` and `.seurat/design-system.html` must exist (created by `/seurat setup` or `/seurat extract`)

**Usage:**
```
/seurat preview
```
Then: `open .seurat/design-system.html` or `python -m http.server 8080 -d .seurat`

The design-system.html is a self-contained page that imports tokens.css and displays all elements: color palette, typography scale, spacing, radius, buttons, cards, form elements, states, and motion examples.

---

### `/seurat build [type]`

Generate a complete page in the real project.

**Types:** `entry`, `discovery`, `detail`, `action`, `management`, `system`

**Process:**
1. Read `.seurat/tokens.css` for tokens
2. Read `wireframes/[type].md` for structure and variant options
3. Ask user which variant to use (if multiple)
4. Use `templates/archetypes/[type].html` as structural base
5. Apply tokens from tokens.css
6. Replace SLOT placeholders with project-specific content
7. Generate semantic HTML with responsive CSS
8. Validate accessibility

**Output:** Complete HTML page file in the project

**Wireframe references:**
- [wireframes/entry.md](wireframes/entry.md) — Landing pages
- [wireframes/discovery.md](wireframes/discovery.md) — Search/listing pages
- [wireframes/detail.md](wireframes/detail.md) — Item detail pages
- [wireframes/action.md](wireframes/action.md) — Form/wizard pages
- [wireframes/management.md](wireframes/management.md) — Admin/table pages
- [wireframes/system.md](wireframes/system.md) — Error/status pages

**Layout primitives:** [wireframes/primitives.md](wireframes/primitives.md)

---

### `/seurat apply`

Load existing tokens.css and enforce during code generation:
1. Read `.seurat/tokens.css`
2. Validate all generated code against tokens
3. Report violations immediately

---

## Secondary Commands

### `/seurat audit`
Full UX/UI audit of the project. Two modes:

- `/seurat audit` — audit all pages
- `/seurat audit [file]` — audit a single file (reduced scope)

**Prerequisites:** `/emmet map` (page/route map) required. `.seurat/tokens.css` optional. Dev server needed for screenshots.

**Process:**
1. **Fase 0: Prerequisites** — Check emmet map, tokens.css, dev server
2. **Fase 1: Data collection** — Source code scan, Playwright screenshots (3 viewports), automated accessibility audit
3. **Fase 2: Analysis** — 13 areas from Visual Design to Performance. For the full analysis framework, read `references/audit-methodology.md`
4. **Fase 3: Output** — Report in `.seurat/audit-report.md` with severity-ordered findings and prioritized recommendations

**Single-file audit** (`/seurat audit [file]`) — reduced scope: areas 1-7 + 9-11 if applicable.

### `/seurat research [topic]`
Research modern implementations before building:
1. Research how [topic] is implemented in top apps
2. Compile patterns, examples, edge cases
3. Return research document

### `/seurat polish`
Apply refinement to existing code:
1. Read target file
2. Identify generic elements
3. Apply distinctive refinements
4. Verify accessibility maintained

### `/seurat save-pattern [name]`
Save pattern to reusable library:
1. Extract component/pattern
2. Generalize tokens
3. Store in `.seurat/patterns/[name].md`

### `/seurat migrate`
Systematic migration to design system tokens. Two modes:

- `/seurat migrate` — full project migration
- `/seurat migrate [pattern]` — migrate a specific pattern

**Full project migration:**
1. Check prerequisites (`.seurat/tokens.css` must exist)
2. Create prioritized plan:
   - Foundation — Typography, colors, spacing tokens
   - Global — Nav, footer, buttons
   - Critical paths — Entry, Action pages
   - Secondary — Discovery, Detail pages
   - Admin/internal — Management pages
3. Guide file-by-file migration with tracker
4. Status check included (shows progress automatically)

**Pattern migration:**
1. Find all instances with grep
2. Create migration tracker in `.seurat/migrations/[pattern].md`
3. Track progress as files are updated

### `/seurat reference [pattern]`
Consult visual references before generating UI:
1. Read [taxonomy/elements.md](taxonomy/elements.md) or [taxonomy/pages.md](taxonomy/pages.md)
2. Find matching section
3. Display reference screenshots with context

---

## Project Analysis Commands

### `/seurat map`
Create structural UI map of the project (archetype classification).

**Prerequisite:** `/emmet map` must exist. If missing, propose: "Serve la mappa delle pagine. Eseguo `/emmet map`?"

**Process:**
1. Read `/emmet map` output for page/route list
2. Classify each page by archetype (Entry, Discovery, Detail, Action, Management, System)
3. Inventory UI elements per page
4. Map routes → archetypes

**Output:** `.seurat/project-map.md`

---

## Wireframe System

Layout primitives and archetype wireframes are in `wireframes/`. Each archetype file includes variant options. See `wireframes/primitives.md` for reusable layout blocks.

---

## Design System Memory

### File: `.seurat/tokens.css`
Single source of truth for all design tokens (CSS custom properties). Created by `/seurat setup` or `/seurat extract`.

### File: `.seurat/design-system.html`
Living documentation page. Imports tokens.css and shows all elements visually. Open in browser to preview.

### File: `.seurat/project-map.md`
Structural UI map of codebase (created by `/seurat map`).

### File: `.seurat/audit-report.md`
Full UX/UI audit report (created by `/seurat audit`).

### Directory: `.seurat/migrations/`
Active migration trackers.

### Directory: `.seurat/patterns/`
Extracted reusable patterns.

### Directory: `.seurat/brand/`
Brand identity system: brief.json, identity.json, tokens.json, logo SVGs, guidelines PDF, proposal PDF. Created by `/seurat brandidentity`.

---

## Integration with Baptist (CRO)

When Baptist identifies UI/UX problems impacting conversions, it delegates to Seurat:

| Baptist identifies... | Seurat implements... |
|---|---|
| Form with too many fields / confusing layout | Redesign form: single column, field reduction, multi-step |
| CTA low visibility / low contrast | Redesign CTA: sizing, contrast, whitespace, positioning |
| Intrusive / mobile-unfriendly popup | Redesign popup: sizing, close button, mobile slide-up |
| Broken visual hierarchy | Layout restructure with clear hierarchy |
| Ineffective paywall screen | Redesign paywall: value demonstration, plan comparison |
| Degraded mobile experience | Mobile-specific layout optimization |

---

## Enforcement Rules

| Rule | Violation | Action |
|------|-----------|--------|
| Generic font | Inter, Roboto, Arial, sans-serif | BLOCK |
| Low contrast | < 4.5:1 text contrast | BLOCK |
| Off-grid spacing | Not divisible by base unit | WARN |
| Small targets | < 44px touch target | BLOCK |
| Missing focus | No :focus-visible styles | BLOCK |

---

## Resources

Detailed documentation is in subdirectories: `accessibility.md`, `typography.md`, `validation.md`, `references.md`, `taxonomy/`, `wireframes/`, `generation/`, `styles/`, `matrices/`, `factor-x/`, `templates/`.

---

## Visual QA

After generating UI, use `/emmet test --functions` for visual regression testing, or capture screenshots manually with Playwright at 375px, 768px, and 1280px viewports.

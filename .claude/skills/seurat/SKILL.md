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

---

## Primary Commands

### `/seurat setup`

Generate a design system from scratch. Unifies the old generate + establish into one flow.

**Process:**
1. Ask for: project type, industry, target audience, generation mode (safe/chaos/hybrid)
2. Load profiles from [matrices/](matrices/)
3. Calculate combined weights via [generation/combination-logic.md](generation/combination-logic.md)
4. Select style from [styles/base/](styles/base/) + modifiers from [styles/modifiers/](styles/modifiers/)
5. Check against [generation/anti-patterns.md](generation/anti-patterns.md)
6. (Hybrid only) Apply Factor X from [factor-x/](factor-x/)
7. Select wireframe variants per archetype via [wireframes/variant-selection.md](wireframes/variant-selection.md)
8. Generate `.seurat/tokens.css` with all CSS custom properties
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

### `/seurat audit [file]`
Validation and accessibility audit:
1. Pre-generation checks (see [validation.md](validation.md))
2. Accessibility audit (see [accessibility.md](accessibility.md))
3. Design consistency check
4. Returns structured report

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

### `/seurat compliance`
Audit design system compliance across codebase:
1. Scan all component files for pattern usage
2. Create/update `.seurat/compliance.md`
3. Return summary report

### `/seurat migrate [pattern]`
Systematically migrate a pattern across files:
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

### `/seurat analyze-project`
Analyze existing codebase and create UI map:
1. Scan routes/pages
2. Classify archetypes (Entry, Discovery, Detail, Action, Management, System)
3. Inventory UI elements per page
4. Check token usage vs hardcoded values
5. Map routes to archetypes (includes sitemap mapping)

**Output:** `.seurat/project-map.md`

### `/seurat migrate-project`
Systematic migration workflow:
1. Check prerequisites (tokens.css + project-map.md)
2. Create prioritized migration plan
3. Guide file-by-file migration

**Priority order:**
1. Foundation — Typography, colors, spacing tokens
2. Global components — Nav, footer, buttons
3. Critical paths — Entry, Action pages
4. Secondary pages — Discovery, Detail
5. Admin/internal — Management pages

### `/seurat migration-status`
Quick check on ongoing migration progress.

---

## Wireframe System

The wireframe layer bridges "what blocks are needed" with "how to position them in CSS".

### Structure
```
wireframes/
├── README.md           # How the system works
├── primitives.md       # Reusable layout blocks (STACK, GRID, SPLIT, SIDEBAR, CENTERED, HERO, CONTAINER)
├── entry.md            # Landing page wireframes + variants
├── discovery.md        # Search/listing wireframes + variants
├── detail.md           # Item detail wireframes + variants
├── action.md           # Form/wizard wireframes + variants
├── management.md       # Admin/table wireframes + variants
├── system.md           # Error/status wireframes + variants
└── variant-selection.md # Weight-to-variant mapping algorithm
```

### Layout Primitives (from primitives.md)

| Primitive | CSS Pattern | Use |
|-----------|------------|-----|
| STACK | `flex-direction: column; gap` | Sequential content |
| GRID | `grid-template-columns: repeat(N, 1fr)` | Multi-column layouts |
| SPLIT | `grid-template-columns: 1fr 1fr` | Two-column equal |
| SIDEBAR | `grid-template-columns: 280px 1fr` | Main + sidebar |
| CENTERED | `max-width; margin-inline: auto` | Centered content |
| HERO | `min-height: Nvh; place-items: center` | Full-viewport impact |
| CONTAINER | `max-width; margin-inline: auto; padding-inline` | Width constraint |

### Breakpoint Convention

| Name | Range | Behavior |
|------|-------|----------|
| Mobile | < 768px | Single column, full-width buttons |
| Tablet | 768px - 1024px | 2 columns where possible |
| Desktop | > 1024px | Full layout |

---

## Design System Memory

### File: `.seurat/tokens.css`
Single source of truth for all design tokens (CSS custom properties). Created by `/seurat setup` or `/seurat extract`.

### File: `.seurat/design-system.html`
Living documentation page. Imports tokens.css and shows all elements visually. Open in browser to preview.

### File: `.seurat/compliance.md`
Tracks which files follow the design system.

### File: `.seurat/project-map.md`
Full UI analysis of existing codebase.

### Directory: `.seurat/migrations/`
Active migration trackers.

### Directory: `.seurat/patterns/`
Extracted reusable patterns.

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

## Detailed Resources

### Core Documentation
- **Accessibility Checklist**: [accessibility.md](accessibility.md)
- **Typography System**: [typography.md](typography.md)
- **Validation Rules**: [validation.md](validation.md)
- **Visual References**: [references.md](references.md)
- **Page Taxonomy**: [taxonomy/pages.md](taxonomy/pages.md)
- **Element Taxonomy**: [taxonomy/elements.md](taxonomy/elements.md)

### Wireframe System
- **How it works**: [wireframes/README.md](wireframes/README.md)
- **Layout Primitives**: [wireframes/primitives.md](wireframes/primitives.md)
- **Layout System**: [wireframes/layout-system.md](wireframes/layout-system.md) — Grid systems and responsive patterns
- **Component Library**: [wireframes/components.md](wireframes/components.md) — Reusable component patterns
- **Motion System**: [wireframes/motion.md](wireframes/motion.md) — Animation and transition patterns
- **Visual Composition**: [wireframes/visual-composition.md](wireframes/visual-composition.md) — Layout rules and principles
- **Entry Wireframe**: [wireframes/entry.md](wireframes/entry.md)
- **Discovery Wireframe**: [wireframes/discovery.md](wireframes/discovery.md)
- **Detail Wireframe**: [wireframes/detail.md](wireframes/detail.md)
- **Action Wireframe**: [wireframes/action.md](wireframes/action.md)
- **Management Wireframe**: [wireframes/management.md](wireframes/management.md)
- **System Wireframe**: [wireframes/system.md](wireframes/system.md)
- **Variant Selection**: [wireframes/variant-selection.md](wireframes/variant-selection.md)

### Generative System
- **Generation Modes**: [generation/modes.md](generation/modes.md)
- **Combination Logic**: [generation/combination-logic.md](generation/combination-logic.md)
- **Anti-Patterns**: [generation/anti-patterns.md](generation/anti-patterns.md)
- **Style Index**: [styles/index.md](styles/index.md)
- **Style Modifiers**: [styles/modifiers/](styles/modifiers/)

#### 11 Base Styles
| Style | File | Characteristics |
|-------|------|-----------------|
| Flat | [flat.md](styles/base/flat.md) | Clean, minimal, solid colors |
| Material | [material.md](styles/base/material.md) | Google's design language, elevation |
| Neumorphism | [neumorphism.md](styles/base/neumorphism.md) | Soft UI, inner/outer shadows |
| Glassmorphism | [glassmorphism.md](styles/base/glassmorphism.md) | Frosted glass, transparency |
| Brutalism | [brutalism.md](styles/base/brutalism.md) | Raw, bold, intentionally unpolished |
| Claymorphism | [claymorphism.md](styles/base/claymorphism.md) | 3D clay-like, soft shadows |
| Skeuomorphism | [skeuomorphism.md](styles/base/skeuomorphism.md) | Real-world textures, realism |
| Y2K | [y2k.md](styles/base/y2k.md) | Retro-futuristic, chrome, gradients |
| Gen-Z | [gen-z.md](styles/base/gen-z.md) | Bold, maximalist, gradient-heavy |
| Bento | [bento.md](styles/base/bento.md) | Grid-based, modular containers |
| Spatial | [spatial.md](styles/base/spatial.md) | 3D depth, perspective, layers |
- **Type Profiles**: [matrices/by-type.md](matrices/by-type.md)
- **Industry Profiles**: [matrices/by-industry.md](matrices/by-industry.md)
- **Target Profiles**: [matrices/by-target/](matrices/by-target/)
- **Factor X**: [factor-x/](factor-x/)

### Templates
- **Design System Page**: [templates/design-system.html](templates/design-system.html)
- **Archetype Templates**: [templates/archetypes/](templates/archetypes/)
- **Project Map Template**: [templates/project-map-template.md](templates/project-map-template.md)
- **Preview Spec**: [templates/preview-spec.md](templates/preview-spec.md) — Specification for design system preview
- **Test Pages**: [templates/test-pages.md](templates/test-pages.md) — Test page templates

#### Preview System (`templates/preview/`)
Self-contained preview system for design tokens:
| File | Purpose |
|------|---------|
| `index.html` | Main preview page structure |
| `tokens.css` | Token variables (generated) |
| `preview.css` | Preview-specific styles |
| `preview.js` | Interactive preview functionality |

# Seurat — Knowledge Base

Domain knowledge and reference material for the Seurat design skill. This file is for human readers — Claude does not load it during skill execution.

---

## Wireframe System Structure

The wireframe layer bridges "what blocks are needed" with "how to position them in CSS".

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

Layout primitives are defined in `wireframes/primitives.md`.

Breakpoint conventions are defined in `wireframes/primitives.md`.

---

## The Mandate — Design Quality Gate

The Mandate is a pre-delivery qualitative check that prevents generic UI from reaching users. It runs after Phase 4 (REFINE) and before Visual QA.

### The 4 Tests

1. **SWAP TEST** — Change typeface and layout mentally. If output looks equally "right" with any combination, it's generic. Typeface and layout must be *chosen*, not interchangeable.

2. **SQUINT TEST** — Blur your vision mentally. If visual hierarchy disappears, structure is missing. With blurred vision, 3 hierarchy levels must be distinguishable.

3. **SIGNATURE TEST** — Name 3 specific elements that make this output recognizable. If you can't, it's generic. Example: "mono font for data, border-left accent on cards, asymmetric header spacing."

4. **TOKEN TEST** — Read CSS custom property names. If they sound generic (`--color-primary`, `--spacing-md`), they don't belong to the product. Names should reflect the domain. Example: `--color-chart-positive`, `--spacing-data-cell`, `--radius-metric-card`.

**If a test fails:** return to Phase 3 (BUILD) and rebuild the generic part. Don't patch — reconstruct the decision.

See `validation.md` for full version with examples.

---

## Resources Directory Guide

For detailed documentation, explore the subdirectories:
- `accessibility.md`, `typography.md`, `validation.md`, `references.md` — Core documentation
- `taxonomy/` — Page and element taxonomy
- `wireframes/` — Layout primitives, archetypes (entry, discovery, detail, action, management, system), variant selection, layout system, components, motion, visual composition
- `generation/` — Modes, combination logic, anti-patterns
- `styles/` — 11 base styles (flat, material, neumorphism, glassmorphism, brutalism, claymorphism, skeuomorphism, y2k, gen-z, bento, spatial) + modifiers
- `matrices/` — Type profiles, industry profiles, target profiles
- `factor-x/` — Factor X twist system
- `templates/` — Design system page, archetype templates, preview system, project map template, test pages

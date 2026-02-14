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

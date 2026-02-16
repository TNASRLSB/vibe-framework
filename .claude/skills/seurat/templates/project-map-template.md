# Project UI Map

**Project:** [Nome progetto]
**Last analyzed:** [YYYY-MM-DD]
**Design System:** [link a system.md se esiste]

---

## Overview

| Metric | Value |
|--------|-------|
| Total pages | [N] |
| Total components | [N] |
| Design system compliance | [X%] |
| Migration status | [Not started / In progress / Complete] |

---

## Pages → Archetypes

Mappa delle pagine del progetto ai 6 archetipi della tassonomia.

| Page | Route | Archetype | Sub-type | Status |
|------|-------|-----------|----------|--------|
| Homepage | `/` | Entry | Hero-centric | ✓ Compliant |
| Products | `/products` | Discovery | Sidebar + Grid | ⚠ Partial |
| Product Detail | `/products/:id` | Detail | Media + Info | ✗ Non-compliant |
| Checkout | `/checkout` | Action | Stepped wizard | ✗ Non-compliant |
| Admin Users | `/admin/users` | Management | Data table | ⚠ Partial |
| 404 | `/404` | System | Centered minimal | ✓ Compliant |

### Archetype Legend

| Archetype | Purpose | Reference |
|-----------|---------|-----------|
| Entry | Landing, value proposition | [pages.md#entry](/.claude/skills/seurat/taxonomy/pages.md) |
| Discovery | Browse, filter, search | [pages.md#discovery](/.claude/skills/seurat/taxonomy/pages.md) |
| Detail | Single item deep dive | [pages.md#detail](/.claude/skills/seurat/taxonomy/pages.md) |
| Action | Forms, edits, tasks | [pages.md#action](/.claude/skills/seurat/taxonomy/pages.md) |
| Management | Bulk operations, admin | [pages.md#management](/.claude/skills/seurat/taxonomy/pages.md) |
| System | Errors, confirmations | [pages.md#system](/.claude/skills/seurat/taxonomy/pages.md) |

---

## Pages → Elements

Quali elementi (dalla tassonomia) sono usati in ogni pagina.

| Page | Elements Used |
|------|---------------|
| Homepage | `nav-minimal`, `hero-centered`, `card-feature`, `footer-standard` |
| Products | `nav-minimal`, `filter-sidebar`, `card-product`, `pagination` |
| Product Detail | `nav-minimal`, `gallery-media`, `tabs-content`, `form-review` |
| Checkout | `nav-minimal`, `progress-steps`, `form-payment`, `summary-order` |
| Admin Users | `nav-admin`, `table-sortable`, `modal-confirmation`, `pagination` |

---

## Element Inventory

Tutti gli elementi UI usati nel progetto, mappati alla tassonomia.

| Element | Variant | Files Using It | Taxonomy Match | Compliant |
|---------|---------|----------------|----------------|-----------|
| nav | minimal | `Header.tsx`, all pages | ✓ Navigation/Minimal | ✓ |
| hero | centered | `HomePage.tsx` | ✓ Hero/Centered | ✓ |
| card | product | `ProductCard.tsx` | ✓ Cards/Product | ⚠ |
| card | feature | `FeatureCard.tsx` | ✓ Cards/Content | ✓ |
| button | primary | 15 files | ✓ Buttons/Primary | ✗ |
| form | login | `LoginForm.tsx` | ✓ Forms/Centered card | ⚠ |
| table | sortable | `UsersTable.tsx` | ✓ Tables/Sortable | ✓ |
| modal | confirmation | `ConfirmModal.tsx` | ✓ Modals/Confirmation | ✓ |

### Compliance Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Fully compliant with design system |
| ⚠ | Partially compliant (some violations) |
| ✗ | Non-compliant (needs migration) |

---

## Design System Token Usage

Verifica dell'uso dei token definiti in `system.md`.

### Colors

| Token | Defined | Used | Files with hardcoded values |
|-------|---------|------|----------------------------|
| `--color-primary` | ✓ | ✓ | - |
| `--color-secondary` | ✓ | ⚠ | `ProductCard.tsx` (#3b82f6) |
| `--color-background` | ✓ | ✓ | - |
| `--color-text` | ✓ | ✗ | 8 files with hardcoded colors |

### Spacing

| Token | Defined | Used | Files with hardcoded values |
|-------|---------|------|----------------------------|
| `--space-1` to `--space-8` | ✓ | ⚠ | Multiple files with px values |

### Typography

| Token | Defined | Used | Files with hardcoded values |
|-------|---------|------|----------------------------|
| `--font-display` | ✓ | ✗ | Most files use system fonts |
| `--font-body` | ✓ | ✗ | Most files use system fonts |
| `--text-*` scale | ✓ | ⚠ | Inconsistent usage |

---

## Violations Summary

Riepilogo delle violazioni da correggere.

### Critical (Block deployment)

| File | Violation | Line(s) |
|------|-----------|---------|
| `Button.tsx` | Generic font (Inter) | 12 |
| `LoginForm.tsx` | Contrast < 4.5:1 | 45 |

### High (Fix before release)

| File | Violation | Line(s) |
|------|-----------|---------|
| `ProductCard.tsx` | Hardcoded color #3b82f6 | 23, 45 |
| `Header.tsx` | Off-grid spacing (15px) | 8 |

### Medium (Technical debt)

| File | Violation | Line(s) |
|------|-----------|---------|
| Multiple | Hardcoded spacing | Various |
| Multiple | Missing CSS variables | Various |

---

## Migration Priorities

Ordine suggerito per la migrazione al design system.

| Priority | Component | Reason | Effort |
|----------|-----------|--------|--------|
| 1 | Button.tsx | Used everywhere, high impact | Low |
| 2 | Typography tokens | Foundation for all text | Medium |
| 3 | Card components | Used in 3 archetypes | Medium |
| 4 | Form components | Critical for Action pages | High |
| 5 | Table components | Admin-only, lower priority | Medium |

---

## Notes

[Annotazioni specifiche del progetto, decisioni prese, eccezioni]

---

## How to Update This File

1. Run `/seurat map` to regenerate
2. Or manually update after significant UI changes
3. Keep `Last analyzed` date current

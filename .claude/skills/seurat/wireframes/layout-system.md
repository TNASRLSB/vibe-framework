# Layout System

Concrete CSS rules for building wireframes that have real visual hierarchy, not abstract boxes.

**Reference:** `.claude/docs/visual-composition-principles.md` for underlying theory.

---

## Spacing Scale

Base unit: **4px**. All spacing uses multiples of this unit.

| Token | Value | Use for |
|-------|-------|---------|
| `--space-1` | 4px | Inline gaps, icon-to-label |
| `--space-2` | 8px | Tight component padding |
| `--space-3` | 12px | Input padding, compact card padding |
| `--space-4` | 16px | Standard component padding, gap between related items |
| `--space-6` | 24px | Card padding, gap between form fields |
| `--space-8` | 32px | Section internal padding |
| `--space-12` | 48px | Gap between sections |
| `--space-16` | 64px | Major section breaks |
| `--space-24` | 96px | Hero padding, page-level breathing room |
| `--space-32` | 128px | Maximum section break |

### Spacing Rules

1. **Proximity creates groups**: padding within a component < gap between components. Always.
2. **Section breathing**: minimum `--space-12` between unrelated sections.
3. **Edge margins**: minimum 5% of viewport width on left/right. Use `max-width` + `margin: auto`.
4. **Vertical rhythm**: body text line-height × base font = vertical rhythm unit. Spacing should be multiples of this.

---

## Grid System

### 12-Column Grid

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

### Common Column Spans

| Layout | Columns | Use for |
|--------|---------|---------|
| Full width | 12 | Hero, full-bleed sections |
| Content + sidebar | 8 + 4 | Blog, documentation |
| Asymmetric split | 7 + 5 | Feature + visual |
| Two equal | 6 + 6 | Comparison, before-after |
| Three columns | 4 + 4 + 4 | Feature cards, pricing |
| Four columns | 3 + 3 + 3 + 3 | Integration grid, small cards |

### Responsive Breakpoints

| Breakpoint | Width | Grid behavior |
|-----------|-------|---------------|
| **Mobile** | < 768px | Stack to single column. Max 1 card per row. Increase vertical spacing. |
| **Tablet** | 768-1024px | 2 columns max. Sidebar collapses to top. |
| **Desktop** | > 1024px | Full grid. Sidebar visible. Up to 4 columns. |

```css
/* Mobile-first responsive */
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(var(--grid-cols, 3), 1fr);
    gap: var(--space-8);
  }
}
```

---

## Visual Hierarchy Through Layout

### Primary Content Zone

The most important content occupies the **largest visual area** and has the **most contrast**.

```
┌──────────────────────────────────────────┐
│  Nav (tertiary)                    sm h  │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐     │
│  │                                 │     │
│  │  PRIMARY CONTENT ZONE           │     │
│  │  (60-70% of viewport height)    │     │
│  │                                 │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Secondary │ │Secondary │ │Secondary │ │
│  │  Card    │ │  Card    │ │  Card    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  Footer (tertiary)                       │
└──────────────────────────────────────────┘
```

### Size Ratios

| Hierarchy level | Min size ratio vs secondary |
|----------------|---------------------------|
| Primary (hero headline, main CTA) | 1.5× or larger |
| Secondary (subheading, feature cards) | 1× (baseline) |
| Tertiary (nav, footer, metadata) | 0.75× or smaller |

---

## Content Width Constraints

| Content type | Max width | Why |
|-------------|-----------|-----|
| Body text | 600-700px (45-75 chars) | Readability |
| Headings | 900px | Shorter lines, larger font |
| Cards container | 1200px | Standard content width |
| Full-bleed sections | 100vw | Hero, image bands |
| Forms | 500px | Focus, scannability |

```css
.text-content { max-width: 680px; margin: 0 auto; }
.wide-content { max-width: 1200px; margin: 0 auto; }
.narrow-content { max-width: 500px; margin: 0 auto; }
```

---

## Z-Index Scale

| Layer | z-index | Content |
|-------|---------|---------|
| Base | 0 | Page content |
| Elevated | 10 | Cards, dropdowns |
| Sticky | 100 | Sticky nav, sticky sidebar |
| Overlay | 500 | Modal backdrop |
| Modal | 1000 | Modal content |
| Toast | 2000 | Notifications |

---

## Above-the-Fold Checklist

The first 600px of viewport must contain:

1. **Identity** — Logo or brand name (top-left)
2. **Value prop** — What this is, in one line
3. **Primary CTA** — The single most important action
4. **Visual anchor** — Image, illustration, or product screenshot

If any of these four are missing from the first viewport, the layout fails.

---

## Layout Anti-Patterns

| Anti-pattern | Why it fails | Fix |
|-------------|-------------|-----|
| Equal-width columns for unequal content | No hierarchy | Use asymmetric splits (7+5, 8+4) |
| Text wider than 75 characters | Eye fatigue | `max-width` on text containers |
| No max-width on content | Stretched on wide screens | Container with `max-width: 1200px` |
| Sidebar taller than content | Empty space, broken visual balance | Sticky sidebar or collapse |
| Cards with wildly different heights | Broken grid rhythm | `min-height` or `aspect-ratio` |
| Floating elements without clear flow | Confusing reading order | Use grid or flexbox, not absolute positioning |

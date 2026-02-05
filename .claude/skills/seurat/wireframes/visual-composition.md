# Visual Composition for Web

How to arrange elements on a web page so the eye follows the intended path.

**Reference:** `.claude/docs/visual-composition-principles.md` for shared theory.

---

## Reading Patterns

### F-Pattern — Text-Heavy Pages

Use for: blog posts, documentation, articles, search results.

```
████████████████████████████  ← Eye scans full first line
████████████████████████████
███████████████               ← Shorter scan
████████████████████████████
████████████████████████████
██████████                    ← Even shorter
████████████████████████████
```

**Layout implications:**
- Most important content in the first two lines (headline + lead paragraph)
- Left-align everything — the left edge is the "anchor rail"
- Put secondary CTAs or key info in the left column
- Don't put critical content only on the right side — it gets skipped

### Z-Pattern — Marketing/Landing Pages

Use for: landing pages, hero sections, product pages, pricing.

```
1 ─────────────────────→ 2
     Logo                    Nav/CTA
                       ╱
                     ╱
                   ╱         Diagonal through
                 ╱           main visual content
               ╱
3 ─────────────────────→ 4
     Social proof            Primary CTA
```

**Layout implications:**
- Logo: top-left (position 1)
- Navigation or secondary CTA: top-right (position 2)
- Main content/visual: center diagonal
- Primary CTA: bottom-right (position 4) — this is the endpoint

---

## Asymmetric Balance

### The 60/40 Rule

Never split a page 50/50 unless comparing two equal things. Default to asymmetric:

```css
/* Feature section: content + visual */
.feature-section {
  display: grid;
  grid-template-columns: 7fr 5fr; /* ~58/42 split */
  gap: var(--space-8);
  align-items: center;
}

/* Alternate direction for visual rhythm */
.feature-section:nth-child(even) {
  grid-template-columns: 5fr 7fr;
}
```

### Visual Weight Balance

| Element | Weight | How to balance |
|---------|--------|---------------|
| Large image | Heavy | Balance with multiple small text elements |
| Dark block | Heavy | Balance with light/white space |
| Bright accent color | Heavy (draws eye) | Use sparingly, balance with neutrals |
| Dense text block | Heavy | Balance with whitespace or single image |
| Icon + short label | Light | Group 3-4 together to balance one heavy element |

---

## Gestalt Application

### Proximity in Practice

```css
/* GOOD: Related items close, unrelated items far */
.card {
  padding: var(--space-4);           /* Tight internal spacing */
}
.card-grid {
  gap: var(--space-6);               /* More space between cards */
}
.section {
  margin-bottom: var(--space-16);    /* Much more between sections */
}

/* BAD: Equal spacing everywhere — no grouping */
.everything { margin: 20px; }
```

### Similarity in Practice

- All clickable elements share one color (accent)
- All non-clickable text uses a different color (text)
- Same icon style everywhere (outline OR filled, never mixed)
- Same border-radius on all interactive elements

### Continuity: Alignment Rails

Every page should have no more than **3-4 vertical alignment lines**:

```
│                                          │
│  ┌─ RAIL 1                              │
│  │  Logo                                │
│  │  Nav items                           │
│  │  Section headings                    │
│  │  Body text left edge                 │
│  │  Card left edges                     │
│  │                                      │
│  │        ┌─ RAIL 2                     │
│  │        │  Subheadings indent          │
│  │        │  Card content indent         │
│  │        │                              │
│  │        │              ┌─ RAIL 3       │
│  │        │              │  Right-aligned │
│  │        │              │  CTA buttons   │
│  │        │              │  Prices        │
```

Elements that share an alignment rail feel connected.

---

## Progressive Disclosure

Don't show everything at once. Layer information:

### Level 1: Scannable (visible immediately)
- Headline
- Key visual
- Primary CTA

### Level 2: Interested (visible on scroll)
- Feature descriptions
- Social proof
- Secondary details

### Level 3: Committed (visible on interaction)
- Technical details
- Full pricing breakdown
- FAQ / edge cases

### Implementation

```
┌──────────────────────────────────────────┐
│  LEVEL 1: Hero (above fold)              │
│  - Headline, visual, CTA                 │
├──────────────────────────────────────────┤
│  LEVEL 2: Features (scroll)              │
│  - 3 cards with icons + short text       │
│  - "Learn more" links → detail           │
├──────────────────────────────────────────┤
│  LEVEL 2: Social proof (scroll)          │
│  - Testimonials or metrics               │
├──────────────────────────────────────────┤
│  LEVEL 1: CTA repeat (scroll endpoint)   │
│  - Same CTA as hero, reinforced          │
├──────────────────────────────────────────┤
│  LEVEL 3: FAQ (accordion)                │
│  - Collapsed by default                  │
└──────────────────────────────────────────┘
```

---

## Depth in Web

### Card Elevation

```css
/* Resting state */
.card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Hover — element "lifts" */
.card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
  transition: all 200ms ease-out;
}

/* Active — pressed down */
.card:active {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transform: translateY(0);
}
```

### Overlapping Elements

Create depth by partially overlapping sections:

```css
.hero-image {
  margin-bottom: -80px; /* Bleeds into next section */
  position: relative;
  z-index: 1;
}

.content-section {
  padding-top: 120px; /* Compensate for overlap */
  position: relative;
  z-index: 2;
  background: var(--color-surface);
}
```

### Sticky Elements

Sticky nav and sidebars create a permanent foreground layer:

```css
.nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px); }
.sidebar { position: sticky; top: 80px; /* below nav */ }
```

---

## Color as Layout Tool

### Section Alternation

Alternate background colors between sections to create visual separation without borders:

```css
.section:nth-child(odd) { background: var(--color-bg); }
.section:nth-child(even) { background: var(--color-surface); }
```

### Accent Economy

In any single viewport:
- **1 accent color** for CTAs and interactive elements
- **1 neutral dark** for headings
- **1 neutral medium** for body text
- **1 neutral light** for backgrounds and borders

More than 2 accent colors in one viewport = visual chaos.

---

## Common Layout Patterns

### Hero → Features → Proof → CTA

The universal landing page structure:

```
[HERO: Full-width, headline + CTA + visual]
         ↓
[FEATURES: 3-col grid, icon + title + text]
         ↓
[SOCIAL PROOF: Testimonials or metrics]
         ↓
[CTA: Repeat hero CTA, reinforced]
```

### Content → Sidebar

```css
.page-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-8);
  max-width: 1200px;
}

@media (max-width: 1024px) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}
```

### Centered Narrow

For focused content (signup, checkout, article):

```css
.centered-narrow {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}
```

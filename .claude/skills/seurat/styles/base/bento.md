# Bento Grid

## Identity

**Origins**: Japanese bento boxes, Apple product pages (2023+)
**Philosophy**: Compartmentalized design - distinct sections that form a cohesive whole
**Personality**: Organized, modern, clean, Apple-style, premium
**Japanese**: コンポートメントデザイン (Compartment Design)

## Visual Signature

- **Griglia a compartimenti**: 2-4 colonne, ogni "box" è indipendente
- **Border-radius uniforme**: 16-24px, morbido ma non organico
- **Ombre sottili**: Elevazione minima, quasi flat
- **Spacing consistente**: 8-16px gap tra le celle
- **Content isolation**: Ogni box contiene UN concetto
- **Visual hierarchy through size**: Box più grandi = più importanti

## Tokens CSS

```css
/* Bento Grid Tokens */

/* Grid */
--bento-gap: 16px;
--bento-gap-sm: 8px;
--bento-gap-lg: 24px;

/* Spacing */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography */
--font-display: "SF Pro Display", "Inter", system-ui, sans-serif;
--font-body: "SF Pro Text", "Inter", system-ui, sans-serif;
--text-base: 1rem;
--line-height: 1.5;

/* Colors - clean, minimal */
--color-bg: hsl(0 0% 98%);
--color-surface: hsl(0 0% 100%);
--color-surface-alt: hsl(220 20% 97%);
--color-text: hsl(0 0% 10%);
--color-text-muted: hsl(0 0% 45%);
--color-accent: hsl(210 100% 50%);

/* Shadows - subtle */
--bento-shadow: 0 1px 3px rgba(0,0,0,0.08);
--bento-shadow-hover: 0 4px 12px rgba(0,0,0,0.1);

/* Radius */
--radius: 16px;
--radius-sm: 12px;
--radius-lg: 24px;

/* Borders */
--border: 1px solid hsl(0 0% 92%);

/* Transitions */
--transition: 200ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 0.5mm | Quasi piatto |
| Shadow | Subtle | Minima elevazione |
| Contrast | ΔE 15-25 | Medium |
| Border radius | 16-24px | Consistent |
| Gap | 8-24px | Uniform spacing |

## Tactile Description

*Immagina un contenitore per bento giapponese in plastica premium. Ogni scomparto è sporgente 0.5mm, con bordi arrotondati (raggio 16mm). Quando premi un box, senti un clic netto (100g di pressione). Le pareti tra i box sono sottili (1mm) ma definite, come le scanalature di un vassoio di ghiaccio di design. Ogni compartimento è isolato ma parte di un insieme coeso.*

## Component Examples

```css
/* Bento Grid Container */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(150px, auto);
  gap: var(--bento-gap);
  padding: var(--space-4);
}

/* Bento Cell - Base */
.bento-cell {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: var(--space-4);
  border: var(--border);
  transition: all var(--transition);
}

.bento-cell:hover {
  box-shadow: var(--bento-shadow-hover);
  transform: translateY(-2px);
}

/* Size variants */
.bento-cell--lg {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-cell--wide {
  grid-column: span 2;
}

.bento-cell--tall {
  grid-row: span 2;
}

/* Bento Cell - Feature (highlighted) */
.bento-cell--feature {
  background: var(--color-accent);
  color: white;
}

/* Bento Cell - Image */
.bento-cell--image {
  padding: 0;
  overflow: hidden;
}

.bento-cell--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Bento Cell - Stat */
.bento-cell--stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.bento-stat-value {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text);
}

.bento-stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

/* Bento Cell - Interactive */
.bento-cell--interactive {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.bento-cell--interactive::after {
  content: '→';
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  font-size: 1.25rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition);
}

.bento-cell--interactive:hover::after {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-cell--lg {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (max-width: 480px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-cell--lg,
  .bento-cell--wide {
    grid-column: span 1;
  }
}
```

## Layout Patterns

### Apple-Style Product Grid
```
┌──────────────┬──────┬──────┐
│              │      │      │
│   Feature    │ Stat │ Stat │
│   (2x2)      │      │      │
│              ├──────┴──────┤
│              │    Wide     │
├──────┬───────┴─────────────┤
│      │                     │
│ Tall │     Feature 2       │
│      │       (2x1)         │
└──────┴─────────────────────┘
```

### Dashboard Bento
```
┌──────┬──────┬──────┬──────┐
│ Stat │ Stat │ Stat │ Stat │
├──────┴──────┼──────┴──────┤
│   Chart     │   Chart     │
│   (2x2)     │   (2x2)     │
│             │             │
├─────────────┴─────────────┤
│         Activity          │
└───────────────────────────┘
```

## Ideal Weights

```yaml
trust: 0.6
innovation: 0.7
formality: 0.6
warmth: 0.5
playfulness: 0.4
density: 0.5
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bento ✓ (native) | Grid-based by nature |
| Curves | Geometric ✓, Organic ○ | Consistent radius |
| Palette | All ✓ | Palette-agnostic |
| Density | Sparse ✓, Balanced ✓ | Needs breathing room |

## Incompatible Modifiers

- **Asymmetric/Broken grid**: Contradicts compartment logic
- **Angular curves**: Bento needs rounded corners
- **Claustrophobic density**: Cells need space

## Anti-Patterns Specifici

- Bento + All same-size cells = Just a grid (no visual interest)
- Bento + Too many cells = Overwhelming
- Bento + No visual hierarchy = Flat importance

## Best For

- Product feature pages (Apple-style)
- Portfolios
- Dashboard summaries
- Landing pages
- About/team pages
- Feature showcases

## Avoid For

- Long-form content
- Data-heavy tables
- Complex forms
- Text-first documentation
- Mobile-only (needs width)

## Design Tips

1. **Vary cell sizes** - Use 1x1, 2x1, 1x2, 2x2 to create rhythm
2. **Feature cell** - One cell should be largest/most prominent
3. **Consistent gaps** - Never vary the gap between cells
4. **Content density** - Each cell has ONE message
5. **Responsive** - Collapse to 2-col or 1-col on mobile
6. **Animation** - Stagger entrance animations by cell

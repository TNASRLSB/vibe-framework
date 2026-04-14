# Brand Identity — Mapping Tables & Checklists

Decision tables for translating brand personality into visual choices. Framework theory is not included — you already know brand methodology.

---

## Personality-to-Visual Mapping

### Color Derivation

| Personality inputs | Color decision |
|-------------------|---------------|
| Temperature 1-2 + Tone 1-3 | Cool neutrals: slate, steel blue, charcoal |
| Temperature 1-2 + Tone 4-7 | Cool brights: electric blue, cyan, violet |
| Temperature 3-5 + Tone 1-3 | Balanced professional: navy, forest green, burgundy |
| Temperature 3-5 + Tone 4-7 | Balanced vibrant: teal, purple, emerald |
| Temperature 5-7 + Tone 1-3 | Warm sophisticated: wine, copper, olive |
| Temperature 5-7 + Tone 4-7 | Warm energetic: coral, amber, tangerine |

### Palette Generation

From primary color:
1. **Primary scale:** 50 (lightest) through 950 (darkest) in 12 steps
2. **Secondary:** Low complexity (1-3) = analogous (30°), high complexity (4-7) = complementary (120-180°)
3. **Accent:** High-contrast pop color for CTAs
4. **Neutral:** Desaturated primary for text/backgrounds
5. **Semantic:** Success/warning/error/info tinted toward primary

### Typography Derivation

| Personality inputs | Typography decision |
|-------------------|-------------------|
| Tone 1-2 + Edge 5-7 | Serif heading + sans body |
| Tone 1-2 + Edge 1-4 | Geometric sans all |
| Tone 3-5 + Edge 3-5 | Humanist sans all (Inter, Source Sans) |
| Tone 5-7 + Edge 1-3 | Rounded sans heading + humanist body |
| Tone 5-7 + Edge 4-7 | Display heading + geometric body |
| Complexity 6-7 | Mix serif heading + sans body |
| Energy 6-7 | Tighter letter-spacing, larger headings |

### Shape Language

| Edge score | Border radius | Shape vocabulary |
|-----------|---------------|-----------------|
| 1-2 | 16-32px, pill shapes | Circles, blobs, waves |
| 3-4 | 8-12px | Rounded rectangles, soft polygons |
| 5-6 | 2-4px | Rectangles, precise geometry |
| 7 | 0px | Sharp rectangles, angular cuts |

### Spacing Rhythm

| Energy + Complexity | Spacing character |
|--------------------|------------------|
| Both low (1-3) | Generous: 1.5x base, lots of whitespace |
| Mixed | Standard: 1x base |
| Both high (5-7) | Tight: 0.75x base, dense layouts |

### Motion Character

| Energy score | Motion behavior |
|-------------|----------------|
| 1-2 | Fade only, 300-500ms, no transform |
| 3-4 | Subtle slide/fade, 200-300ms, ease-out |
| 5-6 | Slide + scale, 150-250ms, ease-in-out |
| 7 | Spring physics, 100-200ms, overshoot |

---

## SVG Logo Best Practices

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 [w] [h]"
     role="img" aria-label="[Brand] logo">
  <title>[Brand] logo</title>
  <path fill="currentColor" d="..."/>
</svg>
```

- Use `viewBox`, never fixed width/height
- Max 3 anchor points per curve
- Use `currentColor` for single-color flexibility
- Include `<title>` for accessibility
- Remove editor metadata
- Keep < 5KB simple, < 15KB complex

### Size Requirements

| Context | Min size | Format |
|---------|---------|--------|
| Favicon | 16x16 | SVG/ICO |
| Mobile nav | 32x32 | SVG |
| Desktop nav | 40-48px h | SVG |
| Social avatar | 200x200 | PNG |
| Hero | 400px+ w | SVG |

### Color Variants

Every logo needs: full color, single dark, single light, reversed.

---

## Token Mapping

| Brand element | Token category |
|--------------|---------------|
| Primary color | `--color-primary-*` (scale 50-950) |
| Secondary | `--color-secondary-*` |
| Accent | `--color-accent-*` |
| Neutral | `--color-neutral-*` |
| Heading typeface | `--font-heading` |
| Body typeface | `--font-body` |
| Type scale | `--text-xs` to `--text-5xl` |
| Border radius | `--radius-*` (from edge score) |
| Shadows | `--shadow-*` (from style) |
| Motion | `--motion-duration-*`, `--motion-easing-*` |
| Spacing | `--space-*` (from energy + complexity) |

---

## Brand Audit Checklist

- [ ] Logo works at all sizes (16px to 400px+)
- [ ] Logo has all color variants
- [ ] Palette has ≥ 5 accessible text/background pairs
- [ ] Typography has heading + body + code stacks
- [ ] All token categories populated
- [ ] Semantic colors defined
- [ ] Brand personality scores documented
- [ ] Components use tokens consistently (no hard-coded values)
- [ ] Accessibility met at brand level

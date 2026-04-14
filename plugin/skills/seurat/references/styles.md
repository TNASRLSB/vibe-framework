# Visual Styles — Token Overrides & CSS Patterns

Concrete token values and CSS patterns for all 11 styles. Style philosophy and when-to-use guidance is not included — you already know these styles. Use competitor research to inform style selection.

---

## 1. Flat

```css
--radius-sm: 4px;  --radius-md: 6px;  --radius-lg: 8px;
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 2px 4px rgba(0,0,0,0.08);
--shadow-lg: 0 4px 8px rgba(0,0,0,0.1);
--motion-duration: 150ms;
--motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
--border-width: 1px;
```

```css
.card { background: var(--color-surface); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4); }
.btn-primary { background: var(--color-primary); color: var(--color-on-primary); border: none; border-radius: var(--radius-md); padding: var(--space-2) var(--space-4); font-weight: 500; }
.btn-primary:hover { background: var(--color-primary-600); }
.btn-primary:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.input { border: var(--border-width) solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-100); }
```

---

## 2. Brutalism

```css
--radius-sm: 0;  --radius-md: 0;  --radius-lg: 0;
--shadow-sm: none;  --shadow-md: none;
--shadow-lg: 4px 4px 0 var(--color-neutral-900);
--motion-duration: 0ms;
--motion-easing: steps(1);
--border-width: 2px;
--font-heading: 'Courier New', 'SF Mono', monospace;
```

```css
.card { background: var(--color-surface); border: var(--border-width) solid var(--color-neutral-900); padding: var(--space-4); }
.btn-primary { background: var(--color-neutral-900); color: var(--color-neutral-50); border: var(--border-width) solid var(--color-neutral-900); padding: var(--space-2) var(--space-4); font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.05em; }
.btn-primary:hover { background: var(--color-primary); color: var(--color-neutral-900); }
.interactive { box-shadow: var(--shadow-lg); }
.interactive:active { transform: translate(4px, 4px); box-shadow: none; }
```

---

## 3. Neumorphism

```css
--radius-sm: 12px;  --radius-md: 16px;  --radius-lg: 24px;
--shadow-raised: 6px 6px 12px var(--color-shadow-dark), -6px -6px 12px var(--color-shadow-light);
--shadow-inset: inset 4px 4px 8px var(--color-shadow-dark), inset -4px -4px 8px var(--color-shadow-light);
--color-shadow-dark: rgba(0,0,0,0.15);
--color-shadow-light: rgba(255,255,255,0.8);
--motion-duration: 250ms;
--border-width: 0;
```

```css
body { background: var(--color-neutral-200); }
.card { background: var(--color-neutral-200); border-radius: var(--radius-lg); box-shadow: var(--shadow-raised); padding: var(--space-5); }
.btn-primary { background: var(--color-neutral-200); color: var(--color-primary); border: none; border-radius: var(--radius-md); box-shadow: var(--shadow-raised); padding: var(--space-2) var(--space-4); font-weight: 600; }
.btn-primary:hover { box-shadow: var(--shadow-inset); }
```

**A11y note:** Always verify text contrast ≥ 4.5:1. Use color (not just shadow) to differentiate interactive from static.

---

## 4. Skeuomorphism

```css
--radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;
--shadow-sm: 0 1px 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
--shadow-md: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
--shadow-lg: 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15);
--motion-duration: 200ms;
--gradient-highlight: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%);
```

```css
.btn-primary { background: linear-gradient(180deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%); color: var(--color-on-primary); border: 1px solid var(--color-primary-700); border-radius: var(--radius-md); box-shadow: var(--shadow-md); text-shadow: 0 1px 1px rgba(0,0,0,0.2); }
.btn-primary:active { background: linear-gradient(180deg, var(--color-primary-600) 0%, var(--color-primary-400) 100%); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
.input { background: var(--color-neutral-100); border: 1px solid var(--color-neutral-400); border-radius: var(--radius-sm); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
```

---

## 5. Spatial

```css
--radius-sm: 12px;  --radius-md: 16px;  --radius-lg: 24px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
--shadow-md: 0 8px 24px rgba(0,0,0,0.12);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.16);
--shadow-xl: 0 24px 64px rgba(0,0,0,0.2);
--motion-duration: 350ms;
--motion-easing: cubic-bezier(0.2, 0, 0, 1);
--backdrop-blur: 20px;
```

```css
.card { background: rgba(255,255,255,0.72); backdrop-filter: blur(var(--backdrop-blur)); -webkit-backdrop-filter: blur(var(--backdrop-blur)); border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
.panel-foreground { box-shadow: var(--shadow-xl); transform: scale(1.02); z-index: 10; }
.panel-background { box-shadow: var(--shadow-sm); transform: scale(0.98); opacity: 0.8; z-index: 1; }
@media (prefers-reduced-motion: reduce) { .parallax-layer-back, .parallax-layer-mid, .parallax-layer-front { transform: none; } }
```

---

## 6. Y2K

```css
--radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 20px;
--shadow-sm: 0 0 8px rgba(0,150,255,0.3);
--shadow-md: 0 0 16px rgba(255,0,150,0.3);
--shadow-lg: 0 0 24px rgba(150,0,255,0.4);
--motion-duration: 300ms;
--motion-easing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--border-width: 2px;
--gradient-primary: linear-gradient(135deg, #ff00ff, #00ffff);
--gradient-secondary: linear-gradient(135deg, #ff6600, #ffff00);
--font-heading: 'Impact', 'Arial Black', sans-serif;
```

```css
.heading-gradient { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: var(--font-heading); }
.btn-primary { background: linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 45%, #c0c0c0 55%, #808080 100%); border: 2px solid #606060; border-radius: var(--radius-md); font-weight: 700; }
.btn-primary:hover { background: var(--gradient-primary); color: white; border-color: #ff00ff; box-shadow: var(--shadow-md); }
.card { background: rgba(0,0,20,0.8); border: 1px solid rgba(0,255,255,0.3); border-radius: var(--radius-md); color: white; }
```

**A11y note:** Neon palette makes contrast compliance difficult. Always test every text/background pair. Provide high-contrast mode toggle.

---

## 7. Glassmorphism

```css
--radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 20px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
--shadow-md: 0 8px 32px rgba(0,0,0,0.12);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.15);
--motion-duration: 250ms;
--backdrop-blur: 16px;
--glass-bg-light: rgba(255,255,255,0.25);
--glass-bg-dark: rgba(0,0,0,0.25);
--glass-border: rgba(255,255,255,0.18);
```

```css
.card { background: var(--glass-bg-light); backdrop-filter: blur(var(--backdrop-blur)); -webkit-backdrop-filter: blur(var(--backdrop-blur)); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
.navbar { background: var(--glass-bg-light); backdrop-filter: blur(var(--backdrop-blur)); border-bottom: 1px solid var(--glass-border); position: sticky; top: 0; z-index: 100; }
@media (prefers-color-scheme: dark) { .card { background: var(--glass-bg-dark); } }
```

**A11y note:** Glass surfaces make contrast dependent on background. Always add semi-opaque layer guaranteeing 4.5:1 regardless of what's behind.

---

## 8. Claymorphism

```css
--radius-sm: 12px;  --radius-md: 20px;  --radius-lg: 32px;
--shadow-clay: 8px 8px 16px rgba(0,0,0,0.12), inset -4px -4px 8px rgba(0,0,0,0.05), inset 4px 4px 8px rgba(255,255,255,0.4);
--shadow-clay-sm: 4px 4px 8px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(0,0,0,0.04), inset 2px 2px 4px rgba(255,255,255,0.3);
--motion-duration: 350ms;
--motion-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
--border-width: 0;
```

```css
body { background: var(--color-neutral-100); }
.card { background: var(--color-primary-100); border-radius: var(--radius-lg); box-shadow: var(--shadow-clay); padding: var(--space-5); }
.btn-primary { background: var(--color-primary); color: var(--color-on-primary); border: none; border-radius: var(--radius-md); box-shadow: var(--shadow-clay-sm); padding: var(--space-2) var(--space-5); font-weight: 600; }
.btn-primary:hover { transform: translateY(-2px); }
.btn-primary:active { transform: translateY(1px); box-shadow: inset 2px 2px 4px rgba(0,0,0,0.15); }
```

---

## 9. Material

```css
--radius-sm: 4px;  --radius-md: 4px;  --radius-lg: 8px;  --radius-full: 9999px;
--shadow-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
--shadow-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
--shadow-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
--shadow-4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
--motion-duration-short: 150ms;  --motion-duration-medium: 250ms;  --motion-duration-long: 375ms;
--motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--motion-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--motion-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

```css
.fab { background: var(--color-primary); color: var(--color-on-primary); border: none; border-radius: var(--radius-full); width: 56px; height: 56px; box-shadow: var(--shadow-2); }
.fab:hover { box-shadow: var(--shadow-3); }
.card { background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-1); overflow: hidden; }
.app-bar { background: var(--color-primary); color: var(--color-on-primary); box-shadow: var(--shadow-2); height: 56px; padding: 0 var(--space-4); display: flex; align-items: center; }
```

---

## 10. Bento Grid

```css
--radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 20px;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.1);
--motion-duration: 300ms;
--grid-gap: var(--space-4);
--border-width: 1px;
```

```css
.bento { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(200px, auto); gap: var(--grid-gap); padding: var(--grid-gap); }
.bento-1x1 { grid-column: span 1; grid-row: span 1; }
.bento-2x1 { grid-column: span 2; grid-row: span 1; }
.bento-1x2 { grid-column: span 1; grid-row: span 2; }
.bento-2x2 { grid-column: span 2; grid-row: span 2; }
.bento-cell { background: var(--color-surface); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); overflow: hidden; }
.bento-cell:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
@media (max-width: 1024px) { .bento { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .bento { grid-template-columns: 1fr; } .bento-2x1, .bento-2x2 { grid-column: span 1; } }
```

---

## 11. Gen-Z

```css
--radius-sm: 8px;  --radius-md: 16px;  --radius-lg: 9999px;
--shadow-sm: none;
--shadow-md: 0 4px 16px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
--motion-duration: 400ms;
--motion-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
--border-width: 2px;
--gradient-primary: linear-gradient(135deg, var(--color-primary), var(--color-accent));
--font-heading: 'Playfair Display', Georgia, serif;
--font-body: 'Inter', -apple-system, sans-serif;
--font-accent: 'Space Grotesk', sans-serif;
```

```css
h1 { font-family: var(--font-heading); font-size: var(--text-5xl); font-style: italic; line-height: 1.1; }
h1 span.highlight { font-family: var(--font-accent); font-style: normal; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.btn-primary { background: var(--gradient-primary); color: white; border: none; border-radius: var(--radius-lg); padding: var(--space-3) var(--space-6); font-family: var(--font-accent); }
.btn-primary:hover { transform: scale(1.05) rotate(-1deg); }
.blob { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; background: var(--gradient-primary); opacity: 0.15; position: absolute; filter: blur(40px); z-index: -1; }
.sticker { display: inline-flex; align-items: center; gap: var(--space-1); background: var(--color-accent-100); color: var(--color-accent-700); border: var(--border-width) solid var(--color-accent-300); border-radius: var(--radius-lg); padding: var(--space-1) var(--space-3); font-size: var(--text-sm); font-weight: 600; transform: rotate(-2deg); }
```

---

## Style Combinations

| Base | Compatible accents |
|------|-------------------|
| Flat | Bento Grid, Material |
| Glassmorphism | Spatial, Bento Grid |
| Material | Flat, Bento Grid |
| Gen-Z | Glassmorphism, Bento Grid |
| Bento Grid | Any (layout pattern, not surface) |

**Rule:** Max 2 styles combined. Base = 80%+. Accent for specific sections.

---

## Factor-X: Controlled Distinctiveness

One targeted visual "breaker" per project to prevent generic-looking interfaces.

### The 5 Categories

| Category | What | Works with | Avoid with |
|----------|------|-----------|-----------|
| **Typography Clash** | Unexpected type combos (display serif in sans-serif design) | Flat, Brutalism | Material, enterprise |
| **Color Intrusion** | One "alien" color breaking a coherent palette (neon lime on earth tones) | Monochromatic, cool palettes | Already-vibrant palettes |
| **Layout Break** | Elements that deliberately break the grid | Swiss grid, Bento | Already-broken grids |
| **Texture Injection** | Grain, paper, or material texture adding physicality | Flat, Glassmorphism | Skeuomorphism, Claymorphism |
| **Motion Surprise** | One unexpected animation in static context | Flat, Material | Spatial, Y2K |

### Intensity

| Level | Presence | Effect |
|-------|----------|--------|
| Subtle | ~10% | Subconscious distinctiveness |
| Moderate | ~25% | Noticeable but not dominant |
| Bold | ~40% | Clear design statement |
| Extreme | ~60% | Dominant visual element |

### Rules

1. **One Factor-X per project.** Never combine multiple.
2. Factor-X must never compromise accessibility, readability, or core functionality.
3. Apply in non-critical zones: hero, dividers, decorative sections. Not forms, nav, CTAs, error messages.
4. Scale with trust: high-trust (finance, healthcare) = subtle only. Low-trust (portfolio, agency) = bold/extreme OK.

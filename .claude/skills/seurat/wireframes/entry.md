# Wireframe: Entry Page

Landing page, prima impressione, conversione.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **hero-centric** | Full-viewport hero → sezioni stack | SaaS, prodotti, startup |
| **split** | 50/50 testo + media per ogni sezione | App, tools, B2B |
| **video-first** | Video/animazione background | Creative, entertainment |
| **minimal** | Logo + singolo CTA | Launch pages, waitlist |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
hero-centric: { trust: 0.5, innovation: 0.6, formality: 0.4, warmth: 0.5, playfulness: 0.4, density: 0.3 }
split:        { trust: 0.6, innovation: 0.5, formality: 0.6, warmth: 0.4, playfulness: 0.3, density: 0.4 }
minimal:      { trust: 0.4, innovation: 0.7, formality: 0.3, warmth: 0.3, playfulness: 0.5, density: 0.2 }
```

---

## hero-centric (default)

### Composizione

```
HERO(variant: split, height: 80vh)
CONTAINER(lg)
  └── STACK(gap: space-2, align: center) → social proof
CONTAINER(lg)
  └── STACK(gap: space-2, align: center)
        └── GRID(columns: 3, collapse: tablet) → features
CONTAINER(lg)
  └── STACK(gap: space-6) → how it works (alternating SPLIT sections)
CONTAINER(md)
  └── STACK(gap: space-3, align: center) → final CTA
CONTAINER(lg)
  └── GRID(columns: 4, collapse: mobile) → footer
```

### Grid Structure

```css
.page-entry {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | NAV | — | `position: sticky; top: 0; height: 64px; z-index: 100; backdrop-filter: blur(10px)` |
| 2 | HERO | HERO:split | `min-height: 80vh; grid: 1fr 1fr; gap: space-6; align-items: center` |
| 3 | SOCIAL PROOF | CONTAINER + STACK | `py: space-6; border-y: 1px solid border-color` |
| 4 | FEATURES | CONTAINER + GRID(3) | `py: space-8` |
| 5 | HOW IT WORKS | CONTAINER + SPLIT (alternating) | `py: space-8; gap: space-8 tra sezioni` |
| 6 | FINAL CTA | CONTAINER(md) + STACK(center) | `py: space-8; text-align: center` |
| 7 | FOOTER | CONTAINER + GRID(4) | `py: space-6; border-top; color: text-muted` |

### Breakpoints

**Desktop (>1024px):**
- Hero: split 1fr 1fr, min-height: 80vh
- Features: grid 3 colonne
- How it works: alternating split
- Footer: 4 colonne

**Tablet (768-1024px):**
- Hero: stack verticale, min-height: 60vh
- Features: grid 2 colonne
- How it works: stack (immagine sopra, testo sotto)
- Footer: 2 colonne

**Mobile (<768px):**
- Hero: stack, min-height: auto, padding: space-5
- Features: stack singola colonna
- How it works: stack
- Footer: stack
- Buttons: full-width
- Spacing: ridotto di 1 livello (space-8 → space-6, space-6 → space-4)

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `HERO.variant` | `split` \| `centered` \| `video` \| `minimal` | `split` |
| `HERO.eyebrow` | testo | opzionale |
| `HERO.title` | testo | "Build something remarkable" |
| `HERO.subtitle` | testo | "The modern platform for..." |
| `HERO.cta_primary` | testo + link | "Get started free" |
| `HERO.cta_secondary` | testo + link | "See how it works" |
| `HERO.visual` | image \| video \| animation | placeholder |
| `SOCIAL.type` | `logos` \| `testimonials` \| `stats` | `logos` |
| `SOCIAL.items` | 4-6 items | placeholder logos |
| `FEATURES.count` | 3 \| 4 \| 6 | 3 |
| `FEATURES.items[].icon` | icon/emoji | placeholder |
| `FEATURES.items[].title` | testo | "Feature name" |
| `FEATURES.items[].description` | testo | "Feature description..." |
| `HOW.enabled` | boolean | true |
| `HOW.steps` | 2-4 steps | 3 steps |
| `CTA.title` | testo | "Ready to get started?" |
| `CTA.cta` | testo + link | "Start free trial" |

---

## split

Come hero-centric ma ogni sezione usa SPLIT invece di STACK + GRID.

```
HERO(variant: split, height: 80vh)
CONTAINER(lg) → SPLIT(ratio: 1:1) → social proof
CONTAINER(lg) → SPLIT(ratio: 1:1) → feature 1
CONTAINER(lg) → SPLIT(ratio: 1:1, reverse) → feature 2
CONTAINER(lg) → SPLIT(ratio: 1:1) → feature 3
CONTAINER(md) → STACK(center) → final CTA
CONTAINER(lg) → GRID(4) → footer
```

---

## minimal

```
CENTERED(md)
  └── STACK(gap: space-4, align: center)
        ├── logo
        ├── heading
        ├── subtitle
        ├── email input + CTA button
        └── small text (privacy, terms)
```

Min-height: 100vh, place-items: center.

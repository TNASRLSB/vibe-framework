# Wireframe: System Page

Feedback di sistema, errori, stati edge, conferme.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **centered** | Icona + messaggio + azioni centrate | 404, 500, maintenance |
| **full-page** | Errore branded con nav | Errori pubblici |
| **success** | Animazione + prossimi step | Completamenti, achievements |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
centered:  { trust: 0.5, innovation: 0.4, formality: 0.5, warmth: 0.5, playfulness: 0.3, density: 0.2 }
full-page: { trust: 0.4, innovation: 0.6, formality: 0.3, warmth: 0.4, playfulness: 0.5, density: 0.2 }
split:     { trust: 0.5, innovation: 0.5, formality: 0.5, warmth: 0.5, playfulness: 0.3, density: 0.3 }
```

---

## centered (default)

### Composizione

```
(NAV opzionale — puo essere nascosta per focus)
HERO(variant: minimal, height: 100vh)
  └── CENTERED(sm → 480px)
        └── STACK(gap: space-4, align: center)
              ├── icon/illustrazione (64-128px)
              ├── status code ("404") — opzionale
              ├── heading ("Page not found")
              ├── description ("The page you're looking for doesn't exist or has been moved.")
              └── STACK(gap: space-3, align: center) → recovery actions
                    ├── primary button ("Go home")
                    └── secondary links ("Search" | "Contact support")
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | ICON | — | `width: 96px; height: 96px; color: text-muted; margin-bottom: space-2` |
| 2 | STATUS CODE | — | `font-size: text-4xl; font-weight: 800; color: text-muted; letter-spacing: -0.02em` |
| 3 | HEADING | — | `font-size: text-2xl; font-weight: 700; text-align: center` |
| 4 | DESCRIPTION | — | `font-size: text-base; color: text-muted; text-align: center; max-width: 400px` |
| 5 | ACTIONS | STACK(gap: space-3, align: center) | Primary: button. Secondary: text links con `color: primary` |

### Breakpoints

Minimal responsive necessario — il layout e gia centrato e stacked.

**Mobile (<768px):**
- Padding ridotto: space-4
- Icon piu piccolo: 64px
- Heading: text-xl
- Buttons: full-width

### Pagine tipo

| Tipo | Icon | Code | Heading | Tone |
|------|------|------|---------|------|
| 404 | search/compass | 404 | "Page not found" | Helpful |
| 500 | alert-triangle | 500 | "Something went wrong" | Apologetic |
| 403 | lock | 403 | "Access denied" | Clear |
| Maintenance | wrench | — | "We'll be back soon" | Informative |
| Success | check-circle | — | "All done!" | Celebratory |
| Empty state | inbox/folder | — | "Nothing here yet" | Encouraging |

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `ICON.type` | icon name / SVG / emoji | context-dependent |
| `ICON.size` | `sm` (64px) \| `md` (96px) \| `lg` (128px) | `md` |
| `CODE.value` | testo | opzionale |
| `HEADING.text` | testo | "Page not found" |
| `DESCRIPTION.text` | testo | "The page you're looking for..." |
| `ACTIONS.primary` | testo + link | "Go home" |
| `ACTIONS.secondary[]` | testo + link | "Search", "Contact support" |
| `NAV.visible` | boolean | false per errori, true per success |

---

## full-page

Come centered ma con nav visibile, branding, e piu spazio per illustrazioni.

```
NAV
CONTAINER(lg)
  └── SPLIT(ratio: 1:1, valign: center)
        ├── left: STACK(gap: space-4)
        │         ├── status code
        │         ├── heading
        │         ├── description
        │         └── actions
        └── right: illustrazione grande
FOOTER
```

---

## success

Celebrativo, con animazione e prossimi step chiari.

```
(NAV minimal)
HERO(variant: minimal, height: 100vh)
  └── CENTERED(sm)
        └── STACK(gap: space-5, align: center)
              ├── animated icon (check circle con animazione)
              ├── heading ("Payment successful!")
              ├── description ("Your order #12345 has been confirmed.")
              ├── detail card (order summary, opzionale)
              └── STACK(gap: space-3, align: center) → next steps
                    ├── primary button ("View order")
                    └── secondary ("Continue shopping")
```

Animazione check:
```css
@keyframes check-appear {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
.success-icon {
  animation: check-appear 0.5s ease-out;
  color: var(--color-success);
}
```

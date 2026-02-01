# Wireframe: Detail Page

Approfondimento su un singolo item, guida all'azione primaria.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **media-info** | Gallery a sinistra, dettagli a destra | Prodotti, portfolio |
| **full-width** | Sezioni stacked full-width | Articoli, case study |
| **sticky-sidebar** | Contenuto scrollabile + azione fissa | Long-form + acquisto |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
media-info:     { trust: 0.6, innovation: 0.4, formality: 0.5, warmth: 0.5, playfulness: 0.3, density: 0.5 }
full-width:     { trust: 0.4, innovation: 0.7, formality: 0.3, warmth: 0.5, playfulness: 0.5, density: 0.3 }
sticky-sidebar: { trust: 0.6, innovation: 0.4, formality: 0.6, warmth: 0.4, playfulness: 0.2, density: 0.6 }
```

---

## media-info (default)

### Composizione

```
NAV
CONTAINER(lg)
  └── STACK(gap: space-5)
        ├── breadcrumbs
        ├── SPLIT(ratio: 1:1, valign: start)
        │     ├── left: media gallery (main + thumbnails)
        │     └── right: STACK(gap: space-4)
        │                 ├── title block (title, price, rating)
        │                 ├── variant selectors (size, color)
        │                 ├── primary action (add to cart)
        │                 └── secondary actions (wishlist, share)
        ├── tabs (description, specs, reviews)
        └── GRID(columns: 4, collapse: tablet→2) → related items
FOOTER
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | NAV | — | sticky, 64px |
| 2 | BREADCRUMBS | CONTAINER | `py: space-3; font-size: text-sm; color: text-muted` |
| 3 | MEDIA GALLERY | STACK(gap: space-3) | Main image: `aspect-ratio: 1/1; border-radius: radius-md`. Thumbnails: `display: flex; gap: space-2; overflow-x: auto` |
| 4 | TITLE BLOCK | STACK(gap: space-2) | Title: `text-2xl; font-weight: 700`. Price: `text-xl; color: primary` |
| 5 | VARIANTS | STACK(gap: space-3) | Label + options grid/flex |
| 6 | PRIMARY ACTION | STACK(gap: space-2) | Button: `width: 100%; height: 48px` |
| 7 | TABS | — | `border-bottom: 2px; tab active: color-primary; py: space-6 per panel` |
| 8 | RELATED | CONTAINER + GRID(4) | `py: space-8; border-top` |

### Breakpoints

**Desktop (>1024px):**
- Split: 1fr 1fr, gap: space-6
- Gallery: main image grande + row thumbnails
- Tabs: inline tab bar
- Related: 4 colonne

**Tablet (768-1024px):**
- Split: stack (gallery sopra, info sotto)
- Gallery: carousel
- Related: 2 colonne

**Mobile (<768px):**
- Tutto stack verticale
- Gallery: swipe carousel full-width
- Tabs: accordion o select dropdown
- Related: scroll orizzontale (1.5 card visibili)
- Primary action: sticky bottom bar

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `BREADCRUMBS.items` | links | Home > Category > Item |
| `GALLERY.images` | 3-6 images | placeholders |
| `GALLERY.zoom` | boolean | true |
| `TITLE.title` | testo | "Product Name" |
| `TITLE.price` | testo | "$99.00" |
| `TITLE.rating` | number + count | "4.5 (128 reviews)" |
| `VARIANTS.groups[]` | variant group | Size, Color |
| `ACTION.primary` | testo | "Add to cart" |
| `ACTION.secondary` | testo[] | "Save", "Share" |
| `TABS.items[]` | tab | Description, Specifications, Reviews |
| `RELATED.count` | 3 \| 4 | 4 |

---

## full-width

Per articoli, case study, portfolio pieces.

```
NAV
HERO(variant: centered, height: 60vh) → titolo + immagine di copertina
CONTAINER(md)
  └── STACK(gap: space-5) → contenuto articolo
        ├── meta (autore, data, tempo lettura)
        ├── body text (prose)
        ├── full-width images/video (break out of container)
        └── share/actions
CONTAINER(lg)
  └── GRID(columns: 3) → related content
FOOTER
```

---

## sticky-sidebar

Per prodotti complessi con info lunga.

```
NAV
CONTAINER(lg)
  └── breadcrumbs
CONTAINER(lg)
  └── SIDEBAR(side: right, width: 320px, sticky: true)
        ├── main: STACK(gap: space-6)
        │         ├── media gallery (large)
        │         ├── description
        │         ├── specifications table
        │         └── reviews
        └── sidebar (sticky): STACK(gap: space-3)
                               ├── price
                               ├── variants
                               ├── add to cart
                               └── shipping info
FOOTER
```

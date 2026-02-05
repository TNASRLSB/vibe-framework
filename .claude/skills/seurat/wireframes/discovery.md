# Wireframe: Discovery Page

Browse, filtra, trova items da una collezione.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **sidebar-grid** | Filtri a sinistra, risultati a destra | E-commerce, cataloghi |
| **top-filters** | Filtri orizzontali sopra i risultati | Mobile-first, filtri semplici |
| **map-list** | Mappa + lista split | Location-based, real estate |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
sidebar-grid: { trust: 0.6, innovation: 0.4, formality: 0.6, warmth: 0.4, playfulness: 0.2, density: 0.6 }
top-filters:  { trust: 0.5, innovation: 0.5, formality: 0.5, warmth: 0.5, playfulness: 0.3, density: 0.5 }
map-list:     { trust: 0.5, innovation: 0.6, formality: 0.4, warmth: 0.5, playfulness: 0.3, density: 0.5 }
```

---

## sidebar-grid (default)

### Composizione

```
NAV
CONTAINER(lg)
  └── STACK(gap: space-3)
        ├── page header (title + breadcrumbs)
        └── SIDEBAR(width: 280px, sticky: true, collapse: drawer)
              ├── sidebar: filter stack
              └── main: STACK(gap: space-4)
                    ├── results header (count + sort + view toggle)
                    ├── GRID(columns: 3, collapse: tablet→2, mobile→1)
                    │     └── product/content cards
                    └── pagination
FOOTER
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | NAV | — | sticky, 64px |
| 2 | PAGE HEADER | CONTAINER + STACK | `py: space-4; border-bottom` |
| 3 | SIDEBAR | SIDEBAR(280px, sticky) | `position: sticky; top: 80px; max-height: calc(100vh - 96px); overflow-y: auto` |
| 4 | FILTERS | STACK(gap: space-4) | Dentro sidebar: accordion/checkbox groups |
| 5 | RESULTS HEADER | SPLIT(ratio: 2:1) o flex justify-between | `py: space-3; border-bottom; align-items: center` |
| 6 | RESULTS GRID | GRID(3) | `gap: space-4` |
| 7 | PAGINATION | CENTERED | `py: space-5` |
| 8 | EMPTY STATE | CENTERED(md) + STACK(center) | `py: space-8; text-align: center` |

### Breakpoints

**Desktop (>1024px):**
- Sidebar: 280px fisso, sticky
- Grid: 3 colonne
- Results header: inline

**Tablet (768-1024px):**
- Sidebar: collassa in drawer (toggle button)
- Grid: 2 colonne
- Results header: stack parziale

**Mobile (<768px):**
- Sidebar: drawer overlay (bottone "Filters" in results header)
- Grid: 1 colonna (card full-width)
- Results header: stack verticale
- Pagination: simplified (prev/next)

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `HEADER.title` | testo | "Products" |
| `HEADER.breadcrumbs` | links | Home > Products |
| `FILTERS.groups[]` | filter group | Category, Price, Rating |
| `FILTERS.search` | boolean | true |
| `RESULTS.sort_options` | options | "Relevance, Price, Newest" |
| `RESULTS.view_toggle` | `grid` \| `list` | `grid` |
| `GRID.columns` | 2 \| 3 \| 4 | 3 |
| `CARD.layout` | `vertical` \| `horizontal` | `vertical` |
| `PAGINATION.type` | `numbered` \| `load-more` \| `infinite` | `numbered` |
| `EMPTY.message` | testo | "No results found" |
| `EMPTY.action` | testo + link | "Clear filters" |

---

## top-filters

```
NAV
CONTAINER(lg)
  └── STACK(gap: space-4)
        ├── page header
        ├── filter bar (horizontal scroll, chips/pills)
        ├── results header
        ├── GRID(columns: 3)
        └── pagination
FOOTER
```

Filtri: `display: flex; gap: space-2; overflow-x: auto; padding: space-3 0`

---

## map-list

```
NAV
SPLIT(ratio: 1:1)
  ├── left: mappa (sticky, height: calc(100vh - 64px))
  └── right: STACK(gap: space-3)
              ├── search + filters
              ├── results count
              ├── STACK(gap: space-3) → card list (no grid, vertical list)
              └── load more
```

Mappa: `position: sticky; top: 64px; height: calc(100vh - 64px)`

# Wireframe: Management Page

Amministrazione, operazioni bulk, data tables.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **table** | Data table con toolbar | User lists, ordini, log |
| **card-grid** | Grid di card selezionabili | Media library, prodotti |
| **kanban** | Colonne drag-and-drop | Task, pipeline, workflow |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
table:     { trust: 0.6, innovation: 0.3, formality: 0.7, warmth: 0.3, playfulness: 0.1, density: 0.7 }
card-grid: { trust: 0.5, innovation: 0.5, formality: 0.4, warmth: 0.5, playfulness: 0.4, density: 0.5 }
kanban:    { trust: 0.5, innovation: 0.6, formality: 0.4, warmth: 0.5, playfulness: 0.4, density: 0.5 }
```

---

## table (default)

### Composizione

```
NAV (con sidebar opzionale per admin)
CONTAINER(xl → 1400px)
  └── STACK(gap: space-4)
        ├── page header
        │     └── SPLIT(ratio: 2:1)
        │           ├── left: title + count ("Users (1,234)")
        │           └── right: primary action button ("Add user")
        ├── toolbar
        │     └── SPLIT(ratio: 2:1)
        │           ├── left: search input + filter buttons
        │           └── right: view options + export
        ├── bulk action bar (hidden, shown when items selected)
        │     └── "3 selected" + action buttons + "Select all" + "Deselect"
        ├── data table
        │     ├── header row (sortable columns)
        │     └── data rows (checkbox + columns + row actions)
        └── pagination
              └── SPLIT(ratio: 1:1:1)
                    ├── left: "Showing 1-25 of 1,234"
                    ├── center: page numbers
                    └── right: page size selector
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | PAGE HEADER | SPLIT | `py: space-4; align-items: center` |
| 2 | TOOLBAR | SPLIT | `py: space-3; gap: space-3; border-bottom` |
| 3 | SEARCH | — | `width: 320px; height: 40px; padding-left: 40px (icon)` |
| 4 | BULK BAR | — | `py: space-3; px: space-4; background: primary-light; border-radius: radius-sm; display: flex; align-items: center; gap: space-3` |
| 5 | TABLE | — | `width: 100%; border-collapse: collapse` |
| 6 | TABLE HEAD | — | `background: surface; font-size: text-sm; font-weight: 600; text-align: left; py: space-3; px: space-4; border-bottom: 2px` |
| 7 | TABLE ROW | — | `border-bottom: 1px; py: space-3; px: space-4; transition: background`. Hover: `background: surface-hover` |
| 8 | ROW ACTIONS | — | `display: flex; gap: space-2; opacity: 0; row:hover opacity: 1` |
| 9 | STATUS BADGE | — | `display: inline-flex; px: space-2; py: 2px; border-radius: radius-full; font-size: text-xs; font-weight: 500` |
| 10 | PAGINATION | SPLIT(3-way) | `py: space-4; border-top; align-items: center; font-size: text-sm` |

### Table Column Guidelines

```css
/* Checkbox column */
th:first-child, td:first-child {
  width: 48px;
  text-align: center;
}

/* Columns: max 5-7 visible */
/* Most important = leftmost */
/* Actions column = rightmost, width: auto */

/* Sortable header */
th[data-sortable] {
  cursor: pointer;
  user-select: none;
}
th[data-sortable]:hover {
  color: var(--color-primary);
}
```

### Breakpoints

**Desktop (>1024px):**
- Table: full columns, row actions on hover
- Toolbar: inline

**Tablet (768-1024px):**
- Table: hide 2-3 colonne meno importanti
- Row actions: sempre visibili (icon buttons)
- Toolbar: stack parziale

**Mobile (<768px):**
- Table → card list (ogni riga diventa una card)
- Card: `padding: space-4; border: 1px solid border; border-radius: radius-md; margin-bottom: space-3`
- Toolbar: search full-width, filters in dropdown
- Bulk actions: floating bottom bar

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `HEADER.title` | testo | "Users" |
| `HEADER.count` | number | 1234 |
| `HEADER.action` | testo + handler | "Add user" |
| `TOOLBAR.search` | boolean | true |
| `TOOLBAR.filters[]` | filter | Status, Role, Date |
| `TOOLBAR.export` | boolean | true |
| `TABLE.columns[]` | column config | Name, Email, Role, Status, Date |
| `TABLE.columns[].sortable` | boolean | true |
| `TABLE.columns[].width` | CSS width | auto |
| `TABLE.row_actions[]` | action | Edit, Delete |
| `TABLE.selectable` | boolean | true |
| `PAGINATION.page_sizes` | number[] | [10, 25, 50, 100] |

---

## card-grid

```
NAV
CONTAINER(xl)
  └── STACK(gap: space-4)
        ├── page header (title + count + add button)
        ├── toolbar (search + filters + view toggle)
        ├── bulk bar (when selected)
        ├── GRID(columns: 4, collapse: tablet→3, mobile→2)
        │     └── selectable cards (checkbox overlay + thumbnail + title + meta)
        └── pagination / load more
```

---

## kanban

```
NAV
CONTAINER(full)
  └── STACK(gap: space-3)
        ├── page header (title + add button)
        └── kanban board
              └── display: flex; gap: space-4; overflow-x: auto; padding: space-4
                    ├── column: STACK(gap: space-3)
                    │     ├── column header (title + count + add)
                    │     └── STACK(gap: space-2) → draggable cards
                    ├── column...
                    └── column...
```

Colonne: `min-width: 300px; max-width: 350px; background: surface; border-radius: radius-md; padding: space-3`

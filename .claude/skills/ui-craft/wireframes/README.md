# Wireframe System

Il ponte tra "quali blocchi servono" e "come posizionarli in CSS".

---

## Come funziona

1. **Primitives** (`primitives.md`) — blocchi layout riusabili (STACK, GRID, SPLIT, SIDEBAR, CENTERED, HERO)
2. **Wireframe per archetipo** (`entry.md`, `discovery.md`, ...) — composizione di primitives in layout pagina
3. **Template HTML** (`templates/archetypes/*.html`) — implementazione concreta del wireframe

```
primitives.md       → vocabolario (i mattoni)
[archetype].md      → composizione (il progetto)
[archetype].html    → implementazione (la costruzione)
```

---

## Flusso

```
system.md (tokens) + wireframe (struttura) → template HTML (pagina completa)
```

Quando `/ui-craft build [type]` viene eseguito:
1. Legge `system.md` per tokens (colori, font, spacing)
2. Legge `wireframes/[type].md` per la struttura
3. Usa `templates/archetypes/[type].html` come base
4. Personalizza con contenuto specifico del progetto
5. Output: pagina completa nel progetto

---

## Primitives vs Archetypes

| Primitives | Archetypes |
|------------|------------|
| Blocchi generici | Composizioni specifiche |
| `SPLIT`, `GRID`, `STACK` | Entry, Discovery, Detail |
| Riusabili ovunque | Una per tipo di pagina |
| CSS puro | HTML + CSS + contenuto |

---

## Condivisione con video-craft

I primitives sono il vocabolario condiviso. video-craft mappa i suoi layout modes:

| video-craft | ui-craft primitive |
|------------|-------------------|
| `hero` | HERO |
| `centered` | CENTERED |
| `stacked` | STACK |
| `split` | SPLIT |
| `card-column` | STACK (cards) |
| `card-row` | GRID (1 riga) |
| `card-grid` | GRID (multi) |

---

## Breakpoint Convention

Usata in tutti i wireframe:

| Nome | Range | Comportamento |
|------|-------|---------------|
| Mobile | < 768px | Stack singola colonna, full-width buttons |
| Tablet | 768px - 1024px | 2 colonne dove possibile, spacing ridotto |
| Desktop | > 1024px | Layout completo, max-width containers |

# `/emmet map` — Functional Map

## Purpose

Analizza il 100% della codebase e produce una mappa funzionale completa: schermate, azioni utente, transizioni di stato, personas, use cases e workflow diagrams.

**Output:** `.claude/docs/functional-map.md`

---

## Trigger

```
/emmet map
/emmet map --update
```

- Senza flag: genera la map da zero
- `--update`: rigenera la map (da usare dopo nuove feature o refactoring)

---

## Workflow

### Step 1: Detect Project Structure

```
1. Identifica stack (HTML/JS/TS/React/Vue/Svelte/etc.)
2. Trova entry point(s) (index.html, App.tsx, main.ts, etc.)
3. Determina pattern di routing (file-based, SPA hash, framework router)
```

### Step 2: Scan Screens/Views

Cerca in HTML/JSX/template files:

| Pattern | Cosa indica |
|---------|-------------|
| `id="..."` su container principali | Screen/view |
| `data-screen`, `data-view`, `data-page` | Screen esplicito |
| Route definitions (`path: "/..."`) | View con routing |
| `.screen`, `.page`, `.view` CSS classes | Screen per convenzione |
| Componenti top-level in router | View in SPA |
| File in `pages/`, `views/`, `screens/` dirs | View per struttura |

Per ogni screen trovato, documenta:
- Nome identificativo
- File e selettore/componente
- Se e entry point (default visible)
- Elementi interattivi (vedi Step 3)

### Step 3: Scan User Actions

Per ogni screen, cerca interazioni utente:

| Pattern | Tipo azione |
|---------|-------------|
| `addEventListener('click', ...)` | Click |
| `onclick="..."`, `@click="..."` | Click (inline) |
| `<button>`, `<a>`, `[role="button"]` | Click target |
| `<input>`, `<textarea>`, `<select>` | Input |
| `addEventListener('submit', ...)` | Form submit |
| `addEventListener('drag*', ...)` | Drag & drop |
| `addEventListener('key*', ...)` | Keyboard |
| `addEventListener('scroll', ...)` | Scroll |
| `<input type="range">`, slider components | Slider |
| Collapsible/accordion patterns | Toggle |

Per ogni azione, documenta:
- Elemento trigger (selettore + testo visibile)
- Tipo di azione (click, input, drag, etc.)
- Handler function chiamata
- Effetto (navigazione, state change, API call, UI update)

### Step 4: Scan State Transitions

Ricostruisci il grafo di navigazione:

| Pattern | Transizione |
|---------|-------------|
| `navigateTo(...)`, `router.push(...)` | Navigazione esplicita |
| `window.location`, `history.pushState` | Navigazione browser |
| `show/hide` pattern (display, visibility, class toggle) | Screen switch SPA |
| `setState`, store mutations | State change |
| CSS class toggle (`.active`, `.visible`, `.hidden`) | Visual state |
| Modal open/close | Overlay transition |

Genera diagramma Mermaid:
```mermaid
graph TD
  SCREEN_A -->|"azione"| SCREEN_B
  SCREEN_B -->|"azione"| SCREEN_C
```

### Step 5: Derive Personas

Analizza i flussi trovati e genera personas basate su:

| Indicatore | Persona trait |
|------------|--------------|
| Flusso breve (2-3 step) | Utente casuale, bassa tolleranza |
| Flusso con opzioni avanzate | Utente esperto |
| Flusso con editing/customizzazione | Power user / creativo |
| Flusso con admin/settings | Amministratore |
| Flusso con export/share | Utente collaborativo |

Per ogni persona:
- Nome descrittivo
- Goal principale
- Flusso tipico (sequenza di screen)
- Touchpoints critici (dove puo bloccarsi)
- Tolleranza errori (Bassa/Media/Alta)

### Step 6: Generate Use Cases

Per ogni flusso significativo:

```markdown
### UC-NNN: [Titolo]
- **Persona:** [quale persona]
- **Precondizioni:** [stato iniziale richiesto]
- **Flusso principale:**
  1. [Step 1]
  2. [Step 2]
  ...
- **Flussi alternativi:**
  - Na. [Alternativa]
- **Ultimo test:** mai — NON TESTATO
```

Convenzione numerazione:
- UC-001 a UC-099: Flussi core
- UC-100 a UC-199: Flussi secondari
- UC-200+: Edge cases

### Step 7: Generate Workflow Diagrams

Per i flussi piu complessi, genera diagrammi:

```
Preferenza: Mermaid graph/sequenceDiagram
Fallback: ASCII art
```

Includere:
- Flusso principale con decision points
- Branching per errori/fallback
- Punti di integrazione esterna (API, DB)

### Step 8: Assemble Map

Usa il template in `templates/functional-map.md` per assemblare il documento finale.

Salva in: `.claude/docs/functional-map.md`

---

## Regole

1. **Scan completo** — Non fermarsi ai file "principali". Scansionare TUTTI i file del progetto (escludendo node_modules, .git, build artifacts).
2. **Evidenza nel codice** — Ogni elemento nella map deve avere un riferimento `file:line` verificabile.
3. **Non inventare** — Se un flusso non e chiaro dal codice, segnalarlo come `[DA VERIFICARE]` piuttosto che indovinare.
4. **Stato test iniziale** — Alla prima generazione, tutti gli use case hanno `Ultimo test: mai — NON TESTATO`.
5. **Mermaid valido** — I diagrammi Mermaid devono essere sintatticamente corretti.
6. **Aggiornamento incrementale** — Con `--update`, mantenere lo stato test esistente per use case non modificati. Solo i nuovi use case hanno stato `NON TESTATO`.

---

## Post-Map Convenzione

Dopo aver generato/aggiornato la map, informare l'utente:

> Map funzionale generata in `.claude/docs/functional-map.md`.
> Trovate N schermate, N use cases, N personas.
> Use cases non testati: N
>
> Per eseguire il ciclo QA completo: `/emmet test`
> Per solo analisi statica: `/emmet test --static`
> Per solo test browser: `/emmet test --browser`

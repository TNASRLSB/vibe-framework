# Spec: Framework Onboarding e Request Log

## Cosa sto costruendo

Due funzionalità per migliorare l'esperienza utente del framework:

1. **First-run onboarding**: Al primo avvio su un nuovo progetto, il framework si presenta e spiega cos'è, rimandando a `.claude/README.md`

2. **Request log**: Registro incrementale di tutte le richieste utente con data, ora, tipologia, riferimento al documento di progetto, e stato

---

## File da modificare

| File | Modifica |
|------|----------|
| `CLAUDE.md` | Aggiungere sezione "First Run Detection" e "Request Logging" |
| `.claude/docs/request-log.md` | Nuovo file - registro incrementale delle richieste |

---

## Dettagli implementazione

### 1. First-run detection

**Logica**: Se `registry.md` ha tutte le sezioni vuote (solo header senza contenuto), è un progetto nuovo.

**Comportamento al primo avvio**:
- Claude si presenta
- Spiega brevemente cos'è il framework
- Indica di leggere `.claude/README.md` per i dettagli
- Non esegue altre azioni finché l'utente non capisce cosa ha davanti

**Aggiunta a CLAUDE.md**:
```markdown
## First Run (New User)

When I detect this is the first session (registry is empty AND no request-log.md exists):

**BEFORE doing anything else**, I MUST:

1. Greet the user and introduce myself:
   > "Ciao! Questo progetto usa il **Claude Development Framework** — un sistema operativo che mi aiuta a lavorare meglio.
   >
   > Il framework include skill specializzate per UI, development patterns, sicurezza, SEO/copywriting, video e audio.
   >
   > Per capire come funziona, leggi `.claude/README.md`. Lì trovi tutto: setup, comandi, skill disponibili."

2. Ask the user to confirm they've read (or want to skip) before proceeding with any other request.

**This takes priority over ANY user request on first run.**
```

### 2. Request Log

**File**: `.claude/docs/request-log.md`

**Struttura**:
```markdown
# Request Log

Registro incrementale di tutte le richieste gestite dal framework.

---

## Log

| # | Data | Ora | Tipologia | Descrizione | Doc riferimento | Stato |
|---|------|-----|-----------|-------------|-----------------|-------|
| 1 | 2024-01-15 | 14:30 | Feature | Aggiungere dark mode | specs/dark-mode.md | completato |
| 2 | 2024-01-15 | 15:45 | Bug fix | Fix login timeout | - | completato |
| 3 | 2024-01-16 | 09:00 | Refactoring | Migrazione a TypeScript | specs/migration-typescript.md | in sospeso |
```

**Tipologie richieste**:
- `Feature` — Nuova funzionalità
- `Bug fix` — Correzione bug
- `Refactoring` — Ristrutturazione codice
- `Research` — Ricerca/analisi
- `Config` — Configurazione
- `Doc` — Documentazione

**Stati**:
- `in sospeso` — Pianificato con documento di progetto, non iniziato
- `in corso` — Lavoro avviato
- `completato` — Tutti i task del documento di progetto completati
- `annullato` — Richiesta annullata dall'utente

**Regola per CLAUDE.md**:
```markdown
## Request Logging

**EVERY user request that requires work** (not just questions) gets logged in `.claude/docs/request-log.md`.

When I receive a request:
1. Add entry to log with status `in corso`
2. If non-trivial, create spec first → update log with spec reference
3. When complete, update status to `completato`

**Excluded from logging:**
- Simple questions ("what is X?")
- Requests to read files
- Status checks
- Conversation clarifications

**Logged:**
- Feature requests
- Bug fixes
- Refactoring tasks
- Configuration changes
- Any task that modifies files
```

---

## Come verifico che funzioni

1. **First run**: Copio il framework in un progetto vuoto → Claude si presenta invece di eseguire la richiesta
2. **Request log**:
   - Faccio una richiesta → appare nel log con stato `in corso`
   - Completo il task → stato cambia in `completato`
   - Richiesta non-trivial → appare anche il riferimento alla spec

---

## Note

- Il log è incrementale: mai cancellare voci precedenti
- Il numero progressivo (#) aiuta a riferirsi a richieste passate
- Se una richiesta genera una spec, il link va nella colonna "Doc riferimento"

# Spec: Emmet Test — Riscrittura per Test Profondi

**Data:** 2026-03-09
**Tipo:** Feature improvement (major)
**Stato:** completato 2026-03-09
**Sostituisce:** `emmet-test-polyglot-patterns.md` (mai proceduta)

---

## Cosa sto facendo

Riscrivo `testing/dynamic.md` e `prompts/test.md` perché i test generati da `/emmet test --functions` sono superficiali. Emmet resta **agnostica** — si adatta a qualsiasi progetto. Cambiano i **principi** che guidano la generazione dei test.

---

## Principi da integrare (derivati da test e2e production-grade)

### P1. Profondità, non larghezza
Ogni test deve verificare: stato iniziale → azione → risultato → side-effects. Minimo 3 assertions per test. Un test con 1 `expect` è quasi sempre insufficiente.

### P2. Copertura esaustiva delle entità
Se la map identifica N entità ripetute (prodotti, utenti, corsi, pagine), testare TUTTE con loop parametrizzato. Mai campionare. Le entità vanno estratte dalla map come costanti tipizzate in cima al file.

### P3. Flow multi-step reali
I test devono coprire sequenze complete: fill → submit → wait feedback → verificare stato → continue → verificare stato successivo. Non fermarsi al primo click.

### P4. Data integrity via API (~30% dei test)
Usare `apiFetch()` per verificare che i dati dietro l'UI siano completi, corretti, e consistenti tra entità. Struttura dati, campi obbligatori, relazioni.

### P5. Graceful timeout per elementi opzionali
Elementi obbligatori: `expect().toBeVisible()` (fail se mancante). Elementi opzionali: `.isVisible({timeout}).catch(() => false)` (non fallire, ma reportare).

### P6. Bug regression dedicato
Se il progetto ha bugs noti (bugs.md, issues), generare un describe block per ogni bug con test che verifica il fix.

### P7. Report hooks obbligatori
Ogni file test generato DEVE includere afterEach/afterAll hooks per report real-time. Non opzionale.

### P8. Costanti tipizzate estratte dalla map
Le entità della map diventano array/oggetti tipizzati. Helper functions per generare ID, slug, label localizzate. Zero hardcoding nei test body.

### P9. Naming convention
`"[entità/area] -- [comportamento sotto test]"` con double-dash separator.

### P10. Due modalità, due backend
- **`--functions`** — Le funzionalità funzionano? Playwright runner (`npx playwright test`). Assertions programmatiche, report hooks, CI/CD.
- **`--personas`** — Com'è l'esperienza utente? Claude naviga il browser via `@playwright/mcp`, vede screenshot, si immedesima nelle personas della map e giudica UX, UI, workflow, frustrazioni, aspettative.
Due comandi Emmet separati con scopi e backend distinti.

---

## Diagnosi: cosa non funziona oggi

| Problema attuale | Principio che lo risolve |
|-----------------|--------------------------|
| Esempi toy-level (click → check text) | P1, P3 |
| Nessuna guida sulla profondità | P1 |
| Campionamento implicito | P2 |
| Nessuna estrazione costanti | P8 |
| Pattern interazione semplicistici | P3 |
| Test fragili (no graceful timeout) | P5 |
| Modalità automatizzata e esperienziale mischiate | P10 |
| Report hooks suggeriti ma non imposti | P7 |
| Bug non coperti | P6 |
| Nessun data integrity testing | P4 |

---

## Cosa cambia

### 1. `testing/dynamic.md` — Riscrittura ~70%

**Rimuovere:**
- Sezione BrowserMCP confusa (sostituita da due modalità chiare)
- Esempi toy-level generici

**Aggiungere (sezioni nuove):**
- **§ Test Depth Rules** — P1: min 3 assertions, stato→azione→risultato→side-effects
- **§ Exhaustive Entity Coverage** — P2: loop su tutte le entità, costanti in cima, mai campionare
- **§ Data Constants Extraction** — P8: come estrarre dalla map e tipizzare (agnostico: array di oggetti con id/name/expected)
- **§ Multi-Step Flow Patterns** — P3: pattern generici per form, CRUD, navigation chain, workflow con stati intermedi
- **§ Graceful Timeout Patterns** — P5: obbligatorio vs opzionale, `.catch(() => false)`, screenshot on timeout
- **§ API Data Integrity** — P4: pattern per verificare struttura, completezza, consistency
- **§ Bug Regression Group** — P6: come generare test da bugs noti
- **§ Report Hooks Obbligatori** — P7: setupReportHooks() in helpers.ts, enforcement
- **§ Naming Convention** — P9: double-dash separator
- **§ Single-File vs Multi-File** — Guida: monolitico per <100 test, multi-file per >100

**Riscrivere:**
- Tutti gli esempi con pattern profondi ma agnostici (non legati a un progetto specifico)
- Completeness Checklist con le nuove categorie

### 2. `prompts/test.md` — Aggiornamento step 3

- Step 3c: aggiungere regole P1-P9 come checklist prima di generare ogni test
- Nuovo sotto-step: estrazione costanti dalla map
- Nuovo sotto-step: generazione bug regression se bugs.md esiste
- Output atteso: test densi, non scheletrici

### 3. `testing/report-template.md` — Fix minori

- Rimuovere riferimento a `/emmet journey`

### 4. `SKILL.md` + `KNOWLEDGE.md` — Aggiornare BrowserMCP → due modalità (`--functions` automatizzato, `--personas` esperienziale con `@playwright/mcp`)

---

## Cosa NON cambia

- Architettura single-window fixture
- Helper functions (waitForPage, apiFetch, screenshot)
- functional-map come source of truth
- static.md, unit.md
- Flusso map → test → report → update map

---

## Come verifico

1. Ogni sezione nuova ha pattern concreti ma agnostici (applicabili a e-commerce, SaaS, blog, app)
2. Gli esempi sono multi-assertion, multi-step
3. Due modalità test chiaramente separate (`--functions` e `--personas`)
4. Coerenza dynamic.md ↔ prompts/test.md ↔ SKILL.md

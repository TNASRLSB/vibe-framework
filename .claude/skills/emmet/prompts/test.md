# `/emmet test` — Full QA

## Purpose

Comando unico per il ciclo completo di test e QA. Combina analisi statica e test browser, usando la functional map come source of truth per sapere **cosa** testare.

---

## Trigger

```
/emmet test              → Ciclo completo: static + browser
/emmet test --static     → Solo analisi statica (veloce, no browser)
/emmet test --browser    → Solo test browser (Playwright o BrowserMCP)
```

---

## Prerequisito: Functional Map

`/emmet test` richiede `.claude/docs/functional-map.md` per sapere cosa testare.

- Se la map **esiste**: la legge e usa gli use cases come guida
- Se la map **non esiste**: avvisa l'utente e suggerisce `/emmet map` prima

```
⚠ Functional map non trovata. Esegui `/emmet map` per generare la mappa funzionale.
Proseguo con analisi generica basata sul codice (meno precisa).
```

In assenza di map, il test ricade sul comportamento legacy: scan generico basato su pattern di codice.

---

## Flusso di Esecuzione

### `/emmet test` (completo)

```
1. LEGGI MAP
   → Carica .claude/docs/functional-map.md
   → Estrai lista use cases con stato test

2. ANALISI STATICA
   → Esegui scan statico (vedi testing/static.md)
   → Security → Logic → Error Handling → Performance → Code Quality
   → Documenta issue trovati

3. TEST BROWSER
   → Per ogni use case nella map:
     a. Genera/aggiorna test script se non esiste
     b. Esegui test (Playwright o BrowserMCP)
     c. Cattura evidenze (screenshot, log, errori)

4. AGGIORNA MAP
   → Per ogni use case testato, aggiorna stato:
     "Ultimo test: YYYY-MM-DD HH:MM — [backend] — PASS/FAIL"

5. GENERA REPORT
   → Assembla report finale in .claude/docs/test-report.md
   → Mostra summary all'utente
```

### `/emmet test --static`

Solo step 2. Non richiede browser, non richiede map (ma la usa se disponibile per scope).

```
1. (Opzionale) LEGGI MAP → identifica file/scope rilevanti
2. ANALISI STATICA → scan completo da testing/static.md
3. GENERA REPORT → solo sezione analisi statica
```

### `/emmet test --browser`

Solo step 3. Richiede map per sapere quali flussi testare.

```
1. LEGGI MAP → estrai use cases
2. TEST BROWSER → esegui test per ogni use case
3. AGGIORNA MAP → stato test
4. GENERA REPORT → solo sezione browser test
```

---

## Backend Browser

| Backend | Detection | Caratteristiche |
|---------|-----------|-----------------|
| **Playwright** (default) | `npx playwright --version` disponibile | Headless, veloce, CI-friendly, assertions DOM |
| **BrowserMCP** | MCP server `browser` disponibile | Browser reale, Claude "vede" la pagina, assertions visive |

### Auto-detection

```
1. Verifica se BrowserMCP e configurato come MCP server
2. Se si → usa BrowserMCP per visual assertions
3. Se no → usa Playwright
4. Se nessuno disponibile → suggerisci installazione Playwright
```

### Quando usare quale

| Scenario | Backend consigliato |
|----------|---------------------|
| CI/CD, regression automatizzati | Playwright |
| Visual regression, UX validation | BrowserMCP |
| Test rapidi durante sviluppo | Playwright |
| Debugging interattivo | BrowserMCP |
| Test cross-browser | Playwright |

---

## Analisi Statica — Riferimento

Segue le regole complete in `testing/static.md`. Sintesi:

### Ordine di scan (CRITICAL first)

1. **Security** — Hardcoded secrets, injection, XSS, command injection
2. **Logic** — Off-by-one, null checks, race conditions
3. **Error Handling** — Empty catch, swallowed errors, missing catch
4. **Performance** — N+1 queries, memory leaks, sync in async
5. **Code Quality** — Deep nesting, long functions, magic numbers

### Output per issue

```markdown
### [SEVERITY] Titolo Issue

**File:** `path/to/file:line`
**Category:** [categoria]
**Problem:** [descrizione]
**Fix:** [suggerimento]
**Impact:** [conseguenze se non fixato]
```

---

## Test Browser — Riferimento

Segue le regole complete in `testing/dynamic.md`. Integrazione con map:

### Per ogni Use Case nella map

```
1. Leggi UC-NNN → estrai flusso principale + flussi alternativi
2. Genera test script Playwright basato su:
   - Screen di partenza (precondizioni)
   - Sequenza azioni dal flusso principale
   - Assertions su ogni step (elemento visibile, stato corretto)
   - Flussi alternativi come test case separati
3. Esegui
4. Cattura evidenze su failure
5. Aggiorna stato nella map
```

### Assertions Strategy

| Cosa verificare | Come |
|-----------------|------|
| Screen visibile | `expect(locator).toBeVisible()` |
| Testo corretto | `expect(locator).toHaveText(...)` |
| Navigazione avvenuta | `expect(page).toHaveURL(...)` |
| Elemento abilitato/disabilitato | `expect(locator).toBeEnabled()` / `.toBeDisabled()` |
| Stato cambiato | `expect(locator).toHaveClass(...)` |
| API chiamata | `page.waitForResponse(...)` |

---

## Aggiornamento Map

Dopo ogni esecuzione, `/emmet test` aggiorna `functional-map.md`:

### Per ogni Use Case testato

Sostituisci la riga `Ultimo test:` con il risultato:

```markdown
- **Ultimo test:** 2026-02-10 14:30 — Playwright — PASS
```

oppure:

```markdown
- **Ultimo test:** 2026-02-10 14:30 — Playwright — FAIL (BUG-SEC-001)
```

### Coverage Summary

Aggiorna la tabella Coverage Summary alla fine della map:

```markdown
| Metrica | Valore |
|---------|--------|
| Use cases testati | N |
| Use cases NON testati | M |
| Use cases PASS | P |
| Use cases FAIL | F |
```

---

## Report Finale

Usa il template in `testing/report-template.md`. Include:

1. **Executive Summary** — conteggi per severity
2. **Static Analysis Results** — issue trovati per categoria
3. **Browser Test Results** — stato per use case
4. **Bug Details** — dettaglio per ogni bug con evidenze
5. **Recommendations** — must fix / should fix / nice to have
6. **Coverage** — use cases testati vs non testati (da map)

---

## Post-Test Output

Dopo l'esecuzione, mostra all'utente:

```
QA completata.

Analisi statica: N issue (C critical, H high, M medium, L low)
Test browser: N use cases testati (P pass, F fail)
Coverage: X% use cases testati

Report: .claude/docs/test-report.md
Map aggiornata: .claude/docs/functional-map.md
```

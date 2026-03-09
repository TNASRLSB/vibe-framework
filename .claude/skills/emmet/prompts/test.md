# `/emmet test` — Full QA

## Purpose

Comando unico per il ciclo completo di test e QA. Combina analisi statica, test funzionali automatizzati, test esperienziali per persona, e unit test, usando la functional map come source of truth.

---

## Trigger

```
/emmet test              → Ciclo completo: static + functions + unit
/emmet test --static     → Solo analisi statica (veloce, no browser)
/emmet test --functions  → Test funzionali automatizzati (Playwright runner)
/emmet test --personas   → Test esperienziale (Claude naviga via @playwright/mcp)
/emmet test --unit       → Solo unit test funzioni pure (da map)
```

---

## Prerequisito: Functional Map

`/emmet test` richiede `.emmet/functional-map.md` per sapere cosa testare.

- Se la map **esiste**: la legge e usa use cases, personas, entità come guida
- Se la map **non esiste**: avvisa l'utente e suggerisce `/emmet map` prima

```
⚠ Functional map non trovata. Esegui `/emmet map` per generare la mappa funzionale.
Proseguo con analisi generica basata sul codice (meno precisa).
```

---

## Flusso: `/emmet test` (completo)

```
1. LEGGI MAP
   → Carica .emmet/functional-map.md
   → Estrai: use cases, personas, entità ripetute, API endpoints, pure functions

2. ANALISI STATICA
   → Esegui scan statico (testing/static.md)
   → Security → Logic → Error Handling → Performance → Code Quality
   → Documenta issue trovati

3. TEST FUNZIONALI (--functions)
   → Riferimento completo: testing/dynamic.md
   → a. DETECT STACK
   → b. SCAFFOLD e2e/ se mancante
   → c. ESTRAI COSTANTI dalla map (P8)
   → d. GENERA TEST applicando P1-P9 (vedi Checklist Generazione sotto)
   → e. ESEGUI npx playwright test
   → f. REPORT generato automaticamente dai hooks

4. UNIT TEST
   → Per ogni pure function nella map (P1 → P2 → P3):
     a. Leggi file sorgente
     b. Identifica dipendenze esterne da mockare
     c. Genera test (testing/unit.md)
     d. Esegui
     e. Cattura risultati

5. AGGIORNA MAP
   → Stato test per ogni UC e pure function

6. GENERA REPORT
   → Assembla in .emmet/test-report.md
   → Mostra summary
```

---

## Flusso: `/emmet test --static`

Solo step 2. Non richiede browser né map (ma la usa se disponibile per scope).

---

## Flusso: `/emmet test --functions`

Test automatizzati Playwright. Il cuore dei test funzionali.

```
1. LEGGI MAP
   → Estrai: use cases, entità ripetute, API endpoints, flag responsive/error, bug noti

2. DETECT STACK
   → Framework del progetto target (Next.js, Vite, Express, SvelteKit, etc.)
   → Determina: webServer command, porta, waitForPage logic

3. SCAFFOLD
   → Se e2e/ non esiste, genera struttura completa:
     - e2e/fixtures.ts (worker-scoped single-window — vedi dynamic.md)
     - e2e/helpers.ts (waitForPage, apiFetch, screenshot, setupReportHooks)
     - playwright.config.ts (sequential, single worker, no retries)
     - Se map ha auth UC → e2e/global-setup.ts + .auth/ in .gitignore
     - e2e/screenshots/

4. ESTRAI COSTANTI (P8)
   → Dalla map, genera costanti tipizzate:
     - Array di entità con id, name, expected values
     - Helper functions per ID, slug, label localizzate
     - Zero hardcoding nei test body

5. GENERA TEST — applicando la Checklist Generazione (sotto)
   → Per ogni area funzionale nella map → test file o describe block
   → TUTTI i file importano da ./fixtures, MAI da @playwright/test
   → TUTTI i file includono setupReportHooks() (P7)

6. ESEGUI
   → npx playwright test (sequential, single worker)

7. AGGIORNA MAP
   → Stato test per ogni UC

8. REPORT
   → Assemblato dal report hook output in e2e/report.md
```

### Checklist Generazione Test (P1-P9)

**Prima di scrivere ogni test, verificare:**

- [ ] **P1 Profondità** — Min 3 assertions: stato iniziale + azione + risultato + side-effects
- [ ] **P2 Esaustività** — Se ci sono N entità, loop su TUTTE. Costanti tipizzate in cima
- [ ] **P3 Multi-step** — Flow completi: fill → submit → feedback → stato finale → side-effects
- [ ] **P4 Data integrity** — ~30% dei test usano `apiFetch()` per verificare dati
- [ ] **P5 Graceful timeout** — Elementi obbligatori: `expect().toBeVisible()`. Opzionali: `.catch(() => false)` + report
- [ ] **P6 Bug regression** — Se bugs.md esiste → describe block per ogni bug aperto
- [ ] **P7 Report hooks** — `setupReportHooks(test)` in ogni file. Non opzionale
- [ ] **P8 Costanti** — Entità dalla map come array tipizzati, helper functions per derivati
- [ ] **P9 Naming** — `"[area] -- [comportamento]"` con double-dash

---

## Flusso: `/emmet test --personas`

Test esperienziale. Claude naviga il browser e giudica l'esperienza utente.

```
1. VERIFICA PREREQUISITI
   → @playwright/mcp disponibile come MCP server?
   → Se NO: suggerisci configurazione e interrompi
   → Se SI: procedi

2. LEGGI MAP
   → Estrai personas: profilo, obiettivi, aspettative, livello tecnico
   → Estrai use cases associati a ciascuna persona

3. PER OGNI PERSONA:
   a. IMMEDESIMAZIONE
      → Assumi mentalità, obiettivi, frustrazioni tipiche
      → Livello tecnico: quanto perdoni errori/complessità?

   b. NAVIGAZIONE
      → Usa @playwright/mcp per aprire browser
      → Per ogni UC della persona:
        - Naviga alla pagina iniziale
        - Screenshot → prima impressione (3 secondi)
        - Esegui flusso come farebbe la persona
        - Ad ogni step: screenshot + valutazione
        - Nota: confusioni, attese, frustrazioni, piaceri

   c. VALUTAZIONE (per ogni step)
      → First impression: capisco dove sono? cosa posso fare?
      → Usabilità: controlli dove me li aspetto? feedback chiaro?
      → Visual: gerarchia, coerenza, leggibilità
      → Workflow: lineare? passi inutili?
      → Frustrazioni: confusione, attese, rotture

   d. SCORING (1-5 per area)
      → Onboarding, Navigation, Core Task, Feedback,
        Error Recovery, Visual Clarity, Performance percepita

4. REPORT
   → Output: .emmet/personas-report.md
   → Riferimento completo: testing/experiential.md
   → Include: scores per persona, issues prioritizzati, verdict
```

---

## Flusso: `/emmet test --unit`

Solo unit test. Richiede map per sapere quali funzioni testare.

```
1. LEGGI MAP → estrai sezione Pure Functions
2. DETECT FRAMEWORK (testing/unit.md)
3. UNIT TEST per ogni funzione (P1 → P2 → P3):
   a. Leggi file sorgente
   b. Identifica dipendenze esterne
   c. Genera test (happy path + edge case dalla firma)
   d. Esegui
   e. Cattura risultati
4. AGGIORNA MAP
5. GENERA REPORT → solo sezione unit test
```

---

## Aggiornamento Map

Dopo ogni esecuzione, aggiorna `functional-map.md`:

### Per ogni Use Case testato

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Playwright — PASS
```

o:

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Playwright — FAIL (BUG-SEC-001)
```

### Per ogni Persona testata

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — @playwright/mcp — Score medio: 3.8/5
```

### Coverage Summary

```markdown
| Metrica | Valore |
|---------|--------|
| Use cases testati (functions) | N |
| Use cases NON testati | M |
| Personas testate | N |
| Personas NON testate | M |
| Pure functions testate | N |
| Pure functions NON testate | M |
```

---

## Analisi Statica — Riferimento

Segue `testing/static.md`. Ordine: Security → Logic → Error Handling → Performance → Code Quality.

---

## Assertions Strategy (--functions)

| Cosa verificare | Come |
|-----------------|------|
| Screen visibile | `expect(locator).toBeVisible()` |
| Testo corretto | `expect(locator).toHaveText(...)` |
| Navigazione | `expect(page).toHaveURL(...)` |
| Abilitato/disabilitato | `expect(locator).toBeEnabled()` / `.toBeDisabled()` |
| Stato cambiato | `expect(locator).toHaveClass(...)` |
| Dati API | `apiFetch()` + `expect(res.status).toBe(200)` |

---

## Report Finale

Usa `testing/report-template.md`. Include:

1. **Executive Summary** — conteggi per severity
2. **Static Analysis Results** — issue per categoria
3. **Functional Test Results** — stato per use case (da hooks)
4. **Unit Test Results** — stato per pure function
5. **Bug Details** — dettaglio con evidenze
6. **Recommendations** — must fix / should fix / nice to have
7. **Coverage** — UC e pure functions testati vs non testati

Il report personas è separato: `.emmet/personas-report.md`

---

## Post-Test Output

```
QA completata.

Analisi statica: N issue (C critical, H high, M medium, L low)
Test funzionali: N use cases testati (P pass, F fail)
Unit test: N funzioni testate, M test totali (P pass, F fail)
Coverage: X% use cases, Y% pure functions

Report: .emmet/test-report.md
Map aggiornata: .emmet/functional-map.md
```

Per `--personas`:

```
Test esperienziale completato.

Personas testate: N
Score medio: X.X/5
Issues trovati: N (H high, M medium, L low)

Report: .emmet/personas-report.md
Map aggiornata: .emmet/functional-map.md
```

---
name: emmet
description: Testing, debugging, tech debt audit, and code quality checklists. Complete testing cycle with static analysis, dynamic Playwright tests, and unit tests for pure functions. Use when running tests, finding bugs, debugging code, auditing code quality, checking tech debt, doing code review, or pre-deploy checks. Triggers on 'test', 'debug', 'QA', 'tech debt', 'code review', 'pre-deploy', 'checklist', 'unit test'.
---

# Emmet Skill

## Purpose

Skill completa per testing, debugging e quality assurance con ciclo:

```
MAP → ANALISI → ESECUZIONE → REPORT
```

La **functional map** e la fonte di verita: descrive cosa fa l'app, chi la usa, quali flussi testare e quali funzioni pure verificare con unit test. Il testing usa la map per sapere **cosa** verificare.

## Commands

| Command | Description |
|---------|-------------|
| `/emmet map` | Analizza codebase, genera/aggiorna mappa funzionale |
| `/emmet test` | Ciclo QA completo: static + functions + unit |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --functions` | Test funzionali automatizzati (Playwright runner, assertions, CI-friendly) |
| `/emmet test --personas` | Test esperienziale (Claude naviga via @playwright/mcp, giudica UX/UI) |
| `/emmet test --unit` | Solo unit test funzioni pure (da map) |
| `/emmet fix` | Fix automatico dei bug trovati da test/techdebt/static |
| `/emmet techdebt [path]` | Audit tech debt (duplicazioni, export orfani, ecc.) |
| `/emmet checklist [type]` | Carica checklist (senza type: mostra opzioni disponibili) |
| `/emmet setup` | Analizza stack, genera pattern contestuali |

---

## `/emmet map`

Analizza il 100% della codebase e produce una mappa funzionale strutturata.

**Output:** `.emmet/functional-map.md`

**Comportamento smart:** Se la map esiste gia, preserva automaticamente lo stato test esistente (date, PASS/FAIL, bug ID). Non serve nessun flag.

**Cosa contiene la map:**
- **Screens/Views** — Tutte le schermate con elementi interattivi
- **State Transitions** — Grafo di navigazione (Mermaid)
- **Personas** — Derivate dalla complessita dei flussi
- **Use Cases** — Flussi principali e alternativi con stato test
- **Workflow Diagrams** — Diagrammi dei flussi complessi
- **Pure Functions** — Funzioni pure catalogate per priorita (P1/P2/P3) con firma, dipendenze e edge case
- **Coverage Summary** — Conteggio use cases e pure functions testati/non testati

**Workflow:**
1. Scansiona HTML/JSX per screen/container
2. Scansiona JS/TS per addEventListener, navigazione, state actions
3. Scansiona CSS per classi layout
4. Ricostruisce grafo transizioni di stato
5. Identifica punti di interazione utente
6. Mappa ogni interazione al codice che la gestisce
7. Genera personas dalla complessita dei flussi
8. Genera use cases con flussi principali e alternativi
9. Genera workflow diagrams
10. Scansiona funzioni pure esportate (utility, validatori, parser, calcoli)
11. Classifica per priorita (P1/P2/P3) e deriva edge case dalla firma
12. Assembla map con template

**Riferimento completo:** `prompts/map.md`

---

## `/emmet test`

Ciclo QA completo. Usa la functional map come guida per sapere cosa testare.

### Flag di scoping

| Comando | Cosa esegue |
|---------|-------------|
| `/emmet test` | Ciclo completo: static + functions + unit |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --functions` | Test funzionali automatizzati (Playwright runner) |
| `/emmet test --personas` | Test esperienziale (Claude naviga via @playwright/mcp) |
| `/emmet test --unit` | Solo unit test funzioni pure |

**Nota:** `--personas` non e incluso nel ciclo completo perche e qualitativo e lento. Va invocato esplicitamente quando serve una valutazione UX.

### Flusso completo (`/emmet test` senza flag)

```
1. Legge functional-map.md per sapere COSA testare
2. Esegue analisi statica (security, logic, performance, code quality)
3. Per ogni use case nella map:
   a. Genera/aggiorna test script
   b. Esegue test (Playwright runner)
   c. Cattura evidenze (screenshot, log, errori)
   d. Aggiorna stato test nella map
4. Per ogni pure function nella map (P1 → P2 → P3):
   a. Genera unit test (framework auto-detected)
   b. Esegue test
   c. Cattura risultati
   d. Aggiorna stato test nella map
5. Genera report finale in .emmet/test-report.md
```

### Due modalità di test browser

| Modalità | Backend | Scopo |
|----------|---------|-------|
| **`--functions`** | Playwright runner (`npx playwright test`) | Le funzionalità funzionano? Assertions programmatiche, CI/CD |
| **`--personas`** | `@playwright/mcp` (Claude naviga) | Com'è l'esperienza utente? Claude vede, giudica UX/UI/workflow |

### Analisi statica

Cerca: bug logici, pattern problematici, type errors, error handling incompleto, security issues, performance issues.

**Riferimento completo:** `testing/static.md`

### Test funzionali (`--functions`)

Test automatizzati Playwright. Principi P1-P9: profondità (min 3 assertions), copertura esaustiva entità, flow multi-step, data integrity via API, report hooks obbligatori.

**Riferimento completo:** `testing/dynamic.md`

### Test esperienziale (`--personas`)

Claude naviga il browser via `@playwright/mcp`, si immedesima nelle personas della map, valuta UX/UI/workflow con scoring 1-5 per area.

**Riferimento completo:** `testing/experiential.md`

### Unit test

Genera ed esegue unit test per le pure functions catalogate nella map. Auto-detect del framework (Jest/Vitest/pytest/go test/cargo test). Mock solo dipendenze esterne. Edge case derivati automaticamente dalla firma.

**Riferimento completo:** `testing/unit.md`

### Aggiornamento map

Dopo ogni esecuzione, aggiorna automaticamente lo stato test nella `functional-map.md`:

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Playwright — PASS
```

**Riferimento completo:** `prompts/test.md`

---

## `/emmet fix`

Fix automatico dei bug e problemi trovati da `/emmet test`, `/emmet techdebt`, o `/emmet test --static`.

**Sorgenti dati (in ordine di priorita):**
1. `.emmet/test-report.md` — Bug da ultimo ciclo test
2. `.emmet/techdebt-report.md` — Debito tecnico strutturale
3. `.claude/docs/bugs/bugs.md` — Bug noti senza `**Sistemato:**`

**Workflow:**
1. Legge i report disponibili
2. Ordina per severita: Critical → High → Medium → Low
3. Per ogni bug:
   a. Legge il file indicato
   b. Applica il fix
   c. Verifica che il fix non rompa altro (grep per side-effects)
   d. Marca come risolto nel report sorgente
4. Aggiorna `.claude/docs/bugs/bugs.md` con `**Sistemato:** completato [YYYY-MM-DD]`
5. Rigenera summary nel test report

**Limiti:** Non fixa bug che richiedono decisioni architetturali o cambio di interfaccia. Li segnala e chiede input.

---

## `/emmet techdebt [path]`

Audit del codebase per debito tecnico strutturale.

**Cosa cerca:**

1. **Funzioni duplicate o quasi-duplicate**
   - Funzioni con nome simile in file diversi
   - Blocchi di codice >5 righe ripetuti

2. **Export orfani**
   - Funzioni/costanti esportate ma mai importate
   - **CRITICO:** Cercare export nel `[path]` specificato, ma cercare import nell'INTERO codebase (escluso `node_modules/`, `.next/`, `dist/`, `build/`). Un export usato da `scripts/`, file root, o altre directory fuori scope NON è orfano

3. **Import non usati**
   - Import dichiarati ma mai referenziati

4. **Pattern ripetuti estraibili**
   - 3+ occorrenze dello stesso pattern
   - Suggerisce estrazione in utility

5. **File oversized**
   - File >300 righe con responsabilita multiple

**Output:** `.emmet/techdebt-report.md` (include **Debt Rating** A-F basato su Technical Debt Ratio)

**Procedura:**
1. Rileva stack (estensioni file)
2. Scan duplicazioni
3. Scan export/import (**scope import: intero codebase**, non solo `[path]`)
4. Scan pattern ripetuti
5. Scan file size
6. Calcola Debt Rating (vedi `templates/techdebt-report.md` per formula e soglie)
7. Genera report
8. Aggiorna registry se trova utility candidates

---

## `/emmet checklist [type]`

Carica checklist operativa.

**Senza type:** Mostra le opzioni disponibili e chiede quale caricare.

**Types disponibili:**
- `code-review` - Checklist per code review
- `pre-deploy` - Checklist pre-deployment
- `refactoring` - Checklist per refactoring sicuro
- `security` - Checklist sicurezza

**Riferimenti:** `checklists/`

---

## `/emmet setup`

Analizza il progetto e genera pattern stack-specific.

**Quando usarlo:**
- Prima sessione su progetto esistente
- Dopo cambio significativo dello stack
- Per rigenerare pattern aggiornati

**Stack Detection:**

| File | Stack |
|------|-------|
| `package.json` | Node.js |
| `requirements.txt` / `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` / `build.gradle` | Java/Kotlin |

**Output:**
- `.emmet/stacks/[stack-name]/patterns.md` - Pattern idiomatici
- `.emmet/stacks/[stack-name]/commands.md` - CLI commands
- `.emmet/stacks/[stack-name]/gotchas.md` - Errori comuni

**Workflow:**
1. DETECT STACK - Legge file di configurazione
2. ANALYZE STRUCTURE - Trova src/, lib/, app/
3. GENERATE PATTERNS - Crea pattern stack-specific
4. UPDATE CONFIG - Aggiorna `.claude/project-config.json`
5. REPORT - Output summary

---

## Deprecated Commands

| Comando | Sostituito da | Motivo |
|---------|---------------|--------|
| `/emmet plan` | `/emmet map` | La map include il test plan implicitamente (ogni UC = un test) |
| `/emmet journey [flow]` | `/emmet test --functions` | Il test funzionale usa la map come source of truth |
| `/emmet test --browser` | `--functions` / `--personas` | Separato in due modalita distinte |
| `/emmet map --update` | `/emmet map` | Comportamento smart automatico (preserva stato se map esiste) |
| `/emmet report` | `/emmet test` | Il report si genera automaticamente con il ciclo test |
| `/adapt-framework` | `/emmet setup` | Portato dentro il namespace emmet |

---

## Integrazione con Altre Skill

| Skill | Integrazione |
|-------|--------------|
| heimdall | Usa security checklist + pattern security da `.emmet/stacks/` |
| seurat | Usa test dinamici per verificare UI generata |
| orson | Usa test per verificare interattivita video |

---

## Confine con Seurat

- **seurat** = design system (token, spacing, colori, componenti come pattern visivi)
- **emmet map** = funzionalita (cosa fa l'utente, dove, con quale risultato)

Non c'e sovrapposizione: seurat descrive **come appare**, emmet descrive **cosa fa**.

---

## Directory Structure

Skill files are organized in: `prompts/`, `templates/`, `testing/`, and `checklists/`. Stack-specific patterns generated by `/emmet setup` are saved to `.emmet/stacks/`.

Key testing reference files:
- `testing/static.md` — Rules for static code analysis
- `testing/dynamic.md` — Rules for `--functions` (Playwright automated testing, principles P1-P9)
- `testing/experiential.md` — Rules for `--personas` (Claude navigates via @playwright/mcp, UX evaluation)
- `testing/unit.md` — Rules for unit test generation (pure functions)
- `testing/report-template.md` — Output template for test reports

---

For full functional map and testing knowledge base, see `KNOWLEDGE.md`.

---

## Security Pre-Check

Before running functional tests on newly written or modified code:

1. Launch Heimdall scan on the modified files as a subagent (Task tool)
2. If critical vulnerabilities found, report them before proceeding with tests
3. If clean, proceed with the test suite
4. Include security scan results in the test report summary

---
name: emmet
description: Testing, debugging, tech debt audit, and code quality checklists. Complete testing cycle with static analysis, dynamic Playwright tests, and unit tests for pure functions. Use when running tests, finding bugs, debugging code, auditing code quality, checking tech debt, doing code review, or pre-deploy checks. Triggers on 'test', 'debug', 'QA', 'tech debt', 'code review', 'pre-deploy', 'checklist', 'unit test'.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - TodoWrite
  - AskUserQuestion
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
| `/emmet map` | Analizza codebase, genera mappa funzionale completa |
| `/emmet map --update` | Rigenera la mappa funzionale |
| `/emmet test` | Ciclo QA completo: analisi statica + test browser + unit test |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --browser` | Solo test browser (Playwright o BrowserMCP) |
| `/emmet test --unit` | Solo unit test funzioni pure (da map) |
| `/emmet report` | Genera report bug da ultimo test |
| `/emmet techdebt [path]` | Audit tech debt (duplicazioni, export orfani, ecc.) |
| `/emmet checklist [type]` | Carica checklist (code-review, pre-deploy, refactoring, security) |
| `/adapt-framework` | Analizza stack, genera pattern contestuali |

---

## `/emmet map`

Analizza il 100% della codebase e produce una mappa funzionale strutturata.

**Output:** `.emmet/functional-map.md`

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

**Aggiornamento:** `/emmet map --update` rigenera la map mantenendo lo stato test esistente.

**Riferimento completo:** `prompts/map.md`

---

## `/emmet test`

Ciclo QA completo. Usa la functional map come guida per sapere cosa testare.

### Flag di scoping

| Comando | Cosa esegue |
|---------|-------------|
| `/emmet test` | Ciclo completo: static + browser + unit |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --browser` | Solo test browser (Playwright o BrowserMCP) |
| `/emmet test --unit` | Solo unit test funzioni pure |

### Flusso completo

```
1. Legge functional-map.md per sapere COSA testare
2. Esegue analisi statica (security, logic, performance, code quality)
3. Per ogni use case nella map:
   a. Genera/aggiorna test script
   b. Esegue test (Playwright o BrowserMCP)
   c. Cattura evidenze (screenshot, log, errori)
   d. Aggiorna stato test nella map
4. Per ogni pure function nella map (P1 → P2 → P3):
   a. Genera unit test (framework auto-detected)
   b. Esegue test
   c. Cattura risultati
   d. Aggiorna stato test nella map
5. Genera report finale in .emmet/test-report.md
```

### Backend browser

| Backend | Caratteristiche | Uso ideale |
|---------|-----------------|------------|
| **Playwright** (default) | Headless, veloce, CI-friendly | Regression, CI/CD, test automatizzati |
| **BrowserMCP** | Browser reale, Claude "vede" la pagina | Visual regression, UX validation |

Auto-detection: se BrowserMCP e configurato come MCP server, lo usa; altrimenti Playwright.

### Analisi statica

Cerca: bug logici, pattern problematici, type errors, error handling incompleto, security issues, performance issues.

**Riferimento completo:** `testing/static.md`

### Test browser

Simula utente reale basandosi sugli use cases della map. Ogni use case diventa uno o piu test script.

**Riferimento completo:** `testing/dynamic.md`

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

## `/emmet report`

Genera report strutturato dei bug trovati.

**Output:** `.emmet/test-report.md`

**Formato:**
```markdown
# Test Report - [YYYY-MM-DD]

## Summary
- Bug critici: N
- Bug high: N
- Bug medium: N
- Bug low: N

## Dettagli

### [BUG-001] Titolo bug
- **Severita:** Critical/High/Medium/Low
- **File:** path/to/file:line
- **Atteso:** Comportamento atteso
- **Ottenuto:** Comportamento ottenuto
- **Steps to reproduce:** (per bug dinamici)
- **Screenshot:** (se disponibile)
- **Fix suggerito:** Soluzione proposta
```

**Riferimento completo:** `testing/report-template.md`

---

## `/emmet techdebt [path]`

Audit del codebase per debito tecnico strutturale.

**Cosa cerca:**

1. **Funzioni duplicate o quasi-duplicate**
   - Funzioni con nome simile in file diversi
   - Blocchi di codice >5 righe ripetuti

2. **Export orfani**
   - Funzioni/costanti esportate ma mai importate

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
3. Scan export/import
4. Scan pattern ripetuti
5. Scan file size
6. Calcola Debt Rating (vedi `templates/techdebt-report.md` per formula e soglie)
7. Genera report
8. Aggiorna registry se trova utility candidates

---

## `/emmet checklist [type]`

Carica checklist operativa.

**Types disponibili:**
- `code-review` - Checklist per code review
- `pre-deploy` - Checklist pre-deployment
- `refactoring` - Checklist per refactoring sicuro
- `security` - Checklist sicurezza

**Riferimenti:** `checklists/`

---

## `/adapt-framework`

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
| `/emmet journey [flow]` | `/emmet test --browser` | Il test browser usa la map come source of truth |

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

Skill files are organized in: `prompts/`, `templates/`, `testing/`, and `checklists/`. Stack-specific patterns generated by `/adapt-framework` are saved to `.emmet/stacks/`.

Key testing reference files:
- `testing/static.md` — Rules for static code analysis
- `testing/dynamic.md` — Rules for Playwright browser testing
- `testing/unit.md` — Rules for unit test generation (pure functions)
- `testing/report-template.md` — Output template for test reports

---

## Visual Testing

Use screenshot comparison for visual regression: capture before/after screenshots via Playwright (headless) or BrowserMCP (visual), compare for layout shifts, missing elements, broken styling, and color changes. Flag unintended regressions in the test report.

For full functional map and testing knowledge base, see `KNOWLEDGE.md`.

---

## Security Pre-Check

Before running functional tests on newly written or modified code:

1. Launch Heimdall scan on the modified files as a subagent (Task tool)
2. If critical vulnerabilities found, report them before proceeding with tests
3. If clean, proceed with the test suite
4. Include security scan results in the test report summary

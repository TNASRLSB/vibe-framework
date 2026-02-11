---
name: emmet
description: Testing, debugging, tech debt audit, and code quality checklists. Complete testing cycle with static analysis and dynamic Playwright tests.
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

La **functional map** e la fonte di verita: descrive cosa fa l'app, chi la usa, e quali flussi testare. Il testing usa la map per sapere **cosa** verificare.

## Commands

| Command | Description |
|---------|-------------|
| `/emmet map` | Analizza codebase, genera mappa funzionale completa |
| `/emmet map --update` | Rigenera la mappa funzionale |
| `/emmet test` | Ciclo QA completo: analisi statica + test browser |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --browser` | Solo test browser (Playwright o BrowserMCP) |
| `/emmet report` | Genera report bug da ultimo test |
| `/emmet techdebt [path]` | Audit tech debt (duplicazioni, export orfani, ecc.) |
| `/emmet checklist [type]` | Carica checklist (code-review, pre-deploy, refactoring, security) |
| `/adapt-framework` | Analizza stack, genera pattern contestuali |

---

## `/emmet map`

Analizza il 100% della codebase e produce una mappa funzionale strutturata.

**Output:** `.claude/docs/functional-map.md`

**Cosa contiene la map:**
- **Screens/Views** — Tutte le schermate con elementi interattivi
- **State Transitions** — Grafo di navigazione (Mermaid)
- **Personas** — Derivate dalla complessita dei flussi
- **Use Cases** — Flussi principali e alternativi con stato test
- **Workflow Diagrams** — Diagrammi dei flussi complessi
- **Coverage Summary** — Conteggio use cases testati/non testati

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
10. Assembla map con template

**Aggiornamento:** `/emmet map --update` rigenera la map mantenendo lo stato test esistente.

**Riferimento completo:** `prompts/map.md`

---

## `/emmet test`

Ciclo QA completo. Usa la functional map come guida per sapere cosa testare.

### Flag di scoping

| Comando | Cosa esegue |
|---------|-------------|
| `/emmet test` | Ciclo completo: static + browser |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --browser` | Solo test browser (Playwright o BrowserMCP) |

### Flusso completo

```
1. Legge functional-map.md per sapere COSA testare
2. Esegue analisi statica (security, logic, performance, code quality)
3. Per ogni use case nella map:
   a. Genera/aggiorna test script
   b. Esegue test (Playwright o BrowserMCP)
   c. Cattura evidenze (screenshot, log, errori)
   d. Aggiorna stato test nella map
4. Genera report finale in .claude/docs/test-report.md
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

### Aggiornamento map

Dopo ogni esecuzione, aggiorna automaticamente lo stato test nella `functional-map.md`:

```markdown
- **Ultimo test:** 2026-02-10 14:30 — Playwright — PASS
```

**Riferimento completo:** `prompts/test.md`

---

## `/emmet report`

Genera report strutturato dei bug trovati.

**Output:** `.claude/docs/test-report.md`

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

**Output:** `.claude/docs/techdebt-report.md`

**Procedura:**
1. Rileva stack (estensioni file)
2. Scan duplicazioni
3. Scan export/import
4. Scan pattern ripetuti
5. Scan file size
6. Genera report
7. Aggiorna registry se trova utility candidates

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
- `stacks/[stack-name]/patterns.md` - Pattern idiomatici
- `stacks/[stack-name]/commands.md` - CLI commands
- `stacks/[stack-name]/gotchas.md` - Errori comuni

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
| heimdall | Usa security checklist + pattern security da stacks/ |
| seurat | Usa test dinamici per verificare UI generata |
| orson | Usa test per verificare interattivita video |

---

## Confine con Seurat

- **seurat** = design system (token, spacing, colori, componenti come pattern visivi)
- **emmet map** = funzionalita (cosa fa l'utente, dove, con quale risultato)

Non c'e sovrapposizione: seurat descrive **come appare**, emmet descrive **cosa fa**.

---

## Directory Structure

```
emmet/
├── SKILL.md                # Questo file
├── prompts/
│   ├── map.md              # Workflow e logica di scan per /emmet map
│   └── test.md             # Workflow unificato per /emmet test
├── templates/
│   └── functional-map.md   # Template output per la map
├── testing/
│   ├── static.md           # Regole test statici
│   ├── dynamic.md          # Regole test Playwright
│   ├── plan-template.md    # [LEGACY] Template piano test
│   └── report-template.md  # Template report bug
├── checklists/
│   ├── code-review.md
│   ├── pre-deploy.md
│   ├── refactoring.md
│   └── security.md
└── stacks/                 # Generato da /adapt-framework
    └── [stack-name]/
        ├── patterns.md
        ├── commands.md
        └── gotchas.md
```

---

## Visual Testing (Opus 4.6)

For UI-related testing, use screenshot comparison:

1. Screenshot the page before modifications
2. Apply the code changes
3. Screenshot the page after modifications
4. Compare visually: layout shifts, missing elements, broken styling, color changes
5. Flag any unintended visual regressions in the test report

Works with both Playwright (headless screenshot) and BrowserMCP (visual inspection).

---

## Security Pre-Check

Before running functional tests on newly written or modified code:

1. Launch Heimdall scan on the modified files as a subagent (Task tool)
2. If critical vulnerabilities found, report them before proceeding with tests
3. If clean, proceed with the test suite
4. Include security scan results in the test report summary

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
ANALISI -> PIANIFICAZIONE -> ESECUZIONE -> REPORT
```

## Commands

| Command | Description |
|---------|-------------|
| `/emmet plan [scope]` | Analizza codice + spec, genera piano di test |
| `/emmet test` | Esegue test statici (analisi codice senza esecuzione) |
| `/emmet journey [flow]` | Esegue test dinamici con Playwright |
| `/emmet report` | Genera report bug da ultimo test |
| `/emmet techdebt [path]` | Audit tech debt (duplicazioni, export orfani, ecc.) |
| `/emmet checklist [type]` | Carica checklist (code-review, pre-deploy, refactoring, security) |
| `/adapt-framework` | Analizza stack, genera pattern contestuali |

---

## `/emmet plan [scope]`

Genera piano di test leggendo:
1. Codice sorgente nel path specificato
2. Spec in `.claude/docs/specs/`
3. Requisiti/PDR se disponibili

**Output:** `.claude/docs/test-plan.md`

**Workflow:**
1. Leggo il codice
2. Identifico funzionalita critiche
3. Identifico edge case
4. Identifico integrazioni da testare
5. Genero piano con priorita

---

## `/emmet test`

Test statici: analisi del codice senza esecuzione.

**Cosa cerca:**
- Bug logici (off-by-one, null checks mancanti, race conditions)
- Pattern problematici (callback hell, deeply nested conditionals)
- Type errors potenziali
- Error handling incompleto
- Security issues (injection, XSS, hardcoded secrets)
- Performance issues (N+1 queries, memory leaks)

**Riferimento completo:** `testing/static.md`

---

## `/emmet journey [flow]`

Test dinamici con Playwright: simula utente reale.

**Cosa testa:**
- User flows completi (signup, login, checkout)
- Interazioni UI (click, form submission, navigation)
- Stato dell'applicazione
- Comportamento responsive
- Errori runtime

**Workflow:**
1. Identifico il flow da testare
2. Genero script Playwright
3. Eseguo script
4. Catturo screenshot/video se fallimento
5. Documento bug trovati

**Riferimento completo:** `testing/dynamic.md`

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

## Due Tipi di Test

| Tipo | Cosa trova | Come |
|------|------------|------|
| **Statico** | Bug nel codice (logica, pattern, type error) | Analisi codice senza esecuzione |
| **Dinamico** | Bug comportamentali (UI/UX, flussi) | Playwright simula utente |

### Quando usare quale

**Test Statici** (`/emmet test`):
- Revisione codice nuovo
- Audit sicurezza
- Identificazione tech debt
- Prima di code review

**Test Dinamici** (`/emmet journey`):
- Verifica user flows
- Test di regressione UI
- Validazione integrazioni
- Prima di deploy

---

## Integrazione con Altre Skill

| Skill | Integrazione |
|-------|--------------|
| heimdall | Usa security checklist + pattern security da stacks/ |
| seurat | Usa test dinamici per verificare UI generata |
| orson | Usa test per verificare interattivita video |

---

## Directory Structure

```
emmet/
├── SKILL.md              # Questo file
├── testing/
│   ├── static.md         # Regole test statici
│   ├── dynamic.md        # Regole test Playwright
│   ├── plan-template.md  # Template piano test
│   └── report-template.md # Template report bug
├── checklists/
│   ├── code-review.md
│   ├── pre-deploy.md
│   ├── refactoring.md
│   └── security.md
└── stacks/               # Generato da /adapt-framework
    └── [stack-name]/
        ├── patterns.md
        ├── commands.md
        └── gotchas.md
```

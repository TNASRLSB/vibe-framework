# Feature: Emmet Unit Testing Extension

**Status:** COMPLETE
**Created:** 2026-02-16
**Approved:** 2026-02-16
**Completed:** 2026-02-16

---

## 1. Overview

**What?** Estendere `/emmet map` per catalogare funzioni pure (utility, validatori, parser, calcoli, trasformazioni) e `/emmet test` per generare ed eseguire unit test su queste funzioni con mock automatici delle dipendenze esterne.

**Why?** Oggi Emmet copre solo flussi UI (browser) e analisi statica. Tutta la logica pura — che spesso contiene il core business — resta senza test. Il gap non dipende dal progetto: è strutturale nella skill.

**For whom?** Qualsiasi progetto con logica non legata a UI: utility, validatori, parser, calcoli, trasformazioni dati, integrazioni backend.

**Success metric:** Dopo l'estensione, `/emmet map` elenca funzioni pure con firma e dipendenze; `/emmet test --unit` genera test che importano la funzione, passano input controllati, mockano dipendenze esterne, e verificano output attesi.

---

## 2. Technical Approach

**Pattern:** Estensione dei file esistenti — stesso ciclo MAP → TEST → REPORT. Nessun comando nuovo, solo nuove sezioni nella map e un nuovo flag `--unit` per test.

**Key decisions:**

1. **Unificato, non separato** — La map resta la singola fonte di verità. Aggiunge una sezione "Pure Functions" accanto a "Screens", "Use Cases", ecc. Il test consuma la map come già fa per browser.

2. **Framework-agnostic** — Lo scan rileva lo stack (come già fa `/adapt-framework`) e genera test nel framework appropriato:
   - Node.js/TS → Jest o Vitest (auto-detect da config)
   - Python → pytest
   - Go → go test
   - Rust → cargo test
   - Fallback → pseudocodice strutturato

3. **Mock solo dipendenze esterne** — Coerente con la filosofia già in `checklists/code-review.md` riga 98: "Mocks appropriati (solo external)". Si mockano: API call, DB, filesystem, env vars, date/time. Non si mockano funzioni interne.

4. **Edge case derivati automaticamente** — Dallo scan della firma e del corpo della funzione si derivano: null/undefined, array vuoto, stringa vuota, boundary numerici, tipo errato (se JS/TS).

**Dependencies:** Nessuna nuova. Lo scan usa Grep/Glob/Read già disponibili. L'esecuzione test usa Bash (già allowed).

**Breaking changes:** Nessuno. I file esistenti vengono estesi, non riscritti. La map esistente resta valida — la nuova sezione si aggiunge in coda.

---

## 3. Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `SKILL.md` | Modify | Aggiungere `--unit` alla tabella comandi, sezione test, flag di scoping |
| `prompts/map.md` | Modify | Aggiungere Step 9: scan funzioni pure (dopo step 8, prima di assemble) |
| `prompts/test.md` | Modify | Aggiungere flusso `--unit`: lettura map → generazione test → esecuzione → report |
| `templates/functional-map.md` | Modify | Aggiungere sezione "Pure Functions" e relativa Coverage Summary |
| `testing/unit.md` | Create | Regole per generazione unit test: pattern di scan, strategie mock, edge case, struttura test |
| `testing/report-template.md` | Modify | Aggiungere sezione "Unit Test Results" al report |

---

## 4. Dettaglio Modifiche

### 4.1 Estensione `prompts/map.md` — Scan Pure Functions

**Nuovo Step 9** (tra step 8 "Use Cases" e step finale "Assemble"):

**Obiettivo:** Identificare tutte le funzioni esportate che contengono logica pura (non legata a UI rendering).

**Procedura di scan:**

1. **Trova candidati** — Funzioni esportate (`export function`, `export const`, `module.exports`, `def`, `pub fn`, `func`) che:
   - NON sono componenti UI (no JSX return, no render, no template)
   - NON sono route handler (no req/res, no ctx)
   - NON sono middleware
   - NON sono hook React/Vue (no `use` prefix con state)

2. **Per ogni funzione, cataloga:**
   - `name` — Nome funzione
   - `file:line` — Posizione esatta
   - `signature` — Parametri e tipo ritorno (inferiti se non tipizzati)
   - `dependencies` — Import usati nel corpo (divisi in: interne, esterne, side-effect)
   - `complexity` — Bassa (lineare) / Media (branching) / Alta (loop nested, ricorsione)
   - `pure` — Si (nessun side effect) / Quasi-pura (side effect mockabile) / No (esclusa)

3. **Classifica per priorità test:**
   - **P1 (High):** Funzioni con logica condizionale complessa, calcoli, validazione, parsing
   - **P2 (Medium):** Funzioni di trasformazione dati, formatting, mapping
   - **P3 (Low):** Funzioni wrapper semplici, costanti, configurazioni

4. **Deriva edge case per funzione** (basati su firma + corpo):

   | Tipo parametro | Edge case generati |
   |----------------|-------------------|
   | `string` | `""`, `" "`, stringa lunghissima, caratteri speciali, unicode |
   | `number` | `0`, `-1`, `NaN`, `Infinity`, boundary del dominio |
   | `array` | `[]`, un elemento, molti elementi, elementi duplicati |
   | `object` | `{}`, `null`, proprietà mancanti, proprietà extra |
   | `boolean` | `true`, `false` |
   | `optional/nullable` | `undefined`, `null` |
   | Date/time | epoch, date future, date passate, timezone edge |

5. **Regole di esclusione:**
   - File di configurazione pura (solo export di costanti senza logica)
   - File di tipo/interfaccia (`.d.ts`, type-only)
   - File di test esistenti (`*.test.*`, `*.spec.*`)
   - File generati (`*.generated.*`, `dist/`, `build/`)

**Output nel template map:** Sezione `## Pure Functions` (vedi 4.3).

---

### 4.2 Estensione `prompts/test.md` — Flusso `--unit`

**Aggiornamento tabella flag:**

| Comando | Cosa esegue |
|---------|-------------|
| `/emmet test` | Ciclo completo: static + browser + unit |
| `/emmet test --static` | Solo analisi statica |
| `/emmet test --browser` | Solo test browser |
| `/emmet test --unit` | Solo unit test funzioni pure |

**Flusso `--unit`:**

```
1. READ MAP → Carica sezione "Pure Functions" da functional-map.md
   - Se non esiste: avvisa utente, suggerisci /emmet map prima

2. DETECT FRAMEWORK → Identifica test runner del progetto:
   - Cerca jest.config.* / vitest.config.* / pytest.ini / pyproject.toml [tool.pytest] / go.mod / Cargo.toml
   - Se nessuno trovato: suggerisci installazione, genera pseudocodice

3. PER OGNI FUNZIONE (ordine: P1 → P2 → P3):
   a. Leggi file sorgente per contesto completo
   b. Identifica dipendenze esterne da mockare
   c. Genera test:
      - Import funzione
      - Setup mock dipendenze esterne
      - Test case "happy path" (input valido → output atteso)
      - Test case per ogni edge case derivato dalla firma
      - Test case per branch non coperti (da analisi del corpo)
      - Teardown mock
   d. Esegui test
   e. Cattura risultati (pass/fail, errori, coverage se disponibile)
   f. Aggiorna stato nella map

4. GENERA REPORT → Aggiunge sezione "Unit Test Results" al report
```

**Strategia mock (da documentare in `testing/unit.md`):**

| Dipendenza | Strategia mock |
|------------|---------------|
| HTTP/API call | Mock del client (axios, fetch, http) |
| Database | Mock del driver/ORM |
| Filesystem | Mock fs/path |
| Environment vars | Set/restore `process.env` o equivalente |
| Date/Time | Mock `Date.now()` o equivalente |
| Random | Seed fisso o mock |
| Logger | Mock silente o spy |

**Cosa NON mockare:**
- Funzioni interne del progetto
- Utility pure importate dallo stesso progetto
- Strutture dati standard della lingua

**Aggiornamento map dopo test:**
```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Jest — PASS (4/4)
```

---

### 4.3 Estensione `templates/functional-map.md`

**Nuova sezione da aggiungere dopo "## Workflows" e prima di "## Coverage Summary":**

```markdown
## Pure Functions

### P1 — High Priority

#### `functionName`
- **File:** path/to/file.ts:42
- **Firma:** `(param1: type, param2: type) => returnType`
- **Dipendenze esterne:** axios (HTTP), fs (file system)
- **Complessità:** Media
- **Edge case:**
  - param1: null, stringa vuota
  - param2: 0, negativo, NaN
- **Ultimo test:** mai — NON TESTATO

### P2 — Medium Priority
...

### P3 — Low Priority
...
```

**Estensione Coverage Summary:**

```markdown
## Coverage Summary

| Metrica | Valore |
|---------|--------|
| Screens trovate | N |
| Elementi interattivi | N |
| Use cases totali | N |
| Use cases testati | N |
| Use cases NON testati | N |
| Pure functions trovate | N |
| Pure functions testate | N |
| Pure functions NON testate | N |
| Unit test totali | N |
| Unit test PASS | N |
| Unit test FAIL | N |
```

---

### 4.4 Nuovo file `testing/unit.md`

**Scopo:** Regole complete per generazione ed esecuzione unit test (equivalente di `static.md` per statica e `dynamic.md` per browser).

**Struttura:**

1. **Principi**
   - Un test = un comportamento
   - Arrange / Act / Assert
   - Mock solo esterno
   - Test isolati e indipendenti
   - Nomi descrittivi: `should [behavior] when [condition]`

2. **Pattern per framework**

   **Jest/Vitest (JS/TS):**
   ```typescript
   import { functionName } from '../path/to/module';

   // Mock external deps
   jest.mock('axios');

   describe('functionName', () => {
     afterEach(() => jest.restoreAllMocks());

     it('should return X when given valid input', () => {
       const result = functionName(validInput);
       expect(result).toEqual(expectedOutput);
     });

     it('should throw when given null', () => {
       expect(() => functionName(null)).toThrow();
     });

     it('should handle empty array', () => {
       const result = functionName([]);
       expect(result).toEqual(emptyResult);
     });
   });
   ```

   **pytest (Python):**
   ```python
   import pytest
   from unittest.mock import patch, MagicMock
   from module import function_name

   class TestFunctionName:
       def test_valid_input(self):
           result = function_name(valid_input)
           assert result == expected_output

       def test_none_input(self):
           with pytest.raises(ValueError):
               function_name(None)

       @patch('module.requests.get')
       def test_with_mocked_api(self, mock_get):
           mock_get.return_value.json.return_value = {'key': 'value'}
           result = function_name('param')
           assert result == expected
   ```

   **Go:**
   ```go
   func TestFunctionName(t *testing.T) {
       tests := []struct {
           name     string
           input    InputType
           expected OutputType
           wantErr  bool
       }{
           {"valid input", validInput, expectedOutput, false},
           {"empty input", emptyInput, emptyOutput, false},
           {"nil input", nil, zeroValue, true},
       }
       for _, tt := range tests {
           t.Run(tt.name, func(t *testing.T) {
               got, err := FunctionName(tt.input)
               if (err != nil) != tt.wantErr {
                   t.Errorf("unexpected error: %v", err)
               }
               if got != tt.expected {
                   t.Errorf("got %v, want %v", got, tt.expected)
               }
           })
       }
   }
   ```

3. **Strategia edge case** — Tabella tipo parametro → edge case (come in sezione 4.1 punto 4)

4. **Strategia mock** — Tabella dipendenza → strategia (come in sezione 4.2)

5. **Struttura output test**
   ```
   Per ogni funzione testata:
   - Nome funzione
   - File test generato (o eseguito in-memory)
   - Test totali / pass / fail
   - Dettaglio fallimenti con input, expected, actual
   - Coverage (se rilevabile)
   ```

6. **Bug ID Convention** — `UNI-XXX` per bug trovati via unit test

7. **Integrazione con report** — Sezione dedicata in report-template.md

---

### 4.5 Estensione `testing/report-template.md`

**Nuova sezione dopo "## Journey Test Results":**

```markdown
## Unit Test Results

### Summary
| Metrica | Valore |
|---------|--------|
| Funzioni testate | N |
| Test totali | N |
| PASS | N |
| FAIL | N |
| Coverage | X% (se disponibile) |

### Risultati per funzione

| Funzione | File | Test | Pass | Fail | Stato |
|----------|------|------|------|------|-------|
| functionA | src/utils.ts:12 | 5 | 5 | 0 | PASS |
| functionB | src/calc.ts:45 | 4 | 3 | 1 | FAIL |

### Bug trovati

#### [UNI-001] functionB returns NaN for negative input
- **Severity:** High
- **File:** src/calc.ts:45
- **Test:** `should handle negative numbers`
- **Input:** `-5`
- **Expected:** `Error` o valore gestito
- **Actual:** `NaN`
- **Fix suggerito:** Aggiungere guard per input negativi
```

---

### 4.6 Estensione `SKILL.md`

**Tabella comandi** — aggiungere riga:

```markdown
| `/emmet test --unit` | Solo unit test funzioni pure (da map) |
```

**Sezione "Flag di scoping"** — aggiungere:

```markdown
| `/emmet test --unit` | Solo unit test funzioni pure |
```

**Aggiornare descrizione `/emmet test`:**
```
Ciclo QA completo: analisi statica + test browser + unit test
```

**Aggiornare flusso completo** (aggiungere step 3b):
```
3b. Per ogni pure function nella map:
    a. Genera test (framework auto-detected)
    b. Esegui test
    c. Cattura risultati
    d. Aggiorna stato nella map
```

**Aggiungere alla Directory Structure:**
```
├── testing/
│   ├── unit.md          # Rules for unit test generation
```

---

## 5. Cosa NON cambia

- `/emmet map --update` — Continua a preservare stato test esistente (ora anche per pure functions)
- `/emmet test --static` — Invariato
- `/emmet test --browser` — Invariato
- `/emmet report` — Invariato (legge dal report che ora include anche unit)
- `/emmet techdebt` — Invariato
- `/emmet checklist` — Invariato
- `/adapt-framework` — Invariato (ma i pattern generati potranno essere usati da unit.md per scegliere il framework)
- Tutti i template esistenti — Estesi, non riscritti

---

## 6. Ordine di implementazione

1. `testing/unit.md` — Creare il file di regole (fondamento per tutto il resto)
2. `templates/functional-map.md` — Aggiungere sezione Pure Functions e Coverage estesa
3. `prompts/map.md` — Aggiungere Step 9 scan funzioni pure
4. `prompts/test.md` — Aggiungere flusso `--unit`
5. `testing/report-template.md` — Aggiungere sezione Unit Test Results
6. `SKILL.md` — Aggiornare comandi e documentazione

---

## 7. Test della spec stessa

**Come verificare che l'estensione funziona:**

1. Su un progetto con funzioni pure: `/emmet map` → la sezione Pure Functions appare con funzioni catalogate
2. `/emmet test --unit` → genera test, li esegue, riporta risultati
3. `/emmet test` (senza flag) → esegue statica + browser + unit
4. La map si aggiorna con lo stato test delle funzioni
5. Il report include la sezione Unit Test Results

---

*Waiting for PROCEED.*

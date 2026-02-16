# Unit Testing — Pure Functions

## Purpose

Regole per generazione ed esecuzione di unit test su funzioni pure e quasi-pure catalogate nella sezione "Pure Functions" della functional map.

---

## Principi

1. **Un test = un comportamento** — Ogni `it`/`test` verifica una cosa sola
2. **Arrange / Act / Assert** — Struttura standard per ogni test
3. **Mock solo dipendenze esterne** — API, DB, filesystem, env, time, random. Mai funzioni interne
4. **Test isolati e indipendenti** — Ordine di esecuzione non conta
5. **Nomi descrittivi** — `should [behavior] when [condition]`
6. **Edge case dalla firma** — Tipo parametro determina edge case (vedi tabella)

---

## Framework Detection

Rileva il test runner del progetto:

| File | Framework |
|------|-----------|
| `jest.config.*` oppure `"jest"` in package.json | Jest |
| `vitest.config.*` oppure `"vitest"` in package.json | Vitest |
| `pytest.ini` oppure `[tool.pytest]` in pyproject.toml | pytest |
| `go.mod` | go test |
| `Cargo.toml` | cargo test (`#[cfg(test)]`) |
| Nessuno trovato | Suggerisci installazione, genera pseudocodice |

**Se il progetto ha gia test esistenti:** rispetta la struttura (cartella `__tests__/`, `tests/`, `*_test.go`, ecc.) e le convenzioni di naming.

---

## Edge Case per Tipo

Quando si genera un test per una funzione, derivare edge case dal tipo dei parametri:

| Tipo parametro | Edge case |
|----------------|-----------|
| `string` | `""`, `" "` (solo spazi), stringa molto lunga (1000+ char), caratteri speciali (`<>&"'`), unicode/emoji |
| `number` | `0`, `-1`, `NaN`, `Infinity`, `-Infinity`, boundary del dominio (es. se percentuale: 0, 100, 101, -1) |
| `array` | `[]`, un elemento, molti elementi, elementi duplicati, elementi null/undefined |
| `object` | `{}`, `null`, proprieta mancanti, proprieta extra ignorate |
| `boolean` | `true`, `false` |
| `optional/nullable` | `undefined`, `null`, valore valido |
| Date/time | epoch (0), date future (2099), date passate (1970), timezone diversi, formato invalido |
| File/path | stringa vuota, path inesistente, path con spazi, path con caratteri speciali |
| Enum/union | ogni valore valido, valore fuori dal set |

**Regola:** Non generare edge case inutili. Se la funzione accetta solo `number` e fa una somma, non testare `NaN` se il codice non lo gestisce esplicitamente — ma segnalarlo come potenziale bug nella sezione statica.

---

## Strategia Mock

| Dipendenza | Strategia |
|------------|-----------|
| HTTP/API (fetch, axios, http) | Mock del client: intercetta chiamate, ritorna dati fissi |
| Database (query, ORM) | Mock del driver: ritorna righe fisse |
| Filesystem (fs, path) | Mock fs: simula lettura/scrittura in-memory |
| Environment (process.env, os.environ) | Set/restore variabili prima/dopo test |
| Date/Time (Date.now, time.time) | Mock con valore fisso |
| Random (Math.random, random) | Seed fisso o mock con valore costante |
| Logger (console, logging) | Spy silente: verifica chiamate senza output |
| External service (email, SMS, payment) | Mock del client: verifica payload inviato |

### Cosa NON mockare

- Funzioni interne del progetto (importa e usa direttamente)
- Utility pure importate dallo stesso codebase
- Strutture dati standard del linguaggio
- Costanti e configurazioni statiche

---

## Pattern per Framework

### Jest / Vitest (JavaScript/TypeScript)

```typescript
import { functionName } from '../path/to/module';
import axios from 'axios';

// Mock external dependency
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('functionName', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Happy path
  it('should return expected result for valid input', () => {
    const result = functionName(validInput);
    expect(result).toEqual(expectedOutput);
  });

  // Edge cases from signature
  it('should handle empty string', () => {
    const result = functionName('');
    expect(result).toEqual(emptyResult);
  });

  it('should handle null input', () => {
    expect(() => functionName(null)).toThrow();
  });

  // With mocked external dependency
  it('should call API and transform response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { key: 'value' } });

    const result = await functionName('param');

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/endpoint');
    expect(result).toEqual(transformedValue);
  });
});
```

### pytest (Python)

```python
import pytest
from unittest.mock import patch, MagicMock
from module import function_name


class TestFunctionName:
    """Tests for function_name."""

    # Happy path
    def test_valid_input(self):
        result = function_name(valid_input)
        assert result == expected_output

    # Edge cases from signature
    def test_empty_string(self):
        result = function_name('')
        assert result == empty_result

    def test_none_raises(self):
        with pytest.raises(TypeError):
            function_name(None)

    # With mocked external dependency
    @patch('module.requests.get')
    def test_with_api_call(self, mock_get):
        mock_get.return_value = MagicMock(
            json=MagicMock(return_value={'key': 'value'})
        )
        result = function_name('param')
        mock_get.assert_called_once_with('/api/endpoint')
        assert result == transformed_value
```

### Go

```go
package module

import (
    "testing"
)

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
        {"boundary value", boundaryInput, boundaryOutput, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := FunctionName(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("FunctionName(%v) error = %v, wantErr %v",
                    tt.input, err, tt.wantErr)
                return
            }
            if got != tt.expected {
                t.Errorf("FunctionName(%v) = %v, want %v",
                    tt.input, got, tt.expected)
            }
        })
    }
}
```

### Rust

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_input() {
        let result = function_name(valid_input);
        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_empty_input() {
        let result = function_name(empty_input);
        assert_eq!(result, empty_output);
    }

    #[test]
    #[should_panic(expected = "error message")]
    fn test_invalid_input_panics() {
        function_name(invalid_input);
    }
}
```

---

## Struttura Output

Per ogni funzione testata, il risultato include:

```markdown
### `functionName` — path/to/file.ts:42

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| valid input | `{a: 1, b: 2}` | `3` | `3` | PASS |
| empty array | `[]` | `0` | `0` | PASS |
| null input | `null` | `Error` | `NaN` | FAIL |
| negative number | `-5` | `Error` | `-5` | FAIL |

**Risultato:** 2/4 PASS — FAIL
```

---

## Bug ID Convention

Unit test bug usano il prefisso `UNI-`:

- `UNI-001`, `UNI-002`, ecc.
- Severity derivata dall'impatto:
  - **Critical:** La funzione ritorna dati corrotti o causa crash
  - **High:** La funzione non gestisce input ragionevoli (null, vuoto, boundary)
  - **Medium:** Edge case non gestito ma improbabile in produzione
  - **Low:** Comportamento inatteso ma innocuo

---

## Esecuzione

### Modalita di esecuzione

1. **In-project** (preferita) — Se il progetto ha un test runner configurato:
   - Genera file test nella struttura esistente
   - Esegui con il runner del progetto (`npx jest`, `pytest`, `go test`, `cargo test`)
   - Cattura output e coverage

2. **In-memory** (fallback) — Se nessun runner configurato:
   - Genera test come pseudocodice strutturato
   - Esegui le funzioni direttamente via Bash dove possibile
   - Riporta risultati nel report

### Ordine di esecuzione

1. **P1 (High priority)** — Funzioni con logica complessa, validazione, calcoli
2. **P2 (Medium priority)** — Trasformazioni, formatting, mapping
3. **P3 (Low priority)** — Wrapper semplici, utility minimali

### Dopo esecuzione

Aggiorna la map per ogni funzione testata:

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Jest — PASS (4/4)
```

oppure:

```markdown
- **Ultimo test:** YYYY-MM-DD HH:MM — Jest — FAIL (2/4) (UNI-001, UNI-003)
```

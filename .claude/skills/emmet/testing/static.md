# Static Testing Rules

## Overview

Test statici: analisi del codice senza esecuzione. Identifica bug, pattern problematici, e potenziali vulnerabilita leggendo il codice.

---

## Categories

### 1. Logic Bugs

| Pattern | Problema | Severita |
|---------|----------|----------|
| Off-by-one | `i <= len` invece di `i < len` | High |
| Null/undefined check mancante | Accesso a proprieta senza guard | High |
| Race condition | Async senza await, shared state | Critical |
| Wrong operator | `=` invece di `==`, `&` invece di `&&` | High |
| Integer overflow | Math senza bounds check | Medium |
| Floating point comparison | `0.1 + 0.2 == 0.3` | Medium |

**Cerca:**
```
# Off-by-one
for.*<=.*length
for.*<=.*len\(

# Missing null check
\.property senza ? o if check
```

### 2. Error Handling

| Pattern | Problema | Severita |
|---------|----------|----------|
| Empty catch | `catch {}` o `catch (e) {}` | High |
| Swallowed error | Catch senza log o rethrow | Medium |
| Missing error case | Promise senza catch | High |
| Incorrect error type | Catch generico quando serve specifico | Medium |

**Cerca:**
```
catch\s*\{?\s*\}
catch.*\{\s*//
\.then\( senza \.catch\(
```

### 3. Type Issues

| Pattern | Problema | Severita |
|---------|----------|----------|
| Any type | `any` esplicito o implicito | Medium |
| Type assertion without check | `as Type` senza validazione | High |
| Implicit any | Parametro senza tipo | Medium |
| Wrong type assumption | `string` usato come `number` | High |

**Cerca:**
```
: any
as \w+ senza instanceof o typeof
```

### 4. Security Issues

| Pattern | Problema | Severita |
|---------|----------|----------|
| Hardcoded secret | API key, password nel codice | Critical |
| SQL injection | String concatenation in query | Critical |
| XSS | innerHTML con dati utente | Critical |
| Command injection | exec/spawn con input utente | Critical |
| Path traversal | File path con input utente | High |

**Cerca:**
```
password\s*=\s*["']
api.?key\s*=\s*["']
secret\s*=\s*["']
innerHTML\s*=
exec\(.*\$\{
query\(.*\+
```

### 5. Performance Issues

| Pattern | Problema | Severita |
|---------|----------|----------|
| N+1 query | Query in loop | High |
| Memory leak | Event listener senza cleanup | High |
| Unnecessary re-render | State update in render | Medium |
| Large bundle | Import intero package | Medium |
| Sync in async context | Blocking call in event loop | High |

**Cerca:**
```
for.*await.*query
addEventListener senza removeEventListener
import \* from
fs\.readFileSync in async function
```

### 6. Code Quality

| Pattern | Problema | Severita |
|---------|----------|----------|
| Deep nesting | >4 livelli di indentazione | Medium |
| Long function | >50 righe | Medium |
| Magic number | Numero senza costante | Low |
| Dead code | Codice unreachable | Low |
| Console.log | Debug code in production | Low |

---

## Procedura Test Statico

### Step 1: Scan Security (CRITICAL first)

```bash
# Hardcoded secrets
grep -rn "password\s*=\s*[\"']" src/
grep -rn "api.?key\s*=\s*[\"']" src/
grep -rn "secret\s*=\s*[\"']" src/

# Injection vulnerabilities
grep -rn "innerHTML" src/
grep -rn "dangerouslySetInnerHTML" src/
grep -rn "eval\(" src/
grep -rn "exec\(" src/
```

### Step 2: Scan Logic Bugs

```bash
# Off-by-one
grep -rn "<=.*\.length" src/
grep -rn "<=.*len(" src/

# Missing await
grep -rn "async.*function" src/ -A 10 | grep -v await

# Empty catch
grep -rn "catch\s*{" src/ -A 2
```

### Step 3: Scan Error Handling

```bash
# Empty catch blocks
grep -rn "catch.*{" src/ -A 3 | grep -B 1 "^\s*}"

# Promise without catch
grep -rn "\.then(" src/ | grep -v "\.catch"
```

### Step 4: Scan Performance

```bash
# Potential N+1
grep -rn "for.*{" src/ -A 5 | grep -E "(query|find|get).*\("

# Missing cleanup
grep -rn "addEventListener" src/ | wc -l
grep -rn "removeEventListener" src/ | wc -l
```

### Step 5: Scan Code Quality

```bash
# Long files
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -20

# Console statements
grep -rn "console\." src/

# TODO without ticket
grep -rn "TODO" src/ | grep -v "#"
```

---

## Output Format

Per ogni issue trovato:

```markdown
### [SEVERITY] Issue Title

**File:** `path/to/file.ts:42`
**Category:** Logic Bug | Error Handling | Security | Performance | Code Quality
**Pattern:** Nome del pattern rilevato

**Code:**
```typescript
// Problematic code here
```

**Problem:** Descrizione del problema

**Fix:**
```typescript
// Suggested fix
```

**Impact:** Cosa puo succedere se non fixato
```

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Security vulnerability, data loss | Block immediately |
| **High** | Bug that will cause runtime errors | Fix before merge |
| **Medium** | Code quality, potential issues | Should fix |
| **Low** | Style, minor improvements | Optional |

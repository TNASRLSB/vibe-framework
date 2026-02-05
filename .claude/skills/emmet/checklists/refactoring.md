# Refactoring Checklist (Universal)

## Come Usare

```
/emmet checklist refactoring
```

Esegui questa checklist prima e durante ogni refactoring significativo.

---

## Prima di Iniziare

### Prerequisites
- [ ] Tutti i test passano
- [ ] Branch dedicato creato
- [ ] Scope definito chiaramente
- [ ] Backup/commit point creato
- [ ] Time estimate realistic

### Understanding
- [ ] Leggo e capisco il codice attuale
- [ ] Identifico le dipendenze
- [ ] Capisco il comportamento atteso
- [ ] Ho test che verificano il comportamento

### Scope Definition
```markdown
# Refactoring: [Name]

## Goal
[One sentence describing what we're improving]

## Out of Scope
- [What we're NOT changing]
- [Features NOT being added]

## Success Criteria
- [ ] [How we know we're done]
- [ ] [Measurable outcome]
```

---

## Multi-File Refactoring

### Step 1: Audit First

```bash
# Find ALL instances of the pattern to change
grep -rn "pattern-to-change" src/

# Count how many files are affected
grep -rl "pattern-to-change" src/ | wc -l
```

**STOP: Non modificare nulla finche non conosci il full scope.**

### Step 2: Create Migration Tracker

Se > 5 file coinvolti, crea un tracker:

```markdown
# Migration: [Name]

## Pattern
`old-pattern` -> `new-pattern`

## Files Affected
- [ ] src/components/file1.tsx (5 instances) [line: 12, 45, 67, 89, 120]
- [ ] src/components/file2.tsx (3 instances) [line: 23, 78, 156]
- [ ] src/services/file3.ts (2 instances) [line: 34, 89]
...

## Files Already Compliant (DO NOT TOUCH)
- src/components/already-done.tsx ✓
- src/utils/helper.ts ✓

## Progress
- Total files: X
- Completed: Y
- Remaining: Z
```

### Step 3: Process Systematically

Per ogni file:
1. [ ] Leggi TUTTO il file prima di editare
2. [ ] Trova TUTTE le occorrenze nel file
3. [ ] Applica le modifiche
4. [ ] Verifica che il file compili
5. [ ] Esegui test relativi
6. [ ] Commit incrementale
7. [ ] Marca come completo nel tracker

---

## Large File Strategy

Per file > 500 righe:

```bash
# Trova tutte le occorrenze nel file
grep -n "pattern" src/large-file.ts
```

Output example:
```
45:  old-pattern usage 1
123: old-pattern usage 2
267: old-pattern usage 3
412: old-pattern usage 4
```

**Annota le line numbers e modificale tutte.**

---

## Durante il Refactoring

### Rules
- [ ] Nessun cambio funzionale
- [ ] Un tipo di cambiamento alla volta
- [ ] Commit frequenti
- [ ] Test ad ogni step significativo
- [ ] Nessuna nuova feature

### Red Flags - Stop and Reassess
- "While I'm here, let me also..."
- Tests start failing unexpectedly
- Scope is growing
- Finding more dependencies than expected
- Change is taking much longer than estimated

### Safe Refactoring Steps

| Step | What | Test After? |
|------|------|-------------|
| 1 | Rename variable/function | Yes |
| 2 | Extract function | Yes |
| 3 | Move function | Yes |
| 4 | Change signature | Yes |
| 5 | Delete dead code | Yes |
| 6 | Restructure files | Yes |

---

## Common Refactoring Patterns

### Extract Function
```
# Before
def process():
    # 50 lines of validation
    # 50 lines of processing
    # 50 lines of saving

# After
def process():
    validate()
    transform()
    save()
```

### Rename for Clarity
```
# Before
def proc(d):
    x = d.get('v')

# After
def process_order(order_data):
    order_value = order_data.get('total_value')
```

### Replace Conditional with Polymorphism
```
# Before
if type == 'A':
    do_a()
elif type == 'B':
    do_b()

# After
handlers = {'A': HandlerA, 'B': HandlerB}
handlers[type].process()
```

### Introduce Parameter Object
```
# Before
def create_user(name, email, age, country, language):

# After
def create_user(user_data: UserCreationData):
```

---

## Dependency Management

### Before Changing Interfaces

1. [ ] Find all callers
2. [ ] Assess impact
3. [ ] Plan migration path
4. [ ] Communicate with team

```bash
# Find all usages of a function
grep -rn "functionName(" src/
```

### Interface Evolution Strategy

```
# Step 1: Add new interface alongside old
def old_method(a, b):
    return new_method(Config(a, b))

def new_method(config: Config):
    ...

# Step 2: Migrate callers to new interface

# Step 3: Remove old interface
```

---

## Dopo il Refactoring

### Verification
- [ ] Tutti i test passano
- [ ] Linting passato
- [ ] Type checking passato
- [ ] Manual verification of key flows
- [ ] No regressions found

### Documentation
- [ ] Migration tracker completo
- [ ] PR description explains changes
- [ ] Breaking changes documented
- [ ] Architecture docs updated if needed

### Review
- [ ] Code review completata
- [ ] No funzionalita rotta
- [ ] Performance not degraded
- [ ] No new technical debt introduced

---

## When to Split Refactoring

Consider splitting if:
- More than 20 files affected
- More than 1 day of work
- Multiple unrelated changes
- High-risk changes mixed with low-risk

### Split Strategy
```
PR 1: Safe renames only
PR 2: Structure changes
PR 3: Interface changes
PR 4: Cleanup
```

---

## Risk Assessment

| Factor | Low Risk | High Risk |
|--------|----------|-----------|
| Files changed | < 5 | > 20 |
| Test coverage | > 80% | < 50% |
| Interface changes | No | Yes |
| Dependencies | Few | Many |
| Team familiarity | High | Low |

### High-Risk Mitigations
- [ ] Feature flag for new code path
- [ ] Parallel run old and new
- [ ] Staged rollout
- [ ] Extra review cycles
- [ ] Post-deploy monitoring

---

## Quick Commands

```bash
# Find all occurrences
grep -rn "pattern" src/

# Find files containing pattern
grep -rl "pattern" src/

# Count occurrences
grep -rc "pattern" src/ | grep -v ":0$"

# Find and show context
grep -rn -B2 -A2 "pattern" src/

# Find unused exports (needs tooling)
# TypeScript: npx ts-prune
# JavaScript: npx unimported
```

---

## Refactoring Anti-Patterns

### Big Bang Refactoring
**Problem:** Try to change everything at once
**Solution:** Small, incremental changes

### Refactoring Without Tests
**Problem:** No safety net
**Solution:** Add tests first, then refactor

### Mixing Refactoring with Features
**Problem:** Can't isolate issues
**Solution:** Separate PRs

### Incomplete Refactoring
**Problem:** Half old pattern, half new
**Solution:** Use migration tracker, complete all instances

### Over-Engineering
**Problem:** Creating abstractions for one use case
**Solution:** Wait for the third instance before abstracting

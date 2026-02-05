# Code Review Checklist (Universal)

## Come Usare

```
/emmet checklist code-review
```

Applica questa checklist a `git diff HEAD`.

---

## Security (CRITICAL)

**Se trovato: BLOCCA commit fino a fix.**

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No SQL/command injection vulnerabilities
- [ ] Input validation presente
- [ ] Output encoding per XSS prevention
- [ ] Authorization checks presenti
- [ ] No sensitive data in logs
- [ ] No debug credentials
- [ ] Parameterized queries used
- [ ] No eval() or similar with user input

### Red Flags
```
# IMMEDIATE STOP
password = "hardcoded123"
api_key = "sk-live-..."
db.query("SELECT * FROM users WHERE id = " + userId)
eval(userInput)
innerHTML = userProvidedHtml
```

---

## Code Quality (HIGH)

- [ ] Funzioni < 50 righe
- [ ] File < 500 righe
- [ ] Nesting < 4 livelli
- [ ] Error handling presente
- [ ] No debug code (print, console.log, etc.)
- [ ] No magic numbers (usa costanti)
- [ ] No mutation diretta (se paradigma funzionale)
- [ ] Types/interfaces used appropriately
- [ ] No any/Object where specific type possible

### Smells to Watch
```
# Too many parameters
def func(a, b, c, d, e, f, g):  # > 5

# Deep nesting
if x:
    if y:
        if z:
            if w:  # > 4 levels

# God function
def processEverything():  # 200+ lines
```

---

## Best Practices (MEDIUM)

- [ ] Naming chiaro e descrittivo
- [ ] Commenti spiegano "perche", non "cosa"
- [ ] No TODO senza ticket associato
- [ ] No codice commentato
- [ ] No duplicazione evidente
- [ ] Consistent code style
- [ ] Imports organized
- [ ] No unused imports/variables

### Naming Guidelines
```
# BAD
def proc(d):
    x = d.get('val')

# GOOD
def process_order(order_data):
    order_value = order_data.get('total_value')
```

---

## Testing (MEDIUM)

- [ ] Test per nuova funzionalita
- [ ] Test per bug fix (regression test)
- [ ] Edge cases coperti
- [ ] Mocks appropriati (solo external)
- [ ] Tests are readable
- [ ] Tests are independent
- [ ] No flaky tests introduced

### Test Quality Check
```
# BAD: No assertion
def test_user():
    user = create_user()

# BAD: Testing implementation
mock(internal_function)

# GOOD: Testing behavior
def test_user_creation_sends_welcome_email():
    user = create_user(email="test@test.com")
    assert email_sent_to("test@test.com")
```

---

## Performance (MEDIUM)

- [ ] No N+1 queries
- [ ] No unnecessary database calls in loops
- [ ] Appropriate indexing considered
- [ ] Large lists handled efficiently
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] Async operations where appropriate

### Performance Red Flags
```
# N+1 query
for user in users:
    orders = db.get_orders(user.id)  # Query per user!

# Should be:
orders = db.get_orders_for_users([u.id for u in users])
```

---

## Documentation (LOW)

- [ ] Public API documentata
- [ ] README aggiornato se necessario
- [ ] Breaking changes documentati
- [ ] Complex logic explained
- [ ] Architecture decisions noted

---

## Specific Change Review

### For New Files
- [ ] File in correct location
- [ ] Follows project structure
- [ ] Has appropriate tests
- [ ] Exports are intentional

### For Deleted Code
- [ ] No orphaned dependencies
- [ ] Tests updated
- [ ] Documentation updated
- [ ] No dead imports elsewhere

### For Refactoring
- [ ] Behavior unchanged
- [ ] Tests still pass
- [ ] No accidental scope changes
- [ ] Performance not degraded

### For Bug Fixes
- [ ] Regression test added
- [ ] Root cause addressed (not just symptom)
- [ ] No new bugs introduced
- [ ] Edge cases considered

### For New Features
- [ ] Feature complete
- [ ] Error cases handled
- [ ] Tests cover happy + error paths
- [ ] Documentation added
- [ ] Feature flag if needed

---

## Output Format

Per ogni issue trovato:

```
[SEVERITY] Issue Title
File: path/to/file:line_number
Problem: Clear description of what's wrong
Fix: Suggested solution or approach
```

### Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Security/data issue | Block merge |
| **HIGH** | Bug or major quality issue | Should fix before merge |
| **MEDIUM** | Code quality concern | Recommend fixing |
| **LOW** | Style/minor improvement | Optional |
| **INFO** | Observation/suggestion | FYI only |

---

## Review Etiquette

### As Reviewer
- Be constructive, not critical
- Explain why, not just what
- Distinguish must-fix from nice-to-have
- Acknowledge good work
- Ask questions when unsure

### As Author
- Respond to all comments
- Don't take feedback personally
- Explain context if reviewer misunderstood
- Update or discuss, don't ignore

---

## Quick Commands

```bash
# See what changed
git diff HEAD

# See staged changes
git diff --cached

# See specific file history
git log -p -- path/to/file

# Find TODOs added
git diff HEAD | grep "^\+" | grep -i "todo"

# Check for common issues
git diff HEAD | grep -E "(password|secret|api.?key|console\.log)"
```

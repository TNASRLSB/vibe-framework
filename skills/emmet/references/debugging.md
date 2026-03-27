# Debugging — Supplementary Reference

Supplements the 7-step debugging workflow in SKILL.md. The step definitions live there — this file adds techniques, templates, and anti-patterns.

---

## Techniques

### Git Bisect (for "it used to work" bugs)

```bash
git bisect start
git bisect bad HEAD
git bisect good abc1234
# Git checks out midpoint — test it
git bisect good  # or git bisect bad
# Repeat until found
git bisect reset
```

### Scope Narrowing (for unclear timeline)

1. Which page/route/endpoint? → test each independently
2. Which function in the call chain? → add logging at entry/exit
3. Which line? → trace logic manually
4. Which input value? → hardcode known-good values at different points

### Disable and Test (binary search in code)

1. Comment out half the suspect code path
2. Bug still occurs? → bug is in the remaining half
3. Repeat with remaining half

---

## Output Format Templates

### Reproduction

```
REPRODUCTION RESULT:
- Status: Confirmed / Cannot reproduce / Intermittent (X/10)
- Steps: [numbered list]
- Expected: [description]
- Actual: [description]
- Environment: [relevant details]
```

### Isolation

```
ISOLATION RESULT:
- File: [path]
- Function: [name]
- Line range: [start-end]
- Trigger: [specific input or condition]
```

### Hypotheses

```
HYPOTHESES:
1. [Specific hypothesis] — Test by: [how to test]
2. [Specific hypothesis] — Test by: [how to test]
3. [Specific hypothesis] — Test by: [how to test]
```

### Verification

```
VERIFICATION:
- Hypothesis 1: ELIMINATED — [evidence]
- Hypothesis 2: CONFIRMED — [evidence]
- Root cause: [clear description]
```

---

## Common Bug Categories

Quick reference for forming hypotheses:

| Category | Signals | Typical Root Cause |
|----------|---------|-------------------|
| Data type | Works for some inputs, not others | Type coercion, missing conversion |
| Timing | Intermittent, worse under load | Race condition, missing await |
| State | Works first time, fails on repeat | State not reset, stale cache |
| Boundary | Fails at limits (0, max, empty) | Off-by-one, missing null check |
| Environment | Works locally, fails in CI/prod | Missing env var, different version |
| Encoding | Garbled text, broken special chars | UTF-8, URL encoding, HTML entities |
| Auth | 403/401, works for some users | Missing permission, expired token |
| Concurrency | Data corruption, duplicate records | Missing lock, no idempotency key |

---

## Anti-Patterns

| Anti-Pattern | Problem | Instead |
|-------------|---------|---------|
| **Shotgun debugging** | Changing random things until it works | Follow the 7 steps — understand before fixing |
| **Fix and forget** | No regression test | Always complete Steps 6+7 |
| **Premature rewrite** | Rewriting the module because of one bug | Minimal fix first. Refactoring is separate. |
| **Adding complexity** | Workaround instead of root cause fix | Find and fix the root cause |
| **Ignoring intermittent** | Dismissing "sometimes" bugs | Run repro many times, look for race conditions |

---

## Failure-Loop-Detect Hook Integration

The VIBE `failure-loop-detect` hook fires after 3 consecutive failures on the same task. When it fires:

1. Claude was skipping Steps 1-4 and jumping to Step 5 (Fix)
2. Emmet forces the discipline of understanding before fixing
3. Start fresh from Step 1 — do NOT look at previous failed attempts
4. Form NEW hypotheses, treat it as a new investigation

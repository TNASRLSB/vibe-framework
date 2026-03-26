# Debugging Methodology Reference

A systematic approach to finding and fixing bugs. This document is read when Emmet enters debug mode.

---

## The 7-Step Process

### Step 1: Reproduce

**Goal:** Confirm the bug exists and define exact reproduction steps.

**Process:**
1. Get the bug report (user description, error log, screenshot)
2. Write down exact steps to reproduce BEFORE trying anything
3. Follow those steps exactly — does the bug appear?
4. If yes → document: "Bug confirmed. Steps: [1, 2, 3]. Expected: X. Actual: Y."
5. If no → investigate environmental differences (OS, browser, data, config, timing)

**Common reproduction failures:**
- Bug only happens with specific data → ask for sample data or check production logs
- Bug is intermittent → run the repro 10 times, note frequency, look for race conditions
- Bug only happens in production → check for environment differences (env vars, DB data, network conditions)
- Bug was already fixed → check if the fix was deployed, check branch

**Output format:**
```
REPRODUCTION RESULT:
- Status: Confirmed / Cannot reproduce / Intermittent (X/10)
- Steps: [numbered list]
- Expected: [description]
- Actual: [description]
- Environment: [relevant details]
```

---

### Step 2: Isolate

**Goal:** Narrow the bug to the smallest possible scope.

**Techniques:**

**Binary search (for "it used to work" bugs):**
1. Find a known good state (commit, version, date)
2. Find the broken state (current)
3. Test the midpoint
4. Repeat until you find the breaking change

```bash
git bisect start
git bisect bad HEAD
git bisect good abc1234
# Git checks out midpoint — test it
git bisect good  # or git bisect bad
# Repeat until found
git bisect reset
```

**Scope narrowing (for "it never worked" or unclear timeline):**
1. Which page/route/endpoint? → Test each independently
2. Which function in the call chain? → Add logging at entry/exit of each function
3. Which line in the function? → Read the function, trace logic manually
4. Which input value? → Test with hardcoded known-good values at different points

**Disable and test:**
1. Comment out half the suspect code path
2. Does the bug still occur?
   - Yes → bug is in the remaining half
   - No → bug is in the commented-out half
3. Repeat with the remaining half

**Output format:**
```
ISOLATION RESULT:
- File: [path]
- Function: [name]
- Line range: [start-end]
- Trigger: [specific input or condition]
```

---

### Step 3: Hypothesize

**Goal:** Form 2-3 specific, testable hypotheses about the root cause.

**Good hypotheses are:**

| Quality | Example |
|---------|---------|
| Specific | "The `formatDate` function does not handle timezone offsets with minutes (e.g., +05:30)" |
| Testable | Can be confirmed with one check: pass "+05:30" to formatDate and observe |
| Falsifiable | If formatDate handles "+05:30" correctly, hypothesis is eliminated |

**Bad hypotheses:**

| Problem | Example |
|---------|---------|
| Vague | "Something is wrong with dates" |
| Untestable | "It might be a race condition somewhere" |
| Too broad | "The backend is broken" |

**Hypothesis generation process:**
1. Look at the isolated location from Step 2
2. Read the code carefully — what assumptions does it make?
3. Check: do those assumptions hold for the failing input?
4. Common root causes to consider:
   - Off-by-one errors
   - Null/undefined not handled
   - Async operation completing out of order
   - Type coercion (string "0" vs number 0)
   - Encoding issues (UTF-8, URL encoding, HTML entities)
   - Timezone or locale differences
   - Cache serving stale data
   - Environment variable missing or different

**Output format:**
```
HYPOTHESES:
1. [Specific hypothesis] — Test by: [how to test]
2. [Specific hypothesis] — Test by: [how to test]
3. [Specific hypothesis] — Test by: [how to test]
```

---

### Step 4: Verify

**Goal:** Test each hypothesis and confirm the root cause.

**Process:**
1. Start with the most likely hypothesis
2. Design a targeted test for it (add logging, write a unit test, inspect data)
3. Run the test
4. Result is either: CONFIRMED (this is the root cause) or ELIMINATED (this is not it)
5. If eliminated, move to the next hypothesis
6. If all eliminated, go back to Step 3 with new hypotheses based on what you learned

**Verification techniques:**
- **Targeted logging:** Add log statements at the exact points that distinguish between hypotheses
- **Minimal test case:** Write a unit test that exercises only the suspected code path
- **Data inspection:** Check the actual values at runtime (debugger, console.log, print statements)
- **Substitution:** Replace the suspect function with a known-good hardcoded value — does the bug disappear?

**Important:** Do not start fixing before you have a confirmed hypothesis. If you cannot confirm any hypothesis, you do not understand the bug well enough.

**Output format:**
```
VERIFICATION:
- Hypothesis 1: ELIMINATED — [evidence]
- Hypothesis 2: CONFIRMED — [evidence]
- Root cause: [clear description]
```

---

### Step 5: Fix

**Goal:** Implement the minimal fix for the confirmed root cause.

**Rules:**
1. **Minimal change.** Fix only the confirmed root cause. Change as few lines as possible.
2. **No drive-by refactoring.** If you see other issues while fixing, log them in bugs.md — do not fix them now.
3. **No behavior changes beyond the fix.** The fix should not alter any correct behavior.
4. **Match surrounding code style.** Do not introduce new patterns in the fix.

**Common fix patterns:**
- Add a null check where null was not expected
- Fix an off-by-one comparison (`<` vs `<=`)
- Add a missing `await`
- Fix a wrong variable name (typo)
- Add encoding/decoding step
- Fix a regex pattern
- Add a missing case to a switch/if-else

---

### Step 6: Validate (MANDATORY — NO EXCEPTIONS)

**Goal:** Prove the fix works AND prove the test catches the bug.

**The comment-out protocol:**

```
1. Write a test that fails without the fix
2. Comment out your fix
3. Run the test
   → It MUST FAIL
   → If it passes: your test does not cover the bug. Fix the test.
4. Uncomment your fix
5. Run the test
   → It MUST PASS
   → If it fails: your fix is incomplete. Return to Step 5.
6. Run the full test suite
   → All existing tests MUST still pass
   → If any fail: your fix has side effects. Investigate.
```

**Why this is mandatory:**
- Without step 2-3, you cannot be sure your test catches the actual bug
- A test that passes with or without the fix is worthless
- This is the only way to prove causality between the fix and the behavior change

---

### Step 7: Prevent

**Goal:** Ensure this bug never returns and similar bugs are caught early.

**Actions:**
1. **Regression test** — The test from Step 6 stays in the test suite permanently
2. **Code comment** — If the fix is non-obvious, add a comment explaining WHY (not what)
3. **Pattern check** — Search the codebase for similar code that might have the same bug
   ```bash
   grep -rn "similar_pattern" src/
   ```
4. **Documentation** — Update bugs.md with the resolution
5. **Systemic fix** — If this bug reveals a category of issues (e.g., "we never validate timezone offsets"), consider a broader fix or a lint rule

---

## Anti-Patterns

### Shotgun Debugging

**What:** Changing random things until the bug goes away.
**Why it is bad:** You do not know WHAT fixed it. You may have introduced new bugs. You may have masked the symptom without fixing the cause.
**Instead:** Follow the 7-step process.

### Fix and Forget

**What:** Fixing the bug without writing a regression test.
**Why it is bad:** The bug will return when someone refactors the code. You or a colleague will waste time debugging the same issue again.
**Instead:** Always complete Steps 6 and 7.

### Premature Optimization as "Fix"

**What:** Rewriting the entire module because you found a bug in one function.
**Why it is bad:** Introduces new bugs while fixing the old one. Takes 10x longer. Changes behavior beyond the bug.
**Instead:** Minimal fix first. Refactoring is a separate task.

### Debugging by Adding Complexity

**What:** Adding more code to work around the bug instead of fixing the root cause.
**Why it is bad:** The root cause still exists. The workaround adds maintenance burden and may fail under different conditions.
**Instead:** Find and fix the root cause. Simple is better.

### Ignoring Intermittent Failures

**What:** Dismissing bugs that "only happen sometimes."
**Why it is bad:** Intermittent bugs are usually race conditions, timing issues, or resource exhaustion — the most dangerous category.
**Instead:** Run the repro many times, instrument with timestamps, look for concurrent access patterns.

---

## Relationship with Failure-Loop-Detect Hook

The VIBE Framework includes a `failure-loop-detect` hook that fires when Claude fails at the same task 3 times consecutively. This is complementary to Emmet's debugging workflow:

**The hook's job:** Stop the unproductive loop. Prevent Claude from trying the same broken approach a 4th time.

**Emmet's job:** Provide a structured method to actually solve the problem.

**How they work together:**

```
Claude attempts fix → fails
Claude attempts fix again → fails
Claude attempts fix a third time → fails
→ Hook fires: "STOP. You've failed 3 times on this task."
→ User runs: /vibe:emmet debug
→ Emmet starts fresh from Step 1 (Reproduce)
→ Systematic process replaces the failed ad-hoc approach
```

**Key insight:** The hook fires because Claude was skipping Steps 1-4 and going straight to Step 5 (Fix). Emmet forces the discipline of understanding before fixing.

**After the hook fires, Emmet MUST:**
1. NOT look at previous failed attempts (they are tainted by incorrect assumptions)
2. Start fresh from Step 1
3. Form NEW hypotheses (not rehash old ones)
4. Treat it as a new investigation

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
| Auth | 403/401 errors, works for some users | Missing permission, expired token |
| Concurrency | Data corruption, duplicate records | Missing lock, no idempotency key |

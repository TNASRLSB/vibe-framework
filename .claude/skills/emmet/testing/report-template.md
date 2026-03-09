# Test Report Template

## Overview

Template per generare report bug con `/emmet report`.

---

## Template

```markdown
# Test Report: [Scope/Feature]

**Date:** YYYY-MM-DD
**Tester:** Claude (emmet skill)
**Scope:** [What was tested]
**Plan Reference:** [Link to test plan if available]

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **N** |

### Verdict

- [ ] **PASS** - No Critical/High issues, ready for release
- [ ] **CONDITIONAL** - Minor issues, can release with known issues
- [ ] **FAIL** - Critical/High issues must be fixed

---

## Static Analysis Results

### Security Issues

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| SEC-001 | Critical | path:line | [Description] | Open |
| SEC-002 | High | path:line | [Description] | Open |

### Logic Issues

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| LOG-001 | High | path:line | [Description] | Open |

### Code Quality Issues

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| QUA-001 | Medium | path:line | [Description] | Open |

---

## Browser Test Results

> Questa sezione e generata automaticamente dagli afterEach/afterAll hooks
> durante l'esecuzione dei test. Il report raw si trova in `e2e/report.md`.

### Test Results (dal report hook)

- PASS: UC-001 Login flow (1.2s)
- PASS: UC-002 Dashboard load (0.8s)
- FAIL #1: UC-003 Profile update
  - **Durata:** 3.4s
  - **Errore:** `Expected "saved" but got timeout`
  - **Screenshot:** ![fail-1](e2e/screenshots/fail-1.png)

### Summary

| | Count |
|---|---|
| Passed | N |
| Failed | N |
| Total | N |
| Duration | Ns |

### Issues Found

- UC-003 Profile update: Expected "saved" but got timeout

### Failed Tests (dettaglio)

| ID | Journey | Step | Expected | Actual |
|----|---------|------|----------|--------|
| JRN-001 | UC-003 Profile update | Submit form | Success message | Timeout |

---

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

### Failed Unit Tests

| ID | Funzione | Test | Input | Expected | Actual |
|----|----------|------|-------|----------|--------|
| UNI-001 | functionB | negative input | `-5` | `Error` | `NaN` |

---

## Bug Details

### [BUG-001] Title

**Severity:** Critical | High | Medium | Low
**Category:** Security | Logic | UI | Performance | Integration
**Status:** Open | In Progress | Fixed | Won't Fix

**Location:**
- File: `path/to/file.ts:42`
- Function: `functionName()`

**Description:**
[Clear description of the bug]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Observe bug]

**Evidence:**
- Screenshot: `path/to/screenshot.png`
- Video: `path/to/video.webm`
- Logs: [Relevant log output]

**Code:**
```typescript
// Problematic code
```

**Suggested Fix:**
```typescript
// Suggested fix
```

**Impact:**
[What is affected if not fixed]

**Related:**
- Related bug: BUG-XXX
- Related spec: spec-name.md

---

## Recommendations

### Must Fix (Before Release)

1. **BUG-001**: [Brief description] - [Why critical]
2. **BUG-002**: [Brief description] - [Why critical]

### Should Fix (Soon)

1. **BUG-003**: [Brief description]
2. **BUG-004**: [Brief description]

### Nice to Have

1. **BUG-005**: [Brief description]

---

## Test Coverage

### Areas Tested

- [x] Authentication flow
- [x] Main user journey
- [ ] Edge cases (partial)
- [ ] Performance (not tested)

### Areas Not Tested

- [Area 1]: [Reason]
- [Area 2]: [Reason]

---

## Environment

- **Application Version:** [version]
- **Browser(s):** [browsers tested]
- **OS:** [operating system]
- **Test Environment:** [local/staging/production]
- **Test Architecture:** single-window fixture, sequential execution
- **E2E Target:** [local dev / production URL]

---

## Appendix

### A. Full Test Output

[Attach or link to full test runner output]

### B. Screenshots

[Attach or link to all screenshots]

### C. Related Documents

- Test Plan: `path/to/test-plan.md`
- Spec: `path/to/spec.md`
- Previous Report: `path/to/previous-report.md`
```

---

## Severity Definitions

| Level | Definition | SLA |
|-------|------------|-----|
| **Critical** | Security vulnerability, data loss, app crash | Fix immediately |
| **High** | Feature broken, blocking workflow | Fix before release |
| **Medium** | Feature impaired, workaround exists | Fix soon |
| **Low** | Cosmetic, minor inconvenience | Fix when convenient |

---

## Bug ID Convention

- `SEC-XXX` - Security issues
- `LOG-XXX` - Logic bugs
- `QUA-XXX` - Code quality
- `PER-XXX` - Performance
- `JRN-XXX` - Journey/UI bugs
- `UNI-XXX` - Unit test failures
- `INT-XXX` - Integration issues

---

## Usage

When `/emmet report` is invoked:

1. **Gather results** - Collect outputs from `/emmet test`
2. **Categorize bugs** - Assign IDs and severity
3. **Generate report** - Fill template
4. **Output** - Save to `.emmet/test-report.md`
5. **Summary** - Provide executive summary to user

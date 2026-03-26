# Report Templates

Standard output formats for Emmet's reports. Use these templates to ensure consistent, machine-readable, and human-scannable output.

---

## Test Results Report

```markdown
# Test Results — [Project Name]
**Date:** YYYY-MM-DD
**Runner:** [vitest / jest / pytest / go test / etc.]
**Scope:** [full / unit-only / visual-only / static-only]

## Summary

| Metric | Count |
|--------|-------|
| Total tests | X |
| Passed | X |
| Failed | X |
| Skipped | X |
| Duration | Xs |

## Coverage by Entry Point

| Entry Point | Type | Tests | Status |
|-------------|------|-------|--------|
| `POST /api/users` | API endpoint | 5 | Covered |
| `parseAmount()` | Pure function | 8 | Covered |
| `Dashboard` page | UI component | 0 | NOT COVERED |
| `sendEmail()` | Side-effectful | 2 | Partial |

**Entry point coverage:** X/Y (Z%)

## Failed Tests

### [test name]
- **File:** [path]
- **Error:** [error message]
- **Expected:** [value]
- **Actual:** [value]
- **Likely cause:** [brief analysis]

### [test name]
...

## Critical Findings

Bugs discovered during testing (not pre-existing test failures):

1. **[Finding title]**
   - **Severity:** Critical / High / Medium / Low
   - **Location:** [file:line]
   - **Description:** [what is wrong]
   - **Impact:** [what breaks]
   - **Reproduction:** [steps]

## Static Analysis

| Category | Count | Details |
|----------|-------|---------|
| Type errors | X | [summary] |
| Unused variables | X | [summary] |
| Unreachable code | X | [summary] |
| Linter warnings | X | [summary] |

## Persona Test Results

| Persona | Scenarios | Pass | Fail | Critical Issues |
|---------|-----------|------|------|-----------------|
| First-timer | 5 | 4 | 1 | CTA not visible above fold |
| Mobile-only | 7 | 5 | 2 | Touch targets too small, slow LCP |
| Screen reader | 10 | 7 | 3 | Missing ARIA labels on nav |
| ... | | | | |

## Recommendations

1. **[Priority: High]** [Recommendation with specific action]
2. **[Priority: Medium]** [Recommendation with specific action]
3. **[Priority: Low]** [Recommendation with specific action]
```

---

## Tech Debt Report

```markdown
# Tech Debt Audit — [Project Name]
**Date:** YYYY-MM-DD
**Files scanned:** X
**Total findings:** X

## Summary by Severity

| Severity | Count | Estimated Effort |
|----------|-------|-----------------|
| Critical | X | Xh |
| High | X | Xh |
| Medium | X | Xh |
| Low | X | Xh |
| **Total** | **X** | **Xh** |

## Critical Findings

Issues that pose production risk or data integrity concerns.

### [TD-001] [Title]
- **Category:** [Duplication / Dead code / Complexity / Security / etc.]
- **Location:** `[file:line]`
- **Description:** [What is wrong]
- **Risk:** [What could go wrong]
- **Fix:** [Suggested approach]
- **Effort:** S / M / L
- **Dependencies:** [Other findings this blocks or is blocked by]

## High Findings

Issues that impact performance or maintainability significantly.

### [TD-002] [Title]
...

## Medium Findings

Code quality and readability concerns.

### [TD-003] [Title]
...

## Low Findings

Style inconsistencies and minor cleanup opportunities.

### [TD-004] [Title]
...

## Metrics

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Largest file | X lines (`path`) | 300 lines | OVER |
| Deepest nesting | X levels (`path:line`) | 3 levels | OVER |
| Unused exports | X | 0 | OVER |
| TODO/FIXME count | X | — | INFO |
| Duplicate blocks | X | 0 | INFO |
| Outdated deps | X | 0 | INFO |

## Recommended Action Plan

Prioritized order to address tech debt:

1. **[TD-001]** — Critical, fixes production risk. Do this first.
2. **[TD-002]** — High, unblocks performance improvement.
3. **[TD-003]** — Medium, can be done during next refactoring sprint.
4. **[TD-004]** — Low, opportunistic cleanup.
```

---

## Functional Map

```markdown
# Functional Codebase Map — [Project Name]
**Date:** YYYY-MM-DD
**Framework:** [Next.js / Express / Django / etc.]
**Language:** [TypeScript / Python / Go / etc.]

## Entry Points

### API Routes

| Method | Route | Handler | Auth | Description |
|--------|-------|---------|------|-------------|
| GET | `/api/users` | `src/routes/users.ts:getUsers` | Yes | List all users |
| POST | `/api/users` | `src/routes/users.ts:createUser` | Yes | Create new user |
| ... | | | | |

### Pages / Views

| Route | Component | Data Source | Description |
|-------|-----------|-------------|-------------|
| `/` | `src/pages/Home.tsx` | `getHomeData()` | Landing page |
| `/dashboard` | `src/pages/Dashboard.tsx` | `getDashboardData()` | Main dashboard |
| ... | | | |

### CLI Commands

| Command | Handler | Description |
|---------|---------|-------------|
| `migrate` | `src/cli/migrate.ts` | Run database migrations |
| ... | | |

### Event Listeners / Cron Jobs

| Event / Schedule | Handler | Description |
|-----------------|---------|-------------|
| `user.created` | `src/events/onUserCreated.ts` | Send welcome email |
| `0 0 * * *` | `src/cron/dailyCleanup.ts` | Remove expired sessions |
| ... | | |

## Core Functions

### Business Logic

| Function | Location | Pure | Inputs | Outputs | Tested |
|----------|----------|------|--------|---------|--------|
| `calculateDiscount` | `src/pricing.ts:15` | Yes | `(price, rules)` | `number` | Yes |
| `validateOrder` | `src/orders.ts:42` | Yes | `(order)` | `{valid, errors}` | No |
| ... | | | | | |

### Data Layer

| Function | Location | Type | Description | Tested |
|----------|----------|------|-------------|--------|
| `findUserById` | `src/db/users.ts:10` | DB Read | Fetch user by ID | Yes |
| `saveOrder` | `src/db/orders.ts:25` | DB Write | Insert order + items | No |
| `fetchExchangeRate` | `src/api/rates.ts:5` | External API | Get current FX rate | No |
| ... | | | | |

## Dependencies Graph

```
Request → Router → Controller → Service → Repository → Database
                              ↘ Validator
                              ↘ External API
```

### Key Dependency Chains

| Flow | Chain |
|------|-------|
| User signup | `POST /api/users` → `UserController.create` → `UserService.register` → `UserRepo.insert` + `EmailService.sendWelcome` |
| Place order | `POST /api/orders` → `OrderController.create` → `validateOrder` → `calculateDiscount` → `OrderRepo.save` → `PaymentService.charge` |
| ... | |

## State Management

| State | Location | Scope | Persistence |
|-------|----------|-------|-------------|
| User session | Cookie + Redis | Per-user | 24h TTL |
| Cart | localStorage | Per-browser | Until cleared |
| App config | `src/config.ts` | Global | Loaded at startup |
| ... | | | |

## Test Coverage Map

| Area | Files | Tested | Coverage |
|------|-------|--------|----------|
| API Routes | 12 | 8 | 67% |
| Business Logic | 6 | 4 | 67% |
| Data Layer | 8 | 3 | 38% |
| Utils | 15 | 10 | 67% |
| UI Components | 20 | 5 | 25% |
| **Total** | **61** | **30** | **49%** |

## Untested Critical Paths

Functions or paths that handle money, auth, or data integrity but lack tests:

1. `validateOrder` — validates order before payment, no tests
2. `PaymentService.charge` — processes payment, no tests
3. `UserService.changePassword` — security-critical, no tests
```

---

## Debug Report

```markdown
# Debug Report — [Bug Title]
**Date:** YYYY-MM-DD
**Reported by:** [source]
**Severity:** Critical / High / Medium / Low

## Reproduction
- **Status:** Confirmed / Cannot Reproduce / Intermittent
- **Steps:**
  1. [step]
  2. [step]
  3. [step]
- **Expected:** [description]
- **Actual:** [description]

## Isolation
- **File:** `[path]`
- **Function:** `[name]`
- **Lines:** [range]
- **Trigger:** [specific condition]

## Hypotheses
1. ~~[Hypothesis 1]~~ — ELIMINATED: [evidence]
2. **[Hypothesis 2]** — CONFIRMED: [evidence]
3. ~~[Hypothesis 3]~~ — ELIMINATED: [evidence]

## Root Cause
[Clear explanation of what caused the bug and why]

## Fix
- **File:** `[path]`
- **Change:** [description of the fix]
- **Lines changed:** [count]

## Validation
- [ ] Test fails without fix
- [ ] Test passes with fix
- [ ] All existing tests still pass

## Prevention
- [ ] Regression test added
- [ ] Code comment added (if non-obvious)
- [ ] Similar patterns checked elsewhere
- [ ] bugs.md updated
```

---

## Usage Notes

- Fill in all applicable sections. Remove sections that do not apply.
- Use exact file paths and line numbers — not approximations.
- For severity ratings: Critical = production broken, High = significant impact, Medium = noticeable but workable, Low = cosmetic or minor.
- Effort estimates: S = under 1 hour, M = 1-4 hours, L = 4+ hours.
- When Emmet outputs for other skills (machine consumption), use the same structure but output as JSON instead of Markdown.

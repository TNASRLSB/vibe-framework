# Testing & Quality Checklists

Concrete, numbered checklists for different quality checkpoints. Each item is a specific check, not a vague guideline.

---

## Pre-Deploy Checklist

Run before every deployment. Every item must pass.

1. All automated tests pass (`npm test` / `pytest` / equivalent)
2. No TypeScript errors (`npx tsc --noEmit`)
3. No linter errors or warnings (`eslint` / `ruff` / `clippy`)
4. No `console.log`, `print()`, `dbg!()`, or debug statements in production code
5. No `TODO` or `FIXME` comments in code being deployed (either fix them or remove them)
6. All new environment variables are documented and set in production config
7. Database migrations have been tested: migrate up, verify data, migrate down, migrate up again
8. No hardcoded secrets, API keys, or credentials in source code
9. All API endpoints return appropriate error responses (not stack traces)
10. No N+1 query patterns in new or changed code
11. No unbounded loops or queries without limits (e.g., `SELECT *` without `LIMIT`)
12. Static assets are minified and compressed (for web projects)
13. Images have appropriate alt text (for web projects)
14. All forms have server-side validation (not just client-side)
15. Rate limiting is configured for public-facing endpoints
16. CORS headers are correct (not `*` in production)
17. Cache headers are set appropriately for static and dynamic content
18. Error monitoring is configured (Sentry, LogRocket, or equivalent)
19. Feature flags are set correctly for the deployment target
20. Rollback plan is documented (how to revert if this deployment breaks things)

---

## Code Review Checklist

Use when reviewing code changes (yours or others').

### Correctness
1. Does the code do what the spec/ticket describes?
2. Are all edge cases handled? (null, empty, max values, concurrent access)
3. Is error handling appropriate? (not swallowing errors, not over-catching)
4. Are async operations properly awaited?
5. Is input validated at system boundaries?

### Readability
6. Can you understand each function without reading its callers?
7. Are variable and function names descriptive? (no `data`, `temp`, `result`, `stuff`)
8. Are complex conditions extracted into named variables or functions?
9. Are magic numbers replaced with named constants?
10. Are comments explaining WHY, not WHAT? (or better: is the code clear enough without comments?)

### Architecture
11. Does this change follow existing patterns in the codebase?
12. Is there code duplication that should be extracted?
13. Are new dependencies justified? (not adding a library for one function)
14. Is the abstraction level appropriate? (not over-engineered for current needs)
15. Are side effects isolated and predictable?

### Security
16. Is user input sanitized before use in queries, HTML, or file paths?
17. Are authentication checks in place for protected routes?
18. Are authorization checks in place (user can only access their own data)?
19. Are secrets properly managed (env vars, not hardcoded)?
20. Is sensitive data excluded from logs?

### Performance
21. Are database queries indexed for the access patterns used?
22. Is pagination implemented for list endpoints?
23. Are expensive operations cached where appropriate?
24. Is there a risk of memory leaks? (event listeners not cleaned up, growing arrays)
25. Are large files or datasets streamed, not loaded entirely into memory?

### Testing
26. Are new functions covered by tests?
27. Do tests test behavior, not implementation?
28. Are tests independent (can run in any order)?
29. Do test names describe the scenario and expected outcome?
30. Are edge cases tested (not just the happy path)?

---

## Refactoring Safety Checklist

Use before and during refactoring to ensure nothing breaks.

### Before Starting
1. All existing tests pass (this is your safety net)
2. You have identified ALL callers of the code being refactored
   ```bash
   grep -rn "function_name" src/
   ```
3. You have documented the current behavior (inputs, outputs, side effects)
4. You have a clear goal for the refactoring (not "make it better")
5. You have estimated the scope (number of files, number of changes)

### During Refactoring
6. Make one type of change at a time (rename, then extract, then restructure — not all at once)
7. Run tests after EACH change, not just at the end
8. If tests fail, revert the last change and investigate — do not push forward
9. Keep the same public API unless the refactoring specifically changes it
10. Do not change behavior while refactoring — behavior changes are a separate commit

### After Refactoring
11. All original tests still pass without modification
12. If tests were modified, each modification is justified (not just "updated to match new code")
13. No new warnings from linter or type checker
14. Manual spot-check: does the application still work for the primary use case?
15. The code is ACTUALLY simpler/better (not just different)

---

## Security Testing Checklist

Quick security verification for web applications.

### Authentication
1. Login fails with wrong password (not "user not found" vs "wrong password" — same error)
2. Login fails with empty credentials
3. Brute force protection: account locks or delays after 5+ failed attempts
4. Session expires after inactivity timeout
5. Logout actually invalidates the session (not just removes client-side cookie)
6. Password reset token expires after use and after time limit

### Authorization
7. User A cannot access User B's data by changing IDs in URLs
8. Non-admin cannot access admin endpoints
9. Deleted/deactivated users cannot log in
10. API tokens have minimum necessary permissions (not full access)
11. File uploads cannot overwrite existing files in unexpected locations

### Input Handling
12. XSS: `<script>alert(1)</script>` is escaped in all output contexts
13. SQL injection: `' OR 1=1 --` does not bypass queries
14. Path traversal: `../../etc/passwd` does not access files outside allowed directories
15. Command injection: `` `; rm -rf /` `` does not execute in system calls
16. File type validation: uploading .exe as .jpg is rejected
17. File size limits are enforced server-side
18. JSON/XML input with deeply nested structures does not cause stack overflow

### Data Protection
19. Passwords are hashed (bcrypt, argon2, scrypt — not MD5 or SHA1)
20. Sensitive data is not logged (passwords, tokens, credit card numbers)
21. API responses do not include fields the user should not see
22. HTTPS is enforced (HTTP redirects to HTTPS)
23. Cookies have `HttpOnly`, `Secure`, and `SameSite` flags
24. CORS is configured to allow only expected origins

### Headers and Configuration
25. `X-Content-Type-Options: nosniff` is set
26. `X-Frame-Options: DENY` or `SAMEORIGIN` is set (or CSP frame-ancestors)
27. `Content-Security-Policy` is configured and not `unsafe-inline` for scripts
28. Server version headers are removed (`X-Powered-By`, `Server`)
29. Directory listing is disabled
30. Error pages do not reveal stack traces or internal paths

---

## Tech Debt Checklist

Categories to scan during a tech debt audit.

### Code Duplication
1. Functions that do nearly the same thing with slight variations
2. Copy-pasted blocks across files
3. Similar data transformations repeated in multiple places
4. Test setup code duplicated across test files

### Dead Code
5. Functions that are exported but never imported
6. Variables that are assigned but never read
7. Feature flags for features that shipped long ago
8. Commented-out code blocks
9. Unreachable branches (conditions that can never be true)

### Complexity
10. Files over 300 lines
11. Functions over 50 lines
12. More than 3 levels of nesting (if within if within if)
13. Functions with more than 5 parameters
14. Cyclomatic complexity over 10

### Consistency
15. Mixed async patterns (callbacks AND promises AND async/await)
16. Inconsistent naming conventions across files
17. Multiple ways to do the same thing (e.g., 3 different HTTP clients)
18. Inconsistent error handling (some throw, some return null, some return error objects)

### Dependencies
19. Packages in manifest that are not imported anywhere
20. Packages with known security vulnerabilities (`npm audit` / `pip-audit`)
21. Packages that are severely outdated (2+ major versions behind)
22. Multiple packages that do the same thing (e.g., moment AND dayjs AND date-fns)

### Missing Tests
23. Public API endpoints without test coverage
24. Utility functions without unit tests
25. Error paths without test coverage
26. Edge cases mentioned in code comments but not tested

### Documentation
27. Public functions without clear parameter descriptions
28. Complex algorithms without explanation
29. Non-obvious business rules without documentation
30. Setup steps that are tribal knowledge (not written anywhere)

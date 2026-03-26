# Testing Strategies Reference

This document provides in-depth testing strategy guidance. Emmet's SKILL.md references this during test planning and writing.

---

## When to Use Each Test Type

### Unit Tests

**Use when:**
- Function is pure (same input → same output, no side effects)
- Logic is complex enough to have edge cases
- Function is a utility used in multiple places
- You are testing transformations, calculations, parsing, formatting

**Do NOT use when:**
- Behavior depends on database state
- Function is a thin wrapper around a library
- The test would just restate the implementation

**Example decision:** A `formatCurrency(amount, locale)` function → unit test. A `saveCurrency(amount)` function that writes to DB → integration test.

### Integration Tests

**Use when:**
- Testing API endpoints end-to-end
- Verifying database queries return correct data
- Testing interactions between modules
- Validating authentication/authorization flows

**Key rule:** Hit real services. Use a test database, not mocks. The gap between mock behavior and real behavior is where production bugs hide.

**Setup pattern:**
1. Before each test: seed database with known state
2. Run the operation
3. Assert on the result AND the database state
4. After each test: clean up (transaction rollback or truncate)

### Visual / E2E Tests

**Use when:**
- User-facing flows (signup, checkout, onboarding)
- Layout and responsive behavior matters
- Accessibility compliance is required
- Cross-browser behavior needs verification

**Key rule:** Use real browsers (Playwright headed mode), not JSDOM simulations. Visual bugs are invisible to unit tests.

### Property-Based Tests

**Use when:**
- Function should work for ANY valid input, not just known examples
- Serialization/deserialization roundtrips (parse → format → parse = identity)
- Mathematical properties (commutative, associative, idempotent)
- Sorting/filtering invariants

**Example:** For a `sort()` function:
- Property: output length equals input length
- Property: every element in output was in input
- Property: output is in ascending order
- Test: generate 1000 random arrays, verify all properties hold

---

## Test File Structure

### Naming Convention

| Language | Test file naming | Location |
|----------|-----------------|----------|
| JavaScript/TypeScript | `*.test.ts` or `*.spec.ts` | Co-located: `src/utils/format.ts` → `src/utils/format.test.ts` |
| Python | `test_*.py` | `tests/` directory mirroring `src/` structure |
| Go | `*_test.go` | Same package, same directory |
| Rust | `#[cfg(test)] mod tests` | Same file, or `tests/` for integration |

### File Organization

```
describe('[ModuleName]', () => {
  describe('[functionName]', () => {
    describe('valid inputs', () => {
      it('handles typical case', ...);
      it('handles edge case: empty input', ...);
      it('handles edge case: maximum value', ...);
    });

    describe('invalid inputs', () => {
      it('rejects null input', ...);
      it('rejects wrong type', ...);
    });

    describe('boundary conditions', () => {
      it('handles zero', ...);
      it('handles negative numbers', ...);
      it('handles MAX_SAFE_INTEGER', ...);
    });
  });
});
```

---

## Table-Driven Tests

The most efficient pattern for testing functions with many input/output combinations.

### JavaScript/TypeScript Example

```typescript
describe('parseAmount', () => {
  const cases = [
    { input: '$1,234.56',  expected: 1234.56,  name: 'US format with comma' },
    { input: '1.234,56 €', expected: 1234.56,  name: 'EU format with period' },
    { input: '0',          expected: 0,         name: 'zero' },
    { input: '-$50.00',    expected: -50,       name: 'negative amount' },
    { input: '',           expected: null,       name: 'empty string' },
    { input: 'abc',        expected: null,       name: 'non-numeric string' },
  ];

  cases.forEach(({ input, expected, name }) => {
    it(`parses ${name}: "${input}" → ${expected}`, () => {
      expect(parseAmount(input)).toBe(expected);
    });
  });
});
```

### Python Example

```python
import pytest

@pytest.mark.parametrize("input_val,expected", [
    ("$1,234.56", 1234.56),
    ("1.234,56 €", 1234.56),
    ("0", 0),
    ("-$50.00", -50),
    ("", None),
    ("abc", None),
])
def test_parse_amount(input_val, expected):
    assert parse_amount(input_val) == expected
```

### Go Example

```go
func TestParseAmount(t *testing.T) {
    cases := []struct {
        name     string
        input    string
        expected float64
        wantErr  bool
    }{
        {"US format", "$1,234.56", 1234.56, false},
        {"EU format", "1.234,56 €", 1234.56, false},
        {"zero", "0", 0, false},
        {"empty string", "", 0, true},
    }

    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got, err := ParseAmount(tc.input)
            if tc.wantErr && err == nil {
                t.Fatal("expected error, got nil")
            }
            if !tc.wantErr && got != tc.expected {
                t.Errorf("got %v, want %v", got, tc.expected)
            }
        })
    }
}
```

---

## Boundary Value Analysis

For every function parameter, identify:

1. **Minimum valid value** — test it and one below
2. **Maximum valid value** — test it and one above
3. **Type boundaries** — 0, -1, MAX_INT, empty string, empty array
4. **Special values** — null, undefined, NaN, Infinity, empty object

### Systematic Boundary Table

| Parameter Type | Test Values |
|---------------|-------------|
| Number | 0, -1, 1, MIN_SAFE, MAX_SAFE, NaN, Infinity, -Infinity |
| String | "", " ", single char, max length, unicode, emoji, RTL, null bytes |
| Array | [], [single], [many], sparse array, nested arrays |
| Object | {}, missing keys, extra keys, nested nulls |
| Date | epoch, far future, far past, timezone boundary, DST transition, leap day |
| File path | empty, relative, absolute, with spaces, unicode, symlinks, missing parent |

---

## Test Independence

**Critical rule:** Every test must be independent. It must pass when run alone and in any order.

Common violations:
- Test B depends on state created by Test A
- Tests share a global variable that is mutated
- Tests depend on specific database state from a previous test
- Tests depend on system clock or file system ordering

Fix: Each test sets up its own state in `beforeEach` / `setUp` and tears it down in `afterEach` / `tearDown`.

---

## What NOT to Test

- **Third-party library internals** — trust the library, test your usage of it
- **Framework glue code** — trivial wiring (e.g., `app.use(router)`) does not need tests
- **Constants and config** — test the behavior that uses them, not the values themselves
- **Private methods directly** — test through the public API; if a private method is complex enough to need its own test, it should be extracted into its own module

---

## Test Quality Signals

A test is good if:
- It fails when the tested behavior breaks
- It does NOT fail when unrelated code changes (not brittle)
- The failure message tells you exactly what went wrong
- Reading the test tells you what the function does (documentation value)

A test is bad if:
- It tests implementation details (mock call counts, internal state)
- It passes even when the code is obviously broken
- It requires reading the implementation to understand the test
- It takes more than a few seconds to run (for unit tests)

---

## Coverage Strategy

**Do not chase 100% line coverage.** Coverage measures what code was executed, not what was verified.

Better metric: **entry point coverage** — what percentage of public functions/endpoints have at least one meaningful test?

Priority order:
1. Functions that handle money, auth, or data integrity → 100%
2. Core business logic → 90%+
3. Utility functions → test complex ones, skip trivial ones
4. UI components → visual tests for critical flows
5. Configuration/setup code → manual verification is fine

# Testing Strategies — Quick Reference

Code patterns, naming conventions, and checklists for test planning. Generic "when to use each test type" guidance is not included — you already know that.

---

## Table-Driven Tests

The most efficient pattern for testing functions with many input/output combinations.

### JavaScript/TypeScript

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

### Python

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

### Go

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
            if tc.wantErr && err == nil { t.Fatal("expected error") }
            if !tc.wantErr && got != tc.expected { t.Errorf("got %v, want %v", got, tc.expected) }
        })
    }
}
```

---

## Boundary Value Analysis

| Parameter Type | Test Values |
|---------------|-------------|
| Number | 0, -1, 1, MIN_SAFE, MAX_SAFE, NaN, Infinity, -Infinity |
| String | "", " ", single char, max length, unicode, emoji, RTL, null bytes |
| Array | [], [single], [many], sparse array, nested arrays |
| Object | {}, missing keys, extra keys, nested nulls |
| Date | epoch, far future, far past, timezone boundary, DST transition, leap day |
| File path | empty, relative, absolute, with spaces, unicode, symlinks, missing parent |

---

## Test File Naming

| Language | Test file | Location |
|----------|----------|----------|
| JS/TS | `*.test.ts` / `*.spec.ts` | Co-located: `src/utils/format.test.ts` |
| Python | `test_*.py` | `tests/` mirroring `src/` |
| Go | `*_test.go` | Same package, same directory |
| Rust | `#[cfg(test)] mod tests` | Same file, or `tests/` for integration |

---

## What NOT to Test

- **Library internals** — trust the library, test your usage
- **Framework glue** — trivial wiring doesn't need tests
- **Constants** — test behavior that uses them, not values
- **Private methods** — test through public API; if complex enough to need its own test, extract it

---

## Test Quality Signals

**Good test:** Fails when behavior breaks. Does NOT fail on unrelated changes. Failure message tells you exactly what's wrong. Reading the test tells you what the function does.

**Bad test:** Tests implementation details. Passes when code is broken. Requires reading implementation to understand. Takes too long (for unit tests).

---

## Coverage Strategy

Do not chase 100% line coverage. Better metric: **entry point coverage** — what % of public functions have meaningful tests?

| Priority | Target |
|----------|--------|
| Money, auth, data integrity | 100% |
| Core business logic | 90%+ |
| Utilities | Complex ones only |
| UI components | Visual tests for critical flows |
| Config/setup | Manual verification fine |

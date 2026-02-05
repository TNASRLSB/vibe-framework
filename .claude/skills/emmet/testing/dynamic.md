# Dynamic Testing with Playwright

## Overview

Test dinamici: simulazione di utente reale tramite Playwright. Verifica comportamento effettivo dell'applicazione.

---

## When to Use

- Verifica user flows end-to-end
- Test di regressione UI
- Validazione integrazioni
- Test cross-browser
- Screenshot/video per debugging

---

## Test Categories

### 1. User Flows

| Flow | What to test |
|------|--------------|
| Authentication | Login, logout, password reset, session expiry |
| Registration | Signup, email verification, profile setup |
| Navigation | Menu, breadcrumbs, deep links, back button |
| Forms | Validation, submission, error display |
| Search | Query, filters, results, pagination |
| Checkout | Cart, payment, confirmation |

### 2. UI Interactions

| Interaction | What to verify |
|-------------|----------------|
| Click | Element responds, state changes |
| Hover | Tooltips, dropdowns appear |
| Focus | Keyboard navigation works |
| Scroll | Infinite scroll, lazy load |
| Drag & Drop | Items move correctly |
| Resize | Responsive behavior |

### 3. State Management

| State | What to verify |
|-------|----------------|
| Loading | Spinners, skeletons display |
| Empty | Empty states show correctly |
| Error | Error messages display |
| Success | Success feedback appears |
| Offline | Offline handling works |

---

## Playwright Script Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate, login, etc.
    await page.goto('/');
  });

  test('should [expected behavior]', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="button"]');

    // Act
    await page.fill('[data-testid="input"]', 'value');
    await page.click('[data-testid="submit"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
    await expect(page.locator('[data-testid="result"]')).toHaveText('Expected');
  });
});
```

---

## Selectors Strategy

### Priority Order

1. `data-testid` - Preferred, explicit for testing
2. `role` - Accessibility-based
3. `text` - User-visible content
4. `css` - Last resort

### Examples

```typescript
// Best: data-testid
page.locator('[data-testid="submit-button"]')

// Good: role + name
page.getByRole('button', { name: 'Submit' })

// Good: text content
page.getByText('Submit')

// Avoid: brittle selectors
page.locator('.btn-primary.mt-4') // Breaks on style change
page.locator('#app > div > div:nth-child(3)') // Breaks on structure change
```

---

## Common Test Patterns

### Wait for Network

```typescript
// Wait for specific request
await page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);

// Wait for network idle
await page.waitForLoadState('networkidle');
```

### Handle Modals

```typescript
// Wait for modal
await page.waitForSelector('[role="dialog"]');

// Close modal
await page.click('[aria-label="Close"]');

// Confirm modal closed
await expect(page.locator('[role="dialog"]')).not.toBeVisible();
```

### Form Testing

```typescript
// Fill form
await page.fill('[name="email"]', 'test@example.com');
await page.fill('[name="password"]', 'password123');

// Submit
await page.click('button[type="submit"]');

// Verify validation error
await expect(page.locator('.error-message')).toBeVisible();
```

### Authentication Flow

```typescript
// Login helper
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

---

## Capturing Evidence

### Screenshots

```typescript
// On failure (automatic with Playwright)
// Manual screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Screenshot specific element
await page.locator('[data-testid="chart"]').screenshot({ path: 'chart.png' });
```

### Video

```typescript
// In playwright.config.ts
export default defineConfig({
  use: {
    video: 'on-first-retry', // or 'on' for always
  },
});
```

### Traces

```typescript
// Enable tracing
await context.tracing.start({ screenshots: true, snapshots: true });

// ... run test ...

// Save trace
await context.tracing.stop({ path: 'trace.zip' });
```

---

## Error Documentation

When a test fails, document:

```markdown
### [BUG-XXX] Bug Title

**Flow:** User flow being tested
**Step:** Which step failed
**Expected:** What should happen
**Actual:** What actually happened

**Evidence:**
- Screenshot: `screenshots/bug-xxx.png`
- Video: `videos/bug-xxx.webm`
- Trace: `traces/bug-xxx.zip`

**Environment:**
- Browser: Chrome 120
- Viewport: 1920x1080
- OS: macOS 14

**Steps to Reproduce:**
1. Navigate to /page
2. Click button X
3. Observe error Y
```

---

## Execution Workflow

### Step 1: Identify Flow

```
/emmet journey login
```

Identifies the login flow to test.

### Step 2: Generate Script

Claude generates Playwright script based on:
- Flow requirements
- Existing test patterns
- Application structure

### Step 3: Execute

```bash
npx playwright test tests/journey/login.spec.ts
```

### Step 4: Capture Results

- Pass: Update test report
- Fail: Capture screenshot/video, document bug

### Step 5: Report

Generate report with:
- Tests run
- Pass/fail count
- Bug details with evidence
- Recommendations

---

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  reporter: [['html'], ['json', { outputFile: 'results.json' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

---

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Use fixtures** - Share setup between tests
3. **Avoid sleep** - Use `waitFor*` methods
4. **Test one thing** - Each test verifies one behavior
5. **Clean up** - Reset state after tests
6. **Parallelize** - Run tests concurrently when possible
7. **Retry flaky tests** - Configure retries for unstable tests

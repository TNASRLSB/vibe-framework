# Visual Testing Personas Reference

Complete persona definitions with Playwright configurations for experiential visual testing.

---

## Overview

Each persona simulates a real user type with specific device characteristics, network conditions, and behavioral patterns. Tests evaluate the application through each persona's lens, catching issues that pure functional tests miss.

All personas use Playwright in **headed mode** (`headless: false`) to enable visual verification and Chrome MCP integration.

---

## Persona 1: First-Timer

**Profile:** Has never seen the product. Arrived from a search result or ad. Impatient — will leave if confused within 10 seconds.

### Playwright Configuration

```typescript
{
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  // No network throttling — fast connection
}
```

### Test Scenarios

1. **Landing page clarity** — Can the user understand what the product does within 5 seconds? Check for visible headline, clear value proposition, obvious CTA.
2. **Onboarding flow** — Navigate from landing to first meaningful action. Count clicks. Goal: under 3 clicks to value.
3. **Navigation discoverability** — Without prior knowledge, can the user find key features?
4. **Error state on first interaction** — Deliberately trigger an error. Is the error message helpful?
5. **Time-to-first-value** — Measure clicks and time from landing to first successful outcome.

### Screenshot Points
- Landing page (above fold)
- After first CTA click
- First form or input screen
- Success/completion state
- Error state (if triggered)

---

## Persona 2: Power User

**Profile:** Uses the product daily. Knows keyboard shortcuts. Expects speed and efficiency. Frustrated by unnecessary confirmation dialogs.

### Playwright Configuration

```typescript
{
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/Chicago',
  // No network throttling — fast connection
}
```

### Test Scenarios

1. **Keyboard navigation** — Can the entire primary workflow be completed without a mouse? Tab order, Enter to submit, Escape to cancel.
2. **Bulk operations** — Select all, bulk delete, bulk edit. Do they work without page reload?
3. **Complex workflow** — Execute the longest, most complex user path. Check for state consistency.
4. **Rapid repeated actions** — Click the same button 10 times quickly. Does it handle debouncing?
5. **Edge case data** — Enter maximum-length text, special characters, very large numbers.
6. **Performance under load** — Page with 100+ items. Does it paginate or virtualize? Is scroll smooth?

### Screenshot Points
- Dashboard with data loaded
- Bulk selection state
- Complex form fully filled
- After rapid action sequence
- Large dataset rendering

---

## Persona 3: Non-Tech User

**Profile:** Age 55+, low digital literacy. Uses browser at default zoom or larger. Reads everything before clicking. Panics at error messages.

### Playwright Configuration

```typescript
{
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1.5, // Simulates 150% zoom
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  // Average network: no extreme throttling
}
```

### Network Throttling (Average)

```typescript
{
  downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
  uploadThroughput: 1 * 1024 * 1024 / 8,   // 1 Mbps
  latency: 100,                              // 100ms
}
```

### Test Scenarios

1. **Readability at 150% zoom** — No text truncation, no overlapping elements, no horizontal scroll.
2. **Plain language** — Check for jargon, technical terms, abbreviations. Error messages should be friendly.
3. **Click target size** — All buttons and links at least 44x44px (WCAG 2.5.5).
4. **Error recovery** — After an error, is it clear what went wrong and what to do next? Is the user's input preserved?
5. **Confirmation before destructive actions** — Delete, cancel, and irreversible actions require confirmation.
6. **Form help text** — Are input formats explained? (e.g., "Date: MM/DD/YYYY")

### Screenshot Points
- Landing page at 150% zoom
- Form with help text visible
- Error message display
- Confirmation dialog
- After recovery from error

---

## Persona 4: Mobile-Only User

**Profile:** Budget Android device, slow mobile connection. Uses touch exclusively. May have intermittent connectivity.

### Playwright Configuration

```typescript
{
  viewport: { width: 360, height: 640 },
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-A125F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
}
```

### Network Throttling (Slow 3G)

```typescript
{
  downloadThroughput: 500 * 1024 / 8,  // 500 kbps
  uploadThroughput: 250 * 1024 / 8,    // 250 kbps
  latency: 400,                         // 400ms RTT
}
```

### Test Scenarios

1. **Responsive layout** — No horizontal scroll at 360px. Content reflows correctly. No clipped text.
2. **Touch targets** — All interactive elements at least 48x48px with 8px spacing between adjacent targets.
3. **Loading performance** — First meaningful paint under 3 seconds on slow 3G. Largest contentful paint under 5 seconds.
4. **Offline behavior** — Disconnect network mid-flow. Is there a meaningful offline state? Does it recover gracefully when reconnected?
5. **Form usability** — Correct input types (email, tel, number) trigger appropriate mobile keyboard. No zoom on focus (font-size >= 16px).
6. **Image optimization** — Are images served at appropriate size? No 2000px images on a 360px screen.
7. **Scroll performance** — Smooth scrolling with 60fps on content-heavy pages.

### Screenshot Points
- Mobile landing page
- Navigation menu (hamburger open)
- Form with mobile keyboard considerations
- Loading state on slow network
- Offline state (if applicable)

---

## Persona 5: Screen Reader User

**Profile:** Blind, uses NVDA (Windows) or VoiceOver (macOS). Navigates entirely by keyboard and screen reader announcements.

### Playwright Configuration

```typescript
{
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  // No network throttling
}
```

### Test Scenarios (Automated Checks)

1. **ARIA landmarks** — Page has `main`, `navigation`, `banner`, `contentinfo` landmarks.
2. **Heading hierarchy** — Single `h1`, headings do not skip levels (no h1 → h3).
3. **Image alt text** — Every `<img>` has meaningful `alt` (or `alt=""` for decorative images).
4. **Form labels** — Every `<input>` has an associated `<label>` via `for`/`id` or `aria-labelledby`.
5. **Focus order** — Tab order follows visual reading order. No focus traps (except modals).
6. **Focus visibility** — Focus indicator is visible on all interactive elements.
7. **Live regions** — Dynamic content updates use `aria-live` to announce changes.
8. **Button vs link** — Buttons perform actions, links navigate. No `<div onclick>` pretending to be buttons.
9. **Skip navigation** — "Skip to main content" link is first focusable element.
10. **Modal behavior** — Focus is trapped in modal. Escape closes modal. Focus returns to trigger.

### Automated Accessibility Audit

```typescript
// Run axe-core after page load
const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
expect(accessibilityScanResults.violations).toEqual([]);
```

### Screenshot Points
- Page with focus indicators visible
- Form with labels highlighted
- Modal open with focus trap active
- Skip link visible on focus

---

## Persona 6: Distracted User

**Profile:** Multitasking. Opens the app, starts a task, gets interrupted, returns hours later. Multiple tabs open.

### Playwright Configuration

```typescript
{
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'Europe/London',
  // No network throttling
}
```

### Test Scenarios

1. **State preservation** — Fill a form halfway → navigate away → come back. Is the data still there?
2. **Auto-save** — Start editing content → close tab → reopen. Was work saved?
3. **Session timeout** — Wait for session to expire (or simulate it). Is the user informed? Can they resume?
4. **Stale state** — Open app in two tabs. Make a change in Tab A. Does Tab B reflect it (or warn)?
5. **Draft recovery** — Start composing (email, post, comment) → browser crash simulation → reopen. Is the draft recoverable?
6. **Inactivity handling** — Leave page idle for extended period. Does it handle token refresh? Does it show a "still there?" prompt?

### Test Implementation Pattern

```typescript
// Simulate interruption
await page.fill('#email', 'test@example.com');
await page.fill('#name', 'John');
// Navigate away
await page.goto('/other-page');
await page.waitForTimeout(2000);
// Return
await page.goBack();
// Verify state preserved
expect(await page.inputValue('#email')).toBe('test@example.com');
expect(await page.inputValue('#name')).toBe('John');
```

### Screenshot Points
- Form partially filled
- After returning from navigation away
- Session timeout notice
- Draft recovery prompt

---

## Persona 7: Hostile User

**Profile:** Actively trying to break the application. Tests boundaries, inputs unexpected data, looks for security holes.

### Playwright Configuration

```typescript
{
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'UTC',
  // No network throttling
}
```

### Test Scenarios

1. **XSS injection** — Enter `<script>alert('xss')</script>` in every text input. Verify it is escaped in all output contexts.
2. **SQL injection** — Enter `'; DROP TABLE users; --` in text inputs. Verify no database errors.
3. **Oversized input** — Paste 10MB of text into a text field. Does the application handle it gracefully?
4. **Rapid submission** — Click submit 50 times in 1 second. Is the action idempotent or properly debounced?
5. **URL manipulation** — Change IDs in URLs to access other users' data. Verify authorization checks.
6. **File upload abuse** — Upload a .exe renamed to .jpg. Upload a 500MB file. Upload an empty file.
7. **Form field manipulation** — Remove `required` attribute via devtools. Submit empty required fields. Verify server-side validation.
8. **Cookie/token tampering** — Modify session tokens. Verify server rejects tampered tokens.
9. **Concurrent modification** — Edit the same resource in two tabs simultaneously. Verify no data corruption.
10. **Unicode edge cases** — Zero-width characters, homoglyphs (а vs a), null bytes, emoji in unexpected places.

### Screenshot Points
- XSS attempt result
- Oversized input handling
- Authorization error on URL manipulation
- Server-side validation response

---

## Persona 8: International User

**Profile:** Non-English speaker with RTL language (Arabic or Hebrew). Uses special characters. Different date/time/number formats.

### Playwright Configuration

```typescript
{
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'ar-SA',
  timezoneId: 'Asia/Riyadh',
  // Average network
}
```

### Network Throttling (Average)

Same as Persona 3 (Non-Tech User).

### Test Scenarios

1. **RTL layout** — If the page supports RTL, verify layout mirrors correctly. Navigation on right, text right-aligned.
2. **UTF-8 handling** — Enter Arabic/Hebrew text in all inputs. Verify correct storage and display.
3. **Date format** — Dates display in the user's locale format, not hardcoded US format.
4. **Number format** — Decimal separator and thousands separator match locale (e.g., 1.234,56 vs 1,234.56).
5. **Currency** — If applicable, verify currency symbols and formatting match locale.
6. **Text expansion** — Translated text is often 30-50% longer. Verify no truncation or overflow.
7. **Special characters in identifiers** — Names with accents (José, Müller, O'Brien), apostrophes, hyphens.
8. **Sorting** — If the app sorts text, verify locale-aware sorting (e.g., ä sorts differently in German vs Swedish).
9. **Mixed directionality** — A paragraph of Arabic with an English brand name embedded. Verify correct rendering.

### Screenshot Points
- Landing page in Arabic locale
- Form with Arabic input
- Date/time display in locale format
- Mixed direction text rendering
- Long translated text (no overflow)

---

## Running Persona Tests

### Execution Order

Run personas in priority order based on the project type:

| Project Type | Priority Personas |
|---|---|
| B2C web app | 1 (First-timer), 4 (Mobile), 3 (Non-tech), 5 (Screen reader) |
| B2B SaaS | 2 (Power user), 1 (First-timer), 6 (Distracted), 7 (Hostile) |
| E-commerce | 4 (Mobile), 1 (First-timer), 8 (International), 7 (Hostile) |
| Content site | 4 (Mobile), 5 (Screen reader), 3 (Non-tech), 8 (International) |
| Internal tool | 2 (Power user), 6 (Distracted), 7 (Hostile) |

### Common Setup

```typescript
import { test, chromium } from '@playwright/test';

async function createPersonaContext(browser, personaConfig) {
  const context = await browser.newContext({
    viewport: personaConfig.viewport,
    userAgent: personaConfig.userAgent,
    locale: personaConfig.locale,
    timezoneId: personaConfig.timezoneId,
    isMobile: personaConfig.isMobile || false,
    hasTouch: personaConfig.hasTouch || false,
    deviceScaleFactor: personaConfig.deviceScaleFactor || 1,
  });

  if (personaConfig.networkThrottling) {
    const cdp = await context.newCDPSession(await context.newPage());
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      ...personaConfig.networkThrottling,
    });
  }

  return context;
}
```

### Screenshot Naming Convention

```
screenshots/
  persona-1-first-timer/
    01-landing-page.png
    02-after-cta-click.png
    03-first-form.png
    04-success-state.png
  persona-4-mobile/
    01-mobile-landing.png
    02-hamburger-menu.png
    ...
```

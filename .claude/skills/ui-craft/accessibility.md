# Accessibility Standards

WCAG 2.2 compliance checklist with implementation guidance.

**Target**: AA mandatory, AAA where achievable.

---

## Quick Reference

| Requirement | Level | Threshold |
|-------------|-------|-----------|
| Text contrast | AA | ≥ 4.5:1 |
| Large text contrast | AA | ≥ 3:1 (18pt+ or 14pt bold) |
| UI component contrast | AA | ≥ 3:1 |
| Enhanced text contrast | AAA | ≥ 7:1 |
| Touch target size | AA | ≥ 44×44px |
| Focus indicator | AA | Visible, 2px minimum |

---

## 1. Perceivable

### 1.1 Text Alternatives

**Requirement**: All non-text content has text alternative.

```html
<!-- Images -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024">

<!-- Decorative images -->
<img src="decoration.svg" alt="" role="presentation">

<!-- Icons with meaning -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Complex images -->
<figure>
  <img src="diagram.png" alt="System architecture overview">
  <figcaption>
    Detailed description: The system consists of three layers...
  </figcaption>
</figure>
```

**Checklist**:
- [ ] All `<img>` have `alt` attribute
- [ ] Alt text describes purpose, not appearance
- [ ] Decorative images have `alt=""`
- [ ] Icons have accessible labels
- [ ] Charts have text summaries

### 1.2 Time-based Media

**Requirement**: Provide alternatives for audio/video.

```html
<video controls>
  <source src="tutorial.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
  <track kind="descriptions" src="descriptions.vtt" srclang="en">
</video>
```

**Checklist**:
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Auto-play disabled or muted

### 1.3 Adaptable

**Requirement**: Content can be presented in different ways.

```html
<!-- Semantic structure -->
<main>
  <article>
    <header>
      <h1>Article Title</h1>
    </header>
    <section aria-labelledby="section-1">
      <h2 id="section-1">Section Heading</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

<!-- Tables with headers -->
<table>
  <caption>Quarterly Sales Data</caption>
  <thead>
    <tr>
      <th scope="col">Quarter</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Q1</th>
      <td>$1.2M</td>
    </tr>
  </tbody>
</table>

<!-- Form labels -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" required>
```

**Checklist**:
- [ ] Heading hierarchy correct (h1 → h2 → h3)
- [ ] Landmarks used (main, nav, aside, footer)
- [ ] Tables have headers with scope
- [ ] Form inputs have associated labels
- [ ] Lists use proper markup (ul, ol, dl)

### 1.4 Distinguishable

**Requirement**: Easy to see and hear content.

#### Color Contrast

```css
/* AA Compliant - 4.5:1 for normal text */
.text-primary {
  color: hsl(220 15% 20%);      /* Dark text */
  background: hsl(0 0% 100%);   /* White bg */
  /* Ratio: 12.6:1 ✓ */
}

/* AA Compliant - 3:1 for large text (18pt+) */
.heading-large {
  font-size: 1.5rem; /* 24px = 18pt */
  color: hsl(220 15% 35%);
  /* Ratio: 5.8:1 ✓ */
}

/* UI Components - 3:1 minimum */
.button {
  background: hsl(220 70% 50%);
  border: 2px solid hsl(220 70% 40%);
  /* Border contrast: 3.2:1 ✓ */
}
```

#### Color Independence

```css
/* Bad: Color only */
.error { color: red; }

/* Good: Color + icon + text */
.error {
  color: hsl(0 70% 45%);
  padding-left: 24px;
  background: url('error-icon.svg') no-repeat left center;
}

/* Good: Color + pattern */
.chart-bar-negative {
  background: hsl(0 70% 50%);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    hsl(0 70% 40%) 4px,
    hsl(0 70% 40%) 8px
  );
}
```

**Checklist**:
- [ ] Text contrast ≥ 4.5:1 (AA)
- [ ] Large text contrast ≥ 3:1 (AA)
- [ ] UI elements contrast ≥ 3:1 (AA)
- [ ] Information not conveyed by color alone
- [ ] Text resizable to 200% without loss
- [ ] No horizontal scroll at 320px width

---

## 2. Operable

### 2.1 Keyboard Accessible

**Requirement**: All functionality available via keyboard.

```html
<!-- Focusable elements -->
<button>Click me</button>
<a href="/page">Link</a>
<input type="text">
<select>...</select>
<textarea>...</textarea>

<!-- Custom interactive elements -->
<div
  role="button"
  tabindex="0"
  onclick="handleClick()"
  onkeydown="handleKeyDown(event)"
>
  Custom Button
</div>
```

```javascript
// Keyboard handler for custom elements
function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}
```

```css
/* Focus styles - REQUIRED */
:focus-visible {
  outline: 2px solid hsl(220 70% 50%);
  outline-offset: 2px;
}

/* Never do this */
/* :focus { outline: none; } ← VIOLATION */

/* Custom focus for specific elements */
.button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 0 4px var(--color-accent);
}
```

**Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical (matches visual order)
- [ ] No keyboard traps
- [ ] Focus visible on all elements
- [ ] Skip link to main content
- [ ] Escape closes modals/dialogs

### 2.2 Enough Time

**Requirement**: Users have enough time to read and use content.

```javascript
// Allow extending time limits
const SESSION_WARNING = 2 * 60 * 1000; // 2 minutes before expiry

function showTimeoutWarning() {
  showDialog({
    message: "Your session will expire in 2 minutes",
    actions: [
      { label: "Extend session", action: extendSession },
      { label: "Log out", action: logout }
    ]
  });
}

// Pause auto-updating content
const carousel = {
  autoPlay: true,
  pauseOnHover: true,
  pauseOnFocus: true,
  showControls: true // Manual navigation
};
```

**Checklist**:
- [ ] Time limits can be extended
- [ ] Auto-updating content can be paused
- [ ] No content flashes more than 3 times/second

### 2.3 Seizures and Physical Reactions

**Requirement**: No content that causes seizures.

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Safe default animations */
.fade-in {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Avoid these patterns */
/* ✗ Rapid flashing */
/* ✗ Strobing effects */
/* ✗ High-contrast blinking */
```

**Checklist**:
- [ ] No flashing content > 3 times/second
- [ ] Respects `prefers-reduced-motion`
- [ ] Animations can be disabled

### 2.4 Navigable

**Requirement**: Users can navigate, find content, and know where they are.

```html
<!-- Skip link -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Page title -->
<title>Dashboard - Product Name</title>

<!-- Focus order matches visual order -->
<header><!-- Tab order: 1-5 --></header>
<main id="main-content"><!-- Tab order: 6-20 --></main>
<aside><!-- Tab order: 21-25 --></aside>
<footer><!-- Tab order: 26-30 --></footer>

<!-- Link purpose clear -->
<a href="/report.pdf">Download Q4 2024 Financial Report (PDF, 2.3MB)</a>

<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Product Name</li>
  </ol>
</nav>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--color-accent);
  color: white;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Checklist**:
- [ ] Skip link present
- [ ] Page has descriptive `<title>`
- [ ] Focus order logical
- [ ] Link purpose clear from text
- [ ] Multiple ways to find pages (nav, search, sitemap)
- [ ] Headings describe content

### 2.5 Input Modalities

**Requirement**: Easier to operate with various inputs.

```css
/* Touch targets - 44x44px minimum */
.button,
.link,
.input {
  min-height: 44px;
  min-width: 44px;
}

/* Adequate spacing between targets */
.button-group {
  gap: 8px; /* Minimum spacing */
}

/* Pointer gestures have alternatives */
.swipeable-carousel {
  /* Has prev/next buttons as alternative */
}
```

**Checklist**:
- [ ] Touch targets ≥ 44×44px
- [ ] Adequate spacing between targets
- [ ] Gestures have button alternatives
- [ ] Motion-based input has alternatives

---

## 3. Understandable

### 3.1 Readable

**Requirement**: Text content is readable and understandable.

```html
<!-- Language declaration -->
<html lang="en">

<!-- Language changes within page -->
<p>The French word <span lang="fr">bonjour</span> means hello.</p>

<!-- Abbreviations -->
<abbr title="World Wide Web Consortium">W3C</abbr>
```

**Checklist**:
- [ ] Page language declared
- [ ] Language changes marked
- [ ] Unusual words defined
- [ ] Abbreviations expanded

### 3.2 Predictable

**Requirement**: Pages operate in predictable ways.

```javascript
// No unexpected context changes
// ✗ Don't auto-submit on selection
<select onchange="this.form.submit()">

// ✓ Use explicit submit button
<select id="filter">
<button type="submit">Apply Filter</button>

// Consistent navigation
// Navigation appears in same location on every page
// Same items in same order
```

**Checklist**:
- [ ] No context change on focus
- [ ] No context change on input (unless warned)
- [ ] Navigation consistent across pages
- [ ] Components behave consistently

### 3.3 Input Assistance

**Requirement**: Help users avoid and correct mistakes.

```html
<!-- Error identification -->
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true"
>
<p id="email-error" class="error" role="alert">
  Please enter a valid email address (e.g., name@example.com)
</p>

<!-- Instructions before input -->
<p id="password-requirements">
  Password must be at least 8 characters with one number
</p>
<input
  type="password"
  aria-describedby="password-requirements"
>

<!-- Error prevention for important actions -->
<form>
  <h2>Delete Account</h2>
  <p>This action cannot be undone. Type "DELETE" to confirm:</p>
  <input type="text" pattern="DELETE" required>
  <button type="submit">Delete My Account</button>
</form>
```

**Checklist**:
- [ ] Errors clearly identified
- [ ] Error messages suggest correction
- [ ] Labels/instructions provided
- [ ] Important actions reversible or confirmed

---

## 4. Robust

### 4.1 Compatible

**Requirement**: Maximize compatibility with assistive technologies.

```html
<!-- Valid HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>
<body>
  <!-- Proper nesting, closed tags, unique IDs -->
</body>
</html>

<!-- ARIA usage -->
<div
  role="tablist"
  aria-label="Product Information"
>
  <button
    role="tab"
    id="tab-1"
    aria-selected="true"
    aria-controls="panel-1"
  >
    Description
  </button>
  <button
    role="tab"
    id="tab-2"
    aria-selected="false"
    aria-controls="panel-2"
  >
    Reviews
  </button>
</div>

<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
>
  Content...
</div>

<!-- Status messages -->
<div role="status" aria-live="polite">
  3 items added to cart
</div>

<div role="alert" aria-live="assertive">
  Error: Payment failed
</div>
```

**Checklist**:
- [ ] HTML validates
- [ ] ARIA used correctly
- [ ] Status messages announced
- [ ] Custom components have proper roles

---

## Testing Checklist

### Automated Testing

```bash
# axe-core
npm install @axe-core/cli
npx axe https://your-site.com

# Pa11y
npm install pa11y
npx pa11y https://your-site.com

# Lighthouse
npx lighthouse https://your-site.com --only-categories=accessibility
```

### Manual Testing

| Test | Method |
|------|--------|
| Keyboard navigation | Unplug mouse, tab through page |
| Screen reader | Test with NVDA (Windows) or VoiceOver (Mac) |
| Zoom | Zoom to 200%, check for horizontal scroll |
| Color contrast | Use browser DevTools or WebAIM checker |
| Color independence | View in grayscale |
| Reduced motion | Enable in OS settings |

### Screen Reader Testing

```
NVDA (Windows): Free, most common
VoiceOver (Mac): Built-in, Cmd+F5 to enable
JAWS (Windows): Enterprise standard
TalkBack (Android): Built-in
VoiceOver (iOS): Built-in
```

---

## Common Violations

| Issue | Impact | Fix |
|-------|--------|-----|
| Missing alt text | Blind users can't understand images | Add descriptive alt |
| Low contrast | Hard to read for low vision | Increase to 4.5:1+ |
| No focus styles | Keyboard users lost | Add :focus-visible |
| Missing labels | Forms unusable | Associate labels |
| No skip link | Keyboard users must tab through everything | Add skip link |
| Color-only info | Colorblind users miss info | Add text/icon |
| Small touch targets | Hard to tap on mobile | Minimum 44×44px |
| Auto-play media | Disorienting, data usage | Require user action |

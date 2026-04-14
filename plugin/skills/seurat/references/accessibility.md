# Accessibility Reference -- WCAG 2.1 AA

Complete accessibility guide for Seurat. Every component and page must pass these checks before delivery.

---

## Principles (POUR)

| Principle | Meaning | Key question |
|-----------|---------|-------------|
| **Perceivable** | Users can perceive the content | Can everyone see/hear/read this? |
| **Operable** | Users can interact with the interface | Can everyone use this without a mouse? |
| **Understandable** | Users can understand the content | Is the language and behavior predictable? |
| **Robust** | Content works across technologies | Does this work with assistive tech? |

---

## Color and Contrast

### Requirements
- **Normal text** (< 18pt / < 14pt bold): Contrast ratio >= 4.5:1
- **Large text** (>= 18pt / >= 14pt bold): Contrast ratio >= 3:1
- **UI components and graphical objects**: Contrast ratio >= 3:1 against adjacent colors
- **Focus indicators**: Contrast ratio >= 3:1 against adjacent backgrounds

### How to Calculate Contrast
Contrast ratio formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter relative luminance and L2 is the darker.

Relative luminance for sRGB:
1. Convert hex to 0-1 range (divide by 255)
2. For each channel: if value <= 0.03928, divide by 12.92; else `((value + 0.055) / 1.055) ^ 2.4`
3. `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`

### Common Failures
- Light gray text on white (`#999 on #fff` = 2.85:1 -- FAIL)
- Placeholder text too low contrast (placeholders still need 4.5:1)
- Colored text on colored backgrounds without checking
- Disabled states exempted, but should still be perceivable (3:1 recommended)

### Color Independence
- Never convey information by color alone
- Use color + icon, color + pattern, or color + text
- Examples:
  - Error fields: red border + error icon + error text
  - Status: colored dot + text label
  - Charts: color + pattern fills, or direct labels
  - Links: color + underline (underline is critical for inline links)

---

## Typography

### Minimum Sizes
- Body text: 16px minimum (1rem)
- Small text/captions: 12px minimum, 14px recommended
- Never use font-size below 12px for any readable text

### Line Height
- Body text: 1.5 minimum (WCAG 1.4.12)
- Headings: 1.2-1.3
- Never go below 1.2 for any text

### Spacing Requirements (WCAG 1.4.12 Text Spacing)
Content must not be lost or overlapping when user adjusts:
- Line height to 1.5x font size
- Paragraph spacing to 2x font size
- Letter spacing to 0.12x font size
- Word spacing to 0.16x font size

### Font Recommendations
- Use system fonts or well-hinted web fonts
- Provide fallback stacks: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Avoid all-caps for more than a few words (harder to read)
- Ensure font weight >= 400 for body text

---

## Keyboard Navigation

### Tab Order
- Tab order must follow visual reading order (left-to-right, top-to-bottom)
- Use `tabindex="0"` only when making non-interactive elements focusable (and only when necessary)
- Use `tabindex="-1"` for programmatically focusable elements (modals, error summaries)
- Never use `tabindex` values > 0 (they break natural order)

### Required Key Interactions

| Component | Keys | Behavior |
|-----------|------|----------|
| Button | Enter, Space | Activate |
| Link | Enter | Navigate |
| Checkbox | Space | Toggle |
| Radio group | Arrow keys | Move selection |
| Select/dropdown | Arrow keys, Enter, Escape | Navigate, select, close |
| Tab panel | Arrow keys | Switch tabs |
| Modal | Escape | Close |
| Modal | Tab | Trap focus within modal |
| Menu | Arrow keys, Enter, Escape | Navigate, select, close |
| Accordion | Enter, Space | Toggle panel |
| Slider | Arrow keys | Adjust value |
| Date picker | Arrow keys, Enter, Escape | Navigate dates, select, close |

### Focus Trapping
Modals and dialogs must trap focus:
1. When opened, move focus to the first focusable element (or the dialog itself)
2. Tab/Shift+Tab cycles only through elements inside the modal
3. Escape closes the modal
4. On close, return focus to the element that opened the modal

### Skip Links
Every page must have a "Skip to main content" link:
```html
<a href="#main" class="skip-link">Skip to main content</a>
<!-- ... nav ... -->
<main id="main" tabindex="-1">
```
```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 1rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
}
```

---

## Focus Indicators

### Requirements
- All focusable elements must have a visible focus indicator
- Focus indicator contrast >= 3:1 against adjacent backgrounds
- Minimum focus indicator area: 2px solid outline or equivalent
- Never use `outline: none` without providing a replacement

### Recommended Pattern
```css
/* Remove default, add custom */
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* For dark backgrounds */
.dark :focus-visible {
  outline-color: var(--color-focus-light);
}

/* Ensure inner focus rings for inputs */
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
  box-shadow: 0 0 0 4px var(--color-primary-100);
}
```

### Common Failures
- Removing outline without replacement
- Focus ring hidden behind overlapping elements (check z-index)
- Focus ring invisible on colored backgrounds (test every surface)
- Only using `box-shadow` for focus (not visible in forced-colors mode)

---

## Touch Targets

### Requirements
- Minimum touch target size: 44x44px (WCAG 2.5.5 AAA, recommended at AA)
- Minimum spacing between targets: 8px
- If the visual element is smaller than 44px, use padding to expand the tap area

### Implementation
```css
/* Small icon button with adequate touch area */
.icon-btn {
  /* Visual size */
  width: 24px;
  height: 24px;
  /* Touch area */
  padding: 10px; /* 24 + 10 + 10 = 44px */
  margin: -10px; /* Pull margins back so layout is unchanged */
  position: relative;
}

/* Or use ::after pseudo-element */
.small-target {
  position: relative;
}
.small-target::after {
  content: '';
  position: absolute;
  inset: -10px;
}
```

### Common Failures
- Icon buttons without padding (24x24px icon = 24x24px target)
- Close buttons in corners with no padding
- Inline links in dense text (add padding or increase line-height)
- Checkboxes/radios at default browser size (usually ~16px)

---

## Screen Reader Support

### Semantic HTML First
Always use the correct HTML element:
```html
<!-- Good -->
<button>Submit</button>
<nav aria-label="Main"><ul>...</ul></nav>
<main>...</main>
<h1>Title</h1>

<!-- Bad -->
<div onclick="submit()">Submit</div>
<div class="nav">...</div>
<div class="main">...</div>
<div class="title">Title</div>
```

### ARIA Landmarks
Every page must have:
```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Main">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

When multiple nav or aside elements exist, use `aria-label` to distinguish:
```html
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<aside aria-label="Related articles">...</aside>
```

### ARIA Roles and Properties

| Pattern | Required ARIA |
|---------|---------------|
| Modal dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Tab panel | `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls` |
| Accordion | `aria-expanded`, `aria-controls` |
| Dropdown menu | `role="menu/menuitem"`, `aria-expanded`, `aria-haspopup` |
| Alert | `role="alert"` or `aria-live="assertive"` |
| Status update | `role="status"` or `aria-live="polite"` |
| Progress | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Toggle | `aria-pressed` (button) or `aria-checked` (checkbox) |
| Tooltip | `role="tooltip"`, triggered element has `aria-describedby` |

### Live Regions
For dynamic content updates:
```html
<!-- Polite: announced after current speech finishes -->
<div aria-live="polite">Search results updated: 47 items found</div>

<!-- Assertive: interrupts current speech (use sparingly) -->
<div aria-live="assertive">Error: Payment failed</div>

<!-- Status role: implicit aria-live="polite" -->
<div role="status">File uploaded successfully</div>
```

### Hidden Content
```html
<!-- Visually hidden, available to screen readers -->
<span class="sr-only">Close modal</span>

<!-- Hidden from everything (not rendered) -->
<div hidden>...</div>
<div aria-hidden="true">Decorative content</div>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Forms

### Labels
Every form input must have a visible label:
```html
<!-- Good: explicit label -->
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" required>

<!-- Good: implicit label -->
<label>
  Email address
  <input type="email" autocomplete="email" required>
</label>

<!-- Bad: placeholder as label -->
<input type="email" placeholder="Email address">
```

### Error Handling
```html
<label for="email">Email address <span aria-hidden="true">*</span></label>
<input id="email" type="email" required
       aria-required="true"
       aria-invalid="true"
       aria-describedby="email-error">
<p id="email-error" role="alert" class="error">
  Please enter a valid email address.
</p>
```

### Error Summary
For forms with multiple errors, provide a summary at the top:
```html
<div role="alert" aria-labelledby="error-summary-title" tabindex="-1">
  <h2 id="error-summary-title">There are 2 errors in this form</h2>
  <ul>
    <li><a href="#email">Email address is required</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>
```

### Autocomplete
Use appropriate `autocomplete` values:
| Field | Autocomplete value |
|-------|-------------------|
| Full name | `name` |
| Email | `email` |
| Phone | `tel` |
| Street address | `street-address` |
| City | `address-level2` |
| Postal code | `postal-code` |
| Country | `country-name` |
| Credit card number | `cc-number` |
| Credit card expiry | `cc-exp` |
| Credit card CVC | `cc-csc` |
| Username | `username` |
| New password | `new-password` |
| Current password | `current-password` |

---

## Motion and Animation

### prefers-reduced-motion
Every animation must respect this media query:

```css
/* Default: animations on */
.element {
  transition: transform 300ms ease;
}

/* Reduced motion: remove or minimize */
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
  }

  /* Or reduce rather than remove */
  .element {
    transition: opacity 100ms ease; /* opacity is generally safe */
  }
}
```

### What to Reduce vs Remove
| Animation type | Reduced motion behavior |
|----------------|------------------------|
| Decorative (parallax, float, bounce) | Remove entirely |
| Functional (page transition, accordion open) | Instant or fade only |
| Essential (progress bar, loading spinner) | Keep, but simplify |
| Opacity transitions | Keep (generally safe) |
| Color transitions | Keep (generally safe) |
| Transform (translate, scale, rotate) | Remove |
| Scroll-linked animations | Remove |
| Auto-playing carousels | Stop, provide manual controls |

### Flashing Content
- Never flash content more than 3 times per second
- No seizure-inducing patterns (strobing, rapid color changes)
- If in doubt, do not animate

---

## Images and Media

### Alt Text
```html
<!-- Informative image: describe content -->
<img src="chart.png" alt="Revenue grew 23% from Q1 to Q2 2025">

<!-- Decorative image: empty alt -->
<img src="divider.svg" alt="">

<!-- Image with text overlay: alt describes both -->
<img src="hero.jpg" alt="Mountain landscape at sunset">

<!-- Complex image: long description -->
<img src="org-chart.png" alt="Organization chart" aria-describedby="org-desc">
<div id="org-desc" class="sr-only">
  CEO reports to Board. CTO, CFO, and COO report to CEO...
</div>
```

### Video and Audio
- Provide captions for all video with speech
- Provide audio descriptions for visual-only information
- Provide transcripts for audio content
- Never autoplay audio
- Provide visible play/pause controls

---

## Responsive Accessibility

### Zoom and Reflow
- Content must be readable at 200% zoom without horizontal scrolling (WCAG 1.4.4)
- At 400% zoom, content reflows to single column (WCAG 1.4.10)
- Test by setting browser width to 320px (simulates 400% zoom on 1280px display)

### Orientation
- Do not lock orientation (WCAG 1.3.4)
- Content must work in both portrait and landscape
- Exception: content inherently requiring specific orientation (piano keyboard)

---

## Testing Checklist

Use this checklist for every component and page:

### Perceivable
- [ ] All text meets contrast requirements (4.5:1 normal, 3:1 large)
- [ ] No information conveyed by color alone
- [ ] All images have appropriate alt text
- [ ] Video has captions, audio has transcripts
- [ ] Content reflows at 400% zoom (320px width)
- [ ] Text spacing adjustable without content loss

### Operable
- [ ] All functionality available via keyboard
- [ ] No keyboard traps (except intentional modals)
- [ ] Focus order matches visual order
- [ ] Focus indicators visible (3:1 contrast, 2px minimum)
- [ ] Touch targets >= 44x44px
- [ ] Skip link present
- [ ] `prefers-reduced-motion` respected
- [ ] No content flashes more than 3 times/second

### Understandable
- [ ] Page language set (`<html lang="en">`)
- [ ] Form inputs have visible labels
- [ ] Error messages are clear and specific
- [ ] Error messages linked to fields via `aria-describedby`
- [ ] Required fields indicated (not just by color)
- [ ] Navigation is consistent across pages
- [ ] Autocomplete attributes set on form fields

### Robust
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] ARIA roles and properties correct
- [ ] Status messages use `aria-live` or `role="status"`
- [ ] Custom components have appropriate roles
- [ ] Works with screen readers (VoiceOver, NVDA, JAWS)
- [ ] Works in forced-colors/high-contrast mode

---

## Quick Reference: Contrast Ratios for Common Combinations

| Foreground | Background | Ratio | Pass? |
|-----------|------------|-------|-------|
| `#000000` | `#ffffff` | 21:1 | Yes |
| `#333333` | `#ffffff` | 12.6:1 | Yes |
| `#595959` | `#ffffff` | 7:1 | Yes |
| `#767676` | `#ffffff` | 4.54:1 | Yes (minimum) |
| `#808080` | `#ffffff` | 3.95:1 | No (normal text) |
| `#ffffff` | `#0066cc` | 5.3:1 | Yes |
| `#ffffff` | `#2196f3` | 3.25:1 | Large text only |
| `#000000` | `#ffeb3b` | 15.4:1 | Yes |
| `#ffffff` | `#4caf50` | 2.3:1 | No |
| `#000000` | `#4caf50` | 4.6:1 | Yes |

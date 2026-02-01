# Typography System

Distinctive typography is the fastest way to escape "AI slop."

---

## The Ban List

**Never use these fonts** - they signal generic AI-generated UI:

| Font | Why Banned |
|------|------------|
| Inter | Default everywhere, zero personality |
| Roboto | Google default, ubiquitous |
| Helvetica | Overused to meaninglessness |
| Arial | Windows default, bland |
| `sans-serif` | System default fallback |
| Open Sans | Generic Google Font |
| Lato | Overexposed |

---

## Distinctive Font Stacks

### Display Fonts (Headlines, Heroes)

**Technical / Developer:**
```css
--font-display: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
```

**Editorial / Publishing:**
```css
--font-display: "Playfair Display", "Libre Baskerville", "Source Serif Pro", serif;
```

**Modern / Contemporary:**
```css
--font-display: "Bricolage Grotesque", "Syne", "Space Grotesk", sans-serif;
```

**Geometric / Clean:**
```css
--font-display: "DM Sans", "Outfit", "Plus Jakarta Sans", sans-serif;
```

**Humanist / Friendly:**
```css
--font-display: "Source Sans 3", "Nunito", "Lato", sans-serif;
```

### Body Fonts (Readable at length)

**Neutral Professional:**
```css
--font-body: "Source Sans 3", "IBM Plex Sans", system-ui, sans-serif;
```

**Technical Documentation:**
```css
--font-body: "IBM Plex Sans", "Fira Sans", system-ui, sans-serif;
```

**Friendly Consumer:**
```css
--font-body: "DM Sans", "Nunito Sans", system-ui, sans-serif;
```

**Editorial Long-form:**
```css
--font-body: "Source Serif 4", "Merriweather", "Georgia", serif;
```

### Monospace (Code, Data)

```css
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace;
```

---

## International Typography

### Chinese (Simplified)

```css
/* Primary stack */
--font-zh: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

/* Grid: 8px base (character complexity) */
--space-base: 8px;

/* Line height: increased for character density */
--line-height-zh: 1.8;

/* Never use Latin fonts for Chinese body text */
```

**Color Psychology (China):**
- Red → Success, growth, prosperity (NOT danger)
- Gold → Premium, luxury
- Avoid pure white backgrounds (eye strain)

### Russian (Cyrillic)

```css
/* Primary stack - system-ui handles Cyrillic well */
--font-ru: system-ui, "Segoe UI", "Helvetica Neue", sans-serif;

/* Increased line height for tall characters (Б, Д, Щ) */
--line-height-ru: 1.7;

/* Minimum font size */
--text-base-ru: 0.875rem; /* 14px minimum for Cyrillic */

/* Increased contrast for character clarity */
/* Target 5:1 instead of 4.5:1 */
```

### Arabic (RTL)

```css
/* Direction */
html[lang="ar"] {
  direction: rtl;
}

/* Font stack */
--font-ar: "Noto Sans Arabic", "Segoe UI", "Tahoma", sans-serif;

/* Increased line height */
--line-height-ar: 1.8;

/* Mirror layouts */
.card {
  padding-inline-start: var(--space-4);
  padding-inline-end: var(--space-2);
}
```

---

## Type Scale

### Modular Scale (1.25 ratio)

```css
:root {
  --text-xs:   0.64rem;   /* 10.24px */
  --text-sm:   0.8rem;    /* 12.8px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.25rem;   /* 20px */
  --text-xl:   1.563rem;  /* 25px */
  --text-2xl:  1.953rem;  /* 31.25px */
  --text-3xl:  2.441rem;  /* 39px */
  --text-4xl:  3.052rem;  /* 48.83px */
  --text-5xl:  3.815rem;  /* 61px */
}
```

### Fluid Typography (Responsive)

```css
:root {
  /* Fluid scale: min at 320px, max at 1200px */
  --text-base: clamp(1rem, 0.5rem + 1vw, 1.125rem);
  --text-lg:   clamp(1.25rem, 0.5rem + 1.5vw, 1.5rem);
  --text-xl:   clamp(1.5rem, 0.5rem + 2vw, 2rem);
  --text-2xl:  clamp(2rem, 0.5rem + 3vw, 3rem);
  --text-3xl:  clamp(2.5rem, 1rem + 4vw, 4rem);

  /* Hero text - dramatic scaling */
  --text-hero: clamp(3rem, 2rem + 8vw, 8rem);
}
```

---

## Weight Strategy

### High Contrast Pairing

The most distinctive typography uses extreme weight contrast:

```css
/* Display: Maximum weight */
.heading-display {
  font-weight: 800; /* or 900 */
  letter-spacing: -0.03em; /* Tighten at large sizes */
}

/* Body: Regular weight */
.body-text {
  font-weight: 400;
  letter-spacing: 0;
}

/* Accent: Minimum weight */
.label-subtle {
  font-weight: 100; /* or 200 */
  letter-spacing: 0.05em; /* Open up thin weights */
}
```

### Weight Scale

```css
:root {
  --font-thin:       100;
  --font-extralight: 200;
  --font-light:      300;
  --font-normal:     400;
  --font-medium:     500;
  --font-semibold:   600;
  --font-bold:       700;
  --font-extrabold:  800;
  --font-black:      900;
}
```

---

## Line Height

### Context-Dependent Values

```css
:root {
  /* Headings: Tight */
  --leading-none:   1;
  --leading-tight:  1.15;
  --leading-snug:   1.3;

  /* Body: Comfortable */
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose:  1.8;

  /* Long-form: Generous */
  --leading-prose:  1.75;
}

/* Application */
h1, h2, h3 {
  line-height: var(--leading-tight);
}

p, li {
  line-height: var(--leading-normal);
}

.prose p {
  line-height: var(--leading-prose);
}
```

### Size-Dependent Line Height

```css
/* Larger text needs tighter leading */
.text-4xl { line-height: 1.1; }
.text-3xl { line-height: 1.15; }
.text-2xl { line-height: 1.2; }
.text-xl  { line-height: 1.3; }
.text-lg  { line-height: 1.4; }
.text-base { line-height: 1.5; }
.text-sm  { line-height: 1.5; }
.text-xs  { line-height: 1.6; }
```

---

## Letter Spacing

### Size-Dependent Tracking

```css
:root {
  /* Tighter for large text */
  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;

  /* Normal */
  --tracking-normal:  0;

  /* Wider for small text / caps */
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
}

/* Application */
.heading-hero {
  letter-spacing: var(--tracking-tighter);
}

.heading-section {
  letter-spacing: var(--tracking-tight);
}

.label-uppercase {
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  font-size: var(--text-xs);
}
```

---

## Numeric Typography

### Tabular Numbers (Data/Tables)

```css
.data-value {
  font-variant-numeric: tabular-nums;
  /* Numbers align vertically in columns */
}
```

### Oldstyle Numbers (Body Text)

```css
.prose {
  font-variant-numeric: oldstyle-nums;
  /* Numbers blend with lowercase text */
}
```

### Slashed Zero

```css
.code-block {
  font-variant-numeric: slashed-zero;
  /* Distinguishes 0 from O */
}
```

---

## Text Rendering

### Optimal Rendering

```css
body {
  /* Subpixel antialiasing (macOS) */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Optimize legibility for body text */
  text-rendering: optimizeLegibility;
}

/* For small text or low contrast */
.small-text {
  -webkit-font-smoothing: subpixel-antialiased;
}
```

---

## Complete Typography Preset

```css
:root {
  /* Font Families */
  --font-display: "Bricolage Grotesque", "DM Sans", sans-serif;
  --font-body: "Source Sans 3", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Type Scale */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;

  /* Line Heights */
  --leading-tight:   1.15;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal: 0;
  --tracking-wide:   0.025em;

  /* Font Weights */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;
}

/* Base styles */
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
  -webkit-font-smoothing: antialiased;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

h1 { font-size: var(--text-5xl); }
h2 { font-size: var(--text-4xl); }
h3 { font-size: var(--text-3xl); }
h4 { font-size: var(--text-2xl); }
h5 { font-size: var(--text-xl); }
h6 { font-size: var(--text-lg); }

/* Code */
code, pre {
  font-family: var(--font-mono);
  font-size: 0.875em;
  font-variant-numeric: slashed-zero;
}
```

---

## Font Loading Strategy

### Optimal Loading

```html
<head>
  <!-- Preload critical fonts -->
  <link
    rel="preload"
    href="/fonts/display.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  >

  <!-- Font-face with swap -->
  <style>
    @font-face {
      font-family: "Display Font";
      src: url("/fonts/display.woff2") format("woff2");
      font-weight: 800;
      font-style: normal;
      font-display: swap; /* Show fallback immediately */
    }
  </style>
</head>
```

### System Font Stack (Zero Load Time)

```css
/* When speed is critical */
--font-system:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Oxygen,
  Ubuntu,
  Cantarell,
  sans-serif;
```

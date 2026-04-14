# Content & Style Separation

Every UI output from Seurat MUST separate content from presentation. No exceptions.

## Iron Rules

1. **No visible text in HTML/JSX.** Every user-facing string is a content JSON key reference.
2. **No raw style values.** Every color, font-size, spacing, shadow, radius comes from a token.
3. **One `<link>` in HTML:** `styles/global.css`. It imports the rest.
4. **Static HTML is always built.** `dist/` is deployed, never `templates/`.

---

## CSS Architecture

### Vanilla CSS Projects

Generate four files in `styles/`:

**`tokens.css`** — Pure design token values. Only `:root` custom properties. No selectors, no rules, no classes.

This is THE file the user edits to change the visual look. Contains:
- Palette: `--color-primary`, `--color-bg`, `--color-text`, `--color-text-inverse`, `--color-border`, etc.
- Typography: `--font-family`, `--font-size-*`, `--font-weight-*`, `--line-height-*`
- Spacing: `--space-1` through `--space-24`
- Borders: `--radius-*`, `--border-width`
- Shadows: `--shadow-sm` through `--shadow-xl`
- Transitions: `--transition-fast`, `--transition-base`, `--transition-slow`

Must include:
- Dark mode overrides in `@media (prefers-color-scheme: dark) { :root { ... } }`
- Responsive typography in `@media (min-width: 768px)` and `@media (min-width: 1280px)`

**`theme.css`** — Semantic mapping. Maps tokens to UI roles. Only `var()` references, no raw values.

Example mappings:
- `--btn-primary-bg: var(--color-primary)`
- `--card-shadow: var(--shadow-md)`
- `--section-padding-y: var(--space-24)`
- `--nav-height: 4rem` (structural values that are not design tokens are acceptable)

**`global.css`** — Imports the chain + reset + base styles:

```css
@import 'tokens.css';
@import 'theme.css';
@import 'components.css';
```

Contains: reset (`box-sizing`, `margin: 0`), base HTML styles (using `var()` for everything), typography rules, utility classes (`.container`, `.sr-only`).

**`components.css`** — Component-level styles. All values from `var(--theme-token)`.

### Import hierarchy

```text
tokens.css    ->  raw values
theme.css     ->  semantic mapping (uses tokens)
global.css    ->  reset + base (imports tokens, theme, components)
components.css -> component rules (uses theme tokens)
```

### Tailwind CSS Projects

When the project uses Tailwind:
- `tailwind.config.js` replaces `tokens.css` + `theme.css` — all tokens go in `theme.extend`
- `styles/global.css` contains only `@tailwind base; @tailwind components; @tailwind utilities;` plus custom base styles
- No `tokens.css`, no `theme.css`, no `components.css` — Tailwind utility classes handle everything
- Components use Tailwind classes that reference the config tokens

Detection: `tailwind.config.*` exists OR `tailwindcss` in package.json dependencies OR user requests Tailwind.

---

## HTML Template Patterns (Static HTML)

Templates live in `templates/` and contain NO visible text. All text comes from `data-i18n` attributes that reference content JSON keys.

### Simple elements

```html
<title data-i18n="meta.title"></title>
<meta name="description" data-i18n-content="meta.description" content="">

<h1 data-i18n="hero.title"></h1>
<p data-i18n="hero.subtitle"></p>
<img data-i18n-src="hero.image.src" data-i18n-alt="hero.image.alt">
<a data-i18n="hero.cta" data-i18n-href="hero.ctaHref" class="btn-primary"></a>
```

### Array elements (features, pricing, testimonials)

Use `<template data-i18n-list>`. Inside the template, keys resolve relative to each array item:

```html
<section class="features">
  <h2 data-i18n="features.heading"></h2>
  <div class="features-grid">
    <template data-i18n-list="features.items">
      <div class="feature-card">
        <img data-i18n-src="icon" data-i18n-alt="title">
        <h3 data-i18n="title"></h3>
        <p data-i18n="description"></p>
      </div>
    </template>
  </div>
</section>
```

### Supported data-i18n attributes

| Attribute | What it sets |
|-----------|-------------|
| `data-i18n="key"` | `innerHTML` |
| `data-i18n-src="key"` | `src` |
| `data-i18n-alt="key"` | `alt` |
| `data-i18n-href="key"` | `href` |
| `data-i18n-content="key"` | `content` (for meta tags) |
| `data-i18n-list="key"` | Marks a `<template>` for array expansion |

---

## React/Next.js/Vue Components

Components use the framework's i18n library (e.g., `next-intl`, `react-i18next`). Never inline text.

```jsx
function Hero() {
  const t = useTranslations('hero');
  return (
    <section>
      <h1 dangerouslySetInnerHTML={{ __html: t('title') }} />
      <p>{t('subtitle')}</p>
      <Image src={t('image.src')} alt={t('image.alt')} />
    </section>
  );
}
```

SSR/SSG renders content into HTML server-side. No build.js needed — the framework handles SEO natively.

---

## Build Pipeline (Static HTML Only)

`build.js` reads `templates/` + `content/` and outputs `dist/` with complete, SEO-ready HTML.

- All text baked into the HTML (no JS needed for content)
- `<title>` and `<meta>` populated from `content.meta`
- `<template data-i18n-list>` expanded into repeated blocks
- One output per language: `dist/en/index.html`, `dist/it/index.html`, etc.
- Key-level fallback: missing keys in a translation fall back to `en/` values

The content-loader.js is OPTIONAL — only for client-side language switching without page reload.

---

## Output Checklist

Before delivering any UI output, verify:

- [ ] All text comes from content JSON keys (no inline text in HTML/JSX)
- [ ] All style values come from tokens (no raw colors, sizes, spacing)
- [ ] CSS files follow the tokens -> theme -> global -> components hierarchy
- [ ] Templates use `data-i18n` attributes (static) or `t()` calls (React)
- [ ] `<title>` and `<meta>` tags reference content keys
- [ ] Array sections use `<template data-i18n-list>` (static) or `.map()` with `t()` (React)
- [ ] build.js is included for static HTML projects
- [ ] `dist/` contains complete HTML with all content inline

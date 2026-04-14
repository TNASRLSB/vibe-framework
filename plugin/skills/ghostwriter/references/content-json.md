# Content JSON Convention

After copy is written, sharpened, and validated, Ghostwriter structures it into `content/[lang]/[page].json`. This is the single source of truth for all text on the site.

---

## Key Naming Convention

Pattern: `[section].[element].[property]`

| Pattern | Example | Use |
|---------|---------|-----|
| `section.title` | `hero.title` | Section heading |
| `section.subtitle` | `hero.subtitle` | Subheading |
| `section.description` | `hero.description` | Descriptive text |
| `section.cta` | `hero.cta` | Call-to-action button text |
| `section.ctaHref` | `hero.ctaHref` | CTA link target |
| `section.ctaSecondary` | `hero.ctaSecondary` | Secondary CTA text |
| `section.image.src` | `hero.image.src` | Image path |
| `section.image.alt` | `hero.image.alt` | Image alt text (descriptive, for accessibility) |
| `section.items[]` | `features.items` | Array of repeating elements |
| `section.items[].title` | `features.items[0].title` | Element title within array |
| `section.items[].description` | `features.items[0].description` | Element description within array |
| `section.items[].icon` | `features.items[0].icon` | Element icon path within array |

---

## Standard Section Keys

Use these keys for common page sections. Custom sections follow the same `[section].[element]` pattern.

| Key | Section | Typical fields |
|-----|---------|---------------|
| `meta` | Page title, meta description, OG tags | `title`, `description`, `ogImage` |
| `nav` | Main navigation | `brand`, `links[]` (label + href), `cta` |
| `hero` | Hero section | `title`, `subtitle`, `cta`, `ctaSecondary`, `image` |
| `features` | Features grid | `heading`, `subheading`, `items[]` (icon + title + description) |
| `benefits` | Benefits section | `heading`, `items[]` (title + description) |
| `pricing` | Pricing table | `heading`, `subheading`, `items[]` (name + price + period + description + cta + features[]) |
| `testimonials` | Social proof | `heading`, `items[]` (quote + name + role + company + image) |
| `faq` | FAQ section | `heading`, `items[]` (question + answer) |
| `cta` | Final CTA block | `heading`, `subtitle`, `cta` |
| `footer` | Footer | `brand`, `tagline`, `copyright`, `columns[]` (title + links[]) |

---

## Content Split Rules

| Project type | Files |
|-------------|-------|
| Single-page site | `common.json` (optional) + `home.json` |
| Multi-page site | `common.json` (required, shared strings) + one JSON per page |

**`common.json`** contains strings shared across pages: `nav`, `footer`, brand name, UI labels.

**`[page].json`** contains page-specific content: `meta`, `hero`, `features`, `pricing`, etc.

When content is merged, `common.json` loads first. Page JSON merges on top.

---

## Rich Text Convention

HTML inline is permitted in JSON string values for basic formatting:

```json
{
  "hero": {
    "title": "Build <strong>faster</strong> with FlowDesk",
    "subtitle": "Trusted by <a href='/customers'>2,000+ teams</a> worldwide"
  }
}
```

Allowed HTML tags: `<strong>`, `<em>`, `<a href>`, `<br>`, `<span class>`.

Do NOT embed block-level elements (`<div>`, `<section>`, `<p>`) or complex markup in JSON values.

---

## Structuring Workflow

After Phase 8 (Validate), before delivery:

1. **Identify sections** — Map the written copy to standard section keys (hero, features, pricing, etc.)
2. **Extract shared strings** — Nav items, footer content, brand name go to `common.json`
3. **Structure page content** — All remaining copy goes to `[page].json` using the key naming convention
4. **Include asset references** — Image paths and alt text go in the JSON, not in HTML
5. **Include meta content** — Page title, meta description, OG image go under `meta` key
6. **Verify completeness** — Every piece of written copy must appear in the JSON. No text left behind.

---

## Example: Landing Page

`content/en/common.json`:
```json
{
  "nav": {
    "brand": "FlowDesk",
    "links": [
      { "label": "Features", "href": "#features" },
      { "label": "Pricing", "href": "#pricing" }
    ],
    "cta": "Get Started"
  },
  "footer": {
    "brand": "FlowDesk",
    "tagline": "Project management for modern teams.",
    "copyright": "2026 FlowDesk Inc. All rights reserved.",
    "columns": [
      {
        "title": "Product",
        "links": [
          { "label": "Features", "href": "#features" },
          { "label": "Pricing", "href": "#pricing" }
        ]
      }
    ]
  }
}
```

`content/en/home.json`:
```json
{
  "meta": {
    "title": "FlowDesk - Project Management for Modern Teams",
    "description": "Streamline your workflow with smart task boards and real-time collaboration.",
    "ogImage": "assets/images/og-home.jpg"
  },
  "hero": {
    "title": "Build <strong>faster</strong> with FlowDesk",
    "subtitle": "The project management tool that adapts to how your team works.",
    "cta": "Start Free Trial",
    "ctaHref": "#pricing",
    "ctaSecondary": "Watch Demo",
    "image": {
      "src": "assets/images/hero-dashboard.webp",
      "alt": "FlowDesk dashboard showing task boards and team activity"
    }
  },
  "features": {
    "heading": "Everything you need to ship",
    "subheading": "Powerful alone. Unstoppable together.",
    "items": [
      {
        "icon": "assets/icons/boards.svg",
        "title": "Smart Task Boards",
        "description": "Organize work visually with drag-and-drop boards that adapt to your workflow."
      }
    ]
  }
}
```

---

## Integration Contract with Seurat

Ghostwriter and Seurat MUST agree on content JSON keys:

1. Seurat's template structure determines WHICH keys are needed (based on page archetype)
2. Ghostwriter fills those keys with optimized, validated copy
3. Keys MUST match exactly between `data-i18n` attributes (Seurat) and JSON keys (Ghostwriter)

When Ghostwriter runs for a page that Seurat will also generate:
- Use the standard section keys above
- If Seurat has already generated the template, match its `data-i18n` keys exactly
- If Ghostwriter runs first, use the standard keys and Seurat will match them

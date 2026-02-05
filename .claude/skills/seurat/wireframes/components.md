# Component Patterns

Reusable UI patterns with layout rules, spacing, and sizing guidelines.

---

## Navigation

### Topbar

```
┌──────────────────────────────────────────────────┐
│  [Logo]    Link  Link  Link  Link    [CTA Button]│
└──────────────────────────────────────────────────┘
```

- Height: 56-72px
- Logo: left-aligned, max-height 32-40px
- Links: centered or left-aligned after logo, gap `--space-6`
- CTA: right-aligned, accent color
- Mobile: hamburger at right, logo centered or left
- Sticky: `backdrop-filter: blur(8px); background: rgba(bg, 0.9);`

### Sidebar

```
┌────────────┬─────────────────────────────┐
│  [Logo]    │                             │
│            │                             │
│  Section   │      Main Content           │
│    Link    │                             │
│    Link    │                             │
│  Section   │                             │
│    Link    │                             │
│    Link    │                             │
│            │                             │
│  [User]    │                             │
└────────────┴─────────────────────────────┘
```

- Width: 240-280px
- Collapsed: 64px (icons only)
- Section labels: uppercase, small, muted color
- Active link: accent background at 10% opacity, left border 3px accent
- Mobile: overlay from left, backdrop blur

### Breadcrumb

```
Home  /  Category  /  Current Page
```

- Font size: 0.85em body
- Separator: `/` or `›` with `--space-2` padding
- Current page: bold, no link
- Truncate middle items on mobile with `...`

---

## Cards

### Standard Card

```
┌─────────────────────────────┐
│  [Image — 16:9 or 3:2]     │
│                             │
│  Category Tag               │
│  Card Title                 │
│  Description text that      │
│  wraps to 2-3 lines max.   │
│                             │
│  [Action Link →]            │
└─────────────────────────────┘
```

- Padding: `--space-6`
- Image: full-width, top, `border-radius` top corners only
- Title: `font-weight: 700`, 1.2em
- Description: body size, `line-clamp: 3`
- Border-radius: match design system tokens
- Shadow: subtle resting, elevated on hover

### Metric Card

```
┌─────────────────────────────┐
│  Label                      │
│  ████████  Large Number     │
│  +12% ↑   vs last period   │
└─────────────────────────────┘
```

- Number: 2-3× body size, bold
- Label: small, muted, above number
- Trend: small, green (up) or red (down)
- Padding: `--space-6`

### Card Grid Rules

| Cards per row | Min card width | Gap |
|--------------|---------------|-----|
| 2 | 300px | `--space-6` |
| 3 | 240px | `--space-6` |
| 4 | 200px | `--space-4` |

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width, 280px), 1fr));
  gap: var(--space-6);
}
```

---

## Hero Sections

### Centered Hero

```
┌──────────────────────────────────────────┐
│                                          │
│           Overline / Tag                 │
│      Main Headline Goes Here             │
│   Supporting text one or two lines       │
│                                          │
│    [Primary CTA]  [Secondary CTA]        │
│                                          │
└──────────────────────────────────────────┘
```

- Max-width headline: 900px
- Max-width supporting text: 600px
- CTA group: flex, gap `--space-4`
- Vertical padding: `--space-24` top, `--space-16` bottom

### Split Hero

```
┌──────────────────────────────────────────┐
│                                          │
│  Overline / Tag    │  ┌──────────────┐   │
│  Main Headline     │  │              │   │
│  Supporting text   │  │  Product     │   │
│                    │  │  Screenshot  │   │
│  [Primary CTA]     │  │              │   │
│                    │  └──────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

- Grid: `7fr 5fr` or `3fr 2fr`
- Image/visual can bleed right edge
- Text left-aligned, vertically centered
- Mobile: stack, image below text

### Video Background Hero

```
┌──────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │
│  │  [VIDEO / ANIMATION — full bleed]  │  │
│  │                                    │  │
│  │    ┌──────────────────────┐        │  │
│  │    │  Dark overlay 40-60% │        │  │
│  │    │  Headline            │        │  │
│  │    │  [CTA]               │        │  │
│  │    └──────────────────────┘        │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

- Video: `object-fit: cover; position: absolute;`
- Overlay: `background: rgba(0,0,0,0.5);` or gradient from bottom
- Text: white, high contrast, centered or left-aligned
- Min-height: 80vh

### Minimal Hero

```
┌──────────────────────────────────────────┐
│                                          │
│  Main Headline                           │
│  One line of text. [CTA →]              │
│                                          │
└──────────────────────────────────────────┘
```

- No image, no background
- Padding: `--space-16` vertical
- Headline: display size
- Great for utility/tool landing pages

---

## Forms

### Field Layout

```
Label
┌─────────────────────────────┐
│  Placeholder text            │
└─────────────────────────────┘
Helper text or error message
```

- Label: above field, `font-weight: 600`, `margin-bottom: --space-1`
- Input: height 40-48px, padding `--space-3` horizontal
- Helper: small, muted color, `margin-top: --space-1`
- Error: small, red, replaces helper text
- Gap between fields: `--space-6`

### Form Width

- Single-column forms: max-width 500px
- Two-column forms: max-width 800px, collapse to single on mobile
- Inline forms (search bar): max-width matches container

### Button Placement

- Primary action: right-aligned or full-width on mobile
- Cancel/secondary: left of primary, less visual weight
- Destructive: red text, or red outline (not filled red)

---

## CTA Blocks

### Inline CTA

```
┌──────────────────────────────────────────┐
│                                          │
│  Ready to get started?                   │
│  Short supporting line of text.          │
│                                          │
│  [Primary CTA Button]                    │
│                                          │
└──────────────────────────────────────────┘
```

- Background: accent or dark (contrast with page)
- Max-width: 800px centered
- Padding: `--space-12` vertical

### Banner CTA

```
┌──────────────────────────────────────────┐
│  Message text              [CTA] [Close] │
└──────────────────────────────────────────┘
```

- Sticky top or bottom
- Height: 48-56px
- Background: accent
- Dismissible with × button

---

## Social Proof

### Testimonial

```
┌─────────────────────────────┐
│  "Quote text goes here,     │
│   two or three lines max."  │
│                             │
│  [Avatar]  Name             │
│            Title, Company   │
└─────────────────────────────┘
```

- Quote: italic or larger font
- Avatar: 40-48px circle
- Name: bold, body size
- Title: small, muted

### Trust Bar

```
┌──────────────────────────────────────────┐
│  Trusted by:  [Logo] [Logo] [Logo] [Logo]│
└──────────────────────────────────────────┘
```

- Logos: grayscale, max-height 32px, opacity 0.5-0.7
- Label: small, muted, left-aligned or centered
- Gap between logos: `--space-8`

### Metric Counter

```
┌────────┐  ┌────────┐  ┌────────┐
│  10K+  │  │  99.9% │  │  50+   │
│ Users  │  │ Uptime │  │ Countries│
└────────┘  └────────┘  └────────┘
```

- Number: display size, bold, accent color
- Label: small, muted, centered below
- Layout: flex, `justify-content: space-around`

---

## Pricing

### Pricing Cards

```
┌──────────┐  ┌──────────────┐  ┌──────────┐
│  Starter │  │  Pro ★        │  │ Enterprise│
│          │  │  POPULAR      │  │           │
│  $9/mo   │  │  $29/mo       │  │  Custom   │
│          │  │               │  │           │
│  ✓ Feat  │  │  ✓ All Starter│  │  ✓ All Pro│
│  ✓ Feat  │  │  ✓ Feat       │  │  ✓ Feat   │
│  ✓ Feat  │  │  ✓ Feat       │  │  ✓ Feat   │
│          │  │               │  │           │
│  [Start] │  │  [Start]      │  │  [Contact]│
└──────────┘  └──────────────┘  └──────────┘
```

- Recommended plan: larger card, accent border, or elevated shadow
- Price: 2× body size, bold
- Features: checklist with ✓, muted ✗ for excluded
- CTA: full-width at bottom of each card
- Equal height cards: use `align-items: stretch` on grid

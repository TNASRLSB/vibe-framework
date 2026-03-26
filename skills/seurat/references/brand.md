# Brand Identity Reference

Complete brand identity methodology for Seurat. From personality definition through visual language, logo design, and guidelines.

---

## Brand Personality Framework

### The Five Dimensions

Every brand personality is plotted on five independent axes. Each axis is a spectrum from 1 to 7.

#### 1. Tone (Formal 1 <--> 7 Playful)
How the brand speaks and presents itself.

| Score | Expression |
|-------|-----------|
| 1-2 | Corporate language, serif type, muted palette, structured layouts |
| 3-4 | Professional but approachable, clean sans-serif, balanced palette |
| 5-6 | Conversational, rounded type, vibrant palette, casual layouts |
| 7 | Irreverent, hand-drawn elements, bold colors, rule-breaking layouts |

#### 2. Energy (Calm 1 <--> 7 Dynamic)
The pace and intensity of the visual experience.

| Score | Expression |
|-------|-----------|
| 1-2 | Generous whitespace, slow transitions, still imagery, quiet colors |
| 3-4 | Balanced density, moderate motion, mix of still and dynamic |
| 5-6 | Packed layouts, active transitions, animated elements, vibrant |
| 7 | High density, fast motion, particle effects, video backgrounds |

#### 3. Complexity (Minimal 1 <--> 7 Rich)
How much visual detail is present.

| Score | Expression |
|-------|-----------|
| 1-2 | Monochrome + one accent, system fonts, no decoration, flat icons |
| 3-4 | Small palette, 1-2 custom fonts, subtle texture, outlined icons |
| 5-6 | Extended palette, gradients, illustration, filled icons, patterns |
| 7 | Full illustration system, textures, photography, mixed media |

#### 4. Temperature (Cool 1 <--> 7 Warm)
The emotional temperature of the color palette.

| Score | Expression |
|-------|-----------|
| 1-2 | Blues, grays, slate, silver, cool greens |
| 3-4 | Balanced neutrals, blue-greens, muted purples |
| 5-6 | Warm neutrals, greens, ambers, soft oranges |
| 7 | Reds, oranges, yellows, warm browns, terracotta |

#### 5. Edge (Soft 1 <--> 7 Sharp)
The geometric character of shapes and borders.

| Score | Expression |
|-------|-----------|
| 1-2 | Full rounding, pill shapes, blob forms, no hard corners |
| 3-4 | Moderate rounding (8-12px), smooth curves |
| 5-6 | Small rounding (2-4px), geometric precision |
| 7 | Zero radius, sharp corners, angular cuts, hard lines |

### Scoring Process

When working with the user to define brand personality:

1. **Ask about the audience.** Who are they? What do they expect?
2. **Ask about competitors.** What do they look like? How do we differ?
3. **Ask about values.** What 3 words describe the brand?
4. **Score each dimension.** Present the scale, let the user choose.
5. **Validate with examples.** "A score of 5 on Tone means something like Slack or Notion. Does that feel right?"

---

## Personality-to-Visual Mapping

### Color Derivation

| Personality inputs | Color decision |
|-------------------|---------------|
| Temperature 1-2 + Tone 1-3 | Cool neutrals: slate, steel blue, charcoal |
| Temperature 1-2 + Tone 4-7 | Cool brights: electric blue, cyan, violet |
| Temperature 3-5 + Tone 1-3 | Balanced professional: navy, forest green, burgundy |
| Temperature 3-5 + Tone 4-7 | Balanced vibrant: teal, purple, emerald |
| Temperature 5-7 + Tone 1-3 | Warm sophisticated: wine, copper, olive |
| Temperature 5-7 + Tone 4-7 | Warm energetic: coral, amber, tangerine |

### Palette Generation

From the primary color, generate:
1. **Primary scale:** 50 (lightest) through 950 (darkest) in 12 steps
2. **Secondary:** Analogous or complementary depending on Complexity score
   - Low complexity (1-3): Analogous (30 degrees on wheel)
   - High complexity (4-7): Complementary (120-180 degrees)
3. **Accent:** High-contrast pop color for CTAs and highlights
4. **Neutral:** Desaturated version of primary, used for text and backgrounds
5. **Semantic:** Success (green), warning (amber), error (red), info (blue) -- tinted toward primary

### Typography Derivation

| Personality inputs | Typography decision |
|-------------------|-------------------|
| Tone 1-2 + Edge 5-7 | Serif heading + sans body (Times-like + Helvetica-like) |
| Tone 1-2 + Edge 1-4 | Geometric sans all (Futura-like) |
| Tone 3-5 + Edge 3-5 | Humanist sans all (Inter, Source Sans) |
| Tone 5-7 + Edge 1-3 | Rounded sans heading + humanist body |
| Tone 5-7 + Edge 4-7 | Display heading + geometric body |
| Complexity 6-7 | Mix serif heading + sans body |
| Energy 6-7 | Tighter letter-spacing, larger headings |

### Shape Language

| Edge score | Border radius | Shape vocabulary |
|-----------|---------------|-----------------|
| 1-2 | 16-32px, pill shapes | Circles, blobs, waves |
| 3-4 | 8-12px | Rounded rectangles, soft polygons |
| 5-6 | 2-4px | Rectangles, precise geometry |
| 7 | 0px | Sharp rectangles, angular cuts, diamonds |

### Spacing Rhythm

| Energy + Complexity | Spacing character |
|--------------------|------------------|
| Both low (1-3) | Generous: 1.5x base spacing, lots of whitespace |
| Mixed | Standard: 1x base spacing |
| Both high (5-7) | Tight: 0.75x base spacing, dense layouts |

### Motion Character

| Energy score | Motion behavior |
|-------------|----------------|
| 1-2 | Fade only, 300-500ms duration, no transform |
| 3-4 | Subtle slide/fade, 200-300ms, ease-out |
| 5-6 | Slide + scale, 150-250ms, ease-in-out |
| 7 | Spring physics, 100-200ms, overshoot easing |

---

## Logo Design

### Concept Development

Generate 3 logo concepts:

#### 1. Wordmark
The brand name as a typographic design.

Process:
1. Set the name in the heading typeface
2. Identify the most distinctive letter(s)
3. Modify that letter with a custom detail (ligature, cut, extension, swap)
4. Ensure readability at 16px wide (favicon) and 400px+ wide (hero)
5. Test in single color (black on white, white on black)

#### 2. Symbol (Logomark)
An abstract mark representing the brand essence.

Process:
1. List 3 core concepts the brand represents
2. Find visual metaphors for each (not literal illustrations)
3. Reduce to geometric primitives (circles, lines, triangles)
4. Combine 2 primitives maximum
5. Test at 16x16px -- must be recognizable
6. Test at 400px+ -- detail should reward close inspection

#### 3. Combination Mark
The symbol + wordmark together.

Process:
1. Place symbol to the left of the wordmark (primary horizontal layout)
2. Create a stacked variant (symbol above wordmark)
3. Define minimum spacing between symbol and wordmark
4. Ensure the combination works at all target sizes

### SVG Best Practices

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 [width] [height]"
     role="img" aria-label="[Brand] logo">
  <title>[Brand] logo</title>
  <!-- Use currentColor for single-color flexibility -->
  <path fill="currentColor" d="..."/>
</svg>
```

Rules:
- Use `viewBox`, never fixed `width`/`height`
- Maximum 3 anchor points per curve where possible
- Optimize paths: remove redundant points, simplify curves
- Use `currentColor` for single-color logos (inherits from CSS `color`)
- Include `<title>` for accessibility
- Remove editor metadata (Illustrator/Figma comments)
- Keep file size under 5KB for simple logos, under 15KB for complex

### Size Requirements

| Context | Minimum size | Format |
|---------|-------------|--------|
| Favicon | 16x16px | SVG or ICO |
| Mobile nav | 32x32px | SVG |
| Desktop nav | 40-48px height | SVG |
| Social media avatar | 200x200px | PNG |
| Hero/splash | 400px+ width | SVG |
| Print | Vector | SVG or PDF |

### Clear Space
Minimum clear space around the logo = 50% of the mark's height on all sides. No other elements may intrude into this space.

### Color Variants
Every logo must have:
1. **Full color** -- primary brand colors
2. **Single color dark** -- black or darkest neutral
3. **Single color light** -- white or lightest neutral
4. **Reversed** -- light version on dark background

---

## Brand Guidelines Structure

### Document Outline

A complete brand guidelines document contains:

#### 1. Brand Overview
- Mission statement (1 sentence)
- Brand personality scores (the 5 dimensions)
- Brand values (3-5 words)
- Target audience summary

#### 2. Logo
- Primary logo (horizontal)
- Stacked logo (vertical)
- Symbol only (favicon/avatar use)
- Clear space rules
- Minimum size rules
- Color variants
- Incorrect usage examples (stretch, rotate, recolor, crowd)

#### 3. Color
- Primary palette (hex, RGB, HSL for each)
- Secondary palette
- Accent colors
- Neutral scale
- Semantic colors (success, warning, error, info)
- Accessible pairings (which text colors on which backgrounds)
- Colors to never use

#### 4. Typography
- Primary typeface (heading) with specimen
- Secondary typeface (body) with specimen
- Type scale (size, weight, line-height for each level)
- Fallback stacks
- Usage rules (when to use which weight, when to use italic)

#### 5. Iconography
- Icon style (outlined, filled, duotone)
- Icon size grid (16, 20, 24, 32px)
- Stroke width
- Corner radius
- Consistent metaphors (what icon for "settings", "user", etc.)

#### 6. Photography / Illustration
- Photography style (candid vs staged, saturated vs muted, subject focus)
- Illustration style (if applicable)
- Image treatment (overlays, duotone, cropping rules)
- What to avoid

#### 7. Voice and Tone
- Brand voice characteristics (3-4 adjectives)
- Tone variation by context (marketing vs support vs error messages)
- Vocabulary preferences (simple vs technical, "you" vs "we")
- Examples of good and bad copy

#### 8. Layout
- Grid system
- Spacing scale
- Component patterns
- Page templates

---

## Applying Brand to Design Tokens

Once brand identity is defined, map it to the project's token system:

### Token Mapping

| Brand element | Token category | Example |
|--------------|---------------|---------|
| Primary color | `--color-primary-*` | Full scale 50-950 |
| Secondary color | `--color-secondary-*` | Full scale 50-950 |
| Accent color | `--color-accent-*` | Full scale 50-950 |
| Neutral (from primary) | `--color-neutral-*` | Full scale 50-950 |
| Heading typeface | `--font-heading` | `'Playfair Display', Georgia, serif` |
| Body typeface | `--font-body` | `'Inter', system-ui, sans-serif` |
| Type scale | `--text-xs` to `--text-5xl` | Based on complexity score |
| Border radius | `--radius-*` | Based on edge score |
| Shadows | `--shadow-*` | Based on visual style |
| Motion | `--motion-duration-*`, `--motion-easing-*` | Based on energy score |
| Spacing | `--space-*` | Based on energy + complexity |

### Verification

After applying brand tokens:
1. Generate a preview page showing all tokens in use
2. Verify contrast ratios for all text/background pairs
3. Verify the overall feel matches the personality scores
4. Get user approval before applying to components

---

## Brand Audit Checklist

When evaluating an existing brand:

- [ ] Logo works at all required sizes (16px to 400px+)
- [ ] Logo has all required color variants
- [ ] Color palette has at least 5 accessible text/background pairs
- [ ] Typography has heading + body + code stacks defined
- [ ] All token categories are populated
- [ ] Semantic colors are defined (success, warning, error, info)
- [ ] Brand personality scores are documented
- [ ] Guidelines document exists
- [ ] Components consistently use tokens (no hard-coded values)
- [ ] Accessibility requirements are met at brand level

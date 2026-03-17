# Logo Design Reference

Theory, SVG generation patterns, and construction methods for the brandidentity workflow.

Read during Phase 2.3-2.4 (Logo & Logotype, Variations).

---

## 1. Logo Theory & Classification

### 1.1 Logo Types (Celikkol)

| Type | Description | When to use |
|------|-------------|-------------|
| **Logotype** | Full brand name rendered typographically | Strong, distinctive brand name; early-stage brands needing name recognition |
| **Sans serif mark** | Clean geometric letterform(s) | Tech, modern, digital-first brands |
| **Single letter** | One initial, stylized | Established brands; names starting with distinctive letters |
| **Multiple letter** | Two or more initials combined | Long brand names; compound names (e.g., T+V for TerraViva) |
| **Unconventional** | Abstract symbol, pictorial mark, or hybrid | Brands seeking uniqueness; those with a strong conceptual story |

### 1.2 Henderson & Cote Framework (Borgenstal & Wehlen)

**Logo objectives** — what a successful logo achieves:

| Objective | Definition | Measurement |
|-----------|------------|-------------|
| **Correct recognition** | Viewers correctly identify the brand from the mark | Recall tests |
| **False recognition** | Viewers mistakenly think they know an unfamiliar mark (familiarity heuristic) | Can be positive (feels trustworthy) or negative (feels generic) |
| **Affect** | Emotional response the mark triggers | Valence + arousal rating |
| **Familiar meaning** | Mark conveys meaning without explanation | Semantic association tests |

**Design guidelines** — principles that drive the objectives:

| Guideline | Definition | Effect |
|-----------|------------|--------|
| **Natural** | Organic, representational shapes | Increases affect and familiar meaning |
| **Harmony** | Balanced, symmetric composition | Increases affect; reduces false recognition |
| **Elaborate** | High detail and complexity | Increases correct recognition but can reduce affect if overdone |
| **Parallel** | Repeated parallel lines/elements | Increases harmony perception |
| **Repetition** | Recurring motifs or rhythm | Increases correct recognition through memorability |
| **Proportion** | Golden ratio, consistent scaling | Increases harmony and perceived quality |

### 1.3 Dynamic Logo Taxonomy

For brands that need logos beyond static marks:

| Type | Behavior | Example use |
|------|----------|-------------|
| **Responsive** | Simplifies at smaller sizes (full mark -> icon -> favicon) | All digital brands |
| **Generative** | Algorithm produces unique instances within constraints | Tech/creative brands |
| **Data-driven** | Visual properties change based on real data | Analytics, fintech |
| **Container** | Fixed frame, changing content inside | Media, platforms |
| **Modular** | Interchangeable components snap together | Multi-product brands |
| **Wallpaper** | Mark tiles into pattern for backgrounds | Retail, fashion |
| **Message-based** | Mark incorporates changeable text | Campaign-driven brands |
| **Personalised** | Unique mark per user/instance | Community platforms |

---

## 2. Shape Psychology & Graphic Variables

### 2.1 Bertin's 7 Graphic Variables

Every visual mark is defined by combinations of these variables:

| Variable | Range | Logo application |
|----------|-------|------------------|
| **Position** | x, y placement | Element arrangement within the mark |
| **Size** | Small to large | Hierarchy between mark and logotype |
| **Value** | Light to dark | Weight, contrast, mood |
| **Texture** | Smooth to rough | Surface quality (flat vs. textured fills) |
| **Color** | Hue spectrum | Brand personality (see 2.3) |
| **Orientation** | 0-360 degrees | Direction, energy, stability |
| **Shape** | Geometric to organic | Personality encoding (see 2.2) |

### 2.2 Shape Psychology

| Shape | Associations | Brand personality fit |
|-------|-------------|---------------------|
| **Circle** | Unity, community, wholeness, protection, infinity | Inclusive, warm, collaborative brands |
| **Square / Rectangle** | Stability, trust, order, reliability, structure | Corporate, financial, institutional brands |
| **Triangle (point up)** | Energy, direction, ambition, growth, power | Dynamic, innovative, aspirational brands |
| **Triangle (point down)** | Focus, precision, funneling | Analytical, detail-oriented brands |
| **Organic / Freeform** | Natural, human, approachable, creative | Artisanal, wellness, creative brands |
| **Spiral** | Growth, evolution, creativity | Transformative, educational brands |
| **Hexagon** | Efficiency, connection, science | Tech, biotech, engineering brands |

**Mapping from `brief.json` personality traits:**

```
brave / bold / disruptive    -> triangles, sharp angles, diagonal orientation
trustworthy / reliable       -> squares, rectangles, horizontal orientation
friendly / approachable      -> circles, rounded corners, organic shapes
innovative / cutting-edge    -> hexagons, geometric intersections, asymmetry
natural / sustainable        -> organic curves, leaf/wave forms
premium / luxury             -> minimal geometry, golden ratio, thin strokes
playful / creative           -> irregular shapes, overlapping forms, bright fills
```

### 2.3 Color Psychology in Logos

| Color | Associations | Industries |
|-------|-------------|------------|
| **Red** | Energy, passion, urgency, appetite | Food, entertainment, retail |
| **Blue** | Trust, stability, professionalism, calm | Finance, tech, healthcare |
| **Green** | Growth, nature, health, renewal | Environmental, health, organic |
| **Yellow** | Optimism, warmth, attention, clarity | Children, food, creative |
| **Orange** | Creativity, enthusiasm, friendliness | Tech, food, youth brands |
| **Purple** | Luxury, wisdom, creativity, spirituality | Beauty, luxury, education |
| **Black** | Sophistication, power, elegance, authority | Luxury, fashion, corporate |
| **White** | Purity, simplicity, cleanliness, space | Tech, healthcare, minimalist brands |
| **Pink** | Femininity, playfulness, compassion | Beauty, fashion, wellness |
| **Brown** | Earthiness, reliability, warmth | Outdoor, food, artisanal |

**Selection process from `brief.json`:**

1. Read `personality.traits` and `personality.tone`
2. Map dominant trait to primary color family
3. Cross-reference with `industry` to avoid cliches (e.g., not every tech brand needs blue)
4. Check `values` for sustainability/nature signals (bias toward green/earth tones)
5. Select 1 primary color + 1 accent; monochrome is always valid

---

## 3. SVG Generation Patterns

### 3.1 SVG Best Practices

All generated logos MUST follow these rules:

```xml
<!-- Always use viewBox, never hardcoded width/height -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">

  <!-- Accessible metadata -->
  <title>BrandName Logo</title>
  <desc>Brief description of the mark for screen readers</desc>

  <!-- Group related elements -->
  <g id="mark">
    <!-- Mark elements -->
  </g>
  <g id="logotype">
    <!-- Text elements (converted to paths) -->
  </g>

</svg>
```

**Rules:**
- `viewBox` defines the coordinate system; no `width`/`height` attributes on root `<svg>`
- All text converted to `<path>` for font independence
- Use `<g>` groups with semantic `id` attributes: `mark`, `logotype`, `combined`
- Clean paths: remove unnecessary precision (max 2 decimal places)
- No inline styles; use attributes (`fill`, `stroke`) directly on elements
- No raster images (`<image>`) inside logo SVGs
- Include `<title>` and `<desc>` for accessibility

### 3.2 Initials-Based Construction

Extract initials from brand name, construct geometric letterforms, then stylize.

**Process:**
1. Extract initials (e.g., "TerraViva" -> T + V)
2. Plot each letter on a grid as geometric primitives
3. Find overlap/fusion points between letters
4. Stylize: round corners, offset paths, merge shapes
5. Test at 16px, 32px, 64px, 256px for clarity

**Example: Interlocking "A" + "V" mark**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <title>AV Monogram</title>
  <desc>Geometric monogram combining the letters A and V into an interlocking diamond form</desc>
  <g id="mark">
    <!-- Letter A: triangle pointing up -->
    <polygon
      points="60,160 100,40 140,160"
      fill="none"
      stroke="#1a1a2e"
      stroke-width="8"
      stroke-linejoin="round"
    />
    <!-- A crossbar -->
    <line
      x1="75" y1="120"
      x2="125" y2="120"
      stroke="#1a1a2e"
      stroke-width="8"
      stroke-linecap="round"
    />
    <!-- Letter V: triangle pointing down, offset right -->
    <polygon
      points="80,40 120,160 160,40"
      fill="none"
      stroke="#e94560"
      stroke-width="8"
      stroke-linejoin="round"
    />
  </g>
</svg>
```

This produces two overlapping triangular letterforms — A (pointing up, dark) and V (pointing down, accent color) — sharing the central vertical axis to create unity.

### 3.3 Grid Construction

Define a modular grid, plot anchor points at intersections, connect with paths.

**Process:**
1. Choose grid: 8x8 (simple marks), 12x12 (detailed marks), or circular (radial designs)
2. Mark anchor points at meaningful intersections
3. Connect points with lines, arcs, or curves
4. Fill enclosed regions or leave as linework
5. Validate that the mark reads at all target sizes

**Example: Abstract mark on 8x8 grid (growth/upward concept)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <title>Growth Mark</title>
  <desc>Abstract upward-flowing mark suggesting growth and momentum, constructed on an 8x8 grid</desc>
  <!-- Construction grid: each cell = 25x25 units -->
  <defs>
    <clipPath id="bounds">
      <rect x="25" y="25" width="150" height="150" />
    </clipPath>
  </defs>
  <g id="mark" clip-path="url(#bounds)">
    <!-- Primary ascending form -->
    <path
      d="M 50,150
         Q 50,100 75,75
         Q 100,50 100,25
         L 100,25"
      fill="none"
      stroke="#0f4c75"
      stroke-width="10"
      stroke-linecap="round"
    />
    <!-- Secondary ascending form, offset -->
    <path
      d="M 100,150
         Q 100,112.5 112.5,87.5
         Q 125,62.5 125,25"
      fill="none"
      stroke="#3282b8"
      stroke-width="10"
      stroke-linecap="round"
    />
    <!-- Tertiary form, completing the rhythm -->
    <path
      d="M 150,150
         Q 150,125 150,100
         L 150,50"
      fill="none"
      stroke="#bbe1fa"
      stroke-width="10"
      stroke-linecap="round"
    />
    <!-- Base connector -->
    <line
      x1="50" y1="150"
      x2="150" y2="150"
      stroke="#0f4c75"
      stroke-width="6"
      stroke-linecap="round"
    />
  </g>
</svg>
```

Three ascending strokes of decreasing curvature, grounded by a base line. The leftmost form curves the most (organic growth), the rightmost is straight (structured achievement). Color graduates from dark to light, reinforcing upward momentum.

### 3.4 Geometric Primitives & Symbol Fusion

Combine basic shapes to encode brand concepts.

**Common constructions:**
- **Circle + circle overlap:** Venn-like forms for connection, partnership
- **Circle + triangle:** Stability with direction (play button paradigm)
- **Square + circle:** Structure meets fluidity
- **Polygon overlay:** Complexity from simple parts

**Example: Shield-star fusion mark (trust + excellence)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <title>Shield Star Mark</title>
  <desc>A shield form containing a four-pointed star, representing trust and excellence</desc>
  <g id="mark">
    <!-- Shield base -->
    <path
      d="M 100,20
         L 160,50
         Q 165,55 165,62
         L 165,110
         Q 165,145 100,180
         Q 35,145 35,110
         L 35,62
         Q 35,55 40,50
         Z"
      fill="#1b262c"
    />
    <!-- Inner shield highlight -->
    <path
      d="M 100,35
         L 150,58
         Q 153,61 153,66
         L 153,108
         Q 153,137 100,165
         Q 47,137 47,108
         L 47,66
         Q 47,61 50,58
         Z"
      fill="#0f4c75"
    />
    <!-- Four-pointed star -->
    <polygon
      points="100,55 110,90 145,100 110,110 100,145 90,110 55,100 90,90"
      fill="#bbe1fa"
    />
    <!-- Star center dot -->
    <circle cx="100" cy="100" r="8" fill="#ffffff" />
  </g>
</svg>
```

The shield provides the trust/protection container. The four-pointed star inside encodes excellence and guidance. The center dot draws the eye and anchors the composition.

### 3.5 Positive/Negative Version Generation

Every logo must work in both polarities:

```
Positive (default):  dark mark on light background
Negative (inverted): light mark on dark background
```

**Implementation:**

1. Define color tokens in the SVG or in `tokens.json`:
   ```json
   {
     "logo": {
       "primary": "#1a1a2e",
       "accent": "#e94560",
       "onDark": {
         "primary": "#ffffff",
         "accent": "#ff6b6b"
       }
     }
   }
   ```
2. Generate positive version with standard fills
3. Generate negative version by swapping fills to `onDark` values
4. Verify contrast: primary fill against background must meet WCAG AA (4.5:1 minimum)
5. Adjust accent color saturation/lightness if needed for dark backgrounds

---

## 4. Variations & Usage Rules

### 4.1 Required Layouts

Every brand identity delivers three layout variations:

| Layout | Structure | File | Use case |
|--------|-----------|------|----------|
| **Horizontal** | Mark left + logotype right, vertically centered | `logo-horizontal.svg` | Headers, navigation, wide spaces |
| **Vertical** | Mark top + logotype bottom, horizontally centered | `logo-vertical.svg` | Social profiles, square spaces, print |
| **Icon-only** | Mark without logotype | `logo-icon.svg` | Favicons, app icons, small spaces |

**SVG structure for horizontal layout:**

```xml
<svg viewBox="0 0 400 120">
  <g id="mark" transform="translate(20, 10)">
    <!-- mark at 100x100 -->
  </g>
  <g id="logotype" transform="translate(140, 45)">
    <!-- logotype paths, vertically centered to mark -->
  </g>
</svg>
```

**SVG structure for vertical layout:**

```xml
<svg viewBox="0 0 200 280">
  <g id="mark" transform="translate(50, 20)">
    <!-- mark at 100x100 -->
  </g>
  <g id="logotype" transform="translate(center, 140)">
    <!-- logotype paths, horizontally centered -->
  </g>
</svg>
```

**Deriving layouts from primary mark:**
1. Start with the icon-only mark (the core `<g id="mark">`)
2. For horizontal: place mark at left, compute logotype height, vertically center both
3. For vertical: place mark at top center, place logotype below with 20-30% mark-height gap
4. Adjust viewBox dimensions to fit each layout with clear space included

### 4.2 Positive & Negative Versions

Each layout gets two color versions:

| Version | File suffix | Background | Mark color |
|---------|-------------|------------|------------|
| Positive | (default) | Light/white | Brand primary |
| Negative | `-negative` | Dark/black | White or light variant |

Files: `logo-horizontal.svg`, `logo-horizontal-negative.svg`, etc.

### 4.3 Minimum Size

| Layout | Minimum width (digital) | Minimum width (print) |
|--------|------------------------|----------------------|
| Horizontal | 120px | 30mm |
| Vertical | 60px | 15mm |
| Icon-only | 16px (favicon) / 32px (general) | 8mm |

Below minimum size, the logo must not be used. For responsive contexts, switch from horizontal to icon-only when container width drops below 120px.

### 4.4 Clear Space (Exclusion Zone)

The exclusion zone prevents other elements from crowding the logo.

**Calculation:** Clear space = the cap-height of the brand name's first letter in the logotype (referred to as unit "C").

```
Minimum clear space on all four sides = 1C
Preferred clear space = 1.5C
```

For icon-only usage, clear space = 25% of the icon's width on all sides.

**Include clear space inside the SVG viewBox** so the file itself enforces the minimum:

```xml
<!-- Icon is 100x100, clear space is 25px each side -->
<svg viewBox="0 0 150 150">
  <g id="mark" transform="translate(25, 25)">
    <!-- 100x100 mark -->
  </g>
</svg>
```

### 4.5 Usage Rules (Do's and Don'ts)

**Do:**
- Use provided SVG files without modification
- Maintain aspect ratio at all times
- Use only on approved background colors (white, brand dark, brand primary)
- Switch to icon-only at small sizes

**Don't:**
- Stretch or compress (break aspect ratio)
- Rotate the logo
- Change logo colors outside the defined positive/negative versions
- Add drop shadows, gradients, or other effects
- Place on busy photographic backgrounds without a container/overlay
- Outline the logo with a border
- Rearrange mark and logotype positions
- Crop any part of the logo
- Reduce below minimum size
- Recreate or approximate — always use the source files

---

## 5. Logotype & Typography

### 5.1 Font Selection Criteria

Map brand personality to typographic qualities:

| Personality | Type style | Characteristics |
|-------------|-----------|-----------------|
| Modern / minimal | Geometric sans-serif | Even stroke width, circular bowls (Futura, Montserrat, Inter) |
| Trustworthy / corporate | Humanist sans-serif | Calligraphic influence, open apertures (Frutiger, Open Sans, Source Sans) |
| Premium / luxury | High-contrast serif or thin sans | Hairline strokes, generous spacing (Didot, Playfair, Cormorant) |
| Friendly / approachable | Rounded sans-serif | Rounded terminals, generous x-height (Nunito, Poppins, Quicksand) |
| Bold / disruptive | Heavy grotesque | Tight spacing, strong presence (Bebas, Impact, Anton) |
| Creative / artisanal | Display or hand-drawn | Irregular baselines, character (Lobster, Pacifico, or custom) |
| Technical / precise | Monospace or narrow sans | Uniform width, mechanical feel (IBM Plex Mono, Roboto Condensed) |

### 5.2 Customization Spec

Once a base font is selected, specify these adjustments:

- **Weight:** Exact weight value (e.g., 600 semi-bold, not just "bold")
- **Tracking (letter-spacing):** In em units. Typically +0.02em to +0.15em for logos. ALL-CAPS logotypes need wider tracking
- **Case:** Uppercase, lowercase, title case, or mixed
- **Optical size:** If the font offers optical sizes, specify the target (e.g., Display for large usage)
- **Custom modifications:** Specific letterform adjustments (e.g., "round the terminals of the 'a'", "remove the crossbar from the 'A'")

### 5.3 When to Specify Custom Lettering

Use custom lettering (not an existing font) when:
- The brand name is very short (1-4 characters) and needs maximum distinctiveness
- The brand personality doesn't map to any available font
- The logotype IS the logo (no separate mark) and must be uniquely ownable
- A letter in the name has conceptual potential (e.g., the "o" in "loop" becoming a loop shape)

In these cases, describe the lettering in the specification format from Section 6.

### 5.4 SVG Logotype Generation

All logotype text MUST be converted to paths for font independence:

**Process:**
1. Set the text in the chosen font at the target weight/tracking
2. Convert text outlines to SVG `<path>` elements
3. Optimize paths: reduce point count, remove overlaps, simplify curves
4. Group as `<g id="logotype">`
5. Verify legibility at minimum size (Section 4.3)

**Structure:**

```xml
<g id="logotype">
  <!-- Each letter as a separate path for potential animation/spacing control -->
  <path id="letter-B" d="M..." fill="#1a1a2e" />
  <path id="letter-r" d="M..." fill="#1a1a2e" />
  <path id="letter-a" d="M..." fill="#1a1a2e" />
  <path id="letter-n" d="M..." fill="#1a1a2e" />
  <path id="letter-d" d="M..." fill="#1a1a2e" />
</g>
```

### 5.5 Pairing Rules: Mark + Logotype

- **Visual weight balance:** The mark and logotype should have similar visual density. A heavy mark needs a bolder font weight; a delicate mark needs a lighter weight
- **Style coherence:** Geometric mark pairs with geometric sans; organic mark pairs with humanist or rounded type
- **Proportion:** Logotype cap-height should be 40-60% of mark height in horizontal layout
- **Spacing:** Gap between mark and logotype = 0.5x to 1x the logotype cap-height
- **Alignment:** In horizontal layout, align to optical center (not mathematical center). In vertical layout, center-align both

---

## 6. Figurative/Organic Logo Specification

When a logo direction involves illustrative, figurative, or highly organic forms that cannot be reliably generated as SVG code, produce a written specification instead.

### 6.1 Specification Format

```markdown
## Logo Direction: [Direction Name]

### Concept
[1-2 sentences describing the core idea and what it represents]

### Shape Description
- **Primary form:** [Main shape — e.g., "a stylized fox head facing right"]
- **Secondary elements:** [Supporting shapes — e.g., "tail curves into an infinity loop"]
- **Negative space:** [Any hidden forms — e.g., "arrow visible between ears"]
- **Overall silhouette:** [Bounding shape — e.g., "fits within a circle", "horizontal rectangle"]

### Style Parameters
- **Line quality:** [e.g., "uniform 3px stroke", "variable width, calligraphic", "no stroke, filled shapes only"]
- **Complexity:** [e.g., "minimal, under 20 anchor points", "moderate detail", "illustration-level"]
- **Fill style:** [e.g., "flat solid color", "gradient", "pattern fill"]
- **Corners:** [e.g., "sharp geometric", "4px radius rounds", "fully organic curves"]

### Color Guidance
- **Primary fill:** [Color with hex — e.g., "#2d6a4f forest green"]
- **Secondary fill:** [If multi-color — e.g., "#95d5b2 light green for inner leaf"]
- **Stroke color:** [If applicable]
- **Monochrome version:** [How it should simplify — e.g., "single dark fill, remove gradient"]

### Construction Notes
- **Grid basis:** [e.g., "constructed on circle-based grid", "golden ratio proportions"]
- **Key measurements:** [e.g., "eye positioned at golden ratio intersection", "tail width = 1/3 body width"]
- **Scalability concerns:** [e.g., "inner detail lost below 32px, simplify to solid shape"]

### References
- [List visual references: "similar energy to WWF panda", "construction approach like Apple logo"]
```

### 6.2 What to Include

The spec must give an external designer enough to execute without further briefing:
- Concrete shape descriptions (not abstract concepts)
- Exact colors (hex values from the brand palette)
- Scale behavior (what simplifies at small sizes)
- At least one construction reference (a known logo with similar approach)
- Clear style boundaries (what it is NOT: "not cartoonish", "not 3D")

---

## 7. Construction Documentation

### 7.1 Purpose

Every logo delivery includes a `construction.svg` that reveals the geometric rationale behind the mark. This demonstrates intentionality and aids reproduction.

### 7.2 What to Include

The construction overlay shows:

1. **Base grid:** The modular grid the mark was built on
2. **Key circles:** Construction circles that define curves and proportions
3. **Alignment lines:** Horizontal/vertical lines showing element alignment
4. **Golden ratio indicators:** If golden ratio was used, show the spiral or rectangles
5. **Angle annotations:** Key angles (e.g., "60 degrees" on a triangle element)
6. **Measurement labels:** Proportional relationships ("1:1.618", "2x", "0.5x")

### 7.3 SVG Construction Overlay Style

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <title>Logo Construction</title>
  <desc>Geometric construction diagram showing the rationale behind the mark</desc>

  <defs>
    <style>
      .grid       { stroke: #e0e0e0; stroke-width: 0.5; fill: none; }
      .construct  { stroke: #2196f3; stroke-width: 0.75; fill: none; stroke-dasharray: 4,4; }
      .guide      { stroke: #f44336; stroke-width: 0.5; fill: none; stroke-dasharray: 2,6; }
      .annotation { font-family: monospace; font-size: 10px; fill: #666666; }
      .mark       { fill: #1a1a2e; opacity: 0.9; }
    </style>
  </defs>

  <!-- Layer 1: Grid -->
  <g id="grid" opacity="0.4">
    <!-- Vertical and horizontal grid lines -->
    <!-- Use a loop-like pattern based on grid size -->
  </g>

  <!-- Layer 2: Construction geometry -->
  <g id="construction">
    <!-- Circles, guidelines, golden rectangles -->
    <circle cx="200" cy="200" r="120" class="construct" />
    <circle cx="200" cy="200" r="74.16" class="construct" />
    <!-- 120 / 1.618 = 74.16 (golden ratio) -->
    <line x1="80" y1="200" x2="320" y2="200" class="guide" />
    <line x1="200" y1="80" x2="200" y2="320" class="guide" />
  </g>

  <!-- Layer 3: The actual mark -->
  <g id="mark">
    <!-- Logo paths rendered at reduced opacity -->
  </g>

  <!-- Layer 4: Annotations -->
  <g id="annotations">
    <text x="210" y="90" class="annotation">R = 120</text>
    <text x="210" y="130" class="annotation">r = 74.16 (R / phi)</text>
    <text x="210" y="340" class="annotation">Grid: 8 x 8 @ 50u</text>
  </g>
</svg>
```

### 7.4 Layer Order

1. **Grid** (bottom, lowest opacity) — the underlying structure
2. **Construction geometry** (dashed blue) — circles, golden rectangles, alignment arcs
3. **Mark** (semi-transparent) — the logo itself so you can see construction through it
4. **Annotations** (top) — measurements and labels

### 7.5 Construction Generation Process

1. Start with the completed mark SVG
2. Identify the geometric basis: what circles, rectangles, or grids align with the mark's key points
3. Draw construction circles through corners, tangent points, and curve origins
4. Add alignment guides through shared edges and centers
5. If golden ratio was used, overlay the golden rectangle / spiral
6. Annotate key measurements as proportional ratios (not absolute pixel values)
7. Export as `construction.svg` with all four layers

---

## Usage by Workflow

This reference is consumed during these brandidentity phases:

| Phase | Reads sections |
|-------|---------------|
| 2.3 Logo & Logotype | 1 (classification), 2 (shape/color), 3 (SVG patterns), 5 (typography) |
| 2.4 Variations | 4 (layouts, rules), 3.5 (positive/negative) |
| 2.5 Guidelines assembly | 4 (usage rules), 7 (construction) |
| Figurative fallback | 6 (written spec format) |

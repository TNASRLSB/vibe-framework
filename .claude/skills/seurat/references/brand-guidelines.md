# Brand Guidelines: Structure & Content Standards

Reference for Phases 3-4 of `/seurat brandidentity`. Defines the complete structure for brand guidelines documents and proposal presentations, plus PDF generation instructions.

---

## 1. Brand Guidelines Structure

The brand guidelines document is the definitive reference for how the brand looks, sounds, and behaves. Every subsection below must be populated with concrete, actionable content -- not placeholders.

---

### 3.1 Strategy

#### 3.1.1 Audiences

Map audiences along an internal-to-external spectrum:

| Ring | Audience | Relationship | Key concern |
|------|----------|-------------|-------------|
| Core | Employees | Daily users / ambassadors | Clarity of mission, pride in brand |
| Inner | Partners & vendors | Collaborators | Trust, professionalism, co-branding rules |
| Middle | Customers / clients | Primary revenue | Value proposition, reliability, experience |
| Outer | General public | Awareness | Recognition, reputation, differentiation |

For each audience, specify:
- **Primary message** -- the single most important thing they should understand
- **Proof points** -- 2-3 facts/features that support the message
- **Tone adjustment** -- how voice shifts (e.g., more technical for partners, more aspirational for public)

#### 3.1.2 Positioning

Use the What/How/Why framework:

| Layer | Question | Content requirement |
|-------|----------|-------------------|
| What | What does the brand offer? | Product/service description in one sentence. No jargon. |
| How | How does it deliver? | Approach, method, or differentiator. What makes the process unique. |
| Why | Why does it exist? | Purpose beyond profit. The mission that drives the organization. |

Include a **positioning statement** in this format:
> For [target audience], [brand name] is the [category] that [key benefit] because [reason to believe].

Example:
> For growth-stage SaaS teams, Acme is the analytics platform that turns raw data into actionable strategy because it combines AI-driven insights with human-readable dashboards.

#### 3.1.3 Messaging Narrative

**Brand story arc:**
1. **Context** -- the world before the brand (the problem/tension)
2. **Catalyst** -- what sparked the brand's creation
3. **Resolution** -- how the brand addresses the tension
4. **Vision** -- the future the brand is building toward

**Messaging map** -- key messages organized by audience:

| Audience | Primary message | Supporting messages (2-3) | Proof points |
|----------|----------------|--------------------------|-------------|
| Employees | ... | ... | ... |
| Partners | ... | ... | ... |
| Customers | ... | ... | ... |
| Public | ... | ... | ... |

#### 3.1.4 Brand Platform

Summary card consolidating strategic foundations:

| Element | Content | Length |
|---------|---------|-------|
| Mission | What the brand does and for whom | 1 sentence |
| Vision | The future state the brand works toward | 1 sentence |
| Values | Core principles that guide decisions | 3-5 values, each with a 1-sentence definition |
| Promise | The commitment made to every customer | 1 sentence |
| Personality | Human traits that define brand character | 3-5 adjectives with behavioral descriptions |

---

### 3.2 Visual Identity

#### 3.2.1 Logo Usage Rules

Cross-reference `logo-design.md` for construction details. This section covers application rules:

**Clear space:**
- Minimum clear space = height of the mark's bounding "x" unit (defined in logo construction)
- Diagram showing clear space zone around each logo variant

**Minimum size:**
- Print: minimum width in mm (e.g., 20mm for full lockup, 10mm for icon only)
- Digital: minimum width in px (e.g., 120px for full lockup, 32px for icon only)

**Trademark notation:**
- Use TM on first prominent usage in each document until registration is granted
- Use (R) only after formal registration
- Placement: superscript, immediately after brand name, in a smaller font size

**Prohibited uses (with visual examples):**
- Do not stretch or distort
- Do not rotate
- Do not apply drop shadows or effects
- Do not place on busy backgrounds without sufficient contrast
- Do not rearrange lockup elements
- Do not use unapproved colors
- Do not crop the mark

#### 3.2.2 Color System

**Primary palette** (1-2 colors):
The brand's dominant colors. Used for primary CTAs, headers, key brand moments.

| Color name | HEX | RGB | CMYK | Pantone | Usage |
|-----------|-----|-----|------|---------|-------|
| [Brand Primary] | #XXXXXX | rgb(X, X, X) | C:X M:X Y:X K:X | PMS XXXX C | Primary actions, headers, brand marks |
| [Brand Secondary] | #XXXXXX | rgb(X, X, X) | C:X M:X Y:X K:X | PMS XXXX C | Secondary actions, accents |

**Secondary palette** (2-3 colors):
Supporting colors that complement the primary palette.

Same table format. Used for backgrounds, secondary UI elements, illustrations.

**Extended palette** (5-8 colors):
Functional and utility colors.

| Color name | HEX | RGB | Usage |
|-----------|-----|-----|-------|
| Success | #XXXXXX | rgb(X, X, X) | Positive feedback, confirmations |
| Warning | #XXXXXX | rgb(X, X, X) | Caution states |
| Error | #XXXXXX | rgb(X, X, X) | Error states, destructive actions |
| Info | #XXXXXX | rgb(X, X, X) | Informational elements |
| Neutral 100-900 | ... | ... | Text, borders, backgrounds |

Extended palette requires HEX + RGB. Pantone and CMYK optional.

**Color ratios:**
Apply the 60/30/10 rule:
- **60%** -- Dominant (backgrounds, large surfaces). Typically neutral or brand primary at low saturation.
- **30%** -- Secondary (cards, sections, secondary surfaces). Brand secondary or primary at medium intensity.
- **10%** -- Accent (CTAs, highlights, interactive elements). Brand primary at full saturation.

Include a visual ratio bar example:
```
[████████████████████░░░░░░░░░░░░░░░░░░░░] 60% Neutral / background
[░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░] 30% Secondary
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░] 10% Accent
```

**Print vs digital differences:**
- RGB values for screen (web, app, presentations)
- CMYK values for print (business cards, letterhead, packaging)
- Pantone for spot-color printing (premium materials)
- Note any colors that shift significantly between RGB and CMYK; provide adjusted CMYK values
- Coated (C) vs uncoated (U) Pantone variants where relevant

#### 3.2.3 Typography

**Primary font** (headings):
- Family name, available weights, recommended sizes
- Where to obtain (Google Fonts, Adobe Fonts, license info)
- Personality rationale: why this font fits the brand

**Secondary font** (body):
- Family name, available weights, recommended sizes
- Pairing rationale: why it complements the primary font

**Hierarchy rules:**

| Level | Font | Weight | Size (desktop) | Size (mobile) | Line-height | Letter-spacing | Use case |
|-------|------|--------|----------------|---------------|-------------|---------------|----------|
| H1 | Primary | Bold/800 | 48-64px | 32-40px | 1.1 | -0.02em | Page titles |
| H2 | Primary | Semi-bold/600 | 36-48px | 28-32px | 1.15 | -0.01em | Section headers |
| H3 | Primary | Semi-bold/600 | 28-36px | 24-28px | 1.2 | 0 | Subsections |
| H4 | Primary | Medium/500 | 24-28px | 20-24px | 1.25 | 0 | Card titles |
| H5 | Secondary | Semi-bold/600 | 20-24px | 18-20px | 1.3 | 0.01em | Labels |
| H6 | Secondary | Semi-bold/600 | 16-20px | 16-18px | 1.3 | 0.02em | Overlines |
| Body | Secondary | Regular/400 | 16-18px | 16px | 1.5-1.6 | 0 | Paragraph text |
| Body small | Secondary | Regular/400 | 14px | 14px | 1.5 | 0 | Supporting text |
| Caption | Secondary | Regular/400 | 12px | 12px | 1.4 | 0.02em | Footnotes, labels |

**Web/print pairings:**
- Web: use web font (WOFF2) or Google Fonts link
- Print: use OTF/TTF installed locally
- If brand font unavailable in a context, specify exact fallback

**Fallback stacks:**
```css
/* Headings */
font-family: '[Primary Font]', '[Similar Google Font]', Georgia, 'Times New Roman', serif;

/* Body */
font-family: '[Secondary Font]', '[Similar Google Font]', 'Segoe UI', system-ui, sans-serif;

/* Monospace (if needed) */
font-family: '[Brand Mono]', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

#### 3.2.4 Design Patterns

Recurring visual elements that create brand recognition beyond logo and color:

**Line work:**
- Style: solid, dashed, dotted, or custom pattern
- Weight: thin (1px), medium (2px), or heavy (3-4px)
- Usage: dividers, borders, decorative elements
- Example: "1px solid lines at 20% opacity for section dividers; 3px solid accent-color lines for emphasis"

**Textures:**
- Description of any background textures or patterns (grain, noise, halftone, geometric)
- Intensity: subtle (5-10% opacity) vs prominent
- When to use vs when to leave clean

**Detail lines:**
- Structural accents that frame content (e.g., corner brackets, underline treatments)
- Specific dimensions and placement rules

**Structural elements:**
- Geometric shapes used as decorative elements (circles, angular cuts, curved sections)
- Grid overlays or background patterns
- Usage frequency: every page vs key moments only

**Pattern usage rules:**
- Maximum number of patterns on a single page/spread
- Which patterns combine well vs which clash
- Contexts where patterns should be suppressed (e.g., data-heavy screens)

#### 3.2.5 Photography & Imagery

**Style adjectives** (3-5):
Example: "Authentic, high-contrast, warm-toned, candid, environmental"

**Do's:**
- Natural lighting preferred
- Real people in real contexts
- Consistent color grading aligned with brand palette
- Sufficient negative space for text overlay when needed
- Minimum resolution: 300 DPI for print, 72 DPI at 2x for digital

**Don'ts:**
- No stock-photo cliches (handshakes, pointing at screens, fake smiles)
- No heavy filters that obscure subjects
- No images that conflict with brand values
- No low-resolution or pixelated imagery

**Cropping guidelines:**
- Preferred aspect ratios: 16:9 (hero), 4:3 (cards), 1:1 (avatars/thumbnails)
- Rule of thirds for subject placement
- Never crop faces at the chin or forehead

**Filter/treatment:**
- Color overlay: brand primary at X% opacity (if applicable)
- Duotone: which two brand colors (if applicable)
- Black & white: when to use, contrast level
- Grain: amount and when appropriate

#### 3.2.6 Data Visualization

**Chart palette:**
Select a subset of brand colors optimized for data readability:

| Sequence | Color | HEX | Usage |
|----------|-------|-----|-------|
| 1 | Brand Primary | #XXXXXX | Primary data series |
| 2 | Brand Secondary | #XXXXXX | Secondary data series |
| 3-6 | Extended | ... | Additional series |

Rules:
- Adjacent colors in sequence must have minimum 3:1 contrast ratio between each other
- Never rely on color alone to convey meaning (use patterns, labels, or shapes)
- Maximum 6 colors in a single chart; group remaining into "Other"

**Axis/label styling:**
- Axis labels: Secondary font, caption size, neutral-600 color
- Axis lines: 1px, neutral-300
- Grid lines: 1px dashed, neutral-200, reduced opacity
- Data labels: Secondary font, body-small size

**Accessibility requirements:**
- Color-blind safe palette (test with deuteranopia, protanopia, tritanopia simulators)
- Pattern fills available as alternative to color differentiation
- All charts must have a text summary or data table alternative

#### 3.2.7 Illustrations

**Style description:**
Define the illustration style in concrete terms:
- Geometric vs organic
- Flat vs dimensional (isometric, perspective)
- Line-based vs filled shapes
- Level of detail: minimal/icon-like, moderate, detailed/complex
- Human figures: abstract, semi-realistic, or none

**Complexity level:**
- Simple: flat shapes, 2-3 colors, suitable for icons and spot illustrations
- Medium: layered compositions, brand palette, suitable for feature explanations
- Complex: detailed scenes, full palette, suitable for hero illustrations

**When to use illustrations vs photos:**
- Illustrations: abstract concepts, processes, empty states, onboarding, error pages
- Photos: real products, team/culture, case studies, testimonials
- Mixed: never on the same visual plane; illustrations as overlays or in separate sections only

---

### 3.3 Brand Voice

#### 3.3.1 Writing Tips

**Sentence structure:**
- Average sentence length: 15-20 words
- Mix short (5-10 words) with medium (15-25 words) for rhythm
- Maximum sentence length: 35 words
- One idea per sentence

**Jargon rules:**
- Define the brand's relationship with technical language
- If the audience is technical: use precise terminology, avoid dumbing down
- If the audience is general: plain language, explain technical terms on first use
- Maintain a list of approved terms and their plain-language equivalents

**Active vs passive voice:**
- Prefer active voice: "We built this for you" not "This was built for you"
- Passive acceptable when: the actor is unknown, the object is more important, or active sounds accusatory
- Target: 80%+ active voice

**Paragraph structure:**
- Lead with the conclusion or key point
- Supporting details follow
- Maximum 3-4 sentences per paragraph in digital contexts

#### 3.3.2 Tone Spectrum

Define the brand's position on each axis with a slider visualization:

```
Formal    [-----|-------------] Casual
           ^
           "Professional but approachable. We use contractions
            and first person, but avoid slang."

Serious   [----------|--------] Playful
                      ^
                      "We take our work seriously but don't take
                       ourselves too seriously. Humor is welcome
                       when it serves clarity."

Technical [---|---------------] Accessible
            ^
            "We respect our audience's intelligence. Technical
             terms are used precisely, with context."

Reserved  [------------|------] Enthusiastic
                        ^
                        "We're genuinely excited about our work
                         and let it show, without hyperbole."
```

**Tone shifts by context:**
| Context | Shift direction | Example |
|---------|----------------|---------|
| Error messages | More casual, empathetic | "Something went wrong. Let's try that again." |
| Legal/compliance | More formal | "By proceeding, you agree to the Terms of Service." |
| Marketing | More enthusiastic | "The fastest way to ship beautiful products." |
| Documentation | More technical, neutral | "The API returns a JSON object with the following fields." |
| Onboarding | More casual, encouraging | "You're all set! Let's build something great." |

#### 3.3.3 Do's and Don'ts

Provide concrete paired examples:

**Do: Be direct**
> Good: "Start your free trial. No credit card needed."
> Bad: "Why not consider exploring the possibility of starting a free trial experience?"

**Do: Use the brand's personality**
> Good: "Built for teams that ship fast."
> Bad: "A solution designed for organizational productivity enhancement."

**Don't: Use filler words**
> Bad: "Actually, we basically just really want to help you."
> Good: "We're here to help."

**Don't: Over-promise**
> Bad: "The only tool you'll ever need."
> Good: "The tool that gets [specific thing] right."

**Don't: Be condescending**
> Bad: "It's simple! Just follow these easy steps."
> Good: "Here's how to get started."

Include 6-8 paired examples covering: headlines, CTAs, error messages, feature descriptions, and email subject lines.

---

### 3.4 Digital Brand

#### 3.4.1 Web Guidelines

**Responsive behavior:**
- Breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop)
- Layout shifts: describe how key components reflow at each breakpoint
- Navigation: hamburger on mobile, full nav on desktop (or specify alternative pattern)
- Images: responsive srcset with appropriate sizes for each breakpoint

**Animation rules:**
- Duration: micro-interactions 150-300ms, transitions 300-500ms, page animations 500-800ms
- Easing: specify preferred easing function (e.g., cubic-bezier(0.4, 0, 0.2, 1))
- Reduce motion: respect `prefers-reduced-motion` -- provide static alternatives
- Prohibited: auto-playing animations that cannot be paused, flashing content (>3 Hz)

**Loading states:**
- Skeleton screens preferred over spinners for content areas
- Spinner: brand-colored, minimal design, used for discrete actions only
- Progress bars: for operations with known duration
- Optimistic updates: where applicable, update UI before server confirms

#### 3.4.2 Accessibility

**WCAG AA requirements (minimum):**

| Criterion | Requirement | Test method |
|-----------|------------|-------------|
| Color contrast (text) | >= 4.5:1 normal text, >= 3:1 large text (18px+ or 14px+ bold) | Contrast checker tool |
| Color contrast (UI) | >= 3:1 for interactive elements and graphics | Contrast checker tool |
| Color independence | Never use color as the only indicator | Visual inspection |
| Keyboard navigation | All interactive elements reachable via Tab | Manual keyboard testing |
| Focus indicators | Visible focus ring on all interactive elements | Manual keyboard testing |
| Screen reader | All images have alt text, all forms have labels | axe-core or Lighthouse |
| Skip navigation | "Skip to main content" link as first focusable element | Manual testing |
| Heading hierarchy | No skipped heading levels (H1 > H2 > H3) | Heading outline tool |
| Touch targets | Minimum 44x44px | Manual measurement |
| Zoom | Content usable at 200% zoom without horizontal scrolling | Browser zoom test |

#### 3.4.3 Social Media

**Avatar specs:**

| Platform | Size | Shape | Content |
|----------|------|-------|---------|
| General | 400x400px | Circle crop | Brand mark (icon only), centered, with padding |
| LinkedIn | 400x400px | Circle | Brand mark on brand-primary background |
| X/Twitter | 400x400px | Circle | Brand mark on brand-primary background |
| Instagram | 320x320px | Circle | Brand mark on brand-primary background |

- Export as PNG with transparent background + version on solid background
- Ensure mark is recognizable at 32x32px (the smallest render size)

**Cover photo specs:**

| Platform | Size | Safe area |
|----------|------|-----------|
| LinkedIn | 1584x396px | Central 60% (edges may be cropped on mobile) |
| X/Twitter | 1500x500px | Central 70% |
| Facebook | 851x315px | Central 65% |
| YouTube | 2560x1440px | Safe area 1546x423px centered |

Content: brand tagline + visual pattern or photography. Avoid text smaller than 24px.

**Post templates:**
- **Announcement:** Brand-primary background, white headline text, icon or illustration, CTA
- **Quote/testimonial:** Neutral background, large quote marks in brand accent, attribution
- **Data/statistic:** Bold number in brand primary, supporting text below, source citation
- **Carousel:** Consistent header bar with brand mark, slide numbers, swipe indicator

---

### 3.5 Brand Architecture

#### 3.5.1 Master Brand Definition

The master brand is the primary brand entity. Define:
- Full legal name
- Primary brand name (as used in communications)
- Brand mark (logo) reference
- Tagline (if any)

#### 3.5.2 Extension Types

| Type | Relationship | Visual treatment | Example |
|------|-------------|-----------------|---------|
| Primary extension | Core offering under master brand | Master brand + descriptor | "Acme Analytics" |
| Secondary extension | Supporting offering | Master brand + sub-name, reduced prominence | "Acme for Teams" |
| Sub-brand | Distinct identity, endorsed by master | Own mark + "by [Master Brand]" | "Spark by Acme" |
| Endorsed brand | Independent identity, loose connection | Own identity + "an [Master Brand] company" | "Bolt -- an Acme company" |

#### 3.5.3 Lockup Rules

For each extension type, define:
- Spatial relationship between master mark and extension name
- Minimum clear space between elements
- Acceptable color combinations
- Hierarchy: which element is visually dominant
- Whether the extension can appear without the master brand

**Lockup configurations:**
```
Horizontal:  [Master Mark] [Divider] [Extension Name]
Vertical:    [Master Mark]
             [Extension Name]
Stacked:     [Master Mark + Extension as integrated unit]
```

#### 3.5.4 When to Include vs Skip

Include brand architecture section when:
- The brand has or plans multiple products/services
- Sub-brands exist or are planned
- The organization has divisions or subsidiaries
- Partner co-branding situations arise

Skip (or mark as "future consideration") when:
- Single-product company
- No planned extensions
- The brand is the product (1:1 relationship)

---

### 3.6 Resources

#### 3.6.1 Business Card

| Specification | Value |
|--------------|-------|
| Dimensions | 89 x 51mm (3.5 x 2 in) standard; or 85 x 55mm (EU) |
| Bleed | 3mm on all sides |
| Safe area | 5mm inset from trim |
| Paper stock | Recommend weight (e.g., 350gsm), finish (matte, gloss, soft-touch) |

**Front layout:**
- Brand mark: top-left or centered, sized per minimum size rules
- Name: Primary font, H5 size equivalent
- Title: Secondary font, body-small size
- Contact: phone, email -- Secondary font, caption size

**Back layout:**
- Brand pattern or solid brand-primary color
- Optional: tagline centered, secondary color text

#### 3.6.2 Letterhead

| Specification | Value |
|--------------|-------|
| Page size | A4 (210 x 297mm) or US Letter (216 x 279mm) |
| Margins | Top: 25mm (includes header), Bottom: 20mm, Left: 25mm, Right: 25mm |

**Header:**
- Brand mark: top-left, maximum height 15mm
- Optional: address/contact right-aligned, caption size

**Footer:**
- Legal entity name, registration info, website
- 8-9pt, neutral-500 color
- Optional: thin accent line above footer

**Body area:**
- Start body text 60mm from top edge
- Secondary font, body size, 1.5 line-height
- Black or neutral-900 text color

#### 3.6.3 Email Signature

```
[Name]
[Title] | [Company Name]
[Phone] | [Email]
[Website]

[Brand mark -- max 200px wide, linked to website]
```

Specifications:
- Font: system font (Arial or Helvetica) for email client compatibility
- Size: 12px name (bold), 11px details
- Colors: neutral-800 for text, brand-primary for links
- No images other than the brand mark (avoid being blocked by email clients)
- Total height: maximum 120px

#### 3.6.4 Presentation Template

**Slide master (16:9, 1920x1080px):**
- Background: white or neutral-50
- Brand mark: bottom-left corner, 8% slide width, 40% opacity
- Page number: bottom-right, caption size, neutral-400

**Title slide:**
- Background: brand-primary, full bleed
- Title: Primary font, white, H1 equivalent, centered vertically
- Subtitle: Secondary font, white at 80% opacity, below title
- Date/presenter: bottom-left, caption size, white at 60% opacity

**Content slide:**
- Title bar: H3, brand-primary color text, top 15% of slide
- Content area: remaining 80%, with 8% horizontal margins
- Accent line: 3px brand-primary line below title

**Section divider:**
- Background: brand-secondary or brand-primary at 10% opacity
- Section number: H1 size, brand-primary, left-aligned
- Section title: H2, brand-primary, below number

#### 3.6.5 Creative Brief Template

Standard template for briefing external creative partners:

| Section | Content |
|---------|---------|
| Project overview | One-paragraph summary of what needs to be created |
| Objectives | What success looks like (specific, measurable) |
| Target audience | Who this is for (reference brand audiences section) |
| Key messages | What must be communicated (reference messaging map) |
| Tone & voice | Reference brand voice section + any project-specific adjustments |
| Visual direction | Reference visual identity section + mood/direction for this project |
| Deliverables | Exact list: formats, sizes, quantities |
| Mandatory elements | Logo placement, legal copy, disclaimers |
| Timeline | Key milestones and final deadline |
| Budget | If applicable |
| Brand assets | Link to brand asset repository / guidelines PDF |
| Approval process | Who reviews, number of revision rounds |

---

## 2. Guidelines PDF Generation

Instructions for generating the brand guidelines document as a PDF using Scribe (reportlab).

### Page Layout

| Property | Value |
|----------|-------|
| Page size | A4 portrait (210 x 297mm / 595 x 842pt) |
| Margins | Top: 25mm, Bottom: 20mm, Left: 25mm, Right: 25mm |
| Content width | 160mm (453pt) |

**Header (every page except cover and section dividers):**
- Brand mark: top-left, max height 8mm, 40% opacity
- Section title: top-right, secondary font, 8pt, neutral-400

**Footer (every page except cover):**
- Page number: bottom-right, secondary font, 8pt, neutral-500
- Document title: bottom-left, 7pt, neutral-400: "[Brand Name] Brand Guidelines"

### Typography in the PDF

Use the brand's own fonts when available in reportlab:

| Element | Primary choice | Fallback |
|---------|---------------|----------|
| Headings | Brand primary font (register TTF with reportlab) | Helvetica-Bold |
| Body | Brand secondary font (register TTF) | Times-Roman |
| Code/specs | Courier or JetBrains Mono | Courier |
| Captions | Brand secondary font, italic | Helvetica-Oblique |

**Font registration pattern:**
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register brand fonts (paths from .seurat/brand/fonts/ or system)
pdfmetrics.registerFont(TTFont('BrandPrimary', 'path/to/primary-font.ttf'))
pdfmetrics.registerFont(TTFont('BrandSecondary', 'path/to/secondary-font.ttf'))
```

If TTF files are not available, fall back to Helvetica (headings) and Times-Roman (body) and note the substitution in the PDF footer.

### Color Swatches

Render color blocks as filled rectangles with codes:

```python
from reportlab.lib.units import mm

def draw_swatch(canvas, x, y, color_hex, color_name, codes_dict):
    """
    Draw a color swatch block with color codes.

    x, y: position (bottom-left of swatch)
    color_hex: e.g., '#2D5BFF'
    color_name: e.g., 'Brand Primary'
    codes_dict: {'HEX': '#2D5BFF', 'RGB': '45, 91, 255', ...}
    """
    # Swatch rectangle: 30mm x 30mm
    canvas.setFillColor(HexColor(color_hex))
    canvas.rect(x, y, 30*mm, 30*mm, fill=1, stroke=0)

    # Color name below swatch
    canvas.setFillColor(HexColor('#1A1A1A'))
    canvas.setFont('BrandSecondary', 9)
    canvas.drawString(x, y - 4*mm, color_name)

    # Color codes below name
    canvas.setFont('Courier', 7)
    offset = 8*mm
    for label, value in codes_dict.items():
        canvas.drawString(x, y - offset, f"{label}: {value}")
        offset += 3*mm
```

Layout swatches in a grid: 4 across for primary/secondary, 6 across for extended palette.

### Section Separators

Full-bleed color pages that introduce each major section:

- Background: brand-primary (for odd sections) or brand-secondary (for even sections)
- Section number: H1 equivalent, white, top-left with generous margin
- Section title: H2 equivalent, white, below number
- Optional: decorative brand pattern element at reduced opacity

Implementation:
```python
def draw_section_divider(canvas, section_num, section_title, bg_color):
    canvas.setFillColor(HexColor(bg_color))
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

    canvas.setFillColor(white)
    canvas.setFont('BrandPrimary', 72)
    canvas.drawString(25*mm, A4[1] - 80*mm, f"{section_num:02d}")

    canvas.setFont('BrandPrimary', 28)
    canvas.drawString(25*mm, A4[1] - 100*mm, section_title)
```

### Table of Contents

Auto-generated from section headings:

- Page 2 of the PDF (after cover)
- Title: "Contents" -- H2, brand-primary color
- Entries: section number + title + page number, connected by dot leaders
- Two levels: sections (bold) and subsections (regular)
- Use reportlab's `TableOfContents` flowable or build manually with a Paragraph + tab stops

### Page Numbering

- Cover page: no number
- TOC: roman numerals (i, ii)
- Content pages: arabic numerals starting at 1
- Section divider pages: numbered but number at reduced opacity (30%)

---

## 3. Proposal Presentation Structure

An 18-slide (18-page) document that presents the brand identity to the client for approval. Each "slide" is a full A4 page.

---

### Slide-by-Slide Specification

#### Slide 1: Cover

| Aspect | Specification |
|--------|--------------|
| **Content** | Brand name (large), "Brand Identity Proposal", date (YYYY-MM-DD), creator/agency name |
| **Visual** | Background: brand-primary color, full bleed. Logotype: centered, white, at 60% of page width. Subtitle and metadata: white, secondary font, positioned in lower third. |
| **Layout** | Vertically centered content block. Generous whitespace above and below. |

#### Slide 2: Brand Identikit

| Aspect | Specification |
|--------|--------------|
| **Content** | Brand personality radar (text-based representation of 5-7 traits with intensity scores), archetype name and description, core values list (3-5), personality adjectives |
| **Visual** | Clean two-column layout. Left: radar/trait scores as horizontal bars or a text-based radar diagram. Right: archetype card with values list. Accent color: brand-secondary. |
| **Radar format** | Text-based radar using horizontal bar chart -- each trait on a line with a filled bar showing intensity (1-10 scale). |

Example radar:
```
Innovation   ████████░░  8/10
Trust        ██████████  10/10
Warmth       ██████░░░░  6/10
Precision    █████████░  9/10
Boldness     ███████░░░  7/10
```

#### Slide 3: Positioning

| Aspect | Specification |
|--------|--------------|
| **Content** | What/How/Why framework (3 blocks), value proposition statement, competitive differentiator summary |
| **Visual** | Three-column layout (or three stacked horizontal blocks). Each block: bold label (WHAT / HOW / WHY), body text below. Brand-primary used for labels. Value proposition in a highlighted box below the three columns. |

#### Slides 4-5: Concept & Moodboard

| Aspect | Specification |
|--------|--------------|
| **Content** | Slide 4: Selected concept theme name, rationale (why this direction), key design principles derived from concept (3-5 bullet points). Slide 5: Moodboard -- described visual references, color mood, texture/material associations, spatial/compositional feel. |
| **Visual** | Slide 4: Large concept title (H1), body text rationale, principle cards in a row. Slide 5: Grid layout suggesting a moodboard -- colored blocks representing imagery zones, descriptive text labels. Since actual images cannot be embedded programmatically, use color fields + text descriptions of visual references. |
| **Note** | Moodboard is representational: use brand color blocks, pattern fills, and descriptive annotations rather than photographs. |

#### Slides 6-7: Pictogram Development

| Aspect | Specification |
|--------|--------------|
| **Content** | Slide 6: Construction grid showing how the pictogram (brand mark) was derived -- geometric breakdown, grid system, proportional relationships. Slide 7: Evolution sequence from initial concept (e.g., initials, abstract form) to final refined mark, showing 3-4 intermediate stages. |
| **Visual** | Slide 6: Technical diagram style. Grid lines (light gray, 0.25pt), construction circles/shapes (brand-primary at 20% opacity), final mark overlay (brand-primary at 100%). Generous whitespace. Slide 7: Horizontal sequence of 4-5 mark iterations, left to right, with subtle arrow indicators. |
| **Implementation** | Embed the actual SVG mark from `.seurat/brand/logo-pictogram.svg`. Draw grid lines using reportlab canvas. For the evolution, render simplified versions of the mark at different stages of refinement. |

#### Slide 8: Logo + Logotype

| Aspect | Specification |
|--------|--------------|
| **Content** | Final brand mark (pictogram + logotype combined), clear space diagram showing minimum exclusion zone, mark dimensions and proportions |
| **Visual** | Centered composition. Mark at ~40% page width. Clear space indicated by dashed lines or semi-transparent boundary box. Whitespace is the star -- this page should breathe. |
| **Notes** | Clear space measured in units of the mark's "x-height" or a defined module. |

#### Slide 9: Variations

| Aspect | Specification |
|--------|--------------|
| **Content** | All logo variants: horizontal lockup, vertical lockup, icon-only. All versions: positive (dark on light), negative (light on dark), monochrome. |
| **Visual** | 3x3 grid (or 3x2 if fewer variants). Equal cell sizes. Top row: light background. Bottom row: dark background. Each cell shows one variant, labeled below (e.g., "Horizontal -- Positive"). |

#### Slide 10: Typography

| Aspect | Specification |
|--------|--------------|
| **Content** | Primary font: name, specimen (Aa Bb Cc ... 0-9), available weights displayed. Secondary font: same treatment. Hierarchy table: H1-H6, body, caption with size/weight specs. |
| **Visual** | Left half: primary font showcase (large specimen, weight ramp from Light to Black). Right half: secondary font showcase. Bottom: hierarchy table with actual rendered examples at each size. |

#### Slide 11: Color Palette

| Aspect | Specification |
|--------|--------------|
| **Content** | All color palettes: primary, secondary, extended. Each color shows: swatch, name, HEX, RGB, CMYK. Color ratio diagram. |
| **Visual** | Large swatch blocks for primary colors (full width, 40mm tall). Smaller swatches for secondary (half width, 25mm). Grid of small swatches for extended (20mm each). Ratio bar at bottom showing 60/30/10 distribution. |

#### Slide 12: Brand Voice

| Aspect | Specification |
|--------|--------------|
| **Content** | Personality traits (3-5), tone spectrum sliders (4 axes), top 3 do's and don'ts with examples |
| **Visual** | Text-focused page. Trait badges at top (rounded rectangles in brand colors with trait names). Slider visualizations as horizontal bars with position markers. Do's/Don'ts in two columns with check/cross indicators. |

#### Slide 13: Brand Architecture

| Aspect | Specification |
|--------|--------------|
| **Content** | Master brand, extension types, hierarchy diagram. If single-product, state that and show future scalability. |
| **Visual** | Tree diagram or hierarchy chart. Master brand at top (largest), extensions branching below (proportionally smaller). Connection lines in brand-primary. |
| **Skip condition** | If the brand has no extensions, show a simplified "Master Brand" card with a note: "Brand architecture will expand as the product line grows." |

#### Slides 14-16: Applications & Mockups

| Aspect | Specification |
|--------|--------------|
| **Content** | Slide 14: Business card (front + back) and letterhead. Slide 15: Social media (avatar, cover photo, post example). Slide 16: Website viewport mockup and signage/environmental example. |
| **Visual** | Mock-up style: use reportlab drawing primitives to create simplified representations. Business card: rounded rectangle at scale with brand mark, name, contact details rendered in brand fonts. Letterhead: page outline with header/footer. Social: rectangular frames sized to platform ratios. Website: browser chrome frame with simplified page layout. |
| **Note** | These are schematic mockups, not photorealistic. Use clean lines, brand colors, and actual brand typography. Gray rectangles for imagery placeholders. |

#### Slide 17: Do's and Don'ts

| Aspect | Specification |
|--------|--------------|
| **Content** | 6-8 rules: correct usage (left column, green check) vs incorrect usage (right column, red cross). Cover: stretching, color misuse, background placement, minimum size, clear space violations, unauthorized modifications. |
| **Visual** | Two-column grid. Left: "Do" examples with a green checkmark icon (or brand success color). Right: "Don't" examples with a red cross icon (or brand error color). Each cell shows a simplified mark rendering demonstrating the rule. |

#### Slide 18: Next Steps

| Aspect | Specification |
|--------|--------------|
| **Content** | Summary of figurative direction (for external illustrator/designer), recommended next actions (trademark filing, asset preparation, implementation timeline), contact information. |
| **Visual** | Minimal, action-oriented. Numbered list of next steps (3-5 items). Each step: number in brand-primary circle, action text, responsible party or timeline. Brand mark at bottom, reduced opacity. |
| **Figurative direction spec** | Summary block: "Figurative logo direction: [style description], [subject/concept], [recommended technique]. Brief for external designer included in brand assets folder." |

---

## 4. Proposal PDF Generation

Instructions for generating the proposal PDF via Scribe (reportlab).

### Self-Referential Design

The proposal PDF uses the brand's own identity. This means:
- Background colors come from `.seurat/brand/tokens.json` or `brief.json`
- Typography attempts to use the brand's chosen fonts
- Color accents use the brand's primary and secondary colors
- The proposal itself is a demonstration of the brand identity

### Page Setup

| Property | Value |
|----------|-------|
| Page size | A4 landscape (842 x 595pt) for a slide-like format, OR A4 portrait for a document-style presentation. Default: landscape. |
| Margins | 20mm all sides for landscape; 25mm for portrait |
| Background | White default; brand-primary for cover and section dividers |

### SVG Logo Embedding

Embed SVG logos from `.seurat/brand/` into reportlab:

**Method 1: svglib (preferred)**
```python
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

drawing = svg2rlg('path/to/logo.svg')
# Scale to fit
scale_factor = desired_width / drawing.width
drawing.width = desired_width
drawing.height = drawing.height * scale_factor
drawing.scale(scale_factor, scale_factor)

# Render onto canvas
renderPDF.draw(drawing, canvas, x, y)
```

**Method 2: Convert SVG to reportlab Drawing manually**
If svglib is unavailable, parse SVG path data and convert to reportlab shapes:
```python
from reportlab.graphics.shapes import Drawing, Path, Group
# Parse SVG paths and recreate using reportlab primitives
```

**Method 3: Rasterize fallback**
If SVG embedding fails, convert SVG to PNG at 300 DPI and embed as image:
```python
# Using cairosvg if available
import cairosvg
cairosvg.svg2png(url='logo.svg', write_to='logo.png', dpi=300)
canvas.drawImage('logo.png', x, y, width, height)
```

### Color Swatch Rendering

Same approach as guidelines PDF (see Section 2). For the proposal, use larger swatches on the Color Palette slide:

- Primary colors: 60mm x 40mm blocks
- Secondary colors: 40mm x 30mm blocks
- Extended colors: 25mm x 25mm blocks
- All swatches include color name and HEX code directly below

### Mock-up Generation

Use reportlab drawing primitives to create simplified application mockups:

**Business card mockup:**
```python
def draw_business_card(canvas, x, y, brand):
    """Draw simplified business card at 2x actual size."""
    w, h = 178, 102  # 2x standard card in points
    # Card shadow
    canvas.setFillColor(HexColor('#E0E0E0'))
    canvas.rect(x+2, y-2, w, h, fill=1, stroke=0)
    # Card face
    canvas.setFillColor(white)
    canvas.rect(x, y, w, h, fill=1, stroke=1)
    canvas.setStrokeColor(HexColor('#E0E0E0'))
    # Brand mark area (top-left)
    # Name, title, contact (brand fonts or fallback)
```

**Website viewport mockup:**
```python
def draw_browser_frame(canvas, x, y, w, h, brand):
    """Draw simplified browser chrome with page content."""
    # Title bar
    canvas.setFillColor(HexColor('#F5F5F5'))
    canvas.rect(x, y+h-20, w, 20, fill=1, stroke=1)
    # Traffic light dots
    for i, color in enumerate(['#FF5F57', '#FFBD2E', '#28C940']):
        canvas.setFillColor(HexColor(color))
        canvas.circle(x+12+i*14, y+h-10, 4, fill=1, stroke=0)
    # Content area
    canvas.setFillColor(white)
    canvas.rect(x, y, w, h-20, fill=1, stroke=1)
    # Simplified page layout using brand colors
```

**Social media mockup:**
```python
def draw_social_post(canvas, x, y, w, h, brand):
    """Draw simplified social media post frame."""
    # Frame
    canvas.setFillColor(white)
    canvas.roundRect(x, y, w, h, 8, fill=1, stroke=1)
    # Avatar circle
    canvas.setFillColor(HexColor(brand['primary']))
    canvas.circle(x+20, y+h-20, 12, fill=1, stroke=0)
    # Content area with brand colors
```

### Fallback Strategies

| Issue | Fallback |
|-------|----------|
| Brand font TTF not available | Use Helvetica for headings, Times-Roman for body. Add footnote: "Final version will use [Font Name]" |
| svglib not installed | Rasterize SVG to PNG at 300 DPI via cairosvg, or use reportlab drawing primitives to approximate the mark |
| cairosvg not available | Draw a placeholder rectangle with brand-primary fill and text "[Logo]" centered |
| Color rendering differs on screen vs PDF | Note in generation output: "Verify printed colors against Pantone reference" |
| Complex SVG paths fail to convert | Simplify SVG (remove filters, gradients) and retry; or use rasterized fallback |

---

## 5. Content Standards & Quality Gates

All generated brand identity content must pass these quality gates before delivery.

### Language

- All content in English
- Use American English spelling conventions unless brief specifies otherwise
- No machine-translation artifacts (verify natural phrasing)

### Color Code Completeness

| Palette tier | Required formats | Optional |
|-------------|-----------------|----------|
| Primary (1-2 colors) | HEX, RGB, CMYK, Pantone | -- |
| Secondary (2-3 colors) | HEX, RGB, CMYK, Pantone | -- |
| Extended (5-8 colors) | HEX, RGB | CMYK, Pantone |

Validation:
- HEX must be 6-digit with `#` prefix (e.g., `#2D5BFF`, not `#2D5BFF80` or `blue`)
- RGB values must be 0-255 integers
- CMYK values must be 0-100 percentages
- Pantone must reference a real PMS code (validate against known Pantone libraries if available)

### Typography Completeness

Every font specification must include:

| Field | Required | Example |
|-------|----------|---------|
| Family name | Yes | "DM Serif Display" |
| Available weights | Yes | "Regular (400), Bold (700)" |
| Recommended sizes | Yes | "H1: 48px, H2: 36px, Body: 16px" |
| Line-height | Yes | "1.1 for headings, 1.5 for body" |
| Letter-spacing | Yes | "-0.02em for H1, 0 for body" |
| Source/license | Yes | "Google Fonts, OFL license" |
| Fallback stack | Yes | "'DM Serif Display', Georgia, serif" |

### Content Quality

- Every section must contain concrete, actionable specifications -- not just category headers
- Do's/Don'ts must include paired examples (good vs bad copy)
- Color ratios must be specified with percentages
- Photography guidelines must include both positive and negative examples
- Voice guidelines must include tone-shift examples per context

### PDF Quality

- PDF must open without errors in: macOS Preview, Adobe Acrobat Reader, Chrome PDF viewer
- All text must be selectable (not rasterized)
- File size target: under 10MB for guidelines, under 15MB for proposal
- Metadata: set PDF title, author, subject fields via reportlab
- No broken internal links or blank pages

### SVG Quality

- All SVG logos must be valid XML (parseable by standard XML parser)
- Must include `viewBox` attribute for proper scaling
- Must render correctly in: Chrome, Firefox, Safari
- Paths must use relative coordinates where possible for portability
- No embedded raster images inside SVG
- File size: under 50KB per logo variant

### Completeness Checklist

Before marking Phase 3 (Guidelines) complete:

- [ ] All 6 guideline sections (3.1-3.6) have substantive content
- [ ] Color codes include all required formats per tier
- [ ] Typography includes full hierarchy table
- [ ] At least 6 Do's/Don'ts examples in voice section
- [ ] Resource templates (business card, letterhead, email sig, presentation) fully specified
- [ ] PDF generates without errors

Before marking Phase 4 (Proposal) complete:

- [ ] All 18 slides have content
- [ ] Brand's own colors and typography used throughout
- [ ] Logo SVGs embedded or represented
- [ ] Color swatches rendered with codes
- [ ] Application mockups present (slides 14-16)
- [ ] Do's/Don'ts slide has visual examples
- [ ] PDF generates without errors
- [ ] Next steps include figurative direction summary

---

## 6. Reference Material Index

Curated sources informing brand identity generation. Use these as structural models, not as content to copy.

### Professional Proposal References

| Reference | Key takeaway | Apply to |
|-----------|-------------|----------|
| **Umbrahands / Cariani** | Brand identikit format: personality radar with trait intensity scores, archetype-driven identity | Slide 2 (Identikit), identity profile structure |
| **TerraViva** | Initials-based mark construction, color ratio methodology (60/30/10 with specific percentages per color) | Slides 6-7 (Pictogram), Section 3.2.2 (Color ratios) |
| **Pederiva Studio** | Grid construction methodology: showing geometric derivation of mark from underlying grid system | Slides 6-7 (Pictogram construction grid) |
| **Dowitcher / NoHo** | Agency presentation format: cover-to-next-steps flow, client-facing slide sequencing | Overall 18-slide structure and narrative arc |

### Academic & Theoretical References

| Reference | Key concept | Apply to |
|-----------|------------|----------|
| **Brand-Bios model** | 12 brand archetypes (Innocent, Explorer, Sage, Hero, Outlaw, Magician, Regular, Lover, Jester, Caregiver, Creator, Ruler) with personality traits per archetype | Identity generation, archetype selection in Phase 2 |
| **Wheeler's Brand Identity Ideals** | 7 ideals of brand identity: vision, meaning, authenticity, differentiation, sustainability, coherence, flexibility | Quality framework for evaluating generated identity |
| **Bertin's 7 visual variables** | Position, size, shape, value, color, orientation, texture -- the fundamental visual encoding channels | Design pattern selection, data visualization guidelines |
| **Henderson & Cote framework** | Logo design dimensions: elaborate/simple, natural/abstract, harmony, proportion -- predictors of recognition and affect | Logo evaluation criteria, shape psychology |
| **Cash et al. design methods** | Systematic design reasoning: function, form, context mapping | Structured approach to deriving visual identity from brand strategy |

### Complete Guidelines Example

| Reference | Value | Apply to |
|-----------|-------|----------|
| **Virginia Tech Brand Guidelines (2019)** | 94-page comprehensive guidelines document covering: identity system, color, typography, photography, voice & tone, digital, print templates, brand architecture, editorial style | Model for Section 1 structure; benchmark for completeness and depth; reference for content granularity (how detailed each section should be) |

### Logo Brief Reference

| Reference | Value | Apply to |
|-----------|-------|----------|
| **Simpsons Creative questionnaire** | Structured client intake: business overview, target audience, competitors, design preferences, practical requirements (where will the logo be used), style preferences (modern/classic, playful/serious) | Discovery phase questioning structure, brief.json field definitions |

### How to Use These References

1. **During generation:** Reference the structural patterns, not specific visual content. E.g., use TerraViva's approach to showing color ratios, but with the actual brand's colors.
2. **For quality comparison:** After generating, compare completeness against Virginia Tech guidelines. Are all major areas covered? Is the depth comparable?
3. **For identity profiling:** Use Brand-Bios archetypes as the foundation for personality scoring in Slide 2.
4. **For logo evaluation:** Apply Henderson & Cote dimensions to score the generated mark before presenting it.
5. **For presentation flow:** Follow the Dowitcher/NoHo narrative arc: context > identity > visual system > applications > next steps.

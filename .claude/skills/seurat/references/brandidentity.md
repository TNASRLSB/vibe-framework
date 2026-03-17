# Brand Identity — Complete Workflow Reference

**Command:** `/seurat brandidentity`

This is the master reference for the brand identity workflow. Claude reads this file when `/seurat brandidentity` is invoked and follows each phase sequentially, respecting user gates and flag routing.

---

## Phase 0: Prerequisites & Flag Routing

### 0.1 Flag Detection

Parse the user's command for flags:

| Flag | Effect | Entry point | Prerequisites |
|------|--------|-------------|---------------|
| *(none)* | Full flow | Phase 1 | None |
| `--brief` | Discovery only | Phase 1 | None |
| `--logo` | Logo + identity generation | Phase 2 | `.seurat/brand/brief.json` must exist |
| `--pdf` | PDF presentation only | Phase 4 | `.seurat/brand/identity.json` must exist |

**Flag validation rules:**

- `--logo`: Check for `.seurat/brand/brief.json`. If missing, inform user: "No brand brief found. Run `/seurat brandidentity` or `/seurat brandidentity --brief` first to generate the brief." STOP.
- `--pdf`: Check for `.seurat/brand/identity.json`. If missing, inform user: "No brand identity found. Run `/seurat brandidentity` first to generate the identity system." STOP.
- If multiple flags provided, reject: "Only one flag at a time. Use `--brief`, `--logo`, or `--pdf`."

### 0.2 Output Directory Setup

Create the following directory structure if it does not exist:

```
.seurat/
└── brand/
    ├── logo/
    ├── guidelines/
    └── proposal/
```

Use `mkdir -p` for all directories.

### 0.3 .gitignore Handling

Check if `.gitignore` exists at project root. If it does, verify it contains `.seurat/` exclusion. If `.seurat/` is not excluded:

1. Check if there is already a `.seurat/tokens.css` tracked by git (this is intentional — tokens are meant to be committed)
2. Add to `.gitignore`:
   ```
   # Seurat design system artifacts
   .seurat/
   !.seurat/tokens.css
   !.seurat/tokens.json
   ```

If `.gitignore` does not exist, create it with the above content.

### 0.4 Integration Check

Check if `.seurat/tokens.css` exists:

- **If yes:** Read it. Extract existing colors (custom properties containing color values) and fonts (font-family properties). These inform Phase 1 as `existingAssets` in the brief.
- **If no:** Proceed without existing design tokens. Note this in the brief as empty `existingAssets`.

Check if `.seurat/brand/tokens.json` already exists from a previous run:

- **If yes:** Inform user: "Found existing brand tokens. This run will overwrite them. Continue?" Wait for confirmation.

---

## Phase 1: Codebase Analysis & Brand Discovery

### 1.1 What to Scan

Scan the following sources in order. For each source, extract what is available and skip what is not present.

#### Project Manifest

| File | Extract |
|------|---------|
| `package.json` | `name`, `description`, `keywords`, `author`, `license`, `homepage` |
| `Cargo.toml` | `[package]` name, description, keywords, categories |
| `pyproject.toml` | `[project]` name, description, keywords, classifiers |
| `composer.json` | `name`, `description`, `keywords` |
| `*.gemspec` | `name`, `summary`, `description` |
| `go.mod` | module name |

Use the first manifest found. If multiple exist (monorepo), prefer the root-level one.

#### README / Documentation

| File | Extract |
|------|---------|
| `README.md` / `README.rst` | Mission statement, tagline, badges, feature descriptions, audience mentions |
| `docs/` directory | Any brand/about/mission pages |
| `CONTRIBUTING.md` | Community values, tone |
| `.github/FUNDING.yml` | Sponsorship context |

Look for patterns:
- First paragraph usually contains the project's self-description
- Badge text reveals ecosystem (npm, crates.io, PyPI)
- "Who is this for" or "Target audience" sections
- Taglines often appear right after the project name

#### Existing Design Assets

| Source | Extract |
|--------|---------|
| `.seurat/tokens.css` | Color palette (HEX values), font families, spacing base |
| `src/**/*.css`, `**/*.scss` | Recurring color values, font-family declarations |
| `tailwind.config.*` | Theme colors, fonts, custom values |
| `public/favicon.*`, `public/logo.*` | `hasLogo: true` |
| `src/**/logo.*`, `src/**/brand.*` | `hasLogo: true` |

#### Tech Stack Detection

Detect from manifest files, lock files, and directory structure:

| Signal | Technology |
|--------|-----------|
| `package.json` + `next.config.*` | Next.js |
| `package.json` + `vite.config.*` | Vite |
| `Cargo.toml` | Rust |
| `pyproject.toml` / `requirements.txt` | Python |
| `docker-compose.yml` | Docker |
| `*.sol` files | Blockchain/Web3 |
| `.github/workflows/` | CI/CD |
| `tsconfig.json` | TypeScript |

Record as `techStack` array in brief.

#### Ghostwriter Artifacts

Check for existing Ghostwriter output:

| File | Extract |
|------|---------|
| `.ghostwriter/content-strategy.json` | Brand voice, messaging, audience |
| `.ghostwriter/seo-audit.json` | Keywords, positioning |
| `.ghostwriter/copy/*.md` | Tone, language patterns |

### 1.2 Inference Heuristics

Derive `values`, `personality.traits`, and `personality.archetype` from codebase signals.

#### Values Inference

Map detected patterns to brand values (select 3-5):

| Codebase Signal | Inferred Value |
|-----------------|---------------|
| Comprehensive test suite, CI/CD | Reliability |
| MIT/Apache license, CONTRIBUTING.md | Openness |
| Accessibility features, WCAG compliance | Inclusivity |
| Performance benchmarks, optimization code | Performance |
| Clean code, strong typing, linting | Craftsmanship |
| Internationalization (i18n) | Global reach |
| Security headers, auth system | Trust |
| Minimal dependencies, small bundle | Simplicity |
| Plugin system, extensible architecture | Flexibility |
| Comprehensive docs, examples | Education |
| Playful copy, emoji in docs | Fun |
| Enterprise features, RBAC, audit logs | Enterprise-grade |

#### Personality Traits Inference

Map project character to adjective list (select 3-5):

| Signal | Traits |
|--------|--------|
| Developer tool + clean docs | Precise, Knowledgeable, Efficient |
| Consumer app + playful copy | Friendly, Energetic, Approachable |
| Enterprise + security focus | Authoritative, Trustworthy, Professional |
| Creative tool + visual output | Expressive, Inspiring, Bold |
| Data/analytics product | Analytical, Clear, Insightful |
| Open-source community project | Collaborative, Transparent, Welcoming |
| API/infrastructure | Reliable, Technical, Understated |

#### Archetype Selection

Map to brand archetypes (select primary, note secondary):

| Project Type | Primary Archetype | Secondary |
|-------------|-------------------|-----------|
| Developer tools, frameworks | **Creator** | Sage |
| Security, monitoring | **Caregiver** | Ruler |
| Analytics, data science | **Sage** | Explorer |
| Creative tools, design | **Magician** | Creator |
| Community platforms | **Everyman** | Jester |
| Performance, speed-focused | **Hero** | Explorer |
| Innovation, cutting-edge | **Explorer** | Magician |
| Enterprise, compliance | **Ruler** | Caregiver |
| Playful, consumer apps | **Jester** | Everyman |
| Luxury, premium products | **Lover** | Ruler |
| Disruptive, challenger | **Outlaw** | Hero |
| Purity, simplicity-focused | **Innocent** | Caregiver |

#### Tone Derivation

Combine traits into a tone statement: "[trait1] but [balancing trait]"

Examples:
- Technical + Friendly = "technical but approachable"
- Bold + Precise = "confident but meticulous"
- Playful + Reliable = "fun but dependable"

### 1.3 brief.json Schema

```json
{
  "name": "string — brand/project name",
  "tagline": "string | null — existing tagline if found",
  "domain": "string — industry/sector (e.g., 'developer tools', 'e-commerce')",
  "description": "string — what the project does (1-2 sentences)",
  "techStack": ["string[] — detected technologies"],
  "values": ["string[] — inferred brand values (3-5)"],
  "audience": {
    "primary": "string — main target user",
    "secondary": "string | null"
  },
  "personality": {
    "traits": ["string[] — 3-5 personality adjectives"],
    "tone": "string — e.g., 'professional but approachable'",
    "archetype": "string — primary brand archetype"
  },
  "existingAssets": {
    "colors": ["string[] — HEX codes already in use"],
    "fonts": ["string[] — font families already in use"],
    "hasLogo": "boolean"
  },
  "competitors": ["string[] — if detectable from docs/config"]
}
```

### 1.4 User Gate: Brief Review

Present the brief as a formatted table to the user. Use this exact format:

```
## Brand Brief — [name]

| Field | Value |
|-------|-------|
| Name | [name] |
| Tagline | [tagline or "none detected"] |
| Domain | [domain] |
| Description | [description] |
| Tech Stack | [comma-separated list] |
| Values | [comma-separated list] |
| Primary Audience | [audience.primary] |
| Secondary Audience | [audience.secondary or "—"] |
| Personality | [comma-separated traits] |
| Tone | [tone] |
| Archetype | [archetype] |
| Existing Colors | [HEX codes or "none"] |
| Existing Fonts | [font names or "none"] |
| Has Logo | [yes/no] |
| Competitors | [list or "none detected"] |

**Review this brief.** Edit any field you want to change, or say "proceed" to continue.
```

Wait for user response. If the user provides edits:
1. Apply edits to the brief object
2. Re-display the updated table
3. Ask for confirmation again

Once confirmed, save to `.seurat/brand/brief.json`.

### 1.5 --brief Flag Stop

If `--brief` flag was provided: inform user that the brief has been saved and STOP.

> "Brand brief saved to `.seurat/brand/brief.json`. Run `/seurat brandidentity --logo` to continue with identity generation, or `/seurat brandidentity` for the full flow."

---

## Phase 2: Brand Identity Generation

If `--logo` flag was provided: read `.seurat/brand/brief.json` and skip to this phase.

### 2.1 Brand Identikit

Generate the following identity components from the brief:

#### Brand Personality Profile (Brand-Bios Model)

Describe the brand as if it were a person. Write a short narrative (3-5 sentences) covering:
- How this person looks and dresses (visual impression)
- How they speak (communication style)
- What they care about (core motivations)
- How they make others feel (emotional impact)
- What room they walk into and how people react (presence)

This narrative becomes the north star for all visual and verbal decisions.

#### Archetype Definition

From the brief's archetype field, elaborate:

| Dimension | Description |
|-----------|-------------|
| Primary Archetype | [archetype name] — core brand character |
| Secondary Archetype | [archetype name] — complementary traits |
| Archetype Blend | How primary and secondary interact (1-2 sentences) |
| Archetype Danger Zone | What to avoid when this archetype goes too far |

#### Brand Identity Ideals (Wheeler Framework)

Evaluate and articulate each ideal:

| Ideal | Assessment |
|-------|-----------|
| **Differentiation** | What makes this brand visually/verbally distinct from competitors |
| **Relevance** | How the identity connects to the target audience's needs |
| **Coherence** | How all identity elements work together as a system |
| **Esteem** | What earns respect and credibility |
| **Knowledge** | What the audience should instantly understand about the brand |

#### Value Proposition Narrative

Structure as three layers:
1. **What we do** — Functional description (1 sentence)
2. **How we do it** — Differentiating approach (1 sentence)
3. **Why it matters** — Emotional/aspirational outcome (1 sentence)

#### Brand Pillars

Define exactly 3 pillars:

| Pillar | Attribute | Description | User Benefit |
|--------|-----------|-------------|-------------|
| 1 | [name] | What this means for the brand | What users get from it |
| 2 | [name] | What this means for the brand | What users get from it |
| 3 | [name] | What this means for the brand | What users get from it |

#### Brand Voice Traits

Define 3-5 voice traits with usage guidance:

| Trait | Do | Don't |
|-------|-----|-------|
| [trait 1] | [example of correct usage] | [example of what to avoid] |
| [trait 2] | [example of correct usage] | [example of what to avoid] |
| [trait 3] | [example of correct usage] | [example of what to avoid] |

### 2.2 Concept Development

Generate 2-3 distinct concept directions. Each concept must include:

#### Concept Template

For each concept (numbered 1, 2, 3):

**Concept [N]: [Theme/Metaphor Name]**

| Element | Description |
|---------|-------------|
| **Theme** | The central metaphor or visual idea |
| **Rationale** | Why this metaphor fits the brand personality and values (2-3 sentences) |
| **Moodboard** | Color atmosphere (warm/cool/neutral, high/low saturation), textures (smooth, rough, organic, geometric), visual references (specific real-world objects, materials, environments), photographic style (if applicable) |
| **Shape Psychology** | Analysis using Bertin's 7 graphic variables: position, size, shape, value (lightness), color, orientation, texture. Which shapes dominate and why. |
| **Color Direction** | Primary color family, accent strategy, contrast level |
| **Typography Direction** | Serif/sans/slab/mono, weight range, personality of letterforms |
| **Logo Direction** | Geometric/organic/abstract/lettermark, construction principle |

#### Concept Differentiation Rules

The 3 concepts must differ meaningfully:
- Different primary color families (e.g., blue vs green vs neutral)
- Different shape languages (e.g., angular vs rounded vs mixed)
- Different typography personalities (e.g., humanist vs geometric vs monospace)
- Different metaphor domains (e.g., nature vs technology vs architecture)

### 2.3 User Gate: Concept Selection

Present concepts as numbered options:

```
## Concept Directions

### 1. [Theme Name]
[2-3 sentence summary of the concept]
Colors: [color direction]  |  Typography: [type direction]  |  Logo: [logo direction]

### 2. [Theme Name]
[2-3 sentence summary of the concept]
Colors: [color direction]  |  Typography: [type direction]  |  Logo: [logo direction]

### 3. [Theme Name]
[2-3 sentence summary of the concept]
Colors: [color direction]  |  Typography: [type direction]  |  Logo: [logo direction]

**Select a concept (1, 2, or 3)**, or describe modifications you'd like.
```

Wait for user selection. If the user requests modifications:
1. Apply modifications to the selected concept
2. Re-present the modified concept
3. Confirm before proceeding

### 2.4 Logo & Logotype Generation

**Delegate to `references/logo-design.md`.**

Read `references/logo-design.md` for:
- SVG generation patterns and construction methods
- Shape psychology and geometric rationale
- Pictogram development (construction grid, evolution steps)
- Logotype design (font selection, letterform customization)
- Clear space and minimum size rules

Pass to logo-design.md:
- Selected concept direction (theme, shape psychology, color direction, typography direction)
- Brand name from brief
- Brand personality profile from identikit

Expected outputs from logo-design.md:
- `.seurat/brand/logo/mark.svg` — Primary pictogram/mark
- `.seurat/brand/logo/mark-negative.svg` — Negative/reversed version
- `.seurat/brand/logo/logotype.svg` — Wordmark/logotype
- `.seurat/brand/logo/logo-horizontal.svg` — Horizontal lockup (mark + logotype)
- `.seurat/brand/logo/logo-vertical.svg` — Vertical lockup (mark above logotype)
- `.seurat/brand/logo/logo-icon.svg` — Favicon/app icon simplified version
- `.seurat/brand/logo/construction.svg` — Construction grid showing geometric rationale

### 2.5 Variations

**Delegate to `references/logo-design.md` Section 4.**

Read `references/logo-design.md` Section 4 for variation rules:
- Positive and negative versions
- Monochrome versions
- Minimum size thresholds
- Background adaptation rules
- Spacing and clearance zones

### 2.6 Save Identity Data

Save the complete identity object to `.seurat/brand/identity.json`:

```json
{
  "brief": "reference → .seurat/brand/brief.json",
  "selectedConcept": {
    "number": 1,
    "theme": "string — theme/metaphor name",
    "rationale": "string",
    "moodboard": {
      "colors": "string — color atmosphere description",
      "textures": "string — texture description",
      "references": "string — visual references",
      "photography": "string | null"
    },
    "shapePsychology": {
      "dominantShapes": ["string[]"],
      "bertin": {
        "position": "string",
        "size": "string",
        "shape": "string",
        "value": "string",
        "color": "string",
        "orientation": "string",
        "texture": "string"
      }
    }
  },
  "identikit": {
    "personalityProfile": "string — Brand-Bios narrative",
    "archetypes": {
      "primary": "string",
      "secondary": "string",
      "blend": "string",
      "dangerZone": "string"
    },
    "wheelerIdeals": {
      "differentiation": "string",
      "relevance": "string",
      "coherence": "string",
      "esteem": "string",
      "knowledge": "string"
    },
    "valueProposition": {
      "what": "string",
      "how": "string",
      "why": "string"
    },
    "pillars": [
      {
        "attribute": "string",
        "description": "string",
        "userBenefit": "string"
      }
    ],
    "voiceTraits": [
      {
        "trait": "string",
        "do": "string",
        "dont": "string"
      }
    ]
  },
  "palette": {
    "primary": { "hex": "#...", "name": "string" },
    "secondary": { "hex": "#...", "name": "string" },
    "accent": { "hex": "#...", "name": "string" },
    "neutral": {
      "darkest": "#...",
      "dark": "#...",
      "mid": "#...",
      "light": "#...",
      "lightest": "#..."
    },
    "semantic": {
      "success": "#...",
      "warning": "#...",
      "error": "#...",
      "info": "#..."
    }
  },
  "typography": {
    "primary": {
      "family": "string",
      "weights": ["number[]"],
      "usage": "headings",
      "source": "string — Google Fonts / system / custom"
    },
    "secondary": {
      "family": "string",
      "weights": ["number[]"],
      "usage": "body",
      "source": "string"
    }
  },
  "logoFiles": {
    "mark": ".seurat/brand/logo/mark.svg",
    "markNegative": ".seurat/brand/logo/mark-negative.svg",
    "logotype": ".seurat/brand/logo/logotype.svg",
    "horizontal": ".seurat/brand/logo/logo-horizontal.svg",
    "vertical": ".seurat/brand/logo/logo-vertical.svg",
    "icon": ".seurat/brand/logo/logo-icon.svg",
    "construction": ".seurat/brand/logo/construction.svg"
  }
}
```

---

## Phase 3: Brand Guidelines

**Delegate to `references/brand-guidelines.md`.**

Read `references/brand-guidelines.md` for:
- Complete guidelines document structure
- Content standards for each section
- Writing style and level of detail
- Visual examples to include

### 3.1 Guidelines Generation

Using the identity data from `.seurat/brand/identity.json`, generate a comprehensive brand guidelines document. The guidelines must cover:

1. **Brand Strategy** — Mission, vision, values, positioning, value proposition
2. **Visual Identity** — Logo usage, color system, typography, imagery, iconography
3. **Brand Voice** — Personality, tone spectrum, writing guidelines, do's/don'ts
4. **Digital Standards** — Web, mobile, social media, email templates
5. **Brand Architecture** — Master brand, sub-brands, extensions, co-branding
6. **Resources** — Asset inventory, contact information, approval process

### 3.2 PDF Generation

Invoke Scribe for PDF generation using reportlab:

**What to pass to Scribe:**
- Content: The complete guidelines document (structured as sections)
- Brand palette: from `identity.json` → `palette`
- Brand typography: from `identity.json` → `typography`
- Logo files: paths from `identity.json` → `logoFiles`
- Self-referential design rule: The PDF itself must use the brand's own palette and typography

**Scribe invocation pattern:**
```
Invoke Scribe to generate a PDF document.
Input: Brand guidelines content (structured markdown)
Styling: Use brand colors [primary hex], [secondary hex] and font [primary family]
Include: Logo SVGs from .seurat/brand/logo/
Output: .seurat/brand/guidelines/brand-guidelines.pdf
Tool: reportlab
```

**Output:** `.seurat/brand/guidelines/brand-guidelines.pdf`

---

## Phase 4: Proposal Presentation

If `--pdf` flag was provided: read `.seurat/brand/identity.json` and skip to this phase.

### 4.1 Slide Structure

Generate an 18-slide brand identity proposal presentation:

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Cover | Brand name, "Brand Identity Proposal", date, minimal mark |
| 2 | Brand Identikit | Personality profile narrative, archetype icons, values list |
| 3 | Positioning | What/How/Why value proposition, brand pillars |
| 4 | Concept & Rationale | Selected theme name, rationale text, shape psychology diagram |
| 5 | Moodboard | Color atmosphere, texture references, visual references grid |
| 6 | Pictogram Development | Construction grid, geometric rationale, evolution from basic shapes |
| 7 | Pictogram Refinement | Final mark with annotations, optical corrections, grid overlay |
| 8 | Logo + Logotype | Final mark alongside logotype, clear space rules, minimum sizes |
| 9 | Variations | Horizontal, vertical, icon-only layouts. Positive and negative on light/dark backgrounds |
| 10 | Typography | Primary + secondary fonts, full character set preview, size hierarchy scale |
| 11 | Color Palette | All palettes (primary, secondary, accent, neutral, semantic) with HEX/RGB/CMYK codes, usage ratios, background adaptation examples |
| 12 | Brand Voice | Personality traits table, tone spectrum (formal to casual), sample copy do/don't |
| 13 | Brand Architecture | Master brand relationship diagram, extension naming pattern, endorsed/standalone rules |
| 14 | Applications: Print | Business card (front/back), letterhead, envelope mockup |
| 15 | Applications: Digital | Website header/hero mockup, mobile app splash, email signature |
| 16 | Applications: Social | Social media profile image, cover photo, post template mockup |
| 17 | Do's and Don'ts | Logo: correct usage vs incorrect (stretched, wrong colors, busy backgrounds, too small). Two-column layout with checkmarks/crosses |
| 18 | Next Steps | Figurative logo direction spec (if the brand wants to evolve from geometric to figurative), implementation timeline, deliverables checklist |

### 4.2 Self-Referential Design Rule

The proposal PDF must use the brand's own identity:
- **Colors:** Use brand primary as accent color, brand neutral scale for text/backgrounds
- **Typography:** Use brand primary font for headings, brand secondary for body (if the fonts are available as system fonts or can be embedded; otherwise note the intended fonts and use a close system substitute)
- **Logo:** Embed the generated SVG mark on the cover and as a subtle watermark/footer element
- **Layout:** Reflect the selected concept's shape psychology (angular layouts for angular brands, rounded elements for organic brands)

### 4.3 PDF Generation

Invoke Scribe for PDF generation using reportlab:

**What to pass to Scribe:**
- Slide content: structured as 18 sections with titles, body content, and asset references
- Brand palette: from `identity.json` → `palette`
- Brand typography: from `identity.json` → `typography`
- Logo files: paths from `identity.json` → `logoFiles`
- Page size: landscape A4 (297mm x 210mm) or 16:9 widescreen (1920x1080 scaled)
- Self-referential design: apply brand colors, fonts, and shape language to all slides

**Scribe invocation pattern:**
```
Invoke Scribe to generate a presentation-style PDF.
Input: 18-slide brand proposal content
Page orientation: Landscape
Styling: Use brand colors [primary hex], [secondary hex], [neutral scale]
Typography: [primary family] for headings, [secondary family] for body
Include: Logo SVGs from .seurat/brand/logo/, mockup illustrations
Output: .seurat/brand/proposal/brand-proposal.pdf
Tool: reportlab
```

**Output:** `.seurat/brand/proposal/brand-proposal.pdf`

---

## Phase 5: Token Handoff

### 5.1 tokens.json Schema

```json
{
  "colors": {
    "primary": {
      "hex": "#...",
      "rgb": "r, g, b",
      "cmyk": "c, m, y, k",
      "pantone": "string — nearest Pantone match or 'N/A'"
    },
    "secondary": {
      "hex": "#...",
      "rgb": "r, g, b",
      "cmyk": "c, m, y, k",
      "pantone": "string"
    },
    "accent": {
      "hex": "#...",
      "rgb": "r, g, b",
      "cmyk": "c, m, y, k",
      "pantone": "string"
    },
    "extended": [
      {
        "name": "string — semantic name (e.g., 'neutral-100')",
        "hex": "#...",
        "rgb": "r, g, b",
        "usage": "string — where/when to use this color"
      }
    ]
  },
  "typography": {
    "primary": {
      "family": "string — font family name",
      "weights": [400, 600, 700],
      "usage": "headings",
      "fallback": "string — fallback stack (e.g., 'Georgia, serif')",
      "source": "string — where to get the font (Google Fonts URL, system, etc.)"
    },
    "secondary": {
      "family": "string",
      "weights": [400, 500],
      "usage": "body",
      "fallback": "string",
      "source": "string"
    }
  },
  "spacing": {
    "base": "string — base unit (e.g., '8px' or '0.5rem')",
    "scale": "string — scale description (e.g., '4-8-12-16-24-32-48-64')"
  }
}
```

### 5.2 Save Tokens

Save to `.seurat/brand/tokens.json`.

### 5.3 Integration with Existing Seurat Tokens

**If `.seurat/tokens.css` exists:**

Update the existing tokens.css with brand colors and typography. Map brand tokens to CSS custom properties:

```css
/* Brand Identity Tokens — auto-generated by /seurat brandidentity */
:root {
  --color-primary: [primary.hex];
  --color-secondary: [secondary.hex];
  --color-accent: [accent.hex];
  /* ... extended colors ... */

  --font-heading: '[primary.family]', [primary.fallback];
  --font-body: '[secondary.family]', [secondary.fallback];

  --space-base: [spacing.base];
}
```

Preserve any existing tokens that are not overridden by brand identity (e.g., spacing scale, shadows, radius).

**If `.seurat/tokens.css` does not exist:**

Do not create it. Instead, inform the user:

> "Brand tokens saved to `.seurat/brand/tokens.json`. When you run `/seurat setup`, it will automatically read these tokens and incorporate them into the design system."

---

## Integration Instructions

### Invoking Scribe for PDF Generation

Scribe handles all PDF generation via reportlab. When delegating:

1. **Prepare content** as structured data (sections with titles, body text, image paths)
2. **Pass brand styling** — palette HEX codes, font families, logo SVG paths
3. **Specify output path** — `.seurat/brand/guidelines/brand-guidelines.pdf` or `.seurat/brand/proposal/brand-proposal.pdf`
4. **Request self-referential design** — the PDF uses the brand's own visual language

Scribe will:
- Create the PDF using reportlab
- Embed SVG logos (convert to reportlab drawing objects)
- Apply brand colors to headings, backgrounds, accents
- Use brand fonts if available as TTF/OTF, or substitute with closest system font
- Generate mockup illustrations where needed (business cards, letterheads, etc.)

### Invoking Ghostwriter for Brand Voice

When Phase 2.1 defines brand voice traits, delegate to Ghostwriter for:

- **Messaging narrative:** Tagline generation, elevator pitch, mission statement
- **Tone spectrum examples:** How the brand sounds across contexts (formal, casual, urgent, celebratory)
- **Sample copy:** Homepage hero, error messages, onboarding flow — all in brand voice

Pass to Ghostwriter:
- Brand personality profile (from identikit)
- Voice traits with do/don't guidance
- Target audience (from brief)
- Brand pillars and value proposition

### Invoking Emmet for Validation

After generating SVGs and tokens, delegate to Emmet for:

- **SVG validation:** Well-formed XML, viewBox present, no inline styles conflicting with theme adaptation, reasonable file size
- **Token consistency:** All colors in identity.json match tokens.json, all fonts referenced exist or have fallbacks, spacing values are on-grid
- **Cross-file consistency:** Logo SVGs use colors from palette, logotype uses specified font

### Cross-Reference: Seurat Tokens

The brand identity token system interacts with Seurat's design system tokens:

| Brand Token (tokens.json) | Design System Token (tokens.css) | Relationship |
|---------------------------|----------------------------------|-------------|
| `colors.primary.hex` | `--color-primary` | Brand defines, design system consumes |
| `colors.secondary.hex` | `--color-secondary` | Brand defines, design system consumes |
| `typography.primary.family` | `--font-heading` | Brand defines, design system consumes |
| `typography.secondary.family` | `--font-body` | Brand defines, design system consumes |
| `spacing.base` | `--space-base` | Brand defines, design system consumes |

**Direction of flow:** `.seurat/brand/tokens.json` is the source of truth. `.seurat/tokens.css` is the consumer. When both exist, tokens.css must reflect tokens.json values for overlapping properties.

---

## Output Structure

### Complete Directory Tree

```
.seurat/
├── brand/
│   ├── brief.json              # Phase 1 output — brand brief from codebase analysis
│   ├── identity.json           # Phase 2 output — full identity system data
│   ├── tokens.json             # Phase 5 output — design tokens for handoff
│   ├── logo/
│   │   ├── mark.svg            # Primary pictogram/mark
│   │   ├── mark-negative.svg   # Negative/reversed version
│   │   ├── logotype.svg        # Wordmark/logotype
│   │   ├── logo-horizontal.svg # Horizontal lockup (mark + logotype)
│   │   ├── logo-vertical.svg   # Vertical lockup (mark above logotype)
│   │   ├── logo-icon.svg       # Favicon/app icon simplified version
│   │   └── construction.svg    # Construction grid with geometric rationale
│   ├── guidelines/
│   │   └── brand-guidelines.pdf # Brand guidelines document
│   └── proposal/
│       └── brand-proposal.pdf  # 18-slide brand identity proposal
```

### File Descriptions

| File | Format | Purpose |
|------|--------|---------|
| `brief.json` | JSON | Codebase-derived brand brief. Editable by user. Input for all subsequent phases. |
| `identity.json` | JSON | Complete brand identity data: identikit, selected concept, palette, typography, logo file references. |
| `tokens.json` | JSON | Design tokens in platform-agnostic format. Consumed by `/seurat setup` and other Seurat commands. |
| `mark.svg` | SVG | Primary brand mark. Geometric/abstract. Must work at 16x16px minimum. |
| `mark-negative.svg` | SVG | White/light version for dark backgrounds. |
| `logotype.svg` | SVG | Brand name as styled text (converted to paths). |
| `logo-horizontal.svg` | SVG | Mark + logotype side by side with defined spacing. |
| `logo-vertical.svg` | SVG | Mark above logotype with defined spacing. |
| `logo-icon.svg` | SVG | Simplified mark for small sizes (favicon, app icon). |
| `construction.svg` | SVG | Mark with construction grid overlay showing geometric relationships. |
| `brand-guidelines.pdf` | PDF | Comprehensive brand usage guide. Uses brand's own palette/typography. |
| `brand-proposal.pdf` | PDF | 18-slide presentation for stakeholder review. Uses brand's own palette/typography. |

### Format Requirements

**SVG files:**
- Valid XML with proper namespace declaration
- `viewBox` attribute on root `<svg>` element (no fixed width/height for scalability)
- No inline styles — use `fill` and `stroke` attributes for theme adaptability
- Optimized: no unnecessary groups, transforms simplified, decimal precision max 2 places
- File size target: under 5KB per SVG (construction.svg may be larger)

**JSON files:**
- Pretty-printed with 2-space indentation
- UTF-8 encoding
- No trailing commas
- All string values properly escaped

**PDF files:**
- A4 portrait for guidelines, landscape for proposal
- Embedded fonts where possible
- Minimum 150 DPI for any raster elements
- Accessible: tagged PDF structure where reportlab supports it

### .gitignore Rules

These rules should be in the project's `.gitignore`:

```gitignore
# Seurat design system artifacts
.seurat/
!.seurat/tokens.css
!.seurat/tokens.json
```

This excludes all generated brand artifacts (SVGs, PDFs, JSON) from version control while preserving the tokens files that other Seurat commands depend on.

If the team wants to commit brand assets, they can adjust this manually.

---

## Validation Checklist

Run these checks before declaring the brandidentity workflow complete:

### Phase 1 Validation
- [ ] `brief.json` exists at `.seurat/brand/brief.json`
- [ ] `brief.json` is valid JSON matching the schema
- [ ] All required fields are non-empty strings
- [ ] `values` array has 3-5 entries
- [ ] `personality.traits` array has 3-5 entries
- [ ] `personality.archetype` is one of the 12 standard archetypes
- [ ] User reviewed and approved the brief

### Phase 2 Validation
- [ ] `identity.json` exists at `.seurat/brand/identity.json`
- [ ] `identity.json` is valid JSON
- [ ] Identikit has all sections: personality profile, archetypes, Wheeler ideals, value proposition, 3 pillars, voice traits
- [ ] 2-3 concept directions were presented to user
- [ ] User selected a concept
- [ ] All 7 logo SVG files exist in `.seurat/brand/logo/`
- [ ] All SVGs are valid XML with `viewBox`
- [ ] Primary mark works at 16x16px (simplified enough)
- [ ] Mark-negative has appropriate contrast on dark backgrounds
- [ ] Logotype text is converted to paths (no font dependency)
- [ ] Color palette has at minimum: primary, secondary, accent, 5-step neutral scale, 4 semantic colors
- [ ] All colors pass WCAG AA contrast requirements when used as specified (text on background combinations)
- [ ] Typography has primary (headings) and secondary (body) with specified weights
- [ ] Selected fonts are not generic (no Inter, Roboto, Arial, Helvetica, sans-serif)

### Phase 3 Validation
- [ ] `brand-guidelines.pdf` exists at `.seurat/brand/guidelines/brand-guidelines.pdf`
- [ ] PDF opens correctly and is not corrupt
- [ ] PDF uses brand colors and typography (self-referential design)
- [ ] Guidelines cover: strategy, visual identity, voice, digital, architecture, resources
- [ ] Logo usage rules include clear space, minimum size, do's/don'ts

### Phase 4 Validation
- [ ] `brand-proposal.pdf` exists at `.seurat/brand/proposal/brand-proposal.pdf`
- [ ] PDF opens correctly and is not corrupt
- [ ] PDF has 18 slides matching the defined structure
- [ ] PDF uses brand colors and typography (self-referential design)
- [ ] Cover slide has brand name, title, date
- [ ] Application mockups are present (slides 14-16)
- [ ] Do's/Don'ts slide is present with visual examples

### Phase 5 Validation
- [ ] `tokens.json` exists at `.seurat/brand/tokens.json`
- [ ] `tokens.json` is valid JSON matching the schema
- [ ] Color values in tokens.json match identity.json palette
- [ ] Typography in tokens.json matches identity.json typography
- [ ] If `.seurat/tokens.css` existed, it has been updated with brand values
- [ ] Spacing base value is defined

### Cross-Phase Validation
- [ ] Brand name is consistent across all files (brief, identity, tokens, PDFs)
- [ ] Color values are consistent across all files (no hex mismatches)
- [ ] Font selections are consistent across all files
- [ ] Logo SVGs use only colors from the defined palette
- [ ] No generic "AI slop" patterns: purple/blue gradients, Inter/Roboto, rounded cards with shadows

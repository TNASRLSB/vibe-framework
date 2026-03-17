# Design: `/seurat brandidentity`

**Date:** 2026-03-17
**Status:** Approved
**Scope:** New command inside the Seurat skill

---

## Summary

`/seurat brandidentity` analyzes the project codebase and produces a complete brand identity system: logo (generative SVG + written spec for figurative directions), comprehensive brand guidelines, and a professional proposal presentation (PDF). All output is in English.

---

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Standalone skill vs Seurat command | Seurat command | Brand identity is foundational to design systems; single entry point for all visual work |
| Command name | `/seurat brandidentity` | Unambiguous, distinguishes from generic "brand" |
| Logo generation approach | SVG generative (geometric/abstract) + written spec for figurative directions | SVG code can produce clean geometric marks; figurative/organic work requires external tools |
| Output language | English | User preference |
| PDF generation | Via Scribe (reportlab) | Existing skill handles PDF creation |
| Presentation style | Union of all reference styles | Combines Cariani/TerraViva minimalism, Virginia Tech corporate completeness, and agency polish |

---

## 1. Codebase Analysis & Brand Discovery

The command starts by scanning the project to extract brand signals:

- **Package/config files** — name, description, keywords, domain
- **README / docs** — mission, tagline, audience
- **Existing design tokens** — colors, fonts already in use (if Seurat was run before)
- **Tech stack** — framework, language, platform (informs brand personality)
- **Content/copy** — landing page text, meta descriptions (if Ghostwriter was used)

**Output:** A `brief.json` object containing: brand name, industry/domain, values, target audience, personality traits, competitive positioning.

**User gate:** The user reviews and can edit the brief before proceeding.

---

## 2. Brand Identity Generation

### 2.1 Brand Identikit

- Brand personality profile (Brand-Bios model)
- Archetypes (e.g., Mago/Scienziato)
- Brand Identity Ideals (Wheeler framework)
- Value proposition and messaging narrative
- Brand pillars (3 pillars, each with attribute + benefit)
- Brand voice and personality traits (with do's/don'ts)

### 2.2 Concept Development

2-3 concept directions, each with:

- Theme/metaphor rationale (e.g., TerraViva's cave paintings, Umbrahands' light/transformation)
- Moodboard description (colors, textures, visual references)
- Shape psychology analysis (Graphic Variables / Bertin's 7 variables)

### 2.3 Logo & Logotype

**Generative SVG (geometric/abstract):**

- Initials-based construction (e.g., T+V initials → stylized flower/arrow)
- Grid/geometric construction with visible rationale
- Positive/negative versions

**Logotype:**

- Font selection + customization spec (weight, tracking, modifications)
- Custom lettering direction (if applicable)

**Figurative/organic spec:**

- Detailed written specification for directions that require external design tools
- Includes concept description, shape references, style parameters

### 2.4 Variations

- Horizontal, vertical, icon-only layouts
- Positive/negative (light/dark backgrounds)
- Minimum size rules
- Clear space / exclusion zone
- Do's and don'ts

---

## 3. Brand Guidelines Document

### 3.1 Strategy

- Audiences (internal → external spectrum)
- Positioning (what/how/why)
- Messaging narrative + messaging map
- Brand platform

### 3.2 Visual Identity

- Logo usage rules, trademark notes
- Color system: primary palette, secondary palette, extended palette, color ratios, print/digital codes (HEX, RGB, CMYK, Pantone)
- Typography: primary + secondary fonts, hierarchy, usage rules, web/print pairings
- Design patterns: line work, textures, detail lines, structural elements
- Photography/imagery style guide
- Data visualization style
- Illustrations style

### 3.3 Brand Voice

- Writing tips, style guide
- Tone spectrum (formal ↔ casual, serious ↔ playful)
- Do's and don'ts with examples

### 3.4 Digital Brand

- Web and accessibility guidelines
- Social media guide (avatar, cover, post templates)

### 3.5 Brand Architecture

- Master brand, extensions, sub-brands, endorsed brands (if applicable)
- Lockup rules

### 3.6 Resources

- Business cards, letterhead, email signature specs
- Presentation template spec
- Creative brief template

---

## 4. Proposal Presentation (PDF)

Professional PDF presentation assembling the full brand identity. Self-referential design: the presentation uses the brand's own palette and typography.

### Slide Structure

| # | Slide | Content |
|---|-------|---------|
| 1 | Cover | Brand name, "Brand Identity Proposal", date |
| 2 | Brand Identikit | Personality profile, archetypes, values |
| 3 | Positioning | What/how/why, value proposition |
| 4-5 | Concept & Moodboard | Theme rationale, visual references, shape psychology |
| 6-7 | Pictogram Development | Construction grid, geometric rationale, evolution steps |
| 8 | Logo + Logotype | Final mark with logotype, clear space rules |
| 9 | Variations | Horizontal, vertical, icon-only, positive/negative |
| 10 | Typography | Primary + secondary fonts, hierarchy |
| 11 | Color Palette | All palettes with codes, color ratios, background adaptations |
| 12 | Brand Voice | Personality traits, tone, do's/don'ts |
| 13 | Brand Architecture | Master brand, extensions (if applicable) |
| 14-16 | Applications & Mockups | Business cards, letterhead, social media, website, signage |
| 17 | Do's and Don'ts | Logo usage rules |
| 18 | Next Steps | External spec for figurative directions |

Generated via Scribe (reportlab for PDF).

---

## 5. Technical Architecture

### 5.1 Command Interface

```
/seurat brandidentity          # Full flow: discovery → identity → guidelines → PDF
/seurat brandidentity --brief  # Only codebase analysis + brand brief
/seurat brandidentity --logo   # Skip to logo generation (assumes brief exists)
/seurat brandidentity --pdf    # Skip to PDF presentation (assumes identity exists)
```

### 5.2 Output Structure

```
.seurat/
├── brand/
│   ├── brief.json              # Brand brief from codebase analysis
│   ├── identity.json           # Full brand identity data
│   ├── logo/
│   │   ├── mark.svg            # Primary pictogram
│   │   ├── mark-negative.svg   # Negative version
│   │   ├── logotype.svg        # Logotype only
│   │   ├── logo-horizontal.svg # Combined horizontal
│   │   ├── logo-vertical.svg   # Combined vertical
│   │   ├── logo-icon.svg       # Icon-only (favicon, app icon)
│   │   └── construction.svg    # Grid/construction rationale
│   ├── guidelines/
│   │   └── brand-guidelines.pdf
│   └── proposal/
│       └── brand-proposal.pdf
```

### 5.3 Integration with Existing Seurat

- Brand tokens (colors, fonts) feed into Seurat's design system tokens automatically
- If `/seurat extract` was already run, those existing tokens inform the brand brief
- If `/seurat brandidentity` runs first, subsequent Seurat commands inherit the brand

### 5.4 Integration with Other Skills

| Skill | Role |
|-------|------|
| **Scribe** | PDF generation (reportlab) |
| **Ghostwriter** | Brand voice copy, messaging, taglines |
| **Emmet** | Validates SVG output, tests token consistency |

### 5.5 New Reference Files in Seurat

| File | Purpose |
|------|---------|
| `references/brandidentity.md` | Complete command guide, workflow, prompts |
| `references/logo-design.md` | Logo theory, SVG generation patterns, shape psychology, Henderson & Cote framework |
| `references/brand-guidelines.md` | Guidelines structure, content standards, examples |

---

## 6. Reference Material Synthesis

Knowledge distilled from the 11 analyzed reference documents:

### Professional Proposals (Structure)

- **Umbrahands (Cariani):** Brand identikit with personality radar, archetypes, concept rationale, pictogram from symbol fusion (infinity + star), positive/negative, mockups
- **TerraViva:** Abstract with cultural inspiration (cave paintings), initials-based pictogram (T+V → flower/arrow), custom logotype (Archivo variable font), color ratio system, 8 background adaptations, extensive applications
- **Pederiva Studio:** Pixel-based concept for web studio, geometric construction grid, B&W + CMYK versions, font spec (Montserrat), spacing rules with do's/don'ts, coordinated applications
- **Dowitcher/NoHo:** Agency proposal format with capabilities grid, design philosophy, sample projects, timeline, fees

### Academic Foundations (Theory)

- **Workshop 3 (OnCreate):** Brand-Bios model, Brand Identity Ideals (Wheeler), Graphic Variables (Bertin's 7: position, size, value, texture, color, orientation, shape), dynamic logo taxonomy (responsive, generative, data-driven, container, modular, wallpaper, message-based, personalised), shape psychology
- **Çelikkol (Cambridge):** Logo types (logotype, sans serif, single letter, multiple letter, unconventional), color psychology in logos, logo as neuromarketing tool
- **Borgenstål & Wehlén (Luleå):** Henderson & Cote framework — logo objectives (correct recognition, false recognition, affect, familiar meaning), design guidelines (natural, harmony, elaborate, parallel, repetition, proportion), logo selection process
- **Cash et al. (Design Studies):** Chain of evidence framework for design methods (motivation → nature → development → content → claims), method content properties (defined, predictable, useable, desirable)

### Brand Guidelines (Complete Example)

- **Virginia Tech (2019):** 94-page guidelines covering strategy (audiences, positioning, value proposition, brand pillars, messaging narrative, personality), brand voice (platform, writing tips, style guide), brand architecture (6 levels: master → primary → secondary → tertiary → sub-brands → individual → endorsed), trademarks, colors (primary + secondary + extended palettes, print usage), typography (Acherus Groteque, Crimson Text, Gineso), design patterns (patterns, line work, detail lines, text anchors, square dots, data viz, illustrations, structural elements), photos (style guide), digital brand (web, accessibility, social media), resources (business cards, presentations, envelopes, letterhead, email signature, creative brief)

### Logo Brief (Client Questionnaire)

- **Simpsons Creative:** Business info, brand personality adjectives, competitors, target market, design input (3 liked logos), logo type preferences, intended applications, budget

---

## 7. Open Questions

None — all design decisions have been made through the brainstorming process.

---

## 8. Success Criteria

1. `/seurat brandidentity` runs on any codebase and produces a valid brand brief
2. Generated SVG logos are valid, render correctly, and follow geometric construction principles
3. PDF proposal opens without errors, uses the brand's own palette/typography
4. Brand guidelines PDF covers all sections defined in Section 3
5. Generated tokens integrate seamlessly with existing Seurat design system
6. The command works incrementally (--brief, --logo, --pdf flags)

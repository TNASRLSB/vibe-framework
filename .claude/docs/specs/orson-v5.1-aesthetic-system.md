# Orson v5.1 — Aesthetic Intelligence System

**Status:** IMPLEMENTED
**Date:** 2026-02-14

---

## What

Six interconnected improvements that transform Orson's visual output from "competent" to "distinctive." The centerpiece is a massive Visual Recipes catalog — complete design systems that Claude applies holistically when writing video HTML. The five supporting features (color arcs, camera motion, kinetic typography, secondary animation, negative space) give Claude the vocabulary to execute each recipe convincingly.

All six features are **reference material + SKILL.md instructions** — they teach Claude how to write better HTML. Only two require minor runtime changes (camera motion properties, text-splitting JS helper).

---

## Feature 1: Visual Recipes (Expanded Catalog)

### What it is

A catalog of 20+ complete visual "identities" — not just color palettes, but holistic design systems specifying typography treatment, layout philosophy, animation energy, decorative choices, color relationships, and distinctive CSS techniques. Each recipe is self-contained: Claude reads it and can produce a video that looks unmistakably *that style*.

### Recipe catalog

| # | Recipe | Core DNA | Key CSS Techniques |
|---|--------|----------|-------------------|
| 1 | **Editorial** | Magazine luxury. Serif headlines, asymmetric grids, lavish whitespace | `mix-blend-mode:difference`, large serif `font-size:140px`, off-grid placement with `transform:rotate(-2deg)` |
| 2 | **Brutalist** | Raw aggression. Monospace everything, stark B&W, hard cuts, deliberately ugly | Monospace stack, `border:4px solid`, no border-radius, `text-transform:uppercase`, `letter-spacing:0.3em` |
| 3 | **Retro CRT** | 1980s terminal. Phosphor glow, scan lines, curved screen, amber/green on black | `text-shadow:0 0 10px` for glow, repeating-linear-gradient scanlines, pseudo-element screen curve, `font-family:monospace` |
| 4 | **Film Noir** | Dramatic shadow. High contrast B&W, venetian blind light, grain overlay, moody | Diagonal repeating-linear-gradient for blind shadows, heavy `filter:contrast(1.4)`, noir vignette, `mix-blend-mode:multiply` |
| 5 | **Vaporwave** | Retro-futuristic nostalgia. Pink/cyan/purple, roman column motifs, Japanese text accents | Grid perspective with `transform:perspective(500px) rotateX(60deg)`, gradient text `-webkit-background-clip:text`, sunset gradients |
| 6 | **Swiss / International** | Information design. Strict grid, Helvetica-style, red/black/white, mathematical precision | `display:grid` with strict tracks, `font-weight:900`, red accent only, generous `line-height:1.2`, asymmetric but gridded |
| 7 | **Cyberpunk** | Neon on darkness. Electric outlines, holographic sheen, glitch fragments, data streams | `box-shadow:0 0 20px` neon, `backdrop-filter:blur(2px)`, pseudo-element scan lines, HUD-style frame borders |
| 8 | **Organic / Botanical** | Earth and growth. Warm naturals, flowing curves, watercolor washes, leaf patterns | `border-radius:40% 60%` blob shapes, earthy `hsl(30-60)` palette, `clip-path:polygon()` organic masks, grain texture |
| 9 | **Paper Cutout** | Tactile depth. Layered shadows, torn edges, paper texture, craft aesthetic | Multi-layer `box-shadow` (0 2px, 0 4px, 0 8px), `clip-path` for torn edges, off-white `#f5f0eb` backgrounds, subtle rotation |
| 10 | **Art Deco** | Gatsby elegance. Gold on dark, geometric patterns, symmetry, ornamental lines | Gold `#d4af37` on `#1a1a2e`, `border-image` for decorative borders, symmetric `display:flex` centering, fan/sunburst gradients |
| 11 | **Glitch Art** | Digital corruption. Color channel splits, data moshing effect, pixel sorting, broken beauty | Pseudo-elements with `transform:translate(2px,-2px)` + `mix-blend-mode:screen` for RGB split, `clip-path:inset()` slicing |
| 12 | **Isometric Tech** | 3D without 3D. Isometric grid, floating platforms, tech/gaming energy | `transform:rotateX(55deg) rotateZ(-45deg)` for iso projection, layered pseudo-elements for depth, `box-shadow` for elevation |
| 13 | **Kinetic Minimalism** | Less but louder. One element moving beautifully in vast space. Reduction as statement | Single centered element, `font-size:200px+`, extreme `padding:200px`, one animation with long duration and spring easing |
| 14 | **Neon Noir** | Dark city aesthetics. Wet street reflections, neon bleed, moody atmosphere | `text-shadow` triple-layer neon, `box-reflect` (webkit) for reflections, `background:linear-gradient(transparent 50%,rgba(accent,0.1))` for wet floor |
| 15 | **Data Viz Art** | Information as beauty. Matrix-style data streams, coordinate grids, chart aesthetics as decoration | Grid overlay, monospace numbers as decoration, `counter()` CSS, animated bar widths, sparkline SVG inline |
| 16 | **Collage / Mixed Media** | Scrapbook energy. Overlapping layers, varied textures, rotated elements, organized chaos | Random `transform:rotate()` (-5 to 5deg), overlapping `position:absolute` with varied `z-index`, `mix-blend-mode:multiply` borders |
| 17 | **Bauhaus** | Form follows function. Primary colors (red/blue/yellow + B&W), geometric shapes, functional beauty | Circle/square/triangle via `clip-path` and `border-radius`, primary only `hsl(0,100%,50%)`, `font-weight:900` geometric sans |
| 18 | **Liquid / Fluid** | Everything flows. Morphing blobs, gradient animation, organic movement, no straight lines | `border-radius:30% 70% 70% 30% / 30% 30% 70% 70%` blobs, CSS `@keyframes` morphing border-radius, multi-stop gradients |
| 19 | **Blueprint / Technical** | Engineering precision. White lines on blue, dimension markers, annotation style, drafting feel | `#1e3a5f` background, white `1px` borders, dashed lines `border-style:dashed`, `font-family:monospace`, dimension arrow pseudo-elements |
| 20 | **Polaroid / Instant Film** | Nostalgic photography. White borders, slight tilt, warm color cast, dated feel | `padding:16px 16px 48px 16px` (thick bottom), `filter:sepia(0.1) saturate(1.2)`, `transform:rotate(-2deg)`, `box-shadow` depth |
| 21 | **Holographic** | Iridescent future. Rainbow gradient shifts, chrome reflections, prismatic color | `background:linear-gradient(135deg, multiple hsl stops)` + animation, `mix-blend-mode:color-dodge`, `backdrop-filter:hue-rotate()` |
| 22 | **Newspaper / Broadsheet** | Old media authority. Column layout, serif headlines, pull quotes, dateline, ink feel | `column-count:2/3`, `font-family:serif`, pull-quote with large `font-size:36px` + `border-left:4px solid`, newsprint `#f8f5e6` bg |
| 23 | **Acid Graphic** | Warped reality. Extreme distortion, acid colors (lime/magenta/yellow), psychedelic energy | `transform:skew()` on text, clashing `hsl` combos, `filter:hue-rotate()` animation, stretched type `transform:scaleX(1.5)`, wavy text via word-level rotation |
| 24 | **Stencil / Street Art** | Urban rawness. Spray paint texture, stencil cuts, concrete backgrounds, DIY energy | Rough clip-paths, `text-shadow` for spray bleed, `background-color:rgba(0,0,0,0.85)` stencil blocks, `font-weight:900` + `letter-spacing:0.2em` |

### Recipe specification format

Each recipe in the reference file includes:
- **Identity** — 1-sentence description of the aesthetic DNA
- **Palette** — Specific CSS colors (background, text, accent, dim)
- **Typography** — Font stack, sizes, weights, letter-spacing, line-height for heading/body/accent
- **Layout rules** — Padding, alignment, grid strategy, element density
- **Animation energy** — Which entrance/exit/emphasis/looping animations fit this recipe
- **Decoratives** — Which decorative types work (orbs? grids? grain? none?)
- **Camera** — Recommended camera motion (static? slow drift? push in?)
- **Signature CSS** — The 3-5 CSS techniques that make this recipe recognizable
- **Don'ts** — What breaks the illusion (e.g., "never use border-radius in Brutalist")

### Deliverable

Create `references/visual-recipes.md` (~2000 words) with all 24 recipes.

---

## Feature 2: Color Storytelling

### What it is

Per-scene chromatic arcs — the color temperature, saturation, and brightness evolve across the video to create emotional narrative. Not random palettes per scene, but intentional color journeys.

### Arc types

| Arc | Description | Scene progression |
|-----|-------------|-------------------|
| **Cold → Warm** | Problem is cold, solution is warm | Scene 1-2: blue-grey tones → Scene 3+: warm amber/gold |
| **Dark → Bright** | Tension release | Scene 1-2: dark bg, low contrast → Scene 5+: bright bg, high contrast |
| **Mono → Chromatic** | Reveal | Scene 1-3: single hue desaturated → Scene 4+: full palette, vibrant |
| **Complementary Shift** | Energy build | Alternating complementary pairs, increasing saturation |
| **Brand Crescendo** | Brand reveal | Neutral tones → gradually introduce brand colors → final scene is full brand |

### How Claude uses it

In Phase 3, when writing HTML, Claude:
1. Chooses an arc type based on video intent (problem/solution → Cold→Warm, reveal → Mono→Chromatic)
2. Sets CSS custom properties per scene that shift according to the arc
3. Background, text, and accent colors all follow the arc progression

### Deliverable

Add a "Color Storytelling" section to `references/visual-recipes.md` with arc definitions and per-scene CSS custom property patterns.

---

## Feature 3: Camera Motion Simulation

### What it is

Slow, subtle transforms on a scene content wrapper that simulate camera movement — dolly, pan, push-in, pull-out, drift. The camera never cuts; it breathes.

### Camera moves

| Move | CSS transform | Typical duration |
|------|--------------|-----------------|
| **Slow push-in** | `scale(1)` → `scale(1.06)` | Full scene duration |
| **Slow pull-out** | `scale(1.06)` → `scale(1)` | Full scene duration |
| **Pan left** | `translateX(0)` → `translateX(-30px)` | Full scene duration |
| **Pan right** | `translateX(0)` → `translateX(30px)` | Full scene duration |
| **Drift** | Combined slow x/y/scale micro-motion | Full scene, ease:inOutSine |
| **Dolly up** | `translateY(0)` → `translateY(-20px)` + slight scale up | Full scene |
| **Settle** | `scale(1.03)` → `scale(1)` + `y(5)` → `y(0)` | First 1/3 of scene |
| **Breathe** | Scale oscillation 1 → 1.015 → 1 | Full scene, looping |

### Implementation

1. Claude wraps scene content in `<div class="cam" data-el="sN-cam">...</div>` inside each scene
2. The `data-el` attribute makes it animatable by the existing runtime
3. Claude adds A() calls for the camera element: `A('[data-el="s0-cam"]', 'scale', 0, totalFrames, 1, 1.06, 'inOutSine')`
4. The wrapper has `overflow:hidden` to prevent edge reveal during pan

**No runtime changes needed** — the existing runtime already supports x, y, scale on any element.

### Deliverable

Add a "Camera Motion" section to `references/visual-recipes.md` with wrapper pattern and recommended moves per recipe.

---

## Feature 4: Kinetic Typography

### What it is

Text that moves as individual words or characters rather than as a block. Word-by-word reveals, character cascades, emphasis on specific words through animation.

### Techniques

| Technique | Description | HTML pattern |
|-----------|-------------|-------------|
| **Word-by-word reveal** | Words fade/slide in sequentially | `<span class="w" data-el="sN-wM">word</span>` per word |
| **Char cascade** | Characters appear one by one | `<span class="ch" data-el="sN-cM">X</span>` per char |
| **Impact word** | One word is dramatically different (larger, colored, delayed) | Single word in separate `<span>` with different animation |
| **Stagger slide** | Words slide in from alternating directions | Even words from left, odd from right |
| **Scale word** | Each word scales from 3x → 1x with blur | Word spans with scale + blur A() calls |
| **Typewriter** | Characters appear left-to-right with cursor | `clip-path:inset(0 100% 0 0)` → `inset(0 0% 0 0)` per word |

### Helper JS

Add a `splitText()` inline helper function that Claude can include in the HTML script:

```javascript
function S(el, mode) {
  // mode: 'w' = word, 'c' = char
  var text = el.textContent;
  var parts = mode === 'w' ? text.split(/\s+/) : text.split('');
  var id = el.getAttribute('data-el');
  el.innerHTML = parts.map(function(p, i) {
    return '<span data-el="' + id + '-' + mode + i + '" style="display:inline-block">' +
      (mode === 'w' && i > 0 ? '&nbsp;' : '') + p + '</span>';
  }).join('');
}
```

This avoids Claude having to manually write 50+ spans for a sentence. Claude just writes `S(document.querySelector('[data-el="s0-e0"]'), 'w')` and then references `s0-e0-w0`, `s0-e0-w1`, etc. in A() calls.

### Deliverable

- Add `splitText` helper to `runtime.ts` (exported as part of the runtime string)
- Add a "Kinetic Typography" section to `references/visual-recipes.md` with patterns and stagger timing recommendations

---

## Feature 5: Secondary Animation Layer

### What it is

Continuous background motion that runs throughout a scene — floating particles, orbiting shapes, pulsing glows, breathing backgrounds. Creates visual richness without competing with content.

### Approach

Use **CSS @keyframes** for continuous motion (independent of `__setFrame`). This already works — decoratives use CSS animations (deco-scan, deco-grad-shift, deco-aurora-drift). Expand the vocabulary:

| Animation | CSS technique | Duration |
|-----------|--------------|----------|
| **Float drift** | `translateY` oscillation on decorative elements | 4-8s |
| **Orbit** | `rotate(360deg)` + `translateX` on decorative ring/dot | 10-20s |
| **Pulse glow** | `opacity` + `scale` oscillation on glow element | 3-5s |
| **Gradient shift** | `background-position` or `hue-rotate` on gradient | 6-12s |
| **Particle float** | Individual `translateY` + `translateX` on dot elements | 5-10s per dot |
| **Scan sweep** | `translateX(-100%)` → `translateX(100%)` on highlight bar | 4-6s |
| **Shimmer** | `background-position` on linear-gradient overlay | 3-5s |
| **Breathing border** | `border-color` opacity oscillation | 4-6s |

### Implementation

These are **CSS patterns documented in the reference file** — Claude writes them directly in the `<style>` block. No engine changes needed. The key insight: CSS @keyframes animations run independently of `__setFrame`, providing continuous motion "for free."

### Deliverable

Add a "Secondary Animation" section to `references/visual-recipes.md` with CSS @keyframes patterns and per-recipe recommendations.

---

## Feature 6: Negative Space Intelligence

### What it is

Rules for frame occupancy — how much of the viewport should be filled vs. empty. Most AI-generated videos cram too much content into every frame. Strategic emptiness creates focus and premium feel.

### Rules

| Scene type | Target fill | Max elements | Padding strategy |
|-----------|-------------|-------------|-----------------|
| Hook/Hero | 25-35% | 1-2 | Extreme padding (200px+), content centered |
| Problem | 30-45% | 2-3 | Generous padding, content slightly off-center |
| Solution | 35-50% | 2-4 | Balanced padding, clear visual hierarchy |
| Feature | 40-55% | 3-5 | Moderate padding, grid or cards |
| Data/Stats | 45-60% | 3-6 | Moderate padding, structured grid |
| CTA | 20-30% | 1-2 | Extreme padding, centered, maximum breathing room |

### Additional rules

- **Never fill more than 60%** of the viewport in any scene
- **Headlines need air** — minimum 80px clear space above and below
- **Cards need gutters** — minimum 32px between cards
- **9:16 format**: Reduce element count by 30% vs 16:9 — vertical formats need MORE negative space per element
- **One focal point per scene** — if there are 5 elements, one dominates visually (2x+ size)

### Deliverable

Add a "Negative Space" section to `references/visual-recipes.md` with occupancy rules and format-specific adjustments.

---

## Implementation Plan

### File changes

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `references/visual-recipes.md` | **CREATE** | The master reference file: 24 visual recipes + color arcs + camera motion + kinetic typography + secondary animation + negative space rules (~3000 words) |
| 2 | `engine/src/runtime.ts` | **EDIT** | Add `S(el, mode)` text-splitting helper to the runtime string (~10 lines) |
| 3 | `SKILL.md` | **EDIT** | In Phase 3, add instructions for Claude to read `visual-recipes.md`, pick a recipe, apply color arc, use camera motion. Add `S()` helper to available tools. (~15 lines added) |
| 4 | `KNOWLEDGE.md` | **EDIT** | Add visual-recipes.md to Reference Files section |
| 5 | `references/components.md` | **EDIT** | Add camera wrapper pattern to existing component patterns (~10 lines) |

### Implementation order

1. **`references/visual-recipes.md`** — The centerpiece. All 24 recipes with full specifications. Color arcs, camera motion, kinetic typography, secondary animation, negative space — all in one file as sections.
2. **`engine/src/runtime.ts`** — Add `S()` helper.
3. **`SKILL.md`** — Update Phase 3 instructions to reference the creative system.
4. **`references/components.md`** — Add camera wrapper pattern.
5. **`KNOWLEDGE.md`** — Update references section.

### What does NOT change

- **No new engine source files** — everything is reference material + minor runtime addition
- **No changes to capture, encode, parallel-render, timing** — the rendering pipeline stays identical
- **No changes to html-parser.ts** — the `@video`/`@scene` comment format stays identical
- **No changes to actions.ts** — the animation catalog stays identical (recipes reference existing animations by name)
- **No changes to decorative.ts** — recipes reference decorative patterns by description, Claude writes them directly

### Verification

After implementation:
1. Read `visual-recipes.md` and verify each recipe has all required fields (identity, palette, typography, layout, animation, decoratives, camera, signature CSS, don'ts)
2. Read `runtime.ts` and verify `S()` helper is included in the runtime string
3. Read `SKILL.md` Phase 3 and verify it references visual-recipes.md with clear instructions
4. Create a test video using one non-obvious recipe (e.g., Brutalist or Film Noir) to verify the creative system works end-to-end

---

## Budget

- `visual-recipes.md`: ~3000 words (24 recipes + 5 system sections)
- `runtime.ts` change: +10 lines
- `SKILL.md` change: +15 lines
- `components.md` change: +10 lines
- `KNOWLEDGE.md` change: +2 lines
- Total net new: ~3100 words of reference material, ~15 lines of code

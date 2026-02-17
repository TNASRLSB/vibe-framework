# Visual Recipes & Aesthetic Systems

Reference catalog for video aesthetics. Claude reads this during Phase 3 to choose a visual identity and apply it consistently across all scenes.

---

## How to Use

1. **Pick a recipe** based on brand tone, intent, and audience
2. **Apply holistically** — palette, typography, layout, animation, decoratives, camera all come from the recipe
3. **Layer a color arc** to create emotional progression across scenes
4. **Add camera motion** for cinematic depth
5. **Use kinetic typography** for emphasis moments (1-2 per video, not every scene)
6. **Add secondary animation** for ambient richness
7. **Respect negative space rules** — never fill more than 60% of the viewport

---

## Visual Recipes

Each recipe defines: identity, palette (CSS), typography, layout, animation energy, decoratives, camera, signature CSS, and don'ts.

---

### 1. Editorial

**Identity:** Magazine luxury. Asymmetric grids, lavish whitespace, quiet confidence.

**Palette:** `--bg:#f8f6f2; --text:#1a1a1a; --accent:#c8102e; --dim:#6b6b6b;`

**Typography:** Serif headlines (`Georgia,serif`), 140px, weight 400, `letter-spacing:-0.02em`. Body: sans-serif 20px, `line-height:1.7`.

**Layout:** Off-grid placement with `transform:rotate(-2deg)` on accent elements. Asymmetric 60/40 splits. Extreme padding (160px+).

**Animation energy:** Slow, deliberate. `outSine` / `inOutCubic` easings. 40-60 frame durations. Minimal entrance motion — fade + slight y(20).

**Decoratives:** Thin rules only (`border-top:1px solid`). No orbs, no gradients, no grain.

**Camera:** Slow push-in (`scale 1→1.04`). Never pan.

**Signature CSS:** `mix-blend-mode:difference` on headlines, oversized serif `font-size:140px`, off-grid rotation, thick padding.

**Don'ts:** No rounded corners over 4px. No glassmorphism. No bright gradients. No fast animations.

---

### 2. Brutalist

**Identity:** Raw aggression. Stark B&W, hard cuts, deliberately ugly.

**Palette:** `--bg:#ffffff; --text:#000000; --accent:#ff0000; --dim:#666666;`

**Typography:** Monospace everything (`'Courier New',monospace`). Headlines: `text-transform:uppercase; letter-spacing:0.3em; font-weight:900`. Body: 16px monospace.

**Layout:** Full-width blocks. No padding elegance — tight 24px margins. `border:4px solid #000`.

**Animation energy:** Hard cuts (0-frame transitions). `snap` easing. Instant opacity switches. No smooth crossfades.

**Decoratives:** None. Raw HTML structure IS the decoration.

**Camera:** Static. Absolutely no camera motion.

**Signature CSS:** `border:4px solid`, no `border-radius` anywhere, `text-transform:uppercase`, `letter-spacing:0.3em`, monospace stack.

**Don'ts:** Never use border-radius. Never use gradients. Never use blur. Never use smooth easings.

---

### 3. Retro CRT

**Identity:** 1980s terminal. Phosphor glow, scan lines, amber/green on black.

**Palette:** `--bg:#0a0a0a; --text:#33ff33; --accent:#ffaa00; --dim:#1a6b1a;`

**Typography:** Monospace (`'Courier New',monospace`). Headlines 48px, body 18px. `text-shadow:0 0 10px currentColor` for phosphor glow.

**Layout:** Left-aligned, terminal-style. 80-column feel. `padding:60px 120px`.

**Animation energy:** Typewriter reveals (`clipRight` animation). Flicker effects via rapid opacity oscillation. `linear` easing for machine feel.

**Decoratives:** Scan lines via `repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`. Screen curve via pseudo-element `border-radius:50%/10%`.

**Camera:** Static or very slow `breathe` (scale 1→1.01→1).

**Signature CSS:** `text-shadow:0 0 10px` glow, scan line overlay, monospace everything, green/amber on black.

**Don'ts:** No sans-serif fonts. No bright white backgrounds. No modern UI elements (cards, pills, gradients).

---

### 4. Film Noir

**Identity:** Dramatic shadow. High contrast B&W, venetian blind light, moody atmosphere.

**Palette:** `--bg:#0d0d0d; --text:#e8e8e8; --accent:#ffffff; --dim:#555555;`

**Typography:** Serif headlines (`Georgia,serif`), 80px, italic. Body: sans-serif 18px, `color:#999`.

**Layout:** Centered, dramatic. Single focal point per scene. Heavy vignette.

**Animation energy:** Slow fades (60+ frames). `inOutCubic` easing. Minimal movement — let light and shadow do the work.

**Decoratives:** Diagonal repeating-linear-gradient for venetian blind shadows. Grain overlay (`filter:url(#grain)` or CSS noise). Heavy vignette.

**Camera:** Slow push-in or pull-out. Never pan.

**Signature CSS:** `filter:contrast(1.4)`, diagonal blind shadows via `repeating-linear-gradient(135deg,transparent,transparent 20px,rgba(0,0,0,0.4) 20px,rgba(0,0,0,0.4) 22px)`, `mix-blend-mode:multiply`, vignette.

**Don'ts:** No color (except very desaturated accent if needed). No playful animations. No rounded corners.

---

### 5. Vaporwave

**Identity:** Retro-futuristic nostalgia. Pink/cyan/purple, sunset grids, dreamlike.

**Palette:** `--bg:#1a0a2e; --text:#ff71ce; --accent:#01cdfe; --dim:#b967ff;`

**Typography:** Sans-serif bold headlines, 72px. Gradient text via `-webkit-background-clip:text`. Occasional Japanese characters as accent.

**Layout:** Centered, symmetrical. Horizon-line compositions with perspective grid floor.

**Animation energy:** Medium-slow. Floating, drifting. `outSine` easing. Looping gradient shifts.

**Decoratives:** Perspective grid floor (`transform:perspective(500px) rotateX(60deg)` on grid element). Sunset gradient backgrounds. Glow orbs.

**Camera:** Slow drift (combined x/y micro-motion).

**Signature CSS:** Grid perspective, gradient text `-webkit-background-clip:text`, sunset `linear-gradient(to bottom,#ff71ce,#b967ff,#01cdfe)`, `text-shadow:0 0 40px`.

**Don'ts:** No corporate layouts. No straight grids. No monochrome.

---

### 6. Swiss / International

**Identity:** Information design. Mathematical precision, Helvetica-style, red/black/white.

**Palette:** `--bg:#ffffff; --text:#000000; --accent:#ff0000; --dim:#777777;`

**Typography:** Geometric sans (`'Helvetica Neue',Arial,sans-serif`). Headlines: `font-weight:900; font-size:96px; line-height:1`. Body: weight 400, 18px, `line-height:1.5`.

**Layout:** Strict `display:grid` with defined tracks. Asymmetric but gridded. Generous whitespace. Red accent sparingly.

**Animation energy:** Clean, precise. `outQuad` easing. Slide from grid-aligned positions. 30-frame durations.

**Decoratives:** None. Grid itself is the decoration.

**Camera:** Static or very subtle push-in.

**Signature CSS:** `display:grid` strict tracks, `font-weight:900`, red accent only on small elements, `line-height:1` on headlines.

**Don'ts:** No curves. No blur effects. No decorative orbs. No more than 3 colors total.

---

### 7. Cyberpunk

**Identity:** Neon on darkness. Electric outlines, holographic sheen, data streams.

**Palette:** `--bg:#0a0a12; --text:#e0e0ff; --accent:#00ffcc; --dim:#333366;`

**Typography:** Condensed sans-serif, uppercase. Headlines: 64px, `letter-spacing:0.15em`, `font-weight:700`. Body: monospace 16px.

**Layout:** HUD-inspired frames. Corner decorations. `border:1px solid rgba(0,255,204,0.3)`.

**Animation energy:** Sharp and electric. `outExpo` / `snap` easings. Glitch-style rapid x-offset (2-3px). Scan line sweeps.

**Decoratives:** Neon glow via `box-shadow:0 0 20px rgba(0,255,204,0.5)`. `backdrop-filter:blur(2px)`. HUD corner marks. Scan line pseudo-elements.

**Camera:** Static or slow pan.

**Signature CSS:** Neon `box-shadow` glow, HUD-style borders, `backdrop-filter:blur`, scan lines, monospace secondary text.

**Don'ts:** No warm colors. No serif fonts. No rounded soft shapes. No organic elements.

---

### 8. Organic / Botanical

**Identity:** Earth and growth. Warm naturals, flowing curves, tactile textures.

**Palette:** `--bg:#f5f0e8; --text:#2d2b28; --accent:#4a7c59; --dim:#8b8578;`

**Typography:** Rounded sans-serif or humanist serif. Headlines: 72px, weight 400. Body: 18px, `line-height:1.8`.

**Layout:** Flowing compositions. Blob shapes for containers (`border-radius:40% 60% 70% 30% / 30% 30% 70% 70%`). Generous organic padding.

**Animation energy:** Gentle, breathing. `outSine` / `inOutQuad` easings. 50+ frame durations. Floating motion.

**Decoratives:** Blob shapes, `clip-path:polygon()` organic masks, grain texture overlay, earthy color washes.

**Camera:** Slow drift or breathe.

**Signature CSS:** Blob `border-radius`, earthy `hsl(30-60)` palette, grain overlay, organic `clip-path`, flowing curves.

**Don'ts:** No sharp corners. No monospace. No neon colors. No rigid grids.

---

### 9. Paper Cutout

**Identity:** Tactile depth. Layered shadows, torn edges, craft aesthetic.

**Palette:** `--bg:#f5f0eb; --text:#2a2a2a; --accent:#e85d3a; --dim:#8a8480;`

**Typography:** Hand-drawn feel or rounded sans. Headlines 64px, body 18px. Slightly imperfect alignment.

**Layout:** Overlapping layers with multi-depth shadows. Slight random rotations (-2 to 2deg). Stacked paper feel.

**Animation energy:** Playful bounces. `outBack` / `outBounce` easings. Elements slide in with overshoot. 25-40 frame durations.

**Decoratives:** Multi-layer `box-shadow` (0 2px 0 #ddd, 0 4px 0 #ccc, 0 8px 15px rgba(0,0,0,0.1)). Torn edges via `clip-path`. Off-white backgrounds.

**Camera:** Settle (scale 1.03→1 in first third).

**Signature CSS:** Stacked `box-shadow` for paper depth, `clip-path` torn edges, slight rotation, off-white `#f5f0eb` bg.

**Don'ts:** No dark backgrounds. No neon. No precise alignment — imperfection is the point.

---

### 10. Art Deco

**Identity:** Gatsby elegance. Gold on dark, geometric patterns, ornamental symmetry.

**Palette:** `--bg:#1a1a2e; --text:#f0e6d2; --accent:#d4af37; --dim:#6b6577;`

**Typography:** Geometric sans or display serif. Headlines: `font-weight:300; font-size:80px; letter-spacing:0.15em; text-transform:uppercase`. Body: 18px, weight 300.

**Layout:** Symmetrical, centered. Ornamental dividers. `border-image` for decorative borders.

**Animation energy:** Elegant reveals. `outQuart` easing. Clip-path reveals (curtain open). 40-50 frame durations.

**Decoratives:** Sunburst/fan gradients. Gold line dividers. Corner ornaments via pseudo-elements.

**Camera:** Slow push-in.

**Signature CSS:** Gold `#d4af37` on `#1a1a2e`, sunburst `conic-gradient`, `letter-spacing:0.15em` uppercase, symmetric flex centering, ornamental borders.

**Don'ts:** No asymmetry. No playful bounces. No casual typography.

---

### 11. Glitch Art

**Identity:** Digital corruption. Color channel splits, broken beauty.

**Palette:** `--bg:#0a0a0a; --text:#ffffff; --accent:#ff0040; --dim:#00ff88;`

**Typography:** Sans-serif bold or monospace. Headlines 72px. RGB split effect via pseudo-elements.

**Layout:** Standard centered, but with glitch displacement on key elements.

**Animation energy:** Aggressive. `snap` easing. Rapid x/y offsets (2-5px jumps). Flicker via opacity. Short 5-10 frame bursts.

**Decoratives:** RGB split: pseudo-elements with `transform:translate(3px,-2px)` + `mix-blend-mode:screen` + cyan/red tinting. `clip-path:inset()` slicing for data-mosh bands.

**Camera:** Static with occasional 2px jitter.

**Signature CSS:** Pseudo-element RGB split (`::before` cyan offset, `::after` red offset), `mix-blend-mode:screen`, `clip-path:inset()` glitch bands.

**Don'ts:** No smooth transitions. No soft colors. No elegance — this is deliberately broken.

---

### 12. Isometric Tech

**Identity:** 3D without 3D. Isometric projection, floating platforms, tech energy.

**Palette:** `--bg:#1a1b2e; --text:#e8eaff; --accent:#6366f1; --dim:#4a4d7a;`

**Typography:** Geometric sans. Headlines 64px, `font-weight:700`. Body 16px. Clean and technical.

**Layout:** Isometric grid with `transform:rotateX(55deg) rotateZ(-45deg)` on platform elements. Layered depth via pseudo-elements and `box-shadow`.

**Animation energy:** Precise. `outCubic` easing. Elements rise from below with scale. 30-40 frame durations.

**Decoratives:** Isometric grid lines. Floating platform shadows. Layered pseudo-elements for 3D depth.

**Camera:** Slow dolly up.

**Signature CSS:** `transform:rotateX(55deg) rotateZ(-45deg)`, layered pseudo-elements for depth faces, `box-shadow` for elevation.

**Don'ts:** No organic curves. No serif fonts. No 2D-only layouts (commit to the isometric projection).

---

### 13. Kinetic Minimalism

**Identity:** Less but louder. One element moving beautifully in vast space.

**Palette:** `--bg:#fafafa; --text:#111111; --accent:#000000; --dim:#888888;` (or inverted: white on black)

**Typography:** One font only. Headlines: 200px+, `font-weight:300` or `900`. No body text — just the headline.

**Layout:** Single centered element. Extreme `padding:200px`. Vast emptiness is the design.

**Animation energy:** One slow, beautiful animation. `outBack` or spring easing. 60-90 frame durations. The motion IS the content.

**Decoratives:** None. Zero.

**Camera:** Static. The element movement is the only motion.

**Signature CSS:** `font-size:200px+`, extreme padding, single element, one animation.

**Don'ts:** Never add a second element. Never add decoration. Never use fast animations.

---

### 14. Neon Noir

**Identity:** Dark city. Wet street reflections, neon bleed, moody atmosphere.

**Palette:** `--bg:#0a0a0f; --text:#d8d8e8; --accent:#ff2d55; --dim:#2a2a3f;`

**Typography:** Sans-serif. Headlines 72px with triple-layer neon `text-shadow`. Body 18px, low contrast.

**Layout:** Centered or bottom-weighted (city skyline feel). Large negative space above.

**Animation energy:** Slow, atmospheric. `outSine` easing. Glow pulse loops. Fade-heavy reveals.

**Decoratives:** Triple-layer neon `text-shadow` (color, spread, ultra-spread). Reflection via `-webkit-box-reflect:below`. Wet floor gradient `linear-gradient(transparent 50%,rgba(accent,0.1))`.

**Camera:** Slow drift.

**Signature CSS:** Triple `text-shadow` neon (e.g., `0 0 10px #ff2d55, 0 0 40px #ff2d55, 0 0 80px #ff2d55`), wet-floor gradient, `-webkit-box-reflect`.

**Don'ts:** No bright backgrounds. No daylight colors. No sharp edges.

---

### 15. Data Viz Art

**Identity:** Information as beauty. Matrix-style data, coordinate grids, chart aesthetics.

**Palette:** `--bg:#0d1117; --text:#c9d1d9; --accent:#58a6ff; --dim:#484f58;`

**Typography:** Monospace everything. Headlines 48px. Data numbers as decorative elements.

**Layout:** Grid-based with coordinate markers. Chart-like compositions. Numbers and data scattered decoratively.

**Animation energy:** Precise, machine-like. `linear` or `outQuad` easings. Bar widths and counters animate. 30-frame durations.

**Decoratives:** Grid coordinate overlay. Monospace numbers as ambient decoration. Inline SVG sparklines. Animated bar charts.

**Camera:** Static.

**Signature CSS:** Grid overlay, monospace ambient numbers, animated `width` on bar elements, `counter()` CSS, inline SVG sparkline.

**Don'ts:** No serif fonts. No organic shapes. No emotional colors.

---

### 16. Collage / Mixed Media

**Identity:** Scrapbook energy. Overlapping layers, varied textures, organized chaos.

**Palette:** `--bg:#ebe6df; --text:#1a1a1a; --accent:#e63946; --dim:#6d6a65;`

**Typography:** Mixed — serif headlines, handwritten accents, sans-serif body. Varied sizes.

**Layout:** Overlapping `position:absolute` with varied `z-index`. Random `transform:rotate(-5deg to 5deg)`. Layered.

**Animation energy:** Playful, varied. Different easings per element. `outBack` for key elements, `outCubic` for others. Staggered entrance (100ms per element).

**Decoratives:** `mix-blend-mode:multiply` on borders/overlays. Paper textures. Tape/pin decorative elements via pseudo-elements.

**Camera:** Settle or static.

**Signature CSS:** Random `rotate()`, overlapping absolute positioning, varied `z-index`, `mix-blend-mode:multiply`, mixed font families.

**Don'ts:** No precise alignment. No single font. No minimal aesthetic.

---

### 17. Bauhaus

**Identity:** Form follows function. Primary colors, geometric shapes, functional beauty.

**Palette:** `--bg:#f2f0e6; --text:#1a1a1a; --accent:#dd0000; --dim:#555555;` plus `--blue:#0047ab; --yellow:#ffc300;`

**Typography:** Geometric sans (`'Futura',sans-serif` or similar). Headlines: `font-weight:900`, 72px. Body: weight 400, 18px.

**Layout:** Asymmetric balance. Large geometric shapes (circle, square, triangle) as structural elements. Grid-based but playful.

**Animation energy:** Clean, geometric. `outQuad` easing. Shapes slide/scale in from geometric origins. 30-frame durations.

**Decoratives:** Circle (`border-radius:50%`), square, triangle (`clip-path:polygon(50% 0%, 0% 100%, 100% 100%)`) as structural and decorative elements. Primary colors only.

**Camera:** Static.

**Signature CSS:** `clip-path:polygon()` triangles, `border-radius:50%` circles, primary-only color restriction, `font-weight:900` geometric sans.

**Don'ts:** No gradients. No curves beyond perfect circles. No more than red+blue+yellow+B&W.

---

### 18. Liquid / Fluid

**Identity:** Everything flows. Morphing blobs, gradient animation, organic movement.

**Palette:** `--bg:#0f0a1a; --text:#ffffff; --accent:#a855f7; --dim:#6b21a8;`

**Typography:** Rounded sans-serif. Headlines 72px, weight 600. Soft, flowing letterforms.

**Layout:** Centered, with blob-shaped containers. No straight edges anywhere.

**Animation energy:** Flowing, continuous. `inOutSine` easing. Morphing `border-radius` via CSS `@keyframes`. 60+ frame durations.

**Decoratives:** `border-radius:30% 70% 70% 30% / 30% 30% 70% 70%` blobs with CSS `@keyframes` morphing. Multi-stop gradient backgrounds. Color-shifting orbs.

**Camera:** Slow drift or breathe.

**Signature CSS:** Morphing `border-radius` animation, multi-stop gradients, no straight lines, flowing `border-radius` on everything.

**Don'ts:** No straight edges. No sharp corners. No monospace. No rigid grids.

---

### 19. Blueprint / Technical

**Identity:** Engineering precision. White on blue, dimension markers, drafting feel.

**Palette:** `--bg:#1e3a5f; --text:#ffffff; --accent:#6db6ff; --dim:#3a6b9f;`

**Typography:** Monospace (`monospace`). Headlines 48px, body 16px. All caps optional for labels.

**Layout:** Technical drawing style. Dashed `border-style:dashed` lines. Dimension arrows via pseudo-elements. Grid coordinates.

**Animation energy:** Precise, mechanical. `linear` easing for drawing animations. Clip-path reveals (line drawing effect). 40-frame durations.

**Decoratives:** Dashed lines, dimension arrows (pseudo-elements with borders), coordinate grid, annotation callouts.

**Camera:** Static.

**Signature CSS:** `#1e3a5f` bg, white `1px` borders, `border-style:dashed`, monospace, dimension arrow pseudo-elements.

**Don'ts:** No color beyond blue/white. No rounded containers. No decorative orbs.

---

### 20. Polaroid / Instant Film

**Identity:** Nostalgic photography. White borders, slight tilt, warm color cast.

**Palette:** `--bg:#2a2520; --text:#f5f0e8; --accent:#d4a574; --dim:#8a7e72;`

**Typography:** Handwritten-feel or serif. Headlines 56px. Body 18px. Warm, personal tone.

**Layout:** Polaroid frames: `padding:16px 16px 48px 16px` (thick bottom). Slight rotation. Scattered on surface.

**Animation energy:** Gentle drops. `outBack` easing (cards drop and settle). 35-frame durations. Slight rotation on entrance.

**Decoratives:** Polaroid border (thick bottom padding), `filter:sepia(0.1) saturate(1.2)` warm cast, `box-shadow:0 4px 20px rgba(0,0,0,0.3)` depth.

**Camera:** Settle (scale 1.03→1).

**Signature CSS:** `padding:16px 16px 48px 16px`, `filter:sepia(0.1)`, slight `rotate(-2deg)`, multi-layer `box-shadow`.

**Don'ts:** No digital aesthetics. No neon. No monospace. No dark UI.

---

### 21. Holographic

**Identity:** Iridescent future. Rainbow gradient shifts, chrome reflections, prismatic.

**Palette:** `--bg:#0a0a0a; --text:#ffffff; --accent:#ff00ff; --dim:#333333;` (accent shifts via gradient)

**Typography:** Geometric sans, weight 200 or 700. Headlines 80px with gradient fill. Body 18px.

**Layout:** Centered, clean. Let the holographic effects be the visual interest.

**Animation energy:** Smooth gradient shifts. `inOutSine` easing. `hue-rotate` CSS animation loops. 50-frame entrance durations.

**Decoratives:** Multi-stop rainbow `linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #8a2be2, #ff0080)` + background-position animation. `mix-blend-mode:color-dodge`. `backdrop-filter:hue-rotate()`.

**Camera:** Slow push-in.

**Signature CSS:** Animated multi-stop gradient, `mix-blend-mode:color-dodge`, `-webkit-background-clip:text` for holographic text, `hue-rotate()` animation.

**Don'ts:** No matte/flat colors. No serif fonts. No static backgrounds.

---

### 22. Newspaper / Broadsheet

**Identity:** Old media authority. Column layouts, serif headlines, pull quotes, ink feel.

**Palette:** `--bg:#f8f5e6; --text:#1a1a1a; --accent:#8b0000; --dim:#555555;`

**Typography:** Serif headlines (`Georgia,Times New Roman,serif`). Headlines: 64px, `font-weight:700`. Body: 16px serif, `column-count:2`. Pull quotes: 36px italic with `border-left:4px solid`.

**Layout:** Column-based (`column-count:2` or `3`). Pull quotes break columns. Horizontal rules between sections.

**Animation energy:** Subtle. `outQuad` easing. Fade-in with minimal motion. 30-frame durations.

**Decoratives:** Horizontal rules (`border-top:2px solid #1a1a1a`). Pull quotes. Dateline text. Newsprint bg `#f8f5e6`.

**Camera:** Static or very subtle push-in.

**Signature CSS:** `column-count`, serif stack, pull-quote `border-left:4px solid`, newsprint `#f8f5e6`, `font-style:italic` for quotes.

**Don'ts:** No sans-serif headlines. No neon. No modern UI elements.

---

### 23. Acid Graphic

**Identity:** Warped reality. Extreme distortion, acid colors, psychedelic energy.

**Palette:** `--bg:#000000; --text:#ccff00; --accent:#ff00ff; --dim:#00ffff;`

**Typography:** Bold grotesque sans. Headlines 96px, `transform:skew(-5deg)`. `scaleX(1.3)` for stretched type.

**Layout:** Distorted. Elements overlap intentionally. Skewed containers. Visual chaos with hierarchy.

**Animation energy:** Aggressive, varied. `outBack` + `outElastic`. Rapid stagger (50ms per element). Scale from 3x. Rotation. `filter:hue-rotate()` animation.

**Decoratives:** `filter:hue-rotate()` cycling. Wavy text via per-word `rotate()`. Clashing color blocks. Repeated/echoed text.

**Camera:** Static (the elements provide all the motion).

**Signature CSS:** `transform:skew()`, clashing `hsl` combos, `filter:hue-rotate()` animation, `scaleX(1.5)` stretched type, per-word rotation.

**Don'ts:** No subtlety. No whitespace elegance. No corporate cleanliness.

---

### 24. Stencil / Street Art

**Identity:** Urban rawness. Spray paint texture, stencil cuts, concrete backgrounds, DIY energy.

**Palette:** `--bg:#3a3a3a; --text:#f5f5f5; --accent:#ff4444; --dim:#888888;`

**Typography:** Heavy sans-serif. Headlines: `font-weight:900; letter-spacing:0.2em; text-transform:uppercase`. 72px. Body: 18px.

**Layout:** Bold, blocky. Stencil-cut containers (`clip-path` rough edges). Concrete texture background.

**Animation energy:** Punchy. `snap` or `outCubic` easing. Stamp-like entrances (scale 1.5→1 + opacity). 20-frame durations.

**Decoratives:** Spray bleed `text-shadow:0 0 8px rgba(255,255,255,0.3)`. Stencil blocks `background:rgba(0,0,0,0.85)`. Rough `clip-path` edges. Grain overlay.

**Camera:** Static.

**Signature CSS:** Rough `clip-path`, spray `text-shadow`, stencil `background:rgba(0,0,0,0.85)`, `font-weight:900` + `letter-spacing:0.2em`, grain overlay.

**Don'ts:** No smooth gradients. No elegant serif. No refined layouts. No clean curves.

---

## Color Storytelling

Color arcs create emotional narrative across scenes. Choose an arc based on video intent, then shift CSS custom properties per scene.

### Arc Types

**Cold to Warm** — Problem scenes use blue-grey tones; solution scenes shift to warm amber/gold.
```css
/* Scene 1-2 */ --bg:#0d1520; --text:#8899aa; --accent:#4488aa;
/* Scene 3-4 */ --bg:#1a1510; --text:#ccbb99; --accent:#cc8844;
/* Scene 5+  */ --bg:#1f1810; --text:#f0dcc0; --accent:#e8a040;
```

**Dark to Bright** — Tension release. Low contrast opening builds to high contrast finale.
```css
/* Scene 1-2 */ --bg:#111111; --text:#555555; --accent:#666666;
/* Scene 3-4 */ --bg:#1a1a1a; --text:#aaaaaa; --accent:#8888cc;
/* Scene 5+  */ --bg:#f5f5f5; --text:#111111; --accent:#4444ff;
```

**Mono to Chromatic** — Reveal arc. Single desaturated hue expands to full vibrant palette.
```css
/* Scene 1-3 */ --bg:#1a1a1e; --text:#888888; --accent:#999999;
/* Scene 4   */ --bg:#1a1a2e; --text:#aaaacc; --accent:#6666cc;
/* Scene 5+  */ --bg:#1a1a2e; --text:#eeeeff; --accent:#8855ff; --accent-alt:#ff5588;
```

**Complementary Shift** — Alternating complementary pairs with increasing saturation for energy build.
```css
/* Scene 1 */ --accent:#3355aa; /* blue */
/* Scene 2 */ --accent:#aa5533; /* orange complement */
/* Scene 3 */ --accent:#4466cc; /* blue, more saturated */
/* Scene 4 */ --accent:#cc6644; /* orange, more saturated */
/* Scene 5 */ --accent:#5577ff; /* full saturation */
```

**Brand Crescendo** — Neutral tones build toward full brand color reveal in final scene.
```css
/* Scene 1-3 */ --accent:#888888; /* neutral, no brand */
/* Scene 4   */ --accent:color-mix(in srgb, var(--brand) 30%, #888888); /* hint */
/* Scene 5   */ --accent:color-mix(in srgb, var(--brand) 70%, #888888); /* building */
/* Scene 6   */ --accent:var(--brand); /* full brand reveal */
```

### Usage

Pick the arc in Phase 3 before writing HTML. Set CSS custom properties in each scene's `<div class="scene" style="...">` to follow the arc. Background, text, and accent should all shift coherently.

> **REQUIRED.** Every video with 4+ scenes MUST apply a color arc. The background, accent, or text must shift perceptibly at least twice across the video. "Imperceptible" shifts (e.g., #0A0A0A → #0C0B0A) do NOT count — the viewer must be able to tell two scenes apart by color alone.

---

## Camera Motion

Wrap scene content in a `<div class="cam" data-el="sN-cam">` inside each scene. The cam wrapper uses `overflow:hidden` to prevent edge reveal during pans.

### Wrapper Pattern

```html
<div class="scene" id="scene-0">
  <div class="cam" data-el="s0-cam" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">
    <!-- scene content here -->
  </div>
</div>
```

### Camera Moves

| Move | A() calls | Use with |
|------|-----------|----------|
| **Slow push-in** | `A('[data-el="sN-cam"]','scale',0,totalFrames,1,1.06,'inOutSine')` | Hero, CTA — draws viewer in |
| **Slow pull-out** | `A('[data-el="sN-cam"]','scale',0,totalFrames,1.06,1,'inOutSine')` | Reveal, overview scenes |
| **Pan left** | `A('[data-el="sN-cam"]','x',0,totalFrames,0,-30,'inOutSine')` | Feature sequences |
| **Pan right** | `A('[data-el="sN-cam"]','x',0,totalFrames,0,30,'inOutSine')` | Feature sequences |
| **Drift** | `A('[data-el="sN-cam"]','x',0,f,0,10,'inOutSine')`, `A('[data-el="sN-cam"]','y',0,f,0,-8,'inOutSine')`, `A('[data-el="sN-cam"]','scale',0,f,1,1.02,'inOutSine')` | Atmospheric, moody |
| **Dolly up** | `A('[data-el="sN-cam"]','y',0,f,0,-20,'inOutSine')`, `A('[data-el="sN-cam"]','scale',0,f,1,1.03,'inOutSine')` | Aspirational, upward energy |
| **Settle** | `A('[data-el="sN-cam"]','scale',0,f/3,1.03,1,'outCubic')`, `A('[data-el="sN-cam"]','y',0,f/3,5,0,'outCubic')` | Opening scenes, landing |
| **Breathe** | Use CSS `@keyframes` with `scale(1)→scale(1.015)→scale(1)` looping | Background scenes |

### Per-Recipe Camera Defaults

| Recipe | Default camera |
|--------|---------------|
| Editorial, Art Deco, Holographic | Slow push-in |
| Film Noir, Neon Noir | Slow push-in or pull-out |
| Organic, Liquid, Vaporwave | Drift |
| Paper Cutout, Polaroid | Settle |
| Brutalist, Swiss, Bauhaus, Blueprint, Data Viz | Static |
| Cyberpunk, Isometric | Static or slow pan |
| Kinetic Minimalism | Static (element motion only) |
| CRT, Glitch, Acid, Stencil, Collage | Static |
| Newspaper | Static or subtle push-in |

---

## Kinetic Typography

Text that moves as individual words or characters. Use the `S()` text-splitting helper (available in the runtime) to avoid writing 50+ manual spans.

### The S() Helper

```javascript
// Split text element into word or character spans
// S(element, 'w') → word spans: data-el="original-w0", "original-w1", ...
// S(element, 'c') → char spans: data-el="original-c0", "original-c1", ...
```

Call `S()` in the script block BEFORE defining anims:
```javascript
S(document.querySelector('[data-el="s0-e0"]'), 'w');
// Now reference s0-e0-w0, s0-e0-w1, etc. in A() calls
```

### Techniques

**Word-by-word reveal** — Stagger fade+slide per word, 4-6 frame delay between words:
```javascript
S(el, 'w');
// For each word i:
A('[data-el="s0-e0-w' + i + '"]', 'opacity', i*5, 20, 0, 1, 'outCubic');
A('[data-el="s0-e0-w' + i + '"]', 'y', i*5, 25, 30, 0, 'outCubic');
```

**Character cascade** — Each character appears one by one:
```javascript
S(el, 'c');
// For each char i, stagger 2-3 frames:
A('[data-el="s0-e0-c' + i + '"]', 'opacity', i*2, 10, 0, 1, 'outQuad');
```

**Impact word** — One word dramatically different (wrap it in its own span manually):
```html
<div data-el="s0-e0">The <span data-el="s0-e0-impact" style="display:inline-block;color:var(--accent)">fastest</span> way to build</div>
```
Animate the impact word with `scale` 2→1 + `blur` 8→0 at a delayed offset.

**Typewriter** — Clip-path reveal across the text block:
```javascript
A('[data-el="s0-e0"]', 'clipRight', 0, 60, 100, 0, 'linear');
```

### Timing Guidelines

- Word-by-word: 4-6 frame stagger per word (at 60fps = 67-100ms)
- Character cascade: 2-3 frame stagger per character
- Limit kinetic text to 1-2 scenes per video — overuse loses impact

---

## Secondary Animation

Continuous ambient motion via CSS `@keyframes` — runs independently of `__setFrame`, providing "free" visual richness.

### Patterns

**Float drift** — Decorative elements bobbing gently:
```css
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-15px); } }
.float { animation:float 6s ease-in-out infinite; }
```

**Orbit** — Element traces a circular path:
```css
@keyframes orbit { to { transform:rotate(360deg) translateX(40px) rotate(-360deg); } }
.orbit { animation:orbit 15s linear infinite; }
```

**Pulse glow** — Glow element breathes:
```css
@keyframes pulse-glow { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.1); } }
.pulse-glow { animation:pulse-glow 4s ease-in-out infinite; }
```

**Gradient shift** — Background hue slowly rotates:
```css
@keyframes grad-shift { to { filter:hue-rotate(30deg); } }
.grad-shift { animation:grad-shift 10s ease-in-out infinite alternate; }
```

**Shimmer** — Highlight sweep across surface:
```css
@keyframes shimmer { to { background-position:200% center; } }
.shimmer { background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent); background-size:200% 100%; animation:shimmer 4s linear infinite; }
```

**Breathing border** — Border opacity oscillation:
```css
@keyframes breathe-border { 0%,100% { border-color:rgba(255,255,255,0.1); } 50% { border-color:rgba(255,255,255,0.25); } }
.breathe-border { animation:breathe-border 5s ease-in-out infinite; }
```

### Per-Recipe Recommendations

| Recipe | Recommended secondary animation |
|--------|-------------------------------|
| Editorial, Swiss, Bauhaus, Kinetic Min, Newspaper | None — stillness is the aesthetic |
| Cyberpunk, CRT, Glitch | Shimmer, scan sweep |
| Organic, Liquid, Vaporwave | Float drift, pulse glow |
| Film Noir, Neon Noir | Pulse glow (on light sources) |
| Holographic | Gradient shift, shimmer |
| Art Deco | Subtle pulse glow on gold elements |
| Paper Cutout, Polaroid, Collage | None or very subtle float |
| Data Viz, Blueprint | None — precision aesthetic |
| Acid Graphic | Gradient shift (aggressive), orbit |
| Brutalist, Stencil | None |
| Isometric | Float drift on platform elements |

---

## Negative Space Intelligence

Rules for frame occupancy. Strategic emptiness creates focus and premium feel.

### Occupancy Targets

| Scene type | Target fill | Max elements | Min padding |
|-----------|-------------|-------------|-------------|
| Hook/Hero | 25-35% | 1-2 | 200px |
| Problem | 30-45% | 2-3 | 120px |
| Solution | 35-50% | 2-4 | 100px |
| Feature | 40-55% | 3-5 | 80px |
| Data/Stats | 45-60% | 3-6 | 80px |
| CTA | 20-30% | 1-2 | 200px |

### Rules

1. **Never exceed 60% fill** in any scene
2. **Headlines need air** — minimum 80px clear space above and below
3. **Card gutters** — minimum 32px between cards
4. **One focal point** — if 5 elements exist, one dominates (2x+ size of others)
5. **9:16 vertical** — reduce element count by 30% vs 16:9, increase padding by 40%
6. **1:1 square** — reduce element count by 15%, center everything
7. **Breathing room scales with importance** — CTA and Hero get the MOST space, feature scenes get the least

### Format Adjustments

| Format | Padding multiplier | Element count modifier |
|--------|--------------------|----------------------|
| 16:9 (1920x1080) | 1x (baseline) | Baseline |
| 9:16 (1080x1920) | 1.4x | -30% |
| 1:1 (1080x1080) | 0.9x | -15% |
| 4:5 (1080x1350) | 1.1x | -10% |

---

## Scene Visual Variety (MANDATORY)

In a video with 5+ scenes:

1. **Maximum 3 consecutive text-only scenes allowed.** If scene 2, 3, and 4 are all text-only, scene 5 MUST include a non-text visual element.
2. **At least 1 scene must contain a non-text visual element** — mockup, card, data viz, chart, comparison, progress bar, or decorative component from `components.md`.
3. **Split layouts and centered layouts must alternate** — never use the same layout type for 3+ consecutive scenes.

---

## Decoratives Global Rule

> Recipes that specify "None" for decoratives MAY use zero decoratives. All other recipes MUST include at least one ambient decorative element (orb, grid, gradient, grain, pattern) in at least 2 scenes.

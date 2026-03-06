# HTML Contract — Video File Format

Reference for writing video HTML in Phase 3 of `/orson create`.

---

## File Structure

```html
<!-- @video format="horizontal-16x9" fps="60" speed="normal" mode="safe" codec="h265" output="./.orson/video.mp4" -->

<!-- @scene name="Hook" duration="4000ms" transition-out="crossfade" transition-duration="500ms" -->
<div class="scene" id="scene-0">
  <div class="cam" data-el="s0-cam" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">
    <div data-el="s0-e0">...</div>
    <div data-el="s0-e1">...</div>
  </div>
</div>

<!-- @scene name="Problem" duration="5000ms" transition-out="wipe-left" transition-duration="600ms" -->
<div class="scene" id="scene-1">
  <div class="cam" data-el="s1-cam" style="...">
    <div data-el="s1-e0">...</div>
  </div>
</div>

<!-- @scene name="Solution" duration="4500ms" transition-out="blur" transition-duration="500ms" -->
<div class="scene" id="scene-2">...</div>
```

**Vary transitions between scenes** — don't use `crossfade` for every scene. Alternate between `crossfade`, `wipe-left`, `blur`, `slide-up`, `circle-reveal`, `push-left`, `scale-reveal`, etc.

## Animation Script Structure

```html
<script>
// Scene timing (frames at target fps)
// Option A: Auto-start (recommended) — runtime calculates start from frames + XFADE
var scenes = [
  { id: 'scene-0', frames: 210 },
  { id: 'scene-1', frames: 270 },
  { id: 'scene-2', frames: 300 },
];
var XFADE = 30;  // crossfade overlap in frames (applied between all scenes)

// Option B: Explicit start (backward compatible) — manual control
// var scenes = [
//   { id: 'scene-0', start: 0, frames: 210 },
//   { id: 'scene-1', start: 180, frames: 270 },
//   { id: 'scene-2', start: 420, frames: 300 },
// ];

// Option C: Per-transition overlap (advanced)
// var xfades = [30, 20, 0];  // overlap between scene 0→1, 1→2, 2→3 (0 = cut)
// var XFADE = 30;  // fallback for missing entries

// Text splitting — call BEFORE defining anims
S(document.querySelector('[data-el="s0-e0"]'), 'w');  // split headline into word spans
S(document.querySelector('[data-el="s2-e1"]'), 'c');  // split into character spans

// Animation definitions per scene
// A(selector, property, startOffset, duration, from, to, easingName)
var anims = {
  'scene-0': [
    // Camera: slow push-in over entire scene
    A('[data-el="s0-cam"]', 'scale', 0, 210, 1, 1.06, 'inOutSine'),

    // Headline: word-by-word slam (kinetic typography)
    A('[data-el="s0-e0-w0"]', 'opacity', 0, 15, 0, 1, 'outExpo'),
    A('[data-el="s0-e0-w0"]', 'scale', 0, 20, 3, 1, 'outBack'),
    A('[data-el="s0-e0-w1"]', 'opacity', 12, 15, 0, 1, 'outExpo'),
    A('[data-el="s0-e0-w1"]', 'scale', 12, 20, 3, 1, 'outBack'),
    A('[data-el="s0-e0-w2"]', 'opacity', 24, 15, 0, 1, 'outExpo'),
    A('[data-el="s0-e0-w2"]', 'scale', 24, 20, 3, 1, 'outBack'),

    // Subtitle: clip-reveal from left (different from headline)
    A('[data-el="s0-e1"]', 'clipRight', 50, 40, 100, 0, 'outQuart'),

    // Divider: scale-x expand
    A('[data-el="s0-e2"]', 'scaleX', 70, 30, 0, 1, 'outBack'),
    A('[data-el="s0-e2"]', 'opacity', 70, 15, 0, 1, 'outCubic'),

    // Exit: headline slides up at end of scene
    A('[data-el="s0-e0"]', 'y', 170, 40, 0, -60, 'inBack'),
    A('[data-el="s0-e0"]', 'opacity', 170, 30, 1, 0, 'outQuad'),
  ],

  'scene-1': [
    // Camera: slow pan left
    A('[data-el="s1-cam"]', 'x', 0, 270, 0, -25, 'inOutSine'),

    // Heading: spring-up with overshoot (different easing from scene 0)
    A('[data-el="s1-e0"]', 'opacity', 0, 30, 0, 1, 'outCubic'),
    A('[data-el="s1-e0"]', 'y', 0, 40, 40, 0, 'outBack'),

    // Pain points: stagger from the right, each with different timing
    A('[data-el="s1-e1"]', 'opacity', 30, 25, 0, 1, 'outQuart'),
    A('[data-el="s1-e1"]', 'x', 30, 35, 80, 0, 'outExpo'),
    A('[data-el="s1-e2"]', 'opacity', 50, 25, 0, 1, 'outQuart'),
    A('[data-el="s1-e2"]', 'x', 50, 35, 80, 0, 'outExpo'),
    A('[data-el="s1-e3"]', 'opacity', 70, 25, 0, 1, 'outQuart'),
    A('[data-el="s1-e3"]', 'x', 70, 35, 80, 0, 'outExpo'),

    // Emphasis: pulse on last pain point
    A('[data-el="s1-e3"]', 'scale', 120, 30, 1, 1.05, 'inOutSine'),
    A('[data-el="s1-e3"]', 'scale', 150, 30, 1.05, 1, 'inOutSine'),
  ],

  'scene-2': [
    // Camera: settle (starts zoomed, eases to normal)
    A('[data-el="s2-cam"]', 'scale', 0, 90, 1.04, 1, 'outCubic'),
    A('[data-el="s2-cam"]', 'y', 0, 90, 8, 0, 'outCubic'),

    // Logo: bounce-in with elastic overshoot
    A('[data-el="s2-e0"]', 'opacity', 0, 20, 0, 1, 'outExpo'),
    A('[data-el="s2-e0"]', 'scale', 0, 40, 0.3, 1, 'outElastic'),

    // Product name: character cascade (kinetic typography)
    // (uses S() split from above — s2-e1-c0, s2-e1-c1, ...)
    // Each char fades in with slight y offset, 2-frame stagger
    A('[data-el="s2-e1-c0"]', 'opacity', 30, 10, 0, 1, 'outQuad'),
    A('[data-el="s2-e1-c0"]', 'y', 30, 15, 15, 0, 'outCubic'),
    // ... (continue for each character with +2 frame offset)

    // Tagline: blur-in (contrast with other scenes)
    A('[data-el="s2-e2"]', 'opacity', 80, 30, 0, 1, 'outCubic'),
    A('[data-el="s2-e2"]', 'blur', 80, 40, 12, 0, 'outQuart'),
  ],
  // ...
};
</script>
<!-- Then include the animation runtime -->
```

## New Animation Functions (v6)

### SP() — Spring Physics
Real spring physics (damped harmonic oscillator). Duration is automatic — the spring runs until it settles.

```javascript
// SP(selector, property, startOffset, from, to, { k: stiffness, c: damping, m: mass })

// Hero headline slam with bouncy overshoot
SP('[data-el="s0-e0"]', 'scale', 0, 3, 1, { k: 200, c: 26, m: 1 });
A('[data-el="s0-e0"]', 'opacity', 0, 8, 0, 1, 'outExpo');  // pair with instant fade-in

// Heading rise with playful bounce
SP('[data-el="s1-e0"]', 'y', 0, 40, 0, { k: 120, c: 14, m: 0.4 });
A('[data-el="s1-e0"]', 'opacity', 0, 15, 0, 1, 'outCubic');

// CTA button elastic pop
SP('[data-el="s5-cta"]', 'scale', 60, 0.5, 1, { k: 150, c: 6, m: 0.5 });
A('[data-el="s5-cta"]', 'opacity', 60, 10, 0, 1, 'outExpo');

// Icon bounce-in (replace morph-circle-in)
SP('[data-el="s2-icon"]', 'scale', 0, 0, 1, { k: 120, c: 14, m: 0.4 });
A('[data-el="s2-icon"]', 'opacity', 0, 8, 0, 1, 'outExpo');

// Card drop with heavy weight
SP('[data-el="s3-card"]', 'y', 20, -80, 0, { k: 80, c: 8, m: 2 });
A('[data-el="s3-card"]', 'opacity', 20, 12, 0, 1, 'outCubic');

// Stagger: 3 feature cards with spring + delay
SP('[data-el="s2-f0"]', 'y', 0, 30, 0, { k: 120, c: 14, m: 0.4 });
SP('[data-el="s2-f1"]', 'y', 8, 30, 0, { k: 120, c: 14, m: 0.4 });
SP('[data-el="s2-f2"]', 'y', 16, 30, 0, { k: 120, c: 14, m: 0.4 });
```

**Spring presets:**
| Preset | k | c | m | Feel | Best for |
|--------|-----|-----|-----|------|----------|
| snappy | 200 | 26 | 1 | Fast, almost no overshoot | Headlines, quick reveals |
| bouncy | 120 | 14 | 0.4 | Playful, visible oscillation | Icons, cards, features |
| heavy | 80 | 8 | 2 | Slow, weighty, much overshoot | Hero slams, drops |
| elastic | 150 | 6 | 0.5 | Springy, many oscillations | CTAs, playful brands |

**SP() always needs a paired A() for opacity** — spring only controls the physical property (scale, y, x, rotate). Fade the element in with a fast A() opacity call at the same offset.

Use `SP()` instead of `A()` with `outBack`/`outElastic` for more natural, physically-based motion. **At least 1 SP() per video** is required (see quality checklist).

### N() — Perlin Noise (Organic Movement)
Continuous aperiodic movement via 2D Perlin noise. Never repeats. Different seeds produce different curves.

```javascript
// N(selector, property, seed, speed, amplitude, centerValue)

// ── Decorative drift (orbs, blobs, background elements) ──
N('[data-el="s0-orb"]', 'x', 'orb-x', 0.02, 30, 0);     // drift X ±30px
N('[data-el="s0-orb"]', 'y', 'orb-y', 0.015, 20, 0);     // drift Y ±20px
N('[data-el="s0-orb"]', 'rotate', 'orb-r', 0.008, 5, 0);  // gentle sway ±5deg

// ── Camera shake (overlay on A() push-in) ──
// Light: subtle cinematic texture
A('[data-el="s0-cam"]', 'scale', 0, 210, 1, 1.06, 'inOutSine'),  // push-in
N('[data-el="s0-cam"]', 'x', 'cam-sx', 0.04, 1.5, 0),             // + shake X
N('[data-el="s0-cam"]', 'y', 'cam-sy', 0.035, 1, 0),              // + shake Y

// Medium: impact scene (e.g. after a slam headline)
N('[data-el="s3-cam"]', 'x', 'cam3x', 0.06, 3, 0),
N('[data-el="s3-cam"]', 'y', 'cam3y', 0.05, 2, 0),
N('[data-el="s3-cam"]', 'rotate', 'cam3r', 0.04, 0.3, 0),

// ── Organic icon breathing (replaces CSS @keyframes breathe) ──
N('[data-el="s2-icon"]', 'scale', 'icon-s', 0.025, 0.03, 1),  // scale 0.97–1.03
N('[data-el="s2-icon"]', 'rotate', 'icon-r', 0.01, 2, 0),     // ±2deg

// ── Floating badge / pill ──
N('[data-el="s4-badge"]', 'y', 'badge-y', 0.02, 8, 0),       // float up/down ±8px
N('[data-el="s4-badge"]', 'x', 'badge-x', 0.015, 4, 0),      // drift left/right ±4px
```

**Noise speed/amplitude guide:**
| Use Case | speed | amplitude | Result |
|----------|-------|-----------|--------|
| Slow orb drift | 0.01–0.02 | 20–30px | Atmospheric movement |
| Light camera shake | 0.03–0.05 | 1–2px | Subtle tension |
| Medium camera shake | 0.05–0.06 | 2–3px | Cinematic vibration |
| Heavy camera shake | 0.08 | 4px | Impact/chaos |
| Icon/badge float | 0.02 | 5–10px | Playful bobbing |
| Organic rotation | 0.008–0.01 | 2–5deg | Natural sway |
| Scale breathing | 0.02–0.03 | 0.02–0.05 | Subtle pulse (center=1) |

**Key rules:**
- `N()` is **additive** for `x`, `y`, and `rotate` — overlays on `A()`. This is how camera shake works.
- `N()` is **absolute** for `opacity` and `scale` — set center to the resting value (e.g. `center=1` for scale).
- **Each N() needs a unique seed string.** Different seeds = different curves. Same seed = same movement.
- **Use N() on at least 1 decorative element per video** (see quality checklist). It replaces CSS `@keyframes` float/breathe with smoother, non-looping organic motion.

### D() — SVG Path Draw
Progressively draws an SVG path using `strokeDashoffset`. Works with any SVG `<path>`, `<circle>`, `<line>`, `<polyline>`.

**Pattern 1: Curved underline under a heading**
```html
<!-- Place SVG absolutely positioned below the heading -->
<div style="position:relative;">
  <h1 data-el="s0-e0" style="...">Build Faster</h1>
  <svg viewBox="0 0 500 20" style="position:absolute;bottom:-10px;left:0;width:500px;height:20px;overflow:visible;">
    <path d="M 0 10 Q 125 0, 250 10 T 500 10" stroke="var(--accent)" fill="none"
          stroke-width="3" stroke-linecap="round" data-draw="s0-underline" />
  </svg>
</div>
```
```javascript
// Draw underline after heading enters (offset 50 = heading is visible)
D('[data-draw="s0-underline"]', 50, 40, 0, 1, 'outExpo');
```

**Pattern 2: Connector line between two elements**
```html
<svg viewBox="0 0 200 100" style="position:absolute;top:50%;left:30%;width:200px;height:100px;">
  <path d="M 0 0 C 50 0, 50 100, 200 100" stroke="rgba(255,255,255,0.3)" fill="none"
        stroke-width="2" stroke-dasharray="6 4" data-draw="s2-connector" />
</svg>
```
```javascript
D('[data-draw="s2-connector"]', 30, 50, 0, 1, 'outCubic');
```

**Pattern 3: Circle outline reveal**
```html
<svg viewBox="0 0 200 200" style="width:200px;height:200px;">
  <circle cx="100" cy="100" r="90" stroke="var(--accent)" fill="none"
          stroke-width="2" data-draw="s1-circle" />
</svg>
```
```javascript
D('[data-draw="s1-circle"]', 20, 60, 0, 1, 'outCubic');
```

**Pattern 4: Flow arrow (feature → feature)**
```html
<svg viewBox="0 0 300 50" style="position:absolute;...">
  <path d="M 0 25 L 260 25 L 245 10 M 260 25 L 245 40" stroke="#fff" fill="none"
        stroke-width="2" stroke-linecap="round" data-draw="s3-arrow" />
</svg>
```
```javascript
D('[data-draw="s3-arrow"]', 40, 35, 0, 1, 'outQuart');
```

**D() rules:**
- SVG elements need `fill="none"` and a visible `stroke`
- Position SVGs with `position:absolute` relative to a positioned parent
- Use `overflow:visible` on the SVG if the stroke extends beyond the viewBox
- **Use D() on at least 1 element per video** — underlines, connectors, or outlines (see quality checklist)

### P() — Particle System
Creates animated particles in a container. Uses Perlin noise for organic drift. Deterministic positions via `R()`.

```html
<!-- Container: absolute-fill, transparent, non-interactive -->
<div data-particles="scene-0" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;"></div>
```

```javascript
// P(containerSelector, count, config)

// Subtle ambient dust (dark background, 20-40 particles)
P('[data-particles="scene-0"]', 30, {
  color: 'rgba(255,255,255,0.3)',
  sizeRange: [2, 6],
  driftSpeed: 0.015,
  driftAmp: 20
});

// Dense sparkle (accent-colored, hero/CTA scene)
P('[data-particles="scene-5"]', 50, {
  color: 'rgba(196,181,253,0.4)',   // match accent
  sizeRange: [1, 4],
  driftSpeed: 0.025,
  driftAmp: 15
});

// Slow floating embers (warm palette)
P('[data-particles="scene-2"]', 20, {
  color: 'rgba(251,146,60,0.25)',
  sizeRange: [3, 8],
  driftSpeed: 0.008,
  driftAmp: 35
});
```

**P() config guide:**
| Style | count | sizeRange | driftSpeed | driftAmp | Feel |
|-------|-------|-----------|------------|----------|------|
| Subtle dust | 20–30 | [2, 6] | 0.015 | 20 | Atmospheric background |
| Dense sparkle | 40–60 | [1, 4] | 0.025 | 15 | Energetic, hero scenes |
| Slow embers | 15–25 | [3, 8] | 0.008 | 35 | Warm, cinematic |
| Micro motes | 30–50 | [1, 3] | 0.02 | 10 | Clean tech aesthetic |

**Rules:** Container needs `position:absolute;inset:0;pointer-events:none;overflow:hidden;`. Place it INSIDE the scene div, BEFORE scene content. Set `z-index:0` on container and `z-index:1` on content to keep particles behind.

### R() — Seeded Random
Deterministic pseudo-random: `R(seed)` → `[0, 1)`. Same seed always gives same result.

```javascript
var x = R(42) * 1920;    // always the same x
var y = R(43) * 1080;    // always the same y
var size = 2 + R(44) * 4; // always the same size
```

Used primarily by `P()` internally. Also useful for stagger variation or random color/size variation that stays consistent across renders.

### FPS Variable
If using `SP()` (spring physics), define `var FPS = 60;` (or your target fps) before the runtime. Defaults to 30 if not set.

---

**Key patterns in the example above:**
- Scene 0 uses `slam` (scale 3→1) + `clip-reveal` + `scaleX expand` — 3 different entrance types
- Scene 1 uses `spring-up` (outBack) + `slide-from-right` (outExpo) — 2 different types + emphasis
- Scene 2 uses `bounce-in` (outElastic) + `char-cascade` + `blur-in` — 3 different types
- Each scene has a different camera motion (push-in, pan-left, settle)
- Exit animations are present (scene 0 elements slide up before transition)
- Easings vary: outExpo, outBack, outQuart, outElastic, outCubic, outQuad

**Anti-pattern (DO NOT DO THIS):**
```javascript
// BAD: Every element uses identical fade-in-up with same easing
A('[data-el="s0-e0"]', 'opacity', 0, 40, 0, 1, 'outQuart'),
A('[data-el="s0-e0"]', 'y', 0, 50, 20, 0, 'outQuart'),
A('[data-el="s0-e1"]', 'opacity', 20, 40, 0, 1, 'outQuart'),
A('[data-el="s0-e1"]', 'y', 20, 50, 20, 0, 'outQuart'),
A('[data-el="s0-e2"]', 'opacity', 40, 40, 0, 1, 'outQuart'),
A('[data-el="s0-e2"]', 'y', 40, 50, 20, 0, 'outQuart'),
// This is a slideshow, not a video.
```

## Available Easings

`linear`, `outCubic`, `outQuart`, `outQuad`, `inOutCubic`, `inOutQuad`, `outBack`, `inBack`, `outExpo`, `inExpo`, `outSine`, `inSine`, `inOutSine`, `outElastic`, `outBounce`, `snap`

**Easing personality guide:**
| Easing | Feel | Use for |
|--------|------|---------|
| `outCubic` | Smooth, default | Body text, subtle reveals |
| `outQuart` | Slightly snappier | Secondary elements |
| `outExpo` | Sharp stop | Statements, snappy entrances |
| `outBack` | Playful overshoot | Headlines, CTAs, bouncy entrances |
| `outElastic` | Springy | Logos, icons, playful elements |
| `outBounce` | Bouncy landing | Stats, badges, fun elements |
| `snap` | Instant aggressive | Glitch, brutalist, hard cuts |
| `inOutSine` | Gentle breathe | Camera motion, looping animations |
| `inBack` | Pull-back before exit | Exit animations (anticipation) |

## Available Animation Properties

`opacity`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `blur`, `rotate`, `brightness`, `clipRight`, `clipLeft`, `clipTop`, `clipBottom`

**Property combination cheat-sheet:**
| Effect | Properties | Example |
|--------|-----------|---------|
| Fade in up | `opacity` + `y` | Basic entrance |
| Clip reveal | `clipRight` or `clipLeft` | Curtain/wipe reveal |
| Slam | `opacity` + `scale` (3→1) | Dramatic headline entrance |
| Blur focus | `opacity` + `blur` (12→0) | Dreamy/cinematic reveal |
| Bounce in | `opacity` + `y` (multi-keyframe) | Playful entrance with overshoot |
| Flip in | `opacity` + `rotateX` (90→0) | 3D card flip |
| Spring | `opacity` + `x` (multi-keyframe overshoot) | Elastic horizontal entrance |
| Stamp | `opacity` + `scale` (4→1) + `rotate` | Impact entrance |
| Stretch arrive | `opacity` + `scaleX` (1.3→1) + `scaleY` (0.8→1) | Kinetic push |
| Draw line | `scaleX` (0→1) | Dividers, underlines |

## Format-Specific CSS

- **16:9** (1920x1080): Split left/right layouts, 120px side padding
- **9:16** (1080x1920): Vertical stacking, 60px side padding, larger text
- **1:1** (1080x1080): Centered layouts, compact elements
- **4:5** (1080x1350): Mix vertical/centered
- Use design tokens from seurat (if available) for colors, fonts, spacing

## Video Scale Requirements

This is NOT a website. This is a video. Every element must be legible at typical viewing distances: mobile in hand, desktop monitor, TV across room. Sizes below these minimums are rendering bugs — fix them before preview.

### Minimum Typography (MANDATORY)

| Element | 16:9 (1920×1080) | 9:16 (1080×1920) | 1:1 (1080×1080) |
|---------|-------------------|-------------------|-------------------|
| Hero headline | **80px+** | **96px+** | **72px+** |
| Section headline | 64px+ | 72px+ | 56px+ |
| Body text | 28px+ | 32px+ | 26px+ |
| Label / tag | 20px+ | 24px+ | 18px+ |
| Caption / dim text | 18px+ | 20px+ | 16px+ |
| Stat value (number) | **96px+** | **110px+** | **80px+** |

Below these = rendering bug. Fix immediately.

### Minimum Component Sizing (MANDATORY)

- **Card min-width:** 40% of viewport (e.g. 768px on 1920px wide)
- **Tag / badge min font-size:** 18px, min padding: 12px 28px
- **Progress bar min height:** 12px
- **Headline min-width:** 60% of viewport (e.g. 1152px on 1920). If the text is short, increase `font-size` or `letter-spacing` until it reaches this width
- **Body text container min-width:** 500px on 16:9
- **Icon / decorative element min-size:** 48px
- **CTA button min font-size:** 24px, min padding: 20px 56px

A card at 320px on a 1920px viewport is a web component, not a video component.

### Spatial Fill Rules (MANDATORY)

Content must command the viewport, not float as a tiny island in the center.

1. **Vertical spread**: In centered layouts, the content block (all elements + gaps combined) must occupy **≥40% of viewport height**. On 16:9 that means ≥432px of content height. If your centered content block is only 200px tall, increase font sizes and gaps.

2. **Horizontal spread**: Headlines and primary content must span **≥60% of viewport width**. On 16:9 that means ≥1152px. Use `max-width: 1200-1400px` on text containers, NOT 600-700px.

3. **Split layout coverage**: In 50/50 or 60/40 splits, content must span from the **top 25% to the bottom 75%** of viewport height on each side. No "tiny text in the top-left with 70% empty below."

4. **Gap sizing**: Minimum 32px between elements, 48px between sections. Gaps of 16-24px are web-scale. Video-scale gaps are 32-80px.

5. **Under-filling check**: After writing a scene, mentally ask: "If I screenshot this at 480p (phone), can I read every word?" If the answer is no, elements are too small.

### Contrast Floor (MANDATORY)

- Any visible text: minimum **4.5:1** contrast ratio against its background
- Practical rule: on dark backgrounds (#000–#1a1a1a), the dimmest allowed text is **#808080**
- Label / dim text: **#999999** minimum on dark backgrounds
- "Elegant" low-contrast text is illegible in video — bump it up

## CSS Ambient Animations

The runtime automatically syncs CSS `@keyframes` animations to the frame capture clock via the Web Animations API. All CSS animations are paused on load, then advanced to the exact frame timestamp during `__setFrame(n)`. This makes CSS animations deterministic and frame-perfect.

**Available ambient keyframes** (from `getDecorativeKeyframes()` in `decorative.ts`):

| Keyframe | Effect | Typical Duration | Use |
|----------|--------|-----------------|-----|
| `amb-float` | Vertical oscillation ±20px | 6s | Orbs, decorative cards |
| `amb-float-slow` | Multi-axis drift + scale 0.95-1.05 | 10s | Background blobs |
| `amb-float-reverse` | Counter-direction of amb-float | 8s | Second orb (diversity) |
| `amb-shimmer` | Sweep background-position -200% → 200% | 3s | Headline gradient, buttons |
| `amb-pulse-glow` | Box-shadow 0→30px blur expansion | 4s | CTA, active cards |
| `amb-shine` | Light streak left -75% → 125% | 2.5s | Buttons, premium cards |
| `amb-breathe` | Scale 0.98→1.02 oscillation | 5s | Cards, containers |
| `amb-border-glow` | Border-color opacity pulse | 3s | Glassmorphism cards |
| `amb-ripple` | Concentric ring expansion | 4s | Badges, indicators |
| `amb-grid-fade` | Opacity 0.03→0.07 pulse | 6s | Grid patterns |
| `amb-drift` | TranslateX 0→40px + rotate 0→2deg | 12s | Horizontal decoratives |
| `amb-gradient-text` | Background-position sweep on gradient text | 4s | Gradient text headlines |

**Usage in HTML:**
```css
/* Animated gradient text */
.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: amb-gradient-text 4s ease-in-out infinite alternate;
}

/* Shimmer button */
.shimmer-btn { position: relative; overflow: hidden; }
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: amb-shine 2.5s ease-in-out infinite;
}
```

**Stagger:** When multiple instances of the same decorative exist, use `animation-delay` with negative offsets (e.g., `-2s`, `-4s`) to desynchronize them.

**Built-in animated decoratives:** Orb (float), ring (float-reverse), bokeh (float, staggered), glow (pulse-glow), grid-pattern (grid-fade), mesh-gradient (drift), light-leak (breathe). These are animated by default — no extra CSS needed.

---

## Resources for Writing HTML

- Read `references/visual-recipes.md` for:
  - Visual recipe catalog (24 aesthetic systems)
  - **Spatial Presence rules** — fill floor AND ceiling per scene type (MANDATORY)
  - **Animation Diversity rules** — entrance variety, transition variety, camera variety, kinetic typography requirements (MANDATORY)
  - Color arcs, camera motion, kinetic typography, secondary animation
- Read `references/components.md` for CSS layout patterns (hero, feature cards, code blocks, stats, CTA, glassmorphism, mockups, camera wrapper)
- Read `engine/src/actions.ts` for the full animation catalog (47 entrances, 28 exits, 28 transitions, 10 emphasis, 11 looping) — **USE the variety, not just fade-in-up**
- Read `engine/src/decorative.ts` for CSS-only decorative element patterns (orbs, grids, gradients, grain, bokeh, vignette)
- Read `engine/src/runtime.ts` for the animation runtime — includes `A()` eased animations, `SP()` spring physics, `N()` Perlin noise, `D()` SVG draw, `P()` particles, `R()` seeded random, `S()` text splitter

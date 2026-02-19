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
var scenes = [
  { id: 'scene-0', start: 0, frames: 210 },
  { id: 'scene-1', start: 180, frames: 270 },  // overlap = crossfade
  { id: 'scene-2', start: 420, frames: 300 },   // wipe transition (no overlap needed in scene timing — runtime handles it)
  // ...
];
var XFADE = 30;  // crossfade overlap in frames

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

## Resources for Writing HTML

- Read `references/visual-recipes.md` for:
  - Visual recipe catalog (24 aesthetic systems)
  - **Spatial Presence rules** — fill floor AND ceiling per scene type (MANDATORY)
  - **Animation Diversity rules** — entrance variety, transition variety, camera variety, kinetic typography requirements (MANDATORY)
  - Color arcs, camera motion, kinetic typography, secondary animation
- Read `references/components.md` for CSS layout patterns (hero, feature cards, code blocks, stats, CTA, glassmorphism, mockups, camera wrapper)
- Read `engine/src/actions.ts` for the full animation catalog (47 entrances, 28 exits, 28 transitions, 10 emphasis, 11 looping) — **USE the variety, not just fade-in-up**
- Read `engine/src/decorative.ts` for CSS-only decorative element patterns (orbs, grids, gradients, grain, bokeh, vignette)
- Read `engine/src/runtime.ts` for the animation runtime (include inline or via import) — includes `S(el,mode)` text-splitting helper for kinetic typography

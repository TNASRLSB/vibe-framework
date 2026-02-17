# HTML Contract — Video File Format

Reference for writing video HTML in Phase 3 of `/orson create`.

---

## File Structure

```html
<!-- @video format="horizontal-16x9" fps="60" speed="normal" mode="safe" codec="h265" output="./.orson/video.mp4" -->

<!-- @scene name="Scene Name" duration="4000ms" transition-out="crossfade" transition-duration="500ms" -->
<div class="scene" id="scene-N">
  <div data-el="sN-e0">...</div>
  <div data-el="sN-e1">...</div>
</div>
```

## Animation Script Structure

```html
<script>
// Scene timing (frames at target fps)
var scenes = [
  { id: 'scene-0', start: 0, frames: 210 },
  { id: 'scene-1', start: 180, frames: 270 },  // overlap = crossfade
  // ...
];
var XFADE = 30;  // crossfade overlap in frames

// Animation definitions per scene
// A(selector, property, startOffset, duration, from, to, easingName)
var anims = {
  'scene-0': [
    A('[data-el="s0-e0"]', 'opacity', 0, 30, 0, 1, 'outExpo'),
    A('[data-el="s0-e0"]', 'y', 0, 40, 60, 0, 'outBack'),
  ],
  // ...
};
</script>
<!-- Then include the animation runtime -->
```

## Available Easings

`linear`, `outCubic`, `outQuart`, `outQuad`, `inOutCubic`, `inOutQuad`, `outBack`, `inBack`, `outExpo`, `inExpo`, `outSine`, `inSine`, `inOutSine`, `outElastic`, `outBounce`, `snap`

## Available Animation Properties

`opacity`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `blur`, `rotate`, `brightness`, `clipRight`, `clipLeft`, `clipTop`, `clipBottom`

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
| Headline | 64px+ | 72px+ | 56px+ |
| Body text | 28px+ | 32px+ | 26px+ |
| Label / tag | 20px+ | 24px+ | 18px+ |
| Caption / dim text | 18px+ | 20px+ | 16px+ |

Below these = rendering bug. Fix immediately.

### Minimum Component Sizing (MANDATORY)

- **Card min-width:** 40% of viewport (e.g. 768px on 1920px wide)
- **Tag / badge min font-size:** 18px, min padding: 12px 28px
- **Progress bar min height:** 12px

A card at 320px on a 1920px viewport is a web component, not a video component.

### Contrast Floor (MANDATORY)

- Any visible text: minimum **4.5:1** contrast ratio against its background
- Practical rule: on dark backgrounds (#000–#1a1a1a), the dimmest allowed text is **#808080**
- Label / dim text: **#999999** minimum on dark backgrounds
- "Elegant" low-contrast text is illegible in video — bump it up

## Resources for Writing HTML

- Read `references/visual-recipes.md` for the visual recipe catalog, color arcs, camera motion, kinetic typography, secondary animation, and negative space rules
- Read `references/components.md` for CSS layout patterns (hero, feature cards, code blocks, stats, CTA, glassmorphism, mockups, camera wrapper)
- Read `engine/src/actions.ts` for the full animation catalog (entrances, exits, transitions, emphasis, looping)
- Read `engine/src/decorative.ts` for CSS-only decorative element patterns (orbs, grids, gradients, grain, bokeh, vignette)
- Read `engine/src/runtime.ts` for the animation runtime (include inline or via import) — includes `S(el,mode)` text-splitting helper for kinetic typography

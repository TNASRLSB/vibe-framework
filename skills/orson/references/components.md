# Orson Components Reference

## Animation Primitives

### A() -- Standard Eased Animation

```js
A(selector, property, startOffset, duration, from, to, easingName)
```

Interpolates a property from `from` to `to` over `duration` frames starting at `startOffset` within the scene. Uses the named easing function (default: `outCubic`).

**Example:**
```js
A('[data-el="s0-e0"]', 'opacity', 0, 20, 0, 1, 'outCubic')
A('[data-el="s0-e0"]', 'y', 0, 25, 40, 0, 'outQuart')
```

### SP() -- Spring Physics Animation

```js
SP(selector, property, startOffset, from, to, { k, c, m })
```

Damped harmonic oscillator. Duration is implicit (settles when energy dissipates).

**Presets:**
| Name | k | c | m | Character |
|------|---|---|---|-----------|
| snappy | 200 | 26 | 1 | Fast, minimal overshoot |
| bouncy | 120 | 14 | 0.4 | Playful, visible overshoot |
| heavy | 80 | 8 | 2 | Slow, weighty, dramatic |
| elastic | 150 | 6 | 0.5 | Extended oscillation |

### N() -- Noise-Driven Animation

```js
N(selector, property, seed, speed, amplitude, centerValue)
```

Continuous organic movement via Perlin noise. Never repeats exactly. Good for floating elements, subtle background motion.

**Example:**
```js
N('[data-el="s0-bg"]', 'y', 'float-y', 0.008, 5, 0)    // gentle vertical drift
N('[data-el="s0-bg"]', 'rotate', 'tilt', 0.005, 2, 0)    // subtle tilt
N('[data-el="s0-glow"]', 'opacity', 'pulse', 0.02, 0.1, 0.8)  // pulsing glow
```

### D() -- SVG Path Draw

```js
D(selector, startOffset, duration, from, to, easingName)
```

Animates `strokeDashoffset` to progressively reveal an SVG path. `from` and `to` are progress values (0 = hidden, 1 = fully drawn).

### P() -- Particle System

```js
P(containerSelector, count, { sizeRange, color, driftSpeed, driftAmp })
```

Creates particles in a container element and animates them via Perlin noise. Particles have random positions, sizes, and opacities.

**Defaults:** sizeRange [2,6], color 'rgba(255,255,255,0.3)', driftSpeed 0.015, driftAmp 20

### S() -- Text Splitter

```js
S(element, mode)
```

Splits text content into individual `<span>` elements for kinetic typography:
- `'w'` -- split by words
- `'c'` -- split by characters

Each span gets a `data-el` attribute derived from the parent: `originalId-w0`, `originalId-w1`, etc.

### R() -- Deterministic Random

```js
R(seed)  // returns [0, 1)
```

Same seed always produces the same value. Use for consistent "random" positioning across renders.

---

## Easing Functions

Available in the runtime and in `interpolate.ts`:

| Category | Functions |
|----------|-----------|
| Quad | linear, easeInQuad, easeOutQuad, easeInOutQuad |
| Cubic | easeInCubic, easeOutCubic, easeInOutCubic |
| Quart | easeInQuart, easeOutQuart, easeInOutQuart |
| Back | easeInBack, easeOutBack, easeInOutBack |
| Elastic | easeInElastic, easeOutElastic |
| Bounce | easeInBounce, easeOutBounce |
| Expo | easeInExpo, easeOutExpo |
| Sine | easeInSine, easeOutSine, easeInOutSine |
| Special | snap (sharp deceleration) |

Runtime uses shorter names: `outCubic`, `outQuart`, `outBack`, `outElastic`, `outBounce`, `outExpo`, `outSine`, `inOutCubic`, `inOutQuad`, `inOutSine`, `snap`.

---

## Entrance Animations

Defined in `actions.ts`. Each entrance specifies properties to animate and their from/to values. Entrances are categorized by energy level.

**Energy levels:**
- `minimal` -- Opacity only, very subtle
- `low` -- Gentle movement + opacity
- `medium` -- Moderate movement, scaling, or blur
- `high` -- Large movement, rotation, or spring physics
- `special` -- Complex multi-property effects

Common entrance patterns:
- **Fade in**: opacity 0->1
- **Slide up/down/left/right**: translate + opacity
- **Scale up/down**: scale + opacity
- **Clip reveal**: clip-path animation
- **Blur in**: blur + opacity
- **Rotate in**: rotation + opacity + optional scale
- **Spring pop**: spring physics scale/position
- **Draw on**: SVG path reveal

---

## Transition Effects

Transitions define how one scene exits and the next enters simultaneously during the crossfade overlap (XFADE frames).

### Crossfade (Default)

Simple opacity blend between scenes. Controlled by the `XFADE` constant.

### Custom Transitions

Each transition defines `outgoing` (scene A exit properties) and `incoming` (scene B enter properties):

- **Slide**: outgoing slides left, incoming slides from right
- **Scale**: outgoing shrinks, incoming grows
- **Blur**: outgoing blurs out, incoming blurs in
- **Wipe**: clip-path based directional reveal

Transitions are specified per-scene in HTML: `<!-- @scene transition-out="crossfade" transition-duration="500ms" -->`

---

## Scene Structure

### HTML Layout

```html
<!-- @video format="vertical-9x16" fps="30" speed="normal" mode="safe"
     codec="h264" output="./output.mp4" -->

<!-- @scene name="Intro" duration="4s" transition-out="crossfade" -->
<div class="scene" id="scene-0" style="display:flex; ...">
  <div class="el" data-el="s0-e0">Welcome</div>
  <div class="el" data-el="s0-e1">Subtitle text here</div>
</div>

<!-- @scene name="Features" duration="5s" sfx="click@1500,whoosh@3000" -->
<div class="scene" id="scene-1" style="display:flex; ...">
  <div class="el" data-el="s1-e0">Feature One</div>
  <div class="el" data-el="s1-e1">Description text</div>
</div>
```

### Animation Script

```html
<script>
var FPS = 30;
var XFADE = 8;  // crossfade overlap in frames
var scenes = [
  { id: 'scene-0', frames: 120 },
  { id: 'scene-1', frames: 150 },
];
var anims = {
  'scene-0': [
    A('[data-el="s0-e0"]', 'opacity', 0, 20, 0, 1, 'outCubic'),
    A('[data-el="s0-e0"]', 'y', 0, 25, 40, 0, 'outQuart'),
    A('[data-el="s0-e1"]', 'opacity', 15, 20, 0, 1, 'outCubic'),
  ],
  'scene-1': [
    A('[data-el="s1-e0"]', 'opacity', 0, 20, 0, 1, 'outCubic'),
    SP('[data-el="s1-e0"]', 'scale', 0, 0.8, 1, {k:200,c:26,m:1}),
  ],
};
</script>
<script>/* runtime from getAnimationRuntime() */</script>
```

### Auto-Start Computation

When `scenes[0].start` is undefined (the typical case), the runtime auto-computes start frames:
- `scenes[0].start = 0`
- `scenes[i].start = scenes[i-1].start + scenes[i-1].frames - XFADE`

Per-transition XFADE can be overridden via an optional `xfades[]` array.

---

## Stagger Patterns

Control element entrance timing within a scene:

| Pattern | Behavior |
|---------|----------|
| `cascade-down` | Sequential top-to-bottom (default) |
| `cascade-up` | Sequential bottom-to-top |
| `origin-burst` | Center outward |
| `wave` | Left-to-right wave |
| `paired` | Two elements at a time |
| `none` | All simultaneous |

---

## Layout Templates

Orson supports standard layout patterns for scenes:

- **Hero**: Large heading + subtitle + CTA
- **Split**: Two-column layout (text + image/mockup)
- **Feature Grid**: Multiple feature cards
- **Testimonial**: Quote + attribution
- **Stats/Numbers**: Animated counters
- **Logo Reveal**: Brand reveal with effects
- **CTA**: Final call-to-action scene

Device mockup frames available in `mockups.ts` for embedding app screenshots.

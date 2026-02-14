# Spec: Orson v3 — Frame-Addressed Architecture

**Date:** 2026-02-13
**Status:** Draft — awaiting PROCEED
**Scope:** Rewrite promo/generated video pipeline. Demo mode untouched.

---

## Problem

Orson v2 generates videos by:
1. Taking a content JSON blob
2. Running it through `autogen` (black box) which distributes content across scenes arbitrarily
3. Generating HTML with CSS animation delays (e.g. `animation: fade-in 500ms 3000ms both`)
4. Capturing frames by advancing Web Animations API `currentTime`

This architecture has three fatal flaws:
- **Screenplay is ignored** — autogen takes content JSON, not the screenplay. The narrative structure designed in the guided flow is lost.
- **CSS animations aren't frame-addressable** — timing depends on browser animation engine alignment with capture timing. Not deterministic.
- **No compositional control** — elements can't react to frame number. Everything is "fire and forget" with CSS delays.

**Target:** Remotion-like frame-addressed rendering where `f(frame) → pixels` is deterministic.

---

## Architecture

### Current (v2)

```
Content JSON → autogen (black box) → HTML + CSS animations → capture (advance currentTime) → FFmpeg
                    ↑
              screenplay lost here
```

### New (v3)

```
Screenplay → Timeline Compiler → frame-addressed Timeline → setFrame(n) in browser → capture → FFmpeg
                                        ↑
                                  every element knows what to do at frame N
```

---

## What stays, what changes

| Component | Action | Rationale |
|-----------|--------|-----------|
| encode.ts (102 lines) | **Keep as-is** | FFmpeg pipe works fine |
| presets.ts (145 lines) | **Keep as-is** | Format/codec/speed presets are fine |
| audio-selector.ts | **Keep as-is** | Audio selection logic works |
| audio-mixer.ts | **Keep as-is** | Audio mixing/ducking works |
| narration_generator.py | **Keep as-is** | TTS pipeline works |
| Demo pipeline (5 files) | **Keep as-is** | Separate pipeline, not affected |
| config.ts (97 lines) | **Update** | New Zod schema for frame-addressed config |
| capture.ts (171 lines) | **Rewrite** | New loop: `setFrame(n)` instead of currentTime advance |
| timing.ts (154 lines) | **Update** | Output frames instead of ms |
| actions.ts (1107 lines) | **Rewrite** | CSS keyframes → interpolation functions |
| choreography.ts (475 lines) | **Rewrite** | CSS wrappers → interpolation orchestration |
| composition.ts (721 lines) | **Update** | Scene types/narratives stay, transitions become frame-based |
| director.ts (495 lines) | **Rewrite** | Recipes output interpolation curves, not CSS animation names |
| timeline.ts (307 lines) | **Rewrite** | Frame-addressed timeline compiler |
| html-generator.ts (1039 lines) | **Rewrite** | Static HTML + frame renderer JS |
| autogen.ts (708 lines) | **Rewrite** | Screenplay-faithful scene builder |
| scene-templates.ts (255 lines) | **Update** | Layout CSS stays, animation refs removed |
| html-parser.ts (214 lines) | **Simplify** | Less metadata to parse from HTML |
| index.ts (440 lines) | **Update** | New render pipeline orchestration |

**New files:**
| File | Purpose |
|------|---------|
| interpolate.ts | Core interpolation engine (`interpolate`, `spring`) |
| frame-renderer.ts | Generates JS injected into browser for `setFrame(n)` |

---

## Phase 1: Core Interpolation Engine (`interpolate.ts`)

The foundational primitive. Everything else builds on this.

### `interpolate(frame, inputRange, outputRange, options?)`

```ts
// Linear interpolation with clamping
interpolate(15, [0, 30], [0, 1]); // → 0.5

// With easing
interpolate(15, [0, 30], [0, 1], { easing: easeOutCubic }); // → 0.875

// Multi-stop
interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0]); // fade in, hold, fade out

// Extrapolation control
interpolate(45, [0, 30], [0, 1], { extrapolateRight: 'clamp' }); // → 1 (clamped)
```

**Easing functions** (pure math, no CSS):
```ts
type EasingFn = (t: number) => number;

const easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t,
  easeOutCubic: (t) => (--t)*t*t+1,
  easeInOutCubic: (t) => t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
  easeOutBack: (t) => { const c = 1.70158; return 1 + (c+1) * Math.pow(t-1, 3) + c * Math.pow(t-1, 2); },
  easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10*t) * Math.sin((t-0.1)*5*Math.PI) + 1,
  easeOutBounce: (t) => { /* standard bounce */ },
};
```

### `spring({frame, fps, config})`

Physics-based spring animation (Remotion-compatible algorithm):

```ts
spring({
  frame: 15,
  fps: 60,
  config: { stiffness: 100, damping: 10, mass: 1 }
}); // → 0.0 to 1.0 (spring curve)
```

**Implementation:** Solve the damped harmonic oscillator ODE numerically per frame. Cache results for performance.

### Property Types

```ts
type AnimatableProperty =
  | 'opacity'      // 0-1
  | 'x'            // translateX in px
  | 'y'            // translateY in px
  | 'scale'        // uniform scale
  | 'scaleX'       // x-axis scale
  | 'scaleY'       // y-axis scale
  | 'rotate'       // degrees
  | 'blur'         // px
  | 'brightness'   // 0-2
  | 'clipTop'      // clip-path inset top %
  | 'clipRight'    // clip-path inset right %
  | 'clipBottom'   // clip-path inset bottom %
  | 'clipLeft';    // clip-path inset left %
```

---

## Phase 2: Animation Library Rewrite (`actions.ts`)

Convert 100+ CSS keyframes into interpolation functions. Each animation becomes a function that, given a progress value (0-1), returns the style state.

### Current (v2):
```ts
// CSS keyframe string
'fade-in-up': {
  keyframes: `@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }`,
  duration: [400, 600],
  initialStyle: 'opacity: 0; transform: translateY(20px);'
}
```

### New (v3):
```ts
// Interpolation function
'fade-in-up': {
  duration: [400, 600], // ms, converted to frames at render time
  properties: {
    opacity: { from: 0, to: 1 },
    y: { from: 20, to: 0 },
  },
  easing: 'easeOutCubic',
  energy: 'low',
}
```

### Complex animations (multi-step):
```ts
'spring-up': {
  duration: [500, 700],
  properties: {
    opacity: { keyframes: [0, 0.3, 1], values: [0, 1, 1] },  // quick fade
    y: { type: 'spring', config: { stiffness: 180, damping: 12 } },  // physics spring
  },
  energy: 'medium',
}

'scale-word': {
  duration: [400, 500],
  properties: {
    opacity: { keyframes: [0, 0.2, 1], values: [0, 1, 1] },
    scale: { keyframes: [0, 0.7, 1], values: [3, 0.95, 1] },
    blur: { keyframes: [0, 0.7, 1], values: [8, 0, 0] },
  },
  easing: 'easeOutCubic',
  energy: 'high',
}
```

### Transitions (scene-to-scene):
```ts
'crossfade': {
  duration: [500, 700],
  outgoing: { opacity: { from: 1, to: 0 } },
  incoming: { opacity: { from: 0, to: 1 } },
}

'slide-left': {
  duration: [500, 600],
  outgoing: { x: { from: 0, to: -1920 } },  // viewport width
  incoming: { x: { from: 1920, to: 0 } },
}

'morph-reveal': {
  duration: [600, 800],
  outgoing: { clipLeft: { from: 0, to: 100 } },
  incoming: { clipLeft: { from: 100, to: 0 } },
}
```

**Migration:** Mechanical conversion. Each CSS keyframe maps 1:1 to interpolation properties. Script can automate bulk conversion.

---

## Phase 3: Timeline Compiler (`timeline.ts` rewrite)

The timeline compiler takes a **Screenplay** (structured scenes with elements and animations) and produces a **frame-addressed Timeline**.

### Input: Screenplay

```ts
interface Screenplay {
  fps: number;
  format: FormatId;
  scenes: ScreenplayScene[];
}

interface ScreenplayScene {
  id: string;
  name: string;                    // from user-approved screenplay
  layout: LayoutId;
  background: BackgroundDef;
  transitionIn?: TransitionId;
  transitionOut?: TransitionId;
  transitionDuration?: number;     // ms
  elements: ScreenplayElement[];
}

interface ScreenplayElement {
  type: 'heading' | 'text' | 'button' | 'card' | 'divider' | 'image';
  content: string;                 // exact text from screenplay
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  entrance: EntranceId;
  entranceDuration?: number;       // ms, or auto from animation
  staggerDelay?: number;           // ms offset from scene start
  emphasis?: EmphasisId;           // optional emphasis animation
  // card-specific
  icon?: string;
  title?: string;
  text?: string;
}
```

### Output: Frame-addressed Timeline

```ts
interface Timeline {
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
  scenes: TimelineScene[];
}

interface TimelineScene {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
  layout: LayoutId;
  background: BackgroundDef;
  elements: TimelineElement[];
  transition?: {
    type: TransitionId;
    startFrame: number;           // overlap with next scene
    endFrame: number;
  };
}

interface TimelineElement {
  id: string;
  type: ElementType;
  content: string;
  size?: SizeId;
  domSelector: string;            // CSS selector to target in browser
  animations: FrameAnimation[];
}

interface FrameAnimation {
  property: AnimatableProperty;
  startFrame: number;             // absolute frame number
  endFrame: number;
  values: number[];               // [from, to] or [v0, v1, v2, ...]
  keyframes?: number[];           // [0, 0.5, 1] progress points
  easing: EasingId | 'spring';
  springConfig?: SpringConfig;
}
```

### Compilation steps:

1. **Convert ms to frames** — `frames = Math.round(ms * fps / 1000)`
2. **Compute scene frames** — timing.ts word count → frames, or explicit duration
3. **Place elements** — stagger pattern → per-element startFrame offset
4. **Expand animations** — entrance ID → FrameAnimation[] (one per property)
5. **Add transitions** — scene overlap regions with transition animations
6. **Validate** — no gaps >200ms where nothing visible, no overflow

---

## Phase 4: Frame Renderer (`frame-renderer.ts`)

Generates a JavaScript module that gets injected into the browser page. This JS knows the entire timeline and can render any frame on demand.

### Generated JS structure:

```js
// Injected into page via page.addScriptTag() or page.evaluate()
(function() {
  const timeline = /* serialized Timeline JSON */;
  const fps = timeline.fps;

  // Easing functions (inlined, no imports needed)
  const easings = { /* all easing functions */ };

  // Spring solver (inlined)
  function spring(frame, startFrame, config) { /* ... */ }

  // Core interpolation (inlined)
  function interpolate(frame, inputRange, outputRange, easing) { /* ... */ }

  // Compute element style at frame N
  function computeStyle(element, frame) {
    const style = { opacity: 1, transform: '', filter: '', clipPath: '' };

    for (const anim of element.animations) {
      if (frame < anim.startFrame || frame > anim.endFrame) {
        // Before animation: use initial value. After: use final value.
        const value = frame < anim.startFrame ? anim.values[0] : anim.values[anim.values.length - 1];
        applyProperty(style, anim.property, value);
        continue;
      }

      const progress = (frame - anim.startFrame) / (anim.endFrame - anim.startFrame);
      let value;

      if (anim.easing === 'spring') {
        value = spring(frame, anim.startFrame, anim.springConfig);
        value = anim.values[0] + (anim.values[1] - anim.values[0]) * value;
      } else if (anim.keyframes) {
        value = interpolateMulti(progress, anim.keyframes, anim.values, easings[anim.easing]);
      } else {
        const t = easings[anim.easing](progress);
        value = anim.values[0] + (anim.values[1] - anim.values[0]) * t;
      }

      applyProperty(style, anim.property, value);
    }

    return style;
  }

  function applyProperty(style, prop, value) {
    switch (prop) {
      case 'opacity': style.opacity = value; break;
      case 'x': style.transform += ` translateX(${value}px)`; break;
      case 'y': style.transform += ` translateY(${value}px)`; break;
      case 'scale': style.transform += ` scale(${value})`; break;
      case 'rotate': style.transform += ` rotate(${value}deg)`; break;
      case 'blur': style.filter += ` blur(${value}px)`; break;
      case 'brightness': style.filter += ` brightness(${value})`; break;
      case 'clipTop': case 'clipRight': case 'clipBottom': case 'clipLeft':
        // Accumulate clip values
        break;
    }
  }

  // Main: render frame N
  window.__setFrame = function(n) {
    for (const scene of timeline.scenes) {
      const sceneEl = document.getElementById(scene.id);
      if (!sceneEl) continue;

      // Scene visibility
      const isActive = n >= scene.startFrame && n <= scene.endFrame;
      sceneEl.style.display = isActive ? '' : 'none';

      if (!isActive) continue;

      // Handle transition overlap (both scenes visible)
      if (scene.transition && n >= scene.transition.startFrame) {
        // Apply transition animation to scene container
      }

      // Element animations
      for (const element of scene.elements) {
        const el = sceneEl.querySelector(element.domSelector);
        if (!el) continue;

        const style = computeStyle(element, n);
        el.style.opacity = style.opacity;
        el.style.transform = style.transform.trim() || 'none';
        if (style.filter) el.style.filter = style.filter.trim();
        if (style.clipPath) el.style.clipPath = style.clipPath;
      }
    }
  };

  // Signal ready
  window.__frameRendererReady = true;
})();
```

### HTML page structure (static, no CSS animations):

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Layout CSS only — Grid, typography, colors, backgrounds */
    /* NO @keyframes, NO animation properties */
    .scene { display: none; /* controlled by JS */ }
  </style>
</head>
<body>
  <div class="scene layout-centered" id="scene-hook">
    <div class="scene-content">
      <div class="el el-heading size-xl" data-el="hook-heading">Your AI is coding blind.</div>
      <div class="el el-text" data-el="hook-text">No memory. No plan. No guardrails.</div>
    </div>
  </div>
  <!-- ... more scenes ... -->

  <script>/* frame renderer injected here */</script>
</body>
</html>
```

---

## Phase 5: Capture Rewrite (`capture.ts`)

The simplest change — capture becomes trivial:

### Current (v2):
```ts
// Advance animation time, compute scroll position, capture
for (let f = 0; f < totalFrames; f++) {
  const t = f * frameDuration;
  await page.evaluate((time) => {
    document.getAnimations().forEach(a => a.currentTime = time);
  }, t);
  // compute scroll position...
  await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
  const buf = await page.screenshot({ type: 'jpeg' });
  encoder.write(buf);
}
```

### New (v3):
```ts
// Call setFrame, capture. That's it.
for (let f = 0; f < totalFrames; f++) {
  await page.evaluate((frame) => window.__setFrame(frame), f);
  const buf = await page.screenshot({ type: 'jpeg' });
  encoder.write(buf);
}
```

No scroll computation, no animation time tracking, no currentTime hacks. The frame renderer handles everything.

---

## Phase 6: Screenplay-Faithful Autogen (`autogen.ts` rewrite)

The most important change. Autogen stops being a black box and becomes a **screenplay executor**.

### Current flow (broken):
```
Content JSON → autogen distributes content across scenes however it wants → HTML
```

### New flow:
```
Screenplay (user-approved) → autogen builds exactly those scenes → Timeline
```

### New autogen input:

```ts
interface AutogenInput {
  screenplay: ScreenplayScene[];   // exact scenes from guided flow
  format: FormatId;
  mode: ModeId;
  speed: SpeedId;
  designSystem?: string;           // path to tokens.css
}

// Each scene comes directly from the approved screenplay
interface ScreenplayScene {
  name: string;                    // "Your AI is coding blind."
  type: SceneTypeId;               // hook, problem, solution, feature, proof, cta
  elements: {
    heading?: string;              // exact text
    text?: string;                 // exact text
    cards?: { title: string; text?: string; icon?: string }[];
    button?: string;
  };
}
```

### What autogen does now (simpler, faithful):

1. **Receive exact scenes** — no content redistribution, no "smart" matching
2. **Assign layouts** — based on scene type + element count + format (from composition.ts)
3. **Assign animations** — director.ts recipes based on scene type/position/mode
4. **Compute timing** — word count → duration (from timing.ts)
5. **Build Screenplay object** — with animations and frame counts
6. **Compile to Timeline** — via timeline compiler
7. **Generate HTML + frame renderer** — static layout + injected JS

### What autogen does NOT do anymore:
- Redistribute content between scenes
- Rename scenes to "Details 1", "Details 2"
- Truncate card titles
- Add random feature cards to scenes that didn't have them
- Ignore the screenplay

---

## Phase 7: Director Update (`director.ts`)

Director recipes stay (they're good at matching animations to content types). They just output differently.

### Current (v2):
```ts
// Recipe output: mutate element to add CSS animation name
element.entrance = 'kinetic-push';
element.size = 'xl';
```

### New (v3):
```ts
// Recipe output: select entrance ID + properties
element.entrance = 'kinetic-push';   // still a name, but resolved to interpolations later
element.size = 'xl';
// Same API, different backend. The name 'kinetic-push' now maps to
// interpolation properties instead of CSS keyframes.
```

The 13 recipes (heroImpact, metricReveal, textKinetic, cardBurst, etc.) keep their scoring logic. They just don't need to know about CSS.

---

## Phase 8: Choreography Update (`choreography.ts`)

Stagger patterns, easing selection, and Disney principles (anticipation, follow-through) stay. Output changes from CSS composite animation strings to `FrameAnimation[]`.

### Current (v2):
```ts
// Returns CSS animation string
buildCompositeAnimation(entrance, scene) →
  'anticipate 100ms, fade-in-up 400ms 100ms, followthrough 200ms 500ms'
```

### New (v3):
```ts
// Returns additional FrameAnimation entries
buildCompositeAnimations(entrance, scene) → FrameAnimation[]
// Example: anticipation adds a small scale-down before the entrance
// Follow-through adds a small overshoot after
[
  { property: 'scale', startFrame: 0, endFrame: 6, values: [1, 0.95], easing: 'easeInQuad' },
  // ... entrance animations ...
  { property: 'y', startFrame: 24, endFrame: 30, values: [0, -3, 0], keyframes: [0, 0.5, 1], easing: 'easeOut' },
]
```

---

## Implementation Order

| Step | What | Files | Depends on | Est. complexity |
|------|------|-------|------------|-----------------|
| 1 | Interpolation engine | `interpolate.ts` (new) | nothing | Low — pure math |
| 2 | Animation library conversion | `actions.ts` | Step 1 | Medium — mechanical but 100+ animations |
| 3 | Timeline compiler | `timeline.ts` | Steps 1, 2 | Medium |
| 4 | Frame renderer generator | `frame-renderer.ts` (new) | Step 1 | Medium |
| 5 | HTML generator (static layout) | `html-generator.ts` | Step 4 | Medium — remove CSS anims, keep layout |
| 6 | Capture rewrite | `capture.ts` | Step 4 | Low — becomes trivial |
| 7 | Autogen rewrite | `autogen.ts` | Steps 3, 5 | Medium — simpler than current |
| 8 | Director update | `director.ts` | Step 2 | Low — same recipes, different output |
| 9 | Choreography update | `choreography.ts` | Steps 1, 2 | Medium |
| 10 | Config schema update | `config.ts` | Step 3 | Low |
| 11 | Timing update | `timing.ts` | nothing | Low — ms → frames |
| 12 | Index/orchestration update | `index.ts` | all above | Low |
| 13 | HTML parser simplify | `html-parser.ts` | Step 5 | Low |
| 14 | Composition update | `composition.ts` | Step 2 | Low — data definitions |
| 15 | SKILL.md update | SKILL.md | all above | Low |

**Critical path:** Steps 1 → 2 → 3 → 4 → 5 → 6 (core pipeline works end-to-end)
Steps 7-15 can proceed after the core pipeline is functional.

---

## Verification

After each step, we can verify:

1. **interpolate.ts** — Unit test: `interpolate(15, [0,30], [0,1]) === 0.5`
2. **actions.ts** — Spot-check: converted animation produces same visual curve as CSS original
3. **timeline.ts** — Compile a 3-scene screenplay, verify frame counts make sense
4. **frame-renderer.ts** — Load in browser, call `setFrame(0)`, `setFrame(30)`, verify DOM updates
5. **html-generator.ts** — Generate HTML, open in browser, verify layout renders (no animations yet)
6. **capture.ts** — Render a 3-scene test video, verify frames are correct
7. **Full pipeline** — Re-render the Claude Framework launch promo and compare with v2

---

## What this does NOT change

- Audio pipeline (selection, mixing, TTS, ducking)
- Demo mode (entirely separate pipeline)
- FFmpeg encoding (same pipe interface)
- Design system integration (tokens.css still read and applied)
- Guided flow in SKILL.md (Pre-production, Screenplay, Storyboard, Direction, Production)
- Format presets (resolutions, fps, codecs)

---

## Risk

| Risk | Mitigation |
|------|------------|
| 100+ animations to convert | Mechanical process, can batch. Structure is uniform. |
| Spring physics complexity | Well-documented algorithm (Remotion open source). |
| Performance of per-frame evaluate | Current capture already calls evaluate per frame. setFrame is lighter than getAnimations(). |
| Regression in working features | Keep v2 files alongside until v3 verified. Git branch. |
| Scope creep | Strict phase ordering. Each step is independently testable. |

# Orson v5 — Component Snippets Library

Copy-paste CSS patterns for video scenes. Adapt colors, sizes, and fonts to the project's design tokens.

> **All sizes below are VIDEO-SCALE minimums — NOT web sizes.** These must be legible at typical viewing distances (mobile in hand, desktop monitor, TV across room). See `html-contract.md` → "Video Scale Requirements" for the full minimum typography and component sizing tables.

---

## Hero Layouts

### Centered Hero
```css
.scene { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; }
.hero-title { font-size:140px; font-weight:700; letter-spacing:-0.04em; text-align:center; line-height:1.05; max-width:1400px; }
.hero-sub { font-size:32px; color:var(--dim); text-align:center; max-width:1000px; line-height:1.5; }
```
The title at 140px on 1920px wide ≈ 8-12 words fill 60%+ of viewport width. Subtitle `max-width:1000px` ensures readable line lengths without being a tiny strip.

### Split Hero (Text Left, Visual Right)
```css
.scene.split { flex-direction:row; padding:80px 120px; gap:100px; align-items:center; }
.split-left { flex:1; display:flex; flex-direction:column; justify-content:center; gap:36px; }
.split-right { flex:1; display:flex; align-items:center; justify-content:center; }
```
Note `padding:80px 120px` — top/bottom padding keeps content away from edges while vertical padding ensures the content zone spans most of the viewport height.

### Asymmetric Hero (60/40)
```css
.scene.asym { display:grid; grid-template-columns:3fr 2fr; padding:80px 100px; gap:80px; align-items:center; min-height:100%; }
```

---

## Feature Cards

### Horizontal Feature Row
```css
.features { display:flex; gap:48px; padding:60px 100px; }
.feature-card { flex:1; min-width:380px; padding:48px 40px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; backdrop-filter:blur(12px); display:flex; flex-direction:column; gap:20px; }
.feature-icon { font-size:52px; }
.feature-title { font-size:32px; font-weight:600; }
.feature-desc { font-size:24px; color:var(--dim); line-height:1.5; }
```

### Vertical Feature Stack (9:16)
```css
.features-stack { display:flex; flex-direction:column; gap:36px; padding:60px 60px; width:100%; }
.feature-card { padding:40px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:16px; }
```

### Feature Grid (2×2)
```css
.feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; padding:60px 100px; max-width:1600px; }
```

---

## Code Blocks

### Syntax-Highlighted Code
```css
.code-block { font-family:'JetBrains Mono',monospace; font-size:22px; line-height:1.7; color:var(--dim); background:rgba(0,0,0,0.4); padding:28px 32px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); }
.code-block .kw { color:#c4b5fd; }
.code-block .str { color:#a78bfa; }
.code-block .fn { color:#f0abfc; }
.code-block .num { color:#67e8f9; }
.code-block .cmt { color:#64748b; font-style:italic; }
```

### Terminal Block
```css
.terminal { background:#111827; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; }
.terminal-bar { height:36px; background:#1f2937; display:flex; align-items:center; padding:0 16px; gap:8px; }
.terminal-dot { width:12px; height:12px; border-radius:50%; }
.dot-r { background:#ef4444; } .dot-y { background:#eab308; } .dot-g { background:#22c55e; }
.terminal-body { padding:24px; font-family:'JetBrains Mono',monospace; font-size:20px; line-height:1.8; }
.terminal-prompt { color:#22c55e; }
.terminal-output { color:#94a3b8; }
```

---

## Comparison Layouts

### Before/After (Side by Side)
```css
.comparison { display:grid; grid-template-columns:1fr 1fr; gap:0; border-radius:20px; overflow:hidden; margin:0 80px; }
.compare-before { background:rgba(239,68,68,0.08); padding:56px 48px; }
.compare-after { background:rgba(34,197,94,0.08); padding:56px 48px; }
.compare-label { font-size:22px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:20px; }
```

### Before/After (Stacked, for 9:16)
```css
.comparison-stack { display:flex; flex-direction:column; gap:32px; padding:60px 56px; }
.compare-card { padding:40px; border-radius:16px; }
.compare-bad { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); }
.compare-good { background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.15); }
```

---

## Stats / Metrics

### Stat Row
```css
.stats { display:flex; gap:80px; justify-content:center; padding:60px 100px; }
.stat { text-align:center; min-width:220px; }
.stat-value { font-size:96px; font-weight:700; letter-spacing:-0.03em; }
.stat-label { font-size:22px; color:var(--dim); margin-top:12px; text-transform:uppercase; letter-spacing:0.1em; }
```
Stat values at 96px are visually dominant on a 1920px canvas. Below 72px, stats look timid.

### Stat Cards
```css
.stat-cards { display:flex; gap:40px; padding:60px 100px; }
.stat-card { flex:1; min-width:280px; padding:48px 40px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; text-align:center; }
```

---

## CTA Sections

### Centered CTA
```css
.cta-section { display:flex; flex-direction:column; align-items:center; gap:56px; }
.cta-title { font-size:96px; font-weight:700; text-align:center; letter-spacing:-0.03em; max-width:1300px; line-height:1.1; }
.cta-sub { font-size:28px; color:var(--dim); text-align:center; max-width:900px; }
.cta-button { display:inline-flex; align-items:center; gap:16px; font-size:26px; font-weight:600; background:linear-gradient(135deg,var(--accent),var(--accent-alt)); padding:24px 64px; border-radius:16px; box-shadow:0 0 40px rgba(var(--accent-rgb),0.4); }
```
CTA title at 96px with max-width 1300px fills the screen with authority. Button at 26px with generous padding (24px 64px) is clearly tappable even in a phone-sized video preview.

---

## Glassmorphism

### Glass Card
```css
.glass { background:rgba(255,255,255,0.08); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(255,255,255,0.15); border-radius:20px; padding:40px; }
```

---

## Browser / Phone Mockups

### Browser Frame
```css
.browser { border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); }
.browser-bar { height:48px; background:#1f2937; display:flex; align-items:center; padding:0 20px; gap:12px; border-bottom:1px solid rgba(255,255,255,0.05); }
.browser-dots { display:flex; gap:8px; }
.browser-dot { width:12px; height:12px; border-radius:50%; }
.browser-url { flex:1; background:rgba(255,255,255,0.05); border-radius:6px; padding:6px 12px; font-size:13px; color:var(--dim); }
.browser-content { padding:32px; min-height:300px; background:#111; }
```

### Phone Frame
```css
.phone { width:400px; /* 400px minimum — increase for split layouts */ border-radius:36px; border:3px solid #333; overflow:hidden; background:#111; }
.phone-notch { width:120px; height:24px; background:#333; border-radius:0 0 12px 12px; margin:0 auto; }
.phone-content { padding:20px; min-height:500px; }
.phone-home { width:120px; height:5px; background:#444; border-radius:3px; margin:12px auto; }
```

---

## Progress / Bars

### Animated Progress Bar
```css
.progress-bar { height:12px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden; }
.progress-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--accent),var(--accent-alt)); }
```

### Horizontal Bar Chart
```css
.bar-chart { display:flex; flex-direction:column; gap:16px; }
.bar-row { display:flex; align-items:center; gap:16px; }
.bar-label { font-size:20px; color:var(--dim); width:100px; text-align:right; }
.bar { height:36px; border-radius:8px; background:linear-gradient(90deg,var(--accent),var(--accent-alt)); }
```

---

## SVG Path Draw

Animated path drawing using `D()` — progressively reveals SVG paths via `strokeDashoffset`. Works with any `<path>`, `<circle>`, `<line>`, or `<polyline>` element.

### Curved Underline
```html
<svg viewBox="0 0 400 20" style="position:absolute;bottom:0;left:0;width:400px;height:20px;overflow:visible;">
  <path d="M 0 10 Q 100 0, 200 10 T 400 10" stroke="var(--accent)" fill="none"
        stroke-width="3" stroke-linecap="round" data-draw="s0-underline" />
</svg>
```
```javascript
D('[data-draw="s0-underline"]', 50, 40, 0, 1, 'outExpo');
```

### Connector Line (Between Elements)
```html
<svg viewBox="0 0 200 100" style="position:absolute;top:50%;left:25%;width:200px;height:100px;">
  <path d="M 0 0 C 50 0, 50 100, 200 100" stroke="rgba(255,255,255,0.3)" fill="none"
        stroke-width="2" stroke-dasharray="6 4" data-draw="s0-connector" />
</svg>
```
```javascript
D('[data-draw="s0-connector"]', 30, 50, 0, 1, 'outCubic');
```

### Shape Outline (Circle)
```html
<svg viewBox="0 0 200 200" style="width:200px;height:200px;">
  <circle cx="100" cy="100" r="90" stroke="var(--accent)" fill="none"
          stroke-width="2" data-draw="s0-circle" />
</svg>
```
```javascript
D('[data-draw="s0-circle"]', 20, 60, 0, 1, 'outCubic');
```

### Logo Draw-On
```html
<svg viewBox="0 0 300 100" style="width:300px;height:100px;">
  <path d="M 10 50 L 50 10 L 90 50 L 130 10 M 150 10 L 150 50 M 170 10 C 200 10, 200 50, 170 50"
        stroke="#fff" fill="none" stroke-width="3" stroke-linecap="round"
        stroke-linejoin="round" data-draw="s0-logo" />
</svg>
```
```javascript
D('[data-draw="s0-logo"]', 0, 50, 0, 1, 'outQuart');
```

---

## Background Patterns

### Dot Grid
```css
.bg-dots { position:absolute; inset:0; pointer-events:none; z-index:0; opacity:0.08; background-image:radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px); background-size:30px 30px; }
```

### Line Grid
```css
.bg-grid { position:absolute; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px); background-size:80px 80px; }
```

### Gradient Orb
```css
.orb { position:absolute; width:500px; height:500px; border-radius:50%; filter:blur(80px); opacity:0.25; pointer-events:none; z-index:0; }
.orb-purple { background:radial-gradient(circle,rgba(124,58,237,0.3),transparent 70%); }
.orb-pink { background:radial-gradient(circle,rgba(240,171,252,0.2),transparent 70%); }
```

### Vignette
```css
.vignette { position:absolute; inset:0; pointer-events:none; z-index:0; background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.5) 100%); }
```

---

## Badges / Pills

```css
.badge { font-size:20px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:var(--accent); background:rgba(var(--accent-rgb),0.12); padding:14px 36px; border-radius:100px; border:1px solid rgba(var(--accent-rgb),0.25); }
```

---

## Camera Wrapper

Wraps scene content for camera motion simulation (push-in, pull-out, pan, drift). Animated via `A()` calls on the `data-el` attribute.

```html
<div class="scene" id="scene-0">
  <div class="cam" data-el="s0-cam" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">
    <!-- all scene content goes inside the cam wrapper -->
  </div>
</div>
```

```javascript
// Slow push-in over entire scene
A('[data-el="s0-cam"]', 'scale', 0, totalFrames, 1, 1.06, 'inOutSine')
// Pan left
A('[data-el="s0-cam"]', 'x', 0, totalFrames, 0, -30, 'inOutSine')
// Drift (combine x + y + scale)
A('[data-el="s0-cam"]', 'x', 0, totalFrames, 0, 10, 'inOutSine')
A('[data-el="s0-cam"]', 'y', 0, totalFrames, 0, -8, 'inOutSine')
A('[data-el="s0-cam"]', 'scale', 0, totalFrames, 1, 1.02, 'inOutSine')
```

The `overflow:hidden` on the cam div prevents edge reveal during pans and scale-outs.

---

## Format-Specific Tips

| Format | Viewport | Layout Notes | Min headline |
|--------|----------|-------------|-------------|
| 16:9 (1920×1080) | Wide | Split layouts work great. 100-120px side padding. Content zone: 80% of width. | 80px |
| 9:16 (1080×1920) | Tall | Stack vertically. 60px side padding. Larger text. | 96px |
| 1:1 (1080×1080) | Square | Centered layouts. 48-60px padding. | 72px |
| 4:5 (1080×1350) | Tall-ish | Mix vertical/centered. 56px padding. | 80px |
| 4:3 (1440×1080) | Classic | Similar to 16:9 but less side space. 80px padding. | 72px |
| 21:9 (2560×1080) | Ultra-wide | Lots of horizontal space. Split layouts shine. 200px padding. | 96px |

**Remember:** These are MINIMUM values. On a 1920px canvas, a 80px headline is modest — 120-160px is the impactful range for hero/CTA scenes.

---

## CSS Ambient Effects

### Animated Gradient Text
Moving gradient on headlines for premium feel. Requires `amb-gradient-text` keyframe (included in `getDecorativeKeyframes()`).
```css
.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: amb-gradient-text 4s ease-in-out infinite alternate;
}
```

### Glassmorphism Card
Frosted glass card with pulsing luminous border.
```css
.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  animation: amb-border-glow 3s ease-in-out infinite;
}
```

### Shimmer Button
CTA with a light streak sweeping across. Use on primary action buttons for premium feel.
```css
.shimmer-btn {
  position: relative;
  overflow: hidden;
}
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: amb-shine 2.5s ease-in-out infinite;
}
```

### Stagger Animation Delay
For CSS entrance animations on lists/grids. Generate dynamically based on child count.
```css
[data-stagger] > *:nth-child(1) { animation-delay: 0s; }
[data-stagger] > *:nth-child(2) { animation-delay: 0.1s; }
[data-stagger] > *:nth-child(3) { animation-delay: 0.2s; }
[data-stagger] > *:nth-child(4) { animation-delay: 0.3s; }
[data-stagger] > *:nth-child(5) { animation-delay: 0.4s; }
[data-stagger] > *:nth-child(6) { animation-delay: 0.5s; }
```

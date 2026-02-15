# Orson v5 — Component Snippets Library

Copy-paste CSS patterns for video scenes. Adapt colors, sizes, and fonts to the project's design tokens.

---

## Hero Layouts

### Centered Hero
```css
.scene { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; }
.hero-title { font-size:120px; font-weight:700; letter-spacing:-0.04em; text-align:center; line-height:1.05; }
.hero-sub { font-size:28px; color:var(--dim); text-align:center; max-width:700px; }
```

### Split Hero (Text Left, Visual Right)
```css
.scene.split { flex-direction:row; padding:0 120px; gap:100px; }
.split-left { flex:1; display:flex; flex-direction:column; justify-content:center; gap:28px; }
.split-right { flex:1; display:flex; align-items:center; justify-content:center; }
```

### Asymmetric Hero (60/40)
```css
.scene.asym { display:grid; grid-template-columns:3fr 2fr; padding:0 80px; gap:80px; align-items:center; }
```

---

## Feature Cards

### Horizontal Feature Row
```css
.features { display:flex; gap:48px; padding:0 80px; }
.feature-card { flex:1; padding:40px 32px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; backdrop-filter:blur(12px); display:flex; flex-direction:column; gap:16px; }
.feature-icon { font-size:48px; }
.feature-title { font-size:22px; font-weight:600; }
.feature-desc { font-size:17px; color:var(--dim); line-height:1.5; }
```

### Vertical Feature Stack (9:16)
```css
.features-stack { display:flex; flex-direction:column; gap:32px; padding:0 60px; width:100%; }
.feature-card { padding:32px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:16px; }
```

### Feature Grid (2×2)
```css
.feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; padding:0 80px; max-width:1400px; }
```

---

## Code Blocks

### Syntax-Highlighted Code
```css
.code-block { font-family:'JetBrains Mono',monospace; font-size:17px; line-height:1.7; color:var(--dim); background:rgba(0,0,0,0.4); padding:28px 32px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); }
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
.terminal-body { padding:24px; font-family:'JetBrains Mono',monospace; font-size:15px; line-height:1.8; }
.terminal-prompt { color:#22c55e; }
.terminal-output { color:#94a3b8; }
```

---

## Comparison Layouts

### Before/After (Side by Side)
```css
.comparison { display:grid; grid-template-columns:1fr 1fr; gap:0; border-radius:20px; overflow:hidden; }
.compare-before { background:rgba(239,68,68,0.08); padding:40px; }
.compare-after { background:rgba(34,197,94,0.08); padding:40px; }
.compare-label { font-size:14px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px; }
```

### Before/After (Stacked, for 9:16)
```css
.comparison-stack { display:flex; flex-direction:column; gap:24px; padding:0 48px; }
.compare-card { padding:32px; border-radius:16px; }
.compare-bad { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); }
.compare-good { background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.15); }
```

---

## Stats / Metrics

### Stat Row
```css
.stats { display:flex; gap:60px; justify-content:center; }
.stat { text-align:center; }
.stat-value { font-size:72px; font-weight:700; letter-spacing:-0.03em; }
.stat-label { font-size:18px; color:var(--dim); margin-top:8px; }
```

### Stat Cards
```css
.stat-cards { display:flex; gap:32px; }
.stat-card { flex:1; padding:32px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; text-align:center; }
```

---

## CTA Sections

### Centered CTA
```css
.cta-section { display:flex; flex-direction:column; align-items:center; gap:48px; }
.cta-title { font-size:80px; font-weight:700; text-align:center; letter-spacing:-0.03em; }
.cta-sub { font-size:26px; color:var(--dim); text-align:center; }
.cta-button { display:inline-flex; align-items:center; gap:12px; font-size:22px; font-weight:600; background:linear-gradient(135deg,var(--accent),var(--accent-alt)); padding:20px 48px; border-radius:16px; box-shadow:0 0 40px rgba(var(--accent-rgb),0.4); }
```

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
.phone { width:320px; border-radius:36px; border:3px solid #333; overflow:hidden; background:#111; }
.phone-notch { width:120px; height:24px; background:#333; border-radius:0 0 12px 12px; margin:0 auto; }
.phone-content { padding:20px; min-height:500px; }
.phone-home { width:120px; height:5px; background:#444; border-radius:3px; margin:12px auto; }
```

---

## Progress / Bars

### Animated Progress Bar
```css
.progress-bar { height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden; }
.progress-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--accent),var(--accent-alt)); }
```

### Horizontal Bar Chart
```css
.bar-chart { display:flex; flex-direction:column; gap:16px; }
.bar-row { display:flex; align-items:center; gap:16px; }
.bar-label { font-size:14px; color:var(--dim); width:100px; text-align:right; }
.bar { height:36px; border-radius:8px; background:linear-gradient(90deg,var(--accent),var(--accent-alt)); }
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
.badge { font-size:14px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:var(--accent); background:rgba(var(--accent-rgb),0.12); padding:8px 24px; border-radius:100px; border:1px solid rgba(var(--accent-rgb),0.25); }
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

| Format | Viewport | Layout Notes |
|--------|----------|-------------|
| 16:9 (1920×1080) | Wide | Split layouts work great. 120px side padding. |
| 9:16 (1080×1920) | Tall | Stack everything vertically. 60px side padding. Larger text (headline 80px+). |
| 1:1 (1080×1080) | Square | Centered layouts. Compact elements. 48px padding. |
| 4:5 (1080×1350) | Tall-ish | Mix of vertical stacking and centered. 56px padding. |
| 4:3 (1440×1080) | Classic | Similar to 16:9 but less side space. 80px padding. |
| 21:9 (2560×1080) | Ultra-wide | Lots of horizontal space. Split layouts shine. 200px padding. |

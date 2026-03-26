# Visual Styles Reference

Complete definitions for all 11 visual styles supported by Seurat.

---

## 1. Flat

### Philosophy
Eliminate decoration. Let content hierarchy do the work. Every element earns its place through function, not ornament. Inspired by Swiss design and the International Typographic Style.

### Token Overrides
```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 2px 4px rgba(0,0,0,0.08);
--shadow-lg: 0 4px 8px rgba(0,0,0,0.1);
--motion-duration: 150ms;
--motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
--border-width: 1px;
```

### CSS Patterns
```css
/* Card */
.card {
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

/* Button */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-weight: 500;
  transition: background var(--motion-duration) var(--motion-easing);
}
.btn-primary:hover { background: var(--color-primary-600); }
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Input */
.input {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--motion-duration) var(--motion-easing);
}
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
```

### When to Use
- SaaS dashboards, admin panels, data-heavy applications
- Products prioritizing clarity and information density
- Teams wanting a low-maintenance, timeless design

### When to Avoid
- Brands needing strong visual personality
- Consumer products competing on delight
- Marketing sites where emotion drives conversion

---

## 2. Brutalism

### Philosophy
Reject polish. Embrace raw structure. Show the construction. Typography is architecture, not decoration. Borders are statements. Default styles are valid styles.

### Token Overrides
```css
--radius-sm: 0;
--radius-md: 0;
--radius-lg: 0;
--shadow-sm: none;
--shadow-md: none;
--shadow-lg: 4px 4px 0 var(--color-neutral-900);
--motion-duration: 0ms;
--motion-easing: steps(1);
--border-width: 2px;
--font-heading: 'Courier New', 'SF Mono', monospace;
```

### CSS Patterns
```css
/* Card */
.card {
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-neutral-900);
  padding: var(--space-4);
}

/* Button */
.btn-primary {
  background: var(--color-neutral-900);
  color: var(--color-neutral-50);
  border: var(--border-width) solid var(--color-neutral-900);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}
.btn-primary:hover {
  background: var(--color-primary);
  color: var(--color-neutral-900);
}
.btn-primary:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Offset shadow on interactive elements */
.interactive {
  box-shadow: var(--shadow-lg);
  transition: transform 0ms;
}
.interactive:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

### When to Use
- Creative agencies, art portfolios, experimental projects
- Brands that want to stand out through rawness
- Projects where "designed" means "intentionally unpolished"

### When to Avoid
- Enterprise or B2B where trust signals matter
- Accessibility-critical contexts (brutalist motion can be jarring)
- Elderly or non-tech-savvy audiences

---

## 3. Neumorphism

### Philosophy
Soft extrusion from the background. Elements appear pressed into or raised from the surface. Subtle light and shadow create depth without hard edges. Requires a single-hue background.

### Token Overrides
```css
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 24px;
--shadow-raised: 6px 6px 12px var(--color-shadow-dark), -6px -6px 12px var(--color-shadow-light);
--shadow-inset: inset 4px 4px 8px var(--color-shadow-dark), inset -4px -4px 8px var(--color-shadow-light);
--shadow-flat: none;
--color-shadow-dark: rgba(0,0,0,0.15);
--color-shadow-light: rgba(255,255,255,0.8);
--motion-duration: 250ms;
--motion-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
--border-width: 0;
```

### CSS Patterns
```css
body { background: var(--color-neutral-200); }

/* Card */
.card {
  background: var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-raised);
  padding: var(--space-5);
}

/* Button */
.btn-primary {
  background: var(--color-neutral-200);
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-raised);
  padding: var(--space-2) var(--space-4);
  font-weight: 600;
  transition: box-shadow var(--motion-duration) var(--motion-easing);
}
.btn-primary:hover { box-shadow: var(--shadow-inset); }
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* Toggle */
.toggle-track {
  background: var(--color-neutral-200);
  box-shadow: var(--shadow-inset);
  border-radius: 999px;
  width: 48px; height: 24px;
}
.toggle-thumb {
  background: var(--color-neutral-200);
  box-shadow: var(--shadow-raised);
  border-radius: 50%;
  width: 20px; height: 20px;
}
```

### When to Use
- Dashboard widgets, music players, wellness apps
- Interfaces where calm, unified background is desirable
- Small component sets (cards, toggles, sliders)

### When to Avoid
- Text-heavy pages (contrast can be poor)
- Complex UIs with many nested elements (shadows stack badly)
- High-contrast accessibility requirements (shadows are subtle)

### Accessibility Warning
Neumorphism has inherent contrast challenges. Always verify text contrast meets 4.5:1 minimum. Use color (not just shadow) to differentiate interactive elements from static ones.

---

## 4. Skeuomorphism

### Philosophy
Mirror real-world objects. A button should look pressable. A slider should look grabbable. Textures, gradients, and lighting simulate physical materials. Users transfer physical-world knowledge to the interface.

### Token Overrides
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--shadow-sm: 0 1px 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
--shadow-md: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
--shadow-lg: 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15);
--motion-duration: 200ms;
--motion-easing: cubic-bezier(0.4, 0, 0.6, 1);
--border-width: 1px;
--gradient-highlight: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%);
```

### CSS Patterns
```css
/* Button - looks like a physical button */
.btn-primary {
  background: linear-gradient(180deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
  color: var(--color-on-primary);
  border: 1px solid var(--color-primary-700);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-2) var(--space-4);
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}
.btn-primary:active {
  background: linear-gradient(180deg, var(--color-primary-600) 0%, var(--color-primary-400) 100%);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary-300);
  outline-offset: 2px;
}

/* Card - paper on desk */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1);
  padding: var(--space-4);
}

/* Input - recessed field */
.input {
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-400);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  padding: var(--space-2) var(--space-3);
}
```

### When to Use
- Educational tools (physical metaphors aid learning)
- Nostalgia-driven products (retro apps, games)
- Audiences less familiar with flat UI conventions

### When to Avoid
- Modern SaaS (feels outdated to tech-savvy users)
- Data-dense interfaces (textures add visual noise)
- Performance-constrained environments (gradients cost render time)

---

## 5. Spatial

### Philosophy
Create depth through layered planes. UI exists in a 3D-like space with foreground, midground, and background. Elements have z-axis relationships. Inspired by XR interfaces and Apple Vision Pro.

### Token Overrides
```css
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 24px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
--shadow-md: 0 8px 24px rgba(0,0,0,0.12);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.16);
--shadow-xl: 0 24px 64px rgba(0,0,0,0.2);
--motion-duration: 350ms;
--motion-easing: cubic-bezier(0.2, 0, 0, 1);
--backdrop-blur: 20px;
--layer-gap: 8px;
```

### CSS Patterns
```css
/* Layered card */
.card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(var(--backdrop-blur));
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  transform: translateZ(0); /* force layer */
}

/* Elevated panel */
.panel-foreground {
  box-shadow: var(--shadow-xl);
  transform: scale(1.02);
  z-index: 10;
}
.panel-background {
  box-shadow: var(--shadow-sm);
  transform: scale(0.98);
  opacity: 0.8;
  z-index: 1;
}

/* Parallax scroll effect */
@media (prefers-reduced-motion: no-preference) {
  .parallax-layer-back { transform: translateZ(-2px) scale(3); }
  .parallax-layer-mid { transform: translateZ(-1px) scale(2); }
  .parallax-layer-front { transform: translateZ(0); }
}
@media (prefers-reduced-motion: reduce) {
  .parallax-layer-back,
  .parallax-layer-mid,
  .parallax-layer-front { transform: none; }
}
```

### When to Use
- Immersive experiences, XR-adjacent interfaces
- Media applications with rich visual content
- Products wanting a "premium" layered feel

### When to Avoid
- Low-end devices (backdrop-filter is expensive)
- Text-heavy informational sites
- Browsers without backdrop-filter support (provide fallback)

---

## 6. Y2K

### Philosophy
Early-2000s internet nostalgia. Bright gradients, pixel aesthetics, star bursts, chrome effects, and digital optimism. Technology as exciting and fun, not minimized.

### Token Overrides
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--shadow-sm: 0 0 8px rgba(0, 150, 255, 0.3);
--shadow-md: 0 0 16px rgba(255, 0, 150, 0.3);
--shadow-lg: 0 0 24px rgba(150, 0, 255, 0.4);
--motion-duration: 300ms;
--motion-easing: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* bounce */
--border-width: 2px;
--gradient-primary: linear-gradient(135deg, #ff00ff, #00ffff);
--gradient-secondary: linear-gradient(135deg, #ff6600, #ffff00);
--font-heading: 'Impact', 'Arial Black', sans-serif;
```

### CSS Patterns
```css
/* Gradient text */
.heading-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-heading);
}

/* Chrome button */
.btn-primary {
  background: linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 45%, #c0c0c0 55%, #808080 100%);
  border: 2px solid #606060;
  border-radius: var(--radius-md);
  color: var(--color-neutral-900);
  padding: var(--space-2) var(--space-4);
  font-weight: 700;
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
}
.btn-primary:hover {
  background: var(--gradient-primary);
  color: white;
  border-color: #ff00ff;
  box-shadow: var(--shadow-md);
}

/* Star burst decorative element */
.starburst {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%,
    79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  background: var(--gradient-secondary);
}

/* Glow card */
.card {
  background: rgba(0, 0, 20, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
  color: white;
}
```

### When to Use
- Youth-oriented brands, entertainment, gaming
- Nostalgia products, retro themes
- Short-lived campaigns where fun > usability

### When to Avoid
- Professional/enterprise contexts
- Accessibility-critical applications (neon colors challenge contrast)
- Long-form reading

### Accessibility Warning
Y2K's neon palette makes contrast compliance difficult. Always test every text/background pair. Provide a high-contrast mode toggle.

---

## 7. Glassmorphism

### Philosophy
Frosted glass over vibrant backgrounds. Transparency reveals context. The background is part of the design, not hidden by it. Blur creates hierarchy without hard separation.

### Token Overrides
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
--shadow-md: 0 8px 32px rgba(0,0,0,0.12);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.15);
--motion-duration: 250ms;
--motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
--backdrop-blur: 16px;
--glass-bg-light: rgba(255, 255, 255, 0.25);
--glass-bg-dark: rgba(0, 0, 0, 0.25);
--glass-border: rgba(255, 255, 255, 0.18);
```

### CSS Patterns
```css
/* Glass card */
.card {
  background: var(--glass-bg-light);
  backdrop-filter: blur(var(--backdrop-blur));
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
}

/* Glass navbar */
.navbar {
  background: var(--glass-bg-light);
  backdrop-filter: blur(var(--backdrop-blur));
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Ensure text readability over glass */
.glass-text {
  color: var(--color-neutral-900);
  text-shadow: 0 1px 2px rgba(255,255,255,0.3);
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  .card { background: var(--glass-bg-dark); }
  .glass-text {
    color: var(--color-neutral-50);
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
}
```

### When to Use
- Media-rich pages where background imagery matters
- Modal overlays, dropdowns, floating panels
- Premium / luxury brand feel

### When to Avoid
- Text-heavy pages (readability over glass is fragile)
- Highly dynamic backgrounds (blur recalculates)
- Older browsers or low-power devices

### Accessibility Warning
Glass surfaces make text contrast dependent on the background content. Always add a semi-opaque background layer thick enough to guarantee 4.5:1 contrast regardless of what is behind the glass.

---

## 8. Claymorphism

### Philosophy
Soft, pillowy 3D. Elements look like they are made of moldable clay -- rounded, puffy, with colored inner shadows. Friendly and approachable. Inspired by 3D illustration trends.

### Token Overrides
```css
--radius-sm: 12px;
--radius-md: 20px;
--radius-lg: 32px;
--shadow-clay: 8px 8px 16px rgba(0,0,0,0.12),
              inset -4px -4px 8px rgba(0,0,0,0.05),
              inset 4px 4px 8px rgba(255,255,255,0.4);
--shadow-clay-sm: 4px 4px 8px rgba(0,0,0,0.1),
                  inset -2px -2px 4px rgba(0,0,0,0.04),
                  inset 2px 2px 4px rgba(255,255,255,0.3);
--motion-duration: 350ms;
--motion-easing: cubic-bezier(0.34, 1.56, 0.64, 1); /* spring */
--border-width: 0;
```

### CSS Patterns
```css
body { background: var(--color-neutral-100); }

/* Clay card */
.card {
  background: var(--color-primary-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-clay);
  padding: var(--space-5);
}

/* Clay button */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-clay-sm);
  padding: var(--space-2) var(--space-5);
  font-weight: 600;
  transition: transform var(--motion-duration) var(--motion-easing);
}
.btn-primary:hover {
  transform: translateY(-2px);
}
.btn-primary:active {
  transform: translateY(1px);
  box-shadow: inset 2px 2px 4px rgba(0,0,0,0.15);
}

/* Clay input */
.input {
  background: white;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.08),
              inset -3px -3px 6px rgba(255,255,255,0.6);
  padding: var(--space-3) var(--space-4);
}
```

### When to Use
- Children-oriented apps, educational platforms
- Onboarding flows, empty states
- Friendly SaaS wanting to feel approachable

### When to Avoid
- Data-dense interfaces (softness fights information density)
- Serious/professional contexts (finance, legal, medical)
- Performance-constrained environments (multiple shadows)

---

## 9. Material

### Philosophy
Paper and ink in digital space. Physical metaphor of stacked paper sheets with realistic shadows. Motion is responsive and natural. Developed by Google, proven at massive scale.

### Token Overrides
```css
--radius-sm: 4px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-full: 9999px;
--shadow-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
--shadow-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
--shadow-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
--shadow-4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
--motion-duration-short: 150ms;
--motion-duration-medium: 250ms;
--motion-duration-long: 375ms;
--motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--motion-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--motion-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### CSS Patterns
```css
/* FAB (Floating Action Button) */
.fab {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-full);
  width: 56px; height: 56px;
  box-shadow: var(--shadow-2);
  transition: box-shadow var(--motion-duration-short) var(--motion-easing-standard);
}
.fab:hover { box-shadow: var(--shadow-3); }
.fab:active { box-shadow: var(--shadow-4); }

/* Card */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

/* Ripple effect */
.ripple {
  position: relative;
  overflow: hidden;
}
.ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0,0,0,0.12) 10%, transparent 10%);
  background-size: 1000% 1000%;
  background-position: center;
  opacity: 0;
  transition: background-size 0.5s, opacity 0.3s;
}
.ripple:active::after {
  background-size: 0% 0%;
  opacity: 1;
  transition: 0s;
}

/* App Bar */
.app-bar {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-2);
  height: 56px;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
}
```

### When to Use
- Enterprise applications, Android ecosystem
- Complex apps needing established patterns
- Teams wanting a well-documented component library

### When to Avoid
- Brands wanting unique visual identity (Material is recognizable)
- iOS-primary apps (users expect HIG patterns)
- Projects wanting to feel premium/exclusive

---

## 10. Bento Grid

### Philosophy
Information as a grid of distinct, self-contained cards. Inspired by Japanese bento boxes -- each cell holds something different but the whole is harmonious. Asymmetric grids create visual interest.

### Token Overrides
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.1);
--motion-duration: 300ms;
--motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
--grid-gap: var(--space-4);
--border-width: 1px;
```

### CSS Patterns
```css
/* Bento grid container */
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: var(--grid-gap);
  padding: var(--grid-gap);
}

/* Cell variants */
.bento-1x1 { grid-column: span 1; grid-row: span 1; }
.bento-2x1 { grid-column: span 2; grid-row: span 1; }
.bento-1x2 { grid-column: span 1; grid-row: span 2; }
.bento-2x2 { grid-column: span 2; grid-row: span 2; }

/* Bento cell */
.bento-cell {
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  overflow: hidden;
  transition: transform var(--motion-duration) var(--motion-easing);
}
.bento-cell:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Staggered animation on load */
@media (prefers-reduced-motion: no-preference) {
  .bento-cell { animation: bento-in 0.4s ease-out both; }
  .bento-cell:nth-child(1) { animation-delay: 0ms; }
  .bento-cell:nth-child(2) { animation-delay: 60ms; }
  .bento-cell:nth-child(3) { animation-delay: 120ms; }
  .bento-cell:nth-child(4) { animation-delay: 180ms; }
  .bento-cell:nth-child(5) { animation-delay: 240ms; }
  .bento-cell:nth-child(6) { animation-delay: 300ms; }
}
@keyframes bento-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive: collapse to 2 columns on tablet, 1 on mobile */
@media (max-width: 1024px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .bento-2x2 { grid-column: span 2; }
}
@media (max-width: 640px) {
  .bento { grid-template-columns: 1fr; }
  .bento-2x1, .bento-2x2 { grid-column: span 1; }
}
```

### When to Use
- Feature showcases, portfolios, marketing pages
- Dashboard overviews with diverse content types
- Landing pages wanting visual variety without chaos

### When to Avoid
- Sequential content (articles, forms, wizards)
- Dense data tables
- Content that requires a clear reading order (grids are non-linear)

---

## 11. Gen-Z

### Philosophy
Expressive, bold, and unapologetic. Mix serif and sans-serif freely. Pill shapes and blobs. Gradients everywhere. Anti-corporate, pro-personality. Rules exist to be bent (not broken).

### Token Overrides
```css
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 9999px; /* pill */
--shadow-sm: none;
--shadow-md: 0 4px 16px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
--motion-duration: 400ms;
--motion-easing: cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy */
--border-width: 2px;
--gradient-primary: linear-gradient(135deg, var(--color-primary), var(--color-accent));
--font-heading: 'Playfair Display', Georgia, serif;
--font-body: 'Inter', -apple-system, sans-serif;
--font-accent: 'Space Grotesk', sans-serif;
```

### CSS Patterns
```css
/* Mixed typography */
h1 {
  font-family: var(--font-heading);
  font-size: var(--text-5xl);
  font-style: italic;
  line-height: 1.1;
}
h1 span.highlight {
  font-family: var(--font-accent);
  font-style: normal;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Pill button */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-accent);
  font-weight: 500;
  transition: transform var(--motion-duration) var(--motion-easing);
}
.btn-primary:hover {
  transform: scale(1.05) rotate(-1deg);
}
.btn-primary:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* Blob decorative shape */
.blob {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  background: var(--gradient-primary);
  opacity: 0.15;
  position: absolute;
  filter: blur(40px);
  z-index: -1;
}

/* Sticker/badge */
.sticker {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-accent-100);
  color: var(--color-accent-700);
  border: var(--border-width) solid var(--color-accent-300);
  border-radius: var(--radius-lg);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  transform: rotate(-2deg);
}

/* Marquee scroll for social proof */
@media (prefers-reduced-motion: no-preference) {
  .marquee { animation: scroll 20s linear infinite; }
}
@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

### When to Use
- Social platforms, creator tools, lifestyle brands
- Youth-oriented marketing, Gen-Z/Gen-Alpha audiences
- Products where personality is a competitive advantage

### When to Avoid
- Enterprise B2B, banking, healthcare
- Information-dense applications
- Audiences over 40 (style reads as chaotic, not expressive)

---

## Style Combination Guidelines

Styles can be combined in limited ways:

| Base Style | Compatible accents |
|------------|-------------------|
| Flat | Bento Grid, Material |
| Glassmorphism | Spatial, Bento Grid |
| Material | Flat, Bento Grid |
| Gen-Z | Glassmorphism, Bento Grid |
| Bento Grid | Any (it is a layout pattern, not a surface treatment) |

**Rule:** Never combine more than 2 styles. The base style covers 80%+ of the interface. The accent style is used for specific sections or components.

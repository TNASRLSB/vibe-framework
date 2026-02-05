# Motion Tokens for Web

CSS animation and transition patterns for web UI. Consistent motion creates personality.

**Reference:** `.claude/docs/visual-composition-principles.md` §10 for shared motion theory.

---

## Easing Curves

Never use `linear` for UI motion. Every animation needs a curve.

```css
:root {
  /* Standard — smooth state changes */
  --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);

  /* Entrance — element arrives, decelerates into place */
  --ease-entrance: cubic-bezier(0.0, 0.0, 0.2, 1);

  /* Exit — element leaves, accelerates away */
  --ease-exit: cubic-bezier(0.4, 0.0, 1, 1);

  /* Spring — overshoot + settle, playful */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Snap — sharp decelerate, authoritative */
  --ease-snap: cubic-bezier(0.0, 0.0, 0.1, 1);
}
```

### When to Use Which

| Easing | Use for | Feel |
|--------|---------|------|
| `--ease-entrance` | Elements appearing (fade in, slide in) | Confident, natural |
| `--ease-exit` | Elements disappearing (fade out, slide out) | Clean departure |
| `--ease-standard` | State changes (color, size, position) | Smooth, professional |
| `--ease-spring` | Toggles, notifications, playful interactions | Energetic, fun |
| `--ease-snap` | Dropdowns, tooltips, quick reveals | Immediate, precise |

---

## Duration Scale

```css
:root {
  /* Micro — color change, opacity, focus ring */
  --duration-micro: 100ms;

  /* Small — button press, icon swap, toggle */
  --duration-small: 200ms;

  /* Medium — card entrance, panel slide, tab switch */
  --duration-medium: 300ms;

  /* Large — modal open, page transition, accordion */
  --duration-large: 500ms;

  /* Dramatic — hero entrance, onboarding step */
  --duration-dramatic: 800ms;
}
```

### Rules

1. **Shorter = closer**: Elements near the trigger point animate faster.
2. **Longer = farther**: Elements far from the trigger animate slower.
3. **Larger = slower**: Big elements need more time to feel natural.
4. **Never > 1000ms**: Anything over 1 second feels sluggish for UI.

---

## Transition Patterns

### Hover

```css
.interactive {
  transition: all var(--duration-small) var(--ease-standard);
}

/* Button hover */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Card hover */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* Link hover */
.link:hover {
  color: var(--color-accent);
}
```

### Focus

```css
.focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  transition: outline-offset var(--duration-micro) var(--ease-snap);
}
```

### State Changes

```css
/* Toggle */
.toggle-track {
  transition: background var(--duration-small) var(--ease-standard);
}
.toggle-thumb {
  transition: transform var(--duration-small) var(--ease-spring);
}

/* Accordion */
.accordion-content {
  transition: max-height var(--duration-large) var(--ease-standard),
              opacity var(--duration-medium) var(--ease-standard);
}

/* Tab panel */
.tab-panel {
  transition: opacity var(--duration-medium) var(--ease-entrance);
}
```

---

## Scroll-Triggered Animations

### Fade In Up (baseline scroll animation)

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--duration-large) var(--ease-entrance),
              transform var(--duration-large) var(--ease-entrance);
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Stagger for Lists

```css
.stagger-list > * {
  opacity: 0;
  transform: translateY(15px);
  transition: opacity var(--duration-medium) var(--ease-entrance),
              transform var(--duration-medium) var(--ease-entrance);
}

.stagger-list.visible > *:nth-child(1) { transition-delay: 0ms; }
.stagger-list.visible > *:nth-child(2) { transition-delay: 75ms; }
.stagger-list.visible > *:nth-child(3) { transition-delay: 150ms; }
.stagger-list.visible > *:nth-child(4) { transition-delay: 225ms; }
.stagger-list.visible > *:nth-child(5) { transition-delay: 300ms; }
.stagger-list.visible > *:nth-child(6) { transition-delay: 375ms; }

.stagger-list.visible > * {
  opacity: 1;
  transform: translateY(0);
}
```

### Scale Reveal (for cards, images)

```css
.scale-reveal {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--duration-large) var(--ease-entrance),
              transform var(--duration-large) var(--ease-entrance);
}

.scale-reveal.visible {
  opacity: 1;
  transform: scale(1);
}
```

---

## Page Load Sequence

Elements animate in order of hierarchy on page load:

```
Time:  0ms    100ms    200ms    300ms    400ms    500ms
       │       │        │        │        │        │
       Nav ────┘        │        │        │        │
              Hero ─────┘        │        │        │
                    Subheading ──┘        │        │
                           CTA ───────────┘        │
                                   Below fold ─────┘
```

```css
/* Page load stagger — applied via JS after DOM ready */
.page-load-1 { animation: fadeInUp 500ms var(--ease-entrance) 100ms both; }
.page-load-2 { animation: fadeInUp 500ms var(--ease-entrance) 200ms both; }
.page-load-3 { animation: fadeInUp 500ms var(--ease-entrance) 300ms both; }
.page-load-4 { animation: fadeInUp 500ms var(--ease-entrance) 400ms both; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Micro-Interactions

### Button Press

```css
.btn:active {
  transform: scale(0.97);
  transition: transform var(--duration-micro) var(--ease-snap);
}
```

### Checkbox Toggle

```css
.checkbox-mark {
  transform: scale(0);
  transition: transform var(--duration-small) var(--ease-spring);
}
.checkbox:checked + .checkbox-mark {
  transform: scale(1);
}
```

### Notification Enter

```css
@keyframes notificationIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification {
  animation: notificationIn var(--duration-medium) var(--ease-spring);
}
```

### Skeleton Loading

```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    rgba(255,255,255,0.08) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

---

## Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Motion Anti-Patterns

| Anti-pattern | Why it fails | Fix |
|-------------|-------------|-----|
| Linear easing | Robotic, unnatural | Use appropriate curve |
| Duration > 1000ms | Feels sluggish, user waits | Max 800ms for UI |
| Everything animates at once | Overwhelming, no focus | Stagger with 50-100ms delays |
| Bounce on serious UI | Unprofessional (banking, healthcare) | Use `--ease-entrance` instead |
| No `prefers-reduced-motion` | Accessibility violation | Always include media query |
| Animation on scroll without threshold | Triggers too early/often | Use `IntersectionObserver` with 20% threshold |

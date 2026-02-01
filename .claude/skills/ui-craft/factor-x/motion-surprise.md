# Factor X: Motion Surprise

Animazioni inaspettate in contesti altrimenti statici che creano delight e memorabilità.

---

## Concept

La maggior parte delle interfacce sono statiche o hanno animazioni prevedibili (fade in, slide up). La Motion Surprise introduce movimento inaspettato che cattura l'attenzione senza distrarre.

---

## Variazioni

### 1. Micro-interaction Unexpected

**Dove**: Hover/click su elementi comuni con risposta inattesa

```css
/* Standard hover */
.button:hover {
  background: var(--primary-dark);
}

/* Factor X: Unexpected micro-interaction */
.button-surprise:hover {
  animation: wiggle 0.3s ease;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

/* Squish effect */
.button-squish:active {
  animation: squish 0.2s ease;
}

@keyframes squish {
  0% { transform: scale(1); }
  50% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1); }
}

/* Bounce on hover */
.icon-bounce:hover {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

**Funziona con**: Claymorphism, Gen-Z, D2C brands
**Evitare con**: Enterprise, B2B formale

### 2. Scroll-Triggered Surprise

**Dove**: Elementi che si animano in modo inaspettato al scroll

```css
/* Factor X: Scroll surprise */
.reveal-rotate {
  opacity: 0;
  transform: rotate(-10deg) translateY(40px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-rotate.visible {
  opacity: 1;
  transform: rotate(0) translateY(0);
}

/* Stagger from sides */
.reveal-left {
  transform: translateX(-100px) rotate(5deg);
}

.reveal-right {
  transform: translateX(100px) rotate(-5deg);
}

/* Scale pop */
.reveal-pop {
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-pop.visible {
  transform: scale(1);
  opacity: 1;
}
```

**Funziona con**: Portfolio, Landing page, Storytelling
**Evitare con**: Dashboard, Dense content

### 3. Ambient Motion

**Dove**: Movimento sottile continuo su elementi decorativi

```css
/* Factor X: Ambient motion */
.floating-element {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Gentle pulse */
.pulse-subtle {
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Slow rotation */
.rotate-slow {
  animation: rotate-slow 30s linear infinite;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Morphing blob */
.blob-morph {
  animation: morph 8s ease-in-out infinite;
}

@keyframes morph {
  0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
}
```

**Funziona con**: Glassmorphism, Spatial, Claymorphism
**Evitare con**: Brutalism, Flat puro

### 4. Loading Delight

**Dove**: Stati di loading/transition con personalità

```css
/* Factor X: Loading delight */
.loading-bounce {
  display: flex;
  gap: 8px;
}

.loading-bounce span {
  width: 12px;
  height: 12px;
  background: var(--primary);
  border-radius: 50%;
  animation: loading-bounce 0.6s ease-in-out infinite;
}

.loading-bounce span:nth-child(2) { animation-delay: 0.1s; }
.loading-bounce span:nth-child(3) { animation-delay: 0.2s; }

@keyframes loading-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Morphing loader */
.loader-morph {
  animation: loader-morph 1.5s ease-in-out infinite;
}

@keyframes loader-morph {
  0% { border-radius: 50%; transform: rotate(0deg); }
  50% { border-radius: 10%; transform: rotate(180deg); }
  100% { border-radius: 50%; transform: rotate(360deg); }
}

/* Text typing effect */
.typing-text {
  overflow: hidden;
  border-right: 2px solid;
  animation:
    typing 2s steps(20) 1s forwards,
    blink 0.5s step-end infinite alternate;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

**Funziona con**: Tutti gli stili (loading states)
**Evitare con**: Enterprise ultra-formale

### 5. Cursor/Interaction Follower

**Dove**: Elementi che seguono o reagiscono al cursore

```css
/* Factor X: Cursor follower */
.cursor-follower {
  position: fixed;
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: difference;
  transition: transform 0.1s ease;
  z-index: 9999;
}

/* Cursor expand on interactive */
.interactive:hover ~ .cursor-follower {
  transform: scale(2);
}

/* Magnetic button */
.magnetic-btn {
  transition: transform 0.3s ease;
}

/* JS needed for full effect */
```

```javascript
// Magnetic button effect
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});
```

**Funziona con**: Portfolio, Creative agency, Spatial
**Evitare con**: Mobile (no cursor), Accessibility concerns

---

## Intensity Levels

### Subtle (10%)
Micro-interactions quasi impercettibili

```css
.subtle-motion {
  transition: transform 0.3s ease;
}

.subtle-motion:hover {
  transform: translateY(-2px);
}
```

### Moderate (25%)
Animazioni notabili ma non distraenti

```css
.moderate-motion {
  animation: float 6s ease-in-out infinite;
}

/* One scroll animation */
.reveal-moderate {
  animation: fade-up 0.6s ease;
}
```

### Bold (40%)
Animazioni come elemento di design

```css
.bold-motion {
  animation:
    wiggle 0.3s ease,
    pulse 2s ease infinite;
}

/* Multiple animated elements */
.hero .animated { ... }
.cta .animated { ... }
```

### Extreme (60%)
Motion come esperienza centrale

```css
/* Full cursor follower */
/* Parallax scrolling */
/* 3D transforms on scroll */
/* Particle effects */
```

---

## Performance Optimization

```css
/* Use transform and opacity only */
.performant {
  /* GOOD */
  transform: translateY(-10px);
  opacity: 0.8;

  /* BAD - causes repaint */
  /* top: -10px; */
  /* margin-top: -10px; */
}

/* Enable GPU acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Remove will-change when done */
.animated-element.animation-done {
  will-change: auto;
}
```

---

## Accessibility: prefers-reduced-motion

```css
/* REQUIRED: Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Or provide alternatives */
@media (prefers-reduced-motion: reduce) {
  .reveal-rotate {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .floating-element {
    animation: none;
  }

  /* Keep essential feedback */
  .button:hover {
    background: var(--primary-dark);
    /* No animation, just color change */
  }
}
```

---

## Timing Functions Reference

| Effect | Timing Function | Use Case |
|--------|----------------|----------|
| Natural | `ease` | General purpose |
| Bouncy | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful elements |
| Smooth | `cubic-bezier(0.22, 1, 0.36, 1)` | Reveals |
| Snappy | `cubic-bezier(0.4, 0, 0.2, 1)` | UI feedback |
| Elastic | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | Attention grabbing |

```css
:root {
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-snappy: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

---

## Compatibility Matrix

| Style | Micro | Scroll | Ambient | Loading | Cursor |
|-------|-------|--------|---------|---------|--------|
| Flat | ✓ | ○ | ✗ | ✓ | ○ |
| Material | ✓ | ○ | ✗ | ✓ | ✗ |
| Neumorphism | ○ | ○ | ✗ | ○ | ✗ |
| Glassmorphism | ✓ | ✓ | ✓ | ✓ | ✓ |
| Brutalism | ○ | ✗ | ✗ | ○ | ○ |
| Claymorphism | ✓ | ✓ | ✓ | ✓ | ○ |
| Spatial | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gen-Z | ✓ | ✓ | ○ | ✓ | ✓ |
| Y2K | ✓ | ○ | ○ | ✓ | ○ |

✓ = Recommended | ○ = Possible | ✗ = Avoid

---

## Anti-Patterns

**SBAGLIATO: Animazione su tutto**
```css
/* NO */
* {
  transition: all 0.3s ease;
  animation: float 3s infinite;
}
/* Performance disaster, overwhelming */
```

**SBAGLIATO: Animazioni che bloccano l'interazione**
```css
/* NO */
.button {
  animation: entrance 2s ease;
  pointer-events: none;
  animation-fill-mode: forwards;
}
/* User must wait */
```

**SBAGLIATO: Ignorare reduced-motion**
```css
/* NO */
.essential-element {
  animation: important 1s infinite;
}
/* No fallback for motion sensitivity */
```

**CORRETTO: Motion con scopo**
```css
/* YES */
.hero-cta {
  animation: pulse-attention 2s ease 3s 1;
  /* Starts after 3s, plays once */
}

@media (prefers-reduced-motion: reduce) {
  .hero-cta {
    animation: none;
    box-shadow: 0 0 0 3px var(--accent);
  }
}
```

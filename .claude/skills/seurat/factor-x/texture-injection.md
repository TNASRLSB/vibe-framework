# Factor X: Texture Injection

Pattern, grain, o texture che aggiungono materialità e profondità al design.

---

## Concept

Il digital flat design è... flat. La texture aggiunge una dimensione tattile, crea mood, e distingue il design dalla massa di interfacce sterili.

---

## Variazioni

### 1. Noise/Grain

**Dove**: Overlay sottile su superfici o immagini

```css
/* Factor X: Grain Texture */
.grain-overlay {
  position: relative;
}

.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* Variations */
.grain-light::after { opacity: 0.03; }
.grain-medium::after { opacity: 0.08; }
.grain-heavy::after { opacity: 0.15; }
```

**Funziona con**: Flat, Glassmorphism, Editorial
**Evitare con**: Skeuomorphism, Claymorphism (già texturati)

### 2. Paper Texture

**Dove**: Background per feeling artigianale/editoriale

```css
/* Factor X: Paper Texture */
.paper-bg {
  background-color: #f5f5f0;
  background-image:
    linear-gradient(90deg, transparent 79px, #e0ddd4 79px, #e0ddd4 81px, transparent 81px),
    linear-gradient(#e0ddd4 1px, transparent 1px);
  background-size: 100% 20px;
}

/* Kraft paper feel */
.kraft-paper {
  background:
    url('kraft-texture.png'),
    linear-gradient(hsl(35 30% 90%), hsl(35 25% 85%));
  background-blend-mode: multiply;
}

/* Aged paper */
.aged-paper {
  background:
    radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%),
    hsl(40 30% 95%);
}
```

**Funziona con**: Skeuomorphism, Earth palette, Editorial
**Evitare con**: Tech, Spatial, Glassmorphism

### 3. Gradient Mesh

**Dove**: Background o hero con gradienti organici

```css
/* Factor X: Gradient Mesh */
.gradient-mesh {
  background:
    radial-gradient(at 40% 20%, hsl(280 70% 70%) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsl(190 80% 60%) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsl(350 80% 70%) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsl(340 60% 60%) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsl(220 70% 70%) 0px, transparent 50%),
    radial-gradient(at 80% 100%, hsl(180 70% 60%) 0px, transparent 50%),
    hsl(260 50% 95%);
  filter: blur(40px) saturate(150%);
}

/* Animated mesh */
@keyframes mesh-move {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}

.animated-mesh {
  animation: mesh-move 20s ease infinite;
}
```

**Funziona con**: Glassmorphism, Spatial, Gen-Z
**Evitare con**: Flat puro, Brutalism, Material

### 4. Dot Pattern

**Dove**: Background decorativo o overlay

```css
/* Factor X: Dot Pattern */
.dot-pattern {
  background-image: radial-gradient(
    circle,
    currentColor 1px,
    transparent 1px
  );
  background-size: 20px 20px;
  opacity: 0.3;
}

/* Halftone effect */
.halftone {
  background:
    radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 4px 4px;
}

/* Large dots */
.polka-dots {
  background-image: radial-gradient(
    circle at center,
    hsl(var(--accent-hue) 80% 60%) 10px,
    transparent 10px
  );
  background-size: 60px 60px;
}
```

**Funziona con**: Flat, Bento, Y2K, Gen-Z
**Evitare con**: Neumorphism, Glassmorphism

### 5. Line Pattern

**Dove**: Accent o background

```css
/* Factor X: Line Pattern */
.lines-horizontal {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 10px,
    hsl(0 0% 0% / 0.05) 10px,
    hsl(0 0% 0% / 0.05) 11px
  );
}

.lines-diagonal {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    hsl(0 0% 0% / 0.05) 10px,
    hsl(0 0% 0% / 0.05) 11px
  );
}

/* Crosshatch */
.crosshatch {
  background:
    repeating-linear-gradient(
      45deg,
      transparent 0 10px,
      hsl(0 0% 0% / 0.03) 10px 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0 10px,
      hsl(0 0% 0% / 0.03) 10px 11px
    );
}
```

**Funziona con**: Brutalism, Y2K, Editorial
**Evitare con**: Material, Neumorphism

---

## Intensity Levels

### Subtle (10%)
Texture quasi invisibile

```css
.subtle-texture::after {
  opacity: 0.02;
}

/* Or small area */
.hero-corner {
  background: var(--texture);
  width: 200px;
  height: 200px;
  position: absolute;
}
```

### Moderate (25%)
Texture percepibile

```css
.moderate-texture::after {
  opacity: 0.05;
}

/* Applied to sections */
.textured-section {
  background: var(--texture);
}
```

### Bold (40%)
Texture come elemento visivo

```css
.bold-texture::after {
  opacity: 0.1;
}

/* Large areas */
.hero-bg,
.footer-bg {
  background: var(--texture);
}
```

### Extreme (60%)
Texture come statement

```css
.extreme-texture {
  background: var(--heavy-texture);
  /* Texture is the design */
}

/* Full page */
body {
  background: var(--texture);
}
```

---

## Implementation Pattern

```css
/* Step 1: Define textures */
:root {
  --texture-grain: url('data:image/svg+xml,...');
  --texture-dots: radial-gradient(circle, currentColor 1px, transparent 1px);
  --texture-lines: repeating-linear-gradient(45deg, ...);
}

/* Step 2: Create mixin/utility */
.texture-grain {
  position: relative;
}

.texture-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--texture-grain);
  opacity: var(--texture-opacity, 0.05);
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* Step 3: Intensity variants */
.texture-subtle { --texture-opacity: 0.02; }
.texture-medium { --texture-opacity: 0.05; }
.texture-bold { --texture-opacity: 0.1; }

/* Step 4: Apply strategically */
.hero {
  @extend .texture-grain;
  @extend .texture-medium;
}
```

---

## Blend Mode Guide

| Texture Type | Recommended Blend | Effect |
|--------------|-------------------|--------|
| Grain | overlay | Subtle |
| Paper | multiply | Aged feel |
| Gradient mesh | normal | Colorful |
| Dots (dark) | multiply | Adds depth |
| Dots (light) | screen | Lightens |
| Lines | overlay | Technical |

```css
/* Blend mode examples */
.grain { mix-blend-mode: overlay; }
.paper { mix-blend-mode: multiply; }
.light-dots { mix-blend-mode: screen; }
```

---

## Compatibility Matrix

| Style | Grain | Paper | Mesh | Dots | Lines |
|-------|-------|-------|------|------|-------|
| Flat | ✓ | ○ | ○ | ✓ | ✓ |
| Material | ○ | ✗ | ✗ | ○ | ✗ |
| Neumorphism | ✗ | ✗ | ✗ | ✗ | ✗ |
| Glassmorphism | ✓ | ✗ | ✓ | ✗ | ✗ |
| Brutalism | ✓ | ○ | ✗ | ✓ | ✓ |
| Claymorphism | ✗ | ✗ | ✗ | ✗ | ✗ |
| Skeuomorphism | ○ | ✓ | ✗ | ○ | ○ |
| Y2K | ✓ | ○ | ✓ | ✓ | ✓ |
| Gen-Z | ✓ | ○ | ✓ | ✓ | ○ |
| Bento | ○ | ✗ | ○ | ○ | ✗ |
| Spatial | ○ | ✗ | ✓ | ✗ | ✗ |

✓ = Recommended | ○ = Possible | ✗ = Avoid

---

## Performance Considerations

```css
/* Grain SVG inline per performance */
.grain::after {
  /* SVG data URI - no HTTP request */
  background-image: url("data:image/svg+xml,...");
}

/* Use will-change for animated textures */
.animated-texture {
  will-change: background-position;
}

/* Disable on low-power mode */
@media (prefers-reduced-motion: reduce) {
  .animated-texture {
    animation: none;
  }
}

/* Reduce on mobile for performance */
@media (max-width: 768px) {
  .texture-heavy::after {
    display: none; /* Or reduce opacity */
  }
}
```

---

## Accessibility Check

```
[ ] Texture non riduce contrast ratio sotto WCAG AA
[ ] Texture non è l'unico modo per distinguere elementi
[ ] Animated textures rispettano prefers-reduced-motion
[ ] Pattern non causa visual strain
[ ] Text rimane leggibile sopra texture
```

### Contrast with Texture

```css
/* Ensure text readability */
.textured-bg {
  background: var(--texture);
}

.textured-bg .text {
  /* Add subtle shadow for contrast */
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
  /* Or background */
  background: rgba(255,255,255,0.9);
  padding: 4px 8px;
}
```

---

## Anti-Patterns

**SBAGLIATO: Texture che riduce leggibilità**
```css
/* NO */
.body-text-container {
  background: var(--heavy-texture);
}
/* Testo difficile da leggere */
```

**SBAGLIATO: Mix di texture incompatibili**
```css
/* NO */
.section { background: var(--grain); }
.card { background: var(--dots); }
.button { background: var(--lines); }
/* Chaos visivo */
```

**SBAGLIATO: Texture su stili già materici**
```css
/* NO */
.neumorphism-card {
  background: var(--grain);
  box-shadow: var(--neumorphism-shadow);
}
/* Conflitto di materialità */
```

**CORRETTO: Una texture, uso strategico**
```css
/* YES */
.hero {
  background: var(--gradient-mesh);
}

/* Resto pulito */
.content,
.footer {
  background: var(--solid-color);
}
```

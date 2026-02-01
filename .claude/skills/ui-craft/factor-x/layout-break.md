# Factor X: Layout Break

Elementi che rompono il grid in modi controllati per creare interesse visivo.

---

## Concept

Un layout perfettamente aligned è prevedibile. Un elemento che "esce" dal grid crea tensione, movimento, e memorabilità - se fatto con intenzione.

---

## Variazioni

### 1. Bleed Element

**Dove**: Un elemento che esce dai margini del container

```css
/* Container standard */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Factor X: Bleed */
.bleed-element {
  width: calc(100% + 200px);
  margin-left: -100px;
  margin-right: -100px;
}

/* Oppure full bleed */
.full-bleed {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

**Funziona con**: Swiss grid, Bento
**Evitare con**: Broken grid (già rotto)

### 2. Overlap

**Dove**: Elementi che si sovrappongono

```css
/* Factor X: Overlap */
.overlap-parent {
  position: relative;
}

.overlap-element {
  position: relative;
  margin-top: -60px;
  z-index: 2;
}

/* Card overlap */
.card-overlap {
  margin-left: 40px;
  margin-top: -40px;
}

/* Image overlap text */
.hero-image {
  position: relative;
  z-index: 1;
}

.hero-text {
  position: relative;
  z-index: 2;
  margin-top: -120px;
  margin-left: 60px;
}
```

**Funziona con**: Glassmorphism, Spatial
**Evitare con**: Dense layouts

### 3. Rotation

**Dove**: Elemento ruotato che rompe l'asse

```css
/* Factor X: Rotation */
.rotated-element {
  transform: rotate(-3deg);
}

/* Con counter-rotation per contenuto */
.rotated-card {
  transform: rotate(-3deg);
}

.rotated-card > * {
  transform: rotate(3deg);
}

/* Subtle rotation */
.subtle-rotate {
  transform: rotate(-1deg);
}

/* Bold rotation */
.bold-rotate {
  transform: rotate(-8deg);
}
```

**Funziona con**: Gen-Z, Brutalism, Y2K
**Evitare con**: Enterprise, B2B formale

### 4. Scale Break

**Dove**: Un elemento significativamente più grande del sistema

```css
/* Sistema base */
.card {
  padding: 24px;
}

.heading {
  font-size: 2rem;
}

/* Factor X: Scale Break */
.giant-element {
  font-size: 8rem; /* 4x larger than system */
  line-height: 0.9;
}

/* Oppure elemento piccolo in contesto grande */
.tiny-accent {
  font-size: 0.625rem;
  position: absolute;
  top: -10px;
  right: -10px;
}
```

**Funziona con**: Editorial, Portfolio
**Evitare con**: Dashboard, dense layouts

### 5. Off-Grid Position

**Dove**: Elemento posizionato fuori dalla griglia

```css
/* Grid standard */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Factor X: Off-Grid */
.off-grid-element {
  position: absolute;
  left: -5%;
  top: 20%;
}

/* Floating accent */
.floating-accent {
  position: fixed;
  bottom: 10%;
  right: -20px;
  transform: rotate(90deg);
}

/* Margin break */
.margin-break {
  margin-left: calc(-1 * var(--container-padding));
  padding-left: var(--container-padding);
  width: calc(100% + var(--container-padding));
}
```

**Funziona con**: Asymmetric layouts
**Evitare con**: Swiss grid puro

---

## Intensity Levels

### Subtle (10%)
Break quasi impercettibile

```css
/* Micro-break */
.subtle-break {
  transform: translateX(-8px); /* Slight offset */
}

.subtle-bleed {
  width: calc(100% + 40px);
  margin-left: -20px;
}
```

### Moderate (25%)
Break notabile ma contenuto

```css
/* Clear break */
.moderate-break {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

.moderate-bleed {
  width: calc(100% + 100px);
  margin-left: -50px;
}

.moderate-rotate {
  transform: rotate(-2deg);
}
```

### Bold (40%)
Break come statement

```css
/* Strong break */
.bold-break {
  width: 100vw;
  margin-left: -50vw;
  left: 50%;
  position: relative;
}

.bold-overlap {
  margin-top: -100px;
}

.bold-rotate {
  transform: rotate(-5deg);
}
```

### Extreme (60%)
Break come elemento dominante

```css
/* Dramatic break */
.extreme-break {
  transform: rotate(-12deg) scale(1.2);
  margin: -50px;
}

.extreme-overlap {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 120%;
}
```

---

## Strategic Placement

### Ideale per Break

```
HERO SECTIONS
┌─────────────────────────────┐
│ ████████████████████        │ ← Testo che overlap immagine
│ ████████████████████        │
│      ┌──────────────────────│ ← Immagine che bleed
│      │                      │
└──────┴──────────────────────┘

SECTION DIVIDERS
─────────────────────────────────
    ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱            ← Diagonal break
─────────────────────────────────

ACCENT ELEMENTS
┌─────────────────────────────┐
│                             │
│  Card    Card    Card       │
│            └────────────────│ ← Card che overlap edge
│                             │
└─────────────────────────────┘
```

### NON Usare Break Per

```
✗ Navigation (confonde)
✗ Form fields (breaks flow)
✗ CTA buttons (hard to click)
✗ Text content (hard to read) — INCLUDES headings, titles, paragraphs
✗ Data tables (information architecture)
```

**REGOLA CRITICA:** Mai applicare `margin-left` o `margin-right` negativi a elementi di testo (headings, titles, paragraphs, labels). Il testo NON deve mai uscire dal viewport o dal container padding. Layout breaks su testo = contenuto tagliato = bug visivo. Usare layout breaks solo su elementi decorativi, immagini, cards, dividers.

---

## Implementation Pattern

```css
/* Step 1: Define break tokens */
:root {
  --break-offset-sm: 20px;
  --break-offset-md: 60px;
  --break-offset-lg: 120px;
  --break-rotation: -3deg;
}

/* Step 2: Create break utilities */
.break-bleed {
  width: calc(100% + (var(--break-offset-md) * 2));
  margin-left: calc(var(--break-offset-md) * -1);
}

.break-overlap-up {
  margin-top: calc(var(--break-offset-md) * -1);
  position: relative;
  z-index: 2;
}

.break-rotate {
  transform: rotate(var(--break-rotation));
}

/* Step 3: Apply to specific elements */
.hero-image {
  @extend .break-bleed;
}

.featured-card {
  @extend .break-overlap-up;
}

.accent-block {
  @extend .break-rotate;
}

/* Step 4: Responsive adjustment */
@media (max-width: 768px) {
  :root {
    --break-offset-md: 30px; /* Reduce on mobile */
    --break-rotation: -2deg;
  }
}
```

---

## Compatibility Matrix

| Style | Bleed | Overlap | Rotation | Scale | Off-Grid |
|-------|-------|---------|----------|-------|----------|
| Flat | ✓ | ○ | ○ | ✓ | ○ |
| Material | ○ | ✓ | ✗ | ○ | ✗ |
| Neumorphism | ✗ | ○ | ✗ | ○ | ✗ |
| Glassmorphism | ✓ | ✓ | ○ | ✓ | ✓ |
| Brutalism | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bento | ✓ | ○ | ✗ | ○ | ✗ |
| Gen-Z | ✓ | ✓ | ✓ | ✓ | ✓ |
| Spatial | ✓ | ✓ | ○ | ✓ | ✓ |

✓ = Recommended | ○ = Possible | ✗ = Avoid

---

## Accessibility Check

```
[ ] Break non nasconde contenuto importante
[ ] Elementi interattivi rimangono cliccabili (non fuori viewport)
[ ] Ordine di lettura (DOM) rimane logico
[ ] Focus states funzionano correttamente
[ ] Rotation non causa motion sickness (prefer-reduced-motion)
[ ] Overlap non crea confusion su cosa è cliccabile
```

### Reduced Motion Support

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  .break-rotate {
    transform: none;
  }

  .animated-break {
    animation: none;
    /* Apply static break instead */
    margin-left: -30px;
  }
}
```

---

## Anti-Patterns

**SBAGLIATO: Break su tutto**
```css
/* NO */
.every-section { transform: rotate(-2deg); }
.every-card { margin-top: -20px; }
/* Diventa il nuovo normale, perde effetto */
```

**SBAGLIATO: Break su elementi funzionali**
```css
/* NO */
.form-container { transform: rotate(-3deg); }
.nav-menu { position: relative; left: -50px; }
/* Breaks usability */
```

**SBAGLIATO: Overlap che nasconde contenuto**
```css
/* NO */
.card { margin-top: -200px; }
/* Contenuto nascosto sopra il viewport */
```

**CORRETTO: Break strategico**
```css
/* YES */
.hero-image {
  /* One break per section */
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

/* Resto del layout rimane su grid */
```

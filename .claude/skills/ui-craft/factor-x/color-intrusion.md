# Factor X: Color Intrusion

Un colore "alieno" che rompe la palette altrimenti coerente.

---

## Concept

Ogni palette ha una logica interna (warm tones, cold tones, mono, etc.). La Color Intrusion introduce UN colore che non appartiene a quella logica, creando tensione visiva e memorabilità.

---

## Variazioni

### 1. Neon Intrusion

**Dove**: Accent color in palette altrimenti sobria

```css
/* Base: Earth palette */
--color-bg: hsl(40 25% 95%);
--color-text: hsl(30 30% 15%);
--color-primary: hsl(25 70% 50%);

/* Factor X: Neon Intrusion */
--color-intrusion: hsl(160 100% 50%); /* Electric teal */
/* oppure */
--color-intrusion: hsl(320 100% 60%); /* Hot pink */
/* oppure */
--color-intrusion: hsl(90 100% 55%);  /* Lime */
```

**Funziona con**: Earth, Warm, Mono palette
**Evitare con**: Neon palette (già saturo)

### 2. Warm in Cold

**Dove**: Accent caldo in sistema freddo

```css
/* Base: Cold palette */
--color-bg: hsl(220 20% 98%);
--color-primary: hsl(220 80% 55%);
--color-secondary: hsl(200 70% 50%);

/* Factor X: Warm Intrusion */
--color-intrusion: hsl(25 90% 55%);  /* Warm orange */
/* oppure */
--color-intrusion: hsl(350 85% 55%); /* Coral red */
/* oppure */
--color-intrusion: hsl(45 90% 55%);  /* Warm yellow */
```

**Funziona con**: Cold, Corporate, Tech
**Evitare con**: Warm palette

### 3. Cold in Warm

**Dove**: Accent freddo in sistema caldo

```css
/* Base: Warm palette */
--color-bg: hsl(30 30% 97%);
--color-primary: hsl(25 90% 55%);
--color-secondary: hsl(10 70% 55%);

/* Factor X: Cold Intrusion */
--color-intrusion: hsl(220 80% 55%); /* Electric blue */
/* oppure */
--color-intrusion: hsl(180 70% 45%); /* Teal */
/* oppure */
--color-intrusion: hsl(260 70% 60%); /* Purple */
```

**Funziona con**: Warm, Earth palette
**Evitare con**: Cold palette

### 4. Chromatic in Mono

**Dove**: Unico colore in sistema monocromatico

```css
/* Base: Mono palette */
--color-bg: hsl(0 0% 98%);
--color-text: hsl(0 0% 10%);
--color-gray-500: hsl(0 0% 50%);

/* Factor X: Chromatic Intrusion */
--color-intrusion: hsl(350 85% 50%); /* Red statement */
/* oppure */
--color-intrusion: hsl(220 90% 55%); /* Blue pop */
/* oppure */
--color-intrusion: hsl(45 100% 50%); /* Yellow highlight */
```

**Funziona con**: Mono, Brutalism, Editorial
**Evitare con**: Già multi-color

### 5. Gradient Intrusion

**Dove**: Gradient spot in sistema flat

```css
/* Base: Flat colors */
--color-primary: hsl(220 80% 55%);

/* Factor X: Gradient Intrusion */
--gradient-intrusion: linear-gradient(
  135deg,
  hsl(280 80% 55%) 0%,
  hsl(320 90% 60%) 50%,
  hsl(30 90% 55%) 100%
);

/* Applicato a UN elemento */
.hero-accent {
  background: var(--gradient-intrusion);
}
```

**Funziona con**: Flat, Material
**Evitare con**: Già gradient-heavy

---

## Intensity Levels

### Subtle (10%)
Intrusion solo su micro-elementi

```css
/* Solo su elementi piccoli */
.notification-dot,
.new-badge,
.highlight-underline {
  background: var(--color-intrusion);
}
```

### Moderate (25%)
Intrusion su elementi accent

```css
/* Accent elements */
.cta-button,
.highlight-text,
.icon-accent {
  color: var(--color-intrusion);
}

/* Hover states */
.link:hover {
  color: var(--color-intrusion);
}
```

### Bold (40%)
Intrusion come statement

```css
/* Major elements */
.hero-accent,
.section-divider,
.featured-card {
  background: var(--color-intrusion);
}

/* Text highlights */
::selection {
  background: var(--color-intrusion);
}
```

### Extreme (60%)
Intrusion come co-protagonista

```css
/* Large presence */
.hero-section {
  background: var(--color-intrusion);
}

/* Multiple uses */
.heading-accent,
.footer-bg,
.nav-active {
  /* All use intrusion color */
}
```

---

## Placement Strategy

### High Impact Zones
Dove l'intrusion ha massimo effetto:

```
┌─────────────────────────────┐
│  Logo   [●]Nav          CTA │  ← Badge, CTA
├─────────────────────────────┤
│                             │
│      HERO with [accent]     │  ← Hero accent element
│                             │
├─────────────────────────────┤
│ Card  │ Card  │ [Card]      │  ← One featured card
├─────────────────────────────┤
│  [divider line]             │  ← Section dividers
├─────────────────────────────┤
│  Footer           [●]       │  ← Accent dot
└─────────────────────────────┘
```

### Dove NON usare

```
✗ Body text color
✗ Navigation links (base state)
✗ Form labels
✗ Error messages (already red)
✗ Success messages (already green)
✗ Entire backgrounds (too much)
```

---

## Color Selection Guide

### Per Mono Palette

| Mood Desired | Intrusion Color |
|--------------|-----------------|
| Energy | Red (350°) or Orange (25°) |
| Calm | Blue (220°) or Teal (180°) |
| Premium | Gold (45°) or Purple (280°) |
| Fresh | Green (140°) or Lime (90°) |

### Per Cold Palette

| Mood Desired | Intrusion Color |
|--------------|-----------------|
| Warmth | Orange (25°) or Coral (15°) |
| Energy | Red (0°) or Magenta (330°) |
| Organic | Yellow (50°) or Gold (45°) |

### Per Warm Palette

| Mood Desired | Intrusion Color |
|--------------|-----------------|
| Tech | Blue (220°) or Cyan (190°) |
| Mystery | Purple (280°) or Indigo (260°) |
| Fresh | Teal (170°) or Mint (150°) |

---

## Implementation Pattern

```css
/* Step 1: Define intrusion */
:root {
  /* Base palette */
  --color-primary: hsl(220 80% 55%);
  --color-secondary: hsl(220 60% 70%);

  /* Intrusion */
  --color-intrusion: hsl(25 90% 55%);
  --color-intrusion-light: hsl(25 90% 70%);
  --color-intrusion-dark: hsl(25 90% 40%);
}

/* Step 2: Create utility classes */
.intrusion-bg { background: var(--color-intrusion); }
.intrusion-text { color: var(--color-intrusion); }
.intrusion-border { border-color: var(--color-intrusion); }

/* Step 3: Apply strategically */
.hero-accent {
  background: var(--color-intrusion);
  color: white; /* Ensure contrast */
}

.highlight {
  background: linear-gradient(
    transparent 60%,
    var(--color-intrusion-light) 60%
  );
}

/* Step 4: Subtle uses */
::selection {
  background: var(--color-intrusion-light);
}

.notification-badge {
  background: var(--color-intrusion);
}
```

---

## Compatibility Matrix

| Palette | Neon | Warm | Cold | Chromatic | Gradient |
|---------|------|------|------|-----------|----------|
| Warm | ✓ | ✗ | ✓ | ✓ | ○ |
| Cold | ✓ | ✓ | ✗ | ✓ | ○ |
| Mono | ✓ | ✓ | ✓ | ✓ | ✓ |
| Neon | ✗ | ○ | ○ | ✗ | ✗ |
| Earth | ✓ | ✗ | ✓ | ✓ | ○ |
| Jewel | ○ | ○ | ○ | ○ | ✗ |

✓ = Recommended | ○ = Possible | ✗ = Avoid

---

## Accessibility Check

```
[ ] Intrusion color meets contrast ratio with its background
    - Text on intrusion: minimum 4.5:1
    - Large text on intrusion: minimum 3:1
[ ] Non usato per information-only (color blindness)
[ ] Ha accompagnamento visivo (icon, text, border)
[ ] Non è l'unico modo per comunicare stato
```

### Contrast Examples

```css
/* Good: High contrast intrusion */
.intrusion-button {
  background: hsl(350 85% 50%);
  color: white; /* Passes AA */
}

/* Bad: Low contrast intrusion */
.intrusion-button {
  background: hsl(50 100% 60%);
  color: white; /* Fails contrast */
}

/* Fixed */
.intrusion-button {
  background: hsl(50 100% 60%);
  color: hsl(50 100% 15%); /* Dark text on yellow */
}
```

---

## Anti-Patterns

**SBAGLIATO: Multiple intrusions**
```css
/* NO */
--intrusion-1: hsl(350 85% 50%);
--intrusion-2: hsl(180 90% 50%);
--intrusion-3: hsl(280 80% 55%);
/* This is just a colorful palette, not an intrusion */
```

**SBAGLIATO: Intrusion everywhere**
```css
/* NO */
body { background: var(--color-intrusion); }
/* Perde l'effetto "intrusion" */
```

**SBAGLIATO: Random placement**
```css
/* NO */
.random-paragraph { color: var(--color-intrusion); }
/* Intrusion deve essere intenzionale */
```

**CORRETTO: Strategic placement**
```css
/* YES */
.hero-cta,
.section-highlight,
.notification {
  /* One color, strategic use */
  background: var(--color-intrusion);
}
```

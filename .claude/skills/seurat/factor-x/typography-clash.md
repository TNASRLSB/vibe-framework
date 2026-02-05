# Factor X: Typography Clash

Combinazioni tipografiche inaspettate che creano tensione visiva controllata.

---

## Concept

Invece di usare font families "safe" e coerenti (sans + sans, serif + serif), introduci una combinazione inaspettata che crea memorabilità.

---

## Variazioni

### 1. Serif Intrusion

**Dove**: Heading o display text in un contesto dominato da sans-serif

```css
/* Base system: sans-serif */
--font-body: 'Inter', sans-serif;
--font-heading: 'Inter', sans-serif;

/* Factor X: Serif Intrusion */
--font-heading: 'Playfair Display', serif;
/* oppure */
--font-heading: 'Fraunces', serif;
/* oppure */
--font-heading: 'DM Serif Display', serif;
```

**Funziona con**: Material, Flat, Bento
**Evitare con**: Brutalism (già usa contrasti forti)

### 2. Display Sans in Serif Context

**Dove**: Heading bold in contesto editoriale/serif

```css
/* Base system: editorial serif */
--font-body: 'Source Serif Pro', serif;
--font-heading: 'Source Serif Pro', serif;

/* Factor X: Display Sans */
--font-heading: 'Bebas Neue', sans-serif;
/* oppure */
--font-heading: 'Oswald', sans-serif;
/* oppure */
--font-heading: 'Anton', sans-serif;
```

**Funziona con**: Editorial, Portfolio, Blog
**Evitare con**: Corporate formale

### 3. Monospace Accent

**Dove**: Accent text, labels, categories in contesto non-tech

```css
/* Factor X: Monospace Accent */
--font-accent: 'JetBrains Mono', monospace;
/* oppure */
--font-accent: 'Fira Code', monospace;
/* oppure */
--font-accent: 'IBM Plex Mono', monospace;

.category-label,
.metadata,
.date {
  font-family: var(--font-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

**Funziona con**: Glassmorphism, Fashion, Luxury
**Evitare con**: Tech/Developer (già mono-heavy)

### 4. Script/Handwritten Touch

**Dove**: Single word highlight, signature element

```css
/* Factor X: Script Touch */
--font-script: 'Caveat', cursive;
/* oppure */
--font-script: 'Shadows Into Light', cursive;
/* oppure */
--font-script: 'Pacifico', cursive;

/* Uso limitato! */
.highlight-word {
  font-family: var(--font-script);
}

/* MAI per body text o navigation */
```

**Funziona con**: D2C brands, Portfolio, Lifestyle
**Evitare con**: B2B, Enterprise, Finance

### 5. Weight Extreme

**Dove**: Heading ultrabold vs body ultralight (o viceversa)

```css
/* Factor X: Weight Extreme */
--font-family: 'Inter', sans-serif;

.heading {
  font-weight: 900; /* Black */
  font-size: 4rem;
}

.body {
  font-weight: 300; /* Light */
}

/* Oppure il contrario */
.heading {
  font-weight: 200; /* Extralight */
  font-size: 6rem;
}

.body {
  font-weight: 500; /* Medium */
}
```

**Funziona con**: Tutti gli stili
**Evitare con**: Accessibilità critica (low contrast risk)

---

## Intensity Levels

### Subtle (10%)
Applica solo ai main headings (H1, hero title)

```css
/* Solo H1 ha il font clash */
h1 {
  font-family: var(--font-clash);
}
/* Resto del sistema rimane coerente */
```

### Moderate (25%)
Applica a tutti gli headings

```css
h1, h2, h3 {
  font-family: var(--font-clash);
}
```

### Bold (40%)
Headings + elementi accent

```css
h1, h2, h3,
.card-title,
.cta-text,
blockquote {
  font-family: var(--font-clash);
}
```

### Extreme (60%)
Sistema tipografico completamente contrastato

```css
/* Two-font system with high contrast */
--font-display: 'Clash Font';
--font-text: 'Contrasting Font';

/* Applied throughout */
```

---

## Pairing Suggestions

### Safe-ish Clashes (Easier to Pull Off)

| Context Font | Clash Font | Vibe |
|--------------|-----------|------|
| Inter | Playfair Display | Modern editorial |
| Roboto | DM Serif | Tech meets tradition |
| Open Sans | Fraunces | Friendly sophistication |
| Poppins | Crimson Pro | Approachable elegance |

### Risky Clashes (High Impact)

| Context Font | Clash Font | Vibe |
|--------------|-----------|------|
| Inter | Bebas Neue | Stark contrast |
| Lato | Space Mono | Tech intrusion |
| Source Sans | Abril Fatface | Dramatic editorial |
| Helvetica | Caveat | Corporate + human |

### Expert Clashes (Handle with Care)

| Context Font | Clash Font | Vibe |
|--------------|-----------|------|
| Any sans | Variable width font | Experimental |
| Any serif | Brutalist sans | Anti-design |
| System fonts | Custom display | Unique identity |

---

## Implementation Pattern

```css
/* Step 1: Define the clash */
:root {
  --font-primary: 'Inter', sans-serif;
  --font-clash: 'Playfair Display', serif;

  /* Factor X intensity */
  --factor-x-intensity: moderate;
}

/* Step 2: Apply based on intensity */

/* Subtle */
@media (--factor-x-subtle) {
  .hero-title {
    font-family: var(--font-clash);
  }
}

/* Moderate */
@media (--factor-x-moderate) {
  h1, h2, h3 {
    font-family: var(--font-clash);
  }
}

/* Bold */
@media (--factor-x-bold) {
  h1, h2, h3,
  .featured-text,
  blockquote {
    font-family: var(--font-clash);
  }
}

/* Step 3: Ensure contrast */
.font-clash-element {
  /* May need size adjustment */
  font-size: calc(var(--base-size) * 1.1);
  /* Or weight adjustment */
  font-weight: 500;
}
```

---

## Compatibility Matrix

| Style | Serif Intrusion | Display Sans | Monospace | Script | Weight Extreme |
|-------|-----------------|--------------|-----------|--------|----------------|
| Flat | ✓ | ✓ | ✓ | ○ | ✓ |
| Material | ✓ | ○ | ○ | ✗ | ✓ |
| Neumorphism | ✓ | ○ | ✗ | ✗ | ○ |
| Glassmorphism | ✓ | ○ | ✓ | ○ | ✓ |
| Brutalism | ○ | ✓ | ✓ | ✗ | ✓ |
| Claymorphism | ○ | ○ | ✗ | ✓ | ○ |
| Bento | ✓ | ○ | ✓ | ○ | ✓ |
| Gen-Z | ○ | ✓ | ○ | ✓ | ✓ |

✓ = Recommended | ○ = Possible | ✗ = Avoid

---

## Accessibility Check

Prima di applicare Typography Clash, verifica:

```
[ ] Contrast ratio rimane WCAG AA (4.5:1 per body, 3:1 per large)
[ ] Font clash è leggibile (no script per long text)
[ ] Size minimo rispettato (16px body)
[ ] Line-height appropriato per il font
[ ] Font carica velocemente (subset se necessario)
```

---

## Anti-Patterns

**SBAGLIATO: Clash ovunque**
```css
/* NO */
body { font-family: var(--font-clash-1); }
h1 { font-family: var(--font-clash-2); }
.button { font-family: var(--font-clash-3); }
```

**SBAGLIATO: Script per leggibilità**
```css
/* NO */
.body-text { font-family: 'Pacifico', cursive; }
.navigation { font-family: 'Dancing Script', cursive; }
```

**CORRETTO: Un clash, usato con intenzione**
```css
/* YES */
body { font-family: var(--font-primary); }
h1, h2 { font-family: var(--font-clash); }
/* Tutto il resto rimane coerente */
```

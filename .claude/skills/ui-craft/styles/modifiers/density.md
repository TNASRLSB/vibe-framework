# Density Modifiers

Quanto è "piena" l'interfaccia.

---

## Sparse

**Mood**: Breathing room, focus, luxury, editorial

### Characteristics
- Molto whitespace (>50% dello schermo)
- Pochi elementi per viewport
- Grandi margini
- Focus su singoli elementi
- Line-height generoso (1.6-1.8)

### CSS Implementation

```css
/* Sparse Density */
--density-sparse-padding: 64px;
--density-sparse-gap: 48px;
--density-sparse-margin: 120px;

/* Typography */
--sparse-line-height: 1.8;
--sparse-paragraph-spacing: 2em;
--sparse-heading-spacing: 3em;

/* Layout */
.sparse-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--density-sparse-padding);
}

.sparse-section {
  margin-bottom: var(--density-sparse-margin);
}

/* Text */
.sparse-text {
  line-height: var(--sparse-line-height);
  margin-bottom: var(--sparse-paragraph-spacing);
}

/* Hero */
.sparse-hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--density-sparse-padding);
}

/* Content per viewport */
/* Rule: Max 2-3 distinct elements visible at once */
```

### Compatible Styles
✓ Neumorphism, Glassmorphism, Bento, Spatial
○ Flat, Material, Claymorphism
✗ Brutalism, Gen-Z, Y2K (need presence)

---

## Balanced

**Mood**: Professional, usable, harmonious, standard

### Characteristics
- Whitespace equilibrato (~40%)
- 4-6 elementi per viewport
- Margini standard
- Line-height standard (1.5-1.6)
- Gerarchia chiara ma non estrema

### CSS Implementation

```css
/* Balanced Density */
--density-balanced-padding: 32px;
--density-balanced-gap: 24px;
--density-balanced-margin: 64px;

/* Typography */
--balanced-line-height: 1.5;
--balanced-paragraph-spacing: 1.5em;
--balanced-heading-spacing: 2em;

/* Layout */
.balanced-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--density-balanced-padding);
}

.balanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--density-balanced-gap);
}

.balanced-section {
  margin-bottom: var(--density-balanced-margin);
}

/* Text */
.balanced-text {
  line-height: var(--balanced-line-height);
  margin-bottom: var(--balanced-paragraph-spacing);
}

/* Content per viewport */
/* Rule: 4-6 distinct elements visible */
```

### Compatible Styles
✓ All styles (universal)

---

## Dense

**Mood**: Information-rich, efficient, professional, data

### Characteristics
- Poco whitespace (~25%)
- 8-12 elementi per viewport
- Margini ridotti
- Line-height compatto (1.3-1.4)
- Massima informazione per area

### CSS Implementation

```css
/* Dense Density */
--density-dense-padding: 16px;
--density-dense-gap: 12px;
--density-dense-margin: 24px;

/* Typography */
--dense-line-height: 1.35;
--dense-paragraph-spacing: 1em;
--dense-heading-spacing: 1.25em;
--dense-font-size: 0.875rem; /* 14px instead of 16px */

/* Layout */
.dense-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--density-dense-padding);
}

.dense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--density-dense-gap);
}

/* Text */
.dense-text {
  font-size: var(--dense-font-size);
  line-height: var(--dense-line-height);
  margin-bottom: var(--dense-paragraph-spacing);
}

/* Tables */
.dense-table td {
  padding: 8px 12px;
  font-size: var(--dense-font-size);
}

/* Content per viewport */
/* Rule: 8-12 distinct elements, prioritize scannability */
```

### Compatible Styles
✓ Flat, Material, Brutalism
○ Y2K, Gen-Z, Bento
✗ Neumorphism, Glassmorphism, Claymorphism, Spatial

---

## Claustrophobic

**Mood**: Overwhelming, intense, maximalist, chaotic

### Characteristics
- Whitespace minimo (<15%)
- 15+ elementi per viewport
- Elementi che si toccano o sovrappongono
- Line-height stretto (1.2)
- Sensazione di "troppo" (intenzionale)

### CSS Implementation

```css
/* Claustrophobic Density */
--density-claustro-padding: 8px;
--density-claustro-gap: 4px;
--density-claustro-margin: 8px;

/* Typography */
--claustro-line-height: 1.2;
--claustro-paragraph-spacing: 0.5em;
--claustro-font-size: 0.75rem; /* 12px */

/* Layout */
.claustro-container {
  max-width: 100%;
  padding: var(--density-claustro-padding);
}

.claustro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--density-claustro-gap);
}

/* Overlapping elements */
.claustro-stack > * {
  margin-bottom: -20px;
}

/* Text */
.claustro-text {
  font-size: var(--claustro-font-size);
  line-height: var(--claustro-line-height);
}

/* Warning: Use sparingly and intentionally */
```

### Compatible Styles
✓ Brutalism (intentional overwhelming)
○ Gen-Z (if ironic), Y2K
✗ All others (breaks usability)

### ⚠️ Warning

Claustrophobic density is almost always an anti-pattern except for:
- Intentional artistic statements
- Brutalist "wall of text" designs
- Ironic Gen-Z overload
- Specific data visualization needs

**NEVER use for**:
- Forms
- Navigation
- E-commerce
- Accessibility-required contexts

---

## Modifier Selection Logic

### Based on Combined Weights

```
If density_weight > 0.7 → prefer Dense
If density_weight < 0.3 → prefer Sparse
If warmth > 0.7 OR playfulness > 0.7 → avoid Dense
If formality > 0.7 AND trust > 0.6 → prefer Balanced
If innovation > 0.8 AND playfulness > 0.8 → can use Claustrophobic
```

### Default by Type

| Project Type | Default Density |
|--------------|-----------------|
| Landing page | Sparse |
| SaaS app | Balanced |
| Dashboard | Dense |
| Documentation | Balanced |
| E-commerce (listing) | Balanced to Dense |
| Portfolio | Sparse |
| Blog | Sparse to Balanced |
| Admin panel | Dense |

---

## Spacing Reference

| Density | Padding | Gap | Margin | Line-height | Elements/viewport |
|---------|---------|-----|--------|-------------|-------------------|
| Sparse | 64px | 48px | 120px | 1.8 | 2-3 |
| Balanced | 32px | 24px | 64px | 1.5 | 4-6 |
| Dense | 16px | 12px | 24px | 1.35 | 8-12 |
| Claustro | 8px | 4px | 8px | 1.2 | 15+ |

---

## Compatibility Matrix

| Density | Flat | Material | Neu | Glass | Brutal | Clay | Skeu | Y2K | GenZ | Bento | Spatial |
|---------|------|----------|-----|-------|--------|------|------|-----|------|-------|---------|
| Sparse | ✓ | ○ | ✓ | ✓ | ✗ | ✓ | ○ | ✗ | ✗ | ✓ | ✓ |
| Balanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dense | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ○ | ○ | ○ | ○ | ✗ |
| Claustro | ✗ | ✗ | ✗ | ✗ | ○ | ✗ | ✗ | ○ | ○ | ✗ | ✗ |

✓ = Recommended | ○ = Possible | ✗ = Incompatible

---

## Responsive Density

Density should adapt to screen size:

```css
/* Mobile: increase density slightly */
@media (max-width: 768px) {
  :root {
    --padding: 24px; /* was 32px */
    --gap: 16px; /* was 24px */
  }
}

/* Large screens: can afford more sparse */
@media (min-width: 1400px) {
  :root {
    --padding: 48px;
    --gap: 32px;
  }
}
```

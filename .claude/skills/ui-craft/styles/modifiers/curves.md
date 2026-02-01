# Curves Modifiers

Come sono i bordi e le linee.

---

## Geometric

**Philosophy**: Mathematical precision - shapes defined by exact measurements

### Characteristics
- Angoli a 90° o netti
- Border-radius: 0-4px (minimal o assente)
- Linee rette
- Forme regolari (quadrati, rettangoli)
- Cerchi perfetti (se usati)

### CSS Implementation

```css
/* Geometric Curves */
--radius-geometric: 0;
--radius-geometric-soft: 4px;

.geometric-element {
  border-radius: var(--radius-geometric);
}

.geometric-card {
  border-radius: var(--radius-geometric-soft);
}

/* Perfect shapes */
.geometric-circle {
  border-radius: 50%;
  aspect-ratio: 1;
}

.geometric-square {
  border-radius: 0;
  aspect-ratio: 1;
}
```

### Compatible Styles
✓ Flat, Material, Brutalism, Skeuomorphism
○ Y2K, Spatial
✗ Neumorphism, Glassmorphism, Claymorphism, Gen-Z

---

## Organic

**Philosophy**: Natural forms - soft, rounded, approachable

### Characteristics
- Border-radius generoso: 12-24px
- Curve morbide
- Sensazione "touchable"
- Angoli sempre arrotondati
- Forme che sembrano naturali

### CSS Implementation

```css
/* Organic Curves */
--radius-organic-sm: 12px;
--radius-organic-md: 16px;
--radius-organic-lg: 24px;
--radius-organic-full: 9999px;

.organic-card {
  border-radius: var(--radius-organic-lg);
}

.organic-button {
  border-radius: var(--radius-organic-full);
}

/* Soft corners proportional to size */
.organic-responsive {
  border-radius: min(24px, 10%);
}
```

### Compatible Styles
✓ Neumorphism, Glassmorphism, Claymorphism, Bento
○ Material, Spatial
✗ Flat (purista), Brutalism, Y2K (puro), Gen-Z

---

## Art Nouveau

**Philosophy**: Whiplash curves - flowing, asymmetric, nature-inspired

### Characteristics
- Curve asimmetriche
- Linee fluide e sinuose
- Border-radius variabile (non uniforme)
- Forme "blob" organiche
- Ispirazioni naturali (foglie, onde)

### CSS Implementation

```css
/* Art Nouveau Curves */
--radius-nouveau-blob: 30% 70% 70% 30% / 30% 30% 70% 70%;
--radius-nouveau-wave: 60% 40% 30% 70% / 60% 30% 70% 40%;

.nouveau-card {
  border-radius: var(--radius-nouveau-blob);
}

/* Animated blob */
.nouveau-animated {
  border-radius: var(--radius-nouveau-blob);
  animation: morph 8s ease-in-out infinite;
}

@keyframes morph {
  0%, 100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  50% {
    border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
  }
}

/* SVG curves */
.nouveau-divider {
  /* Use SVG path for complex curves */
}
```

### Compatible Styles
✓ Claymorphism
○ Glassmorphism, Gen-Z
✗ Flat, Material, Neumorphism, Brutalism, Skeuomorphism, Y2K, Bento, Swiss, Spatial

---

## Angular

**Philosophy**: Sharp, aggressive - cuts and diagonals

### Characteristics
- Angoli acuti (non 90°)
- Tagli diagonali
- Forme a punta
- Clip-path per forme custom
- Sensazione aggressiva/dinamica

### CSS Implementation

```css
/* Angular Curves */
.angular-card {
  clip-path: polygon(
    0 10%,
    100% 0,
    100% 90%,
    0 100%
  );
}

.angular-button {
  clip-path: polygon(
    10% 0,
    100% 0,
    90% 100%,
    0 100%
  );
}

/* Diagonal cut */
.angular-diagonal {
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    0 85%
  );
}

/* Arrow shape */
.angular-arrow {
  clip-path: polygon(
    0 0,
    80% 0,
    100% 50%,
    80% 100%,
    0 100%
  );
}

/* Slanted border */
.angular-slant {
  transform: skewX(-5deg);
}

.angular-slant > * {
  transform: skewX(5deg); /* Counter-skew content */
}
```

### Compatible Styles
✓ Brutalism, Y2K
○ Flat, Gen-Z, Spatial
✗ Neumorphism, Glassmorphism, Claymorphism, Bento, Material

---

## Modifier Selection Logic

### Based on Combined Weights

```
If warmth > 0.7 → prefer Organic
If formality > 0.7 → prefer Geometric
If playfulness > 0.7 → prefer Art Nouveau or Angular
If trust > 0.7 → prefer Geometric or Organic (safe choices)
If innovation > 0.8 AND formality < 0.4 → prefer Angular or Art Nouveau
```

### Default by Style

| Style | Default Curves |
|-------|----------------|
| Flat | Geometric |
| Material | Geometric (soft) |
| Neumorphism | Organic |
| Glassmorphism | Organic |
| Brutalism | Geometric (hard) |
| Claymorphism | Organic / Art Nouveau |
| Skeuomorphism | Geometric (soft) |
| Y2K | Mixed |
| Gen-Z | Mixed (intentionally inconsistent) |
| Bento | Organic |
| Spatial | Organic |

---

## Border Radius Reference

| Curves Type | Small | Medium | Large | Full |
|-------------|-------|--------|-------|------|
| Geometric | 0 | 2px | 4px | 50% |
| Organic | 8px | 12px | 24px | 9999px |
| Art Nouveau | blob | blob | blob | blob |
| Angular | clip-path | clip-path | clip-path | clip-path |

---

## Compatibility Matrix

| Curves | Flat | Material | Neu | Glass | Brutal | Clay | Skeu | Y2K | GenZ | Bento | Spatial |
|--------|------|----------|-----|-------|--------|------|------|-----|------|-------|---------|
| Geometric | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ○ | ○ | ○ | ○ |
| Organic | ○ | ○ | ✓ | ✓ | ✗ | ✓ | ○ | ○ | ✗ | ✓ | ✓ |
| Art Nouveau | ✗ | ✗ | ✗ | ○ | ✗ | ✓ | ✗ | ✗ | ○ | ✗ | ✗ |
| Angular | ○ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ○ | ✗ | ○ |

✓ = Recommended | ○ = Possible | ✗ = Incompatible

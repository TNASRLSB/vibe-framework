# Palette Modifiers

Schema colori dominante.

---

## Warm

**Mood**: Accogliente, friendly, inviting, comfortable

### Characteristics
- Hue range: 0-60 (rossi, aranci, gialli)
- Undertone caldo anche nei neutri
- Background: cream, beige, warm gray
- Sensazione: sole, calore, intimità

### CSS Implementation

```css
/* Warm Palette */
--warm-bg: hsl(30 30% 97%);
--warm-surface: hsl(30 20% 99%);
--warm-text: hsl(20 20% 15%);
--warm-text-muted: hsl(25 15% 45%);

/* Primary accents */
--warm-primary: hsl(25 90% 55%);      /* Orange */
--warm-primary-light: hsl(25 90% 70%);
--warm-primary-dark: hsl(25 90% 40%);

/* Secondary */
--warm-secondary: hsl(10 70% 55%);    /* Coral/Red */

/* Neutral with warm undertone */
--warm-gray-100: hsl(30 10% 95%);
--warm-gray-200: hsl(30 8% 85%);
--warm-gray-300: hsl(25 6% 70%);
--warm-gray-400: hsl(25 5% 55%);
--warm-gray-500: hsl(20 5% 40%);

/* Shadows */
--warm-shadow-color: 25 30% 20%;
```

### Compatible Styles
✓ Claymorphism, Skeuomorphism, Material
○ Flat, Glassmorphism, Bento
✗ Brutalism (prefers mono), Y2K, Spatial

---

## Cold

**Mood**: Professional, trustworthy, calm, clean

### Characteristics
- Hue range: 180-260 (cyan, blue, indigo)
- Undertone freddo nei neutri
- Background: cool white, slate gray
- Sensazione: affidabilità, tecnologia, calma

### CSS Implementation

```css
/* Cold Palette */
--cold-bg: hsl(220 20% 98%);
--cold-surface: hsl(220 30% 100%);
--cold-text: hsl(220 25% 12%);
--cold-text-muted: hsl(220 15% 45%);

/* Primary accents */
--cold-primary: hsl(220 80% 55%);     /* Blue */
--cold-primary-light: hsl(220 80% 70%);
--cold-primary-dark: hsl(220 80% 40%);

/* Secondary */
--cold-secondary: hsl(200 70% 50%);   /* Cyan */

/* Neutral with cold undertone */
--cold-gray-100: hsl(220 15% 95%);
--cold-gray-200: hsl(220 12% 85%);
--cold-gray-300: hsl(220 10% 70%);
--cold-gray-400: hsl(220 8% 55%);
--cold-gray-500: hsl(220 6% 40%);

/* Shadows */
--cold-shadow-color: 220 30% 15%;
```

### Compatible Styles
✓ Glassmorphism, Material, Neumorphism, Spatial, Bento
○ Flat, Skeuomorphism
✗ Claymorphism (prefers warm), Gen-Z

---

## Monochrome

**Mood**: Elegant, timeless, sophisticated, focused

### Characteristics
- Single hue + black + white
- Variazioni di lightness, non di hue
- Alto contrasto
- Focus sul contenuto, non sul colore
- Accent singolo (se presente)

### CSS Implementation

```css
/* Monochrome Palette */
--mono-black: hsl(0 0% 5%);
--mono-white: hsl(0 0% 100%);

/* Grayscale */
--mono-50: hsl(0 0% 98%);
--mono-100: hsl(0 0% 95%);
--mono-200: hsl(0 0% 85%);
--mono-300: hsl(0 0% 70%);
--mono-400: hsl(0 0% 55%);
--mono-500: hsl(0 0% 40%);
--mono-600: hsl(0 0% 30%);
--mono-700: hsl(0 0% 20%);
--mono-800: hsl(0 0% 12%);
--mono-900: hsl(0 0% 5%);

/* Optional single accent */
--mono-accent: hsl(0 70% 55%);  /* Red accent */

/* Text */
--mono-text: var(--mono-900);
--mono-text-muted: var(--mono-500);
--mono-bg: var(--mono-50);
--mono-surface: var(--mono-white);
```

### Compatible Styles
✓ Brutalism, Flat, Neumorphism
○ Material, Bento, Skeuomorphism
✗ Claymorphism, Gen-Z, Y2K (need color)

---

## Neon

**Mood**: Energetic, futuristic, youthful, bold

### Characteristics
- Colori altamente saturi (80-100%)
- Luminosità media-alta (50-70%)
- Background scuro per contrasto
- Glow effects
- Sensazione: nightclub, gaming, tech

### CSS Implementation

```css
/* Neon Palette */
--neon-bg: hsl(260 30% 8%);
--neon-surface: hsl(260 25% 12%);
--neon-text: hsl(0 0% 98%);
--neon-text-muted: hsl(260 20% 65%);

/* Neon colors */
--neon-pink: hsl(320 100% 60%);
--neon-cyan: hsl(180 100% 50%);
--neon-lime: hsl(90 100% 55%);
--neon-purple: hsl(280 100% 60%);
--neon-orange: hsl(30 100% 55%);
--neon-blue: hsl(220 100% 60%);

/* Glow effects */
--neon-glow-pink: 0 0 20px hsl(320 100% 60% / 0.5);
--neon-glow-cyan: 0 0 20px hsl(180 100% 50% / 0.5);
--neon-glow-lime: 0 0 20px hsl(90 100% 55% / 0.5);

/* Usage */
.neon-text {
  color: var(--neon-cyan);
  text-shadow: var(--neon-glow-cyan);
}

.neon-border {
  border: 2px solid var(--neon-pink);
  box-shadow: var(--neon-glow-pink);
}
```

### Compatible Styles
✓ Y2K, Gen-Z, Glassmorphism, Spatial
○ Brutalism
✗ Neumorphism, Claymorphism, Skeuomorphism, Material, Flat

---

## Earth

**Mood**: Natural, organic, sustainable, grounded

### Characteristics
- Toni della terra: marroni, verdi, ocra
- Desaturati ma caldi
- Background: sabbia, pietra, carta
- Sensazione: natura, artigianato, autenticità

### CSS Implementation

```css
/* Earth Palette */
--earth-bg: hsl(40 25% 95%);
--earth-surface: hsl(40 30% 98%);
--earth-text: hsl(30 30% 15%);
--earth-text-muted: hsl(35 20% 45%);

/* Earth tones */
--earth-sand: hsl(40 35% 85%);
--earth-clay: hsl(20 40% 55%);
--earth-forest: hsl(140 30% 35%);
--earth-stone: hsl(30 15% 50%);
--earth-bark: hsl(25 50% 25%);
--earth-moss: hsl(90 25% 45%);

/* Accent */
--earth-accent: hsl(25 70% 50%);  /* Terracotta */

/* Shadows with warm undertone */
--earth-shadow: 0 4px 12px hsl(30 30% 20% / 0.15);
```

### Compatible Styles
✓ Skeuomorphism, Claymorphism
○ Flat, Material, Bento
✗ Glassmorphism, Brutalism, Y2K, Gen-Z, Spatial

---

## Jewel

**Mood**: Luxurious, rich, deep, sophisticated

### Characteristics
- Colori profondi e saturi
- Ispirazione: gemme (smeraldo, rubino, zaffiro)
- Background scuro o ricco
- Sensazione: lusso, eleganza, premium

### CSS Implementation

```css
/* Jewel Palette */
--jewel-bg: hsl(260 40% 8%);
--jewel-surface: hsl(260 35% 12%);
--jewel-text: hsl(45 30% 95%);
--jewel-text-muted: hsl(260 20% 65%);

/* Jewel tones */
--jewel-emerald: hsl(160 70% 35%);
--jewel-ruby: hsl(350 70% 45%);
--jewel-sapphire: hsl(220 70% 45%);
--jewel-amethyst: hsl(280 60% 50%);
--jewel-topaz: hsl(40 80% 50%);
--jewel-onyx: hsl(0 0% 10%);

/* Gold accent */
--jewel-gold: hsl(45 80% 55%);
--jewel-gold-light: hsl(45 70% 70%);

/* Gradients */
--jewel-gradient: linear-gradient(135deg,
  var(--jewel-emerald) 0%,
  var(--jewel-sapphire) 100%);
```

### Compatible Styles
✓ Glassmorphism, Skeuomorphism, Spatial
○ Material, Bento
✗ Flat (prefers vibrant), Brutalism, Claymorphism, Neumorphism, Gen-Z, Y2K

---

## Modifier Selection Logic

### Based on Combined Weights

```
If warmth > 0.7 → prefer Warm or Earth
If trust > 0.7 → prefer Cold or Monochrome
If playfulness > 0.7 → prefer Neon or Warm
If formality > 0.7 → prefer Cold or Monochrome
If innovation > 0.7 AND playfulness > 0.5 → prefer Neon
```

### Default by Industry (examples)

| Industry | Suggested Palette |
|----------|------------------|
| Fintech | Cold |
| Healthcare | Cold or Monochrome |
| Creative | Warm or Neon |
| Luxury | Jewel or Monochrome |
| Kids | Warm or Neon |
| Enterprise | Cold |
| Eco/Organic | Earth |

---

## Compatibility Matrix

| Palette | Flat | Material | Neu | Glass | Brutal | Clay | Skeu | Y2K | GenZ | Bento | Spatial |
|---------|------|----------|-----|-------|--------|------|------|-----|------|-------|---------|
| Warm | ✓ | ✓ | ○ | ○ | ○ | ✓ | ✓ | ✗ | ○ | ✓ | ✗ |
| Cold | ✓ | ✓ | ✓ | ✓ | ○ | ✗ | ○ | ○ | ✗ | ✓ | ✓ |
| Mono | ✓ | ○ | ✓ | ○ | ✓ | ○ | ○ | ✗ | ✗ | ✓ | ○ |
| Neon | ✗ | ○ | ✗ | ✓ | ○ | ✗ | ✗ | ✓ | ✓ | ○ | ✓ |
| Earth | ✓ | ○ | ○ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ○ | ✗ |
| Jewel | ○ | ○ | ✗ | ✓ | ✗ | ✗ | ✓ | ○ | ✗ | ○ | ✓ |

✓ = Recommended | ○ = Possible | ✗ = Incompatible

# Grid Modifiers

Come gli elementi sono posizionati nello spazio.

---

## Swiss

**Origin**: Swiss Style / International Typographic Style (1940s-60s)
**Philosophy**: Order through mathematics - the grid as moral foundation

### Characteristics
- Griglia rigorosa basata su multipli (8px, 12px)
- Allineamento perfetto su baseline e colonne
- Gerarchia attraverso la griglia, non decorazione
- Whitespace calcolato, non casuale
- Tipografia allineata a sinistra

### CSS Implementation

```css
/* Swiss Grid System */
.swiss-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px; /* 3 × 8px */
  padding: 48px; /* 6 × 8px */
}

/* Baseline grid */
.swiss-text {
  line-height: 1.5; /* 24px at 16px base */
  margin-bottom: 24px; /* align to baseline */
}

/* Column spans */
.swiss-col-4 { grid-column: span 4; }
.swiss-col-6 { grid-column: span 6; }
.swiss-col-8 { grid-column: span 8; }
```

### Compatible Styles
✓ Flat, Material, Neumorphism, Bento, Skeuomorphism
○ Glassmorphism, Spatial
✗ Brutalism, Gen-Z, Y2K

---

## Bauhaus

**Origin**: Bauhaus school (1919-1933)
**Philosophy**: Geometric purity, asymmetric balance

### Characteristics
- Forme geometriche pure (cerchio, quadrato, triangolo)
- Asimmetria bilanciata (non centrato, ma equilibrato)
- Colori primari + nero/bianco
- Intersezione di forme
- Tipografia come elemento grafico

### CSS Implementation

```css
/* Bauhaus Layout */
.bauhaus-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto 1fr auto;
  gap: 0; /* Elements touch */
}

/* Geometric shapes */
.bauhaus-circle {
  border-radius: 50%;
  aspect-ratio: 1;
}

.bauhaus-overlap {
  position: relative;
  z-index: 1;
  margin-left: -20%;
}

/* Primary colors */
.bauhaus-red { background: #E53935; }
.bauhaus-blue { background: #1E88E5; }
.bauhaus-yellow { background: #FDD835; }
```

### Compatible Styles
✓ Flat, Material, Brutalism
○ Neumorphism, Claymorphism, Skeuomorphism
✗ Gen-Z, Y2K, Glassmorphism

---

## Bento

**Origin**: Japanese bento boxes, Apple design (2023+)
**Philosophy**: Compartmentalized containers, each with purpose

### Characteristics
- Celle di dimensioni diverse (1×1, 2×1, 1×2, 2×2)
- Gap uniforme tra tutte le celle
- Ogni cella isolata (un concetto per cella)
- Gerarchia attraverso dimensione celle
- Border-radius consistente

### CSS Implementation

```css
/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 16px;
}

/* Cell sizes */
.bento-1x1 { /* default */ }
.bento-2x1 { grid-column: span 2; }
.bento-1x2 { grid-row: span 2; }
.bento-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

/* Consistent styling */
.bento-cell {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
}
```

### Compatible Styles
✓ Flat, Material, Glassmorphism, Bento (native), Spatial
○ Neumorphism, Claymorphism, Skeuomorphism
✗ Brutalism, Gen-Z

---

## Asymmetric

**Origin**: Modernist design, editorial layouts
**Philosophy**: Intentional imbalance creates visual tension

### Characteristics
- Elementi off-center (mai 50/50)
- Proporzioni insolite (60/40, 70/30)
- Allineamento a un margine, non centrato
- Whitespace come elemento attivo
- Tensione visiva intenzionale

### CSS Implementation

```css
/* Asymmetric Layout */
.asymmetric-container {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 70/30 split */
  gap: 48px;
}

/* Off-center positioning */
.asymmetric-hero {
  margin-left: 15%;
  width: 70%;
}

/* Unequal spacing */
.asymmetric-section {
  padding-top: 120px;
  padding-bottom: 60px; /* intentionally different */
}

/* Alignment */
.asymmetric-text {
  text-align: left;
  max-width: 60ch;
  /* NOT margin: auto */
  margin-left: 10%;
}
```

### Compatible Styles
✓ Glassmorphism, Brutalism, Y2K, Gen-Z, Spatial
○ Flat, Material
✗ Neumorphism, Bento, Swiss

---

## Broken

**Origin**: Experimental design, anti-grid movement
**Philosophy**: Grid exists to be violated

### Characteristics
- Elementi che "escono" dai confini
- Overlap intenzionale
- Rotazione di elementi
- Bleed oltre i margini
- Grid visibile ma rotto

### CSS Implementation

```css
/* Broken Grid */
.broken-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  /* Allow overflow */
  overflow: visible;
}

/* Element breaking out */
.broken-element {
  grid-column: 3 / 11;
  /* Break the grid */
  margin-left: -10%;
  margin-right: -5%;
  transform: rotate(-2deg);
}

/* Overlap */
.broken-overlap {
  position: relative;
  z-index: 2;
  margin-top: -60px;
}

/* Bleed */
.broken-bleed {
  width: calc(100% + 100px);
  margin-left: -50px;
}

/* Rotation */
.broken-rotate {
  transform: rotate(var(--rotation, 3deg));
}
```

### Compatible Styles
✓ Brutalism, Y2K, Gen-Z
○ Glassmorphism, Spatial
✗ Swiss, Material, Neumorphism, Bento, Skeuomorphism, Claymorphism

---

## Modifier Selection Logic

### Based on Combined Weights

```
If formality > 0.7 → prefer Swiss
If formality < 0.3 AND playfulness > 0.6 → prefer Broken or Asymmetric
If density > 0.6 → prefer Swiss or Bento
If innovation > 0.7 → prefer Asymmetric or Broken
```

### Default by Style

| Style | Default Grid |
|-------|--------------|
| Flat | Swiss |
| Material | Swiss |
| Neumorphism | Swiss |
| Glassmorphism | Bento |
| Brutalism | Asymmetric |
| Claymorphism | Bento |
| Skeuomorphism | Swiss |
| Y2K | Broken |
| Gen-Z | Broken |
| Bento | Bento |
| Spatial | Asymmetric |

---

## Compatibility Matrix

| Grid | Flat | Material | Neu | Glass | Brutal | Clay | Skeu | Y2K | GenZ | Bento | Spatial |
|------|------|----------|-----|-------|--------|------|------|-----|------|-------|---------|
| Swiss | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | ○ | ✗ | ✓ | ○ |
| Bauhaus | ✓ | ○ | ○ | ○ | ✓ | ○ | ○ | ○ | ○ | ○ | ○ |
| Bento | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ○ | ○ | ○ | ✓ | ○ |
| Asymmetric | ○ | ○ | ✗ | ○ | ✓ | ○ | ✗ | ✓ | ✓ | ○ | ✓ |
| Broken | ✗ | ✗ | ✗ | ○ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ○ |

✓ = Recommended | ○ = Possible | ✗ = Incompatible

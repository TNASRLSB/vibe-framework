# Styles Index

Database di stili UI codificati per il sistema generativo.

---

## Overview

Il sistema include:
- **11 stili base** - Linguaggi visivi completi
- **4 categorie di modifiers** - Modificatori ortogonali combinabili

---

## Stili Base

| Style | Era | Personality | Depth | Best For |
|-------|-----|-------------|-------|----------|
| [Flat](base/flat.md) | 2012+ | Minimale, pulito, essenziale | 0 | Mobile, content-first |
| [Material](base/material.md) | 2014+ | Fisico, responsive, layered | 2-24dp | Apps, dashboards |
| [Neumorphism](base/neumorphism.md) | 2019+ | Soft, tactile, monochrome | ±1mm | Premium, minimal |
| [Glassmorphism](base/glassmorphism.md) | 2020+ | Trasparente, moderno, layered | Blur | Modern apps, landing |
| [Brutalism](base/brutalism.md) | 2017+ | Raw, bold, anti-design | 0 | Creative, editorial |
| [Claymorphism](base/claymorphism.md) | 2022+ | Soft, playful, 3D | 4-6mm | Friendly apps |
| [Skeuomorphism](base/skeuomorphism.md) | 2007+ | Realistic, familiar, detailed | Variable | AR/VR, IoT |
| [Y2K](base/y2k.md) | 2000/2024 | Chrome, neon, nostalgic | 3mm | Creative, Gen Z |
| [Gen-Z](base/gen-z.md) | 2024+ | Chaotic, authentic, glitch | Variable | Youth, social |
| [Bento](base/bento.md) | 2023+ | Compartmentalized, Apple-style | 0.5mm | Product, portfolio |
| [Spatial](base/spatial.md) | 2024+ | 3D, immersive, parallax | ±100mm | AR/VR, innovative |

---

## Modifier Categories

### Grid
Come gli elementi sono posizionati nello spazio.

| Modifier | Description |
|----------|-------------|
| Swiss | Griglia rigorosa 8px, allineamento perfetto |
| Bauhaus | Geometria pura, asimmetria bilanciata |
| Bento | Compartimenti, box indipendenti |
| Asymmetric | Off-grid intenzionale, tensione visiva |
| Broken | Griglia violata, elementi che "escono" |

### Curves
Come sono i bordi e le linee.

| Modifier | Description |
|----------|-------------|
| Geometric | Angoli netti, linee rette, 0-4px radius |
| Organic | Bordi morbidi, forme naturali, 12-24px radius |
| Art Nouveau | Curve fluide, asimmetriche, whiplash |
| Angular | Angoli acuti, tagli diagonali |

### Palette
Schema colori dominante.

| Modifier | Description |
|----------|-------------|
| Warm | Rossi, aranci, gialli, terre |
| Cold | Blu, grigi, verdi freddi |
| Monochrome | Singola hue con variazioni di lightness |
| Neon | Colori saturi, fluorescenti |
| Earth | Toni naturali, marroni, verdi |
| Jewel | Colori profondi, smeraldo, rubino, ametista |

### Density
Quanto è "piena" l'interfaccia.

| Modifier | Description |
|----------|-------------|
| Sparse | Molto whitespace, elementi isolati |
| Balanced | Equilibrio tra contenuto e respiro |
| Dense | Informazione concentrata, poco whitespace |
| Claustrophobic | Massima densità, quasi oppressivo |

---

## Compatibility Matrix

Non tutte le combinazioni stile + modifier funzionano.

### Grid Compatibility

| Style | Swiss | Bauhaus | Bento | Asymmetric | Broken |
|-------|-------|---------|-------|------------|--------|
| Flat | ✓ | ✓ | ✓ | ○ | ✗ |
| Material | ✓ | ○ | ✓ | ○ | ✗ |
| Neumorphism | ✓ | ○ | ✓ | ✗ | ✗ |
| Glassmorphism | ✓ | ○ | ✓ | ○ | ○ |
| Brutalism | ○ | ✓ | ✗ | ✓ | ✓ |
| Claymorphism | ○ | ○ | ✓ | ○ | ✗ |
| Skeuomorphism | ✓ | ○ | ○ | ✗ | ✗ |
| Y2K | ○ | ○ | ○ | ✓ | ✓ |
| Gen-Z | ✗ | ○ | ○ | ✓ | ✓ |
| Bento | ✓ | ○ | ✓ | ○ | ✗ |
| Spatial | ○ | ○ | ○ | ✓ | ○ |

✓ = Recommended | ○ = Possible | ✗ = Incompatible

### Palette Compatibility

| Style | Warm | Cold | Mono | Neon | Earth | Jewel |
|-------|------|------|------|------|-------|-------|
| Flat | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Material | ✓ | ✓ | ○ | ○ | ○ | ○ |
| Neumorphism | ○ | ✓ | ✓ | ✗ | ○ | ✗ |
| Glassmorphism | ○ | ✓ | ○ | ✓ | ✗ | ✓ |
| Brutalism | ○ | ○ | ✓ | ✓ | ✗ | ✗ |
| Claymorphism | ✓ | ○ | ○ | ○ | ○ | ○ |
| Skeuomorphism | ✓ | ○ | ○ | ✗ | ✓ | ✓ |
| Y2K | ○ | ○ | ○ | ✓ | ✗ | ○ |
| Gen-Z | ✓ | ○ | ○ | ✓ | ✗ | ○ |
| Bento | ✓ | ✓ | ✓ | ○ | ○ | ○ |
| Spatial | ○ | ✓ | ○ | ✓ | ✗ | ✓ |

---

## Style Weight Profiles

Ogni stile ha "ideal weights" - i contesti dove funziona meglio.

| Style | trust | innovation | formality | warmth | playfulness | density |
|-------|-------|------------|-----------|--------|-------------|---------|
| Flat | 0.5 | 0.6 | 0.5 | 0.4 | 0.3 | 0.5 |
| Material | 0.6 | 0.6 | 0.6 | 0.5 | 0.4 | 0.6 |
| Neumorphism | 0.6 | 0.7 | 0.5 | 0.4 | 0.3 | 0.3 |
| Glassmorphism | 0.5 | 0.8 | 0.5 | 0.4 | 0.5 | 0.4 |
| Brutalism | 0.3 | 0.7 | 0.2 | 0.2 | 0.6 | 0.5 |
| Claymorphism | 0.4 | 0.6 | 0.3 | 0.8 | 0.8 | 0.4 |
| Skeuomorphism | 0.7 | 0.4 | 0.6 | 0.6 | 0.4 | 0.5 |
| Y2K | 0.3 | 0.7 | 0.2 | 0.5 | 0.7 | 0.5 |
| Gen-Z | 0.3 | 0.8 | 0.1 | 0.6 | 0.9 | 0.6 |
| Bento | 0.6 | 0.7 | 0.6 | 0.5 | 0.4 | 0.5 |
| Spatial | 0.5 | 0.9 | 0.5 | 0.4 | 0.6 | 0.4 |

---

## File Structure

```
styles/
├── index.md              # This file
├── base/
│   ├── flat.md
│   ├── material.md
│   ├── neumorphism.md
│   ├── glassmorphism.md
│   ├── brutalism.md
│   ├── claymorphism.md
│   ├── skeuomorphism.md
│   ├── y2k.md
│   ├── gen-z.md
│   ├── bento.md
│   └── spatial.md
└── modifiers/
    ├── grid.md
    ├── curves.md
    ├── palette.md
    └── density.md
```

---

## How Styles Are Used

### In Safe Mode
1. Combined weights calcolati da Type + Industry + Target
2. Fit score calcolato per ogni stile
3. Stile con highest fit score selezionato
4. Modifiers selezionati per complementare

### In Chaos Mode
1. Stile estratto random
2. 2 modifiers estratti random da categorie diverse
3. Compatibility verificata
4. Se incompatibile, ri-estrazione

### In Hybrid Mode
1. Come Safe mode per selezione base
2. Factor X applicato sopra
3. Factor X può violare compatibility (intenzionalmente)

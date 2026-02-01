# Profiles by Industry

Profili per settore/industria.

---

## Finance & Business

### Fintech

```yaml
id: ind-fintech
name: Fintech (Banking, Crypto, Trading)

visual_weights:
  trust: 0.8
  innovation: 0.7
  formality: 0.6
  warmth: 0.3
  playfulness: 0.2
  density: 0.5

style_affinities:
  high: [glassmorphism, material]
  medium: [flat, bento, spatial]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7, mono: 0.2}
  grid: {swiss: 0.6, bento: 0.3}
  curves: {geometric: 0.5, organic: 0.4}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.6
  playfulness.max: 0.4
```

### Insurance

```yaml
id: ind-insurance
name: Insurance

visual_weights:
  trust: 0.9
  innovation: 0.3
  formality: 0.8
  warmth: 0.4
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6}
  density: {balanced: 0.7}

hard_constraints:
  trust.min: 0.7
  formality.min: 0.6
```

### Accounting

```yaml
id: ind-accounting
name: Accounting Software

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.7

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.8}
  curves: {geometric: 0.7}
  density: {dense: 0.5, balanced: 0.4}
```

### Investment

```yaml
id: ind-investment
name: Investment (Wealth Management)

visual_weights:
  trust: 0.9
  innovation: 0.4
  formality: 0.8
  warmth: 0.3
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [glassmorphism, bento]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, jewel: 0.3}
  grid: {swiss: 0.7}
  curves: {geometric: 0.5, organic: 0.4}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.7
```

---

## Healthcare

### Medtech

```yaml
id: ind-medtech
name: Medtech (Medical Devices)

visual_weights:
  trust: 0.8
  innovation: 0.6
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [glassmorphism, spatial]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, bento, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7, mono: 0.2}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.7
```

### Healthcare Services

```yaml
id: ind-healthcare
name: Healthcare Services (Clinics, Hospitals)

visual_weights:
  trust: 0.9
  innovation: 0.4
  formality: 0.6
  warmth: 0.6
  playfulness: 0.2
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [claymorphism, bento]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, warm: 0.4}
  grid: {swiss: 0.7}
  curves: {organic: 0.6}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.7
```

### Mental Health

```yaml
id: ind-mentalhealth
name: Mental Health (Therapy, Wellness)

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.4
  warmth: 0.8
  playfulness: 0.3
  density: 0.3

style_affinities:
  high: [flat, claymorphism, neumorphism]
  medium: [material, bento]
  low: [glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.6, earth: 0.3}
  grid: {swiss: 0.5}
  curves: {organic: 0.8}
  density: {sparse: 0.6}
```

### Pharma

```yaml
id: ind-pharma
name: Pharmaceutical

visual_weights:
  trust: 0.9
  innovation: 0.5
  formality: 0.8
  warmth: 0.3
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: []
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.8
  formality.min: 0.7
```

---

## Technology

### AI/ML

```yaml
id: ind-ai
name: AI/ML (Artificial Intelligence)

visual_weights:
  trust: 0.5
  innovation: 0.9
  formality: 0.5
  warmth: 0.3
  playfulness: 0.4
  density: 0.4

style_affinities:
  high: [glassmorphism, spatial, bento]
  medium: [flat, material]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, neon: 0.3, jewel: 0.2}
  grid: {bento: 0.5, asymmetric: 0.3}
  curves: {organic: 0.5}
  density: {balanced: 0.5, sparse: 0.4}
```

### DevTools

```yaml
id: ind-devtools
name: Developer Tools

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.4
  warmth: 0.3
  playfulness: 0.3
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento, brutalism]
  low: [neumorphism, glassmorphism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.6, cold: 0.3}
  grid: {swiss: 0.7}
  curves: {geometric: 0.7}
  density: {balanced: 0.5, dense: 0.4}
```

### Cybersecurity

```yaml
id: ind-cybersecurity
name: Cybersecurity

visual_weights:
  trust: 0.8
  innovation: 0.6
  formality: 0.6
  warmth: 0.2
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [glassmorphism, spatial]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, bento, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7, neon: 0.2}
  grid: {swiss: 0.7}
  curves: {geometric: 0.6}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.6
```

### Blockchain/Web3

```yaml
id: ind-web3
name: Blockchain/Web3 (Crypto, DeFi, NFT)

visual_weights:
  trust: 0.5
  innovation: 0.9
  formality: 0.3
  warmth: 0.3
  playfulness: 0.5
  density: 0.4

style_affinities:
  high: [glassmorphism, spatial, y2k]
  medium: [bento, gen-z]
  low: [flat, material, neumorphism, brutalism, claymorphism, skeuomorphism]

modifier_tendencies:
  palette: {neon: 0.6, jewel: 0.3}
  grid: {asymmetric: 0.5, bento: 0.4}
  curves: {organic: 0.5}
  density: {balanced: 0.5}
```

### IoT

```yaml
id: ind-iot
name: IoT (Internet of Things)

visual_weights:
  trust: 0.6
  innovation: 0.7
  formality: 0.5
  warmth: 0.4
  playfulness: 0.3
  density: 0.5

style_affinities:
  high: [material, flat, skeuomorphism]
  medium: [glassmorphism, spatial]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, bento]

modifier_tendencies:
  palette: {cold: 0.5, mono: 0.4}
  grid: {swiss: 0.6}
  curves: {organic: 0.5}
  density: {balanced: 0.6}
```

---

## Creative & Media

### Design Agency

```yaml
id: ind-design
name: Design Agency

visual_weights:
  trust: 0.4
  innovation: 0.8
  formality: 0.3
  warmth: 0.5
  playfulness: 0.6
  density: 0.3

style_affinities:
  high: [brutalism, bento, spatial, glassmorphism]
  medium: [flat, gen-z, y2k]
  low: [material, neumorphism, claymorphism, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.4, neon: 0.3}
  grid: {asymmetric: 0.5, broken: 0.3}
  curves: {mixed: 0.5}
  density: {sparse: 0.6}
```

### Photography

```yaml
id: ind-photography
name: Photography

visual_weights:
  trust: 0.4
  innovation: 0.5
  formality: 0.4
  warmth: 0.5
  playfulness: 0.3
  density: 0.3

style_affinities:
  high: [flat, bento, brutalism]
  medium: [glassmorphism]
  low: [material, neumorphism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.7}
  grid: {bento: 0.5, asymmetric: 0.4}
  curves: {geometric: 0.5}
  density: {sparse: 0.7}
```

### Music

```yaml
id: ind-music
name: Music (Labels, Artists)

visual_weights:
  trust: 0.3
  innovation: 0.7
  formality: 0.2
  warmth: 0.5
  playfulness: 0.7
  density: 0.4

style_affinities:
  high: [brutalism, y2k, gen-z, glassmorphism]
  medium: [spatial, bento]
  low: [flat, material, neumorphism, claymorphism, skeuomorphism]

modifier_tendencies:
  palette: {neon: 0.5, mono: 0.3}
  grid: {broken: 0.4, asymmetric: 0.4}
  curves: {mixed: 0.5}
  density: {balanced: 0.5}
```

### Fashion

```yaml
id: ind-fashion
name: Fashion

visual_weights:
  trust: 0.4
  innovation: 0.7
  formality: 0.5
  warmth: 0.4
  playfulness: 0.5
  density: 0.3

style_affinities:
  high: [brutalism, bento, flat]
  medium: [glassmorphism, y2k]
  low: [material, neumorphism, claymorphism, gen-z, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.5, jewel: 0.3}
  grid: {asymmetric: 0.5, bento: 0.4}
  curves: {geometric: 0.5}
  density: {sparse: 0.6}
```

### Art

```yaml
id: ind-art
name: Art (Galleries, Artists)

visual_weights:
  trust: 0.3
  innovation: 0.8
  formality: 0.3
  warmth: 0.4
  playfulness: 0.5
  density: 0.2

style_affinities:
  high: [brutalism, flat, bento]
  medium: [glassmorphism, spatial]
  low: [material, neumorphism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.6}
  grid: {asymmetric: 0.5}
  curves: {mixed: 0.5}
  density: {sparse: 0.8}
```

---

## Commerce

### Retail

```yaml
id: ind-retail
name: Retail (B2C)

visual_weights:
  trust: 0.6
  innovation: 0.4
  formality: 0.4
  warmth: 0.6
  playfulness: 0.4
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento, claymorphism]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5}
  grid: {swiss: 0.6, bento: 0.3}
  curves: {organic: 0.5}
  density: {balanced: 0.5, dense: 0.4}
```

### Wholesale/B2B

```yaml
id: ind-wholesale
name: Wholesale/B2B

visual_weights:
  trust: 0.7
  innovation: 0.3
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.7

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6}
  density: {dense: 0.5, balanced: 0.4}
```

### Marketplace

```yaml
id: ind-marketplace
name: Marketplace (Multi-vendor)

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.4
  warmth: 0.5
  playfulness: 0.3
  density: 0.6

style_affinities:
  high: [flat, material, bento]
  medium: []
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.4, cold: 0.4}
  grid: {swiss: 0.6, bento: 0.3}
  curves: {organic: 0.5}
  density: {balanced: 0.5, dense: 0.4}
```

---

## Services

### Legal

```yaml
id: ind-legal
name: Legal (Law Firms)

visual_weights:
  trust: 0.9
  innovation: 0.2
  formality: 0.9
  warmth: 0.3
  playfulness: 0.0
  density: 0.5

style_affinities:
  high: [flat]
  medium: [material]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.9}
  curves: {geometric: 0.7}
  density: {balanced: 0.7}

hard_constraints:
  trust.min: 0.8
  formality.min: 0.8
  playfulness.max: 0.2
```

### Consulting

```yaml
id: ind-consulting
name: Consulting

visual_weights:
  trust: 0.8
  innovation: 0.5
  formality: 0.7
  warmth: 0.4
  playfulness: 0.2
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [bento, glassmorphism]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6}
  grid: {swiss: 0.7}
  curves: {geometric: 0.5}
  density: {balanced: 0.6}
```

---

## Lifestyle & Consumer

### Food & Beverage

```yaml
id: ind-food
name: Food & Beverage

visual_weights:
  trust: 0.5
  innovation: 0.4
  formality: 0.3
  warmth: 0.8
  playfulness: 0.5
  density: 0.4

style_affinities:
  high: [flat, claymorphism]
  medium: [material, bento]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.7, earth: 0.2}
  grid: {swiss: 0.5, bento: 0.4}
  curves: {organic: 0.7}
  density: {balanced: 0.6}
```

### Travel & Hospitality

```yaml
id: ind-travel
name: Travel & Hospitality

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.4
  warmth: 0.6
  playfulness: 0.4
  density: 0.4

style_affinities:
  high: [flat, bento, glassmorphism]
  medium: [material]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, jewel: 0.3}
  grid: {bento: 0.5}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Fitness & Wellness

```yaml
id: ind-fitness
name: Fitness & Wellness

visual_weights:
  trust: 0.5
  innovation: 0.5
  formality: 0.3
  warmth: 0.6
  playfulness: 0.5
  density: 0.4

style_affinities:
  high: [flat, material, claymorphism]
  medium: [bento, glassmorphism]
  low: [neumorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, neon: 0.3}
  grid: {swiss: 0.5, bento: 0.4}
  curves: {organic: 0.7}
  density: {balanced: 0.6}
```

### Gaming

```yaml
id: ind-gaming
name: Gaming (Games, E-sports)

visual_weights:
  trust: 0.3
  innovation: 0.7
  formality: 0.2
  warmth: 0.4
  playfulness: 0.8
  density: 0.5

style_affinities:
  high: [y2k, gen-z, glassmorphism, spatial]
  medium: [brutalism]
  low: [flat, material, neumorphism, claymorphism, bento, skeuomorphism]

modifier_tendencies:
  palette: {neon: 0.7}
  grid: {asymmetric: 0.5, broken: 0.3}
  curves: {angular: 0.5}
  density: {balanced: 0.5}
```

### Pets

```yaml
id: ind-pets
name: Pets

visual_weights:
  trust: 0.5
  innovation: 0.4
  formality: 0.2
  warmth: 0.8
  playfulness: 0.7
  density: 0.4

style_affinities:
  high: [claymorphism, flat]
  medium: [material, bento]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.7}
  grid: {swiss: 0.5}
  curves: {organic: 0.8}
  density: {balanced: 0.6}
```

---

## Industrial & Public

### Government

```yaml
id: ind-government
name: Government

visual_weights:
  trust: 0.9
  innovation: 0.2
  formality: 0.9
  warmth: 0.3
  playfulness: 0.0
  density: 0.6

style_affinities:
  high: [flat]
  medium: [material]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.9}
  curves: {geometric: 0.7}
  density: {balanced: 0.6}

hard_constraints:
  trust.min: 0.8
  formality.min: 0.8
  playfulness.max: 0.1
```

### Energy

```yaml
id: ind-energy
name: Energy (Renewables, Oil & Gas)

visual_weights:
  trust: 0.7
  innovation: 0.5
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, earth: 0.3}
  grid: {swiss: 0.7}
  curves: {geometric: 0.6}
  density: {balanced: 0.6}
```

### Manufacturing

```yaml
id: ind-manufacturing
name: Manufacturing

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, mono: 0.4}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6}
  density: {balanced: 0.5, dense: 0.4}
```

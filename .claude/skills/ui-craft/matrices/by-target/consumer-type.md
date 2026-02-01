# Target Profiles: Consumer Type

Profili basati sul modello di business e tipo di relazione commerciale.

---

## B2B (Business to Business)

**Descrizione**: Vendita ad altre aziende

### Visual Weights

```yaml
trust: 0.85        # Decisioni di gruppo, budget alti
innovation: 0.45   # Prudenti
formality: 0.8     # Professionale sempre
warmth: 0.35       # Funzionalità prima
playfulness: 0.15  # Minima
density: 0.7       # Molte feature, confronti
```

### Style Affinities

```yaml
high:
  - material       # Enterprise standard
  - flat           # Professionale
  - bento          # Dashboard, pricing tables
medium:
  - glassmorphism  # Premium B2B
  - spatial        # Analytics avanzate
low:
  - neumorphism    # Non aggiunge valore
  - claymorphism   # Troppo casual
  - skeuomorphism  # Datato
forbidden:
  - brutalism      # Spaventa decision makers
  - gen-z          # Non appropriato
  - y2k            # Non professionale
```

### Modifier Tendencies

```yaml
grid: swiss        # Ordine, comparazione
curves: geometric  # Business
palette: cold      # Professionale
density: dense     # Feature comparison
```

### Key Elements

- Case studies prominenti
- ROI calculator
- Comparison tables
- Enterprise badges
- Security certifications

---

## B2C (Business to Consumer)

**Descrizione**: Vendita diretta al consumatore

### Visual Weights

```yaml
trust: 0.65        # Recensioni, garanzie
innovation: 0.6    # Trend-aware
formality: 0.4     # Più rilassato
warmth: 0.7        # Connessione emotiva
playfulness: 0.55  # Brand personality
density: 0.45      # Non sovraccarico
```

### Style Affinities

```yaml
high:
  - flat           # E-commerce standard
  - glassmorphism  # Premium products
  - bento          # Product showcase
medium:
  - material       # App-like experience
  - claymorphism   # Friendly brands
  - neumorphism    # Luxury products
  - gen-z          # Youth brands
low:
  - brutalism      # Rischio conversioni
  - spatial        # Complessità eccessiva
forbidden:
  - nessuno specifico # Dipende dal prodotto
```

### Modifier Tendencies

```yaml
grid: bento        # Product cards
curves: organic    # Inviting
palette: warm      # Emotional connection
density: balanced  # Browse-friendly
```

### Key Elements

- Hero imagery forte
- Social proof
- Easy checkout
- Trust badges
- Mobile-first

---

## C2C (Consumer to Consumer)

**Descrizione**: Piattaforme dove utenti vendono ad altri utenti

### Visual Weights

```yaml
trust: 0.6         # Rating system
innovation: 0.55   # Community driven
formality: 0.25    # Casual
warmth: 0.75       # Community feel
playfulness: 0.5   # Social aspect
density: 0.6       # Listings, filters
```

### Style Affinities

```yaml
high:
  - flat           # Pulito, listings
  - bento          # Card-based UI
  - material       # Familiar patterns
medium:
  - glassmorphism  # Premium feel
  - gen-z          # Younger marketplaces
low:
  - brutalism      # Confonde utenti
  - spatial        # Non necessario
  - neumorphism    # Indifferente
forbidden:
  - y2k            # Random
```

### Modifier Tendencies

```yaml
grid: bento        # Listing grid
curves: organic    # Community feel
palette: warm      # Friendly
density: balanced  # Scannable
```

### Key Elements

- Rating/review prominenti
- Seller profiles
- Search/filter robusti
- Chat/messaging
- Safety features

---

## D2C (Direct to Consumer)

**Descrizione**: Brand che vendono direttamente, no intermediari

### Visual Weights

```yaml
trust: 0.7         # Brand trust
innovation: 0.7    # Brand differentiation
formality: 0.35    # Brand personality
warmth: 0.75       # Direct relationship
playfulness: 0.6   # Brand expression
density: 0.4       # Story-driven, not overwhelming
```

### Style Affinities

```yaml
high:
  - glassmorphism  # Premium brand feel
  - bento          # Product showcase
  - flat           # Modern brands
medium:
  - claymorphism   # Playful brands
  - neumorphism    # Luxury D2C
  - gen-z          # Youth brands
  - spatial        # Innovative brands
low:
  - material       # Troppo generico
  - brutalism      # Solo brand specifici
forbidden:
  - skeuomorphism  # Datato per D2C
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Brand storytelling
curves: organic    # Brand warmth
palette: warm      # Brand connection
density: sparse    # Premium feel
```

### Key Elements

- Brand story prominente
- Instagram-worthy imagery
- Founder story
- Sustainability messaging
- Community building

---

## B2G (Business to Government)

**Descrizione**: Vendita ad enti pubblici

### Visual Weights

```yaml
trust: 0.95        # Massimo assoluto
innovation: 0.2    # Estremamente conservativo
formality: 0.95    # Massimo
warmth: 0.2        # Istituzionale
playfulness: 0.0   # Zero assoluto
density: 0.6       # Documentazione, compliance
```

### Style Affinities

```yaml
high:
  - flat           # Pulito, accessibile
  - material       # Standard, prevedibile
low:
  - tutto il resto
forbidden:
  - brutalism      # Assolutamente no
  - gen-z          # No
  - y2k            # No
  - claymorphism   # No
  - glassmorphism  # Troppo trendy
  - neumorphism    # Troppo trendy
  - spatial        # Troppo complesso
```

### Modifier Tendencies

```yaml
grid: swiss        # Rigore istituzionale
curves: geometric  # Nessuna frivolezza
palette: cold      # O mono
density: balanced  # Chiaro
```

### Hard Constraints

```yaml
must_have:
  - WCAG AAA compliance
  - Section 508 compliance
  - Multi-language
  - Print-friendly
  - Document accessibility
forbidden:
  - Qualsiasi cosa "trendy"
  - Animazioni non essenziali
  - JavaScript-dependent core functions
  - Custom fonts (system fonts preferred)
```

---

## Consumer Type Compatibility Matrix

| Type | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|------|-------|------------|-----------|--------|-------------|---------|
| B2B | 0.85 | 0.45 | 0.8 | 0.35 | 0.15 | 0.7 |
| B2C | 0.65 | 0.6 | 0.4 | 0.7 | 0.55 | 0.45 |
| C2C | 0.6 | 0.55 | 0.25 | 0.75 | 0.5 | 0.6 |
| D2C | 0.7 | 0.7 | 0.35 | 0.75 | 0.6 | 0.4 |
| B2G | 0.95 | 0.2 | 0.95 | 0.2 | 0.0 | 0.6 |

---

## Selection Logic

```
Se consumer type è B2B o B2G:
  → Massimo trust e formality
  → Minimo playfulness
  → Swiss grid, cold palette
  → Material o flat

Se consumer type è B2C o D2C:
  → Bilancia trust e warmth
  → Accetta playfulness
  → Brand personality emerge
  → Bento grid, warm palette

Se consumer type è C2C:
  → Community focus
  → Warmth alto
  → Listing-friendly
  → Bento grid, organic curves
```

---

## Tension Notes

Quando B2B si combina con industry creative (Design Agency, Music):
- Formality può scendere a 0.6
- Playfulness può salire a 0.4
- Permesso glassmorphism, spatial

Quando D2C si combina con premium target:
- Trust sale a 0.8
- Formality sale a 0.5
- Neumorphism diventa high affinity

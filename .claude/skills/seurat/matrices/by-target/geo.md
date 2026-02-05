# Target Profiles: Geographic

Profili basati sulla regione geografica target.

---

## North America (US, Canada)

**Descrizione**: Mercato principale tech, alta competizione

### Visual Weights

```yaml
trust: 0.7         # Earned through UX
innovation: 0.65   # Early adopters
formality: 0.5     # Casual business
warmth: 0.55       # Personal brands valued
playfulness: 0.5   # Depends on segment
density: 0.5       # Balanced
```

### Style Affinities

```yaml
high:
  - flat           # Standard americano
  - material       # Google influence
  - glassmorphism  # Trendy, Apple influence
  - bento          # Apple aesthetic
medium:
  - neumorphism    # Premium products
  - claymorphism   # Playful brands
  - gen-z          # Youth markets
  - spatial        # Tech-forward
low:
  - brutalism      # Niche use
  - y2k            # Niche revival
forbidden:
  - nessuno universale
```

### Modifier Tendencies

```yaml
grid: bento        # Apple influence
curves: organic    # Friendly
palette: varies    # Brand dependent
density: balanced  # Not too dense
```

### Regional Considerations

- Accessibility compliance (ADA)
- Fast loading expectations
- Mobile-first essential
- A/B testing culture

---

## Europe (EU, UK)

**Descrizione**: Privacy-conscious, design-forward

### Visual Weights

```yaml
trust: 0.75        # GDPR awareness
innovation: 0.6    # Design appreciation
formality: 0.55    # More formal than US
warmth: 0.5        # Reserved
playfulness: 0.4   # More conservative
density: 0.55      # Content acceptance
```

### Style Affinities

```yaml
high:
  - flat           # Europeisk minimalism
  - material       # Universal
  - glassmorphism  # Scandinavian influence
medium:
  - bento          # Modern layouts
  - neumorphism    # Premium
  - brutalism      # European design movement
low:
  - gen-z          # Regional variations
  - claymorphism   # Less common
  - y2k            # Niche
forbidden:
  - nessuno universale
```

### Modifier Tendencies

```yaml
grid: swiss        # European origin
curves: geometric  # Clean lines
palette: cold      # Scandinavian influence
density: balanced  # Information architecture
```

### Regional Considerations

- GDPR compliance mandatory
- Cookie consent UX critical
- Multi-language support
- Accessibility (EU Web Accessibility Directive)
- VAT display requirements

---

## Asia-Pacific (APAC)

**Descrizione**: Diverse markets, mobile-dominant

### Visual Weights

```yaml
trust: 0.8         # Authority matters
innovation: 0.7    # Tech-forward
formality: 0.65    # Rispetto e gerarchia
warmth: 0.45       # Varies by country
playfulness: 0.5   # Kawaii culture (JP), varied
density: 0.75      # Alta densità accettata
```

### Style Affinities

```yaml
high:
  - material       # Android dominant
  - flat           # Clean
  - bento          # Japanese influence
medium:
  - glassmorphism  # Premium apps
  - spatial        # Tech-forward markets
  - gen-z          # Youth markets
  - claymorphism   # JP/KR cute culture
low:
  - brutalism      # Western aesthetic
  - neumorphism    # Less common
forbidden:
  - nessuno universale
```

### Modifier Tendencies

```yaml
grid: swiss        # Or bento
curves: organic    # Approachable
palette: varies    # JP: warm, CN: bold, KR: minimal
density: dense     # Information dense OK
```

### Regional Considerations

- Mobile-first critical
- Super apps (WeChat, Line, KakaoTalk)
- Local payment methods
- Right-to-left for some regions
- High density acceptable
- Localization critical (not just translation)

---

## Latin America (LATAM)

**Descrizione**: Mobile-first, social-driven

### Visual Weights

```yaml
trust: 0.6         # Personal relationships
innovation: 0.55   # Pragmatic
formality: 0.4     # Warm business culture
warmth: 0.8        # Alta importanza
playfulness: 0.6   # Cultural expressiveness
density: 0.45      # Not too heavy
```

### Style Affinities

```yaml
high:
  - flat           # Universal
  - material       # Android prevalence
  - claymorphism   # Warm, expressive
medium:
  - glassmorphism  # Premium
  - bento          # Modern
  - gen-z          # Youth dominant
low:
  - brutalism      # Not culturally aligned
  - neumorphism    # Less common
  - spatial        # Bandwidth concerns
forbidden:
  - nessuno universale
```

### Modifier Tendencies

```yaml
grid: bento        # Flexible
curves: organic    # Warm
palette: warm      # Culturally aligned
density: balanced  # Mobile constraints
```

### Regional Considerations

- Mobile-first essential
- WhatsApp integration
- MercadoPago, PIX payments
- Bandwidth optimization
- Social proof important
- Installment payments display

---

## Global (Multi-region)

**Descrizione**: International audience, no single market

### Visual Weights

```yaml
trust: 0.7         # Universal need
innovation: 0.5    # Conservative for broad appeal
formality: 0.55    # Middle ground
warmth: 0.5        # Neutral
playfulness: 0.35  # Safe choices
density: 0.5       # Balanced
```

### Style Affinities

```yaml
high:
  - flat           # Universally understood
  - material       # Global standard
medium:
  - bento          # Modern, clean
  - glassmorphism  # Premium feel
low:
  - gen-z          # Culturally specific
  - claymorphism   # Regionally varied reception
  - brutalism      # Polarizing
  - y2k            # Western-centric
forbidden:
  - nessuno specifico, ma evitare estremi
```

### Modifier Tendencies

```yaml
grid: swiss        # Universal clarity
curves: organic    # Universally friendly
palette: cold      # Neutral, professional
density: balanced  # Universal readability
```

### Hard Constraints

```yaml
must_have:
  - Multi-language support
  - RTL support
  - WCAG AA minimum
  - Multiple currency display
  - Date/time localization
  - Cultural color sensitivity
avoid:
  - Culturally specific imagery
  - Idioms in copy
  - Region-specific metaphors
  - Colors with cultural meanings (white = death in some cultures)
```

---

## Geographic Compatibility Matrix

| Region | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|--------|-------|------------|-----------|--------|-------------|---------|
| North America | 0.7 | 0.65 | 0.5 | 0.55 | 0.5 | 0.5 |
| Europe | 0.75 | 0.6 | 0.55 | 0.5 | 0.4 | 0.55 |
| APAC | 0.8 | 0.7 | 0.65 | 0.45 | 0.5 | 0.75 |
| LATAM | 0.6 | 0.55 | 0.4 | 0.8 | 0.6 | 0.45 |
| Global | 0.7 | 0.5 | 0.55 | 0.5 | 0.35 | 0.5 |

---

## Selection Logic

```
Se target è APAC:
  → Accetta density più alta
  → Mobile-first critico
  → Considera super-app patterns

Se target è LATAM:
  → Warmth alto
  → Playfulness accettato
  → Mobile + bandwidth optimization

Se target è Europe:
  → GDPR compliance
  → Swiss grid influence
  → Formal > US

Se target è Global:
  → Scelte conservative
  → Massima accessibilità
  → Evita specificity culturale
```

---

## Cultural Color Notes

| Color | Western | East Asian | Middle East | LATAM |
|-------|---------|------------|-------------|-------|
| White | Purity | Death/Mourning | Purity | Purity |
| Red | Danger | Luck/Prosperity | Danger | Passion |
| Yellow | Happiness | Imperial | Happiness | - |
| Green | Nature | - | Islam | - |
| Blue | Trust | Trust | - | Trust |

Per progetti Global, preferire blu (universalmente positivo) o palette neutre.

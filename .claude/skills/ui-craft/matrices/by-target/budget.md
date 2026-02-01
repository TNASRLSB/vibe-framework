# Target Profiles: Budget

Profili basati sulla fascia di prezzo e aspettative di valore.

---

## Premium/Luxury (Alto Budget)

**Descrizione**: Utenti disposti a pagare per la qualità

### Visual Weights

```yaml
trust: 0.85        # Expect excellence
innovation: 0.7    # Want the best
formality: 0.7     # Refined
warmth: 0.5        # Elegant, not cold
playfulness: 0.3   # Sophisticated
density: 0.35      # Curated, not cluttered
```

### Style Affinities

```yaml
high:
  - glassmorphism  # Premium, polished
  - neumorphism    # Soft luxury
  - spatial        # Immersive experience
  - bento          # Curated display
medium:
  - flat           # Minimal luxury
  - material       # If executed well
low:
  - brutalism      # Not for luxury
  - claymorphism   # Too playful
  - gen-z          # Not premium
forbidden:
  - y2k            # Cheap aesthetic
  - skeuomorphism  # Dated
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Dramatic layouts
curves: organic    # Soft, premium
palette: jewel     # Or mono for elegance
density: sparse    # Breathing room
```

### UX Expectations

- Exceptional attention to detail
- Micro-interactions polished
- High quality imagery
- Smooth animations
- White glove support
- Personalization

### Visual Cues

```css
/* Premium Signals */
--animation-duration: 0.4s; /* Slower, more deliberate */
--spacing-multiplier: 1.5;  /* More whitespace */
--image-quality: highest;
--font-weight: 300-400;     /* Light, elegant */
```

---

## Mid-Market (Budget Moderato)

**Descrizione**: Value-conscious, quality matters

### Visual Weights

```yaml
trust: 0.7         # Expect reliability
innovation: 0.55   # Balanced
formality: 0.5     # Professional but not stuffy
warmth: 0.6        # Approachable
playfulness: 0.4   # Some personality
density: 0.5       # Balanced information
```

### Style Affinities

```yaml
high:
  - flat           # Efficient, clean
  - material       # Reliable
  - bento          # Organized
medium:
  - glassmorphism  # Touch of premium
  - neumorphism    # Soft premium
  - claymorphism   # Friendly
low:
  - brutalism      # Too risky
  - spatial        # Over-engineered
  - gen-z          # Too casual
forbidden:
  - y2k            # Doesn't fit
```

### Modifier Tendencies

```yaml
grid: bento        # Value display
curves: organic    # Friendly
palette: warm      # Inviting
density: balanced  # Good value visibility
```

### UX Focus

- Clear value proposition
- Feature comparison
- Testimonials prominent
- ROI/savings visible
- Free trial/guarantee

---

## Budget-Conscious (Costo Sensibile)

**Descrizione**: Price is primary decision factor

### Visual Weights

```yaml
trust: 0.65        # Needs reassurance
innovation: 0.4    # Familiarity preferred
formality: 0.4     # Casual OK
warmth: 0.65       # Approachable
playfulness: 0.45  # Deals are fun
density: 0.65      # Show all options
```

### Style Affinities

```yaml
high:
  - flat           # Fast, efficient
  - material       # Familiar
medium:
  - bento          # Comparison friendly
  - claymorphism   # If friendly brand
low:
  - glassmorphism  # Feels expensive
  - neumorphism    # Premium signals
  - spatial        # Unnecessary
forbidden:
  - nessuno specifico
```

### Modifier Tendencies

```yaml
grid: swiss        # Comparison tables
curves: geometric  # Efficient
palette: warm      # Friendly deals
density: dense     # All options visible
```

### UX Focus

- Price prominent
- Savings/discounts highlighted
- Comparison easy
- Filter by price
- Free shipping thresholds
- Bundle deals visible

### Visual Cues

```css
/* Budget Signals */
--price-color: var(--accent-red);
--savings-highlight: var(--color-success);
--original-price: line-through;
/* Don't look "too premium" - builds trust */
```

---

## Free Tier (Utenti Gratuiti)

**Descrizione**: Using free version, potential conversion

### Visual Weights

```yaml
trust: 0.55        # Skeptical, what's the catch
innovation: 0.5    # Try before buy
formality: 0.35    # Casual entry
warmth: 0.7        # Welcoming
playfulness: 0.55  # Low stakes, fun OK
density: 0.45      # Don't overwhelm
```

### Style Affinities

```yaml
high:
  - flat           # Fast onboarding
  - material       # Familiar
  - claymorphism   # Friendly, inviting
medium:
  - bento          # Feature showcase
  - glassmorphism  # Premium teaser
  - gen-z          # If young target
low:
  - neumorphism    # Feels premium
  - spatial        # Over-invested
forbidden:
  - brutalism      # Scares off
```

### Modifier Tendencies

```yaml
grid: bento        # Feature cards
curves: organic    # Welcoming
palette: warm      # Friendly
density: balanced  # Not overwhelming
```

### UX Strategy

- Frictionless signup
- Value immediately visible
- Upgrade path clear but not pushy
- Feature gating transparent
- Community/support available
- Progress/usage visible

### Conversion Design

```
DO:
  - Show what premium unlocks (blurred, locked icons)
  - Celebrate free milestones
  - Soft upgrade prompts at natural points
  - Show social proof of upgraders

DON'T:
  - Aggressive paywalls
  - Shame for being free
  - Hide core features
  - Constant upgrade nagging
```

---

## Budget Compatibility Matrix

| Budget Level | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|--------------|-------|------------|-----------|--------|-------------|---------|
| Premium | 0.85 | 0.7 | 0.7 | 0.5 | 0.3 | 0.35 |
| Mid-Market | 0.7 | 0.55 | 0.5 | 0.6 | 0.4 | 0.5 |
| Budget | 0.65 | 0.4 | 0.4 | 0.65 | 0.45 | 0.65 |
| Free Tier | 0.55 | 0.5 | 0.35 | 0.7 | 0.55 | 0.45 |

---

## Selection Logic

```
Se budget è Premium:
  → Sparse density
  → Slow, deliberate animations
  → High quality everything
  → Glassmorphism, neumorphism, spatial

Se budget è Mid-Market:
  → Value proposition clear
  → Balanced density
  → Trust signals prominent
  → Flat, material, bento

Se budget è Budget-Conscious:
  → Price prominent
  → Dense for comparison
  → Deal/savings UI
  → Flat, material

Se budget è Free Tier:
  → Welcoming warmth
  → Low friction
  → Upgrade path visible
  → Claymorphism, flat
```

---

## Pricing Page Patterns by Budget

| Budget Level | Layout | Key Elements | Avoid |
|--------------|--------|--------------|-------|
| Premium | Single hero product | Exclusivity, concierge | Price comparison |
| Mid-Market | 3-tier comparison | Feature matrix | Too many tiers |
| Budget | Dense comparison | Savings, deals | Premium imagery |
| Free Tier | Freemium funnel | Value ladder | Aggressive gating |

---

## Typography Budget Signals

| Budget Level | Font Style | Weight | Size |
|--------------|------------|--------|------|
| Premium | Serif or elegant sans | Light (300) | Large |
| Mid-Market | Clean sans | Regular (400) | Standard |
| Budget | System/efficient sans | Regular-Medium | Standard |
| Free Tier | Friendly sans | Regular | Standard |

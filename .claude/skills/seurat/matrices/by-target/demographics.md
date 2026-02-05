# Target Profiles: Demographics

Profili basati sull'età e generazione dell'utente target.

---

## Gen Z (18-27)

**Descrizione**: Nativi digitali, TikTok generation

### Visual Weights

```yaml
trust: 0.4         # Skeptical of institutions
innovation: 0.9    # Vogliono il nuovo
formality: 0.15    # Anti-corporate
warmth: 0.7        # Authentic connections
playfulness: 0.85  # Entertainment first
density: 0.45      # Short attention span
```

### Style Affinities

```yaml
high:
  - gen-z          # Native style
  - glassmorphism  # Modern, trendy
  - bento          # Instagram aesthetic
  - claymorphism   # Playful 3D
medium:
  - brutalism      # Ironic, statement
  - y2k            # Nostalgic revival
  - spatial        # Immersive
low:
  - material       # "Boomer"
  - flat           # Boring
  - neumorphism    # Not distinctive enough
forbidden:
  - skeuomorphism  # Ancient history
```

### Modifier Tendencies

```yaml
grid: broken       # Anti-establishment
curves: organic    # Or angular for edge
palette: neon      # Bold, vibrant
density: balanced  # Snackable content
```

### Special Requirements

- Mobile-first obbligatorio
- Video/animation
- Meme-friendly
- Dark mode
- Fast, instant feedback

---

## Millennials (28-43)

**Descrizione**: Digital immigrants, grew up with web

### Visual Weights

```yaml
trust: 0.6         # Earned, not given
innovation: 0.65   # Early adopters
formality: 0.4     # Casual professional
warmth: 0.65       # Authenticity valued
playfulness: 0.55  # Work-life balance
density: 0.5       # Medium tolerance
```

### Style Affinities

```yaml
high:
  - flat           # Clean, familiar
  - material       # Used to it
  - glassmorphism  # Modern premium
  - bento          # Organized aesthetic
medium:
  - neumorphism    # Soft, premium
  - claymorphism   # If playful brand
  - spatial        # Tech-forward
low:
  - brutalism      # Too aggressive
  - gen-z          # "Kids stuff"
forbidden:
  - y2k            # Cringe nostalgia
```

### Modifier Tendencies

```yaml
grid: bento        # Organized life
curves: organic    # Soft touch
palette: warm      # Authentic feel
density: balanced  # Not overwhelming
```

### Special Requirements

- Responsive design
- Good UX storytelling
- Social proof
- Sustainability signals

---

## Gen X (44-59)

**Descrizione**: Digital adapters, experienced professionals

### Visual Weights

```yaml
trust: 0.75        # Earned through proof
innovation: 0.45   # Pragmatic
formality: 0.6     # Professional
warmth: 0.5        # Balanced
playfulness: 0.3   # Business first
density: 0.6       # Can handle info
```

### Style Affinities

```yaml
high:
  - material       # Familiar, tested
  - flat           # Clean, efficient
medium:
  - bento          # Dashboard style
  - glassmorphism  # If modern product
  - neumorphism    # Subtle premium
low:
  - brutalism      # Confusing
  - claymorphism   # Too playful
  - spatial        # Unnecessary complexity
forbidden:
  - gen-z          # Alienating
  - y2k            # Random
```

### Modifier Tendencies

```yaml
grid: swiss        # Organized
curves: geometric  # Clear
palette: cold      # Professional
density: balanced  # Clear hierarchy
```

### Special Requirements

- Clear navigation
- Readable typography (16px+)
- No hidden menus
- Obvious CTAs

---

## Baby Boomers (60+)

**Descrizione**: Digital immigrants, high purchasing power

### Visual Weights

```yaml
trust: 0.9         # Paramount
innovation: 0.25   # Prefer familiar
formality: 0.75    # Respectful
warmth: 0.6        # Personal service
playfulness: 0.15  # Serious
density: 0.4       # Not too much
```

### Style Affinities

```yaml
high:
  - flat           # Simple, clear
  - material       # Recognizable patterns
medium:
  - skeuomorphism  # Familiar metaphors
low:
  - glassmorphism  # Confusing layers
  - neumorphism    # Low contrast issues
  - bento          # Too modern
  - spatial        # Disorienting
forbidden:
  - brutalism      # Unusable
  - gen-z          # Alienating
  - y2k            # Random
  - claymorphism   # Childish
```

### Modifier Tendencies

```yaml
grid: swiss        # Clear structure
curves: geometric  # Obvious elements
palette: warm      # Comforting
density: sparse    # Room to breathe
```

### Hard Constraints

```yaml
must_have:
  - WCAG AA minimum (AAA preferred)
  - 18px+ font size
  - High contrast
  - Large click targets (44px+)
  - Clear labels
forbidden:
  - Hover-only interactions
  - Hamburger menus as primary nav
  - Low contrast text
  - Animations that can't be disabled
```

---

## Kids (<13)

**Descrizione**: Children, requires parental controls

### Visual Weights

```yaml
trust: 0.4         # Parent trust, not child
innovation: 0.7    # Fun new things
formality: 0.05    # Zero formality
warmth: 0.95       # Massima
playfulness: 0.95  # Massima
density: 0.2       # Molto semplice
```

### Style Affinities

```yaml
high:
  - claymorphism   # Toylike, fun
  - gen-z          # Colorful, animated
medium:
  - flat           # Simple shapes
  - bento          # Game-like organization
low:
  - material       # Boring
  - glassmorphism  # Not engaging
  - neumorphism    # Not playful enough
forbidden:
  - brutalism      # Scary
  - y2k            # Inappropriate aesthetic
  - spatial        # Disorienting for children
```

### Modifier Tendencies

```yaml
grid: broken       # Playful chaos
curves: art-nouveau # Blob shapes, fun
palette: warm      # Friendly colors
density: sparse    # Simple, clear
```

### Hard Constraints

```yaml
must_have:
  - COPPA compliance
  - Parental gates
  - No external links without warning
  - Large touch targets
  - Audio feedback
  - No dark patterns
forbidden:
  - Monetization without parental consent
  - Social features without moderation
  - Scary imagery
  - Complex navigation
```

---

## Teens (13-17)

**Descrizione**: Digital natives, trend-conscious

### Visual Weights

```yaml
trust: 0.35        # Skeptical
innovation: 0.85   # Trend hunters
formality: 0.1     # Anti-authority
warmth: 0.6        # Peer connections
playfulness: 0.8   # Entertainment value
density: 0.4       # Quick consumption
```

### Style Affinities

```yaml
high:
  - gen-z          # Their aesthetic
  - glassmorphism  # Current trend
  - bento          # Social media style
  - claymorphism   # Fun, expressive
medium:
  - brutalism      # Edgy
  - y2k            # Ironic nostalgia
  - spatial        # Gaming vibes
low:
  - material       # Parent's phone
  - flat           # Basic
  - neumorphism    # Meh
forbidden:
  - skeuomorphism  # Ancient
```

### Modifier Tendencies

```yaml
grid: broken       # Rebellious
curves: angular    # Edgy
palette: neon      # Bold statement
density: balanced  # Scroll-friendly
```

### Special Requirements

- Mobile-first
- Social integration
- Customization options
- Achievement/gamification
- Respect their privacy concerns

---

## Demographics Compatibility Matrix

| Age Group | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|-----------|-------|------------|-----------|--------|-------------|---------|
| Gen Z | 0.4 | 0.9 | 0.15 | 0.7 | 0.85 | 0.45 |
| Millennials | 0.6 | 0.65 | 0.4 | 0.65 | 0.55 | 0.5 |
| Gen X | 0.75 | 0.45 | 0.6 | 0.5 | 0.3 | 0.6 |
| Boomers | 0.9 | 0.25 | 0.75 | 0.6 | 0.15 | 0.4 |
| Kids | 0.4 | 0.7 | 0.05 | 0.95 | 0.95 | 0.2 |
| Teens | 0.35 | 0.85 | 0.1 | 0.6 | 0.8 | 0.4 |

---

## Selection Logic

```
Se target è Gen Z o Teens:
  → Privilegia innovation e playfulness
  → Evita formality
  → Accetta gen-z, glassmorphism, broken grid
  → Palette neon o bold

Se target è Millennials:
  → Bilancia innovation e trust
  → Warm palette, organic curves
  → Bento grid, flat o glassmorphism

Se target è Gen X o Boomers:
  → Privilegia trust e formality
  → Evita playfulness eccessiva
  → Swiss grid, geometric curves
  → Alta accessibilità

Se target è Kids:
  → Massima playfulness e warmth
  → Claymorphism, broken grid
  → Compliance COPPA
  → Nessuna complessità
```

# Target Profiles: Technical Level

Profili basati sul livello di competenza tecnica dell'utente.

---

## Tech-Savvy (Early Adopter)

**Descrizione**: Utenti che adottano per primi nuove tecnologie

### Visual Weights

```yaml
trust: 0.6         # Willing to experiment
innovation: 0.85   # Cercano il nuovo
formality: 0.35    # Preferiscono casual
warmth: 0.4        # Funzionalità first
playfulness: 0.55  # Apprezzano polish
density: 0.7       # Vogliono tutte le opzioni
```

### Style Affinities

```yaml
high:
  - glassmorphism  # Modern, cutting edge
  - spatial        # 3D, immersive
  - bento          # Dashboard power users
  - flat           # Efficient
medium:
  - material       # Familiar
  - neumorphism    # Premium
  - brutalism      # Statement piece
  - gen-z          # Trendy
low:
  - skeuomorphism  # Dated
  - claymorphism   # Unless innovative use
forbidden:
  - nessuno, ma evitare datato
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Accept complexity
curves: varies     # Open to all
palette: neon      # Or cold
density: dense     # Power user features
```

### UX Expectations

- Keyboard shortcuts
- Advanced settings
- API access
- Beta features access
- Customization options
- Dark mode

---

## Developers (Tecnici Avanzati)

**Descrizione**: Programmatori, ingegneri software

### Visual Weights

```yaml
trust: 0.7         # Documentation quality
innovation: 0.65   # New tools, frameworks
formality: 0.4     # Casual, direct
warmth: 0.25       # Get to the point
playfulness: 0.35  # Easter eggs OK
density: 0.85      # Massima informazione
```

### Style Affinities

```yaml
high:
  - flat           # No distractions
  - material       # IDE familiarity
  - bento          # Dashboard, docs
medium:
  - brutalism      # Raw, honest
  - glassmorphism  # Modern tools
  - spatial        # Analytics
low:
  - claymorphism   # Distracting
  - neumorphism    # Form over function
  - gen-z          # Not serious
forbidden:
  - skeuomorphism  # Waste of resources
  - y2k            # Distraction
```

### Modifier Tendencies

```yaml
grid: swiss        # Code-like order
curves: geometric  # Precise
palette: mono      # Terminal aesthetic
density: dense     # All the info
```

### Hard Requirements

```yaml
must_have:
  - Dark mode (default preferito)
  - Monospace code blocks
  - Copy-to-clipboard
  - Syntax highlighting
  - Keyboard navigation
  - Fast, no bloat
  - API documentation
forbidden:
  - Unnecessary animations
  - Autoplaying video
  - Marketing fluff before content
  - Newsletter popups
```

---

## No-Code Users (Non-tecnici)

**Descrizione**: Utenti che usano tool no-code, non programmano

### Visual Weights

```yaml
trust: 0.7         # Need guidance
innovation: 0.5    # Moderate
formality: 0.45    # Accessible
warmth: 0.7        # Supportive
playfulness: 0.5   # Encouraging
density: 0.4       # Not overwhelming
```

### Style Affinities

```yaml
high:
  - flat           # Clear, simple
  - material       # Familiar patterns
  - claymorphism   # Friendly, approachable
  - bento          # Drag-and-drop familiar
medium:
  - glassmorphism  # Modern but clear
  - neumorphism    # Soft, inviting
low:
  - brutalism      # Confusing
  - spatial        # Too complex
  - gen-z          # Distracting
forbidden:
  - y2k            # Random, confusing
```

### Modifier Tendencies

```yaml
grid: bento        # Drag-drop friendly
curves: organic    # Approachable
palette: warm      # Supportive
density: balanced  # Clear hierarchy
```

### UX Requirements

- Clear onboarding
- Tooltips everywhere
- Visual feedback
- Undo prominent
- Templates/presets
- Progress indicators
- Help easily accessible

---

## Low-Tech (Basso Digital Literacy)

**Descrizione**: Utenti con poca esperienza digitale

### Visual Weights

```yaml
trust: 0.85        # Need reassurance
innovation: 0.2    # Familiar patterns only
formality: 0.6     # Respectful
warmth: 0.75       # Supportive
playfulness: 0.25  # Focus on task
density: 0.25      # Minimal, clear
```

### Style Affinities

```yaml
high:
  - flat           # Simplest
  - material       # Recognizable
medium:
  - skeuomorphism  # Real-world metaphors
low:
  - tutto il resto # Too complex or abstract
forbidden:
  - brutalism      # Unusable
  - gen-z          # Confusing
  - y2k            # Random
  - glassmorphism  # Layers confuse
  - spatial        # Disorienting
  - neumorphism    # Low contrast issues
```

### Modifier Tendencies

```yaml
grid: swiss        # Clear structure
curves: geometric  # Obvious buttons
palette: warm      # Comforting
density: sparse    # One thing at a time
```

### Hard Requirements

```yaml
must_have:
  - WCAG AAA
  - 18px+ font minimum
  - High contrast
  - Large click targets (48px+)
  - Clear labels (no icon-only)
  - Confirmation dialogs
  - Obvious navigation
  - Phone support visible
  - Step-by-step flows
forbidden:
  - Hover-only interactions
  - Hidden menus
  - Gestures as only input
  - Auto-advancing carousels
  - Infinite scroll
  - Complex forms
  - Ambiguous icons
```

---

## Tech Level Compatibility Matrix

| Tech Level | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|------------|-------|------------|-----------|--------|-------------|---------|
| Tech-Savvy | 0.6 | 0.85 | 0.35 | 0.4 | 0.55 | 0.7 |
| Developers | 0.7 | 0.65 | 0.4 | 0.25 | 0.35 | 0.85 |
| No-Code | 0.7 | 0.5 | 0.45 | 0.7 | 0.5 | 0.4 |
| Low-Tech | 0.85 | 0.2 | 0.6 | 0.75 | 0.25 | 0.25 |

---

## Selection Logic

```
Se tech level è Developers:
  → Density massima
  → Dark mode default
  → Mono palette
  → Zero fluff

Se tech level è Tech-Savvy:
  → Innovation alta
  → Accetta complessità
  → Feature-rich
  → Cutting edge styles OK

Se tech level è No-Code:
  → Warmth e guidance
  → Bento per drag-drop
  → Onboarding completo
  → Density moderata

Se tech level è Low-Tech:
  → Massima accessibilità
  → Density minima
  → Pattern familiari only
  → High touch support
```

---

## Complexity Tolerance

| Tech Level | Max Form Fields | Max Menu Depth | Animation Tolerance | Feature Density |
|------------|-----------------|----------------|---------------------|-----------------|
| Tech-Savvy | Unlimited | 4 levels | High | High |
| Developers | Unlimited | 5 levels | Low (wastes time) | Maximum |
| No-Code | 5-7 visible | 2 levels | Medium | Moderate |
| Low-Tech | 3-4 visible | 1 level | Minimal | Low |

---

## Onboarding Needs

| Tech Level | Onboarding Type | Skip Option | Help Location |
|------------|-----------------|-------------|---------------|
| Tech-Savvy | Optional, quick | Prominent | Docs/keyboard ? |
| Developers | None or API docs | Default | Docs site |
| No-Code | Guided, interactive | After completion | Contextual + chat |
| Low-Tech | Mandatory, slow | No | Phone + visible button |

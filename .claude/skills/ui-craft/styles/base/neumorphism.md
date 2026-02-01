# Neumorphism

## Identity

**Origins**: Dribbble (2019), coined as "New Skeuomorphism"
**Philosophy**: Soft UI - elementi che emergono dalla superficie come bassorilievi
**Personality**: Soft, tactile, premium, minimal, futuristic
**Chinese**: 新拟态 (Xīn nǐ tài)

## Visual Signature

- **Colore sfondo = colore elemento**: Differenza cromatica minima (ΔE < 5)
- **Doppia ombra**: Chiara sopra/sinistra, scura sotto/destra
- **3 stati**: Piatto, sporgente (convesso), incassato (concavo)
- **Angoli molto arrotondati**: Border-radius minimo 12px
- **Palette monocromatica**: Una hue, molte variazioni di lightness
- **Minimalismo estremo**: Pochi elementi, molto spazio

## Tokens CSS

```css
/* Neumorphism Tokens */

/* Base color - tutto deriva da qui */
--neu-bg: hsl(220 15% 91%);
--neu-bg-dark: hsl(220 15% 85%);
--neu-bg-light: hsl(220 15% 97%);

/* Spacing */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography */
--font-display: "SF Pro Display", "Inter", system-ui, sans-serif;
--font-body: "SF Pro Text", "Inter", system-ui, sans-serif;
--text-base: 1rem;
--line-height: 1.5;

/* Text colors - subtle */
--color-text: hsl(220 20% 25%);
--color-text-muted: hsl(220 10% 50%);
--color-accent: hsl(220 80% 55%);

/* Shadows - the core of neumorphism */
--neu-shadow-light: -6px -6px 14px rgba(255, 255, 255, 0.7);
--neu-shadow-dark: 6px 6px 14px rgba(166, 180, 200, 0.5);
--neu-shadow-inset-light: inset -3px -3px 7px rgba(255, 255, 255, 0.7);
--neu-shadow-inset-dark: inset 3px 3px 7px rgba(166, 180, 200, 0.5);

/* Convex (raised) */
--neu-convex: var(--neu-shadow-light), var(--neu-shadow-dark);

/* Concave (pressed) */
--neu-concave: var(--neu-shadow-inset-light), var(--neu-shadow-inset-dark);

/* Flat (level with surface) */
--neu-flat: none;

/* Borders & Radius */
--radius: 16px;
--radius-sm: 12px;
--radius-lg: 24px;
--radius-full: 9999px;

/* Transitions */
--transition: 200ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | ±1mm | Sottile rilievo |
| Shadow | Bilaterale | Chiara + scura |
| Contrast | ΔE < 5 | Basso (attenzione accessibilità!) |
| Border radius | 12-24px | Sempre arrotondato |
| Shadow spread | 6-14px | Proporzionale al radius |

## Tactile Description

*Immagina una superficie di gesso fresco e morbido. I pulsanti non sono "sopra" ma "scolpiti dentro" la superficie, come bassorilievi. Senti una leggera sporgenza di 1mm quando convesso, o una leggera concavità di 1mm quando incassato. I bordi sono arrotondati come un bicchiere di vetro opalino. Lo sfondo è grigio chiaro, i pulsanti un grigio leggermente diverso: la differenza è così sottile che la percezione è tutta nelle ombre.*

## Component Examples

```css
/* Neumorphic Button - Raised */
.btn-neu {
  padding: var(--space-2) var(--space-4);
  background: var(--neu-bg);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: var(--text-base);
  box-shadow: var(--neu-convex);
  cursor: pointer;
  transition: box-shadow var(--transition);
}

.btn-neu:hover {
  box-shadow:
    -4px -4px 10px rgba(255, 255, 255, 0.7),
    4px 4px 10px rgba(166, 180, 200, 0.5);
}

.btn-neu:active {
  box-shadow: var(--neu-concave);
}

/* Neumorphic Card */
.card-neu {
  padding: var(--space-4);
  background: var(--neu-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--neu-convex);
}

/* Neumorphic Input - Inset */
.input-neu {
  padding: var(--space-2) var(--space-3);
  background: var(--neu-bg);
  border: none;
  border-radius: var(--radius-sm);
  box-shadow: var(--neu-concave);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
}

.input-neu:focus {
  outline: none;
  box-shadow:
    var(--neu-concave),
    0 0 0 2px var(--color-accent);
}

/* Neumorphic Toggle */
.toggle-neu {
  width: 60px;
  height: 32px;
  background: var(--neu-bg);
  border-radius: var(--radius-full);
  box-shadow: var(--neu-concave);
  position: relative;
  cursor: pointer;
}

.toggle-neu::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: var(--neu-bg);
  border-radius: var(--radius-full);
  box-shadow: var(--neu-convex);
  transition: transform var(--transition);
}

.toggle-neu.active::after {
  transform: translateX(28px);
  background: var(--color-accent);
}
```

## Ideal Weights

```yaml
trust: 0.6
innovation: 0.7
formality: 0.5
warmth: 0.4
playfulness: 0.3
density: 0.3
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bento ✓ | Needs clean layout |
| Curves | Geometric ○, Organic ✓ | Soft curves preferred |
| Palette | Cold ✓, Mono ✓ | Warm can work but harder |
| Density | Sparse ✓, Balanced ○ | Needs breathing room |

## Incompatible Modifiers

- **Asymmetric/Broken grid**: Neumorphism needs order
- **Angular curves**: Contradicts soft aesthetic
- **Neon palette**: Kills the subtlety
- **Dense/Claustrophobic**: Shadows need space

## Anti-Patterns Specifici

- Neumorphism + Low contrast = The Soft Nothing (accessibilità zero)
- Neumorphism + Too many elements = Cluttered shadows
- Neumorphism + Colored shadows = Breaks the illusion

## Accessibility Warning

⚠️ **Neumorphism ha problemi intrinseci di accessibilità**:
- Basso contrasto tra elementi
- Feedback visivo sottile
- Difficile per utenti con problemi di vista

**Mitigazioni obbligatorie**:
1. Testo DEVE avere contrast ratio ≥ 4.5:1
2. Accent color per elementi interattivi
3. Focus states evidenti (non solo shadow change)
4. Alternative text/icon per distinguere stati

## Best For

- Premium/luxury applications
- Personal dashboards (single user)
- Smart home controls
- Music/audio players
- Minimalist portfolios

## Avoid For

- High-density data interfaces
- Accessibility-critical applications
- E-commerce (needs clear CTAs)
- Enterprise software (too subtle)
- Mobile (shadow rendering costly)

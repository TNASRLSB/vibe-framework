# Claymorphism

## Identity

**Origins**: 2022, coined by Michał Malewicz
**Philosophy**: 3D clay/plasticine aesthetic - soft, playful, dimensional
**Personality**: Soft, playful, friendly, tactile, approachable
**Japanese**: クレイモーフィズム (Kureimōfizumu)

## Visual Signature

- **Forme molto arrotondate**: Border-radius 24-48px, quasi blobby
- **Ombre esterne grandi**: Soft, extended shadows (35px+ spread)
- **Ombre interne**: Inset shadow per spessore percepito
- **Spessore percepito**: 4-6mm di "plastilina"
- **Colori pastello saturi**: Morbidi ma vivaci
- **Superficie opaca**: No gloss, no shine

## Tokens CSS

```css
/* Claymorphism Tokens */

/* Colors - pastel but saturated */
--clay-yellow: hsl(45 95% 65%);
--clay-pink: hsl(340 85% 75%);
--clay-blue: hsl(210 80% 70%);
--clay-green: hsl(150 70% 60%);
--clay-purple: hsl(280 70% 70%);
--clay-orange: hsl(25 90% 65%);

/* Background */
--color-bg: hsl(220 30% 95%);
--color-surface: hsl(0 0% 100%);
--color-text: hsl(220 30% 20%);
--color-text-muted: hsl(220 20% 50%);

/* Spacing */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography */
--font-display: "Nunito", "DM Sans", system-ui, sans-serif;
--font-body: "Nunito", "DM Sans", system-ui, sans-serif;
--text-base: 1rem;
--line-height: 1.6;

/* Shadows - the key to claymorphism */
--clay-shadow-color: 220 60% 80%;
--clay-shadow-outer:
  20px 20px 40px hsl(var(--clay-shadow-color) / 0.4),
  -5px -5px 20px hsl(0 0% 100% / 0.8);
--clay-shadow-inner:
  inset 2px 2px 4px hsl(0 0% 100% / 0.6),
  inset -2px -2px 4px hsl(var(--clay-shadow-color) / 0.2);

/* Combined for raised clay effect */
--clay-shadow: var(--clay-shadow-outer), var(--clay-shadow-inner);

/* Pressed state */
--clay-shadow-pressed:
  inset 4px 4px 8px hsl(var(--clay-shadow-color) / 0.3),
  inset -2px -2px 4px hsl(0 0% 100% / 0.4);

/* Radius - very rounded */
--radius-sm: 16px;
--radius-md: 24px;
--radius-lg: 32px;
--radius-xl: 48px;
--radius-full: 9999px;

/* Transitions */
--transition: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 4-6mm | Substantial thickness |
| Shadow spread | 20-40px | Large, soft |
| Contrast | ΔE 20-30 | Medium |
| Border radius | 24-48px | Very rounded |
| Inner shadow | 2-4px | Creates thickness |

## Tactile Description

*Immagina di toccare un cubo di plastilina morbida. La superficie è morbida e cedevole: se premi con 100g di forza, si deforma di 2mm. I bordi sono arrotondatissimi (raggio 48mm) come un cuscinetto. Le ombre creano un effetto "gonfio": il pulsante sembra gonfiato di 5mm, con un'ombra morbida che si estende per 20mm attorno. Il colore è pastello saturo, la texture è opaca e leggermente polverosa, come Play-Doh.*

## Component Examples

```css
/* Clay Button */
.btn-clay {
  padding: var(--space-3) var(--space-5);
  background: var(--clay-yellow);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-base);
  box-shadow: var(--clay-shadow);
  cursor: pointer;
  transition: transform var(--transition),
              box-shadow var(--transition);
}

.btn-clay:hover {
  transform: translateY(-2px);
  box-shadow:
    25px 25px 50px hsl(var(--clay-shadow-color) / 0.5),
    -8px -8px 25px hsl(0 0% 100% / 0.9),
    var(--clay-shadow-inner);
}

.btn-clay:active {
  transform: translateY(1px);
  box-shadow: var(--clay-shadow-pressed);
}

/* Clay Card */
.card-clay {
  padding: var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--clay-shadow);
}

/* Clay Avatar */
.avatar-clay {
  width: 64px;
  height: 64px;
  background: var(--clay-pink);
  border-radius: var(--radius-full);
  box-shadow: var(--clay-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* Clay Input */
.input-clay {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-md);
  box-shadow:
    inset 4px 4px 8px hsl(var(--clay-shadow-color) / 0.2),
    inset -2px -2px 4px hsl(0 0% 100% / 0.5);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
}

.input-clay:focus {
  outline: none;
  box-shadow:
    inset 4px 4px 8px hsl(var(--clay-shadow-color) / 0.2),
    inset -2px -2px 4px hsl(0 0% 100% / 0.5),
    0 0 0 3px var(--clay-blue);
}

/* Clay Toggle */
.toggle-clay {
  width: 72px;
  height: 40px;
  background: hsl(220 20% 90%);
  border-radius: var(--radius-full);
  box-shadow:
    inset 4px 4px 8px hsl(var(--clay-shadow-color) / 0.3),
    inset -2px -2px 4px hsl(0 0% 100% / 0.5);
  position: relative;
  cursor: pointer;
}

.toggle-clay::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 32px;
  height: 32px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  box-shadow: var(--clay-shadow);
  transition: transform var(--transition);
}

.toggle-clay.active {
  background: var(--clay-green);
}

.toggle-clay.active::after {
  transform: translateX(32px);
}
```

## Ideal Weights

```yaml
trust: 0.4
innovation: 0.6
formality: 0.3
warmth: 0.8
playfulness: 0.8
density: 0.4
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Bento ✓, Bauhaus ○, Asymmetric ○ | Needs some structure |
| Curves | Organic ✓ | Very rounded is core |
| Palette | Warm ✓, Jewel ○ | Pastels preferred |
| Density | Sparse ✓, Balanced ✓ | Shadows need room |

## Incompatible Modifiers

- **Swiss grid**: Too rigid for playful style
- **Geometric/Angular curves**: Contradicts soft aesthetic
- **Cold/Mono palette**: Loses warmth
- **Dense/Claustrophobic**: Shadows overlap

## Anti-Patterns Specifici

- Claymorphism + Pastel everywhere = The Friendly Blob (add contrast)
- Claymorphism + Too many colors = Candy store chaos
- Claymorphism + Small elements = Shadows overwhelm

## Best For

- Children's apps/education
- Casual games
- Lifestyle/wellness apps
- Friendly onboarding
- Consumer products
- Illustration-heavy sites

## Avoid For

- Enterprise software
- Financial applications
- Data-heavy dashboards
- Professional tools
- Minimal/serious brands

## Performance Note

Large box-shadows with multiple layers can impact performance.
Consider:
1. Using `will-change: transform` for animated elements
2. Reducing shadow complexity on mobile
3. Using CSS containment where possible

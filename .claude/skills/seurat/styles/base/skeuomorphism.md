# Skeuomorphism

## Identity

**Origins**: Apple iPhone (2007), iOS 1-6
**Philosophy**: Digital interfaces that mimic real-world objects and materials
**Personality**: Familiar, tangible, realistic, detailed, warm
**Etymology**: Greek *skeuos* (container, tool) + *morphe* (shape)
**Russian**: Скевоморфизм (Skevomorfizm)

## Visual Signature

- **Texture realistiche**: Metallo, legno, pelle, vetro simulati
- **Ombre specifiche**: Drop-shadow con offset per simulare luce naturale
- **Gradienti sottili**: Per simulare curvature e volume
- **Dettagli**: Cuciture, viti, riflessi, usura
- **Proporzioni 1:1**: Elementi grandi come oggetti reali
- **Metafore fisiche**: Interruttori, manopole, cursori come oggetti

## Tokens CSS

```css
/* Skeuomorphism Tokens */

/* Material colors */
--skeu-metal-light: hsl(220 10% 85%);
--skeu-metal-mid: hsl(220 10% 70%);
--skeu-metal-dark: hsl(220 10% 55%);
--skeu-wood: hsl(30 40% 40%);
--skeu-leather: hsl(25 50% 30%);
--skeu-paper: hsl(45 30% 95%);

/* Background */
--color-bg: hsl(220 15% 90%);
--color-surface: linear-gradient(180deg,
  hsl(220 10% 95%) 0%,
  hsl(220 10% 88%) 100%);
--color-text: hsl(220 20% 20%);
--color-text-muted: hsl(220 15% 45%);

/* Spacing */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography */
--font-display: "Helvetica Neue", "Arial", sans-serif;
--font-body: "Helvetica Neue", "Arial", sans-serif;
--font-lcd: "SF Mono", "Monaco", monospace;
--text-base: 1rem;
--line-height: 1.5;

/* Shadows - realistic lighting */
--skeu-shadow-sm:
  0 1px 1px rgba(0,0,0,0.1),
  0 2px 4px rgba(0,0,0,0.1);
--skeu-shadow-md:
  0 2px 4px rgba(0,0,0,0.15),
  0 4px 8px rgba(0,0,0,0.1);
--skeu-shadow-lg:
  0 4px 8px rgba(0,0,0,0.15),
  0 8px 16px rgba(0,0,0,0.1),
  0 16px 32px rgba(0,0,0,0.05);

/* Inner shadows for inset effect */
--skeu-inset:
  inset 0 1px 2px rgba(0,0,0,0.2),
  inset 0 -1px 1px rgba(255,255,255,0.3);

/* Highlights */
--skeu-highlight: linear-gradient(180deg,
  rgba(255,255,255,0.4) 0%,
  rgba(255,255,255,0) 50%);

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* Borders */
--border-groove: 1px solid hsl(220 10% 70%);

/* Transitions */
--transition: 150ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 0-5mm | Varies by material simulated |
| Shadow | Realistic | Offset suggests light source |
| Contrast | ΔE 10-20 | Medium, natural |
| Border radius | 4-12px | Depends on object |
| Texture detail | 80% | Recognizable, not photorealistic |

## Tactile Description

*Immagina di toccare un vero interruttore di metallo. Senti il peso (30g), la fredda solidità, la scanalatura circolare diametro 12mm. Quando premi, c'è un clic tattile netto con ritorno di 2mm. Le texture sono incise a laser: la grana del legno è rilevata 0.3mm, la fibra della pelle è un pattern di micro-incisioni che senti con la punta delle dita. Gli oggetti hanno peso e presenza.*

## Component Examples

```css
/* Skeuomorphic Button - Metal */
.btn-skeu-metal {
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(180deg,
    var(--skeu-metal-light) 0%,
    var(--skeu-metal-mid) 50%,
    var(--skeu-metal-dark) 100%);
  color: var(--color-text);
  border: 1px solid var(--skeu-metal-dark);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  box-shadow:
    var(--skeu-shadow-sm),
    inset 0 1px 0 rgba(255,255,255,0.4);
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all var(--transition);
}

.btn-skeu-metal:hover {
  background: linear-gradient(180deg,
    hsl(220 10% 90%) 0%,
    hsl(220 10% 75%) 50%,
    hsl(220 10% 60%) 100%);
}

.btn-skeu-metal:active {
  background: linear-gradient(180deg,
    var(--skeu-metal-dark) 0%,
    var(--skeu-metal-mid) 50%,
    var(--skeu-metal-light) 100%);
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.2);
}

/* Skeuomorphic Toggle Switch */
.toggle-skeu {
  width: 60px;
  height: 28px;
  background: linear-gradient(180deg,
    hsl(220 10% 70%) 0%,
    hsl(220 10% 80%) 100%);
  border-radius: 14px;
  border: 1px solid hsl(220 10% 60%);
  box-shadow:
    var(--skeu-inset),
    0 1px 2px rgba(0,0,0,0.1);
  position: relative;
  cursor: pointer;
}

.toggle-skeu::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: linear-gradient(180deg,
    hsl(0 0% 100%) 0%,
    hsl(220 10% 90%) 100%);
  border-radius: 50%;
  border: 1px solid hsl(220 10% 70%);
  box-shadow:
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform var(--transition);
}

.toggle-skeu.active {
  background: linear-gradient(180deg,
    hsl(145 60% 40%) 0%,
    hsl(145 60% 50%) 100%);
}

.toggle-skeu.active::after {
  transform: translateX(32px);
}

/* Skeuomorphic Input - Paper */
.input-skeu {
  padding: var(--space-2) var(--space-3);
  background: var(--skeu-paper);
  border: 1px solid hsl(45 20% 80%);
  border-radius: var(--radius-sm);
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,0.1),
    0 1px 0 rgba(255,255,255,0.8);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
}

/* Skeuomorphic Card - Leather */
.card-skeu-leather {
  padding: var(--space-4);
  background:
    url('data:image/svg+xml,...') repeat, /* leather texture */
    linear-gradient(180deg,
      hsl(25 50% 35%) 0%,
      hsl(25 50% 28%) 100%);
  border-radius: var(--radius-lg);
  border: 2px solid hsl(25 40% 20%);
  box-shadow:
    var(--skeu-shadow-lg),
    inset 0 1px 0 rgba(255,255,255,0.1);
  color: hsl(45 30% 90%);
}

/* Skeuomorphic Knob */
.knob-skeu {
  width: 48px;
  height: 48px;
  background: linear-gradient(145deg,
    hsl(220 10% 90%) 0%,
    hsl(220 10% 70%) 100%);
  border-radius: 50%;
  border: 2px solid hsl(220 10% 60%);
  box-shadow:
    var(--skeu-shadow-md),
    inset 0 2px 4px rgba(255,255,255,0.5),
    inset 0 -2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.knob-skeu::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 12px;
  background: hsl(220 10% 40%);
  border-radius: 2px;
}
```

## Ideal Weights

```yaml
trust: 0.7
innovation: 0.4
formality: 0.6
warmth: 0.6
playfulness: 0.4
density: 0.5
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bento ○ | Structured layouts work |
| Curves | Geometric ✓, Organic ○ | Physical objects vary |
| Palette | Warm ✓, Earth ✓, Jewel ✓ | Natural materials |
| Density | Balanced ✓, Dense ○ | Needs room for detail |

## Incompatible Modifiers

- **Asymmetric/Broken grid**: Physical objects need order
- **Angular curves**: Most real objects are rounded
- **Neon palette**: Unnatural for material simulation
- **Claustrophobic**: Details get lost

## Anti-Patterns Specifici

- Skeuomorphism + Low detail = Uncanny valley (either realistic or don't)
- Skeuomorphism + Inconsistent lighting = Breaks illusion
- Skeuomorphism + Mixed materials = Confusing

## Best For

- Audio/music applications (knobs, faders)
- Calculator apps
- AR/VR interfaces (familiar objects)
- IoT device controls
- Nostalgic/retro designs
- Games (realistic UI elements)

## Avoid For

- Modern/minimal brands
- Text-heavy content
- Mobile web (performance)
- Rapidly updating interfaces
- Accessibility-focused projects

## Historical Note

Skeuomorphism dominated iOS until iOS 7 (2013), then fell out of favor. It's making a comeback in:
- AR/VR (familiar mental models)
- IoT (physical device interfaces)
- Nostalgic/retro aesthetics
- Specialized tools (audio, video)

The key is **intentionality**: use it when the physical metaphor helps users, not for decoration.

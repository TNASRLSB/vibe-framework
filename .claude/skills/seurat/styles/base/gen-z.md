# Gen-Z Aesthetic

## Identity

**Origins**: TikTok era (2020+), "Corecore", "Weird UI", anti-design movement
**Philosophy**: Authentic chaos - rifiuto della perfezione, embrace del glitch
**Personality**: Chaotic, authentic, ironic, expressive, anti-corporate

## Visual Signature

- **Anti-design intenzionale**: Sovrapposizioni caotiche, glitch, text overflow
- **Colori improbabili**: Neon lime + rosa shocking + nero, combinazioni "sbagliate"
- **Typography mista**: 3-5 font diversi nella stessa pagina
- **Movimento "cringe"**: Animazioni elastiche, bounce esagerato
- **Elementi rotti**: Glitch effects, pixel corruption, intentional errors
- **Layer sovrapposti**: Stickers, annotations, doodles

## Tokens CSS

```css
/* Gen-Z Aesthetic Tokens */

/* Colors - intentionally clashing */
--genz-lime: hsl(90 100% 50%);
--genz-pink: hsl(330 100% 65%);
--genz-blue: hsl(220 100% 60%);
--genz-orange: hsl(25 100% 55%);
--genz-purple: hsl(280 90% 60%);
--genz-black: hsl(0 0% 5%);

/* Glitch colors */
--genz-glitch-1: hsl(0 100% 50%);
--genz-glitch-2: hsl(180 100% 50%);

/* Background */
--color-bg: var(--genz-black);
--color-surface: hsl(0 0% 10%);
--color-text: hsl(0 0% 100%);
--color-accent: var(--genz-lime);

/* Spacing - intentionally irregular */
--space-1: 7px;   /* not 8 */
--space-2: 15px;  /* not 16 */
--space-3: 26px;  /* not 24 */
--space-4: 33px;  /* not 32 */
--space-5: 51px;  /* not 48 */
--space-6: 69px;  /* nice */

/* Typography - mixed */
--font-display: "Comic Sans MS", "Marker Felt", cursive;
--font-body: "Arial", sans-serif;
--font-accent: "Times New Roman", serif;
--font-mono: "Courier New", monospace;
--font-meme: "Impact", "Arial Black", sans-serif;

/* Type scale - dramatic */
--text-xs: 0.6rem;
--text-sm: 0.8rem;
--text-base: 1rem;
--text-lg: 1.5rem;
--text-xl: 2.5rem;
--text-2xl: 4rem;
--text-3xl: 7rem;

/* Borders */
--border-thick: 3px solid var(--genz-lime);
--border-dashed: 2px dashed var(--genz-pink);

/* Shadows - offset, colored */
--genz-shadow:
  4px 4px 0 var(--genz-pink),
  8px 8px 0 var(--genz-lime);
--genz-shadow-glitch:
  -2px 0 var(--genz-glitch-1),
  2px 0 var(--genz-glitch-2);

/* Radius - mixed */
--radius-none: 0;
--radius-blob: 30% 70% 70% 30% / 30% 30% 70% 70%;
--radius-full: 9999px;

/* Glitch animation */
--glitch-duration: 0.3s;

/* Transitions - bouncy */
--transition-bounce: 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
--transition-elastic: 600ms cubic-bezier(0.68, -0.6, 0.32, 1.6);
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | -2mm to +5mm | Inconsistente |
| Shadow | Offset colored | Hard shadows |
| Contrast | Variable | Può essere estremo o basso |
| Border radius | Mixed | 0 e blob nello stesso design |
| Animation | Bouncy/glitchy | Never smooth |

## Tactile Description

*Immagina di toccare un mosaico di Lego lasciato da un bambino: i pezzi sono a diverse altezze (2-5mm), colori accostati senza logica apparente, alcuni sono rotti o storti. Quando premi un pulsante "ironico", la resistenza è imprevedibile: a volte cede subito (50g), a volte è duro (150g). La vibrazione è "dannata": non un clic pulito, ma uno stutter (bzz-bzz-pausa-bzz) che simula un glitch digitale.*

## Component Examples

```css
/* Gen-Z Button */
.btn-genz {
  padding: var(--space-2) var(--space-4);
  background: var(--genz-lime);
  color: var(--genz-black);
  border: var(--border-thick);
  border-radius: var(--radius-none);
  font-family: var(--font-meme);
  font-size: var(--text-lg);
  text-transform: uppercase;
  box-shadow: var(--genz-shadow);
  cursor: pointer;
  transform: rotate(-2deg);
  transition: all var(--transition-bounce);
}

.btn-genz:hover {
  transform: rotate(2deg) scale(1.1);
  background: var(--genz-pink);
  box-shadow:
    -4px -4px 0 var(--genz-lime),
    -8px -8px 0 var(--genz-pink);
}

/* Gen-Z Glitch Text */
.text-glitch {
  position: relative;
  font-family: var(--font-meme);
  font-size: var(--text-2xl);
  color: var(--color-text);
}

.text-glitch::before,
.text-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.text-glitch::before {
  color: var(--genz-glitch-1);
  animation: glitch-1 var(--glitch-duration) infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.text-glitch::after {
  color: var(--genz-glitch-2);
  animation: glitch-2 var(--glitch-duration) infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-3px, 3px); }
  40% { transform: translate(3px, -3px); }
  60% { transform: translate(-3px, -3px); }
  80% { transform: translate(3px, 3px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(3px, -3px); }
  40% { transform: translate(-3px, 3px); }
  60% { transform: translate(3px, 3px); }
  80% { transform: translate(-3px, -3px); }
}

/* Gen-Z Card */
.card-genz {
  padding: var(--space-4);
  background: var(--color-surface);
  border: var(--border-dashed);
  border-radius: var(--radius-blob);
  transform: rotate(1deg);
  position: relative;
}

.card-genz::before {
  content: '✨';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 2rem;
}

/* Gen-Z Sticker */
.sticker-genz {
  display: inline-block;
  padding: 4px 12px;
  background: var(--genz-orange);
  color: var(--genz-black);
  border: 2px solid var(--genz-black);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  transform: rotate(var(--rotation, 5deg));
  box-shadow: 2px 2px 0 var(--genz-black);
}

/* Gen-Z Divider */
.divider-genz {
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    var(--genz-lime) 0px,
    var(--genz-lime) 10px,
    var(--genz-pink) 10px,
    var(--genz-pink) 20px,
    var(--genz-black) 20px,
    var(--genz-black) 30px
  );
  transform: skewX(-5deg);
}

/* Gen-Z Input */
.input-genz {
  padding: var(--space-2);
  background: var(--genz-black);
  border: var(--border-thick);
  border-radius: var(--radius-none);
  font-family: var(--font-mono);
  font-size: var(--text-base);
  color: var(--genz-lime);
  caret-color: var(--genz-pink);
}

.input-genz::placeholder {
  color: var(--genz-pink);
  font-style: italic;
}

.input-genz:focus {
  outline: none;
  box-shadow: var(--genz-shadow-glitch);
  animation: input-shake 0.1s ease-in-out;
}

@keyframes input-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

## Ideal Weights

```yaml
trust: 0.3
innovation: 0.8
formality: 0.1
warmth: 0.6
playfulness: 0.9
density: 0.6
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Asymmetric ✓, Broken ✓ | Order is the enemy |
| Curves | Mixed ✓, Angular ○ | Inconsistency is key |
| Palette | Neon ✓ | Clash is good |
| Density | Balanced ✓, Dense ✓, Claustrophobic ○ | Can be overwhelming |

## Incompatible Modifiers

- **Swiss grid**: Antithetical to Gen-Z chaos
- **Geometric precision**: Too orderly
- **Earth/Warm/Cold palette**: Too harmonious
- **Sparse density**: Gen-Z is about filling space

## Anti-Patterns Specifici

- Gen-Z + Clean grid = Defeats the purpose
- Gen-Z + Matching fonts = Too polished
- Gen-Z + Subtle colors = Not Gen-Z

## Hard Constraints

```yaml
formality.max: 0.4
# Gen-Z aesthetic cannot be formal
```

## Best For

- Youth-targeted brands
- Social media / content platforms
- Music / entertainment
- Meme culture products
- Anti-corporate messaging
- Creative portfolios (young designers)

## Avoid For

- Enterprise software
- Healthcare / finance
- Older demographics (35+)
- Accessibility requirements
- Long-form content
- Serious/formal contexts

## Cultural Context

Gen-Z aesthetic is a **reaction against**:
- Millennial minimalism
- Corporate polish
- "Authenticity theater"
- Over-designed perfection

It embraces:
- Deliberate imperfection
- Ironic sincerity
- Chaotic energy
- Anti-corporate sentiment

**Important**: Gen-Z aesthetic done by non-Gen-Z often feels forced. The line between authentic chaos and "fellow kids" is thin.

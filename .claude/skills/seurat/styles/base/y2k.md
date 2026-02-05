# Y2K

## Identity

**Origins**: Late 1990s - early 2000s aesthetic, revived 2022-2024
**Philosophy**: Techno-optimism, chrome, digital excess, millennium futurism
**Personality**: Nostalgic, futuristic, chrome, neon, glossy, excessive

## Visual Signature

- **Metallo liquido**: Gradienti cromatici che simulano chrome
- **Neon e glow**: Colori saturi con effetti di luminescenza
- **Pixel art**: Bitmap 8-bit, aesthetic digitale
- **Holographic**: Gradienti iridescenti multi-colore
- **Glossy surfaces**: Riflessi, shine, wet look
- **Tech typography**: Font "futuristici" del 2000

## Tokens CSS

```css
/* Y2K Tokens */

/* Chrome gradients */
--y2k-chrome: linear-gradient(145deg,
  hsl(0 0% 95%) 0%,
  hsl(220 10% 70%) 25%,
  hsl(0 0% 95%) 50%,
  hsl(220 10% 60%) 75%,
  hsl(0 0% 90%) 100%);

/* Holographic */
--y2k-holo: linear-gradient(135deg,
  hsl(300 100% 70%) 0%,
  hsl(180 100% 70%) 25%,
  hsl(60 100% 70%) 50%,
  hsl(300 100% 70%) 75%,
  hsl(180 100% 70%) 100%);

/* Neon colors */
--y2k-pink: hsl(320 100% 60%);
--y2k-cyan: hsl(180 100% 50%);
--y2k-lime: hsl(90 100% 50%);
--y2k-purple: hsl(280 100% 60%);
--y2k-orange: hsl(30 100% 55%);

/* Glow effects */
--y2k-glow-pink: 0 0 20px hsl(320 100% 60% / 0.6);
--y2k-glow-cyan: 0 0 20px hsl(180 100% 50% / 0.6);
--y2k-glow-multi:
  0 0 10px hsl(320 100% 60% / 0.4),
  0 0 20px hsl(180 100% 50% / 0.3),
  0 0 30px hsl(60 100% 70% / 0.2);

/* Background */
--color-bg: hsl(260 30% 10%);
--color-surface: hsl(260 25% 15%);
--color-text: hsl(0 0% 100%);
--color-text-muted: hsl(260 20% 70%);

/* Spacing */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography - tech/cyber fonts */
--font-display: "Orbitron", "Audiowide", "Arial Black", sans-serif;
--font-body: "Share Tech", "Rajdhani", "Arial", sans-serif;
--font-pixel: "VT323", "Press Start 2P", monospace;
--text-base: 1rem;
--line-height: 1.4;

/* Shadows */
--y2k-shadow:
  4px 4px 0 hsl(320 100% 60% / 0.3),
  8px 8px 0 hsl(180 100% 50% / 0.2);

/* Borders */
--y2k-border: 2px solid hsl(180 100% 50%);
--y2k-border-glow: 2px solid hsl(180 100% 50%);

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;

/* Transitions */
--transition: 200ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 3mm | Sporgente con bordo metallico |
| Shadow | Offset + glow | Colored shadows |
| Contrast | Variable | Neon on dark = high |
| Border radius | 4-16px | Can be sharp or rounded |
| Glow spread | 10-30px | Neon effect |

## Tactile Description

*Immagina di toccare un CD-ROM degli anni 2000: superficie metallica liscia ma con iridescenze, gradienti che cambiano angolo. Il pulsante è freddo al tatto (25°C), sporgente 3mm, con un bordo argentato che riflette. Quando premi, la resistenza è "elettronica": 110g con un clicchetto metallico, seguito da una vibrazione che ricorda il vibrare di un Nokia 3310 (120Hz). I colori sono intensi, quasi fosforescenti.*

## Component Examples

```css
/* Y2K Button - Chrome */
.btn-y2k-chrome {
  padding: var(--space-2) var(--space-4);
  background: var(--y2k-chrome);
  color: hsl(260 30% 20%);
  border: 2px solid hsl(0 0% 80%);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.8),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 2px 4px rgba(0,0,0,0.3);
  cursor: pointer;
}

/* Y2K Button - Neon */
.btn-y2k-neon {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--y2k-cyan);
  border: var(--y2k-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: var(--y2k-glow-cyan);
  box-shadow: var(--y2k-glow-cyan);
  cursor: pointer;
  transition: all var(--transition);
}

.btn-y2k-neon:hover {
  background: var(--y2k-cyan);
  color: hsl(260 30% 10%);
  text-shadow: none;
  box-shadow:
    var(--y2k-glow-cyan),
    inset 0 0 20px rgba(255,255,255,0.3);
}

/* Y2K Card - Holographic */
.card-y2k {
  padding: var(--space-4);
  background:
    var(--y2k-holo),
    hsl(260 25% 15%);
  background-blend-mode: overlay;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-lg);
  box-shadow: var(--y2k-glow-multi);
  color: var(--color-text);
}

/* Y2K Heading */
.heading-y2k {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--y2k-chrome);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(2px 2px 0 hsl(320 100% 60%));
}

/* Y2K Pixel Element */
.pixel-y2k {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  font-family: var(--font-pixel);
}

/* Y2K Divider */
.divider-y2k {
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--y2k-cyan) 20%,
    var(--y2k-pink) 50%,
    var(--y2k-cyan) 80%,
    transparent 100%);
  box-shadow: var(--y2k-glow-multi);
}

/* Y2K Badge */
.badge-y2k {
  display: inline-block;
  padding: 4px 12px;
  background: var(--y2k-chrome);
  border: 1px solid hsl(0 0% 70%);
  border-radius: var(--radius-sm);
  font-family: var(--font-pixel);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: hsl(260 30% 20%);
}
```

## Ideal Weights

```yaml
trust: 0.3
innovation: 0.7
formality: 0.2
warmth: 0.5
playfulness: 0.7
density: 0.5
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Asymmetric ✓, Broken ✓, Bento ○ | Experimental layouts |
| Curves | Geometric ○, Angular ✓ | Sharp or rounded both work |
| Palette | Neon ✓, Jewel ○ | Saturated colors |
| Density | Balanced ✓, Dense ○ | Can handle density |

## Incompatible Modifiers

- **Swiss grid**: Too orderly for Y2K chaos
- **Organic/Art Nouveau**: Wrong aesthetic entirely
- **Earth/Warm palette**: No natural colors
- **Sparse density**: Y2K is about excess

## Anti-Patterns Specifici

- Y2K + Muted colors = Not Y2K (needs saturation)
- Y2K + No glow effects = Missing the point
- Y2K + Modern minimal fonts = Anachronistic

## Best For

- Creative portfolios
- Music/entertainment
- Gen Z targeted brands
- Nostalgic/retro projects
- Fashion/streetwear
- Event/party sites

## Avoid For

- Enterprise/corporate
- Healthcare/finance
- Accessibility-critical
- Older demographics
- Serious/formal contexts

## Cultural Context

Y2K aesthetic represents a specific moment:
- Pre-9/11 techno-optimism
- Millennium futurism
- Early internet energy
- Before smartphones, before social media

The revival is driven by:
- Gen Z nostalgia for an era they didn't live
- Reaction against minimal/flat design
- Desire for maximalism and expression

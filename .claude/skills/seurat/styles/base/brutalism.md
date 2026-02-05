# Brutalism

## Identity

**Origins**: Architecture (béton brut, 1950s), Web (2017+)
**Philosophy**: Raw, honest, anti-design - rifiuto delle convenzioni estetiche
**Personality**: Bold, raw, confrontational, authentic, unapologetic
**Russian**: Брутализм (Brutalizm)
**Chinese**: 粗野主义 (Cūyě zhǔyì)

## Visual Signature

- **Nessuna ombra**: Box-shadow: none, sempre
- **Font di sistema**: Arial, Times New Roman, Courier - raw, non curati
- **Colori puri**: #000000, #FFFFFF, #FF0000, #0000FF - no sfumature
- **Bordi netti**: Border-radius: 0, angoli taglienti
- **Layout asimmetrico**: Griglia rotta intenzionalmente
- **Testo grande**: Typography come elemento grafico
- **Contrasto estremo**: Bianco su nero, nero su bianco

## Tokens CSS

```css
/* Brutalism Tokens */

/* Colors - pure, no gradients */
--brutal-black: #000000;
--brutal-white: #FFFFFF;
--brutal-red: #FF0000;
--brutal-blue: #0000FF;
--brutal-yellow: #FFFF00;

/* Background options */
--color-bg: var(--brutal-white);
--color-surface: var(--brutal-white);
--color-text: var(--brutal-black);
--color-accent: var(--brutal-red);
--color-link: var(--brutal-blue);

/* Spacing - irregular but intentional */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 40px;   /* note: not 32px */
--space-5: 64px;
--space-6: 100px;  /* note: not 96px */

/* Typography - system fonts, raw */
--font-display: "Times New Roman", Times, serif;
--font-body: "Arial", Helvetica, sans-serif;
--font-mono: "Courier New", Courier, monospace;

/* Type scale - dramatic */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.25rem;
--text-xl: 2rem;
--text-2xl: 3rem;
--text-3xl: 5rem;
--text-4xl: 8rem;

/* Borders */
--border-thin: 1px solid var(--brutal-black);
--border-thick: 3px solid var(--brutal-black);
--border-brutal: 5px solid var(--brutal-black);

/* Radius */
--radius: 0; /* always */

/* Shadows */
--shadow: none; /* always */

/* Transitions - instant or none */
--transition: none;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 3-5mm | Bordi spessi creano peso |
| Shadow | None | Mai |
| Contrast | ΔE 100 | Massimo possibile |
| Border radius | 0 | Mai arrotondato |
| Border width | 1-5px | Spesso, visibile |

## Tactile Description

*Immagina di toccare un muro di cemento grezzo. La superficie è ruda e porosa: senti i granelli di sabbia sotto le dita, le irregolarità di 0.5-2mm. Non c'è alcuna morbidezza. I pulsanti sono come blocchi di cemento sporgenti 3mm con bordi taglienti a 90°. Il testo è inciso come su una targa metallica: caratteri sporgenti 0.2mm, rigidi, senza curve. Il contrasto è estremo: nero assoluto vs bianco assoluto.*

## Component Examples

```css
/* Brutal Button */
.btn-brutal {
  padding: var(--space-2) var(--space-3);
  background: var(--brutal-black);
  color: var(--brutal-white);
  border: var(--border-brutal);
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: bold;
  font-size: var(--text-base);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: var(--transition);
}

.btn-brutal:hover {
  background: var(--brutal-white);
  color: var(--brutal-black);
}

/* Brutal Link */
.link-brutal {
  color: var(--brutal-blue);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
}

.link-brutal:hover {
  background: var(--brutal-yellow);
}

/* Brutal Card */
.card-brutal {
  padding: var(--space-4);
  background: var(--brutal-white);
  border: var(--border-brutal);
}

/* Brutal Heading */
.heading-brutal {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 400; /* Times doesn't need bold */
  line-height: 0.9;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

/* Brutal Input */
.input-brutal {
  padding: var(--space-2);
  background: var(--brutal-white);
  border: var(--border-thick);
  font-family: var(--font-mono);
  font-size: var(--text-base);
}

.input-brutal:focus {
  outline: 3px solid var(--brutal-red);
  outline-offset: 0;
}

/* Brutal Navigation */
.nav-brutal {
  display: flex;
  gap: 0;
  border-bottom: var(--border-brutal);
}

.nav-brutal a {
  padding: var(--space-2) var(--space-3);
  border-right: var(--border-thin);
  font-family: var(--font-body);
  text-transform: uppercase;
  text-decoration: none;
  color: var(--brutal-black);
}

.nav-brutal a:hover {
  background: var(--brutal-black);
  color: var(--brutal-white);
}
```

## Ideal Weights

```yaml
trust: 0.3
innovation: 0.7
formality: 0.2
warmth: 0.2
playfulness: 0.6
density: 0.5
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Bauhaus ✓, Asymmetric ✓, Broken ✓ | Rule-breaking encouraged |
| Curves | Geometric ✓, Angular ✓ | No soft curves |
| Palette | Mono ✓, Neon ✓ | Pure colors only |
| Density | Balanced ✓, Dense ✓ | Can handle density |

## Incompatible Modifiers

- **Swiss grid**: Too orderly for brutalism
- **Organic/Art Nouveau curves**: Contradicts rawness
- **Warm/Earth palette**: Too soft
- **Sparse density**: Brutalism needs presence

## Anti-Patterns Specifici

- Brutalism + Rounded corners = Not brutalism
- Brutalism + Shadows = Not brutalism
- Brutalism + Gradients = Not brutalism
- Brutalism + "Safe" typography = Defeats the purpose

## Best For

- Creative portfolios
- Art/gallery websites
- Editorial/magazine
- Experimental projects
- Statement pieces
- Anti-establishment brands

## Avoid For

- Corporate/enterprise
- Healthcare/finance (trust issues)
- E-commerce (conversion issues)
- Accessibility-critical (contrast can be harsh)
- Mobile-first (touch targets need care)

## Cultural Note

Brutalism in web design is a **statement**. It says:
- "I reject polish"
- "Function over decoration"
- "Authenticity over beauty"

Use it when the message matters more than the medium.

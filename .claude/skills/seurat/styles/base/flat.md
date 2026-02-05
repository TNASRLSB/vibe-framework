# Flat Design

## Identity

**Origins**: Bauhaus (1919), Swiss Style (1940s), Microsoft Metro (2010), iOS 7 (2013)
**Philosophy**: "Form follows function" - ogni elemento ha uno scopo, nessun ornamento superfluo
**Personality**: Minimale, pulito, essenziale, onesto, diretto

## Visual Signature

- **2D assoluto**: Nessuna ombra, nessuna profondità, nessun gradiente
- **Colori solidi**: Palette vibranti con contrasti netti
- **Tipografia pulita**: Sans-serif, gerarchia basata su peso e dimensione
- **Spazio negativo**: Whitespace strategico, elementi respirano
- **Iconografia simbolica**: Rappresentazione astratta, non realistica
- **Griglia rigorosa**: Allineamento su multipli di 8px

## Tokens CSS

```css
/* Flat Design Tokens */

/* Spacing - 8px base */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography */
--font-display: "SF Pro Display", "Helvetica Neue", system-ui, sans-serif;
--font-body: "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
--text-base: 1rem;
--line-height: 1.5;

/* Colors - example vibrant palette */
--color-bg: hsl(0 0% 100%);
--color-surface: hsl(0 0% 98%);
--color-text: hsl(0 0% 10%);
--color-text-muted: hsl(0 0% 45%);
--color-accent: hsl(210 100% 50%);
--color-accent-hover: hsl(210 100% 40%);

/* Borders & Radius */
--border: none;
--radius: 0; /* Pure flat = no radius */
/* Alternative: --radius: 4px; for soft flat */

/* Shadows */
--shadow: none;

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 0mm | Completamente piatto |
| Shadow | None | Mai |
| Contrast | ΔE > 30 | Alto contrasto obbligatorio |
| Border radius | 0-4px | 0 per purista, 4px per soft |
| Grid | 8px base | Tutti i valori multipli di 8 |

## Tactile Description

*Immagina un tavolo di vetro perfettamente liscio. Ogni elemento è un tassello di plastica lucida incollato sulla superficie: bordi netti come tagli al laser, angoli a 90°, spessore zero. Un pulsante rosso è semplicemente un rettangolo di plastica rossa. La differenza tra elementi è solo nel colore, mai nella profondità. Puoi mappare la pagina come una scacchiera tattile.*

## Component Examples

```css
/* Flat Button */
.btn-flat {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-flat:hover {
  background: var(--color-accent-hover);
}

.btn-flat:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Flat Card */
.card-flat {
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius);
  /* No shadow, no border - just color difference */
}

/* Flat Input */
.input-flat {
  padding: var(--space-2);
  background: var(--color-surface);
  border: 2px solid var(--color-text-muted);
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}

.input-flat:focus {
  border-color: var(--color-accent);
  outline: none;
}
```

## Ideal Weights

```yaml
trust: 0.5
innovation: 0.6
formality: 0.5
warmth: 0.4
playfulness: 0.3
density: 0.5
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bauhaus ✓, Bento ✓, Asymmetric ○ | Core flat è grid-based |
| Curves | Geometric ✓, Angular ○ | No organic, no nouveau |
| Palette | All ✓ | Flat è palette-agnostic |
| Density | Sparse ✓, Balanced ✓, Dense ○ | Avoid claustrophobic |

## Incompatible Modifiers

- **Organic curves**: Contraddict geometric purity
- **Art Nouveau**: Too decorative
- **Broken grid**: Flat requires order
- **Claustrophobic density**: Needs whitespace to breathe

## Anti-Patterns Specifici

- Flat + Inter + Blue accent = The SaaS Starter (evitare)
- Flat + No color variation = Boring (serve contrasto)
- Flat + Tiny text = Illegible (serve gerarchia)

## Best For

- Mobile apps (performance, clarity)
- Content-first websites (blogs, news)
- Utility applications (tools, calculators)
- Infographics and data visualization
- Icon systems

## Avoid For

- Luxury brands (needs depth for premium feel)
- Immersive experiences (needs dimension)
- Highly tactile interfaces (needs feedback)
- Skeuomorphic contexts (physical product UIs)

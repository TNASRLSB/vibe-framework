# Material Design

## Identity

**Origins**: Google (2014), inspired by paper and ink
**Philosophy**: Material is a metaphor - surfaces and edges provide visual cues grounded in reality
**Personality**: Fisico, responsive, layered, systematic, tactile

## Visual Signature

- **Z-depth**: Sistema a 5 livelli di elevazione (0dp a 24dp)
- **Ombre realistiche**: Basate su leggi fisiche della luce
- **Griglia 8dp**: Tutte le dimensioni sono multipli di 8
- **Movimento fisico**: Curve di accelerazione basate su fisica reale
- **Colori con significato**: Primary, secondary, surface, error
- **Componenti standardizzati**: Buttons, cards, chips, etc.

## Tokens CSS

```css
/* Material Design Tokens */

/* Spacing - 8dp base */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;

/* Typography - Roboto alternative */
--font-display: "Inter", "Roboto", system-ui, sans-serif;
--font-body: "Inter", "Roboto", system-ui, sans-serif;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--line-height: 1.5;

/* Elevation (Z-depth) */
--elevation-0: none;
--elevation-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
--elevation-2: 0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12);
--elevation-3: 0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10);
--elevation-4: 0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05);
--elevation-5: 0 20px 40px rgba(0,0,0,0.2);

/* Colors */
--color-bg: hsl(0 0% 98%);
--color-surface: hsl(0 0% 100%);
--color-primary: hsl(210 100% 50%);
--color-primary-variant: hsl(210 100% 40%);
--color-secondary: hsl(330 80% 50%);
--color-error: hsl(0 80% 50%);
--color-on-primary: hsl(0 0% 100%);
--color-on-surface: hsl(0 0% 10%);

/* Borders & Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;

/* Motion */
--motion-standard: 225ms cubic-bezier(0.4, 0, 0.2, 1);
--motion-enter: 225ms cubic-bezier(0, 0, 0.2, 1);
--motion-exit: 195ms cubic-bezier(0.4, 0, 1, 1);
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element height | 2-8mm | Basato su elevation |
| Shadow | Unilaterale | Sempre sotto l'elemento |
| Contrast | ΔE 20-30 | Medio-alto |
| Border radius | 4-16px | Dipende da componente |
| Grid | 8dp | Rigido |

## Tactile Description

*Pensa a un tavolo con fogli di cartoncino spesso (2mm) sovrapposti. Ogni card è un foglio sollevato da 2-8mm. Quando premi un pulsante, senti un clic fisico di 1mm verso il basso con una vibrazione di 225ms. Le ombre sotto sono come incisioni: più il foglio è alto, più l'incisione è profonda e sfocata. Gli elementi si comportano come carta reale: possono scorrere, sovrapporsi, ma mai deformarsi.*

## Component Examples

```css
/* Material Button - Contained */
.btn-material {
  padding: 0 var(--space-3);
  height: 36px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.0892857143em;
  box-shadow: var(--elevation-2);
  cursor: pointer;
  transition: box-shadow var(--motion-standard),
              background var(--motion-standard);
}

.btn-material:hover {
  box-shadow: var(--elevation-3);
}

.btn-material:active {
  box-shadow: var(--elevation-4);
}

/* Material Card */
.card-material {
  padding: var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--elevation-1);
  transition: box-shadow var(--motion-standard);
}

.card-material:hover {
  box-shadow: var(--elevation-2);
}

/* Material FAB */
.fab-material {
  width: 56px;
  height: 56px;
  background: var(--color-secondary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--elevation-3);
  cursor: pointer;
  transition: box-shadow var(--motion-standard);
}

/* Material Input */
.input-material {
  padding: var(--space-2);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-on-surface);
  font-family: var(--font-body);
  font-size: var(--text-base);
  transition: border-color var(--motion-standard);
}

.input-material:focus {
  border-bottom: 2px solid var(--color-primary);
  outline: none;
}
```

## Ideal Weights

```yaml
trust: 0.6
innovation: 0.6
formality: 0.6
warmth: 0.5
playfulness: 0.4
density: 0.6
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bento ✓, Bauhaus ○ | 8dp grid è core |
| Curves | Geometric ✓, Organic ○ | Soft corners ok |
| Palette | Warm ✓, Cold ✓, Mono ○ | Needs color hierarchy |
| Density | Balanced ✓, Dense ✓, Sparse ○ | Designed for density |

## Incompatible Modifiers

- **Broken grid**: Material è sistematico
- **Art Nouveau**: Troppo organico
- **Neon palette**: Troppo aggressivo per il sistema
- **Claustrophobic**: Perde gerarchia visiva

## Anti-Patterns Specifici

- Material + Gray only + Card grid = Dashboard Gray (evitare)
- Material + Roboto + Default icons = Google Clone (personalizza)
- Material + No elevation variation = Flat wannabe (usa le ombre)

## Best For

- Android apps (native)
- Dashboards and admin panels
- Enterprise applications
- Data-heavy interfaces
- Cross-platform apps

## Avoid For

- iOS-only apps (usa SF symbols)
- Luxury/premium brands (troppo "Google")
- Highly creative/artistic projects
- Minimal/editorial designs

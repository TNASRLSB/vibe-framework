# Glassmorphism

## Identity

**Origins**: Apple macOS Big Sur (2020), coined by Michał Malewicz
**Philosophy**: Frosted glass effect - trasparenza che crea profondità attraverso blur
**Personality**: Moderno, elegante, layered, aereo, sofisticato
**Chinese**: 玻璃拟态 (Bōlí nǐ tài)
**Japanese**: グラスモーフィズム

## Visual Signature

- **Background blur**: Elementi semi-trasparenti con backdrop-filter
- **Trasparenza**: 10-30% opacità per il background
- **Bordo sottile**: 1px bianco/chiaro semi-trasparente per definire i contorni
- **Multi-layer**: Almeno 2-3 livelli di profondità
- **Colori vivaci sotto**: Il blur funziona meglio su sfondi colorati/gradienti
- **Ombre diffuse**: Soft shadows per separare i layer

## Tokens CSS

```css
/* Glassmorphism Tokens */

/* Background - needs to be colorful for effect to work */
--glass-backdrop: linear-gradient(135deg,
  hsl(280 80% 60%) 0%,
  hsl(320 80% 55%) 50%,
  hsl(30 90% 60%) 100%);

/* Glass surfaces */
--glass-bg: rgba(255, 255, 255, 0.15);
--glass-bg-hover: rgba(255, 255, 255, 0.25);
--glass-bg-strong: rgba(255, 255, 255, 0.3);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-border-strong: rgba(255, 255, 255, 0.4);

/* Blur values */
--glass-blur-sm: blur(8px);
--glass-blur-md: blur(16px);
--glass-blur-lg: blur(24px);

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

/* Colors on glass */
--color-text: rgba(255, 255, 255, 0.95);
--color-text-muted: rgba(255, 255, 255, 0.7);
--color-accent: hsl(210 100% 65%);

/* Shadows */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
--glass-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.15);

/* Radius */
--radius: 16px;
--radius-sm: 12px;
--radius-lg: 24px;

/* Transitions */
--transition: 200ms ease;
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Element "height" | 2-3mm percepito | Illusione di profondità |
| Blur radius | 8-24px | Dipende da distanza percepita |
| Opacity | 10-30% | Troppo opaco perde l'effetto |
| Border | 1px | Sottile ma necessario |
| Background distance | 5-10mm percepito | Spazio virtuale sotto il vetro |

## Tactile Description

*Immagina di avere un foglio di plexiglass spesso 2mm sopra un poster colorato. Il plexiglass è lucido ma leggermente smerigliato: quando lo tocchi, senti una superficie liscia ma opaca. Sotto, i colori del poster sono visibili ma sfumati, come attraverso una nebbia leggera. Il bordo del plexiglass ha un filo bianco sottile (1mm) che ne definisce il contorno. Se spingi, il vetro non si muove ma senti la distanza di 5mm dal poster sotto.*

## Component Examples

```css
/* Glass Card */
.card-glass {
  padding: var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-md);
  -webkit-backdrop-filter: var(--glass-blur-md);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
}

/* Glass Button */
.btn-glass {
  padding: var(--space-2) var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-glass:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
}

/* Glass Input */
.input-glass {
  padding: var(--space-2) var(--space-3);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--text-base);
}

.input-glass::placeholder {
  color: var(--color-text-muted);
}

.input-glass:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent), 0.3);
}

/* Glass Navigation */
.nav-glass {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: var(--space-2) var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-lg);
  -webkit-backdrop-filter: var(--glass-blur-lg);
  border-bottom: 1px solid var(--glass-border);
}

/* Glass Modal */
.modal-glass {
  padding: var(--space-5);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-lg);
  -webkit-backdrop-filter: var(--glass-blur-lg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow-lg);
}
```

## Ideal Weights

```yaml
trust: 0.5
innovation: 0.8
formality: 0.5
warmth: 0.4
playfulness: 0.5
density: 0.4
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Swiss ✓, Bento ✓, Asymmetric ○ | Layers need structure |
| Curves | Geometric ✓, Organic ○ | Rounded corners preferred |
| Palette | Cold ✓, Neon ✓, Jewel ✓ | Needs colorful backdrop |
| Density | Sparse ✓, Balanced ✓ | Blur needs some space |

## Incompatible Modifiers

- **Earth palette**: Too muted for blur effect
- **Claustrophobic density**: Blur overlaps badly
- **Angular curves**: Looks odd with glass metaphor
- **Broken grid**: Glass panels need definition

## Anti-Patterns Specifici

- Glassmorphism + Purple gradient + Centered = The Dribbble Default
- Glassmorphism + No backdrop color = Pointless (just transparent)
- Glassmorphism + Too many layers = Muddy mess

## Performance Warning

⚠️ **backdrop-filter è costoso**:
- Heavy on GPU
- Can cause stuttering on scroll
- Not supported in some browsers

**Mitigazioni**:
1. Usa `will-change: transform` su elementi animati
2. Limita il numero di elementi con blur
3. Riduci blur radius su mobile
4. Fallback per browser non supportati:
   ```css
   @supports not (backdrop-filter: blur(1px)) {
     .card-glass {
       background: rgba(255, 255, 255, 0.9);
     }
   }
   ```

## Best For

- Landing pages (hero sections)
- Modal dialogs and overlays
- Navigation bars
- Card-based layouts
- Music/media players
- Modern SaaS dashboards

## Avoid For

- Text-heavy content (readability issues)
- High-performance requirements
- Accessibility-critical interfaces
- Print/static media
- Browsers without backdrop-filter support

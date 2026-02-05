# Spatial Design

## Identity

**Origins**: Apple Vision Pro (2024), AR/VR interfaces
**Philosophy**: Interfaces that exist in 3D space - depth, parallax, spatial relationships
**Personality**: Immersive, futuristic, innovative, dimensional, premium
**Russian**: Спейшиал дизайн (Spejshial dizajn)

## Visual Signature

- **Z-axis attiva**: Elementi posizionati a diverse profondità (-100px a +100px)
- **Parallax**: Movimento differenziale basato su profondità
- **Prospettiva**: Transform con perspective per profondità reale
- **Scala dinamica**: Elementi in background più piccoli, foreground più grandi
- **Blur di profondità**: Elementi distanti sfocati
- **Ombre direzionali**: Ombre che seguono la "luce" dell'ambiente

## Tokens CSS

```css
/* Spatial Design Tokens */

/* Depth levels (Z-axis) */
--depth-far: -100px;
--depth-back: -50px;
--depth-base: 0;
--depth-front: 50px;
--depth-near: 100px;

/* Perspective */
--perspective: 1000px;
--perspective-origin: 50% 50%;

/* Scale by depth */
--scale-far: 0.8;
--scale-back: 0.9;
--scale-base: 1;
--scale-front: 1.1;
--scale-near: 1.2;

/* Blur by depth */
--blur-far: blur(4px);
--blur-back: blur(2px);
--blur-base: blur(0);
--blur-front: blur(0);

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

/* Colors - often dark with glass effects */
--color-bg: hsl(220 20% 10%);
--color-surface: rgba(255, 255, 255, 0.1);
--color-surface-solid: hsl(220 20% 15%);
--color-text: hsl(0 0% 98%);
--color-text-muted: hsl(0 0% 70%);
--color-accent: hsl(210 100% 60%);

/* Glass effect (common in spatial) */
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.15);
--glass-blur: blur(20px);

/* Shadows - 3D aware */
--shadow-spatial:
  0 10px 30px rgba(0, 0, 0, 0.3),
  0 5px 15px rgba(0, 0, 0, 0.2);

/* Radius */
--radius: 20px;
--radius-lg: 32px;

/* Transitions */
--transition: 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
--transition-slow: 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

## Proportions

| Property | Value | Note |
|----------|-------|------|
| Depth range | ±100mm | Virtual Z-space |
| Parallax ratio | 10-20% | Movement relative to scroll |
| Perspective | 1000px | Standard depth perception |
| Scale ratio | 0.8-1.2 | Based on Z position |
| Blur | 0-4px | Depth of field effect |

## Tactile Description

*Immagina una scatola di profondità 20cm. Gli elementi non sono su un piano ma sospesi nello spazio. Un pulsante in primo piano è a 5cm dalla faccia della scatola, puoi toccarlo senza sforzo. Un menu in background è a 15cm, devi allungare il braccio. Quando ti muovi, gli elementi si spostano con parallasse: quelli vicini si muovono più velocemente (10cm per ogni movimento di testa), quelli lontani più lentamente (2cm).*

## Component Examples

```css
/* Spatial Container */
.spatial-container {
  perspective: var(--perspective);
  perspective-origin: var(--perspective-origin);
  transform-style: preserve-3d;
}

/* Spatial Layer - Back */
.spatial-layer--back {
  transform: translateZ(var(--depth-back)) scale(var(--scale-back));
  filter: var(--blur-back);
  opacity: 0.7;
}

/* Spatial Layer - Front */
.spatial-layer--front {
  transform: translateZ(var(--depth-front)) scale(var(--scale-front));
  z-index: 10;
}

/* Spatial Card */
.card-spatial {
  padding: var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-spatial);
  transform: translateZ(var(--depth-base));
  transform-style: preserve-3d;
  transition: transform var(--transition);
}

.card-spatial:hover {
  transform: translateZ(var(--depth-front)) scale(1.02);
}

/* Spatial Button */
.btn-spatial {
  padding: var(--space-2) var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transform: translateZ(0);
  transition: all var(--transition);
}

.btn-spatial:hover {
  transform: translateZ(20px) scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-spatial);
}

/* Parallax Section */
.parallax-section {
  position: relative;
  overflow: hidden;
  perspective: var(--perspective);
}

.parallax-bg {
  position: absolute;
  inset: -20%;
  transform: translateZ(var(--depth-far)) scale(1.4);
  filter: var(--blur-far);
}

.parallax-content {
  position: relative;
  transform: translateZ(var(--depth-base));
}

/* Spatial Navigation */
.nav-spatial {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%) translateZ(var(--depth-front));
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

/* Depth Stack */
.depth-stack {
  position: relative;
  transform-style: preserve-3d;
}

.depth-stack > * {
  position: absolute;
  transition: transform var(--transition);
}

.depth-stack > *:nth-child(1) { transform: translateZ(0); }
.depth-stack > *:nth-child(2) { transform: translateZ(-20px) scale(0.95); opacity: 0.8; }
.depth-stack > *:nth-child(3) { transform: translateZ(-40px) scale(0.9); opacity: 0.6; }

/* 3D Tilt Card */
.card-tilt {
  transform-style: preserve-3d;
  transition: transform var(--transition);
}

/* JS adds rotation based on mouse position */
.card-tilt:hover {
  /* rotateX and rotateY set via JS */
}

.card-tilt-content {
  transform: translateZ(30px);
}

.card-tilt-bg {
  transform: translateZ(-10px);
}
```

## Parallax JavaScript

```javascript
// Simple parallax on scroll
function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallax);
      const y = scrollY * speed;
      layer.style.transform = `translateY(${y}px)`;
    });
  });
}

// 3D tilt on mouse
function initTilt(element) {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    element.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });
}
```

## Ideal Weights

```yaml
trust: 0.5
innovation: 0.9
formality: 0.5
warmth: 0.4
playfulness: 0.6
density: 0.4
```

## Compatible Modifiers

| Category | Compatible | Notes |
|----------|------------|-------|
| Grid | Asymmetric ✓, Bento ○ | Depth adds complexity |
| Curves | Geometric ✓, Organic ○ | Rounded for visionOS style |
| Palette | Cold ✓, Neon ✓, Jewel ✓ | Dark backgrounds common |
| Density | Sparse ✓, Balanced ✓ | Needs room for depth |

## Incompatible Modifiers

- **Swiss grid**: Too flat for 3D
- **Angular curves**: Doesn't match visionOS aesthetic
- **Earth palette**: Too natural for tech feel
- **Dense/Claustrophobic**: 3D needs space

## Anti-Patterns Specifici

- Spatial + No actual depth = Just glassmorphism
- Spatial + Too many layers = Confusing hierarchy
- Spatial + Heavy content = Performance issues

## Performance Warning

⚠️ **Spatial effects are expensive**:
- `transform-style: preserve-3d` triggers layer creation
- Parallax on scroll can cause jank
- Backdrop-filter is GPU-heavy

**Mitigazioni**:
1. Use `will-change: transform` sparingly
2. Limit number of 3D-transformed elements
3. Debounce scroll parallax
4. Test on low-end devices

## Best For

- AR/VR interfaces
- Vision Pro apps
- Innovative landing pages
- Premium product showcases
- Interactive experiences
- Tech company sites

## Avoid For

- Content-heavy sites
- E-commerce (conversion focus)
- Accessibility-critical apps
- Mobile-first (performance)
- Print/static media

## Design Tips

1. **Establish depth hierarchy** - Maximum 3-4 layers
2. **Consistent light source** - Shadows should all go same direction
3. **Subtle parallax** - 10-20% of scroll, not more
4. **Focus on foreground** - Background should support, not compete
5. **Test performance** - 60fps or don't do it
6. **Provide fallbacks** - Not all browsers support all features

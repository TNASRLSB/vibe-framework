// Decorative element generator for scene enrichment
// CSS-only decorative elements: orbs, rings, grid patterns, scan lines.
// These add visual depth without external images.

export type DecorativeType = 'orb' | 'ring' | 'grid-pattern' | 'scan-line';

export interface DecorativeElement {
  type: DecorativeType;
  html: string;
}

// ─── Generators ───────────────────────────────────────────────

/**
 * Generate a blurred glow orb positioned at scene edges.
 */
function generateOrb(accentColor: string, index: number): string {
  const positions = [
    { top: '10%', left: '-5%' },
    { top: '70%', left: '85%' },
    { top: '20%', left: '80%' },
    { top: '80%', left: '-10%' },
    { top: '5%', left: '50%' },
    { top: '60%', left: '15%' },
  ];
  const pos = positions[index % positions.length];
  const size = 200 + (index % 3) * 100; // 200-400px
  const opacity = 0.12 + (index % 3) * 0.06; // 0.12-0.24

  return `<div class="deco deco-orb" style="position:absolute;top:${pos.top};left:${pos.left};width:${size}px;height:${size}px;border-radius:50%;background:${accentColor};filter:blur(${Math.round(size * 0.35)}px);opacity:${opacity};pointer-events:none;z-index:0;"></div>`;
}

/**
 * Generate a subtle ring outline.
 */
function generateRing(accentColor: string, index: number): string {
  const positions = [
    { top: '15%', right: '5%' },
    { top: '65%', left: '5%' },
    { top: '30%', right: '10%' },
  ];
  const pos = positions[index % positions.length];
  const size = 200 + (index % 3) * 80; // 200-360px
  const posStyle = 'right' in pos
    ? `top:${pos.top};right:${pos.right}`
    : `top:${pos.top};left:${pos.left}`;

  return `<div class="deco deco-ring" style="position:absolute;${posStyle};width:${size}px;height:${size}px;border:1px solid ${accentColor};border-radius:50%;opacity:0.08;pointer-events:none;z-index:0;"></div>`;
}

/**
 * Generate a subtle dot grid pattern with radial mask fade.
 */
function generateGridPattern(): string {
  return `<div class="deco deco-grid" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.04;background-image:radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px);background-size:30px 30px;mask-image:radial-gradient(ellipse at 50% 50%,black 30%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%,black 30%,transparent 70%);"></div>`;
}

/**
 * Generate a scan line animation.
 */
function generateScanLine(accentColor: string): string {
  return `<div class="deco deco-scanline" style="position:absolute;top:0;left:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,${accentColor},transparent);opacity:0.15;pointer-events:none;z-index:0;animation:deco-scan 4s linear infinite;"></div>`;
}

// ─── Scene enrichment ─────────────────────────────────────────

export type SceneEnrichmentHint = 'hero' | 'feature' | 'cta' | 'data' | 'social' | 'default';

/**
 * Select decorative elements for a scene based on its type and mode.
 * Returns HTML fragments to inject into the scene div (z-index: 0, under content).
 */
export function selectDecoratives(
  hint: SceneEnrichmentHint,
  accentColor: string,
  sceneIndex: number,
  mode: string,
): string[] {
  const results: string[] = [];

  // Mode controls quantity: safe=1, hybrid=2, chaos/cocomelon=2-3
  const maxElements = mode === 'safe' ? 1 : (mode === 'hybrid' ? 2 : 3);

  switch (hint) {
    case 'hero':
      results.push(generateOrb(accentColor, sceneIndex));
      if (maxElements >= 2) results.push(generateGridPattern());
      if (maxElements >= 3) results.push(generateOrb(accentColor, sceneIndex + 1));
      break;
    case 'feature':
      results.push(generateRing(accentColor, sceneIndex));
      if (maxElements >= 2) results.push(generateOrb(accentColor, sceneIndex));
      break;
    case 'cta':
      results.push(generateOrb(accentColor, sceneIndex));
      if (maxElements >= 2) results.push(generateOrb(accentColor, sceneIndex + 2));
      break;
    case 'data':
      results.push(generateGridPattern());
      if (maxElements >= 2) results.push(generateRing(accentColor, sceneIndex));
      break;
    case 'social':
      results.push(generateOrb(accentColor, sceneIndex));
      break;
    default:
      results.push(generateOrb(accentColor, sceneIndex));
      if (maxElements >= 2) results.push(generateRing(accentColor, sceneIndex));
      break;
  }

  return results.slice(0, maxElements);
}

/**
 * Get the @keyframes CSS needed for decorative animations.
 */
export function getDecorativeKeyframes(): string {
  return `
@keyframes deco-scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}`;
}

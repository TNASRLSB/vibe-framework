// Decorative element generator for scene enrichment
// CSS-only decorative elements that add visual depth without external images.
// v4: expanded from 4 types to 12 (glow, grain, noise, mesh gradient, animated gradient,
// particle dots, light leak, bokeh, vignette, film grain, scanline RGB, aurora).

export type DecorativeType =
  | 'orb' | 'ring' | 'grid-pattern' | 'scan-line'
  | 'glow' | 'grain' | 'noise' | 'mesh-gradient'
  | 'animated-gradient' | 'particle-dots' | 'light-leak'
  | 'bokeh' | 'vignette' | 'aurora'
  | 'shimmer-surface' | 'glass-card';

export interface DecorativeElement {
  type: DecorativeType;
  html: string;
}

// ─── Original Generators ─────────────────────────────────────

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
  const size = 200 + (index % 3) * 100;
  const opacity = 0.25 + (index % 3) * 0.08;

  const delay = -(index * 2);
  return `<div class="deco deco-orb" style="position:absolute;top:${pos.top};left:${pos.left};width:${size}px;height:${size}px;border-radius:50%;background:${accentColor};filter:blur(${Math.round(size * 0.35)}px);opacity:${opacity};pointer-events:none;z-index:0;animation:amb-float 6s ease-in-out infinite alternate;animation-delay:${delay}s;"></div>`;
}

function generateRing(accentColor: string, index: number): string {
  const positions = [
    { top: '15%', right: '5%' },
    { top: '65%', left: '5%' },
    { top: '30%', right: '10%' },
  ];
  const pos = positions[index % positions.length];
  const size = 200 + (index % 3) * 80;
  const posStyle = 'right' in pos
    ? `top:${pos.top};right:${pos.right}`
    : `top:${pos.top};left:${pos.left}`;

  const delay = -(index * 2.5);
  return `<div class="deco deco-ring" style="position:absolute;${posStyle};width:${size}px;height:${size}px;border:2px solid ${accentColor};border-radius:50%;opacity:0.18;pointer-events:none;z-index:0;animation:amb-float-reverse 8s ease-in-out infinite alternate;animation-delay:${delay}s;"></div>`;
}

function generateGridPattern(): string {
  return `<div class="deco deco-grid" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.05;background-image:radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px);background-size:30px 30px;mask-image:radial-gradient(ellipse at 50% 50%,black 30%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%,black 30%,transparent 70%);animation:amb-grid-fade 6s ease-in-out infinite;"></div>`;
}

function generateScanLine(accentColor: string): string {
  return `<div class="deco deco-scanline" style="position:absolute;top:0;left:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,${accentColor},transparent);opacity:0.15;pointer-events:none;z-index:0;animation:deco-scan 4s linear infinite;"></div>`;
}

// ─── New v4 Generators ───────────────────────────────────────

/** Soft edge glow — radial gradient at a corner */
function generateGlow(accentColor: string, index: number): string {
  const corners = ['top left', 'top right', 'bottom left', 'bottom right'];
  const corner = corners[index % corners.length];
  return `<div class="deco deco-glow" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.2;background:radial-gradient(ellipse at ${corner},${accentColor} 0%,transparent 60%);animation:amb-pulse-glow 4s ease-in-out infinite;"></div>`;
}

/** Film grain noise overlay — CSS random dot pattern */
function generateGrain(): string {
  return `<div class="deco deco-grain" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.04;background-image:url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E&quot;);mix-blend-mode:overlay;"></div>`;
}

/** Noise texture — higher frequency, more visible */
function generateNoise(): string {
  return `<div class="deco deco-noise" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.06;background-image:url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E&quot;);mix-blend-mode:soft-light;"></div>`;
}

/** Mesh gradient — multi-stop conic gradient creating a fluid color field */
function generateMeshGradient(accentColor: string, index: number): string {
  const angle = (index * 45) % 360;
  return `<div class="deco deco-mesh" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.15;background:conic-gradient(from ${angle}deg at 30% 70%,${accentColor},transparent 40%,${accentColor}33,transparent 70%,${accentColor}22,transparent);filter:blur(60px);animation:amb-drift 12s ease-in-out infinite alternate;"></div>`;
}

/** Animated gradient — slow-shifting CSS gradient */
function generateAnimatedGradient(accentColor: string, index: number): string {
  const angle = 135 + (index * 30) % 180;
  return `<div class="deco deco-anim-grad" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.12;background:linear-gradient(${angle}deg,${accentColor}44,transparent 40%,${accentColor}22,transparent 80%);background-size:200% 200%;animation:deco-grad-shift 8s ease-in-out infinite alternate;"></div>`;
}

/** Particle dots — animated via P() runtime function (noise-driven drift)
 *  Falls back to static dots if P() is unavailable (backward compatible). */
function generateParticleDots(accentColor: string, index: number): string {
  return `<div data-particles="scene-${index}" class="deco deco-particles" style="position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;"></div>`;
}

/** Returns the JS P() call for a scene's particle system. Add to the scene's script block. */
export function getParticleScript(accentColor: string, sceneIndex: number, count: number = 30): string {
  return `P('[data-particles="scene-${sceneIndex}"]', ${count}, { color: '${accentColor}', sizeRange: [2, 6], driftSpeed: 0.015, driftAmp: 20 });`;
}

/** Light leak — warm diagonal gradient streak */
function generateLightLeak(index: number): string {
  const positions = ['top left', 'top right', 'bottom left'];
  const pos = positions[index % positions.length];
  const hue = 30 + (index * 20) % 40; // warm tones (30-70)
  return `<div class="deco deco-leak" style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.08;background:radial-gradient(ellipse at ${pos},hsla(${hue},80%,60%,0.4) 0%,transparent 50%);mix-blend-mode:screen;animation:amb-breathe 5s ease-in-out infinite;"></div>`;
}

/** Bokeh — large blurred circles at varied positions */
function generateBokeh(accentColor: string, index: number): string {
  const circles: string[] = [];
  for (let i = 0; i < 5; i++) {
    const x = ((i * 43 + index * 19) % 80) + 10;
    const y = ((i * 61 + index * 31) % 70) + 15;
    const size = 40 + (i % 3) * 30;
    const opacity = 0.06 + (i % 3) * 0.03;
    const delay = -(i * 1.5);
    circles.push(`<div style="position:absolute;top:${y}%;left:${x}%;width:${size}px;height:${size}px;border-radius:50%;background:${accentColor};filter:blur(${Math.round(size * 0.4)}px);opacity:${opacity};animation:amb-float 6s ease-in-out infinite alternate;animation-delay:${delay}s;"></div>`);
  }
  return `<div class="deco deco-bokeh" style="position:absolute;inset:0;pointer-events:none;z-index:0;">${circles.join('')}</div>`;
}

/** Vignette — dark edges fading to center */
function generateVignette(): string {
  return `<div class="deco deco-vignette" style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.5) 100%);"></div>`;
}

/** Aurora — animated multi-color wave */
function generateAurora(accentColor: string, index: number): string {
  const hueShift = (index * 40) % 360;
  return `<div class="deco deco-aurora" style="position:absolute;top:0;left:-20%;width:140%;height:40%;pointer-events:none;z-index:0;opacity:0.1;background:linear-gradient(90deg,transparent,${accentColor}66,hsla(${hueShift},70%,50%,0.3),transparent);filter:blur(40px);animation:deco-aurora-drift 12s ease-in-out infinite alternate;transform:skewY(-5deg);"></div>`;
}

/** Shimmer surface — sweep highlight overlay */
function generateShimmerSurface(): string {
  return `<div class="deco deco-shimmer" style="position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;"><div style="position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);animation:amb-shine 2.5s ease-in-out infinite;"></div></div>`;
}

/** Glass card — frosted glass with pulsing border */
function generateGlassCard(index: number): string {
  const tops = ['20%', '35%', '50%'];
  const lefts = ['15%', '55%', '30%'];
  const top = tops[index % tops.length];
  const left = lefts[index % lefts.length];
  return `<div class="deco deco-glass" style="position:absolute;top:${top};left:${left};width:280px;height:180px;pointer-events:none;z-index:0;background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;animation:amb-border-glow 3s ease-in-out infinite;"></div>`;
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

  // Mode controls quantity: safe=1-2, hybrid=2-3, chaos/cocomelon=3-4
  const maxElements = mode === 'safe' ? 2 : (mode === 'hybrid' ? 3 : 4);

  switch (hint) {
    case 'hero':
      results.push(generateOrb(accentColor, sceneIndex));
      results.push(generateVignette());
      if (maxElements >= 3) results.push(generateMeshGradient(accentColor, sceneIndex));
      if (maxElements >= 4) results.push(generateGrain());
      break;
    case 'feature':
      results.push(generateRing(accentColor, sceneIndex));
      results.push(generateGlow(accentColor, sceneIndex));
      if (maxElements >= 3) results.push(generateParticleDots(accentColor, sceneIndex));
      if (maxElements >= 4) results.push(generateNoise());
      break;
    case 'cta':
      results.push(generateOrb(accentColor, sceneIndex));
      results.push(generateAnimatedGradient(accentColor, sceneIndex));
      if (maxElements >= 3) results.push(generateBokeh(accentColor, sceneIndex));
      if (maxElements >= 4) results.push(generateGlow(accentColor, sceneIndex + 1));
      break;
    case 'data':
      results.push(generateGridPattern());
      results.push(generateScanLine(accentColor));
      if (maxElements >= 3) results.push(generateGlow(accentColor, sceneIndex));
      if (maxElements >= 4) results.push(generateNoise());
      break;
    case 'social':
      results.push(generateOrb(accentColor, sceneIndex));
      results.push(generateLightLeak(sceneIndex));
      if (maxElements >= 3) results.push(generateBokeh(accentColor, sceneIndex));
      break;
    default:
      results.push(generateOrb(accentColor, sceneIndex));
      results.push(generateRing(accentColor, sceneIndex));
      if (maxElements >= 3) results.push(generateAurora(accentColor, sceneIndex));
      if (maxElements >= 4) results.push(generateGrain());
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
}
@keyframes deco-grad-shift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes deco-aurora-drift {
  0% { transform: skewY(-5deg) translateX(-10%); }
  100% { transform: skewY(-3deg) translateX(10%); }
}
@keyframes amb-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
@keyframes amb-float-slow {
  0%, 100% { transform: translate(0, 0) scale(0.95); }
  33% { transform: translate(10px, -15px) scale(1.05); }
  66% { transform: translate(-8px, 10px) scale(1.0); }
}
@keyframes amb-float-reverse {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(15px) translateX(-10px); }
}
@keyframes amb-shimmer {
  0% { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes amb-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
  50% { box-shadow: 0 0 30px rgba(255,255,255,0.15); }
}
@keyframes amb-shine {
  0% { left: -75%; }
  100% { left: 125%; }
}
@keyframes amb-breathe {
  0%, 100% { transform: scale(0.98); }
  50% { transform: scale(1.02); }
}
@keyframes amb-border-glow {
  0%, 100% { border-color: rgba(255,255,255,0.1); }
  50% { border-color: rgba(255,255,255,0.3); }
}
@keyframes amb-ripple {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.2), 0 0 0 0 rgba(255,255,255,0.1); }
  100% { box-shadow: 0 0 0 15px rgba(255,255,255,0), 0 0 0 30px rgba(255,255,255,0); }
}
@keyframes amb-grid-fade {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.07; }
}
@keyframes amb-drift {
  0% { transform: translateX(0) rotate(0deg); }
  100% { transform: translateX(40px) rotate(2deg); }
}
@keyframes amb-gradient-text {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}`;
}

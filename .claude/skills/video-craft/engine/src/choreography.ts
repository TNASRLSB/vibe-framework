// Choreography system for video-craft
// Orchestrates multi-element animation sequences with stagger, Disney principles,
// and breathing pauses. Transforms flat "all at once" animations into cinematic motion.

import type { SceneType, SceneTypeId } from './composition.js';

// ─── Types ──────────────────────────────────────────────────

export type StaggerPattern =
  | 'cascade-down'    // top to bottom, 80-120ms
  | 'cascade-up'      // bottom to top, 80-120ms
  | 'origin-burst'    // center outward, 50-100ms
  | 'wave'            // left to right, 60-100ms
  | 'paired'          // two at a time, 150ms between pairs
  | 'none';           // instant / no stagger

export interface ChoreographyPlan {
  /** Ordered list of element delays in ms (index = element position) */
  delays: number[];
  /** Base easing curve for this choreography */
  easing: string;
  /** Whether to apply anticipation (small reverse before main motion) */
  anticipation: boolean;
  /** Whether to apply follow-through (overshoot + settle) */
  followThrough: boolean;
  /** Hold time after all animations complete before scene exits (ms) */
  microPauseMs: number;
}

export interface BreathingScene {
  /** Duration of the breathing pause in ms */
  durationMs: number;
  /** Background style — brand color, gradient, or dark */
  bgStyle: 'brand-gradient' | 'dark-fade' | 'accent-glow';
  /** Whether to show a subtle element (logo watermark, etc.) */
  showWatermark: boolean;
}

// ─── Easing Curves ──────────────────────────────────────────

/** Named easing curves — never use 'linear' for element motion */
export const EASING_CURVES = {
  /** Standard entrance — decelerating, confident arrival */
  entrance: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  /** Standard exit — accelerating departure */
  exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
  /** State change — smooth, elegant */
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  /** Spring — overshoot + settle, playful */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Bounce — pronounced overshoot */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  /** Snap — sharp deceleration, authoritative */
  snap: 'cubic-bezier(0.0, 0.0, 0.1, 1)',
  /** Gentle — very soft arrival */
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

export type EasingName = keyof typeof EASING_CURVES;

// ─── Stagger Calculation ────────────────────────────────────

/**
 * Calculate stagger delays for a set of elements based on the pattern.
 */
export function calculateStaggerDelays(
  pattern: StaggerPattern,
  elementCount: number,
  baseDelayMs: number,
): number[] {
  if (elementCount <= 0) return [];
  if (elementCount === 1 || pattern === 'none') return new Array(elementCount).fill(0);

  switch (pattern) {
    case 'cascade-down':
      return Array.from({ length: elementCount }, (_, i) => i * baseDelayMs);

    case 'cascade-up':
      return Array.from({ length: elementCount }, (_, i) => (elementCount - 1 - i) * baseDelayMs);

    case 'origin-burst': {
      // Center element first, then outward
      const center = Math.floor(elementCount / 2);
      return Array.from({ length: elementCount }, (_, i) =>
        Math.abs(i - center) * baseDelayMs
      );
    }

    case 'wave':
      // Left to right
      return Array.from({ length: elementCount }, (_, i) => i * baseDelayMs);

    case 'paired': {
      // Two elements at a time
      return Array.from({ length: elementCount }, (_, i) =>
        Math.floor(i / 2) * baseDelayMs
      );
    }

    default:
      return new Array(elementCount).fill(0);
  }
}

// ─── Choreography Planning ──────────────────────────────────

/**
 * Build a full choreography plan for a scene based on its sceneType.
 */
export function planChoreography(
  sceneType: SceneType,
  elementCount: number,
  sceneIndex: number,
  totalScenes: number,
  mode: string,
): ChoreographyPlan {
  const delays = calculateStaggerDelays(
    sceneType.staggerPattern,
    elementCount,
    sceneType.staggerDelayMs,
  );

  // Select easing based on scene-type character
  let easing: string;
  switch (sceneType.id) {
    case 'rapid-text':
      easing = EASING_CURVES.snap;
      break;
    case 'product-intro':
    case 'cta-outro':
      easing = EASING_CURVES.spring;
      break;
    case 'social-proof':
    case 'data-visualization':
      easing = EASING_CURVES.gentle;
      break;
    case 'stat-callout':
    case 'problem-statement':
      easing = EASING_CURVES.entrance;
      break;
    default:
      easing = EASING_CURVES.standard;
  }

  // Chaos mode: random spring/bounce
  if (mode === 'chaos' && Math.random() < 0.4) {
    easing = Math.random() < 0.5 ? EASING_CURVES.spring : EASING_CURVES.bounce;
  }

  // Cocomelon mode: always high-energy easing, except Descend phase → gentle
  if (mode === 'cocomelon') {
    const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
    if (pos > 0.65 && pos < 0.95) {
      // Descend phase: gentle
      easing = EASING_CURVES.gentle;
    } else {
      // All other phases: spring or bounce
      easing = Math.random() < 0.6 ? EASING_CURVES.spring : EASING_CURVES.bounce;
    }
  }

  // Disney principles: apply based on energy level
  let anticipation = sceneType.id !== 'rapid-text' && sceneType.id !== 'cta-outro';
  let followThrough = elementCount > 1 && sceneType.id !== 'rapid-text';

  // Cocomelon: always use Disney principles
  if (mode === 'cocomelon') {
    anticipation = true;
    followThrough = true;
  }

  // Micro-pause: longer for dense scenes, shorter for rapid
  let microPauseMs = 300;
  if (sceneType.id === 'rapid-text') microPauseMs = 0;
  else if (sceneType.id === 'cta-outro') microPauseMs = 500;
  else if (elementCount >= 4) microPauseMs = 400;

  // Cocomelon: phase-aware micro-pauses
  if (mode === 'cocomelon') {
    const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
    if (pos < 0.05 || (pos >= 0.35 && pos < 0.65)) microPauseMs = 0;       // Arrest + Climax: no pause
    else if (pos < 0.35) microPauseMs = 200;                                 // Escalate
    else if (pos < 0.95) microPauseMs = 400;                                 // Descend
    else microPauseMs = 0;                                                    // Convert
  }

  // Cocomelon: faster stagger delays (70% of default)
  const finalDelays = mode === 'cocomelon'
    ? delays.map(d => Math.round(d * 0.7))
    : delays;

  return {
    delays: finalDelays,
    easing,
    anticipation,
    followThrough,
    microPauseMs,
  };
}

// ─── Breathing Scenes ───────────────────────────────────────

/**
 * Determine if a breathing scene should be inserted after this scene,
 * and return its configuration.
 */
export function shouldInsertBreathing(
  sceneType: SceneType,
  sceneIndex: number,
  totalScenes: number,
  consecutiveDenseScenes: number,
): BreathingScene | null {
  // Never breathe after the first scene or before the last 2 scenes
  if (sceneIndex === 0 || sceneIndex >= totalScenes - 2) return null;

  // Breathe after scene-type says so, OR after 3+ dense scenes in a row
  if (!sceneType.breathingAfter && consecutiveDenseScenes < 3) return null;

  return {
    durationMs: 600 + Math.round(Math.random() * 400), // 600-1000ms
    bgStyle: Math.random() < 0.5 ? 'brand-gradient' : 'dark-fade',
    showWatermark: Math.random() < 0.3,
  };
}

// ─── Anticipation Keyframes ─────────────────────────────────

/**
 * Generate anticipation CSS: small reverse movement before main action.
 * Returns additional keyframe prefix (0%-15% of animation).
 */
export function getAnticipationKeyframes(entranceType: string): string | null {
  // Only add anticipation to movement-based entrances
  if (entranceType.includes('slide') || entranceType.includes('fade-in-up') || entranceType.includes('fade-in-down')) {
    return `0% { transform: translateY(5px); } 8% { transform: translateY(5px); }`;
  }
  if (entranceType.includes('grow') || entranceType.includes('zoom-in') || entranceType.includes('bounce')) {
    return `0% { transform: scale(0.95); } 8% { transform: scale(0.95); }`;
  }
  return null;
}

/**
 * Generate follow-through CSS: slight overshoot after landing.
 * Returns keyframe suffix (85%-100% of animation).
 */
export function getFollowThroughKeyframes(entranceType: string): string | null {
  if (entranceType.includes('slide') || entranceType.includes('fade-in')) {
    return `85% { transform: translateY(-2px); } 100% { transform: translateY(0); }`;
  }
  if (entranceType.includes('grow') || entranceType.includes('zoom')) {
    return `85% { transform: scale(1.02); } 100% { transform: scale(1); }`;
  }
  return null;
}

// ─── Composition CSS ────────────────────────────────────────

/**
 * Generate CSS for cinematic composition layout.
 * Transforms flat centered layouts into rule-of-thirds / asymmetric compositions.
 */
export function getCompositionCSS(
  composition: string,
  isVertical: boolean,
): string {
  switch (composition) {
    case 'off-center-focal':
      return isVertical
        ? `align-items: flex-start; padding-left: 8%; text-align: left;`
        : `align-items: flex-start; padding-left: 8%; text-align: left;`;

    case 'asymmetric-split':
      return isVertical
        ? `align-items: flex-start; padding-left: 8%; text-align: left;`
        : `flex-direction: row; justify-content: flex-start; gap: 5%; padding-left: 10%;`;

    case 'layered-depth':
      // Depth handled via pseudo-elements in scene generation
      // Do NOT emit position — it breaks scene stacking (scenes use position: absolute)
      return ``;

    case 'diagonal-flow':
      return isVertical
        ? `align-items: flex-start; padding-left: 8%; transform: rotate(-1deg);`
        : `align-items: flex-start; padding-left: 10%; transform: rotate(-0.5deg);`;

    case 'edge-bleed':
      return `overflow: visible; padding: 0;`;

    case 'right-aligned':
      return isVertical
        ? `align-items: flex-end; padding-right: 5%; text-align: right;`
        : `align-items: flex-end; padding-right: 5%; text-align: right;`;

    case 'bottom-anchored':
      return `justify-content: flex-end; padding-bottom: 8%;`;

    case 'top-anchored':
      return `justify-content: flex-start; padding-top: 8%;`;

    case 'full-bleed-text':
      return `align-items: center; justify-content: center; text-align: center; padding: 0;`;

    case 'centered':
    default:
      return `align-items: center; text-align: center;`;
  }
}

// ─── Background Animation CSS ───────────────────────────────

/**
 * Generate CSS for animated backgrounds.
 */
export function getBgAnimationCSS(bgAnimation: string, accentColor?: string): string {
  const accent = accentColor ?? '#6366f1';

  switch (bgAnimation) {
    case 'gradient-drift':
      return `
        background-size: 400% 400%;
        animation: bg-gradient-drift 8s ease-in-out infinite;
      `;

    case 'particle-float':
      // Simulated via box-shadow on pseudo-element
      return `
        position: relative;
      `;

    case 'grid-pulse':
      return `
        background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 40px 40px;
        animation: bg-grid-pulse 6s ease-in-out infinite;
      `;

    case 'vignette':
      return `
        position: relative;
      `;

    case 'ambient-glow':
      return `
        position: relative;
      `;

    default:
      return '';
  }
}

/**
 * Generate global @keyframes for background animations.
 */
export function getBgAnimationKeyframes(): string {
  return `
@keyframes bg-gradient-drift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes bg-grid-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes bg-particle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
@keyframes bg-ambient-shift {
  0% { background-position: 30% 70%; }
  50% { background-position: 70% 30%; }
  100% { background-position: 30% 70%; }
}
@keyframes bg-vignette-breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.7; }
}
@keyframes breathing-scene-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.6; }
}`;
}

/**
 * Generate pseudo-element HTML for depth layers (foreground particles, vignette, ambient glow).
 */
export function getDepthLayerHTML(bgAnimation: string, accentColor?: string): string {
  const accent = accentColor ?? '#6366f1';

  switch (bgAnimation) {
    case 'vignette':
      return `<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%);animation:bg-vignette-breathe 6s ease-in-out infinite;z-index:0;"></div>`;

    case 'particle-float':
      return `<div style="position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.35;filter:blur(1px);animation:bg-particle-float 5s ease-in-out infinite;">
        <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:${accent};top:20%;left:15%;box-shadow:0 0 16px ${accent};"></div>
        <div style="position:absolute;width:8px;height:8px;border-radius:50%;background:${accent};top:60%;left:75%;box-shadow:0 0 12px ${accent};"></div>
        <div style="position:absolute;width:16px;height:16px;border-radius:50%;background:${accent};top:40%;left:45%;box-shadow:0 0 20px ${accent};"></div>
        <div style="position:absolute;width:10px;height:10px;border-radius:50%;background:#fff;top:80%;left:30%;box-shadow:0 0 12px #fff;"></div>
        <div style="position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;top:15%;left:85%;box-shadow:0 0 10px #fff;"></div>
        <div style="position:absolute;width:14px;height:14px;border-radius:50%;background:${accent};top:10%;left:55%;box-shadow:0 0 18px ${accent};"></div>
        <div style="position:absolute;width:10px;height:10px;border-radius:50%;background:#fff;top:70%;left:10%;box-shadow:0 0 14px #fff;"></div>
        <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:${accent};top:50%;left:90%;box-shadow:0 0 16px ${accent};"></div>
      </div>`;

    case 'ambient-glow':
      return `<div style="position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 30% 70%, color-mix(in srgb, ${accent} 25%, transparent), transparent 80%);animation:bg-ambient-shift 10s ease-in-out infinite;background-size:200% 200%;"></div>`;

    case 'grid-pulse':
      // Grid is applied via background on the scene itself, no extra element needed
      return '';

    case 'gradient-drift':
      // Applied via background on the scene itself
      return '';

    default:
      return '';
  }
}

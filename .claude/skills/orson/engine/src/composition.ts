// Composition patterns for orson
// Encodes knowledge from real SaaS/product videos into scene types,
// narrative flows, transition logic, and density progression.

import type { ExtractedContent } from './analyze-folder.js';
import type { IndustryProfile } from './industry-profiles.js';

// ─── Types ──────────────────────────────────────────────────

export type SceneTypeId =
  | 'stat-callout' | 'problem-statement' | 'product-intro'
  | 'feature-showcase' | 'before-after' | 'integration-hub'
  | 'social-proof' | 'cta-outro' | 'rapid-text'
  | 'data-visualization' | 'sequential-product-parade';

/** @deprecated Use SceneTypeId */
export type ArchetypeId = SceneTypeId;

export type BackgroundHint = 'dark' | 'dark-glow' | 'light' | 'brand-bold' | 'gradient' | 'dark-grid';
export type CompositionLayout = 'centered' | 'asymmetric-split' | 'off-center-focal' | 'layered-depth' | 'diagonal-flow' | 'edge-bleed' | 'stacked' | 'split' | 'grid';
export type ModeId = 'safe' | 'chaos' | 'hybrid' | 'cocomelon';

export interface SceneType {
  id: SceneTypeId;
  layout: 'centered' | 'split' | 'stacked' | 'grid';
  /** Cinematic composition layout for the frame */
  composition: CompositionLayout;
  density: { min: number; max: number };
  headingSize: 'md' | 'lg' | 'xl' | '2xl';
  backgroundHint: BackgroundHint;
  /** Animated background type */
  bgAnimation: 'none' | 'gradient-drift' | 'particle-float' | 'grid-pulse' | 'vignette' | 'ambient-glow';
  transitionsOut: string[];  // ranked preferences
  /** Stagger pattern for element entrances */
  staggerPattern: 'cascade-down' | 'cascade-up' | 'origin-burst' | 'wave' | 'paired' | 'none';
  /** Delay between staggered elements in ms */
  staggerDelayMs: number;
  /** Whether to insert a breathing pause after this scene type */
  breathingAfter: boolean;
  /** Recommended entrance animation IDs for this scene type */
  preferredEntrances: string[];
  /** Recommended exit animation IDs for this scene type */
  preferredExits: string[];
}

/** @deprecated Use SceneType */
export type SceneArchetype = SceneType;

export interface NarrativePattern {
  id: string;
  sequence: string[];  // scene-type slots, '|' for alternates
  minScenes: number;
  maxScenes: number;
  bestFor: string[];   // intent keywords
}

export interface TransitionRule {
  position: string;
  preferred: string[];
}

// ─── Scene Types ────────────────────────────────────────────

export const SCENE_TYPES: Record<SceneTypeId, SceneType> = {
  'stat-callout': {
    id: 'stat-callout',
    layout: 'centered',
    composition: 'off-center-focal',
    density: { min: 2, max: 3 },
    headingSize: '2xl',
    backgroundHint: 'dark-glow',
    bgAnimation: 'vignette',
    transitionsOut: ['cut', 'crossfade'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 200,
    breathingAfter: false,
    preferredEntrances: ['scale-word', 'slam', 'stamp', 'zoom-in', 'blur-in'],
    preferredExits: ['fade-out', 'shrink', 'blur-out'],
  },
  'problem-statement': {
    id: 'problem-statement',
    layout: 'centered',
    composition: 'off-center-focal',
    density: { min: 2, max: 4 },
    headingSize: 'lg',
    backgroundHint: 'dark',
    bgAnimation: 'vignette',
    transitionsOut: ['cut'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 120,
    breathingAfter: false,
    preferredEntrances: ['clip-reveal-up', 'fade-in-up', 'text-reveal-mask', 'slide-up', 'rise-and-fade'],
    preferredExits: ['fade-out-up', 'soft-hide', 'blur-out'],
  },
  'product-intro': {
    id: 'product-intro',
    layout: 'centered',
    composition: 'centered',
    density: { min: 2, max: 3 },
    headingSize: 'xl',
    backgroundHint: 'dark-glow',
    bgAnimation: 'ambient-glow',
    transitionsOut: ['fade', 'zoom-in'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 300,
    breathingAfter: false,
    preferredEntrances: ['spring-scale', 'zoom-in', 'blur-in', 'grow', 'spring-up'],
    preferredExits: ['fade-out', 'zoom-out', 'shrink'],
  },
  'feature-showcase': {
    id: 'feature-showcase',
    layout: 'stacked',
    composition: 'asymmetric-split',
    density: { min: 3, max: 6 },
    headingSize: 'lg',
    backgroundHint: 'dark-grid',
    bgAnimation: 'none',
    transitionsOut: ['crossfade', 'slide-left'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 100,
    breathingAfter: true,
    preferredEntrances: ['slide-left', 'clip-reveal-left', 'spring-left', 'fade-in-left', 'bounce-in'],
    preferredExits: ['slide-out-right', 'fade-out', 'clip-hide-right'],
  },
  'before-after': {
    id: 'before-after',
    layout: 'centered',
    composition: 'asymmetric-split',
    density: { min: 3, max: 5 },
    headingSize: 'lg',
    backgroundHint: 'gradient',
    bgAnimation: 'none',
    transitionsOut: ['crossfade', 'wipe-left'],
    staggerPattern: 'paired',
    staggerDelayMs: 150,
    breathingAfter: false,
    preferredEntrances: ['clip-reveal-up', 'split-reveal', 'fade-in-up', 'slide-up', 'morph-circle-in'],
    preferredExits: ['clip-hide-down', 'fade-out-down', 'slide-out-down'],
  },
  'integration-hub': {
    id: 'integration-hub',
    layout: 'grid',
    composition: 'layered-depth',
    density: { min: 3, max: 6 },
    headingSize: 'lg',
    backgroundHint: 'brand-bold',
    bgAnimation: 'particle-float',
    transitionsOut: ['cut', 'zoom-out'],
    staggerPattern: 'origin-burst',
    staggerDelayMs: 80,
    breathingAfter: true,
    preferredEntrances: ['bounce-in', 'spring-scale', 'morph-circle-in', 'morph-diamond-in', 'grow'],
    preferredExits: ['bounce-out', 'shrink', 'morph-circle-out'],
  },
  'social-proof': {
    id: 'social-proof',
    layout: 'centered',
    composition: 'layered-depth',
    density: { min: 2, max: 4 },
    headingSize: 'lg',
    backgroundHint: 'brand-bold',
    bgAnimation: 'ambient-glow',
    transitionsOut: ['fade'],
    staggerPattern: 'wave',
    staggerDelayMs: 80,
    breathingAfter: false,
    preferredEntrances: ['fade-in', 'soft-reveal', 'letter-spacing-in', 'rise-and-fade', 'blur-in'],
    preferredExits: ['soft-hide', 'fade-out', 'blur-out'],
  },
  'cta-outro': {
    id: 'cta-outro',
    layout: 'centered',
    composition: 'centered',
    density: { min: 1, max: 3 },
    headingSize: 'xl',
    backgroundHint: 'gradient',
    bgAnimation: 'gradient-drift',
    transitionsOut: ['fade'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 200,
    breathingAfter: false,
    preferredEntrances: ['zoom-in', 'scale-word', 'spring-scale', 'blur-in', 'slam'],
    preferredExits: ['fade-out', 'zoom-out'],
  },
  'rapid-text': {
    id: 'rapid-text',
    layout: 'centered',
    composition: 'centered',
    density: { min: 1, max: 2 },
    headingSize: '2xl',
    backgroundHint: 'dark',
    bgAnimation: 'none',
    transitionsOut: ['cut'],
    staggerPattern: 'none',
    staggerDelayMs: 0,
    breathingAfter: false,
    preferredEntrances: ['slam', 'stamp', 'kinetic-push', 'word-by-word', 'text-reveal-mask'],
    preferredExits: ['fade-out', 'flash-out'],
  },
  'data-visualization': {
    id: 'data-visualization',
    layout: 'stacked',
    composition: 'off-center-focal',
    density: { min: 2, max: 4 },
    headingSize: 'lg',
    backgroundHint: 'dark-grid',
    bgAnimation: 'grid-pulse',
    transitionsOut: ['crossfade', 'zoom-in'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 120,
    breathingAfter: true,
    preferredEntrances: ['clip-reveal-up', 'grow', 'slide-up', 'anticipate-scale', 'spring-up'],
    preferredExits: ['clip-hide-up', 'shrink', 'fade-out-up'],
  },
  'sequential-product-parade': {
    id: 'sequential-product-parade',
    layout: 'centered',
    composition: 'centered',
    density: { min: 2, max: 3 },
    headingSize: 'lg',
    backgroundHint: 'dark-glow',
    bgAnimation: 'ambient-glow',
    transitionsOut: ['cut', 'flash'],
    staggerPattern: 'cascade-down',
    staggerDelayMs: 150,
    breathingAfter: false,
    preferredEntrances: ['spring-scale', 'bounce-in', 'flip-in-x', 'morph-hexagon-in', 'elastic-in'],
    preferredExits: ['spring-out-down', 'bounce-out', 'flip-out-x'],
  },
};

// ─── Narrative Patterns ─────────────────────────────────────

export const NARRATIVE_PATTERNS: NarrativePattern[] = [
  {
    id: 'problem-solution',
    sequence: [
      'stat-callout|problem-statement',
      'product-intro',
      'feature-showcase',
      'social-proof|data-visualization',
      'cta-outro',
    ],
    minScenes: 5,
    maxScenes: 8,
    bestFor: ['saas', 'product', 'demo', 'b2b', 'marketing', 'startup', 'app', 'platform', 'tool'],
  },
  {
    id: 'hook-parade',
    sequence: [
      'rapid-text',
      'product-intro',
      'sequential-product-parade',
      'cta-outro',
    ],
    minScenes: 4,
    maxScenes: 6,
    bestFor: ['partnership', 'suite', 'multi-product', 'announcement', 'ecosystem', 'integration'],
  },
  {
    id: 'rapid-hook',
    sequence: [
      'rapid-text',
      'feature-showcase',
      'cta-outro',
    ],
    minScenes: 3,
    maxScenes: 4,
    bestFor: ['short', 'ad', 'launch', 'teaser', 'promo', 'quick'],
  },
  {
    id: 'story-abstract',
    sequence: [
      'rapid-text',
      'rapid-text',
      'social-proof',
      'cta-outro',
    ],
    minScenes: 4,
    maxScenes: 10,
    bestFor: ['agency', 'brand', 'reel', 'identity', 'creative', 'portfolio', 'story'],
  },
  {
    id: 'neuro-hijack',
    sequence: [
      'rapid-text',                          // Arrest
      'stat-callout|problem-statement',      // Escalate
      'problem-statement|feature-showcase',  // Escalate
      'feature-showcase',                    // Escalate
      'product-intro',                       // Climax
      'feature-showcase',                    // Climax
      'feature-showcase|before-after',       // Climax
      'social-proof|data-visualization',     // Descend
      'data-visualization',                  // Descend
      'cta-outro',                           // Convert
    ],
    minScenes: 8,
    maxScenes: 12,
    bestFor: [], // only selected when mode === 'cocomelon'
  },
];

// ─── Transition Rules ───────────────────────────────────────

// Semantic transition rules — transitions carry narrative meaning
const TRANSITION_RULES: TransitionRule[] = [
  { position: 'opening',             preferred: ['cut', 'zoom-in'] },
  { position: 'problem-to-solution', preferred: ['morph-layout', 'wipe-left', 'crossfade'] },
  { position: 'between-features',    preferred: ['shared-element', 'slide-left', 'crossfade'] },
  { position: 'feature-to-proof',    preferred: ['cross-dissolve', 'crossfade'] },
  { position: 'to-cta',             preferred: ['morph-layout', 'zoom-in', 'fade'] },
  { position: 'proof-to-cta',       preferred: ['cross-dissolve', 'crossfade'] },
  { position: 'within-rapid',       preferred: ['cut'] },
  { position: 'to-breathing',       preferred: ['cross-dissolve', 'fade'] },
  { position: 'from-breathing',     preferred: ['cross-dissolve', 'fade'] },
];

// All transition IDs available in the safe pool
const ALL_SAFE_TRANSITIONS = [
  'cut', 'fade', 'crossfade',
  'slide-left', 'slide-right', 'slide-up', 'slide-down',
  'blur', 'push-left', 'push-right', 'push-up', 'push-down',
  'cross-dissolve', 'morph-layout', 'shared-element',
];

const ALL_TRANSITIONS = [
  ...ALL_SAFE_TRANSITIONS,
  'wipe-left', 'wipe-right', 'circle-reveal', 'diamond-reveal',
  'zoom-in', 'zoom-out', 'iris-open', 'iris-close',
  'flash', 'glitch', 'rotate',
  'morph-scale-shift',
];

// ─── Background Generators ──────────────────────────────────

/** Make a color N% opaque using color-mix (works with hex, hsl, rgb) */
function withAlpha(color: string, pct: number = 25): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

/** Glow position varies per scene to avoid monotony */
let _glowCallCount = 0;
function glowPosition(): string {
  const positions = ['30% 70%', '70% 30%', '50% 20%', '20% 50%', '80% 80%'];
  return positions[(_glowCallCount++) % positions.length];
}

function generateBackground(hint: BackgroundHint, colors: string[], useTokens: boolean = false): string {
  const primary = colors[0] ?? '#1a1a2e';
  const accent = colors.length > 1 ? colors[1] : '#e94560';
  // Use bg color from DS if available (index 2), otherwise derive dark variant
  const bg = colors.length > 2 ? colors[2] : darkenColor(primary);
  const pos = glowPosition();

  if (useTokens) {
    switch (hint) {
      case 'dark':       return `var(--color-bg, ${bg})`;
      case 'dark-glow':  return `radial-gradient(ellipse at ${pos}, ${withAlpha(accent)}, var(--color-bg, ${bg}) 80%)`;
      case 'light':      return `var(--color-surface, ${colors.length > 3 ? colors[3] : '#F5F5F5'})`;
      case 'brand-bold': return `var(--color-primary, ${primary})`;
      case 'gradient':   return `linear-gradient(135deg, var(--color-primary, ${primary}), var(--color-accent, ${accent}))`;
      case 'dark-grid':  return `var(--color-bg, ${bg})`;
    }
  }

  switch (hint) {
    case 'dark':       return bg;
    case 'dark-glow':  return `radial-gradient(ellipse at ${pos}, ${withAlpha(accent)}, ${bg} 80%)`;
    case 'light':      return colors.length > 3 ? colors[3] : '#F5F5F5';
    case 'brand-bold': return primary;
    case 'gradient':   return `linear-gradient(135deg, ${primary}, ${accent})`;
    case 'dark-grid':  return bg;
  }
}

/** Darken a hex color for background use */
function darkenColor(color: string): string {
  const [h, s, l] = hexToHsl(color);
  if (h === 0 && s === 0 && l === 0 && !color.startsWith('#') && !color.startsWith('hsl')) return '#0A0A0A';
  return hslToHex(h, s, l * 0.15);
}

// ─── Selection Functions ────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Select the best narrative pattern for the given intent and content.
 */
export function selectNarrativePattern(
  intent: string,
  featureCount: number,
  mode: ModeId,
): NarrativePattern {
  if (mode === 'cocomelon') {
    return NARRATIVE_PATTERNS.find(p => p.id === 'neuro-hijack')!;
  }

  if (mode === 'chaos') {
    return pickRandom(NARRATIVE_PATTERNS);
  }

  const lower = intent.toLowerCase();
  const words = lower.split(/\s+/);

  let bestPattern = NARRATIVE_PATTERNS[0];
  let bestScore = -1;

  for (const pattern of NARRATIVE_PATTERNS) {
    let score = 0;
    for (const keyword of pattern.bestFor) {
      if (words.some(w => w.includes(keyword)) || lower.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  // Tiebreak: if no keywords matched, pick by feature count
  if (bestScore === 0) {
    if (featureCount <= 2) return NARRATIVE_PATTERNS[2]; // rapid-hook
    return NARRATIVE_PATTERNS[0]; // problem-solution
  }

  return bestPattern;
}

/**
 * Resolve a slot (e.g. 'stat-callout|problem-statement') to a concrete scene type.
 */
export function resolveSlot(
  slot: string,
  content: ExtractedContent,
  usedSceneTypes: Set<SceneTypeId>,
  mode: ModeId,
): SceneTypeId {
  const candidates = slot.split('|') as SceneTypeId[];

  if (mode === 'chaos') {
    return pickRandom(candidates);
  }

  // Score candidates by content fitness
  let best: SceneTypeId = candidates[0];
  let bestScore = -1;

  for (const id of candidates) {
    if (usedSceneTypes.has(id) && candidates.length > 1) continue;
    let score = 0;

    switch (id) {
      case 'stat-callout':
        // Prefer if content has number-like features
        if (content.features.some(f => /\d+/.test(f))) score += 3;
        break;
      case 'problem-statement':
        score += 1; // always a reasonable choice for opening
        break;
      case 'feature-showcase':
        score += content.features.length;
        break;
      case 'integration-hub':
        if (content.techStack.length >= 3) score += 3;
        break;
      case 'social-proof':
        score += 1;
        break;
      case 'data-visualization':
        if (content.features.some(f => /\d+%/.test(f))) score += 3;
        break;
      case 'sequential-product-parade':
        if (content.features.length >= 4) score += 2;
        break;
      default:
        score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  return best;
}

/**
 * Select the right transition between two scenes based on narrative position.
 */
export function selectTransition(
  fromSceneType: SceneTypeId,
  toSceneType: SceneTypeId,
  sceneIndex: number,
  totalScenes: number,
  mode: ModeId,
  profile?: IndustryProfile,
): string {
  if (mode === 'chaos') {
    return pickRandom(ALL_TRANSITIONS);
  }

  if (mode === 'cocomelon') {
    // Descend phase (last 30% before CTA): softer transitions
    const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
    if (pos > 0.65 && toSceneType !== 'cta-outro') {
      return pickRandom(['crossfade', 'fade', 'blur']);
    }
    const aggressive = ['cut', 'flash', 'glitch', 'zoom-in', 'wipe-left', 'push-left'];
    if (Math.random() < 0.7) return pickRandom(aggressive);
  }

  if (profile && profile.preferredTransitions.length > 0 && Math.random() < 0.7) {
    return pickRandom(profile.preferredTransitions);
  }

  let position = 'between-features';

  if (sceneIndex === 0) {
    position = 'opening';
  } else if (toSceneType === 'cta-outro' && (fromSceneType === 'social-proof' || fromSceneType === 'data-visualization')) {
    position = 'proof-to-cta';
  } else if (toSceneType === 'cta-outro') {
    position = 'to-cta';
  } else if (
    (fromSceneType === 'stat-callout' || fromSceneType === 'problem-statement') &&
    (toSceneType === 'product-intro')
  ) {
    position = 'problem-to-solution';
  } else if (fromSceneType === 'rapid-text' && toSceneType === 'rapid-text') {
    position = 'within-rapid';
  } else if (
    toSceneType === 'social-proof' || toSceneType === 'data-visualization'
  ) {
    position = 'feature-to-proof';
  }

  const rule = TRANSITION_RULES.find(r => r.position === position);
  const preferred = rule?.preferred ?? ['crossfade'];

  if (mode === 'hybrid' && Math.random() < 0.2) {
    const safe = ALL_SAFE_TRANSITIONS.filter(t => !preferred.includes(t));
    if (safe.length > 0) return pickRandom(safe);
  }

  for (const t of preferred) {
    if (ALL_SAFE_TRANSITIONS.includes(t)) return t;
  }
  return preferred[0];
}

/**
 * Get element density bounds for a scene at a given position.
 * Bell curve: sparse at edges, dense in middle.
 */
export function getDensityForPosition(
  sceneType: SceneType,
  sceneIndex: number,
  totalScenes: number,
  mode: ModeId,
): { min: number; max: number } {
  // Normalized position 0..1
  const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);

  // Bell curve: peaks at 0.5
  // f(x) = 0.5 + 0.5 * (1 - (2x-1)^2)
  let multiplier = 0.5 + 0.5 * (1 - Math.pow(2 * pos - 1, 2));

  if (mode === 'chaos') {
    multiplier = Math.min(1.0, multiplier + 0.3);
  }

  if (mode === 'cocomelon') {
    // Arousal arc density: Arrest sparse, Escalate medium, Climax peak, Descend medium, Convert sparse
    if (pos < 0.05) multiplier = 0.5;           // Arrest
    else if (pos < 0.35) multiplier = 0.75;     // Escalate
    else if (pos < 0.65) multiplier = 1.0;      // Climax — max
    else if (pos < 0.95) multiplier = 0.7;      // Descend
    else multiplier = 0.5;                       // Convert
    // Global boost: cocomelon is denser than other modes
    multiplier = Math.min(1.0, multiplier + 0.15);
  }

  if (mode === 'hybrid') {
    // One random scene gets peak density
    const peakScene = Math.floor(totalScenes * 0.4 + Math.random() * totalScenes * 0.3);
    if (sceneIndex === peakScene) multiplier = 1.0;
  }

  return {
    min: Math.max(1, Math.round(sceneType.density.min * multiplier)),
    max: Math.max(1, Math.round(sceneType.density.max * multiplier)),
  };
}

/**
 * Select background CSS value for a scene.
 */
export function selectBackground(
  sceneType: SceneType,
  colors: string[],
  sceneIndex: number,
  totalScenes: number,
  mode: ModeId,
  useTokens: boolean = false,
): string {
  // Never use 'light' backgrounds — the default text color is always white,
  // which creates zero contrast on light backgrounds. There's no per-scene
  // text color switching, so light bg = invisible text.
  const safeHints: BackgroundHint[] = ['dark', 'dark-glow', 'brand-bold', 'gradient', 'dark-grid'];

  if (mode === 'chaos') {
    return generateBackground(pickRandom(safeHints), colors, useTokens);
  }

  if (mode === 'cocomelon') {
    const hint: BackgroundHint = sceneIndex % 2 === 0 ? 'dark' : 'dark-glow';
    return generateBackground(hint, colors, useTokens);
  }

  if (mode === 'hybrid' && Math.random() < 0.15) {
    const surpriseHints: BackgroundHint[] = ['gradient', 'brand-bold'];
    return generateBackground(pickRandom(surpriseHints), colors, useTokens);
  }

  // Override 'light' hint to 'dark-glow' to prevent contrast issues
  const effectiveHint: BackgroundHint = sceneType.backgroundHint === 'light' ? 'dark-glow' : sceneType.backgroundHint;

  if (sceneIndex === totalScenes - 1 && totalScenes > 2) {
    return generateBackground(effectiveHint, colors, useTokens);
  }

  if (sceneType.id === 'feature-showcase' || sceneType.id === 'sequential-product-parade') {
    const cycled = [...colors];
    const offset = sceneIndex % cycled.length;
    if (offset > 0 && cycled.length > 1) {
      const shifted = [...cycled.slice(offset), ...cycled.slice(0, offset)];
      return generateBackground(effectiveHint, shifted, useTokens);
    }
  }

  // Hue-shift background for consecutive same-hint scenes to add variety
  if (sceneIndex > 0 && !useTokens && colors.length >= 2) {
    const hueShift = (sceneIndex * 15) % 360; // 15° per scene
    if (hueShift > 0) {
      const shifted = colors.map(c => {
        const [h, s, l] = hexToHsl(c);
        if (s < 0.05) return c; // skip near-grays
        return hslToHex((h + hueShift) % 360, s, l);
      });
      return generateBackground(effectiveHint, shifted, useTokens);
    }
  }

  return generateBackground(effectiveHint, colors, useTokens);
}

/**
 * Boost color array for maximum contrast (cocomelon mode).
 * Ensures bg luminance < 15% and accent saturation > 70%.
 * Works with any palette — no hardcoded hex values.
 */
export function boostContrast(colors: string[]): string[] {
  if (colors.length === 0) return ['#0A0A0F', '#E94560', '#0A0A0F', '#1A1A2E'];
  const result = [...colors];

  // Ensure dark background (index 2 if present, otherwise derive)
  const bgIdx = result.length > 2 ? 2 : 0;
  result[bgIdx] = ensureDarkBg(result[bgIdx]);

  // Boost accent saturation (index 1 if present)
  if (result.length > 1) {
    result[1] = ensureHighSaturation(result[1]);
  }

  return result;
}

function hexToHsl(color: string): [number, number, number] {
  // Handle hsl(...) strings: hsl(42 82% 52%) or hsl(42, 82%, 52%)
  const hslMatch = color.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/);
  if (hslMatch) {
    return [parseFloat(hslMatch[1]), parseFloat(hslMatch[2]) / 100, parseFloat(hslMatch[3]) / 100];
  }
  if (!color.startsWith('#') || color.length < 7) return [0, 0, 0];
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const hN = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, hN + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, hN) * 255);
  const b = Math.round(hue2rgb(p, q, hN - 1/3) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function ensureDarkBg(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  if (l <= 0.15) return hex;
  return hslToHex(h, s, Math.min(l, 0.08));
}

function ensureHighSaturation(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  if (s >= 0.7) return hex;
  return hslToHex(h, Math.max(s, 0.75), Math.min(Math.max(l, 0.4), 0.6));
}

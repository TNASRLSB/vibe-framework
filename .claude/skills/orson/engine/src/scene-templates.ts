// Scene templates for orson
// Professional layout patterns inspired by SaaS/product promo videos.
// Each template defines CSS layout rules for a specific visual pattern,
// with variants for vertical (9:16) and horizontal (16:9) formats.
//
// Templates sit above the generic layout-profiles (which handle spacing/typography
// scaling per format). A template controls *composition* — where elements sit
// in the frame and how space is distributed.

import type { SceneTypeId } from './composition.js';
import type { Orientation } from './layout-profiles.js';

// ─── Types ──────────────────────────────────────────────────

export interface SceneTemplate {
  id: string;
  /** Human description of the visual pattern */
  description: string;
  /** Which scene types this template works best with */
  bestFor: SceneTypeId[];
  /** CSS rules for the scene container (orientation-aware) */
  getContainerCSS(orientation: Orientation): string;
  /** CSS rules for individual elements (by position index) */
  getElementCSS?(elementIndex: number, totalElements: number, orientation: Orientation): string;
  /** Min/max element count this template supports */
  elementRange: { min: number; max: number };
}

// ─── Templates ──────────────────────────────────────────────

/**
 * HERO-IMPACT: Single bold statement filling the frame.
 * Large heading, optional subtitle, generous whitespace.
 * Used for openers, hooks, and rapid-text scenes.
 */
const heroImpact: SceneTemplate = {
  id: 'hero-impact',
  description: 'Single bold statement centered with generous whitespace',
  bestFor: ['rapid-text', 'product-intro', 'stat-callout'],
  elementRange: { min: 1, max: 2 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:15% 8%;gap:24px;`
      : `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10% 15%;gap:32px;`;
  },
};

/**
 * THIRDS-LEFT: Content anchored to left third of frame.
 * Heading + supporting text left-aligned on the rule-of-thirds grid.
 * Right 40% is negative space (or depth layer / visual).
 */
const thirdsLeft: SceneTemplate = {
  id: 'thirds-left',
  description: 'Content on left third, right side is negative space',
  bestFor: ['problem-statement', 'product-intro', 'before-after'],
  elementRange: { min: 2, max: 4 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:20% 10% 20% 12%;gap:20px;max-width:85%;`
      : `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:8% 40% 8% 10%;gap:24px;`;
  },
};

/**
 * THIRDS-RIGHT: Content anchored to right third of frame.
 * Mirror of thirds-left for visual variety.
 */
const thirdsRight: SceneTemplate = {
  id: 'thirds-right',
  description: 'Content on right third, left side is negative space',
  bestFor: ['feature-showcase', 'social-proof'],
  elementRange: { min: 2, max: 4 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:flex-end;justify-content:center;text-align:right;padding:20% 12% 20% 10%;gap:20px;max-width:85%;margin-left:auto;`
      : `display:flex;flex-direction:column;align-items:flex-end;justify-content:center;text-align:right;padding:8% 10% 8% 40%;gap:24px;`;
  },
};

/**
 * STAT-HERO: Giant number with small label.
 * Number takes 60%+ of vertical space, label is secondary.
 */
const statHero: SceneTemplate = {
  id: 'stat-hero',
  description: 'Giant metric number with small supporting label',
  bestFor: ['stat-callout', 'data-visualization'],
  elementRange: { min: 2, max: 3 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:25% 10%;gap:12px;`
      : `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:12% 30% 12% 12%;gap:16px;`;
  },
  getElementCSS(idx, total, orientation) {
    if (idx === 0) {
      // The number — oversized
      return orientation === 'vertical'
        ? `font-size:1.6em;font-weight:900;letter-spacing:-0.03em;line-height:1;`
        : `font-size:1.8em;font-weight:900;letter-spacing:-0.03em;line-height:1;`;
    }
    // Label — smaller, muted
    return `opacity:0.7;font-size:0.75em;`;
  },
};

/**
 * CARD-SHOWCASE: Heading + grid of cards below.
 * Cards evenly distributed in a responsive grid.
 */
const cardShowcase: SceneTemplate = {
  id: 'card-showcase',
  description: 'Heading above a card grid',
  bestFor: ['feature-showcase', 'integration-hub', 'sequential-product-parade', 'data-visualization'],
  elementRange: { min: 3, max: 6 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:12% 6% 8%;gap:28px;`
      : `display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:6% 8% 4%;gap:24px;`;
  },
};

/**
 * SPLIT-COMPARE: Two columns side by side.
 * Before/after, comparison, or feature + visual.
 */
const splitCompare: SceneTemplate = {
  id: 'split-compare',
  description: 'Two-column layout for comparison or feature+visual',
  bestFor: ['before-after', 'feature-showcase'],
  elementRange: { min: 3, max: 5 },
  getContainerCSS(orientation) {
    if (orientation === 'vertical') {
      // Vertical: stack instead of split
      return `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:15% 8%;gap:24px;`;
    }
    return `display:grid;grid-template-columns:1fr 1fr;gap:5%;padding:8% 6%;align-items:center;`;
  },
};

/**
 * BOTTOM-CTA: Content stacked with CTA anchored to bottom third.
 * Used for closing scenes.
 */
const bottomCta: SceneTemplate = {
  id: 'bottom-cta',
  description: 'Content top, CTA anchored to bottom third',
  bestFor: ['cta-outro', 'social-proof'],
  elementRange: { min: 2, max: 3 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:15% 10% 20%;gap:24px;`
      : `display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:10% 15% 15%;gap:28px;`;
  },
};

/**
 * DIAGONAL-ENERGY: Elements arranged along a diagonal.
 * Creates visual movement and energy. Good for dynamic scenes.
 */
const diagonalEnergy: SceneTemplate = {
  id: 'diagonal-energy',
  description: 'Elements placed along a diagonal for dynamic energy',
  bestFor: ['feature-showcase', 'rapid-text', 'before-after'],
  elementRange: { min: 2, max: 4 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:18% 8%;gap:28px;transform:rotate(-1deg);`
      : `display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;padding:8% 25% 8% 10%;gap:32px;transform:rotate(-0.5deg);`;
  },
  getElementCSS(idx) {
    // Each element shifts right progressively
    const indent = idx * 4;
    return `margin-left:${indent}%;`;
  },
};

/**
 * TICKER-STRIP: Horizontal scrolling strip of items.
 * Used for integration hubs, product parades.
 */
const tickerStrip: SceneTemplate = {
  id: 'ticker-strip',
  description: 'Heading + horizontal scrolling strip of items',
  bestFor: ['integration-hub', 'sequential-product-parade', 'social-proof'],
  elementRange: { min: 3, max: 6 },
  getContainerCSS(orientation) {
    return orientation === 'vertical'
      ? `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:15% 4%;gap:32px;overflow:hidden;`
      : `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10% 4%;gap:28px;overflow:hidden;`;
  },
};

// ─── Template Registry ──────────────────────────────────────

export const SCENE_TEMPLATES: SceneTemplate[] = [
  heroImpact,
  thirdsLeft,
  thirdsRight,
  statHero,
  cardShowcase,
  splitCompare,
  bottomCta,
  diagonalEnergy,
  tickerStrip,
];

const _templateMap = new Map(SCENE_TEMPLATES.map(t => [t.id, t]));

/**
 * Get a template by ID.
 */
export function getSceneTemplate(id: string): SceneTemplate | undefined {
  return _templateMap.get(id);
}

/**
 * Select the best template for a given scene type and element count.
 * Returns undefined if no template is a good fit (caller should use default layout).
 */
export function selectTemplate(
  sceneTypeId: SceneTypeId,
  elementCount: number,
  sceneIndex: number,
  totalScenes: number,
): SceneTemplate | undefined {
  // Filter to templates that support this scene type and element count
  const candidates = SCENE_TEMPLATES.filter(t =>
    t.bestFor.includes(sceneTypeId) &&
    elementCount >= t.elementRange.min &&
    elementCount <= t.elementRange.max
  );

  if (candidates.length === 0) return undefined;

  // First and last scenes: prefer hero-impact or bottom-cta
  if (sceneIndex === 0) {
    const hero = candidates.find(t => t.id === 'hero-impact');
    if (hero) return hero;
  }
  if (sceneIndex === totalScenes - 1) {
    const cta = candidates.find(t => t.id === 'bottom-cta');
    if (cta) return cta;
  }

  // Alternate between left/right/other for variety
  const leftRight = candidates.filter(t => t.id === 'thirds-left' || t.id === 'thirds-right');
  if (leftRight.length > 0 && sceneIndex % 3 !== 0) {
    return leftRight[sceneIndex % leftRight.length];
  }

  // Default: cycle through candidates by scene index
  return candidates[sceneIndex % candidates.length];
}

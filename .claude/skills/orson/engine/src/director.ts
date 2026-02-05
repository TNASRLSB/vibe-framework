// Director: intelligent animation assignment based on scene content
// Analyzes what's in a scene and picks the right animations, timing, and sizes.
// Works by mutating ElementDef objects (adding entrance, delay, size, easing).

import type { SceneTypeId, ModeId } from './composition.js';

// ─── Types ──────────────────────────────────────────────────

interface ElementDef {
  type: string;
  text?: string;
  title?: string;
  size?: string;
  entrance?: string;
  exit?: string;
  delay?: string;
  easing?: string;
  'entrance-duration'?: string;
  items?: { title?: string; text?: string; icon?: string }[];
  phases?: { entrance?: string; delay?: string; duration?: string; text?: string; size?: string }[];
}

interface MatchResult {
  type: 'match' | 'none';
  score: number;
  reason: string;
}

interface ContentSignals {
  headingWordCount: number;
  headingText: string;
  headingHasMetric: boolean;
  elementCount: number;
  hasCards: boolean;
  cardCount: number;
  isOpener: boolean;
  isCloser: boolean;
  prevSceneType?: SceneTypeId;
  nextSceneType?: SceneTypeId;
}

interface SceneContext {
  sceneTypeId: SceneTypeId;
  elements: ElementDef[];
  position: number;
  totalScenes: number;
  mode: ModeId;
  signals: ContentSignals;
}

export interface SceneOverrides {
  layout?: string;
}

interface DirectionRecipe {
  id: string;
  match: (ctx: SceneContext) => MatchResult;
  apply: (elements: ElementDef[], ctx: SceneContext, overrides: SceneOverrides) => void;
}

// ─── Signal Builder ─────────────────────────────────────────

const METRIC_PATTERN = /\b\d+[\d,.]*\s*[%xX+]|\b\d+[KkMmBb]\+?\b|\b\d+[\d,.]*\s*(?:faster|users|teams|customers|downloads|stars|projects|hours|minutes|seconds)\b/;

export function buildContentSignals(
  elements: ElementDef[],
  sceneTypeId: SceneTypeId,
  position: number,
  totalScenes: number,
  prevSceneType?: SceneTypeId,
  nextSceneType?: SceneTypeId,
): ContentSignals {
  const heading = elements.find(e => e.type === 'heading');
  const headingText = heading?.text ?? '';
  const headingWordCount = headingText.trim().split(/\s+/).filter(Boolean).length;

  const cardGroups = elements.filter(e => e.type === 'card-group');
  const cardCount = cardGroups.reduce((n, cg) => n + (cg.items?.length ?? 0), 0);

  return {
    headingWordCount,
    headingText,
    headingHasMetric: METRIC_PATTERN.test(headingText),
    elementCount: elements.length,
    hasCards: cardCount > 0 || elements.some(e => e.type === 'card'),
    cardCount,
    isOpener: position === 0,
    isCloser: position === totalScenes - 1,
    prevSceneType,
    nextSceneType,
  };
}

// ─── Recipes ────────────────────────────────────────────────

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const heroImpact: DirectionRecipe = {
  id: 'hero-impact',
  match(ctx) {
    const { signals } = ctx;
    if (!signals.isOpener) return { type: 'none', score: 0, reason: '' };
    if (signals.headingWordCount < 1 || signals.headingWordCount > 3) {
      return { type: 'none', score: 0, reason: '' };
    }
    return {
      type: 'match',
      score: 0.9,
      reason: `short title (${signals.headingWordCount} words) + opener`,
    };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['slam', 'stamp']);
      heading.size = '2xl';
      heading['entrance-duration'] = '400ms';
    }
    // Other elements wait for heading to land
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '800ms';
        el.entrance = 'fade-in-up';
      }
    }
  },
};

const metricReveal: DirectionRecipe = {
  id: 'metric-reveal',
  match(ctx) {
    const { signals, sceneTypeId } = ctx;
    if (!signals.headingHasMetric) return { type: 'none', score: 0, reason: '' };
    const isStatScene = sceneTypeId === 'stat-callout' || sceneTypeId === 'data-visualization';
    const score = isStatScene ? 0.85 : 0.6;
    return { type: 'match', score, reason: `metric in heading + ${sceneTypeId}` };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = 'scale-word';
      heading.size = '2xl';
      heading['entrance-duration'] = '500ms';
    }
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '1000ms';
        el.entrance = 'fade-in-up';
      }
    }
  },
};

const textKinetic: DirectionRecipe = {
  id: 'text-kinetic',
  match(ctx) {
    const { signals, mode } = ctx;
    if (signals.headingWordCount < 4 || signals.headingWordCount > 8) {
      return { type: 'none', score: 0, reason: '' };
    }
    if (mode === 'safe') return { type: 'none', score: 0, reason: '' };
    const score = mode === 'cocomelon' ? 0.8 : 0.7;
    return { type: 'match', score, reason: `medium title (${signals.headingWordCount} words) + ${mode}` };
  },
  apply(elements, ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = ctx.mode === 'cocomelon'
        ? pickOne(['kinetic-push', 'word-by-word', 'text-reveal-mask'])
        : pickOne(['kinetic-push', 'word-by-word']);
      heading['entrance-duration'] = '600ms';
    }
  },
};

const cardBurst: DirectionRecipe = {
  id: 'card-burst',
  match(ctx) {
    const { signals } = ctx;
    if (!signals.hasCards || signals.cardCount < 3) {
      return { type: 'none', score: 0, reason: '' };
    }
    return { type: 'match', score: 0.75, reason: `${signals.cardCount} cards` };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['clip-reveal-left', 'clip-reveal-up', 'text-reveal-mask']);
    }
    for (const el of elements) {
      if (el.type === 'card-group' || el.type === 'card') {
        el.entrance = pickOne(['spring-scale', 'spring-up', 'bounce-in']);
      }
    }
  },
};

const closerDramatic: DirectionRecipe = {
  id: 'closer-dramatic',
  match(ctx) {
    const { signals, sceneTypeId } = ctx;
    if (!signals.isCloser) return { type: 'none', score: 0, reason: '' };
    if (sceneTypeId !== 'cta-outro') return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.85, reason: 'CTA closer' };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['zoom-in', 'scale-word', 'blur-in']);
      heading.size = 'xl';
      heading['entrance-duration'] = '500ms';
    }
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '600ms';
        el.entrance = 'fade-in-up';
      }
    }
  },
};

const openerLongTitle: DirectionRecipe = {
  id: 'opener-long-title',
  match(ctx) {
    const { signals } = ctx;
    if (!signals.isOpener) return { type: 'none', score: 0, reason: '' };
    if (signals.headingWordCount <= 3) return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.7, reason: `opener with long title (${signals.headingWordCount} words)` };
  },
  apply(elements, ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['clip-reveal-up', 'text-reveal-mask', 'typewriter']);
      heading['entrance-duration'] = '700ms';
    }
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '500ms';
        el.entrance = pickOne(['fade-in-up', 'soft-reveal']);
      }
    }
  },
};

const proofAuthority: DirectionRecipe = {
  id: 'proof-authority',
  match(ctx) {
    if (ctx.sceneTypeId !== 'social-proof') return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.7, reason: 'social proof scene' };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['fade-in', 'soft-reveal', 'letter-spacing-in']);
      heading['entrance-duration'] = '600ms';
    }
    for (const el of elements) {
      if (el !== heading && el.type === 'text') {
        el.entrance = pickOne(['fade-in-up', 'rise-and-fade']);
        el.delay = '400ms';
      }
    }
  },
};

const midSectionVariety: DirectionRecipe = {
  id: 'mid-section-variety',
  match(ctx) {
    const { signals, sceneTypeId } = ctx;
    if (signals.isOpener || signals.isCloser) return { type: 'none', score: 0, reason: '' };
    if (signals.hasCards) return { type: 'none', score: 0, reason: '' };
    if (sceneTypeId === 'stat-callout') return { type: 'none', score: 0, reason: '' };
    // Only match mid-section text-heavy scenes not covered by other recipes
    if (signals.elementCount < 2) return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.4, reason: 'mid-section text scene' };
  },
  apply(elements, ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      // Alternate between reveal styles based on position for visual variety
      const pool = ctx.position % 2 === 0
        ? ['clip-reveal-left', 'clip-reveal-up', 'split-reveal']
        : ['slide-left', 'slide-up', 'spring-left'];
      heading.entrance = pickOne(pool);
    }
    for (const el of elements) {
      if (el !== heading && el.type === 'text') {
        el.entrance = pickOne(['fade-in-up', 'fade-in', 'rise-and-fade']);
        el.delay = '300ms';
      }
    }
  },
};

// ─── Phase 2 Recipes ─────────────────────────────────────────

const fullscreenSlam: DirectionRecipe = {
  id: 'fullscreen-slam',
  match(ctx) {
    const { signals, mode } = ctx;
    if (!signals.isOpener) return { type: 'none', score: 0, reason: '' };
    if (signals.headingWordCount < 1 || signals.headingWordCount > 2) {
      return { type: 'none', score: 0, reason: '' };
    }
    if (mode === 'safe') return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.95, reason: `1-2 word opener + ${mode} → fullscreen` };
  },
  apply(elements, _ctx, overrides) {
    overrides.layout = 'fullscreen-text';
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['slam', 'stamp', 'scale-word']);
      heading.size = '2xl';
      heading['entrance-duration'] = '350ms';
    }
    // Hide everything else — fullscreen is single-element
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '1200ms';
        el.entrance = 'fade-in-up';
      }
    }
  },
};

const marqueeTicker: DirectionRecipe = {
  id: 'marquee-ticker',
  match(ctx) {
    const { sceneTypeId, signals, mode } = ctx;
    if (sceneTypeId !== 'integration-hub' && sceneTypeId !== 'sequential-product-parade') {
      return { type: 'none', score: 0, reason: '' };
    }
    if (mode === 'safe') return { type: 'none', score: 0, reason: '' };
    if (signals.cardCount < 4) return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.8, reason: `${signals.cardCount} items in ${sceneTypeId} → marquee` };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['clip-reveal-up', 'fade-in']);
    }
    for (const el of elements) {
      if (el.type === 'card-group' || el.type === 'card') {
        el.entrance = 'marquee';
        el['entrance-duration'] = '8000ms';
      }
    }
  },
};

const letterCascade: DirectionRecipe = {
  id: 'letter-cascade',
  match(ctx) {
    const { signals, mode } = ctx;
    if (signals.headingWordCount < 1 || signals.headingWordCount > 3) {
      return { type: 'none', score: 0, reason: '' };
    }
    if (mode !== 'chaos' && mode !== 'cocomelon') return { type: 'none', score: 0, reason: '' };
    // Only match non-opener short titles (opener handled by fullscreen-slam)
    if (signals.isOpener) return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.75, reason: `short title + ${mode} → letter cascade` };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = 'char-stagger';
      heading['entrance-duration'] = '1200ms';
      heading.size = 'xl';
    }
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '1400ms';
        el.entrance = 'fade-in-up';
      }
    }
  },
};

const multiPhaseReveal: DirectionRecipe = {
  id: 'multi-phase-reveal',
  match(ctx) {
    const { signals, sceneTypeId } = ctx;
    if (sceneTypeId !== 'stat-callout' && sceneTypeId !== 'data-visualization') {
      return { type: 'none', score: 0, reason: '' };
    }
    if (!signals.headingHasMetric) return { type: 'none', score: 0, reason: '' };
    // Need at least 2 elements to do a meaningful phase reveal
    if (signals.elementCount < 2) return { type: 'none', score: 0, reason: '' };
    return { type: 'match', score: 0.9, reason: `metric in ${sceneTypeId} → multi-phase reveal` };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    const text = elements.find(e => e.type === 'text');
    if (heading && text) {
      // Phase 1: show the label/description first
      // Phase 2: reveal the metric number dramatically
      heading.phases = [
        { text: text.text ?? '...', entrance: 'fade-in-up', duration: '400ms', size: 'lg' },
        { text: heading.text ?? '', entrance: 'scale-word', duration: '500ms', delay: '200ms', size: '2xl' },
      ];
      // Hide the original text element since it's shown in phase 1
      text.entrance = 'fade-in';
      text.delay = '2800ms';
    }
  },
};

const dramaticPause: DirectionRecipe = {
  id: 'dramatic-pause',
  match(ctx) {
    const { signals, mode } = ctx;
    if (signals.isOpener || signals.isCloser) return { type: 'none', score: 0, reason: '' };
    if (signals.elementCount < 2) return { type: 'none', score: 0, reason: '' };
    if (signals.hasCards) return { type: 'none', score: 0, reason: '' };
    // Only in non-safe modes for mid-section emphasis
    if (mode === 'safe') return { type: 'none', score: 0, reason: '' };
    // Medium-length headings work best for dramatic pause
    if (signals.headingWordCount < 3 || signals.headingWordCount > 7) {
      return { type: 'none', score: 0, reason: '' };
    }
    // Lower priority than textKinetic — only triggers when textKinetic doesn't
    return { type: 'match', score: 0.5, reason: 'mid-section dramatic pause' };
  },
  apply(elements, _ctx, _overrides) {
    const heading = elements.find(e => e.type === 'heading');
    if (heading) {
      heading.entrance = pickOne(['clip-reveal-up', 'blur-in', 'text-reveal-mask']);
      heading['entrance-duration'] = '600ms';
      heading.size = 'xl';
    }
    // Everything else appears much later — the dramatic pause
    for (const el of elements) {
      if (el !== heading) {
        el.delay = '2200ms';
        el.entrance = pickOne(['fade-in-up', 'soft-reveal']);
      }
    }
  },
};

const defaultRecipe: DirectionRecipe = {
  id: 'default',
  match() {
    // Always matches at lowest priority — fallback
    return { type: 'match', score: 0.1, reason: 'default fallback' };
  },
  apply(_elements, _ctx, _overrides) {
    // No-op: let timeline.ts handle animation selection as before
  },
};

// ─── Recipe Registry ────────────────────────────────────────

const RECIPES: DirectionRecipe[] = [
  // Phase 2 recipes (higher priority where applicable)
  fullscreenSlam,
  multiPhaseReveal,
  marqueeTicker,
  letterCascade,
  dramaticPause,
  // Phase 1 recipes
  heroImpact,
  metricReveal,
  textKinetic,
  cardBurst,
  closerDramatic,
  openerLongTitle,
  proofAuthority,
  midSectionVariety,
  defaultRecipe,
];

// ─── Public API ─────────────────────────────────────────────

/**
 * Analyze scene content and assign intelligent animations.
 * Mutates elements in-place by setting entrance, delay, size, etc.
 */
export function directScene(elements: ElementDef[], ctx: SceneContext): SceneOverrides {
  const overrides: SceneOverrides = {};
  const results = RECIPES
    .map(r => ({ recipe: r, result: r.match(ctx) }))
    .filter(r => r.result.type === 'match')
    .sort((a, b) => b.result.score - a.result.score);

  if (results.length > 0) {
    results[0].recipe.apply(elements, ctx, overrides);
  }
  return overrides;
}

export type { ElementDef, SceneContext, ContentSignals, MatchResult, DirectionRecipe };

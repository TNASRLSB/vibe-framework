// Auto-generate HTML from extracted content using composition patterns

import type { ExtractedContent } from './analyze-folder.js';
import type { Config, SceneConfig } from './config.js';
import { buildTimeline } from './timeline.js';
import { generateHTML } from './html-generator.js';
import {
  type SceneTypeId,
  type ModeId,
  SCENE_TYPES,
  selectNarrativePattern,
  resolveSlot,
  selectTransition,
  getDensityForPosition,
  selectBackground,
  boostContrast,
} from './composition.js';
import { detectIndustry, getSceneDuration, COCOMELON_PROFILE } from './industry-profiles.js';
import type { DesignTokens } from './ux-bridge.js';
import { mapTokensToVideoColors } from './ux-bridge.js';
import { directScene, buildContentSignals, type SceneOverrides } from './director.js';

export interface AutogenOptions {
  format: string;
  mode: 'safe' | 'chaos' | 'hybrid';
  speed: 'slowest' | 'slow' | 'normal' | 'fast' | 'fastest';
  intent: string;
  codec?: string;
  fps?: number;
  designTokens?: DesignTokens;
}

interface SceneDef {
  name: string;
  background?: string;
  layout?: string;
  duration?: string;
  'transition-out'?: string;
  'transition-duration'?: string;
  elements: ElementDef[];
  sceneTypeId?: string;
}

interface ElementPhase {
  entrance?: string;
  delay?: string;
  duration?: string;
  text?: string;
  size?: string;
}

interface ElementDef {
  type: string;
  text?: string;
  title?: string;
  size?: string;
  items?: { title?: string; text?: string; icon?: string }[];
  // Phase 2: multi-phase support (set by director recipes)
  phases?: ElementPhase[];
  // Phase 2: layout override (set by director recipes)
  layout?: string;
}

// ─── Content Cursor ─────────────────────────────────────────

interface ContentCursor {
  featureIdx: number;
  sectionIdx: number;
  headingIdx: number;
}

function nextFeatures(content: ExtractedContent, cursor: ContentCursor, max: number): string[] {
  const result = content.features.slice(cursor.featureIdx, cursor.featureIdx + max);
  cursor.featureIdx += result.length;
  return result;
}

function nextSection(content: ExtractedContent, cursor: ContentCursor): { title: string; body: string } | null {
  if (cursor.sectionIdx >= content.sections.length) return null;
  return content.sections[cursor.sectionIdx++];
}

function nextHeading(content: ExtractedContent, cursor: ContentCursor): string | null {
  if (cursor.headingIdx >= content.headings.length) return null;
  return content.headings[cursor.headingIdx++];
}

// ─── Semantic Content Helpers ────────────────────────────────

/** Match a real metric pattern: "100+", "50%", "2x faster", "10K users", etc. */
const METRIC_PATTERN = /\b\d+[\d,.]*\s*[%xX+]|\b\d+[KkMmBb]\+?\b|\b\d+[\d,.]*\s*(?:faster|users|teams|customers|downloads|stars|projects|hours|minutes|seconds)\b/;

/** Find the best section matching keywords for a scene type */
function findBestSection(
  content: ExtractedContent,
  cursor: ContentCursor,
  keywords: string[],
): { title: string; body: string } | null {
  // Score remaining sections by keyword relevance
  let bestIdx = -1;
  let bestScore = 0;

  for (let i = cursor.sectionIdx; i < content.sections.length; i++) {
    const s = content.sections[i];
    const lower = (s.title + ' ' + s.body).toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  if (bestIdx >= 0 && bestScore > 0) {
    const section = content.sections[bestIdx];
    // Swap found section to cursor position so we don't skip others
    if (bestIdx !== cursor.sectionIdx) {
      [content.sections[cursor.sectionIdx], content.sections[bestIdx]] =
        [content.sections[bestIdx], content.sections[cursor.sectionIdx]];
    }
    cursor.sectionIdx++;
    return section;
  }

  // Fallback to linear
  return nextSection(content, cursor);
}

// ─── Element Builders (per scene type) ──────────────────────

function buildElements(
  sceneTypeId: SceneTypeId,
  content: ExtractedContent,
  cursor: ContentCursor,
  density: { min: number; max: number },
): ElementDef[] {
  const st = SCENE_TYPES[sceneTypeId];
  const els: ElementDef[] = [];

  switch (sceneTypeId) {
    case 'stat-callout': {
      const numFeature = content.features.find(f => METRIC_PATTERN.test(f));
      els.push({ type: 'heading', text: numFeature ?? (content.heroText || content.projectName), size: '2xl' });
      els.push({ type: 'text', text: content.description || content.projectName });
      if (els.length < density.min) els.push({ type: 'divider' });
      // Add secondary text if we have room
      if (els.length < density.max) {
        const section = findBestSection(content, cursor, ['metric', 'stat', 'data', 'result', 'growth']);
        if (section?.body) els.push({ type: 'text', text: truncate(section.body, 150) });
      }
      break;
    }

    case 'problem-statement': {
      const heading = content.heroText || content.headings[0] || content.projectName;
      els.push({ type: 'heading', text: truncate(heading, 120), size: st.headingSize });
      if (content.description) {
        els.push({ type: 'text', text: truncate(content.description, 200) });
      }
      // Fill to density with section content and CTA
      if (els.length < density.max) {
        const section = findBestSection(content, cursor, ['problem', 'challenge', 'pain', 'issue', 'struggle']);
        if (section?.body) els.push({ type: 'text', text: truncate(section.body, 200) });
      }
      if (els.length < density.max && content.ctaText) {
        els.push({ type: 'button', text: content.ctaText });
      }
      break;
    }

    case 'product-intro': {
      els.push({ type: 'heading', text: content.projectName || 'Untitled', size: 'xl' });
      if (content.description) {
        els.push({ type: 'text', text: truncate(content.description, 200) });
      }
      if (els.length < density.max) els.push({ type: 'divider' });
      // Add a feature as supporting text
      if (els.length < density.max) {
        const feats = nextFeatures(content, cursor, 1);
        if (feats.length > 0) els.push({ type: 'text', text: truncate(feats[0], 150) });
      }
      break;
    }

    case 'feature-showcase': {
      const maxItems = Math.min(density.max - 1, 4); // -1 for heading, cap at 4 to prevent vertical overflow
      const features = nextFeatures(content, cursor, maxItems);
      if (features.length === 0) {
        // Fallback to section content
        const section = nextSection(content, cursor);
        if (section) {
          els.push({ type: 'heading', text: truncate(section.title, 120), size: 'lg' });
          els.push({ type: 'text', text: truncate(section.body, 250) });
        } else {
          els.push({ type: 'heading', text: content.projectName || 'Features', size: 'lg' });
        }
      } else if (features.length >= 3) {
        // Use a relevant section title if available, otherwise generic
        const sectionTitle = findBestSection(content, cursor, ['feature', 'capability', 'what', 'highlight', 'power']);
        els.push({ type: 'heading', text: sectionTitle?.title || 'Key Features', size: 'lg' });
        els.push({
          type: 'card-group',
          items: features.map(f => ({ title: truncate(f, 80) })),
        });
      } else {
        for (const f of features) {
          els.push({ type: 'heading', text: truncate(f, 120), size: 'lg' });
        }
      }
      break;
    }

    case 'before-after': {
      const section = findBestSection(content, cursor, ['before', 'after', 'transform', 'change', 'improve', 'result']);
      els.push({ type: 'heading', text: section?.title || 'The Transformation', size: 'lg' });
      // Before block
      if (section?.body) {
        els.push({ type: 'text', text: truncate(section.body, 200) });
      } else {
        els.push({ type: 'text', text: content.description || 'Before' });
      }
      // After block
      const afterFeats = nextFeatures(content, cursor, 1);
      if (afterFeats.length > 0) {
        els.push({ type: 'text', text: truncate(afterFeats[0], 200) });
      }
      if (els.length < density.max && content.ctaText) {
        els.push({ type: 'button', text: content.ctaText });
      }
      break;
    }

    case 'integration-hub': {
      const items = content.techStack.length > 0
        ? content.techStack.slice(0, 6)
        : nextFeatures(content, cursor, 6);
      els.push({ type: 'heading', text: 'Built With', size: 'lg' });
      if (items.length > 0) {
        els.push({
          type: 'card-group',
          items: items.map(t => ({ title: t })),
        });
      }
      break;
    }

    case 'social-proof': {
      const section = findBestSection(content, cursor, ['trust', 'testimonial', 'review', 'customer', 'team', 'user', 'client', 'partner']);
      els.push({
        type: 'heading',
        text: section?.title || 'Trusted by teams everywhere',
        size: 'lg',
      });
      if (section?.body) {
        els.push({ type: 'text', text: truncate(section.body, 250) });
      }
      // Add card-group from sections/features for social proof density
      if (els.length < density.max) {
        const proofItems = nextFeatures(content, cursor, Math.min(3, density.max - els.length));
        if (proofItems.length >= 2) {
          els.push({ type: 'card-group', items: proofItems.map(f => ({ title: truncate(f, 80) })) });
        }
      }
      break;
    }

    case 'cta-outro': {
      els.push({ type: 'heading', text: content.ctaText || 'Try it now', size: 'xl' });
      if (content.description) {
        els.push({ type: 'text', text: truncate(content.description, 150) });
      } else if (content.projectName) {
        els.push({ type: 'text', text: content.projectName });
      }
      els.push({ type: 'button', text: content.ctaText || 'Get Started' });
      break;
    }

    case 'rapid-text': {
      const heading = nextHeading(content, cursor) || content.heroText || content.projectName;
      els.push({ type: 'heading', text: truncate(heading || 'Untitled', 80), size: '2xl' });
      // Add subtitle for density
      if (density.max >= 2 && content.description) {
        els.push({ type: 'text', text: truncate(content.description, 100) });
      }
      break;
    }

    case 'data-visualization': {
      const section = findBestSection(content, cursor, ['data', 'insight', 'metric', 'analytics', 'performance', 'growth', 'stat']);
      els.push({
        type: 'heading',
        text: section?.title || 'Key Insights',
        size: 'lg',
      });
      if (section?.body) {
        els.push({ type: 'text', text: truncate(section.body, 250) });
      }
      // Add metric cards if we have features with numbers
      if (els.length < density.max) {
        const metricFeats = content.features
          .filter(f => METRIC_PATTERN.test(f))
          .slice(0, Math.min(3, density.max - els.length));
        if (metricFeats.length >= 2) {
          els.push({ type: 'card-group', items: metricFeats.map(f => ({ title: truncate(f, 80) })) });
        }
      }
      break;
    }

    case 'sequential-product-parade': {
      const features = nextFeatures(content, cursor, 4);
      if (features.length > 0) {
        els.push({ type: 'heading', text: 'Our Solutions', size: 'lg' });
        els.push({
          type: 'card-group',
          items: features.map(f => ({ title: truncate(f, 80) })),
        });
      } else {
        els.push({ type: 'heading', text: content.projectName || 'Solutions', size: 'lg' });
      }
      break;
    }
  }

  // Ensure at least one element
  if (els.length === 0) {
    els.push({ type: 'heading', text: content.projectName || 'Untitled', size: 'lg' });
  }

  return els;
}

// ─── Main Generator ─────────────────────────────────────────

/**
 * Generate a YAML config string from extracted content and user options.
 */
export function generateConfig(content: ExtractedContent, options: AutogenOptions): string {
  // Use design system colors if available, then extracted colors, then fallback
  const dsColors = options.designTokens ? mapTokensToVideoColors(options.designTokens) : [];
  let colors = dsColors.length >= 2
    ? dsColors
    : content.colors.length > 0
      ? content.colors
      : ['#1a1a2e', '#16213e', '#0f3460', '#e94560'];
  const mode = options.mode as ModeId;
  const useTokens = !!options.designTokens;

  // Cocomelon: ensure high-contrast palette regardless of source
  if (mode === 'cocomelon') {
    colors = boostContrast(colors);
  }

  // Detect industry profile (cocomelon overrides any detected industry)
  const profile = mode === 'cocomelon'
    ? COCOMELON_PROFILE
    : detectIndustry(options.intent, content);

  // 1. Select narrative pattern
  const pattern = selectNarrativePattern(options.intent, content.features.length, mode);

  // 2. Build scenes from pattern
  const scenes: SceneDef[] = [];
  const usedSceneTypes = new Set<SceneTypeId>();
  const cursor: ContentCursor = { featureIdx: 0, sectionIdx: 0, headingIdx: 0 };
  const resolvedSceneTypes: SceneTypeId[] = [];

  // Resolve all slots first
  for (const slot of pattern.sequence) {
    const sceneTypeId = resolveSlot(slot, content, usedSceneTypes, mode);
    usedSceneTypes.add(sceneTypeId);
    resolvedSceneTypes.push(sceneTypeId);
  }

  // Content budget: estimate feature consumption and trim scenes if insufficient
  const featureHeavy = new Set<SceneTypeId>(['feature-showcase', 'integration-hub', 'sequential-product-parade', 'social-proof']);
  const estimatedNeed = resolvedSceneTypes.reduce((sum, st) => {
    if (featureHeavy.has(st)) return sum + 3;
    if (st === 'before-after' || st === 'data-visualization') return sum + 2;
    return sum + 1;
  }, 0);
  const available = content.features.length + content.sections.length;

  if (estimatedNeed > available * 1.5 && resolvedSceneTypes.length > pattern.minScenes) {
    // Trim middle scenes (keep first and last)
    const excess = Math.ceil((estimatedNeed - available) / 3);
    const trimCount = Math.min(excess, resolvedSceneTypes.length - pattern.minScenes);
    for (let t = 0; t < trimCount; t++) {
      // Remove from the middle (index 2..n-2 preferred)
      const removeIdx = Math.min(2 + t, resolvedSceneTypes.length - 2);
      if (removeIdx > 0 && removeIdx < resolvedSceneTypes.length - 1) {
        resolvedSceneTypes.splice(removeIdx, 1);
      }
    }
  }

  // In hybrid mode, randomly swap one non-first non-last slot
  if (mode === 'hybrid' && resolvedSceneTypes.length > 2) {
    const swapIdx = 1 + Math.floor(Math.random() * (resolvedSceneTypes.length - 2));
    const allIds = Object.keys(SCENE_TYPES) as SceneTypeId[];
    const current = resolvedSceneTypes[swapIdx];
    const alternatives = allIds.filter(id => id !== current && id !== 'cta-outro');
    if (alternatives.length > 0) {
      resolvedSceneTypes[swapIdx] = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  // Build each scene
  const totalScenes = resolvedSceneTypes.length;
  for (let i = 0; i < totalScenes; i++) {
    const sceneTypeId = resolvedSceneTypes[i];
    const st = SCENE_TYPES[sceneTypeId];
    const density = getDensityForPosition(st, i, totalScenes, mode);
    let elements = buildElements(sceneTypeId, content, cursor, density);

    // Director: assign intelligent animations based on content
    const signals = buildContentSignals(
      elements, sceneTypeId, i, totalScenes,
      i > 0 ? resolvedSceneTypes[i - 1] : undefined,
      i < totalScenes - 1 ? resolvedSceneTypes[i + 1] : undefined,
    );
    const sceneOverrides = directScene(elements, {
      sceneTypeId,
      elements,
      position: i,
      totalScenes,
      mode,
      signals,
    });

    // Detect degenerate scene (content exhausted → generic fallback)
    const isFirstOrLast = i === 0 || i === totalScenes - 1;
    if (!isFirstOrLast && isDegenerate(elements, content)) {
      // Smart recycling: rephrase features instead of raw cursor reset
      const savedCursor = { ...cursor };
      cursor.featureIdx = 0;
      cursor.sectionIdx = 0;
      // Rephrase features by taking the second half of text (after comma/dash)
      const origFeatures = content.features.slice();
      content.features = content.features.map(f => {
        const sep = f.indexOf(' — ');
        if (sep > 0) return f.slice(sep + 3).trim();
        const comma = f.indexOf(', ');
        if (comma > 0) return f.slice(0, comma).trim();
        return f.length > 40 ? f.slice(0, 40) + '…' : f;
      });
      elements = buildElements(sceneTypeId, content, cursor, density);
      content.features = origFeatures; // restore originals

      if (isDegenerate(elements, content)) {
        // Still degenerate — skip this scene entirely
        Object.assign(cursor, savedCursor);
        continue;
      }
    }

    const background = selectBackground(st, colors, i, totalScenes, mode, useTokens);

    const scene: SceneDef = {
      name: sceneNameFromElements(elements, sceneTypeId, i),
      background,
      elements,
      sceneTypeId,
    };

    // Layout hint: director override > scene-type default
    // Never set explicit layout when scene contains cards — let autoSelectLayout
    // pick the right card layout (card-column on vertical, card-row on horizontal)
    const hasCards = elements.some(e => e.type === 'card-group' || e.type === 'card');
    if (!hasCards) {
      if (sceneOverrides.layout) {
        scene.layout = sceneOverrides.layout;
      } else if (st.layout !== 'centered') {
        scene.layout = st.layout;
      }
    }

    // Scene duration from industry profile rhythm
    const sceneDurMs = getSceneDuration(profile, i, totalScenes);
    scene.duration = `${sceneDurMs}ms`;

    // Transition to next scene (not on last scene)
    if (i < totalScenes - 1) {
      const nextSceneType = resolvedSceneTypes[i + 1];
      scene['transition-out'] = selectTransition(sceneTypeId, nextSceneType, i, totalScenes, mode, profile);
    }

    scenes.push(scene);
  }

  // 3. Expand if content remains and under maxScenes
  if (scenes.length < pattern.maxScenes) {
    const remainingFeatures = content.features.length - cursor.featureIdx;
    const remainingSections = content.sections.length - cursor.sectionIdx;

    if (remainingFeatures > 0 || remainingSections > 0) {
      // Insert extra feature-showcase scenes before CTA
      const insertIdx = scenes.length - 1; // before CTA
      const extraCount = Math.min(
        pattern.maxScenes - scenes.length,
        Math.ceil((remainingFeatures + remainingSections) / 3),
      );

      for (let e = 0; e < extraCount; e++) {
        const st = SCENE_TYPES['feature-showcase'];
        const density = getDensityForPosition(st, insertIdx, scenes.length + extraCount, mode);
        const elements = buildElements('feature-showcase', content, cursor, density);
        if (elements.length <= 1 && elements[0]?.text === (content.projectName || 'Features')) break;

        const bg = selectBackground(st, colors, insertIdx + e, scenes.length + extraCount, mode, useTokens);
        scenes.splice(insertIdx + e, 0, {
          name: `Details ${e + 1}`,
          background: bg,
          layout: 'stacked',
          'transition-out': 'crossfade',
          elements,
        });
      }
    }
  }

  // 4. Ensure minimum 3 scenes
  if (scenes.length < 3) {
    const insertIdx = scenes.length - 1;
    scenes.splice(insertIdx, 0, {
      name: 'About',
      background: selectBackground(SCENE_TYPES['social-proof'], colors, 1, 3, mode, useTokens),
      elements: [
        { type: 'heading', text: content.projectName || 'Learn More', size: 'lg' },
        { type: 'text', text: content.description || 'Discover what makes this special.' },
      ],
    });
  }

  // 5. Build Config object directly, generate HTML
  const config: Config = {
    video: {
      format: options.format,
      fps: options.fps ?? 60,
      codec: (options.codec ?? 'h265') as 'h264' | 'h265' | 'av1',
      mode: options.mode,
      speed: options.speed,
      output: './output/video.mp4',
    },
    'design-system': options.designTokens ? '.ui-craft/system.md' : undefined,
    scenes: scenes as SceneConfig[],
  };

  const timeline = buildTimeline(config);
  return generateHTML(config, timeline, options.designTokens);
}

// ─── Helpers ────────────────────────────────────────────────

const GENERIC_TEXTS = new Set([
  'Features', 'Key Features', 'Untitled', 'Learn More', 'Key Insights',
  'The Transformation', 'Trusted by teams everywhere', 'Our Solutions',
  'See the difference', 'Key metric', 'Built With',
]);

/** A scene is degenerate if it has ≤1 element with only generic/project-name text */
function isDegenerate(elements: ElementDef[], content: ExtractedContent): boolean {
  if (elements.length > 2) return false;
  if (elements.length === 0) return true;
  // Single heading with generic or project-name text
  if (elements.length === 1) {
    const el = elements[0];
    const text = el.text ?? el.title ?? '';
    return GENERIC_TEXTS.has(text) || text === content.projectName;
  }
  // Two elements: heading + text both generic
  const texts = elements.map(e => e.text ?? e.title ?? '');
  return texts.every(t => GENERIC_TEXTS.has(t) || t === content.projectName || t === content.description);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max - 2);
  return (cut > max * 0.6 ? text.slice(0, cut) : text.slice(0, max - 1)) + '…';
}

/** Derive scene name from actual content (called AFTER content recycling) */
function sceneNameFromElements(elements: ElementDef[], sceneTypeId: SceneTypeId, index: number): string {
  // Try to use the first heading's text as scene name
  const heading = elements.find(e => e.type === 'heading');
  if (heading?.text && !GENERIC_TEXTS.has(heading.text)) {
    return truncate(heading.text, 40);
  }
  // Fallback to scene-type names
  const names: Record<SceneTypeId, string> = {
    'stat-callout': 'Key Stat',
    'problem-statement': 'The Challenge',
    'product-intro': 'Introducing',
    'feature-showcase': 'Features',
    'before-after': 'The Transformation',
    'integration-hub': 'Built With',
    'social-proof': 'Social Proof',
    'cta-outro': 'CTA',
    'rapid-text': 'Hook',
    'data-visualization': 'Insights',
    'sequential-product-parade': 'Our Solutions',
  };
  const base = names[sceneTypeId] ?? 'Scene';
  return index === 0 ? base : `${base} ${index + 1}`;
}

// Generates a self-contained HTML page from a frame-addressed timeline (v3)
// CSS handles layout only — NO @keyframes, NO animation properties on elements.
// All animation state is driven by the frame renderer JS via window.__setFrame(n).

import type { Timeline, TimelineScene, TimelineElement } from './timeline.js';
import type { Config } from './config.js';
import { FORMAT_PRESETS } from './presets.js';
import type { DesignTokens } from './ux-bridge.js';
import {
  getLayoutProfile, autoSelectLayout, computeCardGridColumns, computeEffectiveCardMaxWidth,
  type LayoutProfile, type ElementInfo,
} from './layout-profiles.js';
import {
  getBgAnimationKeyframes, getBgAnimationCSS, getDepthLayerHTML,
  getCompositionCSS,
} from './choreography.js';
import { embedAsDataURI } from './asset-embed.js';
import { generateFrameRendererJS, type RendererTimeline, type RendererScene, type RendererElement } from './frame-renderer.js';
import { ENTRANCES } from './actions.js';
import { selectDecoratives, getDecorativeKeyframes, type SceneEnrichmentHint } from './decorative.js';
import { matchIcon } from './icon-library.js';
import { detectMockupType, generateMockup } from './mockups.js';

export function generateHTML(
  config: Config,
  timeline: Timeline,
  tokens?: DesignTokens,
): string {
  const fmt = config.video.format;
  const preset = FORMAT_PRESETS[fmt];
  const width = preset?.width ?? 1080;
  const height = preset?.height ?? 1920;
  const profile = getLayoutProfile(fmt);

  const isScroll = config.video.composition === 'scroll';

  // Build scene HTML
  const scenesHtml = timeline.scenes.map((s, i) =>
    generateSceneHTML(s, config, profile, tokens, isScroll)
  ).join('\n');

  // Design tokens as CSS custom properties
  const tokensCss = tokens ? generateTokensCss(tokens) : defaultTokensCss();

  const p = profile;
  const isVert = p.orientation === 'vertical';

  // Build @video comment
  const videoComment = `<!-- @video format="${fmt}" fps="${config.video.fps}" speed="${config.video.speed}" mode="${config.video.mode}" codec="${config.video.codec}" output="${config.video.output}" -->`;
  const dsComment = config['design-system']
    ? `\n<!-- @design-system path="${config['design-system']}" -->`
    : '';

  // Google Fonts import
  const fontImport = tokens?.fontUrls?.length
    ? tokens.fontUrls.map(u => `@import url('${u}');`).join('\n') + '\n'
    : '';

  // DS-driven overrides
  const dsRadius = tokens?.borderRadius !== undefined ? tokens.borderRadius : null;
  const dsBorderWidth = tokens?.borderWidth ?? 0;
  const dsBorderColor = tokens?.borderColor ?? 'currentColor';
  const dsTextTransform = tokens?.textTransform ?? '';
  const dsLetterSpacing = tokens?.letterSpacing ?? '';
  const dsLetterSpacingWide = tokens?.letterSpacingWide ?? '';
  const dsFontWeight = tokens?.fontWeight ?? 800;
  const dsFontVariation = tokens?.fontVariationSettings ?? '';
  const dsHeadingLineHeight = tokens?.headingLineHeight ?? 0;
  const dsTrackingDisplay = tokens?.trackingDisplay ?? '';

  const cardRadiusVal = dsRadius !== null ? dsRadius : p.cardRadius;
  const buttonRadiusVal = dsRadius !== null ? dsRadius : p.buttonRadius;
  const cardBorderCSS = dsBorderWidth > 0
    ? `border: ${dsBorderWidth}px solid ${dsBorderColor};`
    : '';
  const buttonBorderCSS = dsBorderWidth > 0
    ? `border: ${dsBorderWidth}px solid var(--color-accent, ${dsBorderColor});`
    : 'border: none;';
  const headingTransformCSS = dsTextTransform ? `text-transform: ${dsTextTransform};` : '';
  const headingTrackingCSS = dsLetterSpacing ? `letter-spacing: ${dsLetterSpacing};` : '';
  const wideTrackingCSS = dsLetterSpacingWide ? `letter-spacing: ${dsLetterSpacingWide};` : '';

  const namedColors = tokens?.namedColors ?? [];

  // Build the RendererTimeline for frame renderer injection
  const rendererTimeline = buildRendererTimeline(timeline);
  rendererTimeline.composition = isScroll ? 'scroll' : 'stack';
  rendererTimeline.viewportHeight = height;
  const frameRendererJS = generateFrameRendererJS(rendererTimeline);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${width}, initial-scale=1">
${videoComment}${dsComment}
<style>
${fontImport}* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
${tokensCss}
}

body {
  position: relative; width: ${width}px; ${isScroll ? '' : `height: ${height}px;`} overflow: hidden;
  font-family: var(--font-body, system-ui, -apple-system, sans-serif);
  background: var(--color-bg, #0f0f0f);
  color: var(--color-text, #ffffff);
  ${isScroll ? `display: flex; flex-direction: column; min-height: ${height * timeline.scenes.length}px;` : ''}
}

/* ─── Base scene: CSS Grid for full-frame control ─── */
.scene {
  ${isScroll
    ? `position: relative; width: 100%; min-height: ${height}px;`
    : `position: absolute; top: 0; left: 0; width: 100%; height: 100%;`}
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;
  background: var(--color-bg, #0f0f0f);
  ${isScroll ? '' : 'display: none; /* Frame renderer controls visibility */'}
}

/* Content wrapper sits in middle row */
.scene > .scene-content {
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${p.gap}px;
  width: 100%;
  max-width: ${p.elementMaxWidth};
  overflow: hidden;
  max-height: calc(${height}px - ${p.padding.top + p.padding.bottom}px);
}

/* ═══════════════════════════════════════════
   LAYOUT MODES — each one controls how the
   scene grid distributes vertical space
   ═══════════════════════════════════════════ */

/* ─── Layout: hero ─── */
.scene.layout-hero {
  grid-template-rows: ${isVert ? '1fr auto 1.4fr' : '1fr auto 1fr'};
}
.scene.layout-hero > .scene-content {
  gap: ${Math.round(p.gap * 1.5)}px;
}

/* ─── Layout: centered ─── */
.scene.layout-centered {
  grid-template-rows: 1fr auto 1fr;
}
.scene.layout-centered > .scene-content {
  gap: ${Math.round(p.gap * 1.2)}px;
  justify-content: center;
}
.scene.layout-centered > .scene-content.sparse {
  gap: ${Math.round(p.gap * 2)}px;
}

/* ─── Layout: stacked ─── */
.scene.layout-stacked {
  grid-template-rows: ${isVert ? '0.3fr auto 2fr' : '0.5fr auto 1.5fr'};
}
.scene.layout-stacked > .scene-content {
  align-items: center;
  text-align: center;
  gap: ${Math.round(p.gap * 1.2)}px;
  justify-content: space-evenly;
}

/* ─── Layout: split ─── */
.scene.layout-split {
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 1fr;
  gap: ${p.gap * 2}px;
}
.scene.layout-split > .scene-content {
  grid-row: 1;
  grid-column: 1 / -1;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: ${p.gap * 2}px;
}
.scene.layout-split > .scene-content > .el {
  flex: 1 1 40%;
  min-width: 200px;
}

/* ─── Layout: card-column ─── */
.scene.layout-card-column {
  grid-template-rows: 1fr;
}
.scene.layout-card-column > .scene-content {
  grid-row: 1;
  gap: ${Math.round(p.gap * 0.8)}px;
  width: 100%;
  height: 100%;
  justify-content: center;
}
.scene.layout-card-column .cards-container {
  display: flex;
  flex-direction: column;
  gap: ${p.cardGap}px;
  width: 100%;
  align-items: stretch;
  flex: 1;
}
.scene.layout-card-column .el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ─── Layout: card-row ─── */
.scene.layout-card-row {
  grid-template-rows: 1fr auto 1fr;
}
.scene.layout-card-row > .scene-content {
  gap: ${p.gap}px;
  width: 100%;
}
.scene.layout-card-row .cards-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${p.cardGap}px;
  justify-content: center;
  align-items: stretch;
}

/* ─── Layout: card-grid ─── */
.scene.layout-card-grid {
  grid-template-rows: 1fr auto 1fr;
}
.scene.layout-card-grid > .scene-content {
  gap: ${p.gap}px;
  width: 100%;
}
.scene.layout-card-grid .cards-container {
  display: grid;
  gap: ${p.cardGap}px;
  width: 100%;
  justify-items: center;
}

/* ─── Layout: fullscreen-text ─── */
.scene.layout-fullscreen-text {
  grid-template-rows: 1fr;
}
.scene.layout-fullscreen-text > .scene-content {
  grid-row: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.scene.layout-fullscreen-text .el-heading {
  font-size: clamp(${Math.round(p.headingScale['2xl'] * 0.8)}px, 18vw, ${Math.round(p.headingScale['2xl'] * 1.8)}px);
  line-height: 0.95;
  text-align: center;
  -webkit-line-clamp: unset;
  max-width: 95%;
}

/* ═══════════════════════════════════════════
   ELEMENT STYLES
   ═══════════════════════════════════════════ */

.el { max-width: 100%; }

.el-heading {
  font-family: var(--font-display, var(--font-body, system-ui));
  font-weight: ${dsFontWeight};
  line-height: ${dsHeadingLineHeight > 0 ? dsHeadingLineHeight : 1.1};
  padding-bottom: 0.05em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  text-wrap: balance;
  ${headingTransformCSS}
  ${headingTrackingCSS}
  ${dsFontVariation ? `font-variation-settings: ${dsFontVariation};` : ''}
}
.el-heading.size-sm { font-size: ${p.headingScale.sm}px; }
.el-heading.size-md { font-size: ${p.headingScale.md}px; }
.el-heading.size-lg { font-size: ${p.headingScale.lg}px; }
.el-heading.size-xl { font-size: clamp(${Math.round(p.headingScale.xl * 0.7)}px, 10vw, ${p.headingScale.xl}px); ${dsTrackingDisplay ? `letter-spacing: ${dsTrackingDisplay};` : ''} }
.el-heading.size-2xl { font-size: clamp(${Math.round(p.headingScale['2xl'] * 0.65)}px, 12vw, ${p.headingScale['2xl']}px); ${dsTrackingDisplay ? `letter-spacing: ${dsTrackingDisplay};` : 'letter-spacing: -0.03em;'} }

.el-text {
  font-size: ${p.textSize}px;
  line-height: ${p.textLineHeight};
  opacity: 1;
  max-width: ${isVert ? '95%' : '80%'};
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  text-overflow: ellipsis;
}

.el-button {
  display: inline-block;
  padding: ${p.buttonPadding.v}px ${p.buttonPadding.h}px;
  background: var(--color-accent, #e94560);
  color: var(--color-on-accent, #ffffff);
  font-size: ${p.buttonSize}px;
  font-weight: 700;
  border-radius: ${buttonRadiusVal}px;
  ${buttonBorderCSS}
  ${dsTextTransform ? `text-transform: ${dsTextTransform};` : ''}
  ${wideTrackingCSS}
}

.el-card {
  background: var(--color-surface, rgba(255,255,255,0.12));
  border-radius: ${cardRadiusVal}px;
  padding: ${p.cardPadding}px;
  ${p.cardMinWidth > 0 ? `min-width: ${p.cardMinWidth}px;` : ''}
  ${p.cardMaxWidth < 9000 ? `max-width: ${p.cardMaxWidth}px;` : ''}
  text-align: center;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  ${cardBorderCSS}
}
${namedColors.length > 0 ? namedColors.map((c, i) => `.el-card:nth-child(${namedColors.length}n+${i + 1}) { border-left: 8px solid ${c.value}; }`).join('\n') : ''}

.scene.layout-card-row .el-card {
  flex: 1 1 0;
  ${p.cardMinWidth > 0 ? `min-width: ${p.cardMinWidth}px;` : ''}
  max-width: var(--card-max-width, ${p.cardMaxWidth < 9000 ? p.cardMaxWidth : 400}px);
}

.el-card .card-icon { font-size: ${p.cardIconSize}px; margin-bottom: 12px; }
.el-card .card-title { font-size: ${p.cardTitleSize}px; font-weight: 700; margin-bottom: 8px; }
.el-card .card-text { font-size: ${p.cardTextSize}px; opacity: 1; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; text-overflow: ellipsis; }

.el-divider {
  width: ${p.dividerWidth}px;
  height: ${p.dividerHeight}px;
  background: var(--color-accent, #e94560);
  border-radius: 2px;
}

.el-image img {
  max-width: 100%;
  max-height: ${p.imageMaxHeight};
  border-radius: ${p.imageRadius}px;
  object-fit: contain;
}
.el-image.image-hero img { max-height: 60%; width: 90%; object-fit: cover; border-radius: ${Math.round(p.imageRadius * 1.5)}px; }
.el-image.image-bg { position: absolute; inset: 0; z-index: 0; }
.el-image.image-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.3; border-radius: 0; }

.el-video { position: relative; }
.el-video video {
  max-width: 100%;
  max-height: ${p.imageMaxHeight};
  border-radius: ${p.imageRadius}px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.el-video.pip-corner { position: absolute; bottom: 5%; right: 5%; width: 35%; z-index: 10; }
.el-video.pip-corner video { width: 100%; max-height: none; }
.el-video.pip-center video { width: 80%; }

/* ═══════════════════════════════════════════
   BACKGROUND ANIMATIONS (decorative, CSS-driven)
   ═══════════════════════════════════════════ */
${getBgAnimationKeyframes()}
${getDecorativeKeyframes()}
</style>
</head>
<body>
${scenesHtml}
<script>
${frameRendererJS}
</script>
</body>
</html>`;
}

// ─── Build RendererTimeline from Timeline ─────────────────────

function buildRendererTimeline(timeline: Timeline): RendererTimeline {
  const scenes: RendererScene[] = timeline.scenes.map(scene => {
    const elements: RendererElement[] = scene.elements.map(el => {
      const entranceDef = ENTRANCES[el.entranceId];
      const re: RendererElement = {
        domSelector: el.domSelector,
        animations: el.animations,
      };
      if (entranceDef?.textSplit) {
        re.textSplit = entranceDef.textSplit;
        const staggerMs = entranceDef.staggerMs ?? (entranceDef.textSplit === 'word' ? 80 : 30);
        re.staggerFrames = Math.max(1, Math.round(staggerMs * timeline.fps / 1000));
      }
      return re;
    });

    const rs: RendererScene = {
      id: `scene-${scene.sceneIndex}`,
      startFrame: scene.startFrame,
      endFrame: scene.endFrame,
      elements,
    };

    if (scene.transition) {
      rs.transition = {
        type: scene.transition.type,
        startFrame: scene.transition.startFrame,
        endFrame: scene.transition.endFrame,
        outgoing: scene.transition.outgoing,
        incoming: scene.transition.incoming,
      };
    }

    return rs;
  });

  return {
    totalFrames: timeline.totalFrames,
    fps: timeline.fps,
    scenes,
  };
}

// ─── Scene HTML Generation ────────────────────────────────────

/** Map scene-type ID to decorative enrichment hint */
function sceneEnrichmentHint(sceneTypeId?: string, sceneIndex?: number, totalScenes?: number): SceneEnrichmentHint {
  if (sceneIndex === 0) return 'hero';
  if (totalScenes && sceneIndex === totalScenes - 1) return 'cta';
  switch (sceneTypeId) {
    case 'stat-callout': case 'problem-statement': case 'product-intro': case 'rapid-text': return 'hero';
    case 'feature-showcase': case 'before-after': case 'integration-hub': case 'sequential-product-parade': return 'feature';
    case 'social-proof': return 'social';
    case 'cta-outro': return 'cta';
    case 'data-visualization': return 'data';
    default: return 'default';
  }
}

/** Infer cinematic composition from layout mode, element count, and scene position */
function inferComposition(layoutMode: string, isSparse: boolean, sceneIndex: number, totalScenes: number): string {
  if (sceneIndex === 0) return 'centered';
  if (sceneIndex === totalScenes - 1) return 'centered';
  if (layoutMode.startsWith('card-')) return 'centered';
  if (layoutMode === 'split') return 'asymmetric-split';
  const pool = ['off-center-focal', 'right-aligned', 'centered', 'bottom-anchored', 'top-anchored'];
  return pool[sceneIndex % pool.length];
}

/** Infer background animation type from scene characteristics */
function inferBgAnimation(layoutMode: string, elementCount: number, sceneIndex: number, mode?: string, totalScenes?: number, sceneName?: string): string {
  if (mode === 'cocomelon' && totalScenes) {
    const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
    if (pos < 0.05) return 'vignette';
    if (pos < 0.35) return 'gradient-drift';
    if (pos < 0.65) return sceneIndex % 2 === 0 ? 'particle-float' : 'grid-pulse';
    if (pos < 0.95) return 'ambient-glow';
    return 'gradient-drift';
  }

  if (sceneIndex === 0) return 'vignette';

  const name = (sceneName ?? '').toLowerCase();
  if (name.includes('stat') || name.includes('insight')) return 'gradient-drift';
  if (name.includes('feature') || name.includes('detail')) return 'grid-pulse';
  if (name.includes('transform') || name.includes('before')) return 'gradient-drift';
  if (name.includes('proof') || name.includes('social')) return 'ambient-glow';
  if (name.includes('cta')) return 'gradient-drift';

  if (layoutMode === 'card-grid') return 'particle-float';
  if (layoutMode === 'stacked' && elementCount >= 4) return 'grid-pulse';
  return 'gradient-drift';
}

function generateSceneHTML(
  scene: TimelineScene,
  config: Config,
  profile: LayoutProfile,
  tokens?: DesignTokens,
  isScroll: boolean = false,
): string {
  // Gather element info for auto-layout
  const elementInfos: ElementInfo[] = scene.elements.map(el => ({
    type: el.element.type,
    isCard: el.element.type === 'card' || el.element.type === 'card-group',
  }));

  const layoutMode = autoSelectLayout(profile, elementInfos, scene.scene.layout);

  const bgValue = scene.scene.background
    ? resolveToken(scene.scene.background, tokens)
    : '';
  const bg = bgValue ? `background: ${bgValue};` : '';

  // Composition style
  const isSparse = scene.elements.length <= 2;
  const compositionId = inferComposition(layoutMode, isSparse, scene.sceneIndex, config.scenes?.length ?? 1);
  const isVert = profile.orientation === 'vertical';
  const compositionStyle = getCompositionCSS(compositionId, isVert);

  // Background animation (decorative CSS, not frame-addressed)
  const bgAnimType = inferBgAnimation(layoutMode, scene.elements.length, scene.sceneIndex, config.video?.mode, config.scenes?.length, scene.scene.name);
  const bgAnimCSS = getBgAnimationCSS(bgAnimType);
  const accentColor = tokens?.colorAccent ?? tokens?.colorPrimary ?? '#6366f1';
  const depthLayerHtml = getDepthLayerHTML(bgAnimType, accentColor);

  // Decorative enrichment (orbs, rings, grids — under content, z-index: 0)
  const enrichHint = sceneEnrichmentHint(scene.scene.sceneTypeId, scene.sceneIndex, config.scenes?.length);
  const decorativeHtml = selectDecoratives(enrichHint, accentColor, scene.sceneIndex, config.video?.mode ?? 'safe').join('\n    ');

  // Mockup detection: check if any text element references code/ui/mobile
  const mockupText = scene.elements.map(el => el.element.text ?? el.element.title ?? '').join(' ');
  const mockupType = detectMockupType(mockupText);
  const mockupHtml = mockupType ? generateMockup(mockupType) : '';

  // Extract bg animation CSS
  const bgAnimMatch = bgAnimCSS.match(/animation:\s*([^;]+);/);
  const bgAnimValue = bgAnimMatch?.[1]?.trim() ?? '';
  const bgAnimOther = bgAnimCSS.replace(/animation:\s*[^;]+;/, '').trim().replace(/;+$/, '');
  const bgAnimStyle = bgAnimValue ? `animation: ${bgAnimValue};` : '';

  // Card elements separation
  const cardElements = scene.elements.filter(el =>
    el.element.type === 'card' || el.element.type === 'card-group'
  );
  const nonCardElements = scene.elements.filter(el =>
    el.element.type !== 'card' && el.element.type !== 'card-group'
  );

  const isCardLayout = layoutMode === 'card-column' || layoutMode === 'card-row' || layoutMode === 'card-grid';

  let elementsHtml: string;

  if (isCardLayout && cardElements.length > 0) {
    const nonCardHtml = nonCardElements.map(el => generateElementHTML(el, tokens)).join('\n      ');

    const cardHtml = cardElements.flatMap(el => generateCardElements(el, tokens)).join('\n        ');

    const actualCardCount = cardElements.reduce((n, el) => {
      if (el.element.type === 'card-group') return n + (el.element.items?.length ?? 1);
      return n + 1;
    }, 0);

    const gridCols = layoutMode === 'card-grid'
      ? `grid-template-columns: ${computeCardGridColumns(profile, actualCardCount)};`
      : '';

    const effectiveMaxW = computeEffectiveCardMaxWidth(profile, actualCardCount, config.video.format);
    const cardMaxWidthStyle = layoutMode === 'card-row'
      ? `--card-max-width: ${effectiveMaxW}px;`
      : '';

    elementsHtml = `${nonCardHtml}
      <div class="cards-container" style="${gridCols}${cardMaxWidthStyle}">
        ${cardHtml}
      </div>`;
  } else {
    elementsHtml = scene.elements.map(el => generateElementHTML(el, tokens)).join('\n      ');
  }

  // Sparse class
  const visualCount = scene.elements.reduce((n, el) => {
    if (el.element.type === 'card-group') return n + (el.element.items?.length ?? 1);
    return n + 1;
  }, 0);
  const sparseClass = visualCount <= 2 ? ' sparse' : '';

  // @scene comment
  const sceneAttrs: string[] = [`name="${scene.scene.name}"`];
  if (scene.durationMs) sceneAttrs.push(`duration="${scene.durationMs}ms"`);
  if (scene.transition) sceneAttrs.push(`transition-out="${scene.transition.type}"`);
  if (scene.transitionOutDurationMs) sceneAttrs.push(`transition-duration="${scene.transitionOutDurationMs}ms"`);
  const sceneComment = `<!-- @scene ${sceneAttrs.join(' ')} -->`;

  // Wrap mockup with absolute positioning at bottom of scene (outside scene-content to avoid overflow clip)
  const mockupWrapped = mockupHtml
    ? `<div style="position:absolute;bottom:5%;left:50%;transform:translateX(-50%);z-index:1;opacity:0.85;">${mockupHtml}</div>`
    : '';

  return `  ${sceneComment}
  <div class="scene layout-${layoutMode}" id="scene-${scene.sceneIndex}" style="${bg}${bgAnimOther ? bgAnimOther + ';' : ''}${bgAnimStyle}">
    ${depthLayerHtml}
    ${decorativeHtml}
    ${mockupWrapped}
    <div class="scene-content${sparseClass}" style="${compositionStyle}">
      ${elementsHtml}
    </div>
  </div>`;
}

// ─── Text Splitting for word-by-word / char-stagger ──────────

/**
 * Wrap text into word or character spans for stagger animations.
 * Returns HTML string with spans containing data-wi or data-ci indices.
 */
function splitText(text: string, mode: 'word' | 'char'): string {
  const escaped = escapeHtml(text);
  if (mode === 'word') {
    const words = escaped.split(/(\s+)/);
    let wi = 0;
    return words.map(part => {
      if (/^\s+$/.test(part)) return `<span class="sp">&nbsp;</span>`;
      return `<span class="w" data-wi="${wi++}" style="display:inline-block">${part}</span>`;
    }).join('');
  }
  // char mode
  let ci = 0;
  return escaped.split('').map(ch => {
    if (ch === ' ') return `<span class="sp">&nbsp;</span>`;
    return `<span class="ch" data-ci="${ci++}" style="display:inline-block">${ch}</span>`;
  }).join('');
}

/**
 * Check if an entrance animation requires text splitting.
 */
function getTextSplitMode(entranceId: string): 'word' | 'char' | null {
  const def = ENTRANCES[entranceId];
  return def?.textSplit ?? null;
}

// ─── Element HTML Generation ──────────────────────────────────

/** Generate card element(s) — card-group expands into multiple cards */
function generateCardElements(el: TimelineElement, tokens?: DesignTokens): string[] {
  const cfg = el.element;
  const si = el.sceneIndex;
  const ei = el.elementIndex;

  const colorStyle = cfg.color ? `color: ${resolveToken(cfg.color, tokens)};` : '';
  const fontStyle = cfg.font ? `font-family: ${resolveToken(cfg.font, tokens)};` : '';
  const bgStyle = cfg.background ? `background: ${resolveToken(cfg.background, tokens)};` : '';
  const extraStyle = `${colorStyle}${fontStyle}${bgStyle}`;

  if (cfg.type === 'card-group') {
    const items = cfg.items ?? [];
    return items.map((item, i) => {
      const dataEl = `data-el="s${si}-e${ei}-c${i}"`;
      const itemImgSrc = item.src ? embedAsDataURI(item.src) : '';
      return `<div class="el el-card" ${dataEl} style="${extraStyle}">
        ${itemImgSrc ? `<img src="${escapeHtml(itemImgSrc)}" alt="" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
        ${item.icon ? `<div class="card-icon">${iconPlaceholder(item.icon)}</div>` : ''}
        ${item.title ? `<div class="card-title">${escapeHtml(item.title)}</div>` : ''}
        ${item.text ? `<div class="card-text">${escapeHtml(item.text)}</div>` : ''}
      </div>`;
    });
  }

  // Single card
  const dataEl = `data-el="s${si}-e${ei}"`;
  return [`<div class="el el-card" ${dataEl} style="${extraStyle}">
    ${cfg.icon ? `<div class="card-icon">${iconPlaceholder(cfg.icon)}</div>` : ''}
    ${cfg.title ? `<div class="card-title">${escapeHtml(cfg.title)}</div>` : ''}
    ${cfg.text ? `<div class="card-text">${escapeHtml(cfg.text)}</div>` : ''}
  </div>`];
}

function generateElementHTML(el: TimelineElement, tokens?: DesignTokens): string {
  const si = el.sceneIndex;
  const ei = el.elementIndex;
  const dataEl = `data-el="s${si}-e${ei}"`;

  // Multi-phase rendering
  const phases = el.element.phases;
  if (phases && phases.length > 0) {
    return generateMultiPhaseHTML(el, phases, tokens);
  }

  const colorStyle = el.element.color ? `color: ${resolveToken(el.element.color, tokens)};` : '';
  const fontStyle = el.element.font ? `font-family: ${resolveToken(el.element.font, tokens)};` : '';
  const bgStyle = el.element.background ? `background: ${resolveToken(el.element.background, tokens)};` : '';
  const extraStyle = `${colorStyle}${fontStyle}${bgStyle}`;

  const cfg = el.element;

  switch (cfg.type) {
    case 'heading': {
      const size = cfg.size ?? 'lg';
      const textLen = (cfg.text ?? '').length;
      const sizeThresholds: Record<string, number> = { '2xl': 30, xl: 40, lg: 60, md: 80, sm: 100 };
      const threshold = sizeThresholds[size] ?? 60;
      let fontScale = '';
      if (textLen > threshold * 1.5) {
        fontScale = 'font-size: 0.7em;';
      } else if (textLen > threshold) {
        fontScale = 'font-size: 0.85em;';
      }
      const headingSplit = getTextSplitMode(el.entranceId);
      const headingContent = headingSplit ? splitText(cfg.text ?? '', headingSplit) : escapeHtml(cfg.text ?? '');
      return `<div class="el el-heading size-${size}" ${dataEl} style="${fontScale}${extraStyle}">${headingContent}</div>`;
    }
    case 'text': {
      const textSplit = getTextSplitMode(el.entranceId);
      const bodyText = cfg.text ?? '';
      const textContent = textSplit ? splitText(bodyText, textSplit) : escapeHtml(bodyText);
      // Adaptive font scaling for long body text
      let bodyScale = '';
      if (bodyText.length > 200) bodyScale = 'font-size: 0.8em;';
      else if (bodyText.length > 140) bodyScale = 'font-size: 0.9em;';
      return `<div class="el el-text" ${dataEl} style="${bodyScale}${extraStyle}">${textContent}</div>`;
    }
    case 'button':
      return `<div class="el el-button" ${dataEl} style="${extraStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
    case 'image': {
      const imgSrc = embedAsDataURI(cfg.src ?? '');
      const imgVariant = cfg.style ?? '';
      const variantClass = imgVariant ? ` ${imgVariant}` : '';
      return `<div class="el el-image${variantClass}" ${dataEl}><img src="${escapeHtml(imgSrc)}" alt=""></div>`;
    }
    case 'video': {
      const videoSrc = cfg.src ?? '';
      const pipVariant = cfg.style ?? '';
      const pipClass = pipVariant ? ` ${pipVariant}` : '';
      return `<div class="el el-video${pipClass}" ${dataEl}><video src="${escapeHtml(videoSrc)}" muted preload="auto" data-pip="true"></video></div>`;
    }
    case 'divider':
      return `<div class="el el-divider" ${dataEl}></div>`;
    case 'card':
      return `<div class="el el-card" ${dataEl} style="${extraStyle}">
        ${cfg.icon ? `<div class="card-icon">${iconPlaceholder(cfg.icon)}</div>` : ''}
        ${cfg.title ? `<div class="card-title">${escapeHtml(cfg.title)}</div>` : ''}
        ${cfg.text ? `<div class="card-text">${escapeHtml(cfg.text)}</div>` : ''}
      </div>`;
    case 'card-group': {
      const items = cfg.items ?? [];
      return items.map((item, i) => {
        return `<div class="el el-card" data-el="s${si}-e${ei}-c${i}" style="${extraStyle}">
          ${item.icon ? `<div class="card-icon">${iconPlaceholder(item.icon)}</div>` : ''}
          ${item.title ? `<div class="card-title">${escapeHtml(item.title)}</div>` : ''}
          ${item.text ? `<div class="card-text">${escapeHtml(item.text)}</div>` : ''}
        </div>`;
      }).join('\n      ');
    }
    default:
      return `<div class="el" ${dataEl} style="${extraStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
  }
}

/**
 * Multi-phase element: renders N stacked divs.
 * Frame renderer handles phase visibility via animations.
 */
function generateMultiPhaseHTML(
  el: TimelineElement,
  phases: Array<{ entrance?: string; delay?: string | number; duration?: string | number; text?: string; size?: string }>,
  tokens?: DesignTokens,
): string {
  const si = el.sceneIndex;
  const ei = el.elementIndex;
  const cfg = el.element;
  const colorStyle = cfg.color ? `color: ${resolveToken(cfg.color, tokens)};` : '';
  const fontStyle = cfg.font ? `font-family: ${resolveToken(cfg.font, tokens)};` : '';
  const bgStyle = cfg.background ? `background: ${resolveToken(cfg.background, tokens)};` : '';
  const extraStyle = `${colorStyle}${fontStyle}${bgStyle}`;

  const size = cfg.size ?? 'lg';
  const phaseDivs: string[] = [];

  for (let pi = 0; pi < phases.length; pi++) {
    const phase = phases[pi];
    const phaseText = phase.text ?? cfg.text ?? '';
    const phaseSize = phase.size ?? size;
    phaseDivs.push(
      `<div class="el el-heading size-${phaseSize}" data-el="s${si}-e${ei}-p${pi}" style="position:absolute;${extraStyle}">${escapeHtml(phaseText)}</div>`
    );
  }

  return `<div class="el" style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;min-height:1.2em;">
      ${phaseDivs.join('\n      ')}
    </div>`;
}

// ─── Utilities ────────────────────────────────────────────────

function resolveToken(value: string, tokens?: DesignTokens): string {
  if (!value.startsWith('--')) return value;
  return `var(${value})`;
}

function iconPlaceholder(icon: string): string {
  // Try SVG icon library first (renders at currentColor, scalable)
  const svg = matchIcon(icon);
  if (svg) return `<span style="display:inline-block;width:1em;height:1em;vertical-align:middle;">${svg}</span>`;

  // Emoji fallback
  const map: Record<string, string> = {
    sync: '🔄', users: '👥', chart: '📊', star: '⭐', heart: '❤️',
    check: '✓', arrow: '→', bolt: '⚡', shield: '🛡️', globe: '🌍',
    rocket: '🚀', cube: '📦', lock: '🔒', code: '💻', clock: '⏱️',
    folder: '📁', cloud: '☁️', key: '🔑', gear: '⚙️', eye: '👁️',
    sparkle: '✨', fire: '🔥', target: '🎯', puzzle: '🧩', leaf: '🍃',
  };
  return map[icon] ?? `[${icon}]`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateTokensCss(tokens: DesignTokens): string {
  const lines: string[] = [];
  if (tokens.fontDisplay) lines.push(`  --font-display: ${tokens.fontDisplay};`);
  if (tokens.fontBody) lines.push(`  --font-body: ${tokens.fontBody};`);
  if (tokens.colorPrimary) lines.push(`  --color-primary: ${tokens.colorPrimary};`);
  if (tokens.colorAccent) lines.push(`  --color-accent: ${tokens.colorAccent};`);
  if (tokens.colorBg) lines.push(`  --color-bg: ${tokens.colorBg};`);
  if (tokens.colorText) lines.push(`  --color-text: ${tokens.colorText};`);
  if (tokens.colorSurface) lines.push(`  --color-surface: ${tokens.colorSurface};`);
  if (tokens.colorOnPrimary) lines.push(`  --color-on-primary: ${tokens.colorOnPrimary};`);
  if (tokens.colorOnAccent) lines.push(`  --color-on-accent: ${tokens.colorOnAccent};`);
  if (tokens.borderColor) lines.push(`  --color-border: ${tokens.borderColor};`);
  if (tokens.namedColors) {
    for (const c of tokens.namedColors) {
      lines.push(`  --color-${c.name}: ${c.value};`);
    }
  }
  return lines.join('\n') || '  /* no tokens */';
}

function defaultTokensCss(): string {
  return `  --font-display: system-ui, -apple-system, sans-serif;
  --font-body: system-ui, -apple-system, sans-serif;
  --color-primary: #6366f1;
  --color-accent: #e94560;
  --color-bg: #0f0f0f;
  --color-text: #ffffff;
  --color-surface: rgba(255, 255, 255, 0.08);
  --color-on-primary: #ffffff;
  --color-on-accent: #ffffff;`;
}

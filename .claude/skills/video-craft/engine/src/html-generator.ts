// Generates a self-contained HTML page from a timeline
// CSS values are driven by layout profiles — no hardcoded dimensions
// Layout philosophy: elements FILL the frame, not cluster at center

import type { Timeline, TimelineScene, TimelineElement } from './timeline.js';
import type { Config } from './config.js';
import { FORMAT_PRESETS } from './presets.js';
import type { AnimationDef } from './actions.js';
import type { DesignTokens } from './ux-bridge.js';
import {
  getLayoutProfile, autoSelectLayout, computeCardGridColumns,
  type LayoutProfile, type LayoutMode, type ElementInfo,
} from './layout-profiles.js';
import {
  getBgAnimationKeyframes, getBgAnimationCSS, getDepthLayerHTML,
  getCompositionCSS,
} from './choreography.js';

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

  const keyframesSet = new Set<string>();
  const keyframesCss: string[] = [];

  // Collect all unique keyframes needed
  for (const scene of timeline.scenes) {
    for (const el of scene.elements) {
      addKeyframes(el.entranceId, el.entranceDef.keyframes, keyframesSet, keyframesCss);
      if (el.exitId && el.exitDef) {
        addKeyframes(el.exitId, el.exitDef.keyframes, keyframesSet, keyframesCss);
      }
    }
    if (scene.transitionOut) {
      addKeyframes(`trans-a-${scene.transitionOut.id}`, scene.transitionOut.sceneAKeyframes, keyframesSet, keyframesCss);
      addKeyframes(`trans-b-${scene.transitionOut.id}`, scene.transitionOut.sceneBKeyframes, keyframesSet, keyframesCss);
    }
  }

  // Build scene HTML
  const scenesHtml = timeline.scenes.map(s => generateSceneHTML(s, config, profile, tokens)).join('\n');

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

  // Named colors for cycling on cards
  const namedColors = tokens?.namedColors ?? [];

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
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  font-family: var(--font-body, system-ui, -apple-system, sans-serif);
  background: var(--color-bg, #0f0f0f);
  color: var(--color-text, #ffffff);
}

/* ─── Base scene: CSS Grid for full-frame control ─── */
.scene {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;
  background: var(--color-bg, #0f0f0f);
  opacity: 0;
}
/* First scene visible immediately */
.scene:first-child { opacity: 1; }

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

@keyframes scene-reveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ═══════════════════════════════════════════
   LAYOUT MODES — each one controls how the
   scene grid distributes vertical space
   ═══════════════════════════════════════════ */

/* ─── Layout: hero ───
   Content in upper-center area with generous spacing.
   Used for hook/opening scenes on vertical formats. */
.scene.layout-hero {
  grid-template-rows: ${isVert ? '1fr auto 1.4fr' : '1fr auto 1fr'};
}
.scene.layout-hero > .scene-content {
  gap: ${Math.round(p.gap * 1.5)}px;
}

/* ─── Layout: centered ───
   True center, good for horizontal/square or
   scenes with balanced content. */
.scene.layout-centered {
  grid-template-rows: 1fr auto 1fr;
}
.scene.layout-centered > .scene-content {
  gap: ${Math.round(p.gap * 1.2)}px;
  justify-content: center;
}
/* Sparse scenes (1-2 elements): extra breathing room */
.scene.layout-centered > .scene-content.sparse {
  gap: ${Math.round(p.gap * 2)}px;
}

/* ─── Layout: stacked ───
   Content starts from top, flows down.
   Good for 3+ text elements. */
.scene.layout-stacked {
  grid-template-rows: ${isVert ? '0.3fr auto 2fr' : '0.5fr auto 1.5fr'};
}
.scene.layout-stacked > .scene-content {
  align-items: center;
  text-align: center;
  gap: ${Math.round(p.gap * 1.2)}px;
  justify-content: space-evenly;
}

/* ─── Layout: split ───
   Side-by-side for horizontal formats. */
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

/* ─── Layout: card-column ───
   Cards stacked vertically, filling the frame.
   On vertical formats, scene-content fills all 3 rows. */
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

/* ─── Layout: card-row ───
   Cards side-by-side for horizontal formats. */
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

/* ─── Layout: fullscreen-text ───
   Single element fills the entire viewport. */
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
  line-height: 1.1;
  padding-bottom: 0.05em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  ${headingTransformCSS}
  ${headingTrackingCSS}
}
.el-heading.size-sm { font-size: ${p.headingScale.sm}px; }
.el-heading.size-md { font-size: ${p.headingScale.md}px; }
.el-heading.size-lg { font-size: ${p.headingScale.lg}px; }
.el-heading.size-xl { font-size: clamp(${Math.round(p.headingScale.xl * 0.7)}px, 10vw, ${p.headingScale.xl}px); }
.el-heading.size-2xl { font-size: clamp(${Math.round(p.headingScale['2xl'] * 0.65)}px, 12vw, ${p.headingScale['2xl']}px); }

.el-text {
  font-size: ${p.textSize}px;
  line-height: ${p.textLineHeight};
  opacity: 0.85;
  max-width: ${isVert ? '95%' : '80%'};
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
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

/* In card-row layout, cards share space */
.scene.layout-card-row .el-card {
  flex: 1 1 0;
  ${p.cardMinWidth > 0 ? `min-width: ${p.cardMinWidth}px;` : ''}
  ${p.cardMaxWidth < 9000 ? `max-width: ${p.cardMaxWidth}px;` : 'max-width: 400px;'}
}

.el-card .card-icon { font-size: ${p.cardIconSize}px; margin-bottom: 12px; }
.el-card .card-title { font-size: ${p.cardTitleSize}px; font-weight: 700; margin-bottom: 8px; }
.el-card .card-text { font-size: ${p.cardTextSize}px; opacity: 0.8; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }

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
}

${keyframesCss.join('\n')}

/* ═══════════════════════════════════════════
   BACKGROUND ANIMATIONS
   ═══════════════════════════════════════════ */
${getBgAnimationKeyframes()}
</style>
</head>
<body>
${scenesHtml}
<script>
// Scene preview controller — shows one scene at a time
// Skipped during video render (capture.ts sets __VIDEO_RENDER__ via addInitScript)
(function() {
  if (window.__VIDEO_RENDER__) return;
  const scenes = document.querySelectorAll('.scene');
  if (scenes.length === 0) return;
  let current = 0;

  // Store original animation values on first run
  scenes.forEach(s => {
    s.querySelectorAll('.el').forEach(el => {
      el.setAttribute('data-anim', el.style.animation || '');
    });
  });

  function show(idx) {
    scenes.forEach((s, i) => {
      if (i === idx) {
        s.style.visibility = 'visible';
        s.style.opacity = '1';
        s.style.pointerEvents = 'auto';
        s.style.animation = s.getAttribute('data-bg-anim') || 'none';
        // Replay element animations: remove delay, force retrigger
        s.querySelectorAll('.el').forEach(el => {
          const orig = el.getAttribute('data-anim') || '';
          // Strip animation completely
          el.style.animation = 'none';
          // Force reflow so browser registers removal
          void el.offsetWidth;
          // Re-apply with delay zeroed (replace last Nms before "both")
          const zeroed = orig.replace(/(\\d+)ms(\\s+both)/, '0ms$2');
          // Use requestAnimationFrame to ensure the 'none' has been painted
          requestAnimationFrame(() => {
            el.style.animation = zeroed;
          });
        });
      } else {
        s.style.visibility = 'hidden';
        s.style.opacity = '0';
        s.style.pointerEvents = 'none';
        s.style.animation = 'none';
      }
    });
    current = idx;
    if (counter) counter.textContent = (idx + 1) + '/' + scenes.length;
  }

  // Controls
  const nav = document.createElement('div');
  nav.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;gap:12px;align-items:center;background:rgba(0,0,0,0.8);padding:8px 16px;border-radius:8px;font-family:system-ui;font-size:14px;color:#fff;';
  const prev = document.createElement('button');
  prev.textContent = '◀ Prev';
  prev.style.cssText = 'background:none;border:1px solid #666;color:#fff;padding:4px 12px;cursor:pointer;border-radius:4px;';
  prev.onclick = () => show((current - 1 + scenes.length) % scenes.length);
  const next = document.createElement('button');
  next.textContent = 'Next ▶';
  next.style.cssText = prev.style.cssText;
  next.onclick = () => show((current + 1) % scenes.length);
  const counter = document.createElement('span');
  const autoBtn = document.createElement('button');
  autoBtn.textContent = '▶ Play';
  autoBtn.style.cssText = prev.style.cssText;
  let timer = null;
  autoBtn.onclick = () => {
    if (timer) { clearInterval(timer); timer = null; autoBtn.textContent = '▶ Play'; }
    else { timer = setInterval(() => show((current + 1) % scenes.length), 2000); autoBtn.textContent = '⏸ Stop'; }
  };
  nav.append(prev, counter, next, autoBtn);
  document.body.appendChild(nav);

  show(0);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show((current + 1) % scenes.length);
    if (e.key === 'ArrowLeft') show((current - 1 + scenes.length) % scenes.length);
  });
})();
</script>
</body>
</html>`;
}

/** Infer cinematic composition from layout mode, element count, and scene position */
function inferComposition(layoutMode: string, isSparse: boolean, sceneIndex: number, totalScenes: number): string {
  // First and last scenes: centered (hook + CTA)
  if (sceneIndex === 0) return 'centered';
  if (sceneIndex === totalScenes - 1) return 'centered';
  // Card layouts: centered (cards fill the space)
  if (layoutMode.startsWith('card-')) return 'centered';
  if (layoutMode === 'split') return 'asymmetric-split';
  // Alternate compositions by scene index for variety
  const pool = ['off-center-focal', 'right-aligned', 'centered', 'bottom-anchored', 'top-anchored'];
  return pool[sceneIndex % pool.length];
}

/** Infer background animation type from scene characteristics and scene name */
function inferBgAnimation(layoutMode: string, elementCount: number, sceneIndex: number, mode?: string, totalScenes?: number, sceneName?: string): string {
  // Cocomelon: every scene gets a phase-appropriate bgAnimation (never 'none')
  if (mode === 'cocomelon' && totalScenes) {
    const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
    if (pos < 0.05) return 'vignette';            // Arrest: dramatic
    if (pos < 0.35) return 'gradient-drift';       // Escalate
    if (pos < 0.65) return sceneIndex % 2 === 0 ? 'particle-float' : 'grid-pulse'; // Climax: alternating
    if (pos < 0.95) return 'ambient-glow';         // Descend: calm
    return 'gradient-drift';                       // Convert
  }

  // First scene: vignette for focus
  if (sceneIndex === 0) return 'vignette';

  // Scene-type aware background animation (from scene name heuristic)
  const name = (sceneName ?? '').toLowerCase();
  if (name.includes('stat') || name.includes('insight')) return 'gradient-drift';
  if (name.includes('feature') || name.includes('detail')) return 'grid-pulse';
  if (name.includes('transform') || name.includes('before')) return 'gradient-drift';
  if (name.includes('proof') || name.includes('social')) return 'ambient-glow';
  if (name.includes('cta')) return 'gradient-drift';

  // Layout-based fallbacks
  if (layoutMode === 'card-grid') return 'particle-float';
  if (layoutMode === 'stacked' && elementCount >= 4) return 'grid-pulse';
  // Default: gradient-drift (more visible than vignette)
  return 'gradient-drift';
}

function addKeyframes(id: string, body: string, set: Set<string>, arr: string[]) {
  if (set.has(id)) return;
  set.add(id);
  arr.push(`@keyframes ${cssIdSafe(id)} { ${body} }`);
}

function cssIdSafe(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function generateSceneHTML(
  scene: TimelineScene,
  config: Config,
  profile: LayoutProfile,
  tokens?: DesignTokens,
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

  // Determine composition style: off-center for non-centered layouts with few elements
  const isSparse = scene.elements.length <= 2;
  const compositionId = inferComposition(layoutMode, isSparse, scene.sceneIndex, config.scenes?.length ?? 1);
  const isVert = profile.orientation === 'vertical';
  const compositionStyle = getCompositionCSS(compositionId, isVert);

  // Determine background animation from scene characteristics
  const bgAnimType = inferBgAnimation(layoutMode, scene.elements.length, scene.sceneIndex, config.video?.mode, config.scenes?.length, scene.scene.name);
  const bgAnimCSS = getBgAnimationCSS(bgAnimType);
  const accentColor = tokens?.colorAccent ?? tokens?.colorPrimary ?? '#6366f1';
  const depthLayerHtml = getDepthLayerHTML(bgAnimType, accentColor);

  const zIndex = `z-index: ${scene.sceneIndex + 1};`;

  // Extract animation value from bgAnimCSS and combine with scene-reveal
  // to avoid one overwriting the other
  const bgAnimMatch = bgAnimCSS.match(/animation:\s*([^;]+);/);
  const bgAnimValue = bgAnimMatch?.[1]?.trim() ?? '';
  const bgAnimOther = bgAnimCSS.replace(/animation:\s*[^;]+;/, '').trim().replace(/;+$/, '');
  const sceneRevealValue = scene.sceneIndex === 0
    ? ''
    : `scene-reveal 100ms ease ${scene.startMs}ms both`;
  const animParts = [bgAnimValue, sceneRevealValue].filter(Boolean);
  const combinedAnim = animParts.length > 0
    ? `animation: ${animParts.join(', ')};`
    : '';

  // Separate card elements from non-card elements
  const cardElements = scene.elements.filter(el =>
    el.element.type === 'card' || el.element.type === 'card-group'
  );
  const nonCardElements = scene.elements.filter(el =>
    el.element.type !== 'card' && el.element.type !== 'card-group'
  );

  // For card layouts, wrap cards in a container with grid columns
  const isCardLayout = layoutMode === 'card-column' || layoutMode === 'card-row' || layoutMode === 'card-grid';

  let elementsHtml: string;

  if (isCardLayout && cardElements.length > 0) {
    const nonCardHtml = nonCardElements.map(el => generateElementHTML(el, tokens)).join('\n      ');

    const cardHtml = cardElements.flatMap(el => generateCardElements(el, tokens)).join('\n        ');

    const gridCols = layoutMode === 'card-grid'
      ? `grid-template-columns: ${computeCardGridColumns(profile, cardElements.length)};`
      : '';

    elementsHtml = `${nonCardHtml}
      <div class="cards-container" style="${gridCols}">
        ${cardHtml}
      </div>`;
  } else {
    elementsHtml = scene.elements.map(el => generateElementHTML(el, tokens)).join('\n      ');
  }

  // Count visual elements (card-group expands into multiple cards)
  const visualCount = scene.elements.reduce((n, el) => {
    if (el.element.type === 'card-group') return n + (el.element.items?.length ?? 1);
    return n + 1;
  }, 0);
  const sparseClass = visualCount <= 2 ? ' sparse' : '';

  // Build @scene comment
  const sceneAttrs: string[] = [`name="${scene.scene.name}"`];
  if (scene.durationMs) sceneAttrs.push(`duration="${scene.durationMs}ms"`);
  if (scene.transitionOut) sceneAttrs.push(`transition-out="${scene.transitionOut.id}"`);
  if (scene.transitionOutDurationMs) sceneAttrs.push(`transition-duration="${scene.transitionOutDurationMs}ms"`);
  const sceneComment = `<!-- @scene ${sceneAttrs.join(' ')} -->`;

  // Store bg animation separately so preview controller can restore it
  const bgOnlyAnim = bgAnimValue ? `${bgAnimValue}` : '';

  return `  ${sceneComment}
  <div class="scene layout-${layoutMode}" id="scene-${scene.sceneIndex}" data-bg-anim="${bgOnlyAnim}" style="${bg}${bgAnimOther ? bgAnimOther + ';' : ''}${zIndex}${combinedAnim}">
    ${depthLayerHtml}
    <div class="scene-content${sparseClass}" style="${compositionStyle}">
      ${elementsHtml}
    </div>
  </div>`;
}

/** Generate card element(s) — card-group expands into multiple cards */
function generateCardElements(el: TimelineElement, tokens?: DesignTokens): string[] {
  const entranceName = cssIdSafe(el.entranceId);
  const delayMs = el.startMs;
  const dur = el.entranceDurationMs;
  const easing = el.easing;
  const cfg = el.element;

  const colorStyle = cfg.color ? `color: ${resolveToken(cfg.color, tokens)};` : '';
  const fontStyle = cfg.font ? `font-family: ${resolveToken(cfg.font, tokens)};` : '';
  const bgStyle = cfg.background ? `background: ${resolveToken(cfg.background, tokens)};` : '';
  const extraStyle = `${colorStyle}${fontStyle}${bgStyle}`;

  if (cfg.type === 'card-group') {
    const items = cfg.items ?? [];
    const staggerDelay = cfg['stagger-delay'] ? parseDurInline(String(cfg['stagger-delay'])) : 200;
    return items.map((item, i) => {
      const itemDelay = delayMs + (i * staggerDelay);
      const itemAnimStyle = `animation: ${entranceName} ${dur}ms ${easing} ${itemDelay}ms both;`;
      return `<div class="el el-card" style="${itemAnimStyle}${extraStyle}">
        ${item.icon ? `<div class="card-icon">${iconPlaceholder(item.icon)}</div>` : ''}
        ${item.title ? `<div class="card-title">${escapeHtml(item.title)}</div>` : ''}
        ${item.text ? `<div class="card-text">${escapeHtml(item.text)}</div>` : ''}
      </div>`;
    });
  }

  // Single card
  const animStyle = `animation: ${entranceName} ${dur}ms ${easing} ${delayMs}ms both;`;
  return [`<div class="el el-card" style="${animStyle}${extraStyle}">
    ${cfg.icon ? `<div class="card-icon">${iconPlaceholder(cfg.icon)}</div>` : ''}
    ${cfg.title ? `<div class="card-title">${escapeHtml(cfg.title)}</div>` : ''}
    ${cfg.text ? `<div class="card-text">${escapeHtml(cfg.text)}</div>` : ''}
  </div>`];
}

function generateElementHTML(el: TimelineElement, tokens?: DesignTokens): string {
  const entranceName = cssIdSafe(el.entranceId);
  const delayMs = el.startMs;
  const dur = el.entranceDurationMs;
  const easing = el.easing;
  const isContinuous = el.entranceDef.continuous === true;
  const fillOrLoop = isContinuous ? 'infinite' : 'both';

  let animStyle = `animation: ${entranceName} ${dur}ms ${easing} ${delayMs}ms ${fillOrLoop};`;

  if (el.exitId && el.exitDef && !isContinuous) {
    const exitName = cssIdSafe(el.exitId);
    const exitDelay = el.startMs + el.entranceDurationMs + el.holdMs;
    animStyle = `animation: ${entranceName} ${dur}ms ${easing} ${delayMs}ms both, ${exitName} ${el.exitDurationMs}ms ${easing} ${exitDelay}ms forwards;`;
  }

  // Multi-phase rendering: stack multiple divs with sequential entrance/exit timing
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
      return `<div class="el el-heading size-${size}" style="${animStyle}${extraStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
    }
    case 'text':
      return `<div class="el el-text" style="${animStyle}${extraStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
    case 'button':
      return `<div class="el el-button" style="${animStyle}${extraStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
    case 'image':
      return `<div class="el el-image" style="${animStyle}"><img src="${escapeHtml(cfg.src ?? '')}" alt=""></div>`;
    case 'divider':
      return `<div class="el el-divider" style="${animStyle}"></div>`;
    case 'card':
      return `<div class="el el-card" style="${animStyle}${extraStyle}">
        ${cfg.icon ? `<div class="card-icon">${iconPlaceholder(cfg.icon)}</div>` : ''}
        ${cfg.title ? `<div class="card-title">${escapeHtml(cfg.title)}</div>` : ''}
        ${cfg.text ? `<div class="card-text">${escapeHtml(cfg.text)}</div>` : ''}
      </div>`;
    case 'card-group': {
      const items = cfg.items ?? [];
      const staggerDelay = cfg['stagger-delay'] ? parseDurInline(String(cfg['stagger-delay'])) : 200;
      return items.map((item, i) => {
        const itemDelay = delayMs + (i * staggerDelay);
        const itemAnimStyle = `animation: ${entranceName} ${dur}ms ${easing} ${itemDelay}ms both;`;
        return `<div class="el el-card" style="${itemAnimStyle}${extraStyle}">
          ${item.icon ? `<div class="card-icon">${iconPlaceholder(item.icon)}</div>` : ''}
          ${item.title ? `<div class="card-title">${escapeHtml(item.title)}</div>` : ''}
          ${item.text ? `<div class="card-text">${escapeHtml(item.text)}</div>` : ''}
        </div>`;
      }).join('\n      ');
    }
    default:
      return `<div class="el" style="${animStyle}">${escapeHtml(cfg.text ?? '')}</div>`;
  }
}

/**
 * Multi-phase element: renders N stacked divs, each with its own entrance/exit timing.
 * Phase N exits as Phase N+1 enters, creating a text-swap effect.
 */
function generateMultiPhaseHTML(
  el: TimelineElement,
  phases: Array<{ entrance?: string; delay?: string | number; duration?: string | number; text?: string; size?: string }>,
  tokens?: DesignTokens,
): string {
  const baseDelay = el.startMs;
  const cfg = el.element;
  const colorStyle = cfg.color ? `color: ${resolveToken(cfg.color, tokens)};` : '';
  const fontStyle = cfg.font ? `font-family: ${resolveToken(cfg.font, tokens)};` : '';
  const bgStyle = cfg.background ? `background: ${resolveToken(cfg.background, tokens)};` : '';
  const extraStyle = `${colorStyle}${fontStyle}${bgStyle}`;

  const size = cfg.size ?? 'lg';
  const baseText = cfg.text ?? '';
  let cursor = baseDelay;
  const phaseDivs: string[] = [];

  // Phase 0: the base element (entrance only, exits when phase 1 starts)
  const phase0Entrance = cssIdSafe(el.entranceId);
  const phase0Dur = el.entranceDurationMs;
  const easing = el.easing;

  for (let pi = 0; pi < phases.length; pi++) {
    const phase = phases[pi];
    const phaseText = phase.text ?? baseText;
    const phaseSize = phase.size ?? size;
    const phaseEntrance = phase.entrance ? cssIdSafe(phase.entrance) : phase0Entrance;
    const phaseDur = phase.duration ? parseDurInline(String(phase.duration)) : phase0Dur;
    const phaseDelay = phase.delay ? parseDurInline(String(phase.delay)) : 0;

    const enterTime = cursor + phaseDelay;
    // Default hold: 1500ms per phase unless it's the last phase
    const holdTime = pi < phases.length - 1 ? 1500 : 0;
    const exitTime = enterTime + phaseDur + holdTime;

    let animParts = `${phaseEntrance} ${phaseDur}ms ${easing} ${enterTime}ms both`;
    if (pi < phases.length - 1) {
      // Exit before next phase
      animParts += `, fade-out ${300}ms ${easing} ${exitTime}ms forwards`;
    }

    phaseDivs.push(
      `<div class="el el-heading size-${phaseSize}" style="position:absolute;animation:${animParts};${extraStyle}">${escapeHtml(phaseText)}</div>`
    );

    cursor = exitTime;
  }

  // Wrap in a relative container
  return `<div class="el" style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;min-height:1.2em;">
      ${phaseDivs.join('\n      ')}
    </div>`;
}

function parseDurInline(str: string): number {
  if (str.endsWith('ms')) return parseFloat(str);
  if (str.endsWith('s')) return parseFloat(str) * 1000;
  return parseFloat(str);
}

function resolveToken(value: string, tokens?: DesignTokens): string {
  if (!value.startsWith('--')) return value;
  return `var(${value})`;
}

function iconPlaceholder(icon: string): string {
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
  // Named palette colors
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

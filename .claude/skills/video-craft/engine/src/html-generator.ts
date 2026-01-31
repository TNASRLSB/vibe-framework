// Generates a self-contained HTML page from a timeline
// CSS values are driven by layout profiles — no hardcoded dimensions
// Layout philosophy: elements FILL the frame, not cluster at center

import type { Timeline, TimelineScene, TimelineElement } from './timeline.js';
import type { Config } from './config.js';
import { FORMAT_PRESETS } from './presets.js';
import { ENTRANCES, EXITS } from './actions.js';
import type { DesignTokens } from './ux-bridge.js';
import {
  getLayoutProfile, autoSelectLayout, computeCardGridColumns,
  type LayoutProfile, type LayoutMode, type ElementInfo,
} from './layout-profiles.js';

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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

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

/* ═══════════════════════════════════════════
   ELEMENT STYLES
   ═══════════════════════════════════════════ */

.el { max-width: 100%; }

.el-heading {
  font-family: var(--font-display, var(--font-body, system-ui));
  font-weight: 800;
  line-height: 1.1;
}
.el-heading.size-sm { font-size: ${p.headingScale.sm}px; }
.el-heading.size-md { font-size: ${p.headingScale.md}px; }
.el-heading.size-lg { font-size: ${p.headingScale.lg}px; }
.el-heading.size-xl { font-size: ${p.headingScale.xl}px; }
.el-heading.size-2xl { font-size: ${p.headingScale['2xl']}px; }

.el-text {
  font-size: ${p.textSize}px;
  line-height: ${p.textLineHeight};
  opacity: 0.85;
  max-width: ${isVert ? '95%' : '80%'};
}

.el-button {
  display: inline-block;
  padding: ${p.buttonPadding.v}px ${p.buttonPadding.h}px;
  background: var(--color-accent, #e94560);
  color: var(--color-on-accent, #ffffff);
  font-size: ${p.buttonSize}px;
  font-weight: 700;
  border-radius: ${p.buttonRadius}px;
  border: none;
}

.el-card {
  background: var(--color-surface, rgba(255,255,255,0.08));
  border-radius: ${p.cardRadius}px;
  padding: ${p.cardPadding}px;
  ${p.cardMinWidth > 0 ? `min-width: ${p.cardMinWidth}px;` : ''}
  ${p.cardMaxWidth < 9000 ? `max-width: ${p.cardMaxWidth}px;` : ''}
  text-align: center;
  width: 100%;
}

/* In card-row layout, cards share space */
.scene.layout-card-row .el-card {
  flex: 1 1 0;
  ${p.cardMinWidth > 0 ? `min-width: ${p.cardMinWidth}px;` : ''}
  ${p.cardMaxWidth < 9000 ? `max-width: ${p.cardMaxWidth}px;` : 'max-width: 400px;'}
}

.el-card .card-icon { font-size: ${p.cardIconSize}px; margin-bottom: 12px; }
.el-card .card-title { font-size: ${p.cardTitleSize}px; font-weight: 700; margin-bottom: 8px; }
.el-card .card-text { font-size: ${p.cardTextSize}px; opacity: 0.8; line-height: 1.4; }

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
</style>
</head>
<body>
${scenesHtml}
</body>
</html>`;
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

  const bg = scene.scene.background
    ? `background: ${resolveToken(scene.scene.background, tokens)};`
    : '';

  const zIndex = `z-index: ${scene.sceneIndex + 1};`;
  const sceneAnim = scene.sceneIndex === 0
    ? ''
    : `animation: scene-reveal 100ms ease ${scene.startMs}ms both;`;

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

  return `  <div class="scene layout-${layoutMode}" id="scene-${scene.sceneIndex}" style="${bg}${zIndex}${sceneAnim}">
    <div class="scene-content">
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

  let animStyle = `animation: ${entranceName} ${dur}ms ${easing} ${delayMs}ms both;`;

  if (el.exitId && el.exitDef) {
    const exitName = cssIdSafe(el.exitId);
    const exitDelay = el.startMs + el.entranceDurationMs + el.holdMs;
    animStyle = `animation: ${entranceName} ${dur}ms ${easing} ${delayMs}ms both, ${exitName} ${el.exitDurationMs}ms ${easing} ${exitDelay}ms forwards;`;
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

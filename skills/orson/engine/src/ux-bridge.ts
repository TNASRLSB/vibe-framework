// Reads seurat design tokens from tokens.css (or legacy system.md)

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

export interface DesignTokens {
  fontDisplay?: string;
  fontBody?: string;
  colorPrimary?: string;
  colorAccent?: string;
  colorBg?: string;
  colorText?: string;
  colorSurface?: string;
  colorOnPrimary?: string;
  colorOnAccent?: string;
  transitionEasing?: string;
  transitionDuration?: string;
  // Spacing scale
  spaceBase?: number;        // base unit in px (default 4)
  spaceScale?: number[];     // multipliers [1,2,3,4,6,8,12,16,24,32]
  // Typography scale
  fontSizeBase?: number;     // base font size in px (default 16)
  fontScaleRatio?: number;   // modular scale ratio (default 1.25)
  lineHeight?: number;       // body line height (default 1.5)
  // Motion tokens
  motionEaseEntrance?: string;
  motionEaseExit?: string;
  motionEaseStandard?: string;
  motionDurationBase?: number; // base duration in ms (default 300)
  // Visual style tokens
  borderRadius?: number;       // border-radius in px (0 for brutalist)
  borderWidth?: number;        // border width in px
  borderColor?: string;
  textTransform?: string;      // e.g. 'uppercase'
  letterSpacing?: string;      // e.g. '-0.03em'
  letterSpacingWide?: string;  // e.g. '0.08em'
  fontWeight?: number;         // heading weight
  // Named palette colors (jewel tones, brand colors, etc.)
  namedColors?: { name: string; value: string }[];
  // Font URLs for Google Fonts loading
  fontUrls?: string[];
  // Advanced typography
  /** Variable font settings (e.g., "'wght' 800, 'wdth' 100") */
  fontVariationSettings?: string;
  /** Display heading line-height (default: 1.1) */
  headingLineHeight?: number;
  /** Auto-negative tracking for large display text (e.g., '-0.04em') */
  trackingDisplay?: string;
}

/** Resolve a DS path: accepts a file or a directory (searches for tokens.css first, then legacy system.md) */
function resolveDesignSystemPath(inputPath: string): string | null {
  if (!existsSync(inputPath)) return null;
  if (!statSync(inputPath).isDirectory()) return inputPath;
  // Directory: look for known DS files (prefer tokens.css over legacy system.md)
  for (const name of ['tokens.css', 'system.md']) {
    const candidate = join(inputPath, name);
    if (existsSync(candidate)) return candidate;
  }
  // Also check .seurat/ subdirectory
  for (const name of ['tokens.css', 'system.md']) {
    const candidate = join(inputPath, '.seurat', name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function readDesignTokens(systemMdPath: string): DesignTokens | null {
  const resolved = resolveDesignSystemPath(systemMdPath);
  if (!resolved) return null;

  const content = readFileSync(resolved, 'utf-8');
  const tokens: DesignTokens = {};

  // Step 1: Build a map of ALL custom properties defined in the file
  const propMap = new Map<string, string>();
  const propRegex = /--([\w-]+):\s*(.+?)(?:;|\n|$)/g;
  let m: RegExpExecArray | null;
  while ((m = propRegex.exec(content)) !== null) {
    const name = m[1].trim();
    const value = m[2].trim();
    // Keep first definition (later duplicates are usually overrides in media queries)
    if (!propMap.has(name)) {
      propMap.set(name, value);
    }
  }

  // Step 2: Resolve var() references within the map (one level deep)
  function resolve(value: string): string {
    const varMatch = value.match(/^var\(--([\w-]+)\)$/);
    if (varMatch) {
      const resolved = propMap.get(varMatch[1]);
      if (resolved && !resolved.startsWith('var(')) return resolved;
    }
    return value;
  }

  function get(name: string): string | undefined {
    const raw = propMap.get(name);
    return raw ? resolve(raw) : undefined;
  }

  // Step 3: Extract known tokens with var() resolution
  tokens.fontDisplay = get('font-display');
  tokens.fontBody = get('font-body');
  tokens.colorPrimary = get('color-primary');
  tokens.colorAccent = get('color-accent');
  tokens.colorBg = get('color-bg') ?? get('color-background');
  tokens.colorText = get('color-text');
  tokens.colorSurface = get('color-surface');
  tokens.colorOnPrimary = get('color-on-primary');
  tokens.colorOnAccent = get('color-on-accent');
  tokens.transitionEasing = get('transition-easing');
  tokens.transitionDuration = get('transition-duration');

  // Step 4: If no --color-primary, pick the first named color token as primary
  // (common in DS that use named palettes like ruby, sapphire, brand, etc.)
  if (!tokens.colorPrimary) {
    const colorNames = ['color-ruby', 'color-sapphire', 'color-brand', 'color-emerald',
      'color-amethyst', 'color-indigo', 'color-blue', 'color-red', 'color-green'];
    for (const name of colorNames) {
      const val = get(name);
      if (val) { tokens.colorPrimary = val; break; }
    }
  }

  // Spacing
  const spaceBaseStr = get('space-base');
  if (spaceBaseStr) tokens.spaceBase = parseFloat(spaceBaseStr);

  // Typography
  const fontSizeBaseStr = get('font-size-base');
  if (fontSizeBaseStr) tokens.fontSizeBase = parseFloat(fontSizeBaseStr);
  const scaleRatioStr = get('font-scale-ratio');
  if (scaleRatioStr) tokens.fontScaleRatio = parseFloat(scaleRatioStr);
  const lineHeightStr = get('line-height') ?? get('leading-normal');
  if (lineHeightStr) tokens.lineHeight = parseFloat(lineHeightStr);

  // Motion
  tokens.motionEaseEntrance = get('ease-entrance');
  tokens.motionEaseExit = get('ease-exit');
  tokens.motionEaseStandard = get('ease-standard') ?? get('ease');
  const durationBaseStr = get('duration-base');
  if (durationBaseStr) tokens.motionDurationBase = parseFloat(durationBaseStr);

  // Visual style
  const radiusStr = get('radius');
  if (radiusStr !== undefined) tokens.borderRadius = parseFloat(radiusStr);
  const borderBrutal = propMap.get('border-brutal');
  if (borderBrutal) {
    const widthMatch = borderBrutal.match(/(\d+)px/);
    if (widthMatch) tokens.borderWidth = parseInt(widthMatch[1]);
    tokens.borderColor = get('color-border');
  } else {
    const borderThick = propMap.get('border-thick');
    if (borderThick) {
      const widthMatch = borderThick.match(/(\d+)px/);
      if (widthMatch) tokens.borderWidth = parseInt(widthMatch[1]);
      tokens.borderColor = get('color-border');
    }
  }

  // Text transform and letter-spacing (from heading patterns)
  // Check for text-transform in the content (common in brutalist DS)
  if (content.includes('text-transform: uppercase')) tokens.textTransform = 'uppercase';
  tokens.letterSpacing = get('tracking-tight');
  tokens.letterSpacingWide = get('tracking-wide');

  // Font weight
  const weightBold = get('weight-bold');
  if (weightBold) tokens.fontWeight = parseInt(weightBold);

  // Advanced typography
  const fontVariation = get('font-variation-settings');
  if (fontVariation) tokens.fontVariationSettings = fontVariation;
  const headingLH = get('heading-line-height') ?? get('leading-heading');
  if (headingLH) tokens.headingLineHeight = parseFloat(headingLH);
  const trackingDisplay = get('tracking-display') ?? get('tracking-tighter');
  if (trackingDisplay) tokens.trackingDisplay = trackingDisplay;

  // Collect all named color tokens (jewel tones, brand colors)
  const namedColors: { name: string; value: string }[] = [];
  const colorPrefixes = ['color-ruby', 'color-emerald', 'color-sapphire', 'color-amethyst',
    'color-topaz', 'color-onyx', 'color-brand', 'color-indigo', 'color-coral',
    'color-teal', 'color-gold', 'color-crimson', 'color-azure', 'color-violet'];
  for (const name of colorPrefixes) {
    const val = get(name);
    if (val) namedColors.push({ name: name.replace('color-', ''), value: val });
  }
  if (namedColors.length > 0) tokens.namedColors = namedColors;

  // Build Google Fonts URLs from font families
  const fontUrls: string[] = [];
  const fonts = new Set<string>();
  for (const f of [tokens.fontDisplay, tokens.fontBody]) {
    if (f) {
      // Extract first font name (before comma)
      const fontName = f.split(',')[0].trim().replace(/"/g, '');
      if (fontName && !fontName.startsWith('system') && !fontName.startsWith('-apple')) {
        fonts.add(fontName);
      }
    }
  }
  // Also check for mono font
  const fontMono = get('font-mono');
  if (fontMono) {
    const monoName = fontMono.split(',')[0].trim().replace(/"/g, '');
    if (monoName && !monoName.startsWith('system') && !monoName.startsWith('-apple')) {
      fonts.add(monoName);
    }
  }
  if (fonts.size > 0) {
    const families = Array.from(fonts).map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;500;700;800`);
    fontUrls.push(`https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`);
    tokens.fontUrls = fontUrls;
  }

  return tokens;
}

// ─── Style Hints from style.css ──────────────────────────────

export interface StyleHints {
  /** Dominant visual style detected */
  visualStyle: 'brutalist' | 'glassmorphism' | 'flat' | 'neumorphism' | 'generic';
  /** Card styling hints */
  cardBorderRadius?: string;
  cardBoxShadow?: string;
  cardBackdropFilter?: string;
  cardBorder?: string;
  /** Whether uppercase headings are used */
  uppercaseHeadings: boolean;
  /** Whether grid overlays or asymmetric grids are used */
  hasGridOverlay: boolean;
  /** Whether rotated elements exist */
  hasRotation: boolean;
}

/**
 * Extract visual identity hints from style.css to match webvideo styling.
 * Does not parse full CSS — detects dominant patterns via regex.
 */
export function readStyleHints(dsPath: string): StyleHints | null {
  // Find style.css near the tokens path
  const dir = statSync(dsPath).isDirectory() ? dsPath : dsPath.replace(/[/\\][^/\\]+$/, '');
  let stylePath: string | null = null;
  for (const candidate of [
    join(dir, 'style.css'),
    join(dir, '.seurat', 'style.css'),
  ]) {
    if (existsSync(candidate)) { stylePath = candidate; break; }
  }
  if (!stylePath) return null;

  const css = readFileSync(stylePath, 'utf-8');
  const hints: StyleHints = {
    visualStyle: 'generic',
    uppercaseHeadings: false,
    hasGridOverlay: false,
    hasRotation: false,
  };

  // Detect dominant style
  const hasBigBorders = /border:\s*\d{2,}px/.test(css) || /border-width:\s*[3-9]px/.test(css);
  const hasRotation = /transform:.*rotate\(/.test(css);
  const hasBackdropBlur = /backdrop-filter:\s*blur/.test(css);
  const hasBigRadius = /border-radius:\s*(\d+)/.test(css) && parseInt(css.match(/border-radius:\s*(\d+)/)![1]) > 16;
  const hasInsetShadow = /box-shadow:\s*inset/.test(css);

  if (hasBigBorders || hasRotation) {
    hints.visualStyle = 'brutalist';
  } else if (hasBackdropBlur && hasBigRadius) {
    hints.visualStyle = 'glassmorphism';
  } else if (hasInsetShadow && hasBigRadius) {
    hints.visualStyle = 'neumorphism';
  } else if (!hasBigRadius && !hasBackdropBlur) {
    hints.visualStyle = 'flat';
  }

  hints.hasRotation = hasRotation;
  hints.hasGridOverlay = /grid-template-columns:.*repeat\(\s*1[2-9]/.test(css);
  hints.uppercaseHeadings = /text-transform:\s*uppercase/.test(css);

  // Extract card styles (look for .card or [class*="card"])
  const cardBlock = css.match(/\.card\s*\{([^}]+)\}/);
  if (cardBlock) {
    const block = cardBlock[1];
    const radiusMatch = block.match(/border-radius:\s*([^;]+)/);
    if (radiusMatch) hints.cardBorderRadius = radiusMatch[1].trim();
    const shadowMatch = block.match(/box-shadow:\s*([^;]+)/);
    if (shadowMatch) hints.cardBoxShadow = shadowMatch[1].trim();
    const bdMatch = block.match(/backdrop-filter:\s*([^;]+)/);
    if (bdMatch) hints.cardBackdropFilter = bdMatch[1].trim();
    const borderMatch = block.match(/border:\s*([^;]+)/);
    if (borderMatch) hints.cardBorder = borderMatch[1].trim();
  }

  return hints;
}

/**
 * Convert design tokens into an ordered color array for video composition.
 * Order: [primary, accent, bg, surface] — used by selectBackground().
 */
export function mapTokensToVideoColors(tokens: DesignTokens): string[] {
  const colors: string[] = [];
  if (tokens.colorPrimary) colors.push(tokens.colorPrimary);
  if (tokens.colorAccent) colors.push(tokens.colorAccent);
  if (tokens.colorBg) colors.push(tokens.colorBg);
  if (tokens.colorSurface) colors.push(tokens.colorSurface);
  return colors;
}

/**
 * Map design system motion tokens to video animation easing.
 * If the design system defines custom easing, video animations should
 * share the same "personality" of movement.
 */
export function mapTokensToMotion(tokens: DesignTokens): {
  entranceEasing: string;
  exitEasing: string;
  standardEasing: string;
  baseDurationMs: number;
} {
  return {
    entranceEasing: tokens.motionEaseEntrance ?? 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    exitEasing: tokens.motionEaseExit ?? 'cubic-bezier(0.4, 0.0, 1, 1)',
    standardEasing: tokens.motionEaseStandard ?? 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    baseDurationMs: tokens.motionDurationBase ?? 300,
  };
}

/**
 * Map design system spacing to video element spacing.
 * Returns spacing values in px for use in video scene layouts.
 */
export function mapTokensToSpacing(tokens: DesignTokens): {
  base: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
} {
  const base = tokens.spaceBase ?? 4;
  return {
    base,
    small: base * 2,   // 8px
    medium: base * 4,   // 16px
    large: base * 8,    // 32px
    xlarge: base * 16,  // 64px
  };
}

/**
 * Map design system typography scale to video heading sizes.
 */
export function mapTokensToTypography(tokens: DesignTokens): {
  body: number;
  h3: number;
  h2: number;
  h1: number;
  display: number;
} {
  const base = tokens.fontSizeBase ?? 16;
  const ratio = tokens.fontScaleRatio ?? 1.25;
  return {
    body: base,
    h3: Math.round(base * ratio),
    h2: Math.round(base * ratio * ratio),
    h1: Math.round(base * ratio * ratio * ratio),
    display: Math.round(base * ratio * ratio * ratio * ratio),
  };
}

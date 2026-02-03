// Copy-Brief: intermediate document between content extraction and HTML generation.
// Defines narrative structure, space constraints, and raw/revised copy for each scene.

import { getLayoutProfile, type LayoutProfile, type Size } from './layout-profiles.js';
import { FORMAT_PRESETS } from './presets.js';

// ─── Types ──────────────────────────────────────────────────

export interface CopyBrief {
  meta: {
    projectName: string;
    format: string;
    mode: string;
    speed: string;
    narrativePattern: string;
    generatedAt: string;
  };

  designTokens?: {
    colors: string[];
    fonts: string[];
  };

  scenes: CopyBriefScene[];
}

export interface CopyBriefScene {
  index: number;
  sceneTypeId: string;
  name: string;
  layout: string;
  durationMs: number;
  transitionOut?: string;

  constraints: SceneConstraints;
  elements: CopyBriefElement[];
}

export interface SceneConstraints {
  maxElements: number;
  heading: {
    maxChars: number;
    size: string;
  };
  text: {
    maxChars: number;
    maxLines: number;
  };
  card?: CardConstraints;
}

export interface CardConstraints {
  maxCards: number;
  titleMaxChars: number;
  textMaxChars: number;
  layout: string;
}

export interface CopyBriefElement {
  type: string;
  rawText?: string;
  copy?: string;
  size?: string;
  items?: CopyBriefCardItem[];
}

export interface CopyBriefCardItem {
  icon: string;
  rawTitle: string;
  rawText?: string;
  copyTitle?: string;
  copyText?: string;
}

// ─── Constraint Computation ─────────────────────────────────

/**
 * Compute space constraints for a scene based on format profile and layout.
 * These constraints tell copywriters (or /seo-geo-copy) exactly how many
 * characters fit in each slot.
 */
export function computeConstraints(
  format: string,
  headingSize: Size,
  cardCount: number,
): SceneConstraints {
  const profile = getLayoutProfile(format);
  const preset = FORMAT_PRESETS[format];
  const frameWidth = preset?.width ?? 1920;

  const usableWidth = frameWidth - profile.padding.left - profile.padding.right;
  const contentWidthPct = parseFloat(profile.elementMaxWidth) / 100;
  const contentWidth = usableWidth * contentWidthPct;

  // Heading: approximate char count from font-size × width
  // Rule of thumb: ~0.55 char-width ratio for bold sans-serif
  const headingFontPx = profile.headingScale[headingSize];
  const headingCharsPerLine = Math.floor(contentWidth / (headingFontPx * 0.55));
  const headingMaxLines = 3; // CSS: -webkit-line-clamp: 3
  const headingMaxChars = headingCharsPerLine * headingMaxLines;

  // Text: smaller font, narrower container (80% of content width on horizontal)
  const textWidthFactor = profile.orientation === 'vertical' ? 0.95 : 0.8;
  const textWidth = contentWidth * textWidthFactor;
  const textCharsPerLine = Math.floor(textWidth / (profile.textSize * 0.5));
  const textMaxLines = 4; // CSS: -webkit-line-clamp: 4
  const textMaxChars = textCharsPerLine * textMaxLines;

  // Card constraints (only if cards present)
  let card: CardConstraints | undefined;

  if (cardCount > 0) {
    const effectiveMaxCards = Math.min(cardCount, profile.maxCardsPerRow);
    const cardWidth = (contentWidth - (effectiveMaxCards - 1) * profile.cardGap) / effectiveMaxCards;
    const cardContentWidth = cardWidth - profile.cardPadding * 2;

    card = {
      maxCards: effectiveMaxCards,
      titleMaxChars: Math.floor(cardContentWidth / (profile.cardTitleSize * 0.55)),
      textMaxChars: Math.floor(cardContentWidth / (profile.cardTextSize * 0.5)) * 3, // 3 lines
      layout: effectiveMaxCards <= profile.maxCardsPerRow ? 'row' : `grid-${effectiveMaxCards}col`,
    };
  }

  return {
    maxElements: profile.maxElementsPerScene,
    heading: { maxChars: headingMaxChars, size: headingSize },
    text: { maxChars: textMaxChars, maxLines: textMaxLines },
    card,
  };
}

// ─── Brief Helpers ──────────────────────────────────────────

/**
 * Resolve copy text from a brief element: prefers `copy` over `rawText`.
 */
export function resolveCopy(element: CopyBriefElement): string {
  return element.copy ?? element.rawText ?? '';
}

/**
 * Resolve card item text: prefers copyTitle/copyText over raw versions.
 */
export function resolveCardCopy(item: CopyBriefCardItem): { title: string; text?: string } {
  return {
    title: item.copyTitle ?? item.rawTitle,
    text: item.copyText ?? item.rawText,
  };
}

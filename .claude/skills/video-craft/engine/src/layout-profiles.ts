// Format-aware layout profiles
// Each video format has a profile that controls spacing, typography, card layout, etc.

import type { FormatPreset } from './presets.js';
import { FORMAT_PRESETS } from './presets.js';

export type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CardLayout = 'column' | 'row' | 'grid-2col' | 'grid-3col' | 'grid-4col';
export type Orientation = 'vertical' | 'horizontal' | 'square';

export interface LayoutProfile {
  orientation: Orientation;

  // Scene spacing
  padding: { top: number; right: number; bottom: number; left: number };
  gap: number;

  // Typography scale
  headingScale: Record<Size, number>;
  textSize: number;
  textLineHeight: number;
  buttonSize: number;
  buttonPadding: { v: number; h: number };
  buttonRadius: number;

  // Cards
  cardMinWidth: number;
  cardMaxWidth: number;
  cardPadding: number;
  cardRadius: number;
  cardIconSize: number;
  cardTitleSize: number;
  cardTextSize: number;
  cardGap: number;

  // Layout rules
  preferredCardLayout: CardLayout;
  maxCardsPerRow: number;
  maxElementsPerScene: number;

  // Divider
  dividerWidth: number;
  dividerHeight: number;

  // Image
  imageMaxHeight: string; // CSS value like '50vh'
  imageRadius: number;

  // Element max width (% of scene)
  elementMaxWidth: string; // CSS value like '90%'
}

// ─── Profiles ────────────────────────────────────────────────

const VERTICAL_9x16: LayoutProfile = {
  orientation: 'vertical',
  padding: { top: 100, right: 52, bottom: 100, left: 52 },
  gap: 52,
  headingScale: { sm: 56, md: 72, lg: 92, xl: 116, '2xl': 144 },
  textSize: 44,
  textLineHeight: 1.4,
  buttonSize: 40,
  buttonPadding: { v: 36, h: 80 },
  buttonRadius: 20,
  cardMinWidth: 0,
  cardMaxWidth: 9999, // full width
  cardPadding: 52,
  cardRadius: 24,
  cardIconSize: 96,
  cardTitleSize: 44,
  cardTextSize: 34,
  cardGap: 28,
  preferredCardLayout: 'column',
  maxCardsPerRow: 1,
  maxElementsPerScene: 4,
  dividerWidth: 100,
  dividerHeight: 6,
  imageMaxHeight: '45vh',
  imageRadius: 16,
  elementMaxWidth: '96%',
};

const VERTICAL_4x5: LayoutProfile = {
  orientation: 'vertical',
  padding: { top: 64, right: 48, bottom: 64, left: 48 },
  gap: 24,
  headingScale: { sm: 30, md: 40, lg: 52, xl: 64, '2xl': 76 },
  textSize: 24,
  textLineHeight: 1.45,
  buttonSize: 22,
  buttonPadding: { v: 16, h: 40 },
  buttonRadius: 12,
  cardMinWidth: 0,
  cardMaxWidth: 460,
  cardPadding: 24,
  cardRadius: 14,
  cardIconSize: 32,
  cardTitleSize: 20,
  cardTextSize: 15,
  cardGap: 16,
  preferredCardLayout: 'grid-2col',
  maxCardsPerRow: 2,
  maxElementsPerScene: 5,
  dividerWidth: 56,
  dividerHeight: 4,
  imageMaxHeight: '40vh',
  imageRadius: 12,
  elementMaxWidth: '90%',
};

const SQUARE_1x1: LayoutProfile = {
  orientation: 'square',
  padding: { top: 48, right: 40, bottom: 48, left: 40 },
  gap: 16,
  headingScale: { sm: 26, md: 34, lg: 44, xl: 56, '2xl': 64 },
  textSize: 20,
  textLineHeight: 1.4,
  buttonSize: 18,
  buttonPadding: { v: 14, h: 36 },
  buttonRadius: 10,
  cardMinWidth: 0,
  cardMaxWidth: 420,
  cardPadding: 20,
  cardRadius: 12,
  cardIconSize: 28,
  cardTitleSize: 18,
  cardTextSize: 14,
  cardGap: 12,
  preferredCardLayout: 'grid-2col',
  maxCardsPerRow: 2,
  maxElementsPerScene: 4,
  dividerWidth: 48,
  dividerHeight: 3,
  imageMaxHeight: '40vh',
  imageRadius: 10,
  elementMaxWidth: '92%',
};

const HORIZONTAL_16x9: LayoutProfile = {
  orientation: 'horizontal',
  padding: { top: 60, right: 100, bottom: 60, left: 100 },
  gap: 36,
  headingScale: { sm: 40, md: 56, lg: 72, xl: 92, '2xl': 112 },
  textSize: 34,
  textLineHeight: 1.45,
  buttonSize: 30,
  buttonPadding: { v: 24, h: 60 },
  buttonRadius: 14,
  cardMinWidth: 280,
  cardMaxWidth: 480,
  cardPadding: 40,
  cardRadius: 20,
  cardIconSize: 52,
  cardTitleSize: 30,
  cardTextSize: 22,
  cardGap: 32,
  preferredCardLayout: 'row',
  maxCardsPerRow: 3,
  maxElementsPerScene: 6,
  dividerWidth: 80,
  dividerHeight: 5,
  imageMaxHeight: '60vh',
  imageRadius: 14,
  elementMaxWidth: '90%',
};

const HORIZONTAL_4x3: LayoutProfile = {
  orientation: 'horizontal',
  padding: { top: 72, right: 96, bottom: 72, left: 96 },
  gap: 24,
  headingScale: { sm: 30, md: 42, lg: 54, xl: 68, '2xl': 80 },
  textSize: 24,
  textLineHeight: 1.5,
  buttonSize: 22,
  buttonPadding: { v: 16, h: 44 },
  buttonRadius: 12,
  cardMinWidth: 180,
  cardMaxWidth: 340,
  cardPadding: 24,
  cardRadius: 14,
  cardIconSize: 32,
  cardTitleSize: 20,
  cardTextSize: 14,
  cardGap: 20,
  preferredCardLayout: 'row',
  maxCardsPerRow: 3,
  maxElementsPerScene: 5,
  dividerWidth: 64,
  dividerHeight: 4,
  imageMaxHeight: '50vh',
  imageRadius: 12,
  elementMaxWidth: '85%',
};

const CINEMA_21x9: LayoutProfile = {
  orientation: 'horizontal',
  padding: { top: 60, right: 200, bottom: 60, left: 200 },
  gap: 24,
  headingScale: { sm: 28, md: 38, lg: 50, xl: 64, '2xl': 76 },
  textSize: 22,
  textLineHeight: 1.5,
  buttonSize: 20,
  buttonPadding: { v: 16, h: 44 },
  buttonRadius: 10,
  cardMinWidth: 220,
  cardMaxWidth: 400,
  cardPadding: 28,
  cardRadius: 16,
  cardIconSize: 32,
  cardTitleSize: 20,
  cardTextSize: 14,
  cardGap: 28,
  preferredCardLayout: 'grid-4col',
  maxCardsPerRow: 4,
  maxElementsPerScene: 8,
  dividerWidth: 80,
  dividerHeight: 4,
  imageMaxHeight: '60vh',
  imageRadius: 12,
  elementMaxWidth: '80%',
};

const PROFILES: Record<string, LayoutProfile> = {
  'vertical-9x16': VERTICAL_9x16,
  'vertical-4x5': VERTICAL_4x5,
  'square-1x1': SQUARE_1x1,
  'horizontal-16x9': HORIZONTAL_16x9,
  'horizontal-4x3': HORIZONTAL_4x3,
  'cinema-21x9': CINEMA_21x9,
};

export function getLayoutProfile(format: string): LayoutProfile {
  return PROFILES[format] ?? VERTICAL_9x16;
}

// ─── Auto-layout selection ───────────────────────────────────

export type LayoutMode = 'hero' | 'centered' | 'stacked' | 'split' | 'card-column' | 'card-row' | 'card-grid' | 'fullscreen-text';

export interface ElementInfo {
  type: string;
  isCard: boolean;
}

/**
 * Automatically pick the best layout mode for a scene
 * based on the format profile and the elements in the scene.
 */
export function autoSelectLayout(
  profile: LayoutProfile,
  elements: ElementInfo[],
  explicitLayout?: string,
): LayoutMode {
  // Explicit override always wins
  if (explicitLayout) {
    const map: Record<string, LayoutMode> = {
      'hero': 'hero',
      'centered': 'centered',
      'stacked': 'stacked',
      'split': 'split',
      'grid': profile.orientation === 'vertical' ? 'card-column' : 'card-row',
      'fullscreen-text': 'fullscreen-text',
    };
    return map[explicitLayout] ?? 'centered';
  }

  const cardCount = elements.filter(e => e.isCard).length;
  const nonCardCount = elements.length - cardCount;
  const allCards = cardCount === elements.length;
  const hasCards = cardCount > 0;

  // Vertical formats: use height as a resource
  if (profile.orientation === 'vertical') {
    if (allCards) return 'card-column';
    if (hasCards && nonCardCount <= 1) return 'card-column';
    // Few text elements → hero (content in upper third)
    if (elements.length <= 3) return 'hero';
    return 'stacked';
  }

  // Horizontal formats: use width
  if (profile.orientation === 'horizontal') {
    if (allCards) {
      if (cardCount <= profile.maxCardsPerRow) return 'card-row';
      return 'card-grid';
    }
    if (hasCards && nonCardCount <= 1) return 'card-row';
    // Split only for two visually equal elements (e.g. two cards, image+text)
    // Heading+text should stay centered, not split
    if (elements.length === 2) {
      const hasHeading = elements.some(e => e.type === 'heading');
      const hasImage = elements.some(e => e.type === 'image');
      if (hasImage && !hasHeading) return 'split';
      return 'centered';
    }
    if (elements.length <= 3) return 'centered';
    return 'stacked';
  }

  // Square: compact centered or grid
  if (allCards && cardCount >= 2) return 'card-grid';
  if (elements.length <= 2) return 'centered';
  return 'stacked';
}

/**
 * Compute CSS grid-template-columns for card layouts.
 */
export function computeCardGridColumns(
  profile: LayoutProfile,
  cardCount: number,
): string {
  const max = profile.maxCardsPerRow;

  if (profile.preferredCardLayout === 'column' || max === 1) {
    return '1fr';
  }

  const cols = Math.min(cardCount, max);
  return `repeat(${cols}, 1fr)`;
}

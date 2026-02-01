// Industry profiles for video-craft
// Modulate composition choices (animations, timing, transitions, density)
// based on project type / industry.

import type { EnergyLevel } from './actions.js';
import type { ExtractedContent } from './analyze-folder.js';

export type RhythmType = 'constant' | 'accelerating' | 'wave' | 'tension-arc';

export interface IndustryProfile {
  id: string;
  keywords: string[];
  // Timing
  sceneDuration: { min: number; max: number }; // ms
  // Animation preferences
  preferredEntrances: string[];
  preferredExits: string[];
  preferredTransitions: string[];
  entranceEnergy: EnergyLevel[]; // allowed energy levels
  // Rhythm
  rhythm: RhythmType;
  // Density
  densityMultiplier: number;
  // Background style bias
  preferDarkBg: boolean;
  // Pacing: how many dense scenes before a breathing scene
  breathingFrequency: number; // insert breathing scene every N dense scenes
  // Contrast rhythm: alternate light/dark backgrounds
  contrastRhythm: boolean;
}

// ─── Profiles ──────────────────────────────────────────────

const TECH_SAAS: IndustryProfile = {
  id: 'tech-saas',
  keywords: ['saas', 'api', 'developer', 'dev', 'tool', 'platform', 'sdk', 'cli', 'dashboard', 'analytics', 'devtools', 'infrastructure', 'cloud', 'tech', 'software', 'app', 'startup'],
  sceneDuration: { min: 2000, max: 4000 },
  preferredEntrances: ['glitch-in', 'flash-in', 'whip-in-left', 'whip-in-right', 'slam', 'stamp', 'clip-reveal-up', 'slide-up', 'blur-in', 'spring-up', 'kinetic-push', 'text-reveal-mask'],
  preferredExits: ['glitch-out', 'flash-out', 'whip-out-left', 'clip-hide-up', 'blur-out', 'spring-out-down'],
  preferredTransitions: ['cut', 'glitch', 'wipe-left', 'flash', 'slide-left', 'push-left', 'morph-reveal'],
  entranceEnergy: ['medium', 'high', 'special'],
  rhythm: 'tension-arc',
  densityMultiplier: 0.9,
  preferDarkBg: true,
  breathingFrequency: 3,
  contrastRhythm: true,
};

const CREATIVE_AGENCY: IndustryProfile = {
  id: 'creative-agency',
  keywords: ['agency', 'creative', 'design', 'brand', 'branding', 'portfolio', 'studio', 'reel', 'identity', 'art', 'motion', 'film'],
  sceneDuration: { min: 3000, max: 5000 },
  preferredEntrances: ['soft-reveal', 'rise-and-fade', 'letter-spacing-in', 'zoom-in', 'zoom-in-rotate', 'elastic-in', 'split-reveal', 'blur-in', 'spring-scale', 'morph-circle-in', 'anticipate-scale'],
  preferredExits: ['soft-hide', 'fade-out', 'blur-out', 'zoom-out', 'morph-circle-out'],
  preferredTransitions: ['crossfade', 'zoom-in', 'zoom-out', 'circle-reveal', 'iris-open', 'blur', 'scale-reveal'],
  entranceEnergy: ['minimal', 'low', 'medium', 'special'],
  rhythm: 'wave',
  densityMultiplier: 0.8,
  preferDarkBg: true,
  breathingFrequency: 2,
  contrastRhythm: true,
};

const ECOMMERCE: IndustryProfile = {
  id: 'ecommerce',
  keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'product', 'marketplace', 'retail', 'fashion', 'clothing', 'buy', 'cart', 'checkout'],
  sceneDuration: { min: 3000, max: 5000 },
  preferredEntrances: ['fade-in-up', 'slide-up', 'grow', 'bounce-in', 'bounce-in-up', 'clip-reveal-up', 'spring-up', 'spring-scale'],
  preferredExits: ['fade-out-up', 'slide-out-up', 'shrink', 'clip-hide-up', 'spring-out-down'],
  preferredTransitions: ['slide-left', 'slide-right', 'crossfade', 'fade', 'push-left', 'wipe-left', 'morph-reveal'],
  entranceEnergy: ['low', 'medium'],
  rhythm: 'constant',
  densityMultiplier: 1.0,
  preferDarkBg: false,
  breathingFrequency: 4,
  contrastRhythm: false,
};

const CORPORATE: IndustryProfile = {
  id: 'corporate',
  keywords: ['corporate', 'enterprise', 'b2b', 'consulting', 'finance', 'banking', 'insurance', 'legal', 'healthcare', 'medical', 'government', 'education'],
  sceneDuration: { min: 4000, max: 6000 },
  preferredEntrances: ['fade-in', 'fade-in-up', 'soft-reveal', 'rise-and-fade', 'clip-reveal-up', 'anticipate-up', 'text-reveal-mask'],
  preferredExits: ['fade-out', 'fade-out-up', 'soft-hide'],
  preferredTransitions: ['fade', 'crossfade', 'blur', 'push-left', 'scale-reveal'],
  entranceEnergy: ['minimal', 'low'],
  rhythm: 'constant',
  densityMultiplier: 1.0,
  preferDarkBg: false,
  breathingFrequency: 3,
  contrastRhythm: false,
};

const DEFAULT_PROFILE: IndustryProfile = {
  id: 'default',
  keywords: [],
  sceneDuration: { min: 3000, max: 5000 },
  preferredEntrances: ['fade-in-up', 'slide-up', 'soft-reveal', 'clip-reveal-up', 'grow', 'zoom-in', 'blur-in', 'spring-up', 'anticipate-up'],
  preferredExits: ['fade-out', 'fade-out-up', 'soft-hide', 'slide-out-up'],
  preferredTransitions: ['crossfade', 'fade', 'slide-left', 'cut', 'blur', 'morph-reveal'],
  entranceEnergy: ['minimal', 'low', 'medium'],
  rhythm: 'constant',
  densityMultiplier: 1.0,
  preferDarkBg: true,
  breathingFrequency: 3,
  contrastRhythm: true,
};

export const COCOMELON_PROFILE: IndustryProfile = {
  id: 'cocomelon',
  keywords: [],
  sceneDuration: { min: 1500, max: 3500 },
  preferredEntrances: [
    'slam', 'stamp', 'glitch-in', 'flash-in', 'whip-in-left', 'whip-in-right',
    'bounce-in', 'bounce-in-up', 'elastic-in', 'spring-up', 'spring-scale',
    'kinetic-push', 'zoom-in-rotate',
  ],
  preferredExits: [
    'glitch-out', 'flash-out', 'whip-out-left', 'spring-out-down', 'shrink',
  ],
  preferredTransitions: [
    'cut', 'flash', 'glitch', 'zoom-in', 'wipe-left', 'push-left',
  ],
  entranceEnergy: ['medium', 'high', 'special'],
  rhythm: 'tension-arc',
  densityMultiplier: 1.3,
  preferDarkBg: true,
  breathingFrequency: 4,
  contrastRhythm: true,
};

const ALL_PROFILES: IndustryProfile[] = [
  TECH_SAAS,
  CREATIVE_AGENCY,
  ECOMMERCE,
  CORPORATE,
];

// ─── Detection ─────────────────────────────────────────────

export function detectIndustry(intent: string, content: ExtractedContent): IndustryProfile {
  const lower = intent.toLowerCase();
  const words = lower.split(/\s+/);

  // Also scan project description and tech stack for signals
  const descWords = (content.description + ' ' + content.techStack.join(' ')).toLowerCase().split(/\s+/);
  const allWords = [...words, ...descWords];

  let bestProfile = DEFAULT_PROFILE;
  let bestScore = 0;

  for (const profile of ALL_PROFILES) {
    let score = 0;
    for (const kw of profile.keywords) {
      for (const w of allWords) {
        if (w.includes(kw)) score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }

  return bestProfile;
}

/**
 * Compute scene duration for a given position in the video based on industry rhythm.
 */
export function getSceneDuration(
  profile: IndustryProfile,
  sceneIndex: number,
  totalScenes: number,
): number {
  const { min, max } = profile.sceneDuration;
  const mid = (min + max) / 2;

  switch (profile.rhythm) {
    case 'constant':
      return mid;

    case 'accelerating': {
      // Scenes get progressively shorter
      const pos = totalScenes <= 1 ? 0 : sceneIndex / (totalScenes - 1);
      return Math.round(max - (max - min) * pos);
    }

    case 'wave': {
      // Sine wave: slower at bookends, faster in middle
      const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
      const wave = Math.sin(pos * Math.PI);
      return Math.round(max - (max - min) * wave * 0.6);
    }

    case 'tension-arc': {
      // Hook fast → build slower → climax fast → breathe slow → CTA medium
      const pos = totalScenes <= 1 ? 0.5 : sceneIndex / (totalScenes - 1);
      if (pos < 0.15) return min; // hook: fast
      if (pos < 0.5) return Math.round(mid + (max - mid) * 0.3); // build: slightly slow
      if (pos < 0.7) return min; // climax: fast
      if (pos < 0.85) return max; // breathe: slow
      return mid; // CTA: medium
    }
  }

  return mid;
}

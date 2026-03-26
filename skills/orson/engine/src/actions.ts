// Frame-addressed animation definitions for Orson v3
// Replaces CSS @keyframes with numeric property interpolation targets.
// Every animation is defined as { property: { from, to } } or
// { property: { keyframes: [0..1], values: [...] } } for multi-stop curves.

import type { AnimatableProperty, EasingId } from './interpolate.js';

// ─── Types ──────────────────────────────────────────────────

export type EnergyLevel = 'minimal' | 'low' | 'medium' | 'high' | 'special';

/** Simple two-point interpolation */
export interface SimpleProperty {
  from: number;
  to: number;
}

/** Multi-keyframe interpolation (normalized 0-1 progress points) */
export interface MultiKeyframeProperty {
  keyframes: number[];  // e.g. [0, 0.6, 0.8, 1]
  values: number[];     // e.g. [0, 1.1, 0.95, 1]
}

export type PropertyDef = SimpleProperty | MultiKeyframeProperty;

export function isMultiKeyframe(p: PropertyDef): p is MultiKeyframeProperty {
  return 'keyframes' in p;
}

export interface AnimationDef {
  id: string;
  name: string;
  energy: EnergyLevel;
  durationRange: [number, number]; // [min, max] in ms
  properties: Partial<Record<AnimatableProperty, PropertyDef>>;
  easing?: EasingId;
  continuous?: boolean;  // if true, animation loops
  /** Text splitting mode: 'word' wraps each word in span, 'char' wraps each character */
  textSplit?: 'word' | 'char';
  /** Stagger delay between split elements in ms */
  staggerMs?: number;
}

export interface TransitionDef {
  id: string;
  name: string;
  energy: EnergyLevel;
  durationRange: [number, number];
  outgoing: Partial<Record<AnimatableProperty, PropertyDef>>;  // scene A exit
  incoming: Partial<Record<AnimatableProperty, PropertyDef>>;  // scene B enter
  easing?: EasingId;
}

// ─── Compact helpers ────────────────────────────────────────

function ft(from: number, to: number): SimpleProperty { return { from, to }; }
function kf(keyframes: number[], values: number[]): MultiKeyframeProperty { return { keyframes, values }; }

// ─── ENTRANCES ──────────────────────────────────────────────

export const ENTRANCES: Record<string, AnimationDef> = {
  'fade-in': {
    id: 'fade-in', name: 'Fade In', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'fade-in-up': {
    id: 'fade-in-up', name: 'Fade In Up', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(0, 1), y: ft(20, 0) },
    easing: 'easeOutCubic',
  },
  'fade-in-down': {
    id: 'fade-in-down', name: 'Fade In Down', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(0, 1), y: ft(-20, 0) },
    easing: 'easeOutCubic',
  },
  'fade-in-left': {
    id: 'fade-in-left', name: 'Fade In Left', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(0, 1), x: ft(-20, 0) },
    easing: 'easeOutCubic',
  },
  'fade-in-right': {
    id: 'fade-in-right', name: 'Fade In Right', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(0, 1), x: ft(20, 0) },
    easing: 'easeOutCubic',
  },
  'soft-reveal': {
    id: 'soft-reveal', name: 'Soft Reveal', energy: 'minimal',
    durationRange: [400, 1000],
    properties: { opacity: ft(0, 1), scale: ft(0.98, 1) },
    easing: 'easeOutCubic',
  },
  'slide-up': {
    id: 'slide-up', name: 'Slide Up', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), yPercent: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'slide-down': {
    id: 'slide-down', name: 'Slide Down', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), yPercent: ft(-100, 0) },
    easing: 'easeOutCubic',
  },
  'slide-left': {
    id: 'slide-left', name: 'Slide Left', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), xPercent: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'slide-right': {
    id: 'slide-right', name: 'Slide Right', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), xPercent: ft(-100, 0) },
    easing: 'easeOutCubic',
  },
  'grow': {
    id: 'grow', name: 'Grow', energy: 'low',
    durationRange: [300, 600],
    properties: { opacity: ft(0, 1), scale: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'clip-reveal-up': {
    id: 'clip-reveal-up', name: 'Clip Reveal Up', energy: 'low',
    durationRange: [400, 800],
    properties: { clipTop: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'clip-reveal-down': {
    id: 'clip-reveal-down', name: 'Clip Reveal Down', energy: 'low',
    durationRange: [400, 800],
    properties: { clipBottom: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'clip-reveal-left': {
    id: 'clip-reveal-left', name: 'Clip Reveal Left', energy: 'low',
    durationRange: [400, 800],
    properties: { clipRight: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'clip-reveal-right': {
    id: 'clip-reveal-right', name: 'Clip Reveal Right', energy: 'low',
    durationRange: [400, 800],
    properties: { clipLeft: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'bounce-in': {
    id: 'bounce-in', name: 'Bounce In', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.6, 0.8, 1], [0, 1, 1, 1]),
      scale: kf([0, 0.6, 0.8, 1], [0, 1.1, 0.95, 1]),
    },
    easing: 'easeOutCubic',
  },
  'bounce-in-up': {
    id: 'bounce-in-up', name: 'Bounce In Up', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.6, 0.8, 1], [0, 1, 1, 1]),
      y: kf([0, 0.6, 0.8, 1], [60, -10, 5, 0]),
    },
    easing: 'easeOutCubic',
  },
  'bounce-in-down': {
    id: 'bounce-in-down', name: 'Bounce In Down', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.6, 0.8, 1], [0, 1, 1, 1]),
      y: kf([0, 0.6, 0.8, 1], [-60, 10, -5, 0]),
    },
    easing: 'easeOutCubic',
  },
  'elastic-in': {
    id: 'elastic-in', name: 'Elastic In', energy: 'medium',
    durationRange: [600, 1200],
    properties: {
      opacity: kf([0, 0.5, 0.7, 1], [0, 1, 1, 1]),
      scale: kf([0, 0.5, 0.7, 1], [0.3, 1.05, 0.9, 1]),
    },
    easing: 'easeOutCubic',
  },
  'swing-in': {
    id: 'swing-in', name: 'Swing In', energy: 'medium',
    durationRange: [500, 1000],
    properties: {
      opacity: kf([0, 0.6, 0.8, 1], [0, 1, 1, 1]),
      rotateX: kf([0, 0.6, 0.8, 1], [-90, 10, -5, 0]),
    },
    easing: 'easeOutCubic',
  },
  'flip-in-x': {
    id: 'flip-in-x', name: 'Flip In X', energy: 'medium',
    durationRange: [400, 800],
    properties: { opacity: ft(0, 1), rotateX: ft(90, 0) },
    easing: 'easeOutCubic',
  },
  'flip-in-y': {
    id: 'flip-in-y', name: 'Flip In Y', energy: 'medium',
    durationRange: [400, 800],
    properties: { opacity: ft(0, 1), rotateY: ft(90, 0) },
    easing: 'easeOutCubic',
  },
  'zoom-in': {
    id: 'zoom-in', name: 'Zoom In', energy: 'medium',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), scale: ft(0.3, 1) },
    easing: 'easeOutCubic',
  },
  'zoom-in-rotate': {
    id: 'zoom-in-rotate', name: 'Zoom In Rotate', energy: 'medium',
    durationRange: [400, 800],
    properties: { opacity: ft(0, 1), scale: ft(0.3, 1), rotate: ft(-15, 0) },
    easing: 'easeOutCubic',
  },
  'roll-in': {
    id: 'roll-in', name: 'Roll In', energy: 'medium',
    durationRange: [500, 1000],
    properties: { opacity: ft(0, 1), xPercent: ft(-100, 0), rotate: ft(-120, 0) },
    easing: 'easeOutCubic',
  },
  'slam': {
    id: 'slam', name: 'Slam', energy: 'high',
    durationRange: [200, 500],
    properties: { opacity: ft(0, 1), scale: ft(3, 1) },
    easing: 'easeOutCubic',
  },
  'drop': {
    id: 'drop', name: 'Drop', energy: 'high',
    durationRange: [400, 800],
    properties: {
      opacity: kf([0, 0.6, 0.8, 1], [0, 1, 1, 1]),
      y: kf([0, 0.6, 0.8, 1], [-500, 20, -10, 0]),
    },
    easing: 'easeOutCubic',
  },
  'whip-in-left': {
    id: 'whip-in-left', name: 'Whip In Left', energy: 'high',
    durationRange: [200, 500],
    properties: { opacity: ft(0, 1), xPercent: ft(-200, 0) },
    easing: 'easeOutCubic',
  },
  'whip-in-right': {
    id: 'whip-in-right', name: 'Whip In Right', energy: 'high',
    durationRange: [200, 500],
    properties: { opacity: ft(0, 1), xPercent: ft(200, 0) },
    easing: 'easeOutCubic',
  },
  'glitch-in': {
    id: 'glitch-in', name: 'Glitch In', energy: 'high',
    durationRange: [300, 600],
    properties: {
      opacity: kf([0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.8, 0.6, 0.9, 1, 1]),
      x: kf([0, 0.2, 0.4, 0.6, 0.8, 1], [-5, 3, -2, 1, -1, 0]),
      y: kf([0, 0.2, 0.4, 0.6, 0.8, 1], [3, -2, 1, -1, 0, 0]),
      hueRotate: kf([0, 0.2, 0.4, 0.6, 0.8, 1], [90, 180, 270, 45, 0, 0]),
    },
    easing: 'easeOutCubic',
  },
  'flash-in': {
    id: 'flash-in', name: 'Flash In', energy: 'high',
    durationRange: [200, 400],
    properties: {
      opacity: kf([0, 0.5, 1], [0, 1, 1]),
      brightness: kf([0, 0.5, 1], [5, 3, 1]),
    },
    easing: 'easeOutCubic',
  },
  'pixel-in': {
    id: 'pixel-in', name: 'Pixel In', energy: 'high',
    durationRange: [400, 800],
    properties: { opacity: ft(0, 1), blur: ft(20, 0), scale: ft(1.1, 1) },
    easing: 'easeOutCubic',
  },
  'blur-in': {
    id: 'blur-in', name: 'Blur In', energy: 'special',
    durationRange: [300, 700],
    properties: { opacity: ft(0, 1), blur: ft(10, 0) },
    easing: 'easeOutCubic',
  },
  'highlight-text': {
    id: 'highlight-text', name: 'Highlight Text', energy: 'special',
    durationRange: [400, 800],
    properties: { backgroundSizeX: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'underline-draw': {
    id: 'underline-draw', name: 'Underline Draw', energy: 'special',
    durationRange: [300, 600],
    properties: { backgroundSizeX: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'typewriter': {
    id: 'typewriter', name: 'Typewriter', energy: 'special',
    durationRange: [800, 3000],
    properties: { maxWidthPercent: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'split-reveal': {
    id: 'split-reveal', name: 'Split Reveal', energy: 'special',
    durationRange: [400, 800],
    properties: { clipRight: ft(50, 0), clipLeft: ft(50, 0), opacity: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'rise-and-fade': {
    id: 'rise-and-fade', name: 'Rise and Fade', energy: 'minimal',
    durationRange: [400, 900],
    properties: { opacity: ft(0, 1), y: ft(30, 0), scale: ft(0.95, 1) },
    easing: 'easeOutCubic',
  },
  'letter-spacing-in': {
    id: 'letter-spacing-in', name: 'Letter Spacing In', energy: 'special',
    durationRange: [400, 800],
    properties: { opacity: ft(0, 1), letterSpacing: ft(0.5, 0) },
    easing: 'easeOutCubic',
  },
  'stamp': {
    id: 'stamp', name: 'Stamp', energy: 'high',
    durationRange: [150, 400],
    properties: {
      opacity: kf([0, 0.7, 1], [0, 1, 1]),
      scale: kf([0, 0.7, 1], [4, 0.95, 1]),
      rotate: kf([0, 0.7, 1], [-10, 1, 0]),
    },
    easing: 'easeOutCubic',
  },
  'spring-up': {
    id: 'spring-up', name: 'Spring Up', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.6, 0.75, 0.9, 1], [0, 1, 1, 1, 1]),
      y: kf([0, 0.6, 0.75, 0.9, 1], [40, -8, 3, -1, 0]),
    },
    easing: 'easeOutCubic',
  },
  'spring-scale': {
    id: 'spring-scale', name: 'Spring Scale', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.55, 0.7, 0.85, 1], [0, 1, 1, 1, 1]),
      scale: kf([0, 0.55, 0.7, 0.85, 1], [0.5, 1.08, 0.96, 1.02, 1]),
    },
    easing: 'easeOutCubic',
  },
  'spring-left': {
    id: 'spring-left', name: 'Spring Left', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.55, 0.7, 0.85, 1], [0, 1, 1, 1, 1]),
      x: kf([0, 0.55, 0.7, 0.85, 1], [60, -10, 4, -2, 0]),
    },
    easing: 'easeOutCubic',
  },
  'word-by-word': {
    id: 'word-by-word', name: 'Word by Word', energy: 'special',
    durationRange: [800, 2000],
    properties: { opacity: ft(0, 1), y: ft(15, 0) },
    easing: 'easeOutCubic',
    textSplit: 'word',
    staggerMs: 80,
  },
  'char-stagger': {
    id: 'char-stagger', name: 'Char Stagger', energy: 'special',
    durationRange: [1000, 3000],
    properties: { opacity: ft(0, 1), y: ft(10, 0), scale: ft(0.8, 1) },
    easing: 'easeOutCubic',
    textSplit: 'char',
    staggerMs: 30,
  },
  'impact-word': {
    id: 'impact-word', name: 'Impact Word', energy: 'special',
    durationRange: [1200, 2500],
    properties: {
      opacity: kf([0, 0.5, 1], [0, 1, 1]),
      scale: kf([0, 0.5, 0.7, 1], [5, 1.1, 0.95, 1]),
      blur: kf([0, 0.5, 1], [15, 0, 0]),
    },
    easing: 'easeOutCubic',
    textSplit: 'word',
    staggerMs: 200,
  },
  'kinetic-push': {
    id: 'kinetic-push', name: 'Kinetic Push', energy: 'high',
    durationRange: [300, 600],
    properties: {
      opacity: kf([0, 0.6, 1], [0, 1, 1]),
      xPercent: kf([0, 0.6, 1], [-100, 5, 0]),
      scaleX: kf([0, 0.6, 1], [1.3, 0.95, 1]),
      scaleY: kf([0, 0.6, 1], [0.8, 1.02, 1]),
    },
    easing: 'easeOutCubic',
  },
  'text-reveal-mask': {
    id: 'text-reveal-mask', name: 'Text Reveal Mask', energy: 'special',
    durationRange: [500, 1000],
    properties: { clipRight: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'scale-word': {
    id: 'scale-word', name: 'Scale Word', energy: 'high',
    durationRange: [300, 600],
    properties: {
      opacity: kf([0, 0.7, 1], [0, 1, 1]),
      scale: kf([0, 0.7, 1], [3, 0.95, 1]),
      blur: kf([0, 0.7, 1], [8, 0, 0]),
    },
    easing: 'easeOutCubic',
  },
  'morph-circle-in': {
    id: 'morph-circle-in', name: 'Morph Circle In', energy: 'medium',
    durationRange: [500, 900],
    properties: { clipCircle: ft(0, 75), opacity: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'morph-diamond-in': {
    id: 'morph-diamond-in', name: 'Morph Diamond In', energy: 'medium',
    durationRange: [500, 900],
    properties: { clipCircle: ft(0, 75), opacity: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'morph-hexagon-in': {
    id: 'morph-hexagon-in', name: 'Morph Hexagon In', energy: 'medium',
    durationRange: [500, 900],
    properties: { clipCircle: ft(0, 75), opacity: ft(0, 1) },
    easing: 'easeOutCubic',
  },
  'anticipate-up': {
    id: 'anticipate-up', name: 'Anticipate Up', energy: 'medium',
    durationRange: [600, 1000],
    properties: {
      opacity: kf([0, 0.15, 0.4, 0.65, 1], [0, 0.5, 1, 1, 1]),
      y: kf([0, 0.15, 0.4, 0.65, 1], [30, 35, -5, 2, 0]),
    },
    easing: 'easeOutCubic',
  },
  'anticipate-scale': {
    id: 'anticipate-scale', name: 'Anticipate Scale', energy: 'medium',
    durationRange: [600, 1000],
    properties: {
      opacity: kf([0, 0.15, 0.5, 0.75, 1], [0, 0.3, 1, 1, 1]),
      scale: kf([0, 0.15, 0.5, 0.75, 1], [0.7, 0.65, 1.06, 0.98, 1]),
    },
    easing: 'easeOutCubic',
  },
  'traverse': {
    id: 'traverse', name: 'Traverse', energy: 'medium',
    durationRange: [4000, 8000],
    properties: { xPercent: ft(-110, 110) },
    easing: 'easeOutCubic',
    continuous: true,
  },
  'marquee': {
    id: 'marquee', name: 'Marquee', energy: 'low',
    durationRange: [6000, 12000],
    properties: { xPercent: ft(100, -100) },
    easing: 'easeOutCubic',
    continuous: true,
  },
  'float-drift': {
    id: 'float-drift', name: 'Float Drift', energy: 'minimal',
    durationRange: [3000, 6000],
    properties: {
      y: kf([0, 0.25, 0.5, 0.75, 1], [0, -8, -4, -10, 0]),
      x: kf([0, 0.25, 0.5, 0.75, 1], [0, 4, -3, 2, 0]),
    },
    easing: 'easeOutCubic',
    continuous: true,
  },
};

// ─── EXITS ──────────────────────────────────────────────────

export const EXITS: Record<string, AnimationDef> = {
  'fade-out': {
    id: 'fade-out', name: 'Fade Out', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(1, 0) },
    easing: 'easeOutCubic',
  },
  'fade-out-up': {
    id: 'fade-out-up', name: 'Fade Out Up', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(1, 0), y: ft(0, -20) },
    easing: 'easeOutCubic',
  },
  'fade-out-down': {
    id: 'fade-out-down', name: 'Fade Out Down', energy: 'minimal',
    durationRange: [300, 800],
    properties: { opacity: ft(1, 0), y: ft(0, 20) },
    easing: 'easeOutCubic',
  },
  'soft-hide': {
    id: 'soft-hide', name: 'Soft Hide', energy: 'minimal',
    durationRange: [400, 1000],
    properties: { opacity: ft(1, 0), scale: ft(1, 0.98) },
    easing: 'easeOutCubic',
  },
  'slide-out-up': {
    id: 'slide-out-up', name: 'Slide Out Up', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), yPercent: ft(0, -100) },
    easing: 'easeOutCubic',
  },
  'slide-out-down': {
    id: 'slide-out-down', name: 'Slide Out Down', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), yPercent: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'slide-out-left': {
    id: 'slide-out-left', name: 'Slide Out Left', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), xPercent: ft(0, -100) },
    easing: 'easeOutCubic',
  },
  'slide-out-right': {
    id: 'slide-out-right', name: 'Slide Out Right', energy: 'low',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), xPercent: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'shrink': {
    id: 'shrink', name: 'Shrink', energy: 'low',
    durationRange: [300, 600],
    properties: { opacity: ft(1, 0), scale: ft(1, 0) },
    easing: 'easeOutCubic',
  },
  'bounce-out': {
    id: 'bounce-out', name: 'Bounce Out', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      opacity: kf([0, 0.4, 1], [1, 1, 0]),
      scale: kf([0, 0.4, 1], [1, 1.1, 0]),
    },
    easing: 'easeOutCubic',
  },
  'zoom-out': {
    id: 'zoom-out', name: 'Zoom Out', energy: 'medium',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), scale: ft(1, 0.3) },
    easing: 'easeOutCubic',
  },
  'flip-out-x': {
    id: 'flip-out-x', name: 'Flip Out X', energy: 'medium',
    durationRange: [400, 800],
    properties: { opacity: ft(1, 0), rotateX: ft(0, 90) },
    easing: 'easeOutCubic',
  },
  'flip-out-y': {
    id: 'flip-out-y', name: 'Flip Out Y', energy: 'medium',
    durationRange: [400, 800],
    properties: { opacity: ft(1, 0), rotateY: ft(0, 90) },
    easing: 'easeOutCubic',
  },
  'elastic-out': {
    id: 'elastic-out', name: 'Elastic Out', energy: 'medium',
    durationRange: [600, 1200],
    properties: {
      opacity: kf([0, 0.3, 0.5, 1], [1, 1, 1, 0]),
      scale: kf([0, 0.3, 0.5, 1], [1, 0.9, 1.05, 0.3]),
    },
    easing: 'easeOutCubic',
  },
  'swing-out': {
    id: 'swing-out', name: 'Swing Out', energy: 'medium',
    durationRange: [500, 1000],
    properties: {
      opacity: kf([0, 0.4, 0.6, 1], [1, 1, 1, 0]),
      rotateX: kf([0, 0.4, 0.6, 1], [0, -10, 5, 90]),
    },
    easing: 'easeOutCubic',
  },
  'roll-out': {
    id: 'roll-out', name: 'Roll Out', energy: 'medium',
    durationRange: [500, 1000],
    properties: { opacity: ft(1, 0), xPercent: ft(0, 100), rotate: ft(0, 120) },
    easing: 'easeOutCubic',
  },
  'clip-hide-up': {
    id: 'clip-hide-up', name: 'Clip Hide Up', energy: 'low',
    durationRange: [400, 800],
    properties: { clipBottom: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'clip-hide-down': {
    id: 'clip-hide-down', name: 'Clip Hide Down', energy: 'low',
    durationRange: [400, 800],
    properties: { clipTop: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'clip-hide-left': {
    id: 'clip-hide-left', name: 'Clip Hide Left', energy: 'low',
    durationRange: [400, 800],
    properties: { clipLeft: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'clip-hide-right': {
    id: 'clip-hide-right', name: 'Clip Hide Right', energy: 'low',
    durationRange: [400, 800],
    properties: { clipRight: ft(0, 100) },
    easing: 'easeOutCubic',
  },
  'whip-out-left': {
    id: 'whip-out-left', name: 'Whip Out Left', energy: 'high',
    durationRange: [200, 500],
    properties: { opacity: ft(1, 0), xPercent: ft(0, -200) },
    easing: 'easeOutCubic',
  },
  'whip-out-right': {
    id: 'whip-out-right', name: 'Whip Out Right', energy: 'high',
    durationRange: [200, 500],
    properties: { opacity: ft(1, 0), xPercent: ft(0, 200) },
    easing: 'easeOutCubic',
  },
  'flash-out': {
    id: 'flash-out', name: 'Flash Out', energy: 'high',
    durationRange: [200, 400],
    properties: {
      opacity: kf([0, 0.5, 1], [1, 1, 0]),
      brightness: kf([0, 0.5, 1], [1, 5, 1]),
    },
    easing: 'easeOutCubic',
  },
  'glitch-out': {
    id: 'glitch-out', name: 'Glitch Out', energy: 'high',
    durationRange: [300, 600],
    properties: {
      opacity: kf([0, 0.2, 0.4, 0.6, 1], [1, 0.8, 0.6, 0.3, 0]),
      x: kf([0, 0.2, 0.4, 0.6, 1], [0, 3, -2, 1, 0]),
      y: kf([0, 0.2, 0.4, 0.6, 1], [0, -2, 1, -1, 0]),
      hueRotate: kf([0, 0.2, 0.4, 0.6, 1], [0, 90, 180, 270, 0]),
    },
    easing: 'easeOutCubic',
  },
  'pixel-out': {
    id: 'pixel-out', name: 'Pixel Out', energy: 'high',
    durationRange: [400, 800],
    properties: { opacity: ft(1, 0), blur: ft(0, 20) },
    easing: 'easeOutCubic',
  },
  'blur-out': {
    id: 'blur-out', name: 'Blur Out', energy: 'special',
    durationRange: [300, 700],
    properties: { opacity: ft(1, 0), blur: ft(0, 10) },
    easing: 'easeOutCubic',
  },
  'morph-circle-out': {
    id: 'morph-circle-out', name: 'Morph Circle Out', energy: 'medium',
    durationRange: [500, 900],
    properties: { clipCircle: ft(75, 0), opacity: ft(1, 0) },
    easing: 'easeOutCubic',
  },
  'spring-out-down': {
    id: 'spring-out-down', name: 'Spring Out Down', energy: 'medium',
    durationRange: [400, 700],
    properties: {
      opacity: kf([0, 0.2, 1], [1, 1, 0]),
      y: kf([0, 0.2, 1], [0, -8, 50]),
    },
    easing: 'easeOutCubic',
  },
  'highlight-text-out': {
    id: 'highlight-text-out', name: 'Highlight Text Out', energy: 'special',
    durationRange: [400, 800],
    properties: { backgroundSizeX: ft(100, 0) },
    easing: 'easeOutCubic',
  },
  'underline-undraw': {
    id: 'underline-undraw', name: 'Underline Undraw', energy: 'special',
    durationRange: [300, 600],
    properties: { backgroundSizeX: ft(100, 0) },
    easing: 'easeOutCubic',
  },
};

// ─── TRANSITIONS ────────────────────────────────────────────

export const TRANSITIONS: Record<string, TransitionDef> = {
  'cut': {
    id: 'cut', name: 'Cut', energy: 'minimal',
    durationRange: [0, 0],
    outgoing: { opacity: ft(1, 0) },
    incoming: { opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'fade': {
    id: 'fade', name: 'Fade', energy: 'minimal',
    durationRange: [300, 800],
    outgoing: { opacity: ft(1, 0) },
    incoming: { opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'crossfade': {
    id: 'crossfade', name: 'Crossfade', energy: 'minimal',
    durationRange: [300, 1000],
    outgoing: { opacity: ft(1, 0) },
    incoming: { opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'slide-left': {
    id: 'slide-left', name: 'Slide Left', energy: 'low',
    durationRange: [300, 700],
    outgoing: { xPercent: ft(0, -100) },
    incoming: { xPercent: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'slide-right': {
    id: 'slide-right', name: 'Slide Right', energy: 'low',
    durationRange: [300, 700],
    outgoing: { xPercent: ft(0, 100) },
    incoming: { xPercent: ft(-100, 0) },
    easing: 'easeInOutCubic',
  },
  'slide-up': {
    id: 'slide-up', name: 'Slide Up', energy: 'low',
    durationRange: [300, 700],
    outgoing: { yPercent: ft(0, -100) },
    incoming: { yPercent: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'slide-down': {
    id: 'slide-down', name: 'Slide Down', energy: 'low',
    durationRange: [300, 700],
    outgoing: { yPercent: ft(0, 100) },
    incoming: { yPercent: ft(-100, 0) },
    easing: 'easeInOutCubic',
  },
  'wipe-left': {
    id: 'wipe-left', name: 'Wipe Left', energy: 'medium',
    durationRange: [300, 700],
    outgoing: { clipRight: ft(0, 100) },
    incoming: { clipLeft: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'wipe-right': {
    id: 'wipe-right', name: 'Wipe Right', energy: 'medium',
    durationRange: [300, 700],
    outgoing: { clipLeft: ft(0, 100) },
    incoming: { clipRight: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'circle-reveal': {
    id: 'circle-reveal', name: 'Circle Reveal', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { clipCircle: ft(150, 0) },
    incoming: { clipCircle: ft(0, 150) },
    easing: 'easeInOutCubic',
  },
  'flash': {
    id: 'flash', name: 'Flash', energy: 'high',
    durationRange: [150, 400],
    outgoing: {
      opacity: kf([0, 0.5, 1], [1, 1, 0]),
      brightness: kf([0, 0.5, 1], [1, 5, 1]),
    },
    incoming: {
      opacity: kf([0, 0.5, 1], [0, 1, 1]),
      brightness: kf([0, 0.5, 1], [5, 3, 1]),
    },
    easing: 'easeInOutCubic',
  },
  'glitch': {
    id: 'glitch', name: 'Glitch', energy: 'high',
    durationRange: [200, 600],
    outgoing: {
      opacity: kf([0, 0.3, 0.6, 1], [1, 0.8, 0.4, 0]),
      x: kf([0, 0.3, 0.6, 1], [0, 5, -3, 0]),
    },
    incoming: {
      opacity: kf([0, 0.4, 0.7, 1], [0, 0.4, 0.8, 1]),
      x: kf([0, 0.4, 0.7, 1], [-3, 2, 0, 0]),
    },
    easing: 'easeInOutCubic',
  },
  'zoom-in': {
    id: 'zoom-in', name: 'Zoom In', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { scale: ft(1, 0.5), opacity: ft(1, 0) },
    incoming: { scale: ft(2, 1), opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'zoom-out': {
    id: 'zoom-out', name: 'Zoom Out', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { scale: ft(1, 2), opacity: ft(1, 0) },
    incoming: { scale: ft(0.5, 1), opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'blur': {
    id: 'blur', name: 'Blur', energy: 'low',
    durationRange: [400, 800],
    outgoing: { blur: ft(0, 15), opacity: ft(1, 0) },
    incoming: { blur: ft(15, 0), opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'push-left': {
    id: 'push-left', name: 'Push Left', energy: 'low',
    durationRange: [300, 700],
    outgoing: { xPercent: ft(0, -100) },
    incoming: { xPercent: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'push-right': {
    id: 'push-right', name: 'Push Right', energy: 'low',
    durationRange: [300, 700],
    outgoing: { xPercent: ft(0, 100) },
    incoming: { xPercent: ft(-100, 0) },
    easing: 'easeInOutCubic',
  },
  'push-up': {
    id: 'push-up', name: 'Push Up', energy: 'low',
    durationRange: [300, 700],
    outgoing: { yPercent: ft(0, -100) },
    incoming: { yPercent: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'push-down': {
    id: 'push-down', name: 'Push Down', energy: 'low',
    durationRange: [300, 700],
    outgoing: { yPercent: ft(0, 100) },
    incoming: { yPercent: ft(-100, 0) },
    easing: 'easeInOutCubic',
  },
  'diamond-reveal': {
    id: 'diamond-reveal', name: 'Diamond Reveal', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { clipCircle: ft(100, 0) },
    incoming: { clipCircle: ft(0, 100) },
    easing: 'easeInOutCubic',
  },
  'rotate': {
    id: 'rotate', name: 'Rotate', energy: 'high',
    durationRange: [400, 800],
    outgoing: { rotate: ft(0, 90), scale: ft(1, 0.5), opacity: ft(1, 0) },
    incoming: { rotate: ft(-90, 0), scale: ft(0.5, 1), opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'iris-open': {
    id: 'iris-open', name: 'Iris Open', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { opacity: ft(1, 0) },
    incoming: { clipCircle: ft(0, 150) },
    easing: 'easeInOutCubic',
  },
  'iris-close': {
    id: 'iris-close', name: 'Iris Close', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { clipCircle: ft(150, 0) },
    incoming: { opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
  'morph-reveal': {
    id: 'morph-reveal', name: 'Morph Reveal', energy: 'medium',
    durationRange: [500, 900],
    outgoing: { clipRight: ft(0, 100) },
    incoming: { clipLeft: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'diagonal-wipe': {
    id: 'diagonal-wipe', name: 'Diagonal Wipe', energy: 'medium',
    durationRange: [400, 800],
    outgoing: { clipLeft: ft(0, 100) },
    incoming: { clipRight: ft(100, 0) },
    easing: 'easeInOutCubic',
  },
  'scale-reveal': {
    id: 'scale-reveal', name: 'Scale Reveal', energy: 'medium',
    durationRange: [500, 900],
    outgoing: { scale: ft(1, 0.8), opacity: ft(1, 0), blur: ft(0, 5) },
    incoming: { scale: ft(1.2, 1), opacity: ft(0, 1), blur: ft(5, 0) },
    easing: 'easeInOutCubic',
  },
  'morph-layout': {
    id: 'morph-layout', name: 'Morph Layout', energy: 'medium',
    durationRange: [500, 900],
    outgoing: {
      scale: kf([0, 0.4, 1], [1, 0.95, 0.9]),
      opacity: kf([0, 0.4, 1], [1, 0.8, 0]),
      y: kf([0, 0.4, 1], [0, 0, -30]),
    },
    incoming: {
      scale: kf([0, 0.6, 1], [1.1, 1.02, 1]),
      opacity: kf([0, 0.6, 1], [0, 0.8, 1]),
      y: kf([0, 0.6, 1], [30, 0, 0]),
    },
    easing: 'easeInOutCubic',
  },
  'shared-element': {
    id: 'shared-element', name: 'Shared Element', energy: 'medium',
    durationRange: [600, 1000],
    outgoing: {
      scale: kf([0, 0.5, 1], [1, 0.98, 0.95]),
      opacity: kf([0, 0.5, 1], [1, 0.6, 0]),
      blur: kf([0, 0.5, 1], [0, 2, 4]),
    },
    incoming: {
      scale: kf([0, 0.5, 1], [1.05, 1.02, 1]),
      opacity: kf([0, 0.5, 1], [0, 0.6, 1]),
      blur: kf([0, 0.5, 1], [4, 2, 0]),
    },
    easing: 'easeInOutCubic',
  },
  'cross-dissolve': {
    id: 'cross-dissolve', name: 'Cross Dissolve', energy: 'low',
    durationRange: [400, 900],
    outgoing: {
      opacity: kf([0, 0.5, 1], [1, 0.5, 0]),
      brightness: kf([0, 0.5, 1], [1, 1.2, 1]),
    },
    incoming: {
      opacity: kf([0, 0.5, 1], [0, 0.5, 1]),
      brightness: kf([0, 0.5, 1], [1.2, 1.1, 1]),
    },
    easing: 'easeInOutCubic',
  },
  'morph-scale-shift': {
    id: 'morph-scale-shift', name: 'Morph Scale Shift', energy: 'medium',
    durationRange: [500, 900],
    outgoing: { scale: ft(1, 0.85), xPercent: ft(0, -5), opacity: ft(1, 0) },
    incoming: { scale: ft(1.15, 1), xPercent: ft(5, 0), opacity: ft(0, 1) },
    easing: 'easeInOutCubic',
  },
};

// ─── EMPHASIS ───────────────────────────────────────────────

export const EMPHASIS: Record<string, AnimationDef> = {
  'pulse': {
    id: 'pulse', name: 'Pulse', energy: 'low',
    durationRange: [400, 800],
    properties: {
      scale: kf([0, 0.5, 1], [1, 1.05, 1]),
    },
    easing: 'easeInOutSine',
  },
  'shake': {
    id: 'shake', name: 'Shake', energy: 'medium',
    durationRange: [300, 600],
    properties: {
      x: kf([0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], [0, -4, 4, -4, 4, -4, 0]),
    },
    easing: 'easeInOutSine',
  },
  'wiggle': {
    id: 'wiggle', name: 'Wiggle', energy: 'medium',
    durationRange: [400, 800],
    properties: {
      rotate: kf([0, 0.25, 0.75, 1], [0, -3, 3, 0]),
    },
    easing: 'easeInOutSine',
  },
  'heartbeat': {
    id: 'heartbeat', name: 'Heartbeat', energy: 'medium',
    durationRange: [600, 1000],
    properties: {
      scale: kf([0, 0.14, 0.28, 0.42, 0.7, 1], [1, 1.1, 1, 1.1, 1, 1]),
    },
    easing: 'easeInOutSine',
  },
  'jello': {
    id: 'jello', name: 'Jello', energy: 'medium',
    durationRange: [500, 900],
    properties: {
      skewX: kf([0, 0.3, 0.4, 0.5, 0.65, 0.75, 1], [0, -6, 4, -3, 1.5, -0.5, 0]),
      skewY: kf([0, 0.3, 0.4, 0.5, 0.65, 0.75, 1], [0, -6, 4, -3, 1.5, -0.5, 0]),
    },
    easing: 'easeInOutSine',
  },
  'rubber-band': {
    id: 'rubber-band', name: 'Rubber Band', energy: 'high',
    durationRange: [400, 800],
    properties: {
      scaleX: kf([0, 0.3, 0.4, 0.5, 0.65, 0.75, 1], [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1]),
      scaleY: kf([0, 0.3, 0.4, 0.5, 0.65, 0.75, 1], [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1]),
    },
    easing: 'easeInOutSine',
  },
  'tada': {
    id: 'tada', name: 'Tada', energy: 'high',
    durationRange: [500, 1000],
    properties: {
      scale: kf([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1]),
      rotate: kf([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], [0, -3, -3, 3, -3, 3, -3, 3, -3, 3, 0]),
    },
    easing: 'easeInOutSine',
  },
  'flash-attention': {
    id: 'flash-attention', name: 'Flash Attention', energy: 'high',
    durationRange: [300, 600],
    properties: {
      opacity: kf([0, 0.25, 0.5, 0.75, 1], [1, 0.3, 1, 0.3, 1]),
    },
    easing: 'easeInOutSine',
  },
  'color-pop': {
    id: 'color-pop', name: 'Color Pop', energy: 'special',
    durationRange: [400, 800],
    properties: {
      brightness: kf([0, 0.5, 1], [1, 1.3, 1]),
    },
    easing: 'easeInOutSine',
  },
};

// ─── LOOPING ────────────────────────────────────────────────

export const LOOPING: Record<string, AnimationDef> = {
  'float': {
    id: 'float', name: 'Float', energy: 'minimal',
    durationRange: [2000, 4000],
    properties: {
      y: kf([0, 0.5, 1], [0, -8, 0]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'breathe': {
    id: 'breathe', name: 'Breathe', energy: 'minimal',
    durationRange: [3000, 5000],
    properties: {
      scale: kf([0, 0.5, 1], [1, 1.02, 1]),
      opacity: kf([0, 0.5, 1], [1, 0.9, 1]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'gentle-rotate': {
    id: 'gentle-rotate', name: 'Gentle Rotate', energy: 'minimal',
    durationRange: [4000, 8000],
    properties: {
      rotate: ft(0, 360),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'sway': {
    id: 'sway', name: 'Sway', energy: 'low',
    durationRange: [2000, 4000],
    properties: {
      rotate: kf([0, 0.25, 0.75, 1], [0, 2, -2, 0]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'shimmer': {
    id: 'shimmer', name: 'Shimmer', energy: 'low',
    durationRange: [2000, 3000],
    properties: {
      brightness: kf([0, 0.5, 1], [1, 1.15, 1]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'bob': {
    id: 'bob', name: 'Bob', energy: 'low',
    durationRange: [1500, 3000],
    properties: {
      y: kf([0, 0.5, 1], [0, -5, 0]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'glow-pulse': {
    id: 'glow-pulse', name: 'Glow Pulse', energy: 'medium',
    durationRange: [2000, 4000],
    properties: {
      brightness: kf([0, 0.5, 1], [1, 1.1, 1]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'drift-horizontal': {
    id: 'drift-horizontal', name: 'Drift Horizontal', energy: 'minimal',
    durationRange: [3000, 6000],
    properties: {
      x: kf([0, 0.5, 1], [0, 6, 0]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'rotate-breathe': {
    id: 'rotate-breathe', name: 'Rotate Breathe', energy: 'low',
    durationRange: [4000, 8000],
    properties: {
      rotate: kf([0, 0.5, 1], [0, 1, 0]),
      scale: kf([0, 0.5, 1], [1, 1.01, 1]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'color-shift': {
    id: 'color-shift', name: 'Color Shift', energy: 'low',
    durationRange: [3000, 6000],
    properties: {
      hueRotate: kf([0, 0.5, 1], [0, 15, 0]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
  'shadow-breathe': {
    id: 'shadow-breathe', name: 'Shadow Breathe', energy: 'minimal',
    durationRange: [3000, 5000],
    properties: {
      brightness: kf([0, 0.5, 1], [1, 1.05, 1]),
    },
    easing: 'easeInOutSine',
    continuous: true,
  },
};

// ─── MODE POOLS ─────────────────────────────────────────────

const SAFE_ENTRANCE_IDS = [
  'fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 'soft-reveal',
  'slide-up', 'slide-down', 'slide-left', 'slide-right', 'grow',
  'clip-reveal-up', 'clip-reveal-down', 'clip-reveal-left', 'clip-reveal-right',
  'zoom-in', 'blur-in', 'highlight-text', 'underline-draw',
  'rise-and-fade', 'typewriter', 'letter-spacing-in',
  'spring-up', 'spring-scale', 'spring-left',
  'text-reveal-mask', 'morph-circle-in',
  'anticipate-up', 'anticipate-scale',
];

const SAFE_EXIT_IDS = [
  'fade-out', 'fade-out-up', 'fade-out-down', 'soft-hide',
  'slide-out-up', 'slide-out-down', 'slide-out-left', 'slide-out-right', 'shrink',
  'clip-hide-up', 'clip-hide-down', 'clip-hide-left', 'clip-hide-right',
  'blur-out', 'highlight-text-out', 'underline-undraw',
  'morph-circle-out', 'spring-out-down',
];

const SAFE_TRANSITION_IDS = [
  'cut', 'fade', 'crossfade',
  'slide-left', 'slide-right', 'slide-up', 'slide-down',
  'blur', 'push-left', 'push-right', 'push-up', 'push-down',
  'morph-reveal', 'scale-reveal', 'wipe-left', 'wipe-right',
];

const SAFE_EMPHASIS_IDS = ['pulse', 'color-pop', 'heartbeat', 'wiggle', 'rubber-band', 'tada', 'shake'];
const SAFE_LOOPING_IDS = ['float', 'breathe', 'shimmer', 'bob', 'drift-horizontal', 'shadow-breathe'];

// ─── Pool functions ─────────────────────────────────────────

export function getEntrancePool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(ENTRANCES);
  return SAFE_ENTRANCE_IDS.map(id => ENTRANCES[id]).filter(Boolean);
}

export function getExitPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(EXITS);
  return SAFE_EXIT_IDS.map(id => EXITS[id]).filter(Boolean);
}

export function getTransitionPool(mode: string): TransitionDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(TRANSITIONS);
  return SAFE_TRANSITION_IDS.map(id => TRANSITIONS[id]).filter(Boolean);
}

export function getEmphasisPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(EMPHASIS);
  return SAFE_EMPHASIS_IDS.map(id => EMPHASIS[id]).filter(Boolean);
}

export function getLoopingPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(LOOPING);
  return SAFE_LOOPING_IDS.map(id => LOOPING[id]).filter(Boolean);
}

// ─── Profile-filtered pools ─────────────────────────────────

/**
 * Get entrance pool filtered by industry profile preferences.
 * Returns preferred entrances that exist in the base pool, with fallback to full pool.
 */
export function getEntrancePoolForProfile(
  mode: string,
  preferredIds: string[],
  allowedEnergy: EnergyLevel[],
): AnimationDef[] {
  const basePool = getEntrancePool(mode);
  const preferred = preferredIds
    .map(id => ENTRANCES[id])
    .filter((d): d is AnimationDef => !!d && allowedEnergy.includes(d.energy));
  if (preferred.length >= 3) return preferred;
  const filtered = basePool.filter(d => allowedEnergy.includes(d.energy));
  return filtered.length > 0 ? filtered : basePool;
}

/**
 * Get exit pool filtered by industry profile preferences.
 */
export function getExitPoolForProfile(
  mode: string,
  preferredIds: string[],
): AnimationDef[] {
  const basePool = getExitPool(mode);
  const preferred = preferredIds
    .map(id => EXITS[id])
    .filter((d): d is AnimationDef => !!d);
  return preferred.length >= 2 ? preferred : basePool;
}

/**
 * Get transition pool filtered by industry profile preferences.
 */
export function getTransitionPoolForProfile(
  mode: string,
  preferredIds: string[],
): TransitionDef[] {
  const basePool = getTransitionPool(mode);
  const preferred = preferredIds
    .map(id => TRANSITIONS[id])
    .filter((d): d is TransitionDef => !!d);
  return preferred.length >= 2 ? preferred : basePool;
}

// ─── Role-based animation mapping ───────────────────────────

/**
 * Maps element roles to semantically appropriate entrance animations.
 *
 * v6 alternatives (Claude should mix these with A()-based presets):
 * - hero-heading: SP(sel,'scale',0,3,1,{k:200,c:26,m:1}) — slam with real spring overshoot
 * - heading:      SP(sel,'y',0,40,0,{k:120,c:14,m:0.4}) — bouncy rise, more natural than outBack
 * - cta:          SP(sel,'scale',0,0.5,1,{k:150,c:6,m:0.5}) — elastic pop, better than bounce-in
 * - icon:         SP(sel,'scale',0,0,1,{k:120,c:14,m:0.4}) — bouncy scale-up
 * - decorative:   N(sel,'x','drift-x',0.01,30,0) + N(sel,'y','drift-y',0.015,20,0) — organic drift
 * - any heading:  D() on an SVG underline path under the text
 */
export const ROLE_ANIMATION_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  'hero-heading':  { primary: ['stamp', 'slam', 'scale-word'], secondary: ['drop', 'kinetic-push'] },
  'heading':       { primary: ['spring-up', 'clip-reveal-up', 'text-reveal-mask'], secondary: ['fade-in-up', 'slide-up'] },
  'body':          { primary: ['fade-in-up', 'rise-and-fade', 'soft-reveal'], secondary: ['blur-in', 'typewriter'] },
  'card-title':    { primary: ['spring-scale', 'bounce-in', 'clip-reveal-left'], secondary: ['fade-in-left', 'slide-left'] },
  'cta':           { primary: ['stamp', 'elastic-in', 'bounce-in'], secondary: ['spring-scale', 'grow'] },
  'icon':          { primary: ['spring-scale', 'morph-circle-in', 'bounce-in'], secondary: ['grow', 'zoom-in'] },
  'decorative':    { primary: ['fade-in', 'soft-reveal', 'blur-in'], secondary: ['grow'] },
};

/**
 * Select an entrance animation based on element role.
 * Returns null if no role mapping exists (caller should use default pool).
 */
export function selectEntranceByRole(
  role: string | undefined,
  usedInScene: Set<string>,
): AnimationDef | null {
  if (!role || !ROLE_ANIMATION_MAP[role]) return null;

  const mapping = ROLE_ANIMATION_MAP[role];
  const usePrimary = Math.random() < 0.8;
  const pool = usePrimary ? mapping.primary : mapping.secondary;

  // Avoid repeating the same animation within a scene
  const available = pool.filter(id => !usedInScene.has(id) && ENTRANCES[id]);
  const pickFrom = available.length > 0 ? available : pool;
  const id = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  const def = ENTRANCES[id];

  if (def) {
    usedInScene.add(id);
    return def;
  }
  return null;
}

// ─── Utility functions ──────────────────────────────────────

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function defaultEntranceDuration(def: AnimationDef): number {
  return Math.round((def.durationRange[0] + def.durationRange[1]) / 2);
}

export function defaultTransitionDuration(def: TransitionDef): number {
  if (def.durationRange[1] === 0) return 0;
  return Math.round((def.durationRange[0] + def.durationRange[1]) / 2);
}

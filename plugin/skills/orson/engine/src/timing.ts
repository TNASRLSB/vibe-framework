// Duration computation algorithm
// Scene duration is computed from text content + reading speed preset

import type { SpeedPreset } from './presets.js';
import { MS_PER_WORD, INTER_ELEMENT_GAP, ENTRANCE_SPEED_MULTIPLIERS } from './presets.js';

// ─── Stagger (inlined from removed choreography.ts) ─────────

export type StaggerPattern =
  | 'cascade-down' | 'cascade-up' | 'origin-burst'
  | 'wave' | 'paired' | 'none';

function calculateStaggerDelays(
  pattern: StaggerPattern,
  elementCount: number,
  baseDelayMs: number,
): number[] {
  if (elementCount <= 0) return [];
  if (elementCount === 1 || pattern === 'none') return new Array(elementCount).fill(0);
  switch (pattern) {
    case 'cascade-down':
    case 'wave':
      return Array.from({ length: elementCount }, (_, i) => i * baseDelayMs);
    case 'cascade-up':
      return Array.from({ length: elementCount }, (_, i) => (elementCount - 1 - i) * baseDelayMs);
    case 'origin-burst': {
      const center = Math.floor(elementCount / 2);
      return Array.from({ length: elementCount }, (_, i) => Math.abs(i - center) * baseDelayMs);
    }
    case 'paired':
      return Array.from({ length: elementCount }, (_, i) => Math.floor(i / 2) * baseDelayMs);
    default:
      return new Array(elementCount).fill(0);
  }
}

const MIN_HOLD_TIME = 800;       // even decorative elements need 800ms to register
const ENTRANCE_PADDING = 700;    // time to "arrive" at the scene
const EXIT_PADDING = 500;        // time to "digest" before exiting

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export function computeHoldTime(text: string, speed: SpeedPreset): number {
  const words = wordCount(text);
  if (words === 0) return MIN_HOLD_TIME;
  return Math.max(MIN_HOLD_TIME, words * MS_PER_WORD[speed]);
}

export interface ElementTiming {
  entranceDuration: number;
  holdTime: number;
  exitDuration: number;
  delay: number;      // delay before this element starts (relative to scene start + padding)
  startTime: number;  // absolute time within scene
  endTime: number;    // absolute time within scene
}

export interface SceneTiming {
  elements: ElementTiming[];
  totalDuration: number;
  transitionOutDuration: number;
}

export interface ElementTimingInput {
  text: string;
  entranceDurationBase: number;  // base duration from animation database
  exitDurationBase: number;      // 0 if no exit
  explicitHold?: number;         // manual override
  explicitDelay?: number;        // additional delay
  explicitDuration?: number;     // element-level duration override
  /** Element role for timing adjustments (headings get 1.3x hold time) */
  role?: string;
}

export interface SceneTimingOptions {
  /** Override inter-element gap with scene-type stagger delay */
  sceneStaggerDelayMs?: number;
  /** Stagger pattern from composition.ts scene type */
  staggerPattern?: StaggerPattern;
  /** Micro-pause after first heading (from choreography plan) */
  microPauseMs?: number;
  /** Whether first element is a heading (for micro-pause) */
  firstElementIsHeading?: boolean;
}

export function computeSceneTiming(
  elements: ElementTimingInput[],
  speed: SpeedPreset,
  entranceSpeed: SpeedPreset,
  transitionOutDuration: number,
  explicitSceneDuration?: number,
  options?: SceneTimingOptions,
): SceneTiming {
  const speedMult = ENTRANCE_SPEED_MULTIPLIERS[entranceSpeed];
  const defaultGap = INTER_ELEMENT_GAP[speed];
  const gap = options?.sceneStaggerDelayMs ?? defaultGap;
  const pattern = options?.staggerPattern;
  const microPauseMs = options?.microPauseMs ?? 0;
  const firstIsHeading = options?.firstElementIsHeading ?? false;

  // For non-cascade patterns, use parallel model (stagger delays from ENTRANCE_PADDING)
  const useParallelModel = pattern && pattern !== 'cascade-down' && pattern !== 'none';
  const staggerDelays = useParallelModel
    ? calculateStaggerDelays(pattern, elements.length, gap)
    : null;

  let cursor = ENTRANCE_PADDING;
  const computed: ElementTiming[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const entranceDuration = Math.round(el.entranceDurationBase * speedMult);
    const isHeading = el.role === 'heading' || el.role === 'hero-heading' || el.role === 'cta';
    const holdTime = el.explicitHold ?? Math.round(computeHoldTime(el.text, speed) * (isHeading ? 1.3 : 1.0));
    const exitDuration = Math.round(el.exitDurationBase * speedMult);
    const extraDelay = el.explicitDelay ?? 0;

    let startTime: number;
    if (staggerDelays) {
      // Parallel model: all elements start from ENTRANCE_PADDING + their stagger offset
      startTime = ENTRANCE_PADDING + staggerDelays[i] + extraDelay;
    } else {
      // Sequential model (cascade-down or no pattern): cursor-based
      startTime = cursor + extraDelay;
    }

    // Micro-pause: add extra delay after the first heading
    if (i === 1 && firstIsHeading && microPauseMs > 0) {
      if (staggerDelays) {
        startTime += microPauseMs;
      } else {
        cursor += microPauseMs;
        startTime = cursor + extraDelay;
      }
    }

    const endTime = startTime + entranceDuration + holdTime + exitDuration;

    computed.push({
      entranceDuration,
      holdTime,
      exitDuration,
      delay: extraDelay,
      startTime,
      endTime,
    });

    if (!staggerDelays) {
      cursor = startTime + entranceDuration + gap;
    }
  }

  // Scene ends after last element finishes + exit padding
  const lastEnd = computed.length > 0
    ? Math.max(...computed.map(e => e.endTime))
    : ENTRANCE_PADDING;
  const naturalDuration = lastEnd + EXIT_PADDING;

  const totalDuration = explicitSceneDuration
    ? parseMs(explicitSceneDuration)
    : naturalDuration;

  return {
    elements: computed,
    totalDuration,
    transitionOutDuration,
  };
}

/** Parse a duration that might be a number (ms) or already ms */
function parseMs(val: number): number {
  return Math.round(val);
}

export function parseDurationStr(str: string): number {
  if (str.endsWith('ms')) return parseFloat(str);
  if (str.endsWith('s')) return parseFloat(str) * 1000;
  return parseFloat(str);
}

export function totalVideoFrames(totalDurationMs: number, fps: number): number {
  return Math.ceil(totalDurationMs / 1000 * fps);
}

// ─── Frame-addressed timing (v3) ─────────────────────────────

export function msToFrames(ms: number, fps: number): number {
  return Math.round(ms * fps / 1000);
}

export function framesToMs(frames: number, fps: number): number {
  return Math.round(frames * 1000 / fps);
}

export interface ElementTimingFrames {
  entranceDurationFrames: number;
  holdTimeFrames: number;
  exitDurationFrames: number;
  delayFrames: number;
  startFrame: number;    // absolute frame within scene
  endFrame: number;
}

export interface SceneTimingFrames {
  elements: ElementTimingFrames[];
  totalDurationFrames: number;
  totalDurationMs: number;
  transitionOutDurationFrames: number;
}

/**
 * Compute scene timing and convert to frames.
 * Wrapper around computeSceneTiming that adds frame conversions.
 */
export function computeSceneTimingFrames(
  elements: ElementTimingInput[],
  speed: SpeedPreset,
  entranceSpeed: SpeedPreset,
  transitionOutDuration: number,
  fps: number,
  explicitSceneDuration?: number,
  options?: SceneTimingOptions,
): SceneTimingFrames {
  const msTiming = computeSceneTiming(elements, speed, entranceSpeed, transitionOutDuration, explicitSceneDuration, options);

  return {
    elements: msTiming.elements.map(e => ({
      entranceDurationFrames: msToFrames(e.entranceDuration, fps),
      holdTimeFrames: msToFrames(e.holdTime, fps),
      exitDurationFrames: msToFrames(e.exitDuration, fps),
      delayFrames: msToFrames(e.delay, fps),
      startFrame: msToFrames(e.startTime, fps),
      endFrame: msToFrames(e.endTime, fps),
    })),
    totalDurationFrames: msToFrames(msTiming.totalDuration, fps),
    totalDurationMs: msTiming.totalDuration,
    transitionOutDurationFrames: msToFrames(msTiming.transitionOutDuration, fps),
  };
}

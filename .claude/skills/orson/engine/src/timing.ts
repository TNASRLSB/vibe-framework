// Duration computation algorithm
// Scene duration is computed from text content + reading speed preset

import type { SpeedPreset } from './presets.js';
import { MS_PER_WORD, INTER_ELEMENT_GAP, ENTRANCE_SPEED_MULTIPLIERS } from './presets.js';
import { calculateStaggerDelays, type StaggerPattern } from './choreography.js';

const MIN_HOLD_TIME = 500;
const ENTRANCE_PADDING = 500;
const EXIT_PADDING = 300;

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
    const holdTime = el.explicitHold ?? computeHoldTime(el.text, speed);
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

// Duration computation algorithm
// Scene duration is computed from text content + reading speed preset

import type { SpeedPreset } from './presets.js';
import { MS_PER_WORD, INTER_ELEMENT_GAP, ENTRANCE_SPEED_MULTIPLIERS } from './presets.js';

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

export function computeSceneTiming(
  elements: ElementTimingInput[],
  speed: SpeedPreset,
  entranceSpeed: SpeedPreset,
  transitionOutDuration: number,
  explicitSceneDuration?: number,
): SceneTiming {
  const speedMult = ENTRANCE_SPEED_MULTIPLIERS[entranceSpeed];
  const gap = INTER_ELEMENT_GAP[speed];

  let cursor = ENTRANCE_PADDING;
  const computed: ElementTiming[] = [];

  for (const el of elements) {
    const entranceDuration = Math.round(el.entranceDurationBase * speedMult);
    const holdTime = el.explicitHold ?? computeHoldTime(el.text, speed);
    const exitDuration = Math.round(el.exitDurationBase * speedMult);
    const extraDelay = el.explicitDelay ?? 0;

    const startTime = cursor + extraDelay;
    const endTime = startTime + entranceDuration + holdTime + exitDuration;

    computed.push({
      entranceDuration,
      holdTime,
      exitDuration,
      delay: extraDelay,
      startTime,
      endTime,
    });

    cursor = startTime + entranceDuration + gap;
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

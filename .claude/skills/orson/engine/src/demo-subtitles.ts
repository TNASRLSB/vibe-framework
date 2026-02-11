// Demo subtitle generation — WebVTT format

import type { DemoTimeline } from './demo-timeline.js';
import type { DemoScript } from './demo-script.js';

/**
 * Generate WebVTT subtitle file from demo timeline and script.
 * Each step's narration becomes a subtitle cue.
 */
export function generateWebVTT(timeline: DemoTimeline, script: DemoScript): string {
  const lines: string[] = ['WEBVTT', ''];

  for (const step of timeline.steps) {
    const stepDef = script.steps[step.stepIndex];
    if (!stepDef?.narration) continue;

    const start = formatVTTTime(step.narrationStart);
    const end = formatVTTTime(step.narrationEnd);
    const text = stepDef.narration;

    lines.push(`${step.stepIndex + 1}`);
    lines.push(`${start} --> ${end}`);
    lines.push(text);
    lines.push('');
  }

  return lines.join('\n');
}

function formatVTTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

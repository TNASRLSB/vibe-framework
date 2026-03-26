// Demo subtitle generation — WebVTT format
// Supports word-wrap for long lines, empty text validation, and cue positioning

import type { DemoTimeline } from './demo-timeline.js';
import type { DemoScript } from './demo-script.js';

const MAX_LINE_LENGTH = 80;

/**
 * Word-wrap text to MAX_LINE_LENGTH characters per line.
 * Splits on word boundaries for natural reading.
 */
function wrapText(text: string): string {
  if (text.length <= MAX_LINE_LENGTH) return text;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= MAX_LINE_LENGTH) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
}

/**
 * Generate WebVTT subtitle file from demo timeline and script.
 * Each step's narration becomes a subtitle cue.
 *
 * Features:
 * - Skips empty narration strings
 * - Word-wraps lines > 80 characters
 * - Supports subtitle position (top/bottom/center)
 */
export function generateWebVTT(timeline: DemoTimeline, script: DemoScript): string {
  const lines: string[] = ['WEBVTT', ''];
  const position = script.subtitles.style ?? 'bottom';

  // VTT position settings
  const positionSetting =
    position === 'top' ? ' line:10%' :
    position === 'center' ? ' line:50%' :
    ''; // bottom is VTT default

  for (const step of timeline.steps) {
    const stepDef = script.steps[step.stepIndex];
    if (!stepDef?.narration) continue;

    // Skip empty or whitespace-only narration
    const trimmed = stepDef.narration.trim();
    if (trimmed.length === 0) continue;

    const start = formatVTTTime(step.narrationStart);
    const end = formatVTTTime(step.narrationEnd);
    const text = wrapText(trimmed);

    lines.push(`${step.stepIndex + 1}`);
    lines.push(`${start} --> ${end}${positionSetting}`);
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

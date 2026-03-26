// Subtitle generation from scene timeline — outputs SRT or VTT files

export interface SceneTiming {
  startMs: number;
  endMs: number;
  text: string;
}

/**
 * Format milliseconds as SRT timestamp: HH:MM:SS,mmm
 */
function formatSRT(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const milli = Math.floor(ms % 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(milli).padStart(3, '0')}`;
}

/**
 * Format milliseconds as VTT timestamp: HH:MM:SS.mmm
 */
function formatVTT(ms: number): string {
  return formatSRT(ms).replace(',', '.');
}

/**
 * Generate SRT subtitle content from scene timings.
 */
export function generateSRT(scenes: SceneTiming[]): string {
  let srt = '';
  let index = 1;
  for (const scene of scenes) {
    if (!scene.text.trim()) continue;
    srt += `${index}\n`;
    srt += `${formatSRT(scene.startMs)} --> ${formatSRT(scene.endMs)}\n`;
    srt += `${scene.text}\n\n`;
    index++;
  }
  return srt;
}

/**
 * Generate WebVTT subtitle content from scene timings.
 */
export function generateVTT(scenes: SceneTiming[]): string {
  let vtt = 'WEBVTT\n\n';
  let index = 1;
  for (const scene of scenes) {
    if (!scene.text.trim()) continue;
    vtt += `${index}\n`;
    vtt += `${formatVTT(scene.startMs)} --> ${formatVTT(scene.endMs)}\n`;
    vtt += `${scene.text}\n\n`;
    index++;
  }
  return vtt;
}

/**
 * Extract scene timings with text from a timeline for subtitle generation.
 * Combines all text elements in each scene into a single subtitle line.
 */
export function extractSceneTimings(timelineScenes: Array<{
  startMs: number;
  durationMs: number;
  elements: Array<{ element: { type: string; text?: string; title?: string; items?: Array<{ title?: string; text?: string }> } }>;
}>): SceneTiming[] {
  return timelineScenes.map(scene => {
    const texts: string[] = [];
    for (const el of scene.elements) {
      const cfg = el.element;
      if (cfg.type === 'heading' || cfg.type === 'text' || cfg.type === 'button') {
        if (cfg.text) texts.push(cfg.text);
      } else if (cfg.type === 'card') {
        if (cfg.title) texts.push(cfg.title);
      } else if (cfg.type === 'card-group' && cfg.items) {
        for (const item of cfg.items) {
          if (item.title) texts.push(item.title);
        }
      }
    }
    return {
      startMs: scene.startMs,
      endMs: scene.startMs + scene.durationMs,
      text: texts.join(' — '),
    };
  });
}

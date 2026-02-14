// Text storyboard generator — previews the video timeline without rendering

import type { Timeline } from './timeline.js';
import type { Config } from './config.js';

export function generateStoryboard(config: Config, timeline: Timeline): string {
  const lines: string[] = [];

  lines.push('━'.repeat(50));
  lines.push(`STORYBOARD: ${config.video.output.split('/').pop()?.replace('.mp4', '') ?? 'video'}`);
  lines.push(`Format: ${config.video.format} | ${config.video.fps}fps`);
  lines.push(`Mode: ${config.video.mode} | Speed: ${config.video.speed} | Codec: ${config.video.codec}`);
  lines.push('━'.repeat(50));
  lines.push('');

  for (const scene of timeline.scenes) {
    const durStr = (scene.durationMs / 1000).toFixed(1);
    lines.push(`Scene ${scene.sceneIndex + 1}: "${scene.scene.name}" (${durStr}s)`);

    for (let i = 0; i < scene.elements.length; i++) {
      const el = scene.elements[i];
      const isLast = i === scene.elements.length - 1 && !scene.transition;
      const prefix = isLast && i === scene.elements.length - 1 ? '└─' : '├─';
      const timeStr = ((el.startMs - scene.startMs) / 1000).toFixed(1);
      const holdStr = (el.holdMs / 1000).toFixed(1);

      const entranceName = el.entranceId.toUpperCase().replace(/-/g, '-');
      const textPreview = el.text.length > 40 ? el.text.slice(0, 37) + '...' : el.text;
      const typeLabel = el.element.type;

      lines.push(`  ${prefix} [${timeStr}s] ${entranceName}: ${typeLabel} "${textPreview}" (hold ${holdStr}s)`);

      if (el.exitId) {
        lines.push(`  │   exit: ${el.exitId}`);
      }
    }

    if (scene.transition) {
      const transDurStr = (scene.transitionOutDurationMs / 1000).toFixed(1);
      lines.push(`  └─ → ${scene.transition.type.toUpperCase()} (${transDurStr}s) to Scene ${scene.sceneIndex + 2}`);
    }

    lines.push('');
  }

  const totalStr = (timeline.totalDurationMs / 1000).toFixed(1);
  lines.push(`Total duration: ${totalStr}s`);
  lines.push(`Total frames: ${timeline.totalFrames}`);
  lines.push('━'.repeat(50));

  return lines.join('\n');
}

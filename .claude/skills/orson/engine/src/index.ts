// orson — main entry point
// Usage: npx tsx src/index.ts <command> [file]

import { resolve, dirname } from 'path';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { initCapture, captureFrames, closeCapture } from './capture.js';
import { startEncoder } from './encode.js';
import { readDesignTokens } from './ux-bridge.js';
import { FORMAT_PRESETS } from './presets.js';
import type { CodecId } from './presets.js';
import { analyzeFolder } from './analyze-folder.js';
import { analyzeUrl } from './analyze-url.js';
import { generateConfig } from './autogen.js';
import { parseHTMLFile, type HTMLConfig } from './html-parser.js';
import { computeSceneTiming, type ElementTimingInput } from './timing.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const configPath = args[1];

  if (!command) {
    console.log(`orson — Programmatic video from web elements

Commands:
  render <file.html>        Render video from HTML config
  analyze-folder <path>     Analyze project folder, output extracted content as JSON
  analyze-url <url>         Analyze URL, output extracted content as JSON
  autogen <json> [options]  Generate HTML from extracted content JSON
  formats                   List format presets
  entrances                 List available entrances
`);
    return;
  }

  if (command === 'formats') {
    console.log('Format Presets:\n');
    for (const [id, p] of Object.entries(FORMAT_PRESETS)) {
      console.log(`  ${id.padEnd(20)} ${p.width}x${p.height} (${p.aspect})`);
    }
    return;
  }

  if (command === 'entrances') {
    const { ENTRANCES } = await import('./actions.js');
    console.log('Available Entrances:\n');
    for (const [id, def] of Object.entries(ENTRANCES)) {
      console.log(`  ${id.padEnd(20)} [${def.energy}] ${def.name}`);
    }
    return;
  }

  if (command === 'analyze-folder') {
    const folderPath = args[1];
    if (!folderPath) { console.error('Error: folder path required'); process.exit(1); }
    const content = analyzeFolder(resolve(folderPath));
    console.log(JSON.stringify(content, null, 2));
    return;
  }

  if (command === 'analyze-url') {
    const url = args[1];
    if (!url) { console.error('Error: URL required'); process.exit(1); }
    const content = await analyzeUrl(url);
    console.log(JSON.stringify(content, null, 2));
    return;
  }

  if (command === 'autogen') {
    const jsonPath = args[1];
    if (!jsonPath) { console.error('Error: content JSON path required'); process.exit(1); }
    const content = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
    const format = args.find(a => a.startsWith('--format='))?.split('=')[1] ?? 'vertical-9x16';
    if (!FORMAT_PRESETS[format]) {
      console.error(`Error: unknown format "${format}". Use "formats" to list presets.`);
      process.exit(1);
    }
    const dsPath = args.find(a => a.startsWith('--design-system='))?.split('=')[1];
    const designTokens = dsPath ? readDesignTokens(resolve(dsPath)) ?? undefined : undefined;
    const options = {
      format,
      mode: (args.find(a => a.startsWith('--mode='))?.split('=')[1] ?? 'safe') as 'safe' | 'chaos' | 'hybrid',
      speed: (args.find(a => a.startsWith('--speed='))?.split('=')[1] ?? 'normal') as any,
      intent: args.find(a => a.startsWith('--intent='))?.split('=')[1] ?? 'promo',
      designTokens,
    };
    const html = generateConfig(content, options);
    console.log(html);
    return;
  }

  if (!configPath) {
    console.error('Error: file path required');
    process.exit(1);
  }

  const fullPath = resolve(configPath);

  if (command === 'render') {
    const htmlConfig = parseHTMLFile(fullPath);
    await renderHTML(htmlConfig, fullPath);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

// ─── HTML render ────────────────────────────────────────────

async function renderHTML(htmlConfig: HTMLConfig, htmlPath: string) {
  const fmt = FORMAT_PRESETS[htmlConfig.video.format];
  const width = fmt?.width ?? 1080;
  const height = fmt?.height ?? 1920;
  const fps = htmlConfig.video.fps;
  const speed = htmlConfig.video.speed;

  // Build timeline from scene metadata
  let totalDurationMs = 0;
  const sceneDurations: number[] = [];

  for (const scene of htmlConfig.scenes) {
    if (scene.duration) {
      sceneDurations.push(scene.duration);
      totalDurationMs += scene.duration;
    } else {
      const elemInputs: ElementTimingInput[] = scene.elementTexts.map(text => ({
        text,
        entranceDurationBase: 350,
        exitDurationBase: 0,
      }));
      const timing = computeSceneTiming(elemInputs, speed, speed, 0);
      sceneDurations.push(timing.totalDuration);
      totalDurationMs += timing.totalDuration;
    }
  }

  const totalFrames = Math.ceil(totalDurationMs / 1000 * fps);

  // Print summary
  console.log('━'.repeat(50));
  console.log(`Format: ${htmlConfig.video.format} | ${fps}fps`);
  console.log(`Mode: ${htmlConfig.video.mode} | Speed: ${speed}`);
  console.log('━'.repeat(50));
  for (let i = 0; i < htmlConfig.scenes.length; i++) {
    const s = htmlConfig.scenes[i];
    const dur = (sceneDurations[i] / 1000).toFixed(1);
    console.log(`  Scene ${i + 1}: "${s.name}" (${dur}s)${s.transitionOut ? ` → ${s.transitionOut}` : ''}`);
  }
  console.log(`Total: ${(totalDurationMs / 1000).toFixed(1)}s | ${totalFrames} frames`);
  console.log('━'.repeat(50));
  console.log('\nRendering...\n');

  // Output path
  const outputPath = resolve(dirname(htmlPath), htmlConfig.video.output);
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  // Start encoder
  const encoder = startEncoder({
    fps,
    codec: htmlConfig.video.codec as CodecId,
    outputPath,
    onLog: (msg) => process.stderr.write(msg + '\n'),
  });

  // Capture frames
  const startTime = Date.now();
  const session = await initCapture({
    width, height, fps, totalFrames, htmlPath,
  });

  await captureFrames(session, {
    width, height, fps, totalFrames, htmlPath,
    onFrame: (frame, total) => {
      if (frame % 30 === 0 || frame === total) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const fpsActual = (frame / parseFloat(elapsed)).toFixed(1);
        console.log(`  Frame ${frame}/${total} (${elapsed}s, ~${fpsActual} fps)`);
      }
    },
  }, async (buffer) => {
    await encoder.write(buffer);
  });

  await closeCapture(session);
  await encoder.finish();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone: ${outputPath}`);
  console.log(`${totalFrames} frames in ${totalTime}s`);
}

main().catch(err => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});

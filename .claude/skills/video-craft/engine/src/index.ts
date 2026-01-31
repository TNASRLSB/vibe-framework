// video-craft — main entry point
// Usage: node --loader ts-node/esm src/video-craft/index.ts <command> [config.yaml]

import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { parseConfigFile } from './config.js';
import { buildTimeline } from './timeline.js';
import { generateStoryboard } from './storyboard.js';
import { generateHTML } from './html-generator.js';
import { initCapture, captureFrames, closeCapture } from './capture.js';
import { startEncoder } from './encode.js';
import { readDesignTokens } from './ux-bridge.js';
import { FORMAT_PRESETS } from './presets.js';
import type { CodecId } from './presets.js';
import { analyzeFolder } from './analyze-folder.js';
import { analyzeUrl } from './analyze-url.js';
import { generateConfig } from './autogen.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const configPath = args[1];

  if (!command) {
    console.log(`video-craft — Programmatic video from web elements

Commands:
  render <config.yaml>      Render video from config
  storyboard <config.yaml>  Generate text storyboard preview
  analyze-folder <path>     Analyze project folder, output extracted content as JSON
  analyze-url <url>         Analyze URL, output extracted content as JSON
  autogen <json> [options]  Generate YAML config from extracted content JSON
  formats                   List format presets
  entrances                 List available entrances
  validate <config.yaml>    Check config for errors
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
    const options = {
      format: args.find(a => a.startsWith('--format='))?.split('=')[1] ?? 'vertical-9x16',
      mode: (args.find(a => a.startsWith('--mode='))?.split('=')[1] ?? 'safe') as 'safe' | 'chaos' | 'hybrid',
      speed: (args.find(a => a.startsWith('--speed='))?.split('=')[1] ?? 'normal') as any,
      intent: args.find(a => a.startsWith('--intent='))?.split('=')[1] ?? 'promo',
    };
    const yaml = generateConfig(content, options);
    console.log(yaml);
    return;
  }

  if (!configPath) {
    console.error('Error: config file path required');
    process.exit(1);
  }

  const fullPath = resolve(configPath);

  if (command === 'validate') {
    try {
      parseConfigFile(fullPath);
      console.log('Config is valid.');
    } catch (e: any) {
      console.error(e.message);
      process.exit(1);
    }
    return;
  }

  // Parse config
  const config = parseConfigFile(fullPath);

  // Read design tokens if specified
  const tokens = config['design-system']
    ? readDesignTokens(resolve(dirname(fullPath), config['design-system']))
    : null;

  // Build timeline
  const timeline = buildTimeline(config);

  if (command === 'storyboard') {
    console.log(generateStoryboard(config, timeline));
    return;
  }

  if (command === 'render') {
    await render(config, timeline, tokens, fullPath);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

async function render(
  config: ReturnType<typeof parseConfigFile>,
  timeline: ReturnType<typeof buildTimeline>,
  tokens: ReturnType<typeof readDesignTokens>,
  configPath: string,
) {
  // Show storyboard first
  console.log(generateStoryboard(config, timeline));
  console.log('\nRendering...\n');

  // Generate HTML
  const html = generateHTML(config, timeline, tokens ?? undefined);

  // Write HTML to temp location next to config
  const htmlPath = resolve(dirname(configPath), '.video-craft-render.html');
  writeFileSync(htmlPath, html);

  // Ensure output directory
  const outputPath = resolve(dirname(configPath), config.video.output);
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  // Get format dimensions
  const fmt = FORMAT_PRESETS[config.video.format];
  const width = fmt?.width ?? 1080;
  const height = fmt?.height ?? 1920;

  // Start encoder
  const encoder = startEncoder({
    fps: config.video.fps,
    codec: config.video.codec as CodecId,
    outputPath,
    onLog: (msg) => process.stderr.write(msg + '\n'),
  });

  // Start capture
  const startTime = Date.now();
  const session = await initCapture({
    width,
    height,
    fps: config.video.fps,
    totalFrames: timeline.totalFrames,
    htmlPath,
  });

  await captureFrames(session, {
    width,
    height,
    fps: config.video.fps,
    totalFrames: timeline.totalFrames,
    htmlPath,
    onFrame: (frame, total) => {
      if (frame % 30 === 0 || frame === total) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const fps = (frame / parseFloat(elapsed)).toFixed(1);
        console.log(`  Frame ${frame}/${total} (${elapsed}s, ~${fps} fps)`);
      }
    },
  }, async (buffer) => {
    await encoder.write(buffer);
  });

  await closeCapture(session);
  await encoder.finish();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone: ${outputPath}`);
  console.log(`${timeline.totalFrames} frames in ${totalTime}s`);

  // Clean up temp HTML
  try { require('fs').unlinkSync(htmlPath); } catch {}
}

main().catch(err => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});

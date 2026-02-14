// orson — main entry point
// Usage: npx tsx src/index.ts <command> [file]

import { resolve, dirname } from 'path';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { initCapture, captureFrames, closeCapture } from './capture.js';
import { startEncoder } from './encode.js';
import { readDesignTokens } from './ux-bridge.js';
import { FORMAT_PRESETS, DRAFT_OVERRIDES } from './presets.js';
import type { CodecId } from './presets.js';
import { analyzeFolder } from './analyze-folder.js';
import { analyzeUrl } from './analyze-url.js';
import { generateConfig } from './autogen.js';
import { parseHTMLFile, extractNarrationBrief, type HTMLConfig } from './html-parser.js';
import { computeSceneTiming, type ElementTimingInput } from './timing.js';
import { selectTrack, type VideoMeta } from './audio-selector.js';
import { trimAndLoop, fadeInOut, mergeAudioVideo, applyDucking, concatenateNarration, type DuckingEvent } from './audio-mixer.js';
import { generateSRT, generateVTT } from './subtitles.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const configPath = args[1];

  if (!command) {
    console.log(`orson — Programmatic video from web elements

Commands:
  render <file.html>             Render video from HTML config
  render <file.html> --no-audio  Render without audio
  render <file.html> --narrate   Render with TTS narration (requires TTS engine)
  render <file.html> --draft     Fast preview (half res, 15fps, ultrafast)
  render <file.html> --parallel  Render scenes in parallel (multi-core)
  demo <script.json>        Record demo video from script
  analyze-folder <path>     Analyze project folder, output extracted content as JSON
  analyze-url <url>         Analyze URL, output extracted content as JSON
  autogen <json> [options]  Generate HTML from extracted content JSON
  batch <config.json>       Batch render variants from template + variables
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

  if (command === 'demo') {
    const scriptPath = args[1];
    if (!scriptPath) { console.error('Error: demo script path required'); process.exit(1); }
    const { runDemo } = await import('./demo-capture.js');
    await runDemo(resolve(scriptPath));
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
    const noAudio = args.includes('--no-audio');
    const narrate = args.includes('--narrate') || args.includes('--tts');
    const draft = args.includes('--draft');
    const parallel = args.includes('--parallel');
    const voice = args.find(a => a.startsWith('--voice='))?.split('=')[1];
    const htmlConfig = parseHTMLFile(fullPath);
    await renderHTML(htmlConfig, fullPath, noAudio, draft, parallel, narrate, voice);
    return;
  }

  if (command === 'batch') {
    const { parseBatchConfig, runBatch } = await import('./batch.js');
    const config = parseBatchConfig(fullPath);
    const noAudio = args.includes('--no-audio');
    const draft = args.includes('--draft');
    await runBatch(config, async (htmlPath, outputPath) => {
      const htmlConfig = parseHTMLFile(htmlPath);
      // Override output path from batch config
      htmlConfig.video.output = outputPath;
      await renderHTML(htmlConfig, htmlPath, noAudio, draft);
    });
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

// ─── HTML render ────────────────────────────────────────────

async function renderHTML(htmlConfig: HTMLConfig, htmlPath: string, noAudio: boolean = false, draft: boolean = false, parallel: boolean = false, narrate: boolean = false, voice?: string) {
  const fmt = FORMAT_PRESETS[htmlConfig.video.format];
  let width = fmt?.width ?? 1080;
  let height = fmt?.height ?? 1920;
  let fps = htmlConfig.video.fps;
  const speed = htmlConfig.video.speed;

  // Draft mode: half resolution, 15fps, ultrafast encoding
  if (draft) {
    width = Math.round(width / DRAFT_OVERRIDES.widthDivisor);
    height = Math.round(height / DRAFT_OVERRIDES.heightDivisor);
    fps = DRAFT_OVERRIDES.fps;
    console.log('⚡ DRAFT MODE: %dx%d @ %dfps (ultrafast)', width, height, fps);
  }

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

  const startTime = Date.now();

  // ─── Parallel or Sequential Render ─────────────────────────
  if (parallel && htmlConfig.scenes.length >= 2) {
    const { renderParallel, buildSceneSegments } = await import('./parallel-render.js');
    let cursor = 0;
    const sceneTimings = sceneDurations.map((dur) => {
      const s = { startMs: cursor, durationMs: dur };
      cursor += dur;
      return s;
    });
    const segments = buildSceneSegments(sceneTimings, fps);
    await renderParallel({
      htmlPath, width, height, fps, totalFrames, totalDurationMs,
      codec: htmlConfig.video.codec as CodecId,
      outputPath,
      scenes: segments,
      ...(draft ? { codecOverride: DRAFT_OVERRIDES.codec } : {}),
      onProgress: (done, total) => {
        console.log(`  Segment ${done}/${total} complete`);
      },
    });
  } else {
    // Sequential render (default)
    const encoder = startEncoder({
      fps,
      codec: htmlConfig.video.codec as CodecId,
      outputPath,
      onLog: (msg) => process.stderr.write(msg + '\n'),
      ...(draft ? { codecOverride: DRAFT_OVERRIDES.codec } : {}),
    });

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
  }

  const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nVideo rendered: ${outputPath}`);
  console.log(`${totalFrames} frames in ${renderTime}s`);

  // ─── Subtitle Generation ───────────────────────────────────
  {
    const { writeFileSync } = await import('fs');
    let cursor = 0;
    const sceneTimings: Array<{ startMs: number; endMs: number; text: string }> = [];
    for (let i = 0; i < htmlConfig.scenes.length; i++) {
      const endMs = cursor + sceneDurations[i];
      const text = htmlConfig.scenes[i].elementTexts.join(' — ');
      if (text.trim()) {
        sceneTimings.push({ startMs: cursor, endMs, text });
      }
      cursor = endMs;
    }
    const srtPath = outputPath.replace(/\.mp4$/, '.srt');
    const vttPath = outputPath.replace(/\.mp4$/, '.vtt');
    writeFileSync(srtPath, generateSRT(sceneTimings));
    writeFileSync(vttPath, generateVTT(sceneTimings));
    console.log(`Subtitles: ${srtPath}`);
  }

  // ─── Audio Processing ─────────────────────────────────────
  if (!noAudio) {
    const audioDir = resolve(dirname(outputPath), '.audio-tmp');
    if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true });

    try {
      console.log('\nAdding audio...');

      // Select track based on video metadata
      const videoMeta: VideoMeta = {
        mode: htmlConfig.video.mode as VideoMeta['mode'],
        durationMs: totalDurationMs,
      };
      const track = selectTrack(videoMeta);
      console.log(`  Track: ${track.style} (${track.bpm} BPM)`);

      // Trim/loop to match video duration
      const processedTrack = resolve(audioDir, 'music-processed.mp3');
      await trimAndLoop(track.trackPath, totalDurationMs, processedTrack, track.loopable);

      // Add fade in/out
      const fadedTrack = resolve(audioDir, 'music-faded.mp3');
      await fadeInOut(processedTrack, 500, 2000, fadedTrack);

      let finalAudioPath = fadedTrack;

      // ─── TTS Narration (opt-in via --narrate) ─────────────
      if (narrate) {
        console.log('  Generating TTS narration...');
        const brief = extractNarrationBrief(htmlConfig, sceneDurations);

        if (brief.length > 0) {
          // Write narration brief JSON for narration_generator.py
          const { writeFileSync: writeBrief } = await import('fs');
          const briefPath = resolve(audioDir, 'narration-brief.json');
          const narrationOutputDir = resolve(audioDir, 'narration');
          if (!existsSync(narrationOutputDir)) mkdirSync(narrationOutputDir, { recursive: true });

          const briefData = {
            narration: {
              voice: voice ?? 'en-US-AriaNeural',
              scenes: brief.map(b => ({
                scene_index: b.sceneIndex,
                elements: [{
                  id: `scene-${b.sceneIndex}`,
                  narration_text: b.text,
                  element_type: 'combined',
                  timing: { startMs: b.startMs, endMs: b.endMs },
                }],
              })),
            },
          };
          writeBrief(briefPath, JSON.stringify(briefData, null, 2));

          // Run narration generator
          const narrationScript = resolve(dirname(outputPath), '..', '.claude/skills/orson/engine/audio/narration_generator.py');
          const altScript = resolve(dirname(import.meta.url.replace('file://', '')), '..', 'audio', 'narration_generator.py');
          const scriptPath = existsSync(narrationScript) ? narrationScript : altScript;

          if (existsSync(scriptPath)) {
            const { execSync } = await import('child_process');
            try {
              execSync(`python3 "${scriptPath}" "${briefPath}" "${narrationOutputDir}"`, {
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 120000,
              });

              // Collect generated narration files
              const { readdirSync } = await import('fs');
              const narrationFiles = readdirSync(narrationOutputDir)
                .filter(f => f.endsWith('.mp3'))
                .map(f => ({
                  path: resolve(narrationOutputDir, f),
                  startMs: brief.find(b => f.includes(`scene-${b.sceneIndex}`))?.startMs ?? 0,
                }));

              if (narrationFiles.length > 0) {
                // Concatenate narration clips at their timestamps
                const narrationTrack = resolve(audioDir, 'narration-combined.mp3');
                await concatenateNarration(narrationFiles, totalDurationMs, narrationTrack);

                // Apply ducking to music during narration
                const duckEvents: DuckingEvent[] = [];
                for (const b of brief) {
                  duckEvents.push({ time_ms: b.startMs, action: 'duck', target_gain: 0.15 });
                  duckEvents.push({ time_ms: b.endMs, action: 'release', target_gain: 1.0 });
                }
                const duckedMusic = resolve(audioDir, 'music-ducked.mp3');
                await applyDucking(fadedTrack, duckEvents, 1.0, duckedMusic);

                // Mix ducked music + narration
                const { mixTracks } = await import('./audio-mixer.js');
                const mixedAudio = resolve(audioDir, 'audio-mixed.mp3');
                await mixTracks([
                  { path: duckedMusic, gain: 1.0 },
                  { path: narrationTrack, gain: 1.2 },
                ], mixedAudio);

                finalAudioPath = mixedAudio;
                console.log(`  Narration: ${narrationFiles.length} clips mixed`);
              }
            } catch (ttsErr: any) {
              console.log(`  Narration skipped: ${ttsErr.message?.slice(0, 100)}`);
            }
          } else {
            console.log('  Narration skipped: narration_generator.py not found');
          }
        }
      }

      // Merge audio into video
      const finalOutput = outputPath.replace(/\.mp4$/, '-audio.mp4');
      await mergeAudioVideo(outputPath, finalAudioPath, finalOutput);

      // Replace original with audio version
      const { renameSync, unlinkSync } = await import('fs');
      unlinkSync(outputPath);
      renameSync(finalOutput, outputPath);

      console.log(`  Audio merged: ${outputPath}`);
    } catch (err: any) {
      console.log(`\n  ⚠ WARNING: ${err.message}`);
      console.log('  Video rendered without music. To fix:');
      console.log('    bash .claude/skills/orson/engine/audio/download-library.sh');
    } finally {
      // Clean up temp files
      const { rmSync } = await import('fs');
      try { rmSync(audioDir, { recursive: true }); } catch {}
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone: ${outputPath} (${totalTime}s total)`);
}

main().catch(err => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});

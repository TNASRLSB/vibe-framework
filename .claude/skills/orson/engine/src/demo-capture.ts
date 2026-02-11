// Demo capture — real-time Playwright recording with action execution
// Includes the full runDemo orchestrator that drives the entire pipeline

import { chromium, type Browser, type Page } from 'playwright';
import { resolve, dirname } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

import { parseDemoScript, generateNarrationBrief, type DemoScript, type AuthStep } from './demo-script.js';
import { buildDemoTimeline, type DemoTimeline, type NarrationManifest } from './demo-timeline.js';
import { injectCursor, animateCursor, injectZoomOverlay, applyZoom, resetZoom, highlightElement } from './demo-director.js';
import { selectTrack, type VideoMeta } from './audio-selector.js';
import { trimAndLoop, applyDucking, fadeInOut, concatenateNarration, mixTracks, mergeAudioVideo, type DuckingEvent } from './audio-mixer.js';
import { generateWebVTT } from './demo-subtitles.js';
import { FORMAT_PRESETS } from './presets.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Frame Capture ──────────────────────────────────────────

interface CaptureSession {
  browser: Browser;
  page: Page;
  width: number;
  height: number;
  fps: number;
}

async function initDemoCapture(
  url: string,
  width: number,
  height: number,
): Promise<CaptureSession> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  return { browser, page, width, height, fps: 30 };
}

async function closeDemoCapture(session: CaptureSession): Promise<void> {
  await session.browser.close();
}

// ─── Auth Execution ─────────────────────────────────────────

async function executeAuth(page: Page, authSteps: AuthStep[]): Promise<void> {
  for (const step of authSteps) {
    switch (step.action) {
      case 'navigate':
        if (step.url) await page.goto(step.url, { waitUntil: 'networkidle', timeout: step.timeout ?? 15000 });
        break;
      case 'click':
        if (step.selector) await page.click(step.selector, { timeout: step.timeout ?? 5000 });
        break;
      case 'fill':
        if (step.selector && step.value) {
          await page.click(step.selector, { timeout: step.timeout ?? 5000 });
          await page.fill(step.selector, step.value);
        }
        break;
      case 'wait':
        if (step.waitFor) await page.waitForSelector(step.waitFor, { timeout: step.timeout ?? 10000 });
        else await page.waitForTimeout(step.timeout ?? 2000);
        break;
    }
  }
}

// ─── Action Execution ───────────────────────────────────────

async function executeAction(
  page: Page,
  action: string,
  selector?: string,
  value?: string,
  typingSpeed?: number,
): Promise<void> {
  switch (action) {
    case 'click':
      if (selector) {
        await animateCursor(page, selector, 500);
        await page.click(selector, { timeout: 5000 });
      }
      break;

    case 'fill':
      if (selector && value) {
        await animateCursor(page, selector, 500);
        await page.click(selector, { timeout: 5000 });
        // Type character by character for visual effect
        for (const char of value) {
          await page.keyboard.type(char, { delay: typingSpeed ?? 60 });
        }
      }
      break;

    case 'scroll':
      await page.evaluate((sel) => {
        const el = sel ? document.querySelector(sel) : null;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else window.scrollBy({ top: 300, behavior: 'smooth' });
      }, selector ?? null);
      await page.waitForTimeout(600);
      break;

    case 'hover':
      if (selector) {
        await animateCursor(page, selector, 500);
        await page.hover(selector, { timeout: 5000 });
      }
      break;

    case 'navigate':
      if (value) await page.goto(value, { waitUntil: 'networkidle', timeout: 15000 });
      break;

    case 'wait':
      // Just wait — handled by timeline
      break;

    case 'none':
    default:
      break;
  }
}

// ─── Recording Loop ─────────────────────────────────────────

interface RecordingOptions {
  session: CaptureSession;
  timeline: DemoTimeline;
  script: DemoScript;
  outputFramesDir: string;
}

async function recordDemo(opts: RecordingOptions): Promise<void> {
  const { session, timeline, script, outputFramesDir } = opts;
  const { page } = session;
  const frameDuration = 1000 / session.fps;
  const totalFrames = Math.ceil(timeline.totalDurationMs / 1000 * session.fps);

  // Inject visual overlays
  await injectCursor(page);
  await injectZoomOverlay(page);

  console.log(`  Recording ${totalFrames} frames...`);

  let currentStepIdx = -1;
  let actionExecuted = new Set<number>();

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentTimeMs = frame * frameDuration;

    // Find active step
    const activeStep = timeline.steps.find(
      s => currentTimeMs >= s.stepStart && currentTimeMs < s.stepEnd
    );

    if (activeStep && activeStep.stepIndex !== currentStepIdx) {
      currentStepIdx = activeStep.stepIndex;
      const step = script.steps[activeStep.stepIndex];

      // Apply zoom at step start
      if (step.zoom && step.zoom > 1 && step.selector) {
        await applyZoom(page, step.selector, step.zoom, script.zoomTransitionMs);
      }

      // Highlight target element
      if (step.highlight && step.selector) {
        await highlightElement(page, step.selector, activeStep.stepEnd - activeStep.stepStart);
      }
    }

    // Execute action at the right time
    if (activeStep && !actionExecuted.has(activeStep.stepIndex)) {
      if (currentTimeMs >= activeStep.actionStart) {
        actionExecuted.add(activeStep.stepIndex);
        const step = script.steps[activeStep.stepIndex];
        await executeAction(page, step.action, step.selector, step.value, step.typingSpeed);
      }
    }

    // Reset zoom between steps
    if (!activeStep && currentStepIdx >= 0) {
      await resetZoom(page, script.zoomTransitionMs);
      currentStepIdx = -1;
    }

    // Wait for waitFor selector if specified
    if (activeStep) {
      const step = script.steps[activeStep.stepIndex];
      if (step.waitFor) {
        try {
          await page.waitForSelector(step.waitFor, { timeout: 100 });
        } catch {
          // Not ready yet, continue recording
        }
      }
    }

    // Capture frame
    const buffer = await page.screenshot({ type: 'png' });
    const paddedFrame = String(frame).padStart(6, '0');
    writeFileSync(resolve(outputFramesDir, `frame-${paddedFrame}.png`), buffer);

    // Progress reporting
    if (frame % 30 === 0 || frame === totalFrames - 1) {
      const pct = ((frame / totalFrames) * 100).toFixed(0);
      console.log(`  Frame ${frame}/${totalFrames} (${pct}%)`);
    }
  }

  // Final zoom reset
  await resetZoom(page, 200);
}

// ─── FFmpeg Encode from Frames ──────────────────────────────

async function encodeFrames(
  framesDir: string,
  fps: number,
  codec: string,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', `${framesDir}/frame-%06d.png`,
      '-c:v', codec === 'h265' ? 'libx265' : codec === 'av1' ? 'libaom-av1' : 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'medium',
      '-crf', '23',
      outputPath,
    ];

    const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg encode failed with code ${code}`));
    });
    proc.on('error', reject);
  });
}

// ─── Orchestrator ───────────────────────────────────────────

/**
 * runDemo — the full demo pipeline:
 * 1. Parse script
 * 2. Generate narration (via narration_generator.py)
 * 3. Build timeline
 * 4. Select music track (if enabled)
 * 5. Record video (Playwright frame capture)
 * 6. Process audio: concatenate narration, process music, mix, merge
 * 7. Generate subtitles
 */
export async function runDemo(scriptPath: string): Promise<void> {
  const startTime = Date.now();

  // Step 1: Parse script
  console.log('Step 1: Parsing demo script...');
  const script = parseDemoScript(scriptPath);
  console.log(`  URL: ${script.url}`);
  console.log(`  Steps: ${script.steps.length}`);
  console.log(`  Voice: ${script.voice}`);

  // Resolve paths
  const outputPath = resolve(dirname(scriptPath), script.output);
  const outputDir = dirname(outputPath);
  const workDir = resolve(outputDir, '.demo-work');
  const framesDir = resolve(workDir, 'frames');
  const narrationDir = resolve(workDir, 'narration');

  mkdirSync(framesDir, { recursive: true });
  mkdirSync(narrationDir, { recursive: true });

  // Step 2: Generate narration
  console.log('\nStep 2: Generating narration...');
  const brief = generateNarrationBrief(script);
  const briefPath = resolve(workDir, 'narration-brief.json');
  writeFileSync(briefPath, JSON.stringify(brief, null, 2));

  let manifest: NarrationManifest = brief as NarrationManifest;

  try {
    const narrationScript = resolve(__dirname, '..', 'audio', 'narration_generator.py');
    if (existsSync(narrationScript)) {
      await new Promise<void>((res, rej) => {
        const proc = spawn('python3', [narrationScript, briefPath, narrationDir], {
          stdio: ['pipe', 'inherit', 'inherit'],
        });
        proc.on('close', (code) => code === 0 ? res() : rej(new Error(`Narration generator exited with ${code}`)));
        proc.on('error', rej);
      });

      // Read updated manifest
      const manifestPath = resolve(narrationDir, 'manifest.json');
      if (existsSync(manifestPath)) {
        const { readFileSync } = await import('fs');
        manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      }
    } else {
      console.log('  narration_generator.py not found, using estimated durations');
    }
  } catch (err: any) {
    console.log(`  Narration generation failed: ${err.message}`);
    console.log('  Using estimated durations');
  }

  // Step 3: Build timeline
  console.log('\nStep 3: Building timeline...');
  const timeline = buildDemoTimeline(script, manifest);
  console.log(`  Total duration: ${(timeline.totalDurationMs / 1000).toFixed(1)}s`);
  for (const step of timeline.steps) {
    console.log(`  Step ${step.stepIndex + 1}: ${(step.stepStart / 1000).toFixed(1)}s → ${(step.stepEnd / 1000).toFixed(1)}s`);
  }

  // Step 4: Record video
  console.log('\nStep 4: Recording demo...');
  const fmt = FORMAT_PRESETS[script.format];
  const width = fmt?.width ?? 1920;
  const height = fmt?.height ?? 1080;

  const session = await initDemoCapture(script.url, width, height);
  session.fps = script.fps;

  // Execute auth if present
  if (script.auth && script.auth.length > 0) {
    console.log('  Running auth steps...');
    await executeAuth(session.page, script.auth);
    console.log('  Auth complete');
  }

  // Navigate to demo URL (may have changed during auth)
  await session.page.goto(script.url, { waitUntil: 'networkidle', timeout: 30000 });

  await recordDemo({
    session,
    timeline,
    script,
    outputFramesDir: framesDir,
  });

  await closeDemoCapture(session);

  // Step 5: Encode video
  console.log('\nStep 5: Encoding video...');
  const silentVideoPath = resolve(workDir, 'video-silent.mp4');
  await encodeFrames(framesDir, script.fps, script.codec, silentVideoPath);
  console.log('  Video encoded');

  // Step 6: Process audio
  console.log('\nStep 6: Processing audio...');

  // 6a: Concatenate narration files at correct timestamps
  const narrationFiles = timeline.steps.map((step, i) => {
    const audioFile = resolve(narrationDir, `narr-step-${i}.mp3`);
    return { path: audioFile, startMs: step.narrationStart };
  }).filter(f => existsSync(f.path));

  const concatenatedNarration = resolve(workDir, 'narration-full.mp3');
  await concatenateNarration(narrationFiles, timeline.totalDurationMs, concatenatedNarration);

  // 6b: Select and process music track
  let finalAudioPath = concatenatedNarration;

  if (script.music.enabled) {
    console.log('  Processing music...');

    const videoMeta: VideoMeta = {
      mode: 'safe',
      durationMs: timeline.totalDurationMs,
      styleHint: script.music.style !== 'auto' ? script.music.style : undefined,
    };
    const track = selectTrack(videoMeta);
    console.log(`  Track: ${track.style} (${track.bpm} BPM)`);

    // Trim/loop music to video duration
    const processedMusic = resolve(workDir, 'music-processed.mp3');
    await trimAndLoop(track.trackPath, timeline.totalDurationMs, processedMusic, track.loopable);

    // Apply ducking based on narration timing
    const duckingEvents: DuckingEvent[] = [];
    for (const step of timeline.steps) {
      duckingEvents.push({ time_ms: Math.max(0, step.narrationStart - 50), action: 'duck', target_gain: 0.15 });
      duckingEvents.push({ time_ms: step.narrationEnd + 200, action: 'release', target_gain: script.music.volume });
    }

    const duckedMusic = resolve(workDir, 'music-ducked.mp3');
    await applyDucking(processedMusic, duckingEvents, script.music.volume, duckedMusic);

    // Fade music
    const fadedMusic = resolve(workDir, 'music-faded.mp3');
    await fadeInOut(duckedMusic, 500, 2000, fadedMusic);

    // Mix narration + music
    finalAudioPath = resolve(workDir, 'audio-mixed.mp3');
    await mixTracks([
      { path: concatenatedNarration, gain: 1.0 },
      { path: fadedMusic, gain: script.music.volume },
    ], finalAudioPath);
  }

  // 6c: Merge audio into video
  mkdirSync(dirname(outputPath), { recursive: true });
  await mergeAudioVideo(silentVideoPath, finalAudioPath, outputPath);
  console.log(`  Audio merged`);

  // Step 7: Generate subtitles
  if (script.subtitles.enabled) {
    console.log('\nStep 7: Generating subtitles...');
    const vtt = generateWebVTT(timeline, script);
    const vttPath = outputPath.replace(/\.mp4$/, '.vtt');
    writeFileSync(vttPath, vtt);
    console.log(`  Subtitles: ${vttPath}`);
  }

  // Cleanup work directory
  const { rmSync } = await import('fs');
  try { rmSync(workDir, { recursive: true }); } catch {}

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone: ${outputPath} (${totalTime}s)`);
}

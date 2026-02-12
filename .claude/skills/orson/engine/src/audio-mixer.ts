// Audio processing via FFmpeg: trim, loop, fade, duck, merge
// Follows the same spawn pattern as encode.ts

import { spawn } from 'child_process';
import { existsSync } from 'fs';

// ─── Types ──────────────────────────────────────────────────

export interface DuckingEvent {
  time_ms: number;
  action: 'duck' | 'release';
  target_gain: number;
}

interface TrackInput {
  path: string;
  gain: number;
}

// ─── FFmpeg Runner ──────────────────────────────────────────

function ffmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', ['-y', ...args], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stderr = '';
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });

    proc.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

function ffprobe(filePath: string, entry: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', entry,
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });

    proc.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`ffprobe failed for ${filePath}`));
    });
  });
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Get audio duration in milliseconds
 */
export async function getAudioDurationMs(filePath: string): Promise<number> {
  const duration = await ffprobe(filePath, 'format=duration');
  return Math.round(parseFloat(duration) * 1000);
}

/**
 * Trim or loop a track to match target duration.
 * - If track shorter than target and loopable: loop with crossfade
 * - If track longer than target: trim with fade-out
 */
export async function trimAndLoop(
  trackPath: string,
  targetDurationMs: number,
  outputPath: string,
  loopable: boolean = true,
): Promise<void> {
  const trackDuration = await getAudioDurationMs(trackPath);
  const targetSec = targetDurationMs / 1000;

  if (trackDuration >= targetDurationMs) {
    // Trim with fade-out
    await ffmpeg([
      '-i', trackPath,
      '-t', String(targetSec),
      '-af', `afade=t=out:st=${Math.max(0, targetSec - 2)}:d=2`,
      '-q:a', '2',
      outputPath,
    ]);
  } else if (loopable) {
    // Loop to fill duration
    const loops = Math.ceil(targetDurationMs / trackDuration) + 1;
    await ffmpeg([
      '-stream_loop', String(loops),
      '-i', trackPath,
      '-t', String(targetSec),
      '-af', `afade=t=in:d=0.5,afade=t=out:st=${Math.max(0, targetSec - 2)}:d=2`,
      '-q:a', '2',
      outputPath,
    ]);
  } else {
    // Not loopable, just use what we have with fade-out
    await ffmpeg([
      '-i', trackPath,
      '-af', `afade=t=out:st=${Math.max(0, trackDuration / 1000 - 2)}:d=2`,
      '-q:a', '2',
      outputPath,
    ]);
  }
}

/**
 * Apply volume ducking to music track based on narration timing.
 * Uses FFmpeg volume filter with smooth linear ramps via clip().
 * Fade-out (300ms) before voice starts, fade-in (500ms) after voice ends.
 */
export async function applyDucking(
  musicPath: string,
  events: DuckingEvent[],
  normalGain: number,
  outputPath: string,
): Promise<void> {
  if (events.length === 0) {
    await ffmpeg(['-i', musicPath, '-c:a', 'copy', outputPath]);
    return;
  }

  // Group events into duck/release pairs
  const duckRegions: { startSec: number; endSec: number; gain: number }[] = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.action === 'duck') {
      const release = events.slice(i + 1).find(e => e.action === 'release');
      if (release) {
        duckRegions.push({
          startSec: ev.time_ms / 1000,
          endSec: release.time_ms / 1000,
          gain: ev.target_gain,
        });
      }
    }
  }

  if (duckRegions.length === 0) {
    await ffmpeg(['-i', musicPath, '-c:a', 'copy', outputPath]);
    return;
  }

  const FADE_IN_SEC = 0.3;   // ramp down before voice
  const FADE_OUT_SEC = 0.5;  // ramp up after voice

  // Build smooth ramp expressions using clip() for each duck region
  // di = min(clip((t - fadeInStart) / FADE_IN, 0, 1), clip((fadeOutEnd - t) / FADE_OUT, 0, 1))
  // gain = normalGain + (duckGain - normalGain) * max(d1, d2, ..., dN)
  const regionExprs = duckRegions.map(r => {
    const fadeInStart = r.startSec - FADE_IN_SEC;
    const fadeOutEnd = r.endSec + FADE_OUT_SEC;
    return `min(clip((t-${fadeInStart.toFixed(3)})/${FADE_IN_SEC},0,1),clip((${fadeOutEnd.toFixed(3)}-t)/${FADE_OUT_SEC},0,1))`;
  });

  // Use the first region's gain (typically uniform across all regions)
  const duckGain = duckRegions[0].gain;
  const maxExpr = regionExprs.length === 1
    ? regionExprs[0]
    : `max(${regionExprs.join(',')})`;
  const expr = `${normalGain}+(${duckGain}-${normalGain})*${maxExpr}`;

  await ffmpeg([
    '-i', musicPath,
    '-af', `volume='${expr}':eval=frame`,
    '-q:a', '2',
    outputPath,
  ]);
}

/**
 * Apply fade in and fade out to an audio file
 */
export async function fadeInOut(
  audioPath: string,
  fadeInMs: number,
  fadeOutMs: number,
  outputPath: string,
): Promise<void> {
  const duration = await getAudioDurationMs(audioPath);
  const fadeOutStart = Math.max(0, (duration - fadeOutMs)) / 1000;

  const filters: string[] = [];
  if (fadeInMs > 0) filters.push(`afade=t=in:d=${fadeInMs / 1000}`);
  if (fadeOutMs > 0) filters.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOutMs / 1000}`);

  if (filters.length === 0) {
    await ffmpeg(['-i', audioPath, '-c:a', 'copy', outputPath]);
    return;
  }

  await ffmpeg([
    '-i', audioPath,
    '-af', filters.join(','),
    '-q:a', '2',
    outputPath,
  ]);
}

/**
 * Concatenate narration audio files at specific timestamps.
 * Each file is positioned at its startMs using adelay filter.
 */
export async function concatenateNarration(
  files: { path: string; startMs: number }[],
  totalDurationMs: number,
  outputPath: string,
): Promise<void> {
  if (files.length === 0) {
    // Generate silence
    await ffmpeg([
      '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', String(totalDurationMs / 1000),
      '-q:a', '2',
      outputPath,
    ]);
    return;
  }

  // Build filter graph: each input delayed, then amixed
  const inputs: string[] = [];
  const filterParts: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!existsSync(f.path)) continue;
    inputs.push('-i', f.path);
    const delayMs = Math.max(0, f.startMs);
    filterParts.push(`[${i}]adelay=${delayMs}|${delayMs}[a${i}]`);
  }

  if (inputs.length === 0) {
    await ffmpeg([
      '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', String(totalDurationMs / 1000),
      '-q:a', '2',
      outputPath,
    ]);
    return;
  }

  const mixInputs = filterParts.map((_, i) => `[a${i}]`).join('');
  const filterComplex = filterParts.join(';') +
    `;${mixInputs}amix=inputs=${filterParts.length}:duration=longest:normalize=0[out]`;

  await ffmpeg([
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-t', String(totalDurationMs / 1000),
    '-q:a', '2',
    outputPath,
  ]);
}

/**
 * Mix multiple audio tracks together with individual gain control
 */
export async function mixTracks(
  tracks: TrackInput[],
  outputPath: string,
): Promise<void> {
  const validTracks = tracks.filter(t => existsSync(t.path));
  if (validTracks.length === 0) return;

  if (validTracks.length === 1) {
    await ffmpeg([
      '-i', validTracks[0].path,
      '-af', `volume=${validTracks[0].gain}`,
      '-q:a', '2',
      outputPath,
    ]);
    return;
  }

  const inputs: string[] = [];
  const filterParts: string[] = [];

  for (let i = 0; i < validTracks.length; i++) {
    inputs.push('-i', validTracks[i].path);
    filterParts.push(`[${i}]volume=${validTracks[i].gain}[v${i}]`);
  }

  const mixInputs = filterParts.map((_, i) => `[v${i}]`).join('');
  const filterComplex = filterParts.join(';') +
    `;${mixInputs}amix=inputs=${validTracks.length}:normalize=0[out]`;

  await ffmpeg([
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-q:a', '2',
    outputPath,
  ]);
}

/**
 * Merge audio track into video file (final step)
 */
export async function mergeAudioVideo(
  videoPath: string,
  audioPath: string,
  outputPath: string,
): Promise<void> {
  await ffmpeg([
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    outputPath,
  ]);
}

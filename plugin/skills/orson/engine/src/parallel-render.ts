// Parallel frame rendering: split total frames into N chunks, render each in a
// separate Playwright instance, then concatenate with FFmpeg.
// v4: chunk-based (works with ANY video, even single-scene). Fixes __setFrame bug.

import { cpus } from 'os';
import { resolve, dirname } from 'path';
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { spawn } from 'child_process';
import { initCapture, closeCapture } from './capture.js';
import { startEncoder } from './encode.js';
import type { CodecId, CodecPreset } from './presets.js';

// ─── Types ──────────────────────────────────────────────────

export interface FrameChunk {
  workerId: number;
  startFrame: number;
  endFrame: number;  // exclusive
}

/** @deprecated Use FrameChunk — kept for backward compat with index.ts */
export interface SceneSegment {
  sceneIndex: number;
  startFrame: number;
  endFrame: number;
  startMs: number;
  endMs: number;
}

export interface ParallelRenderOptions {
  htmlPath: string;
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  totalDurationMs: number;
  codec: CodecId;
  outputPath: string;
  codecOverride?: CodecPreset;
  /** @deprecated Ignored in v4 — chunks are computed from totalFrames */
  scenes?: SceneSegment[];
  onProgress?: (completed: number, total: number) => void;
}

// ─── Chunk computation ──────────────────────────────────────

/**
 * Determine optimal worker count based on system resources.
 */
function getWorkerCount(totalFrames: number): number {
  const cpuCount = cpus().length;
  const maxWorkers = Math.min(Math.floor(cpuCount / 2), 4);
  // Need at least 30 frames per worker to be worthwhile
  const byFrames = Math.floor(totalFrames / 30);
  return Math.max(1, Math.min(maxWorkers, byFrames));
}

/**
 * Split totalFrames into N roughly equal chunks.
 */
export function buildFrameChunks(totalFrames: number, workerCount: number): FrameChunk[] {
  const framesPerWorker = Math.ceil(totalFrames / workerCount);
  return Array.from({ length: workerCount }, (_, i) => ({
    workerId: i,
    startFrame: i * framesPerWorker,
    endFrame: Math.min((i + 1) * framesPerWorker, totalFrames),
  }));
}

/** @deprecated Use buildFrameChunks — kept for backward compat */
export function buildSceneSegments(
  scenes: Array<{ startMs: number; durationMs: number }>,
  fps: number,
): SceneSegment[] {
  return scenes.map((scene, i) => {
    const startFrame = Math.floor(scene.startMs / 1000 * fps);
    const endFrame = Math.ceil((scene.startMs + scene.durationMs) / 1000 * fps);
    return {
      sceneIndex: i,
      startFrame,
      endFrame,
      startMs: scene.startMs,
      endMs: scene.startMs + scene.durationMs,
    };
  });
}

// ─── Chunk rendering ────────────────────────────────────────

/**
 * Render a single chunk (range of frames) to a temporary video file.
 * Uses __setFrame(n) with global frame numbers — correct for v3 architecture.
 */
async function renderChunk(
  htmlPath: string,
  chunk: FrameChunk,
  width: number,
  height: number,
  fps: number,
  codec: CodecId,
  outputPath: string,
  codecOverride?: CodecPreset,
): Promise<void> {
  const frameCount = chunk.endFrame - chunk.startFrame;

  const session = await initCapture({
    width, height, fps,
    totalFrames: frameCount,
    htmlPath,
  });

  const encoder = startEncoder({
    fps,
    codec,
    outputPath,
    codecOverride,
    inputFormat: 'png',
    useHardwareAccel: false, // segments use software for reliability
  });

  // Capture frames using __setFrame with global frame numbers
  for (let f = 0; f < frameCount; f++) {
    const globalFrame = chunk.startFrame + f;
    await session.page.evaluate((frame) => (window as any).__setFrame(frame), globalFrame);

    const buffer = await session.page.screenshot({ type: 'png' });
    await encoder.write(buffer as Buffer);
  }

  await closeCapture(session);
  await encoder.finish();
}

// ─── Concatenation ──────────────────────────────────────────

/**
 * Concatenate video segments using FFmpeg concat demuxer.
 */
async function concatSegments(segmentPaths: string[], outputPath: string): Promise<void> {
  const listPath = outputPath.replace(/\.mp4$/, '-concat.txt');
  const listContent = segmentPaths.map(p => `file '${p}'`).join('\n');
  writeFileSync(listPath, listContent);

  return new Promise((res, rej) => {
    const proc = spawn('ffmpeg', [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-c', 'copy',
      outputPath,
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    proc.on('close', (code) => {
      try { unlinkSync(listPath); } catch {}
      if (code === 0) res();
      else rej(new Error(`FFmpeg concat exited with code ${code}`));
    });
  });
}

// ─── Main parallel render ───────────────────────────────────

/**
 * Render video using parallel Playwright workers.
 * Splits frames into chunks (not scenes), so works with any video including single-scene.
 */
export async function renderParallel(opts: ParallelRenderOptions): Promise<void> {
  const workerCount = getWorkerCount(opts.totalFrames);

  if (workerCount <= 1) {
    return; // caller should use sequential render
  }

  const chunks = buildFrameChunks(opts.totalFrames, workerCount);
  const tmpDir = resolve(dirname(opts.outputPath), '.parallel-tmp');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  console.log(`  Parallel render: ${workerCount} workers, ${opts.totalFrames} frames (${chunks.map(c => c.endFrame - c.startFrame).join('+')})`);

  const segmentPaths: string[] = [];
  let completedChunks = 0;

  // Process chunks in batches of workerCount (usually all at once)
  for (let i = 0; i < chunks.length; i += workerCount) {
    const batch = chunks.slice(i, i + workerCount);
    const batchPromises = batch.map((chunk) => {
      const segPath = resolve(tmpDir, `chunk-${String(chunk.workerId).padStart(3, '0')}.mp4`);
      segmentPaths.push(segPath);

      return renderChunk(
        opts.htmlPath,
        chunk,
        opts.width,
        opts.height,
        opts.fps,
        opts.codec,
        segPath,
        opts.codecOverride,
      ).then(() => {
        completedChunks++;
        opts.onProgress?.(completedChunks, chunks.length);
      });
    });

    await Promise.all(batchPromises);
  }

  // Concatenate all chunks
  console.log('  Concatenating chunks...');
  await concatSegments(segmentPaths, opts.outputPath);

  // Clean up temp directory
  try {
    const { rmSync } = await import('fs');
    rmSync(tmpDir, { recursive: true });
  } catch {}
}

// FFmpeg pipe encoding — accepts PNG buffers, outputs video file

import { spawn, execSync, type ChildProcess } from 'child_process';
import type { CodecId, CodecPreset, HwAccelId } from './presets.js';
import { CODEC_PRESETS, HW_ACCEL_PRESETS } from './presets.js';

export type InputFormat = 'png' | 'jpeg';

export interface EncodeOptions {
  fps: number;
  codec: CodecId;
  outputPath: string;
  onLog?: (msg: string) => void;
  /** Override codec preset (used by --draft mode) */
  codecOverride?: CodecPreset;
  /** Input frame format: 'jpeg' (default) or 'png' */
  inputFormat?: InputFormat;
  /** Use hardware encoder if available (default: true) */
  useHardwareAccel?: boolean;
}

/**
 * Probe FFmpeg for available hardware encoders.
 * Returns the best available HW accel ID, or null if none found.
 */
export function detectHardwareEncoder(): HwAccelId | null {
  try {
    const encoders = execSync('ffmpeg -encoders 2>/dev/null', { encoding: 'utf-8' });
    if (encoders.includes('h264_nvenc')) return 'nvenc';
    if (encoders.includes('h264_vaapi')) return 'vaapi';
    if (encoders.includes('h264_videotoolbox')) return 'videotoolbox';
  } catch {}
  return null;
}

export interface Encoder {
  process: ChildProcess;
  write(buffer: Buffer): Promise<void>;
  finish(): Promise<void>;
}

export function startEncoder(opts: EncodeOptions): Encoder {
  let preset = opts.codecOverride ?? CODEC_PRESETS[opts.codec];

  // Auto-detect hardware encoder (only for h264, skip if codecOverride is set)
  const useHw = opts.useHardwareAccel !== false && !opts.codecOverride && opts.codec === 'h264';
  let hwAccel: HwAccelId | null = null;
  if (useHw) {
    hwAccel = detectHardwareEncoder();
    if (hwAccel) {
      const hw = HW_ACCEL_PRESETS[hwAccel];
      preset = { ...preset, encoder: hw.encoder, extraArgs: [...hw.extraArgs] };
      // HW encoders don't use -preset or -crf the same way — strip them
      opts.onLog?.(`Using hardware encoder: ${hw.encoder}`);
    }
  }

  const inputFmt = opts.inputFormat ?? 'png';
  const isHwEncoder = hwAccel !== null;
  const args = [
    '-y',
    '-f', 'image2pipe',
    ...(inputFmt === 'jpeg' ? ['-c:v', 'mjpeg'] : []),
    '-framerate', String(opts.fps),
    '-i', '-',
    '-c:v', preset.encoder,
    '-pix_fmt', preset.pixFmt,
    // HW encoders use their own quality params (in extraArgs), not -preset/-crf
    ...(isHwEncoder ? [] : ['-preset', preset.preset, '-crf', String(preset.crf)]),
    ...preset.extraArgs,
    opts.outputPath,
  ];

  const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });

  proc.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString();
    if (msg.includes('frame=') || msg.includes('Error') || msg.includes('error')) {
      opts.onLog?.(msg.trim());
    }
  });

  const write = async (buffer: Buffer): Promise<void> => {
    const canWrite = proc.stdin!.write(buffer);
    if (!canWrite) {
      await new Promise<void>(resolve => proc.stdin!.once('drain', resolve));
    }
  };

  const finish = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      proc.stdin!.end();
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  };

  return { process: proc, write, finish };
}

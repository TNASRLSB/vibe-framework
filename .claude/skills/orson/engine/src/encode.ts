// FFmpeg pipe encoding — accepts PNG buffers, outputs video file

import { spawn, type ChildProcess } from 'child_process';
import type { CodecId } from './presets.js';
import { CODEC_PRESETS } from './presets.js';

export interface EncodeOptions {
  fps: number;
  codec: CodecId;
  outputPath: string;
  onLog?: (msg: string) => void;
}

export interface Encoder {
  process: ChildProcess;
  write(buffer: Buffer): Promise<void>;
  finish(): Promise<void>;
}

export function startEncoder(opts: EncodeOptions): Encoder {
  const preset = CODEC_PRESETS[opts.codec];

  const args = [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(opts.fps),
    '-i', '-',
    '-c:v', preset.encoder,
    '-pix_fmt', preset.pixFmt,
    '-preset', preset.preset,
    '-crf', String(preset.crf),
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

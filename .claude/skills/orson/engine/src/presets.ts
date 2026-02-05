// Format and codec preset definitions

export interface FormatPreset {
  width: number;
  height: number;
  aspect: string;
}

export const FORMAT_PRESETS: Record<string, FormatPreset> = {
  'horizontal-16x9': { width: 1920, height: 1080, aspect: '16:9' },
  'horizontal-4x3':  { width: 1440, height: 1080, aspect: '4:3' },
  'vertical-9x16':   { width: 1080, height: 1920, aspect: '9:16' },
  'vertical-4x5':    { width: 1080, height: 1350, aspect: '4:5' },
  'square-1x1':      { width: 1080, height: 1080, aspect: '1:1' },
  'cinema-21x9':     { width: 2560, height: 1080, aspect: '21:9' },
};

export type CodecId = 'h264' | 'h265' | 'av1';

export interface CodecPreset {
  encoder: string;
  container: string;
  pixFmt: string;
  preset: string;
  crf: number;
  extraArgs: string[];
}

export const CODEC_PRESETS: Record<CodecId, CodecPreset> = {
  h264: {
    encoder: 'libx264',
    container: 'mp4',
    pixFmt: 'yuv420p',
    preset: 'medium',
    crf: 18,
    extraArgs: [],
  },
  h265: {
    encoder: 'libx265',
    container: 'mp4',
    pixFmt: 'yuv420p',
    preset: 'medium',
    crf: 22,
    extraArgs: ['-tag:v', 'hvc1'],
  },
  av1: {
    encoder: 'libsvtav1',
    container: 'mp4',
    pixFmt: 'yuv420p',
    preset: 'medium',
    crf: 30,
    extraArgs: [],
  },
};

export type SpeedPreset = 'slowest' | 'slow' | 'normal' | 'fast' | 'fastest' | 'instant';

export const ENTRANCE_SPEED_MULTIPLIERS: Record<SpeedPreset, number> = {
  slowest: 2.0,
  slow: 1.5,
  normal: 1.0,
  fast: 0.7,
  fastest: 0.4,
  instant: 0,
};

export const MS_PER_WORD: Record<SpeedPreset, number> = {
  slowest: 500,
  slow: 350,
  normal: 250,
  fast: 180,
  fastest: 120,
  instant: 50,
};

export const INTER_ELEMENT_GAP: Record<SpeedPreset, number> = {
  slowest: 600,
  slow: 400,
  normal: 250,
  fast: 150,
  fastest: 80,
  instant: 0,
};

export type ModeId = 'safe' | 'chaos' | 'hybrid';

export const SAFE_EASINGS = [
  'ease',
  'ease-in-out',
  'cubic-bezier(0.4, 0, 0.2, 1)',
];

export const CHAOS_EASINGS = [
  'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'steps(5)',
  'cubic-bezier(0.5, 1.8, 0.3, 0.8)',
];

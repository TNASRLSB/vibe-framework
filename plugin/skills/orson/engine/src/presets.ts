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
  slowest: 600,   // 100 WPM (presentation)
  slow: 400,      // 150 WPM (comfortable)
  normal: 300,    // 200 WPM (natural reading)
  fast: 220,      // ~270 WPM (scanning)
  fastest: 160,   // ~375 WPM (flash)
  instant: 50,
};

export const INTER_ELEMENT_GAP: Record<SpeedPreset, number> = {
  slowest: 700,
  slow: 500,
  normal: 350,    // more breathing between elements
  fast: 200,
  fastest: 100,
  instant: 0,
};

// ─── Draft Overrides ──────────────────────────────────────────
// Used with --draft flag for fast preview renders (~4-8x speedup)

export const DRAFT_OVERRIDES = {
  widthDivisor: 2,    // 1920→960, 1080→540
  heightDivisor: 2,
  fps: 15,            // half the frame count
  codec: {
    encoder: 'libx264',
    preset: 'ultrafast',
    crf: 28,
    pixFmt: 'yuv420p',
    extraArgs: [] as string[],
    container: 'mp4',
  } satisfies CodecPreset,
};

// ─── Hardware Acceleration Presets ─────────────────────────────

export type HwAccelId = 'nvenc' | 'vaapi' | 'videotoolbox';

export interface HwAccelPreset {
  encoder: string;
  extraArgs: string[];
  quality: string;
}

export const HW_ACCEL_PRESETS: Record<HwAccelId, HwAccelPreset> = {
  nvenc: {
    encoder: 'h264_nvenc',
    extraArgs: ['-rc', 'constqp', '-qp', '18', '-b:v', '0'],
    quality: '18',
  },
  vaapi: {
    encoder: 'h264_vaapi',
    extraArgs: ['-vaapi_device', '/dev/dri/renderD128', '-qp', '18'],
    quality: '18',
  },
  videotoolbox: {
    encoder: 'h264_videotoolbox',
    extraArgs: ['-q:v', '65'],
    quality: '65',
  },
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

// Demo script parsing and validation with Zod
// Converts demo JSON → validated DemoScript + NarrationBrief

import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Voice Preset Types ─────────────────────────────────────

export const VOICE_PRESET_IDS = ['tech-demo', 'explainer', 'promo', 'tutorial', 'sales', 'onboarding'] as const;
export type VoicePresetId = typeof VOICE_PRESET_IDS[number];

interface VoicePresetEntry {
  voice: string;
  style: string;
  wpm: number;
  prosody: { rate: string; pitch: string };
}

interface VoicePresetsFile {
  presets: Record<string, VoicePresetEntry>;
  locales: Record<string, Record<string, { voice: string }>>;
}

let _cachedPresets: VoicePresetsFile | null = null;

function loadVoicePresets(): VoicePresetsFile {
  if (_cachedPresets) return _cachedPresets;
  const presetsPath = resolve(__dirname, '..', 'audio', 'presets', 'voice-presets.json');
  if (existsSync(presetsPath)) {
    _cachedPresets = JSON.parse(readFileSync(presetsPath, 'utf-8'));
    return _cachedPresets!;
  }
  throw new Error(`[tts] voice-presets.json not found at ${presetsPath}`);
}

/**
 * Resolve a voice preset with optional locale override.
 * Returns voice, style, wpm, prosody for the given preset + lang.
 */
export function resolveVoicePreset(presetId: VoicePresetId, lang?: string): VoicePresetEntry {
  const presets = loadVoicePresets();
  const base = presets.presets[presetId];
  if (!base) throw new Error(`[tts] Unknown voice preset: ${presetId}`);

  // Locale override
  if (lang && lang !== 'en-US' && presets.locales[lang]?.[presetId]) {
    return { ...base, voice: presets.locales[lang][presetId].voice };
  }
  return { ...base };
}

// ─── Schema ─────────────────────────────────────────────────

const AuthStepSchema = z.object({
  action: z.enum(['navigate', 'click', 'fill', 'wait']),
  selector: z.string().optional(),
  value: z.string().optional(),
  url: z.string().optional(),
  waitFor: z.string().optional(),
  timeout: z.number().optional(),
});

const DemoStepSchema = z.object({
  narration: z.string().describe('Text to narrate for this step'),
  action: z.enum(['click', 'fill', 'scroll', 'hover', 'navigate', 'wait', 'none']).default('none'),
  selector: z.string().optional().describe('CSS selector for the action target'),
  value: z.string().optional().describe('Value for fill actions or URL for navigate'),
  zoom: z.number().min(1).max(3).optional().describe('Zoom scale for this step (1 = no zoom)'),
  highlight: z.boolean().optional().describe('Show highlight ring on target element'),
  waitFor: z.string().optional().describe('CSS selector to wait for before proceeding'),
  waitAfter: z.number().optional().describe('Extra pause after action (ms)'),
  typingSpeed: z.number().optional().describe('Typing speed for fill actions (ms per char)'),
  sfx: z.string().optional().describe('SFX override: explicit SFX type (e.g. "ui-click") or "none" to silence auto-SFX'),
});

const MusicConfigSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.union([z.literal('auto'), z.string()]).default('auto'),
  volume: z.number().min(0).max(1).default(0.2),
});

const SubtitleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.enum(['bottom', 'top', 'center', 'none']).default('bottom'),
});

const SfxConfigSchema = z.object({
  enabled: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.7),
  autoFromActions: z.boolean().default(true),
});

export const DemoScriptSchema = z.object({
  url: z.string().url().describe('URL of the site to demo'),
  format: z.string().default('horizontal-16x9'),
  fps: z.number().default(30),
  codec: z.enum(['h264', 'h265', 'av1']).default('h264'),

  voice: z.string().default('en-US-AriaNeural'),
  lang: z.string().default('en-US'),
  narrationStyle: z.enum(['enthusiastic', 'neutral', 'calm', 'dramatic']).default('neutral'),
  voicePreset: z.enum(['tech-demo', 'explainer', 'promo', 'tutorial', 'sales', 'onboarding']).optional().describe('Voice preset — overrides voice, narrationStyle, and prosody from voice-presets.json. Explicit voice field takes priority.'),
  ttsEngine: z.string().optional().describe('TTS engine name (e.g. "edge-tts"). If omitted, uses ORSON_TTS_ENGINE env var or auto-detect'),

  music: MusicConfigSchema.default({}),
  subtitles: SubtitleConfigSchema.default({}),
  sfx: SfxConfigSchema.default({}),

  auth: z.array(AuthStepSchema).optional().describe('Pre-recording auth steps'),
  storageState: z.string().optional().describe('Path to Playwright storageState JSON for pre-authenticated sessions'),
  steps: z.array(DemoStepSchema).min(1),

  output: z.string().default('./.orson/demo.mp4'),
  gapBetweenSteps: z.number().default(800).describe('Gap between steps in ms'),
  zoomTransitionMs: z.number().default(400).describe('Zoom transition duration in ms'),
});

// ─── Types ──────────────────────────────────────────────────

export type DemoScript = z.infer<typeof DemoScriptSchema>;
export type DemoStep = z.infer<typeof DemoStepSchema>;
export type AuthStep = z.infer<typeof AuthStepSchema>;

export interface NarrationBrief {
  narration: {
    enabled: boolean;
    voice: string;
    style: string;
    target_wpm?: number;
    tts_engine?: string;
    scenes: Array<{
      scene_index: number;
      scene_name: string;
      elements: Array<{
        id: string;
        display_text: string;
        narration_text: string;
        element_type: string;
        timing: { appear_ms: number };
      }>;
    }>;
    emphasis_by_element_type: Record<string, { rate: string; pitch: string }>;
    prosody_defaults: { rate: string; pitch: string };
  };
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Parse and validate a demo script JSON file
 */
export function parseDemoScript(scriptPath: string): DemoScript {
  const raw = JSON.parse(readFileSync(scriptPath, 'utf-8'));
  return DemoScriptSchema.parse(raw);
}

/**
 * Generate a narration brief compatible with narration_generator.py
 * The brief is generated with placeholder timings — actual timings
 * are set by demo-timeline.ts after narration audio is generated.
 *
 * If voicePreset is set, resolves voice, style, prosody, and wpm from presets.
 * Explicit voice field in script takes priority over preset.
 */
export function generateNarrationBrief(script: DemoScript): NarrationBrief {
  const styleProfiles: Record<string, { rate: string; pitch: string }> = {
    enthusiastic: { rate: '-5%', pitch: '+3Hz' },
    neutral: { rate: '-10%', pitch: '+0Hz' },
    calm: { rate: '-20%', pitch: '-2Hz' },
    dramatic: { rate: '-25%', pitch: '+0Hz' },
  };

  // Resolve voice preset if specified
  let voice = script.voice;
  let style = script.narrationStyle;
  let prosody = styleProfiles[style] ?? styleProfiles.neutral;
  let wpm: number | undefined;

  if (script.voicePreset) {
    const preset = resolveVoicePreset(script.voicePreset, script.lang);
    // Explicit voice in script takes priority over preset
    const hasExplicitVoice = voice !== 'en-US-AriaNeural'; // non-default = explicit
    if (!hasExplicitVoice) {
      voice = preset.voice;
    }
    style = preset.style as DemoScript['narrationStyle'];
    prosody = preset.prosody;
    wpm = preset.wpm;
  }

  // Each step becomes a scene with one narration element
  const scenes = script.steps.map((step, i) => ({
    scene_index: i,
    scene_name: `Step ${i + 1}`,
    elements: [{
      id: `narr-step-${i}`,
      display_text: step.narration,
      narration_text: step.narration,
      element_type: 'text',
      timing: { appear_ms: 0 }, // placeholder — set by timeline
    }],
  }));

  return {
    narration: {
      enabled: true,
      voice,
      style,
      ...(wpm !== undefined ? { target_wpm: wpm } : {}),
      ...(script.ttsEngine ? { tts_engine: script.ttsEngine } : {}),
      scenes,
      emphasis_by_element_type: {
        text: prosody,
      },
      prosody_defaults: prosody,
    },
  };
}

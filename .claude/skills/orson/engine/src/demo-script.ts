// Demo script parsing and validation with Zod
// Converts demo JSON → validated DemoScript + NarrationBrief

import { z } from 'zod';
import { readFileSync } from 'fs';

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
});

const MusicConfigSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.union([z.literal('auto'), z.string()]).default('auto'),
  volume: z.number().min(0).max(1).default(0.3),
});

const SubtitleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.enum(['bottom', 'top', 'none']).default('bottom'),
});

export const DemoScriptSchema = z.object({
  url: z.string().url().describe('URL of the site to demo'),
  format: z.string().default('horizontal-16x9'),
  fps: z.number().default(30),
  codec: z.enum(['h264', 'h265', 'av1']).default('h264'),

  voice: z.string().default('en-US-AriaNeural'),
  lang: z.string().default('en-US'),
  narrationStyle: z.enum(['enthusiastic', 'neutral', 'calm', 'dramatic']).default('neutral'),

  music: MusicConfigSchema.default({}),
  subtitles: SubtitleConfigSchema.default({}),

  auth: z.array(AuthStepSchema).optional().describe('Pre-recording auth steps'),
  steps: z.array(DemoStepSchema).min(1),

  output: z.string().default('./output/demo.mp4'),
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
 */
export function generateNarrationBrief(script: DemoScript): NarrationBrief {
  const styleProfiles: Record<string, { rate: string; pitch: string }> = {
    enthusiastic: { rate: '+5%', pitch: '+3Hz' },
    neutral: { rate: '+0%', pitch: '+0Hz' },
    calm: { rate: '-10%', pitch: '-2Hz' },
    dramatic: { rate: '-15%', pitch: '+0Hz' },
  };

  const prosody = styleProfiles[script.narrationStyle] ?? styleProfiles.neutral;

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
      voice: script.voice,
      style: script.narrationStyle,
      scenes,
      emphasis_by_element_type: {
        text: prosody,
      },
      prosody_defaults: prosody,
    },
  };
}

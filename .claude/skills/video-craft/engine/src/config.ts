// Config types + Zod schema validation (no YAML dependency)

import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────────────

const DurationStr = z.string().regex(/^\d+(\.\d+)?(ms|s)$/, 'Duration must be like "500ms" or "1.5s"');

const ElementSchema = z.object({
  type: z.enum(['heading', 'text', 'button', 'image', 'card', 'card-group', 'divider']),
  text: z.string().optional(),
  title: z.string().optional(),
  icon: z.string().optional(),
  src: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl', '2xl']).optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  font: z.string().optional(),
  background: z.string().optional(),
  entrance: z.string().optional(),
  'entrance-duration': z.union([DurationStr, z.number()]).optional(),
  exit: z.string().optional(),
  'exit-duration': z.union([DurationStr, z.number()]).optional(),
  hold: z.union([DurationStr, z.number()]).optional(),
  delay: z.union([DurationStr, z.number()]).optional(),
  easing: z.string().optional(),
  // Multi-phase support (director Phase 2)
  phases: z.array(z.object({
    entrance: z.string().optional(),
    delay: z.union([DurationStr, z.number()]).optional(),
    duration: z.union([DurationStr, z.number()]).optional(),
    text: z.string().optional(),
    size: z.enum(['sm', 'md', 'lg', 'xl', '2xl']).optional(),
  })).optional(),
  // card-group specific
  'stagger-delay': z.union([DurationStr, z.number()]).optional(),
  'child-entrance': z.string().optional(),
  items: z.array(z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    icon: z.string().optional(),
    src: z.string().optional(),
  })).optional(),
});

const SceneSchema = z.object({
  name: z.string(),
  background: z.string().optional(),
  duration: z.union([DurationStr, z.number()]).optional(),
  'transition-out': z.string().optional(),
  'transition-duration': z.union([DurationStr, z.number()]).optional(),
  layout: z.enum(['centered', 'split', 'grid', 'stacked', 'fullscreen-text']).optional(),
  columns: z.number().optional(),
  elements: z.array(ElementSchema),
  // Scene type ID from composition.ts (populated by autogen, used by timeline for choreography)
  sceneTypeId: z.string().optional(),
});

const VideoSchema = z.object({
  format: z.string().default('vertical-9x16'),
  fps: z.number().default(60),
  codec: z.enum(['h264', 'h265', 'av1']).default('h265'),
  mode: z.enum(['safe', 'chaos', 'hybrid', 'cocomelon']).default('safe'),
  speed: z.enum(['slowest', 'slow', 'normal', 'fast', 'fastest', 'instant']).default('normal'),
  'entrance-speed': z.enum(['slowest', 'slow', 'normal', 'fast', 'fastest', 'instant']).optional(),
  output: z.string().default('./output/video.mp4'),
});

export const ConfigSchema = z.object({
  video: VideoSchema,
  'design-system': z.string().optional(),
  scenes: z.array(SceneSchema).min(1, 'At least one scene is required'),
});

// ─── Types ───────────────────────────────────────────────────

export type ElementConfig = z.infer<typeof ElementSchema>;
export type SceneConfig = z.infer<typeof SceneSchema>;
export type VideoConfig = z.infer<typeof VideoSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// ─── Helpers ─────────────────────────────────────────────────

export function getElementText(el: ElementConfig): string {
  const parts: string[] = [];
  if (el.text) parts.push(el.text);
  if (el.title) parts.push(el.title);
  if (el.items) {
    for (const item of el.items) {
      if (item.title) parts.push(item.title);
      if (item.text) parts.push(item.text);
    }
  }
  return parts.join(' ');
}

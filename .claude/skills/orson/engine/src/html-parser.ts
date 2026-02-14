// Parse orson HTML files — extract metadata from @video, @design-system, @scene comments

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { readDesignTokens, type DesignTokens } from './ux-bridge.js';
import type { SpeedPreset, ModeId, CodecId } from './presets.js';

// ─── Types ──────────────────────────────────────────────────

export interface HTMLVideoConfig {
  format: string;
  fps: number;
  speed: SpeedPreset;
  mode: ModeId;
  codec: CodecId;
  output: string;
  'entrance-speed'?: SpeedPreset;
}

export interface HTMLSceneConfig {
  name: string;
  duration?: number;          // ms
  transitionOut?: string;
  transitionDuration?: number; // ms
  elementCount: number;
  elementTexts: string[];
}

export interface HTMLConfig {
  video: HTMLVideoConfig;
  designSystemPath?: string;
  scenes: HTMLSceneConfig[];
  /** The raw HTML content (for capture) */
  html: string;
}

// ─── Regex ──────────────────────────────────────────────────

const VIDEO_RE = /<!--\s*@video\s+(.*?)\s*-->/s;
const DS_RE = /<!--\s*@design-system\s+(.*?)\s*-->/s;
const SCENE_RE = /<!--\s*@scene\s+(.*?)\s*-->/gs;
const ATTR_RE = /(\w[\w-]*)="([^"]*)"/g;

// Match scene divs that follow @scene comments
const SCENE_DIV_RE = /<!--\s*@scene\s+.*?-->\s*(<div\s+class="scene[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/g;

// Extract element text from el- divs
const EL_TEXT_RE = /class="el\s[^"]*"[^>]*>([^<]+)</g;

// ─── Attribute parser ───────────────────────────────────────

function parseAttrs(str: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let m: RegExpExecArray | null;
  const re = new RegExp(ATTR_RE.source, 'g');
  while ((m = re.exec(str)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function parseDuration(val: string | undefined): number | undefined {
  if (!val) return undefined;
  if (val.endsWith('ms')) return parseFloat(val);
  if (val.endsWith('s')) return parseFloat(val) * 1000;
  return parseFloat(val);
}

// ─── Scene element extraction ───────────────────────────────

function extractSceneElements(sceneHtml: string): { count: number; texts: string[] } {
  const texts: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(EL_TEXT_RE.source, 'g');
  while ((m = re.exec(sceneHtml)) !== null) {
    const text = m[1].trim();
    if (text) texts.push(text);
  }
  return { count: Math.max(texts.length, 1), texts };
}

// ─── Main parser ────────────────────────────────────────────

export function parseHTMLFile(path: string): HTMLConfig {
  const html = readFileSync(path, 'utf-8');
  return parseHTMLString(html);
}

export function parseHTMLString(html: string): HTMLConfig {
  // Parse @video
  const videoMatch = VIDEO_RE.exec(html);
  if (!videoMatch) {
    throw new Error('HTML file missing <!-- @video ... --> comment');
  }
  const videoAttrs = parseAttrs(videoMatch[1]);

  const video: HTMLVideoConfig = {
    format: videoAttrs.format || 'vertical-9x16',
    fps: parseInt(videoAttrs.fps || '30', 10),
    speed: (videoAttrs.speed || 'normal') as SpeedPreset,
    mode: (videoAttrs.mode || 'safe') as ModeId,
    codec: (videoAttrs.codec || 'h264') as CodecId,
    output: videoAttrs.output || './output/video.mp4',
  };
  if (videoAttrs['entrance-speed']) {
    video['entrance-speed'] = videoAttrs['entrance-speed'] as SpeedPreset;
  }

  // Parse @design-system
  const dsMatch = DS_RE.exec(html);
  const dsAttrs = dsMatch ? parseAttrs(dsMatch[1]) : null;
  const designSystemPath = dsAttrs?.path;

  // Parse @scene comments
  const scenes: HTMLSceneConfig[] = [];
  let sceneMatch: RegExpExecArray | null;
  const sceneRe = new RegExp(SCENE_RE.source, 'gs');

  // Collect scene comment positions
  const sceneComments: { attrs: Record<string, string>; endIdx: number }[] = [];
  while ((sceneMatch = sceneRe.exec(html)) !== null) {
    sceneComments.push({
      attrs: parseAttrs(sceneMatch[1]),
      endIdx: sceneMatch.index + sceneMatch[0].length,
    });
  }

  // For each scene comment, find the following scene div and extract elements
  for (let i = 0; i < sceneComments.length; i++) {
    const { attrs, endIdx } = sceneComments[i];
    // The scene div HTML runs from this comment's end to the next comment (or end of body)
    const nextStart = i + 1 < sceneComments.length
      ? html.lastIndexOf('<!--', html.indexOf('<!-- @scene', endIdx + 1))
      : html.indexOf('</body>', endIdx);
    const sceneHtml = html.slice(endIdx, nextStart > endIdx ? nextStart : undefined);

    const { count, texts } = extractSceneElements(sceneHtml);

    scenes.push({
      name: attrs.name || `Scene ${i}`,
      duration: parseDuration(attrs.duration),
      transitionOut: attrs['transition-out'],
      transitionDuration: parseDuration(attrs['transition-duration']),
      elementCount: count,
      elementTexts: texts,
    });
  }

  if (scenes.length === 0) {
    throw new Error('HTML file has no <!-- @scene ... --> comments');
  }

  return { video, designSystemPath, scenes, html };
}

// ─── Narration brief extraction ──────────────────────────────

export interface NarrationBriefItem {
  sceneIndex: number;
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Extract narration-ready text from an HTMLConfig.
 * Combines heading + body text from each scene into a narration brief
 * that can be fed to narration_generator.py.
 */
export function extractNarrationBrief(
  config: HTMLConfig,
  sceneDurations: number[],
): NarrationBriefItem[] {
  const items: NarrationBriefItem[] = [];
  let cursor = 0;

  for (let i = 0; i < config.scenes.length; i++) {
    const scene = config.scenes[i];
    const dur = sceneDurations[i] ?? 3000;
    const text = scene.elementTexts
      .filter(t => t.length > 3) // skip tiny fragments
      .join('. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 5) {
      items.push({
        sceneIndex: i,
        text,
        startMs: cursor,
        endMs: cursor + dur,
      });
    }
    cursor += dur;
  }

  return items;
}

// ─── Resolve design tokens from parsed config ───────────────

export function resolveTokensFromHTMLConfig(
  config: HTMLConfig,
  htmlFilePath: string,
): DesignTokens | null {
  if (!config.designSystemPath) return null;
  const dsFullPath = resolve(dirname(htmlFilePath), config.designSystemPath);
  return readDesignTokens(dsFullPath);
}

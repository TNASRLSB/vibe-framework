// Audio track selection from curated library based on video context
// Uses coherence-matrix.json for style→mode mapping and feature profiles

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Types ──────────────────────────────────────────────────

export interface VideoMeta {
  mode: 'safe' | 'chaos' | 'hybrid' | 'cocomelon';
  durationMs: number;
  energy?: number;        // 0-1, derived from video analysis
  contextTags?: string[]; // e.g. ['tech', 'startup', 'SaaS']
  styleHint?: string;     // explicit style override
}

interface TrackEntry {
  id: string;
  file: string;
  style: string;
  bpm: number;
  energy: number;
  durationMs: number;
  tags: string[];
  loopable: boolean;
}

interface SfxEntry {
  id: string;
  file: string;
  type: string;
  durationMs: number;
  loopable?: boolean;
}

interface AudioLibrary {
  tracks: TrackEntry[];
  sfx: SfxEntry[];
}

interface StyleDef {
  bpm: [number, number];
  energy: string;
  contexts: string[];
  default_sfx: string;
  feature_profile: { arousal: string; valence: string; priority: number };
}

interface CoherenceMatrix {
  styles: Record<string, StyleDef>;
  mode_mapping: Record<string, { soundtrack_styles: string[] }>;
}

export interface TrackSelection {
  trackPath: string;
  style: string;
  bpm: number;
  durationMs: number;
  loopable: boolean;
}

export interface SfxSelection {
  sfxPath: string;
  type: string;
  durationMs: number;
}

// ─── Paths ──────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = resolve(__dirname, '..', 'audio');
const LIBRARY_PATH = resolve(AUDIO_DIR, 'presets', 'audio-library.json');
const MATRIX_PATH = resolve(AUDIO_DIR, 'presets', 'coherence-matrix.json');

// ─── Loaders ────────────────────────────────────────────────

function loadLibrary(): AudioLibrary {
  return JSON.parse(readFileSync(LIBRARY_PATH, 'utf-8'));
}

function loadMatrix(): CoherenceMatrix {
  return JSON.parse(readFileSync(MATRIX_PATH, 'utf-8'));
}

// ─── Energy mapping ─────────────────────────────────────────

const ENERGY_MAP: Record<string, [number, number]> = {
  'very-low': [0, 0.2],
  'low': [0.1, 0.4],
  'low-medium': [0.2, 0.55],
  'medium': [0.35, 0.7],
  'medium-high': [0.5, 0.8],
  'high': [0.65, 1.0],
  'very-high': [0.8, 1.0],
  'variable': [0, 1.0],
};

function energyInRange(trackEnergy: number, styleEnergy: string): boolean {
  const range = ENERGY_MAP[styleEnergy];
  if (!range) return true;
  return trackEnergy >= range[0] && trackEnergy <= range[1];
}

// ─── Track Selection ────────────────────────────────────────

export function selectTrack(videoMeta: VideoMeta): TrackSelection {
  const library = loadLibrary();
  const matrix = loadMatrix();

  // Explicit style override
  if (videoMeta.styleHint && matrix.styles[videoMeta.styleHint]) {
    const matches = library.tracks.filter(t => t.style === videoMeta.styleHint);
    if (matches.length > 0) {
      const track = pickBestByEnergy(matches, videoMeta.energy);
      return toSelection(track);
    }
  }

  // Step 1: Get allowed styles for this mode
  const modeConfig = matrix.mode_mapping[videoMeta.mode];
  const allowedStyles = modeConfig?.soundtrack_styles ?? ['corporate', 'ambient'];

  // Step 2: Score each allowed style by context tag overlap
  const contextTags = videoMeta.contextTags ?? [];
  const scoredStyles = allowedStyles.map(styleName => {
    const styleDef = matrix.styles[styleName];
    if (!styleDef) return { name: styleName, score: 0, priority: 99 };

    let score = 0;
    for (const tag of contextTags) {
      if (styleDef.contexts.some(c => c.toLowerCase() === tag.toLowerCase())) {
        score += 10;
      }
    }

    // Energy compatibility bonus
    if (videoMeta.energy !== undefined && energyInRange(videoMeta.energy, styleDef.energy)) {
      score += 5;
    }

    return { name: styleName, score, priority: styleDef.feature_profile.priority };
  });

  // Step 3: Sort by score desc, then priority asc
  scoredStyles.sort((a, b) => b.score - a.score || a.priority - b.priority);

  // Step 4: Find tracks matching top styles
  const topStyle = scoredStyles[0]?.name;
  for (const style of scoredStyles) {
    const matches = library.tracks.filter(t => t.style === style.name);
    if (matches.length > 0) {
      const track = pickBestByEnergy(matches, videoMeta.energy);
      if (style.name !== topStyle) {
        console.log(`[audio] Style "${topStyle}" has no tracks, fell back to "${style.name}"`);
      } else {
        console.log(`[audio] Selected style "${style.name}" (score: ${style.score})`);
      }
      return toSelection(track);
    }
  }

  // Step 5: Fallback — any track available
  const fallbackStyle = videoMeta.mode === 'chaos' ? 'electronic' :
                         videoMeta.mode === 'cocomelon' ? 'upbeat' : 'corporate';
  const fallback = library.tracks.filter(t => t.style === fallbackStyle);
  if (fallback.length > 0) return toSelection(fallback[0]);

  // Last resort: first track in library
  return toSelection(library.tracks[0]);
}

function pickBestByEnergy(tracks: TrackEntry[], targetEnergy?: number): TrackEntry {
  if (targetEnergy === undefined || tracks.length === 1) return tracks[0];
  return tracks.reduce((best, t) =>
    Math.abs(t.energy - targetEnergy) < Math.abs(best.energy - targetEnergy) ? t : best
  );
}

/** Validate that a track file exists and is real audio (not a silence placeholder) */
function isValidTrack(trackPath: string): boolean {
  if (!existsSync(trackPath)) return false;
  try {
    const stats = statSync(trackPath);
    // Silence placeholders are typically < 10KB
    return stats.size > 10240;
  } catch {
    return false;
  }
}

function toSelection(track: TrackEntry): TrackSelection {
  const trackPath = resolve(AUDIO_DIR, track.file);
  if (!isValidTrack(trackPath)) {
    throw new Error(
      `Audio track not found or silent: ${track.file}\n` +
      `  Run: bash ${resolve(AUDIO_DIR, 'download-library.sh')}\n` +
      `  Or place your own MP3 in: ${dirname(trackPath)}/`
    );
  }
  return {
    trackPath,
    style: track.style,
    bpm: track.bpm,
    durationMs: track.durationMs,
    loopable: track.loopable,
  };
}

// ─── SFX Selection ──────────────────────────────────────────

export function selectSfx(eventType: string): SfxSelection | null {
  const library = loadLibrary();

  // Direct type match
  const match = library.sfx.find(s => s.type === eventType);
  if (match) {
    return {
      sfxPath: resolve(AUDIO_DIR, match.file),
      type: match.type,
      durationMs: match.durationMs,
    };
  }

  // Fuzzy mapping for common video events
  const typeMap: Record<string, string> = {
    'element-appear': 'ui-click',
    'text-typing': 'typing-loop',
    'scene-transition': 'scene-transition',
    'cta-final': 'success',
    'logo-reveal': 'success',
    'card-flip': 'transition',
  };

  const mappedType = typeMap[eventType];
  if (mappedType) {
    const mapped = library.sfx.find(s => s.type === mappedType);
    if (mapped) {
      return {
        sfxPath: resolve(AUDIO_DIR, mapped.file),
        type: mapped.type,
        durationMs: mapped.durationMs,
      };
    }
  }

  return null;
}

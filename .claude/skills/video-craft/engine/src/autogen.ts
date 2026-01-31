// Auto-generate YAML config from extracted content

import { stringify as yamlStringify } from 'yaml';
import type { ExtractedContent } from './analyze-folder.js';

export interface AutogenOptions {
  format: string;
  mode: 'safe' | 'chaos' | 'hybrid';
  speed: 'slowest' | 'slow' | 'normal' | 'fast' | 'fastest';
  intent: string;
  codec?: string;
  fps?: number;
}

interface SceneDef {
  name: string;
  background?: string;
  elements: ElementDef[];
}

interface ElementDef {
  type: string;
  text?: string;
  title?: string;
  size?: string;
  items?: { title?: string; text?: string; icon?: string }[];
}

/**
 * Generate a YAML config string from extracted content and user options.
 */
export function generateConfig(content: ExtractedContent, options: AutogenOptions): string {
  const scenes: SceneDef[] = [];
  const colors = content.colors.length > 0 ? content.colors : ['#1a1a2e', '#16213e', '#0f3460', '#e94560'];
  const primaryColor = colors[0] ?? '#1a1a2e';
  const accentColor = colors.length > 1 ? colors[colors.length - 1] : '#e94560';

  // --- Scene 1: Hero ---
  const heroTitle = content.heroText || content.projectName || 'Untitled';
  const heroDesc = content.description || '';
  const heroElements: ElementDef[] = [
    { type: 'heading', text: heroTitle, size: '2xl' },
  ];
  if (heroDesc) {
    heroElements.push({ type: 'text', text: truncate(heroDesc, 120) });
  }
  scenes.push({
    name: 'Hero',
    background: primaryColor,
    elements: heroElements,
  });

  // --- Scene 2+: Features ---
  const features = content.features.length > 0
    ? content.features
    : content.headings.filter(h => h !== heroTitle).slice(0, 6);

  if (features.length > 0) {
    // If 3+ features, use card-group; otherwise stacked text
    if (features.length >= 3) {
      scenes.push({
        name: 'Features',
        background: colors[1] ?? primaryColor,
        elements: [
          { type: 'heading', text: 'Key Features', size: 'lg' },
          {
            type: 'card-group',
            items: features.slice(0, 6).map(f => ({ title: truncate(f, 50) })),
          },
        ],
      });
    } else {
      for (const feat of features.slice(0, 4)) {
        scenes.push({
          name: truncate(feat, 30),
          background: colors[scenes.length % colors.length] ?? primaryColor,
          elements: [
            { type: 'heading', text: truncate(feat, 60), size: 'lg' },
          ],
        });
      }
    }
  }

  // --- Sections from content ---
  const usedTitles = new Set(scenes.map(s => s.name));
  for (const section of content.sections.slice(0, 3)) {
    if (!section.title || usedTitles.has(section.title)) continue;
    usedTitles.add(section.title);
    const els: ElementDef[] = [
      { type: 'heading', text: truncate(section.title, 60), size: 'lg' },
    ];
    if (section.body) {
      els.push({ type: 'text', text: truncate(section.body, 150) });
    }
    scenes.push({
      name: truncate(section.title, 30),
      background: colors[scenes.length % colors.length] ?? primaryColor,
      elements: els,
    });
  }

  // --- Tech stack scene (optional, for dev intent) ---
  if (content.techStack.length > 0 && isDevIntent(options.intent)) {
    const topTech = content.techStack.slice(0, 6);
    scenes.push({
      name: 'Built With',
      background: colors[scenes.length % colors.length] ?? primaryColor,
      elements: [
        { type: 'heading', text: 'Built With', size: 'lg' },
        {
          type: 'card-group',
          items: topTech.map(t => ({ title: t })),
        },
      ],
    });
  }

  // --- CTA scene ---
  const ctaText = content.ctaText || 'Try it now';
  scenes.push({
    name: 'CTA',
    background: accentColor,
    elements: [
      { type: 'heading', text: ctaText, size: 'xl' },
    ],
  });

  // Ensure minimum 3 scenes
  if (scenes.length < 3) {
    // Add a "Learn More" filler
    scenes.splice(scenes.length - 1, 0, {
      name: 'About',
      background: colors[1] ?? primaryColor,
      elements: [
        { type: 'heading', text: content.projectName || 'Learn More', size: 'lg' },
        { type: 'text', text: content.description || 'Discover what makes this special.' },
      ],
    });
  }

  // --- Build config object ---
  const config: Record<string, unknown> = {
    video: {
      format: options.format,
      fps: options.fps ?? 60,
      codec: options.codec ?? 'h265',
      mode: options.mode,
      speed: options.speed,
      output: './output/video.mp4',
    },
    scenes,
  };

  return yamlStringify(config, { lineWidth: 120 });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function isDevIntent(intent: string): boolean {
  const lower = intent.toLowerCase();
  return lower.includes('dev') || lower.includes('tech') || lower.includes('portfolio')
    || lower.includes('case study') || lower.includes('showcase');
}

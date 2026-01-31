// Analyze a project folder to extract content for video generation

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';

export interface ExtractedContent {
  source: 'folder' | 'url';
  projectName: string;
  description: string;
  features: string[];
  headings: string[];
  heroText: string;
  ctaText: string;
  techStack: string[];
  colors: string[];
  fonts: string[];
  images: string[]; // paths to usable images
  sections: { title: string; body: string }[];
  raw: Record<string, string>; // filename → content for Claude to reason over
}

/**
 * Analyze a project folder and extract content useful for video generation.
 * Returns structured data that Claude/autogen can turn into YAML scenes.
 */
export function analyzeFolder(folderPath: string): ExtractedContent {
  const result: ExtractedContent = {
    source: 'folder',
    projectName: '',
    description: '',
    features: [],
    headings: [],
    heroText: '',
    ctaText: '',
    techStack: [],
    colors: [],
    fonts: [],
    images: [],
    sections: [],
    raw: {},
  };

  if (!existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }

  // --- Package metadata ---
  const pkgPath = join(folderPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      result.projectName = pkg.name ?? '';
      result.description = pkg.description ?? '';
      if (pkg.keywords) result.features.push(...pkg.keywords);
      // Extract tech stack from deps
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      result.techStack = Object.keys(deps).filter(d =>
        !d.startsWith('@types/') && !d.startsWith('eslint')
      ).slice(0, 15);
      result.raw['package.json'] = JSON.stringify(pkg, null, 2).slice(0, 2000);
    } catch {}
  }

  // Cargo.toml fallback
  const cargoPath = join(folderPath, 'Cargo.toml');
  if (!result.projectName && existsSync(cargoPath)) {
    const cargo = readFileSync(cargoPath, 'utf-8');
    const nameMatch = cargo.match(/^name\s*=\s*"(.+)"/m);
    const descMatch = cargo.match(/^description\s*=\s*"(.+)"/m);
    if (nameMatch) result.projectName = nameMatch[1];
    if (descMatch) result.description = descMatch[1];
    result.raw['Cargo.toml'] = cargo.slice(0, 2000);
  }

  // --- README ---
  for (const name of ['README.md', 'readme.md', 'README.MD', 'ABOUT.md']) {
    const p = join(folderPath, name);
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8');
      result.raw[name] = content.slice(0, 5000);
      extractMarkdownContent(content, result);
      break;
    }
  }

  // --- HTML files ---
  const htmlFiles = findFiles(folderPath, ['.html', '.htm'], 3);
  for (const htmlFile of htmlFiles.slice(0, 5)) {
    const content = readFileSync(htmlFile, 'utf-8');
    const relPath = relative(folderPath, htmlFile);
    result.raw[relPath] = content.slice(0, 4000);
    extractHtmlContent(content, result);
  }

  // --- Design tokens ---
  // ux-craft system.md
  const uxSystem = join(folderPath, '.claude', 'skills', 'ux-craft', 'system.md');
  if (existsSync(uxSystem)) {
    const content = readFileSync(uxSystem, 'utf-8');
    result.raw['ux-craft-system.md'] = content.slice(0, 3000);
    extractDesignTokens(content, result);
  }

  // tailwind.config.*
  for (const name of ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs']) {
    const p = join(folderPath, name);
    if (existsSync(p)) {
      result.raw[name] = readFileSync(p, 'utf-8').slice(0, 3000);
      break;
    }
  }

  // CSS files with variables
  const cssFiles = findFiles(folderPath, ['.css'], 3);
  for (const cssFile of cssFiles.slice(0, 3)) {
    const content = readFileSync(cssFile, 'utf-8');
    if (content.includes('--')) {
      const relPath = relative(folderPath, cssFile);
      result.raw[relPath] = content.slice(0, 3000);
      extractCssTokens(content, result);
    }
  }

  // --- Images ---
  const imgExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  for (const dir of ['public', 'assets', 'static', 'images', 'img', 'src/assets']) {
    const imgDir = join(folderPath, dir);
    if (existsSync(imgDir)) {
      const imgs = findFiles(imgDir, imgExts, 2);
      result.images.push(...imgs.slice(0, 10).map(p => relative(folderPath, p)));
    }
  }

  // Fallback project name from folder
  if (!result.projectName) {
    result.projectName = basename(folderPath);
  }

  return result;
}

// --- Helpers ---

function findFiles(dir: string, extensions: string[], maxDepth: number, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...findFiles(full, extensions, maxDepth, depth + 1));
        } else if (extensions.includes(extname(entry).toLowerCase())) {
          results.push(full);
        }
      } catch {}
    }
  } catch {}
  return results;
}

function extractMarkdownContent(md: string, result: ExtractedContent): void {
  // Headings
  const headingMatches = md.matchAll(/^#{1,3}\s+(.+)$/gm);
  for (const m of headingMatches) {
    result.headings.push(m[1].trim());
  }

  // Features from bullet lists under "Features" or "What" headings
  const featureSection = md.match(/##?\s+(?:Features|What|Highlights|Key)[^\n]*\n((?:[-*]\s+.+\n?)+)/i);
  if (featureSection) {
    const bullets = featureSection[1].matchAll(/[-*]\s+\*?\*?(.+?)(?:\*?\*?\s*$)/gm);
    for (const b of bullets) {
      result.features.push(b[1].trim().replace(/\*\*/g, ''));
    }
  }

  // Description from first paragraph (skip badges/images)
  const firstPara = md.match(/^(?!#|!\[|\[!\[|<)(.{20,})/m);
  if (firstPara && !result.description) {
    result.description = firstPara[1].trim().slice(0, 200);
  }
}

function extractHtmlContent(html: string, result: ExtractedContent): void {
  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && !result.projectName) {
    result.projectName = titleMatch[1].trim();
  }

  // Meta description
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (metaDesc && !result.description) {
    result.description = metaDesc[1];
  }

  // Headings
  const h1s = html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi);
  for (const m of h1s) {
    const text = m[1].trim();
    if (text && !result.headings.includes(text)) {
      result.headings.push(text);
    }
  }

  // Hero: first h1 text
  if (!result.heroText) {
    const hero = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (hero) result.heroText = hero[1].trim();
  }

  // Buttons / CTAs
  const buttons = html.matchAll(/<(?:button|a)[^>]*class="[^"]*(?:btn|cta|button)[^"]*"[^>]*>([^<]+)</gi);
  for (const b of buttons) {
    if (!result.ctaText) result.ctaText = b[1].trim();
  }
}

function extractDesignTokens(content: string, result: ExtractedContent): void {
  // Colors from hex values
  const colors = content.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi);
  for (const c of colors) {
    if (!result.colors.includes(c[0])) result.colors.push(c[0]);
  }

  // Font families
  const fonts = content.matchAll(/font-family[:\s]+["']?([^"';\n,]+)/gi);
  for (const f of fonts) {
    const font = f[1].trim();
    if (!result.fonts.includes(font)) result.fonts.push(font);
  }
}

function extractCssTokens(css: string, result: ExtractedContent): void {
  // CSS custom properties with color values
  const vars = css.matchAll(/--[\w-]+:\s*(#[0-9a-f]{3,8}|rgb[a]?\([^)]+\))/gi);
  for (const v of vars) {
    if (!result.colors.includes(v[1])) result.colors.push(v[1]);
  }
}

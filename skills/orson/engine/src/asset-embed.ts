// Asset embedding: convert local image files to base64 data URIs for self-contained HTML

import { readFileSync, existsSync } from 'fs';
import { resolve, extname, dirname } from 'path';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

/**
 * Convert a local file path to a base64 data URI.
 * Returns the original src if the file doesn't exist or is already a data URI / URL.
 */
export function embedAsDataURI(src: string, basePath?: string): string {
  // Already a data URI or remote URL — leave as-is
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Resolve relative to basePath if provided
  const filePath = basePath ? resolve(dirname(basePath), src) : resolve(src);

  if (!existsSync(filePath)) {
    return src; // fallback to original
  }

  const ext = extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) return src; // unknown type

  const buffer = readFileSync(filePath);
  const base64 = buffer.toString('base64');
  return `data:${mime};base64,${base64}`;
}

/**
 * Process all image src attributes in an HTML string, embedding local files as data URIs.
 * Only embeds files that exist on disk and have recognized image extensions.
 */
export function embedAllImages(html: string, htmlPath: string): string {
  return html.replace(/(<img\s[^>]*src=")([^"]+)(")/g, (_match, prefix, src, suffix) => {
    const embedded = embedAsDataURI(src, htmlPath);
    return `${prefix}${embedded}${suffix}`;
  });
}

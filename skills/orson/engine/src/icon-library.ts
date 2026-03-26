// SVG icon library for scene enrichment
// ~30 inline SVG icons organized by semantic category.
// All icons use viewBox="0 0 24 24", stroke="currentColor", no fill.

export type IconCategory = 'security' | 'performance' | 'code' | 'ui' | 'general';

export interface IconDef {
  id: string;
  category: IconCategory;
  svg: string;
  keywords: string[];
}

// ─── Icon definitions ──────────────────────────────────────

const icons: IconDef[] = [
  // Security
  { id: 'shield', category: 'security', keywords: ['security', 'protect', 'safe', 'guard', 'defense'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: 'lock', category: 'security', keywords: ['lock', 'secure', 'encrypt', 'private', 'auth'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' },
  { id: 'eye', category: 'security', keywords: ['monitor', 'watch', 'observe', 'visibility', 'view'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
  { id: 'fingerprint', category: 'security', keywords: ['fingerprint', 'biometric', 'identity', 'verify'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/><path d="M12 12v10"/><path d="M18 22a8 8 0 001-4v-2"/></svg>' },

  // Performance
  { id: 'bolt', category: 'performance', keywords: ['fast', 'speed', 'quick', 'instant', 'lightning', 'power'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
  { id: 'rocket', category: 'performance', keywords: ['launch', 'deploy', 'ship', 'start', 'grow', 'scale'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>' },
  { id: 'gauge', category: 'performance', keywords: ['performance', 'metric', 'measure', 'benchmark', 'analytics'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>' },
  { id: 'zap', category: 'performance', keywords: ['energy', 'electric', 'charge', 'voltage', 'efficiency'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },

  // Code
  { id: 'terminal', category: 'code', keywords: ['terminal', 'cli', 'command', 'shell', 'console', 'dev'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>' },
  { id: 'brackets', category: 'code', keywords: ['code', 'develop', 'program', 'build', 'engineer', 'api'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
  { id: 'git-branch', category: 'code', keywords: ['git', 'branch', 'version', 'source', 'repo', 'merge'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>' },
  { id: 'bug', category: 'code', keywords: ['bug', 'debug', 'fix', 'error', 'test', 'issue'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M2 12h4m12 0h4M2 8h4m12 0h4M2 16h4m12 0h4"/><path d="M12 2v4"/></svg>' },

  // UI
  { id: 'layout', category: 'ui', keywords: ['layout', 'design', 'interface', 'ui', 'ux', 'wireframe'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' },
  { id: 'palette', category: 'ui', keywords: ['palette', 'color', 'theme', 'style', 'brand', 'visual'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>' },
  { id: 'grid', category: 'ui', keywords: ['grid', 'component', 'module', 'system', 'responsive', 'dashboard'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' },
  { id: 'responsive', category: 'ui', keywords: ['responsive', 'mobile', 'adaptive', 'device', 'screen'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },

  // General
  { id: 'check-circle', category: 'general', keywords: ['check', 'done', 'complete', 'success', 'verified', 'approved'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
  { id: 'star', category: 'general', keywords: ['star', 'rating', 'favorite', 'quality', 'premium', 'best'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { id: 'arrow-right', category: 'general', keywords: ['arrow', 'next', 'forward', 'continue', 'go', 'navigate'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' },
  { id: 'globe', category: 'general', keywords: ['globe', 'world', 'global', 'international', 'web', 'internet'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' },
  { id: 'github', category: 'general', keywords: ['github', 'opensource', 'open-source', 'repository', 'contribute'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>' },
  { id: 'users', category: 'general', keywords: ['users', 'team', 'people', 'community', 'collaborate', 'group'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' },
  { id: 'chart', category: 'general', keywords: ['chart', 'data', 'analytics', 'graph', 'insight', 'report', 'growth'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  { id: 'heart', category: 'general', keywords: ['heart', 'love', 'care', 'passion', 'health', 'wellness'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' },
  { id: 'package', category: 'general', keywords: ['package', 'module', 'library', 'dependency', 'npm', 'bundle'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
  { id: 'sparkle', category: 'general', keywords: ['sparkle', 'ai', 'magic', 'new', 'feature', 'innovation'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>' },
  { id: 'target', category: 'general', keywords: ['target', 'goal', 'focus', 'aim', 'objective', 'precision'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  { id: 'clock', category: 'general', keywords: ['clock', 'time', 'schedule', 'deadline', 'realtime', 'sync'],
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
];

// ─── Lookup functions ──────────────────────────────────────

/**
 * Find the best matching icon for a text string via keyword matching.
 * Returns the SVG string or null if no match found.
 */
export function matchIcon(text: string): string | null {
  const lower = text.toLowerCase();
  let bestIcon: IconDef | null = null;
  let bestScore = 0;

  for (const icon of icons) {
    let score = 0;
    for (const kw of icon.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIcon = icon;
    }
  }

  return bestScore > 0 ? bestIcon!.svg : null;
}

/**
 * Get a fallback icon by category.
 */
export function getCategoryIcon(category: IconCategory): string {
  const match = icons.find(i => i.category === category);
  return match?.svg ?? icons[icons.length - 1].svg;
}

/**
 * Get all icon IDs for a category.
 */
export function getIconsByCategory(category: IconCategory): IconDef[] {
  return icons.filter(i => i.category === category);
}

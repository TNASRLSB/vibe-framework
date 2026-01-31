// Reads ux-craft system.md and extracts design tokens

import { readFileSync, existsSync } from 'fs';

export interface DesignTokens {
  fontDisplay?: string;
  fontBody?: string;
  colorPrimary?: string;
  colorAccent?: string;
  colorBg?: string;
  colorText?: string;
  colorSurface?: string;
  colorOnPrimary?: string;
  colorOnAccent?: string;
  transitionEasing?: string;
  transitionDuration?: string;
}

export function readDesignTokens(systemMdPath: string): DesignTokens | null {
  if (!existsSync(systemMdPath)) return null;

  const content = readFileSync(systemMdPath, 'utf-8');
  const tokens: DesignTokens = {};

  // Extract CSS custom property values from system.md
  // Patterns like: `--font-display: "Inter", sans-serif`
  const extract = (pattern: RegExp): string | undefined => {
    const match = content.match(pattern);
    return match?.[1]?.trim();
  };

  tokens.fontDisplay = extract(/--font-display:\s*(.+?)(?:;|\n|$)/);
  tokens.fontBody = extract(/--font-body:\s*(.+?)(?:;|\n|$)/);
  tokens.colorPrimary = extract(/--color-primary:\s*(.+?)(?:;|\n|$)/);
  tokens.colorAccent = extract(/--color-accent:\s*(.+?)(?:;|\n|$)/);
  tokens.colorBg = extract(/--color-bg(?:round)?:\s*(.+?)(?:;|\n|$)/);
  tokens.colorText = extract(/--color-text:\s*(.+?)(?:;|\n|$)/);
  tokens.colorSurface = extract(/--color-surface:\s*(.+?)(?:;|\n|$)/);
  tokens.colorOnPrimary = extract(/--color-on-primary:\s*(.+?)(?:;|\n|$)/);
  tokens.colorOnAccent = extract(/--color-on-accent:\s*(.+?)(?:;|\n|$)/);
  tokens.transitionEasing = extract(/--transition-easing:\s*(.+?)(?:;|\n|$)/);
  tokens.transitionDuration = extract(/--transition-duration:\s*(.+?)(?:;|\n|$)/);

  return tokens;
}

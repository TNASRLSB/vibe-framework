// Batch rendering: generate N video variants from a template HTML + variable substitutions
// Usage: npx tsx src/index.ts batch <batch-config.json>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { parseHTMLFile } from './html-parser.js';

export interface BatchVariable {
  [key: string]: string;
}

export interface BatchConfig {
  /** Path to template HTML file (with {{variable}} placeholders) */
  template: string;
  /** Array of variable sets — each produces one video */
  variables: Array<BatchVariable & { output?: string }>;
}

export interface BatchResult {
  index: number;
  output: string;
  success: boolean;
  error?: string;
  timeMs: number;
}

/**
 * Parse and validate a batch config JSON file.
 */
export function parseBatchConfig(configPath: string): BatchConfig {
  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as BatchConfig;

  if (!config.template) {
    throw new Error('Batch config missing "template" field');
  }
  if (!Array.isArray(config.variables) || config.variables.length === 0) {
    throw new Error('Batch config "variables" must be a non-empty array');
  }

  // Resolve template path relative to config file
  const configDir = dirname(configPath);
  config.template = resolve(configDir, config.template);

  if (!existsSync(config.template)) {
    throw new Error(`Template not found: ${config.template}`);
  }

  // Resolve output paths relative to config dir
  for (let i = 0; i < config.variables.length; i++) {
    if (config.variables[i].output) {
      config.variables[i].output = resolve(configDir, config.variables[i].output!);
    } else {
      config.variables[i].output = resolve(configDir, `.orson/batch-${i + 1}.mp4`);
    }
  }

  return config;
}

/**
 * Apply variable substitutions to a template HTML string.
 * Replaces all {{key}} placeholders with corresponding values.
 */
export function applyVariables(template: string, variables: BatchVariable): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    if (key === 'output') continue; // skip output path
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value);
  }
  return result;
}

/**
 * Run a batch render job. Returns results for each variant.
 * The actual render is delegated via the renderFn callback so batch.ts
 * doesn't need to import the full render pipeline.
 */
export async function runBatch(
  config: BatchConfig,
  renderFn: (htmlPath: string, outputPath: string) => Promise<void>,
): Promise<BatchResult[]> {
  const template = readFileSync(config.template, 'utf-8');
  const results: BatchResult[] = [];
  const tmpDir = resolve(dirname(config.template), '.batch-tmp');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  console.log(`\nBatch render: ${config.variables.length} variants from ${basename(config.template)}\n`);

  for (let i = 0; i < config.variables.length; i++) {
    const vars = config.variables[i];
    const outputPath = vars.output!;
    const start = Date.now();

    console.log(`[${i + 1}/${config.variables.length}] Rendering → ${basename(outputPath)}`);

    try {
      // Generate variant HTML
      const html = applyVariables(template, vars);
      const tmpHtmlPath = resolve(tmpDir, `variant-${i + 1}.html`);
      writeFileSync(tmpHtmlPath, html);

      // Ensure output directory exists
      const outDir = dirname(outputPath);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

      // Render
      await renderFn(tmpHtmlPath, outputPath);

      results.push({ index: i, output: outputPath, success: true, timeMs: Date.now() - start });
      console.log(`  ✓ Done (${((Date.now() - start) / 1000).toFixed(1)}s)\n`);
    } catch (err: any) {
      results.push({ index: i, output: outputPath, success: false, error: err.message, timeMs: Date.now() - start });
      console.log(`  ✗ Failed: ${err.message}\n`);
    }
  }

  // Clean up temp files
  try {
    const { rmSync } = await import('fs');
    rmSync(tmpDir, { recursive: true });
  } catch {}

  // Summary
  const succeeded = results.filter(r => r.success).length;
  console.log(`\nBatch complete: ${succeeded}/${config.variables.length} succeeded`);

  return results;
}

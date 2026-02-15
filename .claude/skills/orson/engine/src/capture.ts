// Frame-addressed capture (v3)
// Calls window.__setFrame(n) for each frame — the frame renderer handles all animation state.
// No CSS animation time control, no scroll computation, no currentTime hacks.

import { chromium, type Page, type Browser, type BrowserContext } from 'playwright';

export type CaptureFormat = 'png' | 'jpeg';

export interface CaptureOptions {
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  htmlPath: string;
  /** Frame capture format: 'png' is lossless (default), 'jpeg' is ~2x faster but lossy */
  captureFormat?: CaptureFormat;
  onFrame?: (frame: number, total: number) => void;
}

export interface CaptureSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export async function initCapture(opts: CaptureOptions): Promise<CaptureSession> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Set render flag BEFORE page loads — prevents the preview controller from executing
  await page.addInitScript(() => {
    (window as any).__VIDEO_RENDER__ = true;
  });

  // Load the generated HTML (contains static layout + frame renderer JS)
  await page.goto(`file://${opts.htmlPath}`, { waitUntil: 'load' });

  // Let fonts/styles settle
  await page.waitForTimeout(100);

  // Wait for frame renderer to be ready
  await page.waitForFunction(() => (window as any).__frameRendererReady === true, { timeout: 5000 });

  // Render frame 0 to initialize state
  await page.evaluate(() => (window as any).__setFrame(0));

  return { browser, context, page };
}

export async function captureFrames(
  session: CaptureSession,
  opts: CaptureOptions,
  writeFn: (buffer: Buffer) => Promise<void>,
): Promise<void> {
  for (let frame = 0; frame < opts.totalFrames; frame++) {
    // Set frame — the renderer handles all scene visibility, element styles, transitions
    await session.page.evaluate((f) => (window as any).__setFrame(f), frame);

    // Sync PiP video elements (if any)
    const timeMs = frame * 1000 / opts.fps;
    await session.page.evaluate((t) => {
      document.querySelectorAll('video[data-pip]').forEach(v => {
        const video = v as HTMLVideoElement;
        const timeSec = t / 1000;
        if (timeSec <= video.duration) {
          video.currentTime = timeSec;
        }
      });
    }, timeMs);

    const fmt = opts.captureFormat ?? 'png';
    const buffer = await session.page.screenshot(
      fmt === 'jpeg' ? { type: 'jpeg', quality: 100 } : { type: 'png' },
    );
    await writeFn(buffer as Buffer);

    opts.onFrame?.(frame + 1, opts.totalFrames);
  }
}

export async function closeCapture(session: CaptureSession): Promise<void> {
  await session.browser.close();
}

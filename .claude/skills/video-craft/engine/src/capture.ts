// Playwright frame capture with Web Animations API time control
// CSS animations are paused, then currentTime is set per frame for deterministic capture.

import { chromium, type Page, type Browser, type BrowserContext } from 'playwright';

export interface CaptureOptions {
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  htmlPath: string;
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

  // Load the generated HTML
  await page.goto(`file://${opts.htmlPath}`, { waitUntil: 'load' });

  // Let fonts/styles settle
  await page.waitForTimeout(100);

  // Pause all CSS animations — we'll control time manually via Web Animations API
  await page.evaluate(() => {
    document.getAnimations().forEach(a => a.pause());
  });

  return { browser, context, page };
}

export async function captureFrames(
  session: CaptureSession,
  opts: CaptureOptions,
  writeFn: (buffer: Buffer) => Promise<void>,
): Promise<void> {
  const frameDurationMs = 1000 / opts.fps;

  for (let frame = 0; frame < opts.totalFrames; frame++) {
    const timeMs = frame * frameDurationMs;

    // Set all animations to this point in time
    await session.page.evaluate((t) => {
      document.getAnimations().forEach(a => { a.currentTime = t; });
    }, timeMs);

    // Brief wait for the browser to repaint
    await session.page.waitForTimeout(5);

    const buffer = await session.page.screenshot({ type: 'png' });
    await writeFn(buffer as Buffer);

    opts.onFrame?.(frame + 1, opts.totalFrames);
  }
}

export async function closeCapture(session: CaptureSession): Promise<void> {
  await session.browser.close();
}

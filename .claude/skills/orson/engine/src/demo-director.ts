// Demo director — zoom/focus/highlight + animated cursor
// Injects CSS overlays into the Playwright page for visual demo effects

import type { Page } from 'playwright';

// ─── Zoom Overlay ───────────────────────────────────────────

/**
 * Inject a zoom wrapper <div> around the document body content.
 * Uses CSS transform: scale() for smooth zoom transitions.
 */
export async function injectZoomOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (document.getElementById('orson-zoom-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'orson-zoom-wrapper';
    wrapper.style.cssText = `
      transform-origin: center center;
      transform: scale(1);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform-origin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      min-height: 100vh;
    `;

    // Wrap all body children
    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
    document.body.style.overflow = 'hidden';
  });
}

/**
 * Apply zoom centered on a specific element.
 */
export async function applyZoom(
  page: Page,
  selector: string,
  scale: number,
  transitionMs: number,
): Promise<void> {
  await page.evaluate(({ selector, scale, transitionMs }) => {
    const wrapper = document.getElementById('orson-zoom-wrapper');
    const target = document.querySelector(selector);
    if (!wrapper || !target) return;

    const rect = target.getBoundingClientRect();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // Calculate transform-origin to center the target element
    const originX = ((rect.left + rect.width / 2) / viewW) * 100;
    const originY = ((rect.top + rect.height / 2) / viewH) * 100;

    wrapper.style.transition = `transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1), transform-origin ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    wrapper.style.transformOrigin = `${originX}% ${originY}%`;
    wrapper.style.transform = `scale(${scale})`;
  }, { selector, scale, transitionMs });

  // Wait for transition to complete
  await page.waitForTimeout(transitionMs + 50);
}

/**
 * Reset zoom to 1x.
 */
export async function resetZoom(page: Page, transitionMs: number): Promise<void> {
  await page.evaluate((ms) => {
    const wrapper = document.getElementById('orson-zoom-wrapper');
    if (!wrapper) return;

    wrapper.style.transition = `transform ${ms}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    wrapper.style.transform = 'scale(1)';
  }, transitionMs);

  await page.waitForTimeout(transitionMs + 50);
}

// ─── Highlight ──────────────────────────────────────────────

/**
 * Show a pulsing ring highlight around an element.
 */
export async function highlightElement(
  page: Page,
  selector: string,
  durationMs: number,
): Promise<void> {
  await page.evaluate(({ selector, durationMs }) => {
    const target = document.querySelector(selector);
    if (!target) return;

    // Remove any existing highlight
    const existing = document.getElementById('orson-highlight');
    if (existing) existing.remove();

    const rect = target.getBoundingClientRect();
    const padding = 8;

    const highlight = document.createElement('div');
    highlight.id = 'orson-highlight';
    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top - padding}px;
      left: ${rect.left - padding}px;
      width: ${rect.width + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      border: 2px solid rgba(59, 130, 246, 0.8);
      border-radius: 8px;
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      pointer-events: none;
      z-index: 999998;
      animation: orson-pulse 1.5s ease-in-out infinite;
    `;

    // Add keyframes
    if (!document.getElementById('orson-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'orson-highlight-style';
      style.textContent = `
        @keyframes orson-pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(highlight);

    // Auto-remove after duration
    setTimeout(() => highlight.remove(), durationMs);
  }, { selector, durationMs });
}

// ─── Animated Cursor ────────────────────────────────────────

/**
 * Inject a custom SVG cursor overlay.
 * The real cursor is hidden; this fake cursor can be smoothly animated.
 */
export async function injectCursor(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (document.getElementById('orson-cursor')) return;

    const cursor = document.createElement('div');
    cursor.id = 'orson-cursor';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    cursor.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 24px;
      pointer-events: none;
      z-index: 999999;
      transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1), left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      transform-origin: top left;
    `;

    document.body.appendChild(cursor);

    // Hide real cursor
    const style = document.createElement('style');
    style.id = 'orson-cursor-style';
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);
  });
}

/**
 * Animate cursor to a target element with a smooth movement + click press.
 */
export async function animateCursor(
  page: Page,
  selector: string,
  durationMs: number,
): Promise<void> {
  await page.evaluate(({ selector, durationMs }) => {
    const cursor = document.getElementById('orson-cursor');
    const target = document.querySelector(selector);
    if (!cursor || !target) return;

    const rect = target.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    // Move cursor
    cursor.style.transition = `top ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1), left ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    cursor.style.top = `${targetY}px`;
    cursor.style.left = `${targetX}px`;
  }, { selector, durationMs });

  // Wait for movement
  await page.waitForTimeout(durationMs);

  // Click press animation
  await page.evaluate(() => {
    const cursor = document.getElementById('orson-cursor');
    if (!cursor) return;
    cursor.style.transition = 'transform 0.1s ease-in';
    cursor.style.transform = 'scale(0.85)';
    setTimeout(() => {
      cursor.style.transition = 'transform 0.1s ease-out';
      cursor.style.transform = 'scale(1)';
    }, 100);
  });

  await page.waitForTimeout(200);
}

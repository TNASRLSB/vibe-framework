// Demo director — zoom/focus/highlight + animated cursor
// Injects CSS overlays into the Playwright page for visual demo effects

import type { Page } from 'playwright';

// ─── Zoom Overlay ───────────────────────────────────────────

/**
 * Mark the page's root element for zoom transforms.
 * Applies styles directly to #__next (or first body child) — no DOM reparenting,
 * which would break React 18 event delegation.
 */
export async function injectZoomOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (document.querySelector('[data-orson-zoom]')) return;

    const zoomTarget = document.getElementById('__next') || document.body.firstElementChild;
    if (zoomTarget) {
      (zoomTarget as HTMLElement).dataset.orsonZoom = '1';
      (zoomTarget as HTMLElement).style.transformOrigin = 'center center';
      (zoomTarget as HTMLElement).style.transform = 'scale(1)';
      (zoomTarget as HTMLElement).style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform-origin 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      (zoomTarget as HTMLElement).style.width = '100%';
      (zoomTarget as HTMLElement).style.minHeight = '100vh';
    }
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
  try {
    await page.evaluate(({ selector, scale, transitionMs }) => {
      const zoomTarget = document.querySelector('[data-orson-zoom]') as HTMLElement | null;
      const target = document.querySelector(selector);
      if (!zoomTarget || !target) return;

      const rect = target.getBoundingClientRect();
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      const originX = ((rect.left + rect.width / 2) / viewW) * 100;
      const originY = ((rect.top + rect.height / 2) / viewH) * 100;

      zoomTarget.style.transition = `transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1), transform-origin ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      zoomTarget.style.transformOrigin = `${originX}% ${originY}%`;
      zoomTarget.style.transform = `scale(${scale})`;
    }, { selector, scale, transitionMs });

    await page.waitForTimeout(transitionMs + 50);
  } catch (err: any) {
    console.warn(`  [capture] WARN: applyZoom failed for ${selector}: ${err.message}`);
  }
}

/**
 * Reset zoom to 1x.
 */
export async function resetZoom(page: Page, transitionMs: number): Promise<void> {
  try {
    await page.evaluate((ms) => {
      const zoomTarget = document.querySelector('[data-orson-zoom]') as HTMLElement | null;
      if (!zoomTarget) return;

      zoomTarget.style.transition = `transform ${ms}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      zoomTarget.style.transform = 'scale(1)';
    }, transitionMs);

    await page.waitForTimeout(transitionMs + 50);
  } catch (err: any) {
    console.warn(`  [capture] WARN: resetZoom failed: ${err.message}`);
  }
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
  try {
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
  } catch (err: any) {
    console.warn(`  [capture] WARN: highlightElement failed for ${selector}: ${err.message}`);
  }
}

// ─── Dev Overlay Removal ────────────────────────────────────

/**
 * Remove framework dev overlays that intercept pointer events.
 * Covers Next.js (<nextjs-portal>), Vite error overlay, Nuxt dev tools.
 */
export async function removeDevOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    const selectors = [
      'nextjs-portal',
      'vite-error-overlay',
      '[data-nuxt-devtools]',
      '#__next-build-indicator',
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => el.remove());
    }
  });
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
  try {
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
  } catch (err: any) {
    console.warn(`  [capture] WARN: animateCursor failed for ${selector}: ${err.message}`);
  }
}

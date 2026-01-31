// Analyze a URL to extract content for video generation

import type { ExtractedContent } from './analyze-folder.js';

/**
 * Fetch a URL and extract content useful for video generation.
 * Uses Playwright to render the page (handles JS-rendered content).
 */
export async function analyzeUrl(url: string): Promise<ExtractedContent> {
  const { chromium } = await import('playwright');

  const result: ExtractedContent = {
    source: 'url',
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

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Wait a bit for JS rendering
    await page.waitForTimeout(2000);

    // Extract structured content via page.evaluate
    const extracted = await page.evaluate(() => {
      const getText = (el: Element | null) => el?.textContent?.trim() ?? '';

      // Title
      const title = document.title;

      // Meta description
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';

      // OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? '';
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';

      // Headings
      const headings: string[] = [];
      document.querySelectorAll('h1, h2, h3').forEach(h => {
        const text = getText(h);
        if (text && text.length < 200) headings.push(text);
      });

      // Hero text: first h1
      const heroText = getText(document.querySelector('h1'));

      // Buttons / CTAs
      const buttons: string[] = [];
      document.querySelectorAll('a, button').forEach(el => {
        const text = getText(el);
        const cls = el.className?.toLowerCase?.() ?? '';
        if (text && text.length < 50 && (cls.includes('btn') || cls.includes('cta') || cls.includes('button') || el.tagName === 'BUTTON')) {
          buttons.push(text);
        }
      });

      // Sections: look for section/article elements
      const sections: { title: string; body: string }[] = [];
      document.querySelectorAll('section, article, [class*="feature"], [class*="card"]').forEach(el => {
        const heading = getText(el.querySelector('h2, h3, h4'));
        const body = getText(el.querySelector('p'));
        if (heading || body) {
          sections.push({ title: heading, body: body.slice(0, 300) });
        }
      });

      // Colors from computed styles on key elements
      const colors: string[] = [];
      const colorEls = [document.body, document.querySelector('header'), document.querySelector('main'), document.querySelector('nav')];
      for (const el of colorEls) {
        if (!el) continue;
        const style = getComputedStyle(el);
        colors.push(style.backgroundColor, style.color);
      }

      // Fonts
      const fonts: string[] = [];
      const fontEls = [document.body, document.querySelector('h1')];
      for (const el of fontEls) {
        if (!el) continue;
        const font = getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        if (font && !fonts.includes(font)) fonts.push(font);
      }

      return {
        title, metaDesc, ogTitle, ogDesc, ogImage,
        headings: headings.slice(0, 20),
        heroText,
        buttons: buttons.slice(0, 5),
        sections: sections.slice(0, 10),
        colors: [...new Set(colors.filter(c => c && c !== 'rgba(0, 0, 0, 0)'))],
        fonts,
      };
    });

    result.projectName = extracted.ogTitle || extracted.title || '';
    result.description = extracted.ogDesc || extracted.metaDesc || '';
    result.headings = extracted.headings;
    result.heroText = extracted.heroText;
    result.ctaText = extracted.buttons[0] ?? '';
    result.colors = extracted.colors;
    result.fonts = extracted.fonts;
    result.sections = extracted.sections;
    if (extracted.ogImage) result.images.push(extracted.ogImage);

    // Features from sections with short titles
    for (const s of extracted.sections) {
      if (s.title && s.title.length < 60) {
        result.features.push(s.title);
      }
    }

    // Store raw for Claude
    result.raw['page-extract'] = JSON.stringify(extracted, null, 2).slice(0, 5000);

  } finally {
    await browser.close();
  }

  return result;
}

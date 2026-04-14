// CSS-only UI mockup templates for scene enrichment
// Terminal, browser, phone mockups — no external images.

export type MockupType = 'terminal' | 'browser' | 'phone';

/**
 * Detect which mockup type fits the text content.
 * Returns null if no mockup is appropriate.
 */
export function detectMockupType(text: string): MockupType | null {
  const lower = text.toLowerCase();
  if (/\b(code|terminal|cli|command|shell|npm|pip|brew|git|script)\b/.test(lower)) return 'terminal';
  if (/\b(ui|interface|website|web app|page|dashboard|browser|layout)\b/.test(lower)) return 'browser';
  if (/\b(mobile|app|phone|ios|android|responsive)\b/.test(lower)) return 'phone';
  return null;
}

/**
 * Generate a CSS-only terminal mockup.
 */
function terminalMockup(codeSnippet?: string): string {
  const code = codeSnippet ?? '$ npm install\n$ npm run build\n✓ Built successfully';
  const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<div class="mockup mockup-terminal" style="width:85%;max-width:480px;background:#1a1a2e;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);font-family:'SF Mono',Monaco,'Cascadia Code',monospace;">
  <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(255,255,255,0.05);">
    <div style="width:10px;height:10px;border-radius:50%;background:#ff5f57;"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:#28ca41;"></div>
  </div>
  <pre style="padding:16px;margin:0;font-size:13px;line-height:1.5;color:#a0e8af;white-space:pre-wrap;overflow:hidden;max-height:180px;">${escapedCode}</pre>
</div>`;
}

/**
 * Generate a CSS-only browser window mockup.
 */
function browserMockup(): string {
  return `<div class="mockup mockup-browser" style="width:85%;max-width:480px;background:#1e1e2e;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
  <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.05);">
    <div style="display:flex;gap:5px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#ff5f57;"></div>
      <div style="width:10px;height:10px;border-radius:50%;background:#ffbd2e;"></div>
      <div style="width:10px;height:10px;border-radius:50%;background:#28ca41;"></div>
    </div>
    <div style="flex:1;height:24px;background:rgba(255,255,255,0.08);border-radius:4px;padding:0 8px;font-size:11px;color:rgba(255,255,255,0.4);display:flex;align-items:center;">https://yourapp.com</div>
  </div>
  <div style="padding:20px;min-height:120px;display:flex;flex-direction:column;gap:12px;">
    <div style="height:14px;width:60%;background:rgba(255,255,255,0.12);border-radius:3px;"></div>
    <div style="height:10px;width:80%;background:rgba(255,255,255,0.06);border-radius:3px;"></div>
    <div style="height:10px;width:45%;background:rgba(255,255,255,0.06);border-radius:3px;"></div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <div style="flex:1;height:60px;background:rgba(255,255,255,0.05);border-radius:6px;"></div>
      <div style="flex:1;height:60px;background:rgba(255,255,255,0.05);border-radius:6px;"></div>
    </div>
  </div>
</div>`;
}

/**
 * Generate a CSS-only phone frame mockup.
 */
function phoneMockup(): string {
  return `<div class="mockup mockup-phone" style="width:200px;background:#1a1a2e;border-radius:28px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:3px solid rgba(255,255,255,0.1);">
  <div style="width:80px;height:6px;background:rgba(255,255,255,0.15);border-radius:3px;margin:8px auto;"></div>
  <div style="padding:12px;min-height:240px;display:flex;flex-direction:column;gap:10px;">
    <div style="height:12px;width:50%;background:rgba(255,255,255,0.12);border-radius:3px;"></div>
    <div style="height:8px;width:70%;background:rgba(255,255,255,0.06);border-radius:3px;"></div>
    <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:10px;margin-top:8px;"></div>
    <div style="height:32px;background:var(--color-accent,#e94560);border-radius:8px;"></div>
  </div>
</div>`;
}

/**
 * Generate a mockup HTML string for the given type.
 */
export function generateMockup(type: MockupType, codeSnippet?: string): string {
  switch (type) {
    case 'terminal': return terminalMockup(codeSnippet);
    case 'browser': return browserMockup();
    case 'phone': return phoneMockup();
  }
}

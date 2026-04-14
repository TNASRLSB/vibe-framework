# Video Recipes — Schemas & Commands

Scene breakdowns and storytelling structure are not included — you can construct these from format, speed, and audio presets. This file covers JSON schemas, CLI commands, and reusable code patterns.

---

## Demo Script JSON Schema

Complete schema for automated browser demo recordings. Every field shown:

```json
{
  "url": "https://app.example.com",
  "format": "horizontal-16x9",
  "fps": 30,
  "voice": "en-US-GuyNeural",
  "voicePreset": "tech-demo",
  "output": "./demo.mp4",
  "music": { "enabled": true, "style": "auto", "volume": 0.25 },
  "subtitles": { "enabled": true },
  "sfx": { "enabled": true, "autoFromActions": true, "volume": 0.6 },
  "auth": [],
  "storageState": null,
  "steps": [
    {
      "action": "none",
      "narration": "Let me show you how to get started with our platform.",
      "pauseAfterMs": 2000
    },
    {
      "action": "click",
      "selector": "#get-started-btn",
      "narration": "Click Get Started to create your account.",
      "pauseAfterMs": 2000,
      "highlight": true
    },
    {
      "action": "fill",
      "selector": "#email",
      "value": "demo@company.com",
      "narration": "Enter your email address.",
      "typingSpeed": 50,
      "pauseAfterMs": 1500
    }
  ]
}
```

### Step Fields

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | `none`, `click`, `fill`, `scroll`, `wait` |
| `selector` | string | CSS selector for the target element |
| `narration` | string | Voiceover text for this step |
| `pauseAfterMs` | number | Milliseconds to hold after the action |
| `typingSpeed` | number | Ms between keystrokes (for `fill` action) |
| `highlight` | bool | Adds a visual indicator around the target |
| `auth` | array | Pre-demo login steps |
| `storageState` | string | Path to pre-authenticated session state |
| `zoom` | number | Zoom level to focus on a UI element (e.g. `1.5`) |

---

## Batch Rendering Config

Render multiple variants from one template:

```json
{
  "template": "./video-template.html",
  "outputDir": "./variants/",
  "variants": [
    {
      "name": "variant-a",
      "variables": {
        "headline": "Ship Faster",
        "cta": "Start Free Trial"
      }
    },
    {
      "name": "variant-b",
      "variables": {
        "headline": "Build Better",
        "cta": "Get Started Now"
      }
    }
  ]
}
```

```bash
npx tsx src/index.ts batch variants-config.json
```

---

## Quick Iteration Workflow

1. **Write HTML** with video and scene comments
2. **Preview**: `npx tsx src/index.ts render video.html --preview` -- scrub through in browser
3. **Draft render**: `npx tsx src/index.ts render video.html --draft --no-audio` -- fast visual check
4. **Draft with audio**: `npx tsx src/index.ts render video.html --draft` -- check audio sync
5. **Full render**: `npx tsx src/index.ts render video.html --narrate` -- final quality
6. **Parallel**: Add `--parallel` for long videos (> 30s)

---

## Content Extraction

Extract content from an existing project before creating a video:

```bash
# From a project folder (README, package.json, etc.)
npx tsx src/index.ts analyze-folder ./my-project

# From a live URL (Playwright scrapes headings, text, images)
npx tsx src/index.ts analyze-url https://example.com
```

Both output JSON with extracted content that can be used to build the storyboard.

---

## Kinetic Typography Pattern

Use `S()` to split text elements into individually animatable spans:

```js
// Split a quote element into word spans
S(document.querySelector('[data-el="s0-quote"]'), 'w');
// Then animate each word span with staggered A() calls
```

Split modes: `'w'` (words), `'c'` (characters), `'l'` (lines).

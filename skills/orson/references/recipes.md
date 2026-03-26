# Orson Recipes

Ready-to-use video recipes for common use cases.

---

## Product Promo (30s, Vertical)

**Format:** vertical-9x16 (Instagram Reels, TikTok, YouTube Shorts)
**Mode:** safe | **Speed:** normal | **Voice preset:** promo

### Scene Breakdown

| Scene | Duration | Content | Animation |
|-------|----------|---------|-----------|
| 1. Hook | 3s | Bold question or pain point | Slide up + spring scale |
| 2. Problem | 4s | Describe the problem | Fade in elements, typing SFX |
| 3. Solution | 5s | Product screenshot + key benefit | Clip reveal + mockup |
| 4. Feature 1 | 4s | First key feature | Slide from left |
| 5. Feature 2 | 4s | Second key feature | Slide from right |
| 6. Social proof | 4s | Stat or testimonial | Counter animation |
| 7. CTA | 3s | Call to action + logo | Spring pop + success SFX |

### Audio Setup

- **Track style:** corporate or electronic (auto-selected from mode)
- **Narration:** One sentence per scene, enthusiastic style
- **SFX:** click on feature reveals, success on CTA

### HTML Config

```html
<!-- @video format="vertical-9x16" fps="30" speed="normal" mode="safe"
     codec="h264" output="./promo.mp4" -->
```

---

## Feature Explainer (60s, Horizontal)

**Format:** horizontal-16x9 (YouTube, website embed)
**Mode:** safe | **Speed:** slow | **Voice preset:** explainer

### Scene Breakdown

| Scene | Duration | Content | Animation |
|-------|----------|---------|-----------|
| 1. Intro | 5s | Product name + tagline | Fade in + scale |
| 2. Overview | 8s | What it does in one sentence | Slide up |
| 3. Feature A | 8s | Feature + screenshot | Split layout, clip reveal |
| 4. Feature B | 8s | Feature + screenshot | Split layout (mirrored) |
| 5. Feature C | 8s | Feature + screenshot | Split layout |
| 6. How it works | 10s | 3-step process | Cascade down with numbering |
| 7. Pricing/value | 5s | Key differentiator | Scale pop |
| 8. CTA | 5s | Next step + URL | Spring bounce |

### Audio Setup

- **Track style:** corporate
- **Narration:** Detailed per-scene, 140 WPM
- **SFX:** Subtle clicks on feature transitions

---

## Demo Walkthrough (90s, Horizontal)

**Format:** horizontal-16x9
**Mode:** safe | **Voice preset:** tech-demo

### Demo Script Structure

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
      "pauseAfterMs": 2000
    },
    {
      "action": "fill",
      "selector": "#email",
      "value": "demo@company.com",
      "narration": "Enter your email address.",
      "typingSpeed": 50,
      "pauseAfterMs": 1500
    },
    {
      "action": "click",
      "selector": "#submit",
      "narration": "Submit the form and you are in.",
      "pauseAfterMs": 2000,
      "highlight": true
    }
  ]
}
```

### Key Demo Features

- **Animated cursor**: Moves smoothly to each target element
- **Auto SFX**: Click sounds on button presses, typing sounds on text input
- **Zoom**: Use `"zoom": 1.5` on a step to focus on a UI element
- **Highlights**: `"highlight": true` adds a visual indicator around the target
- **Auth support**: `"auth"` array for pre-demo login steps
- **Storage state**: `"storageState"` for pre-authenticated sessions

---

## Social Media Short (15s, Vertical)

**Format:** vertical-9x16 (Instagram Reels, TikTok)
**Mode:** chaos | **Speed:** fast | **Voice preset:** promo (or no narration)

### Scene Breakdown

| Scene | Duration | Content | Animation |
|-------|----------|---------|-----------|
| 1. Hook | 2s | Attention-grabbing text | Spring pop, high energy |
| 2. Reveal | 4s | Product/feature showcase | Clip reveal + particles |
| 3. Benefit | 4s | Key benefit | Slide + noise drift |
| 4. CTA | 3s | Follow/subscribe + logo | Bounce + success SFX |

### Audio Setup

- **Track style:** electronic or upbeat (chaos mode auto-selects)
- **Narration:** Optional, use text-on-screen instead for silent autoplay
- **SFX:** Whoosh on transitions, click on reveals, high density

### Tips for Short-Form

- Use `speed: "fast"` or `"fastest"` for punchy timing
- Keep text short (5-8 words per element)
- Use `mode: "chaos"` for more energetic animation selection
- Front-load the hook in the first 2 seconds
- Use `--draft` for quick iteration, render full quality last

---

## Testimonial Video (20s, Square)

**Format:** square-1x1 (Social media feed)
**Mode:** safe | **Speed:** slow | **Voice preset:** calm or neutral

### Scene Breakdown

| Scene | Duration | Content | Animation |
|-------|----------|---------|-----------|
| 1. Quote | 8s | Customer quote text | Fade in word-by-word (text splitter) |
| 2. Attribution | 4s | Name, title, company | Slide up |
| 3. Result | 5s | Key metric/outcome | Counter + spring |
| 4. Logo | 3s | Company logo | Scale reveal |

### Animation Highlight: Kinetic Typography

Use `S(element, 'w')` to split the quote into words, then animate each word:

```js
// In scene script:
S(document.querySelector('[data-el="s0-quote"]'), 'w');
// Then animate each word span with staggered A() calls
```

---

## Cinematic Brand Story (45s, Widescreen)

**Format:** cinema-21x9 (Premium feel)
**Mode:** hybrid | **Speed:** slowest | **Voice preset:** sales or tutorial

### Scene Breakdown

| Scene | Duration | Content | Animation |
|-------|----------|---------|-----------|
| 1. Mood | 5s | Dark background + subtle particles | Noise drift, particle system |
| 2. Problem | 7s | Industry challenge | Slow fade, blur in |
| 3. Vision | 7s | The big idea | Clip reveal, cinematic |
| 4. Solution | 8s | Product reveal | Scale + brightness |
| 5. Impact | 8s | Results/metrics | Counter cascade |
| 6. Brand | 5s | Logo + tagline | SVG draw + spring |
| 7. CTA | 5s | Website URL | Fade in, minimal |

### Audio Setup

- **Track style:** cinematic (non-loopable, builds in intensity)
- **Narration:** Dramatic pace, low WPM
- **SFX:** Cinematic impacts at scene transitions

---

## Batch Rendering: A/B Variants

Render multiple versions from one template with different variables:

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

Before creating a video, extract content from an existing project:

```bash
# From a project folder (README, package.json, etc.)
npx tsx src/index.ts analyze-folder ./my-project

# From a live URL (Playwright scrapes headings, text, images)
npx tsx src/index.ts analyze-url https://example.com
```

Both output JSON with extracted content that can be used to build the storyboard.

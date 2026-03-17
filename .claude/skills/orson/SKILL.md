---
name: orson
description: "Programmatic video generation from design system + content. Creates HTML-based videos with frame-addressed animations, rendered via Playwright + FFmpeg. Use when creating product videos, social media promos, explainers, or any video content. Triggers on 'video', 'render', 'animation', 'promo video', 'social media video'. Integrates with Seurat for design and Ghostwriter for copy."
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
  - Task
---

# orson

Programmatic video generation from design system + content. Generates purpose-built HTML pages with static layouts and frame-addressed animations (`window.__setFrame(n)`), captures frame-by-frame via Playwright, and encodes to video with FFmpeg.

## Commands

| Command | What it does |
|---------|-------------|
| `/orson create` | **Guided flow** — interactively create a video from a folder, URL, or manual input |
| `/orson render <file.html>` | Render video from HTML config (with audio) |
| `/orson render <file.html> --no-audio` | Render video without audio |
| `/orson demo <script.json>` | **Demo mode** — record a live website demo with narration, zoom, and cursor |
| `/orson formats` | List format presets |
| `/orson entrances` | List all available entrances |

---

## Step 0: Setup (automatic)

Before running ANY command, ensure the engine is ready. Run this silently — do not ask the user.

```bash
ENGINE_DIR=".claude/skills/orson/engine"

# Check if node_modules exists
if [ ! -d "$ENGINE_DIR/node_modules" ]; then
  cd "$ENGINE_DIR" && npm install && npx playwright install chromium
fi

# Check if audio library has tracks (download if missing)
if [ ! -d "$ENGINE_DIR/audio/tracks" ] || [ -z "$(ls "$ENGINE_DIR/audio/tracks/"*.mp3 2>/dev/null)" ]; then
  bash "$ENGINE_DIR/audio/download-library.sh"
fi

# Check if Python venv exists for TTS narration
VENV_DIR="$ENGINE_DIR/audio/.venv"
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR" && "$VENV_DIR/bin/pip" install -q edge-tts
fi

# If a non-default TTS engine is configured, install its package too
if [ -n "$ORSON_TTS_ENGINE" ] && [ "$ORSON_TTS_ENGINE" != "edge-tts" ]; then
  PIP_PKG=$(python3 -c "import json; d=json.load(open('$ENGINE_DIR/audio/presets/voices.json')); print(d.get('engines',{}).get('$ORSON_TTS_ENGINE',{}).get('pip_package',''))" 2>/dev/null)
  [ -n "$PIP_PKG" ] && "$VENV_DIR/bin/pip" install -q "$PIP_PKG"
fi
```

The engine lives at `.claude/skills/orson/engine/`. All CLI commands use:
```
npx tsx .claude/skills/orson/engine/src/index.ts <command> [args]
```

**System requirement:** FFmpeg must be installed on the system (`ffmpeg` in PATH).

---

## Guided Flow (`/orson create`)

The workflow follows a filmmaking process: **Pre-production → Screenplay → Storyboard → Production**.

Use `AskUserQuestion` for each interactive step.

---

### PHASE 1: PRE-PRODUCTION

#### Step 1.1: Source

Ask the user where the content comes from:

- **from-folder `<path>`** — Analyze a local project/site folder
- **from-url `<url>`** — Fetch and analyze a live URL
- **manual** — User describes content in chat

**For folder/URL:** Run the analyzer and **read the ENTIRE source material** (not just the JSON summary):
```bash
npx tsx .claude/skills/orson/engine/src/index.ts analyze-folder <path>
```

The JSON output is a starting point, but you MUST also read the original files (README, docs, etc.) to understand:
- What is the core value proposition?
- What are ALL the features (not just the first 3-4)?
- What problems does it solve?
- Who is the target audience?
- What makes it unique vs competitors?

Show the user a comprehensive summary and ask: "Does this capture everything important? Anything missing?"

#### Step 1.2: Design System

Check for existing seurat design system:
1. Look for `<project-folder>/.seurat/tokens.css`
2. **If found** → inform user: "Found existing design system — video will use your brand."
3. **If NOT found** → invoke `/seurat extract` to create one.

#### Step 1.3: Output Location

Default output directory: `.orson/` (in the project root). Inform the user:
> "I file verranno salvati in `.orson/` — è già nel `.gitignore`."

Only ask for a custom path if the user explicitly requests one.

#### Step 1.4: Video Parameters

Collect in sequence:

**Intent:**
- Product launch / feature showcase
- Social media promo (Instagram/TikTok/YouTube Shorts)
- Explainer / tutorial teaser
- Portfolio / case study
- Custom

**Format** (suggest based on intent):
- `horizontal-16x9` (1920x1080) — YouTube, presentations
- `vertical-9x16` (1080x1920) — Reels, TikTok, Shorts
- `vertical-4x5` (1080x1350) — Instagram feed
- `square-1x1` (1080x1080) — Instagram, Twitter

**Style:**
- **safe** — Clean, corporate, professional
- **hybrid** — Clean base + one surprise per scene
- **chaos** — Dynamic, experimental, random
- **cocomelon** — Neuro-optimized, pattern interrupts, dopamine loops

**Speed:**
- **slow** — Relaxed, more reading time
- **normal** — Balanced
- **fast** — Punchy, quick cuts

#### Step 1.5: Voice

Ask the user about narration:

1. **Narration enabled?** — Yes (default) / No
2. **Voice preset** — Based on intent from Step 1.4:
   - Product launch → `promo`
   - Feature showcase → `tech-demo`
   - Social media promo → `promo`
   - Explainer → `explainer`
   - Tutorial teaser → `tutorial`
   - Portfolio / case study → `explainer`

   Suggest the preset but let the user override. Available presets: `tech-demo`, `explainer`, `promo`, `tutorial`, `sales`, `onboarding`.

   Each preset specifies voice, style, speech rate (WPM), and prosody based on peer-reviewed research. See `engine/audio/presets/voice-presets.json`.

3. **Language** — Auto-detect from content, confirm with user.
   If non-English, use locale override from voice-presets.json.

Include the chosen preset in the narration brief so `narration_generator.py` uses the correct voice and speech rate.

---

### PHASE 2: SCREENPLAY (Sceneggiatura)

This is where Claude acts as the **screenwriter**. The goal: transform raw content into a structured narrative with compelling copy.

#### Step 2.1: Scene Structure

Based on the source material analysis, design the scene structure:

1. **Identify key messages** — What MUST be in the video? (core value, differentiators, proof points)
2. **Map to scene types** — Hook, problem, solution, features, proof, CTA
3. **Decide scene count** — Based on content depth and video intent (social = 4-6 scenes, presentation = 6-10)

Present the scene outline to the user:
```
Scene 1 (Hook): [provocative question or statement]
Scene 2 (Problem): [pain point]
Scene 3 (Solution): [product intro]
Scene 4 (Feature): [key capability 1]
Scene 5 (Feature): [key capability 2]
Scene 6 (Proof): [benchmarks/social proof]
Scene 7 (CTA): [call to action]
```

Ask: "Does this structure work? Want to add/remove/reorder scenes?"

#### Step 2.2: Copywriting

Ask the user: **"Do you want me to invoke `/ghostwriter` to optimize the video text?"**

- **Yes** → Invoke `/ghostwriter` with:
  - Video intent and target platform
  - Source content summary
  - Scene structure
  - Request: punchy headlines, emotional hooks, action-oriented CTAs

- **No** → Use source text as-is (shortened for video)

**Write the copy for each scene:**
- Headlines: 3-8 words, clear value prop
- Body text: 10-20 words max per element
- CTAs: action verbs, urgency

Show the complete screenplay to the user:
```
Scene 1: "Hook"
  - Heading: "What if 100 AI agents worked for you?"

Scene 2: "The Problem"
  - Heading: "One task. One agent. One bottleneck."
  - Text: "Sequential execution is holding you back"

Scene 3: "The Solution"
  - Heading: "Kimi K2.5"
  - Text: "The world's first agentic swarm AI"

[...etc for all scenes...]
```

Ask: "Happy with the screenplay? Any text changes?"

---

### PHASE 3: STORYBOARD — Write HTML Directly

Claude writes the video HTML directly — no intermediate JSON, no autogen. This produces higher quality output because Claude controls the exact layout, styling, and animations.

#### Step 3.0: Choose Aesthetic

Before writing any HTML, read `references/visual-recipes.md` and decide:

1. **Visual recipe** — Pick one of the 24 recipes based on brand tone and intent. Apply its palette, typography, layout, animation energy, decoratives, camera, and signature CSS holistically.
2. **Color arc** — Pick an arc type (cold→warm, dark→bright, mono→chromatic, complementary shift, brand crescendo). Shift CSS custom properties per scene.
3. **Camera motion plan** — Plan a DIFFERENT camera motion for at least 3 scenes (e.g., scene 0 = push-in, scene 2 = settle, scene 4 = drift, scene 6 = static). Wrap scene content in `<div class="cam" data-el="sN-cam">` with `overflow:hidden`.
4. **Animation plan** — Before writing any A() calls, plan which entrance animations you'll use. Choose at least 5 DISTINCT entrance types from `actions.ts` (e.g., `slam` for hero, `clip-reveal-left` for body, `spring-scale` for icons, `bounce-in-up` for stats, `blur-in` for taglines). Hero/CTA scenes MUST use a "statement" entrance (`slam`, `stamp`, `scale-word`, `impact-word`, `drop`, `kinetic-push`). Consider `SP()` spring physics for bouncy/elastic entrances — it produces more natural motion than `outBack`/`outElastic`.
5. **Kinetic typography** — Pick at least 2 scenes for kinetic text. Hero headline MUST use word-by-word or impact-word reveal. CTA scene should use kinetic emphasis.
6. **Transition plan** — Choose at least 3 different scene transition types (e.g., `crossfade`, `wipe-left`, `blur`, `scale-reveal`). Never use the same transition for all scenes.
7. **CSS ambient motion** — Decorative elements are now animated by default (orb float, glow pulse, grid fade, etc.) via CSS @keyframes synced to frame capture. Add shimmer/shine on CTA buttons and premium cards. For gradient text headlines, add `amb-gradient-text` animation.
8. **Spatial fill** — Follow the fill FLOOR and CEILING targets per scene type. Under-filling (content too small) is as bad as over-filling. Headlines must span ≥60% of viewport width.

Tell the user which recipe, arc, and animation approach you chose before writing HTML.

#### Step 3.1: Write the HTML

Create `<output-dir>/video.html`. Read `references/html-contract.md` for the full HTML format specification (comment syntax, scene structure, animation script, available easings/properties, format-specific CSS). For reusable CSS layout snippets (hero, cards, code blocks, mockups, stats, SVG draw patterns), see `references/components.md`.

**Scene timing: auto-start (recommended).** Omit `start` from scenes — the runtime computes it automatically from `frames` + `XFADE`:
```javascript
var scenes = [
  { id: 'scene-0', frames: 210 },
  { id: 'scene-1', frames: 270 },
];
var XFADE = 30;
// Runtime auto-computes: scene-0.start=0, scene-1.start=180
```

**New animation functions** (see `html-contract.md` → "New Animation Functions"):
- `SP()` — Spring physics (replaces `outBack`/`outElastic` for more natural motion)
- `N()` — Perlin noise (organic drift, camera shake)
- `D()` — SVG path draw (animated underlines, connectors, logo draw-on)
- `P()` — Particle system (noise-driven animated particles)
- `R()` — Seeded random (deterministic positions)

#### Step 3.1b: Quality Validation (MANDATORY)

Before previewing, validate HTML against `references/quality-validation.md` — 29 checks across 6 categories:
- **A. Spatial Fill** — headline width ≥60%, vertical spread ≥40%, gap sizing ≥32px
- **B. Typography** — hero headline ≥80px, body ≥28px, stats ≥96px, contrast ≥4.5:1
- **C. Component Sizing** — cards ≥40% viewport, CTA ≥24px font, icons ≥48px
- **D. Animation Diversity** — ≥5 distinct entrance types from ≥3 categories, hero/CTA use statement entrances, ≥3 transition types, ≥2 camera motions, ≥2 kinetic typography scenes
- **D2. v6 Function Usage** — ≥1 SP(), ≥1 N(), ≥1 D(), ≥1 P()/N()-decorative, ≥2 CSS ambient, ≥1 shimmer/shine
- **E. Visual Variety** — no 3+ consecutive same layouts, max 3 text-only scenes, visible color arc

**If ANY check fails, fix it BEFORE proceeding to preview.**

#### Step 3.2: Preview & Verify

Use the interactive preview to check the HTML before rendering:
```bash
npx tsx .claude/skills/orson/engine/src/index.ts render <output-dir>/video.html --preview
```

Verify:
- All scenes display correctly (no text overflow, no overlapping elements)
- Content fills the viewport adequately (no "tiny island in vast darkness" scenes)
- Animations are diverse (each scene feels distinct, not the same fade-in-up repeated)
- Scene transitions vary (not all crossfade)
- Kinetic typography plays correctly on hero/CTA scenes
- Camera motions differ between scenes
- Colors and typography match the design system

If issues found, fix the HTML directly and re-preview.

Show the user a summary:
```
Video HTML ready (7 scenes, 28.5s total):
  1. "Hook" (3.5s) — "Frame-Perfect Video"
  2. "The Problem" (4.5s) — "Screen Recording Is Dead"
  [...]
```

Ask: "Ready to render?"

---

### PHASE 4: PRODUCTION

#### Step 4.1: Render

```bash
npx tsx .claude/skills/orson/engine/src/index.ts render <output-dir>/video.html
```

For faster rendering on multi-core systems:
```bash
npx tsx .claude/skills/orson/engine/src/index.ts render <output-dir>/video.html --parallel
```

Report output path and stats when done.

---

## Audio System

Audio (background music + narration) is automatically added during `render`. Use `--no-audio` to skip.

For full details on audio selection, TTS engines, narration pipeline, SFX configuration, and audio library management, read `references/audio-system.md`.

**Quick reference:**
- TTS engine priority: script field → `ORSON_TTS_ENGINE` env → auto-detect → edge-tts fallback
- Voice presets: `tech-demo`, `explainer`, `promo`, `tutorial`, `sales`, `onboarding`
- SFX in HTML: `sfx="click@1500,typing@2000:3000"` on `@scene` comments

---

## Demo Mode (`/orson demo`)

Record a live website demo with narration, zoom, cursor animation, and background music.

### Guided Flow

Use `AskUserQuestion` for each step.

#### Pre-production

1. **URL** — Ask for the website URL to demo
2. **Auth** — Does the site require login? If yes, collect auth steps (URL, selectors, credentials)
3. **Format** — `horizontal-16x9` (default for demos), or other
4. **Voice** — Use a voice preset from `engine/audio/presets/voice-presets.json` based on demo type:
   - Product demo → `tech-demo`
   - Feature explainer → `explainer`
   - Marketing demo → `promo`
   - Tutorial walkthrough → `tutorial`
   - Or specify an explicit voice name (overrides preset)
5. **Music** — Enabled? Style auto or specific? Volume (default 0.3)?

#### Screenplay

Design the demo script step-by-step:

1. For each feature to demonstrate, define:
   - **narration** — What to say (conversational, 1-2 sentences)
   - **action** — What to do (click, fill, scroll, hover, navigate, wait, none)
   - **selector** — CSS selector for the action target
   - **value** — Text to type (for fill) or URL (for navigate)
   - **zoom** — Zoom level (1-3, optional)
   - **highlight** — Show ring around target (optional)

2. Present the screenplay to the user for approval

#### Production

Write the script JSON and run:

```bash
npx tsx .claude/skills/orson/engine/src/index.ts demo <script.json>
```

For demo script JSON format, field reference, authentication patterns, and framework compatibility notes, read `references/demo-format.md`.

### Demo Pipeline

1. Parse + validate script (Zod)
2. Generate narration brief → run `narration_generator.py` → MP3 files (loudness normalized to -14 LUFS by audio-mixer.ts)
3. Build narration-first timeline (zoom → narration → action)
3.5. Build SFX track from actions (auto) or explicit per-step overrides
4. Launch Playwright, pre-flight selector validation, execute auth, record frames
5. Encode frames to video (FFmpeg)
6. Process audio: concatenate narration → build SFX track → select music → duck → mix all three → merge
7. Generate WebVTT subtitles

### Pre-flight Checks

Before recording, the engine validates:
1. All selectors exist on the initial page (warning if not found — selectors for post-navigation pages are expected to be missing)
2. Python venv is available with edge-tts installed (auto-created if missing)
3. Music tracks are available (downloaded or silence placeholders)

---

## Running

```bash
# Guided creation (via Claude skill)
/orson create

# Demo recording (via Claude skill)
/orson demo

# Direct CLI (from project root)
npx tsx .claude/skills/orson/engine/src/index.ts render video.html
npx tsx .claude/skills/orson/engine/src/index.ts render video.html --no-audio
npx tsx .claude/skills/orson/engine/src/index.ts render video.html --parallel
npx tsx .claude/skills/orson/engine/src/index.ts render video.html --preview
npx tsx .claude/skills/orson/engine/src/index.ts render video.html --draft
npx tsx .claude/skills/orson/engine/src/index.ts demo demo-script.json
npx tsx .claude/skills/orson/engine/src/index.ts analyze-folder ./my-project
npx tsx .claude/skills/orson/engine/src/index.ts analyze-url https://example.com
npx tsx .claude/skills/orson/engine/src/index.ts formats
npx tsx .claude/skills/orson/engine/src/index.ts entrances
```

For full engine source code map, see `KNOWLEDGE.md`.

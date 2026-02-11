---
name: orson
description: "Programmatic video generation from design system + content. Creates HTML-based videos with CSS animations, rendered via Playwright + FFmpeg. Use when creating product videos, social media promos, explainers, or any video content. Triggers on 'video', 'render', 'animation', 'promo video', 'social media video'. Integrates with Seurat for design and Ghostwriter for copy."
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

Programmatic video generation from design system + content. Generates purpose-built HTML pages with CSS animations, captures frame-by-frame via Web Animations API, and encodes to video with FFmpeg.

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

# Check if audio library has tracks (generate placeholders if missing)
if [ ! -d "$ENGINE_DIR/audio/tracks" ] || [ -z "$(ls "$ENGINE_DIR/audio/tracks/"*.mp3 2>/dev/null)" ]; then
  bash "$ENGINE_DIR/audio/download-library.sh"
fi
```

The engine lives at `.claude/skills/orson/engine/`. All CLI commands use:
```
npx tsx .claude/skills/orson/engine/src/index.ts <command> [args]
```

**System requirement:** FFmpeg must be installed on the system (`ffmpeg` in PATH).

---

## Guided Flow (`/orson create`)

The workflow follows a filmmaking process: **Pre-production → Screenplay → Storyboard → Direction → Production**.

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

Ask where to save generated files:
- **Project folder** — e.g., `<project>/video/`
- **Current directory**
- **Custom path**

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

### PHASE 3: STORYBOARD

#### Step 3.1: Generate HTML

Build the content JSON from the approved screenplay:
```json
{
  "source": "manual",
  "projectName": "...",
  "description": "...",
  "features": ["feature 1 as string", "feature 2 as string", ...],
  "headings": ["scene 1 heading", "scene 2 heading", ...],
  "heroText": "hook headline",
  "ctaText": "CTA text",
  "techStack": [...],
  "colors": [...],
  "fonts": [],
  "images": [],
  "sections": [
    {"title": "scene title", "body": "scene body text"},
    ...
  ],
  "raw": {}
}
```

**CRITICAL:** The content JSON must contain ALL the scenes from the screenplay. If you wrote 8 scenes, the JSON must have enough features/sections/headings to generate 8 scenes.

Run autogen:
```bash
npx tsx .claude/skills/orson/engine/src/index.ts autogen <content.json> \
  --format=<format> \
  --mode=<mode> \
  --speed=<speed> \
  --intent=<intent> \
  --design-system=<path-to-tokens.css> \
  > <output-dir>/video-config.html
```

#### Step 3.2: Verify Storyboard

Parse the generated HTML to verify it matches the screenplay:
- Count scenes (look for `<!-- @scene name="..." -->` comments)
- Extract headings and text from each scene div
- Compare with approved screenplay

If autogen produced fewer scenes than the screenplay:
- The content JSON was insufficient
- Add more features/sections to match the screenplay
- Re-run autogen

Show the user the storyboard summary:
```
Generated 7 scenes (21.3s total):
  1. "Hook" (4.0s) — "What if 100 AI agents..."
  2. "The Problem" (4.0s) — "One task. One agent..."
  [...]
```

Ask: "Storyboard matches the screenplay. Ready to render?"

---

### PHASE 4: DIRECTION & PRODUCTION

#### Step 4.1: Render

The director (internal to autogen) has already assigned animations. Now render:

```bash
npx tsx .claude/skills/orson/engine/src/index.ts render <output-dir>/video-config.html
```

Report output path and stats when done.

---

## Audio System

Orson includes an integrated audio system for background music and narration. Audio is automatically added during `render` (use `--no-audio` to skip).

### How Audio Selection Works

1. **Mode filtering** — Video mode (safe/chaos/hybrid/cocomelon) determines allowed music styles via `coherence-matrix.json`
2. **Context matching** — Video context tags are matched against style definitions
3. **Energy matching** — Track energy level is matched to video energy
4. **Track processing** — Selected track is trimmed/looped to video duration, faded in/out
5. **Merge** — Processed audio is merged into the final MP4

### Narration (Optional)

TTS narration uses Edge-TTS (Microsoft Azure Neural voices). To enable:

1. Generate a narration brief (JSON) with text + timing per element
2. Run `narration_generator.py` to produce MP3 files
3. Use `audio-mixer.ts` to concatenate, duck music, and merge

```bash
pip install edge-tts
python .claude/skills/orson/engine/audio/narration_generator.py brief.json ./output/narration/
```

### Audio Library

Tracks live in `engine/audio/tracks/` and SFX in `engine/audio/sfx/`. The catalog is in `engine/audio/presets/audio-library.json`.

Run `engine/audio/download-library.sh` to bootstrap placeholder tracks. Replace with real CC0 audio from Pixabay, Mixkit, or similar.

### Audio Reference Files

- Coherence matrix (style→mode mapping): `engine/audio/presets/coherence-matrix.json`
- Voice presets: `engine/audio/presets/voices.json`
- Emphasis profiles: `engine/audio/presets/emphasis-profiles.json`
- Templates (6): `engine/audio/presets/templates/`
- TIR algorithm: `engine/audio/references/tir-algorithm.md`
- TTS narration: `engine/audio/references/tts-narration.md`
- Voiceover mode: `engine/audio/references/voiceover-mode.md`
- Feel profiles: `engine/audio/references/feel-profiles.md`
- Orchestration: `engine/audio/references/orchestration.md`

---

## How It Works

**Filmmaking workflow:**

| Phase | What happens | Who does it |
|-------|--------------|-------------|
| **Pre-production** | Analyze source, collect video params | Claude + user |
| **Screenplay** | Design scene structure, write copy | Claude + ghostwriter |
| **Storyboard** | Generate HTML, verify scenes | autogen |
| **Direction** | Assign animations, timing, easing | director.ts (internal) |
| **Production** | Render frame-by-frame | Playwright + FFmpeg |

**Technical flow:**
1. Claude reads 100% of source material, identifies key messages
2. Claude writes screenplay (scene structure + copy, optionally via ghostwriter)
3. Claude builds content JSON matching the screenplay
4. `autogen` generates HTML (calls director internally for animations)
5. Playwright captures frames via Web Animations API
6. FFmpeg encodes to MP4 (h264/h265/av1)

## Key Concepts

- **NOT a screen recorder** — generates original video content
- **HTML-based config** — self-contained HTML with embedded CSS animations and `<!-- @video ... -->` metadata
- **Web Animations API** — deterministic frame capture (NOT frozen clock — `page.clock.fastForward()` does not advance CSS animation time)
- **Content-driven timing** — duration computed from word count
- **Four modes**: safe (corporate), chaos (experimental), hybrid (safe + one breaker), cocomelon (neuro-hijack)
- **Design system integration** — reads tokens from seurat
- **Format-aware layout** — CSS Grid per scene, card-column fills frame in vertical, hero/centered/stacked modes
- **Source analysis** — can auto-extract content from project folders or URLs
- **132 animations**: 56 entrances, 30 exits, 26 transitions, 9 emphasis, 11 looping

## Demo Mode (`/orson demo`)

Record a live website demo with narration, zoom, cursor animation, and background music.

### Guided Flow

Use `AskUserQuestion` for each step.

#### Pre-production

1. **URL** — Ask for the website URL to demo
2. **Auth** — Does the site require login? If yes, collect auth steps (URL, selectors, credentials)
3. **Format** — `horizontal-16x9` (default for demos), or other
4. **Voice** — Select from `engine/audio/presets/voices.json` based on brand tone
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

### Demo Script Format

```json
{
  "url": "https://example.com",
  "format": "horizontal-16x9",
  "fps": 30,
  "codec": "h264",
  "voice": "en-US-AriaNeural",
  "lang": "en-US",
  "narrationStyle": "neutral",
  "music": { "enabled": true, "style": "auto", "volume": 0.3 },
  "subtitles": { "enabled": true, "style": "bottom" },
  "auth": [
    { "action": "navigate", "url": "https://example.com/login" },
    { "action": "fill", "selector": "#email", "value": "user@example.com" },
    { "action": "fill", "selector": "#password", "value": "password" },
    { "action": "click", "selector": "button[type=submit]" },
    { "action": "wait", "waitFor": ".dashboard" }
  ],
  "steps": [
    {
      "narration": "Welcome to Example App. Let me show you the dashboard.",
      "action": "none",
      "zoom": 1
    },
    {
      "narration": "Click the New Project button to create a project.",
      "action": "click",
      "selector": ".btn-new-project",
      "zoom": 1.5,
      "highlight": true
    },
    {
      "narration": "Type your project name here.",
      "action": "fill",
      "selector": "#project-name",
      "value": "My First Project",
      "zoom": 2,
      "highlight": true
    }
  ],
  "output": "./output/demo.mp4",
  "gapBetweenSteps": 800,
  "zoomTransitionMs": 400
}
```

### Demo Pipeline

1. Parse + validate script (Zod)
2. Generate narration brief → run `narration_generator.py` → MP3 files
3. Build narration-first timeline (zoom → narration → action)
4. Launch Playwright, execute auth, record frames with actions + zoom + cursor
5. Encode frames to video (FFmpeg)
6. Process audio: concatenate narration → select music → duck → mix → merge
7. Generate WebVTT subtitles

### Demo Reference

- Script parser: `engine/src/demo-script.ts`
- Timeline builder: `engine/src/demo-timeline.ts`
- Capture + orchestrator: `engine/src/demo-capture.ts`
- Director (zoom + cursor): `engine/src/demo-director.ts`
- Subtitles: `engine/src/demo-subtitles.ts`

---

## Running

```bash
# Guided creation (via Claude skill)
/orson create

# Demo recording (via Claude skill)
/orson demo

# Direct CLI (from project root)
npx tsx .claude/skills/orson/engine/src/index.ts render video-config.html
npx tsx .claude/skills/orson/engine/src/index.ts render video-config.html --no-audio
npx tsx .claude/skills/orson/engine/src/index.ts demo demo-script.json
npx tsx .claude/skills/orson/engine/src/index.ts analyze-folder ./my-project
npx tsx .claude/skills/orson/engine/src/index.ts analyze-url https://example.com
npx tsx .claude/skills/orson/engine/src/index.ts autogen content.json --format=horizontal-16x9 --mode=hybrid
npx tsx .claude/skills/orson/engine/src/index.ts formats
npx tsx .claude/skills/orson/engine/src/index.ts entrances
```

## Reference

- Engine source: `.claude/skills/orson/engine/src/` (28 files)
- Animation database: `.claude/skills/orson/engine/src/actions.ts`
- Choreography (animation selection & sequencing): `.claude/skills/orson/engine/src/choreography.ts`
- Composition (scene layout & visual structure): `.claude/skills/orson/engine/src/composition.ts`
- Director (high-level video orchestration): `.claude/skills/orson/engine/src/director.ts`
- HTML generation: `.claude/skills/orson/engine/src/html-generator.ts`
- HTML parsing: `.claude/skills/orson/engine/src/html-parser.ts`
- Scene templates: `.claude/skills/orson/engine/src/scene-templates.ts`
- Industry profiles: `.claude/skills/orson/engine/src/industry-profiles.ts`
- Layout profiles: `.claude/skills/orson/engine/src/layout-profiles.ts`
- UX bridge: `.claude/skills/orson/engine/src/ux-bridge.ts`
- Timeline: `.claude/skills/orson/engine/src/timeline.ts`
- Timing algorithm: `.claude/skills/orson/engine/src/timing.ts`
- Presets: `.claude/skills/orson/engine/src/presets.ts`
- Config schema: `.claude/skills/orson/engine/src/config.ts`
- Capture (Playwright frame capture): `.claude/skills/orson/engine/src/capture.ts`
- Encode (FFmpeg): `.claude/skills/orson/engine/src/encode.ts`
- Audio selector: `.claude/skills/orson/engine/src/audio-selector.ts`
- Audio mixer: `.claude/skills/orson/engine/src/audio-mixer.ts`
- Demo script parser: `.claude/skills/orson/engine/src/demo-script.ts`
- Demo timeline: `.claude/skills/orson/engine/src/demo-timeline.ts`
- Demo capture + orchestrator: `.claude/skills/orson/engine/src/demo-capture.ts`
- Demo director (zoom + cursor): `.claude/skills/orson/engine/src/demo-director.ts`
- Demo subtitles: `.claude/skills/orson/engine/src/demo-subtitles.ts`
- Narration generator (Python): `.claude/skills/orson/engine/audio/narration_generator.py`
- Folder analysis: `.claude/skills/orson/engine/src/analyze-folder.ts`
- URL analysis: `.claude/skills/orson/engine/src/analyze-url.ts`
- Config generation: `.claude/skills/orson/engine/src/autogen.ts`
- Copy brief (narrative planning): `.claude/skills/orson/engine/src/copy-brief.ts`
- Storyboard (text preview): `.claude/skills/orson/engine/src/storyboard.ts`
- Composition patterns doc: `.claude/skills/orson/engine/composition-patterns.md`

---

The director assigns animations based on content signals. For recipe details and mode-specific animation pools, read `references/director-recipes.md`.

---

## Preview Frame (Opus 4.6)

Before the full render, verify storyboard HTML visually:

1. Open the HTML config in the browser
2. Screenshot the first frame of each scene
3. Verify: layout integrity, typography rendering, color accuracy, animation key elements visible
4. Check text fits containers (no overflow or truncation)
5. If issues found, fix the HTML before proceeding to video render

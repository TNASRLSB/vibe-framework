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
3. **Camera motion** — Pick the recipe's default camera move. Wrap scene content in `<div class="cam" data-el="sN-cam">` with `overflow:hidden`.
4. **Kinetic typography** — Pick 1-2 hero scenes for kinetic text. Use the `S()` runtime helper to split text into word/character spans, then stagger A() calls.
5. **Secondary animation** — Add CSS `@keyframes` ambient motion per the recipe's recommendations (or none if recipe says so).
6. **Negative space** — Follow occupancy targets per scene type. Never exceed 60% fill.

Tell the user which recipe and arc you chose before writing HTML.

#### Step 3.1: Write the HTML

Create `<output-dir>/video.html`. Read `references/html-contract.md` for the full HTML format specification (comment syntax, scene structure, animation script, available easings/properties, format-specific CSS).

#### Step 3.2: Preview & Verify

Use the interactive preview to check the HTML before rendering:
```bash
npx tsx .claude/skills/orson/engine/src/index.ts render <output-dir>/video.html --preview
```

Verify:
- All scenes display correctly (no text overflow, no overlapping elements)
- Animations play smoothly (scrub through frames)
- Scene transitions look good (crossfades)
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

Orson includes an integrated audio system for background music and narration. Audio is automatically added during `render` (use `--no-audio` to skip).

### How Audio Selection Works

1. **Mode filtering** — Video mode (safe/chaos/hybrid/cocomelon) determines allowed music styles via `coherence-matrix.json`
2. **Context matching** — Video context tags are matched against style definitions
3. **Energy matching** — Track energy level is matched to video energy
4. **Track processing** — Selected track is trimmed/looped to video duration, faded in/out
5. **Merge** — Processed audio is merged into the final MP4

### TTS Engines

Narration uses a pluggable TTS engine architecture. Any provider can be added; Edge-TTS is the built-in fallback (free, no API key).

**Engine selection priority:**
1. `ttsEngine` field in demo script JSON
2. `ORSON_TTS_ENGINE` environment variable
3. Auto-detect: first available non-edge-tts engine
4. Fallback: `edge-tts`

| Engine | Prosody | Languages | API Key | Pip Package |
|--------|---------|-----------|---------|-------------|
| `edge-tts` (default) | Yes (rate, pitch) | 75+ incl. Italian | None | `edge-tts` |
| `elevenlabs` | Partial (speed, style) | 70+ incl. Italian | `ELEVENLABS_API_KEY` | `elevenlabs` |

To add a new TTS engine, read `references/tts-extension.md`.

### Narration Pipeline

1. Generate a narration brief (JSON) with text + timing per element
2. Run `narration_generator.py` — selects engine, produces MP3 files
3. Use `audio-mixer.ts` to concatenate, duck music, and merge

```bash
# Using default engine (edge-tts)
python .claude/skills/orson/engine/audio/narration_generator.py brief.json ./output/narration/

# List available voices for active engine
python .claude/skills/orson/engine/audio/narration_generator.py --list-voices

# List registered engines
python .claude/skills/orson/engine/audio/narration_generator.py --list-engines
```

### Audio Library

Tracks live in `engine/audio/tracks/` and SFX in `engine/audio/sfx/`. The catalog is in `engine/audio/presets/audio-library.json`.

Run `engine/audio/download-library.sh` to bootstrap placeholder tracks. Replace with real CC0 audio from Pixabay, Mixkit, or similar.

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

For demo script JSON format and field reference, read `references/demo-format.md`.

### Demo Pipeline

1. Parse + validate script (Zod)
2. Generate narration brief → run `narration_generator.py` → MP3 files (loudness normalized to -14 LUFS by audio-mixer.ts)
3. Build narration-first timeline (zoom → narration → action)
4. Launch Playwright, pre-flight selector validation, execute auth, record frames
5. Encode frames to video (FFmpeg)
6. Process audio: concatenate narration → select music → duck → mix → merge
7. Generate WebVTT subtitles

### Known Issues with Modern Frameworks

- Use `waitUntil: 'load'` (NOT `networkidle`) — frameworks with HMR/WebSocket (Next.js, Vite, Nuxt) keep connections open permanently, causing `networkidle` to timeout.
- Next.js dev overlay (`<nextjs-portal>`) intercepts pointer events. The engine removes it automatically before recording and after navigation.
- After SPA navigation (client-side routing), cursor/zoom overlays may be destroyed. The engine re-injects them automatically when URL changes.

### Pre-flight Checks

Before recording, the engine validates:
1. All selectors exist on the initial page (warning if not found — selectors for post-navigation pages are expected to be missing)
2. Python venv is available with edge-tts installed (auto-created if missing)
3. Music tracks are available (downloaded or silence placeholders)

### Authentication Patterns

Demo mode supports pre-authenticated sessions. Two approaches:

**1. Auth steps in script (username/password flows):**
Use the `auth` array in the demo script. Steps execute before recording starts.

**2. Pre-exported storageState (OAuth/SSO flows):**
For providers like Clerk, Auth0, Firebase with OAuth (Google, GitHub SSO), Playwright cannot handle third-party OAuth popups. Instead:
1. Log in manually in a browser
2. Export the session via Playwright's `storageState` API or browser dev tools
3. Pass the exported JSON via `storageState` field in the demo script

The engine loads `storageState` into the browser context before navigating to the demo URL.

### Demo Reference

- Script parser: `engine/src/demo-script.ts`
- Timeline builder: `engine/src/demo-timeline.ts`
- Capture + orchestrator: `engine/src/demo-capture.ts`
- Director (zoom + cursor + overlay removal): `engine/src/demo-director.ts`
- Subtitles: `engine/src/demo-subtitles.ts`
- Narration generator: `engine/audio/narration_generator.py`

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

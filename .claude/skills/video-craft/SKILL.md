# video-craft

Programmatic video generation from design system + content. Generates purpose-built HTML pages with CSS animations, captures frame-by-frame via Web Animations API, and encodes to video with FFmpeg.

## Commands

| Command | What it does |
|---------|-------------|
| `/video-craft create` | **Guided flow** — interactively create a video from a folder, URL, or manual input |
| `/video-craft render <file.html>` | Render video from HTML config |
| `/video-craft formats` | List format presets |
| `/video-craft entrances` | List all available entrances |

---

## Step 0: Setup (automatic)

Before running ANY command, ensure the engine is ready. Run this silently — do not ask the user.

```bash
ENGINE_DIR=".claude/skills/video-craft/engine"

# Check if node_modules exists
if [ ! -d "$ENGINE_DIR/node_modules" ]; then
  cd "$ENGINE_DIR" && npm install && npx playwright install chromium
fi
```

The engine lives at `.claude/skills/video-craft/engine/`. All CLI commands use:
```
npx tsx .claude/skills/video-craft/engine/src/index.ts <command> [args]
```

**System requirement:** FFmpeg must be installed on the system (`ffmpeg` in PATH).

---

## Guided Flow (`/video-craft create`)

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
npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-folder <path>
```

The JSON output is a starting point, but you MUST also read the original files (README, docs, etc.) to understand:
- What is the core value proposition?
- What are ALL the features (not just the first 3-4)?
- What problems does it solve?
- Who is the target audience?
- What makes it unique vs competitors?

Show the user a comprehensive summary and ask: "Does this capture everything important? Anything missing?"

#### Step 1.2: Design System

Check for existing ui-craft design system:
1. Look for `<project-folder>/.ui-craft/tokens.css`
2. **If found** → inform user: "Found existing design system — video will use your brand."
3. **If NOT found** → invoke `/ui-craft extract` to create one.

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

Ask the user: **"Do you want me to invoke `/seo-geo-copy` to optimize the video text?"**

- **Yes** → Invoke `/seo-geo-copy` with:
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
npx tsx .claude/skills/video-craft/engine/src/index.ts autogen <content.json> \
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
npx tsx .claude/skills/video-craft/engine/src/index.ts render <output-dir>/video-config.html
```

Report output path and stats when done.

---

## How It Works

**Filmmaking workflow:**

| Phase | What happens | Who does it |
|-------|--------------|-------------|
| **Pre-production** | Analyze source, collect video params | Claude + user |
| **Screenplay** | Design scene structure, write copy | Claude + seo-geo-copy |
| **Storyboard** | Generate HTML, verify scenes | autogen |
| **Direction** | Assign animations, timing, easing | director.ts (internal) |
| **Production** | Render frame-by-frame | Playwright + FFmpeg |

**Technical flow:**
1. Claude reads 100% of source material, identifies key messages
2. Claude writes screenplay (scene structure + copy, optionally via seo-geo-copy)
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
- **Design system integration** — reads tokens from ui-craft
- **Format-aware layout** — CSS Grid per scene, card-column fills frame in vertical, hero/centered/stacked modes
- **Source analysis** — can auto-extract content from project folders or URLs
- **131 animations**: 55 entrances, 30 exits, 26 transitions, 9 emphasis, 11 looping

## Running

```bash
# Guided creation (via Claude skill)
/video-craft create

# Direct CLI (from project root)
npx tsx .claude/skills/video-craft/engine/src/index.ts render video-config.html
npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-folder ./my-project
npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-url https://example.com
npx tsx .claude/skills/video-craft/engine/src/index.ts autogen content.json --format=horizontal-16x9 --mode=hybrid
npx tsx .claude/skills/video-craft/engine/src/index.ts formats
npx tsx .claude/skills/video-craft/engine/src/index.ts entrances
```

## Reference

- Engine source: `.claude/skills/video-craft/engine/src/` (23 files)
- Animation database: `.claude/skills/video-craft/engine/src/actions.ts`
- Choreography (animation selection & sequencing): `.claude/skills/video-craft/engine/src/choreography.ts`
- Composition (scene layout & visual structure): `.claude/skills/video-craft/engine/src/composition.ts`
- Director (high-level video orchestration): `.claude/skills/video-craft/engine/src/director.ts`
- HTML generation: `.claude/skills/video-craft/engine/src/html-generator.ts`
- HTML parsing: `.claude/skills/video-craft/engine/src/html-parser.ts`
- Scene templates: `.claude/skills/video-craft/engine/src/scene-templates.ts`
- Industry profiles: `.claude/skills/video-craft/engine/src/industry-profiles.ts`
- Layout profiles: `.claude/skills/video-craft/engine/src/layout-profiles.ts`
- UX bridge: `.claude/skills/video-craft/engine/src/ux-bridge.ts`
- Timeline: `.claude/skills/video-craft/engine/src/timeline.ts`
- Timing algorithm: `.claude/skills/video-craft/engine/src/timing.ts`
- Presets: `.claude/skills/video-craft/engine/src/presets.ts`
- Config schema: `.claude/skills/video-craft/engine/src/config.ts`
- Capture (Playwright frame capture): `.claude/skills/video-craft/engine/src/capture.ts`
- Encode (FFmpeg): `.claude/skills/video-craft/engine/src/encode.ts`
- Folder analysis: `.claude/skills/video-craft/engine/src/analyze-folder.ts`
- URL analysis: `.claude/skills/video-craft/engine/src/analyze-url.ts`
- Config generation: `.claude/skills/video-craft/engine/src/autogen.ts`
- Composition patterns doc: `.claude/skills/video-craft/engine/composition-patterns.md`

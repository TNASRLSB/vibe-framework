# video-craft

Programmatic video generation from design system + content. Generates purpose-built HTML pages with CSS animations, captures frame-by-frame via Web Animations API, and encodes to video with FFmpeg.

## Commands

| Command | What it does |
|---------|-------------|
| `/video-craft create` | **Guided flow** — interactively create a video from a folder, URL, or manual input |
| `/video-craft render <config.yaml>` | Render video from YAML config |
| `/video-craft storyboard <config.yaml>` | Generate text storyboard preview without rendering |
| `/video-craft validate <config.yaml>` | Check config for errors |
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

When the user runs `/video-craft create`, follow this interactive process step by step. Use `AskUserQuestion` for each step.

### Step 1: Source

Ask the user where the content comes from:

- **from-folder `<path>`** — Analyze a local project/site folder. The user provides a path. Run: `npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-folder <path>` to extract content. Read the JSON output.
- **from-url `<url>`** — Fetch and analyze a live URL. Run: `npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-url <url>`. Read the JSON output.
- **manual** — The user will describe the content in chat. Ask them: project name, description, key features (3-6), call to action text.

After analysis, show the user a brief summary of what was found:
- Project name
- Description
- Number of features/sections found
- Colors/fonts detected (if any)
- Images found (if any)

Ask: "Does this look right? Anything to add or change?"

### Step 1b: Design System

After analyzing the source, check for an existing ui-craft design system:

1. Look for `<project-folder>/.ui-craft/tokens.css` (or legacy `system.md`)
2. **If found** → read it, inform the user: "Found an existing design system — the video will use your brand colors, fonts, and tokens."
3. **If NOT found** → invoke `/ui-craft extract` on the project folder so ui-craft analyzes the project and creates a design system. Then inform the user: "Created a design system from your project — the video will match your brand."

The design system ensures the video is visually coherent with the project's brand identity (colors, typography, spacing). Pass `--design-system=` pointing to the `.ui-craft/` directory or directly to `tokens.css`.

### Step 2: Video Intent

Ask what the video is for:
- Product launch / feature showcase
- Social media promo (Instagram/TikTok/YouTube Shorts)
- Explainer / tutorial teaser
- Portfolio / case study
- Custom (user describes)

### Step 3: Format

Suggest a format based on intent (social → vertical-9x16, presentation → horizontal-16x9, generic → square-1x1), then let user confirm or change:
- `vertical-9x16` (1080x1920 — Instagram Reels, TikTok, YouTube Shorts)
- `vertical-4x5` (1080x1350 — Instagram feed)
- `horizontal-16x9` (1920x1080 — YouTube, presentations)
- `square-1x1` (1080x1080 — Instagram feed, Twitter)

### Step 4: Style

Ask mode preference:
- **safe** — Clean, corporate, professional animations
- **chaos** — Dynamic, experimental, random animation picks
- **hybrid** — Clean base with one surprise element per scene
- **cocomelon** — Hyper-engaging neuro-optimized mode. Uses pattern interrupts, dopamine micro-loops, high contrast, aggressive pacing, and arousal arc (arrest→escalate→climax→descend→convert). Best for ads, promos, social media hooks

### Step 5: Speed

Ask pacing:
- **slow** — More reading time, relaxed pace
- **normal** — Balanced
- **fast** — Punchy, social-optimized, quick cuts

### Step 6: Generate & Review

Generate the YAML config. **IMPORTANT: Do NOT copy-paste text from the source.** The extracted content is *context*, not copy.

**Before writing texts, invoke `/seo-geo-copy`** to apply persuasive copywriting principles. Use it to craft:
- Short, punchy phrases optimized for visual impact (not full sentences from a README)
- Headlines that work as video titles — clear value proposition, emotional hook
- CTAs that drive action for the specific video intent and platform
- Copy adapted to the target audience and video format

The source project/site content is never modified — the YAML is a separate document with its own copy.

Generate the YAML directly using your knowledge of the config schema, the extracted content, and seo-geo-copy principles (preferred — you write better copy than the algorithm). You can also use the CLI as a scaffold: save the extracted content JSON to a temp file, run `npx tsx .claude/skills/video-craft/engine/src/index.ts autogen <json> --format=<chosen-format> --mode=X --speed=X --intent=X --design-system=<path-to-tokens.css>`, then **rewrite all texts** applying seo-geo-copy.

**CRITICAL:** Always pass `--format=` with the exact format the user chose (e.g. `horizontal-16x9`). If omitted, the default is `vertical-9x16` and the video will be portrait. Also pass `--design-system=` pointing to the ui-craft `tokens.css` (or the `.ui-craft/` directory) if one exists. When writing YAML manually, ensure `video.format` matches the user's choice exactly.

**Show the full YAML to the user.** Explain each scene briefly. The user reviews and can adjust any text before rendering.

Ask: "Ready to render? Or want to adjust anything?"

### Step 7: Render

On approval:
1. Save the YAML config to a file (e.g., `video-config.yaml` in the project root or a location the user specifies)
2. Run: `npx tsx .claude/skills/video-craft/engine/src/index.ts render <config.yaml>`
3. Report the output path and stats when done.

---

## How It Works

1. Read YAML config defining scenes and content
2. Read design system tokens (optional ui-craft integration)
3. Compute timing from text word count + speed preset
4. Generate self-contained HTML with CSS @keyframes animations
5. Launch Playwright headless, pause all animations
6. For each frame: set `animation.currentTime` via Web Animations API, screenshot, pipe to FFmpeg
7. FFmpeg encodes to MP4 (h264/h265/av1)

## Key Concepts

- **NOT a screen recorder** — generates original video content
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
npx tsx .claude/skills/video-craft/engine/src/index.ts render config.yaml
npx tsx .claude/skills/video-craft/engine/src/index.ts storyboard config.yaml
npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-folder ./my-project
npx tsx .claude/skills/video-craft/engine/src/index.ts analyze-url https://example.com
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
- Storyboard: `.claude/skills/video-craft/engine/src/storyboard.ts`
- Folder analysis: `.claude/skills/video-craft/engine/src/analyze-folder.ts`
- URL analysis: `.claude/skills/video-craft/engine/src/analyze-url.ts`
- Config generation: `.claude/skills/video-craft/engine/src/autogen.ts`
- Composition patterns doc: `.claude/skills/video-craft/engine/composition-patterns.md`

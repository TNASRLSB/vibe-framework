# Orson — Knowledge Base

Domain knowledge and reference material for the Orson video skill. This file is for human readers — Claude does not load it during skill execution.

---

## How It Works

**Filmmaking workflow:**

| Phase | What happens | Who does it |
|-------|--------------|-------------|
| **Pre-production** | Analyze source, collect video params | Claude + user |
| **Screenplay** | Design scene structure, write copy | Claude + ghostwriter |
| **Storyboard** | Write HTML directly with CSS + animations | Claude |
| **Production** | Render frame-by-frame, add audio | Playwright + FFmpeg |

**Technical flow (v5):**
1. Claude reads 100% of source material, identifies key messages
2. Claude writes screenplay (scene structure + copy, optionally via ghostwriter)
3. Claude writes HTML directly — CSS layouts, animations, `__setFrame(n)` inline
4. Playwright calls `__setFrame(f)` for each frame, screenshots as PNG
5. FFmpeg encodes to MP4 (h264/h265/av1)
6. Audio system adds music + optional TTS narration

**Key concepts:**
- **NOT a screen recorder** — generates original video content
- **Claude writes HTML directly** — no intermediate JSON, no autogen heuristics
- **Static HTML + JS renderer** — HTML has layout only; inline JS handles all motion via `__setFrame(n)`
- **Lossless PNG pipeline** — every frame captured as PNG, zero compression artifacts
- **Format-aware CSS** — Claude adapts CSS to the target viewport (16:9, 9:16, 1:1, etc.)

---

## Engine Source Code Map

- Engine source: `.claude/skills/orson/engine/src/` (26 files)
- **Animation runtime** (v5 inline JS for videos): `engine/src/runtime.ts`
- Interpolation engine (core primitive): `engine/src/interpolate.ts`
- Animation database (property-based definitions): `engine/src/actions.ts`
- Decorative elements (CSS-only visual enrichment): `engine/src/decorative.ts`
- HTML parsing (@video/@scene comments → timing): `engine/src/html-parser.ts`
- Capture (Playwright frame capture): `engine/src/capture.ts`
- Encode (FFmpeg): `engine/src/encode.ts`
- Parallel frame rendering: `engine/src/parallel-render.ts`
- Timing algorithm: `engine/src/timing.ts`
- Presets (formats, codecs, speeds): `engine/src/presets.ts`
- UX bridge (seurat integration): `engine/src/ux-bridge.ts`
- Audio selector: `engine/src/audio-selector.ts`
- Audio mixer: `engine/src/audio-mixer.ts`
- Subtitles (SRT/VTT): `engine/src/subtitles.ts`
- Asset embedding (base64 data URIs): `engine/src/asset-embed.ts`
- Batch rendering: `engine/src/batch.ts`
- Icon library: `engine/src/icon-library.ts`
- Mockups (terminal/browser/phone): `engine/src/mockups.ts`
- Main entry point: `engine/src/index.ts`
- Folder analysis: `engine/src/analyze-folder.ts`
- URL analysis: `engine/src/analyze-url.ts`
- Demo script parser: `engine/src/demo-script.ts`
- Demo timeline: `engine/src/demo-timeline.ts`
- Demo capture + orchestrator: `engine/src/demo-capture.ts`
- Demo director (zoom + cursor): `engine/src/demo-director.ts`
- Demo subtitles: `engine/src/demo-subtitles.ts`
- Narration generator (Python): `engine/audio/narration_generator.py`

### Removed in v5

The autogen layer (v1-v4) was removed: `autogen.ts`, `director.ts`, `composition.ts`, `choreography.ts`, `layout-profiles.ts`, `html-generator.ts`, `frame-renderer.ts`, `timeline.ts`, `scene-templates.ts`, `storyboard.ts`, `copy-brief.ts`, `industry-profiles.ts`, `config.ts`. Claude writes HTML directly instead.

---

## Audio Reference Files

- Coherence matrix (style-to-mode mapping): `engine/audio/presets/coherence-matrix.json`
- Voice presets (legacy): `engine/audio/presets/voices.json`
- **Voice presets v5.2** (research-backed, 6 presets, locale support): `engine/audio/presets/voice-presets.json`
- Emphasis profiles: `engine/audio/presets/emphasis-profiles.json`
- Templates (6): `engine/audio/presets/templates/`
- TIR algorithm: `engine/audio/references/tir-algorithm.md`
- TTS narration: `engine/audio/references/tts-narration.md`
- Voiceover mode: `engine/audio/references/voiceover-mode.md`
- Feel profiles: `engine/audio/references/feel-profiles.md`
- Orchestration: `engine/audio/references/orchestration.md`
- Voice science research: `references/voce-narrante.md`

---

## Reference Files

- Visual recipes & aesthetic systems (24 recipes, color arcs, camera, kinetic typography, secondary animation, negative space): `references/visual-recipes.md`
- Component snippets (CSS patterns for video scenes): `references/components.md`
- Demo script format: `references/demo-format.md`
- TTS engine extension guide: `references/tts-extension.md`

---

## Demo Script Format

For the full demo script JSON format, field reference, and examples, see `references/demo-format.md`.

---

## TTS Engine Extension

For instructions on adding a new TTS engine provider, see `references/tts-extension.md`.

---

## Known Gotchas

### Opacity default for animated elements

The runtime resets all animated element properties each frame before applying animations. The opacity default is `_o = 1` (visible). This is intentional: camera wrappers (`s0-cam`, `s1-cam`, etc.) typically have scale/position animations but NO opacity animation. If the default were `_o = 0`, these wrappers would be invisible and hide all their children — causing a fully black video. Elements that need to fade in use explicit `A(sel, 'opacity', offset, dur, 0, 1, ease)` which overwrites the default correctly (applyAnim sets `_o = from = 0` before the animation starts).

**Rule:** Never change the `_o = 1` default in `runtime.ts`. If an element should start invisible, add an explicit opacity animation with `from=0`.

### FFmpeg amix normalize parameter

FFmpeg's `amix` filter defaults to normalizing audio by dividing volume by the number of inputs. With 3 inputs, each gets 1/3 volume — making everything too quiet. All `amix` calls in `audio-mixer.ts` use `normalize=0` to disable this behavior. Volume is controlled explicitly via the `volume` filter on each input.

**Rule:** Every `amix` usage MUST include `normalize=0`. Never remove it. If adding new amix calls, always include `:normalize=0`.

---

## v5.2 Changes (Voice Intelligence + Audio Robustness)

### Bug fixes
- **Single normalization pass**: Removed duplicate -16 LUFS normalization in `narration_generator.py`. Only `audio-mixer.ts` normalizes to -14 LUFS (YouTube/streaming standard).
- **Ducking consistency**: `calculate_ducking()` now uses configurable attack/release (default 300ms/500ms), matching `applyDucking()` fade durations.
- **FFmpeg timeout**: All FFmpeg spawns in `audio-mixer.ts` have a 120s timeout with SIGKILL on expiry.

### Error recovery
- **TTS retry**: `edge_tts_engine.py` retries 3 times with exponential backoff (1s, 2s, 4s) and 30s per-attempt timeout.
- **Demo capture resilience**: `recordDemo()` wraps `executeAction()` in try-catch — failed actions log warnings but don't crash recording. Overlay re-injection retries up to 2 times after navigation.
- **Director null safety**: `applyZoom()`, `resetZoom()`, `highlightElement()`, `animateCursor()` all wrapped in try-catch.

### Voice presets
- **6 research-backed presets**: `tech-demo`, `explainer`, `promo`, `tutorial`, `sales`, `onboarding` in `voice-presets.json`.
- **Locale support**: Italian locale overrides included; extensible to any locale.
- **Speech rate control**: `--wpm N` CLI flag for `narration_generator.py`. Converts WPM to Edge-TTS prosody rate (baseline: 160 WPM at 0%).
- **Integration**: Both `/orson create` (Step 1.5) and `/orson demo` (`voicePreset` field) support presets.
- **Priority**: Explicit `voice` field > preset > default.

### Subtitles
- Empty narration cues skipped.
- Word-wrap at 80 characters.
- Position support: `top`, `bottom` (default), `center`.

### Logging
- Structured prefixes: `[demo]`, `[tts]`, `[audio]`, `[capture]`.
- Final summary with step count, warning count, fallback count.

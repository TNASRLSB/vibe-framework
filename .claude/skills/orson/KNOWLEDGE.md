# Orson — Knowledge Base

Domain knowledge and reference material for the Orson video skill. This file is for human readers — Claude does not load it during skill execution.

---

## Engine Source Code Map

- Engine source: `.claude/skills/orson/engine/src/` (28 files)
- Interpolation engine (core primitive): `.claude/skills/orson/engine/src/interpolate.ts`
- Animation database (property-based definitions): `.claude/skills/orson/engine/src/actions.ts`
- Frame renderer generator (injected JS): `.claude/skills/orson/engine/src/frame-renderer.ts`
- Choreography (stagger, breathing, Disney principles): `.claude/skills/orson/engine/src/choreography.ts`
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

## Audio Reference Files

- Coherence matrix (style-to-mode mapping): `engine/audio/presets/coherence-matrix.json`
- Voice presets: `engine/audio/presets/voices.json`
- Emphasis profiles: `engine/audio/presets/emphasis-profiles.json`
- Templates (6): `engine/audio/presets/templates/`
- TIR algorithm: `engine/audio/references/tir-algorithm.md`
- TTS narration: `engine/audio/references/tts-narration.md`
- Voiceover mode: `engine/audio/references/voiceover-mode.md`
- Feel profiles: `engine/audio/references/feel-profiles.md`
- Orchestration: `engine/audio/references/orchestration.md`

---

## Demo Script Format

For the full demo script JSON format, field reference, and examples, see `references/demo-format.md`.

---

## TTS Engine Extension

For instructions on adding a new TTS engine provider, see `references/tts-extension.md`.

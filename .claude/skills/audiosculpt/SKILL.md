---
name: audiosculpt
description: "DEPRECATED — Audio functionality has been migrated to Orson. Use `/orson create` for video with audio, or `/orson demo` for demo recordings with narration. This skill is no longer active."
allowed-tools:
  - Read
---

# audiosculpt (DEPRECATED)

**This skill has been deprecated.** All audio functionality has been migrated to **Orson**.

## What moved where

| Old (audiosculpt) | New (orson) |
|-------------------|-------------|
| TTS Narration (`narration_generator.py`) | `orson/engine/audio/narration_generator.py` |
| Voice presets | `orson/engine/audio/presets/voices.json` |
| Emphasis profiles | `orson/engine/audio/presets/emphasis-profiles.json` |
| Coherence matrix (styles, SFX families, mode mapping) | `orson/engine/audio/presets/coherence-matrix.json` |
| Templates (6) | `orson/engine/audio/presets/templates/` |
| Reference docs (TIR, voiceover, TTS, feel profiles, orchestration) | `orson/engine/audio/references/` |

## What was removed

- **Strudel** — Replaced by curated audio library + FFmpeg processing
- **Text2Midi** (`generate.py`, `midi2events.py`) — GPU-heavy, removed
- **Strudel presets** (20 soundtrack, 6 SFX, 3 voice-leading) — Musical metadata preserved in coherence-matrix.json
- **Strudel-specific references** (strudel-guide, preset-format, variation-system, audio-report)

## Use instead

```
/orson create    — Video with automatic background music
/orson demo      — Demo recording with narration + music + zoom
```

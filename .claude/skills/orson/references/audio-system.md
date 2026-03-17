# Audio System

Orson includes an integrated audio system for background music and narration. Audio is automatically added during `render` (use `--no-audio` to skip).

## How Audio Selection Works

1. **Mode filtering** — Video mode (safe/chaos/hybrid/cocomelon) determines allowed music styles via `coherence-matrix.json`
2. **Context matching** — Video context tags are matched against style definitions
3. **Energy matching** — Track energy level is matched to video energy
4. **Track processing** — Selected track is trimmed/looped to video duration, faded in/out
5. **Merge** — Processed audio is merged into the final MP4

## TTS Engines

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

## Narration Pipeline

1. Generate a narration brief (JSON) with text + timing per element
2. Run `narration_generator.py` — selects engine, produces MP3 files
3. Use `audio-mixer.ts` to concatenate, duck music, and merge

```bash
# Using default engine (edge-tts)
python .claude/skills/orson/engine/audio/narration_generator.py brief.json ./.orson/narration/

# List available voices for active engine
python .claude/skills/orson/engine/audio/narration_generator.py --list-voices

# List registered engines
python .claude/skills/orson/engine/audio/narration_generator.py --list-engines
```

## Audio Library

Tracks live in `engine/audio/tracks/` and SFX in `engine/audio/sfx/`. The catalog is in `engine/audio/presets/audio-library.json`.

Run `engine/audio/download-library.sh` to bootstrap placeholder tracks. Replace with real CC0 audio from Pixabay, Mixkit, or similar.

## Contextual SFX

Sound effects are automatically added based on video actions. Available SFX types: `ui-click`, `typing-loop`, `transition`, `scene-transition`, `success`.

**Demo mode:** SFX are auto-generated from actions (click → click sound, fill → typing loop, navigate → transition). Control via the `sfx` field in the demo script:

```json
{
  "sfx": {
    "enabled": true,
    "volume": 0.7,
    "autoFromActions": true
  }
}
```

Per-step override with `"sfx": "ui-click"` (explicit) or `"sfx": "none"` (silence).

**HTML video:** Add `sfx` attribute to `@scene` comments:
```html
<!-- @scene name="Demo" sfx="click@1500,typing@2000:3000,whoosh@5000" -->
```
Format: `type@startMs` or `type@startMs:durationMs`. Timestamps are relative to scene start.

SFX are mixed at gain 0.7 (below narration at 1.0) and go through the same -14 LUFS normalization.

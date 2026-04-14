# Orson Audio System Reference

## Architecture

The audio system has two layers:
1. **TypeScript** (`audio-mixer.ts`, `audio-selector.ts`) -- FFmpeg-based audio processing, track/SFX selection
2. **Python** (`narration_generator.py`, `engines/`) -- TTS generation via pluggable engine architecture

---

## TTS Engines

### Engine Base Class

All engines implement `TTSEngine` (in `engines/base.py`):
- `generate(text, voice, output_path, rate, pitch)` -- Generate speech MP3
- `list_voices()` -- List available voices
- `is_available()` -- Check if engine is installed and configured
- `supports_prosody` -- Whether engine supports rate/pitch parameters

### Edge-TTS (Free)

Microsoft's Edge browser TTS API. Free, no API key needed.

- **Prosody**: Yes (rate as `+/-N%`, pitch as `+/-NHz`)
- **Languages**: 50+ with multiple voices per language
- **Quality**: Good for prototyping and production
- **Install**: `pip install edge-tts` (auto-installed in venv)
- **Baseline WPM**: ~160 at rate 0%

WPM to rate conversion: `rate = ((targetWPM / 160) - 1) * 100`

### ElevenLabs (Paid)

High-quality multilingual TTS with voice cloning.

- **Prosody**: Via `voice_settings` (speed, stability, similarity_boost, style)
- **Languages**: 70+ including Italian
- **Quality**: Premium, natural-sounding
- **Setup**: Set `ELEVENLABS_API_KEY` environment variable
- **Model**: `eleven_multilingual_v2`
- **Default voice**: Rachel (21m00Tcm4TlvDq8ikWAM)

Style presets mapping:
| Style | Speed | Stability | Similarity | Style Param |
|-------|-------|-----------|------------|-------------|
| enthusiastic | 1.05 | 0.55 | 0.80 | 0.15 |
| neutral | 1.0 | 0.65 | 0.75 | 0.0 |
| calm | 0.95 | 0.75 | 0.70 | 0.0 |
| dramatic | 0.90 | 0.40 | 0.85 | 0.60 |

Voice ID resolution: accepts ElevenLabs voice ID, catalog name, or falls back to default for Edge-TTS format names.

If the SDK does not support the `speed` parameter, Orson falls back to FFmpeg `atempo` filter for speed adjustment.

### Engine Selection Priority

1. `tts_engine` field in narration brief JSON
2. `ORSON_TTS_ENGINE` environment variable
3. Auto-detect first available non-edge-tts engine
4. Fallback: edge-tts

---

## Voice Presets

Defined in `audio/presets/voice-presets.json`. Each preset specifies voice, style, WPM target, and prosody hints. Based on speech research (Rodero 2016, Murphy & Castel 2022).

| Preset | Voice | WPM | Style | Rationale |
|--------|-------|-----|-------|-----------|
| tech-demo | en-US-GuyNeural | 150 | neutral | Male mid-pitch for perceived competence |
| explainer | en-US-AriaNeural | 140 | neutral | Female for trustworthiness in explainer format |
| promo | en-US-AriaNeural | 160 | enthusiastic | Female enthusiastic for warmth + engagement |
| tutorial | en-US-GuyNeural | 130 | calm | Male calm for authority without intimidation |
| sales | en-US-GuyNeural | 150 | neutral | Male controlled pitch for sales |
| onboarding | en-US-AriaNeural | 130 | calm | Female calm for empathy, anxiety reduction |

### Locale Overrides

Italian voices (`it-IT`): DiegoNeural (male), ElsaNeural (female), IsabellaNeural (warm female).

### Speech Rate Guidelines

| Range | WPM | Use Case |
|-------|-----|----------|
| Slow | 120 | Dramatic, emotional, complex technical |
| Moderate | 140 | Explainer, tutorial, onboarding |
| Natural | 160 | Promo, social media, energetic |
| Fast | 180 | Ceiling -- comprehension drops beyond this |
| Max speed | 300 | 2x speed ceiling for retention |

---

## Music Selection

### Coherence Matrix

The matrix (`coherence-matrix.json`) maps video context to appropriate music:

**Mode to styles:**
- `safe` -> corporate, ambient, lo-fi
- `chaos` -> electronic, upbeat
- `hybrid` -> corporate, cinematic, electronic
- `cocomelon` -> upbeat, electronic (maximum SFX density)

**Style profiles:**

| Style | BPM Range | Energy | Contexts |
|-------|-----------|--------|----------|
| corporate | 80-100 | low-medium | SaaS, B2B, enterprise, fintech |
| cinematic | 60-90 | medium-high | product-launch, brand-story, trailer |
| electronic | 110-128 | medium-high | startup, tech, app, dev-tools |
| lo-fi | 70-85 | low | lifestyle, edu, blog, podcast |
| ambient | 60-80 | very-low | luxury, minimal, portfolio, wellness |
| upbeat | 120-140 | high | social-media, promo, gaming, retail |

### Selection Algorithm

1. Get allowed styles from `mode_mapping[mode].soundtrack_styles`
2. Score each style by context tag overlap (+10 per match)
3. Add energy compatibility bonus (+5 if video energy matches style range)
4. Sort by score descending, then priority ascending
5. Find first style with available tracks
6. Fallback: corporate (safe/hybrid), electronic (chaos), upbeat (cocomelon)

Within a style, the track closest in energy to the target is selected.

### Track Library

Tracks are cataloged in `audio-library.json` with metadata:
- `id`, `file`, `style`, `bpm`, `energy` (0-1), `durationMs`, `tags[]`, `loopable`

User must supply actual MP3 files in `audio/tracks/`. Run `bash audio/download-library.sh` to set up.

Track validation: files must exist and be > 10KB (filters out silence placeholders).

---

## SFX System

### Built-in SFX

| Type | File | Duration | Use |
|------|------|----------|-----|
| ui-click | sfx/click.mp3 | 80ms | Button clicks, interactions |
| transition | sfx/whoosh.mp3 | 300ms | Scene transitions, slides |
| typing-loop | sfx/typing.mp3 | 2000ms | Text input (loopable) |
| success | sfx/success.mp3 | 500ms | CTA, completion, logo reveal |
| scene-transition | sfx/transition.mp3 | 400ms | Between-scene transitions |

### SFX in Scene Metadata

Syntax: `sfx="type@startMs"` or `sfx="type@startMs:durationMs"` (for loopable SFX).

Multiple events: `sfx="click@1500,typing@2000:3000,whoosh@5000"`

### Fuzzy SFX Mapping

For demo mode, action types auto-map to SFX:
- `click` -> ui-click
- `fill` -> typing-loop (duration computed from text length)
- `navigate` -> scene-transition
- `scroll` -> transition (50% volume)

Additional mappings: `element-appear` -> ui-click, `cta-final` -> success, `logo-reveal` -> success, `card-flip` -> transition.

---

## Audio Processing Pipeline

All processing uses FFmpeg via the `ffmpeg()` helper in `audio-mixer.ts` (120s default timeout).

### Trim and Loop

`trimAndLoop(trackPath, targetDurationMs, outputPath, loopable)`

- Track longer than target: trim with 2s fade-out
- Track shorter and loopable: loop N times, trim to target, add 0.5s fade-in + 2s fade-out
- Track shorter and not loopable: use as-is with fade-out

### Ducking

`applyDucking(musicPath, events, normalGain, outputPath, fadeInSec, fadeOutSec)`

Smooth volume automation during narration:
- Default: duck to 0.12 gain, normal at 0.35 gain
- Fade-in to duck: 0.3s (ramp down before voice starts)
- Fade-out from duck: 0.5s (ramp up after voice ends)

Uses FFmpeg `volume` filter with `eval=frame` and `clip()` expressions for smooth linear ramps.

### Mixing

`mixTracks(tracks, outputPath)`

Mixes multiple audio tracks with individual gain control. Uses FFmpeg `amix` filter with `normalize=0` (critical: without this, FFmpeg divides volume by input count).

### SFX Concatenation

`concatenateSfx(events, totalDurationMs, outputPath)`

Positions SFX at specific timestamps using `adelay` filter. Loopable SFX are extended via `stream_loop` and trimmed. Each event has individual gain and brief fade-out to avoid pops.

### Loudness Normalization

`normalizeLoudness(audioPath, outputPath, targetLUFS, truePeak)`

Target: -14 LUFS (YouTube/streaming standard), true peak -1.0 dBTP. Uses FFmpeg `loudnorm` filter.

### Final Merge

`mergeAudioVideo(videoPath, audioPath, outputPath)`

Combines video (copy codec) with audio (AAC 192kbps). Uses `-shortest` to match durations.

---

## Audio Style Templates

Pre-configured audio profiles in `audio/presets/templates/`:

| Template | Style | Target |
|----------|-------|--------|
| corporate_safe | Corporate/ambient | B2B, SaaS presentations |
| tech_promo | Electronic | Tech product launches |
| epic_trailer | Cinematic | Brand stories, product reveals |
| hype_social | Upbeat/electronic | Social media, short-form |
| chill_lifestyle | Lo-fi | Blog, lifestyle content |
| luxury_minimal | Ambient | Premium brands, minimal aesthetic |

---

## Emphasis Profiles

Defined in `emphasis-profiles.json`. Map element types to prosody adjustments:
- Headings: slightly slower rate, higher pitch
- Body text: normal rate
- CTAs: slightly faster, more emphasis
- Captions: quieter, faster

Applied per-element during TTS generation.

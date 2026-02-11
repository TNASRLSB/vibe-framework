---
name: audiosculpt
description: "Programmatic audio generation (soundtrack + SFX) using Strudel. Use when creating music, sound effects, audio for videos, or soundtracks. Triggers on 'audio', 'music', 'soundtrack', 'SFX', 'sound effects', 'Strudel'. Integrates with Orson for video audio."
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

# audiosculpt

Programmatic audio generation (soundtrack + SFX) for orson webvideos or standalone use. Uses **Strudel** (TidalCycles for JavaScript) for pattern-based live-coding audio synthesis. Output is always a self-contained `<script>` block.

## Commands

| Command | What it does |
|---------|-------------|
| `/audiosculpt create` | **Guided flow** — create audio for a webvideo or standalone |
| `/audiosculpt add-to-video <html>` | Inject audio into an existing orson webvideo |
| `/audiosculpt preview <style>` | Generate a standalone HTML page with 15s demo of a style |
| `/audiosculpt styles` | List all 20 available soundtrack styles with descriptions |
| `/audiosculpt create --template <id>` | Use a parametric template for quick generation |
| `/audiosculpt create --narration` | Enable TTS narration (orson integration) |
| `/audiosculpt add-narration <html>` | Add narration to existing HTML |

---

## Using Templates (Recommended for Video Promo)

Instead of choosing a musical style, select a **template** that matches your use case. Templates auto-configure arc strategy, impact intensity, and voiceover compatibility based on duration.

### Available Templates

| Template ID | Use Cases | Base Style | Durations |
|-------------|-----------|------------|-----------|
| `tech_promo` | SaaS, startup, app, AI demo | electronic | 15s/30s/60s |
| `epic_trailer` | Film, game, product launch | cinematic | 15s/30s/60s |
| `chill_lifestyle` | Wellness, travel, coffee, fashion | lo-fi | 30s/60s |
| `corporate_safe` | B2B, enterprise, fintech | corporate | 30s/60s |
| `hype_social` | Gaming, sports, energy, retail | trap | 15s/30s |
| `luxury_minimal` | Beauty, fashion, premium auto | neo-classical | 30s/60s |

### Template Parameters

Each template accepts:
- **duration** — 15s, 30s, or 60s (varies by template)
- **energy** — 0.3 to 1.0 (affects velocity, density, filter brightness)
- **voiceover** — true/false (enables voiceover mode automatically)

### Usage Examples

```bash
# Tech startup 30-second promo
/audiosculpt create --template tech_promo --duration 30s

# Epic game trailer with high energy
/audiosculpt create --template epic_trailer --duration 15s --energy 1.0

# Lifestyle video with voiceover support
/audiosculpt create --template chill_lifestyle --duration 60s --voiceover
```

Templates are stored in `.claude/skills/audiosculpt/presets/templates/`.

For voiceover mode details, read `references/voiceover-mode.md`.

For TTS narration system, read `references/tts-narration.md`.

---

## How It Works

```
Video HTML ──→ TIR (Timeline) + Feature Vector
                          ↓
                Style selection (algorithmic)
                          ↓
              ┌──────────────────────────┐
              │  Load preset patterns     │
              │  Build Strudel code       │
              │  - Soundtrack patterns    │
              │  - SFX layer from TIR     │
              │  - Phase transitions      │
              └──────────────────────────┘
                          ↓
              Inject <script> into HTML
```

Two audio layers, always separate:
- **Soundtrack** — Continuous music following an emotional arc
- **SFX** — Punctual sounds synced to visual events

The Strudel library is loaded via CDN: `https://unpkg.com/@strudel/web@1.0.3`

---

## Guided Flow (`/audiosculpt create`)

### Step 1: Source

Ask the user:
- **from-video `<path.html>`** — Analyze an existing orson webvideo.
- **standalone** — User describes: mood, duration, purpose.

If from-video: read the HTML file and **build the TIR** (see "Building the TIR" below).

### Step 2: Style Selection (algorithmic)

Read `.claude/skills/audiosculpt/presets/coherence-matrix.json`.

**If from-video:** extract feature vector from video, then match:

1. **Extract features from HTML:**

| Feature | How to calculate | Range |
|---------|-----------------|-------|
| `animDensity` | Count `.el` elements / total duration seconds | 0-5+ events/sec |
| `aggressiveness` | % of aggressive animations (glitch-in, slam-in, zoom-in, pop-in, bounce-in, spin-in, skew-in) out of total | 0-1.0 |
| `scenePace` | Average scene duration in seconds | 1-10s |
| `colorEnergy` | Parse `--bg` or body background → HSL Lightness. <30 = dark, 30-60 = medium, >60 = light | dark/medium/light |
| `transitionIntensity` | % of aggressive transitions (glitch, slam, wipe vs fade, crossfade) | 0-1.0 |

2. **Derive arousal + valence:**

```
arousal = "high"   if aggressiveness > 0.5 OR animDensity > 3 OR scenePace < 3
arousal = "medium" if aggressiveness 0.2-0.5 AND scenePace 3-5
arousal = "low"    if aggressiveness < 0.2 AND scenePace > 5

valence = "dark"    if colorEnergy == "dark" AND aggressiveness > 0.4
valence = "bright"  if colorEnergy == "light" OR aggressiveness < 0.2
valence = "neutral" otherwise
```

3. **Select style:**
   - Filter styles by `mode_mapping` from coherence-matrix (chaos → [electronic, glitch, industrial, trap, dnb])
   - Among filtered, match `feature_profile.arousal` and `feature_profile.valence`
   - If multiple match, pick lowest `feature_profile.priority`

4. Present selection with reasoning. Let user confirm or override.

**If standalone:** suggest based on user's description, mapped to arousal/valence.

### Step 3: Customization

Ask:
- **Output type**: soundtrack-only / sfx-only / soundtrack+sfx (default)
- **Energy**: low / medium / high
- If output includes SFX, ask **SFX density**: full / transitions-only
- **Duration**: derived from video, or user-specified (default 15s for standalone)

### Arc Duration Rule

| Duration | Arc strategy |
|----------|-------------|
| ≤ 30s | **No arc.** Full intensity from bar 0. Use the climax patterns for all bars. Last 2 bars use resolve patterns. |
| 30s–60s | **Compressed arc.** 1 bar intro, 2 bars build, rest climax, last 2 bars resolve. |
| > 60s | **Full arc.** Use preset `arc` section as-is. |

### Impact Frame (0-3 seconds)

For social media promo videos, the audio must **hit immediately** — no gradual fade-ins. The Impact Frame is a 0-3 second phase that plays BEFORE the intro.

**When to enable:**
- Video is ≤ 30s (social promo)
- User explicitly requests "hook" or "immediate energy"
- Template has `impact_intensity > 0`

**Impact Frame structure:**

| Timing | Role | Elements |
|--------|------|----------|
| 0ms | `attention_grabber` | Sub hit + noise burst (full velocity) |
| 100ms | `genre_signifier` | Signature sound of the style |
| 500ms | `hook_motif` | Melodic cell or rhythmic hook |

**Impact Frame by family:**

| Family | Attention Grabber | Genre Signifier | Hook Motif |
|--------|-------------------|-----------------|------------|
| tonal | Piano chord stab | Orchestral swell | Melodic 4-note cell |
| modal | Pad swell | Reverb shimmer | Drone + single note |
| loop | 808 kick + sub | Synth riser | Arp pattern |
| experimental | Noise burst | Glitch texture | Rhythmic stutter |

### Step 4: Generation Plan

Show the user:
- **TIR** (abbreviated) — list of events with timestamps, so user can verify sync
- Style chosen + instruments + **why** (feature vector → arousal/valence → style)
- Emotional arc (intro → build → climax → resolve) with timestamp boundaries
- SFX mapping (which visual events get which sounds)
- BPM and key

Ask: "Ready to generate? Or adjust anything?"

### Step 5: Output

1. Read the preset from `.claude/skills/audiosculpt/presets/soundtrack/<style>.json`
2. Use `patterns` section for each arc phase (intro/build/climax/resolve)
3. Use `transitions` section for phase boundaries
4. Add SFX layer from TIR
5. Apply ducking

**In both cases:**
- Read the SFX family from `.claude/skills/audiosculpt/presets/sfx/<family>.json`
- If **from-video**: inject `<script>` block before `</body>`
- If **standalone**: generate complete HTML page with play button
- **Always generate an Audio Report** (see "Audio Report" section below)

For TIR building algorithm, read `references/tir-algorithm.md`.

For Strudel pattern system and preset reading, read `references/strudel-guide.md`.

---

## Audio Generation: SFX

SFX are generated as Strudel patterns synced to TIR events.

### SFX Timing Rules

- Sync within 50ms of visual event
- Apply ducking during SFX
- SFX duration: 100-500ms depending on event type

### SFX Pattern Generation

For each TIR event, schedule a one-shot Strudel pattern:

```javascript
// Schedule SFX at specific time
const sfxPatterns = tirEvents.map(e => {
  const sfxSound = getSFXForEvent(e.type, sfxPreset);
  return `s('${sfxSound.source}').struct('t').gain(${e.energy * sfxSound.gain})`;
});
```

---

## Strudel Code Structure

Always structure generated code as:

```html
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<script>
document.addEventListener('click', async () => {
  const { initStrudel, repl } = await import('https://unpkg.com/@strudel/web@1.0.3');
  await initStrudel();

  // Set tempo
  setcpm(BPM / 4);  // cycles per minute = BPM / 4 for 4/4

  // Phase patterns from preset
  const phases = {
    intro: `stack(
      ${preset.patterns.intro.rhythm},
      ${preset.patterns.intro.harmony},
      ${preset.patterns.intro.bass}
    )`,
    build: `stack(...)`,
    climax: `stack(...)`,
    resolve: `stack(...)`
  };

  // Timeline: schedule phase changes
  const timeline = [
    { time: 0, phase: 'intro' },
    { time: introEnd, phase: 'build' },
    { time: buildEnd, phase: 'climax' },
    { time: climaxEnd, phase: 'resolve' }
  ];

  // Start with intro
  let currentPattern = phases.intro;
  await repl({ code: currentPattern }).start();

  // Schedule phase transitions
  timeline.forEach((point, i) => {
    if (i > 0) {
      setTimeout(() => {
        hush();  // Stop current pattern
        repl({ code: phases[point.phase] }).start();
      }, point.time * 1000);
    }
  });

  // Schedule SFX from TIR
  tirEvents.forEach(event => {
    setTimeout(() => {
      repl({ code: getSFXPattern(event) }).play();
    }, event.timeMs);
  });

}, { once: true });
</script>
```

### Key Constraints

- **Strudel CDN**: `https://unpkg.com/@strudel/web@1.0.3` (pinned version)
- **No voice/vocals** — instrumental only
- **Browser autoplay**: Always wrap in user gesture handler
- **Tempo**: Use `setcpm(BPM / 4)` for cycles per minute (4 beats per cycle in 4/4)

---

## Stylistic Families

Every style belongs to a **family** that determines which compositional rules apply.

| Family | Styles | Harmonic system | Voice leading | Form type |
|--------|--------|----------------|---------------|-----------|
| **tonal** | jazz, orchestral, neo-classical, acoustic, cinematic, corporate, upbeat, world | Functional (T-SD-D), cadences required | Full counterpoint rules | `periodo_tematico` |
| **modal** | ambient, chillwave, lo-fi | Static fields, no cadences | No voice crossing | `processuale` |
| **loop** | dnb, trap, minimal-techno, synthwave, electronic | Ostinato, power chords | Parallel fifths OK | `drop_structure` |
| **experimental** | glitch, industrial, dramatic | Atonal, timbral, noise | Spacing only | `atematico` |

**Horror** is a hybrid: uses **modal** rules for dread sections and **experimental** for shock moments.

For preset format and structure, read `references/preset-format.md`.

For loop variation system, read `references/variation-system.md`.

For feel profiles (groove/swing), read `references/feel-profiles.md`.

For orchestration constraints and voice slot limits, read `references/orchestration.md`.

---

## Temporal Quantization

### Step 1: Bar count

```
msPerBar = (60000 / BPM) * 4
rawBars = totalMs / msPerBar
```

### Step 2: Quantization

```
deviation = |totalMs - round(rawBars) * msPerBar| / totalMs

If deviation < 2%     → exact_quantization
If totalMs < 30000    → tempo_stretch (±5% max)
Otherwise             → bar_adjust
```

### Ending behavior types

| Type | Families | Description |
|------|----------|-------------|
| `cadential_insert` | tonal | Formal cadence in last 2 bars |
| `fade_out` | modal | Volume ramp |
| `hard_cut` | loop | Hard cut on last beat |

---

## Ducking

When SFX play, reduce soundtrack volume:

```javascript
// In Strudel, use gain automation
const duckPattern = `stack(
  ${soundtrackPattern}.gain(0.15),  // ducked
  ${sfxPattern}
)`;

// Or schedule gain changes
setTimeout(() => {
  // Duck soundtrack by reducing gain
}, sfxTime);
```

Apply ducking to:
- All SFX in **cinematic**, **hyper**, **dark** families
- Scene transitions (always)
- CTA final (always)

---

## Integration with orson

### Parsing the webvideo HTML

**1. Global config** — HTML comment in `<head>`:
```html
<!-- @video format="vertical-9x16" fps="30" speed="normal" mode="safe" codec="h264" -->
```

**2. Scene metadata** — HTML comments before each scene div:
```html
<!-- @scene name="Hook" duration="3000ms" transition-out="crossfade" transition-duration="300ms" -->
```

**3. Element timing** — CSS `animation` property on `.el` elements

### Injection

Insert before `</body>`:
```html
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<script>
  // Generated Strudel code here
</script>
```

---

## Reference: Engine Scripts

The `engine/` directory contains Python scripts for alternative workflows.

### generate.py — Text2Midi Generator

**Purpose:** Generate MIDI files from text prompts using the HuggingFace Text2Midi model. This is an **alternative** to the primary Strudel-based workflow.

**When to use:** When you need actual MIDI files (for DAW import, external processing, or non-browser playback).

**Dependencies:** PyTorch, transformers, miditok, symusic, huggingface_hub

```bash
# Setup
bash .claude/skills/audiosculpt/engine/setup.sh

# Usage
python engine/generate.py --prompt "dark electronic, A minor, 122 BPM, 4/4" --output /tmp/soundtrack.mid
python engine/generate.py --prompt "..." --output out.mid --temperature 1.0 --max-length 1024
```

**Arguments:**
- `--prompt` — Text description of the music (style, key, BPM, time signature)
- `--output` — Output .mid file path
- `--temperature` — Sampling temperature (default: 1.0)
- `--max-length` — Max token length (default: 1024)

**Note:** Requires GPU (CUDA/MPS) for reasonable performance. CPU generation is slow.

### midi2events.py — MIDI to JSON Parser

**Purpose:** Convert MIDI files to JSON event arrays for Strudel scheduling.

**When to use:** Bridge between generate.py output and Strudel playback. Parses MIDI into timed events that can be scheduled in the browser.

```bash
# Print to stdout
python engine/midi2events.py input.mid

# Write to file
python engine/midi2events.py input.mid --output events.json
```

**Output format:**
```json
[
  {"time": 0.0, "track": 0, "channel": 0, "note": "C4", "duration": 0.5, "velocity": 80},
  {"time": 0.5, "track": 1, "channel": 1, "note": "A2", "duration": 1.0, "velocity": 64}
]
```

### Workflow: Text2Midi → Strudel

To use text2midi output in browser playback:

1. Generate MIDI: `python engine/generate.py --prompt "..." --output track.mid`
2. Convert to events: `python engine/midi2events.py track.mid --output events.json`
3. Schedule in Strudel: Read events.json and trigger notes at specified times

For audio report format, read `references/audio-report.md`.

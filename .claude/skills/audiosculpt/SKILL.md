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

---

## Voiceover Mode

When generating audio for videos with narration, enable **voiceover mode** to create a music bed that doesn't compete with speech.

### Frequency Architecture

```
┌─────────────────────────────────────────┐
│  SUB BED (20-200Hz)                     │
│  - Sub bass, kick low frequencies       │
│  - Gain: 0.8                            │
├─────────────────────────────────────────┤
│  ████████ VOICEOVER ZONE ████████       │
│  ████████ (200Hz - 4kHz) ████████       │
│  ████████ MUSIC MINIMAL  ████████       │
├─────────────────────────────────────────┤
│  AIR BED (4kHz-12kHz)                   │
│  - Hi-hats, shimmers, high pads         │
│  - Gain: 0.6                            │
├─────────────────────────────────────────┤
│  MID PUNCTUATION (sparse)               │
│  - Melody accents only (not sustained)  │
│  - Gain: 0.25                           │
│  - Max 2 events per bar                 │
└─────────────────────────────────────────┘
```

### When Voiceover Mode Activates

- Template parameter `voiceover: true`
- User explicitly requests voiceover support
- TTS narration is enabled

### Preset Schema

```json
"voiceover_mode": {
  "enabled": false,
  "layers": {
    "sub_bed": {
      "frequency_focus": "below_200hz",
      "instruments": ["sub_bass", "kick_sub"],
      "gain": 0.8,
      "filter": { "lpf": 200 }
    },
    "air_bed": {
      "frequency_focus": "above_4000hz",
      "instruments": ["hihat", "shimmers", "pad_high"],
      "gain": 0.6,
      "filter": { "hpf": 4000 }
    },
    "mid_punctuation": {
      "frequency_focus": "200hz_4000hz",
      "instruments": ["melody_stabs", "chord_hits"],
      "gain": 0.25,
      "sparse": true,
      "max_events_per_bar": 2
    }
  }
}
```

### Strudel Implementation

```javascript
// Normal mode
const normalPattern = `stack(
  ${bassPattern},
  ${padPattern},
  ${melodyPattern},
  ${drumsPattern}
)`;

// Voiceover mode - frequency-split layers
const voiceoverPattern = `stack(
  // Sub bed (below 200Hz)
  ${bassPattern}.lpf(200).gain(0.8),
  s('RolandTR808_bd').struct('t ~ ~ ~ t ~ ~ ~').lpf(100).gain(0.7),

  // Air bed (above 4kHz)
  s('RolandTR808_hh').struct('~ t ~ t ~ t ~ t').hpf(4000).gain(0.5),
  ${padPattern}.hpf(4000).gain(0.4),

  // Mid punctuation (sparse, quiet)
  ${melodyPattern}.struct('t ~ ~ ~ ~ ~ ~ ~').lpf(4000).hpf(200).gain(0.25)
)`;
```

---

## TTS Narration System

Generate voice narration synchronized with video animations using Edge-TTS (Microsoft Azure Neural voices).

### Requirements

```bash
pip install edge-tts
```

### Entry Points

**A. Video-Craft Integration** (`/audiosculpt create --narration`)
- YAML from orson contains structured text elements
- Narration brief generated automatically
- Voiceover mode enabled automatically

**B. Standalone** (`/audiosculpt add-narration <html>`)
- Parse existing HTML for `.el` text content
- Extract timing from CSS animation-delay
- Generate narration brief

### Recommended Voices

| Voice | Character | Use Cases |
|-------|-----------|-----------|
| `en-US-AriaNeural` | Professional, warm | Corporate, tech, explainer |
| `en-US-GuyNeural` | Energetic, confident | Sports, gaming, hype |
| `en-US-JennyNeural` | Friendly, casual | Lifestyle, wellness |
| `en-US-DavisNeural` | Deep, authoritative | Trailer, documentary |
| `en-GB-SoniaNeural` | Elegant, sophisticated | Luxury, fashion |

### Emphasis by Element Type

| Element | Rate | Pitch | Effect |
|---------|------|-------|--------|
| heading | -15% | +5Hz | Slower, prominent |
| text | +0% | +0Hz | Normal |
| button/CTA | -10% | +8Hz | Emphasized |

### Narration Brief Schema

```json
{
  "narration": {
    "enabled": true,
    "voice": "en-US-AriaNeural",
    "style": "enthusiastic",
    "scenes": [
      {
        "scene_index": 0,
        "elements": [
          {
            "id": "narr-s0-e0",
            "display_text": "THE FUTURE IS HERE",
            "narration_text": "The future is here!!",
            "element_type": "heading",
            "timing": { "appear_ms": 300 }
          }
        ]
      }
    ]
  }
}
```

### Text Transformations

| Original | Narration |
|----------|-----------|
| `50%` | "fifty percent" |
| `AI` | "A.I." |
| Headlines | Add `!!` suffix |
| CTA | Add `!!` suffix |

### Ducking

When narration plays, music volume ducks automatically:
- Normal: 0.5 gain
- During speech: 0.15 gain
- Attack: 50ms before speech
- Release: 200ms after speech

### Usage

```bash
# Generate narration from brief
python narration_generator.py narration_brief.json ./audio/narration/

# List available voices
python narration_generator.py --list-voices
```

### Fallback

If Edge-TTS unavailable, browser `speechSynthesis` API can be used (lower quality).

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

**Preset schema:**

```json
"impact_frame": {
  "enabled": true,
  "duration_ms": 3000,
  "layers": {
    "0ms": { "role": "attention_grabber", "elements": ["sub_hit", "kick"], "velocity": 1.0 },
    "100ms": { "role": "genre_signifier", "elements": ["signature_sound"], "velocity": 0.9 },
    "500ms": { "role": "hook_motif", "elements": ["melodic_cell"], "velocity": 0.85 }
  }
}
```

**Strudel implementation:**

```javascript
// Impact phase pattern (0-3s)
const impactPattern = `stack(
  s('RolandTR808_bd').struct('t').gain(1.0).room(0.3),
  s('white').struct('t').lpf(8000).gain(0.7).decay(0.5),
  note('${hookMotif}').s('${leadSound}').delay(0.5).gain(0.85)
)`;

// Timeline with impact
const phases = {
  impact: impactPattern,  // 0-3s
  intro: introPattern,    // 3s-...
  build: buildPattern,
  climax: climaxPattern,
  resolve: resolvePattern
};
```

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

---

## Building the TIR (Timeline Intermediate Representation)

The TIR is the **single source of truth** for all timing in audiosculpt. Build it before any audio generation.

### Algorithm

```
Input: HTML of the webvideo
Output: TIR — sorted array of timed events

1. PARSE <!-- @video ... --> comment in <head>
   → extract: mode, speed, format

2. PARSE all <!-- @scene ... --> comments
   → for each: extract name, durationMs, transitionOut, transitionDurationMs
   → compute startMs cumulatively:
     scenes[0].startMs = 0
     scenes[i].startMs = scenes[i-1].startMs + scenes[i-1].durationMs

3. COMPUTE total duration:
   totalMs = last scene startMs + last scene durationMs

4. FOR each scene div (id="s0", "s1", ... or "scene-0", "scene-1", ...):
   FOR each .el element inside:
     a. PARSE style="animation: <name> <duration> <easing> <delay> <fill>"
     b. CLASSIFY element type from CSS classes
     c. CLASSIFY animation energy (0.4-0.85)
     d. ADD event to TIR

5. ADD scene-transition events at each scene boundary

6. SORT TIR by timeMs ascending

7. MAP each event to arc phase:
   - 0% to 20% of totalMs → "intro"
   - 20% to 60% → "build"
   - 60% to 80% → "climax"
   - 80% to 100% → "resolve"
```

### TIR Output Format

```json
[
  {"timeMs": 300,   "type": "element-appear",    "energy": 0.85, "scene": 0, "anim": "glitch-in",  "phase": "intro"},
  {"timeMs": 1200,  "type": "text-typing",       "energy": 0.4,  "scene": 0, "anim": "fade-in",    "phase": "intro"},
  {"timeMs": 2500,  "type": "scene-transition",   "energy": 1.0,  "scene": 1, "anim": "glitch",     "phase": "intro"}
]
```

---

## Audio Generation: Soundtrack

### Strudel Pattern System

Strudel uses a pattern-based approach with mini-notation. Each preset contains patterns for each arc phase in the `patterns` object.

### Reading Preset Patterns

Each preset has a `patterns` field with Strudel code strings per arc phase:

```json
"patterns": {
  "intro": {
    "rhythm": "stack(s('jazz_ride').struct('t(7,16)').gain(sine.range(0.4,0.7)), s('pink').struct('~ ~ t ~ ~ ~ t ~').lpf(5000).hpf(2000).gain(0.3))",
    "harmony": "silent",
    "bass": "note('<bb1 c2 d2 f2>').s('triangle').lpf(800).room(0.15).gain(0.65).slow(4)"
  },
  "build": { ... },
  "climax": { ... },
  "resolve": { ... }
}
```

**How to use:** For each arc phase, read the pattern strings and combine them with `stack()`:

```javascript
const introPattern = `stack(
  ${preset.patterns.intro.rhythm},
  ${preset.patterns.intro.harmony !== 'silent' ? preset.patterns.intro.harmony : ''},
  ${preset.patterns.intro.bass !== 'silent' ? preset.patterns.intro.bass : ''}
)`;
```

### Strudel Mini-Notation Reference

| Syntax | Meaning | Example |
|--------|---------|---------|
| `t` | Trigger/hit | `s('bd').struct('t ~ ~ ~')` |
| `~` | Rest/silence | `~ ~ t ~` = hits on beat 3 |
| `<>` | Sequence alternation | `<c4 e4 g4>` = cycle through |
| `[]` | Grouping | `[c4 e4]` = subdivide |
| `*n` | Speed up n times | `t*4` = 4 hits |
| `/n` | Slow down n times | `t/2` = half speed |
| `(k,n)` | Euclidean rhythm | `(3,8)` = 3 hits over 8 steps |

### Strudel Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `s('name')` | Sound/sample | `s('bd')`, `s('RolandTR808_hh')` |
| `note('x')` | Note pitch | `note('c4')`, `note('<c4 e4 g4>')` |
| `chord('X')` | Chord | `chord('Am7')`, `chord('<Am C F G>')` |
| `.voicing()` | Auto voice | `chord('Am7').voicing()` |
| `.struct('pat')` | Rhythm structure | `.struct('t ~ t ~')` |
| `.gain(n)` | Volume 0-1 | `.gain(0.7)` |
| `.room(n)` | Reverb 0-1 | `.room(0.4)` |
| `.lpf(hz)` | Low-pass filter | `.lpf(800)` |
| `.hpf(hz)` | High-pass filter | `.hpf(2000)` |
| `.delay(n)` | Delay amount | `.delay(0.3)` |
| `.fm(n)` | FM modulation index | `.fm(1.5)` |
| `.fmh(n)` | FM harmonicity | `.fmh(0.25)` |
| `.slow(n)` | Stretch pattern | `.slow(4)` |
| `.fast(n)` | Speed up pattern | `.fast(2)` |
| `stack(a,b,c)` | Layer patterns | `stack(drums, bass, pad)` |
| `sine.range(a,b)` | LFO oscillation | `gain(sine.range(0.4,0.7))` |
| `perlin.range(a,b)` | Noise modulation | `gain(perlin.range(0.3,0.6))` |

### Available Sound Sources

**Oscillators:** `sine`, `sawtooth`, `square`, `triangle`

**Noise:** `white`, `pink`, `brown`

**Samples:** `piano`, `pluck`, `metal`, `timpani`

**Drum Banks:**
- `RolandTR808` — `bd`, `sd`, `hh`, `cp`, `oh`
- `RolandTR909` — `bd`, `sd`, `hh`, `cp`
- `RolandTR606` — `bd`, `sd`, `hh`
- Usage: `s('RolandTR808_bd')`, `s('RolandTR909_hh')`

**Jazz Drums:** `jazz_ride`, `brush`, `tabla`

### Transition Patterns

Each preset has a `transitions` field for section boundaries:

```json
"transitions": {
  "intro_to_build": {
    "type": "riser",
    "bars_before": 0.5,
    "strudel": "note('<bb1 c2 d2 f2>').s('triangle').lpf(sine.range(400,800)).room(0.15).gain(perlin.range(0.5,0.7))"
  },
  "build_to_climax": { ... },
  "climax_to_resolve": { ... }
}
```

Generate the transition by playing the `strudel` pattern for `bars_before` bars at the phase boundary.

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

## Presets

All presets live in `.claude/skills/audiosculpt/presets/`:

- `soundtrack/<style>.json` — 20 styles with Strudel patterns
- `sfx/<family>.json` — 6 families (sound definitions per visual event)
- `coherence-matrix.json` — Master mapping: mode → styles, style → SFX family

### Preset Structure

```json
{
  "style": "jazz",
  "description": "...",
  "family": "tonal",

  "temporal": {
    "bpm": 120,
    "range": [100, 140],
    "swing": 0.65,
    "timeSignature": [4, 4],
    "endingBehavior": { ... }
  },

  "key": "Bb",

  "sounds": {
    "piano": { "source": "piano", "room": 0.25, "gain": 0.7 },
    "bass": { "source": "triangle", "lpf": 800, "gain": 0.8 },
    "ride": { "source": "jazz_ride", "hpf": 4000, "gain": 0.5 }
  },

  "patterns": {
    "intro": { "rhythm": "...", "harmony": "...", "bass": "..." },
    "build": { ... },
    "climax": { ... },
    "resolve": { ... }
  },

  "master": { "compressor": true, "limiter": true },

  "progression": { "chords": [...], "scale": "...", "bars_per_chord": 1 },
  "harmonic_system": { "type": "...", "functions": {...} },
  "voiceLeading": { ... },
  "arc": { ... },
  "orchestration_limits": { ... },
  "form": { ... },
  "transitions": { ... }
}
```

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

---

## Voice Leading Rules

### Universal (all families)

- **No voice crossing**: No voice may cross above/below its adjacent voice
- **Max octave spacing**: Max one octave between adjacent voices
- **Stepwise motion**: Between chords, voices move by step where possible

### Family: tonal

- **Parallel fifths/octaves forbidden**
- **Contrary motion between extremes**
- **Dominant 7th preparation and resolution**

### Family: loop

- **Parallel fifths permitted** (power chords are idiomatic)
- Apply only: no voice crossing + max octave spacing

### Family: modal

- **No voice crossing** (for spatial clarity in reverb-heavy textures)
- No obligation for contrary motion

### Family: experimental

- **Spacing for spectral clarity only** — all other rules violable

---

## Preset Inheritance System

Create hybrid styles by extending existing presets with selective overrides. This avoids duplicating entire presets when only certain elements need to change.

### Schema

```json
{
  "style": "jazz-electronic",
  "extends": "jazz",

  "modifiers": ["electronic_drums", "synth_bass"],

  "override": {
    "sounds.bass.source": "sawtooth",
    "sounds.bass.lpf": 400,
    "sounds.kick": {
      "source": "bd",
      "bank": "RolandTR808",
      "gain": 0.85
    },
    "sounds.hihat": {
      "source": "hh",
      "bank": "RolandTR808",
      "hpf": 6000
    },
    "temporal.swing": 0.55,
    "patterns.climax.rhythm": "stack(s('RolandTR808_bd').struct('t ~ ~ ~ t ~ ~ ~'), s('RolandTR808_hh').struct('t t t t t t t t').gain(0.6))"
  },

  "keep_from_parent": [
    "harmonic_system",
    "progression",
    "voiceLeading",
    "form"
  ]
}
```

### Merge Logic

```javascript
function loadPreset(styleName) {
  const preset = readJSON(`presets/soundtrack/${styleName}.json`);

  if (preset.extends) {
    const parent = loadPreset(preset.extends);  // Recursive
    return deepMerge(parent, preset.override, {
      keep: preset.keep_from_parent
    });
  }

  return preset;
}
```

### Modifier Library

| Modifier | What it changes |
|----------|-----------------|
| `electronic_drums` | Replaces acoustic drums with TR-808/909 |
| `synth_bass` | Replaces acoustic bass with sawtooth/square |
| `vintage_tape` | Adds tape saturation, wow/flutter simulation |
| `modern_clean` | Removes room/reverb for dry sound |
| `dark_mode` | Lowers filters, more sub, reduced highs |
| `bright_mode` | Raises filters, more presence |

### Usage Example

To create "jazz with electronic drums":
1. Create `jazz-electronic.json` that extends `jazz`
2. Override only the drum sounds
3. Keep harmonic system and voice leading from parent

---

## Loop Variation System

Prevent monotony in looped audio by applying automatic variations at specified intervals.

### Schema

```json
{
  "loop_config": {
    "base_length_bars": 8,
    "seamless": true,
    "return_to_tonic": true,

    "variations": {
      "every_2_loops": {
        "action": "add_fill",
        "position": "bar_4",
        "pattern": "s('RolandTR808_sd').struct('~ ~ ~ t t t t t').gain(0.7)"
      },
      "every_4_loops": {
        "action": "transpose_melody",
        "semitones": 3
      },
      "every_8_loops": {
        "action": "swap_pattern",
        "target": "rhythm",
        "alternate_with": "rhythm_variation_b"
      }
    },

    "humanization": {
      "velocity_variance": 0.15,
      "timing_drift_ms": 10,
      "apply_to": ["melody", "hihat"]
    }
  }
}
```

### Variation Actions

| Action | Parameters | Effect |
|--------|------------|--------|
| `add_fill` | position, pattern | Insert drum fill at bar position |
| `transpose_melody` | semitones | Shift melody pitch |
| `swap_pattern` | target, alternate_with | Switch to alternate pattern |
| `filter_sweep` | from_hz, to_hz, duration | Apply filter automation |
| `drop_element` | target | Remove an instrument temporarily |
| `double_time` | target | Speed up specific element |

### Strudel Implementation

```javascript
// Native Strudel variation functions
note("<c4 e4 g4>")
  .every(2, x => x.add(
    s('RolandTR808_sd').struct('~ ~ ~ t t t t t').gain(0.7)
  ))
  .every(4, x => x.transpose(3))
  .every(8, x => x.fast(2))
  .sometimesBy(0.15, x => x.gain(rand.range(0.7, 1.0)))
```

### Humanization

Add subtle timing and velocity variations to mechanical-sounding loops:

```javascript
// Velocity variance
note("<c4 e4 g4>").gain(perlin.range(0.7, 1.0))

// Timing drift (swing variation)
s('RolandTR808_hh').struct('t t t t').nudge(perlin.range(-0.01, 0.01))
```

---

## Feel Profiles

Layer rhythmic "feel" on top of time signature. The time signature defines meter; the feel profile defines groove.

### Available Profiles

```json
{
  "feel_profiles": {
    "straight": {
      "swing": 0.5,
      "accent_pattern": [1, 0.5, 0.7, 0.5],
      "grid": 16,
      "description": "Even 16th notes, rock/pop feel"
    },
    "shuffle": {
      "swing": 0.62,
      "accent_pattern": [1, 0.3, 0.8, 0.3],
      "grid": 12,
      "description": "Triplet swing, blues/jazz feel"
    },
    "compound": {
      "swing": 0.5,
      "accent_pattern": [1, 0.4, 0.4, 1, 0.4, 0.4],
      "grid": 12,
      "grouping": [3, 3],
      "description": "6/8 or 12/8 feel, folk/Celtic"
    },
    "halftime": {
      "swing": 0.5,
      "accent_pattern": [1, 0.3, 0.5, 0.3, 0.9, 0.3, 0.5, 0.3],
      "grid": 16,
      "snare_on": [5],
      "description": "Snare on 3, trap/hip-hop feel"
    }
  }
}
```

### Profile Components

| Component | Description |
|-----------|-------------|
| `swing` | Ratio of long:short notes (0.5 = even, 0.67 = 2:1 triplet) |
| `accent_pattern` | Velocity multipliers per beat (1.0 = full, 0.5 = ghost) |
| `grid` | Subdivisions per bar (16 = 16th notes, 12 = triplets) |
| `grouping` | How subdivisions are grouped (for compound meters) |
| `snare_on` | Which beats get the snare (for drum patterns) |

### Strudel Implementation

```javascript
// Straight 16ths
s('RolandTR808_hh').struct('t t t t t t t t t t t t t t t t')
  .gain('<1 0.5 0.7 0.5 1 0.5 0.7 0.5>')

// Shuffle (swing)
s('RolandTR808_hh').struct('t(3,8)')  // Euclidean approximation
  .swing(0.62)

// Halftime feel
stack(
  s('RolandTR808_bd').struct('t ~ ~ ~ ~ ~ ~ ~'),  // Kick on 1
  s('RolandTR808_sd').struct('~ ~ ~ ~ t ~ ~ ~')   // Snare on 3
).gain('<1 0.3 0.5 0.3 0.9 0.3 0.5 0.3>')
```

### Style Defaults

| Style | Default Feel |
|-------|--------------|
| jazz | shuffle |
| trap | halftime |
| dnb | straight |
| orchestral | straight |
| lo-fi | shuffle |
| world | compound |

---

## Soft Orchestration Constraints

Spectral guidelines that issue warnings rather than errors. Rules can be violated for stylistic effect.

### Schema

```json
{
  "spectral_guidelines": {
    "sub_20_80hz": {
      "max_simultaneous": 1,
      "violation": "warn",
      "exceptions": ["dubstep", "trap"],
      "reason": "Multiple fundamentals cause mud"
    },
    "bass_80_250hz": {
      "max_simultaneous": 2,
      "min_interval": "P5",
      "violation": "warn",
      "reason": "Close intervals cause beating"
    },
    "mid_250_2000hz": {
      "max_simultaneous": 4,
      "violation": "auto_reduce_lowest_gain",
      "reason": "Crowded mids reduce clarity"
    },
    "high_2000_8000hz": {
      "max_simultaneous": 3,
      "violation": "warn",
      "reason": "Harshness from stacked highs"
    },
    "air_8000_20000hz": {
      "max_simultaneous": 2,
      "violation": "info",
      "reason": "Generally forgiving range"
    }
  }
}
```

### Violation Levels

| Level | Behavior |
|-------|----------|
| `info` | Log in audio report, no action |
| `warn` | Highlight in audio report, suggest fix |
| `auto_reduce_lowest_gain` | Automatically reduce quietest voice |
| `error` | Block generation (use sparingly) |

### Style Exceptions

Some styles intentionally violate constraints:

| Style | Allowed Violations |
|-------|-------------------|
| dubstep | Multiple sub elements |
| trap | Multiple sub elements, crowded bass |
| industrial | Crowded mids, harsh highs |
| ambient | Extended reverb overlap |

### Implementation

```javascript
function checkSpectralGuidelines(voices, style) {
  const guidelines = spectralGuidelines;
  const warnings = [];

  for (const [band, rule] of Object.entries(guidelines)) {
    const voicesInBand = voices.filter(v => inBand(v.frequency, band));

    if (voicesInBand.length > rule.max_simultaneous) {
      if (rule.exceptions?.includes(style)) continue;

      if (rule.violation === 'warn') {
        warnings.push({
          band,
          count: voicesInBand.length,
          max: rule.max_simultaneous,
          reason: rule.reason
        });
      } else if (rule.violation === 'auto_reduce_lowest_gain') {
        const quietest = voicesInBand.sort((a,b) => a.gain - b.gain)[0];
        quietest.gain *= 0.5;
      }
    }
  }

  return warnings;
}
```

### Audio Report Integration

When constraints are violated, the audio report shows:

```
⚠️ Spectral Warning: bass_80_250hz
   3 voices (max 2) — close intervals may cause beating
   Affected: bass, pad_low, kick_body
   Suggestion: Filter pad below 250Hz or reduce gain
```

---

## Functional Harmony

**Applies to: family tonal only.**

- Every chord must have a declared function: **T**, **SD**, **D**, or special label
- Every tonal progression must end with a formal cadence
- Non-diatonic chords must be annotated

### Harmonic system types

| Type | Families | Description |
|------|----------|-------------|
| `functional_tonal` | tonal | Functions (T/SD/D) + cadences |
| `modal_static` | modal | Static harmonic field |
| `timbral_vector` | loop | Filter sweeps, not chord changes |
| `atonal_cluster` | experimental | Noise bands, non-harmonic |

---

## Orchestration

### Register rules (all families)

- **Below 100Hz**: Max one fundamental per chord
- **Below C3**: Max 2 simultaneous notes
- **Above C5**: Max 3 simultaneous notes

### Voice slot limits per family

| Family | Max instruments | Rationale |
|--------|-----------------|-----------|
| tonal | 6 | Voice leading unmanageable beyond 6 |
| modal | 4 | Reverb space is protagonist |
| loop | 7 | Transients must cut through |
| experimental | 8 | Narrow-band noises stack better |

### Active voice slots per arc phase

Each preset declares `orchestration_limits`:

```json
"orchestration_limits": {
  "intro": { "max_simultaneous_voices": 3 },
  "build": { "max_simultaneous_voices": 4 },
  "climax": { "max_simultaneous_voices": 5 },
  "resolve": { "max_simultaneous_voices": 3 },
  "hard_limit": 6
}
```

---

## Form and Phrasing

### periodo_tematico (family: tonal)

- **Antecedent**: phrase ending on half cadence
- **Consequent**: phrase ending on authentic cadence
- **Development**: sequence, inversion, augmentation

### drop_structure (family: loop)

- Intro → build → drop → breakdown → drop
- Tension/release is rhythmic, not harmonic

### processuale (family: modal)

- Gradual timbral evolution
- "Phrase" = timbral gesture (filter opening)

### atematico (family: experimental)

- No thematic structure
- Organization by density/rarefaction

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

---

## Audio Report

Every time audiosculpt generates audio, produce a companion **HTML** report with:
- Visual score rendering (piano roll)
- **Live audio playback** with Strudel
- **Animated playhead** synchronized to visualization

**File naming:** `<output-name>-audio-report.html`

### Required CDN Includes

```html
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6.4.1/dist/abcjs-basic-min.js"></script>
```

### Layout Structure

Toggle buttons: **Score** | Instruments | SFX Events | Master Chain

### Playback Controls

```javascript
document.getElementById('playBtn').addEventListener('click', async () => {
  const { initStrudel, repl } = await import('https://unpkg.com/@strudel/web@1.0.3');
  await initStrudel();
  setcpm(BPM / 4);

  if (isPlaying) {
    hush();
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    return;
  }

  await repl({ code: currentPattern }).start();
  isPlaying = true;
  playBtn.textContent = '■ Stop';
  startPlayheadAnimation();
});
```

### Visualizations

1. **Piano Roll (SVG)** — X=time, Y=MIDI pitch, color per instrument
2. **Staff Notation (abcjs)** — Full score with all instruments stacked

### Info Tables

3. **Instruments** — Table: name, sound source, effects, gain
4. **SFX Events** — Full TIR event table
5. **Master Chain** — Signal flow: ducking → compressor → limiter

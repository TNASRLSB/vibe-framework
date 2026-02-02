# audiosculpt

Programmatic audio generation (soundtrack + SFX) for video-craft webvideos or standalone use. Two engines: **Text2midi** (AI-generated MIDI → Tone.js rendering) or **Tone.js synthesis** (fallback). Output is always a self-contained `<script>` block.

## Commands

| Command | What it does |
|---------|-------------|
| `/audiosculpt create` | **Guided flow** — create audio for a webvideo or standalone |
| `/audiosculpt add-to-video <html>` | Inject audio into an existing video-craft webvideo |
| `/audiosculpt preview <style>` | Generate a standalone HTML page with 15s demo of a style |
| `/audiosculpt styles` | List all 20 available soundtrack styles with descriptions |
| `/audiosculpt setup` | Install Text2midi engine (optional, requires Python + GPU) |

---

## How It Works

```
Video HTML ──→ TIR (Timeline) + Feature Vector
                          ↓
                Style selection (algorithmic)
                          ↓
              ┌──────────────────────────┐
              │  Text2midi installed?     │
              │  YES → generate MIDI      │
              │      → parse to events    │
              │      → render via Tone.js │
              │  NO  → Tone.js synthesis  │
              │      using preset patterns│
              └──────────────────────────┘
                          ↓
              SFX layer (always Tone.js, from TIR)
                          ↓
              Inject <script> into HTML
```

Two audio layers, always separate:
- **Soundtrack** — Continuous music following an emotional arc
- **SFX** — Punctual sounds synced to visual events (always Tone.js, never ML)

The Tone.js library is loaded via CDN: `https://unpkg.com/tone`

---

## Guided Flow (`/audiosculpt create`)

### Step 1: Source

Ask the user:
- **from-video `<path.html>`** — Analyze an existing video-craft webvideo.
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

The emotional arc (intro → build → climax → resolve) only makes sense for longer content. For short videos the soundtrack must hit full intensity from bar 1:

| Duration | Arc strategy |
|----------|-------------|
| ≤ 30s | **No arc.** Full intensity from bar 0. Use the climax grid for all bars. Last 2 bars use a sparse outro grid for ending feel. |
| 30s–60s | **Compressed arc.** 1 bar intro, 2 bars build, rest climax, last 2 bars resolve. |
| > 60s | **Full arc.** Use preset `arc` section as-is. |

### Step 4: Generation Plan

Show the user:
- **TIR** (abbreviated) — list of events with timestamps, so user can verify sync
- Style chosen + instruments + **why** (feature vector → arousal/valence → style)
- Emotional arc (intro → build → climax → resolve) with timestamp boundaries, or "full intensity / no arc" for ≤30s
- SFX mapping (which visual events get which sounds)
- BPM and key
- Engine: Text2midi or Tone.js fallback

Ask: "Ready to generate? Or adjust anything?"

### Step 5: Output

**If Text2midi is available:**
1. Build prompt from `text2midi_prompt` in coherence-matrix + video features
2. Run: `python engine/generate.py --prompt "..." --output /tmp/soundtrack.mid`
3. Run: `python engine/midi2events.py /tmp/soundtrack.mid`
4. Read the events JSON → generate Tone.js code that schedules each note event
5. Map MIDI tracks to instruments from the preset (track 0 → piano, track 1 → bass, etc.)
6. Add SFX layer from TIR
7. Apply ducking

**If Text2midi is NOT available (fallback):**
1. Read the preset from `.claude/skills/audiosculpt/presets/soundtrack/<style>.json`
2. Use `rhythmGrid` for drum patterns, `melodicPatterns` for arp/lead/bass, `voiceLeading` for chords
3. Generate Tone.js code following the preset patterns for each arc phase
4. Add SFX layer from TIR
5. Apply ducking

**In both cases:**
- Read the SFX family from `.claude/skills/audiosculpt/presets/sfx/<family>.json`
- If **from-video**: inject `<script>` block before `</body>`
- If **standalone**: generate complete HTML page with play button
- **Always generate an Audio Report** (see "Audio Report" section below)

---

## `/audiosculpt add-to-video <html>`

Shortcut for from-video flow:
1. Read the HTML file
2. Build TIR
3. Extract feature vector → select style algorithmically
4. Generate and inject audio code
5. Save the file

Always ask confirmation before saving.

---

## `/audiosculpt preview <style>`

Generate a standalone HTML page with:
- 15 seconds of the requested style
- Play/Stop button
- Style name and description displayed
- Simple waveform visualizer using `Tone.FFT`

The page should be self-contained (inline CSS, Tone.js from CDN).

---

## `/audiosculpt styles`

Read `coherence-matrix.json` and display a formatted table of all 20 styles with: name, typical contexts, BPM range, energy level, default SFX family, arousal/valence profile.

---

## `/audiosculpt setup`

Install the Text2midi engine for AI-generated MIDI:

```bash
cd .claude/skills/audiosculpt && bash engine/setup.sh
```

This installs PyTorch, Transformers, miditok, and downloads the Text2midi model (~500MB) from HuggingFace. Requires Python 3.10+ and a GPU (CUDA or MPS) for practical speed.

If setup fails or no GPU is available, the skill works fine with Tone.js synthesis only.

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
        The DELAY value is the absolute timestamp from document start
        (video-craft uses absolute delays, not scene-relative)
     b. VERIFY: delay should fall within [scene.startMs, scene.startMs + scene.durationMs]
     c. CLASSIFY element type from CSS classes:
        - contains "heading" or is large text → "element-appear"
        - contains "text" or is body text → "text-typing"
        - contains "card" → "card-flip"
        - contains "button" → "cta-final" (if last scene) or "element-appear"
        - contains "image" or "img" → "element-appear"
        - contains "number" or "counter" or "stat" with numeric content → "number-count"
        - contains "logo" → "logo-reveal"
        - contains "progress" or "bar" with width animation → "stat-progress"
     d. CLASSIFY animation energy:
        - fade-in, soft-reveal → 0.4 (low)
        - slide-up, slide-down, slide-left, slide-right, grow → 0.5 (low-medium)
        - bounce-in, elastic-in, flip-in, card-cascade → 0.7 (medium)
        - zoom-in, slam-in, glitch-in, pop-in, spin-in, skew-in → 0.85 (high)
     e. ADD event to TIR

5. ADD scene-transition events at each scene boundary (scene.startMs for scenes 1+)

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
  {"timeMs": 2500,  "type": "scene-transition",   "energy": 1.0,  "scene": 1, "anim": "glitch",     "phase": "intro"},
  {"timeMs": 2800,  "type": "element-appear",     "energy": 0.85, "scene": 1, "anim": "slam-in",    "phase": "build"},
  ...
]
```

**Show the TIR to the user** in Step 4 (Generation Plan) for verification.

---

## Audio Generation: Soundtrack

### Using Text2midi (primary engine)

When Text2midi is installed, the skill generates a MIDI file and renders it via Tone.js.

1. **Build prompt** using the `text2midi_prompt` from coherence-matrix:
   ```
   Template: "An energetic electronic instrumental track with {instruments}.
              Set in {key} with a {time_sig} time signature at {bpm} BPM.
              {energy_descriptor}. Duration: {duration} seconds. No vocals."

   Filled: "An energetic electronic instrumental track with synthesizer lead,
            arpeggiator, synth bass, pad, electronic drums. Set in A minor
            with a 4/4 time signature at 122 BPM. Aggressive and intense
            with heavy bass and fast arpeggios. Duration: 23 seconds. No vocals."
   ```

2. **Generate:** `python engine/generate.py --prompt "..." --output /tmp/soundtrack.mid`

3. **Parse:** `python engine/midi2events.py /tmp/soundtrack.mid`
   Output: JSON array of note events with time, track, note, duration, velocity

4. **Map tracks to instruments** from the preset:
   - Track 0 → first instrument in preset (typically piano or lead)
   - Track 1 → second instrument (typically bass)
   - Track 2+ → remaining instruments
   - Drum tracks (channel 10 in GM) → kick/snare/hihat from preset

5. **Generate Tone.js code** that creates instruments from preset configs and schedules each MIDI event

### Using Tone.js Synthesis (fallback)

When Text2midi is not available, use the preset patterns directly.

#### Reading Rhythm Grids

Each preset has a `rhythmGrid` field with step patterns per arc phase. The number of steps per bar depends on the time signature: `stepsPerBar = N * (16 / D)` (e.g. 4/4 → 16, 3/4 → 12, 6/8 → 12). Each step represents the smallest subdivision. Value = velocity (0 = silence). See "Time Signature Rules" section for full details.

```json
"rhythmGrid": {
  "build": {
    "kick":   [0.8,0,0,0, 0.8,0,0,0, 0.8,0,0,0, 0.8,0,0,0],
    "snare":  [0,0,0,0, 0.7,0,0,0, 0,0,0,0, 0.7,0,0,0],
    "hihat":  [0.5,0,0.3,0, 0.5,0,0.3,0, 0.5,0,0.3,0, 0.5,0,0.3,0]
  }
}
```

**How to use:** Read `stepsPerBar` from the time signature (see "Time Signature Rules"). For each bar in the current arc phase, loop through `stepsPerBar` steps. If velocity > 0, schedule a hit at `barStartTime + step * subdivision` with that velocity.

Repeat the pattern for each bar in the phase. To avoid monotony:
- Vary velocity ±10% randomly
- On the last bar before a phase change, use the `transitions` pattern instead

#### Timing Rules (MANDATORY)

**ALL note scheduling MUST follow these rules. No exceptions.**

1. **Quantized grid only.** Every note MUST land exactly on a grid position: `barStartTime + step * subdivision` where `subdivision = 60 / BPM / (16 / D)` and D is the time signature denominator. No fractional steps, no offsets, no jitter.
2. **NEVER randomize timing.** Do NOT apply Math.random(), humanize(), or any variance to note start times. Humanization applies ONLY to velocity values.
3. **NEVER use `setTimeout` or `setInterval`** for note scheduling. Use only `Tone.Transport.schedule()` or `Tone.Part`.
4. **One grid size per bar.** The grid has `stepsPerBar` steps (determined by time signature). Do not mix grids of different sizes. If a pattern needs coarser values (e.g. 8th notes in 4/4), place hits on even steps only (0,2,4,6...).
5. **No random note placement.** Do not use `Math.random()` to decide WHEN a note plays. Random values are allowed ONLY for velocity variation (±10%) and for selecting WHICH voicing variant to use.
6. **Preset is law.** Use the `rhythmGrid` arrays exactly as defined in the preset JSON. Do not invent new patterns. If a phase has no grid for an instrument, that instrument is silent in that phase.

```javascript
// CORRECT — grid-locked timing, velocity-only humanization
const [N, D] = preset.temporal.timeSignature;
const stepsPerBar = N * (16 / D);
const subdivision = 60 / BPM / (16 / D);

grid.forEach((vel, step) => {
  if (vel > 0) {
    const time = barStart + step * subdivision; // EXACT grid position
    const hVel = vel * (0.9 + Math.random() * 0.2); // ±10% velocity only
    Tone.Transport.schedule(t => instr.triggerAttackRelease(note, dur, t, hVel), time);
  }
});

// WRONG — timing humanization causes rhythmic chaos
const time = barStart + step * subdivision + (Math.random() - 0.5) * 0.02; // ❌ FORBIDDEN
const time = humanize(barStart + step * subdivision, 10); // ❌ FORBIDDEN
```

#### Reading Voice Leading Tables

Each preset has a `voiceLeading` field with concrete note arrays for each chord.

```json
"voiceLeading": {
  "Am": {
    "root":   ["A2", "E3", "A3", "C4", "E4"],
    "drop2":  ["A2", "C3", "A3", "E4"],
    "spread": ["A2", "E3", "C4", "A4"]
  }
}
```

**How to use:**
- `intro` phase → use `spread` voicing (open, atmospheric)
- `build` phase → use `drop2` voicing (balanced, moves well)
- `climax` phase → use `root` voicing (full, maximum density)
- `resolve` phase → use `spread`, then thin progressively (remove inner notes)

The `transitions` field specifies which voicing to use for each chord change and describes the voice motion (common tones, stepwise motion).

#### Reading Melodic Patterns

Each preset has a `melodicPatterns` field defining arp, lead, and bass behavior per phase.

**Arp pattern types:**
- `ascending` — play chord notes low→high, loop: 1-2-3-4-1-2-3-4
- `ascending_skip` — ascending but skip one note each cycle: 1-3-2-4-1-3-2-4
- `pendulum` — up and down: 1-2-3-4-3-2-1-2
- `descending` — play chord notes high→low, loop

**Bass pattern types:**
- `whole_notes` — one note per bar (root of chord)
- `root_fifth` — root on beats 1,3 + fifth on beats 2,4
- `syncopated` — rhythmic pattern specified in `rhythm` field

**Lead:** Usually `climax_only: true`. The `phrases` array contains concrete note sequences with rhythms. Transpose these to fit the current chord.

#### Transition Patterns

Each preset has a `transitions` field for section boundaries:

```json
"transitions": {
  "intro_to_build": {
    "type": "riser",
    "implementation": "Filter sweep 200Hz→4000Hz on pad over 1 bar + snare roll last 2 beats"
  },
  "build_to_climax": {
    "type": "drop",
    "implementation": "Full stop (200ms silence) → kick hit with all layers entering simultaneously"
  },
  "climax_to_resolve": {
    "type": "fadeout",
    "implementation": "Remove kick first, then snare, then bass. Only pad+arp remain."
  }
}
```

Generate the transition code exactly as described in `implementation`.

---

## Audio Generation: SFX

SFX are always generated with Tone.js, synced to the TIR events.

### SFX Timing Rules

- Sync within 50ms of visual event (cross-modal binding window is 100ms)
- Apply ducking: reduce soundtrack volume by 6-12dB during SFX, with 50ms attack and 200ms release
- SFX duration: 100-500ms depending on event type

### Psychoacoustic Principles

1. **Cross-modal binding**: SFX must match visual characteristics (high pitch → small/angular elements, low pitch → large/round elements)
2. **Entrainment**: Keep beat isochronous with micro-variations (swing, velocity changes) to prevent habituation
3. **Silence as tool**: 200ms silence after crescendo increases memorization; 500ms before climax maximizes impact
4. **Transients for attention**: Use sharp attacks at narrative turning points (scene transitions, reveals, CTA)
5. **Reward sounds**: Confirmation SFX use instant attack, harmonic body, exponential decay, 1-4kHz fundamental

### SFX Code Pattern

For each event in the TIR, read the matching sound from the SFX family preset and schedule it:

```javascript
// For each TIR event:
Tone.Transport.schedule((time) => {
  sfxSynth.triggerAttackRelease(sfxPreset.note, sfxPreset.duration, time,
    sfxPreset.velocity * event.energy);  // scale velocity by animation energy
  duck(time, 0.15);  // duck soundtrack during SFX
}, event.timeMs / 1000);
```

---

## Ducking

When SFX play, automatically reduce soundtrack volume to prevent masking:

```javascript
const duckGain = new Tone.Gain(1).toDestination();
soundtrack.connect(duckGain);

function duck(time, durationSec = 0.3) {
  duckGain.gain.setValueAtTime(1, time);
  duckGain.gain.linearRampToValueAtTime(0.15, time + 0.03);  // -16dB in 30ms
  duckGain.gain.linearRampToValueAtTime(1, time + durationSec + 0.3);  // recover in 300ms
}
```

Apply ducking to:
- All SFX in **cinematic**, **hyper**, **dark** families (prominent SFX — full ducking)
- **digital** family (moderate ducking — use gain 0.25 instead of 0.15)
- **organic** family (moderate ducking — use gain 0.25 instead of 0.15)
- Scene transitions (always, full ducking)
- CTA final (always, full ducking)
- Skip ducking for **clean** family at low velocity (too subtle to need it)

---

## Tone.js Code Structure

Always structure generated code as:

```javascript
// 1. Wait for user gesture (autoplay policy)
document.addEventListener('click', async () => {
  await Tone.start();

  // 2. Master chain (from preset master.effects)
  const compressor = new Tone.Compressor({...});
  const limiter = new Tone.Limiter({...});
  Tone.getDestination().chain(compressor, limiter);

  // 3. Ducking bus
  const duckGain = new Tone.Gain(1).toDestination();
  function duck(time, dur) { /* see Ducking section */ }

  // 4. Instruments + effects (from preset, connected to duckGain)
  const piano = new Tone.PolySynth(Tone.Synth, {/* from preset */});
  const pianoReverb = new Tone.Reverb({/* from preset */});
  piano.chain(pianoReverb, duckGain);

  // 5. Soundtrack: schedule note events
  // If from Text2midi: each MIDI event becomes a triggerAttackRelease
  // If from preset patterns: build from rhythmGrid + voiceLeading + melodicPatterns
  const part = new Tone.Part((time, note) => {
    piano.triggerAttackRelease(note.name, note.duration, time, note.velocity);
  }, [/* note events array */]);

  // 6. SFX: schedule from TIR
  Tone.Transport.schedule((time) => {
    sfx.triggerAttackRelease("C5", "8n", time, 0.6);
    duck(time, 0.15);
  }, eventTimeSec);

  // 7. Start
  Tone.Transport.bpm.value = /* from preset */;
  Tone.Transport.start();
}, { once: true });
```

### Key Constraints

- **Samples available** — use `Tone.Sampler` for all 31 sampled instruments (see `sample-map.json`), FMSynth fallback for offline. 45 FM patches in `synth-patches.json` (26 with `sampleSource` link, 19 synthesis-only)
- **No voice/vocals** — instrumental only
- **Tone.js CDN**: `https://unpkg.com/tone`
- **Browser autoplay**: Always wrap in user gesture handler
- **Duration**: Use Temporal Quantization algorithm (see section below) when from-video

---

## Presets

All presets live in `.claude/skills/audiosculpt/presets/`:

- `soundtrack/<style>.json` — 20 styles: instrument configs, effects, progression, tempo, **rhythmGrid**, **voiceLeading**, **melodicPatterns**, **transitions**
- `sfx/<family>.json` — 6 families (sound definitions per visual event)
- `coherence-matrix.json` — Master mapping: mode → styles, style → SFX family, **feature_profile** (arousal/valence), **text2midi_prompt**
- `sample-map.json` — 31 instruments: CDN sample URLs + note mappings for `Tone.Sampler`
- `synth-patches.json` — 45 FM synthesis patches: FMSynth/MonoSynth/PluckSynth params + effects (fallback for sampled instruments, primary for synth-only)

Read these files before generating any audio code. They contain tested Tone.js configurations and composition patterns.

---

## Stylistic Families

Every style belongs to a **family** that determines which compositional rules apply. Read `presets/soundtrack/_family-map.json` for the canonical mapping.

| Family | Styles | Harmonic system | Voice leading | Form type |
|--------|--------|----------------|---------------|-----------|
| **tonal** | jazz, orchestral, neo-classical, acoustic, cinematic, corporate, upbeat, world | Functional (T-SD-D), cadences required | Full counterpoint rules | `periodo_tematico` |
| **modal** | ambient, chillwave, lo-fi | Static fields, no cadences | No voice crossing, no oblique motion requirement | `processuale` |
| **loop** | dnb, trap, minimal-techno, synthwave, electronic | Ostinato, power chords, reduced harmony | Parallel fifths OK, spacing + crossing only | `drop_structure` |
| **experimental** | glitch, industrial, dramatic | Atonal, timbral, noise | Spacing only (spectral clarity) | `atematico` |

**Horror** is a hybrid: uses **modal** rules for sustained dread sections and **experimental** rules for shock/impact moments. The preset declares `"family": "hybrid"` with `"hybrid_families": ["modal", "experimental"]`.

**Rule:** Before applying any compositional rule from sections below (counterpoint, harmony, orchestration, form), check the style's family. Rules marked with a family tag apply only to that family. Universal rules apply to all.

---

## Samples — 2-Level Architecture (CDN → FMSynth)

Samples are served from a CDN (GitHub Pages branch `samples`) with FMSynth synthesis as automatic fallback. **31 instruments** have real samples available (see `presets/sample-map.json`); **19 instruments** are synthesis-only (see `presets/synth-patches.json`).

### Sources & Licenses

| Source | Instruments | License |
|--------|------------|---------|
| VCSL (Versilian Studios) | Piano Steinway, Piano Upright, Harpsichord, Pipe Organ, Harp, Vibraphone, Marimba, Xylophone, Glockenspiel, Tubular Bells, Timpani, Triangle, Tambourine, Clap | CC0 (Public Domain) |
| nbrosowsky/tonejs-instruments | Violin, Cello, Contrabass, Trumpet, Trombone, French Horn, Tuba, Flute, Clarinet, Bassoon, Saxophone, Guitar (acoustic/electric/nylon), Bass Electric, Harmonium | CC-BY 3.0 |
| Open Source Drumkit | Kick, Snare, Hi-hat, Crash, Ride, Toms, Rimshot | Public Domain |

### How it works

1. **Generated code** loads samples from CDN via `Tone.Sampler`
2. If CDN fails (offline, deleted), **falls back to FMSynth** using params from `synth-patches.json`
3. The mapping instrument → sample files lives in `presets/sample-map.json`
4. The mapping instrument → FMSynth fallback lives in `presets/synth-patches.json` (field `sampleSource` links to sample-map)

### CDN Base URL

```
https://<user>.github.io/CLAUDE_SKILLS/samples/{instrument}/{note}.ogg
```

### When to use Sampler vs Synth

- **Acoustic instruments** (piano, strings, brass, woodwinds, guitar, mallets, drums): **Always use Sampler** — look up `sample-map.json`
- **Synth instruments** (pads, leads, growl bass, slap bass): **Always use FMSynth** — no samples exist
- **Electronic drums**: **Use MembraneSynth/MetalSynth/NoiseSynth** — synthesis is appropriate for electronic styles
- **Acoustic drums**: **Use Sampler** from `drums` in sample-map.json

### Code pattern

```javascript
// Read from sample-map.json at generation time
const SAMPLE_CDN = "https://<user>.github.io/CLAUDE_SKILLS/samples/";

function loadInstrument(sampleMapEntry, synthPatch) {
  return new Promise((resolve) => {
    try {
      const sampler = new Tone.Sampler({
        urls: sampleMapEntry.urls,
        baseUrl: SAMPLE_CDN + sampleMapEntry.name + "/",
        onload: () => resolve(sampler),
        onerror: () => {
          console.warn(`Samples failed for ${sampleMapEntry.name}, using FMSynth`);
          resolve(buildFMSynth(synthPatch));
        }
      });
      // Timeout fallback (10s)
      setTimeout(() => resolve(buildFMSynth(synthPatch)), 10000);
    } catch (e) {
      resolve(buildFMSynth(synthPatch));
    }
  });
}

function buildFMSynth(patch) {
  // patch comes from synth-patches.json
  if (patch.synth === "MonoSynth") return new Tone.MonoSynth(patch.params);
  if (patch.synth.includes("PolySynth")) return new Tone.PolySynth(Tone.FMSynth, patch.params);
  return new Tone.FMSynth(patch.params);
}
```

**Important:** `Tone.Sampler` is already polyphonic — do NOT wrap it in PolySynth.

---

## Text2midi Engine

### Setup

Run `/audiosculpt setup` or manually:
```bash
cd .claude/skills/audiosculpt && bash engine/setup.sh
```

### Check availability

Before using Text2midi, the skill checks:
```bash
python -c "from huggingface_hub import hf_hub_download; import torch" 2>/dev/null
```
If this fails → use Tone.js fallback. No error message to user, just silently degrade.

### Generate MIDI

```bash
python engine/generate.py \
  --prompt "dark electronic instrumental, A minor, 122 BPM, 4/4, 23 seconds" \
  --output /tmp/audiosculpt_soundtrack.mid
```

### Parse MIDI to events

```bash
python engine/midi2events.py /tmp/audiosculpt_soundtrack.mid
```

Outputs JSON to stdout. Each event:
```json
{"time": 0.0, "track": 0, "channel": 0, "note": "C4", "duration": 0.5, "velocity": 80}
```

### Track-to-instrument mapping

Map MIDI tracks to preset instruments in order:
- Track 0 → first instrument in preset `instruments` object
- Track 1 → second instrument
- Track on channel 10 (drums) → kick/snare/hihat from preset
- Extra tracks beyond preset instruments → ignore

---

## Integration with video-craft

### Parsing the webvideo HTML

Video-craft webvideos are self-describing. Extract metadata from these sources:

**1. Global config** — HTML comment in `<head>`:
```html
<!-- @video format="vertical-9x16" fps="30" speed="normal" mode="safe" codec="h264" -->
```
Extract: `mode` (→ style selection), `speed` (→ tempo adjustment), `format`.

**2. Scene metadata** — HTML comments before each scene div:
```html
<!-- @scene name="Hook" duration="3000ms" transition-out="crossfade" transition-duration="300ms" -->
<div class="scene layout-centered" id="scene-0" data-bg-anim="vignette">
```
Extract: `name`, `duration` (ms), `transition-out`, `transition-duration`.

**3. Element timing** — CSS `animation` property on `.el` elements:
```html
<div class="el el-heading size-xl" style="animation: fade-in-up 500ms cubic-bezier(...) 200ms both;">
```
Parse: animation name, duration (ms), delay (ms). The delay is the **absolute** entrance time.

**4. Design tokens** — CSS custom properties in `:root`:
```css
--color-primary: #6366f1;
--color-bg: #0f0f0f;
```
Dark backgrounds → moodier styles; bright accents → higher energy.

### Injection

Insert before `</body>`:
```html
<script src="https://unpkg.com/tone"></script>
<script>
  // Generated audio code here
</script>
```

---

## Audio Report

Every time audiosculpt generates audio, produce a companion **HTML** report saved alongside the output. The report includes visual score rendering (piano roll + staff notation).

**File naming:** `<output-name>-audio-report.html` (e.g., `promo-v2-audio-report.html`)

### Visualizations

1. **Piano Roll (SVG)** — Custom SVG, X=time, Y=MIDI pitch, color per instrument. SFX as diamonds above a dashed separator. Include legend.
2. **Staff Notation / Partitura (abcjs)** — Use `https://cdn.jsdelivr.net/npm/abcjs@6.4.1/dist/abcjs-basic-min.js`. Render a **full score (partitura)** with ALL instruments stacked vertically, one staff per instrument, all aligned to the same timeline. This is a partitura in the classical sense: all parts visible simultaneously so the reader can see the full orchestration at a glance.
   - **Every pitched instrument** gets its own staff (treble or bass clef as appropriate)
   - **Percussion/noise instruments** (ride, brush, micro-perc, click) get a percussion staff or rhythm notation on a single-line staff
   - Use `%%staves` directive to group all staves into a single system
   - Include key signature, time signature, BPM marking
   - Show chord symbols above the top staff
   - Example for jazz: Piano (treble), Bass (bass clef), Ride (perc), Brush (perc) — 4 staves
   - Example for glitch: Glitch-lead (treble), Texture-pad (treble), Sub-bass (bass), Micro-perc (perc), Click (perc) — 5 staves

### Info Tables

3. **Instruments** — Table: name, synth type, volume (dB), effects chain, color
4. **SFX Events** — Full TIR event table: time, type, SFX sound
5. **Master Chain** — Signal flow: ducking → compressor → limiter, SFX bus config

### Design

- Dark background (#0a0a0f), monospace, glitch aesthetic
- Toggle buttons for each visualization
- Responsive, scrollable piano roll

---

## Sampled Instruments

When generating code for an acoustic instrument, **always check `presets/sample-map.json` first**. If the instrument has an entry, use `Tone.Sampler` with CDN + FMSynth fallback. If not, use `presets/synth-patches.json` directly.

### Instrument loading workflow

1. Read `sample-map.json` → find instrument entry
2. If found: generate `loadInstrument()` call (see code pattern in Samples section above)
3. If not found: generate FMSynth/MonoSynth from `synth-patches.json`
4. Apply effects from `synth-patches.json` regardless (Sampler benefits from reverb/chorus too)

### Coverage

- **31 sampled instruments** in `sample-map.json` (piano, strings, brass, woodwinds, guitars, bass, mallets, percussion, drums)
- **45 FM patches** in `synth-patches.json` (26 with `sampleSource` link, 19 synthesis-only)
- **Drums** use `Tone.Players` (multi-sample kit), not `Tone.Sampler` — see drum kit pattern below

### Drum kit pattern (for acoustic styles)

```javascript
const drums = new Tone.Players({
  urls: {
    kick: "kick.ogg", snare: "snare.ogg",
    "hihat-closed": "hihat-closed.ogg", "hihat-open": "hihat-open.ogg",
    crash: "crash.ogg", ride: "ride.ogg",
    "tom-high": "tom-high.ogg", "tom-mid": "tom-mid.ogg", "tom-low": "tom-low.ogg",
    rimshot: "rimshot.ogg"
  },
  baseUrl: SAMPLE_CDN + "drums/",
  onerror: () => { /* fall back to MembraneSynth/MetalSynth/NoiseSynth */ }
});
// Play: drums.player("kick").start();
```

### One-shot percussion pattern (triangle, tambourine, clap)

```javascript
const triangle = new Tone.Player({
  url: SAMPLE_CDN + "triangle/hit.ogg",
  onerror: () => { /* fall back to MetalSynth */ }
});
// Play: triangle.start();
```

---

## Gain Staging Guidelines

Follow these rules when generating Tone.js code to prevent distortion:

### Volume budget

Target peak: **-3dB** (limiter threshold). Use the dynamic gain formula in "Orchestration Density → Dynamic gain staging" below. Do not use fixed per-layer values.

### Master chain defaults

Most presets use: EQ3 → Compressor → Filter (lowpass 16kHz) → Limiter. Some presets (jazz, glitch, minimal-techno, neo-classical) omit EQ3.

```javascript
// Full chain (16/20 presets)
new Tone.EQ3({ low: 2, mid: 0, high: -2 })
new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.15 })
new Tone.Filter({ frequency: 16000, type: "lowpass", rolloff: -12 })
new Tone.Limiter(-3)

// Reduced chain (4/20 presets: jazz, glitch, minimal-techno, neo-classical)
new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.15 })
new Tone.Filter({ frequency: 16000, type: "lowpass", rolloff: -12 })
new Tone.Limiter(-3)
```

### SFX routing

SFX bus must use a **separate compressor** from the soundtrack bus:
```javascript
const sfxComp = new Tone.Compressor({ threshold: -14, ratio: 2.5 });
sfxBus.chain(sfxComp, masterLimiter, Tone.getDestination());
```

### BitCrusher safe values

| bits | Sound | Use for |
|------|-------|---------|
| 3-4 | Extreme, unusable in dense mixes | Avoid in presets |
| 6 | Audible lo-fi, still musical | Glitch lead, percussion |
| 8 | Subtle texture | Pads, ambient |
| 12+ | Nearly transparent | Background elements |

### Delay feedback limits

| Context | Max feedback |
|---------|-------------|
| Dense 16th-note patterns | 0.3 |
| Sparse patterns (quarter notes) | 0.5 |
| Solo instrument / FX tail | 0.6 |

Never stack BitCrusher + Distortion + high-feedback Delay on the same instrument.

### Ducking

When SFX fires, duck the soundtrack bus:

```javascript
duckGain.gain.linearRampToValueAtTime(0.15, time + 0.03);  // -16dB in 30ms
duckGain.gain.linearRampToValueAtTime(1, time + 0.33);     // recover in 300ms
```

Key SFX (scene transitions, CTA) should be louder than ambient SFX (keystrokes):
- scene-transition stinger: -12 dB
- CTA stinger: -10 dB
- element-appear blip: -14 dB
- keystroke, noise: -16 to -18 dB

### Soundtrack Accent Sync

Schedule extra **accent hits** on the soundtrack bus that align with key visual events (scene transitions, CTA). This ties the rhythm to the video timeline:

```javascript
// On scene-transition and cta-final events:
const barIdx = Math.floor(eventTime / barDur);
subBass.triggerAttackRelease(subBassNotes[barIdx], "8n", time, 0.7);
clickSynth.triggerAttackRelease("32n", time, 0.6);
```

This creates a "punch" in the soundtrack that coincides with visual impacts.

### Arrangement Rules (Voice Leading & Rhythm)

These rules prevent common problems visible on a piano roll and audible in playback. Rules are tagged by family applicability.

#### Voice leading — Universal (all families)

- **No voice crossing**: No voice may cross above/below its adjacent voice at any point.
- **Max octave spacing**: Max one octave between adjacent voices (when polyphonic).
- **Tight register**: All chord voicings for a piece must stay within a ~2 octave band. Never jump between spread/drop2/root voicings that shift the entire register.
- **Stepwise motion**: Between consecutive chords, each voice should move by half-step or whole-step where possible. Common tones stay put.
- **Repetition for stability**: Repeating the same chord for 2 bars before moving creates a visual "plateau" — more readable and grounded than chord-per-bar changes.

#### Voice leading — Family: tonal

- **Parallel fifths/octaves forbidden**: No pair of voices may move in parallel motion forming consecutive P5 or P8.
- **Contrary motion between extremes**: When the top voice leaps (interval > 2nd), the bottom voice must move in contrary or oblique motion.
- **Dominant 7th preparation**: The 7th of V7 must be prepared (common tone) or approached by step, and resolved down by step.
  - **Jazz exception**: In bebop/hard-bop contexts, the 7th may enter as part of a shell voicing without classical preparation.
- **Parallel motion check**: Each transition in `voiceLeading.transitions` must declare which voice pairs move in parallel and whether the resulting interval is licit.

#### Voice leading — Family: loop

- **Parallel fifths permitted** (power chords, riffs, ostinati are idiomatic).
- **Dominant 7th preparation**: Not applicable.
- Apply only: no voice crossing + max octave spacing.

#### Voice leading — Family: modal

- **No voice crossing** (for spatial clarity in reverb-heavy textures).
- No obligation for contrary motion (voices move by harmonic fields, not function).

#### Voice leading — Family: experimental

- **Spacing for spectral clarity only** — all other rules violable as explicit stylistic choice.

#### Bass line

- **Stepwise only**: Sub-bass notes between consecutive bars must move by half-step or whole-step maximum. No tritone leaps, no octave jumps.
- **Follow the root**: Bass note = root of the current chord. If chord repeats, bass repeats.

#### Melodic lead

- **Minimum 1 octave range**: Lead phrases must span at least an octave to create visible melodic contour on a piano roll. A 3-semitone range reads as a flat line.
- **Alternate phrase shapes**: Use at least 2 contrasting phrases (e.g., descending arc + ascending arc) that alternate per bar.

#### Rhythm grids

- **Grid-locked timing**: ALL hits MUST land on exact 16th-note positions. See "Timing Rules (MANDATORY)" section above. Zero tolerance for timing randomization.
- **Use preset grids**: Always use the `rhythmGrid` arrays from the preset JSON. Do not invent patterns. Alternate between the preset's phase-specific grids (intro/build/climax/resolve).
- **No identical bars**: Create at least 2 complementary grids (gridA/gridB) that alternate, so consecutive bars have different hit patterns. Derive gridB by shifting velocities or swapping accents, not by inventing new patterns.
- **Breathing room**: Percussion grids should fill at most ~60% of `stepsPerBar` slots. Wall-to-wall hits create a flat block with no rhythmic identity.
- **Complementary placement**: If gridA has hits on beats 1,3,7,9, gridB should favor beats 2,4,8,10 — creating a call-and-response feel across bar pairs.

---

## Functional Harmony

**Applies to: family tonal only.** Other families use different harmonic systems (see below).

### Rules (family tonal)

- Every chord in a progression must have a declared function: **T** (tonic), **SD** (subdominant), **D** (dominant), or a special label (V/V, borrowed chord, etc.)
- Every tonal progression must end with a formal cadence: **authentic** (V→I), **plagal** (IV→I), **half** (→V), or **deceptive** (V→vi)
- Non-diatonic chords must be annotated with their origin (secondary dominant, modal borrowing, tritone substitution, etc.)

### Harmonic system types (preset field `harmonic_system`)

| Type | Families | Description |
|------|----------|-------------|
| `functional_tonal` | tonal | Functions (T/SD/D) + cadences required |
| `modal_static` | modal | Pad without cadences, static harmonic field |
| `timbral_vector` | loop | Filter opens/closes — not chord changes |
| `atonal_cluster` | experimental | Noise bands, non-harmonic timbres |

### Preset format

```json
"harmonic_system": {
  "type": "functional_tonal",
  "functions": { "IImaj7": "SD", "V7": "D", "Imaj7": "T" },
  "cadences": { "bar_4": "half", "bar_8": "authentic" }
}
```

For non-tonal families:
```json
"harmonic_system": {
  "type": "modal_static",
  "field": "Dorian on D",
  "cadences": "none"
}
```

---

## Orchestration

**Applies to: all families (universal).**

### Register rules

- Every instrument must have a declared effective range; notes outside range are forbidden.
- **Below 100Hz**: Max one fundamental per chord (avoid mud).
- **Below C3**: Max 2 simultaneous notes, minimum 5th distance between fundamentals.
- **Above C5**: Max 3 simultaneous notes.
- Do not overlap fundamentals of different chords in nearby octaves below 200Hz.
- If 2+ instruments play below 80Hz: minimum 7 semitones apart to avoid excessive beating.

### Preset format — instrument range

For acoustic/sampled instruments:
```json
"piano": {
  "range": ["A1", "C7"],
  "optimal_range": ["F2", "C6"],
  "below_c3": "avoid dense chords, max root+5th",
  "above_c5": "max 3 notes, use for melody"
}
```

For electronic instruments (loop/experimental families):
```json
"sub_bass": {
  "range": ["E1", "G2"],
  "fundamental_max_hz": 100,
  "overlap_rule": "If 2 instruments below 80Hz, min 7 semitones apart"
}
```

---

## Form and Phrasing

Form type depends on the style's family. Check `_family-map.json`.

### periodo_tematico (family: tonal)

Phrases have thematic relationships. For durations > 30s, use motivic development.

- **Antecedent**: phrase ending on half cadence (open, unresolved)
- **Consequent**: phrase ending on authentic cadence (closed, resolved)
- **Development** (climax): sequence, inversion, augmentation of the antecedent motif

```json
"phrases": [
  { "role": "antecedent", "notes": [...], "rhythm": [...], "cadence": "half" },
  { "role": "consequent", "notes": [...], "rhythm": [...], "cadence": "authentic" }
],
"development": {
  "climax": "ascending_sequence_by_thirds",
  "resolve": "inversion_of_antecedent"
}
```

### drop_structure (family: loop)

Tension/release is rhythmic, not harmonic.

- Intro → build → drop → breakdown → drop
- Define tension and release points

```json
"form": {
  "type": "drop_structure",
  "tension_point": "build_to_climax",
  "release": "rhythmic"
}
```

### processuale (family: modal)

Gradual timbral evolution. The "phrase" is a timbral gesture (e.g., filter opening), not a note sequence.

```json
"form": {
  "type": "processuale",
  "evolution_params": ["cutoff", "wet", "depth"]
}
```

### atematico (family: experimental)

No thematic structure. Organization by density/rarefaction, sonic events.

```json
"form": {
  "type": "atematico",
  "density_per_phase": { "intro": 0.2, "build": 0.5, "climax": 0.9, "resolve": 0.3 }
}
```

---

## Orchestration Density

### Voice slot limits per family

| Family | Max instruments (hard limit) | Rationale |
|--------|------------------------------|-----------|
| tonal | 6 | Voice leading unmanageable beyond 6; muddy mix |
| modal | 4 | Reverb space is protagonist; too many voices kill it |
| loop | 7 | Kick+snare must cut through; beyond 7, transients mask each other |
| experimental | 8 | 8 narrow-band noises < 3 spectral pads in damage |

**Spectral rule:** If 2+ instruments are "filled" (e.g., chord stab occupying full mid range), they count as 2 voices regardless of note count.

### Active voice slots per arc phase

Each preset must declare `orchestration_limits` with `max_simultaneous_voices` per phase:

```json
"orchestration_limits": {
  "intro": { "max_simultaneous_voices": 3 },
  "build": { "max_simultaneous_voices": 4 },
  "climax": { "max_simultaneous_voices": 5 },
  "resolve": { "max_simultaneous_voices": 3 },
  "hard_limit": 6,
  "spectral_rule": "If 4+ active voices, at least one must be 'light' (high freq, little low content)"
}
```

### Dynamic gain staging

Replaces the static volume table above. Use this formula:

- **Base per instrument**: -20dB
- **Penalty**: -3dB for each voice beyond the 4th
- Example: 5 instruments = -20dB + (-3dB) = -23dB per instrument
- **7+ instruments**: Also reduce reverb wet by 30% to avoid intermodulation on tails

---

## Temporal Quantization

Algorithm for translating video `totalMs` into musical structure.

### Step 1: Theoretical bar count

```
msPerBar = (60000 / BPM) * 4
rawBars = totalMs / msPerBar
```

### Step 2: Quantization strategy (branching)

```
deviation = |totalMs - round(rawBars) * msPerBar| / totalMs

If deviation < 2%     → exact_quantization (use theoretical BPM, round bars)
If totalMs < 30000    → tempo_stretch (adapt BPM, max ±5% from preset)
Otherwise             → bar_adjust (round to nearest multiple of progression cycle)
```

### Step 3: Cyclic progression fitting

```
cycleLength = numChords * barsPerChord
fullCycles = floor(totalBars / cycleLength)
remainder = totalBars % cycleLength

If remainder == 0  → complete_cadence (last chord is tonic)
If remainder <= 2  → truncate_and_cadence (force cadence on last 2 bars)
If remainder > 2   → partial_cycle (play remainder bars, modulate to cadence)
```

### Step 4: Validation

```
finalMs = totalBars * msPerBarActual
assert |finalMs - totalMs| < 50ms (1 frame @ 20fps)
```

### Edge cases

- **Video < 2 bars at preset BPM**: Non-metric mode (sound design hit, not music)
- **Asymmetric progression** (e.g., 5 chords): Irregular cycle, the modulo logic adapts

### Preset format — `temporal` field (replaces `tempo`)

```json
"temporal": {
  "bpm": 120,
  "range": [100, 140],
  "swing": 0.65,
  "timeSignature": [4, 4],
  "endingBehavior": {
    "type": "cadential_insert",
    "cadenceBars": 2,
    "forceTonicLastBar": true,
    "maxTempoDeviationPercent": 5
  }
}
```

**Ending behavior types:**

| Type | Families | Description |
|------|----------|-------------|
| `cadential_insert` | tonal | Insert formal cadence in last 2 bars |
| `fade_out` | modal | Volume ramp in last bars |
| `hard_cut` | loop | Hard cut on last beat |
| `loop_and_fade` | modal (chillwave, lo-fi) | Repeat last cycle with fade |

### Time Signature Rules (MANDATORY)

**The time signature is a pre-compositional decision. It is set ONCE in `temporal.timeSignature` and MUST NOT change during the soundtrack.**

#### Core Formulas

All timing derives from the time signature `[N, D]` where N = numerator (beats per bar), D = denominator (beat unit):

```
stepsPerBar  = N * (16 / D)        // subdivisions per bar in 16th notes
subdivision  = 60 / BPM / (16 / D) // duration of one grid step in seconds
barDuration  = stepsPerBar * subdivision
             = N * (60 / BPM) * (4 / D)
```

| Time Sig | N | D | stepsPerBar | subdivision (at 120 BPM) | barDuration |
|----------|---|---|-------------|--------------------------|-------------|
| 4/4      | 4 | 4 | 16          | 0.125s                   | 2.0s        |
| 3/4      | 3 | 4 | 12          | 0.125s                   | 1.5s        |
| 2/4      | 2 | 4 | 8           | 0.125s                   | 1.0s        |
| 6/8      | 6 | 8 | 12          | 0.0625s                  | 0.75s       |
| 5/4      | 5 | 4 | 20          | 0.125s                   | 2.5s        |
| 7/8      | 7 | 8 | 14          | 0.0625s                  | 0.875s      |
| 12/8     | 12| 8 | 24          | 0.0625s                  | 1.5s        |

#### Implementation

```javascript
// Read from preset
const [N, D] = preset.temporal.timeSignature; // e.g. [3, 4]
const stepsPerBar = N * (16 / D);             // 3/4 → 12, 6/8 → 12, 7/8 → 14
const subdivision = 60 / BPM / (16 / D);      // duration of one grid step
const barDuration = stepsPerBar * subdivision;

// Schedule notes — same pattern as 4/4 but with stepsPerBar instead of 16
for (let s = 0; s < stepsPerBar; s++) {
  const vel = grid[s];
  if (vel > 0) {
    const time = barStart + s * subdivision;
    Tone.Transport.schedule(t => instr.triggerAttackRelease(note, dur, t, rv(vel)), time);
  }
}
```

#### rhythmGrid sizing

The `rhythmGrid` arrays MUST have exactly `stepsPerBar` entries:

| Time Sig | Grid length | Example (kick in 3/4 waltz) |
|----------|-------------|-----------------------------|
| 4/4      | 16 steps    | `[0.9,0,0,0, 0.7,0,0,0, 0.9,0,0,0, 0.7,0,0,0]` |
| 3/4      | 12 steps    | `[0.9,0,0,0, 0.6,0,0,0, 0.6,0,0,0]` |
| 6/8      | 12 steps    | `[0.9,0,0, 0.5,0,0, 0.8,0,0, 0.5,0,0]` |
| 5/4      | 20 steps    | `[0.9,0,0,0, 0.7,0,0,0, 0.8,0,0,0, 0.6,0,0,0, 0.7,0,0,0]` |
| 7/8      | 14 steps    | `[0.9,0,0, 0.7,0,0, 0.8,0,0, 0.6,0,0, 0.7,0]` |

**Validation rule:** If `grid.length !== stepsPerBar`, reject the grid. Do not pad or truncate.

#### Beat grouping (compound vs simple)

The denominator determines grouping:

- **D = 4 (simple)**: beats subdivide in 2. Steps per beat = 4 (16th notes).
  - 4/4: groups of 4 steps → `[beat1: 0-3][beat2: 4-7][beat3: 8-11][beat4: 12-15]`
  - 3/4: groups of 4 steps → `[beat1: 0-3][beat2: 4-7][beat3: 8-11]`
  - 5/4: groups of 4 steps → `[beat1: 0-3][beat2: 4-7][beat3: 8-11][beat4: 12-15][beat5: 16-19]`

- **D = 8 (compound)**: beats subdivide in 3. Steps per beat = 2 (16th notes within an 8th-note pulse).
  - 6/8: two dotted-quarter groups → `[group1: 0-5][group2: 6-11]`
  - 7/8: asymmetric → typically `[2+2+3]` or `[3+2+2]`, defined in preset
  - 12/8: four dotted-quarter groups → `[g1: 0-5][g2: 6-11][g3: 12-17][g4: 18-23]`

For compound meters (D=8), accents fall on group boundaries, not on every 4th step.

#### Immutability constraint

- The time signature is **locked at composition start**. It comes from the preset and cannot be changed mid-soundtrack.
- If a soundtrack needs a meter change (extremely rare), it must be two separate presets concatenated, NOT a mid-stream switch.
- `Tone.Transport.timeSignature` must be set once before scheduling: `Tone.Transport.timeSignature = [N, D];`

#### Melodic note placement by time signature

Quarter notes, 8th notes, etc. map to grid positions based on `stepsPerBar`:

| Note value | Grid positions (D=4) | Grid positions (D=8) |
|------------|---------------------|---------------------|
| Quarter    | every 4 steps       | every 2 steps (= dotted 8th in compound) |
| 8th        | every 2 steps       | every step           |
| Half       | every 8 steps       | every 4 steps        |
| Dotted quarter | every 6 steps  | every 3 steps (= one beat in compound)  |

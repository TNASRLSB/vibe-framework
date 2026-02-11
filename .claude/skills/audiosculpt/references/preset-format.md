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

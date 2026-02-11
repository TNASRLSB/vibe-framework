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

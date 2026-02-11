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

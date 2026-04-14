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

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

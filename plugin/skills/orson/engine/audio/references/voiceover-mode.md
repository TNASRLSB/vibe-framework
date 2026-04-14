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

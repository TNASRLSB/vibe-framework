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

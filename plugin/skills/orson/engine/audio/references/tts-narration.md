## TTS Narration System

Generate voice narration synchronized with video animations via pluggable TTS engines.

### Multi-Engine Architecture

The narration generator uses an abstract `TTSEngine` interface. Any TTS provider can be added without modifying the core pipeline.

```
engine/audio/
├── engines/
│   ├── __init__.py            # Registry + get_engine() factory
│   ├── base.py                # TTSEngine abstract class
│   └── edge_tts_engine.py     # Edge-TTS implementation (default)
├── narration_generator.py     # Engine-agnostic orchestrator
└── presets/voices.json        # Voice catalog + engine metadata
```

**Engine selection priority:**
1. `tts_engine` field in narration brief JSON
2. `ORSON_TTS_ENGINE` environment variable
3. Auto-detect: first available non-edge-tts engine
4. Fallback: edge-tts

**Prosody handling:** Engines declare `supports_prosody`. Those that support it receive rate/pitch hints; others rely on natural voice quality and punctuation engineering (which works on all engines since it's plain text).

### Adding a New Engine

1. Create `engines/my_engine.py`:
```python
from .base import TTSEngine

class MyEngine(TTSEngine):
    name = 'my-engine'
    supports_prosody = False  # or True

    def is_available(self) -> bool:
        # Check import + API key
        try:
            import my_package
            return bool(os.environ.get('MY_API_KEY'))
        except ImportError:
            return False

    async def generate(self, text, voice, output_path, rate=None, pitch=None):
        # Generate audio, save as MP3 at output_path
        # If native format is WAV: self.convert_to_mp3(wav_path, output_path)
        # Return duration in ms
        ...

    async def list_voices(self):
        return [{'id': 'voice-1', 'gender': 'Female', 'locale': 'en-US', 'engine': self.name}]
```

2. Register in `engines/__init__.py`:
```python
ENGINES = {
    'edge-tts': ('edge_tts_engine', 'EdgeTTSEngine', 'edge-tts'),
    'my-engine': ('my_engine', 'MyEngine', 'my-package'),
}
```

3. Add to `presets/voices.json` → `engines`:
```json
"my-engine": {
  "pip_package": "my-package",
  "env_var": "MY_API_KEY",
  "prosody": false,
  "description": "My TTS provider"
}
```

4. Install: `.venv/bin/pip install my-package`

### Requirements

```bash
# Default (edge-tts)
pip install edge-tts

# Additional engines: install their packages in the same venv
```

### Entry Points

**A. Video with narration** (`/orson create` or `/orson render`)
- HTML config contains structured text elements
- Narration brief generated automatically
- Audio system handles mixing and ducking

**B. Demo mode** (`/orson demo`)
- Demo script contains narration text per step
- Narration brief generated from demo-script.ts
- Timeline-driven audio positioning

### Recommended Voices (Edge-TTS)

| Voice | Character | Use Cases |
|-------|-----------|-----------|
| `en-US-AriaNeural` | Professional, warm | Corporate, tech, explainer |
| `en-US-GuyNeural` | Energetic, confident | Sports, gaming, hype |
| `en-US-JennyNeural` | Friendly, casual | Lifestyle, wellness |
| `en-US-DavisNeural` | Deep, authoritative | Trailer, documentary |
| `en-GB-SoniaNeural` | Elegant, sophisticated | Luxury, fashion |

### Recommended Voices (ElevenLabs)

Requires `ELEVENLABS_API_KEY`. Uses model `eleven_multilingual_v2` (supports Italian and 70+ languages).

| Voice ID | Name | Character | Use Cases |
|----------|------|-----------|-----------|
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Warm, professional | Corporate, explainer |
| `pNInz6obpgDQGcFmaJgB` | Adam | Deep, authoritative | Trailer, documentary |
| `EXAVITQu4vr4xnSDxMaL` | Bella | Friendly, youthful | Social media, app promo |
| `TxGEqnHWrfWFTfGW9XjX` | Josh | Energetic, clear | Tech, gaming |

Any multilingual voice speaks Italian when `language_code: "it"` is set — no need for a voice labeled "Italian".

**Style mapping:** ElevenLabs doesn't support rate/pitch. Instead, Orson's narration styles map to `voice_settings`:

| Orson Style | Speed | Stability | Style | Effect |
|-------------|-------|-----------|-------|--------|
| enthusiastic | 1.1 | 0.4 | 0.6 | Faster, more expressive |
| neutral | 1.0 | 0.5 | 0.0 | Standard delivery |
| calm | 0.9 | 0.7 | 0.0 | Slower, more consistent |
| dramatic | 0.85 | 0.3 | 0.8 | Slow, highly expressive |

### Emphasis by Element Type

Prosody-aware engines apply these profiles per element type:

| Element | Rate | Pitch | Effect |
|---------|------|-------|--------|
| heading | -15% | +5Hz | Slower, prominent |
| text | +0% | +0Hz | Normal |
| button/CTA | -10% | +8Hz | Emphasized |

Engines without prosody support ignore rate/pitch — punctuation in the text still produces natural pauses.

### Narration Brief Schema

```json
{
  "narration": {
    "enabled": true,
    "voice": "en-US-AriaNeural",
    "style": "enthusiastic",
    "tts_engine": "edge-tts",
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
# Generate narration from brief (uses configured engine)
python narration_generator.py narration_brief.json ./audio/narration/

# List available voices for active engine
python narration_generator.py --list-voices

# List all registered engines
python narration_generator.py --list-engines
```

### Fallback

If the configured engine is unavailable, the generator falls back to edge-tts automatically. If edge-tts is also unavailable, estimated durations are used (no audio).

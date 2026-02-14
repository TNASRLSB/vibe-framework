# How to Add a New TTS Engine

Orson uses a pluggable TTS engine architecture. Follow these steps to add a new provider.

## Steps

1. **Create the engine module:** `engine/audio/engines/your_engine.py` implementing the `TTSEngine` interface
2. **Register it:** Add to `engine/audio/engines/__init__.py` in the `ENGINES` dict
3. **Add voice config:** Add its entry in `engine/audio/presets/voices.json` under the `engines` section
4. **Install the package:** `engine/audio/.venv/bin/pip install your-package`
5. **Activate:** Set `ORSON_TTS_ENGINE=your_engine` environment variable, or use `ttsEngine` field in demo script JSON

## TTSEngine Interface

Your engine module must implement the `TTSEngine` class with these methods:

- `__init__(self, config: dict)` — Initialize with engine-specific config from `voices.json`
- `synthesize(self, text: str, voice: str, output_path: str, **kwargs)` — Generate audio file
- `list_voices(self) -> list[dict]` — Return available voices

## Environment Variables

- `ORSON_TTS_ENGINE` — Default engine name (e.g. `edge-tts`, `elevenlabs`)
- Engine-specific API keys as documented by each engine (e.g. `ELEVENLABS_API_KEY`)

## Engine Selection Priority

1. `ttsEngine` field in demo script JSON
2. `ORSON_TTS_ENGINE` environment variable
3. Auto-detect: first available non-edge-tts engine
4. Fallback: `edge-tts`

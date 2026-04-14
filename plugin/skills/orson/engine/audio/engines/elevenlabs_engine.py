"""
ElevenLabs engine — high-quality multilingual TTS.

Supports 70+ languages including Italian.
Requires ELEVENLABS_API_KEY environment variable.
Uses voice_settings (speed, stability, style) instead of rate/pitch.
Outputs MP3 directly via mp3_44100_128.
"""

import os
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

from .base import TTSEngine

# Narration style → ElevenLabs voice_settings mapping
STYLE_PRESETS = {
    'enthusiastic': {'speed': 1.05, 'stability': 0.55, 'similarity_boost': 0.80, 'style': 0.15, 'use_speaker_boost': True},
    'neutral':      {'speed': 1.0,  'stability': 0.65, 'similarity_boost': 0.75, 'style': 0.0,  'use_speaker_boost': True},
    'calm':         {'speed': 0.95, 'stability': 0.75, 'similarity_boost': 0.70, 'style': 0.0,  'use_speaker_boost': False},
    'dramatic':     {'speed': 0.90, 'stability': 0.40, 'similarity_boost': 0.85, 'style': 0.60, 'use_speaker_boost': True},
}

DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'  # Rachel
DEFAULT_MODEL = 'eleven_multilingual_v2'
VOICES_CATALOG = Path(__file__).parent.parent / 'presets' / 'voices.json'


def _load_voices_catalog() -> dict:
    """Load the voices.json catalog."""
    import json
    try:
        return json.loads(VOICES_CATALOG.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _resolve_voice_id(voice: str) -> str:
    """Resolve a voice spec to an ElevenLabs voice ID.

    Accepts: voice ID (>= 20 alnum chars), catalog name ("Daniel"),
    or Edge-TTS name ("it-IT-IsabellaNeural") → fallback to default.
    """
    if not voice or voice.endswith('Neural'):
        return DEFAULT_VOICE_ID
    if len(voice) >= 20 and voice.isalnum():
        return voice  # Direct voice ID
    # Name lookup from catalog
    catalog = _load_voices_catalog()
    for v in catalog.get('recommended', {}).get('elevenlabs', []):
        if v.get('name', '').lower() == voice.lower():
            return v['id']
    return DEFAULT_VOICE_ID


def _apply_atempo(file_path: Path, speed: float) -> None:
    """Apply speed change via ffmpeg atempo filter (in-place)."""
    tmp = file_path.with_suffix('.tmp.mp3')
    try:
        subprocess.run(
            ['ffmpeg', '-y', '-i', str(file_path), '-filter:a', f'atempo={speed}', str(tmp)],
            capture_output=True, check=True,
        )
        tmp.replace(file_path)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"  ffmpeg atempo fallback failed: {e}")
        if tmp.exists():
            tmp.unlink()


class ElevenLabsEngine(TTSEngine):

    @property
    def name(self) -> str:
        return 'elevenlabs'

    @property
    def supports_prosody(self) -> bool:
        return False

    def is_available(self) -> bool:
        try:
            import elevenlabs  # noqa: F401
            return bool(os.environ.get('ELEVENLABS_API_KEY'))
        except ImportError:
            return False

    async def generate(
        self,
        text: str,
        voice: str,
        output_path: Path,
        rate: Optional[str] = None,
        pitch: Optional[str] = None,
    ) -> Optional[int]:
        try:
            from elevenlabs.client import AsyncElevenLabs
            from elevenlabs import VoiceSettings
        except ImportError:
            print("  elevenlabs not installed. Run: pip install elevenlabs")
            return None

        api_key = os.environ.get('ELEVENLABS_API_KEY')
        if not api_key:
            print("  ELEVENLABS_API_KEY not set")
            return None

        # Resolve voice ID (use default if empty)
        voice_id = _resolve_voice_id(voice)

        # Get style preset from env (set by narration_generator before calling engine)
        style_name = os.environ.get('_ORSON_NARRATION_STYLE', 'neutral')
        preset = STYLE_PRESETS.get(style_name, STYLE_PRESETS['neutral'])

        speed = preset.get('speed', 1.0)

        try:
            client = AsyncElevenLabs(api_key=api_key)

            base_settings = dict(
                stability=preset['stability'],
                similarity_boost=preset['similarity_boost'],
                style=preset['style'],
                use_speaker_boost=preset.get('use_speaker_boost', True),
            )

            needs_atempo = False
            try:
                audio_iterator = await client.text_to_speech.convert(
                    text=text,
                    voice_id=voice_id,
                    model_id=DEFAULT_MODEL,
                    output_format='mp3_44100_128',
                    voice_settings=VoiceSettings(**base_settings, speed=speed),
                )
            except TypeError:
                # SDK version doesn't support speed param — generate without it
                audio_iterator = await client.text_to_speech.convert(
                    text=text,
                    voice_id=voice_id,
                    model_id=DEFAULT_MODEL,
                    output_format='mp3_44100_128',
                    voice_settings=VoiceSettings(**base_settings),
                )
                needs_atempo = speed != 1.0

            # Write audio chunks to file
            audio_data = b""
            async for chunk in audio_iterator:
                if isinstance(chunk, bytes):
                    audio_data += chunk

            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(audio_data)

            await client.close()

            # Apply speed via ffmpeg if SDK didn't handle it
            if needs_atempo:
                _apply_atempo(output_path, speed)

            duration_ms = self.get_audio_duration(output_path)
            if duration_ms is None:
                duration_ms = len(text.split()) * 150
            return duration_ms

        except Exception as e:
            print(f"  ElevenLabs error: {e}")
            return None

    async def list_voices(self) -> List[Dict]:
        try:
            from elevenlabs.client import AsyncElevenLabs
        except ImportError:
            return []

        api_key = os.environ.get('ELEVENLABS_API_KEY')
        if not api_key:
            return []

        try:
            client = AsyncElevenLabs(api_key=api_key)
            response = await client.voices.get_all()
            await client.close()

            return [
                {
                    'id': v.voice_id,
                    'name': v.name,
                    'gender': getattr(v.labels, 'gender', None) if v.labels else None,
                    'locale': None,
                    'engine': self.name,
                }
                for v in response.voices
            ]
        except Exception as e:
            print(f"  ElevenLabs list_voices error: {e}")
            return []

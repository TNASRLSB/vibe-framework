"""
ElevenLabs engine — high-quality multilingual TTS.

Supports 70+ languages including Italian.
Requires ELEVENLABS_API_KEY environment variable.
Uses voice_settings (speed, stability, style) instead of rate/pitch.
Outputs MP3 directly via mp3_44100_128.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional

from .base import TTSEngine

# Narration style → ElevenLabs voice_settings mapping
STYLE_PRESETS = {
    'enthusiastic': {'speed': 1.1, 'stability': 0.4, 'similarity_boost': 0.75, 'style': 0.6},
    'neutral':      {'speed': 1.0, 'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.0},
    'calm':         {'speed': 0.9, 'stability': 0.7, 'similarity_boost': 0.75, 'style': 0.0},
    'dramatic':     {'speed': 0.85, 'stability': 0.3, 'similarity_boost': 0.75, 'style': 0.8},
}

DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'  # Rachel
DEFAULT_MODEL = 'eleven_multilingual_v2'


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
        voice_id = voice if voice and not voice.endswith('Neural') else DEFAULT_VOICE_ID

        # Get style preset from env (set by narration_generator before calling engine)
        style_name = os.environ.get('_ORSON_NARRATION_STYLE', 'neutral')
        preset = STYLE_PRESETS.get(style_name, STYLE_PRESETS['neutral'])

        try:
            client = AsyncElevenLabs(api_key=api_key)

            audio_iterator = await client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=DEFAULT_MODEL,
                output_format='mp3_44100_128',
                voice_settings=VoiceSettings(
                    stability=preset['stability'],
                    similarity_boost=preset['similarity_boost'],
                    style=preset['style'],
                    speed=preset['speed'],
                    use_speaker_boost=True,
                ),
            )

            # Write audio chunks to file
            audio_data = b""
            async for chunk in audio_iterator:
                if isinstance(chunk, bytes):
                    audio_data += chunk

            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(audio_data)

            await client.close()

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

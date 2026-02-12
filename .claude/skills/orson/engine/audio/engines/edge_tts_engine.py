"""
Edge-TTS engine — Microsoft Azure Neural TTS (free, no API key).

Supports prosody control via rate and pitch parameters.
Outputs MP3 directly.
"""

from pathlib import Path
from typing import Dict, List, Optional

from .base import TTSEngine


class EdgeTTSEngine(TTSEngine):

    @property
    def name(self) -> str:
        return 'edge-tts'

    @property
    def supports_prosody(self) -> bool:
        return True

    def is_available(self) -> bool:
        try:
            import edge_tts  # noqa: F401
            return True
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
            import edge_tts
        except ImportError:
            print("  edge-tts not installed. Run: pip install edge-tts")
            return None

        try:
            communicate = edge_tts.Communicate(
                text, voice,
                rate=rate or '+0%',
                pitch=pitch or '+0Hz',
            )
            await communicate.save(str(output_path))

            duration_ms = self.get_audio_duration(output_path)
            if duration_ms is None:
                duration_ms = len(text.split()) * 150
            return duration_ms

        except Exception as e:
            print(f"  Edge-TTS error: {e}")
            return None

    async def list_voices(self) -> List[Dict]:
        try:
            import edge_tts
        except ImportError:
            return []

        voices = await edge_tts.list_voices()
        return [
            {
                'id': v['ShortName'],
                'gender': v['Gender'],
                'locale': v['Locale'],
                'engine': self.name,
            }
            for v in voices
        ]

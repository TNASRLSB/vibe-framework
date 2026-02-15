"""
Edge-TTS engine — Microsoft Azure Neural TTS (free, no API key).

Supports prosody control via rate and pitch parameters.
Outputs MP3 directly. Includes retry with exponential backoff.
"""

import asyncio
from pathlib import Path
from typing import Dict, List, Optional

from .base import TTSEngine

MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4]  # seconds — exponential backoff
GENERATION_TIMEOUT = 30  # seconds per attempt


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
            print("  [tts] edge-tts not installed. Run: pip install edge-tts")
            return None

        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                communicate = edge_tts.Communicate(
                    text, voice,
                    rate=rate or '-10%',
                    pitch=pitch or '+0Hz',
                )
                await asyncio.wait_for(
                    communicate.save(str(output_path)),
                    timeout=GENERATION_TIMEOUT,
                )

                duration_ms = self.get_audio_duration(output_path)
                if duration_ms is None:
                    duration_ms = len(text.split()) * 400
                return duration_ms

            except asyncio.TimeoutError:
                last_error = f"timeout ({GENERATION_TIMEOUT}s)"
                print(f"  [tts] WARN: attempt {attempt + 1}/{MAX_RETRIES} timed out")
            except Exception as e:
                last_error = str(e)
                print(f"  [tts] WARN: attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")

            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                print(f"  [tts] Retrying in {delay}s...")
                await asyncio.sleep(delay)

        print(f"  [tts] WARN: all {MAX_RETRIES} attempts failed ({last_error}), using duration estimate")
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

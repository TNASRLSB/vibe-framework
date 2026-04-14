"""
Abstract base class for TTS engines.

All TTS providers must implement this interface. The narration generator
uses it to remain engine-agnostic — prosody hints are passed through
but each engine decides whether to honor them.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Optional
import subprocess


class TTSEngine(ABC):
    """Base class for all TTS engines."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Engine identifier (e.g. 'edge-tts', 'elevenlabs')."""
        ...

    @property
    @abstractmethod
    def supports_prosody(self) -> bool:
        """Whether this engine can use rate/pitch parameters."""
        ...

    @abstractmethod
    async def generate(
        self,
        text: str,
        voice: str,
        output_path: Path,
        rate: Optional[str] = None,
        pitch: Optional[str] = None,
    ) -> Optional[int]:
        """
        Generate speech audio and save as MP3.

        Args:
            text: Text to synthesize.
            voice: Voice identifier (engine-specific format).
            output_path: Where to save the MP3 file.
            rate: Prosody rate hint (e.g. '+5%', '-10%'). Ignored if not supported.
            pitch: Prosody pitch hint (e.g. '+3Hz', '-2Hz'). Ignored if not supported.

        Returns:
            Duration in milliseconds, or None on failure.
        """
        ...

    @abstractmethod
    async def list_voices(self) -> List[Dict]:
        """List available voices for this engine."""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Check if engine dependencies are installed and API key present (if required)."""
        ...

    # ── Shared helpers ────────────────────────────────────────

    @staticmethod
    def convert_to_mp3(input_path: Path, output_path: Path) -> bool:
        """Convert any audio file to MP3 via ffmpeg. Returns True on success."""
        try:
            result = subprocess.run(
                ['ffmpeg', '-y', '-i', str(input_path),
                 '-q:a', '2', str(output_path)],
                capture_output=True, text=True
            )
            if result.returncode == 0 and output_path.exists():
                input_path.unlink(missing_ok=True)
                return True
        except FileNotFoundError:
            pass
        return False

    @staticmethod
    def get_audio_duration(audio_file: Path) -> Optional[int]:
        """Get duration of audio file in milliseconds using ffprobe."""
        try:
            result = subprocess.run(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                 '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_file)],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                return int(float(result.stdout.strip()) * 1000)
        except FileNotFoundError:
            pass
        return None

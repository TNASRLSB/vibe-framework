"""
TTS Engine registry and factory.

Selection priority:
  1. Explicit engine name (from narration brief or function arg)
  2. ORSON_TTS_ENGINE environment variable
  3. Auto-detect: first available non-edge-tts engine
  4. Fallback: edge-tts (always available, no API key)

To add a new engine:
  1. Create engines/my_engine.py implementing TTSEngine
  2. Add entry to ENGINES below
  3. Install its pip package in the venv
"""

import os
import importlib
from typing import Optional

from .base import TTSEngine

# ── Engine Registry ──────────────────────────────────────────
# Format: 'engine-name': ('module_name', 'ClassName', 'pip_package')
# module_name is relative to this package (engines/)

ENGINES: dict[str, tuple[str, str, str]] = {
    'edge-tts': ('edge_tts_engine', 'EdgeTTSEngine', 'edge-tts'),
    'elevenlabs': ('elevenlabs_engine', 'ElevenLabsEngine', 'elevenlabs'),
    # Add new engines here:
    # 'google-cloud-tts': ('google_tts_engine', 'GoogleTTSEngine', 'google-cloud-texttospeech'),
    # 'speechmatics': ('speechmatics_engine', 'SpeechmaticsEngine', 'speechmatics-tts'),
}

# ── Factory ──────────────────────────────────────────────────

_cache: dict[str, TTSEngine] = {}


def _load_engine(name: str) -> Optional[TTSEngine]:
    """Load and instantiate an engine by name."""
    if name in _cache:
        return _cache[name]

    entry = ENGINES.get(name)
    if not entry:
        print(f"  Unknown TTS engine: '{name}'. Available: {', '.join(ENGINES.keys())}")
        return None

    module_name, class_name, _ = entry
    try:
        mod = importlib.import_module(f'.{module_name}', package=__package__)
        cls = getattr(mod, class_name)
        engine = cls()
        _cache[name] = engine
        return engine
    except Exception as e:
        print(f"  Failed to load engine '{name}': {e}")
        return None


def get_engine(name: Optional[str] = None) -> TTSEngine:
    """
    Get a TTS engine instance.

    Args:
        name: Explicit engine name. If None, uses env var or auto-detect.

    Returns:
        TTSEngine instance (guaranteed — falls back to edge-tts).
    """
    # 1. Explicit name
    if name:
        engine = _load_engine(name)
        if engine and engine.is_available():
            return engine
        print(f"  Engine '{name}' not available, trying fallback...")

    # 2. Environment variable
    env_engine = os.environ.get('ORSON_TTS_ENGINE')
    if env_engine and env_engine != name:
        engine = _load_engine(env_engine)
        if engine and engine.is_available():
            return engine
        print(f"  Env engine '{env_engine}' not available, trying auto-detect...")

    # 3. Auto-detect: prefer non-edge-tts engines (they require explicit setup)
    for engine_name in ENGINES:
        if engine_name == 'edge-tts':
            continue
        engine = _load_engine(engine_name)
        if engine and engine.is_available():
            print(f"  Auto-detected TTS engine: {engine_name}")
            return engine

    # 4. Fallback: edge-tts
    engine = _load_engine('edge-tts')
    if engine and engine.is_available():
        return engine

    # Last resort: return edge-tts even if not available (will fail gracefully at generate time)
    print("  WARNING: No TTS engine available. Install edge-tts: pip install edge-tts")
    return _load_engine('edge-tts') or _create_fallback()


def _create_fallback() -> TTSEngine:
    """Emergency fallback — should never happen if edge-tts entry exists."""
    from .edge_tts_engine import EdgeTTSEngine
    return EdgeTTSEngine()


def get_pip_package(engine_name: str) -> Optional[str]:
    """Get the pip package name for an engine (used by auto-install in demo-capture.ts)."""
    entry = ENGINES.get(engine_name)
    return entry[2] if entry else None


def list_engines() -> list[dict]:
    """List all registered engines with availability status."""
    result = []
    for name, (_, _, pip_pkg) in ENGINES.items():
        engine = _load_engine(name)
        result.append({
            'name': name,
            'available': engine.is_available() if engine else False,
            'supports_prosody': engine.supports_prosody if engine else None,
            'pip_package': pip_pkg,
        })
    return result

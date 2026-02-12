#!/usr/bin/env python3
"""
Narration Generator for Orson
Generates TTS narration via pluggable engine architecture.

Usage:
    python narration_generator.py <narration_brief.json> <output_dir>
    python narration_generator.py --list-voices
    python narration_generator.py --list-engines

Engine selection (priority):
    1. "tts_engine" field in narration brief JSON
    2. ORSON_TTS_ENGINE environment variable
    3. Auto-detect first available non-edge-tts engine
    4. Fallback: edge-tts (free, no API key)

The narration brief should contain:
- narration.voice: Voice name (engine-specific)
- narration.tts_engine: Engine name (optional)
- narration.scenes[].elements[]: items to narrate
- Each element has: id, narration_text, element_type, timing
"""

import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

from engines import get_engine, list_engines


async def normalize_audio(audio_file: Path) -> None:
    """Normalize audio loudness to -16 LUFS using ffmpeg loudnorm."""
    tmp_file = audio_file.with_suffix('.norm.mp3')
    try:
        result = subprocess.run(
            ['ffmpeg', '-y', '-i', str(audio_file),
             '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
             '-q:a', '2', str(tmp_file)],
            capture_output=True, text=True
        )
        if result.returncode == 0 and tmp_file.exists():
            tmp_file.replace(audio_file)
        else:
            tmp_file.unlink(missing_ok=True)
    except FileNotFoundError:
        pass  # ffmpeg not available, skip normalization


async def generate_element_audio(
    element: Dict,
    voice: str,
    emphasis: Dict,
    output_path: Path,
    engine,
) -> Optional[int]:
    """Generate audio for a single narration element using the active TTS engine."""
    text = element['narration_text']
    element_id = element['id']
    output_file = output_path / f"{element_id}.mp3"

    # Pass prosody hints — engine decides whether to use them
    rate = emphasis.get('rate', '+0%') if engine.supports_prosody else None
    pitch = emphasis.get('pitch', '+0Hz') if engine.supports_prosody else None

    try:
        duration_ms = await engine.generate(text, voice, output_file, rate=rate, pitch=pitch)

        if duration_ms is not None:
            # Normalize loudness to consistent -16 LUFS (engine-agnostic post-processing)
            await normalize_audio(output_file)

        if duration_ms is None:
            # Estimate: ~150ms per word
            word_count = len(text.split())
            duration_ms = word_count * 150

        return duration_ms
    except Exception as e:
        print(f"  Error generating {element_id}: {e}")
        return None


async def generate_narration(brief_path: str, output_dir: str) -> Dict:
    """
    Generate narration audio files from a narration brief.

    Returns updated brief with audio_file paths and durations.
    """
    with open(brief_path, 'r') as f:
        brief = json.load(f)

    narration = brief.get('narration')
    if not narration or not narration.get('enabled'):
        print("Narration not enabled in brief")
        return brief

    # Resolve TTS engine
    engine_name = narration.get('tts_engine')
    engine = get_engine(engine_name)

    # Pass narration style to engine via env (used by ElevenLabs for voice_settings mapping)
    style = narration.get('style', 'neutral')
    os.environ['_ORSON_NARRATION_STYLE'] = style

    voice = narration.get('voice', 'en-US-AriaNeural')
    emphasis_profiles = narration.get('emphasis_by_element_type', {})
    prosody_defaults = narration.get('prosody_defaults', {'rate': '+0%', 'pitch': '+0Hz'})

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"TTS engine: {engine.name} (prosody: {'yes' if engine.supports_prosody else 'no'})")
    print(f"Voice: {voice}")
    print(f"Output: {output_path}")

    total_items = 0
    total_duration_ms = 0

    for scene in narration.get('scenes', []):
        scene_name = scene.get('scene_name', f"Scene {scene.get('scene_index', 0)}")
        print(f"\nScene: {scene_name}")

        for element in scene.get('elements', []):
            element_id = element['id']
            element_type = element.get('element_type', 'text')

            # Get emphasis profile for this element type
            emphasis = emphasis_profiles.get(element_type, prosody_defaults)

            print(f"  Generating: {element_id} ({element_type})")

            duration_ms = await generate_element_audio(
                element, voice, emphasis, output_path, engine
            )

            if duration_ms:
                element['audio_file'] = str(output_path / f"{element_id}.mp3")
                element['audio_duration_ms'] = duration_ms
                total_items += 1
                total_duration_ms += duration_ms

    # Update summary
    narration['summary'] = {
        'total_items': total_items,
        'total_speech_duration_ms': total_duration_ms,
        'output_directory': str(output_path),
        'engine': engine.name,
    }

    # Calculate ducking events
    ducking_events = calculate_ducking(narration)
    brief['ducking'] = {
        'enabled': True,
        'music_gain_normal': 0.5,
        'music_gain_ducked': 0.15,
        'attack_ms': 50,
        'release_ms': 200,
        'events': ducking_events
    }

    # Save updated brief
    output_brief_path = output_path / 'manifest.json'
    with open(output_brief_path, 'w') as f:
        json.dump(brief, f, indent=2)

    print(f"\nGeneration complete!")
    print(f"  Engine: {engine.name}")
    print(f"  Total items: {total_items}")
    print(f"  Total duration: {total_duration_ms}ms ({total_duration_ms/1000:.1f}s)")
    print(f"  Manifest saved to: {output_brief_path}")

    return brief


def calculate_ducking(narration: Dict) -> List[Dict]:
    """
    Calculate ducking timeline from narration elements.

    For each narration element:
    - duck_start = appear_ms - attack_ms
    - duck_end = appear_ms + audio_duration_ms + release_ms
    """
    events = []
    attack_ms = 50
    release_ms = 200

    for scene in narration.get('scenes', []):
        for element in scene.get('elements', []):
            if 'audio_file' not in element:
                continue

            appear_ms = element.get('timing', {}).get('appear_ms', 0)
            duration_ms = element.get('audio_duration_ms', 500)

            duck_start = max(0, appear_ms - attack_ms)
            duck_end = appear_ms + duration_ms + release_ms

            events.append({
                'time_ms': duck_start,
                'action': 'duck',
                'target_gain': 0.15,
                'element_id': element['id']
            })
            events.append({
                'time_ms': duck_end,
                'action': 'release',
                'target_gain': 0.5,
                'element_id': element['id']
            })

    # Sort by time
    events.sort(key=lambda e: e['time_ms'])

    return events


def do_list_voices():
    """List voices for the active TTS engine."""
    async def _list():
        engine = get_engine()
        voices = await engine.list_voices()
        print(f"\nAvailable voices ({engine.name}):\n")
        for v in voices:
            locale = v.get('locale', '')
            if locale.startswith('en'):
                print(f"  {v.get('id', '?'):30} {v.get('gender', '?'):8} {locale}")

    asyncio.run(_list())


def do_list_engines():
    """List all registered TTS engines with availability."""
    engines = list_engines()
    print("\nRegistered TTS engines:\n")
    for e in engines:
        status = 'available' if e['available'] else 'not installed'
        prosody = 'yes' if e.get('supports_prosody') else 'no'
        print(f"  {e['name']:20} {status:15} prosody: {prosody:4} pip: {e['pip_package']}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nCommands:")
        print("  python narration_generator.py <brief.json> <output_dir>")
        print("  python narration_generator.py --list-voices")
        print("  python narration_generator.py --list-engines")
        sys.exit(1)

    if sys.argv[1] == '--list-voices':
        do_list_voices()
    elif sys.argv[1] == '--list-engines':
        do_list_engines()
    else:
        if len(sys.argv) < 3:
            print("Error: Missing output directory")
            print("Usage: python narration_generator.py <brief.json> <output_dir>")
            sys.exit(1)

        asyncio.run(generate_narration(sys.argv[1], sys.argv[2]))

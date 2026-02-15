#!/usr/bin/env python3
"""
Narration Generator for Orson
Generates TTS narration via pluggable engine architecture.

Usage:
    python narration_generator.py <narration_brief.json> <output_dir> [--wpm N]
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
- narration.target_wpm: Target words-per-minute (optional, overridden by --wpm)
- narration.scenes[].elements[]: items to narrate
- Each element has: id, narration_text, element_type, timing
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

from engines import get_engine, list_engines

# Edge-TTS baseline: ~160 WPM at rate 0%
BASELINE_WPM = 160


def wpm_to_rate(target_wpm: int) -> str:
    """Convert target WPM to Edge-TTS prosody rate string.

    Baseline: Edge-TTS speaks at ~160 WPM with rate 0%.
    e.g. 130 WPM → -19%, 180 WPM → +12%
    """
    pct = ((target_wpm / BASELINE_WPM) - 1) * 100
    sign = '+' if pct >= 0 else ''
    return f"{sign}{pct:.0f}%"


async def generate_element_audio(
    element: Dict,
    voice: str,
    emphasis: Dict,
    output_path: Path,
    engine,
    wpm_rate_override: Optional[str] = None,
) -> Optional[int]:
    """Generate audio for a single narration element using the active TTS engine."""
    text = element['narration_text']
    element_id = element['id']
    output_file = output_path / f"{element_id}.mp3"

    # Pass prosody hints — engine decides whether to use them
    rate = emphasis.get('rate', '+0%') if engine.supports_prosody else None
    pitch = emphasis.get('pitch', '+0Hz') if engine.supports_prosody else None

    # WPM rate override takes priority over emphasis profile rate
    if wpm_rate_override and engine.supports_prosody:
        rate = wpm_rate_override

    try:
        duration_ms = await engine.generate(text, voice, output_file, rate=rate, pitch=pitch)

        if duration_ms is None:
            # Estimate: ~400ms per word (= 150 WPM, natural speech pace)
            word_count = len(text.split())
            duration_ms = word_count * 400

        return duration_ms
    except Exception as e:
        print(f"  [tts] Error generating {element_id}: {e}")
        return None


async def generate_narration(brief_path: str, output_dir: str, target_wpm: Optional[int] = None) -> Dict:
    """
    Generate narration audio files from a narration brief.

    Args:
        brief_path: Path to narration brief JSON
        output_dir: Output directory for audio files
        target_wpm: Target words-per-minute (overrides brief's target_wpm)

    Returns updated brief with audio_file paths and durations.
    """
    with open(brief_path, 'r') as f:
        brief = json.load(f)

    narration = brief.get('narration')
    if not narration or not narration.get('enabled'):
        print("[tts] Narration not enabled in brief")
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

    # Resolve WPM: CLI arg > brief field > None
    effective_wpm = target_wpm or narration.get('target_wpm')
    wpm_rate_override = wpm_to_rate(effective_wpm) if effective_wpm else None

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"[tts] Engine: {engine.name} (prosody: {'yes' if engine.supports_prosody else 'no'})")
    print(f"[tts] Voice: {voice}")
    if effective_wpm:
        print(f"[tts] Target WPM: {effective_wpm} (rate: {wpm_rate_override})")
    print(f"[tts] Output: {output_path}")

    total_items = 0
    total_duration_ms = 0
    fallback_count = 0

    for scene in narration.get('scenes', []):
        scene_name = scene.get('scene_name', f"Scene {scene.get('scene_index', 0)}")
        print(f"\n[tts] Scene: {scene_name}")

        for element in scene.get('elements', []):
            element_id = element['id']
            element_type = element.get('element_type', 'text')

            # Get emphasis profile for this element type
            emphasis = emphasis_profiles.get(element_type, prosody_defaults)

            print(f"  [tts] Generating: {element_id} ({element_type})")

            duration_ms = await generate_element_audio(
                element, voice, emphasis, output_path, engine,
                wpm_rate_override=wpm_rate_override,
            )

            if duration_ms:
                element['audio_file'] = str(output_path / f"{element_id}.mp3")
                element['audio_duration_ms'] = duration_ms
                total_items += 1
                total_duration_ms += duration_ms
                # Check if this was a fallback (no audio file generated)
                if not (output_path / f"{element_id}.mp3").exists():
                    fallback_count += 1
                    print(f"  [tts] WARN: generation failed for {element_id}, using {duration_ms}ms estimate")

    # Update summary
    narration['summary'] = {
        'total_items': total_items,
        'total_speech_duration_ms': total_duration_ms,
        'output_directory': str(output_path),
        'engine': engine.name,
        **(({'target_wpm': effective_wpm}) if effective_wpm else {}),
    }

    # Calculate ducking events — read attack/release from brief if provided
    duck_attack = narration.get('ducking_attack_ms', 300)
    duck_release = narration.get('ducking_release_ms', 500)
    ducking_events = calculate_ducking(narration, attack_ms=duck_attack, release_ms=duck_release)
    brief['ducking'] = {
        'enabled': True,
        'music_gain_normal': 0.35,
        'music_gain_ducked': 0.12,
        'attack_ms': duck_attack,
        'release_ms': duck_release,
        'events': ducking_events
    }

    # Save updated brief
    output_brief_path = output_path / 'manifest.json'
    with open(output_brief_path, 'w') as f:
        json.dump(brief, f, indent=2)

    print(f"\n[tts] Generation complete!")
    print(f"  [tts] Engine: {engine.name}")
    print(f"  [tts] Total items: {total_items}")
    print(f"  [tts] Total duration: {total_duration_ms}ms ({total_duration_ms/1000:.1f}s)")
    if fallback_count > 0:
        print(f"  [tts] Fallbacks: {fallback_count} (using duration estimates)")
    print(f"  [tts] Manifest: {output_brief_path}")

    return brief


def calculate_ducking(narration: Dict, attack_ms: int = 300, release_ms: int = 500) -> List[Dict]:
    """
    Calculate ducking timeline from narration elements.

    For each narration element:
    - duck_start = appear_ms - attack_ms
    - duck_end = appear_ms + audio_duration_ms + release_ms

    Default attack/release match audio-mixer.ts applyDucking() fade durations.
    """
    events = []

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
                'target_gain': 0.12,
                'element_id': element['id']
            })
            events.append({
                'time_ms': duck_end,
                'action': 'release',
                'target_gain': 0.35,
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
        print("  python narration_generator.py <brief.json> <output_dir> [--wpm N]")
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
            print("Usage: python narration_generator.py <brief.json> <output_dir> [--wpm N]")
            sys.exit(1)

        # Parse optional --wpm flag
        wpm = None
        args = sys.argv[3:]
        for i, arg in enumerate(args):
            if arg == '--wpm' and i + 1 < len(args):
                wpm = int(args[i + 1])

        asyncio.run(generate_narration(sys.argv[1], sys.argv[2], target_wpm=wpm))

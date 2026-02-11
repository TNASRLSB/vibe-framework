#!/usr/bin/env python3
"""
Narration Generator for Audiosculpt
Generates TTS narration using Edge-TTS (Microsoft Azure Neural TTS)

Usage:
    python narration_generator.py <narration_brief.json> <output_dir>

Requirements:
    pip install edge-tts

The narration brief should contain:
- narration.voice: Edge-TTS voice name
- narration.scenes[].elements[]: items to narrate
- Each element has: id, narration_text, element_type, timing
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

try:
    import edge_tts
except ImportError:
    print("Error: edge-tts not installed. Run: pip install edge-tts")
    sys.exit(1)


async def get_audio_duration(audio_file: Path) -> int:
    """Get duration of audio file in milliseconds using ffprobe if available."""
    import subprocess
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
    # Fallback: estimate 150ms per word
    return None


async def generate_element_audio(
    element: Dict,
    voice: str,
    emphasis: Dict,
    output_path: Path
) -> Optional[int]:
    """Generate audio for a single narration element."""
    text = element['narration_text']
    element_id = element['id']

    # Build SSML with prosody
    rate = emphasis.get('rate', '+0%')
    pitch = emphasis.get('pitch', '+0Hz')

    ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="{voice}">
        <prosody rate="{rate}" pitch="{pitch}">
            {text}
        </prosody>
    </voice>
</speak>"""

    output_file = output_path / f"{element_id}.mp3"

    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_file))

        # Get duration
        duration_ms = await get_audio_duration(output_file)
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

    voice = narration.get('voice', 'en-US-AriaNeural')
    emphasis_profiles = narration.get('emphasis_by_element_type', {})
    prosody_defaults = narration.get('prosody_defaults', {'rate': '+0%', 'pitch': '+0Hz'})

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"Generating narration with voice: {voice}")
    print(f"Output directory: {output_path}")

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
                element, voice, emphasis, output_path
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
        'output_directory': str(output_path)
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


def list_voices():
    """List available Edge-TTS voices."""
    async def _list():
        voices = await edge_tts.list_voices()
        print("\nAvailable Edge-TTS voices (English):\n")
        for v in voices:
            if v['Locale'].startswith('en'):
                print(f"  {v['ShortName']:30} {v['Gender']:8} {v['Locale']}")

    asyncio.run(_list())


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nCommands:")
        print("  python narration_generator.py <brief.json> <output_dir>")
        print("  python narration_generator.py --list-voices")
        sys.exit(1)

    if sys.argv[1] == '--list-voices':
        list_voices()
    else:
        if len(sys.argv) < 3:
            print("Error: Missing output directory")
            print("Usage: python narration_generator.py <brief.json> <output_dir>")
            sys.exit(1)

        asyncio.run(generate_narration(sys.argv[1], sys.argv[2]))

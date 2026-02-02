#!/usr/bin/env python3
"""
AudioSculpt MIDI-to-Events Parser
Converts a MIDI file into a JSON array of note events for Tone.js scheduling.

Usage:
    python midi2events.py input.mid                    # prints JSON to stdout
    python midi2events.py input.mid --output events.json  # writes to file

Output format:
[
  {"time": 0.0, "track": 0, "channel": 0, "note": "C4", "duration": 0.5, "velocity": 80},
  {"time": 0.5, "track": 1, "channel": 1, "note": "A2", "duration": 1.0, "velocity": 64},
  ...
]
"""

import argparse
import json
import sys

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def midi_note_to_name(midi_number: int) -> str:
    """Convert MIDI note number (0-127) to note name like 'C4'."""
    octave = (midi_number // 12) - 1
    note = NOTE_NAMES[midi_number % 12]
    return f"{note}{octave}"


def parse_midi(midi_path: str) -> list[dict]:
    """Parse a MIDI file into a list of note events."""
    try:
        from symusic import Score
    except ImportError:
        print("symusic not installed. Run: bash engine/setup.sh", file=sys.stderr)
        sys.exit(1)

    score = Score(midi_path)
    events = []

    for track_idx, track in enumerate(score.tracks):
        for note in track.notes:
            events.append({
                "time": round(score.ticks_to_seconds(note.start), 4),
                "track": track_idx,
                "channel": track.program if hasattr(track, "program") else 0,
                "note": midi_note_to_name(note.pitch),
                "duration": round(score.ticks_to_seconds(note.end) - score.ticks_to_seconds(note.start), 4),
                "velocity": note.velocity,
            })

    # Sort by time, then track
    events.sort(key=lambda e: (e["time"], e["track"]))
    return events


def main():
    parser = argparse.ArgumentParser(description="Convert MIDI to JSON note events")
    parser.add_argument("midi_file", help="Input .mid file path")
    parser.add_argument("--output", "-o", help="Output .json file (default: stdout)")
    args = parser.parse_args()

    events = parse_midi(args.midi_file)

    output = json.dumps(events, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Wrote {len(events)} events to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()

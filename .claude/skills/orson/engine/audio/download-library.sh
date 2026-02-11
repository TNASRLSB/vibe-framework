#!/usr/bin/env bash
# download-library.sh — Download initial CC0 audio library for Orson
# Sources: Pixabay Audio (CC0 / Pixabay License)
#
# Usage: bash download-library.sh
#
# This script downloads a starter set of royalty-free tracks and SFX.
# All tracks are CC0 or Pixabay License (free for commercial use, no attribution required).
#
# To add your own tracks, place MP3 files in tracks/ or sfx/ and update
# presets/audio-library.json accordingly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKS_DIR="$SCRIPT_DIR/tracks"
SFX_DIR="$SCRIPT_DIR/sfx"

mkdir -p "$TRACKS_DIR" "$SFX_DIR"

echo "Orson Audio Library Setup"
echo "========================="
echo ""

# Check if tracks already exist
EXISTING=$(find "$TRACKS_DIR" -name "*.mp3" 2>/dev/null | wc -l)
if [ "$EXISTING" -gt 0 ]; then
  echo "Found $EXISTING existing tracks in $TRACKS_DIR"
  echo "To re-download, remove existing files first."
  echo ""
fi

# Check for required tools
if ! command -v curl &> /dev/null; then
  echo "Error: curl is required but not installed."
  exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
  echo "Warning: ffmpeg not found. Audio processing features will not work."
  echo "Install with: sudo pacman -S ffmpeg (Arch) or sudo apt install ffmpeg (Debian)"
  echo ""
fi

echo "Audio tracks must be added manually due to licensing requirements."
echo ""
echo "Recommended free sources (CC0 / royalty-free):"
echo "  - Pixabay Audio:     https://pixabay.com/music/"
echo "  - Free Music Archive: https://freemusicarchive.org/"
echo "  - Mixkit:            https://mixkit.co/free-stock-music/"
echo "  - Uppbeat:           https://uppbeat.io/"
echo ""
echo "Download tracks matching these styles and place them in:"
echo "  Music: $TRACKS_DIR/{style}-{number}.mp3"
echo "  SFX:   $SFX_DIR/{type}.mp3"
echo ""
echo "Required tracks (by style, 2 each):"
echo "  - ambient    (60-80 BPM, calm, atmospheric)"
echo "  - corporate  (80-100 BPM, professional, clean)"
echo "  - electronic (110-128 BPM, tech, modern)"
echo "  - cinematic  (60-90 BPM, epic, building)"
echo "  - lo-fi      (70-85 BPM, chill, warm)"
echo "  - upbeat     (120-140 BPM, happy, energetic)"
echo ""
echo "Required SFX (1 each):"
echo "  - click.mp3      (UI click, ~80ms)"
echo "  - whoosh.mp3     (transition whoosh, ~300ms)"
echo "  - typing.mp3     (keyboard typing loop, ~2s)"
echo "  - success.mp3    (success chime, ~500ms)"
echo "  - transition.mp3 (scene transition, ~400ms)"
echo ""
echo "After adding tracks, update presets/audio-library.json with metadata."
echo ""

# Generate placeholder silence files so the system doesn't error on missing files
echo "Generating silent placeholder files..."

generate_silence() {
  local output="$1"
  local duration="$2"
  if [ ! -f "$output" ]; then
    if command -v ffmpeg &> /dev/null; then
      ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t "$duration" -q:a 9 "$output" -loglevel error 2>/dev/null
      echo "  Created placeholder: $(basename "$output") (${duration}s silence)"
    fi
  fi
}

# Music placeholders (silence)
for style in ambient corporate electronic cinematic lofi upbeat; do
  for num in 01 02; do
    generate_silence "$TRACKS_DIR/${style}-${num}.mp3" "90"
  done
done

# SFX placeholders (short silence)
generate_silence "$SFX_DIR/click.mp3" "0.08"
generate_silence "$SFX_DIR/whoosh.mp3" "0.3"
generate_silence "$SFX_DIR/typing.mp3" "2"
generate_silence "$SFX_DIR/success.mp3" "0.5"
generate_silence "$SFX_DIR/transition.mp3" "0.4"

echo ""
echo "Setup complete. Replace placeholder files with real audio for production use."
echo "See $TRACKS_DIR/README.md for details."

#!/usr/bin/env bash
# download-library.sh — Download CC0 audio library for Orson
# Sources: Mixkit (free, no attribution required)
#
# Usage: bash download-library.sh
#
# Downloads royalty-free tracks from Mixkit. Falls back to silence
# placeholders if download fails (offline, URL changed, etc).
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

# ─── Helpers ──────────────────────────────────────────────────

is_silence() {
  local file="$1"
  if command -v ffmpeg &> /dev/null; then
    local vol
    vol=$(ffmpeg -i "$file" -af volumedetect -f null /dev/null 2>&1 | grep 'mean_volume:' | awk '{print $5}')
    # -91 dB = silence placeholder
    if [ -n "$vol" ] && (( $(echo "$vol < -85" | bc -l 2>/dev/null || echo 1) )); then
      return 0
    fi
  fi
  return 1
}

generate_silence() {
  local output="$1"
  local duration="$2"
  if command -v ffmpeg &> /dev/null; then
    ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t "$duration" -q:a 9 "$output" -loglevel error 2>/dev/null
  fi
}

download_track() {
  local output="$1"
  local url="$2"
  local name="$3"
  local max_retries=3

  # Skip if file exists and is real audio (not silence)
  if [ -f "$output" ] && ! is_silence "$output"; then
    echo "  OK: $(basename "$output") (existing)"
    return 0
  fi

  echo "  Downloading $name..."
  for attempt in $(seq 1 $max_retries); do
    if curl -sL --max-time 30 --retry 2 -o "$output" "$url" && [ -s "$output" ]; then
      # Validate downloaded file is real audio (> 10KB)
      local filesize
      filesize=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null || echo 0)
      if [ "$filesize" -gt 10240 ]; then
        echo "  OK: $(basename "$output")"
        return 0
      else
        echo "  Warning: $(basename "$output") too small (${filesize}B), retrying..."
        rm -f "$output"
      fi
    fi
    if [ "$attempt" -lt "$max_retries" ]; then
      echo "  Retry $((attempt + 1))/$max_retries..."
      sleep 2
    fi
  done

  echo "  Failed: $(basename "$output") after $max_retries attempts — creating silence placeholder"
  generate_silence "$output" "90"
  return 1
}

# ─── Music Tracks ────────────────────────────────────────────

echo "Downloading music tracks..."

# Mixkit CC0 tracks (free, no attribution required)
download_track "$TRACKS_DIR/corporate-01.mp3" "https://assets.mixkit.co/music/34/34.mp3" "Corporate - Raising Me Higher"
download_track "$TRACKS_DIR/corporate-02.mp3" "https://assets.mixkit.co/music/292/292.mp3" "Corporate - Relax Beat"
download_track "$TRACKS_DIR/ambient-01.mp3" "https://assets.mixkit.co/music/382/382.mp3" "Ambient - Meditation"
download_track "$TRACKS_DIR/ambient-02.mp3" "https://assets.mixkit.co/music/749/749.mp3" "Ambient - Relaxation"
download_track "$TRACKS_DIR/upbeat-01.mp3" "https://assets.mixkit.co/music/33/33.mp3" "Upbeat - Motivating Mornings"
download_track "$TRACKS_DIR/upbeat-02.mp3" "https://assets.mixkit.co/music/77/77.mp3" "Upbeat - Running Out of Time"

echo ""

# Copy for styles without dedicated tracks yet
echo "Setting up remaining styles..."
for track in electronic-01 electronic-02 cinematic-01 cinematic-02 lofi-01 lofi-02; do
  if [ ! -f "$TRACKS_DIR/$track.mp3" ] || is_silence "$TRACKS_DIR/$track.mp3"; then
    # Map to a reasonable source track
    case "$track" in
      electronic-*) src="corporate-01.mp3" ;;
      cinematic-*)  src="ambient-01.mp3" ;;
      lofi-*)       src="ambient-02.mp3" ;;
      *)            src="corporate-01.mp3" ;;
    esac
    if [ -f "$TRACKS_DIR/$src" ]; then
      cp "$TRACKS_DIR/$src" "$TRACKS_DIR/$track.mp3"
      echo "  Copied $src -> $track.mp3 (replace with dedicated track when available)"
    fi
  fi
done

echo ""

# ─── SFX ─────────────────────────────────────────────────────

echo "Setting up SFX placeholders..."

for sfx_spec in "click.mp3:0.08" "whoosh.mp3:0.3" "typing.mp3:2" "success.mp3:0.5" "transition.mp3:0.4"; do
  sfx_name="${sfx_spec%%:*}"
  sfx_dur="${sfx_spec##*:}"
  if [ ! -f "$SFX_DIR/$sfx_name" ]; then
    generate_silence "$SFX_DIR/$sfx_name" "$sfx_dur"
    echo "  Created placeholder: $sfx_name (${sfx_dur}s — replace with real SFX)"
  else
    echo "  OK: $sfx_name (existing)"
  fi
done

echo ""
echo "Setup complete."
echo ""
echo "To add custom tracks, place MP3 files in:"
echo "  Music: $TRACKS_DIR/{style}-{number}.mp3"
echo "  SFX:   $SFX_DIR/{type}.mp3"
echo "Then update presets/audio-library.json with metadata."

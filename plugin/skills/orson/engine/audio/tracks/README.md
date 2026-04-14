# Audio Tracks

This directory contains background music tracks used by Orson's audio system.

## Setup

Run the download script to fetch the initial CC0 track library:

```bash
bash ../download-library.sh
```

## Adding Custom Tracks

1. Place MP3 files in this directory (for music) or `../sfx/` (for sound effects)
2. Update `../presets/audio-library.json` with the new track metadata
3. Required fields: `id`, `file`, `style`, `bpm`, `energy`, `durationMs`, `tags`, `loopable`

## Naming Convention

- Music: `{style}-{number}.mp3` (e.g., `ambient-01.mp3`, `corporate-02.mp3`)
- SFX: `{type}.mp3` (e.g., `click.mp3`, `whoosh.mp3`)

## Supported Styles

ambient, corporate, electronic, cinematic, lo-fi, upbeat, acoustic, dramatic, trap, synthwave, orchestral, minimal-techno, jazz, world, glitch, neo-classical, dnb, chillwave, industrial, horror

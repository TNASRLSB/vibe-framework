# Orson Rendering Pipeline Reference

## Overview

The rendering pipeline flows:

```
HTML File -> Playwright (frame capture) -> FFmpeg (encode) -> Audio Processing -> Final Video
```

---

## Playwright Frame Capture

### Architecture (v3 Frame-Addressed)

The capture system (`capture.ts`) uses a simple loop:

1. Launch headless Chromium via Playwright
2. Set `__VIDEO_RENDER__ = true` via `addInitScript` (prevents preview controller from executing)
3. Load the HTML file via `file://` protocol
4. Wait for `__frameRendererReady === true` (runtime initialization)
5. For each frame 0..totalFrames:
   - Call `page.evaluate(() => __setFrame(n))` -- runtime handles all animation state
   - Sync any PiP video elements to current timestamp
   - Take screenshot (PNG default, JPEG for draft mode)
   - Write buffer to FFmpeg stdin pipe

### Capture Session

```typescript
interface CaptureOptions {
  width: number;      // viewport width
  height: number;     // viewport height
  fps: number;        // frames per second
  totalFrames: number;
  htmlPath: string;   // absolute path to HTML file
  captureFormat?: 'png' | 'jpeg';  // png = lossless, jpeg = ~2x faster
}
```

### Key Design Decisions

- **No CSS animation time control**: The `__setFrame(n)` model avoids all CSS animation timing issues. The runtime pauses CSS animations and manually sets `currentTime` per frame.
- **DeviceScaleFactor = 1**: Consistent pixel output regardless of display.
- **100ms settle time**: After page load, allows fonts/styles to resolve before capture begins.

---

## FFmpeg Encoding

### Pipe Encoding (`encode.ts`)

Frames are piped directly to FFmpeg stdin as raw image data -- no intermediate frame files for sequential rendering.

```typescript
interface EncodeOptions {
  fps: number;
  codec: CodecId;          // 'h264' | 'h265' | 'av1'
  outputPath: string;
  inputFormat?: 'png' | 'jpeg';
  useHardwareAccel?: boolean;  // default: true
  codecOverride?: CodecPreset; // used by --draft mode
}
```

### FFmpeg Command Structure

```
ffmpeg -y -f image2pipe [-c:v mjpeg] -framerate {fps} -i -
  -c:v {encoder} -pix_fmt yuv420p
  [-preset {preset}] [-crf {crf}]
  [{extraArgs}]
  {output.mp4}
```

For hardware encoders, `-preset` and `-crf` are stripped (HW encoders use their own quality params).

### Codec Presets

| Codec | Encoder | Preset | CRF | Extra Args |
|-------|---------|--------|-----|------------|
| h264 | libx264 | medium | 18 | -- |
| h265 | libx265 | medium | 22 | `-tag:v hvc1` |
| av1 | libsvtav1 | medium | 30 | -- |

### Hardware Acceleration

Auto-detected by probing `ffmpeg -encoders`:

| Platform | Encoder | Quality Params |
|----------|---------|---------------|
| NVIDIA | h264_nvenc | `-rc constqp -qp 18 -b:v 0` |
| Linux/VAAPI | h264_vaapi | `-vaapi_device /dev/dri/renderD128 -qp 18` |
| macOS | h264_videotoolbox | `-q:v 65` |

HW accel is only used for h264, disabled for draft mode and parallel chunk rendering (software is more reliable for segments).

### Draft Mode

`--draft` flag overrides:
- Resolution: halved (e.g. 1920x1080 -> 960x540)
- FPS: 15 (half frame count)
- Codec: libx264 ultrafast, CRF 28
- Capture format: JPEG (faster capture)
- Result: ~4-8x faster than full quality

---

## Parallel Rendering

### Architecture (`parallel-render.ts`)

Splits total frames into N equal chunks, renders each in a separate Playwright + FFmpeg instance, then concatenates with FFmpeg concat demuxer.

### Worker Count

Computed from system resources:
- `maxWorkers = min(floor(cpuCount / 2), 4)` -- uses half of CPUs, max 4
- `minFramesPerWorker = 30` -- below this threshold, sequential is faster
- If computed workerCount <= 1, falls back to sequential rendering

### Chunk-Based (v4)

Chunks are frame ranges, not scene-based. Works with any video including single-scene.

```typescript
function buildFrameChunks(totalFrames: number, workerCount: number): FrameChunk[]
// Each chunk: { workerId, startFrame, endFrame }
```

### Rendering Process

1. Compute chunks from total frames
2. For each chunk (in parallel):
   - Init Playwright session
   - Init FFmpeg encoder (software only for reliability)
   - Capture frames using `__setFrame(globalFrame)` -- uses global frame numbers, not chunk-local
   - Close Playwright and FFmpeg
3. Concatenate chunk videos via FFmpeg concat demuxer
4. Clean up temporary directory

### Concat Demuxer

```bash
ffmpeg -y -f concat -safe 0 -i concat-list.txt -c copy output.mp4
```

The concat list is a text file with `file 'path/to/chunk-000.mp4'` per line.

---

## Preview Mode

`--preview` flag serves the video HTML with an injected playback controller:

- Fixed overlay bar at bottom with play/pause, frame scrubber, speed selector
- Frame stepping with arrow keys (Shift = 10 frames)
- Spacebar for play/pause
- Speed: 0.25x, 0.5x, 1x, 2x
- HTTP server on port 9876
- Auto-opens browser

The preview calls `__setFrame(n)` in a `requestAnimationFrame` loop at the configured speed.

---

## Batch Rendering

`batch <config.json>` renders multiple variants from a template.

The batch config specifies:
- Template HTML path
- Variable substitutions per variant
- Output paths per variant

Each variant is rendered sequentially using the standard `renderHTML()` pipeline.

---

## Demo Recording Pipeline

The demo capture (`demo-capture.ts`) is a specialized pipeline:

1. **Frame directory capture**: Screenshots saved as numbered PNG files (not piped to FFmpeg)
2. **Action execution**: Real Playwright actions (click, fill, hover, scroll) executed at timeline-defined timestamps
3. **Visual overlays**: Cursor, zoom, highlights injected via DOM manipulation
4. **Post-capture encoding**: `ffmpeg -framerate {fps} -i frames/frame-%06d.png` to video
5. **Audio merge**: Final step combines video + mixed audio

Frame files are used instead of pipe because actions can cause variable-time delays (page navigation, animations settling, etc.).

---

## Subtitle Generation

### Standard Videos (`subtitles.ts`)

Generates from scene timings:
- **SRT**: Sequential numbered entries with `HH:MM:SS,mmm --> HH:MM:SS,mmm`
- **VTT**: WebVTT format with `HH:MM:SS.mmm --> HH:MM:SS.mmm`

Text is combined from scene element texts joined with " -- ".

### Demo Videos (`demo-subtitles.ts`)

Generates WebVTT from timeline step narration text and narration start/end timestamps.

---

## Performance Characteristics

### Sequential Rendering

- Capture: ~10-30 fps depending on scene complexity
- Bottleneck: Playwright screenshot speed
- JPEG capture is ~2x faster than PNG

### Parallel Rendering

- Near-linear speedup up to 4 workers
- Overhead: Playwright launch per worker + concat step
- Not worth it for < 120 frames (4s at 30fps)

### Typical Render Times (30fps, 1080x1920)

| Duration | Frames | Sequential | Parallel (4x) |
|----------|--------|-----------|----------------|
| 15s | 450 | ~30s | ~10s |
| 30s | 900 | ~60s | ~20s |
| 60s | 1800 | ~120s | ~40s |

Draft mode (~4x faster): divide above by 4.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Black frames | `__setFrame` not defined | Ensure runtime script is embedded |
| Missing fonts | System fonts not available in Playwright | Use web fonts or install system fonts |
| FFmpeg not found | Not in PATH | Install FFmpeg: `sudo pacman -S ffmpeg` |
| Audio merge fails | No audio tracks downloaded | Run `bash audio/download-library.sh` |
| Parallel render hangs | Too many Playwright instances | Reduce worker count, check memory |
| VAAPI errors | GPU driver issue | Set `useHardwareAccel: false` |
| Preview blank | HTML file has errors | Check browser console in preview mode |

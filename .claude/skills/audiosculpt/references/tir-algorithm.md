## Building the TIR (Timeline Intermediate Representation)

The TIR is the **single source of truth** for all timing in audiosculpt. Build it before any audio generation.

### Algorithm

```
Input: HTML of the webvideo
Output: TIR — sorted array of timed events

1. PARSE <!-- @video ... --> comment in <head>
   → extract: mode, speed, format

2. PARSE all <!-- @scene ... --> comments
   → for each: extract name, durationMs, transitionOut, transitionDurationMs
   → compute startMs cumulatively:
     scenes[0].startMs = 0
     scenes[i].startMs = scenes[i-1].startMs + scenes[i-1].durationMs

3. COMPUTE total duration:
   totalMs = last scene startMs + last scene durationMs

4. FOR each scene div (id="s0", "s1", ... or "scene-0", "scene-1", ...):
   FOR each .el element inside:
     a. PARSE style="animation: <name> <duration> <easing> <delay> <fill>"
     b. CLASSIFY element type from CSS classes
     c. CLASSIFY animation energy (0.4-0.85)
     d. ADD event to TIR

5. ADD scene-transition events at each scene boundary

6. SORT TIR by timeMs ascending

7. MAP each event to arc phase:
   - 0% to 20% of totalMs → "intro"
   - 20% to 60% → "build"
   - 60% to 80% → "climax"
   - 80% to 100% → "resolve"
```

### TIR Output Format

```json
[
  {"timeMs": 300,   "type": "element-appear",    "energy": 0.85, "scene": 0, "anim": "glitch-in",  "phase": "intro"},
  {"timeMs": 1200,  "type": "text-typing",       "energy": 0.4,  "scene": 0, "anim": "fade-in",    "phase": "intro"},
  {"timeMs": 2500,  "type": "scene-transition",   "energy": 1.0,  "scene": 1, "anim": "glitch",     "phase": "intro"}
]
```

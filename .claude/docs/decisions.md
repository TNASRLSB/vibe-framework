# Architectural Decisions

**Why things are the way they are.**

When I make a choice that affects future work, I record it here. This prevents me from proposing contradictory approaches later.

---

## Format

```markdown
### [Short title]
**Date:** YYYY-MM-DD
**Decision:** What was decided
**Why:** Why this over alternatives
**Affects:** What this impacts going forward
```

---

## Decisions

### Orson v5: Direct HTML instead of autogen
**Date:** 2026-02-14
**Decision:** Remove the autogen layer (content JSON → heuristic HTML generation) and let Claude write video HTML directly
**Why:** The autogen pipeline (director, composition, choreography, layout-profiles, html-generator, frame-renderer, timeline) produced mediocre HTML with recurring bugs (text overlap, overflow, duplicated content). Claude writing HTML directly produces qualitatively superior output with far less code. The rendering infrastructure (Playwright capture, FFmpeg encoding, audio, parallel render) remains intact.
**Affects:** `/orson create` now has Claude write HTML in Phase 3 instead of running autogen CLI. 13 source files removed (~60% of engine code). Animation runtime provided as inline JS string via `runtime.ts`. CSS component patterns in `references/components.md`.

### Orson v5.2: Single normalization pass, research-backed voice presets
**Date:** 2026-02-15
**Decision:** (1) Remove per-element normalization in `narration_generator.py` (-16 LUFS), keep only final normalization in `audio-mixer.ts` (-14 LUFS). (2) Add research-backed voice presets with WPM speech rate control.
**Why:** Double normalization caused inconsistent volume. Research (Rodero 2016, Nass 1997, Dou 2022) shows voice characteristics (pitch, style, rate) matter more than arbitrary voice selection. Presets encode this knowledge.
**Affects:** All audio output goes through a single -14 LUFS normalization. Voice selection via presets in both `/orson create` (Step 1.5) and `/orson demo` (`voicePreset` field). `narration_generator.py` accepts `--wpm` for speech rate control. TTS has retry+backoff, FFmpeg has 120s timeout.

---

*When I'm about to make an architectural choice, I check here first to stay consistent.*

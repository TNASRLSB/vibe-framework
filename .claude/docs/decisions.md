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

### Audiosculpt deprecated, audio migrated to Orson
**Date:** 2026-02-11
**Decision:** Deprecate Audiosculpt as a standalone skill. Migrate TTS narration, voice presets, emphasis profiles, coherence matrix, templates, and reference docs into Orson's `engine/audio/`. Replace Strudel (pattern-based music generation) with a curated audio library + FFmpeg processing pipeline.
**Why:** Strudel-based music generation was too complex as a prompt for Claude Code and produced inconsistent results. The curated library + FFmpeg approach is simpler, more reliable, and produces professional output. TTS narration (Edge-TTS) works well and is preserved as-is.
**Affects:** Audio is now an internal Orson module, not a separate skill. `/orson create` produces videos with audio automatically. New `/orson demo` command uses the audio system for narration + background music.

### Demo mode added to Orson
**Date:** 2026-02-11
**Decision:** Add `/orson demo` command that records live website demos using Playwright, with narration, zoom, cursor animation, and background music. Uses JSON script format (not YAML). Narration-first timeline algorithm.
**Why:** Enables recording product demos programmatically. JSON chosen for consistency with the rest of Orson. Narration-first timing ensures audio drives visual pacing.
**Affects:** Orson is now both a video generator (HTML-based) and a demo recorder (Playwright-based). Five new TypeScript modules added to engine/src/.

---

*When I'm about to make an architectural choice, I check here first to stay consistent.*

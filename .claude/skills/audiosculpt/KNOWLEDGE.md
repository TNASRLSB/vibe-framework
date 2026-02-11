# Audiosculpt — Domain Knowledge

This file contains music theory and Strudel reference material for educational purposes. Claude already has this knowledge — it's preserved here for human reference.

## Strudel Mini-Notation Reference

| Syntax | Meaning | Example |
|--------|---------|---------|
| `t` | Trigger/hit | `s('bd').struct('t ~ ~ ~')` |
| `~` | Rest/silence | `~ ~ t ~` = hits on beat 3 |
| `<>` | Sequence alternation | `<c4 e4 g4>` = cycle through |
| `[]` | Grouping | `[c4 e4]` = subdivide |
| `*n` | Speed up n times | `t*4` = 4 hits |
| `/n` | Slow down n times | `t/2` = half speed |
| `(k,n)` | Euclidean rhythm | `(3,8)` = 3 hits over 8 steps |

## Strudel Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `s('name')` | Sound/sample | `s('bd')`, `s('RolandTR808_hh')` |
| `note('x')` | Note pitch | `note('c4')`, `note('<c4 e4 g4>')` |
| `chord('X')` | Chord | `chord('Am7')`, `chord('<Am C F G>')` |
| `.voicing()` | Auto voice | `chord('Am7').voicing()` |
| `.struct('pat')` | Rhythm structure | `.struct('t ~ t ~')` |
| `.gain(n)` | Volume 0-1 | `.gain(0.7)` |
| `.room(n)` | Reverb 0-1 | `.room(0.4)` |
| `.lpf(hz)` | Low-pass filter | `.lpf(800)` |
| `.hpf(hz)` | High-pass filter | `.hpf(2000)` |
| `.delay(n)` | Delay amount | `.delay(0.3)` |
| `.fm(n)` | FM modulation index | `.fm(1.5)` |
| `.fmh(n)` | FM harmonicity | `.fmh(0.25)` |
| `.slow(n)` | Stretch pattern | `.slow(4)` |
| `.fast(n)` | Speed up pattern | `.fast(2)` |
| `stack(a,b,c)` | Layer patterns | `stack(drums, bass, pad)` |
| `sine.range(a,b)` | LFO oscillation | `gain(sine.range(0.4,0.7))` |
| `perlin.range(a,b)` | Noise modulation | `gain(perlin.range(0.3,0.6))` |

## Voice Leading Rules

### Universal (all families)

- **No voice crossing**: No voice may cross above/below its adjacent voice
- **Max octave spacing**: Max one octave between adjacent voices
- **Stepwise motion**: Between chords, voices move by step where possible

### Family: tonal

- **Parallel fifths/octaves forbidden**
- **Contrary motion between extremes**
- **Dominant 7th preparation and resolution**

### Family: loop

- **Parallel fifths permitted** (power chords are idiomatic)
- Apply only: no voice crossing + max octave spacing

### Family: modal

- **No voice crossing** (for spatial clarity in reverb-heavy textures)
- No obligation for contrary motion

### Family: experimental

- **Spacing for spectral clarity only** — all other rules violable

## Functional Harmony

**Applies to: family tonal only.**

- Every chord must have a declared function: **T**, **SD**, **D**, or special label
- Every tonal progression must end with a formal cadence
- Non-diatonic chords must be annotated

### Harmonic system types

| Type | Families | Description |
|------|----------|-------------|
| `functional_tonal` | tonal | Functions (T/SD/D) + cadences |
| `modal_static` | modal | Static harmonic field |
| `timbral_vector` | loop | Filter sweeps, not chord changes |
| `atonal_cluster` | experimental | Noise bands, non-harmonic |

## Form and Phrasing

### periodo_tematico (family: tonal)

- **Antecedent**: phrase ending on half cadence
- **Consequent**: phrase ending on authentic cadence
- **Development**: sequence, inversion, augmentation

### drop_structure (family: loop)

- Intro → build → drop → breakdown → drop
- Tension/release is rhythmic, not harmonic

### processuale (family: modal)

- Gradual timbral evolution
- "Phrase" = timbral gesture (filter opening)

### atematico (family: experimental)

- No thematic structure
- Organization by density/rarefaction

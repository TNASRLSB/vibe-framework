# Orson v5.2: Voice Intelligence + Audio Robustness

**Status:** DONE
**Date:** 2026-02-15
**Type:** Feature + Bug fix

---

## Cosa

Sistema di selezione voce intelligente per **tutto Orson** (`/orson create` e `/orson demo`) basato su ricerca peer-reviewed, più fix di robustezza della pipeline audio.

Scope precedente (solo demo mode) esteso: la voce narrante è parte integrante anche dei video promo, explainer, e tutorial generati con `/orson create`.

---

## Perché

**Voce**: La ricerca (voce-narrante.md, analisi critica verificata) mostra che:
- Le caratteristiche acustiche (pitch, rate, modulazione) predicono l'efficacia meglio del genere binario (Zoghaib 2019, peer-reviewed)
- Il pitch medio è universalmente preferito rispetto agli estremi (Rodero 2022, peer-reviewed)
- Lo speech rate ottimale per contenuti informativi è 170-190 WPM (Rodero 2016, *Media Psychology*); comprensione regge fino a 2x speed ma degrada oltre (Murphy & Castel 2022, *Applied Cognitive Psychology*)
- Warmth vs Competence sono dimensioni separate: F=warmth, M=competenza (Nass 1997, Dou 2022 — 30 anni di evidenza)
- Per explainer video specificamente, voce femminile percepita come più trustworthy (CXL/Labay, n=202, industry research non peer-reviewed)

**Robustezza**: Inconsistenze audio (doppia normalizzazione, ducking parameters disallineati), TTS senza retry, FFmpeg senza timeout, fallimenti silenti.

---

## Cosa tocco

| File | Azione |
|------|--------|
| `engine/audio/narration_generator.py` | Fix ducking params, remove doppia normalizzazione, add retry TTS |
| `engine/audio/engines/edge_tts_engine.py` | Add retry con backoff, timeout |
| `engine/src/audio-mixer.ts` | Fix loudness target consistency, add FFmpeg timeout |
| `engine/src/demo-capture.ts` | Add error recovery, retry overlay injection, structured logging |
| `engine/src/demo-director.ts` | Add null safety, try-catch Playwright evaluate |
| `engine/src/demo-subtitles.ts` | Add word-wrap, validation bounds |
| `engine/src/demo-script.ts` | Add `voicePreset` field |
| `engine/src/html-parser.ts` | Add `voicePreset` support per `/orson create` narration brief |
| `engine/audio/presets/voice-presets.json` | NEW — preset voce per contesto |
| `SKILL.md` | Add Step 1.5 "Voice", update audio docs |
| `KNOWLEDGE.md` | Update reference |

---

## Piano di implementazione

### 1. Fix inconsistenze audio (bug fix critico)

**1a. Unificare loudness normalization**
- `narration_generator.py`: rimuovere `normalize_audio()` (-16 LUFS)
- Lasciare solo `audio-mixer.ts` → `normalizeLoudness()` a -14 LUFS (standard YouTube/web)
- Risultato: un solo passaggio di normalizzazione, volume finale corretto

**1b. Allineare parametri ducking**
- `narration_generator.py:calculate_ducking()`: leggere `attack_ms` e `release_ms` dal brief invece di hardcoded (50ms/200ms)
- Valori default: attack=300ms, release=500ms (coerenti con `demo-capture.ts`)
- `audio-mixer.ts:applyDucking()`: parametrizzare fade in/out (attualmente hardcoded 0.3s/0.5s)

### 2. Error recovery e retry

**2a. TTS retry con exponential backoff**
- `edge_tts_engine.py:generate()`: retry 3 volte con backoff (1s, 2s, 4s)
- Timeout per singola generazione: 30s
- Se tutti i retry falliscono: log strutturato + usa estimazione durata

**2b. FFmpeg timeout**
- `audio-mixer.ts`: aggiungere timeout 120s a tutti gli spawn FFmpeg
- Se timeout: kill processo, log errore, raise exception chiara

**2c. Demo capture error recovery**
- `demo-capture.ts:recordDemo()`: wrap executeAction in try-catch
  - Se azione fallisce: log warning, continua registrazione (non crash)
  - Se overlay injection fallisce dopo navigazione: retry 2 volte con delay 500ms
- `demo-director.ts`: aggiungere try-catch a tutte le `page.evaluate()` calls

### 3. Voice preset system (tutto Orson)

**3a. Nuovo file `voice-presets.json`**

Preset basati su ricerca peer-reviewed verificata. Ogni preset specifica voce, prosody, e speech rate target.

```json
{
  "presets": {
    "tech-demo": {
      "voice": "en-US-GuyNeural",
      "style": "neutral",
      "wpm": 150,
      "prosody": { "rate": "-10%", "pitch": "+0Hz" },
      "rationale": "Male mid-pitch → perceived competence (Nass 1997, Dou 2022). 150 WPM: balanced for technical content."
    },
    "explainer": {
      "voice": "en-US-AriaNeural",
      "style": "neutral",
      "wpm": 140,
      "prosody": { "rate": "-12%", "pitch": "+0Hz" },
      "rationale": "Female → perceived trustworthiness in explainer video (CXL/Labay n=202). 140 WPM: standard explainer pace, allows complex content absorption."
    },
    "promo": {
      "voice": "en-US-AriaNeural",
      "style": "enthusiastic",
      "wpm": 160,
      "prosody": { "rate": "-5%", "pitch": "+2Hz" },
      "rationale": "Female enthusiastic → warmth + engagement (Reinares-Lara 2016). 160 WPM: upper comfortable range for energy (Rodero 2016)."
    },
    "tutorial": {
      "voice": "en-US-GuyNeural",
      "style": "calm",
      "wpm": 130,
      "prosody": { "rate": "-20%", "pitch": "-1Hz" },
      "rationale": "Male calm → authority without intimidation (Nass 1997). 130 WPM: slower pace for step-by-step comprehension."
    },
    "sales": {
      "voice": "en-US-GuyNeural",
      "style": "neutral",
      "wpm": 150,
      "prosody": { "rate": "-10%", "pitch": "+0Hz" },
      "rationale": "Male controlled pitch → sales performance (Du et al. 2022, IEEE). 150 WPM: balanced for persuasive content."
    },
    "onboarding": {
      "voice": "en-US-AriaNeural",
      "style": "calm",
      "wpm": 130,
      "prosody": { "rate": "-20%", "pitch": "-2Hz" },
      "rationale": "Female calm → empathy, anxiety reduction (convergenza studi healthcare). 130 WPM: slow for comfort."
    }
  },
  "locales": {
    "it-IT": {
      "tech-demo": { "voice": "it-IT-DiegoNeural" },
      "explainer": { "voice": "it-IT-ElsaNeural" },
      "promo": { "voice": "it-IT-ElsaNeural" },
      "tutorial": { "voice": "it-IT-DiegoNeural" },
      "sales": { "voice": "it-IT-DiegoNeural" },
      "onboarding": { "voice": "it-IT-IsabellaNeural" }
    }
  },
  "speechRateGuidelines": {
    "source": "Rodero 2016, Media Psychology; Murphy & Castel 2022, Applied Cognitive Psychology",
    "ranges": {
      "slow": { "wpm": 120, "use": "dramatic, emotional, complex technical" },
      "moderate": { "wpm": 140, "use": "explainer, tutorial, onboarding" },
      "natural": { "wpm": 160, "use": "promo, social media, energetic" },
      "fast": { "wpm": 180, "use": "ceiling — beyond this comprehension drops (Rodero 2016)" },
      "max-comprehension": { "wpm": 300, "use": "2x speed ceiling — retention degrades beyond (Murphy & Castel 2022)" }
    }
  }
}
```

**3b. Integrazione in `/orson create` — nuovo Step 1.5 "Voice"**

Aggiungere in SKILL.md Phase 1 (Pre-production), dopo Step 1.4:

```
#### Step 1.5: Voice

Ask the user about narration:

1. **Narration enabled?** — Yes (default) / No
2. **Voice preset** — Based on intent from Step 1.4:
   - Product launch → `promo`
   - Feature showcase → `tech-demo`
   - Social media promo → `promo`
   - Explainer → `explainer`
   - Tutorial teaser → `tutorial`
   - Portfolio / case study → `explainer`

   Suggest the preset but let the user override.

3. **Language** — Auto-detect from content, confirm with user.
   If non-English, use locale override from voice-presets.json.
```

Claude poi include il preset nella narration brief generata da `html-parser.ts:extractNarrationBrief()`.

**3c. Integrazione in `/orson demo` — schema update**

`demo-script.ts`:
- Aggiungere `voicePreset`: `z.enum(['tech-demo', 'explainer', 'promo', 'tutorial', 'sales', 'onboarding']).optional()`
- Se `voicePreset` specificato: sovrascrive `voice`, `narrationStyle`, prosody dal preset
- Se `voice` esplicito: ha priorità su preset (backward compatible)

`demo-capture.ts:runDemo()`:
- Prima di generare narration brief: se `voicePreset` presente, risolvere voce + prosody + wpm da `voice-presets.json`
- Passare wpm target a `narration_generator.py` come parametro

**3d. Locale-aware voice selection**
- Se `lang` specificato (es. `it-IT`): cerca override locale nel preset
- Fallback: voce default del preset (en-US)

**3e. Speech rate enforcement**
- `narration_generator.py`: accettare parametro `--wpm <N>` opzionale
- Convertire WPM target in prosody `rate` adjustment:
  - Baseline Edge-TTS: ~160 WPM a rate 0%
  - `rate = ((target_wpm / 160) - 1) * 100` → es. 130 WPM = `-19%`, 180 WPM = `+12%`
- Il rate dal preset ha priorità; se l'utente specifica `rate` esplicito, quello vince

### 4. Subtitle improvements

- Validazione: skip cue se narration è stringa vuota
- Word-wrap: split narration > 80 caratteri su più righe
- Cue position: supportare `subtitles.position` (`top` | `bottom` | `center`)

### 5. Structured logging

- Prefissi consistenti: `[demo]`, `[tts]`, `[audio]`, `[capture]`
- Warning espliciti per fallback: `[tts] WARN: generation failed for step 3, using 400ms/word estimate`
- Summary finale: step completati, warning count, fallback count

---

## Cosa NON tocco

- Pipeline video (Playwright capture, FFmpeg encoding) — funzionano
- Musica track selection — già ha fallback robusti
- Asset embedding — non pertinente
- Visual recipes / aesthetic system — già implementato in v5.1

---

## Verifica

1. **Test ducking consistency**: render con narrazione, verificare ducking smooth
2. **Test TTS retry**: simulare fallimento TTS (offline), verificare retry + fallback
3. **Test voice preset `/orson create`**: render explainer con `voicePreset: "explainer"` vs `voicePreset: "tech-demo"`, verificare voci diverse
4. **Test voice preset `/orson demo`**: demo script con `voicePreset: "tech-demo"`, verificare voce maschile
5. **Test locale**: render con `lang: "it-IT"` + preset, verificare voce italiana
6. **Test speech rate**: render a 130 WPM vs 160 WPM, verificare differenza percepibile
7. **Test error recovery**: demo con selector invalido, verificare recording continui
8. **Test subtitles**: VTT con narration >80 char, verificare line wrap

---

## Evidenza scientifica (fonti verificate)

| Finding | Fonte | Tipo | Affidabilità |
|---------|-------|------|-------------|
| Pitch > genere per efficacia vocale | Zoghaib 2019, *Recherche et Applications en Marketing* | Peer-reviewed | Alta |
| Pitch medio ottimale per competenza e piacevolezza | Rodero 2022, *Frontiers in Communication* | Peer-reviewed | Alta |
| Speech rate 170-190 WPM per contenuti informativi | Rodero 2016, *Media Psychology* | Peer-reviewed | Alta |
| Comprensione regge fino a 2x speed (300 WPM) | Murphy & Castel 2022, *Applied Cognitive Psychology* | Peer-reviewed | Alta |
| F=warmth, M=competenza (stereotipi applicati a macchine) | Nass, Moon & Green 1997, *J. Applied Social Psychology* | Peer-reviewed | Alta |
| F=warmth, M=competenza (robot sociali) | Dou et al. 2022, *Int. J. Social Robotics* | Peer-reviewed | Alta |
| Voce maschile pitch moderato → best sales performance | Du et al. 2022, *IEEE Int. Conference* | Peer-reviewed | Media |
| Voce femminile → più trustworthy per explainer video | CXL/Labay, n=202 | Industry research | Media |
| Modulazione pitch > pitch assoluto | Pisanski et al. 2018, *Proceedings Royal Society B* | Peer-reviewed | Alta (contesto diverso) |

---

## Ordine di lavoro

1. Fix inconsistenze audio (§1) — prerequisito per tutto il resto
2. Error recovery (§2) — prerequisito per test affidabili
3. Voice presets + speech rate (§3) — feature principale, tocca sia create che demo
4. Subtitle improvements (§4) — nice-to-have
5. Structured logging (§5) — in parallelo

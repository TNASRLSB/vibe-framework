# Orson Audit — 2026-02-14

Audit completo della skill Orson. Problemi trovati, fix applicate, issue aperte.

---

## 1. Audio — Fix applicate

### 1.1 Velocità narrazione troppo alta
- **Problema:** Fallback 150ms/word = 400 WPM (dovrebbe essere 150-160 WPM)
- **Causa:** Costante sbagliata in 3 file
- **Fix:** 150ms → 400ms/word in `narration_generator.py`, `demo-timeline.ts`, `edge_tts_engine.py`
- **Stato:** FIXATO

### 1.2 Volume musica troppo alto rispetto alla voce
- **Problema:** Music gain 1.0 vs narration gain 1.2 — ratio insufficiente
- **Causa:** Valori hardcoded in `index.ts`
- **Fix:** Music gain iniziale 1.0→0.35, narration boost 1.2→1.8
- **Stato:** FIXATO

### 1.3 Ducking inefficace
- **Problema:** Duck target 0.15 (troppo basso, musica sparisce), release 1.0 (troppo alto, salto violento), rampe troppo corte (50ms attack, 200ms release)
- **Causa:** Valori hardcoded in `index.ts`, `demo-capture.ts`, `narration_generator.py`
- **Fix:** Duck 0.12, release 0.35, attack 300ms, release 500ms — transizioni più morbide
- **Stato:** FIXATO

### 1.4 Profili prosodia Edge-TTS troppo veloci
- **Problema:** Stile "enthusiastic" accelerava (+5%), "neutral" invariato (+0%), default engine +0%
- **Causa:** Valori in `emphasis-profiles.json`, `edge_tts_engine.py`, `demo-script.ts`
- **Fix:** Tutti i rate rallentati di -10%, default engine -10%, profili hardcoded in demo-script.ts allineati
- **Stato:** FIXATO

### 1.5 FFmpeg `fadeInStart` negativo
- **Problema:** Se la prima duck region inizia prima di 300ms, `fadeInStart = startSec - 0.3` diventa negativo, producendo `t--0.200` non parsabile da FFmpeg
- **Causa:** Nessun clamp in `audio-mixer.ts`
- **Fix:** `Math.max(0, ...)` + ricalcolo durata fade proporzionale
- **Stato:** FIXATO

### 1.6 FFmpeg `max()` con 3+ argomenti
- **Problema:** FFmpeg `max()` accetta solo 2 argomenti. Con 3+ regioni di duck, l'espressione `max(a, b, c)` fallisce
- **Causa:** Costruzione espressione non annidata in `audio-mixer.ts`
- **Fix:** Annidamento iterativo `max(max(a, b), c)`
- **Stato:** FIXATO

---

## 2. Audio — Issue aperte

### 2.1 Narrazione assente nel path `render --narrate`
- **Problema:** Il path render usa `python3` di sistema via `execSync`, ma edge-tts è installato nel venv creato dal path `demo`. Il TTS fallisce silenziosamente, nessuna narrazione nel video finale.
- **File:** `index.ts` linee 335-346
- **Impatto:** Tutti i video promo con `--narrate` non hanno voce — solo musica
- **Fix:** Replicato meccanismo venv del path demo: auto-create venv, pip install edge-tts, usa venv python. Sostituito `execSync` con `spawn` async.
- **Stato:** FIXATO

### 2.2 Loudness finale non normalizzata
- **Problema:** Audio finale a -11.92 LUFS con true peak +0.20 dBTP (clipping). Target: -14 LUFS (YouTube) / -16 LUFS (broadcast), true peak -1.0 dBTP
- **File:** `audio-mixer.ts`, `index.ts`
- **Fix:** Aggiunta funzione `normalizeLoudness()` in audio-mixer.ts (`loudnorm=I=-14:TP=-1.0:LRA=11`). Wired in index.ts prima di mergeAudioVideo.
- **Stato:** FIXATO

---

## 3. Visual / Autogen — Issue aperte

### 3.1 Testo bianco su sfondo bianco
- **Problema:** Scene 0 genera `background: #ffffff` ma il CSS ha `--color-text: #ffffff`. Testo completamente invisibile.
- **File:** `composition.ts` (selezione background)
- **Fix:** `generateBackground()` ora passa sempre il bg color attraverso `ensureDarkBg()` (luminance ≤ 15%). Rimosso anche il path 'light' che restituiva colori chiari.
- **Stato:** FIXATO

### 3.2 Card vuote (solo titolo)
- **Problema:** Le card generate hanno solo `card-title`, mancano `card-text` e `card-icon`. Risultato: rettangoli semitrasparenti con una parola dentro.
- **File:** `autogen.ts`
- **Fix:** Nuova funzione `buildCardItem()` che auto-genera icone (keyword matching vs icon-library) e split testo lungo (prima/dopo " — ") in titolo + descrizione. Tutti i 6 punti di creazione card-group aggiornati.
- **Stato:** FIXATO

### 3.3 Scene troppo corte
- **Problema:** Scene 0 e Scene 1 durano solo 2000ms (2s) — insufficiente per leggere il contenuto. Solo Scene 2 ha durata adeguata (5950ms).
- **File:** `autogen.ts`
- **Fix:** Aggiunto content-aware minimum duration dopo `getSceneDuration()`: heading-only ≥ 3500ms, heading+body ≥ 5000ms, cards ≥ 6000ms.
- **Stato:** FIXATO

### 3.4 Font di sistema generiche
- **Problema:** `system-ui, -apple-system, sans-serif` — nessun web font caricato. In un video renderizzato via Playwright, i font di sistema variano per OS e il risultato è sempre generico.
- **File:** `html-generator.ts`
- **Fix:** Default Google Fonts import (Inter + Space Grotesk) quando nessun design token è fornito. Default CSS: `--font-display: 'Space Grotesk'`, `--font-body: 'Inter'`.
- **Stato:** FIXATO

### 3.5 Colori input ignorati
- **Problema:** L'input contiene `colors: ["#6c63ff", "#0f0c29", "#ffffff"]` ma autogen usa i default (`#6366f1`, `#e94560`). I colori del brand dell'utente non vengono applicati.
- **File:** `autogen.ts`
- **Fix:** Quando `content.colors` è presente ma non ci sono design tokens, vengono creati pseudo-tokens (`colorPrimary`, `colorAccent`, `colorBg`) dai colori dell'input. Questi vengono passati a `generateHTML` e iniettati come CSS custom properties.
- **Stato:** FIXATO

### 3.6 Decorativi quasi invisibili
- **Problema:** Orbs a 12% opacity, rings a 8% opacity — praticamente non si vedono nel video renderizzato. Non aggiungono profondità visiva.
- **File:** `decorative.ts`
- **Fix:** Orbs opacity 0.25-0.41 (da 0.12-0.24), rings opacity 0.18 + border 2px (da 0.08 + 1px), grid pattern opacity 0.08 (da 0.04).
- **Stato:** FIXATO

### 3.7 Qualità complessiva vs Remotion.dev
- **Problema:** Il risultato visivo è molto distante dalla qualità di Remotion.dev. Mancano: tipografia raffinata, palette colori coerenti, motion design sofisticato, gerarchia visiva chiara, spaziature bilanciate.
- **Impatto:** Output non utilizzabile professionalmente
- **Stato:** APERTO — richiede intervento strutturale

---

## File modificati in questa sessione

| File | Tipo modifica |
|------|---------------|
| `engine/audio/narration_generator.py` | Fix WPM + ducking values |
| `engine/src/index.ts` | Fix mix gain + ducking targets + venv TTS + loudnorm |
| `engine/src/demo-timeline.ts` | Fix fallback WPM |
| `engine/src/demo-capture.ts` | Fix ducking targets + timing |
| `engine/src/demo-script.ts` | Fix hardcoded prosody profiles |
| `engine/audio/presets/emphasis-profiles.json` | Fix rate profiles |
| `engine/audio/engines/edge_tts_engine.py` | Fix default rate + fallback WPM |
| `engine/src/audio-mixer.ts` | Fix fadeInStart negativo + max() nesting + normalizeLoudness |
| `engine/src/composition.ts` | Fix white-on-white bg (ensureDarkBg + remove light path) |
| `engine/src/autogen.ts` | Fix cards, scene duration, color passthrough |
| `engine/src/decorative.ts` | Fix opacity orbs/rings/grid |
| `engine/src/html-generator.ts` | Default web fonts (Inter + Space Grotesk) |

---

*Ultimo aggiornamento: 2026-02-14*

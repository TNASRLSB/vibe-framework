# Spec: ElevenLabs TTS — Tuning da field test

**Data:** 2026-02-12
**Tipo:** Bug fix + Enhancement (skill)
**Stato:** completato
**Fonte:** `orson-elevenlabs-tts.md` (report da test session su progetto esterno)
**Revisione:** v2 — integrata analisi documentazione ElevenLabs ufficiale + community

---

## Problema

I preset ElevenLabs in `elevenlabs_engine.py` sono quelli **pre-tuning** — gli stessi valori che nel field test producevano voce a "cantilena" e risultato teatrale/innaturale per lo stile `enthusiastic`. Il report documenta 3 iterazioni di tuning con valori finali validati.

### Confronto preset

| Style | Parametro | Attuale (pre-tuning) | Tuned (report) | Docs ufficiali | Problema attuale |
|-------|-----------|---------------------|----------------|----------------|-----------------|
| enthusiastic | stability | **0.4** | 0.55 | 0.4-0.6 (conversational) | Intonazione oscillante → cantilena |
| enthusiastic | style | **0.6** | 0.15 | 0-0.2 (conversational) | Eccessivamente teatrale |
| enthusiastic | speed | 1.1 | 1.05 | - | Leggermente troppo veloce |
| enthusiastic | similarity_boost | 0.75 | 0.80 | - | - |
| neutral | stability | 0.5 | **0.65** | - | Poco stabile |
| calm | stability | 0.7 | **0.75** | - | Marginale |
| calm | use_speaker_boost | True (hardcoded) | **False** | False per calm (community) | Presenza inappropriata |
| dramatic | stability | **0.3** | 0.5 | **0.3-0.5** (dramatic) | Vedi nota sotto |
| dramatic | style | **0.8** | 0.25 | **0.6-0.8** (dramatic) | Vedi nota sotto |

**Problema critico confermato:**
- `enthusiastic` con `stability=0.4` + `style=0.6` produce cantilena — confermato sia dal field test che dalla documentazione (quei valori sono per dramatic, non enthusiastic)

**Nota su `dramatic`:**
Il field test ha tuned dramatic a `stability=0.5, style=0.25`, ma la documentazione ufficiale raccomanda `stability=0.3-0.5, style=0.6-0.8` per contenuti realmente drammatici. Il problema nel field test era che "dramatic" veniva usato per narrazione demo, non per contenuti drammatici veri. I valori attuali (`0.3/0.8`) sono in linea con le docs per dramatic content, ma troppo estremi per narrazione. Soluzione: mantenere un preset `dramatic` fedele alla semantica (vicino alle docs) ma con valori meno estremi.

### `use_speaker_boost` hardcoded

Attualmente `use_speaker_boost=True` e hardcoded alla riga 85. Confermato da implementazioni reali (Dev.to, community cinese) che per lo stile `calm` il boost aggiunge presenza inappropriata. Deve essere per-preset.

### Voice resolution limitata

Attuale (riga 66):
```python
voice_id = voice if voice and not voice.endswith('Neural') else DEFAULT_VOICE_ID
```

Gestisce solo 2 casi: ID diretto o nome Edge-TTS → fallback al default. Servono 3 formati:
1. **Voice ID** (>= 20 char alfanumerici) → usato direttamente
2. **Nome dalla catalog** (es. `Daniel`, `Rachel`) → risolto a ID
3. **Nome Edge-TTS** (es. `it-IT-IsabellaNeural`) → fallback al locale default

### Voci italiane mancanti nel catalogo

Il catalogo `voices.json` ha solo 4 voci ElevenLabs (tutte EN) e nessuna voce Edge-TTS italiana. Da aggiungere:
- **Edge-TTS**: `it-IT-IsabellaNeural`, `it-IT-DiegoNeural` (gratuite, no API key)
- **ElevenLabs**: Voci premade disponibili su qualsiasi piano. Le voci Voice Library (MarcoTrox, Aida Pro, etc.) richiedono piano a pagamento

### Default voice

Attuale: Rachel (`21m00Tcm4TlvDq8ikWAM`) — voce calm/soothing, ottima per narrazione pacata. Non cambiamo il default. Aggiungiamo Daniel (`onwK4e9ZLuTAKqWW03F9`) al catalogo come opzione specifica per demo tech (pacing da news broadcaster).

### SDK speed parametro fragile

Attuale: `speed` passato direttamente a `VoiceSettings` (riga 84). Documentato che versioni SDK precedenti non supportano il parametro (`got an unexpected keyword argument 'speed'`). Range supportato: 0.7-1.2. Serve fallback via FFmpeg `atempo`.

---

## Piano di implementazione

### 1. Aggiornare STYLE_PRESETS — `elevenlabs_engine.py:17-22`

```python
STYLE_PRESETS = {
    'enthusiastic': {'speed': 1.05, 'stability': 0.55, 'similarity_boost': 0.80, 'style': 0.15, 'use_speaker_boost': True},
    'neutral':      {'speed': 1.0,  'stability': 0.65, 'similarity_boost': 0.75, 'style': 0.0,  'use_speaker_boost': True},
    'calm':         {'speed': 0.95, 'stability': 0.75, 'similarity_boost': 0.70, 'style': 0.0,  'use_speaker_boost': False},
    'dramatic':     {'speed': 0.90, 'stability': 0.40, 'similarity_boost': 0.85, 'style': 0.60, 'use_speaker_boost': True},
}
```

Rationale per `dramatic`:
- `stability=0.40` (dentro il range docs 0.3-0.5, ma non all'estremo)
- `style=0.60` (dentro il range docs 0.6-0.8, al minimo — evita eccessi)
- `speed=0.90` (pacing deliberato per contenuti drammatici)

### 2. `use_speaker_boost` per-preset — `elevenlabs_engine.py:80-86`

Leggere `use_speaker_boost` dal preset invece di hardcodarlo:
```python
voice_settings=VoiceSettings(
    stability=preset['stability'],
    similarity_boost=preset['similarity_boost'],
    style=preset['style'],
    use_speaker_boost=preset.get('use_speaker_boost', True),
)
```

### 3. Speed con fallback atempo — `elevenlabs_engine.py:75-87`

```python
speed = preset.get('speed', 1.0)
try:
    audio = await client.text_to_speech.convert(
        ..., voice_settings=VoiceSettings(..., speed=speed)
    )
except TypeError:
    # SDK version doesn't support speed param
    audio = await client.text_to_speech.convert(
        ..., voice_settings=VoiceSettings(...)  # senza speed
    )
    # Apply speed post-generation via ffmpeg atempo
    if speed != 1.0:
        _apply_atempo(output_path, speed)
```

### 4. Voice resolution by name — `elevenlabs_engine.py:66`

Aggiungere lookup per nome dal catalogo `voices.json`:
```python
def _resolve_voice_id(voice: str) -> str:
    if not voice or voice.endswith('Neural'):
        return DEFAULT_VOICE_ID
    if len(voice) >= 20 and voice.isalnum():
        return voice  # Direct voice ID
    # Name lookup from catalog
    catalog = _load_voices_catalog()
    for v in catalog.get('elevenlabs', []):
        if v.get('name', '').lower() == voice.lower():
            return v['id']
    return DEFAULT_VOICE_ID
```

### 5. Voci italiane + Daniel in catalogo — `voices.json`

Aggiungere sotto `recommended`:
```json
"it-IT": [
  {"id": "it-IT-IsabellaNeural", "engine": "edge-tts", "gender": "Female", "character": "Professionale, calda", "use_cases": ["corporate", "tech"], "default": true},
  {"id": "it-IT-DiegoNeural", "engine": "edge-tts", "gender": "Male", "character": "Energico, chiaro", "use_cases": ["tech", "demo"]}
]
```

E nella sezione `elevenlabs`, aggiungere Daniel:
```json
{"id": "onwK4e9ZLuTAKqWW03F9", "engine": "elevenlabs", "name": "Daniel", "gender": "Male", "character": "Steady broadcaster, news presenter pacing", "use_cases": ["tech demo", "product walkthrough", "explainer"]}
```

### 6. (Opzionale) Preset `educational`

Se utile in futuro, basato su best practices community (MemoAI, CSDN):
```python
'educational': {'speed': 0.90, 'stability': 0.70, 'similarity_boost': 0.75, 'style': 0.10, 'use_speaker_boost': True},
```

Non incluso in questa implementazione — da aggiungere quando serve un use case specifico.

---

## File da modificare

| File | Modifica |
|------|----------|
| `engine/audio/engines/elevenlabs_engine.py` | Preset tuned, use_speaker_boost per-preset, speed fallback, voice resolution |
| `engine/audio/presets/voices.json` | Voci IT Edge-TTS, Daniel ElevenLabs |

---

## Verifica

- [ ] Preset `enthusiastic` non produce cantilena (stability >= 0.5, style <= 0.2)
- [ ] Preset `dramatic` rispetta range docs (stability 0.3-0.5, style 0.6-0.8)
- [ ] Preset `calm` ha `use_speaker_boost=False`
- [ ] Voice resolution accetta nome "Daniel" e ritorna ID corretto
- [ ] Se SDK non supporta `speed`, fallback atempo funziona
- [ ] `voices.json` ha sezione `it-IT` (Edge-TTS) e Daniel (ElevenLabs)

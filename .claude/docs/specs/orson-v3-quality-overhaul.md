# Orson v3: Quality Overhaul

## Cosa sto risolvendo

Il video output di Orson è visivamente noioso, con transizioni piatte, testi tagliati, audio assente e un'architettura a "slide PowerPoint" che non regge il confronto con Remotion.dev. Questa spec affronta 11 problemi strutturali nella skill, non nell'output.

---

## Interventi

### 1. ARCHITETTURA: Da pagine discrete a scroll continuo

**Problema:** Ogni scena è un `<div class="scene" style="position: absolute; opacity: 0">` sovrapposto. Le scene appaiono/scompaiono con fade di opacità (60-150ms). Non c'è flusso continuo — è un PowerPoint animato.

**Root cause:** `html-generator.ts` (riga 137-151) posiziona tutte le scene in `position: absolute` con `opacity: 0`, poi le rivela una alla volta tramite `scene-reveal` / `scene-hide` keyframes (righe 167-174). `capture.ts` (riga 60-75) avanza il `currentTime` delle animazioni CSS — non muove nulla nello spazio.

**Soluzione: Scroll-driven composition**

Aggiungere una modalità alternativa `composition: 'scroll'` (default per promo video, mantenere `'stack'` per backward compat):

1. **`html-generator.ts`** — Nuovo layout mode `scroll`:
   - Scene in `position: relative` (non absolute), stacked in `flex-direction: column`
   - Body diventa un container verticale alto N * viewport-height
   - Ogni scena ha `min-height: 100vh` (viewport del video)
   - Elementi dentro le scene usano `position: sticky`, `transform: translateY()`, e `opacity` per creare effetti parallax/reveal
   - Transizioni tra scene: overlap zone dove la scena uscente e quella entrante sono entrambe visibili

2. **`capture.ts`** — Nuovo meccanismo di scroll sync:
   - Calcolare la posizione di scroll da `currentTime`: `scrollY = (timeMs / totalDurationMs) * totalScrollHeight`
   - `page.evaluate(scrollY => window.scrollTo(0, scrollY), scrollY)` prima di ogni frame
   - Le CSS animations restano per gli elementi interni; lo scroll guida il flusso globale

3. **`timeline.ts`** — Aggiungere `scrollStart` e `scrollEnd` per ogni scena (in px), oltre ai timing in ms

4. **`config.ts`** — Nuovo campo `composition?: 'stack' | 'scroll'` (default: `'scroll'`)

**File da modificare:**
- `engine/src/html-generator.ts` — layout scene
- `engine/src/capture.ts` — scroll sync
- `engine/src/timeline.ts` — scroll positions
- `engine/src/config.ts` — nuovo campo
- `engine/src/autogen.ts` — default a `scroll`

**Effetto visivo atteso:** Le scene scorrono una nell'altra come un sito infinite-scroll. Gli elementi emergono con parallax, sticky positioning, e overlap. Non ci sono più "tagli" netti tra scene.

---

### 2. TRANSIZIONI: Da opacity fade a morph/wipe/slide reali

**Problema:** `composition.ts` definisce 26 tipi di transizione (morph-layout, wipe-left, iris-open, shared-element, etc.) ma `html-generator.ts` le riduce tutte a `scene-reveal` (opacity 0→1) e `scene-hide` (opacity 1→0). Le transition keyframes in `actions.ts` esistono ma non vengono iniettate nell'HTML per le transizioni inter-scena.

**Root cause:** `html-generator.ts` riga 60-63 raccoglie i keyframes delle transizioni (`trans-a-*` / `trans-b-*`), ma il CSS generato per `.scene` usa solo `scene-reveal` e `scene-hide` come animazioni base. Le transition keyframes personalizzate (`morph-reveal`, `wipe-left`, `iris-from-center`) vengono aggiunte al foglio di stile ma **mai applicate** al `style=""` delle scene div.

**Soluzione:**

1. **`html-generator.ts` → `generateSceneHTML()`** — Quando una scena ha `transitionOut`, applicare le keyframes `trans-a-*` e `trans-b-*` al posto di `scene-hide` / `scene-reveal`:
   - Scena corrente: sostituire `scene-hide` con `trans-a-{id}` al momento della transizione
   - Scena successiva: sostituire `scene-reveal` con `trans-b-{id}`

2. **`actions.ts` → TRANSITIONS** — Verificare che ogni transizione definita in `composition.ts` abbia keyframes CSS reali. Aggiungere quelli mancanti.

3. **Per la modalità scroll (intervento 1):** Le transizioni diventano overlap zones dove entrambe le scene sono visibili. L'effetto di transizione si applica come `transform` + `opacity` guidati dalla posizione di scroll (non dal tempo). Questo è più naturale dell'approach attuale.

**File da modificare:**
- `engine/src/html-generator.ts` — applicare transition keyframes
- `engine/src/actions.ts` — completare keyframes mancanti

---

### 3. TTS NARRAZIONE: Opzionale nel render standard

**Problema:** La pipeline TTS esiste solo in demo mode (`demo-capture.ts`). Il comando `render` non genera mai narrazione — i testi delle scene restano solo visivi. La narrazione aggiunge accessibilità e engagement.

**Scelta utente:** La narrazione è **opt-in**, non default. Serve un flag `--narrate` (o `--tts`) da linea di comando, e un campo `narration: true/false` nella config.

**Soluzione:**

1. **`index.ts` → render command** — Aggiungere flag `--narrate`:
   - Dopo il render video, estrarre testi dalle scene (heading + body text) in un narration brief JSON
   - Chiamare `narration_generator.py` con il brief
   - Usare `audio-mixer.ts` per: concatenare narrazione → selezionare musica → applicare ducking → mixare → merge nel video

2. **`config.ts`** — Nuovo campo opzionale `narration?: { enabled: boolean; voice?: string; lang?: string }`

3. **`html-parser.ts`** — Aggiungere funzione `extractNarrationBrief(htmlConfig)` che restituisce un array di `{ sceneIndex, text, startMs, endMs }` dai testi delle scene

4. **SKILL.md** — Documentare:
   - `/orson render file.html --narrate` — renderizza con narrazione TTS
   - `/orson render file.html --narrate --voice en-US-AriaNeural`
   - La narrazione è opzionale. Utile per accessibilità o social media.

**File da modificare:**
- `engine/src/index.ts` — flag + pipeline narrazione
- `engine/src/config.ts` — campo narration
- `engine/src/html-parser.ts` — estrazione brief
- `SKILL.md` — documentazione

---

### 4. AUDIO: Tracce musicali reali

**Problema:** `download-library.sh` tenta di scaricare da Mixkit. Se fallisce, genera placeholder silenziosi. L'errore viene poi catturato silenziosamente in `index.ts` riga 311: `"Audio skipped: {err.message}"`. Il video risulta muto e l'utente non sa perché.

**Soluzione:**

1. **Bundle 3-4 tracce CC0 nel repository** — Generare con un servizio di AI music (Suno, Udio) o usare tracce CC0 reali da Pixabay/Mixkit. Formati: MP3, 128kbps, 60-90 secondi ciascuna. Stili minimi: corporate, ambient, upbeat.

2. **`download-library.sh`** — Aggiornare gli URL a fonti affidabili. Aggiungere retry (3 tentativi per URL). Se il download fallisce, usare le tracce bundled come fallback invece di silenzio.

3. **`index.ts` riga 311** — Sostituire `console.log("Audio skipped")` con un WARNING chiaro:
   ```
   ⚠ WARNING: Audio track not found or silent. Run:
     bash .claude/skills/orson/engine/audio/download-library.sh
   Video rendered without music.
   ```

4. **`audio-selector.ts`** — Prima di restituire un track, verificare che il file esista e non sia silenzio (check dimensione file > 10KB).

**File da modificare:**
- `engine/audio/tracks/` — aggiungere tracce bundled
- `engine/audio/download-library.sh` — URL affidabili + retry + fallback a bundled
- `engine/src/index.ts` — warning visibile
- `engine/src/audio-selector.ts` — validazione file

---

### 5. VISUAL: Testi tagliati

**Problema:** `-webkit-line-clamp: 3` su heading e `-webkit-line-clamp: 4` su body text troncano il contenuto senza `text-overflow: ellipsis`. `max-height: calc(Hpx - padding)` su `.scene-content` taglia ulteriormente. Il risultato: testo che scompare senza indicazione.

**Soluzione:**

1. **`html-generator.ts`** — Aggiungere validazione lunghezza testo **prima** di generare il CSS:
   - Calcolare righe stimate: `Math.ceil(textLength * charWidth / containerWidth)`
   - Se il testo supera il clamp, **ridurre il font-size** automaticamente (scala fino a `0.7x`) invece di troncare
   - Se ancora non entra, splittare in fase automatica (multi-phase element con 2 slot)

2. **CSS nel template** — Aggiungere `text-overflow: ellipsis` come fallback su tutti i line-clamp

3. **`autogen.ts`** — Nella fase di generazione scene, limitare il testo per elemento:
   - Heading: max 60 caratteri (ridurre da source)
   - Body: max 120 caratteri
   - Card title: max 50 caratteri
   - Se il source text è più lungo, abbreviare PRIMA di generare il HTML

**File da modificare:**
- `engine/src/html-generator.ts` — validazione + font-size adattivo
- `engine/src/autogen.ts` — limiti testo

---

### 6. VISUAL: Gap vuoti tra animazioni

**Problema:** Elementi sovrapposti in `position: absolute` dentro la stessa scena hanno timing sfalsati: l'elemento A esce a 2400ms, l'elemento B entra a 3000ms. Per 600ms la scena è vuota.

**Root cause:** `timeline.ts` calcola i timing indipendentemente per ogni elemento. Non c'è verifica che la somma delle animazioni copra l'intera durata della scena senza buchi.

**Soluzione:**

1. **`timeline.ts`** — Dopo aver calcolato tutti i timing, aggiungere un passo di **gap detection**:
   - Per ogni scena, costruire una timeline di visibilità (da startMs a endMs per ogni elemento)
   - Se c'è un gap > 200ms dove nessun elemento è visibile, anticipare l'entrance dell'elemento successivo o ritardare l'exit di quello precedente
   - Log warning se un gap non è risolvibile

2. **`html-generator.ts`** — Per elementi multi-phase nella stessa posizione, fare overlap di 200ms tra exit e entrance (crossfade) invece di gap netto.

**File da modificare:**
- `engine/src/timeline.ts` — gap detection + correction
- `engine/src/html-generator.ts` — multi-phase overlap

---

### 7. VISUAL: Più animazioni utilizzate

**Problema:** `actions.ts` definisce 136+ animazioni ma l'HTML generato ne usa ~19. `autogen.ts` chiama `directScene()` ma il risultato è quasi ignorato — solo `layout` viene applicato, le animation hints no.

**Root cause:** `autogen.ts` non passa le animation hints alla fase di timeline building. `timeline.ts` seleziona animazioni random dal mode pool (safe/chaos) senza considerare il contesto della scena.

**Soluzione:**

1. **`autogen.ts`** — Passare `director.animationHints` al config di ogni scena come campo `preferredEntrances` e `preferredExits`

2. **`timeline.ts`** — Se una scena ha `preferredEntrances`, usarle al posto della selezione random dal mode pool. Aggiungere variazione: ciclare tra le preferred, non ripetere la stessa animazione consecutivamente.

3. **`composition.ts`** — Per ogni scene type, definire una lista di animazioni raccomandate (non solo nomi generici ma entrance IDs specifici da `actions.ts`)

**File da modificare:**
- `engine/src/autogen.ts` — propagare hints
- `engine/src/timeline.ts` — usare preferred entrances
- `engine/src/composition.ts` — animazioni raccomandate per scene type

---

### 8. CHOREOGRAPHY: Connettere anticipation e follow-through

**Problema:** `choreography.ts` ha un sistema sofisticato di pianificazione Disney (anticipation, follow-through, micro-pauses) ma non è connesso al rendering. Le keyframes di anticipation sono hardcoded come esempio, non integrate con le entrance reali.

**Root cause:** `planChoreography()` restituisce un piano che include `elementPlans[].anticipation` e `elementPlans[].followThrough` ma `timeline.ts` non li usa — applica solo `staggerDelays` e `entranceId`.

**Soluzione:**

1. **`timeline.ts`** — Leggere il piano choreografico e applicare:
   - Se `anticipation` è presente, aggiungere una pre-animazione (scale down leggero → spring in)
   - Se `followThrough` è presente, aggiungere una post-animazione (overshoot → settle)
   - Queste si traducono in keyframes CSS composte: `entrance-anticipation` → `entrance` → `entrance-followthrough`

2. **`choreography.ts`** — Generare keyframes CSS reali per anticipation/follow-through, non solo descrizioni

3. **`html-generator.ts`** — Supportare animazioni multi-step: una sequenza di 2-3 keyframes concatenate con timing preciso

**File da modificare:**
- `engine/src/timeline.ts` — applicare choreography plan
- `engine/src/choreography.ts` — generare keyframes reali
- `engine/src/html-generator.ts` — animazioni multi-step

---

### 9. VISUAL: Decorative elements e scene enrichment automatici

**Problema:** `autogen.ts` genera scene con soli elementi di testo (heading, body, card-title). Non ci sono icone, grafiche decorative, sfondi differenziati, o mockup UI. Il risultato è "testo su sfondo scuro" — esteticamente piatto rispetto a tool come Remotion.dev che hanno scene visivamente ricche.

**Scoperta dal quick fix:** Quando abbiamo manualmente arricchito `promo-framework.html`, aggiungere SVG inline, orbs decorativi, gradient text e sfondi variegati ha trasformato radicalmente la qualità percepita senza toccare il timeline/animazioni. Queste tecniche devono diventare automatiche nel motore.

**Soluzione — 5 sotto-sistemi:**

#### 9a. SVG Icon Library

1. **Nuovo file `engine/src/icon-library.ts`** — Libreria di ~30 icone SVG inline organizzate per categoria semantica:
   - `security`: shield, lock, eye, fingerprint
   - `performance`: bolt, rocket, gauge, zap
   - `code`: terminal, brackets, git-branch, bug
   - `ui`: layout, palette, grid, responsive
   - `general`: check-circle, star, arrow-right, globe, github
   - Ogni icona: stringa SVG pulita, viewBox normalizzato, `currentColor` per ereditare colore

2. **`autogen.ts`** — Nella generazione di scene card-grid/feature-list:
   - Analizzare il testo di ogni card per keyword matching → selezionare icona appropriata
   - Iniettare `<svg>` inline nel markup della card come primo child
   - Fallback: icona generica dalla categoria della scena

3. **`html-generator.ts`** — Supportare un nuovo tipo di elemento `icon` con:
   - Sizing relativo al container (default 48px per card, 64px per standalone)
   - Color matching con l'accent del design system
   - Animazione entrance separata dall'elemento parent

#### 9b. Decorative Elements (Orbs, Rings, Grid Patterns)

1. **Nuovo file `engine/src/decorative.ts`** — Generatore di elementi decorativi CSS-only:
   - **Orbs**: `<div>` con `border-radius: 50%`, `filter: blur(60-100px)`, colore accent con opacity 0.15-0.3. Posizionati random ai bordi della scena.
   - **Rings**: `border: 1px solid accent`, `border-radius: 50%`, sizing 200-400px, opacity 0.05-0.1
   - **Grid patterns**: `background-image: linear-gradient(...)` con linee sottili, mascherati con `mask-image: radial-gradient(...)` per fade ai bordi
   - **Scan lines**: Animazione `@keyframes` con una linea orizzontale che scorre verticalmente

2. **`autogen.ts`** — Per ogni scena, selezionare 1-3 decorative elements in base a:
   - Scene type (hero→orbs+grid, feature→rings, cta→orbs glow)
   - Mode (safe→1 elemento, chaos→3, cocomelon→2-3 con animazione)
   - Posizione: mai sopra il testo, solo ai bordi/background

3. **`html-generator.ts`** — Renderizzare i decorative elements con `z-index: 0` (sotto il contenuto) e `pointer-events: none`. Animarli con entrance indipendente (fade-in lento, 500-800ms).

#### 9c. Gradient Text

1. **`html-generator.ts`** — Per heading elements con `role: 'hero'` o `role: 'cta'`:
   - Applicare `background: linear-gradient(135deg, accent1, accent2)`
   - Con `-webkit-background-clip: text` e `-webkit-text-fill-color: transparent`
   - Accent colors derivati dal design system tokens

2. **`autogen.ts`** — Flag `gradientText: true` su heading elements delle scene hero/cta/climax

#### 9d. Background Variety

1. **`composition.ts`** — Estendere `selectBackground()` per generare sfondi differenziati per scena:
   - Non solo `hsl(H S% L%)` flat, ma gradienti: `radial-gradient(ellipse at 30% 50%, bg-light, bg-dark)`
   - Variazione automatica: shift hue di ±5-15deg tra scene consecutive
   - Pattern: scene pari con gradient verso alto-sinistra, scene dispari verso basso-destra

2. **`html-generator.ts`** — Supportare `background` (non solo `background-color`) nelle scene

#### 9e. UI Mockup Elements

1. **Nuovo file `engine/src/mockups.ts`** — Template HTML per mockup UI riconoscibili:
   - **Terminal**: div con header (3 cerchi colorati), sfondo scuro, font monospace, testo "code"
   - **Browser**: barra URL con favicon placeholder, contenuto area
   - **Phone**: cornice arrotondata con notch, content area
   - Ogni mockup è CSS-only, nessuna immagine esterna

2. **`autogen.ts`** — Per scene di tipo `demo`/`feature-showcase`:
   - Se il testo menziona "code"/"terminal"/"command" → inserire terminal mockup
   - Se menziona "UI"/"interface"/"website" → inserire browser mockup
   - Il mockup è un elemento addizionale nella scena, animato come gli altri

**File da modificare/creare:**
- `engine/src/icon-library.ts` — **NUOVO**: libreria icone SVG
- `engine/src/decorative.ts` — **NUOVO**: generatore elementi decorativi
- `engine/src/mockups.ts` — **NUOVO**: template mockup UI
- `engine/src/html-generator.ts` — supporto icon, decorative, gradient text, background gradient
- `engine/src/autogen.ts` — selezione automatica icon/decorative/mockup per scena
- `engine/src/composition.ts` — background variety

**Effetto visivo atteso:** Scene che passano da "testo su sfondo piatto" a composizioni visivamente stratificate con icone contestuali, profondità tramite orbs/blur, accenti gradient, e mockup UI dove appropriato. Qualità percepita 3x senza immagini esterne.

---

### 10. TIMING: Velocità di lettura e respiro tra scene

**Problema:** `MS_PER_WORD` in `presets.ts` è calibrato a 250ms/parola (speed `normal`) = 240 WPM. Una persona legge ~200 WPM. Le scene scorrono troppo veloce per leggere tutto il testo. Inoltre `ENTRANCE_PADDING` (500ms) e `EXIT_PADDING` (300ms) sono troppo corti — non c'è "respiro" tra una scena e la successiva.

**Root cause:** `presets.ts` riga 67-71 definisce `MS_PER_WORD: { normal: 250 }`. Il calcolo in `timing.ts` riga 18 usa `words * MS_PER_WORD[speed]` per il hold time. Con 10 parole: `10 * 250 = 2500ms` = 2.5 secondi. A 200 WPM servirebbero `10 * 300 = 3000ms` = 3 secondi. La differenza si accumula: un video di 8 scene con ~30 parole per scena perde ~4 secondi totali di tempo di lettura.

**Soluzione:**

1. **`presets.ts` → `MS_PER_WORD`** — Ricalibrare a 200 WPM:
   ```
   MS_PER_WORD: {
     slowest: 600,   // era 500 → 100 WPM (presentazione)
     slow: 400,      // era 350 → 150 WPM (confortevole)
     normal: 300,    // era 250 → 200 WPM (lettura naturale)
     fast: 220,      // era 180 → ~270 WPM (scanning)
     fastest: 160,   // era 120 → ~375 WPM (flash)
   }
   ```

2. **`timing.ts` → Padding** — Aumentare i tempi di respiro:
   ```
   ENTRANCE_PADDING: 700   // era 500 — tempo per "arrivare" alla scena
   EXIT_PADDING: 500       // era 300 — tempo per "digerire" prima dell'uscita
   ```

3. **`timing.ts` → `MIN_HOLD_TIME`** — Aumentare da 500ms a 800ms. Anche un elemento senza testo (icona, decorativo) deve restare visibile almeno 800ms per essere percepito.

4. **`timing.ts` → Heading bonus** — Gli heading richiedono più tempo perché il cervello li processa come "anchor point". Aggiungere un moltiplicatore 1.3x per heading (`role: 'heading'`):
   ```typescript
   const holdTime = el.explicitHold
     ?? computeHoldTime(el.text, speed) * (isHeading ? 1.3 : 1.0);
   ```

5. **`presets.ts` → `INTER_ELEMENT_GAP`** — Aumentare leggermente:
   ```
   INTER_ELEMENT_GAP: { normal: 350 }  // era 250 — più respiro tra elementi
   ```

**File da modificare:**
- `engine/src/presets.ts` — MS_PER_WORD, INTER_ELEMENT_GAP ricalibrati
- `engine/src/timing.ts` — ENTRANCE_PADDING, EXIT_PADDING, MIN_HOLD_TIME, heading bonus

**Effetto atteso:** Con 200 WPM, una scena con heading (6 parole) + body (15 parole) dura ~9.5s invece di ~7s. Il video si allunga di ~25% ma diventa leggibile. Lo spettatore non deve mai mettere in pausa per leggere.

---

### 11. ANIMAZIONI: Assegnamento semantico e text splitting reale

**Problema duplice:**

**A) Le animazioni cinematiche non vengono mai assegnate:**
`stamp`, `slam`, `scale-word`, `drop`, `kinetic-push` non sono nel pool `SAFE_ENTRANCE_IDS`. In cocomelon/chaos, vengono selezionate random tra ~50 opzioni (2% di probabilità ciascuna). Nessuna logica collega il tipo di elemento (hero heading vs body text vs card) all'animazione appropriata.

**B) `word-by-word` e `char-stagger` sono finte:**
Le properties sono `{ opacity: ft(0,1), y: ft(15,0) }` — animano l'intero elemento come un blocco. Non c'è logica di text splitting nel frame renderer. I nomi promettono un effetto per-parola/per-carattere che non esiste.

**Root cause A:** `timeline.ts` riga 278-307 seleziona le entrance senza considerare il ruolo semantico dell'elemento. Un hero heading riceve la stessa probabilità di `fade-in-up` e `stamp`. Non c'è mapping `element.role → animation.energy`.

**Root cause B:** `frame-renderer.ts` → `generateFrameRendererJS()` applica le properties (opacity, y, scale, etc.) al nodo DOM dell'intero elemento. Non c'è logica per wrappare ogni parola/carattere in `<span>` e applicare delay progressivi.

**Soluzione:**

#### 11a. Assegnamento semantico per ruolo elemento

1. **Nuovo mapping in `actions.ts`** — `ROLE_ANIMATION_MAP`:
   ```typescript
   const ROLE_ANIMATION_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
     'hero-heading':    { primary: ['stamp', 'slam', 'scale-word'], secondary: ['drop', 'kinetic-push'] },
     'heading':         { primary: ['spring-up', 'clip-reveal-up', 'text-reveal-mask'], secondary: ['fade-in-up', 'slide-up'] },
     'body':            { primary: ['fade-in-up', 'rise-and-fade', 'soft-reveal'], secondary: ['blur-in', 'typewriter'] },
     'card-title':      { primary: ['spring-scale', 'bounce-in', 'clip-reveal-left'], secondary: ['fade-in-left', 'slide-left'] },
     'cta':             { primary: ['stamp', 'elastic-in', 'bounce-in'], secondary: ['spring-scale', 'grow'] },
     'icon':            { primary: ['spring-scale', 'morph-circle-in', 'bounce-in'], secondary: ['grow', 'zoom-in'] },
     'decorative':      { primary: ['fade-in', 'soft-reveal', 'blur-in'], secondary: ['grow'] },
   };
   ```

2. **`timeline.ts`** — Nella selezione entrance, prima di `pickRandom(entrancePool)`:
   - Leggere `element.role` (heading, body, card-title, cta, icon, decorative)
   - Se esiste in `ROLE_ANIMATION_MAP`, selezionare da `primary` (80%) o `secondary` (20%)
   - Se non esiste o il ruolo non è definito, fallback al pool attuale
   - Non ripetere la stessa animazione per elementi con lo stesso ruolo nella stessa scena

3. **`autogen.ts`** — Propagare `role` su ogni elemento generato:
   - Prima scena → heading ha `role: 'hero-heading'`
   - Ultima scena → heading ha `role: 'cta'`
   - Scene intermedie → heading ha `role: 'heading'`
   - Body text → `role: 'body'`
   - Card titles → `role: 'card-title'`

#### 11b. Text splitting reale per word-by-word e char-stagger

1. **`html-generator.ts`** — Quando un elemento ha entrance `word-by-word` o `char-stagger`:
   - Wrappare ogni parola in `<span class="w" data-wi="0">`, `<span class="w" data-wi="1">`, etc.
   - Per `char-stagger`: wrappare ogni carattere in `<span class="ch" data-ci="0">`, etc.
   - Preservare spazi come `<span class="sp">&nbsp;</span>`

2. **`frame-renderer.ts` → `generateFrameRendererJS()`** — Aggiungere logica per animazioni word/char-level:
   - Se l'animazione è `word-by-word`: per ogni `<span class="w">`, calcolare progress con offset progressivo:
     ```javascript
     const wordProgress = interpolate(frame,
       [startFrame + i * staggerPerWord, startFrame + i * staggerPerWord + wordDuration],
       [0, 1], { clamp: true });
     ```
   - Se è `char-stagger`: stessa logica ma con `staggerPerChar` (più breve, ~30ms per carattere)
   - Le properties (opacity, y, scale) si applicano a ogni span individualmente

3. **`actions.ts`** — Marcare `word-by-word` e `char-stagger` con un flag `textSplit: 'word' | 'char'`:
   ```typescript
   'word-by-word': {
     id: 'word-by-word', name: 'Word by Word', energy: 'special',
     durationRange: [800, 2000],
     properties: { opacity: ft(0, 1), y: ft(15, 0) },
     easing: 'easeOutCubic',
     textSplit: 'word',        // ← NUOVO
     staggerMs: 80,            // ← NUOVO: delay tra word consecutive
   },
   ```

4. **Nuova animazione: `impact-word`** — La vera "Rocky entrance":
   ```typescript
   'impact-word': {
     id: 'impact-word', name: 'Impact Word', energy: 'special',
     durationRange: [1200, 2500],
     properties: {
       opacity: kf([0, 0.5, 1], [0, 1, 1]),
       scale: kf([0, 0.5, 0.7, 1], [5, 1.1, 0.95, 1]),
       blur: kf([0, 0.5, 1], [15, 0, 0]),
     },
     easing: 'easeOutCubic',
     textSplit: 'word',
     staggerMs: 200,           // ogni parola arriva con impatto separato
   },
   ```

**File da modificare:**
- `engine/src/actions.ts` — ROLE_ANIMATION_MAP, textSplit flag, `impact-word` animation
- `engine/src/timeline.ts` — selezione entrance per ruolo semantico
- `engine/src/autogen.ts` — propagare `role` su ogni elemento
- `engine/src/html-generator.ts` — text splitting in `<span>` per word/char animations
- `engine/src/frame-renderer.ts` — logica per-word/per-char con stagger progressivo

**Effetto atteso:** Gli hero heading arrivano con `stamp` (slammed 4x→1x con rotazione), i body text con `fade-in-up` dolce, le card con `spring-scale` elastico. `word-by-word` mostra effettivamente ogni parola che appare in sequenza. `impact-word` ricrea l'effetto "Rocky" con ogni parola che sbatte a schermo una dopo l'altra. Le animazioni non sono più random ma racccontano una gerarchia visiva.

---

## Ordine di esecuzione

Raggruppamento per impatto e dipendenze:

### Fase A: Fondamentali (impatto massimo)
1. **Intervento 1** — Architettura scroll continuo ← Cambia il paradigma visivo
2. **Intervento 2** — Transizioni reali ← Si integra con il nuovo scroll

### Fase B: Audio (indipendente)
3. **Intervento 4** — Tracce musicali reali
4. **Intervento 3** — TTS narrazione opzionale

### Fase C: Polish visivo
5. **Intervento 10** — Timing: velocità di lettura ← Fix immediato, 2 file, impatto su ogni video
6. **Intervento 11** — Animazioni semantiche + text splitting ← Cambia radicalmente la percezione
7. **Intervento 9** — Decorative elements e scene enrichment
8. **Intervento 5** — Testi tagliati
9. **Intervento 6** — Gap vuoti
10. **Intervento 7** — Più animazioni (parzialmente coperto da 11a)
11. **Intervento 8** — Choreography Disney

---

## File impattati (riepilogo)

| File | Interventi |
|------|-----------|
| `engine/src/html-generator.ts` | 1, 2, 5, 6, 8, 9, 11b |
| `engine/src/capture.ts` | 1 |
| `engine/src/timeline.ts` | 1, 6, 7, 8, 11a |
| `engine/src/config.ts` | 1, 3 |
| `engine/src/autogen.ts` | 1, 5, 7, 9, 11a |
| `engine/src/index.ts` | 3, 4 |
| `engine/src/actions.ts` | 2, 11a, 11b |
| `engine/src/composition.ts` | 7, 9 |
| `engine/src/choreography.ts` | 8 |
| `engine/src/html-parser.ts` | 3 |
| `engine/src/audio-selector.ts` | 4 |
| `engine/src/presets.ts` | 10 |
| `engine/src/timing.ts` | 10 |
| `engine/src/frame-renderer.ts` | 11b |
| `engine/audio/download-library.sh` | 4 |
| `engine/audio/tracks/` | 4 |
| `engine/src/icon-library.ts` | 9 (**NUOVO**) |
| `engine/src/decorative.ts` | 9 (**NUOVO**) |
| `engine/src/mockups.ts` | 9 (**NUOVO**) |
| `SKILL.md` | 3 |

---

## Come verifico

- **Intervento 1:** Renderizzare lo stesso video promo e confrontare visivamente. Il video deve scorrere tra scene senza tagli netti.
- **Intervento 2:** Verificare che le transizioni tra scene usino morph/wipe/slide e non solo opacity.
- **Intervento 3:** `render --narrate` produce un video con voce TTS che legge i testi. `render` senza flag resta muto come prima.
- **Intervento 4:** Render senza `--no-audio` produce musica di sottofondo udibile. Warning se tracce mancanti.
- **Intervento 5:** Nessun testo tagliato senza indicazione. Font-size si adatta al contenuto.
- **Intervento 6:** Nessun frame vuoto > 200ms durante una scena.
- **Intervento 7:** Il video usa almeno 8+ animazioni diverse, non le stesse 3 fade/slide ripetute.
- **Intervento 8:** Le animazioni hanno anticipation visibile (leggero shrink prima dell'entrance) e follow-through (overshoot dopo).
- **Intervento 9:** Scene generate automaticamente con: SVG icone contestuali nelle card, almeno 1 elemento decorativo (orb/ring/grid) per scena, gradient text su hero/cta, sfondi differenziati tra scene consecutive. Zero immagini esterne.
- **Intervento 10:** Con speed `normal`, una scena di 20 parole dura almeno 6 secondi (20 × 300ms). Il video promo a 8 scene dura ~50s invece di ~27s. Lo spettatore non deve mai mettere in pausa.
- **Intervento 11a:** Hero heading usa `stamp`/`slam`/`scale-word` (100%). Body text usa `fade-in-up`/`rise-and-fade` (mai `stamp`). Card titles usano `spring-scale`/`bounce-in`. Nessuna animazione cinematica su body text, nessuna animazione dolce su hero heading.
- **Intervento 11b:** `word-by-word` mostra parole che appaiono una alla volta con stagger visibile. `char-stagger` mostra caratteri che emergono in sequenza. `impact-word` (nuova) ricrea l'effetto "Rocky" — ogni parola sbatte a schermo a 5x scale con blur.

---

## Backward compatibility

- Il campo `composition: 'stack'` mantiene il comportamento attuale per video esistenti
- `--narrate` è opt-in, non cambia il default
- Le tracce bundled sono fallback, non sostituzione del download
- `scene-reveal` / `scene-hide` restano per `composition: 'stack'`
- Decorative elements e icon matching sono additivi — non modificano scene esistenti senza `autogen`
- Il flag `enrichment: false` nella config permette di disabilitare icone/decorativi per video minimali

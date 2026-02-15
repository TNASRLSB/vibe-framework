# Spec: Orson v4 — Remotion Parity

**Data:** 2026-02-14
**Stato:** COMPLETATO

---

## Obiettivo

Portare in Orson tre feature infrastrutturali da Remotion (preview, parallel frame, pipe diretto) e risolvere il gap qualitativo visivo che rende l'output di Orson inferiore a quello di Remotion + Claude.

---

## Parte A: Perché Remotion + Claude produce risultati migliori

### La diagnosi

Orson ha un **collo di bottiglia architetturale**: l'engine è un'astrazione che **limita** ciò che Claude può generare.

Quando Claude scrive codice Remotion (React + CSS), ha accesso a **tutto il CSS moderno**. Quando Claude usa Orson, è costretto a compilare un config che passa attraverso un engine con vincoli rigidi.

### Cosa l'engine NON supporta (e Remotion sì)

| Categoria | Cosa manca | Impatto visivo |
|-----------|-----------|----------------|
| **Effetti backdrop** | Solo `blur(8px)` hardcoded. No saturate, brightness, contrast, hue-rotate | Niente glassmorphism, niente frosted glass, niente luxury UI |
| **Gradienti** | Statici, baked nel CSS. Non animabili per frame | Niente gradient shift, niente mesh gradient, sfondi piatti |
| **3D** | Solo `rotateX`/`rotateY`. No perspective, no preserve-3d, no translateZ | Niente card stack 3D, niente parallax con profondità |
| **Blend modes** | Assenti del tutto | Niente color-dodge, multiply, screen overlay |
| **Clip-path** | Solo `inset()` e `circle()` | Niente reveal a diamante, stella, poligono, SVG mask |
| **Filtri** | Solo blur, brightness, hueRotate (3/10) | Niente desaturazione graduale, niente effetti luce complessi |
| **Colori** | Non interpolabili. Solo hueRotate come workaround | Niente transizioni colore, niente palette animate |
| **Testo** | Solo letterSpacing e maxWidth (typewriter). No text-shadow, text-stroke, text-decoration | Tipografia piatta, nessun effetto calligrafico |
| **CSS variables** | Statiche per scena, non aggiornabili per frame | Niente animazioni a cascata che propagano nei figli |
| **Decorativi** | 4 tipi (orb, ring, grid, scanline), quasi invisibili (8-12% opacity) | Sfondi vuoti, nessuna profondità |
| **Mockup** | 3 tipi hardcoded (terminal, browser, phone) | Niente Windows, Android, tablet, composite |
| **Icone** | ~30 SVG keyword-matched | Niente icone dominio-specifiche |
| **Layout** | Transform-only. No width/height animation, no reflow | Niente container che crescono/shrinkano |
| **Figli** | No parent→child transform chain | Niente animazioni meccaniche composte |
| **Fisica** | Solo spring base. No gravità, collisione, friction | Moto limitato a easing curves |

### Il problema fondamentale

```
Claude sa scrivere CSS moderno eccellente
    ↓
Ma l'engine Orson accetta solo 22 proprietà animabili
    ↓
Il risultato è vincolato al sottoinsieme più piccolo
```

Un developer con Remotion (o Claude che scrive React per Remotion) può usare `backdrop-filter: blur(20px) saturate(180%)`, `mix-blend-mode: overlay`, `transform: perspective(1000px) rotateY(15deg)`, gradienti animati, SVG path morph — **tutto ciò che il browser supporta**.

Orson può usare: opacity, x, y, scale, rotate, blur, brightness, hueRotate, clipInset, clipCircle, letterSpacing. Fine.

### La soluzione: non va "aggiunto" — va ripensato il rendering layer

Non si tratta di aggiungere una proprietà alla volta. Servono due interventi:

**A1. Arbitrary CSS injection per frame** — Permettere al frame renderer di applicare **qualsiasi stile CSS** via `__setFrame()`, non solo le 22 proprietà hardcoded. L'AnimationDef diventa una mappa `{ [cssProperty: string]: [from, to] }` arbitraria.

**A2. Raw CSS block per scena** — Permettere nel config di iniettare CSS raw per scena (gradienti, backdrop-filter, blend-mode, custom properties) che l'engine inserisce così com'è, senza interpretarli.

**A3. Espandere il vocabolario decorativo** — Passare da 4 tipi a 12+: glow, grain, noise, mesh gradient, animated gradient, particle dots, light leak, bokeh, vignette, film grain, scanline RGB, aurora.

**A4. Web font embedding** — Embed 5-8 Google Fonts (Inter, Poppins, Space Grotesk, Playfair Display, JetBrains Mono) come base64 @font-face.

**A5. Bug fix visivi dall'audit** — Risolvere 3.1-3.6 del file `orson-audit-2026-02-14.md` (testo bianco su bianco, card vuote, scene troppo corte, font generiche, colori ignorati, decorativi invisibili).

---

## Parte B: Feature infrastrutturali

### B1. Preview interattiva (frame scrubbing)

**Cosa:** Flag `--preview` che apre il browser con player UI sovrapposto all'HTML generato.

**Come funziona oggi:**
- `html-generator.ts` genera HTML con `__setFrame(n)` iniettato
- `capture.ts` inietta `window.__VIDEO_RENDER__ = true` che disabilita qualsiasi UI di preview
- Il frame renderer è già pronto per essere controllato da un player

**Implementazione:**

1. **Player overlay** — Generare un `<div id="orson-player">` con:
   - Slider range (0 → totalFrames)
   - Play/pause button
   - Frame counter (`F: 47/150`)
   - Speed control (0.25x, 0.5x, 1x, 2x)
   - Keyboard shortcuts: Space (play/pause), ← → (frame -1/+1), Shift+← → (frame -10/+10)

2. **Playback loop** — `requestAnimationFrame` che incrementa frame e chiama `__setFrame(f)`

3. **Serve & open** — `--preview` fa:
   ```
   1. Genera HTML con player overlay (no __VIDEO_RENDER__ flag)
   2. Serve su localhost:PORT via http.createServer
   3. Apre browser con xdg-open / open
   ```

4. **Player CSS** — Fixed bottom bar, z-index alto, sfondo semi-trasparente, non interferisce con il video

**File da modificare:**
- `html-generator.ts` — Iniettare player HTML+CSS+JS quando `preview: true`
- `index.ts` — Aggiungere flag `--preview`, servire HTML, aprire browser
- `frame-renderer.ts` — Nessuna modifica (già pronto)

**Player JS (inline nell'HTML):**
```javascript
// Solo quando __VIDEO_RENDER__ è falso
const slider = document.getElementById('orson-slider');
const frameLabel = document.getElementById('orson-frame');
let playing = false;
let currentFrame = 0;
let speed = 1;
const fps = TIMELINE_FPS; // iniettato dal generatore

slider.addEventListener('input', (e) => {
  currentFrame = parseInt(e.target.value);
  window.__setFrame(currentFrame);
  frameLabel.textContent = `${currentFrame}/${TOTAL_FRAMES}`;
});

function tick() {
  if (playing) {
    currentFrame += speed;
    if (currentFrame >= TOTAL_FRAMES) { currentFrame = 0; }
    window.__setFrame(Math.floor(currentFrame));
    slider.value = Math.floor(currentFrame);
    frameLabel.textContent = `${Math.floor(currentFrame)}/${TOTAL_FRAMES}`;
  }
  setTimeout(tick, 1000 / fps);
}
tick();

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { playing = !playing; e.preventDefault(); }
  if (e.code === 'ArrowRight') { currentFrame = Math.min(currentFrame + (e.shiftKey ? 10 : 1), TOTAL_FRAMES - 1); window.__setFrame(currentFrame); }
  if (e.code === 'ArrowLeft') { currentFrame = Math.max(currentFrame - (e.shiftKey ? 10 : 1), 0); window.__setFrame(currentFrame); }
});
```

**Effort:** ~200 righe di codice. 1 file nuovo (player template), 2 file modificati.

---

### B2. Render parallelo per frame

**Cosa:** Distribuire i frame su N worker Playwright, non più vincolato ai confini di scena.

**Come funziona oggi (parallel-render.ts):**
- `buildSceneSegments()` crea 1 segmento per scena
- Ogni segmento → 1 worker Playwright → temp .mp4
- `concatSegments()` unisce con `ffmpeg -f concat -c copy`
- Max 4 worker, `min(scenes, floor(cpuCount/2), 4)`
- **Bug:** usa `document.getAnimations()` (API v2) invece di `__setFrame()` (API v3)

**Problema:** Se il video ha 1 sola scena (comune), `--parallel` non fa nulla.

**Nuovo approccio — chunked frame parallelism:**

1. **Split per chunk, non per scena:**
   ```
   totalFrames = 900, workers = 3
   Worker 0: frame 0-299   → segment-0.mp4
   Worker 1: frame 300-599 → segment-1.mp4
   Worker 2: frame 600-899 → segment-2.mp4
   ```

2. **Ogni worker:**
   - Lancia Playwright indipendente
   - Carica lo stesso HTML
   - Chiama `__setFrame(f)` per il suo range
   - Encode a temp .mp4 (software h264, affidabile)

3. **Concat:** Identico a oggi — `ffmpeg -f concat -c copy output.mp4`

**Vantaggi vs oggi:**
- Funziona con 1 scena (il caso più comune!)
- Speedup lineare con i core: 3-4x su 8 core
- Nessun cambio all'HTML o al frame renderer

**File da modificare:**
- `parallel-render.ts` — Riscrivere `buildSceneSegments()` → `buildFrameChunks()`, fix bug `__setFrame`
- `index.ts` — Passare `totalFrames` a parallel render (oggi passa solo scenes)

**Implementazione `buildFrameChunks()`:**
```typescript
interface FrameChunk {
  workerId: number;
  startFrame: number;
  endFrame: number;  // exclusive
}

function buildFrameChunks(totalFrames: number, workerCount: number): FrameChunk[] {
  const framesPerWorker = Math.ceil(totalFrames / workerCount);
  return Array.from({ length: workerCount }, (_, i) => ({
    workerId: i,
    startFrame: i * framesPerWorker,
    endFrame: Math.min((i + 1) * framesPerWorker, totalFrames),
  }));
}
```

**Effort:** ~150 righe modificate. 1 file riscritto (`parallel-render.ts`), 1 file modificato (`index.ts`).

---

### B3. Pipe diretto (PNG, no JPEG)

**Cosa:** Passare da JPEG quality 100 a PNG lossless per eliminare artefatti di compressione.

**Come funziona oggi (capture.ts + encode.ts):**
```
page.screenshot({ type: 'jpeg', quality: 100 })
    ↓
encoder.write(jpegBuffer)  →  FFmpeg stdin (image2pipe, -c:v mjpeg)
    ↓
h264 output
```

**Problema:** JPEG quality 100 è *quasi* lossless ma introduce artefatti visibili su:
- Testo piccolo (bordi sfumati)
- Gradienti (banding)
- Bordi netti (ringing)

**Nuovo approccio:**

```
page.screenshot({ type: 'png' })
    ↓
encoder.write(pngBuffer)  →  FFmpeg stdin (image2pipe, senza -c:v mjpeg)
    ↓
h264 output
```

**Cambio minimo:**

`capture.ts`:
```typescript
// Prima:
const buffer = await session.page.screenshot(
  fmt === 'jpeg' ? { type: 'jpeg', quality: 100 } : { type: 'png' }
);

// Dopo: default diventa 'png'
const fmt = opts.captureFormat ?? 'png';  // era 'jpeg'
```

`encode.ts`:
```typescript
// Prima:
...(inputFmt === 'jpeg' ? ['-c:v', 'mjpeg'] : []),

// Dopo: nessun codec di input per PNG (FFmpeg lo autodetecta)
// La riga esiste già: quando inputFmt !== 'jpeg', non aggiunge -c:v mjpeg
```

**Trade-off:**
- PNG è ~3x più grande per frame → più dati su stdin pipe
- Ma elimina *tutti* gli artefatti di compressione
- Il collo di bottiglia è lo screenshot Playwright (~50-200ms), non il transfer su pipe
- `--draft` può continuare a usare JPEG per velocità

**File da modificare:**
- `capture.ts` — Cambiare default `captureFormat` da `'jpeg'` a `'png'`
- `encode.ts` — Già gestito (nessun cambio necessario)
- `index.ts` — Draft mode forza `captureFormat: 'jpeg'` per velocità

**Effort:** ~5 righe. Cambio banale.

---

## Priorità di implementazione

| # | Feature | Effort | Impatto | Dipendenze |
|---|---------|--------|---------|------------|
| **B3** | PNG pipe | 5 righe | Medio — qualità lossless | Nessuna |
| **B1** | Preview | ~200 righe | Enorme — vedi prima di renderizzare | Nessuna |
| **B2** | Parallel frame | ~150 righe | Alto — 3-4x speedup su qualsiasi video | Nessuna |
| **A5** | Bug fix visivi | ~300 righe | Alto — fix problemi base (testo invisibile, card vuote) | Nessuna |
| **A4** | Web fonts | ~50 righe | Alto — tipografia professionale subito | Nessuna |
| **A3** | Decorativi espansi | ~400 righe | Medio-alto — profondità visiva | Nessuna |
| **A1** | Arbitrary CSS per frame | ~500 righe | Enorme — sblocca tutto il CSS moderno | Richiede redesign AnimationDef |
| **A2** | Raw CSS injection | ~100 righe | Alto — escape hatch per effetti custom | Richiede A1 |

**Ordine suggerito:** B3 → B1 → A5 → A4 → B2 → A3 → A1 → A2

---

## File coinvolti

| File | Modifiche |
|------|-----------|
| `engine/src/capture.ts` | B3: default PNG; B1: skip `__VIDEO_RENDER__` in preview |
| `engine/src/encode.ts` | B3: nessuna modifica (già gestito) |
| `engine/src/parallel-render.ts` | B2: riscrittura chunk-based + fix bug `__setFrame` |
| `engine/src/html-generator.ts` | B1: inject player overlay; A1: arbitrary CSS; A2: raw CSS block; A4: font embedding |
| `engine/src/index.ts` | B1: `--preview` flag + HTTP server; B2: pass totalFrames; B3: draft→JPEG |
| `engine/src/frame-renderer.ts` | A1: arbitrary CSS property map |
| `engine/src/interpolate.ts` | A1: extend property types |
| `engine/src/decorative.ts` | A3: 8+ nuovi tipi decorativi |
| `engine/src/autogen.ts` | A5: fix card vuote, colori ignorati, scene corte |
| `engine/src/composition.ts` | A5: fix sfondo bianco |

---

## Verifica

- [ ] B3: Video renderizzato con PNG ha zero artefatti su testo piccolo e gradienti
- [ ] B1: `--preview` apre browser, slider funziona, play/pause funziona, shortcuts funzionano
- [ ] B2: Video single-scene con `--parallel` è 2x+ più veloce di sequential
- [ ] B2: Output identico tra sequential e parallel (no frame mancanti, no artefatti di concat)
- [ ] A5: Nessun testo invisibile, card hanno contenuto, scene ≥ 3.5s, colori input rispettati
- [ ] A4: Font professionali visibili nel video
- [ ] A3: Almeno 3 nuovi decorativi visibili a occhio nudo
- [ ] A1: Animazione con `backdrop-filter` animato per frame funziona end-to-end

---

*Implementato 2026-02-14.*

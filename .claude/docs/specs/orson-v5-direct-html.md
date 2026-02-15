# Spec: Orson v5 — Direct HTML Architecture

**Data:** 2026-02-14
**Stato:** COMPLETATO

---

## Diagnosi

Orson v4 ha un'architettura che **limita Claude** invece di amplificarlo:

```
Claude (sa scrivere HTML/CSS eccellente)
  ↓ costretto a compilare content.json
    ↓ autogen (heuristics fragili, 500+ righe)
      ↓ director (ricette rigide)
        ↓ composition (layout fissi)
          ↓ HTML mediocre con bug ricorrenti
```

**Risultato concreto:** testo sovrapposto, overflow, layout rotti, contenuto duplicato, qualità visiva amatoriale. Ogni fix introduce nuovi bug perché il sistema ha troppi code path interconnessi.

**Prova:** l'HTML scritto a mano in `test-output/format-test/handcrafted/video.html` è qualitativamente superiore all'output autogen con un decimo della complessità.

---

## Obiettivo v5

Eliminare l'astrazione autogen e lasciare che Claude scriva HTML direttamente, mantenendo l'infrastruttura di rendering che funziona.

```
NUOVO:
Claude scrive HTML + CSS + timeline inline
  ↓ self-contained HTML con __setFrame(n)
    ↓ Playwright cattura frame → FFmpeg codifica
      ↓ audio system aggiunge musica + narrazione
```

---

## Cosa TENERE (infrastruttura solida)

| Componente | File | Perché tenerlo |
|-----------|------|----------------|
| HTML parser | `html-parser.ts` | Parsifica @video/@scene comments → timing |
| Capture pipeline | `capture.ts` | Playwright __setFrame(n) → screenshot PNG |
| Encoder | `encode.ts` | FFmpeg pipe, HW detection, codec selection |
| Parallel render | `parallel-render.ts` | Chunk-based frame parallelism |
| Audio system | `audio/` tutto | TTS, music selection, mixing, ducking |
| Preview | `index.ts` (preview part) | localhost server, player overlay |
| Demo mode | `demo-*.ts` | Live website recording |
| Format presets | `presets.ts` | Risoluzioni, fps, speed presets |
| Batch mode | `batch.ts` | Multi-variant rendering |
| Interpolate + spring | `interpolate.ts` | Easing functions, spring physics |
| Design tokens | `ux-bridge.ts` | Integrazione seurat |

## Cosa ELIMINARE (autogen layer)

| Componente | File | Perché eliminarlo |
|-----------|------|-------------------|
| Autogen | `autogen.ts` | Content cursor, scene types, heuristics — tutto fragile |
| Director | `director.ts` | Ricette rigide che non si adattano al contenuto |
| Composition | `composition.ts` | Background patterns hardcoded |
| Choreography | `choreography.ts` | Stagger/Disney logic troppo astratta |
| Layout profiles | `layout-profiles.ts` | 8 layout fissi insufficienti |
| Actions (parziale) | `actions.ts` | Entrance selection heuristics (tenere solo il catalogo) |
| HTML generator | `html-generator.ts` | Il più grosso — genera HTML mediocre da timeline |
| Frame renderer gen | `frame-renderer.ts` | Non serve — Claude scrive __setFrame inline |
| Decorative (parziale) | `decorative.ts` | CSS generato — Claude lo scrive meglio direttamente |
| Timeline | `timeline.ts` | expandAnimation, gap fix — non servono con approccio diretto |

## Cosa AGGIUNGERE

### 1. Animation Runtime Library (~80 righe)

Un file JS minimale che Claude include inline nel HTML. Fornisce:

- Easing functions (20+ già in interpolate.ts)
- `lerp()`, `clamp()`
- Helper `A(selector, property, offset, duration, from, to, easing)` per definire animazioni in modo compatto
- `__setFrame(n)` generico che processa un array di scene + animazioni
- Scene visibility con crossfade automatico

```javascript
// Claude include questo nel <script> di ogni video
// ~80 righe, zero dipendenze
<script src="orson-runtime.js"></script>
```

Oppure inline (come nel prototipo handcrafted). L'importante è che sia compatto e riutilizzabile.

### 2. Component Snippets Library

Invece di layout-profiles.ts, un catalogo markdown che Claude consulta:

```
.claude/skills/orson/references/components.md
```

Contiene pattern CSS copia-incolla per:
- Hero layouts (centered, split, asymmetric)
- Feature cards (horizontal, vertical, grid)
- Code blocks con syntax highlighting
- Comparison layouts (before/after, side-by-side)
- Stats/metrics display
- CTA sections
- Glassmorphism cards
- Terminal/browser mockups
- Progress bars, charts
- Gradient backgrounds, mesh gradients

Claude sceglie e adatta — non è vincolato a un set fisso.

### 3. Aggiornamento SKILL.md

La sezione "Guided Flow" di SKILL.md cambia:

**Prima (v4):**
```
Phase 3: STORYBOARD
  → Build content JSON
  → Run autogen
  → Verify scenes
```

**Dopo (v5):**
```
Phase 3: STORYBOARD
  → Claude writes HTML directly for each scene
  → Uses design tokens from seurat (if available)
  → Includes animation runtime inline
  → Each scene: CSS layout + animated elements
  → @video and @scene comments for the parser
```

### 4. Format Adaptation

Claude adatta il CSS al formato target. Non c'è un sistema di layout fisso — Claude scrive CSS responsive per il viewport specifico:

- **16:9 (1920×1080):** Layout orizzontali, split left/right per feature
- **9:16 (1080×1920):** Layout verticali, contenuto impilato
- **1:1 (1080×1080):** Layout centrati, elementi compatti
- **4:5 (1080×1350):** Mix verticale/centrato
- **4:3 (1440×1080):** Simile a 16:9 ma più compatto
- **21:9 (2560×1080):** Ultra-wide, molto spazio laterale

---

## Contratto HTML

Ogni video HTML deve avere:

```html
<!-- @video format="horizontal-16x9" fps="60" speed="normal" mode="cocomelon" codec="h265" output="./output/video.mp4" -->
```

Ogni scena deve avere:

```html
<!-- @scene name="Scene Name" duration="4000ms" transition-out="crossfade" transition-duration="500ms" -->
<div class="scene" id="scene-N">
  <!-- elementi con data-el="sN-eM" -->
</div>
```

Il JS deve implementare:

```javascript
window.__setFrame = function(n) { /* ... */ };
window.__frameRendererReady = true;
```

Tutto il resto è a discrezione di Claude.

---

## Piano di implementazione

### Step 1: Creare animation runtime
- Estrarre easing functions da `interpolate.ts`
- Creare `engine/src/runtime.ts` (o `.js`) — esportabile come stringa inline
- ~80 righe: easings + scene manager + style application

### Step 2: Creare components library
- `references/components.md` — catalogo di CSS patterns
- 15-20 componenti con codice copia-incolla
- Esempi per ogni formato (horizontal, vertical, square)

### Step 3: Aggiornare SKILL.md
- Rimuovere sezioni autogen (Phase 3 storyboard, content JSON, autogen CLI)
- Aggiungere sezione "Claude writes HTML directly"
- Documentare il contratto HTML (@video, @scene, __setFrame)
- Documentare il runtime e i componenti disponibili

### Step 4: Pulizia codice
- Rimuovere: `autogen.ts`, `director.ts`, `composition.ts`, `choreography.ts`, `layout-profiles.ts`
- Rimuovere: `html-generator.ts`, `frame-renderer.ts`, `timeline.ts`
- Tenere: `actions.ts` (solo il catalogo ENTRANCES come riferimento)
- Tenere: `decorative.ts` (solo come riferimento CSS per Claude)
- Aggiornare `index.ts` — rimuovere comando `autogen`

### Step 5: Test end-to-end
- Generare video in tutti i 6 formati con il nuovo flusso
- Verificare: layout, animazioni, audio, preview, parallel render
- Confronto qualitativo con output v4

---

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Claude genera HTML con bug CSS | I bug sono visibili nella preview — fix immediato. Molto più facile che debuggare autogen |
| Ogni video richiede più lavoro per Claude | Il lavoro è **creativo** (scrivere HTML), non **meccanico** (debuggare heuristics). Claude è ottimo in questo |
| Niente batch mode automatico | Batch mode resta — Claude genera un template con variabili, batch.ts lo processa |
| Perdita di "one-click" generation | Il flusso guidato resta. Claude fa le scelte creative, l'utente approva. La differenza è che Claude scrive HTML invece di compilare JSON |

---

## Metriche di successo

1. **Zero** testo sovrapposto o fuori viewport
2. **Zero** contenuto duplicato tra scene
3. Qualità visiva almeno pari al prototipo handcrafted
4. Tempo di rendering invariato (stessa pipeline)
5. Tutti i 6 formati producono output corretto
6. Audio system funziona identicamente
7. Codice engine ridotto del ~60% (rimozione autogen layer)

---

*Implementato 2026-02-14.*

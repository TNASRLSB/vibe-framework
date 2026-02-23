# Feature: Orson Animation Engine Upgrades (Remotion-Inspired)

**Status:** COMPLETED
**Created:** 2026-02-23 14:00 UTC
**Approved:** 2026-02-23
**Completed:** 2026-02-23

---

## 1. Overview

**What?** Portare in Orson 7 miglioramenti ispirati dall'analisi del progetto Remotion `creativly.ai-brand-video-remotion`, coprendo spring physics, Perlin noise, SVG path evolution, particle system, transition overlap automatico, camera shake, e randomness deterministica.

**Why?** Remotion produce animazioni percettibilmente più naturali e cinematiche grazie a spring physics reali, movimenti organici via noise, e particle system sofisticati. Orson oggi simula questi effetti con easing curve statiche e `Math.sin`, che producono un look "meccanico" riconoscibile. Questi upgrade chiudono il gap qualitativo senza cambiare l'architettura HTML-first di Orson.

**For whom?** Tutti i video generati da Orson — sia `/orson create` che `/orson demo`.

**Success metric:** Video che usano spring/noise/particles devono essere visivamente distinguibili dai video attuali in un A/B test. Nessuna regressione sui video esistenti (backward compatible).

---

## 2. Analisi Comparativa di Riferimento

### Cosa fa Remotion che Orson non fa

| Capacità | Remotion | Orson oggi | Gap |
|----------|----------|------------|-----|
| Spring physics | `spring({ damping, stiffness, mass })` — damped harmonic oscillator reale | `easeOutBack`, `easeOutElastic` — curve statiche hardcoded | Le curve statiche non reagiscono a parametri fisici; overshoot e settling sono approssimazioni |
| Perlin noise | `@remotion/noise` — `noise2D(seed, x, y)` per drift organico | `Math.sin(frame * k)` nei looping animations | Sin produce movimenti periodici prevedibili; noise è aperiodico e organico |
| SVG path evolution | `evolvePath(progress, path)` → strokeDasharray/offset animati | `clipRight`/`backgroundSizeX` per effetti "draw" | clip-path non può seguire curve SVG arbitrarie |
| Particle system | 60+ particelle con seeded random, drift, pulse, opacity | `particle-dots` in `decorative.ts` — 12 punti statici CSS | Particelle statiche, nessun movimento per-particella |
| Transition overlap | `TransitionSeries` calcola overlap automatico | XFADE manuale nel `var scenes = [...]` | Claude deve calcolare a mano start frame di ogni scena |
| Camera shake | `noise2D("camera-x", frame * 0.02)` per micro-vibrazioni | Solo push-in/pan/drift lineari | Camera troppo fluida, manca tensione cinematica |
| Deterministic random | `seededRandom(seed)` per posizioni ripetibili | Nessun seed — `Math.random()` in `selectEntranceByRole` | Frame diversi tra render (ma irrilevante nel runtime HTML perché il layout è statico) |

---

## 3. Upgrade Plan — 7 Moduli

### UPG-1: Spring Physics nel Runtime

**Impatto:** ALTO
**Complessità:** MEDIA
**Cosa:** Aggiungere una funzione `SP()` (Spring) al runtime inline che calcola un damped harmonic oscillator frame-by-frame.

**Come funziona in Remotion:**
```javascript
// Remotion: spring con parametri fisici
const entrance = spring({
  frame: Math.max(0, frame - delay),
  fps: 30,
  config: { damping: 14, stiffness: 120, mass: 0.4 }
});
const scale = interpolate(entrance, [0, 1], [0.3, 1]);
```
Il valore di `entrance` va da 0 a 1 seguendo una curva fisica reale con overshoot, oscillazione, e settling naturali. Parametri diversi producono feel diversi:
- `damping: 200` → snappy, quasi nessun overshoot
- `damping: 10, stiffness: 120` → bouncy, oscillazioni visibili
- `damping: 5, mass: 2` → lento, pesante, molta oscillazione

**Cosa cambia in Orson:**

Oggi per un'entrata "spring" Claude scrive:
```javascript
// Multi-keyframe che simula spring — valori hardcoded
A('[data-el="s0-e0"]', 'scale', 0, 40, 0.5, 1, 'outBack');
```
`outBack` ha overshoot fisso (c=1.70158). Non è configurabile.

Con UPG-1 Claude scriverà:
```javascript
// Spring reale con parametri fisici
SP('[data-el="s0-e0"]', 'scale', 0, 0.5, 1, { k: 120, c: 14, m: 0.4 });
```
La durata è calcolata automaticamente (fino a settling). I parametri controllano il feel.

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere `SP()` al runtime JS string (~25 righe):
```javascript
// SP(selector, property, startOffset, from, to, config)
// config: { k: stiffness, c: damping, m: mass }
window.SP = function(sel, prop, offset, from, to, cfg) {
  var k = cfg.k || 100, c = cfg.c || 10, m = cfg.m || 1;
  return { sel: sel, prop: prop, offset: offset, from: from, to: to,
           spring: true, k: k, c: c, m: m };
};
```

Nella funzione `__setFrame`, prima di `applyAnim`, aggiungere branch per spring:
```javascript
function applySpring(el, anim, localFrame) {
  var f = localFrame - anim.offset;
  if (f <= 0) { /* set to from */ return; }
  // Euler integration del damped harmonic oscillator
  var dt = 1/FPS, pos = 0, vel = 0;
  for (var i = 0; i < f; i++) {
    var springForce = -anim.k * (pos - 1);
    var dampForce = -anim.c * vel;
    vel += (springForce + dampForce) / anim.m * dt;
    pos += vel * dt;
  }
  var v = anim.from + (anim.to - anim.from) * pos;
  // apply to element property...
}
```

**Nota:** `interpolate.ts` ha già `spring()` e `SpringConfig` lato Node (usati da `actions.ts` per calcoli server-side). Il runtime inline NON importa da `interpolate.ts` — è JS autocontenuto. Quindi `SP()` è un'implementazione parallela leggera (~25 righe) del solver per il browser.

**File: `engine/src/actions.ts`** — Aggiungere flag `useSpring?: SpringConfig` alle AnimationDef che beneficiano di spring reali:
- `spring-up`, `spring-scale`, `spring-left` — attualmente usano multi-keyframe che simulano spring
- `bounce-in`, `bounce-in-up`, `bounce-in-down` — overshoot hardcoded
- `elastic-in` — simulazione di elastic via keyframe

**File: `references/html-contract.md`** — Documentare `SP()` con esempi e preset:
```
| Preset    | k   | c   | m   | Feel                    |
|-----------|-----|-----|-----|-------------------------|
| snappy    | 200 | 26  | 1   | Veloce, quasi nessun overshoot |
| bouncy    | 120 | 14  | 0.4 | Playful, oscillazione visibile |
| heavy     | 80  | 8   | 2   | Lento, pesante, molto overshoot |
| elastic   | 150 | 6   | 0.5 | Springy, molte oscillazioni |
```

**File: `SKILL.md`** — Aggiungere `SP()` alla sezione animazioni della Phase 3.

**Backward compatibility:** `A()` resta invariato. `SP()` è additivo. Video esistenti funzionano senza modifiche.

---

### UPG-2: Perlin Noise nel Runtime

**Impatto:** MEDIO
**Complessità:** BASSA
**Cosa:** Aggiungere una funzione `noise2D(seed, x, y)` al runtime per movimenti organici aperiodici.

**Come funziona in Remotion:**
```javascript
import { noise2D } from "@remotion/noise";
// Cursor drift organico
const driftX = noise2D("cursor-x", frame * 0.02, 0) * 50;
const driftY = noise2D("cursor-y", 0, frame * 0.015) * 20;
// Float organico per particelle
const float = noise2D("float-y", particleIndex * 0.1, frame * 0.01) * 15;
```
Ogni seed produce una curva diversa ma deterministica. Il risultato è drift non ripetitivo e naturale.

**Cosa cambia in Orson:**

Oggi i looping di Orson usano keyframe sinusoidali:
```javascript
// float: y va 0 → -8 → 0 in loop — movimento periodico prevedibile
'float': { properties: { y: kf([0, 0.5, 1], [0, -8, 0]) } }
```

Con UPG-2 Claude potrà scrivere:
```javascript
// N(selector, property, seed, speed, amplitude, offset)
N('[data-el="s0-orb1"]', 'x', 'orb1-x', 0.02, 30, 0);
N('[data-el="s0-orb1"]', 'y', 'orb1-y', 0.015, 20, 0);
```
Il risultato: drift organico, mai ripetitivo, diverso per ogni elemento.

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere implementazione Perlin 2D (~40 righe) + funzione `N()`:

L'implementazione classic Perlin 2D è ~35 righe di JS:
```javascript
// Permutation table (256 values, seeded)
// grad2D, fade, lerp functions
// noise2D(x, y) → [-1, 1]
```

Poi la funzione N():
```javascript
// N(selector, property, seed, speed, amplitude, centerValue)
window.N = function(sel, prop, seed, speed, amp, center) {
  return { sel: sel, prop: prop, seed: seed, speed: speed,
           amp: amp, center: center, noise: true };
};
```

In `__setFrame`, per le animazioni noise:
```javascript
function applyNoise(el, anim, globalFrame) {
  var seedOffset = hashString(anim.seed); // deterministic da stringa
  var v = anim.center + noise2D(globalFrame * anim.speed + seedOffset, seedOffset) * anim.amp;
  // apply to element property...
}
```

**File: `references/html-contract.md`** — Documentare `N()` con use case:
```
| Use Case              | speed | amplitude | Risultato              |
|-----------------------|-------|-----------|------------------------|
| Orb drift lento       | 0.01  | 30px      | Movimento atmosferico  |
| Camera shake leggero  | 0.05  | 2px       | Micro-vibrazione       |
| Particella float      | 0.02  | 15px      | Galleggiamento organico|
| Rotazione organica    | 0.008 | 3deg      | Oscillazione naturale  |
```

**File: `references/visual-recipes.md`** — Aggiungere `N()` ai pattern di camera motion (drift) e decorative (orb movement).

**Sinergia con UPG-6 (Camera Shake):** La funzione `N()` è il building block per il camera shake cinematico.

---

### UPG-3: SVG Path Evolution

**Impatto:** MEDIO
**Complessità:** MEDIA
**Cosa:** Aggiungere supporto per animare lo "stroke drawing" di path SVG arbitrari, equivalente a `evolvePath()` di Remotion.

**Come funziona in Remotion:**
```javascript
import { evolvePath } from "@remotion/paths";
// Animate underline drawing
const progress = interpolate(frame, [50, 75], [0, 1]);
const evolved = evolvePath(progress, underlinePath);
<path d={underlinePath}
      strokeDasharray={evolved.strokeDasharray}
      strokeDashoffset={evolved.strokeDashoffset} />
```
Qualsiasi path SVG (curva, linea, forma) viene "disegnato" progressivamente controllando dasharray/dashoffset.

**Cosa cambia in Orson:**

Oggi Orson simula il "draw" con clip-path o backgroundSizeX:
```javascript
// underline-draw: backgroundSizeX 0% → 100% — solo linea orizzontale retta
A('[data-el="s0-e2"]', 'backgroundSizeX', 0, 30, 0, 100, 'outCubic');
// scaleX expand — altra simulazione limitata a linee rette
A('[data-el="s0-line"]', 'scaleX', 0, 40, 0, 1, 'outBack');
```
Non può disegnare curve, cerchi, forme complesse.

Con UPG-3 Claude potrà scrivere:
```html
<svg viewBox="0 0 400 50" data-el="s0-underline">
  <path d="M 0 25 Q 100 0, 200 25 T 400 25" stroke="#fff" fill="none"
        stroke-width="3" data-draw="s0-underline-path" />
</svg>
```
```javascript
// D(selector, startOffset, duration, from, to, easing)
D('[data-draw="s0-underline-path"]', 50, 40, 0, 1, 'outExpo');
```

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere ~20 righe:
```javascript
// D(selector, startOffset, duration, from, to, easingName)
// Anima strokeDashoffset di un SVG path element
window.D = function(sel, offset, dur, from, to, e) {
  return { sel: sel, offset: offset, dur: dur, from: from, to: to,
           ease: ease[e || 'outCubic'], draw: true };
};
```

In `__setFrame`, init per path draw:
```javascript
// Al primo frame, calcola getTotalLength() e setta dasharray
if (!el._pathLen) {
  el._pathLen = el.getTotalLength();
  el.style.strokeDasharray = el._pathLen;
}
// Progress 0→1 → dashoffset pathLen→0
var progress = lerp(anim.from, anim.to, t);
el.style.strokeDashoffset = el._pathLen * (1 - progress);
```

**File: `engine/src/interpolate.ts`** — Nessuna modifica (il calcolo è nel runtime inline).

**File: `references/html-contract.md`** — Documentare `D()` con esempi:
- Underline curvo
- Logo draw-on
- Connessioni tra nodi (bezier)
- Bordi di forme (cerchio, rettangolo arrotondato)
- Flow arrows tra scene elements

**File: `references/components.md`** — Aggiungere pattern SVG per underline, connector, shape outline.

**Nuove proprietà animabili:** `strokeDashoffset` viene gestito direttamente dal draw handler, non serve aggiungerlo a `KnownAnimatableProperty` (è un flusso separato da `A()`).

---

### UPG-4: Particle System

**Impatto:** MEDIO
**Complessità:** BASSA
**Cosa:** Sostituire i `particle-dots` statici di `decorative.ts` con un sistema di particelle animate frame-by-frame nel runtime.

**Come funziona in Remotion:**
```javascript
// 60 particelle con posizioni determinate da seeded random
// Ciascuna con drift sine/cosine, pulse opacity, fade-in globale
{Array.from({ length: 60 }).map((_, i) => {
  const x = seededRandom(i * 100) * 1920;
  const y = seededRandom(i * 200) * 1080;
  const driftX = Math.sin(frame * 0.01 + i) * 20;
  const driftY = Math.cos(frame * 0.008 + i * 0.5) * 15;
  const pulse = 0.3 + Math.sin(frame * 0.03 + i * 0.7) * 0.2;
  return <div style={{ left: x + driftX, top: y + driftY, opacity: pulse }} />;
})}
```

**Cosa cambia in Orson:**

Oggi `decorative.ts` genera 12 punti statici posizionati con modulo:
```javascript
// particle-dots: 12 div posizionati con formula (i*37+index*17)%90
// NESSUN movimento — sono punti fissi
```

Con UPG-4 si crea un generatore che produce l'HTML + le animazioni `N()` (da UPG-2) per ogni particella:

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere funzione `P()` (Particles):
```javascript
// P(containerSelector, count, config)
// config: { sizeRange: [2,6], opacityRange: [0.1,0.4], driftSpeed: 0.015, driftAmp: 20 }
// Genera particelle nell'init e le anima via noise nel __setFrame
window.P = function(containerSel, count, cfg) {
  return { containerSel: containerSel, count: count, cfg: cfg, particles: true };
};
```

Nell'init (eseguito una volta):
```javascript
// Per ogni particella:
// - Posizione iniziale via seeded random
// - Crea <div> con size random nel range
// - Ogni particella ha seed unico per noise drift x/y/opacity
```

In `__setFrame`:
```javascript
// Per ogni particella:
// - x = baseX + noise2D(seed+'x', frame*speed) * amp
// - y = baseY + noise2D(seed+'y', frame*speed) * amp
// - opacity = baseOpacity + noise2D(seed+'o', frame*0.03) * 0.15
```

**File: `engine/src/decorative.ts`** — Aggiornare `generateParticleDots` per generare il container + la chiamata `P()`:
```javascript
function generateParticleDots(accentColor: string, index: number): string {
  // Genera container + <script> con P() call
  return `<div data-particles="scene-${index}" class="deco" style="position:absolute;inset:0;pointer-events:none;z-index:0;"></div>`;
  // La chiamata P() viene aggiunta allo script block delle animazioni
}
```

**File: `references/visual-recipes.md`** — Aggiornare ricette che usano particelle (Cyberpunk, Holographic, Vaporwave, Organic) con il nuovo pattern.

**Dipendenza:** Richiede UPG-2 (Perlin noise) per il drift organico. Senza noise, le particelle useranno sin/cos come fallback (comunque meglio dei punti statici).

---

### UPG-5: Transition Overlap Automatico

**Impatto:** ALTO
**Complessità:** MEDIA
**Cosa:** Calcolare automaticamente `start` frame di ogni scena nella fase di parsing, basandosi su durate e transizioni dichiarate nei commenti `@scene`, eliminando il calcolo manuale.

**Come funziona in Remotion:**
```jsx
// TransitionSeries calcola overlap automaticamente
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={105}>
    <IntroScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 18 })}
  />
  <TransitionSeries.Sequence durationInFrames={165}>
    <FlowDemoScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
// Remotion gestisce: FlowDemoScene.start = IntroScene.end - 18 (overlap)
```

**Cosa cambia in Orson:**

Oggi Claude deve calcolare a mano ogni start frame:
```javascript
// Claude deve fare: scene 0 = 240 frames, XFADE = 30
// Quindi scene 1 start = 240 - 30 = 210
// Scene 1 = 300 frames, quindi scene 2 start = 210 + 300 - 30 = 480
// Errore frequente: calcoli sbagliati → scene che si sovrappongono male
var scenes = [
  { id: 'scene-0', start: 0, frames: 240 },
  { id: 'scene-1', start: 210, frames: 300 },
  { id: 'scene-2', start: 480, frames: 270 },
];
```

Con UPG-5 Claude scriverà solo:
```javascript
var scenes = [
  { id: 'scene-0', frames: 240 },
  { id: 'scene-1', frames: 300 },
  { id: 'scene-2', frames: 270 },
];
var XFADE = 30;
// Il runtime calcola start automaticamente!
```

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere calcolo auto-start nell'init:
```javascript
// Se scene[0].start è undefined, calcola automaticamente
if (scenes[0].start === undefined) {
  scenes[0].start = 0;
  for (var i = 1; i < scenes.length; i++) {
    scenes[i].start = scenes[i-1].start + scenes[i-1].frames - XFADE;
  }
}
```

Questo è backward-compatible: se `start` è già definito (video esistenti), non viene sovrascritto.

**File: `engine/src/html-parser.ts`** — Aggiornare il parser per:
1. Estrarre `transition-duration` da ogni `@scene` comment
2. Calcolare XFADE per-transizione (non globale) se necessario
3. Supportare transizioni con durate diverse tra scene

**Estensione futura: XFADE per-transizione:**
```javascript
// Opzionale: XFADE diverso tra coppie di scene
var xfades = [30, 20, 40, 0]; // 0 = cut (nessun overlap)
```
Il runtime userebbe `xfades[i-1]` per calcolare `scenes[i].start`. Questo va oltre il XFADE globale e permette mix di crossfade (30f), wipe (20f), e cut (0f) nello stesso video.

**File: `references/html-contract.md`** — Aggiornare la documentazione:
- `start` diventa opzionale nel `var scenes`
- Documentare il calcolo automatico
- Documentare il pattern `xfades[]` per transizioni variabili

**File: `SKILL.md`** — Semplificare le istruzioni Phase 3 per Claude: non deve più calcolare start frame manualmente.

**Rischio:** Claude potrebbe continuare a scrivere `start` esplicitamente per abitudine. Nessun problema — il codice è backward compatible.

---

### UPG-6: Camera Shake via Noise

**Impatto:** BASSO-MEDIO
**Complessità:** BASSA
**Cosa:** Aggiungere pattern di camera shake cinematico usando la funzione `N()` di UPG-2.

**Come funziona in Remotion:**
```javascript
// Micro-shake della camera per tensione cinematica
const shakeX = noise2D("cam-shake-x", frame * 0.05, 0) * 2;
const shakeY = noise2D("cam-shake-y", 0, frame * 0.04) * 1.5;
<div style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
  {/* scene content */}
</div>
```
Usato nella FlowDemoScene per dare "vita" alla camera durante il pan.

**Cosa cambia in Orson:**

Oggi la camera è perfettamente fluida:
```javascript
// Push-in lineare — zero vibrazione
A('[data-el="s0-cam"]', 'scale', 0, 210, 1, 1.06, 'inOutSine');
```

Con UPG-6 si sovrappone uno shake via noise:
```javascript
// Camera push-in + shake organico
A('[data-el="s0-cam"]', 'scale', 0, 210, 1, 1.06, 'inOutSine');
N('[data-el="s0-cam"]', 'x', 'cam0-sx', 0.05, 2, 0);
N('[data-el="s0-cam"]', 'y', 'cam0-sy', 0.04, 1.5, 0);
```

**Implementazione:**

Nessun nuovo codice engine — usa `N()` da UPG-2. L'implementazione è puramente documentale:

**File: `references/visual-recipes.md`** — Aggiungere pattern camera shake:
```
### Camera Shake
Sovrapponi `N()` alla camera per micro-vibrazioni cinematiche.
| Intensità | speed x | speed y | amp x | amp y | Quando |
|-----------|---------|---------|-------|-------|--------|
| Subtle    | 0.03    | 0.025   | 1px   | 0.8px | Scenes normali, tensione sottile |
| Medium    | 0.05    | 0.04    | 2px   | 1.5px | Action scenes, momenti drammatici |
| Heavy     | 0.08    | 0.07    | 4px   | 3px   | Impatto, glitch, chaos mode |
```

**File: `references/html-contract.md`** — Aggiungere esempio di camera con push-in + shake.

**File: `references/visual-recipes.md`** — Associare shake intensity alle ricette estetiche:
- Brutalist, Cyberpunk, Glitch Art → Medium/Heavy shake
- Editorial, Swiss, Kinetic Minimalism → No shake o Subtle
- Film Noir, Neon Noir → Subtle shake

**Dipendenza:** Richiede UPG-2 (Perlin noise).

---

### UPG-7: Deterministic Seeded Random

**Impatto:** BASSO
**Complessità:** BASSA
**Cosa:** Aggiungere una funzione `R(seed)` al runtime per generare valori pseudo-casuali deterministici, garantendo che lo stesso video produca lo stesso output visivo ad ogni render.

**Come funziona in Remotion:**
```javascript
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
// Usato per posizioni particelle, timing stagger, colori varianti
const x = seededRandom(particleIndex * 100) * 1920;
```

**Cosa cambia in Orson:**

Oggi `decorative.ts` usa formule modulari per posizioni:
```javascript
const x = ((i * 37 + index * 17) % 90) + 5;  // deterministico ma limitato
```
E `actions.ts` usa `Math.random()`:
```javascript
const id = pickFrom[Math.floor(Math.random() * pickFrom.length)]; // non-deterministico
```

Con UPG-7 il runtime ha `R()`:
```javascript
// R(seed) → [0, 1) deterministic
// Usabile per: posizioni particelle, stagger variazione, opacity varianti
var baseX = R(i * 100 + 1) * 1920;
var baseY = R(i * 100 + 2) * 1080;
var size = 2 + R(i * 100 + 3) * 4;
```

**Implementazione:**

**File: `engine/src/runtime.ts`** — Aggiungere `R()` (~3 righe):
```javascript
window.R = function(seed) {
  var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
```

**File: `engine/src/actions.ts`** — Opzionale: sostituire `Math.random()` in `selectEntranceByRole` con seeded variant per render deterministici lato Node.

**File: `references/html-contract.md`** — Documentare `R()` con use case.

**Nota:** L'impatto è basso perché il layout HTML è già deterministico (Claude scrive posizioni esatte). `R()` diventa utile principalmente con UPG-4 (Particle System) dove le posizioni sono generate a runtime.

---

## 4. Files to Modify

| File | Action | Upgrades | Changes |
|------|--------|----------|---------|
| `engine/src/runtime.ts` | Modify | UPG-1,2,3,4,5,7 | Aggiungere SP(), N(), D(), P(), R(), auto-start, spring solver, noise2D |
| `engine/src/interpolate.ts` | — | — | Nessuna modifica (spring esiste già lato Node) |
| `engine/src/actions.ts` | Modify | UPG-1 | Flag `useSpring` sulle AnimationDef spring-* |
| `engine/src/decorative.ts` | Modify | UPG-4 | Aggiornare generateParticleDots per container + P() |
| `engine/src/html-parser.ts` | Modify | UPG-5 | Auto-calcolo start frame da @scene metadata |
| `references/html-contract.md` | Modify | UPG-1,2,3,4,5,6,7 | Documentare SP(), N(), D(), P(), R(), auto-start |
| `references/visual-recipes.md` | Modify | UPG-2,4,6 | Pattern noise, particelle animate, camera shake per ricetta |
| `references/components.md` | Modify | UPG-3 | Pattern SVG per draw-on |
| `SKILL.md` | Modify | UPG-1,5 | Aggiornare Phase 3 con SP() e auto-start |

---

## 5. Ordine di Implementazione

Le dipendenze tra moduli determinano l'ordine:

```
UPG-7 (R)  ─────────────────────────┐
UPG-2 (Noise) ──┬── UPG-6 (Shake)   │
                 └── UPG-4 (Particles)┘
UPG-1 (Spring) ──── indipendente
UPG-3 (SVG Draw) ── indipendente
UPG-5 (Auto-start) ── indipendente
```

**Ordine consigliato:**
1. **UPG-7** (R) — 3 righe, zero rischi, abilita UPG-4
2. **UPG-2** (Noise) — ~40 righe, abilita UPG-4 e UPG-6
3. **UPG-1** (Spring) — ~25 righe runtime, il più impattante sulla qualità
4. **UPG-5** (Auto-start) — riduce errori di Claude, migliora DX
5. **UPG-3** (SVG Draw) — ~20 righe, nuova capacità
6. **UPG-4** (Particles) — dipende da UPG-2 e UPG-7
7. **UPG-6** (Shake) — solo documentazione, dipende da UPG-2

---

## 6. Test Specification

### Unit Tests
| ID | What | Input | Expected | Priority |
|----|------|-------|----------|----------|
| UT-01 | Spring solver settling | k:100, c:10, m:1, 300 frames | Converge a 1.0 ± 0.001 | High |
| UT-02 | Spring overshoot | k:120, c:6, m:0.5 | Peak > 1.0, then settles | High |
| UT-03 | Spring snappy (high damping) | k:200, c:26, m:1 | No overshoot, smooth | High |
| UT-04 | Noise determinism | noise2D("test", 0.5, 0.3) × 2 | Identical results | High |
| UT-05 | Noise range | 1000 samples | All in [-1, 1] | Medium |
| UT-06 | Seeded random determinism | R(42) × 2 | Identical results | Medium |
| UT-07 | Seeded random distribution | R(0..1000) | Mean ≈ 0.5, no clustering | Low |
| UT-08 | SVG path draw | progress=0.5, pathLen=200 | dashoffset=100 | High |
| UT-09 | Auto-start calc | 3 scenes [240, 300, 270], XFADE=30 | starts=[0, 210, 480] | High |
| UT-10 | Auto-start with explicit start | scenes with start defined | No overwrite | High |

### Integration Tests
| ID | Flow | Components | Expected | Priority |
|----|------|------------|----------|----------|
| IT-01 | Render video with SP() | runtime + capture + encode | Video renders, no errors | High |
| IT-02 | Render video with N() | runtime + capture | Elements move organically | High |
| IT-03 | Render video with D() | runtime + SVG + capture | Path draws progressively | Medium |
| IT-04 | Render with auto-start | html-parser + runtime | Same output as manual start | High |
| IT-05 | Backward compat | Existing video HTML (no SP/N/D) | Renders identically | Critical |

### Edge Cases
| ID | Scenario | Condition | Expected |
|----|----------|-----------|----------|
| EC-01 | Spring never settles | Very low damping (c=0.5) | Clamp after max frames (600) |
| EC-02 | Noise seed collision | Same seed string | Same output (expected) |
| EC-03 | SVG path length zero | Empty path `d=""` | No animation, no crash |
| EC-04 | Auto-start with XFADE=0 | Cut transitions | scenes[i].start = sum of previous frames |
| EC-05 | Mixed SP() and A() on same element | Spring scale + A opacity | Both apply correctly |
| EC-06 | P() with 0 particles | count=0 | No crash, empty container |

---

## 7. Stima Dimensionale

| Upgrade | Righe runtime.ts | Righe altri file | Righe docs | Totale |
|---------|-----------------|------------------|------------|--------|
| UPG-1 Spring | ~30 | ~15 (actions.ts) | ~40 | ~85 |
| UPG-2 Noise | ~45 | — | ~30 | ~75 |
| UPG-3 SVG Draw | ~20 | — | ~25 | ~45 |
| UPG-4 Particles | ~35 | ~15 (decorative.ts) | ~20 | ~70 |
| UPG-5 Auto-start | ~10 | ~20 (html-parser.ts) | ~15 | ~45 |
| UPG-6 Shake | ~0 | — | ~25 | ~25 |
| UPG-7 Seeded Random | ~3 | — | ~10 | ~13 |
| **Totale** | **~143** | **~50** | **~165** | **~358** |

Il runtime.ts passa da ~185 righe attuali a ~328 righe — ragionevole per un runtime inline.

---

## 8. Cosa NON prendere da Remotion

Per completezza, queste sono le feature Remotion che **non** ha senso portare in Orson:

| Feature Remotion | Perché no |
|-----------------|-----------|
| React component model | Contraddice l'architettura HTML-first di Orson. Claude scrive HTML direttamente — nessun build step |
| Remotion Studio (preview con timeline) | Orson ha `--preview` nel browser. Un'app React per il preview richiederebbe infrastruttura eccessiva |
| TransitionSeries JSX | UPG-5 risolve lo stesso problema con auto-start. Non serve un DSL React |
| `@remotion/light-leaks` package | Orson ha già light-leak in `decorative.ts`. Aggiungere un pacchetto npm per un effetto CSS è over-engineering |
| Tailwind CSS | Il video HTML è autocontenuto con inline styles. Aggiungere Tailwind richiederebbe build step |
| Remotion `<Img>` / `staticFile` | Orson usa base64 data URI embedding via `asset-embed.ts`. Nessun vantaggio da cambiare |

---

## 9. Implementation Notes

- Runtime v5→v6: added ~210 lines (R, noise2D, N, SP, D, P, auto-start, setProp, particle update)
- `lerp` and function declarations are hoisted in IIFE scope — no ordering issues
- `N()` uses `+=` for x/y/rotate to overlay on A() animations (camera shake pattern)
- Spring solver uses `FPS` variable if defined, defaults to 30
- Auto-start checks `scenes[0].start === undefined` for backward compatibility
- `decorative.ts`: `generateParticleDots` now emits container div; new `getParticleScript()` export for P() calls
- Per-transition `xfades[]` array supported alongside global XFADE

---

## 10. Completion Record

All 7 upgrades implemented:
- **UPG-7 (R):** 3-line seeded random — `window.R`
- **UPG-2 (Noise):** ~40 lines Perlin 2D + `window.N`
- **UPG-1 (Spring):** `window.SP` + `applySpring` with Euler solver (~25 lines)
- **UPG-5 (Auto-start):** Auto-compute scene starts from frames + XFADE (~10 lines)
- **UPG-3 (SVG Draw):** `window.D` + `applyDraw` with strokeDashoffset (~20 lines)
- **UPG-4 (Particles):** `window.P` + `__updateParticles` (~35 lines runtime, decorative.ts updated)
- **UPG-6 (Shake):** Documentation-only — camera shake patterns in visual-recipes.md and html-contract.md

Documentation updated: html-contract.md, visual-recipes.md, components.md, SKILL.md

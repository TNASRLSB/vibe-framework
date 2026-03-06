# Spec: Orson — CSS Ambient Animations + Web Animations API Sync

**Data:** 2026-03-06
**Tipo:** Feature + bugfix
**Stato:** completato

---

## Cosa sto facendo

Sblocco l'uso di CSS @keyframes nei video Orson sincronizzandole con il frame capture via Web Animations API. Questo permette di animare proprieta che il runtime JS non puo toccare (box-shadow, background-position, border-color, gradienti) e trasforma i decorativi da statici a vivi.

**Bugfix incluso:** Le 3 CSS animations esistenti in `decorative.ts` (deco-scan, deco-grad-shift, deco-aurora-drift) NON sono sincronizzate con `__setFrame(n)` — il frame capture le cattura in stati casuali. Il fix le sincronizza gratis.

---

## Ispirazione

Dalle hero section di cumino.com e polyglot.you — entrambi usano pure CSS animations per effetti premium:
- **shimmer** — sweep highlight su superfici (feeling metallico/vetro)
- **pulseGlow** — box-shadow pulsante su CTA/card
- **float/floatSlow** — oscillazione verticale multi-asse con scala
- **shine** — striscia luminosa che scorre su bottoni/card
- **borderGlow** — pulse del colore bordo
- **ripplePulse** — anelli concentrici che si espandono
- **gridFade** — pulse di opacita su pattern griglia
- **breathe** — scala 0.98-1.02 come battito cardiaco

Stesse tecniche, stesso browser (Chromium via Playwright) = stessi risultati nei video.

---

## Cambiamenti

### 1. runtime.ts — CSS Animation Sync (3+3 righe)

**Alla fine dell'IIFE, PRIMA di `__setFrame(0)`:**
```javascript
// Pause all CSS animations — __setFrame controls their time
document.getAnimations().forEach(function(a) { a.pause(); });
```

**Alla fine di `__setFrame(n)`, DOPO particles update:**
```javascript
// Sync CSS animations to current frame timestamp
var fps = (typeof FPS !== 'undefined') ? FPS : 30;
var t = n / fps * 1000;
document.getAnimations().forEach(function(a) { a.currentTime = t; });
```

Perche funziona:
- `document.getAnimations()` ritorna tutte le CSS animations attive (Web Animations API, Chrome 84+)
- `a.pause()` le ferma — non scorrono col clock del browser
- `a.currentTime = t` le avanza al timestamp esatto del frame
- Deterministico: frame N = sempre gli stessi pixel
- Funziona con `infinite` loops (currentTime wrappa automaticamente)

### 2. decorative.ts — CSS Ambient Keyframes Library

Espandere `getDecorativeKeyframes()` con nuovi @keyframes ispirati ai siti:

| Keyframe | Effetto | Durata tipica | Uso |
|----------|---------|---------------|-----|
| `amb-float` | Oscillazione verticale ±20px | 6s | Orb, card decorative |
| `amb-float-slow` | Drift multi-asse + scale 0.95-1.05 | 10s | Background blobs |
| `amb-float-reverse` | Contro-direzione di amb-float | 8s | Secondo orb (diversita) |
| `amb-shimmer` | Sweep background-position -200% → 200% | 3s | Headline gradient, bottoni |
| `amb-pulse-glow` | Box-shadow 0→30px blur espansione | 4s | CTA, card attive |
| `amb-shine` | Striscia luminosa left -75% → 125% | 2.5s | Bottoni, card premium |
| `amb-breathe` | Scale 0.98→1.02 oscillazione | 5s | Card, contenitori |
| `amb-border-glow` | Border-color opacity pulse | 3s | Card glassmorphism |
| `amb-ripple` | Box-shadow anelli concentrici | 4s | Badge, indicatori |
| `amb-grid-fade` | Opacity 0.03→0.07 su pattern | 6s | Grid-pattern decorativo |
| `amb-drift` | TranslateX 0→40px + rotate 0→2deg | 12s | Decorativi orizzontali |
| `amb-gradient-text` | Background-position sweep su gradient text | 4s | Headline con gradient |

### 3. decorative.ts — Decorativi Animati

Upgradare i decorativi esistenti da statici ad animati:

| Decorativo | Prima (statico) | Dopo (animato) |
|------------|-----------------|----------------|
| `orb` | Posizione fissa, blur fisso | + `animation: amb-float 6s ease-in-out infinite` (alternate) |
| `ring` | Bordo fisso | + `animation: amb-float-reverse 8s ease-in-out infinite` |
| `bokeh` | Cerchi fissi | Ogni cerchio ha `amb-float` con `animation-delay` stagger |
| `glow` | Gradiente fisso | + `animation: amb-pulse-glow 4s ease-in-out infinite` (su box-shadow) |
| `grid-pattern` | Opacita fissa | + `animation: amb-grid-fade 6s ease-in-out infinite` |
| `mesh-gradient` | Gradiente fisso | + `animation: amb-drift 12s ease-in-out infinite alternate` |
| `aurora` | `deco-aurora-drift` (gia animata) | Invariata (ma ora sincronizzata!) |
| `animated-gradient` | `deco-grad-shift` (gia animata) | Invariata (ma ora sincronizzata!) |
| `light-leak` | Gradiente fisso | + `animation: amb-breathe 5s ease-in-out infinite` |

Stagger: quando ci sono piu istanze dello stesso tipo, aggiungere `animation-delay` incrementale (es. -2s, -4s, -6s) per evitare sincronizzazione.

### 4. decorative.ts — Nuovi Decorativi Premium

| Tipo | Effetto | Animazione |
|------|---------|------------|
| `shimmer-surface` | Overlay con gradient lineare trasparente→bianco→trasparente | `amb-shine` — striscia che scorre |
| `glass-card` | Backdrop-filter: blur(20px) + border semi-trasparente | `amb-border-glow` — bordo che pulsa |

### 5. SKILL.md — Aggiornamenti

**Step 3.0 punto 7** — Espandere "Secondary animation":
```
7. **CSS ambient motion** — Decorative elements are now animated by default
   (orb float, glow pulse, grid fade, etc.) via CSS @keyframes synced to
   frame capture. Add shimmer/shine on CTA buttons and premium cards.
   For gradient text headlines, add `amb-gradient-text` animation.
```

**Checklist D2** — Aggiungere punto 25 (rinumerare E da 25→28):
```
25. **CSS ambient motion** — At least **2 decorative elements** must have CSS
    ambient animation (float, pulse-glow, breathe, grid-fade). Static
    decoratives with no ambient motion = flat. The runtime syncs CSS
    animations to frame capture automatically.
26. **Shimmer/shine** — At least **1 CTA button or premium card** should have
    a `amb-shine` or `amb-shimmer` effect for premium feel.
```

**Checklist E (Visual Variety)** — Rinumerata da 27→30.

---

## Extra: Figate Bonus

### A. Gradient Text Animato
Headline con gradient che si muove:
```css
.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: amb-gradient-text 4s ease-in-out infinite alternate;
}
```
Da usare su hero headline o tagline per effetto premium.

### B. Glassmorphism Card
Card con vetro smerigliato + bordo luminoso:
```css
.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  animation: amb-border-glow 3s ease-in-out infinite;
}
```

### C. Shimmer Button
CTA con striscia luminosa che scorre:
```css
.shimmer-btn {
  position: relative;
  overflow: hidden;
}
.shimmer-btn::after {
  content: '';
  position: absolute;
  top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: amb-shine 2.5s ease-in-out infinite;
}
```

### D. Stagger Animation Delay Helper
Per entrances CSS su liste/griglie di elementi:
```css
[data-stagger] > *:nth-child(1) { animation-delay: 0s; }
[data-stagger] > *:nth-child(2) { animation-delay: 0.1s; }
[data-stagger] > *:nth-child(3) { animation-delay: 0.2s; }
/* ... generato dinamicamente in base al count */
```

---

## File da toccare

| File | Cosa cambia |
|------|-------------|
| `engine/src/runtime.ts` | +6 righe: pause CSS anims + sync in __setFrame |
| `engine/src/decorative.ts` | Espandere keyframes library, animare decorativi esistenti, nuovi tipi |
| `SKILL.md` | Step 3.0 punto 7, checklist D2 punti 25-26, rinumerare E |
| `references/html-contract.md` | Documentare CSS ambient disponibili e usage |
| `references/components.md` | Aggiungere snippets gradient-text, glass-card, shimmer-btn |

---

## Cosa NON cambia

- Le 13 proprieta JS (A/SP/N/D/P) — restano identiche
- Il frame capture pipeline — invariato
- Il rendering Playwright — invariato
- Backward compatibility — video esistenti senza CSS anims funzionano identici

---

## Come verifico

1. Creo un video HTML di test con:
   - Orb con `amb-float`
   - CTA con `amb-shine`
   - Grid con `amb-grid-fade`
   - Headline con gradient-text
2. Renderizzo con `--preview` e verifico che le animazioni si muovano
3. Renderizzo frame 0, 30, 60 e verifico che siano diversi (non statici)
4. Verifico che video esistenti (senza CSS anims) non cambino comportamento

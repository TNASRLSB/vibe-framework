# Bug e Segnalazioni

Aggiungi i bug qui sotto. Copia il template e compila i campi.

---

## Template (copia da qui)

**Pagina/Componente:**
<!-- Es: Homepage, Header, Footer, /prezzi, PricingCalculator -->

**Descrizione del problema:**
<!-- Cosa non funziona o cosa appare sbagliato -->

**Comportamento atteso:**
<!-- Come dovrebbe funzionare/apparire -->

**Screenshot:**
<!-- Opzionale: metti lo screenshot in ./screenshots/ e scrivi il nome file, es: screenshots/bug1.png -->

---

<!-- AGGIUNGI I BUG QUI SOTTO -->

### BUG-8: Transizioni musicali brusche nel ducking audio

**Pagina/Componente:** Orson — `engine/src/audio-mixer.ts` → `applyDucking()`

**Descrizione del problema:**
Il ducking usava `if(between(t,start,end),duckGain,normalGain)` — una step-function binaria. Il volume della musica saltava istantaneamente quando la narrazione iniziava/finiva, creando transizioni brusche e innaturali.

**Comportamento atteso:**
Rampe lineari smooth: fade-out 300ms prima della voce, fade-in 500ms dopo la voce.

**Sistemato:** completato [2026-02-12]

---

### BUG-9: DOM reparenting rompe React 18 event delegation

**Pagina/Componente:** Orson — `engine/src/demo-director.ts` → `injectZoomOverlay()`

**Descrizione del problema:**
`injectZoomOverlay()` spostava tutti i figli di `<body>` in un `<div id="orson-zoom-wrapper">`. Questo reparenting rompeva la event delegation di React 18: i click handler (es. ThemeToggle per dark mode) non venivano mai eseguiti perché React attacca i listener all'elemento root (`#__next`) che veniva spostato.

**Comportamento atteso:**
Applicare la CSS transform zoom direttamente all'elemento root esistente senza reparenting DOM.

**Sistemato:** completato [2026-02-12]

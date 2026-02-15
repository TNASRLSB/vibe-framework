# Spec: Intent Exploration, Mandate Tests, Subtle Layering

**Data:** 2026-02-15
**Tipo:** Enhancement
**Skill:** Seurat
**Origine:** Analisi comparativa con `interface-design` (Damola Akinleye)

---

## Cosa sto aggiungendo

Tre innovazioni di processo prese da interface-design, adattate al sistema Seurat:

1. **Intent Exploration** — Fase esplorativa prima della selezione profilo in `/seurat setup`
2. **The Mandate** — 4 test di auto-critica come gate pre-delivery
3. **Subtle Layering Guide** — Progressioni lightness specifiche per surface elevation

---

## 1. Intent Exploration (Step 0 in `/seurat setup`)

### Problema

Seurat salta direttamente a "tipo, industria, target" → selezione profilo → generazione. Il processo è meccanico: l'utente sceglie da menu, il sistema calcola weights. Manca una fase esplorativa che contestualizza il prodotto nel suo dominio.

### Soluzione

Aggiungere uno **Step 0: Intent Exploration** prima della selezione profilo. Non sostituisce il sistema di profili — lo arricchisce con contesto qualitativo.

### Dove si inserisce

In **SKILL.md**, sezione `/seurat setup`, il processo attuale (linee 80-89) diventa:

```
**Process:**
0. Intent Exploration (nuovo — vedi sotto)
1. Ask for: project type, industry, target audience, generation mode
2. Load profiles from matrices/
3. Calculate combined weights
...resto invariato...
```

### Cosa fa Step 0

Prima di chiedere tipo/industria/target, porre **3 domande** (non 5 come interface-design — troppo overhead):

```
Intent Exploration:

1. CHI usa questo prodotto e COSA deve raggiungere?
   → Una frase. Es: "CFO che deve approvare budget trimestrali in 5 minuti"

2. In che MONDO VISIVO vive questo prodotto?
   → 3+ associazioni. Es: "Bloomberg terminal, fogli Excel, grafici finanziari scuri"

3. Cosa NON deve sembrare?
   → 2+ anti-riferimenti. Es: "Non Dribbble dashboards colorati, non app consumer"
```

### Come usa le risposte

Le risposte influenzano il flusso **senza cambiare l'architettura dei weights**:

- **Domanda 1** → Guida la selezione del profilo target (se l'utente dice "CFO", suggerire Enterprise + C-suite)
- **Domanda 2** → Diventa contesto per la generazione HTML. Salvato in `.seurat/tokens.css` come commento `/* Visual world: ... */`
- **Domanda 3** → Aggiunto come anti-pattern locale per la sessione. Verificato durante l'anti-pattern check (step 5)

### Quando si salta

- In **Chaos mode**: skip Intent Exploration (il punto è l'imprevedibilità)
- Se l'utente dice esplicitamente "skip" o fornisce direttamente tipo/industria/target
- Se `.seurat/tokens.css` esiste già (l'intent è stato stabilito)

### File da modificare

| File | Modifica |
|---|---|
| `SKILL.md` | Aggiungere Step 0 nel processo `/seurat setup` (dopo riga 80) |
| `generation/modes.md` | Aggiungere Step 0 nel Safe mode e Hybrid mode process |

### Esempio output

```
/* .seurat/tokens.css — header */

/* Intent: CFO che approva budget trimestrali in 5 minuti */
/* Visual world: Bloomberg terminal, fogli Excel, grafici finanziari scuri */
/* Anti-references: Dribbble dashboards colorati, app consumer friendly */

:root {
  --color-bg: hsl(220 15% 10%);
  ...
}
```

---

## 2. The Mandate (4 Test Pre-Delivery)

### Problema

Seurat ha Russian Hardening (pre), During validation (durante), e 雕花 polish (post). Ma la 雕花 è una checklist tecnica (contrast, shadows, motion). Non cattura la **genericità qualitativa** — un output può passare tutti i check tecnici ed essere comunque "AI slop" perché strutturalmente indistinguibile.

### Soluzione

Aggiungere **4 test qualitativi** come gate finale, dopo la 雕花 e prima del Visual QA. Sono auto-valutazioni che Claude fa internamente prima di mostrare l'output all'utente.

### I 4 Test

```
## The Mandate (Pre-Delivery Gate)

Prima di mostrare l'output all'utente, verifica:

1. SWAP TEST
   Cambia mentalmente il typeface e il layout.
   Se l'output sembra ugualmente "giusto" con qualsiasi font/layout → è generico.
   → Deve: il typeface e il layout devono essere SCELTI, non intercambiabili.

2. SQUINT TEST
   Sfoca mentalmente l'output.
   Se la gerarchia visiva sparisce → manca struttura.
   → Deve: con vista sfocata, i 3 livelli gerarchici devono essere distinguibili.

3. SIGNATURE TEST
   Identifica 3 elementi specifici che rendono questo output riconoscibile.
   Se non riesci a nominarne 3 → è generico.
   → Deve: 3 scelte di design che un generico non avrebbe fatto.
   Es: "mono font per i dati, border-left accent sulle cards, spacing asimmetrico header"

4. TOKEN TEST
   Leggi i nomi delle CSS custom properties.
   Se suonano generici (--color-primary, --spacing-md) → non appartengono al prodotto.
   → Deve: i nomi devono riflettere il dominio quando possibile.
   Es: --color-chart-positive, --spacing-data-cell, --radius-metric-card
```

### Dove si inserisce

In **SKILL.md**, nuova sezione tra "Enforcement Rules" (riga 304) e "Resources" (riga 316):

```
## The Mandate (Pre-Delivery Gate)

Dopo 雕花 polish e prima del Visual QA, auto-valuta:
[i 4 test]

Se un test fallisce: torna a Phase 3 (BUILD) e rifai la parte generica.
Non patchare — ricostruisci la decisione.
```

In **validation.md**, nuova sezione dopo "Post-Generation Polish" (riga 133) e prima di "Validation Report Format" (riga 254):

```
## The Mandate (Qualitative Gate)

[i 4 test con esempi]
```

### Integrazione con il flusso

Il flusso completo diventa:

```
Phase 1: RESEARCH
Phase 2: VALIDATE (Russian Hardening)
Phase 3: BUILD (During validation)
Phase 4: REFINE (雕花 polish)
Phase 4.5: THE MANDATE (4 qualitative tests) ← NUOVO
Phase 5: VISUAL QA (screenshot verification)
```

### File da modificare

| File | Modifica |
|---|---|
| `SKILL.md` | Nuova sezione "The Mandate" tra Enforcement Rules e Resources |
| `SKILL.md` | Aggiornare "Phases" per includere Phase 4.5 |
| `validation.md` | Nuova sezione "The Mandate" dopo 雕花, prima del report format |

---

## 3. Subtle Layering Guide

### Problema

Seurat ha il "Background Depth Check" nella 雕花 (validation.md:146-169) che dice "non usare flat solid, aggiungi gradient". Ma non fornisce **progressioni specifiche** per la surface elevation. L'indicazione è qualitativa ("subtle gradient") senza numeri precisi.

### Soluzione

Aggiungere una **guida di progressione lightness** per le superfici, con valori specifici per light e dark mode.

### Contenuto

```
## Surface Elevation Guide

Le superfici devono essere appena diverse ma distinguibili.
Progressione lightness raccomandata (delta dal background):

### Light Mode (bg ~96% lightness)

| Surface | Lightness | Delta | Uso |
|---------|-----------|-------|-----|
| Background | 96% | base | Sfondo pagina |
| Surface (cards) | 100% | +4% | Cards, pannelli |
| Surface raised | 100% | +4% (+ shadow) | Dropdown, tooltip |
| Overlay | 100% | +4% (+ scrim 50%) | Modal, dialog |

Border opacity progression:
| Livello | Opacity | Uso |
|---------|---------|-----|
| Subtle | 5-7% | Separatori interni |
| Default | 8-12% | Card borders |
| Strong | 15-20% | Input borders |
| Stronger | 25-30% | Focus rings, dividers |

### Dark Mode (bg ~10% lightness)

| Surface | Lightness | Delta | Uso |
|---------|-----------|-------|-----|
| Background | 10% | base | Sfondo pagina |
| Surface (cards) | 13% | +3% | Cards, pannelli |
| Surface raised | 16% | +6% | Dropdown, tooltip |
| Overlay | 19% | +9% | Modal, dialog |

Note dark mode:
- Delta più grande che in light mode (la percezione è non-lineare)
- Borders > shadows (le ombre sono quasi invisibili su sfondi scuri)
- Text hierarchy: 90% → 70% → 50% → 35% opacity su bianco

### Principio

La differenza tra livelli adiacenti deve superare la **soglia di percezione** (~3% lightness)
ma restare sotto la **soglia di distrazione** (~8% lightness in light, ~12% in dark).

"Appena percettibile" = corretto.
"Ovviamente diverso" = troppo.
"Identico" = inutile.
```

### Dove si inserisce

In **validation.md**, come espansione del "Background Depth Check" esistente (riga 146). Non lo sostituisce — lo arricchisce con valori specifici.

### File da modificare

| File | Modifica |
|---|---|
| `validation.md` | Espandere "Background Depth Check" con la Surface Elevation Guide |

---

## Riepilogo modifiche

| File | Cosa | Righe di riferimento |
|---|---|---|
| `SKILL.md` | Step 0 Intent Exploration in `/seurat setup` | Dopo riga 80 |
| `SKILL.md` | Phase 4.5 The Mandate nelle Phases | Dopo riga 70 |
| `SKILL.md` | Sezione The Mandate tra Enforcement Rules e Resources | Dopo riga 312 |
| `generation/modes.md` | Step 0 nel Safe mode e Hybrid mode | Righe 28-62 e 130-171 |
| `validation.md` | Sezione The Mandate dopo 雕花 | Dopo riga 251 |
| `validation.md` | Surface Elevation Guide nel Background Depth Check | Espansione righe 146-169 |

### File NON toccati

- `KNOWLEDGE.md` — Nessuna nuova directory o struttura
- `matrices/` — I profili non cambiano
- `styles/` — Gli stili non cambiano
- `wireframes/` — I wireframe non cambiano
- `templates/` — I template non cambiano
- `factor-x/` — Factor X non cambia
- `generation/combination-logic.md` — La logica di combinazione non cambia
- `generation/anti-patterns.md` — Gli anti-pattern non cambiano

### Parole stimate

- SKILL.md: +150 parole (~5% del budget 3000)
- generation/modes.md: +80 parole
- validation.md: +250 parole

Nessun file supera il budget Forge.

---

## Verifica

Dopo l'implementazione:

1. Leggere SKILL.md completo — il flusso deve essere lineare senza salti logici
2. Leggere validation.md — le 4 fasi + mandate devono essere ordinate cronologicamente
3. Leggere generation/modes.md — Step 0 presente solo in Safe e Hybrid, assente in Chaos
4. Controllare coerenza: il Mandate è referenziato sia in SKILL.md che in validation.md senza duplicazione (SKILL.md ha la versione breve, validation.md ha la versione con esempi)

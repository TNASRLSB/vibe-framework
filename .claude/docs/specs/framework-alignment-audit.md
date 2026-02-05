# Spec: Framework Alignment & Skill Audit

**Data:** 2026-02-05
**Tipo:** Doc / Research / Refactoring
**Stato:** Completato 2026-02-05

---

## Obiettivo

Audit completo e allineamento tra:
1. Documentazione framework (CLAUDE.md, README.md)
2. Documentazione skill (SKILL.md)
3. Filesystem effettivo
4. Contenuto/funzionalita reali dei file

---

## Riepilogo Incongruenze

| Skill | Struttura | Contenuto | Incongruenze |
|-------|-----------|-----------|--------------|
| audiosculpt | DISALLINEATO | **CRITICO** | 7 |
| emmet | OK | DISALLINEATO | 4 |
| ghostwriter | OK | **DISALLINEATO** | 6 |
| heimdall | OK | OK | 0 |
| orson | DISALLINEATO | **DISALLINEATO** | 7 |
| seurat | DISALLINEATO | DISALLINEATO | 10 |

**Totale incongruenze skill: 34**

---

## 1. Problemi Framework (CLAUDE.md, README.md)

### 1.1 Comando Inesistente (CRITICO)

**File:** `CLAUDE.md` linea 205
**Problema:** Riferimento a `/seurat establish` che non esiste
**Fix:** Sostituire con i comandi corretti:
- `/seurat setup` per nuovi progetti
- `/seurat extract` per progetti esistenti

### 1.2 README.md — Ristrutturazione

| Problema | Fix |
|----------|-----|
| Manca Quick Start | Aggiungere sezione iniziale con flusso rapido |
| Flussi confusi (3 setup diversi) | Aggiungere tabella decisionale |
| Mancano prompt copia/incolla | Aggiungere prompt completi per comandi chiave |
| Ordine subottimale | Riordinare: Quick Start → Skills → Setup → Come funziona |

**Tabella decisionale da aggiungere:**

| Il tuo progetto | Percorso |
|-----------------|----------|
| Nuovo, senza codice | → "Nuovo progetto" |
| Esistente, solo backend | → "Progetto esistente" |
| Esistente, con UI | → "Progetto esistente" + "Progetto esistente con UI" |

### 1.3 CLAUDE.md — Riordino

| Problema | Fix |
|----------|-----|
| "First Run" (linea 32) e "First Use on New Project" (linea 194) separate | Consolidare in sezione unica "Primo Avvio" |
| Quick Commands (linea 244) nascosta in fondo | Spostarla dopo "Prime Directives" |

---

## 2. audiosculpt

### Incongruenze

| # | Severita | Descrizione |
|---|----------|-------------|
| A1 | **CRITICA** | `generate.py` implementa workflow diverso dalla doc (text2midi, non pattern-compositor) |
| A2 | MEDIA | `midi2events.py` non documentato |
| A3 | MEDIA | `engine/` directory non documentata nella sezione Reference |
| A4 | BASSA | `narration_generator.py` ha funzionalita non documentate (ffprobe, manifest.json) |
| A5 | BASSA | Template preset hanno campi non documentati (energy_scaling, voiceover_adaptation) |
| A6 | BASSA | voice-leading JSON ha metadati non documentati (smoothness, common_tones) |
| A7 | BASSA | coherence-matrix.json ha `text2midi_prompt` non documentato |

### Dettaglio A1 (CRITICA)

**SKILL.md documenta:**
> Lettura di preset patterns e costruzione di codice Strudel

**generate.py implementa:**
- Modello `text2midi` (HuggingFace) per generare MIDI da prompt
- Conversione token LLM in MIDI via `miditok`
- Dipendenze PyTorch, transformers, huggingface_hub

**Impatto:** Claude potrebbe generare istruzioni errate per la generazione audio.

---

## 3. emmet

### Incongruenze

| # | Severita | Descrizione |
|---|----------|-------------|
| E1 | MEDIA | `checklists/security.md` rimanda a `core/security.md` che **NON ESISTE** |
| E2 | BASSA | `pre-deploy.md` (252 righe) non documentato in dettaglio |
| E3 | BASSA | `refactoring.md` (335 righe) non documentato in dettaglio |
| E4 | BASSA | Riferimento vago a integrazione con heimdall |

**Nota:** `stacks/` vuota e' corretta by design (popolata on-demand da `/adapt-framework`).

---

## 4. ghostwriter

### Incongruenze

| # | Severita | Descrizione |
|---|----------|-------------|
| G1 | **ALTA** | 6 comandi su 10 NON hanno workflow in `workflows/interactive.md` |
| G2 | **ALTA** | 5 comandi NON hanno generation prompts in `generation/` |
| G3 | MEDIA | Scoring disallineato: `article.md` usa 16 punti, `rules.md` usa 46 |
| G4 | BASSA | Workflow interattivo incompleto |
| G5 | BASSA | Workflow file parziali |

### Comandi senza workflow interattivo

- `/ghostwriter research`
- `/ghostwriter optimize`
- `/ghostwriter persona`
- `/ghostwriter llms-txt`
- `/ghostwriter robots`
- `/ghostwriter meta` (esiste generation ma non workflow)

### Comandi senza generation prompts

- `/ghostwriter research`
- `/ghostwriter optimize`
- `/ghostwriter persona`
- `/ghostwriter llms-txt`
- `/ghostwriter robots`

---

## 5. heimdall

**Stato: OK - Nessuna incongruenza critica**

Tutti i file verificati e conformi:
- `scripts/scanner.py` - OWASP Top 10 + path context + secure alternatives
- `scripts/diff-analyzer.py` - 9 categorie security patterns
- `scripts/import-checker.py` - 4 linguaggi supportati
- `patterns/owasp-top-10.json` - 60 pattern totali
- `patterns/secrets.json` - path_contexts implementato
- `data/known-packages.json` - ~270 pacchetti comuni

---

## 6. orson

### Incongruenze

| # | Severita | Descrizione |
|---|----------|-------------|
| O1 | **ALTA** | 13 director recipes in `director.ts` completamente non documentate |
| O2 | MEDIA | Conteggio file errato: dice 23, sono **22** |
| O3 | MEDIA | Conteggio animazioni errato: dice 131, sono **132** |
| O4 | MEDIA | `copy-brief.ts` non documentato in Reference |
| O5 | MEDIA | `storyboard.ts` non documentato in Reference |
| O6 | MEDIA | Sistema mode pools (SAFE_ENTRANCE_IDS, etc.) non documentato |
| O7 | ALTA | `/orson create` documentato come comando CLI ma e' solo skill |

### 13 Director Recipes non documentate

1. `hero-impact` - opener con titolo corto
2. `metric-reveal` - numeri/percentuali
3. `text-kinetic` - titoli medi (4-8 parole)
4. `card-burst` - 3+ card
5. `closer-dramatic` - CTA finale
6. `opener-long-title` - opener con titolo lungo
7. `proof-authority` - social proof scenes
8. `mid-section-variety` - varianza visiva mid-video
9. `fullscreen-slam` - fullscreen per 1-2 word openers
10. `marquee-ticker` - marquee scroll
11. `letter-cascade` - letter stagger (chaos/cocomelon)
12. `multi-phase-reveal` - reveal in fasi
13. `dramatic-pause` - pausa drammatica mid-section

---

## 7. seurat

### Incongruenze

| # | Severita | Descrizione |
|---|----------|-------------|
| S1 | **ALTA** | `wireframes/components.md` non documentato |
| S2 | **ALTA** | `wireframes/layout-system.md` non documentato |
| S3 | MEDIA | `wireframes/motion.md` non documentato |
| S4 | MEDIA | `wireframes/visual-composition.md` non documentato |
| S5 | MEDIA | `templates/preview-spec.md` non documentato |
| S6 | MEDIA | `templates/preview/` directory non documentata |
| S7 | MEDIA | 11 stili base non elencati per nome |
| S8 | BASSA | `preview-spec.md` usa comandi diversi (`/seurat generate`, `/seurat establish`) |
| S9 | BASSA | File interni citano path diversi per visual-composition |
| S10 | BASSA | `templates/test-pages.md` non documentato |

### 11 Stili Base non elencati

1. Flat
2. Material
3. Neumorphism
4. Glassmorphism
5. Brutalism
6. Claymorphism
7. Skeuomorphism
8. Y2K
9. Gen-Z
10. Bento
11. Spatial

---

## Piano di Implementazione

### Fase 1: Fix Critici

| # | Target | Azione |
|---|--------|--------|
| 1 | CLAUDE.md | Correggere `/seurat establish` → `/seurat setup` o `/seurat extract` |
| 2 | audiosculpt | Documentare workflow reale `generate.py` (text2midi) |
| 3 | audiosculpt | Aggiungere `engine/`, `midi2events.py` alla sezione Reference |
| 4 | ghostwriter | Creare workflow interattivi per 6 comandi mancanti |
| 5 | ghostwriter | Creare generation prompts per 5 comandi mancanti |
| 6 | orson | Documentare le 13 director recipes |

### Fase 2: Fix Documentazione Skill

| # | Target | Azione |
|---|--------|--------|
| 7 | orson | Correggere conteggio file (23→22) e animazioni (131→132) |
| 8 | orson | Documentare `copy-brief.ts`, `storyboard.ts`, mode pools |
| 9 | seurat | Documentare 6 file wireframe mancanti |
| 10 | seurat | Elencare gli 11 stili base per nome |
| 11 | seurat | Documentare `templates/preview/` |
| 12 | emmet | Rimuovere riferimento a `core/security.md` inesistente |
| 13 | ghostwriter | Allineare scoring article.md (16) con rules.md (46) |

### Fase 3: Fix Framework Docs

| # | Target | Azione |
|---|--------|--------|
| 14 | README.md | Aggiungere Quick Start |
| 15 | README.md | Aggiungere tabella decisionale flussi |
| 16 | README.md | Aggiungere prompt copia/incolla completi |
| 17 | README.md | Riordinare sezioni |
| 18 | CLAUDE.md | Consolidare sezioni "First Run" / "First Use" |
| 19 | CLAUDE.md | Spostare Quick Commands piu in alto |

---

## Verifica Finale

- [ ] Tutti i comandi slash documentati esistono effettivamente
- [ ] Tutti i file referenziati nei SKILL.md esistono
- [ ] Conteggi file e animazioni sono corretti
- [ ] README ha flusso chiaro per ogni tipo di progetto
- [ ] Prompt copia/incolla sono completi e funzionanti
- [ ] Workflow implementati corrispondono alla documentazione
- [ ] Generation prompts esistono per ogni comando `/write`

---

## Note

- **heimdall** e' l'unica skill completamente allineata
- **audiosculpt** ha l'incongruenza piu grave (workflow completamente diverso)
- **ghostwriter** ha il maggior numero di comandi non implementati
- **seurat** e **orson** richiedono principalmente aggiornamenti di documentazione
- Non modificare la logica delle skill, solo la documentazione
- Mantenere backward compatibility (non rinominare comandi esistenti)

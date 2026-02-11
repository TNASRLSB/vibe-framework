# Spec: Skill Trimming Analysis

**Data:** 2026-02-10
**Obiettivo:** Ridurre ogni SKILL.md al contenuto che Opus 4.6 non sa gia, spostando la domain knowledge utile per l'utente umano in KNOWLEDGE.md

---

## Il principio

Un SKILL.md deve contenere **solo cio che cambia il comportamento di Claude rispetto al suo default**. Se Claude farebbe la stessa cosa senza quell'istruzione, l'istruzione e spreco di contesto.

La knowledge rimossa non si butta: diventa documentazione per l'utente umano, che non ha la mia stessa formazione.

---

## Dove va cosa

| Contenuto | Va in... | Perche |
|-----------|----------|--------|
| **Comandi e routing** (`/skill comando`) | SKILL.md | Framework-specifico, Claude non lo sa |
| **Orchestrazione inter-skill** (delega a Ghostwriter, usa Seurat) | SKILL.md | Framework-specifico |
| **Anti-pattern specifici del framework** ("non usare Inter", Factor X) | SKILL.md | Scelte di design nostre, non default Claude |
| **Workflow sequenziali non ovvi** (ordine critico di operazioni) | SKILL.md | Claude potrebbe sbagliare l'ordine |
| **Constraint tecnici** (FFmpeg required, LibreOffice per recalc) | SKILL.md | Dipendenze non ovvie |
| **Spiegazione di concetti noti** (cos'e WCAG, cos'e AIDA, cos'e OWASP) | KNOWLEDGE.md | Opus lo sa, l'utente forse no |
| **Best practice generiche** (nomi variabili descrittivi, DRY, ecc.) | Eliminare | Tutti lo sanno |
| **Esempi banali** (hello world di una libreria) | Eliminare | Opus non ne ha bisogno, l'utente nemmeno |
| **Domain knowledge di settore** (color coding finanziario, Fogg model, E-E-A-T) | SKILL.md (breve) + KNOWLEDGE.md (spiegato) | Claude ha bisogno del "cosa fare", l'utente del "perche" |
| **Dati/tabelle di reference** (46 regole, pattern OWASP, profili fuzzy) | File dati separati (gia esistenti: JSON, MD in sottocartelle) | Caricati on-demand, non cambiano |

---

## KNOWLEDGE.md

### Cos'e

Un file per skill che spiega all'utente umano la domain knowledge dietro la skill. Non e un manuale d'uso (quello e il README) — e un **"perche le cose funzionano cosi"**.

### Dove vive

```
.claude/skills/[skill]/KNOWLEDGE.md
```

Ogni skill ha il suo. Non un unico file monolitico.

### Struttura tipo

```markdown
# [Nome Skill] — Knowledge Base

Questa e la conoscenza di dominio dietro la skill [nome].
Non serve a Claude (la sa gia), serve a te per capire
perche la skill fa quello che fa.

---

## [Concetto 1]
[Spiegazione accessibile del concetto]

## [Concetto 2]
[Spiegazione accessibile del concetto]

## Risorse per approfondire
- [Link o riferimento]
```

### Esempio concreto: Baptist KNOWLEDGE.md

```markdown
# Baptist — Knowledge Base

## Il modello di Fogg (B=MAP)

Ogni comportamento umano (incluso comprare, iscriversi,
cliccare) richiede tre condizioni simultanee:

- **Motivation (M)** — La persona VUOLE farlo?
- **Ability (A)** — La persona PUO' farlo facilmente?
- **Prompt (P)** — Qualcosa DICE alla persona di farlo ora?

Se manca anche solo uno dei tre, la conversione non avviene.
Baptist usa questo modello per diagnosticare DOVE si
rompe la conversione.

## Cognitive Load Theory

Il cervello umano ha limiti di elaborazione:
- **Hick's Law** — Piu opzioni = piu tempo per decidere
- **Primi 8 secondi** — Se non capisco cosa fare, me ne vado
- **Pattern F/Z** — Gli occidentali leggono da sinistra a destra,
  dall'alto in basso. I contenuti importanti vanno li.

## ICE Prioritization

Metodo per decidere quali fix fare prima:
- **Impact** (1-10) — Quanto migliora la conversione?
- **Confidence** (1-10) — Quanto siamo sicuri che funzionera?
- **Ease** (1-10) — Quanto e facile da implementare?

Score = I × C × E. Si fa prima quello con score piu alto.

## Risorse
- BJ Fogg, "Tiny Habits" (2019)
- Steve Krug, "Don't Make Me Think" (2014)
```

---

## Metodologia di analisi per skill

Per ogni skill, l'analisi procede cosi:

### Step 1: Leggere l'intero SKILL.md

### Step 2: Classificare ogni sezione/blocco

Per ogni blocco di contenuto (paragrafo, lista, tabella), rispondere:

**Domanda A:** "Se rimuovo questo, Claude fara diversamente?"
- SI → Resta in SKILL.md
- NO → Candidato a rimozione

**Domanda B:** "Questo concetto e utile per l'utente umano?"
- SI → Va in KNOWLEDGE.md
- NO → Si elimina completamente

**Matrice risultante:**

| Claude ne ha bisogno? | Utente ne ha bisogno? | Azione |
|----------------------|----------------------|--------|
| SI | SI | SKILL.md (breve) + KNOWLEDGE.md (spiegato) |
| SI | NO | SKILL.md |
| NO | SI | KNOWLEDGE.md |
| NO | NO | Eliminare |

### Step 3: Riscrivere SKILL.md

Solo il contenuto che cambia il comportamento di Claude:
- Comandi e routing
- Workflow specifici del framework
- Constraint e anti-pattern
- Orchestrazione inter-skill
- Domain rules che Claude deve applicare (senza spiegargli perche)

### Step 4: Scrivere KNOWLEDGE.md

La domain knowledge rimossa, riscritta in modo accessibile per un umano non tecnico o non esperto del dominio specifico.

### Step 5: Verificare

- Claude triggera ancora correttamente?
- Il comportamento della skill e invariato?
- L'utente capisce il "perche" leggendo KNOWLEDGE.md?

---

## Analisi da fare — skill per skill

### Seurat (321 righe)

**Cosa probabilmente resta:** Generative system (Factor X, fuzzy matrices, modi), page archetypes e routing, comandi, orchestrazione con altre skill, anti-pattern specifici ("no Inter, no purple gradients")

**Cosa probabilmente va in KNOWLEDGE.md:** Spiegazione accessibilita WCAG, teoria del colore, principi tipografici, perche certi stili funzionano per certi settori

**Cosa probabilmente si elimina:** Istruzioni generiche CSS, come funzionano le custom properties, esempi banali di layout

**Target stimato:** 321 → ~220 righe

---

### Emmet (220 righe)

**Cosa probabilmente resta:** Comandi, workflow map→test→report, differenza static/dynamic, integrazione con Heimdall, tech debt audit criteria

**Cosa probabilmente va in KNOWLEDGE.md:** Cos'e static analysis, perche il testing e importante, metodologia tech debt, come funziona Playwright

**Cosa probabilmente si elimina:** Istruzioni generiche di testing, best practice di codice ovvie

**Target stimato:** 220 → ~160 righe

---

### Heimdall (448 righe)

**Cosa probabilmente resta:** Comandi, severity levels e azioni, iteration tracking rules (soglie, warning), orchestrazione con Emmet, pattern detection specifici del framework, path-context severity rules

**Cosa probabilmente va in KNOWLEDGE.md:** OWASP Top 10 spiegato, cos'e iteration degradation e la ricerca (+37.6%), tipi di credential exposure, cos'e un BaaS e perche e rischioso, cos'e logic inversion

**Cosa probabilmente si elimina:** Spiegazioni generiche di sicurezza web, come funzionano le API key, best practice di sicurezza che Opus applica di default

**Target stimato:** 448 → ~250 righe

---

### Ghostwriter (569 righe)

**Cosa probabilmente resta:** Comandi, principio dual-platform (SEO+GEO), answer-first format rule, orchestrazione con Baptist e Seurat, 46 regole come checklist (non spiegate, solo elencate), template routing

**Cosa probabilmente va in KNOWLEDGE.md:** Cos'e SEO e come funziona, cos'e GEO e perche esiste (zero-click, AI traffic +1200%), E-E-A-T spiegato, framework AIDA/PAS/BAB spiegati, cos'e JSON-LD e a cosa serve, come funziona il topic clustering

**Cosa probabilmente si elimina:** Esempi generici di meta tag, come scrivere un heading, best practice HTML semantico, spiegazioni di come funziona Google

**Target stimato:** 569 → ~280 righe

---

### Baptist (266 righe)

**Cosa probabilmente resta:** Comandi, 7 dimensioni audit (lista), ICE formula, orchestrazione (delega a Ghostwriter/Seurat), benchmark per tipo pagina, regole A/B test (sample size, SRM, no peeking)

**Cosa probabilmente va in KNOWLEDGE.md:** Fogg Model spiegato, Cognitive Load Theory, Hick's Law, F/Z pattern, psicologia delle conversioni, perche pre-registration e importante, cos'e SRM

**Cosa probabilmente si elimina:** Spiegazioni generiche di UX, concetti ovvi di web design

**Target stimato:** 266 → ~200 righe

---

### Orson (272 righe)

**Cosa probabilmente resta:** Comandi, filmmaking workflow (5 fasi), sistema autogen, director recipes, integrazione con Seurat/Ghostwriter, constraint tecnici (FFmpeg, Playwright), formato HTML config

**Cosa probabilmente va in KNOWLEDGE.md:** Principi di montaggio video, perche il timing segue il word count, cos'e il Web Animations API, teoria delle animazioni (entrance vs exit vs transition), narrative patterns spiegati

**Cosa probabilmente si elimina:** Come funziona FFmpeg, come funziona Playwright, istruzioni CSS generiche

**Target stimato:** 272 → ~200 righe

---

## Riepilogo target

| Skill | Righe attuali | Target | Riduzione | KNOWLEDGE.md stimato |
|-------|--------------|--------|-----------|---------------------|
| Ghostwriter | 569 | ~280 | -51% | ~300 righe |
| Heimdall | 448 | ~250 | -44% | ~250 righe |
| Seurat | 321 | ~220 | -31% | ~150 righe |
| Orson | 272 | ~200 | -26% | ~120 righe |
| Baptist | 266 | ~200 | -25% | ~150 righe |
| Emmet | 220 | ~160 | -27% | ~100 righe |
| **Totale** | **2.096** | **~1.310** | **-37%** | **~1.070 righe** |

---

## Impatto sul README.md

Il README.md (618 righe) e gia orientato all'utente umano. Non necessita dello stesso trattamento: non e caricato nel context di Claude come istruzione operativa.

**Pero:** dopo il trimming, il README potrebbe avere descrizioni delle skill che non corrispondono piu ai SKILL.md snelliti. Sara da aggiornare le sezioni delle skill nel README per riflettere la nuova struttura (comandi + breve descrizione, con rimando a KNOWLEDGE.md per approfondire).

Aggiungere al README una sezione:

```markdown
## Capire le skill in profondita

Ogni skill ha un file `KNOWLEDGE.md` nella sua cartella che spiega
la domain knowledge dietro la skill — concetti, teorie, e il "perche"
delle scelte fatte. Utile se vuoi capire cosa fa Claude e come
guidarlo meglio.

| Skill | Knowledge file |
|-------|---------------|
| Seurat | `.claude/skills/seurat/KNOWLEDGE.md` |
| Emmet | `.claude/skills/emmet/KNOWLEDGE.md` |
| Heimdall | `.claude/skills/heimdall/KNOWLEDGE.md` |
| Ghostwriter | `.claude/skills/ghostwriter/KNOWLEDGE.md` |
| Baptist | `.claude/skills/baptist/KNOWLEDGE.md` |
| Orson | `.claude/skills/orson/KNOWLEDGE.md` |
```

---

## Ordine di esecuzione

1. **Ghostwriter** (massima riduzione, -51%)
2. **Heimdall** (seconda massima, -44%)
3. **Seurat** (-31%)
4. **Emmet** (-27%)
5. **Orson** (-26%)
6. **Baptist** (-25%)
7. **Aggiornare README.md** con nuova sezione KNOWLEDGE.md e sync descrizioni skill

Per ogni skill:
- Leggere SKILL.md completo
- Classificare ogni sezione con la matrice
- Riscrivere SKILL.md snello
- Scrivere KNOWLEDGE.md
- Verificare che i comandi e il triggering funzionino ancora

---

## Come verifico che funziona

| Check | Metodo |
|-------|--------|
| Riduzione contesto | Contare righe prima/dopo. Target: -37% totale |
| Comportamento invariato | Testare ogni comando principale della skill |
| Knowledge preservata | Rileggere KNOWLEDGE.md: un umano non-esperto capisce il dominio? |
| README coerente | Descrizioni skill nel README corrispondono ai SKILL.md aggiornati |

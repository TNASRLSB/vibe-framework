# Claude Development Framework

Un framework operativo per lavorare con Claude su progetti software, con skill specializzate integrate.

---

## Cos'è

Due componenti che lavorano insieme:

1. **Framework operativo** (`CLAUDE.md` + `.claude/docs/`) — Regole di processo: investigare prima di implementare, tracciare decisioni, verificare prima di affermare.

2. **Skill specializzate** (`.claude/skills/`) — Conoscenza di dominio:
   - **ui-craft** — UI/UX: design direction, accessibilità WCAG, tipografia
   - **dev-patterns** — Development: principi SOLID, API design, testing, security (agnostico + stack-specific)
   - **security-guardian** — Sicurezza AI-specific: OWASP, credential detection, BaaS audit
   - **seo-geo-copy** — SEO tradizionale + GEO (AI search) + copywriting persuasivo
   - **video-craft** — Generazione video programmatica da design system + contenuti (CSS animations + Playwright + FFmpeg)
   - **audiosculpt** — Generazione audio programmatica (soundtrack + SFX) con Tone.js, integrazione video-craft
   - **techdebt** — Audit duplicazioni, export orfani, import inutilizzati, pattern estraibili

Il framework definisce *come* Claude lavora. Le skill definiscono *cosa* sa fare in ambiti specifici.

---

## Struttura

```
progetto/
├── CLAUDE.md                 # Regole operative (il "sistema operativo")
└── .claude/
    ├── README.md             # Questo file (documentazione del framework)
    ├── docs/
    │   ├── registry.md       # Memoria: cosa Claude sa del codebase
    │   ├── decisions.md      # Decisioni architetturali e perché
    │   ├── glossary.md       # Terminologia condivisa tra le skill
    │   ├── checklist.md      # Verifica pre-commit
    │   ├── workflows.md      # Diagrammi di flusso decisionali (Mermaid)
    │   ├── request-log.md    # Registro incrementale richieste utente
    │   ├── visual-composition-principles.md  # Principi composizione visiva condivisi
    │   ├── specs/            # Specifiche feature (prima di implementare)
    │   └── session-notes/    # Post-mortem delle sessioni complesse
    ├── rules/
    │   └── ui-components.md  # Regole per componenti UI
    └── skills/
        ├── ui-craft/         # Skill UI/UX
        │   ├── SKILL.md      # Definizione skill e comandi
        │   ├── generation/   # Sistema generativo (safe/chaos/hybrid)
        │   ├── styles/       # 11 stili visivi base + modificatori
        │   ├── matrices/     # Profili fuzzy weights (tipo, industria, target)
        │   ├── factor-x/     # Controlled chaos
        │   ├── taxonomy/     # Tassonomia pagine ed elementi
        │   └── references.md # Sistema riferimenti visivi
        ├── dev-patterns/     # Skill development patterns
        │   ├── SKILL.md      # Entry point + /adapt-framework
        │   ├── core/         # Pattern agnostici (sempre presenti)
        │   ├── checklists/   # Checklist universali
        │   ├── templates/    # Template per generazione
        │   └── stacks/       # Pattern stack-specific (generati)
        ├── security-guardian/ # Skill sicurezza AI-specific
        ├── seo-geo-copy/     # Skill SEO + GEO + Copywriting
        │   ├── SKILL.md
        │   ├── seo/          # Fondamenti SEO tradizionale
        │   ├── geo/          # GEO per AI search
        │   ├── copywriting/  # Framework persuasivi
        │   ├── generation/   # Prompt operativi per generazione
        │   ├── validation/   # 40 regole misurabili
        │   ├── templates/    # Template contenuti + JSON-LD schemas
        │   ├── checklists/   # Pre-publish e audit
        │   ├── workflows/    # Flussi interattivi
        │   └── reference/    # Contesto progetto (brand, products)
        ├── video-craft/      # Skill generazione video
        │   ├── SKILL.md      # Definizione skill e comandi
        │   └── engine/       # Engine TypeScript (auto-setup)
        ├── audiosculpt/      # Skill generazione audio
        │   ├── SKILL.md      # Definizione skill e comandi
        │   └── presets/      # Stili, patch FM, sample map, coherence matrix
        └── techdebt/         # Skill audit tech debt
            └── SKILL.md      # Definizione skill e comandi
```

---

## Setup

### Nuovo progetto (senza codice esistente)

1. Copia nella root del progetto:
   - `CLAUDE.md`
   - `.claude/` (intera cartella)

2. **Configura le skill in base al tipo di progetto:**

#### Progetto con UI (frontend o fullstack)

```
/ui-craft generate
```
Genera uno stile visivo. Poi:
```
/ui-craft establish
```
Crea il design system in `.ui-craft/tokens.css` + `.ui-craft/design-system.html`. Poi:
```
/ui-craft preview
```
Apri `design-system.html` nel browser per validare visivamente.

```
/adapt-framework
```
Analizza lo stack e genera pattern di sviluppo specifici.

#### Progetto backend-only

```
/adapt-framework
```
Analizza lo stack (Node, Python, Go, etc.) e genera pattern specifici.

3. Inizia a lavorare. Claude popolerà il registry man mano che sviluppa.

---

### Progetto esistente (con codice già scritto)

1. Copia nella root del progetto:
   - `CLAUDE.md`
   - `.claude/` (intera cartella)

2. **Obbligatorio:** Fai popolare il registry:

```
Analizza questo codebase e popola .claude/docs/registry.md con:
- Components e services
- Key functions
- API endpoints
- Database schema
- Environment variables
Salta le sezioni che non si applicano.
```

3. **Obbligatorio:** Genera pattern per lo stack:

```
/adapt-framework
```

4. **Se ci sono pattern architetturali già stabiliti**, documentali:

```
Analizza il codebase e identifica le convenzioni architetturali (patterns, naming, struttura).
Aggiungi le decisioni rilevanti a .claude/docs/decisions.md.
```

5. **Consigliato:** Esegui un audit di sicurezza iniziale:

```
/security-guardian audit
```

6. **Consigliato:** Esegui un audit tech debt iniziale:

```
/techdebt
```

7. **Se il progetto ha check specifici** (linter, i18n, etc.), aggiungi a `.claude/docs/checklist.md`.

---

### Progetto esistente con UI

Se il progetto ha già componenti UI, segui i passi sopra più:

1. **Stabilisci il design system** (importa valori esistenti o creane uno nuovo):

```
/ui-craft establish
```

2. **Analizza lo stato attuale della UI:**

```
/ui-craft analyze-project
```
Crea `.ui-craft/project-map.md` con:
- Pagine mappate agli archetipi (Entry, Discovery, Detail, Action, Management, System)
- Inventario elementi per pagina
- Stato compliance design system
- Violazioni e priorità migrazione

3. **Revisiona il project map** in `.ui-craft/project-map.md`:
- Verifica che le classificazioni siano corrette
- Controlla le priorità delle violazioni

4. **Avvia la migrazione sistematica:**

```
/ui-craft migrate-project
```

5. **Controlla lo stato migrazione in qualsiasi momento:**

```
/ui-craft migration-status
```

### Cosa va popolato/configurato per-progetto

| File/Comando | Tipo | Quando |
|--------------|------|--------|
| `registry.md` | **Obbligatorio** | Subito dopo aver copiato il framework |
| `/adapt-framework` | **Obbligatorio** | Genera pattern per lo stack del progetto |
| `decisions.md` | Consigliato | Se ci sono pattern già stabiliti |
| `/security-guardian audit` | Consigliato | Audit sicurezza iniziale su progetti esistenti |
| `/techdebt` | Consigliato | Audit tech debt iniziale |
| `/ui-craft establish` | Consigliato | Per progetti con UI |
| `/ui-craft analyze-project` | Consigliato | Per progetti esistenti con UI da migrare |
| `checklist.md` | Opzionale | Se ci sono check specifici del progetto |
| `workflows.md` | No | Diagrammi universali, non modificare |
| `specs/*.md` | Automatico | Claude li crea durante lo sviluppo |
| `session-notes/*.md` | Automatico | Claude li crea alla fine di sessioni complesse |

### Cosa NON va modificato

| File | Perché |
|------|--------|
| `CLAUDE.md` | È il "sistema operativo" — uguale per tutti i progetti |
| `workflows.md` | Diagrammi di flusso universali — uguale per tutti i progetti |
| `skills/*` | Le skill sono generiche, non dipendono dal progetto |

---

## Come funziona

### First Run (Primo avvio)

Quando il framework viene usato per la prima volta su un progetto (registry vuoto + request-log vuoto):

1. **Claude si presenta** — Spiega cos'è il framework e cosa può fare
2. **Rimanda alla documentazione** — Indica di leggere `.claude/README.md`
3. **Aspetta conferma** — Prima di procedere con qualsiasi richiesta

Questo assicura che l'utente capisca cosa ha davanti prima di iniziare a lavorare.

### Request Logging

Ogni richiesta che modifica il codebase viene registrata in `.claude/docs/request-log.md`:

| Campo | Descrizione |
|-------|-------------|
| `#` | Numero progressivo |
| `Data` | YYYY-MM-DD |
| `Ora` | HH:MM |
| `Tipologia` | Feature, Bug fix, Refactoring, Research, Config, Doc |
| `Descrizione` | Breve sommario della richiesta |
| `Doc riferimento` | Link alla spec (se non banale) |
| `Stato` | in sospeso, in corso, completato, annullato |

**Non vengono loggate:** domande semplici, letture file, richieste di chiarimento.

### Flusso di lavoro standard

1. **Claude legge `CLAUDE.md`** all'inizio della sessione (automatico).

2. **Prima di lavorare**, Claude consulta:
   - `.claude/docs/registry.md` — Cosa esiste già?
   - `.claude/docs/decisions.md` — Decisioni passate da rispettare?
   - `.claude/docs/glossary.md` — Terminologia condivisa
   - `.claude/docs/workflows.md` — Diagrammi di flusso per decisioni complesse

3. **Quando riceve una richiesta di lavoro**, Claude:
   - Aggiunge entry a `.claude/docs/request-log.md` con stato `in corso`
   - Se non banale, crea prima la spec e aggiunge il riferimento al log

4. **Per modifiche non banali**, Claude:
   - Cerca soluzioni esistenti nel registry e nel codebase
   - Crea una spec in `.claude/docs/specs/[nome].md`
   - Aspetta approvazione ("PROCEED")
   - Implementa

5. **Quando l'implementazione deraglia** (2+ tentativi falliti):
   - Si ferma
   - Crea nuova spec analizzando cosa è andato storto
   - Ripianifica da zero
   - Aspetta nuovo "PROCEED"

6. **Dopo aver implementato**, Claude:
   - Aggiorna il registry con nuovi componenti
   - Registra decisioni architetturali rilevanti
   - Aggiorna request-log.md con stato `completato`
   - Esegue la checklist pre-commit

7. **A fine sessione** (se la sessione è stata complessa):
   - Crea note in `.claude/docs/session-notes/[data]-[topic].md`
   - Aggiorna CLAUDE.md se ha scoperto nuovi failure mode

### Workflow Diagrams

Il file `.claude/docs/workflows.md` contiene diagrammi Mermaid che visualizzano i flussi decisionali del framework:

| Workflow | Quando consultare |
|----------|-------------------|
| Change Classification | Per decidere se serve una spec |
| Registry Verification | Prima di affermare che qualcosa esiste |
| Pre-Generation (UX) | Prima di generare codice UI |
| Severity Enforcement | Quando security-guardian trova vulnerabilità |
| Iteration Tracking | Quando modifico lo stesso file ripetutamente |
| Pre-Commit Checklist | Prima di ogni commit |

I diagrammi rendono esplicita la logica condizionale che altrimenti sarebbe sparsa nelle skill in forma testuale.

### Skills

Le skill sono moduli di conoscenza specializzata che Claude può attivare in base al contesto.

#### UI-Craft

Si attiva automaticamente quando il contesto riguarda UI/UX, oppure manualmente:

| Comando | Cosa fa |
|---------|---------|
| `/ui-craft generate` | Genera stile visivo con sistema fuzzy weights (safe/chaos/hybrid) |
| `/ui-craft establish` | Crea tokens.css + design-system.html |
| `/ui-craft apply` | Applica il design system durante la generazione |
| `/ui-craft audit` | Verifica accessibilità e coerenza |
| `/ui-craft research [topic]` | Ricerca prima di progettare |
| `/ui-craft polish` | Rifinitura finale |
| `/ui-craft extract [name]` | Salva un pattern riutilizzabile |
| `/ui-craft reference [pattern]` | Consulta riferimenti visivi curati |
| `/ui-craft compliance` | Audit compliance design system su tutto il codebase |
| `/ui-craft migrate [pattern]` | Migrazione sistematica di un pattern |
| `/ui-craft preview` | Apri design-system.html per validazione visiva |
| `/ui-craft test-system` | Genera pagine HTML statiche per testare il design system |
| `/ui-craft map-sitemap` | Mappa route progetto → archetipi pagina |
| `/ui-craft archetype [type]` | Genera template completo per un archetipo |

**Generative System:** La skill include un sistema di generazione stili basato su:
- **Matrici fuzzy weights** — Profili per tipo (25), industria (40+), target (7 dimensioni)
- **11 stili base** — Flat, Material, Neumorphism, Glassmorphism, Brutalism, Claymorphism, Skeuomorphism, Y2K, Gen-Z, Bento, Spatial
- **4 modificatori** — Grid (Swiss/Bento/Broken), Curves, Palette, Density
- **Factor X** — "Breakers" per evitare output generici (Typography Clash, Color Intrusion, etc.)
- **3 modi** — Safe (prevedibile), Chaos (random), Hybrid (matrici + Factor X)

**Page Taxonomy System:** 6 archetipi pagina (Entry, Discovery, Detail, Action, Management, System). Ogni archetipo definisce layout patterns, component slots, content patterns e interaction flows.

**Design System:** Source of truth è `tokens.css` (CSS custom properties). `design-system.html` è la preview vivente.

**Attivazione:** UI, UX, component, interface, design system, accessibility, WCAG, frontend styling

#### Dev Patterns

Framework di sviluppo agnostico con pattern core universali e generazione dinamica di pattern stack-specific.

| Comando | Cosa fa |
|---------|---------|
| `/adapt-framework` | Analizza il progetto e genera pattern per lo stack rilevato |
| `/dev-patterns principles` | Consulta principi SOLID, DRY, KISS |
| `/dev-patterns api` | REST/GraphQL design patterns |
| `/dev-patterns testing` | TDD, coverage, mocking |
| `/dev-patterns security` | Checklist sicurezza |
| `/dev-patterns stack` | Pattern specifici del tuo stack |
| `/dev-patterns review` | Code review con checklist |
| `/dev-patterns checklist [type]` | Carica checklist (pre-deploy, refactoring) |

**Architettura a due livelli:**
1. **Core agnostico** — Principi universali sempre disponibili (SOLID, API design, testing, security, error handling, caching)
2. **Stack-specific** — Pattern generati dinamicamente per il tuo stack

**Attivazione:** Automatica quando crei un nuovo progetto, manuale con `/adapt-framework` su progetti esistenti

#### Security Guardian

Analisi di sicurezza specifica per codice AI-generated. Rileva vulnerabilità tipiche del vibe coding:

| Comando | Cosa fa |
|---------|---------|
| `/security-guardian scan [path]` | Scansiona file/directory per vulnerabilità |
| `/security-guardian audit` | Audit completo del progetto |
| `/security-guardian secrets` | Scansione credenziali e segreti |
| `/security-guardian baas [provider]` | Audit configurazione BaaS (Supabase/Firebase) |
| `/security-guardian status` | Stato sicurezza dei file tracciati |
| `/security-guardian report [format]` | Genera report (sarif/markdown/json) |
| `/security-guardian config` | Configura impostazioni |

**Funzionalità:** Pattern OWASP Top 10, rilevamento credenziali hardcoded, audit BaaS, tracciamento iteration degradation, rilevamento logic inversion

**Attivazione:** Security review, code audit, credential check, configuration analysis

#### SEO-GEO-Copy

Contenuti ottimizzati per search engine tradizionali (Google, Bing) e AI search (ChatGPT, Claude, Perplexity).

| Comando | Cosa fa |
|---------|---------|
| `/seo-geo-copy write [type]` | Genera contenuto dual-optimized (article, landing, product, faq) |
| `/seo-geo-copy audit [url/content]` | Audit SEO + GEO + copywriting con score 0-100 |
| `/seo-geo-copy schema [type]` | Genera JSON-LD |
| `/seo-geo-copy pillar-cluster [topic]` | Progetta architettura topic cluster |
| `/seo-geo-copy meta [content]` | Genera title tag, meta description, OG tags |
| `/seo-geo-copy research [topic]` | Ricerca keyword + intent + competitor gaps |
| `/seo-geo-copy optimize [file]` | Ottimizza contenuto esistente |

**Attivazione:** content creation, SEO, copywriting, landing page, article, blog post, product description

#### Video-Craft

Generazione video programmatica. Genera pagine HTML con CSS animations, cattura frame-by-frame via Web Animations API, e codifica in MP4 con FFmpeg.

| Comando | Cosa fa |
|---------|---------|
| `/video-craft create` | Flusso guidato — crea un video interattivamente |
| `/video-craft render <file>` | Renderizza video da HTML o config YAML |
| `/video-craft storyboard <file>` | Preview testuale dello storyboard |
| `/video-craft validate <file>` | Controlla errori nella config |
| `/video-craft formats` | Lista formati disponibili |
| `/video-craft entrances` | Lista animazioni entrance disponibili |

**Caratteristiche:** 131 animazioni, 4 modi (safe/chaos/hybrid/cocomelon), timing automatico, integrazione ui-craft + seo-geo-copy, director system (content-aware animation), scene templates, choreography system

**Requisiti di sistema:** FFmpeg installato (`ffmpeg` nel PATH)

**Attivazione:** video generation, promo video, social media video, product video

#### AudioSculpt

Generazione audio programmatica (soundtrack + SFX) con Tone.js. Due engine: Text2midi (AI-generated MIDI → Tone.js rendering) o sintesi Tone.js diretta. Output: blocco `<script>` self-contained.

| Comando | Cosa fa |
|---------|---------|
| `/audiosculpt create` | Flusso guidato — crea audio per webvideo o standalone |
| `/audiosculpt add-to-video <html>` | Inietta audio in un webvideo video-craft esistente |
| `/audiosculpt preview <style>` | Genera pagina HTML con demo 15s di uno stile |
| `/audiosculpt styles` | Lista i 20 stili soundtrack disponibili |
| `/audiosculpt setup` | Installa engine Text2midi (opzionale, richiede Python + GPU) |

**Caratteristiche:** 20 stili in 4 famiglie (tonal/modal/loop/experimental + horror hybrid), 6 famiglie SFX, 31 strumenti campionati con fallback FM, 45 patch FM, regole per-famiglia (contrappunto, armonia funzionale, orchestrazione, forma tematica, densità orchestrale, quantizzazione temporale video→musica). Integrazione video-craft.

**Attivazione:** audio generation, soundtrack, sound effects, music, audio for video

#### Techdebt

Audit rapido del codebase per debito tecnico strutturale.

| Comando | Cosa fa |
|---------|---------|
| `/techdebt [path]` | Audit duplicazioni, export orfani, import inutilizzati, pattern estraibili, file oversized |

**Output:** Report in `.claude/docs/techdebt-report.md`

**Quando usarlo:** Fine sessione, prima di PR, periodicamente come igiene del codice

---

## Glossario del Framework

Terminologia condivisa tra le skill. Il file `glossary.md` nel progetto utente è per termini specifici del progetto.

### Prodotti / Output

| Termine | Definizione |
|---------|------------|
| **website** | Sito internet completo generato da ui-craft (HTML + CSS + assets). Il prodotto finale per il web. |
| **webvideo** | Pagina .html generata da video-craft, destinata a diventare video. Non è un sito — è un file self-contained con scene animate, che il capture engine trasforma in .mp4. |

### Design System

| Termine | Definizione |
|---------|------------|
| **design system** | L'intera identità visiva di un progetto: `tokens.css` + `style.css`. Entrambi vivono in `.ui-craft/` o nella cartella assets del website. |
| **tokens** (`tokens.css`) | Variabili CSS primitive: colori, font, spacing, motion, radius, border. I valori grezzi, senza contesto d'uso. |
| **styles** (`style.css`) | Regole CSS che applicano i token ai componenti: nav, hero, cards, buttons, layout grid, responsive. L'identità visiva concreta. |
| **design-system.html** | Preview vivente del design system. Importa tokens.css e mostra tutti gli elementi visivamente. |

### Architettura

| Termine | Definizione |
|---------|------------|
| **archetype** (ui-craft) | Tipo di pagina web: Entry, Discovery, Detail, Action, Management, System. Ogni archetype ha wireframe e layout predefiniti. |
| **scene-type** (video-craft) | Tipo di scena nel webvideo: stat-callout, feature-showcase, cta-outro, ecc. Definisce layout, densità, background e animazioni della scena. |

### Modalità

| Termine | Definizione |
|---------|------------|
| **mode** | Direzione creativa che Claude segue nella generazione. Condiviso tra ui-craft e video-craft. |
| **safe** | Pulito, corporate, professionale. Basso rischio. |
| **chaos** | Dinamico, sperimentale, scelte random. Alto rischio. |
| **hybrid** | Base safe con un elemento sorpresa per scena/pagina. Rischio medio. |
| **cocomelon** | Hyper-engaging, neuro-ottimizzato. Arco di arousal (arrest→escalate→climax→descend→convert). Solo video-craft. |

### Pipeline Video

| Termine | Definizione |
|---------|------------|
| **capture engine** | Il componente che trasforma il webvideo (.html) in video (.mp4). Non va confuso con la generazione del webvideo. |
| **narrative pattern** | Sequenza predefinita di scene-type che struttura il webvideo (es. problem-solution, hook-parade, neuro-hijack). |

---

## Perché questo framework

Claude ha tendenze che causano errori:
- Affermare che qualcosa esiste senza verificare
- Iniziare a scrivere codice prima di capire
- Dimenticare decisioni prese in precedenza
- Aggiungere feature non richieste
- Reimplementare codice che esiste già
- Insistere su approcci fallimentari
- Perdere pattern ripetuti in file grandi
- Dichiarare "fatto" un refactoring incompleto

Il framework mitiga questi problemi con:
- **Registry** — Memoria esterna verificabile
- **Specs** — Pensare prima di implementare
- **Decisions** — Non contraddire scelte passate
- **Checklist** — Verifica finale sistematica
- **Migration tracker** — Traccia refactoring su più file
- **Session notes** — Impara dagli errori tra sessioni
- **Anti-duplicazione** — Cerca prima di creare
- **Re-plan** — Fermati e ripianifica quando va storto

---

## Aggiungere altre skill

Le skill sono modulari. Per aggiungerne una:

1. Crea `.claude/skills/[nome-skill]/SKILL.md`
2. Aggiungi file di supporto nella stessa cartella
3. Documenta la skill in `.claude/docs/registry.md`

La skill sarà disponibile automaticamente nelle sessioni future.

---

## Note

- Il framework è pensato per Claude Code (CLI/VSCode), ma i principi funzionano anche con altre interfacce.
- `CLAUDE.md` viene letto automaticamente se presente nella root del progetto.
- Le skill in `.claude/skills/` vengono rilevate automaticamente.

---

## FAQ

### Le skill vengono impattate dal registry?

**No, sono indipendenti.** Le skill sono definite a livello di configurazione Claude Code, non nel registry. Il registry è "memoria" di cosa esiste nel progetto. Le skill sono "capacità" che Claude può usare.

Il registry **informa** le skill, non le modifica.

### Devo popolare il registry ogni volta che copio il framework?

**Sì, se il progetto ha già codice.** Il registry è specifico per-progetto. Copiarlo da un altro progetto creerebbe confusione.

### Cosa succede se non popolo il registry?

Claude funziona lo stesso, ma potrebbe ri-scoprire componenti già esistenti, creare duplicati, o fare assunzioni errate.

### Posso modificare le skill?

Sì, ma con attenzione:
- **Modifiche sicure:** Aggiungere pattern, esempi, riferimenti
- **Modifiche rischiose:** Cambiare la logica core o i comandi

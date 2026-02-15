# Claude Development Framework

Un framework operativo per lavorare con Claude su progetti software, con skill specializzate integrate.

---

## Quick Start

### Quale percorso seguire?

| Il tuo progetto | Percorso |
|-----------------|----------|
| **Nuovo**, senza codice esistente | → [Nuovo progetto](#nuovo-progetto-senza-codice-esistente) |
| **Esistente**, solo backend | → [Progetto esistente](#progetto-esistente-con-codice-già-scritto) |
| **Esistente**, con UI | → [Progetto esistente](#progetto-esistente-con-codice-già-scritto) + [con UI](#progetto-esistente-con-ui) |

### Setup minimo

**1. Installa il framework** nel tuo progetto:
```bash
./framework.sh /path/to/tuo-progetto
```
Lo script copia `CLAUDE.md` + `.claude/`, crea `settings.local.json`, directory output e aggiorna `.gitignore`.

**2. Popola il registry** (se progetto esistente):
```
Analizza questo codebase e popola .claude/docs/registry.md con:
- Components e services
- Key functions
- API endpoints
- Database schema
- Environment variables
Salta le sezioni che non si applicano.
```

**3. Genera pattern per lo stack:**
```
/adapt-framework
```

**4. (Opzionale) Per progetti con UI:**
```
/seurat extract
/seurat analyze-project
```

### Aggiornamento

Per aggiornare il framework mantenendo i tuoi dati (registry, decisions, specs, session-notes):
```bash
cd ~/path/to/framework-source
git pull
./framework.sh /path/to/tuo-progetto
```

Lo script:
- Sovrascrive i file framework (skill, workflow, checklist, ecc.)
- Preserva i file utente (registry, decisions, request-log, specs, session-notes, ecc.)
- Crea un backup dei file sovrascritti in `.framework-backup-[timestamp]/`
- Usa `--dry-run` per vedere le modifiche senza applicarle

---

## Cos'è

Due componenti che lavorano insieme:

1. **Framework operativo** (`CLAUDE.md` + `.claude/docs/`) — Regole di processo: investigare prima di implementare, tracciare decisioni, verificare prima di affermare.

2. **Skill specializzate** (`.claude/skills/`) — Conoscenza di dominio:
   - **seurat** — UI/UX: design direction, accessibilità WCAG, tipografia
   - **emmet** — Testing, QA, tech debt audit, functional mapping, framework adaptation
   - **heimdall** — Sicurezza AI-specific: OWASP, credential detection, BaaS audit, diff-aware analysis
   - **ghostwriter** — SEO tradizionale + GEO (AI search) + copywriting persuasivo
   - **baptist** — CRO orchestrator: diagnosi conversioni (Fogg B=MAP), A/B test design, funnel analysis, coordina Ghostwriter e Seurat
   - **orson** — Generazione video + demo recording con audio integrato (frame-addressed animations via interpolate/spring + Playwright + FFmpeg + Edge-TTS)
   - **scribe** — Creazione e editing documenti Office (xlsx, docx, pptx) e PDF, routing automatico per tipo file
   - **forge** — Meta-skill: creazione, manutenzione, audit e miglioramento skill Claude Code

3. **Morpheus** (`.claude/morpheus/`) — Context awareness: monitora l'uso della context window e inietta istruzioni quando si superano soglie (60% triage, 80% save-state, 93% halt). Richiede `jq`.

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
    ├── morpheus/             # Context awareness (statusLine + hook injector)
    │   └── config.json       # Soglie (60/80/93%), messaggi, repeat mode
    ├── rules/
    │   └── ui-components.md  # Regole per componenti UI
    └── skills/
        ├── seurat/           # Skill UI/UX
        │   ├── SKILL.md      # Definizione skill e comandi
        │   ├── generation/   # Sistema generativo (safe/chaos/hybrid)
        │   ├── styles/       # 11 stili visivi base + modificatori
        │   ├── matrices/     # Profili fuzzy weights (tipo, industria, target)
        │   ├── factor-x/     # Controlled chaos
        │   ├── taxonomy/     # Tassonomia pagine ed elementi
        │   ├── references/   # Riferimenti on-demand
        │   ├── references.md # Sistema riferimenti visivi (quick ref)
        │   ├── templates/    # Archetipi pagina + preview
        │   └── wireframes/   # Layout system, componenti, varianti
        ├── emmet/            # Skill testing, QA, tech debt, checklists
        │   ├── SKILL.md      # Entry point + /adapt-framework
        │   ├── prompts/      # Workflow operativi (map, test)
        │   ├── templates/    # Template output (functional-map)
        │   ├── scripts/      # Script automazione
        │   ├── testing/      # Static e dynamic testing
        │   ├── stacks/       # Pattern generati per stack (via /adapt-framework)
        │   └── checklists/   # Checklist universali
        ├── heimdall/         # Skill sicurezza AI-specific
        │   ├── SKILL.md      # Definizione skill e comandi
        │   ├── patterns/     # OWASP, secrets, BaaS misconfig (JSON)
        │   ├── data/         # Known packages database (2000+)
        │   ├── hooks/        # PreToolUse + PostToolUse validators
        │   ├── scripts/      # Scanner, diff-analyzer, import-checker
        │   ├── references/   # Guide BaaS e credenziali (on-demand)
        │   └── reference/    # OWASP guide, secure patterns
        ├── ghostwriter/      # Skill SEO + GEO + Copywriting
        │   ├── SKILL.md
        │   ├── seo/          # Fondamenti SEO tradizionale
        │   ├── geo/          # GEO per AI search
        │   ├── copywriting/  # Framework persuasivi
        │   ├── generation/   # Prompt operativi per generazione
        │   ├── validation/   # 50 regole misurabili
        │   ├── templates/    # Template contenuti + JSON-LD schemas
        │   ├── checklists/   # Pre-publish e audit
        │   ├── workflows/    # Flussi interattivi
        │   ├── reference/    # Contesto progetto (brand, products)
        │   └── references/   # Approfondimenti on-demand
        ├── baptist/          # Skill CRO (Conversion Rate Optimization)
        │   ├── SKILL.md      # Definizione skill e comandi
        │   ├── references/   # Approfondimenti (form, page, testing, popup, activation, paywall)
        │   └── assets/       # Template (test plan, audit, funnel, ICE, results)
        ├── orson/            # Skill video + demo + audio integrato
        │   ├── SKILL.md      # Definizione skill e comandi
        │   └── engine/       # Engine TypeScript + audio (auto-setup)
        │       ├── src/      # 28 file TS (render, demo, audio, capture, encode)
        │       └── audio/    # TTS, presets, tracks, SFX, references
        ├── scribe/           # Skill documenti Office + PDF
        │   ├── SKILL.md      # Routing automatico per tipo file
        │   ├── references/   # Guide per formato (xlsx, docx, pdf)
        │   ├── scripts/      # Validazione OOXML, recalc, thumbnail
        │   └── templates/    # Template documenti (financial model, etc.)
        └── forge/            # Meta-skill manutenzione skill
            ├── SKILL.md      # Creazione, audit, fix skill
            ├── references/   # Trimming methodology, quality checklist, anatomy
            ├── scripts/      # audit-skills.sh (quantitativo)
            └── templates/    # Skill template, reference template, knowledge template
```

---

## Setup

### Nuovo progetto (senza codice esistente)

1. Installa il framework:
   ```bash
   ./framework.sh /path/to/tuo-progetto
   ```

2. **Configura le skill in base al tipo di progetto:**

#### Progetto con UI (frontend o fullstack)

```
/seurat setup
```
Genera stile visivo e crea il design system in `.seurat/tokens.css` + `.seurat/design-system.html`. Poi:
```
/seurat preview
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

1. Installa il framework:
   ```bash
   ./framework.sh /path/to/tuo-progetto
   ```

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
/heimdall audit
```

6. **Consigliato:** Esegui un audit tech debt iniziale:

```
/emmet techdebt
```

7. **Se il progetto ha check specifici** (linter, i18n, etc.), aggiungi a `.claude/docs/checklist.md`.

---

### Progetto esistente con UI

Se il progetto ha già componenti UI, segui i passi sopra più:

1. **Estrai il design system** dal codice esistente:

```
/seurat extract
```
Analizza CSS/SCSS, estrae token, genera `.seurat/tokens.css` + `.seurat/design-system.html` + report inconsistenze.

2. **Analizza lo stato attuale della UI:**

```
/seurat analyze-project
```
Crea `.seurat/project-map.md` con:
- Pagine mappate agli archetipi (Entry, Discovery, Detail, Action, Management, System)
- Inventario elementi per pagina
- Stato compliance design system
- Violazioni e priorità migrazione

3. **Revisiona il project map** in `.seurat/project-map.md`:
- Verifica che le classificazioni siano corrette
- Controlla le priorità delle violazioni

4. **Avvia la migrazione sistematica:**

```
/seurat migrate-project
```

5. **Controlla lo stato migrazione in qualsiasi momento:**

```
/seurat migration-status
```

### Cosa va popolato/configurato per-progetto

| File/Comando | Tipo | Quando |
|--------------|------|--------|
| `registry.md` | **Obbligatorio** | Subito dopo aver copiato il framework |
| `/adapt-framework` | **Obbligatorio** | Genera pattern per lo stack del progetto |
| `decisions.md` | Consigliato | Se ci sono pattern già stabiliti |
| `/heimdall audit` | Consigliato | Audit sicurezza iniziale su progetti esistenti |
| `/emmet techdebt` | Consigliato | Audit tech debt iniziale |
| `/emmet map` | Consigliato | Genera functional map del codebase per testing |
| `/seurat setup` | Consigliato | Per nuovi progetti con UI |
| `/seurat extract` | Consigliato | Per progetti esistenti con UI (estrae token dal codice) |
| `/seurat analyze-project` | Consigliato | Per progetti esistenti con UI da migrare |
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
| Severity Enforcement | Quando heimdall trova vulnerabilità |
| Iteration Tracking | Quando modifico lo stesso file ripetutamente |
| Pre-Commit Checklist | Prima di ogni commit |

I diagrammi rendono esplicita la logica condizionale che altrimenti sarebbe sparsa nelle skill in forma testuale.

### Skills

Le skill sono moduli di conoscenza specializzata che Claude può attivare in base al contesto.

#### Seurat

Si attiva automaticamente quando il contesto riguarda UI/UX, oppure manualmente:

| Comando | Cosa fa |
|---------|---------|
| `/seurat setup` | Genera stile visivo + crea tokens.css + design-system.html (safe/chaos/hybrid) |
| `/seurat extract` | Estrae design system da codice esistente → tokens.css + report |
| `/seurat preview` | Apri design-system.html per validazione visiva |
| `/seurat build [type]` | Genera pagina completa (entry/discovery/detail/action/management/system) |
| `/seurat apply` | Applica il design system durante la generazione |
| `/seurat audit` | Verifica accessibilità e coerenza |
| `/seurat research [topic]` | Ricerca prima di progettare |
| `/seurat polish` | Rifinitura finale |
| `/seurat save-pattern [name]` | Salva un pattern riutilizzabile |
| `/seurat reference [pattern]` | Consulta riferimenti visivi curati |
| `/seurat compliance` | Audit compliance design system su tutto il codebase |
| `/seurat migrate [pattern]` | Migrazione sistematica di un pattern |
| `/seurat analyze-project` | Analizza codebase esistente, crea project-map.md |
| `/seurat migrate-project` | Guida migrazione sistematica al design system |
| `/seurat migration-status` | Stato migrazione in corso |

**Generative System:** La skill include un sistema di generazione stili basato su:
- **Matrici fuzzy weights** — Profili per tipo (25), industria (40+), target (7 dimensioni)
- **11 stili base** — Flat, Material, Neumorphism, Glassmorphism, Brutalism, Claymorphism, Skeuomorphism, Y2K, Gen-Z, Bento, Spatial
- **4 modificatori** — Grid (Swiss/Bento/Broken), Curves, Palette, Density
- **Factor X** — "Breakers" per evitare output generici (Typography Clash, Color Intrusion, etc.)
- **3 modi** — Safe (prevedibile), Chaos (random), Hybrid (matrici + Factor X)

**Page Taxonomy System:** 6 archetipi pagina (Entry, Discovery, Detail, Action, Management, System). Ogni archetipo definisce layout patterns, component slots, content patterns e interaction flows.

**Design System:** Source of truth è `tokens.css` (CSS custom properties). `design-system.html` è la preview vivente.

**Attivazione:** UI, UX, component, interface, design system, accessibility, WCAG, frontend styling

#### Emmet

Testing, QA, tech debt audit, functional mapping e checklist di sviluppo. Include anche l'adattamento del framework allo stack. Ciclo: MAP → ANALISI → ESECUZIONE → REPORT.

| Comando | Cosa fa |
|---------|---------|
| `/adapt-framework` | Analizza il progetto e genera pattern per lo stack rilevato |
| `/emmet map` | Analizza codebase e genera functional map (source of truth per testing) |
| `/emmet map --update` | Rigenera functional map preservando stato test |
| `/emmet test` | Ciclo QA completo (static analysis + browser test) |
| `/emmet test --static` | Solo analisi statica (veloce, no browser) |
| `/emmet test --browser` | Solo test browser (Playwright o BrowserMCP) |
| `/emmet report` | Genera bug report dall'ultimo test |
| `/emmet techdebt [path]` | Audit duplicazioni, export orfani, import inutilizzati, file oversized + Debt Rating A-F |
| `/emmet checklist [type]` | Carica checklist (pre-deploy, refactoring, code-review, security) |

**Funzionalità:**
- **Functional mapping** — Scansiona 100% del codebase: schermate, transizioni stato, personas, use cases, workflow
- **Dual testing backend** — Auto-rileva Playwright (CI) vs BrowserMCP (visual regression)
- **Static analysis** — Sicurezza, errori logici, performance, qualità codice
- **Dynamic testing** — Test con Playwright (API, UI, E2E)
- **Visual QA** — Confronto screenshot per regressioni UI (Opus 4.6)
- **Tech debt audit** — Duplicazioni, export orfani, import inutilizzati, file oversized (>300 righe)
- **Checklists** — Pre-deploy, refactoring, code-review, security
- **Integrazione Heimdall** — Security pre-check automatico su file sensibili

**Attivazione:** testing, debugging, QA, tech debt, code quality, checklist, framework adaptation

#### Heimdall

Analisi di sicurezza specifica per codice AI-generated. Rileva vulnerabilità tipiche del vibe coding:

| Comando | Cosa fa |
|---------|---------|
| `/heimdall scan [path]` | Scansiona file/directory per vulnerabilità |
| `/heimdall audit [--quick\|--deep]` | Audit progetto (L1 quick / L2 standard / L3 deep) |
| `/heimdall secrets` | Scansione credenziali e segreti |
| `/heimdall baas [provider]` | Audit configurazione BaaS (Supabase/Firebase) |
| `/heimdall status` | Stato sicurezza dei file tracciati |
| `/heimdall report [format]` | Genera report (markdown/json/sarif) |
| `/heimdall reset [path]` | Reset iteration tracking dopo review umana |
| `/heimdall config` | Configura impostazioni |

**Funzionalità:**
- **OWASP Top 10** — A01-A10 + XSS (6+ pattern ciascuno) con alternative sicure
- **Credential detection** — API keys, JWT, chiavi private, segreti hardcoded
- **BaaS audit** — RLS, security rules, service key exposure per provider (Supabase, Firebase, Amplify, PocketBase)
- **Iteration tracking** — Warning su file editati 6+ volte (basato su ricerca arXiv:2506.11022)
- **Diff-aware analysis** — Rileva pattern di sicurezza rimossi durante le modifiche
- **Import checking** — Database 2000+ pacchetti comuni per rilevamento typo (no network)
- **Path-context severity** — Gravità adattata al contesto (es. service_role key: CRITICAL in client, MEDIUM in server)
- **Hook integration** — PreToolUse (pre-validazione) + PostToolUse (diff analysis + iteration tracking)
- **SARIF export** — Integrazione GitHub Security

**Attivazione:** Security review, code audit, credential check, configuration analysis, vulnerability scan

#### Ghostwriter

Contenuti ottimizzati per search engine tradizionali (Google, Bing) e AI search (ChatGPT, Claude, Perplexity).

| Comando | Cosa fa |
|---------|---------|
| `/ghostwriter write [type]` | Genera contenuto dual-optimized (landing, article, product, service, faq, pillar, cluster) |
| `/ghostwriter audit [url/content]` | Audit SEO + GEO + copywriting con score 0-100 |
| `/ghostwriter research [topic]` | Ricerca keyword + intent + competitor gaps + AI platforms |
| `/ghostwriter optimize [file]` | Ottimizza contenuto esistente per dual platform |
| `/ghostwriter schema [type]` | Genera JSON-LD strutturato |
| `/ghostwriter persona [audience]` | Crea buyer/reader persona |
| `/ghostwriter pillar-cluster [topic]` | Progetta architettura topic cluster |
| `/ghostwriter meta [content]` | Genera title tag, meta description, OG tags |
| `/ghostwriter llms-txt` | Genera direttive llms.txt per AI crawlers |
| `/ghostwriter robots [strategy]` | Configura robots.txt (allow-all/selective/search-only) |

**Attivazione:** content creation, SEO, GEO, copywriting, landing page, article, blog post, product description, AI citation

#### Baptist

CRO orchestrator. Diagnosa problemi di conversione con Fogg Behavior Model (B=MAP), progetta esperimenti A/B, analizza funnel, e coordina Ghostwriter (copy) e Seurat (UI) per le fix.

| Comando | Cosa fa |
|---------|---------|
| `/baptist audit [url/content]` | Audit CRO completo su 7 dimensioni con ICE scores |
| `/baptist test [ipotesi]` | Progetta esperimento A/B rigoroso con pre-registrazione |
| `/baptist funnel [flusso]` | Analisi diagnostica funnel con drop-off e root cause |
| `/baptist report` | Documentazione risultati e learning repository |
| `/baptist analyze [tipo pagina]` | Analisi CRO focalizzata (landing, pricing, form, checkout, onboarding, paywall) |

**Framework:** Fogg B=MAP (Behavior = Motivation × Ability × Prompt) come lente diagnostica unificante. Ogni problema di conversione è M, A, o P.

**Orchestrazione:** Baptist non duplica psicologia persuasiva (Ghostwriter) né design patterns (Seurat). Diagnosa il problema, delega la fix all'owner corretto, progetta il test.

**Attivazione:** CRO, conversion rate, A/B test, funnel, landing page optimization, form optimization

#### Orson

Generazione video programmatica + demo recording. Segue un workflow cinematografico: Pre-production → Screenplay → Storyboard → Direction → Production.

| Comando | Cosa fa |
|---------|---------|
| `/orson create` | Flusso guidato — crea un video interattivamente (4 fasi) |
| `/orson render <file.html>` | Renderizza video da HTML config (con audio) |
| `/orson render <file.html> --no-audio` | Renderizza video senza audio |
| `/orson demo <script.json>` | Demo mode — registra demo live con narrazione, zoom e cursor |
| `/orson formats` | Lista formati disponibili |
| `/orson entrances` | Lista animazioni entrance disponibili |

**Workflow:** Claude fa lo sceneggiatore (analizza source, struttura scene, scrive copy con ghostwriter), poi autogen genera HTML, director assegna animazioni, capture engine produce MP4 con audio.

**Caratteristiche:** Architettura frame-addressed (v3) con `interpolate()`, `spring()`, `window.__setFrame(n)`. 136+ animazioni (property-based interpolation maps), 4 modi (safe/chaos/hybrid/cocomelon), content-driven timing, integrazione seurat + ghostwriter, director system (content-aware animation). Audio integrato: selezione tracce automatica, TTS narration (Edge-TTS), ducking, mixing FFmpeg. Demo mode: Playwright recording con zoom, cursor animato, narrazione, sottotitoli WebVTT.

**Requisiti di sistema:** FFmpeg installato (`ffmpeg` nel PATH). Opzionale: `pip install edge-tts` per narrazione TTS. Opzionale: `pip install elevenlabs` per ElevenLabs TTS engine.

**Attivazione:** video generation, promo video, social media video, product video, demo recording

#### Scribe

Creazione, lettura ed editing di documenti Office e PDF. Routing automatico per tipo file — l'utente specifica il formato e Scribe sceglie libreria e workflow.

**Formati supportati:**

| Formato | Libreria principale | Fallback |
|---------|-------------------|----------|
| `.xlsx` (Excel) | openpyxl (struttura + formule) | pandas (data-heavy), LibreOffice recalc |
| `.docx` (Word) | python-docx | OOXML editing (tracked changes, content controls) |
| `.pptx` (PowerPoint) | python-pptx | OOXML editing (design-heavy) |
| `.pdf` | reportlab (creazione), pypdf (lettura/merge) | qpdf (ottimizzazione) |

**Funzionalità:**
- **OOXML editing workflow** — Unpack → Edit XML → Validate → Pack per feature non esposte dalle API high-level
- **Zero-error output** — Ogni documento validato prima della consegna
- **Script black-box** — Recalc formule, OOXML pack/unpack/validate, thumbnail generazione
- **Integrazione** — Ghostwriter (contenuti), Seurat (design tokens), Baptist (report CRO), Emmet (static analysis)

**Attivazione:** Excel, spreadsheet, Word, document, PowerPoint, presentation, PDF, .xlsx, .docx, .pptx, .pdf

#### Forge

Meta-skill per creare, mantenere e migliorare le skill Claude Code. Codifica best practice da Anthropic custom instructions e lesson learned da tutte le skill esistenti.

| Comando | Cosa fa |
|---------|---------|
| `/forge create [name]` | Scaffold nuova skill da template (directory, SKILL.md, registrazione registry) |
| `/forge audit` | Audit semantico + quantitativo di tutte le skill (produce piano, no modifiche) |
| `/forge fix` | Esegue raccomandazioni da forge-audit.md |
| `/forge fix [skill]` | Esegue fix solo per la skill specificata |

**Funzionalità:**
- **Skill scaffolding** — Struttura directory, SKILL.md template, registrazione automatica in registry
- **Audit quantitativo** — Word count, metriche strutturali via `scripts/audit-skills.sh`
- **Audit semantico** — Decision matrix (Claude needs? User needs? → Trim/Keep/Move/Delete)
- **Trimming methodology** — Progressive disclosure (frontmatter → SKILL.md body → references/)
- **Quality checklist** — Best practice da tutte le skill esistenti
- **Budget** — SKILL.md body < 3000 parole

**Attivazione:** create skill, new skill, improve skill, audit skills, skill quality, fix skill, trim skill

---

## Glossario del Framework

Terminologia condivisa tra le skill. Il file `glossary.md` nel progetto utente è per termini specifici del progetto.

### Prodotti / Output

| Termine | Definizione |
|---------|------------|
| **website** | Sito internet completo generato da seurat (HTML + CSS + assets). Il prodotto finale per il web. |
| **webvideo** | Pagina .html generata da orson, destinata a diventare video. Non è un sito — è un file self-contained con scene animate, che il capture engine trasforma in .mp4. |

### Design System

| Termine | Definizione |
|---------|------------|
| **design system** | L'intera identità visiva di un progetto: `tokens.css` + `style.css`. Entrambi vivono in `.seurat/` o nella cartella assets del website. |
| **tokens** (`tokens.css`) | Variabili CSS primitive: colori, font, spacing, motion, radius, border. I valori grezzi, senza contesto d'uso. |
| **styles** (`style.css`) | Regole CSS che applicano i token ai componenti: nav, hero, cards, buttons, layout grid, responsive. L'identità visiva concreta. |
| **design-system.html** | Preview vivente del design system. Importa tokens.css e mostra tutti gli elementi visivamente. |

### Architettura

| Termine | Definizione |
|---------|------------|
| **archetype** (seurat) | Tipo di pagina web: Entry, Discovery, Detail, Action, Management, System. Ogni archetype ha wireframe e layout predefiniti. |
| **scene-type** (orson) | Tipo di scena nel webvideo: stat-callout, feature-showcase, cta-outro, ecc. Definisce layout, densità, background e animazioni della scena. |

### Modalità

| Termine | Definizione |
|---------|------------|
| **mode** | Direzione creativa che Claude segue nella generazione. Condiviso tra seurat e orson. |
| **safe** | Pulito, corporate, professionale. Basso rischio. |
| **chaos** | Dinamico, sperimentale, scelte random. Alto rischio. |
| **hybrid** | Base safe con un elemento sorpresa per scena/pagina. Rischio medio. |
| **cocomelon** | Hyper-engaging, neuro-ottimizzato. Arco di arousal (arrest→escalate→climax→descend→convert). Solo orson. |

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

# Spec: Framework Enhancement v2

**Data:** 2026-02-10
**Basata su:** `competitive-analysis.md`
**Obiettivo:** Colmare gap, ottimizzare per Opus 4.6, potenziare le skill esistenti

---

## Scope

**IN SCOPE:**
1. Nuova skill Scribe (document creation: xlsx, docx, pptx, pdf)
2. Meta-skill Forge (creazione/manutenzione skill)
3. Pattern scripts/ dove aggiunge valore concreto
4. Ottimizzazioni Opus 4.6 (visual QA, subagent orchestration)
5. Split references/ per Ghostwriter e Heimdall (contenuto verbose → file on-demand)

**DIFFERITO A FASE SUCCESSIVA:**
- **Skill trimming** — Avverra dopo il completamento dell'enhancement, su una nuova spec basata sullo stato post-enhancement delle skill. La spec `skill-trimming-analysis.md` attuale e superata e sara riscritta.

**OUT OF SCOPE:**
- Distribuzione/packaging marketplace
- Audiosculpt (in standby — eventuale merge parziale in Orson sara spec separata)
- Canvas-design, algorithmic-art, slack-gif-creator (tangenziali)

---

## 1. SKILL SCRIBE — Document Creation

### Cosa fa

Skill unificata per creare, leggere, editare documenti Office (xlsx, docx, pptx, pdf). Routing automatico per tipo file.

### Perche una skill e non 4

- Riduce context overhead (1 frontmatter nel system prompt vs 4)
- Condivide infrastruttura scripts/ (LibreOffice, OOXML pack/unpack, validation)
- Si integra naturalmente con Ghostwriter (contenuto) e Seurat (design)
- Il SKILL.md resta contenuto: routing + principi comuni nel body, dettagli per tipo in references/

### Struttura

```
scribe/
├── SKILL.md                    # ~300 righe: routing, principi comuni, link a references
├── references/
│   ├── xlsx.md                 # Pattern Excel: formule, color coding, financial models
│   ├── docx.md                 # Pattern Word: tracked changes, TOC, OOXML editing
│   ├── pptx.md                 # Pattern PowerPoint: design, layout, visual QA
│   └── pdf.md                  # Pattern PDF: extract, merge, forms, reportlab
├── scripts/
│   ├── recalc.py               # Ricalcolo formule Excel via LibreOffice (black-box)
│   ├── office/
│   │   ├── unpack.py           # Estrai OOXML da docx/pptx in cartella editabile
│   │   ├── pack.py             # Rimpacchetta OOXML in docx/pptx con validazione
│   │   ├── validate.py         # Valida schema OOXML, auto-repair comuni
│   │   └── soffice.py          # Wrapper LibreOffice headless
│   └── thumbnail.py            # Preview slide PPTX come immagine
└── templates/
    └── financial-model.md      # Template struttura modello finanziario
```

### SKILL.md body — struttura

```markdown
---
name: scribe
description: "Crea, legge, edita documenti Office e PDF. Use when user wants to:
create/edit .xlsx spreadsheets (formulas, financial models, data analysis);
create/edit .docx Word documents (tracked changes, TOC, formatting);
create/edit .pptx presentations (slide design, visual quality);
create/read/merge .pdf files (extract, forms, OCR, watermarks).
Triggers on file extensions, 'spreadsheet', 'Excel', 'Word', 'PowerPoint',
'presentation', 'PDF', 'document'. NOT for Google Sheets/Docs/Slides API."
---

# Scribe — Document Creation

## Routing
- `.xlsx/.csv/.tsv` → Read references/xlsx.md
- `.docx` → Read references/docx.md
- `.pptx` → Read references/pptx.md
- `.pdf` → Read references/pdf.md

## Principi comuni a tutti i formati
[Zero errori, preserve templates, professional output]

## Script black-box disponibili
[Lista con --help di ogni script]

## Orchestrazione
- Per contenuto testuale → delega a Ghostwriter
- Per design presentazioni → consulta Seurat design system se disponibile
```

### Fonte dei contenuti

| Formato | Fonte migliore | Motivazione |
|---------|---------------|-------------|
| xlsx | Official (skills-main) | Script recalc.py piu completo, LibreOffice integration |
| docx | Official (skills-main) | 481 righe, tracked changes, comments, redlining avanzato |
| pptx | **Community** (skills/pptx-official) | 483 righe, design guidance eccezionale, color palettes, QA |
| pdf | Official (skills-main) | Script piu completi, edge case handling |

**Nota:** I contenuti vanno adattati al nostro framework, non copiati. Riscrivere in stile conciso, rimuovere ridondanze, aggiungere integrazione con le nostre skill.

### Dipendenze runtime

| Tool | Scopo | Installazione |
|------|-------|---------------|
| openpyxl | Read/write Excel con formule | `pip install openpyxl` |
| pandas | Data analysis | `pip install pandas` |
| python-docx / docx-js | Creazione Word | pip / npm |
| pptxgenjs | Creazione PowerPoint | npm |
| reportlab | Creazione PDF | `pip install reportlab` |
| pypdf / qpdf | Merge/split PDF | pip / system |
| LibreOffice | Recalc formule, conversioni | system package |

---

## 2. SKILL TRIMMING — Differito

**Stato:** Differito a fase post-enhancement.

Il trimming delle skill (riduzione SKILL.md + creazione KNOWLEDGE.md) avverra **dopo** il completamento di questa spec. Motivazione: il trimming deve lavorare sullo stato finale delle skill, che include le nuove references/, le sezioni Visual QA, e la subagent orchestration aggiunte in questa fase.

La spec `skill-trimming-analysis.md` attuale sara riscritta da zero analizzando lo stato post-enhancement.

---

## 3. META-SKILL FORGE

### Cosa fa concretamente

Forge guida la **creazione, manutenzione e miglioramento** delle skill del framework. Si attiva quando:
- L'utente chiede di creare una nuova skill
- L'utente vuole migliorare una skill esistente
- Serve un audit della qualita delle skill
- Bisogna applicare best practice (progressive disclosure, frontmatter, ecc.)

### Quando si usa — esempi concreti

| L'utente dice... | Forge fa... |
|-------------------|-------------|
| "Voglio una skill per gestire le email" | Analizza use case → genera scaffold → scrive SKILL.md + struttura |
| "Ghostwriter non triggera abbastanza" | Analizza description → suggerisce trigger phrases → aggiorna frontmatter |
| "Le skill sono diventate troppo grandi" | Audit dimensioni → identifica cosa spostare in references/ → esegue split |
| "Aggiungi uno script a Emmet per validare" | Genera script con --help → lo integra nel SKILL.md → testa |
| "Fai un checkup di tutte le skill" | Verifica frontmatter, dimensioni, struttura, progressive disclosure per ogni skill |

### Struttura

```
forge/
├── SKILL.md                    # ~200 righe: comandi, workflow, principi
├── references/
│   ├── skill-anatomy.md        # Anatomia di una skill: frontmatter, body, resources
│   ├── progressive-disclosure.md  # 3 livelli, budget, best practice
│   └── quality-checklist.md    # Checklist qualita skill (da Anthropic guide)
├── scripts/
│   └── audit-skills.sh         # Conta righe, word count, verifica struttura per ogni skill
└── templates/
    ├── skill-template.md       # Template SKILL.md con frontmatter e sezioni
    └── reference-template.md   # Template per file reference/
```

### Comandi

| Comando | Cosa fa |
|---------|---------|
| `/forge create [nome]` | Scaffold nuova skill: crea cartella, SKILL.md da template, struttura directory |
| `/forge audit` | Audit tutte le skill: dimensioni, frontmatter quality, progressive disclosure compliance |
| `/forge improve [skill]` | Analizza una skill specifica, suggerisce miglioramenti concreti |
| `/forge split [skill]` | Identifica contenuto da spostare da SKILL.md a references/, esegue lo split |

### Come si integra nel framework

- Dopo `/forge create`, registra la nuova skill nel registry
- `/forge audit` usa i criteri della Anthropic guide (description include WHAT+WHEN, <5000 parole, no XML tags, ecc.)
- `/forge improve` legge il SKILL.md, confronta con best practice, produce diff concreti
- Il suo `scripts/audit-skills.sh` conta righe e parole per ogni skill, verifica struttura directory

---

## 4. PATTERN SCRIPTS/ — Dove e Come

### Il principio

Uno script black-box e codice che Claude **esegue senza leggere il sorgente**. Serve quando:
- Un'operazione e deterministica e ripetitiva (ricalcolo formule, validazione schema)
- Il codice sarebbe riscritto identico ogni volta
- L'output deve essere parsabile (JSON, exit code)
- L'operazione richiede tool esterni (LibreOffice, FFmpeg, Playwright)

### NON serve uno script quando

- L'operazione varia ogni volta (analisi, generazione creativa)
- Claude puo farlo inline in 5-10 righe
- Non c'e un tool esterno coinvolto

### Dove aggiungere scripts/

| Skill | Script | Cosa fa | Perche serve |
|-------|--------|---------|--------------|
| **Scribe** | `recalc.py` | Ricalcola formule Excel via LibreOffice, ritorna JSON errori | Deterministico, richiede LibreOffice, riscritto identico ogni volta |
| **Scribe** | `office/unpack.py` | Estrae OOXML in cartella editabile | Deterministico, zip manipulation |
| **Scribe** | `office/pack.py` | Rimpacchetta con validazione | Deterministico, validazione schema |
| **Scribe** | `office/validate.py` | Valida OOXML, auto-repair | Deterministico, schema check |
| **Scribe** | `thumbnail.py` | Genera preview slide come immagine | Richiede LibreOffice headless |
| **Emmet** | `with-server.sh` | Avvia server, esegui test, chiudi server | Lifecycle management ripetitivo, ispirato da competitor |
| **Forge** | `audit-skills.sh` | Conta righe/parole, verifica struttura | Audit deterministico |

### Dove NON aggiungere scripts/

| Skill | Perche no |
|-------|-----------|
| **Seurat** | Generazione design e creativa, varia ogni volta. Non c'e operazione deterministica ripetitiva. |
| **Ghostwriter** | Contenuto e creativo. Le 46 regole sono checklist mentali, non validazione automatizzabile (richiedono giudizio). |
| **Baptist** | Analisi CRO richiede giudizio. ICE scoring e soggettivo. |
| **Orson** | Ha gia engine/ TypeScript che fa da "script". Non serve aggiungere altro. |

### Convenzione per tutti gli script

```bash
# Ogni script DEVE supportare --help
python scripts/recalc.py --help
# Output: usage, parametri, formato output

# Output DEVE essere parsabile (JSON preferito)
python scripts/recalc.py output.xlsx
# Output: {"status": "success", "total_errors": 0, "total_formulas": 42}

# Exit code DEVE essere significativo
# 0 = successo, 1 = errore utente, 2 = errore sistema
```

---

## 5. OTTIMIZZAZIONI OPUS 4.6

### 5.1 Audit verbosita

Differito alla fase di **skill trimming** post-enhancement (sezione 2).

### 5.2 Visual QA

Opus 4.6 puo leggere screenshot. Aggiungiamo istruzioni esplicite in:

**Seurat — dopo generazione UI:**
```markdown
## Verifica visiva
Dopo aver generato il design:
1. Apri il file HTML nel browser
2. Cattura screenshot con Playwright o BrowserMCP
3. Leggi lo screenshot e verifica:
   - Allineamento elementi
   - Leggibilita testo (contrasto)
   - Coerenza con design tokens
   - Responsive a viewport diversi
```

**Orson — dopo generazione storyboard HTML:**
```markdown
## Preview frame
Prima del render completo:
1. Apri l'HTML config nel browser
2. Screenshot del frame iniziale
3. Verifica: layout, typography, colori, animazione key elements
```

**Emmet — visual regression:**
```markdown
## Visual testing
Per UI testing:
1. Screenshot pagina prima delle modifiche
2. Applica modifiche
3. Screenshot pagina dopo
4. Confronta visivamente: layout shift, elementi mancanti, styling rotto
```

### 5.3 Subagent orchestration esplicita

Aggiungere sezioni nei SKILL.md di Baptist e Emmet per sfruttare Task tool:

**Baptist:**
```markdown
## Orchestrazione multi-skill
Quando l'audit identifica problemi sia di copy che di UI:
1. Lancia Ghostwriter come subagent per riscrittura copy
2. Lancia Seurat come subagent per redesign UI
3. Attendi risultati
4. Integra nel test plan A/B
```

**Emmet:**
```markdown
## Security pre-check
Prima di test funzionali su codice nuovo:
1. Lancia Heimdall scan sui file modificati come subagent
2. Se trovate vulnerabilita critiche, riporta prima di procedere con i test
3. Se pulito, procedi con test suite
```

---

## 6. FILE DA TOCCARE — Riepilogo

### Nuovi file da creare

| File | Tipo |
|------|------|
| `.claude/skills/scribe/SKILL.md` | Nuova skill |
| `.claude/skills/scribe/references/xlsx.md` | Reference |
| `.claude/skills/scribe/references/docx.md` | Reference |
| `.claude/skills/scribe/references/pptx.md` | Reference |
| `.claude/skills/scribe/references/pdf.md` | Reference |
| `.claude/skills/scribe/scripts/recalc.py` | Script |
| `.claude/skills/scribe/scripts/office/unpack.py` | Script |
| `.claude/skills/scribe/scripts/office/pack.py` | Script |
| `.claude/skills/scribe/scripts/office/validate.py` | Script |
| `.claude/skills/scribe/scripts/office/soffice.py` | Script |
| `.claude/skills/scribe/scripts/thumbnail.py` | Script |
| `.claude/skills/forge/SKILL.md` | Nuova skill |
| `.claude/skills/forge/references/skill-anatomy.md` | Reference |
| `.claude/skills/forge/references/progressive-disclosure.md` | Reference |
| `.claude/skills/forge/references/quality-checklist.md` | Reference |
| `.claude/skills/forge/scripts/audit-skills.sh` | Script |
| `.claude/skills/forge/templates/skill-template.md` | Template |
| `.claude/skills/emmet/scripts/with-server.sh` | Script |

### File esistenti da modificare

| File | Azione |
|------|--------|
| `.claude/skills/ghostwriter/SKILL.md` | Spostare contenuto verbose in references/, aggiungere routing on-demand |
| `.claude/skills/ghostwriter/references/seo-rules.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/ghostwriter/references/geo-rules.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/ghostwriter/references/copywriting.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/ghostwriter/references/schema-patterns.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/heimdall/SKILL.md` | Spostare contenuto verbose in references/, aggiungere routing on-demand |
| `.claude/skills/heimdall/references/credential-guide.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/heimdall/references/baas-config.md` | Creare da contenuto estratto dal SKILL.md |
| `.claude/skills/seurat/SKILL.md` | Aggiungere sezione Visual QA (~10 righe) |
| `.claude/skills/orson/SKILL.md` | Aggiungere sezione Preview frame (~10 righe) |
| `.claude/skills/emmet/SKILL.md` | Aggiungere visual regression + security pre-check (~15 righe) |
| `.claude/skills/baptist/SKILL.md` | Aggiungere orchestrazione multi-skill (~10 righe) |
| `.claude/docs/registry.md` | Aggiungere Scribe e Forge |

---

## 7. ORDINE DI ESECUZIONE

### Fase 1: Scribe (prima sessione)

1. **Creare Scribe** — SKILL.md + references/ + scripts/
2. **Testare** con use case: crea un Excel, edita un Word, genera una presentazione, leggi un PDF
3. **Aggiornare registry**

### Fase 2: Forge + Polish (seconda sessione)

4. **Creare Forge** — SKILL.md + references/ + scripts/ + templates/
5. **Usare Forge** per audit tutte le skill (dogfooding)
6. **Split Ghostwriter** — Spostare contenuto verbose in references/, aggiornare routing
7. **Split Heimdall** — Spostare contenuto verbose in references/, aggiornare routing
8. **Aggiungere Visual QA** a Seurat, Orson, Emmet (~10 righe ciascuno)
9. **Aggiungere subagent orchestration** a Baptist, Emmet (~10 righe ciascuno)
10. **Creare with-server.sh** per Emmet
11. **Aggiornare registry** finale

### Fase 3: Trimming (sessione separata, post-enhancement)

Riscrivere `skill-trimming-analysis.md` da zero analizzando lo stato post-enhancement di tutte le skill. Poi eseguire il trimming (SKILL.md snelli + KNOWLEDGE.md per skill).

---

## 8. COME VERIFICO CHE FUNZIONA

| Enhancement | Test di verifica |
|-------------|-----------------|
| Scribe | "Crea un Excel con financial model" → .xlsx con formule funzionanti e zero errori |
| Scribe | "Edita questo Word e aggiungi tracked changes" → .docx editato correttamente |
| Forge | `/forge audit` → produce report dimensioni e qualita per ogni skill |
| Forge | `/forge create test-skill` → genera scaffold funzionante |
| Split Ghostwriter | references/ creati, SKILL.md ha routing on-demand, comportamento invariato |
| Split Heimdall | references/ creati, SKILL.md ha routing on-demand, comportamento invariato |
| Visual QA Seurat | Dopo build, screenshot catturato e analizzato |
| Subagent Baptist | Audit CRO che lancia Ghostwriter per copy fix |

# Migration: Skill Rename & Consolidation

**Date:** 2026-02-05
**Type:** Refactoring
**Scope:** 49 files, 359 reference occurrences

---

## Obiettivo

Razionalizzare i nomi delle skill:
1. Rimuovere tutti i trattini "-" dai nomi
2. Consolidare skill correlate sotto "emmet"
3. Rinominare skill con nomi più evocativi

---

## Mapping Trasformazioni

| Vecchio Nome | Nuovo Nome | Azione |
|--------------|------------|--------|
| `dev-patterns` | — | **Eliminato** (ridondante, Claude sa già i principi). Solo `/adapt-framework` sopravvive. |
| `techdebt` | `emmet/techdebt` | Diventa sotto-comando di emmet |
| *(nuovo)* | `emmet` | Nuova skill: testing + debug + techdebt + checklist + adapt-framework |
| `security-guardian` | `heimdall` | Rename diretto |
| `video-craft` | `orson` | Rename diretto |
| `seo-geo-copy` | `ghostwriter` | Rename diretto |
| `ui-craft` | `seurat` | Rename diretto |

**Note:**
- `audiosculpt` non ha trattini, rimane invariato
- `/adapt-framework` resta comando top-level, genera pattern in `emmet/stacks/`
- `dev-patterns/core/*.md` eliminato (ridondante)

---

## Struttura Nuova Skill "emmet"

### Filosofia

Emmet è una skill di **testing e debug completa** con ciclo:

```
ANALISI → PIANIFICAZIONE → ESECUZIONE → REPORT
```

1. **Analisi**: Legge codice + spec/PDR/requisiti in `.claude/docs/specs/`
2. **Pianificazione**: Genera piano di test in `.md`
3. **Esecuzione**:
   - Test statici (analisi codice senza eseguire)
   - Test dinamici (Playwright simula utente)
4. **Report**: Bug trovati, risultato atteso vs ottenuto, severità

### Due Tipi di Test

| Tipo | Cosa trova | Come |
|------|------------|------|
| **Statico** | Bug nel codice (logica, pattern, edge case, type error) | Analisi codice senza esecuzione |
| **Dinamico** | Bug comportamentali (UI/UX, flussi, interazioni) | Playwright simula utente che clicca e usa l'app |

### Directory Structure

```
.claude/skills/emmet/
├── SKILL.md              # Entry point + orchestratore
├── testing/
│   ├── static.md         # Regole per test statici (analisi codice)
│   ├── dynamic.md        # Regole per test Playwright
│   ├── plan-template.md  # Template piano di test
│   └── report-template.md # Template report bug
├── checklists/           # Template checklist operative
│   ├── code-review.md
│   ├── pre-deploy.md
│   ├── refactoring.md
│   └── security.md
└── stacks/               # Pattern stack-specific (generati da /adapt-framework)
    └── [stack-name]/     # Es. typescript-nextjs-supabase/
        ├── patterns.md
        ├── commands.md
        └── gotchas.md
```

**Eliminato:**
- `core/*.md` — Principi generici (SOLID, API design, ecc.) → ridondanti, Claude li sa già
- `commands/devpatterns.md` — Sostituito da `/adapt-framework` diretto
- `commands/techdebt.md` — Integrato come `/emmet techdebt`
- `templates/stack-template.md` — Non necessario

### Comandi emmet

| Comando | Cosa fa |
|---------|---------|
| `/emmet plan [scope]` | Analizza codice+spec, genera piano di test (.md) |
| `/emmet test` | Esegue test statici sul codice |
| `/emmet journey [flow]` | Esegue test dinamici con Playwright (user journey) |
| `/emmet report` | Genera report bug da ultimo test |
| `/emmet techdebt [path]` | Audit tech debt (duplicazioni, export orfani, ecc.) |
| `/emmet checklist [type]` | Carica checklist (code-review, pre-deploy, refactoring, security) |
| `/adapt-framework` | Analizza stack, genera pattern contestuali in `stacks/` |

---

## File da Modificare

### Fase 1: Rename/Create Directory (6 operazioni)

| Operazione | Da | A |
|------------|-----|-----|
| 1.1 | `.claude/skills/security-guardian/` | `.claude/skills/heimdall/` |
| 1.2 | `.claude/skills/video-craft/` | `.claude/skills/orson/` |
| 1.3 | `.claude/skills/seo-geo-copy/` | `.claude/skills/ghostwriter/` |
| 1.4 | `.claude/skills/ui-craft/` | `.claude/skills/seurat/` |
| 1.5 | Crea `.claude/skills/emmet/` (nuova skill) |
| 1.6 | Copia `dev-patterns/checklists/` → `emmet/checklists/` |

**Da eliminare dopo copia:**
- `.claude/skills/dev-patterns/` (intero, core/*.md ridondante)
- `.claude/skills/techdebt/` (funzionalità assorbita in emmet)

### Fase 2: Aggiorna SKILL.md di ogni skill (6 file)

| File | Modifiche |
|------|-----------|
| `.claude/skills/heimdall/SKILL.md` | name: heimdall, aggiorna descrizioni |
| `.claude/skills/orson/SKILL.md` | name: orson, aggiorna reference interne |
| `.claude/skills/ghostwriter/SKILL.md` | name: ghostwriter, aggiorna reference |
| `.claude/skills/seurat/SKILL.md` | name: seurat, aggiorna reference |
| `.claude/skills/emmet/SKILL.md` | Nuovo: crea orchestratore con sotto-comandi |
| Elimina | `.claude/skills/dev-patterns/SKILL.md`, `.claude/skills/techdebt/SKILL.md` |

### Fase 3: Aggiorna Reference Interne (per skill)

#### heimdall (ex security-guardian) - 7 file interni
| File | Istanze | Pattern |
|------|---------|---------|
| `hooks/post-tool-scanner.py` | 3 | security-guardian → heimdall |
| `hooks/pre-tool-validator.py` | 2 | security-guardian → heimdall |
| `scripts/scanner.py` | 2 | security-guardian → heimdall |
| `scripts/iteration-tracker.py` | 1 | security-guardian → heimdall |
| `test/README.md` | 1 | security-guardian → heimdall |
| `test/vulnerable-samples/*.js/py` | 3 | security-guardian → heimdall |
| `reference/*.md` | check | security-guardian → heimdall |

#### orson (ex video-craft) - 14 file interni
| File | Istanze | Pattern |
|------|---------|---------|
| `SKILL.md` | 48 | video-craft → orson, ui-craft → seurat, seo-geo-copy → ghostwriter |
| `engine/src/*.ts` | 16 | video-craft → orson, ui-craft → seurat |
| `engine/package.json` | 1 | video-craft → orson |
| `engine/composition-patterns.md` | 2 | video-craft → orson |

#### ghostwriter (ex seo-geo-copy) - 5 file interni
| File | Istanze |
|------|---------|
| `SKILL.md` | 15 |
| `copywriting/headlines.md` | 1 |
| `workflows/interactive.md` | 4 |

#### seurat (ex ui-craft) - 11 file interni
| File | Istanze |
|------|---------|
| `SKILL.md` | 44 |
| `generation/modes.md` | 2 |
| `references.md` | 10 |
| `templates/*.md` | 29 |
| `validation.md` | 4 |
| `wireframes/README.md` | 4 |

### Fase 4: Aggiorna File di Documentazione Globale (5 file)

| File | Istanze | Note |
|------|---------|------|
| `CLAUDE.md` | 2 | /techdebt → /emmet techdebt, /security-guardian → /heimdall |
| `.claude/README.md` | 88 | Tutte le reference, comandi, struttura |
| `.claude/docs/workflows.md` | 9 | security-guardian → heimdall, ui-craft → seurat |
| `.claude/docs/visual-composition-principles.md` | 1 | ui-craft → seurat |
| `.claude/rules/ui-components.md` | 1 | ui-craft → seurat |

### Fase 5: Aggiorna audiosculpt (cross-reference)

| File | Istanze | Pattern |
|------|---------|---------|
| `.claude/skills/audiosculpt/SKILL.md` | 6 | video-craft → orson, ui-craft → seurat |

---

## Piano Esecuzione Step-by-Step

### Step 1: Creare skill emmet (struttura base)
1. Creare directory `.claude/skills/emmet/`
2. Creare sottocartelle: `testing/`, `checklists/`, `stacks/`
3. Creare `emmet/SKILL.md` con orchestratore (plan, test, journey, report, techdebt, checklist, adapt-framework)
4. Creare `emmet/testing/static.md` — regole test statici
5. Creare `emmet/testing/dynamic.md` — regole test Playwright
6. Creare `emmet/testing/plan-template.md` — template piano di test
7. Creare `emmet/testing/report-template.md` — template report bug
8. Copiare `dev-patterns/checklists/` → `emmet/checklists/`

### Step 2: Rename security-guardian → heimdall
1. `mv .claude/skills/security-guardian .claude/skills/heimdall`
2. Aggiornare tutti i file interni (7 file, ~33 istanze)
3. Aggiornare SKILL.md header

### Step 3: Rename video-craft → orson
1. `mv .claude/skills/video-craft .claude/skills/orson`
2. Aggiornare tutti i file interni (14 file, ~70 istanze)
3. Aggiornare SKILL.md header + cross-reference (ui-craft→seurat, seo-geo-copy→ghostwriter)

### Step 4: Rename seo-geo-copy → ghostwriter
1. `mv .claude/skills/seo-geo-copy .claude/skills/ghostwriter`
2. Aggiornare tutti i file interni (5 file, ~21 istanze)
3. Aggiornare SKILL.md header

### Step 5: Rename ui-craft → seurat
1. `mv .claude/skills/ui-craft .claude/skills/seurat`
2. Aggiornare tutti i file interni (11 file, ~93 istanze)
3. Aggiornare SKILL.md header

### Step 6: Cleanup vecchie directory
1. `rm -rf .claude/skills/dev-patterns/`
2. `rm -rf .claude/skills/techdebt/`

### Step 7: Aggiornare documentazione globale
1. `CLAUDE.md` - comandi quick reference
2. `.claude/README.md` - tutta la documentazione skill
3. `.claude/docs/workflows.md` - diagrammi
4. `.claude/docs/visual-composition-principles.md`
5. `.claude/rules/ui-components.md`

### Step 8: Aggiornare cross-reference audiosculpt
1. `.claude/skills/audiosculpt/SKILL.md`

### Step 9: Verifica finale
1. `grep -r "dev-patterns\|security-guardian\|video-craft\|seo-geo-copy\|ui-craft\|techdebt" .claude/` - deve restituire 0 risultati (esclusi node_modules)
2. Verificare che tutte le skill siano raggiungibili

---

## Verifica Completezza

Dopo ogni step, verifico con:
```bash
grep -rn "VECCHIO_NOME" .claude/skills/NUOVA_SKILL/ --include="*.md" --include="*.py" --include="*.ts" --include="*.json"
```

Verifica finale globale:
```bash
grep -rn "dev-patterns\|security-guardian\|video-craft\|seo-geo-copy\|ui-craft" .claude/ --include="*.md" --include="*.py" --include="*.ts" --include="*.json" | grep -v node_modules
```

---

## Rischi e Mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Dimenticare reference | Grep globale prima e dopo ogni step |
| Rompere comandi slash | Test manuale di ogni comando dopo migrazione |
| Reference in node_modules | NON toccare node_modules (sono dipendenze esterne) |
| Inconsistenze cross-skill | Aggiornare cross-reference in un passo dedicato |

---

## Note Implementative

1. **emmet SKILL.md** deve:
   - Definire il ciclo ANALISI → PIANIFICAZIONE → ESECUZIONE → REPORT
   - `/emmet plan` — legge codice + `.claude/docs/specs/`, genera piano test
   - `/emmet test` — esegue test statici (analisi codice)
   - `/emmet journey` — esegue test dinamici con Playwright
   - `/emmet report` — genera report con bug, atteso vs ottenuto
   - `/emmet techdebt` — audit tech debt (ex skill standalone)
   - `/emmet checklist` — carica checklist operative

2. **Integrazione Playwright**:
   - Per test dinamici che richiedono interazione utente
   - Simula click, navigazione, form submission
   - Verifica comportamento UI/UX reale
   - Output: screenshot/video se fallimento + descrizione bug

3. **`/adapt-framework`** (top-level):
   - Analizza stack del progetto (package.json, requirements.txt, ecc.)
   - Genera pattern contestuali in `emmet/stacks/[stack-name]/`
   - Persiste conoscenza contestualizzata per riferimento futuro

4. **Backward compatibility**:
   - `/techdebt` → alias per `/emmet techdebt`
   - `/dev-patterns` → **deprecato** (Claude sa già i principi generici)

5. **Eliminato (ridondante)**:
   - `core/*.md` — SOLID, API design, ecc. già nel training di Claude
   - `/dev-patterns [area]` — non serve, basta chiedere a Claude direttamente

---

## Checklist Progressiva

- [ ] Step 1: Creare emmet (struttura)
- [ ] Step 2: Rename heimdall + update interni
- [ ] Step 3: Rename orson + update interni
- [ ] Step 4: Rename ghostwriter + update interni
- [ ] Step 5: Rename seurat + update interni
- [ ] Step 6: Cleanup vecchie directory
- [ ] Step 7: Update documentazione globale
- [ ] Step 8: Update audiosculpt
- [ ] Step 9: Verifica finale

---

**Attendo "PROCEED" per iniziare l'esecuzione.**

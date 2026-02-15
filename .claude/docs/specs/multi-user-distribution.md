# Feature: Multi-User Distribution

**Status:** APPROVED → IN PROGRESS
**Created:** 2026-02-15
**Approved:** 2026-02-15
**Completed:** -

---

## 1. Overview

**What?** Preparare il framework per la distribuzione: reset dati project-specific, settings template, e un unico script `framework.sh` che gestisce sia install che update.
**Why?** Chi scarica lo zip da GitHub deve trovare un template pulito. Chi ha già una versione precedente deve poter aggiornare senza perdere i propri dati.
**For whom?** Qualsiasi utente Claude Code.
**Success metric:** (1) Repo pulita pronta per il push. (2) `framework.sh /path/to/progetto` funziona sia su progetto vuoto che su progetto con framework precedente.

---

## 2. Due scenari, un solo script

### Scenario A: Nuovo progetto

```
git clone <repo> ~/framework-source
cd ~/framework-source
./framework.sh /path/to/mio-progetto
```

Lo script rileva che il target non ha `.claude/` → modalità install:
- Copia `CLAUDE.md` + `.claude/`
- Crea `settings.local.json` da `settings.template.json`
- Crea directory output (`.emmet/`, `.forge/`, ecc.)
- Aggiorna `.gitignore` del target
- Check `jq`
- Stampa istruzioni post-install

### Scenario B: Aggiornamento progetto esistente

```
cd ~/framework-source
git pull
./framework.sh /path/to/mio-progetto
```

Lo script rileva che il target ha già `.claude/` → modalità update:
- Sovrascrive file framework (skill, workflow, checklist, ecc.)
- Preserva PROTECTED_FILES (registry, decisions, request-log, ecc.)
- Preserva PROTECTED_DIRS (specs, session-notes)
- Backup dei file sovrascritti
- Crea `settings.local.json` da template **solo se non esiste**
- Crea directory output **solo se non esistono**
- Aggiorna `.gitignore` **solo se mancano entry**

---

## 3. Cosa fare

### A. Rinominare `framework-update.sh` → `framework.sh`

Rename semplice + aggiornare tutti i riferimenti (README, CLAUDE.md, commenti interni).

### B. Estendere `framework.sh` con funzionalità install

Aggiungere al flusso esistente (che già gestisce l'update):

1. **Settings template** — Se `settings.local.json` non esiste nel target, crearlo da `settings.template.json`
2. **Directory output** — Creare `.emmet/`, `.forge/`, `.seurat/`, `.orson/`, `.scribe/`, `.ghostwriter/` se non esistono
3. **.gitignore** — Aggiungere al `.gitignore` del target (se non già presenti):
   ```
   .claude/settings.local.json
   .claude/docs/session-notes/*.md
   !.claude/docs/session-notes/.gitkeep
   .emmet/
   .forge/
   .seurat/
   .orson/
   .scribe/
   .ghostwriter/
   .heimdall/state.json
   .heimdall/findings.json
   node_modules/
   __pycache__/
   ```
4. **Check jq** — Warning se `jq` non è installato (necessario per Morpheus)
5. **Istruzioni post-install** — Stampare i prossimi passi (popolare registry, /adapt-framework, ecc.)

### C. Creare `settings.template.json`

Copia di `settings.local.json` senza:
- Path assoluti (`git -C /home/uh1/VIBEPROJECTS/CLAUDE_SKILLS checkout:*` → rimuovere)
- Permessi troppo specifici (`Bash(cat:*)` → rimuovere)
- Permessi ridotti al minimo universale

Mantenere:
- Hook Morpheus (PreToolUse, SessionStart, statusLine) — usano già `$CLAUDE_PROJECT_DIR`
- Permessi base universali (git add/commit/push/status, grep, ls, find, wc, test, du)
- Permessi skill (tutti e 8)

### D. Reset dati project-specific

| File | Azione |
|------|--------|
| `.claude/docs/registry.md` | Reset a template vuoto (solo headers + tabelle vuote) |
| `.claude/docs/request-log.md` | Reset a tabella vuota (mantieni headers e legenda) |
| `.claude/docs/forge-audit.md` | Eliminare |
| `.claude/docs/specs/framework-update-safety.md` | Eliminare |
| `.claude/docs/specs/quality-metrics-integration.md` | Eliminare |
| `.claude/docs/specs/multi-user-distribution.md` | Eliminare (dopo completamento) |

File già puliti (nessuna azione):
- `decisions.md`, `glossary.md`, `bugs/bugs.md`, `session-notes/`

### E. Verifica PROTECTED_FILES

Attuale:
```
.claude/docs/registry.md
.claude/docs/decisions.md
.claude/docs/glossary.md
.claude/docs/request-log.md
.claude/docs/bugs/bugs.md
.claude/settings.local.json
.claude/morpheus/config.json
```

Da aggiungere:
- `.claude/docs/checklist.md` — l'utente potrebbe aggiungere check specifici del progetto

PROTECTED_DIRS (già ok):
```
.claude/docs/session-notes
.claude/docs/specs
```

### F. Aggiornare documentazione

**README.md (root):**
- Sezione unica "Setup" con `framework.sh` (copre install e update)
- Rimuovere "(in Italian)"

**`.claude/README.md`:**
- Sezione "Setup minimo" → documentare `framework.sh`
- Aggiungere sezione "Aggiornamento" con esempio
- Sostituire "copia e incolla" con il flusso via script

---

## 4. File da modificare

| File | Azione | Cambiamento |
|------|--------|-------------|
| `framework-update.sh` | Rename → `framework.sh` | Rename + estendere |
| `framework.sh` | Modify | Aggiungere: settings template, output dirs, .gitignore, jq check, post-install msg |
| `.claude/settings.template.json` | Create | Template settings pulito |
| `.claude/docs/registry.md` | Modify | Reset a template vuoto |
| `.claude/docs/request-log.md` | Modify | Reset tabella a vuoto |
| `.claude/docs/forge-audit.md` | Delete | Output project-specific |
| `.claude/docs/specs/framework-update-safety.md` | Delete | Spec project-specific |
| `.claude/docs/specs/quality-metrics-integration.md` | Delete | Spec project-specific |
| `README.md` (root) | Modify | Setup con framework.sh |
| `.claude/README.md` | Modify | Documentare framework.sh (install + update) |
| `CLAUDE.md` | Modify | Riferimenti a framework-update.sh → framework.sh |

---

## 5. Verifica

- [ ] `registry.md` contiene solo headers e tabelle vuote
- [ ] `request-log.md` ha tabella vuota (nessuna entry)
- [ ] Nessuna spec project-specific in `specs/` (solo `template.md` e `references/`)
- [ ] `forge-audit.md` eliminato
- [ ] `settings.template.json` non contiene path assoluti
- [ ] `framework.sh` funziona su directory vuota (install)
- [ ] `framework.sh` funziona su directory con framework precedente (update)
- [ ] `framework.sh` PROTECTED_FILES include `checklist.md`
- [ ] README.md (root + .claude/) documenta `framework.sh`
- [ ] Nessun riferimento residuo a `framework-update.sh` nel codebase

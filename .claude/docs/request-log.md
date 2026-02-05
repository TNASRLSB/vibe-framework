# Request Log

Registro incrementale di tutte le richieste gestite dal framework.

---

## Tipologie

| Codice | Descrizione |
|--------|-------------|
| `Feature` | Nuova funzionalità |
| `Bug fix` | Correzione bug |
| `Refactoring` | Ristrutturazione codice |
| `Research` | Ricerca/analisi |
| `Config` | Configurazione |
| `Doc` | Documentazione |

## Stati

| Stato | Significato |
|-------|-------------|
| `in sospeso` | Pianificato con documento di progetto, non ancora iniziato |
| `in corso` | Lavoro avviato |
| `completato` | Tutti i task del documento di progetto completati |
| `annullato` | Richiesta annullata dall'utente |

---

## Log

| # | Data | Ora | Tipologia | Descrizione | Doc riferimento | Stato |
|---|------|-----|-----------|-------------|-----------------|-------|
| 1 | 2026-02-05 | 11:35 | Refactoring | Rename e consolidamento skill (rimozione trattini, emmet come orchestratore) | [migration-skill-rename.md](specs/migration-skill-rename.md) | completato |
| 2 | 2026-02-05 | 14:20 | Feature | Heimdall v2: diff-aware analysis, import check, path-context severity, secure alternatives | [heimdall-v2-enhancements.md](specs/heimdall-v2-enhancements.md) | completato |
| 3 | 2026-02-05 | 16:45 | Doc | Allineamento documentazione: fix comando inesistente, SKILL.md vs filesystem, README ristrutturazione | [documentation-alignment.md](specs/documentation-alignment.md) | in sospeso |
| 4 | 2026-02-05 | 18:30 | Research | Audit approfondito skill: analisi file-per-file di tutte le 6 skill | [skill-audit-deep.md](specs/skill-audit-deep.md) | completato |
| 5 | 2026-02-05 | 19:00 | Doc | Framework Alignment Audit: fix 34 incongruenze in skill docs, CLAUDE.md, README.md | [framework-alignment-audit.md](specs/framework-alignment-audit.md) | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

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
| 1 | 2026-02-10 | — | Feature | Emmet skill v2: nuovo `/emmet map`, ridefinizione `/emmet test`, deprecazione plan/journey | `emmet-improvement-plan.md` | completato |
| 2 | 2026-02-10 | — | Feature | Nuova skill Baptist (CRO): orchestratore standalone per Conversion Rate Optimization, coordina Ghostwriter e Seurat | `.claude/docs/specs/baptist.md` | completato |
| 3 | 2026-02-11 | — | Doc | Aggiornamento spec framework-enhancement-v2: trimming differito a post-enhancement, ordine esecuzione corretto | `.claude/docs/specs/framework-enhancement-v2.md` | completato |
| 4 | 2026-02-11 | — | Feature | Framework Enhancement v2 — Fase 1: nuova skill Scribe (document creation xlsx/docx/pptx/pdf), SKILL.md + 4 references + 6 scripts + 1 template | `.claude/docs/specs/framework-enhancement-v2.md` | completato |
| 5 | 2026-02-11 | — | Feature | Framework Enhancement v2 — Fase 2: Forge skill, split Ghostwriter/Heimdall in references, Visual QA (Seurat/Orson/Emmet), subagent orchestration (Baptist/Emmet), with-server.sh | `.claude/docs/specs/framework-enhancement-v2.md` | completato |
| 6 | 2026-02-11 | — | Feature | Forge enhancement: audit semantico con matrice decisionale + nuovo `/forge fix` che sostituisce trim/split/improve. Nuovi file: trimming-methodology.md, knowledge-template.md | `.claude/docs/specs/forge-trimming-enhancement.md` | completato |
| 7 | 2026-02-11 | — | Refactoring | Forge fix: execute audit plan across 6 skills — frontmatter (audiosculpt, orson), split/trim/delete (audiosculpt, baptist, heimdall, ghostwriter, seurat) | `.claude/docs/forge-audit.md` | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

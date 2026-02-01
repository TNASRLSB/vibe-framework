---
name: techdebt
description: Audit codebase for duplicated code, dead exports, unused imports, and patterns that should be extracted into shared utilities. Run at end of session or before PRs.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - TodoWrite
---

# Tech Debt Skill

## Purpose

Audit rapido del codebase per individuare debito tecnico strutturale: duplicazione, codice morto, pattern ripetuti che dovrebbero essere estratti.

## Comando

### `/techdebt [path]`

Esegue audit sul path specificato (default: `src/` o root del progetto).

**Cosa cerca:**

1. **Funzioni duplicate o quasi-duplicate**
   - Funzioni con nome simile in file diversi
   - Blocchi di codice >5 righe ripetuti identici o quasi

2. **Export orfani**
   - Funzioni/costanti esportate ma mai importate altrove

3. **Import non usati**
   - Import dichiarati ma mai referenziati nel file

4. **Pattern ripetuti estraibili**
   - 3+ occorrenze dello stesso pattern (try/catch identici, fetch wrapper, validazioni)
   - Suggerisce estrazione in utility condivisa

5. **File grandi senza motivo**
   - File >300 righe che contengono responsabilità multiple

## Output

Genera report in `.claude/docs/techdebt-report.md` con:

```markdown
# Tech Debt Report — [YYYY-MM-DD]

## Summary
- Duplicazioni trovate: N
- Export orfani: N
- Import inutilizzati: N
- Pattern estraibili: N
- File oversized: N

## Dettagli

### Duplicazioni
| Funzione/Pattern | File A | File B | Azione suggerita |
|-----------------|--------|--------|-----------------|

### Export orfani
| Export | File | Azione suggerita |
|--------|------|-----------------|

### Import inutilizzati
| Import | File:Riga | Azione suggerita |
|--------|-----------|-----------------|

### Pattern estraibili
| Pattern | Occorrenze | File | Utility suggerita |
|---------|-----------|------|-------------------|

### File oversized
| File | Righe | Responsabilità trovate | Split suggerito |
|------|-------|----------------------|----------------|
```

## Procedura

1. **Rileva stack** — Controlla estensioni prevalenti (.ts, .py, .go, etc.) per adattare i pattern di ricerca
2. **Scan duplicazioni** — Cerca nomi di funzioni simili, blocchi ripetuti
3. **Scan export/import** — Per ogni export, verifica che sia importato altrove
4. **Scan pattern** — Cerca try/catch, fetch, validazioni, logging ripetuti
5. **Scan file size** — Identifica file che superano soglia
6. **Genera report** — Scrive `.claude/docs/techdebt-report.md`
7. **Aggiorna registry** — Se trova utility candidates, le segnala

## Quando usarlo

- Fine sessione, prima di commit
- Prima di una PR
- Quando il codebase cresce oltre ~50 file
- Periodicamente come igiene del codice

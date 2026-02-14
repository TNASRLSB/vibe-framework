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
| 1 | 2026-02-12 | — | Feature | Orson v2: 10 interventi — draft mode, JPEG capture, HW encoding, subtitles, typography, batch, assets, parallel render, morph transitions, PiP | `specs/orson-v2-improvements.md` | completato |
| 2 | 2026-02-12 | — | Feature | Sito web Claude Framework + video promozionale (seurat + ghostwriter + orson) | `specs/claude-framework-website.md` | completato |
| 3 | 2026-02-12 | — | Feature | Orson v3 Quality Overhaul: 8 interventi — scroll composition, transizioni reali, TTS narrazione, audio reale, testi adattivi, gap detection, animazioni varie, choreography Disney | `specs/orson-v3-quality-overhaul.md` | completato |
| 4 | 2026-02-13 | 23:00 | Feature | Orson v4: Rewrite frame-addressed — architettura Remotion-like con interpolate(), spring(), setFrame(n), timeline compiler, screenplay-faithful autogen | `specs/orson-v3-frame-addressed.md` | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

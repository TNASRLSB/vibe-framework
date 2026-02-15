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
| 1 | 2026-02-14 | - | Bug fix | Fix audio Orson: volume musica troppo alto, ducking insufficiente, narrazione troppo veloce (400 WPM→150 WPM) | - | completato |
| 2 | 2026-02-14 | - | Feature | Orson v4: preview interattiva, parallel frame render, PNG pipe, gap qualitativo vs Remotion | `specs/orson-v4-remotion-parity.md` | completato |
| 3 | 2026-02-14 | - | Bug fix | Fix issue aperte audit Orson: venv TTS, loudnorm, white-on-white, empty cards, scene duration, fonts, colors, decoratives | `specs/orson-audit-2026-02-14.md` | completato |
| 4 | 2026-02-14 | - | Refactoring | Orson v5: eliminazione autogen layer, Claude scrive HTML direttamente. Runtime animation inline, components library, -13 file engine | `specs/orson-v5-direct-html.md` | completato |
| 5 | 2026-02-14 | - | Feature | Orson v5.1: Aesthetic Intelligence System — 24 visual recipes, color arcs, camera motion, kinetic typography, secondary animation, negative space | `specs/orson-v5.1-aesthetic-system.md` | completato |
| 6 | 2026-02-15 | - | Feature | Orson v5.2: Voice Intelligence + Audio Robustness — voice presets per tutto Orson (create + demo), speech rate basato su ricerca peer-reviewed, fix audio inconsistencies, error recovery/retry | `specs/orson-demo-v2.md` | completato |
| 7 | 2026-02-15 | - | Feature | Seurat: Intent Exploration (Step 0), The Mandate (4 test qualitativi pre-delivery), Surface Elevation Guide | `specs/seurat-intent-mandate-layering.md` | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

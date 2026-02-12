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
| 1 | 2026-02-12 | - | Bug fix | Port BUG-8 (ducking smooth ramps) e BUG-9 (zoom senza reparenting) da test session | `orson-demo-audio-darkmode.md` | completato |
| 2 | 2026-02-12 | - | Bug fix | ElevenLabs preset tuning + voice resolution + speed fallback + voci IT | `specs/elevenlabs-tuning.md` | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

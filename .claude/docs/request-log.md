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
| 1 | 2026-02-19 | - | Feature | Aggiungere sistema di versioning al framework | [framework-versioning.md](specs/framework-versioning.md) | completato |
| 2 | 2026-02-20 | - | Feature | Rename a VIBE Framework + GitHub Releases | - | completato |
| 3 | 2026-02-20 | - | Feature | Release automatiche (GitHub Actions), version check, rename script a vibe-framework.sh | - | completato |
| 4 | 2026-02-23 | - | Feature | Orson animation engine upgrades: spring physics, Perlin noise, SVG path draw, particle system, auto-start, camera shake, seeded random | [orson-remotion-upgrades.md](specs/orson-remotion-upgrades.md) | completato |
| 5 | 2026-02-23 | - | Refactoring | Orson anti-monotonia: fix ridondanze runtime (applyAnim→setProp, dead spring code), ampliare safe emphasis pool, ROLE_MAP v6 hints, espandere esempi v6 in docs, checklist obbligatoria SP/N/D/P, diversity rules aggiornate | - | completato |

---

*Questo file è aggiornato automaticamente da Claude ad ogni richiesta che modifica il codebase.*

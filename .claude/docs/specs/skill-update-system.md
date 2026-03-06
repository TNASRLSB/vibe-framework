# Spec: Self-Contained Skill Installer

## What

Trasformare `vibe-framework.sh` in un installer autosufficiente: l'utente ha SOLO lo script nella root del progetto, lo esegue, e lo script scarica l'ultima release da GitHub e installa/aggiorna tutto.

## Flusso utente

```bash
# L'utente ha solo questo file nel progetto
./vibe-framework.sh

# Oppure: prima installazione in un progetto specifico
./vibe-framework.sh /path/to/progetto
```

**Cosa succede:**
1. Lo script controlla l'ultima release su GitHub (`DKHBSFA/vibe-framework`)
2. Scarica il tarball della release (~2MB senza mp3, vedi asset separation)
3. Estrae in una dir temporanea
4. Esegue la logica di install/update (protegge dati utente, backup, ecc.)
5. Pulisce la dir temporanea
6. Mostra post-install instructions

**Se il framework e' gia' installato e aggiornato:** lo script lo dice e esce.

## Design

### 1. Download da GitHub Release

GitHub genera automaticamente tarball per ogni tag:
```
https://github.com/DKHBSFA/vibe-framework/archive/refs/tags/v0.3.0.tar.gz
```

Flow:
1. `curl` → GitHub API `/releases/latest` → ottieni tag name
2. `curl` → scarica tarball del tag
3. `tar xzf` → estrai in `$TMPDIR/vibe-framework-X.Y.Z/`
4. Usa la dir estratta come SOURCE_DIR (al posto del clone locale)
5. `rm -rf $TMPDIR/...` alla fine

Requisiti: `curl`, `tar` (universali su Linux/macOS).

### 2. Orson Dependencies

Il tarball include tutto, compresi gli mp3 (~44MB totali). Sono necessari a Orson per il background music.

`node_modules` e' gia' in `.gitignore` (non nel tarball). Post-install:
> "Per usare Orson: cd .claude/skills/orson/engine && npm install"

### 4. Logica di Install/Update (preservata)

La logica core rimane identica a quella attuale:
- **Protected files** (registry, decisions, ecc.): preservati se esistono, inizializzati se mancano
- **Protected dirs** (specs, session-notes): preservati
- **Framework files** (skills, workflows, checklist): sovrascritti
- **Backup**: `.framework-backup-[timestamp]/`
- **CLAUDE.md**: chiede se sovrascrivere se differisce

### 5. Version Check

All'avvio:
1. Leggi `.claude/.framework-version` nel progetto target (se esiste)
2. Confronta con la versione della release scaricata
3. Se uguale: "Gia' aggiornato a vX.Y.Z. Reinstallare? [y/N]"
4. Se diversa: procedi normalmente

### 6. Self-Update dello Script

Lo script stesso puo' essere aggiornato:
- Se la versione nel tarball e' piu' recente, lo script si auto-aggiorna (copia se stesso dalla release)
- Questo assicura che l'utente abbia sempre la versione piu' recente dello script

### 7. CLI

```bash
./vibe-framework.sh              # Installa/aggiorna nel dir corrente
./vibe-framework.sh /path/to/dir # Installa/aggiorna nel dir specificato
./vibe-framework.sh --dry-run    # Mostra cosa farebbe
./vibe-framework.sh --version    # Mostra versione installata vs disponibile
./vibe-framework.sh --help       # Help
```

Solo questo. Niente `--skills`, niente selettivo. Aggiorna tutto.

## Files to Touch

| File | Action |
|------|--------|
| `vibe-framework.sh` | **Rewrite** — aggiungere download da GitHub, self-update |
| `.claude/README.md` | **Update** — documentare nuovo flusso |

## Verification

1. Creare dir vuota, copiarci solo `vibe-framework.sh`, eseguire → installa tutto da GitHub
2. Eseguire di nuovo → "gia' aggiornato"
3. `--dry-run` mostra cosa cambierebbe
4. `--version` mostra versione locale vs remota
5. Protected files (registry, decisions) preservati dopo update
6. Audio mp3 inclusi nel tarball (necessari per Orson)
7. Script si auto-aggiorna se la release contiene una versione piu' recente

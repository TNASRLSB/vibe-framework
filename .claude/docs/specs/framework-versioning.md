# Spec: Framework Versioning

## Cosa
Aggiungere un sistema di versioning al framework, cosicché gli utenti che eseguono `framework.sh` su altri progetti possano sapere:
1. Quale versione stanno installando/aggiornando
2. Da quale versione provengono (se update)
3. Se il target è già aggiornato

## Design

### Source of truth: `VERSION`
File nella root del framework con semver: `0.1.0`

Versione iniziale: **0.1.0** (il framework è già funzionante e distribuito, ma non ha mai avuto versioning).

### Marker nel target: `.claude/.framework-version`
Dopo ogni install/update, `framework.sh` scrive la versione installata in `.claude/.framework-version` nel progetto target.

Formato:
```
0.1.0
```

Questo file:
- Va nella lista `PROTECTED_FILES`? **No** — viene sempre sovrascritto dalla versione installata
- Va nel `.gitignore`? **No** — va committato, così tutti i collaboratori vedono la versione

### Modifiche a `framework.sh`

1. **Legge `VERSION`** dal source dir all'avvio
2. **Header:** mostra la versione nell'output
   ```
   Claude Development Framework v0.1.0 — Install
   ```
3. **Su update:** legge `.claude/.framework-version` dal target, mostra:
   ```
   Updating: v0.0.9 → v0.1.0
   ```
   Se non esiste il file version nel target: `Updating: (unknown) → v0.1.0`
4. **Se già aggiornato:** confronta versioni, avvisa:
   ```
   Target is already at v0.1.0. Re-install anyway? [y/N]
   ```
5. **Post-install/update:** scrive `VERSION` content in `$TARGET_DIR/.claude/.framework-version`

### File toccati

| File | Azione |
|------|--------|
| `VERSION` | **Nuovo** — contiene `0.1.0` |
| `framework.sh` | Modificare: leggere version, mostrarla, confrontarla, scriverla |
| `.claude/.framework-version` | **Nuovo** (generato dallo script nel target) |

### Verifica
- `./framework.sh /tmp/test-project` → mostra versione nell'header
- Seconda esecuzione → mostra "already at v0.1.0", chiede conferma
- `cat /tmp/test-project/.claude/.framework-version` → `0.1.0`

---
name: dev-patterns
description: Development patterns and best practices. Agnostic core with dynamic stack-specific pattern generation. Use /adapt-framework to configure for your project.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
---

# Dev Patterns Skill

## Purpose

Framework di sviluppo agnostico con adattamento dinamico allo stack tecnologico.

**Architettura:**
- **Core (Livello 1)**: Principi universali, sempre disponibili
- **Stack-specific (Livello 2)**: Pattern generati per il tuo stack

## Comandi Principali

### `/adapt-framework`

Analizza il progetto e configura il framework per lo stack rilevato.

**Quando usarlo:**
- Prima sessione su un progetto esistente
- Dopo cambio significativo dello stack
- Per rigenerare pattern aggiornati

**Output:**
- Crea/aggiorna `.claude/skills/dev-patterns/stacks/[stack-name]/`
- Aggiorna `.claude/project-config.json` con stack rilevato
- Report di configurazione

### `/dev-patterns [area]`

Consulta pattern. Aree: `principles`, `api`, `testing`, `security`, `caching`, `error-handling`, `stack`.

**Esempi:**
```
/dev-patterns principles     -> Core SOLID, DRY, etc.
/dev-patterns api            -> REST/GraphQL design
/dev-patterns testing        -> TDD, coverage
/dev-patterns security       -> Checklist sicurezza
/dev-patterns caching        -> Strategie di caching
/dev-patterns error-handling -> Gestione errori
/dev-patterns stack          -> Pattern specifici del tuo stack
```

### `/dev-patterns review`

Applica code review checklist al `git diff HEAD`.

### `/dev-patterns checklist [type]`

Carica checklist. Types: `pre-deploy`, `refactoring`, `code-review`, `security`.

---

## Stack Detection Logic

Il comando `/adapt-framework` rileva lo stack analizzando:

### File di Configurazione
| File | Stack Indicato |
|------|----------------|
| `package.json` | Node.js ecosystem |
| `requirements.txt` / `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` / `build.gradle` | Java/Kotlin |
| `Gemfile` | Ruby |
| `composer.json` | PHP |
| `*.csproj` | .NET/C# |

### Dependencies Analysis (Node.js)
| Dependency | Sub-stack |
|------------|-----------|
| `react` | React |
| `next` | Next.js |
| `vue` | Vue.js |
| `express` | Express.js |
| `fastify` | Fastify |
| `@supabase/supabase-js` | Supabase |
| `firebase` | Firebase |

### Dependencies Analysis (Python)
| Dependency | Sub-stack |
|------------|-----------|
| `django` | Django |
| `fastapi` | FastAPI |
| `flask` | Flask |
| `sqlalchemy` | SQLAlchemy ORM |

---

## Generazione Pattern Stack-Specific

Quando `/adapt-framework` rileva uno stack, genera:

### `stacks/[stack-name]/patterns.md`
Pattern e idiomi specifici del linguaggio/framework.

### `stacks/[stack-name]/commands.md`
Comandi CLI specifici:
```
# Node.js
npm install, npm test, npm run build

# Python
pip install, pytest, python -m build

# Rust
cargo build, cargo test, cargo clippy

# Go
go build, go test, go vet
```

### `stacks/[stack-name]/gotchas.md`
Errori comuni e soluzioni per quello stack.

---

## Workflow: Nuovo Progetto

Quando Claude sceglie uno stack per un nuovo progetto:

1. Claude dichiara lo stack scelto
2. Claude crea la struttura del progetto
3. Claude esegue internamente la logica di `/adapt-framework`
4. Pattern stack-specific disponibili immediatamente

**Nota:** Questo avviene automaticamente, non richiede comando esplicito.

---

## Workflow: Progetto Esistente

```
User: /adapt-framework

Claude:
1. Analizza file di configurazione
2. Identifica stack principale
3. Analizza struttura e convenzioni
4. Genera pattern stack-specific
5. Aggiorna project-config.json

Output:
"Framework adattato per TypeScript + React + Next.js + Supabase.
Pattern disponibili in .claude/skills/dev-patterns/stacks/typescript-react-nextjs/"
```

---

## File di Configurazione Progetto

### `.claude/project-config.json`

```json
{
  "stack": {
    "language": "typescript",
    "framework": "nextjs",
    "ui": "react",
    "database": "supabase",
    "testing": "vitest",
    "detected": "2026-01-19",
    "version": "1.0"
  },
  "patterns": {
    "generated": "2026-01-19",
    "path": ".claude/skills/dev-patterns/stacks/typescript-react-nextjs/"
  }
}
```

---

## Integrazione con Altre Skill

| Skill | Integrazione |
|-------|--------------|
| security-guardian | Usa security.md core + pattern stack-specific |
| ui-craft | Usa pattern frontend se React/Vue/etc |

---

## Limitazioni Note

1. **Pattern generati "good enough"**: Meno curati di quelli scritti a mano
2. **Cutoff di conoscenza**: Pattern potrebbero non coprire ultime versioni
3. **Stack non comuni**: Potrebbero avere meno dettaglio
4. **Manutenzione**: Pattern generati non si auto-aggiornano

**Mitigazione:** L'utente puo sempre editare/sostituire i pattern generati.

---

## Implementazione /adapt-framework

Quando invocato, eseguo questa logica:

```
1. DETECT STACK
   |-- Read package.json -> extract dependencies
   |-- Read requirements.txt / pyproject.toml
   |-- Read Cargo.toml
   |-- Read go.mod
   |-- Determine primary stack

2. ANALYZE PROJECT STRUCTURE
   |-- Find src/, lib/, app/ directories
   |-- Identify testing framework
   |-- Identify build system
   |-- Note conventions (naming, organization)

3. GENERATE STACK-SPECIFIC PATTERNS
   |-- Create stacks/[stack-name]/ directory
   |-- Generate patterns.md with idioms
   |-- Generate commands.md with CLI
   |-- Generate gotchas.md with common errors

4. UPDATE CONFIGURATION
   |-- Create/update .claude/project-config.json
   |-- Update registry.md

5. REPORT
   |-- Output summary to user
```

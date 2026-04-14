# VIBE Framework — repository layout

This repository contains the VIBE plugin source plus development infrastructure (tests, research, design docs). Only the `plugin/` directory is distributed to end users.

## Top-level structure

```
.
├── .claude-plugin/marketplace.json   Marketplace manifest (points to ./plugin)
├── plugin/                           The VIBE plugin (distributed)
├── tests/                            Test infrastructure (dev only)
├── docs/                             Design specs and implementation plans (dev only)
├── research/                         Paper, experiments, datasets (dev only)
└── vendor/                           Third-party reference dumps (dev only)
```

Everything outside `plugin/` is gitignored and never reaches end users. The plugin loader uses `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_SKILL_DIR}` env vars, which Claude Code resolves at runtime to absolute paths inside `plugin/`.

## What's in each top-level directory

### `plugin/` — the distributed product

```
plugin/
├── .claude-plugin/plugin.json    Plugin manifest (name, version, metadata)
├── agents/                       9 active subagents + 1 deprecated
├── hooks/hooks.json              Hook registrations (SessionStart, PreToolUse, etc.)
├── scripts/                      Hook handlers and standalone scripts
├── skills/                       14 skills + _shared/ resources
├── CHANGELOG.md                  Plugin release history
├── README.md                     User-facing readme (what the plugin does)
├── LICENSE                       MIT
└── settings.json                 Plugin-level settings
```

Edit anything inside `plugin/` and the local marketplace install picks it up on the next Claude Code session restart.

### `tests/` — dev-only test infrastructure

```
tests/
├── run-tests.sh                  Plugin self-test harness
├── model-validation/             A/B model comparison tests (existing)
│   ├── PROTOCOL.md
│   ├── test-cases.md
│   ├── result-template.md
│   ├── model-map.md
│   ├── fixtures/
│   └── results/
└── component-validation/         VIBE-vs-baseline component tests
    └── PROTOCOL.md
```

Two distinct testing concerns coexist:

- **`model-validation/`**: which model (Opus/Sonnet/Haiku) is best for each skill?
- **`component-validation/`**: does each VIBE component improve Claude Code over a bare session, or is it inert/harmful?

Both are dev-only. They run from a shell, not via the plugin loader.

### `docs/` — design specs and implementation plans

```
docs/
├── specs/   Design documents, architecture decisions
└── plans/   Implementation plans for major features
```

Historical docs created during VIBE development. Not distributed, kept in repo for context.

### `research/` — papers, experiments, datasets

```
research/
├── paper/         False-completion paper (LaTeX + sections)
├── experiment/    20-task experimental harness, codebases, results, scripts
└── notes/         Pre-paper research notes
```

All gitignored. Contains the empirical work on false completion that led to the design of the atomic decomposition system, plus all rerun datasets.

### `vendor/` — third-party reference material

```
vendor/
└── claude-code-source/   Claude Code TypeScript source snapshot (~1900 files, 35 MB)
```

Reference dumps used during plugin design (e.g., reading Claude Code's marketplace handling code while designing VIBE features that integrate with it). Not distributed.

## Branch strategy

- **`main`** — stable releases. Tagged versions ship from here.
- **`dev`** — work in progress. Merged into `main` when promotable.

## Local development

To work on the plugin with the local marketplace:

```bash
# One-time setup: register this directory as a marketplace
claude plugin marketplace add /path/to/this/repo
claude plugin install vibe@vibe-framework
```

After any change inside `plugin/`, restart Claude Code to reload the plugin.

To run the plugin self-tests:

```bash
bash tests/run-tests.sh
```

## Releases

`.github/workflows/release.yml` reads `plugin/.claude-plugin/plugin.json` for the version and creates GitHub releases on push to `main`. Conventional commit prefixes (`feat:`, `fix:`, `BREAKING CHANGE:`) determine the bump type.

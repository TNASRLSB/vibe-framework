# VIBE Framework

Quality-first plugin for Claude Code. Specialized skills, mechanical quality gates, and intelligent per-skill model selection. **v5.7.0**.

## Install

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

`/vibe:setup` configures your environment in one pass: detects your stack, recommends LSP plugins, sets `model = opus` and `effort = max`, configures a status line, optionally maps your codebase, and offers opt-in pragmatic priming. Re-runnable; converges to current plugin version's expected state on every run.

## Documentation

The full long-form documentation lives at the **top-level repository README**:

> **https://github.com/TNASRLSB/vibe-framework#readme**

It covers core principles, every skill, every agent, every hook (22 handlers across 9 lifecycle events as of 5.7.0), model tiering with empirical A/B citations, the 8-persona Playwright matrix, migration from v1, requirements, repository layout, and the release flow.

This file (`plugin/README.md`) historically duplicated that content and drifted across releases (`README.md` was at v5.6.1 while `plugin/README.md` documented earlier 5.6.0 details). 5.7.0 collapses to a single source of truth: the top-level README. This file is now a pointer.

## Release notes

The `CHANGELOG.md` next to this file lists every release with full rationale and file-level changes:

> **[plugin/CHANGELOG.md](CHANGELOG.md)**

## License

MIT

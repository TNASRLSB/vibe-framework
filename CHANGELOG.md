# Changelog

## 2.0.0 — 2026-03-26

Complete rewrite as Claude Code plugin.

### Added
- Plugin architecture (installable via /plugin install)
- 12 skills: 8 domain + setup + reflect + pause + resume
- 3 agents: reviewer (post-implementation review), researcher (codebase exploration), guardian (security audit)
- 6 hook handlers: quality gates, self-learning, failure detection
- Multilingual correction capture (6 languages)
- Systematic debugging workflow in Emmet
- Per-persona visual testing with 8 default personas and Playwright headed mode
- Post-compaction state recovery
- Security quickscan on every file edit
- Failure loop detection (stops after 3 consecutive failures)

### Removed
- CLAUDE.md operating system (replaced by plugin skills)
- Morpheus context awareness (replaced by native auto-compaction)
- Registry, request log, session notes (replaced by native auto-memory)
- Shell installer (replaced by plugin system)
- PROCEED gate (replaced by native plan mode)

### Changed
- All skills rewritten from scratch for v2 skill format
- Orson engine migrated and audited
- Effort forced to max on all skills and agents
- Framework distributed as plugin instead of shell script

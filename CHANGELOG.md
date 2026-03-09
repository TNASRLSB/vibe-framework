# Changelog

All notable changes to the VIBE Framework are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2026-03-09

### Changed
- **Distribution cleanup** — Reset user-specific files to empty templates for clean installs
  - `registry.md` — cleared project-specific entries (Key Functions, Notes)
  - `decisions.md` — removed all project-specific decisions
  - `request-log.md` — cleared log entries
  - Removed 5 project-specific spec files from `.claude/docs/specs/`

## [0.5.0] - 2026-03-09

### Changed
- **Emmet: command optimization** — Consolidated and streamlined commands
  - `/adapt-framework` → `/emmet setup` (inside namespace)
  - `/emmet map` now auto-preserves test status (no `--update` flag needed)
  - `/emmet test` explicitly defined as static + functions + unit (`--personas` excluded, invoked separately)
  - `/emmet checklist` without type now shows available options
  - Removed `/emmet report` (report generated automatically by `/emmet test`)
- **Ghostwriter: 10 commands → 2** — Radical simplification
  - `/ghostwriter write [type]` — generates content with research, persona, schema, meta, infra all included
  - `/ghostwriter optimize [target]` — audit + report + spec + PROCEED + fix (without PROCEED = read-only audit)
  - Deprecated: audit, research, schema, meta, persona, pillar-cluster, llms-txt, robots (all absorbed)

### Added
- **`/emmet fix`** — Automatic bug resolution from test/techdebt/static reports
- **`.ghostwriter/audit-report.md`** — Persistent audit output from `/ghostwriter optimize`

## [0.4.0] - 2026-03-06

### Changed
- **Self-contained installer** — `vibe-framework.sh` now downloads the latest release directly from GitHub. No local clone required; the user only needs the script file.
- Installer self-updates to the latest version from the release tarball
- Orson engine `npm install` offered interactively after install (if node_modules missing)

### Added
- `--version` flag: show installed vs available version
- `--help` flag: usage documentation
- `VIBE_LOCAL_SOURCE` env var for development/testing with a local repo

## [0.3.0] - 2026-02-23

### Added
- **Orson v6 runtime** — Spring physics (`SP()`), Perlin noise (`N()`), SVG draw (`D()`), particle system (`P()`) as inline JS runtime
- Automated GitHub Releases via GitHub Actions (`v*` tag trigger)
- Automatic update check in `vibe-framework.sh` (GitHub API with 3s timeout)

### Changed
- Installer script renamed from `framework.sh` to `vibe-framework.sh`
- Cleaned repo for distribution: updated docs, removed dev artifacts

## [0.2.0] - 2026-02-20

### Changed
- Renamed from "Claude Development Framework" to "VIBE Framework"
- Updated all documentation, banner output, and example paths

### Added
- CHANGELOG.md for tracking releases
- RELEASING.md with release process documentation
- GitHub Releases for distribution tracking

## [0.1.0] - 2026-02-19

Initial versioned release. The framework was already functional before versioning was added.

### Added
- VERSION file with semantic versioning
- Version display in vibe-framework.sh installer banner
- Version comparison on update (detects "already up to date")
- `.framework-version` marker written to target projects

### Skills included
- **Seurat** — UI/UX design system, wireframing, WCAG accessibility
- **Emmet** — Testing, QA, tech debt audit, functional mapping
- **Heimdall** — AI-specific security analysis, OWASP Top 10
- **Ghostwriter** — SEO + GEO dual optimization, copywriting
- **Baptist** — CRO orchestrator, A/B testing, funnel analysis
- **Orson** — Programmatic video generation with audio
- **Scribe** — Office documents (xlsx, docx, pptx) and PDF
- **Forge** — Meta-skill for skill creation and maintenance
- **Morpheus** — Context window awareness system

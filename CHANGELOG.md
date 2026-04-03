# Changelog

## 3.7.0 — 2026-04-03

### Fixed
- **Reference path resolution**: all skills now use `${CLAUDE_SKILL_DIR}/references/` instead of bare relative paths — the plugin loader expands these to absolute paths before Claude sees them, ensuring reference files are found regardless of the user's working directory
- **Agent audit protocol**: moved `audit-protocol.md` from gitignored `/references/` to distributed `skills/_shared/` — all 7 audit agents now reference it via `${CLAUDE_PLUGIN_ROOT}` and can actually read it at runtime
- **Heimdall pattern paths**: `patterns/*.json` files now use `${CLAUDE_SKILL_DIR}/patterns/` for reliable resolution
- **Shared protocol paths**: competitor research references in Ghostwriter, Seurat, and Baptist use `${CLAUDE_SKILL_DIR}/../_shared/` instead of bare `../_shared/`

### Changed
- **Setup skill**: improved monorepo detection with `find -maxdepth 2` instead of flat `ls`, covers `frontend/`, `backend/`, `packages/*` structures

## 3.5.1 — 2026-03-31

### Fixed
- **Help skill**: removed `disable-model-invocation` which prevented `/vibe:help` from working via the Skill tool; changed to `model: sonnet` with `effort: low`

## 3.5.0 — 2026-03-31

### Changed
- Version alignment after v3.4.0 feature release

## 3.4.0 — 2026-03-31

12 improvements derived from Claude Code source architecture analysis.

### Added
- **31 security patterns** in quickscan (was 9): private keys, AWS/GCP/Stripe/GitHub/Slack credentials, innerHTML/document.write XSS, SQL injection via interpolation, disabled SSL, pickle/yaml deserialization, subprocess injection, Zsh module attacks, IFS manipulation, unicode obfuscation, control characters, /proc environ exfiltration
- **PreToolUse security hook**: blocks dangerous bash commands before execution (rm -rf /, force push to main, curl|bash, chmod 777, database DROP)
- **Per-skill cost tracking**: estimates token usage and cost per skill invocation (JSONL log)
- **Auto Dream consolidation**: background knowledge synthesis after 5+ sessions and 3+ corrections
- **Contextual tips system**: session-aware tips with cooldowns during startup
- **Emmet verify workflow**: end-to-end change verification (detect stack, start app, exercise behavior, check regressions)
- **Forge 4-round interview**: structured skill creation (high-level, structure, per-step breakdown, final polish) with success criteria per step
- **Frontmatter validation script**: validates all skill and agent metadata against required schema
- **Session memory extraction**: structured JSON session state (branch, errors, files, skills) for reliable post-compaction recovery
- 5 new scripts: auto-dream.sh, cost-tracker.sh, tips-engine.sh, pre-tool-security.sh, validate-frontmatter.sh
- 22 new test cases (81 total, was 59)

### Changed
- All 14 skills: added `whenToUse`, `argumentHint`, `maxTokenBudget` frontmatter for lazy-loading context optimization
- All 9 agents: added `memoryScope: project`, `snapshotEnabled: true`, `omitClaudeMd` fields + Memory Scope section with snapshot sync protocol
- Read-only agents (reviewer, researcher): `omitClaudeMd: true` for token savings
- hooks.json: 6 lifecycle events, 11 handlers (was 5 events, 7 handlers)
- pre-compact-save.sh: enhanced with structured JSON output, git branch, errors, recovery instructions
- security-quickscan.sh: broadened self-exclusion to all VIBE scripts, IFS guard for shell files, rm -- reworked, @system narrowed to jq contexts

### Fixed
- Test suite: replaced phantom `guardian` agent with actual 9-agent roster
- TASK_COUNT bug in pre-compact-save.sh that silently broke jq JSON generation
- Researcher/reviewer memory scope text: "after each audit" corrected to role-appropriate wording
- Frontmatter validator: robust awk-based extraction instead of fragile sed ranges

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

# VIBE Framework

Quality-first plugin for Claude Code. Specialized skills, mechanical quality gates, and intelligent per-skill model selection. **v5.7.0**.

Claude Code out-of-the-box optimizes for speed and token savings. VIBE inverts the trade-off: **quality above all**, with each skill running on the smallest model that empirically preserves ≥95% of Opus 4.7's output quality on representative tasks. Built for developers on Max plans who want the best Claude can produce without burning quota on tasks that don't need it.

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

`/vibe:setup` configures your environment in one pass: detects your stack, recommends LSP plugins, sets `model = opus` and `effort = max`, configures a status line, optionally maps your codebase, and offers opt-in pragmatic priming. Re-runnable; converges to current plugin version's expected state on every run.

For the full capability documentation, see **[plugin/README.md](plugin/README.md)** and **[plugin/CHANGELOG.md](plugin/CHANGELOG.md)**.

## What ships in 5.7.0

| Component | Count | Notes |
|-----------|------:|-------|
| Skills | 14 | 8 domain + 1 audit orchestrator + 5 utility |
| Agents | 11 | 7 domain audit + reviewer, researcher, decomposer, pragmatic |
| Hook handlers | 22 | across 9 Claude Code lifecycle events |

### Skills (`/vibe:<name>`)

**Domain**

- `ghostwriter` — content with SEO + GEO dual optimization. 11-language competitor research, audience modeling, anti-AI-pattern detection, sharpening pass.
- `seurat` — UI design systems informed by competitor visual research. Factor-X distinctiveness across 11 styles. WCAG 2.1 AA mandatory. (Sonnet 4.6 since 5.6.1.)
- `baptist` — CRO with competitor benchmarking. B=MAP diagnosis, ICE scoring, A/B experiment design with statistical rigor. (Sonnet 4.6 since 5.6.1.)
- `emmet` — testing, debugging, tech debt audit. 8 test personas in headed Playwright. Systematic 7-step debugging.
- `heimdall` — security analysis for AI-generated code. OWASP Top 10, BaaS misconfig (Supabase/Firebase), 25+ credential patterns.
- `orson` — programmatic video generation. HTML frames + Playwright + FFmpeg, edge-tts/ElevenLabs, music + SFX mixing.
- `scribe` — Office documents and PDFs (xlsx, docx, pptx).
- `forge` — meta-skill for creating and auditing skills. 4-round structured interview.

**Audit orchestrator**

- `audit` — project-wide quality scan. Scans, proposes relevant domain audits, dispatches agents in parallel, correlates findings across domains, detects regressions, proposes project rules.

**Utility**

- `setup` — first-run/upgrade configuration wizard (self-healing, version-agnostic).
- `spec` — intelligent spec routing: classifies request and dispatches to the optimal Opus variant. Plan-for-executor discipline.
- `pause` / `resume` — disable/re-enable all quality hooks for the session.
- `help` — list all VIBE skills, agents, hooks, commands.

### Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| `reviewer` | fresh-perspective code review | Sonnet, isolated worktree, project-level memory |
| `researcher` | deep codebase exploration | Sonnet, isolated worktree, structured findings |
| `decomposer` | atomic-decomposition orchestration | Sonnet, enumerates items into manifest for per-item sessions |
| `pragmatic` | direct, non-hedging responses | opt-in alternative agent variant |
| 7 domain audits | per-domain headless audit | every domain skill has a `@vibe:<name>` agent twin |

All audit agents run in isolated worktrees, persist memory across sessions in `.claude/agent-memory/vibe-*/`, and produce machine-parseable metrics for trending.

### Hooks (22 across 9 lifecycle events)

Mechanical process constraints — regex/exit-code gates, no semantic judgement.

- **Rhetoric guard** (Stop) — 87 patterns: ownership-dodging, session-length quitting, permission-seeking mid-task, sycophantic capitulation (5.6.0), scope-creep (5.7.0). On match, emits `{"decision":"block","reason":"..."}` with a targeted correction. Rate-capped at 3 fires per session.
- **Oracle gate** (Stop, 5.7.0) — multi-layer analyzer covering what rhetoric-guard's substring matching cannot. HARD-fails on file:line claims with no corresponding prior tool call in the transcript window; SOFT-fails on structural-verb-without-receipt, theater sections (version-tagged + bloat + zero file:line + hype), bare hype, ≥3 options without a recommendation. HARD emits `{"decision":"block","reason":"ORACLE: ..."}`; SOFT logs only.
- **Side-effect verify** (Stop) — catches *"I'll save the config"* prose without an actual `Write`/`Edit` tool call in the same turn.
- **Verify-before-assert** (Stop, log-only by default since 5.6.0) — flags backtick-quoted file/symbol assertions made without preceding `Read`/`Grep`/`Glob`/`LS`. Block mode opt-in via `VIBE_VBA_BLOCK=1`.
- **Atomic enforcement** (Stop) — every manifest item must produce output before completion can be claimed.
- **Read-discipline + read-before-edit** (PreToolUse) — partial read blocked, no `Edit`/`Write` without prior `Read`/`Write` of the target file (full coverage).
- **Scope-guard** (PreToolUse Bash + Read, 5.6.2) — denies cross-project file access. When the session was scoped to project A, blocks reads of `.env`/secrets in unrelated sibling projects.
- **ADR surface** (PreToolUse Read + Edit/Write, 5.7.0) — surfaces `WHY:` / `DECISION:` / `TRADEOFF:` / `RATIONALE:` / `ADR:` / `REJECTED:` markers from the touched file as `additionalContext`. Convention: add `# WHY: chose X over Y because <reason>` above non-obvious decisions and VIBE re-surfaces it whenever CC reads or edits the file. Supports `#`, `//`, `--`, `/*`, `*` styles.
- **Grep/Glob enrichment** (PreToolUse Grep|Glob, 5.7.0) — on every Grep/Glob, emits the top-3 files in the project ranked by combined score: path match + content match + 90-day git churn. Stops the agent from Grep'ing the same area three times in a row.
- **Complexity watch** (PostToolUse Edit|Write, 5.7.0) — after every edit, runs `lizard` (optional dep: `pip install lizard`) and emits a non-blocking warning when max(CCN) > 10 OR delta vs cached baseline > +3. Rationale: high-CCN code accumulates more re-Read/re-Grep iterations on follow-up turns; tool results land post-cache-boundary so they get billed full input price each turn (~30% input-token reduction reported with low CCN).
- **Pragmatic priming** (UserPromptSubmit, default-ON since 5.6.0) — Askell-style ~30-token preamble. Empirically validated 90% hedge-word reduction on Opus 4.7. Disable via `VIBE_PRAGMATIC_MODE=0`.
- **Hybrid execution hint** (PreToolUse:Skill) — proposes inline / subagent / hybrid handoff for plans, then audits idiot-proofness before subagent dispatch.
- **Pre-tool security** (PreToolUse:Bash) — blocks `rm -rf /`, force-push to main, `curl|bash`, fork bombs, network listeners, etc.
- **Post-edit lint + security quickscan** (PostToolUse) — runs project linter (eslint/prettier/ruff/black/rustfmt/gofmt) + 31-pattern hardcoded-credential scan.
- **Failure loop / reset** (PostToolUseFailure / PostToolUse) — counts consecutive Bash/Edit/Write failures; blocks at 3 with a replanning message; resets on success.
- **Setup check** (SessionStart) — silent on normal state, anomaly notices only (missing settings, v1 remnants, missing CLAUDE.md, post-compaction recovery, version drift).
- **Pre-compact save** (PreCompact) — minimal structured snapshot before context compaction.
- **Agent memory sync** (SubagentStop) — copies subagent-worktree memory back to main project.
- **Session end cleanup** (SessionEnd) — clears per-session state files.

### Model tiering

VIBE assigns each skill and agent the smallest model that preserves quality on representative tasks. Empirically validated via blind A/B (Tessl-style 880-eval rubric for creative skills since 5.6.1).

| Tier | Model | Why | Examples |
|------|-------|-----|----------|
| Creative | Opus 4.7 | creative writing, design judgement, novel-vulnerability synthesis | `ghostwriter`, `orson`, `forge`, `spec`, `audit` orchestrator |
| Instruction-heavy | Opus 4.6 | longer prompts, higher instruction adherence, less hedging | `heimdall`, `emmet` |
| Structured execution | Sonnet 4.6 | pattern matching, template following, code analysis | `seurat`, `baptist`, `scribe`, `reviewer`, `researcher`, `decomposer` |
| High-volume search | Haiku 4.5 | candidate identification across multiple languages | competitor-research discovery agents |

Skill and agent tiers can diverge: e.g. the `seurat` skill runs on Sonnet 4.6 (template-driven design system generation) but the `seurat` audit agent runs on Opus (cross-domain judgement in an isolated worktree).

5.6.1 moved `seurat` and `baptist` skills from Opus 4.7 to Sonnet 4.6 after a dual-judge benchmark (Opus + Sonnet judges, with Haiku tiebreaker on `seurat`) confirmed ≥0.96 quality preservation — roughly 3× cheaper and faster on those skills. `ghostwriter` and `orson` stayed on Opus (preservation 0.80 and 0.88, below the 0.95 threshold).

### What VIBE can and cannot do

VIBE is armor on top of Claude Code, itself a harness on top of the Claude model.

**Can:** override Claude Code defaults (effort tier, thinking display, adaptive thinking); inject context (CLAUDE.md, skill descriptions, hook reasons) so the model sees project facts on turn one; react to model output signals (rhetoric-guard, side-effect-verify, verify-before-assert, read-discipline) and intervene before bad actions ship.

**Cannot:** force the model to think beyond the ceiling Anthropic's harness exposes; bypass thinking-block redaction; modify Claude Code's hidden system prompt.

VIBE extracts the maximum from the surface Anthropic exposes. Regressions inside the harness itself are Anthropic-side.

## Recent releases

- **5.7.0** (2026-05-02) — first capability-boost release after the 5.6.x stability cycle. Four new hooks: oracle gate (multi-layer Stop analyzer), ADR surface, Grep/Glob enrichment (NEW matcher slot), complexity watch. Plus rhetoric-guard §15.5 scope-creep category. Hook count 18 → 22.
- **5.6.3** (2026-05-02) — auto-recovery for inherited v1 morpheus residues in `settings.local.json` (partial-cleanup case). Wires reconciler `apply-clean-stale-hooks` into `setup-check.sh` SessionStart; bypass `VIBE_NO_AUTO_RECOVERY=1`.
- **5.6.2** (2026-05-02) — `pre-tool-security.sh` multi-line + path-with-spaces FP fix; new `scope-guard.sh` PreToolUse hook prevents cross-project `.env` reads. Hook count 17 → 18.
- **5.6.1** (2026-04-30) — `seurat` and `baptist` switch to Sonnet 4.6 by default after benchmark. Per-skill empirical model selection (model-routing benchmark Phase 1).
- **5.6.0** — sycophantic-capitulation mitigation: 21 new rhetoric-guard patterns + new `verify-before-assert` Stop hook (log-only) + pragmatic priming Tier B promoted default-ON + competitor-research chain hardened to MANDATORY PRELUDE in 7 modes.
- **5.5.x** — `/vibe:spec` intelligent spec routing, hybrid execution hint hook, A/B consolidation (validated incumbents on audit/seurat/forge/baptist/ghostwriter/orson with zero default switches), self-healing setup wizard for v1 hook cleanup and stale config.
- **5.5.0** — `/vibe:spec` skill, pragmatic-priming 3-tier (shell wrapper / UserPromptSubmit hook / opt-in agent), session model-default persistence in `/vibe:setup`, hook stderr contract fix.
- **5.4.0** — read-discipline + read-before-edit PreToolUse hooks.
- **5.3.0** — side-effect-verify Stop hook, rhetoric-guard Strategy E v3 (preprocessing fenced blocks/strings/links + meta-keyword suppression), macOS bash-3.2 compatibility.
- **5.2.0** — rhetoric-guard Stop hook (54 patterns from benvanik's `stop-phrase-guard.sh`).
- **5.1.0** — self-healing `/vibe:setup` wizard, versioned upgrade marker, CLAUDE.md region markers preserving user-authored content.
- **5.0.0** — atomic decomposition + worker-level model tiering; completion-integrity sentinel removed; layout reorganized into `plugin/` + dev-only top-level dirs.

Full release history: **[plugin/CHANGELOG.md](plugin/CHANGELOG.md)**.

## Repository layout

This repository contains the VIBE plugin source plus development infrastructure (tests, research, design docs). **Only `plugin/` and `.claude-plugin/marketplace.json` are distributed to end users** — everything else is gitignored.

```
.
├── .claude-plugin/marketplace.json   Marketplace manifest (points to ./plugin)
├── plugin/                           The VIBE plugin (distributed)
├── tests/                            Test infrastructure (gitignored)
├── docs/                             Design specs and implementation plans (gitignored)
├── research/                         Paper, experiments, datasets (gitignored)
├── references/                       Internal reference material (gitignored)
└── vendor/                           Third-party reference dumps (gitignored)
```

The plugin loader uses `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_SKILL_DIR}` env vars, which Claude Code resolves at runtime to absolute paths inside `plugin/`.

### `plugin/` — the distributed product

```
plugin/
├── .claude-plugin/plugin.json    Plugin manifest (name, version, metadata)
├── agents/                       11 subagents (7 domain audits + reviewer, researcher, decomposer, pragmatic)
├── hooks/hooks.json              Hook registrations (9 lifecycle events, 22 handlers)
├── scripts/                      Hook handlers and standalone scripts
├── skills/                       14 skills + _shared/ resources
├── CHANGELOG.md                  Plugin release history
├── README.md                     User-facing readme (full capability documentation)
├── LICENSE                       MIT
└── settings.json                 Plugin-level settings
```

Edit anything inside `plugin/` and the local marketplace install picks it up on the next Claude Code session restart.

### Other top-level directories (dev-only, gitignored)

- **`tests/`** — plugin self-test harness (`tests/run-tests.sh`, 200+ tests), model-validation A/B fixtures, component-validation protocols, reconciler tests, maintainer-only release scripts.
- **`docs/`** — `specs/` (architecture decisions) and `plans/` (implementation plans).
- **`research/`** — false-completion paper, experimental harness, codebases, results, pre-paper notes.
- **`references/`** — user research dumps, competitor analyses, internal reference material.
- **`vendor/`** — Claude Code TypeScript source snapshot used during plugin design.

## Branch strategy

- **`main`** — stable releases. Tagged versions ship from here. Feature work happens on short-lived topic branches merged back to `main`.
- **`safety/*`** — recovery points before major refactors (e.g. `safety/pre-5.0-cleanup-2026-04-14`). Local-only, not pushed.

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

Two release paths exist:

- **`tests/maintainer-scripts/release.sh`** (gitignored, primary since 5.6.1) — single-shot automation. Propagates a version bump to `plugin/.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` `plugins[0].version`, creates the git tag, pushes, and creates the GitHub release from the CHANGELOG entry. Closes the historical drift between `plugin.json` and GitHub Releases.
- **`.github/workflows/release.yml`** (manual-dispatch fallback) — Actions tab → Run workflow. Reads `plugin.json` for current version, infers bump type from conventional commits since the last tag (`feat:` → minor, `fix:`/`perf:`/`refactor:` → patch, `BREAKING CHANGE:` → major), updates the version, commits, tags, creates the GitHub release.

The previous auto-on-push trigger was removed in 5.0 after an auto-bump consumed a version slot unintentionally. Version bumps are now a deliberate human action — manual CHANGELOG writeup, then run the release script.

## License

MIT

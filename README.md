# VIBE Framework

Quality-first plugin for Claude Code. Specialized skills, mechanical quality gates, and intelligent per-skill model selection. **v5.7.0**.

Claude Code out-of-the-box optimizes for speed and token savings. VIBE inverts the trade-off: **quality above all**, with each skill running on the smallest model that empirically preserves ≥95% of Opus 4.7's output quality on representative tasks. Built for developers on Max plans who want the best Claude can produce without burning quota on tasks that don't need it.

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

`/vibe:setup` configures your environment in one pass: detects your stack, recommends LSP plugins, sets `model = opus` and `effort = max`, configures a status line, optionally maps your codebase, and offers opt-in pragmatic priming. Re-runnable; converges to current plugin version's expected state on every run.

## What ships in 5.7.0

| Component | Count | Notes |
|-----------|------:|-------|
| Skills | 14 | 8 domain + 1 audit orchestrator + 5 utility |
| Agents | 11 | 7 domain audit + reviewer, researcher, decomposer, pragmatic |
| Hook handlers | 22 | across 9 Claude Code lifecycle events |

## Core Principles

VIBE is built on three principles that have stayed consistent since v3:

1. **Market intelligence over guesswork** — Ghostwriter, Seurat, and Baptist research how the world's best companies in the user's sector communicate, design, and convert — across 5 languages by default (EN, ZH, ES, PT, FR), up to 11 with `--global`. This becomes the baseline. The user's differentiation builds on top.
2. **Process discipline over knowledge** — Skills enforce mandatory reasoning steps: audience modeling before writing, multiple options before selecting, anti-AI-pattern detection before delivering, sharpening before publishing. They don't teach copywriting frameworks, design styles, or security concepts Claude already knows.
3. **Mechanical quality gates** — Hooks and agents enforce standards deterministically, not through suggestions Claude might skip.

## Skills

All skills are invocable as `/vibe:<name>`. Claude also invokes domain skills automatically when relevant to your task — you don't always need to call them explicitly.

### Domain Skills

| Skill | What it does |
|-------|-------------|
| **ghostwriter** | Content creation with dual-optimization (SEO + GEO). Global competitor research discovers messaging patterns across 11 languages. Mandatory process: audience modeling, 5 headline options, anti-AI-pattern detection, sharpening pass. 52+ validation rules. |
| **seurat** | UI design systems informed by competitor visual research. Style selection based on what the market does, not a generic menu. Anti-generic-design constraints. 11 visual styles with Factor-X distinctiveness system. WCAG 2.1 AA mandatory on every component. (Sonnet 4.6 since 5.6.1.) |
| **baptist** | Conversion Rate Optimization with competitor benchmarking. *"Your checkout has 6 steps, the top 5 in your sector have 3."* B=MAP diagnosis, ICE scoring, A/B experiment design with statistical rigor, funnel analysis. (Sonnet 4.6 since 5.6.1.) |
| **emmet** | Testing, QA, and debugging. 8 test personas with headed Playwright sessions. Systematic 7-step debugging (comment-out validation mandatory). Tech debt audit. End-to-end verification (`verify`). |
| **heimdall** | Security analysis for AI-generated code. OWASP Top 10 with vulnerable/fixed code pairs, BaaS misconfiguration detection (Supabase/Firebase), credential scanning with 25+ API key patterns. |
| **orson** | Programmatic video generation. HTML frames captured by Playwright, encoded with FFmpeg. TTS narration (edge-tts free, ElevenLabs paid), background music, SFX mixing. |
| **scribe** | Office documents and PDFs. Auto-routes by format. Reference files focus on gotchas and non-obvious patterns only — no tutorials. |
| **forge** | Meta-skill for creating and auditing skills. 4-round structured interview for skill creation (high-level, structure, per-step breakdown, final polish). Per-step success criteria. Quality checklist includes "Textbook" anti-pattern. |

### Shared Protocol

Ghostwriter, Seurat, and Baptist share a **competitor research protocol** (`_shared/competitor-research.md`). It runs once per project, searches across 5 languages by default (English, Chinese, Spanish, Portuguese, French — covering ~75% of global web commerce), expandable to 11 with `--global`. Discovery agents run on Haiku for efficiency. Three lenses are extracted from each competitor:

- **Copy lens** (Ghostwriter): messaging, tone, value propositions, CTAs
- **Design lens** (Seurat): visual style, palette, typography, layout patterns
- **Conversion lens** (Baptist): UX flows, trust signals, friction reducers

Results are stored in `.vibe/competitor-research/` with 30-day freshness. Any skill can trigger the research; all three consume it.

### Audit Orchestrator

| Skill | What it does |
|-------|-------------|
| **audit** | Project-wide quality orchestrator. Scans the project, proposes which domain audits are relevant, launches agents in parallel, correlates findings across domains, and proposes project rules. |

```
/vibe:audit                    # interactive: scan, propose, confirm, launch
/vibe:audit --all              # launch all relevant agents without confirmation
/vibe:audit --status           # quick health check from agent memory (no agents launched)
/vibe:audit --fix              # auto-merge all agent fixes
/vibe:audit --dry-run          # report only, no fixes
/vibe:audit seurat ghostwriter # launch specific agents directly
```

The audit system uses **delta analysis**: on repeated audits it reads agent memory, compares with current state, and only analyzes what changed. It detects **regressions** (issues fixed then re-emerged) and proposes **project rules** when the same issue appears 3+ times.

### Utility Skills

| Skill | What it does |
|-------|-------------|
| **setup** | First-run + upgrade configuration wizard. Self-healing: detects stack, linters, LSP, configures model/effort/status line, generates minimal CLAUDE.md, optionally maps codebase, auto-cleans v1 morpheus hooks (5.5.7), preserves user-authored content via region markers. Re-runnable; converges to the current plugin version's expected state. |
| **spec** | Intelligent spec routing (5.5.0). Classifies the request and dispatches to the optimal Opus variant via hybrid classifier (keyword fast-path → `haiku-4-5` LLM fallback → `opus-4-7` final fallback). Plan-for-executor discipline embedded inline. Env override: `VIBE_SPEC_FORCE_MODEL`. |
| **pause** | Disables all quality hooks for the current session. For rapid prototyping or exploratory coding where hooks get in the way. |
| **resume** | Re-enables quality hooks after pause. |
| **help** | Displays all VIBE Framework skills, agents, hooks, and commands in one clean reference. Use for onboarding or quick discovery (`/vibe:help`). |

## Agents

Every domain skill has two invocation modes: **interactive** (`/vibe:seurat`) runs in the main conversation, **audit** (`@vibe:seurat` or via `/vibe:audit`) runs autonomously in an isolated worktree with persistent memory.

### General-Purpose Agents

| Agent | Model | Tools | Memory | Purpose |
|-------|-------|-------|--------|---------|
| **reviewer** | Sonnet | Read-only | Project | Post-implementation code review from a fresh perspective. Runs in separate context — never reviews its own code. Rates findings as Critical/Warning/Suggestion. |
| **researcher** | Sonnet | Read-only | Project | Deep codebase exploration in isolated worktree. Returns structured findings (architecture, stack, patterns, concerns) without cluttering your main context. |
| **decomposer** | Sonnet | Read+Write | Project | Atomic decomposition orchestration. Enumerates items for a task (endpoints, components, files, URLs) and writes a manifest for the atomic orchestrator to spawn per-item sessions. |
| **pragmatic** | Opus | Read+Write | Session | Direct, non-hedging response variant. Opt-in alternative agent with `effort:xhigh` and behavioral-override preamble. |

### Domain Audit Agents

All domain audit agents follow a shared [audit protocol](plugin/skills/_shared/audit-protocol.md): standardized report format, evidence-based findings (no *"seems wrong"*), severity levels (Critical/Warning/Info), regression detection, and rule proposals.

| Agent | Domain | Extra Tools | Purpose |
|-------|--------|-------------|---------|
| **seurat** | UI & Accessibility | — | WCAG contrast ratios, semantic HTML, responsive breakpoints, design token consistency, focus management |
| **ghostwriter** | SEO & Content | WebFetch, WebSearch | Meta tags, schema markup, sitemap, robots.txt, Open Graph, keyword cannibalization, GEO readiness |
| **baptist** | Conversion (CRO) | WebFetch | Fogg B=MAP on every conversion point, form friction, CTA visibility, trust signals, funnel continuity |
| **emmet** | Code Quality | — | Test suite, coverage, critical untested paths, debug artifacts, complexity, dependency health, dead code |
| **heimdall** | Security | — | OWASP Top 10, hardcoded secrets, input validation, auth/authz, CORS, CSP headers, dependency CVEs |
| **orson** | Video Assets | — | Encoding quality, file size budgets, responsive embeds, poster images, captions/accessibility |
| **scribe** | Documents | — | Metadata, heading structure, document accessibility, formatting consistency, broken references |

All audit agents run in isolated worktrees, persist memory across sessions in `.claude/agent-memory/vibe-*/`, and produce machine-parseable metrics for trending. The `/vibe:audit` orchestrator launches them in parallel and correlates findings across domains.

## Hooks (22 across 9 lifecycle events)

Mechanical process constraints — regex/exit-code gates, no semantic judgement (that belongs to the agent and its memory system).

| Hook | When | What it does |
|------|------|-------------|
| **Setup check** | Session start | Silent on normal state. Emits guidance only on anomalies: VIBE settings missing, v1 framework remnants, missing CLAUDE.md, post-compaction recovery (`session-state.md` < 5 min old), and version drift between `~/.claude/vibe-configured` and the installed plugin version on first post-upgrade session. |
| **PreToolUse security** | Before bash | Blocks dangerous operations before execution: `rm -rf /`, force push to main, `curl\|bash`, `chmod 777`, database DROP, fork bomb, credential file access, network listeners, kill-all-processes. Exit 2 = block. |
| **Read discipline** | Before Read | Blocks partial Reads on files smaller than 400KB — forces full read so the model has the whole file before making claims. Skip via `VIBE_READ_DISCIPLINE_DISABLED=1` or by mentioning explicit line ranges in the prompt. |
| **Read before edit** | Before Edit/Write | Blocks Edit/Write on a file that hasn't been Read (or Written) in this session at full coverage. Path normalization via `realpath+expanduser` (5.5.5); Write counts as full-read equivalent (5.5.7). Skip via `VIBE_READ_BEFORE_EDIT_DISABLED=1`. |
| **Scope-guard** *(5.6.2)* | Before Bash + Read | Denies cross-project file access. When the session was scoped to project A, blocks reads of `.env`/secrets in unrelated sibling projects. Path-extraction handles literal absolute paths and quoted paths-with-spaces. |
| **ADR surface** *(5.7.0)* | Before Read + Edit/Write | Surfaces in-source ADR markers (`WHY:` / `DECISION:` / `TRADEOFF:` / `RATIONALE:` / `ADR:` / `REJECTED:`) on the targeted file as `additionalContext`. Cap 10 markers, 120-char truncation. **Convention**: write `# WHY: chose JWT over sessions for k8s scaling` above non-obvious decisions and VIBE re-surfaces it whenever CC reads or edits the file. Supports `#`, `//`, `--`, `/*`, `*` styles. Bypass: `VIBE_NO_ADR_SURFACE=1`. |
| **Grep/Glob enrichment** *(5.7.0)* | Before Grep / Glob | NEW matcher slot. Computes three signals in parallel and emits top-3 files by combined score: path match (`git ls-files | grep -iF`), content match (`rg --files-with-matches -i`), churn (`git log --since=90.days`). Format: `<file> (<N> commits, 90d) — <signal>`. Per-signal 500 ms timeout. Non-git falls back to content-only; missing rg falls back to path-only. Bypass: `VIBE_NO_GREP_ENRICH=1`. |
| **Hybrid execution hint** | Before Skill | Fires on `superpowers:writing-plans` to inject a three-option execution handoff (subagent / inline / hybrid) and on `superpowers:subagent-driven-development` to audit plan idiot-proofness before dispatch. Opt-out: `VIBE_NO_HYBRID_HINT=1`. |
| **Pragmatic priming** | User prompt submit | Default-ON since 5.6.0. Injects a ~30-token Askell-style preamble per turn to reduce hedging + sycophancy on Opus 4.7 (5.5.1 A/B measured 90% hedge-word reduction). Cached via prompt caching. Disable: `VIBE_PRAGMATIC_MODE=0`. |
| **Lint** | After Edit/Write | Detects project linter (eslint, prettier, ruff, black, rustfmt, gofmt) and runs it. Skips if no linter installed for the file type. Exit 2 = block on failure. |
| **Security scan** | After Edit/Write | 31-pattern scan for hardcoded keys (API, AWS AKIA, GCP AIza, Stripe sk_live, GitHub ghp_, Slack xox, JWT, private keys), XSS (`innerHTML`, `document.write`, `dangerouslySetInnerHTML`), injection (eval, SQL interpolation, pickle, yaml.load, subprocess shell=True), credentials (Bearer tokens), misconfig (SSL verify=false, Supabase `USING(true)`), obfuscation (Unicode whitespace, control chars, IFS, jq @system). Exit 2 = block. |
| **Complexity watch** *(5.7.0)* | After Edit/Write | Runs `lizard` on the edited file, emits a non-blocking warning when max(CCN) > 10 OR delta vs cached baseline > +3 (delta gate requires a prior baseline). Per-file baseline cached at `${CLAUDE_PLUGIN_DATA}/complexity-baselines/<sha1(path)>.json`. Graceful skip when `lizard` missing or extension non-source. Bypass: `VIBE_NO_CC_WATCH=1`. Optional dep: `pip install lizard`. **Rationale**: high-CCN code accumulates more re-Read/re-Grep iterations on follow-up turns; tool results land post-cache-boundary so they get billed full input price each turn (~30% input-token reduction reported with low CCN). |
| **Compact save** | Before compaction | Writes a minimal structured snapshot before Claude Code compacts the context window: timestamp, session ID, git branch + status + diff names, and pointers to the authoritative sources (transcript path, `TaskList`, auto-memory). Does not summarize — the transcript file is the real record. |
| **Failure loop / reset** | After Bash/Edit/Write | Counts consecutive failures. Exit 2 at 3 consecutive failures with a replanning message. Resets to 0 on any successful tool use. |
| **Rhetoric guard** | Session stop | Matches the last assistant message against 87 rhetorical patterns: ownership-dodging, session-length quitting, permission-seeking mid-task, sycophantic capitulation (5.6.0), scope-creep (5.7.0). On match, emits `{"decision":"block","reason":"..."}` with a targeted correction tied to the matched phrase. Rate-capped at 3 fires per session, then fail-open. Per-category disable: `VIBE_RG_CAPITULATION_DISABLED=1`. |
| **Side-effect verify** | Session stop | Detects when the assistant commits to a write/save/persist operation in prose (*"I'll save the config"*) without invoking a `Write`/`Edit`/`NotebookEdit` tool in the same turn. Reuses rhetoric-guard Strategy E preprocessing to avoid self-citation FPs. Capped at 1 fire per session. Closes `claude-code#49764`. |
| **Oracle gate** *(5.7.0)* | Session stop | Multi-layer analyzer covering what rhetoric-guard's substring matching cannot. **HARD** — file:line claim cross-referenced against the transcript's prior tool-call window (Read/Grep/Glob/LS/Bash-cat, last 50). **SOFT** — structural-verb-without-receipt; theater sections (version-tagged headers + bloat + zero file:line + hype, ratio > 0.3); bare hype without co-located file:line; ≥3 numbered options without a recommendation. HARD emits `{"decision":"block","reason":"ORACLE: ..."}`; SOFT logs to `${CLAUDE_PLUGIN_DATA}/oracle/oracle-events.jsonl`. Bypass: `VIBE_NO_ORACLE=1`, per-rule `VIBE_ORACLE_RULE_<id>_DISABLED=1`. |
| **Verify before assert** | Session stop | Log-only by default since 5.6.0. Detects backtick-quoted file/symbol assertions in the final assistant message without preceding Read/Grep/Glob/LS in recent transcript turns (last 20). Writes events to `${CLAUDE_PLUGIN_DATA}/verify-before-assert/`. Block mode opt-in via `VIBE_VBA_BLOCK=1`. Disable: `VIBE_VBA_DISABLED=1`. |
| **Atomic enforcement** | Session stop | Validates that atomic-decomposition tasks produced output for every item declared in the manifest. Blocks a completion claim that would leave items unprocessed. |
| **Agent memory sync** | Subagent stop | Copies `.claude/agent-memory/vibe-*/` from the subagent's isolated worktree back to the main project, so domain audit agents persist per-run findings across sessions. |
| **Session end cleanup** | Session end | Clears per-session state files (`/tmp/vibe-paused-${SESSION_ID}`, atomic-decomp scratch, rhetoric-guard fire counters). |

Use `/vibe:pause` to temporarily disable all hooks for the session, `/vibe:resume` to re-enable. Pause writes `/tmp/vibe-paused-${SESSION_ID}` which every hook checks as its first action.

**Why this set and not more**: earlier versions of VIBE included `correction-capture`, `auto-dream`, `tips-engine`, and `cost-tracker` hooks. A component-level audit against their real output files (19 days of accumulated data) showed the learning pipeline produced 2 captures total (1 false positive, 50% FP rate), 0 consolidations ever, and fabricated cost estimates duplicating Claude Code's own billing. All four were removed. Claude Code's native auto-memory handles the capture/consolidation use case better because it runs in the agent's semantic context, not a bash regex.

## Model Tiering

VIBE assigns each skill and agent the smallest model that preserves quality on representative tasks. Empirically validated via blind A/B (Tessl-style 880-eval rubric for creative skills since 5.6.1).

| Tier | Model | Components | Why |
|------|-------|------------|-----|
| **Creative** | Opus 4.7 | ghostwriter, orson, forge, spec, audit orchestrator | Creative writing, design judgement, novel synthesis. Saturated near 100% on adherence rubrics. |
| **Instruction-heavy** | Opus 4.6 | heimdall, emmet | Longer prompts, higher instruction adherence, less hedging on Opus 4.6 vs 4.7 (validated A/B). |
| **Structured execution** | Sonnet 4.6 | seurat, baptist, scribe, reviewer, researcher, decomposer | Pattern matching, template following, code analysis, format compliance. |
| **High-volume search** | Haiku 4.5 | competitor-research discovery agents | Web search + candidate identification across multiple languages. |

Skill and agent tiers can diverge: e.g. the `seurat` skill runs on Sonnet 4.6 (template-driven design system generation) but the `seurat` audit agent runs on Opus (cross-domain judgement in an isolated worktree).

**Validation**:
- 5.6.1 — `seurat` and `baptist` skills moved Opus 4.7 → Sonnet 4.6 after dual-judge benchmark (Opus + Sonnet judges, Haiku tiebreaker on seurat) confirmed ≥0.96 quality preservation. `ghostwriter` and `orson` stayed on Opus 4.7 (preservation 0.80 and 0.88, below the 0.95 threshold).
- 5.5.1–5.5.2 pairwise A/B (Opus 4.7 vs 4.6) — Opus 4.7 wins on `audit`, `seurat`, `forge`, `baptist`, `ghostwriter`, `orson` (validated incumbents, zero default switches).
- 5.0 baseline — Heimdall A/B found Opus catches a 3-step token-confusion chain Sonnet misses; later refined to Opus 4.6 default for instruction-adherence on long security audits.

**Recalibration**: when new models ship, rerun the benchmark fixtures in `tests/model-validation/`. The model map at `tests/model-validation/model-map.md` is the source of truth.

## Emmet's 8 Test Personas

Visual testing runs Playwright in headed mode with persona-specific configurations:

| Persona | Viewport | Network | Tests |
|---------|----------|---------|-------|
| First-timer | 1440×900 | Fast | Onboarding, time-to-first-value |
| Power user | 1920×1080 | Fast | Edge cases, complex workflows |
| Non-tech | 1280×720, 150% zoom | Average | Accessibility, clear language |
| Mobile-only | 360×640 | Slow 3G | Responsive, touch targets |
| Screen reader | 1440×900 | Fast | ARIA, focus order, alt text |
| Distracted | 1440×900 | Fast | State preservation, auto-save |
| Hostile | 1920×1080 | Fast | Input validation, XSS, SQLi |
| International | 1440×900 | Average | i18n, UTF-8, RTL layout |

## What VIBE can (and cannot) do

VIBE is armor on top of Claude Code, itself a harness on top of the Claude model.

**Can:** override Claude Code defaults (effort tier, thinking display, adaptive thinking); inject context (CLAUDE.md, skill descriptions, hook reasons) so the model sees project facts on turn one; react to model output signals (rhetoric-guard, side-effect-verify, verify-before-assert, read-discipline, oracle-gate) and intervene before bad actions ship.

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

## Migrating from v1

If you previously used VIBE Framework v1 (the one that installed `.claude/morpheus/`, `vibe-framework.sh`, and a large `CLAUDE.md` into each project), `/vibe:setup` auto-detects and removes v1 residues from user `~/.claude/settings.json` and project settings since 5.5.7 — just re-run `/vibe:setup` after upgrade.

For deeper cleanup (filesystem-side morpheus dirs, etc.), the standalone script remains:

```bash
# Preview what would be removed (no changes)
bash plugin/scripts/vibe-v1-cleanup.sh --scan ~/your-projects --deep --dry-run

# Run the migration
bash plugin/scripts/vibe-v1-cleanup.sh --scan ~/your-projects --deep --yes
```

The script backs up everything into a timestamped zip before removing, cleans morpheus hooks from both `settings.json` and `settings.local.json`, and scans worktrees and nested projects. After migration, run `/vibe:setup` in each project to generate a fresh v2-compatible `CLAUDE.md`.

## Requirements

- **Claude Code** v2.1.59+
- **Max 20x subscription** recommended for full capability (Opus skills use `effort:max`). Most skills run on Sonnet and work on lower tiers.
- **jq** for hook scripts
- **Optional**: Playwright (for Emmet visual testing and Orson video rendering)
- **Optional**: FFmpeg + `pip install edge-tts` (for Orson audio)
- **Optional**: Python 3.6+ (for Scribe document scripts and Heimdall scanners)
- **Optional**: ripgrep — for the 5.7.0 Grep/Glob enrichment hook content-match signal
- **Optional**: `pip install lizard` — for the 5.7.0 complexity-watch hook to actually emit warnings. Soft-fail-on-missing: when absent, the hook exits 0 silently and the rest of VIBE keeps working.

## Repository layout

This repository contains the VIBE plugin source plus development infrastructure (tests, research, design docs). **Only `plugin/` and `.claude-plugin/marketplace.json` are distributed to end users** — everything else is gitignored.

```
.
├── .claude-plugin/marketplace.json   Marketplace manifest (points to ./plugin)
├── plugin/                           The VIBE plugin (distributed)
│   ├── .claude-plugin/plugin.json    Plugin manifest (name, version, metadata)
│   ├── agents/                       11 subagents
│   ├── hooks/hooks.json              Hook registrations (9 lifecycle events, 22 handlers)
│   ├── scripts/                      Hook handlers and standalone scripts
│   ├── skills/                       14 skills + _shared/ resources
│   ├── CHANGELOG.md                  Plugin release history
│   ├── README.md                     Pointer to this file (long-form docs live here)
│   ├── LICENSE                       MIT
│   └── settings.json                 Plugin-level settings
├── tests/                            Test infrastructure (gitignored)
├── docs/                             Design specs and implementation plans (gitignored)
├── research/                         Paper, experiments, datasets (gitignored)
├── references/                       Internal reference material (gitignored)
└── vendor/                           Third-party reference dumps (gitignored)
```

The plugin loader uses `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_SKILL_DIR}` env vars, which Claude Code resolves at runtime to absolute paths inside `plugin/`.

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

The suite (309 tests in 5.7.0) covers plugin structure, all skills, all agents, hook scripts (PreToolUse security, lint, scan, failure loop, pre-compact, setup check, ADR surface, complexity watch, oracle gate, Grep/Glob enrichment), 31 security patterns, frontmatter validation, scope-guard cross-project denial, and v1 migration cleanup.

## Releases

Two release paths exist:

- **`tests/maintainer-scripts/release.sh`** (gitignored, primary since 5.6.1) — single-shot automation. Propagates a version bump to `plugin/.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` `plugins[0].version`, creates the git tag, pushes, and creates the GitHub release from the CHANGELOG entry.
- **`.github/workflows/release.yml`** (manual-dispatch fallback) — Actions tab → Run workflow. Reads `plugin.json` for current version, infers bump type from conventional commits since the last tag (`feat:` → minor, `fix:`/`perf:`/`refactor:` → patch, `BREAKING CHANGE:` → major), updates the version, commits, tags, creates the GitHub release.

The previous auto-on-push trigger was removed in 5.0 after an auto-bump consumed a version slot unintentionally. Version bumps are now a deliberate human action — manual CHANGELOG writeup, then run the release script.

## License

MIT

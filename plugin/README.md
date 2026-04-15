# VIBE Framework

A Claude Code plugin that maximizes output quality. Specialized methodologies, mechanical quality gates, and intelligent model tiering.

Claude Code out-of-the-box optimizes for speed and token savings. VIBE inverts this: **quality above all**, using the right model for each task — Opus for creative and complex reasoning, Sonnet for structured execution, Haiku for high-volume search. Built for developers who want the best Claude can produce without burning through their plan.

## Install

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

`/vibe:setup` configures your environment in one pass: detects your stack, recommends LSP plugins, sets model to `opus` with `effort:max`, configures a status line, and optionally maps your codebase. Restart Claude Code after setup for global settings to take effect.

## What's New in 5.2

**Rhetoric-guard Stop hook.** A new `plugin/scripts/rhetoric-guard.sh` runs on every Stop event, matching the last assistant message against 54 rhetorical patterns verbatim from benvanik's production-tested `stop-phrase-guard.sh` (referenced in `claude-code#42796`). On match, the hook emits a `{"decision":"block","reason":"..."}` with a targeted correction tied to the matched phrase — *"should I continue"* → *"Do not ask. Continue."*, *"pre-existing"* → *"NOTHING IS PRE-EXISTING. You own every change."*, *"known limitation"* → *"NO KNOWN LIMITATIONS. Fix it or explain the specific technical reason."*, etc. Claude receives the correction as context for the next turn and proceeds without looping. Validated E2E on Claude Code 2.1.108 during VIBE 5.1 R6 research — the scratch prototype caught `should I continue` in a real session, emitted the block, and Claude responded with *"Understood — dropping the trailing question. The summary stands..."* without further prompting.

Three defensive additions beyond benvanik's original, each motivated by a specific failure mode: **first-input diagnostic dump** per session (critical instrumentation addressing the "hook activation uncertainty" confound identified in the 5.0 paper §6.3), **fire-rate cap** (default 3 injections per session then fail-open — defense against the VIBE 4.0 completion-sentinel resolution-loop failure), and **transcript fallback** for edge cases where `last_assistant_message` is empty. Configurable via `VIBE_RG_MAX_FIRES`, `VIBE_RG_LOG_DIR`, `VIBE_RG_DISABLED`. Logs event JSON to `${CLAUDE_PLUGIN_DATA}/rhetoric-guard/`.

**Release automation via `scripts/bump-version.sh`.** Atomically updates `plugin/.claude-plugin/plugin.json`, prepends a CHANGELOG skeleton for the new version, and recounts skills/agents/hooks from the filesystem to refresh `.claude-plugin/marketplace.json`. Replaces the historical pattern where version bumps and docs sync landed in separate commits, producing a public drift window on every release. Dogfooded on the 5.2.0 release.

**`vibe:help` synced.** The help skill was stale since 5.0 — the `decomposer` agent (introduced in 5.0) was missing from the agents table for five months, the hook count still claimed nine handlers, and Setup check still referenced the 5.0-era `vibe-5.0-configured` marker filename. Fixed as part of the 5.2 drift sweep. The bump script now catches this class of drift on future releases.

## What's New in 5.1

**Self-healing `/vibe:setup` wizard.** Setup is now version-agnostic: running it always converges user state to the current plugin version's expected state, regardless of what was there before. A second run on a clean state is a no-op (*"already in sync"*). Architecture: declarative `plugin/setup/expected-state.json` schema + `plugin/setup/reconciler.sh` (detect → diff → present → apply) + versioned marker file + surgical CLAUDE.md region markers. The wizard preserves all user-authored content outside VIBE-managed regions.

**Versioned upgrade marker** (`~/.claude/vibe-configured` with JSON `{"version": "X.Y.Z"}`). Replaces the hardcoded `vibe-5.0-configured` marker used in 5.0. `setup-check.sh` Check 5 now compares the marker's version against the installed plugin's version from `plugin.json` and fires the upgrade notice on any drift — future upgrades naturally trigger a re-run prompt without requiring per-version marker files.

**CLAUDE.md region markers** (`<!-- VIBE:managed-start -->` / `<!-- VIBE:managed-end -->`). Future setup runs replace content between these markers and leave everything else untouched. Legacy files without markers are classified into three outcomes: `LEGACY_WITH_VIBE_TOKENS` (contains 4.x-era strings like `VIBE_GATE`, `reflect skill`, `Completion Integrity`) → backup + regenerate with user approval; `LEGACY_NO_VIBE_TOKENS` (pure user content) → never touched, user warned to delete manually if they want a managed file.

**Deprecation blacklists** for env vars (`VIBE_INTEGRITY_MODE`) and data files (`tips-state.json`, `dream/`, `learnings/`, `costs/`) left over from 4.x. The reconciler removes these during apply, tarballing data files into a timestamped backup first.

## What's New in 5.0

VIBE 5.0 is a structural simplification and rigorous-foundation pass driven by an empirical audit of the 4.x components. Opus is reserved for the conceptual and judgment layer; Sonnet and Haiku handle structured execution and high-volume work. Atomic decomposition is the primary pattern for enumerable tasks. Every hook is a mechanical process constraint — no informational emitters.

**Worker-level model tiering for atomic decomposition.** The orchestrator accepts `--worker-model`, `--worker-effort`, `--worker-fallback` flags and matching manifest fields. Per-item sessions and the polish step run on the declared worker model (default: sonnet / medium / sonnet). **Opus is explicitly disallowed as a worker** — reserved for the decomposer and polish layers. Subscription users get atomic decomposition as a daily-usable operation instead of burning Opus quota on single-item work. Five skills carry worker model declarations: ghostwriter, seurat, baptist, emmet, and the shared competitor-research protocol.

**Agent memory persistence via SubagentStop sync.** A new `agent-memory-sync.sh` hook copies `.claude/agent-memory/vibe-*/` from the subagent's isolated worktree back to the main project after each run. Nine memory-persisting agents (reviewer, researcher, baptist, emmet, ghostwriter, heimdall, orson, scribe, seurat) can now retain per-run findings across sessions, enabling delta analysis and regression detection at the main-project level.

**Simplified hook surface: 9 handlers across 7 lifecycle events.** Four dead hook scripts were removed after a component-level audit against 19 days of real output files showed they didn't work (`correction-capture`, `auto-dream`, `tips-engine`, `cost-tracker`). The `reflect` skill — an orphaned consumer of the `correction-capture` queue — went with them. Claude Code's native auto-memory handles the capture/consolidation use case better because it runs in the agent's semantic context, not a bash regex.

**Completion Integrity System removed (was added in 4.0).** The three-layer sentinel system (~1000 lines across 15 files) was removed in favor of atomic decomposition, which achieves what the sentinel tried to guarantee — structurally. Each atomic task is spawned in its own session with exactly one item to process, making partial completion impossible at the architectural level rather than trying to catch it after the fact.

**Post-upgrade 5.0 notification.** Users upgrading from 4.x in place see a one-time SessionStart anomaly ("VIBE 5.0 detected. Run `/vibe:setup`...") until the wizard writes the `$HOME/.claude/vibe-5.0-configured` marker. **No backward compatibility for 4.x configurations** — the wizard must be rerun once.

**Repository layout reorganized.** Distributed plugin content is now under `plugin/`; the top-level holds `tests/`, `docs/`, `research/`, `vendor/` which are gitignored dev infrastructure. All 168 tracked files moved via `git mv`, preserving history.

### 5.0.1

**SessionStart hook output validation fix.** `setup-check.sh` emitted `hookSpecificOutput` without the required `hookEventName` field, causing a non-blocking Claude Code 2.1.x validation warning on every session start where an anomaly was detected (missing settings, v1 remnants, missing CLAUDE.md, post-compaction recovery, or the 5.0 upgrade marker). Fixed by adding `hookEventName: "SessionStart"` to the emitted object.

## Core Principles

VIBE is built on three principles that have stayed consistent since v3:

1. **Market intelligence over guesswork** — Ghostwriter, Seurat, and Baptist research how the world's best companies in the user's sector communicate, design, and convert — across 5 languages by default (EN, ZH, ES, PT, FR), up to 11 with `--global`. This becomes the baseline. The user's differentiation builds on top.

2. **Process discipline over knowledge** — Skills enforce mandatory reasoning steps: audience modeling before writing, multiple options before selecting, anti-AI-pattern detection before delivering, sharpening before publishing. They don't teach copywriting frameworks, design styles, or security concepts Claude already knows.

3. **Mechanical quality gates** — Hooks and agents enforce standards deterministically, not through suggestions Claude might skip.

## Skills

### Domain Skills

| Skill | What it does |
|-------|-------------|
| **ghostwriter** | Content creation with dual-optimization (SEO + GEO). Global competitor research discovers messaging patterns across 11 languages. Mandatory process: audience modeling, 5 headline options, anti-AI-pattern detection, sharpening pass. 52+ validation rules. |
| **seurat** | UI design systems informed by competitor visual research. Style selection based on what the market does, not a generic menu. Anti-generic-design constraints. 11 visual styles with Factor-X distinctiveness system. WCAG 2.1 AA mandatory on every component. |
| **baptist** | Conversion Rate Optimization with competitor benchmarking. "Your checkout has 6 steps, the top 5 in your sector have 3." B=MAP diagnosis, ICE scoring, A/B experiment design with statistical rigor, funnel analysis. |
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
| **setup** | First-run configuration wizard. Detects stack, linters, LSP, configures model/effort/status line, generates minimal CLAUDE.md (even on empty projects), optionally maps codebase. |
| **pause** | Disables all quality hooks for the current session. For rapid prototyping or exploratory coding where hooks get in the way. |
| **resume** | Re-enables quality hooks after pause. |
| **help** | Displays all VIBE Framework skills, agents, hooks, and commands in one clean reference. Use for onboarding or quick discovery (`/vibe:help`). |

### Invoking Skills

All skills are invocable as `/vibe:<name>`:

```
/vibe:emmet test              # full testing cycle
/vibe:emmet debug             # systematic 7-step debugging
/vibe:emmet techdebt          # tech debt audit
/vibe:emmet verify            # verify a code change works end-to-end
/vibe:heimdall audit          # full security audit
/vibe:heimdall secrets        # credential scan only
/vibe:seurat brand            # brand identity from competitor landscape
/vibe:ghostwriter write       # content creation with competitor research
/vibe:baptist audit            # conversion audit with competitor benchmarks
/vibe:orson create            # guided video creation
/vibe:scribe create xlsx      # create spreadsheet
/vibe:forge create my-skill   # create a new skill
/vibe:audit                   # project-wide audit
```

Claude also invokes domain skills automatically when relevant to your task — you don't always need to call them explicitly.

## Agents

Every domain skill has two invocation modes: **interactive** (`/vibe:seurat`) runs in the main conversation, **audit** (`@vibe:seurat` or via `/vibe:audit`) runs autonomously in an isolated worktree with persistent memory.

### General-Purpose Agents

| Agent | Model | Tools | Memory | Purpose |
|-------|-------|-------|--------|---------|
| **reviewer** | Sonnet | Read-only | Project | Post-implementation code review from a fresh perspective. Runs in separate context — never reviews its own code. Rates findings as Critical/Warning/Suggestion. |
| **researcher** | Sonnet | Read-only | Project | Deep codebase exploration in isolated worktree. Returns structured findings (architecture, stack, patterns, concerns) without cluttering your main context. |
| **decomposer** | Sonnet | Read+Write | Project | Atomic decomposition orchestration. Enumerates items for a task (endpoints, components, files, URLs) and writes a manifest for the atomic orchestrator to spawn per-item sessions. Used automatically by skills that declare atomic decomposition. |

### Domain Audit Agents

All domain audit agents follow a shared [audit protocol](skills/_shared/audit-protocol.md): standardized report format, evidence-based findings (no "seems wrong"), severity levels (Critical/Warning/Info), regression detection, and rule proposals.

| Agent | Domain | Extra Tools | Purpose |
|-------|--------|-------------|---------|
| **seurat** | UI & Accessibility | — | WCAG contrast ratios, semantic HTML, responsive breakpoints, design token consistency, focus management |
| **ghostwriter** | SEO & Content | WebFetch, WebSearch | Meta tags, schema markup, sitemap, robots.txt, Open Graph, keyword cannibalization, GEO readiness |
| **baptist** | Conversion (CRO) | WebFetch | Fogg B=MAP on every conversion point, form friction, CTA visibility, trust signals, funnel continuity |
| **emmet** | Code Quality | — | Test suite, coverage, critical untested paths, debug artifacts, complexity, dependency health, dead code |
| **heimdall** | Security | — | OWASP Top 10, hardcoded secrets, input validation, auth/authz, CORS, CSP headers, dependency CVEs |
| **orson** | Video Assets | — | Encoding quality, file size budgets, responsive embeds, poster images, captions/accessibility |
| **scribe** | Documents | — | Metadata, heading structure, document accessibility, formatting consistency, broken references |

All agents run in isolated worktrees, persist memory across sessions, and produce machine-parseable metrics for trending. The `/vibe:audit` orchestrator launches them in parallel and correlates findings across domains.

## Model Tiering

Not every task needs the most powerful model. VIBE assigns each component the model that matches its cognitive demands, validated via blind A/B testing.

| Tier | Model | Components | Why |
|------|-------|------------|-----|
| **Creative & Complex** | Opus | ghostwriter, seurat, heimdall, audit orchestrator | Creative writing, design judgment, novel vulnerability discovery, cross-domain synthesis |
| **Structured Execution** | Sonnet | baptist, emmet, scribe, orson, reviewer, researcher, forge | Pattern matching, template following, code analysis, format compliance |
| **High-Volume Search** | Haiku | competitor research discovery agents | Web search + candidate identification across multiple languages |

**Validation**: Heimdall was A/B tested — Opus found a 3-step token confusion attack chain that Sonnet missed (5.0 vs 4.5). Baptist was A/B tested — both models scored identically on CRO analysis (4.9 vs 4.9). Test fixtures and protocol are in `tests/model-validation/`.

**Recalibration**: when new models ship, rerun the test cases in `tests/model-validation/test-cases.md` to verify assignments still hold. The model map at `tests/model-validation/model-map.md` is the source of truth.

## Hooks

Ten hook handlers across seven lifecycle events run automatically. Every hook is a mechanical process constraint — a regex or exit-code gate — not a place for semantic judgment (that belongs to the agent and its memory system).

| Hook | When | What it does |
|------|------|-------------|
| **Setup check** | Session start | Silent on normal state. Emits guidance only on anomalies: VIBE settings missing, v1 framework remnants, missing CLAUDE.md, post-compaction recovery (`session-state.md` < 5 min old), and version drift between `~/.claude/vibe-configured` and the installed plugin version on first post-upgrade session. |
| **PreToolUse security** | Before bash commands | Blocks dangerous operations before execution: `rm -rf /`, force push to main, `curl\|bash`, `chmod 777`, database DROP, fork bomb, credential file access, network listeners, kill-all-processes. Exit 2 = block. |
| **Lint** | After file edit | Detects project linter (eslint, prettier, ruff, black, rustfmt, gofmt) and runs it. Skips if no linter installed for the file type. Exit 2 = block on failure. |
| **Security scan** | After file edit | 31-pattern scan for hardcoded keys (API, AWS AKIA, GCP AIza, Stripe sk_live, GitHub ghp_, Slack xox, JWT, private keys), XSS (`innerHTML`, `document.write`, `dangerouslySetInnerHTML`), injection (eval, SQL interpolation, pickle, yaml.load, subprocess shell=True), credentials (Bearer tokens), misconfig (SSL verify=false, Supabase `USING(true)`), obfuscation (Unicode whitespace, control chars, IFS, jq @system). Exit 2 = block. |
| **Compact save** | Before compaction | Writes a minimal structured snapshot before Claude Code compacts the context window: timestamp, session ID, git branch + status + diff names, and pointers to the authoritative sources (transcript path, `TaskList`, auto-memory). Does not try to summarize — the transcript file is the real record. |
| **Failure loop** | After tool failures | Increments a per-session counter on Bash/Edit/Write failures. Exit 2 at 3 consecutive failures with a replanning message. Resets to 0 on any successful tool use. |
| **Failure reset** | After tool success | Paired with failure loop. Zeroes the counter on successful tool invocations. |
| **Rhetoric guard** | Session stop | Matches the last assistant message against 54 rhetorical patterns (ownership dodging, session-length quitting, permission-seeking mid-task) verbatim from benvanik's production-tested `stop-phrase-guard.sh`. On match, emits `{"decision":"block","reason":"..."}` with a targeted correction tied to the matched phrase. Rate-capped at 3 fires per session, then fail-open. Runs before Atomic enforcement on the Stop event; the two are orthogonal. |
| **Atomic enforcement** | Session stop | Validates that atomic-decomposition tasks produced output for every item declared in the manifest. Blocks a completion claim that would leave items unprocessed. |
| **Agent memory sync** | Subagent stop | Copies `.claude/agent-memory/vibe-*/` from the subagent's isolated worktree back to the main project, so domain audit agents can persist per-run findings across sessions. Non-blocking. |

Use `/vibe:pause` to temporarily disable all hooks for the session, `/vibe:resume` to re-enable. Pause writes `/tmp/vibe-paused-${SESSION_ID}` which every hook checks as its first action.

**Why this set and not more**: earlier versions of VIBE included `correction-capture`, `auto-dream`, `tips-engine`, and `cost-tracker` hooks. A component-level audit against their real output files (19 days of accumulated data) showed the learning pipeline produced 2 captures total (1 false positive, 50% FP rate), 0 consolidations ever, and fabricated cost estimates duplicating Claude Code's own billing. All four were removed. The architecture stayed — it's the content that was wrong. Claude Code's native auto-memory handles the capture/consolidation use case better because it runs in the agent's semantic context, not a bash regex.

## Emmet's 8 Test Personas

Visual testing runs Playwright in headed mode with persona-specific configurations:

| Persona | Viewport | Network | Tests |
|---------|----------|---------|-------|
| First-timer | 1440x900 | Fast | Onboarding, time-to-first-value |
| Power user | 1920x1080 | Fast | Edge cases, complex workflows |
| Non-tech | 1280x720 150% zoom | Average | Accessibility, clear language |
| Mobile-only | 360x640 | Slow 3G | Responsive, touch targets |
| Screen reader | 1440x900 | Fast | ARIA, focus order, alt text |
| Distracted | 1440x900 | Fast | State preservation, auto-save |
| Hostile | 1920x1080 | Fast | Input validation, XSS, SQLi |
| International | 1440x900 | Average | i18n, UTF-8, RTL layout |

## Migrating from v1

If you previously used VIBE Framework v1 (the one that installed `.claude/morpheus/`, `vibe-framework.sh`, and a large `CLAUDE.md` into each project), run the cleanup script to remove all remnants:

```bash
# Preview what would be removed (no changes)
bash scripts/vibe-v1-cleanup.sh --scan ~/your-projects --deep --dry-run

# Run the migration
bash scripts/vibe-v1-cleanup.sh --scan ~/your-projects --deep --yes
```

The script backs up everything into a timestamped zip before removing, cleans morpheus hooks from both `settings.json` and `settings.local.json`, and scans worktrees and nested projects.

After migration, run `/vibe:setup` in each project to generate a fresh v2-compatible `CLAUDE.md`.

## Requirements

- **Claude Code** v2.1.59+
- **Max 20x subscription** recommended for full capability (Opus skills use `effort:max`). Most skills run on Sonnet and work on lower tiers.
- **jq** for hook scripts
- **Optional:** Playwright (for Emmet visual testing and Orson video rendering)
- **Optional:** FFmpeg + `pip install edge-tts` (for Orson audio)
- **Optional:** Python 3.6+ (for Scribe document scripts and Heimdall scanners)

## Testing

```bash
bash tests/run-tests.sh
```

Runs 200+ automated tests covering plugin structure, all skills, all agents, hook scripts (PreToolUse security, lint, scan, failure loop, pre-compact, setup check), 31 security patterns, frontmatter validation, and v1 migration cleanup.

## License

MIT

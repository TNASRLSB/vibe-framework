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

## What's New in 5.7

**Capability-boost release after the 5.6.2 + 5.6.3 stability cycle (5.7.0, 2026-05-02).** Four new hooks ported from external Claude Code projects (Godspeed/toke, repowise) plus a measured field observation on token efficiency. All four pass Iron Man Mandate, Audience Test, User Burden Zero, and Capability Boost > Verification. Hook count: 18 → 22. Spec: `docs/spec/2026-05-02-vibe-5.7.0-tier-s.md`.

- **Oracle gate (Stop).** New `plugin/scripts/oracle-gate.{py,sh}` registered after `rhetoric-guard.sh` and `side-effect-verify.sh`, before `atomic-enforcement.sh`. Multi-layer Stop analyzer: HARD-fails on file:line claims that no prior tool call (Read/Grep/Glob/LS/Bash-cat in last 50 transcript entries) actually touched; SOFT-fails on (a) structural verbs without a co-located file:line receipt, (b) "theater" sections (version-tagged headers + bloat + zero file:line + hype, ratio > 0.3), (c) hype phrasing without co-located file:line, (d) ≥3 numbered options without a recommendation. HARD emits `{"decision":"block","reason":"ORACLE: ..."}`; SOFT logs to `${CLAUDE_PLUGIN_DATA}/oracle/oracle-events.jsonl`. Bypass: `VIBE_NO_ORACLE=1`, pause flag, per-rule `VIBE_ORACLE_RULE_<id>_DISABLED=1`. Companion change: `rhetoric-guard.sh` gains a new `scope-creep` category (§15.5) with 8 verb-phrase patterns (5 EN + 3 IT) — *while I was at it*, *I went ahead and*, *for good measure*, *ho colto l'occasione*, *già che c'ero*, etc. — caught at Stop time after the unrequested side-work has already shipped.

- **ADR surface hook (PreToolUse Read + Edit/Write).** New `plugin/scripts/adr-surface.sh` extracts `WHY:` / `DECISION:` / `TRADEOFF:` / `RATIONALE:` / `ADR:` / `REJECTED:` markers from the file targeted by Read or Edit/Write and emits them as `additionalContext`. Cap 10 markers per file, 120-char truncation. Convention: add a `# WHY: chose X over Y because <reason>` line above non-obvious decisions; VIBE surfaces it automatically when CC reads or edits the file. Supports `#`, `//`, `--`, `/*`, `*` comment styles. Bypass: `VIBE_NO_ADR_SURFACE=1`.

- **Grep/Glob enrichment hook (NEW PreToolUse Grep|Glob matcher).** New `plugin/scripts/grep-glob-enrich.sh` registered under a brand-new `Grep|Glob` matcher entry — exploits the previously-unused matcher slot. On every Grep/Glob, computes three signals in parallel — path-match via `git ls-files`, content-match via `rg --files-with-matches`, churn via `git log --since=90.days` — and emits the top-3 files by combined score as `additionalContext`. Per-signal 500ms timeout cap; non-git falls back to content-only; missing rg falls back to path-only. Bypass: `VIBE_NO_GREP_ENRICH=1`.

- **Complexity watch hook (PostToolUse Edit|Write).** New `plugin/scripts/complexity-watch.sh` runs `lizard` on the touched file after every Edit/Write and emits a non-blocking `additionalContext` warning when max(CCN) > 10 OR delta vs cached baseline > +3 (delta gate gated on a baseline existing — first edit of a file is silent unless absolute threshold trips). Per-file baseline cached at `${CLAUDE_PLUGIN_DATA}/complexity-baselines/<sha1(path)>.json` so deltas survive across sessions. Graceful skip when `lizard` is missing or the extension is non-source. Rationale: high-CCN code drives more re-Read/re-Grep iterations on follow-up turns, and tool results land post-cache-boundary so they get billed full input price each turn — field observation reports ~30% input-token reduction with low CCN, with and without prompt caching. Optional dep: `pip install lizard` (single MIT-licensed package, no transitive deps beyond Python stdlib). Bypass: `VIBE_NO_CC_WATCH=1`.

## What's New in 5.6.2 / 5.6.3

**Stability + auto-recovery cycle (2026-05-02).** Two patch releases between the 5.6.1 model-routing benchmark and the 5.7.0 capability-boost release. **5.6.2** fixed a multi-line + path-with-spaces false positive in `pre-tool-security.sh` (legitimate `cd "/home/uh1/VIBEPROJECTS/<path with spaces>"` was being blocked) and shipped a new `scope-guard.sh` PreToolUse hook that prevents agents from reading `.env` files in unrelated sibling projects (cross-project scope creep). Hook count: 17 → 18. **5.6.3** wired `reconciler.sh detect-stale-hooks` into `setup-check.sh` SessionStart so projects inherited with v1 morpheus residues in `settings.local.json` self-heal on the first session — the partial-cleanup case (filesystem manually wiped, settings still pointing at non-existent scripts) emitted "File o directory non esistente" on every Bash/Read/Write before this fix. Both releases include zero new dependencies and zero manual setup; existing config preserved on upgrade.

## What's New in 5.6

**Per-skill empirical model selection (5.6.1, 2026-04-30).** Two creative skills moved from Opus 4.7 to Sonnet 4.6 by default after a benchmark adapted from Tessl's 880-eval study confirmed each preserves ≥95% of Opus 4.7's output quality on representative tasks. `/vibe:seurat` and `/vibe:baptist` now run on Sonnet 4.6 — roughly 3× cheaper and faster, equivalent quality on the benchmark prompts. Three-judge consensus (Opus 4.7 + Sonnet 4.6 + Haiku 4.5 tiebreaker on seurat) with mean preservation 0.96 across judges. `ghostwriter` and `orson` stayed on Opus 4.7 (preservation 0.80 and 0.88, below the 0.95 threshold). No slash-command API changes. **Bonus finding:** Tessl Finding #2 ("weaker models benefit most from skill loading") confirmed for VIBE creative skills — Opus 4.6 jumped +16-20pp on adherence with the skill loaded (e.g., seurat 0.84 → 1.00; baptist 0.80 → 1.00). Opus 4.7 was already saturated near 100% in both conditions, so the lift is masked.

**Sycophantic-capitulation mitigation (5.6.0, 2026-04-26).** Seven integrated fixes (A–G) targeting the model-level pattern where Claude makes confident-wrong assertions about repo state then capitulates (*"I was wrong, you're right"*) under user pushback without verifying. Distinct from rhetoric-guard 5.2's coverage (giving up, ownership-dodging, permission-seeking); this release closes the **epistemic** gap.

- **(A) Hardened competitor-research chain language.** Seurat (Setup + Brand), Ghostwriter (Write/Phase 2), Baptist (Audit Step 1) referenced the shared protocol via blockquote `> **Read** ...` — read as an aside, skim-prone. Replaced with **MANDATORY PRELUDE** numbered steps: imperative `Use the Read tool now on PATH`, freshness check on `.vibe/competitor-research/metadata.json`, and "Do NOT continue to Step N until storage is complete". Same chain, unmissable language.
- **(B) Pragmatic priming Tier B promoted default-ON.** `pragmatic-priming.sh` UserPromptSubmit hook (5.5.1 A/B measured 90% hedge-word reduction on Opus 4.7) now ships active per Iron Man Mandate + User Burden Zero. Disable via `VIBE_PRAGMATIC_MODE=0`.
- **(C) New rhetoric-guard category: `sycophantic-capitulation` (21 patterns).** §15.0 in `rhetoric-guard.sh` catches retroactive capitulation about a CLAIM already made — backward-looking sycophantic agreement, distinct from existing forward-looking ownership-dodging. Patterns: `i was wrong`, `you're absolutely right`, `let me correct myself`, `i apologize for the (confusion|error)`, plus Italian variants `avevo torto`, `mi correggo`, `hai ragione`. Correction injected: *"VERIFY BEFORE AGREEING. Cite the specific evidence (file:line, tool output) that justifies the reversal. If no evidence, do not capitulate — restate your prior position with reasoning."* All 21 added to `HIGH_RISK_PATTERNS` for Stage-3 meta-keyword suppression (don't fire when discussed in audit/post-mortem context). Pattern total: 56 → 79. Per-category disable: `VIBE_RG_CAPITULATION_DISABLED=1`.
- **(D) Verification Discipline section in CLAUDE.md template.** New managed section in `claude-md-template.md` between Capability Audit and VIBE Limits. Imperative bullets: file existence → Read/Glob, function/symbol presence → Grep, architecture claims → cite line numbers, cross-references → check both ends. Plus pushback discipline: *"User disagreement is not evidence the user is right. Cite the specific fact (file:line, tool output) that supports the reversal — or restate your prior position with reasoning."* Propagates to all VIBE-managed CLAUDE.md files on next `/vibe:setup` run.
- **(E) New Stop hook: `verify-before-assert.sh`.** Detects backtick-quoted file/symbol assertions in the final assistant message without preceding Read/Grep/Glob/LS in recent transcript turns (last 20). Default mode: **log-only** — writes events to `${CLAUDE_PLUGIN_DATA}/verify-before-assert/vba-events-${SESSION_ID}.jsonl` for maintainer FP-rate review. Block mode opt-in via `VIBE_VBA_BLOCK=1`. Disable: `VIBE_VBA_DISABLED=1`. Hook count: 16 → 17.
- **(F) Chain extended to 4 additional modes.** `seurat generate`, `ghostwriter optimize`, `baptist test`, `baptist funnel` previously lacked the competitor-research chain. Each now has a MANDATORY PRELUDE block. Pure-introspection modes (`seurat extract/preview/map`, `ghostwriter validate`, `baptist analyze`) intentionally skip — they don't produce sector-baseline-dependent output.
- **(G) Audit orchestrator + 3 agents share research cache.** `/vibe:audit` runs the protocol ONCE (or confirms fresh cache) before dispatching seurat/ghostwriter/baptist agents in parallel — synchronization point preventing 3-way race. Agents read `.vibe/competitor-research/metadata.json` for freshness and tag findings `[BENCHMARK]`. Standalone agent invocation degrades gracefully to standards-only with visible header note `Benchmark coverage: not available`.

## What's New in 5.5

**Session model default persistence (§2.8b).** `/vibe:setup` now actually writes `settings["model"] = "opus"` to your user settings. Previously the wizard showed "Model set to opus" but the reconciler only wrote env vars — the top-level `model` field stayed whatever Claude Code defaulted to. New reconciler sub-commands `detect-top-level` + `apply-top-level` close this `feedback_honesty_patterns` Pattern 2 gap, and `cmd_present_diff` renders the top-level change in the diff before you approve (no silent writes). Effect: every `claude` invocation now starts on Opus by default, without users needing to remember the `--model opus` flag.

**`/vibe:spec` intelligent spec routing (§2.8c).** New user-facing skill that classifies your spec request and dispatches to the optimal Opus variant. Hybrid classifier: word-boundary keyword fast-path (strong-signal rule `max≥2 AND max≥2*min`) → `haiku-4-5` LLM fallback on ambiguity → `opus-4-7` final fallback. Scope estimator picks single-doc vs split based on token count + scope keywords (`refactor`, `v2`, `multi-phase`, `ship`, `release`, `major`). Plan-for-executor discipline embedded inline in the spec-writer prompt template (no maintainer-memory cross-reference — Arc Reactor Agnostic). Classifier A/B on 20-prompt fixture: **20/20 = 100%**, zero LLM fallbacks needed. Env override: `VIBE_SPEC_FORCE_MODEL=<model-id>`. Invoke: `/vibe:spec <your request>`.

**Pragmatic Priming 3-tier (§2.6).** Askell-inspired ~30-token preamble that reduces documented Opus 4.7 hedging + sycophancy tells (ref `feedback_honesty_patterns`, Stella Laurenzo #42796 thread). Three tiers to pick your commitment level: **Tier A** shell wrapper — `/vibe:setup` Step 5.7 offers opt-in install of `~/.claude/vibe-pragmatic-prompt.txt` and shows the exact `alias claude='... --append-system-prompt ...'` line for you to add (does NOT auto-modify your shell rc per Arc Reactor Agnostic). O(1) token cost per conversation, cached via prompt caching. **Tier B** UserPromptSubmit hook — `plugin/scripts/pragmatic-priming.sh` is **default-ON** (5.5.1 A/B measured 90% hedge-word reduction on Opus 4.7; the validated mitigation now ships active per Iron Man Mandate + User Burden Zero). Disable via `VIBE_PRAGMATIC_MODE=0`. Injects preamble per turn. O(N) token cost. Active by default for all users without shell wrapper access. **Tier C** opt-in agent — `@vibe:pragmatic` per-invocation, zero persistent config. Pick the tier matching your desired scope.

**Hook stderr output fix (§2.9).** The `read-discipline` and `read-before-edit` hooks (shipped 5.4.0) used a `2>&1 >/dev/null` redirect pattern on their Python `stderr.write` call. Bash LEFT-TO-RIGHT evaluation made the JSON reason leak to hook stdout instead of stderr — so Claude Code reported `"No stderr output"` instead of the actionable reason ("Read X first" / "partial read blocked"). Bug was latent for the full 5.4.x cycle; caught via dogfooding during 5.5.0 spec authoring (the author was blocked editing their own spec file and had to user-interrupt to investigate). Fix: removed the redirect (3 occurrences, 2 files). Header contract `"emits JSON {reason} on stderr"` now actually honored.

**Context injection audit baseline (§2.7).** New maintainer dev tool `scripts/dev-injection-audit.sh` enumerates every VIBE context injection point (CLAUDE.md managed region, skill descriptions, agent prompts, PreToolUse hook reasons, UserPromptSubmit Tier B, Stop hook feedback, shared protocol files), estimates token cost per injection, and tags frequency (one-time / per-turn / on-block / per-invocation). First paper-v2-ready measurement of what VIBE actually injects vs placebo. Measure phase (A/B with vs without per injection) deferred to 5.6.0 with documented prerequisites.

**Infrastructure ready for 5.5.1 A/B patch cycle.** Five A/B items (audit v2 on hardened fixture, Seurat pairwise validation, Forge coverage, Pragmatic hedge-reduction, vibe:reviewer empirical comparison) have fixtures + harnesses complete but A/B execution deferred to a dedicated patch cycle. Infrastructure ship is clean; empirical decisions (default switches) require focused dispatch budget and will ship as 5.5.1.

### 5.5.1 A/B consolidation patch (2026-04-22)

**All six 5.5.0 §11.4 A/B items resolved. Zero default switches.** The patch validates — rather than changes — every skill's model primary. Specifically: `opus-4-7` stays on `/vibe:audit` (A1 Δ=+0.108 coverage-score, below 0.40 threshold), `/vibe:seurat` (A2 opus-4-7 wins 5/5 pairwise, judge cites creative distinctiveness in every rationale), and `/vibe:forge` (A3 Δ=+0.24 coverage). The Pragmatic priming Tier A shell-wrapper opt-in (A4) is empirically validated at **90% hedge-word density reduction** on opus-4-7 over 20 decision-type prompts — Tier A was already shipped as opt-in in 5.5.0, so this is retroactive validation, not a behavior change. The `@vibe:reviewer` agent vs CC's built-in `/ultrareview` comparison (A5) finds them **complementary, not substitutive** — different entry points (mid-dev vs PR), different cost profiles (in-session vs Extra Usage), different memory models — and keeps `@vibe:reviewer` as-is.

**PreToolUse hook contract migration.** Read-discipline and read-before-edit hooks now emit `{"decision": "block", "reason": "..."}` on stdout (exit 0) instead of a bare `{"reason": "..."}` on stderr (exit 2). The 5.5.0 §2.9 fix made stderr non-empty but CC's Edit/Write error channel still reported "No stderr output" — because the current CC hook contract expects the decision object on stdout, matching the Stop-hook pattern. Smoke-tested: the actionable reason ("Read X first" / "partial read blocked") now appears inline in CC's block message. No user action required.

**Harness note (maintainer-side).** The A2 pairwise run uncovered that `claude -p --disable-slash-commands` only blocks user-typed `/cmd` — it does NOT prevent the model from invoking the `Skill` tool autonomously. On seurat-style prompts opus-4-7 invoked the Skill tool and hung for 30+ min via `isolation: worktree`. Fix: `--tools ""` forces text-only generation in the A/B harness. Documented in the maintainer test/model-validation tree.

### 5.5.2 A/B consolidation tail + audit grader v2 (2026-04-22)

**Three pairwise A/B items resolved, zero default switches — same pattern as 5.5.1.** The 5.5.1 CHANGELOG listed baptist / ghostwriter / orson pairwise as "deferred, low priority — no reported quality issues" (§11.4 tail). 5.5.2 executes them and validates the incumbent on all three. `/vibe:baptist`: `opus-4-7` wins **5/5** against `opus-4-6` on the InferenceBox CRO audit fixture — axis 1 (funnel-diagnosis sharpness) decisive in 4/5 pairs, with 4-7 consistently identifying the absolute-volume loss frame while 4-6 pivots to rate anomalies. `/vibe:ghostwriter`: **4/5** for `opus-4-7` — axis 5 (analytical depth) drove wins via fresh scaffolding (drift taxonomies, evaluator hierarchies) that 4-6's drafts don't match. `/vibe:orson`: **4/5** for `opus-4-7` — 4-7 catches the flagship LCP-driving issue (hero missing-poster) that 4-6 misses entirely in 3 of its 4 losses, a systematic detection-coverage gap. All three candidate win rates sit at or below 0.200, well under the 0.30 switch threshold. **No plugin code changes — `plugin/` is byte-identical to 5.5.1 except version strings and this subsection.**

**Audit grader v2 promoted to default (maintainer-side).** The 5.5.1 A1 notes documented a grader-level cross-file regex over-match that both models paid equally (verdict unchanged, fixture-level tax). `tests/model-validation/fixtures/audit-orchestrator-v2/grade.py` is now v2 — tightens four FP classes: (1) answer-key leakage suppression, (2) negative-context suppression for "would be a distractor"-style strings, (3) paragraph-bounded regex scope, (4) line+anchor location disambiguation. v1 archived to `grade-v1-archived.py` for reproducibility of 5.5.1 A1 numbers. Validated on stored transcript to reproduce the prep-doc score prediction exactly. Not shipped — `tests/` is gitignored maintainer infrastructure; documented here because the next audit coverage re-A/B uses v2.

### 5.5.3 Setup autonomy patch (2026-04-22)

**Seven field-report fixes to `/vibe:setup` — zero new features, zero surface expansion — plus one schema fix to the pragmatic agent caught during release test triage.** A marketplace user's first-contact transcript (503 lines of live `/vibe:setup` session) surfaced seven autonomy regressions that the wizard had drifted into over 5.x: a Python traceback on the very first CLAUDE.md classification (bash `false` interpolated into a Python dict literal yielded `NameError: name 'false' is not defined`); a 4-way menu asking about VS Code when the detector had already reported VS Code absent, with three of the four options equivalent; the researcher step promising "~1 minute" but running 35 minutes at 76k tokens on a mid-size project; pragmatic priming shipping as a manual shell-rc edit that silently never activates for most users; a CLAUDE.md case-only path typo spotted by the researcher but only reported as a side-note; `pyright-lsp` recommended but never installed, forcing a post-setup manual `claude plugin install`; and internal tokens (`LEGACY_NO_VIBE_TOKENS`, `MANAGED_REGION_PRESENT`, `Arc Reactor Agnostic`) leaking into user-facing output.

**All seven resolved under the "detection has the answer — apply, don't ask" lock-in.** Reconciler JSON composition rewritten to pass booleans through env vars + `json.loads()`; §5.6 menu now adaptive (auto-apply when the detector resolves the choice, single 2-way prompt only when both vectors are installable); §6 researcher default-on with `VIBE_NO_CODEBASE_MAP=1` opt-out, backgrounded dispatch so Step 7 summary doesn't wait, no duration estimate; §5.7 pragmatic priming auto-extends the `alias claude=...` from §5.6 via a new reconciler subcommand `apply-pragmatic-alias` (idempotent, with backup); §6.5 auto-applies high-confidence CLAUDE.md path corrections from researcher memory, surfaces low-confidence ones as warnings; §2.4 runs `claude plugin install` for each detected language's LSP with fallback to manual recommendation on failure; `cmd_present_diff` and SKILL.md §5.4–§5.5 translate classification modes to human descriptions — "looks user-authored (will not touch)", "has markers from an older VIBE version (will back up and regenerate)" — and drop the internal-jargon passes.

**Plus one pragmatic-agent schema fix (Fix 8).** `plugin/agents/pragmatic.md` shipped in 5.5.0 with a nested `model:` block — an outlier against the flat `model: <tier>` schema every other VIBE agent uses. The agent-frontmatter test caught the drift; it was dismissed as pre-existing for three release cycles. Now flattened to `model: opus` + top-level `effort: xhigh` (same effort value). No behavioral change in the common case; the frontmatter just loads uniformly now.

**Migration from 5.5.2.** Automatic. Re-run `/vibe:setup` to pick up the new flow. Existing settings are preserved; the wizard detects what's already configured and only fills gaps. **Privacy note on the researcher:** the §6 agent reads your project files to build a codebase map. Findings are written to `.claude/agent-memory/vibe-researcher/` (project-local) and your auto-memory (`~/.claude/projects/<slug>/memory/`). Nothing is uploaded. To opt out of mapping entirely, export `VIBE_NO_CODEBASE_MAP=1` before running `/vibe:setup`.

### 5.5.4 Hybrid execution hint (2026-04-22)

**The hybrid execution mode now reaches every VIBE user via a PreToolUse hook.** Until now, the decision logic — Opus inline for creative/small tasks, Sonnet subagents for mechanical bulk, recommended when ≥30% of tasks are each kind AND mechanical tasks are idiot-proof — lived only in the maintainer's auto-memory. Auto-memory does not travel with the marketplace install, so marketplace users never saw the third option. This release ships that logic as a plugin hook: automatic activation on install/upgrade, no `/vibe:setup` re-run.

The hook has two modes. **Proposer** fires when `superpowers:writing-plans` is invoked and tells Claude to write every task idiot-proof (exact paths, complete code, concrete verify commands — no "TBD" or "fill in") and to offer a three-option execution handoff at the end. **Guard** fires when `superpowers:subagent-driven-development` is invoked and tells Claude to audit the plan before dispatching subagents; if any task is vague, abort and recommend inline. Belt-and-suspenders: proposer introduces the option and shapes the plan; guard catches bad dispatches that slip through.

Empirically validated on the VIBE 5.1 self-healing wizard (13 tasks, 5h, 204 tests green — one plan bug caught by a subagent that pure-inline would have missed). Opt-out: `export VIBE_NO_HYBRID_HINT=1`.

### 5.5.5 Read-before-edit false-positive fix (2026-04-22)

Two surgical patches to `plugin/scripts/read-before-edit.sh` resolving spurious blocks reported by users in production. **Patch A — path normalization** via `realpath+expanduser` to handle path-shape mismatch (tilde vs absolute, symlink vs target, double-slash). **Patch B — coverage-equals-file**: a `Read` with `offset in (None, 0)` and `limit >= line_count(file)` now counts as a full read (the comment header promised this since 5.4.0, never implemented). Zero scope-creep — no other script touched, no manifest change.

### 5.5.6 Hybrid-hint manifest quoting (2026-04-22)

Single-line fix in `plugin/hooks/hooks.json:50`: added quoting to the `hybrid-execution-hint` command, missing since 5.5.4 (latent fragility on `CLAUDE_PLUGIN_ROOT` paths with spaces — Windows `~/Username With Space/...` etc). All other VIBE PreToolUse hooks audited live with file paths containing spaces and verified safe — `hybrid-execution-hint` was the only outlier. Diagnostic for upstream user-settings hooks (matcher `TaskCreate`/`ToolSearch` errors not produced by VIBE) documented in the CHANGELOG; auto-fix shipped in 5.5.7.

### 5.5.7 V1 hook auto-cleanup + Write-then-Edit FP (2026-04-22)

Two report-driven fixes. **Fix A:** `read-before-edit.sh` now recognizes `Write` as equivalent to a full read — assistant just wrote the content → knows the file → subsequent `Edit` is safe. Caught while authoring 5.5.7 itself: a Write+Edit sequence on `feedback_user_burden_zero.md` was being blocked legitimately. **Fix B:** `/vibe:setup` now auto-detects and removes residual VIBE v1 (morpheus) hooks from user `~/.claude/settings.json` and project settings — no manual action required, just re-run `/vibe:setup` after upgrade. Closes a User Burden Zero violation: the pre-existing `vibe-v1-cleanup.sh` script handled filesystem-side cleanup but required users to know about it; the reconciler now handles user-settings hooks as part of the standard `detect → diff → present → apply` flow. New schema field `settingsHooksDenyPatterns[]` makes future deprecated-pattern additions a 1-diff JSON change. Backup always created (`settings.json.bak-stale-hooks-YYYYMMDD-HHMMSS`).

## What's New in 5.3

**Side-effect verification Stop hook.** A new `plugin/scripts/side-effect-verify.sh` runs on every Stop event and detects when the assistant commits to a write/save/persist operation in prose — *"I'll save the config now"*, *"let me create the file"*, *"I'm going to update X"* — without actually invoking a `Write`/`Edit`/`NotebookEdit` tool in the same turn. On detection, the hook blocks the stop and feeds back the matched commitment as context — the assistant sees *"you said you'd save X but no Write happened"* on its next turn and reconciles, either by performing the write or correcting the prior message. Reuses the rhetoric-guard Strategy E preprocessing pipeline (fenced blocks, inline backticks, double-quoted strings, markdown link labels stripped) to avoid self-citation false positives. Capped at 1 fire per session. Closes `claude-code#49764`.

**Rhetoric-guard Strategy E v2 + v3 + §14.6 expansion.** The 5.2.1 v1 preprocessing (fenced blocks + inline backticks) is extended with **Stage 2** (strips double-quoted strings — straight `"..."` and curly typographic) and **Stage 2b** (strips markdown link labels), eliminating the last 3/40 false-positive class observed in the S4 re-validation on Opus 4.7. **Stage 3** adds HIGH-risk pattern table + meta-keyword suppression: when a HIGH-risk ownership-dodging pattern's matching paragraph also contains *pattern set*, *rhetoric-guard*, *false positive*, *categories*, the fire is suppressed — the pattern is being discussed, not enacted. **§14.6** adds 9 new VIOLATIONS for semantic-equivalent permission-seeking phrasings (*let me know how you'd like*, *before I proceed*, *awaiting your*, *if you'd like, I can*, etc.) the original 47-pattern set missed. Pattern total: 47 → 56.

**macOS bash 3.2 crash fixed.** Between commit `da61c5c` (2026-04-17) and the 5.3.0 release, github HEAD shipped 5.3.0-wip code under the *5.2.1* version label in `plugin.json` — the un-bumped intermediate. The Strategy E v3 commit added `declare -A HIGH_RISK_PATTERNS` for the meta-keyword suppression table; `declare -A` is a bash 4+ feature, and macOS ships `/bin/bash 3.2.57` as the system shell (Apple refuses GPLv3-licensed bash 4.x), so every Stop event on macOS crashed the hook. Replaced with a pipe-delimited string + glob match — both bash 3.2 compatible. A new regression test in the validation suite rejects `declare -A`, `mapfile`/`readarray`, `${var^^}`/`${var,,}`, `[[ -v ]]`, and `coproc` in any `plugin/scripts/*.sh` file to prevent the entire bash-4-isms class from recurring.

**Subagent refusal detector.** `plugin/scripts/atomic-orchestrator.sh` scans worker output for refusal markers (*MUST refuse*, *harness safety directive*, *safer default*, etc.) verbatim from the `claude-code#49363` thread. Scoped to `TASK_MODE==write` only — the read-only S3 baseline ran 15/15 with zero refusals on Sonnet 4.6, so the scope cap adds zero overhead to the safe lane. On detection, re-dispatches the worker once with a defensive-context preamble. Cap 1 retry. Refusal events logged to `${CLAUDE_PLUGIN_DATA}/atomic/refusal-events.jsonl`. Disable: `VIBE_REFUSAL_DETECTOR_DISABLED=1`.

**`/vibe:setup` thinking-display fix.** The wizard now detects whether the user's `claude` invocation surfaces extended-thinking summaries in the UI and proposes installing a wrapper (`plugin/scripts/cc-thinking-wrapper.sh`) that adds `--thinking-display summarized` by default. Apply scripts target shell (`~/.bashrc`/`~/.zshrc` via marker-bracketed blocks) and VS Code (`claudeCode.claudeProcessWrapper` setting). Idempotent, reversible, and preserves existing user content + any pre-existing alien `claude` alias or wrapper (detected and never overwritten — the user remains in control). Opt-out: `VIBE_NO_THINKING_FIX=1`.

**Security hook false positives.** `rm /tmp/...` operations no longer fire the destructive-command guard (whitelisted via lookahead) — legitimate test cleanup is no longer blocked. The post-edit credential quickscan no longer flags the plugin's own development files when example credential strings appear as documentation in skill SKILL.md or scripts under the active dev path.


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
| **setup** | First-run + upgrade configuration wizard. Self-healing: detects stack, linters, LSP, configures model/effort/status line, generates minimal CLAUDE.md, optionally maps codebase, auto-cleans v1 morpheus hooks (5.5.7), preserves user-authored content via region markers. Re-runnable; converges to the current plugin version's expected state. |
| **spec** | Intelligent spec routing (5.5.0). Classifies the request and dispatches to the optimal Opus variant via hybrid classifier (keyword fast-path → `haiku-4-5` LLM fallback → `opus-4-7` final fallback). Plan-for-executor discipline embedded inline. Env override: `VIBE_SPEC_FORCE_MODEL`. |
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

Not every task needs the most powerful model. VIBE assigns each component the smallest model that preserves quality on representative tasks, validated via blind A/B testing (Tessl-style 880-eval rubric for creative skills since 5.6.1).

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

## Hooks

Twenty-two hook handlers across nine lifecycle events run automatically. Every hook is a mechanical process constraint — a regex or exit-code gate — not a place for semantic judgment (that belongs to the agent and its memory system).

| Hook | When | What it does |
|------|------|-------------|
| **Setup check** | Session start | Silent on normal state. Emits guidance only on anomalies: VIBE settings missing, v1 framework remnants, missing CLAUDE.md, post-compaction recovery (`session-state.md` < 5 min old), and version drift between `~/.claude/vibe-configured` and the installed plugin version on first post-upgrade session. |
| **PreToolUse security** | Before bash commands | Blocks dangerous operations before execution: `rm -rf /`, force push to main, `curl\|bash`, `chmod 777`, database DROP, fork bomb, credential file access, network listeners, kill-all-processes. Exit 2 = block. |
| **Read discipline** | Before Read | Blocks partial Reads on files smaller than 400KB — forces full read so the model has the whole file before making claims. Skip via `VIBE_READ_DISCIPLINE_DISABLED=1` or by mentioning explicit line ranges in the prompt. |
| **Read before edit** | Before Edit/Write | Blocks Edit/Write on a file that hasn't been Read (or Written) in this session at full coverage. Path normalization via `realpath+expanduser` (5.5.5); Write counts as full-read equivalent (5.5.7). Skip via `VIBE_READ_BEFORE_EDIT_DISABLED=1`. |
| **Hybrid execution hint** | Before Skill | Fires on `superpowers:writing-plans` to inject a three-option execution handoff (subagent / inline / hybrid) and on `superpowers:subagent-driven-development` to audit plan idiot-proofness before dispatch. Opt-out: `VIBE_NO_HYBRID_HINT=1`. |
| **Pragmatic priming** | User prompt submit | Default-ON since 5.6.0. Injects a ~30-token Askell-style preamble per turn to reduce hedging + sycophancy on Opus 4.7 (5.5.1 A/B measured 90% hedge-word reduction). Cached via prompt caching. Disable: `VIBE_PRAGMATIC_MODE=0`. |
| **Lint** | After file edit | Detects project linter (eslint, prettier, ruff, black, rustfmt, gofmt) and runs it. Skips if no linter installed for the file type. Exit 2 = block on failure. |
| **Security scan** | After file edit | 31-pattern scan for hardcoded keys (API, AWS AKIA, GCP AIza, Stripe sk_live, GitHub ghp_, Slack xox, JWT, private keys), XSS (`innerHTML`, `document.write`, `dangerouslySetInnerHTML`), injection (eval, SQL interpolation, pickle, yaml.load, subprocess shell=True), credentials (Bearer tokens), misconfig (SSL verify=false, Supabase `USING(true)`), obfuscation (Unicode whitespace, control chars, IFS, jq @system). Exit 2 = block. |
| **Compact save** | Before compaction | Writes a minimal structured snapshot before Claude Code compacts the context window: timestamp, session ID, git branch + status + diff names, and pointers to the authoritative sources (transcript path, `TaskList`, auto-memory). Does not try to summarize — the transcript file is the real record. |
| **Failure loop** | After tool failures | Increments a per-session counter on Bash/Edit/Write failures. Exit 2 at 3 consecutive failures with a replanning message. Resets to 0 on any successful tool use. |
| **Failure reset** | After tool success | Paired with failure loop. Zeroes the counter on successful tool invocations. |
| **Rhetoric guard** | Session stop | Matches the last assistant message against 79 rhetorical patterns (ownership dodging, session-length quitting, permission-seeking mid-task, sycophantic capitulation since 5.6.0) — 54 verbatim from benvanik's production-tested `stop-phrase-guard.sh` plus 25 VIBE-side additions. On match, emits `{"decision":"block","reason":"..."}` with a targeted correction tied to the matched phrase. Rate-capped at 3 fires per session, then fail-open. Per-category disable: `VIBE_RG_CAPITULATION_DISABLED=1`. |
| **Side-effect verify** | Session stop | Detects when the assistant commits to a write/save/persist operation in prose (*"I'll save the config"*) without invoking a `Write`/`Edit`/`NotebookEdit` tool in the same turn. Reuses rhetoric-guard Strategy E preprocessing to avoid self-citation FPs. Capped at 1 fire per session. Closes `claude-code#49764`. |
| **Verify before assert** | Session stop | Log-only by default since 5.6.0. Detects backtick-quoted file/symbol assertions in the final assistant message without preceding Read/Grep/Glob/LS in recent transcript turns (window: last 20). Writes events to `${CLAUDE_PLUGIN_DATA}/verify-before-assert/`. Block mode opt-in via `VIBE_VBA_BLOCK=1`. Disable: `VIBE_VBA_DISABLED=1`. |
| **Atomic enforcement** | Session stop | Validates that atomic-decomposition tasks produced output for every item declared in the manifest. Blocks a completion claim that would leave items unprocessed. |
| **Oracle gate** (5.7.0) | Session stop | Multi-layer analyzer that rhetoric-guard's substring matching cannot cover: (1) HARD — file:line claim cross-referenced against the transcript's prior tool-call window (Read/Grep/Glob/LS/Bash-cat, last 50); (2) SOFT — structural verb without file:line receipt, theater sections (version-tagged + bloat + no receipts + hype, ratio > 0.3), hype phrasing without co-located file:line, ≥3 options without a recommendation. HARD emits `{"decision":"block","reason":"ORACLE: ..."}`; SOFT logs to `${CLAUDE_PLUGIN_DATA}/oracle/oracle-events.jsonl`. Bypass: `VIBE_NO_ORACLE=1`, per-rule `VIBE_ORACLE_RULE_<id>_DISABLED=1`. |
| **Scope-guard** (5.6.2) | Before Bash + Read | Denies cross-project file access — when the session was scoped to project A, blocks reads of `.env`/secrets in unrelated sibling projects. Path-extraction handles literal absolute paths and quoted paths-with-spaces. |
| **ADR surface** (5.7.0) | Before Read + Edit/Write | Surfaces in-source ADR markers (`WHY:` / `DECISION:` / `TRADEOFF:` / `RATIONALE:` / `ADR:` / `REJECTED:`) on the targeted file as `additionalContext`. Cap 10 markers, 120-char truncation. Convention: write `# WHY: chose JWT over sessions for k8s scaling` above non-obvious decisions and VIBE re-surfaces it on every touch. Supports `#`, `//`, `--`, `/*`, `*` styles. Bypass: `VIBE_NO_ADR_SURFACE=1`. |
| **Grep/Glob enrichment** (5.7.0) | Before Grep / Glob | NEW matcher slot. Computes three signals in parallel and emits top-3 files by combined score: path match (`git ls-files | grep -iF`), content match (`rg --files-with-matches -i`), churn (`git log --since=90.days`). Format: `<file> (<N> commits, 90d) — <signal>`. Per-signal 500 ms timeout. Non-git falls back to content-only; missing rg falls back to path-only. Bypass: `VIBE_NO_GREP_ENRICH=1`. |
| **Complexity watch** (5.7.0) | After Edit/Write | Runs `lizard` on the edited file, emits a non-blocking warning when max(CCN) > 10 OR delta vs cached baseline > +3 (delta gate requires a prior baseline). Per-file baseline cached at `${CLAUDE_PLUGIN_DATA}/complexity-baselines/<sha1(path)>.json`. Graceful skip when `lizard` missing or extension non-source. Bypass: `VIBE_NO_CC_WATCH=1`. Optional dep: `pip install lizard`. |
| **Agent memory sync** | Subagent stop | Copies `.claude/agent-memory/vibe-*/` from the subagent's isolated worktree back to the main project, so domain audit agents can persist per-run findings across sessions. Non-blocking. |
| **Session end cleanup** | Session end | Clears per-session state files (`/tmp/vibe-paused-${SESSION_ID}`, atomic-decomp scratch, rhetoric-guard fire counters). |

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
- **Optional:** `pip install lizard` — for the 5.7.0 complexity-watch hook to actually emit warnings. Soft-fail-on-missing: when absent, the hook exits 0 silently; the rest of VIBE keeps working.

## Testing

```bash
bash tests/run-tests.sh
```

Runs 200+ automated tests covering plugin structure, all skills, all agents, hook scripts (PreToolUse security, lint, scan, failure loop, pre-compact, setup check), 31 security patterns, frontmatter validation, and v1 migration cleanup.

## License

MIT

## What VIBE can (and cannot) do

VIBE is armor on top of Claude Code, itself a harness on top of the Claude model.

**VIBE can:**
- Override Claude Code defaults (effort tier, thinking display, adaptive thinking).
- Inject context (CLAUDE.md, skill descriptions, hook reasons) so the model sees project-specific facts on turn one.
- React to model output signals (rhetoric-guard, side-effect-verify, read-discipline) and intervene before bad actions ship.

**VIBE cannot:**
- Force the model to think beyond the ceiling Anthropic's harness exposes.
- Bypass thinking-block redaction.
- Modify Claude Code's hidden system prompt.

Expect VIBE to extract the maximum from the surface Anthropic exposes — not to "fix" a regression inside the harness itself. If you want the raw model to behave differently, that is an Anthropic-side change; what VIBE controls is everything between the model response and your terminal.

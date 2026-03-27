# VIBE Framework

A Claude Code plugin that maximizes output quality. Forces maximum effort, specialized methodologies, and mechanical quality gates.

Claude Code out-of-the-box optimizes for speed and token savings. VIBE inverts this: **quality above all**, even at the cost of more tokens and longer execution. Built for developers on Max 20x who want the best Claude can produce.

## Install

```
/plugin marketplace add TNASRLSB/vibe-framework
/plugin install vibe
/vibe:setup
```

`/vibe:setup` configures your environment in one pass: detects your stack, recommends LSP plugins, sets model to `opus[1m]` with `effort:max`, configures a status line, and optionally maps your codebase. Restart Claude Code after setup for global settings to take effect.

## What's New in v3

VIBE v3 introduces **market intelligence** as a core principle. Instead of asking users questions they can't answer ("who is your target audience? what tone do you want?"), skills now discover the answers through global competitor research.

**Three principles:**

1. **Market intelligence over guesswork** — Ghostwriter, Seurat, and Baptist research how the world's best companies in the user's sector communicate, design, and convert — across 11 languages. This becomes the baseline. The user's differentiation builds on top.

2. **Process discipline over knowledge** — Skills no longer teach copywriting frameworks, design styles, or security concepts Claude already knows. Instead, they enforce mandatory reasoning steps: audience modeling before writing, multiple options before selecting, anti-AI-pattern detection before delivering, sharpening before publishing.

3. **Mechanical quality gates** — Hooks and agents enforce standards deterministically, not through suggestions Claude might skip.

**In numbers:** Reference files trimmed from ~5,900 to ~2,450 lines (-58%) by removing tutorial content and redundant knowledge. Every remaining line is either a process constraint, a detection pattern, a code example, or tool-specific API reference.

## Skills

### Domain Skills

| Skill | What it does |
|-------|-------------|
| **ghostwriter** | Content creation with dual-optimization (SEO + GEO). Global competitor research discovers messaging patterns across 11 languages. Mandatory process: audience modeling, 5 headline options, anti-AI-pattern detection, sharpening pass. 52+ validation rules. |
| **seurat** | UI design systems informed by competitor visual research. Style selection based on what the market does, not a generic menu. Anti-generic-design constraints. 11 visual styles with Factor-X distinctiveness system. WCAG 2.1 AA mandatory on every component. |
| **baptist** | Conversion Rate Optimization with competitor benchmarking. "Your checkout has 6 steps, the top 5 in your sector have 3." B=MAP diagnosis, ICE scoring, A/B experiment design with statistical rigor, funnel analysis. |
| **emmet** | Testing, QA, and debugging. 8 test personas with headed Playwright sessions. Systematic 7-step debugging (comment-out validation mandatory). Tech debt audit. |
| **heimdall** | Security analysis for AI-generated code. OWASP Top 10 with vulnerable/fixed code pairs, BaaS misconfiguration detection (Supabase/Firebase), credential scanning with 25+ API key patterns. |
| **orson** | Programmatic video generation. HTML frames captured by Playwright, encoded with FFmpeg. TTS narration (edge-tts free, ElevenLabs paid), background music, SFX mixing. |
| **scribe** | Office documents and PDFs. Auto-routes by format. Reference files focus on gotchas and non-obvious patterns only — no tutorials. |
| **forge** | Meta-skill for creating and auditing skills. Quality checklist includes "Textbook" anti-pattern: if Claude already knows it, don't put it in a reference file. |

### Shared Protocol

Ghostwriter, Seurat, and Baptist share a **competitor research protocol** (`_shared/competitor-research.md`). It runs once per project, searches across 11 languages (English, Chinese, Spanish, Portuguese, French, Japanese, Korean, Russian, Arabic, Hebrew, Aramaic), and extracts three lenses from each competitor:

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
| **setup** | First-run configuration wizard. Detects stack, linters, LSP, configures model/effort/status line, generates minimal CLAUDE.md, optionally maps codebase. |
| **reflect** | Reviews corrections captured by the hook system. For each, choose: save to project memory, user memory, or discard. `--patterns` mode discovers repeated actions that could become skills. |
| **pause** | Disables all quality hooks for the current session. For rapid prototyping or exploratory coding where hooks get in the way. |
| **resume** | Re-enables quality hooks after pause. |

### Invoking Skills

All skills are invocable as `/vibe:<name>`:

```
/vibe:emmet test              # full testing cycle
/vibe:emmet debug             # systematic 7-step debugging
/vibe:emmet techdebt          # tech debt audit
/vibe:heimdall audit          # full security audit
/vibe:heimdall secrets        # credential scan only
/vibe:seurat brand            # brand identity from competitor landscape
/vibe:ghostwriter write       # content creation with competitor research
/vibe:baptist audit            # conversion audit with competitor benchmarks
/vibe:orson create            # guided video creation
/vibe:scribe create xlsx      # create spreadsheet
/vibe:forge create my-skill   # create a new skill
/vibe:audit                   # project-wide audit
/vibe:reflect --patterns      # discover skill candidates
```

Claude also invokes domain skills automatically when relevant to your task — you don't always need to call them explicitly.

## Agents

Every domain skill has two invocation modes: **interactive** (`/vibe:seurat`) runs in the main conversation, **audit** (`@vibe:seurat` or via `/vibe:audit`) runs autonomously in an isolated worktree with persistent memory.

### General-Purpose Agents

| Agent | Model | Tools | Memory | Purpose |
|-------|-------|-------|--------|---------|
| **reviewer** | Opus | Read-only | Project | Post-implementation code review from a fresh perspective. Runs in separate context — never reviews its own code. Rates findings as Critical/Warning/Suggestion. |
| **researcher** | Opus | Read-only | Project | Deep codebase exploration in isolated worktree. Returns structured findings (architecture, stack, patterns, concerns) without cluttering your main context. |

### Domain Audit Agents

All domain audit agents follow a shared [audit protocol](references/audit-protocol.md): standardized report format, evidence-based findings (no "seems wrong"), severity levels (Critical/Warning/Info), regression detection, and rule proposals.

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

## Hooks

Six hook handlers run automatically, enforcing quality mechanically:

| Hook | When | What it does |
|------|------|-------------|
| **Setup check** | Every session start | Injects VIBE status, reminds about pending corrections, recovers state after context compaction |
| **Lint** | Every file edit | Detects project linter (eslint, prettier, ruff, black, rustfmt, gofmt) and runs it. Blocks on failure. |
| **Security scan** | Every file edit | Regex scan for: hardcoded API keys, `dangerouslySetInnerHTML`, `USING(true)`, `eval()`, hardcoded passwords, public S3 ACLs, `--no-verify`. Blocks on detection. |
| **Compact save** | Before context compaction | Saves modified files, active skills, recent tool calls to a state file. SessionStart hook re-injects this state post-compaction, preventing the documented amnesia problem. |
| **Correction capture** | Every user prompt | Detects correction patterns in 6 languages (EN, IT, ES, FR, DE, PT). Queues them silently for `/vibe:reflect` review. |
| **Failure loop** | After tool failures | Counts consecutive failures. After 3, blocks with: "STOP. Replan from scratch or use /vibe:emmet debug." Resets on next success. |

Use `/vibe:pause` to temporarily disable hooks when they get in the way, `/vibe:resume` to re-enable.

## Self-Learning

VIBE captures your corrections automatically. When you say "no, use tabs not spaces" or "sbagliato, doveva essere così", the correction-capture hook detects the pattern and queues it. Run `/vibe:reflect` to review:

- **Save to project memory** — applies to this project in future sessions
- **Save to user memory** — applies to all your projects
- **Discard** — one-time correction, not worth remembering

`/vibe:reflect --patterns` analyzes your session history to find repeated actions that could become reusable skills, then proposes creating them via Forge.

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
- **Max 20x subscription** recommended (required for `effort:max` and `opus[1m]`)
- **jq** for hook scripts
- **Optional:** Playwright (for Emmet visual testing and Orson video rendering)
- **Optional:** FFmpeg + `pip install edge-tts` (for Orson audio)
- **Optional:** Python 3.6+ (for Scribe document scripts and Heimdall scanners)

## Testing

```bash
bash tests/run-tests.sh
```

Runs 59 automated tests covering plugin structure, all skills, agents, hook scripts, security patterns, failure detection, pause/resume, correction capture, and v1 migration cleanup.

## License

MIT

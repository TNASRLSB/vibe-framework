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

## Why This Exists

Claude Code defaults to medium effort on Max subscriptions. It skips verification. It forgets corrections between sessions. It gets stuck retrying the same failing approach. It writes code with hardcoded API keys if you ask it to.

VIBE fixes these with three layers:

**1. Skills** — domain-specific methodologies that encode expert knowledge. Not generic instructions, but complete workflows with numbered phases, verification steps, and reference material loaded on-demand. When Claude uses Emmet to debug, it follows a systematic 7-step process. When it uses Heimdall to audit security, it checks against OWASP Top 10 patterns and scans for the 3 most common AI-generated vulnerabilities.

**2. Hooks** — mechanical quality gates that run on every action. A shell script that scans for hardcoded API keys can't be persuaded to skip the check. A failure counter that blocks after 3 consecutive failures can't be reasoned away. These aren't suggestions Claude might ignore — they're deterministic enforcement.

**3. Agents** — independent reviewers that run in separate context. The reviewer agent hasn't seen the implementation, so it can't exhibit self-review bias. The researcher agent explores in an isolated worktree, so it doesn't pollute your main context. The guardian agent has Heimdall's full security methodology preloaded.

## Skills

### Domain Skills

| Skill | What it does |
|-------|-------------|
| **seurat** | UI design system generation. 11 visual styles, 6 page archetypes, brand identity workflow, WCAG verification. Every component gets an accessibility pass. |
| **emmet** | Testing, QA, and debugging. 8 test personas with headed Playwright sessions. Systematic 7-step debugging workflow. Tech debt audit. The "comment out the fix, verify tests fail" rule is mandatory. |
| **heimdall** | Security analysis for AI-generated code. OWASP Top 10, BaaS misconfiguration detection (Supabase/Firebase), credential scanning with 25+ API key patterns, Trail of Bits integration. |
| **ghostwriter** | Dual-optimization content: SEO for Google + GEO for AI search (ChatGPT, Perplexity, Claude). 6 copywriting frameworks, 52+ validation rules, structured data templates. |
| **baptist** | Conversion Rate Optimization. Fogg B=MAP diagnostics (Motivation, Ability, Prompt), ICE scoring, A/B experiment design with sample size calculation, funnel analysis. |
| **orson** | Programmatic video generation. HTML frames captured by Playwright, encoded with FFmpeg. TTS narration (edge-tts free, ElevenLabs paid), background music, SFX mixing. |
| **scribe** | Office documents and PDFs. Auto-routes by format. XLSX with formulas and charts, DOCX with styles and TOC, PPTX with slide masters, PDF creation and extraction. Includes Python scripts for OOXML manipulation. |
| **forge** | Meta-skill for creating and auditing skills. Updated for v2 skill format with frontmatter spec, quality checklist, and starter templates. |

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
/vibe:seurat brand            # brand identity workflow
/vibe:ghostwriter write       # content creation
/vibe:baptist audit           # B=MAP conversion audit
/vibe:orson create            # guided video creation
/vibe:scribe create xlsx      # create spreadsheet
/vibe:forge create my-skill   # create a new skill
/vibe:reflect --patterns      # discover skill candidates
```

Claude also invokes domain skills automatically when relevant to your task — you don't always need to call them explicitly.

## Agents

| Agent | Model | Tools | Memory | Purpose |
|-------|-------|-------|--------|---------|
| **reviewer** | Opus | Read-only | Project | Post-implementation code review from a fresh perspective. Runs in separate context — never reviews its own code. Rates findings as Critical/Warning/Suggestion. |
| **researcher** | Opus | Read-only | Project | Deep codebase exploration in isolated worktree. Returns structured findings (architecture, stack, patterns, concerns) without cluttering your main context. |
| **guardian** | Opus | Read-only + Heimdall | Project | Security and quality audit. Has Heimdall's full methodology preloaded. Checks OWASP, secrets, BaaS configs, input validation. Rates findings Critical/High/Medium/Low. |

All agents persist memory across sessions — they accumulate knowledge about your specific project over time.

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

Runs 53 automated tests covering plugin structure, all skills, agents, hook scripts, security patterns, failure detection, pause/resume, and correction capture.

## License

MIT

# VIBE Framework 2.0 — Design Specification

**Date:** 2026-03-26
**Status:** Draft
**Author:** Claude + User
**Replaces:** VIBE Framework v0.5.1

---

## 1. Identity and Philosophy

VIBE Framework 2.0 is a Claude Code plugin that maximizes output quality by forcing maximum effort, specialized methodologies, and mechanical quality gates.

### Core principle

Claude Code out-of-the-box is optimized for speed and token savings. The VIBE Framework inverts this priority: **quality above all**, even at the cost of more tokens and longer execution.

### 3 Pillars

1. **Specialized skills** — deep methodologies for specific domains (UI, testing, security, copy, CRO, video, documents)
2. **Quality enforcement** — hooks that catch errors mechanically, agents that review in separate sessions, self-learning that captures corrections
3. **Maximum intelligence** — effort:max on everything, opus[1m] as default, zero shortcuts

### What the framework is NOT

- Not an instruction manual for Claude (minimal CLAUDE.md)
- Not a bureaucratic tracking system (no request log, no manual registry)
- Not a context monitor (Morpheus eliminated, native auto-compaction suffices)

### Target user

Max 20x subscribers who want the highest possible quality and don't care about hitting rate limits faster.

---

## 2. Architecture

The framework is a **Claude Code plugin** distributed via marketplace.

```
vibe-framework/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── setup/SKILL.md
│   ├── reflect/SKILL.md
│   ├── pause/SKILL.md
│   ├── resume/SKILL.md
│   ├── seurat/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── emmet/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   ├── heimdall/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── patterns/
│   │   └── scripts/
│   ├── ghostwriter/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── baptist/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── orson/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── engine/
│   ├── scribe/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   └── forge/
│       ├── SKILL.md
│       └── references/
├── agents/
│   ├── reviewer.md
│   ├── researcher.md
│   └── guardian.md
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── setup-check.sh
│   ├── post-edit-lint.sh
│   ├── security-quickscan.sh
│   ├── pre-compact-save.sh
│   ├── correction-capture.sh
│   └── failure-loop-detect.sh
└── settings.json
```

### Plugin manifest

```json
{
  "name": "vibe",
  "version": "2.0.0",
  "description": "Quality-first framework for Claude Code. Specialized skills, quality gates, and maximum intelligence.",
  "author": {
    "name": "DKHBSFA"
  },
  "repository": "https://github.com/DKHBSFA/vibe-framework",
  "license": "MIT",
  "keywords": ["quality", "testing", "security", "ui-design", "seo", "cro", "video", "documents", "framework"]
}
```

### Component summary

| Component | Count | Role |
|---|---|---|
| Skills | 12 (8 domain + setup + reflect + pause + resume) | Specialized methodologies with effort:max |
| Agents | 3 | Review, research, security in isolated context |
| Hooks | 7 handlers across 5 events | Mechanical quality gates |
| Scripts | 6 | Logic for command hooks (Stop uses prompt hook, no script) |

### Namespace

All skills invocable as `/vibe:seurat`, `/vibe:emmet`, etc. Agents as `vibe:reviewer`, `vibe:researcher`, `vibe:guardian`.

### What is eliminated from v1

| v1 Component | v2 Status | Reason |
|---|---|---|
| CLAUDE.md (298 lines) | Eliminated from framework | Framework lives in plugin, not CLAUDE.md |
| `.claude/docs/registry.md` | Eliminated | Native auto-memory does the same, better |
| `.claude/docs/request-log.md` | Eliminated | Bureaucracy, git history suffices |
| `.claude/docs/decisions.md` | Eliminated | Auto-memory captures decisions naturally |
| `.claude/docs/glossary.md` | Eliminated | Not needed as separate file |
| `.claude/docs/workflows.md` | Eliminated | Workflows live in skills |
| `.claude/docs/checklist.md` | Eliminated | Checks are mechanical hooks now |
| `.claude/docs/session-notes/` | Eliminated | Native auto-memory |
| `.claude/docs/specs/` | Eliminated | Native plan mode + brainstorming skill |
| `.claude/docs/bugs/` | Eliminated | Issue tracker or native task list |
| `.claude/morpheus/` | Eliminated | Native auto-compaction + native status line |
| `.claude/rules/` | Eliminated | Rules live in skills and hooks |
| `vibe-framework.sh` (774 lines) | Eliminated | Plugin system replaces the installer |
| "PROCEED" gate | Eliminated | Native plan mode, zero artificial friction |
| KNOWLEDGE.md per skill | Eliminated | Content goes in thematic references |

---

## 3. Skill Design Principles

Every v2 skill follows these principles.

### Standard frontmatter

```yaml
---
name: <skill-name>
description: <when to use — Claude uses this to decide>
effort: max
model: opus
disable-model-invocation: false
---
```

### Standard file structure

```
skill-name/
├── SKILL.md          # <500 lines. Overview, workflow, commands
├── references/       # Loaded on-demand (not at launch)
│   ├── topic-a.md
│   └── topic-b.md
└── scripts/          # Executable scripts (if needed)
    └── tool.py
```

### Writing principles

1. **SKILL.md is the navigator** — says what to do and when to read references. Does not contain all know-how.
2. **References are the know-how** — loaded only when needed, don't burn context.
3. **Every skill has a clear workflow** — numbered phases, defined outputs, completion criteria.
4. **Verification built-in** — every workflow ends with verification. Never claim "done" without check.
5. **Self-review prevention** — for critical reviews, delegate to a separate agent (reviewer or guardian), never self-evaluate.

---

## 4. Agents

### Reviewer — Post-implementation code review

```yaml
---
name: reviewer
description: Reviews code for quality, bugs, edge cases. Use after implementing features or fixing bugs. Provides critical review from a fresh perspective.
model: opus
effort: max
tools: Read, Grep, Glob, Bash
memory: project
---
```

- **When:** after every significant implementation
- **Why:** solves "self-review bias" — runs in separate context, hasn't seen the implementation, judges code as if written by someone else
- **Memory:** accumulates project-specific patterns, recurring errors, conventions across sessions
- **Read-only:** cannot modify code, only report findings

### Researcher — Deep codebase exploration

```yaml
---
name: researcher
description: Explores codebases in depth. Use before implementing features, when onboarding to new projects, or when investigating complex systems.
model: opus
effort: max
tools: Read, Grep, Glob, Bash
memory: project
isolation: worktree
---
```

- **When:** before implementing, to understand architecture and existing patterns
- **Why:** solves "infinite exploration fills context" — research happens in isolated context, only summary returns
- **Isolation:** works on isolated worktree copy, zero risk
- **Memory:** accumulates codebase map across sessions

### Guardian — Security + quality audit

```yaml
---
name: guardian
description: Security and quality auditor. Use before commits, deploys, or when touching auth, payments, or user data. Combines security scanning with code quality analysis.
model: opus
effort: max
tools: Read, Grep, Glob, Bash
skills:
  - heimdall
memory: project
---
```

- **When:** before commits on critical code paths (auth, payments, user data)
- **Why:** combines Heimdall methodology (security) with qualitative review in one specialized agent
- **Preloaded skill:** has full Heimdall security methodology injected into context
- **Memory:** remembers vulnerabilities found and project-specific patterns

---

## 5. Hooks and Quality Gates

### 5.1 SessionStart: Setup Check

**Script:** `setup-check.sh`
**Purpose:** Detect if user has completed `/vibe:setup`. Inject appropriate context.

Behavior:
- Checks if `~/.claude/settings.json` contains VIBE configuration (model, effort env var)
- Counts pending corrections in `${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl`
- Checks for recent session-state.md (< 5 min = likely post-compaction recovery)
- If setup not done: injects "Run /vibe:setup for full configuration"
- If setup done: injects "VIBE Framework active. Quality-first mode. Effort: max."
- If pending corrections: injects "You have N pending learnings. Run /vibe:reflect to review."
- If post-compaction state found: injects saved state (active skills, current workflow phase, files modified)

### 5.2 PostToolUse: Post-Edit Lint

**Script:** `post-edit-lint.sh`
**Matcher:** `Edit|Write`
**Purpose:** Run project linter on every file modification.

Behavior:
- Extracts file path from hook input JSON
- Detects linter from project context: eslint, prettier, ruff, black, rustfmt, gofmt
- Runs linter on the specific file modified
- Exit 0: lint passes, continue silently
- Exit 2: lint fails, block with error details so Claude fixes before proceeding

### 5.3 PostToolUse: Security Quickscan

**Script:** `security-quickscan.sh`
**Matcher:** `Edit|Write`
**Purpose:** Lightweight regex scan for obvious security vulnerabilities on every file write.

Detects:
- Hardcoded API keys and secrets (patterns: `sk-`, `api_key = "`, `Bearer ` in source)
- `dangerouslySetInnerHTML` in React/JSX
- `USING (true)` in Supabase/Firebase policies
- Hardcoded credentials in connection strings
- `eval()` with user input
- `--no-verify` in git commands
- Public S3 bucket ACLs

Behavior:
- Exit 0: no issues found
- Exit 2: blocks with description of vulnerability and remediation suggestion

### 5.4 PreCompact: State Preservation

**Script:** `pre-compact-save.sh`
**Purpose:** Save critical state before context compaction to prevent the documented amnesia problem.

Saves to `${CLAUDE_PLUGIN_DATA}/session-state.md`:
- Files modified in the current session (from `git diff --name-only`)
- Active skills and current workflow phase (extracted by parsing `tail -200` of `transcript_path` JSONL for recent Skill tool invocations)
- Recent key tool calls (last 20 from transcript tail)
- Timestamp for freshness detection

The script receives `transcript_path` in the hook input JSON, which points to the session's JSONL transcript file. It parses the tail of this file to reconstruct recent context — this is not magic, it's grep/jq on structured log data.

The SessionStart hook detects this file and re-injects state post-compaction if the file is recent (< 5 minutes old, indicating a compaction just happened rather than a new session).

### 5.5 Stop: Verification Gate

**Type:** prompt hook
**Purpose:** Block Claude from claiming work is complete without showing evidence.

Prompt evaluates the last assistant message. Distinguishes between:
- **Task completion claims** ("the feature is done", "bug is fixed", "all tests pass", "implementation complete") → blocks without evidence (test output, verification command, screenshot)
- **Single action reports** ("file updated", "test executed", "commit created", "installed dependency") → always allows, these are progress updates not completion claims

Prompt:
> "Review the last assistant message. Is it claiming that a TASK or FEATURE is complete, fixed, done, or passing? Single action reports like 'file updated' or 'commit created' are NOT completion claims — allow those. Only block if the message claims a multi-step task is finished without showing verification evidence (test output, command results, or screenshots). If blocking: {\"decision\": \"block\", \"reason\": \"Verification required before claiming task completion. Run tests or show evidence.\"}. If allowing: {\"decision\": \"allow\"}."

### 5.6 UserPromptSubmit: Correction Capture

**Script:** `correction-capture.sh`
**Purpose:** Detect when user corrects Claude and queue the correction for learning.

Detects correction patterns in multiple languages:

| Language | Patterns |
|---|---|
| English | "no, use X not Y", "don't do X", "I told you to...", "not like that", "actually...", "wrong, it should be..." |
| Italian | "no, usa X non Y", "non fare X", "ti avevo detto", "non così", "sbagliato", "doveva essere..." |
| Spanish | "no, usa X no Y", "no hagas X", "te dije que...", "así no", "está mal..." |
| French | "non, utilise X pas Y", "ne fais pas X", "je t'avais dit...", "pas comme ça..." |
| German | "nein, benutze X nicht Y", "mach das nicht", "ich hatte gesagt...", "nicht so..." |
| Portuguese | "não, use X não Y", "não faça X", "eu disse para...", "assim não..." |

Pattern detection is conservative — false positives are acceptable because they get filtered during `/vibe:reflect` review. The pattern list is extensible via a JSON config file at `${CLAUDE_PLUGIN_DATA}/correction-patterns.json`.

Saves to `${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl`:
```json
{"timestamp": "ISO-8601", "correction": "user prompt text", "session_id": "..."}
```

Silent operation — zero friction for the user.

### 5.7 PostToolUseFailure: Failure Loop Detection

**Script:** `failure-loop-detect.sh`
**Matcher:** `Bash|Edit|Write`
**Purpose:** Detect when Claude is stuck in a loop retrying the same failing approach.

Behavior:
- Maintains counter in `/tmp/vibe-failures-{session_id}`
- Increments on each failure
- After 3 consecutive failures on the same tool type:
  - Exit 2: "STOP. You have failed 3 times consecutively. Do not retry the same approach. Replan from scratch or ask the user."
- Counter resets to 0 on any successful PostToolUse

### Complete hooks.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/setup-check.sh",
            "statusMessage": "VIBE: checking configuration..."
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/post-edit-lint.sh",
            "statusMessage": "Lint check..."
          },
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/security-quickscan.sh",
            "statusMessage": "Security scan..."
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/pre-compact-save.sh",
            "statusMessage": "Saving state..."
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the last assistant message. Did it claim work is 'done', 'complete', 'fixed', or 'passing' without showing evidence (test output, verification command, screenshot)? If yes, respond with {\"decision\": \"block\", \"reason\": \"Verification required before claiming completion. Run tests or show evidence.\"}. If evidence was provided, respond with {\"decision\": \"allow\"}.",
            "timeout": 15
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/correction-capture.sh",
            "statusMessage": "Checking for learnings..."
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/failure-loop-detect.sh",
            "statusMessage": "Tracking failures..."
          }
        ]
      }
    ]
  }
}
```

---

## 6. Skill: `/vibe:setup`

```yaml
---
name: setup
description: First-run configuration for VIBE Framework. Configures Claude Code for maximum quality output.
effort: max
disable-model-invocation: true
---
```

### Workflow

```
Step 1: Diagnosis
├── Read ~/.claude/settings.json (user)
├── Read .claude/settings.json (project, if exists)
├── Detect: current model, effort, env vars
├── Detect: OS, shell, available linters (eslint, prettier, ruff, etc.)
└── Detect: project stack (package.json, requirements.txt, Cargo.toml, etc.)

Step 2: LSP Detection
├── Detect primary project language
├── Check if corresponding LSP plugin is installed
├── If not: recommend installation with specific command
└── Check if language server binary is in PATH

Step 3: Status Line
├── Propose status line configuration:
│   context: percentage + bar
│   model: name + effort level
│   cost: session cost estimate
└── Configure via settings

Step 4: Proposal
├── Show current config vs recommended
├── Recommend:
│   ├── model: "opus[1m]"
│   ├── env.CLAUDE_CODE_EFFORT_LEVEL: "max"
│   └── Stack-specific linter path for post-edit hook
└── Ask user confirmation before touching any file

Step 5: Application (with user approval)
├── Update ~/.claude/settings.json with model + env
├── If project has linter: configure path for post-edit-lint hook
└── Generate minimal project CLAUDE.md (if none exists):
    # [Project Name]
    Build: `<detected command>`
    Test: `<detected command>`
    Lint: `<detected command>`

Step 6: Codebase Mapping (optional)
├── "Want me to map the codebase? I'll launch the researcher agent
│    to explore architecture, patterns, and structure.
│    Results are saved to auto-memory for all future sessions."
├── If yes: invoke @vibe:researcher with structured prompt
│   ├── Identify: entry points, architecture, patterns
│   ├── Identify: framework, key libraries, conventions
│   ├── Identify: test setup, CI/CD, deploy
│   └── Save to structured auto-memory
└── If no: skip, user can run later

Step 7: Verification
├── Confirm all changes applied
├── Inform: "Restart Claude Code to activate global effort max"
└── Inform: "Skills and hooks are already active"
```

### Properties

- **Detects stack** — doesn't ask "what linter do you use?", finds it
- **Non-destructive** — preserves existing settings, adds only what's missing
- **Minimal CLAUDE.md** — only build/test/lint commands, no philosophy
- **Idempotent** — safe to rerun, detects what's already configured

---

## 7. Skills: `/vibe:pause` and `/vibe:resume`

Escape hatch for when hooks are in the way during rapid prototyping, exploratory editing, or brainstorming in code.

```yaml
---
name: pause
description: Temporarily disable VIBE quality hooks for the current session.
disable-model-invocation: true
---
```

```yaml
---
name: resume
description: Re-enable VIBE quality hooks for the current session.
disable-model-invocation: true
---
```

**Mechanism:** Both skills write/remove a flag file at `/tmp/vibe-paused-{session_id}`. All hook scripts check for this file as their first operation — if it exists, they exit 0 immediately (no-op). This pauses all quality gates without uninstalling or disabling the plugin.

- `/vibe:pause` creates the flag file and confirms: "VIBE hooks paused for this session. Quality gates disabled. Run /vibe:resume to re-enable."
- `/vibe:resume` removes the flag file and confirms: "VIBE hooks resumed. Quality gates active."
- The flag is session-scoped (uses session_id in filename) and lives in /tmp, so it auto-cleans on reboot.
- The SessionStart hook ignores the pause flag (always runs) so the framework status is always injected.

---

## 8. Skill: `/vibe:reflect`

```yaml
---
name: reflect
description: Review captured corrections and turn them into permanent learnings.
effort: max
disable-model-invocation: true
---
```

### Capture cycle

```
Capture (automatic, UserPromptSubmit hook)
├── User writes: "no, use pnpm not npm"
├── Hook detects correction pattern
├── Saves to ${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl
└── Silent, zero friction

Notification (automatic, SessionStart hook)
├── setup-check.sh counts pending corrections
├── If > 0: injects "You have N pending learnings. Run /vibe:reflect to review."
└── Suggests, doesn't force

Review (manual, /vibe:reflect)
├── Shows each correction with original context
├── For each, proposes:
│   a) Save to project auto-memory (project-specific)
│   b) Save to user auto-memory (cross-project)
│   c) Discard (one-time correction)
├── User approves/discards per item
└── Clears processed queue

Pattern discovery (manual, /vibe:reflect --patterns)
├── Analyzes recent session history
├── Identifies repeated actions that could become skills
│   e.g.: "You asked 'review this PR' 8 times → skill candidate"
├── Proposes creating new skills via Forge
└── Suggestions only, user decides
```

---

## 9. Domain Skills

### 9.1 SEURAT — UI Design System

```yaml
---
name: seurat
description: UI design system generation, wireframing, page layout, brand identity, and WCAG accessibility. Use when building interfaces, components, forms, dashboards, or any frontend work.
effort: max
model: opus
---
```

**Workflow:** Discover context → Define design tokens → Generate components → Compose pages → Verify accessibility

**Key content:**
- 11 visual styles (Flat, Brutalism, Neumorphism, Skeuomorphism, Spatial, Y2K, etc.)
- 6 page archetypes
- Brand identity as primary flow
- Every output includes automatic WCAG verification
- References: styles/, archetypes/, accessibility/, brand/

**Changes from v1:** Eliminates fuzzy-weight matrix system (overengineered). Keeps visual styles and archetypes as on-demand references. Adds brand identity as main flow.

### 9.2 EMMET — Testing & QA

```yaml
---
name: emmet
description: Testing, debugging, tech debt audit, and code quality. Use when writing tests, finding bugs, debugging code, auditing quality, or doing pre-deploy checks.
effort: max
model: opus
---
```

**Workflows:**

Testing: Map codebase functions → Plan test strategy → Unit tests → Static analysis → Visual tests (headed, per-persona) → Report

Debugging (systematic):
```
1. Reproduce    → Confirm the bug exists, define exact reproduction steps
2. Isolate      → Narrow down to smallest failing case
3. Hypothesize  → Form 2-3 hypotheses about root cause
4. Verify       → Test each hypothesis with targeted investigation
5. Fix          → Implement minimal fix for confirmed root cause
6. Validate     → Comment out fix, verify test fails. Restore fix, verify test passes.
7. Prevent      → Add regression test, document if non-obvious
```
This workflow is the complement to the failure-loop-detect hook: the hook stops Claude after 3 failures, Emmet's debug workflow provides the method to break out of the loop systematically.

**8 Default personas for experiential testing:**

| # | Persona | Profile | Tests |
|---|---|---|---|
| 1 | First-timer | Never seen the product, no context, impatient | Onboarding, UI clarity, time-to-first-value |
| 2 | Power user | Daily user, knows shortcuts | Edge cases, performance, complex workflows |
| 3 | Non-tech | 55+, low digital literacy, large fonts | Accessibility, clear language, error recovery |
| 4 | Mobile-only | Budget Android, slow connection | Responsive, touch targets, performance, offline |
| 5 | Screen reader | Blind user with NVDA/VoiceOver | ARIA labels, focus order, alt text, form flow |
| 6 | Distracted | Multitasking, interrupts often, returns after hours | State preservation, auto-save, recovery |
| 7 | Hostile | Tries to break everything: malformed input, SQLi, XSS | Input validation, error handling, security |
| 8 | International | RTL language, special chars in names, different timezone | i18n, UTF-8, date/time, RTL layout |

**Visual testing:**
- Launches Playwright in headed mode or via Chrome MCP
- Each persona has specific viewport, user agent, and network conditions
- Automatic screenshots at each critical flow step
- Visual comparison between screenshots and expectations
- Output includes annotated screenshots in report

**Key changes from v1:**
- Personas properly implemented with headed visual testing
- "Comment out the fix, verify tests fail" as mandatory step
- No mocks by default (community lesson: mock/prod divergence)
- References: strategies/, checklists/, personas/, templates/

### 9.3 HEIMDALL — Security

```yaml
---
name: heimdall
description: Security analysis for AI-generated code. Detects vulnerabilities, credential exposure, BaaS misconfigurations, and OWASP Top 10.
effort: max
model: opus
---
```

**Workflow:** Pre-scan (pattern matching) → Deep audit (context-aware) → Report with severity → Remediation

**Key content:**
- OWASP Top 10 patterns
- BaaS misconfiguration detection (Supabase, Firebase)
- Credential and secret scanning
- 3 most common community-documented patterns: leaked API keys in frontend, public database policies, XSS via dangerouslySetInnerHTML
- Trail of Bits patterns (CodeQL, Semgrep integration)
- JSON pattern database maintained across versions

**Relationship with hooks:** Heimdall is the deep audit. The security-quickscan hook is the lightweight trip-wire. They complement each other — hook catches obvious issues in real-time, Heimdall does thorough analysis on demand.

**References:** owasp/, baas/, credentials/, patterns/

### 9.4 GHOSTWRITER — SEO + GEO + Copywriting

```yaml
---
name: ghostwriter
description: Dual-platform search optimization (SEO + GEO for AI search) and persuasive copywriting.
effort: max
model: opus
---
```

**Workflow:** Research intent → Structure content → Write with SEO+GEO rules → Apply copywriting frameworks → Validate (52+ rules) → Optimize

**Key changes from v1:** Unified workflow replacing the rigid seo/geo/copywriting separation. Content optimized for both channels simultaneously. References remain thematically divided.

**References:** seo/, geo/, copywriting/, validation/

### 9.5 BAPTIST — CRO

```yaml
---
name: baptist
description: Conversion Rate Optimization. Diagnoses conversion problems, designs A/B experiments, analyzes funnels using Fogg B=MAP model.
effort: max
model: opus
---
```

**Workflow:** Audit page/funnel → Diagnose with B=MAP → Prioritize with ICE scoring → Design experiment → Analyze results

**Key changes from v1:** Keeps core (B=MAP, ICE scoring). Eliminates rigid output templates. Adds explicit integration with Ghostwriter (for variant copy) and Seurat (for variant UI).

**References:** frameworks/, experiments/, analytics/

### 9.6 ORSON — Video

```yaml
---
name: orson
description: Programmatic video generation with frame-addressed animations, rendered via Playwright + FFmpeg.
effort: max
model: opus
---
```

**Workflow:** Define storyboard → Generate HTML frames → Add animations → Generate audio (TTS) → Render with FFmpeg → Preview

**Engine:** TypeScript + Python audio engine preserved from v1 but audited by Emmet v2 before migration (unit tests, static analysis, tech debt audit, Heimdall security scan). All issues found are fixed before SKILL.md rewrite.

**References:** components/, audio/, rendering/, recipes/

### 9.7 SCRIBE — Office & PDF

```yaml
---
name: scribe
description: Create, read, edit Office documents (xlsx, docx, pptx) and PDFs.
effort: max
model: opus
---
```

**Workflow:** Detect format → Route to format-specific handler → Generate/Edit → Validate → Output

**Key changes from v1:** Keeps auto-routing and Python scripts (recalc, thumbnail, pack/unpack). Simplifies SKILL.md eliminating cross-format redundancy.

**References:** xlsx/, docx/, pptx/, pdf/

### 9.8 FORGE — Meta-skill

```yaml
---
name: forge
description: Create, audit, and improve Claude Code skills.
effort: max
model: opus
disable-model-invocation: true
---
```

**Workflow:** Analyze need → Design skill structure → Write SKILL.md + references → Test → Audit quality

**Key changes from v1:** Updated for v2 skill format (new frontmatter, supporting files, context:fork, agent integration). Quality checklist reflects VIBE v2 principles. `disable-model-invocation: true` because creating skills is a deliberate action.

**References:** anatomy/, quality/, templates/

---

## 10. Installation Flow

```
1. /plugin marketplace add DKHBSFA/vibe-framework
2. /plugin install vibe@DKHBSFA-vibe-framework
3. /reload-plugins
   → SessionStart hook fires → "Run /vibe:setup for full configuration"
4. /vibe:setup
   → Diagnoses environment
   → Recommends LSP plugin
   → Configures status line
   → Proposes settings changes (model, effort, linter)
   → Applies with user approval
   → Optionally maps codebase via researcher agent
   → Informs: restart needed for global effort max
5. Restart Claude Code
   → SessionStart hook fires → "VIBE Framework active. Quality-first mode."
6. Every future session: full quality enforcement active
```

---

## 11. Implementation Strategy

### Phase 0: Backup
- Full backup of v1 framework before any work begins
- Backup preserved for post-implementation comparison to recover any lost value

### Phase 1: Plugin skeleton
- plugin.json manifest
- hooks/hooks.json with all 7 hooks
- All 7 scripts (shell)
- settings.json
- Verify: install, reload, hooks fire correctly

### Phase 2: Setup and Reflect skills
- /vibe:setup complete workflow
- /vibe:reflect complete workflow
- Verify: end-to-end setup flow works

### Phase 3: Agents
- reviewer.md, researcher.md, guardian.md
- Verify: each agent invocable, memory works, isolation works

### Phase 4: Domain skills (rewrite from scratch)
- Each skill written fresh with v2 principles
- Order: Emmet first (needed to test others), then Heimdall, Seurat, Ghostwriter, Baptist, Scribe, Forge
- Orson last (engine audit with Emmet v2 first)

### Phase 5: Orson engine audit
- Run Emmet on the TypeScript+Python engine
- Run Heimdall security scan
- Fix all issues
- Then rewrite Orson SKILL.md and references

### Phase 6: Cross-skill integration test
- Verify all skills work together
- Verify hooks don't conflict
- Verify agents delegate correctly
- Verify self-learning cycle works end-to-end

### Phase 7: v1 comparison
- Read v1 backup
- Identify any valuable content lost in rewrite
- Recover and integrate if warranted

### Phase 8: Distribution
- Set up marketplace
- Write README
- CHANGELOG
- First release: v2.0.0

---

## 12. Success Criteria

The framework is complete when:

1. All 12 skills work independently and together
2. All 3 agents invoke correctly with memory persistence
3. All 7 hooks fire reliably without false positives
4. `/vibe:setup` configures a fresh environment in one pass
5. `/vibe:reflect` captures and processes corrections end-to-end
6. Post-compaction state recovery works (skills, workflow phase, files)
7. Failure loop detection stops Claude after 3 consecutive failures
8. Security quickscan catches the 3 most common vulnerability patterns
9. Verification gate blocks unsubstantiated completion claims
10. Post-edit lint runs the correct linter for the project stack
11. The entire framework fits in a single plugin installable with `/plugin install`
12. `/vibe:pause` and `/vibe:resume` correctly toggle all hook behavior per-session
13. Correction capture detects patterns in at least 6 languages
14. Emmet's debugging workflow breaks failure loops with systematic method
15. No component from v1 that provided real value was lost without replacement

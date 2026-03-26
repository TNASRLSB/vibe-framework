# VIBE Framework 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the VIBE Framework as a Claude Code plugin with 12 skills, 3 agents, 7 hooks, and self-learning — maximizing output quality for Max 20x subscribers.

**Architecture:** Single Claude Code plugin distributed via marketplace. All framework logic lives in the plugin (skills/, agents/, hooks/, scripts/). No CLAUDE.md, no .claude/docs/, no Morpheus. The user's project stays clean.

**Tech Stack:** Shell scripts (bash) for hooks, YAML frontmatter + Markdown for skills/agents, JSON for patterns and config, jq for JSON parsing in hooks. Orson engine: TypeScript + Python (preserved from v1).

**Spec:** `docs/superpowers/specs/2026-03-26-vibe-framework-v2-design.md`

---

## Task 1: Backup v1 Framework

**Files:**
- Read: entire project directory
- Create: `../vibe-framework-v1-backup/` (sibling directory)

- [ ] **Step 1: Create full backup of v1**

```bash
cp -r "/home/uh1/VIBEPROJECTS/VIBE FRAMEWORK" "/home/uh1/VIBEPROJECTS/vibe-framework-v1-backup"
```

- [ ] **Step 2: Verify backup integrity**

```bash
diff -rq "/home/uh1/VIBEPROJECTS/VIBE FRAMEWORK/.claude/skills" "/home/uh1/VIBEPROJECTS/vibe-framework-v1-backup/.claude/skills" | head -5
```

Expected: no differences or only `.git` differences.

- [ ] **Step 3: Commit current state**

```bash
cd "/home/uh1/VIBEPROJECTS/VIBE FRAMEWORK"
git add -A
git status
```

If there are uncommitted changes, commit them as "chore: snapshot v1 state before v2 rewrite".

---

## Task 2: Clean Project for Plugin Structure

**Files:**
- Remove: `.claude/docs/`, `.claude/morpheus/`, `.claude/rules/`, `.claude/skills/`, `.claude/settings/`
- Remove: `CLAUDE.md`, `vibe-framework.sh`, `RELEASING.md`, `CHANGELOG.md`, `VERSION`, `.forge/`
- Keep: `.git/`, `.github/`, `LICENSE`, `docs/superpowers/` (specs and plans)
- Create: `.claude-plugin/plugin.json`, `hooks/hooks.json`, `settings.json`, `scripts/`, `skills/`, `agents/`

- [ ] **Step 1: Remove v1 framework files**

```bash
cd "/home/uh1/VIBEPROJECTS/VIBE FRAMEWORK"
rm -rf .claude/docs .claude/morpheus .claude/rules .claude/skills .claude/settings
rm -f CLAUDE.md vibe-framework.sh RELEASING.md CHANGELOG.md VERSION
rm -rf .forge
rmdir .claude 2>/dev/null || true
```

- [ ] **Step 2: Create plugin directory structure**

```bash
mkdir -p .claude-plugin
mkdir -p skills/{setup,reflect,pause,resume}
mkdir -p skills/{seurat,emmet,heimdall,ghostwriter,baptist,orson,scribe,forge}
mkdir -p agents
mkdir -p hooks
mkdir -p scripts
```

- [ ] **Step 3: Verify structure**

```bash
find . -maxdepth 3 -not -path './.git/*' -not -path './docs/*' | sort
```

Expected: clean plugin structure with no v1 remnants.

- [ ] **Step 4: Commit clean slate**

```bash
git add -A
git commit -m "chore: clean project for v2 plugin structure

Remove all v1 components (CLAUDE.md, Morpheus, registry, skills, installer).
Create empty plugin directory structure.
v1 backed up to ../vibe-framework-v1-backup/"
```

---

## Task 3: Plugin Manifest and Settings

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `settings.json`

- [ ] **Step 1: Create plugin manifest**

Create `.claude-plugin/plugin.json`:

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
  "keywords": [
    "quality",
    "testing",
    "security",
    "ui-design",
    "seo",
    "cro",
    "video",
    "documents",
    "framework"
  ]
}
```

- [ ] **Step 2: Create plugin settings**

Create `settings.json`:

```json
{
  "agent": "default"
}
```

Note: Plugin settings.json only supports the `agent` key. Model and effort configuration happens via `/vibe:setup` skill which modifies user settings.

- [ ] **Step 3: Commit manifest**

```bash
git add .claude-plugin/plugin.json settings.json
git commit -m "feat: add plugin manifest and settings"
```

---

## Task 4: Hook Scripts

**Files:**
- Create: `scripts/setup-check.sh`
- Create: `scripts/post-edit-lint.sh`
- Create: `scripts/security-quickscan.sh`
- Create: `scripts/pre-compact-save.sh`
- Create: `scripts/correction-capture.sh`
- Create: `scripts/failure-loop-detect.sh`

Each script receives JSON on stdin from Claude Code hooks. All scripts must:
1. Check for pause flag first (`/tmp/vibe-paused-*`)
2. Read JSON input with `jq`
3. Exit 0 (success), exit 2 (block action), or other (non-blocking error)

- [ ] **Step 1: Create setup-check.sh**

Create `scripts/setup-check.sh`:

```bash
#!/usr/bin/env bash
# SessionStart hook: checks VIBE configuration status and injects context.
# Input: JSON with session_id, cwd, permission_mode
# Output: JSON with hookSpecificOutput.additionalContext

set -euo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
PLUGIN_DATA="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe}"

# Build context message
CONTEXT=""

# 1. Check if setup has been completed
SETTINGS_FILE="$HOME/.claude/settings.json"
SETUP_DONE=false
if [ -f "$SETTINGS_FILE" ]; then
  MODEL=$(jq -r '.model // empty' "$SETTINGS_FILE" 2>/dev/null)
  EFFORT_ENV=$(jq -r '.env.CLAUDE_CODE_EFFORT_LEVEL // empty' "$SETTINGS_FILE" 2>/dev/null)
  if [ -n "$MODEL" ] && [ -n "$EFFORT_ENV" ]; then
    SETUP_DONE=true
  fi
fi

if [ "$SETUP_DONE" = "true" ]; then
  CONTEXT="VIBE Framework 2.0 active. Quality-first mode. Model: $MODEL. Effort: $EFFORT_ENV."
else
  CONTEXT="VIBE Framework 2.0 installed but not configured. Run /vibe:setup for full configuration (model, effort, LSP, status line)."
fi

# 2. Check for pending learnings
QUEUE_FILE="$PLUGIN_DATA/learnings/queue.jsonl"
if [ -f "$QUEUE_FILE" ]; then
  PENDING=$(wc -l < "$QUEUE_FILE" | tr -d ' ')
  if [ "$PENDING" -gt 0 ]; then
    CONTEXT="$CONTEXT You have $PENDING pending correction(s). Run /vibe:reflect to review."
  fi
fi

# 3. Check for post-compaction state recovery
STATE_FILE="$PLUGIN_DATA/session-state.md"
if [ -f "$STATE_FILE" ]; then
  STATE_AGE=$(( $(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || stat -f %m "$STATE_FILE" 2>/dev/null || echo 0) ))
  if [ "$STATE_AGE" -lt 300 ]; then
    STATE_CONTENT=$(cat "$STATE_FILE")
    CONTEXT="$CONTEXT POST-COMPACTION RECOVERY — Previous state: $STATE_CONTENT"
    rm -f "$STATE_FILE"
  fi
fi

# Output context
jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
```

- [ ] **Step 2: Create post-edit-lint.sh**

Create `scripts/post-edit-lint.sh`:

```bash
#!/usr/bin/env bash
# PostToolUse hook: runs project linter on edited/written files.
# Input: JSON with tool_name, tool_input (file_path, content)
# Exit 0: lint passes. Exit 2: lint fails (blocks action with error).

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Check pause flag
if ls /tmp/vibe-paused-"$SESSION_ID"* 1>/dev/null 2>&1; then
  exit 0
fi

# Extract file path from tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Determine file extension
EXT="${FILE_PATH##*.}"

# Detect and run appropriate linter
case "$EXT" in
  js|jsx|ts|tsx|mjs|cjs)
    if command -v npx &>/dev/null && [ -f "package.json" ]; then
      if jq -e '.devDependencies.eslint // .dependencies.eslint' package.json &>/dev/null; then
        OUTPUT=$(npx eslint --no-warn-ignored "$FILE_PATH" 2>&1) || {
          echo "ESLint errors in $FILE_PATH:" >&2
          echo "$OUTPUT" >&2
          exit 2
        }
      elif jq -e '.devDependencies.prettier // .dependencies.prettier' package.json &>/dev/null; then
        OUTPUT=$(npx prettier --check "$FILE_PATH" 2>&1) || {
          echo "Prettier formatting issues in $FILE_PATH:" >&2
          echo "$OUTPUT" >&2
          exit 2
        }
      fi
    fi
    ;;
  py)
    if command -v ruff &>/dev/null; then
      OUTPUT=$(ruff check "$FILE_PATH" 2>&1) || {
        echo "Ruff errors in $FILE_PATH:" >&2
        echo "$OUTPUT" >&2
        exit 2
      }
    elif command -v black &>/dev/null; then
      OUTPUT=$(black --check "$FILE_PATH" 2>&1) || {
        echo "Black formatting issues in $FILE_PATH:" >&2
        echo "$OUTPUT" >&2
        exit 2
      }
    fi
    ;;
  rs)
    if command -v rustfmt &>/dev/null; then
      OUTPUT=$(rustfmt --check "$FILE_PATH" 2>&1) || {
        echo "Rustfmt issues in $FILE_PATH:" >&2
        echo "$OUTPUT" >&2
        exit 2
      }
    fi
    ;;
  go)
    if command -v gofmt &>/dev/null; then
      OUTPUT=$(gofmt -l "$FILE_PATH" 2>&1)
      if [ -n "$OUTPUT" ]; then
        echo "Gofmt issues in $FILE_PATH:" >&2
        echo "$OUTPUT" >&2
        exit 2
      fi
    fi
    ;;
esac

exit 0
```

- [ ] **Step 3: Create security-quickscan.sh**

Create `scripts/security-quickscan.sh`:

```bash
#!/usr/bin/env bash
# PostToolUse hook: lightweight security scan on every file write/edit.
# Input: JSON with tool_name, tool_input (file_path, content)
# Exit 0: no issues. Exit 2: blocks with vulnerability description.

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Check pause flag
if ls /tmp/vibe-paused-"$SESSION_ID"* 1>/dev/null 2>&1; then
  exit 0
fi

# Extract file path
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Skip non-source files
case "$FILE_PATH" in
  *.md|*.txt|*.json|*.yaml|*.yml|*.toml|*.lock|*.svg|*.png|*.jpg|*.gif)
    exit 0
    ;;
esac

ISSUES=""

# 1. Hardcoded API keys and secrets
if grep -nE '(sk-[a-zA-Z0-9]{20,}|api[_-]?key\s*[=:]\s*["\x27][a-zA-Z0-9]{16,}|Bearer\s+[a-zA-Z0-9._-]{20,})' "$FILE_PATH" 2>/dev/null | grep -v '^\s*[#//\*]' | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- HARDCODED SECRET: API key or token found in source code. Move to environment variable."
fi

# 2. dangerouslySetInnerHTML
if grep -n 'dangerouslySetInnerHTML' "$FILE_PATH" 2>/dev/null | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- XSS RISK: dangerouslySetInnerHTML used. Sanitize input with DOMPurify or similar."
fi

# 3. Public database policies (Supabase/Firebase)
if grep -nE 'USING\s*\(\s*true\s*\)' "$FILE_PATH" 2>/dev/null | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- PUBLIC DATABASE: Policy allows unrestricted access. Add proper RLS conditions."
fi

# 4. eval() with potential user input
if grep -nE '\beval\s*\(' "$FILE_PATH" 2>/dev/null | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- CODE INJECTION: eval() detected. Avoid eval with dynamic input."
fi

# 5. Hardcoded credentials in connection strings
if grep -nE '(password|passwd|pwd)\s*[=:]\s*["\x27][^"\x27]{4,}' "$FILE_PATH" 2>/dev/null | grep -v '^\s*[#//\*]' | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- HARDCODED PASSWORD: Credential in connection string. Use environment variable."
fi

# 6. Public S3 bucket ACL
if grep -nE '(public-read|public-read-write|authenticated-read)' "$FILE_PATH" 2>/dev/null | head -3 | grep -q .; then
  ISSUES="$ISSUES\n- PUBLIC S3 BUCKET: Permissive ACL detected. Use private ACL with signed URLs."
fi

if [ -n "$ISSUES" ]; then
  echo "Security issues found in $FILE_PATH:" >&2
  echo -e "$ISSUES" >&2
  exit 2
fi

exit 0
```

- [ ] **Step 4: Create pre-compact-save.sh**

Create `scripts/pre-compact-save.sh`:

```bash
#!/usr/bin/env bash
# PreCompact hook: saves session state before context compaction.
# Input: JSON with session_id, transcript_path, cwd
# Output: state file for SessionStart recovery

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
PLUGIN_DATA="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe}"

mkdir -p "$PLUGIN_DATA"

STATE_FILE="$PLUGIN_DATA/session-state.md"

{
  echo "# Session State (saved before compaction)"
  echo "**Timestamp:** $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "**Working directory:** $CWD"
  echo ""

  # Modified files
  echo "## Modified Files"
  if command -v git &>/dev/null && git rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
    git diff --name-only 2>/dev/null | head -20 || echo "(no git changes detected)"
  else
    echo "(not a git repository)"
  fi
  echo ""

  # Recent skill invocations from transcript
  echo "## Recent Skill Invocations"
  if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
    tail -200 "$TRANSCRIPT" 2>/dev/null | grep -o '"Skill"[^}]*' | tail -5 || echo "(none found)"
  else
    echo "(transcript not available)"
  fi
  echo ""

  # Recent tool calls
  echo "## Recent Tool Activity"
  if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
    tail -200 "$TRANSCRIPT" 2>/dev/null | jq -r 'select(.type == "tool_use") | "\(.tool_name): \(.tool_input | keys | join(", "))"' 2>/dev/null | tail -15 || echo "(could not parse transcript)"
  else
    echo "(transcript not available)"
  fi
} > "$STATE_FILE"

exit 0
```

- [ ] **Step 5: Create correction-capture.sh**

Create `scripts/correction-capture.sh`:

```bash
#!/usr/bin/env bash
# UserPromptSubmit hook: detects correction patterns and queues learnings.
# Input: JSON with prompt, session_id
# Exit 0 always (never blocks user input).

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Check pause flag
if ls /tmp/vibe-paused-"$SESSION_ID"* 1>/dev/null 2>&1; then
  exit 0
fi

PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
if [ -z "$PROMPT" ]; then
  exit 0
fi

PLUGIN_DATA="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe}"
QUEUE_FILE="$PLUGIN_DATA/learnings/queue.jsonl"

# Lowercase for matching
LOWER=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

# Multilingual correction patterns
# Conservative: only match clear correction indicators
MATCH=false

# English
echo "$LOWER" | grep -qE '(^no[,.]?\s|^don'\''t |^do not |^stop |^wrong|^actually[,.]|^i told you|^not like that|^that'\''s not|^i said )' && MATCH=true

# Italian
echo "$LOWER" | grep -qE '(^no[,.]?\s.*non\b|^non fare|^non così|^sbagliato|^ti avevo detto|^doveva essere|^te l'\''avevo)' && MATCH=true

# Spanish
echo "$LOWER" | grep -qE '(^no[,.]?\s.*no\b|^no hagas|^así no|^está mal|^te dije|^estaba mal)' && MATCH=true

# French
echo "$LOWER" | grep -qE '(^non[,.]?\s|^ne fais pas|^pas comme ça|^c'\''est pas|^je t'\''avais dit)' && MATCH=true

# German
echo "$LOWER" | grep -qE '(^nein[,.]?\s|^mach das nicht|^nicht so|^falsch|^ich hatte gesagt)' && MATCH=true

# Portuguese
echo "$LOWER" | grep -qE '(^não[,.]?\s|^não faça|^assim não|^está errado|^eu disse para)' && MATCH=true

if [ "$MATCH" = "true" ]; then
  mkdir -p "$PLUGIN_DATA/learnings"
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  jq -n --arg ts "$TIMESTAMP" --arg prompt "$PROMPT" --arg sid "$SESSION_ID" \
    '{timestamp: $ts, correction: $prompt, session_id: $sid}' >> "$QUEUE_FILE"
fi

exit 0
```

- [ ] **Step 6: Create failure-loop-detect.sh**

Create `scripts/failure-loop-detect.sh`:

```bash
#!/usr/bin/env bash
# PostToolUseFailure hook: detects consecutive failure loops.
# Input: JSON with tool_name, error, session_id
# Exit 0: under threshold. Exit 2: blocks after 3 consecutive failures.

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Check pause flag
if ls /tmp/vibe-paused-"$SESSION_ID"* 1>/dev/null 2>&1; then
  exit 0
fi

COUNTER_FILE="/tmp/vibe-failures-${SESSION_ID}"
THRESHOLD=3

# Read current count
CURRENT=0
if [ -f "$COUNTER_FILE" ]; then
  CURRENT=$(cat "$COUNTER_FILE" 2>/dev/null || echo 0)
fi

# Increment
CURRENT=$((CURRENT + 1))
echo "$CURRENT" > "$COUNTER_FILE"

if [ "$CURRENT" -ge "$THRESHOLD" ]; then
  echo "STOP. You have failed $CURRENT times consecutively (last tool: $TOOL_NAME). Do NOT retry the same approach. Step back, analyze why it's failing, and try a fundamentally different strategy. If stuck, ask the user for guidance. Use /vibe:emmet debugging workflow: Reproduce → Isolate → Hypothesize → Verify → Fix." >&2
  exit 2
fi

exit 0
```

- [ ] **Step 7: Make all scripts executable**

```bash
chmod +x scripts/*.sh
```

- [ ] **Step 8: Create the success-counter reset hook**

The failure counter needs to reset on success. Add a small companion that resets the counter. This runs as a separate PostToolUse hook on all tools.

Create `scripts/failure-reset.sh`:

```bash
#!/usr/bin/env bash
# PostToolUse hook: resets failure counter on successful tool use.
# Input: JSON with session_id
# Always exits 0.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
COUNTER_FILE="/tmp/vibe-failures-${SESSION_ID}"

if [ -f "$COUNTER_FILE" ]; then
  echo "0" > "$COUNTER_FILE"
fi

exit 0
```

```bash
chmod +x scripts/failure-reset.sh
```

- [ ] **Step 9: Commit all scripts**

```bash
git add scripts/
git commit -m "feat: add all hook scripts (6 quality gates + 1 reset)"
```

---

## Task 5: Hooks Configuration

**Files:**
- Create: `hooks/hooks.json`

- [ ] **Step 1: Create hooks.json**

Create `hooks/hooks.json`:

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
      },
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/failure-reset.sh"
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
            "prompt": "Review the last assistant message. Is it claiming that a TASK or FEATURE is complete, fixed, done, or passing? Single action reports like 'file updated' or 'commit created' are NOT completion claims — allow those. Only block if the message claims a multi-step task is finished without showing verification evidence (test output, command results, or screenshots). If blocking: {\"decision\": \"block\", \"reason\": \"Verification required before claiming task completion. Run tests or show evidence.\"}. If allowing: {\"decision\": \"allow\"}.",
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

- [ ] **Step 2: Commit hooks config**

```bash
git add hooks/hooks.json
git commit -m "feat: add hooks configuration (7 handlers across 5 events)"
```

---

## Task 6: Utility Skills (Setup, Reflect, Pause, Resume)

**Files:**
- Create: `skills/setup/SKILL.md`
- Create: `skills/reflect/SKILL.md`
- Create: `skills/pause/SKILL.md`
- Create: `skills/resume/SKILL.md`

- [ ] **Step 1: Create /vibe:setup skill**

Create `skills/setup/SKILL.md`. This skill must contain the complete guided workflow for first-run configuration. The SKILL.md should be under 500 lines and include:

- Frontmatter: `name: setup`, `description`, `effort: max`, `disable-model-invocation: true`
- Step 1: Diagnosis — read settings, detect stack, OS, linters
- Step 2: LSP detection — detect language, check for LSP plugin, recommend if missing
- Step 3: Status line — propose context/model/cost visibility
- Step 4: Proposal — show current vs recommended config
- Step 5: Application — update ~/.claude/settings.json (model: opus[1m], env.CLAUDE_CODE_EFFORT_LEVEL: max)
- Step 6: Codebase mapping — optional, invoke researcher agent
- Step 7: Verification — confirm changes, inform about restart

Key behaviors to encode in the skill content:
- Detect linters by checking: package.json (eslint, prettier), pyproject.toml/setup.cfg (ruff, black), Cargo.toml (rustfmt), go.mod (gofmt)
- LSP mapping: TypeScript→typescript-lsp, Python→pyright-lsp, Rust→rust-analyzer-lsp, Go→gopls-lsp
- Non-destructive: read existing settings first, merge, never overwrite user customizations
- Idempotent: detect what's already configured, only propose the delta

- [ ] **Step 2: Create /vibe:reflect skill**

Create `skills/reflect/SKILL.md`. This skill must contain the learning review workflow:

- Frontmatter: `name: reflect`, `description`, `effort: max`, `disable-model-invocation: true`
- Default mode: read queue from `${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl`, present each correction with context, let user choose: project memory / user memory / discard
- `--patterns` mode: analyze recent session transcripts for repeated actions, suggest skill candidates via Forge

- [ ] **Step 3: Create /vibe:pause skill**

Create `skills/pause/SKILL.md`:

```markdown
---
name: pause
description: Temporarily disable VIBE quality hooks for the current session. Use during rapid prototyping or exploratory coding.
disable-model-invocation: true
---

Pause all VIBE Framework quality hooks for the current session.

1. Create the pause flag file: `touch /tmp/vibe-paused-${CLAUDE_SESSION_ID}`
2. Confirm: "VIBE hooks paused for this session. Quality gates disabled. Run /vibe:resume to re-enable."

Note: The SessionStart hook is not affected by pause (it always runs to show framework status).
```

- [ ] **Step 4: Create /vibe:resume skill**

Create `skills/resume/SKILL.md`:

```markdown
---
name: resume
description: Re-enable VIBE quality hooks after pausing. Run after /vibe:pause.
disable-model-invocation: true
---

Resume all VIBE Framework quality hooks for the current session.

1. Remove the pause flag file: `rm -f /tmp/vibe-paused-${CLAUDE_SESSION_ID}`
2. Confirm: "VIBE hooks resumed. Quality gates active."
```

- [ ] **Step 5: Commit utility skills**

```bash
git add skills/setup/ skills/reflect/ skills/pause/ skills/resume/
git commit -m "feat: add utility skills (setup, reflect, pause, resume)"
```

---

## Task 7: Agents

**Files:**
- Create: `agents/reviewer.md`
- Create: `agents/researcher.md`
- Create: `agents/guardian.md`

- [ ] **Step 1: Create reviewer agent**

Create `agents/reviewer.md`:

```markdown
---
name: reviewer
description: Reviews code for quality, bugs, edge cases, and best practices. Use after implementing features or fixing bugs. Provides critical review from a fresh perspective — never reviews its own code.
model: opus
effort: max
tools: Read, Grep, Glob, Bash
memory: project
---

You are a senior code reviewer. You did NOT write the code you are reviewing. Approach it with healthy skepticism.

## Review Process

1. **Read the changes** — understand what was modified and why
2. **Check correctness** — does the code do what it claims? Are there logic errors?
3. **Check edge cases** — what happens with empty input, null values, concurrent access, network failures?
4. **Check security** — any injection risks, exposed secrets, missing validation?
5. **Check quality** — is it readable, maintainable, does it follow project conventions?
6. **Check tests** — are there tests? Do they test the right things? Comment out the fix mentally — would tests catch it?

## Output Format

Organize findings by severity:
- **Critical** (must fix before merge): bugs, security issues, data loss risks
- **Warning** (should fix): edge cases, error handling gaps, performance concerns
- **Suggestion** (consider): readability, naming, simplification opportunities

Include specific file paths and line numbers. Show the problematic code and suggest a fix.

## Important

- Never say "looks good" without evidence. If you found nothing, explain what you checked.
- If you're uncertain about something, say so rather than guessing.
- Update your agent memory with patterns and recurring issues you discover in this project.
```

- [ ] **Step 2: Create researcher agent**

Create `agents/researcher.md`:

```markdown
---
name: researcher
description: Explores codebases in depth. Use before implementing features, when onboarding to new projects, or when investigating complex systems. Returns structured findings without modifying code.
model: opus
effort: max
tools: Read, Grep, Glob, Bash
memory: project
isolation: worktree
---

You are a codebase researcher. Your job is to explore, understand, and document what you find. You never modify code.

## Research Process

1. **Identify entry points** — find main files, index files, app bootstrap
2. **Map architecture** — understand directory structure, module boundaries, data flow
3. **Identify patterns** — what frameworks, libraries, conventions are used?
4. **Find tests** — where are tests, how are they run, what's the coverage?
5. **Note anomalies** — anything unusual, inconsistent, or potentially problematic

## Output Format

Return a structured summary:
- **Architecture overview** (2-3 sentences)
- **Key files** (with paths and one-line descriptions)
- **Stack** (languages, frameworks, libraries)
- **Patterns** (conventions, architecture style)
- **Build/Test/Deploy** (commands and configuration)
- **Potential concerns** (tech debt, complexity, inconsistencies)

## Important

- Be thorough but concise. The summary returns to the main conversation context.
- Update your agent memory with what you discover for future sessions.
- Use Grep and Glob efficiently — don't read every file, search strategically.
```

- [ ] **Step 3: Create guardian agent**

Create `agents/guardian.md`:

```markdown
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

You are a security and quality auditor. You have the full Heimdall security methodology loaded.

## Audit Process

1. **Scope** — identify which files changed and what they do
2. **Security scan** — apply Heimdall methodology:
   - Check for OWASP Top 10 vulnerabilities
   - Scan for hardcoded secrets and credentials
   - Check BaaS configurations (Supabase, Firebase)
   - Verify input validation and output encoding
   - Check authentication and authorization flows
3. **Quality check** — beyond security:
   - Error handling completeness
   - Data validation at system boundaries
   - Logging and observability
   - Race conditions and concurrency issues
4. **Report** — organized by severity with remediation guidance

## Output Format

- **Critical** (blocks deployment): active vulnerabilities, exposed secrets
- **High** (fix before next release): missing validation, weak auth
- **Medium** (fix soon): incomplete error handling, missing logging
- **Low** (improve): code quality, documentation gaps

Include specific file paths, line numbers, the vulnerable code, and the recommended fix.

## Important

- When in doubt about severity, err on the side of caution (rate higher).
- Update your agent memory with vulnerabilities found and project-specific security patterns.
- Check your memory for previously found issues — verify they were actually fixed.
```

- [ ] **Step 4: Commit agents**

```bash
git add agents/
git commit -m "feat: add reviewer, researcher, and guardian agents"
```

---

## Task 8: Domain Skills — Emmet (Testing & QA)

Emmet is built first because it's needed to test the other skills and audit the Orson engine.

**Files:**
- Create: `skills/emmet/SKILL.md`
- Create: `skills/emmet/references/strategies.md`
- Create: `skills/emmet/references/checklists.md`
- Create: `skills/emmet/references/personas.md`
- Create: `skills/emmet/references/debugging.md`
- Create: `skills/emmet/references/templates.md`

- [ ] **Step 1: Write Emmet SKILL.md**

Write the complete SKILL.md (<500 lines) covering:
- Frontmatter with effort:max, model:opus
- Testing workflow (Map → Plan → Unit → Static → Visual → Report)
- Debugging workflow (Reproduce → Isolate → Hypothesize → Verify → Fix → Validate → Prevent)
- 8 personas table for experiential testing
- Visual testing with Playwright headed / Chrome MCP
- Tech debt audit workflow
- Commands: `/vibe:emmet test`, `/vibe:emmet debug`, `/vibe:emmet techdebt`, `/vibe:emmet map`
- Reference pointers for each topic

- [ ] **Step 2: Write references/personas.md**

Complete persona definitions with viewport, user agent, network conditions, and test scenarios for each of the 8 personas.

- [ ] **Step 3: Write references/strategies.md**

Testing strategies: unit testing for pure functions, integration testing (no mocks by default), visual testing with Playwright, static analysis with LSP.

- [ ] **Step 4: Write references/debugging.md**

Complete debugging methodology with examples, common patterns, and integration with failure-loop-detect hook.

- [ ] **Step 5: Write references/checklists.md**

Pre-deploy, code review, refactoring, and security checklists.

- [ ] **Step 6: Write references/templates.md**

Report templates for test results, tech debt audits, and functional maps.

- [ ] **Step 7: Commit Emmet**

```bash
git add skills/emmet/
git commit -m "feat: add Emmet skill (testing, QA, debugging, tech debt)"
```

---

## Task 9: Domain Skills — Heimdall (Security)

**Files:**
- Create: `skills/heimdall/SKILL.md`
- Create: `skills/heimdall/references/owasp.md`
- Create: `skills/heimdall/references/baas.md`
- Create: `skills/heimdall/references/credentials.md`
- Create: `skills/heimdall/references/patterns.md`
- Create: `skills/heimdall/patterns/` (JSON pattern files)

- [ ] **Step 1: Write Heimdall SKILL.md**

Complete SKILL.md covering: pre-scan, deep audit, report, remediation. Commands: `/vibe:heimdall audit`, `/vibe:heimdall scan`, `/vibe:heimdall secrets`.

- [ ] **Step 2: Write all references**

OWASP Top 10 guide, BaaS config guide, credential detection guide, and Trail of Bits integration patterns.

- [ ] **Step 3: Create JSON pattern files**

Pattern databases for secrets, BaaS misconfigs, OWASP patterns.

- [ ] **Step 4: Commit Heimdall**

```bash
git add skills/heimdall/
git commit -m "feat: add Heimdall skill (security analysis)"
```

---

## Task 10: Domain Skills — Seurat (UI/UX)

**Files:**
- Create: `skills/seurat/SKILL.md`
- Create: `skills/seurat/references/styles.md`
- Create: `skills/seurat/references/archetypes.md`
- Create: `skills/seurat/references/accessibility.md`
- Create: `skills/seurat/references/brand.md`

- [ ] **Step 1: Write Seurat SKILL.md**

Complete SKILL.md covering: design token generation, component creation, page composition, WCAG verification, brand identity. Commands: `/vibe:seurat setup`, `/vibe:seurat generate`, `/vibe:seurat brand`.

- [ ] **Step 2: Write all references**

11 visual styles, 6 page archetypes, WCAG accessibility guide, brand identity workflow.

- [ ] **Step 3: Commit Seurat**

```bash
git add skills/seurat/
git commit -m "feat: add Seurat skill (UI design system)"
```

---

## Task 11: Domain Skills — Ghostwriter (SEO/GEO/Copy)

**Files:**
- Create: `skills/ghostwriter/SKILL.md`
- Create: `skills/ghostwriter/references/seo.md`
- Create: `skills/ghostwriter/references/geo.md`
- Create: `skills/ghostwriter/references/copywriting.md`
- Create: `skills/ghostwriter/references/validation.md`

- [ ] **Step 1: Write Ghostwriter SKILL.md**

Complete SKILL.md with unified SEO+GEO workflow, copywriting frameworks, 52+ validation rules. Commands: `/vibe:ghostwriter write`, `/vibe:ghostwriter optimize`.

- [ ] **Step 2: Write all references**

SEO fundamentals + on-page + technical, GEO for AI search, copywriting frameworks + psychology, validation checklist.

- [ ] **Step 3: Commit Ghostwriter**

```bash
git add skills/ghostwriter/
git commit -m "feat: add Ghostwriter skill (SEO, GEO, copywriting)"
```

---

## Task 12: Domain Skills — Baptist (CRO)

**Files:**
- Create: `skills/baptist/SKILL.md`
- Create: `skills/baptist/references/frameworks.md`
- Create: `skills/baptist/references/experiments.md`
- Create: `skills/baptist/references/analytics.md`

- [ ] **Step 1: Write Baptist SKILL.md**

Complete SKILL.md with B=MAP diagnostics, ICE scoring, A/B test design. Explicit integration with Ghostwriter and Seurat. Commands: `/vibe:baptist audit`, `/vibe:baptist test`.

- [ ] **Step 2: Write all references**

B=MAP framework, ICE scoring, experiment design, analytics interpretation.

- [ ] **Step 3: Commit Baptist**

```bash
git add skills/baptist/
git commit -m "feat: add Baptist skill (CRO)"
```

---

## Task 13: Domain Skills — Scribe (Office/PDF)

**Files:**
- Create: `skills/scribe/SKILL.md`
- Create: `skills/scribe/references/xlsx.md`
- Create: `skills/scribe/references/docx.md`
- Create: `skills/scribe/references/pptx.md`
- Create: `skills/scribe/references/pdf.md`
- Create: `skills/scribe/scripts/` (migrate from v1 backup)

- [ ] **Step 1: Write Scribe SKILL.md**

Complete SKILL.md with format auto-routing, creation/edit workflows. Commands: `/vibe:scribe create`, `/vibe:scribe edit`.

- [ ] **Step 2: Write all references**

Format-specific guides for xlsx, docx, pptx, pdf.

- [ ] **Step 3: Migrate Python scripts from v1**

Copy and review scripts from v1 backup: `recalc.py`, `thumbnail.py`, `unpack.py`, `pack.py`, `validate.py`, `soffice.py`.

- [ ] **Step 4: Commit Scribe**

```bash
git add skills/scribe/
git commit -m "feat: add Scribe skill (Office documents and PDF)"
```

---

## Task 14: Domain Skills — Forge (Meta-skill)

**Files:**
- Create: `skills/forge/SKILL.md`
- Create: `skills/forge/references/anatomy.md`
- Create: `skills/forge/references/quality.md`
- Create: `skills/forge/references/templates.md`

- [ ] **Step 1: Write Forge SKILL.md**

Complete SKILL.md for v2 skill format: frontmatter spec, supporting files, context:fork, agent integration. Commands: `/vibe:forge create`, `/vibe:forge audit`, `/vibe:forge fix`.

- [ ] **Step 2: Write all references**

Skill anatomy for v2 format, quality checklist reflecting VIBE v2 principles, templates for new skills.

- [ ] **Step 3: Commit Forge**

```bash
git add skills/forge/
git commit -m "feat: add Forge skill (meta-skill for skill creation)"
```

---

## Task 15: Domain Skills — Orson (Video)

**Files:**
- Create: `skills/orson/SKILL.md`
- Create: `skills/orson/references/components.md`
- Create: `skills/orson/references/audio.md`
- Create: `skills/orson/references/rendering.md`
- Create: `skills/orson/references/recipes.md`
- Create: `skills/orson/engine/` (migrate from v1 backup)

- [ ] **Step 1: Migrate engine from v1 backup**

Copy the entire engine directory from v1 backup:

```bash
cp -r "/home/uh1/VIBEPROJECTS/vibe-framework-v1-backup/.claude/skills/orson/engine" skills/orson/engine
```

- [ ] **Step 2: Audit engine with Emmet**

Run Emmet's tech debt audit workflow on the engine:
- Static analysis of TypeScript source
- Unit test coverage check
- Code quality review

- [ ] **Step 3: Audit engine with Heimdall**

Run Heimdall security scan on the engine:
- Dependency vulnerability check
- Secret scanning
- Input validation review

- [ ] **Step 4: Fix all audit issues**

Address findings from Emmet and Heimdall audits.

- [ ] **Step 5: Write Orson SKILL.md**

Complete SKILL.md covering: storyboard, frame generation, animation, audio, rendering. Commands: `/vibe:orson create`, `/vibe:orson demo`, `/vibe:orson encode`.

- [ ] **Step 6: Write all references**

Component library, audio system, rendering pipeline, visual recipes.

- [ ] **Step 7: Commit Orson**

```bash
git add skills/orson/
git commit -m "feat: add Orson skill (video generation) with audited engine"
```

---

## Task 16: Integration Testing

**Files:**
- No new files, testing existing components

- [ ] **Step 1: Test plugin loading**

```bash
claude --plugin-dir "/home/uh1/VIBEPROJECTS/VIBE FRAMEWORK"
```

Verify: all 12 skills appear in `/help`, all 3 agents appear in `/agents`, hooks are listed in `/hooks`.

- [ ] **Step 2: Test SessionStart hook**

Start a new session with the plugin. Verify setup-check.sh fires and injects "Run /vibe:setup" message.

- [ ] **Step 3: Test /vibe:setup flow**

Run `/vibe:setup` and verify it:
- Detects the current project stack
- Recommends appropriate settings
- Applies settings correctly
- Generates minimal CLAUDE.md

- [ ] **Step 4: Test /vibe:pause and /vibe:resume**

Run `/vibe:pause`, verify hooks stop firing on edits. Run `/vibe:resume`, verify hooks resume.

- [ ] **Step 5: Test correction capture**

Type a correction like "no, use X not Y". Verify it appears in `${CLAUDE_PLUGIN_DATA}/learnings/queue.jsonl`.

- [ ] **Step 6: Test /vibe:reflect**

Run `/vibe:reflect` and verify it shows queued corrections and allows processing.

- [ ] **Step 7: Test failure loop detection**

Intentionally cause 3 consecutive Bash failures. Verify the hook blocks with "STOP" message.

- [ ] **Step 8: Test security quickscan**

Write a file containing `dangerouslySetInnerHTML`. Verify the hook blocks with security warning.

- [ ] **Step 9: Test post-edit lint**

In a project with eslint, edit a JS file with a lint error. Verify the hook blocks with lint output.

- [ ] **Step 10: Test agents**

Invoke each agent and verify: reviewer provides code review, researcher returns codebase findings, guardian runs security audit.

- [ ] **Step 11: Commit integration test results**

```bash
git commit --allow-empty -m "test: integration testing complete for all components"
```

---

## Task 17: v1 Comparison and Recovery

**Files:**
- Read: `../vibe-framework-v1-backup/`
- Potentially modify: various v2 files

- [ ] **Step 1: Read v1 skill content systematically**

For each v1 skill, read the SKILL.md, KNOWLEDGE.md, and all reference files. Note any valuable content not present in v2.

- [ ] **Step 2: Compare domain knowledge**

Check each v2 skill's references against v1's content:
- Heimdall: are all v1 security patterns preserved?
- Seurat: are all 11 styles and 6 archetypes covered?
- Ghostwriter: are all SEO/GEO rules preserved?
- Emmet: are all testing strategies covered?
- Baptist: are all CRO frameworks included?
- Scribe: are all format-specific guides complete?

- [ ] **Step 3: Recover any lost valuable content**

If v1 had content that v2 is missing and that content has genuine value, incorporate it into the appropriate v2 reference files.

- [ ] **Step 4: Commit any recovered content**

```bash
git add -A
git commit -m "feat: recover valuable content from v1 comparison"
```

---

## Task 18: Documentation and Distribution

**Files:**
- Modify: `README.md`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Write README.md**

Complete README with:
- What VIBE Framework does (one paragraph)
- Installation (3 commands)
- Setup (`/vibe:setup`)
- Skills table (all 12)
- Agents table (all 3)
- Hooks table (all 7)
- Requirements
- License

- [ ] **Step 2: Write CHANGELOG.md**

```markdown
# Changelog

## 2.0.0 — YYYY-MM-DD

Complete rewrite as Claude Code plugin.

### Added
- Plugin architecture (installable via /plugin install)
- 12 skills: 8 domain + setup + reflect + pause + resume
- 3 agents: reviewer, researcher, guardian
- 7 hook handlers: quality gates, self-learning, failure detection
- Multilingual correction capture (6 languages)
- Systematic debugging workflow
- Per-persona visual testing with Playwright
- Post-compaction state recovery

### Removed
- CLAUDE.md operating system (replaced by plugin skills)
- Morpheus context awareness (replaced by native auto-compaction)
- Registry, request log, session notes (replaced by native auto-memory)
- Shell installer (replaced by plugin system)
- PROCEED gate (replaced by native plan mode)

### Changed
- All skills rewritten from scratch for v2 format
- Orson engine audited and improved
- Effort forced to max on all skills and agents
```

- [ ] **Step 3: Commit documentation**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: add README and CHANGELOG for v2.0.0"
```

- [ ] **Step 4: Tag release**

```bash
git tag -a v2.0.0 -m "VIBE Framework 2.0.0 — Complete rewrite as Claude Code plugin"
```

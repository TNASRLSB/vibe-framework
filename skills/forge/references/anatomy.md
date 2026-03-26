# Skill Anatomy — v2 Format Specification

Complete reference for the Claude Code v2 skill format. Read this when creating or restructuring a skill.

---

## File Structure

Every skill lives in a directory under `skills/`:

```
skills/[skill-name]/
  SKILL.md              — Main file. Navigator role. Under 500 lines.
  references/           — On-demand knowledge files (not loaded at startup)
    [topic].md          — One file per knowledge domain
  scripts/              — Executable tools (optional)
    [tool-name].sh      — Shell scripts callable as tools
  templates/            — Template files the skill uses (optional)
  examples/             — Example outputs (optional)
```

### Naming Conventions

- **Skill directory:** lowercase, hyphens for multi-word (`my-skill/`)
- **SKILL.md:** always uppercase, always this exact name
- **Reference files:** lowercase, hyphens, descriptive (`brand-guidelines.md`)
- **Scripts:** lowercase, hyphens, include extension (`run-audit.sh`)

---

## YAML Frontmatter

The frontmatter block at the top of SKILL.md is the contract between the skill and Claude Code. It controls when and how the skill is invoked.

```yaml
---
name: skill-name
description: What it does. When to use it.
effort: max
model: opus
disable-model-invocation: true
allowed-tools: Edit,Read,Write,Bash,Glob,Grep
context: fork
agent: code
hooks:
  - event: skill.invoked
    command: echo "Starting skill"
shell: bash
---
```

### Required Fields

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `name` | string | Lowercase, hyphens only, max 64 chars | Must match directory name |
| `description` | string | What + when | Claude uses this to decide auto-invocation |
| `effort` | enum | `low`, `medium`, `high`, `max` | Controls thinking depth |

### Optional Fields

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `model` | enum | `inherit` | `sonnet`, `opus`, `haiku`, `inherit` |
| `disable-model-invocation` | bool | `false` | When true, only manual `/vibe:name` invocation works |
| `allowed-tools` | string | all tools | Comma-separated list of permitted tools |
| `context` | string | same context | `fork` runs skill in a subagent |
| `agent` | string | — | Which subagent type when `context: fork` |
| `hooks` | list | — | Lifecycle hooks scoped to this skill |
| `shell` | string | system default | Shell for script execution |

### Field Details

**name:**
- Must be lowercase with hyphens: `my-skill` (not `mySkill` or `My_Skill`)
- Maximum 64 characters
- Must match the directory name exactly
- Used in command invocation: `/vibe:[name] [args]`

**description:**
- Two parts: what the skill does + when to use it
- Claude reads this to decide whether to auto-invoke the skill
- Be specific about triggers: "Use when writing tests" not "Testing stuff"
- Bad: `"Testing"` — too vague, Claude won't know when to invoke
- Good: `"Testing, debugging, tech debt audit, and code quality. Use when writing tests, finding bugs, debugging code, auditing quality, or doing pre-deploy checks."`

**effort:**
- `low` — quick lookups, simple formatting
- `medium` — moderate reasoning, single-step tasks
- `high` — multi-step workflows, analysis
- `max` — complex creation, auditing, architecture decisions
- Rule of thumb: if the skill produces artifacts that affect the project, use `max`

**model:**
- `opus` — highest quality, use for creation and critical analysis
- `sonnet` — good balance, use for most workflows
- `haiku` — fast, use for simple lookups and formatting
- `inherit` — use whatever model the user's session is running

**disable-model-invocation:**
- When `true`: skill is only triggered by explicit `/vibe:[name]` command
- When `false`: Claude may auto-invoke based on description match
- Set to `true` for destructive or expensive operations
- Set to `false` for utility skills that should activate automatically

**context: fork:**
- Runs the skill in a separate subagent context
- The subagent gets its own conversation thread
- Useful when the skill needs to do extensive work without cluttering the main conversation
- The main agent receives the subagent's final output

**agent:**
- Only meaningful when `context: fork` is set
- Specifies the subagent type: `code`, `research`, etc.

---

## String Substitutions

These variables are available in SKILL.md and are replaced at invocation time:

| Variable | Expands to | Example |
|----------|-----------|---------|
| `$ARGUMENTS` | Everything after the command name | `/vibe:forge create myskill` → `create myskill` |
| `${CLAUDE_SKILL_DIR}` | Absolute path to the skill's directory | `/home/user/project/skills/forge` |
| `${CLAUDE_SESSION_ID}` | Current session identifier | `sess_abc123` |

### Usage Patterns

**Routing on arguments:**
```markdown
Check `$ARGUMENTS` to determine mode:
- `create [name]` → **Create Workflow**
- `audit` → **Audit Workflow**
```

**Loading references:**
```markdown
Read `${CLAUDE_SKILL_DIR}/references/anatomy.md` for details.
```

**Session-scoped output:**
```markdown
Save to `.claude/docs/audit-${CLAUDE_SESSION_ID}.md`
```

---

## SKILL.md Structure

The SKILL.md file follows a consistent section ordering:

```markdown
---
(frontmatter)
---

# [Name] — [Tagline]

[1-2 sentence role description. "You are [Name], the..."]

Check `$ARGUMENTS` to determine mode:
- [argument routing table]

---

## Core Principles

[3-5 numbered principles that guide all decisions]

---

## Available Commands

[Table of commands with descriptions]

---

## [Workflow Name]

**Trigger:** `/vibe:[name] [command]`

### Step 1: [Action]
[Instructions]

### Step 2: [Action]
[Instructions]

...

### Step N: Verify
[Verification instructions]

---

## References

[Table linking to reference files with descriptions]
```

### Key Rules

1. **Under 500 lines.** SKILL.md is a navigator, not an encyclopedia. If a section grows past what's needed for routing and decision-making, extract to a reference file.

2. **Numbered steps.** Every workflow uses explicit `### Step N:` headers. This lets Claude track progress and lets users see where they are.

3. **Verification is mandatory.** Every workflow ends with a verification or quality-check step. A skill that can't verify its own output is incomplete.

4. **References section at the end.** Always include a table of reference files so Claude knows what detailed knowledge is available.

---

## References Directory

Reference files contain detailed knowledge that SKILL.md points to but does not include inline.

### When to Create a Reference File

- The knowledge is more than 20 lines
- It contains examples, templates, or detailed specifications
- It's needed for some commands but not all
- It would push SKILL.md past 500 lines

### When to Keep Content in SKILL.md

- It's a short checklist (under 20 lines)
- It's needed by every command
- It's the routing logic or core principles

### Reference File Format

```markdown
# [Title]

[1-2 sentence description of what this file covers]

---

## [Section]

[Content with examples, rationale, and specifics]
```

---

## Scripts Directory

Scripts are executable files that the skill can invoke via Bash.

### When to Use Scripts

- Repetitive shell operations (scanning files, running linters)
- Operations that benefit from proper error handling
- Tasks that would be unwieldy as inline bash in SKILL.md

### Script Conventions

- Include shebang line (`#!/usr/bin/env bash`)
- Set strict mode (`set -euo pipefail`)
- Accept arguments via `$1`, `$2`, etc.
- Print results to stdout
- Print errors to stderr
- Exit 0 on success, non-zero on failure

---

## Hooks

Hooks let skills run commands at specific lifecycle events.

```yaml
hooks:
  - event: skill.invoked
    command: echo "Skill started at $(date)"
  - event: skill.completed
    command: ./scripts/cleanup.sh
```

Available events:
- `skill.invoked` — when the skill is triggered
- `skill.completed` — when the skill finishes

Hooks run in the skill's directory context.

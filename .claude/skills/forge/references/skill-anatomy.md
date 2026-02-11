# Skill Anatomy

Complete structural reference for building and evaluating skills.

---

## Directory Structure

```
skill-name/
├── SKILL.md              # Required: core skill definition
├── references/           # Optional: detailed reference material
│   └── *.md
├── scripts/              # Optional: black-box executable tools
│   └── *.py|*.sh
├── templates/            # Optional: output templates
│   └── *.md
└── [other]/              # Optional: skill-specific directories
```

---

## SKILL.md Structure

### 1. Frontmatter (YAML)

```yaml
---
name: skill-name
description: "What it does. Use when [triggers]. Activates on [keywords]."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---
```

**Frontmatter rules:**
- `name`: lowercase, hyphenated
- `description`: 1-3 sentences covering WHAT + WHEN + KEYWORDS
- `allowed-tools`: only list tools the skill actually needs
- Add `Task` only if the skill orchestrates subagents
- Add `WebSearch`/`WebFetch` only if the skill needs web access

### 2. Title and Purpose (~5 lines)

```markdown
# Skill Name — Short Tagline

## Purpose

One paragraph explaining what this skill does and why it exists.
```

### 3. Commands (~30-50% of body)

```markdown
## Commands

### `/skill command1`
What it does, workflow steps, output format.

### `/skill command2`
...
```

**Command documentation pattern:**
- One-line description
- Workflow (numbered steps)
- Input requirements
- Output format and location
- Example usage (if not obvious)

### 4. Key Principles (~10-20% of body)

Core rules that apply to every invocation. Keep concise — details go in references.

### 5. Integration (~5-10% of body)

How this skill connects to other skills in the framework.

### 6. Reference Links (~5% of body)

```markdown
## References

| Reference | Description |
|-----------|-------------|
| [topic.md](references/topic.md) | What it covers |
```

---

## Frontmatter Description Patterns

### Pattern 1: Action + Trigger List

```
"[Action verb] [objects]. Use when [user scenario 1]; [user scenario 2];
[user scenario 3]. Triggers on [keyword1], [keyword2], [keyword3]."
```

### Pattern 2: Role + Scope

```
"[Role description] for [domain]. Detects [pattern types] including
[specific1], [specific2]. Use when [generating/reviewing/auditing] [what]."
```

### Pattern 3: Orchestrator

```
"[Domain] orchestrator. Diagnoses [problems], designs [solutions],
prioritizes [actions]. Delegates [task A] to [Skill X] and [task B]
to [Skill Y]. Use when [scenario]."
```

---

## Common Tool Combinations

| Skill Type | Typical Tools |
|------------|---------------|
| Content generation | Read, Write, Edit, WebSearch, WebFetch |
| Code analysis | Read, Grep, Glob, Bash |
| Orchestrator | Read, Write, Task, AskUserQuestion |
| Security/audit | Read, Grep, Glob, Bash |
| Document creation | Read, Write, Edit, Bash |

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Giant SKILL.md (>5000 words) | Wastes context on every activation | Split into references/ |
| Vague description | Never triggers correctly | Add explicit WHEN + keywords |
| No commands section | User doesn't know how to use it | Add `/skill command` patterns |
| Duplicate content across skills | Inconsistency, wasted tokens | Single source of truth + cross-reference |
| Scripts without --help | Claude can't discover usage | Add argparse with --help |
| XML tags in SKILL.md | Can conflict with system processing | Use markdown formatting instead |
| Hardcoded paths | Breaks portability | Use relative paths from skill root |

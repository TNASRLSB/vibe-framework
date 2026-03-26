# Skill Templates

Starter templates for creating new skills. Choose the template that matches the skill type, then customize.

---

## Template 1: Simple Reference Skill

For skills that primarily provide knowledge and guidelines. No complex workflows, no subagents.

**Use when:** The skill guides Claude's behavior in a domain (coding standards, documentation style, etc.)

```markdown
---
name: [skill-name]
description: [What it does. Use when [trigger conditions].]
effort: medium
model: sonnet
---

# [Name] — [Tagline]

You are [Name], the [role description]. Your job is to [primary purpose].

Check `$ARGUMENTS` to determine mode:
- `guide` → **Show Guidelines**
- `check [file]` → **Check Compliance**
- No arguments or `help` → show available commands

---

## Core Principles

1. **[Principle 1].** [Brief explanation.]
2. **[Principle 2].** [Brief explanation.]
3. **[Principle 3].** [Brief explanation.]

---

## Available Commands

| Command | What it does |
|---------|-------------|
| `/vibe:[name] guide` | Show relevant guidelines for the current context |
| `/vibe:[name] check [file]` | Check a file against guidelines |
| `/vibe:[name] help` | Show this command list |

---

## Guide Mode

**Trigger:** `/vibe:[name] guide`

### Step 1: Read Context

Read the relevant project files to understand what guidelines apply.

### Step 2: Present Guidelines

Read `${CLAUDE_SKILL_DIR}/references/guidelines.md` and present the relevant sections.

---

## Check Mode

**Trigger:** `/vibe:[name] check [file]`

### Step 1: Read Target

Read the specified file.

### Step 2: Evaluate

Compare against guidelines in `${CLAUDE_SKILL_DIR}/references/guidelines.md`.

### Step 3: Report

List compliance issues with line numbers and suggested fixes.

---

## References

| File | Contents |
|------|----------|
| `${CLAUDE_SKILL_DIR}/references/guidelines.md` | Complete guidelines with examples |
```

---

## Template 2: Task Workflow Skill

For skills that perform multi-step work. Most skills fall into this category.

**Use when:** The skill creates artifacts, runs analyses, or performs multi-step procedures.

```markdown
---
name: [skill-name]
description: [What it does. Use when [trigger conditions].]
effort: max
model: opus
---

# [Name] — [Tagline]

You are [Name], the [role description]. Your job is to [primary purpose].

Check `$ARGUMENTS` to determine mode:
- `[command1]` → **[Workflow 1 Name]**
- `[command2]` → **[Workflow 2 Name]**
- `[command3]` → **[Workflow 3 Name]**
- No arguments or `help` → show available commands

---

## Core Principles

1. **[Principle 1].** [Brief explanation.]
2. **[Principle 2].** [Brief explanation.]
3. **[Principle 3].** [Brief explanation.]
4. **[Principle 4].** [Brief explanation.]

---

## Available Commands

| Command | What it does |
|---------|-------------|
| `/vibe:[name] [command1]` | [Description] |
| `/vibe:[name] [command2]` | [Description] |
| `/vibe:[name] [command3]` | [Description] |
| `/vibe:[name] help` | Show this command list |

---

## [Workflow 1 Name]

**Trigger:** `/vibe:[name] [command1]`

### Step 1: [Gather/Scan/Read]

[Understand the current state before acting.]

### Step 2: [Plan/Design/Analyze]

[Determine what needs to be done. Present plan to user if significant.]

### Step 3: [Execute/Generate/Build]

[Do the main work.]

### Step 4: [Verify/Check/Validate]

[Concrete verification steps:]
1. [Specific check 1]
2. [Specific check 2]
3. [Specific check 3]

Report results to the user.

---

## [Workflow 2 Name]

**Trigger:** `/vibe:[name] [command2]`

### Step 1: [Action]
[Instructions]

### Step 2: [Action]
[Instructions]

### Step 3: Verify
[Verification steps]

---

## References

| File | Contents |
|------|----------|
| `${CLAUDE_SKILL_DIR}/references/[topic1].md` | [Description] |
| `${CLAUDE_SKILL_DIR}/references/[topic2].md` | [Description] |
```

---

## Template 3: Forked Subagent Skill

For skills that run in a separate context. The main agent delegates to a subagent that does the heavy lifting.

**Use when:** The skill does extensive work that would clutter the main conversation, or needs isolation for objectivity (e.g., code review).

```markdown
---
name: [skill-name]
description: [What it does. Use when [trigger conditions].]
effort: max
model: opus
context: fork
agent: code
---

# [Name] — [Tagline]

You are [Name], running as a subagent. Your job is to [primary purpose] and return a structured report to the calling agent.

Check `$ARGUMENTS` to determine mode:
- `[command1]` → **[Workflow 1 Name]**
- `[command2]` → **[Workflow 2 Name]**
- No arguments or `help` → show available commands

---

## Core Principles

1. **[Principle 1].** [Brief explanation.]
2. **[Principle 2].** [Brief explanation.]
3. **[Principle 3].** [Brief explanation.]

---

## Important: Subagent Behavior

- You run in a forked context. The main agent receives your final output.
- Be thorough in your work — the main agent cannot see your intermediate steps.
- Structure your output clearly — the main agent parses your response.
- Include all relevant details — you cannot be asked follow-up questions.

---

## Available Commands

| Command | What it does |
|---------|-------------|
| `/vibe:[name] [command1]` | [Description] |
| `/vibe:[name] [command2]` | [Description] |
| `/vibe:[name] help` | Show this command list |

---

## [Workflow 1 Name]

**Trigger:** `/vibe:[name] [command1]`

### Step 1: [Action]
[Instructions]

### Step 2: [Action]
[Instructions]

### Step 3: Verify & Report

[Verification steps]

Return output in this format:

```markdown
# [Report Title]

## Summary
[Key findings]

## Details
[Structured results]

## Recommendations
[Actionable next steps]
```

---

## References

| File | Contents |
|------|----------|
| `${CLAUDE_SKILL_DIR}/references/[topic].md` | [Description] |
```

---

## Choosing the Right Template

| If the skill... | Use |
|-----------------|-----|
| Provides knowledge and checks compliance | Simple Reference |
| Performs multi-step work, creates artifacts | Task Workflow |
| Does heavy analysis that needs isolation | Forked Subagent |
| Has commands but is mostly guidelines | Simple Reference |
| Has 3+ complex workflows | Task Workflow |
| Reviews code written by the main agent | Forked Subagent |

When in doubt, start with **Task Workflow** — it's the most common and can be simplified if needed.

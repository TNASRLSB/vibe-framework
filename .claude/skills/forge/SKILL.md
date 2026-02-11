---
name: forge
description: "Meta-skill for creating, maintaining, and improving Claude Code skills. Use when: creating a new skill from scratch; improving an existing skill's trigger accuracy, structure, or content; auditing all skills for quality and consistency; fixing skill issues (trimming, splitting, dedup). Triggers on 'create skill', 'new skill', 'improve skill', 'audit skills', 'skill quality', 'fix skill', 'trim skill'."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Forge — Skill Factory

## Purpose

Forge guides the creation, maintenance, and improvement of skills in this framework. It encodes best practices from the Anthropic custom instructions guide and lessons learned across all existing skills.

---

## Commands

### `/forge create [name]`

Scaffold a new skill from template.

**Workflow:**
1. Ask: What does this skill do? Who uses it? When should it activate?
2. Generate directory structure:
   ```
   .claude/skills/[name]/
   ├── SKILL.md
   ├── references/    (if needed)
   ├── scripts/       (if needed)
   └── templates/     (if needed)
   ```
3. Write SKILL.md from `templates/skill-template.md`
4. Register in `.claude/docs/registry.md`
5. Verify: trigger description includes WHAT + WHEN, body follows progressive disclosure

**Output:** Complete skill scaffold ready for content.

### `/forge audit`

Semantic audit of all skills. Produces a categorized plan — does not modify files.

**Workflow:**
1. **Quantitative metrics** — Run `scripts/audit-skills.sh --json` for word count, structure
2. **Semantic analysis per-skill** — For each skill, read SKILL.md and classify every section using the decision matrix from `references/trimming-methodology.md`:

   | Claude needs it? | User needs it? | Recommendation |
   |---|---|---|
   | YES | YES | **Trim**: SKILL.md (brief) + KNOWLEDGE.md (explained) |
   | YES | NO | **Keep**: stays in SKILL.md |
   | NO | YES | **Move**: goes to KNOWLEDGE.md |
   | NO | NO | **Delete**: remove |

3. **Cross-skill analysis** — Identify:
   - Duplicate concepts across skills
   - Frontmatter triggers that compete/overlap
   - Content in SKILL.md that should be in references/ (split candidates)
4. **Categorize recommendations** per skill:
   - **Trim** — Sections to extract from SKILL.md → KNOWLEDGE.md
   - **Split** — Verbose sections to move to references/
   - **Improve** — Frontmatter fixes, structure corrections
   - **Dedup** — Cross-skill duplicate content to consolidate
5. **Generate execution plan** ordered by impact

**Output:** `.claude/docs/forge-audit.md` — Report with metrics, per-skill analysis, and execution plan.

**Report format:**
```markdown
# Forge Audit — YYYY-MM-DD

## Metrics

| Skill | Words | Status | Recommended actions |
|-------|-------|--------|---------------------|
| baptist | 2227 | OK | Trim (3 sections) |
| ghostwriter | 2060 | OK | Trim (2 sections), Dedup (1) |

## [Skill Name]

### Trim (→ KNOWLEDGE.md)
- **[Section name]** (lines X-Y): [Why Claude doesn't need it]
- Estimated reduction: -N%

### Keep
- [Sections that stay and why]

### Split (→ references/)
- **[Section name]**: [Why it's verbose/reference material]

### Cross-skill overlap
- [Concept] also present in [other skill] → consolidate

## Execution Plan
1. [Skill] ([N] actions)
2. [Skill] ([N] actions)
```

User reviews the report and says **PROCEED**.

### `/forge fix`

Execute recommendations from `forge-audit.md`. Reads the audit report and applies changes.

| Invocation | What it does |
|---|---|
| `/forge fix` | Execute ALL recommendations, skill by skill |
| `/forge fix [skill]` | Execute only recommendations for that skill |

**Per skill, executes in order:**

1. **Trim** — Apply the decision matrix:
   - Rewrite SKILL.md (only content that changes Claude's behavior)
   - Generate KNOWLEDGE.md from `templates/knowledge-template.md` (domain knowledge for human user)

2. **Split** — If recommended:
   - Move verbose sections to references/
   - Add routing instructions in SKILL.md

3. **Improve** — If recommended:
   - Fix frontmatter description
   - Correct structure issues

4. **Dedup** — If recommended:
   - Consolidate duplicate content (single source of truth)
   - Update cross-references

5. **Verify** — For each skill touched:
   - Frontmatter still triggers correctly?
   - All commands documented?
   - Routing to references/ works?
   - Behavior unchanged?

**Output:** Modified files + before/after report per skill.

---

## Best Practices Encoded

### Frontmatter Description

The description is the most critical part — it determines when the skill activates.

**Must include:**
- WHAT the skill does (first sentence)
- WHEN to use it (use cases, explicit triggers)
- Trigger keywords the user might say

**Good example:**
```
"Create, read, edit Office documents and PDFs. Use when user wants to:
create/edit .xlsx spreadsheets; create/edit .docx Word documents;
create/edit .pptx presentations; create/read/merge .pdf files.
Triggers on file extensions, 'spreadsheet', 'Excel', 'Word', 'PowerPoint',
'presentation', 'PDF', 'document'."
```

**Bad example:**
```
"A skill for documents"
```

### Progressive Disclosure (3 Levels)

| Level | What | Where | Loaded when |
|-------|------|-------|-------------|
| 1. Frontmatter | Identity + triggers | `description` field | Always (system prompt) |
| 2. SKILL.md body | Commands, workflows, key principles | Main file | When skill activates |
| 3. References | Detailed rules, patterns, checklists | `references/*.md` | On-demand via routing |

**Budget:** SKILL.md body should be under 3000 words. Move anything beyond that to references.

### Trimming Methodology

For the full decision matrix and content classification guide, read `references/trimming-methodology.md`.

### Skill Anatomy

For detailed structural requirements, read `references/skill-anatomy.md`.

### Quality Checklist

For the full quality checklist, read `references/quality-checklist.md`.

---

## Integration

- After `/forge create`, the new skill is registered in the registry
- `/forge audit` reports are saved to `.claude/docs/forge-audit.md`
- `/forge fix` reads from `forge-audit.md` and modifies skill files directly
- Trimmed content generates KNOWLEDGE.md files per skill (human documentation)

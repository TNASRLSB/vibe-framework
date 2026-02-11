# Trimming Methodology

How to evaluate skill content for trimming, splitting, and deduplication. This is the reference used by `/forge audit` and `/forge fix`.

---

## The Decision Matrix

For every section/block in a SKILL.md, answer two questions:

| Claude needs it? | User needs it? | Action |
|---|---|---|
| YES | YES | **Trim**: SKILL.md (brief rule) + KNOWLEDGE.md (explained) |
| YES | NO | **Keep**: stays in SKILL.md as-is |
| NO | YES | **Move**: goes to KNOWLEDGE.md only |
| NO | NO | **Delete**: remove entirely |

### "Claude needs it" means:

If you remove this content, Claude will behave differently (worse) when executing the skill. Examples:
- Commands and routing — YES (framework-specific)
- Inter-skill orchestration — YES (framework-specific)
- Framework-specific anti-patterns — YES (our design choices)
- Non-obvious workflow sequences — YES (Claude might reorder)
- Technical constraints/dependencies — YES (not discoverable)
- Explanation of well-known concepts (WCAG, AIDA, OWASP) — NO (Opus knows these)
- Generic best practices (DRY, descriptive names) — NO (everyone knows)
- Trivial examples — NO (not needed by anyone)

### "User needs it" means:

A non-expert human reading this would benefit from understanding the concept. Examples:
- Fogg Model explained — YES (not common knowledge)
- What E-E-A-T means — YES (SEO-specific)
- What OWASP Top 10 is — YES (security-specific)
- How to write a for-loop — NO (too basic)

---

## Content Classification Guide

| Content type | Goes in... | Why |
|---|---|---|
| Commands (`/skill cmd`) | SKILL.md | Framework-specific, Claude doesn't know |
| Inter-skill orchestration | SKILL.md | Framework-specific |
| Framework anti-patterns | SKILL.md | Our design choices, not Claude defaults |
| Non-obvious workflow order | SKILL.md | Claude might get it wrong |
| Technical constraints | SKILL.md | Dependencies not discoverable |
| Domain rules (brief) | SKILL.md | Claude needs to apply them |
| Domain concepts (explained) | KNOWLEDGE.md | User education |
| Well-known concept explanations | KNOWLEDGE.md | Claude knows, user may not |
| Generic best practices | Delete | Everyone knows |
| Trivial examples | Delete | No one needs |

---

## KNOWLEDGE.md Purpose

A KNOWLEDGE.md file explains the domain knowledge *behind* a skill to the human user. It's not a manual (that's the README) — it's a **"why things work this way"** document.

**Location:** `.claude/skills/[skill]/KNOWLEDGE.md`

**Audience:** Human user who wants to understand the principles behind Claude's behavior in this skill.

**Not loaded by Claude** — this is purely human documentation.

---

## Cross-Skill Analysis

When auditing, also check for:

1. **Duplicate concepts** — Same domain knowledge explained in multiple skills (e.g., ICE scoring in both Baptist and another skill)
2. **Overlapping triggers** — Frontmatter descriptions that compete for the same user phrases
3. **Inconsistent terminology** — Same concept with different names across skills

**Resolution:** Single source of truth. One skill owns the concept, others cross-reference.

---

## Verification After Trimming

| Check | Method |
|---|---|
| Skill still triggers | Verify frontmatter description unchanged or improved |
| Commands all documented | Compare command list before/after |
| Behavior unchanged | The trimmed SKILL.md should produce identical Claude behavior |
| Routing works | All `references/` links still valid |
| KNOWLEDGE.md is readable | A non-expert can understand the domain from it |

---

## Quick Reference

**Trim = remove from SKILL.md, preserve in KNOWLEDGE.md**
**Split = move verbose SKILL.md section to references/**
**Dedup = consolidate cross-skill duplicate into single source of truth**
**Delete = remove entirely (no value to anyone)**

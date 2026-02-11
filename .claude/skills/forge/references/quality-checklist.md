# Skill Quality Checklist

Use this checklist to evaluate any skill. Score each item as PASS / PARTIAL / FAIL.

---

## 1. Frontmatter (Weight: Critical)

- [ ] **Description includes WHAT** — First sentence clearly states what the skill does
- [ ] **Description includes WHEN** — Lists specific use cases or scenarios
- [ ] **Description includes KEYWORDS** — Trigger words/phrases a user would naturally say
- [ ] **Negative triggers** — Explicitly excludes out-of-scope requests (if ambiguity exists)
- [ ] **allowed-tools minimal** — Only tools the skill actually uses are listed
- [ ] **Name is lowercase-hyphenated** — Follows `skill-name` convention

## 2. Structure (Weight: High)

- [ ] **Clear purpose section** — 1-2 sentences explaining why this skill exists
- [ ] **Commands documented** — Every command has: description, workflow, output format
- [ ] **Progressive disclosure** — Verbose content in references/, not in SKILL.md body
- [ ] **SKILL.md under 3000 words** — Ideally under 2500
- [ ] **No XML tags** — Uses markdown formatting only
- [ ] **Routing instructions present** — References are linked with clear read instructions
- [ ] **Integration section** — Documents how this skill connects to others

## 3. Content Quality (Weight: High)

- [ ] **Actionable, not theoretical** — Commands produce concrete output
- [ ] **No duplicate content** — Information exists in one place, cross-referenced elsewhere
- [ ] **Examples where helpful** — Non-obvious commands have usage examples
- [ ] **Consistent terminology** — Uses glossary terms, no conflicting definitions
- [ ] **Output locations specified** — Every command that generates files states where
- [ ] **No redundant knowledge** — Doesn't explain concepts Opus already knows (WCAG, AIDA, OWASP)
- [ ] **Decision matrix applied** — Each section passes the "if removed, would Claude behave differently?" test
- [ ] **KNOWLEDGE.md exists** — Domain knowledge for human users extracted to KNOWLEDGE.md (if trimmed)

## 4. Scripts (Weight: Medium — skip if no scripts)

- [ ] **All scripts have --help** — Argparse or equivalent with usage docs
- [ ] **JSON output** — Parseable by Claude (not just human-readable text)
- [ ] **Exit codes meaningful** — 0=success, 1=user error, 2=system error
- [ ] **Graceful degradation** — Missing dependencies produce clear error, not crash
- [ ] **No hardcoded paths** — Uses relative paths or arguments

## 5. References (Weight: Medium — skip if no references)

- [ ] **Each file is focused** — One topic per reference file
- [ ] **Self-contained** — Understandable without reading SKILL.md first
- [ ] **Under 2000 words each** — Split further if larger
- [ ] **Linked from SKILL.md** — Every reference has a routing instruction in the main file

## 6. Templates (Weight: Low — skip if no templates)

- [ ] **Used by at least one command** — No orphan templates
- [ ] **Has placeholder syntax** — Clear where to fill in content
- [ ] **Documented in SKILL.md** — Listed in a templates table

---

## Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| All PASS | Excellent | No action needed |
| 1-2 PARTIAL | Good | Minor improvements |
| 3+ PARTIAL or 1 FAIL | Needs work | Create improvement plan |
| 2+ FAIL | Poor | Major rework needed |

---

## Common Issues by Skill Type

### Content Generation Skills (Ghostwriter, Scribe)
- Description too narrow (misses trigger keywords)
- Checklists in SKILL.md instead of references
- Missing output format specification

### Analysis Skills (Heimdall, Emmet, Baptist)
- Detection patterns bloating SKILL.md
- Missing severity/priority framework
- No integration protocol for delegating fixes

### Design Skills (Seurat)
- Token tables in SKILL.md instead of references
- Missing responsive/accessibility checks
- No visual QA step

### Meta Skills (Forge)
- Recursive quality (does it follow its own rules?)
- Templates up to date with current best practices
- Audit script produces accurate metrics

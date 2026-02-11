# Progressive Disclosure for Skills

How to structure skill content across three layers to minimize context usage while keeping all information accessible.

---

## The Three Layers

### Layer 1: Frontmatter Description

**Always loaded** in the system prompt. This is the "business card" of the skill.

**Budget:** 1-3 sentences (~50-100 words)

**Must answer:**
- What does this skill do? (first sentence)
- When should it activate? (use cases)
- What keywords trigger it? (explicit triggers)

**Optimization tips:**
- Front-load the most distinctive action verb
- Include file extensions if format-specific (`.xlsx`, `.pdf`)
- Include common user phrasings ("spreadsheet", "Excel", not just ".xlsx")
- Negative triggers help too ("NOT for Google Sheets API")

### Layer 2: SKILL.md Body

**Loaded when the skill activates.** This is the operational manual.

**Budget:** 1500-3000 words (ideally under 2500)

**Must contain:**
- Commands with workflows
- Key principles (rules that apply to every invocation)
- Integration points with other skills
- Routing instructions to Layer 3

**Should NOT contain:**
- Exhaustive reference tables (→ Layer 3)
- Lengthy code examples (→ Layer 3)
- Checklists with 20+ items (→ Layer 3)
- Historical notes or research citations (→ Layer 3)

### Layer 3: References

**Loaded on-demand** when the specific topic is needed.

**Budget:** Unlimited per file, but each file should be focused (~500-2000 words)

**Contains:**
- Detailed pattern libraries
- Exhaustive checklists
- Code examples and templates
- Research citations and benchmarks
- Format-specific deep dives

---

## When to Split

**Move content to references/ when:**
- A section is >500 words and not needed on every invocation
- Content is reference material (lookup tables, pattern lists)
- Content is format/type-specific (only needed for xlsx, not docx)
- Content is rarely accessed (advanced features, edge cases)

**Keep in SKILL.md when:**
- It's needed on every invocation (core workflow, key rules)
- It's the command documentation (users need to see available commands)
- It's the integration protocol (how skills connect)
- Removing it would break understanding of the skill's purpose

---

## Routing Patterns

### Table Router (for format-specific skills)

```markdown
## Routing

| Input | Reference |
|-------|-----------|
| `.xlsx` | Read `references/xlsx.md` |
| `.docx` | Read `references/docx.md` |
```

### Conditional Router (for topic-specific loading)

```markdown
## Detailed References

For [topic A] details, read `references/topic-a.md`
For [topic B] details, read `references/topic-b.md`
```

### Command Router (for command-specific deep dives)

```markdown
### `/skill command`

[Brief description and workflow here]

**Full reference:** `references/command-details.md`
```

---

## Measuring Compliance

| Metric | Target | Red Flag |
|--------|--------|----------|
| SKILL.md word count | <3000 | >5000 |
| Frontmatter description | 50-100 words | <20 or >150 |
| Reference files | Focused, <2000 words each | >3000 words |
| Routing instructions | Present for every reference | Missing (orphan references) |
| Layer 2 self-sufficiency | Usable without Layer 3 | Requires references for basic ops |

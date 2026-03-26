# Quality Checklist

Comprehensive quality criteria for evaluating Claude Code skills. Used by the audit and create workflows.

---

## Checklist

### Structure

| # | Check | Severity | Rationale |
|---|-------|----------|-----------|
| S1 | SKILL.md exists | Critical | Without it, the skill cannot be invoked |
| S2 | SKILL.md under 500 lines | Critical | Skills are navigators, not encyclopedias. Long files waste context window |
| S3 | YAML frontmatter present | Critical | Claude Code reads frontmatter to determine invocation behavior |
| S4 | references/ directory exists (if referenced) | Warning | Broken references cause runtime failures |
| S5 | No KNOWLEDGE.md file | Warning | v1 pattern, eliminated in v2. Content should be in references/ |
| S6 | No orphaned reference files | Info | Files in references/ not linked from SKILL.md are dead weight |
| S7 | Directory name matches frontmatter name | Critical | Mismatch causes invocation failures |

### Frontmatter

| # | Check | Severity | Rationale |
|---|-------|----------|-----------|
| F1 | `name` field present | Critical | Required for invocation |
| F2 | `name` is lowercase with hyphens only | Warning | Convention enforcement |
| F3 | `name` max 64 characters | Warning | System limitation |
| F4 | `description` field present | Critical | Claude uses this for auto-invocation decisions |
| F5 | `description` includes "Use when..." trigger | Warning | Without trigger guidance, auto-invocation is unreliable |
| F6 | `effort` field present | Critical | Controls thinking depth |
| F7 | `effort: max` for quality-critical skills | Warning | Skills that create or audit artifacts need maximum reasoning |
| F8 | `model` field appropriate for task | Info | opus for creation, sonnet for workflow, haiku for lookup |
| F9 | `disable-model-invocation` set explicitly | Info | Prevents accidental auto-invocation of destructive skills |

### Content

| # | Check | Severity | Rationale |
|---|-------|----------|-----------|
| C1 | Role description present (first paragraph) | Warning | Sets Claude's persona and scope |
| C2 | `$ARGUMENTS` routing table present | Warning | Without routing, multi-command skills break |
| C3 | Core principles section (3-5 items) | Info | Guides decision-making within the skill |
| C4 | Command table with descriptions | Warning | Users need to know what's available |
| C5 | Numbered workflow steps (`### Step N:`) | Warning | Ensures Claude follows steps in order |
| C6 | Verification step in every workflow | Critical | A skill that can't verify output is incomplete |
| C7 | References section at end of SKILL.md | Warning | Claude needs to know what reference files are available |
| C8 | String substitutions used correctly | Warning | `$ARGUMENTS`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_SESSION_ID}` |

### Quality

| # | Check | Severity | Rationale |
|---|-------|----------|-----------|
| Q1 | Self-review prevention | Warning | The same context that wrote code should not be the sole reviewer |
| Q2 | No hardcoded paths | Warning | Skills must work across projects |
| Q3 | Error handling for missing prerequisites | Info | Graceful failure when dependencies are missing |
| Q4 | Output format specified for reports | Info | Consistent output makes reports scannable |
| Q5 | No duplicate functionality with other skills | Warning | Check registry before creating overlapping skills |

---

## Common Anti-patterns

### 1. The Encyclopedia Skill

**Problem:** SKILL.md is 1500 lines because all knowledge is inline.

**Symptoms:**
- SKILL.md over 500 lines
- Detailed specifications mixed with workflow steps
- Examples and templates embedded in the main file

**Fix:** Extract detailed knowledge to `references/`. SKILL.md should route and decide, references should inform.

**Bad:**
```markdown
## Typography Scale

The typography scale follows a 1.25 ratio...
[200 lines of typography specifications]

## Color System

Colors are organized in three tiers...
[150 lines of color specifications]
```

**Good:**
```markdown
### Step 2: Define Typography

Read `${CLAUDE_SKILL_DIR}/references/typography.md` for the scale system.
Apply the appropriate scale based on the project's content density.
```

### 2. The Phantom Verifier

**Problem:** Skill says "verify the output" but doesn't say how.

**Symptoms:**
- Verification step says "check that everything works"
- No specific checks, no commands, no criteria

**Fix:** Verification must be concrete. Specify what to check, how to check it, and what passes.

**Bad:**
```markdown
### Step 5: Verify
Make sure everything looks good.
```

**Good:**
```markdown
### Step 5: Verify

1. Count lines: `wc -l skills/[name]/SKILL.md` — must be under 500
2. Check frontmatter: verify name, description, effort fields present
3. Check references: every file in references/ is linked from SKILL.md
4. Test invocation: `/vibe:[name] help` should show command list
```

### 3. The Self-Reviewer

**Problem:** Skill reviews its own output in the same context that created it.

**Symptoms:**
- "Now review the code you just wrote"
- No delegation to agents or separate passes
- Confirmation bias in quality checks

**Fix:** For critical review steps, either delegate to a subagent (context: fork) or use a structured checklist that forces objective evaluation.

### 4. The Missing Router

**Problem:** Multi-command skill doesn't check `$ARGUMENTS`.

**Symptoms:**
- Skill always runs the same workflow regardless of arguments
- Users can't access specific features
- No `help` command

**Fix:** Add argument routing at the top of SKILL.md:
```markdown
Check `$ARGUMENTS` to determine mode:
- `command1` → **Workflow 1**
- `command2` → **Workflow 2**
- No arguments or `help` → show available commands
```

### 5. The v1 Holdover

**Problem:** Skill still uses v1 patterns that were eliminated in v2.

**Symptoms:**
- KNOWLEDGE.md file exists alongside SKILL.md
- No YAML frontmatter
- No `$ARGUMENTS` routing
- No `${CLAUDE_SKILL_DIR}` references

**Fix:** Migrate to v2 format:
1. Move KNOWLEDGE.md content to `references/` files
2. Add YAML frontmatter
3. Add argument routing
4. Use string substitutions for paths

### 6. The Lone Wolf

**Problem:** Skill duplicates functionality that already exists in another skill.

**Symptoms:**
- Two skills that both audit code quality
- Overlapping command names
- Users confused about which skill to use

**Fix:** Check the registry before creating a new skill. If functionality overlaps, extend the existing skill or create a clear boundary.

---

## Scoring

When auditing, score each skill across four categories:

| Category | Pass criteria |
|----------|--------------|
| Structure | All Critical checks pass, no Warning failures |
| Content | All Critical checks pass, no more than 1 Warning failure |
| Quality | No Critical failures |
| References | All referenced files exist, no orphans |

**Overall score:** Count of passed categories out of 4.

| Score | Rating |
|-------|--------|
| 4/4 | Excellent — no action needed |
| 3/4 | Good — minor improvements recommended |
| 2/4 | Fair — significant issues to address |
| 1/4 | Poor — major rework needed |
| 0/4 | Broken — skill is non-functional |

---
name: reflect
description: Review captured corrections and turn them into permanent learnings. Run periodically or when prompted by the framework.
effort: max
disable-model-invocation: true
whenToUse: "Use periodically to review captured corrections and turn them into permanent learnings. Example: '/vibe:reflect', '/vibe:reflect --patterns'"
argumentHint: "[--patterns|--review|--clear]"
maxTokenBudget: 30000
---

# VIBE Reflect

You are the VIBE self-learning review system. You process corrections captured during sessions and help the user decide which ones become permanent learnings.

Check `$ARGUMENTS` to determine mode:
- If `$ARGUMENTS` contains `--patterns` → go to **Pattern Discovery Mode**
- Otherwise → go to **Default Mode**

---

## Default Mode

### Step 1: Read the Queue

```bash
QUEUE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl"
if [ -f "$QUEUE" ] && [ -s "$QUEUE" ]; then
  echo "QUEUE_EXISTS"
  wc -l < "$QUEUE"
else
  echo "QUEUE_EMPTY"
fi
```

If `QUEUE_EMPTY`:

> No corrections in the queue. Nothing to review.
>
> Corrections are captured automatically when you correct Claude's output during sessions.
> Run `/vibe:reflect` again after your next session.

**Stop here.**

If `QUEUE_EXISTS`, proceed.

### Step 2: Read All Entries

```bash
cat "${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl"
```

Each line is a JSON object with this structure:
```json
{
  "timestamp": "ISO-8601",
  "type": "correction|preference|pattern",
  "context": "what Claude did wrong or what the user changed",
  "correction": "what the right approach is",
  "file": "optional — file where it happened",
  "session_id": "optional"
}
```

### Step 3: Present Each Correction

For each entry in the queue, present it clearly:

```
Correction [N of TOTAL]
───────────────────────
Type:       [correction/preference/pattern]
When:       [timestamp, human-readable]
Context:    [what happened]
Correction: [what should happen instead]
File:       [file path, if present]
```

Then ask:

> What should I do with this?
> a) **Save to project** — becomes a project-level auto-memory (applies to this codebase only)
> b) **Save to user** — becomes a user-level auto-memory (applies to all your projects)
> c) **Discard** — not worth keeping

### Step 4: Apply the Decision

**For option (a) — project auto-memory:**

Write the learning to the project's auto-memory location. Format it as a clear, actionable instruction:

```bash
mkdir -p .claude/auto-memory
```

Append to `.claude/auto-memory/learnings.md`:

```markdown
- [Actionable instruction derived from the correction. Write as a rule, not a story.]
```

Example: If the correction says "user changed tabs to spaces in Python files," write:
`- Use spaces (not tabs) for Python indentation in this project.`

**For option (b) — user auto-memory:**

Write to the user-level auto-memory location:

```bash
mkdir -p ~/.claude/auto-memory
```

Append to `~/.claude/auto-memory/learnings.md`:

```markdown
- [Actionable instruction derived from the correction.]
```

**For option (c) — discard:**

Skip. No action needed.

### Step 5: Clear Processed Items

After all entries have been reviewed, remove them from the queue:

```bash
QUEUE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl"
# If any entries were skipped (user chose to defer), preserve them.
# Only truncate if all entries were processed.
# PROCESSED_LINES is a space-separated list of line numbers (1-based) that were reviewed.
# Write back only the lines that were NOT processed.
awk -v processed="$PROCESSED_LINES" '
BEGIN { split(processed, p, " "); for (i in p) skip[p[i]]=1 }
!(NR in skip)
' "$QUEUE" > "${QUEUE}.tmp" && mv "${QUEUE}.tmp" "$QUEUE"
```

The `PROCESSED_LINES` variable must contain the 1-based line numbers of every entry the user triaged (saved or discarded). Deferred/unanswered entries are preserved in the queue for the next run.

### Step 6: Summary

```
Reflect — Complete
==================
Reviewed:          [N] corrections
Saved to project:  [N]
Saved to user:     [N]
Discarded:         [N]
```

If any were saved:

> These learnings are now active. Claude will consider them in future sessions automatically.

---

## Pattern Discovery Mode

**Triggered by:** `$ARGUMENTS` containing `--patterns`

### Step 1: Gather Session Data

Look for recent session artifacts:

```bash
# Check for auto-memory entries
cat .claude/auto-memory/learnings.md 2>/dev/null | wc -l
cat ~/.claude/auto-memory/learnings.md 2>/dev/null | wc -l
```

```bash
# Check queue for recurring patterns
QUEUE="${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl"
cat "$QUEUE" 2>/dev/null | sort | uniq -c | sort -rn | head -20
```

```bash
# Check for repeated correction types
cat "${CLAUDE_PLUGIN_DATA:-/tmp/vibe-plugin-data}/learnings/queue.jsonl" 2>/dev/null | \
  grep -o '"type":"[^"]*"' | sort | uniq -c | sort -rn
```

### Step 2: Analyze Patterns

Look for:

1. **Repeated corrections** — same mistake corrected 3+ times indicates a missing rule or skill gap
2. **Domain clusters** — multiple corrections about the same topic (e.g., all about CSS, all about testing) indicate a domain where a custom skill would help
3. **Workflow patterns** — sequences of actions performed repeatedly that could be automated into a skill

### Step 3: Present Findings

For each pattern found:

```
Pattern: [descriptive name]
──────────────────────────
Frequency:   [N occurrences]
Category:    [repeated-correction | domain-cluster | workflow-pattern]
Evidence:    [list the specific corrections/actions that form this pattern]
Suggestion:  [what to do about it]
```

Suggestions fall into three categories:

1. **Add a rule** — simple enough to be an auto-memory entry
   > Suggest adding to project or user auto-memory.

2. **Create a skill** — complex enough to warrant a dedicated skill
   > This pattern could become a skill. Run `/vibe:forge create [name]` to scaffold it.

3. **Modify existing skill** — an existing skill is not handling something well
   > Skill `[name]` may need updating to handle this case.

### Step 4: Confirmation

> These are suggestions only. I will not create or modify anything without your explicit instruction.
>
> Would you like me to act on any of these? Specify by number, or say "none" to finish.

If the user selects patterns to act on, execute the appropriate action:
- For rules: write to the specified auto-memory file
- For new skills: invoke Forge with the user's guidance
- For skill modifications: open the relevant SKILL.md for review

### Step 5: Summary

```
Pattern Discovery — Complete
=============================
Patterns found:    [N]
Rules suggested:   [N]
Skills suggested:  [N]
Actions taken:     [list what was done, if anything]
```

---

## Behavioral Rules

1. **Never auto-save.** Every correction must be explicitly triaged by the user.
2. **Write rules, not stories.** Learnings saved to auto-memory must be short, actionable instructions. Not "the user once said..." but "Always use X instead of Y."
3. **Deduplicate.** Before saving a learning, check if a similar rule already exists in the target auto-memory file. If so, inform the user and suggest merging or skipping.
4. **Preserve queue integrity.** Only clear entries that were explicitly processed. If the session ends mid-review, unprocessed entries remain in the queue.
5. **No hallucinated patterns.** In pattern discovery mode, only report patterns backed by actual data from the queue or auto-memory files. If there is insufficient data, say so.
6. **Respect scope.** Project learnings stay in the project. User learnings go to the user directory. Never mix them up.

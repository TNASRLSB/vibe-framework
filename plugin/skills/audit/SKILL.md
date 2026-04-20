---
name: audit
description: Project audit orchestrator. Scans project, proposes relevant domain audits, launches agents in parallel. Use when auditing an existing project for quality, security, accessibility, SEO, or conversion.
effort: max
model:
  primary: opus-4-7
  effort: xhigh
  fallback: opus-4-6
whenToUse: "Use when auditing an existing project for quality, security, accessibility, SEO, or conversion. Examples: '/vibe:audit', '/vibe:audit --all', '/vibe:audit security'"
argumentHint: "[--all|security|seo|ui|code|conversion|video|docs]"
maxTokenBudget: 60000
---

# Audit — Project Quality Orchestrator

You are the VIBE audit orchestrator. Your job is to analyze a project, determine which domain audits are relevant, launch the appropriate audit agents, and present their findings.

Check `$ARGUMENTS` to determine mode:

- If `$ARGUMENTS` contains `--status` → go to **Status Mode**
- If `$ARGUMENTS` contains specific agent names (seurat, ghostwriter, baptist, emmet, heimdall, orson, scribe) → go to **Direct Launch Mode**
- Otherwise → go to **Interactive Mode**

Extract flags from `$ARGUMENTS`:
- `--fix` → pass to all agents: auto-merge worktrees after completion
- `--dry-run` → pass to all agents: report only, no fixes
- `--all` → skip user confirmation in Interactive Mode, launch all relevant agents

---

## Status Mode

Read agent memory files without launching any agents. Present a quick health overview.

### Step 1: Read agent memories

Read all files matching `.claude/agent-memory/vibe-*/MEMORY.md`. For each, extract the metrics comment line:
`<!-- metrics: {"date":"...","critical":N,...} -->`

### Step 2: Compute delta

Run `git log --oneline --since="LAST_AUDIT_DATE"` to count changes since last audit. Group changed files by domain:
- Frontend (html, css, tsx, jsx, vue, svelte) → seurat, baptist
- Content (md, mdx, copy text in html) → ghostwriter
- Code (js, ts, py, go, rs, java) → emmet, heimdall
- Video (mp4, webm, mov) → orson
- Documents (pdf, docx, xlsx, pptx) → scribe

### Step 3: Present status

```
Project Health (last audit: YYYY-MM-DD)
  Security:      N critical, N warning
  Accessibility: N issues (N unresolved from previous)
  SEO:           N issues (N unresolved from previous)
  Code quality:  N issues
  CRO:           N issues

  Delta since last audit: N files changed
    Frontend: N files → seurat, baptist relevant
    Content: N files → ghostwriter relevant
    Code: N files → emmet, heimdall relevant

  Suggested: /vibe:audit [relevant agents]
```

Done. Do not launch any agents.

---

## Direct Launch Mode

Agent names are specified in `$ARGUMENTS`. Skip scanning and proposal.

### Step 1: Parse agent names

Extract agent names from arguments. Valid names: seurat, ghostwriter, baptist, emmet, heimdall, orson, scribe.

### Step 2: Launch agents

For each specified agent, launch using the Agent tool:
- Set `subagent_type` to the agent name
- Pass a prompt describing the audit task
- Pass any flags (--fix, --dry-run) in the prompt
- Launch all agents in parallel (multiple Agent tool calls in one message)

### Step 3: Collect and present

As each agent completes, present its report immediately. After all agents complete, go to **Synthesis**.

---

## Interactive Mode

Full workflow: scan, propose, confirm, launch.

### Step 1: Scan the project

Analyze the project to understand what exists:

```bash
# File type inventory
find . -type f -not -path './.git/*' -not -path './node_modules/*' | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

Also check:
- `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml` — for stack detection
- `public/`, `src/`, `pages/`, `app/` — for frontend presence
- `*.html`, `*.md`, `sitemap.xml`, `robots.txt` — for content presence
- Video and document files — for media presence

### Step 2: Read agent memories

Read all `.claude/agent-memory/vibe-*/MEMORY.md` files. Note:
- When each agent last ran
- What issues are still open
- What changed since last audit (git log)

### Step 3: Propose agents

Based on scan results, propose which agents to run and why:

```
Project analysis:
  Stack: [detected stack]
  Frontend files: N → seurat relevant
  Content pages: N → ghostwriter relevant
  Conversion forms: N → baptist relevant
  Code files: N → emmet relevant
  API endpoints: N → heimdall relevant
  Video files: N → orson relevant (or "none found, skip orson")
  Documents: N → scribe relevant (or "none found, skip scribe")

  [If previous audits exist:]
  Since last audit (YYYY-MM-DD): N files changed
  Open issues: seurat (N), ghostwriter (N), ...

Proposed audit: seurat, ghostwriter, baptist, emmet, heimdall
Skip: orson (no video files), scribe (no documents)

Proceed? (confirm, or adjust: "add orson", "remove baptist", etc.)
```

If `--all` flag is set, skip confirmation and launch all relevant agents.

### Step 4: Launch agents

After user confirms, launch all approved agents in parallel using the Agent tool.

For each agent, construct a prompt:
```
Run a [domain] audit on this project.
[If --fix:] Apply all fixes including proposals.
[If --dry-run:] Report only, do not modify any files.
[If delta available:] Focus on files changed since YYYY-MM-DD: [file list]
Follow the audit protocol in ${CLAUDE_PLUGIN_ROOT}/skills/_shared/audit-protocol.md.
```

Launch all agents simultaneously (multiple Agent tool calls in a single message).

### Step 5: Present results

As each agent completes, present its findings report immediately. Do not wait for all agents.

After all agents complete, go to **Synthesis**.

---

## Synthesis

After all agents have reported:

### Cross-domain correlation

Look for related findings across agents. Examples:
- Seurat finds contrast issue on CTA + Baptist finds low conversion on same CTA → likely related
- Heimdall finds exposed endpoint + Emmet finds no tests for that endpoint → compound risk
- Ghostwriter finds missing meta + Seurat finds broken heading hierarchy → page quality pattern

Present correlations:
```
Cross-domain findings:
- [seurat + baptist] Low contrast on .btn-primary CTA (2.8:1) may contribute
  to low conversion rate on signup form. Fixing contrast could improve both.
- [heimdall + emmet] /api/users endpoint has no auth check AND no tests.
  Critical security gap with no safety net.
```

### Aggregate rule proposals

Collect all suggested rules from all agents. Present them together:
```
Suggested project rules:
1. "All images must have descriptive alt text" (seurat, found 8 violations)
   → Save as project rule? [yes/no]
2. "All API endpoints must validate input" (heimdall, found 5 violations)
   → Save as project rule? [yes/no]
```

If user accepts a rule, append it to `.claude/auto-memory/learnings.md`:
```
- [rule text] (source: [agent] audit, YYYY-MM-DD)
```

### Worktree summary

If agents made fixes (not --dry-run):
```
Worktree changes:
  seurat: 5 files changed (3 fixes, 2 proposals)
  ghostwriter: 3 files changed (2 fixes, 1 proposal)
  heimdall: 1 file changed (1 fix)

  [If no --fix flag:]
  Review diffs with: git diff [worktree-branch]
  Merge with: git merge [worktree-branch]

  [If --fix flag:]
  All changes auto-merged to working branch.

  [If conflicts detected:]
  ⚠ seurat and baptist both modified src/styles/buttons.css
    Review manually: git diff seurat-worktree..baptist-worktree -- src/styles/buttons.css
```

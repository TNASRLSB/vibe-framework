---
name: setup
description: First-run configuration for VIBE Framework. Configures Claude Code for maximum quality output. Run after installing the plugin.
effort: max
disable-model-invocation: true
whenToUse: "Use after installing the VIBE plugin for first-run configuration. Example: '/vibe:setup'"
maxTokenBudget: 20000
---

# VIBE Setup Wizard

You are the VIBE Framework first-run configuration wizard. Walk the user through setup step by step. Be concise, show what you find, propose changes, and apply nothing without explicit approval.

---

## Step 1: Diagnosis

### 1.1 Read Current Settings

Read both settings files. Either or both may not exist yet — that is normal.

```bash
cat ~/.claude/settings.json 2>/dev/null || echo '{"status": "file not found"}'
```

```bash
cat .claude/settings.json 2>/dev/null || echo '{"status": "file not found"}'
```

Record what you find:
- **Model:** extract from settings or note "not set (default)"
- **Effort level:** check `env.CLAUDE_CODE_EFFORT_LEVEL` or note "not set"
- **Existing permissions:** note any `allowedTools`, `permissions`, or `trust` settings
- **Existing env vars:** note all entries under `env`

### 1.2 Detect OS and Shell

```bash
uname -s && echo "---" && echo "$SHELL" && echo "---" && echo "${BASH_VERSION:-not bash}" && echo "---" && echo "${ZSH_VERSION:-not zsh}"
```

### 1.3 Detect Project Stack

Search for manifest files in the project root **and** up to 2 levels deep (covers monorepos, `frontend/`, `backend/`, `packages/*`, etc.). Never assume any specific subdirectory exists.

```bash
find . -maxdepth 2 \( \
  -name 'package.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' -o -name 'package-lock.json' \
  -o -name 'pyproject.toml' -o -name 'setup.cfg' -o -name 'setup.py' -o -name 'requirements.txt' -o -name 'Pipfile' \
  -o -name 'Cargo.toml' -o -name 'go.mod' -o -name 'go.sum' \
  -o -name 'Gemfile' -o -name 'composer.json' -o -name 'build.gradle' -o -name 'build.gradle.kts' -o -name 'pom.xml' \
  -o -name '*.sln' -o -name '*.csproj' -o -name 'Package.swift' -o -name 'Makefile' -o -name 'CMakeLists.txt' \
  -o -name 'pubspec.yaml' -o -name 'mix.exs' \
\) ! -path '*/node_modules/*' ! -path '*/.git/*' ! -path '*/target/*' ! -path '*/vendor/*' ! -path '*/dist/*' 2>/dev/null | sort
```

**Record every manifest path found** (e.g., `./package.json`, `./frontend/package.json`, `./backend/pyproject.toml`). Use these exact paths in Steps 1.4 and 1.5. Never `cd` into subdirectories — always use absolute or relative paths from the project root.

### 1.4 Detect Available Linters

**Only run checks for stacks whose manifest files were actually found in Step 1.3.** Skip any section whose manifest was not found. Use the **exact paths** recorded in Step 1.3 — never hardcode `./package.json` or `cd` into assumed subdirectories.

For each `package.json` found in Step 1.3 (substitute `PKG_PATH` with the actual path, e.g., `./frontend/package.json`):
```bash
node -e "
const p = require('PKG_PATH');
const deps = {...(p.dependencies||{}), ...(p.devDependencies||{})};
const tools = ['eslint','prettier','biome','oxlint','stylelint','typescript'];
tools.forEach(t => { if(deps[t]) console.log('PKG_PATH → ' + t + ': ' + deps[t]); });
" 2>/dev/null || echo "PKG_PATH: could not read or node not available"
```

For each `pyproject.toml` found (substitute `PYPROJ_PATH`):
```bash
grep -E '^\[tool\.(ruff|black|flake8|mypy|pylint|isort|pyright)\]' PYPROJ_PATH 2>/dev/null
```

For each `setup.cfg` found (substitute `SETUP_PATH`):
```bash
grep -E '(ruff|black|flake8|mypy|pylint)' SETUP_PATH 2>/dev/null
```

For each `Cargo.toml` found (substitute `CARGO_PATH`):
```bash
grep -q '\[package\]' CARGO_PATH 2>/dev/null && echo "rustfmt: $(rustfmt --version 2>/dev/null || echo 'not found')" && echo "clippy: $(cargo clippy --version 2>/dev/null || echo 'not found')"
```

For each `go.mod` found (substitute `GOMOD_PATH`):
```bash
test -f GOMOD_PATH && echo "gofmt: $(gofmt -h 2>&1 | head -1 || echo 'not found')" && echo "golint: $(which golangci-lint 2>/dev/null || echo 'not found')"
```

### 1.5 Detect Build/Test/Lint Commands

Extract standard commands from manifest files found in Step 1.3. **Only run checks for manifests that were actually found. Use the exact paths from Step 1.3.**

For each `package.json` found (substitute `PKG_PATH`):
```bash
node -e "const p=require('PKG_PATH'); const s=p.scripts||{}; ['build','test','lint','format','typecheck','dev','start'].forEach(k=>{if(s[k])console.log('PKG_PATH → '+k+': '+s[k])})" 2>/dev/null
```

For each `pyproject.toml` found (substitute `PYPROJ_PATH`):
```bash
grep -A1 '\[project.scripts\]' PYPROJ_PATH 2>/dev/null
grep -A1 '\[tool.pytest' PYPROJ_PATH 2>/dev/null && echo "test: pytest"
```

For each `Cargo.toml` found (substitute `CARGO_PATH`):
```bash
test -f CARGO_PATH && echo "build: cargo build" && echo "test: cargo test" && echo "lint: cargo clippy"
```

For each `go.mod` found (substitute `GOMOD_PATH`):
```bash
test -f GOMOD_PATH && echo "build: go build ./..." && echo "test: go test ./..." && echo "lint: golangci-lint run"
```

For each `Makefile` found (substitute `MAKE_PATH`):
```bash
grep -E '^[a-zA-Z_-]+:' MAKE_PATH 2>/dev/null | head -20
```

### 1.6 Present Diagnosis

Show the user a summary table. Two variants depending on whether the manifests found in Step 1.3 span one parent directory (single-workspace) or more (monorepo-like).

**Single-workspace variant** (manifests in 0–1 distinct parent directories):

```
VIBE Setup — Diagnosis
======================
OS:        [detected]
Shell:     [detected]
Stack:     [detected languages/frameworks]
Linters:   [detected tools]
Model:     [current or "not set"]
Effort:    [current or "not set"]
Build cmd: [detected or "not found"]
Test cmd:  [detected or "not found"]
Lint cmd:  [detected or "not found"]
```

**Monorepo-like variant** (manifests in 2+ distinct parent directories):

```
VIBE Setup — Diagnosis
======================
OS:        [detected]
Shell:     [detected]
Stack:     [aggregated union of all detected stacks, e.g. "JS/TS, Python"]
Linters:   [aggregated union of all detected linters, e.g. "eslint, ruff, mypy"]
Model:     [current or "not set"]
Effort:    [current or "not set"]
Workspaces: [N] detected — per-workspace commands available via @vibe:researcher
```

Do not attempt to show single Build/Test/Lint rows in the monorepo variant — any single choice would misrepresent the other workspaces. The researcher agent (Step 6) produces the per-workspace breakdown in the CLAUDE.md map.

---

## Step 2: LSP Detection

### 2.1 Determine Primary Language

Identify the primary language from:
1. Manifest files found in Step 1
2. File extension distribution (if ambiguous):

```bash
find . -maxdepth 3 -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.py' -o -name '*.rs' -o -name '*.go' -o -name '*.java' -o -name '*.kt' -o -name '*.php' -o -name '*.cs' -o -name '*.swift' -o -name '*.c' -o -name '*.cpp' -o -name '*.h' \) ! -path '*/node_modules/*' ! -path '*/.git/*' ! -path '*/target/*' ! -path '*/vendor/*' ! -path '*/dist/*' ! -path '*/__pycache__/*' 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10
```

### 2.2 LSP Mapping

Use this mapping to determine the recommended LSP plugin:

| Language | LSP Plugin Name |
|----------|----------------|
| TypeScript / JavaScript | `typescript-lsp` |
| Python | `pyright-lsp` |
| Rust | `rust-analyzer-lsp` |
| Go | `gopls-lsp` |
| Java | `jdtls-lsp` |
| PHP | `php-lsp` |
| C# | `csharp-lsp` |
| Swift | `swift-lsp` |
| C / C++ | `clangd-lsp` |
| Kotlin | `kotlin-lsp` |

### 2.3 Check If LSP Is Installed

```bash
cat ~/.claude/settings.json 2>/dev/null | grep -o '"[a-z_-]*-lsp"' | tr -d '"' | sort -u
```

Also check installed plugins:

```bash
ls ~/.claude/plugins/ 2>/dev/null
```

### 2.4 Recommend LSP

If the LSP for the primary language is not detected:

> **Recommendation:** Install `[plugin-name]` for [language] support.
> This enables real-time type checking, go-to-definition, and diagnostics.
>
> ```
> claude plugin install [plugin-name]
> ```

If already installed, confirm:

> **LSP:** `[plugin-name]` is installed. [Language] diagnostics are active.

---

## Step 3: Status Line

### 3.1 Propose Status Line

Propose a status bar configuration for the user's settings:

```json
{
  "statusLine": {
    "type": "command",
    "command": "jq -r '\"[\\(.model.display_name)] ctx \\(.context_window.used_percentage // 0 | floor)% | $\\(.cost.total_cost_usd // 0 | tostring | .[0:5])\"'"
  }
}
```

**Important:** `statusLine` must be an object with `type: "command"` and a `command` field containing a shell command. The command receives JSON on stdin from Claude Code. Template syntax like `{{context_percent}}` does NOT work — always use the jq command format shown above.

Explain what it shows:
- **Model:** the active model name
- **Context %:** how full the context window is
- **Session cost:** estimated spend for the current session

### 3.2 Ask for Confirmation

> Would you like me to add this status line to your user settings (`~/.claude/settings.json`)?
> This is cosmetic — it only affects the status bar display.

Only proceed if user says yes.

---

## Step 4: Proposal

### 4.1 Build Recommendation

Compare current settings against VIBE recommended settings:

```
Configuration Proposal
======================

Setting                        Current              Recommended
─────────────────────────────────────────────────────────────────
Model                          [current]            opus
Effort level                   [current]            max
Skill char budget              [current]            50000
LSP plugin                     [current]            [detected]-lsp
Status line                    [current]            [proposed above]
Adaptive thinking              [current]            disabled
```

### 4.2 Explain the Recommendations

- **opus:** The highest capability model. Claude Code automatically uses extended context (1M tokens) when your plan supports it — no manual configuration needed.
- **effort: max:** Forces Claude to think thoroughly on every response. No shortcuts, no lazy outputs. This is the core of what VIBE does.
- **SLASH_COMMAND_TOOL_CHAR_BUDGET: 50000:** Ensures all 12 skills appear in the autocomplete menu. The default budget (~20K chars) is too small when multiple plugins are installed; raising it to 50K prevents skills from being silently truncated.
- **LSP:** Enables Claude to use language-aware diagnostics for catching errors before they reach you.

### 4.3 Ask for Approval

> I will update `~/.claude/settings.json` with these changes.
> Existing settings will be preserved — I only merge new values.
>
> **Approve?** (yes/no)

**Do not proceed without explicit approval.**

---

## Step 5: Application

**Only execute this step after the user approves in Step 4.**

### 5.1 Update User Settings

Merge recommended values into `~/.claude/settings.json`. Never overwrite the file — always read, merge, write.

```bash
# Read existing settings (or start with empty object)
EXISTING=$(cat ~/.claude/settings.json 2>/dev/null || echo '{}')
```

Use `jq` to merge (preferred) or construct manually:

```bash
echo "$EXISTING" | jq '
  .model = "opus" |
  .env.CLAUDE_CODE_EFFORT_LEVEL = "max" |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000" |
  .env.CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING = "1"
' > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

If the user approved the status line in Step 3, include it in the merge.

If `jq` is not available, construct the JSON carefully by hand, preserving all existing keys.

**Critical rules:**
- Never delete existing keys
- Never overwrite `permissions`, `allowedTools`, `trust`, or `mcpServers`
- If a key already has the recommended value, skip it
- Create `~/.claude/` directory if it does not exist

### 5.2 Generate Minimal CLAUDE.md

Check first:

```bash
test -f CLAUDE.md && echo "EXISTS" || echo "MISSING"
```

**If EXISTS**, do not touch it. Inform the user:

> Existing CLAUDE.md found. Skipping generation.

**If MISSING**, decide between single-workspace generation and monorepo delegation based on the manifests found in Step 1.3. Compute the number of distinct parent directories across all manifest paths:

```bash
# Example: manifests=("./frontend/package.json" "./backend/pyproject.toml")
# Parent dirs: "./frontend", "./backend" → 2 distinct → monorepo-like
# Example: manifests=("./package.json")
# Parent dirs: "." → 1 distinct → single-workspace
# Example: manifests=("./backend/pyproject.toml" "./backend/setup.cfg")
# Parent dirs: "./backend" → 1 distinct → single-workspace (multi-config, one project)
```

**If 2 or more distinct parent directories** (monorepo-like layout), skip seed CLAUDE.md generation and inform the user:

> Multiple manifests across different subdirectories detected. Skipping seed CLAUDE.md — a flat template would be misleading for this repo structure. Run `@vibe:researcher` in Step 6 to generate a proper per-workspace codebase map.

Do **not** write a file in this case. The researcher agent is the right tool to map multi-workspace projects; a flat seed with arbitrary per-workspace commands would be actively harmful to future sessions landing cold in the repo.

**If 0 or 1 distinct parent directories** (single workspace, or empty project), generate a minimal CLAUDE.md using the commands detected in Step 1:

```markdown
# [Project Name from directory or package.json]

Build: `[detected build command or "not detected"]`
Test: `[detected test command or "not detected"]`
Lint: `[detected lint command or "not detected"]`
```

For empty projects where no commands were detected, use `"not detected"` for all three. A CLAUDE.md with placeholders is better than none — it gives future sessions an anchor file and signals that VIBE is configured. The user will re-run `/vibe:setup` once code exists, and the file will be updated then.

---

## Step 6: Codebase Mapping (Optional)

### 6.1 Offer Exploration

**Always present this offer, including for empty or minimal projects.** Even a nearly-empty project may have config files, a README, or a git history worth mapping.

> **Optional:** I can run an initial codebase exploration using the researcher agent.
> This will map the project structure, key files, and architecture into auto-memory
> so future sessions start with full context.
>
> This may take a minute. **Run codebase mapping?** (yes/no)

### 6.2 Execute If Approved

If the user says yes, invoke the researcher agent:

> @vibe:researcher Map this codebase. Identify: project structure, entry points, key modules, data flow, external dependencies, and configuration files. Save findings to auto-memory.

If the user declines, skip without comment.

---

## Step 7: Verification

### 7.1 Confirm Changes

Read back the updated settings to confirm:

```bash
cat ~/.claude/settings.json
```

### 7.2 Summary

Show a final summary of everything that was done:

```
VIBE Setup — Complete
=====================
[x] Settings diagnosed
[x] LSP: [status]
[x] Status line: [configured/skipped]
[x] Model set to opus
[x] Effort set to max
[x] CLAUDE.md: [generated/already existed]
[x] Codebase mapping: [done/skipped]
[x] Adaptive thinking: disabled (full depth)

Restart Claude Code to apply all changes.
```

### 7.3 Restart Notice

> **Important:** Restart Claude Code (`claude` in terminal) for settings changes to take effect.
> The VIBE Framework is now active. All skills are available via `/vibe:[skill-name]`.

---

## Behavioral Rules

1. **Non-destructive:** Always merge settings, never overwrite. Read before writing.
2. **Idempotent:** If a setting already matches the recommendation, skip it and note "already configured."
3. **Stack-aware:** Only suggest linters and LSP relevant to the detected stack. Do not suggest Python tools for a Rust project.
4. **Transparent:** Show every change before applying. No silent modifications.
5. **Graceful degradation:** If `jq` is missing, handle JSON manually. If a manifest file is absent, skip that check. Never fail hard on a missing tool.
6. **No assumptions:** If you cannot detect something, say so. Do not guess.
7. **No directory assumptions:** Never assume subdirectories like `frontend/`, `backend/`, `src/`, or `packages/` exist. Only reference paths that were discovered by `find` in Step 1.3. Never use `cd` to enter assumed subdirectories — use full paths from the project root.
8. **Re-runnable:** Running setup again should detect what is already configured and only propose missing pieces.

---

## Error Handling

- **No manifest files found:** Inform user this appears to be an empty or non-standard project. Skip stack-specific steps (linter detection, build/test/lint commands) but **still execute all other steps**: settings configuration (Step 4–5.1), CLAUDE.md generation (Step 5.2), codebase mapping offer (Step 6), and verification (Step 7). An empty project is not a reason to short-circuit the wizard.
- **Settings file is malformed JSON:** Back up the original, inform user, offer to create fresh settings.
- **Permission denied on ~/.claude/:** Inform user and provide manual instructions.
- **No internet / plugin install fails:** Note the failure, continue with remaining steps.

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

Check for manifest files to identify the project stack. Run all checks in parallel:

```bash
# Package managers and languages
ls -1 package.json pnpm-lock.yaml yarn.lock package-lock.json \
      pyproject.toml setup.cfg setup.py requirements.txt Pipfile \
      Cargo.toml go.mod go.sum \
      Gemfile composer.json build.gradle build.gradle.kts pom.xml \
      *.sln *.csproj Package.swift Makefile CMakeLists.txt \
      pubspec.yaml mix.exs 2>/dev/null
```

### 1.4 Detect Available Linters

Based on detected stack, check which linters/formatters are available:

**JavaScript/TypeScript projects** — check package.json for:
```bash
node -e "
const p = require('./package.json');
const deps = {...(p.dependencies||{}), ...(p.devDependencies||{})};
const tools = ['eslint','prettier','biome','oxlint','stylelint','tsc'];
tools.forEach(t => { if(deps[t]) console.log(t + ': ' + deps[t]); });
" 2>/dev/null || echo "no package.json or node not available"
```

**Python projects** — check pyproject.toml and installed tools:
```bash
grep -E '^\[tool\.(ruff|black|flake8|mypy|pylint|isort|pyright)\]' pyproject.toml 2>/dev/null
grep -E '(ruff|black|flake8|mypy|pylint)' setup.cfg 2>/dev/null
```

**Rust projects:**
```bash
grep -q '\[package\]' Cargo.toml 2>/dev/null && echo "rustfmt: $(rustfmt --version 2>/dev/null || echo 'not found')" && echo "clippy: $(cargo clippy --version 2>/dev/null || echo 'not found')"
```

**Go projects:**
```bash
test -f go.mod && echo "gofmt: $(gofmt -h 2>&1 | head -1 || echo 'not found')" && echo "golint: $(which golangci-lint 2>/dev/null || echo 'not found')"
```

### 1.5 Detect Build/Test/Lint Commands

Extract standard commands from manifest files:

```bash
# Node projects
node -e "const p=require('./package.json'); const s=p.scripts||{}; ['build','test','lint','format','typecheck','dev','start'].forEach(k=>{if(s[k])console.log(k+': '+s[k])})" 2>/dev/null
```

```bash
# Python projects — check pyproject.toml for scripts
grep -A1 '\[project.scripts\]' pyproject.toml 2>/dev/null
grep -A1 '\[tool.pytest' pyproject.toml 2>/dev/null && echo "test: pytest"
```

```bash
# Rust projects
test -f Cargo.toml && echo "build: cargo build" && echo "test: cargo test" && echo "lint: cargo clippy"
```

```bash
# Go projects
test -f go.mod && echo "build: go build ./..." && echo "test: go test ./..." && echo "lint: golangci-lint run"
```

```bash
# Makefile targets
grep -E '^[a-zA-Z_-]+:' Makefile 2>/dev/null | head -20
```

### 1.6 Present Diagnosis

Show the user a summary table:

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
```

### 4.2 Explain the Recommendations

- **opus:** The highest capability model. Use `opus[1m]` (1M context variant) if you have extra usage enabled and need deep codebase understanding across very large projects.
- **effort: max:** Forces Claude to think thoroughly on every response. No shortcuts, no lazy outputs. This is the core of what VIBE does.
- **SLASH_COMMAND_TOOL_CHAR_BUDGET: 50000:** Ensures all 12 skills appear in the autocomplete menu. The default budget (~20K chars) is too small when multiple plugins are installed; raising it to 50K prevents skills from being silently truncated.
- **LSP:** Enables Claude to use language-aware diagnostics for catching errors before they reach you.

### 4.3 Extended Context (Optional)

After presenting the proposal, ask the user about 1M context:

> **Extended context:** Claude supports a 1M token context window (`opus[1m]`), which gives deeper codebase understanding on large projects. This requires:
> 1. A **Max plan** (5x or 20x)
> 2. **Extra usage** enabled (run `/extra-usage` in Claude Code)
>
> Do you have a Max plan and want to use `opus[1m]`? (yes/no/not sure)

**If yes:** update the proposed model from `opus` to `opus[1m]` and note the change in the proposal table before proceeding to approval.

**If not sure:** suggest the user check their plan at https://console.anthropic.com or in Claude Code settings. Default to `opus` if they can't confirm.

**If no:** keep `opus` as proposed. No further action needed.

### 4.4 Ask for Approval

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

Use the model chosen in Step 4.3: `opus[1m]` if the user opted in, `opus` otherwise.

```bash
# Read existing settings (or start with empty object)
EXISTING=$(cat ~/.claude/settings.json 2>/dev/null || echo '{}')
```

Use `jq` to merge (preferred) or construct manually. Replace `MODEL` with the chosen value (`opus` or `opus[1m]`):

```bash
echo "$EXISTING" | jq '
  .model = "MODEL" |
  .env.CLAUDE_CODE_EFFORT_LEVEL = "max" |
  .env.SLASH_COMMAND_TOOL_CHAR_BUDGET = "50000"
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

**Only if no CLAUDE.md exists in the project root.**

Check first:

```bash
test -f CLAUDE.md && echo "EXISTS" || echo "MISSING"
```

If MISSING, generate a minimal CLAUDE.md using the commands detected in Step 1:

```markdown
# [Project Name from directory or package.json]

Build: `[detected build command or "not detected"]`
Test: `[detected test command or "not detected"]`
Lint: `[detected lint command or "not detected"]`
```

If EXISTS, do not touch it. Inform the user:

> Existing CLAUDE.md found. Skipping generation.

---

## Step 6: Codebase Mapping (Optional)

### 6.1 Offer Exploration

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
[x] Model set to [opus or opus[1m]]
[x] Effort set to max
[x] CLAUDE.md: [generated/already existed]
[x] Codebase mapping: [done/skipped]

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
7. **Re-runnable:** Running setup again should detect what is already configured and only propose missing pieces.

---

## Error Handling

- **No manifest files found:** Inform user this appears to be an empty or non-standard project. Offer to proceed with just model/effort settings.
- **Settings file is malformed JSON:** Back up the original, inform user, offer to create fresh settings.
- **Permission denied on ~/.claude/:** Inform user and provide manual instructions.
- **No internet / plugin install fails:** Note the failure, continue with remaining steps.

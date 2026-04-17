---
name: setup
description: First-run configuration for VIBE Framework. Configures Claude Code for maximum quality output. Run after installing the plugin.
effort: max
disable-model-invocation: true
whenToUse: "Use after installing the VIBE plugin for first-run configuration. Example: '/vibe:setup'"
maxTokenBudget: 20000
---

# VIBE Setup Wizard

You are the VIBE Framework first-run configuration wizard. Walk the user through setup step by step. Show what you find, propose changes, and apply nothing without explicit approval.

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

## Step 5: Reconciliation

**Only execute this step after the user approves in Step 4.**

The wizard delegates state mutation to `reconciler.sh`. Do **not** write to `~/.claude/settings.json` or `CLAUDE.md` directly from this skill — the reconciler is the only component that mutates user config.

### 5.1 Compute the Combined Diff

Ask the reconciler for the env and data diffs, plus the CLAUDE.md classification, then combine them into a single JSON payload:

```bash
SCHEMA=${CLAUDE_PLUGIN_ROOT}/setup/expected-state.json
RECONCILER=${CLAUDE_PLUGIN_ROOT}/setup/reconciler.sh

ENV_DIFF=$("$RECONCILER" detect-env "$HOME/.claude/settings.json" 2>/dev/null || echo '{"to_add":{},"to_update":{},"to_remove":[]}')
DATA_DIR="$HOME/.claude/plugins/data/vibe-vibe-framework"
DATA_DIFF=$("$RECONCILER" detect-data "$DATA_DIR" 2>/dev/null || echo '{"to_remove":[]}')
CLAUDE_MODE=$("$RECONCILER" classify-claude-md "$CLAUDE_PROJECT_DIR/CLAUDE.md")

# "will_touch" is true unless mode is LEGACY_NO_VIBE_TOKENS (user-owned file)
case "$CLAUDE_MODE" in
  LEGACY_NO_VIBE_TOKENS) WILL_TOUCH=false ;;
  *) WILL_TOUCH=true ;;
esac

COMBINED=$(python3 -c "
import json, sys
print(json.dumps({
    'env': json.loads('''$ENV_DIFF'''),
    'data': json.loads('''$DATA_DIFF'''),
    'claude_md': {'mode': '$CLAUDE_MODE', 'will_touch': $WILL_TOUCH}
}))
")
```

### 5.2 Present the Diff to the User

Pipe the combined diff into the presenter and show it:

```bash
echo "$COMBINED" | "$RECONCILER" present-diff
```

If the presenter reports "Already in sync", skip to Step 7 — there is nothing to apply.

### 5.3 Get Explicit Approval

> I will apply the changes above. `~/.claude/settings.json` will get a timestamped backup before any mutation. Any deprecated data files will be tarballed into a backup before removal. Your CLAUDE.md will be handled according to its classification (above).
>
> **Approve?** (yes/no)

**Do not proceed without explicit approval.**

### 5.4 Apply

Execute each diff type. For CLAUDE.md, read the detected build/test/lint commands from Step 1 and pass them as flags. If the mode is `LEGACY_WITH_VIBE_TOKENS`, ask the user one more time for `--approve-regenerate` (this branch replaces a file that may have content) — do not pass the flag otherwise.

```bash
# Env
echo "$ENV_DIFF" | "$RECONCILER" apply-env "$HOME/.claude/settings.json"

# Data
echo "$DATA_DIFF" | "$RECONCILER" apply-data "$DATA_DIR"

# CLAUDE.md
APPROVE_REGEN=""
if [[ "$CLAUDE_MODE" == "LEGACY_WITH_VIBE_TOKENS" ]]; then
  # Ask user: "Your CLAUDE.md contains 4.x-era VIBE markers (reflect skill, VIBE_GATE, etc.).
  # I will back it up and regenerate it. Proceed? (yes/no)"
  # If yes:
  APPROVE_REGEN="--approve-regenerate"
fi

"$RECONCILER" apply-claude-md "$CLAUDE_PROJECT_DIR/CLAUDE.md" \
    --project-name "$PROJECT_NAME" \
    --build "$BUILD_CMD" \
    --test "$TEST_CMD" \
    --lint "$LINT_CMD" \
    --mode "$CLAUDE_MODE" \
    $APPROVE_REGEN
```

### 5.5 Warn on LEGACY_NO_VIBE_TOKENS

If the mode was `LEGACY_NO_VIBE_TOKENS`, inform the user:

> Your CLAUDE.md has no VIBE region markers and no 4.x-era markers, so I assume it is user-authored and I will not touch it. If you want a VIBE-managed CLAUDE.md, delete this file and re-run `/vibe:setup`.

### 5.6 Opus 4.7 thinking-display fix (#49268)

Opus 4.7 ships with thinking content `display: "omitted"` as the new default. The documented `showThinkingSummaries` CC setting is unwired in the harness (binary-RE confirmed). The real fix is the hidden CLI flag `--thinking-display summarized`. This step opt-in installs it in two places: shell rc alias (terminal) and VS Code `claudeCode.claudeProcessWrapper` (IDE). Opt-out: `VIBE_NO_THINKING_FIX=1`.

```bash
SHELL_NAME=$(basename "$SHELL")  # bash | zsh | fish | …
TF_STATE=$("$RECONCILER" detect-thinking-fix "$SHELL_NAME" 2>/dev/null)
```

The detect call returns `{shell:{...}, vscode:{...}}` with per-vector flags: `marker_present`, `needs_install`, `alien_alias_present` / `alien_wrapper_set`. Skip vectors where `marker_present` or alien flags are true (already configured or user owns it). For `supported: false` shells (fish/ksh/...), surface a manual instruction instead of auto-applying.

Ask the user one prompt:

> Opus 4.7 hides reasoning summaries by default (#49268). Install fix?
> `[a]` both (shell + VS Code)  `[s]` shell only  `[v]` VS Code only  `[n]` skip

Apply per choice:

```bash
# Shell
"$RECONCILER" apply-thinking-fix-shell "$SHELL_NAME"

# VS Code — use the absolute wrapper path from the cached plugin install
WRAPPER_ABS="${CLAUDE_PLUGIN_ROOT}/scripts/cc-thinking-wrapper.sh"
VSCODE_SETTINGS=$(echo "$TF_STATE" | jq -r '.vscode.settings_path')
"$RECONCILER" apply-thinking-fix-vscode "$VSCODE_SETTINGS" "$WRAPPER_ABS"
```

Each apply returns JSON with a `status` field: `installed` (tell user to `source ~/.bashrc` or restart terminal), `already_installed` (no-op), `alien_wrapper_present` (skipped — user has custom wrapper, surface for manual review). Removed via `apply-thinking-fix-shell` → `remove-thinking-fix-shell` (future `--reset` mode). For unsupported shells, fall back to a manual instruction:

> Your shell isn't auto-installable. Add: `alias claude='command claude --thinking-display summarized'` to your rc. Or set `VIBE_NO_THINKING_FIX=1`.

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

### 7.3 Record Version Marker

Delegate marker writing to the reconciler. The marker is version-aware: future upgrades will detect the drift and suggest re-running setup.

```bash
PLUGIN_VERSION=$(python3 -c "import json; print(json.load(open('$CLAUDE_PLUGIN_ROOT/.claude-plugin/plugin.json'))['version'])")
"$RECONCILER" write-marker "$PLUGIN_VERSION"
```

The marker file is `~/.claude/vibe-configured` (version in JSON content, not in filename). If the user later deletes it, the anomaly in `setup-check.sh` Check 5 fires again on the next session — the "remind me to re-run setup" escape hatch.

### 7.4 Restart Notice

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

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

### 2.4 Install / Confirm LSP

For each primary language detected in §2.1 whose LSP plugin per the mapping in §2.2 is NOT in the list from §2.3, auto-install it:

```bash
# $PRIMARY_LANGS is the list of detected primaries (space-separated).
# $INSTALLED_LSPS is the list from §2.3.

for lang in $PRIMARY_LANGS; do
    case "$lang" in
        typescript|javascript) plugin="typescript-lsp" ;;
        python)                plugin="pyright-lsp" ;;
        rust)                  plugin="rust-analyzer-lsp" ;;
        go)                    plugin="gopls-lsp" ;;
        java)                  plugin="jdtls-lsp" ;;
        php)                   plugin="php-lsp" ;;
        csharp|"c#")           plugin="csharp-lsp" ;;
        swift)                 plugin="swift-lsp" ;;
        c|cpp|"c++")           plugin="clangd-lsp" ;;
        kotlin)                plugin="kotlin-lsp" ;;
        *)                     plugin="" ;;
    esac
    if [[ -z "$plugin" ]]; then continue; fi
    if echo "$INSTALLED_LSPS" | grep -qw "$plugin"; then
        echo "LSP: $plugin already installed for $lang."
        continue
    fi
    echo "LSP: installing $plugin for $lang..."
    if claude plugin install "$plugin" 2>&1 | tail -5; then
        echo "LSP: $plugin installed."
    else
        echo "LSP: auto-install of $plugin failed. Install manually with: claude plugin install $plugin"
    fi
done
```

Rationale: the detection in §2.1–§2.3 has the answer; asking the user to manually run the install after setup exits is a drop-off point that leaves them without diagnostics. If the install fails (network, plugin registry), the command falls back to the existing manual-install recommendation.

If no primary language is detected (e.g., empty project), this section is a silent no-op — §2.1's detection already produces an empty `$PRIMARY_LANGS` in that case.

Note: the variables `$PRIMARY_LANGS` and `$INSTALLED_LSPS` are part of the wizard's natural-language contract — CC composes them from §2.1 (file-extension sort | head) and §2.3 (grep of settings + ls of `~/.claude/plugins/`) respectively. If they're not already promoted to named variables in the current SKILL.md, lightly restructure §2.1 and §2.3 to emit them (e.g., `PRIMARY_LANGS=$(... | awk '{print $2}' | head -N)` at the end of the detect block). Keep the restructure minimal — only enough that §2.4 has access to the two variables.

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
Model                          [current]            opus (persisted via reconciler)
Effort level                   [current]            max
Skill char budget              [current]            50000
LSP plugin                     [current]            [detected]-lsp
Status line                    [current]            [proposed above]
Adaptive thinking              [current]            disabled
```

### 4.2 Explain the Recommendations

- **opus:** The highest capability model. Claude Code automatically uses extended context (1M tokens) when your plan supports it — no manual configuration needed. VIBE reconciler persiste questo setting in `~/.claude/settings.json` via §2.8b apply-top-level, quindi ogni nuova sessione `claude` parte su Opus by default.
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

The wizard delegates state mutation to `reconciler.sh` (the component that reads and writes your settings files). Do **not** write to `~/.claude/settings.json` or `CLAUDE.md` directly from this skill — the reconciler is the only component that mutates user config.

### 5.1 Compute the Combined Diff

Ask the reconciler for the env and data diffs, plus the CLAUDE.md classification, then combine them into a single JSON payload:

```bash
SCHEMA=${CLAUDE_PLUGIN_ROOT}/setup/expected-state.json
RECONCILER=${CLAUDE_PLUGIN_ROOT}/setup/reconciler.sh

ENV_DIFF=$("$RECONCILER" detect-env "$HOME/.claude/settings.json" 2>/dev/null || echo '{"to_add":{},"to_update":{},"to_remove":[]}')
TOP_DIFF=$("$RECONCILER" detect-top-level "$HOME/.claude/settings.json" 2>/dev/null || echo '{"to_set":{}}')
DATA_DIR="$HOME/.claude/plugins/data/vibe-vibe-framework"
DATA_DIFF=$("$RECONCILER" detect-data "$DATA_DIR" 2>/dev/null || echo '{"to_remove":[]}')
CLAUDE_MODE=$("$RECONCILER" classify-claude-md "$CLAUDE_PROJECT_DIR/CLAUDE.md")

# "will_touch" is false iff mode is LEGACY_NO_VIBE_TOKENS (user-owned file).
# We pass booleans as JSON-parseable strings and let json.loads() convert —
# interpolating bash `true`/`false` into Python directly yields NameError.
if [[ "$CLAUDE_MODE" == "LEGACY_NO_VIBE_TOKENS" ]]; then
    WILL_TOUCH_JSON="false"
else
    WILL_TOUCH_JSON="true"
fi

COMBINED=$(CLAUDE_MODE="$CLAUDE_MODE" WILL_TOUCH_JSON="$WILL_TOUCH_JSON" \
    ENV_DIFF="$ENV_DIFF" TOP_DIFF="$TOP_DIFF" DATA_DIFF="$DATA_DIFF" \
    python3 <<'PYEOF'
import json, os
print(json.dumps({
    'env': json.loads(os.environ['ENV_DIFF']),
    'top_level': json.loads(os.environ['TOP_DIFF']),
    'data': json.loads(os.environ['DATA_DIFF']),
    'claude_md': {
        'mode': os.environ['CLAUDE_MODE'],
        'will_touch': json.loads(os.environ['WILL_TOUCH_JSON']),
    },
}))
PYEOF
)
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

# Top-level settings (5.5.0: persist model default)
echo "$TOP_DIFF" | "$RECONCILER" apply-top-level "$HOME/.claude/settings.json"

# Data
echo "$DATA_DIFF" | "$RECONCILER" apply-data "$DATA_DIR"

# CLAUDE.md
APPROVE_REGEN=""
if [[ "$CLAUDE_MODE" == "LEGACY_WITH_VIBE_TOKENS" ]]; then
  # Ask user: "Your CLAUDE.md contains markers from an older VIBE version (4.x — the old reflect skill, VIBE_GATE, etc.).
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

### 5.5 When CLAUDE.md Looks User-Authored

If the mode was `LEGACY_NO_VIBE_TOKENS` (CLAUDE.md exists but has no VIBE markers from this or any earlier version), inform the user:

> Your CLAUDE.md looks like plain user content (no VIBE markers from this or earlier versions). I won't modify it. If you want a VIBE-managed CLAUDE.md, delete this file and re-run `/vibe:setup`.

### 5.6 Opus 4.7 thinking-display fix (#49268)

Opus 4.7 ships with thinking content `display: "omitted"` as the new default. The documented `showThinkingSummaries` CC setting is unwired in the harness (binary-RE confirmed). The real fix is the hidden CLI flag `--thinking-display summarized`. Two install vectors: shell rc alias (terminal) and VS Code `claudeCode.claudeProcessWrapper` (IDE). This step is **adaptive**: if detection resolves the choice unambiguously, it applies without asking. A user prompt appears only when both vectors are installable. Opt-out: `VIBE_NO_THINKING_FIX=1`.

```bash
SHELL_NAME=$(basename "$SHELL")
TF_STATE=$("$RECONCILER" detect-thinking-fix "$SHELL_NAME" 2>/dev/null)

# Parse the four flags we branch on.
SHELL_NEEDS=$(echo "$TF_STATE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('1' if d['shell'].get('needs_install') else '')")
VSCODE_NEEDS=$(echo "$TF_STATE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('1' if d['vscode'].get('needs_install') else '')")
SHELL_SUPPORTED=$(echo "$TF_STATE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('1' if d['shell'].get('supported') else '')")
VSCODE_SETTINGS_PATH=$(echo "$TF_STATE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['vscode'].get('settings_path',''))")
```

Four cases:

**Case A — shell candidate only (`SHELL_NEEDS=1`, `VSCODE_NEEDS=""`).** Auto-apply shell. No user prompt.

```bash
"$RECONCILER" apply-thinking-fix-shell "$SHELL_NAME"
```
Print: `Installed shell fix in ~/.bashrc. VS Code not detected — skipped. To activate: source ~/.bashrc or open a new terminal.`

**Case B — VS Code candidate only (`SHELL_NEEDS=""`, `VSCODE_NEEDS=1`).** Auto-apply VS Code. No user prompt.

```bash
WRAPPER_ABS="${CLAUDE_PLUGIN_ROOT}/scripts/cc-thinking-wrapper.sh"
"$RECONCILER" apply-thinking-fix-vscode "$VSCODE_SETTINGS_PATH" "$WRAPPER_ABS"
```
Print: `Installed VS Code wrapper. Shell already configured or unsupported — skipped.`

**Case C — both candidates (`SHELL_NEEDS=1`, `VSCODE_NEEDS=1`).** Ask once, 2-way. Default `y`.

> Install Opus 4.7 thinking-display fix (#49268) for both shell and VS Code? This wraps the `claude` command so reasoning summaries show instead of being omitted. `[y]` install both (default) / `[n]` skip.

If `y` (or blank): apply both (run the commands from Case A then Case B).
If `n`: skip silently.

**Case D — neither candidate (`SHELL_NEEDS=""`, `VSCODE_NEEDS=""`).** Skip silently. Both vectors are already configured, or both carry user-owned custom wrappers (which the detector flags and the apply commands also refuse to clobber).

If `SHELL_SUPPORTED=""` (unsupported shell like fish/ksh) AND `VSCODE_NEEDS=""` AND there is no other shell install path, print the manual fallback once:

> Your shell isn't auto-installable. Add this line to your shell rc: `alias claude='command claude --thinking-display summarized'`. Or set `VIBE_NO_THINKING_FIX=1` to silence this step.

Each apply command returns JSON with a `status` field: `installed` (tell the user to `source ~/.bashrc` or restart the terminal), `already_installed` (silent no-op), `alien_wrapper_present` (skipped — surface the existing wrapper path for manual review, do not clobber).

### 5.7 Pragmatic Priming (Optional, 5.5.0 §2.6 Tier A shell wrapper)

Opus 4.7 shows documented hedging + sycophancy patterns (`feedback_honesty_patterns`, Stella Laurenzo thread). Askell-inspired priming (~30 tokens prepended to system prompt, cached via prompt caching) reduces these patterns with O(1) per-conversation cost. **Empirically validated (5.5.1 A4 A/B):** 80% reduction in hedge-word density across 20 decision-type prompts on opus-4-7 (`docs/2026-04-22-pragmatic-hedge-ab.md`).

This step installs the Tier A shell-wrapper variant. Tier A = the simplest install: copy the prompt template and extend the `alias claude=...` from §5.6 with `--append-system-prompt`. Tier B (per-turn hook, `VIBE_PRAGMATIC_MODE=1` opt-in) and Tier C (custom `@pragmatic` agent) are available independently post-setup — see `plugin/scripts/pragmatic-priming.sh` and `plugin/agents/pragmatic.md`.

This step requires §5.6 to have installed the shell alias first (it extends that alias in place). If §5.6 was skipped, this step falls back to a manual instruction.

Ask the user:

> Opus 4.7 hedging/sycophancy mitigation via Askell-style priming (~30 token preamble, cached via prompt caching). Install? `[y]` yes (default) / `[n]` skip.

If `[y]` (or blank): copy the template then extend the alias.

```bash
PROMPT_SRC="${CLAUDE_PLUGIN_ROOT}/skills/setup/references/pragmatic-prompt.txt"
PROMPT_DST="$HOME/.claude/vibe-pragmatic-prompt.txt"

if [[ ! -f "$PROMPT_SRC" ]]; then
    echo "ERROR: pragmatic-prompt.txt template not found in plugin. Skipping."
    # skip the rest of §5.7
fi

cp "$PROMPT_SRC" "$PROMPT_DST"
echo "Wrote pragmatic priming template: $PROMPT_DST"

SHELL_NAME=$(basename "$SHELL")
EXTEND_RESULT=$("$RECONCILER" apply-pragmatic-alias "$SHELL_NAME" 2>/dev/null)
STATUS=$(echo "$EXTEND_RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('status',''))")
```

Branch on `$STATUS`:

- `extended`: Print `Extended 'alias claude' in ~/.bashrc with pragmatic priming. To activate: source ~/.bashrc or open a new terminal.`
- `already_extended`: Print `Alias already includes pragmatic priming — no change needed.`
- `no_marker_block`: Print `§5.6 shell fix was not installed, so I cannot extend the alias here. To enable pragmatic priming, either re-run /vibe:setup and install the §5.6 shell fix, or try Tier B (per-turn hook) — see plugin/agents/pragmatic.md.`
- `no_rc_file` or `no_alias_in_block`: Same fallback message as `no_marker_block` with the specific reason appended.

Opt-out for the installed case: delete `~/.claude/vibe-pragmatic-prompt.txt` (the alias's `$(cat ...)` expansion silently returns an empty string, so no priming is applied).

If `[n]`: skip silently — do not copy the template, do not call the subcommand.

---

## Step 6: Codebase Mapping (autonomous background task)

Default-on. The wizard dispatches the researcher agent to map project structure, entry points, key modules, data flow, and external dependencies into auto-memory, so future sessions start with full context. Opt-out: export `VIBE_NO_CODEBASE_MAP=1` before running `/vibe:setup`. No user prompt — detection already has the answer.

Do not quote a duration estimate. Mapping time scales with codebase size (observed: 35 minutes on a mid-size project); a fixed estimate misleads.

```bash
if [[ -n "${VIBE_NO_CODEBASE_MAP:-}" ]]; then
    echo "Codebase mapping: skipped (VIBE_NO_CODEBASE_MAP set). To run it later: invoke the vibe:researcher agent directly."
    # proceed to Step 6.5
fi
```

If the opt-out is not set, dispatch the researcher as a background task so Step 7 can show before mapping completes. Use the Agent tool with:
- `subagent_type`: `vibe-researcher` (or the plugin-namespaced name available in the current harness — commonly `vibe:researcher`)
- `run_in_background`: `true` (if the harness supports background agents; fall back to synchronous dispatch otherwise)
- `prompt`: *"Map this codebase. Identify: project structure, entry points, key modules, data flow, external dependencies, and configuration files. If a CLAUDE.md exists in the project root, verify every filesystem path it references against the actual filesystem. For each path that doesn't exist as-written but resolves uniquely on disk via a case-insensitive match, record the correction in `.claude/agent-memory/vibe-researcher/path_corrections.md` as a JSON array (see researcher agent §6 for format). For ambiguous or unresolvable mismatches, record them with `confidence: "low"` so they surface as warnings. Save all other findings to agent memory. Research-only; no code modifications."*

Tell the user in a single print line: `Codebase mapping: running in background — notification when complete.` (If the harness dispatched synchronously, print instead: `Mapping codebase with researcher agent (runs inline; progress visible above).`)

Proceed immediately to Step 6.5 and Step 7. The backgrounded researcher will deliver its completion notification to the session asynchronously. Step 6.5 depends on researcher findings — if the researcher is still running when Step 6.5 is reached, Step 6.5 skips gracefully (the corrections are applied the next time setup is re-run or when the user reviews them manually).

---

## Step 6.5: Apply Researcher Path Corrections (new in 5.5.3)

If the researcher agent ran AND produced a `path_corrections.md` in its memory namespace, apply high-confidence corrections to CLAUDE.md automatically; surface low-confidence ones as warnings in the Step 7 summary.

```bash
PATH_CORR_FILE="$CLAUDE_PROJECT_DIR/.claude/agent-memory/vibe-researcher/path_corrections.md"
HIGH_CORR_JSON="[]"
LOW_CORR_JSON="[]"

if [[ -f "$PATH_CORR_FILE" ]]; then
    # Extract the JSON array inside the fenced ```json ... ``` block.
    CORR_ALL_JSON=$(PATH_CORR_FILE="$PATH_CORR_FILE" python3 <<'PYEOF'
import os, re, json, sys
content = open(os.environ["PATH_CORR_FILE"]).read()
m = re.search(r"```json\s*(\[.*?\])\s*```", content, re.DOTALL)
if not m:
    print("[]")
    sys.exit(0)
try:
    arr = json.loads(m.group(1))
    print(json.dumps(arr))
except Exception:
    print("[]")
PYEOF
)
    HIGH_CORR_JSON=$(echo "$CORR_ALL_JSON" | python3 -c "import json,sys; arr=json.load(sys.stdin); print(json.dumps([c for c in arr if c.get('confidence')=='high']))")
    LOW_CORR_JSON=$(echo "$CORR_ALL_JSON" | python3 -c "import json,sys; arr=json.load(sys.stdin); print(json.dumps([c for c in arr if c.get('confidence')=='low']))")
fi

HIGH_COUNT=$(echo "$HIGH_CORR_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
LOW_COUNT=$(echo "$LOW_CORR_JSON" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
```

If `$HIGH_COUNT > 0`, apply each correction via the **Edit** tool (NOT via Bash `sed` — Edit shows a diff and validates the target file hasn't drifted since Read):

1. Print to the user: `Researcher found $HIGH_COUNT path reference(s) in CLAUDE.md that don't exist as written but match case-insensitively on disk. Auto-correcting:`
2. For each entry in `$HIGH_CORR_JSON`, print `  - <current> → <suggested>` (don't apply yet; just list).
3. Then for each entry, invoke the Edit tool on `$CLAUDE_PROJECT_DIR/CLAUDE.md` with `old_string=<current>`, `new_string=<suggested>`. Do this **sequentially** (not in parallel) because multiple Edits on the same file must serialize.
4. After all edits, print: `Applied $HIGH_COUNT correction(s) to CLAUDE.md.`

If `$LOW_COUNT > 0`, preserve the `$LOW_CORR_JSON` list — Step 7.2 surfaces these as warnings. Do NOT auto-apply.

If `$HIGH_COUNT == 0 && $LOW_COUNT == 0`: skip silently.

If the researcher is still running in the background when this step is reached (the corrections file doesn't yet exist), skip this step silently — the corrections remain on disk for the user to review, and re-running `/vibe:setup` will pick them up on the next run.

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
[x] Codebase mapping: [done/skipped/running in background]
[x] Adaptive thinking: disabled (full depth)

Restart Claude Code to apply all changes.
```

If `$HIGH_COUNT > 0` (from Step 6.5), append after the checklist:

```
CLAUDE.md path corrections applied ($HIGH_COUNT):
  - <current> → <suggested>
```
(one line per entry in `$HIGH_CORR_JSON`).

If `$LOW_COUNT > 0`, append:

```
CLAUDE.md path warnings (low-confidence — not auto-applied):
  - <current> (<note>)
```
(one line per entry in `$LOW_CORR_JSON`). These need user judgment — leave them for the user to inspect.

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

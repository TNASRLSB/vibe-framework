#!/usr/bin/env bash
# ============================================================================
# reconciler.sh — VIBE 5.1 self-healing state reconciler
# ============================================================================
#
# Subcommands:
#   write-marker <version>       Write ~/.claude/vibe-configured with JSON
#   read-marker                  Echo marker version (empty if missing/bad)
#   check-version <plugin-ver>   Exit 0 if marker version == arg, else 1
#   detect-env <settings-path>   Emit JSON diff of env state vs schema
#   apply-env <settings-path>    Apply env diff (JSON on stdin), backup first
#   detect-data <data-dir>       Emit JSON diff of data files vs schema
#   apply-data <data-dir>        Apply data diff (JSON on stdin), tarball backup
#   classify-claude-md <path>    Echo one of: MISSING, MANAGED_REGION_PRESENT,
#                                LEGACY_WITH_VIBE_TOKENS, LEGACY_NO_VIBE_TOKENS
#   apply-claude-md <path> ...   Apply CLAUDE.md change per --mode flag
#   present-diff                 Render combined diff (JSON on stdin) as text
#   apply-pragmatic-alias <shell>
#                                Extend the VIBE-block `alias claude=...`
#                                with --append-system-prompt for priming.
#                                Idempotent; backs up rc file.
#
# Exit codes:
#   0  success (or check-version match)
#   1  check-version drift / generic failure
#   2  argument error
#   3  schema unsupported
#
# Environment:
#   HOME                         Overridable for tests (sandboxes marker path)
#   CLAUDE_PROJECT_DIR           Project root for CLAUDE.md detection
# ============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/expected-state.json"
MARKER_FILE="$HOME/.claude/vibe-configured"

die() { echo "reconciler: $*" >&2; exit 2; }

# --- schema check ---------------------------------------------------------
require_schema() {
    [[ -f "$SCHEMA_FILE" ]] || die "schema not found: $SCHEMA_FILE"
    local sv
    sv=$(python3 -c "import json,sys; print(json.load(open('$SCHEMA_FILE')).get('schemaVersion', 0))" 2>/dev/null || echo 0)
    if [[ "$sv" != "1" ]]; then
        echo "reconciler: unsupported schemaVersion $sv (expected 1)" >&2
        exit 3
    fi
}

# --- marker ---------------------------------------------------------------
cmd_write_marker() {
    local version="${1:-}"
    [[ -n "$version" ]] || die "write-marker: version argument required"
    mkdir -p "$(dirname "$MARKER_FILE")"
    local ts
    ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    printf '{"version":"%s","timestamp":"%s"}\n' "$version" "$ts" > "$MARKER_FILE"
}

cmd_read_marker() {
    [[ -f "$MARKER_FILE" ]] || { echo ""; return 0; }
    python3 -c "
import json
try:
    with open('$MARKER_FILE') as f:
        data = json.load(f)
    print(data.get('version', ''))
except Exception:
    print('')
" 2>/dev/null
}

cmd_check_version() {
    local expected="${1:-}"
    [[ -n "$expected" ]] || die "check-version: version argument required"
    local actual
    actual=$(cmd_read_marker)
    [[ "$actual" == "$expected" ]]
}

# --- env state detection --------------------------------------------------
cmd_detect_env() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "detect-env: settings path required"

    python3 <<PYEOF
import json, sys

schema = json.load(open("$SCHEMA_FILE"))
owned = schema["envVarsOwned"]
deprecated = schema["envVarsDeprecated"]

try:
    with open("$settings_path") as f:
        settings = json.load(f)
except FileNotFoundError:
    settings = {}
except json.JSONDecodeError:
    print("reconciler: settings file is invalid JSON", file=sys.stderr)
    sys.exit(2)

current_env = settings.get("env", {}) or {}

to_add = {}
to_update = {}
to_remove = []

for key, expected_value in owned.items():
    if key not in current_env:
        to_add[key] = expected_value
    elif str(current_env[key]) != str(expected_value):
        to_update[key] = expected_value

for key in deprecated:
    if key in current_env:
        to_remove.append(key)

diff = {"to_add": to_add, "to_update": to_update, "to_remove": to_remove}
print(json.dumps(diff))
PYEOF
}

cmd_apply_env() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "apply-env: settings path required"

    local diff_json
    diff_json=$(cat)

    local is_empty
    is_empty=$(echo "$diff_json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('yes' if (not d.get('to_add') and not d.get('to_update') and not d.get('to_remove')) else 'no')
")
    if [[ "$is_empty" == "yes" ]]; then
        return 0
    fi

    local ts
    ts=$(date -u +%Y%m%d-%H%M%S)
    cp "$settings_path" "$settings_path.bak-$ts"

    python3 <<PYEOF
import json

diff = json.loads('''$diff_json''')

with open("$settings_path") as f:
    settings = json.load(f)

env = settings.setdefault("env", {})

for k, v in diff.get("to_add", {}).items():
    env[k] = v
for k, v in diff.get("to_update", {}).items():
    env[k] = v
for k in diff.get("to_remove", []):
    env.pop(k, None)

with open("$settings_path", "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYEOF
}

# --- Top-level settings detection + apply (5.5.0, §2.8b) -----------------
cmd_detect_top_level() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "detect-top-level: settings path required"

    python3 <<PYEOF
import json, sys

schema = json.load(open("$SCHEMA_FILE"))
owned = schema.get("settingsTopLevel", {})

try:
    with open("$settings_path") as f:
        settings = json.load(f)
except FileNotFoundError:
    settings = {}
except json.JSONDecodeError:
    print("reconciler: settings file is invalid JSON", file=sys.stderr)
    sys.exit(2)

to_set = {}

for key, expected_value in owned.items():
    if key not in settings:
        to_set[key] = expected_value
    elif str(settings.get(key)) != str(expected_value):
        to_set[key] = expected_value

print(json.dumps({"to_set": to_set}))
PYEOF
}

cmd_apply_top_level() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "apply-top-level: settings path required"

    local diff_json
    diff_json=$(cat)

    local is_empty
    is_empty=$(echo "$diff_json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('yes' if not d.get('to_set') else 'no')
")
    if [[ "$is_empty" == "yes" ]]; then
        return 0
    fi

    local ts
    ts=$(date -u +%Y%m%d-%H%M%S)
    cp "$settings_path" "$settings_path.bak-top-$ts"

    python3 <<PYEOF
import json

diff = json.loads('''$diff_json''')

with open("$settings_path") as f:
    settings = json.load(f)

for k, v in diff.get("to_set", {}).items():
    settings[k] = v  # TOP-LEVEL, not settings["env"][k]

with open("$settings_path", "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYEOF
}

# --- Managed content generation (5.4.0) -----------------------------------
cmd_generate_managed_content() {
    local project_root="${1:-}"
    local settings_path="${2:-}"
    [[ -n "$project_root" ]] || die "generate-managed-content: project root required"
    [[ -n "$settings_path" ]] || settings_path="$HOME/.claude/settings.json"

    local generator="$SCRIPT_DIR/smart-generator.sh"
    [[ -x "$generator" ]] || die "smart-generator not found or not executable: $generator"

    "$generator" --project-root "$project_root" --settings "$settings_path"
}

# --- data file detection --------------------------------------------------
cmd_detect_data() {
    local data_dir="${1:-}"
    [[ -n "$data_dir" ]] || die "detect-data: data dir required"

    python3 <<PYEOF
import json, os, sys

schema = json.load(open("$SCHEMA_FILE"))
deprecated = schema["dataFilesDeprecated"]
data_dir = "$data_dir"

to_remove = []
if os.path.isdir(data_dir):
    for name in deprecated:
        path = os.path.join(data_dir, name)
        if os.path.exists(path):
            to_remove.append(name)

print(json.dumps({"to_remove": to_remove}))
PYEOF
}

cmd_apply_data() {
    local data_dir="${1:-}"
    [[ -n "$data_dir" ]] || die "apply-data: data dir required"

    local diff_json
    diff_json=$(cat)

    local names
    names=$(echo "$diff_json" | python3 -c "import json,sys; print('\n'.join(json.load(sys.stdin).get('to_remove', [])))")
    [[ -z "$names" ]] && return 0

    local ts
    ts=$(date -u +%Y%m%d-%H%M%S)
    local parent
    parent="$(dirname "$data_dir")"
    local backup="$parent/vibe-deprecated-backup-$ts.tar.gz"

    local targets=()
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        if [[ -e "$data_dir/$name" ]]; then
            targets+=("$(basename "$data_dir")/$name")
        fi
    done <<< "$names"

    if [[ ${#targets[@]} -gt 0 ]]; then
        tar -czf "$backup" -C "$parent" "${targets[@]}" 2>/dev/null
        while IFS= read -r name; do
            [[ -z "$name" ]] && continue
            rm -rf "$data_dir/$name"
        done <<< "$names"
    fi
}

# --- CLAUDE.md classification ---------------------------------------------
cmd_classify_claude_md() {
    local path="${1:-}"
    [[ -n "$path" ]] || die "classify-claude-md: path required"

    if [[ ! -f "$path" ]]; then
        echo "MISSING"
        return 0
    fi

    python3 <<PYEOF
import json

schema = json.load(open("$SCHEMA_FILE"))
start = schema["claudeMdManagedMarkerStart"]
end = schema["claudeMdManagedMarkerEnd"]
tokens = schema["claudeMdLegacyTokens"]

with open("$path") as f:
    content = f.read()

if start in content and end in content:
    print("MANAGED_REGION_PRESENT")
elif any(t in content for t in tokens):
    print("LEGACY_WITH_VIBE_TOKENS")
else:
    print("LEGACY_NO_VIBE_TOKENS")
PYEOF
}

# --- CLAUDE.md apply ------------------------------------------------------
cmd_apply_claude_md() {
    local path="${1:-}"
    shift || true
    [[ -n "$path" ]] || die "apply-claude-md: path required"

    local project_name="Project"
    local build_cmd="not detected"
    local test_cmd="not detected"
    local lint_cmd="not detected"
    local mode=""
    local approve_regenerate="false"
    local project_root="${CLAUDE_PROJECT_DIR:-$PWD}"
    local settings_path="$HOME/.claude/settings.json"

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --project-name)       project_name="$2"; shift 2 ;;
            --build)              build_cmd="$2"; shift 2 ;;
            --test)               test_cmd="$2"; shift 2 ;;
            --lint)               lint_cmd="$2"; shift 2 ;;
            --mode)               mode="$2"; shift 2 ;;
            --approve-regenerate) approve_regenerate="true"; shift ;;
            --project-root)       project_root="$2"; shift 2 ;;
            --settings)           settings_path="$2"; shift 2 ;;
            *)                    die "apply-claude-md: unknown flag $1" ;;
        esac
    done

    local template="$SCRIPT_DIR/claude-md-template.md"
    [[ -f "$template" ]] || die "template not found: $template"

    local rendered
    rendered=$(TEMPLATE_PATH="$template" \
               PROJECT_NAME_ARG="$project_name" \
               BUILD_CMD_ARG="$build_cmd" \
               TEST_CMD_ARG="$test_cmd" \
               LINT_CMD_ARG="$lint_cmd" \
               SCRIPT_DIR_ARG="$SCRIPT_DIR" \
               PROJECT_ROOT_ARG="$project_root" \
               SETTINGS_PATH_ARG="$settings_path" \
               python3 <<'PYEOF'
import json, os, subprocess, sys

tpl = open(os.environ["TEMPLATE_PATH"]).read()
out = (tpl
    .replace("{{PROJECT_NAME}}", os.environ.get("PROJECT_NAME_ARG", ""))
    .replace("{{BUILD_CMD}}",   os.environ.get("BUILD_CMD_ARG", ""))
    .replace("{{TEST_CMD}}",    os.environ.get("TEST_CMD_ARG", ""))
    .replace("{{LINT_CMD}}",    os.environ.get("LINT_CMD_ARG", "")))

# Splice in the 4 VIBE-managed blocks from smart-generator.sh.
# Failures / empty blocks fall back to an inline unavailable marker so
# setup completes even if the generator errors.
FALLBACK = "_(VIBE smart-generator: unavailable — placeholder left blank.)_"
blocks = {}
generator = os.path.join(os.environ["SCRIPT_DIR_ARG"], "smart-generator.sh")
try:
    gen = subprocess.run(
        ["bash", generator,
         "--project-root", os.environ["PROJECT_ROOT_ARG"],
         "--settings",     os.environ["SETTINGS_PATH_ARG"]],
        capture_output=True, text=True, check=False,
    )
    if gen.returncode == 0 and gen.stdout.strip():
        blocks = json.loads(gen.stdout)
except Exception:
    blocks = {}

for key, placeholder in [
    ("project_context",   "{{PROJECT_CONTEXT_BLOCK}}"),
    ("model_pattern",     "{{MODEL_PATTERN_BLOCK}}"),
    ("capability_audit",  "{{CAPABILITY_AUDIT_BLOCK}}"),
    ("git_signals",       "{{GIT_SIGNALS_BLOCK}}"),
    ("dispatch_guidance", "{{DISPATCH_GUIDANCE_BLOCK}}"),
    ("harness_limits",    "{{HARNESS_LIMITS_BLOCK}}"),
]:
    val = blocks.get(key, "")
    if not val or not str(val).strip():
        val = FALLBACK
    out = out.replace(placeholder, val)

sys.stdout.write(out)
PYEOF
)

    case "$mode" in
        MISSING)
            printf '%s' "$rendered" > "$path"
            ;;
        MANAGED_REGION_PRESENT)
            SCHEMA_ARG="$SCHEMA_FILE" PATH_ARG="$path" RENDERED_ARG="$rendered" python3 <<'PYEOF'
import json, os, re

schema = json.load(open(os.environ["SCHEMA_ARG"]))
start = schema["claudeMdManagedMarkerStart"]
end = schema["claudeMdManagedMarkerEnd"]

path = os.environ["PATH_ARG"]
with open(path) as f:
    content = f.read()

rendered = os.environ["RENDERED_ARG"]
m = re.search(re.escape(start) + r".*?" + re.escape(end), rendered, re.DOTALL)
if not m:
    raise SystemExit("rendered template missing markers")
new_region = m.group(0)

pattern = re.escape(start) + r".*?" + re.escape(end)
new_content = re.sub(pattern, lambda _: new_region, content, count=1, flags=re.DOTALL)

with open(path, "w") as f:
    f.write(new_content)
PYEOF
            ;;
        LEGACY_WITH_VIBE_TOKENS)
            if [[ "$approve_regenerate" != "true" ]]; then
                echo "reconciler: LEGACY_WITH_VIBE_TOKENS requires --approve-regenerate" >&2
                return 1
            fi
            local ts
            ts=$(date -u +%Y%m%d-%H%M%S)
            cp "$path" "$path.bak-$ts"
            printf '%s' "$rendered" > "$path"
            ;;
        LEGACY_NO_VIBE_TOKENS)
            return 0
            ;;
        *)
            die "apply-claude-md: invalid mode '$mode'"
            ;;
    esac
}

# --- diff presenter -------------------------------------------------------
cmd_present_diff() {
    local diff_json
    diff_json=$(cat)
    _VIBE_DIFF="$diff_json" python3 - <<'PYEOF'
import json, sys, os

diff = json.loads(os.environ["_VIBE_DIFF"])
env = diff.get("env", {})
top = diff.get("top_level", {})
data = diff.get("data", {})
cmd = diff.get("claude_md", {})
stale = diff.get("stale_hooks", []) or []

env_empty = not env.get("to_add") and not env.get("to_update") and not env.get("to_remove")
top_empty = not top.get("to_set")
data_empty = not data.get("to_remove")
claude_untouched = not cmd.get("will_touch", False)
stale_empty = not any((f or {}).get("matches") for f in stale)

if env_empty and top_empty and data_empty and claude_untouched and stale_empty:
    print("VIBE Reconciler — Already in sync with current version.")
    print("No changes needed.")
    sys.exit(0)

print("VIBE Reconciler — Changes detected")
print("=" * 40)

if env.get("to_add"):
    print("\nENV — to add:")
    for k, v in env["to_add"].items():
        print(f"  + {k} = {v}")
if env.get("to_update"):
    print("\nENV — to update:")
    for k, v in env["to_update"].items():
        print(f"  ~ {k} = {v}")
if env.get("to_remove"):
    print("\nENV — to remove (deprecated):")
    for k in env["to_remove"]:
        print(f"  - {k}")

if top.get("to_set"):
    print("\nSETTINGS (top-level) — to set:")
    for k, v in top["to_set"].items():
        print(f"  + {k} = {v}")

if data.get("to_remove"):
    print("\nDATA FILES — to remove (deprecated, backed up first):")
    for name in data["to_remove"]:
        print(f"  - {name}")

MODE_DESCRIPTIONS = {
    'MISSING':                 "not present (will create one)",
    'MANAGED_REGION_PRESENT':  "has a VIBE-managed section (will update in place)",
    'LEGACY_WITH_VIBE_TOKENS': "has markers from an older VIBE version (will back up and regenerate)",
    'LEGACY_NO_VIBE_TOKENS':   "looks user-authored (will not touch)",
}
mode = cmd.get('mode', 'UNKNOWN')
description = MODE_DESCRIPTIONS.get(mode, f"unknown classification ({mode})")
print(f"\nCLAUDE.md — {description}")

if not stale_empty:
    print("\nSTALE HOOKS — to remove (deprecated/broken, timestamped backup first):")
    for f in stale:
        matches = (f or {}).get("matches") or []
        if not matches:
            continue
        print(f"  {f.get('file', '?')}")
        for m in matches:
            desc = m.get("pattern_description") or m.get("pattern_id", "?")
            print(f"    - {m.get('location', '?')}: {desc}")
PYEOF
}

# --- thinking-display fix (S1, §9.1) -------------------------------------
# Wraps Claude Code invocations with --thinking-display summarized to
# restore Opus 4.7 reasoning summaries (issue #49268). Two install
# vectors: shell rc alias for terminal usage, VS Code claudeProcessWrapper
# setting for IDE usage. Idempotent; uses delimited marker block in shell
# rc so re-running setup detects existing install correctly. Per-install
# detection separates "already installed" from "alien claude alias
# detected" — the latter is surfaced for user review without overwriting.

cmd_detect_thinking_fix() {
    local shell_name="${1:-}"
    [[ -n "$shell_name" ]] || die "detect-thinking-fix: shell name required (bash|zsh)"

    python3 <<PYEOF
import json, os

schema = json.load(open("$SCHEMA_FILE"))
fix = schema.get("thinkingFix", {})
marker_start = fix.get("shellMarkerStart", "")
marker_end = fix.get("shellMarkerEnd", "")
vscode_setting = fix.get("vscodeWrapperSettingKey", "")

shell = "$shell_name"
home = os.path.expanduser("~")

# Resolve shell rc path
rc_path = ""
if shell == "bash":
    rc_path = os.path.join(home, ".bashrc")
elif shell == "zsh":
    zdotdir = os.environ.get("ZDOTDIR", home)
    rc_path = os.path.join(zdotdir, ".zshrc")
else:
    rc_path = ""

shell_status = {"shell": shell, "rc_path": rc_path, "rc_exists": False,
                "rc_writable": False, "marker_present": False,
                "alien_alias_present": False, "needs_install": False,
                "supported": shell in ("bash", "zsh")}

if rc_path:
    shell_status["rc_exists"] = os.path.isfile(rc_path)
    parent = os.path.dirname(rc_path) or home
    shell_status["rc_writable"] = os.access(parent, os.W_OK) and (
        not shell_status["rc_exists"] or os.access(rc_path, os.W_OK))
    if shell_status["rc_exists"]:
        try:
            content = open(rc_path).read()
            if marker_start in content:
                shell_status["marker_present"] = True
            else:
                # Look for an existing 'alias claude=' the user wrote themselves
                for line in content.splitlines():
                    s = line.strip()
                    if s.startswith("alias claude=") or s.startswith("alias claude="):
                        shell_status["alien_alias_present"] = True
                        break
        except Exception:
            pass
    shell_status["needs_install"] = (shell_status["supported"] and
                                      shell_status["rc_writable"] and
                                      not shell_status["marker_present"] and
                                      not shell_status["alien_alias_present"])

# VS Code settings detection
vscode_paths = [
    os.path.join(home, ".config", "Code", "User", "settings.json"),
    os.path.join(home, "Library", "Application Support", "Code", "User", "settings.json"),
]
vscode_path = next((p for p in vscode_paths if os.path.isfile(p)), "")
vscode_status = {"settings_path": vscode_path, "settings_exists": bool(vscode_path),
                 "wrapper_set": False, "alien_wrapper_set": False, "needs_install": False}
if vscode_path:
    try:
        with open(vscode_path) as f:
            settings = json.load(f)
        existing = settings.get(vscode_setting, "")
        if existing:
            if "cc-thinking-wrapper.sh" in existing:
                vscode_status["wrapper_set"] = True
            else:
                vscode_status["alien_wrapper_set"] = True
                vscode_status["existing_wrapper"] = existing
    except Exception:
        pass
    vscode_status["needs_install"] = (not vscode_status["wrapper_set"] and
                                       not vscode_status["alien_wrapper_set"])

print(json.dumps({"shell": shell_status, "vscode": vscode_status}))
PYEOF
}

cmd_apply_thinking_fix_shell() {
    local shell_name="${1:-}"
    [[ -n "$shell_name" ]] || die "apply-thinking-fix-shell: shell name required (bash|zsh)"

    # Quoted heredoc so Python sees literal ${VIBE_NO_THINKING_FIX:-} in the
    # snippet content. Vars passed via env: SCHEMA_FILE, RC_SHELL.
    SCHEMA_FILE="$SCHEMA_FILE" RC_SHELL="$shell_name" python3 <<'PYEOF'
import json, os, sys, datetime

schema = json.load(open(os.environ["SCHEMA_FILE"]))
fix = schema.get("thinkingFix", {})
marker_start = fix.get("shellMarkerStart", "")
marker_end = fix.get("shellMarkerEnd", "")

shell = os.environ["RC_SHELL"]
home = os.path.expanduser("~")
if shell == "bash":
    rc_path = os.path.join(home, ".bashrc")
elif shell == "zsh":
    zdotdir = os.environ.get("ZDOTDIR", home)
    rc_path = os.path.join(zdotdir, ".zshrc")
else:
    print(f"reconciler: unsupported shell '{shell}' (only bash/zsh)", file=sys.stderr)
    sys.exit(2)

# Idempotent: skip if marker already present
existing = ""
if os.path.isfile(rc_path):
    existing = open(rc_path).read()
    if marker_start in existing:
        print(json.dumps({"status": "already_installed", "rc_path": rc_path}))
        sys.exit(0)

snippet = "\n".join([
    "",
    marker_start,
    "# Restores Opus 4.7 reasoning summaries (#49268). Anthropic shipped",
    "# thinking display 'omitted' as the new default and the documented CC",
    "# setting (showThinkingSummaries) is unwired in the harness per binary",
    "# RE. The actual fix is the hidden CLI flag --thinking-display",
    "# summarized. Disable: VIBE_NO_THINKING_FIX=1",
    'if [ -z "${VIBE_NO_THINKING_FIX:-}" ] && command -v claude >/dev/null 2>&1; then',
    "    alias claude='command claude --thinking-display summarized'",
    "fi",
    marker_end,
    "",
])

# Backup if file exists
if os.path.isfile(rc_path):
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
    with open(f"{rc_path}.bak-{ts}", "w") as f:
        f.write(existing)
    new_content = existing + ("\n" if not existing.endswith("\n") else "") + snippet
else:
    new_content = snippet

with open(rc_path, "w") as f:
    f.write(new_content)

print(json.dumps({"status": "installed", "rc_path": rc_path}))
PYEOF
}

cmd_remove_thinking_fix_shell() {
    local shell_name="${1:-}"
    [[ -n "$shell_name" ]] || die "remove-thinking-fix-shell: shell name required (bash|zsh)"

    SCHEMA_FILE="$SCHEMA_FILE" RC_SHELL="$shell_name" python3 <<'PYEOF'
import json, os, sys, re, datetime

schema = json.load(open(os.environ["SCHEMA_FILE"]))
fix = schema.get("thinkingFix", {})
marker_start = fix.get("shellMarkerStart", "")
marker_end = fix.get("shellMarkerEnd", "")

shell = os.environ["RC_SHELL"]
home = os.path.expanduser("~")
if shell == "bash":
    rc_path = os.path.join(home, ".bashrc")
elif shell == "zsh":
    zdotdir = os.environ.get("ZDOTDIR", home)
    rc_path = os.path.join(zdotdir, ".zshrc")
else:
    print(f"reconciler: unsupported shell '{shell}'", file=sys.stderr)
    sys.exit(2)

if not os.path.isfile(rc_path):
    print(json.dumps({"status": "not_present", "rc_path": rc_path}))
    sys.exit(0)

content = open(rc_path).read()
if marker_start not in content:
    print(json.dumps({"status": "not_present", "rc_path": rc_path}))
    sys.exit(0)

ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
with open(f"{rc_path}.bak-{ts}", "w") as f:
    f.write(content)

# Remove the entire delimited block (start..end inclusive), tolerating
# leading/trailing newlines. Re-uses literal markers for safety.
pattern = re.compile(
    r"\n?" + re.escape(marker_start) + r".*?" + re.escape(marker_end) + r"\n?",
    re.DOTALL
)
new_content = pattern.sub("", content)

with open(rc_path, "w") as f:
    f.write(new_content)

print(json.dumps({"status": "removed", "rc_path": rc_path}))
PYEOF
}

cmd_apply_thinking_fix_vscode() {
    local settings_path="${1:-}"
    local wrapper_abs="${2:-}"
    [[ -n "$settings_path" ]] || die "apply-thinking-fix-vscode: settings path required"
    [[ -n "$wrapper_abs" ]] || die "apply-thinking-fix-vscode: wrapper script absolute path required"

    SCHEMA_FILE="$SCHEMA_FILE" SETTINGS_PATH="$settings_path" WRAPPER_ABS="$wrapper_abs" python3 <<'PYEOF'
import json, os, sys, datetime

schema = json.load(open(os.environ["SCHEMA_FILE"]))
fix = schema.get("thinkingFix", {})
setting_key = fix.get("vscodeWrapperSettingKey", "")

settings_path = os.environ["SETTINGS_PATH"]
wrapper_abs = os.environ["WRAPPER_ABS"]

if not os.path.isfile(wrapper_abs) or not os.access(wrapper_abs, os.X_OK):
    print(f"reconciler: wrapper script not found or not executable: {wrapper_abs}", file=sys.stderr)
    sys.exit(2)

# Read existing settings or initialize
if os.path.isfile(settings_path):
    try:
        with open(settings_path) as f:
            settings = json.load(f)
    except json.JSONDecodeError:
        print(f"reconciler: settings file is invalid JSON: {settings_path}", file=sys.stderr)
        sys.exit(2)
else:
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)
    settings = {}

existing = settings.get(setting_key, "")
if existing == wrapper_abs:
    print(json.dumps({"status": "already_installed", "settings_path": settings_path}))
    sys.exit(0)
if existing and "cc-thinking-wrapper.sh" not in existing:
    # Don't clobber a user's custom wrapper
    print(json.dumps({"status": "alien_wrapper_present",
                      "settings_path": settings_path,
                      "existing_wrapper": existing}))
    sys.exit(0)

# Backup before mutate
if os.path.isfile(settings_path):
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
    with open(f"{settings_path}.bak-{ts}", "w") as f:
        json.dump(settings, f, indent=2)

settings[setting_key] = wrapper_abs

with open(settings_path, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")

print(json.dumps({"status": "installed", "settings_path": settings_path,
                  "wrapper": wrapper_abs}))
PYEOF
}

# --- stale-hook detection and cleanup (5.5.7) ----------------------------
# Scans a settings.json (user or project) for hook entries + statusLine whose
# command matches any denyPattern in the schema. Hooks that survived from VIBE
# v1 (morpheus) or that share the same anti-pattern ($CLAUDE_PROJECT_DIR in an
# unquoted command, see 5.5.7 CHANGELOG) are identified here so the reconciler
# can surface them in the diff and remove them on apply, with a timestamped
# backup. The project-scope scanner `vibe-v1-cleanup.sh` covers the filesystem
# side (morpheus/ dir, .forge/, etc.) — this sub-command covers the user/
# project settings.json hook entries that the filesystem scanner does not.
cmd_detect_stale_hooks() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "detect-stale-hooks: settings path required"

    SCHEMA_FILE="$SCHEMA_FILE" SETTINGS_PATH="$settings_path" python3 <<'PYEOF'
import json, os, sys

schema = json.load(open(os.environ["SCHEMA_FILE"]))
patterns = schema.get("settingsHooksDenyPatterns", []) or []
settings_path = os.environ["SETTINGS_PATH"]

empty = {"file": settings_path, "exists": False, "matches": []}

if not os.path.isfile(settings_path):
    print(json.dumps(empty))
    sys.exit(0)

try:
    with open(settings_path) as f:
        settings = json.load(f)
except json.JSONDecodeError:
    # Don't propagate JSONDecodeError — report as "can't scan" so the
    # setup flow continues without claiming a clean scan we didn't do.
    print(json.dumps({"file": settings_path, "exists": True, "matches": [],
                      "unreadable": True}))
    sys.exit(0)

matches = []

def _check_command(cmd, location):
    if not isinstance(cmd, str):
        return
    for p in patterns:
        needle = p.get("commandContains", "")
        if needle and needle in cmd:
            matches.append({
                "location": location,
                "command": cmd,
                "pattern_id": p.get("id", "unknown"),
                "pattern_description": p.get("description", ""),
            })

# Top-level legacy shape: settings["PreToolUse"] = [...]
for top_event in ("PreToolUse", "PostToolUse", "SessionStart", "Stop",
                  "SubagentStop", "PreCompact", "UserPromptSubmit",
                  "PostToolUseFailure", "SessionEnd"):
    val = settings.get(top_event)
    if isinstance(val, list):
        for i, matcher in enumerate(val):
            if isinstance(matcher, dict):
                for j, h in enumerate(matcher.get("hooks", []) or []):
                    if isinstance(h, dict):
                        _check_command(h.get("command", ""),
                                       f"{top_event}[{i}].hooks[{j}]")

# Nested canonical shape: settings["hooks"]["PreToolUse"] = [...]
hooks = settings.get("hooks")
if isinstance(hooks, dict):
    for event, matchers in hooks.items():
        if isinstance(matchers, list):
            for i, matcher in enumerate(matchers):
                if isinstance(matcher, dict):
                    for j, h in enumerate(matcher.get("hooks", []) or []):
                        if isinstance(h, dict):
                            _check_command(h.get("command", ""),
                                           f"hooks.{event}[{i}].hooks[{j}]")

# statusLine (top-level dict with .command)
sl = settings.get("statusLine")
if isinstance(sl, dict):
    _check_command(sl.get("command", ""), "statusLine")

print(json.dumps({"file": settings_path, "exists": True, "matches": matches}))
PYEOF
}

cmd_apply_clean_stale_hooks() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "apply-clean-stale-hooks: settings path required"

    local matches_json
    matches_json=$(cat)

    local has_work
    has_work=$(echo "$matches_json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('yes' if d.get('matches') else 'no')
")
    if [[ "$has_work" == "no" ]]; then
        return 0
    fi

    [[ -f "$settings_path" ]] || return 0

    local ts
    ts=$(date -u +%Y%m%d-%H%M%S)
    cp "$settings_path" "$settings_path.bak-stale-hooks-$ts"

    SCHEMA_FILE="$SCHEMA_FILE" SETTINGS_PATH="$settings_path" python3 <<'PYEOF'
import json, os

schema = json.load(open(os.environ["SCHEMA_FILE"]))
patterns = schema.get("settingsHooksDenyPatterns", []) or []
needles = [p.get("commandContains", "") for p in patterns if p.get("commandContains")]

settings_path = os.environ["SETTINGS_PATH"]
with open(settings_path) as f:
    settings = json.load(f)

def _contains_any(cmd):
    return isinstance(cmd, str) and any(n in cmd for n in needles)

def _filter_matchers(matchers):
    if not isinstance(matchers, list):
        return matchers, False
    out = []
    changed = False
    for m in matchers:
        if not isinstance(m, dict):
            out.append(m); continue
        hooks = m.get("hooks", [])
        if isinstance(hooks, list):
            clean_hooks = [h for h in hooks
                           if not (isinstance(h, dict) and _contains_any(h.get("command", "")))]
            if len(clean_hooks) != len(hooks):
                changed = True
                if clean_hooks:
                    m2 = dict(m); m2["hooks"] = clean_hooks
                    out.append(m2)
                # else drop the whole matcher
            else:
                out.append(m)
        else:
            out.append(m)
    return out, changed

# Nested canonical shape
hooks = settings.get("hooks")
if isinstance(hooks, dict):
    new_hooks = {}
    any_changed = False
    for event, matchers in hooks.items():
        filtered, changed = _filter_matchers(matchers)
        any_changed = any_changed or changed
        if filtered:
            new_hooks[event] = filtered
    if any_changed:
        if new_hooks:
            settings["hooks"] = new_hooks
        else:
            settings.pop("hooks", None)

# Top-level legacy shape
for top_event in ("PreToolUse", "PostToolUse", "SessionStart", "Stop",
                  "SubagentStop", "PreCompact", "UserPromptSubmit",
                  "PostToolUseFailure", "SessionEnd"):
    val = settings.get(top_event)
    if isinstance(val, list):
        filtered, changed = _filter_matchers(val)
        if changed:
            if filtered:
                settings[top_event] = filtered
            else:
                settings.pop(top_event, None)

# statusLine
sl = settings.get("statusLine")
if isinstance(sl, dict) and _contains_any(sl.get("command", "")):
    settings.pop("statusLine", None)

with open(settings_path, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYEOF
}

# --- orphan-hook detection and cleanup (5.8.0) ---------------------------
# Generalization of stale-hook recovery: instead of matching commands against
# a hard-coded denylist (settingsHooksDenyPatterns), this pass extracts every
# literal absolute path argument from each hook command and flags the hook
# when ANY such path is missing on disk. This catches stale hooks from
# foreign frameworks (Booost-app/morpheus injector, custom user hooks,
# third-party plugins) that the denylist scope cannot cover.
#
# Token-based extraction (not single regex with lookbehind): split command on
# whitespace, skip tokens containing ${ or $( (templated), skip tokens not
# starting with / (after stripping a single leading quote/backtick char),
# then check os.path.isfile on the stripped path. Conservative — false
# negative on dynamic paths is fine; denylist scanner already covers known
# patterns regardless of file existence.
cmd_detect_orphan_hooks() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "detect-orphan-hooks: settings path required"

    SETTINGS_PATH="$settings_path" python3 <<'PYEOF'
import json, os, re, sys

settings_path = os.environ["SETTINGS_PATH"]
empty = {"file": settings_path, "exists": False, "matches": []}

if not os.path.isfile(settings_path):
    print(json.dumps(empty))
    sys.exit(0)

try:
    with open(settings_path) as f:
        settings = json.load(f)
except json.JSONDecodeError:
    print(json.dumps({"file": settings_path, "exists": True, "matches": [],
                      "unreadable": True}))
    sys.exit(0)

def _missing_path_in(cmd):
    """Return the first absolute-path token in cmd that does not exist on disk,
    or None if every absolute-path token is present (or there are none)."""
    if not isinstance(cmd, str) or not cmd:
        return None
    for raw in re.split(r'\s+', cmd.strip()):
        if not raw:
            continue
        if "${" in raw or "$(" in raw:
            continue  # templated — defer to runtime, do not flag
        # Strip a single leading/trailing quote or backtick if any
        tok = raw
        for q in ("'", '"', "`"):
            if tok.startswith(q):
                tok = tok[1:]
            if tok.endswith(q):
                tok = tok[:-1]
        # Strip trailing shell separators glued to the token
        tok = re.sub(r'[;|&<>].*$', '', tok)
        if not tok.startswith("/"):
            continue
        # Cut off any embedded shell-special chars that survived the split
        tok = re.split(r'[\s"\'`|&;<>]', tok, maxsplit=1)[0]
        if not tok:
            continue
        if not os.path.isfile(tok):
            return tok
    return None

matches = []

def _scan_command(cmd, location):
    miss = _missing_path_in(cmd)
    if miss is not None:
        matches.append({"location": location, "command": cmd, "missing_path": miss})

# Top-level legacy shape
for top_event in ("PreToolUse", "PostToolUse", "SessionStart", "Stop",
                  "SubagentStop", "PreCompact", "UserPromptSubmit",
                  "PostToolUseFailure", "SessionEnd"):
    val = settings.get(top_event)
    if isinstance(val, list):
        for i, matcher in enumerate(val):
            if isinstance(matcher, dict):
                for j, h in enumerate(matcher.get("hooks", []) or []):
                    if isinstance(h, dict):
                        _scan_command(h.get("command", ""),
                                      f"{top_event}[{i}].hooks[{j}]")

# Nested canonical shape
hooks = settings.get("hooks")
if isinstance(hooks, dict):
    for event, matchers in hooks.items():
        if isinstance(matchers, list):
            for i, matcher in enumerate(matchers):
                if isinstance(matcher, dict):
                    for j, h in enumerate(matcher.get("hooks", []) or []):
                        if isinstance(h, dict):
                            _scan_command(h.get("command", ""),
                                          f"hooks.{event}[{i}].hooks[{j}]")

# statusLine
sl = settings.get("statusLine")
if isinstance(sl, dict):
    _scan_command(sl.get("command", ""), "statusLine")

print(json.dumps({"file": settings_path, "exists": True, "matches": matches}))
PYEOF
}

cmd_apply_clean_orphan_hooks() {
    local settings_path="${1:-}"
    [[ -n "$settings_path" ]] || die "apply-clean-orphan-hooks: settings path required"

    local matches_json
    matches_json=$(cat)

    local has_work
    has_work=$(echo "$matches_json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('yes' if d.get('matches') else 'no')
")
    if [[ "$has_work" == "no" ]]; then
        return 0
    fi

    [[ -f "$settings_path" ]] || return 0

    local ts
    ts=$(date -u +%Y%m%d-%H%M%S)
    cp "$settings_path" "$settings_path.bak-orphan-hooks-$ts"

    SETTINGS_PATH="$settings_path" MATCHES_JSON="$matches_json" python3 <<'PYEOF'
import json, os

settings_path = os.environ["SETTINGS_PATH"]
matches = json.loads(os.environ["MATCHES_JSON"]).get("matches", [])

# Build a set of (location, command) tuples to drop. Location is the canonical
# JSON path the detector emitted.
drop_set = {(m.get("location", ""), m.get("command", "")) for m in matches}

with open(settings_path) as f:
    settings = json.load(f)

def _filter_matchers(matchers, location_prefix):
    if not isinstance(matchers, list):
        return matchers, False
    out = []
    changed = False
    for i, m in enumerate(matchers):
        if not isinstance(m, dict):
            out.append(m); continue
        hooks = m.get("hooks", [])
        if isinstance(hooks, list):
            clean_hooks = []
            for j, h in enumerate(hooks):
                if isinstance(h, dict):
                    loc = f"{location_prefix}[{i}].hooks[{j}]"
                    cmd = h.get("command", "")
                    if (loc, cmd) in drop_set:
                        changed = True
                        continue
                clean_hooks.append(h)
            if clean_hooks:
                if len(clean_hooks) != len(hooks):
                    m2 = dict(m); m2["hooks"] = clean_hooks
                    out.append(m2)
                else:
                    out.append(m)
            else:
                changed = True  # whole matcher dropped
        else:
            out.append(m)
    return out, changed

# Nested canonical shape
hooks = settings.get("hooks")
if isinstance(hooks, dict):
    new_hooks = {}
    any_changed = False
    for event, matchers in hooks.items():
        filtered, changed = _filter_matchers(matchers, f"hooks.{event}")
        any_changed = any_changed or changed
        if filtered:
            new_hooks[event] = filtered
    if any_changed:
        if new_hooks:
            settings["hooks"] = new_hooks
        else:
            settings.pop("hooks", None)

# Top-level legacy shape
for top_event in ("PreToolUse", "PostToolUse", "SessionStart", "Stop",
                  "SubagentStop", "PreCompact", "UserPromptSubmit",
                  "PostToolUseFailure", "SessionEnd"):
    val = settings.get(top_event)
    if isinstance(val, list):
        filtered, changed = _filter_matchers(val, top_event)
        if changed:
            if filtered:
                settings[top_event] = filtered
            else:
                settings.pop(top_event, None)

# statusLine — drop if it was flagged
sl = settings.get("statusLine")
if isinstance(sl, dict):
    cmd = sl.get("command", "")
    if ("statusLine", cmd) in drop_set:
        settings.pop("statusLine", None)

with open(settings_path, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYEOF
}

# --- pragmatic alias extension (5.5.3) -----------------------------------
cmd_apply_pragmatic_alias() {
    local shell_name="${1:-}"
    [[ -n "$shell_name" ]] || die "apply-pragmatic-alias: shell name required (bash|zsh)"

    SCHEMA_FILE="$SCHEMA_FILE" RC_SHELL="$shell_name" python3 <<'PYEOF'
import json, os, sys, re, datetime

schema = json.load(open(os.environ["SCHEMA_FILE"]))
fix = schema.get("thinkingFix", {})
marker_start = fix.get("shellMarkerStart", "")
marker_end = fix.get("shellMarkerEnd", "")
if not marker_start or not marker_end:
    print("reconciler: thinkingFix markers missing in schema", file=sys.stderr)
    sys.exit(3)

shell = os.environ["RC_SHELL"]
home = os.path.expanduser("~")
if shell == "bash":
    rc_path = os.path.join(home, ".bashrc")
elif shell == "zsh":
    zdotdir = os.environ.get("ZDOTDIR", home)
    rc_path = os.path.join(zdotdir, ".zshrc")
else:
    print(f"reconciler: unsupported shell '{shell}' (only bash/zsh)", file=sys.stderr)
    sys.exit(2)

if not os.path.isfile(rc_path):
    print(json.dumps({"status": "no_rc_file", "rc_path": rc_path}))
    sys.exit(0)

content = open(rc_path).read()

# Locate the VIBE marker block (same as apply-thinking-fix-shell).
block_re = re.compile(re.escape(marker_start) + r"(.*?)" + re.escape(marker_end), re.DOTALL)
m = block_re.search(content)
if not m:
    print(json.dumps({"status": "no_marker_block", "rc_path": rc_path}))
    sys.exit(0)

block_full = m.group(0)
inner = m.group(1)

# Find the alias line inside the block. Single-quoted RHS per apply-thinking-fix-shell.
alias_re = re.compile(r"^(?P<prefix>\s*alias\s+claude\s*=\s*)'(?P<rhs>[^']*)'", re.MULTILINE)
am = alias_re.search(inner)
if not am:
    print(json.dumps({"status": "no_alias_in_block", "rc_path": rc_path}))
    sys.exit(0)

current_rhs = am.group("rhs")

# Idempotent: if the append-system-prompt flag already points at our file, no-op.
if "--append-system-prompt" in current_rhs and "vibe-pragmatic-prompt.txt" in current_rhs:
    print(json.dumps({"status": "already_extended", "rc_path": rc_path}))
    sys.exit(0)

# Extension: preserve the existing RHS and append our flag. We keep the outer
# single-quote on the alias and embed the double-quoted $(cat ...) unchanged —
# the alias RHS is a single-quoted literal, so $(...) expands at alias-use time.
extension = ' --append-system-prompt "$(cat ~/.claude/vibe-pragmatic-prompt.txt)"'
new_rhs = current_rhs.rstrip() + extension
new_alias_line = am.group("prefix") + "'" + new_rhs + "'"

# Rebuild inner, then rebuild block, then rebuild content.
new_inner = inner[:am.start()] + new_alias_line + inner[am.end():]
new_block = marker_start + new_inner + marker_end

ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
with open(f"{rc_path}.bak-{ts}", "w") as f:
    f.write(content)

new_content = content[:m.start()] + new_block + content[m.end():]
with open(rc_path, "w") as f:
    f.write(new_content)

print(json.dumps({"status": "extended", "rc_path": rc_path}))
PYEOF
}

# --- dispatch -------------------------------------------------------------
main() {
    require_schema
    local sub="${1:-}"
    shift || true
    case "$sub" in
        write-marker)               cmd_write_marker "$@" ;;
        read-marker)                cmd_read_marker "$@" ;;
        check-version)              cmd_check_version "$@" ;;
        detect-env)                 cmd_detect_env "$@" ;;
        apply-env)                  cmd_apply_env "$@" ;;
        detect-top-level)           cmd_detect_top_level "$@" ;;
        apply-top-level)            cmd_apply_top_level "$@" ;;
        detect-data)                cmd_detect_data "$@" ;;
        apply-data)                 cmd_apply_data "$@" ;;
        classify-claude-md)         cmd_classify_claude_md "$@" ;;
        apply-claude-md)            cmd_apply_claude_md "$@" ;;
        present-diff)               cmd_present_diff "$@" ;;
        detect-thinking-fix)        cmd_detect_thinking_fix "$@" ;;
        apply-thinking-fix-shell)   cmd_apply_thinking_fix_shell "$@" ;;
        remove-thinking-fix-shell)  cmd_remove_thinking_fix_shell "$@" ;;
        apply-thinking-fix-vscode)  cmd_apply_thinking_fix_vscode "$@" ;;
        apply-pragmatic-alias)      cmd_apply_pragmatic_alias "$@" ;;
        detect-stale-hooks)         cmd_detect_stale_hooks "$@" ;;
        apply-clean-stale-hooks)    cmd_apply_clean_stale_hooks "$@" ;;
        detect-orphan-hooks)        cmd_detect_orphan_hooks "$@" ;;
        apply-clean-orphan-hooks)   cmd_apply_clean_orphan_hooks "$@" ;;
        generate-managed-content)   cmd_generate_managed_content "$@" ;;
        "" )                        die "no subcommand" ;;
        *)                          die "unknown subcommand: $sub" ;;
    esac
}

main "$@"

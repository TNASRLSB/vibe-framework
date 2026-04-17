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

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --project-name)       project_name="$2"; shift 2 ;;
            --build)              build_cmd="$2"; shift 2 ;;
            --test)               test_cmd="$2"; shift 2 ;;
            --lint)               lint_cmd="$2"; shift 2 ;;
            --mode)               mode="$2"; shift 2 ;;
            --approve-regenerate) approve_regenerate="true"; shift ;;
            *)                    die "apply-claude-md: unknown flag $1" ;;
        esac
    done

    local template="$SCRIPT_DIR/claude-md-template.md"
    [[ -f "$template" ]] || die "template not found: $template"

    local rendered
    rendered=$(python3 <<PYEOF
tpl = open("$template").read()
out = (tpl
    .replace("{{PROJECT_NAME}}", "$project_name")
    .replace("{{BUILD_CMD}}", "$build_cmd")
    .replace("{{TEST_CMD}}", "$test_cmd")
    .replace("{{LINT_CMD}}", "$lint_cmd"))
print(out)
PYEOF
)

    case "$mode" in
        MISSING)
            printf '%s' "$rendered" > "$path"
            ;;
        MANAGED_REGION_PRESENT)
            python3 <<PYEOF
import json, re

schema = json.load(open("$SCHEMA_FILE"))
start = schema["claudeMdManagedMarkerStart"]
end = schema["claudeMdManagedMarkerEnd"]

with open("$path") as f:
    content = f.read()

rendered = """$rendered"""
m = re.search(re.escape(start) + r".*?" + re.escape(end), rendered, re.DOTALL)
if not m:
    raise SystemExit("rendered template missing markers")
new_region = m.group(0)

pattern = re.escape(start) + r".*?" + re.escape(end)
new_content = re.sub(pattern, lambda _: new_region, content, count=1, flags=re.DOTALL)

with open("$path", "w") as f:
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
data = diff.get("data", {})
cmd = diff.get("claude_md", {})

env_empty = not env.get("to_add") and not env.get("to_update") and not env.get("to_remove")
data_empty = not data.get("to_remove")
claude_untouched = not cmd.get("will_touch", False)

if env_empty and data_empty and claude_untouched:
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

if data.get("to_remove"):
    print("\nDATA FILES — to remove (deprecated, backed up first):")
    for name in data["to_remove"]:
        print(f"  - {name}")

print(f"\nCLAUDE.md — classification: {cmd.get('mode', 'UNKNOWN')}")
if cmd.get("will_touch"):
    print("  (this file will be modified)")
else:
    print("  (no changes to this file)")
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
        detect-data)                cmd_detect_data "$@" ;;
        apply-data)                 cmd_apply_data "$@" ;;
        classify-claude-md)         cmd_classify_claude_md "$@" ;;
        apply-claude-md)            cmd_apply_claude_md "$@" ;;
        present-diff)               cmd_present_diff "$@" ;;
        detect-thinking-fix)        cmd_detect_thinking_fix "$@" ;;
        apply-thinking-fix-shell)   cmd_apply_thinking_fix_shell "$@" ;;
        remove-thinking-fix-shell)  cmd_remove_thinking_fix_shell "$@" ;;
        apply-thinking-fix-vscode)  cmd_apply_thinking_fix_vscode "$@" ;;
        "" )                        die "no subcommand" ;;
        *)                          die "unknown subcommand: $sub" ;;
    esac
}

main "$@"

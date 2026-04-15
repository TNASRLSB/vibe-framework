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

# --- dispatch -------------------------------------------------------------
main() {
    require_schema
    local sub="${1:-}"
    shift || true
    case "$sub" in
        write-marker)    cmd_write_marker "$@" ;;
        read-marker)     cmd_read_marker "$@" ;;
        check-version)   cmd_check_version "$@" ;;
        detect-env)      cmd_detect_env "$@" ;;
        apply-env)       cmd_apply_env "$@" ;;
        "" )             die "no subcommand" ;;
        *)               die "unknown subcommand: $sub" ;;
    esac
}

main "$@"

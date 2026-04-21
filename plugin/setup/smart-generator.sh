#!/usr/bin/env bash
# ============================================================================
# smart-generator.sh — VIBE 5.4 CLAUDE.md Smart Generator
# ----------------------------------------------------------------------------
# Produces four managed sub-sections for CLAUDE.md:
#   PROJECT_CONTEXT_BLOCK   — stack, framework, 3-5 load-bearing conventions
#   MODEL_PATTERN_BLOCK     — Opus planning / Sonnet impl guidance
#   CAPABILITY_AUDIT_BLOCK  — failure-modes armed checklist
#   HARNESS_LIMITS_BLOCK    — VIBE harness positioning ("what we cannot do")
#
# Output: JSON on stdout:
#   {
#     "project_context": "...",
#     "model_pattern": "...",
#     "capability_audit": "...",
#     "harness_limits": "..."
#   }
# Total content enforced ≤ 1200 tokens (truncated with warning if exceeded).
#
# Usage:
#   smart-generator.sh --project-root <dir> --settings <settings.json>
# ============================================================================

set -uo pipefail

PROJECT_ROOT=""
SETTINGS_PATH=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --project-root) PROJECT_ROOT="$2"; shift 2 ;;
        --settings)     SETTINGS_PATH="$2"; shift 2 ;;
        *)              echo "smart-generator: unknown flag $1" >&2; exit 2 ;;
    esac
done

[[ -n "$PROJECT_ROOT" && -d "$PROJECT_ROOT" ]] || { echo "smart-generator: --project-root required" >&2; exit 2; }
[[ -n "$SETTINGS_PATH" ]] || SETTINGS_PATH="$HOME/.claude/settings.json"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Project scan module --------------------------------------------------
scan_project() {
    PROJECT_ARG="$PROJECT_ROOT" python3 <<'PYEOF'
import json, os, re
root = os.environ["PROJECT_ARG"]

def read(p):
    try:
        with open(os.path.join(root, p)) as f:
            return f.read()
    except Exception:
        return ""

stack = []
framework = ""
test_cmd = ""
build_cmd = ""
lint_cmd = ""

pkg_raw = read("package.json")
if pkg_raw:
    try:
        pkg = json.loads(pkg_raw)
        stack.append("Node.js / JavaScript (package.json)")
        scripts = pkg.get("scripts", {}) or {}
        test_cmd  = scripts.get("test", "")
        build_cmd = scripts.get("build", scripts.get("start", ""))
        lint_cmd  = scripts.get("lint", "")
        deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}
        if "express" in deps: framework = "Express"
        elif "next" in deps: framework = "Next.js"
        elif "react" in deps: framework = "React"
        elif "vue" in deps: framework = "Vue"
    except Exception:
        pass

if os.path.exists(os.path.join(root, "pyproject.toml")):
    stack.append("Python (pyproject.toml)")
    py = read("pyproject.toml")
    if "fastapi" in py.lower(): framework = framework or "FastAPI"
    elif "django" in py.lower(): framework = framework or "Django"
    elif "flask" in py.lower(): framework = framework or "Flask"
elif os.path.exists(os.path.join(root, "requirements.txt")):
    stack.append("Python (requirements.txt)")

if os.path.exists(os.path.join(root, "Cargo.toml")):
    stack.append("Rust (Cargo.toml)")
if os.path.exists(os.path.join(root, "go.mod")):
    stack.append("Go (go.mod)")

if os.path.exists(os.path.join(root, "Makefile")) and not test_cmd:
    test_cmd = "make test"; build_cmd = build_cmd or "make build"

# Detect up to 5 load-bearing directory conventions (src/*, routes/, handlers/, etc.)
conventions = []
for name in ("src/routes", "src/middleware", "src/handlers", "src/components",
             "src/models", "src/services", "app", "pages", "notebooks",
             "ios", "android", "controllers"):
    full = os.path.join(root, name)
    if os.path.isdir(full):
        conventions.append(name)
    if len(conventions) >= 5:
        break

# Entry point heuristic
entry = ""
for cand in ("src/index.js", "src/main.py", "src/lib.rs", "cmd/main.go",
             "main.py", "index.js", "app.js"):
    if os.path.exists(os.path.join(root, cand)):
        entry = cand
        break

lines = []
if stack: lines.append(f"- **Stack:** {', '.join(stack)}")
if framework: lines.append(f"- **Framework:** {framework}")
if entry: lines.append(f"- **Entry point:** `{entry}`")
if build_cmd: lines.append(f"- **Build:** `{build_cmd}`")
if test_cmd:  lines.append(f"- **Test:** `{test_cmd}`")
if lint_cmd:  lines.append(f"- **Lint:** `{lint_cmd}`")
if conventions:
    lines.append(f"- **Conventions:** {', '.join('`'+c+'`' for c in conventions)}")

print("\n".join(lines) if lines else "_No code stack auto-detected. Fill this block manually for content/KB/docs projects, or rely on skills that don't depend on stack (ghostwriter, scribe, seurat)._")
PYEOF
}

PROJECT_CONTEXT=$(scan_project)

# --- Model operational pattern (§2.2.2) -----------------------------------
# Note (5.5.1 fix): the 5.4.0 version called `claude -p --model X --print-only-model-id`
# to probe per-model availability, but that flag does not exist in the Claude Code
# CLI. Every probe returned "unknown", producing a useless line. Removed entirely:
# the static guidance below is self-contained and Claude Code surfaces the real
# error if the user tries to invoke an unavailable model.

MODEL_PATTERN=$(cat <<'EOF'
- **Planning / spec / judgement:** Opus 4.7 (creative, architectural) or Opus 4.6 (instruction-heavy, longer-query). Pick 4.6 if the task is specification-dense or requires strict rule-following.
- **Mechanical implementation** (porting, refactor-to-spec, test writing): delegate to **Sonnet 4.6** via subagent or `claude -p --model sonnet-4-6`.
- **Classification / throughput / candidate identification:** Haiku 4.5.
EOF
)
# --- Capability-Coverage audit (§2.2.3) -----------------------------------
CAPABILITY_AUDIT=$(SETTINGS_ARG="$SETTINGS_PATH" PLUGIN_ROOT_ARG="${CLAUDE_PLUGIN_ROOT:-}" python3 <<'PYEOF'
import json, os

path = os.environ["SETTINGS_ARG"]
try:
    settings = json.load(open(path))
except Exception:
    settings = {}

hooks = settings.get("hooks", {}) or {}

plugin_hooks = {}
plugin_root = os.environ.get("PLUGIN_ROOT_ARG", "")
if plugin_root:
    try:
        with open(os.path.join(plugin_root, "hooks", "hooks.json")) as f:
            plugin_hooks = json.load(f).get("hooks", {}) or {}
    except Exception:
        plugin_hooks = {}

def find(cmd_keyword):
    for source in (hooks, plugin_hooks):
        for event, bucket in source.items():
            if not isinstance(bucket, list):
                continue
            for entry in bucket:
                if not isinstance(entry, dict):
                    continue
                for hc in entry.get("hooks", []) or []:
                    if not isinstance(hc, dict):
                        continue
                    if cmd_keyword in str(hc.get("command", "")):
                        return True
    return False

caps = [
    ("rhetoric-guard",     "rhetoric-guard.sh"),
    ("side-effect-verify", "side-effect-verify.sh"),
    ("atomic-enforcement", "atomic-enforcement.sh"),
    ("read-discipline",    "read-discipline.sh"),
    ("read-before-edit",   "read-before-edit.sh"),
    ("pre-tool-security",  "pre-tool-security.sh"),
]

lines = []
missing = []
for label, keyword in caps:
    if find(keyword):
        lines.append(f"- ✓ **{label}** armed")
    else:
        lines.append(f"- ✗ **{label}** missing — run `/vibe:setup` to arm")
        missing.append(label)

header = "All VIBE failure-mode defenses armed." if not missing else f"{len(missing)} defense(s) missing. Run `/vibe:setup` to reconcile."
print(header + "\n\n" + "\n".join(lines))
PYEOF
)
# --- Harness limits (§2.2.4) ---------------------------------------------
HARNESS_LIMITS=$(cat <<'EOF'
VIBE is armor on top of Claude Code, itself a harness on top of the Claude model.

- **Can:** override defaults (effort, thinking-display), inject context (CLAUDE.md, skill descriptions), react to model signals (rhetoric-guard, side-effect-verify, read-discipline).
- **Cannot:** force reasoning beyond Anthropic's harness ceiling, bypass redaction, modify Claude Code's hidden system prompt.

Expect VIBE to extract the maximum from the exposed surface; it does not substitute for the model itself.
EOF
)

# --- Budget enforcement (1200-token hard cap) -----------------------------
PROJECT_CONTEXT="$PROJECT_CONTEXT" \
MODEL_PATTERN="$MODEL_PATTERN" \
CAPABILITY_AUDIT="$CAPABILITY_AUDIT" \
HARNESS_LIMITS="$HARNESS_LIMITS" \
FORCE_BLOAT="${SMART_GEN_FORCE_BLOAT:-0}" \
python3 <<'PYEOF'
import json, os, sys

blocks = {
    "project_context":  os.environ.get("PROJECT_CONTEXT", ""),
    "model_pattern":    os.environ.get("MODEL_PATTERN", ""),
    "capability_audit": os.environ.get("CAPABILITY_AUDIT", ""),
    "harness_limits":   os.environ.get("HARNESS_LIMITS", ""),
}

# Apply artificial bloat for tests
if os.environ.get("FORCE_BLOAT") == "1":
    blocks["project_context"] = blocks["project_context"] + ("\n- " + "x"*80) * 200

# Per-block budgets in chars (≈ tokens * 4)
CAPS = {
    "project_context":  2400,   # 600 tokens
    "model_pattern":    1000,   # 250 tokens
    "capability_audit": 800,    # 200 tokens
    "harness_limits":   600,    # 150 tokens
}
TOTAL_CAP = 4800                # 1200 tokens total

truncated = False

# Step 1: per-block truncation
for key, body in list(blocks.items()):
    cap = CAPS[key]
    if len(body) > cap:
        blocks[key] = body[:cap].rstrip() + "\n_(VIBE smart-generator: section truncated to fit token budget.)_"
        truncated = True

# Step 2: overall total — if still over, shave project_context (largest)
def total_len():
    return sum(len(v) for v in blocks.values())

while total_len() > TOTAL_CAP:
    longest = max(blocks, key=lambda k: len(blocks[k]))
    over = total_len() - TOTAL_CAP
    trim_to = max(200, len(blocks[longest]) - over - 50)
    blocks[longest] = blocks[longest][:trim_to].rstrip() + "\n_(truncated)_"
    truncated = True
    if all(len(v) <= 200 for v in blocks.values()):
        break

if truncated:
    sys.stderr.write("smart-generator: content exceeded budget, truncated to fit. Consider trimming project scan targets.\n")

print(json.dumps(blocks))
PYEOF

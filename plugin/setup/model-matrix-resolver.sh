#!/usr/bin/env bash
# ============================================================================
# model-matrix-resolver.sh — VIBE 5.4 Skill Model/Effort Matrix resolver
# ----------------------------------------------------------------------------
# Reads YAML frontmatter of a SKILL.md and emits the resolved model routing
# as JSON on stdout: {"primary": "...", "effort": "...", "fallback": "..."}
#
# Defaults when the frontmatter has no model: block:
#   primary:  opus-4-7
#   effort:   xhigh
#   fallback: opus-4-6
# ============================================================================

set -uo pipefail

SKILL_PATH="${1:-}"
[[ -n "$SKILL_PATH" && -f "$SKILL_PATH" ]] || { echo "model-matrix-resolver: file required" >&2; exit 2; }

SKILL_ARG="$SKILL_PATH" python3 <<'PYEOF'
import json, os, re, sys
try:
    import yaml
except ImportError:
    sys.stderr.write("model-matrix-resolver: python3 yaml module required\n")
    sys.exit(2)

path = os.environ["SKILL_ARG"]
with open(path) as f:
    content = f.read()

m = re.match(r"---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
fm = {}
if m:
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except Exception as e:
        sys.stderr.write(f"model-matrix-resolver: YAML parse error: {e}\n")
        sys.exit(2)

model = fm.get("model") if isinstance(fm, dict) else None
if not isinstance(model, dict):
    model = {}

resolved = {
    "primary": model.get("primary") or "opus-4-7",
    "effort":  model.get("effort")  or "xhigh",
    "fallback": model.get("fallback") or "opus-4-6",
}
print(json.dumps(resolved))
PYEOF

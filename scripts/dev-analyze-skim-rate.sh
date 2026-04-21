#!/usr/bin/env bash
# ============================================================================
# dev-analyze-skim-rate.sh — skim-tell fire-rate analyzer (§2.5, T33)
# ----------------------------------------------------------------------------
# Reads rhetoric-guard event logs and computes avg_fires_per_session for the
# skim-tells category (VIBE_RG_SKIM_PATTERNS_ENABLED). Decision per §2.5:
#   avg < 0.5 per session → promote flag to default-on
#   avg ≥ 0.5             → keep flag-gated, re-evaluate 5.6.0
#
# Filters to events ≥2026-04-21 (post-5.4.3 hooks plugin-native fix) since
# pre-5.4.3 logs reflect hook noise (body never executed), not signal.
#
# Usage: dev-analyze-skim-rate.sh [log-dir]
# Default log dir: ${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe-vibe-framework}/rhetoric-guard
#
# Output: summary stats on stdout. Exit 0 (never fails — returns N/A if no data).
# ============================================================================

set -uo pipefail

LOG_DIR="${1:-${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/vibe-vibe-framework}/rhetoric-guard}"

echo "dev-analyze-skim-rate.sh"
echo "========================"
echo "Log dir: $LOG_DIR"
echo ""

if [[ ! -d "$LOG_DIR" ]]; then
    echo "RESULT: N/A (log directory does not exist — rhetoric-guard has not produced events)"
    echo ""
    echo "Decision: insufficient data for promote/keep call."
    echo "Action: continue dogfooding; re-run this script after more session accumulation."
    exit 0
fi

# Only events since 5.4.3 fix date (post-2026-04-21)
SINCE="2026-04-21T00:00:00Z"

# Count skim-tell fires + unique sessions using python3 (robust JSON parsing)
python3 <<PYEOF
import json
import os
import sys
from glob import glob
from datetime import datetime

log_dir = "$LOG_DIR"
since = "$SINCE"

skim_fires = 0
total_fires = 0
skim_sessions = set()
all_sessions = set()
errors = 0
categories_seen = set()

for path in sorted(glob(os.path.join(log_dir, "*.jsonl"))):
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    evt = json.loads(line)
                except json.JSONDecodeError:
                    errors += 1
                    continue

                ts = evt.get("ts") or evt.get("timestamp") or ""
                if ts < since:
                    continue

                sid = evt.get("session_id") or evt.get("sessionId") or ""
                category = evt.get("category") or evt.get("pattern_category") or "unknown"
                categories_seen.add(category)

                total_fires += 1
                if sid:
                    all_sessions.add(sid)

                if category == "skim-tells":
                    skim_fires += 1
                    if sid:
                        skim_sessions.add(sid)
    except Exception as e:
        print(f"WARN: could not read {path}: {e}", file=sys.stderr)

print(f"Total fires (all categories, post-{since[:10]}):  {total_fires}")
print(f"Skim-tell fires:                                  {skim_fires}")
print(f"Unique sessions (any fire):                       {len(all_sessions)}")
print(f"Unique sessions (skim-tell fire):                 {len(skim_sessions)}")
print(f"Categories seen:                                  {sorted(categories_seen)}")
print(f"JSON parse errors:                                {errors}")
print()

if len(all_sessions) == 0:
    print("RESULT: N/A (no sessions logged post-5.4.3 fix).")
    print("Decision: insufficient data.")
    print("Action: continue dogfooding; re-run after more accumulation.")
    sys.exit(0)

# avg_fires_per_session computed over ALL sessions that had any rhetoric-guard activity
avg = skim_fires / len(all_sessions)
print(f"avg_skim_fires_per_session: {avg:.3f}")
print()
print("Decision ladder (§2.5):")
print("  avg < 0.5 → promote flag to default-on in expected-state.json + rhetoric-guard.sh")
print("  avg ≥ 0.5 → keep flag-gated, re-evaluate 5.6.0")
print()

# CRITICAL: 0 skim fires is ambiguous — could mean low FP OR flag never enabled.
# Without explicit flag-state evidence, 0 fires should be classified as
# INSUFFICIENT DATA, not PROMOTE.

if skim_fires == 0:
    print("DECISION: INSUFFICIENT DATA.")
    print("  0 skim-tell fires is ambiguous: could mean the pattern rarely triggers")
    print("  false positives (promote evidence) OR the flag VIBE_RG_SKIM_PATTERNS_ENABLED=1")
    print("  was never set during the logged sessions (flag-gated off by default since 5.4.0).")
    print()
    print(f"  Categories seen in logs: {sorted(categories_seen)}")
    if categories_seen == {"unknown"}:
        print("  The log events do not include a 'category' field — rhetoric-guard.sh")
        print("  emits events without per-pattern category tagging. This analyzer")
        print("  cannot distinguish skim-tell fires from other category fires.")
    print()
    print("  Action: defer promotion decision. Options:")
    print("    (a) Extend rhetoric-guard.sh to emit 'category' field per fire,")
    print("        enable VIBE_RG_SKIM_PATTERNS_ENABLED=1 in settings env for a")
    print("        dogfood period (say, 2 weeks), re-run this analyzer.")
    print("    (b) Defer promotion decision to 5.6.0; flag remains gated off.")
elif avg < 0.5:
    print(f"DECISION: PROMOTE (avg {avg:.3f} < 0.5, {skim_fires} fires across {len(all_sessions)} sessions).")
    print("Next: execute T34 schema + hook default flip.")
else:
    print(f"DECISION: KEEP flag-gated (avg {avg:.3f} ≥ 0.5, {skim_fires} fires).")
    print("Next: document rationale + defer to 5.6.0.")

PYEOF

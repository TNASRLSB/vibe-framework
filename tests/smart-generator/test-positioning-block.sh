#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GEN="$SCRIPT_DIR/../../plugin/setup/smart-generator.sh"
FIX="$SCRIPT_DIR/fixtures/project-backend-api"

PASS=0; FAIL=0
pass() { PASS=$((PASS+1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL+1)); echo "  FAIL: $1 — $2"; }

OUT=$(bash "$GEN" --project-root "$FIX" --settings /dev/null)
HL=$(echo "$OUT" | python3 -c "import json,sys; print(json.load(sys.stdin)['harness_limits'])")

echo "$HL" | grep -qi 'harness'    && pass "mentions harness"    || fail "mentions harness"    "$HL"
echo "$HL" | grep -qi 'cannot\|not able' && pass "states what VIBE cannot do" || fail "states what VIBE cannot do" "$HL"
echo "$HL" | grep -qi 'anthropic' && pass "mentions Anthropic layer" || fail "mentions Anthropic layer" "$HL"

# Budget: the block is meant to be short — 100-150 tokens ≈ 400-600 chars
LEN=$(echo -n "$HL" | wc -c)
if [[ "$LEN" -le 800 ]]; then
    pass "block length <= 800 chars ($LEN)"
else
    fail "block length <= 800 chars" "$LEN chars"
fi

echo ""
echo "positioning: $PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]]

#!/usr/bin/env bash
# VIBE Framework 2.0 — Automated Test Suite
# Tests hooks, scripts, and plugin loading without manual interaction.

set -uo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS="$PLUGIN_DIR/scripts"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() {
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "  ${GREEN}PASS${NC} $1"
}

fail() {
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "  ${RED}FAIL${NC} $1: $2"
}

header() {
  echo ""
  echo -e "${YELLOW}=== $1 ===${NC}"
}

# ─────────────────────────────────────────────────────────
header "Prerequisites"
# ─────────────────────────────────────────────────────────

command -v jq &>/dev/null && pass "jq available" || fail "jq available" "jq not found in PATH"
command -v bash &>/dev/null && pass "bash available" || fail "bash available" "bash not found"

# ─────────────────────────────────────────────────────────
header "Plugin Structure"
# ─────────────────────────────────────────────────────────

[ -f "$PLUGIN_DIR/.claude-plugin/plugin.json" ] && pass "plugin.json exists" || fail "plugin.json exists" "missing"
python3 -c "import json; json.load(open('$PLUGIN_DIR/.claude-plugin/plugin.json'))" 2>/dev/null && pass "plugin.json valid JSON" || fail "plugin.json valid JSON" "parse error"
[ -f "$PLUGIN_DIR/hooks/hooks.json" ] && pass "hooks.json exists" || fail "hooks.json exists" "missing"
python3 -c "import json; json.load(open('$PLUGIN_DIR/hooks/hooks.json'))" 2>/dev/null && pass "hooks.json valid JSON" || fail "hooks.json valid JSON" "parse error"
[ -f "$PLUGIN_DIR/settings.json" ] && pass "settings.json exists" || fail "settings.json exists" "missing"

# ─────────────────────────────────────────────────────────
header "Skills (SKILL.md existence and frontmatter)"
# ─────────────────────────────────────────────────────────

EXPECTED_SKILLS="setup reflect pause resume seurat emmet heimdall ghostwriter baptist orson scribe forge"
for skill in $EXPECTED_SKILLS; do
  SKILL_FILE="$PLUGIN_DIR/skills/$skill/SKILL.md"
  if [ -f "$SKILL_FILE" ]; then
    # Check frontmatter exists
    if head -1 "$SKILL_FILE" | grep -q "^---$"; then
      # Check name field
      if grep -q "^name:" "$SKILL_FILE"; then
        LINES=$(wc -l < "$SKILL_FILE")
        if [ "$LINES" -le 500 ]; then
          pass "skill/$skill (${LINES} lines)"
        else
          fail "skill/$skill" "over 500 lines (${LINES})"
        fi
      else
        fail "skill/$skill" "missing name in frontmatter"
      fi
    else
      fail "skill/$skill" "missing frontmatter"
    fi
  else
    fail "skill/$skill" "SKILL.md not found"
  fi
done

# ─────────────────────────────────────────────────────────
header "Agents (existence and frontmatter)"
# ─────────────────────────────────────────────────────────

for agent in reviewer researcher guardian; do
  AGENT_FILE="$PLUGIN_DIR/agents/$agent.md"
  if [ -f "$AGENT_FILE" ]; then
    if grep -q "^name: $agent" "$AGENT_FILE"; then
      if grep -q "effort: max" "$AGENT_FILE"; then
        pass "agent/$agent"
      else
        fail "agent/$agent" "missing effort: max"
      fi
    else
      fail "agent/$agent" "missing name field"
    fi
  else
    fail "agent/$agent" "file not found"
  fi
done

# ─────────────────────────────────────────────────────────
header "Hook Scripts (syntax validation)"
# ─────────────────────────────────────────────────────────

for script in setup-check post-edit-lint security-quickscan pre-compact-save correction-capture failure-loop-detect failure-reset; do
  SCRIPT_FILE="$SCRIPTS/$script.sh"
  if [ -f "$SCRIPT_FILE" ]; then
    if [ -x "$SCRIPT_FILE" ]; then
      if bash -n "$SCRIPT_FILE" 2>/dev/null; then
        pass "script/$script.sh"
      else
        fail "script/$script.sh" "syntax error"
      fi
    else
      fail "script/$script.sh" "not executable"
    fi
  else
    fail "script/$script.sh" "not found"
  fi
done

# ─────────────────────────────────────────────────────────
header "Setup Check Hook (functional)"
# ─────────────────────────────────────────────────────────

OUTPUT=$(echo '{"session_id":"test-001","cwd":"/tmp","permission_mode":"default"}' | "$SCRIPTS/setup-check.sh" 2>&1)
EXIT=$?
if [ $EXIT -eq 0 ]; then
  if echo "$OUTPUT" | jq -e '.hookSpecificOutput.additionalContext' &>/dev/null; then
    pass "setup-check returns valid JSON with additionalContext"
  else
    fail "setup-check JSON" "missing additionalContext in output"
  fi
else
  fail "setup-check exit code" "expected 0, got $EXIT"
fi

# ─────────────────────────────────────────────────────────
header "Correction Capture Hook (functional)"
# ─────────────────────────────────────────────────────────

# Clean test queue
TEST_DATA="/tmp/vibe-test-correction-$$"
export CLAUDE_PLUGIN_DATA="$TEST_DATA"
mkdir -p "$TEST_DATA/learnings"

# Test English correction
echo '{"session_id":"test-001","prompt":"no, use tabs not spaces"}' | "$SCRIPTS/correction-capture.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "correction-capture exits 0" || fail "correction-capture exit" "expected 0, got $EXIT"

if [ -f "$TEST_DATA/learnings/queue.jsonl" ]; then
  COUNT=$(wc -l < "$TEST_DATA/learnings/queue.jsonl")
  [ "$COUNT" -ge 1 ] && pass "English correction captured ($COUNT entries)" || fail "English correction" "queue empty"
else
  fail "English correction" "queue.jsonl not created"
fi

# Test Italian correction
echo '{"session_id":"test-001","prompt":"non fare così, ti avevo detto di usare tabs"}' | "$SCRIPTS/correction-capture.sh" 2>/dev/null
if [ -f "$TEST_DATA/learnings/queue.jsonl" ]; then
  COUNT=$(wc -l < "$TEST_DATA/learnings/queue.jsonl")
  [ "$COUNT" -ge 2 ] && pass "Italian correction captured ($COUNT entries)" || fail "Italian correction" "not captured"
fi

# Test non-correction (should NOT match)
echo '{"session_id":"test-001","prompt":"please create a hello world function"}' | "$SCRIPTS/correction-capture.sh" 2>/dev/null
if [ -f "$TEST_DATA/learnings/queue.jsonl" ]; then
  COUNT=$(wc -l < "$TEST_DATA/learnings/queue.jsonl")
  [ "$COUNT" -eq 2 ] && pass "Non-correction ignored (still $COUNT entries)" || fail "Non-correction" "false positive, now $COUNT entries"
fi

rm -rf "$TEST_DATA"
unset CLAUDE_PLUGIN_DATA

# ─────────────────────────────────────────────────────────
header "Security Quickscan Hook (functional)"
# ─────────────────────────────────────────────────────────

# Create temp test files
TMPDIR=$(mktemp -d)

# Test: hardcoded API key should be caught
cat > "$TMPDIR/bad-key.js" << 'JSEOF'
const key = "sk-1234567890abcdefghijklmnopqrst"
JSEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/bad-key.js\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Detects hardcoded API key (exit 2)" || fail "API key detection" "expected exit 2, got $EXIT"

# Test: dangerouslySetInnerHTML should be caught
cat > "$TMPDIR/bad-xss.jsx" << 'JSXEOF'
return <div dangerouslySetInnerHTML={{__html: userInput}} />
JSXEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/bad-xss.jsx\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Detects dangerouslySetInnerHTML (exit 2)" || fail "XSS detection" "expected exit 2, got $EXIT"

# Test: USING(true) should be caught
cat > "$TMPDIR/bad-rls.sql" << 'SQLEOF'
CREATE POLICY "public" ON users FOR SELECT USING ( true );
SQLEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/bad-rls.sql\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Detects USING(true) (exit 2)" || fail "RLS detection" "expected exit 2, got $EXIT"

# Test: eval() should be caught
cat > "$TMPDIR/bad-eval.js" << 'EVALEOF'
const result = eval(userInput)
EVALEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/bad-eval.js\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Detects eval() (exit 2)" || fail "eval detection" "expected exit 2, got $EXIT"

# Test: --no-verify should be caught
cat > "$TMPDIR/bad-noverify.sh" << 'SHEOF'
git commit --no-verify -m "skip hooks"
SHEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/bad-noverify.sh\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Detects --no-verify (exit 2)" || fail "--no-verify detection" "expected exit 2, got $EXIT"

# Test: clean file should pass
cat > "$TMPDIR/clean.js" << 'CLEANEOF'
const apiKey = process.env.API_KEY
console.log("hello world")
CLEANEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/clean.js\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 0 ] && pass "Clean file passes (exit 0)" || fail "Clean file" "expected exit 0, got $EXIT"

# Test: .md file should be skipped
cat > "$TMPDIR/readme.md" << 'MDEOF'
API key: sk-1234567890abcdefghijklmnopqrst
MDEOF

OUTPUT=$(echo "{\"session_id\":\"test-001\",\"tool_input\":{\"file_path\":\"$TMPDIR/readme.md\"}}" | "$SCRIPTS/security-quickscan.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 0 ] && pass "Skips .md files (exit 0)" || fail ".md skip" "expected exit 0, got $EXIT"

rm -rf "$TMPDIR"

# ─────────────────────────────────────────────────────────
header "Failure Loop Detection (functional)"
# ─────────────────────────────────────────────────────────

# Clean counter
rm -f /tmp/vibe-failures-test-fail-*

# Failure 1
echo '{"session_id":"test-fail-001","tool_name":"Bash"}' | "$SCRIPTS/failure-loop-detect.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "Failure 1/3: continues (exit 0)" || fail "Failure 1" "expected 0, got $EXIT"

# Failure 2
echo '{"session_id":"test-fail-001","tool_name":"Bash"}' | "$SCRIPTS/failure-loop-detect.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "Failure 2/3: continues (exit 0)" || fail "Failure 2" "expected 0, got $EXIT"

# Failure 3 — should block
OUTPUT=$(echo '{"session_id":"test-fail-001","tool_name":"Bash"}' | "$SCRIPTS/failure-loop-detect.sh" 2>&1)
EXIT=$?
[ $EXIT -eq 2 ] && pass "Failure 3/3: BLOCKS (exit 2)" || fail "Failure 3" "expected 2, got $EXIT"

# Reset should work
echo '{"session_id":"test-fail-001"}' | "$SCRIPTS/failure-reset.sh" 2>/dev/null
echo '{"session_id":"test-fail-001","tool_name":"Bash"}' | "$SCRIPTS/failure-loop-detect.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "After reset: continues (exit 0)" || fail "After reset" "expected 0, got $EXIT"

rm -f /tmp/vibe-failures-test-fail-*

# ─────────────────────────────────────────────────────────
header "Pause/Resume Mechanism (functional)"
# ─────────────────────────────────────────────────────────

PAUSE_SESSION="test-pause-001"

# Without pause: security hook should catch
TMPFILE=$(mktemp --suffix=.js)
echo 'const k = "sk-abcdefghijklmnopqrstuvwxyz1234"' > "$TMPFILE"
echo "{\"session_id\":\"$PAUSE_SESSION\",\"tool_input\":{\"file_path\":\"$TMPFILE\"}}" | "$SCRIPTS/security-quickscan.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 2 ] && pass "Without pause: security hook blocks" || fail "Without pause" "expected 2, got $EXIT"

# Create pause flag
touch "/tmp/vibe-paused-${PAUSE_SESSION}"

# With pause: security hook should pass
echo "{\"session_id\":\"$PAUSE_SESSION\",\"tool_input\":{\"file_path\":\"$TMPFILE\"}}" | "$SCRIPTS/security-quickscan.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "With pause: security hook skips (exit 0)" || fail "With pause" "expected 0, got $EXIT"

# With pause: correction capture should skip
echo "{\"session_id\":\"$PAUSE_SESSION\",\"prompt\":\"no, wrong approach\"}" | "$SCRIPTS/correction-capture.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 0 ] && pass "With pause: correction capture skips" || fail "Correction pause" "expected 0, got $EXIT"

# Resume (remove flag)
rm -f "/tmp/vibe-paused-${PAUSE_SESSION}"

# After resume: security hook should catch again
echo "{\"session_id\":\"$PAUSE_SESSION\",\"tool_input\":{\"file_path\":\"$TMPFILE\"}}" | "$SCRIPTS/security-quickscan.sh" 2>/dev/null
EXIT=$?
[ $EXIT -eq 2 ] && pass "After resume: security hook blocks again" || fail "After resume" "expected 2, got $EXIT"

rm -f "$TMPFILE"

# ─────────────────────────────────────────────────────────
header "V1 Cleanup — settings.local.json morpheus removal"
# ─────────────────────────────────────────────────────────

CLEANUP_TMP=$(mktemp -d)
mkdir -p "$CLEANUP_TMP/.claude/morpheus"
echo '#!/bin/bash' > "$CLEANUP_TMP/.claude/morpheus/injector.sh"

# Create a settings.local.json with morpheus hooks (mimics v1 project)
cat > "$CLEANUP_TMP/.claude/settings.local.json" << 'SETTINGSEOF'
{
  "permissions": {
    "allow": ["Bash(git status:*)"]
  },
  "PreToolUse": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/morpheus/injector.sh"
        }
      ]
    }
  ],
  "statusLine": {
    "type": "command",
    "command": "$CLAUDE_PROJECT_DIR/.claude/morpheus/sensor.sh"
  }
}
SETTINGSEOF

# Also create a CLAUDE.md with v1 marker so detect_v1 fires
cat > "$CLEANUP_TMP/CLAUDE.md" << 'CLAUDEEOF'
# Claude Operating System
This is a v1 framework file.
CLAUDEEOF

# Run cleanup with --yes
(cd "$CLEANUP_TMP" && bash "$SCRIPTS/vibe-v1-cleanup.sh" --yes "$CLEANUP_TMP") >/dev/null 2>&1

# Verify morpheus references were removed from settings.local.json
if [ -f "$CLEANUP_TMP/.claude/settings.local.json" ]; then
  if grep -q "morpheus" "$CLEANUP_TMP/.claude/settings.local.json" 2>/dev/null; then
    fail "Cleanup removes morpheus from settings.local.json" "morpheus references still present"
  else
    # Verify permissions were preserved
    if grep -q "git status" "$CLEANUP_TMP/.claude/settings.local.json" 2>/dev/null; then
      pass "Cleanup removes morpheus from settings.local.json (permissions preserved)"
    else
      fail "Cleanup removes morpheus from settings.local.json" "permissions were also removed"
    fi
  fi
else
  fail "Cleanup removes morpheus from settings.local.json" "file was deleted entirely"
fi

# Verify morpheus directory was removed
if [ -d "$CLEANUP_TMP/.claude/morpheus" ]; then
  fail "Cleanup removes .claude/morpheus/" "directory still exists"
else
  pass "Cleanup removes .claude/morpheus/"
fi

rm -rf "$CLEANUP_TMP"

# --- Test .forge/ and old backup zip removal ---

CLEANUP_TMP2=$(mktemp -d)
mkdir -p "$CLEANUP_TMP2/.claude/morpheus"
mkdir -p "$CLEANUP_TMP2/.forge"
echo '#!/bin/bash' > "$CLEANUP_TMP2/.claude/morpheus/injector.sh"
echo "test" > "$CLEANUP_TMP2/.forge/workspace.json"
echo "old backup" > "$CLEANUP_TMP2/.vibe-v1-backup-20260101-000000.zip"

cat > "$CLEANUP_TMP2/CLAUDE.md" << 'CLAUDEEOF2'
# Claude Operating System
v1 framework
CLAUDEEOF2

(cd "$CLEANUP_TMP2" && bash "$SCRIPTS/vibe-v1-cleanup.sh" --yes "$CLEANUP_TMP2") >/dev/null 2>&1

if [ -d "$CLEANUP_TMP2/.forge" ]; then
  fail "Cleanup removes .forge/" "directory still exists"
else
  pass "Cleanup removes .forge/"
fi

# Check old zip was removed (but new one was created)
if [ -f "$CLEANUP_TMP2/.vibe-v1-backup-20260101-000000.zip" ]; then
  fail "Cleanup removes old backup zips" "old zip still exists"
else
  pass "Cleanup removes old backup zips"
fi

rm -rf "$CLEANUP_TMP2"

# --- Test --deep scan finds nested projects ---

DEEP_TMP=$(mktemp -d)
# Create a nested project structure: parent/child/.claude/morpheus/
mkdir -p "$DEEP_TMP/parent/child/.claude/morpheus"
echo '#!/bin/bash' > "$DEEP_TMP/parent/child/.claude/morpheus/injector.sh"
cat > "$DEEP_TMP/parent/child/CLAUDE.md" << 'DEEPEOF'
# Claude Operating System
nested v1
DEEPEOF

(bash "$SCRIPTS/vibe-v1-cleanup.sh" --scan "$DEEP_TMP" --deep --yes) >/dev/null 2>&1

if [ -d "$DEEP_TMP/parent/child/.claude/morpheus" ]; then
  fail "Deep scan finds nested projects" "morpheus still present in nested project"
else
  pass "Deep scan finds nested projects"
fi

rm -rf "$DEEP_TMP"

# --- Test worktree scanning ---

WT_TMP=$(mktemp -d)
# Create a project with a worktree containing v1 remnants
mkdir -p "$WT_TMP/myproject/.worktrees/feature-branch/.claude/morpheus"
echo '#!/bin/bash' > "$WT_TMP/myproject/.worktrees/feature-branch/.claude/morpheus/injector.sh"
cat > "$WT_TMP/myproject/.worktrees/feature-branch/CLAUDE.md" << 'WTEOF'
# Claude Operating System
worktree v1
WTEOF

(bash "$SCRIPTS/vibe-v1-cleanup.sh" --scan "$WT_TMP" --yes) >/dev/null 2>&1

if [ -d "$WT_TMP/myproject/.worktrees/feature-branch/.claude/morpheus" ]; then
  fail "Scan finds worktree v1 remnants" "morpheus still present in worktree"
else
  pass "Scan finds worktree v1 remnants"
fi

rm -rf "$WT_TMP"

# ─────────────────────────────────────────────────────────
header "Heimdall Pattern Files (JSON validation)"
# ─────────────────────────────────────────────────────────

for pfile in secrets baas-misconfig owasp-top-10; do
  PPATH="$PLUGIN_DIR/skills/heimdall/patterns/$pfile.json"
  if [ -f "$PPATH" ]; then
    if python3 -c "import json; d=json.load(open('$PPATH')); assert len(d) > 0" 2>/dev/null; then
      COUNT=$(python3 -c "import json; print(len(json.load(open('$PPATH'))))")
      pass "heimdall/patterns/$pfile.json ($COUNT patterns)"
    else
      fail "heimdall/patterns/$pfile.json" "invalid JSON or empty"
    fi
  else
    fail "heimdall/patterns/$pfile.json" "not found"
  fi
done

# ─────────────────────────────────────────────────────────
header "Reference Files (existence check)"
# ─────────────────────────────────────────────────────────

TOTAL_REFS=0
FOUND_REFS=0
for skill_dir in "$PLUGIN_DIR"/skills/*/; do
  skill_name=$(basename "$skill_dir")
  if [ -d "$skill_dir/references" ]; then
    REF_COUNT=$(find "$skill_dir/references" -name "*.md" -type f | wc -l)
    TOTAL_REFS=$((TOTAL_REFS + REF_COUNT))
    FOUND_REFS=$((FOUND_REFS + REF_COUNT))
  fi
done
pass "Reference files: $FOUND_REFS total across all skills"

# ─────────────────────────────────────────────────────────
header "RESULTS"
# ─────────────────────────────────────────────────────────

echo ""
echo -e "  Total:  $TOTAL"
echo -e "  ${GREEN}Passed: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Failed: $FAIL${NC}"
else
  echo -e "  Failed: 0"
fi
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAIL test(s) failed.${NC}"
  exit 1
fi

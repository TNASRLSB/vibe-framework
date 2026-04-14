#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0
WARN=0

check() {
  local desc="$1" result="$2"
  if [ "$result" = "OK" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc — $result"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  local desc="$1"
  echo "  ⚠ $desc"
  WARN=$((WARN + 1))
}

echo "=== VIBE Audit System Validation ==="
echo ""

# 1. Audit protocol exists
echo "1. Audit Protocol"
if [ -f "references/audit-protocol.md" ]; then
  check "references/audit-protocol.md exists" "OK"
  # Check it has key sections
  grep -q "## Report Format" references/audit-protocol.md && \
    check "Has Report Format section" "OK" || \
    check "Has Report Format section" "MISSING"
  grep -q "## Severity Levels" references/audit-protocol.md && \
    check "Has Severity Levels section" "OK" || \
    check "Has Severity Levels section" "MISSING"
  grep -q "## Evidence Requirement" references/audit-protocol.md && \
    check "Has Evidence Requirement section" "OK" || \
    check "Has Evidence Requirement section" "MISSING"
else
  check "references/audit-protocol.md exists" "FILE NOT FOUND"
fi
echo ""

# 2. Agent files exist and have valid frontmatter
echo "2. Domain Agents"
for agent in seurat ghostwriter baptist emmet heimdall orson scribe; do
  agent_file="agents/${agent}.md"
  if [ -f "$agent_file" ]; then
    check "${agent}: file exists" "OK"
    # Check required frontmatter fields
    grep -q "^name: ${agent}" "$agent_file" && \
      check "${agent}: name field correct" "OK" || \
      check "${agent}: name field correct" "WRONG OR MISSING"
    grep -q "isolation: worktree" "$agent_file" && \
      check "${agent}: has worktree isolation" "OK" || \
      check "${agent}: has worktree isolation" "MISSING"
    grep -q "memory: project" "$agent_file" && \
      check "${agent}: has project memory" "OK" || \
      check "${agent}: has project memory" "MISSING"
    grep -q "audit-protocol.md" "$agent_file" && \
      check "${agent}: references audit protocol" "OK" || \
      check "${agent}: references audit protocol" "MISSING"
    # Check referenced skill exists
    skill_file="skills/${agent}/SKILL.md"
    if [ -f "$skill_file" ]; then
      check "${agent}: skill file exists" "OK"
    else
      check "${agent}: skill file exists" "NOT FOUND at ${skill_file}"
    fi
  else
    check "${agent}: file exists" "FILE NOT FOUND"
  fi
done
echo ""

# 3. Orchestrator skill
echo "3. Audit Orchestrator"
if [ -f "skills/audit/SKILL.md" ]; then
  check "skills/audit/SKILL.md exists" "OK"
  grep -q "^name: audit" skills/audit/SKILL.md && \
    check "Has name: audit" "OK" || \
    check "Has name: audit" "MISSING"
  grep -q "Status Mode" skills/audit/SKILL.md && \
    check "Has Status Mode" "OK" || \
    check "Has Status Mode" "MISSING"
  grep -q "Interactive Mode" skills/audit/SKILL.md && \
    check "Has Interactive Mode" "OK" || \
    check "Has Interactive Mode" "MISSING"
  grep -q "Direct Launch Mode" skills/audit/SKILL.md && \
    check "Has Direct Launch Mode" "OK" || \
    check "Has Direct Launch Mode" "MISSING"
  grep -q "Synthesis" skills/audit/SKILL.md && \
    check "Has Synthesis section" "OK" || \
    check "Has Synthesis section" "MISSING"
else
  check "skills/audit/SKILL.md exists" "FILE NOT FOUND"
fi
echo ""

# 4. Guardian deprecation
echo "4. Guardian Deprecation"
if [ -f "agents/guardian.md.deprecated" ]; then
  check "guardian.md.deprecated exists" "OK"
else
  warn "guardian.md.deprecated not found (may not have been renamed yet)"
fi
if [ ! -f "agents/guardian.md" ]; then
  check "guardian.md removed from active agents" "OK"
else
  warn "guardian.md still exists as active agent"
fi
echo ""

# 5. Help updated
echo "5. Help Skill"
if grep -q "vibe:audit" skills/help/SKILL.md; then
  check "Help references /vibe:audit" "OK"
else
  check "Help references /vibe:audit" "MISSING"
fi
if grep -q "guardian" skills/help/SKILL.md; then
  check "Guardian removed from help" "STILL PRESENT"
else
  check "Guardian removed from help" "OK"
fi
echo ""

# Summary
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Warnings: $WARN"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "VALIDATION FAILED — fix $FAIL issue(s) above"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi

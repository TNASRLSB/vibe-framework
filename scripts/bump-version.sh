#!/usr/bin/env bash
# ============================================================================
# bump-version.sh — atomic VIBE Framework version bump
# ============================================================================
#
# Rationale: historically, VIBE version bumps have produced drift windows
# because the version number lives in 4+ places (plugin.json, CHANGELOG,
# README "What's New", marketplace.json counts, vibe:help counts). Bumps
# typically updated plugin.json + CHANGELOG in one commit, then shipped
# "docs: sync READMEs to X state" as reactive follow-up commits after
# someone noticed the stale references. Every release produced this
# pattern. This script exists to close the drift window by updating all
# version-coupled files in a single atomic operation.
#
# Usage:
#   scripts/bump-version.sh <NEW_VERSION> [--dry-run] [--force]
#   scripts/bump-version.sh --help
#
# What it does:
#   1. Validates NEW_VERSION is semver and greater than current.
#   2. Counts skills/agents/hooks from the filesystem (source of truth).
#   3. Updates plugin/.claude-plugin/plugin.json version field.
#   4. Updates .claude-plugin/marketplace.json plugin description counts.
#   5. Prepends a CHANGELOG skeleton for the new version (idempotent —
#      skipped if a section for this version already exists).
#   6. Prepends a "What's New in X.Y" skeleton to plugin/README.md
#      (idempotent — skipped if a section for this version already exists).
#   7. Verifies plugin/skills/help/SKILL.md skill/agent/hook counts match
#      the filesystem. Warns on mismatch (doesn't auto-fix — help text
#      structure varies and manual review is safer).
#   8. Greps for hardcoded old-version strings in plugin/ (e.g. references
#      to prior version filenames or markers). Warns on find.
#   9. Stages all changed files via git add.
#
# What it does NOT do:
#   - Commit. The human writes the CHANGELOG + README prose in the
#     pre-populated skeletons, reviews the diff, and makes the final
#     release commit. This script is release plumbing, not release policy.
#   - Push. Same rationale.
#   - Rewrite help skill content. Too structural for safe auto-rewrite.
#
# Options:
#   --dry-run    Show every action as "would: ..." without writing files.
#                `git add` is also skipped. Final diff preview is printed.
#   --force      Skip the "working tree clean" precheck. Use only if you
#                have staged changes you want to bundle into the release.
#   -h, --help   This message.
#
# Exit codes:
#   0  success
#   1  drift warnings emitted (script ran but something needs human review)
#   2  argument / validation error
#   3  git working tree not clean (without --force)
#   4  read/write failure on a versioned file
# ============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_JSON="$REPO_ROOT/plugin/.claude-plugin/plugin.json"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
CHANGELOG="$REPO_ROOT/plugin/CHANGELOG.md"
README="$REPO_ROOT/plugin/README.md"
HELP_SKILL="$REPO_ROOT/plugin/skills/help/SKILL.md"
HOOKS_JSON="$REPO_ROOT/plugin/hooks/hooks.json"
SKILLS_DIR="$REPO_ROOT/plugin/skills"
AGENTS_DIR="$REPO_ROOT/plugin/agents"

DRY_RUN=false
FORCE=false
NEW_VERSION=""
WARNINGS=0

# --- Colors ----------------------------------------------------------------
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  BLUE='\033[0;34m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; DIM=''; NC=''
fi

info()  { printf '  %b %s\n' "${BLUE}ℹ${NC}" "$*"; }
ok()    { printf '  %b %s\n' "${GREEN}✓${NC}" "$*"; }
warn()  { printf '  %b %s\n' "${YELLOW}⚠${NC}" "$*"; WARNINGS=$((WARNINGS+1)); }
err()   { printf '  %b %s\n' "${RED}✗${NC}" "$*" >&2; }
step()  { printf '\n%b%s%b\n' "${BOLD}" "$*" "${NC}"; }
would() { printf '  %bwould:%b %s\n' "${DIM}" "${NC}" "$*"; }

usage() {
  sed -n '/^# Usage:/,/^# =====/{/^# =====/d;s/^# \?//;p}' "$0"
  exit 0
}

# --- Arg parsing -----------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --force)   FORCE=true; shift ;;
    -h|--help) usage ;;
    -*)        err "Unknown flag: $1"; exit 2 ;;
    *)
      if [[ -z "$NEW_VERSION" ]]; then
        NEW_VERSION="$1"; shift
      else
        err "Unexpected argument: $1"; exit 2
      fi
      ;;
  esac
done

[[ -n "$NEW_VERSION" ]] || { err "NEW_VERSION required (see --help)"; exit 2; }

# --- Validate semver -------------------------------------------------------
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  err "NEW_VERSION must match X.Y.Z (got: $NEW_VERSION)"
  exit 2
fi

# --- Read current version --------------------------------------------------
CURRENT_VERSION=$(python3 -c "
import json
try:
    print(json.load(open('$PLUGIN_JSON'))['version'])
except Exception as e:
    print('', file=__import__('sys').stderr)
    raise
" 2>/dev/null) || {
  err "Could not read current version from $PLUGIN_JSON"
  exit 4
}

[[ -n "$CURRENT_VERSION" ]] || { err "plugin.json version field empty"; exit 4; }

# --- Compare semver --------------------------------------------------------
# Returns 0 if $1 > $2, 1 if $1 <= $2.
compare_semver_gt() {
  local a_major a_minor a_patch b_major b_minor b_patch
  IFS=. read -r a_major a_minor a_patch <<< "$1"
  IFS=. read -r b_major b_minor b_patch <<< "$2"
  if (( a_major > b_major )); then return 0; fi
  if (( a_major < b_major )); then return 1; fi
  if (( a_minor > b_minor )); then return 0; fi
  if (( a_minor < b_minor )); then return 1; fi
  if (( a_patch > b_patch )); then return 0; fi
  return 1
}

if ! compare_semver_gt "$NEW_VERSION" "$CURRENT_VERSION"; then
  err "NEW_VERSION ($NEW_VERSION) must be strictly greater than CURRENT ($CURRENT_VERSION)"
  exit 2
fi

# --- Preflight: working tree clean ----------------------------------------
if [[ "$FORCE" != "true" ]]; then
  if ! git -C "$REPO_ROOT" diff --quiet 2>/dev/null || ! git -C "$REPO_ROOT" diff --cached --quiet 2>/dev/null; then
    err "Working tree not clean. Commit or stash first, or use --force to proceed anyway."
    exit 3
  fi
fi

step "VIBE version bump: $CURRENT_VERSION → $NEW_VERSION"
if $DRY_RUN; then
  printf '  %b DRY RUN — no files will be written, no git add\n' "${YELLOW}⚠${NC}"
fi

# ── Step 1: Count skills/agents/hooks from filesystem ─────────────────────
step "[1/7] Counting skills/agents/hooks from filesystem"

SKILL_COUNT=$(ls -1 "$SKILLS_DIR" 2>/dev/null | grep -v '^_' | wc -l | tr -d ' ')
AGENT_COUNT=$(ls -1 "$AGENTS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
HOOK_COUNT=$(python3 -c "
import json
h = json.load(open('$HOOKS_JSON'))['hooks']
c = 0
for event_name, entries in h.items():
    for entry in entries:
        c += len(entry.get('hooks', []))
print(c)
" 2>/dev/null) || HOOK_COUNT=0

info "skills: $SKILL_COUNT"
info "agents: $AGENT_COUNT"
info "hooks:  $HOOK_COUNT"

# ── Step 2: Update plugin.json version ────────────────────────────────────
step "[2/7] Updating plugin.json version"

if $DRY_RUN; then
  would "set plugin.json version: $CURRENT_VERSION → $NEW_VERSION"
else
  python3 -c "
import json
p = '$PLUGIN_JSON'
d = json.load(open(p))
d['version'] = '$NEW_VERSION'
with open(p, 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')
" || { err "Failed to update plugin.json"; exit 4; }
  ok "plugin.json: version = $NEW_VERSION"
fi

# ── Step 3: Update marketplace.json counts ────────────────────────────────
step "[3/7] Updating marketplace.json description counts"

EXPECTED_DESC="$SKILL_COUNT skills, $AGENT_COUNT agents, $HOOK_COUNT hooks"

# Find the existing count string (any three N/M/K values).
OLD_DESC=$(grep -oE '[0-9]+ skills, [0-9]+ agents, [0-9]+ hooks' "$MARKETPLACE_JSON" | head -1 || true)

if [[ -z "$OLD_DESC" ]]; then
  warn "marketplace.json: no 'N skills, M agents, K hooks' pattern found — skipping auto-update (consider manual edit)"
elif [[ "$OLD_DESC" == "$EXPECTED_DESC" ]]; then
  ok "marketplace.json: counts already current ($OLD_DESC)"
else
  if $DRY_RUN; then
    would "replace '$OLD_DESC' → '$EXPECTED_DESC' in marketplace.json"
  else
    python3 -c "
import re
p = '$MARKETPLACE_JSON'
with open(p) as f:
    content = f.read()
old = '$OLD_DESC'
new = '$EXPECTED_DESC'
content = content.replace(old, new, 1)
with open(p, 'w') as f:
    f.write(content)
" || { err "Failed to update marketplace.json"; exit 4; }
    ok "marketplace.json: '$OLD_DESC' → '$EXPECTED_DESC'"
  fi
fi

# ── Step 4: Prepend CHANGELOG skeleton (idempotent) ───────────────────────
step "[4/7] CHANGELOG skeleton"

TODAY=$(date -u +%Y-%m-%d)
CHANGELOG_HEADING="## $NEW_VERSION — $TODAY"

if grep -qF "## $NEW_VERSION —" "$CHANGELOG" 2>/dev/null; then
  ok "CHANGELOG already has a section for $NEW_VERSION — skipped"
else
  SKELETON=$(cat <<SKEL
$CHANGELOG_HEADING

### Added
- (fill in new features)

### Changed
- (fill in changes to existing behavior)

### Fixed
- (fill in bug fixes)

### Migration from $CURRENT_VERSION
- (fill in upgrade notes if any)

SKEL
)
  if $DRY_RUN; then
    would "prepend CHANGELOG skeleton for $NEW_VERSION after the '# Changelog' header"
  else
    python3 -c "
import sys
p = '$CHANGELOG'
with open(p) as f:
    content = f.read()
skel = '''$SKELETON'''
# Insert after the '# Changelog' line
lines = content.split('\n', 1)
if lines[0].strip() == '# Changelog':
    new_content = lines[0] + '\n\n' + skel + '\n' + lines[1].lstrip('\n')
else:
    # Defensive: just prepend
    new_content = skel + '\n' + content
with open(p, 'w') as f:
    f.write(new_content)
" || { err "Failed to update CHANGELOG"; exit 4; }
    ok "CHANGELOG: prepended skeleton for $NEW_VERSION — edit with real content before commit"
  fi
fi

# ── Step 5: Prepend README "What's New" skeleton (idempotent) ─────────────
step "[5/7] README 'What's New' skeleton"

# Use just major.minor for the heading (patch releases don't get a new
# heading — they're appended under the current minor's section).
NEW_MAJOR_MINOR="${NEW_VERSION%.*}"

if grep -qF "## What's New in $NEW_MAJOR_MINOR" "$README" 2>/dev/null; then
  ok "README already has 'What's New in $NEW_MAJOR_MINOR' — skipped (append your prose under it manually)"
else
  README_SKELETON=$(cat <<RDM
## What's New in $NEW_MAJOR_MINOR

**(fill in new features here — one bold-leading paragraph per major change, matching the style of the sections below.)**

RDM
)
  if $DRY_RUN; then
    would "prepend 'What's New in $NEW_MAJOR_MINOR' skeleton above the current top 'What's New' section in README"
  else
    python3 -c "
import re
p = '$README'
with open(p) as f:
    content = f.read()
skel = '''$README_SKELETON'''
# Insert skeleton right above the first existing 'What's New in' heading
m = re.search(r'^## What\'s New in ', content, re.MULTILINE)
if m is None:
    # No existing section — prepend after the first H1
    new_content = re.sub(r'(\n## [^\n]+\n)', r'\n' + skel + r'\1', content, count=1)
else:
    insert_at = m.start()
    new_content = content[:insert_at] + skel + '\n' + content[insert_at:]
with open(p, 'w') as f:
    f.write(new_content)
" || { err "Failed to update README"; exit 4; }
    ok "README: prepended 'What's New in $NEW_MAJOR_MINOR' skeleton — edit with real content before commit"
  fi
fi

# ── Step 6: Verify help skill counts ──────────────────────────────────────
step "[6/7] Verifying vibe:help skill counts"

HELP_HOOK_COUNT=$(grep -oE '[0-9]+ handlers' "$HELP_SKILL" | head -1 | grep -oE '[0-9]+' || true)
if [[ -n "$HELP_HOOK_COUNT" ]]; then
  if [[ "$HELP_HOOK_COUNT" == "$HOOK_COUNT" ]]; then
    ok "vibe:help: hook count matches ($HOOK_COUNT)"
  else
    warn "vibe:help: hook count mismatch (help says $HELP_HOOK_COUNT, reality $HOOK_COUNT) — update plugin/skills/help/SKILL.md manually"
  fi
else
  warn "vibe:help: could not find 'N handlers' pattern — skipping hook count check"
fi

# Check that every agent has a row in the help agents table.
MISSING_AGENTS=()
for agent_md in "$AGENTS_DIR"/*.md; do
  [[ -f "$agent_md" ]] || continue
  agent_name=$(basename "$agent_md" .md)
  if ! grep -qE "\*\*$agent_name\*\*" "$HELP_SKILL" 2>/dev/null; then
    MISSING_AGENTS+=("$agent_name")
  fi
done

if [[ ${#MISSING_AGENTS[@]} -eq 0 ]]; then
  ok "vibe:help: all $AGENT_COUNT agents present in agents table"
else
  warn "vibe:help: agents missing from help table: ${MISSING_AGENTS[*]} — add rows to plugin/skills/help/SKILL.md manually"
fi

# ── Step 7: Grep for hardcoded old-version strings ────────────────────────
step "[7/7] Scanning for hardcoded old-version strings"

# Check for patterns like "vibe-5.0-configured" or other version-embedded
# filenames that might still reference the previous version.
OLD_MAJOR_MINOR="${CURRENT_VERSION%.*}"
STALE_HITS=$(grep -rEn "vibe-${OLD_MAJOR_MINOR}-configured" "$REPO_ROOT/plugin" 2>/dev/null || true)
if [[ -n "$STALE_HITS" ]]; then
  warn "Found hardcoded 'vibe-${OLD_MAJOR_MINOR}-configured' references (may be intentional historical, review):"
  echo "$STALE_HITS" | sed 's/^/    /'
fi

# Also flag direct version strings that shouldn't appear in code (e.g.
# hardcoded "5.0.2" outside CHANGELOG). This is advisory, not blocking.
CODE_HITS=$(grep -rEn "\"$CURRENT_VERSION\"" "$REPO_ROOT/plugin/scripts" "$REPO_ROOT/plugin/hooks" 2>/dev/null || true)
if [[ -n "$CODE_HITS" ]]; then
  warn "Found hardcoded '$CURRENT_VERSION' strings in scripts/hooks (should use dynamic version read from plugin.json):"
  echo "$CODE_HITS" | sed 's/^/    /'
fi

# ── Stage changes ─────────────────────────────────────────────────────────
step "Staging changes"

if $DRY_RUN; then
  would "git add plugin/.claude-plugin/plugin.json .claude-plugin/marketplace.json plugin/CHANGELOG.md plugin/README.md"
else
  git -C "$REPO_ROOT" add \
    "plugin/.claude-plugin/plugin.json" \
    ".claude-plugin/marketplace.json" \
    "plugin/CHANGELOG.md" \
    "plugin/README.md" 2>/dev/null || warn "git add had issues — check 'git status' manually"
  ok "Staged: plugin.json, marketplace.json, CHANGELOG.md, README.md"
fi

# ── Summary ───────────────────────────────────────────────────────────────
step "Summary"

info "Version:  $CURRENT_VERSION → $NEW_VERSION"
info "Counts:   $SKILL_COUNT skills, $AGENT_COUNT agents, $HOOK_COUNT hooks"
info "Date:     $TODAY"
info "Warnings: $WARNINGS"

echo ""
if $DRY_RUN; then
  info "Dry run complete. Run without --dry-run to apply."
else
  cat <<DONE

${BOLD}Next steps:${NC}
  1. Edit ${BOLD}plugin/CHANGELOG.md${NC} — replace the skeleton sections with real content
  2. Edit ${BOLD}plugin/README.md${NC} — replace the 'What's New in $NEW_MAJOR_MINOR' skeleton with real prose
  3. Address any warnings above (help skill drift, hardcoded version strings)
  4. Review the staged diff: ${BOLD}git diff --cached${NC}
  5. Commit: ${BOLD}git commit -m "chore: bump version to $NEW_VERSION"${NC}
  6. Push: ${BOLD}git push origin main${NC}
DONE
fi

if [[ $WARNINGS -gt 0 ]]; then
  exit 1
fi
exit 0

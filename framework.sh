#!/usr/bin/env bash
#
# framework.sh — Install or update the Claude Development Framework in a target project
#
# Usage: ./framework.sh /path/to/target/project [--dry-run]
#
# Install (no .claude/ in target): copies everything, creates settings, output dirs, .gitignore
# Update (.claude/ exists in target): overwrites framework files, preserves user data, creates backup
#

set -euo pipefail

# --- Configuration ---

PROTECTED_FILES=(
  ".claude/docs/registry.md"
  ".claude/docs/decisions.md"
  ".claude/docs/glossary.md"
  ".claude/docs/request-log.md"
  ".claude/docs/checklist.md"
  ".claude/docs/bugs/bugs.md"
  ".claude/settings.local.json"
  ".claude/morpheus/config.json"
)

OUTPUT_DIRS=(
  ".emmet"
  ".forge"
  ".seurat"
  ".orson"
  ".scribe"
  ".ghostwriter"
)

GITIGNORE_ENTRIES=(
  ".claude/settings.local.json"
  ".claude/docs/session-notes/*.md"
  "!.claude/docs/session-notes/.gitkeep"
  ".emmet/"
  ".forge/"
  ".seurat/"
  ".orson/"
  ".scribe/"
  ".ghostwriter/"
  ".heimdall/state.json"
  ".heimdall/findings.json"
  "node_modules/"
  "__pycache__/"
)

PROTECTED_DIRS=(
  ".claude/docs/session-notes"
  ".claude/docs/specs"
)

# Files inside protected dirs that ARE framework (always overwrite)
FRAMEWORK_IN_PROTECTED_DIRS=(
  ".claude/docs/specs/template.md"
  ".claude/docs/specs/references/.gitkeep"
)

# --- Parse arguments ---

DRY_RUN=false
TARGET_DIR=""

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=true
      ;;
    -*)
      echo "Error: Unknown option '$arg'"
      echo "Usage: $0 /path/to/target/project [--dry-run]"
      exit 1
      ;;
    *)
      if [ -z "$TARGET_DIR" ]; then
        TARGET_DIR="$arg"
      else
        echo "Error: Multiple target directories specified."
        echo "Usage: $0 /path/to/target/project [--dry-run]"
        exit 1
      fi
      ;;
  esac
done

# --- Validation ---

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Read framework version ---

if [ -f "$SOURCE_DIR/VERSION" ]; then
  FRAMEWORK_VERSION="$(tr -d '[:space:]' < "$SOURCE_DIR/VERSION")"
else
  FRAMEWORK_VERSION="unknown"
fi

if [ -z "$TARGET_DIR" ]; then
  PARENT_DIR="$(cd "$SOURCE_DIR/.." && pwd)"
  echo ""
  echo "No target directory specified."
  echo "Install framework to parent directory?"
  echo "  → $PARENT_DIR"
  echo ""
  read -rp "Proceed? [Y/n] " answer
  if [[ "$answer" =~ ^[Nn]$ ]]; then
    echo ""
    echo "Usage: $0 /path/to/target/project [--dry-run]"
    exit 0
  fi
  TARGET_DIR="$PARENT_DIR"
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' does not exist."
  exit 1
fi

# Resolve to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# Prevent updating self
if [ "$SOURCE_DIR" = "$TARGET_DIR" ]; then
  echo "Error: Source and target are the same directory."
  exit 1
fi

# --- Detect install vs update ---

IS_INSTALL=false
if [ ! -d "$TARGET_DIR/.claude" ]; then
  IS_INSTALL=true
fi

# --- Counters ---

updated=0
preserved=0
initialized=0
backed_up=0

# --- Backup setup ---

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$TARGET_DIR/.framework-backup-$TIMESTAMP"

# --- Helpers ---

is_protected_file() {
  local rel_path="$1"
  for pf in "${PROTECTED_FILES[@]}"; do
    if [ "$rel_path" = "$pf" ]; then
      return 0
    fi
  done
  return 1
}

is_in_protected_dir() {
  local rel_path="$1"
  for pd in "${PROTECTED_DIRS[@]}"; do
    if [[ "$rel_path" == "$pd"/* ]]; then
      return 0
    fi
  done
  return 1
}

is_framework_in_protected_dir() {
  local rel_path="$1"
  for ff in "${FRAMEWORK_IN_PROTECTED_DIRS[@]}"; do
    if [ "$rel_path" = "$ff" ]; then
      return 0
    fi
  done
  return 1
}

backup_file() {
  local rel_path="$1"
  local target_file="$TARGET_DIR/$rel_path"
  if [ -f "$target_file" ]; then
    local backup_file="$BACKUP_DIR/$rel_path"
    local backup_dir
    backup_dir="$(dirname "$backup_file")"
    if [ "$DRY_RUN" = false ]; then
      mkdir -p "$backup_dir"
      cp "$target_file" "$backup_file"
    fi
    backed_up=$((backed_up + 1))
  fi
}

# --- Git uncommitted changes check ---

check_git_status() {
  if [ ! -d "$TARGET_DIR/.git" ]; then
    return
  fi

  local dirty_files
  dirty_files="$(cd "$TARGET_DIR" && git status --porcelain -- .claude/ CLAUDE.md 2>/dev/null || true)"

  if [ -n "$dirty_files" ]; then
    echo ""
    echo "WARNING: Target project has uncommitted changes in framework files:"
    echo "$dirty_files" | head -20
    local count
    count="$(echo "$dirty_files" | wc -l)"
    if [ "$count" -gt 20 ]; then
      echo "  ... and $((count - 20)) more"
    fi
    echo ""
    if [ "$DRY_RUN" = true ]; then
      echo "(Dry run — no changes will be made)"
      return
    fi
    read -rp "Continue anyway? Uncommitted changes will be backed up. [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 0
    fi
  fi
}

# --- CLAUDE.md diff check ---

check_claude_md() {
  local source_file="$SOURCE_DIR/CLAUDE.md"
  local target_file="$TARGET_DIR/CLAUDE.md"

  if [ ! -f "$source_file" ] || [ ! -f "$target_file" ]; then
    return
  fi

  if ! diff -q "$source_file" "$target_file" > /dev/null 2>&1; then
    echo ""
    echo "WARNING: CLAUDE.md in the target project differs from the framework version."
    echo "  This may indicate project-specific customizations."
    echo ""
    if [ "$DRY_RUN" = true ]; then
      echo "  (Dry run — would backup to .framework-backup-$TIMESTAMP/CLAUDE.md)"
      return
    fi
    echo "  Options:"
    echo "    [o] Overwrite (backup current → update to new)"
    echo "    [k] Keep current (skip CLAUDE.md update)"
    echo ""
    read -rp "  Choice [o/k]: " choice
    case "$choice" in
      [Oo])
        CLAUDE_MD_ACTION="overwrite"
        ;;
      *)
        CLAUDE_MD_ACTION="keep"
        ;;
    esac
  fi
}

CLAUDE_MD_ACTION="overwrite"  # default

# --- Dry-run scan ---

scan_changes() {
  local mode="$1"  # "count" or "print"
  local scan_updated=0
  local scan_preserved=0
  local scan_initialized=0

  while IFS= read -r -d '' file; do
    local rel_path="${file#"$SOURCE_DIR"/}"

    if [[ "$rel_path" != .claude/* ]]; then
      continue
    fi

    local target_file="$TARGET_DIR/$rel_path"

    if is_framework_in_protected_dir "$rel_path"; then
      scan_updated=$((scan_updated + 1))
      [ "$mode" = "print" ] && echo "  OVERWRITE  $rel_path"
      continue
    fi

    if is_in_protected_dir "$rel_path"; then
      if [ -f "$target_file" ]; then
        scan_preserved=$((scan_preserved + 1))
        [ "$mode" = "print" ] && echo "  PRESERVE   $rel_path"
      else
        scan_initialized=$((scan_initialized + 1))
        [ "$mode" = "print" ] && echo "  INIT       $rel_path"
      fi
      continue
    fi

    if is_protected_file "$rel_path"; then
      if [ -f "$target_file" ]; then
        scan_preserved=$((scan_preserved + 1))
        [ "$mode" = "print" ] && echo "  PRESERVE   $rel_path"
      else
        scan_initialized=$((scan_initialized + 1))
        [ "$mode" = "print" ] && echo "  INIT       $rel_path"
      fi
      continue
    fi

    if [ -f "$target_file" ]; then
      scan_updated=$((scan_updated + 1))
      [ "$mode" = "print" ] && echo "  OVERWRITE  $rel_path"
    else
      scan_initialized=$((scan_initialized + 1))
      [ "$mode" = "print" ] && echo "  INIT       $rel_path"
    fi

  done < <(find "$SOURCE_DIR/.claude" -type f -print0)

  # Root files
  for root_file in CLAUDE.md .claude-project; do
    if [ -f "$SOURCE_DIR/$root_file" ]; then
      if [ "$root_file" = "CLAUDE.md" ] && [ "$CLAUDE_MD_ACTION" = "keep" ]; then
        scan_preserved=$((scan_preserved + 1))
        [ "$mode" = "print" ] && echo "  KEEP       $root_file (user choice)"
      elif [ -f "$TARGET_DIR/$root_file" ]; then
        scan_updated=$((scan_updated + 1))
        [ "$mode" = "print" ] && echo "  OVERWRITE  $root_file"
      else
        scan_initialized=$((scan_initialized + 1))
        [ "$mode" = "print" ] && echo "  INIT       $root_file"
      fi
    fi
  done

  if [ "$mode" = "count" ]; then
    echo "$scan_updated $scan_preserved $scan_initialized"
  fi
}

# --- Main ---

echo ""
if [ "$IS_INSTALL" = true ]; then
  echo "Claude Development Framework v${FRAMEWORK_VERSION} — Install"
  echo "================================================="
else
  # Read installed version from target
  TARGET_VERSION=""
  if [ -f "$TARGET_DIR/.claude/.framework-version" ]; then
    TARGET_VERSION="$(tr -d '[:space:]' < "$TARGET_DIR/.claude/.framework-version")"
  fi

  echo "Claude Development Framework v${FRAMEWORK_VERSION} — Update"
  echo "================================================="

  if [ -n "$TARGET_VERSION" ]; then
    if [ "$TARGET_VERSION" = "$FRAMEWORK_VERSION" ]; then
      echo "Version: v${TARGET_VERSION} (already up to date)"
    else
      echo "Version: v${TARGET_VERSION} → v${FRAMEWORK_VERSION}"
    fi
  else
    echo "Version: (unknown) → v${FRAMEWORK_VERSION}"
  fi
fi
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"

if [ "$DRY_RUN" = true ]; then
  echo "Mode:   DRY RUN (no files will be modified)"
fi

# Step 0: Safety checks (skip git/CLAUDE.md checks on fresh install)
if [ "$IS_INSTALL" = false ]; then
  # Check if already up to date
  if [ -n "${TARGET_VERSION:-}" ] && [ "$TARGET_VERSION" = "$FRAMEWORK_VERSION" ] && [ "$DRY_RUN" = false ]; then
    echo ""
    read -rp "Target is already at v${FRAMEWORK_VERSION}. Re-install anyway? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 0
    fi
  fi

  check_git_status
  check_claude_md
fi

echo ""

if [ "$DRY_RUN" = true ]; then
  echo "Preview of changes:"
  echo ""
  scan_changes "print"

  read -r scan_u scan_p scan_i <<< "$(scan_changes count)"
  echo ""
  echo "Summary (dry run):"
  echo "  Would update:     $scan_u files"
  echo "  Would preserve:   $scan_p files (user data)"
  echo "  Would initialize: $scan_i files (new templates)"
  echo ""
  echo "Run without --dry-run to apply."
  exit 0
fi

# Step 0.5: Confirmation
read -r scan_u scan_p scan_i <<< "$(scan_changes count)"
echo "Planned changes:"
echo "  Update:     $scan_u files (framework)"
echo "  Preserve:   $scan_p files (user data)"
echo "  Initialize: $scan_i files (new templates)"
echo ""
echo "Backup will be created at:"
echo "  $BACKUP_DIR"
echo ""
read -rp "Proceed? [Y/n] " confirm
if [[ "$confirm" =~ ^[Nn]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# Step 1: Copy .claude/ framework files
while IFS= read -r -d '' file; do
  rel_path="${file#"$SOURCE_DIR"/}"

  # Skip non-.claude files (handled separately)
  if [[ "$rel_path" != .claude/* ]]; then
    continue
  fi

  target_file="$TARGET_DIR/$rel_path"
  target_dir="$(dirname "$target_file")"

  # Framework files inside protected dirs: always overwrite
  if is_framework_in_protected_dir "$rel_path"; then
    backup_file "$rel_path"
    mkdir -p "$target_dir"
    cp "$file" "$target_file"
    updated=$((updated + 1))
    continue
  fi

  # Skip user files in protected directories (don't overwrite user specs, session notes)
  if is_in_protected_dir "$rel_path"; then
    if [ -f "$target_file" ]; then
      preserved=$((preserved + 1))
      continue
    fi
    # New file in protected dir — copy it
    mkdir -p "$target_dir"
    cp "$file" "$target_file"
    initialized=$((initialized + 1))
    continue
  fi

  # Protected files: skip if exists, initialize if missing
  if is_protected_file "$rel_path"; then
    if [ -f "$target_file" ]; then
      preserved=$((preserved + 1))
    else
      mkdir -p "$target_dir"
      cp "$file" "$target_file"
      initialized=$((initialized + 1))
    fi
    continue
  fi

  # Everything else: backup then overwrite
  backup_file "$rel_path"
  mkdir -p "$target_dir"
  cp "$file" "$target_file"
  updated=$((updated + 1))

done < <(find "$SOURCE_DIR/.claude" -type f -print0)

# Step 2: Copy root framework files
for root_file in CLAUDE.md .claude-project; do
  if [ -f "$SOURCE_DIR/$root_file" ]; then
    if [ "$root_file" = "CLAUDE.md" ] && [ "$CLAUDE_MD_ACTION" = "keep" ]; then
      preserved=$((preserved + 1))
      echo "  Kept CLAUDE.md (user choice)"
      continue
    fi
    backup_file "$root_file"
    cp "$SOURCE_DIR/$root_file" "$TARGET_DIR/$root_file"
    updated=$((updated + 1))
  fi
done

# Step 3: Ensure output directories exist
for dir in "${OUTPUT_DIRS[@]}"; do
  if [ ! -d "$TARGET_DIR/$dir" ]; then
    mkdir -p "$TARGET_DIR/$dir"
    echo "  Created $dir/"
  fi
done

# Step 4: Ensure .claude/morpheus/ exists
if [ ! -d "$TARGET_DIR/.claude/morpheus" ]; then
  mkdir -p "$TARGET_DIR/.claude/morpheus"
  echo "  Created .claude/morpheus/"
fi

# Step 5: Create settings.local.json from template if missing
if [ ! -f "$TARGET_DIR/.claude/settings.local.json" ] && [ -f "$SOURCE_DIR/.claude/settings.template.json" ]; then
  cp "$SOURCE_DIR/.claude/settings.template.json" "$TARGET_DIR/.claude/settings.local.json"
  echo "  Created .claude/settings.local.json (from template)"
fi

# Step 6: Update target .gitignore
gitignore_file="$TARGET_DIR/.gitignore"
if [ ! -f "$gitignore_file" ]; then
  touch "$gitignore_file"
  echo "  Created .gitignore"
fi

gitignore_added=0
for entry in "${GITIGNORE_ENTRIES[@]}"; do
  if ! grep -qxF "$entry" "$gitignore_file" 2>/dev/null; then
    echo "$entry" >> "$gitignore_file"
    gitignore_added=$((gitignore_added + 1))
  fi
done
if [ "$gitignore_added" -gt 0 ]; then
  echo "  Added $gitignore_added entries to .gitignore"
fi

# Step 7: Check jq (required by Morpheus)
if ! command -v jq &>/dev/null; then
  echo ""
  echo "  WARNING: jq not found. Morpheus context awareness requires jq."
  if command -v pacman &>/dev/null; then
    echo "  Install it: sudo pacman -S jq"
  elif command -v apt &>/dev/null; then
    echo "  Install it: sudo apt install jq"
  elif command -v dnf &>/dev/null; then
    echo "  Install it: sudo dnf install jq"
  elif command -v brew &>/dev/null; then
    echo "  Install it: brew install jq"
  elif command -v choco &>/dev/null; then
    echo "  Install it: choco install jq"
  elif command -v scoop &>/dev/null; then
    echo "  Install it: scoop install jq"
  elif command -v winget &>/dev/null; then
    echo "  Install it: winget install jqlang.jq"
  else
    echo "  Install it: https://jqlang.github.io/jq/download/"
  fi
fi

# Step 8: Write framework version to target
echo "$FRAMEWORK_VERSION" > "$TARGET_DIR/.claude/.framework-version"

# Step 9: Clean up empty backup dir
if [ -d "$BACKUP_DIR" ] && [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
  rmdir "$BACKUP_DIR"
  backed_up=0
fi

# --- Report ---

echo ""
echo "Done. (v${FRAMEWORK_VERSION})"
echo "  Updated:     $updated files"
echo "  Preserved:   $preserved files (user data)"
echo "  Initialized: $initialized files (new templates)"
if [ "$backed_up" -gt 0 ]; then
  echo ""
  echo "  Backup: $BACKUP_DIR ($backed_up files)"
  echo "  To restore: cp -r $BACKUP_DIR/.claude/ $TARGET_DIR/.claude/"
fi

# --- Post-install instructions ---

if [ "$IS_INSTALL" = true ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Next steps:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  1. Open Claude Code in your project"
  echo ""
  echo "  2. Populate the registry (existing projects):"
  echo "     Analizza questo codebase e popola .claude/docs/registry.md"
  echo ""
  echo "  3. Generate stack-specific patterns:"
  echo "     /adapt-framework"
  echo ""
  echo "  4. (Optional) For projects with UI:"
  echo "     /seurat extract"
  echo "     /seurat map"
  echo ""
  echo "  Full docs: .claude/README.md"
  echo ""
fi

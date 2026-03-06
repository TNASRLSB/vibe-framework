#!/usr/bin/env bash
#
# vibe-framework.sh — Self-contained installer for the VIBE Framework
#
# Usage:
#   ./vibe-framework.sh              Install/update in current directory
#   ./vibe-framework.sh /path/to/dir Install/update in specified directory
#   ./vibe-framework.sh --dry-run    Preview changes without applying
#   ./vibe-framework.sh --version    Show installed vs available version
#   ./vibe-framework.sh --help       Show help
#
# The script downloads the latest release from GitHub and installs everything.
# User data (registry, decisions, specs, session-notes) is preserved on update.
#

set -euo pipefail

# --- Constants ---

GITHUB_REPO="DKHBSFA/vibe-framework"
GITHUB_API="https://api.github.com/repos/$GITHUB_REPO/releases/latest"
SCRIPT_NAME="$(basename "$0")"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# --- Helpers ---

die() { echo "Error: $1" >&2; exit 1; }

cleanup() {
  if [ -n "${TMPDIR_DOWNLOAD:-}" ] && [ -d "$TMPDIR_DOWNLOAD" ]; then
    rm -rf "$TMPDIR_DOWNLOAD"
  fi
}
trap cleanup EXIT

is_protected_file() {
  local rel_path="$1"
  for pf in "${PROTECTED_FILES[@]}"; do
    [ "$rel_path" = "$pf" ] && return 0
  done
  return 1
}

is_in_protected_dir() {
  local rel_path="$1"
  for pd in "${PROTECTED_DIRS[@]}"; do
    [[ "$rel_path" == "$pd"/* ]] && return 0
  done
  return 1
}

is_framework_in_protected_dir() {
  local rel_path="$1"
  for ff in "${FRAMEWORK_IN_PROTECTED_DIRS[@]}"; do
    [ "$rel_path" = "$ff" ] && return 0
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

# --- Check prerequisites ---

check_prerequisites() {
  for cmd in curl tar; do
    if ! command -v "$cmd" &>/dev/null; then
      die "$cmd is required but not found. Install it and try again."
    fi
  done
}

# --- GitHub API ---

fetch_latest_version() {
  local response
  response=$(curl -sf --max-time 10 "$GITHUB_API" 2>/dev/null) || {
    die "Cannot reach GitHub API. Check your internet connection."
  }

  RELEASE_TAG=$(echo "$response" | grep -o '"tag_name": *"[^"]*"' | head -1 | grep -o 'v[^"]*')
  RELEASE_VERSION="${RELEASE_TAG#v}"
  TARBALL_URL="https://github.com/$GITHUB_REPO/archive/refs/tags/$RELEASE_TAG.tar.gz"

  if [ -z "$RELEASE_TAG" ]; then
    die "Could not find latest release. Check https://github.com/$GITHUB_REPO/releases"
  fi
}

download_and_extract() {
  TMPDIR_DOWNLOAD="$(mktemp -d)"
  local tarball="$TMPDIR_DOWNLOAD/release.tar.gz"

  echo "  Downloading v${RELEASE_VERSION}..."
  curl -sfL --max-time 120 -o "$tarball" "$TARBALL_URL" || {
    die "Failed to download release tarball from $TARBALL_URL"
  }

  echo "  Extracting..."
  tar xzf "$tarball" -C "$TMPDIR_DOWNLOAD" || {
    die "Failed to extract tarball"
  }

  # GitHub extracts to repo-name-version/ directory
  SOURCE_DIR="$(find "$TMPDIR_DOWNLOAD" -maxdepth 1 -type d -name "vibe-framework-*" | head -1)"
  if [ -z "$SOURCE_DIR" ]; then
    die "Unexpected tarball structure. Expected vibe-framework-*/ directory."
  fi

  # Read version from extracted source
  if [ -f "$SOURCE_DIR/VERSION" ]; then
    FRAMEWORK_VERSION="$(tr -d '[:space:]' < "$SOURCE_DIR/VERSION")"
  else
    FRAMEWORK_VERSION="$RELEASE_VERSION"
  fi
}

# --- Parse arguments ---

DRY_RUN=false
TARGET_DIR=""
ACTION="install"  # install, version, help

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=true
      ;;
    --version|-v)
      ACTION="version"
      ;;
    --help|-h)
      ACTION="help"
      ;;
    -*)
      die "Unknown option '$arg'. Use --help for usage."
      ;;
    *)
      if [ -z "$TARGET_DIR" ]; then
        TARGET_DIR="$arg"
      else
        die "Multiple target directories specified. Use --help for usage."
      fi
      ;;
  esac
done

# --- Help ---

if [ "$ACTION" = "help" ]; then
  echo ""
  echo "VIBE Framework — Self-contained installer"
  echo ""
  echo "Usage:"
  echo "  $SCRIPT_NAME                  Install/update in current directory"
  echo "  $SCRIPT_NAME /path/to/dir     Install/update in specified directory"
  echo "  $SCRIPT_NAME --dry-run        Preview changes without applying"
  echo "  $SCRIPT_NAME --version        Show installed vs available version"
  echo "  $SCRIPT_NAME --help           Show this help"
  echo ""
  echo "The script downloads the latest release from GitHub and installs"
  echo "the framework (skills, docs, workflows) in the target project."
  echo ""
  echo "User data (registry, decisions, specs, session-notes) is preserved"
  echo "on update. A backup is created before overwriting any files."
  echo ""
  echo "Repository: https://github.com/$GITHUB_REPO"
  echo ""
  exit 0
fi

# --- Version check ---

if [ "$ACTION" = "version" ]; then
  # Read installed version
  if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$SCRIPT_DIR"
  fi
  INSTALLED_VERSION=""
  if [ -f "$TARGET_DIR/.claude/.framework-version" ]; then
    INSTALLED_VERSION="$(tr -d '[:space:]' < "$TARGET_DIR/.claude/.framework-version")"
  fi

  # Fetch latest (local or remote)
  echo ""
  if [ -n "${VIBE_LOCAL_SOURCE:-}" ]; then
    if [ -f "$VIBE_LOCAL_SOURCE/VERSION" ]; then
      RELEASE_VERSION="$(tr -d '[:space:]' < "$VIBE_LOCAL_SOURCE/VERSION")"
    else
      RELEASE_VERSION="local"
    fi
    echo "Source: local ($VIBE_LOCAL_SOURCE)"
  else
    check_prerequisites
    echo "Checking latest version..."
    fetch_latest_version
  fi

  echo ""
  if [ -n "$INSTALLED_VERSION" ]; then
    echo "  Installed: v${INSTALLED_VERSION}"
  else
    echo "  Installed: (not installed)"
  fi
  echo "  Available: v${RELEASE_VERSION}"

  if [ "$INSTALLED_VERSION" = "$RELEASE_VERSION" ]; then
    echo "  Status:    Up to date"
  elif [ -n "$INSTALLED_VERSION" ]; then
    echo "  Status:    Update available"
  else
    echo "  Status:    Not installed"
  fi
  echo ""
  exit 0
fi

# --- Main install flow ---

# Resolve target directory
if [ -z "$TARGET_DIR" ]; then
  TARGET_DIR="$SCRIPT_DIR"
fi

if [ ! -d "$TARGET_DIR" ]; then
  die "Target directory '$TARGET_DIR' does not exist."
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo ""
echo "VIBE Framework — Installer"
echo "================================================="

# Local source mode (for development/testing):
#   VIBE_LOCAL_SOURCE=/path/to/framework-repo ./vibe-framework.sh
if [ -n "${VIBE_LOCAL_SOURCE:-}" ]; then
  if [ ! -d "$VIBE_LOCAL_SOURCE/.claude" ]; then
    die "VIBE_LOCAL_SOURCE='$VIBE_LOCAL_SOURCE' does not contain .claude/ directory."
  fi
  SOURCE_DIR="$(cd "$VIBE_LOCAL_SOURCE" && pwd)"
  if [ -f "$SOURCE_DIR/VERSION" ]; then
    FRAMEWORK_VERSION="$(tr -d '[:space:]' < "$SOURCE_DIR/VERSION")"
  else
    FRAMEWORK_VERSION="local"
  fi
  echo ""
  echo "Source: local ($SOURCE_DIR)"
else
  check_prerequisites
  echo ""
  echo "Checking latest release..."
  fetch_latest_version
  download_and_extract
fi

echo ""

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

# --- CLAUDE.md diff check ---

CLAUDE_MD_ACTION="overwrite"  # default

check_claude_md() {
  local source_file="$SOURCE_DIR/CLAUDE.md"
  local target_file="$TARGET_DIR/CLAUDE.md"

  if [ ! -f "$source_file" ] || [ ! -f "$target_file" ]; then
    return
  fi

  if ! diff -q "$source_file" "$target_file" > /dev/null 2>&1; then
    echo ""
    echo "WARNING: CLAUDE.md differs from the framework version."
    echo "  This may indicate project-specific customizations."
    echo ""
    if [ "$DRY_RUN" = true ]; then
      echo "  (Dry run — would backup to .framework-backup-$TIMESTAMP/CLAUDE.md)"
      return
    fi
    echo "  Options:"
    echo "    [o] Overwrite (backup current, update to new)"
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

# --- Git uncommitted changes check ---

check_git_status() {
  if [ ! -d "$TARGET_DIR/.git" ]; then
    return
  fi

  local dirty_files
  dirty_files="$(cd "$TARGET_DIR" && git status --porcelain -- .claude/ CLAUDE.md 2>/dev/null || true)"

  if [ -n "$dirty_files" ]; then
    echo ""
    echo "WARNING: Uncommitted changes in framework files:"
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
    read -rp "Continue? Uncommitted changes will be backed up. [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 0
    fi
  fi
}

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

# --- Display header ---

if [ "$IS_INSTALL" = true ]; then
  echo "Mode: Fresh install"
  echo "Version: v${FRAMEWORK_VERSION}"
else
  TARGET_VERSION=""
  if [ -f "$TARGET_DIR/.claude/.framework-version" ]; then
    TARGET_VERSION="$(tr -d '[:space:]' < "$TARGET_DIR/.claude/.framework-version")"
  fi

  echo "Mode: Update"
  if [ -n "$TARGET_VERSION" ]; then
    if [ "$TARGET_VERSION" = "$FRAMEWORK_VERSION" ]; then
      echo "Version: v${TARGET_VERSION} (already up to date)"
    else
      echo "Version: v${TARGET_VERSION} -> v${FRAMEWORK_VERSION}"
    fi
  else
    echo "Version: (unknown) -> v${FRAMEWORK_VERSION}"
  fi
fi
echo "Target: $TARGET_DIR"

if [ "$DRY_RUN" = true ]; then
  echo "Mode:   DRY RUN (no files will be modified)"
fi

# --- Safety checks (skip on fresh install) ---

if [ "$IS_INSTALL" = false ]; then
  # Already up to date?
  if [ -n "${TARGET_VERSION:-}" ] && [ "$TARGET_VERSION" = "$FRAMEWORK_VERSION" ] && [ "$DRY_RUN" = false ]; then
    echo ""
    read -rp "Already at v${FRAMEWORK_VERSION}. Re-install anyway? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 0
    fi
  fi

  check_git_status
  check_claude_md
fi

echo ""

# --- Dry run ---

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

# --- Confirmation ---

read -r scan_u scan_p scan_i <<< "$(scan_changes count)"
echo "Planned changes:"
echo "  Update:     $scan_u files (framework)"
echo "  Preserve:   $scan_p files (user data)"
echo "  Initialize: $scan_i files (new templates)"
echo ""
read -rp "Proceed? [Y/n] " confirm
if [[ "$confirm" =~ ^[Nn]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# --- Step 1: Copy .claude/ framework files ---

while IFS= read -r -d '' file; do
  rel_path="${file#"$SOURCE_DIR"/}"

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

  # Skip user files in protected directories
  if is_in_protected_dir "$rel_path"; then
    if [ -f "$target_file" ]; then
      preserved=$((preserved + 1))
      continue
    fi
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

# --- Step 2: Copy root framework files ---

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

# --- Step 3: Ensure output directories exist ---

for dir in "${OUTPUT_DIRS[@]}"; do
  if [ ! -d "$TARGET_DIR/$dir" ]; then
    mkdir -p "$TARGET_DIR/$dir"
    echo "  Created $dir/"
  fi
done

# --- Step 4: Ensure .claude/morpheus/ exists ---

if [ ! -d "$TARGET_DIR/.claude/morpheus" ]; then
  mkdir -p "$TARGET_DIR/.claude/morpheus"
  echo "  Created .claude/morpheus/"
fi

# --- Step 5: Create settings.local.json from template if missing ---

if [ ! -f "$TARGET_DIR/.claude/settings.local.json" ] && [ -f "$SOURCE_DIR/.claude/settings.template.json" ]; then
  cp "$SOURCE_DIR/.claude/settings.template.json" "$TARGET_DIR/.claude/settings.local.json"
  echo "  Created .claude/settings.local.json (from template)"
fi

# --- Step 6: Update .gitignore ---

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

# --- Step 7: Check jq (required by Morpheus) ---

if ! command -v jq &>/dev/null; then
  echo ""
  echo "  NOTE: jq not found. Morpheus context awareness requires jq."
  if command -v pacman &>/dev/null; then
    echo "  Install: sudo pacman -S jq"
  elif command -v apt &>/dev/null; then
    echo "  Install: sudo apt install jq"
  elif command -v dnf &>/dev/null; then
    echo "  Install: sudo dnf install jq"
  elif command -v brew &>/dev/null; then
    echo "  Install: brew install jq"
  else
    echo "  Install: https://jqlang.github.io/jq/download/"
  fi
fi

# --- Step 8: Write framework version ---

echo "$FRAMEWORK_VERSION" > "$TARGET_DIR/.claude/.framework-version"

# --- Step 9: Self-update the installer script ---

if [ -f "$SOURCE_DIR/vibe-framework.sh" ]; then
  local_script="$SCRIPT_DIR/$SCRIPT_NAME"
  if [ -f "$local_script" ]; then
    if ! diff -q "$SOURCE_DIR/vibe-framework.sh" "$local_script" > /dev/null 2>&1; then
      cp "$SOURCE_DIR/vibe-framework.sh" "$local_script"
      chmod +x "$local_script"
      echo "  Updated $SCRIPT_NAME to v${FRAMEWORK_VERSION}"
    fi
  fi
fi

# --- Step 10: Clean up empty backup dir ---

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
fi

# --- Post-install: Orson engine ---

if [ -d "$TARGET_DIR/.claude/skills/orson/engine" ] && [ -f "$TARGET_DIR/.claude/skills/orson/engine/package.json" ]; then
  if [ ! -d "$TARGET_DIR/.claude/skills/orson/engine/node_modules" ]; then
    echo ""
    echo "  Orson engine requires dependencies."
    read -rp "  Run 'npm install' in orson/engine? [Y/n] " orson_answer
    if [[ ! "$orson_answer" =~ ^[Nn]$ ]]; then
      echo "  Installing Orson dependencies..."
      (cd "$TARGET_DIR/.claude/skills/orson/engine" && npm install --silent 2>&1) || {
        echo "  WARNING: npm install failed. Run manually:"
        echo "    cd .claude/skills/orson/engine && npm install"
      }
    else
      echo "  Skipped. Run manually when needed:"
      echo "    cd .claude/skills/orson/engine && npm install"
    fi
  fi
fi

# --- Post-install instructions (first install only) ---

if [ "$IS_INSTALL" = true ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  VIBE Framework v${FRAMEWORK_VERSION} installed!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Next steps:"
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

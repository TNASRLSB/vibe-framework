#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# vibe-v1-cleanup.sh — VIBE Framework v1 → v2 migration tool
# ============================================================================
#
# Detects VIBE Framework v1 remnants in projects, backs them up into a
# timestamped zip file, and removes them so the global v2 plugin operates
# without conflicts.
#
# Usage:
#   ./vibe-v1-cleanup.sh [OPTIONS] [project-path]
#
# Modes:
#   ./vibe-v1-cleanup.sh                     # current directory
#   ./vibe-v1-cleanup.sh /path/to/project    # specific project
#   ./vibe-v1-cleanup.sh --scan ~/projects   # scan all subdirectories
#
# Options:
#   --dry-run     Preview what would be done without making changes
#   --yes, -y     Skip confirmation prompts (use with --scan for batch runs)
#   --scan DIR    Scan all immediate subdirectories of DIR (+ worktrees)
#   --deep        With --scan: also find nested projects (2 levels deep)
#   --no-color    Disable colored output
#   --keep-docs   Preserve .claude/docs/ (default: backs up but does NOT delete)
#   --help        Show this help message
#
# What gets backed up and removed:
#   - CLAUDE.md (v1 "Claude Operating System")
#   - .claude/morpheus/ (context awareness system)
#   - .claude/rules/ (framework rule files)
#   - .claude/skills/ (embedded v1 skills)
#   - .claude/settings.template.json
#   - .claude/README.md
#   - .forge/ (v1 forge workspace)
#   - vibe-framework/ (embedded framework copy)
#   - vibe-framework.sh (v1 installer script)
#   - .framework-backup-*/ (old migration backups)
#   - .vibe-v1-backup-*.zip (old cleanup backup zips)
#
# What is surgically cleaned (only morpheus references removed):
#   - .claude/settings.json (hooks and statusLine referencing morpheus)
#   - .claude/settings.local.json (hooks and statusLine referencing morpheus)
#
# What is NEVER touched:
#   - .claude/docs/ (project documentation — backed up but preserved)
#   - .claude/memory/ (project memory)
#   - .git/ and all version-controlled content
#
# The backup zip is placed at: <project>/.vibe-v1-backup-YYYYMMDD-HHMMSS.zip
# ============================================================================

VERSION="1.1.0"

# --- Colors ---------------------------------------------------------------

USE_COLOR=true

red()    { $USE_COLOR && printf '\033[0;31m%s\033[0m' "$*" || printf '%s' "$*"; }
green()  { $USE_COLOR && printf '\033[0;32m%s\033[0m' "$*" || printf '%s' "$*"; }
yellow() { $USE_COLOR && printf '\033[0;33m%s\033[0m' "$*" || printf '%s' "$*"; }
blue()   { $USE_COLOR && printf '\033[0;34m%s\033[0m' "$*" || printf '%s' "$*"; }
bold()   { $USE_COLOR && printf '\033[1m%s\033[0m'    "$*" || printf '%s' "$*"; }
dim()    { $USE_COLOR && printf '\033[2m%s\033[0m'    "$*" || printf '%s' "$*"; }

# --- Globals --------------------------------------------------------------

DRY_RUN=false
AUTO_YES=false
SCAN_DIR=""
DEEP_SCAN=false
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PROJECTS_FOUND=0
PROJECTS_MIGRATED=0
PROJECTS_SKIPPED=0
PROJECTS_CLEAN=0

# --- Helpers --------------------------------------------------------------

log()     { printf '%s\n' "$*"; }
info()    { printf '  %s %s\n' "$(blue "ℹ")" "$*"; }
ok()      { printf '  %s %s\n' "$(green "✓")" "$*"; }
warn()    { printf '  %s %s\n' "$(yellow "⚠")" "$*"; }
err()     { printf '  %s %s\n' "$(red "✗")" "$*"; }
step()    { printf '\n%s\n' "$(bold "$*")"; }

usage() {
    sed -n '/^# Usage:/,/^# ====/{/^# ====/d;s/^# \?//;p}' "$0"
    exit 0
}

# --- Detection ------------------------------------------------------------

# Returns 0 if the directory contains v1 framework remnants
detect_v1() {
    local dir="$1"
    local found=0

    # Marker 1: CLAUDE.md with v1 content
    if [[ -f "$dir/CLAUDE.md" ]]; then
        if grep -q "Claude Operating System" "$dir/CLAUDE.md" 2>/dev/null; then
            found=1
        elif grep -q "adapt-framework" "$dir/CLAUDE.md" 2>/dev/null; then
            found=1
        elif grep -q "Morpheus: Context Awareness" "$dir/CLAUDE.md" 2>/dev/null; then
            found=1
        elif grep -q "Golden Rule.*registry" "$dir/CLAUDE.md" 2>/dev/null; then
            found=1
        fi
    fi

    # Marker 2: Morpheus directory
    [[ -d "$dir/.claude/morpheus" ]] && found=1

    # Marker 3: Embedded framework copy
    [[ -d "$dir/vibe-framework" ]] && found=1

    # Marker 4: V1 installer script
    [[ -f "$dir/vibe-framework.sh" ]] && found=1

    # Marker 5: Embedded v1 skills (with old structure)
    if [[ -d "$dir/.claude/skills" ]]; then
        # v1 skills live inside .claude/skills/ in the project
        # v2 skills are in the plugin, not the project
        found=1
    fi

    # Marker 6: Framework rules (v1-specific)
    if [[ -d "$dir/.claude/rules" ]]; then
        if [[ -f "$dir/.claude/rules/large-files.md" ]] || \
           [[ -f "$dir/.claude/rules/security.md" ]] || \
           [[ -f "$dir/.claude/rules/ui-components.md" ]]; then
            found=1
        fi
    fi

    # Marker 7: Old settings template
    [[ -f "$dir/.claude/settings.template.json" ]] && found=1

    # Marker 8: .forge directory (v1 forge workspace)
    [[ -d "$dir/.forge" ]] && found=1

    # Marker 9: Old backup zips from previous cleanup runs
    compgen -G "$dir/.vibe-v1-backup-*.zip" &>/dev/null && found=1

    return $(( found == 0 ))
}

# Collect all v1 files/dirs to back up
collect_v1_items() {
    local dir="$1"
    local items=()

    # CLAUDE.md (only if it's a v1 framework file)
    if [[ -f "$dir/CLAUDE.md" ]]; then
        if grep -q "Claude Operating System\|adapt-framework\|Morpheus: Context Awareness" "$dir/CLAUDE.md" 2>/dev/null; then
            items+=("CLAUDE.md")
        fi
    fi

    # .claude/ framework subdirectories
    [[ -d "$dir/.claude/morpheus" ]]              && items+=(".claude/morpheus")
    [[ -d "$dir/.claude/rules" ]]                 && items+=(".claude/rules")
    [[ -d "$dir/.claude/skills" ]]                && items+=(".claude/skills")
    [[ -f "$dir/.claude/settings.template.json" ]] && items+=(".claude/settings.template.json")
    [[ -f "$dir/.claude/README.md" ]]             && items+=(".claude/README.md")

    # Embedded framework
    [[ -d "$dir/vibe-framework" ]]                && items+=("vibe-framework")
    [[ -f "$dir/vibe-framework.sh" ]]             && items+=("vibe-framework.sh")

    # .forge directory (v1 forge workspace)
    [[ -d "$dir/.forge" ]] && items+=(".forge")

    # Old migration backups
    for backup_dir in "$dir"/.framework-backup-*/; do
        [[ -d "$backup_dir" ]] && items+=("$(basename "$backup_dir")")
    done

    # Old cleanup backup zips from previous runs
    for zip_file in "$dir"/.vibe-v1-backup-*.zip; do
        [[ -f "$zip_file" ]] && items+=("$(basename "$zip_file")")
    done

    # .claude/docs/ — included in backup for safety, but NOT deleted
    [[ -d "$dir/.claude/docs" ]] && items+=(".claude/docs")

    printf '%s\n' "${items[@]}"
}

# --- Clean settings files from morpheus hooks -----------------------------

# Surgically remove morpheus references from a single JSON settings file.
# Removes hook entries, statusLine, and top-level keys that reference morpheus.
# Preserves all other configuration (permissions, env, mcpServers, etc.).
_clean_single_settings_file() {
    local settings="$1"
    local label="$2"   # for logging, e.g. "settings.json" or "settings.local.json"

    [[ -f "$settings" ]] || return 0

    # Check if file references morpheus at all
    if ! grep -q "morpheus" "$settings" 2>/dev/null; then
        echo "no-change:$label"
        return 0
    fi

    if $DRY_RUN; then
        info "Would clean morpheus hooks from .claude/$label"
        echo "dry-run:$label"
        return 0
    fi

    if command -v python3 &>/dev/null; then
        python3 -c "
import json, sys

path = '$settings'
with open(path) as f:
    data = json.load(f)

changed = False

# Remove hooks that reference morpheus (both top-level hooks and event keys)
for hooks_key in ['hooks', 'PreToolUse', 'PostToolUse', 'SessionStart',
                   'PreCompact', 'UserPromptSubmit', 'PostToolUseFailure',
                   'SubagentStop']:
    if hooks_key in data:
        val = data[hooks_key]
        if isinstance(val, list):
            cleaned = [h for h in val if 'morpheus' not in json.dumps(h)]
            if len(cleaned) != len(val):
                changed = True
            if cleaned:
                data[hooks_key] = cleaned
            else:
                del data[hooks_key]
                changed = True
        elif isinstance(val, dict):
            # Nested structure: hooks.PreToolUse, hooks.PostToolUse, etc.
            if hooks_key == 'hooks':
                for event_type in list(val.keys()):
                    hooks = val[event_type]
                    if isinstance(hooks, list):
                        cleaned = [h for h in hooks if 'morpheus' not in json.dumps(h)]
                        if len(cleaned) != len(hooks):
                            changed = True
                        if cleaned:
                            val[event_type] = cleaned
                        else:
                            del val[event_type]
                    elif isinstance(hooks, dict):
                        if 'morpheus' in json.dumps(hooks):
                            del val[event_type]
                            changed = True
                if not val:
                    del data['hooks']
            else:
                if 'morpheus' in json.dumps(val):
                    del data[hooks_key]
                    changed = True

# Remove statusLine if it references morpheus
if 'statusLine' in data:
    if 'morpheus' in json.dumps(data['statusLine']):
        del data['statusLine']
        changed = True

if changed:
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')
    print('cleaned:$label')
else:
    print('no-change:$label')
" 2>/dev/null
    else
        warn "python3 not found — skipping .claude/$label cleanup (manual edit needed)"
    fi
}

clean_settings_files() {
    local dir="$1"

    # Clean both settings.json and settings.local.json
    _clean_single_settings_file "$dir/.claude/settings.json"       "settings.json"
    _clean_single_settings_file "$dir/.claude/settings.local.json" "settings.local.json"
}

# --- Migration ------------------------------------------------------------

migrate_project() {
    local dir="$1"
    local name
    name=$(basename "$dir")

    step "[$name]"

    # Detect
    if ! detect_v1 "$dir"; then
        ok "No v1 framework detected — already clean"
        PROJECTS_CLEAN=$((PROJECTS_CLEAN + 1))
        return 0
    fi

    PROJECTS_FOUND=$((PROJECTS_FOUND + 1))

    # Collect items
    local items
    items=$(collect_v1_items "$dir")
    local item_count
    item_count=$(echo "$items" | wc -l)

    info "Found $(yellow "$item_count") v1 items to process"

    # List what will be backed up
    local backup_items=()   # items that go in zip AND get deleted
    local preserve_items=() # items that go in zip but stay on disk

    while IFS= read -r item; do
        if [[ "$item" == ".claude/docs" ]]; then
            preserve_items+=("$item")
            dim "    ↳ $item (backup only — preserved on disk)"
            echo
        else
            backup_items+=("$item")
            info "  $item"
        fi
    done <<< "$items"

    # Dry run stops here
    if $DRY_RUN; then
        local zip_name=".vibe-v1-backup-$TIMESTAMP.zip"
        log ""
        info "Plan:"
        info "  1. Create backup $(yellow "$zip_name") with all ${#backup_items[@]}$( [[ ${#preserve_items[@]} -gt 0 ]] && echo "+${#preserve_items[@]}" ) items"
        info "  2. Remove ${#backup_items[@]} v1 items from disk"
        [[ ${#preserve_items[@]} -gt 0 ]] && info "  3. Keep ${#preserve_items[@]} items on disk (backup only: .claude/docs/)"

        # Check settings files
        local step_num=$( [[ ${#preserve_items[@]} -gt 0 ]] && echo "4" || echo "3" )
        if [[ -f "$dir/.claude/settings.json" ]] && grep -q "morpheus" "$dir/.claude/settings.json" 2>/dev/null; then
            info "  $step_num. Clean morpheus hooks from .claude/settings.json"
        fi
        if [[ -f "$dir/.claude/settings.local.json" ]] && grep -q "morpheus" "$dir/.claude/settings.local.json" 2>/dev/null; then
            info "  $step_num. Clean morpheus hooks from .claude/settings.local.json"
        fi

        log ""
        warn "Dry run — no changes made. Run without --dry-run to execute."
        PROJECTS_SKIPPED=$((PROJECTS_SKIPPED + 1))
        return 0
    fi

    # --- Confirmation (skip with --yes) ---
    if [[ "$AUTO_YES" == "false" ]]; then
        log ""
        printf '  %s ' "$(yellow "?")"
        printf '%s ' "Proceed with migration of $(bold "$name")? [y/N] "
        read -r confirm
        if [[ "$confirm" != [yY] && "$confirm" != [yY][eE][sS] && "$confirm" != [sS][iI] ]]; then
            warn "Skipped by user"
            PROJECTS_SKIPPED=$((PROJECTS_SKIPPED + 1))
            return 0
        fi
    fi

    # --- Step 1: Create zip backup ---
    log ""
    info "Step 1/3: Creating backup..."
    local zip_name=".vibe-v1-backup-$TIMESTAMP.zip"
    local zip_path="$dir/$zip_name"

    local all_items=("${backup_items[@]}" "${preserve_items[@]}")

    (
        cd "$dir"
        zip -rq "$zip_name" "${all_items[@]}" 2>/dev/null || {
            err "Failed to create backup zip"
            return 1
        }
    )

    local zip_size
    zip_size=$(du -h "$zip_path" | cut -f1)
    ok "Backup created: $(green "$zip_name") ($zip_size)"

    # --- Step 2: Remove v1 items ---
    info "Step 2/3: Removing v1 framework files..."
    local removed=0
    for item in "${backup_items[@]}"; do
        local target="$dir/$item"
        if [[ -d "$target" ]]; then
            rm -rf "$target"
            ok "  Removed directory: $item"
            removed=$((removed + 1))
        elif [[ -f "$target" ]]; then
            rm -f "$target"
            ok "  Removed file: $item"
            removed=$((removed + 1))
        fi
    done

    for item in "${preserve_items[@]}"; do
        dim "    ↳ Kept: $item (safe in backup zip)"
        echo
    done

    ok "Removed $removed v1 items"

    # --- Step 3: Clean settings files ---
    info "Step 3/3: Cleaning configuration..."
    local clean_output
    clean_output=$(clean_settings_files "$dir")
    while IFS= read -r line; do
        local status="${line%%:*}"
        local label="${line#*:}"
        case "$status" in
            cleaned)   ok "  Cleaned morpheus hooks from .claude/$label" ;;
            no-change) ok "  .claude/$label — no morpheus references" ;;
            dry-run)   ;;  # already logged by _clean_single_settings_file
        esac
    done <<< "$clean_output"

    # Clean up empty .claude/ if everything was removed
    if [[ -d "$dir/.claude" ]]; then
        find "$dir/.claude" -type d -empty -delete 2>/dev/null || true
    fi

    log ""
    ok "Migration complete for $(bold "$name")"
    PROJECTS_MIGRATED=$((PROJECTS_MIGRATED + 1))
}

# --- Main -----------------------------------------------------------------

main() {
    # Parse arguments
    local targets=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)   DRY_RUN=true;    shift ;;
            --yes|-y)    AUTO_YES=true;    shift ;;
            --no-color)  USE_COLOR=false;  shift ;;
            --scan)      SCAN_DIR="$2";    shift 2 ;;
            --deep)      DEEP_SCAN=true;   shift ;;
            --keep-docs) shift ;;  # docs are kept by default, flag is a no-op for clarity
            --help|-h)   usage ;;
            --version)   log "vibe-v1-cleanup $VERSION"; exit 0 ;;
            -*)          err "Unknown option: $1"; usage ;;
            *)           targets+=("$1"); shift ;;
        esac
    done

    # Header
    log ""
    log "$(bold "VIBE Framework v1 → v2 Cleanup") $(dim "v$VERSION")"
    log "$(dim "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")"
    $DRY_RUN && log "$(yellow "DRY RUN — no changes will be made")"

    # Check dependencies
    if ! command -v zip &>/dev/null; then
        err "zip is required but not installed"
        err "Install it with: sudo pacman -S zip  (Arch) / sudo apt install zip  (Debian)"
        exit 1
    fi

    # Determine targets
    if [[ -n "$SCAN_DIR" ]]; then
        if [[ ! -d "$SCAN_DIR" ]]; then
            err "Scan directory not found: $SCAN_DIR"
            exit 1
        fi
        log ""
        if $DEEP_SCAN; then
            info "Deep scanning $(bold "$SCAN_DIR") for v1 projects..."
        else
            info "Scanning $(bold "$SCAN_DIR") for v1 projects..."
        fi

        # Collect candidate directories
        _add_scan_targets() {
            local search_dir="$1"
            for subdir in "$search_dir"/*/; do
                [[ -d "$subdir" ]] || continue
                local base
                base=$(basename "$subdir")
                # Skip hidden dirs, framework itself, and v1 backup dirs
                [[ "$base" == .* ]] && continue
                [[ "$base" == "VIBE_FRAMEWORK" ]] && continue
                [[ "$base" == "vibe-framework-v1-backup" ]] && continue
                [[ "$base" == "tna-website-v1-framework-backup" ]] && continue
                [[ "$base" == node_modules ]] && continue
                targets+=("${subdir%/}")

                # In deep mode, also scan subdirectories (nested projects)
                if $DEEP_SCAN; then
                    for nested in "$subdir"/*/; do
                        [[ -d "$nested" ]] || continue
                        local nested_base
                        nested_base=$(basename "$nested")
                        [[ "$nested_base" == .* ]] && continue
                        [[ "$nested_base" == node_modules ]] && continue
                        # Only add if it has a .claude/ dir (likely a project)
                        [[ -d "$nested/.claude" ]] && targets+=("${nested%/}")
                    done
                fi
            done
        }
        _add_scan_targets "$SCAN_DIR"

        # Also scan worktree directories (both patterns used by v1)
        for project_dir in "$SCAN_DIR"/*/; do
            [[ -d "$project_dir" ]] || continue
            local pbase
            pbase=$(basename "$project_dir")
            [[ "$pbase" == .* ]] && continue

            # Pattern 1: .worktrees/<name>/ (git worktrees)
            if [[ -d "$project_dir/.worktrees" ]]; then
                for wt in "$project_dir"/.worktrees/*/; do
                    [[ -d "$wt" ]] && targets+=("${wt%/}")
                done
            fi

            # Pattern 2: .claude/worktrees/<name>/ (claude worktrees)
            if [[ -d "$project_dir/.claude/worktrees" ]]; then
                for wt in "$project_dir"/.claude/worktrees/*/; do
                    [[ -d "$wt" ]] && targets+=("${wt%/}")
                done
            fi
        done

        # Deduplicate targets
        local unique_targets=()
        local seen=""
        for t in "${targets[@]}"; do
            local abs
            abs=$(cd "$t" 2>/dev/null && pwd) || continue
            if [[ "$seen" != *"|$abs|"* ]]; then
                unique_targets+=("$abs")
                seen+="|$abs|"
            fi
        done
        targets=("${unique_targets[@]}")

        info "Found ${#targets[@]} directories to check"
    elif [[ ${#targets[@]} -eq 0 ]]; then
        # Default: current directory
        targets+=("$(pwd)")
    fi

    # Resolve to absolute paths (scan mode already resolved, but CLI args may be relative)
    local resolved=()
    for t in "${targets[@]}"; do
        resolved+=("$(cd "$t" 2>/dev/null && pwd || echo "$t")")
    done

    # Process each target
    for target in "${resolved[@]}"; do
        migrate_project "$target"
    done

    # Summary
    log ""
    log "$(bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")"
    log "$(bold "Summary")"

    if [[ $PROJECTS_FOUND -eq 0 ]] && [[ $PROJECTS_CLEAN -gt 0 ]]; then
        ok "All $PROJECTS_CLEAN projects are already clean"
    else
        [[ $PROJECTS_MIGRATED -gt 0 ]] && ok "Migrated: $PROJECTS_MIGRATED"
        [[ $PROJECTS_SKIPPED -gt 0 ]]  && warn "Skipped (dry run): $PROJECTS_SKIPPED"
        [[ $PROJECTS_CLEAN -gt 0 ]]    && ok "Already clean: $PROJECTS_CLEAN"
    fi

    if $DRY_RUN && [[ $PROJECTS_FOUND -gt 0 ]]; then
        log ""
        info "Run without $(yellow "--dry-run") to apply changes"
    fi

    if [[ $PROJECTS_MIGRATED -gt 0 ]]; then
        log ""
        info "Next step: open each migrated project and run $(bold "/vibe:setup")"
        info "to generate a fresh v2-compatible CLAUDE.md"
    fi

    log ""
}

main "$@"

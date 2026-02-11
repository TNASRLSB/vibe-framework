#!/usr/bin/env bash
# Audit all skills: line counts, word counts, structure verification.
#
# Usage:
#   bash audit-skills.sh [skills_dir]
#   bash audit-skills.sh --help
#
# Arguments:
#   skills_dir    Path to skills directory (default: .claude/skills)
#   --help, -h    Show this help message
#   --json        Output as JSON (default: table)
#
# Output:
#   Table or JSON with per-skill metrics:
#   - SKILL.md lines and words
#   - Number of references, scripts, templates
#   - Has frontmatter (yes/no)
#   - Description word count
#
# Exit codes:
#   0 - Success
#   1 - Skills directory not found

set -euo pipefail

# Defaults
SKILLS_DIR=".claude/skills"
OUTPUT_FORMAT="table"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            head -20 "$0" | grep '^#' | sed 's/^# \?//'
            exit 0
            ;;
        --json)
            OUTPUT_FORMAT="json"
            shift
            ;;
        *)
            SKILLS_DIR="$1"
            shift
            ;;
    esac
done

# Verify directory
if [[ ! -d "$SKILLS_DIR" ]]; then
    echo "Error: Skills directory not found: $SKILLS_DIR" >&2
    exit 1
fi

# Collect data
declare -a RESULTS=()

for skill_dir in "$SKILLS_DIR"/*/; do
    [[ -d "$skill_dir" ]] || continue

    skill_name=$(basename "$skill_dir")
    skill_md="$skill_dir/SKILL.md"

    # SKILL.md metrics
    if [[ -f "$skill_md" ]]; then
        lines=$(wc -l < "$skill_md")
        words=$(wc -w < "$skill_md")
        has_frontmatter="no"
        if head -1 "$skill_md" | grep -q '^---'; then
            has_frontmatter="yes"
        fi

        # Description word count (from frontmatter)
        desc_words=0
        if [[ "$has_frontmatter" == "yes" ]]; then
            desc_line=$(sed -n '/^description:/,/^[a-z]/p' "$skill_md" | head -1)
            if [[ -n "$desc_line" ]]; then
                desc_words=$(echo "$desc_line" | wc -w)
            fi
        fi
    else
        lines=0
        words=0
        has_frontmatter="no"
        desc_words=0
    fi

    # Count resources
    ref_count=0
    if [[ -d "$skill_dir/references" ]]; then
        ref_count=$(find "$skill_dir/references" -name "*.md" -type f 2>/dev/null | wc -l)
    fi

    script_count=0
    if [[ -d "$skill_dir/scripts" ]]; then
        script_count=$(find "$skill_dir/scripts" -type f \( -name "*.py" -o -name "*.sh" \) 2>/dev/null | wc -l)
    fi

    template_count=0
    if [[ -d "$skill_dir/templates" ]]; then
        template_count=$(find "$skill_dir/templates" -type f 2>/dev/null | wc -l)
    fi

    # Size assessment
    size_status="OK"
    if [[ $words -gt 5000 ]]; then
        size_status="TOO_LARGE"
    elif [[ $words -gt 3000 ]]; then
        size_status="LARGE"
    fi

    RESULTS+=("$skill_name|$lines|$words|$has_frontmatter|$desc_words|$ref_count|$script_count|$template_count|$size_status")
done

# Output
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    echo "["
    first=true
    for result in "${RESULTS[@]}"; do
        IFS='|' read -r name lines words fm desc refs scripts templates size <<< "$result"
        if [[ "$first" == true ]]; then
            first=false
        else
            echo ","
        fi
        printf '  {"name":"%s","lines":%s,"words":%s,"has_frontmatter":"%s","desc_words":%s,"references":%s,"scripts":%s,"templates":%s,"size_status":"%s"}' \
            "$name" "$lines" "$words" "$fm" "$desc" "$refs" "$scripts" "$templates" "$size"
    done
    echo ""
    echo "]"
else
    # Table output
    printf "%-15s %6s %6s %4s %5s %4s %4s %4s %s\n" \
        "SKILL" "LINES" "WORDS" "FM" "DESC" "REFS" "SCPT" "TMPL" "SIZE"
    printf "%-15s %6s %6s %4s %5s %4s %4s %4s %s\n" \
        "---------------" "------" "------" "----" "-----" "----" "----" "----" "----------"

    for result in "${RESULTS[@]}"; do
        IFS='|' read -r name lines words fm desc refs scripts templates size <<< "$result"
        printf "%-15s %6s %6s %4s %5s %4s %4s %4s %s\n" \
            "$name" "$lines" "$words" "$fm" "$desc" "$refs" "$scripts" "$templates" "$size"
    done

    echo ""
    echo "FM=Frontmatter, DESC=Description words, REFS=References, SCPT=Scripts, TMPL=Templates"
    echo "SIZE: OK=<3000w, LARGE=3000-5000w, TOO_LARGE=>5000w"
fi

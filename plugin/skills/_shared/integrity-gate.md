# Integrity Gate Protocol

Shared protocol for skill-level completion verification. Referenced by all VIBE skills at their delivery phase.

---

## How It Works

Before declaring any phase or deliverable complete, run verification commands that produce `VIBE_GATE` markers. These markers end up in the transcript as real Bash tool output — they cannot be fabricated because the Bash tool actually executes the commands.

The completion sentinel (Stop hook) reads the transcript to find these markers and compares them against your completion claims.

---

## Running Verification

For each check defined in your skill's verification block, run a Bash command that outputs a `VIBE_GATE` marker:

```bash
echo "VIBE_GATE: {check_name}={value}"
```

The value MUST come from a real command substitution, not from your knowledge or estimation:

```bash
echo "VIBE_GATE: screenshot_count=$(ls /tmp/vibe-cr/*.png 2>/dev/null | wc -l | tr -d ' ')"
echo "VIBE_GATE: json_entries=$(jq 'length' .vibe/competitor-research/competitors.json 2>/dev/null || echo 0)"
echo "VIBE_GATE: empty_files=$(find /tmp/vibe-cr/ -name '*.png' -empty 2>/dev/null | wc -l | tr -d ' ')"
echo "VIBE_GATE: h1_count=$(grep -c '<h1' output.html 2>/dev/null || echo 0)"
echo "VIBE_GATE: contrast_min=$(node -e 'console.log(minContrast)' 2>/dev/null || echo 0)"
```

Run ALL verification commands defined in the skill's block. Do not run a subset.

---

## Interpreting Results

After running all verification commands, compare each marker's value against the expected value defined by the skill.

**If ANY marker shows a value different from expected:**
- Report the exact discrepancy with numbers: "screenshot_count=14, expected 20"
- Do NOT proceed to the next phase
- Complete the missing work or report: "I completed X of Y. The missing items are: [list]"

**If ALL markers match expected values:**
- Proceed to the next phase

---

## Rules

- The value after `=` MUST be from `$(command)` substitution — never hardcode
- Run verification commands in a SINGLE Bash call (one `echo` per marker, all together)
- If a command fails, output the error: `echo "VIBE_GATE: check_name=ERROR: description"`
- `14 ≠ 20`. `18 ≠ 20`. Only `20 == 20`. No rounding, no "close enough"
- `SKIPPED` or `ERROR` markers count as failures — incomplete verification is not passing verification
- If you cannot determine the expected value, state what you found and let the user decide

---

## Example Verification Block (for reference)

A skill's verification block looks like this:

```markdown
### Verification Block

Run these commands before proceeding to Phase N:

    echo "VIBE_GATE: item_count=$(ls output/*.json 2>/dev/null | wc -l | tr -d ' ')"
    echo "VIBE_GATE: total_entries=$(jq '[.[] | length] | add' output/data.json 2>/dev/null || echo 0)"
    echo "VIBE_GATE: empty_check=$(find output/ -empty 2>/dev/null | wc -l | tr -d ' ')"

Expected values:
- item_count: [N] (number of items processed)
- total_entries: [M] (total data points extracted)
- empty_check: 0 (no empty output files)
```

The skill defines WHAT to check. This protocol defines HOW to run the checks and report results.

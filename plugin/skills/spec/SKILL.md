---
name: spec
description: Intelligent spec routing — classifies user request (creative vs instruction-heavy) and dispatches spec writing to the optimal Opus model variant. Output is plan-for-executor ready for Sonnet 4.6 execution.
effort: xhigh
model:
  primary: opus-4-7
  effort: xhigh
whenToUse: "When user asks for a spec, plan, or requirements document. Examples: '/vibe:spec Add authentication middleware with session tokens', '/vibe:spec Design a landing page for X'."
argumentHint: "<user request describing what to spec>"
maxTokenBudget: 30000
---

# /vibe:spec — Intelligent Spec Routing

You are the entry point for `/vibe:spec`. Your job: route the user's spec request to the best Opus variant (4.6 for instruction-heavy, 4.7 for creative) and in the right output mode (single-doc vs split spec+plan), then invoke `claude -p` with the spec-writer prompt template.

Check `$ARGUMENTS`: if empty or missing, emit usage help and stop:

```
Usage: /vibe:spec <request>
Examples:
  /vibe:spec Add email verification to the signup flow
  /vibe:spec Design the InferenceBox landing page
  /vibe:spec Refactor the auth module to use JWT

The skill classifies your request, picks the best Opus variant, and
writes the spec + plan document to docs/plans/. You then review and
dispatch execution.
```

Otherwise proceed through Steps 1-5.

---

## Step 1: Classify the request

Run the hybrid classifier:

```bash
CLASSIFICATION=$(bash "${CLAUDE_PLUGIN_ROOT}/skills/spec/scripts/classifier.sh" "$ARGUMENTS")
MODEL=$(echo "$CLASSIFICATION" | jq -r '.model')
MODE=$(echo "$CLASSIFICATION" | jq -r '.mode')
METHOD=$(echo "$CLASSIFICATION" | jq -r '.method')
CONFIDENCE=$(echo "$CLASSIFICATION" | jq -r '.confidence')
```

Log the classification for transparency:

```
spec classified:
  model:      <MODEL>
  mode:       <MODE>
  method:     <METHOD>
  confidence: <CONFIDENCE>
```

If `method == "env-override"`, note to user: *"Classifier bypassed via VIBE_SPEC_FORCE_MODEL."*

If `confidence < 0.6` and user hasn't set `VIBE_SPEC_FORCE_MODEL`, present a soft confirmation:
> *Classifier confidence is low (<CONFIDENCE>). Proceeding with <MODEL> based on <METHOD>. Override with `VIBE_SPEC_FORCE_MODEL=<model-id>` if this looks wrong.*

Proceed.

## Step 2: Resolve output paths

```bash
DATE=$(date +%Y-%m-%d)

# Derive kebab-case slug from first 50 chars of argument
SLUG=$(echo "$ARGUMENTS" \
    | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9' '-' \
    | sed 's/^-//;s/-$//' \
    | cut -c1-50 \
    | sed 's/-$//')

# Guard: empty or too-short slug
if [[ -z "$SLUG" ]] || [[ ${#SLUG} -lt 3 ]]; then
    SLUG="spec-$(date +%H%M%S)"
fi

OUT_DIR="docs/plans"
mkdir -p "$OUT_DIR"
```

## Step 3: Build prompt context

```bash
TEMPLATE="${CLAUDE_PLUGIN_ROOT}/skills/spec/references/spec-writer-prompt.md"

if [[ ! -f "$TEMPLATE" ]]; then
    echo "ERROR: spec-writer-prompt.md template not found at $TEMPLATE"
    echo "Plugin installation may be broken. Run /vibe:setup to verify."
    exit 1
fi

# Substitute placeholders
PROMPT=$(sed \
    -e "s|{{USER_REQUEST}}|$(echo "$ARGUMENTS" | sed 's|[\\|&]|\\&|g')|g" \
    -e "s|{{MODE}}|$MODE|g" \
    -e "s|{{DATE}}|$DATE|g" \
    -e "s|{{SLUG}}|$SLUG|g" \
    "$TEMPLATE")
```

## Step 4: Dispatch spec-writer via CLI

```bash
if [[ "$MODE" == "single" ]]; then
    OUT_FILE="$OUT_DIR/$DATE-$SLUG.md"
    echo "Dispatching $MODEL for single-doc spec..."
    echo "$PROMPT" \
        | claude -p --model "$MODEL" --effort xhigh --thinking-display summarized \
        > "$OUT_FILE"
    echo "Single-doc written: $OUT_FILE"
else
    # Split mode: writer outputs combined, we split by section header
    COMBINED_FILE="$OUT_DIR/$DATE-$SLUG-combined.md"
    OUT_SPEC="$OUT_DIR/$DATE-$SLUG-spec.md"
    OUT_PLAN="$OUT_DIR/$DATE-$SLUG-plan.md"

    echo "Dispatching $MODEL for split-mode spec+plan..."
    echo "$PROMPT" \
        | claude -p --model "$MODEL" --effort xhigh --thinking-display summarized \
        > "$COMBINED_FILE"

    # Split on first "# Execution Plan" heading
    python3 - "$COMBINED_FILE" "$OUT_SPEC" "$OUT_PLAN" <<'PYEOF'
import re, sys, os
combined_path, spec_path, plan_path = sys.argv[1], sys.argv[2], sys.argv[3]
with open(combined_path) as f:
    content = f.read()
parts = re.split(r'^# Execution Plan', content, maxsplit=1, flags=re.MULTILINE)
if len(parts) == 2:
    with open(spec_path, "w") as f:
        f.write(parts[0].rstrip() + "\n")
    with open(plan_path, "w") as f:
        f.write("# Execution Plan" + parts[1])
    os.unlink(combined_path)
    print(f"Split-doc written: {spec_path} + {plan_path}")
else:
    # Fallback: writer didn't split; treat combined as single-doc
    os.rename(combined_path, spec_path.replace("-spec.md", ".md"))
    print(f"Writer produced monolithic output; saved as single-doc: {spec_path.replace('-spec.md', '.md')}")
PYEOF
fi
```

## Step 5: Surface output paths to user

```bash
echo ""
echo "=== Spec generation complete ==="
ls -la "$OUT_DIR/$DATE-$SLUG"* 2>/dev/null
echo ""
echo "Review the file(s) above, then dispatch execution via:"
echo "  - superpowers:subagent-driven-development (recommended for plans with [dispatchable:sonnet-4-6] markers)"
echo "  - superpowers:executing-plans (inline execution)"
```

---

## Env Overrides

- `VIBE_SPEC_FORCE_MODEL=<model-id>` — bypass classifier, force specific model. Valid values: `opus-4-7`, `opus-4-6`, `sonnet-4-6`, `haiku-4-5`, or any valid Claude model ID. Logged in classifier output (`method: env-override`).

## Failure Modes

- **Classifier returns invalid model** → never occurs; classifier always falls back to `opus-4-7` on any error (decision #2).
- **LLM fallback network failure** → classifier emits `method: fallback`, model: `opus-4-7`, confidence 0.5.
- **Split mode but writer produces monolithic output** → Step 4's Python fallback renames combined to single-doc.
- **Empty or too-short slug from user argument** → Step 2 generates `spec-HHMMSS` slug.
- **Template file missing** → Step 3 errors out with actionable message; user runs `/vibe:setup` to reinstall.

## Next Steps After Output

The main session now has path(s) to the generated spec. Recommended flow:
1. Review the spec inline (read the file, check plan-for-executor discipline)
2. Make edits if needed (author-first, model-second)
3. Dispatch execution: for plans with mixed `[dispatchable:sonnet-4-6]` markers, use `superpowers:subagent-driven-development`

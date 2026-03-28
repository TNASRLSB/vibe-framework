# Model Validation Protocol

Structured A/B testing framework for comparing model performance across VIBE skills.
Use when changing model assignments, evaluating new models, or recalibrating after model updates.

---

## How It Works

1. **Pick a test case** from `test-cases.md` for the skill you want to validate
2. **Run the task twice** — once with Model A, once with Model B (change the frontmatter)
3. **Blind judge** — an Opus evaluator scores both outputs without knowing which model produced which
4. **Record results** — save the comparison in `results/`

The protocol is designed to be model-agnostic. When new models ship, rerun the relevant test cases.

---

## Running a Validation

### Step 1: Select Test Case

Open `test-cases.md`, find the skill and test case you want to run.

### Step 2: Set Model A

Edit the skill's `SKILL.md` (or agent `.md`) frontmatter:
```yaml
model: opus  # or whatever Model A is
```

Run the test case. Save the full output to a file:
```
results/YYYY-MM-DD_[skill]_[model-a].md
```

### Step 3: Set Model B

Change the frontmatter to Model B:
```yaml
model: sonnet  # or whatever Model B is
```

Run the same test case with identical input. Save to:
```
results/YYYY-MM-DD_[skill]_[model-b].md
```

### Step 4: Restore Original Model

Set the frontmatter back to the production model assignment.

### Step 5: Blind Judge

In a fresh Claude session (Opus), paste both outputs **without revealing which model produced which** and ask:

```
I have two outputs for the same task. Evaluate each against these criteria:
[paste criteria from the test case]

Score each output 1-5 on each dimension. Then declare which is better overall,
or if they are equivalent (difference ≤ 0.5 average).

Output A:
[paste Model A output]

Output B:
[paste Model B output]
```

### Step 6: Record Results

Save the judge's evaluation in `results/` using the template in `result-template.md`.

---

## Decision Rules

| Outcome | Action |
|---------|--------|
| Equivalent (≤ 0.5 avg diff) | Use the cheaper/faster model |
| Model A wins by 0.5-1.0 | Consider context: is the quality gap on critical dimensions? |
| Model A wins by > 1.0 | Keep the better model |
| Split (each wins different dimensions) | Evaluate which dimensions matter more for the skill's purpose |

---

## When to Run Validation

- **Model tiering change** — before switching a skill's model in production
- **New model release** — test all skills against the new model
- **Quality complaint** — when users report degraded output on a specific skill
- **Quarterly recalibration** — periodic check that assignments still hold

---

## Tips

- Run each test case **3 times** per model to reduce variance from randomness
- Use the same temperature/seed if available
- For skills with web search, use cached competitor research to remove external variability
- The blind judge should always be the most capable available model (currently Opus)

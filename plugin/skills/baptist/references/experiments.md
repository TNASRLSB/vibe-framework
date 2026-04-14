# A/B Experiment Design Reference

This document provides in-depth experiment design guidance. Baptist's SKILL.md references this during test planning and design.

---

## Hypothesis Format

A proper hypothesis is specific, measurable, and tied to a CRO framework.

### Template

> "If we [specific change], then [primary metric] will [direction] by [estimated magnitude], because [reason linked to B=MAP factor]."

### Anatomy

| Component | Purpose | Bad Example | Good Example |
|-----------|---------|-------------|-------------|
| **Change** | What you're testing | "Improve the page" | "Replace the 6-field form with a 3-field form (email, name, company)" |
| **Metric** | How you measure | "Conversions" | "Form completion rate" |
| **Direction** | Expected effect | "Go up" | "Increase by 15-25%" |
| **Magnitude** | Expected size | Omitted | "15-25% relative lift" |
| **Reason** | Why you believe this | "It's better" | "Reducing fields improves Ability by lowering cognitive load and time investment" |

### Magnitude Estimation

Base your estimates on the type of change:

| Change Type | Typical Lift Range |
|-------------|-------------------|
| Copy-only (headline, CTA text) | 5-15% |
| Layout reorder (same elements, different arrangement) | 5-20% |
| Element removal (reducing friction) | 10-30% |
| New element addition (social proof, trust signals) | 5-15% |
| Complete section redesign | 15-40% |
| Full page redesign | 20-50%+ (but high variance) |

These are rough guides. Confidence should reflect how well-supported the estimate is.

---

## Control vs Variant

### The Control

The control (A) is always the current live version, unchanged. Never modify the control during a test.

**Rules:**
- Screenshot and document the control before starting
- Ensure the control code is frozen (no deploys that change it mid-test)
- If a critical bug is found in the control, abort the test, fix it, restart

### The Variant

The variant (B) changes exactly ONE variable from the control.

**Rules:**
- Change one thing at a time. If you change headline AND image AND CTA, you cannot attribute the result.
- Document the exact change with before/after comparisons
- The variant should be technically equivalent in load time and functionality (except for the intentional change)

### When to Use Multivariate (MVT)

Multivariate testing (testing multiple variables simultaneously) is appropriate only when:
- Traffic volume is very high (10x what an A/B test needs)
- You need to understand interaction effects between variables
- You have a mature testing program

**For most cases, sequential A/B tests are better than MVT.** They are faster to reach significance and easier to interpret.

---

## Sample Size Calculation

### The Formula

For a two-proportion z-test:

```
n = (Z_α/2 + Z_β)² × [p₁(1-p₁) + p₂(1-p₂)] / (p₂ - p₁)²
```

Where:
- `n` = required sample size per variation
- `Z_α/2` = z-score for significance level (1.96 for 95%)
- `Z_β` = z-score for power (0.84 for 80%)
- `p₁` = baseline conversion rate
- `p₂` = expected conversion rate (baseline × (1 + MDE))
- `MDE` = minimum detectable effect (relative)

### Quick Reference Table

For 95% significance and 80% power:

| Baseline Rate | MDE 5% | MDE 10% | MDE 15% | MDE 20% | MDE 25% |
|---------------|--------|---------|---------|---------|---------|
| 1% | 636,000 | 159,800 | 71,400 | 40,400 | 26,000 |
| 2% | 312,400 | 78,800 | 35,400 | 20,000 | 12,900 |
| 3% | 204,200 | 51,600 | 23,200 | 13,200 | 8,500 |
| 5% | 118,600 | 30,100 | 13,600 | 7,700 | 5,000 |
| 10% | 55,200 | 14,100 | 6,400 | 3,700 | 2,400 |
| 15% | 34,200 | 8,800 | 4,000 | 2,300 | 1,500 |
| 20% | 24,200 | 6,200 | 2,800 | 1,600 | 1,100 |
| 30% | 14,200 | 3,700 | 1,700 | 1,000 | 660 |

**Numbers are per variation.** For a standard A/B test, multiply by 2 for total traffic needed.

### Minimum Detectable Effect (MDE)

Choose your MDE based on business impact:

- **5% MDE:** Requires enormous sample. Only worthwhile for high-volume pages where small lifts = big revenue.
- **10% MDE:** Reasonable for most mature tests.
- **15-20% MDE:** Good starting point for most teams. Balances sensitivity with practical test duration.
- **25%+ MDE:** Only detects large effects. Appropriate for bold changes or low-traffic pages.

**Rule:** If you can't reach the required sample size within 4 weeks, increase your MDE or make a bolder change.

---

## Test Duration

### Minimum Duration Rules

1. **At least 2 full business cycles** (typically 2 weeks for B2B, 1 week for B2C)
2. **Must include weekdays and weekends** (behavior differs)
3. **Must reach required sample size** (see table above)
4. **Maximum 8 weeks** — beyond this, external factors introduce too much noise

### Duration Calculation

```
Duration (days) = Required sample size (total) / Daily traffic to test page
```

**Example:**
- Baseline conversion: 5%
- MDE: 15%
- Required sample: 13,600 per variation × 2 = 27,200 total
- Daily traffic: 1,000 visitors/day
- Duration: 27,200 / 1,000 = ~28 days (round up to 4 full weeks)

### When Traffic Is Too Low

If the calculated duration exceeds 8 weeks:

1. **Increase MDE** — test a bolder change that would produce a larger effect
2. **Combine pages** — if testing a pattern across multiple pages, pool them
3. **Use qualitative methods instead** — 5 usability tests can reveal more than an underpowered A/B test
4. **Bandit testing** — for optimization (not learning), multi-armed bandit algorithms can converge faster

---

## Common Mistakes

### 1. Stopping Early ("Peeking")

**The problem:** Checking results daily and stopping when p < 0.05. This inflates false positive rates dramatically — a test checked daily has a 30%+ false positive rate at nominal 5%.

**The fix:** Pre-commit to sample size and duration. Do not look at results until the commitment is met. If you must monitor, use sequential testing methods (alpha spending) that adjust for peeking.

### 2. Testing Too Many Things at Once

**The problem:** Changing headline, image, CTA, layout, and color simultaneously. If the variant wins, you don't know which change drove it. If it loses, you don't know if one change helped but was outweighed by another.

**The fix:** One change per test. If you have 5 ideas, run 5 sequential tests (prioritized by ICE score). You'll learn more and faster.

### 3. Running Underpowered Tests

**The problem:** Testing with insufficient traffic. Results are either inconclusive (wasted time) or misleading (detecting noise as signal).

**The fix:** Calculate sample size BEFORE starting. If you can't reach it, don't run the test — use qualitative methods or make a bolder change.

### 4. Ignoring Segments

**The problem:** Declaring a winner based on overall results when different segments have opposite responses. Mobile users may hate the variant while desktop users love it.

**The fix:** Always check results by key segments: device, traffic source, new vs returning, geography.

### 5. Testing Low-Impact Elements

**The problem:** Spending 3 weeks testing button color when the value proposition is unclear.

**The fix:** Use ICE scoring. Test high-impact changes first. Copy and content almost always outperform cosmetic changes.

### 6. No Documented Hypothesis

**The problem:** "Let's see if this works" with no prediction. This makes it impossible to learn, even from losses.

**The fix:** Write the hypothesis BEFORE designing the variant. Include the expected magnitude. After the test, compare prediction vs reality — this calibrates your future intuition.

### 7. Cherry-Picking Metrics

**The problem:** The primary metric didn't move, but a secondary metric improved, so you declare victory.

**The fix:** Define the primary metric before the test starts. Secondary metrics provide context and guard rails, but do not determine the winner. If the primary metric is flat and a secondary metric improved, that's an insight for the next test — not a win.

### 8. Novelty and Primacy Effects

**The problem:** A dramatic change may win initially because returning users notice and engage with it (novelty), then revert to baseline after a few weeks.

**The fix:** Run tests long enough to account for this (minimum 2 business cycles). For major redesigns, check if the lift holds in weeks 3-4 vs weeks 1-2.

---

## Test Documentation Template

```markdown
## Experiment: [Name]

### Hypothesis
If we [change], then [metric] will [direction] by [magnitude],
because [B=MAP reason].

### Setup
- **Control:** [Description of current state]
- **Variant:** [Exact description of change]
- **Primary metric:** [The one metric that decides]
- **Secondary metrics:** [Guard rail metrics]
- **Segments to check:** [device, source, etc.]

### Requirements
- **Baseline conversion rate:** [X%]
- **Minimum detectable effect:** [Y%]
- **Required sample size:** [N per variation]
- **Traffic split:** [50/50]
- **Minimum duration:** [Z days/weeks]
- **Start date:** [Date]
- **End date (committed):** [Date]

### Results
- **Control conversion:** [X%] (n=[N])
- **Variant conversion:** [Y%] (n=[N])
- **Relative lift:** [Z%]
- **p-value:** [X]
- **95% CI for difference:** [lower, upper]
- **Decision:** [Ship / Iterate / Discard]

### Segment Results
| Segment | Control | Variant | Lift | Significant? |
|---------|---------|---------|------|-------------|
| | | | | |

### Learnings
- [What did we learn about our users?]
- [How does this update our B=MAP model?]
- [What should we test next?]
```

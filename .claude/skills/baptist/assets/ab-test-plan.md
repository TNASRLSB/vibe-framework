# A/B Test Plan: [Test Name]

**Date**: YYYY-MM-DD
**Owner**: [Name]
**Status**: Draft / Approved / Running / Completed

---

## Hypothesis

```
Because [observation/data],
we believe [change]
will cause [expected outcome]
for [audience].
We'll know this is true when [metric criteria].
```

**Fogg diagnosis**: Is this a Motivation / Ability / Prompt problem?

---

## Test Design

| Parameter | Value |
|---|---|
| Test type | A/B / A/B/n / MVT |
| Baseline CVR | % |
| MDE (minimum detectable effect) | % relative lift |
| Sample size per variant | [calculated] |
| Total traffic needed | [calculated] |
| Estimated duration | [days/weeks] |
| Traffic allocation | 50/50 |
| Confidence level | 95% |
| Statistical power | 80% |

---

## Variants

### Control (A)
- **Description**: Current experience
- **Screenshot/mockup**: [attach]

### Variant (B)
- **Description**: [Specific change]
- **Screenshot/mockup**: [attach]
- **Hypothesis link**: Why this should win

---

## Metrics

### Primary Metric
- **Metric**: [name]
- **Definition**: [how measured]
- **Success criteria**: [what constitutes a win]

### Secondary Metrics
- [ ] [Metric 1]: [why tracking]
- [ ] [Metric 2]: [why tracking]

### Guardrail Metrics (must NOT get worse)
- [ ] [Metric 1]: [threshold for concern]
- [ ] [Metric 2]: [threshold for concern]

---

## Integrity Checks

- [ ] SRM check scheduled (day 1 and day 3)
- [ ] A/A validation completed (or scheduled)
- [ ] Contamination prevention: [how ensuring same user sees same variant]
- [ ] Change control: [other changes frozen during test?]
- [ ] Tracking verified: [events firing correctly?]
- [ ] Consent-mode behavior understood

---

## Implementation

| Detail | Value |
|---|---|
| Method | Client-side / Server-side |
| Tool | [Platform name] |
| Dev requirements | [If any] |
| QA completed | Yes / No |

---

## Pre-Registration

**This document was completed BEFORE the test launched.**

- [ ] Hypothesis documented
- [ ] Primary metric defined
- [ ] Sample size calculated
- [ ] Duration estimated
- [ ] Variants approved
- [ ] Guardrails set
- [ ] Stakeholders informed

---

## Results (fill after test completes)

| Metric | Control | Variant | Lift | Confidence |
|---|---|---|---|---|
| Primary: | | | | |
| Secondary 1: | | | | |
| Secondary 2: | | | | |
| Guardrail 1: | | | | |

### Decision
- [ ] Winner: Implement variant
- [ ] Loser: Keep control
- [ ] Inconclusive: Need more traffic or bolder test
- [ ] Mixed: Requires segment analysis

### Learnings
- What we learned:
- What surprised us:
- What to test next:

---

## Orchestration

| Fix needed | Owner | Status |
|---|---|---|
| [Copy change] | Ghostwriter | |
| [UI change] | Seurat | |
| [Test design] | Baptist | |

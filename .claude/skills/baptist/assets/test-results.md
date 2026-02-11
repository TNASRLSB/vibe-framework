# Test Results: [Test Name]

**Test ID**: [ID in testing tool]
**Date**: YYYY-MM-DD to YYYY-MM-DD
**Owner**: [Name]

---

## Test Summary

| Parameter | Value |
|---|---|
| Hypothesis | [Brief] |
| Test type | A/B / A/B/n / MVT |
| Duration | [days] |
| Sample size (target) | [per variant] |
| Sample size (achieved) | [per variant] |
| Traffic allocation | 50/50 |

---

## Variants

### Control (A)
- **Description**: [Current experience]

### Variant (B)
- **Description**: [What was changed]

---

## Results

### Primary Metric

| Variant | Value | Lift | Confidence | Significant? |
|---|---|---|---|---|
| Control | | — | — | — |
| Variant B | | % | % | Yes / No |

### Secondary Metrics

| Metric | Control | Variant | Lift | Significant? |
|---|---|---|---|---|
| | | | | |
| | | | | |

### Guardrail Metrics

| Metric | Control | Variant | Change | Concern? |
|---|---|---|---|---|
| | | | | No / Yes |
| | | | | No / Yes |

---

## Integrity Checks

- [ ] SRM check: Pass / Fail (ratio: )
- [ ] Full sample size reached: Yes / No
- [ ] Minimum duration met: Yes / No
- [ ] No external factors during test: Yes / No (if no, describe: )
- [ ] Tracking verified: Yes / No

---

## Decision

- [ ] **Winner**: Implement variant → [action plan]
- [ ] **Loser**: Keep control → [why it lost]
- [ ] **Inconclusive**: [next steps — more traffic? bolder test?]
- [ ] **Invalid**: [integrity issues found — rerun needed]

---

## Learnings

### What we learned
-

### What surprised us
-

### Fogg B=MAP insight
- Was our diagnosis correct? (M / A / P)
- What does this tell us about our users?

---

## Next Tests

Based on these learnings, test next:

| # | Hypothesis | ICE | Owner |
|---|---|---|---|
| 1 | | | |
| 2 | | | |

---

## Appendix

### Segment Analysis (if applicable)

| Segment | Control | Variant | Lift | Significant? |
|---|---|---|---|---|
| Mobile | | | | |
| Desktop | | | | |
| New visitors | | | | |
| Returning | | | | |

*Note: Segment analysis is exploratory. Pre-register segments in future tests for confirmatory analysis.*

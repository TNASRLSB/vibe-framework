# Baptist — Knowledge Base

Domain knowledge and reference material for the Baptist CRO skill. This file is for human readers — Claude does not load it during skill execution.

---

## Fogg Behavior Model (B=MAP)

Behavior = Motivation x Ability x Prompt. All three must converge at the same moment for a behavior to occur.

### Motivation (M)

Three core motivator pairs:
- **Pain/Pleasure** — Immediate physical or emotional response
- **Hope/Fear** — Anticipation of future outcomes
- **Social acceptance/rejection** — Desire to belong or avoid exclusion

When motivation is low, the offer or messaging is weak. Diagnose which motivator pair is underserved.

### Ability (A)

Six ability factors (simplicity chain — only as strong as the weakest link):
- **Time** — Does it take too long?
- **Money** — Is the cost too high?
- **Physical effort** — How many clicks, taps, scrolls?
- **Cognitive load** — How much thinking is required? (Brain cycles)
- **Social deviance** — Does this feel normal?
- **Non-routine** — How different is this from what the user usually does?

When ability is low, friction is too high. Identify the specific barrier and reduce it.

### Prompt (P)

Three prompt types based on the user's current state:

| Prompt Type | When to Use | Example |
|---|---|---|
| **Facilitator** | High motivation, low ability | "One-click signup" — make the action easier |
| **Spark** | Low motivation, high ability | "Join 10,000+ teams" — increase desire |
| **Signal** | High motivation, high ability | "Your trial ends in 3 days" — just remind them |

A missing or weak prompt means the CTA is invisible, poorly positioned, or poorly timed.

### Cognitive Load Principles

- **Hick's Law** — Decision time increases logarithmically with options. Fewer choices = faster decisions = higher conversion.
- **Cognitive load reduction** — Reducing form fields, steps, or choices improves completion by ~15% on average (Baymard research).
- **8-second rule** — Users decide to stay or leave within 8 seconds. Value proposition must be clear immediately (eye-tracking research).
- **F/Z pattern** — Users scan in F-pattern (content-heavy) or Z-pattern (minimal pages). Position critical elements where eyes go naturally.
- **Miller's Law** — Working memory holds 7 +/- 2 items. Chunk information accordingly.
- **Progressive disclosure** — Show only what's needed at each step. Reveal complexity gradually.
- **Eye-tracking ROI** — Neuromarketing-based optimization yields average +24.7% conversion lift, ROI of 342.6% with 4-6 month payback (JAAFR 2025 study, n=400).

---

## CRO Process Framework

The standard CRO optimization cycle:

```
1. ANALYZE     → Identify conversion problems (quantitative + qualitative)
2. HYPOTHESIZE → Form testable hypotheses (B=MAP diagnosis)
3. PRIORITIZE  → Score by ICE (Impact x Confidence x Ease)
4. TEST        → Run A/B tests with statistical rigor
5. LEARN       → Document results, extract insights
6. IMPLEMENT   → Roll out winners, feed learnings into next cycle
```

This is a continuous loop. After IMPLEMENT, return to ANALYZE with new data and learnings from the previous cycle. Each iteration should be faster and more targeted as the knowledge base grows.

---

## A/B Testing Methodology

### Sample Size Formula (Simplified)

```
n = (16 x p x (1-p)) / MDE^2

Where:
  n   = sample per variant
  p   = baseline conversion rate
  MDE = minimum detectable effect (absolute)
        e.g., 0.006 for 20% relative lift on 3% baseline
```

### Quick Reference Table

| Baseline CVR | 10% MDE | 20% MDE | 30% MDE |
|---|---|---|---|
| 1% | 63,000 | 15,800 | 7,000 |
| 3% | 20,700 | 5,200 | 2,300 |
| 5% | 12,200 | 3,050 | 1,350 |
| 10% | 5,800 | 1,450 | 650 |

*Per variant. Multiply by 2 for total traffic needed.*

### Statistical Requirements (Detailed)

- **Confidence level**: 95% minimum (alpha = 0.05)
- **Statistical power**: 80% default (beta = 0.20)
- **Duration**: At least 1-2 full business cycles (7-14 days minimum), even if sample size is reached earlier
- **No peeking**: Do NOT check results and stop early — this inflates false positive rates (the "peeking problem"). If you must monitor, use sequential testing methods (see `references/advanced-testing.md`)
- **Pre-registration**: Document hypothesis, primary metric, guardrail metrics, sample size, and duration BEFORE launching
- **One primary metric**: Multiple primary metrics inflate false positives. Use secondary metrics for directional insight only

### Experiment Integrity Checklist

| Check | When | What to Do |
|---|---|---|
| **SRM (Sample Ratio Mismatch)** | Day 1, Day 3 | Verify traffic split matches expected ratio (e.g., 50/50). Chi-squared test, p < 0.001 = problem. Stop and diagnose if SRM detected. |
| **A/A validation** | Periodically | Run A/A tests (identical variants) to verify tooling works correctly. Should show no significant difference. |
| **Contamination** | Before launch | Prefer stable user IDs over cookies to prevent cross-device exposure. Exclude internal traffic. Cross-device contamination dilutes effects and biases results. |
| **Change control** | During test | Freeze all other changes to the same page/flow during the experiment. Document any unavoidable changes. Concurrent changes make results uninterpretable. |
| **Novelty/primacy effects** | After 2 weeks | Watch for metrics that spike then decay (novelty) or dip then recover (primacy). Extend test if suspected. |

### Peeking Problem

Looking at results before reaching sample size and stopping when significance appears leads to false positives, inflated effects, and wrong decisions. Solutions: pre-commit to sample size, use sequential testing if must peek, or use CUPED for faster convergence.

For CUPED, sequential testing, Multi-Armed Bandits, and Bayesian vs. frequentist methods, see `references/advanced-testing.md`.

---

## Conversion Rate Benchmarks

| Page Type | Poor | Average | Good | Great |
|---|---|---|---|---|
| Landing page | <1% | 2-3% | 4-5% | >6% |
| Checkout | <40% | 50-60% | 65-75% | >80% |
| Form completion | <20% | 30-40% | 45-55% | >60% |
| Add to cart | <3% | 5-8% | 9-12% | >15% |

*Benchmarks vary significantly by industry. Use as directional only. Do not invent data; state "varies by industry" when uncertain.*

**CRO ROI benchmark**: Average 342.6% ROI, payback in 4-6 months (eye-tracking based neuromarketing study, JAAFR 2025).

---

## Privacy-First CRO

With cookie deprecation and stricter privacy defaults:

- **Prefer first-party measurement**: Server-side tracking, authenticated sessions
- **Validate assignment/tracking**: Consent-mode can break A/B test integrity
- **Treat lifts as uncertain** without clean instrumentation
- **Cookie deprecation impact**: Can affect experiment assignment consistency — prefer stable user IDs
- **Consent-mode behavior**: Understand how blocked cookies affect conversion tracking before interpreting results

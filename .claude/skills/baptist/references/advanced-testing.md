# Advanced Testing Reference

Methods for faster, more sophisticated experimentation. Use these when standard A/B testing is too slow or when the problem demands more nuance.

---

## CUPED (Controlled-experiment Using Pre-Existing Data)

Reduces variance by ~40-60%, allowing tests to reach significance faster with the same traffic.

### How It Works
Uses pre-experiment user behavior (covariates) to control for inherent variance in conversion rates. If a user historically converts at a high rate, their high conversion in the test isn't news — CUPED adjusts for this.

### Implementation

```
Adjusted metric = Y - θ × (X - E[X])

Where:
  Y = observed metric during experiment
  X = pre-experiment covariate (same metric, prior period)
  θ = Cov(X,Y) / Var(X)
  E[X] = mean of covariate
```

### Practical Details

| Aspect | Details |
|---|---|
| Lookback window | 1-2 weeks (optimal balance) |
| Variance reduction | 40-60% typical |
| Limitation | Doesn't work for new users (no history) |
| Best for | High-traffic sites where test velocity matters |
| Platforms | VWO, Optimizely, Statsig, Eppo, PostHog |

### When to Use
- High traffic but need faster results
- Running many concurrent tests (velocity matters)
- Metric has high natural variance
- You have reliable pre-experiment behavioral data

### When NOT to Use
- Mostly new users (no pre-experiment data)
- Very low traffic (won't help enough)
- Simple one-off tests where standard duration is acceptable

---

## Sequential Testing

Allows peeking at results during the test without inflating false positive rates.

### The Problem
Standard fixed-horizon testing requires waiting until full sample size. Peeking before that and stopping when you see significance → inflated false positives (up to 30%+ error rate).

### How Sequential Testing Works
Uses spending functions to "budget" the total alpha (5%) across multiple looks. Each peek uses a fraction of the alpha, so the overall error rate stays at 5%.

### Methods

| Method | Complexity | Platforms |
|---|---|---|
| **Group Sequential** | Medium | Optimizely, Eppo |
| **Always Valid p-values** | Low (for user) | Statsig |
| **mSPRT** | Medium | Netflix, custom |

### Practical Rules
- Pre-define the number of looks (e.g., daily, weekly)
- Early stopping is most useful for **stopping losers** (harm detection)
- Winners detected early often have inflated effect sizes — verify with post-hoc analysis
- Always set a maximum duration even with sequential methods

---

## Multi-Armed Bandits (MAB)

Dynamically allocate more traffic to better-performing variants during the test.

### How It Works
Instead of fixed 50/50 split, MAB algorithms shift traffic toward the variant that's performing better. This reduces the "cost" of showing a losing variant.

### Trade-offs vs A/B Testing

| Aspect | A/B Test | MAB |
|---|---|---|
| Goal | Learn which is better | Maximize conversions during test |
| Traffic split | Fixed | Dynamic |
| Statistical rigor | High (clear p-value) | Lower (harder to interpret) |
| Regret | Higher (50% to loser) | Lower |
| Best for | Learning + deciding | Optimizing + short-lived content |

### When to Use MAB
- Short-lived content (promotions, seasonal offers)
- High opportunity cost of showing losing variant
- Many variants to test simultaneously
- You care more about optimization than learning

### When to Use A/B Instead
- You need clear statistical evidence
- Results will inform long-term strategy
- You need to understand WHY something works
- Stakeholders need confidence intervals and p-values

### Common Algorithms
- **Epsilon-Greedy**: Explore ε% randomly, exploit (1-ε)% on best
- **Thompson Sampling**: Bayesian approach, samples from posterior distributions
- **UCB (Upper Confidence Bound)**: Balances exploration/exploitation mathematically

---

## Bayesian vs Frequentist

### Frequentist (Standard A/B)

What most tools use. Answers: "How likely is this result if there's no real difference?"

| Aspect | Details |
|---|---|
| Core question | P(data \| no effect) |
| Output | p-value, confidence interval |
| Requires | Fixed sample size, pre-determined |
| Stopping | Only at pre-set sample size |
| Interpretation | "If we ran this test 100 times, 95 would contain the true effect" |

### Bayesian

Growing in popularity. Answers: "What's the probability that B is better than A?"

| Aspect | Details |
|---|---|
| Core question | P(B > A \| data) |
| Output | Probability of being best, credible interval |
| Requires | Prior distribution (often uninformative) |
| Stopping | More flexible (but not "stop anytime") |
| Interpretation | "There's a 95% probability the true lift is between X% and Y%" |

### When Bayesian Shines
- Stakeholders find "probability of being best" more intuitive than p-values
- Need more flexible stopping rules
- Running many small tests where speed matters
- Want to incorporate prior knowledge

### When Frequentist is Better
- Need rigorous, defensible results
- Regulatory or compliance contexts
- Simple, well-understood methodology
- Tools available are frequentist-only

### Platforms by Approach
| Frequentist | Bayesian | Both |
|---|---|---|
| Google Optimize (sunset) | VWO (option) | Optimizely |
| Most custom solutions | Statsig | PostHog |
| — | Dynamic Yield | Eppo |

---

## Interaction Effects and MVT

### When to Use Multivariate Testing
- Testing multiple changes that might interact
- High enough traffic to support all combinations
- Need to understand how elements work together

### Traffic Requirements
For k variants of n elements: k^n combinations × sample per cell

Example: 2 headlines × 2 CTAs × 2 images = 8 combinations. At 5,000 per cell = 40,000 total minimum.

### Fractional Factorial Design
When full factorial requires too much traffic:
- Test a subset of combinations
- Assumes some interactions are negligible
- Requires statistical expertise to design and interpret

---

## Test Velocity

### Why It Matters
The number of tests you can run per year is often the biggest constraint on CRO improvement. Faster testing = faster learning = faster growth.

### Velocity Levers
1. **CUPED**: Reduce required sample by 40-60%
2. **Sequential testing**: Stop losers early
3. **Parallel tests**: Run tests on different pages simultaneously
4. **Smaller MDE**: Accept — larger MDE means smaller sample needed
5. **Better hypotheses**: Higher win rate = less wasted tests

### Target Velocity
- Early CRO program: 1-2 tests/month
- Mature program: 4-8 tests/month
- Elite programs: 10+ tests/month

---

## Common Pitfalls in Advanced Testing

1. **Using MAB when you need learning**: MAB optimizes but doesn't give clean evidence
2. **Bayesian "stop anytime" myth**: Bayesian methods are more flexible, not infinitely so
3. **CUPED with bad covariates**: Garbage in, garbage out — covariate must correlate with outcome
4. **Sequential testing abuse**: Pre-define your looks; don't peek continuously
5. **Overcomplicating**: Standard A/B testing is fine for 90% of experiments. Use advanced methods only when standard methods are genuinely insufficient.

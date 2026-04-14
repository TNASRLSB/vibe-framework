# Analytics & Statistical Methods Reference

This document provides statistical methods and analytics guidance. Baptist's SKILL.md references this during results analysis and funnel diagnostics.

---

## Statistical Significance for A/B Tests

### Z-Test for Two Proportions

The standard test for comparing conversion rates between control and variant.

**When to use:** Comparing a binary outcome (converted vs not converted) between two independent groups.

### The Formula

**Pooled proportion:**
```
p̂ = (x₁ + x₂) / (n₁ + n₂)
```

**Standard error:**
```
SE = √[ p̂(1 - p̂) × (1/n₁ + 1/n₂) ]
```

**Z-statistic:**
```
z = (p₁ - p₂) / SE
```

Where:
- `x₁`, `x₂` = number of conversions in control and variant
- `n₁`, `n₂` = sample sizes for control and variant
- `p₁`, `p₂` = conversion rates (x/n) for control and variant

### Interpreting the Z-Statistic

| |z| value | Two-tailed p-value | Significance |
|-----------|-------------------|--------------|
| < 1.645 | > 0.10 | Not significant |
| 1.645 | 0.10 | Marginal (90% confidence) |
| 1.96 | 0.05 | Significant (95% confidence) |
| 2.576 | 0.01 | Highly significant (99% confidence) |
| 3.291 | 0.001 | Very highly significant (99.9% confidence) |

**Standard threshold:** p < 0.05 (95% confidence). Use p < 0.01 for high-stakes decisions (pricing changes, major redesigns).

### Worked Example

**Scenario:** Testing a new CTA button copy.
- Control: 5,000 visitors, 200 conversions (4.0%)
- Variant: 5,000 visitors, 250 conversions (5.0%)

**Calculation:**
```
p̂ = (200 + 250) / (5000 + 5000) = 450/10000 = 0.045
SE = √[ 0.045 × 0.955 × (1/5000 + 1/5000) ]
   = √[ 0.04298 × 0.0004 ]
   = √[ 0.00001719 ]
   = 0.004146
z = (0.05 - 0.04) / 0.004146 = 2.41
```

**Result:** z = 2.41, p = 0.016. Statistically significant at 95% confidence. The variant wins.

---

## Confidence Intervals

### For a Single Proportion

```
CI = p̂ ± Z_α/2 × √[ p̂(1-p̂) / n ]
```

**Example:** 250 conversions out of 5,000 visitors (5.0%)
```
CI = 0.05 ± 1.96 × √[ 0.05 × 0.95 / 5000 ]
   = 0.05 ± 1.96 × 0.00308
   = 0.05 ± 0.00604
   = [4.4%, 5.6%]
```

### For the Difference Between Two Proportions

```
CI = (p₁ - p₂) ± Z_α/2 × √[ p₁(1-p₁)/n₁ + p₂(1-p₂)/n₂ ]
```

**Example:** Control 4.0%, Variant 5.0% (n=5,000 each)
```
SE_diff = √[ 0.04 × 0.96 / 5000 + 0.05 × 0.95 / 5000 ]
        = √[ 0.00000768 + 0.0000095 ]
        = √[ 0.00001718 ]
        = 0.004145

CI = 0.01 ± 1.96 × 0.004145
   = 0.01 ± 0.008124
   = [0.19%, 1.81%]
```

**Interpretation:** We are 95% confident the true difference in conversion rates is between 0.19 and 1.81 percentage points (or 4.7% to 45.3% relative lift). Since the interval does not include zero, the difference is statistically significant.

### Why Confidence Intervals Matter More Than P-Values

- **P-value** tells you: "Is the effect probably non-zero?" (yes/no)
- **Confidence interval** tells you: "How big is the effect, and how uncertain are we?"

A CI of [0.1%, 8.0%] and [3.5%, 4.5%] are both significant, but tell very different stories. The first might not be worth the implementation cost. The second is a reliable, meaningful lift.

**Always report CIs alongside p-values.** They enable better decisions.

---

## Practical vs Statistical Significance

A result can be statistically significant but practically meaningless.

### Minimum Meaningful Effect

Before running a test, define the minimum lift that justifies the change:

| Factor | Question |
|--------|----------|
| Implementation cost | How much dev time does the variant need? |
| Maintenance cost | Does the variant add ongoing complexity? |
| Revenue impact | What does a 1% lift translate to in revenue? |
| Opportunity cost | Could we run a higher-impact test instead? |

**Example:** A test shows 0.3% absolute lift (p = 0.04). Statistically significant. But the variant requires a new component and ongoing maintenance. The lift translates to $200/month in revenue. Not worth it.

### Decision Matrix

| Statistical sig. | Practical sig. | Decision |
|-----------------|----------------|----------|
| Yes | Yes | Ship it |
| Yes | No | Document the learning, don't ship |
| No | N/A | Inconclusive — don't ship |
| No (but trending) | Potentially | Extend test if sample wasn't met; otherwise, iterate |

---

## Funnel Analysis Methodology

### Step 1: Define Funnel Steps

Map every step from entry to conversion:

```
Visit → View Product → Add to Cart → Begin Checkout → Complete Purchase
  100%      45%           12%             8%               5%
```

### Step 2: Calculate Step-to-Step Conversion

| Step | Visitors | Drop-off | Step Rate | Cumulative Rate |
|------|----------|----------|-----------|----------------|
| Visit | 10,000 | — | — | 100% |
| View Product | 4,500 | 5,500 (55%) | 45% | 45% |
| Add to Cart | 1,200 | 3,300 (73%) | 27% | 12% |
| Begin Checkout | 800 | 400 (33%) | 67% | 8% |
| Complete Purchase | 500 | 300 (38%) | 63% | 5% |

### Step 3: Identify the Biggest Opportunity

Calculate revenue impact of improving each step:

**Method:** "What if this step improved by 10%?"

| Step Improved | New Step Rate | New Completions | Lift |
|---------------|--------------|-----------------|------|
| Visit → View Product | 49.5% (+10% rel) | 550 | +50 |
| View Product → Add to Cart | 29.7% (+10% rel) | 548 | +48 |
| Add to Cart → Begin Checkout | 73.3% (+10% rel) | 522 | +22 |
| Begin Checkout → Complete | 68.8% (+10% rel) | 517 | +17 |

**Insight:** Improving early funnel steps has the largest absolute impact because more users are affected. But early steps are often harder to influence (traffic quality, product-market fit). Balance impact with ease.

### Step 4: Diagnose Drop-Off Causes

For each major drop-off, investigate:

| Data Source | What It Reveals |
|-------------|----------------|
| **Analytics** | Where users go after dropping off (back, away, different page) |
| **Heatmaps** | What users look at and click on the page |
| **Scroll maps** | How far users scroll (do they see the CTA?) |
| **Session recordings** | Individual user behavior (hesitation, confusion, errors) |
| **Surveys** | Self-reported reasons for not converting |
| **Form analytics** | Which field users abandon on |

### Step 5: Apply B=MAP to Each Drop-Off

| Drop-off Pattern | Likely B=MAP Factor | Investigation |
|------------------|-------------------|---------------|
| Quick bounce (< 10s) | Motivation (relevance mismatch) | Check traffic source vs page content match |
| Scroll but don't click | Prompt (CTA not visible or compelling) | Check CTA placement, copy, contrast |
| Start form, abandon | Ability (too difficult or long) | Check field count, error messages, mobile UX |
| Reach checkout, leave | Motivation (anxiety) or Ability (trust/friction) | Check trust signals, unexpected costs, form issues |
| Add to cart, don't checkout | Prompt (no urgency) or Ability (checkout friction) | Check cart abandonment triggers, email recovery |

---

## Micro-Conversion Tracking

### Definition

Micro-conversions are intermediate actions that predict (but don't guarantee) the final macro-conversion.

### Common Micro-Conversions

| Micro-Conversion | What It Predicts | Tracking Method |
|-----------------|------------------|-----------------|
| Scroll depth > 50% | Content engagement, awareness of CTA | Scroll tracking event |
| Video play > 30s | Product understanding, motivation | Video player events |
| Pricing page visit | Purchase intent | Page view event |
| Feature comparison click | Active evaluation | Click event |
| FAQ expansion | Objection handling | Click event |
| Chat widget open | Need for help (ability issue) | Widget event |
| Social proof hover/click | Trust verification | Interaction event |
| Cart/wishlist add | Purchase consideration | E-commerce event |

### Why Track Micro-Conversions

1. **Leading indicators:** Changes in micro-conversions precede changes in macro-conversions
2. **Diagnostic power:** If macro-conversions drop, micro-conversions show where in the journey the problem is
3. **Faster signal:** Micro-conversions happen more frequently, so you can detect changes sooner
4. **Test sensitivity:** An A/B test may not reach significance on macro-conversions but may on micro-conversions, pointing to where the variant is working

---

## Segment Analysis

### Why Segment

Overall results mask important differences. A variant that lifts desktop by 20% and drops mobile by 15% may show a modest overall win — while destroying the mobile experience.

### Key Segments

| Segment | Why It Matters |
|---------|---------------|
| **Device** (mobile/desktop/tablet) | UX differences, intent differences |
| **Traffic source** (organic/paid/direct/referral/social) | Intent and awareness level differ by source |
| **New vs returning** | Familiarity with product and UI |
| **Geography** | Cultural differences, language, pricing sensitivity |
| **Browser** | Rendering differences, tech-savviness proxy |
| **Time of day / day of week** | B2B vs B2C patterns, work vs leisure |
| **Customer tier** (if applicable) | High-value vs low-value behavioral differences |

### Segment Analysis Rules

1. **Pre-define segments** before the test starts. Post-hoc segmentation is exploratory, not confirmatory.
2. **Apply Bonferroni correction** when checking multiple segments: divide alpha by the number of segments tested. For 5 segments at alpha 0.05, use alpha 0.01 per segment.
3. **Look for directional consistency.** If the variant wins in most segments but loses in one, investigate that segment — don't dismiss it.
4. **Sample size per segment matters.** A segment with only 200 users cannot produce meaningful results. Report "insufficient data" for small segments.

---

## Heatmap and Session Recording Interpretation

### Heatmap Types

| Type | What It Shows | Key Signals |
|------|--------------|-------------|
| **Click map** | Where users click | Dead clicks (clicking non-clickable elements = UX confusion), ignored CTAs, unexpected click targets |
| **Scroll map** | How far users scroll | Drop-off depth, "fold line" where attention dies, whether users reach CTAs |
| **Move map** | Mouse movement patterns | Reading patterns, areas of interest, hesitation zones |
| **Attention map** | Combined time × visibility | What users actually see vs what you think they see |

### Common Heatmap Patterns

| Pattern | Diagnosis | Action |
|---------|-----------|--------|
| Clicks on non-clickable element | Users expect it to be interactive | Make it clickable, or change styling to look non-interactive |
| CTA gets few clicks despite visibility | Copy or offer is not compelling | Rewrite CTA, test different offer |
| Scroll drop at 30-40% | Content below the fold is not engaging | Move key content up, improve visual hooks |
| Heavy clicking on navigation | Users are searching, not finding | Improve page content or navigation clarity |
| Rage clicks (rapid repeated clicks) | Something is broken or frustratingly slow | Fix the interaction, check load time |

### Session Recording Review

Watch at least 10-20 recordings per segment. Look for:

1. **Hesitation patterns:** Mouse pauses over elements (uncertainty)
2. **Back-and-forth:** Scrolling up and down repeatedly (comparing, confused)
3. **Form interaction:** Time per field, field corrections, abandonment field
4. **Error encounters:** What triggers errors, how users respond
5. **Exit behavior:** Last actions before leaving

**Quantify observations:** "7 of 15 users hesitated at the pricing section" is more useful than "users seem confused by pricing."

---

## Statistical Power and Sample Planning

### What Is Power?

Power is the probability of detecting a real effect when it exists. Standard target: 80%.

| Power | Meaning |
|-------|---------|
| 80% | 20% chance of missing a real effect (false negative) |
| 90% | 10% chance of missing a real effect |
| 95% | 5% chance of missing a real effect |

Higher power requires larger samples. 80% is the standard tradeoff.

### Underpowered Test Risks

An underpowered test doesn't just fail to find effects — it produces unreliable estimates:

- **Winner's curse:** If an underpowered test finds significance, the estimated effect size is likely inflated
- **Sign errors:** The estimated direction may be wrong
- **Wasted time:** Weeks of testing with no actionable result

**If you cannot reach adequate power within 4-8 weeks, do not run the test.** Use qualitative methods instead.

### Power Analysis Decision Tree

```
1. What is your baseline conversion rate?
2. What is the minimum lift worth detecting? (MDE)
3. How much daily traffic hits the test page?
4. Calculate required sample size (see experiments.md)
5. Calculate duration = total sample / daily traffic
6. Is duration ≤ 8 weeks?
   → YES: Run the test
   → NO: Increase MDE, or use qualitative methods
```

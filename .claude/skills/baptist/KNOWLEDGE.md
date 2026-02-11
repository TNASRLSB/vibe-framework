# Baptist — Domain Knowledge

Domain knowledge preserved for human reference. Claude already has expertise in these areas.

## Fogg Model: Motivation Breakdown

Three core motivators:
- **Pain/Pleasure**: Immediate emotional response
- **Hope/Fear**: Anticipated outcomes
- **Social acceptance/Rejection**: Belonging and status

## Fogg Model: Ability Factors

Six ability factors:
- **Time**: How long does it take?
- **Money**: What does it cost?
- **Physical effort**: How many clicks, taps, scrolls?
- **Brain cycles**: How much do I need to think? (Cognitive load)
- **Social deviance**: Does this feel normal?
- **Non-routine**: How different is this from what I usually do?

## Cognitive Load Principles

- **Hick's Law**: Decision time increases logarithmically with options. Fewer choices → faster decisions → higher conversion.
- **Cognitive load reduction**: Reducing form fields, steps, or choices improves completion by ~15% on average (Baymard research).
- **First 8 seconds rule**: Users decide to stay or leave within 8 seconds. Value proposition must be clear immediately (eye-tracking research).
- **F/Z pattern**: Users scan in F-pattern (content-heavy) or Z-pattern (minimal pages). Position critical elements where eyes go naturally.
- **Eye-tracking ROI**: Neuromarketing-based optimization yields average +24.7% conversion lift, ROI of 342.6% with 4-6 month payback (JAAFR 2025 study, n=400).

## A/B Testing: Statistical Details

### Experiment Integrity

- **SRM (Sample Ratio Mismatch)**: Check sample ratio mismatch on day 1 and day 3. If the split deviates significantly from expected (e.g., 50/50), the test infrastructure may be broken.
- **A/A validation**: Run periodic A/A tests to verify tooling. If A/A tests show significant results, your testing platform has a bug.
- **Contamination**: Prevent same user seeing multiple variants across devices/sessions; prefer stable IDs. Cross-device contamination dilutes effects and biases results.
- **Change control**: Freeze other major changes to the same flow during the test window. Concurrent changes make results uninterpretable.

### Peeking Problem

Looking at results before reaching sample size and stopping when significance appears → false positives, inflated effects, wrong decisions. Solutions: pre-commit to sample size, use sequential testing if must peek, or use CUPED for faster convergence.

For CUPED, sequential testing, and Bayesian methods, see `references/advanced-testing.md`.

## Conversion Rate Benchmarks

| Page Type | Poor | Average | Good | Great |
|---|---|---|---|---|
| Landing page | <1% | 2-3% | 4-5% | >6% |
| Checkout | <40% | 50-60% | 65-75% | >80% |
| Form completion | <20% | 30-40% | 45-55% | >60% |
| Add to cart | <3% | 5-8% | 9-12% | >15% |

*Benchmarks vary significantly by industry. Use as directional only. Do not invent data; state "varies by industry" when uncertain.*

**CRO ROI benchmark**: Average 342.6% ROI, payback in 4-6 months (eye-tracking based neuromarketing study, JAAFR 2025).

## Privacy-First CRO

With cookie deprecation and stricter privacy defaults:

- **Prefer first-party measurement**: Server-side tracking, authenticated sessions
- **Validate assignment/tracking**: Consent-mode can break A/B test integrity
- **Treat lifts as uncertain** without clean instrumentation
- **Cookie deprecation impact**: Can affect experiment assignment consistency — prefer stable user IDs
- **Consent-mode behavior**: Understand how blocked cookies affect conversion tracking before interpreting results

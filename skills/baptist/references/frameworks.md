# CRO Frameworks Reference

This document provides in-depth CRO framework knowledge. Baptist's SKILL.md references this during audits and prioritization.

---

## Fogg Behavior Model (B=MAP) — Deep Dive

**Origin:** Dr. BJ Fogg, Stanford Persuasive Technology Lab.

**Core insight:** Behavior happens when Motivation, Ability, and Prompt converge at the same moment. If any one is missing, the behavior does not occur.

### The Action Line

Motivation and Ability exist on a tradeoff curve (the "action line"). High motivation compensates for low ability, and high ability compensates for low motivation. But a Prompt is always required — without it, even motivated, able users don't act.

```
Motivation
    ^
    |  ╲  Behavior
    |    ╲  happens
    |      ╲  here
    |        ╲
    |  No      ╲
    |  behavior   ╲____________
    |
    +-------------------------> Ability
```

Users above the action line will convert IF prompted. Users below it will not, regardless of prompting.

### Diagnosing with B=MAP

**Step 1: Check Prompt first.**
- Is there a clear, visible call to action?
- Does the user notice it at the right moment?
- If the prompt is missing or invisible, nothing else matters.

**Step 2: Check Ability.**
- Can the user complete the action easily?
- What friction exists? (steps, time, cognitive effort, money, social deviance)
- Ability problems are usually easier and cheaper to fix than motivation problems.

**Step 3: Check Motivation.**
- Does the user want the outcome?
- Is the value proposition clear and compelling?
- Motivation problems often require deeper changes (product, positioning, audience).

**Rule of thumb:** Fix Prompt → Ability → Motivation (in that order). This is the cheapest-to-most-expensive sequence.

### Motivation Subtypes

| Type | Description | Example |
|------|-------------|---------|
| **Pleasure/Pain** | Immediate sensory response | Beautiful design vs ugly form |
| **Hope/Fear** | Anticipation of outcome | "Grow revenue 3x" vs "Don't lose customers" |
| **Social acceptance/rejection** | Belonging and status | "Join 10,000 marketers" vs "Don't get left behind" |

**Key insight:** Hope and Fear are the most powerful motivators for conversion. Pleasure/Pain drives engagement but not commitment. Social factors work as amplifiers.

### Ability Factors (Simplicity Chain)

A task is only as simple as its hardest component. Evaluate each:

| Factor | Question | Fix |
|--------|----------|-----|
| **Time** | How long does it take? | Reduce steps, pre-fill, async |
| **Money** | Does it cost anything? | Free trial, money-back guarantee |
| **Physical effort** | How much typing/clicking? | Auto-complete, smart defaults |
| **Cognitive effort** | How much thinking? | Clear labels, fewer choices, progressive disclosure |
| **Social deviance** | Does it go against norms? | Social proof, normalizing language |
| **Non-routine** | Is it unfamiliar? | Familiar patterns, guided onboarding |

**The weakest link matters most.** A form that takes 2 seconds but asks for a credit card upfront fails on "Money" even though "Time" is excellent.

### Prompt Types

| Type | When to use | Example |
|------|-------------|---------|
| **Spark** | User has ability but low motivation | Emotional headline, testimonial near CTA |
| **Facilitator** | User has motivation but low ability | Simplified form, "one-click" buy |
| **Signal** | User has both motivation and ability | Simple reminder, notification, CTA button |

Match the prompt type to the user's state. A spark for someone who is already motivated wastes space. A signal for someone who lacks ability frustrates them.

---

## ICE Scoring — Calibrated Examples

### Impact Calibration

| Score | Meaning | Example |
|-------|---------|---------|
| 10 | Transforms the conversion funnel | Completely redesigned checkout flow |
| 8-9 | Major improvement to key metric | New value proposition above the fold |
| 6-7 | Meaningful improvement | Simplified form (6 fields → 3) |
| 4-5 | Moderate improvement | Better CTA copy |
| 2-3 | Minor improvement | Button color change |
| 1 | Negligible impact | Moving a link by 10px |

### Confidence Calibration

| Score | Evidence basis | Example |
|-------|---------------|---------|
| 10 | Proven in this exact context (prior test data) | Rerunning a winning variant |
| 8-9 | Strong user research + analytics data | Heatmaps show 80% miss the CTA |
| 6-7 | Industry best practices + relevant analytics | Adding social proof (widely proven) |
| 4-5 | Heuristic review, expert judgment | "This copy feels unclear" |
| 2-3 | Educated guess, limited context | "Users might prefer video" |
| 1 | Pure speculation, no evidence | "Let's try making it purple" |

### Ease Calibration

| Score | Implementation effort | Example |
|-------|----------------------|---------|
| 10 | < 1 hour, text/config change only | Changing CTA copy |
| 8-9 | Few hours, single component | Reordering form fields |
| 6-7 | Half a day, touches multiple components | Adding a testimonials section |
| 4-5 | 1-2 days, needs design + dev | New hero section layout |
| 2-3 | 3-5 days, significant feature work | Multi-step form with progress |
| 1 | 1+ week, architectural change | New checkout flow |

### ICE Decision Examples

| Change | I | C | E | Score | Action |
|--------|---|---|---|-------|--------|
| Reduce form from 8 to 4 fields | 7 | 8 | 8 | 7.7 | Do first |
| Rewrite hero headline | 6 | 5 | 9 | 6.7 | Do second |
| Add exit-intent popup | 5 | 6 | 7 | 6.0 | Do third |
| Redesign entire pricing page | 8 | 5 | 2 | 5.0 | Defer |
| Change button color | 2 | 3 | 10 | 5.0 | Skip |

---

## LIFT Model (Supplementary)

**Origin:** WiderFunnel. Complements B=MAP with a conversion-specific lens.

The LIFT model evaluates six factors that influence conversion:

| Factor | Type | Question |
|--------|------|----------|
| **Value Proposition** | Driver | Is the perceived value greater than the perceived cost? |
| **Relevance** | Driver | Does this match what the user expected/wanted? |
| **Clarity** | Driver | Is the message and design clear? |
| **Urgency** | Driver | Is there a reason to act now? |
| **Anxiety** | Inhibitor | What concerns might prevent action? |
| **Distraction** | Inhibitor | What elements compete for attention? |

### Mapping LIFT to B=MAP

| LIFT Factor | B=MAP Equivalent |
|-------------|-----------------|
| Value Proposition | Motivation (hope/desire) |
| Relevance | Motivation (expectation match) |
| Clarity | Ability (cognitive load) |
| Urgency | Prompt (timing) |
| Anxiety | Motivation (fear, negative) |
| Distraction | Prompt (competing signals) |

Use LIFT as a secondary lens when B=MAP diagnosis is ambiguous.

---

## ResearchXL Framework (Supplementary)

**Origin:** CXL Institute. A research-driven approach to CRO.

**When to use:** When you have access to analytics, user research, or session recordings — not just heuristic review.

### The Six Pillars

1. **Technical Analysis:** Page speed, cross-browser issues, broken elements
2. **Heuristic Analysis:** Expert review using B=MAP/LIFT frameworks
3. **Web Analytics:** Funnel data, drop-off rates, segment analysis
4. **Mouse Tracking:** Heatmaps, scroll maps, session recordings
5. **Qualitative Research:** Surveys, interviews, usability tests
6. **User Testing:** Task-based testing with real users

### Data Hierarchy

Not all evidence is equal. Prioritize:

1. **Behavioral data** (what users actually do) > **Attitudinal data** (what users say they do)
2. **Quantitative data** (analytics, test results) > **Qualitative data** (interviews, surveys) for measuring impact
3. **Qualitative data** > **Quantitative data** for understanding WHY
4. **Your own data** > **Industry benchmarks** > **Best practices** > **Expert opinion**

---

## Persuasion Principles for Conversion

### Cialdini's Principles Applied to CRO

| Principle | CRO Application | Example |
|-----------|-----------------|---------|
| **Reciprocity** | Give value before asking | Free tool, free chapter, free audit |
| **Commitment** | Start with micro-commitments | Quiz → email → trial → paid |
| **Social Proof** | Show others have done it | "10,847 teams use this" |
| **Authority** | Show credibility signals | Certifications, press logos, expert endorsements |
| **Liking** | Be relatable and human | Founder story, team photos, conversational copy |
| **Scarcity** | Limit availability (honestly) | "3 spots left this month" (only if true) |
| **Unity** | Create shared identity | "Built by developers, for developers" |

### Ethical Boundaries

Baptist optimizes for genuine conversion — helping users who would benefit from the product to say yes. Baptist does NOT:
- Create false scarcity or urgency
- Use dark patterns (hidden costs, trick questions, roach motels)
- Manipulate through deception
- Optimize for sign-ups that churn immediately

**Test:** If the optimization would embarrass you if explained to the user, don't do it.

---

## Benchmark Conversion Rates

Use these as rough baselines, not targets. Your own data is always more relevant.

| Page Type | Median | Good | Excellent |
|-----------|--------|------|-----------|
| SaaS landing page | 3-5% | 7-10% | 11%+ |
| E-commerce product page | 2-3% | 4-5% | 6%+ |
| Lead gen form | 5-10% | 15-20% | 25%+ |
| Email signup | 1-3% | 5-8% | 10%+ |
| Free trial to paid | 15-25% | 30-40% | 50%+ |
| Checkout completion | 45-55% | 60-70% | 75%+ |
| Pricing page → plan select | 10-20% | 25-35% | 40%+ |

**Context matters:** A 2% conversion rate on high-intent organic traffic is worse than 2% on cold paid traffic. Always segment.

---

## Page-Specific CRO Frameworks

### Homepage

Homepages serve multiple audiences simultaneously.

**Key challenges:**
- Cold visitors need clear positioning
- "Ready to buy" and "still researching" visitors coexist
- Multiple conversion paths compete for attention

**Framework:**
1. Clear positioning statement that works for first-time visitors
2. Quick path to primary conversion (visible without scrolling)
3. Self-selection navigation -- help visitors find their path
4. Trust signals -- logos, stats, testimonials visible early
5. Secondary paths for visitors not ready to convert

**Experiment ideas:** Headline (specific vs abstract), hero visual (screenshot vs GIF vs illustration vs video), CTA text/color/placement, customer logo placement, sticky nav with CTA vs standard, live chat vs AI chatbot.

### Landing Page

Single-purpose pages. Focus on one conversion.

**Framework:**
1. Message match -- headline must match the ad/source that brought them
2. Single CTA -- remove navigation, sidebar, competing links
3. Complete argument -- everything needed to convert on one page
4. Above-fold completeness -- headline, subheadline, CTA, trust signal all visible
5. Urgency/scarcity -- only if genuine

**Above-the-fold checklist:**

| Element | Requirement |
|---------|-------------|
| Headline | Clear value proposition |
| Subheadline | Specific benefit or outcome |
| Hero image/video | Relevant, shows outcome |
| CTA | Prominent, action-oriented |
| Trust signal | Logo strip, rating, or stat |

**Common issues:** Feature-focused instead of benefit-focused headline, vague value proposition, generic CTA text ("Submit"), stock photos, missing trust signals near CTA.

**Experiment ideas:** Headline (outcome-focused vs problem-focused), CTA copy ("Start Free Trial" vs "Get Started" vs "See Demo"), trust element placement, social proof type, page length, video type.

### Pricing Page

High-intent visitors. They are already interested -- help them decide.

**Framework:**
1. Clear plan comparison -- easy to scan differences
2. Recommended plan -- visual indicator on target plan
3. Feature clarity -- what is included and excluded
4. Objection handling -- FAQ, guarantee, "cancel anytime"
5. Easy path to checkout -- minimize steps from decision to payment

**Experiment ideas:** Number of tiers (2 vs 3 vs 4), annual vs monthly toggle default, recommended plan position, feature comparison format (checkmarks vs details), trial CTA vs direct purchase, social proof placement.

### Checkout

Reduce abandonment. Every friction point costs money.

**Framework:**
1. Progress indicator -- show how many steps remain
2. Trust signals -- security badges, guarantees near payment form
3. Minimal distractions -- no navigation, no competing links
4. Smart defaults -- pre-fill what you can, sensible country/currency
5. Error recovery -- clear error messages, preserve entered data

**Experiment ideas:** Guest checkout vs required signup, number of steps, payment method order, trust badge placement, order summary position (sidebar vs inline), express checkout options.

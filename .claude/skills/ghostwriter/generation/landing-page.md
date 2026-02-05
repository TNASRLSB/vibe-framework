# Landing Page Generation Prompt

## Pre-Generation Questions

### Required
1. **Product/Service**: What are you selling/offering?
2. **Primary CTA**: What action should visitors take? (buy, signup, demo, contact)
3. **Target audience**: Who is this for? (demographics, pain points, awareness level)
4. **Key differentiator**: Why choose this over alternatives?

### Optional
5. **Price point**: (affects copy strategy - high ticket vs impulse buy)
6. **Social proof available**: Reviews, testimonials, logos, numbers?
7. **Objections to address**: Common hesitations?
8. **Tone**: (default: confident, benefit-focused)
9. **Urgency elements**: Limited time/quantity? (use only if genuine)

---

## Generation Template (Above the Fold)

```markdown
# [HEADLINE: Primary benefit + target audience clarity]
## [SUBHEADLINE: Expand on how, or address key objection]

[Hero paragraph: 2-3 sentences. Problem → Solution → Outcome.
Be specific. "Save 10 hours/week" beats "Save time".]

[PRIMARY CTA BUTTON: Action verb + benefit. "Start Free Trial" not "Submit"]

[Trust signal: "Trusted by 10,000+ teams" or "No credit card required"]
```

## Generation Template (Body)

```markdown
## [Problem Section Header - Agitate the pain]

[Describe the current painful state. Be specific and empathetic.
Use "you" language. Make them feel understood.]

- Pain point 1 with emotional weight
- Pain point 2 with specific scenario
- Pain point 3 with consequences

## [Solution Section Header - Present the transformation]

[Introduce your product as the bridge from pain to desired state.
Focus on outcomes, not features.]

### [Feature 1 → Benefit]
[What it does → What they get. Always connect to their life/work.]

### [Feature 2 → Benefit]
[Same pattern. Specific > Vague.]

### [Feature 3 → Benefit]
[Same pattern.]

## [Social Proof Section]

> "[Testimonial that addresses key objection or confirms key benefit]"
> — **Name**, Title at Company

[Or: Logos of recognizable customers]
[Or: "[X] customers served" with specific number]

## [Objection Handling / FAQ]

**[Common objection as question]?**
[Direct answer that reframes or resolves]

**[Another objection]?**
[Direct answer]

## [Final CTA Section]

### [Restate core value proposition]

[Final persuasive paragraph. Summarize transformation.
Create urgency only if genuine.]

[PRIMARY CTA BUTTON - Same as above]

[Risk reversal: "30-day money-back guarantee" or "Cancel anytime"]
```

---

## Framework Selection Guide

Choose based on awareness level:

| Audience Awareness | Framework | Why |
|--------------------|-----------|-----|
| Unaware of problem | PAS | Need to establish pain first |
| Problem-aware | AIDA | They know pain, show solution |
| Solution-aware | BAB | Show your specific transformation |
| Product-aware | PASTOR | Full persuasion, overcome objections |
| Most aware | Direct CTA | They're ready, don't oversell |

---

## Output Checklist

### Conversion (6 checks)
- [ ] Headline communicates core benefit in <10 words
- [ ] CTA is visible above fold
- [ ] Value proposition clear within 5 seconds of reading
- [ ] Social proof present
- [ ] Objections addressed
- [ ] Risk reversal included (guarantee, free trial, etc.)

### SEO (4 checks)
- [ ] Primary keyword in H1 and first paragraph
- [ ] Meta title ≤55 chars, meta description 120-155 chars (count characters precisely)
- [ ] Page has sufficient content for ranking (500+ words)
- [ ] Minimum 4 H2 sections for content structure

### GEO (4 checks)
- [ ] Opening paragraph is extractable as product summary
- [ ] Features/benefits stated clearly (not hidden in clever copy)
- [ ] Specific claims (numbers, percentages, timeframes)
- [ ] Brand and product names stated explicitly

### Copy Quality (4 checks)
- [ ] No jargon without explanation
- [ ] "You" language dominates over "we"
- [ ] Benefits > Features throughout
- [ ] One clear CTA (not multiple competing actions)

---

## Example Output Format

```
## Generated Landing Page

[The page content with sections marked]

---

## Conversion Elements

**Primary CTA:** [The button text]
**Secondary CTA:** [If applicable]
**Risk Reversal:** [Guarantee/trial/etc.]
**Key Social Proof:** [What's used]

---

## SEO Metadata

**Title tag:** [≤55 chars] — Character count: [X]/55
**Meta description:** [120-155 chars] — Character count: [X]/155
**Target keyword:** [keyword]

---

## Schema.org JSON-LD

[Appropriate schema - Product, Service, or Organization]

---

## Technical Infrastructure Checklist

The following MUST be present on the deployed site. If any are missing, flag as blockers:

- [ ] `<link rel="canonical" href="https://..." />` in `<head>`
- [ ] Schema.org JSON-LD in `<head>`
- [ ] Complete OpenGraph tags (og:title, og:description, og:image, og:url, og:type, og:site_name)
- [ ] Twitter Card tags
- [ ] XML sitemap at /sitemap.xml
- [ ] robots.txt at /robots.txt (with sitemap reference)
- [ ] WWW canonicalization (301 redirect www↔non-www)
- [ ] At least 1 external link to authoritative source
- [ ] At least 8 internal links

---

## Validation Score

Conversion: X/6
SEO: X/4
GEO: X/4
Copy: X/4
Total: X/18

Issues found:
- [List any failures]
```

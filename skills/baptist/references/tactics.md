# CRO Tactics Reference

Specialized tactical guidance for forms, popups, and paywalls. For UI implementation, delegate to Seurat. For copy, delegate to Ghostwriter.

---

## Form Strategy

### Field Decision Framework

For each field, ask:
1. Is this required before we can help them? --> **Keep**
2. Can we get this later (progressive profiling)? --> **Defer**
3. Can we infer this from other data (email domain --> company)? --> **Remove**

### Field Priority by Form Type

| Field | Lead Capture | Contact | Demo Request | Quote | Checkout |
|-------|-------------|---------|-------------|-------|----------|
| Email | Required | Required | Required | Required | Required |
| Name | Optional | Required | Required | Optional | Required |
| Company | Defer | Defer | Required (B2B) | Depends | N/A |
| Phone | Defer | Optional | Optional | Required | Optional |
| Job title | Defer | Defer | Optional (B2B) | Defer | N/A |
| Message | N/A | Required | Optional | N/A | N/A |

### Field Cost

Each field reduces completion rate:
- 3 fields: Baseline
- 4-6 fields: 10-25% reduction
- 7+ fields: 25-50%+ reduction

**2026 Benchmark**: Average checkout = 5.1 steps, 11.3 fields (Baymard). Target 5 fields or fewer for lead gen.

### Field-by-Field Optimization

- **Email**: Single field, no confirmation. Inline validation + typo detection (gmial.com --> gmail.com). Mobile keyboard (`type="email"`).
- **Name**: Single "Name" vs First/Last -- test this. Single field reduces friction; split only if personalization requires it.
- **Phone**: Make optional if possible; if required, explain why. Auto-format as typed. Mobile keyboard (`type="tel"`).
- **Company**: Auto-suggest for faster entry. Enrichment after submission (Clearbit, etc.). Consider inferring from email domain.
- **Password**: Show/hide toggle. Show requirements upfront, not after failure. Allow paste. Consider passwordless options.
- **Dropdown selects**: "Select one..." placeholder. Searchable if >10 options. Radio buttons if <5 options. Always include "Other" with text field.

### Progressive Profiling

Collect more data over time, not all at once:
1. **First touch**: Email only (lowest barrier)
2. **Second touch**: Name + company (after they engage)
3. **Third touch**: Role, team size, use case (after they return)
4. **Ongoing**: Behavioral data (what they click, read, download)

### Multi-Step Forms

Use when: more than 5-6 fields required, logically distinct sections, conditional paths, complex forms.

**Structure:**
```
Step 1: Low commitment (email) -- "What's your email?" -- CTA: "Continue"
Step 2: Qualifying info -- Company / Industry -- CTA: "Almost there"
Step 3: Contact details -- Name / Phone (optional) -- CTA: "Get My [Deliverable]"
```

**Best practices:** Progress indicator, start easy and end with sensitive questions, one topic per step, allow back navigation, save progress, capture partial data.

### Social Auth Strategy

- Position prominently -- often higher conversion than email forms
- **B2C**: Google, Apple, Facebook
- **B2B**: Google, Microsoft, SSO
- **Developer**: GitHub, Google
- Consider "Sign up with Google" as primary CTA

### Error Handling

- Validate on field blur (not while typing)
- Green check for valid, red border for invalid
- Specific messages: "Please enter a valid email (e.g., name@company.com)"
- On submit: focus on first error field, preserve all entered data

### Form Metrics

| Metric | What it measures |
|--------|-----------------|
| Form start rate | Page views --> first field focus |
| Completion rate | Started --> submitted |
| Field drop-off | Which specific fields lose people |
| Error rate by field | Which fields cause most errors |
| Time to complete | Total and per field |
| Mobile vs desktop | Completion rate by device |

---

## Popup Strategy

### Trigger Taxonomy

| Trigger | When | Best for |
|---------|------|----------|
| Time-based (30-60s) | After proven engagement | General visitors |
| Scroll-based (25-50%) | Content engagement indicator | Blog, long-form content |
| Exit intent | Cursor toward close/address bar | E-commerce, lead gen |
| Click-triggered | User clicks button/link | Lead magnets, gated content, demos |
| Session/page count | After visiting X pages | Multi-page research journeys |
| Behavior-based | Cart abandonment, pricing page visit | High-intent segments |

**Avoid:** Showing after 5 seconds (too early, annoying).

### Frequency Capping

- Show maximum once per session
- Remember dismissals (cookie/localStorage)
- 7-30 days before showing again after dismissal
- Escalation: first visit = value-focused, return visit (7+ days) = different angle, third visit = final attempt then stop

### Compliance

- **GDPR**: Clear consent language, link to privacy policy, do NOT pre-check opt-in boxes
- **Google**: Intrusive interstitials hurt mobile SEO. Don't block content access on mobile.
- **Accessibility**: Keyboard navigable, focus trap, screen reader compatible, sufficient contrast

### Strategy by Business Type

- **E-commerce**: Entry discount --> exit intent bigger discount --> cart abandonment reminder
- **B2B SaaS**: Click-triggered demos --> scroll-based newsletter --> exit intent trial offer
- **Content/Media**: Scroll-based newsletter --> page count subscribe --> exit intent capture
- **Lead gen**: Time-delayed list building --> click-triggered lead magnets --> exit intent final capture

### Benchmarks

| Type | Typical CVR | Good CVR |
|------|-------------|----------|
| Email capture | 2-5% | >5% |
| Exit intent | 3-10% | >10% |
| Click-triggered | 10%+ | 15%+ |
| Discount popup | 5-8% | >10% |

### Sizing

- **Desktop**: 400-600px wide, don't cover entire screen, close button top right, click outside to close
- **Mobile**: Full-width bottom slide-up, do NOT cover full screen (Google penalty), large touch targets, swipe down to dismiss

---

## Paywall Strategy

### Trigger Points

| Trigger | Context | Key principles |
|---------|---------|---------------|
| Feature gate | User clicks paid feature | Explain why it's paid, show preview, quick unlock path, option to continue free |
| Usage limit | User hits plan limit | Progress bar at 100%, upgrade vs optimize options, warn at 75% AND 100% |
| Trial expiration | Trial ending | Warn at 7d, 3d, 1d before; summarize value received; easy re-activation |
| Context-triggered | Behavior indicates upgrade fit | Power users, team features, heavy usage, repeated premium page visits |
| Time-based | After X days of free use | Gentle banner (not modal), highlight relevant paid features, easy to dismiss |

### Timing Rules

**Show:** After aha moment, when hitting genuine limits, adjacent to paid features, at natural transition points.

**Do NOT show:** During onboarding, mid-workflow, repeatedly after dismissal, before they understand the product.

**Frequency:** Max 1 hard paywall per session. Max 1 soft prompt per day. Cool-down after dismiss: days, not hours.

### Anti-Patterns (Never Do)

- Hiding close/dismiss button
- Confusing plan selection UI
- Burying the downgrade option
- Fake urgency ("Only 2 seats left!" when false)
- Guilt-trip decline copy
- Surprise charges after trial
- Hard-to-cancel subscriptions
- Data hostage tactics

### Paywall Screen Anatomy

1. **Headline**: Focus on what they get, not what they pay ("Unlock [Feature] to [Benefit]")
2. **Value demonstration**: Preview, before/after, use-case specific
3. **Feature comparison**: Highlight key differences between tiers
4. **Pricing**: Clear, simple, annual vs monthly options
5. **Social proof**: Customer quotes about the upgrade (optional)
6. **CTA**: Specific ("Upgrade to Pro") not generic ("Upgrade")
7. **Escape hatch**: Clear "Not now" -- don't make them feel bad

### Business Model Patterns

| Model | Key trigger | Key metric |
|-------|-----------|------------|
| Freemium SaaS | Feature gates + usage limits | Free --> paid conversion rate |
| Free trial | Trial countdown + value summary | Trial --> paid conversion rate |
| Usage-based | Usage tracking + threshold alerts | Expansion revenue per user |
| Per-seat | Teammate invitation friction | Seats per account |

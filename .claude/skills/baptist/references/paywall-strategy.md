# Paywall Strategy Reference

Strategic reference for in-app paywall and upgrade CRO. For paywall screen design, delegate to Seurat. For upgrade messaging copy, delegate to Ghostwriter.

---

## Trigger Points

### Feature Gate
User clicks a paid-only feature.
- Clear explanation of why it's paid
- Show what the feature does (preview/demo)
- Quick path to unlock
- Option to continue without upgrading

### Usage Limit
User hits a plan limit.
- Clear indication of what limit was reached
- Visual: progress bar at 100%
- Upgrade vs delete/optimize options
- Don't block abruptly — warn at 75% and 100%

### Trial Expiration
Trial is ending.
- Early warnings: 7 days, 3 days, 1 day before
- Clear "what happens" on expiration
- Summarize value received during trial
- Easy re-activation if expired

### Context-Triggered
Behavior indicates upgrade fit:
- Power users hitting free limits frequently
- Teams using solo features (invite trigger)
- Heavy usage approaching limits
- Repeated visits to premium feature pages

### Time-Based
After X days/sessions of free use:
- Gentle upgrade reminder (banner, not modal)
- Highlight unused paid features relevant to their usage
- Easy to dismiss
- Not intrusive

---

## Timing Rules

### When to Show
- After aha moment (they understand the value)
- When hitting genuine limits
- When using features adjacent to paid capabilities
- During natural transition points (end of workflow, session start)

### When NOT to Show
- During onboarding (too early, no value yet)
- Mid-workflow (interrupts productivity)
- Repeatedly after dismissal (builds resentment)
- Before they understand the product

### Frequency Rules
- Limit hard paywalls: max 1 per session
- Soft prompts (banners): max 1 per day
- Cool-down after dismiss: days, not hours
- Escalate urgency only for trial expiration
- Track annoyance signals: rage clicks, support tickets, churn correlation

---

## Anti-Patterns

### Dark Patterns (Never Do)
- Hiding the close/dismiss button
- Confusing plan selection UI
- Burying the downgrade option
- Fake urgency ("Only 2 seats left!" when false)
- Guilt-trip decline copy ("No, I don't want to grow my business")

### Conversion Killers
- Asking before value is delivered
- Too frequent upgrade prompts
- Blocking critical workflows
- Unclear pricing (hidden fees, confusing tiers)
- Complicated upgrade process (too many steps)

### Trust Destroyers
- Surprise charges after trial
- Hard-to-cancel subscriptions
- Bait and switch (features removed after upgrade)
- Data hostage tactics ("pay or lose your data")

---

## Business Model Patterns

### Freemium SaaS
- Generous free tier to build habit
- Feature gates for power features
- Usage limits for volume
- Soft prompts for heavy free users
- **Key metric**: Free → paid conversion rate

### Free Trial
- Trial countdown prominent but not intrusive
- Value summary at expiration
- Grace period or easy restart
- Win-back offers for expired trials
- **Key metric**: Trial → paid conversion rate

### Usage-Based
- Clear usage tracking visible to user
- Alerts at thresholds (75%, 100%)
- Easy to add more without full plan change
- Volume discounts visible
- **Key metric**: Expansion revenue per user

### Per-Seat
- Friction at teammate invitation (upgrade moment)
- Team feature highlights (collaboration, shared views)
- Volume pricing clear
- Admin value proposition (security, control)
- **Key metric**: Seats per account, team conversion rate

---

## Paywall Screen Components

### Anatomy of an Effective Paywall
1. **Headline**: Focus on what they get, not what they pay
   - "Unlock [Feature] to [Benefit]"
   - NOT: "Upgrade to Pro for $X/month"
2. **Value demonstration**: Preview, before/after, use-case specific
3. **Feature comparison**: If showing tiers, highlight key differences
4. **Pricing**: Clear, simple, annual vs monthly options
5. **Social proof**: Customer quotes about the upgrade (optional)
6. **CTA**: Specific ("Upgrade to Pro") not generic ("Upgrade")
7. **Escape hatch**: Clear "Not now" — don't make them feel bad

### Mobile Specific
- Full-screen acceptable (matches OS conventions)
- Swipe to dismiss
- Large tap targets for plan selection
- System-like styling builds trust
- App Store guidelines compliance (clear pricing, restore purchases)

---

## Experiment Ideas

### Trigger and Timing
- After aha moment vs at feature attempt
- Early trial reminder (7d) vs late (1d)
- After X actions completed vs after X days
- Soft prompts at different engagement thresholds

### Design
- Full-screen vs modal overlay
- Minimal (CTA-focused) vs feature-rich
- Single plan vs plan comparison
- Show what they'll lose (loss aversion) vs what they'll gain

### Pricing
- Monthly vs annual vs both with toggle
- Savings: dollar amount vs percentage
- "Less than a coffee/day" framing
- Show price prominently vs de-emphasize until click

### Copy
- Benefit-focused vs feature-focused headline
- Urgency-based vs value-based messaging
- Personalized with usage data vs generic
- Social proof headline ("Join 10K+ Pro users") vs not

### Frequency
- Number of prompts per session
- Cool-down: hours vs days after dismiss
- Escalating urgency vs consistent messaging
- "Maybe later" vs "Remind me tomorrow" dismiss options

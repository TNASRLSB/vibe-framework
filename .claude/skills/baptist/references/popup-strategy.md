# Popup Strategy Reference

Strategic reference for popup CRO decisions. For visual design and layout, delegate to Seurat. For copy, delegate to Ghostwriter.

---

## Trigger Taxonomy

### Time-Based
- **Not recommended**: Show after 5 seconds (too early, annoying)
- **Better**: Show after 30-60 seconds (proven engagement)
- Best for: General site visitors

### Scroll-Based
- **Typical**: 25-50% scroll depth
- Indicates content engagement
- Best for: Blog posts, long-form content
- Example: "You're halfway through — get more like this"

### Exit Intent
- Detects cursor moving toward close/address bar
- Last-chance capture
- Best for: E-commerce, lead gen
- Mobile alternative: Back button detection or scroll-up behavior

### Click-Triggered
- User initiates (clicks button/link)
- Zero annoyance factor — user opted in
- Best for: Lead magnets, gated content, demos

### Session/Page Count
- After visiting X pages
- Indicates research/comparison behavior
- Best for: Multi-page research journeys

### Behavior-Based
- Cart abandonment
- Pricing page visitors
- Repeat page visits
- Best for: High-intent segments

---

## Frequency Capping

### Rules
- Show maximum once per session
- Remember dismissals (cookie/localStorage)
- 7-30 days before showing again after dismissal
- Respect user choice — dismissed = not interested right now

### Escalation
For returning visitors who dismissed:
- First visit: Value-focused offer
- Return visit (7+ days later): Different angle or stronger offer
- Third visit: Final attempt, then stop

---

## Compliance

### GDPR/Privacy
- Clear consent language
- Link to privacy policy
- Do NOT pre-check opt-in boxes
- Honor unsubscribe/preferences

### Google Guidelines
- Intrusive interstitials hurt mobile SEO ranking
- **Allowed**: Cookie notices, age verification, reasonable banners
- **Penalized**: Full-screen popups before content on mobile
- Rule: Don't block content access on mobile

### Accessibility
- Keyboard navigable (Tab, Enter, Esc to close)
- Focus trap while popup is open
- Screen reader compatible (ARIA roles)
- Sufficient color contrast
- Don't rely on color alone for meaning

---

## Strategy by Business Type

### E-commerce
1. **Entry/scroll**: First-purchase discount (10% off)
2. **Exit intent**: Bigger discount or cart reminder
3. **Cart abandonment**: "You left items in your cart"

### B2B SaaS
1. **Click-triggered**: Demo request, lead magnets
2. **Scroll**: Newsletter/blog subscription
3. **Exit intent**: Trial offer or content download

### Content/Media
1. **Scroll-based**: Newsletter after engagement
2. **Page count**: Subscribe after multiple visits
3. **Exit intent**: "Don't miss future content"

### Lead Generation
1. **Time-delayed**: General list building
2. **Click-triggered**: Specific lead magnets
3. **Exit intent**: Final capture attempt

---

## Benchmarks

| Popup Type | Typical CVR | Good CVR |
|---|---|---|
| Email capture | 2-5% | >5% |
| Exit intent | 3-10% | >10% |
| Click-triggered | 10%+ | 15%+ (self-selected) |
| Discount popup | 5-8% | >10% |

---

## Sizing and Placement

### Desktop
- 400-600px wide typical
- Don't cover entire screen
- Close button always visible (top right)
- Click outside to close

### Mobile
- Full-width bottom slide-up preferred
- Do NOT cover full screen (Google penalty + UX)
- Large touch targets for close
- Swipe down to dismiss

---

## Experiment Ideas

### Trigger
- Exit intent vs 30-second delay vs 50% scroll
- Optimal time delay (10s vs 30s vs 60s)
- Scroll depth percentage (25% vs 50% vs 75%)
- Page count trigger (after X pages)

### Format
- Center modal vs slide-in from corner
- Full-screen overlay vs smaller modal
- Bottom bar vs corner popup
- Banner with countdown vs without

### Frequency
- Once per session vs once per week
- Cool-down period after dismissal
- Escalating offers over multiple visits

### Content
- Urgency-focused vs value-focused copy
- With/without images
- Include social proof in popup vs not
- Countdown timer vs no timer

# Form Strategy Reference

Strategic reference for form CRO decisions. For UI implementation (layout, styling, components), delegate to Seurat.

---

## Field Strategy: When to Keep, Defer, or Remove

### Decision Framework

For each field, ask:
1. Is this required before we can help them? → **Keep**
2. Can we get this later (progressive profiling)? → **Defer**
3. Can we infer this from other data (email domain → company)? → **Remove**

### Field Priority by Form Type

| Field | Lead Capture | Contact | Demo Request | Quote | Checkout |
|---|---|---|---|---|---|
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

**2026 Benchmark**: Average checkout = 5.1 steps, 11.3 fields (Baymard). Target ≤5 fields for lead gen.

---

## Field-by-Field Optimization

### Email
- Single field, no confirmation
- Inline validation + typo detection (gmial.com → gmail.com)
- Proper mobile keyboard (`type="email"`)

### Name
- Single "Name" vs First/Last — test this
- Single field reduces friction; split only if personalization requires it

### Phone
- Make optional if possible; if required, explain why
- Auto-format as typed; country code handling
- Proper mobile keyboard (`type="tel"`)

### Company/Organization
- Auto-suggest for faster entry
- Enrichment after submission (Clearbit, etc.)
- Consider inferring from email domain

### Password
- Show/hide toggle (eye icon)
- Show requirements upfront, not after failure
- Allow paste; strength meter over rigid rules
- Consider passwordless options

### Dropdown Selects
- "Select one..." placeholder
- Searchable if >10 options
- Radio buttons if <5 options
- Always include "Other" with text field

---

## Progressive Profiling

Collect more data over time, not all at once.

### Pattern
1. **First touch**: Email only (lowest barrier)
2. **Second touch**: Name + company (after they engage)
3. **Third touch**: Role, team size, use case (after they return)
4. **Ongoing**: Behavioral data (what they click, read, download)

### Implementation Approaches
- Multi-step forms with early steps captured even if abandoned
- Post-conversion follow-up questions
- In-app progressive profiling after signup
- Enrichment APIs (Clearbit, ZoomInfo) to fill gaps automatically

---

## Multi-Step Forms

### When to Use
- More than 5-6 fields required
- Logically distinct sections
- Conditional paths based on answers
- Complex forms (applications, quotes)

### Structure

```
Step 1: Low commitment (email)
├─ "What's your email?"
├─ Progress: 1 of 3
└─ CTA: "Continue"

Step 2: Qualifying info
├─ Company / Industry
├─ Progress: 2 of 3
└─ CTA: "Almost there"

Step 3: Contact details
├─ Name / Phone (optional)
├─ Progress: 3 of 3
└─ CTA: "Get My [Deliverable]"
```

### Best Practices
- Progress indicator (step X of Y)
- Start easy, end with sensitive questions
- One topic per step
- Allow back navigation
- Save progress (don't lose data on refresh)
- Capture partial data — even abandoned multi-step forms yield value

---

## Social Auth Strategy

### Placement
- Position prominently — often higher conversion than email forms
- Clear visual separator from email signup ("OR")

### Provider Selection by Audience
- **B2C**: Google, Apple, Facebook
- **B2B**: Google, Microsoft, SSO
- **Developer**: GitHub, Google

### Considerations
- Consider "Sign up with Google" as primary CTA
- Social auth reduces form fields to zero
- Track social vs email signup ratio to understand preferences

---

## Error Handling

### Inline Validation
- Validate on field blur (not while typing)
- Green check for valid, red border for invalid
- Specific messages: "Please enter a valid email (e.g., name@company.com)"

### On Submit
- Focus on first error field
- Summarize errors if multiple
- Preserve all entered data — never clear form on error

---

## Measurement

### Key Form Metrics
| Metric | What it measures |
|---|---|
| Form start rate | Page views → first field focus |
| Completion rate | Started → submitted |
| Field drop-off | Which specific fields lose people |
| Error rate by field | Which fields cause most errors |
| Time to complete | Total and per field |
| Mobile vs desktop | Completion rate by device |

### What to Track
- Form views
- First field focus
- Each field completion event
- Errors by field
- Submit attempts (including failures)
- Successful submissions

---

## Experiment Ideas

### Structure
- Single-step vs multi-step with progress bar
- Form embedded on page vs separate page
- Form above fold vs after content

### Fields
- Reduce to minimum viable fields
- Add/remove phone number
- Add/remove company field
- Test required vs optional balance
- Progressive profiling vs asking everything upfront

### Copy
- Button text: "Submit" vs "Get My Quote" vs specific action
- Field labels: minimal vs descriptive
- Help text: show vs hide vs on-hover
- Error message tone: friendly vs direct

### Trust
- Privacy assurance near form
- Trust badges near submit button
- Testimonial near form
- Expected response time

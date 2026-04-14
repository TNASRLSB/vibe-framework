# Validation Checklist — 53+ Rules

This is the complete validation checklist for Ghostwriter. Run every applicable rule against content before delivery.

**Scoring:** Each rule is PASS, FAIL, or WARN. Calculate overall score as: (PASS count / applicable rule count) * 100.

---

## Category 1: Technical SEO (12 rules)

### T01 — Title Tag Length
- **Rule:** Title tag is 50-60 characters
- **Pass:** Character count within range, primary keyword present
- **Fail:** Under 50 (too short to be descriptive) or over 60 (will be truncated)
- **Priority:** Critical

### T02 — Meta Description Length
- **Rule:** Meta description is 150-160 characters
- **Pass:** Character count within range, includes CTA language
- **Fail:** Under 150 (underutilized) or over 160 (truncated)
- **Priority:** Critical

### T03 — H1 Tag
- **Rule:** Exactly one H1 per page, includes primary keyword
- **Pass:** Single H1, keyword present naturally
- **Fail:** Missing H1, multiple H1s, or keyword absent
- **Priority:** Critical

### T04 — Heading Hierarchy
- **Rule:** Headings follow sequential order (H1 → H2 → H3), no levels skipped
- **Pass:** Clean hierarchy, logical nesting
- **Fail:** Skipped levels (H1 → H3) or headings used for styling
- **Priority:** High

### T05 — Schema Markup Present
- **Rule:** JSON-LD structured data appropriate to content type
- **Pass:** Valid JSON-LD with correct @type (Article, FAQ, Product, HowTo)
- **Fail:** No schema markup present
- **Warn:** Schema present but incomplete fields
- **Priority:** High

### T06 — Schema Markup Valid
- **Rule:** JSON-LD passes structural validation
- **Pass:** Valid JSON, correct @context, required fields present
- **Fail:** Malformed JSON, missing required fields, wrong @type
- **Priority:** High

### T07 — Canonical Tag
- **Rule:** Page specifies a canonical URL
- **Pass:** `<link rel="canonical">` present and pointing to correct URL
- **Fail:** Missing canonical tag
- **Warn:** Canonical points to different URL (may be intentional)
- **Priority:** Medium

### T08 — Image Alt Text
- **Rule:** All content images have descriptive alt text
- **Pass:** Every `<img>` has meaningful alt text (decorative images have `alt=""`)
- **Fail:** Images missing alt attribute entirely
- **Warn:** Alt text is generic ("image1") or keyword-stuffed
- **Priority:** High

### T09 — URL Structure
- **Rule:** URL is short, keyword-rich, hyphenated, lowercase
- **Pass:** Clean URL under 75 characters, includes primary keyword
- **Fail:** URL contains IDs, parameters, underscores, or uppercase
- **Warn:** URL over 75 characters but otherwise clean
- **Priority:** Medium

### T10 — Mobile Responsiveness
- **Rule:** Content is designed for mobile-first rendering
- **Pass:** Responsive layout, readable font sizes, touch-friendly elements
- **Fail:** Fixed-width layout, tiny text, overlapping elements on mobile
- **Priority:** High

### T11 — Page Speed Indicators
- **Rule:** No known speed blockers in content
- **Pass:** Images optimized, no inline scripts, no render-blocking resources noted
- **Fail:** Unoptimized images (>500KB), excessive inline scripts
- **Warn:** Large embedded videos without lazy loading
- **Priority:** Medium

### T12 — Open Graph / Social Meta
- **Rule:** OG tags present for social sharing
- **Pass:** og:title, og:description, og:image, og:url present
- **Fail:** No OG tags
- **Warn:** Partial OG tags (missing image)
- **Priority:** Low

---

## Category 2: Content Quality (14 rules)

### C01 — Content Length
- **Rule:** Content meets minimum length for type
- **Thresholds:**
  - Article / blog post: minimum 1,500 words
  - Landing page: minimum 500 words (excluding UI elements)
  - Product description: minimum 200 words
  - FAQ answer: minimum 50 words per answer
  - Pillar page: minimum 3,000 words
- **Pass:** Meets or exceeds threshold
- **Fail:** Below threshold
- **Priority:** High

### C02 — Keyword Density
- **Rule:** Primary keyword density between 1-2%, never above 3%
- **Pass:** Density in 1-2% range
- **Fail:** Above 3% (keyword stuffing) or below 0.5% (under-optimized)
- **Warn:** Between 2-3% (borderline)
- **Priority:** Critical

### C03 — Keyword in First 100 Words
- **Rule:** Primary keyword appears within the first 100 words
- **Pass:** Keyword present naturally in opening paragraph
- **Fail:** Keyword absent from first 100 words
- **Priority:** High

### C04 — Readability Score
- **Rule:** Flesch-Kincaid grade level appropriate for target audience
- **Pass:** Within target range for audience (see SKILL.md readability table)
- **Fail:** More than 2 grades above target (too complex) or 3 below (too simple)
- **Warn:** 1-2 grades outside target
- **Priority:** Medium

### C05 — Paragraph Length
- **Rule:** Paragraphs are 2-4 sentences for web content
- **Pass:** 80%+ of paragraphs within range
- **Fail:** Multiple paragraphs of 6+ sentences
- **Warn:** Occasional long paragraphs (5 sentences)
- **Priority:** Medium

### C06 — Sentence Variety
- **Rule:** Sentences vary in length and structure
- **Pass:** Mix of short (5-10 words), medium (15-20), and long (25-30)
- **Fail:** All sentences similar length, or 3+ consecutive sentences starting with the same word
- **Priority:** Medium

### C07 — Active Voice
- **Rule:** 80%+ of sentences use active voice
- **Pass:** Active voice predominant
- **Fail:** Passive voice in more than 20% of sentences
- **Warn:** 15-20% passive voice
- **Priority:** Medium

### C08 — Filler Phrases
- **Rule:** No filler phrases that add no meaning
- **Banned phrases:** "in order to" (use "to"), "it is important to note that" (delete), "as a matter of fact" (delete), "in today's world" (delete), "at the end of the day" (delete), "it goes without saying" (delete), "needless to say" (delete), "when all is said and done" (delete)
- **Pass:** Zero instances of banned phrases
- **Fail:** 3+ instances
- **Warn:** 1-2 instances
- **Priority:** Medium

### C09 — Transition Words
- **Rule:** 15%+ of sentences begin with transition words
- **Examples:** However, Therefore, Additionally, Meanwhile, Specifically, For example, In contrast, As a result, Furthermore
- **Pass:** 15%+ transition density
- **Fail:** Below 10%
- **Warn:** 10-15%
- **Priority:** Low

### C10 — Internal Links
- **Rule:** Minimum 3 internal links per article
- **Pass:** 3+ internal links with descriptive anchor text
- **Fail:** Fewer than 3 internal links
- **Warn:** Links present but with generic anchor text ("click here")
- **Priority:** High

### C11 — External Links
- **Rule:** 1-2 links to authoritative external sources
- **Pass:** External links to relevant, authoritative domains
- **Fail:** Zero external links on informational content
- **Warn:** External links to low-authority or irrelevant sites
- **Priority:** Medium

### C12 — Duplicate Content
- **Rule:** Content is original, not substantially similar to existing pages on the same site
- **Pass:** Unique content addressing a distinct topic
- **Fail:** 50%+ overlap with another page on the same site
- **Warn:** Significant overlap in approach or structure
- **Priority:** High

### C13 — Table of Contents
- **Rule:** Articles over 2,000 words include a table of contents
- **Pass:** TOC present with anchor links to H2 sections
- **Fail:** Long article without TOC
- **Not applicable:** Content under 2,000 words
- **Priority:** Medium

### C14 — Featured Snippet Optimization
- **Rule:** Target question is answered concisely (40-60 words) near the top
- **Pass:** Direct answer present within first H2 section, 40-60 words
- **Fail:** No concise answer — information spread across multiple sections
- **Warn:** Answer present but over 60 words
- **Priority:** High

---

## Category 3: GEO — AI Search Optimization (12 rules)

### G01 — Quotable Statements
- **Rule:** 3-5 quotable statements per major section (H2 block)
- **Quotable defined:** Self-contained, specific, authoritative, 15-40 words, no hedging
- **Pass:** Each H2 section contains 3+ quotable statements
- **Fail:** Sections with 0-1 quotable statements
- **Warn:** Sections with 2 quotable statements
- **Priority:** Critical

### G02 — Entity Precision
- **Rule:** Named entities are specific (product names, version numbers, company names)
- **Pass:** Entities named precisely: "React 18" not "the framework," "Google's March 2025 Core Update" not "the recent update"
- **Fail:** Vague references where specific names exist
- **Priority:** High

### G03 — Entity Definitions
- **Rule:** Technical terms and abbreviations defined on first use
- **Pass:** Each technical term has a clear definition or parenthetical explanation on first appearance
- **Fail:** Technical terms used without definition in content targeting general audiences
- **Warn:** Definitions present but unclear or buried
- **Priority:** Medium

### G04 — Freshness Signals
- **Rule:** Content includes temporal markers (dates, versions, "as of")
- **Pass:** Statistics dated, tool versions specified, "as of [year]" present for time-sensitive claims
- **Fail:** Time-sensitive information with no temporal markers
- **Warn:** Some freshness signals but inconsistent
- **Priority:** High

### G05 — Answer-First Structure
- **Rule:** Informational content puts the answer before the explanation
- **Pass:** Each question-intent section leads with a direct 1-2 sentence answer
- **Fail:** Answers buried after lengthy preamble
- **Priority:** High

### G06 — Comparison Tables
- **Rule:** Comparative content uses tables, not prose
- **Pass:** Data comparisons presented in structured tables
- **Fail:** Comparative data only in paragraph form
- **Not applicable:** Content without comparative elements
- **Priority:** Medium

### G07 — Statistic Attribution
- **Rule:** Statistics include source and date
- **Pass:** Each stat has source and date: "62% (Statcounter, 2026)"
- **Fail:** Unsourced statistics: "most companies" or "62% of marketers"
- **Warn:** Source present but date missing
- **Priority:** High

### G08 — No Hedging in Key Statements
- **Rule:** Core claims use confident, declarative language
- **Hedging patterns:** "It could be argued," "Many experts believe," "It is generally thought," "Some people say"
- **Pass:** Key statements are direct and authoritative
- **Fail:** Core claims weakened by hedging language
- **Warn:** Appropriate hedging for genuinely uncertain claims (acceptable)
- **Priority:** Medium

### G09 — Definitional Sentences
- **Rule:** Content includes "X is Y" definitions that AI can extract
- **Pass:** 2+ clear definitional sentences per 500 words
- **Fail:** No definitional sentences in content explaining concepts
- **Priority:** Medium

### G10 — Self-Contained Statements
- **Rule:** Key claims make sense without surrounding context
- **Pass:** Key statements don't depend on pronouns or references to "the above" or "as mentioned"
- **Fail:** Important claims require reading previous paragraphs to understand
- **Priority:** Medium

### G11 — Consistent Entity Naming
- **Rule:** Each entity is referred to with the same name throughout
- **Pass:** Consistent naming (always "React" or always "React.js" — not alternating)
- **Fail:** Same entity called by 3+ different names
- **Warn:** Minor variation (with/without version number)
- **Priority:** Low

### G12 — Server-Side Renderability
- **Rule:** Content is available without JavaScript execution
- **Pass:** Content in static HTML or server-rendered
- **Fail:** Content only available via client-side JavaScript rendering
- **Warn:** Critical content server-rendered, supplementary content client-side
- **Priority:** High

---

## Category 4: Copywriting & Conversion (14 rules)

### X01 — Headline Strength
- **Rule:** H1/headline uses proven formula with power words, specificity, or emotional trigger
- **Pass:** Headline matches a proven formula, includes at least one power word or number
- **Fail:** Generic headline: "About Our Product" or "Welcome to Our Blog"
- **Priority:** Critical

### X02 — Opening Hook
- **Rule:** First 1-2 sentences arrest attention
- **Accepted hooks:** Bold statistic, provocative claim, specific story, direct question, counterintuitive statement
- **Pass:** Opening grabs attention and earns the next paragraph
- **Fail:** Opens with generic statement: "In today's digital world..." or "Welcome to our guide..."
- **Priority:** High

### X03 — CTA Presence
- **Rule:** Content includes at least one clear call-to-action
- **Pass:** CTA present, specific, action-oriented, benefit-driven
- **Fail:** No CTA, or CTA is vague ("Contact us")
- **Warn:** CTA present but weak ("Learn more")
- **Priority:** Critical

### X04 — CTA Clarity
- **Rule:** CTA tells the reader exactly what to do and what they get
- **Pass:** "Start your free 14-day trial" or "Download the 2026 SEO checklist"
- **Fail:** "Submit" or "Click here" or "Next"
- **Priority:** High

### X05 — Value Proposition
- **Rule:** The unique value proposition is clear within the first screen
- **Pass:** Reader understands "what is this" and "why should I care" within 5 seconds of reading
- **Fail:** Value proposition unclear or absent from above-the-fold content
- **Priority:** Critical

### X06 — Social Proof
- **Rule:** Content includes at least one form of social proof (for landing pages and product pages)
- **Types:** Testimonials, case study numbers, client logos, user count, ratings, press mentions
- **Pass:** Specific social proof present ("4.8/5 from 500+ reviews" or named testimonial)
- **Fail:** No social proof on conversion-oriented pages
- **Warn:** Generic social proof ("trusted by thousands")
- **Not applicable:** Informational articles (optional but beneficial)
- **Priority:** High

### X07 — Friction Reduction
- **Rule:** CTA area includes friction-reducing text
- **Examples:** "No credit card required," "Cancel anytime," "30-day money-back guarantee," "Takes 30 seconds"
- **Pass:** At least one friction reducer near primary CTA
- **Fail:** CTA with no friction reduction on pages asking for commitment
- **Not applicable:** Informational content without conversion goal
- **Priority:** Medium

### X08 — Benefit Over Feature
- **Rule:** Benefits are communicated before or alongside features
- **Pass:** Headlines and lead copy focus on outcomes for the reader
- **Fail:** Copy leads with features or technical specs without translating to benefits
- **Priority:** High

### X09 — Persuasion Framework Applied
- **Rule:** Content follows a recognized persuasion structure (AIDA, PAS, BAB, 4Ps, FAB, PASTOR)
- **Pass:** Clear framework structure identifiable, appropriate to content type
- **Fail:** Unstructured persuasion — information without a conversion arc
- **Not applicable:** Purely informational articles
- **Priority:** Medium

### X10 — Objection Handling
- **Rule:** Common objections are addressed in the content
- **Typical objections:** Price, complexity, time investment, switching cost, trust, "why now?"
- **Pass:** 2+ objections addressed (FAQ, comparison section, or inline)
- **Fail:** No objection handling on conversion-oriented pages
- **Not applicable:** Informational articles
- **Priority:** Medium

### X11 — Urgency/Scarcity (Ethical)
- **Rule:** If urgency or scarcity is used, it must be genuine
- **Pass:** Real deadlines, real limits, clearly stated
- **Fail:** Fake countdown timers, fabricated limits, manufactured urgency
- **Warn:** Urgency language without specific deadline or limit
- **Priority:** Medium

### X12 — Emotional Trigger
- **Rule:** Content connects with at least one emotional trigger relevant to the audience
- **Pass:** Pain points named, aspirations evoked, or emotional language appropriate to context
- **Fail:** Completely emotionless, feature-dump content
- **Priority:** Medium

### X13 — Scanability
- **Rule:** Content is easily scannable with visual hierarchy
- **Elements:** Headings, bullet lists, bold key phrases, short paragraphs, whitespace
- **Pass:** Reader can grasp main points by scanning headings and bold text
- **Fail:** Wall of text without formatting
- **Priority:** High

### X14 — Consistent Tone
- **Rule:** Voice and tone are consistent throughout the piece
- **Pass:** Same register (formal/casual), same person (first/second/third), same energy level
- **Fail:** Tone shifts jarring — switches from casual to corporate or from confident to hedging
- **Priority:** Medium

---

## Scoring Summary

| Category | Rules | Weight |
|----------|-------|--------|
| Technical SEO | T01-T12 (12 rules) | 25% |
| Content Quality | C01-C14 (14 rules) | 25% |
| GEO / AI Search | G01-G12 (12 rules) | 25% |
| Copywriting / Conversion | X01-X14 (14 rules) | 25% |
| Content Separation | S01 (1 rule) | — |
| **Total** | **53 rules** | **100%** |

### Score Calculation

```
Category Score = (PASS count / applicable rules in category) * 100
Overall Score = (Technical * 0.25) + (Content * 0.25) + (GEO * 0.25) + (Copywriting * 0.25)
```

### Score Interpretation

| Score | Rating | Recommendation |
|-------|--------|----------------|
| 90-100 | Excellent | Ready to publish |
| 80-89 | Good | Minor improvements recommended |
| 70-79 | Adequate | Address FAIL items before publishing |
| 60-69 | Needs Work | Significant improvements required |
| Below 60 | Poor | Major rewrite recommended |

### Critical Rules (Must Pass)

These rules must PASS regardless of overall score. Content should not be published with any of these failing:

1. **T01** — Title tag length and keyword
2. **T02** — Meta description length
3. **T03** — H1 presence and keyword
4. **C02** — Keyword density (no stuffing)
5. **G01** — Quotable statements present
6. **X01** — Headline strength
7. **X03** — CTA present
8. **X05** — Value proposition clear
9. **S01** — Content JSON completeness

If any critical rule fails, the overall score is capped at 69 regardless of other scores.

---

## Category 5: Content Separation (1 rule)

### S01 — Content JSON Completeness
- **Rule:** All user-facing text must be structured in `content/[lang]/[page].json`. No text may be hardcoded in HTML, JSX, or template files.
- **Pass:** Every visible string (headings, paragraphs, button text, image alt text, meta tags, navigation labels, footer text) exists as a key in the content JSON. HTML/JSX contains only `data-i18n` references or `t()` calls.
- **Fail:** Any visible text found directly in HTML/JSX rather than referenced from content JSON.
- **Priority:** Critical
- **How to check:** After structuring copy into JSON, scan the HTML template or JSX components. Every element that displays text must have a `data-i18n` attribute (static) or `t()` call (React). If you find literal text in the markup, move it to the JSON and replace with a key reference.

# Validation Rules

Measurable, objective criteria for validating SEO-GEO-Copy content.

---

## How to Use

Each rule has:
- **Rule ID**: For reference
- **Check**: What to verify
- **Pass condition**: Objective criteria
- **Fail action**: What to do if it fails

Apply relevant rules after generation. Report pass/fail for each.

---

## SEO Rules

### SEO-001: Title Tag Length
- **Check**: Count characters in title tag (count EVERY character including spaces and pipes)
- **Pass**: 30-55 characters (hard max: 60. NEVER exceed 60.)
- **Fail**: Truncate or expand. If over 55, rewrite — do NOT just cut words
- **Common mistake**: Brand name repeated (e.g. "Brand | Tagline | Brand"). Verify brand appears ONCE max

### SEO-002: Title Keyword Position
- **Check**: Position of primary keyword in title
- **Pass**: Keyword starts within first 30 characters
- **Fail**: Rewrite to front-load keyword

### SEO-003: Meta Description Length
- **Check**: Count characters in meta description (count EVERY character including spaces and punctuation)
- **Pass**: 120-155 characters (hard max: 158. NEVER exceed 158.)
- **Fail**: Rewrite to fit. Count again AFTER rewriting — off-by-one errors are the #1 failure
- **Common mistake**: Generating exactly 160 chars which after encoding/rendering becomes 161+. Use 155 as target.

### SEO-004: Meta Description Keyword
- **Check**: Primary keyword present in meta description
- **Pass**: Keyword appears at least once
- **Fail**: Rewrite to include keyword naturally

### SEO-005: H1 Presence
- **Check**: Page has exactly one H1
- **Pass**: Exactly 1 H1 tag
- **Fail**: Add H1 or remove duplicates

### SEO-006: H1 Keyword
- **Check**: Primary keyword in H1
- **Pass**: Keyword appears in H1
- **Fail**: Rewrite H1 to include keyword

### SEO-007: Keyword in First 100 Words
- **Check**: Primary keyword in first 100 words of body content
- **Pass**: Keyword appears in first 100 words
- **Fail**: Rewrite opening to include keyword

### SEO-008: Header Hierarchy
- **Check**: H2s follow H1, H3s follow H2s
- **Pass**: No skipped levels (H1→H3 without H2)
- **Fail**: Fix hierarchy

### SEO-009: Internal Links
- **Check**: Content has internal links to related pages
- **Pass**: Minimum 8 internal links for homepages/landing pages. At least 3 per 1000 words for articles.
- **Fail**: Add relevant internal links. For landing pages, link to: about, pricing, features, blog, legal, contact at minimum

### SEO-010: URL Slug
- **Check**: URL contains primary keyword, no stop words
- **Pass**: Keyword present, lowercase, hyphens, under 60 chars
- **Fail**: Suggest corrected slug

### SEO-011: External Links
- **Check**: Content has external links to authoritative sources
- **Pass**: At least 1 external link for landing pages, at least 2 for articles
- **Fail**: Add links to authoritative, relevant external resources (industry reports, standards, studies)

### SEO-012: H2 Section Count
- **Check**: Page has sufficient H2 headings for content structure
- **Pass**: Minimum 4 H2s for landing pages/homepages, minimum 3 for articles over 500 words
- **Fail**: Split content into more sections with descriptive H2 headings containing keywords

---

## GEO Rules

### GEO-001: Answer-First Opening
- **Check**: First paragraph directly answers the main query
- **Pass**: Opening paragraph can stand alone as complete answer
- **Fail**: Rewrite opening with direct answer

### GEO-002: Self-Contained Paragraphs
- **Check**: Each paragraph is semantically complete
- **Pass**: No paragraph requires previous paragraph to make sense
- **Fail**: Rewrite to add necessary context within paragraph

### GEO-003: No Fluffy Intros
- **Check**: Content starts with substance
- **Pass**: No "In today's world...", "Have you ever wondered..."
- **Fail**: Delete fluff, start with answer

### GEO-004: Specific Claims
- **Check**: Claims include specifics
- **Pass**: Numbers, percentages, dates, or named sources present
- **Fail**: Add specific data or remove vague claim

### GEO-005: Source Attribution
- **Check**: Statistics and facts have sources
- **Pass**: Each statistic cites a source
- **Fail**: Add source or mark as "based on [qualifier]"

### GEO-006: Entity Clarity
- **Check**: Key entities are explicitly named
- **Pass**: Products, people, companies named (not just "it" or "they")
- **Fail**: Replace pronouns with explicit names on first use per section

### GEO-007: FAQ Answer Completeness
- **Check**: FAQ answers are self-contained
- **Pass**: Answers don't say "click here", "see above", "learn more"
- **Fail**: Rewrite answer to be complete

### GEO-008: Definition Presence
- **Check**: Key terms are defined
- **Pass**: Technical terms defined on first use
- **Fail**: Add inline definition or definition callout

### GEO-009: No Clickbait
- **Check**: Headlines match content
- **Pass**: Content delivers what headline promises
- **Fail**: Rewrite headline or add missing content

### GEO-010: Chunk Length
- **Check**: Paragraphs are appropriate length for extraction
- **Pass**: Most paragraphs 40-150 words
- **Fail**: Split long paragraphs or combine very short ones

### GEO-011: Citation Anchors
- **Check**: Content contains citation anchor patterns (authority phrases, quantitative data, or self-reference with document name)
- **Pass**: At least 2 citation anchors per article; at least 1 every 500 words for long-form content
- **Fail**: Add authority phrases ("Secondo [Source]..."), quantitative claims ("[N]%"), or self-references ("Questa guida...")

### GEO-012: Entity Salience
- **Check**: The primary entity of each section appears in the first 2 sentences after the heading
- **Pass**: H2/H3 keyword present in the first 30 words of the following paragraph, for 100% of sections
- **Fail**: Rewrite paragraph openings to front-load the section's primary entity

### GEO-013: Cross-Chunk Independence
- **Check**: No paragraph contains references to content in other paragraphs
- **Pass**: Zero occurrences of: "come detto", "sopra", "precedente", "vedi sezione", "come menzionato", "as mentioned", "see above", "previous section"
- **Fail**: Replace cross-references with explicit re-statements of the referenced concept

### GEO-014: Content Freshness Signals
- **Check**: Content includes publication date and last modified date (in Schema.org markup or visible body text)
- **Pass**: Both `datePublished` and `dateModified` present (in meta/Schema.org or in visible text)
- **Fail**: Add date metadata in Schema.org markup and/or visible "Ultimo aggiornamento: [date]" in body text

---

## Copywriting Rules

### COPY-001: Value Proposition Clarity
- **Check**: Clear value proposition within first scroll
- **Pass**: Reader knows "what's in it for me" in first 150 words
- **Fail**: Add explicit benefit statement

### COPY-002: You vs We Ratio
- **Check**: Ratio of "you/your" to "we/our/I" words
- **Pass**: "You" language used 2x more than "we" language
- **Fail**: Rewrite to focus on reader

### COPY-003: CTA Presence
- **Check**: Call to action present
- **Pass**: Clear next step for reader (per business intent)
- **Fail**: Add appropriate CTA

### COPY-004: CTA Clarity
- **Check**: CTA uses action verb + benefit
- **Pass**: CTA is specific ("Start Free Trial" not "Submit")
- **Fail**: Rewrite CTA

### COPY-005: Benefit vs Feature Ratio
- **Check**: Benefits stated, not just features
- **Pass**: Each feature is paired with a benefit
- **Fail**: Add "so you can..." or "which means..." after features

### COPY-006: Scannable Structure
- **Check**: Content is scannable
- **Pass**: Headers every 300 words max, bullets/lists present
- **Fail**: Add subheadings or break into lists

### COPY-007: Social Proof
- **Check**: Social proof present (where applicable)
- **Pass**: Testimonials, logos, numbers, or reviews included
- **Fail**: Add social proof or note gap for client

### COPY-008: Objection Handling
- **Check**: Common objections addressed (where applicable)
- **Pass**: At least one objection answered (FAQ, guarantee, comparison)
- **Fail**: Identify likely objections, add responses

### COPY-009: No Jargon Without Explanation
- **Check**: Technical terms explained
- **Pass**: Jargon either avoided or explained
- **Fail**: Add explanation or use simpler term

### COPY-010: Active Voice
- **Check**: Active voice dominant
- **Pass**: Less than 20% passive constructions
- **Fail**: Rewrite passive sentences

---

## Schema Rules

### SCHEMA-001: Schema Present
- **Check**: JSON-LD schema exists
- **Pass**: At least one schema type present
- **Fail**: Add appropriate schema

### SCHEMA-002: Schema Type Match
- **Check**: Schema type matches content type
- **Pass**: Article for articles, Product for products, etc.
- **Fail**: Change to correct schema type

### SCHEMA-003: Required Properties
- **Check**: Schema has required properties
- **Pass**: All required properties for that type present
- **Fail**: Add missing required properties

### SCHEMA-004: Valid JSON
- **Check**: JSON-LD is syntactically valid
- **Pass**: JSON parses without errors
- **Fail**: Fix syntax errors

### SCHEMA-005: No Schema Spam
- **Check**: Schema reflects actual page content
- **Pass**: All schema values match visible content
- **Fail**: Remove/correct mismatched values

---

## Technical Rules

### TECH-001: Image Alt Text
- **Check**: Images have alt text
- **Pass**: All images have descriptive alt text
- **Fail**: Add alt text

### TECH-002: Alt Text Quality
- **Check**: Alt text is descriptive
- **Pass**: Alt text describes image, includes keyword if natural
- **Fail**: Rewrite alt text

### TECH-003: No Broken Internal Links
- **Check**: Internal links point to existing pages
- **Pass**: All internal links resolve
- **Fail**: Fix or remove broken links

### TECH-004: Canonical Tag
- **Check**: Canonical tag present in `<head>`
- **Pass**: Self-referencing canonical present with full absolute URL
- **Fail**: Add `<link rel="canonical" href="https://..." />`. This is MANDATORY — never skip.

### TECH-005: Open Graph Tags
- **Check**: All required OG tags present
- **Pass**: og:title, og:description, og:image, og:url, og:type, og:site_name ALL present
- **Fail**: Add ALL missing OG tags. Partial OG is worse than none — social previews break with incomplete tags.

### TECH-006: XML Sitemap
- **Check**: XML sitemap exists and is accessible
- **Pass**: sitemap.xml accessible at /sitemap.xml or declared in robots.txt
- **Fail**: Generate sitemap.xml or configure framework to auto-generate. Submit to Google Search Console AND Bing Webmaster Tools.

### TECH-007: Robots.txt
- **Check**: robots.txt file exists and is properly configured
- **Pass**: robots.txt accessible at /robots.txt with appropriate Allow/Disallow directives
- **Fail**: Create robots.txt. At minimum: allow all search engine bots, reference sitemap URL.

### TECH-008: WWW Canonicalization
- **Check**: www and non-www versions redirect to same destination
- **Pass**: One version (www or non-www) 301-redirects to the other
- **Fail**: Configure DNS/hosting to redirect. Choose one canonical domain and redirect the other with 301.

### TECH-009: Noindex Verification
- **Check**: Pages intended for indexing do NOT have noindex meta tag or X-Robots-Tag header
- **Pass**: No unintentional noindex directives present
- **Fail**: Remove noindex tag/header. Common in staging deployments that go live without removing it.

---

## Validation Scoring

### Per-Rule Scoring
- Pass: 1 point
- Fail: 0 points

### Category Scores
- **SEO Score**: Points earned / 12
- **GEO Score**: Points earned / 14
- **Copy Score**: Points earned / 10
- **Schema Score**: Points earned / 5
- **Tech Score**: Points earned / 9

### Overall Score
Total points / 50 × 100 = Percentage

### Quality Thresholds
- **90-100%**: Production ready
- **80-89%**: Minor fixes needed
- **70-79%**: Significant issues, needs revision
- **Below 70%**: Major rewrite required

---

## Validation Report Template

```markdown
## Validation Report: [Page/Content Title]

**Date:** [Date]
**Content Type:** [Article/Landing Page/Product/etc.]
**Primary Keyword:** [Keyword]

### Scores

| Category | Score | Max | % |
|----------|-------|-----|---|
| SEO | X | 12 | X% |
| GEO | X | 14 | X% |
| Copy | X | 10 | X% |
| Schema | X | 5 | X% |
| Tech | X | 9 | X% |
| **Total** | **X** | **50** | **X%** |

### Failed Rules

| Rule ID | Issue | Fix Required |
|---------|-------|--------------|
| SEO-001 | Title 75 chars | Truncate to 60 |
| GEO-003 | Fluffy intro | Delete first paragraph |
| ... | ... | ... |

### Status
[ ] Production Ready
[ ] Minor Fixes Needed
[ ] Needs Revision
[ ] Major Rewrite Required

### Required Actions
1. [Action 1]
2. [Action 2]
...
```

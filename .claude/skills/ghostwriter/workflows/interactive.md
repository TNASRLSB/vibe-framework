# Interactive Workflow

Step-by-step guide for running SEO-GEO-Copy skill interactively.

---

## Command: `/ghostwriter write`

### Phase 0: Reference Discovery (Automatic)

Before asking questions, check for reference materials:

```
1. Check if reference/ directory exists
2. If exists:
   - Read reference/brand.md (voice, tone, terminology)
   - Read reference/context.md (business goals, constraints)
   - List reference/products/ contents
3. Use this context to:
   - Pre-fill tone/audience questions if specified
   - Offer product selection if products exist
   - Apply brand rules during generation
```

**If reference materials found, inform user:**
```
Found reference materials:
- Brand guidelines: [loaded/not found]
- Project context: [loaded/not found]
- Products: [X files found]

Using these to inform content generation.
```

### Phase 1: Intake Questions

**Ask in sequence:**

```
1. What type of content?
   [ ] Article / Blog Post
   [ ] Landing Page
   [ ] Product Description
   [ ] FAQ Section
   [ ] Homepage
   [ ] Category Page
   [ ] About Page
   [ ] Other: ___

2. What is the topic or subject?
   [Free text]

3. Who is the target audience?
   - Demographics: ___
   - Expertise level: [ ] Beginner [ ] Intermediate [ ] Expert
   - Primary pain point: ___

4. What is the primary keyword?
   [Free text]
   (I'll suggest if blank based on topic)

5. What action should readers take?
   [ ] Learn / Understand
   [ ] Compare options
   [ ] Sign up / Subscribe
   [ ] Purchase / Buy
   [ ] Contact / Inquire
   [ ] Download / Get
   [ ] Other: ___

6. Any specific requirements?
   - Word count: [ ] Short (<500) [ ] Medium (500-1500) [ ] Long (1500+)
   - Tone: [ ] Formal [ ] Conversational [ ] Technical [ ] Friendly
   - Must include: ___
   - Must avoid: ___
```

### Phase 2: Research & Planning

**I do this automatically:**

1. Analyze keyword intent
2. Draft content structure
3. Identify related keywords
4. Plan internal linking opportunities
5. Select appropriate schema type

**Show user:**
```
## Content Plan

**Target keyword:** [keyword]
**Search intent:** [informational/commercial/transactional]
**Recommended word count:** [range]
**Content structure:**
1. [H2 section 1]
2. [H2 section 2]
3. [H2 section 3]
...

**Schema type:** [Article/Product/FAQ/etc.]

Proceed with this plan? [Yes / Adjust]
```

### Phase 3: Generation

**Generate content following:**
1. Load appropriate generation prompt from `/generation/[type].md`
2. Apply all output checklist items
3. Generate full content
4. Generate SEO metadata
5. Generate Schema.org JSON-LD

### Phase 4: Validation

**Run validation automatically:**
1. Load rules from `/validation/rules.md`
2. Apply all relevant rules
3. Generate validation report
4. If score < 90%, fix issues automatically
5. Re-validate after fixes

### Phase 5: Delivery

**Present to user:**
```
## Generated Content

[Full content]

---

## SEO Metadata

[Title, description, URL slug]

---

## Schema.org JSON-LD

[JSON-LD code block]

---

## Validation Report

[Summary scores and any remaining issues]

---

## Next Steps

- [ ] Review and approve content
- [ ] Add to CMS
- [ ] Add internal links from existing pages
- [ ] Schedule publication
```

---

## Command: `/ghostwriter audit`

### Phase 1: Input Collection

```
1. What should I audit?
   [ ] Single page (provide URL or paste content)
   [ ] Multiple pages (provide URLs)
   [ ] Full site (provide sitemap or domain)

2. [If single page] Paste the content or provide URL:
   [Free text / URL]

3. What is the primary keyword for this page?
   [Free text]

4. What type of content is this?
   [ ] Article
   [ ] Landing page
   [ ] Product page
   [ ] Category page
   [ ] Homepage
   [ ] Other
```

### Phase 2: Analysis

**I do this automatically:**

1. Parse content structure
2. Extract current title/meta
3. Identify keywords used
4. Analyze headers and hierarchy
5. Check for schema
6. Evaluate content quality

### Phase 3: Validation

**Run full validation:**
1. Apply all rules from `/validation/rules.md`
2. Generate detailed report

### Phase 4: Recommendations

**Present prioritized fixes:**

```
## Audit Report: [Page Title]

### Score: X/40 (X%)

### Critical Issues (Fix First)
1. [Issue] - [Specific fix]
2. [Issue] - [Specific fix]

### High Priority
3. [Issue] - [Specific fix]
4. [Issue] - [Specific fix]

### Medium Priority
5. [Issue] - [Specific fix]

### Low Priority / Enhancements
6. [Issue] - [Specific fix]

---

### Rewritten Content (if requested)

[Provide fixed version]
```

---

## Command: `/ghostwriter schema`

### Phase 1: Input

```
1. What type of schema do you need?
   [ ] Article
   [ ] FAQ
   [ ] Product
   [ ] LocalBusiness
   [ ] Person
   [ ] HowTo
   [ ] Organization
   [ ] Event
   [ ] Other: ___

2. I'll need the following information:
   [Dynamic questions based on schema type selected]
```

### Phase 2: Schema-Specific Questions

**Article:**
- Headline?
- Author name?
- Publication date?
- Publisher name?
- Featured image URL?
- Article body summary?

**FAQ:**
- List your questions and answers:
  Q1: ___ A1: ___
  Q2: ___ A2: ___
  (continue as needed)

**Product:**
- Product name?
- Description?
- Brand?
- Price?
- Currency?
- Availability?
- SKU?
- Image URLs?
- Rating (if any)?

**LocalBusiness:**
- Business name?
- Address?
- Phone?
- Hours?
- Price range?
- Business type?

**Person:**
- Full name?
- Job title?
- Employer?
- Bio?
- Image URL?
- Social profiles?

**HowTo:**
- Title?
- Steps (name + description each)?
- Tools needed?
- Supplies needed?
- Total time?

### Phase 3: Generation

1. Load template from `/templates/schemas/[type].json`
2. Fill in user-provided values
3. Validate JSON syntax
4. Present completed schema

---

## Command: `/ghostwriter pillar-cluster`

### Phase 1: Topic Discovery

```
1. What is the core topic you want to own?
   [Free text]

2. What is your business/site about?
   [Free text - helps contextualize]

3. How much content can you realistically produce?
   [ ] 5-10 articles
   [ ] 10-20 articles
   [ ] 20+ articles

4. Any existing content to incorporate?
   [URLs or page names]
```

### Phase 2: Architecture Generation

1. Generate pillar page concept
2. Generate 8-15 cluster topics
3. Map relationships
4. Create internal linking plan

### Phase 3: Deliverable

```
## Pillar-Cluster Architecture: [Topic]

### Pillar Page
[Title and structure]

### Cluster Articles (Prioritized)
1. [Cluster] - [Why prioritized]
2. [Cluster]
...

### Implementation Roadmap
1. Create pillar page first
2. Then clusters in priority order
3. Add links as each piece publishes

### Content Briefs
[Brief for each piece]
```

---

## Command: `/ghostwriter research`

### Phase 1: Topic Input

```
1. What topic/keyword do you want to research?
   [Free text]

2. What is the business context?
   [ ] Product/service I sell
   [ ] Topic I want to rank for
   [ ] Competitor analysis
   [ ] Content gap identification

3. What geographic market?
   [ ] Global (English)
   [ ] Specific country: ___
   [ ] Local area: ___
```

### Phase 2: Research Execution

**I do this automatically:**

1. **Keyword Analysis**
   - Primary keyword identification
   - Long-tail variations (10-20)
   - Search intent classification
   - Estimated search volume indicators

2. **AI Platform Analysis**
   - Query ChatGPT, Claude, Perplexity with topic
   - Analyze what sources they cite
   - Identify content gaps in AI responses
   - Map entity relationships

3. **SERP Analysis**
   - Current top 10 results structure
   - Featured snippet opportunities
   - People Also Ask questions
   - Related searches

### Phase 3: Research Brief Delivery

```
## Research Brief: [Topic]

### Primary Keyword
[keyword] - Intent: [type] - Difficulty: [estimate]

### Long-Tail Opportunities
1. [keyword] - Intent: [type]
2. [keyword] - Intent: [type]
...

### Search Intent Analysis
- Informational queries: [%]
- Commercial queries: [%]
- Transactional queries: [%]

### AI Citation Analysis
- Top cited sources: [list]
- Content gaps AI couldn't answer: [list]
- Entity relationships: [map]

### SERP Features Available
- Featured snippet: [yes/no] - Format: [paragraph/list/table]
- People Also Ask: [list of questions]
- Related searches: [list]

### Content Recommendations
1. [Recommendation based on research]
2. [Recommendation]
3. [Recommendation]

### Recommended Next Steps
- [ ] `/ghostwriter write article` for [topic]
- [ ] `/ghostwriter pillar-cluster` for [topic]
```

---

## Command: `/ghostwriter optimize`

### Phase 1: Input Collection

```
1. Provide the content to optimize:
   [ ] File path: ___
   [ ] URL: ___
   [ ] Paste content directly

2. What is the target keyword?
   [Free text]

3. What type of content is this?
   [ ] Article / Blog Post
   [ ] Landing Page
   [ ] Product Description
   [ ] Category Page
   [ ] Homepage
```

### Phase 2: Analysis

**I do this automatically:**

1. Read the content
2. Analyze current SEO state
3. Analyze GEO readiness
4. Analyze copywriting effectiveness
5. Run validation against rules.md

### Phase 3: Optimization Plan

**Present before making changes:**

```
## Optimization Analysis: [Title]

### Current Score: X/50 (X%)

### Changes I Propose

**SEO Improvements:**
1. [Change] - Current: [X] → Proposed: [Y]
2. [Change]

**GEO Improvements:**
1. [Change] - Why: [reason]
2. [Change]

**Copywriting Improvements:**
1. [Change] - Impact: [expected result]
2. [Change]

### Impact Estimate
- SEO Score: X → Y (+Z)
- GEO Score: X → Y (+Z)
- Copywriting Score: X → Y (+Z)
- Total: X → Y (+Z%)

Apply these changes? [Yes / Customize / Skip specific changes]
```

### Phase 4: Execution

1. Apply approved changes
2. Re-run validation
3. Present diff with explanations
4. Deliver optimized content + updated metadata

---

## Command: `/ghostwriter persona`

### Phase 1: Audience Input

```
1. Who are you trying to reach?
   [Free text description]

2. What product/service are you selling to them?
   [Free text]

3. What do you know about your current customers?
   [ ] I have customer data/interviews
   [ ] I have website analytics
   [ ] I'm making assumptions
   [ ] Starting fresh
```

### Phase 2: Persona Questions (if needed)

**If user has data, ask:**
- What's the most common customer profile?
- What do they say about why they bought?
- What objections come up most?

**If starting fresh, I infer from:**
- Product/service characteristics
- Price point implications
- Industry norms

### Phase 3: Persona Generation

```
## Buyer Persona: [Name]

### Demographics
- Age range: [X-Y]
- Job title/role: [typical]
- Industry: [if B2B]
- Income level: [if relevant]
- Location: [if relevant]

### Psychographics
- Values: [list]
- Fears: [list]
- Aspirations: [list]
- Decision-making style: [analytical/emotional/social]

### Search Behavior
- How they search: [question format/keyword format]
- Where they search: [Google/AI assistants/YouTube/etc.]
- When they search: [buying journey stage]
- Typical queries: [example queries]

### AI Platform Usage
- Uses ChatGPT/Claude for: [research/recommendations/comparison]
- Trust level in AI: [high/medium/low]
- Verification behavior: [checks sources/trusts AI/mixed]

### Content Preferences
- Format: [long-form/scannable/video/etc.]
- Tone: [formal/casual/technical]
- Proof: [data/testimonials/case studies]
- Objections to address: [list top 3]

### Messaging Do's and Don'ts
**Do:**
- [Effective approach]
- [Effective approach]

**Don't:**
- [Ineffective/offensive approach]
- [Ineffective approach]

### Sample Headlines That Work
1. [Example headline for this persona]
2. [Example headline]
3. [Example headline]
```

---

## Command: `/ghostwriter llms-txt`

### Phase 1: Site Analysis

```
1. What is your site's domain?
   [URL]

2. What type of site is this?
   [ ] E-commerce
   [ ] SaaS / Software
   [ ] Content / Media
   [ ] Service business
   [ ] Personal / Portfolio

3. What content should AI systems have access to?
   [ ] All public content
   [ ] Only specific sections: ___
   [ ] Everything except: ___
```

### Phase 2: Strategy Questions

```
4. What is your AI visibility goal?
   [ ] Maximum citation (want AI to reference us)
   [ ] Selective citation (only certain content)
   [ ] Minimal citation (protect proprietary content)

5. Any content you specifically want AI to cite?
   [URLs or content types]

6. Any content you want to protect from AI training?
   [URLs or content types]
```

### Phase 3: llms.txt Generation

**Note**: llms.txt is an emerging standard. Not all AI systems honor it yet.

```
## Generated llms.txt

[Generated file content]

---

## Implementation Instructions

1. Save this file as `llms.txt` in your site root
2. The file should be accessible at: [domain]/llms.txt
3. Update your robots.txt to reference it (optional)

## What This Does

- [Explanation of each directive]
- [What AI systems will see]
- [Expected behavior]

## Limitations

- Not all AI systems honor llms.txt yet
- Effectiveness varies by platform
- Monitor and adjust as needed

## Recommended robots.txt additions

[robots.txt directives to complement llms.txt]
```

---

## Command: `/ghostwriter robots`

### Phase 1: Strategy Selection

```
1. What is your robot.txt strategy?
   [ ] allow-all - Full access for all crawlers (maximum visibility)
   [ ] selective - Allow search bots, selective AI bot access
   [ ] search-only - Block AI training bots, allow search bots

2. Do you have any specific pages to block?
   [ ] Admin/login pages: ___
   [ ] Staging/test pages: ___
   [ ] Private content: ___
   [ ] None
```

### Phase 2: AI Bot Configuration

**If selective or search-only:**

```
3. Configure AI bot access:

   OAI-SearchBot (ChatGPT Search):     [ ] Allow [ ] Block
   ChatGPT-User (real-time queries):   [ ] Allow [ ] Block
   GPTBot (OpenAI training):           [ ] Allow [ ] Block
   ClaudeBot (Anthropic):              [ ] Allow [ ] Block
   PerplexityBot:                      [ ] Allow [ ] Block
   Google-Extended (Gemini training):  [ ] Allow [ ] Block
   Bytespider (TikTok/Bytedance):      [ ] Allow [ ] Block
   CCBot (Common Crawl):               [ ] Allow [ ] Block
```

### Phase 3: robots.txt Generation

```
## Generated robots.txt

[Generated file content with comments explaining each section]

---

## Implementation Instructions

1. Save this file as `robots.txt` in your site root
2. The file should be accessible at: [domain]/robots.txt
3. Add your sitemap URL (update the placeholder)

## What Each Section Does

- [Explanation of search bot rules]
- [Explanation of AI bot rules]
- [Explanation of blocked paths]

## Verification Steps

1. Test at: https://www.google.com/webmasters/tools/robots-testing-tool
2. Check Google Search Console for crawl errors
3. Verify in Bing Webmaster Tools

## Important Notes

- Changes take effect immediately for new crawls
- Existing indexed pages aren't automatically removed
- Use noindex for pages you want completely removed from search
```

---

## Command: `/ghostwriter meta`

### Phase 1: Input Collection

```
1. What content needs meta tags?
   [ ] Provide URL: ___
   [ ] Paste content directly
   [ ] File path: ___

2. What is the primary keyword?
   [Free text]

3. What type of page is this?
   [ ] Article / Blog Post
   [ ] Landing Page
   [ ] Product Page
   [ ] Category Page
   [ ] Homepage
   [ ] About Page

4. What is the brand/site name?
   [Free text - for title suffix]
```

### Phase 2: Content Analysis

**I do this automatically:**

1. Extract main topic and angle
2. Identify unique value proposition
3. Determine call-to-action
4. Check competitor title patterns

### Phase 3: Meta Generation

**Generate all required tags:**

```
## Meta Tags: [Page Title]

### Title Tag
`[Generated title - XX characters]`

✓ Length: XX/60 characters
✓ Keyword: [position]
✓ Brand: [included/not included]

### Meta Description
`[Generated description - XXX characters]`

✓ Length: XXX/158 characters
✓ CTA: [included]
✓ Keyword: [included naturally]

### Open Graph Tags (ALL 6 REQUIRED)

```html
<meta property="og:title" content="[title]" />
<meta property="og:description" content="[description]" />
<meta property="og:image" content="[image URL - YOU MUST PROVIDE]" />
<meta property="og:url" content="[canonical URL]" />
<meta property="og:type" content="[article/website/product]" />
<meta property="og:site_name" content="[brand name]" />
```

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[title]" />
<meta name="twitter:description" content="[description]" />
<meta name="twitter:image" content="[image URL]" />
```

### Canonical Tag

```html
<link rel="canonical" href="[full URL]" />
```

### URL Slug Recommendation
`/[recommended-slug]/`

---

## Implementation Checklist

- [ ] Copy title tag to CMS
- [ ] Copy meta description to CMS
- [ ] Add ALL 6 Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Verify canonical URL is correct
- [ ] Provide og:image URL (1200x630px recommended)
```

---

## Error Handling

### If User Provides Incomplete Info

```
I need a bit more information to create [high-quality content type]:

Missing: [specific field]
Why it matters: [brief explanation]

Please provide: ___
```

### If Validation Fails Repeatedly

```
I'm having trouble getting this above 90% quality. The main issues are:

1. [Persistent issue]
2. [Persistent issue]

Options:
[ ] Accept current version (X% score)
[ ] Provide additional information about: [what's needed]
[ ] Adjust requirements to: [suggestion]
```

### If Content Type Not Supported

```
I don't have a specific generation prompt for [type], but I can:

[ ] Adapt the Article template
[ ] Adapt the Landing Page template
[ ] Create custom structure based on your needs

Which approach would you prefer?
```

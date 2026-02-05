# On-Page SEO

**What it is:** Optimization of individual web pages to rank higher and earn more relevant traffic in search engines. Every element on the page that you control.

**Why it matters:** On-page SEO is the foundation. You can't rank without it. Even perfect backlinks won't save poor on-page optimization.

---

## Title Tags

**The single most important on-page ranking factor.**

### Length

- **Optimal:** 50-60 characters
- **Max before truncation:** ~60 chars (varies by pixel width, not character count)
- **Mobile:** Truncates earlier (~50 chars)

**Tool to check:** Use pixel-width checker (SERP simulators) not just character count.

### Keyword Placement

```
[Primary Keyword] | [Secondary Keyword] | [Brand]
```

**Best practices:**
- Primary keyword at the start (highest weight)
- Most important words in first 50 characters
- Brand at end (unless brand IS the query)

### Templates by Page Type

| Page Type | Template | Example |
|-----------|----------|---------|
| Homepage | `[Brand] - [Value Prop] \| [Primary Service]` | `Acme Corp - Enterprise CRM Software \| Sales Automation` |
| Product | `[Product Name] - [Key Benefit] \| [Brand]` | `Pro Plan - Unlimited Users & Reports \| Acme` |
| Category | `[Category] - [Differentiator] \| [Brand]` | `CRM Software - Built for Sales Teams \| Acme` |
| Blog Post | `[Headline with Keyword] \| [Brand]` | `How to Automate Sales Pipelines \| Acme Blog` |
| Local | `[Service] in [City] \| [Brand]` | `Plumbing Services in Austin \| Rapid Plumbing` |

### What to Avoid

- **Keyword stuffing:** "CRM Software, Best CRM, CRM Tool, CRM Platform"
- **Duplicate titles:** Every page needs unique title
- **Missing brand:** Unless competing with your own brand term
- **All caps or excessive punctuation:** "BEST CRM!!! #1 Software"
- **Stop words at start:** "The Best Way to..."

### Title Tag Checklist

```
[ ] Contains primary keyword
[ ] 50-60 characters
[ ] Unique across site
[ ] Compelling (would you click it?)
[ ] Brand included (unless brand conflict)
[ ] No keyword stuffing
[ ] Matches search intent
```

---

## Meta Descriptions

**Not a direct ranking factor. But affects CTR, which affects rankings.**

### Length

- **Optimal:** 150-160 characters
- **Max before truncation:** ~160 chars
- **Mobile:** Often shorter (~120 chars)

**Google may rewrite your description.** They do this ~70% of the time. Write it anyway.

### Anatomy of a Good Meta Description

```
[Answer the query] + [Value prop or benefit] + [Call to action]
```

**Example:**
```
Learn how to automate your sales pipeline in 5 steps.
Save 10+ hours per week with proven CRM workflows.
Get the free guide →
```

### CTA Inclusion

**Always include a CTA.** Even soft CTAs improve CTR.

| CTA Type | Examples |
|----------|----------|
| Action | "Get started free", "Download now", "Try it today" |
| Discovery | "Learn how", "See why", "Explore our" |
| Urgency | "Limited time", "Join 10k+ users", "Start today" |
| Curiosity | "Discover the secret", "Find out why", "See what's new" |

### Unique Per Page

**Every page needs unique description.** Duplicate descriptions waste opportunity.

**For scale (1000+ pages):**
- Template-based descriptions for category/product pages
- Manual descriptions for top 20% traffic pages
- Auto-generated (but unique) for long tail

### Meta Description Checklist

```
[ ] 150-160 characters
[ ] Contains primary keyword (for bolding in SERPs)
[ ] Answers search intent
[ ] Includes CTA
[ ] Compelling reason to click
[ ] Unique across site
[ ] No truncated sentences
```

---

## Header Hierarchy

**Headers structure content for users AND search engines.**

### H1 Rules

- **One H1 per page** (critical)
- **Contains primary keyword**
- **Matches search intent**
- **Not identical to title tag** (variation is good)
- **Typically 20-70 characters**

**Example:**
```
Title: How to Automate Sales Pipelines | Acme Blog
H1: The Complete Guide to Sales Pipeline Automation
```

### H2-H6 as Outline

**Think of headers as a table of contents.**

```html
<h1>The Complete Guide to Sales Pipeline Automation</h1>

<h2>What is Sales Pipeline Automation?</h2>

<h2>Benefits of Automation</h2>
  <h3>Time Savings</h3>
  <h3>Error Reduction</h3>
  <h3>Scalability</h3>

<h2>How to Automate Your Pipeline</h2>
  <h3>Step 1: Map Your Current Process</h3>
  <h3>Step 2: Identify Automation Opportunities</h3>
  <h3>Step 3: Choose Your Tools</h3>

<h2>Common Mistakes to Avoid</h2>
```

### Header Best Practices

| Do | Don't |
|----|-------|
| Use headers to outline content | Skip header levels (H2 → H4) |
| Include keywords naturally | Stuff keywords in every header |
| Make headers descriptive | Use vague headers ("Introduction", "More Info") |
| Keep hierarchy logical | Use multiple H1s |
| Front-load important words | Bury keywords at end of header |

### Header Hierarchy Checklist

```
[ ] One H1 per page
[ ] H1 contains primary keyword
[ ] Headers follow logical hierarchy (H2 → H3 → H4, no skipping)
[ ] Headers outline the content
[ ] Secondary keywords in H2/H3
[ ] Headers are descriptive (not vague)
[ ] No keyword stuffing in headers
```

---

## URL Optimization

**URLs are a minor ranking factor. But they affect CTR and user trust.**

### URL Structure Best Practices

**Short and descriptive:**
```
✅ Good: example.com/sales-automation
❌ Bad:  example.com/category/products/automation/sales/page?id=12345
```

**Use hyphens (not underscores):**
```
✅ Good: /sales-pipeline-automation
❌ Bad:  /sales_pipeline_automation
```

**Lowercase only:**
```
✅ Good: /sales-automation
❌ Bad:  /Sales-Automation
```

**Include primary keyword:**
```
✅ Good: /crm-software-small-business
❌ Bad:  /product-category-b-item-442
```

### URL Length

- **Optimal:** 50-60 characters
- **Max recommended:** 100 characters
- **Avoid:** 150+ character URLs

**Shorter URLs correlate with higher rankings.** Not causal, but best practice.

### URL Structure Patterns

| Page Type | Pattern | Example |
|-----------|---------|---------|
| Homepage | `/` | `example.com/` |
| Product | `/[product-name]` | `example.com/crm-software` |
| Category | `/[category]` | `example.com/sales-tools` |
| Subcategory | `/[category]/[subcategory]` | `example.com/sales-tools/automation` |
| Blog Post | `/blog/[post-slug]` | `example.com/blog/sales-automation-guide` |
| Location | `/[city]` or `/locations/[city]` | `example.com/austin` |

### Avoid Parameters When Possible

**Dynamic URLs hurt SEO:**
```
❌ example.com/product?id=442&category=sales&ref=home
✅ example.com/sales-tools/crm-software
```

**If you must use parameters:**
- Use canonical tags to consolidate
- Submit clean URLs to Google Search Console
- Block parameter variations in robots.txt

### URL Checklist

```
[ ] Short (under 100 characters)
[ ] Includes primary keyword
[ ] Uses hyphens (not underscores)
[ ] Lowercase only
[ ] No unnecessary parameters
[ ] Descriptive (user knows what page is about)
[ ] No stop words (unless needed for clarity)
[ ] Matches site structure/hierarchy
```

---

## Keyword Optimization

**Strategic keyword placement is the core of on-page SEO.**

### Keyword Types

| Type | Definition | Example Query: "CRM software" |
|------|------------|-------------------------------|
| **Primary** | Main keyword for the page | "CRM software" |
| **Secondary** | Related keywords, same intent | "customer relationship management software" |
| **LSI** | Latent Semantic Indexing - topically related terms | "sales pipeline", "contact management", "lead tracking" |
| **Long-tail** | Longer, more specific variations | "best CRM software for small business" |

### Keyword Placement Strategy

**Priority locations (highest to lowest weight):**

1. **Title tag** (critical)
2. **H1** (critical)
3. **First 100 words** (very important)
4. **H2/H3 headers** (important)
5. **Throughout body** (natural frequency)
6. **Alt text** (when relevant)
7. **Meta description** (for CTR, not ranking)
8. **URL** (minor factor)

### Keyword Density

**There is no magic number.**

**Modern approach:**
- Write naturally for humans
- Use keyword 1-2 times per 200 words (rough guideline)
- Focus on comprehensive topic coverage
- Use synonyms and related terms

**Old approach (don't do this):**
- "Aim for 2-3% keyword density"
- Keyword stuffing
- Unnatural repetition

### Primary Keyword Placement Template

```markdown
# [Primary Keyword] - Comprehensive Guide
(H1 - primary keyword at start)

[Primary keyword] is a crucial topic for...
(First 100 words - primary keyword early)

## What is [Primary Keyword]?
(H2 - primary keyword in question form)

[Primary keyword] refers to...
(Natural use in body)

## Why [Primary Keyword] Matters
(H2 - variation)

## How to Implement [Primary Keyword]
(H2 - primary keyword in action phrase)

### Step 1: [Secondary Keyword]
(H3 - secondary keyword)
```

### Secondary and LSI Keywords

**Sprinkle throughout content:**
- In H2/H3 headers
- In body paragraphs
- In image alt text
- In anchor text for internal links

**Example for "CRM software":**
- Primary: CRM software
- Secondary: customer relationship management, CRM platform, CRM system
- LSI: sales pipeline, contact management, lead tracking, customer database, sales automation

### Keyword Optimization Checklist

```
[ ] Primary keyword in title tag
[ ] Primary keyword in H1
[ ] Primary keyword in first 100 words
[ ] Primary keyword in 2-3 H2/H3 headers
[ ] Secondary keywords in headers
[ ] LSI keywords throughout body
[ ] Natural keyword frequency (not stuffed)
[ ] Keyword in URL
[ ] Keyword in meta description
[ ] Synonyms and variations used
```

---

## Content Optimization

**High-quality, comprehensive content is the foundation of rankings.**

### Search Intent Alignment

**Match the intent behind the query.**

| Intent Type | What User Wants | Content Type |
|-------------|----------------|--------------|
| **Informational** | Learn something | Blog post, guide, tutorial |
| **Navigational** | Find specific page/brand | Homepage, product page |
| **Commercial** | Research before buying | Comparison, review, listicle |
| **Transactional** | Buy/sign up now | Product page, pricing page |

**How to identify intent:**
1. Google the keyword
2. Look at top 10 results
3. What content type dominates? (That's the intent)

### Content Depth

**There's no magic word count.**

**Instead:**
- Match or exceed competitor depth for the query
- Cover the topic comprehensively
- Answer all related questions

**Guidelines by intent:**

| Intent | Typical Length | Focus |
|--------|---------------|-------|
| Informational (complex) | 2000-3000+ words | Comprehensive coverage |
| Informational (simple) | 500-1000 words | Quick, clear answer |
| Commercial | 1500-2500 words | Detailed comparison |
| Transactional | 300-800 words | Clear value prop + CTA |

### Content Freshness

**Google favors fresh content for:**
- News topics
- Trending queries
- "Best [year]" queries
- Rapidly changing industries

**Freshness signals:**
- Recently published date
- Recent update date (visible on page)
- New information added
- Updated statistics/data
- New sections added

**Update schedule:**

| Page Type | Update Frequency |
|-----------|-----------------|
| News/trends | Daily/weekly |
| Best of [year] | Annually |
| How-to guides | Every 6-12 months |
| Product pages | As needed |
| Evergreen content | Every 12-24 months |

### Content Coverage Checklist

**For any topic, cover:**

```
[ ] Definition/what it is
[ ] Why it matters/benefits
[ ] How it works/how to do it
[ ] Examples/case studies
[ ] Common mistakes/pitfalls
[ ] Tools/resources
[ ] Related concepts
[ ] FAQs
[ ] Next steps/CTA
```

### Content Optimization Checklist

```
[ ] Matches search intent
[ ] Covers topic comprehensively
[ ] Matches or exceeds competitor depth
[ ] Recently published/updated
[ ] Answers related questions
[ ] Includes examples/data
[ ] Original insights (not just aggregation)
[ ] Scannable (headers, lists, short paragraphs)
[ ] Multimedia included (images, video)
[ ] Clear value proposition
[ ] Strong CTA
```

---

## Internal Linking Strategy

**Internal links pass PageRank and establish site architecture.**

### Contextual Links

**Link from relevant context, not forced.**

```markdown
✅ Good:
"Sales pipeline automation can reduce manual work by 70%.
Our [CRM software] includes built-in automation features."

❌ Bad:
"Click here for more information about our [CRM software]."
```

### Anchor Text Optimization

**Use descriptive, keyword-rich anchor text.**

| Anchor Type | When to Use | Example |
|-------------|-------------|---------|
| **Exact match** | Occasionally (10-20% of links) | "CRM software" |
| **Partial match** | Frequently (40-50% of links) | "our CRM platform" |
| **Branded** | For homepage/brand pages | "Acme CRM" |
| **Generic** | Sparingly (avoid) | "click here", "learn more" |
| **Naked URL** | Occasionally | "example.com/crm-software" |

**Anchor text best practices:**
- Vary anchor text (don't use same text repeatedly)
- Make it descriptive (user knows what they'll find)
- Keep it concise (2-5 words typically)
- Use keywords naturally

### Link Equity Flow

**Strategic internal linking distributes PageRank.**

**Hub-and-spoke model:**
```
Homepage (high authority)
    ├─> Category Page 1 (medium authority)
    │   ├─> Product A
    │   ├─> Product B
    │   └─> Product C
    ├─> Category Page 2
    │   ├─> Product D
    │   └─> Product E
    └─> Blog Hub
        ├─> Post 1
        ├─> Post 2
        └─> Post 3
```

**Link from:**
- High-authority pages → pages you want to rank
- Related content → related content
- Old posts → new posts
- Hub pages → spoke pages

### Hub Pages

**Hub pages aggregate and link to related content.**

**Example:** "Complete Guide to CRM Software"
- Links to: CRM features, CRM pricing, CRM integrations, CRM alternatives, CRM implementation guide
- Receives links from: All those pages link back

**Benefits:**
- Establishes topical authority
- Distributes PageRank
- Improves user navigation
- Ranks for broad keywords

### Internal Linking Checklist

```
[ ] 3-5 internal links per page (minimum)
[ ] Links from relevant context
[ ] Descriptive anchor text
[ ] Varied anchor text (not repetitive)
[ ] Links to related content
[ ] Hub pages for main topics
[ ] No broken internal links
[ ] Important pages linked from homepage/main nav
[ ] New content linked from existing pages
```

---

## Image Optimization

**Images affect page speed, user experience, and rankings.**

### Alt Text

**Required for accessibility and SEO.**

**Alt text rules:**
1. Describe what's in the image
2. Include keyword when relevant (don't force it)
3. Keep it under 125 characters
4. Don't start with "image of" or "picture of"

```html
✅ Good:
<img src="crm-dashboard.jpg" alt="CRM dashboard showing sales pipeline and contact management">

❌ Bad:
<img src="img001.jpg" alt="image">
<img src="crm-dashboard.jpg" alt="CRM software CRM platform CRM tool CRM system">
```

### File Names

**Descriptive, keyword-rich file names.**

```
✅ Good: crm-dashboard-sales-pipeline.jpg
❌ Bad:  IMG_001.jpg, screenshot.png
```

**File name best practices:**
- Use hyphens (not underscores)
- Lowercase
- Descriptive
- Include keyword when relevant
- No spaces or special characters

### Image Compression

**Reduce file size without sacrificing quality.**

| Image Type | Recommended Format | Compression Tool |
|------------|-------------------|------------------|
| Photos | WebP, AVIF (fallback: JPEG) | Squoosh, ImageOptim, TinyPNG |
| Graphics/logos | WebP, AVIF (fallback: PNG) | Squoosh, SVGOMG |
| Icons | SVG | SVGOMG |
| Screenshots | WebP, PNG | Squoosh, TinyPNG |

**Target file sizes:**
- Hero images: < 200KB
- Content images: < 100KB
- Thumbnails: < 50KB

### Next-Gen Formats

**Use WebP and AVIF with fallbacks.**

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

**File size comparison:**
- JPEG: 100KB
- WebP: ~30KB (70% smaller)
- AVIF: ~20KB (80% smaller)

### Responsive Images

**Serve appropriate image size for device.**

```html
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w,
          image-800w.jpg 800w,
          image-1200w.jpg 1200w"
  sizes="(max-width: 400px) 400px,
         (max-width: 800px) 800px,
         1200px"
  alt="Description">
```

### Lazy Loading

**Load images as user scrolls.**

```html
<img src="image.jpg" alt="Description" loading="lazy">
```

**Benefits:**
- Faster initial page load
- Reduced bandwidth
- Better Core Web Vitals scores

### Image SEO Checklist

```
[ ] Descriptive alt text (all images)
[ ] Keyword-rich file names
[ ] Compressed/optimized
[ ] Next-gen formats (WebP/AVIF)
[ ] Responsive images (srcset)
[ ] Lazy loading enabled
[ ] Appropriate dimensions (not oversized)
[ ] Served from CDN (if available)
[ ] No broken images
```

---

## Featured Snippet Optimization

**Featured snippets appear above organic results (position 0).**

### Snippet Types

| Type | Format | Best For |
|------|--------|----------|
| **Paragraph** | 40-60 words | Definitions, explanations |
| **List** | Ordered/unordered list | Steps, rankings, items |
| **Table** | Data table | Comparisons, specs, prices |

### Paragraph Snippets

**Structure:**
1. Question as H2 header
2. Direct answer in 40-60 words
3. Elaborate below

```markdown
## What is CRM Software?

CRM software is a tool that helps businesses manage customer
relationships, track interactions, and automate sales processes.
It centralizes customer data, improves communication, and
provides insights to increase sales and customer satisfaction.

### Key Features of CRM Software
[Additional details below...]
```

### List Snippets

**Structure:**
1. Question as H2 header
2. Brief intro (optional)
3. Ordered or unordered list
4. 5-8 items typically

```markdown
## How to Automate Your Sales Pipeline

Follow these steps to automate your sales pipeline:

1. **Map your current process** - Document every step
2. **Identify repetitive tasks** - Find automation opportunities
3. **Choose automation tools** - Select CRM software
4. **Set up triggers and workflows** - Configure automation
5. **Test the automation** - Run through scenarios
6. **Train your team** - Ensure adoption
7. **Monitor and optimize** - Track results and adjust
```

### Table Snippets

**Structure:**
1. Question as H2 header
2. Brief intro (optional)
3. Clean HTML/Markdown table
4. 3-10 rows typically

```markdown
## CRM Software Pricing Comparison

| Platform | Starting Price | Users | Key Features |
|----------|---------------|-------|--------------|
| Acme CRM | $25/user/mo | Unlimited | Automation, Reports |
| Competitor A | $35/user/mo | Up to 10 | Basic Features |
| Competitor B | $50/user/mo | Unlimited | Advanced Features |
```

### Featured Snippet Best Practices

**To increase snippet chances:**
- Target question keywords ("how to", "what is", "best way to")
- Provide direct, concise answers
- Use clear formatting (headers, lists, tables)
- Answer follow-up questions on same page
- Use schema markup when relevant

### Featured Snippet Checklist

```
[ ] Target question-based queries
[ ] Direct answer in 40-60 words
[ ] Question as H2 header
[ ] Clear, scannable format
[ ] Lists for steps/rankings
[ ] Tables for comparisons
[ ] Answer multiple related questions
[ ] Schema markup (FAQ, HowTo) when applicable
```

---

## E-E-A-T Signals on Page

**E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness**

**Critical for YMYL (Your Money Your Life) topics:** health, finance, legal, safety.

### Experience Signals

**Show first-hand experience:**
- "We tested 47 CRM platforms over 6 months"
- "In our 15 years managing sales teams..."
- Case studies with real results
- Original data/research
- Screenshots/photos from actual use

### Expertise Signals

**Demonstrate subject matter expertise:**

| Signal | Implementation |
|--------|---------------|
| **Author bio** | Name, credentials, relevant experience |
| **Credentials** | Degrees, certifications, awards |
| **Author page** | Dedicated page with full background |
| **Byline** | Clear attribution for all content |

```html
<!-- Author schema markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "jobTitle": "CRM Specialist",
    "url": "https://example.com/authors/jane-smith"
  }
}
</script>
```

### Authoritativeness Signals

**Establish authority on topic:**
- Citations from reputable sources
- Links to authoritative sites
- Mentions in external publications
- Awards/recognition
- Association memberships

### Trustworthiness Signals

**Build user trust:**

| Signal | Implementation |
|--------|---------------|
| **Updated dates** | "Last updated: February 2026" |
| **Contact info** | Email, phone, address |
| **About page** | Company background, mission |
| **Privacy policy** | GDPR-compliant, clear policies |
| **HTTPS** | Secure connection (critical) |
| **Professional design** | Clean, trustworthy appearance |
| **No misleading ads** | Clear ad labeling |
| **Fact-checking** | Verify claims, cite sources |

### Citations and Sources

**How to cite sources:**

```markdown
According to a 2025 Gartner study, 78% of companies report
increased sales after implementing CRM software [1].

---

## Sources

[1] Gartner. (2025). "State of CRM Adoption in Enterprise."
Retrieved from: https://www.gartner.com/...
```

### E-E-A-T Checklist

```
[ ] Author name and bio
[ ] Author credentials/expertise
[ ] Last updated date (visible)
[ ] Citations for claims
[ ] Links to authoritative sources
[ ] Contact information
[ ] About page
[ ] Privacy policy
[ ] HTTPS enabled
[ ] Professional design
[ ] Original insights/research
[ ] First-hand experience demonstrated
```

---

## Content Length and Depth

**There is no magic word count. Match intent and competitor depth.**

### How to Determine Ideal Length

**Process:**
1. Google your target keyword
2. Analyze top 10 results
3. Check word count (use SEO tools or browser extensions)
4. Calculate average length
5. Aim to match or exceed by 20-30%

**Example:**
```
Top 10 results for "CRM software":
1. 2,400 words
2. 3,100 words
3. 1,800 words
4. 2,900 words
5. 2,200 words
---
Average: ~2,480 words
Target: 3,000+ words
```

### Length by Content Type

| Content Type | Typical Length | Priority |
|--------------|---------------|----------|
| Pillar content | 3,000-5,000+ words | Comprehensive coverage |
| How-to guides | 1,500-3,000 words | Step-by-step detail |
| Product pages | 300-800 words | Clear value prop |
| Category pages | 500-1,500 words | Overview + links |
| Blog posts | 1,000-2,500 words | Answer intent fully |
| News articles | 400-800 words | Quick, timely |
| Listicles | 1,500-2,500 words | Detailed entries |

### Depth vs. Length

**Depth matters more than length.**

**Deep content:**
- Answers all related questions
- Covers subtopics comprehensively
- Includes examples, data, case studies
- Addresses objections and edge cases
- Links to related resources

**Shallow content (avoid):**
- Generic information
- No original insights
- Rehashed from competitors
- Missing key subtopics
- Vague or surface-level

### Content Depth Checklist

```
[ ] Matches or exceeds competitor depth
[ ] Covers all important subtopics
[ ] Answers related questions
[ ] Includes examples/case studies
[ ] Original data or insights
[ ] Addresses edge cases
[ ] Links to related resources
[ ] No fluff (every section adds value)
```

---

## User Experience Signals

**Google measures user engagement. Poor UX = poor rankings.**

### Readability

**Make content easy to read:**

| Element | Best Practice |
|---------|--------------|
| **Paragraph length** | 2-4 sentences, 50-100 words max |
| **Sentence length** | Mix short (5-10 words) and medium (15-20 words) |
| **Reading level** | 8th grade or below for general audience |
| **Font size** | 16px minimum for body text |
| **Line height** | 1.5-1.6 for body text |
| **Line length** | 50-75 characters per line |

**Tools to check:**
- Hemingway Editor (readability)
- Readable.com (reading level)
- WebAIM (accessibility)

### Formatting

**Scannable content:**

```markdown
✅ Use:
- Short paragraphs (2-4 sentences)
- Bullet points and numbered lists
- Bold for key terms (sparingly)
- Headers to break up content
- White space (don't cram)

❌ Avoid:
- Walls of text
- All caps
- Excessive bold/italic
- Justified text (hard to read)
- Tiny fonts
```

### Multimedia

**Enhance content with media:**

| Media Type | When to Use | SEO Benefit |
|------------|-------------|-------------|
| **Images** | Illustrate concepts | Alt text for keywords |
| **Video** | Complex explanations | Increases time on page |
| **Infographics** | Data visualization | Attracts backlinks |
| **Diagrams** | Process flows | Improves understanding |
| **Screenshots** | How-to guides | Builds trust |
| **GIFs** | Quick demos | Increases engagement |

### Above-the-Fold Content

**Critical first impression:**

**Must include:**
- Clear H1 (what is this page about?)
- Primary keyword visible
- Compelling intro (answer the query immediately)
- Visual element (hero image, video)
- CTA (if transactional intent)

**Avoid:**
- Ads before content
- Large headers that push content down
- Intrusive popups
- Auto-playing video (unless expected)

### Core Web Vitals Impact

**User experience metrics that affect rankings:**

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| **LCP** (Largest Contentful Paint) | Loading speed | < 2.5s |
| **FID** (First Input Delay) | Interactivity | < 100ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 |

**On-page factors that affect CWV:**
- Image optimization (LCP)
- Lazy loading (LCP)
- Minimal JavaScript (FID)
- Reserve space for ads/images (CLS)
- Font loading strategy (CLS)

### Mobile Experience

**Mobile-first indexing = mobile experience matters more.**

```
[ ] Responsive design
[ ] Touch-friendly buttons (44x44px minimum)
[ ] No horizontal scrolling
[ ] Readable font sizes (16px+)
[ ] Fast loading on mobile
[ ] No intrusive interstitials
[ ] Mobile-friendly navigation
```

### User Experience Checklist

```
[ ] Readable (8th grade level or below)
[ ] Short paragraphs (2-4 sentences)
[ ] Scannable (headers, lists, bold)
[ ] Multimedia included (images, video)
[ ] Strong above-the-fold content
[ ] Clear H1 and intro
[ ] Fast loading (Core Web Vitals)
[ ] Mobile-friendly
[ ] No intrusive popups
[ ] Clear navigation
[ ] White space (not cramped)
[ ] Professional design
```

---

## On-Page SEO Master Checklist

**Use this for every page you optimize:**

### Technical Elements
```
[ ] Title tag optimized (50-60 chars, keyword at start)
[ ] Meta description optimized (150-160 chars, includes CTA)
[ ] URL optimized (short, descriptive, includes keyword)
[ ] One H1 per page (contains primary keyword)
[ ] Header hierarchy logical (H1 → H2 → H3, no skipping)
[ ] HTTPS enabled
[ ] Mobile-friendly
[ ] Fast loading (< 2.5s LCP)
```

### Content Elements
```
[ ] Matches search intent
[ ] Primary keyword in title, H1, first 100 words
[ ] Secondary/LSI keywords throughout
[ ] Comprehensive topic coverage
[ ] Matches or exceeds competitor depth
[ ] Original insights/data
[ ] Recently published/updated (date visible)
[ ] E-E-A-T signals (author, sources, credentials)
```

### Formatting Elements
```
[ ] Readable (short paragraphs, clear language)
[ ] Scannable (headers, lists, bold)
[ ] Multimedia included (images, video)
[ ] Strong above-the-fold content
[ ] Clear CTA
```

### Internal/Image Elements
```
[ ] 3-5 internal links (contextual, descriptive anchors)
[ ] All images have alt text
[ ] Images optimized/compressed
[ ] Next-gen formats (WebP/AVIF)
[ ] Lazy loading enabled
```

### Featured Snippet Elements
```
[ ] Question-based keywords targeted
[ ] Direct answers in 40-60 words
[ ] Lists/tables for appropriate queries
[ ] Schema markup (FAQ, HowTo) when applicable
```

---

## Related Resources

- [SEO Fundamentals](fundamentals.md)
- [Technical SEO](technical.md)
- [Off-Page SEO](off-page.md)

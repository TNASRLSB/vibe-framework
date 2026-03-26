# SEO Reference — Complete Guide

This is the authoritative SEO reference for Ghostwriter. Consult this when creating or optimizing content.

---

## On-Page Optimization

### Title Tags

The title tag is the single most important on-page SEO element.

**Rules:**
- Length: 50-60 characters (Google truncates at ~60)
- Primary keyword as close to the beginning as possible
- Brand name at end if included: "Primary Keyword — Brand"
- Each page must have a unique title tag
- Include a modifier when appropriate: "Best," "Guide," "2026," "How to"
- Never stuff multiple keywords

**Formula patterns:**
```
[Primary Keyword]: [Benefit/Value] — [Brand]
How to [Action] [Primary Keyword] in [Timeframe]
[Number] [Primary Keyword] [Modifier] ([Year])
[Primary Keyword] vs [Alternative]: [Differentiator]
The Complete Guide to [Primary Keyword] ([Year])
[Primary Keyword] for [Audience]: [Promise]
```

**Examples:**
```
Content Marketing Strategy: A Complete Guide — Acme Co
How to Write Landing Pages That Convert in 2026
15 Email Marketing Tips That Actually Work (2026)
React vs Vue: Which Framework Is Right for Your Project?
The Complete Guide to Technical SEO (2026)
GraphQL for Beginners: Build Your First API Today
```

### Meta Descriptions

The meta description is your ad copy in search results. Google may rewrite it, but a well-crafted one is used more often.

**Rules:**
- Length: 150-160 characters (Google truncates at ~160)
- Include primary keyword naturally
- Include a call-to-action: "Learn how," "Discover," "Get started," "Find out"
- Convey the page's unique value proposition
- Match search intent — if someone is looking to buy, say what they can buy
- Unique per page
- No double quotes (they get truncated)

**Formula:**
```
[What the page covers]. [Unique value/differentiator]. [CTA].
```

**Examples:**
```
Learn the 15 content marketing strategies that drove 300% traffic growth.
Step-by-step guide with real examples. Start ranking today.

Compare React and Vue across performance, learning curve, and ecosystem.
Data-backed analysis from 500+ production apps. Find your best fit.
```

### Heading Hierarchy

Headings create the information architecture that both users and crawlers follow.

**H1 — Page Title:**
- Exactly one per page
- Includes primary keyword
- Under 60 characters
- Communicates the page's core topic
- Different from the title tag (can be more descriptive)

**H2 — Major Sections:**
- Include secondary keywords where natural
- Frame as questions for featured snippet potential (e.g., "What Is Content Marketing?")
- 3-8 H2s per article (depends on length)
- Each H2 section should be 200-400 words

**H3 — Subsections:**
- Break up long H2 sections
- Address specific aspects of the parent H2
- Include long-tail keyword variations

**H4-H6 — Deep nesting:**
- Use sparingly
- Only when content genuinely requires this depth
- Common in technical documentation, rare in marketing content

**Anti-patterns:**
- Skipping levels (H1 → H3)
- Multiple H1 tags
- Using headings for styling (bold text that isn't a section break)
- Keyword-stuffed headings that read unnaturally
- Headings that don't describe the content below them

### Internal Linking

Internal links distribute authority and help users (and crawlers) navigate.

**Rules:**
- Minimum 3 internal links per article
- Use descriptive anchor text: "content marketing strategy guide" not "click here" or "this article"
- Link to relevant, high-value pages
- Place links where they serve the reader (contextual, not forced)
- Link from high-authority pages to pages you want to boost
- Use hub-and-spoke: pillar pages link to all cluster pages and vice versa
- Check for broken internal links regularly

**Anchor text principles:**
- Descriptive of the target page's content
- Naturally integrated into the sentence
- Varied — don't use the same anchor text for every link to the same page
- Avoid generic ("learn more," "read this") for most links
- Exact-match keyword anchors OK internally (unlike external link building)

### Image Optimization

Images affect page speed, accessibility, and can rank in image search.

**Alt text:**
- Describe what the image shows (not what you want to rank for)
- Include keyword only when the image is genuinely relevant to that keyword
- Under 125 characters
- Screen readers read alt text — write for blind users first, SEO second
- Empty alt (`alt=""`) for purely decorative images

**File optimization:**
- Descriptive file names: `content-marketing-funnel.webp` not `IMG_4392.jpg`
- WebP or AVIF format for best compression
- Responsive images with `srcset` for different viewports
- Lazy loading for below-the-fold images (`loading="lazy"`)
- Width and height attributes to prevent layout shift (CLS)

### URL Structure

**Rules:**
- Short, readable, keyword-rich: `/content-marketing-guide/`
- Hyphens between words (not underscores)
- Lowercase only
- No IDs, parameters, or random strings in user-facing URLs
- Reflect site hierarchy: `/blog/seo/title-tag-guide/`
- Avoid stop words unless needed for readability

---

## Technical SEO

### Structured Data (JSON-LD)

Structured data enables rich results and helps AI systems parse your content.

**Essential schemas by content type:**

**Article:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "description": "Meta description text",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/author/name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-03-26",
  "dateModified": "2026-03-26",
  "image": "https://example.com/image.jpg",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  }
}
```

**FAQ:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is content marketing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Content marketing is a strategic approach focused on creating valuable, relevant content to attract and retain a defined audience."
      }
    }
  ]
}
```

**Product:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://example.com/product.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

**HowTo:**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Write a Title Tag",
  "description": "Step-by-step guide to writing effective title tags.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Research your primary keyword",
      "text": "Identify the main keyword your page targets."
    },
    {
      "@type": "HowToStep",
      "name": "Place keyword at the beginning",
      "text": "Start your title tag with the primary keyword."
    }
  ]
}
```

**BreadcrumbList:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/blog/" },
    { "@type": "ListItem", "position": 3, "name": "SEO Guide", "item": "https://example.com/blog/seo-guide/" }
  ]
}
```

### Core Web Vitals

Google uses these metrics as ranking signals.

**LCP (Largest Contentful Paint) — Target: < 2.5s:**
- Optimize hero images (compression, correct sizing, preload)
- Minimize render-blocking CSS and JS
- Use CDN for static assets
- Implement server-side rendering or static generation

**FID / INP (Interaction to Next Paint) — Target: < 200ms:**
- Minimize main-thread JavaScript
- Break up long tasks
- Use web workers for heavy computation
- Defer non-critical JavaScript

**CLS (Cumulative Layout Shift) — Target: < 0.1:**
- Set width/height on images and embeds
- Avoid injecting content above existing content
- Use CSS `contain` property
- Reserve space for dynamic content (ads, embeds)

### Crawling and Indexing

**robots.txt:**
```
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**XML Sitemap:**
- Include all canonical, indexable pages
- Exclude noindex pages, redirects, error pages
- Update `<lastmod>` when content changes
- Submit to Google Search Console
- Under 50,000 URLs per sitemap (split if larger)

**Canonical tags:**
- Every page must have a `<link rel="canonical">` tag
- Points to the preferred version of the URL
- Prevents duplicate content across URL variations
- Self-referencing canonicals are OK and recommended

**Meta robots:**
```html
<meta name="robots" content="index, follow">       <!-- Default, can omit -->
<meta name="robots" content="noindex, follow">      <!-- Don't index, follow links -->
<meta name="robots" content="index, nofollow">      <!-- Index, don't follow links -->
<meta name="robots" content="noindex, nofollow">    <!-- Don't index or follow -->
```

### Mobile-First Optimization

Google indexes the mobile version of your site first.

- Responsive design (single URL, adapts to viewport)
- Touch-friendly tap targets (minimum 48x48px, 8px spacing)
- Readable font size without zooming (minimum 16px body text)
- No horizontal scrolling
- Fast load on mobile networks (target < 3s on 4G)
- Avoid intrusive interstitials (pop-ups that block content)

### Page Speed Optimization

- Minify CSS, JS, HTML
- Enable Gzip/Brotli compression
- Browser caching with appropriate `Cache-Control` headers
- Preconnect to required origins: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Preload critical assets: `<link rel="preload" href="/font.woff2" as="font" crossorigin>`
- Code splitting — load only what the current page needs
- Tree shaking — remove unused code at build time

---

## Keyword Research Methodology

### Step 1: Seed Keywords

Start with the core topic. List 5-10 broad terms that describe the subject.

### Step 2: Expand with Modifiers

For each seed keyword, generate variations:
- **Informational:** "what is [keyword]," "how to [keyword]," "[keyword] guide"
- **Commercial:** "best [keyword]," "[keyword] vs [alternative]," "[keyword] reviews"
- **Transactional:** "buy [keyword]," "[keyword] pricing," "[keyword] free trial"
- **Long-tail:** "[keyword] for [audience]," "[keyword] in [context]," "[keyword] without [constraint]"

### Step 3: Assess Intent

For each keyword, determine search intent:

| Intent | Signal | Content Type |
|--------|--------|-------------|
| Informational | "what," "how," "guide," "tutorial" | Article, guide, how-to |
| Navigational | Brand name, product name | Homepage, product page |
| Commercial | "best," "review," "compare," "vs" | Comparison, review, listicle |
| Transactional | "buy," "pricing," "discount," "coupon" | Product page, landing page |

### Step 4: Prioritize

Score keywords by:
- **Relevance:** How closely does this match your offering? (1-5)
- **Volume estimate:** High / medium / low search volume
- **Competition estimate:** How strong are current top results?
- **Business value:** Will ranking for this drive revenue? (1-5)

Focus on: high relevance + high business value + achievable competition.

### Step 5: Map to Content

Each primary keyword maps to one page. Never target the same primary keyword on multiple pages (keyword cannibalization).

Create a keyword map:
```
/pillar-page/           → "content marketing" (pillar)
/blog/content-strategy/ → "content marketing strategy" (cluster)
/blog/content-calendar/ → "content calendar template" (cluster)
/blog/content-metrics/  → "content marketing metrics" (cluster)
```

---

## Content Structure Patterns

### Article Template

```markdown
# [H1: Primary Keyword + Value Promise]

[Hook: statistic, bold claim, or question — 1-2 sentences]

[Brief overview: what this article covers and why it matters — 2-3 sentences]

**Key takeaways:**
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## [H2: Section 1 — address primary keyword directly]

[200-400 words: definition, explanation, context]
[Include quotable statement for AI citation]
[Internal link to related content]

## [H2: Section 2 — secondary keyword / how-to]

[200-400 words: practical steps or analysis]
[Include data, examples, or evidence]

### [H3: Subsection if needed]

[Specific aspect of Section 2]

## [H2: Section 3 — supporting topic]

[200-400 words]

## [H2: Common Questions / FAQ]

### [Question format H3 — long-tail keyword]

[Direct answer in 1-2 sentences]
[Elaboration in 2-3 more sentences]

## [H2: Conclusion / Next Steps]

[Summary of key points — 2-3 sentences]
[Clear CTA — what should the reader do next?]
```

### Landing Page Template

```markdown
<!-- Above the fold -->
# [H1: Benefit-driven headline with keyword]
[Subheadline: elaborate on the promise — 1 sentence]
[Primary CTA button]

<!-- Problem section -->
## [H2: Name the problem / pain point]
[Describe the problem the reader faces — empathize]
[Agitate — what happens if they don't solve it?]

<!-- Solution section -->
## [H2: Introduce the solution]
[Position your offering as the solution]
[Key benefits (3-5), not features]

<!-- Features / How it works -->
## [H2: How It Works / Features]
[Step-by-step or feature grid]
[Each feature tied to a benefit]

<!-- Social proof -->
## [H2: Social Proof]
[Testimonials with name, role, company]
[Client logos]
[Metrics: "10,000+ customers" / "4.8/5 rating"]

<!-- CTA -->
## [H2: Final CTA]
[Restate value proposition]
[CTA button with urgency or benefit]

<!-- FAQ -->
## [H2: Frequently Asked Questions]
[4-8 Q&As addressing objections]
[FAQ schema markup]
```

### Product Description Template

```markdown
# [Product Name]

[One-line value proposition: what it does + who it's for]

## Why [Product Name]

[Lead with the primary benefit — what problem does it solve?]
[2-3 supporting benefits with brief explanations]

## Features

| Feature | What It Does |
|---------|-------------|
| [Feature 1] | [Benefit-focused description] |
| [Feature 2] | [Benefit-focused description] |

## Perfect For

- [Use case 1: audience + scenario]
- [Use case 2: audience + scenario]
- [Use case 3: audience + scenario]

## Specifications

[Technical details in scannable format]

## [CTA]

[Price + availability + action]
```

---

## Off-Page SEO Strategies

### Link Building

Links from external sites signal authority.

**High-value strategies:**
- Create genuinely linkable content (original research, tools, comprehensive guides)
- Guest posting on relevant, authoritative sites
- Digital PR: newsworthy data, studies, or tools
- Broken link building: find broken links on relevant sites, offer your content as replacement
- Resource page link building: get listed on curated resource pages
- HARO / journalist queries: provide expert commentary

**Anchor text distribution (external links pointing to you):**
- 40-50% branded anchors ("Acme Co")
- 20-30% naked URLs ("acme.com")
- 10-15% generic ("click here," "this guide")
- 5-10% partial-match ("Acme's content marketing guide")
- 1-5% exact-match ("content marketing guide") — keep this low

### Social Signals

Social shares correlate with rankings (causation debated, but correlation is real).

- Share buttons on all content pages
- Open Graph tags for attractive social previews
- Twitter Card markup
- Create content worth sharing (emotional, useful, surprising)

### Brand Mentions

Unlinked brand mentions may carry SEO value.

- Monitor brand mentions
- Request link addition on unlinked mentions
- Build brand recognition through consistent messaging

---

## SEO Content Checklist

Use this as a quick reference during writing:

- [ ] Title tag: 50-60 chars, keyword-leading
- [ ] Meta description: 150-160 chars, CTA included
- [ ] H1: unique, includes keyword, under 60 chars
- [ ] Heading hierarchy: no skipped levels
- [ ] Primary keyword in first 100 words
- [ ] Keyword density: 1-2%, never above 3%
- [ ] Internal links: minimum 3
- [ ] External links: 1-2 authoritative sources
- [ ] Images: descriptive alt text, optimized file size
- [ ] URL: short, keyword-rich, hyphenated
- [ ] Schema markup: appropriate type, valid JSON-LD
- [ ] Mobile-friendly: responsive, readable, fast
- [ ] Content length: appropriate for type and intent
- [ ] Canonical tag: present and correct

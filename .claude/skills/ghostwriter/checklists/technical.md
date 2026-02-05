# Pre-Launch Technical Audit Checklist

**Purpose:** Comprehensive pre-launch audit covering traditional SEO technical requirements, content quality, and AI search readiness. Run this before any major site launch or redesign.

**When to use:** Before launch, after major updates, quarterly maintenance audits.

---

## 1. Technical Audit: Crawlability, Indexability, and Site Speed

### Crawl Access & Configuration

- [ ] **robots.txt verification**
  - [ ] File exists at `/robots.txt`
  - [ ] No accidental blocking of CSS, JS, or important pages
  - [ ] Sitemap location declared (`Sitemap: https://example.com/sitemap.xml`)
  - [ ] AI bots explicitly allowed (OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, GoogleBot-Extended, etc.)
  - [ ] No legacy `Disallow: /` directives from development

- [ ] **XML Sitemap validation**
  - [ ] Sitemap exists and is well-formed XML
  - [ ] Only includes indexable URLs (200 status, no redirects)
  - [ ] No URLs blocked by robots.txt
  - [ ] Last modified dates present and accurate
  - [ ] Under 50MB and 50,000 URLs per file (use sitemap index if larger)
  - [ ] Submitted to Google Search Console
  - [ ] Submitted to Bing Webmaster Tools
  - [ ] Declared in robots.txt

- [ ] **Screaming Frog / Site Audit Crawl**
  - [ ] Run full crawl with Screaming Frog, Semrush, or Ahrefs Site Audit
  - [ ] No 404 errors on important internal links
  - [ ] No redirect chains (3+ redirects in sequence)
  - [ ] No redirect loops
  - [ ] All redirects use 301 (permanent) not 302 (temporary)
  - [ ] No orphan pages (pages with zero internal links pointing to them)
  - [ ] Crawl depth under 3 clicks from homepage for key pages

### Indexability & Meta Tags

- [ ] **noindex/nofollow tag review**
  - [ ] No accidental `<meta name="robots" content="noindex">` on important pages
  - [ ] Check staging/dev environment tags removed
  - [ ] Verify X-Robots-Tag HTTP headers not blocking
  - [ ] Confirm `noindex` only on: login, admin, thank-you pages, duplicate filters

- [ ] **Canonical tag verification**
  - [ ] Every page has a self-referencing or correct canonical
  - [ ] No canonical chains (page A → page B → page C)
  - [ ] Canonicals use absolute URLs (not relative)
  - [ ] No conflicting signals (canonical to page X, but robots noindex on page X)
  - [ ] Pagination uses `rel="next"` and `rel="prev"` OR View All canonical strategy
  - [ ] No duplicate pages indexed (check `site:example.com` in Google, filter by title)

- [ ] **Meta robots and indexation**
  - [ ] Important pages return 200 status
  - [ ] Pages render correctly in JavaScript (test with Fetch as Google / URL Inspection)
  - [ ] No accidental `<meta name="googlebot" content="noindex">`
  - [ ] Language and region targeting via hreflang (if multilingual/multi-regional)

### HTTPS & Security

- [ ] **HTTPS everywhere**
  - [ ] All pages load over HTTPS
  - [ ] No mixed content warnings (HTTP assets on HTTPS pages)
  - [ ] SSL certificate valid and not expired
  - [ ] HTTP redirects to HTTPS (301, not 302)
  - [ ] HSTS header enabled (`Strict-Transport-Security`)

- [ ] **Security headers**
  - [ ] Check `X-Content-Type-Options: nosniff`
  - [ ] Check `X-Frame-Options: SAMEORIGIN` or CSP frame-ancestors
  - [ ] Content Security Policy (CSP) configured (optional but recommended)

### Internal Linking

- [ ] **Logical link architecture**
  - [ ] Homepage links to main category/hub pages
  - [ ] Category pages link to relevant detail pages
  - [ ] No orphan pages (every page reachable via internal links)
  - [ ] Important pages within 3 clicks from homepage
  - [ ] Anchor text descriptive and varied (not all "click here")

- [ ] **Link equity flow**
  - [ ] No excessive outbound links (keep under 100-150 per page)
  - [ ] Footer/sidebar links don't dilute main content links
  - [ ] Breadcrumbs present and Schema-marked (if applicable)

### Core Web Vitals & Performance

- [ ] **Largest Contentful Paint (LCP)**
  - [ ] Target: under 2.5 seconds
  - [ ] Test with PageSpeed Insights (lab + field data)
  - [ ] Test on mobile and desktop
  - [ ] Optimize hero images (compression, lazy load below fold)
  - [ ] Preload critical resources (fonts, hero image)
  - [ ] Use CDN for static assets

- [ ] **Interaction to Next Paint (INP) / First Input Delay (FID)**
  - [ ] Target INP: under 200ms
  - [ ] Minimize JavaScript execution time
  - [ ] Remove unused JS (check coverage in Chrome DevTools)
  - [ ] Defer non-critical JS (`defer` or `async` attributes)
  - [ ] Break up long tasks (Web Workers for heavy computation)

- [ ] **Cumulative Layout Shift (CLS)**
  - [ ] Target: under 0.1
  - [ ] Reserve space for images (width/height attributes or aspect-ratio)
  - [ ] Reserve space for ads, embeds, dynamic content
  - [ ] No injected content shifting page after load
  - [ ] Fonts load with `font-display: swap` or `optional`

- [ ] **Overall performance**
  - [ ] Total page weight under 2MB (ideally under 1MB)
  - [ ] CSS minified and critical CSS inlined
  - [ ] JavaScript minified and bundled
  - [ ] Remove render-blocking resources (defer CSS/JS where possible)
  - [ ] Time to First Byte (TTFB) under 600ms
  - [ ] Server response time optimized (caching, fast hosting)

### Image Optimization

- [ ] **Image formats and compression**
  - [ ] Modern formats used (WebP, AVIF) with fallbacks
  - [ ] Images compressed (TinyPNG, ImageOptim, or build-time optimization)
  - [ ] Appropriate dimensions (no oversized images scaled with CSS)
  - [ ] Responsive images (`srcset`, `sizes` attributes)

- [ ] **Lazy loading**
  - [ ] Below-the-fold images use `loading="lazy"`
  - [ ] Hero/LCP image NOT lazy-loaded
  - [ ] Test lazy loading works in multiple browsers

- [ ] **Alt text and accessibility**
  - [ ] Every image has descriptive alt text
  - [ ] Decorative images use empty alt (`alt=""`)
  - [ ] No "image of" or "picture of" redundancy

### Mobile Responsiveness

- [ ] **Mobile-first design**
  - [ ] Site renders correctly on mobile devices (test on real devices)
  - [ ] No horizontal scroll
  - [ ] Text readable without zoom (font size 16px+)
  - [ ] Tap targets large enough (44x44px minimum)
  - [ ] Viewport meta tag present (`<meta name="viewport" content="width=device-width, initial-scale=1">`)

- [ ] **Mobile usability**
  - [ ] No intrusive interstitials or popups on mobile
  - [ ] Forms easy to fill on mobile
  - [ ] Navigation accessible and intuitive
  - [ ] Check Google Search Console Mobile Usability report

### CDN & Hosting

- [ ] **CDN configuration**
  - [ ] Static assets served from CDN (images, CSS, JS)
  - [ ] Correct cache headers (`Cache-Control`, `Expires`)
  - [ ] Brotli or Gzip compression enabled
  - [ ] HTTP/2 or HTTP/3 enabled

- [ ] **Server and hosting**
  - [ ] Hosting provider reliable (99.9%+ uptime)
  - [ ] Server response time fast (TTFB under 600ms)
  - [ ] Adequate resources (bandwidth, storage, compute)

---

## 2. Content Audit: Quality, Structure, and Topical Gaps

### Content Quality Assessment

- [ ] **Accuracy and depth**
  - [ ] All facts verified and sourced
  - [ ] Content provides comprehensive coverage of topic
  - [ ] No outdated statistics or information
  - [ ] Claims backed by data or credible sources

- [ ] **E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)**
  - [ ] Author bylines present with credentials
  - [ ] About page with team/company background
  - [ ] Contact information clearly visible
  - [ ] Credentials, certifications, or awards displayed
  - [ ] External citations to authoritative sources
  - [ ] Reviews, testimonials, case studies (if applicable)

- [ ] **Originality and value**
  - [ ] Content offers unique insights or perspectives
  - [ ] Not scraped, spun, or duplicated from other sites
  - [ ] Adds value beyond what competitors provide
  - [ ] Personal experience or case studies included

### Thin and Outdated Content

- [ ] **Thin content identification**
  - [ ] Pages under 300 words reviewed (expand, consolidate, or noindex)
  - [ ] No "fluff" pages with no real value
  - [ ] Category/tag pages have introductory text (not just lists)
  - [ ] No auto-generated pages with no human review

- [ ] **Outdated content flagging**
  - [ ] Content older than 2 years reviewed for freshness
  - [ ] Statistics and data updated
  - [ ] "As of [year]" or "Updated [date]" noted
  - [ ] Outdated pages either updated, redirected, or removed

### Content Structure & Readability

- [ ] **Heading hierarchy review**
  - [ ] Every page has exactly one H1 (usually the title)
  - [ ] H2s used for main sections
  - [ ] H3s nest under H2s (no skipping levels: H1 → H3)
  - [ ] Headings descriptive and keyword-rich (but natural)
  - [ ] No keyword stuffing in headings

- [ ] **Readability scoring**
  - [ ] Target: Flesch-Kincaid Grade 8-10 for general audience
  - [ ] Sentences under 20 words on average
  - [ ] Paragraphs under 4-5 lines
  - [ ] Active voice preferred over passive
  - [ ] Transition words and connectors used

- [ ] **Visual structure**
  - [ ] Bullet points and numbered lists used for scannability
  - [ ] Images, charts, infographics break up text
  - [ ] Whitespace used effectively (not wall of text)
  - [ ] Bold/italic used sparingly for emphasis

### Keyword and Topical Coverage

- [ ] **Keyword gap analysis**
  - [ ] Run keyword gap analysis vs. top 3 competitors (Ahrefs, Semrush)
  - [ ] Identify keywords they rank for that you don't
  - [ ] Prioritize high-volume, high-relevance gaps
  - [ ] Create content to fill gaps

- [ ] **Topical coverage mapping**
  - [ ] Map content to topics/entities (not just keywords)
  - [ ] Ensure comprehensive coverage of core topics
  - [ ] Identify subtopics and related entities missing
  - [ ] Create topic clusters with hub and spoke structure

- [ ] **Search intent alignment**
  - [ ] Content matches search intent (informational, navigational, transactional, commercial)
  - [ ] SERP analysis for target keywords (what type of content ranks?)
  - [ ] Adjust format/structure to match intent (e.g., "how to" = tutorial, "best" = comparison)

### Duplicate Content

- [ ] **Internal duplicate content check**
  - [ ] Run Siteliner or Screaming Frog duplicate content report
  - [ ] No identical or near-identical pages
  - [ ] Product/service variations differentiated
  - [ ] Faceted navigation/filters use canonicals or noindex

- [ ] **External duplicate content check**
  - [ ] Run Copyscape or Google search for unique phrases
  - [ ] No content scraped from other sites
  - [ ] Press releases and syndicated content use canonicals or noindex
  - [ ] Guest posts include canonical to original if cross-posted

---

## 3. AI Readiness Audit: Bot Access, Chunking, and Citation Potential

### AI Bot Access & Configuration

- [ ] **AI bot access verification**
  - [ ] `OAI-SearchBot` (OpenAI) allowed in robots.txt
  - [ ] `ChatGPT-User` (ChatGPT Browse) allowed in robots.txt
  - [ ] `ClaudeBot` (Anthropic) allowed in robots.txt
  - [ ] `PerplexityBot` (Perplexity) allowed in robots.txt
  - [ ] `GoogleBot-Extended` (Google Bard/Gemini) allowed in robots.txt
  - [ ] `anthropic-ai` (alternative Anthropic bot) allowed in robots.txt
  - [ ] `cohere-ai` (Cohere) allowed if relevant
  - [ ] No blanket `User-agent: *` blocks preventing AI bots

- [ ] **Bing Webmaster Tools verification**
  - [ ] Site verified in Bing Webmaster Tools
  - [ ] Sitemap submitted to Bing
  - [ ] Crawl stats monitored (Bing powers many AI search engines)
  - [ ] No crawl errors reported

### Content Chunking & Structure

- [ ] **Self-contained passages**
  - [ ] Content organized into logical, standalone sections
  - [ ] Each section answers a specific sub-question
  - [ ] Target chunk size: 40-150 words per passage
  - [ ] Sections make sense when extracted out of context

- [ ] **Answer-first writing**
  - [ ] Key takeaway or answer in first 1-2 sentences of section
  - [ ] No burying the lede
  - [ ] Use inverted pyramid structure (most important info first)
  - [ ] Direct answers to "what," "why," "how" questions

- [ ] **Heading as question or clear topic**
  - [ ] Headings phrased as questions when appropriate (H2: "What is X?")
  - [ ] Or headings as clear topics (H2: "X Definition")
  - [ ] AI engines use headings to identify relevant sections

### Entity Clarity & Structured Data

- [ ] **Entity clarity check**
  - [ ] Brand name consistently used (not just "we" or "our company")
  - [ ] Product/service names clearly defined on first mention
  - [ ] Key entities linked to authoritative sources (Wikipedia, official sites)
  - [ ] Abbreviations spelled out on first use

- [ ] **Schema markup presence and validity**
  - [ ] Organization Schema on homepage/about page
  - [ ] Article or BlogPosting Schema on blog posts
  - [ ] Product Schema on product pages (with reviews, price, availability)
  - [ ] FAQ Schema on FAQ sections (each Q&A wrapped)
  - [ ] HowTo Schema on tutorials/guides
  - [ ] BreadcrumbList Schema on breadcrumbs
  - [ ] LocalBusiness Schema if applicable
  - [ ] Validate with Google Rich Results Test and Schema.org validator

- [ ] **Structured data best practices**
  - [ ] JSON-LD format used (preferred over Microdata)
  - [ ] Schema matches visible content (no hidden data)
  - [ ] No spammy or misleading markup
  - [ ] Review and AggregateRating only if genuine reviews present

### Citation-Worthiness & Data

- [ ] **Data and statistics**
  - [ ] Original data, research, or surveys included where possible
  - [ ] Third-party data properly cited with links
  - [ ] Statistics presented clearly (tables, charts, callouts)
  - [ ] Year/date of data provided

- [ ] **Unique insights and expertise**
  - [ ] Expert quotes or interviews included
  - [ ] Case studies and real-world examples
  - [ ] Proprietary methodologies or frameworks explained
  - [ ] Contrarian or unique perspectives offered

- [ ] **Citation triggers**
  - [ ] Sentences written to be directly quotable
  - [ ] Key stats and facts in standalone paragraphs
  - [ ] "According to [Source]" phrasing used
  - [ ] Listicles and numbered insights (AI loves lists)

### llms.txt (Optional but Recommended)

- [ ] **llms.txt file**
  - [ ] File exists at `/llms.txt`
  - [ ] Contains brief site description
  - [ ] Links to key pages (about, contact, main topics)
  - [ ] Notes crawl preferences or restrictions (optional)
  - [ ] Plain text format, under 500 words
  - [ ] Example:
    ```
    # About Example.com
    We provide [brief description].

    ## Key Pages
    - Home: https://example.com
    - About: https://example.com/about
    - Blog: https://example.com/blog

    ## Crawl Notes
    All content freely accessible for AI training and search.
    ```

### AI Search Engine Submission (Optional)

- [ ] **Direct submission to AI engines**
  - [ ] Submitted site to Perplexity (if submission program available)
  - [ ] Submitted site to You.com (if applicable)
  - [ ] Monitored AI search engine appearance (search for brand/key topics)

---

## Final Checks

- [ ] **Google Search Console review**
  - [ ] No critical errors in Coverage report
  - [ ] Core Web Vitals passing for majority of URLs
  - [ ] Mobile Usability issues resolved
  - [ ] Manual actions: none

- [ ] **Bing Webmaster Tools review**
  - [ ] Site verified and crawled
  - [ ] No crawl errors
  - [ ] Sitemap processed successfully

- [ ] **Test search presence**
  - [ ] `site:example.com` in Google returns correct pages
  - [ ] `site:example.com` in Bing returns correct pages
  - [ ] Brand name search returns site as #1 result
  - [ ] Key topic searches show site in top 20 (track with rank tracker)

- [ ] **User experience spot check**
  - [ ] Test site on multiple devices (desktop, tablet, mobile)
  - [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
  - [ ] All forms work correctly
  - [ ] All CTAs clickable and lead to correct pages
  - [ ] No broken images or missing assets

---

## Related Resources

- [Technical SEO Deep Dive](../seo/technical.md)
- [AI Bot Configuration](../geo/ai-bots.md)
- [Optimization Workflow](../workflows/optimization.md)

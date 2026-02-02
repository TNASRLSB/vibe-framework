# Technical SEO

**Answer-first:** Technical SEO ensures search engines can crawl, render, index, and rank your site efficiently. Focus on site architecture, speed, mobile-first design, and clean code. Fix technical issues before spending time on content.

---

## 1. Site Architecture

### Flat vs Deep Structure

| Structure | Description | Max Clicks to Any Page | Best For |
|-----------|-------------|-------------------------|----------|
| **Flat** | Few levels of hierarchy | 1-3 clicks from homepage | Small sites (<500 pages), SaaS products |
| **Deep** | Many levels of nested categories | 4+ clicks from homepage | E-commerce, large content sites |

**Rule of thumb:** Keep important pages within 3 clicks of homepage. Use internal linking to flatten deep sites.

### URL Structure Best Practices

```
✅ GOOD
example.com/blog/technical-seo-guide
example.com/products/shoes/running-shoes
example.com/en/pricing

❌ BAD
example.com/index.php?id=12345
example.com/blog/2024/01/15/post-123-title
example.com/products/category/subcategory/subsubcategory/item
```

**Rules:**
- Use hyphens, not underscores
- Lowercase only
- Include target keyword
- Keep under 60 characters
- Avoid dynamic parameters when possible
- Remove session IDs, tracking codes

### Breadcrumbs

Required for sites with >2 levels of hierarchy.

```html
<!-- HTML5 + Schema.org -->
<nav aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/products">
        <span itemprop="name">Products</span>
      </a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">Running Shoes</span>
      <meta itemprop="position" content="3" />
    </li>
  </ol>
</nav>
```

---

## 2. Crawlability

### robots.txt Syntax

**Location:** `example.com/robots.txt` (root only, not subdirectory)

```txt
# Allow all bots to crawl everything
User-agent: *
Disallow:

# Block all bots
User-agent: *
Disallow: /

# Block specific paths
User-agent: *
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /api/
Disallow: /*.json$

# Block specific bot
User-agent: GPTBot
Disallow: /

# Allow specific bot despite global block
User-agent: Googlebot
Disallow:

User-agent: *
Disallow: /

# Sitemap location (required)
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
```

**Common mistakes:**
- ❌ Blocking CSS/JS files (prevents rendering)
- ❌ Using noindex in robots.txt (deprecated, use meta tag)
- ❌ Case-sensitive paths (use lowercase)

### Crawl Budget Optimization

**Crawl budget** = pages Googlebot will crawl per day. Matters for sites >10,000 pages.

**Optimization checklist:**
- [ ] Fix redirect chains (A→B→C becomes A→C)
- [ ] Remove orphaned pages (no internal links)
- [ ] Fix 404s and soft 404s
- [ ] Block low-value pages in robots.txt (search results, filters, session IDs)
- [ ] Use canonical tags to consolidate duplicate pages
- [ ] Reduce server response time (<200ms)
- [ ] Return 5xx errors only when truly down (not for slow queries)

**Monitor in Google Search Console:**
- Crawl Stats report
- Look for crawl errors, time spent downloading pages

### XML Sitemaps

**Standard sitemap:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2026-02-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Sitemap index (for large sites):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2026-02-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
    <lastmod>2026-02-01</lastmod>
  </sitemap>
</sitemapindex>
```

**Rules:**
- Max 50,000 URLs per sitemap
- Max 50MB uncompressed
- Only include indexable URLs (200 status, canonical, no noindex)
- Update lastmod only when content changes
- Ignore changefreq and priority (Google ignores them)

**Specialized sitemaps:**
- **News:** `<news:news>` tags, last 2 days only
- **Video:** `<video:video>` tags, thumbnail required
- **Image:** `<image:image>` tags for galleries

---

## 3. Indexability

### Canonical Tags

**Purpose:** Tell Google which version of a duplicate/similar page is primary.

```html
<!-- On duplicate pages -->
<link rel="canonical" href="https://example.com/products/shoes" />

<!-- On the canonical page (self-referencing) -->
<link rel="canonical" href="https://example.com/products/shoes" />
```

**When to use:**
- Product pages with filters/sorting (canonical = unfiltered version)
- HTTP vs HTTPS versions
- www vs non-www
- Paginated series (each page can be self-canonical)
- Syndicated content (canonical to original source)

**HTTP header alternative (PDFs, images):**
```
Link: <https://example.com/page>; rel="canonical"
```

### noindex / nofollow

```html
<!-- Don't index this page, but follow links -->
<meta name="robots" content="noindex, follow" />

<!-- Don't index, don't follow links -->
<meta name="robots" content="noindex, nofollow" />

<!-- Allow indexing, don't follow links -->
<meta name="robots" content="index, nofollow" />

<!-- For specific bot -->
<meta name="googlebot" content="noindex" />
```

**HTTP header alternative:**
```
X-Robots-Tag: noindex, nofollow
```

**Use cases:**
- **noindex:** Thank you pages, login pages, staging sites, thin content
- **nofollow:** Paid links, untrusted user content, comment sections

### Pagination Handling

**Option 1: Self-canonical (recommended)**
Each page is indexable.
```html
<!-- On /products?page=2 -->
<link rel="canonical" href="https://example.com/products?page=2" />
<link rel="prev" href="https://example.com/products?page=1" />
<link rel="next" href="https://example.com/products?page=3" />
```

**Option 2: Canonical to View All**
```html
<!-- On /products?page=2 -->
<link rel="canonical" href="https://example.com/products?page=all" />
```

**Option 3: Noindex paginated pages**
```html
<!-- On /products?page=2 -->
<meta name="robots" content="noindex, follow" />
```

**Infinite scroll:** Implement "Load More" button fallback for crawlers.

---

## 4. Core Web Vitals

### Metrics and Targets

| Metric | Measures | Target | Max Acceptable |
|--------|----------|--------|----------------|
| **LCP** (Largest Contentful Paint) | Loading performance | <2.5s | <4.0s |
| **FID** (First Input Delay) | Interactivity (deprecated) | <100ms | <300ms |
| **INP** (Interaction to Next Paint) | Responsiveness (replaces FID) | <200ms | <500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | <0.1 | <0.25 |

**Measured at 75th percentile** of real user visits.

### How to Measure

**Field data (real users):**
- Google Search Console → Core Web Vitals report
- PageSpeed Insights → Field Data section
- Chrome UX Report (CrUX)

**Lab data (simulated):**
- PageSpeed Insights → Lab Data
- Lighthouse (Chrome DevTools)
- WebPageTest.org

**JavaScript API (Real User Monitoring):**
```javascript
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({entryTypes: ['largest-contentful-paint']});

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('INP:', entry.duration);
  }
}).observe({type: 'event', durationThreshold: 40});
```

### How to Fix

**LCP (<2.5s):**
- [ ] Optimize largest image (WebP, AVIF, proper sizing)
- [ ] Use CDN for images and fonts
- [ ] Preload LCP resource: `<link rel="preload" as="image" href="hero.jpg">`
- [ ] Eliminate render-blocking resources (defer/async scripts, inline critical CSS)
- [ ] Reduce server response time (TTFB <600ms)
- [ ] Use image srcset for responsive images

**INP (<200ms):**
- [ ] Minimize JavaScript execution time
- [ ] Break up long tasks (>50ms)
- [ ] Use web workers for heavy computation
- [ ] Debounce/throttle event handlers
- [ ] Code splitting (load JS only when needed)
- [ ] Remove unused JavaScript

**CLS (<0.1):**
- [ ] Set explicit width/height on images and videos
- [ ] Reserve space for ads (min-height)
- [ ] Avoid inserting content above existing content
- [ ] Use `font-display: swap` carefully (causes CLS if fallback font different size)
- [ ] Preload fonts: `<link rel="preload" as="font" href="font.woff2" crossorigin>`

---

## 5. Mobile-First Indexing

**Status:** Google uses mobile version of site for indexing and ranking (since 2021).

### Responsive Design Checklist

- [ ] Same content on mobile and desktop (no hidden content)
- [ ] Same structured data on both versions
- [ ] Same meta titles and descriptions
- [ ] Same canonical tags
- [ ] Images and videos visible on mobile (not lazy-loaded indefinitely)
- [ ] Mobile navigation accessible without JavaScript errors

**Viewport configuration:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

❌ **Don't:**
```html
<!-- Blocks scaling (accessibility issue) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Mobile Usability Issues

Check in Google Search Console → Mobile Usability report.

**Common issues:**
- Text too small to read (font-size <16px)
- Clickable elements too close together (min 48px tap targets, 8px spacing)
- Content wider than screen
- Viewport not configured
- Interstitials blocking content

### Dynamic Serving vs Responsive

| Approach | Description | SEO Impact |
|----------|-------------|------------|
| **Responsive** (recommended) | Same HTML, different CSS | Best (one URL, one HTML) |
| **Dynamic serving** | Different HTML per device, same URL | OK (requires Vary: User-Agent header) |
| **Separate mobile URLs** | m.example.com | Avoid (requires rel=alternate tags, easy to misconfigure) |

---

## 6. HTTPS and Security

### SSL/TLS Requirements

**HTTPS is a ranking signal.** Non-HTTPS sites show "Not Secure" warning in Chrome.

**Setup:**
1. Get SSL certificate (Let's Encrypt free, auto-renews)
2. Install on server
3. 301 redirect HTTP → HTTPS
4. Update internal links to HTTPS
5. Update canonical tags to HTTPS
6. Update sitemap to HTTPS
7. Update Google Search Console property

**Check certificate:**
```bash
openssl s_client -connect example.com:443 -servername example.com
```

### Mixed Content

**Mixed content** = HTTPS page loading HTTP resources (images, scripts, CSS).

**Types:**
- **Passive** (images, video): Warning in console, still loads
- **Active** (scripts, CSS, fonts): Blocked by browser

**Fix:**
```html
❌ <script src="http://example.com/script.js"></script>
✅ <script src="https://example.com/script.js"></script>
✅ <script src="//example.com/script.js"></script> <!-- Protocol-relative -->
```

**Check for mixed content:**
- Chrome DevTools → Console (warnings)
- WhyNoPadlock.com
- JitBit SSL Checker

### HSTS (HTTP Strict Transport Security)

**Forces HTTPS** for all future visits, prevents downgrade attacks.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Parameters:**
- `max-age=31536000` → 1 year (required)
- `includeSubDomains` → Apply to all subdomains
- `preload` → Submit to HSTS preload list (browsers will enforce HTTPS before first visit)

**Submit to preload list:** hstspreload.org

---

## 7. Page Speed Optimization

### Image Optimization

**Checklist:**
- [ ] Use next-gen formats (WebP, AVIF)
- [ ] Compress images (TinyPNG, ImageOptim, Squoosh)
- [ ] Serve correct size (don't serve 3000px image for 300px display)
- [ ] Use responsive images (srcset)
- [ ] Lazy load below-the-fold images
- [ ] Use CDN for images

**Responsive images:**
```html
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Description"
  width="800"
  height="600"
  loading="lazy"
/>
```

**WebP with fallback:**
```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Lazy Loading

**Native lazy loading:**
```html
<img src="image.jpg" loading="lazy" alt="Description" />
<iframe src="video.html" loading="lazy"></iframe>
```

**Don't lazy load:**
- LCP image (above-the-fold hero image)
- First ~2 screens of content

### Code Splitting

**Load JavaScript only when needed.**

**Dynamic imports (Webpack, Vite):**
```javascript
// Instead of:
import HeavyComponent from './HeavyComponent';

// Use:
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

**Route-based splitting (Next.js):**
```javascript
// pages/about.js loaded only when /about visited
export default function About() { ... }
```

### CDN (Content Delivery Network)

**Purpose:** Serve static assets from edge locations close to users.

**Popular CDNs:**
- Cloudflare (free tier)
- AWS CloudFront
- Fastly
- BunnyCDN

**What to serve from CDN:**
- Images, videos
- CSS, JavaScript
- Fonts
- PDFs

**Don't serve from CDN:**
- HTML (unless using edge caching with proper invalidation)
- Dynamic API responses

### Caching Headers

**Cache-Control examples:**
```
# Static assets (versioned URLs with hash)
Cache-Control: public, max-age=31536000, immutable

# HTML (always revalidate)
Cache-Control: no-cache

# API responses (private user data)
Cache-Control: private, max-age=0, must-revalidate

# Images (1 week)
Cache-Control: public, max-age=604800
```

**ETag (for conditional requests):**
```
ETag: "abc123"
```
Browser sends `If-None-Match: "abc123"`, server responds `304 Not Modified` if unchanged.

---

## 8. Structured Data / Schema.org

**Purpose:** Help search engines understand page content and display rich snippets.

**Implementation:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Technical SEO Guide",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2026-02-01"
}
</script>
```

**Common types:**
- Article, BlogPosting, NewsArticle
- Product, Offer, AggregateRating
- LocalBusiness, Organization
- Recipe, Event, VideoObject
- FAQPage, HowTo

**Test:**
- Google Rich Results Test
- Schema Markup Validator

**Deep dive:** See [schema.md](schema.md) for comprehensive guide.

---

## 9. International SEO

### hreflang Tags

**Purpose:** Tell Google which language/country version to show.

```html
<!-- On English US page -->
<link rel="alternate" hreflang="en-us" href="https://example.com/en-us/page" />
<link rel="alternate" hreflang="en-gb" href="https://example.com/en-gb/page" />
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

**Rules:**
- Every page must reference itself and all alternatives
- Use ISO 639-1 language codes (en, de, fr)
- Optionally add ISO 3166-1 Alpha 2 country codes (en-US, en-GB)
- Include `x-default` for language selector or default version
- Bidirectional (each page must link back)

**Sitemap alternative:**
```xml
<url>
  <loc>https://example.com/en-us/page</loc>
  <xhtml:link rel="alternate" hreflang="en-us" href="https://example.com/en-us/page"/>
  <xhtml:link rel="alternate" hreflang="en-gb" href="https://example.com/en-gb/page"/>
  <xhtml:link rel="alternate" hreflang="de" href="https://example.com/de/page"/>
</url>
```

### URL Structure for International Sites

| Structure | Example | Pros | Cons |
|-----------|---------|------|------|
| **ccTLD** | example.de | Strongest geo-signal | Expensive, complex infrastructure |
| **Subdomain** | de.example.com | Easy to set up, separate hosting | Treated as separate site |
| **Subdirectory** (recommended) | example.com/de/ | Consolidates domain authority | Requires server-side config |
| **Parameter** | example.com?lang=de | Easy to implement | Weak signal, messy URLs |

### Language vs Country Targeting

```html
<!-- Language only (Spanish, any country) -->
<link rel="alternate" hreflang="es" href="https://example.com/es/" />

<!-- Language + Country (Spanish for Spain) -->
<link rel="alternate" hreflang="es-es" href="https://example.com/es-es/" />

<!-- Language + Country (Spanish for Mexico) -->
<link rel="alternate" hreflang="es-mx" href="https://example.com/es-mx/" />
```

---

## 10. Log File Analysis

**Purpose:** Understand how search engines actually crawl your site.

### What to Look For

**Server log format (Apache):**
```
66.249.66.1 - - [01/Feb/2026:10:15:32 +0000] "GET /page HTTP/1.1" 200 5432 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
```

**Key insights:**

1. **Crawl frequency per bot:**
   - Googlebot, Bingbot crawling important pages daily?
   - Budget wasted on low-value pages?

2. **Response codes:**
   - High 4xx/5xx rates → fix errors
   - 3xx chains → fix redirects

3. **Pages not crawled:**
   - Orphaned pages (no internal links)
   - Blocked by robots.txt

4. **Crawl depth:**
   - Important pages being reached?
   - Pages >4 clicks from home rarely crawled?

5. **Bot behavior:**
   - Googlebot rendering JavaScript? (Googlebot Desktop + Chrome-Lighthouse user agent)
   - Bots hitting /wp-admin/ → block in robots.txt

**Tools:**
- Screaming Frog Log Analyzer
- Botify
- OnCrawl
- Custom scripts (grep, awk, Python)

**Simple analysis (CLI):**
```bash
# Count requests per bot
grep "Googlebot" access.log | wc -l

# Most crawled URLs
awk '{print $7}' access.log | sort | uniq -c | sort -nr | head -20

# Response codes
awk '{print $9}' access.log | sort | uniq -c | sort -nr
```

---

## 11. JavaScript SEO

### Rendering Strategies

| Strategy | Description | SEO Impact | Performance |
|----------|-------------|------------|-------------|
| **SSR** (Server-Side Rendering) | HTML generated on server per request | Best | Slower TTFB |
| **SSG** (Static Site Generation) | HTML generated at build time | Best | Fastest |
| **CSR** (Client-Side Rendering) | HTML generated in browser via JS | Risky (depends on Google rendering) | Fast TTFB, slow FCP |
| **ISR** (Incremental Static Regeneration) | SSG + revalidation on demand | Best | Fast |
| **Dynamic Rendering** | SSR for bots, CSR for users | OK (Google discourages) | Complex |

### Googlebot Rendering

**How it works:**
1. Googlebot crawls URL (gets HTML)
2. If HTML sufficient, indexes immediately
3. If JavaScript needed, queues for rendering (can take days)
4. Renders page with headless Chrome (WRS - Web Rendering Service)
5. Indexes rendered HTML

**Test rendering:**
- Google Search Console → URL Inspection → View Crawled Page
- Mobile-Friendly Test
- Rich Results Test

### CSR Best Practices

**If using CSR (React, Vue, Angular SPA):**

- [ ] Use SSR/SSG for public content (Next.js, Nuxt, SvelteKit)
- [ ] Provide HTML skeleton with critical content
- [ ] Use loading="lazy" on images
- [ ] Avoid rendering content based on async data fetches (if possible, fetch on server)
- [ ] Test with JavaScript disabled
- [ ] Use `<noscript>` fallback for critical content

**Prerendering (dynamic rendering):**
```javascript
// Detect bot, serve static HTML
if (/bot|googlebot|crawler|spider/i.test(userAgent)) {
  return prerenderService.render(url);
}
```

**Services:** Prerender.io, Rendertron (open-source)

---

## 12. Site Migration Checklist

**Use when moving to new domain, HTTPS, or major URL restructure.**

### Pre-Migration

- [ ] Audit all URLs on old site (Screaming Frog crawl)
- [ ] Create URL mapping spreadsheet (old URL → new URL)
- [ ] Set up new site with same content
- [ ] Test new site on staging environment
- [ ] Verify new site indexable (no noindex, robots.txt allows crawling)
- [ ] Set up Google Analytics and Search Console for new site
- [ ] Backup old site

### During Migration

- [ ] Implement 301 redirects (server-level, not JavaScript)
  ```nginx
  # Nginx example
  server {
    listen 80;
    server_name old-domain.com;
    return 301 https://new-domain.com$request_uri;
  }

  # Specific URL redirects
  location = /old-page {
    return 301 /new-page;
  }
  ```
- [ ] Update internal links to new URLs
- [ ] Update canonical tags to new domain
- [ ] Update sitemap with new URLs
- [ ] Submit new sitemap to Google Search Console
- [ ] Submit address change in Google Search Console (if domain change)
- [ ] Update hreflang tags (if international)
- [ ] Update structured data URLs

### Post-Migration (First Week)

- [ ] Monitor Google Search Console for crawl errors
- [ ] Check redirect chains (use Screaming Frog)
- [ ] Verify 301s return 301 status (not 302, 307)
- [ ] Check analytics traffic (expect 10-20% drop temporarily)
- [ ] Monitor rankings (expect fluctuations for 2-4 weeks)
- [ ] Check for 4xx/5xx errors
- [ ] Verify important pages indexed on new site

### Post-Migration (First Month)

- [ ] Keep 301 redirects for minimum 1 year (ideally permanent)
- [ ] Update external backlinks (reach out to sites linking to old URLs)
- [ ] Update social media profiles with new URLs
- [ ] Update email signatures, business listings
- [ ] Monitor Core Web Vitals (ensure no performance regression)

**Common mistakes:**
- ❌ Using 302 redirects instead of 301
- ❌ Redirect chains (A→B→C should be A→C)
- ❌ Removing redirects too soon
- ❌ Not updating internal links
- ❌ Blocking new site with robots.txt or noindex

---

## Related Resources

- [SEO Fundamentals](fundamentals.md)
- [On-Page SEO](on-page.md)
- [Off-Page SEO](off-page.md)

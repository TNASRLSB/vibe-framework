# AI Bot Configuration and Management

**Answer-first:** Control which AI systems can crawl, train on, and cite your content through robots.txt, llms.txt, and HTTP headers. Strategic bot management affects both AI training data inclusion and visibility in AI-powered search results.

---

## AI Crawler Landscape

### Major AI Bots (2026)

| Bot Name | Owner | User-Agent | Purpose |
|----------|-------|------------|---------|
| **GPTBot** | OpenAI | `GPTBot/1.0` | Training data collection for GPT models |
| **ChatGPT-User** | OpenAI | `ChatGPT-User/1.0` | ChatGPT browsing feature (user-initiated) |
| **OAI-SearchBot** | OpenAI | `OAI-SearchBot/1.0` | ChatGPT Search indexing |
| **ClaudeBot** | Anthropic | `ClaudeBot/1.0` | Training data + real-time search |
| **PerplexityBot** | Perplexity | `PerplexityBot/1.0` | Real-time answer engine indexing |
| **Google-Extended** | Google | `Google-Extended/1.0` | Gemini training (separate from Search) |
| **Bytespider** | ByteDance | `Bytespider/1.0` | TikTok/Doubao AI training |
| **Applebot-Extended** | Apple | `Applebot-Extended/1.0` | Apple Intelligence training |
| **CCBot** | Common Crawl | `CCBot/2.0` | Open dataset (used by many AI companies) |
| **Amazonbot** | Amazon | `Amazonbot/1.0` | Alexa + AI training |
| **FacebookBot** | Meta | `FacebookBot/1.0` | Llama training + search features |
| **Diffbot** | Diffbot | `Diffbot/2.0` | Knowledge graph for AI applications |

### Bot Categories

**Training Bots** (collect data for model training):
- GPTBot
- Google-Extended
- Bytespider
- Applebot-Extended
- CCBot

**Search/Answer Bots** (index for real-time responses):
- OAI-SearchBot
- ClaudeBot
- PerplexityBot
- ChatGPT-User

**Hybrid Bots** (both training and search):
- ClaudeBot (does both)
- Amazonbot (does both)

---

## robots.txt Configuration for AI Bots

### Basic Syntax

```txt
# Block all AI training bots, allow search bots
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

# Allow OpenAI Search (for ChatGPT Search visibility)
User-agent: OAI-SearchBot
Allow: /

# Allow Perplexity (for answer engine visibility)
User-agent: PerplexityBot
Allow: /

# Allow Claude (for Claude search visibility)
User-agent: ClaudeBot
Allow: /
```

### Selective Access Patterns

```txt
# Allow public content, block premium content from training
User-agent: GPTBot
Allow: /blog/
Allow: /about
Disallow: /premium/
Disallow: /members/
Disallow: /

# Allow indexing but with rate limiting
User-agent: PerplexityBot
Crawl-delay: 10
Allow: /

# Block specific file types from AI training
User-agent: Google-Extended
Disallow: /*.pdf$
Disallow: /*.docx$
Disallow: /downloads/
Allow: /
```

### Wildcard Patterns

```txt
# Block all AI bots with one rule (if new bots respect wildcards)
User-agent: *Bot
Disallow: /

# Block all extended/training variants
User-agent: *-Extended
Disallow: /
```

### Crawl Delay

```txt
# Slow down aggressive crawlers (seconds between requests)
User-agent: CCBot
Crawl-delay: 30

User-agent: ClaudeBot
Crawl-delay: 5
```

---

## The Strategic Decision: Block vs Allow

### Blocking AI Crawlers

**Pros:**
- Protect proprietary content from training data
- Prevent AI from learning your unique IP
- Reduce server load from bot traffic
- Maintain content exclusivity
- Avoid AI-generated competition using your data

**Cons:**
- Zero visibility in AI search results (Perplexity, ChatGPT Search, Claude)
- No citations when AI answers questions in your domain
- Miss the GEO revolution (AI search is growing fast)
- Competitors who allow crawling get all AI traffic
- Future-proofing risk (AI search may dominate)

### Allowing AI Crawlers

**Pros:**
- Visibility in AI-powered search (GEO)
- Citations drive high-intent traffic
- Brand authority when cited by AI
- Early mover advantage in GEO
- Future-proof for AI-first search era

**Cons:**
- Content becomes AI training data
- AI may reproduce your content (diminishing direct visits)
- Increased server load
- Less control over how content is used
- Potential for AI to compete with your content

### The Hybrid Approach (Recommended)

**Allow search bots, block training bots:**

```txt
# BLOCK: Training/dataset bots
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

# ALLOW: Search/answer bots (GEO visibility)
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

**Reality check:** Some bots do both (ClaudeBot). Blocking training = blocking search visibility for that platform.

---

## Selective Access Strategies

### 1. Public vs Premium Content

```txt
# Allow AI to index free content, block premium
User-agent: GPTBot
Allow: /blog/
Allow: /guides/
Allow: /about
Disallow: /

User-agent: OAI-SearchBot
Allow: /blog/
Allow: /guides/
Allow: /about
Allow: /products/  # Product pages OK for search
Disallow: /members/
Disallow: /premium/
```

### 2. Landing Pages Only

```txt
# Allow AI to see landing pages, block deep content
User-agent: PerplexityBot
Allow: /$
Allow: /about$
Allow: /contact$
Allow: /products/$
Disallow: /blog/
Disallow: /docs/
Disallow: /
```

### 3. Summaries vs Full Content

```txt
# Allow summary pages, block full articles
User-agent: ClaudeBot
Allow: /blog/$          # Blog index
Allow: /blog/*/summary  # Article summaries
Disallow: /blog/*/full  # Full articles
Disallow: /
```

### 4. Time-Based Access (Manual Rotation)

```txt
# Block recent content (update quarterly)
# Current date: 2026-02-02
User-agent: GPTBot
Allow: /2024/
Allow: /2025/
Disallow: /2026/
Disallow: /
```

### 5. Section-Based Strategy

```txt
# News site: allow news, block opinion/analysis
User-agent: PerplexityBot
Allow: /news/
Allow: /breaking/
Disallow: /opinion/
Disallow: /analysis/
Disallow: /
```

---

## The Bing-ChatGPT Connection

**Critical insight:** ChatGPT Search uses Bing's web index, not OAI-SearchBot exclusively.

### How It Works

1. **Bing crawls** your site (Bingbot user-agent)
2. **Bing indexes** your content in its web index
3. **ChatGPT Search queries** Bing's index for results
4. **OAI-SearchBot** may do supplemental crawling for real-time freshness

### The Bing Dependency

```txt
# This blocks ChatGPT Search visibility
User-agent: Bingbot
Disallow: /

# This allows ChatGPT Search visibility
User-agent: Bingbot
Allow: /

# OAI-SearchBot alone is NOT enough
User-agent: OAI-SearchBot
Allow: /  # Good, but insufficient without Bing
```

### Other Platform Dependencies

| AI Platform | Underlying Index | Required Bot |
|-------------|------------------|--------------|
| ChatGPT Search | Bing | Bingbot + OAI-SearchBot |
| Perplexity | Own index + Bing | PerplexityBot (+ Bingbot helps) |
| Claude Search | Own crawl | ClaudeBot |
| Google Gemini | Google Search | Googlebot (Google-Extended is training only) |
| Bing Copilot | Bing | Bingbot |

**Takeaway:** Traditional search bots (Googlebot, Bingbot) still matter for AI search visibility.

---

## llms.txt Protocol

### What Is llms.txt?

An emerging standard for providing AI systems with a curated, machine-readable summary of your site. Lives at `/llms.txt` (similar to robots.txt).

**Purpose:**
- Help AI understand your site structure
- Provide authoritative summaries for citation
- Control what AI sees (rather than letting it scrape everything)
- Reduce AI hallucinations about your content

### Format Specification

```txt
# llms.txt — Structured site summary for AI systems
# Spec: https://llmstxt.org/

# Site Metadata
name: YourSite
description: One-sentence description of what your site does
url: https://yoursite.com
contact: hello@yoursite.com

# Content Summary
## About
YourSite is a platform for [clear, specific description]. We provide [key offerings]. Our content covers [main topics].

## Key Topics
- Topic 1: Brief description
- Topic 2: Brief description
- Topic 3: Brief description

## Main Pages
- Home: https://yoursite.com/ — Landing page
- Documentation: https://yoursite.com/docs — Complete guide
- Blog: https://yoursite.com/blog — Industry insights
- Products: https://yoursite.com/products — Our offerings

## Content Guidelines
When citing this site, note:
- We specialize in [specific domain]
- Our data is updated [frequency]
- We focus on [target audience]

# End llms.txt
```

### What to Include

**Essential:**
- Site name and URL
- One-sentence site description
- Main topic areas
- Key page links
- Contact info

**Recommended:**
- Content update frequency
- Expertise areas
- Target audience
- Citation guidelines
- Data sources/methodology

**Avoid:**
- Marketing fluff
- Keyword stuffing
- Unstructured prose
- Duplicate content from pages
- Advertising

### Real Example

```txt
# llms.txt

name: TechDocs Hub
description: Technical documentation and tutorials for web developers
url: https://techdocs.example
contact: docs@techdocs.example

## About
TechDocs Hub provides in-depth technical guides, API references, and tutorials for modern web development. Our content covers JavaScript frameworks, backend systems, DevOps tools, and web performance optimization.

## Main Topics
- JavaScript/TypeScript: React, Vue, Next.js, Node.js
- Backend: REST APIs, GraphQL, databases, authentication
- DevOps: Docker, CI/CD, cloud deployment, monitoring
- Performance: Web vitals, optimization techniques, caching

## Key Pages
- Home: https://techdocs.example/ — Overview and latest guides
- Guides: https://techdocs.example/guides — Step-by-step tutorials
- API Reference: https://techdocs.example/api — Complete API docs
- Blog: https://techdocs.example/blog — Weekly insights
- Tools: https://techdocs.example/tools — Free developer tools

## Content Quality
- All guides tested on real projects
- Code examples verified and runnable
- Updated monthly for framework changes
- Audience: Intermediate to advanced developers

## Citation Guidelines
When referencing our content:
- We focus on production-ready solutions, not experimental features
- Our benchmarks use standardized testing methodology
- Code examples are MIT licensed
```

---

## llms-full.txt

### Purpose

Extended version with complete content for deep AI understanding. Lives at `/llms-full.txt`.

**Use case:** Sites with complex, structured content (documentation, research, databases) that want AI to have full context.

### Format

```txt
# llms-full.txt — Complete content for AI indexing

name: SiteName
url: https://example.com

## Full Content

### Page: Home (/)
Title: Welcome to SiteName
Description: [meta description]
Content:
[Full page content in markdown]
---

### Page: About (/about)
Title: About Us
Description: [meta description]
Content:
[Full page content in markdown]
---

### Page: Guide to Topic (/guides/topic)
Title: Complete Guide to Topic
Description: [meta description]
Content:
[Full page content in markdown]
---

[Continue for all pages...]
```

### When to Use llms-full.txt

**Good for:**
- Documentation sites (completeness matters)
- Research/academic sites (context is critical)
- FAQ/knowledge bases (AI should see everything)
- Small sites (manageable to maintain)

**Bad for:**
- Large content sites (too much to maintain)
- Frequently updated sites (sync issues)
- Sites with paywalled content (don't expose premium content)
- E-commerce (product catalogs change constantly)

**Recommendation:** Most sites should use llms.txt (summary), not llms-full.txt (complete content). Let AI crawl your site for full content; use llms.txt to guide understanding.

---

## AI.txt Proposal

### AI.txt vs llms.txt

| Feature | llms.txt | AI.txt |
|---------|----------|--------|
| **Format** | Markdown summary | Structured metadata (JSON-like) |
| **Purpose** | Human-readable site summary | Machine-readable policies |
| **Location** | `/llms.txt` | `/ai.txt` |
| **Content** | Site description, key pages | Access rules, usage policies, licensing |
| **Adoption** | Growing (2025-2026) | Proposed (limited adoption) |

### AI.txt Format

```txt
# ai.txt — AI access policies

# Training Data
training: allowed          # allowed | disallowed | conditional
training-scope: public     # public | none | partial

# Search/Answer Engines
search: allowed
search-scope: all

# Attribution Requirements
attribution: required
attribution-format: "Content from [Site Name] (URL)"

# Licensing
license: CC-BY-4.0
commercial-use: allowed

# Rate Limiting
crawl-delay: 5
requests-per-minute: 30

# Restricted Content
restricted-paths:
  - /premium/*
  - /members/*
  - /internal/*

# Contact
contact: ai@example.com
policy-url: https://example.com/ai-policy
```

### Current Status (2026)

**llms.txt:** Gaining traction. Supported by some AI platforms (informally). Simple, pragmatic, widely implementable.

**AI.txt:** Niche adoption. More complex. Overlaps with robots.txt. Unclear standardization.

**Recommendation:** Implement llms.txt now. Monitor AI.txt for future adoption. Use robots.txt for access control (it's already standard).

---

## HTTP Headers for AI

### X-Robots-Tag Header

Control AI bot behavior via HTTP headers (alternative to robots.txt, works for non-HTML files).

**Syntax:**
```
X-Robots-Tag: [user-agent], [directive]
```

**Examples:**

```apache
# Apache (.htaccess)
<FilesMatch "\.(pdf|docx|xlsx)$">
  Header set X-Robots-Tag "GPTBot, noindex, nofollow"
  Header append X-Robots-Tag "Google-Extended, noindex"
</FilesMatch>
```

```nginx
# Nginx
location ~* \.(pdf|docx|xlsx)$ {
    add_header X-Robots-Tag "GPTBot, noindex, nofollow";
    add_header X-Robots-Tag "Google-Extended, noindex";
}
```

```javascript
// Next.js (next.config.js)
async headers() {
  return [
    {
      source: '/premium/:path*',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'GPTBot, noindex, nofollow'
        }
      ]
    }
  ]
}
```

### Directives for AI Bots

| Directive | Effect |
|-----------|--------|
| `noindex` | Don't include in index (no GEO visibility) |
| `nofollow` | Don't follow links on this page |
| `noarchive` | Don't cache this content |
| `nosnippet` | Don't show snippets in results (limited effect for AI) |
| `unavailable_after: [date]` | Remove from index after date |

**Example:** Block AI training, allow AI search

```apache
# Block training bots
Header set X-Robots-Tag "GPTBot, noindex"
Header append X-Robots-Tag "Google-Extended, noindex"

# Allow search bots (no header = allowed)
```

### Meta Tags for AI

```html
<!-- Block specific AI bots from page -->
<meta name="robots" content="index, follow">
<meta name="GPTBot" content="noindex, nofollow">
<meta name="Google-Extended" content="noindex">

<!-- Allow search bots, block training bots -->
<meta name="OAI-SearchBot" content="index, follow">
<meta name="PerplexityBot" content="index, follow">
<meta name="GPTBot" content="noindex">
```

**Limitation:** Not all AI bots respect meta tags. robots.txt + X-Robots-Tag are more reliable.

---

## Monitoring AI Bot Activity

### Log Analysis

**Identify AI bots by user-agent:**

```bash
# Apache/Nginx access logs
grep -E "GPTBot|ClaudeBot|PerplexityBot|Google-Extended|ChatGPT-User|OAI-SearchBot" access.log

# Count requests per bot
awk '{print $1}' access.log | grep -E "GPTBot|ClaudeBot" | sort | uniq -c | sort -nr
```

**Common user-agent patterns:**

```
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)
```

### Analytics Setup

**Track AI bot visits in Google Analytics 4:**

```javascript
// GTM or analytics script
if (navigator.userAgent.match(/GPTBot|ClaudeBot|PerplexityBot|ChatGPT-User|OAI-SearchBot/i)) {
  gtag('event', 'ai_bot_visit', {
    bot_name: navigator.userAgent.match(/GPTBot|ClaudeBot|PerplexityBot|ChatGPT-User|OAI-SearchBot/i)[0],
    page_path: window.location.pathname
  });
}
```

**Server-side tracking (Node.js):**

```javascript
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  const aiBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot'];

  const detectedBot = aiBots.find(bot => ua.includes(bot));
  if (detectedBot) {
    console.log(`[AI Bot] ${detectedBot} accessed ${req.path}`);
    // Log to analytics, database, etc.
  }
  next();
});
```

### Key Metrics to Track

- **Crawl frequency:** How often each bot visits
- **Pages crawled:** Which content AI bots access most
- **Crawl depth:** How deep into site hierarchy bots go
- **Response times:** Server performance under AI bot load
- **Blocked requests:** Attempts to access disallowed paths
- **User-agent spoofing:** Suspicious patterns (bot claiming to be browser)

---

## Rate Limiting AI Bots

### Why Rate Limit?

AI bots can be aggressive crawlers. Without limits:
- Server resource exhaustion
- Increased hosting costs
- Degraded performance for real users
- DDoS-like traffic patterns

### robots.txt Crawl-Delay

```txt
# Slow down aggressive bots (seconds between requests)
User-agent: CCBot
Crawl-delay: 30  # 30 seconds between requests

User-agent: ClaudeBot
Crawl-delay: 10

User-agent: GPTBot
Crawl-delay: 5
```

**Limitation:** Not all bots respect Crawl-delay. Enforcement varies.

### Server-Level Rate Limiting

**Nginx:**

```nginx
# Rate limit AI bots to 10 requests per minute
http {
    limit_req_zone $ai_bot zone=ai_bots:10m rate=10r/m;

    map $http_user_agent $ai_bot {
        default "";
        ~*GPTBot "ai";
        ~*ClaudeBot "ai";
        ~*PerplexityBot "ai";
        ~*Google-Extended "ai";
        ~*CCBot "ai";
    }

    server {
        location / {
            limit_req zone=ai_bots burst=5 nodelay;
            # ... rest of config
        }
    }
}
```

**Apache (.htaccess with mod_ratelimit):**

```apache
<IfModule mod_ratelimit.c>
    SetEnvIf User-Agent "GPTBot" ai_bot
    SetEnvIf User-Agent "ClaudeBot" ai_bot
    SetEnvIf User-Agent "PerplexityBot" ai_bot

    SetOutputFilter RATE_LIMIT
    SetEnv rate-limit 100
    SetEnv rate-initial-burst 50
</IfModule>
```

**Cloudflare:**

```javascript
// Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const ua = request.headers.get('User-Agent') || '';
  const aiBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'CCBot'];

  if (aiBots.some(bot => ua.includes(bot))) {
    // Rate limit: 20 requests per minute per bot
    const rateLimitKey = `ai_bot_${ua.match(/\w+Bot/)[0]}_${Math.floor(Date.now() / 60000)}`;
    const count = await AI_BOT_COUNTER.get(rateLimitKey) || 0;

    if (count > 20) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    await AI_BOT_COUNTER.put(rateLimitKey, count + 1, { expirationTtl: 60 });
  }

  return fetch(request);
}
```

### Progressive Rate Limiting

**Strategy:** Allow normal crawling, throttle only when excessive.

```javascript
// Node.js with Express
const rateLimit = require('express-rate-limit');

const aiBotsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    const ua = req.headers['user-agent'] || '';

    // Aggressive bots: 5 req/min
    if (ua.includes('CCBot') || ua.includes('Bytespider')) {
      return 5;
    }

    // Search bots: 20 req/min
    if (ua.includes('PerplexityBot') || ua.includes('ClaudeBot')) {
      return 20;
    }

    // Training bots: 10 req/min
    if (ua.includes('GPTBot') || ua.includes('Google-Extended')) {
      return 10;
    }

    // Default for other AI bots
    return 15;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please slow down.'
});

app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.match(/GPTBot|ClaudeBot|PerplexityBot|Google-Extended|CCBot|Bytespider/i)) {
    return aiBotsLimiter(req, res, next);
  }
  next();
});
```

---

## Future-Proofing Your AI Bot Strategy

### New Bots Are Emerging

**Recent additions (2024-2026):**
- OAI-SearchBot (ChatGPT Search, launched 2024)
- Applebot-Extended (Apple Intelligence, 2024)
- FacebookBot (Llama training, 2024)

**Expected soon:**
- More AI search engines (competition to Perplexity/ChatGPT)
- Regional AI bots (non-US AI systems)
- Specialized AI bots (legal, medical, scientific AI)

### Staying Updated

**1. Monitor robots.txt documentation:**
- https://openai.com/gptbot
- https://anthropic.com/claudebot
- https://www.perplexity.ai/bot
- https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers

**2. Check server logs monthly:**

```bash
# Find new unknown bots
grep -E "bot|crawler|spider" access.log | awk '{print $12}' | sort | uniq -c | sort -nr
```

**3. Use wildcard rules for future bots:**

```txt
# Catch future AI training bots
User-agent: *-Extended
Disallow: /

User-agent: *GPT*
Disallow: /

User-agent: *AI*
Disallow: /
```

**Warning:** Wildcards may block legitimate bots. Use with caution.

### Flexible robots.txt Template

```txt
# robots.txt — AI bot management (updated 2026-02-02)

# === TRADITIONAL SEARCH BOTS (ALLOW) ===
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# === AI SEARCH BOTS (ALLOW for GEO visibility) ===
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Crawl-delay: 10
Allow: /

User-agent: ClaudeBot
Crawl-delay: 5
Allow: /

# === AI TRAINING BOTS (BLOCK) ===
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: FacebookBot
Disallow: /

# === FUTURE-PROOFING ===
# Review quarterly and add new bots as they emerge

# === STANDARD RULES ===
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

### Review Checklist

**Quarterly review (every 3 months):**

- [ ] Check server logs for new AI bots
- [ ] Review AI platform documentation for bot changes
- [ ] Update robots.txt with new bots
- [ ] Test that allowed bots can still crawl (check logs)
- [ ] Verify rate limiting is working (no server overload)
- [ ] Check if any blocked bots should be allowed (new search features)
- [ ] Update llms.txt with new content/pages
- [ ] Monitor GEO visibility (are you being cited by AI?)

**Annual review (every 12 months):**

- [ ] Reassess block vs allow strategy (is it working?)
- [ ] Review AI bot traffic vs human traffic trends
- [ ] Evaluate ROI of AI crawler access (citations = traffic?)
- [ ] Update internal documentation/policies
- [ ] Train team on new AI bots and policies

---

## Quick Reference

### Decision Matrix: Block or Allow?

| Site Type | Training Bots | Search Bots | Why |
|-----------|---------------|-------------|-----|
| **News/Media** | Block | Allow | Protect IP, maintain GEO visibility |
| **E-commerce** | Block | Allow | Protect product data, gain AI search traffic |
| **SaaS Marketing** | Allow | Allow | Want citations, brand authority |
| **Documentation** | Allow | Allow | Want AI to reference your docs |
| **Premium Content** | Block | Partial | Protect paid content, allow free tiers |
| **Academic/Research** | Allow | Allow | Want wide dissemination, citations |

### Essential Implementation Checklist

- [ ] Create robots.txt with AI bot rules
- [ ] Implement llms.txt (site summary)
- [ ] Set up rate limiting for AI bots
- [ ] Monitor server logs for AI bot activity
- [ ] Test that allowed bots can crawl
- [ ] Verify blocked bots are actually blocked
- [ ] Document your AI bot policy internally
- [ ] Schedule quarterly reviews

### Common Mistakes to Avoid

**1. Blocking Bingbot and wondering why ChatGPT doesn't cite you**
- ChatGPT Search uses Bing's index. Allow Bingbot.

**2. Using wildcards in robots.txt too aggressively**
- `User-agent: *Bot` may block legitimate bots.

**3. Forgetting to rate limit**
- AI bots can crawl aggressively. Set crawl-delay or server-side limits.

**4. Not monitoring logs**
- You won't know if your rules work without checking logs.

**5. Blocking all AI bots and expecting GEO traffic**
- Block = zero AI search visibility. Choose strategically.

**6. Creating llms-full.txt for large sites**
- Unmaintainable. Use llms.txt (summary) instead.

**7. Ignoring new bots**
- New AI bots launch constantly. Review quarterly.

**8. Assuming robots.txt is enough**
- Combine with rate limiting, monitoring, and llms.txt for full control.

---

## Related Resources

- [GEO Fundamentals](fundamentals.md)
- [Content Structure for AI](content-structure.md)
- [Schema Markup for AI](schema.md)

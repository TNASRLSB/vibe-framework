# Schema Markup for SEO and GEO

**Status:** Complete knowledge base
**Last updated:** 2026-02-02

Comprehensive guide to Schema.org structured data for search engines and AI systems.

---

## What is Schema.org

Schema.org is a collaborative, community-driven vocabulary for structured data markup on web pages. Created and maintained by Google, Bing, Yahoo, and Yandex in 2011.

**Purpose:**
- Standardize how web content is described
- Enable machines to understand page semantics
- Power rich search results and AI knowledge extraction
- Create shared vocabulary across search engines and LLMs

**Evolution:**
- Started as SEO tool for rich snippets
- Now critical for GEO (Generative Engine Optimization)
- LLMs use schema to build knowledge graphs
- Entity disambiguation and relationship mapping

**Key principle:** Explicit is better than implicit. Don't make machines guess what your content means.

---

## JSON-LD vs Microdata vs RDFa

Three formats for implementing Schema markup. Google recommends JSON-LD.

### JSON-LD (JavaScript Object Notation for Linked Data)

**Recommended format.** Script tag in HTML head, separate from visible content.

**Advantages:**
- Clean separation of structured data and HTML
- Easy to add/remove without touching content
- No risk of breaking page layout
- Can be generated server-side or client-side
- Multiple scripts can be added independently

**Example:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding Schema Markup",
  "author": {
    "@type": "Person",
    "name": "Jane Doe"
  }
}
</script>
```

### Microdata

Inline attributes added to HTML elements.

**Syntax:**
```html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">Jane Doe</span>
  <span itemprop="jobTitle">Engineer</span>
</div>
```

**Drawbacks:**
- Pollutes HTML with schema attributes
- Hard to maintain
- Must match DOM structure exactly
- Risk of breaking on layout changes

### RDFa (Resource Description Framework in Attributes)

Similar to Microdata, uses different attributes.

**Syntax:**
```html
<div vocab="https://schema.org/" typeof="Person">
  <span property="name">Jane Doe</span>
</div>
```

**Drawbacks:**
- Same maintenance issues as Microdata
- Less widely adopted
- More verbose syntax

**Verdict:** Use JSON-LD unless you have a specific reason not to.

---

## Schema Types Catalog

Schema.org defines 800+ types. These are the most valuable for SEO and GEO.

### Core Types

| Type | Use For | SEO Impact | GEO Impact |
|------|---------|------------|------------|
| **Article** | Blog posts, news, guides | Rich snippets, Top Stories | Citation authority, content attribution |
| **Product** | E-commerce items | Rich results with price/reviews | Product knowledge graph |
| **FAQ** | Frequently asked questions | FAQ dropdown in SERP | Direct answer extraction |
| **LocalBusiness** | Physical locations | Local pack, maps | Location entity disambiguation |
| **Person** | Author profiles, bios | Knowledge panel | Identity verification |
| **HowTo** | Step-by-step instructions | Rich results with steps | Procedural knowledge extraction |
| **Organization** | Company profiles | Knowledge panel, sitelinks | Entity relationships |
| **Event** | Conferences, webinars | Event rich results | Temporal knowledge |
| **BreadcrumbList** | Site navigation | Breadcrumb display in SERP | Site structure understanding |
| **WebPage** | Generic page markup | SERP appearance control | Page purpose classification |
| **VideoObject** | Video content | Video rich results | Multimodal content indexing |

### Specialized Types

| Type | Use For | Value |
|------|---------|-------|
| **Recipe** | Cooking instructions | Recipe rich results with ratings |
| **Course** | Educational content | Course listings with provider |
| **JobPosting** | Job listings | Google for Jobs integration |
| **Review** | Product/service reviews | Star ratings in SERP |
| **SoftwareApplication** | Apps and tools | App rich results |
| **Book** | Published books | Book knowledge panel |
| **Movie** | Films | Movie knowledge panel |
| **MusicAlbum** | Albums | Music knowledge panel |

---

## Required vs Recommended Properties

Each schema type has required and recommended properties. Missing required properties = no rich results.

### Article Schema

**Required:**
- `headline` (string, max 110 characters)
- `image` (URL or ImageObject)
- `datePublished` (ISO 8601 date)

**Recommended:**
- `author` (Person or Organization)
- `dateModified` (ISO 8601 date)
- `publisher` (Organization with name and logo)
- `description` (string, summary)
- `articleBody` (full text)
- `articleSection` (category)
- `wordCount` (integer)
- `inLanguage` (BCP 47 language code)

### Product Schema

**Required:**
- `name` (product name)
- `image` (product image URL)
- `description` (product description)

**Recommended:**
- `brand` (Brand or Organization)
- `offers` (Offer with price, currency, availability)
- `aggregateRating` (AggregateRating with ratingValue, reviewCount)
- `review` (Review array)
- `sku` (product SKU)
- `gtin` (GTIN-8/12/13/14)
- `mpn` (manufacturer part number)

### FAQ Schema

**Required:**
- `mainEntity` (array of Question objects)
- Each Question must have `name` (question text)
- Each Question must have `acceptedAnswer` (Answer with text)

**Recommended:**
- Multiple questions (minimum 2 for rich results)
- Clear, concise answers
- Avoid promotional content

### LocalBusiness Schema

**Required:**
- `name` (business name)
- `address` (PostalAddress with streetAddress, addressLocality, postalCode, addressCountry)

**Recommended:**
- `telephone` (phone number)
- `openingHoursSpecification` (hours of operation)
- `geo` (GeoCoordinates with latitude/longitude)
- `url` (website URL)
- `image` (business photo)
- `priceRange` (e.g., "$$")
- `aggregateRating` (customer ratings)

### Person Schema

**Required:**
- `name` (full name)

**Recommended:**
- `url` (personal website or profile)
- `image` (photo URL)
- `jobTitle` (current position)
- `worksFor` (Organization)
- `sameAs` (array of social profile URLs)
- `alumniOf` (educational institutions)
- `knowsAbout` (expertise areas)

### HowTo Schema

**Required:**
- `name` (title of how-to)
- `step` (array of HowToStep or HowToSection)
- Each HowToStep must have `text` or `name`

**Recommended:**
- `image` (for each step)
- `totalTime` (ISO 8601 duration)
- `tool` (required tools)
- `supply` (required materials)
- `estimatedCost` (cost estimate)

---

## Rich Snippets and SERP Features

Schema markup unlocks enhanced search result displays.

### What Schema Enables

| Feature | Schema Type | Appearance |
|---------|-------------|------------|
| **Star ratings** | Product, Recipe, Review | ★★★★☆ (4.5 stars, 120 reviews) |
| **Price display** | Product with Offer | $49.99 - In stock |
| **FAQ dropdowns** | FAQ | Expandable Q&A in SERP |
| **How-to steps** | HowTo | Numbered steps with images |
| **Breadcrumbs** | BreadcrumbList | Home > Category > Page |
| **Event details** | Event | Date, time, location, ticket info |
| **Video thumbnails** | VideoObject | Video preview with duration |
| **Recipe cards** | Recipe | Cook time, calories, ratings |
| **Job listings** | JobPosting | Salary, location, date posted |
| **Knowledge panels** | Organization, Person | Sidebar with key facts |

### Rich Result Eligibility

**Requirements:**
1. Valid schema markup (passes validation)
2. Publicly accessible page (no login required)
3. Content matches schema (no spam)
4. Follows Google quality guidelines
5. Type-specific property requirements met

**Not guaranteed:**
- Google chooses whether to show rich results
- Depends on query relevance and competition
- Can take weeks to appear after implementation

### Testing Rich Results

**Tools:**
- Google Rich Results Test: `search.google.com/test/rich-results`
- Schema Markup Validator: `validator.schema.org`
- Google Search Console: Rich Results report

**What to check:**
- All required properties present
- No errors or warnings
- Preview shows expected appearance
- Mobile and desktop rendering

---

## Knowledge Graphs and Entity Disambiguation

Schema helps LLMs and search engines understand entities and relationships.

### Entity Disambiguation

**Problem:** "Jordan" could be:
- Michael Jordan (person, basketball player)
- Jordan (country)
- Air Jordan (product line)
- Jordan River (place)

**Solution:** Schema provides explicit entity identification.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Michael Jordan",
  "@id": "https://example.com/michael-jordan",
  "sameAs": [
    "https://en.wikipedia.org/wiki/Michael_Jordan",
    "https://www.wikidata.org/wiki/Q41421"
  ],
  "jobTitle": "Former Professional Basketball Player",
  "memberOf": {
    "@type": "SportsTeam",
    "name": "Chicago Bulls"
  }
}
```

**Key techniques:**
- `@id`: Canonical URI for the entity
- `sameAs`: Links to authoritative sources (Wikipedia, Wikidata, social profiles)
- Type specificity: Use most specific type (SoftwareEngineer > Person)
- Relationship mapping: Link entities via properties

### Knowledge Graph Benefits

**For SEO:**
- Knowledge panel eligibility
- Entity-based ranking (not just keywords)
- SERP feature prioritization
- Brand authority signals

**For GEO:**
- LLMs can cite your content as authoritative
- Entity resolution in AI-generated answers
- Relationship traversal (Company → Products → Reviews)
- Temporal knowledge (events, updates, history)

### Building Entity Authority

**Checklist:**
1. Consistent entity naming across web presence
2. Schema markup on all key pages
3. `sameAs` links to Wikipedia, Wikidata, social profiles
4. Nested entities showing relationships
5. Regular updates to maintain freshness
6. Cross-linking related entities

---

## Nested Schema

Complex real-world entities require nested schema objects.

### Organization with Employee

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://acme.com",
  "logo": "https://acme.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-0100",
    "contactType": "customer service"
  },
  "founder": {
    "@type": "Person",
    "name": "Jane Smith",
    "sameAs": "https://linkedin.com/in/janesmith"
  },
  "employee": [
    {
      "@type": "Person",
      "name": "John Doe",
      "jobTitle": "CTO"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  }
}
```

### Product with Reviews and Offers

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Headphones Pro",
  "image": "https://example.com/headphones.jpg",
  "description": "Premium noise-canceling wireless headphones",
  "brand": {
    "@type": "Brand",
    "name": "AudioTech"
  },
  "sku": "WT-HP-2024",
  "mpn": "925872",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/headphones/buy",
    "priceCurrency": "USD",
    "price": "299.99",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Example Electronics"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "243"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Emily Johnson"
      },
      "reviewBody": "Best headphones I've ever owned. Exceptional sound quality.",
      "datePublished": "2026-01-15"
    }
  ]
}
```

### Article with Author and Publisher

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Future of AI in Web Development",
  "image": "https://example.com/article-hero.jpg",
  "datePublished": "2026-02-01T08:00:00+00:00",
  "dateModified": "2026-02-02T10:30:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Sarah Williams",
    "url": "https://example.com/authors/sarah-williams",
    "sameAs": [
      "https://twitter.com/sarahwilliams",
      "https://linkedin.com/in/sarahwilliams"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tech Insights",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "description": "Exploring how AI is transforming modern web development practices",
  "articleBody": "Full article text here...",
  "wordCount": 1547,
  "inLanguage": "en-US",
  "articleSection": "Technology",
  "keywords": ["AI", "web development", "machine learning"]
}
```

### HowTo with Steps and Tools

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Install Schema Markup",
  "description": "Step-by-step guide to implementing JSON-LD schema on your website",
  "image": "https://example.com/schema-guide.jpg",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Text editor"
    },
    {
      "@type": "HowToTool",
      "name": "Google Rich Results Test"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Choose schema type",
      "text": "Identify the appropriate schema type for your content (Article, Product, FAQ, etc.)",
      "image": "https://example.com/step1.jpg",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Create JSON-LD script",
      "text": "Write the JSON-LD script with required and recommended properties",
      "image": "https://example.com/step2.jpg",
      "url": "https://example.com/guide#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Add to HTML head",
      "text": "Insert the script tag in the <head> section of your HTML",
      "image": "https://example.com/step3.jpg",
      "url": "https://example.com/guide#step3"
    },
    {
      "@type": "HowToStep",
      "name": "Validate markup",
      "text": "Test your schema using Google Rich Results Test and Schema.org validator",
      "image": "https://example.com/step4.jpg",
      "url": "https://example.com/guide#step4"
    }
  ]
}
```

---

## Schema Validation Tools

Always validate schema markup before deploying to production.

### Google Rich Results Test

**URL:** `https://search.google.com/test/rich-results`

**Features:**
- Tests URL or code snippet
- Shows which rich results are eligible
- Displays mobile and desktop previews
- Identifies errors and warnings
- Google-specific validation

**How to use:**
1. Enter URL or paste JSON-LD code
2. Click "Test URL" or "Test Code"
3. Review detected schema types
4. Check for errors (red) and warnings (yellow)
5. View preview of rich result appearance

### Schema.org Validator

**URL:** `https://validator.schema.org`

**Features:**
- Standard schema validation (not Google-specific)
- Checks syntax and property requirements
- Validates all three formats (JSON-LD, Microdata, RDFa)
- Shows parsed structured data

**Use for:**
- General schema correctness
- Cross-engine compatibility
- Pre-deployment validation

### Google Search Console

**Location:** Search Console > Enhancements > Rich Results

**Features:**
- Live production monitoring
- Error tracking over time
- Affected pages list
- Validation request workflow

**Workflow:**
1. Fix schema errors on site
2. Click "Validate fix" in Search Console
3. Google re-crawls pages
4. Status updates to "Passed" or shows remaining issues

### Structured Data Linter

**URL:** `https://linter.structured-data.org`

**Features:**
- Real-time validation as you type
- Prettified JSON-LD output
- Error highlighting
- Open-source tool

---

## Common Schema Mistakes

Avoid these frequent schema implementation errors.

### Schema Spam

**What it is:** Adding schema markup that doesn't match page content.

**Examples:**
- Product schema on a page with no product
- 5-star reviews that don't exist
- FAQ schema for content that's not a FAQ

**Consequence:** Google penalty, rich results removed, potential site-wide demotion.

**Fix:** Only mark up content that's visible on the page. Schema must match reality.

### Mismatched Values

**Problem:** Schema properties don't match visible content.

**Example:**
```json
{
  "@type": "Product",
  "name": "Wireless Mouse",  // Schema says "Mouse"
  // But page headline says "Bluetooth Keyboard"
}
```

**Fix:** Ensure schema values exactly match what users see.

### Missing Required Fields

**Problem:** Schema type is missing required properties.

**Example:**
```json
{
  "@type": "Article",
  "headline": "Guide to Schema"
  // Missing: image, datePublished (required)
}
```

**Fix:** Check schema.org documentation for required properties. Use validation tools.

### Invalid Date Formats

**Problem:** Dates not in ISO 8601 format.

**Wrong:**
```json
"datePublished": "02/01/2026"  // US date format
"datePublished": "1 Feb 2026"   // Human-readable
```

**Correct:**
```json
"datePublished": "2026-02-01T08:00:00+00:00"  // ISO 8601
```

### Image Issues

**Problems:**
- Image URL returns 404
- Image too small (min 1200px wide for Article)
- Wrong aspect ratio for type
- Non-HTTPS URL

**Fix:**
- Test all image URLs
- Use high-resolution images
- Check type-specific image requirements
- Always use HTTPS

### Nested Schema Errors

**Problem:** Incorrect nesting or missing object types.

**Wrong:**
```json
{
  "@type": "Article",
  "author": "Jane Doe"  // String instead of Person object
}
```

**Correct:**
```json
{
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Jane Doe"
  }
}
```

### Multiple Types Without Context

**Problem:** Multiple schema scripts without proper @context.

**Wrong:**
```html
<script type="application/ld+json">
{
  "@type": "Article",
  "headline": "Guide"
}
</script>
<script type="application/ld+json">
{
  "@type": "BreadcrumbList"  // Missing @context
}
</script>
```

**Correct:** Each script needs `"@context": "https://schema.org"` or use array.

### Duplicate Schema

**Problem:** Same schema markup appears multiple times on page.

**Cause:** Plugin conflicts, template issues, manual additions.

**Fix:** Audit page for duplicate scripts. Remove redundant markup.

---

## Schema for GEO

Structured data is critical for Generative Engine Optimization. LLMs use schema to understand and cite content.

### How LLMs Use Schema

**Entity resolution:**
- Schema helps LLMs identify what entities are on the page
- `@type` tells the AI exactly what kind of thing it's looking at
- Reduces ambiguity in content interpretation

**Knowledge extraction:**
- LLMs parse schema to extract facts
- Structured data is easier to process than unstructured text
- Properties become queryable knowledge points

**Attribution:**
- Schema helps LLMs cite sources correctly
- `author`, `publisher`, `datePublished` enable proper attribution
- `sameAs` links help verify entity authority

**Relationship mapping:**
- Nested schema shows how entities relate
- LLMs build knowledge graphs from these relationships
- Enables multi-hop reasoning

### GEO-Critical Schema Properties

| Property | Why It Matters for GEO |
|----------|------------------------|
| `@id` | Canonical entity identifier for deduplication |
| `sameAs` | Authority signals via Wikipedia, Wikidata links |
| `author` | Attribution for content provenance |
| `datePublished` | Temporal relevance and freshness signals |
| `dateModified` | Content update tracking |
| `inLanguage` | Language-specific content routing |
| `about` | Topic classification for relevant queries |
| `mentions` | Entity relationship mapping |
| `citation` | Academic/source authority |
| `isBasedOn` | Source chain for fact-checking |

### Schema Best Practices for GEO

**1. Be comprehensive:**
- Include all recommended properties, not just required ones
- More structured data = more LLM understanding

**2. Link to authority:**
- Use `sameAs` to connect to Wikipedia, Wikidata, official sources
- Helps LLMs verify you're talking about the same entity

**3. Show relationships:**
- Nest related entities (Organization → Person → Works)
- LLMs can traverse these connections

**4. Maintain freshness:**
- Update `dateModified` when content changes
- LLMs prioritize recent, maintained content

**5. Use specific types:**
- Don't use generic `Thing` or `WebPage`
- Specific types enable specific AI features

**6. Add context properties:**
- `about`, `mentions`, `keywords` help topical classification
- LLMs use these for query matching

### Schema Types for AI Citation

**High-value types for GEO:**
- **Article:** News, guides, analysis (primary citation target)
- **ScholarlyArticle:** Research, academic papers (high authority)
- **TechArticle:** Technical documentation (how-to citations)
- **MedicalWebPage:** Health content (expertise signals)
- **FAQPage:** Direct Q&A extraction
- **HowTo:** Step-by-step procedure extraction
- **Dataset:** Data citations for statistics
- **Course:** Educational content authority

---

## Implementation Patterns

Different approaches for adding schema to your site.

### Manual Implementation

**Inline in HTML head:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Article Title</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "datePublished": "2026-02-01"
  }
  </script>
</head>
<body>
  <!-- Content -->
</body>
</html>
```

**When to use:**
- Static sites with few pages
- Full control over markup
- Custom schema requirements

### CMS Plugins

**WordPress:**
- Yoast SEO (built-in schema)
- Rank Math (comprehensive schema)
- Schema Pro (advanced)

**Shopify:**
- Built-in product schema
- Apps for enhanced markup

**Webflow:**
- Custom code in page settings
- CMS field mapping

**When to use:**
- Non-technical users
- Standard schema types
- Quick implementation

### Programmatic Generation

**Server-side generation (Node.js example):**
```javascript
function generateArticleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.imageUrl,
    "datePublished": article.publishDate.toISOString(),
    "dateModified": article.modifiedDate.toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "url": article.author.profileUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Site Name",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  };
}

// In template
const schemaJson = JSON.stringify(generateArticleSchema(article));
const schemaTag = `<script type="application/ld+json">${schemaJson}</script>`;
```

**When to use:**
- Dynamic content sites
- Large-scale implementation
- Database-driven content
- Need for consistency across pages

### API-Driven Schema

**Fetch schema from API:**
```javascript
// Client-side
async function injectSchema() {
  const response = await fetch('/api/schema?page=current');
  const schema = await response.json();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

injectSchema();
```

**When to use:**
- Headless CMS
- JAMstack sites
- Decoupled architecture

### Template-Based Generation

**React component example:**
```jsx
function SchemaMarkup({ type, data }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage
<SchemaMarkup
  type="Article"
  data={{
    headline: article.title,
    datePublished: article.date
  }}
/>
```

**When to use:**
- React/Vue/Svelte apps
- Component-based architecture
- Reusable schema patterns

---

## Complete Examples

### LocalBusiness (Restaurant)

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "The Garden Bistro",
  "image": [
    "https://example.com/bistro-exterior.jpg",
    "https://example.com/bistro-interior.jpg",
    "https://example.com/bistro-food.jpg"
  ],
  "url": "https://example.com",
  "telephone": "+1-555-0123",
  "priceRange": "$$",
  "servesCuisine": ["French", "Mediterranean"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94103",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "11:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday", "Saturday"],
      "opens": "11:00",
      "closes": "23:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "10:00",
      "closes": "21:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "127"
  },
  "menu": "https://example.com/menu",
  "acceptsReservations": "True",
  "sameAs": [
    "https://www.facebook.com/gardenbistro",
    "https://www.instagram.com/gardenbistro",
    "https://www.yelp.com/biz/garden-bistro-sf"
  ]
}
```

### FAQ Page

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Schema.org markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema.org markup is structured data vocabulary that helps search engines and AI systems understand the content on your web pages. It uses standardized formats like JSON-LD to describe entities, relationships, and properties."
      }
    },
    {
      "@type": "Question",
      "name": "How do I implement JSON-LD on my website?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To implement JSON-LD, add a script tag with type='application/ld+json' in your HTML head section. Inside the script, write valid JSON following Schema.org vocabulary. Test your markup using Google Rich Results Test before deploying."
      }
    },
    {
      "@type": "Question",
      "name": "Does schema markup improve SEO rankings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema markup doesn't directly improve rankings, but it enhances SERP appearance through rich snippets, which can improve click-through rates. It also helps search engines better understand your content, which can indirectly benefit rankings. For GEO, schema is critical for AI citation and entity recognition."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between SEO and GEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO (Search Engine Optimization) focuses on ranking in traditional search results. GEO (Generative Engine Optimization) optimizes for AI-generated answers and citations. GEO requires structured data, clear attribution, and authoritative content that LLMs can confidently cite."
      }
    }
  ]
}
```

### Product with Multiple Offers

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Professional Camera Kit",
  "description": "Complete photography kit including mirrorless camera, two lenses, tripod, and accessories",
  "image": [
    "https://example.com/camera-kit-main.jpg",
    "https://example.com/camera-kit-contents.jpg",
    "https://example.com/camera-kit-action.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "PhotoPro"
  },
  "sku": "PP-CAM-KIT-2024",
  "mpn": "CAM2024KIT",
  "gtin13": "1234567890123",
  "offers": [
    {
      "@type": "Offer",
      "name": "New - Full Kit",
      "url": "https://example.com/camera-kit/buy-new",
      "priceCurrency": "USD",
      "price": "1499.99",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "PhotoPro Direct"
      }
    },
    {
      "@type": "Offer",
      "name": "Refurbished",
      "url": "https://example.com/camera-kit/buy-refurb",
      "priceCurrency": "USD",
      "price": "999.99",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/LimitedAvailability",
      "itemCondition": "https://schema.org/RefurbishedCondition",
      "seller": {
        "@type": "Organization",
        "name": "PhotoPro Outlet"
      }
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "342",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Alex Chen"
      },
      "datePublished": "2026-01-20",
      "reviewBody": "Exceptional kit for beginners and pros alike. The lens quality is outstanding and everything feels premium."
    }
  ]
}
```

---

## Schema Implementation Checklist

Use this checklist when implementing schema markup.

### Pre-Implementation

- [ ] Identify primary schema type for page (Article, Product, FAQ, etc.)
- [ ] Review required properties for chosen type
- [ ] Gather all data needed for required + recommended properties
- [ ] Check if nested entities are needed (author, publisher, offers)
- [ ] Verify all image URLs are accessible and meet size requirements
- [ ] Confirm dates are in ISO 8601 format
- [ ] Prepare `sameAs` URLs for entity disambiguation

### Implementation

- [ ] Write JSON-LD script with proper `@context`
- [ ] Include all required properties
- [ ] Add recommended properties where applicable
- [ ] Use specific types (not generic `Thing` or `WebPage`)
- [ ] Nest related entities properly with `@type`
- [ ] Add `@id` for primary entity if creating knowledge graph
- [ ] Include `sameAs` links to Wikipedia, Wikidata, social profiles
- [ ] Insert script in HTML `<head>` section

### Validation

- [ ] Test in Google Rich Results Test
- [ ] Test in Schema.org validator
- [ ] Verify no errors (red flags)
- [ ] Review warnings (yellow flags) - fix if critical
- [ ] Check rich result preview appearance
- [ ] Test on mobile and desktop
- [ ] Validate all URLs return 200 status
- [ ] Confirm image URLs are accessible

### Post-Deployment

- [ ] Submit URL to Google Search Console for indexing
- [ ] Monitor Search Console > Enhancements > Rich Results
- [ ] Check for errors in production after crawl
- [ ] Verify rich results appear in SERP (may take weeks)
- [ ] Update `dateModified` when content changes
- [ ] Re-validate after major content updates

### GEO-Specific Checks

- [ ] Entity has clear `@type` for AI classification
- [ ] `author` and `datePublished` present for attribution
- [ ] `sameAs` links to authoritative sources included
- [ ] Content matches schema (no spam or mismatch)
- [ ] Nested relationships show entity connections
- [ ] Schema updated when content changes
- [ ] Use comprehensive properties (not just required minimum)

---

## Related Resources

- [GEO Fundamentals](fundamentals.md)
- [Content Structure for AI](content-structure.md)
- [AI Bot Configuration](ai-bots.md)

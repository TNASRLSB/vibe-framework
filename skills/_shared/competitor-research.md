# Competitor Research Protocol

Shared protocol for global competitor analysis. Referenced by Ghostwriter, Seurat, and Baptist. Runs once per project, results consumed by all skills.

---

## When to Run

Any skill needing competitor context checks for existing research first:
1. Check if `.vibe/competitor-research/` exists in the project root
2. If exists, check `metadata.json` for `date` — max 30 days old
3. If fresh → read and use the relevant lens. If stale or missing → run this protocol.
4. Any skill can force a refresh by noting `force_refresh: true` in its invocation context.

---

## Input

From the invoking skill or user, receive:
- **Service/product type** — generic, not market-specific. "Tax consulting", not "Italian tax consulting for SMBs"
- **Target market** — stored for final localization, does NOT filter the research

---

## Phase 1: Discovery

### Language Tiers

**Default (5 languages):** English, Chinese (simplified), Spanish, Portuguese, French
These cover ~75% of global web commerce. Used unless the invoking skill or user specifies otherwise.

**Global (all 11 languages):** English, Chinese (simplified + traditional), Spanish, Portuguese, French, Japanese, Korean, Russian, Arabic, Hebrew, Aramaic
Used when the invoking skill passes `global_research: true` or the user requests `--global`.

**Custom:** The invoking skill may specify `languages: ["en", "ja", "ko"]` to target specific markets.

Always include the target market's language if not already in the tier.

### Agent Dispatch

Dispatch one Agent per language (all in parallel, `subagent_type: "general-purpose"`, `model: "haiku"`).

Each agent:
1. **WebSearch** for the service/product type in that language, 2-3 query variations
2. **Identify** 3-5 candidates per language — established companies, not directories or aggregators
3. **Return:** company name, URL, brief description, language, estimated market presence (large/medium/small based on search visibility)

Not all languages will yield results. That is expected.

---

## Phase 2: Qualification

From all candidates across all languages, select the **top 15-20** for deep analysis based on:

| Criterion | Why |
|-----------|-----|
| **Market presence** | Larger companies have more validated patterns (more users, more A/B testing, more research budget) |
| **Relevance** | How closely they match the user's service/product type |
| **Diversity** | Ensure geographic and linguistic spread — avoid 15 US companies |
| **Quality signals** | Professional site, clear structure, active content — signs of investment in communication |

---

## Phase 3: Deep Analysis

For each qualified competitor, navigate the site and select the **most representative pages** for extracting the three lenses. Do not follow a fixed list — choose based on the type of business:

| Business type | Typical high-value pages |
|---------------|------------------------|
| SaaS | Homepage, pricing, main feature/product page, about |
| Professional services | Homepage, services overview, "chi siamo"/about, case studies |
| E-commerce | Homepage, main category, product detail page, checkout flow |
| Content/media | Homepage, article/content page, subscription/membership page |
| Marketplace | Homepage, listing page, seller/provider profile, search/discovery |

**The agent decides which pages to visit** based on what it finds on the homepage. The goal is 3-5 pages per competitor — enough to extract all three lenses without wasting fetches on low-value pages (legal, careers, blog archives, etc.).

**Use WebFetch.** If blocked (403, empty response, anti-bot), fall back to **Playwright via Bash** to render in a headless browser, bypassing anti-scraping controls.

Extract ALL three lenses in a single pass per competitor:

### Copy Lens (consumed by Ghostwriter)
- Value propositions — how they frame what they offer
- Tone and voice — formal/casual, technical/accessible, authoritative/friendly
- Messaging hierarchy — what comes first, second, third on the page
- CTA text and approach — what they ask visitors to do, how they phrase it
- Pain points named — what problems they explicitly address
- Headlines and hooks — opening strategies across key pages
- Trust language — how they build credibility through words

### Design Lens (consumed by Seurat)
- Visual style — flat, material, glassmorphism, custom, etc.
- Color palette — primary, secondary, accent colors (extract hex values if possible)
- Typography — serif/sans-serif, heading vs body, weight usage
- Layout patterns — grid structure, spacing rhythm, visual hierarchy
- Component patterns — cards, forms, navigation, hero sections
- Imagery approach — photography, illustration, abstract, icons
- Responsive behavior — if observable from the page structure

### Conversion Lens (consumed by Baptist)
- Conversion flow — how many steps from landing to primary action
- CTA placement and frequency — where and how often CTAs appear
- Trust signals — testimonials, badges, guarantees, certifications
- Friction reducers — free trial, no credit card, money-back, etc.
- Form design — field count, progressive disclosure, social auth
- Social proof — placement, type (numbers, logos, testimonials, reviews)
- Objection handling — FAQ, comparison tables, guarantee placement

---

## Phase 4: Pattern Extraction

Across all analyzed competitors, identify per lens:

**Common patterns** (elements present in 60%+ of competitors = market must-haves):
- What the market universally does — the user's copy/design/conversion MUST include these or risk feeling incomplete to the audience

**Unique differentiators** (distinctive approaches from standout competitors):
- How each top competitor distinguishes itself — strategies the user can learn from for their own positioning

**Anti-patterns** (elements that appear weak, outdated, or absent from top players):
- What to avoid — patterns only found in weaker competitors or absent from all strong ones

---

## Phase 5: Storage

Save results to `.vibe/competitor-research/` in the project root:

```
.vibe/competitor-research/
  metadata.json           ← date, service type, languages searched, competitor count
  competitors.json        ← per-competitor structured data (all three lenses)
  patterns/
    common.json           ← must-have patterns per lens
    differentiators.json  ← unique strategies per lens
    anti-patterns.json    ← what to avoid per lens
```

**metadata.json format:**
```json
{
  "date": "2026-03-27",
  "service_type": "tax consulting",
  "target_market": "Italy, SMBs",
  "languages_searched": ["en", "zh", "es", "pt", "fr", "ja", "ko", "ru", "ar", "he", "arc"],
  "languages_with_results": ["en", "zh", "ja", "es", "fr", "pt"],
  "competitors_analyzed": 17,
  "top_competitors": ["Company A (en)", "Company B (ja)", "Company C (es)"]
}
```

---

## Phase 6: Summary

Present to the user before any skill proceeds:
- Number of competitors analyzed, across how many languages/markets
- Top 3-5 common patterns per lens (one line each)
- Top 2-3 most interesting differentiators (what makes them stand out)
- Recommended baseline direction for the user's project
- Ask user for confirmation before proceeding to the skill's specific workflow

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

**Phase 1 uses `model: "haiku"`** — discovery is high-volume, low-depth. Haiku is the right tool here.

Dispatch one Agent per language (all in parallel, `subagent_type: "general-purpose"`, `model: "haiku"`).

Each agent:
1. **WebSearch** for the service/product type in that language, 2-3 query variations
2. **Identify** 3-5 candidates per language — established companies, not directories or aggregators
3. **Return:** company name, URL, brief description, language, estimated market presence (large/medium/small based on search visibility)

Not all languages will yield results. That is expected.

> **Model escalation:** Phase 1 (discovery) uses Haiku. Phase 3 (deep analysis) MUST use `model: "sonnet"` — deep analysis requires page rendering, screenshot interpretation, and structured extraction across three lenses. Haiku cannot reliably perform visual analysis or produce the depth required.

---

## Phase 2: Qualification

From all candidates across all languages, select the **top 15-20** for deep analysis. Present the selection to the user as a **ranked table** so they can verify and override:

| # | Competitor | Market | Presence | Relevance | Why selected |
|---|-----------|--------|----------|-----------|--------------|
| 1 | Example Corp | US/EN | Large | High | Market leader, best-in-class UX |
| ... | ... | ... | ... | ... | ... |

**Also show the excluded candidates** in a second table with the reason for exclusion:

| Competitor | Market | Excluded because |
|-----------|--------|-----------------|
| Example B | ES | Directory/aggregator, not a direct competitor |
| ... | ... | ... |

**Selection criteria** (apply in order):

| Criterion | Why |
|-----------|-----|
| **Market presence** | Larger companies have more validated patterns (more users, more A/B testing, more research budget) |
| **Relevance** | How closely they match the user's service/product type |
| **Diversity** | Ensure geographic and linguistic spread — avoid 15 US companies |
| **Quality signals** | Professional site, clear structure, active content — signs of investment in communication |

The goal is 15-20 analyzed in depth, not 50 analyzed superficially. If the user wants to expand the set, warn them: "Analyzing more than 20 competitors trades depth for breadth. I'll need to render and screenshot each site. Want to proceed with all N, or should I adjust the selection?"

---

## Phase 3: Deep Analysis

**Agent dispatch:** If parallelizing across competitors, dispatch agents with `model: "sonnet"` (NOT haiku). Deep analysis requires rendering pages, interpreting screenshots, and extracting structured data across three lenses — this demands a capable model.

For each qualified competitor, navigate the site and select the **most representative pages** for extracting the three lenses. Do not follow a fixed list — choose based on the type of business:

| Business type | Typical high-value pages |
|---------------|------------------------|
| SaaS | Homepage, pricing, main feature/product page, about |
| Professional services | Homepage, services overview, "chi siamo"/about, case studies |
| E-commerce | Homepage, main category, product detail page, checkout flow |
| Content/media | Homepage, article/content page, subscription/membership page |
| Marketplace | Homepage, listing page, seller/provider profile, search/discovery |

**The agent decides which pages to visit** based on what it finds on the homepage. The goal is 3-5 pages per competitor — enough to extract all three lenses without wasting fetches on low-value pages (legal, careers, blog archives, etc.).

### Page Fetching — Mandatory Protocol

For each page, follow this sequence. Do NOT skip steps.

**Step A — WebFetch first.** Attempt to fetch the page with WebFetch Inspect the response:
- If the HTML contains the actual page content (visible text, navigation, main sections) → proceed to Step C.
- If the response is blocked (403, 5xx), empty, JS-only shell (`<div id="root"></div>`), or missing the main content → proceed to Step B.

**Step B — Playwright rendering (mandatory fallback).** Use Bash to launch a headless Chromium via Playwright:

```bash
npx -y playwright@latest install chromium 2>/dev/null; node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('URL_HERE', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: '/tmp/competitor-screenshot.png', fullPage: true });
  const html = await page.content();
  console.log(html.substring(0, 50000));
  await browser.close();
})();
"
```

If Playwright also fails (site completely blocks headless browsers), mark the competitor as `blocked` in the results and note it — do NOT silently skip it or pretend data was extracted.

**Step C — Screenshot for Design Lens (mandatory for every accessible page).** The Design Lens REQUIRES visual inspection. Raw HTML/CSS is NOT sufficient for extracting visual style, layout patterns, spacing, or component design.

For every page that was successfully fetched (whether via WebFetch or Playwright), take a full-page screenshot:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('URL_HERE', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: '/tmp/vibe-cr/COMPETITOR_NAME-PAGE.png', fullPage: true });
  await browser.close();
})();
"
```

Store screenshots in `/tmp/vibe-cr/` (create the directory first). Read each screenshot with the Read tool to perform visual analysis.

**If you already used Playwright in Step B, reuse that session for the screenshot — do not launch a second browser.**

**HARD RULE:** Do NOT extract Design Lens data from raw HTML alone. If you cannot render and screenshot a page, the Design Lens for that competitor is marked `incomplete — no visual data` in the results. Do not fabricate visual analysis from source code.

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

## Phase 3.5: Data Quality Gate (mandatory)

**STOP. Before extracting patterns, verify data completeness.** Build this table and present it to the user:

| # | Competitor | Pages targeted | Pages fetched | Pages rendered | Screenshots | Copy Lens | Design Lens | Conversion Lens |
|---|-----------|---------------|--------------|----------------|-------------|-----------|-------------|-----------------|
| 1 | Example Corp | 4 | 4 | 4 | 4 | complete | complete | complete |
| 2 | Blocked Inc | 3 | 0 | 0 | 0 | missing | missing | missing |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **Totals** | | **N** | **N** | **N** | **N** | | | |

**Minimum thresholds to proceed:**
- **Pages fetched:** ≥ 70% of total targeted pages across all competitors
- **Screenshots taken:** ≥ 70% of fetched pages (needed for Design Lens)
- **No silent skips:** Every blocked/failed competitor must be explicitly listed with reason

**If thresholds are NOT met:**
1. Report what failed and why (blocked, timeout, JS-only)
2. Retry failed competitors with Playwright (if not already attempted)
3. If still below threshold after retry, ask the user: "I could only fully analyze N of M competitors. The gaps are: [list]. Should I proceed with partial data or try alternative approaches for the blocked sites?"

**Do NOT proceed to Pattern Extraction with incomplete data without user acknowledgment.**

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

Present to the user before any skill proceeds. The summary must be **evidence-rich**, not a bullet list of vague observations.

### Data Quality Recap
- Competitors qualified: N | Fully analyzed: N | Blocked/incomplete: N
- Total pages fetched: N | Screenshots taken: N
- Languages covered: [list]

### Common Patterns per Lens (market must-haves)

For each pattern, include:
- **What:** the specific pattern (not "clean design" — be precise: "sans-serif headings 28-36px, 1.2 line height, weight 600-700")
- **Prevalence:** N out of M competitors (percentage)
- **Examples:** name 2-3 specific competitors that exemplify this pattern
- **Evidence:** concrete data — hex codes, word counts, number of CTAs, form field counts, load times

Minimum 5 patterns per lens, maximum 10.

### Unique Differentiators (competitive strategies worth studying)

For each differentiator:
- **Who:** which competitor does this
- **What:** the specific strategy
- **Why it works:** observable effect (e.g., "only competitor with <3s load time in the set", "highest social proof density — 4 testimonials above fold")

### Anti-Patterns (what to avoid)

Patterns found only in weak/defunct competitors or absent from all strong ones.

### Recommended Baseline

A concrete starting point for the user's project — not "use clean design" but specific, actionable parameters informed by the data above.

### Confirmation

Ask user for confirmation before proceeding to the skill's specific workflow. Include: "All raw data is saved in `.vibe/competitor-research/`. You can review individual competitor analyses there."

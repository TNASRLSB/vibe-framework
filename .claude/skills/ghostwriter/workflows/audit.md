# Content Audit Workflow

A systematic process for auditing existing content for dual-platform optimization.

---

## Audit Types

### 1. Quick Audit (15-30 min per page)
For rapid assessment of key issues.

### 2. Full Audit (1-2 hours per page)
Comprehensive analysis with scoring.

### 3. Site-Wide Audit (1-5 days)
Systematic review of all content.

---

## Quick Audit Workflow

```
┌──────────────────────────────────────────────────────────┐
│                    QUICK AUDIT FLOW                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   URL Input                                               │
│       │                                                   │
│       ▼                                                   │
│   ┌─────────────┐                                         │
│   │ SEO Scan    │ → Title, Meta, Headers, Links           │
│   └─────────────┘                                         │
│       │                                                   │
│       ▼                                                   │
│   ┌─────────────┐                                         │
│   │ GEO Scan    │ → Structure, Entities, Chunks           │
│   └─────────────┘                                         │
│       │                                                   │
│       ▼                                                   │
│   ┌─────────────┐                                         │
│   │ Copy Scan   │ → Hook, CTA, Benefits                   │
│   └─────────────┘                                         │
│       │                                                   │
│       ▼                                                   │
│   Quick Report                                            │
│   (Top 5 Issues)                                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Quick Audit Steps

1. **Open page in browser + view source**
2. **Check SEO basics (2 min)**
   - Title tag present and optimized?
   - Meta description present?
   - H1 present and singular?
   - Basic header structure?

3. **Check GEO basics (3 min)**
   - Does intro answer the topic directly?
   - Are sections self-contained?
   - Any "as mentioned above" type phrases?

4. **Check Copy basics (2 min)**
   - Does headline grab attention?
   - Is there a clear CTA?
   - Are benefits communicated?

5. **Document top 5 issues**

---

## Full Audit Workflow

```
┌────────────────────────────────────────────────────────────────┐
│                      FULL AUDIT FLOW                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Phase 1: GATHER                                             ││
│ │ • URL and basic info                                        ││
│ │ • Current rankings (if known)                               ││
│ │ • Traffic data (if available)                               ││
│ │ • Business context                                          ││
│ └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Phase 2: ANALYZE                                            ││
│ │ • Traditional SEO factors (40 pts)                          ││
│ │ • GEO optimization factors (30 pts)                         ││
│ │ • Schema & Technical (15 pts)                               ││
│ │ • E-E-A-T signals (15 pts)                                  ││
│ └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Phase 3: SCORE                                              ││
│ │ • Calculate section scores                                  ││
│ │ • Calculate total score                                     ││
│ │ • Assign grade (A/B/C/D/F)                                  ││
│ └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Phase 4: RECOMMEND                                          ││
│ │ • Priority fixes (Critical/High/Medium)                     ││
│ │ • Quick wins                                                ││
│ │ • Major updates needed                                      ││
│ │ • Re-audit schedule                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│                      Full Audit Report                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Full Audit Process

#### Phase 1: Gather (15 min)

**Collect:**
- Page URL
- Primary keyword (target or inferred)
- Publication date
- Last updated date
- Current rankings (if known)
- Traffic data (from Analytics)
- Business importance (critical/important/nice-to-have)

#### Phase 2: Analyze (45-60 min)

**Use the [Audit Checklist](../checklists/audit.md)**

Score each section systematically:

**Traditional SEO (40 points)**
- Title tag (8 pts)
- Meta description (6 pts)
- URL (4 pts)
- Headers (6 pts)
- Content (10 pts)
- Links (6 pts)

**GEO Optimization (30 points)**
- Answer-first structure (8 pts)
- Self-contained chunks (8 pts)
- Entity clarity (6 pts)
- Citation potential (8 pts)

**Schema & Technical (15 points)**
- Schema markup (8 pts)
- Technical (7 pts)

**E-E-A-T (15 points)**
- Experience (4 pts)
- Expertise (4 pts)
- Authoritativeness (4 pts)
- Trust (3 pts)

#### Phase 3: Score (5 min)

**Calculate:**
- Section scores
- Total score (out of 100)
- Grade assignment:
  - 90-100: A (Minor tweaks)
  - 80-89: B (Optimize weak areas)
  - 70-79: C (Significant updates needed)
  - 60-69: D (Major rewrite recommended)
  - <60: F (Retire or complete rewrite)

#### Phase 4: Recommend (15 min)

**Document:**
1. **Critical fixes** (blocking issues)
   - Must fix before any value possible
   - E.g., noindex tag, major technical issue

2. **High priority** (significant impact)
   - Missing key elements
   - E.g., no answer-first intro, no schema

3. **Medium priority** (optimization)
   - Enhancement opportunities
   - E.g., improve title tag, add FAQ section

4. **Quick wins** (< 30 min each)
   - Easy fixes with immediate impact

5. **Major updates** (3+ hours)
   - Substantial rewrites or additions

---

## Site-Wide Audit Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SITE-WIDE AUDIT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Day 1: INVENTORY                                               │
│   • Crawl site (Screaming Frog)                                  │
│   • Export all URLs                                              │
│   • Categorize by type (blog, product, landing)                  │
│   • Pull traffic data                                            │
│   • Identify high-priority pages                                 │
│                                                                  │
│   Day 2-3: AUDIT HIGH PRIORITY                                   │
│   • Full audit top 20% of pages                                  │
│   • (These drive 80% of value)                                   │
│   • Document common issues                                       │
│                                                                  │
│   Day 3-4: QUICK AUDIT REMAINDER                                 │
│   • Quick audit remaining pages                                  │
│   • Flag for full audit or retirement                            │
│                                                                  │
│   Day 4-5: SYNTHESIZE                                            │
│   • Identify site-wide patterns                                  │
│   • Create master prioritization                                 │
│   • Build implementation roadmap                                 │
│   • Estimate resources needed                                    │
│                                                                  │
│   DELIVERABLE: Site Audit Report                                 │
│   • Executive summary                                            │
│   • Page-by-page scores                                          │
│   • Common issues (site-wide)                                    │
│   • Prioritized action plan                                      │
│   • Resource estimates                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Site-Wide Audit Steps

#### Step 1: Site Inventory

**Tools needed:**
- Screaming Frog (or similar crawler)
- Google Analytics / Search Console
- Spreadsheet software

**Export:**
- All URLs
- Status codes
- Title tags
- Meta descriptions
- H1s
- Word count (if available)
- Canonical tags
- Index status

#### Step 2: Prioritize Pages

**Priority matrix:**

| Priority | Criteria |
|----------|----------|
| Critical | Top 10 traffic pages |
| High | Pages ranking positions 5-20 (opportunity) |
| Medium | Older content still getting traffic |
| Low | Low traffic, low potential |
| Retire | No traffic, off-topic, outdated |

#### Step 3: Batch Auditing

**Process:**
1. Full audit all Critical + High priority (20-30 pages)
2. Quick audit Medium priority
3. Retirement review for Low/Retire candidates

#### Step 4: Pattern Analysis

**Look for:**
- Common SEO issues (missing meta, poor titles)
- Common GEO issues (not answer-first)
- Technical patterns (speed, mobile)
- Content gaps (topics not covered)

#### Step 5: Create Action Plan

**Format:**
```
PHASE 1: Quick Wins (Week 1-2)
- Fix title tags on 15 pages
- Add meta descriptions to 23 pages
- Fix broken links (47 total)
Estimated effort: 8 hours

PHASE 2: High-Impact Optimizations (Week 3-4)
- Add FAQ sections to top 10 posts
- Implement schema markup site-wide
- Add answer-first intros to 20 posts
Estimated effort: 20 hours

PHASE 3: Content Improvements (Month 2)
- Major rewrite of 5 underperforming pages
- Expand thin content (8 pages)
- Create missing topic cluster pages (4)
Estimated effort: 40 hours

PHASE 4: Retirement & Consolidation (Month 2-3)
- Retire 12 outdated pages (redirect to relevant content)
- Consolidate 8 overlapping pages
Estimated effort: 8 hours
```

---

## Audit Frequency Recommendations

| Content Type | Audit Frequency |
|--------------|-----------------|
| Homepage | Monthly quick audit |
| Top 10 traffic pages | Monthly quick audit |
| Product/Service pages | Quarterly full audit |
| Blog posts (top 20) | Quarterly full audit |
| All blog posts | Annual site-wide audit |
| Landing pages | Before/after campaigns |

---

## Audit Documentation

### Per-Page Report Template

```markdown
# Content Audit: [Page Title]

**URL:** [URL]
**Audit Date:** [Date]
**Auditor:** [Name]

## Overview
- **Current Traffic:** [Monthly visits]
- **Primary Keyword:** [Keyword]
- **Current Ranking:** [Position]
- **Overall Score:** [X/100] (Grade: [A-F])

## Section Scores
| Section | Score | Max |
|---------|-------|-----|
| Traditional SEO | | 40 |
| GEO Optimization | | 30 |
| Schema & Technical | | 15 |
| E-E-A-T | | 15 |

## Critical Issues
1. [Issue and fix]

## High Priority
1. [Issue and fix]
2. [Issue and fix]

## Medium Priority
1. [Issue and fix]
2. [Issue and fix]

## Quick Wins
- [Fix 1]
- [Fix 2]

## Recommended Actions
[ ] [Action 1]
[ ] [Action 2]
[ ] [Action 3]

## Re-Audit Date
[Scheduled date]
```

### Site-Wide Report Template

```markdown
# Site-Wide Content Audit Report

**Site:** [Domain]
**Audit Period:** [Dates]
**Total Pages Analyzed:** [Number]

## Executive Summary
[2-3 paragraph overview of findings and recommendations]

## Key Findings

### Strengths
- [Strength 1]
- [Strength 2]

### Critical Issues
- [Issue 1] - Affects [X] pages
- [Issue 2] - Affects [X] pages

### Common Patterns
- [Pattern 1]
- [Pattern 2]

## Score Distribution
| Grade | Count | % |
|-------|-------|---|
| A (90+) | | |
| B (80-89) | | |
| C (70-79) | | |
| D (60-69) | | |
| F (<60) | | |

## Prioritized Action Plan
[Phased implementation plan]

## Resource Estimates
[Hours/budget needed per phase]

## Appendix
- Page-by-page audit summaries
- Technical crawl data
- Keyword gap analysis
```

---

## Tools for Auditing

### Essential
- Browser (view source capability)
- Spreadsheet software
- [Audit checklist](../checklists/audit.md)

### Helpful
- Screaming Frog (crawling)
- Google Search Console (indexing, rankings)
- Bing Webmaster Tools (Bing-specific)
- Schema.org validator
- PageSpeed Insights

### Advanced
- Semrush/Ahrefs (keyword data)
- Google Analytics (traffic data)
- Hotjar (user behavior)

# Pillar-Cluster Content Architecture Prompt

## Pre-Generation Questions

### Required
1. **Core topic**: What is the main subject area? (this becomes the pillar)
2. **Business goal**: What should this content achieve? (traffic, leads, authority)
3. **Target audience**: Who are you trying to reach?

### Optional
4. **Existing content**: Any pages that should be incorporated?
5. **Competitor gaps**: Topics competitors aren't covering well?
6. **Content capacity**: How many cluster articles can you realistically produce?
7. **Priority keywords**: Any must-target terms?

---

## Architecture Generation Process

### Step 1: Topic Research Output

```markdown
## Topic Universe for: [CORE TOPIC]

### Pillar Page Concept
**Title:** The Complete Guide to [Core Topic]
**Target keyword:** [broad keyword, high volume]
**Search intent:** Informational (comprehensive)
**Estimated length:** 3,000-5,000 words

### Cluster Topics (organized by intent)

#### Informational Clusters (How/What/Why)
1. **[Cluster 1]** - "how to [specific aspect]"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Awareness

2. **[Cluster 2]** - "what is [concept]"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Awareness

3. **[Cluster 3]** - "why [topic] matters"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Awareness

#### Commercial Clusters (Best/Top/Compare)
4. **[Cluster 4]** - "best [tools/methods] for [topic]"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Consideration

5. **[Cluster 5]** - "[option A] vs [option B]"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Consideration

#### Transactional Clusters (Action-oriented)
6. **[Cluster 6]** - "[topic] [solution/service/product]"
   - Search volume: [est.]
   - Difficulty: [low/med/high]
   - Funnel stage: Decision

### Topic Relationships Map

```
                    [PILLAR PAGE]
                    Complete Guide to [Topic]
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   [CLUSTER 1]       [CLUSTER 2]       [CLUSTER 3]
   How to...         What is...        Why...
        │                 │                 │
        └────────────────►│◄────────────────┘
                   (internal links)
```
```

### Step 2: Pillar Page Structure

```markdown
## Pillar Page: [TITLE]

### Page Structure

1. **Introduction** (200-300 words)
   - Define [topic] immediately (GEO: extractable definition)
   - State who this guide is for
   - Preview what's covered
   - [Link to Cluster about "what is X" if exists]

2. **Section: [Fundamental Concept 1]** (400-600 words)
   - Cover basics
   - [Link to related cluster article]
   - Include definition box or callout

3. **Section: [Fundamental Concept 2]** (400-600 words)
   - Build on previous section
   - [Link to related cluster article]

4. **Section: [How-To / Process]** (600-800 words)
   - Step-by-step breakdown
   - [Link to detailed how-to cluster]
   - Consider HowTo schema

5. **Section: [Tools/Resources/Methods]** (400-600 words)
   - Overview of options
   - [Link to "best X" cluster article]
   - Comparison table

6. **Section: [Common Mistakes / FAQs]** (300-400 words)
   - Address frequent questions
   - FAQ schema opportunity
   - [Link to specific problem-solving clusters]

7. **Conclusion** (150-200 words)
   - Summarize key points
   - Clear next step / CTA
   - [Link to transactional cluster or conversion page]

### Internal Linking Strategy

| From Section | Link To | Anchor Text |
|--------------|---------|-------------|
| Introduction | Cluster 1 | "[topic keyword]" |
| Section 2 | Cluster 2 | "learn more about [concept]" |
| ... | ... | ... |

### Schema Opportunities
- [ ] Article schema for pillar page
- [ ] FAQ schema if FAQ section included
- [ ] HowTo schema if process section included
- [ ] Breadcrumb schema for navigation
```

### Step 3: Cluster Article Briefs

For each cluster article, generate:

```markdown
## Cluster Brief: [TITLE]

**Target keyword:** [specific long-tail]
**Parent pillar:** [Link back to pillar]
**Word count:** 1,000-1,500
**Search intent:** [Informational/Commercial/Transactional]

### Outline

1. **H1:** [Title with keyword]

2. **TL;DR** (for GEO)
   [2-3 sentence answer to the search query]

3. **H2:** [Main answer/concept]
   - [Key point]
   - [Key point]

4. **H2:** [Supporting section]
   - [Key point]
   - [Link back to pillar for broader context]

5. **H2:** [Practical application/examples]
   - [Specific example]
   - [Specific example]

6. **H2:** Related Questions (FAQ)
   - Q: [Related question]?
   - Q: [Related question]?

7. **CTA/Next Steps**
   - [Link to pillar]
   - [Link to related cluster]
   - [Conversion action if appropriate]

### Internal Links Required
- TO pillar: [anchor text suggestion]
- TO sibling cluster: [which one, anchor text]
- FROM pillar: [request link from pillar section X]

### Schema
- [ ] Article schema
- [ ] FAQ schema (if FAQ section)
```

---

## Output Checklist

### Architecture Quality (5 checks)
- [ ] Pillar topic is broad enough to support 5-10 clusters
- [ ] Clusters cover different search intents (info/commercial/transactional)
- [ ] No keyword cannibalization between clusters
- [ ] Clear linking hierarchy (pillar ↔ clusters)
- [ ] Topics align with business goals

### SEO (4 checks)
- [ ] Each page targets distinct keyword
- [ ] Search intent matched to content type
- [ ] Internal linking plan complete
- [ ] URL structure follows hierarchy (/topic/, /topic/subtopic/)

### GEO (4 checks)
- [ ] Pillar page could serve as authoritative source
- [ ] Each cluster answers a specific question completely
- [ ] Topic coverage demonstrates comprehensive expertise
- [ ] Definition/answer paragraphs are extractable

---

## Example Output Format

```
## Pillar-Cluster Architecture: [TOPIC]

### Overview
- Pillar page: [Title]
- Cluster count: [X]
- Estimated total words: [Y]
- Primary keyword universe: [list]

### Pillar Page
[Full structure as above]

### Cluster Briefs
1. [Cluster 1 brief]
2. [Cluster 2 brief]
...

### Implementation Order
1. [Which to write first - usually pillar]
2. [Highest priority cluster]
3. [Next priority]
...

### Internal Linking Matrix
[Table showing all planned links]

---

## Validation Score

Architecture: X/5
SEO: X/4
GEO: X/4
Total: X/13
```

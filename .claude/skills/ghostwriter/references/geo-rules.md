# GEO Rules

Content structuring rules for Generative Engine Optimization — being cited by AI systems.

---

## Content Structure: The Dual-Optimized Format

### The "Answer-First" Pattern

```markdown
## [Question as H2]

[Direct answer in first sentence - this is what LLMs extract]

[Elaboration and context in subsequent paragraphs]

[Supporting evidence, data, examples]

[Related considerations or caveats]
```

**Example**:
```markdown
## What is Retrieval-Augmented Generation (RAG)?

Retrieval-Augmented Generation (RAG) is an AI framework that enhances
Large Language Models by connecting them to external, real-time data
sources to generate accurate and up-to-date responses.

RAG works in two phases: first, it retrieves relevant documents from
a knowledge base using semantic search; then, it uses these documents
as context for the LLM to generate its response...
```

### The Self-Contained Chunk

Each section must be:
- **Complete**: Understandable without surrounding context
- **Focused**: One concept per chunk
- **Citable**: Contains quotable statements
- **Factual**: Includes verifiable data when possible

**Bad Chunk** (depends on context):
```
As mentioned above, this approach has several benefits.
The first is efficiency...
```

**Good Chunk** (self-contained):
```
## Benefits of Serverless Architecture

Serverless architecture offers three primary benefits for modern
applications: automatic scaling that handles traffic spikes without
manual intervention, pay-per-execution pricing that reduces costs
by 40-60% for variable workloads, and reduced operational overhead
that lets developers focus on code rather than infrastructure.
```

### Heading Hierarchy for AI Parsing

```
H1: Page Topic (one per page)
├── H2: Major Subtopic A
│   ├── H3: Specific Point A.1
│   └── H3: Specific Point A.2
├── H2: Major Subtopic B
│   ├── H3: Specific Point B.1
│   └── H3: Specific Point B.2
└── H2: Conclusion/Summary
```

**LLMs use headings as semantic signals** to understand content structure and navigate to relevant sections.

---

## GEO Checklist

### Content Structure

- [ ] Answer-first format for all questions
- [ ] Self-contained chunks under each H2/H3
- [ ] Clear entity definitions
- [ ] Explicit relationships between concepts
- [ ] Data and statistics with sources

### Citation Worthiness

- [ ] Original research or data
- [ ] Unique insights or perspectives
- [ ] Specific numbers (not vague claims)
- [ ] Expert quotes or attributions
- [ ] Clear factual statements

### Schema Markup

- [ ] Article schema for blog posts
- [ ] FAQ schema for Q&A content
- [ ] HowTo schema for tutorials
- [ ] Product schema for products
- [ ] Organization/Person schema

### Topic Authority

- [ ] Pillar page exists for main topic
- [ ] Cluster pages cover subtopics
- [ ] Internal links connect the cluster
- [ ] Content updated regularly
- [ ] Comprehensive coverage of the topic

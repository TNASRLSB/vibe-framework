# Article Generation Prompt

## Pre-Generation Questions

Ask the user these questions before generating:

### Required
1. **Topic**: What is the article about?
2. **Primary keyword**: What keyword should this rank for?
3. **Target audience**: Who is reading this? (expertise level, pain points)
4. **Intent**: What should the reader DO after reading?

### Optional (use defaults if not provided)
5. **Secondary keywords**: (default: derive 3-5 from primary)
6. **Word count target**: (default: 1500-2000 words)
7. **Tone**: (default: professional but accessible)
8. **Author name**: (for schema markup)
9. **Publication date**: (default: today)

---

## Generation Template

```markdown
# [HEADLINE - Must include primary keyword, max 60 chars]

**TL;DR:** [2-3 sentence answer to the main question. This is the GEO hook -
AI systems will extract this. Be factual, complete, and citation-worthy.]

## [First H2 - Answer the core question]

[Opening paragraph that directly answers the search query. No preamble.
Include primary keyword naturally within first 100 words.]

[Supporting detail paragraph with specific data, examples, or steps.]

### [H3 if needed for sub-topic]

[Detailed content. Each paragraph should be self-contained for chunk retrieval.]

## [Second H2 - Expand with context/how-to/why]

[Content that builds on the answer. Include secondary keywords naturally.]

[Every 300-400 words, include one of:
- A statistic with source
- A concrete example
- A comparison
- A step-by-step breakdown]

## [Third H2 - Address related questions]

[Anticipate follow-up questions. Use "People also ask" patterns.]

### FAQ Section

**Q: [Related question 1]?**
A: [Direct, complete answer in 2-3 sentences.]

**Q: [Related question 2]?**
A: [Direct, complete answer in 2-3 sentences.]

**Q: [Related question 3]?**
A: [Direct, complete answer in 2-3 sentences.]

## Key Takeaways

- [Bullet 1: Core answer restated]
- [Bullet 2: Most important actionable insight]
- [Bullet 3: What to do next]

---

*[Author bio with E-E-A-T credentials]*
```

---

## Output Checklist

After generation, verify:

### SEO (6 checks)
- [ ] Primary keyword in title, H1, first 100 words, one H2
- [ ] Title under 60 characters
- [ ] Meta description draft included (under 160 chars)
- [ ] At least 3 H2 headings
- [ ] Internal linking opportunities noted
- [ ] URL slug suggested (keyword-focused, no stop words)

### GEO (6 checks)
- [ ] TL;DR is extractable as standalone answer
- [ ] Each paragraph is semantically self-contained
- [ ] Statistics include sources
- [ ] FAQ answers are complete (not "click to learn more")
- [ ] No fluffy intros or outros
- [ ] Topic authority demonstrated through specificity

### Copywriting (4 checks)
- [ ] Opening hooks reader immediately
- [ ] Clear value proposition within first paragraph
- [ ] Scannable structure (bullets, headers, bold)
- [ ] CTA aligned with stated intent

---

## Example Output Format

When generating, provide:

```
## Generated Article

[The article content]

---

## SEO Metadata

**Title tag:** [60 chars max]
**Meta description:** [160 chars max]
**URL slug:** /[suggested-slug]
**Primary keyword:** [keyword]
**Secondary keywords:** [list]

---

## Schema.org JSON-LD

[Filled article.json template]

---

## Validation Score

*Run full validation against `validation/rules.md` (46 rules total)*

| Category | Score | Max |
|----------|-------|-----|
| SEO | X | 12 |
| GEO | X | 10 |
| Copy | X | 10 |
| Schema | X | 5 |
| Tech | X | 9 |
| **Total** | **X** | **46** |

Quality threshold: 90%+ = Production ready

Issues found:
- [List any failures]
```

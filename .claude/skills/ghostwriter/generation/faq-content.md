# FAQ Content Generation Prompt

## Pre-Generation Questions

### Required
1. **Topic/Product/Service**: What is this FAQ about?
2. **Target audience**: Who is asking these questions?
3. **Purpose**: Where will this FAQ live? (product page, support, landing page)

### Optional
4. **Known questions**: Any specific questions that must be included?
5. **Pain points**: What confuses or concerns your audience?
6. **Objections**: What stops people from buying/converting?
7. **Competitor FAQs**: Questions competitors answer that you should too?

---

## Question Categories to Cover

Generate questions across these categories:

### 1. Basic/Definitional
- What is [X]?
- How does [X] work?
- What does [X] mean?

### 2. Comparison
- How is [X] different from [Y]?
- [X] vs [Y]: which is better?
- What are alternatives to [X]?

### 3. Use Case
- Who is [X] for?
- When should I use [X]?
- Can [X] be used for [specific purpose]?

### 4. Practical/How-to
- How do I get started with [X]?
- How long does [X] take?
- What do I need for [X]?

### 5. Objection/Concern
- Is [X] worth it?
- Is [X] safe/secure/reliable?
- What if [X] doesn't work?

### 6. Support/Troubleshooting
- What if I have problems with [X]?
- How do I [common action]?
- Why isn't [X] working?

### 7. Purchase/Conversion
- How much does [X] cost?
- Is there a free trial/guarantee?
- How do I cancel/return [X]?

---

## Generation Template

```markdown
## Frequently Asked Questions about [TOPIC]

### [Question 1 - Natural language, how people actually ask]?

[Answer: Direct, complete response in the first sentence. Then expand with
supporting detail. 2-4 sentences total. No "click here to learn more" -
the answer must be self-contained for GEO extraction.]

### [Question 2]?

[Answer: Same format. Be specific. Include numbers, timeframes, or
concrete details where relevant.]

### [Question 3]?

[Answer: If this references another FAQ, still provide a complete answer
here, then optionally add "See also: [related question]"]

...continue for all questions...
```

---

## Answer Quality Rules

### DO
- Answer the question in the first sentence
- Use specific numbers: "typically 2-3 business days" not "quickly"
- Include the question's keywords in the answer naturally
- Make each answer standalone (could be extracted by AI)
- Keep answers 40-100 words (sweet spot for featured snippets)

### DON'T
- Start with "Great question!" or similar fluff
- Answer with just "Yes" or "No" (elaborate)
- Use "it depends" without explaining what it depends on
- Link out instead of answering ("see our guide")
- Include CTAs within answers (breaks GEO extraction)

---

## FAQ Grouping Strategy

For pages with many FAQs, group logically:

```markdown
## FAQs: Getting Started
[Questions about basics, onboarding]

## FAQs: Features & Capabilities
[Questions about what it does]

## FAQs: Pricing & Plans
[Questions about cost]

## FAQs: Support & Troubleshooting
[Questions about help]
```

---

## Output Checklist

### GEO Optimization (5 checks)
- [ ] Each answer starts with direct response
- [ ] Answers are self-contained (no external dependencies)
- [ ] Specific details included (numbers, timeframes)
- [ ] No filler phrases ("great question", "simply put")
- [ ] Answer length 40-100 words (extractable)

### SEO (4 checks)
- [ ] Questions use natural language (how people search)
- [ ] Target keywords appear in questions and answers
- [ ] Questions cover range of search intents
- [ ] No duplicate/overlapping questions

### Schema (3 checks)
- [ ] FAQPage schema generated
- [ ] Each Q&A properly formatted
- [ ] Answers don't contain HTML (plain text for schema)

### User Value (3 checks)
- [ ] Questions address real user concerns
- [ ] Objection-handling questions included
- [ ] Answers are actually helpful (not marketing speak)

---

## Example Output Format

```
## Generated FAQ Content

### Topic: [Topic]
### Question Count: [X]

---

[Full FAQ content with all questions and answers]

---

## Schema.org JSON-LD

{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question 1]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer 1]"
      }
    },
    ...
  ]
}

---

## Validation Score

GEO: X/5
SEO: X/4
Schema: X/3
User Value: X/3
Total: X/15

Issues found:
- [List any failures]

---

## Expansion Suggestions

Questions not included but worth adding:
- [Suggested question 1]
- [Suggested question 2]
```

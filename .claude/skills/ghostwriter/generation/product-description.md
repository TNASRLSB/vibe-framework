# Product Description Generation Prompt

## Pre-Generation Questions

### Required
1. **Product name**: Exact name as it should appear
2. **Product category**: What type of product is this?
3. **Key features**: List 3-5 main features/specs
4. **Target buyer**: Who buys this? Why?
5. **Price point**: Affects positioning (budget, mid-range, premium)

### Optional
6. **Brand positioning**: (budget-friendly, luxury, eco-conscious, etc.)
7. **Competitive differentiator**: What makes this better than alternatives?
8. **Technical specs**: (if relevant to buyer decision)
9. **Use cases**: Primary scenarios where product is used
10. **Available variations**: Colors, sizes, configurations

---

## Generation Template (E-commerce)

```markdown
# [PRODUCT NAME]

[Opening sentence: What it is + who it's for + primary benefit.
Front-load keywords. Be specific.]

## Why Choose [Product Name]

[2-3 sentences expanding on the value proposition.
Address the "why this one?" question immediately.]

### Key Features

- **[Feature 1]:** [Benefit it delivers]
- **[Feature 2]:** [Benefit it delivers]
- **[Feature 3]:** [Benefit it delivers]
- **[Feature 4]:** [Benefit it delivers]

### Perfect For

- [Use case 1 with specific scenario]
- [Use case 2 with specific scenario]
- [Use case 3 with specific scenario]

### Specifications

| Attribute | Value |
|-----------|-------|
| [Spec 1]  | [Value] |
| [Spec 2]  | [Value] |
| [Spec 3]  | [Value] |
| Dimensions | [L x W x H] |
| Weight | [Weight] |

### What's Included

- [Item 1]
- [Item 2]
- [Item 3]

---

*[Trust signal: warranty, satisfaction guarantee, shipping info]*
```

---

## Generation Template (Short Form - 150 words)

For catalog listings, comparison pages, or space-constrained displays:

```markdown
**[PRODUCT NAME]** - [One-line value prop]

[Two sentences: What it is and the primary benefit it delivers.
Include primary keyword and key differentiator.]

**Key Features:**
• [Feature 1 → Benefit]
• [Feature 2 → Benefit]
• [Feature 3 → Benefit]

**Best for:** [Target user in one phrase]

[Specs: Size/Color/Material if relevant]
```

---

## SEO Keyword Strategy

For product descriptions, target:

1. **Primary**: [Product name] + [category]
   - Example: "ergonomic office chair"

2. **Secondary** (include 2-3):
   - [Product type] + [key feature]: "lumbar support desk chair"
   - [Product type] + [use case]: "chair for long work hours"
   - [Brand] + [product type]: "[Brand] office chair"

3. **Long-tail** (for FAQ/content):
   - "best [product type] for [use case]"
   - "[product type] vs [alternative]"
   - "how to choose [product type]"

---

## Output Checklist

### E-commerce SEO (5 checks)
- [ ] Primary keyword in first sentence
- [ ] Product name exact match in H1
- [ ] Specifications in structured format (table or list)
- [ ] Category breadcrumb path suggested
- [ ] Alt text suggestions for product images

### GEO Optimization (4 checks)
- [ ] Opening paragraph works as standalone product summary
- [ ] Features stated with specific values (not "high quality")
- [ ] Use cases are concrete scenarios
- [ ] Brand and product name explicitly stated multiple times

### Conversion Copy (4 checks)
- [ ] Benefits lead, features support
- [ ] "Perfect for" section helps self-selection
- [ ] No superlatives without substantiation
- [ ] Trust signals included (warranty, guarantee, shipping)

### Schema.org (3 checks)
- [ ] Product schema filled completely
- [ ] Price and availability accurate
- [ ] Review/rating data included if available

---

## Example Output Format

```
## Generated Product Description

[Full description]

---

## Short Version (150 words)

[Condensed version for catalogs/listings]

---

## SEO Data

**Title tag:** [Product Name] - [Key Benefit] | [Brand]
**Meta description:** [160 chars with keyword and CTA]
**Primary keyword:** [keyword]
**Image alt text suggestions:**
- Main: [descriptive alt]
- Angle 2: [descriptive alt]
- In-use: [descriptive alt]

---

## Schema.org JSON-LD

{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[First paragraph]",
  "brand": { "@type": "Brand", "name": "[Brand]" },
  "sku": "[SKU]",
  "offers": {
    "@type": "Offer",
    "price": "[Price]",
    "priceCurrency": "[Currency]",
    "availability": "https://schema.org/InStock"
  }
}

---

## Validation Score

E-commerce SEO: X/5
GEO: X/4
Conversion: X/4
Schema: X/3
Total: X/16

Issues found:
- [List any failures]
```

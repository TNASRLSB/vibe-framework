# JSON-LD Schema Templates

Ready-to-use JSON-LD structured data templates. Replace `{{PLACEHOLDER}}` values with actual content.

For guidance on which schema types to prioritize for GEO, see `references/geo.md`.

---

## Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{TITLE_MAX_110_CHARS}}",
  "description": "{{META_DESCRIPTION_MAX_155_CHARS}}",
  "image": {
    "@type": "ImageObject",
    "url": "{{FEATURED_IMAGE_URL}}",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "{{AUTHOR_NAME}}",
    "url": "{{AUTHOR_PAGE_URL}}",
    "jobTitle": "{{AUTHOR_JOB_TITLE}}",
    "sameAs": [
      "{{AUTHOR_LINKEDIN_URL}}",
      "{{AUTHOR_TWITTER_URL}}"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ORGANIZATION_NAME}}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{LOGO_URL}}",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "{{YYYY-MM-DD}}",
  "dateModified": "{{YYYY-MM-DD}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{CANONICAL_URL}}"
  },
  "articleSection": "{{CATEGORY}}",
  "keywords": "{{KEYWORD_1}}, {{KEYWORD_2}}, {{KEYWORD_3}}",
  "wordCount": "{{WORD_COUNT}}",
  "inLanguage": "{{LANGUAGE_CODE}}"
}
```

---

## FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{QUESTION_1}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ANSWER_1_DIRECT_COMPLETE}}"
      }
    },
    {
      "@type": "Question",
      "name": "{{QUESTION_2}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ANSWER_2_DIRECT_COMPLETE}}"
      }
    },
    {
      "@type": "Question",
      "name": "{{QUESTION_3}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ANSWER_3_DIRECT_COMPLETE}}"
      }
    }
  ]
}
```

---

## HowTo

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{{HOWTO_TITLE}}",
  "description": "{{HOWTO_DESCRIPTION}}",
  "image": {
    "@type": "ImageObject",
    "url": "{{FEATURED_IMAGE_URL}}",
    "width": 1200,
    "height": 630
  },
  "totalTime": "PT{{TOTAL_MINUTES}}M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "{{CURRENCY_CODE}}",
    "value": "{{COST_VALUE}}"
  },
  "supply": [
    { "@type": "HowToSupply", "name": "{{SUPPLY_1}}" },
    { "@type": "HowToSupply", "name": "{{SUPPLY_2}}" }
  ],
  "tool": [
    { "@type": "HowToTool", "name": "{{TOOL_1}}" },
    { "@type": "HowToTool", "name": "{{TOOL_2}}" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "{{STEP_1_NAME}}",
      "text": "{{STEP_1_DESCRIPTION}}",
      "url": "{{PAGE_URL}}#step1",
      "image": "{{STEP_1_IMAGE_URL}}"
    },
    {
      "@type": "HowToStep",
      "name": "{{STEP_2_NAME}}",
      "text": "{{STEP_2_DESCRIPTION}}",
      "url": "{{PAGE_URL}}#step2",
      "image": "{{STEP_2_IMAGE_URL}}"
    },
    {
      "@type": "HowToStep",
      "name": "{{STEP_3_NAME}}",
      "text": "{{STEP_3_DESCRIPTION}}",
      "url": "{{PAGE_URL}}#step3",
      "image": "{{STEP_3_IMAGE_URL}}"
    }
  ]
}
```

---

## Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{PRODUCT_NAME}}",
  "description": "{{PRODUCT_DESCRIPTION_MAX_200_CHARS}}",
  "image": [
    "{{PRODUCT_IMAGE_1_URL}}",
    "{{PRODUCT_IMAGE_2_URL}}",
    "{{PRODUCT_IMAGE_3_URL}}"
  ],
  "brand": {
    "@type": "Brand",
    "name": "{{BRAND_NAME}}"
  },
  "sku": "{{SKU}}",
  "mpn": "{{MPN}}",
  "gtin13": "{{EAN_BARCODE}}",
  "offers": {
    "@type": "Offer",
    "url": "{{PRODUCT_PAGE_URL}}",
    "priceCurrency": "{{CURRENCY_CODE}}",
    "price": "{{PRICE_VALUE}}",
    "priceValidUntil": "{{YYYY-MM-DD}}",
    "availability": "https://schema.org/{{IN_STOCK_OR_OUT_OF_STOCK}}",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "{{SELLER_NAME}}"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{RATING_VALUE}}",
    "ratingCount": "{{RATING_COUNT}}",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "{{REVIEWER_NAME}}" },
      "datePublished": "{{REVIEW_DATE}}",
      "reviewBody": "{{REVIEW_TEXT}}",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "{{REVIEW_RATING}}",
        "bestRating": "5"
      }
    }
  ]
}
```

---

## LocalBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{{BUSINESS_NAME}}",
  "description": "{{BUSINESS_DESCRIPTION}}",
  "image": "{{BUSINESS_IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "@id": "{{WEBSITE_URL}}",
  "url": "{{WEBSITE_URL}}",
  "telephone": "{{PHONE_NUMBER}}",
  "email": "{{EMAIL_ADDRESS}}",
  "priceRange": "{{PRICE_RANGE_$$}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_ADDRESS}}",
    "addressLocality": "{{CITY}}",
    "addressRegion": "{{STATE_OR_REGION}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "{{COUNTRY_CODE}}"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LATITUDE}}",
    "longitude": "{{LONGITUDE}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "{{OPENS_HH:MM}}",
      "closes": "{{CLOSES_HH:MM}}"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "{{SAT_OPENS_HH:MM}}",
      "closes": "{{SAT_CLOSES_HH:MM}}"
    }
  ],
  "sameAs": [
    "{{FACEBOOK_URL}}",
    "{{INSTAGRAM_URL}}",
    "{{LINKEDIN_URL}}"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{RATING_VALUE}}",
    "reviewCount": "{{REVIEW_COUNT}}"
  }
}
```

---

## Person

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "{{FULL_NAME}}",
  "givenName": "{{FIRST_NAME}}",
  "familyName": "{{LAST_NAME}}",
  "jobTitle": "{{JOB_TITLE}}",
  "description": "{{BIO_DESCRIPTION}}",
  "image": "{{HEADSHOT_URL}}",
  "url": "{{PERSONAL_WEBSITE_OR_ABOUT_PAGE}}",
  "email": "{{EMAIL}}",
  "worksFor": {
    "@type": "Organization",
    "name": "{{COMPANY_NAME}}",
    "url": "{{COMPANY_URL}}"
  },
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "{{UNIVERSITY_NAME}}"
  },
  "knowsAbout": [
    "{{EXPERTISE_1}}",
    "{{EXPERTISE_2}}",
    "{{EXPERTISE_3}}"
  ],
  "sameAs": [
    "{{LINKEDIN_URL}}",
    "{{TWITTER_URL}}",
    "{{GITHUB_URL}}"
  ]
}
```

---
paths:
  - "**/auth/**"
  - "**/api/**"
  - "**/middleware/**"
  - "**/routes/**"
  - "**/*.env*"
  - "**/config/**"
---

# Security Rules

- Never hardcode secrets, tokens, or credentials
- Parameterize all database queries — no string concatenation
- Validate all external input (user input, API responses, URL params)
- Error responses must not expose stack traces or internal paths
- Auth checks: verify the route actually enforces authentication, don't assume

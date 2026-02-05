---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
---

# UI Component Rules

- Check if a similar component already exists in the registry before creating a new one
- If `.seurat/system.md` exists, use its design tokens (colors, spacing, typography)
- Accessibility: every interactive element needs keyboard support and ARIA labels
- Do not add visual polish or styling improvements unless explicitly requested

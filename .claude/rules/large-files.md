---
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "**/*.jsx"
  - "**/*.js"
  - "**/*.py"
  - "**/*.go"
  - "**/*.rs"
---

# Large File Editing

Before editing any file over 300 lines:
1. Use grep -n to find ALL instances of the pattern you're changing
2. Count total instances before starting
3. After editing, verify the count matches

Never edit a large file from memory. Always grep first.

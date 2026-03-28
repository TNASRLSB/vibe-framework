# Model Validation Test Cases

Each test case defines: scenario, input, quality dimensions, and pass threshold.

---

## Scoring Dimensions

All test cases use a subset of these dimensions, scored 1-5:

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **Correctness** | Wrong or broken output | Mostly correct, minor issues | Fully correct, handles edge cases |
| **Completeness** | Major gaps | Covers main cases | Comprehensive coverage |
| **Insight depth** | Surface-level, obvious | Good analysis, some non-obvious points | Deep, reveals non-obvious connections |
| **Actionability** | Vague suggestions | Clear recommendations | Specific, prioritized, implementable steps |
| **Code quality** | Buggy, non-idiomatic | Working, follows conventions | Clean, idiomatic, well-structured |
| **Format compliance** | Wrong format | Mostly follows spec | Exact spec compliance |
| **Efficiency** | Wasteful, redundant steps | Reasonable approach | Optimal, no unnecessary work |

**Pass threshold**: average ≥ 3.5 across all dimensions for the test case.

---

## Conservative Tier — Already Validated (Sonnet)

These test cases confirm the sonnet assignment is correct. Run if quality concerns arise.

### Emmet — Test Writing

**Test case E1: Unit tests for a utility module**
```
Input: "Write unit tests for a date formatting utility that has:
- formatDate(date, format) → string
- parseDate(string, format) → Date
- diffDays(date1, date2) → number
- isBusinessDay(date) → boolean

The module is in src/utils/dates.ts, uses TypeScript, and the project uses Vitest."
```
Dimensions: correctness, completeness, code quality, efficiency
Pass: ≥ 3.5 avg

**Test case E2: Debugging a race condition**
```
Input: "Users report that clicking 'Save' twice quickly creates duplicate records.
The save handler is in src/api/handlers/save.ts, it calls saveToDb() in src/db/queries.ts.
No mutex or debounce exists. Debug and fix."
```
Dimensions: correctness, insight depth, code quality
Pass: ≥ 3.5 avg

---

### Scribe — Document Generation

**Test case SC1: Financial spreadsheet**
```
Input: "Create an XLSX quarterly financial report with:
- Revenue by product line (4 products, 3 months)
- Auto-calculated totals and QoQ growth percentages
- A bar chart comparing product revenues
- Conditional formatting: red for negative growth, green for positive
- Summary sheet with key metrics"
```
Dimensions: correctness, completeness, format compliance
Pass: ≥ 3.5 avg

**Test case SC2: PDF report from data**
```
Input: "Convert this JSON data into a formatted PDF report with headers, tables,
page numbers, and a table of contents. Data: [provide sample JSON with 3 sections]"
```
Dimensions: format compliance, completeness, efficiency
Pass: ≥ 3.5 avg

---

### Orson — Video Generation

**Test case O1: Product promo video**
```
Input: "Create a 30-second vertical promo video for a task management app.
3 scenes: problem statement, solution demo, CTA.
Format: vertical-9x16, speed: normal, mode: safe.
Include background music and scene transitions."
```
Dimensions: correctness, completeness, format compliance, code quality
Pass: ≥ 3.5 avg

---

### Reviewer — Code Review

**Test case R1: Review a PR with security implications**
```
Input: Provide a diff that adds:
- A new /api/users/:id endpoint with no auth check
- A SQL query built with string concatenation
- A file upload handler with no size limit
- A well-written helper function (to test that reviewer gives credit where due)

"Review this PR for the user management feature."
```
Dimensions: correctness, completeness, insight depth, actionability
Pass: ≥ 3.5 avg

**Test case R2: Review a clean PR**
```
Input: Provide a diff with solid, well-tested code and no obvious issues.

"Review this PR."
```
Dimensions: correctness (should NOT invent false issues), insight depth
Pass: ≥ 3.5 avg — specifically, correctness must be ≥ 4 (no false positives)

---

### Researcher — Codebase Exploration

**Test case RS1: Map an unfamiliar codebase**
```
Input: "Explore this project and map its architecture. I need to understand:
- What the project does
- How it's structured
- Key files and patterns
- How to build and test it"

Run against a real open-source project (e.g., a medium-sized Express or FastAPI app).
```
Dimensions: completeness, accuracy, actionability, efficiency
Pass: ≥ 3.5 avg

---

### Forge — Skill Creation

**Test case F1: Create a new skill**
```
Input: "Create a skill called 'migrator' for database migration management.
It should support: create [name], run, rollback, status.
It works with SQL files in a migrations/ directory."
```
Dimensions: completeness, format compliance, code quality
Pass: ≥ 3.5 avg

---

## Doubtful Tier — Needs Validation Before Downgrade

These test cases determine whether Heimdall and Baptist can be safely moved to Sonnet.

### Heimdall — Security Analysis

**Test case H1: Pattern matching (should work with Sonnet)**
```
Input: Provide code with:
- Hardcoded API key in a config file
- SQL injection in a query
- Missing CSRF token on a form
- XSS via unsanitized user input in innerHTML

"Run a security audit on this project."
```
Dimensions: correctness, completeness, actionability
Pass: ≥ 4.0 avg (higher bar — security must not miss things)

**Test case H2: Complex attack chain (Opus advantage expected)**
```
Input: Provide code where:
- An IDOR vulnerability exists but is hidden behind middleware
- A JWT is signed with a weak secret derived from an env var that's logged
- An admin endpoint has auth but the role check has a logic error (role !== 'admin' vs role !== 'user')
- A file upload accepts .svg files (potential stored XSS via SVG)

"Run a security audit on this project."
```
Dimensions: correctness, insight depth, completeness
Pass: ≥ 4.0 avg — specifically, insight depth must be ≥ 4

**Test case H3: BaaS misconfiguration**
```
Input: Provide a Supabase/Firebase config with:
- RLS disabled on a user_data table
- Storage bucket with public read
- Anon key exposed in client-side code (expected) but with overly permissive policies

"Audit the backend-as-a-service configuration."
```
Dimensions: correctness, completeness, actionability
Pass: ≥ 3.5 avg

---

### Baptist — Conversion Analysis

**Test case B1: Funnel metrics analysis (should work with Sonnet)**
```
Input: "Analyze this conversion funnel:
Landing page: 10,000 visitors
Signup form: 2,100 views (21%)
Form submitted: 420 (4.2%)
Email verified: 294 (2.94%)
First action: 147 (1.47%)

Industry benchmark for SaaS: 3-5% signup rate. What's wrong and how to fix it?"
```
Dimensions: correctness, actionability, insight depth
Pass: ≥ 3.5 avg

**Test case B2: Strategic CRO insight (Opus advantage expected)**
```
Input: Provide a landing page with:
- Good headline but CTA below the fold
- Trust signals present but poorly positioned (after pricing, not before)
- Social proof that inadvertently highlights a negative ("Join 200 users" when competitor has "Join 50,000")
- Pricing page that anchors wrong (cheapest plan shown first)

"Analyze this page's conversion potential and propose optimizations."
```
Dimensions: insight depth, actionability, correctness
Pass: ≥ 4.0 avg — specifically, insight depth must be ≥ 4

---

## How to Add New Test Cases

When a new model is released or a skill is added:

1. Copy the template below
2. Fill in scenario, input, dimensions, and pass threshold
3. Add to the appropriate tier section

```markdown
### [Skill] — [Category]

**Test case [ID]: [Name]**
\```
Input: "[Describe the exact input to provide]"
\```
Dimensions: [list applicable dimensions]
Pass: ≥ [threshold] avg [any dimension-specific requirements]
```

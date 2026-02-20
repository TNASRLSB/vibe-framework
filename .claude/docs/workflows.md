# Workflow Diagrams

Visual decision flows for the VIBE Framework. Reference these diagrams to understand gate logic, severity levels, and process sequences.

---

## Table of Contents

1. [Core Framework](#core-framework)
   - [Change Classification](#change-classification)
   - [Registry Verification](#registry-verification)
   - [Spec Lifecycle](#spec-lifecycle)
   - [Large File Handling](#large-file-handling)
2. [Seurat](#seurat)
   - [Pre-Generation Validation](#pre-generation-validation)
   - [Design Direction Selection](#design-direction-selection)
   - [5-Phase Workflow](#5-phase-workflow)
3. [Heimdall](#heimdall)
   - [Severity-Based Enforcement](#severity-based-enforcement)
   - [Iteration Degradation Tracking](#iteration-degradation-tracking)
   - [Security Scan Workflow](#security-scan-workflow)
4. [Emmet](#emmet)
   - [Stack Detection](#stack-detection)
   - [Code Review Flow](#code-review-flow)
5. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Core Framework

### Change Classification

Determines whether a change needs a spec or can proceed directly.

```mermaid
flowchart TD
    A[Change Request] --> B{Is it trivial?}
    B -->|"Typo, one-liner,<br/>obvious fix"| C[Just Do It]
    B -->|No| D{Large refactoring?<br/>Multiple files?}
    D -->|Yes| E[Create Migration Tracker<br/>.claude/docs/specs/migration-*.md]
    D -->|No| F[Create Feature Spec<br/>.claude/docs/specs/*.md]
    E --> G{User says PROCEED?}
    F --> G
    G -->|Yes| H[Implement]
    G -->|No| I[Revise spec / Clarify]
    I --> G
    H --> J[Update Registry]
    J --> K[Run Checklist]
```

**Key points:**
- Trivial = typos, one-liners, obvious bug fixes → no spec needed
- Multiple files or architectural changes → migration tracker
- Single feature changes → feature spec
- Always wait for PROCEED before implementing non-trivial changes

---

### Registry Verification

Prevents claiming things exist without verification.

```mermaid
flowchart TD
    A[About to reference<br/>component/function/endpoint] --> B{In registry.md?}
    B -->|Yes| C[Proceed with confidence]
    B -->|No| D{Just read the file?}
    D -->|Yes| E[Proceed, then update registry]
    D -->|No| F[STOP - Verify first]
    F --> G[Read actual file]
    G --> H{Exists?}
    H -->|Yes| E
    H -->|No| I[Don't reference it]
```

**Golden rule:** If it's not in the registry and I haven't just read the file, I don't know it exists.

---

### Spec Lifecycle

State machine for feature specifications.

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create spec
    DRAFT --> APPROVED: User says PROCEED
    DRAFT --> DRAFT: Revisions requested
    APPROVED --> IN_PROGRESS: Start implementation
    IN_PROGRESS --> COMPLETE: All tests pass,<br/>registry updated
    IN_PROGRESS --> IN_PROGRESS: Issues found,<br/>continue work
    COMPLETE --> [*]
```

**States:**
- **DRAFT** — Spec created, awaiting approval
- **APPROVED** — Human said PROCEED
- **IN_PROGRESS** — Being implemented
- **COMPLETE** — Done, results recorded

---

### Large File Handling

Prevents missing repeated patterns in files >300 lines.

```mermaid
flowchart TD
    A[Need to modify file] --> B{File > 300 lines?}
    B -->|No| C[Read and edit normally]
    B -->|Yes| D["grep -n 'pattern' file"]
    D --> E[Identify ALL line numbers]
    E --> F{Multiple instances?}
    F -->|Yes| G["Create local checklist:<br/>- [ ] Line X<br/>- [ ] Line Y<br/>- [ ] Line Z"]
    F -->|No| C
    G --> H[Edit each instance]
    H --> I[Mark each complete]
    I --> J{All marked?}
    J -->|No| H
    J -->|Yes| K[Done]
```

**Why this matters:** When reading large files in chunks, I lose track of repeated patterns. Grep first reveals all locations.

---

## Seurat

### Pre-Generation Validation

Validation chain before generating UI code. Gates are ordered by severity.

```mermaid
flowchart TD
    A[UI/UX Task] --> B{system.md exists?}
    B -->|No| BLOCK1[BLOCK: Run /seurat establish first]
    B -->|Yes| C{Direction defined?}
    C -->|No| BLOCK2[BLOCK: Choose direction in system.md]
    C -->|Yes| D{Generic fonts used?<br/>Inter/Roboto/Arial/Helvetica}
    D -->|Yes| BLOCK3[BLOCK: Use distinctive typography]
    D -->|No| E{Text contrast ≥ 4.5:1?}
    E -->|No| WARN1[WARN: Fix contrast before proceeding]
    E -->|Yes| F{Touch targets ≥ 44×44px?}
    F -->|No| WARN2[WARN: Increase touch target size]
    F -->|Yes| G{Spacing on grid?}
    G -->|No| INFO1[INFO: Consider grid alignment]
    G -->|Yes| H[✓ PROCEED with generation]

    BLOCK1 --> STOP[Cannot proceed]
    BLOCK2 --> STOP
    BLOCK3 --> STOP
```

**Severity levels:**
- **BLOCK** — Cannot proceed until fixed (system.md, direction, fonts)
- **WARN** — Should fix, but can proceed with acknowledgment (contrast, touch targets)
- **INFO** — Recommendation only (grid alignment)

---

### Design Direction Selection

Choosing the right design direction based on app type.

```mermaid
flowchart TD
    A["/seurat establish"] --> B{What type of app?}
    B -->|Dashboard/Admin| C[1: Precision & Density]
    B -->|Consumer/Social| D[2: Warmth & Approachability]
    B -->|Finance/Enterprise| E[3: Sophistication & Trust]
    B -->|Analytics/BI| F[4: Data & Analysis]
    B -->|Developer Tools| G[5: Utility & Function]
    B -->|Creative/Marketing| H[6: Expressive & Bold]

    C --> I["system.md:<br/>• 4px base spacing<br/>• Monochrome + accent<br/>• Dense typography<br/>• Borders over shadows"]
    D --> J["system.md:<br/>• 8px+ base spacing<br/>• Soft shadows, rounded<br/>• Warm palette<br/>• Friendly typography"]
    E --> K["system.md:<br/>• 8px base spacing<br/>• Subtle gradients, glass<br/>• Cool muted palette<br/>• Formal hierarchy"]
    F --> L["system.md:<br/>• 4px dense spacing<br/>• High contrast<br/>• Semantic colors<br/>• Tabular numbers"]
    G --> M["system.md:<br/>• Minimal decoration<br/>• Functional color only<br/>• No shadows<br/>• Dense scannable"]
    H --> N["system.md:<br/>• Bold colors<br/>• Dynamic motion<br/>• Display typography<br/>• Playful shadows"]
```

---

### 5-Phase Workflow

The UX-Craft development cycle.

```mermaid
flowchart LR
    A["1. RESEARCH<br/>5-min sprint"] --> B["2. PLAN<br/>90% of effort"]
    B --> C["3. VALIDATE<br/>Pre-generation audit"]
    C --> D["4. BUILD<br/>Code generation"]
    D --> E["5. REFINE<br/>雕花 polish"]

    A -.->|"How do top apps<br/>implement this?"| A
    B -.->|"Subtasks < 50 lines"| B
    C -.->|"Check validation chain"| C
    D -.->|"Follow system.md"| D
    E -.->|"Typography, shadows,<br/>motion, depth"| E
```

**Phase purposes:**
1. **RESEARCH** — 5-minute research sprint on implementation patterns
2. **PLAN** — Decompose into subtasks <50 lines each (90% of effort here)
3. **VALIDATE** — Run pre-generation validation chain
4. **BUILD** — Generate code following system.md
5. **REFINE** — Polish: typography contrast, shadows, motion

---

## Heimdall

### Severity-Based Enforcement

How different vulnerability severities are handled.

```mermaid
flowchart TD
    A[Vulnerability Detected] --> B{Severity?}
    B -->|CRITICAL| C[BLOCK Operation]
    B -->|HIGH| D[BLOCK Operation]
    B -->|MEDIUM| E[WARN - Require acknowledgment]
    B -->|LOW| F[INFO - Log only]

    C --> G["Examples:<br/>• Hardcoded credentials<br/>• SQL injection<br/>• Remote code execution"]
    D --> H["Examples:<br/>• XSS<br/>• Broken auth<br/>• Weak crypto"]
    E --> I{User acknowledges?}
    I -->|Yes| J[Proceed with caution]
    I -->|No| K[Fix issue first]
    F --> L[Continue, issue logged]
```

**Enforcement rules:**
- **CRITICAL/HIGH** — Operation blocked, must fix
- **MEDIUM** — Warning shown, requires acknowledgment to proceed
- **LOW** — Informational only, logged but doesn't interrupt

---

### Iteration Degradation Tracking

Tracks security risk as files are modified repeatedly.

```mermaid
flowchart TD
    A[File Modified] --> B[Increment iteration count]
    B --> C{Iteration count?}
    C -->|1-3| D[INFO: Normal development]
    C -->|4-5| E[WARNING: Consider security review]
    C -->|6+| F[HIGH: Strongly recommend<br/>human security review]

    F --> G["Research shows +37.6%<br/>critical vulns after 5 iterations"]

    D --> H[Continue]
    E --> H
    F --> I{User acknowledges risk?}
    I -->|Yes| H
    I -->|No| J[Pause for review]
```

**Why this matters:** IEEE ISTAS 2025 research shows critical vulnerabilities increase 37.6% after 5 AI iteration cycles on the same code.

---

### Security Scan Workflow

Full security scan process.

```mermaid
flowchart TD
    A["/heimdall scan"] --> B[Load patterns]
    B --> C["Scan for secrets<br/>50+ patterns"]
    B --> D["Scan for OWASP Top 10<br/>60+ patterns"]
    B --> E["Check BaaS config<br/>Supabase/Firebase"]

    C --> F[Aggregate findings]
    D --> F
    E --> F

    F --> G{Any CRITICAL/HIGH?}
    G -->|Yes| H[BLOCK: Must fix before proceeding]
    G -->|No| I{Any MEDIUM?}
    I -->|Yes| J[WARN: Review recommended]
    I -->|No| K[✓ Scan passed]
```

**Scan coverage:**
- **Secrets** — API keys, tokens, credentials (50+ patterns)
- **OWASP** — Injection, XSS, broken auth, etc. (60+ patterns)
- **BaaS** — Supabase RLS, Firebase rules, service key exposure

---

## Emmet

### Stack Detection

How `/adapt-framework` detects and configures for the project stack.

```mermaid
flowchart TD
    A["/adapt-framework"] --> B[Scan config files]

    B --> C{package.json?}
    C -->|Yes| D[Node.js detected]
    C -->|No| E{requirements.txt<br/>or pyproject.toml?}

    D --> F{Check dependencies}
    F --> G{react?}
    G -->|Yes| H[+ React]
    H --> L{next?}
    L -->|Yes| M[+ Next.js]
    L -->|No| N[React SPA]
    G -->|No| I{vue?}
    I -->|Yes| J[+ Vue]
    I -->|No| K{express?}
    K -->|Yes| O[+ Express]

    E -->|Yes| P[Python detected]
    E -->|No| Q{Cargo.toml?}

    P --> R{Check imports}
    R --> S{django?}
    S -->|Yes| T[+ Django]
    S -->|No| U{fastapi?}
    U -->|Yes| V[+ FastAPI]

    Q -->|Yes| W[Rust detected]
    Q -->|No| X{go.mod?}
    X -->|Yes| Y[Go detected]
    X -->|No| Z[Unknown stack]

    M --> GEN["Generate:<br/>stacks/[detected-stack]/"]
    V --> GEN
    T --> GEN
```

**Output:** Stack-specific patterns in `.emmet/stacks/[stack-name]/`

---

### Code Review Flow

Systematic code review using `/emmet checklist code-review`.

```mermaid
flowchart TD
    A["/emmet checklist code-review"] --> B[Load checklist]

    B --> C[Architecture Check]
    C --> D{Single responsibility?}
    D -->|No| E["Flag: Consider splitting"]
    D -->|Yes| F{Dependencies injected?}
    F -->|No| G["Flag: Tight coupling"]
    F -->|Yes| H["✓ Architecture OK"]

    B --> I[Code Quality Check]
    I --> J{Functions < 30 lines?}
    J -->|No| K["Flag: Too long"]
    J -->|Yes| L{Magic numbers?}
    L -->|Yes| M["Flag: Use constants"]
    L -->|No| N["✓ Quality OK"]

    B --> O[Security Check]
    O --> P{Input validated?}
    P -->|No| Q["Flag: Validation needed"]
    P -->|Yes| R{Errors handled?}
    R -->|No| S["Flag: Add error handling"]
    R -->|Yes| T["✓ Security OK"]

    H --> U[Aggregate Results]
    N --> U
    T --> U
    E --> U
    G --> U
    K --> U
    M --> U
    Q --> U
    S --> U
```

---

## Pre-Commit Checklist

Complete verification flow before committing.

```mermaid
flowchart TD
    A[Ready to commit] --> B[Quick Checks]
    B --> C{Tests pass?}
    C -->|No| FAIL1[Fix tests]
    C -->|Yes| D{No type errors?}
    D -->|No| FAIL2[Fix types]
    D -->|Yes| E{No secrets in code?}
    E -->|No| FAIL3[Remove secrets]
    E -->|Yes| F{Registry updated?}
    F -->|No| G[Update registry.md]
    G --> H{Only intended files?}
    F -->|Yes| H
    H -->|No| FAIL4[Review changes]
    H -->|Yes| I["✓ Quick checks passed"]

    I --> J{Feature completion?}
    J -->|No| COMMIT[Commit OK]
    J -->|Yes| L[Feature Checks]
    L --> M{Spec matches reality?}
    M -->|No| FAIL5[Update spec]
    M -->|Yes| N{Tests cover feature?}
    N -->|No| FAIL6[Add tests]
    N -->|Yes| O{Edge cases handled?}
    O -->|No| FAIL7[Handle edge cases]
    O -->|Yes| P{No TODO/FIXME?}
    P -->|No| FAIL8[Resolve or document]
    P -->|Yes| Q["✓ Feature checks passed"]

    Q --> R{Touches auth/payments/user data?}
    R -->|No| COMMIT
    R -->|Yes| T[Security Checks]
    T --> U{Input validated?}
    U -->|No| FAIL9[Add validation]
    U -->|Yes| V{Queries parameterized?}
    V -->|No| FAIL10[Fix SQL]
    V -->|Yes| W{Auth checked?}
    W -->|No| FAIL11[Add auth check]
    W -->|Yes| X{Errors don't leak info?}
    X -->|No| FAIL12[Sanitize errors]
    X -->|Yes| Y["✓ Security checks passed"]

    Y --> COMMIT

    FAIL1 --> A
    FAIL2 --> A
    FAIL3 --> A
    FAIL4 --> A
    FAIL5 --> A
    FAIL6 --> A
    FAIL7 --> A
    FAIL8 --> A
    FAIL9 --> A
    FAIL10 --> A
    FAIL11 --> A
    FAIL12 --> A
```

**Three tiers:**
1. **Quick checks** — Every commit (tests, types, secrets, registry)
2. **Feature checks** — When completing a feature (spec, coverage, edge cases)
3. **Security checks** — When touching sensitive code (validation, auth, errors)

---

## Quick Reference

| Workflow | When to Use | Key Gates |
|----------|-------------|-----------|
| Change Classification | Any change request | Trivial? → Refactoring? → Spec? |
| Registry Verification | Before referencing code | In registry? → Just read? → Verify |
| Pre-Generation (UX) | Before UI code | system.md → direction → fonts → contrast |
| Severity Enforcement | Security findings | CRITICAL/HIGH block, MEDIUM warn |
| Iteration Tracking | Repeated file edits | 1-3 OK, 4-5 warn, 6+ review |
| Pre-Commit | Before any commit | Quick → Feature → Security |

---

*Last updated: 2026-01-20*

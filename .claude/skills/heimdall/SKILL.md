---
name: heimdall
description: AI-specific security analysis for Claude Code. Detects vulnerabilities unique to vibe coding including iteration degradation, credential exposure, BaaS misconfigurations, and OWASP Top 10 patterns. Use when generating code, reviewing security, auditing configurations, or analyzing untrusted code.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Task
  - AskUserQuestion
---

# Heimdall Skill

## Identity

You are a Security Engineer specialized in AI-generated code vulnerabilities:
- **Research-backed**: Decisions based on arXiv:2506.11022, Escape.tech studies
- **Pattern-aware**: Detects AI-specific anti-patterns (logic inversion, iteration degradation)
- **Non-blocking by default**: Warns and educates, blocks only critical issues
- **Evidence-based**: Every alert references CWE, OWASP, or real breach cases

## Prime Directive

**Catch vulnerabilities before they reach production.** Focus on issues that:
1. AI commonly introduces (crypto misuse, hardcoded secrets, logic inversions)
2. Traditional tools miss (BaaS misconfigurations, iteration degradation)
3. Have real-world precedent (CVE-2025-54794, Lovable/Base44 breaches)

---

## Threat Model: Vibe Coding Risks

Research findings (arXiv:2506.11022, Escape.tech) document these risks. For source details, see `KNOWLEDGE.md`.

### AI-Specific Vulnerability Categories

1. **Iteration Degradation**: Security degrades with each AI refinement cycle
2. **Logic Inversion**: AI flips boolean checks (`active === false` grants access)
3. **Credential Exposure**: AI places secrets in client-visible code
4. **BaaS Misconfiguration**: RLS disabled, service keys exposed
5. **Complexity Explosion**: Cyclomatic complexity correlates with vulnerabilities (r=0.64)

---

## Workflow: Security-First Development

### Phase 1: PRE-SCAN (Before Code Generation)

Before generating security-sensitive code, check:

```
/heimdall status
```

- Review iteration count for target files
- Check if complexity thresholds exceeded
- Identify existing vulnerabilities in scope

### Phase 2: GENERATION (With Guardrails)

Hooks automatically validate during Write/Edit operations:
- **PreToolUse**: Scans code BEFORE writing
- **PostToolUse**: Updates iteration tracking, scans result

### Phase 3: AUDIT (On Demand)

```
/heimdall audit
```

Full project security audit:
1. OWASP Top 10 pattern scan
2. Secret detection in all files
3. BaaS configuration check
4. Iteration analysis with recommendations

### Phase 4: REPORT (For Review)

```
/heimdall report
```

Generate SARIF-format report for:
- GitHub Security tab integration
- Code review documentation
- Compliance evidence

---

## Commands

### `/heimdall scan [path]`

Scan file or directory for vulnerabilities.

**Usage**:
```bash
/heimdall scan src/auth/login.ts
/heimdall scan src/
/heimdall scan .  # Current directory
```

**Output**: Vulnerability report with:
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- CWE identifier
- Line number and code snippet
- Remediation guidance

### `/heimdall audit`

Full project security audit.

**Checks**:
1. All source files for OWASP Top 10 patterns
2. All files for exposed credentials
3. BaaS configuration files (Supabase, Firebase)
4. Package manifests for known vulnerabilities
5. Iteration history analysis

**Output**: Comprehensive audit report with prioritized findings.

### `/heimdall secrets`

Focused credential scan.

**Detects**:
- API keys (Stripe, GitHub, Slack, etc.)
- BaaS service keys (Supabase, Firebase)
- JWT tokens in source
- Private keys and certificates
- Environment variable leaks

**Special**: Scans built bundles (dist/, build/) for client-exposed secrets.

### `/heimdall baas [provider]`

BaaS configuration audit.

**Providers**: `supabase` (default), `firebase`, `amplify`, `pocketbase`

For detailed checks per provider (SQL queries, code patterns to flag, common misconfigurations), read `references/baas-config.md`.

**Summary**: Checks RLS, service key exposure, security rules, storage permissions per provider.

### `/heimdall status`

Show security status for tracked files.

**Output**:
- Iteration count per file
- Complexity metrics
- Recent vulnerability findings
- Warning level assessment

### `/heimdall report [format]`

Generate security report.

**Formats**: `markdown` (default), `json`, `sarif`

**Use cases**:
- Documentation and review (Markdown)
- GitHub Security integration (SARIF)
- CI/CD pipelines (JSON)

### `/heimdall config`

Configure skill settings.

**Options**:
- `--strict`: Block on HIGH severity (default: only CRITICAL)
- `--quiet`: Suppress INFO messages
- `--ignore <pattern>`: Add ignore pattern

### `/heimdall reset [path]`

Reset iteration tracking for a file after human review.

**Usage**:
```bash
/heimdall reset src/auth/login.ts
/heimdall reset src/  # Reset all files in directory
```

**Purpose**: After a human has reviewed a file with high iteration count, reset the counter to acknowledge the review. This clears the iteration warning without dismissing the underlying research findings.

**Note**: This only resets iteration tracking. Any vulnerability findings remain in the findings log.

---

## Detection Patterns

### OWASP Top 10 Coverage

Covers all OWASP Top 10 categories (60+ patterns). For per-category details, see `patterns/owasp-top-10.json`.

### AI-Specific Patterns

| Pattern | Detection | CWE |
|---------|-----------|-----|
| Logic Inversion | `active === false && isAdmin` | CWE-284 |
| Iteration Degradation | >5 AI edits without review | N/A |
| Complexity Spike | >30% cyclomatic increase | CWE-1120 |
| Hallucinated Import | Non-existent package reference | CWE-829 |

### Credential Patterns

For full regex patterns, path-context severity, and remediation steps, read `references/credential-guide.md`.

Covers 24+ patterns: Generic, Stripe, GitHub, Supabase, Firebase, AWS, JWT.

---

## Enforcement Rules

### Severity Levels

| Level | Action | Examples |
|-------|--------|----------|
| CRITICAL | **BLOCK** operation | Hardcoded credentials, SQLi, RCE |
| HIGH | **WARN** (default) / **BLOCK** (`--strict`) | XSS, broken auth, weak crypto |
| MEDIUM | **WARN** (require acknowledgment) | Missing validation, verbose errors |
| LOW | **INFO** (log only) | Code style, minor issues |

### Blocking Behavior

When a CRITICAL issue is detected (or HIGH in `--strict` mode):

1. Operation is blocked (exit code 2)
2. Error message shown with:
   - Issue description
   - CWE reference
   - Exact location (file:line)
   - Remediation steps
   - Reference to real-world breach (if applicable)
3. User must fix issue before proceeding

### Non-Blocking Warnings

For MEDIUM/LOW issues:
- Warning displayed
- Operation proceeds
- Issue logged to `.heimdall/findings.json`
- Included in next audit report

---

## Iteration Tracking

### How It Works

Every file modified through Claude Code is tracked. Tracking data is stored in `.heimdall/state.json`.

### Warning Escalation

| Iterations | Level | Message |
|------------|-------|---------|
| 1-3 | INFO | Normal development |
| 4-5 | WARNING | "Consider human review - research shows increased vulnerability risk" |
| 6+ | HIGH | "High iteration count - strongly recommend security review before continuing" |

**Note**: Iteration count alone NEVER blocks operations. It's informational to encourage best practices.

### Reset Tracking

After human review, reset iteration count:

```bash
/heimdall reset src/auth/login.ts
```

---

## Integration

### Hook Configuration

Hooks validate code during Write/Edit operations. For setup instructions, read `references/hook-setup.md`.

---

## State Management

### Files

| File | Purpose |
|------|---------|
| `.heimdall/state.json` | Iteration tracking, session stats |
| `.heimdall/findings.json` | Historical vulnerability findings |
| `.heimdall/config.json` | User configuration overrides |

### Gitignore Recommendation

Add to `.gitignore`:
```
.heimdall/state.json
.heimdall/findings.json
```

Keep in version control:
```
.heimdall/config.json  # Team-wide settings
```

---

## Reference Documentation

- **OWASP Patterns**: [reference/owasp-guide.md](reference/owasp-guide.md)
- **Secure Coding**: [reference/secure-patterns.md](reference/secure-patterns.md)

---

For detailed detection examples (hardcoded credentials, logic inversions, iteration warnings), see `KNOWLEDGE.md`.

---

## Troubleshooting

### Hook Not Triggering

1. Verify hooks are in `.claude/settings.json`
2. Check Python path: `which python3`
3. Test script manually: `python3 .claude/skills/heimdall/hooks/pre-tool-validator.py`

### False Positives

1. Add to ignore list: `/heimdall config --ignore "test/**"`
2. Use inline suppression: `// heimdall-ignore: SEC-001`
3. Report pattern issue for tuning

### Performance Issues

1. Hooks timeout after 10 seconds
2. For large projects, use targeted scans: `/heimdall scan src/auth/`
3. Exclude generated files in config

---

## v2.0 Features

### Diff-Aware Security Analysis

Tracks removal of security patterns during edits. For detected pattern categories, see `KNOWLEDGE.md`.

**Severity escalation**:
| Scenario | Severity |
|----------|----------|
| Single security pattern removed | INFO |
| 2+ patterns removed | WARNING |
| Auth/crypto pattern removed from auth-related file | CRITICAL |

### Import Existence Check

Detects non-existent or typo'd package imports using a static database of ~2000 packages. For detection details, see `KNOWLEDGE.md`.

**Supported languages**: JavaScript/TypeScript, Python, Go, Rust

### Path-Context Severity Adjustment

Severity levels now adjust based on file location. A `service_role` key is CRITICAL in client code but MEDIUM in server code.

**Example path contexts**:
```json
{
  "match": ["src/components/", "pages/", "client/"],
  "severity": "CRITICAL",
  "reason": "Service role key in client-accessible code"
}
```

### "Did You Mean?" Suggestions

When vulnerabilities are detected, Heimdall shows secure alternatives inline. For example output, see `KNOWLEDGE.md`.

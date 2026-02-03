---
name: security-guardian
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

# Security Guardian Skill

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

### Research Findings (Verified Sources)

| Finding | Source | Impact |
|---------|--------|--------|
| +37.6% critical vulns after 5 iterations | arXiv:2506.11022 (IEEE ISTAS 2025) | Iteration tracking needed |
| 2,000+ vulns in 5,600 vibe-coded apps | Escape.tech 2025 | Pattern detection critical |
| 10.3% apps with Supabase misconfig | Escape.tech audit | BaaS audit essential |
| 21.1% crypto errors from security prompts | arXiv:2506.11022 | Paradox awareness |

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
/security-guardian status
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
/security-guardian audit
```

Full project security audit:
1. OWASP Top 10 pattern scan
2. Secret detection in all files
3. BaaS configuration check
4. Iteration analysis with recommendations

### Phase 4: REPORT (For Review)

```
/security-guardian report
```

Generate SARIF-format report for:
- GitHub Security tab integration
- Code review documentation
- Compliance evidence

---

## Commands

### `/security-guardian scan [path]`

Scan file or directory for vulnerabilities.

**Usage**:
```bash
/security-guardian scan src/auth/login.ts
/security-guardian scan src/
/security-guardian scan .  # Current directory
```

**Output**: Vulnerability report with:
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- CWE identifier
- Line number and code snippet
- Remediation guidance

### `/security-guardian audit`

Full project security audit.

**Checks**:
1. All source files for OWASP Top 10 patterns
2. All files for exposed credentials
3. BaaS configuration files (Supabase, Firebase)
4. Package manifests for known vulnerabilities
5. Iteration history analysis

**Output**: Comprehensive audit report with prioritized findings.

### `/security-guardian secrets`

Focused credential scan.

**Detects**:
- API keys (Stripe, GitHub, Slack, etc.)
- BaaS service keys (Supabase, Firebase)
- JWT tokens in source
- Private keys and certificates
- Environment variable leaks

**Special**: Scans built bundles (dist/, build/) for client-exposed secrets.

### `/security-guardian baas [provider]`

BaaS configuration audit.

**Providers**: `supabase` (default), `firebase`, `amplify`, `pocketbase`

**Checks for Supabase**:
- RLS (Row Level Security) status
- Service role key exposure
- Anon key misuse
- Storage bucket permissions
- RPC function security

**Checks for Firebase**:
- Security rules configuration
- Service account exposure
- Database rules permissiveness

### `/security-guardian status`

Show security status for tracked files.

**Output**:
- Iteration count per file
- Complexity metrics
- Recent vulnerability findings
- Warning level assessment

### `/security-guardian report [format]`

Generate security report.

**Formats**: `markdown` (default), `json`, `sarif`

**Use cases**:
- Documentation and review (Markdown)
- GitHub Security integration (SARIF)
- CI/CD pipelines (JSON)

### `/security-guardian config`

Configure skill settings.

**Options**:
- `--strict`: Block on HIGH severity (default: only CRITICAL)
- `--quiet`: Suppress INFO messages
- `--ignore <pattern>`: Add ignore pattern

### `/security-guardian reset [path]`

Reset iteration tracking for a file after human review.

**Usage**:
```bash
/security-guardian reset src/auth/login.ts
/security-guardian reset src/  # Reset all files in directory
```

**Purpose**: After a human has reviewed a file with high iteration count, reset the counter to acknowledge the review. This clears the iteration warning without dismissing the underlying research findings.

**Note**: This only resets iteration tracking. Any vulnerability findings remain in the findings log.

---

## Detection Patterns

### OWASP Top 10 Coverage

| Category | Patterns | Example Detection |
|----------|----------|-------------------|
| A01: Broken Access Control | 8 | Role bypass, IDOR |
| A02: Cryptographic Failures | 6 | MD5/SHA1, weak ciphers |
| A03: Injection | 12 | SQLi, Command injection, XSS |
| A04: Insecure Design | 4 | Missing validation |
| A05: Security Misconfiguration | 10 | Debug mode, default creds |
| A06: Vulnerable Components | 3 | Known CVEs in deps |
| A07: Auth Failures | 6 | Weak passwords, session issues |
| A08: Data Integrity | 4 | Insecure deserialization |
| A09: Logging Failures | 3 | Missing audit logs |
| A10: SSRF | 4 | Unvalidated redirects |
| XSS (cross-category) | 6 | innerHTML, dangerouslySetInnerHTML, document.write |

### AI-Specific Patterns

| Pattern | Detection | CWE |
|---------|-----------|-----|
| Logic Inversion | `active === false && isAdmin` | CWE-284 |
| Iteration Degradation | >5 AI edits without review | N/A |
| Complexity Spike | >30% cyclomatic increase | CWE-1120 |
| Hallucinated Import | Non-existent package reference | CWE-829 |

### Credential Patterns

| Provider | Pattern Count | Examples |
|----------|---------------|----------|
| Generic API Keys | 5 | `api_key`, `apiKey`, `secret_key`, `access_token`, `password` |
| Stripe | 3 | `sk_live_*`, `sk_test_*`, `rk_live_*` |
| GitHub | 4 | `ghp_*`, `gho_*`, `ghu_*/ghs_*`, `ghr_*` |
| Supabase | 4 | `service_role`, `SUPABASE_*` |
| Firebase | 3 | `private_key`, `FIREBASE_*` |
| AWS | 3 | `AKIA*`, `aws_secret_*`, `aws_session_token` |
| JWT | 2 | `eyJ*.*.*` structure, `jwt_secret` |

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
- Issue logged to `.security-guardian/findings.json`
- Included in next audit report

---

## Iteration Tracking

### How It Works

Every file modified through Claude Code is tracked:

```json
{
  "src/auth/login.ts": {
    "iterations": 4,
    "complexity_baseline": 12,
    "complexity_current": 18,
    "last_modified": "2026-01-17T10:45:00Z"
  }
}
```

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
/security-guardian reset src/auth/login.ts
```

---

## Integration

### Hook Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/skills/security-guardian/hooks/pre-tool-validator.py\"",
            "timeout": 10000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/skills/security-guardian/hooks/post-tool-scanner.py\"",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

### CI/CD Integration

GitHub Actions example:

```yaml
- name: Security Guardian Scan
  run: |
    python3 .claude/skills/security-guardian/scripts/scanner.py --format sarif --output security-results.sarif .

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: security-results.sarif
```

---

## State Management

### Files

| File | Purpose |
|------|---------|
| `.security-guardian/state.json` | Iteration tracking, session stats |
| `.security-guardian/findings.json` | Historical vulnerability findings |
| `.security-guardian/config.json` | User configuration overrides |

### Gitignore Recommendation

Add to `.gitignore`:
```
.security-guardian/state.json
.security-guardian/findings.json
```

Keep in version control:
```
.security-guardian/config.json  # Team-wide settings
```

---

## Reference Documentation

- **OWASP Patterns**: [reference/owasp-guide.md](reference/owasp-guide.md)
- **Secure Coding**: [reference/secure-patterns.md](reference/secure-patterns.md)

---

## Examples

### Example 1: Detecting Hardcoded Credential

**Input** (attempted write):
```javascript
const supabase = createClient(
  'https://abc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.xxx'
);
```

**Output**:
```
CRITICAL [SEC-001] Hardcoded Supabase service_role key detected

Location: src/lib/supabase.ts:3
CWE: CWE-798 (Use of Hard-coded Credentials)

This exposes your service_role key which bypasses Row Level Security.
Real-world impact: Lovable platform breach (170 apps compromised)

Remediation:
1. Rotate this key immediately in Supabase dashboard
2. Use environment variable: process.env.SUPABASE_SERVICE_ROLE_KEY
3. Ensure .env is in .gitignore
4. For client-side, use anon key only

Operation BLOCKED. Fix the issue and retry.
```

### Example 2: Logic Inversion Warning

**Input**:
```javascript
if (user.active === false && user.role === 'admin') {
  grantAdminAccess(user);
}
```

**Output**:
```
HIGH [BAC-003] Potential logic inversion - deactivated user granted admin access

Location: src/auth/permissions.ts:45
CWE: CWE-284 (Improper Access Control)

This pattern grants admin access when user.active is FALSE.
AI-generated code frequently inverts boolean conditions.

Did you mean?
  if (user.active === true && user.role === 'admin')

Reference: arXiv:2506.11022 - Logic inversions are a common AI code pattern

[Operation proceeds with warning - use --strict to block on HIGH severity]
```

### Example 3: Iteration Warning

**Output** (after 5th edit to same file):
```
WARNING: High iteration count for src/auth/login.ts

Iterations: 5 (threshold: 5)
Complexity change: +42% from baseline
Recent findings: 2 MEDIUM issues

Research shows 37.6% increase in critical vulnerabilities after 5 AI iterations.
(Source: arXiv:2506.11022, IEEE ISTAS 2025)

Recommendation: Human security review before continuing modifications.

To reset after review: /security-guardian reset src/auth/login.ts

[Operation proceeds - this is informational only]
```

---

## Troubleshooting

### Hook Not Triggering

1. Verify hooks are in `.claude/settings.json`
2. Check Python path: `which python3`
3. Test script manually: `python3 .claude/skills/security-guardian/hooks/pre-tool-validator.py`

### False Positives

1. Add to ignore list: `/security-guardian config --ignore "test/**"`
2. Use inline suppression: `// security-guardian-ignore: SEC-001`
3. Report pattern issue for tuning

### Performance Issues

1. Hooks timeout after 10 seconds
2. For large projects, use targeted scans: `/security-guardian scan src/auth/`
3. Exclude generated files in config

---

## Version

**Skill Version**: 1.0.0
**Pattern Database**: 2026-01-17
**Compatibility**: Claude Code 0.2.111+

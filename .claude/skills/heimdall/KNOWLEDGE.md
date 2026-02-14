# Heimdall — Knowledge Base

Domain knowledge and reference material for the Heimdall security skill. This file is for human readers — Claude does not load it during skill execution.

## Research Findings

| Finding | Source | Impact |
|---------|--------|--------|
| +37.6% critical vulns after 5 iterations | arXiv:2506.11022 (IEEE ISTAS 2025) | Iteration tracking needed |
| 2,000+ vulns in 5,600 vibe-coded apps | Escape.tech 2025 | Pattern detection critical |
| 10.3% apps with Supabase misconfig | Escape.tech audit | BaaS audit essential |
| 21.1% crypto errors from security prompts | arXiv:2506.11022 | Paradox awareness |

## OWASP Top 10 Coverage

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

## Iteration Tracking Format

Tracking data is stored in `.heimdall/state.json` with the following schema:

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

Each tracked file records:
- **iterations**: Number of AI-assisted edits since last reset
- **complexity_baseline**: Cyclomatic complexity at first tracking
- **complexity_current**: Current cyclomatic complexity
- **last_modified**: Timestamp of most recent edit

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

To reset after review: /heimdall reset src/auth/login.ts

[Operation proceeds - this is informational only]
```

## v2.0 Feature Descriptions

### Diff-Aware Security Analysis

Heimdall v2 tracks when security patterns are removed during code changes. When an edit removes authentication checks, validation, rate limiting, or other security controls, Heimdall raises an alert.

**Detected Security Pattern Categories**:
- Authentication checks (`if (auth)`, `requireAuth`, middleware guards)
- Input validation (`validate()`, zod/yup/joi usage)
- Rate limiting (`rateLimit`, `throttle`)
- Access control (`hasPermission`, `hasRole`, RBAC)
- Cryptographic operations (`bcrypt`, `crypto.randomBytes`)
- Input sanitization (`DOMPurify`, `escape()`)
- SQL protection (parameterized queries)
- CSRF protection
- Security headers (`helmet()`)

### Import Existence Check

Detects potentially non-existent or typo'd package imports. Uses a static database of ~2000 common packages - no network calls required.

**Detections**:
- Known typos (`loadash` -> `lodash`, `axois` -> `axios`)
- Unknown packages not in database
- Fuzzy matching for similar package names

### Path-Context Severity Adjustment

Severity levels now adjust based on file location. A `service_role` key is CRITICAL in client code but MEDIUM in server code.

### "Did You Mean?" Suggestions

When vulnerabilities are detected, Heimdall now shows secure alternatives inline.

**Example output**:
```
HIGH [ID-004] Math.random() used for token generation
Location: src/auth/token.ts:45

Did you mean?
  Use cryptographically secure random
  -> [javascript] crypto.randomUUID()
  -> [node] crypto.randomBytes(32).toString('hex')
  -> [python] import secrets; secrets.token_hex(32)
```

## File Structure

```
heimdall/
├── SKILL.md
├── KNOWLEDGE.md
├── hooks/
│   ├── pre-tool-validator.py   # Saves original content, validates new code
│   └── post-tool-scanner.py    # Diff analysis, import check, security scan
├── scripts/
│   ├── scanner.py              # Core scanning engine (path context, secure alternatives)
│   ├── diff-analyzer.py        # Security pattern diff analysis
│   ├── import-checker.py       # Import existence validation
│   ├── iteration-tracker.py    # Iteration counting
│   ├── baas-auditor.py         # BaaS configuration checks
│   └── secret-detector.py      # Credential detection
├── data/
│   └── known-packages.json     # Package database for import checking
├── patterns/
│   ├── owasp-top-10.json       # Updated with secure_alternative
│   ├── secrets.json            # Updated with path_contexts
│   └── baas-misconfig.json     # Updated with path_contexts
├── references/
│   ├── hook-setup.md           # Hook and CI/CD configuration
│   ├── baas-config.md          # BaaS provider audit details
│   └── credential-guide.md    # Credential pattern details
├── reference/
│   ├── owasp-guide.md
│   └── secure-patterns.md
└── test/
    └── vulnerable-samples/
```

## Hook Configuration

For hook setup instructions and CI/CD integration, see `references/hook-setup.md`.

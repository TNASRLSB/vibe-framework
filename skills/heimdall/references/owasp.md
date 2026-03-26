# OWASP Top 10 Reference

Detection patterns, code examples, and remediation for each OWASP Top 10 (2021) category.

---

## A01:2021 — Broken Access Control

The most common web application vulnerability. Access control enforces that users cannot act outside their intended permissions.

### Detection Patterns

```
# Missing auth checks on routes
app\.(get|post|put|delete|patch)\s*\([^)]*\)\s*(?!.*auth)
router\.(get|post|put|delete|patch)\s*\([^)]*\)\s*(?!.*auth)

# Direct object reference without ownership check
findById|findOne|findUnique.*params\.(id|userId)
```

### Vulnerable Code

```javascript
// No authorization — any authenticated user can access any user's data
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user);
});
```

### Fixed Code

```javascript
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  // Verify the authenticated user owns this resource
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});
```

### Remediation Checklist
- Deny by default — require explicit authorization for every endpoint
- Implement ownership checks on all resource access
- Use middleware for role-based access control
- Disable directory listing on web servers
- Log and alert on access control failures

---

## A02:2021 — Cryptographic Failures

Sensitive data exposed due to weak or missing encryption.

### Detection Patterns

```
# Weak hashing
(md5|sha1)\s*\(
createHash\s*\(\s*['"]md5['"]

# Hardcoded encryption keys
(encrypt|cipher|secret|key)\s*[:=]\s*['"][^'"]{8,}['"]

# HTTP for sensitive data
http://(?!localhost|127\.0\.0\.1)
```

### Vulnerable Code

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### Fixed Code

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
// For verification:
const isValid = await bcrypt.compare(password, storedHash);
```

### Remediation Checklist
- Use bcrypt/scrypt/argon2 for password hashing (never MD5/SHA1)
- Encrypt sensitive data at rest (AES-256-GCM)
- Enforce TLS for all connections
- Do not store sensitive data unnecessarily
- Classify data and apply controls per classification

---

## A03:2021 — Injection

Untrusted data sent to an interpreter as part of a command or query.

### Detection Patterns

```
# SQL injection
(query|execute|raw)\s*\(\s*[`'"].*\$\{
(query|execute|raw)\s*\(\s*.*\+\s*(req\.|params\.|query\.|body\.)
\.whereRaw\s*\(.*\$\{

# Command injection
exec\s*\(.*\$\{
execSync\s*\(.*\$\{
child_process.*\+\s*(req\.|params\.|query\.|body\.)
spawn\s*\(.*req\.

# NoSQL injection
\{\s*\$where\s*:
\{\s*\$regex\s*:.*req\.
```

### Vulnerable Code

```javascript
// SQL injection
const result = await db.query(`SELECT * FROM users WHERE id = '${req.params.id}'`);

// Command injection
const output = execSync(`convert ${req.body.filename} output.png`);
```

### Fixed Code

```javascript
// Parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

// Safe command execution
const { execFile } = require('child_process');
// execFile does not invoke a shell — arguments are passed directly
execFile('convert', [sanitizedFilename, 'output.png'], callback);
```

### Remediation Checklist
- Use parameterized queries / prepared statements for all DB access
- Use ORM query builders instead of raw SQL
- Validate and sanitize all input (allowlist over denylist)
- Use execFile instead of exec for shell commands
- Apply least privilege to database accounts

---

## A04:2021 — Insecure Design

Missing or ineffective security controls in the design phase.

### Detection Patterns

```
# No rate limiting on auth endpoints
(login|signin|register|signup|forgot-password|reset-password)(?!.*rateLimit)

# Missing CSRF protection on state-changing endpoints
app\.(post|put|delete|patch)(?!.*csrf)

# Business logic: no limits on resource creation
(create|insert|add)(?!.*limit)(?!.*throttle)
```

### Key Areas
- Authentication flows without rate limiting
- Password reset without token expiry
- Business logic that allows unlimited resource creation
- Missing multi-factor authentication for sensitive operations
- No account lockout after failed attempts

### Remediation Checklist
- Threat model during design phase
- Rate limit authentication endpoints (5 attempts per 15 minutes)
- Add CSRF tokens to all state-changing forms
- Implement account lockout after repeated failures
- Require re-authentication for sensitive operations
- Set resource creation limits per user/time window

---

## A05:2021 — Security Misconfiguration

Insecure default configurations, incomplete or ad hoc configurations.

### Detection Patterns

```
# Debug mode in production
DEBUG\s*[:=]\s*(true|1|'true')
NODE_ENV\s*[:=]\s*['"]development['"]

# Default credentials
(admin|root|test|password|123456)

# Verbose error responses
stack.*trace|\.stack\b
res\.(json|send)\s*\(\s*err\b

# CORS wildcard
(Access-Control-Allow-Origin|origin)\s*[:=]\s*['"]\*['"]
cors\(\s*\)(?!\s*\{)
```

### Vulnerable Code

```javascript
// Leaks stack trace to client
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// CORS allows everything
app.use(cors());
```

### Fixed Code

```javascript
// Production error handler — no internals exposed
app.use((err, req, res, next) => {
  console.error(err); // Log internally
  res.status(500).json({ error: 'Internal server error' });
});

// Explicit CORS origins
app.use(cors({
  origin: ['https://myapp.com', 'https://staging.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
```

### Remediation Checklist
- Remove debug mode and verbose errors in production
- Configure CORS with explicit allowed origins
- Remove default accounts and passwords
- Disable unnecessary features and services
- Implement security headers (see references/patterns.md)
- Review cloud service permissions (principle of least privilege)

---

## A06:2021 — Vulnerable and Outdated Components

Using components with known vulnerabilities.

### Detection Patterns

```bash
# Check for known vulnerabilities
npm audit --json 2>/dev/null
pip-audit 2>/dev/null
cargo audit 2>/dev/null
```

### Remediation Checklist
- Run `npm audit` / `pip-audit` / `cargo audit` regularly
- Keep dependencies updated (automated with Dependabot/Renovate)
- Remove unused dependencies
- Only use components from official sources
- Monitor CVE databases for critical dependencies

---

## A07:2021 — Identification and Authentication Failures

Weak authentication mechanisms.

### Detection Patterns

```
# Weak JWT configuration
(algorithm|alg)\s*[:=]\s*['"]none['"]
(algorithm|alg)\s*[:=]\s*['"]HS256['"].*secret.{0,20}['"]
jwt\.sign\s*\(.*expiresIn.*['"](\d{2,}d|never)['"]

# Session fixation
session\.id\s*=
req\.session\s*=\s*req\.

# No password complexity
password.*minlength.*[0-5]
```

### Vulnerable Code

```javascript
// JWT with no expiry and weak secret
const token = jwt.sign({ userId: user.id }, 'secret123');

// No password requirements
if (password.length < 4) return 'Too short';
```

### Fixed Code

```javascript
// Strong JWT configuration
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,  // 256-bit minimum, from env var
  { algorithm: 'HS256', expiresIn: '15m' }
);

// Password requirements
const { z } = require('zod');
const passwordSchema = z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Needs uppercase')
  .regex(/[0-9]/, 'Needs number')
  .regex(/[^A-Za-z0-9]/, 'Needs special character');
```

### Remediation Checklist
- Use strong, unique JWT secrets from environment variables
- Set short token expiry (15m access, 7d refresh)
- Enforce password complexity requirements
- Implement multi-factor authentication
- Regenerate session IDs after login
- Rate limit authentication endpoints

---

## A08:2021 — Software and Data Integrity Failures

Assumptions about software updates, critical data, and CI/CD pipelines without verifying integrity.

### Detection Patterns

```
# Unpinned dependencies
["'][^"']+["']\s*:\s*["']\^|~|>=|\*|latest["']

# Integrity-less script loading
<script\s+src=["']http
<script(?!.*integrity).*src=["']https://cdn

# Insecure deserialization
JSON\.parse\s*\(\s*req\.
eval\s*\(\s*req\.
unserialize\s*\(
yaml\.load\s*\((?!.*Loader=yaml\.SafeLoader)
pickle\.load
```

### Remediation Checklist
- Pin dependency versions exactly
- Use lockfiles (package-lock.json, yarn.lock)
- Add Subresource Integrity (SRI) hashes to CDN scripts
- Never deserialize untrusted data without validation
- Sign and verify CI/CD pipeline artifacts
- Use `yaml.safe_load()` instead of `yaml.load()`

---

## A09:2021 — Security Logging and Monitoring Failures

Insufficient logging, monitoring, and alerting.

### Detection Patterns

```
# Auth events without logging
(login|logout|register|password)(?!.*log)(?!.*audit)

# Catch blocks that swallow errors
catch\s*\([^)]*\)\s*\{\s*\}
catch\s*\([^)]*\)\s*\{\s*(return|continue|break)
```

### Remediation Checklist
- Log all authentication events (success and failure)
- Log all access control failures
- Log all input validation failures
- Include timestamp, user ID, IP, action, and result in logs
- Do NOT log sensitive data (passwords, tokens, PII)
- Set up alerts for anomalous patterns (brute force, privilege escalation)
- Retain logs for at least 90 days

---

## A10:2021 — Server-Side Request Forgery (SSRF)

Application fetches a remote resource without validating the user-supplied URL.

### Detection Patterns

```
# URL from user input passed to fetch/request
fetch\s*\(\s*(req\.|params\.|query\.|body\.)
axios\s*\.\s*(get|post)\s*\(\s*(req\.|params\.|query\.|body\.)
http\.get\s*\(\s*(req\.|params\.|query\.|body\.)
urllib\.request.*req\.
requests\.(get|post)\s*\(\s*(req\.|request\.)
```

### Vulnerable Code

```javascript
// SSRF — user controls the URL
app.get('/proxy', async (req, res) => {
  const response = await fetch(req.query.url);
  const data = await response.text();
  res.send(data);
});
```

### Fixed Code

```javascript
const { URL } = require('url');

const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

app.get('/proxy', async (req, res) => {
  try {
    const parsed = new URL(req.query.url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return res.status(400).json({ error: 'Host not allowed' });
    }
    if (parsed.protocol !== 'https:') {
      return res.status(400).json({ error: 'HTTPS required' });
    }
    // Block internal network ranges
    // (use a library like 'ssrf-req-filter' for robust checking)
    const response = await fetch(parsed.toString());
    const data = await response.text();
    res.send(data);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
  }
});
```

### Remediation Checklist
- Validate and sanitize all user-supplied URLs
- Allowlist permitted domains and protocols
- Block requests to internal/private IP ranges (10.x, 172.16.x, 192.168.x, 127.x, ::1)
- Use a dedicated SSRF protection library
- Disable HTTP redirects or validate redirect targets
- Segment network access for server-side request functionality

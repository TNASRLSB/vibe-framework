# OWASP Top 10 — Remediation Reference

Detection patterns live in patterns/owasp-top-10.json. This file provides vulnerable/fixed code pairs and remediation checklists only.

---

## A01 — Broken Access Control

### Vulnerable

```javascript
// No authorization — any authenticated user can access any user's data
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user);
});
```

### Fixed

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

### Remediation
- Deny by default — require explicit authorization for every endpoint
- Implement ownership checks on all resource access
- Use middleware for role-based access control
- Disable directory listing on web servers
- Log and alert on access control failures

---

## A02 — Cryptographic Failures

### Vulnerable

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### Fixed

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
// For verification:
const isValid = await bcrypt.compare(password, storedHash);
```

### Remediation
- Use bcrypt/scrypt/argon2 for password hashing (never MD5/SHA1)
- Encrypt sensitive data at rest (AES-256-GCM)
- Enforce TLS for all connections
- Do not store sensitive data unnecessarily
- Classify data and apply controls per classification

---

## A03 — Injection

### Vulnerable

```javascript
// SQL injection
const result = await db.query(`SELECT * FROM users WHERE id = '${req.params.id}'`);

// Command injection
const output = execSync(`convert ${req.body.filename} output.png`);
```

### Fixed

```javascript
// Parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

// Safe command execution
const { execFile } = require('child_process');
// execFile does not invoke a shell — arguments are passed directly
execFile('convert', [sanitizedFilename, 'output.png'], callback);
```

### Remediation
- Use parameterized queries / prepared statements for all DB access
- Use ORM query builders instead of raw SQL
- Validate and sanitize all input (allowlist over denylist)
- Use execFile instead of exec for shell commands
- Apply least privilege to database accounts

---

## A04 — Insecure Design

### Remediation
- Threat model during design phase
- Rate limit authentication endpoints (5 attempts per 15 minutes)
- Add CSRF tokens to all state-changing forms
- Implement account lockout after repeated failures
- Require re-authentication for sensitive operations
- Set resource creation limits per user/time window

---

## A05 — Security Misconfiguration

### Vulnerable

```javascript
// Leaks stack trace to client
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// CORS allows everything
app.use(cors());
```

### Fixed

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

### Remediation
- Remove debug mode and verbose errors in production
- Configure CORS with explicit allowed origins
- Remove default accounts and passwords
- Disable unnecessary features and services
- Implement security headers (see references/patterns.md)
- Review cloud service permissions (principle of least privilege)

---

## A06 — Vulnerable and Outdated Components

### Remediation
- Run `npm audit` / `pip-audit` / `cargo audit` regularly
- Keep dependencies updated (automated with Dependabot/Renovate)
- Remove unused dependencies
- Only use components from official sources
- Monitor CVE databases for critical dependencies

---

## A07 — Identification and Authentication Failures

### Vulnerable

```javascript
// JWT with no expiry and weak secret
const token = jwt.sign({ userId: user.id }, 'secret123');

// No password requirements
if (password.length < 4) return 'Too short';
```

### Fixed

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

### Remediation
- Use strong, unique JWT secrets from environment variables
- Set short token expiry (15m access, 7d refresh)
- Enforce password complexity requirements
- Implement multi-factor authentication
- Regenerate session IDs after login
- Rate limit authentication endpoints

---

## A08 — Software and Data Integrity Failures

### Remediation
- Pin dependency versions exactly
- Use lockfiles (package-lock.json, yarn.lock)
- Add Subresource Integrity (SRI) hashes to CDN scripts
- Never deserialize untrusted data without validation
- Sign and verify CI/CD pipeline artifacts
- Use `yaml.safe_load()` instead of `yaml.load()`

---

## A09 — Security Logging and Monitoring Failures

### Remediation
- Log all authentication events (success and failure)
- Log all access control failures
- Log all input validation failures
- Include timestamp, user ID, IP, action, and result in logs
- Do NOT log sensitive data (passwords, tokens, PII)
- Set up alerts for anomalous patterns (brute force, privilege escalation)
- Retain logs for at least 90 days

---

## A10 — Server-Side Request Forgery (SSRF)

### Vulnerable

```javascript
// SSRF — user controls the URL
app.get('/proxy', async (req, res) => {
  const response = await fetch(req.query.url);
  const data = await response.text();
  res.send(data);
});
```

### Fixed

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

### Remediation
- Validate and sanitize all user-supplied URLs
- Allowlist permitted domains and protocols
- Block requests to internal/private IP ranges (10.x, 172.16.x, 192.168.x, 127.x, ::1)
- Use a dedicated SSRF protection library
- Disable HTTP redirects or validate redirect targets
- Segment network access for server-side request functionality

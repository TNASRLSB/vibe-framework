# OWASP Top 10 Quick Reference

Security Guardian pattern reference for the OWASP Top 10 2021.

---

## A01: Broken Access Control

**What it is**: Failures in enforcing restrictions on what authenticated users can do.

**Common patterns in AI-generated code**:
- Role checks with permissive OR conditions
- Direct object references without authorization
- Missing authentication middleware on protected routes

**Detection patterns**:
```
BAC-001: role === 'admin' || ...
BAC-002: params.userId without auth check
BAC-003: active === false && isAdmin (AI logic inversion!)
BAC-004: Admin routes without middleware
```

**Secure pattern**:
```javascript
// ✅ Correct
router.get('/admin', authMiddleware, adminOnly, (req, res) => {
  // Only authenticated admins reach here
});

// ❌ Wrong
router.get('/admin', (req, res) => {
  if (req.user.role === 'admin' || req.query.bypass) {
    // OR condition allows bypass!
  }
});
```

---

## A02: Cryptographic Failures

**What it is**: Failures related to cryptography that lead to data exposure.

**Common patterns in AI-generated code**:
- Using MD5/SHA1 for password hashing
- Hardcoded encryption keys
- Static IVs in encryption

**Detection patterns**:
```
CF-001: createHash('md5') or createHash('sha1')
CF-002: DES, RC4, Blowfish ciphers
CF-003: encryption_key = "hardcoded"
CF-004: iv = "static_value"
```

**Secure pattern**:
```javascript
// ✅ Correct - Password hashing
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// ✅ Correct - Encryption
const crypto = require('crypto');
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = crypto.randomBytes(16); // Random IV each time
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

// ❌ Wrong
const hash = crypto.createHash('md5').update(password).digest('hex');
const cipher = crypto.createCipher('des', 'weak'); // Deprecated!
```

---

## A03: Injection

**What it is**: User-supplied data sent to an interpreter as part of a command/query.

**Types**:
- SQL Injection
- Command Injection
- NoSQL Injection
- XSS (see A07)

**Detection patterns**:
```
INJ-001: execute(f"SELECT * FROM {table}")
INJ-002: ${variable} in SQL string
INJ-003: exec(), system(), shell=True
INJ-005: $where in MongoDB
INJ-008: eval() with user input
```

**Secure pattern**:
```javascript
// ✅ Correct - Parameterized query
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ Wrong - String concatenation
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);

// ✅ Correct - Command execution
const { execFile } = require('child_process');
execFile('command', [arg1, arg2]); // Arguments as array

// ❌ Wrong
exec(`command ${userInput}`); // Injection risk!
```

---

## A04: Insecure Design

**What it is**: Missing or ineffective security controls in the design.

**Detection patterns**:
```
ID-001: User input without validation
ID-002: Sensitive operations without auth check
ID-003: Hardcoded admin credentials
ID-004: Math.random() for security values
```

**Secure pattern**:
```javascript
// ✅ Correct - Input validation
const { z } = require('zod');
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const validated = userSchema.parse(req.body);

// ✅ Correct - Secure random
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');

// ❌ Wrong
const token = Math.random().toString(36); // Predictable!
```

---

## A05: Security Misconfiguration

**What it is**: Missing or incorrect security hardening.

**Detection patterns**:
```
SM-001: debug = true
SM-002: res.send(error.stack)
SM-003: password = "admin"
SM-005: rejectUnauthorized = false
SM-009: cookie without secure/httpOnly
```

**Secure pattern**:
```javascript
// ✅ Correct - Error handling
app.use((err, req, res, next) => {
  console.error(err); // Log full error server-side
  res.status(500).json({ error: 'Internal server error' }); // Generic response
});

// ✅ Correct - Secure cookies
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ✅ Correct - Security headers
const helmet = require('helmet');
app.use(helmet());
```

---

## A06: Vulnerable Components

**What it is**: Using components with known vulnerabilities.

**Detection patterns**:
```
VC-001: Outdated lodash versions
VC-002: Deprecated crypto APIs
VC-003: pickle.loads() in Python
```

**Secure pattern**:
```bash
# Regular vulnerability checks
npm audit
npm audit fix

# Python
pip-audit
safety check
```

---

## A07: Identification and Authentication Failures

**What it is**: Weaknesses in authentication mechanisms.

**Detection patterns**:
```
AF-001: password.length < 8
AF-002: user.password = req.body.password (no hash)
AF-003: session.id = userInput (fixation)
AF-005: ?password= in URL
AF-006: localStorage.setItem('token', jwt)
```

**Secure pattern**:
```javascript
// ✅ Correct - Password hashing
const bcrypt = require('bcrypt');
user.passwordHash = await bcrypt.hash(password, 12);

// ✅ Correct - Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));

// ✅ Correct - JWT storage (httpOnly cookie)
res.cookie('token', jwt, { httpOnly: true, secure: true });

// ❌ Wrong - localStorage (vulnerable to XSS)
localStorage.setItem('token', jwt);
```

---

## A08: Software and Data Integrity Failures

**What it is**: Code and infrastructure without integrity protection.

**Detection patterns**:
```
DI-001: JSON.parse(untrustedData)
DI-002: External scripts without SRI
DI-003: Object.assign with untrusted input
DI-004: eval(externalData)
```

**Secure pattern**:
```html
<!-- ✅ Correct - Subresource Integrity -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

```javascript
// ✅ Correct - Prototype pollution prevention
const safeAssign = (target, source) => {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    target[key] = source[key];
  }
  return target;
};
```

---

## A09: Security Logging and Monitoring Failures

**What it is**: Insufficient logging to detect and respond to attacks.

**Detection patterns**:
```
LF-001: console.log with password/token
LF-002: Login without audit logging
LF-003: catch() { } (swallowed exception)
```

**Secure pattern**:
```javascript
// ✅ Correct - Audit logging
async function login(username, password, ip) {
  const user = await findUser(username);
  if (!user || !await bcrypt.compare(password, user.hash)) {
    logger.warn('Failed login attempt', {
      username,
      ip,
      timestamp: new Date().toISOString()
    });
    return null;
  }
  logger.info('Successful login', { userId: user.id, ip });
  return user;
}

// ✅ Correct - Exception handling
try {
  // operation
} catch (err) {
  logger.error('Operation failed', { error: err.message, stack: err.stack });
  throw err; // Re-throw or handle appropriately
}
```

---

## A10: Server-Side Request Forgery (SSRF)

**What it is**: Server fetches resources from user-controlled URLs.

**Detection patterns**:
```
SSRF-001: fetch(req.body.url)
SSRF-002: localhost/127.0.0.1/metadata.google
SSRF-003: res.redirect(req.query.url)
```

**Secure pattern**:
```javascript
// ✅ Correct - URL validation
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

function fetchUrl(userUrl) {
  const parsed = new URL(userUrl);

  // Block internal addresses
  if (parsed.hostname === 'localhost' ||
      parsed.hostname.startsWith('127.') ||
      parsed.hostname.startsWith('169.254.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname === 'metadata.google.internal') {
    throw new Error('Internal URLs not allowed');
  }

  // Whitelist allowed hosts
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Host not in allowlist');
  }

  return fetch(userUrl);
}
```

---

## XSS (Cross-Site Scripting)

While technically under A03, XSS is common enough to highlight separately.

**Detection patterns**:
```
XSS-001: innerHTML = userInput
XSS-002: document.write()
XSS-003: dangerouslySetInnerHTML
XSS-004: $(selector).html(userInput)
XSS-005: Template literal in HTML
```

**Secure pattern**:
```javascript
// ✅ Correct - Use textContent
element.textContent = userInput;

// ✅ Correct - Sanitize HTML
const DOMPurify = require('dompurify');
element.innerHTML = DOMPurify.sanitize(userHtml);

// ✅ Correct - React (automatic escaping)
return <div>{userInput}</div>;

// ❌ Wrong - React bypass
return <div dangerouslySetInnerHTML={{__html: userInput}} />;
```

---

## AI-Specific Patterns

These patterns are commonly introduced by AI code generators:

### Logic Inversion (BAC-003)
```javascript
// ❌ AI often generates this incorrectly
if (user.active === false && user.role === 'admin') {
  grantAccess(); // WRONG: Gives access to INACTIVE admins!
}

// ✅ Correct
if (user.active === true && user.role === 'admin') {
  grantAccess();
}
```

### Crypto Misuse (CF-001, CF-002)
AI frequently suggests outdated crypto patterns. Always verify:
- Hash algorithms: Use SHA-256+ or bcrypt/argon2 for passwords
- Encryption: Use AES-256-GCM, not DES/RC4
- Key generation: Use crypto.randomBytes(), not Math.random()

### Iteration Degradation
Research shows security quality degrades with each AI iteration.
After 5+ iterations on the same code, schedule a human security review.

---

## Quick Reference Table

| Vulnerability | CWE | Quick Fix |
|--------------|-----|-----------|
| SQL Injection | CWE-89 | Parameterized queries |
| XSS | CWE-79 | textContent, DOMPurify |
| Command Injection | CWE-78 | execFile with array args |
| Weak Crypto | CWE-327 | AES-256-GCM, bcrypt |
| Hardcoded Creds | CWE-798 | Environment variables |
| Missing Auth | CWE-306 | Middleware on routes |
| Open Redirect | CWE-601 | Whitelist URLs |
| SSRF | CWE-918 | Block internal IPs |

---

*Reference: OWASP Top 10 2021 - https://owasp.org/Top10/*

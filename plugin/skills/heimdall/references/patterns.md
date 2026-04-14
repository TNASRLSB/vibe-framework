# Security Patterns Reference

Input validation, output encoding, CSRF protection, rate limiting, Content Security Policy, and secure headers.

---

## Input Validation

### Principles
1. **Validate on the server.** Client-side validation is UX, not security.
2. **Allowlist over denylist.** Define what IS valid, not what is invalid.
3. **Validate type, length, format, and range.**
4. **Reject early.** Validate at the boundary before data enters business logic.

### Schema Validation (Recommended)

```javascript
// Zod — TypeScript-first schema validation
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).regex(/^[\p{L}\p{N}\s'-]+$/u),
  age: z.number().int().min(13).max(150).optional(),
  role: z.enum(['user', 'editor']),  // allowlist, not freeform string
});

// Express middleware
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
    }
    req.validated = result.data;
    next();
  };
}

app.post('/api/users', validate(createUserSchema), handler);
```

### Common Validation Patterns

| Field | Validation |
|-------|-----------|
| Email | Schema validator or RFC 5322 regex, max 254 chars |
| Username | `^[a-zA-Z0-9_-]{3,30}$` |
| URL | Parse with `new URL()`, check protocol allowlist |
| Phone | `^\+?[1-9]\d{1,14}$` (E.164) |
| UUID | `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` |
| File path | Reject `..`, normalize, verify within allowed directory |
| HTML content | Sanitize with DOMPurify or similar |
| SQL identifiers | Allowlist of known column/table names |

### File Upload Validation

```javascript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateUpload(file) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
  // Verify magic bytes match claimed MIME type
  // Do not trust Content-Type header alone
}
```

---

## Output Encoding

### Context-Specific Encoding

| Context | Encoding | Example |
|---------|----------|---------|
| HTML body | HTML entity encode | `<` → `&lt;` |
| HTML attribute | HTML entity encode + quote | `" onload="alert(1)` → `&quot; onload=&quot;alert(1)` |
| JavaScript | JavaScript escape | `'; alert(1); '` → `\'; alert(1); \'` |
| URL parameter | URL encode | `?q=<script>` → `?q=%3Cscript%3E` |
| CSS | CSS escape | Filter to known-safe values |
| JSON in HTML | JSON.stringify + HTML encode | Prevent breaking out of script tags |

### React/JSX

React auto-encodes by default. The danger is `dangerouslySetInnerHTML`:

```jsx
// VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// SAFE — use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// SAFEST — avoid dangerouslySetInnerHTML entirely
<div>{userContent}</div>  // React auto-escapes this
```

### Vue

```html
<!-- VULNERABLE -->
<div v-html="userContent"></div>

<!-- SAFE -->
<div>{{ userContent }}</div>  <!-- Vue auto-escapes -->

<!-- If v-html is needed -->
<div v-html="sanitize(userContent)"></div>
```

---

## CSRF Protection

### Token-Based CSRF Protection

```javascript
// Server: generate and set CSRF token
const crypto = require('crypto');

app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

// Server: validate on state-changing requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});
```

### SameSite Cookies (Modern Approach)

```javascript
app.use(session({
  cookie: {
    httpOnly: true,
    secure: true,           // HTTPS only
    sameSite: 'lax',        // Prevents most CSRF
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
```

### Double Submit Cookie Pattern (for SPAs)

```javascript
// Server sets a CSRF cookie
res.cookie('csrf-token', token, {
  httpOnly: false,   // JS must read it
  secure: true,
  sameSite: 'strict',
});

// Client reads cookie and sends as header
fetch('/api/data', {
  method: 'POST',
  headers: { 'X-CSRF-Token': getCookie('csrf-token') },
  body: JSON.stringify(data),
});

// Server validates header matches cookie
```

---

## Rate Limiting

### Implementation

```javascript
// express-rate-limit
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                     // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
```

### Recommended Limits

| Endpoint Type | Window | Max Requests |
|--------------|--------|-------------|
| General API | 15 min | 100 |
| Authentication | 15 min | 5 (failures only) |
| Password Reset | 1 hour | 3 |
| File Upload | 1 hour | 20 |
| Public Search | 1 min | 30 |
| Webhooks | 1 min | 60 |

### Distributed Rate Limiting

For multi-server deployments, use Redis-backed rate limiting:

```javascript
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

---

## Content Security Policy (CSP)

### Recommended Policy

```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],           // No 'unsafe-inline' or 'unsafe-eval'
    styleSrc: ["'self'", "'unsafe-inline'"],  // Often needed for CSS-in-JS
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", "https://api.example.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],      // Prevents clickjacking
    upgradeInsecureRequests: [],
  },
}));
```

### CSP with Nonces (for inline scripts)

```javascript
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
  },
}));

// In template:
// <script nonce="<%= nonce %>">...</script>
```

### Common CSP Issues

| Problem | Solution |
|---------|----------|
| `'unsafe-inline'` for scripts | Use nonces or hashes instead |
| `'unsafe-eval'` | Refactor code that uses eval/Function/setTimeout with strings |
| `*` wildcard in sources | Specify exact domains |
| Missing `frame-ancestors` | Add `frame-ancestors 'none'` to prevent clickjacking |
| Report-only but never enforced | Transition from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` |

---

## Secure Headers

### Complete Header Set

```javascript
const helmet = require('helmet');
app.use(helmet());  // Sets all of the below by default
```

Or manually:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking (legacy, use CSP frame-ancestors) |
| `X-XSS-Protection` | `0` | Disable buggy browser XSS filter (CSP is better) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leaking |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused browser features |
| `Content-Security-Policy` | See CSP section above | Control resource loading |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevent cross-origin reads |

### Detection Patterns for Missing Headers

```bash
# Check if helmet or security headers middleware is used
grep -rn "helmet\|security-headers\|X-Content-Type-Options\|Strict-Transport-Security" \
  --include="*.ts" --include="*.js" --include="*.py" .
```

### Cookie Security

```javascript
// Secure cookie configuration
res.cookie('session', token, {
  httpOnly: true,      // No JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'lax',     // CSRF protection
  maxAge: 86400000,    // 24 hours
  path: '/',
  domain: '.example.com',
});
```

---

## Trail of Bits Patterns

Common vulnerability patterns identified by Trail of Bits in audited projects:

### 1. Unchecked Return Values

```javascript
// VULNERABLE: ignoring async operation failure
await db.delete(record);  // What if this fails silently?
await sendEmail(user);     // Network failure ignored

// FIXED: handle failures explicitly
const deleted = await db.delete(record);
if (!deleted) throw new Error('Failed to delete record');

try {
  await sendEmail(user);
} catch (err) {
  logger.error('Email send failed', { userId: user.id, error: err.message });
  // Decide: retry, queue, or fail the operation
}
```

### 2. Integer Overflow / Precision Loss

```javascript
// VULNERABLE: JavaScript number precision loss for large IDs
const id = JSON.parse('{"id": 9007199254740993}');
// id.id is 9007199254740992 — wrong!

// FIXED: use BigInt or string IDs
const id = JSON.parse('{"id": "9007199254740993"}');
```

### 3. Race Conditions

```javascript
// VULNERABLE: check-then-act race condition
const balance = await getBalance(userId);
if (balance >= amount) {
  await deductBalance(userId, amount);  // Another request could deduct between check and here
}

// FIXED: atomic operation
await db.query(
  'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1',
  [amount, userId]
);
```

### 4. Prototype Pollution

```javascript
// VULNERABLE: merging user input into objects
Object.assign(config, req.body);
// If req.body = {"__proto__": {"admin": true}} ...

// FIXED: validate and pick known properties
const { name, email } = req.body;
Object.assign(config, { name, email });
```

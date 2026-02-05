# Secure Coding Patterns

Quick reference for secure implementations that replace common insecure patterns.

---

## Authentication

### Password Storage

```javascript
// ✅ SECURE: bcrypt with appropriate cost factor
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// ❌ INSECURE: Plain MD5/SHA
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### Session Management

```javascript
// ✅ SECURE: httpOnly, secure cookies
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
}));

// ❌ INSECURE: JWT in localStorage
localStorage.setItem('token', jwt); // Vulnerable to XSS
```

### JWT Handling

```javascript
// ✅ SECURE: Verify signature, check expiration
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly specify algorithm
      maxAge: '1h'
    });
  } catch (err) {
    return null;
  }
}

// ❌ INSECURE: decode without verify
const payload = jwt.decode(token); // No signature check!
```

---

## Database Queries

### SQL (Parameterized)

```javascript
// ✅ SECURE: Parameterized query
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  [email, true]
);

// ✅ SECURE: Using an ORM
const user = await User.findOne({
  where: { email, active: true }
});

// ❌ INSECURE: String interpolation
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}'` // SQL injection!
);
```

### MongoDB

```javascript
// ✅ SECURE: Sanitized query
const user = await User.findOne({
  email: { $eq: sanitizedEmail } // Explicit $eq prevents operator injection
});

// ❌ INSECURE: Direct user input
const user = await User.findOne({
  $where: `this.email === '${email}'` // NoSQL injection!
});
```

---

## Input Validation

### Schema Validation (Zod)

```javascript
// ✅ SECURE: Strict schema validation
const { z } = require('zod');

const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().positive().max(150).optional()
});

function validateUser(data) {
  return userSchema.safeParse(data);
}

// Usage
const result = validateUser(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
const validatedData = result.data;
```

### Sanitization

```javascript
// ✅ SECURE: Sanitize HTML content
const DOMPurify = require('isomorphic-dompurify');

function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
}

// ✅ SECURE: Escape for SQL LIKE
function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}
```

---

## Cryptography

### Encryption

```javascript
// ✅ SECURE: AES-256-GCM with random IV
const crypto = require('crypto');

function encrypt(plaintext, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  };
}

function decrypt(encryptedData, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ❌ INSECURE: DES, static IV
const cipher = crypto.createCipher('des', password); // Deprecated!
```

### Random Values

```javascript
// ✅ SECURE: Cryptographically secure random
const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateSecureCode(length = 6) {
  // For numeric codes (e.g., 2FA)
  const max = Math.pow(10, length) - 1;
  const random = crypto.randomInt(0, max + 1);
  return random.toString().padStart(length, '0');
}

// ❌ INSECURE: Math.random()
const token = Math.random().toString(36).slice(2); // Predictable!
```

---

## XSS Prevention

### React

```jsx
// ✅ SECURE: Default escaping
function UserProfile({ user }) {
  return <div>{user.bio}</div>; // Auto-escaped
}

// ⚠️ CAUTION: If HTML needed, sanitize first
function RichContent({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ❌ INSECURE: Unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Vanilla JS

```javascript
// ✅ SECURE: textContent for plain text
element.textContent = userInput;

// ✅ SECURE: Attribute setting
element.setAttribute('data-value', encodeURIComponent(userInput));

// ❌ INSECURE: innerHTML
element.innerHTML = userInput; // XSS!
document.write(userInput); // XSS!
```

---

## Command Execution

```javascript
// ✅ SECURE: execFile with argument array
const { execFile } = require('child_process');

function runCommand(filename) {
  return new Promise((resolve, reject) => {
    execFile('cat', [filename], (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

// ❌ INSECURE: exec with string concatenation
const { exec } = require('child_process');
exec(`cat ${filename}`); // Command injection!

// ❌ INSECURE: shell=True in Python
import subprocess
subprocess.call(f"cat {filename}", shell=True)  # Injection!
```

---

## File Operations

### Path Traversal Prevention

```javascript
// ✅ SECURE: Resolve and validate path
const path = require('path');
const fs = require('fs').promises;

async function readUserFile(userPath, baseDir) {
  const safePath = path.resolve(baseDir, userPath);

  // Ensure resolved path is within base directory
  if (!safePath.startsWith(path.resolve(baseDir) + path.sep)) {
    throw new Error('Path traversal detected');
  }

  return await fs.readFile(safePath, 'utf8');
}

// ❌ INSECURE: Direct path concatenation
const content = await fs.readFile(baseDir + '/' + userPath);
// userPath could be "../../../etc/passwd"
```

### File Upload

```javascript
// ✅ SECURE: Validate file type and size
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});
```

---

## API Security

### Rate Limiting

```javascript
// ✅ SECURE: Rate limiting on sensitive endpoints
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later'
});

app.post('/login', loginLimiter, loginHandler);
```

### CORS Configuration

```javascript
// ✅ SECURE: Specific origins
const cors = require('cors');

app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ❌ INSECURE: Allow all origins
app.use(cors({ origin: '*' })); // Dangerous with credentials!
```

---

## Error Handling

```javascript
// ✅ SECURE: Log details server-side, generic client response
app.use((err, req, res, next) => {
  // Log full error for debugging
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Generic response to client
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'Internal server error'
      : err.message
  });
});

// ❌ INSECURE: Expose stack traces
res.status(500).json({ error: err.stack }); // Information disclosure!
```

---

## Environment Variables

```javascript
// ✅ SECURE: Validate required env vars at startup
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET'
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// ✅ SECURE: Never log env vars
console.log('Starting server...'); // OK
console.log(process.env); // ❌ INSECURE!
```

---

## Supabase-Specific

```javascript
// ✅ SECURE: Use anon key client-side
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // anon key only!
);

// ❌ INSECURE: Service role in client
const supabase = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS!
);
```

### RLS Policies

```sql
-- ✅ SECURE: Users can only access their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ❌ INSECURE: Open access
CREATE POLICY "Open access"
ON users FOR ALL
USING (true); -- Everyone can do everything!
```

---

## Firebase-Specific

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ✅ SECURE: Authentication required
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // ❌ INSECURE: Open access
    match /{document=**} {
      allow read, write: if true; // Anyone can access!
    }
  }
}
```

---

## Quick Checklist

Before deploying:

- [ ] All passwords hashed with bcrypt/argon2
- [ ] All SQL queries parameterized
- [ ] All user input validated
- [ ] All HTML output escaped/sanitized
- [ ] No secrets in source code
- [ ] HTTPS enforced
- [ ] Secure cookie flags set
- [ ] Rate limiting on auth endpoints
- [ ] CORS properly configured
- [ ] Error messages don't expose internals
- [ ] Dependencies audited (`npm audit`)
- [ ] RLS enabled on all Supabase tables
- [ ] Firebase rules properly configured

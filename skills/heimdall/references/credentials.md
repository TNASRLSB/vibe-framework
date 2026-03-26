# Credential Detection Reference

Patterns for detecting leaked API keys, tokens, and secrets in codebases. Includes environment variable best practices and remediation guidance.

---

## API Key Patterns

### OpenAI
- **Pattern:** `sk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}`
- **Newer format:** `sk-proj-[A-Za-z0-9_-]{80,}`
- **Severity:** Critical — allows billing charges and data access
- **Remediation:** Rotate immediately at platform.openai.com/api-keys

### Anthropic
- **Pattern:** `sk-ant-[A-Za-z0-9_-]{80,}`
- **Severity:** Critical — allows billing charges and data access
- **Remediation:** Rotate at console.anthropic.com

### AWS
- **Access Key ID:** `AKIA[0-9A-Z]{16}`
- **Secret Access Key:** often near the Access Key ID, 40-char base64
- **Pattern:** `(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?`
- **Severity:** Critical — full AWS account access possible
- **Remediation:** Rotate in AWS IAM console, audit CloudTrail for unauthorized usage

### Google Cloud / Firebase
- **Service Account Key:** JSON file with `"type": "service_account"` and `"private_key": "-----BEGIN`
- **API Key:** `AIza[0-9A-Za-z_-]{35}`
- **Severity:** High to Critical depending on scope
- **Remediation:** Rotate in Google Cloud Console, delete compromised service account keys

### Stripe
- **Secret Key:** `sk_(live|test)_[A-Za-z0-9]{24,}`
- **Publishable Key:** `pk_(live|test)_[A-Za-z0-9]{24,}` (public, lower risk)
- **Severity:** Critical for sk_live_, High for sk_test_
- **Remediation:** Roll keys in Stripe Dashboard

### GitHub
- **Personal Access Token (classic):** `ghp_[A-Za-z0-9]{36}`
- **Fine-grained Token:** `github_pat_[A-Za-z0-9_]{82}`
- **OAuth App Token:** `gho_[A-Za-z0-9]{36}`
- **App Installation Token:** `ghs_[A-Za-z0-9]{36}`
- **Severity:** High — repo access, potential supply chain attack
- **Remediation:** Revoke at github.com/settings/tokens

### Slack
- **Bot Token:** `xoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24}`
- **User Token:** `xoxp-[0-9]{10,}-[0-9]{10,}-[0-9]{10,}-[a-f0-9]{32}`
- **Webhook URL:** `https://hooks\.slack\.com/services/T[A-Z0-9]{8,}/B[A-Z0-9]{8,}/[A-Za-z0-9]{24}`
- **Severity:** High
- **Remediation:** Regenerate in Slack App settings

### Supabase
- **Service Role Key:** JWT with `"role":"service_role"` — `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]{20,}`
- **Note:** Anon key is designed to be public. Service role key bypasses RLS.
- **Severity:** Critical for service_role, Low for anon key
- **Remediation:** Regenerate in Supabase Dashboard > Settings > API

### Twilio
- **Auth Token:** 32-char hex string, usually near Account SID
- **Account SID:** `AC[a-f0-9]{32}`
- **Severity:** High — SMS/call abuse
- **Remediation:** Rotate in Twilio Console

### SendGrid / Mailgun
- **SendGrid:** `SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}`
- **Mailgun:** `key-[a-f0-9]{32}`
- **Severity:** High — email abuse
- **Remediation:** Rotate in respective dashboards

### Database Connection Strings
- **PostgreSQL:** `postgres(ql)?://[^:]+:[^@]+@[^/]+/\w+`
- **MongoDB:** `mongodb(\+srv)?://[^:]+:[^@]+@`
- **MySQL:** `mysql://[^:]+:[^@]+@`
- **Redis:** `redis://:[^@]+@`
- **Severity:** Critical — direct database access
- **Remediation:** Change database password, restrict network access

### Generic Patterns
- **Private Key:** `-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----`
- **Bearer Token in Code:** `(Authorization|Bearer)\s*[:=]\s*['"][Bb]earer\s+[A-Za-z0-9._-]{20,}['"]`
- **Generic Secret Assignment:** `(secret|token|password|apikey|api_key)\s*[:=]\s*['"][A-Za-z0-9._\-/+=]{16,}['"]`

---

## Environment Variable Best Practices

### Correct Setup

```
project/
  .env              # Local dev secrets — MUST be in .gitignore
  .env.example      # Template with placeholder values — committed
  .env.local        # Local overrides — in .gitignore
  .env.production   # Production values — in .gitignore OR use CI/CD secrets
```

### .gitignore Requirements

```gitignore
# Environment files with actual values
.env
.env.local
.env.*.local
.env.production
.env.staging

# Key files
*.pem
*.key
*.p12
*.pfx

# Service account files
**/serviceAccountKey.json
**/credentials.json
**/service-account*.json

# IDE secrets
.idea/
.vscode/settings.json
```

### Frontend Environment Variables

Frameworks expose certain env vars to the client bundle:

| Framework | Public Prefix | Private (server-only) |
|-----------|--------------|----------------------|
| Next.js | `NEXT_PUBLIC_` | No prefix |
| Vite | `VITE_` | No prefix |
| Create React App | `REACT_APP_` | No prefix |
| Nuxt | `NUXT_PUBLIC_` | No prefix |
| Expo | `EXPO_PUBLIC_` | No prefix |
| SvelteKit | `PUBLIC_` | No prefix |

**Rule:** Never put actual secrets in public-prefixed variables. These are embedded in the client JavaScript bundle and visible to anyone.

**Safe public vars:** Supabase anon key, Firebase config, Stripe publishable key, analytics IDs.
**Never public:** Service role keys, API secret keys, database URLs, admin tokens.

### Validation Pattern

```javascript
// Validate required env vars at startup — fail fast
const required = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
```

---

## Git History Remediation

If a secret was ever committed to git, rotating the secret is not enough. The old value exists in git history.

### Detection

```bash
# Find deleted sensitive files
git log --all --diff-filter=D --name-only -- "*.env" "*.pem" "*.key" "*credentials*"

# Search history for patterns
git log --all -p -S "sk-" -- "*.ts" "*.js" "*.py" | head -100
git log --all -p -S "AKIA" -- "*.ts" "*.js" "*.py" | head -100
```

### Remediation Steps

1. **Rotate the secret immediately** — the old value is compromised
2. **Remove from history** using `git filter-repo` (preferred) or `BFG Repo-Cleaner`
3. **Force push** to overwrite remote history
4. **Notify team** to re-clone the repository
5. **Audit usage** — check provider logs for unauthorized access during exposure window

```bash
# Using git-filter-repo (preferred)
git filter-repo --path-glob '*.env' --invert-paths
git filter-repo --replace-text expressions.txt  # file with literal==>REMOVED lines

# Using BFG (simpler but less flexible)
bfg --delete-files '*.env'
bfg --replace-text passwords.txt
```

---

## Masking in Reports

When reporting found credentials, NEVER include the full value. Mask format:

| Type | Example |
|------|---------|
| API Key | `sk-...a1b2` (first prefix + last 4) |
| JWT | `eyJhbG...` (first 6 chars only) |
| Password | `****` (no chars shown) |
| Connection String | `postgres://user:****@host/db` |
| Private Key | `-----BEGIN PRIVATE KEY----- [REDACTED]` |

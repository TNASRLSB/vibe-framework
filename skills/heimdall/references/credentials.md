# Credentials — Environment & Remediation

API key detection patterns live in patterns/secrets.json. This file covers environment variable management, git history cleanup, and report masking.

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

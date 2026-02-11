# Credential Detection Guide

Comprehensive patterns for detecting exposed credentials in AI-generated code.

---

## Credential Patterns

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

## Detection Rules

### Generic Patterns

```regex
# API keys (hex or base64)
(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"][A-Za-z0-9+/=_-]{20,}['"]

# Passwords in code
(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]

# Private keys
-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----
```

### Provider-Specific Patterns

```regex
# Stripe
sk_(?:live|test)_[A-Za-z0-9]{24,}
rk_live_[A-Za-z0-9]{24,}

# GitHub
gh[pousr]_[A-Za-z0-9]{36,}

# Supabase service role
eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*  # with "service_role" in payload

# AWS
AKIA[A-Z0-9]{16}
aws_secret_access_key\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]

# Firebase
"private_key"\s*:\s*"-----BEGIN.*PRIVATE KEY-----
```

---

## Path-Context Severity Adjustment

The same credential has different severity depending on where it appears:

| Path Pattern | Context | Severity Adjustment |
|-------------|---------|-------------------|
| `src/components/`, `pages/`, `client/`, `public/` | Client-accessible | CRITICAL |
| `src/server/`, `api/`, `lib/server/` | Server-side | HIGH |
| `.env.example`, `docs/`, `README` | Documentation | MEDIUM (if real key) |
| `test/`, `__tests__/`, `*.test.*` | Test files | LOW (unless real key) |
| `dist/`, `build/`, `.next/` | Built bundles | CRITICAL (leaked) |

---

## Remediation Steps

### For any exposed credential:

1. **Rotate immediately** — The credential is compromised the moment it's in code
2. **Move to environment variable** — `process.env.SECRET_NAME`
3. **Add `.env` to `.gitignore`** — Prevent future exposure
4. **Check git history** — `git log -p --all -S 'credential_pattern'`
5. **Use git-filter-repo** if already pushed — Regular `git rm` doesn't remove from history

### For Supabase specifically:

- **anon key** in client: OK (designed for client use with RLS)
- **service_role key** in client: CRITICAL (bypasses all RLS)
- **service_role key** in server: OK (if properly secured)

### For Firebase specifically:

- **Web config** (apiKey, authDomain): OK in client (public by design)
- **Service account JSON**: CRITICAL anywhere except server
- **Admin SDK credentials**: CRITICAL in client

# BaaS Configuration Guide

Security audit patterns for Backend-as-a-Service platforms.

---

## Supabase

### Critical Checks

| Check | What | Severity if Failed |
|-------|------|-------------------|
| RLS enabled | Every table with user data must have RLS | CRITICAL |
| Service key exposure | `service_role` key NOT in client code | CRITICAL |
| Anon key misuse | Anon key not used for admin operations | HIGH |
| Storage bucket ACL | Buckets not publicly writable | HIGH |
| RPC security | Functions have `SECURITY DEFINER` only when needed | HIGH |

### RLS Verification

```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Tables with RLS disabled (potential issue)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### Common Misconfigurations

1. **RLS disabled on user tables** — Any client can read/write all rows
2. **Overly permissive policies** — `USING (true)` effectively disables RLS
3. **Service key in client** — Bypasses all RLS, exposes entire database
4. **Storage buckets public** — Anyone can upload/download without auth
5. **Edge functions without auth check** — Unauthenticated access to business logic

### Code Patterns to Flag

```javascript
// CRITICAL: service_role key in client
const supabase = createClient(url, 'eyJ...service_role...')

// HIGH: RLS bypass in server without justification
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
// → Verify this is intentional and necessary

// MEDIUM: Overly broad query without RLS
const { data } = await supabase.from('users').select('*')
// → If RLS is not enabled, this returns ALL users
```

---

## Firebase

### Critical Checks

| Check | What | Severity if Failed |
|-------|------|-------------------|
| Security rules | Not `allow read, write: if true` | CRITICAL |
| Service account exposure | `serviceAccountKey.json` not in client/public | CRITICAL |
| Admin SDK in client | Firebase Admin not imported in client bundles | CRITICAL |
| Database rules | Firestore/RTDB rules restrict access | HIGH |
| Storage rules | Firebase Storage rules not wide open | HIGH |

### Security Rules Verification

```javascript
// CRITICAL: Wide-open Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ← CRITICAL
    }
  }
}

// GOOD: Authenticated + ownership check
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Common Misconfigurations

1. **`allow read, write: if true`** — Wide open to the internet
2. **Service account in repo** — Check for `serviceAccountKey.json` in git
3. **Admin SDK in client bundle** — Check webpack/vite output for firebase-admin
4. **Missing rate limiting** — Firebase rules don't rate limit by default
5. **Broad collection access** — `match /{document=**}` without conditions

---

## Amplify / AWS

### Critical Checks

| Check | What | Severity if Failed |
|-------|------|-------------------|
| Cognito config | User pool not allowing self-registration when not intended | HIGH |
| IAM roles | Unauthenticated role not overly permissive | CRITICAL |
| API auth | AppSync/API Gateway requires auth | HIGH |
| S3 buckets | Not publicly accessible unless intended | CRITICAL |

---

## PocketBase

### Critical Checks

| Check | What | Severity if Failed |
|-------|------|-------------------|
| Collection rules | API rules not empty (defaults to admin-only) | HIGH |
| Admin UI | Admin dashboard not exposed in production | CRITICAL |
| Auth collection | Email/password settings secure | MEDIUM |

---

## Universal BaaS Audit Checklist

- [ ] No service/admin credentials in client code
- [ ] Database access rules enforce authentication
- [ ] Database access rules enforce authorization (row-level)
- [ ] Storage/file upload rules prevent unauthorized access
- [ ] API endpoints require authentication
- [ ] Rate limiting configured (if available)
- [ ] Audit logging enabled
- [ ] Backup configured for data

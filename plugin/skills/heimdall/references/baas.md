# BaaS Security Reference

Security audit patterns for Backend-as-a-Service platforms. Covers Supabase and Firebase — the two most common BaaS choices in AI-assisted development.

---

## Supabase

### Architecture Security Model

Supabase exposes a PostgREST API directly to the client. Security depends entirely on:
1. **Row Level Security (RLS)** policies on every table
2. Proper use of **anon key** (public) vs **service_role key** (server-only)
3. **Auth policies** that reference `auth.uid()`

### Critical: RLS Must Be Enabled

Every table that clients can access MUST have RLS enabled. Without it, the anon key grants full read/write access.

```sql
-- CHECK: RLS enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**If `rowsecurity` is `false` on any public table, that table is fully exposed.**

### Common Misconfigurations

#### 1. RLS Enabled but Policy Too Permissive

```sql
-- VULNERABLE: allows anyone to read everything
CREATE POLICY "open_select" ON users
  FOR SELECT USING (true);

-- VULNERABLE: allows any authenticated user to modify any row
CREATE POLICY "auth_update" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');
```

**Fixed:**
```sql
-- Users can only read their own data
CREATE POLICY "own_select" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "own_update" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### 2. Service Role Key in Frontend

```javascript
// CRITICAL: service_role key bypasses ALL RLS
// This must NEVER be in client-accessible code
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

**Detection:**
```
# service_role keys are longer and contain different claims than anon keys
# Look for supabase client init with non-NEXT_PUBLIC/non-VITE_ env vars
createClient\s*\(\s*[^,]+,\s*['"][^'"]{100,}['"]
createClient\s*\(\s*[^,]+,\s*process\.env\.(SUPABASE_SERVICE|SERVICE_ROLE)
```

#### 3. Missing RLS on Storage Buckets

```sql
-- Check storage bucket policies
SELECT id, name, public FROM storage.buckets;

-- Check storage object policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

#### 4. Permissive Function Security

```sql
-- VULNERABLE: function runs with definer privileges and is accessible to anon
CREATE OR REPLACE FUNCTION delete_all_users()
RETURNS void AS $$
  DELETE FROM users;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_all_users() TO anon;
```

**Fixed:**
```sql
-- Restrict to authenticated users, add auth check inside
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void AS $$
  DELETE FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
```

### Supabase Audit Checklist

- [ ] RLS enabled on ALL public tables
- [ ] Every RLS policy references `auth.uid()` (not just `auth.role()`)
- [ ] `USING` and `WITH CHECK` both present on INSERT/UPDATE policies
- [ ] service_role key is NEVER in frontend code or NEXT_PUBLIC_ vars
- [ ] Storage buckets have appropriate policies
- [ ] SECURITY DEFINER functions are minimal and access-controlled
- [ ] Edge Functions validate auth tokens
- [ ] Database functions with `SECURITY DEFINER` are audited

---

## Firebase

### Architecture Security Model

Firebase uses security rules files to control access:
- `firestore.rules` — Firestore database
- `database.rules.json` — Realtime Database
- `storage.rules` — Cloud Storage

### Critical: Default Rules Are Insecure

Firebase projects often start with test-mode rules that expire. AI-generated code frequently ships with these rules.

#### 1. Open Firestore Rules

```
// VULNERABLE: anyone can read and write everything
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Fixed:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
      allow delete: if false; // Admin only via Admin SDK
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### 2. Overly Broad Wildcard Rules

```
// VULNERABLE: nested wildcard matches everything
match /users/{userId}/{subcollection=**} {
  allow read, write: if request.auth != null;
}
```

This allows any authenticated user to read/write any subcollection under any user.

**Fixed:**
```
match /users/{userId}/posts/{postId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
match /users/{userId}/private/{docId} {
  allow read, write: if request.auth.uid == userId;
}
```

#### 3. Missing Data Validation in Rules

```
// VULNERABLE: no validation on what data is written
match /posts/{postId} {
  allow create: if request.auth != null;
}
```

**Fixed:**
```
match /posts/{postId} {
  allow create: if request.auth != null
    && request.resource.data.keys().hasAll(['title', 'content', 'authorId'])
    && request.resource.data.authorId == request.auth.uid
    && request.resource.data.title is string
    && request.resource.data.title.size() <= 200
    && request.resource.data.content is string
    && request.resource.data.content.size() <= 10000;
}
```

#### 4. Realtime Database Open Rules

```json
// VULNERABLE
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Fixed:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    ".read": false,
    ".write": false
  }
}
```

#### 5. Storage Rules Without Size/Type Limits

```
// VULNERABLE: any authenticated user can upload anything
match /uploads/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

**Fixed:**
```
match /uploads/{userId}/{fileName} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId
    && request.resource.size < 5 * 1024 * 1024  // 5MB limit
    && request.resource.contentType.matches('image/.*');  // Images only
}
```

### Firebase Audit Checklist

- [ ] No `allow read, write: if true` in any rules file
- [ ] No wildcard `{document=**}` with permissive rules
- [ ] All write rules validate data shape and types
- [ ] User-scoped data checks `request.auth.uid == userId`
- [ ] Storage rules enforce file size and content type limits
- [ ] Test-mode rules (with timestamps) are replaced before deploy
- [ ] Admin SDK operations happen server-side only
- [ ] Firebase config (apiKey, etc.) is understood as public — no secrets there

---

## General BaaS Security Principles

1. **Client-side keys are public.** Both Supabase anon key and Firebase config are designed to be public. Security comes from rules/policies, not from hiding keys.
2. **Default deny.** Start with no access and explicitly grant what's needed.
3. **Validate at the database layer.** Client-side validation is UX; server/database validation is security.
4. **Test your rules.** Both Supabase and Firebase provide rule testing tools. Use them.
5. **Audit regularly.** Rules drift as features are added. Re-audit after every schema change.

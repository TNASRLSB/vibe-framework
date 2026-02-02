# Security Checklist (Universal)

## Come Usare

```
/dev-patterns checklist security
```

Esegui questa checklist per audit di sicurezza del codice.

---

## Input Validation (CRITICAL)

- [ ] Tutti gli input utente validati (whitelist over blacklist)
- [ ] Lunghezza massima definita per stringhe
- [ ] Tipi e range verificati per valori numerici
- [ ] Format verificati (email, URL, date)
- [ ] File upload: tipo, dimensione, estensione controllati
- [ ] No path traversal (`../`)
- [ ] Encoding corretto (UTF-8)

---

## Authentication (CRITICAL)

- [ ] Password hashate con algoritmo forte (bcrypt, argon2, scrypt)
- [ ] Token con scadenza ragionevole
- [ ] Rate limiting su login (prevent brute force)
- [ ] No credenziali in URL
- [ ] Session invalidation on logout
- [ ] Session ID rigenerato dopo login

---

## Authorization (CRITICAL)

- [ ] Check autorizzazione su OGNI richiesta
- [ ] Principle of Least Privilege
- [ ] No client-side authorization come unica difesa
- [ ] Verify resource ownership (can user X access resource Y?)

---

## Injection Prevention (CRITICAL)

- [ ] Parameterized queries ALWAYS (no string concatenation in SQL)
- [ ] No shell execution con input utente
- [ ] Output encoding per XSS prevention (no `innerHTML` con dati utente)
- [ ] Content Security Policy header configurato
- [ ] HttpOnly + Secure + SameSite su cookies

---

## Secrets Management (HIGH)

- [ ] Secrets in environment variables (non in codice)
- [ ] No secrets committed to git
- [ ] No secrets in logs o error messages
- [ ] No secrets in client-side code
- [ ] Production secrets diversi da dev/staging

---

## Data Protection (HIGH)

- [ ] HTTPS everywhere
- [ ] TLS 1.2+ only
- [ ] HSTS enabled
- [ ] Sensitive data encrypted at rest (AES-256)
- [ ] No PII in logs (o mascherata)
- [ ] No stack traces in production responses

---

## HTTP Security Headers (MEDIUM)

- [ ] `Content-Security-Policy: default-src 'self'`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

---

## Dependencies (MEDIUM)

- [ ] Dependency audit passato (no known vulnerabilities)
- [ ] Lock file committed
- [ ] No deprecated dependencies with security issues
- [ ] Aggiornamenti regolari

---

## OWASP Top 10 Quick Check

| # | Risk | Verificato? |
|---|------|-------------|
| 1 | Broken Access Control | [ ] |
| 2 | Cryptographic Failures | [ ] |
| 3 | Injection | [ ] |
| 4 | Insecure Design | [ ] |
| 5 | Security Misconfiguration | [ ] |
| 6 | Vulnerable Components | [ ] |
| 7 | Auth Failures | [ ] |
| 8 | Data Integrity | [ ] |
| 9 | Logging Failures | [ ] |
| 10 | SSRF | [ ] |

---

**Riferimento completo:** `core/security.md`

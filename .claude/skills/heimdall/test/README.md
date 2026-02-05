# Heimdall Test Suite

Test files containing **intentionally vulnerable code** for validating the security scanner.

## Running Tests

```bash
# Full scan (all patterns)
python3 scripts/scanner.py test/vulnerable-samples/

# Secret detection only
python3 scripts/secret-detector.py test/vulnerable-samples/

# BaaS configuration audit
python3 scripts/baas-auditor.py test/vulnerable-samples/

# Specific file scan
python3 scripts/scanner.py test/vulnerable-samples/injection-vulnerabilities.js

# JSON output for CI/CD
python3 scripts/scanner.py test/vulnerable-samples/ --format json

# SARIF output for GitHub Security
python3 scripts/scanner.py test/vulnerable-samples/ --format sarif --output results.sarif
```

## Test Files

| File | Purpose | Expected Findings |
|------|---------|-------------------|
| `injection-vulnerabilities.js` | SQL/Command/XSS injection | ~30 CRITICAL/HIGH |
| `auth-crypto-vulnerabilities.js` | Auth & crypto weaknesses | ~25 CRITICAL/HIGH |
| `python-vulnerabilities.py` | Python-specific issues | ~20 CRITICAL/HIGH |
| `supabase-misconfig.js` | Supabase security issues | ~10 CRITICAL |
| `firebase-misconfig.js` | Firebase security issues | ~8 CRITICAL |
| `firestore.rules` | Insecure Firebase rules | ~10 CRITICAL/HIGH |
| `exposed-secrets.js` | Credential exposure | ~22 CRITICAL |

## Test Results Summary (2026-01-17)

### Core Scanner
- Files scanned: 6
- Total findings: 215
- CRITICAL: 93
- HIGH: 43
- MEDIUM: 75

### Secret Detector
- CRITICAL: 22
- HIGH: 1
- Detected: AWS, GCP, GitHub, Stripe, Slack, Twilio, OpenAI, JWT, RSA keys

### BaaS Auditor
- CRITICAL: 17
- HIGH: 2
- MEDIUM: 12
- Detected: Supabase service_role exposure, Firebase open rules, Admin SDK in client

## Validation Checklist

- [x] SQL injection detection (INJ-001, INJ-002)
- [x] Command injection detection (INJ-003, INJ-004)
- [x] XSS detection (XSS-001, XSS-002, XSS-003)
- [x] eval() detection (INJ-008)
- [x] Weak crypto detection (CF-001, CF-002)
- [x] Hardcoded credentials (SEC-001 through SEC-005)
- [x] Logic inversion detection (BAC-003) - AI-specific
- [x] JWT without verification (BAC-006)
- [x] Supabase service_role exposure
- [x] Firebase open rules
- [x] Private key detection
- [x] API key detection (20+ providers)

## Known False Positives

Some patterns may trigger on:
1. Comments containing vulnerability examples (like this test file's headers)
2. Template literals that don't actually involve SQL
3. Generic patterns matching in unexpected contexts

These can be tuned in the pattern JSON files or suppressed with:
```javascript
// heimdall-ignore: PATTERN_ID
```

# Heimdall v2 Enhancements

**Data:** 2026-02-05
**Stato:** Completato

---

## Obiettivo

Implementare 4 nuove feature per Heimdall che forniscono valore reale durante la generazione di codice AI:

1. **Diff-aware security analysis** — Rileva rimozione di controlli di sicurezza
2. **Import existence check** — Rileva package inesistenti/typo
3. **Path-context severity adjustment** — Severità dinamica basata sul path
4. **"Did you mean?" suggestions** — Suggerimenti inline per pattern sicuri

---

## Feature 1: Diff-Aware Security Analysis

### Problema
L'iteration tracker conta solo le modifiche, non analizza *cosa* cambia. Se un'iterazione rimuove un `if (auth)` check, questo è peggio di 10 iterazioni innocue.

### Soluzione
Aggiungere analisi diff nel `post-tool-scanner.py` che:
1. Salva una copia del contenuto pre-edit in memoria/state
2. Confronta old vs new content
3. Rileva rimozione di pattern di sicurezza

### Pattern di sicurezza da tracciare

```python
SECURITY_PATTERNS = {
    "auth_check": [
        r"if\s*\(\s*!?\s*(auth|session|user|token|isAuth|isLoggedIn)",
        r"requireAuth|checkAuth|verifyAuth|authenticate",
        r"middleware\s*\.\s*(auth|protect|guard)",
    ],
    "validation": [
        r"validate|sanitize|escape|purify",
        r"zod\.|yup\.|joi\.",
        r"\.parse\s*\(|\.validate\s*\(",
    ],
    "rate_limiting": [
        r"rateLimit|throttle|limiter",
        r"express-rate-limit|rate-limiter",
    ],
    "access_control": [
        r"\.can\s*\(|hasPermission|hasRole|isAdmin",
        r"rbac|acl|permission",
    ],
    "crypto": [
        r"bcrypt|argon2|scrypt|pbkdf2",
        r"crypto\.random|randomBytes|randomUUID",
    ]
}
```

### Comportamento

| Scenario | Azione |
|----------|--------|
| Pattern sicurezza rimosso | WARNING immediato + log |
| >2 pattern sicurezza rimossi in una edit | HIGH alert |
| Pattern auth rimosso da file auth-related | CRITICAL |

### File da modificare

| File | Modifiche |
|------|-----------|
| `scripts/diff-analyzer.py` | **NUOVO** - Modulo analisi diff |
| `hooks/pre-tool-validator.py` | Salva contenuto originale |
| `hooks/post-tool-scanner.py` | Chiama diff analyzer |
| `state.json` schema | Aggiunge `security_patterns_removed` |

### Implementazione

```python
# diff-analyzer.py (nuovo file)
class DiffAnalyzer:
    def __init__(self, security_patterns: dict):
        self.patterns = {k: [re.compile(p, re.I) for p in v]
                        for k, v in security_patterns.items()}

    def find_security_patterns(self, content: str) -> dict[str, list[int]]:
        """Find all security patterns and their line numbers"""
        results = {}
        lines = content.split('\n')
        for category, patterns in self.patterns.items():
            results[category] = []
            for i, line in enumerate(lines, 1):
                if any(p.search(line) for p in patterns):
                    results[category].append(i)
        return results

    def analyze_diff(self, old_content: str, new_content: str) -> DiffResult:
        """Compare old vs new and find removed security patterns"""
        old_patterns = self.find_security_patterns(old_content)
        new_patterns = self.find_security_patterns(new_content)

        removed = {}
        for category in old_patterns:
            old_count = len(old_patterns[category])
            new_count = len(new_patterns.get(category, []))
            if new_count < old_count:
                removed[category] = old_count - new_count

        return DiffResult(
            removed_patterns=removed,
            severity=self._calculate_severity(removed)
        )
```

---

## Feature 2: Import Existence Check

### Problema
AI a volte suggerisce package che non esistono o con typo.

### Soluzione
Database statico dei ~2000 package più comuni per ecosistema + pattern typo comuni.

### File

| File | Contenuto |
|------|-----------|
| `data/known-packages.json` | **NUOVO** - Lista package noti |
| `scripts/import-checker.py` | **NUOVO** - Verifica import |

### Struttura dati

```json
{
  "javascript": {
    "packages": [
      "react", "react-dom", "next", "express", "lodash", "axios",
      "typescript", "vite", "webpack", "tailwindcss", "prisma",
      "zod", "joi", "yup", "bcrypt", "jsonwebtoken", "uuid",
      "@supabase/supabase-js", "firebase", "@prisma/client"
      // ... top ~500 npm packages
    ],
    "scoped_prefixes": ["@types/", "@testing-library/", "@tanstack/"],
    "common_typos": {
      "loadash": "lodash",
      "axois": "axios",
      "expresss": "express",
      "reacct": "react"
    }
  },
  "python": {
    "packages": [
      "requests", "flask", "django", "fastapi", "numpy", "pandas",
      "sqlalchemy", "pydantic", "pytest", "black", "mypy",
      "bcrypt", "cryptography", "python-jose", "passlib"
      // ... top ~500 pypi packages
    ],
    "common_typos": {
      "reqeusts": "requests",
      "pands": "pandas",
      "nupy": "numpy"
    }
  }
}
```

### Logica

```python
class ImportChecker:
    def check_imports(self, content: str, file_ext: str) -> list[ImportIssue]:
        issues = []
        imports = self.extract_imports(content, file_ext)

        for imp in imports:
            # Check typos first
            if typo_suggestion := self.known_typos.get(imp):
                issues.append(ImportIssue(
                    package=imp,
                    severity="HIGH",
                    message=f"Possible typo: '{imp}' → did you mean '{typo_suggestion}'?"
                ))
            # Check if unknown
            elif not self.is_known_package(imp, file_ext):
                issues.append(ImportIssue(
                    package=imp,
                    severity="MEDIUM",
                    message=f"Unknown package '{imp}' - verify it exists"
                ))

        return issues
```

### Integrazione

Aggiungere check in `post-tool-scanner.py` dopo Write/Edit di file `.js`, `.ts`, `.py`.

---

## Feature 3: Path-Context Severity Adjustment

### Problema
`service_role` key è CRITICAL in `src/components/` ma INFO in `src/server/`.

### Soluzione
Aggiungere `path_contexts` ai pattern che modificano severità.

### Struttura pattern estesa

```json
{
  "id": "SUPA-002",
  "name": "Service role key in code",
  "pattern": "...",
  "base_severity": "HIGH",
  "path_contexts": [
    {
      "match": ["src/components/", "src/app/", "pages/", "public/"],
      "severity": "CRITICAL",
      "reason": "Service role key in client-accessible code"
    },
    {
      "match": ["src/server/", "api/", "server/", "backend/"],
      "severity": "MEDIUM",
      "reason": "Service role in server code - verify env var usage"
    },
    {
      "match": ["*.test.*", "*.spec.*", "__tests__/", "test/"],
      "severity": "LOW",
      "reason": "Service role in test files - likely mock"
    }
  ]
}
```

### File da modificare

| File | Modifiche |
|------|-----------|
| `patterns/secrets.json` | Aggiunge `path_contexts` ai pattern Supabase/Firebase |
| `patterns/baas-misconfig.json` | Aggiunge `path_contexts` |
| `scripts/scanner.py` | Logica per applicare path_contexts |

### Implementazione scanner

```python
def _adjust_severity_by_path(self, finding: Finding, file_path: str, pattern_data: dict) -> str:
    """Adjust severity based on file path context"""
    path_contexts = pattern_data.get('path_contexts', [])

    for ctx in path_contexts:
        for pattern in ctx['match']:
            if fnmatch.fnmatch(file_path, f"*{pattern}*"):
                return ctx['severity']

    return pattern_data.get('severity', 'MEDIUM')
```

---

## Feature 4: "Did You Mean?" Suggestions

### Problema
Trovare un pattern insicuro è utile, ma avere subito il fix è meglio.

### Soluzione
Aggiungere `secure_alternative` ai pattern con codice pronto all'uso.

### Struttura pattern estesa

```json
{
  "id": "ID-004",
  "name": "Math.random for tokens",
  "pattern": "Math\\.random\\(\\).*(?:token|secret|key|id)",
  "severity": "HIGH",
  "secure_alternative": {
    "description": "Use cryptographically secure random",
    "javascript": "crypto.randomUUID()",
    "typescript": "crypto.randomUUID()",
    "node": "crypto.randomBytes(32).toString('hex')"
  }
}
```

```json
{
  "id": "XSS-001",
  "name": "innerHTML assignment",
  "pattern": "innerHTML\\s*=",
  "severity": "HIGH",
  "secure_alternative": {
    "description": "Use safe DOM methods or sanitize",
    "vanilla": "element.textContent = userInput",
    "with_html": "element.innerHTML = DOMPurify.sanitize(userInput)",
    "react": "Use JSX escaping (default safe) or sanitize with dompurify"
  }
}
```

### File da modificare

| File | Modifiche |
|------|-----------|
| `patterns/owasp-top-10.json` | Aggiunge `secure_alternative` ai pattern |
| `scripts/scanner.py` | Include alternative nel Finding output |
| Output formatter | Mostra "Did you mean?" |

### Output esempio

```
HIGH [ID-004] Math.random() used for token generation
Location: src/auth/token.ts:45

Did you mean?
  → crypto.randomUUID()
  → crypto.randomBytes(32).toString('hex')
```

---

## Piano di implementazione

### Fase 1: Data structures e utilities (nuovi file)

| Task | File | Effort |
|------|------|--------|
| 1.1 | Crea `scripts/diff-analyzer.py` | ~100 righe |
| 1.2 | Crea `data/known-packages.json` | ~200 righe JSON |
| 1.3 | Crea `scripts/import-checker.py` | ~80 righe |

### Fase 2: Pattern updates

| Task | File | Effort |
|------|------|--------|
| 2.1 | Aggiungi `path_contexts` a `secrets.json` | ~50 righe |
| 2.2 | Aggiungi `path_contexts` a `baas-misconfig.json` | ~30 righe |
| 2.3 | Aggiungi `secure_alternative` a `owasp-top-10.json` | ~100 righe |

### Fase 3: Scanner integration

| Task | File | Effort |
|------|------|--------|
| 3.1 | Modifica `scanner.py` - path context | ~30 righe |
| 3.2 | Modifica `scanner.py` - secure alternatives | ~20 righe |
| 3.3 | Modifica `OutputFormatter` - did you mean | ~40 righe |

### Fase 4: Hook integration

| Task | File | Effort |
|------|------|--------|
| 4.1 | Modifica `pre-tool-validator.py` - save original | ~20 righe |
| 4.2 | Modifica `post-tool-scanner.py` - diff analysis | ~40 righe |
| 4.3 | Modifica `post-tool-scanner.py` - import check | ~30 righe |

### Fase 5: Testing e docs

| Task | File | Effort |
|------|------|--------|
| 5.1 | Test samples per diff analysis | ~5 file |
| 5.2 | Aggiorna `SKILL.md` | ~50 righe |

---

## Verifica

### Test diff analysis
- [ ] Edit che rimuove `if (auth)` → WARNING
- [ ] Edit che rimuove multiple auth checks → HIGH
- [ ] Edit che aggiunge codice senza rimuovere security → OK

### Test import check
- [ ] `import lodash` → OK
- [ ] `import loadash` → "Did you mean lodash?"
- [ ] `import nonexistent-pkg` → WARNING

### Test path context
- [ ] `service_role` in `src/components/Button.tsx` → CRITICAL
- [ ] `service_role` in `src/server/api.ts` → MEDIUM
- [ ] `service_role` in `test/auth.test.ts` → LOW

### Test secure alternative
- [ ] `Math.random()` trovato → mostra `crypto.randomUUID()`
- [ ] `innerHTML =` trovato → mostra `textContent` e DOMPurify

---

## Stima effort totale

| Fase | Righe codice | Tempo stimato |
|------|--------------|---------------|
| 1. Data structures | ~380 | - |
| 2. Pattern updates | ~180 | - |
| 3. Scanner | ~90 | - |
| 4. Hooks | ~90 | - |
| 5. Testing/docs | ~50+ | - |
| **TOTALE** | **~800 righe** | - |

---

## Note implementative

1. **Diff analysis**: Il contenuto originale può essere ottenuto leggendo il file prima che il pre-hook lo modifichi. Alternativa: usare git diff se disponibile.

2. **Import check offline**: Non richiede network calls. La lista ~2000 package copre 95%+ degli use case reali.

3. **Path matching**: Usare `fnmatch` per semplicità, supporta glob patterns.

4. **Backwards compatibility**: I nuovi campi nei pattern (`path_contexts`, `secure_alternative`) sono opzionali - scanner esistente continua a funzionare.

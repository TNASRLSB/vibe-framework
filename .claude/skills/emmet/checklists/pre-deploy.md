# Pre-Deploy Checklist (Universal)

## Come Usare

```
/emmet checklist pre-deploy
```

Esegui questa checklist prima di ogni deploy in production.

---

## Security (CRITICAL)

### Secrets & Configuration
- [ ] Secrets in environment variables (non in codice)
- [ ] No secrets committed to git
- [ ] Production secrets different from dev/staging
- [ ] Secrets rotation up to date

### Application Security
- [ ] Debug mode disabilitato
- [ ] Error messages generici (no stack traces)
- [ ] HTTPS enforced
- [ ] CORS configurato correttamente
- [ ] Rate limiting attivo
- [ ] Security headers configured
- [ ] Authentication working

### Dependencies
- [ ] Dependency audit passato (no known vulnerabilities)
- [ ] Dependencies locked (lock file committed)
- [ ] No deprecated dependencies with security issues

```bash
# Example dependency checks
npm audit           # Node.js
pip-audit           # Python
cargo audit         # Rust
bundle audit        # Ruby
```

---

## Quality (HIGH)

### Tests
- [ ] Tutti i test passano
- [ ] Test coverage acceptable
- [ ] No skipped tests without reason
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)

### Code Quality
- [ ] Linting passato
- [ ] Type checking passato (se applicabile)
- [ ] No console.log/print statements
- [ ] No TODO comments blocking release
- [ ] No debug code

### Build
- [ ] Build production riuscita
- [ ] Build artifacts verified
- [ ] Bundle size acceptable
- [ ] No build warnings (or all reviewed)

```bash
# Example quality checks
npm run lint && npm run typecheck && npm run test && npm run build
```

---

## Database (HIGH)

### Migrations
- [ ] Database migrations ready
- [ ] Migrations tested on staging
- [ ] Migrations are reversible (if possible)
- [ ] Backup taken before migration
- [ ] Migration order verified

### Data
- [ ] No destructive changes without confirmation
- [ ] Data validation in place
- [ ] Indexes created for new queries
- [ ] Query performance verified

---

## Operations (MEDIUM)

### Monitoring & Logging
- [ ] Logging configurato per production
- [ ] Log level appropriate (not debug)
- [ ] No sensitive data in logs
- [ ] Monitoring dashboards ready
- [ ] Alerts configured

### Health & Recovery
- [ ] Health check endpoint funzionante
- [ ] Readiness/liveness probes configured
- [ ] Rollback plan defined and tested
- [ ] Backup/restore procedure verified

### Infrastructure
- [ ] Sufficient resources allocated
- [ ] Auto-scaling configured (if needed)
- [ ] Load balancer configured
- [ ] SSL certificates valid

---

## Documentation (LOW)

- [ ] CHANGELOG aggiornato
- [ ] Version number aggiornato
- [ ] Release notes scritte
- [ ] API documentation updated (if changed)
- [ ] Runbook updated (if needed)

---

## Feature Flags (if applicable)

- [ ] New features behind flags
- [ ] Flag defaults appropriate for production
- [ ] Kill switch available for critical features
- [ ] Flag cleanup planned for old features

---

## Communication

### Internal
- [ ] Team notified of deploy
- [ ] On-call aware of changes
- [ ] Support team briefed (if user-facing changes)

### External (if applicable)
- [ ] Customer notification sent (for breaking changes)
- [ ] Status page updated
- [ ] Documentation published

---

## Deploy Process

### Pre-Deploy
```
1. [ ] Pull latest from main branch
2. [ ] Run full test suite
3. [ ] Build production artifacts
4. [ ] Tag release version
```

### Deploy
```
1. [ ] Deploy to staging first
2. [ ] Verify staging
3. [ ] Deploy to production (canary if available)
4. [ ] Monitor initial traffic
```

### Post-Deploy
```
1. [ ] Verify health checks
2. [ ] Check error rates
3. [ ] Verify key flows manually
4. [ ] Monitor for 15-30 minutes
5. [ ] Confirm success or rollback
```

---

## Rollback Plan

### Triggers for Rollback
- Error rate > X% (define threshold)
- Key functionality broken
- Security issue discovered
- Performance degradation > Y%

### Rollback Steps
```
1. [ ] Identify issue
2. [ ] Notify team
3. [ ] Execute rollback
4. [ ] Verify rollback successful
5. [ ] Communicate status
6. [ ] Post-mortem scheduled
```

---

## Environment-Specific

### Staging
- [ ] Mirrors production config
- [ ] Has production-like data (sanitized)
- [ ] All integrations connected

### Production
- [ ] Final verification complete
- [ ] Deployment window confirmed
- [ ] Emergency contacts available

---

## Quick Reference

### Go/No-Go Criteria

| Category | Must Pass | Can Defer |
|----------|-----------|-----------|
| Security | All | None |
| Tests | All | Flaky (with ticket) |
| Build | Pass | Warnings (reviewed) |
| Migrations | Tested | - |
| Monitoring | Basic | Advanced |
| Docs | Changelog | Full docs |

### Red Flags - Do NOT Deploy
- [ ] Failing tests
- [ ] Security vulnerabilities
- [ ] Missing migrations
- [ ] No rollback plan
- [ ] Key person unavailable
- [ ] End of week/before holiday
- [ ] Major event happening

---

## Post-Deploy Verification

### Immediate (0-5 min)
- [ ] Application is up
- [ ] Health checks pass
- [ ] No error spike in logs

### Short-term (5-30 min)
- [ ] Error rates normal
- [ ] Response times normal
- [ ] Key flows working
- [ ] No customer complaints

### Medium-term (1-24 hours)
- [ ] Metrics stable
- [ ] No memory leaks
- [ ] Background jobs running
- [ ] Scheduled tasks executing

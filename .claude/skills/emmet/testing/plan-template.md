# Test Plan Template

## Overview

Template per generare piano di test con `/emmet plan`.

---

## Template

```markdown
# Test Plan: [Feature/Scope Name]

**Date:** YYYY-MM-DD
**Scope:** [Path or feature being tested]
**Spec Reference:** [Link to spec if available]

---

## 1. Feature Summary

[1-2 sentences describing what is being tested]

---

## 2. Test Coverage Matrix

### Static Tests

| Area | Priority | Test Cases |
|------|----------|------------|
| Security | Critical | [List specific checks] |
| Logic | High | [List specific checks] |
| Error Handling | High | [List specific checks] |
| Performance | Medium | [List specific checks] |
| Code Quality | Low | [List specific checks] |

### Dynamic Tests (User Journeys)

| Flow | Priority | Test Cases |
|------|----------|------------|
| [Flow 1] | Critical | [List user actions to test] |
| [Flow 2] | High | [List user actions to test] |
| [Flow 3] | Medium | [List user actions to test] |

---

## 3. Critical Paths

List the most important paths that MUST work:

1. **[Path 1]:** [Description]
   - Entry point: [Where user starts]
   - Expected outcome: [What should happen]
   - Failure impact: [What breaks if this fails]

2. **[Path 2]:** [Description]
   - Entry point:
   - Expected outcome:
   - Failure impact:

---

## 4. Edge Cases

| Case | Input | Expected | Priority |
|------|-------|----------|----------|
| Empty input | `""` | [Expected behavior] | High |
| Max length | `[max chars]` | [Expected behavior] | Medium |
| Special chars | `<script>` | [Expected behavior] | High |
| Null/undefined | `null` | [Expected behavior] | High |
| Concurrent access | [Multiple users] | [Expected behavior] | Medium |

---

## 5. Integration Points

| System | Type | What to verify |
|--------|------|----------------|
| [Database] | Read/Write | [Specific checks] |
| [API] | External | [Specific checks] |
| [Auth] | Internal | [Specific checks] |

---

## 6. Environment Requirements

- [ ] Local development server running
- [ ] Test database seeded
- [ ] Mock services configured
- [ ] Test user accounts created
- [ ] Environment variables set

---

## 7. Test Execution Order

### Phase 1: Static Analysis
1. Run `/emmet test` on scope
2. Review and fix Critical/High issues
3. Document remaining issues

### Phase 2: Unit Tests (if applicable)
1. Run existing test suite
2. Note failures
3. Add missing coverage

### Phase 3: Journey Tests
1. Test Critical flows first
2. Test High priority flows
3. Test Medium priority flows
4. Document all failures

### Phase 4: Report Generation
1. Run `/emmet report`
2. Review findings
3. Prioritize fixes

---

## 8. Success Criteria

- [ ] No Critical security issues
- [ ] No High severity bugs in critical paths
- [ ] All core user journeys pass
- [ ] Error handling works as expected
- [ ] Performance acceptable (define thresholds)

---

## 9. Out of Scope

- [List what is NOT being tested]
- [Explain why]

---

## 10. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [Impact] | [How to handle] |
| [Risk 2] | [Impact] | [How to handle] |
```

---

## Usage

When `/emmet plan [scope]` is invoked:

1. **Read scope** - Understand what code/features are in scope
2. **Read specs** - Check `.claude/docs/specs/` for requirements
3. **Analyze code** - Identify critical paths, integrations, edge cases
4. **Generate plan** - Fill template with specific tests
5. **Output** - Save to `.claude/docs/test-plan.md`

The plan becomes the guide for subsequent `/emmet test` and `/emmet journey` commands.

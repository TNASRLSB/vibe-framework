# Architectural Decisions

**Why things are the way they are.**

When I make a choice that affects future work, I record it here. This prevents me from proposing contradictory approaches later.

---

## Format

```markdown
### [Short title]
**Date:** YYYY-MM-DD
**Decision:** What was decided
**Why:** Why this over alternatives
**Affects:** What this impacts going forward
```

---

## Decisions

### Manual GitHub Releases via gh CLI
**Date:** 2026-02-20
**Decision:** Releases are created manually with `gh release create`, no CI/CD automation.
**Why:** The framework is a collection of files copied by `framework.sh`, not a library with build/test pipelines. GitHub Actions would add YAML maintenance overhead for zero benefit. `gh` CLI works directly from the terminal and Claude Code can assist with releases.
**Affects:** Release process documented in `RELEASING.md`. No `.github/workflows/` directory. Version bumps are manual (edit `VERSION` + `CHANGELOG.md`).

### Project renamed to VIBE Framework
**Date:** 2026-02-20
**Decision:** Renamed from "Claude Development Framework" to "VIBE Framework". Display name: "VIBE Framework". Repo: `vibe-framework`.
**Why:** Disambiguates the framework (a product) from "Claude Code" (Anthropic's tool). References to "Claude Code" in skill files are intentional and unchanged — they refer to the Anthropic product.
**Affects:** All docs, banner output, example paths use "VIBE Framework". "Claude Operating System" in CLAUDE.md stays as-is (conceptual metaphor for Claude's process rules, not a product name).

---

*When I'm about to make an architectural choice, I check here first to stay consistent.*

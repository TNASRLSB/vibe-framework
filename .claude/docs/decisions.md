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

### Automated GitHub Releases via GitHub Actions
**Date:** 2026-02-20
**Decision:** Releases are automated via GitHub Actions. Pushing a tag matching `v*` triggers `.github/workflows/release.yml`, which verifies `VERSION` matches the tag and creates a GitHub Release with notes extracted from `CHANGELOG.md`.
**Why:** Eliminates manual `gh release create` step. The workflow is minimal (single job, no build/test) so maintenance overhead is negligible.
**Affects:** Release process: update `VERSION` + `CHANGELOG.md` → commit → `git tag vX.Y.Z && git push && git push origin vX.Y.Z`. The Action handles the rest.

### Installer script renamed to vibe-framework.sh
**Date:** 2026-02-20
**Decision:** Renamed `framework.sh` to `vibe-framework.sh`.
**Why:** Consistent with the project rename to VIBE Framework. Makes the script immediately identifiable.
**Affects:** All docs updated. The script uses `$0` internally so no logic changes needed.

### Automatic update check in vibe-framework.sh
**Date:** 2026-02-20
**Decision:** The installer script checks the GitHub API for the latest release on startup and warns the user if a newer version is available.
**Why:** Users clone the repo once and may forget to `git pull`. The check uses `curl` with a 3-second timeout, so it's transparent when offline.
**Affects:** Requires network access for the check (gracefully degrades if unavailable).

### Project renamed to VIBE Framework
**Date:** 2026-02-20
**Decision:** Renamed from "Claude Development Framework" to "VIBE Framework". Display name: "VIBE Framework". Repo: `vibe-framework`.
**Why:** Disambiguates the framework (a product) from "Claude Code" (Anthropic's tool). References to "Claude Code" in skill files are intentional and unchanged — they refer to the Anthropic product.
**Affects:** All docs, banner output, example paths use "VIBE Framework". "Claude Operating System" in CLAUDE.md stays as-is (conceptual metaphor for Claude's process rules, not a product name).

### Orson v6 Runtime: Parallel Spring Solver in Inline JS
**Date:** 2026-02-23
**Decision:** The runtime inline JS has its own lightweight spring solver (~25 lines, Euler integration) rather than importing from `interpolate.ts`. Same for Perlin noise (~40 lines) vs. an npm package.
**Why:** The runtime is a self-contained JS string embedded in video HTML. It cannot import modules. The inline implementations are intentionally minimal — just enough for frame-by-frame rendering in the browser. `interpolate.ts` has a server-side spring with caching; the runtime solver is simpler but functionally equivalent.
**Affects:** `runtime.ts` has `SP()` and `__noise2D()` that duplicate concepts from `interpolate.ts` and `@remotion/noise`. This is by design — not technical debt.

### Orson v6: Auto-Start is Backward Compatible
**Date:** 2026-02-23
**Decision:** Auto-start only activates when `scenes[0].start === undefined`. Existing videos with explicit `start` values are unaffected.
**Why:** Zero risk of regression. Claude can adopt auto-start gradually.
**Affects:** New videos should omit `start` from scenes (simpler, less error-prone). Old videos work unchanged.

---

*When I'm about to make an architectural choice, I check here first to stay consistent.*

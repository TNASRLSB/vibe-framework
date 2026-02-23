# Codebase Registry

**Last updated:** 2026-02-23

This is my memory. I update it as I learn. I check it before making claims.

---

## Skills

| Name | Location | Purpose |
|------|----------|---------|
| Seurat | `.claude/skills/seurat/` | UI design system, wireframing, page layout, WCAG accessibility |
| Emmet | `.claude/skills/emmet/` | Testing, QA, tech debt audit, functional mapping, unit tests |
| Heimdall | `.claude/skills/heimdall/` | AI-specific security analysis, OWASP Top 10, credential detection |
| Ghostwriter | `.claude/skills/ghostwriter/` | SEO + GEO dual optimization, persuasive copywriting |
| Baptist | `.claude/skills/baptist/` | CRO orchestrator, A/B testing, funnel analysis |
| Orson | `.claude/skills/orson/` | Programmatic video generation, demo recording with audio |
| Scribe | `.claude/skills/scribe/` | Office documents (xlsx, docx, pptx) and PDF handling |
| Forge | `.claude/skills/forge/` | Meta-skill for creating, auditing, and maintaining skills |

---

## Components

| Name | Type | Location | Purpose |
|------|------|----------|---------|
| | | | |

---

## Key Functions

| Function | Location | Lines | What it does |
|----------|----------|-------|--------------|
| `getAnimationRuntime()` | `orson/engine/src/runtime.ts` | 18-393 | Returns the v6 inline JS runtime string |
| `window.SP()` | runtime (inline) | — | Spring physics animation (damped harmonic oscillator) |
| `window.N()` | runtime (inline) | — | Perlin noise-driven organic movement |
| `window.D()` | runtime (inline) | — | SVG path draw animation (strokeDashoffset) |
| `window.P()` | runtime (inline) | — | Particle system with noise-driven drift |
| `window.R()` | runtime (inline) | — | Deterministic seeded random |
| `getParticleScript()` | `orson/engine/src/decorative.ts` | — | Returns P() call for scene particle setup |
| `setProp()` | runtime (inline) | — | Shared property setter (13 props), used by applyAnim/applySpring |
| `selectEntranceByRole()` | `orson/engine/src/actions.ts` | 1239-1260 | Role-based animation selection (with v6 hints in JSDoc) |

---

## API Endpoints

| Method | Route | Handler | Auth required |
|--------|-------|---------|---------------|
| | | | |

---

## Database

### Tables
| Table | Key columns | Used by |
|-------|-------------|---------|
| | | |

### Important queries
| Name | Location | What it does |
|------|----------|--------------|
| | | |

---

## Data Flows

*Document important data flows here.*

---

## External Dependencies

| Package | Version | Used for |
|---------|---------|----------|
| | | |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| | | |

---

## Notes

**Orson v6 anti-monotonia rules:** Every video MUST use at least 1x SP(), 1x N(), 1x D(), 1x P()/N()-ambient. Checklist in SKILL.md §3.1b checks D2.21-24. Safe emphasis pool expanded to 7 (was 3). ROLE_ANIMATION_MAP has v6 hints in JSDoc. Entrance diversity requires 5 types from ≥3 families (not 5 variants of fade).


---

## How I Use This

1. **Before claiming something exists:** `grep "name" .claude/docs/registry.md`
2. **After discovering something:** Add it here immediately
3. **Before implementing:** Check what's already here
4. **After implementing:** Update with new components/functions

**If I'm about to write code that calls a function not listed here, I STOP and verify it exists first.**

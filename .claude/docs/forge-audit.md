# Forge Audit — 2026-02-14

## Metrics

| Skill | Words | Lines | Desc Words | Status | Recommended Actions |
|-------|-------|-------|------------|--------|---------------------|
| baptist | 1879 | 336 | 40 | OK | Trim (3 sections), Move (1) |
| emmet | 1299 | 326 | 20 | OK | Improve (frontmatter), Move (1) |
| forge | 893 | 197 | 56 | OK | None — reference skill |
| ghostwriter | 1752 | 365 | 37 | OK | Move (2 sections) |
| heimdall | 1657 | 476 | 37 | OK | Trim (1), Move (2), Split (1) |
| **orson** | **2898** | **602** | 52 | **WARN** | Split (2), Move (2), Trim (1) — at 97% budget |
| scribe | 1099 | 213 | 58 | OK | Move (2 sections) |
| seurat | 1645 | 359 | 47 | OK | Move (2 sections) |

---

## Baptist (1879 words)

### Trim (→ KNOWLEDGE.md)

- **Fogg B=MAP explanation** (lines 52-69): Opus already knows the Fogg Behavior Model. Only the framework-specific delegation mapping ("Delegate copy to Ghostwriter, UI to Seurat") changes Claude's behavior. The M/A/P definitions and examples don't. Keep delegation rules (~3 lines per factor), move theory to KNOWLEDGE.md.
  - Estimated reduction: -40% of section (~60 words)

- **A/B Testing Methodology** (lines 183-222): Sample size formula, quick reference table, statistical requirements, and experiment integrity checks are standard CRO knowledge. Claude can compute sample sizes without the table. Keep only: "pre-register experiments, 95% CI, 80% power, minimum 7-14 days, no peeking". Move formula, table, and checklist to KNOWLEDGE.md.
  - Estimated reduction: -70% of section (~200 words)

- **CRO Process Framework** (lines 77-86): Generic 6-step CRO process (ANALYZE → HYPOTHESIZE → PRIORITIZE → TEST → LEARN → IMPLEMENT). Claude already knows this workflow. Move entirely to KNOWLEDGE.md.
  - Estimated reduction: -100% of section (~50 words)

### Keep

- **Identity** (lines 17-34): DO/DON'T boundaries define behavior. Framework-specific.
- **CRO Mental Model table** (lines 37-46): Clarifies role boundaries with other skills.
- **Commands** (lines 90-179): Framework-specific. All needed.
- **ICE Prioritization** (lines 226-242): Used in output format. Brief enough.
- **Integration Protocol** (lines 254-286): Framework-specific orchestration.
- **Multi-Skill Orchestration** (lines 313-322): Task tool usage pattern.
- **Operational Notes** (lines 326-337): Behavioral constraints.

### Move (→ KNOWLEDGE.md)

- **CRO Process Framework** (lines 77-86): User education, Claude doesn't need it.

### Cross-skill overlap

- Integration Protocol (Baptist ↔ Ghostwriter ↔ Seurat) is described from three perspectives. Acceptable — each skill needs its own view. No consolidation needed.

**Total estimated reduction: ~310 words (-16%)**

---

## Emmet (1299 words)

### Improve (Frontmatter)

- **Description too terse** (20 words). Current: "Testing, debugging, tech debt audit, and code quality checklists. Complete testing cycle with static analysis and dynamic Playwright tests."
- **Recommended**: "Testing, debugging, tech debt audit, and code quality checklists. Complete testing cycle with static analysis and dynamic Playwright tests. Use when running tests, finding bugs, debugging code, auditing code quality, checking tech debt, doing code review, or pre-deploy checks. Triggers on 'test', 'debug', 'QA', 'tech debt', 'code review', 'pre-deploy', 'checklist'."

### Move (→ KNOWLEDGE.md)

- **Directory Structure** (lines 277-301): Directory listing that Claude can discover via the filesystem. Useful for human orientation only.
  - Estimated reduction: ~100 words

### Keep

- All commands, workflows, integration sections, visual testing, security pre-check. Lean and well-structured.

**Total estimated reduction: ~100 words (-8%)**

---

## Forge (893 words)

### Keep — All sections

Forge is the leanest skill and follows its own best practices. No trim, split, or dedup needed.

**Status: Reference model for other skills.**

---

## Ghostwriter (1752 words)

### Move (→ KNOWLEDGE.md)

- **File Structure** (lines 228-237): Directory listing of `.ghostwriter/` output files. Claude can discover this. Useful for human orientation only.
  - Estimated reduction: ~50 words

- **Resources** (lines 355-366): Directory listing of subdirectories. Purely navigational — Claude reads files on-demand via routing already established in the On-Demand References section.
  - Estimated reduction: ~60 words

### Keep

- **Identity + Prime Directives** — Framework-specific behavioral rules.
- **Commands** — All needed.
- **On-Demand References** — Routing table, essential.
- **Operational Framework** — Generation system, technical infrastructure requirements (based on real audit failures), validation system, reference system. All framework-specific.
- **Integration** — Cross-skill delegation.

### Note

- **Technical Infrastructure Requirements table** (lines 264-280): Contains specific failure evidence from past audits (Cumino, TNA, Hype). This is high-value framework-specific knowledge — NOT generic. Keep.

**Total estimated reduction: ~110 words (-6%)**

---

## Heimdall (1657 words)

### Trim (→ KNOWLEDGE.md)

- **OWASP Top 10 table** (lines 198-211): Lists 10 categories with pattern counts and example detections. Opus inherently knows OWASP Top 10. Replace with one-liner: "Covers all OWASP Top 10 categories (60+ patterns). For per-category details, see `patterns/owasp-top-10.json`." Move table to KNOWLEDGE.md.
  - Estimated reduction: ~80 words

### Move (→ KNOWLEDGE.md)

- **v2.0 File Structure** (lines 452-477): Directory listing. Claude can discover files via filesystem.
  - Estimated reduction: ~70 words

- **Iteration tracking JSON example** (lines 270-278): The JSON schema example is reference material. Claude needs the warning escalation table but not the JSON format example.
  - Estimated reduction: ~30 words

### Split (→ references/)

- **Hook Configuration JSON** (lines 304-335): 30 lines of JSON config example. This is installation reference, not behavioral. Move to `references/hook-setup.md`. Keep one-liner routing: "For hook configuration, read `references/hook-setup.md`."
  - Estimated reduction: ~100 words

### Keep

- **Identity + Prime Directive** — Behavioral.
- **Threat Model categories** — Framework-specific (AI-specific, not standard security).
- **Commands** — All needed.
- **AI-Specific Patterns table** — Framework-specific, not available in standard knowledge.
- **Enforcement Rules** — Behavioral.
- **Iteration Tracking escalation table** — Behavioral.
- **State Management files list** — Brief, needed for operation.
- **v2.0 Features** — Behavioral (diff-aware, import checking).
- **Troubleshooting** — Practical.

**Total estimated reduction: ~280 words (-17%)**

---

## Orson (2898 words — 97% of budget)

**Priority: HIGH.** At 2898 words, this skill is at the budget ceiling. Any growth will exceed 3000 words.

### Split (→ references/)

- **Demo Script JSON example** (lines 437-481): 44 lines of JSON format specification. Move to `references/demo-format.md`. Keep one-liner routing in SKILL.md.
  - Estimated reduction: ~250 words

- **"How to add new TTS engine"** (lines 313-323): Step-by-step guide for extending the TTS system. Reference material, not needed for daily operation. Move to `references/tts-extension.md`.
  - Estimated reduction: ~80 words

### Move (→ KNOWLEDGE.md)

- **Reference file listing** (lines 552-587): 35 lines listing all 28 engine source files. Claude can discover these via the filesystem. This is a human-oriented code map.
  - Estimated reduction: ~200 words

- **Audio Reference Files list** (lines 350-358): 9 lines listing audio reference files. Claude reads these on-demand. Routing is implicit from Audio System section context.
  - Estimated reduction: ~50 words

### Trim

- **Key Concepts** (lines 385-396): Several bullet points duplicate information already stated in the header description and the "How It Works" technical flow. Remove duplicates, keep only unique concepts not stated elsewhere.
  - Estimated reduction: ~60 words

### Keep

- **Commands table** — Essential.
- **Step 0: Setup** — Framework-specific auto-setup.
- **Guided Flow (Phases 1-4)** — Core workflow.
- **Audio System** (selection workflow, TTS engine table, narration pipeline, audio library) — Operational.
- **How It Works** (filmmaking table + technical flow) — Architecture.
- **Demo Mode** (guided flow, pipeline, known issues, auth patterns) — Operational.
- **Running** — CLI reference.
- **Preview Frame** — Visual QA.

**Total estimated reduction: ~640 words (-22%) → ~2258 words post-trim**

---

## Scribe (1099 words)

### Move (→ KNOWLEDGE.md)

- **Professional Output** (lines 63-68): Generic best practices (consistent typography, color coding, print-readiness). Claude already knows this.
  - Estimated reduction: ~40 words

- **File Size Awareness** (lines 70-75): Generic advice (compress images, remove unused styles). Claude already knows this.
  - Estimated reduction: ~35 words

### Keep

- All commands, routing, scripts, OOXML workflow, dependency checks, error recovery, operational notes. Clean and lean.
- **Format-Specific Quick Reference** (lines 143-171): Borderline — could be just routing to references/. But at 1099 words total, the skill has plenty of budget. Keep for now.

**Total estimated reduction: ~75 words (-7%)**

---

## Seurat (1645 words)

### Move (→ KNOWLEDGE.md)

- **Wireframe System directory listing** (lines 262-282): Lists wireframe directory structure. Claude discovers these via routing already present in `/seurat build`. Human orientation only.
  - Estimated reduction: ~80 words

- **Resources directory listing** (lines 335-345): Lists all subdirectories. Claude reads files on-demand. Human orientation only.
  - Estimated reduction: ~60 words

### Keep

- **Identity + anti-pattern list** — Framework-specific (AI slop prevention).
- **Two Workflows** — Essential routing.
- **Phases** — Quality checklist.
- **All Commands** — Framework-specific.
- **Design System Memory** — Brief, operational.
- **Integration with Baptist** — Cross-skill delegation table.
- **Enforcement Rules** — Behavioral.
- **Visual QA** — Operational.

**Total estimated reduction: ~140 words (-9%)**

---

## Cross-Skill Analysis

### Duplicate Concepts

| Concept | Skills | Assessment |
|---------|--------|------------|
| Baptist ↔ Ghostwriter ↔ Seurat delegation | baptist, ghostwriter, seurat | Acceptable — each needs its own perspective |
| Visual QA workflow | emmet, seurat | Minor overlap — different contexts (testing vs design). No action. |
| ICE Scoring | baptist only | Clean, no duplication |
| Fogg Model | baptist only | Clean, no duplication |

### Trigger Overlaps

| Trigger phrase | Skills that could match | Risk |
|----------------|------------------------|------|
| "landing page" | ghostwriter, baptist, seurat | LOW — different intent (copy vs conversion vs layout) |
| "security" | heimdall, emmet | LOW — emmet delegates to heimdall explicitly |
| "design system" | seurat, orson | LOW — orson consumes seurat's output, different workflow |

**No high-risk trigger conflicts detected.**

### Missing KNOWLEDGE.md Files

No skill currently has a KNOWLEDGE.md file. The `/forge fix` pass should generate these for:
- **baptist** — Fogg Model theory, CRO process, A/B testing methodology, benchmarks, privacy guidance
- **emmet** — Directory structure, testing theory
- **ghostwriter** — File structure, resource directory guide
- **heimdall** — OWASP table, file structure, JSON schemas
- **orson** — Engine source code map, audio reference files, demo script format
- **scribe** — Professional output tips, file size optimization
- **seurat** — Wireframe system structure, resource directory guide

---

## Execution Plan

Ordered by impact (word savings × skill proximity to budget):

| # | Skill | Actions | Est. Reduction | Priority |
|---|-------|---------|----------------|----------|
| 1 | **orson** | Split (2), Move (2), Trim (1) | -640 words (-22%) | **HIGH** — at budget ceiling |
| 2 | **baptist** | Trim (3), Move (1) | -310 words (-16%) | MEDIUM — largest trim potential |
| 3 | **heimdall** | Trim (1), Move (2), Split (1) | -280 words (-17%) | MEDIUM — significant trim |
| 4 | **seurat** | Move (2) | -140 words (-9%) | LOW |
| 5 | **ghostwriter** | Move (2) | -110 words (-6%) | LOW |
| 6 | **emmet** | Improve (frontmatter), Move (1) | -100 words (-8%) | LOW — but frontmatter fix is high-value |
| 7 | **scribe** | Move (2) | -75 words (-7%) | LOW |
| 8 | **forge** | None | 0 | N/A |

**Total estimated reduction across all skills: ~1,655 words**
**KNOWLEDGE.md files to generate: 7**

# Forge Audit — 2026-02-15

## Metrics

| Skill | Words | Lines | Refs | Status | Recommended actions |
|-------|-------|-------|------|--------|---------------------|
| baptist | 1586 | 278 | 6 | OK | Trim (1 section), Improve (1) |
| emmet | 1243 | 303 | 0 | OK | None — already lean |
| forge | 893 | 197 | 4 | OK | None — meta-skill, minimal |
| ghostwriter | 1614 | 336 | 4 | OK | Trim (1 section) |
| heimdall | 1334 | 377 | 3 | OK | Trim (1 section), Move (1 section) |
| orson | 2928 | 551 | 4 | **NEAR BUDGET** | Move (1 section), Split (1 section) — estimated -8% |
| scribe | 1036 | 199 | 4 | OK | None — already lean |
| seurat | 1797 | 362 | 0 | OK | Dedup (1 internal), Improve (1) |

**Budget: 3000 words per SKILL.md**

---

## Baptist

### Keep
- **Identity** (lines 17-34): Delegation rules (what Baptist does/doesn't do) — framework-specific
- **CRO Mental Model** (lines 37-47): Discipline table with Claude's role — guides routing
- **Behavioral Framework** (lines 50-59): M→Ghostwriter, A→Seurat, P→both mapping — framework-specific orchestration
- **Commands** (lines 62-151): All 5 commands — framework-specific
- **A/B Testing Methodology** (lines 155-164): Core constraints (95% confidence, 80% power) — Claude needs these limits
- **ICE Prioritization** (lines 168-184): Formula + thresholds — Claude needs to apply these
- **Integration Protocol** (lines 196-228): Cross-skill delegation rules — framework-specific
- **Multi-Skill Orchestration** (lines 257-264): Parallel delegation — framework-specific
- **Operational Notes** (lines 268-279): Claude behavioral rules

### Trim (→ KNOWLEDGE.md)
- **A/B Testing Methodology** (lines 155-164): The "pre-register before launch" and "do not peek" rules are well-known to Claude. Keep only the numeric constraints (95%/80%/7-14d). Move the rationale to KNOWLEDGE.md.
- Estimated reduction: -2%

### Improve
- **Language inconsistency**: "Alto / Medio / Basso" (line 82) mixed with English everywhere else. Standardize to English ("High / Medium / Low") since the rest of the skill is in English.

---

## Emmet

### Keep — All sections
Already lean at 1243 words. Every section is either a framework-specific command, a non-obvious workflow, or a boundary clarification. No trimming needed.

### Note
- Missing KNOWLEDGE.md (already exists — confirmed ✓)
- No references/ directory — all detailed content routed to `prompts/`, `testing/`, `checklists/` subdirs. This is fine — same principle, different naming.

---

## Forge

### Keep — All sections
At 893 words, forge is the leanest skill. As the meta-skill, all content is framework-specific. No changes.

---

## Ghostwriter

### Keep
- **Identity** (lines 17-28): Three disciplines + key principle — Claude needs the foundation/enhancement hierarchy
- **Prime Directives** (lines 31-42): All 9 directives — behavioral rules, especially #8 (count characters) and #9 (technical infrastructure) which encode past failures
- **Commands** (lines 45-211): All 10 commands — framework-specific
- **On-Demand References** (lines 214-224): Routing table — framework-specific
- **Generation System** (lines 230-247): Workflow + prompt routing
- **Technical Infrastructure Requirements** (lines 249-266): Born from real audit failures — critical
- **Schema Templates** (lines 287-298): Routing table
- **Reference System** (lines 303-321): Project context loading

### Trim (→ KNOWLEDGE.md)
- **Validation System** (lines 269-285): The scoring thresholds (90%/80%/70%/<70%) are useful for Claude, but the category breakdown (12 SEO + 14 GEO + 10 Copy + 5 Schema + 9 Technical = 50 rules) is informational — Claude loads `validation/rules.md` anyway. Keep thresholds, move breakdown to KNOWLEDGE.md.
- Estimated reduction: -3%

---

## Heimdall

### Keep
- **Identity** (lines 17-24): Research-backed, pattern-aware identity — non-obvious
- **Prime Directive** (lines 26-31): Three focus areas — behavioral guide
- **Threat Model categories** (lines 39-44): The 5 categories — Claude needs these as detection targets
- **Workflow** (lines 48-90): 4-phase workflow — non-obvious sequence
- **Commands** (lines 93-190): All 8 commands — framework-specific
- **AI-Specific Patterns table** (lines 200-208): Brief, actionable — keep
- **Enforcement Rules** (lines 218-248): Severity → action mapping — non-obvious
- **Iteration Tracking thresholds** (lines 258-265): Escalation rules — non-obvious
- **State Management** (lines 286-308): File locations — technical constraints
- **v2.0 Features** (lines 344-378): Diff-aware, import check, path-context — behavioral rules

### Trim (→ KNOWLEDGE.md)
- **Threat Model intro** (lines 33-37): The research references (arXiv:2506.11022, Escape.tech) are citations for the user, not needed by Claude. Keep category list, move research context to KNOWLEDGE.md.
- Estimated reduction: -2%

### Move (→ KNOWLEDGE.md)
- **Troubleshooting** (lines 320-340): Pure user-facing help content. "Hook Not Triggering", "False Positives", "Performance Issues" — Claude doesn't need troubleshooting steps for its own tools. This is user documentation.
- Estimated reduction: -5%

---

## Orson

**At 2928 words, this is the largest skill — 98% of budget.**

### Keep
- **Commands table** (lines 20-28): Framework-specific
- **Step 0: Setup** (lines 32-67): Technical constraints, auto-setup script
- **Phase 1-4 workflow** (lines 79-350): Core guided flow — all non-obvious, framework-specific
- **Audio System** (lines 354-404): Pipeline steps, engine selection priority, narration commands
- **Demo Mode** (lines 436-526): Full demo workflow including auth patterns, known issues
- **Running** (lines 530-551): CLI command reference

### Move (→ KNOWLEDGE.md)
- **How It Works** (lines 408-434): This section re-explains the filmmaking workflow and technical flow that's already described step-by-step in Phases 1-4. It's a summary for human understanding. Claude already executes the detailed phases. Removing this doesn't change behavior.
- Estimated reduction: -4% (~120 words)

### Split (→ references/html-contract.md)
- **Phase 3 Step 3.1: HTML contract details** (lines 258-308): The HTML comment format, animation script structure, available easings list, available properties list, and format-specific CSS guidelines are reference material that Claude consults during HTML writing. Splitting to `references/html-contract.md` with a routing instruction keeps SKILL.md focused on workflow while the reference is loaded on-demand when Phase 3 is reached.
- Estimated reduction: -4% (~115 words from SKILL.md)
- **Combined estimated reduction: -8% (~235 words → ~2693 words)**

---

## Scribe

### Keep — All sections
At 1036 words, scribe is lean and well-structured. Routing table + common principles + scripts + format quick reference + error recovery — all framework-specific or encoding past failures. No changes.

---

## Seurat

### Keep
- **Identity + anti-slop list** (lines 9-20): Framework-specific design rules
- **Two Workflows** (lines 24-38): Routing for new vs existing projects
- **Phases 1-4.5** (lines 42-79): Core workflow with Mandate pre-check
- **All commands** (lines 83-272): Framework-specific
- **Wireframe System** (lines 276-278): Routing
- **Design System Memory** (lines 282-300): File locations
- **Integration with Baptist** (lines 303-315): Cross-skill orchestration
- **Enforcement Rules** (lines 318-328): Non-obvious constraints
- **Resources** (lines 345-347): Routing
- **Visual QA** (lines 351-363): Non-obvious technique

### Dedup (internal)
- **The Mandate** appears twice:
  1. Phase 4.5 (lines 72-79) — brief version, references `validation.md`
  2. Standalone section (lines 332-341) — detailed version, also references `validation.md`

  The standalone section (lines 332-341) is redundant. Phase 4.5 already tells Claude "run the Mandate checks" and points to `validation.md` for the full version. The standalone section re-explains the same 4 tests with slightly more detail that's already in `validation.md`.

  **Action:** Remove the standalone "The Mandate" section (lines 330-341). Phase 4.5 + `validation.md` are sufficient.
  - Estimated reduction: -3% (~55 words)

### Improve
- **Mixed language in Integration table** (lines 303-315): "Quando Baptist identifica..." — the rest of the skill is in English. Standardize.

---

## Cross-Skill Analysis

### Duplicate Concepts

| Concept | Skills | Resolution |
|---------|--------|------------|
| Visual QA via screenshots | Emmet (lines 282-293), Seurat (lines 351-363) | **Keep both** — different purposes (Emmet: functional regression, Seurat: design verification). Technique is the same but application context differs. Not a true dedup target. |
| Integration tables | All skills | **Keep all** — each describes integration from its own perspective. Expected and useful. |

### Trigger Overlaps

| Phrase | Competing skills | Risk | Resolution |
|--------|-----------------|------|------------|
| "audit landing page" | Baptist, Ghostwriter | Low | Baptist triggers on "conversion/CRO" context; Ghostwriter on "content/SEO" context. Both have clear identity sections that disambiguate. Delegation rules handle overlap. |
| "checklist" | Emmet, Seurat | Low | Emmet = code quality checklists; Seurat = design audits. Frontmatter descriptions are specific enough. |
| "test" | Emmet, Baptist | None | Emmet = code tests; Baptist = A/B tests. Context disambiguates. |

**No trigger overlap fixes needed.**

### Split Candidates

| Skill | Section | Target | Rationale |
|-------|---------|--------|-----------|
| Orson | Phase 3.1 HTML contract (lines 258-308) | `references/html-contract.md` | Reference material embedded in workflow. On-demand loading reduces SKILL.md by ~115 words. |

### Missing KNOWLEDGE.md

| Skill | Has KNOWLEDGE.md? |
|-------|-------------------|
| baptist | ✓ |
| emmet | ✓ |
| forge | ✗ (acceptable — meta-skill, no domain knowledge to explain) |
| ghostwriter | ✓ |
| heimdall | ✓ |
| orson | ✓ |
| scribe | ✓ |
| seurat | ✗ (should have one — design principles, accessibility concepts, the Mandate philosophy) |

---

## Execution Plan

Ordered by impact (word savings + structural improvement):

| # | Skill | Actions | Est. reduction |
|---|-------|---------|---------------|
| 1 | **orson** | Move "How It Works" → KNOWLEDGE.md, Split Phase 3.1 → `references/html-contract.md` | -235 words (-8%) |
| 2 | **seurat** | Dedup The Mandate (remove standalone), Improve language consistency, Create KNOWLEDGE.md | -55 words (-3%) |
| 3 | **heimdall** | Trim threat model intro, Move Troubleshooting → KNOWLEDGE.md | -95 words (-7%) |
| 4 | **ghostwriter** | Trim Validation System breakdown | -50 words (-3%) |
| 5 | **baptist** | Trim A/B methodology rationale, Improve language consistency | -30 words (-2%) |

**Total estimated reduction: ~465 words across 5 skills.**

Skills with no changes needed: **emmet**, **forge**, **scribe**.

---

*Review this report and say **PROCEED** to execute with `/forge fix`, or `/forge fix [skill]` for a specific skill.*

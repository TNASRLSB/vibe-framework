# Forge Audit — 2026-02-11

## Metrics

| Skill | Words | Status | Frontmatter | Desc Words | Refs | Scripts | Templates | Recommended Actions |
|-------|-------|--------|-------------|------------|------|---------|-----------|---------------------|
| audiosculpt | 5198 | **TOO_LARGE** | **NO** | 0 | 0 | 0 | 0 | **Improve** (add frontmatter), **Split** (massive), **Trim** (domain knowledge) |
| baptist | 2227 | OK | yes | 40 | 6 | 0 | 0 | Trim (4 sections) |
| emmet | 1299 | OK | yes | 20 | 0 | 1 | 1 | No action needed |
| forge | 893 | OK | yes | 56 | 4 | 1 | 3 | No action needed |
| ghostwriter | 2060 | OK | yes | 37 | 4 | 0 | 7 | Trim (2 sections), Improve (desc words low) |
| heimdall | 2087 | OK | yes | 37 | 2 | 6 | 0 | Trim (3 sections), Delete (1 section) |
| orson | 1830 | OK | **NO** | 0 | 0 | 0 | 0 | **Improve** (add frontmatter) |
| scribe | 1099 | OK | yes | 58 | 4 | 6 | 1 | No action needed |
| seurat | 2002 | OK | yes | 47 | 0 | 0 | 14 | Trim (1 section), Dedup (1) |

**Legend:** Improve = structural fix, Split = move to references/, Trim = extract to KNOWLEDGE.md, Dedup = cross-skill consolidation, Delete = remove entirely.

---

## CRITICAL: Missing Frontmatter

Two skills have **no frontmatter**, meaning they cannot be triggered from the system prompt. This is the highest-priority fix.

| Skill | Impact |
|-------|--------|
| **audiosculpt** | Invisible to skill activation. Only accessible if user knows to type `/audiosculpt`. |
| **orson** | Invisible to skill activation. Only accessible if user knows to type `/orson`. |

**Fix:** Add YAML frontmatter block with `name`, `description`, and `allowed-tools`.

---

## Audiosculpt

### Improve (CRITICAL)
- **Missing frontmatter** (line 1): Must add YAML frontmatter. Suggested description: `"Programmatic audio generation (soundtrack + SFX) using Strudel. Use when creating music, sound effects, audio for videos, or soundtracks. Triggers on 'audio', 'music', 'soundtrack', 'SFX', 'sound effects', 'Strudel'. Integrates with Orson for video audio."`

### Split (→ references/)
This skill is 5198 words — **73% over budget**. Most content is Strudel API reference and musical theory that belongs in reference files.

| Section | Lines | Words (est.) | Target |
|---------|-------|-------------|--------|
| Voiceover Mode (frequency arch + preset schema + Strudel impl) | 58-144 | ~400 | `references/voiceover-mode.md` |
| TTS Narration System | 148-244 | ~450 | `references/tts-narration.md` |
| Building the TIR (algorithm + format) | 423-471 | ~250 | `references/tir-algorithm.md` |
| Strudel Pattern System + Reading Preset Patterns | 475-574 | ~450 | `references/strudel-guide.md` |
| Presets (structure, schema) | 670-719 | ~250 | `references/preset-format.md` |
| Preset Inheritance System | 768-835 | ~350 | `references/preset-format.md` (append) |
| Loop Variation System | 842-917 | ~400 | `references/variation-system.md` |
| Feel Profiles | 920-998 | ~400 | `references/feel-profiles.md` |
| Soft Orchestration Constraints | 1001-1103 | ~500 | `references/orchestration.md` |
| Orchestration (register rules, voice slots) | 1124-1154 | ~150 | `references/orchestration.md` (append) |
| Audio Report (detailed HTML structure) | 1324-1376 | ~250 | `references/audio-report.md` |

**Estimated reduction:** ~3850 words → SKILL.md drops to ~1350 words (within budget).

In SKILL.md, replace each removed section with a one-line routing instruction:
```markdown
For voiceover mode details, read `references/voiceover-mode.md`.
```

### Trim (→ KNOWLEDGE.md)
Content Claude already knows (Opus has deep music theory and Strudel knowledge):

| Section | Lines | Reason |
|---------|-------|--------|
| Strudel Mini-Notation Reference | 510-519 | Well-known library syntax |
| Strudel Functions Reference | 522-539 | Well-known library API |
| Voice Leading Rules | 738-765 | Music theory — Opus knows counterpoint rules |
| Functional Harmony explanation | 1105-1121 | Music theory — Opus knows T/SD/D functions |
| Form and Phrasing (periodo_tematico etc.) | 1157-1178 | Music form theory — standard knowledge |

**Estimated KNOWLEDGE.md content:** ~600 words of domain education for user.

### Keep
- Commands table (L1-16): Framework-specific routing
- Using Templates (L19-54): Framework-specific — brief, stays
- How It Works diagram (L247-269): Brief architecture, stays
- Guided Flow steps (L273-420): Core workflow — stays (but trim JSON examples)
- SFX Timing Rules (L580-598): Brief, stays
- Strudel Code Structure (L602-659): Framework-specific template, stays
- Stylistic Families table (L723-734): Brief classification, stays
- Temporal Quantization (L1183-1208): Framework-specific timing, stays
- Ducking (L1211-1232): Brief, framework-specific, stays
- Integration with Orson (L1235-1259): Inter-skill, stays
- Engine Scripts (L1263-1320): Framework-specific, stays

### Delete
- Impact Frame detailed JSON schema (L362-394): Implementation detail, the Strudel code example is sufficient.

---

## Baptist

### Trim (→ KNOWLEDGE.md)
Opus knows the Fogg Model, cognitive load principles, and statistical testing. Keep only the framework-specific routing (which owner handles what fix).

| Section | Lines | Reason |
|---------|-------|--------|
| Fogg Model B=MAP explanation | 52-83 | Opus knows Fogg Model. Keep ONLY the delegation routing ("Low motivation → Ghostwriter", "Low ability → Seurat", "Weak prompt → copy to Ghostwriter, visual to Seurat"). Move the motivator/ability breakdowns to KNOWLEDGE.md. |
| Cognitive Load Principles | 87-93 | Opus knows Hick's Law, F-pattern, 8-second rule. Move entirely to KNOWLEDGE.md. |
| A/B Testing statistical explanation | 232-245 | Opus knows SRM, peeking problems, sequential testing. Keep sample size formula + quick reference table. Move explanations of SRM, A/A validation, peeking to KNOWLEDGE.md. |
| Conversion Rate Benchmarks | 269-280 | Standard industry data. Move to KNOWLEDGE.md. |
| Privacy-First CRO | 284-293 | General best practices Opus knows. Move to KNOWLEDGE.md. |

**Estimated reduction:** ~350 words (-16%)

### Keep
- Identity + delegation rules (L17-33): Framework-specific role boundaries
- CRO Mental Model table (L37-47): Delegation mapping — framework-specific
- CRO Process Framework (L97-106): Brief, stays
- All Commands (L109-198): Framework-specific
- Sample Size Formula + Quick Reference Table (L206-224): Useful quick reference
- Statistical Requirements bullet list (L228-233): Brief behavioral rules
- ICE Prioritization table (L249-265): Brief, operational
- Integration Protocol (L297-328): Framework-specific orchestration
- Multi-Skill Orchestration (L355-364): Framework-specific
- Operational Notes (L368-378): Behavioral rules

---

## Emmet

### Assessment: No action needed

1299 words, well under budget. Good progressive disclosure with `prompts/`, `testing/`, `checklists/` subdirectories. All content is framework-specific (commands, workflows, integrations). No domain knowledge that Opus already knows.

---

## Forge

### Assessment: No action needed

893 words, well under budget. Clean structure, all content is framework-specific methodology.

---

## Ghostwriter

### Trim (→ KNOWLEDGE.md)

| Section | Lines | Reason |
|---------|-------|--------|
| The New Search Paradigm (L27-62) | 27-62 | Opus knows the SEO/GEO landscape shift. The statistics (Google market share, zero-click %, AI traffic growth) and the symbiotic relationship diagram are user education. Move to KNOWLEDGE.md. |
| Quick Reference: Dual-Optimized Content Formula (L386-417) | 386-417 | Generic content workflow (Research → Structure → Write → Optimize → Validate → Publish). Opus knows this process. Remove or condense to 2 lines. |

**Estimated reduction:** ~250 words (-12%)

### Improve
- **Detailed Resources section** (L422-477): This is 55 lines of file listings. Claude can discover files via Glob. Condense to a single routing paragraph: "For detailed documentation, see the `seo/`, `geo/`, `copywriting/`, `generation/`, `validation/`, `templates/`, `checklists/`, and `workflows/` directories."

### Keep
- Identity (L20-25): Brief role definition
- Prime Directives (L66-77): Behavioral rules Claude needs
- All Commands (L81-246): Framework-specific
- On-Demand References table (L249-259): Routing — framework-specific
- Operational Framework (L276-370): Behavioral instructions
- Technical Infrastructure Requirements (L300-314): Learned-from-audits data — keeps Claude from repeating mistakes
- Integration (L374-382): Inter-skill

---

## Heimdall

### Trim (→ KNOWLEDGE.md)

| Section | Lines | Reason |
|---------|-------|--------|
| Threat Model: Research Findings table (L38-44) | 38-44 | Source citations (arXiv, Escape.tech) are user credibility signals, not needed for Claude's behavior. Keep the vulnerability categories list (L47-52), move the research table to KNOWLEDGE.md. |
| Examples (L395-469) | 395-469 | Three detailed examples (hardcoded credential, logic inversion, iteration warning) with full output formatting. These are illustrative for the user but Claude doesn't need them to produce the same output — it follows the enforcement rules. Move to KNOWLEDGE.md. |
| v2.0 Features explanatory text (L503-566) | 503-566 | Feature descriptions like "Diff-Aware Security Analysis" explanation. Keep the detection categories and severity escalation tables (operational). Move the prose explanations to KNOWLEDGE.md. |

**Estimated reduction:** ~400 words (-19%)

### Delete

| Section | Lines | Reason |
|---------|-------|--------|
| Version block (L497-499) | 497-499 | Skill version, pattern database date, compatibility. No behavioral impact. Delete. |

### Keep
- Identity (L18-24): Role definition
- Prime Directive (L26-31): Behavioral rule
- AI-Specific Vulnerability Categories (L47-52): Brief classification Claude needs
- Workflow phases (L56-97): Framework-specific
- All Commands (L100-198): Framework-specific
- Detection Patterns tables (L202-233): Operational reference
- Enforcement Rules (L237-267): Behavioral rules
- Iteration Tracking (L271-304): Framework-specific
- Integration/hooks (L308-357): Framework-specific configuration
- State Management (L361-383): Operational
- Troubleshooting (L473-493): Operational
- v2.0 detection tables (severity escalation, supported languages, path contexts): Operational data

---

## Orson

### Improve (CRITICAL)
- **Missing frontmatter** (line 1): Must add YAML frontmatter. Suggested description: `"Programmatic video generation from design system + content. Creates HTML-based videos with CSS animations, rendered via Playwright + FFmpeg. Use when creating product videos, social media promos, explainers, or any video content. Triggers on 'video', 'render', 'animation', 'promo video', 'social media video'. Integrates with Seurat for design and Ghostwriter for copy."`

### Keep
All sections are framework-specific (engine commands, workflow phases, director recipes, mode pools). At 1830 words, well under budget. No domain knowledge to extract.

### Trim (minor)
- **Director Recipes table** (L332-349): 18 lines of recipe details. These are implemented inside `director.ts` and the engine handles selection automatically. Claude doesn't need to know the trigger conditions in SKILL.md since the engine does it. Move to `references/director-recipes.md`. Replace with: "The director assigns animations based on content signals. For recipe details, read `references/director-recipes.md`."

**Estimated reduction:** ~150 words (-8%)

---

## Scribe

### Assessment: No action needed

1099 words, well under budget. Excellent progressive disclosure: SKILL.md has routing, all format-specific details in `references/`. Clean structure, all content operational.

---

## Seurat

### Trim (minor)

| Section | Lines | Reason |
|---------|-------|--------|
| Detailed Resources (L352-416) | 352-416 | 65 lines of file listings. Claude can discover files via Glob. Condense to a routing paragraph. |

**Estimated reduction:** ~200 words (-10%)

### Dedup
- **Layout Primitives table** (L281-290): This table duplicates content from `wireframes/primitives.md`. Remove the table from SKILL.md, keep only: "Layout primitives are defined in `wireframes/primitives.md`."
- **Breakpoint Convention** (L293-298): Also in wireframes/. Remove from SKILL.md.

### Keep
- Identity + anti-patterns (L9-20): Behavioral rules
- Two Workflows (L24-38): Routing
- Phases (L42-71): Operational workflow
- All Commands (L75-258): Framework-specific
- Wireframe System intro + structure (L262-277): Navigation help
- Design System Memory (L302-320): File navigation
- Integration with Baptist (L324-336): Inter-skill
- Enforcement Rules (L340-348): Behavioral rules
- Visual QA (L420-431): Operational

---

## Cross-Skill Analysis

### 1. Duplicate Concepts

| Concept | Skills | Resolution |
|---------|--------|------------|
| **Visual QA** | Seurat (L420-431), Orson (L364-372), Emmet (L305-316) | Three near-identical blocks: "screenshot, verify, fix". Low impact — each is 4-5 lines and contextually appropriate. **No action** — the cost of consolidation (creating a shared reference + 3 routing pointers) exceeds the benefit. |
| **Layout Primitives** | Seurat SKILL.md (L281-290) + `wireframes/primitives.md` | **Dedup**: Remove from SKILL.md, reference the wireframes file. |

### 2. Overlapping Triggers

| Pair | Overlap area | Resolution |
|------|-------------|------------|
| Baptist ↔ Ghostwriter | "landing page" could trigger both | **Acceptable** — Baptist audits for CRO, Ghostwriter writes content. System prompt lists both; user intent disambiguates. No action needed. |
| Emmet ↔ Heimdall | "security" could trigger both | **Acceptable** — Emmet has `/emmet checklist security` but delegates to Heimdall for deep scans. Documented in both skills. No action needed. |

### 3. Inconsistent Terminology

No significant terminology inconsistencies found. All skills use consistent language for shared concepts (design tokens, design system, functional map, etc.).

---

## Execution Plan

Ordered by impact (critical structural fixes first, then largest word reductions, then minor trims):

| # | Skill | Actions | Estimated Effort | Impact |
|---|-------|---------|-----------------|--------|
| 1 | **audiosculpt** | Improve (frontmatter), Split (11 sections → references/), Trim (5 sections → KNOWLEDGE.md), Delete (1 section) | High | **Critical** — fixes activation + removes ~3850 words |
| 2 | **orson** | Improve (frontmatter), Trim (1 section → references/) | Low | **Critical** — fixes activation |
| 3 | **baptist** | Trim (5 sections → KNOWLEDGE.md) | Medium | Moderate — removes ~350 words of domain knowledge |
| 4 | **heimdall** | Trim (3 sections → KNOWLEDGE.md), Delete (1 section) | Medium | Moderate — removes ~400 words |
| 5 | **ghostwriter** | Trim (2 sections → KNOWLEDGE.md), Improve (condense resource listings) | Low-Medium | Moderate — removes ~250 words + cleans up |
| 6 | **seurat** | Trim (1 section), Dedup (2 items from wireframes/) | Low | Minor — removes ~200 words of duplication |
| 7 | emmet | No action | — | — |
| 8 | forge | No action | — | — |
| 9 | scribe | No action | — | — |

**Total estimated word reduction:** ~5050 words across 6 skills.
**KNOWLEDGE.md files to create:** 5 (audiosculpt, baptist, ghostwriter, heimdall, seurat — orson has no domain knowledge to extract).

---

*Review this report and say **PROCEED** to execute via `/forge fix`.*

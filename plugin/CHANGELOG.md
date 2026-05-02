# Changelog

## 5.6.3 — 2026-05-02

"Auto-recovery for inherited v1 morpheus residues + tech-debt sweep." Field-reported pattern: the `setup-check.sh` SessionStart hook detected v1 filesystem markers (`.claude/morpheus/`, `vibe-framework.sh`) but missed the partial-cleanup case where the filesystem was already cleaned by hand and only `settings.local.json` still pointed at non-existent morpheus scripts. Such projects emitted "PreToolUse hook error: File o directory non esistente" on every Bash/Read/Write — non-blocking but persistent noise. Reconciler had `apply-clean-stale-hooks` since 5.5.7; it was just not wired to SessionStart. This release wires it.

Bundled with three smaller tech-debt fixes uncovered during the audit pass that preceded the release.

### Changes

- **`plugin/scripts/setup-check.sh`** — new Check 2b: after the existing v1-filesystem check, the hook now invokes `reconciler.sh detect-stale-hooks` on `~/.claude/settings.json`, `${PROJECT_DIR}/.claude/settings.json`, and `${PROJECT_DIR}/.claude/settings.local.json`. If any returns matches against the `settingsHooksDenyPatterns[]` schema (5.5.7), the hook auto-runs `apply-clean-stale-hooks` on that file (timestamped backup `.bak-stale-hooks-<ts>` is created automatically by the reconciler). A single anomaly summarizes the action: `"VIBE auto-recovered broken hook references in: <files>. Backups created. Restart this Claude Code session to apply."` Bypass: `VIBE_NO_AUTO_RECOVERY=1`. Idempotent — second SessionStart is a no-op. Filed-reported case: `Booost-app` repo where `.claude/morpheus/` had been manually `rm -rf`ed but `settings.local.json` retained 3 hook entries (PreToolUse, SessionStart compact matcher, statusLine) referencing `injector.sh` / `reset.sh` / `sensor.sh`.

- **`plugin/scripts/setup-check.sh`** — Check 2 anomaly text changed from `"run scripts/vibe-v1-cleanup.sh to migrate"` to `"run /vibe:setup to migrate"` for consistency with the rest of the user-facing anomaly messages, all of which point at the slash command.

- **`plugin/skills/_shared/atomic-decomposition.md`** — the Pipeline Summary now includes a "Concrete script paths" section that names the actual shipped scripts (`atomic-validate-manifest.sh`, `atomic-orchestrator.sh`, `atomic-verify-output.sh`, `atomic-enforcement.sh`) with their `${CLAUDE_PLUGIN_ROOT}/scripts/` paths. Closes a gap surfaced by the tech-debt audit: SKILL.md authors knew to invoke "the decomposer agent" but the protocol document never declared where the mechanical orchestrator script lived, so SKILL.md instructions could not reference it directly.

- **`tests/run-tests.sh`** — `validate-audit-system.sh` is now invoked from the test runner (new "Audit System Validation (functional)" header). Previously the script existed and was complete (145 lines, validates audit-protocol + 7 audit agents + audit skill + guardian removal) but was never executed by CI. `EXPECTED_SKILLS` extended to include `spec` (5.5.0+ skill, was missing from the list).

- **`tests/setup-check/test-auto-recovery.sh`** (new) — 8 cases simulating the Booost-app scenario: detection on partial-cleanup project, backup creation, no-stale-references after apply, permissions preserved, idempotence on second run, no false positive on clean projects, `VIBE_NO_AUTO_RECOVERY=1` honored, settings untouched when bypassed.

**User-facing impact:** projects inherited with v1 morpheus residues in `settings.local.json` (a common case for repos shared with collaborators who installed VIBE pre-v2) now self-heal on the first SessionStart, with a single explanatory anomaly message instead of an error storm. The cleanup is a strict subset of `/vibe:setup` — only stale hook references are touched, no other config is modified. Backup files are created so the action is fully reversible.

**Test results:** 261/262 passing. The single pre-existing failure (`test-rhetoric-skim.sh`) is unrelated and predates this release.

## 5.6.2 — 2026-05-02

"Two field-reported bugs squashed before any new feature work." A multi-line + path-with-spaces false positive in `pre-tool-security.sh` and a missing cross-project access guard. Both surfaced in a single user session on a project whose absolute path contained spaces (`/home/uh1/VIBEPROJECTS/TORA NO AI SRL SB/...`) and whose agent then proceeded to read `.env` files in unrelated sibling projects. No new dependencies. Hook count: 17 → 18 (new `scope-guard.sh`).

### Changes

- **`plugin/scripts/pre-tool-security.sh`** — fix the Check 1 (dangerous-rm) awk verdict, which leaked `found_rm` state across newlines and shell separators. A multi-line command like `rm -f /tmp/foo` followed on a new line by `cd "/path with spaces/proj"` was treating `cd`, `/path`, `with`, `spaces/proj` as path-arguments of the preceding `rm`, falsely flagging the command as "Dangerous rm targeting root". Fix: pre-process the command with `sed` so that `&&`, `||`, `;` become standalone tokens, then reset the `in_rm` flag at every separator. Same-line and multi-line cases both validated. Real-world unsafe `rm` (e.g. `rm -f /tmp/foo; rm -rf /home/user`) still blocks correctly.

- **`plugin/scripts/scope-guard.sh`** (new) — PreToolUse hook on `Read` and `Bash`. Blocks access to paths outside the session project root. Mitigates cross-project scope creep — the failure mode where an agent leaves the directory the user opened and starts touching files in unrelated projects (e.g. another client's `.env` in a sibling repo). Default whitelist: `SESSION_ROOT/*`, `/tmp/`, `/var/tmp/`, `/dev/shm/`, `~/.claude/`, `/usr/`, `/opt/`, `/etc/`, `/var/log/`, `$CLAUDE_PLUGIN_ROOT/`, plus per-project `<root>/.vibe/scope-allow` (one prefix per line). Bypass: `/vibe:pause` flag, or `VIBE_NO_SCOPE_GUARD=1`. Path extraction is best-effort — quoted paths handled, unquoted-with-spaces paths are not analyzed (false negatives preferred over false positives). For Bash commands, both quoted and bare absolute paths are extracted and validated; if any one path falls outside scope, the command is denied with a clear reason that names the offending path. Fail-open if the session root cannot be determined.

- **`plugin/hooks/hooks.json`** — register `scope-guard.sh` on the existing `Bash` and `Read` matcher buckets, alongside `pre-tool-security.sh` (Bash) and `read-discipline.sh` (Read).

- **`plugin/scripts/session-end-cleanup.sh`** — additionally cleans up `/tmp/vibe-session-root-${SESSION_ID}` on SessionEnd (the marker file `scope-guard.sh` writes on first PreToolUse to anchor the project root for the rest of the session).

- **`tests/run-tests.sh`** — six new regression tests under "PreToolUse Security Hook — Multi-line + path-with-spaces regressions" cover: multi-line `rm /tmp/...` then `cd "/path with spaces"` allowed, multi-line `rm + grep` allowed, same-line `rm /tmp && cd /home` allowed, multi-line `safe rm + unsafe rm` still blocks, same-line `safe rm; unsafe rm` still blocks, `rm "/tmp/path with spaces"` allowed. `scope-guard.sh` added to the syntax-validation list.

- **`tests/scope-guard/test-scope-guard.sh`** (new) — 16 cases covering same-project access (allow), cross-project access (deny), the standard whitelist (`/tmp`, `/etc`, `/usr`, `~/.claude/`), the three bypass mechanisms (pause flag, env var, project allow-file), and command-parsing edge cases (quoted spaces, mixed in-scope + out-of-scope, non-Read/Bash tools, no session root → fail-open).

**User-facing impact:** projects with spaces in their absolute path no longer hit a false-positive block on multi-line shell commands that mix `/tmp` cleanups with `cd` into the project. Cross-project file reads — including grep/find/cat across `/home/<user>/<other-project>/.env` — are now denied by default, with a clear reason and three documented bypass mechanisms. No CLAUDE.md template changes; no slash-command API changes.

**Test results:** 253/255 passing (the two pre-existing failures in `test-rhetoric-skim.sh` are unrelated and predate this release).

## 5.6.1 — 2026-04-30

"Per-skill empirical model selection (model-routing benchmark Phase 1)." Two creative skills moved from Opus 4.7 to Sonnet 4.6 by default, after a benchmark confirmed each preserves ≥95% of Opus 4.7's output quality on representative tasks. Methodology adapts Tessl's 880-eval study for VIBE creative skills: outputs are scored on binary-axis adherence rubrics, with a dual-judge bias check (Opus 4.7 + Sonnet 4.6, plus Haiku 4.5 as third judge for the seurat tiebreaker).

### Changes

- **`plugin/skills/seurat/SKILL.md`** — `model.primary: opus-4-7` → `sonnet-4-6`. UI design system. Three-judge consensus (2 of 3 favor Sonnet) with mean preservation 0.966 across judges.

- **`plugin/skills/baptist/SKILL.md`** — `model.primary: opus-4-7` → `sonnet-4-6`. Conversion rate optimization. Both judges agreed: preservation 0.96 (Opus judge) and 1.00 (Sonnet judge), comfortably ≥ 0.95.

- **`plugin/skills/ghostwriter/SKILL.md`** and **`plugin/skills/orson/SKILL.md`** — unchanged. Both judges placed Sonnet 4.6 below the 95% preservation threshold on these skills (0.80 and 0.88 respectively), so Opus 4.7 remains the default.

**User-facing impact:** invoking `/vibe:seurat` or `/vibe:baptist` now runs on Sonnet 4.6 by default — roughly 3× cheaper and faster than Opus 4.7, with equivalent quality on the benchmark prompts. The other skills (`ghostwriter`, `orson`, `audit`, `emmet`, `heimdall`, `forge`, infrastructure skills) are unchanged. No slash-command API changes.

**Bonus finding:** Tessl Finding #2 ("weaker models benefit most from skill loading") confirmed for VIBE creative skills. With/without-skill comparison showed Opus 4.6 jumped +16-20 percentage points on adherence with the skill loaded (e.g., on seurat: 0.84 → 1.00; on baptist: 0.80 → 1.00). Opus 4.7 was already saturated near 100% in both conditions, so the lift is masked.

**Maintenance fix bundled:** `tests/maintainer-scripts/release.sh` (gitignored) now serves as single-shot release automation. It propagates a version bump to `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` `plugins[0].version`, creates the git tag, pushes, and creates the GitHub release from the CHANGELOG entry. Closes a long-standing drift between plugin.json (current) and GitHub Releases (was at v5.5.4, four versions behind).

## 5.6.0 — 2026-04-26

"Sycophantic-capitulation mitigation + verification discipline" — five integrated fixes targeting the model-level pattern where Claude makes confident-wrong assertions about repo state, then capitulates ("avevo torto, hai ragione") under user pushback without verifying. Distinct from rhetoric-guard 5.2's coverage (giving up, ownership-dodging, permission-seeking); this release closes the EPISTEMIC gap.

### Changes

#### A — Strengthened competitor-research chain language (3 SKILLs)

The shared `competitor-research.md` protocol was referenced by Seurat (Setup + Brand modes), Ghostwriter (Write/Phase 2), and Baptist (Audit Step 1) via `> **Read** ... for the full research protocol` blockquote. Format-wise this read as an aside, not a directive — a model in skim mode passes through it. Replaced with **MANDATORY PRELUDE** numbered steps: explicit "STOP. Do not proceed without protocol output", imperative `Use the Read tool now on PATH`, freshness check on `.vibe/competitor-research/metadata.json`, and "Do NOT continue to Step N until storage is complete". Same chain, unmissable language. Affects: `plugin/skills/seurat/SKILL.md`, `plugin/skills/ghostwriter/SKILL.md`, `plugin/skills/baptist/SKILL.md`.

#### B — Pragmatic priming Tier B promoted to default-ON

`plugin/scripts/pragmatic-priming.sh` was gated default-OFF behind `VIBE_PRAGMATIC_MODE=1` (5.5.0–5.5.7). The 5.5.1 A/B measured 90% reduction in hedge-word density on Opus 4.7 — empirically validated, but never default-active. Per Iron Man Mandate + User Burden Zero, the validated mitigation now ships ON. Disable via `VIBE_PRAGMATIC_MODE=0`. Documentation updated: `plugin/README.md` (Tier B description), `plugin/agents/pragmatic.md` (Tier comparison), `plugin/skills/setup/SKILL.md` §5.7 (Tier description).

#### C — rhetoric-guard.sh: new category `sycophantic-capitulation` (21 patterns)

Adds §15.0 to `plugin/scripts/rhetoric-guard.sh`, catching retroactive capitulation about a CLAIM already made — distinct from existing ownership-dodging (forward-looking responsibility evasion); this targets backward-looking sycophantic agreement under user pushback. Patterns: `i was wrong`, `i had it (wrong|backwards)`, `you're absolutely right`, `you're completely right`, `actually(,) you're right`, `let me correct myself`, `i apologize for the (confusion|error|incorrect)`, `my apologies for the (confusion|error)`, plus Italian variants `avevo torto`, `mi correggo`, `hai ragione`, `in realtà hai ragione`. Correction injected: "VERIFY BEFORE AGREEING. Cite the specific evidence (file:line, tool output, fact) that justifies the reversal. If no evidence, do not capitulate — restate your prior position with reasoning." All patterns added to `HIGH_RISK_PATTERNS` for Stage-3 meta-keyword suppression (don't fire when discussed in audit/post-mortem context). `META_KEYWORDS_RE` extended with `capitulation|sycophancy|sycophantic`. Per-category disable: `VIBE_RG_CAPITULATION_DISABLED=1`.

#### D — `Verification Discipline` section in CLAUDE.md template

`plugin/setup/claude-md-template.md` gains a new managed section between Capability Audit and VIBE Limits. Imperative bullets: file existence → use Read/Glob, function/symbol presence → use Grep, architecture claims → cite line numbers, cross-references → check both ends of the link. Plus pushback discipline: "User disagreement is not evidence the user is right. Cite the specific fact (file:line, tool output) that supports the reversal — or restate your prior position with reasoning." Patterns-to-avoid section names sycophantic capitulation explicitly. Propagates to all VIBE-managed CLAUDE.md files on next `/vibe:setup` run.

#### E — New Stop hook: `verify-before-assert.sh`

`plugin/scripts/verify-before-assert.sh` (new file, registered in hooks.json Stop array after atomic-enforcement). Detects assertion patterns in the final assistant message — backtick-quoted file paths claiming existence/contents, function-behavior claims, variable claims, line-number citations — without preceding Read/Grep/Glob/LS in recent transcript turns (window: last 20 entries). Default mode: **log-only**, writes events to `${CLAUDE_PLUGIN_DATA}/verify-before-assert/vba-events-${SESSION_ID}.jsonl` for maintainer field-data review. Block mode opt-in via `VIBE_VBA_BLOCK=1`. Disable: `VIBE_VBA_DISABLED=1`. Conservative pattern set (each requires backtick-quoted target) keeps FP low at cost of missing assertions in plain prose; acceptable tradeoff for log-only. Distinct from rhetoric-guard.sh — that targets RHETORICAL patterns; this targets EPISTEMIC patterns (claims about repo state without verification). Hook count: 16 → 17.

#### F — Chain to 4 additional modes that lacked it

After deeper read of the 3-skill philosophy ("market is the baseline, user is the differentiator"), 4 modes that lacked the competitor-research chain now have it: `seurat generate` (component generation), `ghostwriter optimize` (rewrites of existing content), `baptist test` (A/B hypothesis design), `baptist funnel` (drop-off diagnosis). Each gets a "MANDATORY PRELUDE" or "Prelude" block matching Task A's pattern. Modes that do pure introspection on existing artifacts (`seurat extract/preview/map`, `ghostwriter validate`, `baptist analyze`) intentionally skip the chain — they don't produce sector-baseline-dependent output.

#### G — Audit orchestrator + 3 agents share research cache

`/vibe:audit` orchestrator (`plugin/skills/audit/SKILL.md`) gains a research prelude in both Direct Launch (Step 1.5) and Interactive (Step 3.5) modes: when the dispatch list includes any of seurat/ghostwriter/baptist, the orchestrator runs the shared competitor-research protocol ONCE (or confirms fresh cache) before dispatching. Synchronization point — prevents the 3 agents from racing on the same protocol when launched in parallel. Skipped when only non-research agents (emmet/heimdall/orson/scribe) are in dispatch list.

The 3 agents (`plugin/agents/{seurat,ghostwriter,baptist}.md`) gain a `## Competitor Research Cache` section: read `.vibe/competitor-research/metadata.json` for freshness, consume the relevant lens (Design / Copy / Conversion), incorporate sector benchmarks into findings tagged `[BENCHMARK]`. Audits without benchmarks are visibly tagged as such (`Benchmark coverage: not available — run /vibe:audit for benchmark-aware audit`) so the user knows half the value is missing. Agents do NOT execute the protocol themselves — orchestrator handles synchronization.

Effect: `/vibe:audit` produces benchmark-aware findings (e.g., "form has 6 fields, sector top 5 have 3" instead of just "form has 6 fields"). Standalone agent invocation degrades gracefully to standards-only with visible header note.

### Migration from 5.5.7

- **Tier B activation:** users who previously ignored `VIBE_PRAGMATIC_MODE` now get the priming injected per turn by default. Token cost ~30 per user prompt, cached via prompt caching. To revert to raw model behavior: `export VIBE_PRAGMATIC_MODE=0`.
- **rhetoric-guard new patterns:** 21 new patterns may fire on legitimate self-correction in messages without verification context. Per-category disable available via `VIBE_RG_CAPITULATION_DISABLED=1` if false positives become disruptive. Field calibration expected over the 5.6.x cycle.
- **verify-before-assert hook:** log-only by default, no behavioral change. Block mode opt-in only after maintainer reviews `vba-events-*.jsonl` for FP rate.
- **CLAUDE.md template:** new Verification Discipline section appears in next `/vibe:setup` reconciliation. Existing user-authored content outside `<!-- VIBE:managed-* -->` markers is preserved.
- **F (additional mode chains):** First invocation of `/vibe:seurat generate`, `/vibe:ghostwriter optimize`, `/vibe:baptist test`, `/vibe:baptist funnel` after upgrade pauses for service/product type if no cached research exists in `.vibe/competitor-research/`. Subsequent invocations within 30 days reuse cache.
- **G (audit orchestrator + agents):** First `/vibe:audit` after upgrade (with seurat/ghostwriter/baptist in dispatch list) pauses for research input if no cache. Standalone agent invocations now produce findings tagged `Benchmark coverage: not available` when cache is missing.
- **Re-run `/vibe:setup`** to pick up the template change and stale-hook cleanup if not already applied from 5.5.7.

## 5.5.7 — 2026-04-22

"V1 hook auto-cleanup + Write-then-Edit false positive" — due fix report-driven raggruppati. **Fix A:** `plugin/scripts/read-before-edit.sh` riconosce `Write` come equivalente a full read (l'assistant ha appena scritto il contenuto del file → conosce esattamente cosa c'è dentro → un `Edit` successivo è sicuro). **Fix B:** `/vibe:setup` ora rileva e rimuove automaticamente hook residui da VIBE v1 (morpheus) nel settings utente e di progetto — nessuna azione manuale richiesta, solo re-run di `/vibe:setup` dopo upgrade a 5.5.7. Cura il caso report-driven di utenti con progetto in path contenente spazi che vedevano `/bin/sh: riga 1: /path/prefix: File o directory non esistente` ad ogni PreToolUse.

### Changes

#### Fix A — Write-then-Edit false positive (`plugin/scripts/read-before-edit.sh`)

- La scansione del transcript filtrava solo `tool_use` con `name == "Read"`, ignorando `Write`. Risultato: dopo un `Write` del file X, un `Edit` su X veniva bloccato con "Run Read with no limit/offset first" — pur essendo safe (l'assistant ha appena autorato il contenuto esatto).
- Extension: il check ora accetta `name in ("Read", "Write")`. Per `Write`, qualsiasi match su path è sufficiente — `Write` implica conoscenza completa del contenuto. La logica Read (no-limit/offset, coverage-equals-file) resta invariata.
- Dimostrazione del bug incorsa durante l'authoring di 5.5.7 stessa: la memory `feedback_user_burden_zero.md` era stata creata via Write poi tentativamente estesa via Edit → hook bloccava. Caso evidente che il hook era più strict del necessario.
- Test: `tests/read-discipline/test-write-then-edit.sh` — 4 scenari (Write+Edit stesso file → allow, Write+Edit file diverso → block, Read+Edit regression guard, path normalization attraverso Write).

#### Fix B — V1 hook auto-cleanup nel reconciler (`plugin/setup/`, `plugin/skills/setup/SKILL.md`)

- **Root cause del report utente:** un hook in `~/.claude/settings.json` o `$PROJECT/.claude/settings[.local].json` con command `$CLAUDE_PROJECT_DIR/.claude/morpheus/injector.sh` (pattern VIBE v1, shippato pre-5.0). Se `$CLAUDE_PROJECT_DIR` contiene spazi, la shell del hook dispatcher splitta al primo blank e fallisce con "File o directory non esistente" per il prefisso. Fino a 5.5.6 l'utente doveva scoprire lo script esistente `plugin/scripts/vibe-v1-cleanup.sh` ed eseguirlo manualmente — violazione di `feedback_user_burden_zero`: onere diagnostico/operativo scaricato sull'utente.
- **Schema extension** — `plugin/setup/expected-state.json` guadagna la chiave `settingsHooksDenyPatterns[]` (array di `{id, description, commandContains}`). La prima entry è `morpheus-v1` con needle `.claude/morpheus/`. Schema dichiarativo: aggiungere futuri pattern deprecati è 1 diff in JSON, no code change.
- **Reconciler subcommands** — `plugin/setup/reconciler.sh` guadagna `detect-stale-hooks <settings-path>` e `apply-clean-stale-hooks <settings-path>`. Detect scansiona sia la shape canonica nested (`settings.hooks.PreToolUse[].hooks[].command`) sia la shape legacy top-level (`settings.PreToolUse[].hooks[].command`) sia `settings.statusLine.command`. Apply crea backup timestamped `settings.json.bak-stale-hooks-YYYYMMDD-HHMMSS` prima di filtrare le entry che matchano qualunque denyPattern. Preserva tutto il resto della config (env, permissions, mcpServers, ecc.).
- **Present-diff extension** — `cmd_present_diff` accetta ora la chiave `stale_hooks` nell'input JSON e rende una nuova sezione "STALE HOOKS — to remove (deprecated/broken, timestamped backup first)" che mostra path e location di ogni entry che verrà rimossa, permettendo all'utente di approvare con conoscenza.
- **SKILL.md integration** — `plugin/skills/setup/SKILL.md` §5.1 ora esegue `detect-stale-hooks` su 3 target (`~/.claude/settings.json`, `$PROJECT/.claude/settings.json`, `$PROJECT/.claude/settings.local.json`) e aggrega il risultato nella COMBINED diff mostrata all'utente. §5.4 invoca `apply-clean-stale-hooks` per ciascun target dopo approvazione.
- **Flusso utente dopo upgrade a 5.5.7:**
  1. `setup-check.sh` su SessionStart rileva version mismatch via marker (già esistente) → emit anomaly "VIBE 5.5.7 detected — run /vibe:setup to reconcile"
  2. Utente invoca `/vibe:setup`
  3. §5.1 compone il diff includendo anche le entry stale
  4. §5.2 mostra all'utente esattamente cosa verrà rimosso (path + location + motivo)
  5. §5.3 chiede approvazione esplicita
  6. §5.4 applica — backup timestamped + rewrite del settings senza le entry morpheus
  7. Alla prossima sessione CC, zero `PreToolUse hook error` da quei hook
- **Copertura rispetto a `vibe-v1-cleanup.sh`:** lo script esistente scansiona e pulisce filesystem (morpheus dir, .forge, CLAUDE.md v1, backup zip), settings.json e settings.local.json *a livello progetto*. Il nuovo reconciler step copre anche `~/.claude/settings.json` (user-level, non toccato dal cleanup script) e lo fa come parte del flow setup standard — non come comando separato che l'utente deve ricordarsi di invocare. I due layer sono complementari.
- Test: `tests/reconciler/test-stale-hooks.sh` — 13 asserzioni coprono detect/apply su shape nested, shape top-level legacy, statusLine, path con spazi (mktemp dir nominato `/tmp/vibe-stale hooks test-XXXX`), backup creation, idempotenza re-run, preservazione config non-morpheus, no-op su file inesistente, no-op su file clean (niente backup spurious), rendering present-diff.

### Principio applicato: `User Burden Zero`

`feedback_user_burden_zero.md` (salvato 2026-04-22): VIBE pubblicato deve essere bug-free auto; legacy v1, stale hooks, broken config sono responsabilità VIBE, non del user. Discriminante: un singolo comando automated apply (`/vibe:setup`) è convention standard accettabile, ≠ "capire output jq e fixare a mano" (antipattern). Questa release è la prima applicazione esplicita del principio: il cleanup v1 era già fattibile in 5.5.6 via `vibe-v1-cleanup.sh --scan ~ --deep --yes` ma richiedeva all'utente di sapere dello script e invocarlo — ora è gestito dentro `/vibe:setup` come step del reconciler con UX `detect → diff → present → apply`.

### Migration from 5.5.6

- **Automatica con un singolo comando.** Dopo l'upgrade a 5.5.7, `setup-check.sh` su SessionStart emette già la notifica esistente "VIBE 5.5.7 detected — run /vibe:setup to reconcile". Invocando `/vibe:setup`, lo step §5 presenta un diff che include eventuali hook v1 stale e applica la rimozione dopo approvazione. Se il settings utente è pulito, lo step è silent no-op (idempotente).
- **Backup sempre creato** prima di ogni mutation (`settings.json.bak-stale-hooks-YYYYMMDD-HHMMSS`). Rollback: `mv settings.json.bak-stale-hooks-* settings.json`.
- **Fix A è self-applicante:** il nuovo `read-before-edit.sh` attivo dalla prossima sessione CC dopo l'upgrade. Nessuna azione utente.
- **Copertura rispetto a progetti esistenti:** `/vibe:setup` cleana il settings del progetto corrente + settings utente globale. Per un utente con molti progetti contenenti v1 residui: eseguire `/vibe:setup` una volta globale (cleana `~/.claude/settings.json`), poi in ogni progetto interessato (cleana il settings locale). Lo script pre-esistente `plugin/scripts/vibe-v1-cleanup.sh --scan ~ --deep` resta disponibile per il filesystem-side cleanup (morpheus directory, .forge, CLAUDE.md v1), complementare a questo step.
- **Verified:** 244/244 test suite pass (242 pre-esistenti + 2 nuovi maintainer-side).

## 5.5.6 — 2026-04-22

"Hybrid-hint manifest quoting + path-with-spaces audit" — fix chirurgico a un unico mancato quoting in `plugin/hooks/hooks.json` e audit di tutti gli script hook VIBE contro file path con spazi. Patch report-driven: utente segnala errori `/bin/sh: riga 1: /path/prefix: File o directory non esistente` con CWD `/home/uh1/VIBEPROJECTS/TORA NO AI SRL SB/...`. Diagnosi: VIBE non è la root cause degli errori utente (VIBE non registra hook su `TaskCreate`/`TaskUpdate`/`ToolSearch` — tool per cui l'utente riceveva errori). Root cause: un hook nel `settings.json` utente usa `$CLAUDE_PROJECT_DIR` non quotato. Tuttavia l'audit ha rivelato che `hybrid-execution-hint.sh` (shipped 5.5.4) era l'unico hook VIBE su 16 registrato senza quote doppie attorno al path — latent fragility se `CLAUDE_PLUGIN_ROOT` contenesse spazi (es. home Windows con spazio nel username).

### Changes

- **`plugin/hooks/hooks.json:50`** — aggiunto quoting al command dell'hook `hybrid-execution-hint`. Prima: `"command": "${CLAUDE_PLUGIN_ROOT}/scripts/hybrid-execution-hint.sh"`. Dopo: `"command": "\"${CLAUDE_PLUGIN_ROOT}/scripts/hybrid-execution-hint.sh\""` — coerente con gli altri 15 hook VIBE, tutti già quotati. Latent da 5.5.4; nessun utente impatto noto fintanto che `CLAUDE_PLUGIN_ROOT` risiede in path senza spazi (tipicamente `~/.claude/plugins/cache/...`), ma è il classico quoting mancante che esplode in edge case Windows/NTFS o su install fuori dalla cache canonica.
- **`plugin/.claude-plugin/plugin.json`** — version `5.5.5` → `5.5.6`.

### Audit: spazi nei path (ipotesi utente verificata)

Test live su tutti e 5 i PreToolUse hook VIBE (`read-before-edit`, `read-discipline`, `post-edit-lint`, `security-quickscan`, `pre-tool-security`) con `file_path` contenente spazi (es. `/tmp/dir with spaces/file.txt`). **Tutti passano.** Quoting corretto su `$FILE`, `$FILE_PATH`, `$CWD` nei body script (`"$VAR"` ovunque serva, mai `$VAR` bare).

### Non fixato (out-of-scope per 5.5.6)

- **Errori `/bin/sh: riga 1: /path/prefix` su `TaskCreate`/`ToolSearch`/`TaskUpdate` nel setup utente.** Non fire'abili da hook VIBE (matcher inesistenti). Root cause è un hook user-settings con `$CLAUDE_PROJECT_DIR` non quotato, o plugin terzo mal configurato. Diagnostica lato utente:
  ```bash
  for f in ~/.claude/settings.json ~/.claude/settings.local.json \
           ./.claude/settings.json ./.claude/settings.local.json; do
    [ -f "$f" ] && echo "=== $f ===" && jq -r '
      .hooks // {} | to_entries[] |
      .key as $event | .value[]? | .hooks[]? |
      "\($event): \(.command)"
    ' "$f"
  done
  ```
  Uno strumento diagnostico automatico in `/vibe:setup` è candidato per un futuro patch cycle (capability-boost, non verification — coerente con `feedback_capability_vs_verification`).

### Migration from 5.5.5

- **Automatica.** Il fix è una riga nel manifest hook. Nessuna re-esecuzione di `/vibe:setup`. Nessuna azione utente richiesta. Si attiva dalla prossima sessione CC dopo l'upgrade.
- **Nessuna regressione:** 242/242 test pass dopo l'aggiunta dell'entry CHANGELOG.

## 5.5.5 — 2026-04-22

"Read-before-edit false positive fix" — due patch chirurgiche a `plugin/scripts/read-before-edit.sh` che risolvono spurious blocks segnalati da utenti in produzione e onorano una promessa del commento header (5.4.0) mai implementata. Fix A: path normalization via `realpath+expanduser` per gestire mismatch di forma path (tilde vs assoluto, symlink vs target, double-slash). Fix B: coverage-equals-file — un `Read` con `offset in (None,0)` e `limit >= line_count(file)` ora conta come full read. Zero scope-creep: nessun altro script toccato, nessuna modifica al manifest hook, nessuna variazione di skill/agent/command.

### Changes

- **`plugin/scripts/read-before-edit.sh` — Fix A: path normalization.** La linea 75 confrontava `inp.get("file_path") == file_path` con exact-string equality. Se l'agent usava forme path divergenti tra `Read` (es. `~/.bashrc`) e `Edit` (es. `/home/user/.bashrc`, espanso da CC), il match falliva nonostante il Read fosse avvenuto, producendo un block "Read with no limit/offset first" falso positivo. Aggiunto helper `norm(p) = os.path.realpath(os.path.expanduser(p))` applicato a entrambi i lati del confronto. Gestisce: tilde → assoluto, symlink → target reale, `//` duplicato → singolo, `./` prefix → canonico.
- **`plugin/scripts/read-before-edit.sh` — Fix B: coverage-equals-file.** Il commento header (shipped 5.4.0) dichiarava "no limit/offset, **or coverage equals file**" ma l'implementazione gestiva solo il primo ramo (linea 76: `if not inp.get("limit") and not inp.get("offset")`). Il secondo ramo ora esiste: se `offset in (None, 0)` e `limit >= line_count(target)`, il Read copre l'intero file e conta come full read. Elimina falsi positivi quando l'agent legge un file piccolo con `limit` esplicito che copre tutto.
- **`tests/read-discipline/test-path-normalization.sh`** — nuovo. 6 scenari: Read tilde + Edit assoluto, Read assoluto + Edit tilde, Read symlink + Edit target, Read target + Edit symlink, Read `//`-doubled + Edit canonico, più un negative control (Read su file diverso blocca ancora).
- **`tests/read-discipline/test-coverage-equals-file.sh`** — nuovo. 5 scenari: `limit=2000` su 5 righe (coverage ≥ file), `limit=5` su 5 righe (coverage == file), `limit=3` su 5 righe (partial → block), `offset=2 limit=2000` (parte da metà → block), regression guard no-limit/no-offset.
- **`plugin/.claude-plugin/plugin.json`** — version `5.5.4` → `5.5.5`.

### Root cause (report-driven)

Il bug è stato segnalato da utenti che editavano `~/.bashrc`:

```
Update(~/.bashrc)
  ⎿  Error: Read-before-edit: about to Edit /home/uh1/.bashrc but
     the file has not been fully Read in this transcript.
```

Il path in `Update(~/.bashrc)` era la forma con cui l'agent aveva invocato `Edit`, ma CC lo mostrava già espanso a `/home/uh1/.bashrc` al hook. Quando il transcript conteneva un `Read` loggato con forma path diversa — tipicamente perché la chiamata originale dell'agent conteneva il tilde non espanso lato transcript, oppure perché uno dei due path era un symlink — l'exact-string match falliva. La coverage-equals-file era già documentata nel commento header del 5.4.0 ma l'implementazione non la copriva.

### Migration from 5.5.4

- **Automatica.** Il fix è locale al hook script. Nessuna re-esecuzione di `/vibe:setup`. Nessuna azione utente richiesta. L'escape hatch `VIBE_READ_BEFORE_EDIT_DISABLED=1` resta valido.
- **Nessuna regressione verificata:** i test 5.4.x (`test-before-edit-allow.sh`, `test-before-edit-block.sh`, `test-before-write-newfile-allow.sh`) continuano a passare. Il caso di blocco legittimo (nessun Read nel transcript, partial read con coverage < file) resta bloccato.

### Deferred

- **README Hooks table drift.** La tabella README corrente dichiara "Eleven hook handlers" ma `hooks/hooks.json` ne registra 16 (mancano in tabella: `read-discipline`, `read-before-edit`, `side-effect-verify`, `session-end-cleanup`, `pragmatic-priming`). Drift documentario pre-esistente, fuori scope per 5.5.5 (patch bug-fix mirata) — da riallineare in un docs-sweep separato.

## 5.5.4 — 2026-04-22

Ships a dual-mode PreToolUse hook that reaches every VIBE user with the hybrid execution option (proposer + guard) — the behavior until now lived only in the maintainer's auto-memory and never traveled via the plugin marketplace. Zero new skills, zero new agents; one script, one hooks.json entry.

### Added

- **`plugin/scripts/hybrid-execution-hint.sh` (PreToolUse hook, matcher `Skill`).** Dual-mode dispatch on `tool_input.skill`:
  - **Proposer mode** fires on `superpowers:writing-plans`. Injects context telling Claude (a) to write the plan idiot-proof for Sonnet subagents (exact paths, complete code, concrete verify commands, zero "TBD"/"fill in"/"similar to Task N") and (b) at the execution-handoff step to offer three options instead of the default two: subagent-driven, inline, or HYBRID (≥30% tasks mechanical AND ≥30% creative, AND mechanical tasks idiot-proof — Opus inline for creative/small, Sonnet subagents for mechanical bulk).
  - **Guard mode** fires on `superpowers:subagent-driven-development`. Injects context telling Claude to audit the plan for idiot-proofness before dispatching subagents; abort + recommend inline if any task is vague. Prevents silent subagent failures on under-specified plans.
- **Activation:** automatic on plugin install/upgrade via `plugin/hooks/hooks.json`. No `/vibe:setup` re-run required.
- **Opt-out:** `export VIBE_NO_HYBRID_HINT=1` in your shell rc or CC settings env block.

### Rationale

The hybrid execution mode (inline Opus for judgment, Sonnet subagents for mechanical bulk) was empirically validated on the VIBE 5.1 self-healing wizard plan — 13 tasks, 5h total, 204 tests green, and one plan bug caught by a subagent that pure-inline review would have missed. The decision logic (`>=30% mechanical AND >=30% creative → hybrid recommended; all mechanical tasks must be idiot-proof for Sonnet`) lived only in the maintainer's auto-memory (`feedback_execution_method_hybrid.md`), which does not travel with the marketplace install. This hook ships the same logic to every VIBE user.

### Migration from 5.5.3

Automatic. On plugin upgrade, Claude Code reads the new `hooks.json` entry and registers the hook. Next `superpowers:writing-plans` invocation surfaces the three-option handoff. Existing `/vibe:setup` state untouched; no re-run needed.
## 5.5.3 — 2026-04-22

Field-report driven reduction-of-surface: seven fixes to `/vibe:setup` that turn the first-contact experience into zero-chore autonomy, plus one schema fix to the pragmatic agent caught during release test triage. No new features, no surface expansion — just removal of friction the wizard was causing for marketplace users, plus one outlier frontmatter normalized.

### Fixed

- **Reconciler JSON composition (Fix 4).** The `COMBINED` payload in `§5.1` now passes booleans as JSON-parseable strings through environment variables, eliminating the `NameError: name 'false' is not defined` that triggered on the first classification of a user-authored CLAUDE.md.
- **Adaptive thinking-display menu (Fix 3).** `§5.6` branches on the detector output — shell-only, VS Code-only, and neither-needed cases now auto-apply or skip without prompting. Only the both-candidates case asks, and it's a single 2-way prompt instead of the old 4-way menu.
- **Autonomous codebase mapping (Fix 1).** `§6` is now default-on, dispatched as a background task, with no misleading duration estimate. Opt-out via `VIBE_NO_CODEBASE_MAP=1`. The agent reads project files via Read/Grep/Glob and writes findings to `.claude/agent-memory/` and user auto-memory — set the opt-out if your project is privacy-sensitive.
- **Pragmatic priming auto-apply (Fix 2).** `§5.7` no longer asks you to hand-edit `~/.bashrc`. A new reconciler subcommand `apply-pragmatic-alias` extends the alias from `§5.6` in place, idempotently, with backup.
- **CLAUDE.md path auto-fix (Fix 5).** The researcher verifies filesystem path references in CLAUDE.md and writes corrections to its memory namespace. A new setup step `§6.5` auto-applies high-confidence case-only mismatches via Edit, surfaces low-confidence ones as warnings in the final summary.
- **LSP auto-install (Fix 6).** `§2.4` runs `claude plugin install <lsp>` for each detected primary language whose LSP plugin is missing, falling back to the existing recommendation text on failure. The Python field-report case (pyright-lsp as a manual post-setup chore) is now fully automatic.
- **Internal lexicon pass (Fix 7).** User-facing output no longer leaks internal tokens (`LEGACY_NO_VIBE_TOKENS`, `MANAGED_REGION_PRESENT`, `Arc Reactor Agnostic`). `cmd_present_diff` translates classification modes to human descriptions. Internal flag values passed to reconciler are unchanged.
- **Pragmatic agent frontmatter schema (Fix 8).** `plugin/agents/pragmatic.md` shipped in 5.5.0 with a nested `model:\n  primary: opus-4-7\n  effort: xhigh` block — an outlier against the flat `model: <tier>` schema every other VIBE agent uses. The agent frontmatter-validation test caught the drift; it was dismissed as pre-existing for three release cycles. Flattened to `model: opus` + top-level `effort: xhigh` (same effort value as the removed nested copy). No behavioral change in the common case (CC's latest opus = 4-7 today); the agent frontmatter now loads uniformly across the whole `plugin/agents/` tree.

### Migration from 5.5.2

Automatic — no action required. Re-run `/vibe:setup` to pick up the new flow. Your existing settings are preserved; the wizard detects what's already configured and only applies gaps.

### Privacy note

The `§6` researcher agent reads your project files to build a codebase map. Findings are written to `.claude/agent-memory/vibe-researcher/` (project-local) and your user auto-memory (`~/.claude/projects/<slug>/memory/`). Nothing is uploaded. To opt out of mapping entirely, export `VIBE_NO_CODEBASE_MAP=1` before running `/vibe:setup`.

## 5.5.2 — 2026-04-22

"A/B consolidation tail + audit grader v2" — resolves the 3 pairwise-judge A/B items deferred from 5.5.1 §11.4 (baptist / ghostwriter / orson) and promotes `grade-v2.py` to the default audit grader. All 3 A/B outcomes confirm the 5.5.0 incumbent — **zero default switches**, same pattern as 5.5.1's 6-item consolidation. **No plugin surface change** (all work is maintainer-side decision docs + test-infrastructure changes; `plugin/` is byte-identical to 5.5.1 except for version string + this CHANGELOG + README subsection).

### A/B decisions (§11.4 resolution, no plugin code change)

All decision docs and raw results live in `docs/` + `tests/model-validation/results/` (both gitignored, maintainer-side). Summary is here because the decisions shape what the next upgrade cycle does and do not:

- **B1 Baptist pairwise (§2.2 extension).** Blinded pairwise-judge on InferenceBox CRO audit prompt (`opus-4-7` judge, N=5 pairs, coin-flip label swap). `opus-4-7` wins **5/5** against `opus-4-6`. `opus-4-6` win rate = 0.000, below 0.30 switch threshold. **KEEP `opus-4-7` on `/vibe:baptist`.** Qualitative: axis 1 (funnel-diagnosis sharpness) was the decisive axis in 4/5 pairs — 4-7 consistently identifies the absolute-volume loss frame (7,988-visitor hero-CTA drop) while 4-6 pivots to rate anomalies or mislabels post-lift rates. Axis 4 (experiment-design math) also favored 4-7: full two-proportion formula with explicit z-values vs. 4-6's handwaved MDE. Criteria.md's framing of axes 1 and 4 as "the spine, harder to fake than axis 5" matches the verdict direction. Decision doc: `docs/2026-04-22-baptist-pairwise-ab.md`.
- **B2 Ghostwriter pairwise (§2.2 extension).** Blinded pairwise-judge on InferenceBox SEO+GEO pillar article prompt (`opus-4-7` judge, N=5 pairs). `opus-4-7` wins **4/5** against `opus-4-6`. `opus-4-6` win rate = 0.200, below 0.30 switch threshold. **KEEP `opus-4-7` on `/vibe:ghostwriter`.** Qualitative: axis 5 (creative distinctiveness / analytical depth) drove 4/5 wins — 4-7 brings fresh analytical scaffolding (drift taxonomies, evaluator hierarchies, gate-type distinctions) that 4-6's drafts don't match. 4-6's single win (pair 5) came on composition discipline: 4-7 slipped into a generic "start a free trial" CTA ending that the criteria explicitly warned against. Tracked as a future fixture enhancement (add explicit ending-anti-pattern to prompt), not a model verdict. Decision doc: `docs/2026-04-22-ghostwriter-pairwise-ab.md`.
- **B3 Orson pairwise (§2.2 extension).** Blinded pairwise-judge on InferenceBox video-audit prompt (`opus-4-7` judge, N=5 pairs, 10 planted issues + 1 correctly-configured FP trap). `opus-4-7` wins **4/5** against `opus-4-6`. `opus-4-6` win rate = 0.200, below 0.30 switch threshold. **KEEP `opus-4-7` on `/vibe:orson`.** Qualitative: 4-7 catches the flagship LCP-driving issue (hero missing-poster) in all 4 wins; 4-6 misses it entirely in 3 of its 4 losses — a systematic detection-coverage gap on the top-priority axis for a video-audit skill. 4-6's single win (pair 4) is on axis 5 fix-composition quality, including flagging 4-7's AV1-alternates recommendation as a codec-fad. Detection coverage dominates over fix composition on audit tasks; 4-7 has the coverage edge. Decision doc: `docs/2026-04-22-orson-pairwise-ab.md`.

### Changed (maintainer-side, not shipped with plugin)

- **Audit grader v2 promoted to default (§11.4 grader tightening).** `tests/model-validation/fixtures/audit-orchestrator-v2/grade.py` is now v2 (was `grade-v2.py` during 5.5.1→5.5.2 prep). v1 archived to `grade-v1-archived.py` for reproducibility of 5.5.1 A1 results. v2 fixes 4 classes of false positive in the issue/distractor detection regex over the model's audit transcript: (1) answer-key leakage — distractor labels in the answer-key file itself were triggering false `flag` counts; (2) negative-context suppression — the grader now ignores issue strings that appear inside a negated clause (*"X would be a distractor"*, *"we correctly skipped X"*); (3) paragraph-bounded regex — matches no longer cross paragraph boundaries, so an issue-12 mention in one paragraph can't alias an issue-15 regex in the next; (4) line+anchor disambiguation — issue locations are now matched against the concrete line+anchor emitted by the fixture, not just the issue slug. Validated on stored transcript `tests/model-validation/transcripts/2026-04-22-audit-v2-opus-4-6-run1.jsonl` → score 1.8 (reproduces the prep-doc prediction exactly). No impact on 5.5.1 A1 decision (both models pay the same tax under v1; v2 tightens for future re-runs). Prep doc: `docs/2026-04-22-audit-grader-v2-prep.md`.

### Migration from 5.5.1

- **Automatic / no-op for end users.** Every user-visible file in `plugin/` is unchanged from 5.5.1 except version strings (`plugin.json`, `marketplace.json` description) and this CHANGELOG + the corresponding README subsection. No `/vibe:setup` rerun required. No user action needed on upgrade.
- **No default switches.** Every A/B decision validated the 5.5.0 incumbent. Users upgrading from 5.5.1 see no model change in any skill or agent.
- **Maintainers:** if re-running audit coverage A/B, use `grade.py` (v2) going forward. `grade-v1-archived.py` remains available in-tree for reproducing 5.5.1 A1 numbers.

### Deferred to 5.6.0+

- **Ghostwriter fixture ending-anti-pattern tweak.** Add explicit negative example to the prompt's Constraints section (*"Do NOT end with 'start a free trial', 'try InferenceBox today', or any generic commercial CTA — end on methodology recap or specific next step"*) to remove the 4-7 generic-CTA failure mode observed in B2 pair 5 as a discriminator. Prompt-engineering fix, not a model switch.
- **Audit fixture v3.** v2 tightens the 4 FP classes observed in 5.5.1 A1 and is ship-quality today. A future v3 would go further: per-file regex scoping so d2's `aria-disabled` distractor can't cross-trigger on issue-12 in the same file, plus a reproducible answer-key mutation harness for saturation-hardening. Low priority until the next audit coverage re-A/B is needed (no signal from current users that `/vibe:audit` quality has drifted).
- **Skim-pattern promotion, T36 injection-cut recommendations, paper v2.** Deferred per 5.5.0 §11.4 and 5.5.1 CHANGELOG — unchanged, still pending.
## 5.5.1 — 2026-04-22

"A/B consolidation patch" — resolves the 6 A/B items deferred from 5.5.0 §11.4 (empirical model-default decisions), plus two user-visible hook/hygiene fixes. Net plugin surface change: one-line setup skill annotation + PreToolUse hook contract fix + `.gitignore` restore. All 6 A/B outcomes confirm the 5.5.0 incumbent — **zero default switches**.

### Fixed

- **PreToolUse read-discipline hook reasons now surface in CC UX (§2.9 follow-up).** In 5.5.0, `read-discipline.sh` and `read-before-edit.sh` emitted `{"reason": "..."}` as a bare JSON object on **stderr** with `exit 2` per the CC hook spec as then-documented. CC Edit/Write tool error messages still reported `"PreToolUse hook error: ... No stderr output"` even though smoke tests confirmed stderr had the JSON. Root cause: CC's current hook contract expects PreToolUse decisions as `{"decision": "block", "reason": "..."}` on **stdout** (same pattern Stop-hook-class events use), not a bare-reason object on stderr. Both hooks migrated: JSON now goes to stdout with the top-level `decision` + `reason` keys, exit 0. Smoke-tested against live Edit/Write — the actionable reason (`"Read X first"` / `"partial read blocked (limit=N offset=M on file smaller than 400 KB)"`) now appears inline in CC's block message instead of the opaque "No stderr output" placeholder. (commit `f34a864`)
- **`.gitignore` `/references/` entry restored.** The entry dropped out of `.gitignore` during the 5.5.0 `/scripts/` audience-test refactor (`/references/` is maintainer-side vendored CC source, not plugin runtime). Committed inadvertently by an earlier plugin sweep. Restored; the untracked `?? references/` state returns to gitignored. (commit `5d66b59`)

### Changed

- **Setup skill Step 5.7 annotation (§2.6 A4).** `plugin/skills/setup/SKILL.md` Step 5.7 (Pragmatic Priming opt-in install) gains a one-line empirical-validation reference pointing to the A4 A/B decision doc. No behavior change — users still see the same opt-in line and copy it manually per Arc Reactor Agnostic. The annotation exists so a user evaluating whether to enable Tier A can see the measured effect size up front. (commit `3afbe1c`)

### A/B decisions (§11.4 resolution, no plugin code change)

All decision docs and raw results live in `docs/` + `tests/model-validation/results/` (both gitignored, maintainer-side). Summary is here because the *decisions* shape what the next upgrade cycle does and do not:

- **A1 Audit v2 (§2.1).** Coverage A/B on fixture v2 (20 real issues + 8 distractors, out-of-tree answer-key). `opus-4-6` mean score 1.250 vs `opus-4-7` mean 1.358 across 3 runs each. Δ = +0.108 coverage-score, well below the 0.40 switch threshold. **KEEP `opus-4-7` on `/vibe:audit`.** Qualitative: 4-7 flags 30% fewer distractors, which matters for audit orchestration because each flagged finding spawns a downstream triage task. Decision doc: `docs/2026-04-22-audit-v2-ab.md`.
- **A2 Seurat pairwise (§2.2).** Blinded pairwise-judge on InferenceBox landing-page prompt (`opus-4-7` judge, N=5 pairs, coin-flip label swap). `opus-4-7` wins **5/5** against `opus-4-6`. `opus-4-6` win rate = 0.000, below 0.30 switch threshold. **KEEP `opus-4-7` on `/vibe:seurat`.** Qualitative: 5/5 judge rationales cite creative distinctiveness (axis 5) in 4-7's favor — 4-7 consistently shows the product via mocked interface elements (JSON diff, side-by-side panels) vs 4-6's generic hero-plus-feature-cards default. One pair had a 4-6 tool-refusal hallucination (same failure mode observed in A3). Decision doc: `docs/2026-04-22-seurat-pairwise-ab.md`. Harness fix required: `--tools ""` added to dispatch (see §A/B harness note below).
- **A3 Forge (§2.3).** Coverage A/B on forge-spec 18-item checklist. `opus-4-6` mean 0.63 vs `opus-4-7` mean 0.87 across 3 runs each. Δ = +0.24 coverage, above the 0.20 switch threshold **in favor of current primary**. **KEEP `opus-4-7` on `/vibe:forge`.** Qualitative: 4-6 exhibits a "hallucinate prior assistant turn and refuse to re-emit" failure mode on single-turn generate-only prompts (3/6 runs affected); 4-7 does not. Decision doc: `docs/2026-04-22-forge-ab.md`.
- **A4 Pragmatic hedge-reduction (§2.6).** Hedge-word density A/B on 20 decision-type prompts (40 `claude -p --model opus-4-7` calls: 20 unprimed + 20 primed with the Askell 5-bullet preamble). Unprimed density 0.00480 hedge-words/word; primed density 0.00048. **Density reduction: 90%**, well above the 30% ship threshold. Absolute hedge-word count 10 → 2 across the 20 primed outputs. Qualitative: primed outputs are ~40% longer but eliminate the documented opus-4-7 sycophantic deflection tell (*"want me to dig into your actual query patterns before you commit?"* → definitive rules). **SHIP Tier A as retroactive validation** (Tier A was already shipped as opt-in in 5.5.0 §2.6 via `/vibe:setup` Step 5.7 — no auto-enable per Arc Reactor Agnostic). Decision doc: `docs/2026-04-22-pragmatic-hedge-ab.md`.
- **A5 vibe:reviewer vs /ultrareview (§2.4).** Empirical comparison between the VIBE `@vibe:reviewer` agent (Sonnet, in-session, free-at-point-of-use, project-scope memory, dev-loop) and CC's built-in `/ultrareview` (remote, billable as Extra Usage, GitHub-PR-gated, stateless, interactive confirmation dialog). Tools are **complementary, not substitutive** — different entry points (mid-dev vs PR), different cost profiles, different memory models, different self-review framing. The iron-man-mandate test (`feedback_iron_man_mandate`) confirms `vibe:reviewer` exploits the CC project-scope agent-memory primitive in a way `/ultrareview` cannot. **KEEP `@vibe:reviewer` as-is.** No retire, no refactor. Decision doc: `docs/2026-04-22-vibe-reviewer-ultrareview-decision.md`.
- **A6 Apply A5 decision (§2.4 conditional).** A6 was contingent on A5 deciding retire-or-refactor. Since A5 = keep, **A6 closes N/A** (no plugin change required).

### A/B harness note (tests/model-validation, gitignored)

`tests/model-validation/run-pairwise.sh` gained two fixes during A2 execution. Both are maintainer infrastructure (not shipped with the plugin); documented here so future A/B runs reproduce:

1. **`--tools ""` on every dispatch.** `--disable-slash-commands` only blocks user-typed `/cmd` — it does **not** prevent the model from invoking the `Skill` tool autonomously. On seurat-flavored prompts, `opus-4-7` autonomously invoked the Skill tool (visible in `--output-format stream-json`: first assistant event was `tool_use: Skill(['skill'])`), which triggered full skill loading with `isolation: worktree` and hung the dispatch for 30+ minutes before CC session timeout. Adding `--tools ""` forces text-only generation.
2. **Non-clobbering error branch.** Previous pattern `|| echo "FAIL" > "$OUT"` would overwrite any partial stdout on non-zero exit. New pattern tests `if [[ ! -s "$OUT" ]]` before writing "FAIL", preserving partial outputs for forensic inspection.

### Migration from 5.5.0

- **Automatic.** The two user-visible hook fixes (read-discipline stderr → stdout contract + `.gitignore` restore) take effect on the next session. No `/vibe:setup` rerun required. No user action needed.
- **No default switches.** Every A/B decision validated the 5.5.0 incumbent. Users upgrading from 5.5.0 see no model change in any skill or agent.

### Deferred to 5.5.2+

- **Seurat pairwise extension to baptist / ghostwriter / orson.** 5.5.0 §2.2 noted these as "ship-if-budget" secondary pairwise A/B targets. With the harness validated by the A2 seurat run, these become candidates for a future patch cycle (low priority — no reported quality issues on the current primaries).
- **Audit-fixture grader tightening.** A1 notes document a grader-level cross-file regex over-match (e.g., d2 `aria-disabled` regex trips when a model correctly reports issue-12 on the same `about.html` file). The A/B verdict is unchanged (both models pay the same tax), but v3 of the fixture would rebuild the distractor regexes to be file-aware. Low priority until a re-A/B is needed.

## 5.5.0 — 2026-04-21

"Pending Consolidation + Intelligent Spec Routing" — 9-item consolidation ciclo integrating 7 pending ex-§11.4 of 5.4.x master spec + 2 emergent (spec-routing agent + hook stderr dogfooding fix). Infrastructure ship: core user-facing features and fixes complete; A/B empirical decisions (skill default switches) deferred to 5.5.1 patch cycle per explicit scope discipline.

### Added

- **§2.8b Session model default persistence.** `/vibe:setup` now writes `settings["model"] = "opus"` via new reconciler sub-commands `detect-top-level` + `apply-top-level`. `cmd_present_diff` extended to show the top-level change before user approves (closes `feedback_honesty_patterns` Pattern 2 latent where wizard claimed "[x] Model set to opus" but reconciler never wrote it in 5.4.x). Schema: `expected-state.json` gains `settingsTopLevel.model` without bumping `schemaVersion` (optional field with fallback `schema.get('settingsTopLevel', {})`).
- **§2.8c `/vibe:spec` skill.** Intelligent spec routing with hybrid classifier. Word-boundary keyword matching (strong-signal rule `max≥2 AND max≥2*min`) + `haiku-4-5` LLM fallback on ambiguous/no-signal cases + `opus-4-7` final fallback. Scope estimator picks single-doc vs split based on `token_count > 800 OR scope_matches ≥ 2`. Dispatcher uses `claude -p --model <resolved> --effort xhigh` CLI pattern (parallel to atomic-orchestrator 5.0+ worker dispatch). Template `spec-writer-prompt.md` embeds plan-for-executor principle inline (Arc Reactor Agnostic: no maintainer-memory cross-ref). Classifier A/B: **20/20 PASS** on N=20 fixture (10 creative + 10 instruction), zero LLM fallbacks needed. Env escape hatch: `VIBE_SPEC_FORCE_MODEL=<model-id>`.
- **§2.6 Pragmatic Priming 3-tier** (Askell-inspired ~30-token preamble, mitigates documented Opus 4.7 hedging + sycophancy tells).
  - **Tier A (shell wrapper, recommended):** `/vibe:setup` Step 5.7 offers opt-in install. Copies `plugin/skills/setup/references/pragmatic-prompt.txt` to `~/.claude/vibe-pragmatic-prompt.txt` and surfaces the exact `alias claude='... --append-system-prompt ...'` line for user to add (does NOT auto-modify shell rc per Arc Reactor Agnostic). O(1) token cost per conversation (cached via prompt caching).
  - **Tier B (UserPromptSubmit hook, fallback):** `plugin/scripts/pragmatic-priming.sh` gated strictly `VIBE_PRAGMATIC_MODE=1` (exact string match; any other value including `0`, `true`, unset = OFF). Emits preamble as `additionalContext` on every user prompt. O(N) token cost per conversation turn. Registered on new `UserPromptSubmit` lifecycle event (plugin surface grows 8→9 lifecycle events).
  - **Tier C (per-task agent):** `plugin/agents/pragmatic.md`. Invoke via `@vibe:pragmatic` or `claude --agent pragmatic`. Strongest scoping, zero persistent config.
- **§2.2 Pairwise-judge A/B harness** (`tests/model-validation/run-pairwise.sh`, maintainer dev infra). Novel blinded A/B for subjective skills: coin-flip label swap + opus-4-7 as third-model judge + JSON logs both `coin` and `judge_choice` for correct attribution. Decision rule: win rate ≥70% → switch default. Seurat fixture ready (criteria.md + prompt.md). **A/B execution deferred 5.5.1.**
- **§2.1 Audit fixture v2** (disk-only, `tests/model-validation/fixtures/audit-orchestrator-v2/`). Out-of-tree ground truth (`answer-key.json`), 20 real issues + 8 adversarial distractors across 8 files. **Zero inline `<!-- issue N -->` markers** (the leakage suspected of saturating v1 at 100/100). Revised coverage formula: `score = 2 * TP_rate - FP_rate`. A/B re-run deferred 5.5.1.
- **§2.3 Forge coverage A/B fixture** (disk-only, `tests/model-validation/fixtures/forge/`). Seed spec prompt (`/vibe:pr-review` SKILL generation) + 18-item checklist ground truth. A/B run deferred 5.5.1.
- **§2.7 Context injection audit infrastructure.** `scripts/dev-injection-audit.sh` (maintainer dev tool, tracked but non shipped — `scripts/` is maintainer-side per audience test). Enumerates every plugin injection point: CLAUDE.md managed region, skill descriptions, agent prompts, PreToolUse hook reasons, UserPromptSubmit Tier B, Stop hook feedback, shared protocol files. Estimates token cost (chars÷4) + tags frequency (once/per-turn/on-block/per-invocation). Baseline generated: ~1200-token CLAUDE.md + ~$TOTAL_SKILL_DESC-token skill descriptions on initial session load. Paper v2 phase 1 now **unblocked** (structural injection baseline measurable); T36 measurement A/B + T37 cut recommendations deferred to 5.6.0.

### Changed

- **`plugin/hooks/hooks.json`** gains `UserPromptSubmit` entry for `pragmatic-priming.sh` (8→9 lifecycle events, 12→13 hook handlers when Tier B active; unchanged when Tier B off since hook exits 0 without side effects).
- **`plugin/skills/setup/SKILL.md`** Step 4.1 proposal table + Step 4.2 explanation bullet annotated with persistence mechanism. Step 5.1 COMBINED JSON builder + Step 5.4 Apply block extended with `apply-top-level` invocation. New Step 5.7 Pragmatic Priming opt-in install flow.
- **`plugin/setup/reconciler.sh`** gains `cmd_detect_top_level`, `cmd_apply_top_level` (patterned after `cmd_detect_env`/`cmd_apply_env`, with `.bak-top-$ts` backup naming differentiated from env's `.bak-$ts`). `cmd_present_diff` extended to render `SETTINGS (top-level)` section between ENV and DATA blocks.
- **`plugin/skills/help/SKILL.md`** registers `/vibe:spec` in the skills table.
- **`plugin/setup/expected-state.json`** gains optional `settingsTopLevel.model = "opus"` top-level key.

### Fixed

- **§2.9 Hook stderr output now reaches CC.** Removed `2>&1 >/dev/null` redirect pattern (3 occurrences: 2 in `read-before-edit.sh` block + advisory branches, 1 in `read-discipline.sh` block). Bash LEFT-TO-RIGHT evaluation made the JSON reason leak to hook stdout instead of stderr, so CC reported `"No stderr output"` instead of the actionable reason ("Read X first" / "partial read blocked"). Bug was latent since the hooks shipped in 5.4.0; caught via dogfooding during 5.5.0 spec authoring session itself (author was blocked editing their own spec file and had to user-interrupt to investigate). Header contract `"emits JSON {reason} on stderr"` now actually honored. **Residual:** CC still reports `"No stderr output"` via Edit/Write tool invocations despite fix — see 5.5.1 patch candidate below.
- **§2.8a Wizard honesty.** Step 4.1 + Step 4.2 now accurately describe that model setting is persisted via reconciler (not "set" in the abstract). Closes `feedback_honesty_patterns` Pattern 2 latent violation — claim "Model set to opus" becomes true post-§2.8b.

### Internal (no shipped change)

- **Audit fixture v2** (`tests/model-validation/fixtures/audit-orchestrator-v2/`): 20 issues + 8 distractors + out-of-tree answer-key.json. Ready for 5.5.1 A/B re-run.
- **Forge fixture** (`tests/model-validation/fixtures/forge/`): seed + 18-item checklist. Ready for 5.5.1 A/B.
- **Seurat pairwise fixture** (`tests/model-validation/fixtures/seurat-pairwise/`): 5-axis criteria + InferenceBox landing page prompt.
- **Classifier fixture** (`tests/vibe-spec/classifier-fixture.md`): 20-prompt labeled + `run-ab.sh` runner. Validation **20/20 = 100% PASS** on first run (decision doc in `docs/2026-04-21-classifier-ab.md`).
- **`scripts/dev-analyze-skim-rate.sh`** maintainer tool. Skim-pattern promotion decision: **INSUFFICIENT DATA** → flag stays gated off, 5.6.0 prerequisites documented.
- **`scripts/dev-injection-audit.sh`** maintainer tool. Map phase complete, measure phase deferred 5.6.0.

### Migration from 5.4.3

- **Automatic on next `/vibe:setup` run.** The reconciler now detects + proposes + applies the top-level `model` setting. User sees the change in the diff before approving. Users with custom `model` in their settings.json: reconciler detects mismatch and offers update; decline to keep custom.
- **No env changes required** for default behavior. Tier B Pragmatic Priming is opt-in via `VIBE_PRAGMATIC_MODE=1`; unset/other values = disabled.
- **No marketplace descriptor changes** needed beyond version field. `bump-version.sh` handles plugin.json + marketplace.json + README What's New.
- **UserPromptSubmit hook new lifecycle event.** Users on 5.4.x pausing/resuming VIBE hooks: the new event is registered but only fires when `VIBE_PRAGMATIC_MODE=1` explicitly enabled, so no behavior change for default users.

### Deferred to 5.5.1 (patch cycle, A/B execution-heavy)

- §2.1 audit v2 A/B re-run on `opus-4-6` vs `opus-4-7` + default decision
- §2.2 Seurat pairwise validation (confirm harness works end-to-end + default decision; then optionally baptist/ghostwriter/orson)
- §2.3 Forge coverage A/B + default decision
- §2.4 vibe:reviewer empirical `/ultrareview` comparison + decision (keep/refactor/retire; if refactor, implementation in 5.5.2 dedicated plan per scope rule)
- §2.6 Pragmatic hedge-reduction A/B (target ≥30% hedge-word density reduction)
- §2.9 hook stderr CC-opacity follow-up: investigate why CC reports `"No stderr output"` despite stderr having content (likely CC PreToolUse hook contract requires specific JSON shape on stdout vs stderr)

## 5.4.3 — 2026-04-21

### Fixed
- **Read-discipline hooks now functional.** In 5.4.0 the `read-discipline` and `read-before-edit` PreToolUse hooks were registered via `vibeHooks` in `~/.claude/settings.json` by the reconciler. The registered command used `${CLAUDE_PLUGIN_ROOT}`, which Claude Code only substitutes for hooks defined in a plugin's `hooks/hooks.json`. In user `settings.json` the variable stayed literal, so every Read/Edit/Write produced a `PreToolUse hook error: Failed to run …${CLAUDE_PLUGIN_ROOT}…` and the hook body never executed. Net effect: the blocking enforcement advertised by 5.4.0 was silently inert, `read-discipline-events.jsonl` only accumulated test-suite entries, and the "dogfooding passivo attivo" note in the 5.4.2 ship summary described a measurement of noise, not signal. Hooks are now declared in `plugin/hooks/hooks.json` where `${CLAUDE_PLUGIN_ROOT}` resolves; the user-settings path is retired.

### Changed
- **`plugin/hooks/hooks.json`** gains two `PreToolUse` entries: `Read` → `read-discipline.sh`, `Edit|Write` → `read-before-edit.sh`. Both were previously intended to be registered by the reconciler into user settings; they are now plugin-native and portable across every install without a reconcile step.
- **`plugin/setup/expected-state.json`** drops the `vibeHooks` block (no longer applicable; registration is handled by the plugin manifest).
- **`plugin/setup/reconciler.sh`** removes the `detect-hooks` and `apply-hooks` subcommands (dead code after the registration path changed).
- **`plugin/scripts/setup-check.sh`** removes Check 6 (the SessionStart nag about missing `vibeHooks`). The anomaly it flagged no longer exists.
- **`plugin/setup/smart-generator.sh`** capability audit now probes both `~/.claude/settings.json` and `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json` when deciding which failure-mode defenses are armed. Previously it looked only at user settings, which meant plugin-native hooks (rhetoric-guard, side-effect-verify, atomic-enforcement, pre-tool-security) were erroneously reported as "missing" in every generated CLAUDE.md since 5.4.0 — a latent bug masked by the overlapping vibeHooks path.

### Migration from 5.4.2
- One-time user action: open `~/.claude/settings.json` and delete the top-level `"hooks": { "PreToolUse": [ … read-discipline.sh / read-before-edit.sh … ] }` block. `/vibe:setup` will not re-add it. No other change is required; the two hooks are already active via the plugin manifest on the first new session after upgrade.

## 5.4.2 — 2026-04-21

### Changed
- **emmet primary → `opus-4-6`.** A/B on new `emmet-bugs` fixture (15 seeded issues across runtime errors, logic bugs, missing coverage, tech debt): 3 runs × 2 models. `opus-4-6 = 100%` coverage (45/45), `opus-4-7 = 80%` (36/45, with Run 1 emitting only 6/15 — apparent compression-to-severity-summary bias on enumerated output). 20pt delta meets switch threshold. See `tests/model-validation/results/2026-04-21-emmet-ab.md`.

### Internal (no shipped change)
- audit A/B re-run on hardened 20-issue fixture (`audit-orchestrator`). Both models returned 100%, fixture still saturated — `opus-4-7` retained. Next-cycle redesign deferred: adversarial distractors + out-of-tree ground truth needed since inline `<!-- issue N -->` markers are probably leaking. See `tests/model-validation/results/2026-04-21-audit-ab.md`.
- `emmet-bugs` A/B fixture added (15 issues; 4 categories). Disk-only — `tests/` gitignored.

### Migration from 5.4.1
- No user action required. Existing sessions continue working. Next `/vibe:emmet` invocation will route to `opus-4-6` automatically via the resolver.

## 5.4.1 — 2026-04-21

### Changed
- **Heimdall primary → `opus-4-6`.** A/B run in 5.4.0 (3 runs × 2 models on `heimdall-h2` fixture) found `opus-4-6 = 100%` coverage vs `opus-4-7 = 93.3%`. Gap 6.7pt is below the plan's 20pt switch threshold, but the miss pattern (2/3 runs of 4.7 claimed `src/views/comment.html` absent when it exists) is exactly the read-discipline failure mode VIBE was built to compensate. Qualitative override of the 20pt rule applied. See `tests/model-validation/results/2026-04-20-heimdall-ab.md`.
- **Model matrix schema simplified: dropped `fallback` field.** Per-skill fallback was redundant: runtime transient failures are handled by Claude Code's `--fallback-model` CLI flag; model retirement is handled by bumping `primary`, not by a persistent per-skill declaration. Schema now requires only `primary` and `effort`. Applied across `validate-frontmatter.sh`, `model-matrix-resolver.sh`, and all 9 declaring `SKILL.md` files.

### Internal (no shipped change)
- Audit-orchestrator A/B fixture hardened from 12 seeded issues to 20 (8 subtle additions across security, SEO/GEO, a11y) — prep for 5.4.2 A/B re-run (prior 5.4.0 run saturated at 100/100, uninformative).

### Migration from 5.4.0
- No action required. Existing SKILL.md frontmatters with a `fallback:` line continue to validate (validator now silently ignores the field); they can be cleaned up opportunistically. Resolver output no longer includes `fallback`, but no consumer depended on it (Claude Code's own fallback mechanism is unchanged).

## 5.4.0 — 2026-04-20

### Added — Reading Armor (master spec §2.1)

- **`read-discipline.sh`** PreToolUse hook on `Read`. Blocks partial reads (`limit`/`offset`) on files smaller than 400 KB absent an explicit region request in the user transcript. Escape hatch: `VIBE_READ_DISCIPLINE_DISABLED=1`. Diagnostic log at `${CLAUDE_PLUGIN_DATA}/read-discipline-events.jsonl`.
- **`read-before-edit.sh`** PreToolUse hook on `Edit` / `Write`. Blocks mutations on files that were never fully Read in the current transcript (Writes on non-existing files exempt). Escape hatch: `VIBE_READ_BEFORE_EDIT_DISABLED=1`.
- **Rhetoric-guard skim-tells** category. 7 new patterns (`from the filename`, `a quick scan`, `it appears that`, etc.). Gated by `VIBE_RG_SKIM_PATTERNS_ENABLED=1` (default off in 5.4.0).

### Added — Smart Arc Reactor (master spec §2.2)

- **CLAUDE.md Smart Generator.** `/vibe:setup` now injects four managed sub-sections into CLAUDE.md: *Project Context* (stack, framework, entry point, 3–5 load-bearing conventions), *Model Usage Pattern* (Opus-planning / Sonnet-implementation routing), *Capability Audit* (which VIBE failure-mode defenses are armed), *VIBE Limits* (harness positioning). Hard budget: 1200 tokens total, enforced post-generation.

### Added — Skill Model/Effort Matrix (master spec §2.3)

- **Declarative `model:` block** in SKILL.md frontmatter. Subkeys: `primary`, `effort` (low/medium/high/xhigh/max), `fallback`. Resolved at invocation by `model-matrix-resolver.sh`.
- **A/B harness** at `tests/model-validation/run-ab.sh` plus two fixtures (`heimdall-h2`, `audit-orchestrator`). `tests/model-validation/results/` stores decision records.
- **Defaults updated from A/B evidence** for `heimdall` and `audit` (see `results/2026-04-2X-*-ab.md`). Seven other skills (seurat, baptist, ghostwriter, emmet, scribe, orson, forge) declare routing explicitly per plan task 15.

### Changed

- **`expected-state.json`** schema version stays at 1; `version` field bumps to `5.4.0`. New keys: `vibeHooks`, `skimPatternFlag`.
- **`claude-md-template.md`** replaces the 5.1 minimal managed block with four placeholders filled by the smart generator.
- **`reconciler.sh`** gains `generate-managed-content`, `detect-hooks`, `apply-hooks` subcommands; `apply-claude-md` splices the four blocks.
- **`setup-check.sh`** adds Check 6: missing `vibeHooks` in user `settings.json` triggers a setup reminder.
- **`validate-frontmatter.sh`** accepts the optional `model:` block.

### Migration from 5.3.x

First invocation after upgrading fires Check 5 (version marker drift, from 5.1) and Check 6 (new hooks not yet registered). Running `/vibe:setup` reconciles both. No user data loss; all legacy managed regions are surgically replaced with the new 4-block layout. Users with hand-authored CLAUDE.md (no VIBE markers) are untouched.

## 5.3.0 — 2026-04-19

### Added
- **`side-effect-verify.sh` Stop hook** (`plugin/scripts/side-effect-verify.sh`). Detects when the assistant commits to a write/save/persist operation in prose but doesn't actually invoke a `Write`/`Edit`/`NotebookEdit` tool in the same turn. On detection, blocks the stop with a `decision:"block"` reason that is fed back to the model on its next turn — the assistant sees *"you said you'd save X but no Write happened"* and reconciles, either by performing the write or correcting the prior message. Reuses the rhetoric-guard Strategy E preprocessing pipeline (fenced blocks, inline backticks, double-quoted strings, markdown link labels stripped) to avoid self-citation false positives. Capped at 1 fire per session via `${CLAUDE_PLUGIN_DATA}/side-effect-verify/fires-${SESSION_ID}.count` to prevent feedback loops where the warning text itself contains commitment phrasing on the next turn. Disable: `VIBE_SIDEEFFECT_VERIFY_DISABLED=1`. Hook surface grows from 11 to 12 handlers across 8 lifecycle events.

- **Rhetoric-guard Strategy E v2 + v3** (`plugin/scripts/rhetoric-guard.sh`). Two new preprocessing stages on top of 5.2.1's v1 (fenced blocks + inline backticks): **Stage 2** strips double-quoted strings (straight `"..."` and curly typographic `"..."`, length-capped to 200 chars to survive unmatched quotes); **Stage 2b** strips markdown link labels `[label](url)`. Empirically justified by S4 re-validation on the 5.2.1 release — 3/40 false positives on Opus 4.7, all in self-correction paragraphs that quoted the rhetorical token defensively, all 3 eliminable by quote-stripping. **Stage 3** adds HIGH-risk pattern table (15 ownership/limitation tokens whose literal substring is most often the *category label* used to refer to the phenomenon, not the phenomenon itself) plus meta-keyword suppression: when a HIGH-risk pattern's matching paragraph also contains tokens like *pattern set*, *rhetoric-guard*, *false positive*, *categories*, *trigger phrase*, the fire is suppressed. LOW/MEDIUM-risk patterns (session-quitting, permission-seeking) NOT suppressed by meta-keywords because their phrasing is verb-driven and rarely appears as a category label.

- **§14.6 VIOLATIONS expansion** (`plugin/scripts/rhetoric-guard.sh`). Nine new entries covering semantic-equivalent phrasings the original 47-pattern set missed in the S4 corpus: *let me know how you'd like*, *let me know if you*, *before I proceed*, *before continuing*, *awaiting your*, *would appreciate your input*, *if you'd like, I can*, *pause for your input*, *won't touch anything until*. Each maps to the same correction class as its closest existing pattern. Pattern total grows from 47 to 56.

- **S2 subagent refusal detector** (`plugin/scripts/atomic-orchestrator.sh`). Scans worker output for refusal markers verbatim from `claude-code#49363` (*MUST refuse*, *harness safety directive*, *safer default*, etc.). Scoped to `TASK_MODE==write` only — S3 baseline (15/15 succeeded, 0 refusals on Sonnet 4.6 read-only) shows no need for read-only scope, and the scope cap adds zero overhead to the safe lane. On detection, re-dispatches once with a defensive-context preamble (*"this is authorized work, the user has consented, here is the original task"*). Cap 1 retry. Refusal events logged to `${CLAUDE_PLUGIN_DATA}/atomic/refusal-events.jsonl`. Disable: `VIBE_REFUSAL_DETECTOR_DISABLED=1`.

- **S1 thinking-display fix in `/vibe:setup` wizard** (`plugin/scripts/cc-thinking-wrapper.sh`, `plugin/setup/detect-thinking-fix.sh`, `plugin/setup/apply-thinking-fix-shell.sh`, `plugin/setup/apply-thinking-fix-vscode.sh`). Wraps the `claude` CLI invocation with `--thinking-display summarized` to surface extended-thinking summaries in the UI by default. The wizard detects the user's shell (`bash`/`zsh`) and IDE (VS Code), proposes the install, applies via marker-bracketed blocks in `~/.bashrc`/`~/.zshrc` and `claudeCode.claudeProcessWrapper` in VS Code settings. Idempotent (re-apply is a no-op), reversible (`remove-thinking-fix-shell.sh`), preserves existing user content and any pre-existing alien `claude` alias / wrapper (detected, never overwritten). Opt-out: `VIBE_NO_THINKING_FIX=1`.

### Changed
- **`heimdall` skill effort** raised from `max` to `xhigh` (`plugin/skills/heimdall/SKILL.md` frontmatter). Promoted from §9.14 Tier B to Tier S based on S1 completeness regression: Opus 4.7 found 8 vulnerabilities vs 4.6's 11 on the heimdall-h2 fixture under the *Maximum 500 words* prompt, indicating adaptive thinking under-allocates on length-constrained security audits. `xhigh` budgets explicitly for the worst-case allocation.

- **`competitor-research` skill viewport** raised from 1440 to 2560 with `deviceScaleFactor: 2` (`plugin/skills/_shared/competitor-research.md`). Aligns with Opus 4.7's native 2576px vision input and 1:1 pixel coordinate model output — captures at the model's native resolution avoid the lossy resampling that 1440→2576 upscaling otherwise applies.

- **`seurat` / `orson` / `baptist` 2576px screenshot guidance** added to skill bodies. Capture at 2560×1440 with `deviceScaleFactor: 2` (= effective 5120×2880, downsampled to 2576px native) for 1:1 pixel coordinate model output. Same rationale as the competitor-research viewport bump.

- **`atomic-decomposition` worker prompt template footer** clarifies workers must not spawn sub-subagents (`plugin/skills/_shared/atomic-decomposition.md`). Workaround for Opus 4.7's spawn-discouragement behavior, which on a worker context can produce a subagent that itself attempts to dispatch atomic decomposition — recursive without termination.

- **Hook surface grows from 11 to 12 handlers** across 8 lifecycle events. `side-effect-verify.sh` adds one handler on the Stop event.

### Fixed
- **`rhetoric-guard.sh` `declare -A` macOS crash.** The Strategy E v3 commit added `declare -A HIGH_RISK_PATTERNS` for the meta-keyword suppression table. `declare -A` (associative arrays) is a bash 4+ feature; macOS ships `/bin/bash 3.2.57` as the system shell (Apple refuses to ship GPLv3-licensed bash 4.x), so every Stop event on macOS crashed the hook with `declare: -A: invalid option`. Replaced the associative array + 15 assignments with a pipe-delimited string (`HIGH_RISK_PATTERNS="|pre-existing|...|left as an exercise|"`) and the membership lookup with a glob match (`[[ "$HIGH_RISK_PATTERNS" == *"|$pattern|"* ]]`). Both constructs are bash 3.2 compatible. Reported by macOS users running the un-bumped 5.3.0-wip code under the *5.2.1* version label between commits `da61c5c` and the 5.3.0 release.

- **`side-effect-verify.sh` Stop hook output schema.** The hook emitted `{"hookSpecificOutput": {"hookEventName": "Stop", "additionalContext": "..."}}`, but `hookSpecificOutput.additionalContext` is not a documented field for the Stop event — it's documented only for `UserPromptSubmit`, `SessionStart`, `SubagentStart`, `PostToolUse`, and `PostToolUseFailure`. Claude Code silently discarded the field, so the side-effect advisory never reached the model. Changed to the documented Stop pattern: top-level `{"decision": "block", "reason": "..."}`. Same intent (warn the model on the next turn), correct schema. Verified against the official hooks docs.

- **`pre-tool-security.sh` /tmp whitelist + dev-path self-scan skip** (`plugin/scripts/pre-tool-security.sh`, `plugin/scripts/security-quickscan.sh`). Two false-positive classes in the security hooks: (a) `rm` operations against `/tmp/...` paths fired the destructive-command guard, blocking legitimate test cleanup; whitelisted `/tmp/*` via lookahead in the `rm` pattern. (b) The post-edit security quickscan flagged credential-pattern matches in the plugin's own development files (e.g. `plugin/scripts/heimdall.sh` and skill SKILL.md files containing example credential strings as documentation). Added a self-scan skip for files under the active dev path when the path matches the running plugin's own scripts.

### Migration from 5.2.1
- **Automatic.** All new hooks load on next session start. No env vars to set, no user action required.
- **macOS users on 5.2.1 (broken intermediate).** Between `da61c5c` (2026-04-17) and the 5.3.0 release, github HEAD shipped 5.3.0-wip code under the *5.2.1* version label in `plugin.json`. Users who installed or updated during that window got the broken `declare -A`-based rhetoric-guard, which crashed every Stop event on macOS bash 3.2. Reinstalling 5.2.1 today still pulls the broken intermediate; **the only fix is to update to 5.3.0 or later**.
- **Strategy E v2/v3 + §14.6 are on by default.** If you depended on literal pattern matching that does not strip quotes or links, set `VIBE_RG_BYPASS_DISABLED=1` to revert to v1 behavior (5.2.1). The v1 → v2/v3 step further reduces false positives; most users want the new default.
- **Marketplace count.** `marketplace.json` description updated from `"11 hooks"` to `"12 hooks"` to reflect the new side-effect-verify handler.
## 5.2.1 — 2026-04-17

### Added
- **`session-end-cleanup.sh` SessionEnd hook** (`plugin/scripts/session-end-cleanup.sh`). Removes per-session `/tmp/vibe-paused-${SESSION_ID}` and `/tmp/vibe-failures-${SESSION_ID}` flag files when the session ends. Closes the `/vibe:pause` flag-leak (B3 in the 5.3 audit) where pause flags accumulated across recycled session IDs and silently disabled hooks for new sessions that happened to share an ID with a previously-paused session. Hook surface grows from 10 to 11 handlers across 8 lifecycle events (SessionEnd added). Always exits 0; cleanup actions logged to `${CLAUDE_PLUGIN_DATA}/sessions/cleanup.log`.

- **Rhetoric-guard Strategy E v1 preprocessing** (`plugin/scripts/rhetoric-guard.sh`). Two-stage filter applied to the assistant message before pattern matching: Stage 1a strips fenced code blocks (` ``` `) via an awk state-machine fence tracker, and Stage 1b strips inline backticks (`` ` `` ... `` ` ``) via a length-capped sed. Closes the false-positive class (B7 in the 5.3 audit) where rhetoric-guard fired on its own pattern names quoted inside discussion of the rhetoric guard itself — for example a session that referenced `pre-existing` or `good stopping point` as category labels in a design doc, rather than as ownership-dodging or session-quitting language. Two new env vars: `VIBE_RG_BYPASS_DISABLED=1` reverts to literal matching (5.2.0 behavior), `VIBE_RG_BYPASS_VERBOSE=1` writes a per-session diagnostic log of original-vs-filtered messages to `${CLAUDE_PLUGIN_DATA}/rhetoric-guard/rhetoric-guard-bypass-${SESSION_ID}.log`. Strategy E v2 (double-quoted strings) and v3 (HIGH-risk meta-keyword suppression) are scoped to 5.3.0 per the staged rollout in the audit §14.5.

### Fixed
- **`failure-reset.sh` PostToolUse matcher missing** (B1). The PostToolUse entry calling `failure-reset.sh` had no `matcher` field, so it fired on every tool use including Read. This made the `failure-loop-detect.sh` counter game-able: a sequence of `Edit-fail → Read-pass → Edit-fail → Edit-fail` would reset the counter after the Read and never trigger the 3-failure block. Added `"matcher": "Bash|Edit|Write"` to scope the reset hook to the same tool set as the failure detector. Verified by walking the HC3 sequence: counter no longer reset by Read; 3rd Edit-fail correctly blocks.

- **`agent-memory-sync.sh` `find -maxdepth 4` fragility** (B2). The hardcoded depth limit broke memory sync in monorepos where worktrees nest deeper than 4 levels. Removed the `-maxdepth` flag entirely — the `-path "*/.claude/agent-memory/vibe-*"` pattern is structurally specific (vibe-* directories only appear under `.claude/agent-memory/`), so depth limiting added no safety, only fragility. Verified on a 5-deep nested fake repo: memory content correctly synced from worktree to main project.

- **`setup` skill "Be concise" anti-pattern** (B4). Removed the "Be concise, " prefix from `plugin/skills/setup/SKILL.md` step 12 (the wizard's opening directive). Per Anthropic's Opus 4.7 migration guidance, explicit length-control instructions are now Cat-A anti-patterns: 4.7 calibrates response length to perceived complexity natively, and "Be concise" risks truncating critical wizard output (proposed config diffs, anomaly explanations).

### Migration from 5.2.0
- **Automatic.** SessionEnd hook loads on next session start. No env vars to set, no user action required.
- **Strategy E preprocessing is on by default.** If you depended on the rhetoric-guard's literal pattern matching (e.g. you intentionally wanted it to fire on quoted pattern names in your own session discussion), set `VIBE_RG_BYPASS_DISABLED=1` to revert. Most users want the new default.
- **Marketplace count.** `marketplace.json` description updated from `"10 hooks"` to `"11 hooks"`. Reflects the new SessionEnd handler.
## 5.2.0 — 2026-04-15

### Added
- **Rhetoric-guard Stop hook** (`plugin/scripts/rhetoric-guard.sh`). Matches the last assistant message against 54 rhetorical patterns verbatim from benvanik's production-tested `stop-phrase-guard.sh` (referenced in `anthropics/claude-code#42796`, 2026-04-06 thread, production-tested on IREE/MLX compiler workload). On match, emits `{"decision":"block","reason":"..."}` with a targeted correction tied to the matched phrase — *"should I continue"* → *"Do not ask. Continue."*, *"pre-existing"* → *"NOTHING IS PRE-EXISTING. You own every change."*, *"known limitation"* → *"NO KNOWN LIMITATIONS. Fix it or explain the specific technical reason."*, etc. Claude receives the correction as context for the next turn and proceeds without looping. Closes the shipping gap of the VIBE 5.1 R6 research (concluded 2026-04-15, empirically validated E2E on Claude Code 2.1.108, but the implementation never landed in 5.1). Three defensive additions beyond benvanik's original: first-input diagnostic dump per session (instrumentation addressing the "hook activation uncertainty" confound identified in the 5.0 paper §6.3), fire-rate cap (default 3 injections per session then fail-open — defense against the VIBE 4.0 completion-sentinel resolution-loop failure mode), and transcript fallback for edge cases where `last_assistant_message` is empty. Configurable via `VIBE_RG_MAX_FIRES`, `VIBE_RG_LOG_DIR`, `VIBE_RG_DISABLED`. Event logs written to `${CLAUDE_PLUGIN_DATA}/rhetoric-guard/`. Registered on the Stop event before `atomic-enforcement.sh`; the two are orthogonal and either can emit a block.

- **`scripts/bump-version.sh` release automation.** Atomically updates `plugin/.claude-plugin/plugin.json` version field, prepends a CHANGELOG skeleton for the new version (idempotent — skipped if a section for the target already exists), prepends a "What's New in X.Y" skeleton to `plugin/README.md` (idempotent), and recounts skills/agents/hooks from the filesystem to refresh `.claude-plugin/marketplace.json` description counts. Verifies `plugin/skills/help/SKILL.md` hook count matches reality and that every agent has a row in the help agents table (warns, does not auto-fix). Validates semver, forbids regression or no-op bumps, supports `--dry-run` and `--force`. Stages changed files via `git add` but does not commit — the human writes the real CHANGELOG and README prose before the release commit. Closes the historical pattern where version bumps and docs sync landed in separate commits ("chore: bump" followed by reactive "docs: sync READMEs to X state"), producing a public drift window on every release. Dogfooded on this 5.2.0 release — the script bumped plugin.json, prepended the 5.2.0 CHANGELOG skeleton, and verified marketplace.json counts were already accurate from the 5.2 drift sweep.

### Changed
- **Hook surface grows from 9 to 10 handlers** (still across 7 lifecycle events). `rhetoric-guard.sh` adds one handler on the Stop event.

- **`plugin/README.md` and `plugin/skills/help/SKILL.md` synced to 5.2 state.** The plugin README gained "What's New in 5.2" and "What's New in 5.1" sections — the 5.1 content was never shipped in a README update at the time, caught as part of the 5.2 drift sweep. The help skill had three stale claims since 5.0: the `decomposer` agent (added in commit `63a5f64` five months ago) was missing from the agents table; the Hooks header still said "9 handlers"; the Setup check description still referenced the 5.0-era `vibe-5.0-configured` marker filename (renamed to version-agnostic `vibe-configured` in 5.1). All three fixed. The `bump-version.sh` drift check now catches this class of mismatch automatically on every future release.

- **`.claude-plugin/marketplace.json` plugin description** updated from `"9 hooks"` to `"10 hooks"`. The `bump-version.sh` script automates this field's recount on every bump, driven by a live scan of `plugin/hooks/hooks.json`.

### Migration from 5.1
- **Automatic.** Users on 5.1.x who upgrade to 5.2.0 get the new `rhetoric-guard.sh` hook loaded automatically by the plugin manifest on next session. The hook is enabled by default — to disable, set `VIBE_RG_DISABLED=1` in `~/.claude/settings.json` env.
- **SessionStart notice** fires once after the upgrade until `/vibe:setup` is run (the 5.1 self-healing wizard detects the marker version drift from `5.1.x` to `5.2.0` and prompts for reconciliation). The wizard run writes `{"version":"5.2.0",...}` to `~/.claude/vibe-configured` and dismisses the notice.
- **No config changes required** for the rhetoric-guard defaults (3 fires per session cap, log dir under `${CLAUDE_PLUGIN_DATA}/rhetoric-guard`). Users who want to tune can set the `VIBE_RG_*` env vars.

## 5.1.0 — 2026-04-15

### Added
- **Self-healing `/vibe:setup` wizard.** Setup is now version-agnostic: running it always converges user state to the current plugin version's expected state, regardless of what was there before. A second run on a clean state is a no-op ("already in sync"). Architecture: declarative `expected-state.json` schema + `reconciler.sh` (detect → diff → present → apply) + versioned marker file + surgical CLAUDE.md region markers. The wizard preserves all user-authored content outside VIBE-managed regions.

- **Versioned upgrade marker** (`~/.claude/vibe-configured` with JSON `{"version": "X.Y.Z"}`). Replaces the hardcoded `vibe-5.0-configured` marker. Enables "after every update, suggest re-running `/vibe:setup`" — `setup-check.sh` Check 5 compares the marker's version against the installed plugin's version and fires the notice on any drift.

- **CLAUDE.md region markers.** New template includes `<!-- VIBE:managed-start -->` / `<!-- VIBE:managed-end -->` wrappers. Future setup runs replace content between these markers and leave everything else untouched. Legacy files without markers are classified into three outcomes: `LEGACY_WITH_VIBE_TOKENS` (contains 4.x-era strings like `VIBE_GATE`, `reflect skill`, `Completion Integrity`) → backup + regenerate with user approval; `LEGACY_NO_VIBE_TOKENS` (pure user content) → never touched, user warned to delete manually if they want a managed file.

- **Deprecation blacklists** for env vars (`VIBE_INTEGRITY_MODE`) and data files (`tips-state.json`, `dream/`, `learnings/`, `costs/`). The reconciler removes these during apply, tarballing data files into a timestamped backup first.

### Changed
- **`setup-check.sh` Check 5** rewritten for version comparison. Reads the installed plugin version from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` and compares against the marker's `version` field.
- **`setup/SKILL.md` Steps 5 and 7.3** now delegate to `reconciler.sh` for all state mutation. The wizard keeps its user-facing role (diagnosis, proposal, approval, summary) and the reconciler owns detection/diff/apply.

### Migration from 5.0.x
- First invocation after upgrading: SessionStart hook emits *"VIBE 5.1.0 detected — run /vibe:setup to reconcile configuration"*.
- Running `/vibe:setup` writes the new versioned marker, migrates existing CLAUDE.md files that contain only the 5.0 managed template (surgical replace — no data loss), and removes any residual 4.x env vars or data files still present.
- Custom CLAUDE.md content with no VIBE markers is left untouched (classified as `LEGACY_NO_VIBE_TOKENS`). Users who want a managed file in this case must delete their CLAUDE.md and re-run setup.

## 5.0.2 — 2026-04-15

### Changed
- **Orson background music tracks downloaded on first use instead of bundled.** The 12 `.mp3` files in `plugin/skills/orson/engine/audio/tracks/` (Mixkit CC0 tracks, ~41.5 MB total) are now fetched by `download-library.sh` on first Orson invocation rather than shipped with the plugin. **Plugin repo size drops from ~42 MB to ~1 MB** — a 97% reduction driven almost entirely by these audio files. `audio-selector.ts` already throws a clear error pointing to the download script when a track is missing, so fresh installs get automatic runtime guidance. The Orson `SKILL.md` Quick Setup section already documented `bash audio/download-library.sh` as part of the setup flow — the tracks were committed by accident at some point in the 4.x era and this commit aligns the repo state with the documented intent.

  **Upgrade note for existing installs:** users who already installed 5.0.0 or 5.0.1 keep their cached tracks (the plugin cache is untouched). Users who run `/plugin uninstall vibe@vibe-framework` + `/plugin install vibe@vibe-framework` to pick up 5.0.2 will see a thinner plugin and need to run `bash ${CLAUDE_PLUGIN_ROOT}/skills/orson/engine/audio/download-library.sh` once before first Orson use. Any Orson invocation that fires before the download will surface a clear error with the exact command to run.

  **What is not changed:** the 5 SFX silence placeholders in `plugin/skills/orson/engine/audio/sfx/` (~15 KB total) remain bundled because `audio-mixer.ts` uses them directly without existence checks and the size is negligible. The 6 copy-pasted style placeholders generated by `download-library.sh` (electronic/cinematic/lofi tracks that are byte-identical copies of corporate/ambient) are a content-sourcing issue — a honest fix requires real CC0 tracks for those styles and is out of scope for 5.0.2.

## 5.0.1 — 2026-04-15

### Fixed
- **SessionStart hook output validation** — `setup-check.sh` emitted `hookSpecificOutput` without the required `hookEventName` field, causing Claude Code 2.1.x to log `Hook JSON output validation failed — hookSpecificOutput is missing required field "hookEventName"` on every session start where an anomaly was detected (missing settings, v1 remnants, missing CLAUDE.md, post-compaction recovery, or the 5.0 upgrade marker). Fixed by adding `hookEventName: "SessionStart"` to the emitted object. Verified by running `setup-check.sh` manually with a forced anomaly path — output now passes CC 2.1.x validation. The warning was non-blocking (the hook output was discarded, not the session), but visible on every startup with an anomaly.

## 5.0.0 — 2026-04-14

Structural simplification + rigorous foundation driven by empirical audit of the 4.x components. Subscription-first (Max 20x / Pro), Opus reserved for the conceptual/judgment layer, Sonnet and Haiku for structured execution and per-item work. Atomic decomposition is the primary pattern for enumerable tasks. Every hook is a mechanical process constraint — no informational emitters.

**No backward compatibility for 4.x configurations.** Upgraders will see a one-time notice from the SessionStart hook instructing them to rerun `/vibe:setup`; the wizard writes a version marker to dismiss the notice.

### Removed
- **Completion Integrity System (entire feature)** — 4 files deleted (`completion-sentinel.sh` 509 lines, `completion-verifier.sh` 132 lines, `completion-verifier-prompt.md` 86 lines, `skills/_shared/integrity-gate.md` 81 lines) plus VIBE_GATE verification blocks across 5 skills, Step 4.5 "Integrity Mode" section in setup, and 3 `VIBE_INTEGRITY_MODE=off` env prefixes in atomic scripts. Rationale: the paper's own C3 experimental run showed the sentinel produced mean completeness of **0.706 vs 0.985 baseline** — the system designed to catch false completion actually hurt it. Per the author's own empirical finding, the correct action is to delete it. No pieces were reusable; every component was coupled to an emission pattern the agent does not reliably produce.
- **4 dead hook scripts** (inherited removal from local hook audit): `correction-capture.sh`, `auto-dream.sh`, `tips-engine.sh`, `cost-tracker.sh`. Component-level audit against 19 days of real side-effect files showed 2 captures total (50% false-positive rate), 0 consolidations ever, and fabricated cost estimates duplicating Claude Code's own billing. Claude Code's native auto-memory handles the capture/consolidation use case better because it runs in the agent's semantic context.
- **`reflect` skill** — orphaned consumer of the deleted `correction-capture.sh` queue, no longer useful without its data source.
- **`snapshotEnabled: true` vaporware claim** — removed from 9 agent frontmatters and from each agent's Memory Scope "Snapshot" bullet. The flag promised a sync feature that never had an implementation. Replaced by the real mechanism shipped in Item 3 below.
- **`guardian.md.deprecated`** dead file — superseded by the heimdall + emmet split long before 5.0.
- **Setup wizard Step 4.5 Integrity Mode** (A/B/C/D Strict/Balanced/Light/Off picker) — removed alongside the integrity system itself. Step 4 Settings table, the jq merge arg, and the `VIBE_INTEGRITY_MODE` env write all cleaned up.
- **UserPromptSubmit event** — eliminated along with `correction-capture.sh`, its only handler.

### Changed
- **Hook surface: 9 handlers across 7 lifecycle events** (was 11 across 6 in 3.x, then 7 across 5 after the local hook audit, then 9 across 7 after R4 integrity removal plus Item 3 SubagentStop sync re-introduction). Stop now holds only `atomic-enforcement.sh`; SubagentStop holds only `agent-memory-sync.sh`.
- **Setup check hook** is silent on normal state and emits guidance only on real anomalies (missing settings, v1 remnants, missing CLAUDE.md, post-compaction recovery, and the new 5.0 upgrade marker). The prior version emitted "VIBE settings: OK" every session as decorative noise.
- **Compact save hook (`pre-compact-save.sh`)** replaced transcript-grep noise dumps with a minimal structured snapshot: timestamp, session ID, git branch/status/diff, and pointers to the authoritative sources (transcript path, TaskList, auto-memory). ~30 lines instead of ~300.
- **Security quickscan** skip list expanded to include `tests/**` and `**/references/**` alongside `plugin/scripts/**`. All three classes contain pattern literals by design (test fixtures, reference examples, the hook scripts themselves).
- **Setup wizard linter detection** now checks `deps['typescript']` instead of `deps['tsc']` — the npm package is named `typescript`; `tsc` is only the binary shipped by it. TypeScript projects were silently dropping TypeScript from the detected linters list.
- **Setup wizard monorepo handling** — repos with manifests in 2+ distinct parent directories no longer get a misleading flat seed `CLAUDE.md`. Step 5.2 skips generation in the monorepo case and delegates to `@vibe:researcher` (Step 6) for a proper per-workspace codebase map. Step 1.6 gains a monorepo variant of the diagnosis table. Single-workspace behavior unchanged.
- **Decomposer agent** (`decomposer.md`) instructed to read the invoking skill's worker model declaration and copy it into the manifest. `VIBE_GATE:` markers in its self-verification section renamed to `MANIFEST_CHECK:` — the mechanical self-check still runs; only the sentinel-era prefix is retired.
- **Repository layout**: distributed plugin content moved into `plugin/` subdirectory; top-level holds `tests/`, `docs/`, `research/`, `vendor/` which are gitignored dev infrastructure. `.claude-plugin/marketplace.json` stays at root with `source: "./plugin"`. All 168 tracked files moved via `git mv`, preserving history.

### Added
- **Worker-level model tiering for atomic decomposition** (Item 1). The orchestrator now accepts `--worker-model`, `--worker-effort`, `--worker-fallback` flags and reads matching fields from the manifest. Per-item CLI sessions and the polish step run on the declared worker model with precedence: CLI flag > manifest field > default (sonnet / medium / sonnet). **Opus is explicitly disallowed as a worker** — reserved for the decomposer and polish layers. 5 skill declarations now carry Worker model / effort / fallback lines: ghostwriter, seurat, baptist, emmet, and the shared `competitor-research` protocol (all on sonnet/medium/sonnet baseline). Subscription users get atomic decomposition as a daily-usable operation instead of burning Opus quota on single-item work.
- **Agent memory persistence via SubagentStop sync** (Item 3). New `agent-memory-sync.sh` hook copies `.claude/agent-memory/vibe-*/` from the subagent's isolated worktree back to the main project after each run. 9 domain audit agents (baptist, emmet, ghostwriter, heimdall, orson, researcher, reviewer, scribe, seurat) can now persist per-run findings across sessions. Delta analysis and regression detection work at the main-project level. Audit protocol documents the automatic persistence so agent authors keep writing to the relative path.
- **Post-upgrade 5.0 notification** (Item 2). New Check 5 in `setup-check.sh` emits a one-time anomaly "VIBE 5.0 detected. Run /vibe:setup..." until the wizard writes `$HOME/.claude/vibe-5.0-configured`. 4.x users upgrading in place see the prompt until they rerun setup.
- **Canonical audit-protocol path** consistently used across `validate-audit-system.sh`, `skills/audit/SKILL.md`, and `plugin/README.md`. The old `references/audit-protocol.md` references were stale — the file lives at `skills/_shared/audit-protocol.md`.

## 4.0.0 — 2026-04-08

### Added — Completion Integrity System
Three-layer verification system that catches false completion claims, fabricated analysis, and partial work presented as complete. Addresses the "LLM false completion" problem documented across 30+ GitHub issues and academic research.

- **Layer 1 — Completion Sentinel** (`scripts/completion-sentinel.sh`): mechanical Stop hook that parses the conversation transcript to count tool calls, find VIBE_GATE verification markers, and run 6 independent checks against completion claims. Checks: zero-tool completion, context-aware numerical discrepancy, test/build claims without execution, subagent trust without verification, completion scope mismatch, VIBE_GATE marker inspection. Bash 3.2 compatible (macOS).
- **Layer 2 — Completion Verifier** (`scripts/completion-verifier.sh` + `scripts/completion-verifier-prompt.md`): command-based file/output verification that reads Layer 1 findings and performs mechanical filesystem checks. Agent-based upgrade path via `type: "agent"` hook.
- **Layer 3 — VIBE_GATE Protocol** (`skills/_shared/integrity-gate.md`): shared protocol for skill-level verification. Skills emit `VIBE_GATE: key=$(command)` markers in Bash tool output. The sentinel reads these from the transcript — output is genuine because the Bash tool actually executes the command. Claude cannot fabricate Bash tool output.
- **Stop + SubagentStop hooks**: both layers fire on session completion and subagent completion, catching corner-cutting at the source.
- **Resolution mode**: after blocking a false completion, the sentinel accepts honest partial reports ("I completed 14 of 20") and blocks re-assertions of totality without new evidence. Prevents infinite blocking loops and the Apology Loop pattern.
- **Integrity event logging**: all catches logged to `/tmp/vibe-integrity-events-{date}.jsonl` for pattern tracking.
- **Setup integration**: new Step 4.5 in `/vibe:setup` lets users choose integrity mode (strict/balanced/light/off). Default: balanced. `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` set by default to restore full thinking depth.

### Added — VIBE_GATE Verification Blocks (all 5 skills)
37 mechanical verification markers across all production skills:

- **Competitor Research**: batch checkpointing (groups of 5) + 7 markers (screenshot count, JSON entries, lens completeness, metadata, patterns, empty files)
- **Ghostwriter**: critical rules enforcement (9 mandatory PASS rules) + 7 markers (content files, file size, empty strings, word count, H1 count, schema, common file)
- **Seurat**: mandatory WCAG enforcement + 8 markers (style files, templates, color tokens, spacing, hardcoded text, focus indicators, ARIA landmarks, breakpoints)
- **Emmet**: testing verification gate + debugging red-green gate, 9 markers (test exit code, test files, lint, type check, red/green phase, regression test)
- **Baptist**: structured file output (`.vibe/baptist/audit.json`) + 6 markers (audit existence, B=MAP scores, recommendations, ICE scores, benchmarks, sort order)

### Configurable Modes

| Mode | Layer 1 (mechanical) | Layer 2 (file verification) | Layer 3 (skill gates) |
|------|---------------------|---------------------------|----------------------|
| strict | Blocks on any failure | Blocks on FAIL | Blocking |
| balanced (default) | Blocks high-confidence only | Presents to user | Blocking |
| light | Non-blocking report | Off | Advisory |
| off | Off | Off | Advisory |

## 3.9.3 — 2026-04-07

### Fixed
- **Reflect skill**: removed cross-project memory leakage — all learnings now save exclusively to project-local `.claude/auto-memory/learnings.md`, never to shared `~/.claude/auto-memory/`

## 3.9.2 — 2026-04-07

### Fixed
- **Setup skill**: empty projects no longer skip CLAUDE.md generation and codebase mapping offer — the wizard now generates a placeholder CLAUDE.md and presents all optional steps regardless of project state

## 3.7.0 — 2026-04-03

### Fixed
- **Reference path resolution**: all skills now use `${CLAUDE_SKILL_DIR}/references/` instead of bare relative paths — the plugin loader expands these to absolute paths before Claude sees them, ensuring reference files are found regardless of the user's working directory
- **Agent audit protocol**: moved `audit-protocol.md` from gitignored `/references/` to distributed `skills/_shared/` — all 7 audit agents now reference it via `${CLAUDE_PLUGIN_ROOT}` and can actually read it at runtime
- **Heimdall pattern paths**: `patterns/*.json` files now use `${CLAUDE_SKILL_DIR}/patterns/` for reliable resolution
- **Shared protocol paths**: competitor research references in Ghostwriter, Seurat, and Baptist use `${CLAUDE_SKILL_DIR}/../_shared/` instead of bare `../_shared/`

### Changed
- **Setup skill**: improved monorepo detection with `find -maxdepth 2` instead of flat `ls`, covers `frontend/`, `backend/`, `packages/*` structures

## 3.5.1 — 2026-03-31

### Fixed
- **Help skill**: removed `disable-model-invocation` which prevented `/vibe:help` from working via the Skill tool; changed to `model: sonnet` with `effort: low`

## 3.5.0 — 2026-03-31

### Changed
- Version alignment after v3.4.0 feature release

## 3.4.0 — 2026-03-31

12 improvements derived from Claude Code source architecture analysis.

### Added
- **31 security patterns** in quickscan (was 9): private keys, AWS/GCP/Stripe/GitHub/Slack credentials, innerHTML/document.write XSS, SQL injection via interpolation, disabled SSL, pickle/yaml deserialization, subprocess injection, Zsh module attacks, IFS manipulation, unicode obfuscation, control characters, /proc environ exfiltration
- **PreToolUse security hook**: blocks dangerous bash commands before execution (rm -rf /, force push to main, curl|bash, chmod 777, database DROP)
- **Per-skill cost tracking**: estimates token usage and cost per skill invocation (JSONL log)
- **Auto Dream consolidation**: background knowledge synthesis after 5+ sessions and 3+ corrections
- **Contextual tips system**: session-aware tips with cooldowns during startup
- **Emmet verify workflow**: end-to-end change verification (detect stack, start app, exercise behavior, check regressions)
- **Forge 4-round interview**: structured skill creation (high-level, structure, per-step breakdown, final polish) with success criteria per step
- **Frontmatter validation script**: validates all skill and agent metadata against required schema
- **Session memory extraction**: structured JSON session state (branch, errors, files, skills) for reliable post-compaction recovery
- 5 new scripts: auto-dream.sh, cost-tracker.sh, tips-engine.sh, pre-tool-security.sh, validate-frontmatter.sh
- 22 new test cases (81 total, was 59)

### Changed
- All 14 skills: added `whenToUse`, `argumentHint`, `maxTokenBudget` frontmatter for lazy-loading context optimization
- All 9 agents: added `memoryScope: project`, `snapshotEnabled: true`, `omitClaudeMd` fields + Memory Scope section with snapshot sync protocol
- Read-only agents (reviewer, researcher): `omitClaudeMd: true` for token savings
- hooks.json: 6 lifecycle events, 11 handlers (was 5 events, 7 handlers)
- pre-compact-save.sh: enhanced with structured JSON output, git branch, errors, recovery instructions
- security-quickscan.sh: broadened self-exclusion to all VIBE scripts, IFS guard for shell files, rm -- reworked, @system narrowed to jq contexts

### Fixed
- Test suite: replaced phantom `guardian` agent with actual 9-agent roster
- TASK_COUNT bug in pre-compact-save.sh that silently broke jq JSON generation
- Researcher/reviewer memory scope text: "after each audit" corrected to role-appropriate wording
- Frontmatter validator: robust awk-based extraction instead of fragile sed ranges

## 2.0.0 — 2026-03-26

Complete rewrite as Claude Code plugin.

### Added
- Plugin architecture (installable via /plugin install)
- 12 skills: 8 domain + setup + reflect + pause + resume
- 3 agents: reviewer (post-implementation review), researcher (codebase exploration), guardian (security audit)
- 6 hook handlers: quality gates, self-learning, failure detection
- Multilingual correction capture (6 languages)
- Systematic debugging workflow in Emmet
- Per-persona visual testing with 8 default personas and Playwright headed mode
- Post-compaction state recovery
- Security quickscan on every file edit
- Failure loop detection (stops after 3 consecutive failures)

### Removed
- CLAUDE.md operating system (replaced by plugin skills)
- Morpheus context awareness (replaced by native auto-compaction)
- Registry, request log, session notes (replaced by native auto-memory)
- Shell installer (replaced by plugin system)
- PROCEED gate (replaced by native plan mode)

### Changed
- All skills rewritten from scratch for v2 skill format
- Orson engine migrated and audited
- Effort forced to max on all skills and agents
- Framework distributed as plugin instead of shell script

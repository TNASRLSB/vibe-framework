# Spec: Baptist — Conversion Rate Optimization Skill

**Data:** 2026-02-10
**Stato:** Completato

---

## Cosa sto costruendo

**Baptist** è una skill standalone di Conversion Rate Optimization che orchestra Ghostwriter (content/copy) e Seurat (UI/UX) per massimizzare le conversioni. Il suo valore unico è nella disciplina sperimentale, nell'analisi diagnostica e nel framework decisionale basato su ricerca neuroscientifica.

Baptist non duplica psicologia persuasiva (Ghostwriter) né design di form/componenti (Seurat). Li referenzia e coordina.

**Nome:** Baptist — battezza le conversioni.

---

## Architettura

```
Baptist (CRO)
├── Analizza e diagnostica problemi di conversione
├── Propone soluzioni con priorità (ICE)
├── Progetta esperimenti (A/B test)
├── Analizza funnel e drop-off
└── Orchestra le fix:
    ├── Copy/messaging → delega a Ghostwriter
    ├── UI/form/layout → delega a Seurat
    └── Statistica/esperimenti → gestisce internamente
```

---

## Comandi

### `/baptist audit [url o contenuto pagina]`

Analisi CRO completa. Esamina la pagina su 7 dimensioni in ordine di impatto:

1. **Clarity** — Value proposition chiara in <8 secondi? (Cognitive Load + eye-tracking first 8 sec rule)
2. **Motivation** — Perché dovrei agire? (Fogg Model: M in B=MAP)
3. **Ability** — Quanto è facile agire? (Fogg Model: A — friction, form fields, steps)
4. **Prompt** — C'è un trigger chiaro? (Fogg Model: P — CTA visibilità, posizione, copy)
5. **Trust** — Mi fido abbastanza per agire? (Social proof, authority, risk reversal)
6. **Funnel coherence** — Il percorso ha senso? (Message match, drop-off points)
7. **Mobile parity** — Funziona su mobile? (67% traffico ma conversioni basse)

**Output per ogni problema trovato:**
- **Problema**: Cosa non funziona
- **Evidenza**: Perché è un problema (dati, principi, research)
- **Impatto stimato**: Alto/Medio/Basso
- **Fix**: Cosa fare concretamente
- **Chi lo fa**: Baptist (esperimento) / Ghostwriter (copy) / Seurat (UI)
- **ICE score**: Impact × Confidence × Ease

**Output finale:**
- Quick wins (implementare subito)
- High-impact changes (prioritizzare)
- Test ideas (da validare con A/B)
- Matrice di orchestrazione (cosa va dove)

### `/baptist test [ipotesi o area]`

Progetta un esperimento A/B rigoroso:

1. **Intake**: Cosa vuoi testare e perché
2. **Hypothesis**: Template strutturato (Because → We believe → Will cause → For → We'll know)
3. **Design**: Tipo di test, varianti, metriche (primary + secondary + guardrail)
4. **Sample size**: Calcolo con baseline CVR e MDE
5. **Duration**: Stima basata su traffico
6. **Pre-registration**: Documentazione prima del lancio
7. **Integrity checks**: SRM, A/A, contamination, change control

**Output**: Test plan document pronto per implementazione

### `/baptist funnel [flusso]`

Analisi diagnostica di un funnel:

1. **Map**: Mappa gli step (Page Visit → Key Action → Form → Complete → Confirmation)
2. **Measure**: Drop-off a ogni step
3. **Diagnose**: Root cause per il drop-off maggiore
4. **Prioritize**: Dove intervenire prima (non sempre il drop-off più grande è il target migliore)
5. **Micro-conversions**: Metriche intermedie da tracciare

**Output**: Funnel diagnostic con raccomandazioni prioritizzate

### `/baptist report`

Learning repository e risultati:

1. **Test results**: Documentazione risultati con template
2. **Learnings**: Cosa abbiamo imparato
3. **Next tests**: Cosa testare dopo
4. **Trend**: Come si muovono le metriche nel tempo

### `/baptist analyze [pagina o flusso]`

Analisi CRO focalizzata su una pagina o flusso specifico. Simile a audit ma più profonda e focalizzata:

- Per **landing page**: Message match con traffic source, single-CTA effectiveness, above-fold completeness
- Per **pricing page**: Plan comparison clarity, recommended plan indication, objection handling, path to checkout
- Per **form**: Field necessity audit, progressive profiling opportunity, error rate diagnosis
- Per **checkout**: Cart abandonment diagnosis, trust signals, friction points
- Per **homepage**: Multi-audience handling, path clarity, navigation effectiveness
- Per **onboarding**: Activation rate, time-to-value, aha moment identification
- Per **paywall/upgrade**: Trigger timing, value demonstration, pricing presentation

Per ogni tipo, Baptist applica il framework Fogg (B=MAP) e Cognitive Load Theory per diagnosticare e proporre fix.

---

## Knowledge base

### SKILL.md — Contenuto core (~300-350 righe)

```
1. Identity e prime directives
2. CRO Mental Model
   - CRO vs UX optimization vs funnel optimization vs experimentation
   - Cosa NON delegare a A/B test (legal, ethics, dark patterns)
3. Behavioral Framework: Fogg Model (B=MAP)
   - Motivation: pain/pleasure, hope/fear, social acceptance/rejection
   - Ability: time, money, physical effort, brain cycles, social deviance, non-routine
   - Prompt: facilitator (high motivation, low ability), spark (low motivation, high ability), signal (high both)
   - Applicazione: ogni problema di conversione è M, A, o P
4. Cognitive Load Principles
   - Hick's Law: tempo decisionale cresce con numero di opzioni
   - Ridurre scelte, campi, step → ridurre cognitive load → +15% completion (research)
   - First 8 seconds: value prop deve essere chiara immediatamente (eye-tracking research)
   - F/Z pattern: posizionare elementi critici dove l'occhio va naturalmente
5. CRO Process Framework
   - ANALYZE → HYPOTHESIZE → PRIORITIZE → TEST → LEARN → IMPLEMENT
6. Audit Framework (7 dimensioni)
7. Comandi (audit, test, funnel, report, analyze)
8. A/B Testing Methodology
   - Hypothesis template
   - Sample size calculator (formula + quick reference table)
   - Statistical significance (95% confidence, 80% power)
   - CUPED per test più veloci
   - Experiment integrity (SRM, A/A, contamination, change control)
   - Peeking problem e soluzioni
9. ICE Prioritization
10. Conversion Rate Benchmarks
    - Per page type (landing, checkout, form, add-to-cart)
    - ROI medio CRO: 342.6%, payback 4-6 mesi
11. Privacy-First CRO
    - First-party measurement
    - Cookie deprecation impact
    - Consent-mode behavior
12. Integration Protocol
    - Quando delegare a Ghostwriter
    - Quando delegare a Seurat
    - Quando gestire internamente
13. Operational notes per Claude
```

### Reference files

| File | Contenuto | Fonte |
|---|---|---|
| `references/form-strategy.md` | Campo per campo: quando serve, quando deferire, quando eliminare. Progressive profiling. Multi-step: quando e perché. Measurement (form start rate, completion, field drop-off). | form-cro (parti strategiche) + signup-flow-cro (elementi unici: social auth, signup patterns) |
| `references/page-frameworks.md` | Framework specifici per: homepage, landing page, pricing page, feature page, blog post. Experiment ideas per page type. | page-cro (parti non-overlap con Ghostwriter) |
| `references/advanced-testing.md` | CUPED implementazione. Sequential testing. Multi-Armed Bandits. Bayesian vs frequentist. | marketing-cro references |
| `references/popup-strategy.md` | Trigger taxonomy (time, scroll, exit-intent, click, session, behavior). Frequency capping. Compliance (GDPR, Google interstitials). Benchmarks. Strategy per business type. | popup-cro (parti strategiche) |
| `references/activation-metrics.md` | Aha moment framework. Funnel post-signup. Key metrics (activation rate, time-to-activation, D1/D7/D30). Engagement loops (Hook model). | onboarding-cro (solo metriche e framework) |
| `references/paywall-strategy.md` | Trigger points (feature gate, usage limit, trial expiration, context). Timing rules. Anti-patterns (dark patterns, conversion killers). | paywall-upgrade-cro (parti strategiche) |

### Asset templates

| Template | Scopo |
|---|---|
| `assets/ab-test-plan.md` | Template pre-registrazione esperimento |
| `assets/landing-audit.md` | Checklist audit landing page |
| `assets/funnel-analysis.md` | Template diagnostica funnel |
| `assets/ice-scoring.md` | Template prioritizzazione ICE |
| `assets/form-audit.md` | Checklist audit form |
| `assets/test-results.md` | Template documentazione risultati |

---

## Modifiche a Ghostwriter

### Aggiunta: integration note nel SKILL.md

Aggiungere nella sezione "Integration with Other Skills":

```markdown
| baptist | CRO audit identifica problemi di copy/messaging → Ghostwriter li risolve. Baptist non duplica psicologia (psychology.md) né CTA (cta.md) — li referenzia. |
```

Nessun'altra modifica. Ghostwriter ha già tutto il necessario (psychology.md, cta.md, headlines.md, frameworks.md). Baptist lo referenzia senza duplicare.

---

## Modifiche a Seurat

### Aggiunta: integration note nel SKILL.md

Aggiungere sezione di integrazione con Baptist:

```markdown
## Integration with Baptist (CRO)

Quando Baptist identifica problemi UI/UX che impattano le conversioni, delega a Seurat:

| Baptist identifica... | Seurat implementa... |
|---|---|
| Form con troppi campi / layout confuso | Redesign form: single column, field reduction, multi-step |
| CTA poco visibile / basso contrasto | Redesign CTA: sizing, contrast, whitespace, positioning |
| Popup intrusivo / mobile-unfriendly | Redesign popup: sizing, close button, mobile slide-up |
| Visual hierarchy rotta | Ristrutturazione layout con gerarchia chiara |
| Paywall screen inefficace | Redesign paywall: value demonstration, plan comparison |
| Mobile experience degradata | Mobile-specific layout optimization |
```

### Aggiunta futura (NON in questo task)

In futuro, aggiungere a Seurat knowledge specifica su:
- Form UX patterns (da form-cro, parti UI)
- Popup design patterns (da popup-cro, parti visual)
- Paywall screen components (da paywall-upgrade-cro, parti layout)

Questo è un task separato. Per ora basta la integration note.

---

## File che creerò

### Nuovi file

```
.claude/skills/baptist/
├── SKILL.md                          # Core skill (~300-350 righe)
├── references/
│   ├── form-strategy.md              # Strategia form CRO
│   ├── page-frameworks.md            # Framework per page type
│   ├── advanced-testing.md           # CUPED, sequential, MAB
│   ├── popup-strategy.md             # Trigger, frequency, compliance
│   ├── activation-metrics.md         # Aha moment, onboarding metrics
│   └── paywall-strategy.md           # Trigger points, timing, anti-patterns
└── assets/
    ├── ab-test-plan.md               # Template test plan
    ├── landing-audit.md              # Checklist audit landing
    ├── funnel-analysis.md            # Template funnel diagnostic
    ├── ice-scoring.md                # Template ICE
    ├── form-audit.md                 # Checklist audit form
    └── test-results.md              # Template risultati test
```

### File modificati

```
.claude/skills/ghostwriter/SKILL.md   # +1 riga integration table
.claude/skills/seurat/SKILL.md        # +1 sezione integration (~15 righe)
.claude/docs/registry.md              # +1 riga skills table
```

---

## Cosa riuso

| Fonte | Cosa prendo | Come lo trasformo |
|---|---|---|
| marketing-cro SKILL.md | CRO process, A/B testing, ICE, funnel, benchmarks, expert content | Riscrivo con Fogg model come framework unificante |
| ab-test-setup | Hypothesis template, documentation, variant design, traffic allocation | Merge con testing di marketing-cro |
| form-cro | Field strategy, progressive profiling, measurement | Estraggo parti strategiche in `references/form-strategy.md` |
| page-cro | Page-specific frameworks, experiment ideas | Estraggo in `references/page-frameworks.md` |
| popup-cro | Trigger taxonomy, frequency, compliance | Estraggo in `references/popup-strategy.md` |
| onboarding-cro | Activation metrics, engagement loops | Estraggo in `references/activation-metrics.md` |
| paywall-upgrade-cro | Trigger points, timing, anti-patterns | Estraggo in `references/paywall-strategy.md` |
| research-cro.md | Fogg B=MAP, cognitive load, eye-tracking, ROI 342.6% | Integro come framework decisionale nel SKILL.md |
| JAAFR paper | Eye-tracking quantitativi (+24.7%, first 8 sec, F/Z pattern) | Integro come evidenze nelle audit rules |
| Chin paper | Neuromarketing case studies (color psychology, multisensory) | Reference per contesto, non operativo |

---

## Cosa NON faccio

- Non duplico psicologia persuasiva (è in Ghostwriter)
- Non duplico design patterns (è in Seurat)
- Non creo copy CTA/headline (Ghostwriter lo fa meglio)
- Non disegno form/componenti (Seurat lo fa meglio)
- Non includo il paper Coral Reef (omonimo irrilevante)
- Non aggiungo knowledge form/popup a Seurat ora (task separato)

---

## Come verifico che funziona

1. `/baptist audit` su una landing page → produce report con 7 dimensioni, ICE scores, e matrice di orchestrazione
2. `/baptist test` → produce test plan con hypothesis, sample size, duration, metriche
3. `/baptist funnel` → produce diagnostic con drop-off e raccomandazioni
4. `/baptist analyze [tipo pagina]` → produce analisi focalizzata con Fogg model applicato
5. Baptist referenzia Ghostwriter per copy fix senza duplicare content
6. Baptist referenzia Seurat per UI fix senza duplicare design patterns
7. Nessun overlap con knowledge esistente di Ghostwriter (psychology.md, cta.md, headlines.md)

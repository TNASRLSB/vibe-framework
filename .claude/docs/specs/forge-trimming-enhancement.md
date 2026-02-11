# Spec: Forge Enhancement — Audit semantico + Fix

**Data:** 2026-02-11
**Basata su:** `skill-trimming-analysis.md`
**Obiettivo:** Forge diventa il tool completo per diagnostica e manutenzione skill, sfruttando le capacita semantiche di Opus 4.6

---

## Principio

Il mantenimento delle skill non e un'operazione meccanica (conta parole, sposta blocchi). E un'**analisi semantica** che richiede ragionamento:

> "Se rimuovo questo, Claude fara diversamente?"

Solo Opus 4.6 puo rispondere a questa domanda. Il bash script `audit-skills.sh` resta come layer quantitativo, ma la diagnostica vera la fa Claude guidato dalla matrice decisionale.

---

## Design: due comandi, ruoli chiari

### `/forge audit` — Diagnostica (non modifica nulla)

L'unico comando di analisi. Legge tutte le skill, produce un piano.

**Workflow:**
1. **Metriche quantitative** — Esegue `audit-skills.sh` per word count, struttura
2. **Analisi semantica per-skill** — Per ogni skill, legge il SKILL.md e classifica ogni sezione con la matrice:

| Claude ne ha bisogno? | Utente ne ha bisogno? | Raccomandazione |
|---|---|---|
| SI | SI | **Trim**: SKILL.md (breve) + KNOWLEDGE.md (spiegato) |
| SI | NO | **Keep**: resta in SKILL.md |
| NO | SI | **Trim**: va in KNOWLEDGE.md |
| NO | NO | **Delete**: eliminare |

3. **Cross-skill analysis** — Identifica:
   - Concetti duplicati tra skill diverse
   - Frontmatter trigger che competono/overlappano
   - Contenuto in SKILL.md che dovrebbe essere in references/ (split)
4. **Categorizza raccomandazioni** per skill:
   - **Trim** — Sezioni da rimuovere da SKILL.md → KNOWLEDGE.md
   - **Split** — Sezioni verbose da spostare in references/
   - **Improve** — Frontmatter da migliorare, struttura da correggere
   - **Dedup** — Contenuto duplicato cross-skill da consolidare

**Output:** `.claude/docs/forge-audit.md`

Formato del report:
```markdown
# Forge Audit — YYYY-MM-DD

## Metriche

| Skill | Parole | Status | Azioni raccomandate |
|-------|--------|--------|---------------------|
| baptist | 2227 | OK | Trim (3 sezioni) |
| ghostwriter | 2060 | OK | Trim (2 sezioni), Dedup (1) |
| ...

## Baptist

### Trim (→ KNOWLEDGE.md)
- **Fogg Model spiegato** (righe 50-83): Claude lo sa, utente no
- **Cognitive Load Theory** (righe 85-93): Claude lo sa, utente no
- Riduzione stimata: -25%

### Keep
- Comandi, 7 dimensioni audit, ICE formula, orchestrazione

### Cross-skill overlap
- ICE scoring presente anche in [altra skill] → consolidare

## Ghostwriter
...

## Piano di esecuzione
1. Baptist (3 trim)
2. Ghostwriter (2 trim, 1 dedup)
3. ...
```

L'utente review il report e dice **PROCEED**.

---

### `/forge fix` — Esecuzione (modifica i file)

Legge `forge-audit.md` ed esegue le raccomandazioni.

| Invocazione | Cosa fa |
|---|---|
| `/forge fix` | Esegue TUTTE le raccomandazioni del piano, skill per skill |
| `/forge fix [skill]` | Esegue solo le raccomandazioni per quella skill |

**Per ogni skill, esegue in ordine:**

1. **Trim** — Applicare la matrice:
   - Riscrivere SKILL.md (solo contenuto che cambia il comportamento di Claude)
   - Generare KNOWLEDGE.md (domain knowledge per l'utente umano)

2. **Split** — Se raccomandato:
   - Spostare sezioni verbose in references/
   - Aggiungere routing in SKILL.md

3. **Improve** — Se raccomandato:
   - Migliorare frontmatter description
   - Correggere struttura

4. **Dedup** — Se raccomandato:
   - Consolidare contenuto duplicato (single source of truth)
   - Aggiornare cross-references

5. **Verify** — Per ogni skill toccata:
   - Frontmatter triggera ancora correttamente?
   - Comandi tutti documentati?
   - Routing a references/ funziona?
   - Comportamento invariato?

**Output:** File modificati + report prima/dopo per ogni skill

---

## Comandi che restano invariati

| Comando | Ruolo | Note |
|---|---|---|
| `/forge create [name]` | Scaffold nuova skill | Invariato |
| `/forge audit` | Diagnostica | **Potenziato** (semantico) |
| `/forge fix` | Esecuzione piano audit | **Nuovo** (sostituisce trim/split/improve separati) |

**Comandi rimossi:**
- `/forge trim` → assorbito in `/forge fix`
- `/forge split` → assorbito in `/forge fix`
- `/forge improve` → assorbito in `/forge fix`

---

## File da toccare

### Nuovi file

| File | Tipo |
|------|------|
| `.claude/skills/forge/references/trimming-methodology.md` | Reference: matrice decisionale, criteri, esempi |
| `.claude/skills/forge/templates/knowledge-template.md` | Template per KNOWLEDGE.md |

### File da modificare

| File | Azione |
|------|--------|
| `.claude/skills/forge/SKILL.md` | Riscrivere comandi: audit potenziato + fix nuovo, rimuovere trim/split/improve |
| `.claude/skills/forge/references/quality-checklist.md` | Aggiungere criteri trimming |

---

## Cosa NON cambia

- `audit-skills.sh` resta (layer quantitativo, utile come metrica veloce)
- `/forge create` resta invariato
- References esistenti (skill-anatomy.md, progressive-disclosure.md) restano
- Templates esistenti (skill-template.md, reference-template.md) restano

---

## Come verifico

| Check | Metodo |
|---|---|
| `/forge audit` produce report categorizzato | Run su tutte le skill, verificare formato report |
| `/forge fix baptist` produce SKILL.md + KNOWLEDGE.md | Eseguire e verificare output |
| La matrice e applicata correttamente | Review manuale: sezioni Claude-only restano, sezioni user-only vanno in KNOWLEDGE.md |
| Cross-skill overlap identificato | Verificare che concetti duplicati siano segnalati |
| Post-fix, le skill triggerano e funzionano | Testare i comandi principali di ogni skill toccata |

---

## Nota: spec precedenti assorbite

Dopo questo enhancement:
- `skill-trimming-analysis.md` → matrice e metodologia codificate in `references/trimming-methodology.md`, analisi per-skill generate da `/forge audit`
- La vecchia spec si puo archiviare

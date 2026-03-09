# Experiential Testing (`--personas`)

Claude naviga il browser come un utente reale via `@playwright/mcp`. Vede screenshot, giudica UX/UI/workflow, si immedesima nelle personas della functional map.

**Questo NON è test automatizzato.** Non ci sono assertions programmatiche. Claude osserva, naviga, valuta, e produce un report qualitativo.

---

## Prerequisiti

1. `@playwright/mcp` configurato come MCP server
2. Functional map con personas definite (`.emmet/functional-map.md`)
3. App target raggiungibile (locale o produzione)

**Se `@playwright/mcp` non è disponibile:** Avvisare l'utente e suggerire la configurazione:
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## Come funziona

Claude usa i tool MCP di Playwright per controllare un browser reale:
- **Navigare** a URL specifici
- **Cliccare** su elementi
- **Digitare** testo in form
- **Fare screenshot** e vederli
- **Valutare** ciò che vede come farebbe un utente umano

La differenza rispetto a `--functions`: qui Claude **pensa** come un utente, non come un tester automatizzato. Le domande non sono "il bottone esiste?" ma "il bottone è dove me lo aspetto? è chiaro cosa fa? il feedback è soddisfacente?".

---

## Flusso di esecuzione

```
1. LEGGI MAP
   → Carica personas dalla functional map
   → Per ogni persona: profilo, obiettivi, aspettative, livello tecnico

2. PER OGNI PERSONA:
   a. IMMEDESIMAZIONE
      → Claude assume la mentalità della persona
      → Obiettivi: cosa vuole fare?
      → Aspettative: cosa si aspetta di vedere?
      → Frustrazioni tipiche: cosa la farebbe desistere?
      → Livello tecnico: quanto perdona errori/complessità?

   b. NAVIGAZIONE GUIDATA DAI TASK
      → Per ogni use case associato alla persona nella map:
        1. Apri browser, naviga alla pagina iniziale
        2. Screenshot iniziale — prima impressione
        3. Esegui il flusso come farebbe la persona
        4. Ad ogni step: screenshot + valutazione
        5. Nota: confusioni, attese, frustrazioni, piaceri

   c. VALUTAZIONE
      → Per ogni pagina/step visitato, valuta:

      **First Impression (3 secondi)**
      - Capisco dove sono?
      - Capisco cosa posso fare?
      - So dove cliccare per il mio obiettivo?

      **Usabilità**
      - I controlli sono dove me li aspetto?
      - Il feedback alle azioni è chiaro e tempestivo?
      - Gli errori mi aiutano a correggermi?
      - Posso tornare indietro senza perdere lavoro?

      **Visual Design**
      - La gerarchia visiva guida il mio occhio?
      - C'è coerenza tra le pagine?
      - Il testo è leggibile (contrasto, dimensione)?
      - Lo spazio è usato bene (non troppo denso, non troppo vuoto)?

      **Workflow**
      - Il flusso è lineare o mi costringe a tornare indietro?
      - I passi sono nell'ordine logico?
      - Ci sono passi inutili che potrei saltare?
      - Dopo il completamento, è chiaro cosa è successo?

      **Frustrations**
      - Qualcosa mi ha confuso?
      - Ho dovuto cercare qualcosa che doveva essere ovvio?
      - Ho atteso troppo senza feedback?
      - Qualcosa si è rotto o non ha risposto?

3. REPORT
   → Genera report qualitativo (vedi template sotto)
```

---

## Criteri di valutazione

### Score per area (1-5)

| Score | Significato |
|-------|-------------|
| 5 | Eccellente — supera le aspettative |
| 4 | Buono — funziona bene, piccoli miglioramenti possibili |
| 3 | Sufficiente — funziona ma con frizioni notabili |
| 2 | Problematico — frustrazioni significative, rischio abbandono |
| 1 | Critico — bloccante o gravemente confuso |

### Aree di valutazione

| Area | Cosa valutare |
|------|---------------|
| **Onboarding** | Prima esperienza, capisco cosa fare? |
| **Navigation** | Trovo quello che cerco? Torno indietro facilmente? |
| **Core Task** | Il task principale è fluido? Quanti click/step? |
| **Feedback** | Le azioni producono feedback chiaro? |
| **Error Recovery** | Dopo un errore, so come correggermi? |
| **Visual Clarity** | Gerarchia, contrasto, leggibilità, coerenza |
| **Performance percepita** | Sento l'app reattiva o lenta? |
| **Mobile** (se applicabile) | Touch target, layout, gesture |

---

## Report Template

Output: `.emmet/personas-report.md`

```markdown
# Personas Test Report — [YYYY-MM-DD]

**App:** [nome app / URL]
**Personas testate:** N

---

## Persona: [Nome]

**Profilo:** [dalla map — es. "Utente casual, bassa competenza tecnica, usa da mobile"]
**Obiettivo:** [cosa vuole fare — es. "Trovare un prodotto e acquistarlo"]

### Flusso: [Nome del flusso / UC]

#### Step 1: [Pagina/azione]
**Screenshot:** [screenshot allegato]
**Prima impressione:** [cosa vedo, cosa capisco in 3 secondi]
**Azioni:** [cosa clicco, cosa digito]
**Feedback ricevuto:** [cosa succede dopo l'azione]
**Valutazione:** [positivo/negativo/neutro + motivazione]

#### Step 2: [Pagina/azione]
...

### Scores

| Area | Score | Note |
|------|-------|------|
| Onboarding | 4/5 | Chiaro, manca solo un tooltip sul primo step |
| Navigation | 3/5 | Menu non intuitivo, ho cercato 10s per "Settings" |
| Core Task | 4/5 | Fluido, ma il form ha troppi campi |
| Feedback | 2/5 | Dopo il submit, nessun feedback per 3 secondi |
| Error Recovery | 3/5 | Errore form chiaro ma devo ri-compilare tutto |
| Visual Clarity | 4/5 | Buona gerarchia, testo piccolo su mobile |

### Issues trovati

| # | Severità | Descrizione | Screenshot |
|---|----------|-------------|------------|
| 1 | High | Nessun feedback dopo submit form (3s di vuoto) | [link] |
| 2 | Medium | Menu "Settings" nascosto sotto "More" | [link] |
| 3 | Low | Testo placeholder troppo chiaro su sfondo bianco | [link] |

### Raccomandazioni per questa persona

1. **Aggiungere loading indicator** dopo submit (High)
2. **Spostare "Settings" nel menu principale** (Medium)
3. ...

---

## Persona: [Nome 2]
...

---

## Riepilogo cross-persona

### Score medi

| Area | [Persona 1] | [Persona 2] | [Persona 3] | Media |
|------|-------------|-------------|-------------|-------|
| Onboarding | 4 | 3 | 2 | 3.0 |
| Navigation | 3 | 4 | 3 | 3.3 |
| Core Task | 4 | 4 | 3 | 3.7 |
| ... | | | | |

### Issues prioritizzati (cross-persona)

| # | Severità | Descrizione | Personas impattate |
|---|----------|-------------|--------------------|
| 1 | High | Nessun feedback post-submit | Tutte |
| 2 | High | Mobile layout rotto sotto 375px | Persona 3 |
| 3 | Medium | Menu navigation confusa | Persona 1, 3 |

### Verdict

- [ ] **PASS** — UX solida per tutte le personas
- [ ] **CONDITIONAL** — Usabile ma con frizioni significative
- [ ] **FAIL** — Problemi bloccanti per almeno una persona
```

---

## Differenze rispetto a `--functions`

| | `--functions` | `--personas` |
|---|---|---|
| **Backend** | Playwright runner (`npx playwright test`) | `@playwright/mcp` (Claude naviga) |
| **Output** | pass/fail programmatici, report hooks | Report qualitativo con screenshot e scores |
| **Domanda** | "Funziona?" | "Com'è l'esperienza?" |
| **Assertions** | `expect().toBeVisible()` | Claude osserva e giudica |
| **CI/CD** | Sì | No (richiede interazione Claude) |
| **Velocità** | ~30s per 50 test | ~5-15 min per persona |
| **Cosa trova** | Bug funzionali, regression, data integrity | Problemi UX, confusione, frizioni, design issues |

---

## Quando usare `--personas`

- Dopo il deploy di nuove feature
- Quando la UI cambia significativamente
- Per validare che il flusso utente sia intuitivo
- Prima di un lancio o major release
- Quando ci sono dubbi sulla UX
- Per testare responsive/mobile experience

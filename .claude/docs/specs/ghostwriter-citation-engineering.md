# Spec: Ghostwriter Citation Engineering Integration

**Data:** 2026-02-11
**Tipo:** Enhancement
**Fonte:** `ghostwriter-enhancement/Content_Engineering_LLM_Citation.docx`

---

## Cosa sto costruendo

Integrazione di 6 tecniche di Citation Engineering nella knowledge base GEO di Ghostwriter e nelle validation rules. L'obiettivo è passare da "citation worthiness" come principio generico a pattern tattici concreti che guidino la scrittura.

---

## Cosa NON sto facendo

- Non riscrivo file esistenti — estendo sezioni o aggiungo contenuto mirato
- Non aggiungo tecniche backend (HyDE, Query Expansion, Parent Document Retrieval) — non sono actionable per chi scrive contenuti
- Non duplico concetti già presenti (answer-first, self-contained chunks, entity clarity base)
- Non creo nuovi comandi o workflow

---

## File che tocco

| File | Azione | Cosa aggiungo |
|------|--------|---------------|
| `GEO/content-structure.md` | Estendo 3 sezioni + 1 nuova | Citation Anchors, Chunk-Aware anti-patterns, Entity Salience, Chunk size per content type |
| `GEO/fundamentals.md` | Estendo 2 sezioni | Attribution Layer, Content Freshness come segnale GEO |
| `validation/rules.md` | Aggiungo 4 nuove regole | GEO-011 → GEO-014 |
| `SKILL.md` | Aggiorno conteggio regole | 46 → 50 |

---

## Dettaglio modifiche

### 1. `GEO/content-structure.md`

#### 1a. Nuova sezione: "Citation Anchors" (dopo "Citation-Worthy Content")

Pattern concreti per ancorare la citazione da parte di LLM:

- **Frasi d'autorità:** "Secondo [Fonte]...", "Come dimostrato da [Studio]...", "I dati di [Organizzazione] mostrano..."
- **Self-reference esplicito:** "Questa guida spiega...", "In questo articolo analizziamo...", "Il presente documento descrive..."
- **Claim verificabili:** Affermazioni specifiche e falsificabili con numeri concreti
- **Dati quantitativi:** Statistiche, percentuali, metriche — i LLM preferiscono citare fonti che contengono dati precisi

Esempio buono vs cattivo:
```
BAD:  "Le aziende dovrebbero investire nel content marketing"
GOOD: "Secondo il Content Marketing Institute (2024), il 73% delle aziende B2B
       che investono in content marketing riportano un aumento del 40% nella
       lead generation entro 12 mesi"
```

#### 1b. Estensione sezione "Chunk-Level Retrieval Optimization": anti-pattern cross-chunk

Aggiungere sotto-sezione "Chunk-Aware Writing Anti-Patterns":

- **Mai riferimenti cross-chunk:** Evitare "come detto sopra", "nel paragrafo precedente", "vedi sezione X"
- **Mai pronomi ambigui a inizio paragrafo:** Evitare "Questo..." / "Esso..." senza antecedente nello stesso chunk
- **Transizioni esplicite:** Ogni paragrafo deve ri-stabilire il contesto con una frase di apertura che nomina il soggetto
- **Riepiloghi frequenti:** In contenuti lunghi, inserire mini-summary ogni 3-4 sezioni che rinforzano il contesto per chunk isolati

#### 1c. Estensione sezione "Chunk-Level Retrieval Optimization": dimensioni per content type

Aggiungere tabella chunk size differenziato:

| Tipo contenuto | Chunk ottimale | Note |
|---------------|----------------|------|
| FAQ | 40-80 parole | Una domanda-risposta per chunk |
| Documentazione tecnica | 80-150 parole | Chunk piccoli per precisione |
| Articoli/blog | 150-250 parole | Bilanciamento precisione-contesto |
| Guide procedurali | 80-150 parole | Uno step per chunk |
| Pubblicazioni approfondite | 250-400 parole | Chunk più grandi per contesto |

Nota: il range attuale 40-150 resta come default. La tabella raffina per tipo.

#### 1d. Estensione sezione "Paragraph Optimization": Entity Salience

Aggiungere principio di salience posizionale:

- Le entità principali (nomi, concetti chiave, termini tecnici) devono apparire nelle **prime 1-2 frasi** di ogni sezione e paragrafo
- Non è sufficiente che l'entità appaia "da qualche parte" — i modelli di embedding pesano maggiormente le prime frasi
- Se un paragrafo tratta "React Server Components", quelle parole devono essere nelle prime 20 parole del paragrafo

### 2. `GEO/fundamentals.md`

#### 2a. Estensione sezione "Citation Worthiness": Attribution Layer

Aggiungere sotto-sezione "Attribution Layer Strutturato":

Ogni contenuto citabile deve avere un layer di attribuzione esplicito:

- **Author byline** con credenziali/titolo professionale
- **Data di pubblicazione** in formato ISO 8601
- **Data di ultima modifica** (segnale di freshness)
- **Organizzazione** di appartenenza
- **Link a contenuti correlati** dello stesso autore (rinforza authority)

Implementazione HTML:
```html
<article itemscope itemtype="https://schema.org/Article">
  <meta itemprop="datePublished" content="2025-01-15" />
  <meta itemprop="dateModified" content="2025-06-20" />
  <span itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="name">Nome Autore</span>
    <span itemprop="jobTitle">Titolo</span>
  </span>
</article>
```

#### 2b. Estensione sezione "Core GEO Principles": Content Freshness

Aggiungere Content Freshness come segnale GEO esplicito:

- I sistemi RAG privilegiano contenuti recenti — `dateModified` è un segnale di ranking
- **Aggiornare regolarmente:** Anche piccoli update (nuovi dati, riformulazioni) resettano il segnale di freshness
- **Date esplicite nel contenuto:** "Aggiornato a [mese anno]" nel body text, non solo nei meta
- **Evitare date vaghe:** "Recentemente" → "A giugno 2025"

### 3. `validation/rules.md`

Aggiungere 4 nuove regole GEO:

```
### GEO-011: Citation Anchors
- **Regola:** Almeno 2 citation anchors per contenuto (frasi d'autorità, dati quantitativi, o self-reference con nome del documento)
- **Misura:** Conteggio pattern: "Secondo...", "I dati mostrano...", "[N]%", "Questa guida..."
- **Soglia:** ≥ 2 per articolo, ≥ 1 ogni 500 parole per contenuti lunghi

### GEO-012: Entity Salience
- **Regola:** L'entità principale di ogni sezione appare nelle prime 2 frasi della sezione
- **Misura:** Verificare che H2/H3 keyword sia presente nelle prime 30 parole del paragrafo successivo
- **Soglia:** 100% delle sezioni

### GEO-013: Cross-Chunk Independence
- **Regola:** Nessun paragrafo contiene riferimenti a contenuto di altri paragrafi ("come detto sopra", "nel paragrafo precedente", "vedi sezione")
- **Misura:** Grep per pattern: "come detto", "sopra", "precedente", "vedi sezione", "come menzionato"
- **Soglia:** 0 occorrenze

### GEO-014: Content Freshness Signals
- **Regola:** Il contenuto include data di pubblicazione e data di ultima modifica (nei meta o nel body)
- **Misura:** Presenza di datePublished + dateModified in Schema.org o nel testo visibile
- **Soglia:** Entrambe presenti
```

### 4. `SKILL.md`

Aggiornare il conteggio delle validation rules:
- `46 measurable rules` → `50 measurable rules`
- Nella sezione Validation System, aggiornare il conteggio GEO: `10` → `14`

---

## Cosa riuso

- La sezione "Citation-Worthy Content" in `content-structure.md` è il punto di estensione naturale per Citation Anchors
- La sezione "Core GEO Principles" in `fundamentals.md` ospita già i principi — aggiungo Freshness
- Il sistema di validation rules è già strutturato con ID incrementali — estendo GEO-011/014
- I pattern Schema.org per attribuzione esistono già in `GEO/schema.md` — faccio cross-reference

---

## Come verifico

1. Ogni nuova sezione è coerente con il tono e formato dei file esistenti
2. Le 4 nuove regole sono misurabili e non ambigue (stesso standard delle 46 esistenti)
3. Nessuna duplicazione con contenuto già presente
4. Cross-reference tra file sono corretti
5. Il conteggio totale in SKILL.md è aggiornato (50)
6. Nessun file nuovo creato — solo estensioni di file esistenti

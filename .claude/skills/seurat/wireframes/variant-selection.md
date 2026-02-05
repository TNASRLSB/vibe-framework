# Wireframe Variant Selection

Come i pesi visivi combinati determinano quale variante wireframe usare per ogni archetipo.

---

## Overview

Dopo che il sistema generativo produce i **combined visual weights** (trust, innovation, formality, warmth, playfulness, density), questi stessi pesi selezionano automaticamente la variante wireframe più appropriata per ogni archetipo.

---

## Selection Algorithm

### Step 1: Calculate Variant Fit

Per ogni archetipo, ogni variante ha un profilo di pesi ideali. Il fit score si calcola come per gli stili:

```python
def variant_fit(variant_ideal_weights, combined_weights):
    score = 0
    for weight in WEIGHTS:
        if weight in variant_ideal_weights:
            diff = abs(variant_ideal_weights[weight] - combined_weights[weight])
            score += (1 - diff)
    return score / len(variant_ideal_weights)
```

### Step 2: Select by Mode

| Mode | Selection |
|------|-----------|
| Safe | `argmax(variant_fit)` — variante con fit più alto |
| Chaos | `random.choices(variants, weights=fit_scores)` — random pesato |
| Hybrid | `argmax(variant_fit)` — poi Factor X `layout-break` può forzare upgrade |

### Step 3: Factor X Layout Override (Hybrid only)

In modalità hybrid, il Factor X `layout-break` può forzare una variante non convenzionale:

```
Se Factor X = layout-break:
  → Se la variante selezionata è la "default" (più conservativa),
    forza upgrade alla variante con innovation weight più alto.
  → Intensità del Factor X determina quanto "lontano" si spinge.
```

---

## Variant Profiles per Archetype

### Entry (Landing Page)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **hero-centric** | 0.5 | 0.6 | 0.4 | 0.5 | 0.4 | 0.3 |
| **split** | 0.6 | 0.5 | 0.6 | 0.4 | 0.3 | 0.4 |
| **minimal** | 0.4 | 0.7 | 0.3 | 0.3 | 0.5 | 0.2 |

**Rationale:**
- **hero-centric**: Bilanciato, buon default. Immagini grandi comunicano warmth, struttura lineare è moderatamente formale.
- **split**: Layout più strutturato, due colonne comunicano professionalità e trust. Più denso.
- **minimal**: Molto spazio, pochi elementi. Alto innovation (scelta coraggiosa), bassa density.

---

### Discovery (Search/Listing)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **sidebar-grid** | 0.6 | 0.4 | 0.6 | 0.4 | 0.2 | 0.6 |
| **top-filters** | 0.5 | 0.5 | 0.5 | 0.5 | 0.3 | 0.5 |
| **map-list** | 0.5 | 0.6 | 0.4 | 0.5 | 0.3 | 0.5 |

**Rationale:**
- **sidebar-grid**: Pattern classico e-commerce, alto trust e formalità, alta density per mostrare molti prodotti.
- **top-filters**: Più bilanciato, adatto a contesti meno formali. Filtri visibili ma non dominanti.
- **map-list**: Per contesti location-based (travel, real estate, food). Più innovativo del sidebar classico.

---

### Detail (Item Detail)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **media-info** | 0.6 | 0.4 | 0.5 | 0.5 | 0.3 | 0.5 |
| **full-width** | 0.4 | 0.7 | 0.3 | 0.5 | 0.5 | 0.3 |
| **sticky-sidebar** | 0.6 | 0.4 | 0.6 | 0.4 | 0.2 | 0.6 |

**Rationale:**
- **media-info**: Split classico immagine/info, affidabile e bilanciato.
- **full-width**: Immagine hero immersiva, più creativo, bassa density. Portfolio, fashion, art.
- **sticky-sidebar**: Info sempre visibile, alta density. E-commerce, booking, SaaS pricing.

---

### Action (Form/Wizard)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **centered-card** | 0.6 | 0.4 | 0.6 | 0.4 | 0.2 | 0.4 |
| **wizard** | 0.6 | 0.5 | 0.5 | 0.5 | 0.3 | 0.4 |
| **split-preview** | 0.5 | 0.6 | 0.4 | 0.5 | 0.4 | 0.4 |

**Rationale:**
- **centered-card**: Login/signup classico. Alto trust e formalità, centrato è sicuro.
- **wizard**: Multi-step, mostra progresso. Bilanciato, leggermente più warmth (guida l'utente).
- **split-preview**: Anteprima accanto al form. Più innovativo, buon warmth (feedback visivo).

---

### Management (Admin/Table)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **table** | 0.6 | 0.3 | 0.7 | 0.3 | 0.1 | 0.7 |
| **card-grid** | 0.5 | 0.5 | 0.4 | 0.5 | 0.4 | 0.5 |
| **kanban** | 0.5 | 0.6 | 0.4 | 0.5 | 0.4 | 0.5 |

**Rationale:**
- **table**: Massima density e formalità. Enterprise, accounting, data-heavy.
- **card-grid**: Più visivo, meno formale. Adatto a contenuti con immagini (CMS, media).
- **kanban**: Workflow-oriented, più innovativo. Project management, task tracking.

---

### System (Error/Status)

| Variant | trust | innovation | formality | warmth | playfulness | density |
|---------|-------|------------|-----------|--------|-------------|---------|
| **centered** | 0.5 | 0.4 | 0.5 | 0.5 | 0.3 | 0.2 |
| **full-page** | 0.4 | 0.6 | 0.3 | 0.4 | 0.5 | 0.2 |
| **split** | 0.5 | 0.5 | 0.5 | 0.5 | 0.3 | 0.3 |

**Rationale:**
- **centered**: Default sicuro. Icona + messaggio + azioni centrate. Universale.
- **full-page**: Più creativo, usa illustrazioni o animazioni. Alto playfulness.
- **split**: Illustrazione a sinistra, messaggio a destra. Bilanciato.

---

## Quick Reference Table

Sintesi per decisione rapida basata sul peso dominante:

| Peso dominante | Entry | Discovery | Detail | Action | Management | System |
|----------------|-------|-----------|--------|--------|------------|--------|
| **trust** > 0.7 | split | sidebar-grid | sticky-sidebar | centered-card | table | centered |
| **innovation** > 0.7 | minimal | map-list | full-width | split-preview | kanban | full-page |
| **formality** > 0.7 | split | sidebar-grid | sticky-sidebar | centered-card | table | centered |
| **warmth** > 0.7 | hero-centric | top-filters | media-info | wizard | card-grid | split |
| **playfulness** > 0.6 | minimal | top-filters | full-width | split-preview | kanban | full-page |
| **density** > 0.6 | hero-centric | sidebar-grid | sticky-sidebar | centered-card | table | centered |
| **balanced** | hero-centric | sidebar-grid | media-info | centered-card | table | centered |

**"Balanced"** = nessun peso sopra 0.6 o tutti nella fascia 0.4-0.6.

---

## Integration with Factor X

In hybrid mode, dopo la selezione della variante:

1. Se **Factor X = layout-break** → forza upgrade alla variante più innovativa dell'archetipo
2. Se **Factor X = typography-clash** → mantieni variante ma applica scale-break su heading
3. Se **Factor X = motion-surprise** → mantieni variante ma aggiungi animazione reveal
4. Se **Factor X = color-intrusion** → mantieni variante ma un blocco usa colore "fuori schema"
5. Se **Factor X = texture-injection** → mantieni variante ma aggiungi texture su una sezione

Solo `layout-break` cambia la variante stessa. Gli altri Factor X si applicano sopra la variante selezionata.

---

## Example

```
Combined weights:
  trust: 0.7
  innovation: 0.6
  formality: 0.4
  warmth: 0.5
  playfulness: 0.3
  density: 0.5

Mode: Safe

Entry variant selection:
  hero-centric fit: (1-|0.5-0.7| + 1-|0.6-0.6| + 1-|0.4-0.4| + 1-|0.5-0.5| + 1-|0.4-0.3| + 1-|0.3-0.5|) / 6
                   = (0.8 + 1.0 + 1.0 + 1.0 + 0.9 + 0.8) / 6 = 0.917
  split fit:        (1-|0.6-0.7| + 1-|0.5-0.6| + 1-|0.6-0.4| + 1-|0.4-0.5| + 1-|0.3-0.3| + 1-|0.4-0.5|) / 6
                   = (0.9 + 0.9 + 0.8 + 0.9 + 1.0 + 0.9) / 6 = 0.900
  minimal fit:      (1-|0.4-0.7| + 1-|0.7-0.6| + 1-|0.3-0.4| + 1-|0.3-0.5| + 1-|0.5-0.3| + 1-|0.2-0.5|) / 6
                   = (0.7 + 0.9 + 0.9 + 0.8 + 0.8 + 0.7) / 6 = 0.800

Winner: hero-centric (0.917)
```

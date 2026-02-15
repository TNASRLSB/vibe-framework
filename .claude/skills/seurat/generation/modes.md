# Generation Modes

Tre modalità per generare UI, dal prevedibile all'imprevedibile.

---

## Overview

| Mode | Input | Output | Rischio | Use Case |
|------|-------|--------|---------|----------|
| **Safe** | Type + Industry + Target | Prevedibile, testato | Basso | "Voglio qualcosa che funziona" |
| **Chaos** | Nessuno | Imprevedibile | Alto | "Sorprendimi" |
| **Hybrid** | Type + Industry + Target | Base safe + Factor X | Medio | "Funzionale ma distintivo" |

---

## Safe Mode

### Quando Usarlo
- Cliente conservativo
- Settore regolamentato (healthcare, finance, government)
- Deadline strette, no tempo per iterazioni
- "Non voglio rischi"

### Processo

```
0. INTENT EXPLORATION (skip se user fornisce già type/industry/target, o se tokens.css esiste)
   Poni 3 domande:
   - Chi usa il prodotto e cosa deve raggiungere? (una frase)
   - In che mondo visivo vive? (3+ associazioni)
   - Cosa NON deve sembrare? (2+ anti-riferimenti)
   → Q1 guida selezione profilo, Q2 → commento in tokens.css, Q3 → anti-pattern locale

1. INPUT
   User fornisce:
   - Type (es: SaaS)
   - Industry (es: Fintech)
   - Target (es: Enterprise + Developers)

2. PROFILE LOADING
   Carica profili da:
   - matrices/by-type.md
   - matrices/by-industry.md
   - matrices/by-target/*.md

3. WEIGHT COMBINATION
   Applica regole da combination-logic.md:
   - Average visual weights
   - Max style affinities
   - Apply hard constraints

4. STYLE SELECTION
   - Filtra stili con affinity "low"
   - Calcola fit score per ogni stile rimanente
   - Seleziona highest score

5. MODIFIER SELECTION
   - Per ogni categoria (grid, curves, palette, density)
   - Seleziona tendency con peso più alto

6. ANTI-PATTERN CHECK
   - Verifica combinazione contro anti-patterns.md
   - Se viola: sostituisci modifier più debole

7. GENERATION
   - Applica stile + modifiers
   - Output deterministico
```

### Output Garantito
- Accessibile (WCAG AA)
- Coerente con aspettative del settore
- Professionale
- "Corretto" ma potenzialmente generico

---

## Chaos Mode

### Quando Usarlo
- Progetto creativo/sperimentale
- Cliente che vuole differenziarsi radicalmente
- Esplorazione, brainstorming
- "Mostrami cosa è possibile"

### Processo

```
1. INPUT
   Nessun input dall'utente (opzionale: seed per riproducibilità)

2. RANDOM EXTRACTION
   - Estrai 1 stile base (random uniforme)
   - Estrai 2 modifiers da categorie DIVERSE (random)

3. TENSION CHECK
   - Verifica se combinazione ha tensione interessante
   - Se troppo coerente (no tension flags): ri-estrai un modifier
   - Goal: almeno 1 tension flag

4. ANTI-PATTERN CHECK
   - Verifica contro anti-patterns.md
   - Se viola: sostituisci elemento che causa violazione
   - Ri-verifica tension (non deve sparire)

5. GENERATION
   - Applica combinazione
   - Mantieni tensioni irrisolte (feature, not bug)
   - Output imprevedibile
```

### Output Possibile
- Potenzialmente geniale
- Potenzialmente inutilizzabile
- Sempre interessante
- Mai noioso

### Reproducibility
Se user vuole riprodurre un risultato Chaos:
```
/seurat generate hero --seed=42
```
Lo stesso seed produce la stessa estrazione random.

---

## Hybrid Mode

### Quando Usarlo
- Vuoi una base solida ma non generica
- Cliente aperto ma non temerario
- "Come i competitor ma riconoscibile"
- Balance tra sicurezza e distintività

### Processo

```
0. INTENT EXPLORATION (skip se user fornisce già type/industry/target, o se tokens.css esiste)
   Come Safe mode Step 0: 3 domande (chi/cosa, mondo visivo, anti-riferimenti)

1. INPUT
   User fornisce:
   - Type, Industry, Target (come Safe mode)
   - (Opzionale) Factor X preference

2. SAFE BASE
   Esegui step 2-6 di Safe mode
   → Ottieni: stile base + modifiers "sicuri"

3. TENSION DETECTION
   Analizza combined weights per tension flags:
   - innovation > 0.7 AND formality > 0.7
   - warmth > 0.7 AND density > 0.7
   - playfulness > 0.6 AND trust > 0.6
   - etc.

4. FACTOR X SELECTION
   Se tension flag esiste:
   - Seleziona Factor X che SFRUTTA la tensione
   - Es: playfulness/trust tension → "motion-surprise" (playful microinteraction in serious UI)

   Se no tension flag:
   - Estrai Factor X random
   - Applicalo con intensità "subtle" (10%)

5. FACTOR X APPLICATION
   - Carica regole da factor-x/[selected].md
   - Applica con intensità appropriata:
     - Tension exists: Medium (30%)
     - No tension: Subtle (10%)

6. ANTI-PATTERN CHECK
   - Verifica risultato finale
   - Factor X non deve creare anti-pattern
   - Se viola: riduci intensità o cambia Factor X

7. GENERATION
   - Base safe + Factor X injection
   - Output riconoscibile ma distintivo
```

### Output Garantito
- Accessibile (WCAG AA)
- Base coerente con settore
- UN elemento distintivo
- Memorabile senza essere rischioso

---

## Mode Selection Flow

```
/seurat generate [component]

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Come vuoi procedere?                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [S] Safe                                            │   │
│  │     Ti chiederò tipologia, industria e target.      │   │
│  │     Output prevedibile, testato, professionale.     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [C] Chaos                                           │   │
│  │     Nessuna domanda. Estrazione random.             │   │
│  │     Output imprevedibile, potenzialmente unico.     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [H] Hybrid                                          │   │
│  │     Ti chiederò tipologia, industria e target.      │   │
│  │     Poi aggiungo UN elemento che rompe il cliché.   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Post-Generation (All Modes)

Dopo la generazione, sempre:

1. **Accessibility Validation**
   - Contrast ratio ≥ 4.5:1
   - Touch targets ≥ 44px
   - Focus states present
   - Semantic HTML

2. **Anti-Pattern Final Check**
   - No "AI slop" signatures
   - No forbidden combinations

3. **Output Documentation**
   ```markdown
   ## Generation Report

   **Mode**: [Safe/Chaos/Hybrid]
   **Style**: [selected style]
   **Modifiers**:
   - Grid: [value]
   - Curves: [value]
   - Palette: [value]
   - Density: [value]
   **Factor X**: [if Hybrid: name + intensity]
   **Tensions**: [any unresolved tensions]
   **Seed**: [for reproducibility]
   ```

---

## Comparison Matrix

| Aspect | Safe | Chaos | Hybrid |
|--------|------|-------|--------|
| User input required | Yes | No | Yes |
| Deterministic | Yes | No (seedable) | Mostly |
| Follows industry conventions | Always | Rarely | Base yes, Factor X no |
| Risk of unusable output | ~0% | ~30% | ~5% |
| Risk of generic output | ~60% | ~5% | ~20% |
| Accessibility guaranteed | Yes | Yes | Yes |
| Time to iterate | Low | High | Medium |
| Client approval likelihood | High | Low | Medium-High |

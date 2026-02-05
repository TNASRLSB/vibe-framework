# Combination Logic

Come i profili di Type, Industry e Target si combinano per produrre un output.

---

## Visual Weights

Ogni profilo definisce pesi per queste proprietà:

| Weight | Range | Descrizione |
|--------|-------|-------------|
| `trust` | 0.0-1.0 | Quanto deve comunicare affidabilità, sicurezza |
| `innovation` | 0.0-1.0 | Quanto deve sembrare moderno, cutting-edge |
| `formality` | 0.0-1.0 | Quanto deve essere professionale, serio |
| `warmth` | 0.0-1.0 | Quanto deve essere accogliente, friendly |
| `playfulness` | 0.0-1.0 | Quanto può essere giocoso, unconventional |
| `density` | 0.0-1.0 | Quanta informazione per viewport |

---

## Combination Rules

### Rule 1: AVERAGE per Visual Weights

Quando più profili specificano lo stesso weight, fai la media.

```
Input:
  SaaS.trust = 0.6
  Fintech.trust = 0.8
  Enterprise.trust = 0.7

Output:
  combined.trust = (0.6 + 0.8 + 0.7) / 3 = 0.7
```

**Eccezione**: Se un profilo non specifica un weight, non conta nella media.

```
Input:
  SaaS.playfulness = (not specified)
  Fintech.playfulness = 0.3
  Gen_Z.playfulness = 0.8

Output:
  combined.playfulness = (0.3 + 0.8) / 2 = 0.55
```

### Rule 2: MAX per Style Affinities

Quando più profili esprimono affinity per uno stile, prendi il più permissivo.

```
Affinity levels: low < medium < high

Input:
  SaaS.glassmorphism = high
  Fintech.glassmorphism = medium
  Enterprise.glassmorphism = low

Output:
  combined.glassmorphism = high (max)
```

**Rationale**: Se anche UNO dei contesti permette uno stile, lo consideriamo viable.

### Rule 3: WEIGHTED AVERAGE per Modifier Tendencies

Ogni profilo può esprimere preferenze per modifiers. Le preferenze si accumulano.

```
Input:
  Fintech.palette.cold = 0.7
  Fintech.palette.mono = 0.3
  Gen_Z.palette.neon = 0.8
  Gen_Z.palette.cold = 0.2

Output:
  combined.palette = {
    cold: (0.7 + 0.2) / 2 = 0.45,
    mono: 0.3 / 1 = 0.3,
    neon: 0.8 / 1 = 0.8
  }

Winner: neon (0.8)
```

### Rule 4: HARD CONSTRAINTS Override

Alcuni profili definiscono constraints assoluti che non possono essere violati.

```
Constraint types:
  - [property].min = X  → floor, non può scendere sotto
  - [property].max = X  → cap, non può salire sopra
  - [style].forbidden   → stile escluso completamente

Input:
  combined.formality = 0.6
  Gen_Z.constraint: formality.max = 0.4

Output:
  combined.formality = 0.4 (capped)
```

```
Input:
  combined.trust = 0.5
  Healthcare.constraint: trust.min = 0.7

Output:
  combined.trust = 0.7 (floored)
```

```
Input:
  combined.brutalism = high
  Kids.constraint: brutalism.forbidden = true

Output:
  combined.brutalism = (removed from candidates)
```

### Rule 5: TENSION DETECTION

Dopo la combinazione, cerca pattern di tensione:

| Tension | Condition | Flag |
|---------|-----------|------|
| Innovation vs Formality | innovation > 0.7 AND formality > 0.7 | `tension:modern-formal` |
| Warmth vs Density | warmth > 0.7 AND density > 0.7 | `tension:friendly-dense` |
| Playfulness vs Trust | playfulness > 0.6 AND trust > 0.6 | `tension:playful-serious` |
| Innovation vs Trust | innovation > 0.7 AND trust > 0.8 | `tension:edgy-safe` |

**In Safe Mode**: Riduci il peso minore di 0.2 per risolvere tensione.

**In Chaos Mode**: Ignora, lascia tensione irrisolta.

**In Hybrid Mode**: Usa tensione per guidare Factor X selection.

---

## Style Selection Algorithm

### Step 1: Filter by Affinity

```python
candidates = []
for style in ALL_STYLES:
    if combined.affinity[style] != "low":
        candidates.append(style)
```

### Step 2: Calculate Fit Score

Per ogni stile candidato, calcola quanto "fits" i combined weights.

Ogni stile in `styles/base/` definisce i suoi weight ideali:

```markdown
# Glassmorphism

## Ideal Weights
trust: 0.6
innovation: 0.8
formality: 0.5
warmth: 0.4
playfulness: 0.5
density: 0.4
```

Fit score = similarity tra ideal weights e combined weights:

```python
def fit_score(style, combined):
    score = 0
    for weight in WEIGHTS:
        diff = abs(style.ideal[weight] - combined[weight])
        score += (1 - diff)  # più simile = più alto
    return score / len(WEIGHTS)
```

### Step 3: Select

| Mode | Selection |
|------|-----------|
| Safe | `argmax(fit_score)` - highest score wins |
| Chaos | `random.choices(candidates, weights=fit_scores)` - weighted random |
| Hybrid | `argmax(fit_score)` - then apply Factor X |

---

## Modifier Selection Algorithm

Per ogni categoria di modifier (grid, curves, palette, density):

### Step 1: Gather Tendencies

Raccogli tutte le tendenze espresse dai profili per questa categoria.

### Step 2: Normalize

```python
total = sum(tendencies.values())
normalized = {k: v/total for k, v in tendencies.items()}
```

### Step 3: Select

| Mode | Selection |
|------|-----------|
| Safe | `argmax(normalized)` - highest weight wins |
| Chaos | `random.choices(list(normalized.keys()), weights=normalized.values())` |
| Hybrid | `argmax(normalized)` |

### Step 4: Validate Compatibility

Verifica che il modifier selezionato sia compatibile con lo stile base.

```python
if modifier in style.incompatible_modifiers:
    # Seleziona il prossimo nella classifica
    select_next_best()
```

---

## Complete Example

### Input

```
Type: SaaS
Industry: Fintech
Target: Gen Z, Freemium, B2C
```

### Step 1: Load Profiles

```yaml
# SaaS profile
trust: 0.6
innovation: 0.7
formality: 0.5
warmth: 0.4
styles.high: [material, glassmorphism, bento]
palette.cold: 0.6

# Fintech profile
trust: 0.8
innovation: 0.6
formality: 0.6
warmth: 0.3
styles.high: [glassmorphism, material]
palette.cold: 0.7
constraint: trust.min = 0.6

# Gen Z profile
trust: 0.4
innovation: 0.8
formality: 0.2
warmth: 0.6
playfulness: 0.8
styles.high: [gen-z, y2k, glassmorphism]
palette.neon: 0.7
constraint: formality.max = 0.4

# Freemium profile
warmth: 0.6
playfulness: 0.5
density.sparse: 0.6

# B2C profile
warmth: 0.5
formality: 0.3
```

### Step 2: Combine Weights

```yaml
trust: (0.6 + 0.8 + 0.4) / 3 = 0.6
  → floored to 0.6 (Fintech constraint)

innovation: (0.7 + 0.6 + 0.8) / 3 = 0.7

formality: (0.5 + 0.6 + 0.2 + 0.3) / 4 = 0.4
  → capped to 0.4 (Gen Z constraint) ✓

warmth: (0.4 + 0.3 + 0.6 + 0.6 + 0.5) / 5 = 0.48

playfulness: (0.8 + 0.5) / 2 = 0.65
```

### Step 3: Combine Affinities

```yaml
glassmorphism: high (SaaS) + high (Fintech) + high (Gen Z) = HIGH
material: high (SaaS) + high (Fintech) = HIGH
bento: high (SaaS) = HIGH
gen-z: high (Gen Z) = HIGH
y2k: high (Gen Z) = HIGH
# altri: medium o low
```

### Step 4: Tension Detection

```
innovation (0.7) + formality (0.4) = NO tension
playfulness (0.65) + trust (0.6) = TENSION (playful-serious)
```

### Step 5: Style Selection (Safe Mode)

```
Candidates: glassmorphism, material, bento, gen-z, y2k

Fit scores (hypothetical):
- glassmorphism: 0.82
- gen-z: 0.78
- material: 0.71
- y2k: 0.68
- bento: 0.65

Winner: glassmorphism
```

### Step 6: Modifier Selection

```
palette:
  cold: (0.6 + 0.7) / 2 = 0.65
  neon: 0.7
  → Winner: neon (but muted, trust = 0.6)

density:
  sparse: 0.6
  → Winner: sparse

grid: (no strong tendency)
  → Default: bento (glassmorphism compatible)

curves: (no strong tendency)
  → Default: geometric
```

### Step 7: Output (Safe Mode)

```yaml
style: glassmorphism
modifiers:
  palette: neon-muted
  density: sparse
  grid: bento
  curves: geometric
tensions:
  - playful-serious (resolved: reduced playfulness to 0.45)
```

### Step 7b: Output (Hybrid Mode)

```yaml
style: glassmorphism
modifiers:
  palette: neon-muted
  density: sparse
  grid: bento
  curves: geometric
tensions:
  - playful-serious (KEPT)
factor_x:
  name: motion-surprise
  intensity: medium (30%)
  application: "One playful micro-interaction in otherwise serious UI"
```

---

## Wireframe Variant Selection

Dopo la selezione dello stile e dei modifiers, i combined weights selezionano anche la variante wireframe per ogni archetipo.

### Algorithm

Identico allo style selection: ogni variante wireframe ha ideal weights, il fit score determina la selezione.

```python
def select_variant(archetype, combined_weights, mode):
    variants = load_variants(archetype)  # from wireframes/[archetype].md
    scores = {}
    for variant in variants:
        scores[variant.name] = variant_fit(variant.ideal_weights, combined_weights)

    if mode == "safe":
        return argmax(scores)
    elif mode == "chaos":
        return random.choices(list(scores.keys()), weights=scores.values())
    elif mode == "hybrid":
        selected = argmax(scores)
        if factor_x == "layout-break":
            # Force upgrade to most innovative variant
            innovation_scores = {v.name: v.ideal_weights["innovation"] for v in variants}
            return argmax(innovation_scores)
        return selected
```

### Reference

Full variant profiles and quick reference table: [wireframes/variant-selection.md](../wireframes/variant-selection.md)

---

## Edge Cases

### No Clear Winner

Se più stili hanno fit score entro 0.05:
- Safe: pick first alphabetically (deterministic)
- Chaos: random among tied
- Hybrid: pick first, Factor X will differentiate

### Conflicting Hard Constraints

Se due constraint sono incompatibili:
```
Healthcare: trust.min = 0.8
Gen Z: formality.max = 0.3, trust.max = 0.5
```

**Resolution**: Constraint da Industry > constraint da Target
→ trust = 0.8 (Healthcare wins)

### All Styles Filtered Out

Se tutti gli stili hanno affinity "low":
1. Warning: "Unusual combination, no standard style fits"
2. Chaos mode: pick random anyway
3. Safe/Hybrid: ask user for guidance

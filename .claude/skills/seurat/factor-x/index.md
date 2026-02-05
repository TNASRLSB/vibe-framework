# Factor X: Controlled Chaos

Il Factor X introduce elementi di imprevedibilità controllata per rompere i pattern prevedibili e creare design distintivi.

---

## Cos'è il Factor X

Il Factor X è un sistema di "breakers" - interventi mirati che rompono la prevedibilità del design generato dalle matrici Type/Industry/Target.

**Obiettivo**: Evitare che ogni SaaS sembri uguale, ogni e-commerce abbia lo stesso look, ogni corporate website sia intercambiabile.

---

## Quando si Attiva

Il Factor X si attiva solo in **Hybrid Mode**:

```
Safe Mode   → Matrici pure, nessun Factor X
Chaos Mode  → Random puro, Factor X non necessario
Hybrid Mode → Matrici + Factor X selezionato
```

---

## Categorie di Factor X

### 1. Typography Clash
Combinazioni tipografiche inaspettate che creano tensione visiva.
→ [typography-clash.md](./typography-clash.md)

### 2. Color Intrusion
Un colore "alieno" che rompe la palette altrimenti coerente.
→ [color-intrusion.md](./color-intrusion.md)

### 3. Layout Break
Elementi che rompono il grid in modi controllati.
→ [layout-break.md](./layout-break.md)

### 4. Texture Injection
Pattern, grain, o texture che aggiungono materialità.
→ [texture-injection.md](./texture-injection.md)

### 5. Motion Surprise
Animazioni inaspettate in contesti altrimenti statici.
→ [motion-surprise.md](./motion-surprise.md)

---

## Selezione del Factor X

### Random Selection (Default)

In Hybrid Mode, un Factor X viene scelto random:

```javascript
const factorX = pickRandom([
  'typography-clash',
  'color-intrusion',
  'layout-break',
  'texture-injection',
  'motion-surprise'
]);
```

### Weighted Selection (Smart)

Alcuni Factor X funzionano meglio con certi stili:

| Factor X | Funziona bene con | Evitare con |
|----------|------------------|-------------|
| Typography Clash | Flat, Brutalism, Editorial | Material, Enterprise |
| Color Intrusion | Mono palette, Cold palette | Neon palette |
| Layout Break | Swiss grid, Bento | Già Broken grid |
| Texture Injection | Flat, Glassmorphism | Skeuomorphism, Claymorphism |
| Motion Surprise | Static styles | Spatial, Y2K (già animato) |

### Intensity Levels

Ogni Factor X può essere applicato con intensità variabile:

```yaml
subtle:      10% presence - quasi invisibile
moderate:    25% presence - notabile ma non dominante
bold:        40% presence - statement chiaro
extreme:     60% presence - elemento dominante
```

---

## Regole di Applicazione

### 1. Un Solo Factor X alla Volta

Non combinare mai più Factor X nello stesso progetto. Uno è sufficiente per rompere la prevedibilità.

### 2. Rispetta i Constraint Funzionali

Il Factor X non deve mai compromettere:
- Accessibilità (WCAG)
- Leggibilità dei contenuti critici
- Funzionalità core (form, navigation, checkout)

### 3. Applica in Zone Non-Critiche

Preferisci applicare il Factor X in:
- Hero sections
- Visual dividers
- Background elements
- Decorative sections

Evita in:
- Form e input
- Navigation
- CTA buttons
- Error messages

### 4. Scala con il Trust Weight

```
Se trust > 0.8 → Factor X intensity max = subtle
Se trust 0.6-0.8 → Factor X intensity max = moderate
Se trust < 0.6 → Factor X intensity può essere bold/extreme
```

---

## Esempi di Applicazione

### Esempio 1: SaaS Fintech

**Output Safe Mode:**
- Material style
- Cold palette
- Swiss grid
- Trust: 0.85

**Con Factor X (Typography Clash - Subtle):**
- Material style
- Cold palette
- Swiss grid
- Trust: 0.85
- **Factor X**: Heading in display serif (es. Playfair) invece del solito sans

### Esempio 2: E-commerce Fashion

**Output Safe Mode:**
- Glassmorphism style
- Warm palette
- Bento grid
- Trust: 0.65

**Con Factor X (Color Intrusion - Moderate):**
- Glassmorphism style
- Warm palette
- Bento grid
- Trust: 0.65
- **Factor X**: Accent neon lime su una palette altrimenti earth tones

### Esempio 3: Portfolio Designer

**Output Safe Mode:**
- Bento style
- Mono palette
- Asymmetric grid
- Trust: 0.5

**Con Factor X (Texture Injection - Bold):**
- Bento style
- Mono palette
- Asymmetric grid
- Trust: 0.5
- **Factor X**: Grain texture over tutto, effetto film/analog

---

## Documentazione per File

Ogni file Factor X contiene:
1. Variazioni disponibili
2. CSS/implementazione
3. Compatibilità con stili
4. Livelli di intensità
5. Esempi applicati

---

## Anti-Pattern: Factor X Overload

**SBAGLIATO:**
```
Factor X: Typography Clash + Color Intrusion + Motion Surprise
```
Risultato: Caos non controllato, perde significato.

**CORRETTO:**
```
Factor X: Typography Clash (moderate)
```
Risultato: Tensione interessante, memorabile.

---

## Prompt Template per Hybrid Mode

```
Genera un design per [TYPE] in [INDUSTRY] targeting [TARGET].

Usa le matrici per i pesi base, poi applica:
Factor X: [FACTOR] con intensità [INTENSITY]

Assicurati che il Factor X:
- Non comprometta l'accessibilità
- Sia applicato in zone non-critiche
- Crei tensione senza confusione
```

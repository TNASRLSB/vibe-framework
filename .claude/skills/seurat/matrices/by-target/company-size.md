# Target Profiles: Company Size

Profili basati sulla dimensione dell'azienda target.

---

## Enterprise

**Descrizione**: Grandi aziende, 500+ dipendenti, Fortune 500

### Visual Weights

```yaml
trust: 0.95        # Massima affidabilità richiesta
innovation: 0.4    # Conservativo, no rischi
formality: 0.9     # Altamente formale
warmth: 0.3        # Professionale, non caldo
playfulness: 0.1   # Zero giocosità
density: 0.7       # Molto contenuto, molte feature
```

### Style Affinities

```yaml
high:
  - material       # Standard enterprise
  - flat           # Pulito e scalabile
medium:
  - glassmorphism  # Moderno ma controllato
  - spatial        # Dashboard avanzate
low:
  - neumorphism    # Troppo trendy
  - skeuomorphism  # Datato
forbidden:
  - brutalism      # Mai
  - gen-z          # Mai
  - y2k            # Mai
  - claymorphism   # Troppo casual
```

### Modifier Tendencies

```yaml
grid: swiss        # Rigore assoluto
curves: geometric  # Nessuna frivolezza
palette: cold      # Professionale
density: dense     # Molte informazioni
```

### Hard Constraints

```yaml
must_have:
  - WCAG AAA compliance
  - Scalabilità per migliaia di utenti
  - Multi-language support
forbidden:
  - Animazioni eccessive
  - Colori neon
  - Font decorativi
```

---

## Mid-Market

**Descrizione**: Aziende medie, 50-500 dipendenti

### Visual Weights

```yaml
trust: 0.8         # Alta ma non estrema
innovation: 0.5    # Bilanciato
formality: 0.7     # Formale ma non rigido
warmth: 0.4        # Leggermente caldo
playfulness: 0.2   # Minima
density: 0.6       # Equilibrata
```

### Style Affinities

```yaml
high:
  - material       # Standard sicuro
  - flat           # Universale
  - bento          # Dashboard organizzate
medium:
  - glassmorphism  # Tocco moderno
  - neumorphism    # Se appropriato
low:
  - spatial        # Troppo avanzato
  - skeuomorphism  # Datato
forbidden:
  - brutalism      # Troppo rischioso
  - gen-z          # Non appropriato
  - y2k            # Datato
```

### Modifier Tendencies

```yaml
grid: swiss        # Ordine
curves: geometric  # Soft corners ok
palette: cold      # Professionale
density: balanced  # Equilibrio
```

---

## SMB (Small-Medium Business)

**Descrizione**: Piccole-medie imprese, 10-50 dipendenti

### Visual Weights

```yaml
trust: 0.7         # Importante ma flessibile
innovation: 0.55   # Aperti a novità
formality: 0.5     # Né troppo formale né casual
warmth: 0.55       # Più umano
playfulness: 0.3   # Un po' di personalità
density: 0.5       # Moderata
```

### Style Affinities

```yaml
high:
  - flat           # Semplice ed efficace
  - material       # Riconoscibile
  - bento          # Organizzato
medium:
  - glassmorphism  # Moderno
  - neumorphism    # Soft
  - claymorphism   # Se appropriato
low:
  - spatial        # Overhead tecnico
  - skeuomorphism  # Datato
forbidden:
  - brutalism      # Confonde il cliente
```

### Modifier Tendencies

```yaml
grid: bento        # Flessibile
curves: organic    # Approachable
palette: warm      # Friendly
density: balanced  # Non sovraccarico
```

---

## Startup

**Descrizione**: Early stage, 1-10 dipendenti

### Visual Weights

```yaml
trust: 0.6         # Da costruire
innovation: 0.75   # Differenziarsi
formality: 0.35    # Casual, agile
warmth: 0.7        # Connessione umana
playfulness: 0.5   # Personalità
density: 0.4       # Essenziale
```

### Style Affinities

```yaml
high:
  - flat           # Veloce da implementare
  - bento          # Trendy, modulare
  - glassmorphism  # Moderno
medium:
  - material       # Se B2B
  - neumorphism    # Distintivo
  - claymorphism   # Se playful
low:
  - skeuomorphism  # Troppo effort
  - spatial        # Troppo complesso
forbidden:
  - brutalism      # Rischio confusione
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Dinamico
curves: organic    # Approachable
palette: warm      # Amichevole
density: sparse    # Focus sul messaggio
```

---

## Freelancer/Solopreneur

**Descrizione**: Una persona, personal brand

### Visual Weights

```yaml
trust: 0.5         # Personale > istituzionale
innovation: 0.7    # Distinguersi
formality: 0.25    # Molto casual
warmth: 0.85       # Massima umanità
playfulness: 0.6   # Personalità forte
density: 0.3       # Essenziale
```

### Style Affinities

```yaml
high:
  - flat           # Semplice, personale
  - bento          # Portfolio style
  - claymorphism   # Friendly
medium:
  - glassmorphism  # Moderno
  - neumorphism    # Soft touch
  - gen-z          # Se target giovane
low:
  - material       # Troppo corporate
  - spatial        # Overhead
forbidden:
  - brutalism      # Rischio (a meno che designer)
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Personalità
curves: organic    # Soft, umano
palette: warm      # Connessione
density: sparse    # Lascia respirare
```

---

## Scaleup

**Descrizione**: Crescita rapida, scaling

### Visual Weights

```yaml
trust: 0.75        # Costruendo credibilità
innovation: 0.65   # Ancora distintivo
formality: 0.5     # Transizione
warmth: 0.5        # Bilanciato
playfulness: 0.35  # Calibrato
density: 0.55      # In crescita
```

### Style Affinities

```yaml
high:
  - material       # Maturo
  - flat           # Scalabile
  - bento          # Dashboard
  - glassmorphism  # Premium feel
medium:
  - neumorphism    # Se già presente
  - spatial        # Dashboard avanzate
low:
  - claymorphism   # Troppo casual
  - skeuomorphism  # Non scala
forbidden:
  - y2k            # Non professionale
  - gen-z          # Non B2B
```

### Modifier Tendencies

```yaml
grid: swiss        # Scaling up
curves: geometric  # Maturing
palette: cold      # Professionalizzando
density: balanced  # Crescendo
```

---

## Selection Logic

```
Se il target è Enterprise/Mid-Market:
  → Privilegia trust e formality
  → Evita playfulness e warmth
  → Grid swiss, density alta

Se il target è Startup/Freelancer:
  → Privilegia warmth e innovation
  → Accetta playfulness
  → Grid asymmetric, density bassa

Se il target è SMB/Scaleup:
  → Bilancia tutti i pesi
  → Flessibilità negli stili
```

---

## Compatibility Notes

| Company Size | Formality Range | Risk Tolerance | Density Range |
|--------------|-----------------|----------------|---------------|
| Enterprise | 0.8-1.0 | Very Low | 0.6-0.8 |
| Mid-Market | 0.6-0.8 | Low | 0.5-0.7 |
| SMB | 0.4-0.6 | Medium | 0.4-0.6 |
| Startup | 0.2-0.5 | High | 0.3-0.5 |
| Freelancer | 0.1-0.4 | High | 0.2-0.4 |
| Scaleup | 0.4-0.6 | Medium | 0.4-0.6 |

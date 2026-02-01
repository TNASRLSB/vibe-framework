# Target Profiles: Role/Persona

Profili basati sul ruolo professionale dell'utente target.

---

## Developers

**Descrizione**: Engineers, DevOps, programmatori

### Visual Weights

```yaml
trust: 0.7         # Credibilità tecnica
innovation: 0.65   # Apprezzano novità
formality: 0.4     # Preferiscono casual
warmth: 0.3        # Funzionalità > feeling
playfulness: 0.4   # Easter eggs apprezzati
density: 0.8       # Vogliono TUTTE le info
```

### Style Affinities

```yaml
high:
  - flat           # Pulito, no distrazioni
  - material       # Familiare (Android Studio, etc)
  - bento          # Dashboard-friendly
medium:
  - brutalism      # Apprezzano la raw simplicity
  - glassmorphism  # Moderno
  - spatial        # Se per analytics
low:
  - claymorphism   # Troppo soft
  - neumorphism    # Non funzionale
forbidden:
  - y2k            # Distrazione
```

### Modifier Tendencies

```yaml
grid: swiss        # Ordine nel codice, ordine nell'UI
curves: geometric  # Sharp, precise
palette: mono      # Dark mode preferred
density: dense     # Informazioni tecniche
```

### Special Requirements

- Dark mode obbligatorio
- Monospace font per code
- Copy-to-clipboard ovunque
- Keyboard shortcuts

---

## Designers

**Descrizione**: UI/UX, Graphic, Product designers

### Visual Weights

```yaml
trust: 0.5         # Apprezzano il rischio
innovation: 0.85   # Massima apertura
formality: 0.3     # Preferiscono espressione
warmth: 0.6        # Estetica emotiva
playfulness: 0.7   # Creatività
density: 0.35      # Whitespace lovers
```

### Style Affinities

```yaml
high:
  - glassmorphism  # Trendy
  - bento          # Portfolio standard
  - spatial        # 3D, layers
  - claymorphism   # Playful
medium:
  - flat           # Se minimalista
  - neumorphism    # Se soft touch
  - brutalism      # Se provocatorio
  - gen-z          # Se target giovane
low:
  - material       # "Corporate"
  - skeuomorphism  # Datato
forbidden:
  - nessuno        # Giudicano caso per caso
```

### Modifier Tendencies

```yaml
grid: asymmetric   # Creatività
curves: art-nouveau # O organic
palette: jewel     # O neon per bold
density: sparse    # Respiro
```

---

## Marketers

**Descrizione**: Growth, Digital marketers, SEO

### Visual Weights

```yaml
trust: 0.65        # Credibilità dei dati
innovation: 0.55   # Trend-aware
formality: 0.45    # Dipende dal canale
warmth: 0.6        # Connessione emotiva
playfulness: 0.5   # Engagement
density: 0.55      # Metriche + storytelling
```

### Style Affinities

```yaml
high:
  - flat           # Conversioni testate
  - material       # Dashboard analytics
  - bento          # Report visivi
medium:
  - glassmorphism  # Hero sections
  - gen-z          # Social media
  - claymorphism   # Se brand playful
low:
  - brutalism      # Rischio conversioni
  - spatial        # Complessità
  - neumorphism    # Non converte meglio
forbidden:
  - y2k            # A meno che retrò marketing
```

### Modifier Tendencies

```yaml
grid: bento        # Metriche organizzate
curves: organic    # Soft CTA buttons
palette: warm      # Emotional triggers
density: balanced  # Not overwhelming
```

---

## Product Managers

**Descrizione**: PM, Product Owners

### Visual Weights

```yaml
trust: 0.7         # Stakeholder trust
innovation: 0.5    # Balanced
formality: 0.55    # Professionale ma non rigido
warmth: 0.45       # Funzionale
playfulness: 0.3   # Serio ma non noioso
density: 0.7       # Molte info, roadmaps
```

### Style Affinities

```yaml
high:
  - material       # Standard prodotto
  - flat           # Chiaro
  - bento          # Roadmap, features
medium:
  - glassmorphism  # Dashboards
  - spatial        # Se data-heavy
low:
  - claymorphism   # Troppo casual
  - gen-z          # Non per stakeholder
  - neumorphism    # Non aggiunge valore
forbidden:
  - brutalism      # Confonde
  - y2k            # Non serio
```

### Modifier Tendencies

```yaml
grid: swiss        # Organizzazione
curves: geometric  # Professionale
palette: cold      # Business
density: dense     # Tutti i dati
```

---

## Founders/CEOs

**Descrizione**: C-level executives

### Visual Weights

```yaml
trust: 0.85        # Massima credibilità
innovation: 0.6    # Vision forward
formality: 0.7     # Executive presence
warmth: 0.4        # Professionale
playfulness: 0.15  # Minima
density: 0.5       # Executive summary style
```

### Style Affinities

```yaml
high:
  - material       # Standard executive
  - flat           # Clean, premium
  - glassmorphism  # Modern executive
medium:
  - bento          # Se dashboard
  - spatial        # Se innovation focus
low:
  - neumorphism    # Non necessario
  - claymorphism   # Troppo casual
  - skeuomorphism  # Datato
forbidden:
  - brutalism      # Mai per executives
  - gen-z          # Mai
  - y2k            # Mai
```

### Modifier Tendencies

```yaml
grid: swiss        # Ordine
curves: geometric  # Sharp
palette: cold      # Professionale
density: balanced  # Executive summary
```

---

## Sales

**Descrizione**: BDR, Account Executives

### Visual Weights

```yaml
trust: 0.75        # Chiudere deal
innovation: 0.45   # Familiare vince
formality: 0.6     # Professionale
warmth: 0.65       # Relationship building
playfulness: 0.35  # Personalità calibrata
density: 0.5       # Quick wins visibili
```

### Style Affinities

```yaml
high:
  - material       # CRM familiare
  - flat           # Veloce da navigare
  - bento          # Pipeline view
medium:
  - glassmorphism  # Prezzi, proposals
low:
  - brutalism      # Spaventa clienti
  - spatial        # Complessità
  - neumorphism    # Non converte
forbidden:
  - y2k            # Non professionale
  - gen-z          # Non B2B
```

### Modifier Tendencies

```yaml
grid: bento        # Pipeline visualization
curves: organic    # Approachable
palette: warm      # Relationship
density: balanced  # Quick info access
```

---

## HR

**Descrizione**: Recruiter, HR Manager

### Visual Weights

```yaml
trust: 0.7         # Employer trust
innovation: 0.4    # Conservativo
formality: 0.6     # Professionale
warmth: 0.75       # People-centric
playfulness: 0.4   # Cultura aziendale
density: 0.45      # Non overwhelming
```

### Style Affinities

```yaml
high:
  - material       # Standard HR tools
  - flat           # Accessibile
  - claymorphism   # People-friendly
medium:
  - bento          # Dashboard HR
  - glassmorphism  # Careers page
low:
  - brutalism      # Allontana candidati
  - spatial        # Non necessario
  - neumorphism    # Indifferente
forbidden:
  - y2k            # Non serio
```

### Modifier Tendencies

```yaml
grid: bento        # People cards
curves: organic    # Human feel
palette: warm      # Welcoming
density: balanced  # Not intimidating
```

---

## Finance

**Descrizione**: CFO, Accountants

### Visual Weights

```yaml
trust: 0.95        # Massimo
innovation: 0.25   # Molto conservativo
formality: 0.9     # Altamente formale
warmth: 0.2        # Freddo, preciso
playfulness: 0.05  # Zero
density: 0.85      # Tutti i numeri
```

### Style Affinities

```yaml
high:
  - material       # Standard finanza
  - flat           # Chiaro, preciso
medium:
  - bento          # Dashboard finanziarie
low:
  - glassmorphism  # Poco serio
  - neumorphism    # Decorativo
  - spatial        # Distrazione
forbidden:
  - brutalism      # Mai
  - claymorphism   # Mai
  - gen-z          # Mai
  - y2k            # Mai
```

### Modifier Tendencies

```yaml
grid: swiss        # Rigore
curves: geometric  # Precisione
palette: cold      # Professionale
density: dense     # Tutti i dati
```

---

## Customer Support

**Descrizione**: CS, Success Manager

### Visual Weights

```yaml
trust: 0.7         # Affidabilità
innovation: 0.35   # Stabilità
formality: 0.45    # Amichevole ma pro
warmth: 0.8        # Massima empatia
playfulness: 0.45  # Approachable
density: 0.5       # Informazioni chiare
```

### Style Affinities

```yaml
high:
  - flat           # Chiaro, accessibile
  - material       # Familiare
  - claymorphism   # Friendly
medium:
  - bento          # FAQ, knowledge base
  - glassmorphism  # Chat interfaces
low:
  - brutalism      # Spaventa utenti
  - spatial        # Troppo complesso
  - neumorphism    # Indifferente
forbidden:
  - y2k            # Non serio per support
```

### Modifier Tendencies

```yaml
grid: bento        # FAQ organization
curves: organic    # Approachable
palette: warm      # Empatico
density: balanced  # Easy to scan
```

---

## Role Compatibility Matrix

| Role | Trust | Innovation | Formality | Warmth | Playfulness | Density |
|------|-------|------------|-----------|--------|-------------|---------|
| Developers | 0.7 | 0.65 | 0.4 | 0.3 | 0.4 | 0.8 |
| Designers | 0.5 | 0.85 | 0.3 | 0.6 | 0.7 | 0.35 |
| Marketers | 0.65 | 0.55 | 0.45 | 0.6 | 0.5 | 0.55 |
| Product Managers | 0.7 | 0.5 | 0.55 | 0.45 | 0.3 | 0.7 |
| Founders/CEOs | 0.85 | 0.6 | 0.7 | 0.4 | 0.15 | 0.5 |
| Sales | 0.75 | 0.45 | 0.6 | 0.65 | 0.35 | 0.5 |
| HR | 0.7 | 0.4 | 0.6 | 0.75 | 0.4 | 0.45 |
| Finance | 0.95 | 0.25 | 0.9 | 0.2 | 0.05 | 0.85 |
| Support | 0.7 | 0.35 | 0.45 | 0.8 | 0.45 | 0.5 |

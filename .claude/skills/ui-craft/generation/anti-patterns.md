# Anti-Patterns

Combinazioni che producono "AI slop" - output generico, riconoscibile come generato, privo di distintività.

---

## Visual Anti-Patterns

### The Dribbble Default
```
glassmorphism + purple-gradient + rounded-cards + centered-layout
```
**Why it's bad**: È il primo risultato di ogni AI. Ubiquo, indistinguibile, "visto mille volte".

**Escape**: Sostituisci almeno 2 elementi:
- Purple → qualsiasi altro colore
- Centered → asymmetric
- Rounded → geometric o angular

### The SaaS Starter
```
flat + blue-accent + inter-font + hero-features-testimonials-cta
```
**Why it's bad**: Template mentale di "startup website". Zero memorabilità.

**Escape**:
- Blue → warm o jewel palette
- Inter → qualsiasi altro font
- Structure → rompi la sequenza hero-features-testimonials

### The Dashboard Gray
```
material + gray-palette + card-grid + shadow-md + data-tables
```
**Why it's bad**: Ogni admin panel sembra così. Funzionale ma anonimo.

**Escape**:
- Gray → aggiungi UN colore accent forte
- Card-grid → prova bento o asymmetric
- Shadow-md → prova borders o neumorphism

### The Soft Nothing
```
neumorphism + low-contrast + no-hierarchy + monochrome
```
**Why it's bad**: Bello in screenshot, inutilizzabile in pratica. Accessibilità zero.

**Escape**:
- SEMPRE aumenta contrasto (min 4.5:1)
- SEMPRE aggiungi hierarchy (size, weight, color)

### The Friendly Blob
```
claymorphism + pastel-palette + rounded-everything + illustration-heavy
```
**Why it's bad**: "Friendly" è diventato cliché. Ogni app "human-centered" è così.

**Escape**:
- Pastel → prova jewel o earth
- Rounded → aggiungi ALCUNI angular elements
- Illustrations → usa foto o typography invece

---

## Structural Anti-Patterns

### The Landing Page Formula
```
Hero (centered, gradient bg)
  ↓
Logo bar (grayscale logos)
  ↓
3-column features (icon + title + text)
  ↓
Testimonial carousel
  ↓
Pricing table (3 tiers)
  ↓
FAQ accordion
  ↓
CTA banner
  ↓
Footer
```
**Why it's bad**: È il template. Ogni AI lo genera. Ogni competitor ce l'ha.

**Escape strategies**:
- Riordina le sezioni (testimonials PRIMA delle features)
- Elimina sezioni (no pricing on landing, link invece)
- Fusiona sezioni (features AS testimonials)
- Cambia formati (pricing come slider, non table)

### The E-commerce Clone
```
Sidebar filters + Product grid + Pagination
Product: Image + Title + Price + Rating + Add to cart
```
**Why it's bad**: È Amazon/Shopify. Funziona, ma non ti distingue.

**Escape**:
- Filters → prova top-bar o floating
- Grid → prova masonry o list toggle
- Pagination → infinite scroll o "load more"
- Product card → aggiungi UN elemento unico (quick view, video, AR)

### The Dashboard Sameness
```
Sidebar nav (icons + labels)
Top bar (search + notifications + avatar)
Main: Card grid with stats
```
**Why it's bad**: Ogni SaaS dashboard dal 2015.

**Escape**:
- Sidebar → prova top nav o command palette
- Stats cards → prova inline stats o sparklines
- Layout → prova bento o asymmetric zones

---

## Typography Anti-Patterns

### The Inter Epidemic
```
font-family: 'Inter', sans-serif;
```
**Why it's bad**: Default di Figma, default di ogni AI. Il "non-font".

**Alternatives by context**:
- Professional: Source Sans 3, IBM Plex Sans
- Friendly: DM Sans, Nunito
- Technical: JetBrains Mono, Fira Code
- Premium: Playfair Display, Libre Baskerville
- Modern: Space Grotesk, Bricolage Grotesque

### The No-Contrast Pairing
```
Poppins + Poppins
Inter + Inter
Roboto + Roboto
```
**Why it's bad**: Nessuna tensione tipografica. Tutto si appiattisce.

**Rule**: Display font ≠ Body font (quasi sempre)

### The Google Aesthetic
```
Roboto + Material Icons + MD3 Colors
```
**Why it's bad**: Sembra Google. Sembra ogni app Android. Non sei Google.

**Escape**: Se usi Material, personalizza ALMENO:
- Font
- Color palette
- Icon set

---

## Color Anti-Patterns

### The Trust Blue
```
primary: hsl(220, 70%, 50%)  /* "Trust blue" */
```
**Why it's bad**: Fintech, healthcare, enterprise - tutti usano questo blu. È invisibile.

**Escape**:
- Shift hue: 200 (teal) o 240 (indigo)
- Desaturate: 40% invece di 70%
- Warm it: aggiungi hint di viola

### The Gradient Cliché
```
background: linear-gradient(135deg, #667eea, #764ba2);
```
**Why it's bad**: IL gradient del 2019-2023. In ogni hero di ogni AI.

**Escape**:
- Angolo diverso (180deg, 45deg, radial)
- Colori diversi (NON blue-purple)
- Sottile invece che bold

### The Dark Mode Default
```
bg: #121212
surface: #1e1e1e
text: #ffffff
```
**Why it's bad**: Material Dark theme. Riconoscibile istantaneamente.

**Escape**:
- Warm dark: aggiungi hint di marrone/viola
- True black: #000000 per contrasto massimo
- Colored dark: bg con hint di brand color

---

## Interaction Anti-Patterns

### The Hover Lift
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```
**Why it's bad**: Ogni card dal 2018. Predicibile, noioso.

**Alternatives**:
- Scale instead: `transform: scale(1.02)`
- Border highlight: `border-color: var(--accent)`
- Background shift: subtle color change
- Content reveal: show hidden element

### The 300ms Everything
```css
transition: all 300ms ease;
```
**Why it's bad**: "all" è lazy. 300ms è il default mentale.

**Better**:
- Specifica proprietà: `transition: transform 200ms, opacity 150ms`
- Varia durata: micro (100ms), standard (200ms), dramatic (400ms)
- Custom easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## Detection Rules

Durante la generazione, check per questi pattern:

```python
def is_anti_pattern(output):
    checks = [
        # Visual
        has_purple_gradient and has_glassmorphism and is_centered,
        has_blue_accent and uses_inter and has_standard_landing_structure,
        has_gray_palette and has_card_grid and uses_material,

        # Structural
        follows_hero_features_testimonials_cta_sequence,
        has_sidebar_filters and has_product_grid and has_pagination,

        # Typography
        display_font == body_font,
        font in ['Inter', 'Roboto', 'Poppins'] and no_customization,

        # Color
        primary_hue in range(210, 230) and saturation > 60,
        has_blue_purple_gradient,

        # Interaction
        all_hovers_use_translateY,
        all_transitions_are_300ms,
    ]

    return any(checks)
```

---

## Escape Strategies

### The One-Element Break
Tieni tutto "safe" ma cambia UN elemento drasticamente.
- Safe layout + unusual font
- Safe colors + unusual interaction
- Safe structure + unusual imagery

### The Inversion
Prendi un anti-pattern e inverti UN aspetto.
- Purple gradient → Orange gradient (stesso stile, colore diverso)
- Centered → Right-aligned (stesso contenuto, posizione diversa)
- 3-column → 2-column asymmetric

### The Hybrid Violation
Usa Factor X per iniettare un elemento "sbagliato" che funziona.
- Serious fintech + ONE playful animation
- Minimal design + ONE maximal element
- Grid layout + ONE element che rompe la griglia

---

## When Anti-Patterns Are OK

### Deliberate Convention
Se l'utente CHIEDE esplicitamente:
> "Voglio una landing page come tutti gli altri nel mio settore"

Allora l'anti-pattern è intenzionale. Flag it, ma procedi.

### Accessibility Override
Se evitare l'anti-pattern compromette accessibilità:
> "Low contrast neumorphism" è anti-pattern, ma "high contrast neumorphism" potrebbe non essere visivamente neumorphism

In questo caso, accessibilità vince. Scegli stile diverso.

### Speed Over Distinctiveness
Se deadline è critica e cliente prioritizza "funziona" su "memorabile":

Procedi con anti-pattern, ma documenta:
```markdown
⚠️ Output uses conventional patterns for speed.
   Consider revisiting for distinctiveness post-launch.
```

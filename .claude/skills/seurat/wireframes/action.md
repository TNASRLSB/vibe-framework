# Wireframe: Action Page

Form, wizard, task completion. L'utente deve completare un'azione.

---

## Varianti

| Variante | Struttura | Quando usarla |
|----------|-----------|---------------|
| **centered-card** | Form centrato in card | Login, signup, form semplici |
| **wizard** | Multi-step con progress bar | Checkout, onboarding |
| **split-preview** | Form a sinistra, preview a destra | Editor, builder, form con riepilogo |

### Ideal Weights (per variant selection)

See [variant-selection.md](variant-selection.md) for algorithm.

```yaml
centered-card: { trust: 0.6, innovation: 0.4, formality: 0.6, warmth: 0.4, playfulness: 0.2, density: 0.4 }
wizard:        { trust: 0.6, innovation: 0.5, formality: 0.5, warmth: 0.5, playfulness: 0.3, density: 0.4 }
split-preview: { trust: 0.5, innovation: 0.6, formality: 0.4, warmth: 0.5, playfulness: 0.4, density: 0.4 }
```

---

## centered-card (default)

### Composizione

```
NAV (minimal o hidden)
CENTERED(sm → 480px)
  └── HERO(variant: minimal, height: 100vh)
        └── STACK(gap: space-5)
              ├── logo (opzionale)
              ├── heading ("Create your account")
              ├── helper text (opzionale)
              ├── STACK(gap: space-4) → form fields
              │     ├── input: name
              │     ├── input: email
              │     ├── input: password
              │     └── inline validation messages
              ├── primary button ("Create account")
              ├── divider ("or continue with")
              ├── GRID(columns: 2, gap: space-3) → OAuth buttons
              └── link ("Already have account? Log in")
```

### Blocks

| # | Block | Primitive | CSS chiave |
|---|-------|-----------|-----------|
| 1 | CARD | CENTERED(sm) | `background: surface; padding: space-6; border-radius: radius-lg; box-shadow: shadow-lg` |
| 2 | HEADING | STACK(gap: space-1) | `text-2xl; font-weight: 700; text-align: center` |
| 3 | FORM FIELDS | STACK(gap: space-4) | Ogni field: `STACK(gap: space-1)` con label + input |
| 4 | INPUT | — | `width: 100%; height: 44px; padding: space-3; border: 1px solid border; border-radius: radius-sm` |
| 5 | ERROR MESSAGE | — | `font-size: text-sm; color: error; margin-top: space-1` |
| 6 | PRIMARY BUTTON | — | `width: 100%; height: 48px; font-weight: 600` |
| 7 | DIVIDER | — | `display: flex; align-items: center; gap: space-3; color: text-muted` con linee |
| 8 | OAUTH BUTTONS | GRID(2) | `height: 44px; border: 1px solid border; gap: space-3` |

### Breakpoints

**Desktop (>768px):**
- Card: max-width 480px, centrata
- Padding interno: space-6

**Mobile (<768px):**
- Card: full-width, no shadow, no border-radius
- Padding: space-4
- Il form diventa l'intera pagina

### Slots

| Slot | Tipo | Default |
|------|------|---------|
| `HEADING.title` | testo | "Create your account" |
| `HEADING.subtitle` | testo | opzionale |
| `FIELDS[]` | input config | name, email, password |
| `FIELDS[].type` | input type | text, email, password |
| `FIELDS[].label` | testo | "Full name" |
| `FIELDS[].placeholder` | testo | "John Doe" |
| `FIELDS[].required` | boolean | true |
| `SUBMIT.text` | testo | "Create account" |
| `OAUTH.providers` | provider[] | Google, GitHub |
| `ALT_ACTION.text` | testo | "Already have account?" |
| `ALT_ACTION.link` | testo + url | "Log in" |

---

## wizard

### Composizione

```
NAV (minimal: logo + step count "Step 2 of 4")
CONTAINER(md → 800px)
  └── STACK(gap: space-6)
        ├── progress bar (step indicators)
        ├── STACK(gap: space-5) → step content
        │     ├── step heading
        │     ├── step description
        │     └── STACK(gap: space-4) → form fields per questo step
        └── SPLIT(ratio: 1:1) → navigation
              ├── left: back button (secondary)
              └── right: next/submit button (primary, align-right)
```

### Progress Bar
```css
.wizard-progress {
  display: flex;
  justify-content: space-between;
  position: relative;
}
.wizard-progress::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-border);
}
.wizard-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
}
.wizard-step.completed { background: var(--color-primary); color: var(--color-on-primary); }
.wizard-step.current { border: 2px solid var(--color-primary); background: var(--color-surface); }
.wizard-step.upcoming { background: var(--color-border); }
```

### Breakpoints

Mobile: progress bar diventa "Step 2 of 4" testo, label sotto step nascosti.

---

## split-preview

```
NAV
CONTAINER(xl → 1400px)
  └── SPLIT(ratio: 3:2, valign: start)
        ├── left: STACK(gap: space-5) → form
        │         ├── heading
        │         ├── form sections (collapsible)
        │         └── submit button
        └── right (sticky): STACK(gap: space-4) → preview/riepilogo
                             ├── preview card
                             ├── summary (line items)
                             └── total
```

Uso: checkout con order summary, editor con live preview.

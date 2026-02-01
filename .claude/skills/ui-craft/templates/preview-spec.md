# Design System Preview - Specification

Specifica per la generazione di pagine HTML statiche che visualizzano il design system prima dell'implementazione.

---

## Obiettivo

Permettere all'utente di **vedere e valutare** il design system generato in un browser, prima di procedere con l'implementazione nel progetto.

**Workflow:**
```
/ui-craft generate  → Scelta stile
/ui-craft establish → Creazione system.md
/ui-craft preview   → Generazione HTML preview ← NUOVO
                      ↓
                    Utente apre nel browser
                      ↓
                    Approva / Chiede modifiche
                      ↓
                    Implementazione nel progetto
```

---

## Output Structure

```
.ui-craft/preview/
├── index.html          # Dashboard principale design system
├── tokens.css          # CSS custom properties da system.md
├── preview.css         # Stili per la preview stessa
├── preview.js          # Interattività (theme toggle, copy, etc.)
├── pages/
│   ├── entry.html      # Esempio pagina Entry completa
│   ├── discovery.html  # Esempio pagina Discovery completa
│   ├── detail.html     # Esempio pagina Detail completa
│   ├── action.html     # Esempio pagina Action completa
│   ├── management.html # Esempio pagina Management completa
│   └── system.html     # Esempio pagina System completa
└── assets/
    └── icons.svg       # Icon sprite (opzionale)
```

---

## index.html - Design System Dashboard

Pagina principale che mostra tutti i token e componenti del design system.

### Struttura

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo/Title]                    [Theme Toggle] [View: Light/Dark]│
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                    │
│ Navigation  │  Content Area                                      │
│ (Sticky)    │                                                    │
│             │  ┌─────────────────────────────────────────────┐  │
│ • Overview  │  │ Section: Colors                              │  │
│ • Colors    │  │                                              │  │
│ • Typography│  │ [Color swatches with values]                │  │
│ • Spacing   │  │                                              │  │
│ • Shadows   │  └─────────────────────────────────────────────┘  │
│ • Motion    │                                                    │
│ ─────────── │  ┌─────────────────────────────────────────────┐  │
│ Components  │  │ Section: Typography                          │  │
│ • Buttons   │  │                                              │  │
│ • Inputs    │  │ [Font samples with scale]                   │  │
│ • Cards     │  │                                              │  │
│ • ...       │  └─────────────────────────────────────────────┘  │
│ ─────────── │                                                    │
│ Pages       │  ... (continues)                                   │
│ • Entry     │                                                    │
│ • Discovery │                                                    │
│ • ...       │                                                    │
│             │                                                    │
└─────────────┴───────────────────────────────────────────────────┘
```

### Sezioni

#### 1. Overview
- Nome del design system
- Stile selezionato (es. "Glassmorphism + Bento grid")
- Modifier applicati
- Data generazione

#### 2. Colors
Per ogni colore definito in system.md:
- Swatch visivo
- Nome variabile CSS (`--color-primary`)
- Valore HSL/RGB/HEX
- Contrast ratio con testo (se applicabile)
- Pulsante "Copy" per copiare il valore

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Primary Palette                                          │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌───────────┐ │
│ │         │ │ │         │ │ │         │ │ │           │ │
│ │ Primary │ │ │ Primary │ │ │ Primary │ │ │ Primary   │ │
│ │         │ │ │ Light   │ │ │ Dark    │ │ │ Contrast  │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └───────────┘ │
│ --color-    │ --color-    │ --color-    │ --color-      │
│ primary     │ primary-lt  │ primary-dk  │ primary-text  │
│ #3b82f6     │ #60a5fa     │ #2563eb     │ #ffffff       │
│ [Copy]      │ [Copy]      │ [Copy]      │ [Copy]        │
└─────────────┴─────────────┴─────────────┴───────────────┘

┌──────────────────────────────────────────────────────────┐
│ Semantic Colors                                          │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Success     │ Warning     │ Error       │ Info          │
│ #22c55e     │ #eab308     │ #ef4444     │ #3b82f6       │
└─────────────┴─────────────┴─────────────┴───────────────┘
```

#### 3. Typography
- Font families con esempio
- Scala tipografica (da text-xs a text-4xl)
- Font weights
- Line heights
- Esempio di heading + body text combinati

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Font Families                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Display: Playfair Display                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ The quick brown fox jumps over the lazy dog         │ │
│ │ ABCDEFGHIJKLMNOPQRSTUVWXYZ                          │ │
│ │ abcdefghijklmnopqrstuvwxyz                          │ │
│ │ 0123456789 !@#$%^&*()                               │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Body: Inter                                              │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ The quick brown fox jumps over the lazy dog         │ │
│ │ ...                                                  │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Type Scale                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ text-4xl (2.25rem)                                       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Display Heading                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ text-3xl (1.875rem)                                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Page Heading                                         │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ... (continues for all sizes)                            │
└──────────────────────────────────────────────────────────┘
```

#### 4. Spacing
- Scala spacing visualizzata con box
- Nomi variabili
- Valori in px/rem

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Spacing Scale                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ --space-1 (8px)   ██                                     │
│ --space-2 (16px)  ████                                   │
│ --space-3 (24px)  ██████                                 │
│ --space-4 (32px)  ████████                               │
│ --space-5 (48px)  ████████████                           │
│ --space-6 (64px)  ████████████████                       │
│ --space-7 (96px)  ████████████████████████               │
│ --space-8 (128px) ████████████████████████████████       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 5. Shadows & Depth
- Esempio visivo per ogni livello di shadow
- Codice CSS

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Elevation                                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐  │
│   │        │    │        │    │        │    │        │  │
│   │  None  │    │   SM   │    │   MD   │    │   LG   │  │
│   │        │    │        │    │        │    │        │  │
│   └────────┘    └────────┘    └────────┘    └────────┘  │
│                                                          │
│   --shadow-none  --shadow-sm  --shadow-md  --shadow-lg  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 6. Border Radius
- Esempi visivi
- Scala radius

#### 7. Motion / Animation
- Durations (fast, normal, slow)
- Easing curves con animazione demo
- Transizioni esempio

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Motion                                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Durations                                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Fast (150ms)   [████        ] ← Click to animate     │ │
│ │ Normal (300ms) [████████    ] ← Click to animate     │ │
│ │ Slow (500ms)   [████████████] ← Click to animate     │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Easing                                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ease-out    ●─────────────────────────────────────○  │ │
│ │ ease-in-out ●─────────────────────────────────────○  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### Components Section

Per ogni categoria di componenti, mostrare:

#### Buttons
```
┌──────────────────────────────────────────────────────────┐
│ Buttons                                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Variants                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Primary  │ │ Secondary│ │ Tertiary │ │ Danger   │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                          │
│ States                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Default  │ │ Hover    │ │ Active   │ │ Disabled │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                          │
│ Sizes                                                    │
│ ┌────────┐ ┌──────────┐ ┌────────────┐                  │
│ │ Small  │ │ Default  │ │   Large    │                  │
│ └────────┘ └──────────┘ └────────────┘                  │
│                                                          │
│ With Icons                                               │
│ ┌──────────────┐ ┌──────────────┐                       │
│ │ ← Icon Left  │ │ Icon Right → │                       │
│ └──────────────┘ └──────────────┘                       │
│                                                          │
│ Loading State                                            │
│ ┌──────────────┐                                        │
│ │ ◌ Loading... │                                        │
│ └──────────────┘                                        │
│                                                          │
│ Code                                                     │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ <button class="btn btn-primary">Primary</button>    │ │
│ │                                              [Copy]  │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

#### Form Inputs
- Text input (tutti gli stati: default, focus, error, success, disabled)
- Select/Dropdown
- Checkbox/Radio
- Toggle switch
- Textarea

#### Cards
- Content card
- Product card
- Interactive card (hover state)

#### Navigation
- Desktop nav
- Mobile nav (hamburger → overlay)

#### Feedback
- Alerts (info, success, warning, error)
- Toast notifications
- Modal/Dialog
- Loading states (spinner, skeleton)

#### Data Display
- Table (con header sortable, row selection)
- List variants
- Badges/Tags

---

### Pages Section

Link alle pagine esempio complete:

```
┌──────────────────────────────────────────────────────────┐
│ Example Pages                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ View complete page layouts using this design system.     │
│                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │             │ │             │ │             │         │
│ │   Entry     │ │  Discovery  │ │   Detail    │         │
│ │   Page      │ │   Page      │ │   Page      │         │
│ │             │ │             │ │             │         │
│ │ Landing,    │ │ Search,     │ │ Product,    │         │
│ │ Hero, CTA   │ │ Filters     │ │ Gallery     │         │
│ │             │ │             │ │             │         │
│ │   [View]    │ │   [View]    │ │   [View]    │         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │             │ │             │ │             │         │
│ │   Action    │ │ Management  │ │   System    │         │
│ │   Page      │ │   Page      │ │   Page      │         │
│ │             │ │             │ │             │         │
│ │ Forms,      │ │ Tables,     │ │ Errors,     │         │
│ │ Inputs      │ │ Admin       │ │ States      │         │
│ │             │ │             │ │             │         │
│ │   [View]    │ │   [View]    │ │   [View]    │         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Pagine Archetype (pages/*.html)

Ogni pagina archetype deve essere una **pagina completa funzionale**, non solo una lista di componenti.

### entry.html
Una landing page completa con:
- Nav
- Hero section
- Social proof
- Features grid
- CTA section
- Footer

### discovery.html
Una pagina di ricerca/listing con:
- Search bar
- Sidebar filters
- Product/content grid
- Pagination
- Empty state (nascosto, toggle per mostrare)

### detail.html
Una pagina prodotto/dettaglio con:
- Breadcrumbs
- Media gallery
- Product info
- Variant selectors
- Add to cart
- Tabs (description, specs, reviews)
- Related items

### action.html
Una pagina form con:
- Progress steps
- Form sections
- All input types
- Validation states
- Form actions
- OAuth alternatives

### management.html
Una pagina admin/dashboard con:
- Page header
- Toolbar con search e filters
- Data table con selection
- Bulk actions
- Pagination
- Status badges

### system.html
Pagine di sistema con:
- 404 error
- 500 error
- Maintenance
- Success state
- Empty state
- Alert banners
- Confirmation modal
- Loading states

---

## Funzionalità JavaScript (preview.js)

### Theme Toggle
```javascript
// Toggle light/dark mode
document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
  document.documentElement.setAttribute(
    'data-theme',
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  );
});
```

### Copy to Clipboard
```javascript
// Copy code snippets or values
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
});
```

### Smooth Scroll Navigation
```javascript
// Smooth scroll to sections
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
```

### Active Section Highlight
```javascript
// Highlight current section in nav
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      document.querySelector(`nav a[href="#${entry.target.id}"]`)?.classList.add('active');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
```

### Component State Toggles
```javascript
// Show different component states on hover/click
document.querySelectorAll('[data-show-state]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.classList.add(el.dataset.showState);
  });
  el.addEventListener('mouseleave', () => {
    el.classList.remove(el.dataset.showState);
  });
});
```

### Animation Demos
```javascript
// Trigger animation demos
document.querySelectorAll('[data-animate]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.animate);
    target.classList.remove('animate');
    void target.offsetWidth; // Trigger reflow
    target.classList.add('animate');
  });
});
```

---

## CSS Structure (preview.css)

Stili per la preview stessa, **separati** dai token del design system.

```css
/* Layout */
.preview-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* Sidebar Navigation */
.preview-nav {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 24px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.preview-nav a {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--color-text-muted);
  text-decoration: none;
}

.preview-nav a.active,
.preview-nav a:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

/* Content Area */
.preview-content {
  padding: 48px;
  max-width: 1200px;
}

/* Section */
.preview-section {
  margin-bottom: 64px;
}

.preview-section h2 {
  font-size: var(--text-2xl);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

/* Swatch Grid */
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.swatch {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.swatch-color {
  height: 80px;
}

.swatch-info {
  padding: 12px;
  font-size: var(--text-sm);
}

/* Code Block */
.code-block {
  position: relative;
  background: var(--color-surface);
  border-radius: 8px;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-x: auto;
}

.code-block .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Component Demo */
.component-demo {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .preview-layout {
    grid-template-columns: 1fr;
  }

  .preview-nav {
    position: relative;
    height: auto;
  }
}
```

---

## Generazione da system.md

Quando si esegue `/ui-craft preview`, Claude deve:

1. **Leggere `.ui-craft/system.md`**
2. **Estrarre tutti i token** (colors, typography, spacing, shadows, etc.)
3. **Generare `tokens.css`** con le CSS custom properties
4. **Generare `index.html`** popolato con i valori reali
5. **Generare le pagine archetype** con stili applicati
6. **Copiare `preview.css` e `preview.js`** (statici)

### Mapping system.md → HTML

| system.md Section | HTML Output |
|-------------------|-------------|
| `## Direction` | Overview section |
| `### Spacing` | Spacing scale visualization |
| `### Typography` | Font samples, type scale |
| `### Colors` | Color swatches with values |
| `### Shadows` | Elevation examples |
| `### Motion` | Animation demos |

---

## Comando Skill

Aggiungere a SKILL.md:

```markdown
### `/ui-craft preview`

Genera pagine HTML statiche per visualizzare il design system nel browser.

1. **Verifica prerequisiti:**
   - `.ui-craft/system.md` deve esistere
   - Se manca → suggerire `/ui-craft establish`

2. **Genera file:**
   - `.ui-craft/preview/index.html` - Dashboard design system
   - `.ui-craft/preview/tokens.css` - Token CSS da system.md
   - `.ui-craft/preview/preview.css` - Stili preview
   - `.ui-craft/preview/preview.js` - Interattività
   - `.ui-craft/preview/pages/*.html` - Pagine archetype

3. **Istruzioni all'utente:**
   - Aprire `.ui-craft/preview/index.html` nel browser
   - Oppure: `python -m http.server 8080 -d .ui-craft/preview`

**Output:** `.ui-craft/preview/` con tutti i file HTML/CSS/JS

**Usage:**
```
/ui-craft preview
```
```

---

## Differenze da test-pages.md

| Aspetto | test-pages.md (esistente) | preview (nuovo) |
|---------|---------------------------|-----------------|
| Scopo | Test singoli componenti | Preview completo sistema |
| Layout | Lista componenti | Dashboard navigabile |
| Navigazione | Link tra pagine | Sidebar sticky |
| Interattività | Nessuna | Theme toggle, copy, demos |
| Pagine archetype | Skeleton structure | Pagine complete funzionali |
| CSS | Solo tokens.css | tokens.css + preview.css |
| JS | Nessuno | preview.js |

---

## Note Implementative

1. **Non duplicare** - Usare i template esistenti in test-pages.md come base per i contenuti
2. **Separare stili** - tokens.css (generato) vs preview.css (statico)
3. **Self-contained** - Tutto deve funzionare aprendo direttamente l'HTML, senza server
4. **Font loading** - Includere link Google Fonts o font-face inline
5. **Print styles** - Opzionale, per esportare come PDF
6. **Accessibilità** - La preview stessa deve essere accessibile (nav keyboard, focus visible)

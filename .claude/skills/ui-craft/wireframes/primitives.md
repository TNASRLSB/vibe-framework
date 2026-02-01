# Layout Primitives

Blocchi base riusabili. Ogni wireframe e una composizione di questi primitivi.

---

## STACK

Flusso verticale di figli.

```css
display: flex;
flex-direction: column;
gap: var(--space-4); /* default, override con space-N */
```

**Parametri:**
- `gap`: spacing tra figli (default: `--space-4`)
- `align`: allineamento orizzontale — `stretch` (default), `center`, `start`, `end`

**Uso:** contenuto sequenziale, form fields, sezioni di pagina.

---

## GRID

Griglia multi-colonna.

```css
display: grid;
grid-template-columns: repeat(N, 1fr);
gap: var(--space-5); /* default */
```

**Parametri:**
- `columns`: numero colonne — 2, 3, 4
- `gap`: spacing (default: `--space-5`)
- `collapse`: breakpoint a cui diventa stack — `tablet` (1024px), `mobile` (768px)

**Responsive:**
```css
/* Desktop: N colonne */
grid-template-columns: repeat(N, 1fr);

/* Tablet: max 2 colonne */
@media (max-width: 1024px) {
  grid-template-columns: repeat(min(N, 2), 1fr);
}

/* Mobile: 1 colonna */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

**Uso:** feature cards, product grids, footer columns.

---

## SPLIT

Layout a due colonne uguali.

```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: var(--space-6);
align-items: center;
```

**Parametri:**
- `ratio`: proporzione colonne — `1:1` (default), `2:3`, `3:2`, `1:2`, `2:1`
- `gap`: spacing (default: `--space-6`)
- `valign`: allineamento verticale — `center` (default), `start`, `end`, `stretch`
- `reverse-mobile`: inverte ordine su mobile — `true`/`false`

**Responsive:**
```css
@media (max-width: 768px) {
  grid-template-columns: 1fr;
  /* Se reverse-mobile: primo figlio va sotto */
}
```

**Uso:** hero sections, feature highlights, media + testo.

---

## SIDEBAR

Layout main + sidebar.

```css
display: grid;
grid-template-columns: 280px 1fr;
gap: var(--space-5);
align-items: start;
```

**Parametri:**
- `side`: quale lato — `left` (default), `right`
- `width`: larghezza sidebar — `240px`, `280px` (default), `320px`
- `sticky`: sidebar sticky — `true`/`false`
- `collapse`: come collassa — `drawer` (slide), `top` (sopra il main), `hidden` (toggle)

**Responsive:**
```css
@media (max-width: 1024px) {
  grid-template-columns: 1fr;
  /* Sidebar diventa: top bar, drawer, o hidden toggle */
}
```

**Uso:** discovery pages (filtri), documentation, settings.

---

## CENTERED

Contenuto centrato orizzontalmente.

```css
max-width: var(--max-width, 1200px);
margin-inline: auto;
padding-inline: var(--space-4);
```

**Parametri:**
- `max-width`: larghezza massima — `600px` (narrow), `800px` (medium), `1200px` (default), `1400px` (wide)
- `text-align`: allineamento testo — `left` (default), `center`

**Uso:** wrapper per sezioni di contenuto, form centrati, CTA sections.

---

## HERO

Sezione di impatto a pieno viewport.

```css
min-height: var(--hero-height, 80vh);
display: grid;
place-items: center;
padding: var(--space-6);
```

**Varianti:**

### HERO:centered
```css
text-align: center;
max-width: 800px;
margin-inline: auto;
```

### HERO:split
```css
grid-template-columns: 1fr 1fr;
gap: var(--space-6);
align-items: center;
max-width: 1200px;
margin-inline: auto;

@media (max-width: 768px) {
  grid-template-columns: 1fr;
  text-align: center;
}
```

### HERO:video-bg
```css
position: relative;
/* Video/image come background con overlay */
```
```css
.hero-bg {
  position: absolute;
  inset: 0;
  object-fit: cover;
  z-index: -1;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7));
  z-index: -1;
}
```

### HERO:minimal
```css
min-height: 50vh;
text-align: center;
max-width: 600px;
margin-inline: auto;
/* Solo testo, nessun visual */
```

**Parametri:**
- `height`: altezza minima — `50vh`, `80vh` (default), `100vh`
- `variant`: layout interno — `centered`, `split`, `video-bg`, `minimal`
- `overlay`: overlay su background — `none`, `dark`, `gradient`

**Uso:** landing pages, entry pages, hero sections.

---

## CONTAINER

Wrapper con max-width. Non e un layout ma un vincolo dimensionale.

```css
width: 100%;
max-width: var(--container-width, 1200px);
margin-inline: auto;
padding-inline: var(--space-4);
```

**Parametri:**
- `width`: `sm` (640px), `md` (800px), `lg` (1200px, default), `xl` (1400px), `full` (100%)

**Uso:** avvolge sezioni per evitare che il contenuto si espanda troppo.

---

## Composizione

I primitivi si combinano. Esempio di una sezione features:

```
CONTAINER(lg)
  └── STACK(gap: space-2, align: center)
        ├── eyebrow text
        ├── heading
        ├── description
        └── GRID(columns: 3, gap: space-5, collapse: tablet)
              ├── feature-card-1
              ├── feature-card-2
              └── feature-card-3
```

Tradotto in CSS:
```css
.features {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}
.features-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  text-align: center;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  width: 100%;
}
@media (max-width: 1024px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .features-grid { grid-template-columns: 1fr; }
}
```

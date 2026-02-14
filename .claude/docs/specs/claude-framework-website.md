# Claude Framework Website

## Cosa sto costruendo

Un sito web promozionale per il Claude Development Framework, completo di design system, copy ottimizzato e video promozionale. Tutto nella cartella `TEST/`.

## Deliverables

### 1. Design System + Sito (Seurat)
- `/seurat setup` → genera design system nella cartella TEST
- Stile: moderno, professionale, tech-forward (safe mode)
- Pagine:
  - **Homepage (Entry)** — Hero + value proposition + feature overview + CTA
  - Tutto in un singolo file HTML self-contained

### 2. Copy (Ghostwriter)
- Testi per la homepage ottimizzati SEO + GEO
- Headline, subheadline, feature descriptions, CTA
- Tone: autorevole ma accessibile, tecnico ma non intimidatorio
- Lingua: **inglese** (audience internazionale)

### 3. Video Promozionale (Orson)
- Video 30-60 secondi
- Mostra le skill del framework (seurat, emmet, heimdall, ghostwriter, baptist, orson, scribe, forge)
- Stile: clean, motion graphics
- Output: `TEST/video/promo.mp4`

## File che creerò

```
TEST/
├── index.html          # Homepage con design system inline
├── .seurat/
│   ├── tokens.css      # Design tokens
│   └── style.css       # Styles
└── video/
    ├── promo.html      # Webvideo source
    └── promo.mp4       # Video renderizzato
```

## Ordine di esecuzione

1. **Seurat** → Design system (tokens + style)
2. **Ghostwriter** → Copy per homepage
3. **Seurat** → Build homepage con copy
4. **Ghostwriter** → Copy per video
5. **Orson** → Crea e renderizza video promozionale

## Come verifico che funziona

- `index.html` si apre nel browser e mostra il sito completo
- Il design è coerente (tokens applicati)
- I testi sono persuasivi e ottimizzati
- Il video si riproduce correttamente

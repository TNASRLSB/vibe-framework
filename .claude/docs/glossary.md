# Glossary

Definizioni dei termini usati nel progetto. Questo file è la fonte di verità per la nomenclatura.

---

## Prodotti / Output

| Termine | Definizione |
|---------|------------|
| **website** | Sito internet completo generato da ui-craft (HTML + CSS + assets). Il prodotto finale per il web. |
| **webvideo** | Pagina .html generata da video-craft, destinata a diventare video. Non è un sito — è un file self-contained con scene animate, che il capture engine trasforma in .mp4. |

## Design System

| Termine | Definizione |
|---------|------------|
| **design system** | L'intera identità visiva di un progetto: `tokens.css` + `style.css`. Entrambi vivono in `.ui-craft/` o nella cartella assets del website. |
| **tokens** (`tokens.css`) | Variabili CSS primitive: colori, font, spacing, motion, radius, border. I valori grezzi, senza contesto d'uso. |
| **styles** (`style.css`) | Regole CSS che applicano i token ai componenti: nav, hero, cards, buttons, layout grid, responsive. L'identità visiva concreta. |
| **design-system.html** | Preview vivente del design system. Importa tokens.css e mostra tutti gli elementi visivamente. |

## Architettura

| Termine | Definizione |
|---------|------------|
| **archetype** (ui-craft) | Tipo di pagina web: Entry, Discovery, Detail, Action, Management, System. Ogni archetype ha wireframe e layout predefiniti. |
| **scene-type** (video-craft) | Tipo di scena nel webvideo: stat-callout, feature-showcase, cta-outro, ecc. Definisce layout, densità, background e animazioni della scena. (Precedentemente chiamato "archetype" in video-craft — rinominato per evitare ambiguità.) |

## Modalità

| Termine | Definizione |
|---------|------------|
| **mode** | Direzione creativa che Claude segue nella generazione. Condiviso tra ui-craft e video-craft. |
| **safe** | Pulito, corporate, professionale. Basso rischio. |
| **chaos** | Dinamico, sperimentale, scelte random. Alto rischio. |
| **hybrid** | Base safe con un elemento sorpresa per scena/pagina. Rischio medio. |
| **cocomelon** | Hyper-engaging, neuro-ottimizzato. Arco di arousal (arrest→escalate→climax→descend→convert). Solo video-craft. |

## Pipeline Video

| Termine | Definizione |
|---------|------------|
| **capture engine** | Il componente che trasforma il webvideo (.html) in video (.mp4). Non va confuso con la generazione del webvideo. |
| **narrative pattern** | Sequenza predefinita di scene-type che struttura il webvideo (es. problem-solution, hook-parade, neuro-hijack). |
| **scene-type** | Vedi sezione Architettura sopra. |

---

*Quando aggiungo un nuovo termine o ne cambio il significato, aggiorno questo file.*

## Director Recipes

The director assigns animations intelligently based on scene content. 13 specialized recipes analyze content signals (word count, metrics, position, cards) and apply appropriate animation strategies.

### Recipe Reference

| Recipe | Triggers | Animation Strategy |
|--------|----------|-------------------|
| `hero-impact` | Opener + 1-3 word title | `slam`/`stamp` on heading, 2xl size, 400ms |
| `metric-reveal` | Heading contains % or numbers | `scale-word` on heading, 2xl size, 500ms |
| `text-kinetic` | 4-8 word title + non-safe mode | `kinetic-push`/`word-by-word`/`text-reveal-mask` |
| `card-burst` | 3+ cards in scene | `spring-scale`/`spring-up`/`bounce-in` on cards |
| `closer-dramatic` | CTA + final scene | `zoom-in`/`scale-word`/`blur-in`, xl size |
| `opener-long-title` | Opener + 4+ word title | `clip-reveal-up`/`text-reveal-mask`/`typewriter` |
| `proof-authority` | `social-proof` scene type | `fade-in`/`soft-reveal`/`letter-spacing-in` |
| `mid-section-variety` | Mid scene, text-heavy, no cards | Alternating reveal styles based on position |
| `fullscreen-slam` | Opener + 1-2 words + non-safe | Forces `fullscreen-text` layout, `slam`/`stamp`/`scale-word` |
| `marquee-ticker` | `integration-hub`/`sequential-product-parade` + 4+ items | `marquee` animation, 8s duration |
| `letter-cascade` | Non-opener + 1-3 words + chaos/cocomelon | `char-stagger`, xl size, 1200ms |
| `multi-phase-reveal` | `stat-callout`/`data-visualization` + metric | Two-phase: label first, then metric dramatically |
| `dramatic-pause` | Mid scene + 3-7 words + non-safe | 2200ms delay on non-heading elements |

### Mode-Specific Pools

The director uses animation pools filtered by mode:

| Mode | Safe Entrances | Aggressive Entrances |
|------|----------------|---------------------|
| **safe** | `fade-in`, `fade-in-up`, `soft-reveal`, `slide-*`, `clip-reveal-*` | — |
| **hybrid** | All safe + 1 surprise per scene from: `bounce-in`, `spring-scale`, `zoom-in` | — |
| **chaos** | All animations including `slam`, `stamp`, `glitch-in`, `pop-in`, `skew-in` | Full pool |
| **cocomelon** | Neuro-optimized: `scale-word`, `char-stagger`, `kinetic-push`, `word-by-word` | High-impact |

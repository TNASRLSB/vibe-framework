# GitHub Pages Site

## Cosa
Sito statico per il repository CLAUDE_SKILLS via GitHub Pages. Design generato con ui-craft (chaos mode). Video promozionale generato con video-craft (cocomelon mode) embedded nella pagina.

## Piano

### Fase 1: Design System (ui-craft chaos)
1. `/ui-craft generate` in modalità chaos — genera stile visivo
2. `/ui-craft establish` — crea tokens.css + design-system.html

### Fase 2: Video (video-craft cocomelon)
1. `/video-craft create` in modalità cocomelon — video promozionale del framework
2. Renderizza il video in MP4
3. Embed nella pagina

### Fase 3: Sito
1. Crea `docs/index.html` usando il design system generato
2. Contenuto basato su `.claude/README.md`
3. Video embedded (hero o sezione dedicata)
4. Responsive, zero dipendenze esterne

### Fase 4: Config
- GitHub Pages servirà dalla cartella `docs/`, branch `main`

## File
- `.ui-craft/tokens.css` — Design tokens (generato)
- `.ui-craft/design-system.html` — Preview (generato)
- `docs/index.html` — Il sito
- `docs/video/` — Video MP4 generato

## Verifica
- Aprire `docs/index.html` nel browser
- Video si riproduce
- Design coerente con tokens
- Responsive

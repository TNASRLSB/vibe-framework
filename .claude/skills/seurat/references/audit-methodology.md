# Audit Methodology

Detailed methodology for `/seurat audit`. See [../SKILL.md](../SKILL.md) for command overview.

---

## Fase 0: Prerequisiti

| Prerequisito | Obbligatorio | Se manca |
|---|---|---|
| `/emmet map` (page/route map) | Sì | Proporre: "Serve la mappa delle pagine. Eseguo `/emmet map`?" |
| `.seurat/tokens.css` | No | Aree che richiedono confronto con token (Layout & Spacing, Color System) segnalano "no design system definito — impossibile verificare compliance" |
| Dev server attivo | Sì (per screenshot) | Controllare se c'è un server attivo. Se no, avviarlo. Se impossibile, skip screenshot e segnalare nelle limitazioni |

---

## Fase 1: Raccolta dati

| Fonte | Cosa | Come |
|---|---|---|
| Codice sorgente | Token vs hardcoded values, spacing, padding, gap, colori, font | Grep + lettura file CSS/SCSS/TSX |
| Screenshot Playwright | Rendering reale a 3 viewport | Desktop 1440x900 (light + dark), Mobile 390x844, Zoom sezioni critiche |
| Audit automatico | Contrasto WCAG, touch target, aria attributes | Lighthouse / axe-core se disponibili |

**Screenshot:**
- Salvati in `.seurat/screenshots/`
- Naming: `[##]-[page-name]-[viewport]-[theme].png` (es. `01-home-desktop-light.png`)
- Zoom sezioni: `zoom-[page]-[section].png`
- Lista pagine: da `/emmet map`

---

## Fase 2: Aree di analisi

**Audit completo** (`/seurat audit`) — tutte le aree:

| # | Area | Cosa verifica | Condizionale |
|---|---|---|---|
| 1 | Visual Design & Brand | Identità coerente, no AI slop, Mandate tests (Swap, Squint, Signature, Token) | Sempre |
| 2 | Layout & Spacing | Spacing scale, card padding, grid gap, allineamento, vertical rhythm | Sempre |
| 3 | Typography | Gerarchia, scale coerente, regole serif/sans | Sempre |
| 4 | Color System | Palette coerente, contrasto WCAG >= 4.5:1, color-only indicators | Sempre |
| 5 | Responsive/Mobile | Padding orizzontale, layout collapse, pagine non infinite | Sempre |
| 6 | Accessibility | Skip-to-content, aria-invalid/errormessage, aria-label, focus ring, keyboard, tab order, focus trap, Escape key | Sempre |
| 7 | Forms & Interaction | Campi obbligatori, validazione real-time, feedback errori/successo/loading, stati vuoti/errore | Sempre |
| 8 | Navigation & IA | Link coerenti, naming URL-consistent, sticky sidebar | Sempre |
| 9 | Data Visualization | Palette chart unificata, aria-label, data table fallback | Solo se chart presenti |
| 10 | Dark Mode | Contrasto bordi, warm tones, accents leggibili, no neon | Solo se dark mode presente |
| 11 | Flussi interattivi | Submit form, loading states, modali, toast, wizard, skeleton loading | Sempre |
| 12 | Internazionalizzazione | RTL layout, lingue lunghe (overflow/troncamento) | Solo se i18n supportato |
| 13 | Performance percepita | LCP, CLS, pagine lunghe, lazy loading | Sempre |

**Audit singolo file** (`/seurat audit [file]`) — scope ridotto, solo aree 1-7 + 9-11 se applicabili. Escluse: Navigation & IA, Internazionalizzazione, Performance percepita.

---

## Fase 3: Output

Report in `.seurat/audit-report.md` (completo) o `.seurat/audit-[filename].md` (singolo file):

1. **Executive Summary** — Voto per area (1-10), valutazione complessiva
2. **CRITICAL** — Problemi ad alto impatto (bloccano UX)
3. **HIGH** — Problemi significativi
4. **MEDIUM** — Miglioramenti importanti
5. **LOW** — Polish e refinement
6. **Spacing granulare** — Tabelle comparative codice vs design system
7. **Accessibility findings** — Sezione dedicata
8. **Dark mode findings** — Sezione dedicata (se applicabile)
9. **Raccomandazioni prioritizzate** — Organizzate in sprint
10. **Limitazioni** — Cosa NON è stato verificato e perché
11. **Prossimi passi** — Spec per i fix → implementazione via `/seurat migrate` o fix manuali

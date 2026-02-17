# Spec: Orson Video-Scale Enforcement

**What:** Aggiungere vincoli obbligatori alla skill Orson per garantire che l'output HTML sia progettato per la visione video (non web).

**Problem:** L'output attuale usa dimensioni web (label 11-14px, body 17-20px, card 320-340px) che risultano illeggibili in un video. Mancano vincoli su contrasto, varietà visiva e differenziazione tra scene.

---

## File da modificare

### 1. `references/html-contract.md` — Aggiungere sezione "Video Scale Requirements"

Dopo "Format-Specific CSS", aggiungere:

**Minimum Typography (MANDATORY)**
Tabella con dimensioni minime per formato, enforcement esplicito ("below these = rendering bug"):
- 16:9 → headline 64px+, body 28px+, label 20px+, caption 18px+
- 9:16 → headline 72px+, body 32px+, label 24px+, caption 20px+
- 1:1 → headline 56px+, body 26px+, label 18px+, caption 16px+

**Minimum Component Sizing (MANDATORY)**
- Card min-width: 40% del viewport (es. 768px su 1920px)
- Tag/badge min font-size: 18px, min padding: 12px 28px
- Progress bar min height: 12px

**Contrast Floor (MANDATORY)**
- Qualsiasi testo visibile: minimo 4.5:1 su sfondo
- Regola pratica: su bg #0A0A0A, il colore testo più chiaro ammesso è #787878 → arrotondare a #808080 minimum
- Label/dim text: #999999 minimum su sfondi scuri

### 2. `references/components.md` — Aggiornare dimensioni componenti

- Feature card `.feature-title`: 22px → **28px**
- Feature card `.feature-desc`: 17px → **24px**
- Code block: 17px → **22px**
- Terminal body: 15px → **20px**
- Compare label: 14px → **20px**
- Bar label: 14px → **20px**
- Badge: 14px → **18px**
- Phone frame width: 320px → **400px** (con nota per split layout)
- Aggiungere nota in cima: "All sizes are VIDEO-SCALE minimums — NOT web sizes. These must be legible at typical viewing distances (mobile in hand, desktop monitor, TV across room)."

### 3. `references/visual-recipes.md` — Da opzionale a obbligatorio

**Color arc:** Aggiungere dopo "### Usage":
> **REQUIRED.** Every video with 4+ scenes MUST apply a color arc. The background, accent, or text must shift perceptibly at least twice across the video. "Imperceptible" shifts (e.g., #0A0A0A → #0C0B0A) do NOT count.

**Scene visual variety:** Aggiungere nuova sezione "### Scene Visual Variety (MANDATORY)" dopo Negative Space Intelligence:
> In a video with 5+ scenes:
> - Maximum 3 consecutive text-only scenes allowed
> - At least 1 scene must contain a non-text visual element (mockup, card, data viz, chart, comparison, progress bar, or decorative component from components.md)
> - Split layouts and centered layouts must alternate — never use the same layout type for 3+ consecutive scenes

**Decoratives:** Aggiungere regola globale prima delle per-recipe recommendations:
> Recipes that specify "None" for decoratives MAY use zero decoratives. All other recipes MUST include at least one ambient decorative element (orb, grid, gradient, grain, pattern) in at least 2 scenes.

### 4. `SKILL.md` — Aggiungere Step 3.1b: Scale Validation

Dopo Step 3.1 ("Write the HTML") e prima di Step 3.2 ("Preview & Verify"), aggiungere:

```
#### Step 3.1b: Scale Validation (mandatory)

Before previewing, self-check the HTML against these hard rules:

1. **Typography** — No text element below the format's minimum sizes (see html-contract.md "Video Scale Requirements"). If any label, body, or caption is below minimum, increase it NOW.

2. **Contrast** — No text color with contrast ratio < 4.5:1 against its background. Quick check: on dark backgrounds (#000-#1a1a1a), the dimmest allowed text is ~#808080. If using dimmer colors for "elegance", bump them up.

3. **Component sizing** — Cards, tags, and badges must meet minimum widths (see html-contract.md). A card at 320px on a 1920px viewport is a web component, not a video component.

4. **Visual variety** — Count text-only scenes. If more than 3 consecutive, add a visual element to at least one. Check that layout types (centered vs split vs grid) alternate.

5. **Color arc** — Verify the chosen arc produces visible color shifts. Open two scenes side-by-side mentally — can you tell the backgrounds apart? If not, increase the shift.

If ANY rule fails, fix it before proceeding to preview.
```

---

## File che NON modifico

- `engine/` — Nessuna modifica al runtime
- `SKILL.md` Phase 1-2 — Nessuna modifica alla pre-production
- Le 24 visual recipes individuali — Non modifico le recipe stesse

## Come verifico

Dopo le modifiche, rileggo tutti e 4 i file per confermare coerenza. Le nuove regole devono essere referenziate da almeno 2 punti (html-contract come fonte di verità, SKILL.md come enforcement nel workflow).

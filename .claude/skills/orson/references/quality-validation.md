# Quality Validation Checklist (MANDATORY)

Before previewing, self-check the HTML against ALL of these rules. This is a checklist, not a suggestion.

## A. SPATIAL FILL (see `visual-recipes.md` → "Spatial Presence")

1. **Headline width** — Is every headline ≥60% of viewport width? (≥1152px on 16:9). If not, increase `font-size` or `max-width`.
2. **Vertical spread** — In centered layouts, does the content block (all elements + gaps) span ≥40% of viewport height (≥432px on 1080)? If it's a tiny island in the center, increase font sizes and gaps.
3. **Split layout balance** — In split layouts, does content extend from ≤25% to ≥75% of viewport height? No half-empty sides.
4. **Body text width** — Are body text containers ≥500px wide on 16:9?
5. **Gap sizing** — Are gaps between elements ≥32px? Between sections ≥48px? Gaps of 16-24px are web-scale bugs in video.

## B. TYPOGRAPHY (see `html-contract.md` → "Video Scale Requirements")

6. **Hero headline** — ≥80px on 16:9, ≥96px on 9:16, ≥72px on 1:1.
7. **Body text** — ≥28px on 16:9.
8. **Stat values** — ≥96px on 16:9.
9. **Contrast** — No text with contrast < 4.5:1. On dark BG (#000–#1a1a1a), dimmest text is #808080.

## C. COMPONENT SIZING

10. **Cards** — min-width ≥40% of viewport (≥768px on 1920).
11. **CTA button** — font-size ≥24px, padding ≥20px 56px.
12. **Icons** — ≥48px.

## D. ANIMATION DIVERSITY (see `visual-recipes.md` → "Animation Diversity")

13. **Entrance variety** — Count distinct entrance animation types across the entire video. Minimum: **5 different types from at least 3 different categories**. Categories: fade-family (fade-in-*), slide-family (slide-*), clip-family (clip-reveal-*), spring-family (spring-*, SP()), bounce-family (bounce-in-*), kinetic (word-by-word, char-stagger, impact-word), statement (slam, stamp, drop, kinetic-push), special (blur-in, zoom-in, elastic-in). If all 5 are from the same category (e.g. all fade variants), that's NOT variety — ADD from other categories.
14. **No consecutive duplicates** — In each scene, no two consecutive elements may use the same entrance animation.
15. **Hero/CTA statement entrance** — Scene 0 headline and final CTA must use a "statement" animation (`slam`, `stamp`, `scale-word`, `impact-word`, `drop`, `kinetic-push`, or `SP()` with scale 3→1), NOT `fade-in-up`.
16. **Transition variety** — Count distinct scene transitions. Minimum: **3 different types** in a 6+ scene video. Not all crossfade.
17. **Camera variety** — Count distinct camera motions. Minimum: **2 different types**. At least 3 scenes must have camera animation.
18. **Kinetic typography** — At least **2 scenes** use kinetic text (word-by-word, char-stagger, impact-word, typewriter).
19. **Easing variety** — Are you using at least 3 different easings? Mix: `outCubic`, `outBack`, `outExpo`, `outElastic`, `outBounce`.
20. **Exit animations** — In at least half the scenes, the main content element has an explicit exit animation (not just scene crossfade).

## D2. v6 FUNCTION USAGE (MANDATORY — prevents A()-only monotony)

21. **SP() usage** — At least **1 element** must use `SP()` spring physics instead of A() with outBack/outElastic. Best candidates: hero headline slam, CTA button pop, icon bounce-in, card drop. Count your SP() calls — if zero, add one.
22. **N() usage** — At least **1 decorative element or camera** must use `N()` noise. Best candidates: background orb drift (x+y), camera shake on hero/impact scene, floating badge/pill. Count your N() calls — if zero, add one.
23. **D() usage** — At least **1 SVG element** must use `D()` path draw. Best candidates: underline under heading, connector between features, circle outline, logo draw-on. If the video has no SVG elements, add a curved underline SVG under the hero or CTA headline.
24. **P() or N()-decorative** — At least **1 scene** must have ambient organic motion: either P() particles or N() on decorative elements (orbs, blobs). Static backgrounds with no ambient motion = slideshow.
25. **CSS ambient motion** — At least **2 decorative elements** must have CSS ambient animation (float, pulse-glow, breathe, grid-fade). Static decoratives with no ambient motion = flat. The runtime syncs CSS animations to frame capture automatically.
26. **Shimmer/shine** — At least **1 CTA button or premium card** should have a `amb-shine` or `amb-shimmer` effect for premium feel.

## E. VISUAL VARIETY

27. **Layout alternation** — No more than 2 consecutive scenes with the same layout type (centered/centered/centered = bug).
28. **Text-only limit** — Max 3 consecutive text-only scenes. At least 1 scene must have a non-text visual.
29. **Color arc** — Can you visually tell scenes apart by color? If the shift is imperceptible, increase it.

**If ANY check fails, fix it BEFORE proceeding to preview.**

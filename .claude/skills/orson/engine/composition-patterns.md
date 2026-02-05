# Composition Patterns Reference

Knowledge extracted from real SaaS/product videos. Used by orson when building scene configs to select appropriate layouts, transitions, and element arrangements based on narrative intent.

---

## Scene Types

Each scene type describes a **narrative purpose** and its typical composition. When building a video config, match each scene's intent to a scene type.

### 1. STAT-CALLOUT

**Purpose:** Present a single striking number to anchor an argument.

**Layout:** `centered`
**Density:** Low (2-3 elements)
**Elements:**
- Large number (heading xl/2xl) — center
- Label below the number (text, smaller weight)
- Optional: progress ring or bar as visual container for the number

**Background:** Dark, minimal. Optional colored ambient glow (low opacity, corners or center).

**Examples:**
- "81% Companies" with progress ring (V1-S2)
- "67% Professionals" with surrounding portraits (V1-S4)

**Transition out:** `cut` (urgency) or `crossfade` (gravity)

---

### 2. PROBLEM-STATEMENT

**Purpose:** Establish pain, frustration, or a challenge the audience faces.

**Layout:** `split` (portrait left + text right) or `centered` (text only)
**Density:** Low-Medium (2-4 elements)
**Elements:**
- Image or icon representing the problem (left or background)
- Bold headline stating the problem (heading lg)
- Supporting quote or detail (text, lighter weight)
- Optional: small label/tag for context

**Background:** Dark, sparse. Minimal color — problems feel heavy.

**Examples:**
- Frustrated leader portrait + "Struggle with Sales Productivity" (V1-S3)
- "IT IS ALL ABOUT YOUR TIME TO MAKE IMPACT" rapid text (V7-S1/S2)

**Transition out:** `cut` (keeps tension)

---

### 3. PRODUCT-INTRO

**Purpose:** Reveal the product/brand name with impact.

**Layout:** `centered` vertical stack
**Density:** Very low (2-3 elements)
**Elements:**
- Product name (heading xl/2xl, bold) — center
- Tagline or value prop words appearing sequentially below
- Logo at bottom center (small, after main text)

**Background:** Dark with subtle colored ambient glows (brand colors, low opacity). This is where brand palette gets introduced.

**Sequencing:** Tagline words stagger in one-by-one (0.3-0.5s intervals).

**Examples:**
- "Elevate" + "See. Coach. Grow." + Membrain logo (V1-S6)
- "teamble ai" + "The People Success Platform" (V2-S1)
- "FOSFOR" + "+" + "snowflake" partnership reveal (V6-S2)

**Transition out:** `fade` (gravity) or `zoom-in` (energy)

---

### 4. FEATURE-SHOWCASE

**Purpose:** Show the product interface or a specific feature in action.

**Layout:** `centered` or `stacked` — single large visual element
**Density:** Medium-High (UI mockup with overlaid labels)
**Elements:**
- Dashboard/interface mockup (image or card-group)
- Highlight labels or callout cards overlaid
- Optional: cursor interaction animation

**Background:** Dark theme (matches typical SaaS dark-mode UIs) or brand color.

**Duration:** Longest scenes — typically 10-30s. Break into sub-scenes for different features.

**Examples:**
- Elevate dashboard panels, skill summaries, radar charts (V1-S7)
- 1-on-1 prep dashboard with progress bars (V2-S3)
- Viable dashboard with sidebar + area chart (V5-S4)

**Transition out:** `crossfade` or `zoom` between sub-features

---

### 5. BEFORE-AFTER

**Purpose:** Show transformation — bad state vs. improved state.

**Layout:** `split` (side-by-side) or sequential (same position, content swaps)
**Density:** Medium (4-6 elements across both states)
**Elements:**
- "Before" state: muted colors, low score, negative indicator (red)
- "After" state: vibrant colors, high score, positive indicator (green)
- Score/metric that visibly changes (e.g., 10/100 → 92/100)
- Optional: category breakdown showing improvement areas

**Background:** Transitions from muted/dark to brighter/warmer as improvement happens.

**Examples:**
- Feedback score 10/100 (red) → 92/100 (green) with AI enhancement (V2-S4/S5)

**Transition out:** `crossfade` (smooth evolution) or `wipe` (clean break)

---

### 6. INTEGRATION-HUB

**Purpose:** Show ecosystem breadth — many partners, sources, or connections.

**Layout:** `card-grid` or floating grid
**Density:** High (8-16 icons)
**Elements:**
- Grid of logos/icons (3x4, 4x4)
- Optional: subtle drift/float animation on icons
- Optional: connecting lines between icons

**Background:** Brand color (bold) or dark with accent glow.

**Examples:**
- 12 app logos (Gong, Zapier, Zendesk...) floating in 3D space (V5-S5)

**Transition out:** `cut` (back to main UI) or `zoom-out`

---

### 7. SOCIAL-PROOF / HUMAN-ELEMENT

**Purpose:** Emphasize people, team, or community behind the data.

**Layout:** `centered` with floating elements around
**Density:** Medium-High (many small portraits + central text)
**Elements:**
- Circular portrait photos — floating, drifting, or arranged in a ring
- Central message text (heading lg)
- Optional: colored ring outlines on portraits (brand accent)
- Optional: highlighted word in the message (different color)

**Background:** Dark with soft colored glows. Warm, personal feel.

**Examples:**
- "Growth begins with your People" + floating portraits (V1-S8)
- Circular portraits forming a network around 67% ring (V1-S4)
- Capability circles merging + woman interacting with data (V5-S8)

**Transition out:** `fade` (closing warmth)

---

### 8. CTA / OUTRO

**Purpose:** Close the video with brand + action.

**Layout:** `centered` vertical stack
**Density:** Very low (2-3 elements)
**Elements:**
- Logo (centered, medium size)
- Tagline or slogan (text, lighter weight)
- Optional: URL or button
- Optional: "Start free trial" / "Available now" button element

**Background:** Dark (brand dark) or return to opening background for bookend effect.

**Examples:**
- Teamble logo + "Unlock high performance with smarter feedback" (V2-S9)
- Viable logo + "Start your free trial" + URL (V5-S9)
- "Available now" pill button on gradient (V4-S6)
- What a Story logo + URL (V3-S15)

**Transition out:** `fade` to black (always)

---

### 9. RAPID-TEXT

**Purpose:** Build energy with fast-paced typography. Common in agency/hype reels.

**Layout:** `centered` — single text element that swaps rapidly
**Density:** Very low per frame (1 element), but high over time (many swaps)
**Elements:**
- One bold text line at a time, full-screen or near-full
- Text swaps every 1-3 seconds
- Mix of sizes and colors for rhythm (accent color on key words)

**Background:** Alternates between dark and light for contrast punch.

**Examples:**
- "IT IS ALL / ABOUT YOUR / TIME / TO MAKE / IMPACT" (V7-S1-S2)
- "FRESH / CREATIVE / YOUR / BRAND" rapid swaps (V7-S4-S5)
- "Shift the gears / of your business / with" (V6-S1)

**Transition out:** `cut` (maintains pace) or `zoom-in` on key word

---

### 10. DATA-VISUALIZATION

**Purpose:** Show trends, scores, or analytical insights.

**Layout:** `stacked` (chart + label) or `split` (chart left + insight right)
**Density:** Medium (chart + 2-3 text labels)
**Elements:**
- Line chart, bar chart, or table as primary visual
- Highlight number or trend label (bold, accent color)
- Optional: avatars with checkmarks overlaid on data

**Background:** Dark charcoal with faint grid lines for "dashboard" feel.

**Examples:**
- Rising line graph + "65% Boost in Profitability" (V1-S5)
- Onboarding survey scores table, color-coded (V2-S8)
- Stacked area chart for 360 review (V2-S6)

**Transition out:** `crossfade` (analytical calm) or `zoom-in` on insight

---

### 11. SEQUENTIAL-PRODUCT-PARADE

**Purpose:** Introduce multiple products/features one at a time.

**Layout:** `centered` — same position, content swaps per product
**Density:** Low per frame (2-3 elements), repeated across sub-scenes
**Elements:**
- Product icon/logo (centered)
- Product name (heading lg)
- One-line description (text)
- Each product has its own accent color for the background glow

**Background:** Dark base with product-specific colored glow that changes per item.

**Examples:**
- Fosfor products: spectra (green), aspect (red), optic (gold), refract (purple), lumin (teal) (V6-S4)

**Transition out:** `flash` or rapid `cut` between products

---

## Narrative Flow Patterns

How scene types combine into full video structures. Derived from the 7 reference videos.

### Pattern A: Problem → Solution → Feature → Proof → CTA
**Best for:** SaaS product demos, B2B marketing
**Structure:**
1. STAT-CALLOUT or PROBLEM-STATEMENT (hook with pain)
2. PRODUCT-INTRO (reveal the solution)
3. FEATURE-SHOWCASE (show it working, longest section)
4. SOCIAL-PROOF or DATA-VISUALIZATION (prove it works)
5. CTA/OUTRO

**Used by:** Video 1 (Membrain), Video 2 (Teamble), Video 5 (Viable)

### Pattern B: Hook → Brand → Product-Parade → CTA
**Best for:** Partnership announcements, multi-product suites
**Structure:**
1. RAPID-TEXT (energy hook)
2. PRODUCT-INTRO (brand reveal)
3. SEQUENTIAL-PRODUCT-PARADE (show the suite)
4. CTA/OUTRO

**Used by:** Video 6 (Fosfor + Snowflake)

### Pattern C: Rapid Hook → Feature-Flash → CTA
**Best for:** Short-form ads (< 15s), product launches
**Structure:**
1. RAPID-TEXT (2-3s hook)
2. FEATURE-SHOWCASE (compressed, 3-5s)
3. CTA/OUTRO (2-3s)

**Used by:** Video 4 (GPT-5 style, 12s total)

### Pattern D: Story-Driven Abstract
**Best for:** Agency reels, brand identity videos
**Structure:**
1. Multiple RAPID-TEXT scenes building a narrative thread
2. Interleaved with abstract visual metaphors (not UI)
3. CTA/OUTRO

**Used by:** Video 3 (What a Story), Video 7 (agency reel)

---

## Transition Guidelines

When to use each transition type, based on narrative context.

| Transition | Use when | Energy |
|-----------|----------|--------|
| `cut` | Between related points in the same argument. Keeps urgency. | High |
| `crossfade` | Between different topics or sections. Signals a shift. | Low |
| `fade` (to black) | End of a major section or the video itself. | Minimal |
| `slide-left/right` | Moving forward in a sequence (features, timeline). | Medium |
| `wipe-left/right` | Clean break between contrasting sections (before/after). | Medium |
| `zoom-in` | Drilling into detail (overview → specific feature). | Medium-High |
| `zoom-out` | Pulling back to see the big picture. | Medium |
| `flash` | Punctuation between rapid items (product parade). | High |

### Transition Patterns by Position

- **Opening (scene 1→2):** `cut` or `zoom-in` (immediate energy)
- **Problem→Solution:** `crossfade` or `fade` (tonal shift)
- **Between features:** `slide-left` or `crossfade` (progression)
- **Feature→Proof:** `crossfade` (new section)
- **Penultimate→CTA:** `fade` to black (settling)
- **Within rapid-text:** always `cut` (never break the pace)

---

## Density Progression

Scenes follow a density arc across the video. This is a universal pattern.

```
Scene:    1    2    3    4    5    6    7    8
Density:  ░    ░░   ░░░  ░░░░ ░░░░ ░░░  ░░   ░
          Hook ─── Build ─── Peak ─── Resolve ── CTA
```

- **Opening scenes (1-2):** 1-2 elements. Bold, sparse, high-impact.
- **Middle scenes (3-6):** 3-6 elements. Features, data, complexity.
- **Closing scenes (7-8):** 1-3 elements. Simplify back down for CTA.

Never put the highest density in the first or last scene.

---

## Background Patterns

| Pattern | When to use | Implementation |
|---------|------------|----------------|
| Solid dark (#000-#121212) | Default for most scenes. Professional, SaaS. | `background: #0A0A0A` |
| Dark + ambient glow | Product intro, brand moments. Glows use brand accent at 8-15% opacity. | `radial-gradient` in corners |
| Solid light (#FFF-#F5F5F5) | Contrast scenes, feature text on white. | `background: #FFFFFF` |
| Brand color (bold) | Integration hubs, product parades. Full saturation background. | `background: var(--color-primary)` |
| Gradient (2-color) | CTA scenes, energy moments. Typically warm (coral→lavender, pink→purple). | `linear-gradient` |
| Dark + grid lines | Data visualization scenes. Faint horizontal lines for "dashboard" feel. | Thin lines at 5-10% opacity |

### Dark-to-Light Ratio
Across the 7 videos analyzed: ~75% of scenes use dark backgrounds, ~15% use light/white, ~10% use bold color or gradient. Dark dominates in SaaS/tech.

---

## Element Sizing Heuristics

When exact sizes aren't specified, use these ratios relative to viewport:

| Element | Typical Size | Notes |
|---------|-------------|-------|
| Hero number (stat) | heading 2xl | The single biggest text on screen |
| Hero headline | heading xl | Product name, main statement |
| Supporting text | heading md or text | Labels, descriptions |
| Tag/label | text (small) | "Sales Leader", category names |
| Progress ring | 25-35% of viewport width | Centered, with number inside |
| Portrait (small) | 8-12% of viewport width | In clusters/rings |
| Portrait (featured) | 20-30% of viewport width | In split layouts |
| Logo (outro) | 15-25% of viewport width | Small, dignified |
| Dashboard mockup | 70-85% of viewport width | Dominant element |

---

## How Video-Craft Uses This

When building a YAML config from a user brief:

1. **Identify the narrative pattern** (A/B/C/D) based on video purpose and length
2. **Map each scene to a scene type** — this determines layout, density, and element types
3. **Apply transition guidelines** based on scene-to-scene narrative relationship
4. **Follow density progression** — sparse→dense→sparse
5. **Colors, fonts, spacing** come from the design system (seurat tokens), not from here
6. **Timing** comes from the timing engine (word count + speed preset), not from here

This file provides the **structural intelligence** — what goes where and why.

---

## Cinematic Composition Principles

These rules transform flat "slide" layouts into cinematographic frames.

### Rule of Thirds

Every frame is divided into a 3×3 grid. Key elements sit on grid lines or intersections, NOT dead center.

```
┌─────────┬─────────┬─────────┐
│         │         │         │
│    ×────┼─────────┼────×    │  ← Power points
│         │         │         │
├─────────┼─────────┼─────────┤
│         │         │         │
│    ×────┼─────────┼────×    │
│         │         │         │
└─────────┴─────────┴─────────┘
```

**Application by scene type:**
- **STAT-CALLOUT**: Number at top-right intersection. Label below, left-aligned to same column.
- **PROBLEM-STATEMENT**: Headline at left third-line. Supporting text below in left two-thirds.
- **PRODUCT-INTRO**: Brand name centered (exception: this is a logo/impact moment). Tagline at bottom-third line.
- **FEATURE-SHOWCASE**: UI mockup in right two-thirds. Labels/callouts at left intersection.
- **CTA-OUTRO**: Logo at center. Action text at bottom-third intersection.
- **RAPID-TEXT**: Text fills center third (exception: this IS about centered impact).

**When to center:** Only for logo reveals, single-word impact, and CTA. Everything else uses rule of thirds.

### Composition Layouts

| Layout ID | Description | When to use |
|-----------|-------------|-------------|
| `centered` | True center. 1 focal point. | Logo, CTA, single metric, rapid-text |
| `asymmetric-split` | 60/40 or 70/30 split, not 50/50 | Feature + description, problem + visual |
| `off-center-focal` | Main content at thirds intersection | Stat callout, headline scenes |
| `layered-depth` | 3 Z-planes: bg, mid, fg | Any scene — adds cinematic depth |
| `diagonal-flow` | Content along a diagonal line | Energy scenes, transitions, agency reels |
| `edge-bleed` | Elements partially exit frame | Dynamic product shots, abstract scenes |
| `stacked` | Vertical stack with clear hierarchy | Multi-element informational scenes |
| `split` | Side-by-side (for horizontal formats) | Before-after, feature+demo |
| `grid` | Card grid | Integration hub, product parade |

### Depth Layering (Three-Plane Model)

Every scene should have at minimum 2 planes, ideally 3:

| Plane | Content | Treatment |
|-------|---------|-----------|
| **Background** | Gradient, texture, grid, particles | Low contrast, optionally animated (slow drift) |
| **Midground** | Primary content (text, images, cards) | Full contrast, sharp, main focus |
| **Foreground** | Decorative shapes, blur elements | Partial opacity (5-15%), blurred, oversized/cropped |

**Implementation:**
- Background: CSS `background` or pseudo-element with low-opacity pattern
- Midground: Standard scene content
- Foreground: Absolutely-positioned decorative elements with `filter: blur(20px); opacity: 0.08;`

### Negative Space

Minimum 15% of frame should be empty in any scene. Sparse scenes (STAT-CALLOUT, CTA) target 40-60% empty.

### Visual Weight Balance

Dark/large/saturated = heavy. Light/small/desaturated = light.
Place heavy elements bottom or left. Balance with lighter elements opposite.

---

## Animation Choreography

### Stagger Patterns

Never animate all elements simultaneously. Use these patterns:

| Pattern | Delay between elements | Use when |
|---------|----------------------|----------|
| **Cascade down** | 80-120ms, top to bottom | Lists, feature cards, stacked content |
| **Cascade up** | 80-120ms, bottom to top | Building energy, revealing from base |
| **Origin burst** | 50-100ms, center outward | Grid reveals, integration hubs |
| **Wave** | 60-100ms, left to right | Horizontal layouts, timelines |
| **Paired** | Two elements enter simultaneously, then next pair | Split layouts, before-after |

### Entrance Choreography by Scene Type

| Scene Type | Order | Stagger |
|-----------|-------|---------|
| STAT-CALLOUT | Number first (impact) → label after (context) | 200ms gap |
| PROBLEM-STATEMENT | Headline first → supporting text → visual | 120ms cascade |
| PRODUCT-INTRO | Background glow → brand name → tagline words one by one | 150ms + 300ms word stagger |
| FEATURE-SHOWCASE | Heading → UI visual → callout labels cascade | 100ms cascade |
| SOCIAL-PROOF | Central text → portraits cascade inward | 80ms wave |
| CTA-OUTRO | Logo → tagline → button | 200ms cascade |
| RAPID-TEXT | Instant (cut entrance, <100ms) | No stagger |

### Disney Principles for Motion Graphics

Applied to CSS animations:

1. **Anticipation**: Before main movement, small reverse motion.
   - Scale down to 0.95 before growing to 1.0
   - Move 5px opposite direction before sliding in
2. **Follow-through**: After main movement, secondary elements continue briefly.
   - Text settles with slight overshoot after card arrives
   - Supporting elements arrive 100-200ms after primary
3. **Squash & stretch**: Non-uniform scaling during movement.
   - At peak velocity: `scaleX(1.05) scaleY(0.95)`
   - At landing: `scaleX(0.98) scaleY(1.02)` then settle
4. **Arcs**: Movement follows curves, not straight lines.
   - Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for springy arrivals
   - Combine translateX + translateY for curved paths
5. **Staging**: One element at a time gets the spotlight.
   - During a key entrance, all other elements hold still or animate very slowly

### Micro-Pauses

After each animation sequence completes, hold for 200-400ms before next action.
This lets the viewer process what they just saw. Scenes without pauses feel frantic.

---

## Semantic Transitions

Transitions carry meaning. They're not decorative.

| Narrative moment | Transition | Why |
|-----------------|------------|-----|
| **Hook → Content** | `cut` | Impact. No wasted time. |
| **Problem → Solution** | `wipe-left` or `morph-reveal` | Clean break. Dark → light. Old → new. |
| **Feature → Feature** | `slide-left` | Continuity. Sequence. Forward progress. |
| **Feature → Proof** | `crossfade` | Gentle shift in topic. |
| **Any → CTA** | `zoom-in` or `fade` | Focus narrows. Action time. |
| **Social proof → CTA** | `crossfade` (slow, 800ms) | Trust transforms into action. |
| **Within rapid-text** | `cut` (always) | Never break pace. |
| **Breathing scene** | `fade` in + `fade` out | Calm. Reset. |

---

## Pacing and Rhythm

### Breathing Scenes

After every 2-3 content-dense scenes, insert a **breathing scene**:
- Duration: 500-1000ms
- Content: Brand color/gradient only, or logo watermark
- Purpose: Let the viewer's brain reset

### Tension Arc

```
Energy:   ■       ■ ■ ■
          ■ ■     ■ ■ ■ ■
          ■ ■ ■   ■ ■ ■ ■ ■
Scene:    1  2  3  4  5  6  7  8
          Hook  Build  Climax  Breathe  CTA
```

- **Scenes 1-2**: High energy entrance (hook), then settle
- **Scenes 3-5**: Build complexity, faster pacing
- **Scene 6**: Peak density / peak energy
- **Scene 7**: Breathing scene or gentle transition
- **Scene 8**: CTA — clean, sparse, calm authority

### Beat Timing

Scene changes should land on consistent intervals:
- Fast video (ads): every 1.5-2.5s
- Standard: every 3-4s
- Premium/luxury: every 4-6s

### Contrast Rhythm

Alternate these properties across scenes:
- **Light ↔ Dark** backgrounds (not every scene, but no more than 3 same-tone in a row)
- **Dense ↔ Sparse** element count
- **Static ↔ Dynamic** (high-motion entrance vs. gentle fade)
- **Warm ↔ Cool** color temperature

---

## Animated Backgrounds

Static solid backgrounds → cinematic ambiance.

| Pattern | CSS Approach | When |
|---------|-------------|------|
| **Gradient drift** | `@keyframes` animating `background-position` on large gradient (400% 400%) | Brand scenes, CTA |
| **Particle float** | Multiple `box-shadow` on a pseudo-element, animated with `translateY` | Tech, SaaS, premium |
| **Grid pulse** | Repeating linear-gradient lines at 5% opacity, subtle `opacity` animation | Data viz, dashboard feel |
| **Noise grain** | SVG `<filter>` with `feTurbulence`, animated `seed` | Cinematic, film, agency |
| **Vignette** | `radial-gradient(ellipse, transparent 50%, rgba(0,0,0,0.6))` overlay | Focus scenes, all genres |
| **Ambient glow shift** | `radial-gradient` with animated position | Product intro, brand moments |

All background animations should be **slow** (4-10s cycle) and **subtle** (opacity 5-20%). They set mood, never compete with content.

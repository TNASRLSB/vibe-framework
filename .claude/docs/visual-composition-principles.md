# Visual Composition Principles

**Shared foundation for ui-craft (web layout) and video-craft (frame composition).**

These principles describe how the human eye processes visual information. They apply identically whether the canvas is a web page or a video frame. Each skill adapts them to its medium.

---

## 1. Visual Hierarchy

Every composition has exactly **one primary focal point**. Everything else supports it.

### Hierarchy levels

| Level | Role | Relative size | Contrast | Example (web) | Example (video) |
|-------|------|--------------|----------|----------------|-----------------|
| **Primary** | The one thing the viewer must see | 100% | Maximum | H1 headline, hero CTA | Main title, key metric |
| **Secondary** | Supports/explains primary | 60-75% | High | Subheading, feature cards | Subtitle, supporting visual |
| **Tertiary** | Context, navigation, metadata | 40-50% | Medium | Nav links, timestamps | Logo watermark, scene label |
| **Background** | Sets mood, never competes | — | Minimal | Page background, section color | Gradient, texture, particles |

### How to establish hierarchy

1. **Size** — Larger = more important. Minimum 1.5x ratio between primary and secondary.
2. **Contrast** — High contrast against background = attention. Low contrast = recedes.
3. **Position** — Top-left (LTR cultures) and center get seen first.
4. **Isolation** — Whitespace/negative space around an element elevates it.
5. **Motion** (video only) — The only moving element in a static scene captures attention instantly.

**Rule: If everything is important, nothing is.**

---

## 2. Rule of Thirds

Divide the canvas into a 3×3 grid. Place key elements on **grid lines or intersections**, not dead center.

```
┌─────────┬─────────┬─────────┐
│         │         │         │
│    ×────┼─────────┼────×    │  ← Power points (intersections)
│         │         │         │
├─────────┼─────────┼─────────┤
│         │         │         │
│    ×────┼─────────┼────×    │
│         │         │         │
└─────────┴─────────┴─────────┘
```

### Application

| Medium | How |
|--------|-----|
| **Web** | Hero headline at top-left third. CTA at bottom-right intersection. Image bleeds into right two-thirds. |
| **Video** | Title text aligned to left third-line. Key visual at right intersection. Never center everything — it's static and lifeless. |

### When to break it

- **Centered composition** works for: single-word impact, logos, minimal CTA scenes, symmetry-driven luxury brands.
- **Rule of thirds** works for: everything else.

---

## 3. Gestalt Principles

The brain groups visual elements automatically. Use this, don't fight it.

### 3.1 Proximity

Elements close together are perceived as a group. **Spacing is meaning.**

```
[Icon] [Label] [Value]     ← One group (card)

                            ← Gap = boundary

[Icon] [Label] [Value]     ← Another group
```

- **Web**: Padding within a card < margin between cards. Always.
- **Video**: Elements in the same scene that belong together must be physically close. Don't scatter related info across the frame.

### 3.2 Similarity

Elements that look alike are perceived as related.

- **Web**: All clickable elements share a color. All labels share a font weight.
- **Video**: Recurring elements (chapter titles, metrics) must have identical styling across all scenes.

### 3.3 Closure

The brain completes incomplete shapes. You can suggest boundaries without drawing them.

- **Web**: Cards don't always need borders — background color difference is enough.
- **Video**: A partial circle or cropped image implies continuation beyond the frame (creates depth).

### 3.4 Continuity

The eye follows lines and curves. Use this to guide attention.

- **Web**: Alignment creates invisible lines. Left-aligned text creates a strong vertical line the eye follows down.
- **Video**: A diagonal element (line, gradient edge, motion path) pulls the eye from entry point to focal point.

### 3.5 Figure-Ground

One element is perceived as "figure" (foreground, important) and the rest as "ground" (background).

- **Web**: Dark text on light background, or light card on dark section.
- **Video**: Key element must have enough contrast to separate from background. If in doubt, add a subtle shadow, blur the background, or darken the area behind text.

---

## 4. Negative Space

Empty space is not wasted space. It's the most powerful tool for focus.

### Minimum spacing ratios

| Relationship | Minimum gap |
|-------------|-------------|
| Between unrelated sections | 2× the line height |
| Between related items in a group | 0.5-1× the line height |
| Around a focal element (isolation) | 3-4× the element's height on at least 2 sides |
| Edge of canvas to content | 5-10% of canvas width |

### Density spectrum

| Density | When to use | Spacing multiplier |
|---------|------------|-------------------|
| **Sparse** | Hero, CTA, impact moments, breathing scenes | 2-3× base |
| **Comfortable** | Body content, feature sections | 1-1.5× base |
| **Dense** | Data tables, dashboards, comparison grids | 0.75-1× base |

**Rule: Sparse at the edges of the experience (first/last impression), denser in the middle.**

---

## 5. Reading Patterns

### F-Pattern (text-heavy content)

```
████████████████████████
████████████████████████
████████████
████████████████████████
████████████████████████
████████
████████████████████████
```

The eye scans the top fully, then progressively shorter horizontal sweeps. **Put the most important content in the first two lines.**

- **Web**: Blog posts, documentation, article pages.
- **Video**: Text-heavy explanation scenes — key info in top half.

### Z-Pattern (visual/marketing content)

```
1 ──────────────────→ 2
                     ╱
                   ╱
                 ╱
               ╱
3 ──────────────────→ 4
```

The eye moves: top-left → top-right → diagonal → bottom-left → bottom-right.

- **Web**: Landing pages, hero sections. Logo top-left (1), nav top-right (2), headline center (diagonal), CTA bottom-right (4).
- **Video**: Brand intro scenes. Logo top-left, tagline top-right, product visual center, CTA bottom-right.

---

## 6. Depth and Layering

Flat compositions feel like slides. Depth feels cinematic.

### Three-plane model

| Plane | Content | Visual treatment |
|-------|---------|-----------------|
| **Background** | Color, gradient, texture, pattern | Low contrast, optionally blurred or darkened |
| **Midground** | Primary content (text, images, cards) | Full contrast, sharp, main focus |
| **Foreground** | Decorative elements, overlays | Partial opacity, blur, or oversized/cropped — creates depth |

### How to create depth

1. **Overlap** — Elements that overlap others appear in front.
2. **Scale difference** — Larger foreground elements + smaller background elements = depth.
3. **Blur differential** — Sharp midground + blurred fore/background = cinematic rack focus.
4. **Shadow** — Elevation shadow implies Z-axis separation.
5. **Parallax** (web scroll, video pan) — Different layers move at different speeds.

### Application

- **Web**: Hero with oversized decorative shape (foreground, 10% opacity) + headline (midground) + subtle gradient (background). Sticky nav floats above content with shadow.
- **Video**: Floating particles or shapes (foreground, blurred) + title text (midground, sharp) + dark gradient with subtle grid animation (background).

---

## 7. Color as Composition Tool

Color isn't just aesthetics — it's a structural element.

### Contrast for hierarchy

- Primary focal point: highest contrast against background
- Secondary elements: medium contrast
- Tertiary/decorative: low contrast (near-background)

### Color weight

Dark, saturated colors feel "heavy" — anchor them at the bottom or use them for grounding elements. Light, desaturated colors feel "light" — use for backgrounds and spacers.

### Accent economy

One accent color for action/attention. Maximum two accent colors in any single view/frame. Everything else is neutrals.

### Scene mood via color temperature

| Mood | Temperature | Example |
|------|------------|---------|
| Trust, calm | Cool (blue, teal) | Finance, healthcare |
| Energy, urgency | Warm (orange, red) | E-commerce CTA, launch |
| Premium, elegance | Neutral (black, gold, white) | Luxury, fashion |
| Growth, nature | Green, earth tones | Sustainability, wellness |

---

## 8. Typography as Structure

### Size scale

Use a modular scale (1.25 or 1.333 ratio). Never arbitrary sizes.

| Role | Scale (1.25) | Scale (1.333) |
|------|-------------|---------------|
| Body | 16px | 16px |
| H3 / Small heading | 20px | 21px |
| H2 / Section heading | 25px | 28px |
| H1 / Page title | 31px | 38px |
| Display / Hero | 39px | 50px |

### Weight for hierarchy

- **Bold (700+)**: Headlines, primary focal points
- **Semi-bold (600)**: Subheadings, labels
- **Regular (400)**: Body text, descriptions
- **Light (300)**: Captions, metadata (use sparingly, accessibility risk)

### Line length

Optimal readability: **45-75 characters per line**. Wider = fatigue. Narrower = choppy.

- **Web**: Use max-width on text containers (600-700px for body text)
- **Video**: Maximum 8-10 words per line, 2-3 lines per text block

---

## 9. Asymmetry over Symmetry

Symmetrical layouts are stable but boring. Asymmetry creates visual tension and interest.

### Asymmetric balance

```
Symmetrical (static):        Asymmetrical (dynamic):
┌──────────────────────┐     ┌──────────────────────┐
│    ┌────┐  ┌────┐    │     │  ┌────────┐  ┌──┐   │
│    │    │  │    │    │     │  │        │  │  │   │
│    └────┘  └────┘    │     │  │        │  └──┘   │
│    ┌────┐  ┌────┐    │     │  └────────┘  ┌──┐   │
│    │    │  │    │    │     │              │  │   │
│    └────┘  └────┘    │     │              └──┘   │
└──────────────────────┘     └──────────────────────┘
```

- One large element balanced by two or three smaller elements.
- **60/40 or 70/30 splits** instead of 50/50.
- Asymmetry works when the visual "weight" of both sides is equal even if the sizes aren't.

---

## 10. Motion Principles (shared)

These apply to both web scroll animations and video animations.

### Easing — Never Linear

| Easing | Use for | Feel |
|--------|---------|------|
| `ease-out` (decelerate) | Entrances — element arrives and settles | Natural, confident |
| `ease-in` (accelerate) | Exits — element leaves | Purposeful departure |
| `ease-in-out` | State changes, position shifts | Smooth, elegant |
| `linear` | Never for UI/video motion | Robotic, lifeless |
| `spring` (overshoot + settle) | Playful entrances, emphasis | Energetic, bouncy |

### Duration — Proportional to Distance

| Movement | Duration range |
|----------|---------------|
| Micro (color change, opacity) | 100-200ms |
| Small (button press, icon swap) | 200-300ms |
| Medium (card entrance, panel slide) | 300-500ms |
| Large (page transition, modal) | 500-800ms |
| Dramatic (hero entrance, scene change) | 800-1200ms |

**Rule: Longer animations need more complex easing to stay interesting.**

### Choreography — Order Matters

Elements should animate in **order of importance**:
1. Background/container first (sets the stage)
2. Primary content (headline, hero image)
3. Secondary content (supporting text, features)
4. Tertiary (navigation, metadata, decorative)

**Stagger delay between groups: 50-150ms.**

### 12 Principles of Animation (Disney, adapted)

| Principle | Application |
|-----------|------------|
| **Squash & stretch** | Scale elements slightly during fast movement (scaleX: 1.1, scaleY: 0.9 at peak velocity) |
| **Anticipation** | Small reverse movement before main action (move left 5px before flying right) |
| **Staging** | Only one element animating at a time gets focus. Everything else holds still or moves slowly |
| **Follow-through** | After main movement stops, secondary elements continue briefly (text settles after card lands) |
| **Slow in / slow out** | = Easing. Always. See table above |
| **Arcs** | Natural movement follows curves, not straight lines. Use CSS motion-path or bezier transforms |
| **Secondary action** | Small animation that supports the primary (icon wiggles after button lands) |
| **Timing** | Fast = energetic/urgent. Slow = elegant/calm. Match brand personality |
| **Exaggeration** | Slightly oversized movements read better on screen than realistic ones |
| **Solid drawing** | Maintain consistent proportions. Don't stretch text, respect aspect ratios |
| **Appeal** | Motion should feel intentional and pleasant, never random or jarring |

---

## Quick Reference: Common Mistakes

| Mistake | Why it fails | Fix |
|---------|-------------|-----|
| Everything centered | No hierarchy, no visual flow | Use rule of thirds, asymmetric splits |
| Equal spacing everywhere | No grouping, flat information hierarchy | Vary spacing: tight within groups, loose between |
| Too many colors | Chaos, no focal point | 1 accent, 2-3 neutrals max per view |
| Text over busy background | Unreadable, cognitive overload | Darken/blur background behind text, or use solid overlay |
| Linear animation | Feels robotic | Always use easing curves |
| Everything animates at once | Overwhelming, nothing stands out | Stagger with 50-150ms delays, animate in hierarchy order |
| No breathing room | Fatigue, claustrophobia | Sparse scenes between dense ones, whitespace around focal elements |
| Symmetrical everything | Boring, feels like a template | Break symmetry with asymmetric splits, off-center placement |
| Decorative elements compete with content | Distraction | Decorative = low opacity, blur, or background plane only |

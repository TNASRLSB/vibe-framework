# Validation Rules

Three-stage validation: Pre-Generation → During → Post-Generation.

---

## Pre-Generation Audit (Russian Hardening)

**Run BEFORE writing any code.**

### Design System Check

| Check | Condition | Action |
|-------|-----------|--------|
| system.md exists | `.seurat/system.md` present | If missing → run `/seurat establish` |
| Direction defined | `Personality:` field populated | If missing → BLOCK |
| Tokens complete | Spacing, colors, typography defined | If incomplete → WARN |

### Typography Validation

| Check | Violation | Severity |
|-------|-----------|----------|
| Generic font | Inter, Roboto, Arial, Helvetica, sans-serif | **BLOCK** |
| Missing font stack | No fallback fonts | WARN |
| Wrong weight contrast | Display < 700 weight | WARN |

### Color Validation

| Check | Threshold | Severity |
|-------|-----------|----------|
| Text contrast | < 4.5:1 (AA) | **BLOCK** |
| Large text contrast | < 3:1 | **BLOCK** |
| UI element contrast | < 3:1 | **BLOCK** |
| Enhanced contrast | < 7:1 (AAA) | WARN |

### Spacing Validation

| Check | Violation | Severity |
|-------|-----------|----------|
| Off-grid value | Not divisible by base (4 or 8) | WARN |
| Inconsistent scale | Mixed px values | WARN |
| Magic numbers | Arbitrary values like 13px, 47px | WARN |
| Negative margin on text | `margin-left` or `margin-right` negative on headings, titles, or text elements → content bleeds outside viewport | **BLOCK** |
| Content outside viewport | Any element with negative margin that pushes readable text past the left/right edge of the container | **BLOCK** |

### Security Check (Supply Chain)

| Check | Violation | Severity |
|-------|-----------|----------|
| External font CDN | Non-versioned URL | WARN |
| Unpinned dependency | No version lock | WARN |
| Inline styles | Security policy risk | INFO |

---

## During-Generation Validation

**Enforce while writing code.**

### Component Checks

```javascript
// Pseudo-validation logic

function validateComponent(code) {
  const violations = [];

  // Button height consistency
  if (hasButton(code)) {
    const heights = extractButtonHeights(code);
    if (!allEqual(heights)) {
      violations.push({
        severity: 'WARN',
        rule: 'button-height-drift',
        message: 'Button heights vary more than 2px'
      });
    }
  }

  // Touch target size
  if (hasInteractiveElement(code)) {
    const sizes = extractTouchTargets(code);
    sizes.forEach((size, el) => {
      if (size.width < 44 || size.height < 44) {
        violations.push({
          severity: 'BLOCK',
          rule: 'touch-target-size',
          message: `${el} is ${size.width}x${size.height}px, minimum 44x44px`
        });
      }
    });
  }

  // Focus styles
  if (hasInteractiveElement(code) && !hasFocusStyles(code)) {
    violations.push({
      severity: 'BLOCK',
      rule: 'missing-focus',
      message: 'Interactive element missing :focus-visible styles'
    });
  }

  // Color palette adherence
  const colors = extractColors(code);
  const systemColors = loadSystemColors();
  colors.forEach(color => {
    if (!inPalette(color, systemColors)) {
      violations.push({
        severity: 'WARN',
        rule: 'color-drift',
        message: `Color ${color} not in system palette`
      });
    }
  });

  return violations;
}
```

### Real-time Rules

| Rule | Check | Severity |
|------|-------|----------|
| Button height drift | Heights vary > 2px | WARN |
| Color palette drift | Color not in system.md | WARN |
| Spacing drift | Value not in scale | WARN |
| Generic font detected | Banned font in code | **BLOCK** |
| Missing focus state | Interactive without :focus-visible | **BLOCK** |
| Small touch target | < 44x44px | **BLOCK** |

---

## Post-Generation Polish ("雕花" Refinement)

**Run AFTER code is written.**

### Visual Hierarchy Check

| Element | Requirement | Check |
|---------|-------------|-------|
| Headings | Clear size progression | h1 > h2 > h3 visually |
| CTA | Most prominent element | Highest contrast, largest target |
| Secondary actions | Less prominent than CTA | Lower contrast or outline style |
| Body text | Comfortable reading | 45-75 characters per line |

### Background Depth Check

| Issue | Problem | Fix |
|-------|---------|-----|
| Flat solid color | Looks cheap/generic | Add subtle gradient |
| No layering | Flat hierarchy | Add surface elevation |
| Pure white/black | Harsh on eyes | Use near-white/near-black |

```css
/* Bad: Flat */
background: white;

/* Good: Subtle gradient */
background: linear-gradient(
  135deg,
  hsl(220 20% 98%) 0%,
  hsl(220 15% 96%) 100%
);

/* Good: Layered surfaces */
--color-bg: hsl(220 20% 96%);
--color-surface: hsl(0 0% 100%);
--color-surface-elevated: hsl(220 30% 99%);
```

#### Surface Elevation Guide

Surfaces must be barely different but distinguishable. Recommended lightness progression (delta from background):

**Light Mode** (bg ~96% lightness):

| Surface | Lightness | Delta | Use |
|---------|-----------|-------|-----|
| Background | 96% | base | Page background |
| Surface (cards) | 100% | +4% | Cards, panels |
| Surface raised | 100% | +4% (+ shadow) | Dropdown, tooltip |
| Overlay | 100% | +4% (+ scrim 50%) | Modal, dialog |

**Dark Mode** (bg ~10% lightness):

| Surface | Lightness | Delta | Use |
|---------|-----------|-------|-----|
| Background | 10% | base | Page background |
| Surface (cards) | 13% | +3% | Cards, panels |
| Surface raised | 16% | +6% | Dropdown, tooltip |
| Overlay | 19% | +9% | Modal, dialog |

Dark mode notes: larger deltas (perception is non-linear), borders > shadows (shadows near-invisible on dark), text hierarchy via white at 90% → 70% → 50% → 35% opacity.

**Border opacity progression:**

| Level | Opacity | Use |
|-------|---------|-----|
| Subtle | 5-7% | Internal separators |
| Default | 8-12% | Card borders |
| Strong | 15-20% | Input borders |
| Stronger | 25-30% | Focus rings, dividers |

**Principle:** Adjacent layer difference must exceed the **perception threshold** (~3% lightness) but stay below the **distraction threshold** (~8% in light, ~12% in dark). "Barely perceptible" = correct. "Obviously different" = too much. "Identical" = useless.

### Shadow Refinement

| Issue | Problem | Fix |
|-------|---------|-----|
| Generic box-shadow | `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` | Use layered shadows |
| No shadow color | Gray shadows on colored bg | Tint shadow to match |
| Single layer | Looks flat | Multiple shadow layers |

```css
/* Bad: Generic */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

/* Good: Layered */
box-shadow:
  0 1px 2px hsl(220 30% 10% / 0.04),
  0 2px 4px hsl(220 30% 10% / 0.04),
  0 4px 8px hsl(220 30% 10% / 0.04);

/* Good: Color-tinted */
box-shadow:
  0 4px 12px hsl(var(--shadow-hue) 30% 20% / 0.1);
```

### Motion Polish

| Element | Requirement | Implementation |
|---------|-------------|----------------|
| Page load | Orchestrated reveal | Staggered fade-in |
| Hover states | Smooth transition | 150-200ms ease |
| State changes | Clear feedback | Scale or color shift |
| Reduced motion | Respect preference | `prefers-reduced-motion` |

```css
/* Orchestrated reveal */
.reveal-item {
  opacity: 0;
  transform: translateY(20px);
  animation: reveal 400ms ease-out forwards;
  animation-delay: calc(var(--index) * 80ms);
}

@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect motion preference */
@media (prefers-reduced-motion: reduce) {
  .reveal-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### Typography Polish

| Check | Issue | Fix |
|-------|-------|-----|
| Weight contrast | Headings not bold enough | Use 700-900 weight |
| Letter spacing | Large text too loose | Tighten to -0.02em |
| Line length | Too wide | Max-width 65-75ch |
| Orphans | Single word on last line | CSS `text-wrap: balance` |

```css
/* Balanced headings */
h1, h2, h3 {
  text-wrap: balance;
  max-width: 20ch; /* Short lines for headings */
}

/* Comfortable body */
p {
  max-width: 65ch;
  text-wrap: pretty; /* Avoid orphans */
}
```

---

## The Mandate (Qualitative Gate)

After 雕花 polish and before Visual QA. These are self-evaluations Claude performs internally before showing output to the user.

### 1. SWAP TEST
Change the typeface and layout mentally. If the output looks equally "right" with any font/layout combination → it's generic.

**Must pass:** the typeface and layout must be *chosen*, not interchangeable.

Example fail: "This dashboard would look the same in Roboto with a different grid."
Example pass: "The mono font for numerical data and the tight 4-column grid are specific to a financial terminal."

### 2. SQUINT TEST
Blur the output mentally. If the visual hierarchy disappears → missing structure.

**Must pass:** with blurred vision, 3 hierarchy levels must be distinguishable.

Example fail: "Everything is the same size and weight — can't tell heading from body."
Example pass: "Dark bold header, medium weight section titles, light body text — clear even blurred."

### 3. SIGNATURE TEST
Identify 3 specific elements that make this output recognizable. If you can't name 3 → it's generic.

**Must pass:** 3 design choices that a generic template wouldn't have made.

Example: "mono font for data, border-left accent on cards, asymmetric header spacing"

### 4. TOKEN TEST
Read the CSS custom property names. If they sound generic → they don't belong to the product.

**Must pass:** names should reflect the domain when possible.

| Generic (fail) | Domain-specific (pass) |
|---|---|
| `--color-primary` | `--color-chart-positive` |
| `--spacing-md` | `--spacing-data-cell` |
| `--radius-lg` | `--radius-metric-card` |

### On Failure

If any test fails: return to Phase 3 (BUILD) and rebuild the generic part. Don't patch — reconstruct the decision.

---

## Validation Report Format

```markdown
# UI Craft Validation Report

## Summary
- **BLOCK violations**: 2
- **WARN violations**: 5
- **INFO notices**: 3

## BLOCK (Must Fix)

### 1. Missing Focus State
**File**: components/Button.tsx:45
**Element**: `.btn-secondary`
**Issue**: No `:focus-visible` styles defined
**Fix**: Add focus ring
```css
.btn-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### 2. Touch Target Too Small
**File**: components/IconButton.tsx:12
**Element**: `.icon-btn`
**Size**: 32x32px (minimum 44x44px)
**Fix**: Increase size or add padding
```css
.icon-btn {
  min-width: 44px;
  min-height: 44px;
}
```

## WARN (Should Fix)

### 1. Color Not in System
**File**: pages/Dashboard.tsx:78
**Color**: `hsl(215 60% 45%)`
**Nearest system color**: `--color-accent` (hsl(220 70% 50%))
**Fix**: Use system token

### 2. Off-Grid Spacing
**File**: components/Card.tsx:23
**Value**: `padding: 18px`
**Grid**: 8px base
**Nearest**: 16px or 24px
**Fix**: Use `var(--space-2)` or `var(--space-3)`

## Polish Suggestions

### Background
Current: Flat white (`#ffffff`)
Suggested: Subtle gradient
```css
background: linear-gradient(135deg, hsl(220 20% 98%), hsl(220 15% 96%));
```

### Typography
- Heading weight could be bolder (currently 600, suggest 800)
- Consider tighter letter-spacing on hero text

### Motion
- No page load animation detected
- Consider adding staggered reveal for card grid
```

---

## Automated Validation Script

```bash
#!/bin/bash
# .seurat/scripts/validate.sh

echo "UI Craft Validation"
echo "==================="

# Check system.md exists
if [ ! -f ".seurat/system.md" ]; then
  echo "BLOCK: system.md not found. Run /seurat establish"
  exit 1
fi

# Check for banned fonts
BANNED_FONTS="Inter|Roboto|Arial|Helvetica|sans-serif"
if grep -rE "font-family:.*($BANNED_FONTS)" --include="*.css" --include="*.tsx" --include="*.jsx" .; then
  echo "BLOCK: Banned font detected"
fi

# Check for magic numbers in spacing
if grep -rE "padding:\s*[0-9]+px" --include="*.css" .; then
  echo "WARN: Raw px values in padding (use CSS variables)"
fi

# Check for missing focus styles
if ! grep -rE ":focus-visible|:focus" --include="*.css" .; then
  echo "BLOCK: No focus styles found"
fi

echo "Validation complete"
```

---

## Severity Definitions

| Severity | Meaning | Action |
|----------|---------|--------|
| **BLOCK** | Accessibility or usability violation | Must fix before completion |
| **WARN** | Quality/consistency issue | Should fix, can proceed |
| **INFO** | Enhancement suggestion | Optional improvement |

---

## Quality Gates

### Before Marking Complete

- [ ] All BLOCK violations resolved
- [ ] WARN violations reviewed (fix or acknowledge)
- [ ] Accessibility checklist passed
- [ ] Visual polish applied
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Touch targets ≥ 44x44px
- [ ] Focus states visible on all interactive elements

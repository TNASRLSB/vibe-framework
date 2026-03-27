# PPTX — Gotchas & Non-Obvious Patterns

> Standard python-pptx operations are not included — you already know them. This file covers only patterns that are error-prone, require internal API access, or encode opinionated design standards.

## Slide Layout Indices

Default template indices (vary by template — always verify with introspection):

| Index | Layout Name | Use Case |
|-------|-------------|----------|
| 0 | Title Slide | First slide, title + subtitle |
| 1 | Title and Content | Standard body slide |
| 2 | Section Header | Section dividers |
| 3 | Two Content | Side-by-side content |
| 4 | Comparison | Two columns with headers |
| 5 | Title Only | Custom content slide |
| 6 | Blank | Full custom layout |

## Placeholder Introspection

Placeholder indices are not predictable across templates. Always introspect before accessing:

```python
for ph in slide.placeholders:
    print(f"idx={ph.placeholder_format.idx}, name={ph.name}, type={ph.placeholder_format.type}")
```

`placeholder_format.idx` is the key you pass to `slide.placeholders[idx]`. Do not assume `0` is title or `1` is body — verify for every template.

## Full-Bleed Background Image with Z-Order

`add_picture()` places images on top of all existing shapes. To use an image as a background, you must manipulate the XML shape tree directly:

```python
slide_width = prs.slide_width
slide_height = prs.slide_height
pic = slide.shapes.add_picture(
    "background.jpg",
    left=0, top=0,
    width=slide_width, height=slide_height
)
# Send to back by removing from shape tree and reinserting at position 2
# (index 2 is after the background fill and shape tree root elements)
sp = pic._element
sp.getparent().remove(sp)
slide.shapes._spTree.insert(2, sp)
```

This uses internal `_element` and `_spTree` APIs — there is no public method for z-order control.

## Transitions and Animations (OOXML Workaround)

python-pptx has no support for transitions or animations. Use the unpack/edit/repack approach:

```bash
python3 scripts/office/unpack.py presentation.pptx
# Edit ppt/slides/slide1.xml to add transition/animation XML
python3 scripts/office/pack.py presentation_unpacked presentation_animated.pptx
```

## Visual Design Principles

**Typography:**
- Title: 28-36pt, bold
- Body: 18-24pt, regular
- Caption/footnote: 12-14pt
- Maximum 2 font families per deck
- Minimum 18pt for any projected text

**Color:**
- Primary brand color for titles and key elements
- Neutral (dark gray, not pure black) for body text
- Accent color for highlights and call-outs
- Maximum 3-4 colors per slide
- Ensure sufficient contrast (4.5:1 for text)

**Layout:**
- One idea per slide
- Maximum 6 bullet points per slide
- Maximum 6 words per bullet
- Use images over text where possible
- Leave 10-15% margin on all sides
- Align elements to a grid

**Content flow:**
1. Title slide — topic + speaker
2. Agenda/overview — what you will cover
3. Context — why this matters
4. Content slides — one idea each
5. Key takeaway — the one thing to remember
6. Call to action — what to do next
7. Q&A / closing

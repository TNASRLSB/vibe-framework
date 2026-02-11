# PowerPoint Reference (.pptx)

## Design Principles

### The 6x6 Rule
- Maximum 6 bullet points per slide
- Maximum 6 words per bullet point
- If you need more text, you need more slides

### Visual Hierarchy
- One key message per slide
- Maximum 6 visual elements per slide (including title)
- 40% white space minimum
- Text should never compete with visuals

### Color Palettes

**Professional (Default):**

| Role | Color | Hex |
|------|-------|-----|
| Primary | Dark Blue | `#2F5496` |
| Secondary | Steel Blue | `#4472C4` |
| Accent | Teal | `#2E8B8B` |
| Background | White | `#FFFFFF` |
| Text | Dark Gray | `#333333` |
| Subtle | Light Gray | `#F2F2F2` |

**If a Seurat design system exists**, use its design tokens instead. Check for `.seurat/tokens/` or `design-system/`.

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Slide title | Calibri | 36-44pt | Bold |
| Subtitle | Calibri | 24-28pt | Regular |
| Body text | Calibri | 18-22pt | Regular |
| Caption | Calibri | 14-16pt | Light |
| Data labels | Calibri | 12-14pt | Regular |

**Rule: Maximum 2 font families per presentation.**

---

## Creation with python-pptx

### Basic Structure

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

prs = Presentation()

# Set slide dimensions (16:9 widescreen)
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Add slide using layout
slide_layout = prs.slide_layouts[0]  # Title slide
slide = prs.slides.add_slide(slide_layout)

title = slide.shapes.title
title.text = "Presentation Title"

subtitle = slide.placeholders[1]
subtitle.text = "Subtitle text"

prs.save("output.pptx")
```

### Slide Layouts (Standard)

| Index | Layout Name | Use Case |
|-------|-------------|----------|
| 0 | Title Slide | Opening/closing slides |
| 1 | Title and Content | Standard content slides |
| 2 | Section Header | Section dividers |
| 3 | Two Content | Side-by-side comparison |
| 4 | Comparison | Labeled side-by-side |
| 5 | Title Only | Custom layout base |
| 6 | Blank | Full custom design |

### Text Formatting

```python
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Text box
txBox = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(2))
tf = txBox.text_frame
tf.word_wrap = True

# First paragraph
p = tf.paragraphs[0]
p.text = "Main heading"
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = RGBColor(0x2F, 0x54, 0x96)
p.alignment = PP_ALIGN.LEFT

# Additional paragraphs
p2 = tf.add_paragraph()
p2.text = "Body text here"
p2.font.size = Pt(18)
p2.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
p2.space_before = Pt(12)
```

### Bullet Points

```python
tf = txBox.text_frame

for i, item in enumerate(["Point one", "Point two", "Point three"]):
    if i == 0:
        p = tf.paragraphs[0]
    else:
        p = tf.add_paragraph()
    p.text = item
    p.font.size = Pt(20)
    p.level = 0  # 0 = top level, 1 = indented
    p.space_before = Pt(6)
```

---

## Shapes and Graphics

### Basic Shapes

```python
from pptx.enum.shapes import MSO_SHAPE

# Rectangle
shape = slide.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE,
    Inches(1), Inches(2),   # left, top
    Inches(4), Inches(1.5)  # width, height
)
shape.fill.solid()
shape.fill.fore_color.rgb = RGBColor(0x2F, 0x54, 0x96)
shape.line.fill.background()  # No border

# Add text to shape
tf = shape.text_frame
tf.text = "Key Metric"
tf.paragraphs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
tf.paragraphs[0].font.size = Pt(24)
tf.paragraphs[0].alignment = PP_ALIGN.CENTER
tf.word_wrap = True
```

### Images

```python
slide.shapes.add_picture('image.png', Inches(1), Inches(2), width=Inches(5))

# Maintain aspect ratio
from PIL import Image
img = Image.open('image.png')
aspect = img.width / img.height
target_width = Inches(5)
target_height = int(target_width / aspect)
slide.shapes.add_picture('image.png', Inches(1), Inches(2),
                          width=target_width, height=target_height)
```

### Tables

```python
rows, cols = 4, 3
table_shape = slide.shapes.add_table(rows, cols, Inches(1), Inches(2), Inches(8), Inches(3))
table = table_shape.table

# Header row
for i, header in enumerate(["Metric", "Q1", "Q2"]):
    cell = table.cell(0, i)
    cell.text = header
    for paragraph in cell.text_frame.paragraphs:
        paragraph.font.bold = True
        paragraph.font.size = Pt(14)
        paragraph.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(0x2F, 0x54, 0x96)

# Data rows
for row_idx in range(1, rows):
    for col_idx in range(cols):
        cell = table.cell(row_idx, col_idx)
        cell.text = str(data[row_idx-1][col_idx])
        for paragraph in cell.text_frame.paragraphs:
            paragraph.font.size = Pt(12)
```

### Charts

```python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('Revenue', (120, 145, 160, 185))
chart_data.add_series('Costs', (80, 85, 90, 95))

chart_frame = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(2), Inches(8), Inches(4.5),
    chart_data
)

chart = chart_frame.chart
chart.has_legend = True
chart.legend.include_in_layout = False
```

---

## Slide Master Editing

For theme-level changes, use OOXML editing:

```bash
python3 scripts/office/unpack.py template.pptx
# Edit ppt/slideMasters/slideMaster1.xml
# Edit ppt/theme/theme1.xml for colors/fonts
python3 scripts/office/pack.py unpacked_template/ template_updated.pptx
```

### Theme Colors (theme1.xml)

```xml
<a:clrScheme name="Custom">
  <a:dk1><a:srgbClr val="333333"/></a:dk1>  <!-- Dark 1 (text) -->
  <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>  <!-- Light 1 (background) -->
  <a:dk2><a:srgbClr val="2F5496"/></a:dk2>  <!-- Dark 2 -->
  <a:lt2><a:srgbClr val="F2F2F2"/></a:lt2>  <!-- Light 2 -->
  <a:accent1><a:srgbClr val="4472C4"/></a:accent1>
  <a:accent2><a:srgbClr val="2E8B8B"/></a:accent2>
  <!-- ... accent3-6 -->
</a:clrScheme>
```

---

## Slide Types and Patterns

### Title Slide
- Company logo (top-right or centered)
- Title: 36-44pt, bold
- Subtitle: 24pt, lighter color
- Date/presenter info: 16pt, bottom

### Content Slide
- Title bar: consistent position across all slides
- Body area: 60-70% of slide
- Max 6 bullet points
- Supporting visual on right (if applicable)

### Data Slide
- Title stating the key insight (not "Q3 Revenue")
- One chart or table per slide
- Callout box highlighting the key number
- Source citation at bottom

### Comparison Slide
- Split layout (50/50 or 60/40)
- Consistent formatting on both sides
- Clear labels (Before/After, Option A/Option B)
- Color coding to differentiate

### Section Divider
- Full-color background (primary color)
- Section title: 36-44pt, white, centered
- Optional: section number or icon

---

## Visual QA

After generating a presentation:

```bash
# Generate thumbnail of key slides
python3 scripts/thumbnail.py output.pptx 1    # Title slide
python3 scripts/thumbnail.py output.pptx 3    # First content slide
```

**Check for:**
- Text overflow (text cut off or too small)
- Alignment consistency across slides
- Color contrast (text readable against background)
- Image quality (not pixelated or stretched)
- Slide-to-slide consistency (titles in same position)
- White space balance (not too crowded)

---

## Animation (OOXML)

python-pptx does not support animations. Use OOXML editing:

```bash
python3 scripts/office/unpack.py presentation.pptx
# Edit ppt/slides/slide1.xml to add animation XML
python3 scripts/office/pack.py unpacked_presentation/ presentation_animated.pptx
```

**Recommendation:** Keep animations minimal. Fade-in for key reveals, no fly-ins or spins.

---

## Export to PDF

```bash
python3 scripts/office/soffice.py convert output.pptx pdf
# Produces output.pdf
```

---

## Common Patterns

### Consistent Slide Generator

```python
def add_content_slide(prs, title, bullets, layout_idx=1):
    slide = prs.slides.add_slide(prs.slide_layouts[layout_idx])
    slide.shapes.title.text = title

    body = slide.placeholders[1]
    tf = body.text_frame
    tf.clear()

    for i, bullet in enumerate(bullets):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = bullet
        p.font.size = Pt(20)
        p.space_before = Pt(6)

    return slide
```

### Slide Count Guidelines

| Presentation Length | Max Slides | Minutes per Slide |
|--------------------|------------|-------------------|
| 5 minutes | 8-10 | ~0.5-0.6 |
| 15 minutes | 15-20 | ~0.75-1 |
| 30 minutes | 25-35 | ~0.85-1.2 |
| 60 minutes | 40-50 | ~1.2-1.5 |

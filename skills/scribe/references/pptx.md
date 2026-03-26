# PowerPoint (PPTX) Reference Guide

## Library: python-pptx

### Basic Presentation Operations

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor

# Create new
prs = Presentation()

# Load existing
prs = Presentation("file.pptx")

# Load from template
prs = Presentation("template.pptx")
```

### Slide Layouts

Standard layout indices (may vary by template):

| Index | Layout Name | Use Case |
|-------|-------------|----------|
| 0 | Title Slide | First slide, title + subtitle |
| 1 | Title and Content | Standard body slide |
| 2 | Section Header | Section dividers |
| 3 | Two Content | Side-by-side content |
| 4 | Comparison | Two columns with headers |
| 5 | Title Only | Custom content slide |
| 6 | Blank | Full custom layout |

```python
# Access layouts
slide_layout = prs.slide_layouts[1]  # Title and Content

# List available layouts
for i, layout in enumerate(prs.slide_layouts):
    print(f"{i}: {layout.name}")

# Add slide
slide = prs.slides.add_slide(slide_layout)
```

### Working with Placeholders

```python
slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(slide_layout)

# List placeholders
for ph in slide.placeholders:
    print(f"idx={ph.placeholder_format.idx}, name={ph.name}, type={ph.placeholder_format.type}")

# Set title
slide.placeholders[0].text = "Slide Title"

# Set body content
body = slide.placeholders[1]
tf = body.text_frame
tf.text = "First bullet point"

p = tf.add_paragraph()
p.text = "Second bullet point"
p.level = 0

p = tf.add_paragraph()
p.text = "Sub-bullet"
p.level = 1
```

### Text Formatting

```python
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Paragraph-level formatting
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
p.space_before = Pt(6)
p.space_after = Pt(6)

# Run-level formatting
run = p.runs[0]
run.font.size = Pt(24)
run.font.bold = True
run.font.italic = False
run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
run.font.name = "Calibri"

# Add formatted run
run = p.add_run()
run.text = " highlighted"
run.font.color.rgb = RGBColor(0xFF, 0xCC, 0x00)
run.font.bold = True
```

### Text Frame Properties

```python
from pptx.enum.text import MSO_ANCHOR

tf = shape.text_frame

# Auto-size
tf.auto_size = True  # or MSO_AUTO_SIZE.SHAPE_TO_FIT_TEXT

# Word wrap
tf.word_wrap = True

# Vertical alignment
tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Margins
tf.margin_left = Inches(0.1)
tf.margin_right = Inches(0.1)
tf.margin_top = Inches(0.05)
tf.margin_bottom = Inches(0.05)
```

### Shapes

```python
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE

# Add rectangle
shape = slide.shapes.add_shape(
    MSO_SHAPE.RECTANGLE,
    left=Inches(1), top=Inches(2),
    width=Inches(3), height=Inches(1)
)

# Style shape
shape.fill.solid()
shape.fill.fore_color.rgb = RGBColor(0x00, 0x33, 0x66)
shape.line.color.rgb = RGBColor(0x00, 0x00, 0x00)
shape.line.width = Pt(1)

# Add text to shape
tf = shape.text_frame
tf.text = "Shape text"
tf.paragraphs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

# Rounded rectangle
shape = slide.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE,
    left=Inches(1), top=Inches(1),
    width=Inches(2), height=Inches(0.5)
)

# Common shapes
# MSO_SHAPE.OVAL, MSO_SHAPE.TRIANGLE, MSO_SHAPE.DIAMOND
# MSO_SHAPE.RIGHT_ARROW, MSO_SHAPE.CHEVRON
# MSO_SHAPE.CALLOUT_1, MSO_SHAPE.CLOUD
```

### Images

```python
# Add image
pic = slide.shapes.add_picture(
    "image.png",
    left=Inches(1), top=Inches(1.5),
    width=Inches(4)  # height auto-calculated from aspect ratio
)

# Full-bleed background image
slide_width = prs.slide_width
slide_height = prs.slide_height
pic = slide.shapes.add_picture(
    "background.jpg",
    left=0, top=0,
    width=slide_width, height=slide_height
)
# Send to back (move to position 0 in shape tree)
sp = pic._element
sp.getparent().remove(sp)
slide.shapes._spTree.insert(2, sp)  # index 2 is after background shapes
```

### Tables

```python
rows, cols = 4, 3
table_shape = slide.shapes.add_table(
    rows, cols,
    left=Inches(1), top=Inches(2),
    width=Inches(8), height=Inches(2)
)
table = table_shape.table

# Set column widths
table.columns[0].width = Inches(3)
table.columns[1].width = Inches(2.5)
table.columns[2].width = Inches(2.5)

# Set header row
for i, text in enumerate(["Feature", "Status", "Notes"]):
    cell = table.cell(0, i)
    cell.text = text
    # Format header
    for p in cell.text_frame.paragraphs:
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(0x00, 0x33, 0x66)

# Set data
table.cell(1, 0).text = "Feature A"
table.cell(1, 1).text = "Complete"
table.cell(1, 2).text = "Shipped in v2.0"

# Merge cells
table.cell(0, 0).merge(table.cell(0, 2))
```

### Charts

```python
from pptx.chart.data import CategoryChartData, ChartData
from pptx.enum.chart import XL_CHART_TYPE

# Bar chart
chart_data = CategoryChartData()
chart_data.categories = ["Q1", "Q2", "Q3", "Q4"]
chart_data.add_series("Revenue", (100, 120, 110, 150))
chart_data.add_series("Cost", (60, 65, 62, 70))

chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    left=Inches(1), top=Inches(2),
    width=Inches(8), height=Inches(4),
    chart_data=chart_data
).chart

chart.has_legend = True
chart.legend.include_in_layout = False

# Pie chart
chart_data = CategoryChartData()
chart_data.categories = ["Product A", "Product B", "Product C"]
chart_data.add_series("Share", (45, 30, 25))

chart = slide.shapes.add_chart(
    XL_CHART_TYPE.PIE,
    left=Inches(2), top=Inches(2),
    width=Inches(6), height=Inches(4),
    chart_data=chart_data
).chart

# Line chart
chart_data = CategoryChartData()
chart_data.categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
chart_data.add_series("Users", (100, 150, 200, 180, 250, 300))

slide.shapes.add_chart(
    XL_CHART_TYPE.LINE,
    left=Inches(1), top=Inches(2),
    width=Inches(8), height=Inches(4),
    chart_data=chart_data
)
```

### Speaker Notes

```python
# Add notes
notes_slide = slide.notes_slide
notes_tf = notes_slide.notes_text_frame
notes_tf.text = "Key talking point: mention the 40% growth in Q4."

p = notes_tf.add_paragraph()
p.text = "Transition: move to competitive analysis next."
```

### Slide Masters

```python
# Access slide master
slide_master = prs.slide_masters[0]

# Access master shapes (background elements)
for shape in slide_master.shapes:
    print(f"Master shape: {shape.name}")

# The slide master controls the base look of all slides.
# To customize, modify the template file before loading.
```

### Slide Size

```python
# Standard (4:3)
prs.slide_width = Inches(10)
prs.slide_height = Inches(7.5)

# Widescreen (16:9)
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Custom
prs.slide_width = Inches(11)
prs.slide_height = Inches(8.5)
```

### Slide Transitions and Animations

python-pptx has no built-in support for transitions or animations. For those, use the OOXML approach:

```bash
python3 scripts/office/unpack.py presentation.pptx
# Edit ppt/slides/slide1.xml to add transition XML
python3 scripts/office/pack.py presentation_unpacked presentation_animated.pptx
```

### Visual Design Principles for Slides

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
1. Title slide -- topic + speaker
2. Agenda/overview -- what you will cover
3. Context -- why this matters
4. Content slides -- one idea each
5. Key takeaway -- the one thing to remember
6. Call to action -- what to do next
7. Q&A / closing

### Save

```python
prs.save("output.pptx")
```

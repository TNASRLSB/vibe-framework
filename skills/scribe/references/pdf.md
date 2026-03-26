# PDF Reference Guide

## Creation: reportlab

### Basic Document

```python
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_JUSTIFY

# Create document
doc = SimpleDocTemplate(
    "output.pdf",
    pagesize=letter,
    topMargin=1*inch,
    bottomMargin=1*inch,
    leftMargin=1.25*inch,
    rightMargin=1.25*inch,
    title="Document Title",
    author="Author Name",
)

# Build content
styles = getSampleStyleSheet()
story = []
```

### Paragraphs and Styles

```python
styles = getSampleStyleSheet()

# Use built-in styles
story.append(Paragraph("Document Title", styles["Title"]))
story.append(Paragraph("A heading", styles["Heading1"]))
story.append(Paragraph("Sub heading", styles["Heading2"]))
story.append(Paragraph("Normal body text here.", styles["Normal"]))

# Custom styles
custom_style = ParagraphStyle(
    "CustomBody",
    parent=styles["Normal"],
    fontSize=11,
    leading=14,
    spaceAfter=8,
    fontName="Helvetica",
    textColor=colors.HexColor("#333333"),
    alignment=TA_JUSTIFY,
)

story.append(Paragraph("Custom styled text.", custom_style))

# Inline formatting (HTML-like)
story.append(Paragraph(
    'This has <b>bold</b>, <i>italic</i>, and <font color="red">colored</font> text.',
    styles["Normal"]
))

# Links
story.append(Paragraph(
    'Visit <a href="https://example.com" color="blue">our website</a>.',
    styles["Normal"]
))
```

### Spacers

```python
story.append(Spacer(1, 0.25*inch))  # vertical space
story.append(PageBreak())            # new page
```

### Tables

```python
data = [
    ["Name", "Department", "Salary"],
    ["Alice", "Engineering", "$120,000"],
    ["Bob", "Marketing", "$95,000"],
    ["Carol", "Design", "$105,000"],
]

table = Table(data, colWidths=[2*inch, 2*inch, 1.5*inch])
table.setStyle(TableStyle([
    # Header row
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003366")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, 0), 11),
    ("ALIGN", (0, 0), (-1, 0), "CENTER"),

    # Data rows
    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
    ("FONTSIZE", (0, 1), (-1, -1), 10),
    ("ALIGN", (2, 1), (2, -1), "RIGHT"),  # Right-align salary column

    # Alternating row colors
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F4F8")]),

    # Borders
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
    ("LINEBELOW", (0, 0), (-1, 0), 1.5, colors.HexColor("#003366")),

    # Padding
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
]))

story.append(table)
```

### Images

```python
from reportlab.platypus import Image

img = Image("chart.png", width=4*inch, height=3*inch)
story.append(img)

# Maintain aspect ratio
img = Image("photo.jpg", width=5*inch)
img.hAlign = "CENTER"
story.append(img)
```

### Headers and Footers

```python
from reportlab.lib.pagesizes import letter

def header_footer(canvas, doc):
    canvas.saveState()
    width, height = letter

    # Header
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(doc.leftMargin, height - 0.5*inch, "Company Name")
    canvas.drawRightString(width - doc.rightMargin, height - 0.5*inch, "Confidential")

    # Header line
    canvas.setStrokeColor(colors.HexColor("#003366"))
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, height - 0.6*inch, width - doc.rightMargin, height - 0.6*inch)

    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#999999"))
    canvas.drawCentredString(width / 2, 0.5*inch, f"Page {doc.page}")

    canvas.restoreState()

# Use with build
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
```

### Bookmarks and TOC

```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

# Add bookmarks via Paragraph with bookmarkName
h1_style = ParagraphStyle(
    "BookmarkedH1",
    parent=styles["Heading1"],
    spaceAfter=12,
)

story.append(Paragraph(
    '<a name="section1"/>Section 1: Introduction',
    h1_style
))

# Table of Contents (manual)
toc_style = ParagraphStyle(
    "TOC",
    parent=styles["Normal"],
    fontSize=11,
    leading=18,
    leftIndent=20,
)

story.append(Paragraph("Table of Contents", styles["Heading1"]))
story.append(Paragraph('<a href="#section1">1. Introduction</a>', toc_style))
story.append(Paragraph('<a href="#section2">2. Methods</a>', toc_style))
story.append(Paragraph('<a href="#section3">3. Results</a>', toc_style))
story.append(PageBreak())
```

### Multi-Column Layout

```python
from reportlab.platypus import Frame, PageTemplate, BaseDocTemplate

class TwoColumnDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(self, filename, **kw)
        frame1 = Frame(
            self.leftMargin, self.bottomMargin,
            self.width/2 - 6, self.height,
            id="col1"
        )
        frame2 = Frame(
            self.leftMargin + self.width/2 + 6, self.bottomMargin,
            self.width/2 - 6, self.height,
            id="col2"
        )
        self.addPageTemplates(
            PageTemplate(id="TwoCol", frames=[frame1, frame2])
        )
```

### Build Document

```python
doc.build(story)
# or with header/footer
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
```

---

## Reading: pdfplumber

### Extract Text

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    # All pages
    for page in pdf.pages:
        text = page.extract_text()
        print(text)

    # Specific page
    page = pdf.pages[0]  # 0-indexed
    text = page.extract_text()

    # Page metadata
    print(f"Pages: {len(pdf.pages)}")
    print(f"Page size: {page.width} x {page.height}")
```

### Extract Tables

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    page = pdf.pages[0]

    # Extract all tables on page
    tables = page.extract_tables()
    for table in tables:
        for row in table:
            print(row)

    # Table settings for better extraction
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
    }
    tables = page.extract_tables(table_settings)
```

### Extract with Layout

```python
# Preserve spatial layout
text = page.extract_text(layout=True)

# Extract words with positions
words = page.extract_words()
for word in words:
    print(f"'{word['text']}' at ({word['x0']}, {word['top']})")
```

---

## Reading/Merging: PyPDF2

### Read PDF

```python
from PyPDF2 import PdfReader

reader = PdfReader("file.pdf")

# Metadata
print(reader.metadata.title)
print(reader.metadata.author)
print(f"Pages: {len(reader.pages)}")

# Extract text
for page in reader.pages:
    text = page.extract_text()
    print(text)
```

### Merge PDFs

```python
from PyPDF2 import PdfMerger

merger = PdfMerger()

merger.append("file1.pdf")
merger.append("file2.pdf")
merger.append("file3.pdf", pages=(0, 5))  # Only first 5 pages

# Insert at specific position
merger.merge(1, "insert.pdf")  # Insert after first page

merger.write("merged.pdf")
merger.close()
```

### Split PDF

```python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader("large.pdf")

# Extract specific pages
writer = PdfWriter()
writer.add_page(reader.pages[0])
writer.add_page(reader.pages[2])
writer.add_page(reader.pages[4])
writer.write("selected_pages.pdf")

# Split into individual pages
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    writer.write(f"page_{i+1}.pdf")
```

### Watermark

```python
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

# Create watermark
packet = BytesIO()
c = canvas.Canvas(packet, pagesize=letter)
c.setFont("Helvetica", 60)
c.setFillColor(colors.Color(0, 0, 0, alpha=0.1))
c.saveState()
c.translate(letter[0]/2, letter[1]/2)
c.rotate(45)
c.drawCentredString(0, 0, "CONFIDENTIAL")
c.restoreState()
c.save()
packet.seek(0)

watermark = PdfReader(packet)
watermark_page = watermark.pages[0]

# Apply to document
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark_page)
    writer.add_page(page)

writer.write("watermarked.pdf")
```

### Form Filling

```python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()

# Get form fields
fields = reader.get_fields()
for name, field in fields.items():
    print(f"Field: {name}, Type: {field.get('/FT')}, Value: {field.get('/V')}")

# Fill form
page = reader.pages[0]
writer.add_page(page)

writer.update_page_form_field_values(
    writer.pages[0],
    {
        "name_field": "John Doe",
        "date_field": "2025-01-15",
        "amount_field": "1,500.00",
    }
)

writer.write("filled_form.pdf")
```

### Encrypt/Decrypt

```python
from PyPDF2 import PdfReader, PdfWriter

# Encrypt
writer = PdfWriter()
reader = PdfReader("document.pdf")
for page in reader.pages:
    writer.add_page(page)
writer.encrypt("user_password", "owner_password")
writer.write("encrypted.pdf")

# Decrypt
reader = PdfReader("encrypted.pdf")
if reader.is_encrypted:
    reader.decrypt("password")
    text = reader.pages[0].extract_text()
```

### Set Metadata

```python
from PyPDF2 import PdfWriter

writer = PdfWriter()
# ... add pages ...

writer.add_metadata({
    "/Title": "Document Title",
    "/Author": "Author Name",
    "/Subject": "Document Subject",
    "/Creator": "Scribe - VIBE Framework",
})

writer.write("output.pdf")
```

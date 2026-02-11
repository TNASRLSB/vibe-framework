# PDF Reference (.pdf)

## Reading and Manipulation with pypdf

### Read PDF

```python
from pypdf import PdfReader

reader = PdfReader("input.pdf")

# Metadata
print(f"Pages: {len(reader.pages)}")
print(f"Title: {reader.metadata.title}")
print(f"Author: {reader.metadata.author}")

# Extract text
for page in reader.pages:
    text = page.extract_text()
    print(text)
```

### Extract Text from Specific Pages

```python
reader = PdfReader("input.pdf")

# Single page (0-indexed)
text = reader.pages[0].extract_text()

# Page range
for i in range(2, 5):  # Pages 3-5
    text = reader.pages[i].extract_text()
```

### Merge PDFs

```python
from pypdf import PdfMerger

merger = PdfMerger()
merger.append("document1.pdf")
merger.append("document2.pdf")
merger.append("document3.pdf", pages=(0, 5))  # Only first 5 pages

merger.write("merged.pdf")
merger.close()
```

### Split PDF

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")

# Extract pages 1-5
writer = PdfWriter()
for i in range(5):
    writer.add_page(reader.pages[i])
writer.write("pages_1_to_5.pdf")

# Split into individual pages
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    writer.write(f"page_{i+1}.pdf")
```

### Rotate Pages

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.rotate(90)  # 90, 180, 270
    writer.add_page(page)

writer.write("rotated.pdf")
```

### Add Watermark

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
watermark_reader = PdfReader("watermark.pdf")
watermark_page = watermark_reader.pages[0]

writer = PdfWriter()
for page in reader.pages:
    page.merge_page(watermark_page)
    writer.add_page(page)

writer.write("watermarked.pdf")
```

### Extract Images

```python
from pypdf import PdfReader

reader = PdfReader("input.pdf")
for page_num, page in enumerate(reader.pages):
    for img_idx, image in enumerate(page.images):
        with open(f"image_p{page_num}_{img_idx}.{image.name.split('.')[-1]}", "wb") as f:
            f.write(image.data)
```

### Password Protection

```python
from pypdf import PdfReader, PdfWriter

# Read encrypted PDF
reader = PdfReader("encrypted.pdf")
reader.decrypt("password")

# Encrypt a PDF
writer = PdfWriter()
writer.append_pages_from_reader(PdfReader("input.pdf"))
writer.encrypt(
    user_password="view_password",    # To open
    owner_password="edit_password",   # To edit/print
    permissions_flag=0b0100           # Read-only
)
writer.write("protected.pdf")
```

---

## Creation with reportlab

### Basic Document

```python
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import cm, inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

doc = SimpleDocTemplate("output.pdf", pagesize=A4,
                        topMargin=2*cm, bottomMargin=2*cm,
                        leftMargin=2.5*cm, rightMargin=2.5*cm)

styles = getSampleStyleSheet()
story = []

# Title
story.append(Paragraph("Document Title", styles['Title']))
story.append(Spacer(1, 12))

# Body text
story.append(Paragraph("Body text here with <b>bold</b> and <i>italic</i>.", styles['Normal']))

doc.build(story)
```

### Custom Styles

```python
custom_title = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontSize=24,
    textColor=colors.HexColor('#2F5496'),
    spaceAfter=20,
    alignment=1  # Center
)

custom_body = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=11,
    leading=16,  # Line height
    textColor=colors.HexColor('#333333'),
    spaceAfter=8,
    firstLineIndent=0
)

custom_heading = ParagraphStyle(
    'CustomH1',
    parent=styles['Heading1'],
    fontSize=18,
    textColor=colors.HexColor('#2F5496'),
    spaceBefore=16,
    spaceAfter=8,
    borderWidth=0,
    borderPadding=0,
    borderColor=None
)
```

### Tables

```python
data = [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Cell 1', 'Cell 2', 'Cell 3'],
    ['Cell 4', 'Cell 5', 'Cell 6'],
]

table = Table(data, colWidths=[5*cm, 5*cm, 5*cm])
table.setStyle(TableStyle([
    # Header row
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2F5496')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 12),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

    # Data rows
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 10),
    ('ALIGN', (0, 1), (-1, -1), 'LEFT'),

    # Grid
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F2F2F2')]),

    # Padding
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))

story.append(table)
```

### Images

```python
from reportlab.platypus import Image

img = Image('chart.png', width=14*cm, height=8*cm)
story.append(img)

# Maintain aspect ratio
from reportlab.lib.utils import ImageReader
ir = ImageReader('chart.png')
iw, ih = ir.getSize()
aspect = ih / float(iw)
target_width = 14*cm
img = Image('chart.png', width=target_width, height=target_width * aspect)
```

### Headers and Footers

```python
from reportlab.lib.pagesizes import A4

def add_header_footer(canvas, doc):
    canvas.saveState()

    # Header
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(colors.HexColor('#666666'))
    canvas.drawString(2.5*cm, A4[1] - 1.5*cm, "Document Title")
    canvas.drawRightString(A4[0] - 2.5*cm, A4[1] - 1.5*cm, "Confidential")

    # Header line
    canvas.setStrokeColor(colors.HexColor('#CCCCCC'))
    canvas.line(2.5*cm, A4[1] - 1.7*cm, A4[0] - 2.5*cm, A4[1] - 1.7*cm)

    # Footer
    canvas.setFont('Helvetica', 8)
    canvas.drawCentredString(A4[0] / 2, 1.5*cm, f"Page {doc.page}")

    canvas.restoreState()

doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
```

### Page Breaks

```python
from reportlab.platypus import PageBreak

story.append(PageBreak())
```

### Table of Contents

```python
from reportlab.platypus import TableOfContents

toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontSize=12, leftIndent=0, spaceBefore=6),
    ParagraphStyle(name='TOC2', fontSize=10, leftIndent=20, spaceBefore=3),
]
story.append(toc)
story.append(PageBreak())

# Headings must notify TOC
# Use doc.notify('TOCEntry', (level, text, pageNum)) in afterFlowable
```

---

## Form Fields

### Create Fillable PDF (reportlab)

```python
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

c = canvas.Canvas("form.pdf", pagesize=A4)

# Text field
c.acroForm.textfield(
    name='full_name',
    x=100, y=700,
    width=300, height=20,
    borderWidth=1,
    borderColor=colors.grey,
    fontSize=11
)

# Checkbox
c.acroForm.checkbox(
    name='agree',
    x=100, y=650,
    size=15,
    borderWidth=1,
    checked=False
)

# Radio buttons
for i, option in enumerate(['Option A', 'Option B', 'Option C']):
    c.acroForm.radio(
        name='choice',
        value=option,
        x=100, y=600 - i*25,
        size=12
    )
    c.drawString(120, 600 - i*25, option)

c.save()
```

### Fill Existing Form (pypdf)

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()
writer.append(reader)

writer.update_page_form_field_values(
    writer.pages[0],
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "agree": "/Yes"
    }
)

writer.write("filled_form.pdf")
```

---

## Advanced Operations

### PDF/A Compliance (Archival)

```python
# reportlab does not natively support PDF/A
# Use LibreOffice conversion for PDF/A:
python3 scripts/office/soffice.py convert document.docx pdf/a
```

### Optimize File Size

```bash
# Using qpdf (if installed)
qpdf --linearize --compress-streams=y input.pdf output.pdf

# Using Ghostscript
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=compressed.pdf input.pdf
```

**PDFSETTINGS options:**
- `/screen` — 72 dpi (smallest, low quality)
- `/ebook` — 150 dpi (good for screen reading)
- `/printer` — 300 dpi (good for printing)
- `/prepress` — 300 dpi (highest quality, color preservation)

### Add Bookmarks

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
writer.append(reader)

# Add outline/bookmarks
writer.add_outline_item("Chapter 1", 0)  # Page 1
writer.add_outline_item("Chapter 2", 5)  # Page 6
sub = writer.add_outline_item("Section 2.1", 6, parent=writer.outline[-1])

writer.write("bookmarked.pdf")
```

### Stamp/Overlay

```python
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from io import BytesIO

# Create stamp
packet = BytesIO()
c = canvas.Canvas(packet, pagesize=A4)
c.setFont("Helvetica", 48)
c.setFillColor(colors.Color(1, 0, 0, alpha=0.3))  # Semi-transparent red
c.rotate(45)
c.drawString(200, 100, "DRAFT")
c.save()
packet.seek(0)

# Apply stamp
stamp = PdfReader(packet)
reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(stamp.pages[0])
    writer.add_page(page)

writer.write("stamped.pdf")
```

---

## Common Patterns

### PDF from HTML (via LibreOffice)

```bash
# Convert HTML to PDF
python3 scripts/office/soffice.py convert page.html pdf
```

### Batch Processing

```python
import glob
from pypdf import PdfMerger

# Merge all PDFs in a directory
merger = PdfMerger()
for pdf_file in sorted(glob.glob("reports/*.pdf")):
    merger.append(pdf_file)
merger.write("all_reports.pdf")
merger.close()
```

### Extract Metadata

```python
reader = PdfReader("input.pdf")
meta = reader.metadata

info = {
    "title": meta.title,
    "author": meta.author,
    "subject": meta.subject,
    "creator": meta.creator,
    "producer": meta.producer,
    "pages": len(reader.pages),
    "encrypted": reader.is_encrypted
}
```

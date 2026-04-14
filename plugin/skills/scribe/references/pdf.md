# PDF — Gotchas & Non-Obvious Patterns

Standard ReportLab, pdfplumber, and PyPDF2 operations are not included — you already know them. This file covers only patterns that are error-prone or require non-obvious techniques.

## Headers & Footers — saveState/restoreState

The canvas is shared state. Any font, color, or transform you set in a header/footer callback will bleed into subsequent content unless you bracket with saveState/restoreState.

```python
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
```

Use separate callbacks for different page treatments:

```python
doc.build(story, onFirstPage=first_page_handler, onLaterPages=later_pages_handler)
```

If you pass the same function to both, every page gets the same header/footer. Use `onFirstPage` for a cover page with no header, and `onLaterPages` for the running header/footer.

## Bookmark Anchors & Manual TOC Linking

ReportLab has no automatic TOC generation. You must plant anchor tags and link to them manually.

```python
# Plant anchor at the heading
story.append(Paragraph(
    '<a name="section1"/>Section 1: Introduction',
    styles["Heading1"]
))

# Build TOC entries that link to anchors
toc_style = ParagraphStyle(
    "TOC",
    parent=styles["Normal"],
    fontSize=11,
    leading=18,
    leftIndent=20,
)
story.append(Paragraph('<a href="#section1">1. Introduction</a>', toc_style))
story.append(Paragraph('<a href="#section2">2. Methods</a>', toc_style))
```

The `<a name="..."/>` must be self-closing and appear inside a Paragraph flowable. It will not work as a standalone element or outside Paragraph markup.

## Multi-Column Layout

SimpleDocTemplate does not support multi-column layout. You must use BaseDocTemplate with explicit Frame objects.

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

The `- 6` gap is the gutter between columns (in points). Content flows from frame1 to frame2 automatically. When frame2 fills, a new page is created.

## Watermark (BytesIO Canvas + Merge)

Create the watermark as an in-memory PDF, then merge it onto each page:

```python
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from io import BytesIO

# Create watermark in memory
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

# Merge onto each page
watermark = PdfReader(packet)
watermark_page = watermark.pages[0]

reader = PdfReader("document.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.merge_page(watermark_page)
    writer.add_page(page)
writer.write("watermarked.pdf")
```

Key details: `packet.seek(0)` is required after `c.save()` or PdfReader gets an empty stream. The `saveState/restoreState` around translate+rotate prevents the transform from affecting anything else if you add more drawing commands.

## Form Filling — update_page_form_field_values

```python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()

# Discover field names and types first
fields = reader.get_fields()
for name, field in fields.items():
    print(f"Field: {name}, Type: {field.get('/FT')}, Value: {field.get('/V')}")

# Fill: add page first, then update fields on the writer's copy
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

The method must be called on `writer.pages[0]` (the writer's copy), not on the reader's page object. Calling it on the reader page silently does nothing.

## Metadata — Slash-Prefix Keys

PyPDF2 metadata keys require a leading slash. Omitting it silently drops the metadata.

```python
writer.add_metadata({
    "/Title": "Document Title",
    "/Author": "Author Name",
    "/Subject": "Document Subject",
    "/Creator": "Scribe - VIBE Framework",
})
```

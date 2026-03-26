# Word (DOCX) Reference Guide

## Library: python-docx

### Basic Document Operations

```python
from docx import Document
from docx.shared import Inches, Pt, Cm, Emu, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT

# Create new
doc = Document()

# Load existing
doc = Document("file.docx")
```

### Paragraph Styles

```python
# Add heading
doc.add_heading("Document Title", level=0)
doc.add_heading("Section Heading", level=1)
doc.add_heading("Subsection", level=2)

# Add paragraph with style
p = doc.add_paragraph("Normal text here.")
p = doc.add_paragraph("A list item", style="List Bullet")
p = doc.add_paragraph("Numbered item", style="List Number")
p = doc.add_paragraph("A quote", style="Quote")
```

### Run-Level Formatting

```python
p = doc.add_paragraph()

# Bold text
run = p.add_run("Bold text ")
run.bold = True

# Italic text
run = p.add_run("italic text ")
run.italic = True

# Colored text
run = p.add_run("colored text ")
run.font.color.rgb = RGBColor(0x00, 0x66, 0xCC)

# Font size
run = p.add_run("large text")
run.font.size = Pt(14)

# Font name
run = p.add_run("monospace")
run.font.name = "Courier New"

# Underline
run = p.add_run("underlined")
run.underline = True

# Subscript / Superscript
run = p.add_run("2")
run.font.subscript = True
```

### Paragraph Formatting

```python
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING

p = doc.add_paragraph("Formatted paragraph")

# Alignment
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

# Spacing
p.paragraph_format.space_before = Pt(12)
p.paragraph_format.space_after = Pt(6)
p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE

# Indentation
p.paragraph_format.left_indent = Inches(0.5)
p.paragraph_format.first_line_indent = Inches(0.25)

# Keep with next (prevent page break between this and next paragraph)
p.paragraph_format.keep_with_next = True
```

### Tables

```python
# Create table
table = doc.add_table(rows=3, cols=4, style="Light Shading Accent 1")

# Set header
hdr_cells = table.rows[0].cells
hdr_cells[0].text = "Name"
hdr_cells[1].text = "Department"
hdr_cells[2].text = "Role"
hdr_cells[3].text = "Salary"

# Set data
row_cells = table.rows[1].cells
row_cells[0].text = "John Doe"
row_cells[1].text = "Engineering"
row_cells[2].text = "Senior Dev"
row_cells[3].text = "$120,000"

# Table-wide formatting
table.alignment = WD_TABLE_ALIGNMENT.CENTER

# Cell formatting
from docx.oxml.ns import qn

cell = table.cell(0, 0)
cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

# Set column widths
for row in table.rows:
    row.cells[0].width = Inches(2.0)
    row.cells[1].width = Inches(1.5)
    row.cells[2].width = Inches(1.5)
    row.cells[3].width = Inches(1.5)

# Merge cells
table.cell(0, 0).merge(table.cell(0, 1))

# Add row
row = table.add_row()
row.cells[0].text = "New data"
```

### Built-in Table Styles

Common styles that work well:
- `"Table Grid"` -- simple grid borders
- `"Light Shading Accent 1"` -- alternating row shading
- `"Medium Shading 1 Accent 1"` -- header highlighted
- `"Light List Accent 1"` -- clean list style
- `"Light Grid Accent 1"` -- subtle grid

### Images

```python
# Add image
doc.add_picture("image.png", width=Inches(4.0))

# Add image inline
p = doc.add_paragraph()
run = p.add_run()
run.add_picture("logo.png", width=Inches(1.5))
```

### Headers and Footers

```python
section = doc.sections[0]

# Header
header = section.header
header.is_linked_to_previous = False
p = header.paragraphs[0]
p.text = "Company Name"
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p.style = doc.styles["Header"]

# Footer with page numbers
footer = section.footer
footer.is_linked_to_previous = False
p = footer.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add page number field
from docx.oxml.ns import qn
run = p.add_run()
fldChar = run._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "begin"})
run._element.append(fldChar)
run = p.add_run()
instrText = run._element.makeelement(qn("w:instrText"), {})
instrText.text = " PAGE "
run._element.append(instrText)
run = p.add_run()
fldChar = run._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "end"})
run._element.append(fldChar)

# Different first page header
section.different_first_page_header_footer = True
first_header = section.first_page_header
first_header.paragraphs[0].text = "Cover Page Header"
```

### Table of Contents

python-docx cannot generate TOC entries automatically. Insert a TOC field that Word/LibreOffice will populate:

```python
from docx.oxml.ns import qn

paragraph = doc.add_paragraph()
run = paragraph.add_run()

# TOC field code
fldChar_begin = run._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "begin"})
run._element.append(fldChar_begin)

run2 = paragraph.add_run()
instrText = run2._element.makeelement(qn("w:instrText"), {qn("xml:space"): "preserve"})
instrText.text = ' TOC \\o "1-3" \\h \\z \\u '
run2._element.append(instrText)

run3 = paragraph.add_run()
fldChar_end = run3._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "end"})
run3._element.append(fldChar_end)
```

Then update fields via LibreOffice:
```bash
python3 scripts/office/soffice.py macro file.docx UpdateFields
```

### Sections and Page Setup

```python
from docx.enum.section import WD_ORIENT

section = doc.sections[0]

# Page size (Letter)
section.page_width = Inches(8.5)
section.page_height = Inches(11)

# Margins
section.top_margin = Inches(1.0)
section.bottom_margin = Inches(1.0)
section.left_margin = Inches(1.25)
section.right_margin = Inches(1.25)

# Landscape orientation
section.orientation = WD_ORIENT.LANDSCAPE
# Swap width/height for landscape
section.page_width, section.page_height = section.page_height, section.page_width

# Add section break (new page)
from docx.enum.section import WD_SECTION
new_section = doc.add_section(WD_SECTION.NEW_PAGE)
```

### Custom Styles

```python
from docx.shared import Pt, RGBColor
from docx.enum.style import WD_STYLE_TYPE

# Create custom paragraph style
style = doc.styles.add_style("CustomHeading", WD_STYLE_TYPE.PARAGRAPH)
style.font.size = Pt(16)
style.font.bold = True
style.font.color.rgb = RGBColor(0x00, 0x33, 0x66)
style.paragraph_format.space_before = Pt(18)
style.paragraph_format.space_after = Pt(6)

# Use custom style
doc.add_paragraph("Custom styled heading", style="CustomHeading")

# Modify existing style
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)
```

### Tracked Changes

python-docx has limited tracked changes support. For reading tracked changes:

```python
from docx.oxml.ns import qn

# Find insertions
for p in doc.paragraphs:
    for run in p.runs:
        parent = run._element.getparent()
        if parent.tag == qn("w:ins"):
            author = parent.get(qn("w:author"))
            date = parent.get(qn("w:date"))
            print(f"Insertion by {author} on {date}: {run.text}")

# Find deletions
for p in doc.paragraphs:
    for elem in p._element.iter():
        if elem.tag == qn("w:del"):
            author = elem.get(qn("w:author"))
            deleted_text = "".join(
                t.text for t in elem.iter(qn("w:delText")) if t.text
            )
            print(f"Deletion by {author}: {deleted_text}")
```

For creating tracked changes, use the OOXML unpack approach:
```bash
python3 scripts/office/unpack.py file.docx --output file_unpacked
# Edit word/document.xml directly to add w:ins / w:del elements
python3 scripts/office/pack.py file_unpacked file_edited.docx
```

### Mail Merge Pattern

```python
# Simple find-and-replace mail merge
def mail_merge(template_path, output_path, fields):
    """Replace {{field}} placeholders with values."""
    doc = Document(template_path)

    for p in doc.paragraphs:
        for key, value in fields.items():
            placeholder = "{{" + key + "}}"
            if placeholder in p.text:
                for run in p.runs:
                    if placeholder in run.text:
                        run.text = run.text.replace(placeholder, str(value))

    # Also replace in tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for key, value in fields.items():
                        placeholder = "{{" + key + "}}"
                        if placeholder in p.text:
                            for run in p.runs:
                                if placeholder in run.text:
                                    run.text = run.text.replace(placeholder, str(value))

    doc.save(output_path)

# Usage
mail_merge("template.docx", "output.docx", {
    "name": "John Doe",
    "date": "2025-01-15",
    "company": "Acme Corp",
})
```

### Save

```python
doc.save("output.docx")
```

### Common Document Templates

**Letter:**
- Company letterhead (header with logo)
- Date, recipient address
- Salutation, body paragraphs
- Closing, signature block

**Report:**
- Title page (level 0 heading, author, date)
- Table of contents
- Executive summary
- Sections with headings (level 1-3)
- Tables and figures
- Appendix

**Memo:**
- TO / FROM / DATE / SUBJECT block
- Body paragraphs
- No formal closing

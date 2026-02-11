# Word Reference (.docx)

## Creation with python-docx

### Basic Structure

```python
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

doc = Document()

# Metadata
doc.core_properties.title = "Document Title"
doc.core_properties.author = "Author Name"

# Content
doc.add_heading("Main Title", level=0)
doc.add_paragraph("Body text here.")

doc.save("output.docx")
```

### Styles (Always Prefer Over Inline Formatting)

```python
# Use built-in styles
doc.add_heading("Section Title", level=1)  # Uses Heading 1 style
p = doc.add_paragraph("Normal text", style="Normal")

# Modify existing style
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)
style.paragraph_format.space_after = Pt(6)
style.paragraph_format.line_spacing = 1.15

# Create custom style
custom = doc.styles.add_style('CustomBody', WD_STYLE_TYPE.PARAGRAPH)
custom.base_style = doc.styles['Normal']
custom.font.size = Pt(10)
custom.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
```

**Rule: Never use inline formatting (runs with direct font changes) when a style achieves the same result.** Styles ensure consistency and allow global changes.

### Paragraphs and Runs

```python
p = doc.add_paragraph()

# Multiple runs with different formatting
run1 = p.add_run("Bold text. ")
run1.bold = True

run2 = p.add_run("Italic text. ")
run2.italic = True

run3 = p.add_run("Normal text.")

# Paragraph formatting
p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p.paragraph_format.first_line_indent = Cm(1.27)
p.paragraph_format.space_before = Pt(6)
p.paragraph_format.space_after = Pt(6)
```

---

## Tables

```python
from docx.enum.table import WD_TABLE_ALIGNMENT

table = doc.add_table(rows=3, cols=4, style='Table Grid')
table.alignment = WD_TABLE_ALIGNMENT.CENTER

# Header row
hdr_cells = table.rows[0].cells
hdr_cells[0].text = 'Column 1'
hdr_cells[1].text = 'Column 2'

# Style header
for cell in table.rows[0].cells:
    for paragraph in cell.paragraphs:
        for run in paragraph.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    cell._element.get_or_add_tcPr().append(
        parse_xml(f'<w:shd {nsdecls("w")} w:fill="2F5496"/>')
    )

# Set column widths
for row in table.rows:
    row.cells[0].width = Inches(2)
    row.cells[1].width = Inches(3)
```

### Merge Cells

```python
cell_a = table.cell(0, 0)
cell_b = table.cell(0, 1)
cell_a.merge(cell_b)
```

---

## Table of Contents

python-docx cannot generate a TOC natively. Use a TOC field code + LibreOffice to update:

```python
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

paragraph = doc.add_paragraph()
run = paragraph.add_run()
fldChar = OxmlElement('w:fldChar')
fldChar.set(qn('w:fldCharType'), 'begin')
run._r.append(fldChar)

run2 = paragraph.add_run()
instrText = OxmlElement('w:instrText')
instrText.set(qn('xml:space'), 'preserve')
instrText.text = ' TOC \\o "1-3" \\h \\z \\u '
run2._r.append(instrText)

run3 = paragraph.add_run()
fldChar2 = OxmlElement('w:fldChar')
fldChar2.set(qn('w:fldCharType'), 'end')
run3._r.append(fldChar2)
```

Then update via LibreOffice:
```bash
python3 scripts/office/soffice.py macro output.docx "UpdateFields"
```

---

## Headers and Footers

```python
section = doc.sections[0]

# Header
header = section.header
header.is_linked_to_previous = False
hp = header.paragraphs[0]
hp.text = "Document Title"
hp.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Footer with page numbers
footer = section.footer
footer.is_linked_to_previous = False
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add page number field
run = fp.add_run()
fldChar = OxmlElement('w:fldChar')
fldChar.set(qn('w:fldCharType'), 'begin')
run._r.append(fldChar)

run2 = fp.add_run()
instrText = OxmlElement('w:instrText')
instrText.text = ' PAGE '
run2._r.append(instrText)

run3 = fp.add_run()
fldChar2 = OxmlElement('w:fldChar')
fldChar2.set(qn('w:fldCharType'), 'end')
run3._r.append(fldChar2)
```

---

## Page Setup

```python
from docx.enum.section import WD_ORIENT

section = doc.sections[0]
section.page_width = Cm(21)       # A4
section.page_height = Cm(29.7)
section.orientation = WD_ORIENT.PORTRAIT

# Margins
section.top_margin = Cm(2.54)
section.bottom_margin = Cm(2.54)
section.left_margin = Cm(3.17)
section.right_margin = Cm(3.17)

# Columns
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml
sectPr = section._sectPr
cols = parse_xml(f'<w:cols {nsdecls("w")} w:num="2" w:space="720"/>')
sectPr.append(cols)
```

---

## Images

```python
doc.add_picture('image.png', width=Inches(4.5))

# Centered image
last_paragraph = doc.paragraphs[-1]
last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Image with caption
doc.add_picture('chart.png', width=Inches(5))
caption = doc.add_paragraph('Figure 1: Revenue Growth', style='Caption')
caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
```

---

## Tracked Changes (OOXML Editing)

python-docx does not support tracked changes. Use OOXML editing:

```bash
# Unpack
python3 scripts/office/unpack.py document.docx

# Edit word/document.xml to add revision marks
# Then repack
python3 scripts/office/pack.py unpacked_document/ document_edited.docx
```

### Tracked Change XML Structure

**Insertion:**
```xml
<w:ins w:id="1" w:author="Author" w:date="2024-01-15T10:00:00Z">
  <w:r>
    <w:t>inserted text</w:t>
  </w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="Author" w:date="2024-01-15T10:00:00Z">
  <w:r>
    <w:delText>deleted text</w:delText>
  </w:r>
</w:del>
```

**Format change:**
```xml
<w:rPrChange w:id="3" w:author="Author" w:date="2024-01-15T10:00:00Z">
  <w:rPr>
    <!-- original formatting -->
  </w:rPr>
</w:rPrChange>
```

### Comments

```xml
<!-- In word/comments.xml -->
<w:comment w:id="1" w:author="Author" w:date="2024-01-15T10:00:00Z">
  <w:p>
    <w:r><w:t>Comment text here</w:t></w:r>
  </w:p>
</w:comment>

<!-- In word/document.xml, mark the commented range -->
<w:commentRangeStart w:id="1"/>
<w:r><w:t>commented text</w:t></w:r>
<w:commentRangeEnd w:id="1"/>
<w:r>
  <w:rPr><w:rStyle w:val="CommentReference"/></w:rPr>
  <w:commentReference w:id="1"/>
</w:r>
```

---

## Redlining (Legal Document Comparison)

For comparing two document versions and generating redlined output:

```bash
# Use LibreOffice macro for document comparison
python3 scripts/office/soffice.py compare original.docx modified.docx redlined.docx
```

**Manual OOXML approach:**
1. Unpack both documents
2. Diff the `word/document.xml` files
3. Wrap additions in `<w:ins>` and deletions in `<w:del>`
4. Repack into new document

---

## Lists

```python
# Bullet list
doc.add_paragraph("First item", style='List Bullet')
doc.add_paragraph("Second item", style='List Bullet')

# Numbered list
doc.add_paragraph("Step one", style='List Number')
doc.add_paragraph("Step two", style='List Number')

# Nested list (indent level)
p = doc.add_paragraph("Sub-item", style='List Bullet 2')
```

---

## Sections and Page Breaks

```python
# Page break
doc.add_page_break()

# Section break (new page)
from docx.enum.section import WD_SECTION_START
new_section = doc.add_section(WD_SECTION_START.NEW_PAGE)

# Section break (continuous - for column changes)
new_section = doc.add_section(WD_SECTION_START.CONTINUOUS)
```

---

## Common Patterns

### Document from Template

```python
doc = Document('template.docx')  # Start from template
# Template preserves: styles, headers, footers, page setup

# Find and replace placeholder text
for paragraph in doc.paragraphs:
    if '{{COMPANY_NAME}}' in paragraph.text:
        for run in paragraph.runs:
            run.text = run.text.replace('{{COMPANY_NAME}}', 'Acme Corp')
```

### Hyperlinks

```python
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def add_hyperlink(paragraph, url, text):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)

    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)

    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    rStyle = OxmlElement('w:rStyle')
    rStyle.set(qn('w:val'), 'Hyperlink')
    rPr.append(rStyle)
    new_run.append(rPr)
    new_run.text = text

    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
```

### Export to PDF

```bash
python3 scripts/office/soffice.py convert output.docx pdf
# Produces output.pdf
```

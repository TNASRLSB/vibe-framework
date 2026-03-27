# DOCX — Gotchas & Non-Obvious Patterns

Standard python-docx operations are not included — you already know them. This file covers only patterns that are error-prone or require raw OOXML manipulation.

## Page Number Field (Raw OOXML)

python-docx has no high-level API for page number fields. You must construct the three-part field sequence manually:

```python
from docx.oxml.ns import qn

p = footer.paragraphs[0]

# 1. Begin field char
run = p.add_run()
fldChar = run._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "begin"})
run._element.append(fldChar)

# 2. Instruction text
run = p.add_run()
instrText = run._element.makeelement(qn("w:instrText"), {})
instrText.text = " PAGE "
run._element.append(instrText)

# 3. End field char
run = p.add_run()
fldChar = run._element.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "end"})
run._element.append(fldChar)
```

The same three-part pattern (begin, instrText, end) applies to any Word field code — NUMPAGES, DATE, FILENAME, etc.

## Table of Contents Field + UpdateFields

python-docx cannot generate TOC entries. You insert a TOC field code and then force an external update.

```python
from docx.oxml.ns import qn

paragraph = doc.add_paragraph()
run = paragraph.add_run()

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

The TOC will be empty until fields are updated. Use the project's soffice macro:

```bash
python3 scripts/office/soffice.py macro file.docx UpdateFields
```

Without this step the TOC renders as blank in the output file.

## Tracked Changes via Raw OOXML

python-docx has limited tracked changes support. Reading requires direct OOXML element inspection.

### Reading Insertions

```python
from docx.oxml.ns import qn

for p in doc.paragraphs:
    for run in p.runs:
        parent = run._element.getparent()
        if parent.tag == qn("w:ins"):
            author = parent.get(qn("w:author"))
            date = parent.get(qn("w:date"))
            print(f"Insertion by {author} on {date}: {run.text}")
```

### Reading Deletions

Deleted text lives in `w:delText` elements, not `w:t`. The standard `run.text` property will not return it.

```python
for p in doc.paragraphs:
    for elem in p._element.iter():
        if elem.tag == qn("w:del"):
            author = elem.get(qn("w:author"))
            deleted_text = "".join(
                t.text for t in elem.iter(qn("w:delText")) if t.text
            )
            print(f"Deletion by {author}: {deleted_text}")
```

### Creating Tracked Changes (Unpack/Repack)

python-docx cannot create tracked change markup. Unpack the docx, edit the raw XML, and repack:

```bash
python3 scripts/office/unpack.py file.docx --output file_unpacked
# Edit word/document.xml to add w:ins / w:del elements
python3 scripts/office/pack.py file_unpacked file_edited.docx
```

## Mail Merge — Split-Run Caveat

The critical gotcha: Word splits text across multiple runs for spelling, formatting, and language reasons. A placeholder like `{{name}}` may be stored as three runs: `{{`, `name`, `}}`. Checking `run.text` for the full placeholder will miss it.

You must check at the **paragraph level** first, then reconstruct runs:

```python
def mail_merge(template_path, output_path, fields):
    """Replace {{field}} placeholders, handling split runs."""
    doc = Document(template_path)

    for p in doc.paragraphs:
        for key, value in fields.items():
            placeholder = "{{" + key + "}}"
            if placeholder in p.text:
                # Rebuild: concatenate all run texts, replace, put into first run, clear rest
                full_text = "".join(run.text for run in p.runs)
                full_text = full_text.replace(placeholder, str(value))
                for i, run in enumerate(p.runs):
                    run.text = full_text if i == 0 else ""

    # Tables have the same problem — cells contain paragraphs with split runs
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for key, value in fields.items():
                        placeholder = "{{" + key + "}}"
                        if placeholder in p.text:
                            full_text = "".join(run.text for run in p.runs)
                            full_text = full_text.replace(placeholder, str(value))
                            for i, run in enumerate(p.runs):
                                run.text = full_text if i == 0 else ""

    doc.save(output_path)
```

Note: collapsing into the first run loses per-run formatting. If preserving mixed formatting matters, you need a more surgical approach that locates which runs contain placeholder fragments and only modifies those.

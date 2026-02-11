---
name: scribe
description: "Create, read, edit Office documents and PDFs. Use when user wants to: create/edit .xlsx spreadsheets (formulas, financial models, data analysis); create/edit .docx Word documents (tracked changes, TOC, formatting); create/edit .pptx presentations (slide design, visual quality); create/read/merge .pdf files (extract, forms, watermarks). Triggers on file extensions, 'spreadsheet', 'Excel', 'Word', 'PowerPoint', 'presentation', 'PDF', 'document'. NOT for Google Sheets/Docs/Slides API."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Scribe — Document Creation

## Purpose

Unified skill for creating, reading, and editing Office documents (xlsx, docx, pptx) and PDFs. Automatic routing by file type.

---

## Routing

Determine the target format and load the corresponding reference:

| Input | Reference |
|-------|-----------|
| `.xlsx`, `.csv`, `.tsv`, spreadsheet, Excel | Read `references/xlsx.md` |
| `.docx`, Word, document | Read `references/docx.md` |
| `.pptx`, PowerPoint, presentation, slides | Read `references/pptx.md` |
| `.pdf`, PDF | Read `references/pdf.md` |

**If multiple formats are involved** (e.g., "convert this PDF to Word"), load both references.

---

## Common Principles

### 1. Zero-Error Output

Every generated document MUST:
- Open without errors in the target application (Excel, Word, PowerPoint, Acrobat)
- Preserve all formatting when re-opened
- Pass schema validation (for OOXML formats)

**Validation workflow:**
1. Generate the document
2. Run `python3 scripts/office/validate.py <file>` for OOXML formats
3. If validation fails, fix and regenerate
4. Never deliver an invalid document

### 2. Preserve Templates

When editing existing documents:
- Read the entire document structure before modifying
- Preserve styles, themes, and formatting not being changed
- Maintain tracked changes history in Word
- Keep formula references intact in Excel
- Preserve slide masters and layouts in PowerPoint

### 3. Professional Output

- Use consistent typography and spacing
- Apply color coding purposefully (not decoratively)
- Ensure print-readiness (margins, page breaks, headers/footers)
- Include metadata (title, author, creation date) when appropriate

### 4. File Size Awareness

- Compress images before embedding
- Remove unused styles and themes
- For Excel: avoid volatile formulas when possible
- For PowerPoint: optimize media assets

---

## Available Scripts

All scripts support `--help` for usage details. Output is JSON (parseable).

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/recalc.py` | Recalculate Excel formulas via LibreOffice | `python3 scripts/recalc.py <file.xlsx>` |
| `scripts/office/unpack.py` | Extract OOXML into editable folder | `python3 scripts/office/unpack.py <file>` |
| `scripts/office/pack.py` | Repackage OOXML with validation | `python3 scripts/office/pack.py <folder> <output>` |
| `scripts/office/validate.py` | Validate OOXML schema, auto-repair common issues | `python3 scripts/office/validate.py <file>` |
| `scripts/office/soffice.py` | LibreOffice headless wrapper (convert, print, macro) | `python3 scripts/office/soffice.py <command> <file>` |
| `scripts/thumbnail.py` | Generate slide preview as PNG image | `python3 scripts/thumbnail.py <file.pptx> [slide_num]` |

**Exit codes:** 0 = success, 1 = user error, 2 = system error (missing dependency).

---

## Dependency Check

Before first use, verify dependencies are installed:

```bash
# Python packages
python3 -c "import openpyxl; import reportlab; import pypdf" 2>&1 || echo "Missing: pip install openpyxl reportlab pypdf"

# LibreOffice (for recalc, thumbnail, conversion)
which soffice || echo "Missing: install LibreOffice"
```

**Required for specific formats:**

| Format | Required | Optional |
|--------|----------|----------|
| xlsx | openpyxl, pandas | LibreOffice (for recalc) |
| docx | python-docx | LibreOffice (for PDF export) |
| pptx | python-pptx | LibreOffice (for thumbnails) |
| pdf | reportlab (create), pypdf (read/merge) | qpdf (optimize) |

---

## OOXML Editing Workflow

For complex edits to docx/pptx that python-docx/python-pptx cannot handle:

```
1. Unpack:   python3 scripts/office/unpack.py document.docx
2. Edit:     Modify XML files directly in the unpacked folder
3. Validate: python3 scripts/office/validate.py unpacked_folder/
4. Pack:     python3 scripts/office/pack.py unpacked_folder/ document_edited.docx
```

**When to use OOXML editing:**
- Tracked changes with complex revision marks
- Custom XML parts or content controls
- Slide master/layout modifications
- Features not exposed by python-docx/python-pptx

**When NOT to use OOXML editing:**
- Simple text replacement (use python-docx/python-pptx directly)
- Creating new documents from scratch
- Basic formatting changes

---

## Format-Specific Quick Reference

### Excel (.xlsx)
- **Create**: openpyxl for structure + formulas, pandas for data-heavy
- **Formulas**: Write as strings (`=SUM(A1:A10)`), recalc with LibreOffice
- **Styling**: Named styles > inline styles. Color code: green=positive, red=negative
- **Charts**: openpyxl charts or export data + generate separately
- Full guide: `references/xlsx.md`

### Word (.docx)
- **Create**: python-docx for clean documents
- **Edit**: python-docx for simple edits, OOXML for tracked changes
- **TOC**: Insert TOC field, update via LibreOffice macro
- **Styles**: Use document styles, never inline formatting
- Full guide: `references/docx.md`

### PowerPoint (.pptx)
- **Create**: python-pptx for programmatic, OOXML for design-heavy
- **Design**: Follow slide master, max 6 elements per slide
- **Text**: Max 6 bullet points, 6 words each (6x6 rule)
- **Visual QA**: Generate thumbnail, verify layout before delivery
- Full guide: `references/pptx.md`

### PDF (.pdf)
- **Create**: reportlab for programmatic generation
- **Read**: pypdf for text extraction, page manipulation
- **Merge/Split**: pypdf for combining or splitting documents
- **Forms**: reportlab for form fields, pypdf for filling
- Full guide: `references/pdf.md`

---

## Integration with Other Skills

| Skill | When | How |
|-------|------|-----|
| **Ghostwriter** | Document needs persuasive content, SEO-optimized text | Delegate content writing, receive text, embed in document |
| **Seurat** | Presentation needs design system alignment | Consult design tokens for colors, typography, spacing |
| **Emmet** | Validating generated documents | Use static analysis to verify output quality |
| **Baptist** | Creating reports for CRO analysis | Generate formatted Excel/PDF reports from CRO data |

---

## Error Recovery

| Problem | Solution |
|---------|----------|
| OOXML validation fails | Run `validate.py --repair` to auto-fix common issues |
| Formula shows #REF! | Check cell references, run `recalc.py` to verify |
| Fonts missing in output | Use system-safe fonts (Arial, Calibri, Times New Roman) |
| File won't open | Verify with `validate.py`, check for corrupted XML |
| LibreOffice not found | Scripts degrade gracefully; use Python-only alternatives |
| Large file (>50MB) | Compress images, remove unused elements, consider splitting |

---

## Templates

| Template | Location | Purpose |
|----------|----------|---------|
| Financial Model | `templates/financial-model.md` | Structure for Excel financial models with standard sheets |

---

## Operational Notes

- Always read an existing document before editing it
- For Excel: never claim formulas work without running recalc
- For Word: preserve revision history unless explicitly asked to accept all
- For PowerPoint: check slide count and layout before adding content
- For PDF: verify page count and orientation after merge operations
- When in doubt about format support, check the reference file first

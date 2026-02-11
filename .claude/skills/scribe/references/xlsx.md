# Excel Reference (.xlsx / .csv / .tsv)

## Creation with openpyxl

### Basic Structure

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter

wb = Workbook()
ws = wb.active
ws.title = "Sheet Name"

# Write data
ws['A1'] = "Header"
ws['A2'] = 42

# Save
wb.save("output.xlsx")
```

### Formulas

Write formulas as strings. They are NOT calculated by openpyxl — they evaluate when the file is opened in Excel or recalculated via LibreOffice.

```python
ws['B10'] = '=SUM(B2:B9)'
ws['C5'] = '=IF(A5>0, A5*B5, 0)'
ws['D3'] = '=VLOOKUP(A3, Sheet2!A:B, 2, FALSE)'
```

**Recalculation:**
```bash
python3 scripts/recalc.py output.xlsx
# Returns JSON: {"status": "success", "total_formulas": 42, "total_errors": 0, "errors": []}
```

**Common formula pitfalls:**
- Circular references: LibreOffice handles iterative calc, but flag them
- Volatile formulas (NOW, TODAY, RAND): recalculate on every open, avoid in large sheets
- Array formulas: use `ws.formula_attributes['A1'] = {'t': 'array', 'ref': 'A1:A10'}`
- Named ranges: define before referencing in formulas

### Named Ranges

```python
from openpyxl.workbook.defined_name import DefinedName

ref = "Sheet1!$A$1:$A$10"
defn = DefinedName("revenue_data", attr_text=ref)
wb.defined_names.add(defn)
```

### Data Validation

```python
from openpyxl.worksheet.datavalidation import DataValidation

dv = DataValidation(type="list", formula1='"Yes,No,Maybe"', allow_blank=True)
dv.error = "Please select from the list"
dv.errorTitle = "Invalid input"
ws.add_data_validation(dv)
dv.add(ws['B2:B100'])
```

---

## Styling

### Named Styles (Preferred)

```python
from openpyxl.styles import NamedStyle

header_style = NamedStyle(name="header")
header_style.font = Font(bold=True, size=12, color="FFFFFF")
header_style.fill = PatternFill("solid", fgColor="2F5496")
header_style.alignment = Alignment(horizontal="center", vertical="center")
header_style.border = Border(
    bottom=Side(style="medium", color="000000")
)
wb.add_named_style(header_style)

# Apply
ws['A1'].style = "header"
```

### Financial Color Coding

| Purpose | Color | Hex |
|---------|-------|-----|
| Positive values | Dark green | `006100` |
| Negative values | Dark red | `9C0006` |
| Headers | Dark blue on white | `2F5496` |
| Input cells | Light yellow background | `FFF2CC` |
| Calculated cells | Light gray background | `F2F2F2` |
| Totals row | Bold, top border | — |

### Conditional Formatting

```python
from openpyxl.formatting.rule import CellIsRule

red_fill = PatternFill(start_color='FFC7CE', end_color='FFC7CE', fill_type='solid')
green_fill = PatternFill(start_color='C6EFCE', end_color='C6EFCE', fill_type='solid')

ws.conditional_formatting.add('B2:B100',
    CellIsRule(operator='lessThan', formula=['0'], fill=red_fill))
ws.conditional_formatting.add('B2:B100',
    CellIsRule(operator='greaterThan', formula=['0'], fill=green_fill))
```

### Number Formats

```python
ws['B2'].number_format = '#,##0.00'        # 1,234.56
ws['C2'].number_format = '$#,##0.00'       # $1,234.56
ws['D2'].number_format = '0.00%'           # 12.34%
ws['E2'].number_format = 'yyyy-mm-dd'      # 2026-02-11
ws['F2'].number_format = '#,##0.00;[Red]-#,##0.00'  # Red for negative
```

---

## Data Analysis with pandas

### Read Excel

```python
import pandas as pd

df = pd.read_excel("input.xlsx", sheet_name="Data", header=0)
# For multiple sheets:
dfs = pd.read_excel("input.xlsx", sheet_name=None)  # dict of DataFrames
```

### Write Excel with Formatting

```python
with pd.ExcelWriter("output.xlsx", engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="Analysis", index=False)

    # Access workbook for styling
    wb = writer.book
    ws = writer.sheets["Analysis"]

    # Auto-fit column widths
    for col in ws.columns:
        max_length = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[get_column_letter(col[0].column)].width = min(max_length + 2, 50)
```

### Pivot Tables

```python
pivot = df.pivot_table(
    values='Revenue',
    index='Category',
    columns='Quarter',
    aggfunc='sum',
    margins=True,
    margins_name='Total'
)
pivot.to_excel(writer, sheet_name="Pivot")
```

---

## Charts

```python
from openpyxl.chart import BarChart, Reference

chart = BarChart()
chart.title = "Revenue by Quarter"
chart.y_axis.title = "Revenue ($)"
chart.x_axis.title = "Quarter"
chart.style = 10  # Clean style

data = Reference(ws, min_col=2, min_row=1, max_col=5, max_row=10)
cats = Reference(ws, min_col=1, min_row=2, max_row=10)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
chart.shape = 4  # Rounded corners

ws.add_chart(chart, "G2")
```

**Chart best practices:**
- Always set title and axis labels
- Limit to 5-7 data series for readability
- Use consistent colors across charts
- Set chart dimensions explicitly: `chart.width = 20; chart.height = 12`

---

## Print Setup

```python
ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE
ws.page_setup.paperSize = ws.PAPERSIZE_A4
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0  # Auto pages vertically

ws.print_title_rows = '1:1'  # Repeat header row
ws.print_area = 'A1:F50'

# Header/footer
ws.oddHeader.center.text = "Financial Report"
ws.oddFooter.right.text = "Page &P of &N"
```

---

## CSV/TSV Handling

```python
import csv

# Read CSV
with open("data.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['column_name'])

# Write CSV
with open("output.csv", 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Header1', 'Header2'])
    writer.writerows(data)

# TSV: use delimiter='\t'
```

**CSV pitfalls:**
- Always specify encoding (UTF-8 with BOM for Excel compatibility: `encoding='utf-8-sig'`)
- Date formats: ISO 8601 (yyyy-mm-dd) for unambiguous parsing
- Numbers with commas: quote or use semicolon delimiter

---

## Financial Model Structure

See `templates/financial-model.md` for the standard sheet structure.

**Key principles:**
- Inputs on a dedicated sheet (color-coded yellow)
- All calculations reference inputs (no magic numbers)
- Summary sheet pulls from detail sheets
- Clear separation: assumptions → calculations → outputs
- Version sheet tracking changes

---

## Common Patterns

### Auto-fit Columns

```python
for col in ws.columns:
    max_length = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.value:
            max_length = max(max_length, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = min(max_length + 2, 50)
```

### Freeze Panes

```python
ws.freeze_panes = 'A2'   # Freeze header row
ws.freeze_panes = 'B2'   # Freeze header row + first column
```

### Sheet Protection

```python
ws.protection.sheet = True
ws.protection.password = 'password123'
# Unlock specific cells for input
ws['B2'].protection = Protection(locked=False)
```

### Data Tables

```python
from openpyxl.worksheet.table import Table, TableStyleInfo

tab = Table(displayName="SalesData", ref="A1:D10")
style = TableStyleInfo(name="TableStyleMedium2", showFirstColumn=False,
                       showLastColumn=False, showRowStripes=True)
tab.tableStyleInfo = style
ws.add_table(tab)
```

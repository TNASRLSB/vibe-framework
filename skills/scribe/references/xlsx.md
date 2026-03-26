# Excel (XLSX) Reference Guide

## Library: openpyxl

### Basic Workbook Operations

```python
from openpyxl import Workbook, load_workbook

# Create new
wb = Workbook()
ws = wb.active
ws.title = "Sheet1"

# Load existing
wb = load_workbook("file.xlsx")
wb = load_workbook("file.xlsx", data_only=True)  # read cached formula values
```

### Cell Operations

```python
# Write values
ws["A1"] = "Header"
ws["B1"] = 42
ws["C1"] = 3.14
ws.cell(row=1, column=4, value="Direct")

# Write formulas
ws["A2"] = "=SUM(B1:B100)"
ws["A3"] = '=IF(B1>0, "Positive", "Negative")'
ws["A4"] = "=VLOOKUP(B1, Sheet2!A:B, 2, FALSE)"

# Read values
val = ws["A1"].value
```

### Cell Formatting

```python
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers

# Font
ws["A1"].font = Font(name="Calibri", size=12, bold=True, color="003366")

# Fill
ws["A1"].fill = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")

# Alignment
ws["A1"].alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

# Border
thin_border = Border(
    left=Side(style="thin"),
    right=Side(style="thin"),
    top=Side(style="thin"),
    bottom=Side(style="thin"),
)
ws["A1"].border = thin_border

# Number formatting
ws["B1"].number_format = '#,##0.00'        # 1,234.56
ws["B2"].number_format = '$#,##0.00'       # $1,234.56
ws["B3"].number_format = '0.0%'            # 85.5%
ws["B4"].number_format = 'yyyy-mm-dd'      # 2025-01-15
ws["B5"].number_format = '#,##0.00_);[Red](#,##0.00)'  # Negative in red
```

### Column and Row Sizing

```python
from openpyxl.utils import get_column_letter

# Set column width
ws.column_dimensions["A"].width = 25

# Auto-fit approximation (openpyxl has no true auto-fit)
for col in ws.columns:
    max_length = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.value:
            max_length = max(max_length, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = min(max_length + 2, 50)

# Set row height
ws.row_dimensions[1].height = 30

# Freeze panes
ws.freeze_panes = "A2"  # Freeze header row
ws.freeze_panes = "B2"  # Freeze header row and first column
```

### Data Validation

```python
from openpyxl.worksheet.datavalidation import DataValidation

# Dropdown list
dv = DataValidation(type="list", formula1='"Yes,No,Maybe"', allow_blank=True)
dv.error = "Please select from the list"
dv.errorTitle = "Invalid Input"
ws.add_data_validation(dv)
dv.add(ws["C2:C100"])

# Number range
dv_num = DataValidation(type="whole", operator="between", formula1=0, formula2=100)
ws.add_data_validation(dv_num)
dv_num.add(ws["D2:D100"])

# Date validation
dv_date = DataValidation(type="date", operator="greaterThan", formula1="2024-01-01")
ws.add_data_validation(dv_date)
```

### Conditional Formatting

```python
from openpyxl.formatting.rule import (
    CellIsRule, ColorScaleRule, DataBarRule, FormulaRule
)

# Highlight cells greater than value
ws.conditional_formatting.add(
    "B2:B100",
    CellIsRule(operator="greaterThan", formula=["100"],
               fill=PatternFill(bgColor="C6EFCE"))
)

# Color scale (green to red)
ws.conditional_formatting.add(
    "B2:B100",
    ColorScaleRule(
        start_type="min", start_color="63BE7B",
        mid_type="percentile", mid_value=50, mid_color="FFEB84",
        end_type="max", end_color="F8696B"
    )
)

# Data bars
ws.conditional_formatting.add(
    "B2:B100",
    DataBarRule(start_type="min", end_type="max", color="638EC6")
)

# Formula-based rule
ws.conditional_formatting.add(
    "A2:D100",
    FormulaRule(formula=['$E2="Overdue"'],
                fill=PatternFill(bgColor="FFC7CE"))
)
```

### Charts

```python
from openpyxl.chart import BarChart, LineChart, PieChart, Reference

# Bar chart
chart = BarChart()
chart.type = "col"
chart.title = "Monthly Sales"
chart.y_axis.title = "Revenue ($)"
chart.x_axis.title = "Month"
chart.style = 10

data = Reference(ws, min_col=2, min_row=1, max_row=13, max_col=3)
cats = Reference(ws, min_col=1, min_row=2, max_row=13)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
chart.shape = 4
ws.add_chart(chart, "E2")

# Line chart
line_chart = LineChart()
line_chart.title = "Trend Analysis"
line_chart.y_axis.title = "Value"
line_chart.width = 20
line_chart.height = 12

# Pie chart
pie = PieChart()
pie.title = "Market Share"
data = Reference(ws, min_col=2, min_row=1, max_row=5)
cats = Reference(ws, min_col=1, min_row=2, max_row=5)
pie.add_data(data, titles_from_data=True)
pie.set_categories(cats)
```

### Named Ranges

```python
from openpyxl.workbook.defined_name import DefinedName

# Create named range
ref = f"Sheet1!$A$1:$D${ws.max_row}"
defn = DefinedName("SalesData", attr_text=ref)
wb.defined_names.add(defn)
```

### Pivot Table Patterns

openpyxl cannot create pivot tables directly. Use these patterns instead:

**Manual pivot summary:**
```python
from collections import defaultdict

# Group data manually
groups = defaultdict(lambda: defaultdict(float))
for row in ws.iter_rows(min_row=2, values_only=True):
    category, subcategory, amount = row[0], row[1], row[2]
    groups[category][subcategory] += amount

# Write pivot-style summary to new sheet
pivot_ws = wb.create_sheet("Summary")
pivot_ws["A1"] = "Category"
pivot_ws["B1"] = "Subcategory"
pivot_ws["C1"] = "Total"
row_num = 2
for cat, subs in sorted(groups.items()):
    for sub, total in sorted(subs.items()):
        pivot_ws.cell(row=row_num, column=1, value=cat)
        pivot_ws.cell(row=row_num, column=2, value=sub)
        pivot_ws.cell(row=row_num, column=3, value=total)
        row_num += 1
```

### Financial Model Patterns

**Income statement template:**
```python
headers = ["", "Q1", "Q2", "Q3", "Q4", "FY Total"]
line_items = [
    ("Revenue", [100000, 120000, 110000, 150000]),
    ("COGS", [-40000, -48000, -44000, -60000]),
    ("Gross Profit", None),  # formula row
    ("Operating Expenses", [-30000, -32000, -31000, -35000]),
    ("EBITDA", None),  # formula row
]

# Write headers
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

# Write data with formulas for calculated rows
row = 2
for item_name, values in line_items:
    ws.cell(row=row, column=1, value=item_name)
    if values:
        for col, val in enumerate(values, 2):
            ws.cell(row=row, column=col, value=val)
        # FY Total formula
        ws.cell(row=row, column=6, value=f"=SUM(B{row}:E{row})")
    row += 1

# Currency formatting for all numeric cells
for r in range(2, row):
    for c in range(2, 7):
        ws.cell(row=r, column=c).number_format = '$#,##0'
```

**Variance analysis:**
```python
# Actual vs Budget with variance
ws["A1"] = "Line Item"
ws["B1"] = "Budget"
ws["C1"] = "Actual"
ws["D1"] = "Variance ($)"
ws["E1"] = "Variance (%)"

# Variance formulas
for row in range(2, last_row + 1):
    ws[f"D{row}"] = f"=C{row}-B{row}"
    ws[f"E{row}"] = f'=IF(B{row}=0, "", D{row}/B{row})'
    ws[f"E{row}"].number_format = '0.0%'
```

### Print Setup

```python
ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE
ws.page_setup.paperSize = ws.PAPERSIZE_LETTER
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.print_title_rows = "1:1"  # Repeat header row on every page
ws.print_area = f"A1:F{ws.max_row}"
```

### Protection

```python
ws.protection.sheet = True
ws.protection.password = "password"

# Unlock specific cells for input
from openpyxl.styles import Protection
for row in range(2, 100):
    ws.cell(row=row, column=2).protection = Protection(locked=False)
```

### Save

```python
wb.save("output.xlsx")
```

---

## Financial Model Template

Standard structure for comprehensive Excel financial models. Adapt sheets and sections to the specific use case.

### Sheet Structure

**1. Cover** -- Model name, company/project, version, date, author, disclaimer.

**2. Assumptions** -- All hard-coded numbers live here (no magic numbers in other sheets). Yellow background for all input cells. Organized by:

| Section | Examples |
|---------|----------|
| Revenue assumptions | Price per unit, growth rate, market size |
| Cost assumptions | COGS %, opex items, headcount costs |
| Capital assumptions | Capex schedule, depreciation method/life |
| Financing assumptions | Interest rate, loan term, debt/equity split |
| Tax assumptions | Tax rate, loss carryforward |
| Timing | Start date, projection period (3/5/10 years) |

**3. Revenue** -- Revenue build-up from assumptions. By product/segment/geography if applicable. Monthly --> quarterly --> annual rollup. Formulas reference Assumptions sheet only.

**4. Costs** -- COGS (variable costs tied to revenue), operating expenses by category, headcount plan with loaded costs. Formulas reference Assumptions + Revenue sheets.

**5. P&L (Income Statement)**
- Revenue (from Revenue sheet)
- (-) COGS --> Gross Profit
- (-) Operating Expenses --> EBITDA
- (-) Depreciation & Amortization --> EBIT
- (-) Interest --> EBT
- (-) Tax --> Net Income
- Key margins calculated: Gross %, EBITDA %, Net %

**6. Balance Sheet** -- Assets (Cash, AR, Inventory, PP&E, Other), Liabilities (AP, Short-term debt, Long-term debt), Equity (Common stock, Retained earnings). Must balance: Assets = Liabilities + Equity. Add balance check formula with conditional formatting (red if unbalanced).

**7. Cash Flow**
- Operating: Net Income + non-cash adjustments + working capital changes
- Investing: Capex, acquisitions
- Financing: Debt drawdowns/repayments, equity raises, dividends
- Net cash flow --> ending cash balance (must tie to Balance Sheet cash)

**8. KPIs / Dashboard** -- Summary metrics pulled from other sheets. Charts: Revenue trend, margin trend, cash runway.

| Category | Metrics |
|----------|---------|
| Profitability | Gross margin, EBITDA margin, Net margin, ROE |
| Liquidity | Current ratio, Quick ratio, Cash runway (months) |
| Efficiency | DSO, DPO, DIO, Cash conversion cycle |
| Growth | Revenue growth %, Customer growth %, ARPU |
| Valuation | EV/EBITDA, P/E (if applicable) |

**9. Scenarios (Optional)** -- Base / Bull / Bear cases. Use named ranges or data validation dropdowns to switch. Delta table showing key metrics across all scenarios.

### Color Coding Convention

| Color | Meaning |
|-------|---------|
| Yellow fill | Hard-coded input (editable) |
| Blue font | Formula (calculated) |
| Green font | Links to other sheets |
| Black font | Labels and headers |
| Red fill (conditional) | Balance check failure or out-of-range values |

### Best Practices

- No magic numbers -- every assumption in one place
- Formulas only reference the Assumptions sheet for inputs
- Balance check formula on Balance Sheet (Assets = L + E, with conditional red highlight)
- Separate formatting from data -- use styles consistently
- Document assumptions with cell comments
- Version control in filename or Cover sheet

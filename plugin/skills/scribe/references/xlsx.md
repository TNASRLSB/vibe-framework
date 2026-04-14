# XLSX — Gotchas & Non-Obvious Patterns

> Standard openpyxl operations are not included — you already know them. This file covers only patterns that are error-prone, require workarounds, or encode opinionated design standards.

## Number Format Strings

These exact patterns are easy to get wrong. Copy verbatim:

```python
ws["B1"].number_format = '#,##0.00'                          # 1,234.56
ws["B2"].number_format = '$#,##0.00'                         # $1,234.56
ws["B3"].number_format = '0.0%'                              # 85.5%
ws["B4"].number_format = 'yyyy-mm-dd'                        # 2025-01-15
ws["B5"].number_format = '#,##0.00_);[Red](#,##0.00)'        # Negative in red parens
ws["B6"].number_format = '$#,##0'                            # Currency, no decimals
```

The negative-in-red format requires the exact semicolon-separated syntax with `[Red]` and parentheses. Getting it slightly wrong produces no error — just wrong display.

## Auto-Fit Column Width Workaround

openpyxl has no true auto-fit. This approximation is required every time you want readable columns:

```python
from openpyxl.utils import get_column_letter

for col in ws.columns:
    max_length = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.value:
            max_length = max(max_length, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = min(max_length + 2, 50)
```

## Data Validation

**Gotcha:** The dropdown formula requires the quoted-string syntax with double quotes inside the formula1 string.

```python
from openpyxl.worksheet.datavalidation import DataValidation

# Dropdown — note the double-quote wrapping inside the string
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

## Conditional Formatting

```python
from openpyxl.formatting.rule import (
    CellIsRule, ColorScaleRule, DataBarRule, FormulaRule
)
from openpyxl.styles import PatternFill

# Highlight cells greater than value
ws.conditional_formatting.add(
    "B2:B100",
    CellIsRule(operator="greaterThan", formula=["100"],
               fill=PatternFill(bgColor="C6EFCE"))
)

# Color scale (green-yellow-red)
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

# Formula-based rule (reference a column with $ for absolute)
ws.conditional_formatting.add(
    "A2:D100",
    FormulaRule(formula=['$E2="Overdue"'],
                fill=PatternFill(bgColor="FFC7CE"))
)
```

## Named Ranges via DefinedName

The `attr_text` parameter name is unintuitive — it is the cell reference string, not a display attribute:

```python
from openpyxl.workbook.defined_name import DefinedName

ref = f"Sheet1!$A$1:$D${ws.max_row}"
defn = DefinedName("SalesData", attr_text=ref)
wb.defined_names.add(defn)
```

## Pivot Table Workaround

openpyxl cannot create pivot tables. Build the summary manually:

```python
from collections import defaultdict

groups = defaultdict(lambda: defaultdict(float))
for row in ws.iter_rows(min_row=2, values_only=True):
    category, subcategory, amount = row[0], row[1], row[2]
    groups[category][subcategory] += amount

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

## Financial Model Patterns

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

for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h).font = Font(bold=True)

row = 2
for item_name, values in line_items:
    ws.cell(row=row, column=1, value=item_name)
    if values:
        for col, val in enumerate(values, 2):
            ws.cell(row=row, column=col, value=val)
        ws.cell(row=row, column=6, value=f"=SUM(B{row}:E{row})")
    row += 1

for r in range(2, row):
    for c in range(2, 7):
        ws.cell(row=r, column=c).number_format = '$#,##0'
```

**Variance analysis:**
```python
ws["A1"] = "Line Item"
ws["B1"] = "Budget"
ws["C1"] = "Actual"
ws["D1"] = "Variance ($)"
ws["E1"] = "Variance (%)"

for row in range(2, last_row + 1):
    ws[f"D{row}"] = f"=C{row}-B{row}"
    ws[f"E{row}"] = f'=IF(B{row}=0, "", D{row}/B{row})'
    ws[f"E{row}"].number_format = '0.0%'
```

## Print Setup

```python
ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE
ws.page_setup.paperSize = ws.PAPERSIZE_LETTER
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0  # 0 = as many pages as needed vertically
ws.print_title_rows = "1:1"    # Repeat header row on every printed page
ws.print_area = f"A1:F{ws.max_row}"
```

## Sheet Protection with Selective Cell Unlocking

Lock the sheet but allow editing in specific input cells:

```python
from openpyxl.styles import Protection

# Lock the entire sheet
ws.protection.sheet = True
ws.protection.password = "password"

# Unlock specific input cells (all cells are locked by default when protection is on)
for row in range(2, 100):
    ws.cell(row=row, column=2).protection = Protection(locked=False)
```

## Financial Model Template Structure

Standard structure for comprehensive Excel financial models.

### Sheet Structure

**1. Cover** — Model name, company/project, version, date, author, disclaimer.

**2. Assumptions** — All hard-coded numbers live here (no magic numbers in other sheets). Yellow background for all input cells. Sections:

| Section | Examples |
|---------|----------|
| Revenue assumptions | Price per unit, growth rate, market size |
| Cost assumptions | COGS %, opex items, headcount costs |
| Capital assumptions | Capex schedule, depreciation method/life |
| Financing assumptions | Interest rate, loan term, debt/equity split |
| Tax assumptions | Tax rate, loss carryforward |
| Timing | Start date, projection period (3/5/10 years) |

**3. Revenue** — Revenue build-up from assumptions. By product/segment/geography. Monthly -> quarterly -> annual rollup. Formulas reference Assumptions sheet only.

**4. Costs** — COGS (variable costs tied to revenue), operating expenses by category, headcount plan with loaded costs. Formulas reference Assumptions + Revenue sheets.

**5. P&L (Income Statement)**
- Revenue (from Revenue sheet)
- (-) COGS -> Gross Profit
- (-) Operating Expenses -> EBITDA
- (-) Depreciation & Amortization -> EBIT
- (-) Interest -> EBT
- (-) Tax -> Net Income
- Key margins: Gross %, EBITDA %, Net %

**6. Balance Sheet** — Assets, Liabilities, Equity. Must balance. Add balance check formula with conditional formatting (red if unbalanced).

**7. Cash Flow**
- Operating: Net Income + non-cash adjustments + working capital changes
- Investing: Capex, acquisitions
- Financing: Debt drawdowns/repayments, equity raises, dividends
- Net cash flow -> ending cash balance (must tie to Balance Sheet cash)

**8. KPIs / Dashboard** — Summary metrics from other sheets. Charts: Revenue trend, margin trend, cash runway.

| Category | Metrics |
|----------|---------|
| Profitability | Gross margin, EBITDA margin, Net margin, ROE |
| Liquidity | Current ratio, Quick ratio, Cash runway (months) |
| Efficiency | DSO, DPO, DIO, Cash conversion cycle |
| Growth | Revenue growth %, Customer growth %, ARPU |
| Valuation | EV/EBITDA, P/E (if applicable) |

**9. Scenarios (Optional)** — Base / Bull / Bear cases. Use named ranges or data validation dropdowns to switch.

### Color Coding Convention

| Color | Meaning |
|-------|---------|
| Yellow fill | Hard-coded input (editable) |
| Blue font | Formula (calculated) |
| Green font | Links to other sheets |
| Black font | Labels and headers |
| Red fill (conditional) | Balance check failure or out-of-range values |

### Best Practices

- No magic numbers — every assumption in one place
- Formulas only reference the Assumptions sheet for inputs
- Balance check formula on Balance Sheet with conditional red highlight
- Separate formatting from data — use styles consistently
- Document assumptions with cell comments

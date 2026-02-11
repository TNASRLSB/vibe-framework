# Financial Model Template

Standard structure for Excel financial models. Adapt sheets and sections to the specific use case.

---

## Sheet Structure

### 1. Cover
- Model name
- Company / project name
- Version and date
- Author
- Disclaimer / confidentiality notice

### 2. Assumptions
- **Color code**: Yellow background for all input cells
- All hard-coded numbers live here — no magic numbers in other sheets
- Organized by category:

| Section | Examples |
|---------|----------|
| Revenue assumptions | Price per unit, growth rate, market size |
| Cost assumptions | COGS %, opex items, headcount costs |
| Capital assumptions | Capex schedule, depreciation method/life |
| Financing assumptions | Interest rate, loan term, debt/equity split |
| Tax assumptions | Tax rate, loss carryforward |
| Timing | Start date, projection period (3/5/10 years) |

### 3. Revenue
- Revenue build-up from assumptions
- By product/segment/geography if applicable
- Monthly → quarterly → annual rollup
- Formulas reference Assumptions sheet only

### 4. Costs
- COGS (variable costs tied to revenue)
- Operating expenses by category
- Headcount plan with loaded costs
- Formulas reference Assumptions + Revenue sheets

### 5. P&L (Income Statement)
- Revenue (from Revenue sheet)
- (-) COGS → Gross Profit
- (-) Operating Expenses → EBITDA
- (-) Depreciation & Amortization → EBIT
- (-) Interest → EBT
- (-) Tax → Net Income
- Key margins calculated: Gross %, EBITDA %, Net %

### 6. Balance Sheet
- Assets: Cash, AR, Inventory, PP&E, Other
- Liabilities: AP, Short-term debt, Long-term debt
- Equity: Common stock, Retained earnings
- Must balance: Assets = Liabilities + Equity
- Add balance check formula with conditional formatting (red if unbalanced)

### 7. Cash Flow
- Operating: Net Income + non-cash adjustments + working capital changes
- Investing: Capex, acquisitions
- Financing: Debt drawdowns/repayments, equity raises, dividends
- Net cash flow → ending cash balance
- Must tie to Balance Sheet cash

### 8. KPIs / Dashboard
- Summary metrics pulled from other sheets
- Charts: Revenue trend, margin trend, cash runway
- Key ratios:

| Category | Metrics |
|----------|---------|
| Profitability | Gross margin, EBITDA margin, Net margin, ROE |
| Liquidity | Current ratio, Quick ratio, Cash runway (months) |
| Efficiency | DSO, DPO, DIO, Cash conversion cycle |
| Growth | Revenue growth %, Customer growth %, ARPU |
| Valuation | EV/EBITDA, P/E (if applicable) |

### 9. Scenarios (Optional)
- Base / Bull / Bear cases
- Use named ranges or data validation dropdowns to switch
- Key variables that change: growth rate, churn, pricing, costs
- Summary comparison table

### 10. Version Log
- Date, author, description of changes
- Track major assumption changes

---

## Formatting Standards

| Element | Style |
|---------|-------|
| Input cells | Yellow background (`#FFF2CC`), blue font (`#2F5496`) |
| Calculated cells | No fill, black font |
| Headers | Dark blue fill (`#2F5496`), white bold font |
| Section totals | Bold, single top border |
| Grand totals | Bold, double top border |
| Percentages | One decimal place (`0.0%`) |
| Currency | Two decimals, thousands separator (`$#,##0.00`) |
| Negative values | Red font or parentheses |
| Dates | `YYYY-MM-DD` or `MMM-YY` for monthly |
| Check cells | Green if pass, red if fail |

---

## Formula Rules

1. **No hardcoded numbers** in formula sheets — reference Assumptions
2. **One formula per row** — copy across columns (time periods)
3. **Row references only go up or left** — never reference below or right in the same sheet
4. **Cross-sheet references** go: Assumptions → Revenue/Costs → P&L → BS → CF → KPIs
5. **Name key ranges** for readability (`=revenue_growth` vs `=Assumptions!B5`)
6. **Add error checks**: `=IF(ABS(assets-liabilities_equity)<0.01, "OK", "ERROR")`
7. **Avoid circular references** — if needed, document and enable iterative calculation

---

## Validation Checklist

- [ ] Balance sheet balances (every period)
- [ ] Cash flow ties to balance sheet cash change
- [ ] Revenue builds match P&L revenue line
- [ ] No hardcoded numbers outside Assumptions sheet
- [ ] All input cells are yellow-highlighted
- [ ] Formulas copy cleanly across periods (no broken references)
- [ ] Print setup configured (landscape, fit to width, headers repeat)
- [ ] Scenarios switch correctly
- [ ] Version log is current

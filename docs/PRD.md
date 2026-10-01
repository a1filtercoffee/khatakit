# Khatakit - Product Requirements Document

> Update, 1 October 2026: EMI and the basic GST amount calculator have been retired. The active catalogue contains GST late fees, TDS interest, advance tax and presumptive tax. Earlier references below are historical.

## Overview

Khatakit (khatakit.in) is a privacy-first, 100% browser-based financial utility website targeting Indian freelancers, small business owners, and accountants. All computations happen in JavaScript on the client side. There is no backend, no login, no data storage, and no cookies.

## Target Users

- Freelancers and consultants needing quick tax estimates
- Small business owners calculating GST obligations
- Chartered accountants and tax professionals as a quick reference
- Anyone searching Google for "GST late fee calculator", "advance tax calculator", "EMI calculator", etc.

## Core Principles

1. **Privacy-first** - Zero data leaves the browser. No analytics, no tracking, no cookies.
2. **Accuracy** - Calculations follow current Indian law (tax year 2026-27 under the Income-tax Act, 2025, and GST rules as in force) with citations to primary sources.
3. **Simplicity** - Clean UI, minimal inputs, instant results. No clutter.
4. **Free & Open Source** - MIT licensed, publicly available on GitHub.

---

## V1 Tools

### 1. GST Late Fee & Interest Calculator

**Purpose:** Calculate penalties for late filing of GST returns.

**Inputs:**
- Return type (GSTR-3B, GSTR-1 / IFF, GSTR-9)
- Due date
- Actual filing date
- Tax paid in cash (GSTR-3B only)
- Aggregate turnover slab
- Whether it's a nil return
- Turnover in the State or Union territory (GSTR-9 only)

**Calculation Logic:**

**Late Fee (Section 47 CGST Act):**
- GSTR-3B non-nil: Rs. 50/day (Rs. 25 CGST + Rs. 25 SGST)
- GSTR-3B nil return: Rs. 20/day (Rs. 10 CGST + Rs. 10 SGST)
- Late fee caps based on turnover:
  - Turnover up to Rs. 1.5 Cr: Max Rs. 2,000
  - Turnover Rs. 1.5 Cr to Rs. 5 Cr: Max Rs. 5,000
  - Turnover above Rs. 5 Cr: Max Rs. 10,000
- Nil return cap: Rs. 500
- GSTR-1 uses the same amounts (Notification 20/2021)
- GSTR-9 (Notification 07/2023): Rs. 50, 100 or 200/day by turnover, capped at 0.04% or 0.5% of State turnover

**Interest (Section 50 CGST Act):**
- Rate: 18% per annum
- Formula: `Tax Liability * 18/100 * (Days Late / 365)`
- Applied on tax paid in cash

**Output:**
- Late fee breakdown (CGST + SGST)
- Interest amount
- Total penalty
- Dated workings and CSV download

---

### 2. Advance Tax Calculator

**Purpose:** Calculate quarterly advance tax installments.

**Inputs:**
- Tax regime (Old / New)
- Gross total income
- Salary or pension included in that income (for the standard deduction)
- Deductions (old regime only)
- TDS already deducted
- Age category (below 60 / 60-80 / above 80)
- Whether there is business or professional income (seniors without it are outside advance tax)

**Calculation Logic:**

**New Regime Slabs (tax year 2026-27, section 202(1)):**
| Income Slab | Rate |
|---|---|
| Up to Rs. 4,00,000 | Nil |
| Rs. 4,00,001 - 8,00,000 | 5% |
| Rs. 8,00,001 - 12,00,000 | 10% |
| Rs. 12,00,001 - 16,00,000 | 15% |
| Rs. 16,00,001 - 20,00,000 | 20% |
| Rs. 20,00,001 - 24,00,000 | 25% |
| Above Rs. 24,00,000 | 30% |

Standard deduction: Rs. 75,000 (salaried/pension)

Rebate under section 156 (old 87A): Up to Rs. 60,000 (income up to Rs. 12,00,000; marginal relief up to Rs. 12,75,000)

**Old Regime Slabs (tax year 2026-27):**
| Income Slab | Rate (Below 60) |
|---|---|
| Up to Rs. 2,50,000 | Nil |
| Rs. 2,50,001 - 5,00,000 | 5% |
| Rs. 5,00,001 - 10,00,000 | 20% |
| Above Rs. 10,00,000 | 30% |

Standard deduction: Rs. 50,000

Rebate under section 156 (old 87A): Up to Rs. 12,500 (income up to Rs. 5,00,000)

**Surcharge:**
| Total Income | Rate |
|---|---|
| Rs. 50L - 1 Cr | 10% |
| Rs. 1 Cr - 2 Cr | 15% |
| Rs. 2 Cr - 5 Cr | 25% |
| Above Rs. 5 Cr | 37% (old) / 25% (new, capped) |

Health & Education Cess: 4% on tax + surcharge

**Advance Tax Schedule:**
| Due Date | Cumulative % |
|---|---|
| 15 June | 15% |
| 15 September | 45% |
| 15 December | 75% |
| 15 March | 100% |

Threshold: Advance tax applies only if total tax liability exceeds Rs. 10,000.

**Output:**
- Tax computation sheet (income, deductions, taxable income, tax, surcharge, cess)
- Quarterly installment schedule with amounts and due dates
- Comparison: Old vs New regime (side by side)

---

### 3. EMI Calculator

**Purpose:** Calculate monthly EMI for loans.

**Inputs:**
- Loan amount (Rs.)
- Annual interest rate (%)
- Loan tenure (months or years)

**Calculation Logic:**

Formula (reducing balance): `EMI = [P * R * (1+R)^N] / [(1+R)^N - 1]`

Where:
- P = Principal loan amount
- R = Monthly interest rate (annual rate / 12 / 100)
- N = Total number of months

**Output:**
- Monthly EMI amount
- Total interest payable
- Total amount payable (principal + interest)
- Donut chart: Principal vs Interest split
- Year-wise amortization schedule (principal, interest, balance for each year)
- Monthly schedule CSV download

---

### 4. Presumptive Tax Calculator (section 58, old 44ADA / 44AD)

**Purpose:** Calculate presumptive income for small businesses and professionals.

**Inputs:**
- Scheme: 44AD (Business) or 44ADA (Professional), the old names people search for
- Gross receipts / turnover
- Cash receipts (receipts not by bank or online mode)
- Tax regime (Old / New)

**Calculation Logic:**

**Business (section 58(2) Table serial 1, old 44AD):**
- Turnover limit: Rs. 2 Cr (Rs. 3 Cr if cash receipts <= 5% of total)
- Presumptive rate: 8% of cash receipts + 6% of digital receipts
- If actual income is higher, taxpayer can declare higher amount

**Profession (section 58(2) Table serial 3, old 44ADA):**
- Eligible professions: Legal, Medical, Engineering, Architecture, Accountancy, Technical Consultancy, Interior Decoration, Film/Arts, Company Secretary, Information Technology
- Gross receipts limit: Rs. 50 Lakh (Rs. 75 Lakh if cash receipts <= 5%)
- Presumptive rate: 50% of gross receipts
- Can declare higher income if actual income exceeds 50%

**Output:**
- Presumptive income
- Tax liability (using selected regime slabs)
- Effective tax rate
- Comparison with actual income scenarios

---

### 5. GST Calculator

**Purpose:** Add GST to a price, or take GST out of a price that includes it, for one amount or a whole bill.

**Inputs:** supply type (within the State or between States), bill lines with amount, rate and inclusive or exclusive, and an optional round-off to the rupee.

**Output:** CGST and SGST or IGST per line and per rate to the paisa, bill totals that add up exactly, any round-off shown, and a CSV download.

The test cases are in `tests/gst-calculator/`.

---

### 6. TDS Interest Calculator

**Purpose:** Interest on TDS deducted late (1% a month) or deposited late (1.5% a month), under section 201(1A) of the 1961 Act or section 398(3)(a) of the 2025 Act.

**Inputs:** one case or many rows (typed, pasted or imported from CSV), each with amount and the dates tax was deductible, deducted and deposited.

**Output:** due date, months counted by name, interest under calendar months with the 30-day figure alongside, and CSV and Excel downloads.

The verified rules are in `docs/TDS-RULES.md`.

---

## Design Requirements

### Brand Identity
- **Name:** Khatakit (Khata = ledger in Hindi, Kit = toolkit)
- **Domain:** khatakit.in
- **Colors:** Blue action (#2364BB), peach page headers (#F8DACA), warm paper background (#FFFDF8); tokens in `src/styles/tokens.css`
- **Fonts:** System UI font stack, system monospace for numbers, Georgia for the wordmark
- **Logo:** A pair of offset ledger sheets beside a serif Khatakit wordmark

### Layout
- Desktop: 2-column layout (form left, results right)
- Mobile: Single-column stacked (form first, then results)
- Max content width: 1240px

### UI Components
- Clean card-based design with subtle shadows
- Indian number formatting throughout (e.g., 1,00,000 instead of 100,000)
- Copy-to-clipboard on all result values
- CSV download of workings (and Excel for TDS interest)
- About & privacy linked from every page footer

---

## Technical Requirements

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 with shared theme tokens
- **Routing:** React Router v7
- **SEO:** one page registry, React 19 metadata, and a build-time prerender script for static HTML
- **Testing:** Vitest + Testing Library
- **Deployment:** Vercel
- **Bundle size:** Target < 100KB initial load
- **Performance:** Lighthouse 95+ performance, 100 accessibility, 100 SEO

---

## Non-Goals (V1)

- User accounts or authentication
- Backend API or database
- Saving/loading calculations
- Mobile app
- Multi-language support
- Historical tax year support (only current FY)

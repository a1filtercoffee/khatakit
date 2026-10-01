# Calculation Rules Review

> Update, 1 October 2026: EMI and the basic GST amount calculator have been retired. The active catalogue contains GST late fees, TDS interest, advance tax and presumptive tax. Earlier references below are historical.

Reviewed on 14 September 2026 against primary sources.
Every value below is tested in `tests/<calculator>/calc.test.ts`.

## Key finding

The Income-tax Act, 2025 (No. 30 of 2025, assent 21 August 2025) came into force on 1 April 2026 (section 1(3)).
Section 536(1) repeals the Income-tax Act, 1961, which still governs years before 1 April 2026 (section 536(2)(c)).
"Tax year" means the financial year (section 3(1)), so tax year 2026-27 is FY 2026-27.
The Finance Act, 2026 (No. 4 of 2026, assent 30 March 2026) left individual slab rates, rebate, surcharge, cess, standard deduction, advance tax dates and presumptive limits unchanged.
So the numbers for FY 2025-26 and tax year 2026-27 are the same, but every section number changed.

Sources used:

- Income-tax Act, 2025 (Gazette): https://egazette.gov.in/WriteReadData/2025/265620.pdf
- Finance Act, 2026 (Gazette): https://egazette.gov.in/WriteReadData/2026/271439.pdf
- Memorandum to the Finance Bill, 2026: https://www.indiabudget.gov.in/doc/memo.pdf

## Old to new section map

| Rule | Income-tax Act, 1961 | Income-tax Act, 2025 |
| --- | --- | --- |
| Standard deduction | 16(ia) | 19(1) Table serial 2 |
| Presumptive business | 44AD | 58(2) Table serial 1 |
| Presumptive goods carriages | 44AE | 58(2) Table serial 2 |
| Presumptive profession | 44ADA | 58(2) Table serial 3 |
| Rebate | 87A | 156 |
| New regime rates | 115BAC(1A) | 202(1) |
| Advance tax liability, senior exemption | 207 | 403 |
| Rs 10,000 threshold | 208 | 404 |
| Computation | 209 | 405 |
| Instalments | 211 | 408 |
| Interest for default in furnishing return | 234A | 423 |
| Interest for default in payment of advance tax | 234B | 424 |
| Interest for deferment of advance tax | 234C | 425 |

This map is my reading of the Act text.
The department's official mapping utility (incometaxindia.gov.in) refused automated access, so it was not checked.

## Advance Tax Calculator

Supported period: tax year 2026-27 (FY 2026-27) only.
FY 2025-26 is not kept selectable because its last instalment date (15 March 2026) has passed and its citations are under the repealed Act.

| Rule | Value | Provision | Source |
| --- | --- | --- | --- |
| Liability threshold | Rs 10,000 or more | Section 404 | Act PDF |
| Senior exemption | Resident, 60 or more, no business or professional income: no advance tax | Section 403(3) | Act PDF |
| Instalments | 15% by 15 June 2026, 45% by 15 September 2026, 75% by 15 December 2026, 100% by 15 March 2027 | Section 408(1) | Act PDF |
| Presumptive filers | Whole amount by 15 March | Section 408(2) | Act PDF |
| New regime slabs | Nil to 4L, 5% to 8L, 10% to 12L, 15% to 16L, 20% to 20L, 25% to 24L, 30% above | Section 202(1) | Act PDF |
| Old regime slabs, below 60 | Nil to 2.5L, 5% to 5L, 20% to 10L, 30% above | Finance Act 2026, First Schedule Part III Para A(I) | FA PDF |
| Old regime slabs, 60 to 80 | Nil to 3L, 5% to 5L, 20% to 10L, 30% above | Part III Para A(II) | FA PDF |
| Old regime slabs, 80 and above | Nil to 5L, 20% to 10L, 30% above | Part III Para A(III) | FA PDF |
| Rebate, old regime | Up to Rs 12,500 if income is Rs 5 lakh or less | Section 156(1) | Act PDF |
| Rebate, new regime | Up to Rs 60,000 if income is Rs 12 lakh or less | Section 156(2)(a) | Act PDF |
| Rebate marginal relief, new regime | Tax cannot exceed income above Rs 12 lakh | Section 156(2)(b) | Act PDF |
| Standard deduction | Rs 75,000 (new) or Rs 50,000 (old), capped at the salary | Section 19(1) Table serial 2 | Act PDF |
| Surcharge | 10% above Rs 50 lakh, 15% above Rs 1 crore, 25% above Rs 2 crore, 37% above Rs 5 crore (old) | Finance Act 2026 section 3(4) Table serial 1 | FA PDF |
| Surcharge cap, new regime | 25% above Rs 2 crore | Section 3(4) Table serial 10 | FA PDF |
| Surcharge marginal relief | Tn = Rn + Sn at each threshold | Section 3(5) | FA PDF |
| Cess | 4% of tax and surcharge | Section 3 | FA PDF |

What changed:

- New regime rebate marginal relief was wrong and under-charged tax. At Rs 12.5 lakh taxable income it showed Rs 7,800 instead of Rs 52,000.
- The Rs 75,000 or Rs 50,000 standard deduction was given to everyone. It now applies only to the salary or pension entered, through a new "Salary or Pension Included" input.
- The threshold used "more than Rs 10,000". The Act says "Rs 10,000 or more".
- Resident seniors with no business income were shown an instalment schedule. A new "Business or Professional Income" input appears for ages 60 and above.
- Surcharge had no marginal relief. It now follows section 3(5).
- Due dates now carry the year.
- Citations moved from sections 87A, 115BAC, 208 and 209 of the 1961 Act and the Finance Act, 2025 to sections 19, 156, 202, 403, 404 and 408 of the 2025 Act and the Finance Act, 2026.
- The old section 209 citation claimed it held the due dates, which were in section 211. That text is gone.
- Income-tax and surcharge now share one engine with the presumptive calculator.

Open questions:

- Interest for default or deferment (sections 424 and 425) is not computed.
- Special-rate income (capital gains under sections 196 to 198, dividends) is not supported. Its surcharge is capped at 15% and the rebate does not apply to it.
- The calculator assumes a resident individual. Non-residents get no rebate.
- The calculator does not know if the user opted for presumptive taxation, which would move everything to 15 March under section 408(2).
- Rounding of total income and tax to the nearest ten rupees was not verified in the 2025 Act and is not applied.
- Whether section 19 covers pension was confirmed only on secondary sources.

## Presumptive Tax Calculator

Supported period: tax year 2026-27 (FY 2026-27) only.

| Rule | Value | Provision | Source |
| --- | --- | --- | --- |
| Business rate | 6% of receipts by specified banking or online mode (by the return due date), 8% of the rest | Section 58(2) Table serial 1 | Act PDF |
| Business limit | Rs 2 crore, or Rs 3 crore if cash receipts are 5% or less | Section 58(2) Table serial 1 | Act PDF |
| Profession rate | 50% of gross receipts | Section 58(2) Table serial 3 | Act PDF |
| Profession limit | Rs 50 lakh, or Rs 75 lakh if cash receipts are 5% or less | Section 58(2) Table serial 3 | Act PDF |
| Eligible professions | Specified professions under section 62(4) | Section 58(2) Table serial 3 | Act PDF |
| Non-account-payee cheque | Treated as cash | Section 58(9) | Act PDF |
| Tax on the income | Same slabs, rebate, surcharge and cess as the advance tax calculator | Sections 156, 202; Finance Act 2026 | Both PDFs |
| Finance Act 2026 change | Only omits section 58(11)(a)(i) (no bar for a deduction under section 144) | Finance Act 2026 section 40 | FA PDF |

What changed:

- A salary standard deduction of Rs 75,000 or Rs 50,000 was subtracted from business income. That was wrong and is removed.
- The cash receipts input was hidden for professionals, so the Rs 75 lakh test used stale or zero values. It is now shown for both schemes.
- Rebate marginal relief and surcharge marginal relief now apply.
- Citations moved from sections 44AD, 44ADA and 115BAC of the 1961 Act to section 58(2), 156 and 202 of the 2025 Act.
- The old citation said the calculator checks the user's profession against a list. It never did. That citation is removed.

Open questions:

- Goods carriages (old 44AE, now section 58(2) Table serial 2) are not supported. It needs vehicle count and weight inputs.
- Old regime uses the below-60 slabs because the form does not ask for age.
- Other income is ignored, so the tax shown is only on the presumptive income.
- The five-year lock-in in sections 58(7) and 58(8) is not checked.

## GST Late Fee and Interest Calculator

Supported period: returns filed on or after 14 September 2026 under the rules in force then.
GSTR-3B and GSTR-1 rules apply to tax periods from June 2021.
GSTR-9 rules apply to FY 2022-23 onwards.

| Rule | Value | Provision | Source |
| --- | --- | --- | --- |
| Statutory fee, returns | Rs 100 a day per Act, max Rs 5,000 | CGST Act section 47(1) | https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter9/section47_v1.00.html |
| Statutory fee, annual return | Rs 100 a day per Act, max 0.25% of State turnover | Section 47(2) | Same page |
| GSTR-3B daily fee | Rs 25 CGST + Rs 25 SGST; nil return Rs 10 + Rs 10 | Notification 76/2018-CT | https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-76-central-tax-english-2018.pdf |
| GSTR-3B caps (total) | Nil Rs 500; up to Rs 1.5 crore Rs 2,000; up to Rs 5 crore Rs 5,000; above Rs 5 crore Rs 10,000 (section 47(1)) | Notification 19/2021-CT | https://cbic-gst.gov.in/pdf/central-tax/notfctn-19-central-tax-english-2021.pdf |
| GSTR-1 caps (total) | Same as GSTR-3B; nil means no outward supplies | Notification 20/2021-CT | https://cbic-gst.gov.in/pdf/central-tax/notfctn-20-central-tax-english-2021.pdf |
| GSTR-9, turnover up to Rs 5 crore | Rs 50 a day total, max 0.04% of State turnover | Notification 07/2023-CT | https://gstcouncil.gov.in/sites/default/files/2024-05/07_eng.pdf |
| GSTR-9, Rs 5 crore to Rs 20 crore | Rs 100 a day total, max 0.04% of State turnover | Notification 07/2023-CT | Same |
| GSTR-9, above Rs 20 crore | Rs 200 a day total, max 0.5% of State turnover | Section 47(2) | Section 47 page |
| Interest rate | 18% a year | Section 50(1), Notification 13/2017-CT | https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-13-central-tax-english.pdf |
| Interest basis | Only on tax paid by debiting the electronic cash ledger | Section 50(1) proviso (Finance Act 2021 section 112, in force 1 June 2021 by Notification 16/2021-CT) | https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter10/section50_v1.00.html |
| Interest period | From the day after the due date | Section 50(2) | Same |
| Three-year bar | No return after three years from the due date; enforced on the portal from the July 2025 tax period | GSTN advisory dated 7 June 2025 | https://www.mahagst.gov.in/public/uploads/gstnadvisory/1760596541_353%20Barring%20of%20GST%20Return%20on%20expiry%20of%20three%20years.pdf |

What changed:

- Interest was charged on GSTR-1 and GSTR-9. Those returns carry no tax payment, so interest is now nil for them.
- GSTR-9 used the GSTR-3B caps. It now uses Notification 07/2023 and section 47(2), with new turnover bands and a "Turnover in This State" input.
- The nil option is hidden for GSTR-9, which has no nil concession.
- The "Net Tax Liability" input is now "Tax Paid in Cash" and shows only for a regular GSTR-3B.
- A warning shows when the filing date is more than three years after the due date.
- Dates are parsed strictly as YYYY-MM-DD, and an invalid date returns no result.
- Citations were wrong. The turnover caps were cited to Notification 20/2021, which only covers GSTR-1. Notification 64/2020 does not exist as cited and is removed. All links now point to the notification PDFs instead of the CBIC home page.

Open questions:

- The 50(3) rate for wrongly availed and used input tax credit (18% or 24%) is not covered and was not confirmed.
- The GSTR-9 exemption for turnover up to Rs 2 crore from FY 2024-25 (Notification 15/2025-CT) was confirmed only on secondary sites.
- Sections 37(5), 39(11) and 44(2) (from Finance Act 2023, in force 1 October 2023 by Notification 28/2023-CT) were confirmed only on secondary sites. The GSTN advisory link is a state-hosted copy.
- Interest uses a 365-day year, including in leap years.
- One-off waivers, amnesty schemes and due date extensions are not modelled.
- GSTR-9C, GSTR-4 and CMP-08 are not supported.
- The 22 September 2025 rate changes (56th GST Council) do not affect late fee or interest.

## EMI Calculator

Supported period: not period-bound.
Rules are as in RBI Directions updated to 1 July 2026.

| Rule | Value | Provision | Source |
| --- | --- | --- | --- |
| EMI definition | Fixed payment of principal and interest that fully repays the loan | RBI (Commercial Banks - Responsible Business Conduct) Directions, 2025, para 4(11) | https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140 |
| Amortisation schedule | Must be part of the Key Facts Statement | Para 348(3) | Same |
| Worked example | Rs 20,000 at 15% for 24 months: EMI Rs 970, interest Rs 3,274, total Rs 23,274 | Para 348(3) | Same |
| Rounding | Nearest rupee, 50 paise and above rounded up | Para 457 | Same |
| Formula | Not prescribed by RBI; the example follows reducing balance with monthly rate = annual rate / 12 | - | - |
| Key Facts Statement start | Retail and MSME term loans sanctioned from 1 October 2024 | KFS circular DOR.STR.REC.13/13.03.00/2024-25, para 11 | https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0 |

What changed:

- The cited RBI link (Id=5599) was an agricultural debt waiver circular, not the Fair Practices Code. It is replaced.
- The old citation said RBI mandates the EMI formula. RBI does not, so that text is removed.
- The schedule used a rounded EMI and rounded interest each month, so it never matched RBI's example and the last balance was not zero. It now runs on the unrounded EMI and rounds only displayed figures, matching the RBI rows (720/250, 729/241, last row 958/12) and totals.
- Total payable was EMI times months. It is now principal plus total interest, matching RBI's Rs 23,274.

Open questions:

- The Directions checked are for commercial banks. NBFC and co-operative bank equivalents were not checked.
- Lenders may round EMIs up or adjust the last instalment.
- Broken-period interest and fees (which affect APR) are not modelled.

## Validation note

All calculator inputs are validated with Zod.

## Page copy changes needed

These files belong to the page and SEO work, so I did not edit them.
Current text is quoted as it was on 14 September 2026.

### src/tools/advance-tax/AdvanceTax.tsx

- SEO title "Advance Tax Calculator FY 2025-26 - Old & New Regime - Khatakit" should read "Advance Tax Calculator Tax Year 2026-27 - Old & New Regime - Khatakit".
- SEO description "Calculate advance tax installments for FY 2025-26." should read "Calculate advance tax instalments for tax year 2026-27 (FY 2026-27)."
- `period="FY 2025–26"` should be `period="Tax year 2026-27"`.
- Disclaimer "Tax calculations are based on FY 2025-26 (AY 2026-27) tax slabs and rules." should read "Tax calculations use the Income-tax Act, 2025 and Finance Act, 2026 rates for tax year 2026-27, for resident individuals."
- Disclaimer "does not account for capital gains, special incomes, or AMT" should add "or interest under sections 424 and 425".
- `defaultInput` should add `salaryIncome: 0` and `hasBusinessIncome: false`. They are optional in the type so the page still compiles.

### src/tools/presumptive-tax/PresumptiveTax.tsx

- SEO title "Presumptive Tax Calculator - Section 44ADA & 44AD - Khatakit" should read "Presumptive Tax Calculator - Section 58 (old 44ADA & 44AD) - Khatakit".
- SEO description "under Section 44ADA (professionals) and 44AD (businesses)" should read "under section 58 of the Income-tax Act, 2025 (old 44ADA for professionals and 44AD for businesses)".
- Page description "under 44ADA and businesses under 44AD" should read "under section 58 (old 44ADA and 44AD)".
- `period="FY 2025–26"` should be `period="Tax year 2026-27"`.
- Disclaimer should read: "Calculations use section 58(2) of the Income-tax Act, 2025 for tax year 2026-27. Professionals qualify with gross receipts up to ₹50 lakh, or ₹75 lakh if cash receipts are 5% or less. Businesses qualify with turnover up to ₹2 crore, or ₹3 crore if cash receipts are 5% or less. Old regime tax uses the below-60 slabs. Consult a CA for your specific situation."
- The current disclaimer's "(Rs. 75 lakh with digital receipts)" and "(Rs. 3 crore with digital receipts)" are wrong: the test is cash receipts of 5% or less, not digital receipts.

### src/tools/gst-late-fee/GstLateFee.tsx

- SEO title "GST Late Fee & Interest Calculator 2025-26 - Khatakit" should read "GST Late Fee & Interest Calculator 2026 - GSTR-3B, GSTR-1, GSTR-9 - Khatakit".
- `period="FY 2025–26"` should be removed or read "Rules as at September 2026". GST late fee is not tied to a financial year.
- Disclaimer "as per the CGST Act (Sections 47 and 50) for FY 2025-26" should read "as per sections 47 and 50 of the CGST Act and Notifications 76/2018, 19/2021, 20/2021 and 07/2023, as in force in September 2026".
- Disclaimer should add: "GSTR-9 is optional for aggregate turnover up to ₹2 crore. Returns cannot be filed more than three years after the due date."
- `defaultInput` may add `stateTurnover: 0`.

### src/tools/emi/EmiCalculator.tsx

- Disclaimer "Actual EMIs may vary slightly due to rounding" can add "Amounts are rounded to the nearest rupee, as in RBI's Key Facts Statement example."

### src/data/tools.ts

- Advance tax description "for FY 2025-26" should read "for tax year 2026-27".
- Presumptive description "under Section 44AD (business) and 44ADA (professionals)" should read "under section 58 (old 44AD for business, 44ADA for professionals)".
- GST description should mention GSTR-9 and the three-year filing bar.

### src/pages/Home.tsx

- Line 249 `'FY 2025–26'` should be `'Tax year 2026-27'`.

### Forms (owned by this review, left unchanged on purpose)

- The scheme labels "44ADA (Professional)" and "44AD (Business)" keep the old names people search for. The citations explain they are now section 58(2).

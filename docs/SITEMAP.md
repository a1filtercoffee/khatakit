# Sitemap

> Update, 1 October 2026: EMI and the basic GST amount calculator have been retired. The active catalogue contains GST late fees, TDS interest, advance tax and presumptive tax. Earlier references below are historical.

## URL Structure

Titles and descriptions below are copied from the page registry (`src/data/tools.ts` and `src/seo/pages.ts`).
The code is authoritative if they drift.

| URL | Page | SEO Title | Meta Description |
|---|---|---|---|
| `/` | Homepage | Khatakit - Free Accounting & Financial Tools for India | Free GST, income tax and loan calculators with calculation breakdowns. All calculations run in your browser; no account required. |
| `/gst-late-fee-interest-calculator` | GST Late Fee | GST Late Fee & Interest Calculator 2026 - GSTR-3B, GSTR-1, GSTR-9 - Khatakit | GST late fee and interest for GSTR-3B, GSTR-1 and GSTR-9. Turnover caps, nil returns, CGST and SGST split, dated workings and CSV download. |
| `/gst-calculator` | GST Calculator | GST Calculator - Add or Remove GST, Multiple Rates - Khatakit | Add or remove GST on one amount or a whole bill with lines at 5%, 18% and 40%. CGST, SGST or IGST to the paisa, round-off shown, CSV download. |
| `/advance-tax-calculator` | Advance Tax | Advance Tax Calculator Tax Year 2026-27 - Old & New Regime - Khatakit | Calculate advance tax instalments for tax year 2026-27 (FY 2026-27). Old vs new regime, rebate near ₹12 lakh, due dates and CSV download. |
| `/emi-calculator` | EMI Calculator | EMI Calculator - Loan EMI Calculator with Amortization - Khatakit | Calculate loan EMI with the reducing balance method. Matches the RBI Key Facts Statement example. Amortisation schedule and CSV download. |
| `/presumptive-income-calculator` | Presumptive Tax | Presumptive Tax Calculator - Section 58 (old 44ADA & 44AD) - Khatakit | Calculate presumptive income under section 58 of the Income-tax Act, 2025 (old 44ADA for professionals and 44AD for businesses). 5% cash test and limits. |
| `/tds-interest-calculator` | TDS Interest | TDS Interest Calculator - Late Deduction & Late Deposit, Bulk Rows - Khatakit | Calculate TDS interest under section 201(1A) and section 398: 1% for late deduction, 1.5% for late deposit. Due dates, months by name, calendar and 30-day counts, CSV and Excel download. |
| `/about` | About | About Khatakit - Free Accounting Tools | About Khatakit, a collection of free accounting and tax calculators. Project information, privacy and contributions. |

Unknown URLs get `404.html`, which is `noindex`, has no canonical and is not in the sitemap.

## SEO Keywords by Page

### Homepage
- financial calculators india
- free tax calculator india
- gst calculator
- emi calculator

### GST Late Fee & Interest Calculator
- gst late fee calculator
- gst interest calculator
- gst late filing penalty
- section 50 gst interest
- gst return late fee

### GST Calculator
- gst calculator
- reverse gst calculator
- gst inclusive calculator
- gst calculator multiple items

### Advance Tax Calculator
- advance tax calculator
- advance tax calculator fy 2026-27
- income tax calculator india
- old vs new regime calculator
- quarterly advance tax

### EMI Calculator
- emi calculator
- loan emi calculator
- home loan emi calculator
- emi calculator with amortization
- monthly emi calculator

### Presumptive Tax (section 58, old 44ADA/44AD)
- 44ada calculator
- 44ad calculator
- presumptive income calculator
- presumptive taxation scheme
- section 44ada

### TDS Interest Calculator
- tds interest calculator
- tds interest calculation
- tds interest on late payment
- bulk tds interest calculator

## Implementation status

The keyword lists above are planning references.

Every page in the registry is prerendered at build time to its own HTML file with its title, description, canonical, Open Graph tags and JSON-LD.
Calculator pages carry `WebApplication` and `BreadcrumbList` schema.
The homepage carries `CollectionPage` and `ItemList` schema.
`sitemap.xml` and `robots.txt` are generated from the registry during the build.
`public/og-image.png` is the default social image.
Head tags use React 19 metadata, not React Helmet.
`tests/seo/` checks the registry, the prerendered HTML, the sitemap and hydration.

## Canonical URLs

All pages use `https://khatakit.in` as the canonical base:
```html
<link rel="canonical" href="https://khatakit.in/emi-calculator" />
```

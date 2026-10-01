# Khatakit

Khatakit is a set of free calculators for Indian accounting, tax and loans.
It lives at [khatakit.in](https://khatakit.in).
Every calculation runs in your browser.
There is no account, no backend and no database.

Each calculator shows its working, not just the answer.
Each one cites the Act, notification or RBI document it follows.
This matters when you have to explain a figure to a client or attach it to a challan.

## Calculators

| Calculator | Path | What it does |
|---|---|---|
| GST late fee and interest | `/gst-late-fee-interest-calculator` | Late fee under section 47 and interest under section 50 for GSTR-3B, GSTR-1 and GSTR-9, with turnover caps. |
| GST calculator | `/gst-calculator` | Adds or removes GST on one amount or a whole bill with lines at different rates. CGST, SGST or IGST to the paisa. |
| TDS interest | `/tds-interest-calculator` | Interest on TDS deducted late (1%) or deposited late (1.5%), for one case or many rows. CSV import, CSV and Excel download. |
| Advance tax | `/advance-tax-calculator` | Quarterly instalments for tax year 2026-27, with old and new regime side by side. |
| Presumptive income | `/presumptive-income-calculator` | Income under section 58 of the Income-tax Act, 2025 (old 44AD and 44ADA), with the turnover limits and a tax estimate. |
| EMI | `/emi-calculator` | Loan EMI by the reducing balance method, with a year-wise schedule and a monthly schedule download. |

## Privacy

Your inputs never leave your browser.
Khatakit uses Cloudflare Web Analytics for page visits and site performance, without cookies.
Financial inputs and calculation results are not sent to analytics.
Downloads are built in the browser, so nothing is uploaded to make a CSV or Excel file.

Tests check this promise.
The privacy tests for GST late fee and TDS interest, and the GST calculator page test, fill in the form, copy results, import a file and download workings.
They fail if the calculator makes any network request: `fetch`, `XMLHttpRequest` or `sendBeacon`.
These component tests do not load the analytics script in the HTML template.
The prerendered HTML contains only page content and default form values, never user input.

## Tech stack

- Vite, React 19 and TypeScript.
- React Router v7, with routes built from one page registry.
- Tailwind CSS v4 and shared stylesheets in `src/styles/`.
- Zod for form validation.
- Vitest, Testing Library and jsdom for tests.
- A build-time prerender script that writes static HTML for every page.
- Hosted on Vercel as static files.

## Run it locally

You need Node.js 20.19 or newer.

Step one: install dependencies.

```sh
npm install
```

Step two: start the dev server.

```sh
npm run dev
```

Step three: run the tests.

```sh
npm test
```

Step four: build the site.

```sh
npm run build
```

The build type-checks the code, builds the browser bundle, builds a server bundle into `dist-ssr/`, and then runs `scripts/prerender.mjs`.
The prerender writes one HTML file per page into `dist/`, for example `dist/emi-calculator.html`.
It also writes `dist/404.html`, `dist/sitemap.xml` and `dist/robots.txt`.
`dist/` is the folder you deploy.
Run `npm run preview` to serve it locally.

Other scripts:

- `npm run lint` checks the code with ESLint.
- `npm run format` formats `src/` with Prettier.
- `npm run og-image` renders `public/og-image.png` after a brand change.
- `npx knip` finds unused files, exports and dependencies.

## Add a calculator

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first.
The short version is below.

Step one: create a folder in `src/tools/<your-tool>/`.
Keep the calculation in `calc.ts` as pure functions with no React imports.
Put form validation in `schema.ts` with Zod.
Put the figures your page guide quotes in `example.ts`, so a test can check them against `calc.ts`.

Step two: write the page module.
It exports `Component` and wraps the form, results and guide in the shared `CalculatorPage` layout.

Step three: add citations.
Add or reuse the source text in `src/lib/legal/sources/`.
Build the calculator's citations in `src/lib/legal/citations/<your-tool>.ts` and pass them to `CalculatorPage`.

Step four: add one entry to `src/data/tools.ts`.
It holds the name, path, SEO title and description, category, and a `load` function that imports the page module.
It also holds the direct answer shown under the heading, the FAQ, and the date the rules were last reviewed.
Keep the answer and FAQ in `src/tools/<your-tool>/faq.ts`, built from the verified constants where you can.
The route, head tags, breadcrumbs, JSON-LD, FAQ schema, homepage listing, prerendered HTML and sitemap entry with its last-modified date all come from this entry.

Step five: add tests in `tests/<your-tool>/`.
Add the page's expected heading to `tests/seo/prerender.test.ts`.

## How rules and sources are kept

Tax rules change every year, and section numbers changed completely when the Income-tax Act, 2025 replaced the 1961 Act on 1 April 2026.
[docs/RULES-REVIEW.md](docs/RULES-REVIEW.md) records every rule the calculators use, the primary source it was checked against, and the date of the check.
It also maps old section numbers to new ones.
[docs/TDS-RULES.md](docs/TDS-RULES.md) does the same for TDS interest in more detail.

In the code, `src/lib/legal/sources/` holds the text and URL of each Act, notification and RBI document.
`src/lib/legal/citations/` links those sources to each calculator.
Rates, slabs, caps and limits live in `src/lib/constants/`, with the section they come from in a comment.

## Contributing

Issues and pull requests are welcome.

- Write the failing test first, then the fix.
- A change to a rate, limit, due date or formula needs a primary source: the Act, the Gazette notification, a CBIC or CBDT circular, or an RBI document.
  Blog posts and other calculators are not enough.
  Link the source in the pull request and update `docs/RULES-REVIEW.md` and the matching file in `src/lib/legal/`.
- Keep inputs in the browser.
  A change that sends user input to a server will not be merged.
- Run `npm run lint`, `npm test` and `npm run build` before you open a pull request.

## Disclaimer

Khatakit is not tax, legal or financial advice.
The calculators are estimates based on the rules as we read them on the date in `docs/RULES-REVIEW.md`.
Check the figures with a chartered accountant or the official portal before you file or pay.

## License

MIT.
See [LICENSE](LICENSE).

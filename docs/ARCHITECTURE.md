# Architecture

> Update, 1 October 2026: EMI and the basic GST amount calculator have been retired. The active catalogue contains GST late fees, TDS interest, advance tax and presumptive tax. Earlier references below are historical.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Vite + React 19 + TypeScript | Fast builds, modern DX, type safety |
| Styling | Tailwind CSS v4 + shared stylesheets in `src/styles/` | Theme tokens in one file, shared component classes |
| Routing | React Router v7 data router, built from the page registry | Clean URLs for SEO, lazy loading, layout routes |
| SEO | Page registry + React 19 metadata tags + build-time prerender | Static HTML with metadata per page, hydrated in the browser |
| State | Local useState per tool | No shared state needed, zero overhead |
| Validation | Zod schemas per tool | Field-level error messages before any calculation |
| Testing | Vitest + Testing Library + jsdom | Same Vite ecosystem, fast unit and page tests |
| Downloads | CSV for every calculator; Excel (.xlsx) for TDS interest, written without a library | Generated in the browser, nothing uploaded |
| Icons | lucide-react, bundled | No icon requests to a third party |
| Deployment | Vercel (`vercel.json`, `cleanUrls`) | Static files; unknown URLs get the prerendered 404.html |
| Fonts | System UI font stack, system monospace for figures, Georgia for the wordmark | No web font downloads |

## Project Structure

```
khatakit/
├── public/
│   ├── favicon.svg
│   ├── logo-mark.svg
│   ├── logo.png                # Square logo for structured data, from npm run og-image
│   ├── icons/LUCIDE-LICENSE.txt
│   └── og-image.png            # Social image, from npm run og-image
├── scripts/
│   ├── prerender.mjs           # Writes page HTML, 404.html, sitemap.xml, robots.txt
│   └── og-image.mjs            # Renders public/og-image.png
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── SITEMAP.md
│   ├── RULES-REVIEW.md         # Tax rules checked against primary sources
│   └── TDS-RULES.md            # TDS interest rules checked against primary sources
├── src/
│   ├── components/
│   │   ├── brand/Logo.tsx
│   │   ├── layout/             # RootLayout, Header, Footer, PageShell, CalculatorPage
│   │   ├── ui/                 # NumberInput, DateInput, Select, RadioGroup, Button, Surface, ToolIcon, Disclaimer
│   │   └── calculator/         # ResultCard, BreakdownTable, CopyButton, DownloadButton, ResultJump,
│   │                           # CalculatorGuide, LoanBreakdown, RelatedTools, ValidationSummary
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   ├── tools/
│   │   ├── gst-late-fee/       # One folder per calculator
│   │   │   ├── GstLateFee.tsx   # Page module, exports Component
│   │   │   ├── GstForm.tsx      # Form inputs
│   │   │   ├── GstResults.tsx   # Results display
│   │   │   ├── GstGuide.tsx     # Method, worked examples, notes
│   │   │   ├── calc.ts          # Pure calculation logic
│   │   │   ├── schema.ts        # Zod validation of form values
│   │   │   ├── example.ts       # Guide figures, checked by tests
│   │   │   ├── csv.ts           # Download content
│   │   │   └── types.ts         # TypeScript types
│   │   ├── gst-calculator/
│   │   ├── advance-tax/
│   │   ├── emi/
│   │   ├── presumptive-tax/
│   │   └── tds-interest/        # Also bulk rows, CSV import and .xlsx export
│   ├── lib/
│   │   ├── constants/           # Tax slabs, GST late fee caps, presumptive limits
│   │   ├── legal/
│   │   │   ├── sources/         # Acts, notifications and RBI text with URLs
│   │   │   └── citations/       # Per-calculator citations built from sources
│   │   ├── tax/                 # Shared income tax computation
│   │   └── utils/               # format, date, csv, validation
│   ├── seo/
│   │   ├── pages.ts             # Page registry: paths, metadata, trails, JSON-LD
│   │   ├── schema.ts            # JSON-LD builders
│   │   ├── sitemap.ts           # sitemap.xml and robots.txt
│   │   ├── Seo.tsx              # Head tags for the current page
│   │   ├── site.ts              # Site URL and default social image
│   │   └── usePage.ts           # Registry page for the current URL
│   ├── data/
│   │   └── tools.ts             # Tool catalogue, also the calculator registry entries
│   ├── styles/                  # tokens.css and shared component stylesheets
│   ├── routes.ts                # Route tree built from the registry
│   ├── entry-client.tsx         # Loads matched lazy routes, then hydrates
│   ├── entry-server.tsx         # Renders a registry path to HTML
│   ├── main.tsx                 # Browser entry point
│   └── index.css                # Imports the stylesheets in cascade order
├── tests/
│   ├── <calculator>/            # calc, schema, example, page, csv and privacy tests
│   ├── catalogue/
│   ├── interactions/
│   ├── helpers/
│   └── seo/                     # Registry, prerender, sitemap and hydration tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
├── knip.json
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── LICENSE
└── README.md
```

## Key Patterns

### Calculation Logic Separation

Each calculator tool follows this pattern:
- `calc.ts` - Pure functions, zero React imports, fully testable
- `types.ts` - Input/output TypeScript interfaces
- `schema.ts` - Zod validation that turns form values into calc input or field errors
- `example.ts` - Figures quoted in the page guide, checked against calc by tests
- `Form.tsx` - Controlled inputs; the page recalculates as values change
- `Results.tsx` - Renders calc output, handles copy/download
- `Guide.tsx` - Method, worked examples and limits shown before any input
- The page module wraps these in `CalculatorPage` and passes citations from `src/lib/legal/citations/`

```typescript
// Example: calc.ts
export function calculateEmi(input: EmiInput): EmiResult {
  const r = input.annualRate / 12 / 100;
  const n = input.tenureMonths;
  const emi = (input.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { emi, totalInterest: emi * n - input.principal, totalPayable: emi * n };
}
```

### Routing

`src/seo/pages.ts` is the only place a public page is declared.
Each entry holds the path, title, description, canonical, breadcrumb trail, social image, JSON-LD and sitemap flag.
`src/routes.ts` turns the registry into lazy routes under `RootLayout`, plus a `*` route for the not-found page.
`RootLayout` renders the head tags for the matched page, and `PageShell` renders the visual breadcrumbs from the same trail.

To add a calculator, add an entry to `src/data/tools.ts` (name, path, SEO title and description, `load`) and create the page module exporting `Component`.
The route, head tags, breadcrumbs, JSON-LD, home catalogue schema, prerendered HTML and sitemap entry follow from that entry.
`tests/seo/prerender.test.ts` also needs the page's expected heading.

### SEO Strategy

1. `npm run build` builds the client, builds `src/entry-server.tsx` for Node, then runs `scripts/prerender.mjs`.
2. The prerender renders each registry path with the react-router static handler, writes that page's head tags straight from the registry, and writes `dist/index.html`, `dist/<path>.html` and `dist/404.html`.
   In the browser, React 19 hoists the same `<title>`, `<meta>` and `<link>` tags, adopts the prerendered ones on hydration and updates them on navigation.
   JSON-LD renders in the page body, on the server and in the browser, because React does not hoist scripts.
3. A file per path, not a folder index, so Vercel (`cleanUrls`) serves the extensionless canonical URL without a trailing-slash redirect.
4. The browser loads the lazy module for the current URL before `hydrateRoot`, so hydration reuses the prerendered markup.
5. The not-found page is `noindex` with no canonical; there is no catch-all rewrite, so hosts answer unknown URLs with 404.html and a 404 status.
6. `sitemap.xml` and `robots.txt` are generated from the registry. `public/og-image.png` is the default 1200x630 social image.
7. Generated HTML only contains registry data and default form state, never user input.

Performance figures below are targets, not measured results.

### Indian Number Formatting

```typescript
// 100000 → "1,00,000"
export function formatIndianNumber(num: number): string {
  const str = Math.round(num).toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return formatted + "," + last3;
}
```

## Performance Budget

| Metric | Target |
|---|---|
| Initial JS bundle | < 100KB gzipped |
| First Contentful Paint | < 1.5s |
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 100 |
| Lighthouse SEO | 100 |

Each calculator is lazy-loaded so the homepage stays fast.

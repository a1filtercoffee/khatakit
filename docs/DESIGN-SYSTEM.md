# Khatakit theme and component system

> Update, 1 October 2026: EMI and the basic GST amount calculator have been retired. The active catalogue contains GST late fees, TDS interest, advance tax and presumptive tax. Earlier references below are historical.

The site uses one light theme: warm paper, peach page headers, blue actions and restrained sage/sand supporting surfaces. The homepage, all six calculators, About and the missing-page screen share it. There is no separate colour scheme or stylesheet inside a page component.

## Where to change the design

| File | Responsibility |
|---|---|
| `src/styles/tokens.css` | The source of truth for colours, typography, spacing, radii, widths and motion durations. Tailwind's legacy utility names map back to these roles. |
| `src/styles/components.css` | Reusable page layouts, forms, panels, notices, results, tables and brand styling. |
| `src/styles/catalogue.css` | Catalogue composition and shared header/footer layout. Uses the same tokens. |
| `src/styles/interactions.css` | Focus/action feedback, copy status, reduced-motion behaviour and loan-chart presentation. |
| `src/styles/guide.css` | Calculator guides, related links and the repayment chart. |
| `src/styles/worksheet.css` | Row-based calculators: editable rows, per-row results and counted periods. |
| `src/styles/results-extra.css` | Bordered result figures, collapsible workings and formula lines. |
| `src/index.css` | Imports only; establishes the cascade order. |

Change `--peach` to update the homepage hero and every page masthead. Change `--action` for the shared action colour. Change `--radius-panel`, `--space-6`, `--page-width`, `--font-body` or `--motion-fast` to adjust the system at its source. Preserve sufficient contrast when editing the palette.

All raw UI colours belong in `tokens.css`. Components must use semantic variables or the shared classes; new pages must not introduce their own hex colours, input styles or copies of calculator layout markup. Page-specific geometry, such as the homepage's illustrative worksheet, can live in the catalogue stylesheet and still consumes theme tokens.

## Page composition

`PageShell` provides the container, breadcrumb, icon, heading, description, optional supported-period badge and optional "Rules last reviewed" date. Its `reading` variant provides a narrower layout for About and the missing-page screen.

`CalculatorPage` composes `PageShell` with the shared input panel, results area, a one-line caveat under a result, the "See result" jump link, the guide and the FAQ. It reads the heading, direct answer, category, icon, review date and FAQ from the tool's entry in `src/data/tools.ts`, found by `slug`. A tool page supplies content and calculation state:

```tsx
<CalculatorPage
  slug="example"
  formTitle="Your details"
  form={<ExampleForm input={input} onChange={setInput} />}
  hasResult={result !== null}
  caveat="One short sentence the reader must see next to the figure."
  guide={<ExampleGuide />}
>
  <ExampleResults result={result} />
</CalculatorPage>
```

`layout` is `split` (inputs beside results, the default) or `stacked` (inputs full width, results below). Use `stacked` when the results area needs the full page width, such as the TDS row editor.

Sources and assumptions live only in the guide. Every guide has a References section and an assumptions section. "Calculations stay in your browser" appears once, under the form.

Add a `period` only when the calculator supports that period. Styling changes must not silently advance tax years or imply rule verification.

## Shared components

- `Panel`, `EmptyState` and `Notice`: common surfaces. Notices support info, success and warning tones.
- `NumberInput`, `DateInput`, `Select` and `RadioGroup`: shared field labels, help, focus treatment and sizing. Dates use native date inputs with ISO values and min/max constraints. Segmented choices are native grouped radio inputs with normal keyboard behaviour.
- `Button`: primary, secondary and ghost variants, explicit busy/disabled states. Links use the corresponding `button button-*` classes.
- `ResultCard`: primary, neutral, success and error tones. Every figure uses `--type-figure` and never breaks inside a number.
- `BreakdownTable`: consistent headers/totals, right-aligned figures, keyboard-focusable horizontal scrolling with edge shading on the side that has more to scroll.
- `CalculatorGuide`, `GuideSection`, `Formula` and `ReferenceLinks`: the single-column guide under each calculator, capped at `--reading-width`.
- `ResultJump`: the "See result" link, shown below 900px once a result exists.
- `CopyButton`: confirmed success, honest failure guidance, restored focus after clipboard fallback and cleaned-up feedback timers.
- `LoanBreakdown`: amounts and percentages alongside the donut chart; no information available only on hover or through colour.

Tool forms use `form-stack`, plus `form-columns` and `form-span` for settings across a full-width panel; result compositions use `result-stack`, `result-grid`, `result-grid-three`, `comparison-grid`, `section-heading` and `section-title`. These are shared classes, not page-local styling.

## Brand

The new logo is a pair of offset ledger sheets beside a readable serif Khatakit wordmark. It replaces the stylised K/equals lockup. `src/components/brand/Logo.tsx` is the shared header/footer implementation; its colours and type come from theme tokens. The same ledger geometry is supplied in `public/logo-mark.svg` and `public/favicon.svg` for standalone use. Keep those standalone assets in sync if the mark changes.

Headline: **Accounting & tax tools**
Subtitle: **Tools for GST filing costs, TDS and income tax.**

Do not create new logo variations in page components. Use `Logo` and the existing compact footer treatment.

## Icons and motion

`ToolIcon` maps named roles to Lucide React icons, bundled locally. The upstream license is included at `public/icons/LUCIDE-LICENSE.txt`. Decorative icons are hidden from assistive technology and controls retain text labels.

Motion communicates changes rather than decorating the page: short press/focus/selection feedback, confirmed copy state and chart proportion transitions. Financial numbers update immediately without counting through invented intermediate values. Reduced motion disables these transitions and spinner rotation while preserving textual busy/status feedback.

## Responsive and accessibility checks

Calculator forms/results stack below 900px.
Result compositions respond to the width of the results column through the `results` container, not the viewport.
Three-card rows show three cards from 52rem, two below that with the first card spanning, and one below 34rem.
Regime comparisons sit side by side from 52rem and TDS period cards from 48rem.
Schedules scroll inside their own labelled region; long totals must not widen the page.
Text is never smaller than `--type-small` (12px), and `--muted` meets 4.5:1 on every surface, peach included.
Inputs, selects, row cells and the home search show a 2px `--action` ring on focus.
Breadcrumb, footer and copy/download targets are at least 44px tall on touch.
Inputs use readable text sizes, visible labels and associated help. The root layout provides a skip link.

Validate new tools in both empty and populated states, with keyboard navigation and at mobile/desktop widths. Automated tests render every registry page and the 404 page (`tests/seo/prerender.test.ts`) and check shared form behaviour (`tests/interactions/`). No test checks theme tokens, so check a token change on each page by eye.

## Writing style

Khatakit is a collection of free tools, not a product sales page. Use factual descriptions, task names and plain instructions. Describe what a tool calculates, its supported scope and where processing happens. Avoid benefit slogans, emotional promises, sales language and puns in headings or errors. Prefer “About Khatakit”, “Available calculators” and “Page not found” to promotional alternatives.

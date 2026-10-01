import type { Faq, PageLoader } from '../seo/types';
import * as advanceTax from '../tools/advance-tax/faq';
import * as gstLateFee from '../tools/gst-late-fee/faq';
import * as presumptiveTax from '../tools/presumptive-tax/faq';
import * as tdsInterest from '../tools/tds-interest/faq';

/**
 * Tool catalogue. Each entry is also the registry entry for its calculator
 * page (see src/seo/pages.ts): add a tool here plus its page module.
 */
export interface Tool {
  name: string;
  slug: string;
  path: string;
  description: string;
  /** One sentence for the homepage tile and the About page list. */
  summary: string;
  seoTitle: string;
  seoDescription: string;
  /** One or two sentences under the page heading that answer the core query with the rule and numbers. */
  answer: string;
  /** Questions shown on the page and published as FAQPage schema. Answers must follow the verified rules. */
  faq: Faq[];
  /** ISO date the rules were last checked against primary sources (docs/RULES-REVIEW.md). */
  rulesReviewed: string;
  contentUpdated?: string;
  /** Page module exporting `Component`. */
  load: PageLoader;
  icon: string;
  tags: string[];
  category: 'gst' | 'income-tax';
  keywords: string[];
  /** What the tool produces, shown at the foot of its homepage tile. */
  output: string;
}

export const tools: Tool[] = [
  {
    name: 'GST Late Fee & Interest Calculator',
    slug: 'gst-late-fee',
    path: '/gst-late-fee-interest-calculator',
    description:
      'Late fee under section 47 and interest under section 50 for GSTR-3B, GSTR-1 and GSTR-9, with turnover caps and the three-year filing limit.',
    summary: 'Work out the late fee and interest on a GSTR-3B, GSTR-1 or GSTR-9 filed late.',
    seoTitle: 'GST Late Fee & Interest Calculator - GSTR-3B, GSTR-1, GSTR-9',
    seoDescription:
      'GST late fee and interest for GSTR-3B, GSTR-1 and GSTR-9. Turnover caps, nil returns, CGST and SGST split, dated workings and CSV download.',
    answer: gstLateFee.ANSWER,
    faq: gstLateFee.FAQ,
    rulesReviewed: '2026-09-14',
    contentUpdated: '2026-10-01',
    load: () => import('../tools/gst-late-fee/GstLateFee'),
    icon: 'receipt',
    category: 'gst',
    keywords: [
      'gstr 3b',
      'gstr 1',
      'gstr 9',
      'annual return',
      'nil return',
      'late filing',
      'penalty',
      'interest',
      'section 47',
      'section 50',
      'goods and services tax',
    ],
    output: 'Late fee, interest and CGST/SGST split',
    tags: ['GST', 'Penalty', 'Interest'],
  },
  {
    name: 'Advance Tax Calculator',
    slug: 'advance-tax',
    path: '/advance-tax-calculator',
    description:
      'Compute quarterly advance tax instalments for tax year 2026-27. Compare old vs new regime side by side, with slab-wise workings.',
    summary:
      'Compare regimes, record advance-tax payments and find the remaining amount for the next deadline.',
    seoTitle: 'Advance Tax Calculator 2026-27 - Old & New Regime - Khatakit',
    seoDescription:
      'Calculate advance tax instalments for tax year 2026-27 (FY 2026-27). Compare old vs new regime, subtract payments already made and plan the next instalment.',
    answer: advanceTax.ANSWER,
    faq: advanceTax.FAQ,
    rulesReviewed: '2026-09-14',
    contentUpdated: '2026-10-01',
    load: () => import('../tools/advance-tax/AdvanceTax'),
    icon: 'calendar',
    category: 'income-tax',
    keywords: [
      'income tax',
      'instalments',
      'installments',
      'quarterly',
      'tax regime',
      'fy 2026-27',
      'section 408',
    ],
    output: 'Remaining payment and annual targets',
    tags: ['Income Tax', 'Quarterly', 'Old vs New'],
  },
  {
    name: 'Presumptive Tax Calculator',
    slug: 'presumptive-tax',
    path: '/presumptive-income-calculator',
    description:
      'Calculate presumptive income under section 58 (old 44AD for business, 44ADA for professionals). Turnover limits and tax estimate.',
    summary: 'Estimate income and tax under section 58 (old 44AD and 44ADA) for tax year 2026-27.',
    seoTitle: 'Presumptive Tax Calculator - 44AD, 44ADA, Section 58',
    seoDescription:
      'Calculate presumptive income under section 58 of the Income-tax Act, 2025 (old 44ADA for professionals and 44AD for businesses). 5% cash test and limits.',
    answer: presumptiveTax.ANSWER,
    faq: presumptiveTax.FAQ,
    rulesReviewed: '2026-09-14',
    contentUpdated: '2026-10-01',
    load: () => import('../tools/presumptive-tax/PresumptiveTax'),
    icon: 'briefcase',
    category: 'income-tax',
    keywords: ['44ad', '44ada', 'section 58', 'freelancer', 'professional', 'small business'],
    output: 'Presumptive income and tax estimate',
    tags: ['44AD', '44ADA', 'Presumptive'],
  },
  {
    name: 'TDS Interest Calculator',
    slug: 'tds-interest',
    path: '/tds-interest-calculator',
    description:
      'Interest on TDS deducted late (1%) or deposited late (1.5%), for one case or many rows. Due dates, months counted and a CSV or Excel download.',
    summary: 'Work out interest on TDS deducted or deposited late, for one case or many rows.',
    seoTitle: 'TDS Interest Calculator - Late Deduction & Late Deposit',
    seoDescription:
      'TDS interest under section 201(1A) and section 398: 1% a month for late deduction, 1.5% for late deposit. Due dates, months counted, CSV and Excel download.',
    answer: tdsInterest.ANSWER,
    faq: tdsInterest.FAQ,
    rulesReviewed: '2026-09-14',
    contentUpdated: '2026-10-01',
    load: () => import('../tools/tds-interest/TdsInterest'),
    icon: 'clock',
    category: 'income-tax',
    keywords: [
      'tds',
      '201(1a)',
      'section 398',
      'late payment',
      'late deduction',
      'traces',
      'challan',
      'bulk',
      'interest',
    ],
    output: 'Interest with due dates and months counted',
    tags: ['TDS', 'Interest', 'Bulk'],
  },
];

export const toolCategories = [
  {
    id: 'gst',
    label: 'GST',
    icon: 'receipt',
    description: 'Filing fees and interest, with the workings.',
  },
  {
    id: 'income-tax',
    label: 'Income Tax',
    icon: 'briefcase',
    description: 'Plan tax payments for your income or business.',
  },
] as const;

/** The most recent rules review across all calculators. */
export const latestRulesReview = tools
  .map((tool) => tool.rulesReviewed)
  .sort()
  .at(-1)!;

export function matchesTool(tool: Tool, query: string): boolean {
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  const haystack = normalise(
    [tool.name, tool.description, tool.summary, tool.output, ...tool.tags, ...tool.keywords].join(
      ' '
    )
  );
  return normalise(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

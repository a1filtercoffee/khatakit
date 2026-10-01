import type { AgeCategory, TaxRegime } from '../tax/types';

/** Supported period for the income-tax calculators. */
export const TAX_YEAR_LABEL = 'Tax year 2026-27';

export interface TaxBand {
  /** Upper end of the band (inclusive). */
  upTo: number;
  rate: number;
}

// Section 202(1), Income-tax Act, 2025 (default new regime).
export const NEW_REGIME_BANDS: readonly TaxBand[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

// Finance Act, 2026, First Schedule, Part III, Paragraph A (old regime).
export const OLD_REGIME_BANDS: Readonly<Record<AgeCategory, readonly TaxBand[]>> = {
  below60: [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 5 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 },
  ],
  '60to80': [
    { upTo: 300000, rate: 0 },
    { upTo: 500000, rate: 5 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 },
  ],
  above80: [
    { upTo: 500000, rate: 0 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 },
  ],
};

// Section 19(1), Table serial 2: capped at the salary amount.
export const STANDARD_DEDUCTION: Readonly<Record<TaxRegime, number>> = { new: 75000, old: 50000 };

// Section 156(1) (old regime) and 156(2) (new regime, with marginal relief).
export const REBATE: Readonly<Record<TaxRegime, { incomeLimit: number; maxRebate: number }>> = {
  old: { incomeLimit: 500000, maxRebate: 12500 },
  new: { incomeLimit: 1200000, maxRebate: 60000 },
};

// Finance Act, 2026, section 3(4) Table serial 1 (old) and 10 (new); marginal relief in 3(5).
export const SURCHARGE_BANDS: readonly { above: number; rate: number }[] = [
  { above: 5000000, rate: 10 },
  { above: 10000000, rate: 15 },
  { above: 20000000, rate: 25 },
  { above: 50000000, rate: 37 },
];
export const NEW_REGIME_SURCHARGE_CAP = 25;

// Finance Act, 2026, section 3: Health and Education Cess on income-tax and surcharge.
export const CESS_RATE = 4;

// Section 404: advance tax is payable where the tax is Rs 10,000 or more.
export const ADVANCE_TAX_THRESHOLD = 10000;

// Section 408(1): cumulative instalments for tax year 2026-27.
export const ADVANCE_TAX_SCHEDULE: readonly {
  label: string;
  dueDate: string;
  dueDateISO: string;
  cumulativePercent: number;
}[] = [
  { label: 'Q1', dueDate: '15 June 2026', dueDateISO: '2026-06-15', cumulativePercent: 15 },
  { label: 'Q2', dueDate: '15 September 2026', dueDateISO: '2026-09-15', cumulativePercent: 45 },
  { label: 'Q3', dueDate: '15 December 2026', dueDateISO: '2026-12-15', cumulativePercent: 75 },
  { label: 'Q4', dueDate: '15 March 2027', dueDateISO: '2027-03-15', cumulativePercent: 100 },
];

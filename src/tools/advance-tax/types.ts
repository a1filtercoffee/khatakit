import type { AgeCategory, TaxRegime } from '../../lib/tax/types';

export type { AgeCategory, TaxRegime };

export interface AdvanceTaxInput {
  regime: TaxRegime;
  grossIncome: number;
  /** Salary or pension included in grossIncome. Standard deduction applies only to this. */
  salaryIncome?: number;
  deductions: number; // applicable only for old regime
  tdsDeducted: number;
  ageCategory: AgeCategory;
  /** Seniors with no business or professional income are outside advance tax (section 403(3)). */
  hasBusinessIncome?: boolean;
}

export interface TaxComputation {
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  taxOnIncome: number;
  rebate: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  tdsDeducted: number;
  netTaxPayable: number;
  seniorCitizenExempt: boolean;
  isAdvanceTaxApplicable: boolean;
}

export interface QuarterlyInstallment {
  quarter: string;
  dueDate: string;
  dueDateISO: string;
  cumulativePercent: number;
  cumulativeAmount: number;
  installmentAmount: number;
}

export interface AdvanceTaxResult {
  oldRegime: TaxComputation;
  newRegime: TaxComputation;
  selectedRegime: TaxRegime;
  schedule: QuarterlyInstallment[];
}

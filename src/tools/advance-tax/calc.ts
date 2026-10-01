import type {
  AdvanceTaxInput,
  AdvanceTaxResult,
  QuarterlyInstallment,
  TaxComputation,
  TaxRegime,
} from './types';
import { computeIncomeTax } from '../../lib/tax/income-tax';
import {
  ADVANCE_TAX_SCHEDULE,
  ADVANCE_TAX_THRESHOLD,
  STANDARD_DEDUCTION,
} from '../../lib/constants/tax-slabs';

function computeForRegime(input: AdvanceTaxInput, regime: TaxRegime): TaxComputation {
  const grossIncome = Math.max(0, input.grossIncome);
  const salary = Math.min(Math.max(0, input.salaryIncome ?? 0), grossIncome);
  const standardDeduction = Math.min(STANDARD_DEDUCTION[regime], salary);
  const otherDeductions = regime === 'new' ? 0 : Math.max(0, input.deductions);
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - otherDeductions);

  const tax = computeIncomeTax(taxableIncome, regime, input.ageCategory);
  const tdsDeducted = Math.max(0, input.tdsDeducted);
  const netTaxPayable = Math.max(0, tax.totalTax - tdsDeducted);
  // Section 403(3): resident aged 60 or more with no business or professional income.
  const seniorCitizenExempt = input.ageCategory !== 'below60' && !input.hasBusinessIncome;

  return {
    grossIncome,
    standardDeduction,
    otherDeductions,
    taxableIncome,
    ...tax,
    tdsDeducted,
    netTaxPayable,
    seniorCitizenExempt,
    isAdvanceTaxApplicable: !seniorCitizenExempt && netTaxPayable >= ADVANCE_TAX_THRESHOLD,
  };
}

function computeSchedule(netTaxPayable: number): QuarterlyInstallment[] {
  return ADVANCE_TAX_SCHEDULE.map((q, index) => {
    const cumulativeAmount = Math.round((netTaxPayable * q.cumulativePercent) / 100);
    const previous =
      index === 0
        ? 0
        : Math.round((netTaxPayable * ADVANCE_TAX_SCHEDULE[index - 1].cumulativePercent) / 100);
    return {
      quarter: q.label,
      dueDate: q.dueDate,
      dueDateISO: q.dueDateISO,
      cumulativePercent: q.cumulativePercent,
      cumulativeAmount,
      installmentAmount: cumulativeAmount - previous,
    };
  });
}

export function calculateAdvanceTax(input: AdvanceTaxInput): AdvanceTaxResult {
  const oldRegime = computeForRegime(input, 'old');
  const newRegime = computeForRegime(input, 'new');
  const selected = input.regime === 'old' ? oldRegime : newRegime;

  return {
    oldRegime,
    newRegime,
    selectedRegime: input.regime,
    schedule: selected.isAdvanceTaxApplicable ? computeSchedule(selected.netTaxPayable) : [],
  };
}

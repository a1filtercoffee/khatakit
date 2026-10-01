import { toCsv } from '../../lib/utils/csv';
import { formatCurrency } from '../../lib/utils/format';
import { TAX_YEAR_LABEL } from '../../lib/constants/tax-slabs';
import type { AdvanceTaxResult } from './types';

const regimeName = (result: AdvanceTaxResult) =>
  result.selectedRegime === 'new' ? 'New regime' : 'Old regime';

const selectedComputation = (result: AdvanceTaxResult) =>
  result.selectedRegime === 'new' ? result.newRegime : result.oldRegime;

export function advanceTaxCsv(result: AdvanceTaxResult): string {
  const comp = selectedComputation(result);
  return toCsv([
    ['Advance tax', TAX_YEAR_LABEL],
    ['Regime', regimeName(result)],
    ['Total tax', comp.totalTax],
    ['Expected annual TDS / TCS', comp.tdsDeducted],
    ['Net tax payable', comp.netTaxPayable],
    [],
    ['Instalment', 'Due date', 'Cumulative %', 'Planned instalment', 'Cumulative amount'],
    ...result.schedule.map((q) => [
      q.quarter,
      q.dueDate,
      q.cumulativePercent,
      q.installmentAmount,
      q.cumulativeAmount,
    ]),
  ]);
}

export function advanceTaxFilename(result: AdvanceTaxResult): string {
  return `advance-tax-2026-27-${result.selectedRegime}-regime.csv`;
}

export function advanceTaxText(result: AdvanceTaxResult): string {
  const comp = selectedComputation(result);
  return [
    `Advance tax, ${TAX_YEAR_LABEL.toLowerCase()}, ${regimeName(result).toLowerCase()}`,
    `Net tax payable: ${formatCurrency(comp.netTaxPayable)}`,
    ...result.schedule.map(
      (q) =>
        `${q.dueDate}: ${formatCurrency(q.installmentAmount)} (${q.cumulativePercent}% cumulative, ${formatCurrency(q.cumulativeAmount)})`
    ),
  ].join('\n');
}

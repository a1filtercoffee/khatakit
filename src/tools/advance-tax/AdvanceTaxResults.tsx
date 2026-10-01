import { EmptyState, Notice } from '../../components/ui/Surface';
import ResultCard from '../../components/calculator/ResultCard';
import BreakdownTable from '../../components/calculator/BreakdownTable';
import CopyButton from '../../components/calculator/CopyButton';
import DownloadButton from '../../components/calculator/DownloadButton';
import ValidationSummary from '../../components/calculator/ValidationSummary';
import { formatCurrency } from '../../lib/utils/format';
import { advanceTaxCsv, advanceTaxFilename, advanceTaxText } from './csv';
import TaxSheet from './TaxSheet';
import PaymentPlanner from './PaymentPlanner';
import type { AdvanceTaxField } from './schema';
import type { AdvanceTaxInput, AdvanceTaxResult } from './types';

interface AdvanceTaxResultsProps {
  input: AdvanceTaxInput | null;
  result: AdvanceTaxResult | null;
  errors: Partial<Record<AdvanceTaxField, string>>;
}

export default function AdvanceTaxResults({ input, result, errors }: AdvanceTaxResultsProps) {
  if (Object.keys(errors).length > 0) return <ValidationSummary errors={errors} />;
  if (!input || !result) {
    return (
      <EmptyState>
        Enter your gross total income to compare both regimes and see the instalment schedule.
      </EmptyState>
    );
  }

  const selectedName = result.selectedRegime === 'old' ? 'Old' : 'New';
  const otherName = result.selectedRegime === 'old' ? 'New' : 'Old';
  const selected = result.selectedRegime === 'old' ? result.oldRegime : result.newRegime;
  const other = result.selectedRegime === 'old' ? result.newRegime : result.oldRegime;
  const savings = other.netTaxPayable - selected.netTaxPayable;

  return (
    <div className="result-stack">
      <div className="result-grid">
        <ResultCard
          label="Net tax payable"
          value={formatCurrency(selected.netTaxPayable)}
          variant={selected.netTaxPayable === 0 ? 'success' : 'primary'}
          subtext={`${selectedName} regime, after TDS`}
        />
        <ResultCard
          label={savings > 0 ? 'You save (vs other regime)' : 'Comparison'}
          value={formatCurrency(Math.abs(savings))}
          variant={savings > 0 ? 'success' : 'neutral'}
          subtext={
            savings > 0
              ? `${selectedName} regime is lower for this income`
              : savings < 0
                ? `${otherName} regime saves ${formatCurrency(Math.abs(savings))}`
                : 'Both regimes result in the same tax'
          }
        />
      </div>

      {result.schedule.length > 0 && <PaymentPlanner schedule={result.schedule} />}

      {result.schedule.length > 0 && (
        <div>
          <div className="section-heading">
            <h3 className="section-title">Annual instalment targets</h3>
            <div className="result-actions">
              <CopyButton text={advanceTaxText(result)} label="Copy annual targets" />
              <DownloadButton
                label="Download CSV"
                filename={advanceTaxFilename(result)}
                getContent={() => advanceTaxCsv(result)}
              />
            </div>
          </div>
          <BreakdownTable
            columns={[
              { key: 'quarter', label: 'Instalment', align: 'left' },
              { key: 'dueDate', label: 'Due date', align: 'left' },
              { key: 'percent', label: 'Cumulative %', align: 'right', mono: true },
              { key: 'installment', label: 'Planned instalment', align: 'right', mono: true },
              { key: 'cumulative', label: 'Cumulative', align: 'right', mono: true },
            ]}
            rows={result.schedule.map((q) => ({
              quarter: q.quarter,
              dueDate: q.dueDate,
              percent: `${q.cumulativePercent}%`,
              installment: formatCurrency(q.installmentAmount),
              cumulative: formatCurrency(q.cumulativeAmount),
            }))}
            caption="Quarterly advance tax schedule"
          />
          <p className="field-help">
            Planned instalment is {selectedName.toLowerCase()} regime net tax × cumulative %, less
            the earlier instalments. Presumptive filers under section 58(2) pay the whole amount by
            15 March 2027.
          </p>
        </div>
      )}

      {!selected.isAdvanceTaxApplicable && (
        <Notice title="Advance tax not applicable" tone="success">
          {selected.seniorCitizenExempt
            ? 'Resident individuals aged 60 or more with no business or professional income do not pay advance tax. Pay any tax due as self-assessment tax before filing your return.'
            : `Net tax after TDS is ${formatCurrency(selected.netTaxPayable)}. Advance tax applies only at ₹10,000 or more.`}
        </Notice>
      )}

      <div className="comparison-grid">
        <TaxSheet
          regime="new"
          age={input.ageCategory}
          comp={result.newRegime}
          selected={result.selectedRegime === 'new'}
        />
        <TaxSheet
          regime="old"
          age={input.ageCategory}
          comp={result.oldRegime}
          selected={result.selectedRegime === 'old'}
        />
      </div>
    </div>
  );
}

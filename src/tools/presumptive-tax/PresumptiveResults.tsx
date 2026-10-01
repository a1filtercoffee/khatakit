import { EmptyState, Notice } from '../../components/ui/Surface';
import ResultCard from '../../components/calculator/ResultCard';
import BreakdownTable from '../../components/calculator/BreakdownTable';
import CopyButton from '../../components/calculator/CopyButton';
import DownloadButton from '../../components/calculator/DownloadButton';
import ValidationSummary from '../../components/calculator/ValidationSummary';
import { ADVANCE_TAX_THRESHOLD } from '../../lib/constants/tax-slabs';
import { formatCurrency, formatPercent } from '../../lib/utils/format';
import { presumptiveCsv, presumptiveFilename, presumptiveLines, presumptiveText } from './csv';
import type { PresumptiveField } from './schema';
import type { PresumptiveResult } from './types';
import type { TaxRegime } from '../../lib/tax/types';

interface PresumptiveResultsProps {
  result: PresumptiveResult | null;
  regime: TaxRegime;
  errors: Partial<Record<PresumptiveField, string>>;
}

export default function PresumptiveResults({ result, regime, errors }: PresumptiveResultsProps) {
  if (Object.keys(errors).length > 0) return <ValidationSummary errors={errors} />;
  if (!result) return <EmptyState>Enter your receipts to see the calculation.</EmptyState>;

  if (!result.isWithinLimit) {
    return (
      <Notice title="Receipts above the limit" tone="warning">
        Gross receipts of {formatCurrency(result.grossReceipts)} exceed the{' '}
        {formatCurrency(result.applicableLimit)} limit for your cash share. This scheme is
        unavailable for these entries, so no tax estimate is shown. Ask your accountant about
        calculating tax from actual income and expenses.
      </Notice>
    );
  }

  const rows = presumptiveLines(result, regime).map((line) => ({
    item: line.item,
    amount: typeof line.amount === 'number' ? formatCurrency(line.amount) : line.amount,
  }));

  return (
    <div className="result-stack">
      <div className="result-grid result-grid-three">
        <ResultCard
          label="Presumptive income"
          value={formatCurrency(result.presumptiveIncome)}
          variant="primary"
          subtext={`${formatPercent(result.presumptiveRate, 2)} of gross receipts`}
        />
        <ResultCard
          label="Total tax"
          value={formatCurrency(result.totalTax)}
          variant={result.totalTax === 0 ? 'success' : 'neutral'}
          subtext={regime === 'new' ? 'New regime' : 'Old regime, below-60 slabs'}
        />
        <ResultCard
          label="Effective tax rate"
          value={formatPercent(result.effectiveRate)}
          variant="neutral"
          subtext="On gross receipts"
        />
      </div>

      <div>
        <div className="section-heading">
          <h3 className="section-title">Tax computation</h3>
          <div className="result-actions">
            <CopyButton text={presumptiveText(result, regime)} label="Copy" />
            <DownloadButton
              label="Download CSV"
              filename={presumptiveFilename(result, regime)}
              getContent={() => presumptiveCsv(result, regime)}
            />
          </div>
        </div>
        <BreakdownTable
          columns={[
            { key: 'item', label: 'Particulars', align: 'left' },
            { key: 'amount', label: 'Amount', align: 'right', mono: true },
          ]}
          rows={rows}
          footer={{ item: 'Total tax payable', amount: formatCurrency(result.totalTax) }}
          caption="Presumptive tax computation"
        />
      </div>

      {result.totalTax >= ADVANCE_TAX_THRESHOLD && (
        <Notice title="Advance tax by 15 March 2027" tone="info">
          Presumptive filers pay the whole advance tax in one instalment by 15 March 2027 (section
          408(2)). On this estimate that is {formatCurrency(result.totalTax)}, less any TDS. It
          applies when tax after TDS is ₹10,000 or more.
        </Notice>
      )}
    </div>
  );
}

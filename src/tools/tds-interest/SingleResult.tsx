import BreakdownTable from '../../components/calculator/BreakdownTable';
import CopyButton from '../../components/calculator/CopyButton';
import DownloadButton from '../../components/calculator/DownloadButton';
import ResultCard from '../../components/calculator/ResultCard';
import { Notice } from '../../components/ui/Surface';
import { summarise } from './calc';
import { formatDisplayDate } from './dates';
import { summaryText, workingsCsv, workingsTable } from './export';
import { formatPaise, formatRupees } from './format';
import PeriodCard from './PeriodCard';
import type { CaseResult, DraftRow, Period, SheetOptions } from './types';
import XlsxButton from './XlsxButton';

interface Props {
  result: CaseResult;
  draft: DraftRow;
  options: SheetOptions;
}

const periodCell = (period: Period | null, method: 'calendar' | 'thirty') => {
  if (!period) return 'None';
  const months = method === 'calendar' ? period.months.length : period.thirtyDayMonths;
  const paise = method === 'calendar' ? period.calendarPaise : period.thirtyDayPaise;
  return `${months} × ${period.ratePercent}% = ${formatPaise(paise)}`;
};

export default function SingleResult({ result, draft, options }: Props) {
  const sheet = summarise([result]);
  const filename = `tds-interest-${draft.deducted || draft.deductible}`;
  const warn = result.estimate || result.straddles || result.base === 0;

  return (
    <div className="result-stack">
      <Notice title="Comparing with a TRACES demand?" tone="info">
        Start with the calendar-month working and compare the dates and amounts against your
        justification report. The 30-day calculation is an alternative comparison, not an
        instruction to pay the lower amount. This tool covers interest; a demand may also include
        fees or other defaults.
      </Notice>
      <div className="result-grid result-grid-three">
        <ResultCard
          label="Interest, calendar months"
          value={formatPaise(result.totalCalendarPaise)}
          subtext="Months counted the way TRACES counts them"
        />
        <ResultCard
          label="Interest, 30-day months"
          value={formatPaise(result.totalThirtyDayPaise)}
          variant="neutral"
          subtext="Months of 30 days, as in several tribunal rulings"
        />
        <ResultCard
          label="Due date for deposit"
          value={result.dueDate ? formatDisplayDate(result.dueDate) : 'Not deducted yet'}
          variant="neutral"
          subtext={result.dueDate ? result.dueDateBasis : undefined}
        />
      </div>

      {result.notes.length > 0 && (
        <Notice title={result.estimate ? 'Estimate' : 'Notes'} tone={warn ? 'warning' : 'info'}>
          <ul className="notice-list">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Notice>
      )}

      <div>
        <div className="section-heading">
          <h3 className="section-title">Workings</h3>
          <div className="result-actions">
            <CopyButton text={summaryText(sheet)} label="Copy" />
            <DownloadButton
              label="Download CSV"
              filename={`${filename}.csv`}
              getContent={() => workingsCsv([draft], sheet, options)}
            />
            <XlsxButton
              label="Download Excel"
              filename={`${filename}.xlsx`}
              getRows={() => workingsTable([draft], sheet, options)}
            />
          </div>
        </div>

        {result.lateDeduction || result.lateDeposit ? (
          <div className="period-list">
            {result.lateDeduction && (
              <PeriodCard title="Late deduction" period={result.lateDeduction} base={result.base} />
            )}
            {result.lateDeposit && (
              <PeriodCard title="Late deposit" period={result.lateDeposit} base={result.base} />
            )}
          </div>
        ) : (
          <Notice title="No interest" tone="success">
            Tax was deducted by the date it was deductible and deposited by the due date.
          </Notice>
        )}
      </div>

      <div>
        <BreakdownTable
          caption="Interest by period, both month methods"
          columns={[
            { key: 'item', label: 'Item', align: 'left' },
            { key: 'calendar', label: 'Calendar months', align: 'right', mono: true },
            { key: 'thirty', label: '30-day months', align: 'right', mono: true },
          ]}
          rows={[
            {
              item: `Amount for interest (${formatRupees(result.amount)} rounded down to a multiple of ₹100)`,
              calendar: formatRupees(result.base),
              thirty: formatRupees(result.base),
            },
            {
              item: 'Late deduction, 1% a month',
              calendar: periodCell(result.lateDeduction, 'calendar'),
              thirty: periodCell(result.lateDeduction, 'thirty'),
            },
            {
              item: 'Late deposit, 1.5% a month',
              calendar: periodCell(result.lateDeposit, 'calendar'),
              thirty: periodCell(result.lateDeposit, 'thirty'),
            },
          ]}
          footer={{
            item: 'Total interest',
            calendar: formatPaise(result.totalCalendarPaise),
            thirty: formatPaise(result.totalThirtyDayPaise),
          }}
        />
        <p className="workings-note">
          Provision: {result.provision.section}, {result.provision.actName}. Due date:{' '}
          {result.provision.rule}.
        </p>
        <p className="workings-note">
          Rounded to the nearest ₹10 under section 288B (1961 Act) or section 516 (2025 Act):{' '}
          {formatRupees(sheet.roundedCalendarRupees)} in calendar months,{' '}
          {formatRupees(sheet.roundedThirtyDayRupees)} in 30-day months. Whether TRACES rounds TDS
          interest this way is not confirmed.
        </p>
      </div>
    </div>
  );
}

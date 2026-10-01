import CopyButton from '../../components/calculator/CopyButton';
import DownloadButton from '../../components/calculator/DownloadButton';
import ResultCard from '../../components/calculator/ResultCard';
import { EmptyState, Notice } from '../../components/ui/Surface';
import { compactMonths, formatDisplayDate, formatSlashDate } from './dates';
import { summaryText, workingsCsv, workingsTable } from './export';
import { formatPaise, formatRupees, plural } from './format';
import type { DraftRow, Period, SheetOptions, SheetResult } from './types';
import XlsxButton from './XlsxButton';

interface Props {
  sheet: SheetResult;
  drafts: DraftRow[];
  options: SheetOptions;
}

function PeriodSummary({ period }: { period: Period | null }) {
  if (!period) return <span className="cell-sub">None</span>;
  return (
    <>
      <span className="cell-number">{formatPaise(period.calendarPaise)}</span>
      <span className="cell-sub">
        {compactMonths(period.months)} ({period.months.length})
      </span>
      <span className="cell-sub">
        30-day: {period.thirtyDayMonths} = {formatPaise(period.thirtyDayPaise)}
      </span>
    </>
  );
}

export default function BulkResults({ sheet, drafts, options }: Props) {
  if (sheet.calculatedCount === 0 && sheet.errorCount === 0) {
    return (
      <EmptyState>
        Type rows in the table, paste cells copied from a spreadsheet, or upload a CSV file.
      </EmptyState>
    );
  }
  const filename = `tds-interest-workings-${options.asOf}`;

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
          label="Total, calendar months"
          value={formatPaise(sheet.totalCalendarPaise)}
          subtext={`Rounded to nearest ₹10: ${formatRupees(sheet.roundedCalendarRupees)}`}
        />
        <ResultCard
          label="Total, 30-day months"
          value={formatPaise(sheet.totalThirtyDayPaise)}
          variant="neutral"
          subtext={`Rounded to nearest ₹10: ${formatRupees(sheet.roundedThirtyDayRupees)}`}
        />
        <ResultCard
          label="Rows"
          value={`${sheet.calculatedCount} calculated`}
          variant={sheet.errorCount > 0 ? 'error' : 'neutral'}
          subtext={
            sheet.errorCount > 0
              ? `${plural(sheet.errorCount, 'row has', 'rows have')} errors`
              : 'No rows with errors'
          }
        />
      </div>

      {sheet.estimateCount > 0 && (
        <Notice title="Estimates" tone="warning">
          {plural(sheet.estimateCount, 'row is', 'rows are')} worked out to{' '}
          {formatDisplayDate(options.asOf)} because the date deducted or deposited is blank.
        </Notice>
      )}

      <div>
        <div className="section-heading">
          <h3 className="section-title">Workings by row</h3>
          <div className="result-actions">
            <CopyButton text={summaryText(sheet)} label="Copy" />
            <DownloadButton
              label="Download CSV"
              filename={`${filename}.csv`}
              getContent={() => workingsCsv(drafts, sheet, options)}
            />
            <XlsxButton
              label="Download Excel"
              filename={`${filename}.xlsx`}
              getRows={() => workingsTable(drafts, sheet, options)}
            />
          </div>
        </div>
        <div className="breakdown-scroll" role="region" aria-label="Interest by row" tabIndex={0}>
          <table className="breakdown-table results-table">
            <thead>
              <tr>
                <th scope="col" className="cell-right">
                  #
                </th>
                <th scope="col" className="cell-left">
                  Label
                </th>
                <th scope="col" className="cell-left">
                  Due date
                </th>
                <th scope="col" className="cell-right">
                  Late deduction, 1%
                </th>
                <th scope="col" className="cell-right">
                  Late deposit, 1.5%
                </th>
                <th scope="col" className="cell-right">
                  Total, calendar
                </th>
                <th scope="col" className="cell-right">
                  Total, 30-day
                </th>
                <th scope="col" className="cell-left">
                  Provision
                </th>
              </tr>
            </thead>
            <tbody>
              {sheet.outcomes.map((outcome, index) => {
                if (outcome.status === 'blank') return null;
                const key = drafts[index].id;
                if (outcome.status === 'error') {
                  return (
                    <tr key={key}>
                      <td className="cell-right">{index + 1}</td>
                      <td className="cell-left">{outcome.label}</td>
                      <td colSpan={6} className="row-error-cell">
                        Not calculated. {outcome.errors.join(' ')}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={key}>
                    <td className="cell-right">{index + 1}</td>
                    <td className="cell-left">{outcome.label}</td>
                    <td className="cell-left cell-number">
                      {outcome.dueDate ? formatSlashDate(outcome.dueDate) : 'Not deducted'}
                    </td>
                    <td className="cell-right">
                      <PeriodSummary period={outcome.lateDeduction} />
                    </td>
                    <td className="cell-right">
                      <PeriodSummary period={outcome.lateDeposit} />
                    </td>
                    <td className="cell-right cell-number">
                      {formatPaise(outcome.totalCalendarPaise)}
                      {outcome.estimate && <span className="cell-sub">Estimate</span>}
                    </td>
                    <td className="cell-right cell-number">
                      {formatPaise(outcome.totalThirtyDayPaise)}
                    </td>
                    <td className="cell-left">
                      {outcome.provision.section}
                      <span className="cell-sub">{outcome.provision.actName}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="cell-left" colSpan={5}>
                  Total
                </td>
                <td className="cell-right cell-number">{formatPaise(sheet.totalCalendarPaise)}</td>
                <td className="cell-right cell-number">{formatPaise(sheet.totalThirtyDayPaise)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

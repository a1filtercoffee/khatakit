import BreakdownTable from '../../components/calculator/BreakdownTable';
import CalculatorGuide, {
  Formula,
  GuideSection,
} from '../../components/calculator/CalculatorGuide';
import RelatedTools from '../../components/calculator/RelatedTools';
import { tdsInterestCitations } from '../../lib/legal/citations/tds-interest';
import { INDIAN_KANOON } from '../../lib/legal/sources/tds-interest';
import { compactMonths, formatDisplayDate } from './dates';
import { MARCH, ONE_DAY_LATE, WORKED } from './example';
import { formatPaise, formatRupees } from './format';

const w = WORKED.result;
const late = ONE_DAY_LATE.result;
const march = MARCH.result;

export default function TdsGuide() {
  return (
    <CalculatorGuide
      title="How TDS interest is calculated"
      sections={[
        { id: 'interest-rates', title: 'What are the TDS interest rates?' },
        { id: 'deposit-due-dates', title: 'When is TDS due for deposit?' },
        { id: 'worked-example', title: 'Worked example' },
        { id: 'counting-months', title: 'Does TDS interest use calendar months or 30-day months?' },
        { id: 'edge-cases', title: 'Edge cases' },
        { id: 'assumptions', title: 'Assumptions and supported period' },
        { id: 'references', title: 'References' },
        { id: 'related-calculators', title: 'Related calculators' },
      ]}
    >
      <GuideSection id="interest-rates" title="What are the TDS interest rates?">
        <p>
          Late deduction costs 1% a month and late deposit costs 1.5% a month, on the TDS amount.
        </p>
        <Formula
          where={
            <>
              From the date tax was deductible (the date of credit or payment, whichever was
              earlier) to the date it was deducted.
            </>
          }
        >
          Late deduction = amount × 1% × months
        </Formula>
        <Formula where="From the date tax was deducted to the date it was deposited. Charged only when the deposit is after the due date.">
          Late deposit = amount × 1.5% × months
        </Formula>
        <ul>
          <li>
            The amount is the TDS rounded down to a multiple of ₹100 (Rule 119A(c), 1962 Rules).
          </li>
          <li>Every month or part of a month counts as a full month.</li>
          <li>Both kinds of interest can apply to the same amount. They are added together.</li>
        </ul>
      </GuideSection>

      <GuideSection id="deposit-due-dates" title="When is TDS due for deposit?">
        <p>
          TDS deducted in any month is due by the 7th of the next month. TDS deducted in March is
          due by 30 April, or by 7 April for a government office paying by challan. A government
          office paying without a challan deposits it the same day.
        </p>
        <BreakdownTable
          caption="Due dates by deductor"
          columns={[
            { key: 'who', label: 'Deductor', align: 'left' },
            { key: 'march', label: 'Deducted in March', align: 'left' },
            { key: 'other', label: 'Other months', align: 'left' },
          ]}
          rows={[
            { who: 'Not a government office', march: '30 April', other: '7th of next month' },
            { who: 'Government office, by challan', march: '7 April', other: '7th of next month' },
            { who: 'Government office, no challan', march: 'Same day', other: 'Same day' },
          ]}
        />
        <p>
          Rule 30 of the Income-tax Rules, 1962 until 31 March 2026, and Rule 218 of the Income-tax
          Rules, 2026 from 1 April 2026. The dates are the same in both.
        </p>
      </GuideSection>

      <GuideSection id="worked-example" title="Worked example">
        <p>
          TDS of {formatRupees(w.amount)} became deductible on{' '}
          {formatDisplayDate(WORKED.input.deductibleOn)}, was deducted on{' '}
          {formatDisplayDate(WORKED.input.deductedOn)} and deposited on{' '}
          {formatDisplayDate(WORKED.input.depositedOn)}. The due date is{' '}
          {formatDisplayDate(w.dueDate!)}, the 7th of the month after deduction, so both kinds of
          interest apply.
        </p>
        <ol>
          <li>
            Late deduction: {compactMonths(w.lateDeduction!.months)} is{' '}
            {w.lateDeduction!.months.length} months. {w.lateDeduction!.months.length} × 1% ×{' '}
            {formatRupees(w.base)} = {formatPaise(w.lateDeduction!.calendarPaise)}.
          </li>
          <li>
            Late deposit: {compactMonths(w.lateDeposit!.months)} is {w.lateDeposit!.months.length}{' '}
            months. The deduction month counts again. {w.lateDeposit!.months.length} × 1.5% ×{' '}
            {formatRupees(w.base)} = {formatPaise(w.lateDeposit!.calendarPaise)}.
          </li>
          <li>
            Total: {formatPaise(w.totalCalendarPaise)} in calendar months. With 30-day months it is{' '}
            {formatPaise(w.totalThirtyDayPaise)}: {w.lateDeduction!.days} days is{' '}
            {w.lateDeduction!.thirtyDayMonths} months at 1%, and {w.lateDeposit!.days} days is{' '}
            {w.lateDeposit!.thirtyDayMonths} months at 1.5%.
          </li>
        </ol>
      </GuideSection>

      <GuideSection
        id="counting-months"
        title="Does TDS interest use calendar months or 30-day months?"
      >
        <p>
          TRACES uses calendar months. Several tribunal rulings use 30-day months, so the calculator
          shows both.
        </p>
        <p>
          The TRACES help page counts calendar months from the day after deduction to the date of
          deposit. Its example: deducted 10 June 2023 and deposited 8 August 2023 is 3 months.
        </p>
        <p>
          Several tribunal rulings, including UTI Mutual Fund v. DCIT (ITAT Mumbai, 2019), read a
          month as 30 days. The two methods differ when a period crosses a month end but is shorter
          than 30 days.
        </p>
        <p>
          Example: {formatRupees(late.amount)} deducted on{' '}
          {formatDisplayDate(ONE_DAY_LATE.input.deductedOn)} and deposited on{' '}
          {formatDisplayDate(ONE_DAY_LATE.input.depositedOn)}, one day after the due date. Calendar
          months count {compactMonths(late.lateDeposit!.months)}:{' '}
          {formatPaise(late.totalCalendarPaise)}. The {late.lateDeposit!.days} days are one 30-day
          month: {formatPaise(late.totalThirtyDayPaise)}.
        </p>
        <p>
          The calculator shows calendar months as the main answer, because TRACES demands use them.
        </p>
      </GuideSection>

      <GuideSection id="edge-cases" title="Edge cases">
        <ul>
          <li>Deposit on the due date: no late-deposit interest.</li>
          <li>
            March deductions are due by 30 April. {formatRupees(march.amount)} deducted on 20 March
            2026 and deposited on 5 May 2026 counts {compactMonths(march.lateDeposit!.months)}:{' '}
            {formatPaise(march.totalCalendarPaise)}.
          </li>
          <li>
            Straddling 1 April 2026: the Act is chosen by the date tax became deductible. Tax
            deductible before 1 April 2026 stays under section 201(1A) of the 1961 Act, and its
            months are counted as one period. Section 536(2)(g) of the 2025 Act may apply section
            398 to the months from April 2026. The rates are the same, so the amount does not
            change.
          </li>
          <li>
            Not yet deposited, or not yet deducted: interest runs to the as-of date and is marked as
            an estimate.
          </li>
          <li>Part months: 1 day into a new month counts that whole month.</li>
          <li>Deducted on the last day of a month: that month is not counted for late deposit.</li>
          <li>Deducted before the date it was deductible: no late-deduction interest.</li>
          <li>An amount below ₹100 rounds down to 0, so its interest is 0.</li>
        </ul>
      </GuideSection>

      <GuideSection id="assumptions" title="Assumptions and supported period">
        <ul>
          <li>Dates from 1 April 2021 up to today.</li>
          <li>
            TDS deposited by challan by the monthly due dates. Calendar months follow the TRACES
            help pages; 30-day months follow several tribunal rulings, so both answers are shown.
          </li>
          <li>
            Not covered: deductions paid with a challan-cum-statement, due 30 days from month end
            (rent, property, contract or professional payments by individuals, and crypto assets),
            quarterly deposits allowed by the Assessing Officer, TCS, late filing fees and
            penalties.
          </li>
          <li>
            The total is also shown rounded to the nearest ₹10 (section 288B of the 1961 Act,
            section 516 of the 2025 Act). Whether TRACES rounds TDS interest this way is not
            confirmed.
          </li>
          <li>
            Rules were checked on 14 September 2026. Check any TRACES demand against its own
            workings before paying.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="references" title="References">
        <ul>
          {tdsInterestCitations.map(({ source }) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.reference}
              </a>
              : {source.title}
            </li>
          ))}
          <li>
            <a href={INDIAN_KANOON.rule30} target="_blank" rel="noopener noreferrer">
              Rule 30, Income-tax Rules, 1962
            </a>
            : due dates before 1 April 2026 (text on Indian Kanoon)
          </li>
          <li>
            <a href={INDIAN_KANOON.rule119A} target="_blank" rel="noopener noreferrer">
              Rule 119A, Income-tax Rules, 1962
            </a>
            : part months and rounding down to ₹100 (text on Indian Kanoon; Rule 269 of the 2026
            Rules)
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="related-calculators" title="Related calculators">
        <RelatedTools
          slugs={['advance-tax', 'gst-late-fee', 'presumptive-tax']}
          reasons={{
            'advance-tax': 'Quarterly advance tax instalments and due dates.',
            'gst-late-fee': 'Late fee and interest on GST returns filed after the due date.',
            'presumptive-tax': 'Income under sections 44AD and 44ADA.',
          }}
        />
      </GuideSection>
    </CalculatorGuide>
  );
}

import CalculatorGuide, {
  Formula,
  GuideSection,
} from '../../components/calculator/CalculatorGuide';
import BreakdownTable from '../../components/calculator/BreakdownTable';
import { formatCurrency } from '../../lib/utils/format';
import {
  ANNUAL_LATE_FEE,
  ANNUAL_TURNOVER_SLABS,
  GST_INTEREST_RATE,
  PERIODIC_LATE_FEE,
  PERIODIC_TURNOVER_SLABS,
} from '../../lib/constants/gst-rates';
import { displayDate } from './dates';
import { CAP_EXAMPLE, WORKED_EXAMPLE } from './example';
import { formatWithPaise } from './workings';
import GstGuideNotes from './GstGuideNotes';

const rateRows = [
  {
    returnType: 'GSTR-3B, GSTR-1',
    band: 'Nil return',
    perDay: formatCurrency(PERIODIC_LATE_FEE.nilPerDay * 2),
    cap: formatCurrency(PERIODIC_LATE_FEE.nilCap * 2),
  },
  ...PERIODIC_TURNOVER_SLABS.map((slab) => ({
    returnType: 'GSTR-3B, GSTR-1',
    band: `${slab.label}, previous year`,
    perDay: formatCurrency(PERIODIC_LATE_FEE.perDay * 2),
    cap: formatCurrency(PERIODIC_LATE_FEE.caps[slab.value] * 2),
  })),
  ...ANNUAL_TURNOVER_SLABS.map((slab) => ({
    returnType: 'GSTR-9',
    band: `${slab.label}, that year`,
    perDay: formatCurrency(ANNUAL_LATE_FEE[slab.value].perDay * 2),
    cap: `${ANNUAL_LATE_FEE[slab.value].capPercentOfStateTurnover * 2}% of turnover in the State`,
  })),
];

const fee = (amount: number) => <span className="guide-figure">{formatCurrency(amount)}</span>;

export default function GstGuide() {
  const ex = WORKED_EXAMPLE;
  const cap = CAP_EXAMPLE;
  return (
    <CalculatorGuide
      title="GST late fee and interest rules"
      sections={[
        { id: 'late-fee-rates', title: 'How are the GST late fee and interest calculated?' },
        { id: 'worked-example', title: 'Worked example' },
        { id: 'edge-cases', title: 'Edge cases' },
        { id: 'assumptions', title: 'Supported period and assumptions' },
        { id: 'references', title: 'References' },
        { id: 'related-calculators', title: 'Related calculators' },
      ]}
    >
      <GuideSection id="late-fee-rates" title="How are the GST late fee and interest calculated?">
        <p>
          The late fee is a daily amount for each day late, up to a cap. Interest applies only to a
          late GSTR-3B. Days late count from the day after the due date to the filing date. The late
          fee is charged per head: once under CGST and the same amount again under SGST or UTGST.
        </p>
        <Formula
          where={
            <>
              Daily fee and cap per head come from the table below. The late fee cannot be more than
              the cap.
            </>
          }
        >
          Late fee per head = lower of (daily fee × days late) and cap
          <br />
          Total late fee = CGST + SGST/UTGST
        </Formula>
        <Formula
          where={
            <>
              Only for GSTR-3B. Tax paid in cash is tax paid from the electronic cash ledger. Days
              run from the day after the due date to the date the tax is paid.
            </>
          }
        >
          Interest = tax paid in cash × {GST_INTEREST_RATE}% × days ÷ 365
        </Formula>
        <BreakdownTable
          caption="Late fee rates and caps, CGST and SGST together"
          columns={[
            { key: 'returnType', label: 'Return', align: 'left' },
            { key: 'band', label: 'Filed as or aggregate turnover', align: 'left' },
            { key: 'perDay', label: 'Per day', align: 'right', mono: true },
            { key: 'cap', label: 'Maximum', align: 'right', mono: true },
          ]}
          rows={rateRows}
        />
      </GuideSection>

      <GuideSection id="worked-example" title="Worked example">
        <p>
          A regular GSTR-3B for April 2026 was due on {displayDate(ex.input.dueDate)} and filed on{' '}
          {displayDate(ex.input.filingDate)}. Aggregate turnover in the previous year was up to ₹1.5
          crore. Tax of {fee(ex.input.taxLiability)} was paid in cash.
        </p>
        <ol>
          <li>
            Days late: <span className="guide-figure">{ex.daysLate} days</span>, from the day after
            the due date to the filing date.
          </li>
          <li>
            Late fee per head: {fee(PERIODIC_LATE_FEE.perDay)} × {ex.daysLate} ={' '}
            {fee(ex.feePerHead)}. This is below the {fee(ex.capPerHead)} cap.
          </li>
          <li>
            Total late fee: {fee(ex.feePerHead)} CGST + {fee(ex.feePerHead)} SGST ={' '}
            {fee(ex.lateFee)}.
          </li>
          <li>
            Interest: {fee(ex.input.taxLiability)} × {GST_INTEREST_RATE}% × {ex.daysLate} ÷ 365 ={' '}
            <span className="guide-figure">{formatWithPaise(ex.interestExact)}</span>, rounded to{' '}
            {fee(ex.interest)}.
          </li>
          <li>
            Total: {fee(ex.lateFee)} + {fee(ex.interest)} = {fee(ex.total)}.
          </li>
        </ol>
        <p>
          <strong>When the cap applies.</strong> A nil GSTR-3B due on{' '}
          {displayDate(cap.input.dueDate)} and filed on {displayDate(cap.input.filingDate)} is{' '}
          {cap.daysLate} days late. {fee(PERIODIC_LATE_FEE.nilPerDay)} × {cap.daysLate} ={' '}
          {fee(cap.feePerHead)} per head, which is more than the {fee(cap.capPerHead)} cap for a nil
          return. The late fee is {fee(cap.lateFee)} in total, with no interest.
        </p>
      </GuideSection>

      <GstGuideNotes />
    </CalculatorGuide>
  );
}

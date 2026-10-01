import { useRef, useState, useSyncExternalStore } from 'react';
import DateInput from '../../components/ui/DateInput';
import NumberInput from '../../components/ui/NumberInput';
import ResultCard from '../../components/calculator/ResultCard';
import CopyButton from '../../components/calculator/CopyButton';
import DownloadButton from '../../components/calculator/DownloadButton';
import { Notice } from '../../components/ui/Surface';
import { formatCurrency } from '../../lib/utils/format';
import { toInputDateString } from '../../lib/utils/date';
import { paymentErrors, paymentPlan, YEAR_END, YEAR_START, type Payment } from './planning';
import type { QuarterlyInstallment } from './types';

const subscribe = () => () => {};
const today = () => toInputDateString(new Date());
const noDate = () => '';

export default function PaymentPlanner({ schedule }: { schedule: QuarterlyInstallment[] }) {
  const browserDate = useSyncExternalStore(subscribe, today, noDate);
  const [enteredDate, setDate] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const nextId = useRef(1);
  const date = enteredDate ?? (browserDate ? [YEAR_START, browserDate, YEAR_END].sort()[1] : '');
  const errors = paymentErrors(date, payments);
  const plan = errors.length === 0 ? paymentPlan(schedule, date, payments) : null;
  function change(id: number, patch: Partial<Payment>) {
    setPayments((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
  const summary = plan
    ? `Advance-tax payment plan — ${date}\nPaid: ${formatCurrency(plan.paid)}\nCatch-up to latest passed deadline: ${formatCurrency(plan.catchUp)}\n${plan.next ? `By ${plan.next.dueDate}` : 'Remaining for this tax year'}: ${formatCurrency(plan.nextPayment)}\nPayments entered:\n${payments.map((payment) => `${payment.date}: ${formatCurrency(payment.amount)}`).join('\n') || 'None'}\nAnnual balance: ${formatCurrency(plan.remaining)}\nBased on your annual estimate and expected TDS/TCS. Interest is not included.`
    : '';
  return (
    <section className="result-stack" aria-labelledby="payment-planner-title">
      <h3 id="payment-planner-title" className="section-title">
        What do I need to pay next?
      </h3>
      <p className="field-help">
        Add advance-tax payments already made for tax year 2026–27. TDS/TCS is already deducted in
        the annual estimate above; do not enter it again here.
      </p>
      <DateInput
        id="planning-date"
        label="Planning date"
        value={date}
        min={YEAR_START}
        max={YEAR_END}
        onChange={setDate}
      />
      {payments.map((payment, index) => (
        <div className="form-stack" key={payment.id}>
          <DateInput
            id={`payment-date-${payment.id}`}
            label={`Payment ${index + 1} date`}
            value={payment.date}
            min={YEAR_START}
            max={date || YEAR_END}
            onChange={(value) => change(payment.id, { date: value })}
          />
          <NumberInput
            id={`payment-amount-${payment.id}`}
            label={`Payment ${index + 1} amount`}
            value={payment.amount}
            prefix="₹"
            reportInvalid
            onChange={(value) => change(payment.id, { amount: value })}
          />
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setPayments((rows) => rows.filter((row) => row.id !== payment.id))}
          >
            Remove payment {index + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button button-secondary"
        onClick={() => setPayments((rows) => [...rows, { id: nextId.current++, date, amount: 0 }])}
      >
        Add payment
      </button>
      {date && errors.length > 0 && (
        <Notice title="Check payment entries" tone="warning">
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Notice>
      )}
      {plan && (
        <>
          {plan.catchUp > 0 && (
            <Notice title="Shortfall against the latest passed deadline" tone="warning">
              Your current payments are {formatCurrency(plan.catchUp)} below the cumulative target
              for {plan.previous!.dueDate}. This amount is included in the next payment below; do
              not add it again. A later payment does not remove interest for an earlier shortfall.
            </Notice>
          )}
          <div className="result-grid">
            <ResultCard
              label={plan.next ? 'Remaining by the next deadline' : 'Remaining for this tax year'}
              value={formatCurrency(plan.nextPayment)}
              variant="primary"
              subtext={plan.next ? plan.next.dueDate : 'The final instalment deadline has passed'}
            />
            <ResultCard
              label="Advance tax already paid"
              value={formatCurrency(plan.paid)}
              variant="neutral"
              subtext={`Annual balance: ${formatCurrency(plan.remaining)}`}
            />
          </div>
          <div className="result-actions">
            <CopyButton text={summary} label="Copy payment plan" />
            <DownloadButton
              label="Download payment plan"
              mimeType="text/plain;charset=utf-8"
              filename={`advance-tax-payment-plan-${date}.txt`}
              getContent={() => summary}
            />
          </div>
          <p className="field-help">
            This plan uses your annual estimate and expected tax credits. It does not calculate
            late-payment interest or verify challans. The schedule below shows statutory targets;
            the planner above subtracts your actual payments.
          </p>
        </>
      )}
    </section>
  );
}

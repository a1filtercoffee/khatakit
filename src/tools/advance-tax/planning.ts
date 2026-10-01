import type { QuarterlyInstallment } from './types';

export interface Payment {
  id: number;
  date: string;
  amount: number;
}
export const YEAR_START = '2026-04-01';
export const YEAR_END = '2027-03-31';

export function paymentPlan(schedule: QuarterlyInstallment[], date: string, payments: Payment[]) {
  const paid = payments.filter((p) => p.date <= date).reduce((sum, p) => sum + p.amount, 0);
  const previous = schedule.filter((q) => q.dueDateISO < date).at(-1);
  const next = schedule.find((q) => q.dueDateISO >= date);
  const annualTarget = schedule.at(-1)?.cumulativeAmount ?? 0;
  return {
    paid,
    catchUp: Math.max(0, (previous?.cumulativeAmount ?? 0) - paid),
    previous,
    next,
    nextPayment: Math.max(0, (next?.cumulativeAmount ?? annualTarget) - paid),
    remaining: Math.max(0, annualTarget - paid),
  };
}

export function paymentErrors(date: string, payments: Payment[]): string[] {
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  const errors: string[] = [];
  if (!validDate(date) || date < YEAR_START || date > YEAR_END) {
    errors.push('Choose a planning date between 1 April 2026 and 31 March 2027.');
  }
  for (const [index, payment] of payments.entries()) {
    if (!validDate(payment.date) || payment.date < YEAR_START || payment.date > YEAR_END) {
      errors.push(`Payment ${index + 1}: enter a date in tax year 2026–27.`);
    } else if (payment.date > date) {
      errors.push(`Payment ${index + 1}: only enter payments made on or before the planning date.`);
    }
    if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
      errors.push(`Payment ${index + 1}: enter an amount greater than zero.`);
    }
  }
  return errors;
}

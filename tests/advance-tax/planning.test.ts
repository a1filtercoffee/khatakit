import { describe, expect, it } from 'vitest';
import { paymentErrors, paymentPlan } from '../../src/tools/advance-tax/planning';
import type { QuarterlyInstallment } from '../../src/tools/advance-tax/types';

const schedule: QuarterlyInstallment[] = [
  {
    quarter: 'Q1',
    dueDate: '15 June 2026',
    dueDateISO: '2026-06-15',
    cumulativePercent: 15,
    cumulativeAmount: 1500,
    installmentAmount: 1500,
  },
  {
    quarter: 'Q2',
    dueDate: '15 September 2026',
    dueDateISO: '2026-09-15',
    cumulativePercent: 45,
    cumulativeAmount: 4500,
    installmentAmount: 3000,
  },
  {
    quarter: 'Q3',
    dueDate: '15 December 2026',
    dueDateISO: '2026-12-15',
    cumulativePercent: 75,
    cumulativeAmount: 7500,
    installmentAmount: 3000,
  },
  {
    quarter: 'Q4',
    dueDate: '15 March 2027',
    dueDateISO: '2027-03-15',
    cumulativePercent: 100,
    cumulativeAmount: 10000,
    installmentAmount: 2500,
  },
];
describe('remaining advance-tax payments', () => {
  it('subtracts actual payments from cumulative targets without double counting catch-up', () => {
    const result = paymentPlan(schedule, '2026-10-01', [
      { id: 1, date: '2026-06-10', amount: 2000 },
    ]);
    expect(result.catchUp).toBe(2500);
    expect(result.nextPayment).toBe(5500);
    expect(result.next?.dueDateISO).toBe('2026-12-15');
    expect(result.remaining).toBe(8000);
  });
  it('treats a deadline itself as payable today and counts payments that day', () => {
    const result = paymentPlan(schedule, '2026-09-15', [
      { id: 1, date: '2026-09-15', amount: 1500 },
    ]);
    expect(result.next?.quarter).toBe('Q2');
    expect(result.nextPayment).toBe(3000);
    expect(result.catchUp).toBe(0);
  });
  it('never recommends a negative payment after an overpayment', () => {
    const result = paymentPlan(schedule, '2026-10-01', [
      { id: 1, date: '2026-06-10', amount: 12000 },
    ]);
    expect(result.nextPayment).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.catchUp).toBe(0);
  });
  it('shows the annual remainder after the final deadline', () => {
    const result = paymentPlan(schedule, '2027-03-20', [
      { id: 1, date: '2027-03-01', amount: 8000 },
    ]);
    expect(result.next).toBeUndefined();
    expect(result.nextPayment).toBe(2000);
  });
  it('does not count a future-dated payment', () => {
    expect(
      paymentPlan(schedule, '2026-10-01', [{ id: 1, date: '2026-12-01', amount: 1000 }]).paid
    ).toBe(0);
  });
  it('rejects a payment in another year, invalid date, future date and invalid amount', () => {
    for (const payment of [
      { id: 1, date: '2025-06-01', amount: 1000 },
      { id: 1, date: '2026-02-30', amount: 1000 },
      { id: 1, date: '2026-11-01', amount: 1000 },
      { id: 1, date: '2026-06-01', amount: Number.NaN },
      { id: 1, date: '2026-06-01', amount: 0 },
    ])
      expect(paymentErrors('2026-10-01', [payment]).length).toBeGreaterThan(0);
    expect(paymentErrors('2026-10-01', [{ id: 1, date: '2026-06-01', amount: 1000 }])).toEqual([]);
  });
});

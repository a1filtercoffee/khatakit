import { expect, it } from 'vitest';
import { monthlyDueDate } from '../../src/tools/gst-late-fee/due-date';

it('suggests standard monthly deadlines and handles the year boundary', () => {
  expect(monthlyDueDate('2026-04', 'GSTR-1')).toBe('2026-05-11');
  expect(monthlyDueDate('2026-04', 'GSTR-3B')).toBe('2026-05-20');
  expect(monthlyDueDate('2026-12', 'GSTR-3B')).toBe('2027-01-20');
});
it('does not suggest dates for malformed or unsupported periods', () => {
  for (const period of ['', '2026-13', '2026-00', '2021-05', 'June 2026']) {
    expect(monthlyDueDate(period, 'GSTR-1')).toBeNull();
  }
});

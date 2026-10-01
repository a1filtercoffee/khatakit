import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Component as AdvanceTax } from '../../src/tools/advance-tax/AdvanceTax';
import {
  blockNetwork,
  buttonNamed,
  captureDownloads,
  choose,
  input,
  mockClipboard,
  mount,
  readBlob,
  select,
  textOf,
  type,
  type Mounted,
} from '../helpers/page';

let page: Mounted;
beforeEach(() => {
  page = mount(<AdvanceTax />);
});
afterEach(() => {
  page.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const results = () => page.node.querySelector('[aria-label="Calculation results"]');

function enterWorkedExample() {
  type(page.node, 'gross-income', '1800000');
  type(page.node, 'salary-income', '1200000');
  type(page.node, 'tds-deducted', '100000');
}

describe('advance tax page before any input', () => {
  it('shows the supported period, worked example, edge cases and references', () => {
    expect(textOf(page.node.querySelector('.period-badge'))).toBe('Tax year 2026-27');
    const guide = textOf(page.node.querySelector('.calculator-guide'));
    expect(guide).toContain('₹17,25,000');
    expect(guide).toContain('₹50,800');
    expect(guide).toContain('₹10,400');
    expect(guide).toContain('₹74,100');
    expect(guide).toContain('₹10,000 or more');
    expect(guide).toContain('15 March 2027');
    expect(page.node.querySelector('.calculator-guide a[href*="egazette.gov.in"]')).not.toBeNull();
    expect(
      page.node.querySelector('.related-tools a[href="/presumptive-income-calculator"]')
    ).not.toBeNull();
    expect(page.node.querySelector('.empty-state')).not.toBeNull();
  });
});

describe('advance tax validation', () => {
  it('does not allow salary above gross total income', () => {
    type(page.node, 'gross-income', '500000');
    type(page.node, 'salary-income', '600000');
    expect(input(page.node, 'salary-income').getAttribute('aria-invalid')).toBe('true');
    expect(textOf(page.node.querySelector('#salary-income-error'))).toBe(
      'Salary or pension cannot be more than gross total income.'
    );
    expect(textOf(results())).not.toContain('Advance tax schedule');
  });

  it('explains text that is not a number', () => {
    type(page.node, 'gross-income', '1800000');
    type(page.node, 'tds-deducted', 'ten thousand');
    expect(textOf(page.node.querySelector('#tds-deducted-error'))).toBe(
      'Enter TDS as a number, for example 25000.'
    );
  });

  it('checks old regime deductions against income', () => {
    type(page.node, 'gross-income', '400000');
    choose(page.node, 'old');
    type(page.node, 'deductions', '500000');
    expect(textOf(page.node.querySelector('#deductions-error'))).toBe(
      'Deductions cannot be more than gross total income.'
    );
  });
});

describe('advance tax results', () => {
  it('shows slab workings and the instalments for the worked example', () => {
    enterWorkedExample();
    const text = textOf(results());
    expect(text).toContain('₹50,800');
    expect(text).toContain('20% on ₹16,00,000 to ₹17,25,000');
    expect(text).toContain('₹25,000');
    expect(text).toContain('15 June 2026');
    expect(text).toContain('₹12,700');
  });

  it('shows no schedule for a resident senior without business income', () => {
    enterWorkedExample();
    select(page.node, 'age-category', '60to80');
    expect(
      page.node.querySelector<HTMLInputElement>('input[type=radio][value="no"]')!.checked
    ).toBe(true);
    expect(textOf(results())).toContain('Advance tax not applicable');
    expect(textOf(results())).not.toContain('15 June 2026');
    choose(page.node, 'yes');
    expect(textOf(results())).toContain('15 June 2026');
  });

  it('downloads and copies the instalments without any network request', async () => {
    const network = blockNetwork();
    const files = captureDownloads();
    const writeText = mockClipboard();
    enterWorkedExample();

    act(() => buttonNamed(page.node, 'Download CSV').click());
    expect(files[0].name).toBe('advance-tax-2026-27-new-regime.csv');
    const csv = await readBlob(files[0].blob);
    expect(csv).toContain(
      'Instalment,Due date,Cumulative %,Planned instalment,Cumulative amount\r\n'
    );
    expect(csv).toContain('Q1,15 June 2026,15,7620,7620\r\n');
    expect(csv).toContain('Q4,15 March 2027,100,12700,50800\r\n');

    await act(async () => buttonNamed(page.node, 'Copy annual targets').click());
    expect(writeText.mock.calls[0][0]).toContain('15 September 2026: ₹ 15,240');
    network.expectNoRequests();
  });
});

it('subtracts actual payments, exports their dates and rejects a future payment', async () => {
  const network = blockNetwork();
  const files = captureDownloads();
  enterWorkedExample();
  type(page.node, 'planning-date', '2026-10-01');
  act(() => buttonNamed(page.node, 'Add payment').click());
  type(page.node, 'payment-date-1', '2026-06-10');
  type(page.node, 'payment-amount-1', '10000');
  expect(textOf(results())).toContain('₹28,100');
  expect(textOf(results())).toContain('15 December 2026');
  act(() => buttonNamed(page.node, 'Download payment plan').click());
  const summary = await readBlob(files[0].blob);
  expect(summary).toContain('2026-06-10: ₹ 10,000');
  expect(summary).toContain('₹ 28,100');
  type(page.node, 'payment-date-1', '2026-11-01');
  expect(textOf(results())).toContain('only enter payments made on or before the planning date');
  expect(
    page.node.querySelector('[aria-labelledby="payment-planner-title"] .result-card')
  ).toBeNull();
  network.expectNoRequests();
});

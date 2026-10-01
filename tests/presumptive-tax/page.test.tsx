import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Component as Presumptive } from '../../src/tools/presumptive-tax/PresumptiveTax';
import {
  blockNetwork,
  buttonNamed,
  captureDownloads,
  choose,
  input,
  mockClipboard,
  mount,
  readBlob,
  textOf,
  type,
  type Mounted,
} from '../helpers/page';

let page: Mounted;
beforeEach(() => {
  page = mount(<Presumptive />);
});
afterEach(() => {
  page.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const results = () => page.node.querySelector('[aria-label="Calculation results"]');

describe('presumptive page before any input', () => {
  it('shows section 58 naming, the worked examples, limits and references', () => {
    expect(textOf(page.node.querySelector('h1 + .page-description'))).toContain(
      'section 58 of the Income-tax Act, 2025 (old 44AD and 44ADA)'
    );
    expect(textOf(page.node.querySelector('.period-badge'))).toBe('Tax year 2026-27');
    const guide = textOf(page.node.querySelector('.calculator-guide'));
    expect(guide).toContain('₹15,20,000');
    expect(guide).toContain('₹1,12,320');
    expect(guide).toContain('₹2,08,000');
    expect(guide).toContain('5% or less');
    expect(guide).toContain('₹75 lakh');
    expect(guide).toContain('₹3 crore');
    expect(page.node.querySelector('.calculator-guide a[href*="egazette.gov.in"]')).not.toBeNull();
    expect(
      page.node.querySelector('.related-tools a[href="/advance-tax-calculator"]')
    ).not.toBeNull();
  });
});

describe('presumptive validation', () => {
  it('does not allow cash receipts above gross receipts', () => {
    type(page.node, 'gross-receipts', '1000000');
    type(page.node, 'cash-receipts', '2000000');
    expect(input(page.node, 'cash-receipts').getAttribute('aria-invalid')).toBe('true');
    expect(textOf(page.node.querySelector('#cash-receipts-error'))).toBe(
      'Cash receipts cannot be more than gross receipts.'
    );
    expect(textOf(results())).not.toContain('Presumptive income');
  });

  it('explains negative amounts', () => {
    type(page.node, 'gross-receipts', '-5');
    expect(textOf(page.node.querySelector('#gross-receipts-error'))).toBe(
      'Enter gross receipts of zero or more.'
    );
  });
});

describe('presumptive results', () => {
  function enterBusinessExample() {
    choose(page.node, '44AD');
    type(page.node, 'gross-receipts', '25000000');
    type(page.node, 'cash-receipts', '1000000');
  }

  it('shows the 8% and 6% split, the 5% cash test and the 15 March due date', async () => {
    const network = blockNetwork();
    const writeText = mockClipboard();
    enterBusinessExample();

    const text = textOf(results());
    expect(text).toContain('8% of cash and other receipts (₹10,00,000)');
    expect(text).toContain('₹80,000');
    expect(text).toContain('6% of bank and online receipts (₹2,40,00,000)');
    expect(text).toContain('₹14,40,000');
    expect(text).toContain('Cash is 4.00% of receipts, so the limit is ₹3,00,00,000');
    expect(text).toContain('₹1,12,320');
    expect(text).toContain('15 March 2027');

    await act(async () => buttonNamed(page.node, 'Copy').click());
    expect(writeText.mock.calls[0][0]).toContain('Total tax: ₹ 1,12,320');
    network.expectNoRequests();
  });

  it('downloads the computation as CSV without any network request', async () => {
    const network = blockNetwork();
    const files = captureDownloads();
    enterBusinessExample();

    act(() => buttonNamed(page.node, 'Download CSV').click());
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('presumptive-tax-2026-27-44ad-new-regime.csv');
    const csv = await readBlob(files[0].blob);
    const lines = csv.trim().split('\r\n');
    expect(lines.slice(0, 5)).toEqual([
      'Presumptive tax,Tax year 2026-27',
      'Scheme,"Section 58(2), business (old 44AD)"',
      'Regime,New regime',
      '',
      'Particulars,Amount',
    ]);
    expect(lines[5]).toBe('Gross turnover,25000000');
    expect(csv).toMatch(/"8% of cash and other receipts \(₹\s10,00,000\)",80000\r\n/);
    expect(csv).toMatch(/"6% of bank and online receipts \(₹\s2,40,00,000\)",1440000\r\n/);
    expect(csv).toContain('Presumptive income (taxable),1520000\r\n');
    expect(csv).toContain('Health & Education Cess (4%),');
    expect(lines.at(-2)).toBe('Total tax payable,112320');
    expect(lines.at(-1)).toBe('Effective tax rate on gross receipts (%),0.45');
    network.expectNoRequests();
  });

  it('warns when receipts are above the limit', () => {
    type(page.node, 'gross-receipts', '6000000');
    type(page.node, 'cash-receipts', '600000');
    expect(textOf(results())).toContain('Receipts above the limit');
    expect(textOf(results())).toContain('no tax estimate is shown');
    expect(results()?.querySelector('.result-card')).toBeNull();
    expect(results()?.querySelector('button')).toBeNull();
    expect(textOf(results())).not.toContain('Advance tax by');
    type(page.node, 'gross-receipts', '2400000');
    type(page.node, 'cash-receipts', '0');
    expect(results()?.querySelector('.result-card')).not.toBeNull();
  });
});

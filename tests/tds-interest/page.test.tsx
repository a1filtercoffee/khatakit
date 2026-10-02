import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Component as TdsInterest } from '../../src/tools/tds-interest/TdsInterest';

let node: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-14T10:00:00'));
  node = document.createElement('div');
  document.body.appendChild(node);
  root = createRoot(node);
  act(() =>
    root.render(
      <MemoryRouter initialEntries={['/tds-interest-calculator']}>
        <TdsInterest />
      </MemoryRouter>
    )
  );
});

afterEach(() => {
  act(() => root.unmount());
  node.remove();
  vi.useRealTimers();
});

function setValue(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function button(name: string) {
  const found = Array.from(node.querySelectorAll('button')).find(
    (item) => item.getAttribute('aria-label') === name || item.textContent?.trim() === name
  );
  expect(found, name).toBeTruthy();
  return found!;
}

const rows = () => node.querySelectorAll('.row-editor tbody tr');

describe('TDS interest page', () => {
  it('shows the guide before any data is entered', () => {
    expect(node.querySelector('h1')?.textContent).toBe('TDS Interest Calculator');
    expect(node.querySelector('.empty-state')).not.toBeNull();
    expect(node.textContent).toContain('Worked example');
    expect(node.textContent).toContain('1 April 2026');
    expect(node.querySelector('a[href="/advance-tax-calculator"]')).not.toBeNull();
  });

  it('puts inputs beside results for one case and stacks them for many rows', () => {
    const layout = () => node.querySelector('.calculator-layout')!;
    const bulk = node.querySelector<HTMLInputElement>('input[type=radio][value="bulk"]')!;
    const single = node.querySelector<HTMLInputElement>('input[type=radio][value="single"]')!;
    expect(layout().classList).toContain('calculator-layout-split');

    act(() => bulk.click());
    expect(layout().classList).toContain('calculator-layout-stacked');
    expect(layout().classList).not.toContain('calculator-layout-split');
    expect(node.querySelector('.row-editor')!.closest('.calculator-output')).not.toBeNull();
    expect(node.querySelector('.calculator-inputs .form-columns')).not.toBeNull();

    act(() => single.click());
    expect(layout().classList).toContain('calculator-layout-split');
    expect(node.querySelector('.form-columns')).toBeNull();
  });

  it('keeps section navigation available and identifies a calculated result', () => {
    expect(node.querySelector('.calculator-toolbar a[href="#results"]')?.textContent).toBe('Result');
    setValue(node.querySelector('#tds-amount')!, '25000');
    expect(node.querySelector('.calculator-toolbar a[href="#results"]')?.textContent).toBe('Result');
    setValue(node.querySelector('#date-deducted')!, '2026-03-20');
    setValue(node.querySelector('#date-deposited')!, '2026-05-05');
    expect(node.querySelector('.calculator-toolbar a[href="#results"]')?.textContent).toContain('See result');
  });

  it('calculates a single case with both month methods', () => {
    setValue(node.querySelector('#tds-amount')!, '25000');
    setValue(node.querySelector('#date-deducted')!, '2026-03-20');
    setValue(node.querySelector('#date-deposited')!, '2026-05-05');
    const output = node.querySelector('.calculator-output')!.textContent!;
    expect(output).toContain('₹ 1,125');
    expect(output).toContain('₹ 750');
    expect(output).toContain('30 Apr 2026');
    expect(output).toContain('Mar 2026');
    expect(output).toContain('201(1A)');
  });

  it('adds, removes and pastes bulk rows, keeping errors per row', () => {
    act(() => (node.querySelector('input[type=radio][value="bulk"]') as HTMLInputElement).click());
    expect(rows()).toHaveLength(1);

    act(() => button('Add row').click());
    expect(rows()).toHaveLength(2);
    act(() => button('Remove row 2').click());
    expect(rows()).toHaveLength(1);

    const pasted = [
      'T1\t1,00,050\t\t28/04/2026\t08/05/2026',
      'Bad\tabc\t\t10/08/2026\t',
      'T3\t50000\t15/06/2026\t10/08/2026\t12/09/2026',
    ].join('\n');
    const target = node.querySelector<HTMLInputElement>('input[aria-label="Row 1 label"]')!;
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => pasted } });
    act(() => {
      target.dispatchEvent(event);
    });

    expect(rows()).toHaveLength(3);
    expect(
      node.querySelector<HTMLInputElement>('input[aria-label="Row 3 TDS amount"]')!.value
    ).toBe('50000');
    const output = node.querySelector('.calculator-output')!.textContent!;
    expect(output).toContain('₹ 6,000');
    expect(output).toContain('₹ 4,000');
    expect(output).toContain('1 row has errors');
    expect(rows()[1].textContent).toContain('TDS amount');
  });
});

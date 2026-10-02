import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Component as Gst } from '../../src/tools/gst-late-fee/GstLateFee';
import { Component as Presumptive } from '../../src/tools/presumptive-tax/PresumptiveTax';
let node: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  node = document.createElement('div');
  document.body.appendChild(node);
  root = createRoot(node);
});
afterEach(() => {
  act(() => root.unmount());
  node.remove();
});
function setValue(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
it('accepts complete GST dates from an empty form and reveals results in the shared layout', () => {
  act(() =>
    root.render(
      <MemoryRouter>
        <Gst />
      </MemoryRouter>
    )
  );
  const output = () => node.querySelector('.calculator-output')!;
  expect(node.querySelector('.empty-state')).not.toBeNull();
  expect(node.querySelector('.calculator-toolbar a[href="#results"]')?.textContent).toBe('Result');
  expect(node.querySelector('.result-caveat')).toBeNull();
  setValue(node.querySelector('#due-date')!, '2026-05-20');
  setValue(node.querySelector('#actual-filing-date')!, '2026-05-30');
  expect(node.querySelector('.empty-state')).toBeNull();
  expect(output().textContent).toContain('Late fee and interest');
  expect(node.querySelector('#actual-filing-date')!.getAttribute('min')).toBe('2026-05-20');
  expect(node.querySelector('.calculator-toolbar a[href="#results"]')?.getAttribute('href')).toBe('#results');
  expect(node.querySelector('#results')?.closest('.calculator-output')).toBe(output());
  expect(node.querySelector('.result-caveat a')?.getAttribute('href')).toBe('#guide');
});
it('keeps sources and assumptions in the guide, not repeated beside the results', () => {
  act(() =>
    root.render(
      <MemoryRouter>
        <Gst />
      </MemoryRouter>
    )
  );
  const output = node.querySelector('.calculator-output')!.textContent;
  expect(output).not.toContain('Sources & calculation basis');
  expect(output).not.toContain('Assumptions & limitations');
  expect(node.querySelector('.source-panel')).toBeNull();
  const guideHeadings = Array.from(node.querySelectorAll('#guide h3'), (h) => h.textContent);
  expect(guideHeadings).toContain('References');
  expect(guideHeadings.some((heading) => heading?.includes('assumptions'))).toBe(true);
  expect(node.textContent!.match(/in your browser/g)).toHaveLength(1);
});
it('keeps native radio groups independent while changing the calculator form', () => {
  act(() =>
    root.render(
      <MemoryRouter>
        <Presumptive />
      </MemoryRouter>
    )
  );
  const business = node.querySelector('input[type=radio][value="44AD"]') as HTMLInputElement;
  act(() => business.click());
  expect(business.checked).toBe(true);
  expect(node.querySelector('#cash-receipts')).not.toBeNull();
  expect(node.querySelector('.panel-title')!.textContent).toContain('Business details');
  const old = node.querySelector('input[type=radio][value="old"]') as HTMLInputElement;
  act(() => old.click());
  expect(old.checked).toBe(true);
  expect(business.checked).toBe(true);
  expect(node.querySelectorAll('input[type=radio]:checked')).toHaveLength(2);
});

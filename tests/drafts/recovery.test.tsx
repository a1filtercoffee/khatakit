import { act } from 'react';
import { afterEach, expect, it } from 'vitest';
import { Component as Tds } from '../../src/tools/tds-interest/TdsInterest';
import { mount, type, buttonNamed, input, type Mounted } from '../helpers/page';
let page: Mounted | undefined;
afterEach(() => page?.unmount());
function sample() {
  page = mount(<Tds />);
  act(() => buttonNamed(page!.node, 'Load sample case').click());
}
it('restores a valid case after remount and supports clear and undo', () => {
  sample();
  const result = page!.node.querySelector('#results')!.textContent;
  page!.unmount();
  page = mount(<Tds />);
  expect(page.node.querySelector('#results')!.textContent).toBe(result);
  expect(input(page.node, 'tds-amount').value.replaceAll(',', '')).toBe('10000');
  act(() => buttonNamed(page!.node, 'Clear inputs').click());
  expect(page.node.querySelector('.result-card')).toBeNull();
  act(() => buttonNamed(page!.node, 'Undo clear').click());
  expect(page.node.querySelector('#results')!.textContent).toBe(result);
});
it('invalid text removes the stale calculation and cannot restore stale valid data', () => {
  sample();
  type(page!.node, 'tds-amount', 'abc');
  expect(input(page!.node, 'tds-amount').getAttribute('aria-invalid')).toBe('true');
  expect(input(page!.node, 'tds-amount').value).toBe('abc');
  expect(page!.node.querySelector('.result-card')).toBeNull();
  page!.unmount(); page = mount(<Tds />);
  expect(page.node.querySelector('.result-card')).toBeNull();
});
it('ignores malformed saved drafts', () => {
  sessionStorage.setItem('khatakit:draft:v1:tds-interest:single', '{');
  page = mount(<Tds />);
  expect(page.node.querySelector('.result-card')).toBeNull();
});

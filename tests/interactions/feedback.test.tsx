import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import CopyButton from '../../src/components/calculator/CopyButton';
import NumberInput from '../../src/components/ui/NumberInput';
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
  vi.restoreAllMocks();
});
it('confirms successful copying and sends the actual result text', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  act(() => root.render(<CopyButton text="Total: ₹1,800" />));
  await act(async () => {
    node.querySelector('button')!.click();
  });
  expect(writeText).toHaveBeenCalledWith('Total: ₹1,800');
  expect(node.querySelector('[role="status"]')!.textContent).toBe('Results copied to clipboard.');
});
it('reports clipboard failure instead of falsely confirming success and restores focus', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) },
    configurable: true,
  });
  Object.defineProperty(document, 'execCommand', {
    value: vi.fn().mockReturnValue(false),
    configurable: true,
  });
  act(() => root.render(<CopyButton text="Test" />));
  const button = node.querySelector('button')!;
  button.focus();
  await act(async () => {
    button.click();
  });
  expect(button.textContent).toContain('Try again');
  expect(node.querySelector('[role="status"]')!.textContent).toContain('Could not copy');
  expect(document.activeElement).toBe(button);
  expect(document.querySelector('textarea')).toBeNull();
});
it('edits the latest externally updated amount when focused', () => {
  const onChange = vi.fn();
  act(() => root.render(<NumberInput label="Amount" value={1000} onChange={onChange} />));
  act(() => root.render(<NumberInput label="Amount" value={2500} onChange={onChange} />));
  const input = node.querySelector('input')!;
  act(() => input.focus());
  expect(input.value).toBe('2500');
});

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderPage } from '../../src/entry-server';
import { startClient } from '../../src/entry-client';
import { findPage, notFoundPage, pages } from '../../src/seo/pages';
import type { Page } from '../../src/seo/types';
import { expectHeadToMatch } from './head';

let container: HTMLDivElement;
let root: Root | undefined;
let reported: unknown[];

// React 19 reports hydration mismatches through reportError, which jsdom
// dispatches as a window error event rather than a console call.
function collectReportedError(event: ErrorEvent) {
  event.preventDefault();
  reported.push(event.error);
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  reported = [];
  window.addEventListener('error', collectReportedError);
  document.head.innerHTML = '';
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  window.removeEventListener('error', collectReportedError);
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Puts prerendered head and body markup in place, as a static host would serve it. */
async function serve(path: string) {
  const { head, html } = await renderPage(path);
  window.history.replaceState(null, '', path);
  document.head.innerHTML = head;
  container.innerHTML = html;
}

async function hydrate() {
  await act(async () => {
    root = await startClient(container);
  });
}

async function follow(selector: string, page: Page) {
  const link = container.querySelector<HTMLAnchorElement>(selector);
  expect(link, selector).not.toBeNull();
  await act(async () => {
    link!.click();
    await page.load();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(window.location.pathname).toBe(page.path);
  expectHeadToMatch(document, page);
}

describe('client hydration', () => {
  for (const path of [...pages.map((page) => page.path), notFoundPage.path]) {
    it(`hydrates ${path} over the prerendered markup and head without duplicates`, async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-01-10T10:00:00'));
      await serve(path);
      vi.setSystemTime(new Date('2026-03-22T10:00:00'));
      const errors = vi.spyOn(console, 'error');
      const heading = container.querySelector('h1');
      const title = document.head.querySelector('title');

      await hydrate();

      expect(reported).toEqual([]);
      expect(errors).not.toHaveBeenCalled();
      expect(container.querySelector('h1')).toBe(heading);
      expect(document.head.querySelector('title')).toBe(title);
      expectHeadToMatch(document, findPage(path));
    });
  }

  it('keeps one set of head tags matching the registry while navigating', async () => {
    await serve('/');
    await hydrate();
    await follow('a[href="/advance-tax-calculator"]', findPage('/advance-tax-calculator'));
    expect(container.querySelector('h1')?.textContent).toBe('Advance Tax Calculator');
    await follow('footer a[href="/about"]', findPage('/about'));
    await follow('nav[aria-label="Breadcrumb"] a[href="/"]', findPage('/'));
  });

  it('drops noindex and adds the canonical when leaving the not-found page', async () => {
    await serve('/404');
    await hydrate();
    expectHeadToMatch(document, notFoundPage);
    await follow('.error-page a[href="/"]', findPage('/'));
  });

  it('leaves the GST filing date out of the HTML and fills in the visit date after hydration', async () => {
    const path = '/gst-late-fee-interest-calculator';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-10T10:00:00'));
    const { head, html } = await renderPage(path);
    expect(head + html).not.toContain('2026-01-10');
    vi.setSystemTime(new Date('2026-03-22T10:00:00'));

    window.history.replaceState(null, '', path);
    document.head.innerHTML = head;
    container.innerHTML = html;
    expect(container.querySelector<HTMLInputElement>('#actual-filing-date')!.value).toBe('');

    await hydrate();

    expect(reported).toEqual([]);
    expect(container.querySelector<HTMLInputElement>('#actual-filing-date')!.value).toBe(
      '2026-03-22'
    );
  });

  it('fails loudly when the markup does not match the client render', async () => {
    await serve('/about');
    container.innerHTML = container.innerHTML.replace('The project', 'Stale copy');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await hydrate();

    expect(String(reported[0])).toContain('Hydration failed');
  });

  it('renders the client app and its head tags from scratch without prerendered markup', async () => {
    window.history.replaceState(null, '', '/about');
    await hydrate();
    expect(container.querySelector('h1')?.textContent).toBe('About Khatakit');
    expectHeadToMatch(document, findPage('/about'));
  });
});

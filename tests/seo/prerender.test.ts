// @vitest-environment node
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { tools } from '../../src/data/tools';
import { formatLongDate } from '../../src/lib/utils/date';
import { renderDocument } from '../../src/entry-server';
import { notFoundPage, pages } from '../../src/seo/pages';
import { ISSUES_URL, OG_IMAGE_URL, PUBLISHER } from '../../src/seo/site';
import { expectHeadToMatch } from './head';

const template =
  '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><!--app-head--></head>' +
  '<body><div id="root"><!--app-html--></div></body></html>';

const headings: Record<string, string> = {
  '/': 'Accounting &tax tools',
  '/gst-late-fee-interest-calculator': 'GST Late Fee & Interest Calculator',
  '/advance-tax-calculator': 'Advance Tax Calculator',
  '/presumptive-income-calculator': 'Presumptive Tax Calculator',
  '/tds-interest-calculator': 'TDS Interest Calculator',
  '/about': 'About Khatakit',
  '/404': 'Page not found',
};

async function load(path: string) {
  const html = await renderDocument(template, path);
  return { html, document: new JSDOM(html).window.document };
}

const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

function jsonLdOfType(document: Document, type: string) {
  return Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (script) =>
    JSON.parse(script.textContent ?? '')
  ).find((data) => data['@type'] === type);
}

describe('prerendered HTML', () => {
  it('covers every registry page with a heading', () => {
    expect(Object.keys(headings).sort()).toEqual([...pages.map((page) => page.path), '/404'].sort());
  });

  for (const page of [...pages, notFoundPage]) {
    it(`renders ${page.path} with one h1, no skipped heading levels and the publisher footer link`, async () => {
      const { document } = await load(page.path);
      const levels = Array.from(document.querySelectorAll('#root :is(h1, h2, h3, h4, h5, h6)'), (node) =>
        Number(node.tagName[1])
      );
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(levels[0]).toBe(1);
      levels.forEach((level, index) => {
        if (index > 0) expect(level, `heading ${index} on ${page.path}`).toBeLessThanOrEqual(levels[index - 1] + 1);
      });

      const maker = document.querySelector(`footer a[href="${PUBLISHER.url}"]`);
      expect(text(maker)).toContain('A filtercoffee.dev project');
      for (const image of Array.from(document.querySelectorAll('#root img'))) {
        expect(image.getAttribute('alt')).not.toBeNull();
      }
    });
  }

  for (const page of pages) {
    it(`renders ${page.path} with content and metadata before JavaScript runs`, async () => {
      const { html, document } = await load(page.path);
      expect(html).not.toContain('<!--app-');
      expect(document.querySelector('#root h1')?.textContent).toBe(headings[page.path]);
      expect(page.image.url).toBe(OG_IMAGE_URL);
      expectHeadToMatch(document, page);

      const crumbs = Array.from(
        document.querySelectorAll(
          'nav[aria-label="Breadcrumb"] a, nav[aria-label="Breadcrumb"] [aria-current]'
        ),
        (node) => node.textContent
      );
      expect(crumbs).toEqual(page.trail.map((crumb) => crumb.name));
      expect(jsonLdOfType(document, 'Organization')?.parentOrganization).toMatchObject(PUBLISHER);
      expect(jsonLdOfType(document, 'WebSite')?.publisher).toMatchObject(PUBLISHER);
    });
  }

  for (const tool of tools) {
    it(`shows the direct answer, review date and FAQ for ${tool.path} in static HTML`, async () => {
      const { document } = await load(tool.path);
      expect(text(document.querySelector('#root h1 + .page-description'))).toBe(tool.answer);

      const reviewed = document.querySelector('.masthead-meta time');
      expect(reviewed?.getAttribute('datetime')).toBe(tool.rulesReviewed);
      expect(text(reviewed?.parentElement)).toBe(
        `Rules last reviewed: ${formatLongDate(tool.rulesReviewed)}`
      );
      expect(document.querySelector('.calculator-faq a[href="/about#rules"]')).not.toBeNull();

      const visible = Array.from(document.querySelectorAll('.calculator-faq .faq-item'), (item) => ({
        question: text(item.querySelector('h3')),
        answer: text(item.querySelector('p')),
      }));
      expect(visible).toEqual(tool.faq);
      const schema = jsonLdOfType(document, 'FAQPage') as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[];
      };
      expect(
        schema.mainEntity.map((item) => ({ question: item.name, answer: item.acceptedAnswer.text }))
      ).toEqual(visible);

      expect(jsonLdOfType(document, 'WebApplication')).toMatchObject({
        dateModified: tool.contentUpdated ?? tool.rulesReviewed,
        publisher: PUBLISHER,
      });
      expect(text(document.querySelector('.empty-state'))).not.toBeUndefined();
      expect(document.querySelector('.empty-state :is(h1, h2, h3, h4, h5, h6)')).toBeNull();
    });
  }

  it('says who builds Khatakit, how rules are checked and where to report an error on About', async () => {
    const { document } = await load('/about');
    const body = text(document.querySelector('#root main')) ?? '';
    expect(body).toContain('built and maintained by Sagar at filtercoffee.dev');
    expect(document.querySelector('#rules')).not.toBeNull();
    expect(document.querySelector(`main a[href="${ISSUES_URL}"]`)).not.toBeNull();
    expect(document.querySelector('main a[href$="/docs/RULES-REVIEW.md"]')).not.toBeNull();
    expect(document.querySelector(`main a[href="${PUBLISHER.url}"]`)).not.toBeNull();
  });

  it('renders the not-found page as noindex without a canonical', async () => {
    const { document } = await load(notFoundPage.path);
    expect(document.querySelector('#root h1')?.textContent).toBe('Page not found');
    expectHeadToMatch(document, notFoundPage);
  });

  it('rejects a template without placeholders', async () => {
    await expect(renderDocument('<html></html>', '/')).rejects.toThrow('placeholder');
  });
});


describe('guide navigation', () => {
  for (const path of ['/gst-late-fee-interest-calculator', '/tds-interest-calculator']) {
    it(`provides working static guide anchors on ${path}`, async () => {
      const { document } = await load(path);
      const links = Array.from(document.querySelectorAll('nav[aria-label="On this page"] a'));
      expect(links.length).toBeGreaterThan(3);
      for (const link of links) {
        const id = link.getAttribute('href')!.slice(1);
        expect(document.getElementById(id)?.tagName).toBe('H3');
        expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
      }
    });
  }
  it('links common questions to readable sections on calculator pages', async () => {
    const { document } = await load('/');
    const links = Array.from(document.querySelectorAll('.common-tasks a'));
    expect(links).toHaveLength(4);
    for (const link of links) {
      const [path, id] = link.getAttribute('href')!.split('#');
      const target = await load(path);
      expect(target.document.getElementById(id)?.tagName).toBe('H3');
    }
  });
});

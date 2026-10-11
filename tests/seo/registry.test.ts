import { describe, expect, it } from 'vitest';
import { findPage, notFoundPage, pages } from '../../src/seo/pages';
import { PUBLISHER, REPO_URL, SITE_URL } from '../../src/seo/site';
import { tools } from '../../src/data/tools';

type Schema = Record<string, unknown>;
const schemaOfType = (jsonLd: Schema[], type: string) =>
  jsonLd.find((item) => item['@type'] === type);

const publisher = { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url };
const latestReview = tools
  .map((tool) => tool.contentUpdated ?? tool.rulesReviewed)
  .sort()
  .at(-1);

describe('route registry', () => {
  it('gives every public page a title, description and absolute canonical', () => {
    for (const page of pages) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.description.length).toBeGreaterThan(50);
      expect(page.canonical).toBe(SITE_URL + page.path);
      expect(page.noindex).toBe(false);
      expect(typeof page.load).toBe('function');
    }
  });

  it('keeps titles and descriptions to a length search results show in full', () => {
    for (const page of [...pages, notFoundPage]) {
      expect(page.title.length, page.title).toBeLessThanOrEqual(62);
    }
    for (const page of pages) {
      expect(page.description.length, page.description).toBeGreaterThanOrEqual(120);
      expect(page.description.length, page.description).toBeLessThanOrEqual(160);
    }
  });

  it('keeps paths, titles and descriptions unique', () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(pages.map((page) => page.path))).toBe(true);
    expect(unique(pages.map((page) => page.title))).toBe(true);
    expect(unique(pages.map((page) => page.description))).toBe(true);
  });

  it('uses plain dashes in all metadata and page copy data', () => {
    const emDash = String.fromCharCode(0x2014);
    expect(JSON.stringify([...pages, notFoundPage, tools])).not.toContain(emDash);
  });

  it('registers every catalogue tool as a calculator page with WebApplication schema', () => {
    for (const tool of tools) {
      const page = pages.find((item) => item.path === tool.path);
      expect(page, tool.path).toBeDefined();
      const app = schemaOfType(page!.jsonLd, 'WebApplication');
      expect(app).toMatchObject({ name: tool.name, url: page!.canonical });
    }
  });

  it('dates calculator content separately from its rules review', () => {
    for (const tool of tools) {
      expect(tool.contentUpdated ?? tool.rulesReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const page = findPage(tool.path);
      expect(page.lastModified).toBe(tool.contentUpdated ?? tool.rulesReviewed);
      expect(schemaOfType(page.jsonLd, 'WebApplication')).toMatchObject({
        dateModified: tool.contentUpdated ?? tool.rulesReviewed,
      });
    }
    expect(findPage('/').lastModified).toBe(latestReview);
    expect(findPage('/about').lastModified).toBe(latestReview);
    expect(notFoundPage.lastModified).toBeNull();
  });

  it('publishes each calculator FAQ as FAQPage schema with the same text', () => {
    for (const tool of tools) {
      expect(tool.faq.length, tool.slug).toBeGreaterThanOrEqual(3);
      expect(tool.faq.length, tool.slug).toBeLessThanOrEqual(5);
      expect(tool.answer.length, tool.slug).toBeGreaterThan(80);
      expect(schemaOfType(findPage(tool.path).jsonLd, 'FAQPage')).toEqual({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faq.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      });
    }
    for (const page of [findPage('/'), findPage('/about')]) {
      expect(schemaOfType(page.jsonLd, 'FAQPage')).toBeUndefined();
    }
  });

  it('names filtercoffee.dev as the publisher of the site and every calculator', () => {
    for (const page of pages) {
      expect(schemaOfType(page.jsonLd, 'Organization'), page.path).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Khatakit',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [REPO_URL],
        parentOrganization: publisher,
      });
      expect(schemaOfType(page.jsonLd, 'WebSite'), page.path).toMatchObject({
        name: 'Khatakit',
        url: `${SITE_URL}/`,
        publisher,
      });
    }
    for (const tool of tools) {
      expect(schemaOfType(findPage(tool.path).jsonLd, 'WebApplication')).toMatchObject({
        publisher,
        creator: publisher,
      });
    }
    expect(PUBLISHER).toEqual({ name: 'filtercoffee.dev', url: 'https://filtercoffee.dev' });
    expect(REPO_URL).toBe('https://github.com/a1filtercoffee/khatakit');
  });

  it('lists every calculator on the home page collection', () => {
    const home = findPage('/');
    const collection = schemaOfType(home.jsonLd, 'CollectionPage') as {
      mainEntity: { '@type': string; itemListElement: { url: string }[] };
    };
    expect(collection.mainEntity['@type']).toBe('ItemList');
    expect(collection.mainEntity.itemListElement.map((item) => item.url)).toEqual(
      tools.map((tool) => SITE_URL + tool.path)
    );
    expect(home.trail).toEqual([]);
    expect(schemaOfType(home.jsonLd, 'BreadcrumbList')).toBeUndefined();
  });

  it('emits BreadcrumbList from the same trail on every non-home page', () => {
    for (const page of pages.filter((item) => item.path !== '/')) {
      expect(page.trail.at(-1)).toEqual({ name: page.name, path: page.path });
      const list = schemaOfType(page.jsonLd, 'BreadcrumbList') as {
        itemListElement: { position: number; name: string; item: string }[];
      };
      expect(list.itemListElement).toEqual(
        page.trail.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: SITE_URL + crumb.path,
        }))
      );
    }
  });

  it('marks the not-found page noindex and keeps it out of the sitemap', () => {
    expect(notFoundPage.noindex).toBe(true);
    expect(notFoundPage.canonical).toBeNull();
    expect(notFoundPage.sitemap).toBe(false);
    expect(pages).not.toContain(notFoundPage);
  });

  it('resolves pathnames the way the router matches them', () => {
    expect(findPage('/advance-tax-calculator').path).toBe('/advance-tax-calculator');
    expect(findPage('/advance-tax-calculator/').path).toBe('/advance-tax-calculator');
    expect(findPage('/Advance-Tax-Calculator').path).toBe('/advance-tax-calculator');
    expect(findPage('/missing')).toBe(notFoundPage);
    expect(findPage('/emi-calculator')).toBe(notFoundPage);
    expect(findPage('/gst-calculator')).toBe(notFoundPage);
    expect(tools).toHaveLength(4);
  });
});

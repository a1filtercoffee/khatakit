// Writes static HTML for every registry page, plus 404.html, sitemap.xml and
// robots.txt, using the SSR bundle built from src/entry-server.tsx.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const server = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);

// "/advance-tax-calculator" becomes advance-tax-calculator.html. Vercel (cleanUrls in vercel.json)
// serves that file at the extensionless URL, which matches the canonical.
// A folder index.html would be redirected to a trailing-slash URL instead.
const outputFile = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

const template = await readFile(join(dist, 'index.html'), 'utf8');

for (const page of [...server.pages, server.notFoundPage]) {
  const file = join(dist, outputFile(page.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, await server.renderDocument(template, page.path));
  console.log(`prerendered ${page.path} -> dist/${outputFile(page.path)}`);
}

await writeFile(join(dist, 'sitemap.xml'), server.buildSitemap(server.pages));
await writeFile(join(dist, 'robots.txt'), server.buildRobots());
console.log('wrote dist/sitemap.xml and dist/robots.txt');

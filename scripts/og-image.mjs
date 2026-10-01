// Renders public/og-image.png (1200x630) and public/logo.png (512x512) from the brand mark and tokens.
// Run with `npm run og-image` after changing the brand; the PNG is committed.
import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Values from src/styles/tokens.css.
const color = {
  paper: '#fffdf8',
  ink: '#15344a',
  text: '#43596a',
  muted: '#70808c',
  action: '#2364bb',
  border: '#e3e0d7',
  peach: '#f8daca',
  warmAccent: '#b77958',
};
const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const brand = "Georgia, 'Times New Roman', serif";

// Ledger mark from public/logo-mark.svg (40x40 grid).
const mark = (strokeScale) => `
  <path d="M5 6h23v28H5z" fill="${color.peach}" stroke="${color.warmAccent}" stroke-width="${1.5 * strokeScale}"/>
  <path d="M13 3h16l7 7v25H13z" fill="${color.action}"/>
  <path d="M29 3v7h7" fill="none" stroke="${color.paper}" stroke-width="${1.5 * strokeScale}"/>
  <path d="M19 17h11M19 22h11M19 28h5" stroke="${color.paper}" stroke-width="${2 * strokeScale}" stroke-linecap="round"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${color.paper}"/>
  <g transform="translate(96 78) scale(1.4)">${mark(1)}</g>
  <text x="168" y="121" font-family="${brand}" font-size="38" fill="${color.ink}">Khatakit</text>
  <g font-family="${sans}" font-weight="800" font-size="84" letter-spacing="-3">
    <text x="92" y="300" fill="${color.ink}">Accounting &amp;</text>
    <text x="92" y="386" fill="${color.action}">tax tools</text>
  </g>
  <text x="96" y="458" font-family="${sans}" font-weight="600" font-size="32" fill="${color.text}">Tools for GST filing costs, TDS and income tax.</text>
  <g transform="translate(826 118) rotate(-4 140 140) scale(7)">${mark(0.45)}</g>
  <line x1="96" y1="528" x2="1104" y2="528" stroke="${color.border}" stroke-width="2"/>
  <text x="96" y="580" font-family="${sans}" font-weight="700" font-size="28" fill="${color.action}">khatakit.in</text>
  <text x="1104" y="580" text-anchor="end" font-family="${sans}" font-size="26" fill="${color.muted}">Calculations run in your browser</text>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica Neue' },
})
  .render()
  .asPng();

await writeFile(join(root, 'public/og-image.png'), png);
console.log('wrote public/og-image.png');

// Square logo for structured data: the mark centred on paper.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 40 40">
  <rect width="40" height="40" fill="${color.paper}"/>
  <g transform="translate(4 4) scale(0.8)">${mark(1)}</g>
</svg>`;

const logoPng = new Resvg(logoSvg, { fitTo: { mode: 'width', value: 512 } }).render().asPng();

await writeFile(join(root, 'public/logo.png'), logoPng);
console.log('wrote public/logo.png');

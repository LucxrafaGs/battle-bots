// Junta as pranchas SVG de cada robô em um PDF (uma página por vista),
// com as fontes do site embutidas. Requer o pacote "playwright".
//   node scripts/diagramas/pdf.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const font = (pkg, file) =>
  'data:font/woff2;base64,' + readFileSync(resolve(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString('base64');
const css = `
@font-face{font-family:'Instrument Sans Variable';src:url('${font('instrument-sans', 'instrument-sans-latin-wdth-normal.woff2')}') format('woff2');font-weight:400 700;font-stretch:75% 100%}
@font-face{font-family:'Archivo Variable';src:url('${font('archivo', 'archivo-latin-wdth-normal.woff2')}') format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'JetBrains Mono Variable';src:url('${font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}') format('woff2');font-weight:100 800}
:root{--f-body:'Instrument Sans Variable',sans-serif;--f-display:'Archivo Variable',sans-serif;--f-code:'JetBrains Mono Variable',monospace}
html,body{margin:0;background:#0c0c0c}`;
const VIEWS = ['ligacao', 'esquematico', 'energia-sinal', 'tabela', 'passo-a-passo'];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
for (const slug of ['robo-basico', 'robo-avancado', 'robo-esp32']) {
  const dir = resolve(root, 'public/diagramas', slug);
  let pages = '';
  let rules = '';
  VIEWS.forEach((v, i) => {
    const svg = readFileSync(resolve(dir, `${v}.svg`), 'utf8');
    const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/);
    rules += `@page p${i}{size:${w}px ${h}px;margin:0} .p${i}{page:p${i};width:${w}px;height:${h}px;break-after:page}`;
    pages += `<div class="p${i}">${svg}</div>`;
  });
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css}${rules}</style>${pages}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
  writeFileSync(resolve(dir, `pranchas-${slug}.pdf`), pdf);
  await page.close();
  console.log(slug, (pdf.length / 1024).toFixed(0), 'KB');
}
await browser.close();

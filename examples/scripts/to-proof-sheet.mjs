#!/usr/bin/env node
// Converts the example cards from the v0 shape (one body, `html[data-face="back"]` selectors) to the
// proof sheet (plan v3 Phase 4): <section data-face="front"> and <section data-face="back"> in <body>,
// plus the preview scaffold (a Google Fonts link for the library families, a layout style the cleaner
// strips). Idempotent: a card that already has the sections is left alone.
//   node open/examples/scripts/to-proof-sheet.mjs [card-dir…]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const require = createRequire(path.join(root, 'open/packages/canon/package.json'));
const parse5 = require('parse5');
const canon = await import(path.join(root, 'supabase/functions/_shared/canon.js'));

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(path.join(here, '../cards')).map((d) => path.join(here, '../cards', d));

const GF = { 'Press Start 2P': 'Press+Start+2P', 'IBM Plex Mono': 'IBM+Plex+Mono', 'Libre Caslon Text': 'Libre+Caslon+Text', 'Playfair Display': 'Playfair+Display', 'Bodoni Moda': 'Bodoni+Moda', 'Instrument Serif': 'Instrument+Serif:ital@0;1', 'Space Grotesk': 'Space+Grotesk', 'DM Sans': 'DM+Sans', 'Archivo Black': 'Archivo+Black', 'JetBrains Mono': 'JetBrains+Mono', 'Pinyon Script': 'Pinyon+Script', 'EB Garamond': 'EB+Garamond', Fraunces: 'Fraunces:ital,wght@0,400;0,600;1,400', Cormorant: 'Cormorant:ital,wght@0,400;0,600;1,400', Inter: 'Inter:wght@400;500;600;700', Syne: 'Syne:wght@400;700;800', VT323: 'VT323', Caveat: 'Caveat' };

const serialize = (n) => parse5.serializeOuter(n);

for (const dir of dirs) {
  const file = path.join(dir, 'card.html');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  if (/<section[^>]*data-face="front"/.test(src)) { console.log('skip (already)', path.basename(dir)); continue; }
  const doc = parse5.parse(src);
  const html = doc.childNodes.find((n) => n.tagName === 'html');
  const head = html.childNodes.find((n) => n.tagName === 'head');
  const body = html.childNodes.find((n) => n.tagName === 'body');
  const metas = head.childNodes.filter((n) => n.tagName === 'meta').map((m) => Object.fromEntries(m.attrs.map((a) => [a.name, a.value]))).filter((m) => m.name?.startsWith('scrollodex:'));
  const style = head.childNodes.find((n) => n.tagName === 'style');
  let css = style ? style.childNodes.map((t) => t.value).join('') : '';
  const title = head.childNodes.find((n) => n.tagName === 'title');

  // Split top-level body children.
  const front = [], back = [], shared = [];
  for (const n of body.childNodes) {
    if (!n.tagName) { if ((n.value ?? '').trim()) shared.push(n); continue; }
    const cls = (n.attrs.find((a) => a.name === 'class')?.value ?? '').split(/\s+/);
    if (cls.includes('front')) front.push(n); else if (cls.includes('back')) back.push(n); else shared.push(n);
  }
  const hasBack = back.length > 0 || /html\[data-face="back"\]\s*(?!\.front|\.back)/.test(css);
  // Face rules: the show/hide trick goes; any other html[data-face="back"] selector becomes [data-face="back"].
  css = css
    .replace(/html\[data-face="back"\]\s*\.front\{display:none\}/g, '')
    .replace(/html\[data-face="back"\]\s*\.back\{display:block\}/g, '')
    .replace(/(^|\})\.back\{display:none\}/g, '$1')
    .replace(/html\[data-face="back"\]/g, '[data-face="back"]');
  // Body styles become face styles.
  css = css.replace(/(^|\})body\{/g, '$1[data-face]{');
  const bg = metas.find((m) => m.name === 'scrollodex:background')?.content;
  const orientation = metas.find((m) => m.name === 'scrollodex:orientation')?.content ?? 'landscape';
  const [w, h] = orientation === 'portrait' ? [400, 700] : [700, 400];
  const faceBase = `[data-face]{position:relative;width:${w}px;height:${h}px;overflow:hidden${bg ? `;background:${bg}` : ''}}`;

  const contact = existsSync(path.join(dir, 'contact.json')) ? JSON.parse(readFileSync(path.join(dir, 'contact.json'), 'utf8')) : null;
  const summary = contact?.a11y?.summary;
  const fonts = canon.canonHtml(src).meta.fonts ?? [];
  const fontLink = fonts.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${GF[f] ?? encodeURIComponent(f).replace(/%20/g, '+')}`).join('&')}&display=swap">` : '';

  const sec = (face, nodes) => `<section data-face="${face}">\n${nodes.map(serialize).join('\n')}\n</section>`;
  const frontNodes = [...shared, ...front];
  const backNodes = hasBack ? [...shared, ...back] : [];
  const metaLines = metas.map((m) => `<meta name="${m.name}" content="${m.content}">`).join('\n');
  const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${metaLines}${summary ? `\n<meta name="scrollodex:summary" content="${summary.replace(/"/g, '&quot;')}">` : ''}
${title ? serialize(title) : ''}

<!-- PROOF SCAFFOLD. Left out when published; the app ships these same fonts. -->
${fontLink}
<style data-proof>
  body{margin:0;min-height:100vh;display:flex;flex-wrap:wrap;gap:40px;align-items:center;justify-content:center;padding:48px;box-sizing:border-box;background:#e8e4dc}
  [data-face]{flex:none;box-shadow:0 1px 2px rgba(0,0,0,.08),0 24px 48px -24px rgba(0,0,0,.35);border-radius:14px}
  [data-face]::after{content:attr(data-face);position:absolute;top:100%;left:0;margin-top:10px;font:12px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#777}
  @media (prefers-color-scheme:dark){body{background:#1c1b18}}
  @media (max-width:800px){body{zoom:.5}}
</style>

<style>
${faceBase}
${css}
</style>
</head>
<body>
${sec('front', frontNodes)}
${backNodes.length ? sec('back', backNodes) : ''}
</body>
</html>
`;
  const r = canon.canonHtml(out);
  const changes = r.report.removed.concat(r.report.rewritten).map((x) => `${x.code}×${x.count}`);
  if (!r.meta.sections) throw new Error(`${path.basename(dir)}: not detected as sections`);
  writeFileSync(file, out);
  console.log(`${path.basename(dir).padEnd(16)} front ${frontNodes.length} back ${backNodes.length} fonts ${fonts.join(', ')} ${changes.length ? 'CHANGES ' + changes.join(' ') : 'clean'}`);
}

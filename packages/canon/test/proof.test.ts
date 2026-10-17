import { describe, expect, it } from 'vitest';
import { canonHtml } from '../src/html';

const SHEET = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="scrollodex:orientation" content="landscape">
<meta name="scrollodex:summary" content="A bone card, the name top left, a small sun bottom right. The back says what she is drawing.">
<title>Asha</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces&display=swap">
<style data-proof>body{display:flex;gap:40px}[data-face]{box-shadow:0 0 1px #000}</style>
<style>[data-face]{position:relative;width:700px;height:400px;background:#f4efe4}.name{font-family:"Fraunces",serif;font-size:60px}
table{border-collapse:collapse}pre{font-family:"IBM Plex Mono",monospace}</style>
</head><body>
<p class="stray">not a face</p>
<section data-face="front"><h1 class="name">Asha</h1>
<table><tr><td colspan="2">DEL</td><td>BLR</td></tr></table>
<pre>  two
   spaces</pre>
<svg viewBox="0 0 10 10"><defs><symbol id="Dot_1"><circle r="2"/></symbol></defs><use href="#Dot_1" style="fill:#c2410c"/></svg>
</section>
<section data-face="back"><p class="line">Now drawing</p></section>
<section data-face="back"><p>a second back</p></section>
<div data-face="front">not a top-level section</div>
</body></html>`;

describe('proof sheet (plan v3 Phase 4)', () => {
  const r = canonHtml(SHEET);

  it('keeps exactly one front and one back section, and nothing else in body', () => {
    expect(r.meta.sections).toBe(true);
    expect(r.html).toMatch(/<body><section data-face="front">[\s\S]*<\/section><section data-face="back">[\s\S]*<\/section><\/body>/);
    expect((r.html.match(/data-face=/g) ?? []).length).toBe(2);
    expect(r.html).not.toContain('stray');
    expect(r.html).not.toContain('a second back');
    const codes = r.report.removed.map((x) => x.code);
    expect(codes).toContain('proof.body');
    expect(codes).toContain('proof.duplicate');
  });

  it('strips the scaffold as information, not as a change', () => {
    expect(r.html).not.toContain('fonts.googleapis');
    expect(r.html).not.toContain('box-shadow');
    expect(r.report.warnings.map((x) => x.code)).toEqual(expect.arrayContaining(['proof.fonts', 'proof.style']));
    expect(r.report.rewritten).toEqual([]);
  });

  it('keeps the summary meta and the card styles', () => {
    expect(r.meta.summary).toMatch(/^A bone card/);
    expect(r.html).toContain('<meta name="scrollodex:summary"');
    expect(r.meta.fonts).toEqual(['Fraunces', 'IBM Plex Mono']);
  });

  it('keeps tables, preformatted whitespace, same-document <use> and SVG inline styles', () => {
    expect(r.html).toContain('<table><tbody><tr><td colspan="2">DEL</td>');
    expect(r.html).toContain('<pre>  two\n   spaces</pre>');
    expect(r.html).toContain('<use href="#Dot_1" style="fill:#c2410c"></use>');
    expect(r.html).toContain('id="Dot_1"');
  });

  it('is idempotent', () => {
    expect(canonHtml(r.html).html).toBe(r.html);
  });

  it('still strips data-face everywhere on a card that is not a proof sheet', () => {
    const old = canonHtml('<html><body><div data-face="back">x</div><p>y</p></body></html>');
    expect(old.meta.sections).toBeUndefined();
    expect(old.html).not.toContain('data-face');
    expect(old.report.removed.map((x) => x.code)).toContain('attr.data_face');
  });

  it('keeps hyphenated unknown properties and drops bare unknown words', () => {
    const r2 = canonHtml('<html><body><p style="text-wrap-style:balance;-webkit-text-stroke:1px #000;javascript:alert(1)">x</p></body></html>');
    expect(r2.html).toContain('text-wrap-style:balance');
    expect(r2.html).toContain('-webkit-text-stroke:1px #000');
    expect(r2.html).not.toContain('javascript');
  });
});

describe('svg url(#id) with the wider id pattern', () => {
  it('keeps stroke="url(#inkGrad)" on an SVG shape', () => {
    const r = canonHtml('<html><body><svg><defs><linearGradient id="inkGrad"><stop offset="0"/></linearGradient></defs><path d="M0 0h10" stroke="url(#inkGrad)"/></svg></body></html>');
    expect(r.html).toContain('stroke="url(#inkGrad)"');
    expect(r.report.removed.map((x) => x.code)).not.toContain('attr.dropped');
  });
});

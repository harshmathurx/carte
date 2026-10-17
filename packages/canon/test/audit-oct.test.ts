import { describe, expect, it } from 'vitest';
import { canonHtml, CanonError, validateContact } from '../src/index.js';
import { textViolations, treeViolations } from './invariants.js';

const clean = (html: string) => {
  const r = canonHtml(html);
  expect(textViolations(r.html), r.html).toEqual([]);
  expect(treeViolations(r.html), r.html).toEqual([]);
  expect(canonHtml(r.html).html).toBe(r.html);
  return r;
};
const body = (html: string) => clean(html).html.replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, '');
const css = (html: string) => clean(html).html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
const codes = (html: string) => {
  const r = clean(html).report;
  return [...r.removed, ...r.rewritten].map((i) => i.code);
};

describe('SVG presentation attributes are CSS values (P0)', () => {
  it('strips image-set() in mask, which escInert used to hide from the URL filter', () => {
    const r = clean(`<svg><rect mask="image-set('https://evil/x.png' 1x)"/></svg>`);
    expect(r.html).not.toContain('mask=');
    expect(r.html).not.toContain('evil');
    expect(r.report.removed.map((i) => i.code)).toContain('attr.dropped');
  });
  it.each([
    `<svg><rect fill="cross-fade('https://evil/x.png', red)"/></svg>`,
    `<svg><rect filter="image-set('https://evil/x.png' 1x)"/></svg>`,
    `<svg><rect clip-path="element(#x)"/></svg>`,
    `<svg><rect stroke="paint(x)"/></svg>`,
    `<svg><rect fill="attr(data-x)"/></svg>`,
    `<svg><rect fill="src('https://evil/x.png')"/></svg>`,
    `<svg><rect fill="IMAGE-SET('https://evil/x.png' 1x)"/></svg>`,
    `<svg><rect marker-start="image('https://evil/x.png')"/></svg>`,
  ])('strips a non-allowlisted function: %s', (h) => {
    const out = body(h);
    expect(out).toBe('<svg><rect></rect></svg>');
  });
  it('keeps url(#id), hex and colour functions', () => {
    expect(body('<svg><rect fill="url(#grad)"/></svg>')).toBe('<svg><rect fill="url(#grad)"></rect></svg>');
    expect(body('<svg><rect fill="#f00"/></svg>')).toBe('<svg><rect fill="#f00"></rect></svg>');
    expect(body('<svg><rect fill="rgb(1,2,3)"/></svg>')).toBe('<svg><rect fill="rgb(1,2,3)"></rect></svg>');
    expect(body('<svg><g transform="translate(10 20) rotate(45)"/></svg>')).toContain('transform="translate(10 20) rotate(45)"');
    expect(body('<svg><rect fill="var(--ink)"/></svg>')).toContain('fill="var(--ink)"');
    expect(body('<svg><text font-family="\'Inter\', sans-serif">x</text></svg>')).toContain('font-family=');
  });
  it('keeps basic-shape functions in clip-path (appearance, not capability)', () => {
    expect(body('<svg><rect clip-path="circle(40%)"/></svg>')).toContain('clip-path="circle(40%)"');
    expect(body('<svg><rect clip-path="inset(10px round 4px)"/></svg>')).toContain('clip-path="inset(10px round 4px)"');
    expect(body('<svg><rect clip-path="polygon(0 0, 100% 0, 50% 100%)"/></svg>')).toContain('polygon(');
    expect(body('<svg><rect clip-path="path(\'M0 0h10v10z\')"/></svg>')).toBe('<svg><rect></rect></svg>');
  });
});

describe('harmless HTML read the same way twice (P1)', () => {
  it('a table after an open <p> parses in standards mode both times', () => {
    const out = body('<p>a<table><tr><td>x</td></tr></table>');
    expect(out).toBe('<p>a</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });
  it('keeps the leading newlines of <pre>', () => {
    const r = clean('<pre>\n\nx</pre>');
    expect(r.html).toContain('<pre>\n\nx</pre>');
    expect(body('<pre>\nx</pre>')).toBe('<pre>x</pre>');
  });
  it('a custom element inside <p> becomes a <span>', () => {
    expect(body('<p><x-y class="t">hi</x-y></p>')).toBe('<p><span class="t">hi</span></p>');
    expect(body('<p><b><x-y>hi</x-y></b></p>')).toBe('<p><b><span>hi</span></b></p>');
    expect(body('<x-y>hi</x-y>')).toBe('<div>hi</div>');
  });
  it('menu lists survive, nested <li> too', () => {
    expect(body('<menu><li>a<li>b<menu><li>c</li></menu></li></menu>')).toBe('<menu><li>a</li><li>b<menu><li>c</li></menu></li></menu>');
    expect(body('<ul><li>a<menu><li>c</li></menu></li></ul>')).toBe('<ul><li>a<menu><li>c</li></menu></li></ul>');
  });
  it('an unwrapped list container never leaves <li> straight inside <li>', () => {
    const out = body('<ul><li>a<dir><li>c</li></dir></li></ul>');
    expect(out).not.toMatch(/<li>a<li>/);
    expect(out).toContain('c');
  });
});

describe('D51 fidelity: appearance survives', () => {
  it('SVG <style> goes through the stylesheet filter instead of being dropped', () => {
    const r = clean('<svg><style>.st0{fill:#e63;stroke:url(https://evil/x)}.st1{fill:red}</style><rect class="st0"/></svg>');
    expect(r.html).toContain('<style>.st0{fill:#e63}.st1{fill:red}</style>');
    expect(r.html).not.toContain('evil');
    expect(r.report.removed.map((i) => i.code)).not.toContain('element.style_in_svg');
  });
  it('SVG <style> with CDATA keeps its rules', () => {
    expect(css('<svg><style><![CDATA[.st0{fill:#123}]]></style></svg>')).toBe('.st0{fill:#123}');
  });
  it('<a> is still plain text (D51 table, contract §no-<a>)', () => {
    expect(body('<p><a class="l">x</a></p>')).toBe('<p><span class="l">x</span></p>');
  });
  it('button, progress and meter become spans that keep their text', () => {
    expect(body('<div><button class="b" type="submit" formaction="javascript:x">Go</button></div>')).toBe('<div><span class="b">Go</span></div>');
    expect(body('<div><progress value="3" max="5">60%</progress></div>')).toBe('<div><span>60%</span></div>');
    expect(body('<div><meter value="0.6">6/10</meter></div>')).toBe('<div><span>6/10</span></div>');
    expect(codes('<div><button>Go</button></div>')).not.toContain('element.form');
  });
  it.each(['nav', 'hgroup', 'ruby', 'dfn', 'label'])('keeps <%s>', (t) => {
    expect(body(`<div><${t} class="k">x</${t}></div>`)).toBe(`<div><${t} class="k">x</${t}></div>`);
  });
  it('keeps ruby annotations and <data value>', () => {
    expect(body('<p><ruby>漢<rp>(</rp><rt>kan</rt><rp>)</rp></ruby></p>')).toBe('<p><ruby>漢<rp>(</rp><rt>kan</rt><rp>)</rp></ruby></p>');
    expect(body('<p><data value="42">forty-two</data></p>')).toBe('<p><data value="42">forty-two</data></p>');
  });
  it('label loses its for= (no controls to point at)', () => {
    expect(body('<div><label for="x">a</label></div>')).toBe('<div><label>a</label></div>');
  });
  it('keeps hidden and hidden="until-found"', () => {
    expect(body('<p hidden>x</p><p hidden="until-found">y</p><p hidden="hidden">z</p>')).toBe(
      '<p hidden="">x</p><p hidden="until-found">y</p><p hidden="">z</p>',
    );
  });
});

describe('D51 fidelity: CSS', () => {
  it('nested rules without & are kept as & descendants', () => {
    const out = css('<style>.card { color: red; .t { color: blue } > p { color: green } }</style>');
    expect(out).toBe('.card{color:red;& .t{color:blue}&>p{color:green}}');
    expect(codes('<style>.card { color: red; .t { color: blue } }</style>')).not.toContain('css.parse_error');
  });
  it('nested rules without & keep later declarations and nest again', () => {
    expect(css('<style>.c{ .t{color:blue} color:red; .u{ span{color:green} } }</style>')).toBe(
      '.c{& .t{color:blue}color:red;& .u{& span{color:green}}}',
    );
  });
  it('nested rules are filtered like any other', () => {
    const out = css('<style>.c{ .t{background:url(https://evil/x)} p:hover{color:red} .u{color:blue} }</style>');
    expect(out).toBe('.c{& .u{color:blue}}');
  });
  it('garbage inside a block is still a parse error', () => {
    expect(codes('<style>.c{ color:red; !!! }</style>')).toContain('css.parse_error');
  });
  it('a dead selector drops only itself from a selector list', () => {
    expect(css('<style>.a, .b:hover { color: red }</style>')).toBe('.a{color:red}');
    expect(codes('<style>.a, .b:hover { color: red }</style>')).toContain('css.dead_selector');
    expect(css('<style>.a:focus, .b:hover { color: red }</style>')).toBe('');
  });
  it('words that merely contain binding/behavior or a colon in a string survive', () => {
    const out = css('<style>p{font-family:"Binding Sans";--label:"Tel: 555";--b:"behaviour"}</style>');
    expect(out).toContain('font-family:"Binding Sans"');
    expect(out).toContain('--label:"Tel: 555"');
  });
  it.each([
    'p{--x:"https://evil.example/x"}',
    'p{--x:"javascript:alert(1)"}',
    'p{--x:"data:image/png;base64,AAAA"}',
    'p{--x:"//evil.example/x"}',
    'p{--x:"x;behavior:url(y)"}',
    'p{--x:"-moz-binding:url(y)"}',
    'p{font-family:"a;behavior:url(x)"}',
    'p{content:"-webkit-binding"}',
    'p{width:expression(alert(1))}',
  ])('still catches %s', (rule) => {
    const out = css(`<style>${rule}</style>`);
    expect(out).toBe('');
  });
  it.each(['-webkit-user-modify', 'user-modify'])('denies %s', (p) => {
    expect(css(`<style>p{${p}:read-write;color:red}</style>`)).toBe('p{color:red}');
    expect(codes(`<style>p{${p}:read-write}</style>`)).toContain('css.dangerous');
  });
});

describe('stack depth and malformed input', () => {
  it('5000 nested <b> is a clean budget.depth, not a RangeError', () => {
    const html = '<b>'.repeat(5000) + 'x';
    expect(() => canonHtml(html)).toThrowError(CanonError);
    try {
      canonHtml(html);
    } catch (e) {
      expect((e as CanonError).code).toBe('budget.depth');
    }
  });
  it('deep unwrapped nesting is a clean budget.depth too', () => {
    const html = '<font>'.repeat(20000) + 'x';
    try {
      canonHtml(html);
      throw new Error('expected a throw');
    } catch (e) {
      expect(e).toBeInstanceOf(CanonError);
      expect((e as CanonError).code).toBe('budget.depth');
    }
  });
  it('deep SVG <style> children do not blow the stack', () => {
    const html = '<svg><style>' + '<g>'.repeat(40000) + '</style></svg>';
    try {
      canonHtml(html);
    } catch (e) {
      expect(e).toBeInstanceOf(CanonError);
    }
  });
  it('48 levels is still fine', () => {
    expect(() => canonHtml('<div>'.repeat(48) + 'x')).not.toThrow();
  });
  it('a malformed mailto: is a validation error, not a URIError', () => {
    const r = validateContact({ name: { display: 'A' }, a11y: { summary: 'A card.' }, links: [{ label: 'Mail', url: 'mailto:%E0%A4%A@x.com' }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/mailto/);
  });
  it('a good mailto: still passes', () => {
    const r = validateContact({ name: { display: 'A' }, a11y: { summary: 'A card.' }, links: [{ label: 'Mail', url: 'mailto:a%40b@x.com' }] });
    expect(r.ok).toBe(false);
    const ok = validateContact({ name: { display: 'A' }, a11y: { summary: 'A card.' }, links: [{ label: 'Mail', url: 'mailto:ada@x.com' }] });
    expect(ok.ok).toBe(true);
  });
});

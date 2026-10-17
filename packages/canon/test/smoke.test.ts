import { describe, expect, it } from 'vitest';
import { canonHtml, parsePointer } from '../src/index.js';

describe('smoke', () => {
  it('strips script and handlers', () => {
    const r = canonHtml(
      '<p onclick=x>hi</p><script>1</script><a href="https://x.com">go</a><img src="https://t.co/p.gif"><style>p{color:red;position:fixed} a:hover{x:y} @import url(x.css); .b{background:url(https://e.com/x.png)}</style>',
    );
    console.log(r.html);
    console.log(JSON.stringify(r.report, null, 1), r.externalImages);
    expect(r.html).not.toContain('script');
  });
});

describe('parsePointer appOrigin', () => {
  const tok = 'A'.repeat(22);
  it('accepts the host’s own https origin only when passed', () => {
    expect(parsePointer(`https://preview.example.app/x/${tok}`)).toBeNull();
    expect(parsePointer(`https://preview.example.app/x/${tok}`, { appOrigin: 'https://preview.example.app' })).toBe(tok);
    expect(parsePointer(`https://evil.example/x/${tok}`, { appOrigin: 'https://preview.example.app' })).toBeNull();
    expect(parsePointer(`http://preview.example.app/x/${tok}`, { appOrigin: 'http://preview.example.app' })).toBeNull();
    expect(parsePointer(`https://mycarte.art/x/${tok}`, { appOrigin: 'https://preview.example.app' })).toBe(tok);
  });
});

import { describe, expect, it } from 'vitest';
import { verifyAndInline, VerifyError } from '../src/verify';
import { makeFixture } from './fixtures';

async function code(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (e) {
    return e instanceof VerifyError ? e.code : 'other:' + String(e);
  }
}

describe('verifyAndInline', () => {
  it('accepts an untouched card and inlines verified images', async () => {
    const f = await makeFixture();
    const b = await verifyAndInline(f.fetch, f.expected);
    expect(b.html).toBe(f.html);
    expect(b.meta.finish).toBe('holo');
    expect(b.images[f.imgPath]).toMatch(/^data:image\/webp;base64,/);
  });

  it('rejects tampered html', async () => {
    const f = await makeFixture();
    f.store['card.html'] = new TextEncoder().encode(f.html.replace('MIKA', 'EVIL'));
    expect(await code(verifyAndInline(f.fetch, f.expected))).toBe('verify.hash');
  });

  it('rejects a tampered image', async () => {
    const f = await makeFixture();
    f.store[f.imgPath] = new Uint8Array([1, 2, 3]);
    expect(await code(verifyAndInline(f.fetch, f.expected))).toBe('verify.hash');
  });

  it('rejects a card presented under the wrong handle', async () => {
    const f = await makeFixture();
    expect(await code(verifyAndInline(f.fetch, { ...f.expected, handle: 'someone' }))).toBe('verify.digest');
  });

  it('rejects a digest that does not match the file list', async () => {
    const f = await makeFixture();
    const files = { ...f.expected.files, 'card.html': '0'.repeat(64) };
    expect(await code(verifyAndInline(f.fetch, { ...f.expected, files }))).toBe('verify.digest');
  });

  it('rejects a swapped contact', async () => {
    const f = await makeFixture();
    const json = f.expected.contact.json.replace('mika@example.com', 'evil@example.com');
    expect(await code(verifyAndInline(f.fetch, { ...f.expected, contact: { json, salt: f.salt } }))).toBe('verify.contact');
  });

  it('rejects signed html that is not canonical', async () => {
    const f = await makeFixture({ html: '<div onclick="x()">hi</div><script>alert(1)</script>' });
    expect(await code(verifyAndInline(f.fetch, f.expected))).toBe('verify.canon');
  });

  it('rejects unexpected file paths', async () => {
    const f = await makeFixture();
    const files = { ...f.expected.files, '../etc/passwd': '0'.repeat(64) };
    expect(await code(verifyAndInline(f.fetch, { ...f.expected, files }))).toBe('verify.files');
  });
});

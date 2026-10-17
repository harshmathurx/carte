import { describe, expect, it } from 'vitest';
import { canonHtml } from '@carte/canon';
import { CardStage } from '../src/stage';
import { loop } from '../src/spring';
import type { VerifiedBundle } from '../src/types';

const bundle: VerifiedBundle = {
  digest: 'd'.repeat(64), handle: 'mika', displayName: 'Mika',
  html: canonHtml('<style>p{animation:spin 1s infinite}@keyframes spin{to{rotate:1turn}}</style><p>hi</p>').html,
  images: {}, meta: { orientation: 'landscape', finish: 'gloss', fonts: [] },
};
const STILL = 'animation:none!important';

describe('CardStage: reduced motion stills the card’s own animations', () => {
  for (const reducedMotion of [true, false]) {
    it(`reducedMotion=${reducedMotion} ${reducedMotion ? 'stills' : 'keeps'} CSS animation`, () => {
      const root = document.createElement('div');
      document.body.appendChild(root);
      const stage = new CardStage(root, { interactive: false, reducedMotion });
      stage.load(bundle);
      const frame = root.querySelector('iframe');
      expect(frame?.srcdoc.includes(STILL)).toBe(reducedMotion);
      stage.destroy();
      loop.remove(stage);
      root.remove();
    });
  }
});

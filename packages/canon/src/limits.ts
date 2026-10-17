export const SCF_VERSION = 0;
/** Integer version of the canonicalizer. Any change to canonical output bytes bumps it.
 * 2 (2026-10-01, plan v3 Phase 4): proof-sheet sections, tables and preformatted text kept, SVG inline styles
 * sanitized instead of dropped, unknown property names kept, same-document <use>, wider ids, bigger budgets.
 * 3 (2026-10-17, audit fixes): SVG <style> kept, `hidden` kept, buttons/progress/meter become spans, SVG
 * attributes with disallowed CSS functions dropped, nested CSS without `&` kept, dead selectors dropped one
 * at a time, doctype-stable parsing, <pre> leading newlines kept. */
export const CANON_VERSION = 3;

/** The single card-document CSP (D11). Nothing can execute and nothing can load except inlined data. */
export const CARD_CSP =
  "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; script-src 'none'; connect-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; object-src 'none'; media-src 'none'; manifest-src 'none'; form-action 'none'; base-uri 'none'";

/** Budgets are performance limits, not safety (plan v3 §11): the receive-speed guardrail decides them. */
export const LIMITS = {
  htmlUploadBytes: 153600,
  images: 10,
  imagesTotalBytes: 614400,
  imageMaxPx: 1600,
  elements: 3000,
  depth: 48,
  keyframes: 100,
  filters: 40,
  summaryChars: 300,
} as const;

export type Finish = 'matte' | 'gloss' | 'foil' | 'holo' | 'emboss';
export const FINISHES: readonly Finish[] = ['matte', 'gloss', 'foil', 'holo', 'emboss'];

export interface CardMeta {
  orientation: 'landscape' | 'portrait';
  finish: Finish;
  finishMask?: string;
  background?: string;
  /** `scrollodex:summary`: what the card looks like, for screen readers and search (≤ 300 chars). */
  summary?: string;
  /** True when the card is written as a proof sheet: `<section data-face="front">` (+ `back`) in `<body>`. */
  sections?: boolean;
  fonts: string[];
}

export const FONT_LIBRARY = [
  'Instrument Serif',
  'Fraunces',
  'Playfair Display',
  'Bodoni Moda',
  'Cormorant',
  'EB Garamond',
  'Libre Caslon Text',
  'Space Grotesk',
  'Syne',
  'Inter',
  'DM Sans',
  'Archivo Black',
  'IBM Plex Mono',
  'JetBrains Mono',
  'VT323',
  'Press Start 2P',
  'Caveat',
  'Pinyon Script',
] as const;

export const IMAGE_REF_RE = /^images\/[0-9a-f]{12}\.(?:webp|png)$/;

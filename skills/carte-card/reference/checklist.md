# Pre-flight checklist

Walk this before you hand the file back. Every line is something the app's cleaner would otherwise change, or something the person would notice.

## The file

- [ ] One file, `card.html`, written as the proof sheet: a `<section data-face="front">` and (usually) a `<section data-face="back">` in `<body>`, and nothing else in `<body>`.
- [ ] Opened as-is in a browser, both faces show side by side at 700×400 (or 400×700), in the right fonts.
- [ ] The proof scaffold is there: the Google Fonts `<link>` for the families used, and the `<style data-proof>` layout block.
- [ ] `scrollodex:orientation` matches the section size. `scrollodex:finish` is one of matte, gloss, foil, holo, emboss. `scrollodex:summary` says what the card looks like, front and back.
- [ ] No phone or email anywhere, and no `contact.json`: you didn't ask for details and didn't invent any; the app takes them later.
- [ ] Unless they said *just make it*, you offered three directions first and built the one they picked.

## Nothing the cleaner would remove

- [ ] No `<script>`, no `on*=` attributes, no `javascript:`.
- [ ] No `<a>`.
- [ ] No `@import`, no `@font-face`, no `<link>` other than the proof fonts link, no external `url()` or `src`.
- [ ] Every `font-family` is a library family or a generic. The library families used are in the fonts link.
- [ ] No `:hover`, `:focus`, `:active`, `:checked` and friends.
- [ ] No `position: fixed` or `sticky`.
- [ ] No `data:` URIs. Rasters, if any, come from `images/<file>`, at most 10.
- [ ] SVG: no `<image>`, no `<foreignObject>`, no SMIL. `<use href="#id">` within the file is fine.
- [ ] The card (everything except the scaffold) is under 150 KB.

## What makes it good

- [ ] The name is in the top quarter (top 104 px landscape, 182 px portrait), 44 px or larger.
- [ ] Nothing meant to be read is under 20 px.
- [ ] The back adds something; it is not the front again.
- [ ] Every `@keyframes` animation has a `@media (prefers-reduced-motion: reduce)` rule that stops it, and the un-animated card is the finished design.
- [ ] Light and dark both look intended.
- [ ] 4.5:1 contrast for small text, 3:1 for display type. SVG art has `role="img"` and an `aria-label`.
- [ ] No phone number or email in the art.
- [ ] It could not be anyone else's card.

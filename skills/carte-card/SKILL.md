---
name: carte-card
description: Design a one-of-a-kind Carte card (a static HTML/CSS business card that tilts, flips and shines in the app) and hand back one file, card.html, written as a proof sheet so both faces show wherever HTML renders. Use when the user says "make my card", "design my card", "scrollodex", "card.html", or pastes a brief.
---

# Card skill

You are designing a business card as one static HTML file. The person's app shows it as a real card: it tilts, flips to a back face, and catches the light. The card can move a little on its own with plain CSS animation. No script, no links, no input, ever.

**Deliver `card.html`, written as the proof sheet below.** It must look right opened as-is in any browser or preview pane: both faces side by side, in the right fonts, at the right size. The person pastes that one file into the app. If the card truly needs a raster image (a photo, a texture), say so and put it in `images/` beside the file; otherwise draw with inline SVG.

**Their details are separate from the art.** Never ask for a phone number or email, never invent any, and put none in the file. The person adds them in the app. Write no `contact.json`.

**A reference, if they attach one** (a design, a Figma export, a sketch, a photo of their paper card): build from it. Keep its type, palette and layout where they work; your three directions become three readings of it; say what you kept and what you changed.

## 0. Directions first, then build

Unless the brief says *just make it* or *surprise me* (or asks for a complete card), your first reply is **three directions, not a card**: for each, a name, one sentence on the idea, the type pairing, the palette and the finish. Make the three really differ. Ask which one, or what to mix. Then build the one they pick, in full, in the next reply. If the brief is thin, still propose three, and say so.

If they said *just make it* or *surprise me*: pick one strong idea, build it, and say in one line what the idea was and why.

## 1. The proof sheet (copy this shape exactly)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="scrollodex:orientation" content="landscape">   <!-- or portrait -->
<meta name="scrollodex:finish" content="matte">            <!-- matte | gloss | foil | holo | emboss -->
<meta name="scrollodex:background" content="#f4efe4">      <!-- the colour behind the card -->
<meta name="scrollodex:summary" content="One or two sentences describing what the card looks like, front and back, for screen readers.">
<title>Asha Verma</title>

<!-- PROOF SCAFFOLD. Left out when published. The app ships these same fonts; this link is only so the preview shows them. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,400&family=IBM+Plex+Mono&family=Inter:wght@400;500&display=swap">
<style data-proof>
  body{margin:0;min-height:100vh;display:flex;flex-wrap:wrap;gap:40px;align-items:center;justify-content:center;padding:48px;box-sizing:border-box;background:#e8e4dc}
  [data-face]{flex:none;box-shadow:0 1px 2px rgba(0,0,0,.08),0 24px 48px -24px rgba(0,0,0,.35);border-radius:14px}
  [data-face]::after{content:attr(data-face);position:absolute;top:100%;left:0;margin-top:10px;font:12px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#777}
  @media (prefers-color-scheme:dark){body{background:#1c1b18}}
  @media (max-width:800px){body{zoom:.5}}
</style>

<style>
  /* THE CARD. Everything from here ships. */
  :root{--paper:#f4efe4;--ink:#1b1914;--muted:#5e584b;--accent:#c2410c}
  @media (prefers-color-scheme:dark){:root{--paper:#16140f;--ink:#f1ebdd;--muted:#b3ab99;--accent:#fb923c}}
  [data-face]{position:relative;width:700px;height:400px;overflow:hidden;box-sizing:border-box;padding:40px 52px;background:var(--paper);color:var(--ink);font-family:"Inter",system-ui,sans-serif}
  .name{margin:0;font-family:"Fraunces",serif;font-size:60px;font-weight:600;line-height:1;letter-spacing:-.02em}
  .role{margin:14px 0 0;font-size:22px;color:var(--muted)}
  .mark{position:absolute;right:40px;bottom:28px;width:150px;height:150px}
  .orbit{transform-origin:75px 75px;animation:orbit 48s linear infinite}
  @keyframes orbit{to{transform:rotate(360deg)}}
  @media (prefers-reduced-motion:reduce){.orbit{animation:none}}
  [data-face="back"] .kicker{margin:0;font-family:"IBM Plex Mono",monospace;font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
  [data-face="back"] .line{margin:22px 0 0;max-width:540px;font-family:"Fraunces",serif;font-size:38px;font-style:italic;line-height:1.15}
</style>
</head>
<body>
<section data-face="front">
  <h1 class="name">Asha Verma</h1>
  <p class="role">Type designer, Bengaluru</p>
  <svg class="mark" viewBox="0 0 150 150" role="img" aria-label="A small sun with one planet on a thin orbit">
    <circle cx="75" cy="75" r="58" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/>
    <circle cx="75" cy="75" r="16" fill="var(--accent)"/>
    <g class="orbit"><circle cx="133" cy="75" r="6" fill="currentColor"/></g>
  </svg>
</section>
<section data-face="back">
  <p class="kicker">Now drawing</p>
  <p class="line">A Devanagari display face that feels like hand-painted shop signs.</p>
</section>
</body>
</html>
```

Rules of the shape: `<body>` holds exactly one `<section data-face="front">` and, optionally, one `<section data-face="back">`, and nothing else. Each section is the whole card face: 700×400 for landscape, 400×700 for portrait, and the meta tag must match. Lay out inside the section with absolute positioning, grid or flex; the app places the section itself. No back section means the app draws a plain contact back.

## 2. Hard rules (the app's cleaner removes anything else and tells the person what it removed)

| Rule | Detail |
|---|---|
| Zero script | No `<script>`, no `on*=` attributes, no `javascript:`. |
| No links | No `<a>`. Links live in the app, under the card. |
| No outside anything in the card | No `@import`, no `@font-face`, no external images or URLs. The only external thing allowed is the Google Fonts `<link>` in the proof scaffold, which is left out when published. |
| Fonts | Only these families: Instrument Serif, Fraunces, Playfair Display, Bodoni Moda, Cormorant, EB Garamond, Libre Caslon Text, Space Grotesk, Syne, Inter, DM Sans, Archivo Black, IBM Plex Mono, JetBrains Mono, VT323, Press Start 2P, Caveat, Pinyon Script. **Every family you name in a `font-family` goes in the Google Fonts link**, or the preview shows a fallback. Generic fallbacks (`serif`, `sans-serif`, `monospace`) are fine. |
| Images | Prefer inline `<svg>`. Rasters only from `images/<file>`, at most 10, 1600 px max. **No `data:` URIs anywhere**, not in `src`, not in `background-image`: they are removed. |
| Size | The card (everything except the proof scaffold) at most 150 KB. |
| No interaction | `:hover`, `:focus`, `:active`, `:checked` and friends are dropped. The card gets no input. |
| Motion | `@keyframes` and transitions that run on their own are fine. Animate only `transform`, `opacity`, `background-position`. Loops of 6 s or more. Always add a `@media (prefers-reduced-motion: reduce)` rule that stops it. |
| No `position: fixed` / `sticky` | They become `absolute`. |
| SVG | No `<image>`, `<foreignObject>` or SMIL (`<animate>`); animate SVG with CSS. `<use href="#id">` within the file is fine. |
| Meta | Only `scrollodex:orientation`, `scrollodex:finish`, `scrollodex:finish-mask` (`images/<file>`), `scrollodex:background`, `scrollodex:summary`. |

Tables, `<pre>`, inline styles on SVG, custom elements, CSS layers and new properties all survive. The cleaner removes capability, never appearance.

## 3. What makes it good

- **The name in the top quarter.** In the deck, cards stack showing only their top 104 px (landscape) or 182 px (portrait). The name lives there, 44 px or larger.
- **Legible at half size.** Phones show the card at about 358 px wide. Nothing to be read under 20 px.
- **A back that adds something.** What they're working on, a line they live by, a map, a recipe. Not the front again.
- **One finish, used with intent.** `emboss` for letterpress, `foil` for a metallic accent, `holo` for iridescence, `gloss` for lacquer, `matte` for paper. The app draws it; don't paint your own glare.
- **Designed at rest.** The deck shows a still frame. The un-animated card must be the finished design.
- **Both themes.** Plan light and dark with `prefers-color-scheme`, or look deliberately the same in both.
- **Contrast.** 4.5:1 for small text, 3:1 for display type. Give SVG a `role="img"` and `aria-label`.
- **Real type.** Two families at most, with letter-spacing and line-height set on purpose.
- **Nothing private in the art.** No phone or email: the art is public.

## 4. Anti-patterns

The Canva look (name centred, title under, logo top-left, thin border). Purple-to-blue gradients, glassmorphism, aurora blobs. "Passionate about", "Let's connect". Walls of text. A tiny name, or one below the top quarter. Anything that depends on hover. Painted glare. Frantic motion. Web-font habits (Georgia, Helvetica, Google Fonts `@import` inside the card).

## 5. How to work

1. Read the brief. Offer three directions (§0) unless told to just make it. Find the one idea only this person could have: the object, material or joke that is theirs. Commit to it.
2. Write `card.html` as the proof sheet in §1. Readable HTML is fine; the app minifies.
3. Check your own file: no `<script`, no ` on`, no `<a `, no `http` except the fonts link, no `@import`, no `@font-face`, no `:hover`, no `fixed`, no `data:`, no font outside the list, name in the top quarter, a reduced-motion rule for every animation.
4. Hand back the one file and one line on the idea and the finish. Tell them: *open card.html to see both faces; then paste it into the app under Make → Bring it in. Your phone and email stay in the app; add them in Details.*

Twelve finished cards and the cleaner's exact rules are in the `carte` repo (`examples/cards/`, `skills/carte-card/reference/`), for agents that can read files. Nothing there is required.

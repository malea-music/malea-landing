# tilda-landing-export

## Description

Project-level Roo skill for converting the current MALEA landing into a Tilda-compatible custom-code export. Use when the user asks to prepare, regenerate, adapt, debug, or package the landing for Tilda / T123 blocks.

## Main goal

Create a Tilda custom-code export that preserves the current landing visually and functionally:

- same HTML section order and texts;
- same images, video, audio and external media URLs;
- same colors, typography, grid, spacing, responsive behaviour and motion;
- same nav, mobile menu, modals, video modal, audio player, carousel and reveal/opening animations.

Do not rebuild the landing with Tilda native blocks. Do not manually recreate the design in Zero Block. The target is HTML/CSS/JS custom code.

## Hard safety rules

1. Treat the source landing as read-only unless the user explicitly asks to edit the source.
2. For this project, source is normally `C:\Users\svoro\Downloads\Бэкап-2\malea_landing_deploy`.
3. Generate export outside the source project, normally `C:\Users\svoro\Downloads\Бэкап-2\malea_tilda_export`.
4. Do not create export output inside the source project.
5. Do not commit, push, run `safe-save.ps1`, run `publish.ps1`, merge, reset, clean, or publish production.
6. If source `git status` is already dirty, report it and ask whether to continue external-only. Do not touch existing changes.
7. Never delete or modify old source files during Tilda export.

## Required pre-flight

Before any generation, verify:

```powershell
git status --short
git branch --show-current
```

Expected branch: `dev`. If not `dev`, stop unless the user explicitly confirms external-only work. Always report branch and source status in the final answer.

## Audit checklist

Read and map:

1. `index.html`
2. all CSS connected from `index.html`, preserving order;
3. `js/app.js`;
4. all JS modules imported from `js/app.js`;
5. `assets/fonts/`;
6. local and external assets referenced in HTML/CSS/JS.

For this MALEA project, expect these CSS layers:

- `css/00-tokens.css`
- `css/01-base.css`
- `css/02-nav.css`
- `css/03-modal.css`
- `css/04-components.css`
- `css/05-screens.css`
- `css/06-motion.css`
- `css/07-tablet-landscape.css`
- `css/08-tablet-portrait.css`
- `css/10-ipadpro-portrait.css`
- `css/11-tablet-portrait-refine.css`
- `css/12-unified-bg.css`
- `css/13-opening-desktop.css`
- `css/09-mobile-refinements.css`
- `css/14-desktop-rhythm.css`
- `css/15-cinematic-scroll-desktop.css`

Expected JS files:

- `js/app.js`
- `js/modules/nav.js`
- `js/modules/modal.js`
- `js/modules/audio-player.js`
- `js/modules/video-modal.js`
- `js/modules/reviews-carousel.js`
- `js/modules/reveal.js`
- `js/modules/opening.js`
- `js/modules/cinematic-scroll.js`

Expected fonts:

- `assets/fonts/Leotaro-Regular.otf`
- `assets/fonts/circe.ttf`
- `assets/fonts/circe-light.ttf`
- Google Fonts `Cormorant Garamond`

## Tilda risks to document

Always document these risks:

- source CSS has global selectors: `*`, `html`, `body`, headings, paragraphs, links and buttons;
- CSS variables are on `:root`;
- fixed nav/menu/modal/video-modal depend on viewport and z-index;
- JS uses `document`, `window`, `document.body`, `document.documentElement`, `matchMedia`, `IntersectionObserver`;
- source JS uses ES modules;
- Tilda theme may force red link/button colors;
- Tilda editor preview can differ from the published page.

## Export directory structure

Create or refresh the external export directory with:

```text
malea_tilda_export/
  README-TILDA.md
  manifest.json
  local-preview.html
  tilda-body-full.html
  tilda-body-full-use-tilda-fonts.html
  tilda-head.html
  tilda-head-use-tilda-fonts.html
  tilda-footer-js.html
  tilda-body-markup-only.html
  tilda-head-external-css.html
  tilda-footer-external-js.html
  tilda-assets/
    malea-tilda.css
    malea-tilda.js
  assets/fonts/
  fonts-package/
  blocks/
  blocks-external/
  PASTE_TO_TILDA_NUMBERED/
  verification/
    diff-report.md
```

## Output variants

### Variant A: full one-block

Generate:

- `tilda-body-full.html`
- `tilda-body-full-use-tilda-fonts.html`

Use this for best visual parity, but warn that Tilda may say the block contains too much text.

### Variant B: external CSS and JS

Generate:

- `tilda-assets/malea-tilda.css`
- `tilda-assets/malea-tilda.js`
- `tilda-head-external-css.html`
- `tilda-body-markup-only.html`
- `tilda-footer-external-js.html`

This reduces T123 text size but requires public CSS/JS URLs.

### Variant C: numbered paste files

This is the preferred non-technical delivery for the current project. Generate:

- `PASTE_TO_TILDA_NUMBERED/01-CSS-part-1.html`
- `PASTE_TO_TILDA_NUMBERED/02-CSS-part-2.html`
- `PASTE_TO_TILDA_NUMBERED/03-CSS-part-3.html`
- `PASTE_TO_TILDA_NUMBERED/04-CSS-part-4.html`
- `PASTE_TO_TILDA_NUMBERED/05-01-hero-opening.html`
- `PASTE_TO_TILDA_NUMBERED/06-02-philosophy.html`
- `PASTE_TO_TILDA_NUMBERED/07-03-live.html`
- `PASTE_TO_TILDA_NUMBERED/08-04-quote-player.html`
- `PASTE_TO_TILDA_NUMBERED/09-05-performance-art.html`
- `PASTE_TO_TILDA_NUMBERED/10-06-musicians-reviews.html`
- `PASTE_TO_TILDA_NUMBERED/11-07-quote-egypt-formats.html`
- `PASTE_TO_TILDA_NUMBERED/12-08-integration-why-portfolio.html`
- `PASTE_TO_TILDA_NUMBERED/13-09-final-footer-modals.html`
- `PASTE_TO_TILDA_NUMBERED/14-final-footer-js.html`
- `PASTE_TO_TILDA_NUMBERED/15-TILDA-COLOR-FIX.html`
- `PASTE_TO_TILDA_NUMBERED/README-PASTE-ORDER.txt`

User instruction for this variant: add T123 blocks and paste files strictly from `01` to `15`; do not edit file contents.

## CSS split for numbered files

Split CSS into manageable chunks. Proven split for this project:

1. `00-tokens` through `04-components`
2. `05-screens`
3. `06-motion` through `11-tablet-portrait-refine`
4. `12-unified-bg` through `15-cinematic-scroll-desktop` plus Tilda guard

If Tilda fonts `Leotaro` and `Circe` are already configured, remove local `@font-face` rules from numbered CSS parts.

## Font handling

Always create two modes.

### Local/CDN font mode

Copy source fonts to:

- `assets/fonts/`
- `fonts-package/`

Rewrite font URLs to `./assets/fonts/...` in local-preview/full export.

### Tilda font mode

Remove local `@font-face` rules. Use this if Tilda already has fonts configured with exact names:

- `Leotaro`
- `Circe`

For the current MALEA export, numbered paste files should normally use Tilda font mode.

## JS bundle workflow

Tilda paste fragments should not depend on ES module imports. Bundle JS into a plain script:

1. Read modules before `js/app.js` in dependency order.
2. Remove import lines.
3. Replace `export function initX` with `function initX`.
4. Wrap in an IIFE with an idempotency guard:

```js
(function(){
  'use strict';
  if (window.__maleaTildaInitialized) return;
  window.__maleaTildaInitialized = true;
  // bundled JS
})();
```

5. Run `node --check` against the extracted JS.
6. Confirm no remaining `import` or `export` syntax.

## Tilda color override

Tilda may force red link/button colors. Always generate `PASTE_TO_TILDA_NUMBERED/15-TILDA-COLOR-FIX.html`.

The fix must target both wrappers:

- `#malea-tilda-root`
- `.malea-tilda-scope`

Override at least:

- all link states;
- buttons;
- `.nav__links a`;
- `.menu__links a`;
- `.menu__label`;
- `.menu__num`;
- `.modal__tg` and `.modal__tg span`;
- footer links;
- headings and section subtitles.

Use `!important` only in export-only Tilda fix files, never in source project files.

## Local preview

Create `local-preview.html` with a Tilda-like shell:

```html
<div id="allrecords" class="t-records">
  <div class="t-rec" data-record-type="123">
    <div class="t123">
      <div class="t-container">
        <!-- export -->
      </div>
    </div>
  </div>
</div>
```

Add:

```html
<link rel="icon" href="data:,">
```

Run:

```powershell
cd ..\malea_tilda_export && python -m http.server 4174
```

Open `http://localhost:4174/local-preview.html`.

## Verification

Minimum verification:

1. `local-preview.html` returns HTTP 200.
2. Local fonts return HTTP 200 if local font mode is used.
3. JS bundle passes syntax check.
4. There are no residual ES module imports/exports.
5. Capture screenshots for source/export desktop, tablet portrait and mobile when Edge/Chrome is available.
6. Save screenshots and `diff-report.md` in `verification/`.

## README requirements

Generate `README-TILDA.md` with:

- recommended option;
- numbered paste instructions;
- what to do if Tilda says there is too much text;
- what to do if Tilda colors text red;
- font instructions;
- asset table;
- verification checklist;
- rollback instructions;
- confirmation that source was not changed, committed, pushed or published.

Generate `PASTE_TO_TILDA_NUMBERED/README-PASTE-ORDER.txt` with a short human instruction:

```text
В Tilda добавьте подряд T123 HTML-блоки и вставьте файлы строго по номерам 01-15. Ничего менять не нужно. Шрифты Leotaro и Circe должны быть уже заданы в настройках Tilda.
```

## Final report

Report:

1. export folder path;
2. recommended paste folder;
3. local preview status;
4. JS check status;
5. screenshot/verification status;
6. exact user steps for Tilda;
7. risks left;
8. confirmation that source project was not modified, committed, pushed or published.


const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tilda-export');
const PARTS = path.join(OUT, 'parts');
const PUBLIC_BASE = 'https://events.malea-soundhealing.com';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, normalized, 'utf8');
  return bytes(normalized);
}

function bytes(text) {
  return Buffer.byteLength(text, 'utf8');
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

function sanitizeCssForTilda(css) {
  return stripCssComments(css)
    // Tilda's HTML validator can treat CSS comments/selectors with angle
    // brackets as real HTML tags inside custom-code blocks. Direct-child
    // combinators are not essential for this export, so make CSS angle-free.
    .replace(/\s*>\s*/g, ' ')
    .trim();
}

function stylePart(id, title, css) {
  return `<!-- MALEA / Tilda export / ${title} -->\n<style id="${id}">\n${sanitizeCssForTilda(css)}\n</style>\n`;
}

function scriptPart(id, title, js) {
  return `<!-- MALEA / Tilda export / ${title} -->\n<script id="${id}">\n${js.trim()}\n</script>\n`;
}

function markupPart(title, html) {
  return `<!-- MALEA / Tilda export / ${title} -->\n<div class="malea-tilda" data-malea-tilda-part="${title}">\n${html.trim()}\n</div>\n`;
}

function rewriteCssUrls(css) {
  return css.replace(/url\((['"]?)\.\.\/assets\/fonts\/([^'")]+)\1\)/g, `url($1${PUBLIC_BASE}/assets/fonts/$2$1)`);
}

function extractSectionById(body, id) {
  const re = new RegExp(`<section\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>[\\s\\S]*?<\\/section>`, 'i');
  const match = body.match(re);
  if (!match) throw new Error(`Section #${id} not found`);
  return match[0];
}

function extractSectionsWithoutId(body, markerText) {
  const sections = Array.from(body.matchAll(/<section\b[\s\S]*?<\/section>/gi)).map((m) => m[0]);
  const section = sections.find((s) => s.includes(markerText));
  if (!section) throw new Error(`Section containing "${markerText}" not found`);
  return section;
}

function extractBlock(body, startNeedle, endNeedle, includeEnd = true) {
  const start = body.indexOf(startNeedle);
  if (start < 0) throw new Error(`Start block not found: ${startNeedle}`);
  const end = body.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`End block not found: ${endNeedle}`);
  return body.slice(start, includeEnd ? end + endNeedle.length : end);
}

function extractBefore(body, startNeedle, endNeedle) {
  const start = body.indexOf(startNeedle);
  if (start < 0) throw new Error(`Start block not found: ${startNeedle}`);
  const end = body.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`End block not found: ${endNeedle}`);
  return body.slice(start, end);
}

function buildCss() {
  const files = [
    ['00-tokens.css'],
    ['01-base.css'],
    ['02-nav.css', '03-modal.css', '04-components.css'],
    ['05-screens.css'],
    ['06-motion.css', '07-tablet-landscape.css', '08-tablet-portrait.css'],
    ['10-ipadpro-portrait.css', '11-tablet-portrait-refine.css', '09-mobile-refinements.css'],
    ['12-unified-bg.css', '13-opening-desktop.css', '14-desktop-rhythm.css', '15-cinematic-scroll-desktop.css'],
  ];

  return files.map((group) => rewriteCssUrls(group.map((f) => `/* ===== ${f} ===== */\n${read(`css/${f}`)}`).join('\n\n')));
}

function buildTildaGuardCss() {
  return `
/* ===== Tilda color/font guard =====
   This layer is intentionally last. It blocks Tilda theme typography/colors,
   but mirrors the original MALEA design tokens instead of repainting
   everything into one generic color/font. */
html, body, #allrecords, .t-records {
  background: var(--bg-main) !important;
}

#allrecords .malea-tilda {
  font-family: var(--font-body) !important;
  color: var(--ink) !important;
}

#allrecords .malea-tilda :where(div, section, article, header, footer, nav, figure, figcaption, blockquote, ul, ol, li, p, span, a, button, label, input, textarea, h1, h2, h3, h4) {
  font-family: inherit !important;
  color: inherit !important;
}

#allrecords .malea-tilda :where(.intro__mark, .hero__title, .nav__logo, .menu__logo, .display, .heading, .title, .shead__title, .identity__title, .philo__heading, .live__heading, .player__heading, .live-format-name, .menu__label, .ptrack__name, .mus__name, .rev__states-list li, .fmt__line-label, .slots__head, .fi-title, .why__arg h4, .pm-event-name, .pm-partner-name, .pm-upcoming-name, .final__heading, h1, h2, h3, h4) {
  font-family: var(--font-display) !important;
}

#allrecords .malea-tilda :where(.bigquote__text, .bigquote__attr) {
  font-family: var(--font-quote) !important;
}

#allrecords .malea-tilda :where(.overline, .btn, .link-arrow, .menu__num, .fmt__line-num, .live-format-num, .media-caption__idx, .identity__list .n, .rev__states-list .n, .egypt__timeline li::before, .pm-col-num, .pm-col-title, .mus__role, .fi-tag, .ptrack__time .cur) {
  font-family: var(--font-body) !important;
}

#allrecords .malea-tilda :where(.intro__mark, .hero__title, .nav__logo, .menu__logo, .btn--gold, .btn--gold span, .fmt__line-num) {
  color: var(--gold) !important;
}

#allrecords .malea-tilda :where(.overline, .menu__num, .identity__sub, .identity__list .n, .player__sub, .shead__sub, .live-formats-label, .live-format-num, .media-caption__idx, .bigquote__attr, .rev__states-list .n, .egypt__timeline li::before, .fmt__line-spec span, .mus__role, .pm-col-num, .pm-col-title, .fi-tag, .ptrack__time .cur) {
  color: var(--gold-soft) !important;
}

#allrecords .malea-tilda :where(.intro__sub, .hero__lede, .subtitle, .lede, .menu__label, .philo__text, .philo__text p, .live__text, .live-format-name, .ptrack__desc, .media-caption__name, .shead__text, .identity__list li, .rev__states-list li, .rev__q p, .egypt__text, .fmt__line-summary, .fmt__line-spec p, .fi-desc, .why__arg p, .pm-event-name, .pm-partner-name, .pm-upcoming-name, .final__body, .final__body p, .modal__text, .modal__text p, .footer__row, .footer__row a) {
  color: var(--ink-soft) !important;
}

#allrecords .malea-tilda :where(.nav__links a, .ptrack__time, .egypt__concl, .egypt__concl p, .pm-event-type, .pm-partner-role, .pm-upcoming-ctx) {
  color: var(--ink-muted) !important;
}

#allrecords .malea-tilda :where(.shead__title, .identity__title, .philo__heading, .live__heading, .bigquote__text, .player__heading, .heading, .fmt__line-label, .slots__head, .fi-title, .why__arg h4, .final__heading) {
  color: var(--ink) !important;
}

#allrecords .malea-tilda :where(.pm-event:hover .pm-event-name, .pm-partner:hover .pm-partner-name, .pm-upcoming:hover .pm-upcoming-name) {
  color: var(--gold-soft) !important;
}

#allrecords .malea-tilda :where(.footer__sep) {
  color: var(--gold-line) !important;
}

#allrecords .malea-tilda :where(.footer__copy) {
  color: var(--ink-faint) !important;
}

/* Explicit non-:where selectors for Tilda themes that use #allrecords h1/h2/a rules. */
#allrecords .malea-tilda .intro__mark,
#allrecords .malea-tilda .hero__title,
#allrecords .malea-tilda .nav__logo,
#allrecords .malea-tilda .menu__logo {
  font-family: var(--font-display) !important;
  color: var(--gold) !important;
}

#allrecords .malea-tilda .menu__label {
  font-family: var(--font-display) !important;
  color: var(--ink-soft) !important;
}

#allrecords .malea-tilda .footer__row,
#allrecords .malea-tilda .footer__row a {
  font-family: var(--font-body) !important;
  color: var(--ink-soft) !important;
}

#allrecords .malea-tilda .footer__copy {
  font-family: var(--font-body) !important;
  color: var(--ink-faint) !important;
}

#allrecords .malea-tilda .footer__sep {
  color: var(--gold-line) !important;
}

#allrecords .malea-tilda :where(a, button, .btn, .carousel__btn, .ptrack__play, .nav__burger, .menu__close, .modal__close, .video-modal__close) {
  text-decoration: none !important;
  -webkit-tap-highlight-color: transparent;
}

#allrecords .malea-tilda :where(.btn, .btn--gold, .ptrack, .rev__q, .fi-panel, .fmt__line, .modal__card) {
  border-color: var(--gold-line) !important;
}

#allrecords .malea-tilda svg,
#allrecords .malea-tilda svg * {
  stroke: currentColor !important;
}
`;
}

function buildHtmlParts() {
  const html = read('index.html');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<script\s+type="module"[\s\S]*?<\/body>/i);
  if (!bodyMatch) throw new Error('Cannot extract body from index.html');
  const body = bodyMatch[1];

  const atmosphere = extractBlock(body, '<!-- ============ ATMOSPHERIC CANVAS ============ -->', '<!-- ============ NAVIGATION ============ -->', false);
  const nav = extractBlock(body, '<!-- ============ NAVIGATION ============ -->', '</header>');
  const menu = extractBefore(body, '<!-- ============ MOBILE MENU ============ -->', '\n\n<main>');
  const opening = extractBlock(body, '<!-- ============ OPENING STAGE', '</div><!-- /#opening (opening-stage) -->');

  const modal = extractBefore(body, '<!-- ============ MODAL · invite ============ -->', '<!-- ============ VIDEO MODAL');
  const videoModal = body.slice(
    body.indexOf('<!-- ============ VIDEO MODAL · vertical ============ -->'),
    body.lastIndexOf('</div>') + '</div>'.length,
  );
  if (!videoModal.includes('data-video-modal')) throw new Error('Video modal block not found');

  return [
    markupPart('07-html-nav-opening-philosophy', [
      atmosphere,
      nav,
      menu,
      opening,
      extractSectionById(body, 'philosophy'),
    ].join('\n\n')),
    markupPart('08-html-live-player-performance-art', [
      extractSectionById(body, 'live'),
      extractSectionsWithoutId(body, 'Это высоковибрационная музыка'),
      extractSectionById(body, 'player'),
      extractSectionById(body, 'performance'),
      extractSectionById(body, 'art'),
    ].join('\n\n')),
    markupPart('09-html-musicians-reviews-egypt-formats', [
      extractSectionById(body, 'musicians'),
      extractSectionById(body, 'reviews'),
      extractSectionsWithoutId(body, 'Через меня люди соединяются'),
      extractSectionById(body, 'egypt'),
      extractSectionById(body, 'formats'),
    ].join('\n\n')),
    markupPart('10-html-integration-final-modals', [
      extractSectionById(body, 'integration'),
      extractSectionById(body, 'why'),
      extractSectionById(body, 'portfolio'),
      extractSectionsWithoutId(body, 'Коллаборации — моя стратегия'),
      extractSectionById(body, 'final-experience'),
      extractBlock(body, '<!-- ============ FOOTER ============ -->', '</footer>'),
      modal,
      videoModal,
    ].join('\n\n')),
  ];
}

function buildJs() {
  const files = [
    'js/modules/nav.js',
    'js/modules/modal.js',
    'js/modules/audio-player.js',
    'js/modules/video-modal.js',
    'js/modules/reviews-carousel.js',
    'js/modules/reveal.js',
    'js/modules/opening.js',
    'js/modules/cinematic-scroll.js',
    'js/app.js',
  ];
  const bundled = files.map((file) => {
    let code = read(file);
    code = code.replace(/^import\s+[^;]+;\s*$/gm, '');
    code = code.replace(/\bexport\s+(function\s+init[A-Za-z0-9_]+\s*\()/g, '$1');
    return `/* ===== ${file} ===== */\n${code}`;
  }).join('\n\n');

  return `(function () {\n'use strict';\n${bundled}\n})();`;
}

function buildReadme(manifest) {
  const rows = manifest.map((item) => `| ${item.file} | ${item.bytes} |`).join('\n');
  return `# MALEA · Tilda export

Папка содержит версию текущего лендинга, разрезанную на несколько HTML-частей для вставки в Tilda через блоки с произвольным HTML-кодом.

## Как вставлять в Tilda

1. Создайте пустую страницу Tilda.
2. Добавьте подряд несколько HTML-блоков, например T123 / «HTML-код».
3. Скопируйте содержимое файлов из \`parts/\` строго по порядку: от \`01-...html\` до \`11-...html\`.
4. Ничего не объединяйте внутри Tilda: части специально разделены, чтобы большой код помещался в ограничения редактора.
5. Не меняйте порядок: сначала CSS, затем HTML-секции, затем JS.

## Цвета и шрифты

- Последняя CSS-часть содержит Tilda guard: она принудительно возвращает текстам MALEA только цвета из текущего лендинга.
- Шрифты Leotaro и Circe подключены через \`${PUBLIC_BASE}/assets/fonts/...\`. Если Tilda будет публиковаться без доступа к этому домену, загрузите эти 3 файла шрифтов в Tilda Files и замените URL в первой CSS-части.
- Google Font Cormorant Garamond оставлен как в текущем лендинге.

## Проверочный файл

\`preview-assembled.html\` — собранная локальная версия из этих же частей для быстрой проверки в браузере. В Tilda вставлять нужно именно файлы из \`parts/\`, а не preview-файл.

## Размеры частей

| Файл | Размер, bytes |
|---|---:|
${rows}

Сгенерировано из текущих файлов \`index.html\`, \`css/*.css\`, \`js/app.js\` и \`js/modules/*.js\`.
`;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(PARTS, { recursive: true });

  const cssGroups = buildCss();
  const cssParts = [
    stylePart('malea-tilda-css-01-tokens-base', '01 / tokens + base', cssGroups[0] + '\n\n' + cssGroups[1]),
    stylePart('malea-tilda-css-02-nav-modal-components', '02 / nav + modal + components', cssGroups[2]),
    stylePart('malea-tilda-css-03-screens', '03 / screens', cssGroups[3]),
    stylePart('malea-tilda-css-04-motion-tablets', '04 / motion + tablets', cssGroups[4]),
    stylePart('malea-tilda-css-05-ipad-mobile', '05 / iPad + mobile', cssGroups[5]),
    stylePart('malea-tilda-css-06-final-guard', '06 / final layers + Tilda color/font guard', cssGroups[6] + '\n\n' + buildTildaGuardCss()),
  ];
  const htmlParts = buildHtmlParts();
  const jsPart = scriptPart('malea-tilda-js', '11 / bundled JS', buildJs());

  const allParts = [...cssParts, ...htmlParts, jsPart];
  const names = [
    '01-css-tokens-base.html',
    '02-css-nav-modal-components.html',
    '03-css-screens.html',
    '04-css-motion-tablets.html',
    '05-css-ipad-mobile.html',
    '06-css-final-tilda-color-font-guard.html',
    '07-html-nav-opening-philosophy.html',
    '08-html-live-player-performance-art.html',
    '09-html-musicians-reviews-egypt-formats.html',
    '10-html-integration-final-modals.html',
    '11-js-bundle.html',
  ];

  const manifest = [];
  allParts.forEach((part, index) => {
    const file = `parts/${names[index]}`;
    const writtenBytes = write(file, part);
    manifest.push({ file, bytes: writtenBytes });
  });

  const preview = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>MALEA · Tilda export preview</title>
</head>
<body>
<div id="allrecords" class="t-records">
${allParts.join('\n\n')}
</div>
</body>
</html>`;
  write('preview-assembled.html', preview);
  write('README.md', buildReadme(manifest));
  write('manifest.json', JSON.stringify({ generatedAt: new Date().toISOString(), publicBase: PUBLIC_BASE, parts: manifest }, null, 2));

  console.log(`Generated ${manifest.length} Tilda parts in ${path.relative(ROOT, OUT)}`);
  manifest.forEach((item) => console.log(`${item.file}\t${item.bytes}`));
}

main();

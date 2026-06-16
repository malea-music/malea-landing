/* =========================================================
   MALEA · Tilda export builder
   ---------------------------------------------------------
   Produces ready-to-paste Tilda "HTML code" (T123) blocks from the
   multi-file landing, preserving everything (colours, fonts, animation).

   Output (in ./out):
     01-styles-*.html   → <style> chunks (paste each into its own HTML block)
     02-markup-*.html    → page markup (1+ blocks)
     03-script.html      → <script> bundle (1 block)
     _SIZES.txt          → size report

   Run:  node tilda/build-tilda.js
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const MAX = 45000;                 // safe ceiling per Tilda HTML block (limit ~50k)
const FONT_TOKEN = '__FONT_BASE__'; // user replaces this once with their font host

// CSS load order — EXACTLY as linked in index.html (09 after 13 is intentional).
const CSS_ORDER = [
  '00-tokens', '01-base', '02-nav', '03-modal', '04-components', '05-screens',
  '06-motion', '07-tablet-landscape', '08-tablet-portrait', '10-ipadpro-portrait',
  '11-tablet-portrait-refine', '12-unified-bg', '13-opening-desktop',
  '09-mobile-refinements', '14-desktop-rhythm', '15-cinematic-scroll-desktop',
];

// JS init order — EXACTLY as in js/app.js.
const JS_ORDER = [
  'nav', 'modal', 'audio-player', 'video-modal',
  'reviews-carousel', 'reveal', 'opening', 'cinematic-scroll',
];

const read = (p) => fs.readFileSync(p, 'utf8');

/* ---------- CSS ---------- */
function minifyCss(s) {
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');          // strip block comments
  return s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join('\n');
}

// Split CSS into chunks, breaking ONLY at top-level (brace depth 0) so we never
// cut inside a rule or @media block.
function chunkCss(text, max) {
  const lines = text.split('\n');
  const chunks = [];
  let buf = '';
  let depth = 0;
  for (const line of lines) {
    if (buf && depth === 0 && buf.length + line.length + 1 > max) {
      chunks.push(buf);
      buf = '';
    }
    buf += (buf ? '\n' : '') + line;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

let css = CSS_ORDER
  .map((n) => minifyCss(read(path.join(ROOT, 'css', n + '.css'))))
  .join('\n');
// Re-point the @font-face URLs (local → user-hosted).
css = css.replace(/\.\.\/assets\/fonts\//g, FONT_TOKEN + '/');

const cssChunks = chunkCss(css, MAX);

/* ---------- JS (bundle, no ES modules) ---------- */
// Each module is wrapped in its OWN IIFE so top-level names can never collide,
// then its init fn is registered. Init order matches app.js.
const initRunner = [
  'var INITS = [];',
];
const moduleBlocks = JS_ORDER.map((n) => {
  let src = read(path.join(ROOT, 'js', 'modules', n + '.js'));
  const m = src.match(/export\s+function\s+(\w+)/);
  if (!m) throw new Error('No exported init in module: ' + n);
  const initName = m[1];
  src = src.replace(/^\s*export\s+/gm, '');         // drop `export `
  return (
    '/* module: ' + n + ' */\n(function(){\n' +
    src.trim() + '\n' +
    'INITS.push({name:"' + initName + '",fn:' + initName + '});\n' +
    '})();'
  );
});

const jsBundle =
  '<script>\n(function(){\n"use strict";\n' +
  initRunner.join('\n') + '\n\n' +
  moduleBlocks.join('\n\n') + '\n\n' +
  'function run(){INITS.forEach(function(it){try{if(typeof it.fn==="function"){it.fn();}}catch(e){console.error("[MALEA] "+it.name+" failed",e);}});}\n' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run,{once:true});}else{run();}\n' +
  '})();\n</script>\n';

/* ---------- Markup ---------- */
let html = read(path.join(ROOT, 'index.html'));
let body = html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'));
// Drop the module bootstrap <script> (replaced by our bundle) and any <script>.
body = body.replace(/<script[\s\S]*?<\/script>/g, '');
// Strip HTML comments, trim lines, drop empty lines (keeps tag structure intact).
body = body.replace(/<!--[\s\S]*?-->/g, '');
body = body.split(/\r?\n/).map((l) => l.replace(/\s+$/,'')).filter((l) => l.trim() !== '').join('\n');

// Google Fonts (Cormorant) — used as the quote font + display fallback.
const fontLinks =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300;1,500&display=swap" rel="stylesheet">\n';

const markup = fontLinks + body;

// Split markup ONLY at depth-0 boundaries (between top-level body children) so
// every block has balanced tags. Falls back to a single block when it fits.
function chunkHtml(text, max) {
  if (text.length <= max) return [text];
  const lines = text.split('\n');
  const chunks = [];
  let buf = '';
  let depth = 0;
  for (const line of lines) {
    if (buf && depth === 0 && buf.length + line.length + 1 > max) {
      chunks.push(buf);
      buf = '';
    }
    buf += (buf ? '\n' : '') + line;
    // crude tag-depth tracker (ignores self-closing/void — fine for this markup)
    const opens = (line.match(/<([a-zA-Z][\w-]*)(\s[^>]*?)?>/g) || [])
      .filter((t) => !/\/>$/.test(t) && !/^<(meta|link|img|br|hr|input|source|use|path)\b/i.test(t)).length;
    const closes = (line.match(/<\/[a-zA-Z][\w-]*>/g) || []).length;
    depth += opens - closes;
  }
  if (buf) chunks.push(buf);
  return chunks;
}
const htmlChunks = chunkHtml(markup, MAX);

/* ---------- Write ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const report = [];
function writeBlock(name, content) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf8');
  report.push(name.padEnd(28) + content.length + ' chars' + (content.length > 50000 ? '  ⚠ OVER 50k' : ''));
}

cssChunks.forEach((c, i) => {
  const n = String(i + 1).padStart(2, '0');
  writeBlock('01-styles-' + n + '.html', '<style>\n' + c + '\n</style>\n');
});
htmlChunks.forEach((c, i) => {
  const n = String(i + 1).padStart(2, '0');
  writeBlock('02-markup-' + n + '.html', c + '\n');
});
writeBlock('03-script.html', jsBundle);

fs.writeFileSync(
  path.join(OUT, '_SIZES.txt'),
  'MALEA → Tilda blocks (limit per block ~50000, target <=' + MAX + ')\n' +
  'Paste order on the Tilda page (top → bottom):\n' +
  '  all 01-styles-*  →  all 02-markup-*  →  03-script\n\n' +
  report.join('\n') + '\n\n' +
  'Total blocks: ' + (cssChunks.length + htmlChunks.length + 1) + '\n',
  'utf8'
);

console.log('Built ' + (cssChunks.length + htmlChunks.length + 1) + ' blocks → tilda/out');
console.log(report.join('\n'));

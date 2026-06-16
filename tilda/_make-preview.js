/* Assemble tilda/out/* blocks into ONE test page that simulates a Tilda page:
   each block is wrapped in a <div class="t-rec"> like Tilda does, fonts point
   to the local files. Output: tilda/_preview-test.html  (served at /tilda/...) */
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.html')).sort();

const blocks = files.map((f) => {
  let c = fs.readFileSync(path.join(OUT, f), 'utf8');
  c = c.replace(/__FONT_BASE__/g, '../assets/fonts'); // local fonts for the test
  return '<div class="t-rec" data-block="' + f + '">\n' + c + '\n</div>';
}).join('\n');

const page =
  '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  '<title>MALEA · Tilda blocks preview test</title>\n' +
  // Simulate Tilda's body/wrapper baseline (Tilda has its own minor resets).
  '<style>body{margin:0}.t-rec{position:relative}</style>\n' +
  '</head>\n<body>\n' + blocks + '\n</body>\n</html>\n';

fs.writeFileSync(path.join(__dirname, '_preview-test.html'), page, 'utf8');
console.log('Wrote tilda/_preview-test.html from ' + files.length + ' blocks');

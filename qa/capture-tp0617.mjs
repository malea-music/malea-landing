/**
 * QA capture for Stage TP-06.17
 * Проверка: tablet portrait (768×1024, 820×1180, 1024×1366)
 * Скриншоты screen 06 / #live-text
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'screenshots', 'stage-tp0617');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { width: 768, height: 1024, label: '768x1024' },
  { width: 820, height: 1180, label: '820x1180' },
  { width: 1024, height: 1366, label: '1024x1366' },
];

const TARGET_SELECTOR = '#live-text';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector(TARGET_SELECTOR, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Screenshot of #live-text section only
    const el = await page.$(TARGET_SELECTOR);
    if (el) {
      await el.screenshot({
        path: join(OUT, `${vp.label}-06-live-text.png`),
        timeout: 15000,
      });
    }

    console.log(`✅ ${vp.label}`);
  }

  await browser.close();
  console.log('\n✨ Done');
})();

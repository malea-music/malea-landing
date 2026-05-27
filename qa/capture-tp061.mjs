import { chromium } from 'playwright';

const viewports = {
  '768x1024': { width: 768, height: 1024 },
  '820x1180': { width: 820, height: 1180 },
  '1024x1366': { width: 1024, height: 1366 },
};

const outDir = 'qa/screenshots/stage-tp061';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  });
  const page = await context.newPage();

  const path = new URL('./index.html', `file://${process.cwd()}/`).href;

  for (const [name, vp] of Object.entries(viewports)) {
    await page.setViewportSize(vp);
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Screen 06 / #live-text
    const el = await page.$('#live-text');
    if (el) {
      await el.screenshot({ path: `${outDir}/${name}-06-live-text.png` });
      console.log(`✓ ${name} — #live-text`);
    }

    // Screen 14 / #reviews as reference
    const reviews = await page.$('#reviews');
    if (reviews) {
      await reviews.screenshot({ path: `${outDir}/${name}-14-reviews.png` });
      console.log(`✓ ${name} — #reviews (reference)`);
    }

    // Screen 19 / #formats-list as reference
    const formats = await page.$('#formats-list');
    if (formats) {
      await formats.screenshot({ path: `${outDir}/${name}-19-formats-list.png` });
      console.log(`✓ ${name} — #formats-list (reference)`);
    }
  }

  await browser.close();
  console.log('\nAll screenshots saved to', outDir);
}

run().catch(err => { console.error(err); process.exit(1); });

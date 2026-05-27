import { chromium } from 'playwright';

const URL = 'http://localhost:8000';
const VIEWPORTS = [
  { name: '768×1024', w: 768, h: 1024 },
  { name: '820×1180', w: 820, h: 1180 },
  { name: '1024×1366', w: 1024, h: 1366 },
];

const SCREENS = [
  { id: '#live-text', label: '06-live-text' },
  { id: '#player', label: '08-player' },
  { id: '#reviews', label: '14-reviews' },
  { id: '#egypt-case', label: '17-egypt-case' },
  { id: '#portfolio', label: '24-portfolio' },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    console.log(`\n=== ${vp.name} ===`);

    for (const screen of SCREENS) {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
      // Small pause for fonts and layout
      await page.waitForTimeout(500);

      // Scroll to screen
      try {
        await page.locator(screen.id).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      } catch (e) {
        console.log(`  ❌ ${screen.label}: not found`);
        continue;
      }

      // Take screenshot
      const path = `qa/screenshots/stage-tp1/${vp.name.replace('×', 'x')}-${screen.label}.png`;
      await page.screenshot({ path, fullPage: false });
      console.log(`  📸 ${screen.label} -> ${path}`);
    }
  }

  await browser.close();
  console.log('\n✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });

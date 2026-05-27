import { chromium } from 'playwright';

const viewports = {
  'mobile-360': { width: 360, height: 740 },
  'mobile-375': { width: 375, height: 812 },
  'mobile-390': { width: 390, height: 844 },
  'mobile-430': { width: 430, height: 932 },
  'tablet-768': { width: 768, height: 1024 },
  'tablet-820': { width: 820, height: 1180 },
  'tablet-1024': { width: 1024, height: 1366 },
  'desktop-1366': { width: 1366, height: 768 },
  'desktop-1440': { width: 1440, height: 900 },
};

const screens = ['intro', 'hero', 'identity', 'philosophy', 'live-image', 'live-text'];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Get absolute path to index.html
  const path = new URL('./index.html', `file://${process.cwd()}/`).href;
  
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Full page screenshot
    await page.screenshot({
      path: `screenshots/${viewportName}-full.png`,
      fullPage: true
    });
    
    // Screenshots of individual sections
    for (const screen of screens) {
      const selector = `#${screen}`;
      const el = await page.$(selector);
      if (el) {
        await el.screenshot({
          path: `screenshots/${viewportName}-${screen}.png`
        });
      }
    }
    
    console.log(`✓ ${viewportName} done`);
  }
  
  await browser.close();
  console.log('\nAll screenshots captured in ./screenshots/');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.error(`[PAGE_ERROR] ${error.message}`));
  
  console.log("Navigating to site...");
  await page.goto('https://aura-labs-one.vercel.app/');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();

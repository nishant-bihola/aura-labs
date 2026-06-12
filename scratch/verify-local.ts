import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const OUT = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // studio section
  await page.evaluate(() => document.getElementById("studio")?.scrollIntoView());
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "verify-studio.png") });

  // hover a work item to check thumb preview
  await page.evaluate(() => document.getElementById("work")?.scrollIntoView());
  await page.waitForTimeout(2000);
  const item = page.locator("#work a").first();
  await item.hover();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "verify-work-hover.png") });

  // footer
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView({ block: "end" }));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, "verify-footer.png") });

  // direct /contact route (SPA serving via preview always works; rewrite matters on vercel)
  await page.goto("http://localhost:4173/contact", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "verify-contact.png") });

  await browser.close();
  console.log("verification screenshots saved");
})();

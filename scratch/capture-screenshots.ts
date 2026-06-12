/**
 * Captures crisp hero + section screenshots of live client sites
 * for the portfolio. Clicks through age verification gates when present.
 *
 * Run: npx tsx scratch/capture-screenshots.ts
 */
import { chromium, Page } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/projects");

interface Site {
  slug: string;
  url: string;
  ageGate?: boolean;
  scrollSecond?: number; // px to scroll for second shot
}

const SITES: Site[] = [
  {
    slug: "bud-n-buddies",
    url: "https://profound-nourishment-production-0662.up.railway.app/",
    ageGate: true,
    scrollSecond: 900,
  },
  {
    slug: "apex-towing",
    url: "https://apex-towing-final.vercel.app/",
    scrollSecond: 900,
  },
  {
    slug: "bagel-bar",
    url: "https://bagel-bar-v2.vercel.app/",
    scrollSecond: 900,
  },
];

async function dismissAgeGate(page: Page) {
  const patterns = [
    /yes/i, /i.?m (over )?(18|19|21)/i, /i am (over )?(18|19|21)/i,
    /enter/i, /confirm/i, /(18|19|21)\s*\+/i, /of age/i, /continue/i,
  ];
  for (const re of patterns) {
    const btn = page.getByRole("button", { name: re }).first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`  clicking age-gate button matching ${re}`);
      await btn.click();
      await page.waitForTimeout(2500);
      return true;
    }
  }
  // fallback: any clickable element with matching text
  for (const re of patterns) {
    const el = page.locator("a, button, [role=button], div[onclick]").filter({ hasText: re }).first();
    if (await el.isVisible().catch(() => false)) {
      console.log(`  clicking fallback element matching ${re}`);
      await el.click();
      await page.waitForTimeout(2500);
      return true;
    }
  }
  console.log("  no age gate found / already dismissed");
  return false;
}

async function settle(page: Page, ms = 3500) {
  // let fonts, images, and entrance animations finish
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

(async () => {
  const browser = await chromium.launch();

  // Lightweight 1x thumbnails for hover previews / cards
  const thumbCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  for (const site of SITES) {
    console.log(`\n=== thumb: ${site.slug}`);
    const page = await thumbCtx.newPage();
    try {
      await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await settle(page);
      if (site.ageGate) {
        await dismissAgeGate(page);
        await settle(page, 2500);
      }
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, `${site.slug}-thumb.jpg`), type: "jpeg", quality: 70 });
      console.log(`  saved ${site.slug}-thumb.jpg`);
    } catch (err) {
      console.error(`  FAILED: ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }
  await thumbCtx.close();

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const site of SITES) {
    console.log(`\n=== ${site.slug} → ${site.url}`);
    const page = await ctx.newPage();
    try {
      await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await settle(page);
      if (site.ageGate) {
        await dismissAgeGate(page);
        await settle(page, 2500);
      }
      // nudge lazy content, then return to top for the hero shot
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, `${site.slug}-hero.jpg`), type: "jpeg", quality: 85 });
      console.log(`  saved ${site.slug}-hero.jpg`);

      if (site.scrollSecond) {
        await page.evaluate((y) => window.scrollTo({ top: y }), site.scrollSecond);
        await page.waitForTimeout(2500);
        await page.screenshot({ path: path.join(OUT, `${site.slug}-detail.jpg`), type: "jpeg", quality: 85 });
        console.log(`  saved ${site.slug}-detail.jpg`);
      }
    } catch (err) {
      console.error(`  FAILED: ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("\nDone.");
})();

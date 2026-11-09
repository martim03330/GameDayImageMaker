// Screenshot of one or more looks from the Catalogue: node scripts/check/shot-look.mjs <player> <type> <outDir> look1 look2...
import { chromium } from "playwright";
const [, , player, type, outDir, ...looks] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
await page.goto(`http://localhost:3100/catalogo?player=${player}&type=${type}`, { waitUntil: "networkidle", timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
for (const l of looks) {
  const el = page.locator(`[data-look="${l}"]`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await el.screenshot({ path: `${outDir}/${player}-${type}-${l}.jpg`, type: "jpeg", quality: 80 });
}
await browser.close();

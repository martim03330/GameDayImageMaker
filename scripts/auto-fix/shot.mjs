// Screenshot of a page of the running app, for checking a look before/after a fix.
// Usage: node scripts/auto-fix/shot.mjs <path, e.g. /render/feedback/<id> or /render/<editId>> <out.jpg> [width] [height]
import { chromium } from "playwright";

const [, , route, out, w = "1080", h = "1350"] = process.argv;
if (!route || !out) {
  console.error("usage: node scripts/auto-fix/shot.mjs <path> <out.jpg> [width] [height]");
  process.exit(1);
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
  const res = await page.goto(`http://localhost:3100${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: out.endsWith(".png") ? "png" : "jpeg", ...(out.endsWith(".png") ? {} : { quality: 70 }), fullPage: route.startsWith("/catalogo") });
  console.log(`${res?.status()} ${out}`);
} finally {
  await browser.close();
}

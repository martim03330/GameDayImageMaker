// Screenshot of an edit as a 1080×1920 story: node scripts/check/shot-story.mjs <editId> <out.jpg> [native]
// "native" forces the look's own 9:16 layout (?native=1) even before it is flagged `story`.
import { chromium } from "playwright";
const [, , id, out, native] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`http://localhost:3100/render/${id}?format=story${native ? "&native=1" : ""}`, { waitUntil: "networkidle", timeout: 120000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
await p.locator("#canvas").screenshot({ path: out, type: "jpeg", quality: 80 });
await b.close();

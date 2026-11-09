import { chromium } from "playwright";
// Story spacing check: the gap (px) between the NEYOD logo and the nearest text or crest above/below it.
// node scripts/check/logo-gap.mjs <editId> [editId…]   (renders /render/<id>?format=story; aim for ≥ 56)
const ids = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const rows = [];
for (const id of ids) {
  await p.goto(`http://localhost:3100/render/${id}?format=story`, { waitUntil: "networkidle", timeout: 120000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const logo = document.querySelector("#post [data-agency-logo]");
    if (!logo) return null;
    const L = logo.getBoundingClientRect();
    let best = null;
    const walk = document.createTreeWalker(document.querySelector("#post"), NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      if (!n.textContent.trim() || logo.contains(n.parentElement)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const R of rg.getClientRects()) {
        if (R.width < 2 || R.height < 2) continue;
        if (R.right < L.left - 10 || R.left > L.right + 10) continue; // horizontal overlap only
        const gapAbove = L.top - R.bottom, gapBelow = R.top - L.bottom;
        const g = gapAbove >= -40 && R.bottom <= L.bottom ? gapAbove : gapBelow >= -40 && R.top >= L.top ? gapBelow : null;
        if (g != null && (best == null || g < best.g)) best = { g: Math.round(g), t: n.textContent.trim().slice(0, 30) };
      }
    }
    // crests / images near the logo too
    for (const im of document.querySelectorAll("#post img")) {
      if (logo.contains(im)) continue;
      const R = im.getBoundingClientRect();
      if (R.width > 300 || R.height > 300 || R.width < 10) continue;
      if (R.right < L.left - 10 || R.left > L.right + 10) continue;
      const g = R.bottom <= L.top + 40 ? L.top - R.bottom : R.top >= L.bottom - 40 ? R.top - L.bottom : null;
      if (g != null && (best == null || g < best.g)) best = { g: Math.round(g), t: "[img]" };
    }
    return { top: Math.round(L.top), h: Math.round(L.height), best };
  });
  rows.push(`${id}\t${r ? r.top + "\t" + r.h + "\t" + (r.best ? r.best.g + "\t" + r.best.t : "-") : "no logo"}`);
}
console.log(["edit\tlogoTop\tlogoH\tgap\tnearest", ...rows].join("\n"));
await b.close();

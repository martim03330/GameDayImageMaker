// Renders every look in the Catalogue for each player and post type and reports layout errors:
// text cut by the canvas edge, small text colliding with other small text, text covering a crest/logo.
// Usage: node scripts/check/looks.mjs [player] [type]   (needs the app running on :3100)
import fs from "node:fs";
import { chromium } from "playwright";

const TYPES = ["matchday", "goal", "result", "stats", "potm", "transfer", "renewal", "totw"];
// Title variants per post type (see POST_TYPES alts in src/lib/types.ts): each one is checked too.
const ALTS = { matchday: 4, result: 3, stats: 3, transfer: 3, renewal: 3, totw: 2, goal: 1, potm: 1 };
const [, , onlyPlayer, onlyType] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 14000 } });
await page.goto("http://localhost:3100/catalogo", { waitUntil: "networkidle" });
const players = onlyPlayer ? [onlyPlayer] : await page.$$eval('a[href*="/catalogo?player="]', (as) => [...new Set(as.map((a) => new URL(a.href).searchParams.get("player")))]);

let total = 0;
/** look → framings that produced an error with any player, for src/templates/unsafe-framings.json */
const bad = {};
for (const player of players) {
  // Every title variant with the Catalogue's framings, then the default title in each framing.
  const runs = (type) => [
    ...Array.from({ length: ALTS[type] }, (_, alt) => ({ alt, framing: "" })),
    ...["full", "knees", "waist", "chest"].map((framing) => ({ alt: 0, framing })),
  ];
  for (const type of onlyType ? [onlyType] : TYPES) for (const { alt, framing } of runs(type)) {
    // The app may be busy generating scenery: give the page time, and try once more before giving up.
    const url = `http://localhost:3100/catalogo?player=${player}&type=${type}&alt=${alt}&framing=${framing}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
    } catch {
      await page.goto(url, { waitUntil: "load", timeout: 180000 });
      await page.waitForTimeout(4000);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const issues = await page.evaluate(async () => {
      const out = [];
      // Alpha of a cutout at a canvas point: is the player really on top of this spot (not a transparent pixel)?
      const alphaCache = new Map();
      const alphaAt = async (img, x, y) => {
        if (!img.naturalWidth) return 0;
        let c = alphaCache.get(img.src);
        if (!c) {
          const w = Math.min(400, img.naturalWidth);
          const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
          const cv = document.createElement("canvas");
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, w, h);
          c = { ctx, w, h };
          alphaCache.set(img.src, c);
        }
        const b = img.getBoundingClientRect();
        const fit = getComputedStyle(img).objectFit;
        let cx = b.left, cy = b.top, cw = b.width, ch = b.height;
        if (fit === "contain") {
          const k = Math.min(b.width / c.w, b.height / c.h);
          cw = c.w * k;
          ch = c.h * k;
          const pos = getComputedStyle(img).objectPosition.split(" ");
          const px = pos[0].includes("%") ? parseFloat(pos[0]) / 100 : pos[0] === "right" ? 1 : pos[0] === "left" ? 0 : 0.5;
          const py = (pos[1] ?? "50%").includes("%") ? parseFloat(pos[1] ?? "50") / 100 : pos[1] === "bottom" ? 1 : pos[1] === "top" ? 0 : 0.5;
          cx += (b.width - cw) * px;
          cy += (b.height - ch) * py;
        }
        const u = Math.floor(((x - cx) / cw) * c.w);
        const v = Math.floor(((y - cy) / ch) * c.h);
        if (u < 0 || v < 0 || u >= c.w || v >= c.h) return 0;
        try {
          return c.ctx.getImageData(u, v, 1, 1).data[3];
        } catch {
          return 0;
        }
      };
      for (const card of document.querySelectorAll("[data-look]")) {
        if (card.dataset.fits !== "1") continue;
        const canvas = card.querySelector("[style*='scale(']")?.firstElementChild;
        if (!canvas) continue;
        const c = canvas.getBoundingClientRect();
        const k = c.width / 1080;
        const visible = (el) => {
          for (let e = el; e && e !== canvas; e = e.parentElement) {
            const s = getComputedStyle(e);
            if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
          }
          return true;
        };
        const texts = [];
        const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const t = n.textContent.trim();
          const el = n.parentElement;
          if (!t || !visible(el) || el.closest("[data-bleed]")) continue;
          // SVG text squeezed with textLength: a Range reports its natural (unsqueezed) width, the element its real box.
          const svgText = el instanceof SVGTextContentElement;
          const r = document.createRange();
          r.selectNodeContents(n);
          const full = svgText ? el.getBoundingClientRect() : r.getBoundingClientRect();
          if (full.width < 2 || full.height < 2) continue;
          // The line box includes line spacing: keep only the band where the letters are.
          const b = { left: full.left, right: full.right, width: full.width, top: full.top + full.height * 0.22, bottom: full.bottom - full.height * 0.2, height: full.height * 0.58 };
          texts.push({ t: t.slice(0, 24), el, b, full, size: parseFloat(getComputedStyle(el).fontSize) });
        }
        const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const area = (a) => a.width * a.height;
        const errs = [];
        for (const x of texts) {
          // Clipped by the canvas: more than 6% of the glyph box outside.
          const inside = inter(x.b, c) / area(x.b);
          const limit = x.size <= 90 ? 0.97 : 0.85;
          if (inside < limit) errs.push(`cortado na borda: "${x.t}" (${Math.round((1 - inside) * 100)}% fora)`);
        }
        const small = texts.filter((x) => x.size <= 90);
        for (let i = 0; i < small.length; i++)
          for (let j = i + 1; j < small.length; j++) {
            const a = small[i], b = small[j];
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const o = inter(a.b, b.b) / Math.min(area(a.b), area(b.b));
            if (o > 0.3) errs.push(`texto sobreposto: "${a.t}" × "${b.t}"`);
          }
        for (const img of canvas.querySelectorAll("img")) {
          const b = img.getBoundingClientRect();
          if (!visible(img) || b.width / k > 220 || b.height / k > 220 || b.width < 4) continue;
          for (const x of small) {
            const o = inter(x.b, b) / Math.min(area(x.b), area(b));
            if (o > 0.3) errs.push(`texto em cima de emblema/logo: "${x.t}"`);
          }
        }
        // Small text hidden behind the player: sample points across the letters, look at what is on top.
        const k2 = canvas.getBoundingClientRect().width / 1080;
        for (const x of texts.filter((t) => t.size <= 200)) {
          if (x.b.width / k2 < 30) continue;
          // Rotated (or wrapped) text: its upright box is mostly empty, sampling it would hit the player.
          if (x.full.height / k2 > x.size * 2) continue;
          let hidden = 0, n = 0;
          for (const fx of [0.15, 0.35, 0.5, 0.65, 0.85]) {
            const px = x.b.left + x.b.width * fx;
            const py = x.b.top + x.b.height * 0.5;
            if (px < c.left || px > c.right || py < c.top || py > c.bottom) continue;
            n++;
            const stack = document.elementsFromPoint(px, py);
            const own = stack.findIndex((e) => e === x.el || x.el.contains(e));
            const above = (own < 0 ? stack : stack.slice(0, own)).filter((e) => e.tagName === "IMG" && !e.hasAttribute("data-head") && canvas.contains(e) && e.getBoundingClientRect().height / k2 > 400);
            for (const img of above) if ((await alphaAt(img, px, py)) > 200) { hidden++; break; }
          }
          if (n && hidden / n >= 0.4) errs.push(`texto tapado pelo jogador: "${x.t}"`);
        }
        if (errs.length) out.push({ look: card.dataset.look, errs: [...new Set(errs)] });
      }
      return out;
    });
    for (const i of issues) {
      total += i.errs.length;
      if (framing) (bad[i.look] ??= new Set()).add(framing);
      console.log(`${player} · ${type}#${alt}${framing ? `/${framing}` : ""} · ${i.look}\n  - ${i.errs.join("\n  - ")}`);
    }
  }
}
console.log(`\n${total} problemas`);
// Full runs only: the variant generator skips these look + framing pairs.
if (!onlyPlayer && !onlyType) {
  const json = Object.fromEntries(Object.entries(bad).sort().map(([k, v]) => [k, [...v].sort()]));
  fs.writeFileSync(new URL("../../src/templates/unsafe-framings.json", import.meta.url), JSON.stringify(json, null, 2) + "\n");
  console.log("Gravado src/templates/unsafe-framings.json");
}
await browser.close();

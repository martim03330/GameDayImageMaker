import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { absPath } from "@/lib/storage";
import { fullUpOf } from "@/lib/cutout";
import { natAlignOf, saveNatAlign } from "@/lib/natalign";
import { natGeom, parseNatAlign } from "@/templates/natgeom";
import { PRO_GRADE_VERSION, proColour, proFinish, proGradeGround, proPrepare } from "@/lib/prograde";

/**
 * The player's ORIGINAL photo (real grass, stands, light) framed for a "natural" look, plus the matching
 * sharp figure layer — both on the same W×H canvas, so the figure sits exactly over him in the photo.
 *
 * GET /api/natframe?o=<original rel>&c=<cutout rel>&f=x,y,w,h (face in the cutout, 0..1)&w=&h=&p=<face px in the original>&fx=&fy=&fs=&m=bg|fig&a=x,y,k,w,h,cw,ch
 *   fx, fy  where the centre of his face should land on the canvas (px); fs  the face height wanted (px)
 *   m=bg   the framed photo (JPEG) with the enhanced cutout laid exactly over him (crisper face, same pose)
 *   m=fig  only the cutout (PNG, transparent), same geometry — for layering type between photo and player
 *   m=band the colour of the pitch along the photo's foot, without him (8×1 PNG)
 *
 *   a      where the cutout sits in the original (photos.meta.nat_align); without it, matched here and saved
 *   g=pro  the "Tom profissional" grade (lib/prograde.ts) on bg, fig and band alike — he matches his ground
 *
 * Framing: face centre at (fx, fy), fs px tall, except that the photo always covers the canvas (smallest zoom
 * that does, then a slide) — natGeom (templates/natgeom.ts), the same formula natPlace uses to tell the look
 * where his face really lands.
 * Used by natword / natcorner / natgrass. Results are cached in data/files/natframe/.
 */
const CACHE = "natframe";

async function cached(key: string, ext: string, make: () => Promise<Buffer>): Promise<Buffer> {
  const rel = path.posix.join(CACHE, `${key}.${ext}`);
  const abs = absPath(rel);
  try {
    return await fs.readFile(abs);
  } catch {
    const buf = await make();
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buf);
    return buf;
  }
}

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 20);

/** The photo's AI-upscaled copy (lib/cutout.ts), with its size and u = its width / the original's (w). */
async function fullUp(orig: string, w: number): Promise<{ rel: string; u: number; w: number; h: number; mtime: number } | null> {
  const rel = fullUpOf(orig);
  try {
    const st = await fs.stat(absPath(rel));
    const m = await sharp(absPath(rel)).metadata();
    if (!m.width || !m.height) return null;
    return { rel, u: m.width / w, w: m.width, h: m.height, mtime: Math.round(st.mtimeMs) };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const orig = (q.get("o") ?? "").replace(/^\/api\/files\//, "");
  const cut = (q.get("c") ?? "").replace(/^\/api\/files\//, "");
  const face = (q.get("f") ?? "").split(",").map(Number);
  const W = Math.round(Number(q.get("w")) || 1080);
  const H = Math.round(Number(q.get("h")) || 1350);
  const fx = Number(q.get("fx")) || W / 2;
  const fy = Number(q.get("fy")) || H * 0.3;
  const fs = Number(q.get("fs")) || 150;
  const mode = q.get("m") === "fig" ? "fig" : q.get("m") === "band" ? "band" : "bg";
  if (!orig || !cut || face.length !== 4 || face.some((v) => !isFinite(v)) || W > 2400 || H > 2400) return new Response("bad request", { status: 400 });

  try {
    // Where the cutout sits in the original: as natPlace sent it (a=, from photos.meta.nat_align), else
    // matched now and kept on the photo so the next render's layout is exact.
    let a = parseNatAlign(q.get("a"));
    if (!a) {
      a = await natAlignOf(orig, cut, face, Number(q.get("p")) || 0);
      saveNatAlign(orig, cut, a);
    }
    const Wc = a.cw;
    const Hc = a.ch;
    // The shared formula (templates/natgeom.ts): face at (fx, fy), fs px tall, but the photo always covers
    // the canvas — the smallest zoom that does, then a slide. natPlace computed the same numbers.
    const nudge = { x: Math.round(Number(q.get("nx")) || 0), y: Math.round(Number(q.get("ny")) || 0) };
    const { S, left, top } = natGeom(a, face, W, H, fx, fy, fs, nudge);
    const sw = a.w * S;
    const sh = a.h * S;

    // &clean=1 (fig only): edge colours decontaminated (see defringe) — for looks that draw him brighter
    // than a darkened ground, where the cutout's light fringe showed as a glowing outline.
    const clean = q.get("clean") === "1";
    // &soft=1 (fig only): his silhouette as a soft white matte (grown a little, feathered) — a mask for
    // darkening the photo AROUND him, so he stands out without a second, brighter copy of him (no edge).
    const soft = q.get("soft") === "1";
    // &spot=D,L (bg only): subject highlight baked into the photo — surroundings at (1-D) brightness, him
    // lifted by L, through a soft silhouette. Done here, not with CSS masks (they striped the export).
    const spotQ = (q.get("spot") ?? "").split(",").map(Number);
    const spot = spotQ.length === 2 && spotQ.every((v) => isFinite(v) && v >= 0 && v <= 1) ? spotQ : null;
    // &g=pro: the pro sports-photo grade, the same on the ground, on him and on the band.
    const grade = q.get("g") === "pro";
    const gk = grade ? `|pro${PRO_GRADE_VERSION}` : "";
    const up = await fullUp(orig, a.w);
    const render = (mode: "bg" | "fig") => cached(hash(`${orig}|${cut}|${W}|${H}|${left}|${top}|${S.toFixed(5)}|${mode}|v11${up && mode === "bg" ? `|up${up.mtime}` : ""}${clean && mode === "fig" ? "|clean5" : ""}${soft && mode === "fig" ? "|soft2" : ""}${spot && mode === "bg" ? `|spot5_${spot.join("_")}` : ""}${soft && mode === "fig" ? "" : gk}`), mode === "fig" ? "png" : "jpg", async () => {
      // The cutout at the same scale, clipped to the canvas.
      const cw = Math.round((Wc / a.k) * S);
      const ch = Math.round((Hc / a.k) * S);
      const cl = Math.round(left + a.x * S);
      const ct = Math.round(top + a.y * S);
      const L = Math.max(0, cl);
      const T = Math.max(0, ct);
      const R = Math.min(W, cl + cw);
      const B = Math.min(H, ct + ch);
      const layers: { input: Buffer; left: number; top: number }[] = [];
      if (R > L && B > T) {
        const fig = await sharp(absPath(cut))
          .resize(cw, ch, { kernel: "lanczos3" })
          .extract({ left: L - cl, top: T - ct, width: R - L, height: B - T })
          .png()
          .toBuffer();
        layers.push({ input: fig, left: L, top: T });
      }
      // The framed photo with him laid over it (raw), before any grade or spot.
      const composeBg = async () => {
        // The part of the photo that falls on the canvas, cut from the original first, then scaled.
        const pL = Math.max(0, left);
        const pT = Math.max(0, top);
        const pR = Math.min(W, Math.round(left + sw));
        const pB = Math.min(H, Math.round(top + sh));
        const ox = Math.max(0, Math.floor((pL - left) / S));
        const oy = Math.max(0, Math.floor((pT - top) / S));
        const ow = Math.min(a.w - ox, Math.ceil((pR - pL) / S) + 1);
        const oh = Math.min(a.h - oy, Math.ceil((pB - pT) / S) + 1);
        // The AI-upscaled whole photo when there is one (lib/cutout.ts upscaleFull): the same region, u×
        // larger, so the grass and stands around him are as sharp as his (upscaled) cutout.
        const src = up ? await sharp(absPath(up.rel)).toBuffer() : await sharp(absPath(orig)).rotate().toBuffer();
        const u = up?.u ?? 1;
        const ux = Math.floor(ox * u);
        const uy = Math.floor(oy * u);
        const piece = await sharp(src)
          .extract({ left: ux, top: uy, width: Math.max(1, Math.min((up?.w ?? a.w) - ux, Math.round(ow * u))), height: Math.max(1, Math.min((up?.h ?? a.h) - uy, Math.round(oh * u))) })
          .resize(pR - pL, pB - pT, { fit: "fill", kernel: "lanczos3" })
          .toBuffer();
        const covers = pL === 0 && pT === 0 && pR === W && pB === H;
        let base: Buffer;
        if (covers) base = piece;
        else {
          // Moved past the photo's edge by hand: the photo's own edge rows / columns continue into the gap
          // (copied, then softened only there) — never a blurred, zoomed copy of the whole photo on the sides.
          const ext = { top: pT, left: pL, bottom: H - pB, right: W - pR };
          const filled = await sharp(piece).extend({ ...ext, extendWith: "copy" }).toBuffer();
          const soft = await sharp(filled).blur(10).toBuffer();
          // Alpha of the softened copy: opaque in the gap, clear over the real photo, feathered ~20px inward.
          const F = 20;
          const raw = Buffer.alloc(W * H);
          for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++) {
              const d = Math.min(pL > 0 ? x - pL : 1e9, pR < W ? pR - 1 - x : 1e9, pT > 0 ? y - pT : 1e9, pB < H ? pB - 1 - y : 1e9);
              raw[y * W + x] = d <= 0 ? 255 : d >= F ? 0 : Math.round(255 * (1 - d / F));
            }
          const rgb = await sharp(soft).removeAlpha().raw().toBuffer();
          const rgba = Buffer.alloc(W * H * 4);
          for (let i = 0; i < W * H; i++) {
            rgba[i * 4] = rgb[i * 3];
            rgba[i * 4 + 1] = rgb[i * 3 + 1];
            rgba[i * 4 + 2] = rgb[i * 3 + 2];
            rgba[i * 4 + 3] = raw[i];
          }
          const softMasked = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
          base = await sharp(filled).composite([{ input: softMasked }]).toBuffer();
        }
        return sharp(base).composite(layers).raw().toBuffer({ resolveWithObject: true });
      };
      if (mode === "fig") {
        const flat = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
          .composite(layers)
          .png()
          .toBuffer();
        if (soft) {
          const alpha = await sharp(flat).ensureAlpha().extractChannel(3).raw().toBuffer();
          const grown = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).dilate(3).blur(9).extractChannel(0).raw().toBuffer();
          const white = Buffer.alloc(W * H * 4, 255);
          for (let i = 0; i < W * H; i++) white[i * 4 + 3] = grown[i];
          return sharp(white, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 7 }).toBuffer();
        }
        const fig = clean ? await defringe(flat, W, H) : flat;
        if (!grade) return clean ? fig : sharp(fig).png({ compressionLevel: 7 }).toBuffer();
        // Graded exactly like the ground: same pointwise colour, and clarity measured on the graded GROUND,
        // so where he is opaque his pixels come out identical to the ground's copy of him. Alpha untouched.
        const px = await sharp(fig).ensureAlpha().raw().toBuffer();
        const ground = await composeBg();
        const { maps, ref } = await proPrepare(ground.data, W, H, ground.info.channels);
        proColour(px, W * H, 4, maps);
        proFinish(px, W, H, 4, ref);
        return sharp(px, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 7 }).toBuffer();
      }
      const full = await composeBg();
      if (grade) await proGradeGround(full.data, W, H, full.info.channels);
      if (spot && layers.length) {
        const [dark, lift] = spot;
        const matte = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
          .composite(layers)
          .extractChannel(3)
          .raw()
          .toBuffer();
        // His silhouette pulled in ~5px (his cutout's light fringe gets the dark too) and feathered. NB: in this
        // sharp version dilate() SHRINKS a white shape and erode() GROWS it (checked 22/10).
        const m = await sharp(matte, { raw: { width: W, height: H, channels: 1 } }).dilate(5).blur(3.5).extractChannel(0).raw().toBuffer();
        const px = full.data;
        const ch = full.info.channels;
        for (let i = 0; i < W * H; i++) {
          const t = m[i] / 255;
          const k = (1 - dark) + (dark + lift) * t; // around: 1-dark … on him: 1+lift
          for (let c = 0; c < 3; c++) px[i * ch + c] = Math.min(255, Math.round(px[i * ch + c] * k));
        }
      }
      return sharp(full.data, { raw: { width: W, height: H, channels: full.info.channels } }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    });
    // m=band: the ground's own colour, averaged in 8 columns, as an 8×1 PNG (stretched by the look into a
    // smooth, natural band).
    const out =
      mode === "band"
        ? await cached(hash(`${orig}|${cut}|${W}|${H}|${left}|${top}|${S.toFixed(5)}|band|v3${gk}`), "png", async () => {
            // Sampled from the ORIGINAL photo's foot (where the pitch is), not the canvas' (which may show
            // boards or stands): the run of pitch-coloured rows at its bottom, him masked out, across the part of the photo the canvas shows.
            const D = 480 / a.w;
            const ow = Math.round(a.w * D);
            const oh = Math.round(a.h * D);
            const px = await sharp(absPath(orig)).rotate().resize(ow, oh, { fit: "fill" }).removeAlpha().raw().toBuffer();
            const mw = Math.max(1, Math.round((Wc / a.k) * D));
            const mh = Math.max(1, Math.round((Hc / a.k) * D));
            const mx = Math.round(a.x * D);
            const my = Math.round(a.y * D);
            const ma = await sharp(absPath(cut)).resize(mw, mh, { fit: "fill" }).ensureAlpha().extractChannel(3).raw().toBuffer();
            const inHim = (x: number, y: number) => {
              const u = x - mx;
              const v = y - my;
              // A little margin round him (his shadow, the matte's soft edge).
              for (const [du, dv] of [[0, 0], [-3, 0], [3, 0], [0, -3]]) {
                const uu = u + du, vv = v + dv;
                if (uu >= 0 && vv >= 0 && uu < mw && vv < mh && ma[vv * mw + uu] > 8) return true;
              }
              return false;
            };
            const x0 = Math.max(0, Math.round((-left / S) * D));
            const x1 = Math.min(ow, Math.round(((W - left) / S) * D));
            // Rows of the photo's foot, him left out; then only the run of rows that still look like the
            // bottom-most ones (the pitch), so boards or a wall above a thin strip of grass don't creep in.
            const ys0 = Math.round(oh * 0.75);
            const rowAvg: { c: number[]; n: number; cols: number[][] }[] = [];
            const N = 8;
            for (let y = ys0; y < oh; y++) {
              const r = { c: [0, 0, 0], n: 0, cols: Array.from({ length: N }, () => [0, 0, 0, 0]) };
              for (let x = x0; x < x1; x++) {
                if (inHim(x, y)) continue;
                const i = (y * ow + x) * 3;
                const col = r.cols[Math.min(N - 1, Math.floor(((x - x0) / Math.max(1, x1 - x0)) * N))];
                for (let j = 0; j < 3; j++) (r.c[j] += px[i + j]), (col[j] += px[i + j]);
                col[3]++;
                r.n++;
              }
              rowAvg.push(r);
            }
            const last = rowAvg.slice(-Math.max(2, Math.round(oh * 0.025))).filter((r) => r.n);
            const refC = last.length ? [0, 1, 2].map((j) => last.reduce((t, r) => t + r.c[j] / r.n, 0) / last.length) : [47, 90, 44];
            const sums = Array.from({ length: N }, () => [0, 0, 0, 0]);
            const all = [0, 0, 0, 0];
            for (let i = rowAvg.length - 1; i >= 0; i--) {
              const r = rowAvg[i];
              if (!r.n) continue;
              const c = r.c.map((v) => v / r.n);
              if (Math.hypot(c[0] - refC[0], c[1] - refC[1], c[2] - refC[2]) > 38) break;
              for (let k = 0; k < N; k++) for (let j = 0; j < 4; j++) sums[k][j] += r.cols[k][j];
              for (let j = 0; j < 3; j++) all[j] += r.c[j];
              all[3] += r.n;
            }
            const avg = all[3] ? all.slice(0, 3).map((v) => v / all[3]) : [47, 90, 44];
            // Columns mostly covered by him borrow the overall colour; the rest lean towards it (a calm band).
            const row = sums.flatMap((c) => (c[3] > 30 ? c.slice(0, 3).map((v, j) => 0.4 * (v / c[3]) + 0.6 * avg[j]) : avg)).map((v) => Math.round(v));
            const bandPx = Buffer.from(row);
            if (grade) proColour(bandPx, N, 3, null);
            return sharp(bandPx, { raw: { width: N, height: 1, channels: 3 } }).png().toBuffer();
          })
        : await render(mode);
    return new Response(new Uint8Array(out), {
      headers: { "Content-Type": mode === "bg" ? "image/jpeg" : "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch (e) {
    console.error("natframe", e);
    return new Response("Not found", { status: 404 });
  }
}


/**
 * Edge colour decontamination of a cutout layer: the soft edge of a matte still carries the old background's
 * colours (a white shirt behind him, a bright wall), which glow when he is drawn brighter than a darkened
 * photo. Every pixel near the edge takes the colour of his own body just inside it (interior colours pushed
 * outwards with a normalised blur), the alpha is kept (no dark rim from shrinking him), only its faintest
 * outer haze is trimmed a little.
 */
async function defringe(png: Buffer, W: number, H: number): Promise<Buffer> {
  const { data } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = W * H;
  // The edge band: within ~7px of where he ends (alpha ~0).
  const outside = Buffer.alloc(n);
  for (let i = 0; i < n; i++) outside[i] = data[i * 4 + 3] < 24 ? 255 : 0;
  const near = await sharp(outside, { raw: { width: W, height: H, channels: 1 } }).dilate(7).extractChannel(0).raw().toBuffer();
  // His own colour just inside the band: weighted colour and weight blurred separately (3 + 1 channels,
  // no alpha channel for sharp to premultiply), then divided.
  const rgb = Buffer.alloc(n * 3);
  const wt = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    const w = near[i] ? 0 : data[i * 4 + 3];
    wt[i] = w;
    for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round((data[i * 4 + c] * w) / 255);
  }
  const rgbB = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).blur(6).raw().toBuffer();
  const wtB = await sharp(wt, { raw: { width: W, height: H, channels: 1 } }).blur(6).extractChannel(0).raw().toBuffer();
  const band = await sharp(near, { raw: { width: W, height: H, channels: 1 } }).blur(1.5).extractChannel(0).raw().toBuffer();
  const out = Buffer.from(data);
  for (let i = 0; i < n; i++) {
    if (!data[i * 4 + 3] || !band[i] || wtB[i] < 4) continue;
    const t = band[i] / 255;
    for (let c = 0; c < 3; c++) {
      const body = Math.min(255, (rgbB[i * 3 + c] * 255) / wtB[i]);
      const v = data[i * 4 + c];
      // Never brighter than his body next to it: a light fringe is pulled down, nothing is lightened.
      const capped = Math.min(v, body + 6);
      out[i * 4 + c] = Math.round(v * (1 - t) + capped * t);
    }
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 7 }).toBuffer();
}

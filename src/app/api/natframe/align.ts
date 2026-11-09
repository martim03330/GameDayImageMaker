import sharp from "sharp";

/**
 * Where a cutout sits inside its original photo. The cutout step crops the original around the player,
 * may upscale it, then trims to the matte — so the cutout is a translated, uniformly scaled piece of the
 * original. We find that translation and scale by normalised cross-correlation of the grey levels inside
 * the matte, coarse to fine. Result in original-photo pixels: the cutout's top-left (x, y) and its scale k
 * (cutout pixels per original pixel). `score` is the correlation (≥ ~0.8 means a real match).
 */
export type Align = { x: number; y: number; k: number; score: number; w: number; h: number };

type Grey = { w: number; h: number; g: Float32Array };

async function greyOf(input: string | Buffer, width: number): Promise<Grey> {
  const { data, info } = await sharp(input).rotate().resize({ width: Math.max(8, Math.round(width)) }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const g = new Float32Array(info.width * info.height);
  for (let i = 0; i < g.length; i++) g[i] = data[i * info.channels];
  return { w: info.width, h: info.height, g };
}

type Pts = { xs: Int32Array; ys: Int32Array; v: Float32Array; w: number; h: number };

/** Opaque cutout pixels (grey value and position), at a given width, sampled down to ~max points. */
async function cutPts(cut: string, width: number, max: number): Promise<Pts> {
  const { data, info } = await sharp(cut).resize({ width: Math.max(4, Math.round(width)) }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const all: number[] = [];
  for (let i = 0; i < n; i++) if (data[i * 4 + 3] >= 250) all.push(i);
  const step = Math.max(1, Math.floor(all.length / max));
  const m = Math.ceil(all.length / step);
  const xs = new Int32Array(m);
  const ys = new Int32Array(m);
  const v = new Float32Array(m);
  let j = 0;
  for (let a = 0; a < all.length; a += step, j++) {
    const i = all[a];
    xs[j] = i % info.width;
    ys[j] = (i / info.width) | 0;
    v[j] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return { xs: xs.subarray(0, j), ys: ys.subarray(0, j), v: v.subarray(0, j), w: info.width, h: info.height };
}

function ncc(o: Grey, p: Pts, dx: number, dy: number): number {
  const n = p.v.length;
  let so = 0, soo = 0, sc = 0, scc = 0, soc = 0, cnt = 0;
  for (let i = 0; i < n; i++) {
    const x = p.xs[i] + dx;
    const y = p.ys[i] + dy;
    if (x < 0 || y < 0 || x >= o.w || y >= o.h) continue;
    const a = o.g[y * o.w + x];
    const b = p.v[i];
    so += a; soo += a * a; sc += b; scc += b * b; soc += a * b; cnt++;
  }
  if (cnt < n * 0.8) return -1;
  const va = soo - (so * so) / cnt;
  const vb = scc - (sc * sc) / cnt;
  if (va <= 0 || vb <= 0) return -1;
  return (soc - (so * sc) / cnt) / Math.sqrt(va * vb);
}

function search(o: Grey, p: Pts, cx: number, cy: number, r: number, step = 1) {
  let best = { dx: cx, dy: cy, s: -2 };
  for (let dy = cy - r; dy <= cy + r; dy += step)
    for (let dx = cx - r; dx <= cx + r; dx += step) {
      const s = ncc(o, p, dx, dy);
      if (s > best.s) best = { dx, dy, s };
    }
  return best;
}

export async function alignCutout(orig: string, cut: string, kHint: number | null): Promise<Align> {
  const meta = await sharp(orig).rotate().metadata();
  // .rotate() metadata still reports the stored size; swap for EXIF orientations 5–8.
  const swap = (meta.orientation ?? 1) >= 5;
  const W = (swap ? meta.height : meta.width) ?? 1;
  const H = (swap ? meta.width : meta.height) ?? 1;
  const cm = await sharp(cut).metadata();
  const Wc = cm.width ?? 1;
  const Hc = cm.height ?? 1;

  // Candidate scales: the hint (face size in both pictures) ± a little, else a broad sweep.
  const ks = kHint && isFinite(kHint) && kHint > 0 ? [kHint] : [1, 2, 3, 4, 0.5, 1.5, 2.5, 3.5];

  // Level 1: coarse full search at ~200px wide.
  const w1 = Math.min(W, 200);
  const o1 = await greyOf(orig, w1);
  const d1 = o1.w / W;
  let best = { x: 0, y: 0, k: ks[0], s: -2 };
  for (const k of ks) {
    for (const f of kHint ? [0.97, 1, 1.03] : [1]) {
      const kk = k * f;
      const cw = (Wc / kk) * d1;
      if (cw < 6 || cw > o1.w + 4) continue;
      const p = await cutPts(cut, cw, 1500);
      if (p.h > o1.h + 4) continue;
      const r = search(o1, p, Math.round((o1.w - p.w) / 2), Math.round((o1.h - p.h) / 2), Math.ceil(Math.max(o1.w - p.w, o1.h - p.h) / 2) + 3);
      if (r.s > best.s) best = { x: r.dx / d1, y: r.dy / d1, k: kk, s: r.s };
    }
  }

  // Level 2 and 3: finer, a small window and a narrow scale sweep.
  for (const [width, win, kSpan, kStep, pts] of [
    [800, 7, 0.024, 0.004, 6000],
    [1800, 5, 0.004, 0.001, 14000],
  ] as const) {
    const ow = Math.min(W, width);
    const o = await greyOf(orig, ow);
    const d = o.w / W;
    let lb = { x: best.x, y: best.y, k: best.k, s: -2 };
    for (let f = -kSpan; f <= kSpan + 1e-9; f += kStep) {
      const kk = best.k * (1 + f);
      // Keep the cutout's centre fixed while the scale changes.
      const ccx = best.x + Wc / best.k / 2;
      const ccy = best.y + Hc / best.k / 2;
      const p = await cutPts(cut, (Wc / kk) * d, pts);
      const x0 = Math.round((ccx - Wc / kk / 2) * d);
      const y0 = Math.round((ccy - Hc / kk / 2) * d);
      const r = search(o, p, x0, y0, win);
      if (r.s > lb.s) lb = { x: r.dx / d, y: r.dy / d, k: kk, s: r.s };
    }
    best = lb;
  }
  return { x: best.x, y: best.y, k: best.k, score: best.s, w: W, h: H };
}

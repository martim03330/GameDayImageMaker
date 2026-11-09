"use client";

import { useEffect, useState } from "react";
import type { RenderData } from "./types";

/**
 * Where the cutout sits inside his ORIGINAL photo, for the "natural" goal looks (goalnat*), which show the
 * real photo — grass, stands, light — and need to know where he is in it.
 *
 * The cutout is not a plain crop of the original: cutout.py frames the player, AI-upscales the crop, grades
 * it and trims it to the matte, and none of that geometry is stored. So it is measured here, in the browser:
 * the scale comes from the face (`face_px` = face height in the original), the offset from matching the
 * cutout's pixels (normalised cross-correlation, so the grade doesn't matter) against the original, coarse
 * then fine, with a tiny scale search and sub-pixel refinement. ~50–150 ms, cached per photo.
 *
 * Also returns a coarse luminance grid of the original, so a look can tell a bright studio wall from a
 * dark stand and pick its ink.
 */
export type NatAlign = {
  /** Original photo size in pixels. */
  ow: number;
  oh: number;
  /** Cutout pixels per original pixel. */
  s: number;
  /** Cutout's top-left corner, in original pixels. */
  x: number;
  y: number;
  /** Cutout size, in original pixels. */
  cw: number;
  ch: number;
  /** Match quality (NCC, 0..1). Below ~0.6 the look should not trust the alignment. */
  score: number;
  /** Luminance (0..1) of the original on a GRID×GRID grid, row by row. */
  lum: number[];
  /** Saturation (0..1) on the same grid. */
  sat: number[];
  /** A plain bright backdrop (studio wall): its border is light and colourless. */
  plain: boolean;
  /** His silhouette: for each of ROWS bands of the cutout, the [left, right] of its opaque pixels (0..1 of
   *  the cutout's width), or null for an empty band. */
  rows: ([number, number] | null)[];
};

export const ROWS = 64;

export const GRID = 24;

const cache = new Map<string, Promise<NatAlign | null>>();

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });
}

function pixels(img: HTMLImageElement, w: number, h: number): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, c.width, c.height);
  return g.getImageData(0, 0, c.width, c.height).data;
}

const grey = (d: Uint8ClampedArray, n: number) => {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  return out;
};

/** Sample points well inside the matte (opaque, with opaque neighbours), spread evenly. */
function samples(d: Uint8ClampedArray, w: number, h: number, max: number) {
  const pts: number[] = [];
  const a = (x: number, y: number) => d[(y * w + x) * 4 + 3];
  for (let y = 2; y < h - 2; y++)
    for (let x = 2; x < w - 2; x++) if (a(x, y) > 250 && a(x - 2, y) > 250 && a(x + 2, y) > 250 && a(x, y - 2) > 250 && a(x, y + 2) > 250) pts.push(x, y);
  const n = pts.length / 2;
  if (n <= max) return pts;
  const step = n / max;
  const out: number[] = [];
  for (let k = 0; k < max; k++) {
    const i = Math.floor(k * step + ((k * 7919) % 97) / 97 * step * 0.9);
    out.push(pts[i * 2], pts[i * 2 + 1]);
  }
  return out;
}

/** NCC of the cutout's sample values against the original at offset (ox, oy). */
function ncc(o: Float32Array, ow: number, pts: number[], cv: Float32Array, ox: number, oy: number) {
  let so = 0;
  let soo = 0;
  let soc = 0;
  const n = cv.length;
  for (let k = 0; k < n; k++) {
    const v = o[(pts[k * 2 + 1] + oy) * ow + pts[k * 2] + ox];
    so += v;
    soo += v * v;
    soc += v * cv[k];
  }
  const varO = soo - (so * so) / n;
  return varO > 1e-6 ? soc / Math.sqrt(varO) : -1;
}

/** Cutout sample values, mean-removed and unit-norm. */
function normed(d: Uint8ClampedArray, w: number, pts: number[]) {
  const n = pts.length / 2;
  const v = new Float32Array(n);
  let m = 0;
  for (let k = 0; k < n; k++) {
    const i = (pts[k * 2 + 1] * w + pts[k * 2]) * 4;
    v[k] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    m += v[k];
  }
  m /= n;
  let ss = 0;
  for (let k = 0; k < n; k++) {
    v[k] -= m;
    ss += v[k] * v[k];
  }
  const r = Math.sqrt(ss) || 1;
  for (let k = 0; k < n; k++) v[k] /= r;
  return v;
}

async function measure(cutUrl: string, origUrl: string, face: RenderData["face"], facePx: number): Promise<NatAlign | null> {
  const [cut, orig] = await Promise.all([load(cutUrl), load(origUrl)]);
  const ow = orig.naturalWidth;
  const oh = orig.naturalHeight;
  const cw0 = cut.naturalWidth;
  const ch0 = cut.naturalHeight;
  if (!ow || !oh || !cw0 || !ch0) return null;

  // Silhouette profile of the cutout.
  const pw = 120;
  const ph = ROWS * 2;
  const pd = pixels(cut, pw, ph);
  const rows: NatAlign["rows"] = [];
  for (let r = 0; r < ROWS; r++) {
    let lo = pw;
    let hi = -1;
    for (let y = r * 2; y < r * 2 + 2; y++)
      for (let x = 0; x < pw; x++)
        if (pd[(y * pw + x) * 4 + 3] > 60) {
          lo = Math.min(lo, x);
          hi = Math.max(hi, x);
        }
    rows.push(hi < 0 ? null : [lo / pw, (hi + 1) / pw]);
  }

  // Luminance grid of the original.
  const lg = pixels(orig, GRID, GRID);
  const lum = Array.from(grey(lg, GRID * GRID), (v) => v / 255);
  const sat = Array.from({ length: GRID * GRID }, (_, i) => {
    const [r, g, b] = [lg[i * 4], lg[i * 4 + 1], lg[i * 4 + 2]];
    const mx = Math.max(r, g, b);
    return mx ? (mx - Math.min(r, g, b)) / mx : 0;
  });

  // Scale candidates: from the face (precise to the rounding of face_px), else a wide sweep.
  const fit = Math.max(cw0 / ow, ch0 / oh); // the cutout lies inside the original
  const s0 = face && facePx > 0 ? (face[3] * ch0) / facePx : 0;
  const coarseScales = s0 > 0 ? [s0 * 0.985, s0, s0 * 1.015] : [1, ...Array.from({ length: 28 }, (_, i) => fit * Math.pow(1.06, i))];

  // Coarse: original at ~260px.
  const d1 = Math.min(1, 260 / Math.max(ow, oh));
  const W1 = Math.round(ow * d1);
  const H1 = Math.round(oh * d1);
  const o1 = grey(pixels(orig, W1, H1), W1 * H1);
  let best = { score: -2, s: 0, x: 0, y: 0 };
  for (const s of coarseScales) {
    if (s < fit * 0.97) continue;
    const w = Math.round((cw0 / s) * d1);
    const h = Math.round((ch0 / s) * d1);
    if (w < 6 || h < 6 || w > W1 + 2 || h > H1 + 2) continue;
    const cd = pixels(cut, w, h);
    const pts = samples(cd, w, h, 500);
    if (pts.length < 40) continue;
    const cv = normed(cd, w, pts);
    const [x0, x1, y0, y1] = [minOf(pts, 0), maxOf(pts, 0), minOf(pts, 1), maxOf(pts, 1)];
    for (let oy = -y0; oy <= H1 - 1 - y1; oy++)
      for (let ox = -x0; ox <= W1 - 1 - x1; ox++) {
        const sc = ncc(o1, W1, pts, cv, ox, oy);
        if (sc > best.score) best = { score: sc, s, x: ox / d1, y: oy / d1 };
      }
  }
  if (best.score < 0) return null;

  // Fine: original at ≤1400px, ±(coarse step + 3) px, small scale sweep, then sub-pixel.
  const d2 = Math.min(1, 1400 / Math.max(ow, oh));
  const W2 = Math.round(ow * d2);
  const H2 = Math.round(oh * d2);
  const o2 = grey(pixels(orig, W2, H2), W2 * H2);
  const R = Math.ceil(d2 / d1) + 3;
  let fine = { score: -2, s: best.s, x: best.x * d2, y: best.y * d2, w: 0, h: 0, sub: [0, 0] as [number, number] };
  const fineScales = Array.from({ length: 9 }, (_, i) => best.s * (1 + (i - 4) * (s0 > 0 ? 0.003 : 0.008)));
  for (const s of fineScales) {
    const wf = (cw0 / s) * d2;
    const hf = (ch0 / s) * d2;
    const w = Math.round(wf);
    const h = Math.round(hf);
    const cd = pixels(cut, w, h);
    const pts = samples(cd, w, h, 2500);
    if (pts.length < 40) continue;
    const cv = normed(cd, w, pts);
    const cx = Math.round(best.x * d2);
    const cy = Math.round(best.y * d2);
    const grid: Record<string, number> = {};
    let local = { score: -2, x: 0, y: 0 };
    const [x0, x1, y0, y1] = [minOf(pts, 0), maxOf(pts, 0), minOf(pts, 1), maxOf(pts, 1)];
    for (let oy = cy - R; oy <= cy + R; oy++)
      for (let ox = cx - R; ox <= cx + R; ox++) {
        if (ox + x0 < 0 || oy + y0 < 0 || ox + x1 >= W2 || oy + y1 >= H2) continue;
        const sc = ncc(o2, W2, pts, cv, ox, oy);
        grid[`${ox},${oy}`] = sc;
        if (sc > local.score) local = { score: sc, x: ox, y: oy };
      }
    if (local.score > fine.score) {
      // Parabola through the neighbours for the sub-pixel peak.
      const at = (x: number, y: number) => grid[`${x},${y}`] ?? local.score;
      const px = (l: number, c: number, r: number) => (l - 2 * c + r < 0 ? (0.5 * (l - r)) / (l - 2 * c + r) : 0);
      const sub: [number, number] = [px(at(local.x - 1, local.y), local.score, at(local.x + 1, local.y)), px(at(local.x, local.y - 1), local.score, at(local.x, local.y + 1))];
      // The cutout was drawn at a rounded size: correct the scale to the size actually matched.
      fine = { score: local.score, s: (cw0 / w) * d2, x: local.x, y: local.y, w, h, sub };
    }
  }
  if (fine.score < -1) return null;
  const s = fine.s;
  return {
    ow,
    oh,
    s,
    x: (fine.x + Math.max(-0.5, Math.min(0.5, fine.sub[0]))) / d2,
    y: (fine.y + Math.max(-0.5, Math.min(0.5, fine.sub[1]))) / d2,
    cw: cw0 / s,
    ch: ch0 / s,
    score: fine.score,
    lum,
    sat,
    plain: (() => {
      let l = 0;
      let c = 0;
      let n = 0;
      for (let y = 0; y < GRID; y++)
        for (let x = 0; x < GRID; x++)
          if (y < 2 || x < 2 || x >= GRID - 2) {
            l += lum[y * GRID + x];
            c += sat[y * GRID + x];
            n++;
          }
      return l / n > 0.75 && c / n < 0.15;
    })(),
    rows,
  };
}

function minOf(pts: number[], o: number) {
  let m = Infinity;
  for (let i = o; i < pts.length; i += 2) m = Math.min(m, pts[i]);
  return m;
}
function maxOf(pts: number[], o: number) {
  let m = -Infinity;
  for (let i = o; i < pts.length; i += 2) m = Math.max(m, pts[i]);
  return m;
}

/** The chosen photo's original (the cutout's source), not a backdrop picked for the edit. */
export function originalOf(data: RenderData): string | null {
  const own = data.cutouts.find((c) => c.url === data.photoUrl);
  return own?.original ?? data.bgPhotoUrl;
}

/** Alignment of data.photoUrl inside its original; null while measuring (or if it failed). */
export function useNatAlign(data: RenderData): { align: NatAlign | null; done: boolean } {
  const orig = originalOf(data);
  const key = `${data.photoUrl}|${orig}`;
  const [state, setState] = useState<{ key: string; align: NatAlign | null } | null>(null);
  useEffect(() => {
    if (!data.photoUrl || !orig) return;
    let live = true;
    let job = cache.get(key);
    if (!job) {
      job = measure(data.photoUrl, orig, data.face, data.facePx).catch(() => null);
      cache.set(key, job);
    }
    job.then((a) => live && setState({ key, align: a && a.score > 0.55 ? a : null }));
    return () => {
      live = false;
    };
  }, [key, data.photoUrl, orig, data.face, data.facePx]);
  const done = !data.photoUrl || !orig || state?.key === key;
  return { align: state?.key === key ? state.align : null, done };
}

/** Mean luminance of the original over a rectangle given in original-pixel fractions (0..1). */
export function lumAt(a: NatAlign, x0: number, y0: number, x1: number, y1: number, grid: number[] = a.lum): number {
  const gx0 = Math.max(0, Math.floor(x0 * GRID));
  const gx1 = Math.min(GRID - 1, Math.ceil(x1 * GRID) - 1);
  const gy0 = Math.max(0, Math.floor(y0 * GRID));
  const gy1 = Math.min(GRID - 1, Math.ceil(y1 * GRID) - 1);
  let s = 0;
  let n = 0;
  for (let y = gy0; y <= gy1; y++)
    for (let x = gx0; x <= gx1; x++) {
      s += grid[y * GRID + x];
      n++;
    }
  return n ? s / n : 0.5;
}

/**
 * How the original is laid on the canvas: z = canvas px per original px, (X, Y) = its top-left corner.
 * The face lands near (fx, fy) with its height near faceH, as far as covering the whole canvas allows.
 */
export function layPhoto(a: NatAlign, face: [number, number, number, number], W: number, H: number, fx: number, fy: number, faceH: number, maxZ = 99) {
  const f = { x: a.x + face[0] * a.cw, y: a.y + face[1] * a.ch, w: face[2] * a.cw, h: face[3] * a.ch };
  const cover = Math.max(W / a.ow, H / a.oh);
  const z = Math.max(cover, Math.min(maxZ, faceH / f.h));
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const X = Math.min(0, Math.max(W - a.ow * z, fx - cx * z));
  const Y = Math.min(0, Math.max(H - a.oh * z, fy - cy * z));
  return {
    z,
    X,
    Y,
    /** Face box on the canvas. */
    face: { x: X + f.x * z, y: Y + f.y * z, w: f.w * z, h: f.h * z },
    /** Cutout box on the canvas (his whole figure). */
    fig: { x: X + a.x * z, y: Y + a.y * z, w: a.cw * z, h: a.ch * z },
  };
}

/** His horizontal extent on the canvas between two canvas rows ([Infinity, -Infinity] if he isn't there). */
export function spanAt(a: NatAlign, fig: { x: number; y: number; w: number; h: number }, y0: number, y1: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let r = 0; r < ROWS; r++) {
    const ry0 = fig.y + (r / ROWS) * fig.h;
    const ry1 = fig.y + ((r + 1) / ROWS) * fig.h;
    const span = a.rows[r];
    if (!span || ry1 < y0 || ry0 > y1) continue;
    lo = Math.min(lo, fig.x + span[0] * fig.w);
    hi = Math.max(hi, fig.x + span[1] * fig.w);
  }
  return [lo, hi];
}

/** The first of the candidate boxes (canvas px) his silhouette leaves clear (with a margin), else the least covered. */
export function clearSpot(a: NatAlign, fig: { x: number; y: number; w: number; h: number }, boxes: { x: number; y: number; w: number; h: number }[], margin = 28): number {
  let best = 0;
  let bestHit = Infinity;
  boxes.forEach((b, i) => {
    let hit = 0;
    for (let y = b.y - margin; y < b.y + b.h + margin; y += 8) {
      const [lo, hi] = spanAt(a, fig, y, y + 8);
      hit += Math.max(0, Math.min(hi, b.x + b.w + margin) - Math.max(lo, b.x - margin));
    }
    if (hit < bestHit) {
      bestHit = hit;
      best = i;
    }
  });
  return best;
}

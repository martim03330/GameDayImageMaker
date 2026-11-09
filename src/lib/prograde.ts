import sharp from "sharp";

/**
 * "Tom profissional": the pro sports-photo grade (the "Raw vs Edit" PSG look), applied by /api/natframe to the
 * framed photo AND the figure layer, so he matches his ground.
 *
 *   1. colour (per pixel, HSL): grass greens turned toward emerald, darker and calmer; lime / yellow-greens
 *      strongly desaturated; blues (kits) darkened to navy, saturation kept; reds a touch deeper. Skin hues
 *      (~10–45°) are protected. Every range is a smooth raised-cosine weight in hue, faded out at low chroma,
 *      so there is no banding and grey / black-and-white photos are not tinted.
 *   2. global tone: gentle S-curve (blacks stay at 0), near-whites lifted into a faint cool lavender haze.
 *   3. clarity: a large-radius, low-amount unsharp mask on luminance (fabric, grass, muscle).
 *   4. fine monochrome film grain, seeded by pixel position (deterministic: bg and fig get the same grain).
 *
 * Steps 1, 2 and 4 are pointwise, so the same pixel gives the same result in both layers. For 3 the figure layer
 * passes the blurred reference of the graded GROUND (`ref`), so where he is opaque his pixels come out identical.
 */
export const PRO_GRADE_VERSION = 6;

export const PRO = {
  green: { c: 114, hw: 62, hue: 12, sat: 0.32, lum: 0.28 },
  yellow: { c: 70, hw: 22, sat: 0.55, lum: 0.08 },
  blue: { c: 220, hw: 44, sat: 0.1, lum: 0.3 },
  red: { c: 0, hw: 14, sat: 0.05, lum: 0.05 },
  skin: { c: 27, hw: 24 },
  curve: 0.1,
  haze: 0.07,
  clarity: { sigma: 22, amount: 0.28 },
  grain: 0.035,
};

/** Raised-cosine weight in hue: 1 at c, 0 at ±hw and beyond (wraps round 360°). */
function bump(h: number, c: number, hw: number) {
  let d = Math.abs(h - c);
  if (d > 180) d = 360 - d;
  return d >= hw ? 0 : 0.5 * (1 + Math.cos((Math.PI * d) / hw));
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** RGB (0..1) → hue (deg), HSL saturation, lightness, chroma. */
function hsl(r: number, g: number, b: number) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const c = mx - mn;
  const l = (mx + mn) / 2;
  const s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (c > 0) {
    if (mx === r) h = ((g - b) / c) % 6;
    else if (mx === g) h = (b - r) / c + 2;
    else h = (r - g) / c + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l, c };
}

/**
 * Where each colour range applies, per pixel: hue shift (deg), saturation and lightness multipliers. Measured
 * on a softened copy of the GROUND (blur σ 3), so the JPEG's blocky 8×8 / subsampled chroma never turns into
 * blocky brightness steps, and the figure layer reuses the very same maps.
 */
export type ProMaps = { dh: Float32Array; ks: Float32Array; kl: Float32Array };

export async function proMaps(px: Buffer, W: number, H: number, ch: number): Promise<ProMaps> {
  const n = W * H;
  const rgb = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) rgb[i * 3 + c] = px[i * ch + c];
  const sm = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).blur(3).raw().toBuffer();
  const dh = new Float32Array(n);
  const ks = new Float32Array(n);
  const kl = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = hsl(sm[i * 3] / 255, sm[i * 3 + 1] / 255, sm[i * 3 + 2] / 255);
    const own = (Math.max(px[i * ch], px[i * ch + 1], px[i * ch + 2]) - Math.min(px[i * ch], px[i * ch + 1], px[i * ch + 2])) / 255;
    // Faded out at low chroma (greys, white lines and shirts, black-and-white photos stay as they are): the
    // lower of his own and the softened chroma, so a white stripe next to a blue one is not tinted either.
    // Blues only from a clearly coloured blue (bluish shadows on a white kit must not go grey-navy).
    const cm = Math.min(v.c, own);
    const cw = smooth(0.03, 0.18, cm);
    const cwb = smooth(0.22, 0.5, cm);
    const keep = 1 - bump(v.h, PRO.skin.c, PRO.skin.hw);
    const wg = bump(v.h, PRO.green.c, PRO.green.hw) * cw * keep;
    const wy = bump(v.h, PRO.yellow.c, PRO.yellow.hw) * cw * keep;
    const wb = bump(v.h, PRO.blue.c, PRO.blue.hw) * cwb;
    const wr = bump(v.h, PRO.red.c, PRO.red.hw) * cw * keep;
    dh[i] = PRO.green.hue * wg;
    ks[i] = (1 - PRO.green.sat * wg) * (1 - PRO.yellow.sat * wy) * (1 + PRO.blue.sat * wb) * (1 + PRO.red.sat * wr);
    kl[i] = (1 - PRO.green.lum * wg) * (1 - PRO.yellow.lum * wy) * (1 - PRO.blue.lum * wb) * (1 - PRO.red.lum * wr);
  }
  return { dh, ks, kl };
}

/** Steps 1 + 2 on one pixel (0..255 in, 0..1 floats out into `o`), with its map values. */
function colourOne(r8: number, g8: number, b8: number, dh: number, ks: number, kl: number, o: Float32Array) {
  let r = r8 / 255;
  let g = g8 / 255;
  let b = b8 / 255;
  if (dh !== 0 || ks !== 1 || kl !== 1) {
    const v = hsl(r, g, b);
    const s = Math.min(1, v.s * ks);
    const l = v.l * kl;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hh = (v.h + dh) / 360;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  // Gentle S-curve on luminance only, added as an offset to all three channels: contrast without the
  // saturation boost a per-channel curve gives (skin keeps its saturation). 0 and 1 fixed: blacks stay deep.
  const a = PRO.curve;
  const Y0 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const dY = -(a * Math.sin(2 * Math.PI * Y0)) / (2 * Math.PI);
  r += dY;
  g += dY;
  b += dY;
  // Near-whites: a faint cool lavender haze.
  const Y = Y0 + dY;
  const t = smooth(0.62, 1, Y) * PRO.haze;
  o[0] = r + (0.91 - r) * t;
  o[1] = g + (0.89 - g) * t;
  o[2] = b + (0.98 - b) * t;
}

/** Fine monochrome grain in -1..1 (roughly gaussian), from the pixel position only. */
function grainAt(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  const u1 = (h & 0xffff) / 65535;
  const u2 = ((h >>> 16) & 0xffff) / 65535;
  return u1 + u2 - 1;
}

/** Steps 1 + 2 in place on a raw buffer (any channel count ≥ 3; alpha untouched); maps from proMaps (null: pointwise). */
export function proColour(px: Buffer, n: number, ch: number, maps: ProMaps | null) {
  const o = new Float32Array(3);
  for (let i = 0; i < n; i++) {
    const j = i * ch;
    // Without maps (the 8-px band): the same weights from the pixel itself.
    const [dh, ks, kl] = maps ? [maps.dh[i], maps.ks[i], maps.kl[i]] : pointMaps(px[j], px[j + 1], px[j + 2]);
    colourOne(px[j], px[j + 1], px[j + 2], dh, ks, kl, o);
    px[j] = Math.round(Math.min(1, Math.max(0, o[0])) * 255);
    px[j + 1] = Math.round(Math.min(1, Math.max(0, o[1])) * 255);
    px[j + 2] = Math.round(Math.min(1, Math.max(0, o[2])) * 255);
  }
}

/** The clarity reference: the luminance of a colour-graded ground, heavily blurred (W×H, 1 channel). */
export async function proRef(px: Buffer, W: number, H: number, ch: number): Promise<Buffer> {
  const Y = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) Y[i] = Math.round(0.2126 * px[i * ch] + 0.7152 * px[i * ch + 1] + 0.0722 * px[i * ch + 2]);
  return sharp(Y, { raw: { width: W, height: H, channels: 1 } }).blur(PRO.clarity.sigma).extractChannel(0).raw().toBuffer();
}

/** Steps 3 + 4 in place, after proColour; `ref` from proRef (of this buffer for the ground, of the ground for him). */
export function proFinish(px: Buffer, W: number, H: number, ch: number, ref: Buffer) {
  const amt = PRO.clarity.amount;
  const gr = PRO.grain * 255;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const j = i * ch;
      const Y = 0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2];
      const yn = Y / 255;
      // Clarity mostly in the midtones (no halos in the blacks / clipped whites).
      const mid = 4 * yn * (1 - yn);
      const d = (Y - ref[i]) * amt * mid + grainAt(x, y) * gr * (0.35 + 0.65 * mid);
      for (let c = 0; c < 3; c++) px[j + c] = Math.min(255, Math.max(0, Math.round(px[j + c] + d)));
    }
}

function pointMaps(r8: number, g8: number, b8: number): [number, number, number] {
  const v = hsl(r8 / 255, g8 / 255, b8 / 255);
  const cw = smooth(0.03, 0.18, v.c);
  const keep = 1 - bump(v.h, PRO.skin.c, PRO.skin.hw);
  const wg = bump(v.h, PRO.green.c, PRO.green.hw) * cw * keep;
  const wy = bump(v.h, PRO.yellow.c, PRO.yellow.hw) * cw * keep;
  const wb = bump(v.h, PRO.blue.c, PRO.blue.hw) * smooth(0.22, 0.5, v.c);
  const wr = bump(v.h, PRO.red.c, PRO.red.hw) * cw * keep;
  return [
    PRO.green.hue * wg,
    (1 - PRO.green.sat * wg) * (1 - PRO.yellow.sat * wy) * (1 + PRO.blue.sat * wb) * (1 + PRO.red.sat * wr),
    (1 - PRO.green.lum * wg) * (1 - PRO.yellow.lum * wy) * (1 - PRO.blue.lum * wb) * (1 - PRO.red.lum * wr),
  ];
}

/**
 * The ground's grade, prepared from the UNGRADED ground: its colour maps, and the clarity reference of its
 * colour-graded copy. The figure layer gets exactly these, so where he is opaque he comes out identical.
 */
export async function proPrepare(ground: Buffer, W: number, H: number, ch: number): Promise<{ maps: ProMaps; ref: Buffer }> {
  const maps = await proMaps(ground, W, H, ch);
  const g = Buffer.from(ground);
  proColour(g, W * H, ch, maps);
  return { maps, ref: await proRef(g, W, H, ch) };
}

/** The whole grade on a raw ground buffer, in place. */
export async function proGradeGround(px: Buffer, W: number, H: number, ch: number) {
  const maps = await proMaps(px, W, H, ch);
  proColour(px, W * H, ch, maps);
  const ref = await proRef(px, W, H, ch);
  proFinish(px, W, H, ch, ref);
}

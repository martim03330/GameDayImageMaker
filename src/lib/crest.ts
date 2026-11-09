import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { db } from "./db";
import { fetchImage } from "./sources/http";
import { absPath } from "./storage";

/** Stores a downloaded image under data/files/<folder>/ (PNG keeps crest transparency, JPEG for photos). */
export async function storeRemoteImage(buf: Buffer, folder: string, format: "png" | "jpeg" = "png"): Promise<string> {
  const rel = path.posix.join(folder, `${nanoid(10)}.${format === "png" ? "png" : "jpg"}`);
  await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
  // Crests: a flat white background is removed first (a white box round the crest showed on dark edits),
  // then the transparent margin is cut, so crests side by side look the same size whatever padding the source had.
  const src = folder === "crests" ? await clearWhiteBackground(buf).catch(() => buf) : buf;
  const img = folder === "crests" ? sharp(await sharp(src).trim({ threshold: 10 }).toBuffer().catch(() => src)) : sharp(src);
  await (format === "png" ? img.png() : img.jpeg({ quality: 90, mozjpeg: true })).toFile(absPath(rel));
  return rel;
}

/**
 * A crest delivered on an opaque white (or near-white) background, as many club sites and zerozero do:
 * the background is made transparent by a flood fill FROM THE EDGES only, so white parts inside the crest
 * (a white shield, letters) stay. The edge of the cleared area is softened a little. Images that already
 * have transparency, or whose border is not white, are returned unchanged.
 */
export async function clearWhiteBackground(buf: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = (x: number, y: number) => (y * W + x) * 4;
  // Already transparent somewhere on the border: nothing to do.
  let transparent = 0;
  let whiteBorder = 0;
  let border = 0;
  const isWhite = (i: number) => data[i] >= 232 && data[i + 1] >= 232 && data[i + 2] >= 232;
  for (let x = 0; x < W; x++)
    for (const y of [0, H - 1]) {
      const i = px(x, y);
      border++;
      if (data[i + 3] < 200) transparent++;
      if (isWhite(i)) whiteBorder++;
    }
  for (let y = 0; y < H; y++)
    for (const x of [0, W - 1]) {
      const i = px(x, y);
      border++;
      if (data[i + 3] < 200) transparent++;
      if (isWhite(i)) whiteBorder++;
    }
  // A white background: the four corners white (a crest's shape never fills its corners) and a good part of
  // the border white — not 85%: once trimmed, a shield touches the edges in the middle of each side.
  const corners = [px(0, 0), px(W - 1, 0), px(0, H - 1), px(W - 1, H - 1)].filter(isWhite).length;
  if (transparent > border * 0.1 || corners < 3 || whiteBorder < border * 0.35) return buf;
  // Flood fill from every white border pixel.
  const seen = new Uint8Array(W * H);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) stack.push(y * W + x);
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) stack.push(y * W + x);
  while (stack.length) {
    const k = stack.pop()!;
    if (seen[k]) continue;
    const i = k * 4;
    if (!isWhite(i)) continue;
    seen[k] = 1;
    data[i + 3] = 0;
    const x = k % W;
    const y = (k - x) / W;
    if (x > 0) stack.push(k - 1);
    if (x < W - 1) stack.push(k + 1);
    if (y > 0) stack.push(k - W);
    if (y < H - 1) stack.push(k + W);
  }
  // Soften: pixels touching the cleared area and still very light become half transparent (no white rim).
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const k = y * W + x;
      if (seen[k]) continue;
      if (seen[k - 1] || seen[k + 1] || seen[k - W] || seen[k + W]) {
        const i = k * 4;
        const light = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (light > 200) data[i + 3] = Math.round(data[i + 3] * Math.max(0.25, (255 - light) / 55));
      }
    }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

/**
 * The two most common saturated colours of a crest (ignoring transparency, white, black and greys),
 * used as the club's primary / secondary colours.
 */
export async function crestColors(buf: Buffer): Promise<[string, string]> {
  const { data, info } = await sharp(buf).ensureAlpha().resize(48, 48, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 200) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.3 || max < 45) continue;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(key, e);
  }
  const top = [...buckets.values()].sort((a, b) => b.n - a.n).map((e) => toHex(Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)));
  return [top[0] ?? "#0b3d91", top.find((c, i) => i > 0 && distinct(c, top[0])) ?? "#ffffff"];
}

function distinct(a: string, b: string) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) > 90;
}

/**
 * An opponent's crest as a file of our own: club sites and zerozero hotlinks break (Alabama State's SWAC.png
 * started answering with a redirect to a web page, and the "Letras gigantes" story showed a broken image), so
 * the first time a remote crest is seen it is downloaded, cleaned like every crest and remembered in
 * crest_overrides (remote URL → file), which every fixture and match already reads through. Gives back the
 * local /api/files URL, or the remote one unchanged when the download fails (tried again next sync).
 */
export async function localCrest(url: string | null | undefined): Promise<string | null> {
  if (!url || !/^https?:\/\//.test(url)) return url ?? null;
  const known = db().prepare("SELECT file FROM crest_overrides WHERE source_url = ?").get(url) as { file: string } | undefined;
  if (known) return `/api/files/${known.file}`;
  try {
    const buf = await fetchImage(url);
    await sharp(buf).metadata(); // a page or an empty answer is not a crest
    const file = await storeRemoteImage(buf, "crests");
    db().prepare("INSERT OR REPLACE INTO crest_overrides (source_url, file) VALUES (?, ?)").run(url, file);
    return `/api/files/${file}`;
  } catch {
    return url;
  }
}

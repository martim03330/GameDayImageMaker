import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { alignCutout, type Align } from "@/app/api/natframe/align";
import type { NatAlign } from "@/templates/natgeom";
import { db } from "./db";
import { absPath } from "./storage";

/**
 * Where each cutout sits in its original (image matching, slow): computed once, cached as a file and kept in
 * photos.meta.nat_align so natPlace (templates/natkit.tsx) can frame the NATURAL looks exactly, synchronously.
 */

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 20);

/** The matching, cached in data/files/natframe/al-*.json (same key as /api/natframe always used). */
export async function alignmentOf(orig: string, cut: string, kHint: number | null): Promise<Align> {
  const st = await Promise.all([fs.stat(absPath(orig)), fs.stat(absPath(cut))]);
  const rel = path.posix.join("natframe", `al-${hash(`${orig}|${cut}|${st[0].mtimeMs}|${st[1].mtimeMs}`)}.json`);
  try {
    return JSON.parse(await fs.readFile(absPath(rel), "utf8")) as Align;
  } catch {
    const a = await alignCutout(absPath(orig), absPath(cut), kHint);
    await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
    await fs.writeFile(absPath(rel), JSON.stringify(a));
    return a;
  }
}

/** The full alignment (with the cutout's size) for an original + cutout, given the face box and face px. */
export async function natAlignOf(orig: string, cut: string, face: readonly number[], facePx: number): Promise<NatAlign> {
  const cm = await sharp(absPath(cut)).metadata();
  const cw = cm.width ?? 1;
  const ch = cm.height ?? 1;
  const a = await alignmentOf(orig, cut, facePx > 0 ? (face[3] * ch) / facePx : null);
  return { x: a.x, y: a.y, k: a.k, w: a.w, h: a.h, cw, ch };
}

/** Keeps it on the photo row (only while that row still has this original + cutout). */
export function saveNatAlign(orig: string, cut: string, a: NatAlign) {
  db()
    .prepare("UPDATE photos SET meta = json_set(meta, '$.nat_align', json(?)) WHERE file = ? AND cutout = ? AND meta IS NOT NULL")
    .run(JSON.stringify({ ...a, cut }), orig, cut);
}

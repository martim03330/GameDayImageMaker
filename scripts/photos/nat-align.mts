// Measures where each player cutout sits in its original photo and keeps it in photos.meta.nat_align, so the
// NATURAL looks (templates/natkit.tsx natPlace) know exactly where /api/natframe puts his face.
// New photos get it lazily on their first natural render; run this after a bulk import / reprocess.
// Usage: npx tsx scripts/photos/nat-align.mts [--force]
import { db } from "../../src/lib/db";
import { natAlignOf, saveNatAlign } from "../../src/lib/natalign";
import type { PhotoMeta } from "../../src/lib/types";

const force = process.argv.includes("--force");
const rows = db()
  .prepare("SELECT id, file, cutout, meta FROM photos WHERE kind = 'player' AND cutout_status = 'done' AND cutout IS NOT NULL AND meta IS NOT NULL ORDER BY rowid")
  .all() as { id: string; file: string; cutout: string; meta: string }[];
let done = 0, skipped = 0, failed = 0;
for (const r of rows) {
  const m = JSON.parse(r.meta) as PhotoMeta;
  if (!m.face) { skipped++; continue; }
  if (!force && m.nat_align?.cut === r.cutout) { skipped++; continue; }
  const t = Date.now();
  try {
    const a = await natAlignOf(r.file, r.cutout, m.face, m.face_px ?? 0);
    saveNatAlign(r.file, r.cutout, a);
    done++;
    console.log(r.id, `x=${a.x.toFixed(1)} y=${a.y.toFixed(1)} k=${a.k.toFixed(4)} ${a.w}x${a.h}`, `${Date.now() - t}ms`);
  } catch (e) {
    failed++;
    console.log(r.id, "FAILED", (e as Error).message);
  }
}
console.log({ done, skipped, failed, total: rows.length });

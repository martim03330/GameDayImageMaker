// Finds the other people (team-mates, opponents) in each player photo and keeps their boxes in photos.meta.others
// (and his own in meta.him_box), so the NATURAL looks keep their text off them (templates/natkit.tsx pickTextSpot).
// New cutouts get it from services/cutout/cutout.py; this backfills the photos cut out before. "Him" is the person
// whose silhouette covers the existing cutout, put back where it sits in the original (meta.nat_align).
// Usage: npx tsx scripts/photos/others.mts [--force]
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { db } from "../../src/lib/db";
import { natAlignOf, saveNatAlign } from "../../src/lib/natalign";
import { absPath } from "../../src/lib/storage";
import type { PhotoMeta } from "../../src/lib/types";

const run = promisify(execFile);
const PYTHON = path.join(process.cwd(), "services/cutout/.venv/bin/python");
const SCRIPT = path.join(process.cwd(), "services/cutout/others.py");

const force = process.argv.includes("--force");
const rows = db()
  .prepare("SELECT id, file, cutout, meta FROM photos WHERE kind = 'player' AND cutout_status = 'done' AND cutout IS NOT NULL AND meta IS NOT NULL ORDER BY rowid")
  .all() as { id: string; file: string; cutout: string; meta: string }[];
const started = Date.now();
let done = 0, skipped = 0, failed = 0;
for (const r of rows) {
  let m = JSON.parse(r.meta) as PhotoMeta;
  if (!force && m.others) { skipped++; continue; }
  try {
    // The cutout's place in the original says which detection is him.
    if (m.face && m.nat_align?.cut !== r.cutout) {
      saveNatAlign(r.file, r.cutout, await natAlignOf(r.file, r.cutout, m.face, m.face_px ?? 0));
      m = JSON.parse((db().prepare("SELECT meta FROM photos WHERE id = ?").get(r.id) as { meta: string }).meta) as PhotoMeta;
    }
    const a = m.nat_align?.cut === r.cutout ? m.nat_align : null;
    const args = [SCRIPT, absPath(r.file), ...(a ? [absPath(r.cutout), String(a.x), String(a.y), String(a.k)] : [])];
    const { stdout } = await run(PYTHON, args, { timeout: 120_000 });
    const res = JSON.parse(stdout.trim().split("\n").pop()!) as { him: number[] | null; others: number[][] };
    db()
      .prepare("UPDATE photos SET meta = json_set(meta, '$.others', json(?), '$.him_box', json(?)) WHERE id = ?")
      .run(JSON.stringify(res.others), JSON.stringify(res.him), r.id);
    done++;
    console.log(r.id, `${res.others.length} other(s)`, res.him ? "him found" : "him not matched");
  } catch (e) {
    failed++;
    console.log(r.id, "FAILED", (e as Error).message.split("\n")[0]);
  }
}
console.log({ done, skipped, failed, total: rows.length, seconds: Math.round((Date.now() - started) / 1000) });

// Imports photos for a player and (re)runs the photo treatment + cutout on every player photo.
// Usage: npx tsx scripts/photos/reprocess.mts [playerId file1.jpg file2.jpg ...]   (run outside the sandbox: ESRGAN needs the GPU)
import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { cutoutPhoto } from "../../src/lib/cutout";
import { db } from "../../src/lib/db";
import { insertPhoto } from "../../src/lib/repo";
import { FILES_DIR } from "../../src/lib/storage";

const [playerId, ...files] = process.argv.slice(2);
const added: string[] = [];
if (playerId) {
  for (const f of files) {
    const rel = path.posix.join("photos", `${nanoid(10)}${path.extname(f).toLowerCase() || ".jpg"}`);
    await fs.copyFile(f, path.join(FILES_DIR, rel));
    added.push(insertPhoto({ player_id: playerId, kind: "player", file: rel }));
    console.log("importada", path.basename(f));
  }
}
// With new photos: only those. Without arguments: every player photo again (after a pipeline change).
const all = (db().prepare("SELECT id, file FROM photos WHERE kind = 'player' AND player_id IS NOT NULL ORDER BY rowid").all() as { id: string; file: string }[]).filter(
  (p) => !added.length || added.includes(p.id),
);
let i = 0;
for (const p of all) {
  i++;
  const t = Date.now();
  await cutoutPhoto(p.id);
  const row = db().prepare("SELECT cutout_status, meta FROM photos WHERE id = ?").get(p.id) as { cutout_status: string; meta: string | null };
  const m = row.meta ? JSON.parse(row.meta) : {};
  console.log(`${i}/${all.length} ${p.file} ${row.cutout_status} ${Math.round((Date.now() - t) / 1000)}s pose=${m.pose} nitidez=${m.sharpness} nitidezCara=${m.face_sharpness} cara=${m.face_px}px recorte=${m.cropped} escolhido=${m.chosen_by}`);
}
process.exit(0);

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { exportEdit, instagramJpeg, type Format } from "@/lib/exporter";
import { getEdit, getPlayer } from "@/lib/repo";
import { zip } from "@/lib/zip";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * The form carousel's 3 slides in ONE download (a ZIP): browsers block a page's 2nd and 3rd automatic
 * downloads, so exporting them one by one only delivered the first. Each JPEG is also saved straight into
 * ~/Downloads/GameDay (…-1de3, -2de3, -3de3). ?format=story for the three stories.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const edit = getEdit(id);
  if (!edit) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const format: Format = url.searchParams.get("format") === "story" ? "story" : "post";
  const player = getPlayer(edit.player_id);
  const slug = `${player?.first_name ?? ""}-${player?.last_name ?? ""}-carrossel-${String(edit.params.templateId ?? "")}${format === "story" ? "-story" : ""}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toLowerCase();
  const files: { name: string; data: Buffer }[] = [];
  const masters: { name: string; data: Buffer }[] = [];
  try {
    for (const n of [1, 2, 3]) {
      const { png } = await exportEdit(id, url.origin, format, n);
      files.push({ name: `${slug}-${n}de3.jpg`, data: await instagramJpeg(png, format) });
      masters.push({ name: `${slug}-${n}de3.png`, data: png });
    }
  } catch (e) {
    console.error("carousel export failed", id, e);
    return new Response("o carrossel não foi gerado", { status: 500 });
  }
  let savedTo = "";
  try {
    const dir = path.join(os.homedir(), "Downloads", "GameDay");
    await fs.mkdir(dir, { recursive: true });
    // JPEGs for Instagram + the full-quality PNGs next to them.
    for (const f of [...files, ...masters]) await fs.writeFile(path.join(dir, f.name), f.data);
    savedTo = "Transferências/GameDay";
  } catch (e) {
    console.error("could not save the carousel in Downloads", e);
  }
  return new Response(new Uint8Array(zip(files)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      ...(savedTo ? { "X-Saved-To": encodeURIComponent(savedTo) } : {}),
    },
  });
}

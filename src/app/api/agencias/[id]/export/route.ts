import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { weekEdits } from "@/lib/agencies/clients";
import { getAgency } from "@/lib/agencies/store";
import { weekStart } from "@/lib/agencies/week";
import { exportEdit, instagramJpeg, type Format } from "@/lib/exporter";
import { getEdit, getPlayer } from "@/lib/repo";
import { zip } from "@/lib/zip";

export const runtime = "nodejs";
export const maxDuration = 300;

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

/**
 * Every edit of one client agency for one week in ONE download (a ZIP of the Instagram JPEGs): browsers
 * block a page's repeated automatic downloads. Each JPEG and its full-quality PNG are also saved in
 * ~/Downloads/GameDay/<agency>-<week>/. ?week=YYYY-MM-DD (default: this week), ?format=story for stories.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const agency = getAgency((await params).id);
  if (!agency) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const format: Format = url.searchParams.get("format") === "story" ? "story" : "post";
  const week = url.searchParams.get("week") || weekStart(new Date().toISOString().slice(0, 10));
  const ids = weekEdits(agency.id, week);
  if (!ids.length) return new Response("Ainda não há edits desta semana", { status: 404 });
  const folder = `${slugify(agency.name)}-${week}${format === "story" ? "-stories" : ""}`;
  const files: { name: string; data: Buffer }[] = [];
  const masters: { name: string; data: Buffer }[] = [];
  try {
    for (const id of ids) {
      const player = getPlayer(getEdit(id)!.player_id);
      const name = slugify(`${player?.first_name ?? ""} ${player?.last_name ?? ""}`) || id;
      const { png } = await exportEdit(id, url.origin, format);
      files.push({ name: `${name}.jpg`, data: await instagramJpeg(png, format) });
      masters.push({ name: `${name}.png`, data: png });
    }
  } catch (e) {
    console.error("agency export failed", agency.id, e);
    return new Response("as edits não foram geradas", { status: 500 });
  }
  let savedTo = "";
  try {
    const dir = path.join(os.homedir(), "Downloads", "GameDay", folder);
    await fs.mkdir(dir, { recursive: true });
    for (const f of [...files, ...masters]) await fs.writeFile(path.join(dir, f.name), f.data);
    savedTo = `Transferências/GameDay/${folder}`;
  } catch (e) {
    console.error("could not save the agency export in Downloads", e);
  }
  return new Response(new Uint8Array(zip(files)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folder}.zip"`,
      ...(savedTo ? { "X-Saved-To": encodeURIComponent(savedTo) } : {}),
    },
  });
}

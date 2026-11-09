import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { exportEdit, exportPdf, exportVideo, instagramJpeg, type Format } from "@/lib/exporter";
import { getEdit, getPlayer, savePlayerPrefs } from "@/lib/repo";
import { pickKey } from "@/templates";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Identical requests running at the same time (double click, retry) share one job instead of racing on the same file. */
const inFlight = new Map<string, Promise<Buffer>>();
/** The 2× PNG behind a JPEG export, saved next to it in Downloads (user: "que saia as duas, PNG e JPG"). */
const masterPng = new Map<string, Buffer>();

/** ?format=post|story, ?video=1 for the 3-second MP4, ?png=1 for the 2× master PNG, ?pdf=1 for the vector story PDF (default: Instagram JPEG). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const edit = getEdit(id);
  if (!edit) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const format: Format = url.searchParams.get("format") === "story" ? "story" : "post";
  const video = url.searchParams.get("video") === "1";
  const png = url.searchParams.get("png") === "1";
  const pdf = url.searchParams.get("pdf") === "1";
  // Carousels: one slide per request (1, 2, 3).
  const slideN = Number(url.searchParams.get("slide"));
  const slide = slideN >= 1 && slideN <= 3 ? slideN : undefined;

  const key = `${id}:${format}:${video}:${png}:${pdf}:${slide ?? 0}`;
  let job = inFlight.get(key);
  if (!job) {
    job = (
      pdf
        ? exportPdf(id, url.origin)
        : video
          ? exportVideo(id, url.origin, format)
          : exportEdit(id, url.origin, format, slide).then(async (r) => {
              if (png) return r.png;
              masterPng.set(key, r.png);
              return instagramJpeg(r.png, format);
            })
    ).finally(() => inFlight.delete(key));
    inFlight.set(key, job);
  }
  let file: Buffer;
  try {
    file = await job;
  } catch (e) {
    console.error("export failed", key, e);
    return new Response(pdf ? "o PDF não foi gerado" : video ? "o vídeo não foi gerado" : "a imagem não foi gerada", { status: 500 });
  }
  const player = getPlayer(edit.player_id);
  // Learning: every export counts as a vote for this look.
  if (player && !pdf) {
    const key = pickKey(edit.params);
    // The framing and the colour finish are learned too ("none" counts: it is a choice as well).
    const taste = { ...player.prefs.taste };
    for (const k of [`framing:${edit.params.framing ?? "auto"}`, `finish:${edit.params.finish ?? "none"}`]) taste[k] = (taste[k] ?? 0) + 1;
    savePlayerPrefs(player.id, { ...player.prefs, picks: { ...player.prefs.picks, [key]: (player.prefs.picks[key] ?? 0) + 1 }, taste });
  }
  const slug = `${player?.first_name ?? ""}-${player?.last_name ?? ""}-${edit.post_type}${slide ? `-${slide}de3` : ""}${format === "story" || pdf ? "-story" : ""}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toLowerCase();

  const ext = pdf ? "pdf" : video ? "mp4" : png ? "png" : "jpg";
  // Look and edit id in the name: before, every matchday of a player was "moises-conceicao-matchday.jpg"
  // and each export overwrote the previous one in Downloads/GameDay. Re-exporting the same edit still replaces it.
  const name = `${slug}-${String(edit.params.templateId ?? "edit").toLowerCase()}-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toLowerCase()}.${ext}`;
  // A copy always lands in ~/Downloads/GameDay: embedded browsers (the editor's preview) often drop the
  // browser download silently, and the user then thinks nothing was exported.
  let savedTo = "";
  try {
    const dir = path.join(os.homedir(), "Downloads", "GameDay");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), file);
    savedTo = `Transferências/GameDay/${name}`;
    // An Instagram JPEG always comes with its full-quality PNG (2160 px wide) under the same name.
    const master = masterPng.get(key);
    if (master) {
      masterPng.delete(key);
      const pngName = name.replace(/\.jpg$/, ".png");
      await fs.writeFile(path.join(dir, pngName), master);
      savedTo += ` + ${pngName}`;
    }
  } catch (e) {
    console.error("could not save a copy in Downloads", e);
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": pdf ? "application/pdf" : video ? "video/mp4" : png ? "image/png" : "image/jpeg",
      "Content-Disposition": `attachment; filename="${name}"`,
      ...(savedTo ? { "X-Saved-To": encodeURIComponent(savedTo) } : {}),
    },
  });
}

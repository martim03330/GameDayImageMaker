import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { exportClipFrame } from "@/lib/exporter";
import { getEdit, getPlayer } from "@/lib/repo";
import { absPath } from "@/lib/storage";
import { clipDet, clipDir, clipForEdit, clipPath } from "./store";

const run = promisify(execFile);
const SERVICE = path.join(process.cwd(), "services", "balltrack");
/** The crop's size: every video look has a 16:9 slot; ffmpeg scales the crop to the slot's own size. */
const CROP_W = 1920;
const CROP_H = 1080;

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

/**
 * The video story (MP4 1080×1920, H.264, the clip's own audio):
 * 1. the look is screenshot as a still story and its #clip-slot rectangle is read;
 * 2. services/balltrack renders the ball-following crop, at the slot's size, between the trim points, at
 *    60 fps (RIFE between the real frames, sub-pixel camera, optional Real-ESRGAN);
 * 3. ffmpeg lays the crop over the slot and adds the original audio (same trim), saved in Downloads.
 */
const running = globalThis as unknown as { __clipExports?: Set<string> };

export async function exportClip(editId: string, baseUrl: string, sharp = false): Promise<{ file: string; savedTo: string; name: string }> {
  // Two exports of the same clip would write the same crop / output files and spoil each other.
  const busy = (running.__clipExports ??= new Set());
  if (busy.has(editId)) throw new Error("Este vídeo já está a ser exportado: espera que termine");
  busy.add(editId);
  try {
    return await exportClipNow(editId, baseUrl, sharp);
  } finally {
    busy.delete(editId);
  }
}

async function exportClipNow(editId: string, baseUrl: string, sharp: boolean): Promise<{ file: string; savedTo: string; name: string }> {
  const edit = getEdit(editId);
  const clip = clipForEdit(editId);
  if (!edit || !clip) throw new Error("Esta edit não tem vídeo");
  if (clip.status !== "pronto") throw new Error(clip.status.startsWith("erro") ? clip.status : "Ainda a seguir a bola…");
  const det = await clipDet(clip.id);
  const p = await clipPath(clip.id);
  if (!det || !p) throw new Error("Ainda a seguir a bola…");

  const dir = absPath(clipDir(clip.id));
  const { png, slot } = await exportClipFrame(editId, baseUrl);
  await fs.writeFile(path.join(dir, "story.png"), png);
  const start = Math.round(clip.trim_start * det.fps);
  const end = clip.trim_end === null ? det.n : Math.min(det.n, Math.round(clip.trim_end * det.fps));
  // The crop is the slow part (RIFE, Real-ESRGAN): it is rendered at a fixed 16:9 size and kept with the
  // settings it was made with, so changing only the look (or exporting again) reuses it and takes seconds.
  // A sharp crop also serves a plain export of the same cut.
  const key = JSON.stringify({ start, end, zoom: clip.zoom, x: p.x, y: p.y });
  const made = await fs.readFile(path.join(dir, "crop.json"), "utf8").then((s) => JSON.parse(s) as { key: string; sharp: boolean }).catch(() => null);
  const cached = made?.key === key && (made.sharp || !sharp) && (await fs.stat(path.join(dir, "crop.mp4")).catch(() => null));
  if (!cached) {
    await fs.rm(path.join(dir, "crop.json"), { force: true });
    await fs.writeFile(path.join(dir, "path.json"), JSON.stringify({ start, end, zoom: clip.zoom, outW: CROP_W, outH: CROP_H, x: p.x, y: p.y }));
    await run(path.join(SERVICE, ".venv", "bin", "python"), [path.join(SERVICE, "track.py"), "render", absPath(clip.file), path.join(dir, "path.json"), path.join(dir, "crop.mp4"), ...(sharp ? ["--esrgan"] : [])], { maxBuffer: 1 << 24 });
    await fs.writeFile(path.join(dir, "crop.json"), JSON.stringify({ key, sharp }));
  }

  // The crop is always 60 fps (RIFE fills the frames between the source's real ones).
  const fps = 60;
  const out = path.join(dir, "out.mp4");
  await run(process.env.FFMPEG_PATH || "ffmpeg", [
    "-y",
    // At the crop's rate: a still input defaults to 25 fps and overlay would then drop crop frames.
    "-loop", "1", "-framerate", String(fps), "-i", path.join(dir, "story.png"),
    "-i", path.join(dir, "crop.mp4"),
    "-ss", String(start / det.fps), "-to", String(end / det.fps), "-i", absPath(clip.file),
    "-filter_complex", `[0:v]scale=1080:1920:flags=lanczos[bg];[1:v]scale=${slot.w}:${slot.h}:flags=lanczos[c];[bg][c]overlay=${slot.x}:${slot.y}:shortest=1,fps=${fps},format=yuv420p[v]`,
    "-map", "[v]", "-map", "2:a?",
    // aq-mode 3 spends bits on dark flat areas: without it the night grounds band and block.
    "-c:v", "libx264", "-profile:v", "high", "-crf", "14", "-preset", "slow", "-x264-params", "aq-mode=3",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
    out,
  ], { maxBuffer: 1 << 24 });

  const player = getPlayer(edit.player_id);
  const name = `${slug(`${player?.first_name ?? ""} ${player?.last_name ?? ""}`)}-${edit.content.clip?.kind === "assist" ? "assistencia" : "golo"}-${clip.id.slice(0, 5).toLowerCase()}.mp4`;
  let savedTo = "";
  try {
    const dl = path.join(os.homedir(), "Downloads", "GameDay");
    await fs.mkdir(dl, { recursive: true });
    await fs.copyFile(out, path.join(dl, name));
    savedTo = `Transferências/GameDay/${name}`;
  } catch (e) {
    console.error("could not save the video story in Downloads", e);
  }
  return { file: out, savedTo, name };
}

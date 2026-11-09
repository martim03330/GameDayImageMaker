import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import * as repo from "@/lib/repo";
import { defaultContent, defaultStyle } from "@/lib/render-data";
import { absPath, saveUpload } from "@/lib/storage";
import type { TemplateParams } from "@/lib/types";
import { cameraPath, type Anchor, type Det } from "./path";

/**
 * Goal / assist clips: the uploaded video, its ball detections and the user's corrections. Detection runs
 * in services/balltrack (YOLO, ~1 min per 15 s clip) through ONE global queue — like the photo cutouts —
 * so several uploads never run at once and overload the Mac. Files live in data/files/clips/<id>/.
 */

export type Clip = {
  id: string;
  player_id: string;
  edit_id: string | null;
  file: string;
  status: string; // "a seguir" | "pronto" | "erro: …"
  progress: string;
  anchors: string;
  zoom: number;
  trim_start: number;
  trim_end: number | null;
  created_at: string;
};

const SERVICE = path.join(process.cwd(), "services", "balltrack");
const PYTHON = path.join(SERVICE, ".venv", "bin", "python");

export const clipDir = (id: string) => path.posix.join("clips", id);

export function getClip(id: string): Clip | null {
  return (db().prepare("SELECT * FROM clips WHERE id = ?").get(id) as Clip | undefined) ?? null;
}

export function clipAnchors(c: Clip): Anchor[] {
  try {
    return JSON.parse(c.anchors) as Anchor[];
  } catch {
    return [];
  }
}

/** The cached detections (null until tracking finished). */
export async function clipDet(id: string): Promise<Det | null> {
  try {
    return JSON.parse(await fs.readFile(absPath(path.posix.join(clipDir(id), "det.json")), "utf8")) as Det;
  } catch {
    return null;
  }
}

/** The camera path with the clip's current anchors. */
export async function clipPath(id: string) {
  const c = getClip(id);
  const det = await clipDet(id);
  if (!c || !det) return null;
  return { det: { fps: det.fps, W: det.W, H: det.H, n: det.n, shots: det.shots }, ...cameraPath(det, clipAnchors(c), c.zoom) };
}

const queue = globalThis as unknown as { __clipQueue?: Promise<unknown> };

function enqueueDetect(id: string) {
  const job = async () => {
    const c = getClip(id);
    if (!c) return;
    db().prepare("UPDATE clips SET status = 'a seguir', progress = '' WHERE id = ?").run(id);
    await new Promise<void>((resolve) => {
      const proc = execFile(
        PYTHON,
        [path.join(SERVICE, "track.py"), "detect", absPath(c.file), absPath(path.posix.join(clipDir(id), "det.json")), absPath(path.posix.join(clipDir(id), "poster.jpg"))],
        { maxBuffer: 1 << 24 },
        (err, _out, stderr) => {
          if (err) {
            console.error("[clips] detect", id, stderr || err);
            db().prepare("UPDATE clips SET status = ? WHERE id = ?").run(`erro: ${(stderr || err.message).split("\n").filter(Boolean).pop()?.slice(0, 160)}`, id);
          } else db().prepare("UPDATE clips SET status = 'pronto', progress = '' WHERE id = ?").run(id);
          resolve();
        },
      );
      proc.stdout?.on("data", (d: Buffer) => {
        const m = /progress (\d+)\/(\d+)/.exec(d.toString().trim().split("\n").pop() ?? "");
        if (m) db().prepare("UPDATE clips SET progress = ? WHERE id = ?").run(`${m[1]}/${m[2]}`, id);
      });
    });
  };
  const next = (queue.__clipQueue ?? Promise.resolve()).then(job, job);
  queue.__clipQueue = next.catch(() => undefined);
}

/** Saves the video, creates the clip and its story edit (look "clipnight", club colours) and starts tracking. */
export async function createClip(playerId: string, file: File, kind: "goal" | "assist", score: string): Promise<string> {
  const player = repo.getPlayer(playerId);
  if (!player) throw new Error("Jogador não existe");
  const id = repo.newId();
  const rel = await saveUpload(file, clipDir(id));
  db().prepare("INSERT INTO clips (id, player_id, file) VALUES (?, ?, ?)").run(id, playerId, rel);
  const params: TemplateParams = { ...defaultStyle(repo.getClub(player.club_id)), templateId: "clipnight", clipId: id };
  const content = { ...defaultContent(player, "clip"), kicker: kind === "goal" ? "GOAL" : "ASSIST", clip: { kind, score: score.trim() } };
  const editId = repo.saveEdit({ player_id: playerId, post_type: "clip", photo_id: null, params, content });
  db().prepare("UPDATE clips SET edit_id = ? WHERE id = ?").run(editId, id);
  enqueueDetect(id);
  return editId;
}

/** Saves the user's corrections (clamped) and returns the recomputed path. */
export async function saveClipSettings(id: string, patch: { anchors?: Anchor[]; zoom?: number; trim_start?: number; trim_end?: number | null }) {
  const c = getClip(id);
  if (!c) throw new Error("Vídeo não existe");
  const det = await clipDet(id);
  const duration = det ? det.n / det.fps : Infinity;
  const zoom = Math.min(2.5, Math.max(1, patch.zoom ?? c.zoom));
  let start = Math.max(0, Math.min(patch.trim_start ?? c.trim_start, duration));
  let end = patch.trim_end === undefined ? c.trim_end : patch.trim_end;
  if (end !== null) end = Math.max(0, Math.min(end, duration));
  if (end !== null && end <= start + 0.5) [start, end] = [Math.max(0, end - 0.5), end];
  const anchors = (patch.anchors ?? clipAnchors(c))
    .filter((a) => Number.isFinite(a.f) && Number.isFinite(a.x) && Number.isFinite(a.y))
    .map((a) => ({ f: Math.round(a.f), x: a.x, y: a.y }));
  db().prepare("UPDATE clips SET anchors = ?, zoom = ?, trim_start = ?, trim_end = ? WHERE id = ?").run(JSON.stringify(anchors), zoom, start, end, id);
  return clipPath(id);
}

export function clipForEdit(editId: string): Clip | null {
  const e = repo.getEdit(editId);
  const id = e?.params.clipId;
  return id ? getClip(id) : null;
}

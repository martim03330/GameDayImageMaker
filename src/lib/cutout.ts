import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { promisify } from "node:util";
import { getClub, getPhoto, getPlayer, listPhotos, setPhotoCutout, setPhotoFile } from "./repo";
import type { PhotoMeta } from "./types";
import { absPath } from "./storage";

const run = promisify(execFile);

const PYTHON = path.join(process.cwd(), "services/cutout/.venv/bin/python");
const SCRIPT = path.join(process.cwd(), "services/cutout/cutout.py");
const POSE = path.join(process.cwd(), "services/cutout/pose.py");
const FULLUP = path.join(process.cwd(), "services/cutout/fullup.py");
const REPAIR = path.join(process.cwd(), "services/cutout/repair.py");
const SEPARATE = path.join(process.cwd(), "services/cutout/separate.py");
const MODEL = process.env.CUTOUT_MODEL || "birefnet-portrait";
const CERTS = path.join(process.cwd(), "services/cutout/.venv/lib/python3.12/site-packages/certifi/cacert.pem");

/**
 * One photo job at a time, for the whole server. Each job loads several big models (BiRefNet ~1 GB,
 * Real-ESRGAN on the GPU, SAM, RTMPose): uploading six photos used to start six of them at once and
 * froze the Mac. Kept on globalThis so dev hot reloads don't start a second queue next to the first.
 */
const queue = globalThis as unknown as { __photoQueue?: Promise<unknown> };
function serial<T>(job: () => Promise<T>): Promise<T> {
  const next = (queue.__photoQueue ?? Promise.resolve()).then(job, job);
  queue.__photoQueue = next.catch(() => undefined);
  return next;
}

/**
 * The cutout's matte with its holes repaired by SAM (services/cutout/repair.py), as a white RGBA PNG whose
 * alpha is the matte — a proposal for the touch-up canvas (components/CutoutFixer), not saved. Queued with
 * the other photo jobs: SAM is one of the big models.
 */
export function repairMask(cutoutRel: string): Promise<Buffer> {
  return serial(async () => {
    const out = path.join(os.tmpdir(), `repair_${Date.now().toString(36)}.png`);
    try {
      await run(PYTHON, [REPAIR, absPath(cutoutRel), out], { timeout: 5 * 60_000, env: { ...process.env, SSL_CERT_FILE: CERTS } });
      return await fs.readFile(out);
    } finally {
      await fs.rm(out, { force: true }).catch(() => null);
    }
  });
}

/**
 * The cutout's matte with only the clicked player left (services/cutout/separate.py): `keep` are clicks on
 * him, `drop` on the team-mates / opponents stuck to him, in the cutout's pixels. Same white RGBA PNG
 * proposal as repairMask, nothing saved.
 */
export function separateMask(cutoutRel: string, points: { keep: number[][]; drop: number[][] }): Promise<Buffer> {
  return serial(async () => {
    const base = path.join(os.tmpdir(), `separate_${Date.now().toString(36)}`);
    try {
      await fs.writeFile(`${base}.json`, JSON.stringify(points));
      await run(PYTHON, [SEPARATE, absPath(cutoutRel), `${base}.json`, `${base}.png`], { timeout: 5 * 60_000, env: { ...process.env, SSL_CERT_FILE: CERTS } });
      return await fs.readFile(`${base}.png`);
    } finally {
      await fs.rm(`${base}.json`, { force: true }).catch(() => null);
      await fs.rm(`${base}.png`, { force: true }).catch(() => null);
    }
  });
}

/** Runs background removal for a stored photo and records the result (queued: one photo at a time). */
export async function cutoutPhoto(photoId: string): Promise<void> {
  if (!getPhoto(photoId)) return;
  setPhotoCutout(photoId, "pending");
  return serial(() => runCutout(photoId));
}

async function runCutout(photoId: string): Promise<void> {
  const photo = getPhoto(photoId);
  if (!photo) return;
  // A new name on every run: browsers keep /api/files images forever (immutable cache), so a redone
  // cutout under the same name kept showing the old one (e.g. without the ball).
  const rel = photo.file.replace(/\.[^.]+$/, "") + `_cutout_${Date.now().toString(36)}.png`;
  const previous = photo.cutout;
  try {
    const { stdout } = await run(PYTHON, [SCRIPT, absPath(photo.file), absPath(rel), MODEL], {
      timeout: 15 * 60_000,
      // The pose models are downloaded on first use; Python needs certifi's certificates for that on macOS.
      env: { ...process.env, SSL_CERT_FILE: CERTS, ...(await playerHints(photo.player_id, photoId)) },
    });
    const line = stdout.trim().split("\n").pop() ?? "";
    setPhotoCutout(photoId, "done", rel, line.startsWith("{") ? line : null);
    // The old file is no longer referenced by this photo (edits point at the photo, not the file).
    if (previous && previous !== rel) await fs.rm(absPath(previous), { force: true }).catch(() => null);
  } catch (err) {
    console.error("cutout failed", err);
    setPhotoCutout(photoId, "error");
    return;
  }
  await upscaleFull(photo.file);
}

/**
 * The whole photo AI-upscaled, for the natural looks (api/natframe), which show his real surroundings
 * around the cutout: the cutout was upscaled, the grass and stands around him only stretched. Kept next
 * to the photo as <name>_full.jpg; only made for small photos (big ones are sharp enough as they are).
 */
export const fullUpOf = (file: string) => file.replace(/\.[^.]+$/, "") + "_full.jpg";

async function upscaleFull(file: string): Promise<void> {
  try {
    await run(PYTHON, [FULLUP, "full", absPath(file), absPath(fullUpOf(file))], { timeout: 15 * 60_000 });
  } catch (err) {
    console.error("full photo upscale failed", file, err);
  }
}

/** Queues the whole-photo upscale for a photo whose cutout is already done (backfill of older photos). */
export function upscaleFullPhoto(photoId: string): Promise<void> {
  return serial(async () => {
    const p = getPhoto(photoId);
    if (!p) return;
    await fs.access(absPath(fullUpOf(p.file))).then(
      () => undefined,
      () => upscaleFull(p.file),
    );
  });
}

/**
 * "Melhorar com IA" for a big but soft photo: brought down to where its real detail is, then rebuilt 4x by
 * Real-ESRGAN (services/cutout/fullup.py restore). The photo then points at the new file (the original
 * stays on disk) and is cut out again from it.
 */
export function enhancePhoto(photoId: string): Promise<void> {
  if (!getPhoto(photoId)) return Promise.resolve();
  setPhotoCutout(photoId, "pending");
  return serial(async () => {
    const p = getPhoto(photoId);
    if (!p) return;
    const rel = p.file.replace(/(_ia_[a-z0-9]+)?\.[^.]+$/, "") + `_ia_${Date.now().toString(36)}.jpg`;
    try {
      await run(PYTHON, [FULLUP, "restore", absPath(p.file), absPath(rel)], { timeout: 15 * 60_000 });
      setPhotoFile(photoId, rel);
    } catch (err) {
      console.error("photo enhance failed", err);
    }
    await runCutout(photoId);
  });
}

/**
 * How the cutout step recognises our player in a shot with team-mates and opponents: his face in his
 * other (clear, single-person) photos, and his club colours.
 */
async function playerHints(playerId: string | null, photoId: string): Promise<Record<string, string>> {
  if (!playerId) return {};
  const refs = listPhotos(playerId)
    .filter((p) => p.id !== photoId && p.kind === "player" && p.cutout_status === "done" && p.meta)
    .map((p) => ({ p, m: JSON.parse(p.meta!) as PhotoMeta }))
    .filter(({ m }) => (m.face_px ?? 0) >= 80 && (m.faces ?? 1) === 1)
    .sort((a, b) => (b.m.face_px ?? 0) - (a.m.face_px ?? 0))
    .slice(0, 4)
    .map(({ p }) => absPath(p.file));
  // His zerozero / Transfermarkt portrait is always a reference too: a new client's first photos come in
  // together, with no earlier photo of his face — and a shot with two players then fell back to the kit
  // colours, which picked the wrong man (Massil Adjaoudi, 23/10).
  const portrait = await portraitFile(playerId);
  if (portrait) refs.push(portrait);
  const club = getClub(getPlayer(playerId)?.club_id);
  // Shirt colours measured in his own photos beat the club's two colours: a club listed as
  // "black and white" also matches an opponent in white, but his kit's real accent does not.
  const worn = listPhotos(playerId)
    .filter((p) => p.id !== photoId && p.kind === "player" && p.meta)
    .flatMap((p) => (JSON.parse(p.meta!) as PhotoMeta).kit ?? [])
    .filter((c) => /^#[0-9a-f]{6}$/i.test(c));
  // Once his own photos have been measured, they alone describe the kit; the club's two colours are
  // only a starting point (and "white" there matches half the opponents in the league).
  const kit = (worn.length ? worn : club ? [club.primary_color, club.secondary_color] : []).slice(0, 8);
  return { PLAYER_REFS: refs.join("|"), PLAYER_KIT: kit.join(",") };
}

/** His profile portrait (photo_url) as a local file, downloaded once into data/files/refs/. */
async function portraitFile(playerId: string): Promise<string | null> {
  const url = getPlayer(playerId)?.photo_url;
  if (!url) return null;
  const rel = path.posix.join("refs", `${playerId}.jpg`);
  try {
    await fs.access(absPath(rel));
    return absPath(rel);
  } catch {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) return null;
      await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
      await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: "#ffffff" }).jpeg({ quality: 95 }).toFile(absPath(rel));
      return absPath(rel);
    } catch {
      return null;
    }
  }
}

/**
 * Body pose of the player in any picture, used for the reference edits the user sends: the app then
 * offers photos in the same pose as the edits they like.
 */
export function detectPose(absFile: string): Promise<{ pose: string; facing: string } | null> {
  return serial(() => runPose(absFile));
}

async function runPose(absFile: string): Promise<{ pose: string; facing: string } | null> {
  try {
    const { stdout } = await run(PYTHON, [POSE, absFile], { timeout: 5 * 60_000, env: { ...process.env, SSL_CERT_FILE: CERTS } });
    const line = stdout.trim().split("\n").filter((l) => l.startsWith("{")).pop();
    const out = line ? (JSON.parse(line) as { pose?: string; facing?: string }) : null;
    return out?.pose && out.pose !== "unknown" ? { pose: out.pose, facing: out.facing ?? "front" } : null;
  } catch (e) {
    console.error("pose failed", e);
    return null;
  }
}

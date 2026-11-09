import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { db } from "./db";
import { getSettings, HIDDEN_ROLES_SQL, newId } from "./repo";
import { absPath, fileUrl, FILES_DIR } from "./storage";

/**
 * Club scenery library, generated on this Mac (FLUX, services/imagegen): stands, floodlit nights,
 * tunnels, smoke… Only scenery, never people. A background worker keeps each player's club stocked:
 * new clubs first, then a few more whenever the Mac is idle, so edits keep finding backdrops they
 * haven't used yet.
 */

const PY = path.join(process.cwd(), "services/imagegen/.venv/bin/python");
const SCRIPT = path.join(process.cwd(), "services/imagegen/backgrounds.py");

/** Scenes that show a stadium (used where looks want "the stadium"); the rest are pure backdrops. */
const STADIUM_KINDS = ["stands", "night", "tunnel", "pitch", "roof", "rain"] as const;
const BACKDROP_KINDS = ["smoke", "texture"] as const;
export type SceneKind = (typeof STADIUM_KINDS)[number] | (typeof BACKDROP_KINDS)[number];

/** Library size each club is topped up to, and how many images one background job makes. */
export const TARGET_PER_CLUB = 28;
const FIRST_BATCH = 12;
const TOP_UP_BATCH = 4;
const CHUNK = 3;

const BASES: Record<SceneKind, string> = {
  stands: "empty football stadium stands seen from pitch level, rows of seats and concrete steps, floodlight towers",
  night: "football stadium at night seen from the pitch, bright floodlights, light haze in the air",
  tunnel: "players tunnel of a football stadium leading out to the floodlit pitch, concrete walls, symmetrical",
  pitch: "football pitch grass at ground level with white line markings, empty stadium blurred in the background",
  roof: "football stadium roof structure and floodlight towers against the sky, low angle, architectural",
  rain: "empty football stadium in heavy rain, wet seats, puddles and reflections on the pitch, floodlights",
  smoke: "thick dramatic smoke and haze on a black background lit from behind by stage lights, sparks",
  texture: "abstract grunge concrete wall texture, scratches and paint marks, raking light",
};
const TIMES = ["at dusk under a dramatic sunset sky", "at night", "on an overcast afternoon", "in thick fog", "at golden hour", "at blue hour", "in harsh midday sun with deep shadows"];
const CAMERAS = ["wide angle", "low angle", "telephoto lens, shallow depth of field", "symmetrical centred composition", "high angle from the top of the stands"];
const MOODS = ["{colour} coloured light", "black and white, high contrast, film grain", "desaturated cinematic grade with {colour} accents", "{colour} and white colour palette"];
const SUFFIX = "documentary sports photography, highly detailed, no people, no text, no letters, no logos, no signs";

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

/** A colour word the image model understands, from a club colour. */
export function colourName(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 0.15) return max > 0.7 ? "white" : max < 0.25 ? "cold white" : "silver";
  const d = max - min;
  const h = (max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  if (h < 15 || h >= 340) return "deep red";
  if (h < 40) return "orange";
  if (h < 65) return "golden yellow";
  if (h < 160) return "green";
  if (h < 200) return "teal";
  if (h < 255) return "royal blue";
  if (h < 290) return "purple";
  return "magenta";
}

/** A new, varied prompt: scene + time/weather + camera + colour mood. */
function promptFor(kind: SceneKind, colour: string): string {
  const parts = [BASES[kind]];
  if (kind !== "smoke" && kind !== "texture") parts.push(kind === "night" ? "" : pick(TIMES), pick(CAMERAS));
  parts.push(kind === "smoke" || kind === "texture" ? `${colour} light` : pick(MOODS).replace("{colour}", colour), SUFFIX);
  return parts.filter(Boolean).join(", ");
}

/** Which kinds a batch covers: every kind in turn, starting where the club has fewest. */
function kindsFor(clubId: string, count: number): SceneKind[] {
  const have = db().prepare("SELECT kind, COUNT(*) n FROM scenes WHERE club_id = ? GROUP BY kind").all(clubId) as { kind: string; n: number }[];
  const n = (k: string) => have.find((h) => h.kind === k)?.n ?? 0;
  // Stadium scenes are used by more looks: roughly three of them for each backdrop.
  const all: SceneKind[] = [...STADIUM_KINDS, ...STADIUM_KINDS, ...BACKDROP_KINDS] as SceneKind[];
  const sorted = [...new Set(all)].sort((a, b) => n(a) - n(b));
  const out: SceneKind[] = [];
  for (let i = 0; out.length < count; i++) out.push(sorted[i % sorted.length]);
  return out;
}

export type Scene = { id: string; club_id: string; kind: SceneKind; file: string; prompt: string; created_at: string };

export function listScenes(clubId: string): Scene[] {
  return db().prepare("SELECT * FROM scenes WHERE club_id = ? ORDER BY created_at DESC").all(clubId) as Scene[];
}

/**
 * The club's scenes for one player: the ones he hasn't used (or used longest ago) first, so looks
 * that take the first stadium photo and looks that pick at random both land on fresh backdrops.
 */
export function scenesForPlayer(clubId: string, playerId: string | null): { stadium: string[]; backdrops: string[] } {
  const rows = db()
    .prepare(
      `SELECT s.kind, s.file, MAX(u.used_at) last FROM scenes s
       LEFT JOIN scene_uses u ON u.file = s.file AND u.player_id = ?
       WHERE s.club_id = ? GROUP BY s.id`,
    )
    .all(playerId ?? "", clubId) as { kind: string; file: string; last: string | null }[];
  const order = rows
    .map((r) => ({ ...r, k: r.last ? Date.parse(r.last) : -Math.random() * 1e6 }))
    .sort((a, b) => a.k - b.k);
  const url = (f: string) => fileUrl(f)!;
  return {
    stadium: order.filter((r) => (STADIUM_KINDS as readonly string[]).includes(r.kind)).map((r) => url(r.file)),
    backdrops: order.filter((r) => (BACKDROP_KINDS as readonly string[]).includes(r.kind)).map((r) => url(r.file)),
  };
}

/** Called after an export: the generated backdrops that edit showed now count as used by the player. */
export function recordSceneUses(playerId: string, urls: string[]) {
  const files = [...new Set(urls.map((u) => decodeURIComponent(u).match(/\/api\/files\/(generated\/.+)$/)?.[1]).filter(Boolean))] as string[];
  const ins = db().prepare("INSERT INTO scene_uses (player_id, file) VALUES (?, ?)");
  for (const f of files) ins.run(playerId, f);
}

export type SceneJob = { id: string; club_id: string; count: number; priority: number; edit_id: string | null; status: string; error: string | null; result: string | null };

/** Queues a batch. Club top-ups are merged (one waiting batch per club); an edit's own scene always gets its job. */
export function enqueueScenes(clubId: string, count: number, priority = 0, editId: string | null = null): string {
  if (!editId) {
    const waiting = db().prepare("SELECT id FROM scene_jobs WHERE club_id = ? AND status = 'queued' AND edit_id IS NULL").get(clubId) as { id: string } | undefined;
    if (waiting) {
      db().prepare("UPDATE scene_jobs SET count = MAX(count, ?), priority = MAX(priority, ?) WHERE id = ?").run(count, priority, waiting.id);
      return waiting.id;
    }
  }
  const id = newId();
  db().prepare("INSERT INTO scene_jobs (id, club_id, count, priority, edit_id) VALUES (?, ?, ?, ?, ?)").run(id, clubId, count, priority, editId);
  kick();
  return id;
}

export function getSceneJob(id: string): SceneJob | null {
  return (db().prepare("SELECT * FROM scene_jobs WHERE id = ?").get(id) as SceneJob) ?? null;
}

export function sceneQueue(): (SceneJob & { club: string })[] {
  return db()
    .prepare("SELECT j.*, c.name club FROM scene_jobs j JOIN clubs c ON c.id = j.club_id WHERE j.status IN ('queued', 'running') ORDER BY j.status = 'running' DESC, j.priority DESC, j.created_at")
    .all() as (SceneJob & { club: string })[];
}

const g = globalThis as unknown as { sceneWorker?: { busy: boolean; timer?: NodeJS.Timeout }; exportsRunning?: number };
const worker = (g.sceneWorker ??= { busy: false });

/** Exports mark themselves busy so scenery generation never slows a download down. */
export function exportStarted() {
  g.exportsRunning = (g.exportsRunning ?? 0) + 1;
}
export function exportFinished() {
  g.exportsRunning = Math.max(0, (g.exportsRunning ?? 1) - 1);
}

/** Clubs with a player of ours and too few scenes get a batch: new clubs right away, others when idle. */
function planTopUps() {
  if (getSettings().scenes_paused === "1") return;
  const clubs = db()
    .prepare(
      `SELECT c.id, (SELECT COUNT(*) FROM scenes s WHERE s.club_id = c.id) n FROM clubs c
       WHERE c.id IN (SELECT club_id FROM players WHERE club_id IS NOT NULL AND role NOT IN ${HIDDEN_ROLES_SQL}) ORDER BY n`,
    )
    .all() as { id: string; n: number }[];
  const busy = new Set(sceneQueue().map((j) => j.club_id));
  for (const c of clubs) {
    if (c.n === 0 && !busy.has(c.id)) enqueueScenes(c.id, FIRST_BATCH, 5);
  }
  const idle = os.loadavg()[0] < os.cpus().length * 0.35 && !(g.exportsRunning ?? 0);
  const low = clubs.find((c) => c.n > 0 && c.n < TARGET_PER_CLUB);
  if (idle && low && !sceneQueue().length) enqueueScenes(low.id, TOP_UP_BATCH, 0);
}

function kick() {
  if (!worker.busy) setTimeout(() => void tick(), 500);
}

async function tick() {
  if (worker.busy) return;
  // Paused in Definições: the generator is the one job that really heats the Mac up.
  if (getSettings().scenes_paused === "1") return;
  // Wait for exports to finish: the GPU is shared.
  if (g.exportsRunning) return;
  const job = db()
    .prepare("SELECT * FROM scene_jobs WHERE status = 'queued' ORDER BY priority DESC, created_at LIMIT 1")
    .get() as SceneJob | undefined;
  if (!job) return;
  worker.busy = true;
  db().prepare("UPDATE scene_jobs SET status = 'running' WHERE id = ?").run(job.id);
  try {
    // Big batches run in chunks of three, so a scene asked for an edit never waits behind a whole batch.
    const chunk = job.edit_id ? 1 : Math.min(job.count, CHUNK);
    const files = await runJob({ ...job, count: chunk });
    const all = [...(job.result ? (JSON.parse(job.result) as string[]) : []), ...files];
    if (!job.edit_id && job.count > chunk) {
      db().prepare("UPDATE scene_jobs SET status = 'queued', count = ?, result = ? WHERE id = ?").run(job.count - chunk, JSON.stringify(all), job.id);
      return;
    }
    db().prepare("UPDATE scene_jobs SET status = 'done', result = ?, done_at = datetime('now') WHERE id = ?").run(JSON.stringify(all), job.id);
    // A scene made for one edit goes straight into it.
    if (job.edit_id && files[0]) {
      const row = db().prepare("SELECT params FROM edits WHERE id = ?").get(job.edit_id) as { params: string } | undefined;
      if (row) db().prepare("UPDATE edits SET params = ? WHERE id = ?").run(JSON.stringify({ ...JSON.parse(row.params), scene: fileUrl(files[0]) }), job.edit_id);
    }
  } catch (e) {
    console.error("[scenes]", e);
    db().prepare("UPDATE scene_jobs SET status = 'error', error = ?, done_at = datetime('now') WHERE id = ?").run(String(e).slice(0, 500), job.id);
  } finally {
    worker.busy = false;
    kick();
  }
}

async function runJob(job: SceneJob): Promise<string[]> {
  const club = db().prepare("SELECT id, primary_color, secondary_color FROM clubs WHERE id = ?").get(job.club_id) as { id: string; primary_color: string; secondary_color: string };
  const neutral = (h: string) => /^#(000000|ffffff)$/i.test(h);
  const colour = colourName(neutral(club.primary_color) ? club.secondary_color : club.primary_color);
  // A scene for one edit: a stadium scene, it will be the edit's main backdrop.
  const kinds = job.edit_id ? [pick(STADIUM_KINDS)] : kindsFor(club.id, job.count);
  const items = kinds.map((kind) => ({ kind, prompt: promptFor(kind, colour), seed: Math.floor(Math.random() * 1e9) }));
  const rel = path.posix.join("generated", club.id);
  const tmp = path.join(FILES_DIR, rel, `raw-${job.id}`);
  await fs.mkdir(tmp, { recursive: true });
  const spec = path.join(tmp, "job.json");
  await fs.writeFile(spec, JSON.stringify({ out: tmp, items }));
  const done: string[] = [];
  const ins = db().prepare("INSERT INTO scenes (id, club_id, kind, file, prompt) VALUES (?, ?, ?, ?, ?)");
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(PY, [SCRIPT, spec], { env: { ...process.env, PYTHONUNBUFFERED: "1" } });
      let buf = "";
      let chain = Promise.resolve();
      proc.stdout.on("data", (d: Buffer) => {
        buf += d.toString();
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const [kind, file] = line.trim().split(" ");
          if (!file) continue;
          // Each image is stored as soon as it exists: a stopped job keeps what it made.
          chain = chain.then(async () => {
            const out = path.posix.join(rel, path.basename(file).replace(/\.png$/, ".jpg"));
            await sharp(file).jpeg({ quality: 92, mozjpeg: true }).toFile(absPath(out));
            const item = items.find((i) => file.includes(String(i.seed)));
            ins.run(newId(), club.id, kind, out, item?.prompt ?? "");
            done.push(out);
          });
        }
      });
      let err = "";
      proc.stderr.on("data", (d: Buffer) => (err = (err + d.toString()).slice(-2000)));
      proc.on("error", reject);
      proc.on("close", (code) => chain.then(() => (code === 0 || done.length ? resolve() : reject(new Error(`gerador saiu com ${code}: ${err}`)))));
    });
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
  return done;
}

/** Starts the worker: checks the queue and the libraries every two minutes. */
export function startSceneWorker() {
  if (worker.timer) return;
  // A job left "running" by a restart is simply redone.
  db().prepare("UPDATE scene_jobs SET status = 'queued' WHERE status = 'running'").run();
  importLooseScenes();
  const loop = () => {
    try {
      planTopUps();
    } catch (e) {
      console.error("[scenes]", e);
    }
    void tick();
  };
  setTimeout(loop, 30_000);
  worker.timer = setInterval(loop, 2 * 60 * 1000);
}

/** Scenes made by hand before this library existed (generated/<club>/*.jpg) join the table once. */
export function importLooseScenes() {
  const clubs = db().prepare("SELECT id, stadium_images, backdrops FROM clubs").all() as { id: string; stadium_images: string | null; backdrops: string | null }[];
  const known = new Set((db().prepare("SELECT file FROM scenes").all() as { file: string }[]).map((r) => r.file));
  const ins = db().prepare("INSERT INTO scenes (id, club_id, kind, file) VALUES (?, ?, ?, ?)");
  for (const c of clubs) {
    const lists = [c.stadium_images, c.backdrops].map((j) => (j ? (JSON.parse(j) as string[]) : []));
    for (const f of lists.flat().filter((f) => f.startsWith("generated/") && !known.has(f))) {
      ins.run(newId(), c.id, path.basename(f).split("_")[0], f);
      known.add(f);
    }
    // The generated files now live in the scenes table only.
    db()
      .prepare("UPDATE clubs SET stadium_images = ?, backdrops = ? WHERE id = ?")
      .run(JSON.stringify(lists[0].filter((f) => !f.startsWith("generated/"))), JSON.stringify(lists[1].filter((f) => !f.startsWith("generated/"))), c.id);
  }
}

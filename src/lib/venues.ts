import fs from "node:fs";
import sharp from "sharp";
import { storeRemoteImage } from "./crest";
import { db } from "./db";
import { fetchImage, fetchStadiumPhotoCandidates, fetchZerozeroVenue, zzGameId } from "./sources";
import { absPath, fileUrl } from "./storage";

const log = (...a: unknown[]) => console.log("[venues]", ...a);

type VenueRow = { id: string; name: string; images: string; checked_at: string | null };

/** Grounds with no good photo are looked up again after this long (someone may upload one to Commons). */
const RECHECK_MS = 45 * 86400_000;
const KEEP = 4;

/**
 * Is this a photo from inside the ground (stands behind a pitch), sharp enough for a 2160px edit?
 * Grass must fill ≥ 20% of the lower half: exteriors, car parks, facades and dressing rooms fail it.
 * And that green must be smooth like a pitch: trees in aerial town views, weeds on old terraces and
 * people standing on the grass make it rough (≥ 6 against ≤ 4.5 for real pitches, measured on 27
 * Commons photos). Returns a ranking score, or null to reject.
 */
export async function backdropScore(buf: Buffer): Promise<number | null> {
  const { data, info } = await sharp(buf).resize(192, 128, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const isGrass = (x: number, y: number) => {
    const i = (y * W + x) * 3;
    const [r, g, b] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    const mx = Math.max(r, g, b);
    const d = mx - Math.min(r, g, b);
    if (mx !== g || !d || mx < 0.2 || d / mx < 0.22) return false;
    const hue = 60 * ((b - r) / d) + 120;
    return hue > 65 && hue < 165;
  };
  const luma = (x: number, y: number) => {
    const i = (y * W + x) * 3;
    return 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
  };
  let grass = 0;
  let n = 0;
  let rough = 0;
  let pairs = 0;
  for (let y = Math.floor(info.height * 0.45); y < info.height; y++) {
    for (let x = 0; x < W; x++) {
      n++;
      if (!isGrass(x, y)) continue;
      grass++;
      if (x + 1 < W && isGrass(x + 1, y)) {
        rough += Math.abs(luma(x, y) - luma(x + 1, y));
        pairs++;
      }
    }
  }
  const pitch = grass / n;
  if (pitch < 0.2 || rough / Math.max(1, pairs) > 5) return null;
  // Detail: variance of the Laplacian at 960px (hazy / soft photos stay below ~150).
  const lap = await sharp(buf).resize(960).greyscale().convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] }).raw().toBuffer();
  let mean = 0;
  for (const v of lap) mean += v;
  mean /= lap.length;
  let variance = 0;
  for (const v of lap) variance += (v - mean) ** 2;
  variance /= lap.length;
  if (variance < 150) return null;
  return pitch + Math.min(variance, 1500) / 3000;
}

/** Downloads the stadium's Commons photos and keeps the best few that pass `backdropScore`. */
async function findPhotos(name: string): Promise<string[]> {
  const candidates = (await fetchStadiumPhotoCandidates(name)).slice(0, 30);
  const scored: { buf: Buffer; score: number }[] = [];
  for (const c of candidates) {
    try {
      const buf = await fetchImage(c.url);
      const score = await backdropScore(buf);
      if (score != null) scored.push({ buf, score });
    } catch (e) {
      log("photo failed", c.title, e instanceof Error ? e.message : e);
    }
  }
  scored.sort((a, b) => b.score - a.score);
  const stored: string[] = [];
  for (const s of scored.slice(0, KEEP)) stored.push(await storeRemoteImage(s.buf, "venues", "jpeg"));
  return stored;
}

function getVenue(id: string): VenueRow | undefined {
  return db().prepare("SELECT * FROM venues WHERE id = ?").get(id) as VenueRow | undefined;
}

/**
 * Finds where a game is played (from its zerozero page) and real photos of that ground, once per
 * game and once per ground. Grounds without a good photo simply keep none: the looks then use the
 * generated scenes as before. `photos: false` only finds the ground's name (fast: one page).
 */
export async function resolveGameVenue(matchUrl: string | null | undefined, { photos = true } = {}): Promise<void> {
  const gameId = zzGameId(matchUrl);
  if (!gameId) return;
  const conn = db();
  let venueId = (conn.prepare("SELECT venue_id FROM game_venues WHERE game_id = ?").get(gameId) as { venue_id: string } | undefined)?.venue_id;
  if (!venueId) {
    const v = await fetchZerozeroVenue(matchUrl!).catch(() => null);
    if (!v) return;
    conn.prepare("INSERT INTO venues (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name").run(v.id, v.name);
    conn.prepare("INSERT OR REPLACE INTO game_venues (game_id, venue_id) VALUES (?, ?)").run(gameId, v.id);
    venueId = v.id;
  }
  if (!photos) return;
  const venue = getVenue(venueId)!;
  const images = JSON.parse(venue.images) as string[];
  const due = !venue.checked_at || (!images.length && Date.now() - new Date(venue.checked_at).getTime() > RECHECK_MS);
  if (!due) return;
  // A network error leaves the ground unchecked, so the next sync tries again.
  const found = await findPhotos(venue.name);
  conn.prepare("UPDATE venues SET images = ?, checked_at = ? WHERE id = ?").run(JSON.stringify(found), new Date().toISOString(), venueId);
  log(`${venue.name}: ${found.length} foto(s) boa(s)`);
}

export type RenderVenue = { name: string; images: string[] };

/** Ground and photo URLs for each zerozero game id the player has (played or upcoming). */
export function venuesForGames(gameIds: (string | null)[]): Record<string, RenderVenue> {
  const ids = [...new Set(gameIds.filter((g): g is string => !!g))];
  if (!ids.length) return {};
  const rows = db()
    .prepare(`SELECT g.game_id, v.name, v.images FROM game_venues g JOIN venues v ON v.id = g.venue_id WHERE g.game_id IN (${ids.map(() => "?").join(",")})`)
    .all(...ids) as { game_id: string; name: string; images: string }[];
  return Object.fromEntries(
    rows.map((r) => [
      r.game_id,
      { name: r.name, images: (JSON.parse(r.images) as string[]).filter((f) => fs.existsSync(absPath(f))).map((f) => fileUrl(f)!) },
    ]),
  );
}

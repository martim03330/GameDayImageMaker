import { storeRemoteImage } from "./crest";
import { db } from "./db";
import { fetchImage } from "./sources";
import { fetchZerozeroCareer } from "./sources/zerozero";

export type CareerEntry = { name: string; crest: string | null };

/** The clubs on his welcome post, oldest first (the current club last), crests as stored files (data/files/…). */
export function readCareer(raw: string | null | undefined): CareerEntry[] {
  try {
    const list = raw ? (JSON.parse(raw) as { name: string; crest?: string | null }[]) : [];
    return list.map((c) => ({ name: c.name, crest: c.crest ? c.crest.replace(/^\/api\/files\//, "") : null }));
  } catch {
    return [];
  }
}

/**
 * Fills a player's career (every club he played for, youth included, for the welcome post) from his zerozero
 * page, so the clubs show without anyone typing them, oldest first. A crest the app already
 * has for a club of the same name (its clubs table, or a cleaned-up override) is reused; otherwise the
 * zerozero logo is downloaded. Kept as it is when already filled, unless `force`.
 */
export async function ensureCareer(playerId: string, force = false): Promise<CareerEntry[]> {
  const p = db().prepare("SELECT zerozero_url, career, club_id FROM players WHERE id = ?").get(playerId) as { zerozero_url: string | null; career: string; club_id: string | null } | undefined;
  if (!p) return [];
  const have = readCareer(p.career);
  if ((have.length && !force) || !p.zerozero_url) return have;
  // His club in the app is the truth for the current one (exact stored name and crest); zerozero gives the
  // ones before it.
  const current = p.club_id ? (db().prepare("SELECT name, crest FROM clubs WHERE id = ?").get(p.club_id) as { name: string; crest: string | null } | undefined) : undefined;
  // Every club of his career, youth sides included (user, 22/10: "que aparecessem todos… na formação"),
  // oldest first — up to 8 crests in all.
  const all = await fetchZerozeroCareer(p.zerozero_url, 9);
  const clubs = (current ? all.filter((c) => !sameClub(c.name, current.name)).slice(0, 7) : all.slice(0, 8)).reverse();
  const out: CareerEntry[] = [];
  for (const c of clubs) {
    const known = db().prepare("SELECT crest FROM clubs WHERE lower(name) = lower(?) AND crest IS NOT NULL AND crest != ''").get(c.name) as { crest: string } | undefined;
    const over = c.crestUrl ? (db().prepare("SELECT file FROM crest_overrides WHERE source_url = ?").get(c.crestUrl) as { file: string } | undefined) : undefined;
    let crest = known?.crest ?? over?.file ?? null;
    if (!crest && c.crestUrl) {
      try {
        crest = await storeRemoteImage(await fetchImage(c.crestUrl), "crests");
      } catch {
        crest = null;
      }
    }
    out.push({ name: c.name, crest });
  }
  if (current) out.push({ name: current.name, crest: current.crest || null });
  if (out.length) db().prepare("UPDATE players SET career = ? WHERE id = ?").run(JSON.stringify(out), playerId);
  return out.length ? out : have;
}

/** "Vianense" and "SC Vianense SAD" are the same club: compare the names without the usual SC / FC / SAD words. */
function sameClub(a: string, b: string): boolean {
  const words = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !["sc", "fc", "cd", "sad", "ud", "cf", "ac", "sl", "gd", "ad", "club", "clube", "de", "do", "da", "futebol"].includes(w));
  const wa = words(a);
  const wb = words(b);
  return wa.some((w) => wb.includes(w));
}

import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "./db";
import { getSettings, newId } from "./repo";
import { absPath, FILES_DIR } from "./storage";

/**
 * Daily reference feed: the boards you keep on Pinterest (Definições → Inspiração) are read through
 * their public RSS feed once a day, and every new pin is saved to the Inspiração page. Nothing is
 * scraped behind Pinterest's back — only the feed the board itself publishes — and the images stay
 * on this Mac as reference material for new looks.
 */

export type Inspiration = { id: string; source: string; file: string; board: string; created_at: string; dismissed: number; status: string; look_id: string | null; note: string };

/** "https://pt.pinterest.com/user/board/" → the feed address Pinterest publishes for it. */
export function feedUrl(boardUrl: string): string | null {
  const m = /pinterest\.[a-z.]+\/([^/]+)\/([^/?#]+)/i.exec(boardUrl.trim());
  if (!m || m[1] === "pin") return null;
  return `https://www.pinterest.com/${m[1]}/${m[2]}.rss`;
}

export function listInspiration(includeDismissed = false): Inspiration[] {
  return db()
    .prepare(`SELECT * FROM inspiration ${includeDismissed ? "" : "WHERE dismissed = 0"} ORDER BY created_at DESC, rowid DESC`)
    .all() as Inspiration[];
}

export function dismissInspiration(id: string) {
  db().prepare("UPDATE inspiration SET dismissed = 1 WHERE id = ?").run(id);
}

/** Reads every configured board and stores the pins that are new. Returns how many were added. */
export async function fetchInspiration(): Promise<number> {
  const boards = (getSettings().pinterest_boards ?? "")
    .split(/[\n,]+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const known = new Set((db().prepare("SELECT source FROM inspiration").all() as { source: string }[]).map((r) => r.source));
  const ins = db().prepare("INSERT INTO inspiration (id, source, file, board) VALUES (?, ?, ?, ?)");
  let added = 0;
  for (const board of boards) {
    const feed = feedUrl(board);
    if (!feed) continue;
    try {
      const xml = await (await fetch(feed, { headers: { "user-agent": "Mozilla/5.0" } })).text();
      for (const item of xml.split("<item>").slice(1)) {
        const source = /<link>([^<]+)<\/link>/.exec(item)?.[1];
        // The description holds the thumbnail; the same path under /originals/ is the full-size image.
        const thumb = /img src=&quot;([^&]+)&quot;/.exec(item)?.[1] ?? /img src="([^"]+)"/.exec(item)?.[1];
        if (!source || !thumb || known.has(source)) continue;
        const full = thumb.replace(/\/\d+x\d*\//, "/originals/");
        const res = await fetch(full).then((r) => (r.ok ? r : fetch(thumb)));
        if (!res.ok) continue;
        const rel = path.posix.join("inspiration", `${nanoid(10)}${path.extname(new URL(full).pathname) || ".jpg"}`);
        await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
        await fs.writeFile(absPath(rel), Buffer.from(await res.arrayBuffer()));
        ins.run(newId(), source, rel, board);
        known.add(source);
        added++;
      }
    } catch (e) {
      console.error("[inspiration]", board, e);
    }
  }
  return added;
}

const g = globalThis as unknown as { inspirationTimer?: NodeJS.Timeout };

/** Checks the boards once a day (and a minute after the app starts). */
export function startInspirationWatch() {
  if (g.inspirationTimer) return;
  const run = () =>
    fetchInspiration()
      .then((n) => n && console.log(`[inspiration] ${n} referências novas`))
      .catch((e) => console.error("[inspiration]", e));
  setTimeout(run, 60_000);
  g.inspirationTimer = setInterval(run, 24 * 60 * 60 * 1000);
}

export { FILES_DIR };

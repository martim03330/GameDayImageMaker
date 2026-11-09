import { nanoid } from "nanoid";
import { db } from "./db";
import type {
  ChatMessage,
  Feedback,
  Club,
  Edit,
  Fixture,
  EditContent,
  Match,
  Photo,
  PhotoKind,
  Player,
  PlayerPrefs,
  PostType,
  Settings,
  Suggestion,
  TemplateParams,
} from "./types";

export const newId = () => nanoid(12);

/** Edits made for the user's agency service (another agency's logo): never in NEYOD's own screens. */
export const NOT_AGENCY_EDIT_SQL = "json_extract(params, '$.agencyId') IS NULL";

/** Players the agency does not show in its own lists (Prospeção prospects, the user's agency-service players). */
export const HIDDEN_ROLES_SQL = "('prospect', 'agency')";


// ---------- clubs ----------

export function listClubs(): Club[] {
  return db().prepare("SELECT * FROM clubs ORDER BY name").all() as Club[];
}

export function getClub(id: string | null | undefined): Club | null {
  if (!id) return null;
  return (db().prepare("SELECT * FROM clubs WHERE id = ?").get(id) as Club) ?? null;
}

export function setClubDetails(
  id: string,
  d: Partial<Pick<Club, "city" | "founded" | "stadium" | "city_image" | "city_lat" | "city_lon" | "short_name" | "city_images" | "stadium_images" | "backdrops">>,
) {
  const keys = Object.keys(d) as (keyof typeof d)[];
  if (!keys.length) return;
  db()
    .prepare(`UPDATE clubs SET ${keys.map((k) => `${k} = @${k}`).join(", ")} WHERE id = @id`)
    .run({ ...d, id });
}

export function saveClub(c: Pick<Club, "name" | "league" | "crest" | "primary_color" | "secondary_color"> & { id?: string }): string {
  const id = c.id || newId();
  db()
    .prepare(
      `INSERT INTO clubs (id, name, league, crest, primary_color, secondary_color)
       VALUES (@id, @name, @league, @crest, @primary_color, @secondary_color)
       ON CONFLICT(id) DO UPDATE SET name=@name, league=@league, crest=@crest,
         primary_color=@primary_color, secondary_color=@secondary_color`,
    )
    .run({ ...c, id });
  return id;
}

/** Words that say what kind of club it is, not which club: they are ignored when matching names. */
const CLUB_WORDS = new Set([
  "fc", "cf", "sc", "ac", "cd", "sl", "sad", "fk", "pfc", "afc", "ud", "gd", "sp", "rc", "ss", "as", "ca", "oaf",
  "club", "clube", "futebol", "football", "atletico", "atlético", "sporting", "sport", "associacao", "associação", "de", "do", "da", "e",
]);

/** "SC Vianense" and "Vianense" → "vianense": the same club written two ways by the sources. */
function clubKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !CLUB_WORDS.has(w))
    .join(" ");
}

/**
 * The club a source is talking about. Matched by its source page, then by name — allowing for the
 * spellings the sources mix up ("Cherno More" / "Cherno More Varna", "Vianense" / "SC Vianense"),
 * which used to create a second club and duplicate all of its work.
 */
export function findClub(name: string, sourceUrl?: string | null): Club | null {
  if (sourceUrl) {
    const bySource = db().prepare("SELECT * FROM clubs WHERE source_url = ?").get(sourceUrl) as Club | undefined;
    if (bySource) return bySource;
  }
  const exact = db().prepare("SELECT * FROM clubs WHERE lower(name) = lower(?)").get(name) as Club | undefined;
  if (exact) return exact;
  const key = clubKey(name);
  if (!key) return null;
  for (const club of db().prepare("SELECT * FROM clubs").all() as Club[]) {
    const own = clubKey(club.name);
    if (own === key) return club;
    // The same name with the city added or dropped ("Cherno More" ↔ "Cherno More Varna").
    const city = clubKey(club.city ?? "");
    if (city && (`${own} ${city}` === key || own === `${key} ${city}`.trim())) return club;
    const short = clubKey(club.short_name ?? "");
    if (short && short === key) return club;
  }
  return null;
}

export function setClubTimezone(id: string, tz: string) {
  db().prepare("UPDATE clubs SET timezone = ? WHERE id = ?").run(tz, id);
}

export function setClubSource(id: string, sourceUrl: string) {
  db().prepare("UPDATE clubs SET source_url = ? WHERE id = ?").run(sourceUrl, id);
}

export function deleteClub(id: string) {
  db().prepare("DELETE FROM clubs WHERE id = ?").run(id);
}

// ---------- players ----------

type PlayerRow = Omit<Player, "style" | "prefs"> & { style: string | null; prefs: string | null };

const parsePlayer = (r: PlayerRow): Player => ({
  ...r,
  style: r.style ? (JSON.parse(r.style) as TemplateParams) : null,
  prefs: r.prefs ? (JSON.parse(r.prefs) as PlayerPrefs) : { picks: {} },
});

/** The agency's players and coaches (prospects from Prospeção are internal and never listed here). */
export function listPlayers(): Player[] {
  const rows = db().prepare(`SELECT * FROM players WHERE role NOT IN ${HIDDEN_ROLES_SQL} ORDER BY first_name, last_name`).all() as PlayerRow[];
  return rows.map(parsePlayer);
}

export function getPlayer(id: string): Player | null {
  const r = db().prepare("SELECT * FROM players WHERE id = ?").get(id) as PlayerRow | undefined;
  return r ? parsePlayer(r) : null;
}

export function createPlayer(p: { first_name: string; last_name: string; zerozero_url?: string | null; transfermarkt_url?: string | null; role?: "player" | "coach" | "agency" }): string {
  const id = newId();
  db()
    .prepare("INSERT INTO players (id, first_name, last_name, zerozero_url, transfermarkt_url, role) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, p.first_name, p.last_name, p.zerozero_url ?? null, p.transfermarkt_url ?? null, p.role ?? "player");
  return id;
}

const PLAYER_FIELDS = [
  "first_name", "last_name", "position", "number", "club_id", "notes", "zerozero_url", "transfermarkt_url",
  "full_name", "birth_date", "nationality", "foot", "height_cm", "market_value", "contract_until", "agent",
  "photo_url", "last_sync", "sync_error", "last_photo_hunt",
] as const;
type PlayerField = (typeof PLAYER_FIELDS)[number];

/** Updates only the given (whitelisted) columns. */
export function updatePlayer(id: string, patch: Partial<Pick<Player, PlayerField>>) {
  const keys = (Object.keys(patch) as PlayerField[]).filter((k) => PLAYER_FIELDS.includes(k));
  if (!keys.length) return;
  db()
    .prepare(`UPDATE players SET ${keys.map((k) => `${k} = @${k}`).join(", ")} WHERE id = @id`)
    .run({ ...patch, id });
}

export function savePlayerPrefs(id: string, prefs: PlayerPrefs) {
  db().prepare("UPDATE players SET prefs = ? WHERE id = ?").run(JSON.stringify(prefs), id);
}

export function savePlayerStyle(id: string, style: TemplateParams | null) {
  db()
    .prepare("UPDATE players SET style = ? WHERE id = ?")
    .run(style ? JSON.stringify(style) : null, id);
}

export function deletePlayer(id: string) {
  db().prepare("DELETE FROM players WHERE id = ?").run(id);
}

// ---------- matches ----------

export function listMatches(playerId: string, limit = 100): Match[] {
  return db()
    .prepare("SELECT * FROM matches WHERE player_id = ? ORDER BY date DESC LIMIT ?")
    .all(playerId, limit) as Match[];
}

export function getMatch(id: string): Match | null {
  return (db().prepare("SELECT * FROM matches WHERE id = ?").get(id) as Match) ?? null;
}

type MatchInput = Omit<Match, "id" | "source" | "external_id" | "team" | "yellow" | "red" | "match_url" | "photos_url" | "opponent_crest"> &
  Partial<Pick<Match, "source" | "external_id" | "team" | "yellow" | "red" | "match_url" | "photos_url" | "opponent_crest">> & { id?: string };

/**
 * A source crest replaced by a cleaner one (white background removed, bigger file): every time that URL
 * comes back from a sync, the stored version is used instead.
 */
export function crestOverride(url: string | null | undefined): string | null {
  if (!url) return url ?? null;
  const r = db().prepare("SELECT file FROM crest_overrides WHERE source_url = ?").get(url) as { file: string } | undefined;
  return r ? `/api/files/${r.file}` : url;
}

export function saveMatch(m: MatchInput): string {
  const id = m.id || newId();
  m = { ...m, opponent_crest: crestOverride(m.opponent_crest) };
  db()
    .prepare(
      `INSERT INTO matches (id, player_id, date, competition, matchday, opponent, home,
         goals_for, goals_against, minutes, goals, assists, rating, totw, motm,
         source, external_id, team, yellow, red, match_url, photos_url, opponent_crest)
       VALUES (@id, @player_id, @date, @competition, @matchday, @opponent, @home,
         @goals_for, @goals_against, @minutes, @goals, @assists, @rating, @totw, @motm,
         @source, @external_id, @team, @yellow, @red, @match_url, @photos_url, @opponent_crest)
       ON CONFLICT(id) DO UPDATE SET date=@date, competition=@competition, matchday=@matchday,
         opponent=@opponent, home=@home, goals_for=@goals_for, goals_against=@goals_against,
         minutes=@minutes, goals=@goals, assists=@assists, rating=@rating, totw=@totw, motm=@motm,
         team=@team, yellow=@yellow, red=@red, match_url=@match_url, photos_url=@photos_url,
         opponent_crest=@opponent_crest`,
    )
    .run({
      source: "manual",
      external_id: null,
      team: "",
      yellow: 0,
      red: 0,
      match_url: null,
      photos_url: null,
      opponent_crest: null,
      ...m,
      id,
    });
  return id;
}

export function findMatchByExternal(playerId: string, externalId: string): Match | null {
  return (
    (db().prepare("SELECT * FROM matches WHERE player_id = ? AND external_id = ?").get(playerId, externalId) as Match) ?? null
  );
}

export function deleteMatch(id: string) {
  db().prepare("DELETE FROM matches WHERE id = ?").run(id);
}

// ---------- fixtures ----------

export function listFixtures(playerId?: string, includeYesterday = false): Fixture[] {
  const d = new Date();
  if (includeYesterday) d.setDate(d.getDate() - 1);
  const today = d.toISOString().slice(0, 10);
  return (
    playerId
      ? db().prepare("SELECT * FROM fixtures WHERE player_id = ? AND date >= ? ORDER BY date, time").all(playerId, today)
      : // Hidden players stay out, except the user's own clients (prospects marked "cliente"): their games are work too.
        db()
          .prepare(
            `SELECT * FROM fixtures WHERE date >= ? AND player_id NOT IN (SELECT id FROM players WHERE role IN ${HIDDEN_ROLES_SQL}
               AND id NOT IN (SELECT player_id FROM prospects WHERE status = 'cliente' AND player_id IS NOT NULL)) ORDER BY date, time`,
          )
          .all(today)
  ) as Fixture[];
}

export function getFixture(id: string | null | undefined): Fixture | null {
  if (!id) return null;
  return (db().prepare("SELECT * FROM fixtures WHERE id = ?").get(id) as Fixture) ?? null;
}

export function replaceFixtures(
  playerId: string,
  fixtures: (Omit<Fixture, "id" | "player_id" | "live_home" | "live_away" | "live_goals" | "live_updated" | "time_tz" | "venue"> & { time_tz?: string; venue?: string })[],
): Fixture[] {
  const conn = db();
  const upsert = conn.prepare(
    `INSERT INTO fixtures (id, player_id, external_id, date, time, time_tz, venue, competition, matchday, team, opponent, home, match_url, opponent_crest)
     VALUES (@id, @player_id, @external_id, @date, @time, @time_tz, @venue, @competition, @matchday, @team, @opponent, @home, @match_url, @opponent_crest)
     ON CONFLICT(player_id, external_id) DO UPDATE SET date=@date, time=@time, time_tz=@time_tz, venue=@venue,
       competition=CASE WHEN competition_manual <> '' THEN competition_manual ELSE @competition END, matchday=@matchday,
       team=@team, opponent=@opponent, home=@home, match_url=@match_url, opponent_crest=@opponent_crest`,
  );
  conn.transaction(() => {
    conn.prepare("DELETE FROM fixtures WHERE player_id = ? AND date < date('now', '-1 day')").run(playerId);
    // Upcoming games the source no longer lists (moved, or of a club he left) go too; an empty fetch keeps them.
    if (fixtures.length) {
      const keep = new Set(fixtures.map((f) => f.external_id));
      for (const r of conn.prepare("SELECT id, external_id FROM fixtures WHERE player_id = ?").all(playerId) as { id: string; external_id: string }[])
        // Games added by hand (the source missed them) are never dropped by a sync.
        if (!keep.has(r.external_id) && !r.external_id.startsWith("manual:")) conn.prepare("DELETE FROM fixtures WHERE id = ?").run(r.id);
    }
    for (const f of fixtures) upsert.run({ ...f, time_tz: f.time_tz ?? "", venue: f.venue ?? "", id: newId(), player_id: playerId, opponent_crest: crestOverride(f.opponent_crest) });
  })();
  return listFixtures(playerId);
}

export function setFixtureLive(id: string, home: number, away: number, playerGoals: number) {
  db()
    .prepare("UPDATE fixtures SET live_home = ?, live_away = ?, live_goals = ?, live_updated = datetime('now') WHERE id = ?")
    .run(home, away, playerGoals, id);
}

// ---------- suggestions ----------

export function listSuggestions(status: Suggestion["status"] = "new", limit = 50): Suggestion[] {
  return db()
    .prepare(`SELECT * FROM suggestions WHERE status = ? AND player_id NOT IN (SELECT id FROM players WHERE role IN ${HIDDEN_ROLES_SQL}) ORDER BY created_at DESC LIMIT ?`)
    .all(status, limit) as Suggestion[];
}

export function getSuggestion(id: string): Suggestion | null {
  return (db().prepare("SELECT * FROM suggestions WHERE id = ?").get(id) as Suggestion) ?? null;
}

/** Inserts a suggestion unless one with the same key already exists for the player. Returns true if new. */
export function addSuggestion(s: Omit<Suggestion, "id" | "status" | "created_at">): boolean {
  const res = db()
    .prepare(
      `INSERT OR IGNORE INTO suggestions (id, player_id, post_type, title, reason, match_id, fixture_id, dedupe_key)
       VALUES (@id, @player_id, @post_type, @title, @reason, @match_id, @fixture_id, @dedupe_key)`,
    )
    .run({ ...s, id: newId() });
  return res.changes > 0;
}

export function setSuggestionStatus(id: string, status: Suggestion["status"]) {
  db().prepare("UPDATE suggestions SET status = ? WHERE id = ?").run(status, id);
}

// ---------- photos ----------

export function listPhotos(playerId: string, kind?: PhotoKind): Photo[] {
  if (kind) {
    return db()
      .prepare("SELECT * FROM photos WHERE player_id = ? AND kind = ? ORDER BY created_at DESC")
      .all(playerId, kind) as Photo[];
  }
  return db()
    .prepare("SELECT * FROM photos WHERE player_id = ? ORDER BY created_at DESC")
    .all(playerId) as Photo[];
}

export function getPhoto(id: string | null | undefined): Photo | null {
  if (!id) return null;
  return (db().prepare("SELECT * FROM photos WHERE id = ?").get(id) as Photo) ?? null;
}

export function insertPhoto(p: { player_id: string | null; kind: PhotoKind; file: string; source?: Photo["source"]; source_url?: string | null }): string {
  const id = newId();
  db()
    .prepare("INSERT INTO photos (id, player_id, kind, file, source, source_url, approved) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, p.player_id, p.kind, p.file, p.source ?? "upload", p.source_url ?? null, p.source === "auto" ? 0 : 1);
  return id;
}

export function approvePhoto(id: string) {
  db().prepare("UPDATE photos SET approved = 1 WHERE id = ?").run(id);
}

export function pendingPhotos(): Photo[] {
  return db().prepare(`SELECT * FROM photos WHERE approved = 0 AND cutout_status = 'done' AND (player_id NOT IN (SELECT id FROM players WHERE role IN ${HIDDEN_ROLES_SQL}) OR player_id IS NULL) ORDER BY created_at DESC`).all() as Photo[];
}

export function photoSeen(playerId: string, url: string): boolean {
  return !!db().prepare("SELECT 1 FROM photo_seen WHERE player_id = ? AND url = ?").get(playerId, url);
}

export function markPhotoSeen(playerId: string, url: string, status: string, score: number | null = null) {
  db()
    .prepare("INSERT OR REPLACE INTO photo_seen (player_id, url, status, score) VALUES (?, ?, ?, ?)")
    .run(playerId, url, status, score);
}

export function setPhotoCutout(id: string, status: Photo["cutout_status"], cutout: string | null = null, meta: string | null = null) {
  db().prepare("UPDATE photos SET cutout_status = ?, cutout = ?, meta = ? WHERE id = ?").run(status, cutout, meta, id);
}

/** Points the photo at another file (the AI-restored version; the original file stays on disk). */
export function setPhotoFile(id: string, file: string) {
  db().prepare("UPDATE photos SET file = ? WHERE id = ?").run(file, id);
}

export function deletePhoto(id: string) {
  db().prepare("DELETE FROM photos WHERE id = ?").run(id);
}

// ---------- edits ----------

type EditRow = Omit<Edit, "params" | "content" | "chat"> & { params: string; content: string; chat: string | null };

const parseEdit = (r: EditRow): Edit => ({
  ...r,
  params: JSON.parse(r.params),
  content: JSON.parse(r.content),
  chat: r.chat ? JSON.parse(r.chat) : [],
});

export function listEdits(limit = 30, playerId?: string): Edit[] {
  const rows = playerId
    ? db().prepare(`SELECT * FROM edits WHERE player_id = ? AND ${NOT_AGENCY_EDIT_SQL} ORDER BY created_at DESC LIMIT ?`).all(playerId, limit)
    : db().prepare(`SELECT * FROM edits WHERE player_id NOT IN (SELECT id FROM players WHERE role IN ${HIDDEN_ROLES_SQL}) AND ${NOT_AGENCY_EDIT_SQL} ORDER BY created_at DESC LIMIT ?`).all(limit);
  return (rows as EditRow[]).map(parseEdit);
}

export function getEdit(id: string): Edit | null {
  const r = db().prepare("SELECT * FROM edits WHERE id = ?").get(id) as EditRow | undefined;
  return r ? parseEdit(r) : null;
}

export function saveEdit(e: {
  id?: string;
  player_id: string;
  post_type: PostType;
  photo_id: string | null;
  params: TemplateParams;
  content: EditContent;
}): string {
  const id = e.id || newId();
  db()
    .prepare(
      `INSERT INTO edits (id, player_id, post_type, photo_id, params, content)
       VALUES (@id, @player_id, @post_type, @photo_id, @params, @content)
       ON CONFLICT(id) DO UPDATE SET post_type=@post_type, photo_id=@photo_id,
         params=@params, content=@content`,
    )
    .run({ ...e, id, params: JSON.stringify(e.params), content: JSON.stringify(e.content) });
  return id;
}

export function setEditChat(id: string, chat: ChatMessage[]) {
  db().prepare("UPDATE edits SET chat = ? WHERE id = ?").run(JSON.stringify(chat), id);
}

export function setEditOutput(id: string, output: string) {
  db().prepare("UPDATE edits SET output = ? WHERE id = ?").run(output, id);
}

export function deleteEdit(id: string) {
  db().prepare("DELETE FROM edits WHERE id = ?").run(id);
}

// ---------- feedback ("tem erros") ----------

type FeedbackRow = Omit<Feedback, "params" | "content" | "tags"> & { params: string; content: string | null; tags: string };

export function addFeedback(f: Omit<Feedback, "id" | "resolved" | "created_at">): string {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO feedback (id, player_id, edit_id, photo_id, post_type, template_id, params, content, tags, note)
       VALUES (@id, @player_id, @edit_id, @photo_id, @post_type, @template_id, @params, @content, @tags, @note)`,
    )
    .run({ ...f, id, params: JSON.stringify(f.params), content: f.content ? JSON.stringify(f.content) : null, tags: JSON.stringify(f.tags) });
  return id;
}

export function listFeedback(includeResolved = false): Feedback[] {
  const rows = db()
    .prepare(`SELECT * FROM feedback ${includeResolved ? "" : "WHERE resolved = 0"} ORDER BY created_at DESC LIMIT 200`)
    .all() as FeedbackRow[];
  return rows.map((r) => ({ ...r, params: JSON.parse(r.params), content: r.content ? JSON.parse(r.content) : null, tags: JSON.parse(r.tags) }));
}

export function resolveFeedback(id: string) {
  db().prepare("UPDATE feedback SET resolved = 1, resolved_by = 'manual', resolved_at = datetime('now') WHERE id = ?").run(id);
}

export function getFeedback(id: string): Feedback | null {
  const r = db().prepare("SELECT * FROM feedback WHERE id = ?").get(id) as FeedbackRow | undefined;
  return r ? { ...r, params: JSON.parse(r.params), content: r.content ? JSON.parse(r.content) : null, tags: JSON.parse(r.tags) } : null;
}

/** Reports closed recently, newest first (to show what was fixed and how). */
export function recentlyResolvedFeedback(limit = 20): Feedback[] {
  const rows = db()
    .prepare("SELECT * FROM feedback WHERE resolved = 1 AND resolved_at IS NOT NULL ORDER BY resolved_at DESC LIMIT ?")
    .all(limit) as FeedbackRow[];
  return rows.map((r) => ({ ...r, params: JSON.parse(r.params), content: r.content ? JSON.parse(r.content) : null, tags: JSON.parse(r.tags) }));
}

/**
 * How strongly each look should be pushed down for this player and post type:
 * layout bugs count for everyone, "don't like" only for this player. Resolved reports are ignored.
 */
export function templatePenalties(playerId: string, postType: PostType): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of listFeedback()) {
    if (f.post_type !== postType && !f.tags.some((t) => t !== "dislike" && t !== "wrong-data")) continue;
    const layoutBug = f.tags.some((t) => ["face-cut", "text-over-face", "text-cut", "overlap"].includes(t));
    const mine = f.player_id === playerId;
    const w = (layoutBug ? 1 : 0) + (mine && f.tags.includes("dislike") ? 2 : 0) + (mine && f.tags.includes("colors") ? 0.5 : 0);
    if (w) out[f.template_id] = (out[f.template_id] ?? 0) + w;
  }
  return out;
}

/** Photos reported as pixelated / badly cut out: not proposed by default any more. */
export function flaggedPhotoIds(): Set<string> {
  return new Set(
    listFeedback()
      .filter((f) => f.photo_id && f.tags.some((t) => t === "pixelated" || t === "bad-cutout"))
      .map((f) => f.photo_id!),
  );
}

// ---------- settings ----------

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    agency_name: map.agency_name ?? "NEYOD",
    agency_logo: map.agency_logo ?? null,
    agency_logo_dark: map.agency_logo_dark ?? null,
    agency_tagline: map.agency_tagline ?? "",
    pinterest_boards: map.pinterest_boards ?? "",
    scenes_paused: map.scenes_paused ?? "",
    hidden_looks: map.hidden_looks ?? "[]",
    studio_handle: map.studio_handle ?? "",
  };
}

/** Looks the user removed (Catálogo → "Retirar"). */
// ---------- posted edits (Histórico) ----------

/** Marks an edit as the one posted (today), or clears the mark. */
export function setEditPosted(id: string, posted: boolean) {
  db().prepare("UPDATE edits SET posted_at = ?, released = 0 WHERE id = ?").run(posted ? new Date().toISOString() : null, id);
}

/** Makes the look of a posted edit available again for its player (or blocks it again). */
export function setEditReleased(id: string, released: boolean) {
  db().prepare("UPDATE edits SET released = ? WHERE id = ?").run(released ? 1 : 0, id);
}

/** Every posted edit, newest first. */
export function listPostedEdits(): Edit[] {
  return (db().prepare(`SELECT * FROM edits WHERE posted_at IS NOT NULL AND ${NOT_AGENCY_EDIT_SQL} ORDER BY posted_at DESC`).all() as EditRow[]).map(parseEdit);
}

/** Looks already posted for this player and not released: not proposed again. */
export function postedLooks(playerId: string): string[] {
  const rows = db().prepare(`SELECT params FROM edits WHERE player_id = ? AND posted_at IS NOT NULL AND released = 0 AND ${NOT_AGENCY_EDIT_SQL}`).all(playerId) as { params: string }[];
  return [...new Set(rows.map((r) => (JSON.parse(r.params) as { templateId: string }).templateId))];
}

/** Players kept up to date by the background sync: NEYOD's own plus those linked to a client agency. */
export function listSyncPlayers(): Player[] {
  const rows = db()
    .prepare(`SELECT * FROM players WHERE role NOT IN ${HIDDEN_ROLES_SQL} OR id IN (SELECT player_id FROM agency_players) ORDER BY first_name, last_name`)
    .all() as PlayerRow[];
  return rows.map(parsePlayer);
}

export function hiddenLooks(): string[] {
  try {
    return JSON.parse(getSettings().hidden_looks) as string[];
  } catch {
    return [];
  }
}

export function setSetting(key: keyof Settings, value: string | null) {
  db()
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, value);
}

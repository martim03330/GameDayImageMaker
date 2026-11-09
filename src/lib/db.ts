import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS crest_overrides (
  source_url TEXT PRIMARY KEY,
  file TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  league TEXT NOT NULL DEFAULT '',
  crest TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0b3d91',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff'
);
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  number TEXT NOT NULL DEFAULT '',
  club_id TEXT REFERENCES clubs(id) ON DELETE SET NULL,
  style TEXT,
  notes TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  competition TEXT NOT NULL DEFAULT '',
  matchday TEXT NOT NULL DEFAULT '',
  opponent TEXT NOT NULL DEFAULT '',
  home INTEGER NOT NULL DEFAULT 1,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  rating REAL,
  totw INTEGER NOT NULL DEFAULT 0,
  motm INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'player',
  file TEXT NOT NULL,
  cutout TEXT,
  cutout_status TEXT NOT NULL DEFAULT 'none',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS edits (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL,
  photo_id TEXT REFERENCES photos(id) ON DELETE SET NULL,
  params TEXT NOT NULL,
  content TEXT NOT NULL,
  output TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS fixtures (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  competition TEXT NOT NULL DEFAULT '',
  matchday TEXT NOT NULL DEFAULT '',
  team TEXT NOT NULL DEFAULT '',
  opponent TEXT NOT NULL DEFAULT '',
  home INTEGER NOT NULL DEFAULT 1,
  match_url TEXT,
  opponent_crest TEXT,
  UNIQUE (player_id, external_id)
);
CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  match_id TEXT,
  fixture_id TEXT,
  dedupe_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (player_id, dedupe_key)
);
CREATE TABLE IF NOT EXISTS photo_seen (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score REAL,
  status TEXT NOT NULL,
  seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (player_id, url)
);
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  edit_id TEXT,
  post_type TEXT NOT NULL,
  template_id TEXT NOT NULL,
  params TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  file TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS scene_uses (
  player_id TEXT NOT NULL,
  file TEXT NOT NULL,
  used_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS scene_jobs (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  count INTEGER NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  edit_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  done_at TEXT
);
CREATE TABLE IF NOT EXISTS inspiration (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL UNIQUE,
  file TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT '',
  dismissed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Grounds games are played at (zerozero id) and the real photos of them good enough for a backdrop.
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT
);
-- zerozero game id → the ground it is played at.
CREATE TABLE IF NOT EXISTS game_venues (
  game_id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE
);
-- Prospeção: Liga 3 / Campeonato de Portugal players from zerozero, to offer edits to (lib/prospects.ts).
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  zz_url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  club TEXT NOT NULL DEFAULT '',
  club_url TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  number TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  thumb_url TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'novo',
  note TEXT NOT NULL DEFAULT '',
  contacted_at TEXT,
  player_id TEXT,
  sample_edit_id TEXT,
  sample_status TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Prospeção · college: the NCAA soccer (D1 / D2) and basketball (D1) programs and where their roster page is
-- (lib/prospects.ts). One school has a row per sport, division and gender.
CREATE TABLE IF NOT EXISTS college_programs (
  id TEXT PRIMARY KEY,
  school TEXT NOT NULL,
  team_name TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL,
  gender TEXT NOT NULL,
  domain TEXT NOT NULL,
  roster_url TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT '',
  players INTEGER NOT NULL DEFAULT 0,
  internationals INTEGER NOT NULL DEFAULT 0,
  last_scan TEXT,
  error TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT '',
  conference TEXT NOT NULL DEFAULT '',
  sport TEXT NOT NULL DEFAULT 'soccer',
  UNIQUE (domain, division, gender, sport)
);
-- Agências: Portuguese player agencies from Transfermarkt, the user's own service (lib/agencies/store.ts).
CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  tm_id TEXT NOT NULL UNIQUE,
  tm_url TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  players INTEGER NOT NULL DEFAULT 0,
  instagram TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  designer TEXT NOT NULL DEFAULT 'por ver',
  status TEXT NOT NULL DEFAULT 'novo',
  note TEXT NOT NULL DEFAULT '',
  contacted_at TEXT,
  followed_up_at TEXT,
  logo TEXT,
  logo_white TEXT,
  page_checked_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- The players a client agency has with the service (a player may be NEYOD's too: only the link is the agency's).
CREATE TABLE IF NOT EXISTS agency_players (
  agency_id TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, player_id)
);
-- The look each client agency has in a week (Monday date): one agency per look per week.
CREATE TABLE IF NOT EXISTS agency_weeks (
  agency_id TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  look TEXT NOT NULL,
  PRIMARY KEY (agency_id, week),
  UNIQUE (week, look)
);
-- Video stories: an uploaded goal / assist clip, its ball detections (data/files/clips/<id>/det.json) and the
-- user's corrections (anchors), zoom and trim (lib/clips/store.ts).
CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  edit_id TEXT,
  file TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'a seguir',
  progress TEXT NOT NULL DEFAULT '',
  anchors TEXT NOT NULL DEFAULT '[]',
  zoom REAL NOT NULL DEFAULT 1.6,
  trim_start REAL NOT NULL DEFAULT 0,
  trim_end REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;

/** Columns added after the first version; applied with ALTER TABLE when missing. */
const COLUMNS: Record<string, [string, string][]> = {
  // Agências without Instagram: marked by the user, contacted by email (the account-management offer).
  agencies: [
    ["no_instagram", "INTEGER NOT NULL DEFAULT 0"],
    ["email", "TEXT NOT NULL DEFAULT ''"],
    ["email_source", "TEXT NOT NULL DEFAULT ''"],
  ],
  // The school's IANA zone (from its state in the NCAA directory): college kick-offs are local to it.
  college_programs: [
    ["timezone", "TEXT NOT NULL DEFAULT ''"],
    ["conference", "TEXT NOT NULL DEFAULT ''"],
    // 'soccer' | 'basketball' (the unique key includes it: see collegeProgramsBySport below).
    ["sport", "TEXT NOT NULL DEFAULT 'soccer'"],
  ],
  // Prospeção: when the follow-up message went out (3 days without an answer).
  prospects: [
    ["followed_up_at", "TEXT"],
    // Instagram accounts the search found for him (best first, [{ h, s }]), waiting for the user's confirmation.
    ["ig_candidates", "TEXT NOT NULL DEFAULT '[]'"],
    ["ig_checked_at", "TEXT"],
    // From the flag on his squad line; the messages go out in his language (lang overrides the guess).
    ["nationality", "TEXT NOT NULL DEFAULT ''"],
    ["lang", "TEXT NOT NULL DEFAULT ''"],
    // 'soccer' (every zerozero / college soccer player) | 'basketball' (US college): picks his messages.
    ["sport", "TEXT NOT NULL DEFAULT 'soccer'"],
  ],
  // The nightly "new looks" routine: '' = not looked at yet, 'used' = became look_id, 'skipped' = repeat / unusable (note says why).
  inspiration: [
    ["status", "TEXT NOT NULL DEFAULT ''"],
    ["look_id", "TEXT"],
    ["note", "TEXT NOT NULL DEFAULT ''"],
  ],
  players: [
    ["zerozero_url", "TEXT"],
    ["transfermarkt_url", "TEXT"],
    ["full_name", "TEXT NOT NULL DEFAULT ''"],
    ["birth_date", "TEXT NOT NULL DEFAULT ''"],
    ["nationality", "TEXT NOT NULL DEFAULT ''"],
    ["foot", "TEXT NOT NULL DEFAULT ''"],
    ["height_cm", "INTEGER"],
    ["market_value", "TEXT NOT NULL DEFAULT ''"],
    ["contract_until", "TEXT NOT NULL DEFAULT ''"],
    ["agent", "TEXT NOT NULL DEFAULT ''"],
    ["career", "TEXT NOT NULL DEFAULT ''"],
    ["role", "TEXT NOT NULL DEFAULT 'player'"],
    ["club_locked", "INTEGER NOT NULL DEFAULT 0"],
    ["photo_url", "TEXT"],
    ["prefs", "TEXT"],
    ["last_sync", "TEXT"],
    ["last_photo_hunt", "TEXT"],
    ["sync_error", "TEXT"],
  ],
  clubs: [
    ["source_url", "TEXT"],
    ["city", "TEXT NOT NULL DEFAULT ''"],
    ["founded", "TEXT NOT NULL DEFAULT ''"],
    ["stadium", "TEXT NOT NULL DEFAULT ''"],
    ["city_image", "TEXT"],
    ["city_lat", "REAL"],
    ["city_lon", "REAL"],
    ["short_name", "TEXT NOT NULL DEFAULT ''"],
    ["timezone", "TEXT NOT NULL DEFAULT ''"],
    ["city_images", "TEXT"],
    ["stadium_images", "TEXT"],
    /** Generated scenery (smoke, light) in the club's colours: data/files/generated/<club>/. */
    ["backdrops", "TEXT"],
  ],
  photos: [
    ["meta", "TEXT"],
    ["source", "TEXT NOT NULL DEFAULT 'upload'"],
    ["source_url", "TEXT"],
    ["approved", "INTEGER NOT NULL DEFAULT 1"],
  ],
  fixtures: [
    ["live_home", "INTEGER"],
    ["live_away", "INTEGER"],
    ["live_goals", "INTEGER NOT NULL DEFAULT 0"],
    ["live_updated", "TEXT"],
    // College games: the zone the date / time are written in ('' = Portugal, as zerozero gives them).
    ["time_tz", "TEXT NOT NULL DEFAULT ''"],
    // Where the game is played when the source says it (college schedules); zerozero games use the venues table.
    ["venue", "TEXT NOT NULL DEFAULT ''"],
    // The competition as the player wants it written ("Big West Conference Tournament"): kept over the
    // source's name by every sync ('' = use the source's).
    ["competition_manual", "TEXT NOT NULL DEFAULT ''"],
  ],
  matches: [
    ["source", "TEXT NOT NULL DEFAULT 'manual'"],
    ["external_id", "TEXT"],
    ["team", "TEXT NOT NULL DEFAULT ''"],
    ["yellow", "INTEGER NOT NULL DEFAULT 0"],
    ["red", "INTEGER NOT NULL DEFAULT 0"],
    ["match_url", "TEXT"],
    ["photos_url", "TEXT"],
    ["opponent_crest", "TEXT"],
  ],
  edits: [
    ["chat", "TEXT"],
    // "Usar no fim de semana": when the edit was chosen to be posted; its look is then not proposed again
    // for that player, unless released (Histórico → Recuperar).
    ["posted_at", "TEXT"],
    ["released", "INTEGER NOT NULL DEFAULT 0"],
  ],
  feedback: [
    ["photo_id", "TEXT"],
    ["content", "TEXT"],
    ["resolved", "INTEGER NOT NULL DEFAULT 0"],
    // Filled when a report is closed: what was done, and by whom ("auto" = the nightly fixing routine).
    ["resolution", "TEXT NOT NULL DEFAULT ''"],
    ["resolved_by", "TEXT NOT NULL DEFAULT ''"],
    ["resolved_at", "TEXT"],
  ],
};

function migrate(conn: Database.Database) {
  for (const [table, cols] of Object.entries(COLUMNS)) {
    const existing = new Set((conn.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name));
    for (const [name, type] of cols) {
      if (!existing.has(name)) conn.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
    }
  }
  conn.exec("CREATE UNIQUE INDEX IF NOT EXISTS matches_external ON matches(player_id, external_id) WHERE external_id IS NOT NULL");
  collegeProgramsBySport(conn);
}

/**
 * college_programs was first unique on (domain, division, gender): a school's basketball team would collide with
 * its soccer team. SQLite cannot change a table's UNIQUE constraint, so the table is rebuilt once (same rows, all
 * soccer) with sport in the key.
 */
function collegeProgramsBySport(conn: Database.Database) {
  const sql = (conn.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'college_programs'").pluck().get() as string | undefined) ?? "";
  if (!sql || /UNIQUE\s*\(\s*domain\s*,\s*division\s*,\s*gender\s*,\s*sport\s*\)/i.test(sql)) return;
  const cols = "id, school, team_name, division, gender, domain, roster_url, platform, players, internationals, last_scan, error, timezone, conference, sport";
  conn.transaction(() => {
    conn.exec(`CREATE TABLE college_programs_new (
      id TEXT PRIMARY KEY, school TEXT NOT NULL, team_name TEXT NOT NULL DEFAULT '', division TEXT NOT NULL, gender TEXT NOT NULL,
      domain TEXT NOT NULL, roster_url TEXT NOT NULL DEFAULT '', platform TEXT NOT NULL DEFAULT '', players INTEGER NOT NULL DEFAULT 0,
      internationals INTEGER NOT NULL DEFAULT 0, last_scan TEXT, error TEXT NOT NULL DEFAULT '', timezone TEXT NOT NULL DEFAULT '',
      conference TEXT NOT NULL DEFAULT '', sport TEXT NOT NULL DEFAULT 'soccer', UNIQUE (domain, division, gender, sport))`);
    conn.exec(`INSERT INTO college_programs_new (${cols}) SELECT ${cols} FROM college_programs`);
    conn.exec("DROP TABLE college_programs");
    conn.exec("ALTER TABLE college_programs_new RENAME TO college_programs");
  })();
}

const globalForDb = globalThis as unknown as { db?: Database.Database };

export function db(): Database.Database {
  if (!globalForDb.db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const conn = new Database(path.join(DATA_DIR, "gameday.db"));
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    conn.exec(SCHEMA);
    migrate(conn);
    globalForDb.db = conn;
  }
  return globalForDb.db;
}

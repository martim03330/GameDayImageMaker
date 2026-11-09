import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as cheerio from "cheerio";
import { ensureCollegeClub } from "./college";
import { db } from "./db";
import * as repo from "./repo";
import { copyEditToPlayer } from "./series";
import { countryOf, fetchCollegePrograms, parseRoster, positionPt, rosterPaths, type CollegeProgram, type CollegeSport } from "./sources/college";
import { fetchJson, fetchText, forgetText, SourceFetchError } from "./sources/http";
import { defaultsFor, LANGS, type Lang, type Sport, type Templates } from "./prospect-lang";
import { US_STATE_TZ } from "./timezone";
import { syncPlayer } from "./sync";

/**
 * Prospeção: the players of Liga 3 and Campeonato de Portugal (read from zerozero's public pages), so
 * the user can offer them matchday / goal edits. The app prepares everything — the list, a sample
 * matchday made for that player, the message — but the user sends each message himself from his own
 * Instagram, at a human pace. Nothing here sends messages.
 *
 * Also the international players of US college soccer (NCAA D1 / D2, men's and women's) and basketball
 * (NCAA D1, men's and women's), read from the schools' own roster pages: see the college section below.
 *
 * A prospect is a light row (thousands of them). Only when a sample is asked for does he become an
 * internal player (role "prospect", hidden from the agency's lists, no NEYOD logo), so the normal
 * machinery — sync, photo hunt, cutout, looks, export — works on him unchanged.
 */

const BASE = "https://www.zerozero.pt";
/**
 * Where the players come from: the page that links this season's edition, and how to recognise that link.
 * Portugal's 3rd/4th tiers, plus the 2nd tiers of the UAE and Qatar (lesser-known clubs, players with
 * more spending power — many of them Portuguese, Brazilian, African, Arab).
 */
const COMPETITIONS = [
  { division: "Liga 3", page: "/competicao/liga-3", phase: /\/edicao\/(liga-3[^/"]*1-fase[^/"]*)\/(\d+)/ },
  { division: "Campeonato de Portugal", page: "/competicao/campeonato-de-portugal", phase: /\/edicao\/(campeonato-de-portugal-1-fase[^/"]*)\/(\d+)/ },
  { division: "Emirados · 2.ª divisão", page: "/competicao/segunda-liga-emiradense", phase: /\/edicao\/(arabian-division-1[^/"]*)\/(\d+)/ },
  { division: "Catar · 2.ª divisão", page: "/pais/catar", phase: /\/edicao\/(qatar-stars-league-2[^/"]*)\/(\d+)/ },
  // Added 2026-11-03, where an edit offer has the best odds: pros with no media team of their own (Liga 2,
  // women's top tier), and leagues full of Portuguese, Brazilian and Cape Verdean players (Luxembourg,
  // Switzerland's 2nd/3rd tiers, Andorra, Cyprus, Bulgaria — David's league), plus Saudi Arabia's 2nd tier.
  { division: "Liga 2", page: "/competicao/segunda-liga-portuguesa", phase: /\/edicao\/(liga-portugal-2[^/"]*)\/(\d+)/ },
  { division: "Liga BPI · Feminino", page: "/competicao/liga-portuguesa-feminina", phase: /\/edicao\/(liga-bpi[^/"]*)\/(\d+)/ },
  { division: "Luxemburgo · 1.ª divisão", page: "/pais/luxemburgo", phase: /\/edicao\/(bgl-ligue[^/"]*)\/(\d+)/ },
  { division: "Suíça · 2.ª divisão", page: "/pais/suica", phase: /\/edicao\/(challenge-league[^/"]*)\/(\d+)/ },
  { division: "Suíça · 3.ª divisão", page: "/pais/suica", phase: /\/edicao\/(1-liga-promotion[^/"]*)\/(\d+)/ },
  { division: "Andorra · 1.ª divisão", page: "/pais/andorra", phase: /\/edicao\/(lliga-multisegur[^/"]*)\/(\d+)/ },
  { division: "Chipre · 1.ª divisão", page: "/pais/chipre", phase: /\/edicao\/(cypriot-first-division-20[^/"]*)\/(\d+)/ },
  { division: "Bulgária · 1.ª divisão", page: "/pais/bulgaria", phase: /\/edicao\/(efbet-league[^/"]*)\/(\d+)/ },
  { division: "Arábia Saudita · 2.ª divisão", page: "/pais/arabia-saudita", phase: /\/edicao\/(yelo-league[^/"]*)\/(\d+)/ },
  // Added 2026-11-05: Spain's 3rd tier (two groups, 40 clubs: semi-pros with no media team, Spanish-speaking —
  // the user's Spanish clients) and Malta's top flight (12 clubs, many Portuguese and Brazilian players).
  { division: "Espanha · Primera RFEF", page: "/pais/espanha", phase: /\/edicao\/(primera-division-rfef-20[^/"]*)\/(\d+)/ },
  { division: "Malta · 1.ª divisão", page: "/pais/malta", phase: /\/edicao\/(malta-premier-league-20[^/"]*)\/(\d+)/ },
];
/** Squad sections that are players (the rest of the page lists coaches, medical staff, directors). */
const PLAYER_SECTIONS: Record<string, string> = { "Guarda Redes": "Guarda-redes", Defesa: "Defesa", Médio: "Médio", Avançado: "Avançado" };

export const STATUSES = ["novo", "contactado", "respondeu", "cliente", "sem interesse"] as const;
export type ProspectStatus = (typeof STATUSES)[number];

export type Prospect = {
  id: string;
  zz_url: string;
  name: string;
  club: string;
  club_url: string;
  division: string;
  position: string;
  number: string;
  age: string;
  thumb_url: string;
  /** "Portugal", "Brasil", "Egito"… as zerozero writes it (Portuguese). */
  nationality: string;
  /** "soccer" (zerozero, college soccer) or "basketball" (US college): his messages are the sport's own. */
  sport: Sport;
  /** The language his messages go out in, chosen by hand ('' = guessed from his nationality). */
  lang: string;
  instagram: string;
  status: ProspectStatus;
  note: string;
  contacted_at: string | null;
  followed_up_at: string | null;
  /** JSON [{ h: handle, s: score }], best first: accounts the search found, for the user to confirm. */
  ig_candidates: string;
  ig_checked_at: string | null;
  player_id: string | null;
  sample_edit_id: string | null;
  sample_status: string;
  updated_at: string;
};

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

export function listProspects(): Prospect[] {
  return db().prepare("SELECT * FROM prospects ORDER BY division, club, position, name").all() as Prospect[];
}

export function getProspect(id: string): Prospect | null {
  return (db().prepare("SELECT * FROM prospects WHERE id = ?").get(id) as Prospect | undefined) ?? null;
}

export function updateProspect(id: string, patch: Partial<Pick<Prospect, "instagram" | "status" | "note" | "lang">>) {
  const p = getProspect(id);
  if (!p) return;
  const next = { ...p, ...patch };
  // The first move to "contactado" stamps the day (the page counts today's messages from it).
  const contacted = patch.status && patch.status !== "novo" && !p.contacted_at ? new Date().toISOString() : p.contacted_at;
  const handle = clean(next.instagram).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "");
  db()
    .prepare("UPDATE prospects SET instagram = ?, status = ?, note = ?, lang = ?, contacted_at = ?, updated_at = datetime('now') WHERE id = ?")
    .run(handle, next.status, next.note, next.lang ?? "", contacted, id);
}

/* ---------------- the list, from zerozero ---------------- */

type Club = { name: string; url: string; division: string };

/** The clubs of this season's first phase of each competition (the phase every club plays). */
async function clubs(): Promise<Club[]> {
  const out: Club[] = [];
  for (const c of COMPETITIONS) {
    const { text } = await fetchText(BASE + c.page);
    const m = c.phase.exec(text);
    if (!m) throw new Error(`Não encontrei a época atual de ${c.division} no zerozero`);
    const { text: teams } = await fetchText(`${BASE}/edicao/${m[1]}/${m[2]}/equipas`);
    const $ = cheerio.load(teams);
    $(".zz_stats_card .info > a[href^='/equipa/']").each((_, a) => {
      const name = clean($(a).find(".first_name").text());
      const href = $(a).attr("href")!;
      if (name && !out.some((o) => o.url.endsWith(href))) out.push({ name, url: BASE + href, division: c.division });
    });
  }
  return out;
}

type Row = Omit<Prospect, "id" | "sport" | "lang" | "instagram" | "status" | "note" | "contacted_at" | "followed_up_at" | "ig_candidates" | "ig_checked_at" | "player_id" | "sample_edit_id" | "sample_status" | "updated_at">;

/** The players of one club's squad page: name, position, shirt number, age and zerozero portrait. */
async function squad(club: Club): Promise<Row[]> {
  const { text } = await fetchText(club.url);
  const $ = cheerio.load(text);
  const rows: Row[] = [];
  $(".section").each((_, sec) => {
    const position = PLAYER_SECTIONS[clean($(sec).text())];
    if (!position) return;
    $(sec)
      .next(".staff_line")
      .find(".staff")
      .each((_, st) => {
        const a = $(st).find(".name a[href^='/jogador/']").first();
        const href = a.attr("href");
        if (!href) return;
        const url = BASE + href.replace(/\?.*$/, "");
        const thumb = /url\('([^']+)'\)/.exec($(st).find(".photo").attr("style") ?? "")?.[1] ?? "";
        rows.push({
          zz_url: url,
          name: clean(a.text()),
          club: club.name,
          club_url: club.url,
          division: club.division,
          position,
          number: clean($(st).find(".number").text()),
          age: /\d+ anos/.exec(clean($(st).find(".name > span").last().text()))?.[0] ?? "",
          thumb_url: thumb.startsWith("/") ? BASE + thumb : thumb,
          nationality: clean($(st).find(".micrologo_and_text .image a[title]").first().attr("title")),
        });
      });
  });
  return rows;
}

const g = globalThis as unknown as { prospectScan?: { running: boolean; done: number; total: number; error: string | null; finished: string | null } };

export function scanState() {
  return g.prospectScan ?? { running: false, done: 0, total: 0, error: null, finished: null };
}

/**
 * Reads every club's squad and stores the players (new ones as "novo"; known ones only get their club /
 * position refreshed, never their status, Instagram or notes). Runs in the background: ~80 pages, one
 * request every ~1.1 s (the polite spacing of sources/http.ts), so about two minutes.
 */
export function startScan() {
  if (scanState().running) return;
  g.prospectScan = { running: true, done: 0, total: 0, error: null, finished: null };
  const st = g.prospectScan;
  (async () => {
    const list = await clubs();
    st.total = list.length;
    const upsert = db().prepare(`
      INSERT INTO prospects (id, zz_url, name, club, club_url, division, position, number, age, thumb_url, nationality)
      VALUES (@id, @zz_url, @name, @club, @club_url, @division, @position, @number, @age, @thumb_url, @nationality)
      ON CONFLICT(zz_url) DO UPDATE SET name = excluded.name, club = excluded.club, club_url = excluded.club_url,
        division = excluded.division, position = excluded.position, number = excluded.number, age = excluded.age,
        thumb_url = excluded.thumb_url, nationality = excluded.nationality, updated_at = datetime('now')`);
    for (const club of list) {
      try {
        for (const r of await squad(club)) upsert.run({ ...r, id: repo.newId() });
      } catch (e) {
        console.error("[prospeção]", club.name, e);
      }
      st.done++;
    }
  })()
    .catch((e) => {
      st.error = (e as Error).message;
      console.error("[prospeção]", e);
    })
    .finally(() => {
      st.running = false;
      st.finished = new Date().toISOString();
    });
}

/* ---------------- US college soccer and basketball ---------------- */

/** College prospects carry divisions like "NCAA D1 · Masculino": no zerozero page, so no automatic sample. */
export const isCollege = (p: Pick<Prospect, "division">) => p.division.startsWith("NCAA ");
/** "NCAA D1 · Masculino" (soccer, as it always was) / "NCAA D1 · Basquetebol masc." */
export const collegeDivision = (c: Pick<CollegeProgram, "division" | "gender"> & { sport?: CollegeSport }) =>
  c.sport === "basketball" ? `NCAA ${c.division} · Basquetebol ${c.gender === "M" ? "masc." : "fem."}` : `NCAA ${c.division} · ${c.gender === "M" ? "Masculino" : "Feminino"}`;

export type CollegeScanState = { running: boolean; sport: CollegeSport; stage: string; done: number; total: number; players: number; error: string | null; finished: string | null };
const gc = globalThis as unknown as { collegeScan?: CollegeScanState };

export function collegeScanState(): CollegeScanState {
  return gc.collegeScan ?? { running: false, sport: "soccer", stage: "", done: 0, total: 0, players: 0, error: null, finished: null };
}

type ProgramRow = { id: string; school: string; division: "D1" | "D2"; gender: "M" | "F"; domain: string; roster_url: string; sport: CollegeSport };

/**
 * The international players of every NCAA men's and women's team of a sport (soccer: D1 / D2; basketball: D1),
 * in the background:
 *  1. the program list from the NCAA's member directory (school + athletics website), kept in college_programs;
 *  2. each school's roster page (Sidearm / WMT), trying /sports/{mens|womens}-soccer, then msoc / wsoc, then
 *     soccer (basketball: mens|womens-basketball, mbball / wbball, basketball);
 *  3. only players whose hometown is outside the USA are kept ("Lisbon, Portugal" → Portugal), as prospects
 *     with their school as club. An Instagram written on the roster is stored as his (no paid search needed).
 * Known players keep their status, notes and Instagram. ~1,000 schools at ~1 page a second: 20–40 minutes
 * (basketball D1: ~730 teams, 15–30 minutes). `limit` scans only the first N programs (a trial run).
 */
export function startCollegeScan(sport: CollegeSport = "soccer", limit = 0) {
  if (collegeScanState().running) return;
  gc.collegeScan = { running: true, sport, stage: "a ler a lista da NCAA", done: 0, total: 0, players: 0, error: null, finished: null };
  const st = gc.collegeScan;
  const conn = db();
  // The promise is returned so a script can wait for the end; the page just starts it.
  return (async () => {
    const programs = await fetchCollegePrograms(fetchJson, sport);
    const addProgram = conn.prepare(`
      INSERT INTO college_programs (id, school, division, gender, domain, timezone, conference, sport) VALUES (@id, @school, @division, @gender, @domain, @timezone, @conference, @sport)
      ON CONFLICT(domain, division, gender, sport) DO UPDATE SET school = excluded.school, timezone = excluded.timezone, conference = excluded.conference`);
    for (const pr of programs) addProgram.run({ ...pr, id: repo.newId(), timezone: US_STATE_TZ[pr.state] ?? "America/New_York" });
    const all = conn.prepare("SELECT * FROM college_programs WHERE sport = ? ORDER BY division, gender, school").all(sport) as ProgramRow[];
    const list = limit > 0 ? all.slice(0, limit) : all;
    st.total = list.length;
    st.stage = "a ler os plantéis";
    const upsert = conn.prepare(`
      INSERT INTO prospects (id, zz_url, name, club, club_url, division, position, number, age, thumb_url, nationality, instagram, sport)
      VALUES (@id, @zz_url, @name, @club, @club_url, @division, @position, @number, @age, @thumb_url, @nationality, @instagram, @sport)
      ON CONFLICT(zz_url) DO UPDATE SET name = excluded.name, club = excluded.club, club_url = excluded.club_url,
        division = excluded.division, position = excluded.position, number = excluded.number, age = excluded.age,
        thumb_url = excluded.thumb_url, nationality = excluded.nationality,
        instagram = CASE WHEN prospects.instagram = '' THEN excluded.instagram ELSE prospects.instagram END, updated_at = datetime('now')`);
    const done = conn.prepare(
      "UPDATE college_programs SET team_name = ?, roster_url = ?, platform = ?, players = ?, internationals = ?, error = ?, last_scan = datetime('now') WHERE id = ?",
    );
    for (const pr of list) {
      let found: { url: string; parsed: NonNullable<ReturnType<typeof parseRoster>> } | null = null;
      let error = "";
      // The page found last time first, then the usual paths.
      const urls = [...new Set([pr.roster_url, ...rosterPaths(pr.gender, sport).map((p) => `https://${pr.domain}/sports/${p}/roster`)].filter(Boolean))];
      for (const url of urls) {
        try {
          const { text, finalUrl } = await fetchText(url);
          forgetText(url);
          // Redirected to the home page or another sport: not this roster.
          if (!/\/roster/.test(new URL(finalUrl).pathname)) continue;
          const parsed = parseRoster(text, finalUrl);
          if (parsed?.players.length) {
            found = { url: finalUrl.replace(/:443\//, "/"), parsed };
            break;
          }
          error ||= parsed ? "plantel vazio" : "site sem Sidearm/WMT";
        } catch (e) {
          error = e instanceof SourceFetchError && e.status === 404 ? "sem página de plantel" : (e as Error).message.slice(0, 160);
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
      if (found) {
        const team = found.parsed.siteName || pr.school;
        let intl = 0;
        for (const pl of found.parsed.players) {
          const country = countryOf(pl.hometown);
          if (!country || country === "US") continue;
          intl++;
          upsert.run({
            id: repo.newId(),
            zz_url: pl.profileUrl,
            name: pl.name,
            club: team,
            club_url: found.url,
            division: collegeDivision(pr),
            position: positionPt(pl.position, sport),
            number: pl.number,
            age: pl.classYear,
            thumb_url: pl.thumb,
            nationality: country,
            instagram: pl.instagram,
            sport,
          });
        }
        st.players += intl;
        done.run(team, found.url, found.parsed.platform, found.parsed.players.length, intl, "", pr.id);
      } else {
        done.run("", "", "", 0, 0, error || "sem plantel", pr.id);
      }
      st.done++;
      await new Promise((r) => setTimeout(r, 1100));
    }
  })()
    .catch((e) => {
      st.error = (e as Error).message;
      console.error("[prospeção college]", e);
    })
    .finally(() => {
      st.running = false;
      st.stage = "";
      st.finished = new Date().toISOString();
    });
}

/* ---------------- the sample matchday ---------------- */

const setSample = (id: string, status: string, patch: { player_id?: string; sample_edit_id?: string | null } = {}) =>
  db()
    .prepare("UPDATE prospects SET sample_status = ?, player_id = COALESCE(?, player_id), sample_edit_id = COALESCE(?, sample_edit_id) WHERE id = ?")
    .run(status, patch.player_id ?? null, patch.sample_edit_id ?? null, id);

/** The look the samples copy: the one chosen on the page, else the agency's latest matchday edit. */
export function sampleSource(): string | null {
  const chosen = (db().prepare("SELECT value FROM settings WHERE key = 'prospect_sample_edit'").get() as { value: string } | undefined)?.value;
  if (chosen && repo.getEdit(chosen)) return chosen;
  const last = db()
    .prepare("SELECT e.id FROM edits e JOIN players p ON p.id = e.player_id WHERE e.post_type = 'matchday' AND p.role = 'player' AND json_extract(e.params, '$.agencyId') IS NULL ORDER BY e.created_at DESC LIMIT 1")
    .get() as { id: string } | undefined;
  return last?.id ?? null;
}

/**
 * Makes the sample for one prospect, in the background: he becomes an internal player (hidden, no agency
 * logo), his profile and next game are synced from zerozero, and the chosen matchday look is copied onto
 * him WITHOUT a photo — the look shows the marked "FOTO DO JOGADOR" place, and the message asks him for one
 * good photo (no time is spent hunting photos for thousands of players). When he sends it, it is uploaded on
 * his page and the sample becomes the real edit. sample_status: a sincronizar → pronta | erro.
 */
export function startSample(prospectId: string) {
  const p = getProspect(prospectId);
  if (!p || p.sample_status === "a sincronizar") return;
  const source = sampleSource();
  if (!source) {
    setSample(p.id, "erro: não há nenhuma edit de matchday para usar como modelo");
    return;
  }
  (async () => {
    setSample(p.id, "a sincronizar");
    const playerId = p.player_id && repo.getPlayer(p.player_id) ? p.player_id : await createProspectPlayer(p);
    setSample(p.id, "a sincronizar", { player_id: playerId });
    const sync = await syncPlayer(playerId);
    if (sync.error) throw new Error(sync.error);
    const editId = copyEditToPlayer(source, playerId, { sameColors: false });
    // Always the photo-less version (even if a photo of him exists): the sample is the "send me a photo" one.
    if (editId) {
      const e = repo.getEdit(editId)!;
      if (e.photo_id) repo.saveEdit({ id: e.id, player_id: e.player_id, post_type: e.post_type, params: e.params, content: e.content, photo_id: null });
    }
    setSample(p.id, editId ? "pronta" : "erro: a edit não foi criada", { sample_edit_id: editId });
  })().catch((e) => {
    console.error("[prospeção] amostra", p.name, e);
    setSample(p.id, `erro: ${(e as Error).message}`.slice(0, 200));
  });
}

/**
 * His internal player record (role "prospect": hidden from the agency's lists, no NEYOD logo). zerozero
 * players carry their zerozero link; college players carry none: their club is their school's team
 * (lib/college.ts), whose schedule and box scores the sync reads — so Criar and the sample find his next game.
 */
async function createProspectPlayer(p: Prospect): Promise<string> {
  const parts = p.name.split(" ");
  const college = isCollege(p);
  const playerId = repo.createPlayer({ first_name: parts[0], last_name: parts.slice(1).join(" "), zerozero_url: college ? null : p.zz_url });
  db().prepare("UPDATE players SET role = 'prospect' WHERE id = ?").run(playerId);
  // His roster / zerozero headshot as his profile photo: the cutout step recognises him by this face in
  // shots with team-mates (lib/cutout.ts playerHints). Without it a new client's first photos had no face to
  // match and fell back to the kit, which picked a team-mate in the same shirt (Fermin Rodriguez, 4/11).
  if (p.thumb_url) db().prepare("UPDATE players SET photo_url = COALESCE(NULLIF(photo_url, ''), ?) WHERE id = ?").run(p.thumb_url, playerId);
  if (college) {
    const clubId = await ensureCollegeClub(p.club, p.club_url);
    // Locked: no other source may move him to another club.
    db()
      .prepare("UPDATE players SET club_id = ?, club_locked = 1, position = ?, number = ?, nationality = ? WHERE id = ?")
      .run(clubId, p.position, p.number, p.nationality, playerId);
  }
  const pl = repo.getPlayer(playerId)!;
  repo.savePlayerPrefs(playerId, { ...pl.prefs, hideAgency: true });
  return playerId;
}

/**
 * His internal player record, created on first need: for a client, his photos, the Criar page and his edits
 * all hang on it. The first time it also syncs his games (zerozero, or his school's schedule) in the
 * background, so Criar finds his next fixture.
 */
export async function ensureProspectPlayer(prospectId: string): Promise<string | null> {
  const p = getProspect(prospectId);
  if (!p) return null;
  if (p.player_id && repo.getPlayer(p.player_id)) return p.player_id;
  const playerId = await createProspectPlayer(p);
  db().prepare("UPDATE prospects SET player_id = ? WHERE id = ?").run(playerId, prospectId);
  syncPlayer(playerId).catch((e) => console.error("[prospeção] sync", p.name, e));
  return playerId;
}

/** After the user uploads a photo of a prospect himself (his page), the sample can be made again. */
export function resetSample(prospectId: string) {
  db().prepare("UPDATE prospects SET sample_status = '', sample_edit_id = NULL WHERE id = ?").run(prospectId);
}

/* ---------------- the messages (in his language) ---------------- */

const setting = (key: string) => (db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined)?.value;

/** Where the user's own version of a message is saved: soccer under the original keys, basketball under its own. */
const templateKey = (kind: string, lang: Lang, sport: Sport) => (sport === "basketball" ? `prospect_bb_${kind}_${lang}` : `prospect_${kind}_${lang}`);

/** The three messages in one language and sport: the user's saved version, else the built-in one (prospect-lang.ts). */
export function templatesFor(lang: Lang, sport: Sport = "soccer"): Templates {
  const d = defaultsFor(sport, lang);
  // Portuguese (soccer) was saved under the first, language-less keys.
  const get = (kind: string) => setting(templateKey(kind, lang, sport)) || (lang === "pt" && sport === "soccer" ? setting(`prospect_${kind}`) : undefined);
  return { message: get("message") || d.message, plans: get("plans") || d.plans, followup: get("followup") || d.followup };
}

export function allTemplates(sport: Sport = "soccer"): Record<Lang, Templates> {
  return Object.fromEntries(LANGS.map((l) => [l, templatesFor(l, sport)])) as Record<Lang, Templates>;
}

export function saveProspectSettings(lang: Lang, t: Templates, sampleEditId: string, sport: Sport = "soccer") {
  const set = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const d = defaultsFor(sport, lang);
  set.run(templateKey("message", lang, sport), t.message.trim() || d.message);
  set.run(templateKey("plans", lang, sport), t.plans.trim() || d.plans);
  set.run(templateKey("followup", lang, sport), t.followup.trim() || d.followup);
  set.run("prospect_sample_edit", sampleEditId);
}

/** The follow-up went out: stamped, so the page stops asking for it. */
export function markFollowedUp(id: string) {
  db().prepare("UPDATE prospects SET followed_up_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(id);
}

/* ---------------- finding his Instagram ---------------- */

export type IgCandidate = { h: string; s: number };

/** Paths on instagram.com that are not accounts. */
const NOT_ACCOUNTS = new Set(["p", "reel", "reels", "explore", "stories", "tv", "accounts", "about", "legal", "directory", "web", "developer"]);
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * Scores the accounts a search returned for one player: his first and last name inside the handle count most
 * (dots, underscores and digits ignored), how often the result pages cite the account counts a little, and
 * fan pages / his club's own account are pushed out. Only accounts that carry at least his last name (or his
 * one-word name) are kept, best first — they are suggestions: the user confirms each one.
 */
export function scoreHandles(name: string, club: string, counts: Map<string, number>): IgCandidate[] {
  const tokens = fold(name).split(/[^a-z]+/).filter((t) => t.length >= 3);
  const first = tokens[0] ?? "";
  const last = tokens.length > 1 ? tokens[tokens.length - 1] : "";
  const clubTokens = fold(club).split(/[^a-z]+/).filter((t) => t.length >= 4);
  const out: IgCandidate[] = [];
  for (const [h, n] of counts) {
    const flat = fold(h).replace(/[^a-z]/g, "");
    let sc = 0;
    if (last && flat.includes(last)) sc += 3;
    if (first && flat.includes(first)) sc += last ? 2 : 4;
    if (last && first && flat.includes(first) && flat.includes(last)) sc += 2;
    // Middle names (e.g. "martimrafortes": r(odrigues) a(…) between) still count a little.
    if (tokens.slice(1, -1).some((t) => flat.includes(t))) sc += 1;
    sc += Math.min(n, 5) * 0.3;
    if (/fan|fas|oficial.?page|news|tv$/.test(flat)) sc -= 5;
    if (clubTokens.some((t) => flat.includes(t)) && !(last && flat.includes(last))) sc -= 4;
    const enough = last ? flat.includes(last) || (flat.includes(first) && sc >= 4) : flat.includes(first);
    if (enough && sc >= 3) out.push({ h, s: Math.round(sc * 10) / 10 });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, 3);
}

/** The Brave Search API key (Prospeção → settings), when the user has one: the official, reliable way. */
export function braveKey(): string {
  return (db().prepare("SELECT value FROM settings WHERE key = 'brave_api_key'").get() as { value: string } | undefined)?.value?.trim() ?? "";
}

export function saveBraveKey(key: string) {
  db().prepare("INSERT INTO settings (key, value) VALUES ('brave_api_key', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key.trim());
}

const run = promisify(execFile);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
class RateLimited extends Error {}
class BudgetReached extends Error {}

/**
 * Brave API spending guard. The free plan is a monthly credit (≈ $0.005 a search, ~$5 of credit — see the
 * Brave dashboard): every API request is counted here per calendar month, and the search stops BEFORE the
 * month's limit (default 800 ≈ $4), so it never goes out of pocket. The limit can be changed on the page.
 */
const DEFAULT_MONTHLY_LIMIT = 800;
const thisMonth = () => new Date().toISOString().slice(0, 7);

export function braveUsage(): { month: string; count: number; limit: number } {
  const get = (k: string) => (db().prepare("SELECT value FROM settings WHERE key = ?").get(k) as { value: string } | undefined)?.value;
  const u = JSON.parse(get("brave_usage") || "{}") as { month?: string; count?: number };
  const limit = Number(get("brave_monthly_limit")) || DEFAULT_MONTHLY_LIMIT;
  return { month: thisMonth(), count: u.month === thisMonth() ? (u.count ?? 0) : 0, limit };
}

function countBraveRequest() {
  const u = braveUsage();
  db().prepare("INSERT INTO settings (key, value) VALUES ('brave_usage', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify({ month: u.month, count: u.count + 1 }));
}

export function setBraveLimit(limit: number) {
  db().prepare("INSERT INTO settings (key, value) VALUES ('brave_monthly_limit', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(Math.max(0, Math.round(limit))));
}

/** Every instagram.com/<account> cited in a piece of text, counted. */
function countHandles(text: string, counts = new Map<string, number>()) {
  for (const m of text.matchAll(/instagram\.com\/([A-Za-z0-9_.]{2,30})\/?/g)) {
    const h = m[1].replace(/\.+$/, "");
    if (NOT_ACCOUNTS.has(h.toLowerCase())) continue;
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  return counts;
}

type Hit = { url: string; title: string; description: string };

const FOOTBALL = /futebol|football|futbol|soccer|jogador|player|atleta|athlete|⚽|guarda.?redes|goalkeeper|defesa|defender|medio|midfielder|avancado|striker|winger|extremo|lateral/;
const strip = (s: string) => fold(s.replace(/<[^>]+>/g, " ").replace(/&#x27;|&quot;|&amp;/g, " "));

/**
 * Scores the accounts found in one search for him, on EVIDENCE that the account is his — not on the handle
 * looking like his name (homonyms and fan pages were most of the old suggestions):
 *  • an instagram.com profile whose title carries his display name ("Moisés Conceição (@_moises.conceicao_)"),
 *    stronger when its bio mentions his club or football;
 *  • the account @mentioned next to his name in a page about him (club post, news photo credit, a page
 *    like dasOportunidades that tags the players: "Bem-vindo @x ao …", "Foto: @x/Instagram");
 *  • the handle containing his names only adds a little on top of real evidence.
 * Only accounts with at least one piece of evidence are kept, best first, at most 3.
 */
export function scoreEvidence(name: string, club: string, hits: Hit[]): IgCandidate[] {
  const tokens = fold(name).split(/[^a-z]+/).filter((t) => t.length >= 3);
  const first = tokens[0] ?? "";
  const last = tokens.length > 1 ? tokens[tokens.length - 1] : "";
  const oneWord = !last;
  // The club as a phrase without its legal prefixes ("AD Marco 09" → "marco 09", "SC Vianense SAD" →
  // "vianense"): single generic words like "marco" alone matched other people's names.
  const clubPhrase = fold(club)
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !["ad", "sc", "fc", "cd", "ud", "gd", "cf", "sad", "clube", "club", "futebol", "sport", "de", "da", "do"].includes(w))
    .join(" ");
  const hasName = (t: string) => (oneWord ? new RegExp(`(^|[^a-z])${first}([^a-z]|$)`).test(t) : t.includes(first) && t.includes(last));
  const hasClub = (t: string) => !!clubPhrase && t.includes(clubPhrase);
  // Proof that a text is about a footballer like him: his club, or (for full names) football words.
  const context = (t: string) => hasClub(t) || (!oneWord && FOOTBALL.test(t));
  const score = new Map<string, number>();
  const evidence = new Set<string>();
  const add = (h: string, n: number, ev = false) => {
    const k = h.replace(/\.+$/, "");
    if (NOT_ACCOUNTS.has(k.toLowerCase())) return;
    score.set(k, (score.get(k) ?? 0) + n);
    if (ev) evidence.add(k);
  };
  for (const r of hits) {
    const title = strip(r.title);
    const desc = strip(r.description);
    const all = `${title} ${desc}`;
    const profile = /instagram\.com\/([A-Za-z0-9_.]{2,30})\/?(?:\?|$)/.exec(r.url);
    if (profile && !NOT_ACCOUNTS.has(profile[1].toLowerCase())) {
      // "Display Name (@handle)": his name as the display name, AND his club / football in the bio.
      const display = title.split("(@")[0];
      if (hasName(display) && context(desc)) add(profile[1], 10, true);
      else if (hasName(display)) add(profile[1], 3);
    }
    // @mentions in a text about him (his name + his club / football): club posts, photo credits, tag pages.
    if (hasName(all) && context(all)) {
      for (const m of `${r.title} ${r.description}`.matchAll(/@([A-Za-z0-9_.]{2,30})/g)) {
        const flat = fold(m[1]).replace(/[^a-z]/g, "");
        if ((first && flat.includes(first)) || (last && flat.includes(last))) add(m[1], hasClub(all) ? 8 : 6, true);
      }
    }
  }
  for (const h of score.keys()) {
    const flat = fold(h).replace(/[^a-z]/g, "");
    if (last && flat.includes(last)) score.set(h, score.get(h)! + 1.5);
    if (first && flat.includes(first)) score.set(h, score.get(h)! + 1);
    if (/fan|oficialpage|news|tv$|scout|oportunidades|futebol|football|club|clube/.test(flat) && !(last && flat.includes(last))) score.set(h, score.get(h)! - 6);
  }
  return [...score.entries()]
    .filter(([h, sc]) => evidence.has(h) && sc >= 7)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h, sc]) => ({ h, s: Math.round(sc * 10) / 10 }));
}

/**
 * One search about him: "Name Surname" + his club + instagram, open (not limited to instagram.com) so club
 * posts, news credits and tag pages that @mention him come back too. With an API key: Brave's official
 * Search API (titles and descriptions as JSON). Without: Brave's public results page through the system's
 * curl (Brave answers Node's own fetch with 429), scored on the handle only — much weaker.
 */
async function searchInstagram(p: Prospect): Promise<IgCandidate[]> {
  const key = braveKey();
  if (key) {
    const u = braveUsage();
    if (u.count >= u.limit) throw new BudgetReached(`${u.count}/${u.limit}`);
    // College players: the sport tells his account apart from namesakes at the same school.
    const q = `"${p.name}" ${p.club} ${p.division && isCollege(p) ? `${p.sport === "basketball" ? "basketball" : "soccer"} ` : ""}instagram`;
    countBraveRequest();
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=20`, {
      headers: { Accept: "application/json", "X-Subscription-Token": key },
    });
    if (res.status === 429) throw new RateLimited("429");
    if (!res.ok) throw new Error(`Brave API HTTP ${res.status}`);
    const json = (await res.json()) as { web?: { results?: { url: string; title?: string; description?: string }[] } };
    return scoreEvidence(p.name, p.club, (json.web?.results ?? []).map((r) => ({ url: r.url, title: r.title ?? "", description: r.description ?? "" })));
  }
  const q = `site:instagram.com "${p.name}"`;
  const { stdout } = await run("curl", ["-s", "-L", "--max-time", "25", "-A", UA, "-H", "Accept-Language: pt-PT,pt;q=0.9,en;q=0.8", "-w", "\n%{http_code}", `https://search.brave.com/search?q=${encodeURIComponent(q)}`], { maxBuffer: 8 << 20 });
  const status = stdout.slice(stdout.lastIndexOf("\n") + 1).trim();
  if (status === "429") throw new RateLimited("429");
  if (status !== "200") throw new Error(`HTTP ${status}`);
  return scoreHandles(p.name, p.club, countHandles(stdout));
}

/** For checking the search by hand: what it suggests for one name + club. */
export async function debugIgSearch(name: string, club: string) {
  return searchInstagram({ name, club } as Prospect);
}

const gi = globalThis as unknown as { igSearch?: { running: boolean; stop: boolean; done: number; total: number; found: number; error: string | null } };

export function igSearchState() {
  const s = gi.igSearch;
  return s ? { running: s.running, done: s.done, total: s.total, found: s.found, error: s.error } : { running: false, done: 0, total: 0, found: 0, error: null };
}

export function stopIgSearch() {
  if (gi.igSearch) gi.igSearch.stop = true;
}

/** Pause between searches: the API allows ~1/s; the public page only a person's pace. */
const gapMs = () => (braveKey() ? 1200 : 20_000);
/** When Brave says "too many": wait this long, then carry on from the same player. */
const BACKOFF_MS = 15 * 60_000;

/**
 * Looks for the Instagram of every player who has none yet and was never searched (Liga 3 first, club by
 * club), in the background. Stores the candidates; never fills `instagram` itself — the user confirms.
 * Rate-limited: pauses 15 min and resumes the same player (st.error says so meanwhile). Resumable across
 * runs: players already searched are skipped.
 */
export function startIgSearch(division = "") {
  if (gi.igSearch?.running) return;
  // Only one division when the page is filtered to it (e.g. the UAE players first); else all, Liga 3 first.
  const todo = db()
    .prepare(`SELECT * FROM prospects WHERE instagram = '' AND ig_checked_at IS NULL ${division ? "AND division = @division" : ""} ORDER BY division = 'Liga 3' DESC, club, name`)
    .all(division ? { division } : {}) as Prospect[];
  gi.igSearch = { running: true, stop: false, done: 0, total: todo.length, found: 0, error: null };
  const st = gi.igSearch;
  const save = db().prepare("UPDATE prospects SET ig_candidates = ?, ig_checked_at = datetime('now') WHERE id = ?");
  const sleep = async (ms: number) => {
    for (const end = Date.now() + ms; Date.now() < end && !st.stop; ) await new Promise((r) => setTimeout(r, 1000));
  };
  (async () => {
    let errors = 0;
    for (let i = 0; i < todo.length && !st.stop; ) {
      const p = todo[i];
      try {
        const c = await searchInstagram(p);
        save.run(JSON.stringify(c), p.id);
        if (c.length) st.found++;
        st.done++;
        st.error = null;
        errors = 0;
        i++;
        await sleep(gapMs());
      } catch (e) {
        if (e instanceof BudgetReached) {
          st.error = `Limite do mês atingido (${e.message} pesquisas na API do Brave): a procura parou para não pagares nada. Retoma no próximo mês, ou sobe o limite se o teu crédito der.`;
          break;
        }
        if (e instanceof RateLimited) {
          const until = new Date(Date.now() + BACKOFF_MS).toTimeString().slice(0, 5);
          st.error = `O Brave pediu uma pausa: retoma sozinho às ${until}${braveKey() ? "" : " (com uma chave da API fica muito mais rápido)"}.`;
          await sleep(BACKOFF_MS);
        } else {
          console.error("[instagram]", p.name, (e as Error).message);
          if (++errors >= 5) {
            st.error = `A procura parou: ${(e as Error).message}. Volta a carregar para continuar de onde ficou.`;
            break;
          }
          i++;
        }
      }
    }
  })().finally(() => {
    st.running = false;
  });
}

/** The user confirmed one candidate: it becomes his Instagram. */
export function confirmInstagram(id: string, handle: string) {
  updateProspect(id, { instagram: handle });
}

/** The user rejected one candidate: it leaves the list (the next one shows). */
export function rejectInstagram(id: string, handle: string) {
  const p = getProspect(id);
  if (!p) return;
  const rest = (JSON.parse(p.ig_candidates || "[]") as IgCandidate[]).filter((c) => c.h !== handle);
  db().prepare("UPDATE prospects SET ig_candidates = ? WHERE id = ?").run(JSON.stringify(rest), id);
}

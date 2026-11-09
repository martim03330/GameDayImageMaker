import { crestColors, storeRemoteImage } from "./crest";
import { db } from "./db";
import * as repo from "./repo";
import {
  canonicalSlug,
  collegeSportOf,
  fetchCollegePrograms,
  fetchWmtSchedule,
  parseBoxScore,
  parseIcsStarts,
  parseSchedule,
  sidearmSportId,
  type BoxScore,
  type CollegeGame,
  type CollegeSport,
} from "./sources/college";
import { fetchImage, fetchJson, fetchText, forgetText } from "./sources/http";
import { US_STATE_TZ, wallClock } from "./timezone";

/**
 * US college teams as clubs: a club whose source_url is its school's soccer or basketball schedule page
 * (https://{athletics site}/sports/{mens|womens}-{soccer|basketball}/schedule, or a short slug: msoc, wbball…).
 * The sport is read from that path (collegeSportOf). Its timezone is the school's own (from its
 * state in the NCAA directory): every kick-off is stored in that zone (fixtures.time_tz) and edits show it
 * with the player's second clock. Sync, results and box scores: lib/sync.ts (syncCollegePlayer).
 */

const log = (...a: unknown[]) => console.log("[college]", ...a);

/** Is this club source a college (soccer or basketball) schedule page? */
export const isCollegeSource = (u: string | null | undefined) => !!u && /\/sports\/[a-z-]*(?:soc|bball|bask|bkb)[a-z]*\/schedule\/?$/.test(u);

export const genderOf = (url: string): "M" | "F" | null => (/womens|wsoc|wbball|wbkb|w-bask/.test(url) ? "F" : /mens|msoc|mbball|mbkb|m-bask/.test(url) ? "M" : null);

/**
 * Every game of the team this season, with kick-offs as wall-clock times in the school's zone `tz`.
 * Sidearm: the schedule page (opponent, home/away, logo, result, box score link) + its calendar feed for the
 * exact instant of each kick-off. WMT: their JSON API (exact instants; results come from the box scores).
 */
/** The US zones a school can be in. */
const US_ZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "America/Puerto_Rico"];

/**
 * The school's real zone, read from its own home games: the page writes their local time, the calendar feed
 * their exact instant — the zone where both agree. Corrects the state's main zone for split states
 * (Lincoln Memorial, Harrogate TN, is on Eastern time). null when no home game has both.
 */
export function zoneFromGames(pairs: { at: Date; date: string; time: string }[], prefer = ""): string | null {
  // Every zone that reads each game right gets its vote: in summer and autumn Phoenix (no DST) and Los Angeles
  // (PDT) are the same clock, so a first-match pick would put every Pacific school in Arizona. On a tie the
  // school's own zone (its state, NCAA directory) wins, then the order of US_ZONES.
  const votes = new Map<string, number>();
  for (const p of pairs) {
    for (const zone of US_ZONES) {
      const w = wallClock(p.at, zone);
      if (w.date === p.date && w.time === p.time) votes.set(zone, (votes.get(zone) ?? 0) + 1);
    }
  }
  const best = Math.max(0, ...votes.values());
  if (!best) return null;
  if (prefer && votes.get(prefer) === best) return prefer;
  return US_ZONES.find((z) => votes.get(z) === best) ?? null;
}

export async function fetchCollegeSchedule(scheduleUrl: string, tz: string, gender: "M" | "F"): Promise<{ games: CollegeGame[]; platform: string; html: string; zone: string }> {
  const origin = new URL(scheduleUrl).origin;
  // The sport from the page's own path; the slug as the platforms name it (mens-soccer, womens-basketball…).
  const slug = canonicalSlug(collegeSportOf(scheduleUrl), gender);
  let html = "";
  try {
    html = (await fetchText(scheduleUrl)).text;
    forgetText(scheduleUrl);
  } catch (e) {
    log("schedule page", scheduleUrl, (e as Error).message);
  }
  const page = html ? parseSchedule(html, scheduleUrl) : null;
  if (page?.length) {
    // The calendar feed gives the exact instant (UTC) of each game, by the same game id as the page.
    const sportId = sidearmSportId(html, slug);
    if (sportId) {
      const ics = `${origin}/calendar.ashx/calendar.ics?sport_id=${sportId}`;
      const starts = await fetchText(ics)
        .then((r) => (forgetText(ics), parseIcsStarts(r.text)))
        .catch(() => new Map<string, Date>());
      const zone = zoneFromGames(page.filter((g) => g.home && g.time && starts.has(g.id)).map((g) => ({ at: starts.get(g.id)!, date: g.date, time: g.time })), tz) ?? tz;
      for (const g of page) {
        const at = starts.get(g.id);
        // A game with no time on the page (TBA) keeps none, even if the feed puts it at midnight.
        if (at && g.time) Object.assign(g, { start: at }, wallClock(at, zone));
      }
      return { games: page, platform: "sidearm", html, zone };
    }
    return { games: page, platform: "sidearm", html, zone: tz };
  }
  // No Sidearm schedule in the page: a WMT site (UCLA…) answers on its API.
  const wmt = await fetchWmtSchedule(origin, slug, fetchJson).catch(() => null);
  if (wmt?.games.length) {
    for (const g of wmt.games) if (g.start) Object.assign(g, wallClock(g.start, tz));
    return { games: wmt.games, platform: "wmt", html, zone: tz };
  }
  return { games: [], platform: "", html, zone: tz };
}

export async function fetchBoxScore(url: string, sport: CollegeSport = "soccer"): Promise<BoxScore | null> {
  try {
    const { text } = await fetchText(url);
    forgetText(url);
    return parseBoxScore(text, sport);
  } catch (e) {
    log("box score", url, (e as Error).message);
    return null;
  }
}

type ProgramRow = { id: string; school: string; team_name: string; division: string; gender: "M" | "F"; domain: string; roster_url: string; timezone: string; conference?: string; sport: CollegeSport };

/** The schools' zones and conferences come from the NCAA directory (their state): filled once, when missing. */
async function programZones() {
  const conn = db();
  const sports = conn.prepare("SELECT DISTINCT sport FROM college_programs WHERE timezone = ''").pluck().all() as CollegeSport[];
  const set = conn.prepare("UPDATE college_programs SET timezone = ?, conference = ? WHERE domain = ? AND division = ? AND gender = ? AND sport = ?");
  for (const sport of sports) {
    const list = await fetchCollegePrograms(fetchJson, sport);
    for (const p of list) set.run(US_STATE_TZ[p.state] ?? "America/New_York", p.conference, p.domain, p.division, p.gender, p.sport);
  }
}

/** The program a roster / schedule URL belongs to (its sport's first: a school's conference can differ by sport). */
function programOf(url: string): ProgramRow | null {
  const u = new URL(url);
  const domain = u.host.replace(/^www\./, "");
  const gender = genderOf(url);
  const sport = collegeSportOf(url);
  const all = db().prepare("SELECT * FROM college_programs WHERE replace(domain, 'www.', '') = ?").all(domain) as ProgramRow[];
  const rows = all.some((r) => r.sport === sport) ? all.filter((r) => r.sport === sport) : all;
  return rows.find((r) => r.roster_url === url) ?? rows.find((r) => !gender || r.gender === gender) ?? rows[0] ?? null;
}

/**
 * The college team as a club (created once): name as the site writes it, schedule page as its source, the
 * school's time zone, its conference as league, and the athletics site's logo as crest (colours from it).
 */
export async function ensureCollegeClub(team: string, rosterUrl: string): Promise<string | null> {
  await programZones().catch((e) => log("zones", (e as Error).message));
  const prog = programOf(rosterUrl);
  const gender = genderOf(rosterUrl) ?? prog?.gender ?? "M";
  const scheduleUrl = rosterUrl.replace(/\/roster\/?$/, "/schedule");
  const tz = prog?.timezone || "America/New_York";
  const existing = repo.findClub(team, scheduleUrl);
  if (existing?.source_url === scheduleUrl) return existing.id;
  let zone = tz;
  let candidates: string[] = [];
  try {
    const sched = await fetchCollegeSchedule(scheduleUrl, tz, gender);
    zone = sched.zone;
    candidates = crestCandidates(scheduleUrl, sched.html, team);
  } catch {
    candidates = crestCandidates(scheduleUrl, "", team);
  }
  let crest: string | null = null;
  let colors: [string, string] = ["#0b3d91", "#ffffff"];
  for (const c of candidates) {
    try {
      const buf = await fetchImage(c);
      crest = await storeRemoteImage(buf, "crests");
      colors = await crestColors(buf);
      break;
    } catch {
      /* next candidate */
    }
  }
  const id = repo.saveClub({ name: team, league: prog?.conference ?? "", crest, primary_color: colors[0], secondary_color: colors[1] });
  repo.setClubSource(id, scheduleUrl);
  repo.setClubTimezone(id, zone);
  log(`clube ${team}: ${zone}, ${crest ? "com" : "sem"} emblema`);
  return id;
}

/**
 * Where the school's own logo is. Sidearm: /images/logos/site/site.png on every site. WMT: a media item of
 * the page whose name carries the school's name and "logo" ("UCLA_Schedule_Logo.png"), plain ones first.
 */
export function crestCandidates(scheduleUrl: string, html: string, team: string): string[] {
  const out = [`${new URL(scheduleUrl).origin}/images/logos/site/site.png`];
  const json = /<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (!json) return out;
  const words = team
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !["university", "college", "athletics", "the", "state"].includes(w));
  try {
    const arr = JSON.parse(json) as unknown[];
    const v = (i: unknown) => (typeof i === "number" && i >= 0 && i < arr.length && typeof arr[i] === "string" ? (arr[i] as string) : "");
    const scored: { url: string; score: number }[] = [];
    for (const o of arr) {
      if (!o || typeof o !== "object" || Array.isArray(o)) continue;
      const r = o as Record<string, unknown>;
      if (!("url" in r && "original_name" in r)) continue;
      const label = `${v(r.original_name)} ${v(r.title)}`.toLowerCase();
      if (!/logo/.test(label) || !words.some((w) => label.includes(w))) continue;
      scored.push({ url: v(r.url), score: (/background|bg|banner|wordmark/.test(label) ? -2 : 0) + (/schedule|primary|main/.test(label) ? 1 : 0) });
    }
    out.unshift(...scored.filter((x) => x.url).sort((a, b) => b.score - a.score).map((x) => x.url));
  } catch {
    /* not a payload */
  }
  return [...new Set(out)];
}

/** The school's gender for a club source (men's / women's), from its URL or its program. */
export function collegeGender(scheduleUrl: string): "M" | "F" {
  return genderOf(scheduleUrl) ?? programOf(scheduleUrl)?.gender ?? "M";
}

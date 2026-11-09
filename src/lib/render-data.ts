import { accentFor, kitMatch } from "./color";
import { db } from "./db";
import { readCareer } from "./career";
import { getClub, getFixture, getMatch, getPlayer, getSettings, listClubs, listFixtures, listMatches, listPhotos } from "./repo";
import { clubTimezone, playerRefTag, playerRefTz } from "./timezone";
import { fileUrl } from "./storage";
import { scenesForPlayer } from "./scenes";
import { zzGameId } from "./sources/zerozero";
import { venuesForGames } from "./venues";
import type { Club, EditContent, Match, PhotoMeta, Player, PostType, StatItem, TemplateParams } from "./types";
import { POST_TYPES } from "./types";
import { composeRenderData, type RenderContext } from "@/templates/compose";
import type { RenderData } from "@/templates/types";

// Every word that ends up inside an edit is English: the posts are for an international audience.
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

/** Starting style for a player with no saved preference, derived from the club colours. */
export function defaultStyle(club: Club | null): TemplateParams {
  const primary = club?.primary_color ?? "#0b3d91";
  const secondary = club?.secondary_color ?? "#ffffff";
  return {
    templateId: "spotlight",
    side: "right",
    primary,
    accent: accentFor(primary, secondary),
    text: "#ffffff",
    bgStyle: "rays",
    insetTilt: 0,
    grain: true,
  };
}

export function playerStyle(player: Player): TemplateParams {
  return player.style ?? defaultStyle(getClub(player.club_id));
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function statsFor(matches: Match[]): StatItem[] {
  const ratings = matches.map((m) => m.rating).filter((r): r is number => r != null);
  const items: StatItem[] = [
    { label: "Games", value: String(matches.length) },
    { label: "Goals", value: String(sum(matches.map((m) => m.goals))) },
    { label: "Assists", value: String(sum(matches.map((m) => m.assists))) },
  ];
  if (ratings.length) items.push({ label: "Rating", value: avg(ratings).toFixed(1) });
  else items.push({ label: "Minutes", value: String(sum(matches.map((m) => m.minutes))) });
  return items;
}


/** "2026-09-20" → "20 SEP" */
function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  // The agency doesn't want the day of the week in edits: only the day and the month.
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/**
 * zerozero round codes → caption text (in English). League rounds are plain numbers ("5" → MATCHDAY 5);
 * cups use codes: "2E" qualifying round, "2PE" preliminary, "OF" round of 16, "QF" quarters, "MF" semis, "F" final.
 */
export function roundLabel(code: string | null | undefined): string {
  const c = (code ?? "").trim().toUpperCase().replace(/^J(?=\d)/, "");
  if (!c) return "";
  if (/^\d+$/.test(c)) return `MATCHDAY ${c}`;
  let m = /^(\d+)PE$/.exec(c);
  if (m) return `${ordinal(m[1])} PRELIMINARY ROUND`;
  m = /^(\d+)E$/.exec(c);
  if (m) return `${ordinal(m[1])} QUALIFYING ROUND`;
  m = /^(\d+)Q$/.exec(c);
  if (m) return `${ordinal(m[1])} PRELIMINARY ROUND`;
  const named: Record<string, string> = {
    F: "FINAL",
    MF: "SEMI-FINALS",
    "1/2": "SEMI-FINALS",
    QF: "QUARTER-FINALS",
    "1/4": "QUARTER-FINALS",
    OF: "ROUND OF 16",
    "1/8": "ROUND OF 16",
    "1/16": "ROUND OF 32",
    "1/32": "ROUND OF 64",
    PO: "PLAY-OFF",
    "3/4": "THIRD PLACE",
  };
  if (named[c]) return named[c];
  if (/^PO/.test(c)) return "PLAY-OFF";
  // Unknown code: show it as is, never with "MATCHDAY".
  return c;
}

/** "2" → "2ND" (English ordinals, for cup rounds). */
function ordinal(n: string): string {
  const v = Number(n);
  const suffix = v % 100 >= 11 && v % 100 <= 13 ? "TH" : ["TH", "ST", "ND", "RD"][v % 10] ?? "TH";
  return `${v}${suffix}`;
}

const matchdayLabel = (m: { competition: string; matchday: string }) => [m.competition, roundLabel(m.matchday)].filter(Boolean).join(" · ");

/** Pre-fills texts and numbers for a post from the player's registered matches (or a given match / fixture). */
/** How the club is written in edits: the short name the agency chose (e.g. "AAC/OAF"), else the full name. */
function clubLabel(club: Club | null | undefined): string | undefined {
  return club ? club.short_name || club.name : undefined;
}

export function defaultContent(player: Player, postType: PostType, opts: { matchId?: string | null; fixtureId?: string | null } = {}): EditContent {
  const club = getClub(player.club_id);
  const matches = listMatches(player.id, 50);
  const played = matches.filter((m) => m.minutes > 0 || m.source === "manual");
  const match = (opts.matchId && getMatch(opts.matchId)) || played[0];
  const now = new Date();

  const content: EditContent = {
    kicker: POST_TYPES.find((p) => p.id === postType)!.kicker,
    subline: "",
    firstName: player.first_name,
    lastName: player.last_name,
    stats: [],
  };

  if (postType === "totw" || postType === "potm") {
    content.insetPhotoId = listPhotos(player.id, "inset")[0]?.id ?? null;
  }

  const scoreFrom = (m: Match) => {
    content.gameId = zzGameId(m.match_url);
    const us = clubLabel(club) ?? m.team;
    content.homeTeam = m.home ? us : m.opponent;
    content.awayTeam = m.home ? m.opponent : us;
    content.homeGoals = String(m.home ? m.goals_for : m.goals_against);
    content.awayGoals = String(m.home ? m.goals_against : m.goals_for);
    const ours = fileUrl(club?.crest);
    content.homeCrest = m.home ? ours : m.opponent_crest;
    content.awayCrest = m.home ? m.opponent_crest : ours;
  };

  switch (postType) {
    case "totw": {
      const league = match?.competition || club?.league || "";
      content.subline = [league, roundLabel(match?.matchday)].filter(Boolean).join(" · ");
      break;
    }
    case "potm": {
      const month = now.getMonth();
      const inMonth = played.filter((m) => {
        const d = new Date(m.date);
        return d.getMonth() === month && d.getFullYear() === now.getFullYear();
      });
      content.subline = `${MONTHS[month]} ${now.getFullYear()}`;
      content.stats = statsFor(inMonth);
      break;
    }
    case "form":
    case "stats": {
      const recent = played.slice(0, postType === "form" ? 6 : 5);
      content.subline = recent.length ? `LAST ${recent.length} GAMES` : "";
      content.stats = statsFor(recent);
      break;
    }
    case "goal":
    case "result": {
      const lf = !opts.matchId && opts.fixtureId ? getFixture(opts.fixtureId) : null;
      if (lf) {
        // Live goal: teams from the fixture, score as it stands now.
        content.gameId = zzGameId(lf.match_url);
        const us = clubLabel(club) ?? lf.team;
        const ours = fileUrl(club?.crest);
        content.homeTeam = lf.home ? us : lf.opponent;
        content.awayTeam = lf.home ? lf.opponent : us;
        content.homeCrest = lf.home ? ours : lf.opponent_crest;
        content.awayCrest = lf.home ? lf.opponent_crest : ours;
        content.homeGoals = String(lf.live_home ?? 0);
        content.awayGoals = String(lf.live_away ?? 0);
        content.subline = `${matchdayLabel(lf)}${matchdayLabel(lf) ? " · " : ""}VS ${lf.opponent.toUpperCase()}`;
        if (postType === "goal") content.kicker = lf.live_goals >= 3 ? "HAT-TRICK" : lf.live_goals === 2 ? "BRACE" : "GOAL";
        content.stats = [{ label: "Score", value: `${content.homeGoals}-${content.awayGoals}` }];
        break;
      }
      if (!match) break;
      scoreFrom(match);
      content.subline = `${matchdayLabel(match)}${matchdayLabel(match) ? " · " : ""}VS ${match.opponent.toUpperCase()}`;
      if (postType === "goal") {
        content.kicker = match.goals >= 3 ? "HAT-TRICK" : match.goals === 2 ? "BRACE" : "GOAL";
      }
      const s: StatItem[] = [];
      if (match.goals) s.push({ label: match.goals === 1 ? "Goal" : "Goals", value: String(match.goals) });
      if (match.assists) s.push({ label: match.assists === 1 ? "Assist" : "Assists", value: String(match.assists) });
      if (match.rating != null) s.push({ label: "Rating", value: match.rating.toFixed(1) });
      if (match.minutes) s.push({ label: "Minutes", value: String(match.minutes) });
      content.stats = s.slice(0, 4);
      break;
    }
    case "matchday": {
      const f = (opts.fixtureId && getFixture(opts.fixtureId)) || listFixtures(player.id)[0];
      if (f) {
        const us = clubLabel(club) ?? f.team;
        const ours = fileUrl(club?.crest);
        content.home = !!f.home;
        content.homeTeam = f.home ? us : f.opponent;
        content.awayTeam = f.home ? f.opponent : us;
        content.homeCrest = f.home ? ours : f.opponent_crest;
        content.awayCrest = f.home ? f.opponent_crest : ours;
        content.date = shortDate(f.date);
        content.time = f.time;
        // College games are written in the school's own zone (the edit converts from it, not from Portugal).
        if (f.time_tz) content.timeTz = f.time_tz;
        content.gameId = zzGameId(f.match_url);
        content.venue = (content.gameId && venuesForGames([content.gameId])[content.gameId]?.name) || f.venue || (f.home ? club?.stadium ?? "" : "");
        content.subline = matchdayLabel(f);
      } else {
        content.homeTeam = clubLabel(club) ?? "";
        content.homeCrest = fileUrl(club?.crest);
        content.date = shortDate(now.toISOString().slice(0, 10));
      }
      break;
    }
    case "transfer":
      content.toClubId = player.club_id;
      content.subline = club?.league ?? "";
      break;
    case "speed":
      // A quiet line under the number: the game it happened in, when there is one.
      content.speed = "";
      if (match) scoreFrom(match);
      content.subline = match ? `${matchdayLabel(match)}${matchdayLabel(match) ? " · " : ""}VS ${match.opponent.toUpperCase()}` : "";
      content.stats = [];
      break;
    case "welcome": {
      // The agency's new-player post: age, position and nationality, and the clubs he came through.
      const born = player.birth_date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      const age = born ? now.getFullYear() - +born[1] - (now.getMonth() + 1 < +born[2] || (now.getMonth() + 1 === +born[2] && now.getDate() < +born[3]) ? 1 : 0) : null;
      content.subline = player.role === "coach" ? "NEW HEAD COACH" : "NEW PLAYER";
      content.stats = [
        ...(age ? [{ label: "AGE", value: `${age} YEARS` }] : []),
        ...(player.position ? [{ label: "POSITION", value: positionEn(player.position).replace(/^Striker$/, "Forward").toUpperCase() }] : []),
        ...(player.nationality ? [{ label: "NATIONALITY", value: player.nationality.split(/[,/]/)[0].trim().toUpperCase() }] : []),
      ];
      content.career = readCareer(player.career).map((c) => ({ name: c.name, crest: fileUrl(c.crest) }));
      break;
    }
    case "press":
      // News headlines about him: added one by one from their links (Criar / editor). The subtitle is free
      // (e.g. "TAÇA DE PORTUGAL"), empty by default.
      content.subline = "";
      content.articles = [];
      break;
    case "renewal":
      content.until = player.contract_until.match(/\d{4}/)?.[0] ?? String(now.getFullYear() + 2);
      content.subline = clubLabel(club) ?? "";
      break;
  }
  return content;
}

function coords(lat: number | null, lon: number | null): string | undefined {
  if (lat == null || lon == null) return undefined;
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'`´]/g, "'").toLowerCase().trim();

/**
 * Scraped stadium names carry the city glued on the end ("Ticha Varna", "Ta’Qali National Stadium Ta’Qali").
 * Drop it: the looks print the stadium and the city separately.
 */
function stadiumName(stadium: string, city: string): string {
  if (!stadium || !city) return stadium;
  const s = fold(stadium);
  const c = fold(city);
  if (!s.endsWith(c) || s === c) return stadium;
  const kept = stadium.slice(0, stadium.length - city.length).trim();
  return kept || stadium;
}

/** A club for templates. With a player, its generated scenes come first in the order he hasn't used them yet. */
/** Player positions come from zerozero in Portuguese; edits print them in English. */
const POSITIONS: [RegExp, string][] = [
  [/treinador|coach|mister/i, "Head Coach"],
  [/guarda|keeper/i, "Goalkeeper"],
  [/(lateral|defesa)\s*direit/i, "Right back"],
  [/(lateral|defesa)\s*esquerd/i, "Left back"],
  [/central|defesa/i, "Centre back"],
  [/m[eé]dio\s*(defensivo|trinco)|trinco/i, "Defensive midfielder"],
  [/m[eé]dio\s*(ofensiv|atacante)/i, "Attacking midfielder"],
  [/m[eé]dio/i, "Central midfielder"],
  [/extremo\s*direit|ala\s*direit/i, "Right winger"],
  [/extremo\s*esquerd|ala\s*esquerd/i, "Left winger"],
  [/extremo|ala\b/i, "Winger"],
  [/ponta\s*de\s*lan|avan[cç]ado|atacante/i, "Striker"],
];

export function positionEn(position: string): string {
  return POSITIONS.find(([re]) => re.test(position))?.[1] ?? position;
}

export function renderClub(c: Club, playerId: string | null = null) {
  const scenes = scenesForPlayer(c.id, playerId);
  // Only the six freshest: looks picking at random then land on backdrops this player hasn't posted yet.
  const fresh = (xs: string[]) => xs.slice(0, 6);
  return {
    name: c.short_name || c.name,
    crestUrl: fileUrl(c.crest),
    city: c.city || undefined,
    founded: c.founded || undefined,
    stadium: stadiumName(c.stadium, c.city) || undefined,
    cityImageUrl: fileUrl(c.city_image),
    stadiumImages: [...fresh(scenes.stadium), ...(c.stadium_images ? (JSON.parse(c.stadium_images) as string[]) : []).map((f) => fileUrl(f)!)],
    backdrops: [...fresh(scenes.backdrops), ...(c.backdrops ? (JSON.parse(c.backdrops) as string[]) : []).map((f) => fileUrl(f)!)],
    cityImages: (c.city_images ? (JSON.parse(c.city_images) as string[]) : c.city_image ? [c.city_image] : []).map((f) => fileUrl(f)!),
    coords: coords(c.city_lat, c.city_lon),
    timezone: clubTimezone(c),
  };
}

/**
 * Photos that can't look professional in an edit: blurred (motion / focus), the player tiny in the
 * frame (face under 40px in the original), or a detail shot without the player's face or back.
 * They stay available by hand but are left out of the automatic picks.
 */
function isSoft(meta: PhotoMeta | null): boolean {
  if (!meta || meta.sharpness == null || meta.approved_by_user) return false;
  if (meta.pose !== "bust" && meta.sharpness < 15) return true;
  // A tiny face means the player is far away, except on back shots, where the face doesn't matter.
  if (meta.pose !== "back" && (meta.face_px ?? 0) > 0 && (meta.face_px ?? 0) < 40) return true;
  return !meta.face && !meta.back && meta.pose !== "back";
}

/** Lookups for one player's edits: their photos, all clubs and the agency branding. */
export function renderContext(playerId: string): RenderContext {
  const player = getPlayer(playerId);
  const settings = getSettings();
  const club = getClub(player?.club_id);
  const photos: RenderContext["photos"] = {};
  for (const p of listPhotos(playerId)) {
    // Automatic finds stay out of edits until someone approves them.
    if (p.kind === "player" && !p.approved) continue;
    const meta = p.meta ? (JSON.parse(p.meta) as PhotoMeta) : null;
    photos[p.id] = {
      url: fileUrl(p.file)!,
      cutoutUrl: p.cutout_status === "done" ? fileUrl(p.cutout) : null,
      kind: p.kind,
      face: meta?.face ?? null,
      aspect: meta ? meta.width / meta.height : null,
      // Big face, or no legs in the picture (the pose model tells, also for back shots): upper body only.
      bust: (!!meta?.face && meta.face[3] > 0.24) || meta?.legs === false,
      kit: meta?.kit_club === true ? 1 : meta?.kit_club === false ? 0 : club ? kitMatch(meta?.kit, club.primary_color, club.secondary_color) : 0.5,
      kitByUser: meta?.kit_club,
      cut: meta?.cut ?? {},
      facePx: meta?.face_px ?? 0,
      pose: meta?.pose,
      facing: meta?.facing,
      soft: isSoft(meta),
      headOnly: !!meta?.face && meta.face[3] > 0.38,
      messy: (meta?.intruders ?? 0) > 0 && !meta?.approved_by_user,
      others: meta?.others ?? null,
      himBox: meta?.him_box ?? null,
      natAlign: meta?.nat_align && meta.nat_align.cut === p.cutout ? { x: meta.nat_align.x, y: meta.nat_align.y, k: meta.nat_align.k, w: meta.nat_align.w, h: meta.nat_align.h, cw: meta.nat_align.cw, ch: meta.nat_align.ch } : null,
    };
  }
  const teamNames = Object.fromEntries(listClubs().filter((c) => c.short_name && c.short_name !== c.name).map((c) => [c.name, c.short_name]));
  const team = (t: string) => teamNames[t] ?? t;
  const clubs: RenderContext["clubs"] = {};
  for (const c of listClubs()) clubs[c.id] = renderClub(c, playerId);
  return {
    playerClubId: player?.club_id ?? null,
    photos,
    clubs,
    // Players the agency doesn't represent get no logo at all (Preferências das edits).
    // Players the agency doesn't represent get no agency logo. The user's own clients (Prospeção "cliente",
    // role prospect) carry his studio's discreet mark + Instagram handle instead, as promotion.
    agency: player?.prefs.hideAgency
      ? { name: "", logoUrl: null, logoDarkUrl: null, studio: player.role === "prospect" ? settings.studio_handle : undefined }
      : { name: settings.agency_name, logoUrl: fileUrl(settings.agency_logo), logoDarkUrl: fileUrl(settings.agency_logo_dark), tagline: settings.agency_tagline },
    player: { number: player?.number ?? "", position: positionEn(player?.position ?? ""), nationality: player?.nationality ?? "" },
    // His second clock: chosen by hand, else his nationality's (a Norwegian in the US: NOR), else Portugal.
    refTz: player ? playerRefTz(player.prefs, player.nationality) : undefined,
    refTag: player ? playerRefTag(player.prefs, player.nationality) : undefined,
    teamNames,
    fixtures: listFixtures(playerId).slice(0, 5).map((f) => ({
      date: f.date,
      time: f.time,
      opponent: team(f.opponent),
      opponentCrest: f.opponent_crest,
      home: !!f.home,
      competition: f.competition,
    })),
    venues: venuesForGames([...listMatches(playerId, 60).map((m) => zzGameId(m.match_url)), ...listFixtures(playerId, true).map((f) => zzGameId(f.match_url))]),
    matches: listMatches(playerId, 40)
      .filter((m) => m.minutes > 0 || m.source === "manual")
      .map((m) => ({
        date: m.date,
        opponent: team(m.opponent),
        opponentCrest: m.opponent_crest,
        home: !!m.home,
        goalsFor: m.goals_for,
        goalsAgainst: m.goals_against,
        goals: m.goals,
        assists: m.assists,
        minutes: m.minutes,
      })),
  };
}

export function buildRenderData(input: {
  playerId: string;
  postType: PostType;
  photoId: string | null;
  params: TemplateParams;
  content: EditContent;
}): RenderData {
  const ctx = renderContext(input.playerId);
  // The user's agency service: the client agency's own logo (white version on dark grounds), no tagline,
  // never NEYOD's — not even when the agency has no logo yet.
  if (input.params.agencyId) {
    const a = db().prepare("SELECT name, logo, logo_white FROM agencies WHERE id = ?").get(input.params.agencyId) as { name: string; logo: string | null; logo_white: string | null } | undefined;
    ctx.agency = a?.logo ? { name: a.name, logoUrl: fileUrl(a.logo_white ?? a.logo), logoDarkUrl: fileUrl(a.logo) } : { name: "", logoUrl: null, logoDarkUrl: null };
  }
  return composeRenderData(ctx, input);
}

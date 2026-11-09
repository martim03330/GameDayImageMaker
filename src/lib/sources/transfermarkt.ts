import * as cheerio from "cheerio";
import { fetchJson, fetchText } from "./http";
import type { ExternalFixture, ExternalMatch, ExternalProfile, Participation, SearchResult } from "./types";

const BASE = "https://www.transfermarkt.pt";
const IMG = "https://img.a.transfermarkt.technology";
const API = "https://tmapi.transfermarkt.technology";

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

function abs(href: string | undefined | null): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href.trim(), BASE).toString();
  } catch {
    return undefined;
  }
}

/** Largest square crest variant (180x180). */
export const tmCrestUrl = (clubId: string | number) => `${IMG}/wappen/big/${clubId}.png`;

function clubIdFromHref(href: string | undefined): string | undefined {
  return /\/verein\/(\d+)/.exec(href ?? "")?.[1];
}

/** "13/04/2001 (25)" -> "2001-04-13" */
function dmyToIso(s: string | undefined): string | undefined {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s ?? "");
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
}

export function parseTransfermarktPlayerUrl(url: string): { id: string; slug: string; profileUrl: string } {
  const u = new URL(url, BASE);
  const m = /^\/([^/]+)\/[^/]+\/spieler\/(\d+)/.exec(u.pathname);
  if (!m) throw new Error(`Not a transfermarkt player URL: ${url} (expected .../<slug>/profil/spieler/<id>)`);
  return { slug: m[1], id: m[2], profileUrl: `${BASE}/${m[1]}/profil/spieler/${m[2]}` };
}

// ---------- search ----------

export async function searchTransfermarkt(name: string): Promise<SearchResult[]> {
  const url = `${BASE}/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(name)}`;
  const { text } = await fetchText(url);
  const $ = cheerio.load(text);
  const out: SearchResult[] = [];
  const seen = new Set<string>();
  $("table.items > tbody > tr").each((_, el) => {
    const tr = $(el);
    const a = tr.find("td.hauptlink a[href*='/profil/spieler/']").first();
    const href = a.attr("href");
    if (!href || seen.has(href)) return;
    seen.add(href);
    const inner = tr.find("table.inline-table tr");
    const club = clean(inner.eq(1).text()) || tr.find("img.tiny_wappen").attr("alt") || undefined;
    const tds = tr.children("td");
    const photo = tr.find("img.bilderrahmen-fixed").attr("src");
    const ageTxt = clean(tds.eq(3).text());
    out.push({
      source: "transfermarkt",
      name: clean(a.text()),
      club: club && club !== "-" ? club : undefined,
      url: abs(href)!,
      photoUrl: photo && !/default\.jpg/.test(photo) ? photo.replace("/small/", "/big/") : undefined,
      position: clean(tds.eq(1).text()) || undefined,
      age: /^\d+$/.test(ageTxt) ? Number(ageTxt) : undefined,
    });
  });
  return out;
}

// ---------- profile ----------

export async function fetchTransfermarktProfile(url: string): Promise<ExternalProfile & { clubId?: string }> {
  const { id, profileUrl } = parseTransfermarktPlayerUrl(url);
  const { text } = await fetchText(profileUrl);
  const $ = cheerio.load(text);
  if (!$(".data-header").length) throw new Error(`transfermarkt: unexpected page layout for ${profileUrl} (data-header not found)`);

  const info = new Map<string, string>();
  $(".info-table__content--regular").each((_, el) => {
    const label = clean($(el).text()).replace(/:$/, "");
    const value = clean($(el).next().text());
    if (label && !info.has(label)) info.set(label, value);
  });

  const h1 = $("h1.data-header__headline-wrapper, .data-header__headline-wrapper").first();
  const shirt = clean(h1.find(".data-header__shirt-number").text()).replace("#", "");
  const knownAs = clean(h1.clone().find(".data-header__shirt-number").remove().end().text());

  const clubA = $(".data-header__club a").first();
  const clubHref = clubA.attr("href");
  const clubId = clubIdFromHref(clubHref);

  const photo = $(".data-header__profile-image").attr("src");
  const mvEl = $(".data-header__market-value-wrapper").first().clone();
  mvEl.find(".data-header__last-update").remove();
  const mv = clean(mvEl.text());

  const height = /(\d)[,.](\d{2})\s*m/.exec(info.get("Altura") ?? "");
  const pos = info.get("Posição");
  const foot = info.get("Pé");
  const agent = info.get("Agente") ?? info.get("Empresário") ?? info.get("Agente do jogador");
  const clubName = info.get("Clube atual") || clean(clubA.text()) || undefined;

  return {
    source: "transfermarkt",
    url: profileUrl,
    externalId: id,
    clubId,
    fullName: info.get("Nome completo") ?? info.get("Nome no país de origem") ?? knownAs,
    knownAs: knownAs || undefined,
    birthDate: dmyToIso(info.get("Nasc./Idade") ?? info.get("Data de nascimento")),
    nationality: info.get("Nacionalidade"),
    position: pos ? pos.split(" - ").pop() : undefined,
    foot: foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : undefined,
    heightCm: height ? Number(height[1]) * 100 + Number(height[2]) : undefined,
    shirtNumber: shirt || undefined,
    clubName,
    clubUrl: clubHref ? abs(clubHref.replace(/\/saison_id\/\d+.*$/, "")) : undefined,
    clubCrestUrl: clubId ? tmCrestUrl(clubId) : undefined,
    photoUrl: photo && !/default\.jpg/.test(photo) ? photo.replace("/header/", "/big/") : undefined,
    marketValue: mv && /\d/.test(mv) ? mv : undefined,
    contractUntil: dmyToIso(info.get("Contrato até")) ?? info.get("Contrato até"),
    agent: agent && agent !== "-" ? agent : undefined,
  };
}

// ---------- matches (tmapi JSON behind the "leistungsdaten" page) ----------

type TmCardEvent = { minute?: number | null } | null | undefined;
type TmPerformance = {
  gameInformation: {
    gameId: string;
    competitionId: string;
    seasonId: number;
    gameDay: number | null;
    gameState: string;
    isGamePostponed?: boolean;
    date: { dateTimeUTC: string; isTimeDefined?: boolean };
  };
  clubsInformation: {
    club: { venue: "home" | "away"; clubId: string; goalsTotal: number | null; opponentGoalsTotal: number | null };
    opponent: { clubId: string };
  };
  statistics: {
    generalStatistics: { participationState: string; shirtNumber?: number | null };
    goalStatistics: { goalsScoredTotal: number | null; assists: number | null };
    cardStatistics: { yellowCard?: TmCardEvent; yellowRedCard?: TmCardEvent; redCard?: TmCardEvent };
    playingTimeStatistics: {
      playedMinutes?: number | null;
      isStarting?: boolean | null;
      substitutedIn?: TmCardEvent;
      substitutedOut?: TmCardEvent;
    };
  };
};
type TmApi<T> = { success: boolean; message?: string; data: T };
type TmClub = { id: string; name: string; baseDetails?: { shortName?: string }; crestUrl?: string };
type TmCompetition = { id: string; name: string; shortName?: string; baseDetails?: { isTournament?: boolean } };

async function tmEntities<T extends { id: string }>(kind: "clubs" | "competitions", ids: string[]): Promise<Map<string, T>> {
  const out = new Map<string, T>();
  const uniq = [...new Set(ids)].sort();
  for (let i = 0; i < uniq.length; i += 50) {
    const qs = uniq.slice(i, i + 50).map((x) => `ids[]=${encodeURIComponent(x)}`).join("&");
    try {
      const res = await fetchJson<TmApi<T[]>>(`${API}/${kind}?${qs}`);
      for (const e of res.data ?? []) out.set(String(e.id), e);
    } catch (e) {
      console.warn(`[transfermarkt] could not resolve ${kind}: ${(e as Error).message}`);
    }
  }
  return out;
}

const LISBON_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" });
const LISBON_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hour12: false });

function participationOf(state: string): Participation {
  if (state === "played") return "played";
  if (state === "in squad") return "unused_sub";
  return "not_in_squad";
}

export type TmMatchOptions = {
  /** Include games where the player was an unused sub / not in the squad (minutes 0). Default true. */
  includeNotPlayed?: boolean;
};

export async function fetchTransfermarktMatches(url: string, opts: TmMatchOptions = {}): Promise<ExternalMatch[]> {
  const { id } = parseTransfermarktPlayerUrl(url);
  const res = await fetchJson<TmApi<{ performance: TmPerformance[] }>>(`${API}/player/${id}/performance-game`);
  if (!res?.success || !Array.isArray(res.data?.performance)) {
    throw new Error(`transfermarkt: performance API returned no data for player ${id} (${res?.message ?? "unknown error"})`);
  }
  const now = Date.now();
  const all = res.data.performance.filter(
    (p) => !p.gameInformation.isGamePostponed && new Date(p.gameInformation.date.dateTimeUTC).getTime() <= now,
  );
  if (!all.length) return [];
  const season = Math.max(...all.map((p) => p.gameInformation.seasonId));
  let games = all.filter((p) => p.gameInformation.seasonId === season);
  if (opts.includeNotPlayed === false) games = games.filter((p) => p.statistics.generalStatistics.participationState === "played");

  const clubs = await tmEntities<TmClub>(
    "clubs",
    games.flatMap((p) => [p.clubsInformation.club.clubId, p.clubsInformation.opponent.clubId]),
  );
  const comps = await tmEntities<TmCompetition>("competitions", games.map((p) => p.gameInformation.competitionId));
  const clubName = (cid: string) => {
    const c = clubs.get(cid);
    return c ? c.baseDetails?.shortName || c.name : cid;
  };

  return games
    .map((p): ExternalMatch => {
      const g = p.gameInformation;
      const c = p.clubsInformation;
      const s = p.statistics;
      const comp = comps.get(g.competitionId);
      const d = new Date(g.date.dateTimeUTC);
      const gf = c.club.goalsTotal ?? 0;
      const ga = c.club.opponentGoalsTotal ?? 0;
      const participation = participationOf(s.generalStatistics.participationState);
      const played = participation === "played";
      const cards = s.cardStatistics ?? {};
      const hasYellow = !!cards.yellowCard;
      const hasSecondYellow = !!cards.yellowRedCard;
      const hasRed = !!cards.redCard;
      const pt = s.playingTimeStatistics ?? {};
      return {
        source: "transfermarkt",
        externalId: g.gameId,
        date: LISBON_DATE.format(d),
        time: g.date.isTimeDefined === false ? undefined : LISBON_TIME.format(d),
        competition: comp?.name ?? g.competitionId,
        competitionShort: g.competitionId,
        matchday: g.gameDay == null ? "" : comp?.baseDetails?.isTournament ? `R${g.gameDay}` : `J${g.gameDay}`,
        team: clubName(c.club.clubId),
        opponent: clubName(c.opponent.clubId),
        home: c.club.venue === "home",
        goalsFor: gf,
        goalsAgainst: ga,
        result: gf > ga ? "W" : gf < ga ? "L" : "D",
        minutes: played ? pt.playedMinutes ?? 0 : 0,
        goals: played ? s.goalStatistics?.goalsScoredTotal ?? 0 : 0,
        assists: played ? s.goalStatistics?.assists ?? 0 : 0,
        yellow: (hasYellow ? 1 : 0) + (hasSecondYellow && !hasYellow ? 1 : 0),
        red: hasRed || hasSecondYellow ? 1 : 0,
        started: played ? !!pt.isStarting : false,
        participation,
        subbedIn: pt.substitutedIn?.minute ?? undefined,
        subbedOut: pt.substitutedOut?.minute ?? undefined,
        matchUrl: `${BASE}/spielbericht/index/spielbericht/${g.gameId}`,
        opponentCrestUrl: tmCrestUrl(c.opponent.clubId),
        teamCrestUrl: tmCrestUrl(c.club.clubId),
      };
    })
    .sort((a, b) => (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")));
}

// ---------- upcoming (club "spielplan" page) ----------

export async function fetchTransfermarktUpcoming(url: string): Promise<ExternalFixture[]> {
  const profile = await fetchTransfermarktProfile(url);
  if (!profile.clubId) throw new Error(`transfermarkt: player ${profile.url} has no current club`);
  const { text } = await fetchText(`${BASE}/-/spielplan/verein/${profile.clubId}`);
  const $ = cheerio.load(text);
  const today = new Date().toISOString().slice(0, 10);
  const out: ExternalFixture[] = [];
  $(".box").each((_, box) => {
    const headline = clean($(box).find("h2.content-box-headline, .content-box-headline").first().text());
    $(box)
      .find("table tbody tr")
      .each((_, el) => {
        const tds = $(el).children("td");
        if (tds.length < 9) return;
        const date = dmyToIso(clean(tds.eq(1).text()));
        if (!date) return;
        const resultA = tds.last().find("a").first();
        const resultTxt = clean(tds.last().text());
        if (/\d+\s*:\s*\d+/.test(resultTxt) || date < today) return; // already played
        const venue = clean(tds.eq(3).text());
        const oppA = $(el)
          .find("a[href*='/startseite/verein/']")
          .filter((_, a) => clean($(a).text()) !== "")
          .first();
        const oppId = clubIdFromHref(oppA.attr("href"));
        const time = clean(tds.eq(2).text());
        const gameId = resultA.attr("id") ?? /spielbericht\/(\d+)/.exec(resultA.attr("href") ?? "")?.[1] ?? "";
        const md = clean(tds.eq(0).text());
        out.push({
          source: "transfermarkt",
          externalId: gameId,
          date,
          time: /^\d{1,2}:\d{2}$/.test(time) ? time : undefined,
          competition: headline,
          matchday: md ? (/^\d+$/.test(md) ? `J${md}` : md) : undefined,
          team: profile.clubName ?? "",
          opponent: clean(oppA.text()) || oppA.attr("title") || "",
          home: venue === "C",
          matchUrl: abs(resultA.attr("href")),
          opponentCrestUrl: oppId ? tmCrestUrl(oppId) : undefined,
          teamCrestUrl: profile.clubCrestUrl,
        });
      });
  });
  return out.sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
}

/** Official club colours from the club's "dados e factos" page ("Cores do clube"), e.g. ["#12406b", "#ffffff"]. */
export async function fetchTransfermarktClubColors(clubUrl: string): Promise<string[]> {
  const m = clubUrl.match(/^(https?:\/\/[^/]+\/[^/]+)\/[^/]+\/verein\/(\d+)/);
  if (!m) return [];
  const { text } = await fetchText(`${m[1]}/datenfakten/verein/${m[2]}`);
  const i = text.indexOf("Cores do clube");
  if (i < 0) return [];
  return [...text.slice(i, i + 800).matchAll(/background-color:\s*(#[0-9a-f]{3,6})/gi)].map((x) => x[1].toLowerCase());
}
